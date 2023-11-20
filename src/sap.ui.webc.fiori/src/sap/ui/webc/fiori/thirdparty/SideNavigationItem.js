sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/UI5Element", "sap/ui/webc/common/thirdparty/base/decorators/customElement", "sap/ui/webc/common/thirdparty/base/decorators/event", "sap/ui/webc/common/thirdparty/base/decorators/property", "sap/ui/webc/common/thirdparty/base/decorators/slot", "sap/ui/webc/main/thirdparty/types/HasPopup"], function (_exports, _UI5Element, _customElement, _event, _property, _slot, _HasPopup) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _UI5Element = _interopRequireDefault(_UI5Element);
  _customElement = _interopRequireDefault(_customElement);
  _event = _interopRequireDefault(_event);
  _property = _interopRequireDefault(_property);
  _slot = _interopRequireDefault(_slot);
  _HasPopup = _interopRequireDefault(_HasPopup);
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
   * The <code>ui5-side-navigation-item</code> is used within <code>ui5-side-navigation</code> only.
   * Via the <code>ui5-side-navigation-item</code> you control the content of the <code>SideNavigation</code>.
   *
   * <h3>ES6 Module Import</h3>
   *
   * <code>import "@ui5/webcomponents-fiori/dist/SideNavigationItem.js";</code>
   *
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webc.fiori.SideNavigationItem
   * @extends sap.ui.webc.base.UI5Element
   * @abstract
   * @tagname ui5-side-navigation-item
   * @public
   * @implements sap.ui.webc.fiori.ISideNavigationItem
   * @since 1.0.0-rc.8
   */
  let SideNavigationItem = class SideNavigationItem extends _UI5Element.default {
    get _tooltip() {
      return this.title || this.text;
    }
    get _ariaHasPopup() {
      if (this.parentNode.collapsed && this.items.length) {
        return _HasPopup.default.Tree;
      }
      return undefined;
    }
  };
  __decorate([(0, _property.default)()], SideNavigationItem.prototype, "text", void 0);
  __decorate([(0, _property.default)()], SideNavigationItem.prototype, "icon", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], SideNavigationItem.prototype, "expanded", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], SideNavigationItem.prototype, "selected", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], SideNavigationItem.prototype, "wholeItemToggleable", void 0);
  __decorate([(0, _property.default)()], SideNavigationItem.prototype, "title", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], SideNavigationItem.prototype, "_fixed", void 0);
  __decorate([(0, _slot.default)({
    type: HTMLElement,
    invalidateOnChildChange: true,
    "default": true
  })], SideNavigationItem.prototype, "items", void 0);
  SideNavigationItem = __decorate([(0, _customElement.default)("ui5-side-navigation-item")
  /**
   * Fired when the component is activated either with a
   * click/tap or by using the Enter or Space key.
   *
   * @event sap.ui.webc.fiori.SideNavigationItem#click
   * @public
   */, (0, _event.default)("click")], SideNavigationItem);
  SideNavigationItem.define();
  var _default = SideNavigationItem;
  _exports.default = _default;
});