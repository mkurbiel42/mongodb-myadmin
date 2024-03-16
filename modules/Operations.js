module.exports = {
    
       //insert

        InsertToDatabase: function (collection, data, callback) {
            collection.insert(data, function (err, result) {
                if (!err) callback()
            });
        },

        //select all - zwraca tablicę pasujących dokumentów

        SelectAllFromDatabase: function (collection, callback) {
            collection.find({}).toArray(function (err, items) {
                if (!err) callback(items)
            });
        },

        //select - zwraca tablicę pasujących dokumentów, z ograniczeniem do {login:"test"}

        SelectByID: function (ObjectID, collection, data, callback) {
            collection.find({_id : ObjectID(data._id)}).toArray(function (err, items) {
                if (!err) callback(items)
            });
        },

        //delete - usunięcie poprzez id - uwaga na ObjectID

        DeleteById: function (ObjectID, collection, id, callback) {
            collection.remove({ _id: ObjectID(id) }, function (err, data) {
                if (!err) callback()
            })
        },

        // update - aktualizacja poprzez id - uwaga na ObjectID - to funkcja, a nie string
        // uwaga: bez $set usuwa poprzedni obiekt i wstawia nowy
        // z $set - dokonuje aktualizacji tylko wybranego pola

        UpdateById: function (ObjectID, collection, data, callback){
            let id = data._id
            delete data._id
            console.log(data, id)
            collection.updateOne(
                { _id: ObjectID(id) },
                { $set: data },
                function (err, data) {
                    (err) ? console.log(err) : callback()              
                })
        },

        createCollection: function(db, collName, callback){
            db.createCollection(collName, function(err,coll){
                if (!err) callback(coll)
            })
        },

        listDatabases: function(db, callback){
            db.admin().listDatabases(function(err, dbs){
                if (!err) callback(dbs)
            })     
        },

        listCollections: function (db, callback){
            db.listCollections().toArray(function(err, colls){
                if (!err) callback(colls)
            })
        },

        dropDatabase: function (db, callback){
            db.dropDatabase(function(err,db){
                if (!err) callback(db)
            })
        },

        dropCollection: function (db, collName, callback){
            db.collection(collName).drop(function(err,coll){
                if (!err) callback(coll)
            })
        }

     
}