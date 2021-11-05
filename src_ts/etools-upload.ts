import {customElement, LitElement, TemplateResult, html, property} from 'lit-element';
import {CommonMixin} from './common-mixin';
import {CommonStyles} from './common-styles';
import {RequestHelperMixin} from './request-helper-mixin';

@customElement('etools-upload')
export class EtoolsUpload extends RequestHelperMixin(CommonMixin(LitElement)) {
  @property({type: String}) uploadBtnLabel: string = 'Upload file';
  @property({type: String}) _filename: string | null = null;
  @property({type: Boolean}) alwaysFloatLabel: boolean = true;
  @property({type: Boolean, attribute: 'show-delete-btn'}) showDeleteBtn: boolean = true;
  @property({type: String}) errorMessage: string = '';
  @property({type: String}) originalErrorMessage: string = '';
  @property({type: String}) serverErrorMsg: string = '';
  @property({type: Boolean}) success: boolean = false;
  @property({type: Boolean}) fail: boolean = false;
  @property({type: Boolean, attribute: 'show-change'}) showChange: boolean = true;
  @property({type: Boolean, reflect: true, attribute: 'allow-multiline-filename'}) allowMultilineFilename: boolean =
    false;
  @property({type: String}) uploadProgressValue: string = '';
  @property({type: String}) uploadProgressMsg: string = '';

  set fileUrl(fileUrl: string | number | undefined) {
    this._fileUrl = fileUrl;
    this.autoValidateHandler();
    if (fileUrl && !isNaN(fileUrl as number)) {
      // fileUrl is a number after the upload is finished
      // and becomes an url after the number is saved on the object=intervention, agreement etc
      return;
    }
    this.resetStatus();
    this._filename = this.getFilenameFromURL(fileUrl as string);
  }

  get fileUrl(): string | number | undefined {
    return this._fileUrl;
  }

  set invalid(invalid: boolean) {
    if (this._invalid === invalid) {
      return;
    }
    this._invalid = invalid;
    if (!invalid) {
      if (this.fail) {
        // clean up after a failed upload
        this._filename = null;
      }
      this.resetStatus();
      this.resetValidations();
    }
  }

  get invalid(): boolean {
    return this._invalid;
  }

  set rawFile(rawFile: any) {
    this._rawFile = rawFile;
    this.autoValidateHandler();
  }

  get rawFile(): any {
    return this._rawFile;
  }

  @property() private _invalid: boolean = false;
  @property() private _rawFile: any = null;
  private _fileUrl: string | number | undefined;

