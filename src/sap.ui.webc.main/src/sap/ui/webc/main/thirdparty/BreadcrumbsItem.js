sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/UI5Element", "sap/ui/webc/common/thirdparty/base/decorators/customElement", "sap/ui/webc/common/thirdparty/base/decorators/property", "sap/ui/webc/common/thirdparty/base/decorators/slot"], function (_exports, _UI5Element, _customElement, _property, _slot) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _UI5Element = _interopRequireDefault(_UI5Element);
  _customElement = _interopRequireDefault(_customElement);
  _property = _interopRequireDefault(_property);
  _slot = _interopRequireDefault(_slot);
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
   * The <code>ui5-breadcrumbs-item</code> component defines the content of an item in <code>ui5-breadcrumbs</code>.
   *
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webc.main.BreadcrumbsItem
   * @extends sap.ui.webc.base.UI5Element
   * @abstract
   * @tagname ui5-breadcrumbs-item
   * @implements sap.ui.webc.main.IBreadcrumbsItem
   * @public
   * @since 1.0.0-rc.15
   */
  let BreadcrumbsItem = class BreadcrumbsItem extends _UI5Element.default {
    get stableDomRef() {
      return this.getAttribute("stable-dom-ref") || `${this._id}-stable-dom-ref`;
    }
  };
  __decorate([(0, _property.default)()], BreadcrumbsItem.prototype, "href", void 0);
  __decorate([(0, _property.default)({
    defaultValue: undefined
  })], BreadcrumbsItem.prototype, "target", void 0);
  __decorate([(0, _property.default)()], BreadcrumbsItem.prototype, "accessibleName", void 0);
  __decorate([(0, _slot.default)({
    type: Node,
    "default": true
  })], BreadcrumbsItem.prototype, "text", void 0);
  BreadcrumbsItem = __decorate([(0, _customElement.default)("ui5-breadcrumbs-item")], BreadcrumbsItem);
  BreadcrumbsItem.define();
  var _default = BreadcrumbsItem;
  _exports.default = _default;
});