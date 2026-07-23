const express = require("express");
const router = express.Router();

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/database");



// ==========================
// REGISTER ACCOUNT
// ==========================

router.post("/register", async(req,res)=>{


try{


console.log("REGISTER DATA:",req.body);



const {
username,
email,
password
}=req.body;



if(!username || !email || !password){

return res.status(400).json({

message:"Missing required fields"

});

}


// Role is never taken from the client — public registration always
// creates a farmer account. Admin accounts are provisioned separately
// (see backend/seed.js) so this endpoint can't be used to self-escalate.
const role = "farmer";



// check existing user

const checkUser = `

SELECT *

FROM users

WHERE email = ? OR username = ?

`;



db.query(

checkUser,

[email,username],

async(err,result)=>{


if(err){

console.log(err);

return res.status(500).json({

message:"Database error"

});

}



if(result.length > 0){

return res.status(400).json({

message:"User already exists"

});

}



// encrypt password

const hashedPassword =
await bcrypt.hash(password,10);




// insert

const sql = `

INSERT INTO users

(username,email,password,role)

VALUES(?,?,?,?)

`;



db.query(

sql,

[
username,
email,
hashedPassword,
role
],

(err,result)=>{


if(err){

console.log(err);

return res.status(500).json({

message:"Registration failed"

});

}



res.status(201).json({

success:true,

message:"Account created successfully"

});


}

);



}

);



}

catch(error){

console.log(error);


res.status(500).json({

message:"Server error"

});


}


});







// ==========================
// LOGIN ACCOUNT
// ==========================


router.post("/login",async(req,res)=>{


try{


console.log(
"LOGIN DATA:",
req.body
);



const {

email,

password

}=req.body;



if(!email || !password){


return res.status(400).json({

success:false,

message:"Email and password required"

});


}



// search email OR username

const sql = `

SELECT *

FROM users

WHERE email = ? OR username = ?

`;



db.query(

sql,

[
email,
email
],

async(err,result)=>{


if(err){

console.log(err);


return res.status(500).json({

success:false,

message:"Database error"

});


}



if(result.length===0){


return res.status(401).json({

success:false,

message:"Account not found"

});


}



const user=result[0];



console.log(
"FOUND USER:",
user.username,
user.role
);




// check password

const passwordMatch =
await bcrypt.compare(

password,

user.password

);



if(!passwordMatch){


return res.status(401).json({

success:false,

message:"Incorrect password"

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

success:true,

message:"Login successful",

token,

role:user.role.toLowerCase(),

username:user.username

});



}


);



}

catch(error){


console.log(error);


res.status(500).json({

success:false,

message:"Server error"

});


}


});




module.exports = router;