var api = { console: { autoLoad: true } };

var express = require('express'),
  router = api.router = express.Router(),
  docRouter = require('docrouter').docRouter,
  config = require('../config'),
  DocumentClientQ = require('documentdb-q-promises').DocumentClientWrapper,
  clientQ = new DocumentClientQ(config.documentdb.account_url,
    { masterKey: config.documentdb.master_key });


module.exports = api;

docRouter(router, "/api/documentdb", function (router) {

  router.get('/databases', function (req, res) {
    clientQ.queryDatabases("SELECT * FROM root").toArrayAsync().then(function (databases) {
      var dbs = [];
      for (var i = 0; i < databases.feed.length; i++) {
        dbs.push(databases.feed[i].id);
      }
      return res.json(dbs);
    }).catch(function(err){
        return res.json({err:err.message});
    });
  },
    {
      id: 'documentdb_databases',
      name: 'databases',
      usage: 'documentdb databases',
      example: 'documentdb databases',
      doc: 'Gets the list of all the ddatabases in this storage account',
      params: {},
      response: { representations: ['application/json'] }
    }
  );
  router.get('/collections', function (req, res) {
    var d = req.query.database;
    var querySpec = {
      query: 'SELECT * FROM root r WHERE r.id= @id',
      parameters: [{
        name: '@id',
        value: d
      }]
    };
    clientQ.queryDatabases(querySpec).toArrayAsync().then(function (dblink) {
      clientQ.queryCollections(dblink.feed[0]._self, "SELECT * FROM root").toArrayAsync().then(function (collections) {
        var colls = [];
        for (var i = 0; i < collections.feed.length; i++) {
          colls.push({ id: collections.feed[i].id, self: collections.feed[i]._self });
        }
        return res.json(colls);
      });
    }).catch(function(err){
      return res.json({err:err.message});
    });
  },
    {
      id: 'documentdb_collections',
      name: 'collections',
      usage: 'documentdb collections -d [database]',
      example: 'documentdb collections -d mydb',
      doc: 'Gets the list of all the collections of the given database',
      params: {
        "database": {
          "short": "d",
          "type": "string",
          "style": "query",
          required: true
        }
      },
      response: { representations: ['application/json'] }
    }
  );
  router.get('/collection', function (req, res) {
    var d = req.query.database;
    var dbquerySpec = {
      query: 'SELECT * FROM root r WHERE r.id= @id',
      parameters: [{
        name: '@id',
        value: d
      }]
    };
    var coll = req.query.collection;
    var querySpec = {
      query: 'SELECT * FROM root r WHERE r.id=@id',
      parameters: [{
        name: '@id',
        value: coll
      }]
    };
    clientQ.queryDatabases(dbquerySpec).toArrayAsync().then(function (dblink) {
      clientQ.queryCollections(dblink.feed[0]._self, querySpec).toArrayAsync().then(function (coll) {
        clientQ.queryDocuments(coll.feed[0]._self, "SELECT * from root").toArrayAsync().then(function (docs) {
          res.json(docs.feed);
        });
      });
    }).catch(function(err){
      return res.json({err:err.message});
    });
  },
    {
      id: 'documentdb_collection',
      name: 'collection',
      usage: 'documentdb collection -d[database] -c [collection name]',
      example: 'documentdb collection tokens',
      doc: 'Get all documents of a collection',
      params: {
        "database": {
          "short": "d",
          "type": "string",
          "style": "query",
          required: true
        },
        "collection": {
          "short": "c",
          "type": "string",
          "style": "query",
          required: true
        }
      },
      response: { representations: ['application/json'] }

    });

});
