import {RequestHelperMixin} from './request-helper-mixin';
import {Constructor, LitElement, property} from 'lit-element';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function RequestHelperMultiMixin<T extends Constructor<LitElement>>(baseClass: T) {
  class RequestHelperMulti extends baseClass {
    // True if you can upload more than one file at a time
    @property({type: Boolean}) endpointAcceptsMulti: boolean = false;
    @property({type: Boolean}) cancelUpload: boolean = false;
  }
  return RequestHelperMixin(RequestHelperMulti);
}
