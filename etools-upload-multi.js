import {PolymerElement, html} from '@polymer/polymer';
import '@polymer/polymer/lib/elements/dom-repeat.js';
import '@polymer/paper-button/paper-button.js';
import '@polymer/iron-icon/iron-icon.js';
import '@polymer/iron-icons/iron-icons.js';
import '@polymer/paper-input/paper-input-container.js';
import '@polymer/paper-input/paper-input-error.js';
import '@polymer/paper-progress/paper-progress.js';
import {CommonStyles} from "./common-styles";
import {CommonMixin} from './common-mixin.js';
import {RequestHelperMulti} from './request-helper-multi.js';
import {createAttachmentsDexie} from './offline/dexie-config';
import {getFileUrl, getBlob} from './offline/file-conversion';
import {storeFileInDexie, generateRandomHash} from './offline/dexie-operations';
import {getActiveXhrRequests, abortActiveRequests} from '@unicef-polymer/etools-ajax/upload-helper';

/**
 * `etools-upload-multi` Description
 *
 * @customElement
 * @polymer
 * @extends {Polymer.Element}
 */
class EtoolsUploadMulti extends RequestHelperMulti(CommonMixin(PolymerElement)) {
  static get template() {
    // language=HTML
    return html`
        ${CommonStyles}
    <style>
      .upload-btn-and-actions {
        display: flex;
        flex-direction: row;
        align-items: center;
      }
      .filenames-container {
        padding-top: 4px;
        margin-top: 4px;
        margin-bottom: 16px;
      }
      .filename-line {
        flex-direction: row;
        align-items: center;
        display: block;
      }
      .filename {
        padding: 0 16px 0 8px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        max-width: calc(100% - 100px);
        display: inline-block;
        vertical-align: middle;
      }
      .delete-button {
        padding-left: 24px;
      }
      .filename-container {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .progress-container {
        display: flex;
        flex-direction: column;
        flex-wrap: nowrap;
        width: 180px;
      }
      paper-progress {
        --paper-progress-active-color: var(--primary-color);
        width: 100%;
      }
      .progress-container span {
        font-size: 11px;
        margin: 0 auto;
      }

    </style>

    <div>
      <div class="upload-btn-and-actions">
        <paper-button class="upload-button" on-tap="_openFileChooser" title="[[uploadBtnLabel]]" disabled$="[[_shouldDisableUploadBtn(readonly, uploadInProgress)]]">
                      <iron-icon icon="file-upload"></iron-icon>
                      [[uploadBtnLabel]]
        </paper-button>

        <div class="file-actions">
            <paper-button class="delete-button" on-tap="_cancelUpload" disabled$="[[!uploadInProgress]]" hidden$="[[!uploadInProgress]]">
              <iron-icon icon="clear"></iron-icon>
              Cancel Upload
            </paper-button>
        </div>
      </div>

      <div class="filenames-container" hidden$="[[!_thereAreFilesSelected(_filenames)]]">
        <template is="dom-repeat" items="{{_filenames}}" as="item">
          <div class="filename-line">
            <div class="filename-container">
              <iron-icon class="file-icon" icon="attachment"></iron-icon>
              <span class="filename" title="[[item.filename]]">[[item.filename]]</span>

              <iron-icon title="Uploaded successfully!" icon="done" hidden$="[[!item.success]]"></iron-icon>
              <iron-icon title="Upload failed!" icon="error-outline" hidden$="[[!item.fail]]"></iron-icon>
            </div>
            <template is="dom-if" if="[[item.uploadProgressValue]]">
              <div class='progress-container'>
                <paper-progress value="[[item.uploadProgressValue]]"></paper-progress>
                <span>[[item.uploadProgressMsg]]</span>
              <div>
            </template>

          </div>
        </template>
      </div>

      <!-- Props -->
      <input hidden="" type="file" id="fileInput" on-change="_filesSelected" multiple="" accept="{{accept}}">

      <a id="downloader" hidden=""></a>
    </div>

`;
  }

  static get is() {
    return 'etools-upload-multi';
  }

