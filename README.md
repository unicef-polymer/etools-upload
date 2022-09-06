# \<etools-upload\>

Use to upload files

## Install

`$ npm i --save @unicef-polymer/etools-upload`

## Description

Polymer 3 component used for uploading files.
When `autoUpload` is true and `uploadEndpoint` is set , it automatically uploads the file and returns an `id` stored in the `fileUrl` property.

### Offline functionality

- If the `activateOffline` attribute is set on the <etools-upload-multi> component, if there is no internet connection during the upload, the file is saved in local IndexedDb with a temp id.
- The component expects `window.Etools.AttachmentsDbName` to be set from the parent application.
- The IndexedDb is created on `connectedCallback`. If you need the db to exist prior to this you can call `createAttachmentsDexie` method directly from your code.
- When the files have finished being saved in IndexedDb the same event as for online upload is fired - `upload-finished`. The event detail has the following format
  - {success:[{info about file}], error:[{error}]}
- Any other extra information can be saved in IndexedDb along with the file by setting property `endpointInfo.extraInfo` :{} on the component.

### Components

- \<etools-upload\>
- \<etools-upload-multi\>

### Resusable Methods

1.  `dexie-operations` file: Methods to interact with Dexie db
2.  `upload-helper` file exposes reusable methods that can upload files and receives a `config` object as param:

    - you can use `upload` method if you have the binary data of the file
    - `uploadFileStoredInDexie` gets a file stored in IndexedDb , uploads it then deletes it from IndexedDb

          ```

      Config param expected format:
      config = {
      endpointInfo?: {
      endpoint: 'url',
      extraInfo: {any: any},
      rawFilePropertyName: 'attachment'
      },
      uploadEndpoint: '',
      jwtLocalStorageKey?: ''
      }

      ```

      ```

### Upload component features

1.  `label`: text to be displayed on top of the control
2.  `uploadBtnLabel`: text to be displayed on the button, default is 'Upload file'
3.  `accept`: accepted file types (Ex: ".doc,.docx,.pdf,.jpg,.png")
4.  `file-url`: When a new file is uploaded and the upload has finished it holds the id of the file. After the id is saved on the entity for which the upload was made, it will hold the url to the file.
5.  `upload-endpoint`: url for the upload
6.  `readonly`: can be used as html attribute or polymer property (Ex: readonly$="[[!permissions.allowEdit]]"), enable/disable upload control
7.  `required`: can be used as html attribute or polymer property (Ex: required$="[[permissions.allowEdit]]"), specifies if control must be filled out
8.  `auto-validate`: if set to true and control is required validate if control is set
9.  `error-message`: custom text to be displayed on upload error
10. `auto-upload`: if `true` it automatically uploads the file after selection. default is `true`.
11. `endpointInfo`: can be used to set any other information needed by the upload online or offline. If endpointInfo.endpoint is specified , uploadEndpoint is no longer needed.

        -  Expected format:
        {
          endpoint: 'url',
          /** Any extra properties with their values, that need to be set in the FormData on the upload request, like parentId */
          extraInfo: {any: any},

          /**The name of the field that will hold the binary data in the FormData on the upload request. If not specified it defaults to `file*/
          rawFilePropertyName: 'file'
        }

#Buttons

10. `Download` button will be displayed after uploaded file was saved
11. `show-delete-btn`: if set to true, will display a 'Delete' button after file was selected, in order to be able to remove the file
12. `show-change`: if set to true, will display a 'Change' button after file was selected, in order to be able to replace the file
13. `jwtLocalStorageKey` specifies the local storage key where the token is stored. If `window.AppMsalInstance` is set , the component also checks the expiration of the token and silently refreshes it if needed.

#Events

13. `on-upload-started`: triggered when upload started
14. `on-upload-finished`: triggered when upload finished with the result of the action (information about the uploaded files) (Ex: {success: response} or {error: err}). This same event is triggered when offline and the files were saved in IndexedDb.
15. `on-change-unsaved-file`: triggered on file selection if previous upload was not saved
16. `on-delete-file`: triggered on file delete with the file url as parameter (Ex: {file: fileUrl})

## Internationalization
`assets/translations.js` contains the translations file.

## Usage example

<etools-upload
label="Upload Example"
accept=".doc,.docx,.pdf,.jpg,.png"
file-url="{{data.file_attachment}}"
upload-endpoint="[[uploadEndpoint]]"
on-upload-finished="\_onUploadFinished"
on-upload-started="\_onUploadStarted"
show-delete-btn="[[showDeleteBtn(data.status, data.permissions.allowEdit)]]"
on-delete-file="\_onAttachDelete"
accept=".doc,.docx,.pdf,.jpg,.png"
readonly$="[[!data.permissions.allowEdit]]"
		required$="[[data.attach_required]]"
auto-validate
on-change-unsaved-file="\_onChangeUnsavedFile">
</etools-upload>

## Install the Polymer-CLI

First, make sure you have the [Polymer CLI](https://www.npmjs.com/package/polymer-cli) installed. Then run `polymer serve` to serve your element locally.

## Viewing Your Element

```
$ polymer serve
```

## Circle CI

Package will be automatically published after tag push (`git tag 1.2.3` , `git push --tags`). Tag name must correspond to SemVer (Semantic Versioning) rules.
Examples:

| Version match      | Result   |
| ------------------ | -------- |
| `1.2.3`            | match    |
| `1.2.3-pre`        | match    |
| `1.2.3+build`      | match    |
| `1.2.3-pre+build`  | match    |
| `v1.2.3-pre+build` | match    |
| `1.2`              | no match |

You can see more details [here](https://rgxdb.com/r/40OZ1HN5)
