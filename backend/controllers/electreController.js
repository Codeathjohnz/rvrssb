const db=require("../config/database");

const electre=require("../algorithm/electre");
const saw=require("../algorithm/saw");


const DEFAULT_WEIGHTS=[

0.30,
0.25,
0.20,
0.15,
0.10

];


// How well a variety's known preferred soil types match the farmer's
// reported soil type. 1.0 = listed as preferred, 0.55 = not listed
// (still possible, just not ideal) — never zeroed out entirely.
function soilFit(preferredSoilTypes,farmerSoilType){


if(!preferredSoilTypes || !farmerSoilType) return 0.75;


const list = preferredSoilTypes

.split(",")

.map((s)=>s.trim().toLowerCase());


return list.includes(farmerSoilType.trim().toLowerCase()) ? 1.0 : 0.55;


}


// How well a numeric value (pH, rainfall) sits within a variety's known
// suitable range. 1.0 = inside range, tapering down (floor 0.3) the
// further outside the range the value falls.
function rangeFit(value,min,max){


if(value === null || value === undefined || min === null || max === null) return 0.75;


if(value >= min && value <= max) return 1.0;


const distance = value < min ? (min - value) : (value - max);

const span = Math.max(max - min, 0.1);

const penalty = Math.min(1, distance / span);


return Math.max(0.3, 1 - penalty * 0.7);


}


function buildExplanation(variety,soilMatch,phMatch,rainfallMatch){


const goodSoil = soilMatch >= 1.0;

const goodClimate = (phMatch + rainfallMatch) / 2 >= 0.85;


if(goodSoil && goodClimate){

return "Strong match for your reported soil type, pH, and rainfall.";

}


if(goodSoil && !goodClimate){

return "Grows well in your soil type, but your pH or rainfall is outside its typical range — yield may be reduced.";

}


if(!goodSoil && goodClimate){

return "Your climate conditions suit this variety, though it isn't typically grown in your soil type.";

}


return "Not closely matched to your reported soil or climate — ranked mainly on its own yield, pest resistance, and market strength.";


}


// ADMIN-ONLY PREVIEW: runs the exact same ranking logic as recommend()
// against hypothetical farm inputs and/or hypothetical weights, but never
// writes to the recommendations table. Lets an admin see how a weight
// change would reorder results before saving it as the live configuration.
exports.preview=(req,res)=>{


const{

weights:overrideWeights,

soilType,

ph,

rainfall,

pest_level

}=req.body || {};


const numericPh = ph !== undefined && ph !== null && ph !== "" ? Number(ph) : null;

const numericRainfall = rainfall !== undefined && rainfall !== null && rainfall !== "" ? Number(rainfall) : null;


const loadWeights = (callback)=>{

if(Array.isArray(overrideWeights) && overrideWeights.length === 5){

callback([...overrideWeights].map(Number));

return;

}

db.query(

"SELECT * FROM electre_config WHERE id=1",

(configErr,configRows)=>{

const config = configRows?.[0];

callback(config ? [

Number(config.soil_weight),

Number(config.yield_weight),

Number(config.pest_weight),

Number(config.climate_weight),

Number(config.market_weight)

] : [...DEFAULT_WEIGHTS]);

}

);

};


loadWeights((baseWeights)=>{


const weights = [...baseWeights];


if(pest_level === "High"){

weights[2] = Math.min(1, weights[2] + 0.10);

weights[4] = Math.max(0, weights[4] - 0.10);

}else if(pest_level === "Low"){

weights[2] = Math.max(0, weights[2] - 0.05);

weights[1] = Math.min(1, weights[1] + 0.05);

}


db.query(

"SELECT * FROM rice_varieties",

(err,data)=>{


if(err)

return res.status(500).json(err);


const fitByVarietyId = {};


const conditioned = data.map((variety)=>{

const soilMatch = soilFit(variety.preferred_soil_types,soilType);

const phMatch = rangeFit(numericPh,variety.min_ph !== null ? Number(variety.min_ph) : null,variety.max_ph !== null ? Number(variety.max_ph) : null);

const rainfallMatch = rangeFit(numericRainfall,variety.min_rainfall,variety.max_rainfall);

fitByVarietyId[variety.id] = { soilMatch, phMatch, rainfallMatch };

return {

...variety,

soil_score: Number(variety.soil_score) * (0.4 + 0.6 * soilMatch),

climate_score: Number(variety.climate_score) * (0.4 + 0.6 * ((phMatch + rainfallMatch) / 2))

};

});


let result = electre(conditioned, weights);


result = result.map((item)=>{

const fit = fitByVarietyId[item.id] || { soilMatch:0.75, phMatch:0.75, rainfallMatch:0.75 };

return {

...item,

explanation: buildExplanation(item,fit.soilMatch,fit.phMatch,fit.rainfallMatch)

};

});


res.json({

method:"ELECTRE I (preview — not saved)",

ranking:result,

weightsUsed:weights,

conditionedOn:{

soilType:soilType || null,

ph:numericPh,

rainfall:numericRainfall,

pest_level:pest_level || null

}

});


}

);


});


};




