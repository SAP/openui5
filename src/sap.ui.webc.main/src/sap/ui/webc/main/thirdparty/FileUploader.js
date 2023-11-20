sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/UI5Element", "sap/ui/webc/common/thirdparty/base/decorators/customElement", "sap/ui/webc/common/thirdparty/base/decorators/property", "sap/ui/webc/common/thirdparty/base/decorators/event", "sap/ui/webc/common/thirdparty/base/decorators/slot", "sap/ui/webc/common/thirdparty/base/types/ValueState", "sap/ui/webc/common/thirdparty/base/FeaturesRegistry", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer", "sap/ui/webc/common/thirdparty/base/i18nBundle", "sap/ui/webc/common/thirdparty/base/MarkedEvents", "sap/ui/webc/common/thirdparty/base/Keys", "./generated/i18n/i18n-defaults", "./Input", "./Popover", "./Icon", "./generated/templates/FileUploaderTemplate.lit", "./generated/templates/FileUploaderPopoverTemplate.lit", "./generated/themes/FileUploader.css", "./generated/themes/ResponsivePopoverCommon.css", "./generated/themes/ValueStateMessage.css"], function (_exports, _UI5Element, _customElement, _property, _event, _slot, _ValueState, _FeaturesRegistry, _LitRenderer, _i18nBundle, _MarkedEvents, _Keys, _i18nDefaults, _Input, _Popover, _Icon, _FileUploaderTemplate, _FileUploaderPopoverTemplate, _FileUploader, _ResponsivePopoverCommon, _ValueStateMessage) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _UI5Element = _interopRequireDefault(_UI5Element);
  _customElement = _interopRequireDefault(_customElement);
  _property = _interopRequireDefault(_property);
  _event = _interopRequireDefault(_event);
  _slot = _interopRequireDefault(_slot);
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
  var __decorate = void 0 && (void 0).__decorate || function (decorators, target, key, desc) {
    var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
  var FileUploader_1;

  // Template

  // Styles

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
   * @alias sap.ui.webc.main.FileUploader
   * @extends sap.ui.webc.base.UI5Element
   * @tagname ui5-file-uploader
   * @public
   */
  let FileUploader = FileUploader_1 = class FileUploader extends _UI5Element.default {
    static get formAssociated() {
      return true;
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
    _onclick(e) {
      if ((0, _MarkedEvents.getEventMark)(e) === "button") {
        this._input.click();
      }
    }
    _onkeydown(e) {
      if ((0, _Keys.isEnter)(e)) {
        this._input.click();
        e.preventDefault();
      }
    }
    _onkeyup(e) {
      if ((0, _Keys.isSpace)(e)) {
        this._input.click();
        e.preventDefault();
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
     * @type {FileList}
     * @public
     * @name sap.ui.webc.main.FileUploader.prototype.files
     */
    get files() {
      if (this._input) {
        return this._input.files;
      }
      return FileUploader_1._emptyFilesList;
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
      const formSupport = (0, _FeaturesRegistry.getFeature)("FormSupport");
      if (formSupport) {
        if (this._canUseNativeFormSupport) {
          this._setFormValue();
        } else {
          formSupport.syncNativeFileInput(this, (element, nativeInput) => {
            nativeInput.disabled = !!element.disabled;
          }, this._onChange.bind(this));
        }
      } else if (this.name) {
        console.warn(`In order for the "name" property to have effect, you should also: import "@ui5/webcomponents/dist/features/InputElementsFormSupport.js";`); // eslint-disable-line
      }
    }

    _onChange(e) {
      const changedFiles = e.target.files;
      this._updateValue(changedFiles);
      this.fireEvent("change", {
        files: changedFiles
      });
    }
    _updateValue(files) {
      this.value = Array.from(files || []).reduce((acc, currFile) => {
        return `${acc}"${currFile.name}" `;
      }, "");
    }
    _setFormValue() {
      const formData = new FormData();
      if (this.files) {
        for (let i = 0; i < this.files.length; i++) {
          formData.append(this.name, this.files[i]);
        }
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
      return FileUploader_1.i18nBundle.getText(_i18nDefaults.FILEUPLOAD_BROWSE);
    }
    get titleText() {
      return FileUploader_1.i18nBundle.getText(_i18nDefaults.FILEUPLOADER_TITLE);
    }
    get _canUseNativeFormSupport() {
      return !!(this._internals && this._internals.setFormValue);
    }
    get _keepInputInShadowDOM() {
      // only put input in the light dom when ui5-file-uploader is placed inside form and there is no support for form elements
      return this._canUseNativeFormSupport || !this.name;
    }
    get _input() {
      return this.shadowRoot.querySelector("input[type=file]") || this.querySelector("input[type=file][data-ui5-form-support]");
    }
    get valueStateTextMappings() {
      return {
        "Success": FileUploader_1.i18nBundle.getText(_i18nDefaults.VALUE_STATE_SUCCESS),
        "Information": FileUploader_1.i18nBundle.getText(_i18nDefaults.VALUE_STATE_INFORMATION),
        "Error": FileUploader_1.i18nBundle.getText(_i18nDefaults.VALUE_STATE_ERROR),
        "Warning": FileUploader_1.i18nBundle.getText(_i18nDefaults.VALUE_STATE_WARNING)
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
    static async onDefine() {
      FileUploader_1.i18nBundle = await (0, _i18nBundle.getI18nBundle)("@ui5/webcomponents");
    }
  };
  __decorate([(0, _property.default)()], FileUploader.prototype, "accept", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], FileUploader.prototype, "hideInput", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], FileUploader.prototype, "disabled", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], FileUploader.prototype, "multiple", void 0);
  __decorate([(0, _property.default)()], FileUploader.prototype, "name", void 0);
  __decorate([(0, _property.default)()], FileUploader.prototype, "placeholder", void 0);
  __decorate([(0, _property.default)()], FileUploader.prototype, "value", void 0);
  __decorate([(0, _property.default)({
    type: _ValueState.default,
    defaultValue: _ValueState.default.None
  })], FileUploader.prototype, "valueState", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], FileUploader.prototype, "focused", void 0);
  __decorate([(0, _slot.default)({
    type: HTMLElement,
    "default": true
  })], FileUploader.prototype, "content", void 0);
  __decorate([(0, _slot.default)()], FileUploader.prototype, "valueStateMessage", void 0);
  __decorate([(0, _slot.default)()], FileUploader.prototype, "formSupport", void 0);
  FileUploader = FileUploader_1 = __decorate([(0, _customElement.default)({
    tag: "ui5-file-uploader",
    languageAware: true,
    renderer: _LitRenderer.default,
    styles: _FileUploader.default,
    template: _FileUploaderTemplate.default,
    staticAreaTemplate: _FileUploaderPopoverTemplate.default,
    staticAreaStyles: [_ResponsivePopoverCommon.default, _ValueStateMessage.default],
    dependencies: [_Input.default, _Popover.default, _Icon.default]
  })
  /**
   * Event is fired when the value of the file path has been changed.
   * <b>Note:</b> Keep in mind that because of the HTML input element of type file, the event is also fired in Chrome browser when the Cancel button of the uploads window is pressed.
   *
   * @event sap.ui.webc.main.FileUploader#change
   * @param {FileList} files The current files.
   * @public
   */, (0, _event.default)("change", {
    detail: {
      files: {
        type: FileList
      }
    }
  })], FileUploader);
  FileUploader.define();
  var _default = FileUploader;
  _exports.default = _default;
});