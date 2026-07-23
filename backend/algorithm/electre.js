// ELECTRE I — genuine outranking implementation.
//
// Reference: Siregar, V.M.M., Sihombing, V., Siahaan, N., Kumalasari M, I.,
// Siregar, M.Y., Sagala, E., & Toni (2021). "Implementation of ELECTRE
// Method for Decision Support System." IOP Conference Series: Materials
// Science and Engineering, 1088, 012027.
// https://doi.org/10.1088/1757-899X/1088/1/012027 (open access, CC BY 3.0).
// That paper's worked numeric example was used to verify this code's
// concordance/discordance/threshold/dominance steps against real numbers.
// The underlying method traces back to B. Roy's original ELECTRE (1968).
//
// Procedure: (1) vector-normalize the decision matrix; (2) for every
// ordered pair of alternatives, build a concordance set (criteria where
// the first is at least as good as the second) and a discordance set (the
// rest); (3) the concordance index is the sum of the weights of the
// concordance set, the discordance index is the worst normalized
// shortfall in the discordance set scaled by the largest shortfall across
// all criteria for that pair; (4) each index is thresholded against its
// own average across all pairs; (5) alternative k outranks l only when it
// clears the concordance threshold AND stays at/under the discordance
// threshold; (6) alternatives are ranked by how many others they
// outrank — the actual ELECTRE I decision criterion, not a weighted sum.


function normalize(matrix){

let result=[];


for(let i=0;i<matrix.length;i++){

let row=[];


for(let j=0;j<matrix[i].length;j++){

let sum=0;


for(let k=0;k<matrix.length;k++){

sum += Math.pow(matrix[k][j],2);

}


row.push(
matrix[i][j]/Math.sqrt(sum)
);


}


result.push(row);

}


return result;

}



function buildConcordanceAndDiscordance(normalized,weights){


const n = normalized.length;

const concordance = Array.from({length:n},()=>new Array(n).fill(0));
const discordance = Array.from({length:n},()=>new Array(n).fill(0));


for(let k=0;k<n;k++){

for(let l=0;l<n;l++){

if(k===l) continue;


let concordantWeight = 0;
let worstShortfall = 0;
let maxDiff = 0;


for(let j=0;j<normalized[k].length;j++){

const diff = normalized[k][j] - normalized[l][j];

maxDiff = Math.max(maxDiff, Math.abs(diff));


if(diff >= 0){

concordantWeight += weights[j];

}else{

worstShortfall = Math.max(worstShortfall, -diff);

}

}


concordance[k][l] = concordantWeight;

discordance[k][l] = maxDiff > 0 ? worstShortfall / maxDiff : 0;

}

}


return { concordance, discordance };

}



// Average of every off-diagonal entry — used as the concordance and
// discordance thresholds, exactly as in the cited worked example.
function average(matrix){


const n = matrix.length;

let sum = 0;
let count = 0;


for(let k=0;k<n;k++){

for(let l=0;l<n;l++){

if(k===l) continue;

sum += matrix[k][l];
count += 1;

}

}


return count > 0 ? sum / count : 0;

}



function electre(alternatives,weights){


const n = alternatives.length;


let matrix =
alternatives.map(x=>[

x.soil_score,

x.yield_score,

x.pest_resistance,

x.climate_score,

x.market_score

]);


// NORMALIZATION

let normalized =
normalize(matrix);


// CONCORDANCE / DISCORDANCE MATRICES

const { concordance, discordance } = buildConcordanceAndDiscordance(normalized,weights);


// THRESHOLDS

const concordanceThreshold = average(concordance);
const discordanceThreshold = average(discordance);


// AGGREGATE OUTRANKING — k outranks l only if it clears both thresholds.
// The count of alternatives each one outranks is ELECTRE I's actual
// ranking criterion (see Table 7 / "Total Point" in the cited paper).

const outrankingCount = new Array(n).fill(0);


for(let k=0;k<n;k++){

for(let l=0;l<n;l++){

if(k===l) continue;

const kOutranksL =
concordance[k][l] >= concordanceThreshold &&
discordance[k][l] <= discordanceThreshold;

if(kOutranksL) outrankingCount[k] += 1;

}

}


// Net concordance advantage (how much more this alternative tends to
// dominate others than be dominated, in concordance terms). ELECTRE I's
// outranking-count alone frequently ties several alternatives — this is
// NOT part of the cited method, it's our own addition used only to (a)
// break those ties consistently and (b) give the UI a smooth, comparable
// "score" alongside the rank instead of just a small integer.

const netConcordance = concordance.map((row,k)=>{

const outgoing = row.reduce((sum,value)=>sum+value,0);

const incoming = concordance.reduce((sum,other)=>sum+other[k],0);

return outgoing - incoming;

});


const minNet = Math.min(...netConcordance);
const maxNet = Math.max(...netConcordance);
const netRange = maxNet - minNet;

// Fold the tie-break into the fractional part of a score sized so it can
// never outweigh a whole outrankingCount point — this keeps the
// displayed "score" strictly consistent with the actual sort order
// (outrankingCount first, netConcordance only to break ties) instead of
// showing a lower-ranked item with a numerically higher score.
const tieBreakFraction = netConcordance.map((value)=>

netRange > 0 ? ((value-minNet)/netRange) * 0.999 : 0.5

);


// score already encodes outrankingCount as its integer part and the
// tie-break as a strictly smaller fractional part, so sorting by score
// alone reproduces the same order as sorting by outrankingCount first.
return alternatives.map((item,index)=>({

id:item.id,

variety:item.name,

outrankingCount:outrankingCount[index],

score:Number(((outrankingCount[index] + tieBreakFraction[index]) / n).toFixed(4))

}))

.sort((a,b)=> b.score - a.score);


}



module.exports=electre;
