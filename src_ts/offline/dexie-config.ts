import Dexie from 'dexie';

declare global {
  interface Window {
    Etools: any;
  }
}

// Dexie db will be used to store attachments uploaded while offline
export function createAttachmentsDexie(): void {
  window.Etools = window.Etools || {};
  if (!window.Etools.AttachmentsDbName) {
    console.log('window.Etools.AttachmentsDbName needs to be set!');
  } else {
    if (!window.Etools.AttachmentsDb) {
      const db: Dexie = new Dexie(window.Etools.AttachmentsDbName);
      db.version(1).stores({
        attachments: 'id, parentId'
      });

      window.Etools.AttachmentsDb = db;
    }
  }
}
