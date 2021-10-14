import {upload} from '@unicef-polymer/etools-ajax/upload-helper';

export const RequestHelperMixin = (baseClass) =>
  class extends baseClass {
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

        jwtLocalStorageKey: {
          type: String,
          value: ''
        }
      };
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
