export declare function storeFileInDexie(fileInfo: any): Promise<any>;

export declare function getFileFromDexieById(id: string): Promise<any>;

export declare function getFilesFromDexieByIds(ids: string[]): Promise<any[]>;

export declare function deleteFileFromDexie(id: string): Promise<any>; //TODO test if more specific return type can be provided
