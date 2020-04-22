
/**
 * endpointInfo.endpoint and uploadEndpoint are mutually exclusive ,
 * but at least one of them has to be specified
 */
export interface UploadConfig {
  endpointInfo?: {
    endpoint: string,
    extraInfo: any,
    rawFilePropertyName: string // Defaults to 'file'
  },
  uploadEndpoint?: string,
  jwtLocalStorageKey?: string
}
export interface SequentialUploadFiles {
  binaryData: any,
  filename: string,
  [key: string]: any
}

export interface OperationResponse {
  success: any[],
  error: any[]
}

export declare function uploadAllFilesSequentially(config: UploadConfig, files: SequentialUploadFiles[]): Promise<OperationResponse>;
export declare function uploadFileStoredInDexie(config: UploadConfig, id: string): Promise<OperationResponse>;

