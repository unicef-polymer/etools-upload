import {LitElement, html} from 'lit-element';
import '@polymer/paper-button/paper-button.js';
import '@polymer/iron-icon/iron-icon.js';
import '@polymer/iron-icons/iron-icons.js';
import '@polymer/paper-input/paper-input-container.js';
import '@polymer/paper-input/paper-input-error.js';
import '@polymer/paper-spinner/paper-spinner.js';
import '@polymer/paper-progress/paper-progress.js';
import {CommonStyles} from './common-styles.js';

import {CommonMixin} from './common-mixin.js';
import {RequestHelperMixin} from './request-helper-mixin.js';
import {abortActiveRequests} from '@unicef-polymer/etools-ajax/upload-helper';
import {OfflineMixin} from './offline/offline-mixin';
import {getBlob, getFileUrl} from './offline/file-conversion';
import {storeFileInDexie} from './offline/dexie-operations';
import {getTranslation} from './translate.js';

/**
 * `etools-upload`
 * Use to upload files
 *
 * @customElement
 * @polymer
 * @demo demo/index.html
 */
export class EtoolsUpload extends OfflineMixin(RequestHelperMixin(CommonMixin(LitElement))) {
  render() {
    // language=HTML
    return html`
      ${CommonStyles}
      <style>
        #input-main-content {
          display: flex;
          flex-direction: row;
          align-items: center;
        }

        .filename-and-actions-container {
          display: flex;
          flex-direction: row;
          max-width: 100%;
        }

        .file-icon {
          padding-inline-end: 8px;
          color: var(--secondary-text-color, rgba(0, 0, 0, 0.54));
        }

        .filename-row {
          display: flex;
          flex-direction: row;
          align-items: center;
          border-bottom: 1px solid var(--secondary-text-color, rgba(0, 0, 0, 0.54));
        }

        .filename {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        :host([readonly]) .filename-row {
          border-bottom: none;
        }

        :host([disabled]) .filename-row {
          border-bottom: 1px dashed var(--secondary-text-color, rgba(0, 0, 0, 0.54));
        }

        .download-button {
          justify-content: center;
          padding: 0 0;
          margin-left: 8px;
          color: var(--etools-upload-primary-color, var(--primary-color));
        }

        .filename-container {
          display: flex;
          flex-direction: column;
          margin-right: 8px;
          min-width: 145px;
          overflow-wrap: break-word;
          font-size: 16px;
        }

        .progress-container {
          display: flex;
          flex-direction: column;
          flex-wrap: nowrap;
          width: 100%;
        }

        paper-progress {
          --paper-progress-active-color: var(--primary-color);
          width: 100%;
        }

        .progress-container span {
          font-size: 11px;
          margin: 0 auto;
        }

        .dw-icon {
          margin-right: 8px;
        }

        .change-button {
          color: var(--secondary-text-color, rgba(0, 0, 0, 0.54));
        }

        .file-actions paper-button {
          vertical-align: middle;
        }

        .upload-button[disabled] {
          justify-content: flex-start;
        }
      </style>

      <paper-input-container
        ?always-float-label="${this._showLabel(this.label)}"
        ?no-label-float="${!this._showLabel(this.label)}"
        ?disabled="${this.disabled}"
        ?invalid="${this.invalid}"
      >
        <label slot="label" id="element-label" ?hidden="${!this._showLabel(this.label)}" aria-hidden="true"
          >${this.label}</label
        >

        <div slot="input">
          <paper-button
            class="upload-button"
            @tap="${this._openFileChooser}"
            title="${this.uploadBtnLabel || getTranslation(this.language, 'UPLOAD_FILE')}"
            ?disabled="${this.readonly}"
            ?hidden="${this._thereIsAFileSelectedOrSaved(this._filename)}"
          >
            <span ?hidden="${this.readonly}">
              <iron-icon icon="file-upload"></iron-icon>
              ${this.uploadBtnLabel || getTranslation(this.language, 'UPLOAD_FILE')}
            </span>
            <label ?hidden="${!this.readonly}">—</label>
          </paper-button>

          <div class="filename-and-actions-container">
            <div class="filename-container" ?hidden="${!this._thereIsAFileSelectedOrSaved(this._filename)}">
              <div class="filename-row">
                <iron-icon class="file-icon" icon="attachment"></iron-icon>
                <span class="filename" title="${this._filename}">${this._filename}</span>
              </div>
              ${this.uploadProgressValue
                ? html`
                    <div class="progress-container">
                      <paper-progress .value="${this.uploadProgressValue}"></paper-progress>
                      <span>${this.uploadProgressMsg}</span>
                      <div></div>
                    </div>
                  `
                : ''}
            </div>
            <div class="upload-status">
              <iron-icon
                title="${getTranslation(this.language, 'UPLOADED_SUCCESSFULY')}"
                icon="done"
                ?hidden="${!this.success}"
              ></iron-icon>
              <iron-icon icon="error-outline" ?hidden="${!this.fail}"></iron-icon>
            </div>

            <!-- File actions -->
            <div class="file-actions">
              <paper-button
                class="download-button"
                @tap="${this._downloadFile}"
                ?disabled="${!this._showDownloadBtn(this.fileUrl)}"
                ?hidden="${!this._showDownloadBtn(this.fileUrl)}"
                title="${getTranslation(this.language, 'DOWNLOAD')}"
              >
                <iron-icon icon="cloud-download" class="dw-icon"></iron-icon>
                ${getTranslation(this.language, 'DOWNLOAD')}
              </paper-button>

              <paper-button
                class="change-button"
                @tap="${this._changeFile}"
                ?disabled="${!this._showChange(this.readonly, this._filename, this.uploadInProgress)}"
                ?hidden="${!this._showChange(this.readonly, this._filename, this.uploadInProgress)}"
              >
                ${getTranslation(this.language, 'CHANGE')}
              </paper-button>

              <paper-button
                class="delete-button"
                @tap="${this._deleteFile}"
                ?disabled="${this.readonly}"
                ?hidden="${!this._showDeleteBtn(
                  this.readonly,
                  this._filename,
                  this.showDeleteBtn,
                  this.uploadInProgress
                )}"
              >
                ${getTranslation(this.language, 'DELETE')}
              </paper-button>

              <paper-button
                class="delete-button"
                @tap="${this._cancelUpload}"
                ?disabled="${!this._showCancelBtn(this.uploadInProgress, this.fileUrl, this.fail)}"
                ?hidden="${!this._showCancelBtn(this.uploadInProgress, this.fileUrl, this.fail)}"
              >
                ${getTranslation(this.language, 'CANCEL')}
              </paper-button>
            </div>
            <!-- ------------------ -->
          </div>

          <!-- Props -->
          <input hidden="" type="file" id="fileInput" @change="${this._fileSelected}" .accept="${this.accept}" />

          <a id="downloader" hidden=""></a>
        </div>

        ${this.invalid
          ? html`<paper-input-error aria-live="assertive" slot="add-on">${this.errorMessage}</paper-input-error>`
          : ''}
      </paper-input-container>
    `;
  }