// Spearman rank correlation between two rankings of the same item set.
// +1.0 = identical order, 0 = no relationship, -1.0 = fully reversed.
function spearmanRho(rankingA,rankingB){


const rankOf = {};

rankingB.forEach((item,index)=>{ rankOf[item.id] = index; });


const n = rankingA.length;

let sumSquaredDiff = 0;


rankingA.forEach((item,indexA)=>{

const indexB = rankOf[item.id] ?? indexA;

sumSquaredDiff += Math.pow(indexA - indexB, 2);

});


if(n < 2) return 1;


return Number((1 - (6 * sumSquaredDiff) / (n * (n * n - 1))).toFixed(4));


}


// ADMIN-ONLY: runs ELECTRE and SAW (Simple Additive Weighting) against the
// exact same conditioned decision matrix and weights, timing each run and
// measuring how much their rankings agree. Answers the thesis requirement
// to validate ELECTRE's effectiveness against a second MCDM method for
// accuracy (rank agreement) and efficiency (execution time). Never saves
// to the recommendations table.
exports.compareMethods=(req,res)=>{


const{

weights:overrideWeights,

soilType,

ph,

rainfall,

pest_level

}=req.body || {};


const numericPh = ph !== undefined && ph !== null && ph !== "" ? Number(ph) : null;

const numericRainfall = rainfall !== undefined && rainfall !== null && rainfall !== "" ? Number(rainfall) : null;


const loadWeights = (callback)=>{

if(Array.isArray(overrideWeights) && overrideWeights.length === 5){

callback([...overrideWeights].map(Number));

return;

}

db.query(

"SELECT * FROM electre_config WHERE id=1",

(configErr,configRows)=>{

const config = configRows?.[0];

callback(config ? [

Number(config.soil_weight),

Number(config.yield_weight),

Number(config.pest_weight),

Number(config.climate_weight),

Number(config.market_weight)

] : [...DEFAULT_WEIGHTS]);

}

);

};


loadWeights((baseWeights)=>{


const weights = [...baseWeights];


if(pest_level === "High"){

weights[2] = Math.min(1, weights[2] + 0.10);

weights[4] = Math.max(0, weights[4] - 0.10);

}else if(pest_level === "Low"){

weights[2] = Math.max(0, weights[2] - 0.05);

weights[1] = Math.min(1, weights[1] + 0.05);

}


db.query(

"SELECT * FROM rice_varieties",

(err,data)=>{


if(err)

return res.status(500).json(err);


const conditioned = data.map((variety)=>{

const soilMatch = soilFit(variety.preferred_soil_types,soilType);

const phMatch = rangeFit(numericPh,variety.min_ph !== null ? Number(variety.min_ph) : null,variety.max_ph !== null ? Number(variety.max_ph) : null);

const rainfallMatch = rangeFit(numericRainfall,variety.min_rainfall,variety.max_rainfall);

return {

...variety,

soil_score: Number(variety.soil_score) * (0.4 + 0.6 * soilMatch),

climate_score: Number(variety.climate_score) * (0.4 + 0.6 * ((phMatch + rainfallMatch) / 2))

};

});


const electreStart = process.hrtime.bigint();

const electreRanking = electre(conditioned, weights);

const electreTimeMs = Number(process.hrtime.bigint() - electreStart) / 1e6;


const sawStart = process.hrtime.bigint();

const sawRanking = saw(conditioned, weights);

const sawTimeMs = Number(process.hrtime.bigint() - sawStart) / 1e6;


const top3Electre = electreRanking.slice(0,3).map((item)=>item.id);

const top3Saw = sawRanking.slice(0,3).map((item)=>item.id);

const top3Overlap = top3Electre.filter((id)=> top3Saw.includes(id)).length;


res.json({

electre:{ ranking:electreRanking, timeMs:Number(electreTimeMs.toFixed(3)) },

saw:{ ranking:sawRanking, timeMs:Number(sawTimeMs.toFixed(3)) },

agreement:{

top1Match: electreRanking[0]?.id === sawRanking[0]?.id,

top3Overlap,

spearmanRho: spearmanRho(electreRanking,sawRanking)

},

weightsUsed:weights,

conditionedOn:{

soilType:soilType || null,

ph:numericPh,

rainfall:numericRainfall,

pest_level:pest_level || null

}

});


}

);


});


};




