sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/UI5Element", "sap/ui/webc/common/thirdparty/base/decorators/customElement", "sap/ui/webc/common/thirdparty/base/decorators/event", "sap/ui/webc/common/thirdparty/base/decorators/property", "sap/ui/webc/common/thirdparty/base/decorators/slot", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer", "sap/ui/webc/common/thirdparty/base/i18nBundle", "sap/ui/webc/main/thirdparty/Icon", "sap/ui/webc/main/thirdparty/Label", "sap/ui/webc/main/thirdparty/List", "sap/ui/webc/main/thirdparty/types/ListMode", "sap/ui/webc/main/thirdparty/Title", "./IllustratedMessage", "./illustrations/Tent", "sap/ui/webc/common/thirdparty/icons/upload-to-cloud", "sap/ui/webc/common/thirdparty/icons/document", "./generated/i18n/i18n-defaults", "./upload-utils/UploadCollectionBodyDnD", "./types/UploadCollectionDnDMode", "./generated/templates/UploadCollectionTemplate.lit", "./generated/themes/UploadCollection.css"], function (_exports, _UI5Element, _customElement, _event, _property, _slot, _LitRenderer, _i18nBundle, _Icon, _Label, _List, _ListMode, _Title, _IllustratedMessage, _Tent, _uploadToCloud, _document, _i18nDefaults, _UploadCollectionBodyDnD, _UploadCollectionDnDMode, _UploadCollectionTemplate, _UploadCollection) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _UI5Element = _interopRequireDefault(_UI5Element);
  _customElement = _interopRequireDefault(_customElement);
  _event = _interopRequireDefault(_event);
  _property = _interopRequireDefault(_property);
  _slot = _interopRequireDefault(_slot);
  _LitRenderer = _interopRequireDefault(_LitRenderer);
  _Icon = _interopRequireDefault(_Icon);
  _Label = _interopRequireDefault(_Label);
  _List = _interopRequireDefault(_List);
  _ListMode = _interopRequireDefault(_ListMode);
  _Title = _interopRequireDefault(_Title);
  _IllustratedMessage = _interopRequireDefault(_IllustratedMessage);
  _UploadCollectionDnDMode = _interopRequireDefault(_UploadCollectionDnDMode);
  _UploadCollectionTemplate = _interopRequireDefault(_UploadCollectionTemplate);
  _UploadCollection = _interopRequireDefault(_UploadCollection);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  var __decorate = void 0 && (void 0).__decorate || function (decorators, target, key, desc) {
    var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
  var UploadCollection_1;

  // Template

  // Styles

  /**
   * @class
   *
   * <h3 class="comment-api-title">Overview</h3>
   * This component allows you to represent files before uploading them to a server, with the help of <code>ui5-upload-collection-item</code>.
   * It also allows you to show already uploaded files.
   *
   * <h3>ES6 Module Import</h3>
   * <code>import "@ui5/webcomponents-fiori/dist/UploadCollection.js";</code>
   * <br>
   * <code>import "@ui5/webcomponents-fiori/dist/UploadCollectionItem.js";</code> (for <code>ui5-upload-collection-item</code>)
   *
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webc.fiori.UploadCollection
   * @extends sap.ui.webc.base.UI5Element
   * @tagname ui5-upload-collection
   * @appenddocs sap.ui.webc.fiori.UploadCollectionItem
   * @public
   * @since 1.0.0-rc.7
   */
  let UploadCollection = UploadCollection_1 = class UploadCollection extends _UI5Element.default {
    static async onDefine() {
      UploadCollection_1.i18nBundle = await (0, _i18nBundle.getI18nBundle)("@ui5/webcomponents-fiori");
    }
    constructor() {
      super();
      this._bodyDnDHandler = this.bodyDnDHandler.bind(this);
    }
    bodyDnDHandler(e) {
      if (this._dndOverlayMode !== _UploadCollectionDnDMode.default.Drop) {
        this._dndOverlayMode = e.mode;
      }
    }
    onEnterDOM() {
      if (this.hideDragOverlay) {
        return;
      }
      (0, _UploadCollectionBodyDnD.attachBodyDnDHandler)(this._bodyDnDHandler);
    }
    onExitDOM() {
      if (this.hideDragOverlay) {
        return;
      }
      (0, _UploadCollectionBodyDnD.detachBodyDnDHandler)(this._bodyDnDHandler);
    }
    _ondragenter(e) {
      if (this.hideDragOverlay) {
        return;
      }
      if (!(0, _UploadCollectionBodyDnD.draggingFiles)(e)) {
        return;
      }
      this._dndOverlayMode = _UploadCollectionDnDMode.default.Drop;
    }
    _ondrop(e) {
      if (this.hideDragOverlay) {
        return;
      }
      if (e.target !== this.shadowRoot.querySelector(".uc-dnd-overlay")) {
        e.stopPropagation();
      }
      this._dndOverlayMode = _UploadCollectionDnDMode.default.None;
    }
    _ondragover(e) {
      if (this.hideDragOverlay) {
        return;
      }
      e.preventDefault();
    }
    _ondragleave() {
      if (this.hideDragOverlay) {
        return;
      }
      this._dndOverlayMode = _UploadCollectionDnDMode.default.Drag;
    }
    _onItemDelete(e) {
      this.fireEvent("item-delete", {
        item: e.target
      });
    }
    _onSelectionChange(e) {
      this.fireEvent("selection-change", {
        selectedItems: e.detail.selectedItems
      });
    }
    get classes() {
      return {
        content: {
          "ui5-uc-content": true,
          "ui5-uc-content-no-data": this.items.length === 0
        },
        dndOverlay: {
          "uc-dnd-overlay": true,
          "uc-drag-overlay": this._dndOverlayMode === _UploadCollectionDnDMode.default.Drag,
          "uc-drop-overlay": this._dndOverlayMode === _UploadCollectionDnDMode.default.Drop
        },
        noFiles: {
          "uc-no-files": true,
          "uc-no-files-dnd-overlay": this._showDndOverlay
        }
      };
    }
    get _root() {
      return this.shadowRoot.querySelector(".ui5-uc-root");
    }
    get _dndOverlay() {
      return this._root?.querySelector(".uc-dnd-overlay");
    }
    get _showDndOverlay() {
      return this._dndOverlayMode !== _UploadCollectionDnDMode.default.None;
    }
    get _showNoData() {
      return this.items.length === 0;
    }
    get _noDataText() {
      return this.noDataText || UploadCollection_1.i18nBundle.getText(_i18nDefaults.UPLOADCOLLECTION_NO_DATA_TEXT);
    }
    get _noDataDescription() {
      return this.noDataDescription || UploadCollection_1.i18nBundle.getText(_i18nDefaults.UPLOADCOLLECTION_NO_DATA_DESCRIPTION);
    }
    get _roleDescription() {
      return UploadCollection_1.i18nBundle.getText(_i18nDefaults.UPLOADCOLLECTION_ARIA_ROLE_DESCRIPTION);
    }
    get _dndOverlayText() {
      if (this._dndOverlayMode === _UploadCollectionDnDMode.default.Drag) {
        return UploadCollection_1.i18nBundle.getText(_i18nDefaults.UPLOADCOLLECTION_DRAG_FILE_INDICATOR);
      }
      return UploadCollection_1.i18nBundle.getText(_i18nDefaults.UPLOADCOLLECTION_DROP_FILE_INDICATOR);
    }
  };
  __decorate([(0, _property.default)({
    type: _ListMode.default,
    defaultValue: _ListMode.default.None
  })], UploadCollection.prototype, "mode", void 0);
  __decorate([(0, _property.default)()], UploadCollection.prototype, "noDataDescription", void 0);
  __decorate([(0, _property.default)()], UploadCollection.prototype, "noDataText", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], UploadCollection.prototype, "hideDragOverlay", void 0);
  __decorate([(0, _property.default)()], UploadCollection.prototype, "accessibleName", void 0);
  __decorate([(0, _property.default)({
    type: _UploadCollectionDnDMode.default,
    defaultValue: _UploadCollectionDnDMode.default.None
  })], UploadCollection.prototype, "_dndOverlayMode", void 0);
  __decorate([(0, _slot.default)({
    type: HTMLElement,
    "default": true
  })], UploadCollection.prototype, "items", void 0);
  __decorate([(0, _slot.default)({
    type: HTMLElement
  })], UploadCollection.prototype, "header", void 0);
  UploadCollection = UploadCollection_1 = __decorate([(0, _customElement.default)({
    tag: "ui5-upload-collection",
    languageAware: true,
    renderer: _LitRenderer.default,
    styles: _UploadCollection.default,
    template: _UploadCollectionTemplate.default,
    dependencies: [_Icon.default, _Label.default, _List.default, _Title.default, _IllustratedMessage.default]
  })
  /**
   * Fired when an element is dropped inside the drag and drop overlay.
   * <br><br>
   * <b>Note:</b> The <code>drop</code> event is fired only when elements are dropped within the drag and drop overlay and ignored for the other parts of the <code>ui5-upload-collection</code>.
   *
   * @event sap.ui.webc.fiori.UploadCollection#drop
   * @readonly
   * @param {DataTransfer} dataTransfer The <code>drop</code> event operation data.
   * @public
   * @native
   */, (0, _event.default)("drop")
  /**
   * Fired when the delete button of any item is pressed.
   *
   * @event sap.ui.webc.fiori.UploadCollection#item-delete
   * @param {HTMLElement} item The <code>ui5-upload-collection-item</code> which was deleted.
   * @public
   */, (0, _event.default)("item-delete", {
    detail: {
      item: {
        type: HTMLElement
      }
    }
  })
  /**
   * Fired when selection is changed by user interaction
   * in <code>SingleSelect</code> and <code>MultiSelect</code> modes.
   *
   * @event sap.ui.webc.fiori.UploadCollection#selection-change
   * @param {Array} selectedItems An array of the selected items.
   * @public
   */, (0, _event.default)("selection-change", {
    detail: {
      selectedItems: {
        type: Array
      }
    }
  })], UploadCollection);
  UploadCollection.define();
  var _default = UploadCollection;
  _exports.default = _default;
});