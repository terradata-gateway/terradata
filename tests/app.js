// Express 
const express = require('express');
const path = require('path');
const logger = require('morgan');
const bodyParser = require('body-parser');

const app = express();

app.use(logger('dev'));
app.use(bodyParser.json());


// Neo4j 
// npm install --save neo4j-driver
var neo4j = require('neo4j-driver');
var driver = neo4j.driver('bolt://52.72.15.191:36066', neo4j.auth.basic('neo4j', 'packs-positions-demonstrations'));
var session = driver.session();


// Neo4j test

async function executeQuery() {

    var query = 
      "MATCH (n) \
      RETURN ID(n) as id \
      LIMIT $limit";
  
    var params = {"limit": 10};
  
    try {
      const result = await session.run(query, params);
    
      /* const result = await session.readTransaction(tx =>
          tx.run(query, params)
        ); */
    
      console.log(result.records);
      
    } catch (error) {
      console.log(error);
    } finally {
      // await session.close();
    }
  }
  
  
  
  

app.get('/', async (req, res) => {
   executeQuery();
   res.send('It works!');
});


  
  // on application exit:
  driver.close();



 app.listen(3000, () => {
     console.log('App listening on port 3000!');
 });