exports.recommend=(req,res)=>{


const{

farm_id,

soilType,

ph,

rainfall,

pest_level

}=req.body || {};


const numericPh = ph !== undefined && ph !== null && ph !== "" ? Number(ph) : null;

const numericRainfall = rainfall !== undefined && rainfall !== null && rainfall !== "" ? Number(rainfall) : null;


db.query(

"SELECT * FROM electre_config WHERE id=1",

(configErr,configRows)=>{


const config = configRows?.[0];


const weights = config ? [

Number(config.soil_weight),
Number(config.yield_weight),
Number(config.pest_weight),
Number(config.climate_weight),
Number(config.market_weight)

] : [...DEFAULT_WEIGHTS];


// Farmer-reported pest pressure shifts how much the pest-resistance
// criterion matters for this specific recommendation, borrowing from
// market weight so the five weights still sum to 1.0.
if(pest_level === "High"){

weights[2] = Math.min(1, weights[2] + 0.10);
weights[4] = Math.max(0, weights[4] - 0.10);

}else if(pest_level === "Low"){

weights[2] = Math.max(0, weights[2] - 0.05);
weights[1] = Math.min(1, weights[1] + 0.05);

}


db.query(

"SELECT * FROM rice_varieties",

(err,data)=>{


if(err)
return res.json(err);


const fitByVarietyId = {};


const conditioned = data.map((variety)=>{


const soilMatch = soilFit(variety.preferred_soil_types,soilType);

const phMatch = rangeFit(numericPh,variety.min_ph !== null ? Number(variety.min_ph) : null,variety.max_ph !== null ? Number(variety.max_ph) : null);

const rainfallMatch = rangeFit(numericRainfall,variety.min_rainfall,variety.max_rainfall);


fitByVarietyId[variety.id] = { soilMatch, phMatch, rainfallMatch };


return {

...variety,

soil_score: Number(variety.soil_score) * (0.4 + 0.6 * soilMatch),

climate_score: Number(variety.climate_score) * (0.4 + 0.6 * ((phMatch + rainfallMatch) / 2))

};


});


let result =
electre(
conditioned,
weights
);


result = result.map((item)=>{

const fit = fitByVarietyId[item.id] || { soilMatch:0.75, phMatch:0.75, rainfallMatch:0.75 };

return {

...item,

explanation: buildExplanation(item,fit.soilMatch,fit.phMatch,fit.rainfallMatch)

};

});


const values = result.map((item,index)=>[

req.user.id,
farm_id || null,
item.id,
item.variety,
item.score,
index+1

]);


db.query(

`
INSERT INTO recommendations
(user_id,farm_id,rice_variety_id,variety_name,score,rank_position)

VALUES ?
`,

[values],

(saveErr)=>{


if(saveErr)
return res.json(saveErr);


res.json({

method:"ELECTRE I",

ranking:result,

conditionedOn:{

soilType:soilType || null,

ph:numericPh,

rainfall:numericRainfall,

pest_level:pest_level || null

}

});


}

);


}

);


}

);


}
