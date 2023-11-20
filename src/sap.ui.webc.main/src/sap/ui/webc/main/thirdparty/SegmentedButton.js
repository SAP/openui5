sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/UI5Element", "sap/ui/webc/common/thirdparty/base/decorators/customElement", "sap/ui/webc/common/thirdparty/base/decorators/property", "sap/ui/webc/common/thirdparty/base/decorators/event", "sap/ui/webc/common/thirdparty/base/decorators/slot", "sap/ui/webc/common/thirdparty/base/delegate/ItemNavigation", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer", "sap/ui/webc/common/thirdparty/base/i18nBundle", "sap/ui/webc/common/thirdparty/base/CustomElementsScope", "sap/ui/webc/common/thirdparty/base/Keys", "./generated/i18n/i18n-defaults", "./SegmentedButtonItem", "./types/SegmentedButtonMode", "./generated/templates/SegmentedButtonTemplate.lit", "./generated/themes/SegmentedButton.css"], function (_exports, _UI5Element, _customElement, _property, _event, _slot, _ItemNavigation, _LitRenderer, _i18nBundle, _CustomElementsScope, _Keys, _i18nDefaults, _SegmentedButtonItem, _SegmentedButtonMode, _SegmentedButtonTemplate, _SegmentedButton) {
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
  _ItemNavigation = _interopRequireDefault(_ItemNavigation);
  _LitRenderer = _interopRequireDefault(_LitRenderer);
  _SegmentedButtonItem = _interopRequireDefault(_SegmentedButtonItem);
  _SegmentedButtonMode = _interopRequireDefault(_SegmentedButtonMode);
  _SegmentedButtonTemplate = _interopRequireDefault(_SegmentedButtonTemplate);
  _SegmentedButton = _interopRequireDefault(_SegmentedButton);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  var __decorate = void 0 && (void 0).__decorate || function (decorators, target, key, desc) {
    var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
  var SegmentedButton_1;

  // Template

  // Styles

  /**
   * @class
   *
   * <h3 class="comment-api-title">Overview</h3>
   *
   * The <code>ui5-segmented-button</code> shows a group of items. When the user clicks or taps
   * one of the items, it stays in a pressed state. It automatically resizes the items
   * to fit proportionally within the component. When no width is set, the component uses the available width.
   * <br><br>
   * <b>Note:</b> There can be just one selected <code>item</code> at a time.
   *
   * <h3>ES6 Module Import</h3>
   *
   * <code>import "@ui5/webcomponents/dist/SegmentedButton";</code>
   *
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webc.main.SegmentedButton
   * @extends sap.ui.webc.base.UI5Element
   * @tagname ui5-segmented-button
   * @since 1.0.0-rc.6
   * @appenddocs sap.ui.webc.main.SegmentedButtonItem
   * @public
   */
  let SegmentedButton = SegmentedButton_1 = class SegmentedButton extends _UI5Element.default {
    static async onDefine() {
      SegmentedButton_1.i18nBundle = await (0, _i18nBundle.getI18nBundle)("@ui5/webcomponents");
    }
    constructor() {
      super();
      this._itemNavigation = new _ItemNavigation.default(this, {
        getItemsCallback: () => this.getSlottedNodes("items")
      });
      this.hasPreviouslyFocusedItem = false;
    }
    onBeforeRendering() {
      const items = this.getSlottedNodes("items");
      items.forEach((item, index, arr) => {
        item.posInSet = index + 1;
        item.sizeOfSet = arr.length;
      });
      this.normalizeSelection();
      this.style.setProperty((0, _CustomElementsScope.getScopedVarName)("--_ui5_segmented_btn_items_count"), `${items.length}`);
    }
    normalizeSelection() {
      switch (this.mode) {
        case _SegmentedButtonMode.default.SingleSelect:
          {
            const selectedItems = this.selectedItems;
            const selectedItemIndex = this._selectedItem ? selectedItems.indexOf(this._selectedItem) : -1;
            if (this._selectedItem && selectedItems.length > 1) {
              selectedItems.splice(selectedItemIndex, 1);
            }
            const selectedItem = selectedItems.pop() || this.items[0];
            this._applySingleSelection(selectedItem);
            break;
          }
        default:
      }
    }
    _selectItem(e) {
      const target = e.target;
      const isTargetSegmentedButtonItem = target.hasAttribute("ui5-segmented-button-item");
      if (target.disabled || target === this.getDomRef() || !isTargetSegmentedButtonItem) {
        return;
      }
      switch (this.mode) {
        case _SegmentedButtonMode.default.MultiSelect:
          if (e instanceof KeyboardEvent) {
            target.pressed = !target.pressed;
          }
          break;
        default:
          this._applySingleSelection(target);
      }
      this.fireEvent("selection-change", {
        selectedItem: target,
        selectedItems: this.selectedItems
      });
      this._itemNavigation.setCurrentItem(target);
      target.focus();
      return this;
    }
    _applySingleSelection(item) {
      this.items.forEach(currentItem => {
        currentItem.pressed = false;
      });
      item.pressed = true;
      this._selectedItem = item;
    }
    _onclick(e) {
      this._selectItem(e);
    }
    _onkeydown(e) {
      if ((0, _Keys.isEnter)(e)) {
        this._selectItem(e);
      } else if ((0, _Keys.isSpace)(e)) {
        e.preventDefault();
      }
    }
    _onkeyup(e) {
      if ((0, _Keys.isSpace)(e)) {
        this._selectItem(e);
      }
    }
    _onmousedown(e) {
      const eventTarget = e.target;
      const isTargetSegmentedButtonItem = eventTarget.hasAttribute("ui5-segmented-button-item");
      if (isTargetSegmentedButtonItem) {
        eventTarget.focus();
        this._itemNavigation.setCurrentItem(eventTarget);
        this.hasPreviouslyFocusedItem = true;
      }
    }
    _onfocusin(e) {
      // If the component was previously focused,
      // update the ItemNavigation to sync the button's tabindex values
      if (this.hasPreviouslyFocusedItem) {
        this._itemNavigation.setCurrentItem(e.target);
        return;
      }
      // If the component is focused for the first time
      // focus the selected item if such is present
      if (this.selectedItems.length) {
        this.selectedItems[0].focus();
        this._itemNavigation.setCurrentItem(this.selectedItems[0]);
        this.hasPreviouslyFocusedItem = true;
      }
    }
    /**
     * Currently selected item.
     *
     * @readonly
     * @type {sap.ui.webc.main.ISegmentedButtonItem}
     * @name sap.ui.webc.main.SegmentedButton.prototype.selectedItem
     * @deprecated since 1.14.0. This method will be removed in the next major release.
     * Please use the <code>selectedItems</code> property instead.
     * @public
     */
    get selectedItem() {
      return this._selectedItem;
    }
    /**
     * Returns an array of the currently selected items.
     * @readonly
     * @name sap.ui.webc.main.SegmentedButton.prototype.selectedItems
     * @type {sap.ui.webc.main.ISegmentedButtonItem[]}
     * @since 1.14.0
     * @public
     */
    get selectedItems() {
      return this.items.filter(item => item.pressed);
    }
    get ariaDescribedBy() {
      return SegmentedButton_1.i18nBundle.getText(_i18nDefaults.SEGMENTEDBUTTON_ARIA_DESCRIBEDBY);
    }
    get ariaDescription() {
      return SegmentedButton_1.i18nBundle.getText(_i18nDefaults.SEGMENTEDBUTTON_ARIA_DESCRIPTION);
    }
  };
  __decorate([(0, _property.default)({
    defaultValue: undefined
  })], SegmentedButton.prototype, "accessibleName", void 0);
  __decorate([(0, _property.default)({
    type: _SegmentedButtonMode.default,
    defaultValue: _SegmentedButtonMode.default.SingleSelect
  })], SegmentedButton.prototype, "mode", void 0);
  __decorate([(0, _slot.default)({
    type: HTMLElement,
    invalidateOnChildChange: true,
    "default": true
  })], SegmentedButton.prototype, "items", void 0);
  SegmentedButton = SegmentedButton_1 = __decorate([(0, _customElement.default)({
    tag: "ui5-segmented-button",
    languageAware: true,
    renderer: _LitRenderer.default,
    template: _SegmentedButtonTemplate.default,
    styles: _SegmentedButton.default,
    dependencies: [_SegmentedButtonItem.default]
  })
  /**
   * Fired when the selected item changes.
   *
   * @event sap.ui.webc.main.SegmentedButton#selection-change
   * @param {HTMLElement} selectedItem the pressed item. Note: deprecated since 1.14.0 and will be removed in the next major release, use the <code>selectedItems</code> parameter instead.
   * @param {HTMLElement[]} selectedItems an array of selected items. Note: available since 1.14.0.
   * @public
   */, (0, _event.default)("selection-change", {
    detail: {
      selectedItem: {
        type: HTMLElement
      },
      selectedItems: {
        type: Array
      }
    }
  })], SegmentedButton);
  SegmentedButton.define();
  var _default = SegmentedButton;
  _exports.default = _default;
});