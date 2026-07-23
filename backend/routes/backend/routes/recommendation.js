const express = require("express");

const router = express.Router();


// Rice variety database
const riceVarieties = [

    {
        name:"NSIC Rc 402",
        yield:0.90,
        soil:0.85,
        climate:0.88,
        pestResistance:0.82
    },

    {
        name:"NSIC Rc 436",
        yield:0.87,
        soil:0.90,
        climate:0.85,
        pestResistance:0.90
    },

    {
        name:"NSIC Rc 222",
        yield:0.82,
        soil:0.80,
        climate:0.90,
        pestResistance:0.85
    },

    {
        name:"NSIC Rc 216",
        yield:0.85,
        soil:0.88,
        climate:0.82,
        pestResistance:0.80
    }

];




// ELECTRE Recommendation Route

router.post("/",(req,res)=>{


    try{


        console.log(
            "RECOMMENDATION DATA:",
            req.body
        );



        const {

            soilType,

            ph,

            nitrogen,

            phosphorus,

            potassium,

            rainfall


        } = req.body;



        if(
            !soilType ||
            !ph ||
            !nitrogen ||
            !phosphorus ||
            !potassium ||
            !rainfall
        ){


            return res.status(400).json({

                success:false,

                message:"Incomplete farm data"

            });


        }



        /*
            Simple ELECTRE-inspired scoring

            Criteria:
            - Yield
            - Soil suitability
            - Climate adaptability
            - Pest resistance

        */



        let ranking = riceVarieties.map((rice)=>{


            let score = 

            (
                rice.yield * 0.35 +

                rice.soil * 0.25 +

                rice.climate * 0.25 +

                rice.pestResistance * 0.15

            );



            return {

                variety:rice.name,

                score:Number(score.toFixed(2)),


                description:

                `Suitable for ${soilType} soil with rainfall ${rainfall}mm`

            };


        });



        // Highest score first

        ranking.sort(
            (a,b)=>b.score-a.score
        );




        res.json({

            success:true,

            message:"ELECTRE recommendation generated",


            farmData:{

                soilType,

                ph,

                nitrogen,

                phosphorus,

                potassium,

                rainfall

            },


            ranking


        });



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