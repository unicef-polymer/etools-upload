import { RequestHelper } from  './request-helper.js';

export const RequestHelperMulti = (baseClass) => class extends RequestHelper(baseClass) {
  static get properties() {
    return {
      // True if you can upload more than one file at a time
      endpointAcceptsMulti: {
        type: Boolean,
        value: false
      },
      cancelUpload: {
        type: Boolean,
        value: false
      }

    }
  }

}
