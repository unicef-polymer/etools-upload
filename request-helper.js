import '@polymer/iron-ajax/iron-request.js';

export const RequestHelper = (baseClass) => class extends (baseClass) {
  static get properties() {
    return {
      uploadEndpoint: {
        type: String,
        value: null
      },
      /* Expected format:
        {
          endpoint: 'url',
          extraInfo: {itemid: 1},
          rawFilePropertyName: 'attachment'
        }
      */
      endpointInfo: {
        type: Object,
        value: null
      },

      activeXhrRequests: {
        type: Object,
        value: {}
      }
    };
  }

  upload(rawFile, requestKey) {
    let options = {
      method: 'POST',
      url: this._getEndpoint(),
      body: this._prepareBody(rawFile),
      headers: this._getCSRFHeader()
    };
    return this.sendRequest(options, requestKey)
           .then((response) => {
             delete this.activeXhrRequests[requestKey];
             return response;
           }).catch((error) => {
             delete this.activeXhrRequests[requestKey];
             throw error;
           });
  }
  _getEndpoint() {
    if (this.endpointInfo && this.endpointInfo.endpoint) {
      return this.endpointInfo.endpoint;
    }
    return this.uploadEndpoint;
  }
  _prepareBody(rawFile) {
    let fd = new FormData()

    let rawFileProperty =  this._getRawFilePropertyName();
    fd.append(rawFileProperty, rawFile);

    if (this.endpointInfo && this.endpointInfo.extraInfo) {
      this._addAnyExtraInfoToBody(fd, this.endpointInfo.extraInfo);
    }
    return fd;
  }
  _addAnyExtraInfoToBody(formData, extraInfo) {
    for (let prop in extraInfo) {
      if (extraInfo.hasOwnProperty(prop)) {
        formData.append(prop, extraInfo[prop]);
      }
    }
  }
  _getRawFilePropertyName () {
    if (this.endpointInfo && this.endpointInfo.rawFilePropertyName) {
      return this.endpointInfo.rawFilePropertyName;
    }
    return 'file';
  }

  _getCSRFHeader() {
    let csrftoken = this._getCSRFToken();
    if (csrftoken) {
      return {
        'x-csrftoken': csrftoken
      };
    }
  }

  _getCSRFToken() {
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

  abortActiveRequests(activeReqKeys) {
    if (!this.activeXhrRequests) {
      return;
    }
    let keys = activeReqKeys || Object.keys(this.activeXhrRequests);
    if (keys.length) {
      keys.forEach(key => {
        try {
          this.activeXhrRequests[key].abort();
          delete this.activeXhrRequests[key];
        } catch (error) {
        }
      });
    }
  }

  sendRequest(options, requestKey) {
    var request = document.createElement('iron-request');
    this.activeXhrRequests[requestKey] = request;
    request.send(options);
    return request.completes.then((request) => {
      return request.response
    });
  }
}
