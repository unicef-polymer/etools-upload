import '@polymer/polymer/lib/elements/dom-repeat.js';
import '@polymer/paper-button/paper-button.js';
import '@polymer/iron-icon/iron-icon.js';
import '@polymer/iron-icons/iron-icons.js';
import '@polymer/paper-input/paper-input-container.js';
import '@polymer/paper-input/paper-input-error.js';
import '@polymer/paper-progress/paper-progress.js';
import {CommonStyles} from './common-styles';
import {CommonMixin} from './common-mixin';
import {RequestHelperMultiMixin} from './request-helper-multi-mixin';
import {createAttachmentsDexie} from './offline/dexie-config';
import {getFileUrl, getBlob} from './offline/file-conversion';
import {storeFileInDexie, generateRandomHash} from './offline/dexie-operations';
import {getActiveXhrRequests, abortActiveRequests} from '@unicef-polymer/etools-ajax/upload-helper';
import {customElement, LitElement, property, TemplateResult, html} from 'lit-element';

@customElement('etools-upload-multi')
export class EtoolsUploadMulti extends CommonMixin(RequestHelperMultiMixin(LitElement)) {
  @property({type: String}) uploadBtnLabel: string = 'Upload files';
  @property({type: Array}) rawFiles: any[] = [];
  @property({type: Array}) _filenames: any[] = [];
  @property({type: Boolean, reflect: true, attribute: 'activate-offline'}) activateOffline: boolean = false;

