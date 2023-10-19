sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/UI5Element", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer", "sap/ui/webc/common/thirdparty/base/renderer/executeTemplate", "sap/ui/webc/common/thirdparty/base/decorators/customElement", "./TabContainer", "./generated/templates/TabSeparatorInStripTemplate.lit", "./generated/templates/TabSeparatorInOverflowTemplate.lit", "./generated/themes/TabSeparatorInStrip.css", "./generated/themes/TabSeparatorInOverflow.css"], function (_exports, _UI5Element, _LitRenderer, _executeTemplate, _customElement, _TabContainer, _TabSeparatorInStripTemplate, _TabSeparatorInOverflowTemplate, _TabSeparatorInStrip, _TabSeparatorInOverflow) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _UI5Element = _interopRequireDefault(_UI5Element);
  _LitRenderer = _interopRequireDefault(_LitRenderer);
  _executeTemplate = _interopRequireDefault(_executeTemplate);
  _customElement = _interopRequireDefault(_customElement);
  _TabContainer = _interopRequireDefault(_TabContainer);
  _TabSeparatorInStripTemplate = _interopRequireDefault(_TabSeparatorInStripTemplate);
  _TabSeparatorInOverflowTemplate = _interopRequireDefault(_TabSeparatorInOverflowTemplate);
  _TabSeparatorInStrip = _interopRequireDefault(_TabSeparatorInStrip);
  _TabSeparatorInOverflow = _interopRequireDefault(_TabSeparatorInOverflow);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  var __decorate = void 0 && (void 0).__decorate || function (decorators, target, key, desc) {
    var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
  var TabSeparator_1;

  // Templates

  // Styles

  /**
   * @class
   * The <code>ui5-tab-separator</code> represents a vertical line to separate tabs inside a <code>ui5-tabcontainer</code>.
   *
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webc.main.TabSeparator
   * @extends sap.ui.webc.base.UI5Element
   * @abstract
   * @tagname ui5-tab-separator
   * @implements sap.ui.webc.main.ITab
   * @public
   */
  let TabSeparator = TabSeparator_1 = class TabSeparator extends _UI5Element.default {
    static get stripTemplate() {
      return _TabSeparatorInStripTemplate.default;
    }
    static get overflowTemplate() {
      return _TabSeparatorInOverflowTemplate.default;
    }
    get classes() {
      return {
        root: {
          "ui5-tc__separator": true
        }
      };
    }
    get isSeparator() {
      return true;
    }
    /**
     * Returns the DOM reference of the separator that is placed in the header.
     * <b>Note:</b> Tabs and separators, placed in the <code>subTabs</code> slot of other tabs are not shown in the header. Calling this method on such tabs or separators will return <code>null</code>.
     *
     * @function
     * @public
     * @name sap.ui.webc.main.TabSeparator.prototype.getTabInStripDomRef
     */
    getTabInStripDomRef() {
      if (this._getElementInStrip) {
        return this._getElementInStrip();
      }
      return null;
    }
    get stableDomRef() {
      return this.getAttribute("stable-dom-ref") || `${this._id}-stable-dom-ref`;
    }
    get stripPresentation() {
      return (0, _executeTemplate.default)(TabSeparator_1.stripTemplate, this);
    }
    get overflowPresentation() {
      return (0, _executeTemplate.default)(TabSeparator_1.overflowTemplate, this);
    }
  };
  TabSeparator = TabSeparator_1 = __decorate([(0, _customElement.default)({
    tag: "ui5-tab-separator",
    renderer: _LitRenderer.default
  })], TabSeparator);
  TabSeparator.define();
  _TabContainer.default.registerTabStyles(_TabSeparatorInStrip.default);
  _TabContainer.default.registerStaticAreaTabStyles(_TabSeparatorInOverflow.default);
  var _default = TabSeparator;
  _exports.default = _default;
});