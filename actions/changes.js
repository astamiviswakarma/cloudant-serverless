var access = require('./lib/access.js');
var security = require('./lib/security.js');
var utils = require('./lib/utils.js');
var cloudant = require('./lib/db.js');

async function main(msg) {

  // security
  var user_id = await security.checkCredentials(msg);
  var params = utils.allowParams(['style', 'since', 'timeout','include_docs'], msg);

  // cloudant
  var db = cloudant.configure(msg['services.cloudant.url'], msg['services.cloudant.database']);

  // use Mango filtering https://github.com/apache/couchdb-couch/pull/162
  params.limit = 100;
  params.filter = '_selector';
  var prefix = access.addOwnerId('',user_id);
  var selector = {
    selector: {
      '_id':  { '$gt': prefix,
                '$lt': prefix + 'z'
              }
    }
  };

  // query filtered changes
  return db.request( {
    db: msg.CLOUDANT_DATABASE,
    path: '_changes',
    qs: params,
    method: 'POST',
    body: selector
  }).then(function(data) {
    if (data.results) {
      data.results = data.results.map(function(r) {
        return access.strip(r);
      });
    }
    return data;
  })
}

global.main = main;