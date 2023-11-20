sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/UI5Element", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer", "sap/ui/webc/common/thirdparty/base/Keys", "sap/ui/webc/main/thirdparty/Icon", "sap/ui/webc/common/thirdparty/base/decorators/property", "sap/ui/webc/common/thirdparty/base/decorators/event", "sap/ui/webc/common/thirdparty/base/decorators/customElement", "./generated/templates/ProductSwitchItemTemplate.lit", "./generated/themes/ProductSwitchItem.css"], function (_exports, _UI5Element, _LitRenderer, _Keys, _Icon, _property, _event, _customElement, _ProductSwitchItemTemplate, _ProductSwitchItem) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _UI5Element = _interopRequireDefault(_UI5Element);
  _LitRenderer = _interopRequireDefault(_LitRenderer);
  _Icon = _interopRequireDefault(_Icon);
  _property = _interopRequireDefault(_property);
  _event = _interopRequireDefault(_event);
  _customElement = _interopRequireDefault(_customElement);
  _ProductSwitchItemTemplate = _interopRequireDefault(_ProductSwitchItemTemplate);
  _ProductSwitchItem = _interopRequireDefault(_ProductSwitchItem);
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
   * <h3 class="comment-api-title">Overview</h3>
   * The <code>ui5-product-switch-item</code> web component represents the items displayed in the
   * <code>ui5-product-switch</code> web component.
   * <br><br>
   * <b>Note:</b> <code>ui5-product-switch-item</code> is not supported when used outside of <code>ui5-product-switch</code>.
   * <br><br>
   *
   * <h3>Keyboard Handling</h3>
   * The <code>ui5-product-switch</code> provides advanced keyboard handling.
   * When focused, the user can use the following keyboard
   * shortcuts in order to perform a navigation:
   * <br>
   * <ul>
   * <li>[SPACE/ENTER/RETURN] - Trigger <code>ui5-click</code> event</li>
   * </ul>
   *
   * <h3>ES6 Module Import</h3>
   * <code>import "@ui5/webcomponents-fiori/dist/ProductSwitchItem.js";</code>
   *
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webc.fiori.ProductSwitchItem
   * @extends sap.ui.webc.base.UI5Element
   * @tagname ui5-product-switch-item
   * @public
   * @implements sap.ui.webc.fiori.IProductSwitchItem
   * @since 1.0.0-rc.5
   */
  let ProductSwitchItem = class ProductSwitchItem extends _UI5Element.default {
    constructor() {
      super();
      this._deactivate = () => {
        if (this.active) {
          this.active = false;
        }
      };
    }
    onEnterDOM() {
      document.addEventListener("mouseup", this._deactivate);
    }
    onExitDOM() {
      document.removeEventListener("mouseup", this._deactivate);
    }
    _onmousedown() {
      this.active = true;
    }
    _onkeydown(e) {
      if ((0, _Keys.isSpace)(e) || (0, _Keys.isEnter)(e)) {
        this.active = true;
      }
      if ((0, _Keys.isSpace)(e)) {
        e.preventDefault();
      }
      if ((0, _Keys.isEnter)(e)) {
        this._fireItemClick();
      }
    }
    _onkeyup(e) {
      if ((0, _Keys.isSpace)(e) || (0, _Keys.isEnter)(e)) {
        this.active = false;
      }
      if ((0, _Keys.isSpace)(e)) {
        if ((0, _Keys.isSpaceShift)(e)) {
          e.stopPropagation();
        }
        this._fireItemClick();
      }
    }
    _onfocusout() {
      this.active = false;
      this.focused = false;
    }
    _onfocusin(e) {
      this.focused = true;
      this.fireEvent("_focused", e);
    }
    _fireItemClick() {
      this.fireEvent("click", {
        item: this
      });
    }
  };
  __decorate([(0, _property.default)()], ProductSwitchItem.prototype, "titleText", void 0);
  __decorate([(0, _property.default)()], ProductSwitchItem.prototype, "subtitleText", void 0);
  __decorate([(0, _property.default)()], ProductSwitchItem.prototype, "icon", void 0);
  __decorate([(0, _property.default)({
    defaultValue: "_self"
  })], ProductSwitchItem.prototype, "target", void 0);
  __decorate([(0, _property.default)()], ProductSwitchItem.prototype, "targetSrc", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], ProductSwitchItem.prototype, "active", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], ProductSwitchItem.prototype, "focused", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], ProductSwitchItem.prototype, "selected", void 0);
  __decorate([(0, _property.default)({
    defaultValue: "-1",
    noAttribute: true
  })], ProductSwitchItem.prototype, "_tabIndex", void 0);
  ProductSwitchItem = __decorate([(0, _customElement.default)({
    tag: "ui5-product-switch-item",
    renderer: _LitRenderer.default,
    styles: _ProductSwitchItem.default,
    template: _ProductSwitchItemTemplate.default,
    dependencies: [_Icon.default]
  })
  /**
   * Fired when the <code>ui5-product-switch-item</code> is activated either with a
   * click/tap or by using the Enter or Space key.
   *
   * @event sap.ui.webc.fiori.ProductSwitchItem#click
   * @public
   */, (0, _event.default)("click"), (0, _event.default)("_focused")], ProductSwitchItem);
  ProductSwitchItem.define();
  var _default = ProductSwitchItem;
  _exports.default = _default;
});