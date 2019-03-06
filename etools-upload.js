import { PolymerElement, html } from '@polymer/polymer';
import '@polymer/polymer/lib/elements/dom-if.js';
import '@polymer/paper-button/paper-button.js';
import '@polymer/iron-icon/iron-icon.js';
import '@polymer/iron-icons/iron-icons.js';
import '@polymer/paper-input/paper-input-container.js';
import '@polymer/paper-input/paper-input-error.js';
import '@polymer/iron-flex-layout/iron-flex-layout.js';
import '@polymer/paper-spinner/paper-spinner.js';
import {CommonStyles} from "./common-styles.js";

import { CommonMixin } from './common-mixin.js';
import { RequestHelper } from './request-helper.js';
/**
 * `etools-upload`
 * Use to upload files
 *
 * @customElement
 * @polymer
 * @demo demo/index.html
 */
class EtoolsUpload extends RequestHelper(CommonMixin(PolymerElement)) {
  static get template() {
    // language=HTML
    return html`
        ${CommonStyles}
    <style>

      #input-main-content {
        @apply --layout-horizontal;
        @apply --layout-center;
      }
      
      .filename-and-actions-container {
        @apply --layout-horizontal;
        @apply --layout-flex;
        max-width: 100%;
      }

      .file-icon {
        padding-right: 8px;
        color: var(--secondary-text-color, rgba(0, 0, 0, 0.54));
      }

      .filename-container {
        @apply --layout-horizontal;
        @apply --layout-center;
        border-bottom: 1px solid var(--secondary-text-color, rgba(0, 0, 0, 0.54));
        margin-right: 8px;
        min-width: 145px;
        overflow-wrap: break-word;
        font-size: 16px;
      }
      
      .filename {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      
      :host([readonly]) .filename-container {
        border-bottom: none;
      }
      
      :host([disabled]) .filename-container {
        border-bottom: 1px dashed var(--secondary-text-color, rgba(0, 0, 0, 0.54));
      }

      .download-button {
        @apply --layout-center-justified;
        padding: 0 0;
        margin-left: 8px;
        color: var(--etools-upload-primary-color, var(--primary-color));
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
            <iron-icon class="file-icon" icon="attachment"></iron-icon>
            <span class="filename" title="[[_filename]]">[[_filename]]</span>
          </div>
          <div class="upload-status">
            <paper-spinner id="uploadingSpinner" hidden$="[[!uploadInProgress]]" active="[[uploadInProgress]]"></paper-spinner>
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

  static get is() { return 'etools-upload'; }
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
      }
    };
  }

  static get observers() {
    return [
      'autoValidateHandler(rawFile, fileUrl)'
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
    this.uploadInProgress = true;
    this.fireEvent('upload-started');

    this.upload(this.rawFile).then((response) => {
      this.success = true;
      this.uploadInProgress = false;
      this.resetRawFile();
      this.fireEvent('upload-finished', {success: response});
    }).catch((err) => {
      this.fail = true;
      this.serverErrorMsg = 'Error uploading file: ' + err.message;
      this.setInvalid(true, this.serverErrorMsg);
      this.uploadInProgress = false;
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
    this.abortActiveRequests();

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
      const uploadReqFailed = this.rawFile instanceof File && this.fail === true;
      if ((!this.rawFile && !this.fileUrl) || uploadReqFailed) {
        valid = false;
      }
      if (uploadReqFailed) {
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
    }
    if (this.autoValidate) {
      this.validate();
    }
  }
}

window.customElements.define(EtoolsUpload.is, EtoolsUpload);
