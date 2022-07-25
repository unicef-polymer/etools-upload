import {createAttachmentsDexie} from './dexie-config';
import {generateRandomHash} from './dexie-operations';

export const OfflineMixin = (baseClass) =>
  class extends baseClass {
    static get properties() {
      return {
        activateOffline: {
          type: Boolean,
          reflect: true,
          attribute: 'activate-offline'
        }
      };
    }

    constructor() {
      super();
      this.activateOffline = false;
    }

    connectedCallback() {
      super.connectedCallback();
      if (this.activateOffline) {
        createAttachmentsDexie();
      }
    }

    getFileInfo(file) {
      return {
        id: generateRandomHash(),
        filetype: file.type,
        filename: file.name,
        extraInfo: this.endpointInfo ? this.endpointInfo.extraInfo : '',
        parentId:
          window.OfflineUploadParentId ||
          (this.endpointInfo && this.endpointInfo.extraInfo ? this.endpointInfo.extraInfo.parentId : ''),
        unsynced: true
      };
    }
  };
