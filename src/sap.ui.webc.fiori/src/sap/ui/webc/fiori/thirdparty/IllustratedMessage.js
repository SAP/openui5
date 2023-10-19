sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/UI5Element", "sap/ui/webc/common/thirdparty/base/decorators/customElement", "sap/ui/webc/common/thirdparty/base/decorators/property", "sap/ui/webc/common/thirdparty/base/decorators/slot", "sap/ui/webc/common/thirdparty/base/delegate/ResizeHandler", "sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations", "sap/ui/webc/common/thirdparty/base/util/AriaLabelHelper", "sap/ui/webc/common/thirdparty/base/i18nBundle", "sap/ui/webc/main/thirdparty/Title", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer", "./types/IllustrationMessageSize", "./types/IllustrationMessageType", "./illustrations/BeforeSearch", "./generated/themes/IllustratedMessage.css", "./generated/templates/IllustratedMessageTemplate.lit"], function (_exports, _UI5Element, _customElement, _property, _slot, _ResizeHandler, _Illustrations, _AriaLabelHelper, _i18nBundle, _Title, _LitRenderer, _IllustrationMessageSize, _IllustrationMessageType, _BeforeSearch, _IllustratedMessage, _IllustratedMessageTemplate) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _UI5Element = _interopRequireDefault(_UI5Element);
  _customElement = _interopRequireDefault(_customElement);
  _property = _interopRequireDefault(_property);
  _slot = _interopRequireDefault(_slot);
  _ResizeHandler = _interopRequireDefault(_ResizeHandler);
  _Title = _interopRequireDefault(_Title);
  _LitRenderer = _interopRequireDefault(_LitRenderer);
  _IllustrationMessageSize = _interopRequireDefault(_IllustrationMessageSize);
  _IllustrationMessageType = _interopRequireDefault(_IllustrationMessageType);
  _IllustratedMessage = _interopRequireDefault(_IllustratedMessage);
  _IllustratedMessageTemplate = _interopRequireDefault(_IllustratedMessageTemplate);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  var __decorate = void 0 && (void 0).__decorate || function (decorators, target, key, desc) {
    var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
  var IllustratedMessage_1;

  // Styles

  // Template

  /**
   * @class
   *
   * <h3 class="comment-api-title">Overview</h3>
   * An IllustratedMessage is a recommended combination of a solution-oriented message, an engaging
   * illustration, and conversational tone to better communicate an empty or a success state than just show
   * a message alone.
   *
   * Each illustration has default internationalised title and subtitle texts. Also they can be managed with
   * <code>titleText</code> and <code>subtitleText</code> properties.
   *
   * To display the desired illustration, use the <code>name</code> property, where you can find the list of all available illustrations.
   * <br><br>
   * <b>Note:</b> By default the “BeforeSearch” illustration is loaded. To use other illustrations, make sure you import them in addition, for example:
   * <br>
   * <code>import "@ui5/webcomponents-fiori/dist/illustrations/NoData.js"</code>
   * <br>
   * <b>Note:</b> Illustrations starting with the “Tnt” prefix are part of another illustration set. For example to use the “TntSuccess” illustration, add the following import::
   * <br>
   * <code>import "@ui5/webcomponents-fiori/dist/illustrations/tnt/Success.js"</code>
   *
   * <h3>Structure</h3>
   * The IllustratedMessage consists of the following elements, which are displayed below each other in the following order:
   * <br>
   * <ul>
   * <li>Illustration</li>
   * <li>Title</li>
   * <li>Subtitle</li>
   * <li>Actions</li>
   * </ul>
   *
   * <h3>Usage</h3>
   * <code>ui5-illustrated-message</code> is meant to be used inside container component, for example a <code>ui5-card</code>,
   * a <code>ui5-dialog</code> or a <code>ui5-page</code>
   *
   * <h3>ES6 Module Import</h3>
   *
   * <code>import "@ui5/webcomponents-fiori/dist/IllustratedMessage.js";</code>
   *
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webc.fiori.IllustratedMessage
   * @extends sap.ui.webc.base.UI5Element
   * @tagname ui5-illustrated-message
   * @public
   * @since 1.0.0-rc.15
   */
  let IllustratedMessage = IllustratedMessage_1 = class IllustratedMessage extends _UI5Element.default {
    constructor() {
      super();
      this._handleResize = this.handleResize.bind(this);
      // this will store the last known offsetWidth of the IllustratedMessage DOM node for a given media (e.g. "Spot")
      this._lastKnownOffsetWidthForMedia = {};
      // this will store the last known media, in order to detect if IllustratedMessage has been hidden by expand/collapse container
      this._lastKnownMedia = "base";
    }
    static async onDefine() {
      IllustratedMessage_1.i18nBundle = await (0, _i18nBundle.getI18nBundle)("@ui5/webcomponents-fiori");
    }
    static get BREAKPOINTS() {
      return {
        DIALOG: 679,
        SPOT: 319,
        BASE: 259
      };
    }
    static get MEDIA() {
      return {
        BASE: "base",
        SPOT: "spot",
        DIALOG: "dialog",
        SCENE: "scene"
      };
    }
    async onBeforeRendering() {
      let illustrationData = (0, _Illustrations.getIllustrationDataSync)(this.name);
      // Gets the current illustration name given in the "name" attribute
      const currentIllustration = this.getAttribute("name");
      if (this.hasAttribute("name") && !this.isValidIllustration(currentIllustration)) {
        // eslint-disable-next-line
        console.warn(`The illustration "${currentIllustration}" does not exist. The default illustration "${_IllustrationMessageType.default.BeforeSearch}" is loaded instead.`);
      }
      if (illustrationData === undefined) {
        illustrationData = await (0, _Illustrations.getIllustrationData)(this.name);
      }
      this.spotSvg = illustrationData.spotSvg;
      this.dialogSvg = illustrationData.dialogSvg;
      this.sceneSvg = illustrationData.sceneSvg;
      this.illustrationTitle = IllustratedMessage_1.i18nBundle.getText(illustrationData.title);
      this.illustrationSubtitle = IllustratedMessage_1.i18nBundle.getText(illustrationData.subtitle);
      if (this.size !== _IllustrationMessageSize.default.Auto) {
        this._handleCustomSize();
      }
    }
    onEnterDOM() {
      _ResizeHandler.default.register(this, this._handleResize);
    }
    onExitDOM() {
      _ResizeHandler.default.deregister(this, this._handleResize);
    }
    handleResize() {
      if (this.size !== _IllustrationMessageSize.default.Auto) {
        return;
      }
      this._applyMedia();
    }
    _applyMedia() {
      const currOffsetWidth = this.offsetWidth;
      let newMedia = "";
      if (this.offsetWidth <= IllustratedMessage_1.BREAKPOINTS.BASE) {
        newMedia = IllustratedMessage_1.MEDIA.BASE;
      } else if (this.offsetWidth <= IllustratedMessage_1.BREAKPOINTS.SPOT) {
        newMedia = IllustratedMessage_1.MEDIA.SPOT;
      } else if (this.offsetWidth <= IllustratedMessage_1.BREAKPOINTS.DIALOG) {
        newMedia = IllustratedMessage_1.MEDIA.DIALOG;
      } else {
        newMedia = IllustratedMessage_1.MEDIA.SCENE;
      }
      const lastKnownOffsetWidth = this._lastKnownOffsetWidthForMedia[newMedia];
      // prevents infinite resizing, when same width is detected for the same media,
      // excluding the case in which, the control is placed inside expand/collapse container
      if (!(lastKnownOffsetWidth && currOffsetWidth === lastKnownOffsetWidth) || this._lastKnownOffsetWidthForMedia[this._lastKnownMedia] === 0) {
        this.media = newMedia;
        this._lastKnownOffsetWidthForMedia[newMedia] = currOffsetWidth;
        this._lastKnownMedia = newMedia;
      }
    }
    _setSVGAccAttrs() {
      const svg = this.shadowRoot.querySelector(".ui5-illustrated-message-illustration svg");
      if (svg) {
        if (this.ariaLabelText) {
          svg.setAttribute("aria-label", this.ariaLabelText);
        } else {
          svg.removeAttribute("aria-label");
        }
      }
    }
    onAfterRendering() {
      this._setSVGAccAttrs();
    }
    /**
     * Modifies the IM styles in accordance to the `size` property's value.
     * Note: The resize handler has no effect when size is different than "Auto".
     * @private
     * @since 1.5.0
     */
    _handleCustomSize() {
      switch (this.size) {
        case _IllustrationMessageSize.default.Base:
          this.media = IllustratedMessage_1.MEDIA.BASE;
          return;
        case _IllustrationMessageSize.default.Spot:
          this.media = IllustratedMessage_1.MEDIA.SPOT;
          return;
        case _IllustrationMessageSize.default.Dialog:
          this.media = IllustratedMessage_1.MEDIA.DIALOG;
          return;
        default:
          this.media = IllustratedMessage_1.MEDIA.SCENE;
      }
    }
    get ariaLabelText() {
      return (0, _AriaLabelHelper.getEffectiveAriaLabelText)(this);
    }
    get effectiveIllustration() {
      switch (this.media) {
        case IllustratedMessage_1.MEDIA.SPOT:
          return this.spotSvg;
        case IllustratedMessage_1.MEDIA.DIALOG:
          return this.dialogSvg;
        case IllustratedMessage_1.MEDIA.SCENE:
          return this.sceneSvg;
        default:
          return "";
      }
    }
    get hasFormattedSubtitle() {
      return !!this.subtitle.length;
    }
    get hasFormattedTitle() {
      return !!this.title.length;
    }
    get effectiveTitleText() {
      return this.titleText ? this.titleText : this.illustrationTitle;
    }
    get effectiveSubitleText() {
      return this.subtitleText ? this.subtitleText : this.illustrationSubtitle;
    }
    get hasTitle() {
      return !!(this.hasFormattedTitle || this.titleText || this.illustrationTitle);
    }
    get hasSubtitle() {
      return !!(this.hasFormattedSubtitle || this.subtitleText || this.illustrationSubtitle);
    }
    get hasActions() {
      return !!this.actions.length && this.media !== IllustratedMessage_1.MEDIA.BASE;
    }
    isValidIllustration(currentIllustration) {
      return currentIllustration in _IllustrationMessageType.default;
    }
  };
  __decorate([(0, _property.default)({
    type: _IllustrationMessageType.default,
    defaultValue: _IllustrationMessageType.default.BeforeSearch
  })], IllustratedMessage.prototype, "name", void 0);
  __decorate([(0, _property.default)({
    type: _IllustrationMessageSize.default,
    defaultValue: _IllustrationMessageSize.default.Auto
  })], IllustratedMessage.prototype, "size", void 0);
  __decorate([(0, _property.default)()], IllustratedMessage.prototype, "subtitleText", void 0);
  __decorate([(0, _property.default)()], IllustratedMessage.prototype, "titleText", void 0);
  __decorate([(0, _property.default)({
    defaultValue: ""
  })], IllustratedMessage.prototype, "accessibleNameRef", void 0);
  __decorate([(0, _property.default)({
    noAttribute: true
  })], IllustratedMessage.prototype, "spotSvg", void 0);
  __decorate([(0, _property.default)({
    noAttribute: true
  })], IllustratedMessage.prototype, "sceneSvg", void 0);
  __decorate([(0, _property.default)({
    noAttribute: true
  })], IllustratedMessage.prototype, "dialogSvg", void 0);
  __decorate([(0, _property.default)()], IllustratedMessage.prototype, "media", void 0);
  __decorate([(0, _slot.default)({
    type: HTMLElement
  })], IllustratedMessage.prototype, "title", void 0);
  __decorate([(0, _slot.default)({
    type: HTMLElement
  })], IllustratedMessage.prototype, "subtitle", void 0);
  __decorate([(0, _slot.default)({
    type: HTMLElement,
    "default": true
  })], IllustratedMessage.prototype, "actions", void 0);
  IllustratedMessage = IllustratedMessage_1 = __decorate([(0, _customElement.default)({
    tag: "ui5-illustrated-message",
    languageAware: true,
    themeAware: true,
    renderer: _LitRenderer.default,
    styles: _IllustratedMessage.default,
    template: _IllustratedMessageTemplate.default,
    dependencies: [_Title.default]
  })], IllustratedMessage);
  IllustratedMessage.define();
  var _default = IllustratedMessage;
  _exports.default = _default;
});