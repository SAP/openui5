sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/UI5Element", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer", "./generated/templates/TableCellTemplate.lit", "./generated/themes/TableCell.css"], function (_exports, _UI5Element, _LitRenderer, _TableCellTemplate, _TableCell) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _UI5Element = _interopRequireDefault(_UI5Element);
  _LitRenderer = _interopRequireDefault(_LitRenderer);
  _TableCellTemplate = _interopRequireDefault(_TableCellTemplate);
  _TableCell = _interopRequireDefault(_TableCell);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  // Styles

  /**
   * @public
   */
  const metadata = {
    tag: "ui5-table-cell",
    slots: /** @lends sap.ui.webcomponents.main.TableCell.prototype */{
      /**
       * Specifies the content of the component.
       *
       * @type {Node[]}
       * @slot
       * @public
       */
      "default": {
        type: Node
      }
    },
    properties: /** @lends sap.ui.webcomponents.main.TableCell.prototype */{
      /**
       * @private
       */
      lastInRow: {
        type: Boolean
      },
      /**
       * @private
       */
      popined: {
        type: Boolean
      }
    },
    events: /** @lends sap.ui.webcomponents.main.TableCell.prototype */{}
  };

  /**
   * @class
   *
   * <h3 class="comment-api-title">Overview</h3>
   *
   * The <code>ui5-table-cell</code> component defines the structure of the data in a single <code>ui5-table</code> cell.
   *
   * <h3>CSS Shadow Parts</h3>
   *
   * <ui5-link target="_blank" href="https://developer.mozilla.org/en-US/docs/Web/CSS/::part">CSS Shadow Parts</ui5-link> allow developers to style elements inside the Shadow DOM.
   * <br>
   * The <code>ui5-table-cell</code> exposes the following CSS Shadow Parts:
   * <ul>
   * <li>cell - Used to style the native <code>td</code> element</li>
   * </ul>
   *
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webcomponents.main.TableCell
   * @extends sap.ui.webcomponents.base.UI5Element
   * @tagname ui5-table-cell
   * @implements sap.ui.webcomponents.main.ITableCell
   * @public
   */
  class TableCell extends _UI5Element.default {
    static get metadata() {
      return metadata;
    }
    static get styles() {
      return _TableCell.default;
    }
    static get render() {
      return _LitRenderer.default;
    }
    static get template() {
      return _TableCellTemplate.default;
    }
  }
  TableCell.define();
  var _default = TableCell;
  _exports.default = _default;
});