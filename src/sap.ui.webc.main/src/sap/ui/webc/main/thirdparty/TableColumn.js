sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/UI5Element", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer", "sap/ui/webc/common/thirdparty/base/decorators/customElement", "sap/ui/webc/common/thirdparty/base/decorators/property", "sap/ui/webc/common/thirdparty/base/types/Integer", "./generated/templates/TableColumnTemplate.lit", "./types/TableColumnPopinDisplay", "./generated/themes/TableColumn.css"], function (_exports, _UI5Element, _LitRenderer, _customElement, _property, _Integer, _TableColumnTemplate, _TableColumnPopinDisplay, _TableColumn) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _UI5Element = _interopRequireDefault(_UI5Element);
  _LitRenderer = _interopRequireDefault(_LitRenderer);
  _customElement = _interopRequireDefault(_customElement);
  _property = _interopRequireDefault(_property);
  _Integer = _interopRequireDefault(_Integer);
  _TableColumnTemplate = _interopRequireDefault(_TableColumnTemplate);
  _TableColumnPopinDisplay = _interopRequireDefault(_TableColumnPopinDisplay);
  _TableColumn = _interopRequireDefault(_TableColumn);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  var __decorate = void 0 && (void 0).__decorate || function (decorators, target, key, desc) {
    var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };

  // Styles

  /**
   * @class
   *
   * <h3 class="comment-api-title">Overview</h3>
   *
   * The <code>ui5-table-column</code> component allows to define column specific properties that are applied
   * when rendering the <code>ui5-table</code> component.
   *
   * <h3>CSS Shadow Parts</h3>
   *
   * <ui5-link target="_blank" href="https://developer.mozilla.org/en-US/docs/Web/CSS/::part">CSS Shadow Parts</ui5-link> allow developers to style elements inside the Shadow DOM.
   * <br>
   * The <code>ui5-table-column</code> exposes the following CSS Shadow Parts:
   * <ul>
   * <li>column - Used to style the native <code>th</code> element</li>
   * </ul>
   *
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webc.main.TableColumn
   * @extends sap.ui.webc.base.UI5Element
   * @tagname ui5-table-column
   * @implements sap.ui.webc.main.ITableColumn
   * @public
   */
  let TableColumn = class TableColumn extends _UI5Element.default {};
  __decorate([(0, _property.default)({
    validator: _Integer.default,
    defaultValue: Infinity
  })], TableColumn.prototype, "minWidth", void 0);
  __decorate([(0, _property.default)()], TableColumn.prototype, "popinText", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], TableColumn.prototype, "demandPopin", void 0);
  __decorate([(0, _property.default)({
    type: _TableColumnPopinDisplay.default,
    defaultValue: _TableColumnPopinDisplay.default.Block
  })], TableColumn.prototype, "popinDisplay", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], TableColumn.prototype, "first", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], TableColumn.prototype, "last", void 0);
  TableColumn = __decorate([(0, _customElement.default)({
    tag: "ui5-table-column",
    styles: _TableColumn.default,
    renderer: _LitRenderer.default,
    template: _TableColumnTemplate.default
  })], TableColumn);
  TableColumn.define();
  var _default = TableColumn;
  _exports.default = _default;
});