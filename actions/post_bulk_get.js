var access = require('./lib/access.js');
var security = require('./lib/security.js');
var utils = require('./lib/utils.js');
var cloudant = require('./lib/db.js');

async function main(msg) {

  // security
  var user_id = await security.checkCredentials(msg);
  var params = utils.allowParams(['docs'], msg);
  var qs = utils.allowParams(['revs', 'latest', 'attachments'], msg);

  // cloudant
  var db = cloudant.configure(msg['services.cloudant.url'], msg['services.cloudant.database']);

  // filter incoming doc id list
  if (msg.docs) {
    msg.docs = msg.docs.map(function(doc) {
      doc.id = access.addOwnerId(doc.id, user_id);
      return doc;
    });
  }

  // make _bulk_get request
  return db.request({
    db: msg.CLOUDANT_DATABASE,
    qs: qs,
    path: '_bulk_get',
    method: 'POST',
    body: params
  }).then(function (data) {

    // strip the response
    data.results = data.results.map(function (row) {
      var stripped = Object.assign({}, row);
      stripped.id = access.removeOwnerId(stripped.id);
      stripped.docs.forEach(function (item) {
        if (item.ok) {
          access.strip(item.ok);
        }
        if (item.error) {
          access.strip(item.error);
        }
      });
      return stripped;
    });
    return data;
  });
}

global.main = main;