  render(): TemplateResult {
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
            ?title="${this.uploadBtnLabel}"
            .disabled="${this._shouldDisableUploadBtn(this.readonly, this.uploadInProgress)}"
          >
            <iron-icon icon="file-upload"></iron-icon>
            ${this.uploadBtnLabel}
          </paper-button>

          <div class="file-actions">
            <paper-button
              class="delete-button"
              @tap="${this._cancelUpload}"
              .disabled="${!this.uploadInProgress}"
              ?hidden="${!this.uploadInProgress}"
            >
              <iron-icon icon="clear"></iron-icon>
              Cancel Upload
            </paper-button>
          </div>
        </div>

        <div class="filenames-container" ?hidden="${!this._thereAreFilesSelected(this._filenames)}">
          ${this._filenames.map(
            (item: any) => html`
              <div class="filename-line">
                <div class="filename-container">
                  <iron-icon class="file-icon" icon="attachment"></iron-icon>
                  <span class="filename" title="${item.filename}">${item.filename}</span>

                  <iron-icon title="Uploaded successfully!" icon="done" ?hidden="${!item.success}"></iron-icon>
                  <iron-icon title="Upload failed!" icon="error-outline" ?hidden="${!item.fail}"></iron-icon>
                </div>
                ${item.uploadProgressValue
                  ? html`
                      <div class="progress-container">
                        <paper-progress .value="${item.uploadProgressValue}"></paper-progress>
                        <span>${item.uploadProgressMsg}</span>
                        <div></div>
                      </div>
                    `
                  : ''}
              </div>
            `
          )}
        </div>

        <!-- Props -->
        <input
          hidden=""
          type="file"
          id="file-input"
          @change="${this._filesSelected}"
          multiple=""
          accept="${this.accept}"
        />

        <a id="downloader" hidden=""></a>
      </div>
    `;
  }

  connectedCallback(): void {
    super.connectedCallback();
    if (this.activateOffline) {
      createAttachmentsDexie();
    }
  }

  _filesSelected(e: InputEvent): void {
    const files: FileList | null = (e.target as HTMLInputElement)!.files || null;
    if (!files || !files.length) {
      return;
    }

    this.rawFiles = files as any;
    this._filenames = this._extractFilenames(files);

    if (this.autoUpload) {
      this._handleUpload(files);
    }
  }

  _extractFilenames(files: any): any[] {
    const names: any = [];
    for (let i: number = 0; i < files.length; i++) {
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

  async saveFilesInIndexedDb(files: any): Promise<any> {
    let i: number;
    const filesInfo: any[] = [];
    const errors: any[] = [];
    for (i = 0; i < files.length; i++) {
      const blob: any = await getBlob(getFileUrl(files[i]));
      const fileInfo: any = {
        id: generateRandomHash(),
        filetype: files[i].type,
        filename: files[i].name,
        extraInfo: this.endpointInfo ? this.endpointInfo.extraInfo : '',
        parentId:
          (window as any).OfflineUploadParentId ||
          (this.endpointInfo && this.endpointInfo.extraInfo ? this.endpointInfo.extraInfo.parentId : ''),
        unsynced: true
      };

      const fileInfoForDb: any = JSON.parse(JSON.stringify(fileInfo));
      fileInfoForDb.binaryData = blob;
      try {
        await storeFileInDexie(fileInfoForDb);
        filesInfo.push(fileInfo);
        this._setFilenameProperty(i, 'success', true);
        this._setFilenameProperty(i, 'uploadInProgress', false);
        this._filenames = [...this._filenames];
      } catch (error) {
        errors.push('Error saving attachment' + fileInfo.filename + ' in IndexedDb');
        this._setFilenameProperty(i, 'fail', true);
        this._setFilenameProperty(i, 'uploadInProgress', false);
        this._filenames = [...this._filenames];
      }
    }
    return {
      success: filesInfo,
      error: errors
    };
  }

  async _handleUpload(files: any): Promise<any> {
    this.uploadInProgress = true;
    if (this.activateOffline && !navigator.onLine) {
      const response: any = await this.saveFilesInIndexedDb(files);
      this.uploadInProgress = false;
      this.resetRawFiles();
      this.fireEvent('upload-finished', response);
      setTimeout(this._clearDisplayOfUploadedFiles.bind(this), 2000);
      return;
    }

    if (this.endpointAcceptsMulti) {
      // we don't have this situation yet
    } else {
      this._uploadAllFilesSequentially(files, this.uploadRawFile.bind(this), this.prepareErrorMessage.bind(this)).then(
        (response: any) => {
          this.uploadInProgress = false;
          this.resetRawFiles();
          if (response && !response.uploadCanceled) {
            this.fireEvent('upload-finished', {
              success: response.allSuccessResponses,
              error: response.allErrorResponses
            });

            setTimeout(this._clearDisplayOfUploadedFiles.bind(this), 2000);
          }
        }
      );
    }
  }
  _clearDisplayOfUploadedFiles(): void {
    this._filenames = [];
  }

  _uploadAllFilesSequentially(files: File[], uploadFunction: any, prepareErrorMessage: any): Promise<any> {
    return new Promise((resolve: (arg: any) => void) => {
      const allSuccessResponses: any[] = [];
      const allErrorResponses: any[] = [];
      let i: number;
      let counter: number = 0;
      for (i = 0; i < files.length; i++) {
        ((index: number) => {
          uploadFunction(files[index], files[index].name, this._computeUploadProgress.bind(this, index))
            .then((response: any) => {
              this._setFilenameProperty(index, 'success', true);
              this._setFilenameProperty(index, 'uploadInProgress', false);
              this._setProgressProps(index, '', '');

              allSuccessResponses.push(response);

              if (counter + 1 === files.length) {
                resolve({
                  allSuccessResponses: allSuccessResponses,
                  allErrorResponses: allErrorResponses
                });
              }
              counter++;
            })
            .catch((err: any) => {
              this._setFilenameProperty(index, 'fail', true);
              this._setFilenameProperty(index, 'uploadInProgress', false);
              this._setProgressProps(index, '', '');

              allErrorResponses.push(prepareErrorMessage(err));

              if (counter + 1 === files.length) {
                resolve({
                  allSuccessResponses: allSuccessResponses,
                  allErrorResponses: allErrorResponses
                });
              }
              counter++;
            });
        })(i);
      }
    });
  }

  _computeUploadProgress(index: number, requestData?: any): void {
    if (!requestData) {
      this._setProgressProps(index, '', '');
    } else {
      const progressValue: string = `${(requestData.loaded * 100) / requestData.total}`;
      const progressMsg: string = `${Math.round(requestData.loaded / 1024)} kb of ${Math.round(
        requestData.total / 1024
      )} kb`;
      this._setProgressProps(index, progressValue, progressMsg);
    }
  }

  _setProgressProps(index: number, progressValue: string, progressMsg: string): void {
    this._setFilenameProperty(index, 'uploadProgressValue', progressValue);
    this._setFilenameProperty(index, 'uploadProgressMsg', progressMsg);
    this._filenames = [...this._filenames];
  }

  _setFilenameProperty(index: number, prop: string, value: any): void {
    const fileData: any = this._filenames[index];
    this._filenames[index] = {...fileData, [prop]: value};
  }

  _shouldDisableUploadBtn(readonly: boolean, uploadInProgress: boolean): boolean {
    return readonly || uploadInProgress;
  }

  _thereAreFilesSelected(_filenames: any[]): boolean {
    return Boolean(_filenames && _filenames.length);
  }

  _cancelUpload(): void {
    const activeReqKeys: string[] = Object.keys(getActiveXhrRequests());
    this._filenames = this._filenames.filter((f: any) => !activeReqKeys.includes(f.filename));

    abortActiveRequests(activeReqKeys);
    this.uploadInProgress = false;
    this.resetRawFiles();

    if (this._filenames.length) {
      setTimeout(() => {
        this._clearDisplayOfUploadedFiles.bind(this);
      }, 2000);
    }
  }

  resetRawFiles(): void {
    this.rawFiles = [];
    const input: HTMLInputElement = this.shadowRoot!.querySelector('#file-input') as HTMLInputElement;
    input.value = '';
  }
}
