sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/Keys", "sap/ui/webc/common/thirdparty/icons/decline", "sap/ui/webc/common/thirdparty/icons/edit", "sap/ui/webc/common/thirdparty/base/i18nBundle", "./types/ListItemType", "./types/ListMode", "./ListItemBase", "./RadioButton", "./CheckBox", "./Button", "./generated/i18n/i18n-defaults", "./generated/themes/ListItem.css"], function (_exports, _Keys, _decline, _edit, _i18nBundle, _ListItemType, _ListMode, _ListItemBase, _RadioButton, _CheckBox, _Button, _i18nDefaults, _ListItem) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _ListItemType = _interopRequireDefault(_ListItemType);
  _ListMode = _interopRequireDefault(_ListMode);
  _ListItemBase = _interopRequireDefault(_ListItemBase);
  _RadioButton = _interopRequireDefault(_RadioButton);
  _CheckBox = _interopRequireDefault(_CheckBox);
  _Button = _interopRequireDefault(_Button);
  _ListItem = _interopRequireDefault(_ListItem);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  // Styles

  /**
   * @public
   */
  const metadata = {
    languageAware: true,
    properties: /** @lends sap.ui.webcomponents.main.ListItem.prototype */{
      /**
       * Defines the visual indication and behavior of the list items.
       * Available options are <code>Active</code> (by default), <code>Inactive</code> and <code>Detail</code>.
       * <br><br>
       * <b>Note:</b> When set to <code>Active</code>, the item will provide visual response upon press and hover,
       * while with type <code>Inactive</code> and <code>Detail</code> - will not.
       *
       * @type {ListItemType}
       * @defaultvalue "Active"
       * @public
      */
      type: {
        type: _ListItemType.default,
        defaultValue: _ListItemType.default.Active
      },
      /**
       * Indicates if the list item is active, e.g pressed down with the mouse or the keyboard keys.
       *
       * @type {boolean}
       * @private
      */
      active: {
        type: Boolean
      },
      /**
       * Defines the tooltip of the component.
       * @type {string}
       * @defaultvalue ""
       * @private
       * @since 1.0.0-rc.15
       */
      title: {
        type: String
      },
      /**
       * Indicates if the list item is actionable, e.g has hover and pressed effects.
       *
       * @type {boolean}
       * @private
      */
      actionable: {
        type: Boolean
      },
      /**
       * Used to define the role of the list item.
       *
       * @private
       * @type {string}
       * @defaultvalue "listitem"
       * @since 1.0.0-rc.9
       *
       */
      role: {
        type: String,
        defaultValue: "listitem"
      },
      /**
       * Used to define the role of the list item.
       *
       * @private
       * @type {string}
       * @defaultvalue ""
       * @since 1.3.0
       *
       */
      accessibleRole: {
        type: String
      },
      _mode: {
        type: _ListMode.default,
        defaultValue: _ListMode.default.None
      },
      _ariaHasPopup: {
        type: String,
        noAttribute: true
      }
    },
    events: /** @lends sap.ui.webcomponents.main.ListItem.prototype */{
      /**
       * Fired when the user clicks on the detail button when type is <code>Detail</code>.
       *
       * @event sap.ui.webcomponents.main.ListItem#detail-click
       * @public
       */
      "detail-click": {},
      _press: {},
      _focused: {},
      "_selection-requested": {}
    }
  };

  /**
   * @class
   * A class to serve as a base
   * for the <code>StandardListItem</code> and <code>CustomListItem</code> classes.
   *
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webcomponents.main.ListItem
   * @extends ListItemBase
   * @public
   */
  class ListItem extends _ListItemBase.default {
    static get metadata() {
      return metadata;
    }
    static get styles() {
      return [_ListItemBase.default.styles, _ListItem.default];
    }
    static get dependencies() {
      return [_Button.default, _RadioButton.default, _CheckBox.default];
    }
    constructor() {
      super();
      this.deactivateByKey = event => {
        if ((0, _Keys.isEnter)(event)) {
          this.deactivate();
        }
      };
      this.deactivate = () => {
        if (this.active) {
          this.active = false;
        }
      };
      const handleTouchStartEvent = event => {
        this._onmousedown(event);
      };
      this._ontouchstart = {
        handleEvent: handleTouchStartEvent,
        passive: true
      };
    }
    onBeforeRendering(...params) {
      this.actionable = this.type === _ListItemType.default.Active && this._mode !== _ListMode.default.Delete;
    }
    onEnterDOM() {
      document.addEventListener("mouseup", this.deactivate);
      document.addEventListener("touchend", this.deactivate);
      document.addEventListener("keyup", this.deactivateByKey);
    }
    onExitDOM() {
      document.removeEventListener("mouseup", this.deactivate);
      document.removeEventListener("keyup", this.deactivateByKey);
      document.removeEventListener("touchend", this.deactivate);
    }
    _onkeydown(event) {
      super._onkeydown(event);
      const itemActive = this.type === _ListItemType.default.Active;
      if ((0, _Keys.isSpace)(event)) {
        event.preventDefault();
      }
      if (((0, _Keys.isSpace)(event) || (0, _Keys.isEnter)(event)) && itemActive) {
        this.activate();
      }
      if ((0, _Keys.isEnter)(event)) {
        this.fireItemPress(event);
      }
    }
    _onkeyup(event) {
      if ((0, _Keys.isSpace)(event) || (0, _Keys.isEnter)(event)) {
        this.deactivate();
      }
      if ((0, _Keys.isSpace)(event)) {
        this.fireItemPress(event);
      }
      if (this.modeDelete && (0, _Keys.isDelete)(event)) {
        this.onDelete();
      }
    }
    _onmousedown(event) {
      if (event.isMarked === "button") {
        return;
      }
      this.activate();
    }
    _onmouseup(event) {
      if (event.isMarked === "button") {
        return;
      }
      this.deactivate();
    }
    _ontouchend(event) {
      this._onmouseup(event);
    }
    _onfocusout() {
      super._onfocusout();
      this.deactivate();
    }
    _onclick(event) {
      if (event.isMarked === "button") {
        return;
      }
      this.fireItemPress(event);
    }

    /*
     * Called when selection components in Single (ui5-radio-button)
     * and Multi (ui5-checkbox) selection modes are used.
     */
    onMultiSelectionComponentPress(event) {
      if (this.isInactive) {
        return;
      }
      this.fireEvent("_selection-requested", {
        item: this,
        selected: event.target.checked,
        selectionComponentPressed: true
      });
    }
    onSingleSelectionComponentPress(event) {
      if (this.isInactive) {
        return;
      }
      this.fireEvent("_selection-requested", {
        item: this,
        selected: !event.target.selected,
        selectionComponentPressed: true
      });
    }
    activate() {
      if (this.type === _ListItemType.default.Active) {
        this.active = true;
      }
    }
    onDelete(event) {
      this.fireEvent("_selection-requested", {
        item: this,
        selectionComponentPressed: false
      });
    }
    onDetailClick(event) {
      this.fireEvent("detail-click", {
        item: this,
        selected: this.selected
      });
    }
    fireItemPress(event) {
      if (this.isInactive) {
        return;
      }
      this.fireEvent("_press", {
        item: this,
        selected: this.selected,
        key: event.key
      });
    }
    get isInactive() {
      return this.type === _ListItemType.default.Inactive || this.type === _ListItemType.default.Detail;
    }
    get placeSelectionElementBefore() {
      return this._mode === _ListMode.default.MultiSelect || this._mode === _ListMode.default.SingleSelectBegin;
    }
    get placeSelectionElementAfter() {
      return !this.placeSelectionElementBefore && (this._mode === _ListMode.default.SingleSelectEnd || this._mode === _ListMode.default.Delete);
    }
    get modeSingleSelect() {
      return [_ListMode.default.SingleSelectBegin, _ListMode.default.SingleSelectEnd, _ListMode.default.SingleSelect].includes(this._mode);
    }
    get modeMultiSelect() {
      return this._mode === _ListMode.default.MultiSelect;
    }
    get modeDelete() {
      return this._mode === _ListMode.default.Delete;
    }

    /**
     * Used in UploadCollectionItem
     */
    get renderDeleteButton() {
      return this.modeDelete;
    }
    get disableDeleteButton() {
      return false;
    }
    /**
     * End
     */

    get typeDetail() {
      return this.type === _ListItemType.default.Detail;
    }
    get typeActive() {
      return this.type === _ListItemType.default.Active;
    }
    get ariaSelected() {
      if (this.modeMultiSelect || this.modeSingleSelect) {
        return this.selected;
      }
      return undefined;
    }
    get ariaSelectedText() {
      let ariaSelectedText;

      // Selected state needs to be supported separately since now the role mapping is list -> listitem[]
      // to avoid the issue of nesting interactive elements, ex. (option -> radio/checkbox);
      // The text is added to aria-describedby because as part of the aria-labelledby
      // the whole content of the item is readout when the aria-labelledby value is changed.
      if (this.ariaSelected !== undefined) {
        ariaSelectedText = this.ariaSelected ? ListItem.i18nBundle.getText(_i18nDefaults.LIST_ITEM_SELECTED) : ListItem.i18nBundle.getText(_i18nDefaults.LIST_ITEM_NOT_SELECTED);
      }
      return ariaSelectedText;
    }
    get deleteText() {
      return ListItem.i18nBundle.getText(_i18nDefaults.DELETE);
    }
    get _accessibleNameRef() {
      if (this.accessibleName) {
        // accessibleName is set - return labels excluding content
        return `${this._id}-invisibleText`;
      }

      // accessibleName is not set - return _accInfo.listItemAriaLabel including content
      return `${this._id}-content ${this._id}-invisibleText`;
    }
    get _accInfo() {
      return {
        role: this.accessibleRole || this.role,
        ariaExpanded: undefined,
        ariaLevel: undefined,
        ariaLabel: ListItem.i18nBundle.getText(_i18nDefaults.ARIA_LABEL_LIST_ITEM_CHECKBOX),
        ariaLabelRadioButton: ListItem.i18nBundle.getText(_i18nDefaults.ARIA_LABEL_LIST_ITEM_RADIO_BUTTON),
        ariaSelectedText: this.ariaSelectedText,
        ariaHaspopup: this._ariaHasPopup || undefined
      };
    }
    static async onDefine() {
      ListItem.i18nBundle = await (0, _i18nBundle.getI18nBundle)("@ui5/webcomponents");
    }
  }
  var _default = ListItem;
  _exports.default = _default;
});