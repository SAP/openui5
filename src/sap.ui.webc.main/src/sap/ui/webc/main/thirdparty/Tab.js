sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/UI5Element", "sap/ui/webc/common/thirdparty/base/decorators/customElement", "sap/ui/webc/common/thirdparty/base/decorators/property", "sap/ui/webc/common/thirdparty/base/decorators/slot", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer", "sap/ui/webc/common/thirdparty/base/renderer/executeTemplate", "sap/ui/webc/common/thirdparty/base/util/willShowContent", "sap/ui/webc/common/thirdparty/base/i18nBundle", "./generated/i18n/i18n-defaults", "sap/ui/webc/common/thirdparty/icons/error", "sap/ui/webc/common/thirdparty/icons/alert", "sap/ui/webc/common/thirdparty/icons/sys-enter-2", "./types/SemanticColor", "./types/ListItemType", "./TabContainer", "./Icon", "./Button", "./CustomListItem", "./generated/templates/TabTemplate.lit", "./generated/templates/TabInStripTemplate.lit", "./generated/templates/TabInOverflowTemplate.lit", "./generated/themes/Tab.css", "./generated/themes/TabInStrip.css", "./generated/themes/TabInOverflow.css"], function (_exports, _UI5Element, _customElement, _property, _slot, _LitRenderer, _executeTemplate, _willShowContent, _i18nBundle, _i18nDefaults, _error, _alert, _sysEnter, _SemanticColor, _ListItemType, _TabContainer, _Icon, _Button, _CustomListItem, _TabTemplate, _TabInStripTemplate, _TabInOverflowTemplate, _Tab, _TabInStrip, _TabInOverflow) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _UI5Element = _interopRequireDefault(_UI5Element);
  _customElement = _interopRequireDefault(_customElement);
  _property = _interopRequireDefault(_property);
  _slot = _interopRequireDefault(_slot);
  _LitRenderer = _interopRequireDefault(_LitRenderer);
  _executeTemplate = _interopRequireDefault(_executeTemplate);
  _willShowContent = _interopRequireDefault(_willShowContent);
  _SemanticColor = _interopRequireDefault(_SemanticColor);
  _ListItemType = _interopRequireDefault(_ListItemType);
  _TabContainer = _interopRequireDefault(_TabContainer);
  _Icon = _interopRequireDefault(_Icon);
  _Button = _interopRequireDefault(_Button);
  _CustomListItem = _interopRequireDefault(_CustomListItem);
  _TabTemplate = _interopRequireDefault(_TabTemplate);
  _TabInStripTemplate = _interopRequireDefault(_TabInStripTemplate);
  _TabInOverflowTemplate = _interopRequireDefault(_TabInOverflowTemplate);
  _Tab = _interopRequireDefault(_Tab);
  _TabInStrip = _interopRequireDefault(_TabInStrip);
  _TabInOverflow = _interopRequireDefault(_TabInOverflow);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  var __decorate = void 0 && (void 0).__decorate || function (decorators, target, key, desc) {
    var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
  var Tab_1;

  // Templates

  // Styles

  const DESIGN_DESCRIPTIONS = {
    [_SemanticColor.default.Positive]: _i18nDefaults.TAB_ARIA_DESIGN_POSITIVE,
    [_SemanticColor.default.Negative]: _i18nDefaults.TAB_ARIA_DESIGN_NEGATIVE,
    [_SemanticColor.default.Neutral]: _i18nDefaults.TAB_ARIA_DESIGN_NEUTRAL,
    [_SemanticColor.default.Critical]: _i18nDefaults.TAB_ARIA_DESIGN_CRITICAL
  };
  /**
   * @class
   * The <code>ui5-tab</code> represents a selectable item inside a <code>ui5-tabcontainer</code>.
   * It defines both the item in the tab strip (top part of the <code>ui5-tabcontainer</code>) and the
   * content that is presented to the user once the tab is selected.
   *
   * @abstract
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webc.main.Tab
   * @extends sap.ui.webc.base.UI5Element
   * @tagname ui5-tab
   * @implements sap.ui.webc.main.ITab
   * @public
   */
  let Tab = Tab_1 = class Tab extends _UI5Element.default {
    set _tabIndex(val) {
      this.getTabInStripDomRef().setAttribute("tabindex", val);
    }
    get _tabIndex() {
      return this.getTabInStripDomRef().getAttribute("tabindex");
    }
    get displayText() {
      let text = this.text;
      if (this._isInline && this.additionalText) {
        text += ` (${this.additionalText})`;
      }
      return text;
    }
    get isSeparator() {
      return false;
    }
    get stripPresentation() {
      return (0, _executeTemplate.default)(Tab_1.stripTemplate, this);
    }
    get overflowPresentation() {
      return (0, _executeTemplate.default)(Tab_1.overflowTemplate, this);
    }
    get stableDomRef() {
      return this.getAttribute("stable-dom-ref") || `${this._id}-stable-dom-ref`;
    }
    get requiresExpandButton() {
      return this.subTabs.length > 0 && this._isTopLevelTab && this._hasOwnContent;
    }
    get isSingleClickArea() {
      return this.subTabs.length > 0 && this._isTopLevelTab && !this._hasOwnContent;
    }
    get isTwoClickArea() {
      return this.subTabs.length > 0 && this._isTopLevelTab && this._hasOwnContent;
    }
    get isOnSelectedTabPath() {
      return this._realTab === this || this.tabs.some(subTab => subTab.isOnSelectedTabPath);
    }
    get _effectiveSlotName() {
      return this.isOnSelectedTabPath ? this._individualSlot : `disabled-${this._individualSlot}`;
    }
    get _defaultSlotName() {
      return this._realTab === this ? "" : "disabled-slot";
    }
    get _hasOwnContent() {
      return (0, _willShowContent.default)(this.content);
    }
    /**
     * Returns the DOM reference of the tab that is placed in the header.
     * <b>Note:</b> Tabs, placed in the <code>subTabs</code> slot of other tabs are not shown in the header. Calling this method on such tabs will return <code>null</code>.
     * <b>Note:</b> If you need a DOM ref to the tab content please use the <code>getDomRef</code> method.
     *
     * @function
     * @public
     * @name sap.ui.webc.main.Tab.prototype.getTabInStripDomRef
     * @since 1.0.0-rc.16
     */
    getTabInStripDomRef() {
      if (this._getElementInStrip) {
        return this._getElementInStrip();
      }
      return null;
    }
    getFocusDomRef() {
      let focusedDomRef = super.getFocusDomRef();
      if (this._getElementInStrip && this._getElementInStrip()) {
        focusedDomRef = this._getElementInStrip();
      }
      return focusedDomRef;
    }
    get isMixedModeTab() {
      return !this.icon && this._mixedMode;
    }
    get isTextOnlyTab() {
      return !this.icon && !this._mixedMode;
    }
    get isIconTab() {
      return !!this.icon;
    }
    get effectiveDisabled() {
      return this.disabled || undefined;
    }
    get effectiveSelected() {
      const subItemSelected = this.tabs.some(elem => elem.effectiveSelected);
      return this.selected || this._selected || subItemSelected;
    }
    get effectiveHidden() {
      return !this.effectiveSelected;
    }
    get tabs() {
      return this.subTabs.filter(tab => !tab.isSeparator);
    }
    get ariaLabelledBy() {
      const labels = [];
      if (this.text) {
        labels.push(`${this._id}-text`);
      }
      if (this.additionalText) {
        labels.push(`${this._id}-additionalText`);
      }
      if (this.icon) {
        labels.push(`${this._id}-icon`);
      }
      if (this._designDescription) {
        labels.push(`${this._id}-designDescription`);
      }
      return labels.join(" ");
    }
    get stripClasses() {
      const classes = ["ui5-tab-strip-item"];
      if (this.effectiveSelected) {
        classes.push("ui5-tab-strip-item--selected");
      }
      if (this.disabled) {
        classes.push("ui5-tab-strip-item--disabled");
      }
      if (this._isInline) {
        classes.push("ui5-tab-strip-item--inline");
      }
      if (this.additionalText) {
        classes.push("ui5-tab-strip-item--withAdditionalText");
      }
      if (!this.icon && !this._mixedMode) {
        classes.push("ui5-tab-strip-item--textOnly");
      }
      if (this.icon) {
        classes.push("ui5-tab-strip-item--withIcon");
      }
      if (!this.icon && this._mixedMode) {
        classes.push("ui5-tab-strip-item--mixedMode");
      }
      if (this.design !== _SemanticColor.default.Default) {
        classes.push(`ui5-tab-strip-item--${this.design.toLowerCase()}`);
      }
      if (this.isSingleClickArea) {
        classes.push(`ui5-tab-strip-item--singleClickArea`);
      }
      if (this.isTwoClickArea) {
        classes.push(`ui5-tab-strip-item--twoClickArea`);
      }
      return {
        itemClasses: classes.join(" "),
        additionalTextClasses: this.additionalTextClasses
      };
    }
    get additionalTextClasses() {
      const classes = [];
      if (this.additionalText) {
        classes.push("ui5-tab-strip-itemAdditionalText");
      }
      if (this.icon && !this.additionalText) {
        classes.push("ui5-tab-strip-itemAdditionalText-hidden");
      }
      return classes.join(" ");
    }
    get expandButtonTitle() {
      return Tab_1.i18nBundle.getText(_i18nDefaults.TABCONTAINER_END_OVERFLOW);
    }
    get _roleDescription() {
      return this.subTabs.length > 0 ? Tab_1.i18nBundle.getText(_i18nDefaults.TAB_SPLIT_ROLE_DESCRIPTION) : undefined;
    }
    get _ariaHasPopup() {
      return this.isSingleClickArea ? "menu" : undefined;
    }
    get semanticIconName() {
      switch (this.design) {
        case _SemanticColor.default.Positive:
          return "sys-enter-2";
        case _SemanticColor.default.Negative:
          return "error";
        case _SemanticColor.default.Critical:
          return "alert";
        default:
          return null;
      }
    }
    get _designDescription() {
      if (this.design === _SemanticColor.default.Default) {
        return null;
      }
      return Tab_1.i18nBundle.getText(DESIGN_DESCRIPTIONS[this.design]);
    }
    get semanticIconClasses() {
      const classes = ["ui5-tab-semantic-icon"];
      if (this.design !== _SemanticColor.default.Default && this.design !== _SemanticColor.default.Neutral) {
        classes.push(`ui5-tab-semantic-icon--${this.design.toLowerCase()}`);
      }
      return classes.join(" ");
    }
    get overflowClasses() {
      const classes = ["ui5-tab-overflow-item"];
      if (this.design !== _SemanticColor.default.Default && this.design !== _SemanticColor.default.Neutral) {
        classes.push(`ui5-tab-overflow-item--${this.design.toLowerCase()}`);
      }
      if (this.effectiveDisabled) {
        classes.push("ui5-tab-overflow-item--disabled");
      }
      if (this.selected) {
        classes.push("ui5-tab-overflow-item--selectedSubTab");
      }
      return classes.join(" ");
    }
    get overflowState() {
      return this.disabled || this.isSingleClickArea ? _ListItemType.default.Inactive : _ListItemType.default.Active;
    }
    static get stripTemplate() {
      return _TabInStripTemplate.default;
    }
    static get overflowTemplate() {
      return _TabInOverflowTemplate.default;
    }
    static async onDefine() {
      Tab_1.i18nBundle = await (0, _i18nBundle.getI18nBundle)("@ui5/webcomponents");
    }
  };
  __decorate([(0, _property.default)()], Tab.prototype, "text", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], Tab.prototype, "disabled", void 0);
  __decorate([(0, _property.default)()], Tab.prototype, "additionalText", void 0);
  __decorate([(0, _property.default)()], Tab.prototype, "icon", void 0);
  __decorate([(0, _property.default)({
    type: _SemanticColor.default,
    defaultValue: _SemanticColor.default.Default
  })], Tab.prototype, "design", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], Tab.prototype, "selected", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], Tab.prototype, "_selected", void 0);
  __decorate([(0, _property.default)({
    type: Object
  })], Tab.prototype, "_realTab", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], Tab.prototype, "_isTopLevelTab", void 0);
  __decorate([(0, _slot.default)({
    type: Node,
    "default": true,
    invalidateOnChildChange: {
      properties: true,
      slots: false
    }
  })], Tab.prototype, "content", void 0);
  __decorate([(0, _slot.default)({
    type: HTMLElement,
    individualSlots: true,
    invalidateOnChildChange: {
      properties: true,
      slots: false
    }
  })], Tab.prototype, "subTabs", void 0);
  Tab = Tab_1 = __decorate([(0, _customElement.default)({
    tag: "ui5-tab",
    languageAware: true,
    renderer: _LitRenderer.default,
    template: _TabTemplate.default,
    styles: _Tab.default,
    dependencies: [_Icon.default, _Button.default, _CustomListItem.default]
  })], Tab);
  Tab.define();
  _TabContainer.default.registerTabStyles(_TabInStrip.default);
  _TabContainer.default.registerStaticAreaTabStyles(_TabInOverflow.default);
  var _default = Tab;
  _exports.default = _default;
});