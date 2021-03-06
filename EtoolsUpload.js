import {PolymerElement, html} from '@polymer/polymer';
import '@polymer/polymer/lib/elements/dom-if.js';
import '@polymer/paper-button/paper-button.js';
import '@polymer/iron-icon/iron-icon.js';
import '@polymer/iron-icons/iron-icons.js';
import '@polymer/paper-input/paper-input-container.js';
import '@polymer/paper-input/paper-input-error.js';
import '@polymer/paper-spinner/paper-spinner.js';
import '@polymer/paper-progress/paper-progress.js';
import {CommonStyles} from "./common-styles.js";

import {CommonMixin} from './common-mixin.js';
import {RequestHelperMixin} from './request-helper-mixin.js';
import {abortActiveRequests} from '@unicef-polymer/etools-ajax/upload-helper';

/**
 * `etools-upload`
 * Use to upload files
 *
 * @customElement
 * @polymer
 * @demo demo/index.html
 */
export class EtoolsUpload extends RequestHelperMixin(CommonMixin(PolymerElement)) {
  static get template() {
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
        padding-right: 8px;
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

    </style>

    <paper-input-container always-float-label="" disabled$="[[disabled]]" invalid$="[[invalid]]">

      <label slot="label" id="element-label" hidden$="[[!_showLabel(label)]]" aria-hidden="true">[[label]]</label>

      <div slot="input">
        <paper-button class="upload-button" on-tap="_openFileChooser" title="[[uploadBtnLabel]]" disabled$="[[readonly]]" hidden$="[[_thereIsAFileSelectedOrSaved(_filename)]]">
                      <iron-icon icon="file-upload"></iron-icon>
                      [[uploadBtnLabel]]
        </paper-button>

        <div class="filename-and-actions-container">
          <div class="filename-container" hidden$="[[!_thereIsAFileSelectedOrSaved(_filename)]]">
              <div class="filename-row">
                <iron-icon class="file-icon" icon="attachment"></iron-icon>
                <span class="filename" title="[[_filename]]">[[_filename]]</span>
              </div>
              <template is="dom-if" if="[[uploadProgressValue]]">
                <div class='progress-container'>
                  <paper-progress value="{{uploadProgressValue}}"></paper-progress>
                  <span>{{uploadProgressMsg}}</span>
                <div>
              </template>
          </div>
          <div class="upload-status">
            <iron-icon title="Uploaded successfuly!" icon="done" hidden$="[[!success]]"></iron-icon>
            <iron-icon icon="error-outline" hidden$="[[!fail]]"></iron-icon>
          </div>

          <!-- File actions -->
          <div class="file-actions">
            <paper-button class="download-button" on-tap="_downloadFile" disabled="[[!_showDownloadBtn(fileUrl)]]" hidden$="[[!_showDownloadBtn(fileUrl)]]" title="Download">
              <iron-icon icon="cloud-download" class="dw-icon"></iron-icon>
              Download
            </paper-button>

            <paper-button class="change-button" on-tap="_openFileChooser" disabled$="[[!_showChange(readonly, _filename, uploadInProgress)]]" hidden$="[[!_showChange(readonly, _filename, uploadInProgress)]]">
              Change
            </paper-button>

            <paper-button class="delete-button" on-tap="_deleteFile" disabled$="[[readonly]]" hidden$="[[!_showDeleteBtn(readonly, _filename, showDeleteBtn, uploadInProgress)]]">
              Delete
            </paper-button>

            <paper-button class="delete-button" on-tap="_cancelUpload" disabled$="[[!uploadInProgress]]" hidden$="[[!uploadInProgress]]">
              Cancel
            </paper-button>
          </div>
          <!-- ------------------ -->
        </div>

        <!-- Props -->
        <input hidden="" type="file" id="fileInput" on-change="_fileSelected" accept="{{accept}}">

        <a id="downloader" hidden=""></a>
      </div>

      <template is="dom-if" if="[[invalid]]">
        <paper-input-error aria-live="assertive" slot="add-on">[[errorMessage]]</paper-input-error>
      </template>

    </paper-input-container>
`;
  }

  static get is() {return 'etools-upload';}
  static get properties() {
    return {
      uploadBtnLabel: {
        type: String,
        value: 'Upload file'
      },
      alwaysFloatLabel: {
        type: Boolean,
        value: true
      },
      fileUrl: {
        type: String,
        value: null,
        observer: '_fileUrlChanged'
      },
      _filename: {
        type: String,
        value: null
      },
      rawFile: {
        type: Object,
        value: null
      },
      showDeleteBtn: {
        type: Boolean,
        value: true
      },
      errorMessage: String,
      originalErrorMessage: String,
      serverErrorMsg: String,
      success: {
        type: Boolean,
        value: false
      },
      fail: {
        type: Boolean,
        value: false
      },
      showChange: {
        type: Boolean,
        value: true
      },
      allowMultilineFilename: {
        type: Boolean,
        value: false,
        reflectToAttribute: true
      },
      uploadProgressValue: {
        type: String,
        value: ''
      },
      uploadProgressMsg: {
        type: String,
        value: ''
      }
    };
  }

  static get observers() {
    return [
      'autoValidateHandler(rawFile, fileUrl)',
      '_invalidChanged(invalid)'
    ];
  }

  connectedCallback() {
    super.connectedCallback();
    this.set('originalErrorMessage', this.errorMessage);
  }

  _thereIsAFileSelectedOrSaved(_filename) {
    return !!_filename;
  }

  _fileSelected(e) {
    let file = e.target.files ? e.target.files[0] : null;
    if (!file) {
      return;
    }

    this._fireChangeFileEventIfApplicable();

    this.resetStatus();
    this.resetValidations();

    this._filename = file.name;
    this.rawFile = file;

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

  _handleUpload() {
    /**
     * Doing the extra validFileType validation because `accept` functionality can be bypassed
     * by selecting All Files from the File selection dialog
     */
    if (this.accept && !this.validFileType(this.rawFile.name)) {
      return;
    }
    this.uploadInProgress = true;
    this.fireEvent('upload-started');

    this.uploadRawFile(this.rawFile, this.rawFile.name, this.setUploadProgress.bind(this)).then((response) => {
      this.success = true;
      this.uploadInProgress = false;
      this.fireEvent('upload-finished', {success: response});
      setTimeout(() => {
        this.resetRawFile();
        this.resetUploadProgress();
      }, 10);
    }).catch((err) => {
      this.fail = true;
      this.serverErrorMsg = 'Error uploading file: ' + this.prepareErrorMessage(err);
      this.setInvalid(true, this.serverErrorMsg);
      this.uploadInProgress = false;
      this.resetUploadProgress();
      this.fireEvent('upload-finished', {error: err});
    });
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
      this.uploadProgressMsg = `${Math.round(requestData.loaded/1024)} kb of ${Math.round(requestData.total/1024)} kb`;
      this.uploadProgressValue = `${requestData.loaded * 100 / requestData.total}`;
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
    return url.split('?')[0].split('/').pop();
  }

  _showDownloadBtn(fileUrl) {
    return !!fileUrl && isNaN(fileUrl);
  }

  _showChange(readonly, _filename, uploadInProgress, showChange) {
    return (!readonly && _filename && !uploadInProgress) || showChange;
  }

  _showDeleteBtn(readonly, _filename, showDeleteBtn, uploadInProgress) {
    return (!readonly && _filename && !uploadInProgress && showDeleteBtn);
  }

  _cancelUpload() {
    abortActiveRequests();

    this.setProperties({
      uploadInProgress: false,
      _filename: null
    });

    this.resetRawFile();
  }

  _deleteFile(e) {
    if (this.rawFile) {
      this.resetRawFile();
    }
    this._filename = null;
    this.resetStatus();
    // TODO: should delete req be implemented here?
    this.fireEvent('delete-file', {file: this.fileUrl});
    this.fileUrl = null;
  }

  resetRawFile() {
    this.rawFile = null;
    this.$.fileInput.value = null;
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

      if ((!this.rawFile && !this.fileUrl)) {
        valid = false;
        errMsg = 'This field is required';
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
    if (!this.invalid) {
      if (this.fail) {// clean up after a failed upload
        this._filename = null;
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
    this.setInvalid(true, 'Please change file. Accepted file types: ' + this.accept);
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
    return fileName.slice((fileName.lastIndexOf(".") - 1 >>> 0) + 2);
  }
}
