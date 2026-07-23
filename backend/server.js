const express = require("express");
const cors = require("cors");

require("dotenv").config();


const app = express();



app.use(cors({
    origin:"*"
}));


app.use(express.json());



// AUTH ROUTE
app.use(
"/api/auth",
require("./routes/auth")
);


// ELECTRE ROUTE
app.use(
"/api/electre",
require("./routes/electre")
);


// FARMER ROUTE
app.use(
"/api/farmer",
require("./routes/farmer")
);


// ADMIN ROUTE
app.use(
"/api/admin",
require("./routes/admin")
);



const PORT = process.env.PORT || 5001;

app.listen(PORT,()=>{

console.log(
"RiceDSS Server Running PORT "+PORT
);

});