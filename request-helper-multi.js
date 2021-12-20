import {RequestHelperMixin} from './request-helper-mixin';

export const RequestHelperMulti = (baseClass) =>
  class extends RequestHelperMixin(baseClass) {
    static get properties() {
      return {
        // True if you can upload more than one file at a time
        endpointAcceptsMulti: {
          type: Boolean,
          reflect: true,
          attribute: 'endpoint-accepts-multi'
        },
        cancelUpload: {
          type: Boolean,
          reflect: true,
          attribute: 'cancel-upload'
        }
      };
    }

    constructor() {
      super();
      this.endpointAcceptsMulti = false;
      this.cancelUpload = false;
    }
  };
