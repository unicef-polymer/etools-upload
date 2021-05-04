export declare function storeFileInDexie(fileInfo: any): Promise<any>;

export declare function getFileFromDexieById(id: string): Promise<any>;

export declare function getFilesFromDexieByIds(ids: string[]): Promise<any[]>;

export declare function deleteFileFromDexie(id: string): Promise<any>; //TODO test if more specific return type can be provided

export declare function updateParentIdInDexie(oldParentId: string, newParentId: string);

export declare function updateProvidedPropertyNameInDexie(attId: string, propName: string, val: string);

export declare function deleteByParentIdFromDexie(parentId: string);

export declare function getFileCountByParentIdFromDexie(parentId: string);
