const router=require("express").Router();


const auth=require("../middleware/auth");
const adminAuth=require("../middleware/adminAuth");


const controller=
require("../controllers/adminController");

const electreController=
require("../controllers/electreController");



router.get(
"/users",
auth,
adminAuth,
controller.users
);



router.put(
"/users/:id",
auth,
adminAuth,
controller.updateFarmerProfile
);



router.delete(
"/users/:id",
auth,
adminAuth,
controller.deleteFarmer
);



router.get(
"/accounts",
auth,
adminAuth,
controller.getAdmins
);



router.post(
"/accounts",
auth,
adminAuth,
controller.createAdmin
);



router.get(
"/users/:id/farms",
auth,
adminAuth,
controller.getFarmerFarms
);



router.post(
"/users/:id/farms",
auth,
adminAuth,
controller.addFarmerFarm
);



router.put(
"/farms/:id",
auth,
adminAuth,
controller.updateFarmerFarm
);



router.get(
"/farms/:id/soil",
auth,
adminAuth,
controller.getFarmSoilTests
);



router.post(
"/farms/:id/soil",
auth,
adminAuth,
controller.addFarmSoilTest
);



router.put(
"/soil/:id",
auth,
adminAuth,
controller.updateSoilTest
);



router.get(
"/rice",
auth,
adminAuth,
controller.getRiceVarieties
);



router.post(
"/rice",
auth,
adminAuth,
controller.addRice
);



router.put(
"/rice/:id",
auth,
adminAuth,
controller.updateRice
);



router.delete(
"/rice/:id",
auth,
adminAuth,
controller.deleteRice
);



router.post(
"/electre-preview",
auth,
adminAuth,
electreController.preview
);



router.post(
"/mcdm-compare",
auth,
adminAuth,
electreController.compareMethods
);



router.get(
"/soil-suitability",
auth,
adminAuth,
controller.getSoilSuitabilityByBarangay
);



router.get(
"/export/farmers.csv",
auth,
adminAuth,
controller.exportFarmersCsv
);



router.get(
"/accuracy",
auth,
adminAuth,
controller.getAccuracyReport
);



router.get(
"/electre-config",
auth,
adminAuth,
controller.getElectreConfig
);



router.put(
"/electre-config",
auth,
adminAuth,
controller.updateElectreConfig
);



router.get(
"/analytics",
auth,
adminAuth,
controller.getAnalytics
);



module.exports=router;
