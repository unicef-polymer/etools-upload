import {createAttachmentsDexie} from './dexie-config';
import {generateRandomHash} from './dexie-operations';

export const OfflineMixin = (baseClass) =>
  class extends baseClass {
    static get properties() {
      return {
        activateOffline: {
          type: Boolean,
          value: false,
          reflectToAttribute: true
        }
      };
    }

    connectedCallback() {
      super.connectedCallback();
      if (this.activateOffline) {
        createAttachmentsDexie();
      }
    }

    async getFileInfo(file) {
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
