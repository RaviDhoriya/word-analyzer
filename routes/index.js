const router = require("express").Router();
const WordAnalyzer=require("../controllers/WordAnalyzer");

router.post("/checkURL",WordAnalyzer.startAnalyzing);

module.exports=router;