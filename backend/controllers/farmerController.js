const db=require("../config/database");



// GET PROFILE

exports.profile=(req,res)=>{


db.query(

"SELECT id, name, username, email, role, created_at FROM users WHERE id=?",

[req.user.id],

(err,data)=>{

if(err) return res.status(500).json(err);

res.json(data[0]);

}

);


};




// UPDATE PROFILE

exports.updateProfile=(req,res)=>{


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

"UPDATE users SET name=?, email=? WHERE id=?",

[name, email, req.user.id],

(err)=>{

if(err) return res.status(500).json(err);

res.json({

message:"Profile updated"

});

}

);


};




// ADD FARM

exports.addFarm=(req,res)=>{


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
req.user.id,
barangay,
soil_type,
area,
latitude,
longitude
],

(err)=>{


res.json({

message:"Farm added"

});


}


);



};




// GET FARMS

exports.getFarms=(req,res)=>{


db.query(

"SELECT * FROM farms WHERE user_id=?",

[req.user.id],

(err,data)=>{


res.json(data);


});


};




// UPDATE FARM

exports.updateFarm=(req,res)=>{


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
WHERE id=? AND user_id=?
`,

[
barangay,
soil_type,
area,
latitude,
longitude,
req.params.id,
req.user.id
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




// ADD SEASON RECORD

exports.addSeason=(req,res)=>{


const{

farm_id,

season,

year,

seedlings,

fertilizers,

pest_control,

yield_amount,

yield_unit

}=req.body;


if(!farm_id || !season || !year){

return res.status(400).json({

message:"farm_id, season, and year are required"

});

}


db.query(

`
INSERT INTO farm_seasons
(farm_id,season,year,seedlings,fertilizers,pest_control,yield_amount,yield_unit)

VALUES(?,?,?,?,?,?,?,?)
`,

[
farm_id,
season,
year,
seedlings || null,
fertilizers || null,
pest_control || null,
yield_amount || null,
yield_unit || null
],

(err,result)=>{

if(err) return res.status(500).json(err);

res.json({

message:"Season record saved",

id:result.insertId

});

}

);


};




// GET SEASON RECORDS

exports.getSeasons=(req,res)=>{


db.query(

`
SELECT fs.* FROM farm_seasons fs
INNER JOIN farms f ON f.id = fs.farm_id
WHERE f.user_id=?
ORDER BY fs.year DESC, fs.created_at DESC
`,

[req.user.id],

(err,data)=>{

if(err) return res.status(500).json(err);

res.json(data);

}

);


};




// GET RICE VARIETY NAMES (for farm data entry dropdowns)

exports.getVarietyNames=(req,res)=>{


db.query(

"SELECT id, name FROM rice_varieties ORDER BY name",

(err,data)=>{

if(err) return res.status(500).json(err);

res.json(data);

}

);


};




// GET RECOMMENDATION HISTORY

exports.getRecommendations=(req,res)=>{


db.query(

"SELECT * FROM recommendations WHERE user_id=? ORDER BY created_at DESC",

[req.user.id],

(err,data)=>{


res.json(data);


}

);


};




// ADD SOIL TEST

exports.addSoil=(req,res)=>{


const{

farm_id,

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
farm_id,
ph,
nitrogen,
phosphorus,
potassium,
rainfall,
pest_level
],

()=>{


res.json({

message:"Soil data saved"

});


}

);


};