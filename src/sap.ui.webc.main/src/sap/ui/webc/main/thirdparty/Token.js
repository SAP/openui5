sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/UI5Element", "sap/ui/webc/common/thirdparty/base/decorators/property", "sap/ui/webc/common/thirdparty/base/decorators/slot", "sap/ui/webc/common/thirdparty/base/decorators/event", "sap/ui/webc/common/thirdparty/base/decorators/customElement", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer", "sap/ui/webc/common/thirdparty/base/config/Theme", "sap/ui/webc/common/thirdparty/base/Keys", "sap/ui/webc/common/thirdparty/icons/decline", "sap/ui/webc/common/thirdparty/icons/sys-cancel", "sap/ui/webc/common/thirdparty/base/i18nBundle", "./generated/i18n/i18n-defaults", "./Icon", "./generated/templates/TokenTemplate.lit", "./generated/themes/Token.css"], function (_exports, _UI5Element, _property, _slot, _event, _customElement, _LitRenderer, _Theme, _Keys, _decline, _sysCancel, _i18nBundle, _i18nDefaults, _Icon, _TokenTemplate, _Token) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _UI5Element = _interopRequireDefault(_UI5Element);
  _property = _interopRequireDefault(_property);
  _slot = _interopRequireDefault(_slot);
  _event = _interopRequireDefault(_event);
  _customElement = _interopRequireDefault(_customElement);
  _LitRenderer = _interopRequireDefault(_LitRenderer);
  _Icon = _interopRequireDefault(_Icon);
  _TokenTemplate = _interopRequireDefault(_TokenTemplate);
  _Token = _interopRequireDefault(_Token);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  var __decorate = void 0 && (void 0).__decorate || function (decorators, target, key, desc) {
    var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
  var Token_1;

  // Styles

  /**
   * @class
   *
   * <h3 class="comment-api-title">Overview</h3>
   *
   * Tokens are small items of information (similar to tags) that mainly serve to visualize previously selected items.
   *
   * <h3>ES6 Module Import</h3>
   *
   * <code>import "@ui5/webcomponents/dist/Token.js";</code>
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webc.main.Token
   * @extends sap.ui.webc.base.UI5Element
   * @tagname ui5-token
   * @since 1.0.0-rc.9
   * @implements sap.ui.webc.main.IToken
   * @public
   */
  let Token = Token_1 = class Token extends _UI5Element.default {
    _handleSelect() {
      if (!this.toBeDeleted) {
        this.selected = !this.selected;
        this.fireEvent("select");
      }
    }
    _focusin() {
      this.focused = true;
    }
    _focusout() {
      this.focused = !this.focused;
    }
    _delete() {
      this.toBeDeleted = true;
      this.fireEvent("delete");
    }
    _keydown(e) {
      const isBackSpacePressed = (0, _Keys.isBackSpace)(e);
      const isDeletePressed = (0, _Keys.isDelete)(e);
      if (!this.readonly && (isBackSpacePressed || isDeletePressed)) {
        e.preventDefault();
        this.fireEvent("delete", {
          backSpace: isBackSpacePressed,
          "delete": isDeletePressed
        });
      }
      if ((0, _Keys.isSpace)(e) || (0, _Keys.isSpaceCtrl)(e)) {
        e.preventDefault();
        this._handleSelect();
      }
    }
    onBeforeRendering() {
      this.toBeDeleted = false;
    }
    get tokenDeletableText() {
      return Token_1.i18nBundle.getText(_i18nDefaults.TOKEN_ARIA_DELETABLE);
    }
    get iconURI() {
      if ((0, _Theme.getTheme)().includes("sap_belize")) {
        return "sys-cancel";
      }
      return "decline";
    }
    get textDom() {
      return this.getDomRef()?.querySelector(".ui5-token--text");
    }
    get isTruncatable() {
      if (!this.textDom) {
        return false;
      }
      return Math.ceil(this.textDom.getBoundingClientRect().width) < Math.ceil(this.textDom.scrollWidth);
    }
    static async onDefine() {
      Token_1.i18nBundle = await (0, _i18nBundle.getI18nBundle)("@ui5/webcomponents");
    }
  };
  __decorate([(0, _property.default)()], Token.prototype, "text", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], Token.prototype, "readonly", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], Token.prototype, "selected", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], Token.prototype, "overflows", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], Token.prototype, "singleToken", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], Token.prototype, "focused", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], Token.prototype, "toBeDeleted", void 0);
  __decorate([(0, _property.default)({
    defaultValue: "-1",
    noAttribute: true
  })], Token.prototype, "_tabIndex", void 0);
  __decorate([(0, _slot.default)()], Token.prototype, "closeIcon", void 0);
  Token = Token_1 = __decorate([(0, _customElement.default)({
    tag: "ui5-token",
    languageAware: true,
    renderer: _LitRenderer.default,
    template: _TokenTemplate.default,
    styles: _Token.default,
    dependencies: [_Icon.default]
  })
  /**
   * Fired when the the component is selected by user interaction with mouse or by clicking space.
   *
   * @event sap.ui.webc.main.Token#select
   * @public
   */, (0, _event.default)("select")
  /**
   * Fired when the backspace, delete or close icon of the token is pressed
   *
   * @event
   * @param {Boolean} backSpace Indicates whether token is deleted by backspace key.
   * @param {Boolean} delete Indicates whether token is deleted by delete key.
   * @private
   */, (0, _event.default)("delete", {
    detail: {
      "backSpace": {
        type: Boolean
      },
      "delete": {
        type: Boolean
      }
    }
  })], Token);
  Token.define();
  var _default = Token;
  _exports.default = _default;
});