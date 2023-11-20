sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/decorators/customElement", "sap/ui/webc/common/thirdparty/base/decorators/event", "sap/ui/webc/common/thirdparty/base/decorators/property", "sap/ui/webc/common/thirdparty/base/decorators/slot", "sap/ui/webc/common/thirdparty/base/i18nBundle", "sap/ui/webc/common/thirdparty/base/types/Integer", "sap/ui/webc/common/thirdparty/base/types/ValueState", "sap/ui/webc/main/thirdparty/types/ListItemType", "sap/ui/webc/main/thirdparty/Button", "sap/ui/webc/main/thirdparty/Input", "sap/ui/webc/main/thirdparty/Label", "sap/ui/webc/main/thirdparty/Link", "sap/ui/webc/main/thirdparty/ProgressIndicator", "sap/ui/webc/main/thirdparty/ListItem", "sap/ui/webc/common/thirdparty/base/util/getFileExtension", "sap/ui/webc/common/thirdparty/base/Render", "sap/ui/webc/common/thirdparty/base/Keys", "./types/UploadState", "sap/ui/webc/common/thirdparty/icons/refresh", "sap/ui/webc/common/thirdparty/icons/stop", "sap/ui/webc/common/thirdparty/icons/edit", "./generated/i18n/i18n-defaults", "./generated/templates/UploadCollectionItemTemplate.lit", "./generated/themes/UploadCollectionItem.css"], function (_exports, _customElement, _event, _property, _slot, _i18nBundle, _Integer, _ValueState, _ListItemType, _Button, _Input, _Label, _Link, _ProgressIndicator, _ListItem, _getFileExtension, _Render, _Keys, _UploadState, _refresh, _stop, _edit, _i18nDefaults, _UploadCollectionItemTemplate, _UploadCollectionItem) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _customElement = _interopRequireDefault(_customElement);
  _event = _interopRequireDefault(_event);
  _property = _interopRequireDefault(_property);
  _slot = _interopRequireDefault(_slot);
  _Integer = _interopRequireDefault(_Integer);
  _ValueState = _interopRequireDefault(_ValueState);
  _ListItemType = _interopRequireDefault(_ListItemType);
  _Button = _interopRequireDefault(_Button);
  _Input = _interopRequireDefault(_Input);
  _Label = _interopRequireDefault(_Label);
  _Link = _interopRequireDefault(_Link);
  _ProgressIndicator = _interopRequireDefault(_ProgressIndicator);
  _ListItem = _interopRequireDefault(_ListItem);
  _getFileExtension = _interopRequireDefault(_getFileExtension);
  _UploadState = _interopRequireDefault(_UploadState);
  _UploadCollectionItemTemplate = _interopRequireDefault(_UploadCollectionItemTemplate);
  _UploadCollectionItem = _interopRequireDefault(_UploadCollectionItem);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  var __decorate = void 0 && (void 0).__decorate || function (decorators, target, key, desc) {
    var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
  var UploadCollectionItem_1;

  // Template

  // Styles

  /**
   * @class
   *
   * <h3 class="comment-api-title">Overview</h3>
   * A component to be used within the <code>ui5-upload-collection</code>.
   *
   * <h3>ES6 Module Import</h3>
   *
   * <code>import "@ui5/webcomponents-fiori/dist/UploadCollectionItem.js";</code>
   *
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webc.fiori.UploadCollectionItem
   * @extends sap.ui.webc.main.ListItem
   * @tagname ui5-upload-collection-item
   * @public
   * @implements sap.ui.webc.fiori.IUploadCollectionItem
   * @since 1.0.0-rc.7
   */
  let UploadCollectionItem = UploadCollectionItem_1 = class UploadCollectionItem extends _ListItem.default {
    static async onDefine() {
      [UploadCollectionItem_1.i18nFioriBundle] = await Promise.all([(0, _i18nBundle.getI18nBundle)("@ui5/webcomponents-fiori"), super.onDefine()]);
    }
    /**
     * @override
     */
    async onDetailClick() {
      super.onDetailClick();
      this._editing = true;
      await this._initInputField();
    }
    async _initInputField() {
      await (0, _Render.renderFinished)();
      const inp = this.shadowRoot.querySelector("#ui5-uci-edit-input");
      inp.value = this._fileNameWithoutExtension;
      await (0, _Render.renderFinished)();
      const inpFocusDomRef = inp.getFocusDomRef();
      if (inpFocusDomRef) {
        inpFocusDomRef.focus();
        inpFocusDomRef.setSelectionRange(0, this._fileNameWithoutExtension.length);
      }
    }
    _onDetailKeyup(e) {
      if ((0, _Keys.isSpace)(e)) {
        this.onDetailClick();
      }
    }
    _onInputFocusin(e) {
      // prevent focusing the whole upload collection item.
      e.stopPropagation();
    }
    _onInputKeyDown(e) {
      if ((0, _Keys.isEscape)(e)) {
        this._onRenameCancel(e);
      } else if ((0, _Keys.isEnter)(e)) {
        this._onRename();
      } else if ((0, _Keys.isSpace)(e)) {
        e.stopImmediatePropagation();
      }
    }
    _onRename() {
      const inp = this.shadowRoot.querySelector("#ui5-uci-edit-input");
      this.fileName = inp.value + this._fileExtension;
      this.fireEvent("rename");
      this._editing = false;
      this._focus();
    }
    _onRenameKeyup(e) {
      if ((0, _Keys.isSpace)(e)) {
        this._onRename();
      }
    }
    async _onRenameCancel(e) {
      this._editing = false;
      if ((0, _Keys.isEscape)(e)) {
        await (0, _Render.renderFinished)();
        this.shadowRoot.querySelector(`#${this._id}-editing-button`).focus();
      } else {
        this._focus();
      }
    }
    _onRenameCancelKeyup(e) {
      if ((0, _Keys.isSpace)(e)) {
        this._onRenameCancel(e);
      }
    }
    _focus() {
      this.fireEvent("_focus-requested");
    }
    _onFileNameClick() {
      this.fireEvent("file-name-click");
    }
    _onRetry() {
      this.fireEvent("retry");
    }
    _onRetryKeyup(e) {
      if ((0, _Keys.isSpace)(e)) {
        this._onRetry();
      }
    }
    _onTerminate() {
      this.fireEvent("terminate");
    }
    _onTerminateKeyup(e) {
      if ((0, _Keys.isSpace)(e)) {
        this._onTerminate();
      }
    }
    _onDelete() {
      this.fireEvent("_uci-delete");
    }
    getFocusDomRef() {
      return this.getDomRef();
    }
    /**
     * @override
     */
    get classes() {
      const result = super.classes;
      return {
        main: {
          ...result.main,
          "ui5-uci-root": true,
          "ui5-uci-root-editing": this._editing,
          "ui5-uci-root-uploading": this.uploadState === _UploadState.default.Uploading
        }
      };
    }
    /**
     * @override
     */
    get renderUploadCollectionDeleteButton() {
      return !this.hideDeleteButton;
    }
    get _fileNameWithoutExtension() {
      return this.fileName.substring(0, this.fileName.length - this._fileExtension.length);
    }
    get _fileExtension() {
      return (0, _getFileExtension.default)(this.fileName);
    }
    get _renameBtnText() {
      return UploadCollectionItem_1.i18nFioriBundle.getText(_i18nDefaults.UPLOADCOLLECTIONITEM_RENAMEBUTTON_TEXT);
    }
    get _cancelRenameBtnText() {
      return UploadCollectionItem_1.i18nFioriBundle.getText(_i18nDefaults.UPLOADCOLLECTIONITEM_CANCELBUTTON_TEXT);
    }
    get _showProgressIndicator() {
      return this.uploadState !== _UploadState.default.Complete;
    }
    get _progressText() {
      if (this.uploadState === _UploadState.default.Uploading) {
        return UploadCollectionItem_1.i18nFioriBundle.getText(_i18nDefaults.UPLOADCOLLECTIONITEM_UPLOADING_STATE);
      }
      if (this.uploadState === _UploadState.default.Error) {
        return UploadCollectionItem_1.i18nFioriBundle.getText(_i18nDefaults.UPLOADCOLLECTIONITEM_ERROR_STATE);
      }
      return UploadCollectionItem_1.i18nFioriBundle.getText(_i18nDefaults.UPLOADCOLLECTIONITEM_READY_STATE);
    }
    get _showRetry() {
      return !this.hideRetryButton && this.uploadState === _UploadState.default.Error;
    }
    get _showTerminate() {
      return !this.hideTerminateButton && this.uploadState === _UploadState.default.Uploading;
    }
    get _retryButtonTooltip() {
      return UploadCollectionItem_1.i18nFioriBundle.getText(_i18nDefaults.UPLOADCOLLECTIONITEM_RETRY_BUTTON_TEXT);
    }
    get _terminateButtonTooltip() {
      return UploadCollectionItem_1.i18nFioriBundle.getText(_i18nDefaults.UPLOADCOLLECTIONITEM_TERMINATE_BUTTON_TEXT);
    }
    get _editButtonTooltip() {
      return UploadCollectionItem_1.i18nFioriBundle.getText(_i18nDefaults.UPLOADCOLLECTIONITEM_EDIT_BUTTON_TEXT);
    }
    get valueStateName() {
      if (this.uploadState === _UploadState.default.Error) {
        return _ValueState.default.Error;
      }
      if (this.uploadState === _UploadState.default.Ready || this.uploadState === _UploadState.default.Uploading) {
        return _ValueState.default.Information;
      }
      return _ValueState.default.None;
    }
    /**
     * override
     */
    get typeDetail() {
      return false;
    }
    get showEditButton() {
      return this.type === _ListItemType.default.Detail;
    }
  };
  __decorate([(0, _property.default)({
    type: Object,
    noAttribute: true,
    defaultValue: null
  })], UploadCollectionItem.prototype, "file", void 0);
  __decorate([(0, _property.default)()], UploadCollectionItem.prototype, "fileName", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], UploadCollectionItem.prototype, "fileNameClickable", void 0);
  __decorate([(0, _property.default)({
    type: Boolean,
    noAttribute: false
  })], UploadCollectionItem.prototype, "disableDeleteButton", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], UploadCollectionItem.prototype, "hideDeleteButton", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], UploadCollectionItem.prototype, "hideRetryButton", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], UploadCollectionItem.prototype, "hideTerminateButton", void 0);
  __decorate([(0, _property.default)({
    validator: _Integer.default,
    defaultValue: 0
  })], UploadCollectionItem.prototype, "progress", void 0);
  __decorate([(0, _property.default)({
    type: _UploadState.default,
    defaultValue: _UploadState.default.Ready
  })], UploadCollectionItem.prototype, "uploadState", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], UploadCollectionItem.prototype, "_editing", void 0);
  __decorate([(0, _slot.default)({
    type: HTMLElement
  })], UploadCollectionItem.prototype, "thumbnail", void 0);
  UploadCollectionItem = UploadCollectionItem_1 = __decorate([(0, _customElement.default)({
    tag: "ui5-upload-collection-item",
    languageAware: true,
    styles: [_ListItem.default.styles, _UploadCollectionItem.default],
    template: _UploadCollectionItemTemplate.default,
    dependencies: [..._ListItem.default.dependencies, _Button.default, _Input.default, _Link.default, _Label.default, _ProgressIndicator.default]
  })
  /**
   * Fired when the file name is clicked.
   * <br><br>
   * <b>Note:</b> This event is only available when <code>fileNameClickable</code> property is <code>true</code>.
   *
   * @event sap.ui.webc.fiori.UploadCollectionItem#file-name-click
   * @public
   */, (0, _event.default)("file-name-click")
  /**
   * Fired when the <code>fileName</code> property gets changed.
   * <br><br>
   * <b>Note:</b> An edit button is displayed on each item,
   * when the <code>ui5-upload-collection-item</code> <code>type</code> property is set to <code>Detail</code>.
   *
   * @event sap.ui.webc.fiori.UploadCollectionItem#rename
   * @public
   */, (0, _event.default)("rename")
  /**
   * Fired when the terminate button is pressed.
   * <br><br>
   * <b>Note:</b> Terminate button is displayed when <code>uploadState</code> property is set to <code>Uploading</code>.
   *
   * @event sap.ui.webc.fiori.UploadCollectionItem#terminate
   * @public
   */, (0, _event.default)("terminate")
  /**
   * Fired when the retry button is pressed.
   * <br><br>
   * <b>Note:</b> Retry button is displayed when <code>uploadState</code> property is set to <code>Error</code>.
   *
   * @event sap.ui.webc.fiori.UploadCollectionItem#retry
   * @public
   */, (0, _event.default)("retry")
  /**
   * @since 1.0.0-rc.8
   *
   * @event
   * @private
   */, (0, _event.default)("_focus-requested")
  /**
   * @private
   */, (0, _event.default)("_uci-delete")], UploadCollectionItem);
  UploadCollectionItem.define();
  var _default = UploadCollectionItem;
  _exports.default = _default;
});