sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/UI5Element", "sap/ui/webc/common/thirdparty/base/decorators/customElement", "sap/ui/webc/common/thirdparty/base/decorators/property", "sap/ui/webc/common/thirdparty/base/decorators/slot", "sap/ui/webc/common/thirdparty/base/types/Integer"], function (_exports, _UI5Element, _customElement, _property, _slot, _Integer) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _UI5Element = _interopRequireDefault(_UI5Element);
  _customElement = _interopRequireDefault(_customElement);
  _property = _interopRequireDefault(_property);
  _slot = _interopRequireDefault(_slot);
  _Integer = _interopRequireDefault(_Integer);
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
   * <code>ui5-menu-item</code> is the item to use inside a <code>ui5-menu</code>.
   * An arbitrary hierarchy structure can be represented by recursively nesting menu items.
   *
   * <h3>Usage</h3>
   *
   * <code>ui5-menu-item</code> is an abstract element, representing a node in a <code>ui5-menu</code>. The menu itself is rendered as a list,
   * and each <code>ui5-menu-item</code> is represented by a list item (<code>ui5-li</code>) in that list. Therefore, you should only use
   * <code>ui5-menu-item</code> directly in your apps. The <code>ui5-li</code> list item is internal for the list, and not intended for public use.
   *
   * <h3>ES6 Module Import</h3>
   *
   * <code>import "@ui5/webcomponents/dist/MenuItem.js";</code>
   *
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webc.main.MenuItem
   * @extends sap.ui.webc.base.UI5Element
   * @abstract
   * @tagname ui5-menu-item
   * @implements sap.ui.webc.main.IMenuItem
   * @since 1.3.0
   * @public
   */
  let MenuItem = class MenuItem extends _UI5Element.default {
    get hasSubmenu() {
      return !!(this.items.length || this.busy);
    }
    get hasDummyIcon() {
      return this._siblingsWithIcon && !this.icon;
    }
    get subMenuOpened() {
      return !!this._subMenu;
    }
    get _additionalText() {
      return this.hasSubmenu ? "" : this.additionalText;
    }
    get ariaLabelledByText() {
      return `${this.text} ${this.accessibleName}`.trim();
    }
  };
  __decorate([(0, _property.default)()], MenuItem.prototype, "text", void 0);
  __decorate([(0, _property.default)()], MenuItem.prototype, "additionalText", void 0);
  __decorate([(0, _property.default)()], MenuItem.prototype, "icon", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], MenuItem.prototype, "startsSection", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], MenuItem.prototype, "disabled", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], MenuItem.prototype, "busy", void 0);
  __decorate([(0, _property.default)({
    validator: _Integer.default,
    defaultValue: 1000
  })], MenuItem.prototype, "busyDelay", void 0);
  __decorate([(0, _property.default)()], MenuItem.prototype, "accessibleName", void 0);
  __decorate([(0, _property.default)({
    type: Boolean,
    noAttribute: true
  })], MenuItem.prototype, "_siblingsWithChildren", void 0);
  __decorate([(0, _property.default)({
    type: Boolean,
    noAttribute: true
  })], MenuItem.prototype, "_siblingsWithIcon", void 0);
  __decorate([(0, _property.default)({
    type: Boolean,
    noAttribute: true
  })], MenuItem.prototype, "_preventSubMenuClose", void 0);
  __decorate([(0, _property.default)({
    type: Object,
    defaultValue: undefined
  })], MenuItem.prototype, "_subMenu", void 0);
  __decorate([(0, _slot.default)({
    "default": true,
    type: HTMLElement,
    invalidateOnChildChange: true
  })], MenuItem.prototype, "items", void 0);
  MenuItem = __decorate([(0, _customElement.default)("ui5-menu-item")], MenuItem);
  MenuItem.define();
  var _default = MenuItem;
  _exports.default = _default;
});