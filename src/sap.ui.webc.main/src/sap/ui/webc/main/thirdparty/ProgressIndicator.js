sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/UI5Element", "sap/ui/webc/common/thirdparty/base/decorators/customElement", "sap/ui/webc/common/thirdparty/base/decorators/property", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer", "sap/ui/webc/common/thirdparty/base/types/AnimationMode", "sap/ui/webc/common/thirdparty/base/types/ValueState", "sap/ui/webc/common/thirdparty/base/types/Integer", "sap/ui/webc/common/thirdparty/base/config/AnimationMode", "sap/ui/webc/common/thirdparty/base/i18nBundle", "./Icon", "./generated/i18n/i18n-defaults", "./generated/templates/ProgressIndicatorTemplate.lit", "./generated/themes/ProgressIndicator.css"], function (_exports, _UI5Element, _customElement, _property, _LitRenderer, _AnimationMode, _ValueState, _Integer, _AnimationMode2, _i18nBundle, _Icon, _i18nDefaults, _ProgressIndicatorTemplate, _ProgressIndicator) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _UI5Element = _interopRequireDefault(_UI5Element);
  _customElement = _interopRequireDefault(_customElement);
  _property = _interopRequireDefault(_property);
  _LitRenderer = _interopRequireDefault(_LitRenderer);
  _AnimationMode = _interopRequireDefault(_AnimationMode);
  _ValueState = _interopRequireDefault(_ValueState);
  _Integer = _interopRequireDefault(_Integer);
  _Icon = _interopRequireDefault(_Icon);
  _ProgressIndicatorTemplate = _interopRequireDefault(_ProgressIndicatorTemplate);
  _ProgressIndicator = _interopRequireDefault(_ProgressIndicator);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  var __decorate = void 0 && (void 0).__decorate || function (decorators, target, key, desc) {
    var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
  var ProgressIndicator_1;

  // Template

  // Styles

  /**
   * @class
   *
   * <h3 class="comment-api-title">Overview</h3>
   * Shows the progress of a process in a graphical way. To indicate the progress,
   * the inside of the component is filled with a color.
   *
   * <h3>Responsive Behavior</h3>
   * You can change the size of the Progress Indicator by changing its <code>width</code> or <code>height</code> CSS properties.
   *
   * <h3>ES6 Module Import</h3>
   *
   * <code>import "@ui5/webcomponents/dist/ProgressIndicator.js";</code>
   *
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webc.main.ProgressIndicator
   * @extends sap.ui.webc.base.UI5Element
   * @tagname ui5-progress-indicator
   * @public
   * @since 1.0.0-rc.8
   */
  let ProgressIndicator = ProgressIndicator_1 = class ProgressIndicator extends _UI5Element.default {
    constructor() {
      super();
      this._previousValue = 0;
      this._transitionDuration = 0;
    }
    onBeforeRendering() {
      this._transitionDuration = Math.abs(this._previousValue - this.validatedValue) * 20;
      this._previousValue = this.validatedValue;
    }
    valueStateTextMappings() {
      return {
        "Error": ProgressIndicator_1.i18nBundle.getText(_i18nDefaults.VALUE_STATE_ERROR),
        "Warning": ProgressIndicator_1.i18nBundle.getText(_i18nDefaults.VALUE_STATE_WARNING),
        "Success": ProgressIndicator_1.i18nBundle.getText(_i18nDefaults.VALUE_STATE_SUCCESS),
        "Information": ProgressIndicator_1.i18nBundle.getText(_i18nDefaults.VALUE_STATE_INFORMATION)
      };
    }
    valueStateIconMappings() {
      return {
        "Error": "status-negative",
        "Warning": "status-critical",
        "Success": "status-positive",
        "Information": "information"
      };
    }
    get styles() {
      return {
        bar: {
          "width": `${this.validatedValue}%`,
          "transition-duration": this.shouldAnimate ? `${this._transitionDuration}ms` : "none"
        }
      };
    }
    get classes() {
      return {
        root: {
          "ui5-progress-indicator-max-value": this.validatedValue === 100,
          "ui5-progress-indicator-min-value": this.validatedValue === 0
        }
      };
    }
    get validatedValue() {
      if (this.value < 0) {
        return 0;
      }
      if (this.value > 100) {
        return 100;
      }
      return this.value;
    }
    get showValueInRemainingBar() {
      return this.value <= 50;
    }
    get shouldAnimate() {
      return (0, _AnimationMode2.getAnimationMode)() !== _AnimationMode.default.None;
    }
    get valueStateText() {
      const percentValue = `${this.validatedValue}%`;
      const valueText = this.valueStateTextMappings()[this.valueState];
      return valueText ? `${percentValue} ${valueText}` : percentValue;
    }
    get showIcon() {
      return this.valueState !== _ValueState.default.None;
    }
    get valueStateIcon() {
      return this.valueStateIconMappings()[this.valueState];
    }
    get _ariaDisabled() {
      return this.disabled || undefined;
    }
    static async onDefine() {
      ProgressIndicator_1.i18nBundle = await (0, _i18nBundle.getI18nBundle)("@ui5/webcomponents");
    }
  };
  __decorate([(0, _property.default)()], ProgressIndicator.prototype, "accessibleName", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], ProgressIndicator.prototype, "disabled", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], ProgressIndicator.prototype, "hideValue", void 0);
  __decorate([(0, _property.default)({
    validator: _Integer.default,
    defaultValue: 0
  })], ProgressIndicator.prototype, "value", void 0);
  __decorate([(0, _property.default)()], ProgressIndicator.prototype, "displayValue", void 0);
  __decorate([(0, _property.default)({
    type: _ValueState.default,
    defaultValue: _ValueState.default.None
  })], ProgressIndicator.prototype, "valueState", void 0);
  ProgressIndicator = ProgressIndicator_1 = __decorate([(0, _customElement.default)({
    tag: "ui5-progress-indicator",
    renderer: _LitRenderer.default,
    styles: _ProgressIndicator.default,
    template: _ProgressIndicatorTemplate.default,
    dependencies: [_Icon.default]
  })], ProgressIndicator);
  ProgressIndicator.define();
  var _default = ProgressIndicator;
  _exports.default = _default;
});