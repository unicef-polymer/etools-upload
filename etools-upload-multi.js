import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import '@polymer/polymer/lib/elements/dom-repeat.js';
import '@polymer/paper-button/paper-button.js';
import '@polymer/iron-icon/iron-icon.js';
import '@polymer/iron-icons/iron-icons.js';
import '@polymer/paper-input/paper-input-container.js';
import '@polymer/paper-input/paper-input-error.js';
import '@polymer/iron-flex-layout/iron-flex-layout.js';
import '@polymer/paper-spinner/paper-spinner.js';
import './common-styles.js';
import { CommonMixin } from './common-mixin.js';
import { RequestHelperMulti } from './request-helper-multi.js';
/**
 * `etools-upload-multi` Description
 *
 * @customElement
 * @polymer
 * @extends {Polymer.Element}
 */
class EtoolsUploadMulti extends RequestHelperMulti(CommonMixin(PolymerElement)) {
  static get template() {
    return html`
    <style include="common-styles">
      .upload-btn-and-actions {
        @apply --layout-horizontal;
        @apply --layout-wrap;
      }
    </style>

    <paper-input-container always-float-label="" disabled\$="[[disabled]]">

          <label slot="label" id="element-label" hidden\$="[[!_showLabel(label)]]" aria-hidden="true">[[label]]</label>

          <div slot="input">
            <div class="upload-btn-and-actions">
              <paper-button class="upload-button" on-tap="_openFileChooser" title="[[uploadBtnLabel]]" disabled\$="[[_shouldDisableUploadBtn(readonly, uploadInProgress)]]">
                            <iron-icon icon="file-upload"></iron-icon>
                            [[uploadBtnLabel]]
              </paper-button>

              <!-- File actions -->
              <div class="file-actions">
                  <!-- <paper-button class="download-button"
                      on-tap="_downloadFile"
                      disabled="[[!_showDownloadBtn(fileUrl)]]"
                      hidden\$="[[!_showDownloadBtn(fileUrl)]]"
                      title="Download">
                    <iron-icon icon="cloud-download" class="dw-icon"></iron-icon>
                    Download
                  </paper-button> -->

                  <!-- <paper-button class="change-button"
                      on-tap="_openFileChooser"
                      disabled\$="[[!_showChange(readonly, _filename, uploadInProgress)]]"
                      hidden\$="[[!_showChange(readonly, _filename, uploadInProgress)]]">
                    Change
                  </paper-button> -->

                  <!-- <paper-button class="delete-button"
                      on-tap="_deleteFile"
                      disabled\$="[[readonly]]"
                      hidden\$="[[_hideDeleteBtn(readonly, _filename, hideDeleteBtn, uploadInProgress)]]">
                    Delete
                  </paper-button> -->

                  <paper-button class="delete-button" on-tap="_cancelUpload" disabled\$="[[!uploadInProgress]]" hidden\$="[[!uploadInProgress]]">
                    Cancel
                  </paper-button>
                </div>
                <!-- ------------------ -->
              </div>

              <div class="filenames-container" hidden\$="[[!_thereAreFilesSelected(_filenames)]]">
                <template is="dom-repeat" items="{{_filenames}}" as="item">
                  <div>
                    <iron-icon class="file-icon" icon="attachment"></iron-icon>
                    <span class="file-name" title="[[item.filename]]">[[item.filename]]</span>
                    <paper-spinner id="uploadingSpinner" hidden\$="[[!item.uploadInProgress]]" active="[[item.uploadInProgress]]"></paper-spinner>
                    <iron-icon icon="done" hidden\$="[[!item.success]]"></iron-icon>
                    <iron-icon icon="error-outline" hidden\$="[[!item.fail]]"></iron-icon>
                  </div>
                </template>

              </div>


              <!-- Props -->
            <input hidden="" type="file" id="fileInput" on-change="_filesSelected" multiple="" accept="{{accept}}">

            <a id="downloader" hidden=""></a>
          </div>

      </paper-input-container>
`;
  }

  static get is() {
    return 'etools-upload-multi';
  }

  static get properties() {
    return {
      rawFiles: {
        type: Array,
        value: []
      },
      _filenames: {
        type: Array,
        value: []
      }
    };
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
        uploadInProgress: this.autoUpload
      });
    }
    return names;
  }

  _handleUpload(files) {
    this.uploadInProgress = true;
    if (this.endpointAcceptsMulti) {
      // we don't have this situation yet
    } else {
      this._uploadAllFilesSequentially(files, this.upload.bind(this), this.set.bind(this))
          .then((response) => {
            this.uploadInProgress = false;
            this.resetRawFiles();

            this.fireEvent('upload-finished', {
              success: response.allSuccessResponses,
              error: response.allErrorResponses
            });
          });
    }
  }

  _uploadAllFilesSequentially(files, upload, set) {
    return new Promise(function(resolve, reject) {
      let allSuccessResponses = [];
      let allErrorResponses = [];
      let i;
      let counter = 0;
      for (i = 0; i < files.length; i++) {
         upload(files[i], i).then((response) => {
          set(['_filenames', counter, 'uploadInProgress'], false);
          set(['_filenames', counter, 'success'], true);

          allSuccessResponses.push(response);

          if ((counter + 1) === files.length) {
            resolve({
              allSuccessResponses: allSuccessResponses,
              allErrorResponses: allErrorResponses
            });
          }
          counter++;
        }).catch((err) => {

          set(['_filenames', counter, 'uploadInProgress'], false);
          set(['_filenames', counter, 'fail'], true);

          allErrorResponses.push(err);

          if ((counter + 1) === files.length) {
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

  _shouldDisableUploadBtn(readonly, uploadInProgress) {
    return readonly || uploadInProgress;
  }

  _thereAreFilesSelected(_filenames) {
    return (_filenames && _filenames.length);
  }

  _cancelUpload() {
    this._cancelUpload = true;
    if (this.activeXhrRequest) {
      this.activeXhrRequest.abort();
    }

    this.setProperties({
      uploadInProgress: false,
      _filenames: []
    });

    this.resetRawFiles();
  }

  resetRawFiles() {
    this.rawFiles = [];
    this.$.fileInput.value = null;
  }
}

window.customElements.define(EtoolsUploadMulti.is, EtoolsUploadMulti);
