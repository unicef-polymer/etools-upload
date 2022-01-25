import {upload} from '@unicef-polymer/etools-ajax/upload-helper';

export const RequestHelperMixin = (baseClass) =>
  class extends baseClass {
    static get properties() {
      return {
        uploadEndpoint: {
          type: String,
          reflect: true,
          attribute: 'upload-endpoint'
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
          attribute: 'endpoint-info'
        },

        jwtLocalStorageKey: {
          type: String,
          reflect: true,
          attribute: 'jwt-local-storage-key'
        }
      };
    }

    constructor() {
      super();
      this.uploadEndpoint = null;
      this.endpointInfo = null;
      this.jwtLocalStorageKey = '';
    }

    uploadRawFile(rawFile, requestKey, onProgressCallback) {
      const config = {
        endpointInfo: this.endpointInfo,
        uploadEndpoint: this.uploadEndpoint,
        jwtLocalStorageKey: this.jwtLocalStorageKey
      };
      return upload(config, rawFile, requestKey, onProgressCallback);
    }
  };
