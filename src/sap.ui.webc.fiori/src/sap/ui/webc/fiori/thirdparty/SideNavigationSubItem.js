sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/UI5Element", "sap/ui/webc/common/thirdparty/base/decorators/customElement", "sap/ui/webc/common/thirdparty/base/decorators/event", "sap/ui/webc/common/thirdparty/base/decorators/property"], function (_exports, _UI5Element, _customElement, _event, _property) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _UI5Element = _interopRequireDefault(_UI5Element);
  _customElement = _interopRequireDefault(_customElement);
  _event = _interopRequireDefault(_event);
  _property = _interopRequireDefault(_property);
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
   * The <code>ui5-side-navigation-sub-item</code> is intended to be used inside a <code>ui5-side-navigation-item</code> only.
   *
   * <h3>ES6 Module Import</h3>
   *
   * <code>import "@ui5/webcomponents-fiori/dist/SideNavigationSubItem.js";</code>
   *
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webc.fiori.SideNavigationSubItem
   * @extends sap.ui.webc.base.UI5Element
   * @tagname ui5-side-navigation-sub-item
   * @public
   * @abstract
   * @implements sap.ui.webc.fiori.ISideNavigationSubItem
   * @since 1.0.0-rc.8
   */
  let SideNavigationSubItem = class SideNavigationSubItem extends _UI5Element.default {
    get _tooltip() {
      return this.title || this.text;
    }
  };
  __decorate([(0, _property.default)()], SideNavigationSubItem.prototype, "text", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], SideNavigationSubItem.prototype, "selected", void 0);
  __decorate([(0, _property.default)()], SideNavigationSubItem.prototype, "icon", void 0);
  __decorate([(0, _property.default)()], SideNavigationSubItem.prototype, "title", void 0);
  SideNavigationSubItem = __decorate([(0, _customElement.default)("ui5-side-navigation-sub-item")
  /**
   * Fired when the component is activated either with a
   * click/tap or by using the Enter or Space key.
   *
   * @event sap.ui.webc.fiori.SideNavigationSubItem#click
   * @public
   */, (0, _event.default)("click")], SideNavigationSubItem);
  SideNavigationSubItem.define();
  var _default = SideNavigationSubItem;
  _exports.default = _default;
});