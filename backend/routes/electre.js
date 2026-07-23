const express=require("express");

const router=express.Router();

const auth=require("../middleware/auth");

const controller=
require("../controllers/electreController");


router.post(
"/recommend",
auth,
controller.recommend
);


module.exports=router;