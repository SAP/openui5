sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/UI5Element", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer", "sap/ui/webc/common/thirdparty/base/renderer/executeTemplate", "./TabContainer", "./generated/templates/TabSeparatorInStripTemplate.lit", "./generated/templates/TabSeparatorInOverflowTemplate.lit", "./generated/themes/TabSeparatorInStrip.css", "./generated/themes/TabSeparatorInOverflow.css"], function (_exports, _UI5Element, _LitRenderer, _executeTemplate, _TabContainer, _TabSeparatorInStripTemplate, _TabSeparatorInOverflowTemplate, _TabSeparatorInStrip, _TabSeparatorInOverflow) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _UI5Element = _interopRequireDefault(_UI5Element);
  _LitRenderer = _interopRequireDefault(_LitRenderer);
  _executeTemplate = _interopRequireDefault(_executeTemplate);
  _TabContainer = _interopRequireDefault(_TabContainer);
  _TabSeparatorInStripTemplate = _interopRequireDefault(_TabSeparatorInStripTemplate);
  _TabSeparatorInOverflowTemplate = _interopRequireDefault(_TabSeparatorInOverflowTemplate);
  _TabSeparatorInStrip = _interopRequireDefault(_TabSeparatorInStrip);
  _TabSeparatorInOverflow = _interopRequireDefault(_TabSeparatorInOverflow);

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

  // Templates
  // Styles

  /**
   * @public
   */
  const metadata = {
    tag: "ui5-tab-separator"
  };
  /**
   * @class
   * The <code>ui5-tab-separator</code> represents a vertical line to separate tabs inside a <code>ui5-tabcontainer</code>.
   *
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webcomponents.main.TabSeparator
   * @extends UI5Element
   * @tagname ui5-tab-separator
   * @implements sap.ui.webcomponents.main.ITab
   * @public
   */

  class TabSeparator extends _UI5Element.default {
    static get metadata() {
      return metadata;
    }

    static get render() {
      return _LitRenderer.default;
    }

    static get stripTemplate() {
      return _TabSeparatorInStripTemplate.default;
    }

    static get overflowTemplate() {
      return _TabSeparatorInOverflowTemplate.default;
    }

    get classes() {
      return {
        "ui5-tc__separator": true
      };
    }

    get isSeparator() {
      return true;
    }

    getTabInStripDomRef() {
      return this._tabInStripDomRef;
    }

    get stableDomRef() {
      return this.getAttribute("stable-dom-ref") || `${this._id}-stable-dom-ref`;
    }

    get stripPresentation() {
      return (0, _executeTemplate.default)(this.constructor.stripTemplate, this);
    }

    get overflowPresentation() {
      return (0, _executeTemplate.default)(this.constructor.overflowTemplate, this);
    }

  }

  TabSeparator.define();

  _TabContainer.default.registerTabStyles(_TabSeparatorInStrip.default);

  _TabContainer.default.registerStaticAreaTabStyles(_TabSeparatorInOverflow.default);

  var _default = TabSeparator;
  _exports.default = _default;
});