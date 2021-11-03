const { MongoClient } = require('mongodb');
const fs = require('fs');
const http = require('http');
const url = require('url');


const uri = "mongodb://127.0.0.1:27017/Metricas";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

(async () => await client.connect())();

const collection = client.db("Metricas").collection("metricas3");

const hostname = '0.0.0.0';
const port = 3001;



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

    let cpuUsage = [];
    let nomeIPMemoria = [];

    let metricas = {};


    for(let i = 0; i < dadosEmJson.length; i++){
        nomeIPMemoria[i] = [ dadosEmJson[i]["metric"]["alias"], dadosEmJson[i]["metric"]["instance"], dadosEmJson[i]["value"][1]];
    }

    GETRequest("(1%20-%20avg(irate(node_cpu_seconds_total%7Bmode%3D\"idle\"%7D%5B10m%5D))%20by%20(instance))%20*%20100").then( data2 => {

        let dadosEmJson = JSON.parse(data2)["data"]["result"];

        for(let i = 0; i < dadosEmJson.length; i++){
            cpuUsage[i] = [ dadosEmJson[i]["metric"]["instance"], dadosEmJson[i]["value"][1] ];
        }

        metricas = {
            timestamp: Date.now(),
            nomeMaquina: nomeIPMemoria[0][0],
            CPUuse: cpuUsage[0][1] + " %",
            MemoryUse: nomeIPMemoria[0][2] + " %",
            Ferramenta: "Prometheus"
        };

        salvarNoBanco(metricas);

        metricas = {
            timestamp: Date.now(),
            nomeMaquina: nomeIPMemoria[1][0],
            CPUuse: cpuUsage[1][1] + " %",
            MemoryUse: nomeIPMemoria[1][2] + " %",
            Ferramenta: "Prometheus"
        };

        salvarNoBanco(metricas);

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
    GETRequest("100%20*%20(1%20-%20((avg_over_time(node_memory_MemFree_bytes%5B10m%5D)%20%2B%20avg_over_time(node_memory_Cached_bytes%5B10m%5D)%20%2B%20avg_over_time(node_memory_Buffers_bytes%5B10m%5D))%20%2F%20avg_over_time(node_memory_MemTotal_bytes%5B10m%5D)))").then( data =>{
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