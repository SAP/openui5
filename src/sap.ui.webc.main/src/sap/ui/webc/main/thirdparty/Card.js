sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/UI5Element", "sap/ui/webc/common/thirdparty/base/decorators/customElement", "sap/ui/webc/common/thirdparty/base/decorators/property", "sap/ui/webc/common/thirdparty/base/decorators/slot", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer", "sap/ui/webc/common/thirdparty/base/i18nBundle", "sap/ui/webc/common/thirdparty/base/util/AriaLabelHelper", "./generated/templates/CardTemplate.lit", "./Icon", "./generated/i18n/i18n-defaults", "./generated/themes/Card.css"], function (_exports, _UI5Element, _customElement, _property, _slot, _LitRenderer, _i18nBundle, _AriaLabelHelper, _CardTemplate, _Icon, _i18nDefaults, _Card) {
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
  _CardTemplate = _interopRequireDefault(_CardTemplate);
  _Icon = _interopRequireDefault(_Icon);
  _Card = _interopRequireDefault(_Card);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  var __decorate = void 0 && (void 0).__decorate || function (decorators, target, key, desc) {
    var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
  var Card_1;

  // Styles

  /**
   * @class
   * <h3 class="comment-api-title">Overview</h3>
   *
   * The <code>ui5-card</code> is a component that represents information in the form of a
   * tile with separate header and content areas.
   * The content area of a <code>ui5-card</code> can be arbitrary HTML content.
   * The header can be used through slot <code>header</code>. For which there is a <code>ui5-card-header</code> component to achieve the card look and feel.
   *
   * Note: We recommend the usage of <code>ui5-card-header</code> for the header slot, so advantage can be taken for keyboard handling, styling and accessibility.
   *
   * <h3>ES6 Module Import</h3>
   *
   * <code>import "@ui5/webcomponents/dist/Card";</code>
   * <br>
   * <code>import "@ui5/webcomponents/dist/CardHeader.js";</code> (for <code>ui5-card-header</code>)
   *
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webc.main.Card
   * @extends sap.ui.webc.base.UI5Element
   * @tagname ui5-card
   * @public
   * @appenddocs sap.ui.webc.main.CardHeader
   */
  let Card = Card_1 = class Card extends _UI5Element.default {
    get classes() {
      return {
        root: {
          "ui5-card-root": true,
          "ui5-card--interactive": this._hasHeader && this.header[0].interactive,
          "ui5-card--nocontent": !this.content.length
        }
      };
    }
    get _hasHeader() {
      return !!this.header.length;
    }
    get _getAriaLabel() {
      const effectiveAriaLabelText = (0, _AriaLabelHelper.getEffectiveAriaLabelText)(this),
        effectiveAriaLabel = effectiveAriaLabelText ? ` ${effectiveAriaLabelText}` : "";
      return Card_1.i18nBundle.getText(_i18nDefaults.ARIA_ROLEDESCRIPTION_CARD) + effectiveAriaLabel;
    }
    get _ariaCardContentLabel() {
      return Card_1.i18nBundle.getText(_i18nDefaults.ARIA_LABEL_CARD_CONTENT);
    }
    static async onDefine() {
      Card_1.i18nBundle = await (0, _i18nBundle.getI18nBundle)("@ui5/webcomponents");
    }
  };
  __decorate([(0, _property.default)()], Card.prototype, "accessibleName", void 0);
  __decorate([(0, _property.default)()], Card.prototype, "accessibleNameRef", void 0);
  __decorate([(0, _slot.default)({
    type: HTMLElement,
    "default": true
  })], Card.prototype, "content", void 0);
  __decorate([(0, _slot.default)({
    type: HTMLElement,
    invalidateOnChildChange: true
  })], Card.prototype, "header", void 0);
  Card = Card_1 = __decorate([(0, _customElement.default)({
    tag: "ui5-card",
    languageAware: true,
    renderer: _LitRenderer.default,
    template: _CardTemplate.default,
    styles: _Card.default,
    dependencies: [_Icon.default]
  })], Card);
  Card.define();
  var _default = Card;
  _exports.default = _default;
});