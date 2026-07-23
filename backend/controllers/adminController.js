const bcrypt=require("bcryptjs");

const db=require("../config/database");

const dbp=db.promise();



// VIEW USERS

exports.users=(req,res)=>{


db.query(

"SELECT id, COALESCE(name, username) AS name, username, email, role, created_at FROM users WHERE role='farmer'",

(err,data)=>{

if(err) return res.status(500).json(err);

res.json(data);

}

);


};




// UPDATE A FARMER'S PROFILE

exports.updateFarmerProfile=(req,res)=>{


const{

name,

email

}=req.body;


if(!name || !email){

return res.status(400).json({

message:"Name and email are required"

});

}


db.query(

"UPDATE users SET name=?, email=? WHERE id=? AND role='farmer'",

[name, email, req.params.id],

(err,result)=>{

if(err) return res.status(500).json(err);

if(result.affectedRows === 0){

return res.status(404).json({

message:"Farmer not found"

});

}

res.json({

message:"Farmer profile updated"

});

}

);


};




// DELETE A FARMER ACCOUNT
//
// Scoped to role='farmer' so this can't be used to delete an admin by ID
// guessing. Farms, soil tests, farm_seasons, and recommendations all
// cascade-delete via their foreign keys (see database/schema.sql), so a
// single DELETE on users cleans up every related record.

exports.deleteFarmer=(req,res)=>{


db.query(

"DELETE FROM users WHERE id=? AND role='farmer'",

[req.params.id],

(err,result)=>{

if(err) return res.status(500).json(err);

if(result.affectedRows === 0){

return res.status(404).json({

message:"Farmer not found"

});

}

res.json({

message:"Farmer account deleted"

});

}

);


};




// VIEW ADMIN ACCOUNTS

exports.getAdmins=(req,res)=>{


db.query(

"SELECT id, COALESCE(name, username) AS name, username, email, created_at FROM users WHERE role='admin' ORDER BY created_at",

(err,data)=>{

if(err) return res.status(500).json(err);

res.json(data);

}

);


};




// CREATE A NEW ADMIN ACCOUNT

exports.createAdmin=async(req,res)=>{


const{

username,

email,

password

}=req.body;


if(!username || !email || !password){

return res.status(400).json({

message:"Username, email, and password are required"

});

}


if(password.length < 8){

return res.status(400).json({

message:"Password must be at least 8 characters"

});

}


try{

const [existing] = await dbp.query(

"SELECT id FROM users WHERE email=? OR username=?",

[email, username]

);

if(existing.length > 0){

return res.status(400).json({

message:"An account with that email or username already exists"

});

}

const hashedPassword = await bcrypt.hash(password, 10);

await dbp.query(

"INSERT INTO users (username, email, password, role) VALUES (?,?,?,'admin')",

[username, email, hashedPassword]

);

res.status(201).json({

message:"Admin account created"

});

}

catch(error){

res.status(500).json(error);

}


};




// GET A FARMER'S FARMS

exports.getFarmerFarms=(req,res)=>{


db.query(

"SELECT * FROM farms WHERE user_id=?",

[req.params.id],

(err,data)=>{

if(err) return res.status(500).json(err);

res.json(data);

}

);


};




// ADD A FARM ON BEHALF OF A FARMER

exports.addFarmerFarm=(req,res)=>{


const{

barangay,

soil_type,

area,

latitude,

longitude

}=req.body;


db.query(

`
INSERT INTO farms
(user_id,barangay,soil_type,area,latitude,longitude)

VALUES(?,?,?,?,?,?)
`,

[

req.params.id,

barangay,

soil_type,

area || null,

latitude || null,

longitude || null

],

(err,result)=>{

if(err) return res.status(500).json(err);

res.status(201).json({

message:"Farm added",

id:result.insertId

});

}

);


};




// UPDATE A FARM (INCLUDING COORDINATES)

exports.updateFarmerFarm=(req,res)=>{


const{

barangay,

soil_type,

area,

latitude,

longitude

}=req.body;


db.query(

`
UPDATE farms
SET barangay=?, soil_type=?, area=?, latitude=?, longitude=?
WHERE id=?
`,

[

barangay,

soil_type,

area || null,

latitude || null,

longitude || null,

req.params.id

],

(err,result)=>{

if(err) return res.status(500).json(err);

if(result.affectedRows === 0){

return res.status(404).json({

message:"Farm not found"

});

}

res.json({

message:"Farm updated"

});

}

);


};




// GET A FARM'S SOIL / WEATHER TEST HISTORY

