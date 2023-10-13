sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/UI5Element", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer", "sap/ui/webc/common/thirdparty/base/decorators/property", "sap/ui/webc/common/thirdparty/base/decorators/customElement", "sap/ui/webc/common/thirdparty/base/i18nBundle", "./types/WrappingType", "./generated/i18n/i18n-defaults", "./generated/templates/LabelTemplate.lit", "./generated/themes/Label.css"], function (_exports, _UI5Element, _LitRenderer, _property, _customElement, _i18nBundle, _WrappingType, _i18nDefaults, _LabelTemplate, _Label) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _UI5Element = _interopRequireDefault(_UI5Element);
  _LitRenderer = _interopRequireDefault(_LitRenderer);
  _property = _interopRequireDefault(_property);
  _customElement = _interopRequireDefault(_customElement);
  _WrappingType = _interopRequireDefault(_WrappingType);
  _LabelTemplate = _interopRequireDefault(_LabelTemplate);
  _Label = _interopRequireDefault(_Label);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  var __decorate = void 0 && (void 0).__decorate || function (decorators, target, key, desc) {
    var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
  var Label_1;

  // Template

  // Styles

  /**
   * @class
   *
   * <h3 class="comment-api-title">Overview</h3>
   *
   * The <code>ui5-label</code> is a component used to represent a label for elements like input, textarea, select. <br><br>
   * The <code>for</code> property of the <code>ui5-label</code> must be the same as the id attribute of the related input element.<br><br>
   * Screen readers read out the label, when the user focuses the labelled control.
   * <br><br>
   * The <code>ui5-label</code> appearance can be influenced by properties,
   * such as <code>required</code> and <code>wrappingType</code>.
   * The appearance of the Label can be configured in a limited way by using the design property.
   * For a broader choice of designs, you can use custom styles.
   *
   * <h3>ES6 Module Import</h3>
   *
   * <code>import "@ui5/webcomponents/dist/Label";</code>
   *
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webc.main.Label
   * @extends sap.ui.webc.base.UI5Element
   * @tagname ui5-label
   * @public
   */
  let Label = Label_1 = class Label extends _UI5Element.default {
    static async onDefine() {
      Label_1.i18nBundle = await (0, _i18nBundle.getI18nBundle)("@ui5/webcomponents-fiori");
    }
    /**
     * Defines the text of the component.
     * <br><b>Note:</b> Although this slot accepts HTML Elements, it is strongly recommended that you only use text in order to preserve the intended design.
     *
     * @type {Node[]}
     * @slot
     * @public
     * @name sap.ui.webc.main.Label.prototype.default
     */
    _onclick() {
      if (!this.for) {
        return;
      }
      const elementToFocus = this.getRootNode().querySelector(`#${this.for}`);
      if (elementToFocus) {
        elementToFocus.focus();
      }
    }
    get _colonSymbol() {
      return Label_1.i18nBundle.getText(_i18nDefaults.LABEL_COLON);
    }
  };
  __decorate([(0, _property.default)()], Label.prototype, "for", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], Label.prototype, "showColon", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], Label.prototype, "required", void 0);
  __decorate([(0, _property.default)({
    type: _WrappingType.default,
    defaultValue: _WrappingType.default.None
  })], Label.prototype, "wrappingType", void 0);
  Label = Label_1 = __decorate([(0, _customElement.default)({
    tag: "ui5-label",
    renderer: _LitRenderer.default,
    template: _LabelTemplate.default,
    styles: _Label.default
  })], Label);
  Label.define();
  var _default = Label;
  _exports.default = _default;
});