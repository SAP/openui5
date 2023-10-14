sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/UI5Element", "sap/ui/webc/common/thirdparty/base/decorators/customElement", "sap/ui/webc/common/thirdparty/base/decorators/event", "sap/ui/webc/common/thirdparty/base/decorators/property", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer", "sap/ui/webc/common/thirdparty/base/Keys", "sap/ui/webc/common/thirdparty/base/util/AriaLabelHelper", "sap/ui/webc/common/thirdparty/base/i18nBundle", "sap/ui/webc/common/thirdparty/base/MarkedEvents", "./types/LinkDesign", "./types/WrappingType", "./generated/templates/LinkTemplate.lit", "./generated/i18n/i18n-defaults", "./generated/themes/Link.css"], function (_exports, _UI5Element, _customElement, _event, _property, _LitRenderer, _Keys, _AriaLabelHelper, _i18nBundle, _MarkedEvents, _LinkDesign, _WrappingType, _LinkTemplate, _i18nDefaults, _Link) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _UI5Element = _interopRequireDefault(_UI5Element);
  _customElement = _interopRequireDefault(_customElement);
  _event = _interopRequireDefault(_event);
  _property = _interopRequireDefault(_property);
  _LitRenderer = _interopRequireDefault(_LitRenderer);
  _LinkDesign = _interopRequireDefault(_LinkDesign);
  _WrappingType = _interopRequireDefault(_WrappingType);
  _LinkTemplate = _interopRequireDefault(_LinkTemplate);
  _Link = _interopRequireDefault(_Link);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  var __decorate = void 0 && (void 0).__decorate || function (decorators, target, key, desc) {
    var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
  var Link_1;

  // Template

  // Styles

  /**
   * @class
   *
   * <h3 class="comment-api-title">Overview</h3>
   * The <code>ui5-link</code> is a hyperlink component that is used to navigate to other
   * apps and web pages, or to trigger actions.
   * It is a clickable text element, visualized in such a way that it stands out
   * from the standard text.
   * On hover, it changes its style to an underlined text to provide additional feedback to the user.
   *
   *
   * <h3>Usage</h3>
   *
   * You can set the <code>ui5-link</code> to be enabled or disabled.
   * <br><br>
   * To create a visual hierarchy in large lists of links, you can set the less important links as
   * <code>Subtle</code> or the more important ones as <code>Emphasized</code>,
   * by using the <code>design</code> property.
   * <br><br>
   * If the <code>href</code> property is set, the link behaves as the HTML
   * anchor tag (<code>&lt;a&gt;&lt;a&#47;&gt;</code>) and opens the specified URL in the given target frame (<code>target</code> property).
   * To specify where the linked content is opened, you can use the <code>target</code> property.
   *
   * <h3>Responsive behavior</h3>
   *
   * If there is not enough space, the text of the <code>ui5-link</code> becomes truncated.
   * If the <code>wrappingType</code> property is set to <code>"Normal"</code>, the text is displayed
   * on several lines instead of being truncated.
   *
   * <h3>ES6 Module Import</h3>
   *
   * <code>import "@ui5/webcomponents/dist/Link";</code>
   *
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webc.main.Link
   * @extends sap.ui.webc.base.UI5Element
   * @tagname ui5-link
   * @public
   */
  let Link = Link_1 = class Link extends _UI5Element.default {
    constructor() {
      super();
      this._dummyAnchor = document.createElement("a");
    }
    onBeforeRendering() {
      const needsNoReferrer = this.target !== "_self" && this.href && this._isCrossOrigin();
      this._rel = needsNoReferrer ? "noreferrer noopener" : undefined;
    }
    _isCrossOrigin() {
      const loc = window.location;
      this._dummyAnchor.href = this.href;
      return !(this._dummyAnchor.hostname === loc.hostname && this._dummyAnchor.port === loc.port && this._dummyAnchor.protocol === loc.protocol);
    }
    get effectiveTabIndex() {
      if (this._tabIndex) {
        return this._tabIndex;
      }
      return this.disabled || !this.textContent?.length ? "-1" : "0";
    }
    get ariaLabelText() {
      return (0, _AriaLabelHelper.getEffectiveAriaLabelText)(this);
    }
    get hasLinkType() {
      return this.design !== _LinkDesign.default.Default;
    }
    static typeTextMappings() {
      return {
        "Subtle": _i18nDefaults.LINK_SUBTLE,
        "Emphasized": _i18nDefaults.LINK_EMPHASIZED
      };
    }
    get linkTypeText() {
      return Link_1.i18nBundle.getText(Link_1.typeTextMappings()[this.design]);
    }
    get parsedRef() {
      return this.href && this.href.length > 0 ? this.href : undefined;
    }
    get effectiveAccRole() {
      return this.accessibleRole.toLowerCase();
    }
    static async onDefine() {
      Link_1.i18nBundle = await (0, _i18nBundle.getI18nBundle)("@ui5/webcomponents");
    }
    _onclick(e) {
      const {
        altKey,
        ctrlKey,
        metaKey,
        shiftKey
      } = e;
      e.stopImmediatePropagation();
      (0, _MarkedEvents.markEvent)(e, "link");
      const executeEvent = this.fireEvent("click", {
        altKey,
        ctrlKey,
        metaKey,
        shiftKey
      }, true);
      if (!executeEvent) {
        e.preventDefault();
      }
    }
    _onfocusin(e) {
      (0, _MarkedEvents.markEvent)(e, "link");
      this.focused = true;
    }
    _onfocusout() {
      this.focused = false;
    }
    _onkeydown(e) {
      if ((0, _Keys.isEnter)(e) && !this.href) {
        this._onclick(e);
      } else if ((0, _Keys.isSpace)(e)) {
        e.preventDefault();
      }
      (0, _MarkedEvents.markEvent)(e, "link");
    }
    _onkeyup(e) {
      if (!(0, _Keys.isSpace)(e)) {
        (0, _MarkedEvents.markEvent)(e, "link");
        return;
      }
      this._onclick(e);
      if (this.href && !e.defaultPrevented) {
        const customEvent = new MouseEvent("click");
        customEvent.stopImmediatePropagation();
        this.getDomRef().dispatchEvent(customEvent);
      }
    }
  };
  __decorate([(0, _property.default)({
    type: Boolean
  })], Link.prototype, "disabled", void 0);
  __decorate([(0, _property.default)()], Link.prototype, "title", void 0);
  __decorate([(0, _property.default)()], Link.prototype, "href", void 0);
  __decorate([(0, _property.default)()], Link.prototype, "target", void 0);
  __decorate([(0, _property.default)({
    type: _LinkDesign.default,
    defaultValue: _LinkDesign.default.Default
  })], Link.prototype, "design", void 0);
  __decorate([(0, _property.default)({
    type: _WrappingType.default,
    defaultValue: _WrappingType.default.None
  })], Link.prototype, "wrappingType", void 0);
  __decorate([(0, _property.default)()], Link.prototype, "accessibleName", void 0);
  __decorate([(0, _property.default)()], Link.prototype, "accessibleNameRef", void 0);
  __decorate([(0, _property.default)({
    defaultValue: "link"
  })], Link.prototype, "accessibleRole", void 0);
  __decorate([(0, _property.default)({
    type: Object
  })], Link.prototype, "accessibilityAttributes", void 0);
  __decorate([(0, _property.default)({
    noAttribute: true
  })], Link.prototype, "_rel", void 0);
  __decorate([(0, _property.default)({
    noAttribute: true
  })], Link.prototype, "_tabIndex", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], Link.prototype, "focused", void 0);
  Link = Link_1 = __decorate([(0, _customElement.default)({
    tag: "ui5-link",
    languageAware: true,
    renderer: _LitRenderer.default,
    template: _LinkTemplate.default,
    styles: _Link.default
  })
  /**
   * Fired when the component is triggered either with a mouse/tap
   * or by using the Enter key.
   *
   * @event sap.ui.webc.main.Link#click
   * @public
   * @allowPreventDefault
   * @param {Boolean} altKey Returns whether the "ALT" key was pressed when the event was triggered.
   * @param {Boolean} ctrlKey Returns whether the "CTRL" key was pressed when the event was triggered.
   * @param {Boolean} metaKey Returns whether the "META" key was pressed when the event was triggered.
   * @param {Boolean} shiftKey Returns whether the "SHIFT" key was pressed when the event was triggered.
   */, (0, _event.default)("click", {
    detail: {
      altKey: {
        type: Boolean
      },
      ctrlKey: {
        type: Boolean
      },
      metaKey: {
        type: Boolean
      },
      shiftKey: {
        type: Boolean
      }
    }
  })], Link);
  Link.define();
  var _default = Link;
  _exports.default = _default;
});