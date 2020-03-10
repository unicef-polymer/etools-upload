import '@polymer/iron-ajax/iron-request.js';
import {getAtachmentsByIds} from './offline/dexie-operations';

let activeXhrRequests = {};

/**
 * config = {
 *  endpointInfo: {},
 *  uploadEndpoint: '',
 *  jwtLocalStorageKey: ''
 * }
 */
export function upload(config, rawFile, requestKey) {
  let options = {
    method: 'POST',
    url: _getEndpoint(config.endpointInfo, config.uploadEndpoint),
    body: _prepareBody(rawFile, requestKey, config.endpointInfo),
    headers: _getHeaders(config.jwtLocalStorageKey)
  };
  return sendRequest(options, requestKey)
    .then((response) => {
      delete activeXhrRequests[requestKey];
      return response;
    }).catch((error) => {
      delete activeXhrRequests[requestKey];
      throw error;
    });
}

export function abortActiveRequests(activeReqKeys) {
  if (!activeXhrRequests) {
    return;
  }
  let keys = activeReqKeys || Object.keys(activeXhrRequests);
  if (keys.length) {
    keys.forEach(key => {
      try {
        activeXhrRequests[key].abort();
        delete activeXhrRequests[key];
      } catch (error) {
      }
    });
  }
}

function sendRequest(options, requestKey) {
  let request = document.createElement('iron-request');
  activeXhrRequests[requestKey] = request;
  request.send(options);
  return request.completes.then((request) => {
    return request.response;
  });
}

function _getEndpoint(endpointInfo, uploadEndpoint) {
  if (endpointInfo && endpointInfo.endpoint) {
    return endpointInfo.endpoint;
  }
  return uploadEndpoint;
}

function _prepareBody(rawFile, filename, endpointInfo) {
  let fd = new FormData()

  let rawFileProperty = _getRawFilePropertyName(endpointInfo);
  fd.append(rawFileProperty, rawFile, filename);

  if (endpointInfo && endpointInfo.extraInfo) {
    _addAnyExtraInfoToBody(fd, endpointInfo.extraInfo);
  }
  return fd;
}

function _addAnyExtraInfoToBody(formData, extraInfo) {
  for (let prop in extraInfo) {
    if (extraInfo.hasOwnProperty(prop)) {
      formData.append(prop, extraInfo[prop]);
    }
  }
}

function _getRawFilePropertyName(endpointInfo) {
  if (endpointInfo && endpointInfo.rawFilePropertyName) {
    return endpointInfo.rawFilePropertyName;
  }
  return 'file';
}

function _getHeaders(jwtLocalStorageKey) {
  let csrfToken = _getCSRFToken();
  let jwtToken = _getJwtToken(jwtLocalStorageKey);
  let headers = {};
  if (csrfToken) {
    headers['x-csrftoken'] = csrfToken;
  }
  if (jwtToken) {
    headers['authorization'] = 'JWT ' + jwtToken;
  }
  return headers;
}

function _getJwtToken(jwtLocalStorageKey) {
  return localStorage.getItem(jwtLocalStorageKey);
}

function _getCSRFToken() {
  // check for a csrftoken cookie and return its value
  var csrfCookieName = 'csrftoken';
  var csrfToken = null;
  if (document.cookie && document.cookie !== '') {
    var cookies = document.cookie.split(';');
    for (var i = 0; i < cookies.length; i++) {
      var cookie = cookies[i].trim();
      if (cookie.substring(0, csrfCookieName.length + 1) === (csrfCookieName + '=')) {
        csrfToken = decodeURIComponent(cookie.substring(csrfCookieName.length + 1));
        break;
      }
    }
  }
  return csrfToken;
}

function uploadAllFilesSequentially(config, files) {
  return new Promise(function(resolve, reject) {
    let allSuccessResponses = [];
    let allErrorResponses = [];
    let i;
    let counter = 0;

    for (i = 0; i < files.length; i++) {
      upload(config, files[i], files[i].name).then((response) => {

        allSuccessResponses.push(response);

        if ((counter + 1) === files.length) {
          resolve({
            allSuccessResponses: allSuccessResponses,
            allErrorResponses: allErrorResponses
          });
        }
        counter++;
      }).catch((err) => {

        allErrorResponses.push(err);

        if ((counter + 1) === files.length) {
          resolve({
            allSuccessResponses: allSuccessResponses,
            allErrorResponses: allErrorResponses
          });
        }
        counter++;
      });
    }

  });
}

/**
 * config = {
 *  endpointInfo: {},
 *  uploadEndpoint: '',
 *  jwtLocalStorageKey: ''
 * }
 */
export async function uploadFilesStoredInIndexedDb(config, ids) {
  let files = getAtachmentsByIds(ids);
  // files contain extraInfo, if needed this extraInfo cand be set on response also
  let response = await uploadAllFilesSequentially(config, files);
  return response;
}

