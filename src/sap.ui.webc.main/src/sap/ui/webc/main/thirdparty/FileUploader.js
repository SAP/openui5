sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/UI5Element", "sap/ui/webc/common/thirdparty/base/types/ValueState", "sap/ui/webc/common/thirdparty/base/FeaturesRegistry", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer", "sap/ui/webc/common/thirdparty/base/i18nBundle", "sap/ui/webc/common/thirdparty/base/Keys", "./generated/i18n/i18n-defaults", "./Input", "./Popover", "./Icon", "./generated/templates/FileUploaderTemplate.lit", "./generated/templates/FileUploaderPopoverTemplate.lit", "./generated/themes/FileUploader.css", "./generated/themes/ResponsivePopoverCommon.css", "./generated/themes/ValueStateMessage.css"], function (_exports, _UI5Element, _ValueState, _FeaturesRegistry, _LitRenderer, _i18nBundle, _Keys, _i18nDefaults, _Input, _Popover, _Icon, _FileUploaderTemplate, _FileUploaderPopoverTemplate, _FileUploader, _ResponsivePopoverCommon, _ValueStateMessage) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _UI5Element = _interopRequireDefault(_UI5Element);
  _ValueState = _interopRequireDefault(_ValueState);
  _LitRenderer = _interopRequireDefault(_LitRenderer);
  _Input = _interopRequireDefault(_Input);
  _Popover = _interopRequireDefault(_Popover);
  _Icon = _interopRequireDefault(_Icon);
  _FileUploaderTemplate = _interopRequireDefault(_FileUploaderTemplate);
  _FileUploaderPopoverTemplate = _interopRequireDefault(_FileUploaderPopoverTemplate);
  _FileUploader = _interopRequireDefault(_FileUploader);
  _ResponsivePopoverCommon = _interopRequireDefault(_ResponsivePopoverCommon);
  _ValueStateMessage = _interopRequireDefault(_ValueStateMessage);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  // Template

  // Styles

  /**
   * @public
   */
  const metadata = {
    tag: "ui5-file-uploader",
    languageAware: true,
    properties: /** @lends sap.ui.webcomponents.main.FileUploader.prototype */{
      /**
       * Comma-separated list of file types that the component should accept.
       * <br><br>
       * <b>Note:</b> Please make sure you are adding the <code>.</code> in front on the file type, e.g. <code>.png</code> in case you want to accept png's only.
       * @type {string}
       * @defaultvalue ""
       * @public
       */
      accept: {
        type: String
      },
      /**
       * If set to "true", the input field of component will not be rendered. Only the default slot that is passed will be rendered.
       * @type {boolean}
       * @defaultvalue false
       * @public
       */
      hideInput: {
        type: Boolean
      },
      /**
       * Defines whether the component is in disabled state.
       * <br><br>
       * <b>Note:</b> A disabled component is completely noninteractive.
       *
       * @type {boolean}
       * @defaultvalue false
       * @public
       */
      disabled: {
        type: Boolean
      },
      /**
       * Allows multiple files to be chosen.
       * @type {boolean}
       * @defaultvalue false
       * @public
       */
      multiple: {
        type: Boolean
      },
      /**
       * Determines the name with which the component will be submitted in an HTML form.
       *
       * <br><br>
       * <b>Important:</b> For the <code>name</code> property to have effect, you must add the following import to your project:
       * <code>import "@ui5/webcomponents/dist/features/InputElementsFormSupport.js";</code>
       *
       * <br><br>
       * <b>Note:</b> When set, a native <code>input</code> HTML element
       * will be created inside the component so that it can be submitted as
       * part of an HTML form. Do not use this property unless you need to submit a form.
       *
       * @type {string}
       * @defaultvalue ""
       * @public
       */
      name: {
        type: String
      },
      /**
       * Defines a short hint intended to aid the user with data entry when the component has no value.
       * @type {string}
       * @defaultvalue ""
       * @public
       */
      placeholder: {
        type: String
      },
      /**
       * Defines the name/names of the file/files to upload.
       * @type {string}
       * @defaultvalue ""
       * @public
       */
      value: {
        type: String
      },
      /**
       * Defines the value state of the component.
       * <br><br>
       * Available options are:
       * <ul>
       * <li><code>None</code></li>
       * <li><code>Error</code></li>
       * <li><code>Warning</code></li>
       * <li><code>Success</code></li>
       * <li><code>Information</code></li>
       * </ul>
       *
       * @type {ValueState}
       * @defaultvalue "None"
       * @public
       */
      valueState: {
        type: _ValueState.default,
        defaultValue: _ValueState.default.None
      },
      /**
       * @private
       */
      focused: {
        type: Boolean
      }
    },
    managedSlots: true,
    slots: /** @lends sap.ui.webcomponents.main.FileUploader.prototype */{
      /**
       * By default the component contains a single input field. With this slot you can pass any content that you wish to add. See the samples for more information.
       *
       * @type {HTMLElement[]}
       * @slot content
       * @public
       */
      "default": {
        propertyName: "content",
        type: HTMLElement
      },
      /**
       * Defines the value state message that will be displayed as pop up under the component.
       * <br><br>
       *
       * <b>Note:</b> If not specified, a default text (in the respective language) will be displayed.
       * <br>
       * <b>Note:</b> The <code>valueStateMessage</code> would be displayed,
       * when the component is in <code>Information</code>, <code>Warning</code> or <code>Error</code> value state.
       * @type {HTMLElement[]}
       * @since 1.0.0-rc.9
       * @slot
       * @public
       */
      valueStateMessage: {
        type: HTMLElement
      },
      /**
       * The slot is used to render native <code>input</code> HTML element within Light DOM to enable form submit,
       * when <code>name</code> property is set.
       * @type {HTMLElement[]}
       * @slot
       * @private
       */
      formSupport: {
        type: HTMLElement
      }
    },
    events: /** @lends sap.ui.webcomponents.main.FileUploader.prototype */{
      /**
       * Event is fired when the value of the file path has been changed.
       * <b>Note:</b> Keep in mind that because of the HTML input element of type file, the event is also fired in Chrome browser when the Cancel button of the uploads window is pressed.
       *
       * @event
       * @param {FileList} files The current files.
       * @public
       */
      change: {
        detail: {
          files: {
            type: FileList
          }
        }
      }
    }
  };

  /**
   * @class
   *
   * <h3 class="comment-api-title">Overview</h3>
   *
   * The <code>ui5-file-uploader</code> opens a file explorer dialog and enables users to upload files.
   * The component consists of input field, but you can provide an HTML element by your choice
   * to trigger the file upload, by using the default slot.
   * Furthermore, you can set the property "hideInput" to "true" to hide the input field.
   * <br>
   * To get all selected files, you can simply use the read-only "files" property.
   * To restrict the types of files the user can select, you can use the "accept" property.
   * <br>
   * And, similar to all input based components, the FileUploader supports "valueState", "placeholder", "name", and "disabled" properties.
   *
   * For the <code>ui5-file-uploader</code>
   * <h3>ES6 Module Import</h3>
   *
   * <code>import "@ui5/webcomponents/dist/FileUploader.js";</code>
   *
   * @constructor
   * @since 1.0.0-rc.6
   * @author SAP SE
   * @alias sap.ui.webcomponents.main.FileUploader
   * @extends UI5Element
   * @tagname ui5-file-uploader
   * @public
   */
  class FileUploader extends _UI5Element.default {
    static get formAssociated() {
      return true;
    }
    static get metadata() {
      return metadata;
    }
    static get render() {
      return _LitRenderer.default;
    }
    static get styles() {
      return _FileUploader.default;
    }
    static get template() {
      return _FileUploaderTemplate.default;
    }
    static get staticAreaTemplate() {
      return _FileUploaderPopoverTemplate.default;
    }
    static get staticAreaStyles() {
      return [_ResponsivePopoverCommon.default, _ValueStateMessage.default];
    }
    constructor() {
      super();
      this._internals = this.attachInternals && this.attachInternals();
    }
    _onmouseover() {
      this.content.forEach(item => {
        item.classList.add("ui5_hovered");
      });
    }
    _onmouseout() {
      this.content.forEach(item => {
        item.classList.remove("ui5_hovered");
      });
    }
    _onclick(event) {
      if (event.isMarked === "button") {
        this._input.click(event);
      }
    }
    _onkeydown(event) {
      if ((0, _Keys.isEnter)(event)) {
        this._input.click(event);
        event.preventDefault();
      }
    }
    _onkeyup(event) {
      if ((0, _Keys.isSpace)(event)) {
        this._input.click(event);
        event.preventDefault();
      }
    }
    _onfocusin() {
      this.focused = true;
    }
    _onfocusout() {
      this.focused = false;
    }

    /**
     * FileList of all selected files.
     * @readonly
     * @type { FileList }
     * @public
     */
    get files() {
      if (this._input) {
        return this._input.files;
      }
      return FileUploader._emptyFilesList;
    }
    onBeforeRendering() {
      this._enableFormSupport();
    }
    onAfterRendering() {
      if (!this.value) {
        this._input.value = "";
      }
      this.toggleValueStatePopover(this.shouldOpenValueStateMessagePopover);
    }
    _enableFormSupport() {
      const FormSupport = (0, _FeaturesRegistry.getFeature)("FormSupport");
      if (FormSupport) {
        if (this._canUseNativeFormSupport) {
          this._setFormValue();
        } else {
          FormSupport.syncNativeFileInput(this, (element, nativeInput) => {
            nativeInput.disabled = element.disabled;
          }, this._onChange.bind(this));
        }
      } else if (this.name) {
        console.warn(`In order for the "name" property to have effect, you should also: import "@ui5/webcomponents/dist/features/InputElementsFormSupport.js";`); // eslint-disable-line
      }
    }

    _onChange(event) {
      this._updateValue(event.target.files);
      this.fireEvent("change", {
        files: event.target.files
      });
    }
    _updateValue(files) {
      this.value = Array.from(files).reduce((acc, currFile) => {
        return `${acc}"${currFile.name}" `;
      }, "");
    }
    _setFormValue() {
      const formData = new FormData();
      for (let i = 0; i < this.files.length; i++) {
        formData.append(this.name, this.files[i]);
      }
      this._internals.setFormValue(formData);
    }
    toggleValueStatePopover(open) {
      if (open) {
        this.openValueStatePopover();
      } else {
        this.closeValueStatePopover();
      }
    }
    async openValueStatePopover() {
      const popover = await this._getPopover();
      if (popover) {
        popover.showAt(this);
      }
    }
    async closeValueStatePopover() {
      const popover = await this._getPopover();
      if (popover) {
        popover.close();
      }
    }
    async _getPopover() {
      const staticAreaItem = await this.getStaticAreaItemDomRef();
      return staticAreaItem.querySelector(".ui5-valuestatemessage-popover");
    }

    /**
     * in case when the component is not placed in the DOM, return empty FileList, like native input would do
     * @private
     */
    static get _emptyFilesList() {
      if (!this.emptyInput) {
        this.emptyInput = document.createElement("input");
        this.emptyInput.type = "file";
      }
      return this.emptyInput.files;
    }
    get browseText() {
      return FileUploader.i18nBundle.getText(_i18nDefaults.FILEUPLOAD_BROWSE);
    }
    get titleText() {
      return FileUploader.i18nBundle.getText(_i18nDefaults.FILEUPLOADER_TITLE);
    }
    get _canUseNativeFormSupport() {
      return this._internals && this._internals.setFormValue;
    }
    get _keepInputInShadowDOM() {
      // only put input in the light dom when ui5-file-uploader is placed inside form and there is no support for form elements
      return this._canUseNativeFormSupport || !this.name;
    }
    get _input() {
      return this.shadowRoot.querySelector("input[type=file]") || this.querySelector("input[type=file][data-ui5-form-support]");
    }

    /**
     * Determines input helper type in forms.
     * @private
     */
    get _type() {
      return "file";
    }
    get valueStateTextMappings() {
      return {
        "Success": FileUploader.i18nBundle.getText(_i18nDefaults.VALUE_STATE_SUCCESS),
        "Information": FileUploader.i18nBundle.getText(_i18nDefaults.VALUE_STATE_INFORMATION),
        "Error": FileUploader.i18nBundle.getText(_i18nDefaults.VALUE_STATE_ERROR),
        "Warning": FileUploader.i18nBundle.getText(_i18nDefaults.VALUE_STATE_WARNING)
      };
    }
    get valueStateText() {
      return this.valueStateTextMappings[this.valueState];
    }
    get hasValueState() {
      return this.valueState !== _ValueState.default.None;
    }
    get hasValueStateText() {
      return this.hasValueState && this.valueState !== _ValueState.default.Success;
    }
    get valueStateMessageText() {
      return this.getSlottedNodes("valueStateMessage").map(el => el.cloneNode(true));
    }
    get shouldDisplayDefaultValueStateMessage() {
      return !this.valueStateMessage.length && this.hasValueStateText;
    }
    get shouldOpenValueStateMessagePopover() {
      return this.focused && this.hasValueStateText && !this.hideInput;
    }

    /**
     * This method is relevant for sap_horizon theme only
     */
    get _valueStateMessageInputIcon() {
      const iconPerValueState = {
        Error: "error",
        Warning: "alert",
        Success: "sys-enter-2",
        Information: "information"
      };
      return this.valueState !== _ValueState.default.None ? iconPerValueState[this.valueState] : "";
    }
    get classes() {
      return {
        popoverValueState: {
          "ui5-valuestatemessage-root": true,
          "ui5-valuestatemessage--success": this.valueState === _ValueState.default.Success,
          "ui5-valuestatemessage--error": this.valueState === _ValueState.default.Error,
          "ui5-valuestatemessage--warning": this.valueState === _ValueState.default.Warning,
          "ui5-valuestatemessage--information": this.valueState === _ValueState.default.Information
        }
      };
    }
    get styles() {
      return {
        popoverHeader: {
          "width": `${this.ui5Input ? this.ui5Input.offsetWidth : 0}px`
        }
      };
    }
    get ui5Input() {
      return this.shadowRoot.querySelector(".ui5-file-uploader-input");
    }
    static get dependencies() {
      return [_Input.default, _Popover.default, _Icon.default];
    }
    static async onDefine() {
      FileUploader.i18nBundle = await (0, _i18nBundle.getI18nBundle)("@ui5/webcomponents");
    }
  }
  FileUploader.define();
  var _default = FileUploader;
  _exports.default = _default;
});