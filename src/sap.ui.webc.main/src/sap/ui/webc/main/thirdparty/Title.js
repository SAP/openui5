sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/UI5Element", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer", "sap/ui/webc/common/thirdparty/base/decorators/customElement", "sap/ui/webc/common/thirdparty/base/decorators/property", "./types/TitleLevel", "./types/WrappingType", "./generated/templates/TitleTemplate.lit", "./generated/themes/Title.css"], function (_exports, _UI5Element, _LitRenderer, _customElement, _property, _TitleLevel, _WrappingType, _TitleTemplate, _Title) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _UI5Element = _interopRequireDefault(_UI5Element);
  _LitRenderer = _interopRequireDefault(_LitRenderer);
  _customElement = _interopRequireDefault(_customElement);
  _property = _interopRequireDefault(_property);
  _TitleLevel = _interopRequireDefault(_TitleLevel);
  _WrappingType = _interopRequireDefault(_WrappingType);
  _TitleTemplate = _interopRequireDefault(_TitleTemplate);
  _Title = _interopRequireDefault(_Title);
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
   * The <code>ui5-title</code> component is used to display titles inside a page.
   * It is a simple, large-sized text with explicit header/title semantics.
   *
   * <h3>ES6 Module Import</h3>
   *
   * <code>import "@ui5/webcomponents/dist/Title";</code>
   *
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webc.main.Title
   * @extends sap.ui.webc.base.UI5Element
   * @tagname ui5-title
   * @public
   */
  let Title = class Title extends _UI5Element.default {
    /**
     * Defines the text of the component.
     * This component supports nesting a <code>Link</code> component inside.
     * <br><br>
     * <b>Note:</b> Although this slot accepts HTML Elements, it is strongly recommended that you only use text in order to preserve the intended design.
     *
     * @type {Node[]}
     * @slot
     * @name sap.ui.webc.main.Title.prototype.default
     * @public
     */
    get normalizedLevel() {
      return this.level.toLowerCase();
    }
    get h1() {
      return this.normalizedLevel === "h1";
    }
    get h2() {
      return this.normalizedLevel === "h2";
    }
    get h3() {
      return this.normalizedLevel === "h3";
    }
    get h4() {
      return this.normalizedLevel === "h4";
    }
    get h5() {
      return this.normalizedLevel === "h5";
    }
    get h6() {
      return this.normalizedLevel === "h6";
    }
  };
  __decorate([(0, _property.default)({
    type: _WrappingType.default,
    defaultValue: _WrappingType.default.None
  })], Title.prototype, "wrappingType", void 0);
  __decorate([(0, _property.default)({
    type: _TitleLevel.default,
    defaultValue: _TitleLevel.default.H2
  })], Title.prototype, "level", void 0);
  Title = __decorate([(0, _customElement.default)({
    tag: "ui5-title",
    renderer: _LitRenderer.default,
    template: _TitleTemplate.default,
    styles: _Title.default
  })], Title);
  Title.define();
  var _default = Title;
  _exports.default = _default;
});