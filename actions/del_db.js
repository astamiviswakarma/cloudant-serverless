var security = require('./lib/security.js');
var cloudant = require('./lib/db.js');
var access = require('./lib/access.js');
var utils = require('./lib/utils.js');

async function main(msg) {

  var user_id = await security.checkCredentials(msg);

  // cloudant
  var db = cloudant.configure(msg['services.cloudant.url'], msg['services.cloudant.database']);

  // if we have been passed a path, then this is a DEL /db/<docid> request
  if (msg.__ow_path && msg.__ow_path.length) {
    var bits = msg.__ow_path.split('/');
    var id = decodeURIComponent(bits[1]);
    var envoyid = access.addOwnerId(id, user_id)

    // strip the OpenWhisk stuff from the object
    msg = utils.removeOpenWhiskParams(msg);

    return db.destroy(envoyid, msg.rev).then(function(body) {
      var retval = {};
      retval[id] = access.strip(body)
      return retval;
    });

  } else {
    // it's a DEL /db request
    return new Error('DEL /db not supported');
  }

};

global.main = main;