declare function storeFileInDexie(fileInfo: any): Promise<any>;

declare function getFileFromDexieById(id: string): Promise<any>;

declare function getFilesFromDexieByIds(ids: string[]): Promise<any[]>;

declare function deleteFileFromDexie(id: string): Promise<any>; //TODO test if more specific return type can be provided
