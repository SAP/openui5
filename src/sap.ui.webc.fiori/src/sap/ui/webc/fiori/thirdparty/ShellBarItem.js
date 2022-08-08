sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/UI5Element", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer"], function (_exports, _UI5Element, _LitRenderer) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _UI5Element = _interopRequireDefault(_UI5Element);
  _LitRenderer = _interopRequireDefault(_LitRenderer);

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

  /**
   * @public
   */
  const metadata = {
    tag: "ui5-shellbar-item",
    properties:
    /** @lends sap.ui.webcomponents.fiori.ShellBarItem.prototype */
    {
      /**
       * Defines the name of the item's icon.
       * @type {string}
       * @defaultvalue ""
       * @public
       */
      icon: {
        type: String
      },

      /**
       * Defines the item text.
       * @type {string}
       * @defaultvalue ""
       * @public
       */
      text: {
        type: String
      },

      /**
       * Defines the count displayed in the top-right corner.
       * @type {string}
       * @defaultValue ""
       * @since 1.0.0-rc.6
       * @public
       */
      count: {
        type: String
      }
    },
    events:
    /** @lends sap.ui.webcomponents.fiori.ShellBarItem.prototype */
    {
      /**
       * Fired, when the item is pressed.
       *
       * @event sap.ui.webcomponents.fiori.ShellBarItem#click
       * @allowPreventDefault
       * @param {HTMLElement} targetRef DOM ref of the clicked element
       * @public
       * @native
       */
      "click": {
        detail: {
          targetRef: {
            type: HTMLElement
          }
        }
      }
    }
  };
  /**
   * @class
   * The <code>ui5-shellbar-item</code> represents a custom item, that
   * might be added to the <code>ui5-shellbar</code>.
   * <br><br>
   * <h3>ES6 Module Import</h3>
   * <code>import "@ui5/webcomponents-fiori/dist/ShellBarItem";</code>
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webcomponents.fiori.ShellBarItem
   * @extends sap.ui.webcomponents.base.UI5Element
   * @tagname ui5-shellbar-item
   * @implements sap.ui.webcomponents.fiori.IShellBarItem
   * @public
   */

  class ShellBarItem extends _UI5Element.default {
    static get metadata() {
      return metadata;
    }

    static get render() {
      return _LitRenderer.default;
    }

    get stableDomRef() {
      return this.getAttribute("stable-dom-ref") || `${this._id}-stable-dom-ref`;
    }

  }

  ShellBarItem.define();
  var _default = ShellBarItem;
  _exports.default = _default;
});