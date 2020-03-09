//Dexie db will be used to store attachments uploaded while offline
export const createAttachmentsDexie() {
  if (!window.Etools.AttachmentsDbName) {
    console.log('window.Etools.AttachmentsDbName needs to be set!');
  } else {

    let db = new Dexie(window.Etools.AttachmentsDbName);
    db.version(1).stores({
      attachments: "id, formId",
    });

    window.Etools.AttachmentsDb = db;
  }
}