  static get is() {
    return 'etools-upload';
  }

  static get properties() {
    return {
      uploadBtnLabel: {
        type: String,
        reflect: true,
        attribute: 'upload-btn-label'
      },
      alwaysFloatLabel: {
        type: Boolean,
        reflect: true,
        attribute: 'always-float-label'
      },
      fileUrl: {
        type: String,
        reflect: true,
        attribute: 'file-url'
      },
      _cancelTriggered: {
        type: Boolean
      },
      _filename: String,
      rawFile: {
        type: Object,
        attribute: 'raw-file'
      },
      showDeleteBtn: {
        type: Boolean,
        reflect: true,
        attribute: 'show-delete-btn'
      },
      originalErrorMessage: {
        type: String,
        attribute: 'original-error-message'
      },
      serverErrorMsg: {
        type: String,
        attribute: 'server-error-msg'
      },
      success: {
        type: Boolean,
        reflect: true
      },
      fail: {
        type: Boolean,
        reflect: true
      },
      showChange: {
        type: Boolean,
        reflect: true,
        attribute: 'show-change'
      },
      allowMultilineFilename: {
        type: Boolean,
        reflect: true,
        attribute: 'allow-multiline-filename'
      },
      uploadProgressValue: {
        type: String,
        reflect: true,
        attribute: 'upload-progress-value'
      },
      uploadProgressMsg: {
        type: String,
        reflect: true,
        attribute: 'upload-progress-msg'
      },
      /* Needed for Change functionality,
       * to restore previous value on Cancel
       */
      _savedFileUrl: {
        type: String
      },
      language: {
        type: String
      }
    };
  }

  set fileUrl(url) {
    // previous is unsaved (number or null),
    // incomming is a valid url of an uploaded and SAVED file
    if (!isNaN(this._fileUrl) && isNaN(url)) {
      this._savedFileUrl = null;
    }
    this._fileUrl = url;
    this._fileUrlChanged(url);
    this.autoValidateHandler();
  }

  get fileUrl() {
    return this._fileUrl;
  }

