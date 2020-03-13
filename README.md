# \<etools-upload\>

Use to upload files

## Install
`$ npm i --save @unicef-polymer/etools-upload`

## Description
Polymer 3 component used for uploading files.
When `autoUpload` is true and `uploadEndpoint` is set , it automatically uploads the file and returns an id stored in the `fileUrl` property.

### Components
* \<etools-upload\>

### Upload component features

1. `label`: text to be displayed on top of the control
2. `uploadBtnLabel`: text to be displayed on the button, default is 'Upload file'
3. `accept`: accepted file types (Ex: ".doc,.docx,.pdf,.jpg,.png")
4. `file-url`: When a new file is uploaded and the upload has finished it holds the id of the file. After the id is saved on the entity for which the upload was made it will hold the url to the file.
5. `upload-endpoint`: url for the upload
6. `readonly`: can be used as html attribute or polymer property (Ex: readonly$="[[!permissions.allowEdit]]"), enable/disable upload control
7. `required`: can be used as html attribute or polymer property (Ex: required$="[[permissions.allowEdit]]"), specifies if control must be filled out
8. `auto-validate`: if set to true and control is required validate if control is set
9. `error-message`: custom text to be displayed on upload error
10. `auto-upload`: if `true` it automatically upload the file after selection. default is `true`.
// TODO - add offline funct


#Buttons

10. `Download` button will be displayed after uploaded file was saved
11. `show-delete-btn`:  if set to true, will display a 'Delete' button after file was selected, in order to be able to remove the file
12. `show-change`: if set to true, will display a 'Change' button after file was selected, in order to be able to replace the file

#Events
13. `on-upload-started`: triggered when upload started
14. `on-upload-finished`: triggered when upload finished with the result of the action as parameter (Ex: {success: response} or {error: err})
15. `on-change-unsaved-file`: triggered on file selection if previous upload was not saved
16. `on-delete-file`: triggered on file delete with the file url as parameter (Ex: {file: fileUrl})


## Usage example

 <etools-upload
		label="Upload Example"
		accept=".doc,.docx,.pdf,.jpg,.png"
		file-url="{{data.file_attachment}}"
		upload-endpoint="[[uploadEndpoint]]"
		on-upload-finished="_onUploadFinished"
		on-upload-started="_onUploadStarted"
		show-delete-btn="[[showDeleteBtn(data.status, data.permissions.allowEdit)]]"
		on-delete-file="_onAttachDelete"
		accept=".doc,.docx,.pdf,.jpg,.png"
		readonly$="[[!data.permissions.allowEdit]]"
		required$="[[data.attach_required]]"
		auto-validate
		on-change-unsaved-file="_onChangeUnsavedFile">
  </etools-upload>


## Install the Polymer-CLI

First, make sure you have the [Polymer CLI](https://www.npmjs.com/package/polymer-cli) installed. Then run `polymer serve` to serve your element locally.

## Viewing Your Element

```
$ polymer serve
```

## Running Tests

```
$ polymer test
```

Your application is already set up to be tested via [web-component-tester](https://github.com/Polymer/web-component-tester). Run `polymer test` to run your application's test suite locally.
