const express=require("express");
const bodyparser=require("body-parser");
const cors=require("cors");

const app=express();
app.use(bodyparser.json());
app.use(cors());

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.set('views', __dirname + '/views');

app.use("/api",require("./routes"));

app.get("/",(req,res)=>{
    res.render("index.html");
});

var port=process.env.PORT || 5001;
app.listen(port);
console.log(`Server started on port: ${port}`);
console.log(`Please navigate to http://localhost:${port}/`);