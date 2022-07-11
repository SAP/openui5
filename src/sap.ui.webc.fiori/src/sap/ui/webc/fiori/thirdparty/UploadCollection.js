sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/UI5Element", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer", "sap/ui/webc/common/thirdparty/base/i18nBundle", "sap/ui/webc/main/thirdparty/Icon", "sap/ui/webc/main/thirdparty/Label", "sap/ui/webc/main/thirdparty/List", "sap/ui/webc/main/thirdparty/types/ListMode", "sap/ui/webc/main/thirdparty/Title", "sap/ui/webc/common/thirdparty/icons/upload-to-cloud", "sap/ui/webc/common/thirdparty/icons/document", "./generated/i18n/i18n-defaults", "./upload-utils/UploadCollectionBodyDnD", "./types/UploadCollectionDnDMode", "./generated/templates/UploadCollectionTemplate.lit", "./generated/themes/UploadCollection.css"], function (_exports, _UI5Element, _LitRenderer, _i18nBundle, _Icon, _Label, _List, _ListMode, _Title, _uploadToCloud, _document, _i18nDefaults, _UploadCollectionBodyDnD, _UploadCollectionDnDMode, _UploadCollectionTemplate, _UploadCollection) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _UI5Element = _interopRequireDefault(_UI5Element);
  _LitRenderer = _interopRequireDefault(_LitRenderer);
  _Icon = _interopRequireDefault(_Icon);
  _Label = _interopRequireDefault(_Label);
  _List = _interopRequireDefault(_List);
  _ListMode = _interopRequireDefault(_ListMode);
  _Title = _interopRequireDefault(_Title);
  _UploadCollectionDnDMode = _interopRequireDefault(_UploadCollectionDnDMode);
  _UploadCollectionTemplate = _interopRequireDefault(_UploadCollectionTemplate);
  _UploadCollection = _interopRequireDefault(_UploadCollection);

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

  // Template
  // Styles

  /**
   * @public
   */
  const metadata = {
    tag: "ui5-upload-collection",
    languageAware: true,
    properties:
    /** @lends sap.ui.webcomponents.fiori.UploadCollection.prototype */
    {
      /**
       * Defines the mode of the <code>ui5-upload-collection</code>.
       *
       * <br><br>
       * <b>Note:</b>
       * <ul>
       * <li><code>None</code></li>
       * <li><code>SingleSelect</code></li>
       * <li><code>MultiSelect</code></li>
       * <li><code>Delete</code></li>
       * </ul>
       *
       * @type {ListMode}
       * @defaultvalue "None"
       * @public
       */
      mode: {
        type: _ListMode.default,
        defaultValue: _ListMode.default.None
      },

      /**
       * Allows you to set your own text for the 'No data' description.
       *
       * @type {string}
       * @defaultvalue ""
       * @public
       */
      noDataDescription: {
        type: String
      },

      /**
       * Allows you to set your own text for the 'No data' text.
       *
       * @type {string}
       * @defaultvalue ""
       * @public
       */
      noDataText: {
        type: String
      },

      /**
       * By default there will be drag and drop overlay shown over the <code>ui5-upload-collection</code> when files
       * are dragged. If you don't intend to use drag and drop, set this property.
       * <br><br>
       * <b>Note:</b> It is up to the application developer to add handler for <code>drop</code> event and handle it.
       * <code>ui5-upload-collection</code> only displays an overlay.
       *
       * @type {boolean}
       * @defaultvalue false
       * @public
       */
      hideDragOverlay: {
        type: Boolean
      },

      /**
       * Indicates what overlay to show when files are being dragged.
       *
       * @type {UploadCollectionDnDOverlayMode}
       * @defaultvalue "None"
       * @private
       */
      _dndOverlayMode: {
        type: String,
        defaultValue: _UploadCollectionDnDMode.default.None
      },

      /**
       * Defines the accessible aria name of the component.
       *
       * @type {string}
       * @defaultvalue ""
       * @public
       * @since 1.0.0-rc.16
       */
      accessibleName: {
        type: String
      }
    },
    managedSlots: true,
    slots:
    /** @lends sap.ui.webcomponents.fiori.UploadCollection.prototype */
    {
      /**
       * Defines the items of the <code>ui5-upload-collection</code>.
       * <br><b>Note:</b> Use <code>ui5-upload-collection-item</code> for the intended design.
       *
       * @type {sap.ui.webcomponents.fiori.IUploadCollectionItem[]}
       * @slot items
       * @public
       */
      "default": {
        propertyName: "items",
        type: HTMLElement
      },

      /**
       * Defines the <code>ui5-upload-collection</code> header.
       * <br><br>
       * <b>Note:</b> If <code>header</code> slot is provided,
       * the labelling of the <code>UploadCollection</code> is a responsibility of the application developer.
       * <code>accessibleName</code> should be used.
       *
       * @type {HTMLElement[]}
       * @slot
       * @public
       */
      header: {
        type: HTMLElement
      }
    },
    events:
    /** @lends sap.ui.webcomponents.fiori.UploadCollection.prototype */
    {
      /**
       * Fired when an element is dropped inside the drag and drop overlay.
       * <br><br>
       * <b>Note:</b> The <code>drop</code> event is fired only when elements are dropped within the drag and drop overlay and ignored for the other parts of the <code>ui5-upload-collection</code>.
       *
       * @event sap.ui.webcomponents.fiori.UploadCollection#drop
       * @readonly
       * @param {DataTransfer} dataTransfer The <code>drop</code> event operation data.
       * @public
       * @native
       */
      drop: {},

      /**
       * Fired when the Delete button of any item is pressed.
       * <br><br>
       * <b>Note:</b> A Delete button is displayed on each item,
       * when the <code>ui5-upload-collection</code> <code>mode</code> property is set to <code>Delete</code>.
       * @event sap.ui.webcomponents.fiori.UploadCollection#item-delete
       * @param {HTMLElement} item The <code>ui5-upload-collection-item</code> which was renamed.
       * @public
       */
      "item-delete": {
        detail: {
          item: {
            type: HTMLElement
          }
        }
      },

      /**
       * Fired when selection is changed by user interaction
       * in <code>SingleSelect</code> and <code>MultiSelect</code> modes.
       *
       * @event sap.ui.webcomponents.fiori.UploadCollection#selection-change
       * @param {Array} selectedItems An array of the selected items.
       * @public
       */
      "selection-change": {
        detail: {
          selectedItems: {
            type: Array
          }
        }
      }
    }
  };
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
   * @alias sap.ui.webcomponents.fiori.UploadCollection
   * @extends UI5Element
   * @tagname ui5-upload-collection
   * @appenddocs UploadCollectionItem
   * @public
   * @since 1.0.0-rc.7
   */

  class UploadCollection extends _UI5Element.default {
    static get metadata() {
      return metadata;
    }

    static get render() {
      return _LitRenderer.default;
    }

    static get styles() {
      return _UploadCollection.default;
    }

    static get template() {
      return _UploadCollectionTemplate.default;
    }

    static get dependencies() {
      return [_Icon.default, _Label.default, _List.default, _Title.default];
    }

    static async onDefine() {
      UploadCollection.i18nBundle = await (0, _i18nBundle.getI18nBundle)("@ui5/webcomponents-fiori");
    }

    constructor() {
      super();

      this._bodyDnDHandler = event => {
        if (this._dndOverlayMode !== _UploadCollectionDnDMode.default.Drop) {
          this._dndOverlayMode = event.mode;
        }
      };
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

    _ondragenter(event) {
      if (this.hideDragOverlay) {
        return;
      }

      if (!(0, _UploadCollectionBodyDnD.draggingFiles)(event)) {
        return;
      }

      this._dndOverlayMode = _UploadCollectionDnDMode.default.Drop;
    }

    _ondrop(event) {
      if (this.hideDragOverlay) {
        return;
      }

      if (event.target !== this.shadowRoot.querySelector(".uc-dnd-overlay")) {
        event.stopPropagation();
      }

      this._dndOverlayMode = _UploadCollectionDnDMode.default.None;
    }

    _ondragover(event) {
      if (this.hideDragOverlay) {
        return;
      }

      event.preventDefault();
    }

    _ondragleave() {
      if (this.hideDragOverlay) {
        return;
      }

      this._dndOverlayMode = _UploadCollectionDnDMode.default.Drag;
    }

    _onItemDelete(event) {
      this.fireEvent("item-delete", {
        item: event.detail.item
      });
    }

    _onSelectionChange(event) {
      this.fireEvent("selection-change", {
        selectedItems: event.detail.selectedItems
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
      return this._root.querySelector(".uc-dnd-overlay");
    }

    get _showDndOverlay() {
      return this._dndOverlayMode !== _UploadCollectionDnDMode.default.None;
    }

    get _showNoData() {
      return this.items.length === 0;
    }

    get _noDataText() {
      return this.noDataText || UploadCollection.i18nBundle.getText(_i18nDefaults.UPLOADCOLLECTION_NO_DATA_TEXT);
    }

    get _noDataDescription() {
      return this.noDataDescription || UploadCollection.i18nBundle.getText(_i18nDefaults.UPLOADCOLLECTION_NO_DATA_DESCRIPTION);
    }

    get _roleDescription() {
      return UploadCollection.i18nBundle.getText(_i18nDefaults.UPLOADCOLLECTION_ARIA_ROLE_DESCRIPTION);
    }

    get _dndOverlayText() {
      if (this._dndOverlayMode === _UploadCollectionDnDMode.default.Drag) {
        return UploadCollection.i18nBundle.getText(_i18nDefaults.UPLOADCOLLECTION_DRAG_FILE_INDICATOR);
      }

      return UploadCollection.i18nBundle.getText(_i18nDefaults.UPLOADCOLLECTION_DROP_FILE_INDICATOR);
    }

  }

  UploadCollection.define();
  var _default = UploadCollection;
  _exports.default = _default;
});