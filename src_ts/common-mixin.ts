import {Constructor, LitElement, property} from 'lit-element';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function CommonMixin<T extends Constructor<LitElement>>(baseClass: T) {
  class Common extends baseClass {
    @property({type: Boolean}) uploadInProgress: boolean = false;
    @property({type: String}) label: string = '';
    @property({type: Boolean, attribute: true, reflect: true}) required: boolean = false;
    @property({type: Boolean, attribute: true, reflect: true}) readonly: boolean = false;
    @property({type: String}) accept: string = '';
    @property({type: Boolean, attribute: 'auto-upload', reflect: true}) autoUpload: boolean = true;
    @property({type: Boolean, attribute: true, reflect: true}) disabled: boolean = false;
    @property({type: Boolean, attribute: true, reflect: true}) invalid: boolean = false;
    @property({type: Boolean, attribute: 'auto-validate', reflect: true}) autoValidate: boolean = false;
    @property({type: String}) errorMessage: string = '';
    @property({type: Boolean}) openInNewTab: boolean = true;

    _showLabel(label: string): boolean {
      return label !== '';
    }

    _openFileChooser(): void {
      const fileEl: HTMLInputElement | null = this.shadowRoot!.querySelector('#file-input');
      if (fileEl) {
        fileEl.dispatchEvent(new MouseEvent('click', {bubbles: true, cancelable: true, view: window}));
      }
    }

    fireEvent(evName: string, detail?: any): void {
      this.dispatchEvent(
        new CustomEvent(evName, {
          detail: detail,
          bubbles: true,
          composed: true
        })
      );
    }

    downloadFile(filename: string, url: string, openInNewTab: boolean): void {
      const a: HTMLAnchorElement = document.createElement('a');
      a.href = url;
      if (openInNewTab) {
        a.target = '_blank';
      }
      a.download = filename;
      a.dispatchEvent(new MouseEvent('click', {bubbles: true, cancelable: true, view: window}));
      window.URL.revokeObjectURL(url);
    }

    prepareErrorMessage(error: any): string {
      const message: string = (error.request ? error.error.message : error.message) || '';
      if (message.includes('413')) {
        return 'File too large.';
      }
      return message;
    }
  }
  return Common;
}
