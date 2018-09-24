const $_documentContainer = document.createElement('template');

$_documentContainer.innerHTML = `<dom-module id="common-styles">
  <template>
    <style>
       [hidden] {
        display: none !important;
      }

      :host {
        display: block;
        --paper-input-container-underline:	{
            display: none;
        };
        --paper-input-container-underline-focus:	{
          display: none;
        };
        --paper-input-container-underline-disabled: {
          display: none;
        };
      }

      paper-button {
        margin: 0 0;
        padding: 0 0;
      }

      #uploadingSpinner {
        width: 18px;
        height: 18px;
      }

      iron-icon[icon="done"] {
        color: green;
      }

      iron-icon[icon="error-outline"] {
        color: red;
      }

      .delete-button {
        color: #f1572a;
      }

      .upload-button {
        font-weight: 700;
      }
      iron-icon {
        min-width: 22px;
        min-height: 22px;
      }

    </style>


  </template>
</dom-module>`;

document.head.appendChild($_documentContainer.content);
