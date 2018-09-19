import '@polymer/iron-ajax/iron-request.js';

export const RequestHelper = (baseClass) => class extends (baseClass) {
  static get properties() {
    return {
      uploadEndpoint: {
        type: String,
        value: null
      },

      activeXhrRequest: {
        type: Object,
        value: null
      }
    };
  }

  upload(rawFile) {

    let options = {
      method: 'POST',
      url: this.uploadEndpoint,
      body: this._prepareBody(rawFile)
    };
    return this.sendRequest(options)
           .then((response) => {
             this.activeXhrRequest = null;
             return response;
           }).catch((error) => {
             this.activeXhrRequest = null;
             throw error;
           })
  }

  _prepareBody(rawFile) {
    let fd = new FormData()
    fd.append('file', rawFile);
    return fd;
  }

  sendRequest(options) {
    var request = document.createElement('iron-request');
    this.activeXhrRequest = request;
    request.send(options);
    return request.completes;
  }
}
