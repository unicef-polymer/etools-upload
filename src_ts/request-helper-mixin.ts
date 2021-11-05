import {upload} from '@unicef-polymer/etools-ajax/upload-helper';
import {Constructor, LitElement, property} from 'lit-element';
import {UploadConfig} from './upload-helper';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function RequestHelperMixin<T extends Constructor<LitElement>>(baseClass: T) {
  class RequestHelper extends baseClass {
    @property({type: String}) uploadEndpoint: string | null = null;
    /* Expected format:
    {
      endpoint: 'url',
      extraInfo: {itemid: 1},
      rawFilePropertyName: 'attachment'
    }
  */
    @property({type: Object}) endpointInfo: any = null;
    @property({type: String}) jwtLocalStorageKey: string = '';

    uploadRawFile(rawFile: File | Blob, requestKey: string, onProgressCallback?: (...args: any) => void): Promise<any> {
      const config: UploadConfig = {
        endpointInfo: this.endpointInfo,
        uploadEndpoint: this.uploadEndpoint as string,
        jwtLocalStorageKey: this.jwtLocalStorageKey
      };
      return upload(config, rawFile, requestKey, onProgressCallback);
    }
  }
  return RequestHelper;
}
