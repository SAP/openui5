sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/UI5Element", "sap/ui/webc/common/thirdparty/base/decorators/customElement", "sap/ui/webc/common/thirdparty/base/decorators/property", "sap/ui/webc/common/thirdparty/base/decorators/slot", "sap/ui/webc/common/thirdparty/base/decorators/event", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer", "sap/ui/webc/common/thirdparty/base/i18nBundle", "sap/ui/webc/common/thirdparty/base/Keys", "sap/ui/webc/common/thirdparty/base/Device", "sap/ui/webc/common/thirdparty/base/types/Integer", "./generated/templates/CardHeaderTemplate.lit", "./generated/i18n/i18n-defaults", "./generated/themes/CardHeader.css"], function (_exports, _UI5Element, _customElement, _property, _slot, _event, _LitRenderer, _i18nBundle, _Keys, _Device, _Integer, _CardHeaderTemplate, _i18nDefaults, _CardHeader) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _UI5Element = _interopRequireDefault(_UI5Element);
  _customElement = _interopRequireDefault(_customElement);
  _property = _interopRequireDefault(_property);
  _slot = _interopRequireDefault(_slot);
  _event = _interopRequireDefault(_event);
  _LitRenderer = _interopRequireDefault(_LitRenderer);
  _Integer = _interopRequireDefault(_Integer);
  _CardHeaderTemplate = _interopRequireDefault(_CardHeaderTemplate);
  _CardHeader = _interopRequireDefault(_CardHeader);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  var __decorate = void 0 && (void 0).__decorate || function (decorators, target, key, desc) {
    var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
  var CardHeader_1;

  // Styles

  /**
   * @class
   * <h3 class="comment-api-title">Overview</h3>
   *
   * The <code>ui5-card-header</code> is a component, meant to be used as a header of the <code>ui5-card</code> component.
   * It displays valuable information, that can be defined with several properties, such as: <code>titleText</code>, <code>subtitleText</code>, <code>status</code>
   * and two slots: <code>avatar</code> and <code>action</code>.
   *
   * <h3>Keyboard handling</h3>
   * In case you enable <code>interactive</code> property, you can press the <code>ui5-card-header</code> by Space and Enter keys.
   *
   * <h3>CSS Shadow Parts</h3>
   *
   * <ui5-link target="_blank" href="https://developer.mozilla.org/en-US/docs/Web/CSS/::part">CSS Shadow Parts</ui5-link> allow developers to style elements inside the Shadow DOM.
   * <br>
   * The <code>ui5-card-header</code> exposes the following CSS Shadow Parts:
   * <ul>
   * <li>root - Used to style the root DOM element of the CardHeader</li>
   * <li>title - Used to style the title of the CardHeader</li>
   * <li>subtitle - Used to style the subtitle of the CardHeader</li>
   * <li>status - Used to style the status of the CardHeader</li>
   * </ul>
   *
   * <h3>ES6 Module Import</h3>
   *
   * <code>import "@ui5/webcomponents/dist/CardHeader";</code>
   *
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webc.main.CardHeader
   * @implements sap.ui.webc.main.ICardHeader
   * @extends sap.ui.webc.base.UI5Element
   * @tagname ui5-card-header
   * @public
   * @since 1.0.0-rc.15
   */
  let CardHeader = CardHeader_1 = class CardHeader extends _UI5Element.default {
    get classes() {
      return {
        root: {
          "ui5-card-header": true,
          "ui5-card-header--interactive": this.interactive,
          "ui5-card-header--active": this.interactive && this._headerActive,
          "ui5-card-header-ff": (0, _Device.isFirefox)()
        }
      };
    }
    get _root() {
      return this.shadowRoot.querySelector(".ui5-card-header");
    }
    get ariaRoleDescription() {
      return this.interactive ? CardHeader_1.i18nBundle.getText(_i18nDefaults.ARIA_ROLEDESCRIPTION_INTERACTIVE_CARD_HEADER) : CardHeader_1.i18nBundle.getText(_i18nDefaults.ARIA_ROLEDESCRIPTION_CARD_HEADER);
    }
    get ariaRoleFocusableElement() {
      return this.interactive ? "button" : null;
    }
    get ariaCardAvatarLabel() {
      return CardHeader_1.i18nBundle.getText(_i18nDefaults.AVATAR_TOOLTIP);
    }
    get ariaLabelledBy() {
      const labels = [];
      if (this.titleText) {
        labels.push(`${this._id}-title`);
      }
      if (this.subtitleText) {
        labels.push(`${this._id}-subtitle`);
      }
      if (this.status) {
        labels.push(`${this._id}-status`);
      }
      if (this.hasAvatar) {
        labels.push(`${this._id}-avatar`);
      }
      return labels.length !== 0 ? labels.join(" ") : undefined;
    }
    get hasAvatar() {
      return !!this.avatar.length;
    }
    get hasAction() {
      return !!this.action.length;
    }
    static async onDefine() {
      CardHeader_1.i18nBundle = await (0, _i18nBundle.getI18nBundle)("@ui5/webcomponents");
    }
    _actionsFocusin() {
      this._root.classList.add("ui5-card-header-hide-focus");
    }
    _actionsFocusout() {
      this._root.classList.remove("ui5-card-header-hide-focus");
    }
    _click(e) {
      // prevents the native browser "click" event from firing
      e.stopImmediatePropagation();
      if (this.interactive && this._root.contains(e.target)) {
        this.fireEvent("click");
      }
    }
    _keydown(e) {
      if (!this.interactive || !this._root.contains(e.target)) {
        return;
      }
      const enter = (0, _Keys.isEnter)(e);
      const space = (0, _Keys.isSpace)(e);
      this._headerActive = enter || space;
      if (enter) {
        this.fireEvent("click");
        return;
      }
      if (space) {
        e.preventDefault();
      }
    }
    _keyup(e) {
      if (!this.interactive || !this._root.contains(e.target)) {
        return;
      }
      const space = (0, _Keys.isSpace)(e);
      this._headerActive = false;
      if (space) {
        this.fireEvent("click");
      }
    }
  };
  __decorate([(0, _property.default)()], CardHeader.prototype, "titleText", void 0);
  __decorate([(0, _property.default)()], CardHeader.prototype, "subtitleText", void 0);
  __decorate([(0, _property.default)()], CardHeader.prototype, "status", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], CardHeader.prototype, "interactive", void 0);
  __decorate([(0, _property.default)({
    validator: _Integer.default,
    defaultValue: 3
  })], CardHeader.prototype, "_ariaLevel", void 0);
  __decorate([(0, _property.default)({
    type: Boolean,
    noAttribute: true
  })], CardHeader.prototype, "_headerActive", void 0);
  __decorate([(0, _slot.default)()], CardHeader.prototype, "avatar", void 0);
  __decorate([(0, _slot.default)()], CardHeader.prototype, "action", void 0);
  CardHeader = CardHeader_1 = __decorate([(0, _customElement.default)({
    tag: "ui5-card-header",
    languageAware: true,
    renderer: _LitRenderer.default,
    template: _CardHeaderTemplate.default,
    styles: _CardHeader.default
  })
  /**
   * Fired when the component is activated by mouse/tap or by using the Enter or Space key.
   * <br><br>
   * <b>Note:</b> The event would be fired only if the <code>interactive</code> property is set to true.
   * @event sap.ui.webc.main.CardHeader#click
   * @public
   */, (0, _event.default)("click")], CardHeader);
  CardHeader.define();
  var _default = CardHeader;
  _exports.default = _default;
});