sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/UI5Element", "sap/ui/webc/common/thirdparty/base/decorators/slot", "sap/ui/webc/common/thirdparty/base/decorators/property", "sap/ui/webc/common/thirdparty/base/decorators/customElement", "sap/ui/webc/common/thirdparty/base/renderer/executeTemplate", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer", "sap/ui/webc/common/thirdparty/base/Render", "sap/ui/webc/common/thirdparty/base/delegate/ResizeHandler", "sap/ui/webc/common/thirdparty/base/util/AriaLabelHelper", "sap/ui/webc/common/thirdparty/base/types/Integer", "sap/ui/webc/common/thirdparty/icons/overflow", "sap/ui/webc/common/thirdparty/base/i18nBundle", "sap/ui/webc/common/thirdparty/base/CustomElementsScope", "./generated/i18n/i18n-defaults", "./generated/templates/ToolbarTemplate.lit", "./generated/themes/Toolbar.css", "./generated/templates/ToolbarPopoverTemplate.lit", "./generated/themes/ToolbarPopover.css", "./types/ToolbarAlign", "./types/ToolbarItemOverflowBehavior", "./types/HasPopup", "./ToolbarRegistry", "./Button", "./Popover"], function (_exports, _UI5Element, _slot, _property, _customElement, _executeTemplate, _LitRenderer, _Render, _ResizeHandler, _AriaLabelHelper, _Integer, _overflow, _i18nBundle, _CustomElementsScope, _i18nDefaults, _ToolbarTemplate, _Toolbar, _ToolbarPopoverTemplate, _ToolbarPopover, _ToolbarAlign, _ToolbarItemOverflowBehavior, _HasPopup, _ToolbarRegistry, _Button, _Popover) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _UI5Element = _interopRequireDefault(_UI5Element);
  _slot = _interopRequireDefault(_slot);
  _property = _interopRequireDefault(_property);
  _customElement = _interopRequireDefault(_customElement);
  _executeTemplate = _interopRequireDefault(_executeTemplate);
  _LitRenderer = _interopRequireDefault(_LitRenderer);
  _ResizeHandler = _interopRequireDefault(_ResizeHandler);
  _Integer = _interopRequireDefault(_Integer);
  _ToolbarTemplate = _interopRequireDefault(_ToolbarTemplate);
  _Toolbar = _interopRequireDefault(_Toolbar);
  _ToolbarPopoverTemplate = _interopRequireDefault(_ToolbarPopoverTemplate);
  _ToolbarPopover = _interopRequireDefault(_ToolbarPopover);
  _ToolbarAlign = _interopRequireDefault(_ToolbarAlign);
  _ToolbarItemOverflowBehavior = _interopRequireDefault(_ToolbarItemOverflowBehavior);
  _HasPopup = _interopRequireDefault(_HasPopup);
  _Button = _interopRequireDefault(_Button);
  _Popover = _interopRequireDefault(_Popover);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  var __decorate = void 0 && (void 0).__decorate || function (decorators, target, key, desc) {
    var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
  var Toolbar_1;
  function calculateCSSREMValue(styleSet, propertyName) {
    return Number(styleSet.getPropertyValue(propertyName).replace("rem", "")) * parseInt(getComputedStyle(document.body).getPropertyValue("font-size"));
  }
  function parsePxValue(styleSet, propertyName) {
    return Number(styleSet.getPropertyValue(propertyName).replace("px", ""));
  }
  /**
   * @class
   *
   * <h3 class="comment-api-title">Overview</h3>
   *
   * The <code>ui5-toolbar</code> component is used to create a horizontal layout with items.
   * The items can be overflowing in a popover, when the space is not enough to show all of them.
   *
   * <h3>Keyboard Handling</h3>
   * The <code>ui5-toolbar</code> provides advanced keyboard handling.
   * <br>
   * <ul>
   * <li>The control is not interactive, but can contain of interactive elements </li>
   * <li>[TAB] - iterates through elements</li>
   * </ul>
   * <br>
   *
   * <h3>ES6 Module Import</h3>
   * <code>import "@ui5/webcomponents/dist/Toolbar";</code>
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webc.main.Toolbar
   * @extends sap.ui.webc.base.UI5Element
   * @tagname ui5-toolbar
   * @appenddocs sap.ui.webc.main.ToolbarButton sap.ui.webc.main.ToolbarSelect sap.ui.webc.main.ToolbarSelectOption sap.ui.webc.main.ToolbarSeparator sap.ui.webc.main.ToolbarSpacer
   * @public
   * @since 1.17.0
   */
  let Toolbar = Toolbar_1 = class Toolbar extends _UI5Element.default {
    static get styles() {
      const styles = (0, _ToolbarRegistry.getRegisteredStyles)();
      return [_Toolbar.default, ...styles];
    }
    static get staticAreaStyles() {
      const styles = (0, _ToolbarRegistry.getRegisteredStaticAreaStyles)();
      return [_ToolbarPopover.default, ...styles];
    }
    static get dependencies() {
      const deps = (0, _ToolbarRegistry.getRegisteredDependencies)();
      return [_Popover.default, _Button.default, ...deps];
    }
    static async onDefine() {
      Toolbar_1.i18nBundle = await (0, _i18nBundle.getI18nBundle)("@ui5/webcomponents");
    }
    constructor() {
      super();
      this.itemsToOverflow = [];
      this.itemsWidth = 0;
      this.popoverOpen = false;
      this.itemsWidthMeasured = false;
      this.ITEMS_WIDTH_MAP = new Map();
      this._onResize = this.onResize.bind(this);
      this._onInteract = e => this.onInteract(e);
    }
    /**
     * Read-only members
     */
    get overflowButtonSize() {
      return this.overflowButtonDOM?.getBoundingClientRect().width || 0;
    }
    get padding() {
      const toolbarComputedStyle = getComputedStyle(this.getDomRef());
      return calculateCSSREMValue(toolbarComputedStyle, (0, _CustomElementsScope.getScopedVarName)("--_ui5-toolbar-padding-left")) + calculateCSSREMValue(toolbarComputedStyle, (0, _CustomElementsScope.getScopedVarName)("--_ui5-toolbar-padding-right"));
    }
    get subscribedEvents() {
      return this.items.map(item => Array.from(item.subscribedEvents.keys())).flat()
      // remove duplicates
      .filter((value, index, self) => self.indexOf(value) === index);
    }
    get alwaysOverflowItems() {
      return this.items.filter(item => item.overflowPriority === _ToolbarItemOverflowBehavior.default.AlwaysOverflow);
    }
    get movableItems() {
      return this.items.filter(item => item.overflowPriority !== _ToolbarItemOverflowBehavior.default.AlwaysOverflow && item.overflowPriority !== _ToolbarItemOverflowBehavior.default.NeverOverflow);
    }
    get overflowItems() {
      // spacers are ignored
      const overflowItems = this.getItemsInfo(this.itemsToOverflow.filter(item => !item.ignoreSpace));
      return this.reverseOverflow ? overflowItems.reverse() : overflowItems;
    }
    get standardItems() {
      return this.getItemsInfo(this.items.filter(item => this.itemsToOverflow.indexOf(item) === -1));
    }
    get hideOverflowButton() {
      return this.itemsToOverflow.filter(item => !(item.ignoreSpace || item.isSeparator)).length === 0;
    }
    get classes() {
      return {
        items: {
          "ui5-tb-items": true,
          "ui5-tb-items-full-width": this.hasFlexibleSpacers
        },
        overflow: {
          "ui5-overflow-list--alignleft": this.hasItemWithText
        },
        overflowButton: {
          "ui5-tb-item": true,
          "ui5-tb-overflow-btn": true,
          "ui5-tb-overflow-btn-hidden": this.hideOverflowButton
        }
      };
    }
    get interactiveItemsCount() {
      return this.items.filter(item => item.isInteractive).length;
    }
    /**
     * Accessibility
     */
    get hasAriaSemantics() {
      return this.interactiveItemsCount > 1;
    }
    get accessibleRole() {
      return this.hasAriaSemantics ? "toolbar" : undefined;
    }
    get ariaLabelText() {
      return this.hasAriaSemantics ? (0, _AriaLabelHelper.getEffectiveAriaLabelText)(this) : undefined;
    }
    get accInfo() {
      return {
        root: {
          role: this.accessibleRole,
          accessibleName: this.ariaLabelText
        },
        overflowButton: {
          accessibleName: Toolbar_1.i18nBundle.getText(_i18nDefaults.TOOLBAR_OVERFLOW_BUTTON_ARIA_LABEL),
          tooltip: Toolbar_1.i18nBundle.getText(_i18nDefaults.TOOLBAR_OVERFLOW_BUTTON_ARIA_LABEL),
          accessibilityAttributes: {
            expanded: this.overflowButtonDOM?.accessibilityAttributes.expanded,
            hasPopup: _HasPopup.default.Menu
          }
        }
      };
    }
    /**
     * Toolbar Overflow Popover
     */
    get overflowButtonDOM() {
      return this.shadowRoot.querySelector(".ui5-tb-overflow-btn");
    }
    get itemsDOM() {
      return this.shadowRoot.querySelector(".ui5-tb-items");
    }
    get hasItemWithText() {
      return this.itemsToOverflow.some(item => item.containsText);
    }
    get hasFlexibleSpacers() {
      return this.items.some(item => item.hasFlexibleWidth);
    }
    /**
     * Lifecycle methods
     */
    onEnterDOM() {
      _ResizeHandler.default.register(this, this._onResize);
    }
    onExitDOM() {
      _ResizeHandler.default.deregister(this, this._onResize);
    }
    onInvalidation(changeInfo) {
      if (changeInfo.reason === "childchange" && changeInfo.child === this.itemsToOverflow[0]) {
        this.onToolbarItemChange();
      }
    }
    onBeforeRendering() {
      this.detachListeners();
      this.attachListeners();
    }
    async onAfterRendering() {
      await (0, _Render.renderFinished)();
      this.storeItemsWidth();
      this.processOverflowLayout();
    }
    /**
     * Returns if the overflow popup is open.
     *
     * @public
     * @return { Promise<Boolean> }
     */
    async isOverflowOpen() {
      const overflowPopover = await this.getOverflowPopover();
      return overflowPopover.isOpen();
    }
    async openOverflow() {
      const overflowPopover = await this.getOverflowPopover();
      overflowPopover.showAt(this.overflowButtonDOM);
      this.reverseOverflow = overflowPopover.actualPlacementType === "Top";
    }
    async closeOverflow() {
      const overflowPopover = await this.getOverflowPopover();
      overflowPopover.close();
    }
    toggleOverflow() {
      if (this.popoverOpen) {
        this.closeOverflow();
      } else {
        this.openOverflow();
      }
    }
    async getOverflowPopover() {
      const staticAreaItem = await this.getStaticAreaItemDomRef();
      return staticAreaItem.querySelector(".ui5-overflow-popover");
    }
    /**
     * Layout management
     */
    processOverflowLayout() {
      const containerWidth = this.offsetWidth - this.padding;
      const contentWidth = this.itemsWidth;
      const overflowSpace = contentWidth - containerWidth + this.overflowButtonSize;
      // skip calculation if the width has not been changed or if the items width has not been changed
      if (this.width === containerWidth && this.contentWidth === contentWidth) {
        return;
      }
      this.distributeItems(overflowSpace);
      this.width = containerWidth;
      this.contentWidth = contentWidth;
    }
    storeItemsWidth() {
      let totalWidth = 0;
      this.items.forEach(item => {
        const itemWidth = this.getItemWidth(item);
        totalWidth += itemWidth;
        this.ITEMS_WIDTH_MAP.set(item._id, itemWidth);
      });
      this.itemsWidth = totalWidth;
    }
    distributeItems(overflowSpace = 0) {
      const movableItems = this.movableItems.reverse();
      let index = 0;
      let currentItem = movableItems[index];
      this.itemsToOverflow = [];
      // distribute items that always overflow
      this.distributeItemsThatAlwaysOverflow();
      while (overflowSpace > 0 && currentItem) {
        this.itemsToOverflow.unshift(currentItem);
        overflowSpace -= this.getCachedItemWidth(currentItem?._id) || 0;
        index++;
        currentItem = movableItems[index];
      }
      // If the last bar item is a spacer, force it to the overflow even if there is enough space for it
      if (index < movableItems.length) {
        let lastItem = movableItems[index];
        while (index <= movableItems.length - 1 && lastItem.isSeparator) {
          this.itemsToOverflow.unshift(lastItem);
          index++;
          lastItem = movableItems[index];
        }
      }
      this.setSeperatorsVisibilityInOverflow();
    }
    distributeItemsThatAlwaysOverflow() {
      this.alwaysOverflowItems.forEach(item => {
        this.itemsToOverflow.push(item);
      });
    }
    setSeperatorsVisibilityInOverflow() {
      this.itemsToOverflow.forEach((item, idx, items) => {
        if (item.isSeparator) {
          item.visible = this.shouldShowSeparatorInOverflow(idx, items);
        }
      });
    }
    shouldShowSeparatorInOverflow(separatorIdx, overflowItems) {
      let foundPrevNonSeparatorItem = false;
      let foundNextNonSeperatorItem = false;
      // search for non-separator item before and after the seperator
      overflowItems.forEach((item, idx) => {
        if (idx < separatorIdx && !item.isSeparator) {
          foundPrevNonSeparatorItem = true;
        }
        if (idx > separatorIdx && !item.isSeparator) {
          foundNextNonSeperatorItem = true;
        }
      });
      return foundPrevNonSeparatorItem && foundNextNonSeperatorItem;
    }
    /**
     * Event Handlers
     */
    onOverflowPopoverClosed() {
      this.popoverOpen = false;
      if (this.overflowButtonDOM) {
        this.overflowButtonDOM.accessibilityAttributes.expanded = "false";
      }
    }
    onOverflowPopoverOpened() {
      this.popoverOpen = true;
      if (this.overflowButtonDOM) {
        this.overflowButtonDOM.accessibilityAttributes.expanded = "true";
      }
    }
    onResize() {
      if (!this.itemsWidth) {
        return;
      }
      this.closeOverflow();
      this.processOverflowLayout();
    }
    onInteract(e) {
      const target = e.target;
      const item = target.closest(".ui5-tb-item") || target.closest(".ui5-tb-popover-item");
      const eventType = e.type;
      if (target === this.overflowButtonDOM) {
        this.toggleOverflow();
        return;
      }
      if (!item) {
        return;
      }
      const refItemId = target.getAttribute("data-ui5-external-action-item-id");
      if (refItemId) {
        const abstractItem = this.getItemByID(refItemId);
        const prevented = !abstractItem?.fireEvent(eventType, e.detail, true);
        const eventOptions = abstractItem?.subscribedEvents.get(eventType);
        if (prevented || abstractItem?.preventOverflowClosing || eventOptions?.preventClosing) {
          return;
        }
        this.closeOverflow();
      }
    }
    /**
     * Private members
     */
    async attachListeners() {
      const popover = await this.getOverflowPopover();
      this.subscribedEvents.forEach(e => {
        this.itemsDOM?.addEventListener(e, this._onInteract);
        popover?.addEventListener(e, this._onInteract);
      });
    }
    async detachListeners() {
      const popover = await this.getOverflowPopover();
      this.subscribedEvents.forEach(e => {
        this.itemsDOM?.removeEventListener(e, this._onInteract);
        popover?.removeEventListener(e, this._onInteract);
      });
    }
    onToolbarItemChange() {
      // some items were updated reset the cache and trigger a re-render
      this.itemsToOverflow = [];
      this.contentWidth = 0; // re-render
    }

    getItemsInfo(items) {
      return items.map(item => {
        const ElementClass = (0, _ToolbarRegistry.getRegisteredToolbarItem)(item.constructor.name);
        if (!ElementClass) {
          return null;
        }
        const toolbarItem = {
          toolbarTemplate: (0, _executeTemplate.default)(ElementClass.toolbarTemplate, item),
          toolbarPopoverTemplate: (0, _executeTemplate.default)(ElementClass.toolbarPopoverTemplate, item)
        };
        return toolbarItem;
      });
    }
    getItemWidth(item) {
      // Spacer width - always 0 for flexible spacers, so that they shrink, otherwise - measure the width normally
      if (item.ignoreSpace || item.isSeparator) {
        return 0;
      }
      const id = item._id;
      // Measure rendered width for spacers with width, and for normal items
      const renderedItem = this.getRegisteredToolbarItemByID(id);
      let itemWidth = 0;
      if (renderedItem) {
        const ItemCSSStyleSet = getComputedStyle(renderedItem);
        itemWidth = renderedItem.offsetWidth + parsePxValue(ItemCSSStyleSet, "margin-inline-end") + parsePxValue(ItemCSSStyleSet, "margin-inline-start");
      } else {
        itemWidth = this.getCachedItemWidth(id) || 0;
      }
      return Math.ceil(itemWidth);
    }
    getCachedItemWidth(id) {
      return this.ITEMS_WIDTH_MAP.get(id);
    }
    getItemByID(id) {
      return this.items.find(item => item._id === id);
    }
    getRegisteredToolbarItemByID(id) {
      return this.itemsDOM.querySelector(`[data-ui5-external-action-item-id="${id}"]`);
    }
  };
  __decorate([(0, _property.default)({
    type: _ToolbarAlign.default,
    defaultValue: _ToolbarAlign.default.End
  })], Toolbar.prototype, "alignContent", void 0);
  __decorate([(0, _property.default)({
    type: _Integer.default
  })], Toolbar.prototype, "width", void 0);
  __decorate([(0, _property.default)({
    type: _Integer.default
  })], Toolbar.prototype, "contentWidth", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], Toolbar.prototype, "reverseOverflow", void 0);
  __decorate([(0, _property.default)()], Toolbar.prototype, "accessibleName", void 0);
  __decorate([(0, _property.default)({
    defaultValue: ""
  })], Toolbar.prototype, "accessibleNameRef", void 0);
  __decorate([(0, _slot.default)({
    "default": true,
    type: HTMLElement,
    invalidateOnChildChange: true
  })], Toolbar.prototype, "items", void 0);
  Toolbar = Toolbar_1 = __decorate([(0, _customElement.default)({
    tag: "ui5-toolbar",
    languageAware: true,
    renderer: _LitRenderer.default,
    template: _ToolbarTemplate.default,
    staticAreaTemplate: _ToolbarPopoverTemplate.default
  })], Toolbar);
  Toolbar.define();
  var _default = Toolbar;
  _exports.default = _default;
});