const request = require('request');
const _ = require('lodash');

const promisifiedRequest = function(options) {
  return new Promise((resolve,reject) => {
    request(options, (error, response, body) => {
      if (response) {
        return resolve(response);
      }
      if (error) {
        return reject(error);
      }
    });
  });
};

const extractUserIdFromResponse = function(response) {
  if(!response.body)
    throw( new Error('Error authorizing - unknown user'));

  if(!response.body.identities || response.body.identities.length == 0)
    throw( new Error('Error identities - unknown user'));

  //@TODO hardcoding not good. should resort to other means necessary.
  var cloudDirectory = _.find(response.body.identities, function (identity) { return identity.provider == "cloud_directory"; });

  if(!cloudDirectory) {
    throw( new Error('Not from cloudDirectory - unknown user'));
  }

  return cloudDirectory.id;
}

const getUserIdFromToken = async function(appidUrl, token) {
  var options = {
    method: 'GET',
    json: true,
    url: appidUrl+'/userinfo',
    headers: {
      'Authorization': token
    }
  };

  var response = await promisifiedRequest(options);
  if(!response) {
    throw( new Error('Error authorizing - invalid user'));
  }

  //console.log(response.body);
  return extractUserIdFromResponse(response);
}

const checkCredentials = async function(msg) {
  if (msg && msg.__ow_headers && msg.__ow_headers['authorization']) {
    return await getUserIdFromToken(msg['services.appid.url'], msg.__ow_headers['authorization']);
  } else {
    throw( new Error('Missing authorization - unknown user'));
  }
};

module.exports = {
  checkCredentials: checkCredentials,
  getUserIdFromToken: getUserIdFromToken
}