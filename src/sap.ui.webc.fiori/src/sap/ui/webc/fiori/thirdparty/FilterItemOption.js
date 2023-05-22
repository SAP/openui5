sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/UI5Element", "sap/ui/webc/common/thirdparty/base/decorators/property", "sap/ui/webc/common/thirdparty/base/decorators/customElement"], function (_exports, _UI5Element, _property, _customElement) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _UI5Element = _interopRequireDefault(_UI5Element);
  _property = _interopRequireDefault(_property);
  _customElement = _interopRequireDefault(_customElement);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  var __decorate = void 0 && (void 0).__decorate || function (decorators, target, key, desc) {
    var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
  /**
   * @class
   *
   * <h3 class="comment-api-title">Overview</h3>
   *
   *
   * <h3>Usage</h3>
   *
   * For the <code>ui5-filter-item-option</code>
   * <h3>ES6 Module Import</h3>
   *
   * <code>import @ui5/webcomponents-fiori/dist/FilterItemOption.js";</code>
   *
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webc.fiori.FilterItemOption
   * @extends sap.ui.webc.base.UI5Element
   * @abstract
   * @since 1.0.0-rc.16
   * @tagname ui5-filter-item-option
   * @implements sap.ui.webc.fiori.IFilterItemOption
   * @public
   */
  let FilterItemOption = class FilterItemOption extends _UI5Element.default {};
  __decorate([(0, _property.default)()], FilterItemOption.prototype, "text", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], FilterItemOption.prototype, "selected", void 0);
  FilterItemOption = __decorate([(0, _customElement.default)("ui5-filter-item-option")], FilterItemOption);
  FilterItemOption.define();
  var _default = FilterItemOption;
  _exports.default = _default;
});