const db = require("../config/database");

const bcrypt = require("bcrypt");

const jwt = require("jsonwebtoken");


// ======================
// REGISTER
// ======================

exports.register = (req,res)=>{


const {
    name,
    email,
    password,
    role
}=req.body || {};



if(!name || !email || !password){

return res.status(400).json({

message:"Missing required fields"

});

}



bcrypt.hash(password,10,(err,hash)=>{


if(err)
return res.json(err);



db.query(

"INSERT INTO users(name,email,password,role) VALUES(?,?,?,?)",

[
    name,
    email,
    hash,
    role || "farmer"
],


(error,result)=>{


if(error){

return res.status(500).json(error);

}



res.json({

message:"Account created"

});


}

);



});


};




// ======================
// LOGIN
// ======================

exports.login = (req,res)=>{


const {
    email,
    password
}=req.body || {};



if(!email || !password){

return res.status(400).json({

message:"Email and password required"

});

}



db.query(

"SELECT * FROM users WHERE email=?",

[email],


async(err,data)=>{


if(err){

return res.status(500).json(err);

}



if(data.length===0){

return res.status(404).json({

message:"User not found"

});

}



const user=data[0];



const match = await bcrypt.compare(

password,

user.password

);



if(!match){

return res.status(401).json({

message:"Wrong password"

});

}




const token = jwt.sign(

{
    id:user.id,
    role:user.role
},

process.env.JWT_SECRET,

{
    expiresIn:"7d"
}


);



res.json({

token,

user:{

id:user.id,

name:user.name,

role:user.role

}

});


});


};