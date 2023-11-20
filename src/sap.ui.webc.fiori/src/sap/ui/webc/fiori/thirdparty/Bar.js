sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/UI5Element", "sap/ui/webc/common/thirdparty/base/decorators/customElement", "sap/ui/webc/common/thirdparty/base/decorators/property", "sap/ui/webc/common/thirdparty/base/decorators/slot", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer", "sap/ui/webc/common/thirdparty/base/delegate/ResizeHandler", "./types/BarDesign", "./generated/templates/BarTemplate.lit", "./generated/themes/Bar.css"], function (_exports, _UI5Element, _customElement, _property, _slot, _LitRenderer, _ResizeHandler, _BarDesign, _BarTemplate, _Bar) {
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
  _BarDesign = _interopRequireDefault(_BarDesign);
  _BarTemplate = _interopRequireDefault(_BarTemplate);
  _Bar = _interopRequireDefault(_Bar);
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
   * The Bar is a container which is primarily used to hold titles, buttons and input elements
   * and its design and functionality is the basis for page headers and footers.
   * The component consists of three areas to hold its content - startContent slot, default slot and endContent slot.
   * It has the capability to center content, such as a title, while having other components on the left and right side.
   *
   * <h3>Usage</h3>
   * With the use of the design property, you can set the style of the Bar to appear designed like a Header, Subheader, Footer and FloatingFooter.
   * <br>
   * <b>Note:</b> Do not place a Bar inside another Bar or inside any bar-like component. Doing so may cause unpredictable behavior.
   *
   * <h3>Responsive Behavior</h3>
   * The default slot will be centered in the available space between the startContent and the endContent areas,
   * therefore it might not always be centered in the entire bar.
   *
   * <h3>CSS Shadow Parts</h3>
   *
   * <ui5-link target="_blank" href="https://developer.mozilla.org/en-US/docs/Web/CSS/::part">CSS Shadow Parts</ui5-link> allow developers to style elements inside the Shadow DOM.
   * <br>
   * The <code>ui5-bar</code> exposes the following CSS Shadow Parts:
   * <ul>
   * <li>bar - Used to style the wrapper of the content of the component</li>
   * </ul>
   *
   * <h3>Keyboard Handling</h3>
   *
   * <h4>Fast Navigation</h4>
   * This component provides a build in fast navigation group which can be used via <code>F6 / Shift + F6</code> or <code> Ctrl + Alt(Option) + Down /  Ctrl + Alt(Option) + Up</code>.
   * In order to use this functionality, you need to import the following module:
   * <code>import "@ui5/webcomponents-base/dist/features/F6Navigation.js"</code>
   * <br><br>
   *
   * <h3>ES6 Module Import</h3>
   *
   * <code>import "@ui5/webcomponents-fiori/dist/Bar.js";</code>
   *
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webc.fiori.Bar
   * @implements sap.ui.webc.fiori.IBar
   * @extends sap.ui.webc.base.UI5Element
   * @tagname ui5-bar
   * @public
   * @since 1.0.0-rc.11
   */
  let Bar = class Bar extends _UI5Element.default {
    get accInfo() {
      return {
        "label": this.design
      };
    }
    constructor() {
      super();
      this._handleResizeBound = this.handleResize.bind(this);
    }
    handleResize() {
      const bar = this.getDomRef();
      const barWidth = bar.offsetWidth;
      const needShrinked = Array.from(bar.children).some(child => {
        return child.offsetWidth > barWidth / 3;
      });
      bar.classList.toggle("ui5-bar-root-shrinked", needShrinked);
    }
    get classes() {
      return {
        root: {
          "ui5-bar-root": true
        }
      };
    }
    onEnterDOM() {
      _ResizeHandler.default.register(this, this._handleResizeBound);
      this.getDomRef().querySelectorAll(".ui5-bar-content-container").forEach(child => {
        _ResizeHandler.default.register(child, this._handleResizeBound);
      }, this);
    }
    onExitDOM() {
      _ResizeHandler.default.deregister(this, this._handleResizeBound);
      this.getDomRef().querySelectorAll(".ui5-bar-content-container").forEach(child => {
        _ResizeHandler.default.deregister(child, this._handleResizeBound);
      }, this);
    }
  };
  __decorate([(0, _property.default)({
    type: _BarDesign.default,
    defaultValue: _BarDesign.default.Header
  })], Bar.prototype, "design", void 0);
  __decorate([(0, _slot.default)({
    type: HTMLElement
  })], Bar.prototype, "startContent", void 0);
  __decorate([(0, _slot.default)({
    type: HTMLElement,
    "default": true
  })], Bar.prototype, "middleContent", void 0);
  __decorate([(0, _slot.default)({
    type: HTMLElement
  })], Bar.prototype, "endContent", void 0);
  Bar = __decorate([(0, _customElement.default)({
    tag: "ui5-bar",
    fastNavigation: true,
    renderer: _LitRenderer.default,
    styles: _Bar.default,
    template: _BarTemplate.default
  })], Bar);
  Bar.define();
  var _default = Bar;
  _exports.default = _default;
});