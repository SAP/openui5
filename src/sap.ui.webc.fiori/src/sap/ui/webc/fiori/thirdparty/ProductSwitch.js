sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/i18nBundle", "sap/ui/webc/common/thirdparty/base/UI5Element", "sap/ui/webc/common/thirdparty/base/delegate/ItemNavigation", "sap/ui/webc/common/thirdparty/base/decorators/property", "sap/ui/webc/common/thirdparty/base/decorators/slot", "sap/ui/webc/common/thirdparty/base/decorators/customElement", "sap/ui/webc/common/thirdparty/base/delegate/ResizeHandler", "sap/ui/webc/common/thirdparty/base/types/Integer", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer", "sap/ui/webc/common/thirdparty/base/Keys", "./generated/templates/ProductSwitchTemplate.lit", "./generated/i18n/i18n-defaults", "./generated/themes/ProductSwitch.css"], function (_exports, _i18nBundle, _UI5Element, _ItemNavigation, _property, _slot, _customElement, _ResizeHandler, _Integer, _LitRenderer, _Keys, _ProductSwitchTemplate, _i18nDefaults, _ProductSwitch) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _UI5Element = _interopRequireDefault(_UI5Element);
  _ItemNavigation = _interopRequireDefault(_ItemNavigation);
  _property = _interopRequireDefault(_property);
  _slot = _interopRequireDefault(_slot);
  _customElement = _interopRequireDefault(_customElement);
  _ResizeHandler = _interopRequireDefault(_ResizeHandler);
  _Integer = _interopRequireDefault(_Integer);
  _LitRenderer = _interopRequireDefault(_LitRenderer);
  _ProductSwitchTemplate = _interopRequireDefault(_ProductSwitchTemplate);
  _ProductSwitch = _interopRequireDefault(_ProductSwitch);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  var __decorate = void 0 && (void 0).__decorate || function (decorators, target, key, desc) {
    var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
  var ProductSwitch_1;

  // Styles

  /**
   * @class
   * <h3 class="comment-api-title">Overview</h3>
   *
   * The <code>ui5-product-switch</code> is an SAP Fiori specific web component that is used in <code>ui5-shellbar</code>
   * and allows the user to easily switch between products.
   * <br><br>
   *
   * <h3>Keyboard Handling</h3>
   * The <code>ui5-product-switch</code> provides advanced keyboard handling.
   * When focused, the user can use the following keyboard
   * shortcuts in order to perform a navigation:
   * <br>
   * <ul>
   * <li>[TAB] - Move focus to the next interactive element after the <code>ui5-product-switch</code></li>
   * <li>[UP/DOWN] - Navigates up and down the items </li>
   * <li>[LEFT/RIGHT] - Navigates left and right the items</li>
   * </ul>
   * <br>
   * <br>
   *
   * <h3>ES6 Module Import</h3>
   * <code>import "@ui5/webcomponents-fiori/dist/ProductSwitch.js";</code>
   * <br>
   * <code>import "@ui5/webcomponents-fiori/dist/ProductSwitchItem.js";</code> (for <code>ui5-product-switch-item</code>)
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webc.fiori.ProductSwitch
   * @extends sap.ui.webc.base.UI5Element
   * @tagname ui5-product-switch
   * @appenddocs sap.ui.webc.fiori.ProductSwitchItem
   * @public
   * @since 1.0.0-rc.5
   */
  let ProductSwitch = ProductSwitch_1 = class ProductSwitch extends _UI5Element.default {
    constructor() {
      super();
      this._currentIndex = 0;
      this._rowSize = 4;
      this._itemNavigation = new _ItemNavigation.default(this, {
        rowSize: this._rowSize,
        getItemsCallback: () => this.items
      });
      this._handleResizeBound = this._handleResize.bind(this);
    }
    static get ROW_MIN_WIDTH() {
      return {
        ONE_COLUMN: 600,
        THREE_COLUMN: 900
      };
    }
    static async onDefine() {
      ProductSwitch_1.i18nBundle = await (0, _i18nBundle.getI18nBundle)("@ui5/webcomponents-fiori");
    }
    get _ariaLabelText() {
      return ProductSwitch_1.i18nBundle.getText(_i18nDefaults.PRODUCT_SWITCH_CONTAINER_LABEL);
    }
    onEnterDOM() {
      _ResizeHandler.default.register(document.body, this._handleResizeBound);
    }
    onExitDOM() {
      _ResizeHandler.default.deregister(document.body, this._handleResizeBound);
    }
    onBeforeRendering() {
      this.desktopColumns = this.items.length > 6 ? 4 : 3;
    }
    _handleResize() {
      const documentWidth = document.body.clientWidth;
      if (documentWidth <= this.constructor.ROW_MIN_WIDTH.ONE_COLUMN) {
        this._setRowSize(1);
      } else if (documentWidth <= this.constructor.ROW_MIN_WIDTH.THREE_COLUMN || this.items.length <= 6) {
        this._setRowSize(3);
      } else {
        this._setRowSize(4);
      }
    }
    handleProductSwitchItemClick(e) {
      this.items.forEach(item => {
        item.selected = false;
      });
      e.target.selected = true;
    }
    _onfocusin(e) {
      const target = e.target;
      this._itemNavigation.setCurrentItem(target);
      this._currentIndex = this.items.indexOf(target);
    }
    _setRowSize(size) {
      this._rowSize = size;
      this._itemNavigation.setRowSize(size);
    }
    _onkeydown(e) {
      if ((0, _Keys.isDown)(e)) {
        this._handleDown(e);
      } else if ((0, _Keys.isUp)(e)) {
        this._handleUp(e);
      }
    }
    _handleDown(e) {
      const itemsLength = this.items.length;
      if (this._currentIndex + this._rowSize > itemsLength) {
        // border reached, do nothing
        e.stopPropagation();
      }
    }
    _handleUp(e) {
      if (this._currentIndex - this._rowSize < 0) {
        // border reached, do nothing
        e.stopPropagation();
      }
    }
  };
  __decorate([(0, _property.default)({
    validator: _Integer.default
  })], ProductSwitch.prototype, "desktopColumns", void 0);
  __decorate([(0, _slot.default)({
    type: HTMLElement,
    "default": true
  })], ProductSwitch.prototype, "items", void 0);
  ProductSwitch = ProductSwitch_1 = __decorate([(0, _customElement.default)({
    tag: "ui5-product-switch",
    renderer: _LitRenderer.default,
    styles: _ProductSwitch.default,
    template: _ProductSwitchTemplate.default
  })], ProductSwitch);
  ProductSwitch.define();
  var _default = ProductSwitch;
  _exports.default = _default;
});