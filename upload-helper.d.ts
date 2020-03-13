
declare interface UploadConfig {
  endpointInfo: {
    endpoint: string,
    extraInfo: any,
    rawFilePropertyName: string
  }
}
declare interface SequentialUploadFiles {
  binaryData: any,
  filename: string,
  [key: string]: any
}

declare interface OperationResponse {
  success: any[],
  error: any[]
}
declare function upload(config: UploadConfig, rawFile: File | Blob, filename: string): Promise<any>;
declare function uploadAllFilesSequentially(config: UploadConfig, files: SequentialUploadFiles[]): Promise<OperationResponse>;
declare function uploadFileStoredInDexie(config: UploadConfig, id: string): Promise<OperationResponse>;