  set rawFile(file) {
    this._rawFile = file;
    this.autoValidateHandler();
  }

  get rawFile() {
    return this._rawFile;
  }

  set uploadedFileInfo(info) {
    if (!info) {
      return;
    }
    if (info.url) {
      this._fileUrl = info.url;
    }
    if (info.filename) {
      this._filename = info.filename;
    }
    this.requestUpdate();
  }

  constructor() {
    super();

    if (!this.language) {
      this.language = window.localStorage.defaultLanguage || 'en';
    }
    this.handleLanguageChange = this.handleLanguageChange.bind(this);

    this.initializeProperties();
  }

  initializeProperties() {
    this.alwaysFloatLabel = true;
    this._fileUrl = null;
    this._filename = null;
    this._rawFile = null;
    this._cancelTriggered = null;
    this.showDeleteBtn = true;
    this.success = false;
    this.fail = false;
    this.showChange = true;
    this.allowMultilineFilename = false;
    this.uploadProgressValue = '';
    this.uploadProgressMsg = '';
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

  _thereIsAFileSelectedOrSaved(_filename) {
    return !!_filename;
  }

  _fileSelected(e) {
    const file = e.target.files ? e.target.files[0] : null;
    if (!file) {
      return;
    }

    this._fireChangeFileEventIfApplicable();

    this.resetStatus();
    this.resetValidations();

    this._filename = file.name;
    this.rawFile = file;
    e.target.value = null;

    if (this.autoUpload) {
      this._handleUpload();
    }
  }

  _fireChangeFileEventIfApplicable() {
    if (this.fileUrl && !isNaN(this.fileUrl)) {
      // if fileUrl is a number , then the previous upload was not saved
      this.fireEvent('change-unsaved-file');
    }
  }

  async _handleUpload() {
    /**
     * Doing the extra validFileType validation because `accept` functionality can be bypassed
     * by selecting All Files from the File selection dialog
     */
    if (this.accept && !this.validFileType(this.rawFile.name)) {
      return;
    }
    this._cancelTriggered = false;
    this.uploadInProgress = true;
    this.fireEvent('upload-started');
    if (this.activateOffline && navigator.onLine === false) {
      const response = await this.saveFileInIndexedDb(this.rawFile);
      this.uploadInProgress = false;
      this.fireEvent('upload-finished', response);
      setTimeout(() => {
        this.resetRawFile();
        this.resetUploadProgress();
      }, 10);
      return;
    }

    this.uploadRawFile(this.rawFile, this.rawFile.name, this.setUploadProgress.bind(this))
      .then((response) => {
        this.success = true;
        this.uploadInProgress = false;
        this.fireEvent('upload-finished', {success: response});
        setTimeout(() => {
          this.resetRawFile();
          this.resetUploadProgress();
        }, 10);
      })
      .catch((err) => {
        if (!this._cancelTriggered) {
          this.fail = true;
          const errorMessage = this.prepareErrorMessage(this.language, err);
          this.serverErrorMsg =
            getTranslation(this.language, 'ERROR_UPLOADING') + (errorMessage ? ': ' + errorMessage : '');
          this.setInvalid(true, this.serverErrorMsg);
        } else {
          this.serverErrorMsg = getTranslation(this.language, 'UPLOAD_CANCELED');
          this.setInvalid(false, this.serverErrorMsg);
        }

        this.fireEvent('upload-finished', {error: err});

        this._cancelTriggered = false;
        this.uploadInProgress = false;
        this.resetUploadProgress();
      });
  }

  async saveFileInIndexedDb(file) {
    const fileInfo = this.getFileInfo(file);
    const blob = await getBlob(getFileUrl(file));
    const fileInfoForDb = JSON.parse(JSON.stringify(fileInfo));
    fileInfoForDb.binaryData = blob;
    try {
      await storeFileInDexie(fileInfoForDb);
      this.success = true;
      return {success: fileInfo};
    } catch (err) {
      this.fail = true;
      return {error: err};
    }
  }

  setInvalid(invalid, errMsg) {
    if (typeof errMsg === 'string') {
      this.errorMessage = errMsg;
    }
    this.invalid = invalid;
  }

  resetValidations() {
    this.invalid = false;
    this.errorMessage = null;
  }

  resetStatus() {
    this.success = null;
    this.fail = null;
    this.serverErrorMsg = null;
  }

  setUploadProgress(requestData) {
    if (!requestData) {
      this.uploadProgressValue = '';
    } else {
      this.uploadProgressMsg = `${Math.round(requestData.loaded / 1024)} kb of ${Math.round(
        requestData.total / 1024
      )} kb`;
      this.uploadProgressValue = `${(requestData.loaded * 100) / requestData.total}`;
    }
  }

  resetUploadProgress() {
    this.uploadProgressValue = '';
    this.uploadProgressMsg = '';
  }

  _fileUrlChanged(fileUrl) {
    if (fileUrl && !isNaN(fileUrl)) {
      // fileUrl is a number after the upload is finished
      // and becomes an url after the number is saved on the object=intervention, agreement etc
      return;
    }
    this.resetStatus();
    this._filename = this.getFilenameFromURL(fileUrl);
  }

  getFilenameFromURL(url) {
    if (!url) {
      return '';
    }
    // after upload, url might be a number, need to convert
    return String(url).split('?')[0].split('/').pop();
  }

  _showDownloadBtn(fileUrl) {
    return !!fileUrl && isNaN(fileUrl);
  }

  _showChange(readonly, _filename, uploadInProgress, showChange) {
    return (!readonly && _filename && !uploadInProgress) || showChange;
  }

  _showDeleteBtn(readonly, _filename, showDeleteBtn, uploadInProgress) {
    return !readonly && _filename && !uploadInProgress && showDeleteBtn;
  }

  _showCancelBtn(uploadInProgress, fileUrl, fail) {
    return uploadInProgress || (fileUrl && fail);
  }

  _cancelUpload() {
    this._resetFilename();
    this._cancelTriggered = true;

    if (this.uploadInProgress) {
      this.uploadInProgress = false;
      abortActiveRequests();
    }

    this.resetRawFile();
    this.resetValidations();
  }

  _deleteFile() {
    this.fileUrl = null;

    this.resetStatus();
    this._resetFilename();
    this.resetRawFile();

    this.fireEvent('delete-file', {file: this.fileUrl});
  }

  _changeFile() {
    this._savedFileUrl = isNaN(this.fileUrl) ? this.fileUrl : null;
    this._openFileChooser();
  }

  _resetFilename() {
    this._filename = this.fileUrl && isNaN(this.fileUrl) ? this.getFilenameFromURL(this.fileUrl) : null;
  }

  resetRawFile() {
    this.rawFile = null;
    this.shadowRoot.querySelector('#fileInput').value = null;
  }

  _downloadFile(e) {
    if (!this.fileUrl || !isNaN(this.fileUrl)) {
      return;
    }
    this.downloadFile(this._filename, this.fileUrl, this.openInNewTab);
  }

  validate() {
    let valid = true;
    let errMsg = this.originalErrorMessage;
    if (this.required) {
      const uploadRequestFailed = this.rawFile instanceof File && this.fail === true;

      if (!this.rawFile && !this.fileUrl) {
        valid = false;
        errMsg = getTranslation(this.language, 'REQUIRED_FIELD');
      }
      if (uploadRequestFailed) {
        valid = false;
        errMsg = this.serverErrorMsg;
      }
    }
    this.setInvalid(!valid, errMsg);
    return valid;
  }

  autoValidateHandler() {
    if (typeof this.fileUrl === 'undefined') {
      this.resetStatus();
      this.invalid = false;
      return;
    }
    if (this.autoValidate) {
      this.validate();
    }
  }

  _invalidChanged() {
    super._invalidChanged();
    if (!this.invalid) {
      if (this.fail) {
        // clean up after a failed upload
        this._resetFilename();
      }
      this.resetStatus();
      this.resetValidations();
    }
  }

  validFileType(fileName) {
    const acceptedExtensions = this.accept.split(',');
    const fileExtension = this._getFileExtension(fileName);
    if (acceptedExtensions.indexOf('.' + fileExtension) > -1) {
      return true;
    }
    this.setInvalid(true, `${getTranslation(this.language, 'PLEASE_CHANGE_FILE')}: ${this.accept}}`);
    return false;
  }

  /* This solution also handles some edge cases
  The return values of lastIndexOf for parameter 'filename' and '.hiddenfile' are -1 and 0 respectively.
  Zero-fill right shift operator(»>) will transform - 1 to 4294967295 and - 2 to 4294967294,
  here is one trick to insure the filename unchanged in those edge cases.
  String.prototype.slice() extracts file extension from the index that was calculated above.
  If the index is more than the length of the filename, the result is "".
  Example of return values:
  '' => ''
  'filename' => ''
  'filename.txt' => 'txt'
  '.hiddenfile' => ''
  'filename.with.many.dots.ext'	=> 'ext'*/
  _getFileExtension(fileName) {
    return fileName.slice(((fileName.lastIndexOf('.') - 1) >>> 0) + 2);
  }
}
