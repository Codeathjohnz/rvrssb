// SIMPLE ADDITIVE WEIGHTING (SAW) — also known as the Weighted Sum Model.
// Implemented as a second, independent MCDM method so ELECTRE's ranking can
// be validated against a different technique (thesis objective: compare
// ELECTRE against at least one other MCDM method for accuracy/efficiency).
//
// Unlike ELECTRE (which builds concordance/discordance outranking relations),
// SAW normalizes each benefit criterion against the best value in the set,
// multiplies by the criterion weight, and sums directly — a much simpler,
// faster technique with no outranking step.

function normalizeBenefit(matrix){

let result=[];


for(let j=0;j<matrix[0].length;j++){

let max=0;


for(let i=0;i<matrix.length;i++){

if(matrix[i][j] > max) max = matrix[i][j];

}


for(let i=0;i<matrix.length;i++){

if(!result[i]) result[i]=[];

result[i][j] = max > 0 ? matrix[i][j]/max : 0;

}

}


return result;

}



function saw(alternatives,weights){


let matrix =
alternatives.map(x=>[

x.soil_score,

x.yield_score,

x.pest_resistance,

x.climate_score,

x.market_score

]);



// NORMALIZATION (benefit criteria: value / best value in the set)

let normalized =
normalizeBenefit(matrix);


// WEIGHTED SUM

let scores=[];


for(let i=0;i<normalized.length;i++){

let total=0;


for(let j=0;j<normalized[i].length;j++){

total += normalized[i][j] * weights[j];

}


scores.push(total);

}



return alternatives.map((item,index)=>({

id:item.id,

variety:item.name,

score:Number(scores[index].toFixed(4))

}))

.sort((a,b)=>b.score-a.score);


}



module.exports=saw;
