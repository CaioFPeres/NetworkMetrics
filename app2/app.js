const { MongoClient } = require('mongodb');
const fs = require('fs');
const http = require('http');
const url = require('url');


const uri = "mongodb://127.0.0.1:27017/Metricas";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

(async () => await client.connect())();

const collection = client.db("Metricas").collection("metricas2");

const hostname = '0.0.0.0';
const port = 3000;



async function getMetricas() {

    let result;

    try {
        result = await collection.find().toArray();
    } catch (err) {
        console.log(err);
    }

    console.log(result);
}


async function salvarNoBanco(metricas){

    try {
        collection.insertOne(metricas, function(err, res) {
            if (err) 
                throw err;            
        });
        
    } catch (err) {
        console.log(err);
    }

}


async function processarMetricas(data){

    let dadosEmJson = JSON.parse(data)["data"]["result"];
    let containerIDs = [];
    let containerNames = [];
    let cpuUsage = [];
    let memoryUsage = [];
    let containerLength = 0;
    let metricas = {};
    
    
    for(let i = 0; i < dadosEmJson.length; i++){
        
        if(dadosEmJson[i]["metric"]["id"].includes("/docker/")){

            // pegando o id
            containerIDs[containerLength] = "";
            for(let j = 8; j < dadosEmJson[i]["metric"]["id"].length; j++){
                containerIDs[containerLength] += dadosEmJson[i]["metric"]["id"][j];
            }

            //pegando containerName
            containerNames[containerLength] = dadosEmJson[i]["metric"]["name"];

            //cpu usage
            cpuUsage[containerLength] = dadosEmJson[i]["value"][1];

            containerLength++;
        }
    }

    GETRequest("container_memory_usage_bytes").then( data => {

        GETRequest("machine_memory_bytes").then( data2 => {

            let dadosEmJson = JSON.parse(data)["data"]["result"];
            let MemoriaTotalMaquina = JSON.parse(data2)["data"]["result"][0]["value"][1];

            let containerLength2 = 0;

            for(let i = 0; i < dadosEmJson.length; i++){
            
                if(dadosEmJson[i]["metric"]["id"].includes("/docker/")){
                    memoryUsage[containerLength2++] = dadosEmJson[i]["value"][1];
                }
            }

            for(let i = 0; i < containerLength2; i++){

                metricas = {
                    timestamp: Date.now(),
                    containerID: containerIDs[i],
                    containerName: containerNames[i],
                    CPUuse: cpuUsage[i] + " %",
                    MemoryUse: ((memoryUsage[i] * 100)/MemoriaTotalMaquina) + " %"
                };

                console.log(metricas);

                salvarNoBanco(metricas);
            
            }

        });

    });

}


function GETRequest(query) {

    let options = {
        hostname: "127.0.0.1",
        port: 9090,
        path: "/api/v1/query?query=" + query,
        method: 'GET'
    }
    
    
    return new Promise(function(resolve, reject) {
        let data = "";
        let req = http.request(options, res => {

            res.on("data", datachunk => {
                data = data + datachunk;
            });

            res.on("end", () => {
                resolve(data);
            });
            
        });

        req.on('error', error => {
            console.error(error)
        });
        
        req.end();

    });

}


setInterval( () => {
    GETRequest("rate(container_cpu_user_seconds_total[30s])%20*%20100").then( data =>{
        processarMetricas(data);
    });

},500);



const server = http.createServer( async (req, res) => {

    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html');

    const requestUrl = url.parse(req.url);
    let completePath = requestUrl.pathname;
    let path = completePath.split('/').slice(1)[0];

    let fileContent;

    if(path == "")
        path = "index.html";

    try{
        fileContent = fs.readFileSync(path);
        res.end(fileContent, 'utf-8');
    }
    catch(err){
        console.log("Arquivo não encontrado: " + path);
        if(path != "favicon.ico"){
            res.statusCode = 404;
            fileContent = fs.readFileSync("404.html");
            res.end(fileContent);
        }
    }


});


function cleanup(){
    client.close();
    process.exit();
}
  
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);


server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});