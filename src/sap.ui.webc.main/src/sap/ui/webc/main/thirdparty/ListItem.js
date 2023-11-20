sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/decorators/customElement", "sap/ui/webc/common/thirdparty/base/types/Integer", "sap/ui/webc/common/thirdparty/base/MarkedEvents", "sap/ui/webc/common/thirdparty/base/Keys", "sap/ui/webc/common/thirdparty/base/i18nBundle", "sap/ui/webc/common/thirdparty/base/decorators/property", "sap/ui/webc/common/thirdparty/base/decorators/event", "sap/ui/webc/common/thirdparty/base/decorators/slot", "sap/ui/webc/common/thirdparty/icons/decline", "sap/ui/webc/common/thirdparty/icons/edit", "./types/ListItemType", "./types/ListMode", "./ListItemBase", "./RadioButton", "./CheckBox", "./Button", "./generated/i18n/i18n-defaults", "./generated/themes/ListItem.css", "./types/HasPopup", "sap/ui/webc/common/thirdparty/icons/slim-arrow-right"], function (_exports, _customElement, _Integer, _MarkedEvents, _Keys, _i18nBundle, _property, _event, _slot, _decline, _edit, _ListItemType, _ListMode, _ListItemBase, _RadioButton, _CheckBox, _Button, _i18nDefaults, _ListItem, _HasPopup, _slimArrowRight) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _customElement = _interopRequireDefault(_customElement);
  _Integer = _interopRequireDefault(_Integer);
  _property = _interopRequireDefault(_property);
  _event = _interopRequireDefault(_event);
  _slot = _interopRequireDefault(_slot);
  _ListItemType = _interopRequireDefault(_ListItemType);
  _ListMode = _interopRequireDefault(_ListMode);
  _ListItemBase = _interopRequireDefault(_ListItemBase);
  _RadioButton = _interopRequireDefault(_RadioButton);
  _CheckBox = _interopRequireDefault(_CheckBox);
  _Button = _interopRequireDefault(_Button);
  _ListItem = _interopRequireDefault(_ListItem);
  _HasPopup = _interopRequireDefault(_HasPopup);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  var __decorate = void 0 && (void 0).__decorate || function (decorators, target, key, desc) {
    var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
  var ListItem_1;

  // Styles

  // Icons

  /**
   * @class
   * A class to serve as a base
   * for the <code>StandardListItem</code> and <code>CustomListItem</code> classes.
   *
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webc.main.ListItem
   * @extends sap.ui.webc.main.ListItemBase
   * @public
   */
  let ListItem = ListItem_1 = class ListItem extends _ListItemBase.default {
    constructor() {
      super();
      this.deactivateByKey = e => {
        if ((0, _Keys.isEnter)(e)) {
          this.deactivate();
        }
      };
      this.deactivate = () => {
        if (this.active) {
          this.active = false;
        }
      };
      const handleTouchStartEvent = e => {
        this._onmousedown(e);
      };
      this._ontouchstart = {
        handleEvent: handleTouchStartEvent,
        passive: true
      };
    }
    onBeforeRendering() {
      this.actionable = (this.type === _ListItemType.default.Active || this.type === _ListItemType.default.Navigation) && this._mode !== _ListMode.default.Delete;
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
    _onkeydown(e) {
      super._onkeydown(e);
      const itemActive = this.type === _ListItemType.default.Active,
        itemNavigated = this.typeNavigation;
      if ((0, _Keys.isSpace)(e)) {
        e.preventDefault();
      }
      if (((0, _Keys.isSpace)(e) || (0, _Keys.isEnter)(e)) && (itemActive || itemNavigated)) {
        this.activate();
      }
      if ((0, _Keys.isEnter)(e)) {
        this.fireItemPress(e);
      }
    }
    _onkeyup(e) {
      if ((0, _Keys.isSpace)(e) || (0, _Keys.isEnter)(e)) {
        this.deactivate();
      }
      if ((0, _Keys.isSpace)(e)) {
        this.fireItemPress(e);
      }
      if (this.modeDelete && (0, _Keys.isDelete)(e)) {
        this.onDelete();
      }
    }
    _onmousedown(e) {
      if ((0, _MarkedEvents.getEventMark)(e) === "button") {
        return;
      }
      this.activate();
    }
    _onmouseup(e) {
      if ((0, _MarkedEvents.getEventMark)(e) === "button") {
        return;
      }
      this.deactivate();
    }
    _ontouchend(e) {
      this._onmouseup(e);
    }
    _onfocusout() {
      super._onfocusout();
      this.deactivate();
    }
    _onclick(e) {
      if ((0, _MarkedEvents.getEventMark)(e) === "button") {
        return;
      }
      this.fireItemPress(e);
    }
    /*
     * Called when selection components in Single (ui5-radio-button)
     * and Multi (ui5-checkbox) selection modes are used.
     */
    onMultiSelectionComponentPress(e) {
      if (this.isInactive) {
        return;
      }
      this.fireEvent("_selection-requested", {
        item: this,
        selected: e.target.checked,
        selectionComponentPressed: true
      });
    }
    onSingleSelectionComponentPress(e) {
      if (this.isInactive) {
        return;
      }
      this.fireEvent("_selection-requested", {
        item: this,
        selected: !e.target.checked,
        selectionComponentPressed: true
      });
    }
    activate() {
      if (this.type === _ListItemType.default.Active || this.type === _ListItemType.default.Navigation) {
        this.active = true;
      }
    }
    onDelete() {
      this.fireEvent("_selection-requested", {
        item: this,
        selectionComponentPressed: false
      });
    }
    onDetailClick() {
      this.fireEvent("detail-click", {
        item: this,
        selected: this.selected
      });
    }
    fireItemPress(e) {
      if (this.isInactive) {
        return;
      }
      if ((0, _Keys.isEnter)(e)) {
        e.preventDefault();
      }
      this.fireEvent("_press", {
        item: this,
        selected: this.selected,
        key: e.key
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
    /**
     * End
     */
    get typeDetail() {
      return this.type === _ListItemType.default.Detail;
    }
    get typeNavigation() {
      return this.type === _ListItemType.default.Navigation;
    }
    get typeActive() {
      return this.type === _ListItemType.default.Active;
    }
    get _ariaSelected() {
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
      if (this._ariaSelected !== undefined) {
        ariaSelectedText = this._ariaSelected ? ListItem_1.i18nBundle.getText(_i18nDefaults.LIST_ITEM_SELECTED) : ListItem_1.i18nBundle.getText(_i18nDefaults.LIST_ITEM_NOT_SELECTED);
      }
      return ariaSelectedText;
    }
    get deleteText() {
      return ListItem_1.i18nBundle.getText(_i18nDefaults.DELETE);
    }
    get hasDeleteButtonSlot() {
      return !!this.deleteButton.length;
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
        ariaLevel: this._level || undefined,
        ariaLabel: ListItem_1.i18nBundle.getText(_i18nDefaults.ARIA_LABEL_LIST_ITEM_CHECKBOX),
        ariaLabelRadioButton: ListItem_1.i18nBundle.getText(_i18nDefaults.ARIA_LABEL_LIST_ITEM_RADIO_BUTTON),
        ariaSelectedText: this.ariaSelectedText,
        ariaHaspopup: this.ariaHaspopup || undefined,
        setsize: this.accessibilityAttributes.ariaSetsize,
        posinset: this.accessibilityAttributes.ariaPosinset
      };
    }
    get hasConfigurableMode() {
      return true;
    }
    static async onDefine() {
      ListItem_1.i18nBundle = await (0, _i18nBundle.getI18nBundle)("@ui5/webcomponents");
    }
  };
  __decorate([(0, _property.default)({
    type: _ListItemType.default,
    defaultValue: _ListItemType.default.Active
  })], ListItem.prototype, "type", void 0);
  __decorate([(0, _property.default)({
    type: Object
  })], ListItem.prototype, "accessibilityAttributes", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], ListItem.prototype, "navigated", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], ListItem.prototype, "active", void 0);
  __decorate([(0, _property.default)()], ListItem.prototype, "title", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], ListItem.prototype, "actionable", void 0);
  __decorate([(0, _property.default)({
    defaultValue: "listitem"
  })], ListItem.prototype, "role", void 0);
  __decorate([(0, _property.default)({
    defaultValue: undefined,
    noAttribute: true
  })], ListItem.prototype, "accessibleRoleDescription", void 0);
  __decorate([(0, _property.default)()], ListItem.prototype, "accessibleRole", void 0);
  __decorate([(0, _property.default)({
    type: _ListMode.default,
    defaultValue: _ListMode.default.None
  })], ListItem.prototype, "_mode", void 0);
  __decorate([(0, _property.default)({
    type: _HasPopup.default,
    noAttribute: true
  })], ListItem.prototype, "ariaHaspopup", void 0);
  __decorate([(0, _property.default)({
    type: _Integer.default
  })], ListItem.prototype, "_level", void 0);
  __decorate([(0, _property.default)({
    type: Boolean,
    noAttribute: true
  })], ListItem.prototype, "disableDeleteButton", void 0);
  __decorate([(0, _slot.default)()], ListItem.prototype, "deleteButton", void 0);
  ListItem = ListItem_1 = __decorate([(0, _customElement.default)({
    languageAware: true,
    styles: [_ListItemBase.default.styles, _ListItem.default],
    dependencies: [_Button.default, _RadioButton.default, _CheckBox.default]
  })
  /**
   * Fired when the user clicks on the detail button when type is <code>Detail</code>.
   *
   * @event sap.ui.webc.main.ListItem#detail-click
   * @public
   */, (0, _event.default)("detail-click"), (0, _event.default)("_press"), (0, _event.default)("_focused"), (0, _event.default)("_selection-requested")], ListItem);
  var _default = ListItem;
  _exports.default = _default;
});