sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/UI5Element", "sap/ui/webc/common/thirdparty/base/decorators/customElement", "sap/ui/webc/common/thirdparty/base/decorators/property", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer", "sap/ui/webc/common/thirdparty/base/i18nBundle", "sap/ui/webc/common/thirdparty/base/decorators/slot", "./generated/templates/TableCellTemplate.lit", "./generated/themes/TableCell.css", "./generated/i18n/i18n-defaults"], function (_exports, _UI5Element, _customElement, _property, _LitRenderer, _i18nBundle, _slot, _TableCellTemplate, _TableCell, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _UI5Element = _interopRequireDefault(_UI5Element);
  _customElement = _interopRequireDefault(_customElement);
  _property = _interopRequireDefault(_property);
  _LitRenderer = _interopRequireDefault(_LitRenderer);
  _slot = _interopRequireDefault(_slot);
  _TableCellTemplate = _interopRequireDefault(_TableCellTemplate);
  _TableCell = _interopRequireDefault(_TableCell);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  var __decorate = void 0 && (void 0).__decorate || function (decorators, target, key, desc) {
    var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
  var TableCell_1;

  // Styles

  // Texts

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
   * @alias sap.ui.webc.main.TableCell
   * @extends sap.ui.webc.base.UI5Element
   * @tagname ui5-table-cell
   * @implements sap.ui.webc.main.ITableCell
   * @public
   */
  let TableCell = TableCell_1 = class TableCell extends _UI5Element.default {
    static async onDefine() {
      TableCell_1.i18nBundle = await (0, _i18nBundle.getI18nBundle)("@ui5/webcomponents");
    }
    get cellContent() {
      return this.getSlottedNodes("content");
    }
    get ariaLabelEmptyCellText() {
      return TableCell_1.i18nBundle.getText(_i18nDefaults.ARIA_LABEL_EMPTY_CELL);
    }
  };
  __decorate([(0, _property.default)({
    type: Boolean
  })], TableCell.prototype, "lastInRow", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], TableCell.prototype, "popined", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], TableCell.prototype, "_popinedInline", void 0);
  __decorate([(0, _slot.default)({
    type: HTMLElement,
    "default": true
  })], TableCell.prototype, "content", void 0);
  TableCell = TableCell_1 = __decorate([(0, _customElement.default)({
    tag: "ui5-table-cell",
    renderer: _LitRenderer.default,
    template: _TableCellTemplate.default,
    styles: _TableCell.default
  })], TableCell);
  TableCell.define();
  var _default = TableCell;
  _exports.default = _default;
});