exports.getFarmSoilTests=(req,res)=>{


db.query(

"SELECT * FROM soil_tests WHERE farm_id=? ORDER BY created_at DESC",

[req.params.id],

(err,data)=>{

if(err) return res.status(500).json(err);

res.json(data);

}

);


};




// INPUT A SOIL / WEATHER TEST ON BEHALF OF A FARMER

exports.addFarmSoilTest=(req,res)=>{


const{

ph,

nitrogen,

phosphorus,

potassium,

rainfall,

pest_level

}=req.body;


db.query(

`
INSERT INTO soil_tests
(farm_id,ph,nitrogen,phosphorus,potassium,rainfall,pest_level)

VALUES(?,?,?,?,?,?,?)
`,

[

req.params.id,

ph || null,

nitrogen || null,

phosphorus || null,

potassium || null,

rainfall || null,

pest_level || null

],

(err,result)=>{

if(err) return res.status(500).json(err);

res.status(201).json({

message:"Soil test recorded",

id:result.insertId

});

}

);


};




// VALIDATE / UPDATE A SOIL TEST ENTRY

exports.updateSoilTest=(req,res)=>{


const{

ph,

nitrogen,

phosphorus,

potassium,

rainfall,

pest_level

}=req.body;


db.query(

`
UPDATE soil_tests
SET ph=?, nitrogen=?, phosphorus=?, potassium=?, rainfall=?, pest_level=?
WHERE id=?
`,

[

ph || null,

nitrogen || null,

phosphorus || null,

potassium || null,

rainfall || null,

pest_level || null,

req.params.id

],

(err,result)=>{

if(err) return res.status(500).json(err);

if(result.affectedRows === 0){

return res.status(404).json({

message:"Soil test not found"

});

}

res.json({

message:"Soil test updated"

});

}

);


};




// ADD RICE VARIETY

exports.addRice=(req,res)=>{


const{

name,

yield_score,

soil_score,

pest_resistance,

climate_score,

market_score

}=req.body;



db.query(

`
INSERT INTO rice_varieties

(name,yield_score,soil_score,pest_resistance,climate_score,market_score)

VALUES(?,?,?,?,?,?)
`,

[
name,
yield_score,
soil_score,
pest_resistance,
climate_score,
market_score
],

()=>{


res.json({

message:"Rice variety added"

});


}

);


};




// UPDATE RICE VARIETY

exports.updateRice=(req,res)=>{


const{

name,

yield_score,

soil_score,

pest_resistance,

climate_score,

market_score

}=req.body;


db.query(

`
UPDATE rice_varieties
SET name=?, yield_score=?, soil_score=?, pest_resistance=?, climate_score=?, market_score=?
WHERE id=?
`,

[

name,

yield_score,

soil_score,

pest_resistance,

climate_score,

market_score,

req.params.id

],

(err,result)=>{

if(err) return res.status(500).json(err);

if(result.affectedRows === 0){

return res.status(404).json({

message:"Rice variety not found"

});

}

res.json({

message:"Rice variety updated"

});

}

);


};




// DELETE RICE


exports.deleteRice=(req,res)=>{


db.query(

"DELETE FROM rice_varieties WHERE id=?",

[
req.params.id
],

(err)=>{

if(err) return res.status(500).json(err);

res.json({

message:"Deleted"

});


}

);


};




// GET RICE VARIETIES

exports.getRiceVarieties=(req,res)=>{


db.query(

"SELECT * FROM rice_varieties ORDER BY name",

(err,data)=>{

if(err) return res.status(500).json(err);

res.json(data);

}

);


};




// GET ELECTRE CONFIG

const DEFAULT_WEIGHTS = {

soil_weight:0.30,
yield_weight:0.25,
pest_weight:0.20,
climate_weight:0.15,
market_weight:0.10

};


exports.getElectreConfig=(req,res)=>{


db.query(

"SELECT * FROM electre_config WHERE id=1",

(err,data)=>{

if(err) return res.status(500).json(err);

res.json(data[0] || DEFAULT_WEIGHTS);

}

);


};




// UPDATE ELECTRE CONFIG

