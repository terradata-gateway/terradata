// npm install --save neo4j-driver
var neo4j = require('neo4j-driver');
var driver = neo4j.driver('bolt://52.72.15.191:36066', neo4j.auth.basic('neo4j', 'packs-positions-demonstrations'));
// var driver = neo4j.driver('bolt://0.0.0.0:7687', neo4j.auth.basic('neo4j', ''));
var query = 
  "MATCH (n) \
   RETURN ID(n) as id \
   LIMIT $limit";

var params = {"limit": 10}; 

var session = driver.session();
/* 
session.run(query, params)
  .then(function(result) {
      console.log(result);
    result.records.forEach(function(record) {
        console.log(record.get('id'));
    })
  })
  .catch(function(error) {
    console.log(error);
  }); */



async function executeQuery() {

  var query = 
    "Match (n)-[r]->(m) \
    RETURN n, r, m \
    LIMIT $limit";

  var params = {"limit": 10};

  try {
    // const result = await session.run(query, params);
  
    const result = await session.readTransaction(tx =>
        tx.run(query, params)
      ); 
  
    console.log(result.records[0]["_fields"]);
    
  } catch (error) {
    console.log(error);
  } finally {
    await session.close();
  }
}


executeQuery();


