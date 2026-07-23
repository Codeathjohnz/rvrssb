const router=require("express").Router();

const auth=require("../middleware/auth");

const controller=
require("../controllers/farmerController");



router.get(
"/profile",
auth,
controller.profile
);



router.put(
"/profile",
auth,
controller.updateProfile
);



router.post(
"/farm",
auth,
controller.addFarm
);



router.put(
"/farm/:id",
auth,
controller.updateFarm
);



router.get(
"/farms",
auth,
controller.getFarms
);



router.get(
"/varieties",
auth,
controller.getVarietyNames
);



router.get(
"/recommendations",
auth,
controller.getRecommendations
);



router.post(
"/soil",
auth,
controller.addSoil
);



router.post(
"/season",
auth,
controller.addSeason
);



router.get(
"/seasons",
auth,
controller.getSeasons
);



module.exports=router;
