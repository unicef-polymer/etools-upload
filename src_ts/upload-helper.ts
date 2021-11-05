import {deleteFileFromDexie, getFileFromDexieById} from './offline/dexie-operations';
import {upload} from '@unicef-polymer/etools-ajax/upload-helper';

/**
 * endpointInfo.endpoint and uploadEndpoint are mutually exclusive ,
 * but at least one of them has to be specified
 */
export interface UploadConfig {
  endpointInfo?: {
    endpoint: string;
    extraInfo: any;
    rawFilePropertyName: string; // Defaults to 'file'
  };
  uploadEndpoint?: string;
  jwtLocalStorageKey?: string;
}
export interface SequentialUploadFiles {
  [key: string]: any;
  binaryData: any;
  filename: string;
}

export interface OperationResponse {
  success: any[] | null;
  error: any[] | null | string;
}

export function uploadAllFilesSequentially(
  config: UploadConfig,
  files: SequentialUploadFiles[]
): Promise<OperationResponse> {
  return new Promise((resolve: (arg: any) => void) => {
    const allSuccessResponses: any[] = [];
    const allErrorResponses: any[] = [];
    let i: number;
    let counter: number = 0;

    for (i = 0; i < files.length; i++) {
      upload(config, files[i].binaryData, files[i].filename)
        .then((response: any) => {
          allSuccessResponses.push(response);

          if (counter + 1 === files.length) {
            resolve({
              success: allSuccessResponses,
              error: allErrorResponses
            });
          }
          counter++;
        })
        .catch((err: any) => {
          allErrorResponses.push(err);

          if (counter + 1 === files.length) {
            resolve({
              success: allSuccessResponses,
              error: allErrorResponses
            });
          }
          counter++;
        });
    }
  });
}

/**
 * config = {
 *  endpointInfo: {},
 *  uploadEndpoint: '',
 *  jwtLocalStorageKey: ''
 * }
 */
export async function uploadFileStoredInDexie(config: UploadConfig, id: string): Promise<OperationResponse> {
  const file: SequentialUploadFiles = await getFileFromDexieById(id);

  const response: OperationResponse = {
    success: null,
    error: null
  };

  if (!file) {
    response.error = 'File ' + id + ' not found in Dexie';
    return response;
  }

  try {
    response.success = await upload(config, file.binaryData, file.filename);
  } catch (error) {
    response.error = error;
    return response;
  }

  try {
    await deleteFileFromDexie(id);
  } catch (error) {
    response.error = error;
  }

  return response;
}
