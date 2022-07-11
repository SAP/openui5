sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/UI5Element", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer", "sap/ui/webc/common/thirdparty/base/renderer/executeTemplate", "sap/ui/webc/common/thirdparty/icons/error", "sap/ui/webc/common/thirdparty/icons/alert", "sap/ui/webc/common/thirdparty/icons/sys-enter-2", "./types/SemanticColor", "./types/ListItemType", "./TabContainer", "./Icon", "./Button", "./CustomListItem", "./generated/templates/TabTemplate.lit", "./generated/templates/TabInStripTemplate.lit", "./generated/templates/TabInOverflowTemplate.lit", "./generated/themes/Tab.css", "./generated/themes/TabInStrip.css", "./generated/themes/TabInOverflow.css"], function (_exports, _UI5Element, _LitRenderer, _executeTemplate, _error, _alert, _sysEnter, _SemanticColor, _ListItemType, _TabContainer, _Icon, _Button, _CustomListItem, _TabTemplate, _TabInStripTemplate, _TabInOverflowTemplate, _Tab, _TabInStrip, _TabInOverflow) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _UI5Element = _interopRequireDefault(_UI5Element);
  _LitRenderer = _interopRequireDefault(_LitRenderer);
  _executeTemplate = _interopRequireDefault(_executeTemplate);
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

  // Templates
  // Styles

  /**
   * @public
   */
  const metadata = {
    tag: "ui5-tab",
    managedSlots: true,
    languageAware: true,
    slots:
    /** @lends sap.ui.webcomponents.main.Tab.prototype */
    {
      /**
       * Holds the content associated with this tab.
       *
       * @type {Node[]}
       * @public
       * @slot
       */
      "default": {
        type: Node,
        propertyName: "content",
        invalidateOnChildChange: {
          properties: true,
          slots: false
        }
      },

      /**
       * Defines hierarchies with nested sub tabs.
       * <br><br>
       * <b>Note:</b> Use <code>ui5-tab</code> and <code>ui5-tab-separator</code> for the intended design.
       *
       * @type {sap.ui.webcomponents.main.ITab[]}
       * @public
       * @slot subTabs
       */
      subTabs: {
        type: HTMLElement,
        individualSlots: true,
        invalidateOnChildChange: {
          properties: true,
          slots: false
        }
      }
    },
    properties:
    /** @lends sap.ui.webcomponents.main.Tab.prototype */
    {
      /**
       * The text to be displayed for the item.
       * @type {string}
       * @defaultvalue ""
       * @public
       */
      text: {
        type: String
      },

      /**
       * Enabled items can be selected.
       * @type {boolean}
       * @defaultvalue false
       * @public
       */
      disabled: {
        type: Boolean
      },

      /**
       * Represents the "additionalText" text, which is displayed in the tab.
       * @type {string}
       * @defaultvalue ""
       * @public
       */
      additionalText: {
        type: String
      },

      /**
       * Defines the icon source URI to be displayed as graphical element within the component.
       * The SAP-icons font provides numerous built-in icons.
       * See all the available icons in the <ui5-link target="_blank" href="https://openui5.hana.ondemand.com/test-resources/sap/m/demokit/iconExplorer/webapp/index.html" class="api-table-content-cell-link">Icon Explorer</ui5-link>.
       *
       * @type {string}
       * @defaultvalue ""
       * @public
       */
      icon: {
        type: String
      },

      /**
       * Defines the component's design color.
       * <br><br>
       * The design is applied to:
       * <ul>
       * <li>the component icon</li>
       * <li>the <code>text</code> when the component overflows</li>
       * <li>the tab selection line</li>
       * </ul>
       *
       * <br><br>
       * Available designs are: <code>"Default"</code>, <code>"Neutral"</code>, <code>"Positive"</code>, <code>"Critical"</code> and <code>"Negative"</code>.
       *
       * <br><br>
       * <b>Note:</b> The design depends on the current theme.
       * @type {SemanticColor}
       * @defaultvalue "Default"
       * @public
       */
      design: {
        type: _SemanticColor.default,
        defaultValue: _SemanticColor.default.Default
      },

      /**
       * Specifies if the component is selected.
       *
       * @type {boolean}
       * @defaultvalue false
       * @public
       */
      selected: {
        type: Boolean
      },
      _tabIndex: {
        type: String,
        defaultValue: "-1",
        noAttribute: true
      },
      _selected: {
        type: Boolean
      },
      _realTab: {
        type: Object
      },
      _isTopLevelTab: {
        type: Boolean
      }
    },
    events:
    /** @lends sap.ui.webcomponents.main.Tab.prototype */
    {}
  };
  /**
   * @class
   * The <code>ui5-tab</code> represents a selectable item inside a <code>ui5-tabcontainer</code>.
   * It defines both the item in the tab strip (top part of the <code>ui5-tabcontainer</code>) and the
   * content that is presented to the user once the tab is selected.
   *
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webcomponents.main.Tab
   * @extends UI5Element
   * @tagname ui5-tab
   * @implements sap.ui.webcomponents.main.ITab
   * @public
   */

  class Tab extends _UI5Element.default {
    static get metadata() {
      return metadata;
    }

    static get render() {
      return _LitRenderer.default;
    }

    static get template() {
      return _TabTemplate.default;
    }

    static get stripTemplate() {
      return _TabInStripTemplate.default;
    }

    static get overflowTemplate() {
      return _TabInOverflowTemplate.default;
    }

    static get styles() {
      return _Tab.default;
    }

    static get dependencies() {
      return [_Icon.default, _Button.default, _CustomListItem.default];
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
      return (0, _executeTemplate.default)(this.constructor.stripTemplate, this);
    }

    get overflowPresentation() {
      return (0, _executeTemplate.default)(this.constructor.overflowTemplate, this);
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
      return this.content.some(node => node.nodeType !== Node.COMMENT_NODE && (node.nodeType !== Node.TEXT_NODE || node.nodeValue.trim().length !== 0));
    }
    /**
     * Returns the DOM reference of the tab that is placed in the header.
     * <b>Note:</b> If you need a DOM ref to the tab content please use the <code>getDomRef</code> method.
     *
     * @function
     * @public
     * @since 1.0.0-rc.16
     */


    getTabInStripDomRef() {
      return this._tabInStripDomRef;
    }

    getFocusDomRef() {
      let focusedDomRef = super.getFocusDomRef();

      if (this._getTabContainerHeaderItemCallback) {
        focusedDomRef = this._getTabContainerHeaderItemCallback();
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
        classes.push("ui5-tab-strip-item--withAddionalText");
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

      return classes.join(" ");
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

  }

  Tab.define();

  _TabContainer.default.registerTabStyles(_TabInStrip.default);

  _TabContainer.default.registerStaticAreaTabStyles(_TabInOverflow.default);

  var _default = Tab;
  _exports.default = _default;
});