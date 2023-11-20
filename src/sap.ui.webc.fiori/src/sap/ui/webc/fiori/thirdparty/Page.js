sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/UI5Element", "sap/ui/webc/common/thirdparty/base/decorators/customElement", "sap/ui/webc/common/thirdparty/base/decorators/property", "sap/ui/webc/common/thirdparty/base/decorators/slot", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer", "sap/ui/webc/common/thirdparty/base/delegate/ResizeHandler", "sap/ui/webc/common/thirdparty/base/MediaRange", "sap/ui/webc/main/thirdparty/generated/themes/BrowserScrollbar.css", "./types/PageBackgroundDesign", "./generated/templates/PageTemplate.lit", "./generated/themes/Page.css"], function (_exports, _UI5Element, _customElement, _property, _slot, _LitRenderer, _ResizeHandler, _MediaRange, _BrowserScrollbar, _PageBackgroundDesign, _PageTemplate, _Page) {
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
  _ResizeHandler = _interopRequireDefault(_ResizeHandler);
  _MediaRange = _interopRequireDefault(_MediaRange);
  _BrowserScrollbar = _interopRequireDefault(_BrowserScrollbar);
  _PageBackgroundDesign = _interopRequireDefault(_PageBackgroundDesign);
  _PageTemplate = _interopRequireDefault(_PageTemplate);
  _Page = _interopRequireDefault(_Page);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  var __decorate = void 0 && (void 0).__decorate || function (decorators, target, key, desc) {
    var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };

  // Template

  // Styles

  /**
   * @class
   *
   * <h3 class="comment-api-title">Overview</h3>
   *
   * The <code>ui5-page</code> is a container component that holds one whole screen of an application.
   * The page has three distinct areas that can hold content - a header, content area and a footer.
   * <h3>Structure</h3>
   * <h4>Header</h4>
   * The top most area of the page is occupied by the header. The standard header includes a navigation button and a title.
   * <h4>Content</h4>
   * The content occupies the main part of the page. Only the content area is scrollable by default.
   * This can be prevented by setting  <code>enableScrolling</code> to <code>false</code>.
   * <h4>Footer</h4>
   * The footer is optional and occupies the fixed bottom part of the page. Alternatively, the footer can be floating above the bottom part of the content.
   * This is enabled with the <code>floatingFooter</code> property.
   *
   * <b>Note:</b> <code>ui5-page</code> occipues the whole available space of its parent. In order to achieve the intended design you have to make sure
   * that there is enough space for the <code>ui5-page</code> to be rendered.
   * <b>Note:</b> In order for the <code>ui5-page</code> to be displayed, the parent element should have fixed height.
   *
   * <h3>CSS Shadow Parts</h3>
   *
   * <ui5-link target="_blank" href="https://developer.mozilla.org/en-US/docs/Web/CSS/::part">CSS Shadow Parts</ui5-link> allow developers to style elements inside the Shadow DOM.
   * <br>
   * The <code>ui5-page</code> exposes the following CSS Shadow Parts:
   * <ul>
   * <li>content - Used to style the content section of the component</li>
   * </ul>
   *
   * <h3>ES6 Module Import</h3>
   *
   * <code>import "@ui5/webcomponents-fiori/dist/Page.js";</code>
   *
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webc.fiori.Page
   * @extends sap.ui.webc.base.UI5Element
   * @tagname ui5-page
   * @since 1.0.0-rc.12
   * @public
   */
  let Page = class Page extends _UI5Element.default {
    constructor() {
      super();
      this._updateMediaRange = this.updateMediaRange.bind(this);
    }
    onEnterDOM() {
      _ResizeHandler.default.register(this, this._updateMediaRange);
    }
    onExitDOM() {
      _ResizeHandler.default.deregister(this, this._updateMediaRange);
    }
    updateMediaRange() {
      this.mediaRange = _MediaRange.default.getCurrentRange(_MediaRange.default.RANGESETS.RANGE_4STEPS, this.getDomRef().offsetWidth);
    }
    get _contentBottom() {
      return !this.floatingFooter && !this.hideFooter ? "2.75rem" : "0";
    }
    get _contentPaddingBottom() {
      return this.floatingFooter && !this.hideFooter ? "3.5rem" : "0";
    }
    get _contentTop() {
      return this.header.length ? "2.75rem" : "0rem";
    }
    get styles() {
      return {
        content: {
          "padding-bottom": this.footer.length && this._contentPaddingBottom,
          "bottom": this.footer.length && this._contentBottom,
          "top": this._contentTop
        },
        footer: {}
      };
    }
  };
  __decorate([(0, _property.default)({
    type: _PageBackgroundDesign.default,
    defaultValue: _PageBackgroundDesign.default.Solid
  })], Page.prototype, "backgroundDesign", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], Page.prototype, "disableScrolling", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], Page.prototype, "floatingFooter", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], Page.prototype, "hideFooter", void 0);
  __decorate([(0, _property.default)()], Page.prototype, "mediaRange", void 0);
  __decorate([(0, _slot.default)()], Page.prototype, "header", void 0);
  __decorate([(0, _slot.default)({
    type: HTMLElement,
    "default": true
  })], Page.prototype, "content", void 0);
  __decorate([(0, _slot.default)()], Page.prototype, "footer", void 0);
  Page = __decorate([(0, _customElement.default)({
    tag: "ui5-page",
    languageAware: true,
    renderer: _LitRenderer.default,
    styles: [_BrowserScrollbar.default, _Page.default],
    template: _PageTemplate.default
  })], Page);
  Page.define();
  var _default = Page;
  _exports.default = _default;
});