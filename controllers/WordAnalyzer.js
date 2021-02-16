require("dotenv").config();
const axios=require("axios").default;

const WordAnalyzer={};
WordAnalyzer.startAnalyzing=(req,res)=>{
    //var url="https://pastebin.com/raw/pWjbMgP9";
    var url=req.body.url || ""; //"http://norvig.com/big.txt";
    if(url.trim().length===0){
        res.send({error:"Please enter URL"});
        return;
    }
    var wmap=new Map();
    console.log(new Date()+" Fetching Big Data")
    axios.get(url)
        .then((resp)=>{
            
            console.log(new Date()+" Converting to words");
            var data=resp.data.replace(/[^\w]/g," ").replace(/\s+/g," ");
            var words=data.split(" ");
            
            console.log(new Date()+" Calculating words...");
            words.map((w)=>{
                wmap.set(w,(wmap.get(w)||0)+1);
            });
            
            console.log(new Date()+" Sorting words based on occurances");
            var sortedWords=[...wmap.entries()].sort((w1,w2)=>{ return w2[1]-w1[1]});
            
            var promise=[];
            for(let i=0;i<10 && i<sortedWords.length;i++){
                promise.push(yandexRequester(sortedWords[i][0]))
            }
            console.log(new Date()+" Calling Yandex API");
            Promise.all(promise)
            .then((result)=>{
                var out=[];
                for(let i=0;i<10 && i<sortedWords.length;i++){
                    var synonyms=[];
                    var pos="";
                    var json=result[i].data;
                    try{
                        if(Array.isArray(json.def) && json.def.length>0){
                            pos=json.def[0].pos;
                            var tr=json.def[0].tr || [];
                            tr.map((obj)=>{
                                synonyms.push(obj.text);
                                if(Array.isArray(obj.syn)){
                                    obj.syn.map((syn)=>{
                                        synonyms.push(syn.text);
                                    });
                                }
                            });
                        }
                    }catch(exp){
                        console.log("Error parsing Yandex data",exp);
                    }

                    var word={};
                    word.word=sortedWords[i][0];
                    word.occurances=sortedWords[i][1];
                    word.synonyms=synonyms;
                    word.pos=pos;
                    out.push(word);
                }
                res.status(200).send(out);
                console.log(new Date()+" Finished");
                console.log(out);
            })
            .catch((error)=>{
                console.error("Failed to call Yandex API",error);
                res.status(500).send({status:false,message:"Failed to call Yandex API"});
            })
            
        })
        .catch((error)=>{
            console.error("Failed to retrive Big Data",error);
            res.status(500).send({status:false,message:"Failed to retrive Big Data"});
        });
    
};

var yandexRequester=(word)=>{
    var API_URL="https://dictionary.yandex.net/api/v1/dicservice.json/lookup";
    return axios.get(`${API_URL}?key=${process.env.API_KEY}&lang=en-en&text=${word}`);
}
module.exports=WordAnalyzer;