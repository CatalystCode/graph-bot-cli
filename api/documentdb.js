var api = { console: { autoLoad: true} };

var express = require('express'),
  router = api.router = express.Router(),
  docRouter = require('docrouter').docRouter,
  DocumentClientQ = require('documentdb-q-promises').DocumentClientWrapper,
  clientQ = new DocumentClientQ('https://mshealthbot.documents.azure.com:443/', { masterKey: 'asF2eiYnoKCCQBL5w5AzYf3lYpUDCSmhGd67pIDVzNgvaQv8xoKEItOVVbFhmCM6wWNrYJci3sL0dOZHN8JNJg=='}),
  dblink;



module.exports = api;

docRouter(router, "/api/documentdb", function (router) {

    router.get('/use', function(req, res) { 
      var d = req.query.database;
      var querySpec = {
            query: 'SELECT * FROM root r WHERE r.id= @id',
            parameters: [{
                name: '@id',
                value: d
            }]
        };
      clientQ.queryDatabases(querySpec).toArrayAsync().then(function(dl) {
        dblink = dl.feed[0]._self;
        return res.json({link:dblink});
      }).catch(function(e){
        res.json({error:e.message});
      });
  },
  {
      id: 'documentdb_use',
      name: 'use',
      usage: 'documentdb use -d [db name]',
      example: 'documentdb use mydb',
      doc: 'Sets the current database',
      params: {
        "database" : {
          "short":"d",
          "type":"string",
          "style":"query",
          "required":true
        }
      },
      response: { representations: ['application/json'] }

  });
  router.get('/databases', function(req, res) {
      clientQ.queryDatabases("SELECT * FROM root").toArrayAsync().then(function(databases) {
        var dbs = [];
        for (var i=0; i < databases.feed.length; i++) {
            dbs.push(databases.feed[i].id);
        }
        return res.json(dbs);
      });
  },
  {
      id: 'documentdb_databases',
      name: 'databases',
      usage: 'documentdb databases',
      example: 'documentdb databases',
      doc: 'Gets the list of databases',
      params: {},
      response: { representations: ['application/json'] }
    }
  );
  router.get('/collections', function(req, res) {
      if (!dblink) {
        res.send("Current DB is not set.");
      }
      else {
        clientQ.queryCollections(dblink, "SELECT * FROM root").toArrayAsync().then(function(collections) {
          var colls = [];
          for (var i = 0; i < collections.feed.length;i++) {
            colls.push({id:collections.feed[i].id, self:collections.feed[i]._self});
          }
          return res.json(colls);
        });
      }
  },
  {
      id: 'documentdb_collections',
      name: 'collections',
      usage: 'documentdb collections',
      example: 'documentdb collections',
      doc: 'Gets the list of collections',
      params: {},
      response: { representations: ['application/json'] }
    }
  );
  router.get('/collection', function(req, res){
    var coll = req.query.collection;
    var querySpec = {
            query: 'SELECT * FROM root r WHERE r.id=@id',
            parameters: [{
                name: '@id',
                value: coll
            }]
        };
    clientQ.queryCollections(dblink, querySpec).toArrayAsync().then(function(coll){

      clientQ.queryDocuments(coll.feed[0]._self, "SELECT * from root").toArrayAsync().then(function(docs){
        res.json(docs.feed);
      });
    });
  },
  {
      id: 'documentdb_collection',
      name: 'collection',
      usage: 'documentdb collection -c [collection name]',
      example: 'documentdb collection tokens',
      doc: 'Get all documents of a collection',
      params: {
        "collection" : {
          "short":"c",
          "type":"string",
          "style":"query",
          required:true
        }
      },
      response: { representations: ['application/json'] }

  });

});
