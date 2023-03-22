const express = require("express");
const https = require('https');
const fs = require("fs");
const app = express();
app.use(require('sanitize').middleware);
const port = 3000;



function validUUID(uuid){
    var check = false;
    https.get("https://playerdb.co/api/player/minecraft/"+uuid, (resp)=>{
        let data = '';
        resp.on('data', (chunk) => {
            data += chunk;
        });
        resp.on('end', () => {
            let data_json = JSON.parse(data);
            if(data_json.code == "player.found"){
                check = true;
            }
        });
    });
    return check;
}


function addUser(json,uuid,name,location,event,wants){
    var players = json.Players;
    if(validUUID(uuid) && !checkUser(json,uuid)){
        players.push({"uuid":uuid,"name":name,"location":location,"event":event,"wants":wants});
    }
    return players;
}

function changeUser(json,uuid,location,event,wants){
    var players = json.Players;
    for(i = 0; i<players.length;i++){
        if(players[i].uuid == uuid){
            players[i].location = location;
            players[i].event = event;
            players[i].wants = wants;
        }
    }
    return players;
}

function removeUser(json,uuid){
    var players = json.Players;
    for(i = 0; i<players.length;i++){
        if(players[i].uuid == uuid){
            players.splice(i,1)
        }
    }
    return players;
}

function checkUser(json,uuid){
    var players = json.Players;
    var check = false;
    for(i = 0; i<players.length;i++){
        if(players[i].uuid == uuid){
            check = true;
        }
    }
    return check;
}

function main(jsonPath,req,res){
    data = fs.readFileSync(jsonPath);
    json = JSON.parse(data);

    var state = req.query.state;
    var uuid = req.query.uuid;
    var name = req.query.uuid;
    var location = req.query.location;
    var event = req.query.event;
    var wants = req.query.wants;

  
    switch(state){
      case "add":
          if(uuid != null && event != null){
              if(checkUser(json,uuid)){
                  json.Players = changeUser(json,uuid,location,event,wants);
              }else{
                  json.Players = addUser(json,uuid,name,location,event,wants);
              }
          }
          break;
      case "remove":
          if(uuid != null){
              json.Players = removeUser(json,uuid)
          }
          break;
    }
    fs.writeFileSync(jsonPath,JSON.stringify(json))
    res.json(json);
}

app.get("/", (req, res) => res.send("Hello World!"));

app.get("/events", (req,res) => {
    main("./events.json",req,res);
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));