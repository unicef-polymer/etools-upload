import {getTranslation} from './translate';

export const CommonMixin = (baseClass) =>
  class extends baseClass {
    static get properties() {
      return {
        uploadInProgress: {
          type: Boolean,
          reflect: true,
          attribute: 'upload-in-progress'
        },
        label: {
          type: String,
          reflect: true
        },
        required: {
          type: Boolean,
          reflect: true
        },
        readonly: {
          type: Boolean,
          reflect: true
        },
        accept: String,
        autoUpload: {
          type: Boolean,
          reflect: true,
          attribute: 'auto-upload'
        },
        disabled: {
          type: Boolean,
          reflect: true
        },
        invalid: {
          type: Boolean,
          reflect: true
        },
        autoValidate: {
          type: Boolean,
          reflect: true,
          attribute: 'auto-validate'
        },
        errorMessage: {
          type: String,
          reflect: true,
          attribute: 'error-message'
        },
        openInNewTab: {
          type: Boolean,
          reflect: true,
          attribute: 'open-in-new-tab'
        }
      };
    }

    set invalid(invalid) {
      const old = this._invalid;
      this._invalid = invalid;
      if (this._invalid !== old) {
        this._invalidChanged();
      }
      this.requestUpdate();
    }

    get invalid() {
      return this._invalid;
    }

    constructor() {
      super();
      this.uploadInProgress = false;
      this.label = '';
      this.required = false;
      this.readonly = false;
      this.autoUpload = true;
      this.disabled = false;
      this._invalid = false;
      this.autoValidate = false;
      this.errorMessage = '';
      this.openInNewTab = true;
    }

    // abstract method
    _invalidChanged() {}

    _showLabel(label) {
      return label !== '';
    }

    _openFileChooser() {
      const fileEl = this.shadowRoot.querySelector('#fileInput');
      if (fileEl) {
        fileEl.dispatchEvent(new MouseEvent('click', {bubbles: true, cancelable: true, view: window}));
      }
    }

    fireEvent(evName, detail) {
      this.dispatchEvent(
        new CustomEvent(evName, {
          detail: detail,
          bubbles: true,
          composed: true
        })
      );
    }

    downloadFile(filename, url, openInNewTab) {
      const a = document.createElement('a');
      a.href = url;
      if (openInNewTab) {
        a.target = '_blank';
      }
      a.download = filename;
      a.dispatchEvent(new MouseEvent('click', {bubbles: true, cancelable: true, view: window}));
      window.URL.revokeObjectURL(url);
    }

    prepareErrorMessage(lang, error) {
      const message = (error.request ? error.error.message : error.message) || '';
      if (message.includes('413')) {
        return getTranslation(lang, 'FILE_TOO_LARGE');
      }
      return message;
    }
  };