exports.updateElectreConfig=(req,res)=>{


const{

soil_weight,
yield_weight,
pest_weight,
climate_weight,
market_weight

}=req.body;


const weights = [
soil_weight,
yield_weight,
pest_weight,
climate_weight,
market_weight
];


if(weights.some((w)=> typeof w !== "number" || w < 0 || w > 1)){

return res.status(400).json({

message:"Each weight must be a number between 0 and 1"

});

}


const total = weights.reduce((sum,w)=> sum + w, 0);


if(Math.abs(total - 1) > 0.01){

return res.status(400).json({

message:"Weights must add up to 1.0 (currently "+total.toFixed(2)+")"

});

}


db.query(

`
INSERT INTO electre_config
(id,soil_weight,yield_weight,pest_weight,climate_weight,market_weight)

VALUES(1,?,?,?,?,?)

ON DUPLICATE KEY UPDATE
soil_weight=VALUES(soil_weight),
yield_weight=VALUES(yield_weight),
pest_weight=VALUES(pest_weight),
climate_weight=VALUES(climate_weight),
market_weight=VALUES(market_weight)
`,

weights,

(err)=>{

if(err) return res.status(500).json(err);

res.json({

message:"ELECTRE configuration updated"

});

}

);


};




// SYSTEM ANALYTICS

exports.getAnalytics=async(req,res)=>{


try{


const [farmersResult,farmsResult,varietiesResult,recommendationsResult,topVarietiesResult] = await Promise.all([

dbp.query("SELECT COUNT(*) AS count FROM users WHERE role='farmer'"),
dbp.query("SELECT COUNT(*) AS count FROM farms"),
dbp.query("SELECT COUNT(*) AS count FROM rice_varieties"),
dbp.query("SELECT COUNT(*) AS count FROM recommendations"),
dbp.query(

`
SELECT variety_name, COUNT(*) AS count
FROM recommendations
WHERE rank_position=1
GROUP BY variety_name
ORDER BY count DESC
LIMIT 5
`

)

]);


res.json({

totalFarmers:farmersResult[0][0].count,
totalFarms:farmsResult[0][0].count,
totalVarieties:varietiesResult[0][0].count,
totalRecommendations:recommendationsResult[0][0].count,
topVarieties:topVarietiesResult[0]

});


}

catch(error){

res.status(500).json(error);

}


};




// SOIL SUITABILITY BY BARANGAY — grouped bar chart data source.
//
// For every soil test on file, N/P/K are reported as Low/Medium/High per
// the DA Soil Test Kit convention (not a raw ppm figure — see
// farm-data.tsx), so they're mapped to a 0-100 suitability scale
// (Low=33, Medium=66, High=100) and pH is scored against rice's typical
// optimal range (5.5-7.0). Averaging these per barangay gives the grouped
// bars the thesis's dashboard objective calls for.

const BARANGAYS = ["San Teodoro", "Poblacion", "Libertad", "San Marcos"];

const LEVEL_SCORE = { Low:33, Medium:66, High:100 };


function phSuitability(ph){

if(ph === null || ph === undefined) return null;

const value = Number(ph);

if(value >= 5.5 && value <= 7.0) return 100;

const distance = value < 5.5 ? (5.5 - value) : (value - 7.0);

return Math.max(0, Math.round(100 - distance * 40));

}


exports.getSoilSuitabilityByBarangay=async(req,res)=>{


try{

const [rows] = await dbp.query(

`
SELECT f.barangay, st.nitrogen, st.phosphorus, st.potassium, st.ph
FROM soil_tests st
JOIN farms f ON f.id = st.farm_id
WHERE f.barangay IS NOT NULL
`

);

const byBarangay = {};

BARANGAYS.forEach((barangay)=>{

byBarangay[barangay] = { count:0, nitrogen:[], phosphorus:[], potassium:[], ph:[] };

});

rows.forEach((row)=>{

const bucket = byBarangay[row.barangay];

if(!bucket) return;

bucket.count += 1;

if(LEVEL_SCORE[row.nitrogen] !== undefined) bucket.nitrogen.push(LEVEL_SCORE[row.nitrogen]);

if(LEVEL_SCORE[row.phosphorus] !== undefined) bucket.phosphorus.push(LEVEL_SCORE[row.phosphorus]);

if(LEVEL_SCORE[row.potassium] !== undefined) bucket.potassium.push(LEVEL_SCORE[row.potassium]);

const phScore = phSuitability(row.ph);

if(phScore !== null) bucket.ph.push(phScore);

});

const average = (list)=> list.length ? Math.round(list.reduce((sum,v)=>sum+v,0) / list.length) : null;

const result = BARANGAYS.map((barangay)=>{

const bucket = byBarangay[barangay];

return {

barangay,

sampleCount: bucket.count,

nitrogen: average(bucket.nitrogen),

phosphorus: average(bucket.phosphorus),

potassium: average(bucket.potassium),

ph: average(bucket.ph)

};

});

res.json(result);

}

catch(error){

res.status(500).json(error);

}


};




