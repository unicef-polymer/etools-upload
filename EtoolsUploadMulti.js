import {html, LitElement} from 'lit-element';
import '@polymer/paper-button/paper-button.js';
import '@polymer/iron-icon/iron-icon.js';
import '@polymer/iron-icons/iron-icons.js';
import '@polymer/paper-input/paper-input-container.js';
import '@polymer/paper-input/paper-input-error.js';
import '@polymer/paper-progress/paper-progress.js';
import {CommonStyles} from './common-styles';
import {CommonMixin} from './common-mixin.js';
import {RequestHelperMulti} from './request-helper-multi.js';
import {getBlob, getFileUrl} from './offline/file-conversion';
import {storeFileInDexie} from './offline/dexie-operations';
import {abortActiveRequests, getActiveXhrRequests} from '@unicef-polymer/etools-ajax/upload-helper';
import {OfflineMixin} from './offline/offline-mixin';
import {getTranslation} from './translate';

export class EtoolsUploadMulti extends OfflineMixin(RequestHelperMulti(CommonMixin(LitElement))) {
  render() {
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
          <paper-button
            class="upload-button"
            @tap="${this._openFileChooser}"
            title="${this.uploadBtnLabel || getTranslation(this.language, 'UPLOAD_FILES')}"
            ?disabled="${this._shouldDisableUploadBtn(this.readonly, this.uploadInProgress)}"
          >
            <iron-icon icon="file-upload"></iron-icon>
            ${this.uploadBtnLabel || getTranslation(this.language, 'UPLOAD_FILES')}
          </paper-button>

          <div class="file-actions">
            <paper-button
              class="delete-button"
              @tap="${this._cancelUpload}"
              ?disabled="${!this.uploadInProgress}"
              ?hidden="${!this.uploadInProgress}"
            >
              <iron-icon icon="clear"></iron-icon>
              ${getTranslation(this.language, 'CANCEL')}
            </paper-button>
          </div>
        </div>

        <div class="filenames-container" ?hidden="${!this._thereAreFilesSelected(this._filenames)}">
          ${this._filenames.map(
            (item) => html`
              <div class="filename-line">
                <div class="filename-container">
                  <iron-icon class="file-icon" icon="attachment"></iron-icon>
                  <span class="filename" title="${item.filename}">${item.filename}</span>

                  <iron-icon
                    title="${getTranslation(this.language, 'UPLOADED_SUCCESSFULY')}"
                    icon="done"
                    ?hidden="${!item.success}"
                  ></iron-icon>
                  <iron-icon title="${getTranslation(this.language, 'UPLOAD_FAILED')}"
                  ?hidden="${!item.fail}"}"></iron-icon>
                </div>
                ${
                  item.uploadProgressValue
                    ? html`
                        <div class="progress-container">
                          <paper-progress .value="${item.uploadProgressValue}"></paper-progress>
                          <span>${item.uploadProgressMsg}</span>
                          <div></div>
                        </div>
                      `
                    : ''
                }
              </div>
            `
          )}
        </div>

        <!-- Props -->
        <input
          hidden=""
          type="file"
          id="fileInput"
          @change="${this._filesSelected}"
          multiple=""
          accept="${this.accept}"
        />

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
        reflect: true,
        attribute: 'upload-btn-label'
      },
      rawFiles: {
        type: Array,
        attribute: 'raw-files'
      },
      _filenames: Array,
      language: {
        type: String
      }
    };
  }

  constructor() {
    super();

    if (!this.language) {
      this.language = window.localStorage.defaultLanguage || 'en';
    }
    this.handleLanguageChange = this.handleLanguageChange.bind(this);

    this.rawFiles = [];
    this._filenames = [];
  }

  connectedCallback() {
    super.connectedCallback();

    document.addEventListener('language-changed', this.handleLanguageChange);
    this.originalErrorMessage = this.errorMessage;
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('language-changed', this.handleLanguageChange);
  }

  handleLanguageChange(e) {
    this.language = e.detail.language;
  }

  _filesSelected(e) {
    const files = e.target.files ? e.target.files : null;
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
    const names = [];
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
    const filesInfo = [];
    const errors = [];
    for (i = 0; i < files.length; i++) {
      const fileInfo = this.getFileInfo(files[i]);
      const blob = await getBlob(getFileUrl(files[i]));
      const fileInfoForDb = JSON.parse(JSON.stringify(fileInfo));
      fileInfoForDb.binaryData = blob;
      try {
        await storeFileInDexie(fileInfoForDb);
        filesInfo.push(fileInfo);
        this._updateFilename(i, {
          success: true,
          uploadInProgress: false
        });
      } catch (error) {
        errors.push(
          `${getTranslation(this.language, 'ERROR_SAVING_ATTACHMENT_INDEXDB').replace('{0}', fileInfo.filename)}`
        );
        this._updateFilename(i, {
          fail: true,
          uploadInProgress: false
        });
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
      const response = await this.saveFilesInIndexedDb(files);
      this.uploadInProgress = false;
      this.resetRawFiles();
      this.fireEvent('upload-finished', response);
      setTimeout(this._clearDisplayOfUploadedFiles.bind(this), 2000);
      return;
    }

    if (this.endpointAcceptsMulti) {
      // we don't have this situation yet
    } else {
      this._uploadAllFilesSequentially(files).then((response) => {
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

  _uploadAllFilesSequentially(files) {
    return new Promise((resolve) => {
      const allSuccessResponses = [];
      const allErrorResponses = [];
      let counter = 0;
      for (let index = 0; index < files.length; index++) {
        this.uploadRawFile(files[index], files[index].name, (data) => this._computeUploadProgress(index, data))
          .then((response) => {
            this._updateFilename(index, {
              success: true,
              uploadInProgress: false,
              uploadProgressValue: '',
              uploadProgressMsg: ''
            });

            allSuccessResponses.push(response);

            if (counter + 1 === files.length) {
              resolve({
                allSuccessResponses: allSuccessResponses,
                allErrorResponses: allErrorResponses
              });
            }
            counter++;
          })
          .catch((err) => {
            this._updateFilename(index, {
              fail: true,
              uploadInProgress: false,
              uploadProgressValue: '',
              uploadProgressMsg: ''
            });

            allErrorResponses.push(this.prepareErrorMessage(this.language, err));

            if (counter + 1 === files.length) {
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

  _computeUploadProgress(index, requestData) {
    if (!requestData) {
      this._updateFilename(index, {uploadProgressValue: '', uploadProgressMsg: ''});
    } else {
      const uploadProgressValue = `${(requestData.loaded * 100) / requestData.total}`;
      const uploadProgressMsg = `${Math.round(requestData.loaded / 1024)} kb of ${Math.round(
        requestData.total / 1024
      )} kb`;
      this._updateFilename(index, {uploadProgressValue, uploadProgressMsg});
    }
  }

  _updateFilename(index, mergeObj) {
    if (!this._filenames[index]) {
      return;
    }
    this._filenames[index] = Object.assign({}, this._filenames[index], mergeObj);
    this.requestUpdate();
  }

  _shouldDisableUploadBtn(readonly, uploadInProgress) {
    return readonly || uploadInProgress;
  }

  _thereAreFilesSelected(_filenames) {
    return _filenames && _filenames.length;
  }

  _cancelUpload() {
    const activeReqKeys = Object.keys(getActiveXhrRequests());
    this._filenames = this._filenames.filter((f) => activeReqKeys.indexOf(f.filename) < 0);

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
    this.shadowRoot.querySelector('#fileInput').value = null;
  }
}