  render(): TemplateResult {
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

        .upload-button[disabled] {
          justify-content: flex-start;
        }
      </style>

      <paper-input-container always-float-label="" .disabled="${this.disabled}" .invalid="${this.invalid}">
        <label slot="label" id="element-label" ?hidden="${!this._showLabel(this.label)}" aria-hidden="true">
          ${this.label}
        </label>

        <div slot="input">
          <paper-button
            class="upload-button"
            @tap="${this._openFileChooser}"
            .title="${this.uploadBtnLabel}"
            .disabled="${this.readonly}"
            ?hidden="${this._thereIsAFileSelectedOrSaved(this._filename)}"
          >
            <span ?hidden="${this.readonly}">
              <iron-icon icon="file-upload"></iron-icon>
              ${this.uploadBtnLabel}
            </span>
            <label ?hidden="${!this.readonly}">—</label>
          </paper-button>

          <div class="filename-and-actions-container">
            <div class="filename-container" ?hidden="${!this._thereIsAFileSelectedOrSaved(this._filename)}">
              <div class="filename-row">
                <iron-icon class="file-icon" icon="attachment"></iron-icon>
                <span class="filename" ?title="${this._filename}">${this._filename}</span>
              </div>
              ${this.uploadProgressValue
                ? html`<div class="progress-container">
                    <paper-progress .value="${this.uploadProgressValue}"></paper-progress>
                    <span>${this.uploadProgressMsg}</span>
                    <div></div>
                  </div>`
                : ''}
            </div>
            <div class="upload-status">
              <iron-icon title="Uploaded successfuly!" icon="done" ?hidden="${!this.success}"></iron-icon>
              <iron-icon icon="error-outline" ?hidden="${!this.fail}"></iron-icon>
            </div>

            <!-- File actions -->
            <div class="file-actions">
              <paper-button
                class="download-button"
                @tap="${this._downloadFile}"
                .disabled="${!this._showDownloadBtn(this.fileUrl)}"
                ?hidden="${!this._showDownloadBtn(this.fileUrl)}"
                title="Download"
              >
                <iron-icon icon="cloud-download" class="dw-icon"></iron-icon>
                Download
              </paper-button>

              <paper-button
                class="change-button"
                @tap="${this._openFileChooser}"
                .disabled="${!this._showChange(this.readonly, this._filename, this.uploadInProgress)}"
                ?hidden="${!this._showChange(this.readonly, this._filename, this.uploadInProgress)}"
              >
                Change
              </paper-button>

              <paper-button
                class="delete-button"
                on-tap="_deleteFile"
                .disabled="${this.readonly}"
                ?hidden="${!this._showDeleteBtn(
                  this.readonly,
                  this._filename,
                  this.showDeleteBtn,
                  this.uploadInProgress
                )}"
              >
                Delete
              </paper-button>

              <paper-button
                class="delete-button"
                @tap="${this._cancelUpload}"
                .disabled="${!this.uploadInProgress}"
                ?hidden="${!this.uploadInProgress}"
              >
                Cancel
              </paper-button>
            </div>
            <!-- ------------------ -->
          </div>

          <!-- Props -->
          <input hidden="" type="file" id="file-input" @change="${this._fileSelected}" .accept="${this.accept}" />

          <a id="downloader" hidden=""></a>
        </div>

        ${this.invalid
          ? html` <paper-input-error aria-live="assertive" slot="add-on">${this.errorMessage}</paper-input-error> `
          : ''}
      </paper-input-container>
    `;
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.originalErrorMessage = this.errorMessage;
  }

  _thereIsAFileSelectedOrSaved(_filename: string | undefined | null): boolean {
    return !!_filename;
  }

  _fileSelected(e: InputEvent): void {
    const files: FileList | null = (e.target as HTMLInputElement).files;
    const file: File | null = files ? files[0] : null;
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

  _fireChangeFileEventIfApplicable(): void {
    if (this.fileUrl && !isNaN(this.fileUrl as number)) {
      // if fileUrl is a number , then the previous upload was not saved
      this.fireEvent('change-unsaved-file');
    }
  }

  _handleUpload(): void {
    /**
     * Doing the extra validFileType validation because `accept` functionality can be bypassed
     * by selecting All Files from the File selection dialog
     */
    if (this.accept && !this.validFileType(this.rawFile.name)) {
      return;
    }
    this.uploadInProgress = true;
    this.fireEvent('upload-started');

    this.uploadRawFile(this.rawFile, this.rawFile.name, this.setUploadProgress.bind(this))
      .then((response: any) => {
        this.success = true;
        this.uploadInProgress = false;
        this.fireEvent('upload-finished', {success: response});
        setTimeout(() => {
          this.resetRawFile();
          this.resetUploadProgress();
        }, 10);
      })
      .catch((err: any) => {
        this.fail = true;
        this.serverErrorMsg = 'Error uploading file: ' + this.prepareErrorMessage(err);
        this.setInvalid(true, this.serverErrorMsg);
        this.uploadInProgress = false;
        this.resetUploadProgress();
        this.fireEvent('upload-finished', {error: err});
      });
  }

  setInvalid(invalid: boolean, errMsg?: string): void {
    if (typeof errMsg === 'string') {
      this.errorMessage = errMsg;
    }
    this.invalid = invalid;
  }

  resetValidations(): void {
    this.invalid = false;
    this.errorMessage = '';
  }

  resetStatus(): void {
    this.success = false;
    this.fail = false;
    this.serverErrorMsg = '';
  }

  setUploadProgress(requestData: any): void {
    if (!requestData) {
      this.uploadProgressValue = '';
    } else {
      this.uploadProgressMsg = `${Math.round(requestData.loaded / 1024)} kb of ${Math.round(
        requestData.total / 1024
      )} kb`;
      this.uploadProgressValue = `${(requestData.loaded * 100) / requestData.total}`;
    }
  }

  resetUploadProgress(): void {
    this.uploadProgressValue = '';
    this.uploadProgressMsg = '';
  }

  getFilenameFromURL(url: string): string {
    if (!url) {
      return '';
    }
    return url.split('?')[0].split('/').pop() as string;
  }

  _showDownloadBtn(fileUrl: string | number | undefined): boolean {
    return !!fileUrl && isNaN(fileUrl as number);
  }

  _showChange(readonly: boolean, _filename: string | null, uploadInProgress: boolean, showChange?: boolean): boolean {
    return (!readonly && _filename && !uploadInProgress) || Boolean(showChange);
  }

  _showDeleteBtn(
    readonly: boolean,
    _filename: string | null,
    showDeleteBtn: boolean,
    uploadInProgress: boolean
  ): boolean {
    return !readonly && Boolean(_filename) && !uploadInProgress && showDeleteBtn;
  }

  _cancelUpload(): void {
    this.uploadInProgress = false;
    this._filename = null;

    this.resetRawFile();
  }

  _deleteFile(): void {
    if (this.rawFile) {
      this.resetRawFile();
    }
    this._filename = null;
    this.resetStatus();
    // TODO: should delete req be implemented here?
    this.fireEvent('delete-file', {file: this.fileUrl});
    this.fileUrl = undefined;
  }

  resetRawFile(): void {
    this.rawFile = null;
    const input: HTMLInputElement = this.shadowRoot!.querySelector('#file-input') as HTMLInputElement;
    input.value = '';
  }

  _downloadFile(): void {
    if (!this.fileUrl || !isNaN(this.fileUrl as number)) {
      return;
    }
    this.downloadFile(this._filename as string, this.fileUrl as string, this.openInNewTab);
  }

  validate(): boolean {
    let valid: boolean = true;
    let errMsg: string = this.originalErrorMessage;
    if (this.required) {
      const uploadRequestFailed: boolean = this.rawFile instanceof File && this.fail;

      if (!this.rawFile && !this.fileUrl) {
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

  autoValidateHandler(): void {
    if (typeof this.fileUrl === 'undefined') {
      this.resetStatus();
      this.invalid = false;
      return;
    }
    if (this.autoValidate) {
      this.validate();
    }
  }

  validFileType(fileName: string): boolean {
    const acceptedExtensions: string[] = this.accept.split(',');
    const fileExtension: string = this._getFileExtension(fileName);
    if (acceptedExtensions.includes('.' + fileExtension)) {
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
  _getFileExtension(fileName: string): string {
    return fileName.slice(((fileName.lastIndexOf('.') - 1) >>> 0) + 2);
  }
}