  static get properties() {
    return {
      uploadBtnLabel: {
        type: String,
        value: 'Upload files'
      },
      rawFiles: {
        type: Array,
        value: []
      },
      _filenames: {
        type: Array,
        value: []
      },
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

  _filesSelected(e) {
    let files = e.target.files ? e.target.files : null;
    if (!files || !files.length) {
      return;
    }

    this.rawFiles = files;
    this._filenames = this._extractFilenames(files);

    if (this.autoUpload) {
      this._handleUpload(files);
    }
  }

  _extractFilenames(files) {
    let names = [];
    for (let i = 0; i < files.length; i++) {
      names.push({
        filename: files.item(i).name,
        success: false,
        fail: false,
        uploadInProgress: this.autoUpload,
        uploadProgressValue: '',
        uploadProgressMsg: ''
      });
    }
    return names;
  }

  async saveFilesInIndexedDb(files) {
    let i;
    let filesInfo = [];
    let errors = [];
    for (i = 0; i < files.length; i++) {
      let blob = await getBlob(getFileUrl(files[i]));
      let fileInfo = {
        id: generateRandomHash(),
        filetype: files[i].type,
        filename: files[i].name,
        extraInfo: this.endpointInfo ? this.endpointInfo.extraInfo : '',
        parentId: window.OfflineUploadParentId || ((this.endpointInfo && this.endpointInfo.extraInfo) ? this.endpointInfo.extraInfo.parentId : ''),
        unsynced: true
      }

      let fileInfoForDb = JSON.parse(JSON.stringify(fileInfo));
      fileInfoForDb.binaryData = blob;
      try {
        await storeFileInDexie(fileInfoForDb);
        filesInfo.push(fileInfo);
        this.set(['_filenames', i, 'uploadInProgress'], false);
        this.set(['_filenames', i, 'success'], true);
      } catch (error) {
        errors.push('Error saving attachment' + fileInfo.filename + ' in IndexedDb');
        this.set(['_filenames', i, 'uploadInProgress'], false);
        this.set(['_filenames', i, 'fail'], true);
      }
    }
    return {
      success: filesInfo,
      error: errors
    };
  }

  async _handleUpload(files) {
    this.uploadInProgress = true;
    if (this.activateOffline && navigator.onLine === false) {
      let response = await this.saveFilesInIndexedDb(files);
      this.uploadInProgress = false;
      this.resetRawFiles();
      this.fireEvent('upload-finished', response);
      setTimeout(this._clearDisplayOfUploadedFiles.bind(this), 2000);
      return;
    }

    if (this.endpointAcceptsMulti) {
      // we don't have this situation yet
    } else {
      this._uploadAllFilesSequentially(files, this.uploadRawFile.bind(this), this.set.bind(this),
        this.prepareErrorMessage.bind(this))
        .then((response) => {
          this.uploadInProgress = false;
          this.resetRawFiles();
          if (response && !response.uploadCanceled) {
            this.fireEvent('upload-finished', {
              success: response.allSuccessResponses,
              error: response.allErrorResponses
            });

            setTimeout(this._clearDisplayOfUploadedFiles.bind(this), 2000);
          }
        });
    }
  }
  _clearDisplayOfUploadedFiles() {
    this._filenames = [];
  }

  _uploadAllFilesSequentially(files, uploadFunction, set, prepareErrorMessage) {
    const self = this;
    return new Promise(function(resolve, reject) {
      let allSuccessResponses = [];
      let allErrorResponses = [];
      let i;
      let counter = 0;
      for (i = 0; i < files.length; i++) {
        (function(index) {
        uploadFunction(files[index], files[index].name, self._computeUploadProgress.bind(self, set, index)).then((response) => {
          set(['_filenames', index, 'success'], true);
          set(['_filenames', index, 'uploadInProgress'], false);
          self._setProgressProps(set, index, '', '');

          allSuccessResponses.push(response);

          if ((counter + 1) === files.length) {
            resolve({
              allSuccessResponses: allSuccessResponses,
              allErrorResponses: allErrorResponses
            });
          }
          counter++;
        }).catch((err) => {
          set(['_filenames', index, 'uploadInProgress'], false);
          set(['_filenames', index, 'fail'], true);
          self._setProgressProps(set, index, '', '');

          allErrorResponses.push(prepareErrorMessage(err));

          if ((counter + 1) === files.length) {
            resolve({
              allSuccessResponses: allSuccessResponses,
              allErrorResponses: allErrorResponses
            });
          }
          counter++;
        });
      })(i);

      }});
  }

  _computeUploadProgress(set, index, requestData) {
    if (!requestData) {
      this._setProgressProps(set, index, '', '');
    } else {
      const progressValue = `${requestData.loaded * 100 / requestData.total}`;
      const progressMsg = `${Math.round(requestData.loaded/1024)} kb of ${Math.round(requestData.total/1024)} kb`;
      this._setProgressProps(set, index, progressValue, progressMsg);
    }
  }

  _setProgressProps(set, index, progressValue, progressMsg){
    set(['_filenames', index, 'uploadProgressValue'], progressValue);
    set(['_filenames', index, 'uploadProgressMsg'], progressMsg);
  }

  _shouldDisableUploadBtn(readonly, uploadInProgress) {
    return readonly || uploadInProgress;
  }

  _thereAreFilesSelected(_filenames) {
    return (_filenames && _filenames.length);
  }

  _cancelUpload() {
    let activeReqKeys = Object.keys(getActiveXhrRequests());
    this._filenames = this._filenames.filter(f => activeReqKeys.indexOf(f.filename) < 0);

    abortActiveRequests(activeReqKeys);
    this.uploadInProgress = false;
    this.resetRawFiles();

    if (this._filenames.length) {
      setTimeout(() => {
        this._clearDisplayOfUploadedFiles.bind(this);
      }, 2000);
    }
  }

  resetRawFiles() {
    this.rawFiles = [];
    this.$.fileInput.value = null;
  }
}

window.customElements.define(EtoolsUploadMulti.is, EtoolsUploadMulti);