// PREDICTED VS. ACTUAL ACCURACY REPORT
//
// For every season a farmer reported real yield for, this looks up
// whichever variety ELECTRE ranked #1 the last time a recommendation was
// generated for that farm (at or before the season was logged), and
// checks whether that's the variety the farmer actually planted. Variety
// names are compared by their "Rc ###" code so old free-text entries and
// the newer dropdown-sourced ones both match correctly.

function extractVarietyCode(name){

if(!name) return null;

const match = name.match(/Rc\s?\d+[A-Za-z]?/i);

return match ? match[0].replace(/\s+/g,"").toUpperCase() : null;

}


exports.getAccuracyReport=async(req,res)=>{


try{

const [rows] = await dbp.query(

`
SELECT fs.id, fs.farm_id, fs.season, fs.year, fs.seedlings, fs.yield_amount, fs.yield_unit, fs.created_at,
f.barangay,
(
SELECT r.variety_name FROM recommendations r
WHERE r.farm_id = fs.farm_id AND r.rank_position = 1 AND r.created_at <= fs.created_at
ORDER BY r.created_at DESC LIMIT 1
) AS recommended_variety
FROM farm_seasons fs
JOIN farms f ON f.id = fs.farm_id
WHERE fs.yield_amount IS NOT NULL
ORDER BY fs.created_at DESC
`

);

const report = rows.map((row)=>{

const recommendedCode = extractVarietyCode(row.recommended_variety);

const plantedCode = extractVarietyCode(row.seedlings);

const comparable = !!(recommendedCode && plantedCode);

return {

...row,

matched: comparable ? recommendedCode === plantedCode : null

};

});

const comparableRows = report.filter((row)=> row.matched !== null);

const matchedCount = comparableRows.filter((row)=> row.matched).length;

res.json({

totalReported:report.length,

comparable:comparableRows.length,

matched:matchedCount,

matchRate:comparableRows.length ? matchedCount / comparableRows.length : null,

rows:report

});

}

catch(error){

res.status(500).json(error);

}


};




// EXPORT FARMER DATA AS A DOWNLOADABLE CSV SPREADSHEET
//
// One row per farm (farmers with no farm yet still get a row, with blank
// farm/soil columns). Each farm's soil columns show its most recent soil
// test on file, if any.

function csvEscape(value){

if(value === null || value === undefined) return "";

const str = String(value);

if(/[",\n]/.test(str)) return '"' + str.replace(/"/g,'""') + '"';

return str;

}


exports.exportFarmersCsv=async(req,res)=>{


try{

const [rows] = await dbp.query(

`
SELECT
u.id AS farmer_id, COALESCE(u.name,u.username) AS farmer_name, u.username, u.email, u.created_at AS farmer_joined,
f.id AS farm_id, f.barangay, f.soil_type, f.area, f.latitude, f.longitude,
st.created_at AS soil_test_date, st.ph, st.nitrogen, st.phosphorus, st.potassium, st.rainfall, st.pest_level
FROM users u
LEFT JOIN farms f ON f.user_id = u.id
LEFT JOIN soil_tests st ON st.id = (
SELECT id FROM soil_tests WHERE farm_id = f.id ORDER BY created_at DESC LIMIT 1
)
WHERE u.role='farmer'
ORDER BY farmer_name, f.id
`

);

const headers = [

"Farmer ID","Farmer Name","Username","Email","Joined",

"Farm ID","Barangay","Soil Type","Land Size (ha)","Latitude","Longitude",

"Latest Soil Test Date","pH","Nitrogen","Phosphorus","Potassium","Rainfall (mm/yr)","Pest Pressure"

];

const lines = [ headers.map(csvEscape).join(",") ];

rows.forEach((row)=>{

lines.push([

row.farmer_id,

row.farmer_name,

row.username,

row.email,

row.farmer_joined ? new Date(row.farmer_joined).toISOString().slice(0,10) : "",

row.farm_id ?? "",

row.barangay ?? "",

row.soil_type ?? "",

row.area ?? "",

row.latitude ?? "",

row.longitude ?? "",

row.soil_test_date ? new Date(row.soil_test_date).toISOString().slice(0,10) : "",

row.ph ?? "",

row.nitrogen ?? "",

row.phosphorus ?? "",

row.potassium ?? "",

row.rainfall ?? "",

row.pest_level ?? ""

].map(csvEscape).join(","));

});

const csv = lines.join("\r\n");

res.setHeader("Content-Type","text/csv; charset=utf-8");

res.setHeader("Content-Disposition",`attachment; filename="ricedss-farmers-${new Date().toISOString().slice(0,10)}.csv"`);

res.send(csv);

}

catch(error){

res.status(500).json(error);

}


};