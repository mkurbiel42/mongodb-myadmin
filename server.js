var express = require("express")
var path = require('path')
var app = express()
const PORT = 3000;
const mongoClient = require('mongodb').MongoClient
const ObjectID = require('mongodb').ObjectID;
const opers = require("./modules/Operations.js")
app.use(express.json());

let _db = null
let _coll = null
let host = null
let defDB = null

app.get('/', function(req,res){
    res.sendFile(path.join(__dirname + '/static/main.html'))
})

app.post('/connect', function(req,res){
    
    let newHost = req.body.host

    mongoClient.connect("mongodb://" + newHost, function (err, db) {

        if(err){
            res.setHeader("content-type", "application/json")
            res.send(JSON.stringify({problem:"404"}))
        }
        else{
            let slash = newHost.indexOf('/')
            
            if(slash!=-1){
                host = newHost.substring(0, slash)
                defDB = newHost.substring(slash+1)
            }else{
                host = newHost
            }
            
            _db = db;

            if(host == "localhost"){
                console.log("Połączono lokalnie")
            }else{
                console.log("Połączono")
            }   

            opers.listDatabases(_db, function(dbs){
                let dbList = []
                    dbs.databases.forEach(record =>{
                        if(record.name != 'admin' && record.name != 'local' && record.name != 'config'){
                            dbList.push(record.name)
                        }  
                    })
                    res.setHeader("content-type", "application/json")
                    if(defDB != ""){
                        res.send(JSON.stringify({dbList:dbList, currentDB:defDB}))
                    }else{
                        res.send(JSON.stringify({dbList:dbList, currentDB:"nie wybrano"}))
                    }
                    
            })
        }
    })
})

app.post("/useDB", function(req,res){
    console.log(req.body)
    console.log(host)
    mongoClient.connect("mongodb://" + host + "/" + req.body.db, function (err, db) {
        _db = db
        _coll = null
        opers.listCollections(db, function(colls){
            let collsList = []
            colls.forEach(coll => {
                collsList.push(coll.name)
            })
            res.setHeader("content-type", "application/json")
            res.send(JSON.stringify({currentDB:req.body.db, collsList:collsList, currentColl:"nie wybrano"}))
        })
        
    })
})

app.post("/useColl", function(req,res){
    //console.log(req.body.coll)
    _coll = _db.collection(`${req.body.coll}`)
    opers.SelectAllFromDatabase(_coll, function(docs){
        res.setHeader("content-type", "application/json")
        res.send(JSON.stringify({docs:docs, currentColl:req.body.coll}))})
    
})

app.post("/addDB", function(req,res){
    //console.log(req.body.dbName)
    mongoClient.connect("mongodb://" + host + "/" + req.body.dbName, function (err, db) {
        _db = db
        _coll = null

        opers.createCollection(_db, "defaultCollection", function(coll){
            opers.listDatabases(_db, function(dbs){
                let dbList = []
                dbs.databases.forEach(record =>{
                    if(record.name != 'admin' && record.name != 'local' && record.name != 'config'){
                        dbList.push(record.name)
                    }  
                })
                res.setHeader("content-type", "application/json")
                res.send(JSON.stringify({dbList:dbList, currentDB:req.body.dbName}))
            })
        })
    })
})

app.post('/addColl', function(req,res){
    //console.log(req.body)
    opers.createCollection(_db, req.body.collName, function(coll){
        opers.listCollections(_db, function(colls){
            let collsList = []
            colls.forEach(coll => {
                collsList.push(coll.name)
            })
            res.setHeader("content-type", "application/json")
            res.send(JSON.stringify({collsList:collsList, currentColl:req.body.collName}))
        })
    })
})

app.post('/removeDB', function(req,res){
    //console.log(req.body)
    opers.dropDatabase(_db, function(db){
        opers.listDatabases(_db, function(dbs){
            let dbList = []
            dbs.databases.forEach(record =>{
                if(record.name != 'admin' && record.name != 'local' && record.name != 'config'){
                    dbList.push(record.name)
                }
            })
            res.setHeader("content-type", "application/json")
            res.send(JSON.stringify({dbList:dbList, currentDB:"nie wybrano", currentColl:"nie wybrano"}))
            _db = null
            _coll = null
        })
    })
})

app.post('/removeColl', function(req,res){
    opers.dropCollection(_db, req.body.collName, function(coll){
        opers.listCollections(_db, function(colls){
            let collsList = []
            colls.forEach(coll => {
                collsList.push(coll.name)
            })
            res.setHeader("content-type", "application/json")
            res.send(JSON.stringify({collsList:collsList, currentColl:"nie wybrano"}))
            _coll = null
        })
    })
})

app.post('/saveDoc', function(req,res){
    opers.InsertToDatabase(_coll, req.body, function(){
        opers.SelectAllFromDatabase(_coll, function(docs){
        res.send(JSON.stringify({docs:docs}))
        })
    })
    
})

app.post('/removeDoc', function(req,res){
    opers.DeleteById(ObjectID, _coll, req.body.id, function(){
        opers.SelectAllFromDatabase(_coll, function(docs){
            res.send(JSON.stringify({docs:docs}))
        })
    })
})

app.post('/editDoc', function(req,res){
    //console.log(req.body._id)
    opers.SelectByID(ObjectID, _coll, {_id: req.body._id}, function(items){
        res.send(JSON.stringify(items))
    })
})

app.post('/saveEditedDoc', function(req,res){
    opers.UpdateById(ObjectID, _coll, req.body, function(){
        opers.SelectAllFromDatabase(_coll, function(docs){
            res.send(JSON.stringify({docs:docs}))
        })
    })
})

app.use(express.static('static'))
app.listen(PORT, function () {
    console.log("start serwera na porcie " + PORT )
})

/*mongoClient.connect("mongodb://localhost/baza_mk", function (err, db) {
    if (err) console.log(err)
    else console.log("mongo podłączone!")
    _db = db;
})*/
