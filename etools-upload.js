import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import '@polymer/polymer/lib/elements/dom-if.js';
import '@polymer/paper-button/paper-button.js';
import '@polymer/iron-icon/iron-icon.js';
import '@polymer/iron-icons/iron-icons.js';
import '@polymer/paper-input/paper-input-container.js';
import '@polymer/paper-input/paper-input-error.js';
import '@polymer/iron-flex-layout/iron-flex-layout.js';
import '@polymer/paper-spinner/paper-spinner.js';
import './common-styles.js';
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
    return html`
    <style include="common-styles">


      .file-icon {
        padding-right: 8px;
        min-width: 22px;
        min-height: 22px
      }

      .filename-container {
        @apply --layout-horizontal;
        @apply --layout-center;
        @apply --layout-flex;
        border-bottom: 1px solid grey;
        margin-right: 8px;
        min-width: 145px;
        overflow-wrap: break-word;
      }

      .download-button {
        --paper-button: {
          @apply --layout-center-justified;
          padding: 0 0;
        };
      }
      .dw-icon {
        margin-right: 8px;
      }
      .file-actions paper-button {
        vertical-align: middle;
      }
      .filename-and-actions-container {
        @apply --layout-horizontal;
        @apply --layout-wrap;
      }
      .filename {
        overflow: hidden;
        text-overflow: ellipsis;
      }

    </style>

    <paper-input-container always-float-label="" disabled\$="[[disabled]]" invalid\$="[[invalid]]">

      <label slot="label" id="element-label" hidden\$="[[!_showLabel(label)]]" aria-hidden="true">[[label]]</label>

      <div slot="input">
        <paper-button class="upload-button" on-tap="_openFileChooser" title="[[uploadBtnLabel]]" disabled\$="[[readonly]]" hidden\$="[[_thereIsAFileSelectedOrSaved(_filename)]]">
                      <iron-icon icon="file-upload"></iron-icon>
                      [[uploadBtnLabel]]
        </paper-button>

        <div class="filename-and-actions-container">
          <div class="filename-container" hidden\$="[[!_thereIsAFileSelectedOrSaved(_filename)]]">
            <iron-icon class="file-icon" icon="attachment"></iron-icon>
            <span class="filename" title="[[_filename]]">[[_filename]]</span>
          </div>
          <div class="upload-status">
            <paper-spinner id="uploadingSpinner" hidden\$="[[!uploadInProgress]]" active="[[uploadInProgress]]"></paper-spinner>
            <iron-icon title="Uploaded successfuly!" icon="done" hidden\$="[[!success]]"></iron-icon>
            <iron-icon icon="error-outline" hidden\$="[[!fail]]"></iron-icon>
          </div>

          <!-- File actions -->
          <div class="file-actions">
            <paper-button class="download-button" on-tap="_downloadFile" disabled="[[!_showDownloadBtn(fileUrl)]]" hidden\$="[[!_showDownloadBtn(fileUrl)]]" title="Download">
              <iron-icon icon="cloud-download" class="dw-icon"></iron-icon>
              Download
            </paper-button>

            <paper-button class="change-button" on-tap="_openFileChooser" disabled\$="[[!_showChange(readonly, _filename, uploadInProgress)]]" hidden\$="[[!_showChange(readonly, _filename, uploadInProgress)]]">
              Change
            </paper-button>

            <paper-button class="delete-button" on-tap="_deleteFile" disabled\$="[[readonly]]" hidden\$="[[_hideDeleteBtn(readonly, _filename, hideDeleteBtn, uploadInProgress)]]">
              Delete
            </paper-button>

            <paper-button class="delete-button" on-tap="_cancelUpload" disabled\$="[[!uploadInProgress]]" hidden\$="[[!uploadInProgress]]">
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
      hideDeleteBtn: {
        type: Boolean,
        value: false
      },
      disabled: Boolean,
      invalid: Boolean,
      errorMessage: String,
      success: {
        type: Boolean,
        value: false
      },
      fail: {
        type: Boolean,
        value: false
      }
    };
  }

  _thereIsAFileSelectedOrSaved(_filename) {
    return !!_filename;
  }

  _fileSelected(e) {
    let file = e.target.files ? e.target.files[0] : null;
    if (!file) {
      return;
    }

    this.resetStatus();
    this.resetValidations();

    this._filename = file.name;
    this.rawFile = file;

    if (this.autoUpload) {
     this._handleUpload();
    }
  }

  _handleUpload() {
    this.uploadInProgress = true;

    this.upload(this.rawFile).then((response) => {
        this.success = true;
        this.uploadInProgress = false;
        this.resetRawFile();

        this.fireEvent('upload-finished', {success: response});
      }).catch((err) => {
        if (err.message && err.message === 'Request aborted.') {
          return;
        }
        this.fail = true;
        this.setInvalid("Error uploading file: " +  error.message);
        this.uploadInProgress = false;

        this.fireEvent('upload-finished', {error: error});
      });
  }

  setInvalid(errMsg) {
    this.errorMessage = errMsg;
    this.invalid = true;
  }

  resetValidations() {
    this.invalid = false;
    this.errorMessage = null;
  }

  resetStatus() {
    this.success = null;
    this.fail = null;
  }

  _fileUrlChanged(fileUrl) {
    this._filename = this.getFilenameFromURL(fileUrl);
  }

  getFilenameFromURL(url) {
    if (!url) {
      return '';
    }
    return url.split('?')[0].split('/').pop();
  }

  _showDownloadBtn(fileUrl) {
    return !!fileUrl;
  }

  _showChange(readonly, _filename, uploadInProgress) {
    if (uploadInProgress) {
      return false;
    }
    return !readonly && !!_filename
  }

  _hideDeleteBtn(readonly, filename, hideDeleteBtn, uploadInProgress) {
    if (this.readonly || !this._filename || uploadInProgress) {
      return true;
    }

    return this.hideDeleteBtn;
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
     this._filename = null;
    } else {
      this.dispatchEvent(new CustomEvent('delete-file', {detail: {file: this.files[0], index: 0}, bubbles: true, composed: true }));
    }

    this.resetStatus();
    this.resetValidations();
  }

  resetRawFile() {
    this.rawFile = null;
    this.$.fileInput.value = null;
  }

  _downloadFile(e) {
    if (!this.fileUrl) {
      return;
    }

    var a = this.$.downloader;
    a.href = this.fileUrl;
    a.download = this._filename;

    //* a.click() doesn't work in ff, edge *
    a.dispatchEvent(new MouseEvent('click', {bubbles: true, cancelable: true, view: window}));

   // window.URL.revokeObjectURL(this.fileUrl); is this neccessary?
  }
}

window.customElements.define(EtoolsUpload.is, EtoolsUpload);
