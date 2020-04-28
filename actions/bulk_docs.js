var access = require('./lib/access.js');
var security = require('./lib/security.js');
var utils = require('./lib/utils.js');
var cloudant = require('./lib/db.js');
var uuid = require('./lib/uuid.js');

var filterReply = function(reply) {
  for (var i in reply) {
    reply[i] = access.strip(reply[i]);
  }
  return reply;
}

async function main(msg) {

  // security
  var user_id = await security.checkCredentials(msg);
  var params = utils.allowParams(['docs', 'new_edits'], msg);
  params.new_edits = typeof params.new_edits === 'undefined' ? true : params.new_edits;

  // cloudant
  var db = cloudant.configure(msg['services.cloudant.url'], msg['services.cloudant.database']);

  // Iterate through docs, adding uuids when missing and adding owner ids
  if (params.docs && params.docs.length) {
    params.docs = params.docs.map(function(doc) {
      if (typeof doc === 'object') {
        if (doc._id) {
          doc._id = access.addOwnerId(doc._id, user_id);
        } else {
          doc._id = access.addOwnerId(uuid(), user_id);
        }
      }
      return doc;
    });
  }

  return db.bulk(params).then(filterReply);
}

global.main = main;