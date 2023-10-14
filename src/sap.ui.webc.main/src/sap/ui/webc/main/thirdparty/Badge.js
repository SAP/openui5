sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/UI5Element", "sap/ui/webc/common/thirdparty/base/decorators/customElement", "sap/ui/webc/common/thirdparty/base/decorators/property", "sap/ui/webc/common/thirdparty/base/decorators/slot", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer", "sap/ui/webc/common/thirdparty/base/i18nBundle", "sap/ui/webc/common/thirdparty/base/util/willShowContent", "./generated/templates/BadgeTemplate.lit", "./generated/i18n/i18n-defaults", "./generated/themes/Badge.css"], function (_exports, _UI5Element, _customElement, _property, _slot, _LitRenderer, _i18nBundle, _willShowContent, _BadgeTemplate, _i18nDefaults, _Badge) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _UI5Element = _interopRequireDefault(_UI5Element);
  _customElement = _interopRequireDefault(_customElement);
  _property = _interopRequireDefault(_property);
  _slot = _interopRequireDefault(_slot);
  _LitRenderer = _interopRequireDefault(_LitRenderer);
  _willShowContent = _interopRequireDefault(_willShowContent);
  _BadgeTemplate = _interopRequireDefault(_BadgeTemplate);
  _Badge = _interopRequireDefault(_Badge);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  var __decorate = void 0 && (void 0).__decorate || function (decorators, target, key, desc) {
    var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
  var Badge_1;

  // Template

  // Styles

  /**
   * @class
   * <h3 class="comment-api-title">Overview</h3>
   *
   * The <code>ui5-badge</code> is a small non-interactive component which contains text information and color chosen from a list of predefined color schemes.
   * It serves the purpose to attract the user attention to some piece of information (state, quantity, condition, etc.).
   *
   * <h3>Usage Guidelines</h3>
   * <ul>
   * <li>If the text is longer than the width of the component, it doesn’t wrap, it shows ellipsis.</li>
   * <li>When truncated, the full text is not visible, therefore, it’s recommended to make more space for longer texts to be fully displayed.</li>
   * <li>Colors are not semantic and have no visual representation in High Contrast Black (sap_belize_hcb) theme.</li>
   * </ul>
   *
   * <h3>ES6 Module Import</h3>
   *
   * <code>import "@ui5/webcomponents/dist/Badge";</code>
   *
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webc.main.Badge
   * @extends sap.ui.webc.base.UI5Element
   * @tagname ui5-badge
   * @since 0.12.0
   * @public
   */
  let Badge = Badge_1 = class Badge extends _UI5Element.default {
    static async onDefine() {
      Badge_1.i18nBundle = await (0, _i18nBundle.getI18nBundle)("@ui5/webcomponents");
    }
    onBeforeRendering() {
      this._hasIcon = this.hasIcon;
      this._iconOnly = this.iconOnly;
    }
    get hasText() {
      return (0, _willShowContent.default)(this.text);
    }
    get hasIcon() {
      return !!this.icon.length;
    }
    get iconOnly() {
      return this.hasIcon && !this.hasText;
    }
    get badgeDescription() {
      return Badge_1.i18nBundle.getText(_i18nDefaults.BADGE_DESCRIPTION);
    }
  };
  __decorate([(0, _property.default)({
    defaultValue: "1"
  })], Badge.prototype, "colorScheme", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], Badge.prototype, "_hasIcon", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], Badge.prototype, "_iconOnly", void 0);
  __decorate([(0, _slot.default)({
    type: Node,
    "default": true
  })], Badge.prototype, "text", void 0);
  __decorate([(0, _slot.default)()], Badge.prototype, "icon", void 0);
  Badge = Badge_1 = __decorate([(0, _customElement.default)({
    tag: "ui5-badge",
    languageAware: true,
    renderer: _LitRenderer.default,
    template: _BadgeTemplate.default,
    styles: _Badge.default
  })], Badge);
  Badge.define();
  var _default = Badge;
  _exports.default = _default;
});