export const CommonMixin = (baseClass) =>
  class extends baseClass {
    static get properties() {
      return {
        uploadInProgress: {
          type: Boolean,
          value: false
        },
        label: {
          type: String,
          value: ''
        },
        required: {
          type: Boolean,
          value: false,
          reflectToAttribute: true
        },
        readonly: {
          type: Boolean,
          value: false,
          reflectToAttribute: true
        },
        accept: String,
        autoUpload: {
          type: Boolean,
          value: true
        },
        disabled: {
          type: Boolean,
          value: false,
          reflectToAttribute: true
        },
        invalid: {
          type: Boolean,
          value: false,
          reflectToAttribute: true
        },
        autoValidate: {
          type: Boolean,
          value: false,
          reflectToAttribute: true
        },
        errorMessage: {
          type: String,
          value: ''
        },
        openInNewTab: {
          type: Boolean,
          value: true
        }
      };
    }

    _showLabel(label) {
      return label !== '';
    }

    _openFileChooser() {
      const fileEl = this.$.fileInput;
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

    prepareErrorMessage(error) {
      const message = (error.request ? error.error.message : error.message) || '';
      if (message.includes('413')) {
        return 'File too large.';
      }
      return message;
    }
  };
