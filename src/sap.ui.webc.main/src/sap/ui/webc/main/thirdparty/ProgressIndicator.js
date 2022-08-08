sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/UI5Element", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer", "sap/ui/webc/common/thirdparty/base/types/AnimationMode", "sap/ui/webc/common/thirdparty/base/types/ValueState", "sap/ui/webc/common/thirdparty/base/types/Integer", "sap/ui/webc/common/thirdparty/base/config/AnimationMode", "sap/ui/webc/common/thirdparty/base/i18nBundle", "./Icon", "./generated/templates/ProgressIndicatorTemplate.lit", "./generated/i18n/i18n-defaults", "./generated/themes/ProgressIndicator.css"], function (_exports, _UI5Element, _LitRenderer, _AnimationMode, _ValueState, _Integer, _AnimationMode2, _i18nBundle, _Icon, _ProgressIndicatorTemplate, _i18nDefaults, _ProgressIndicator) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _UI5Element = _interopRequireDefault(_UI5Element);
  _LitRenderer = _interopRequireDefault(_LitRenderer);
  _AnimationMode = _interopRequireDefault(_AnimationMode);
  _ValueState = _interopRequireDefault(_ValueState);
  _Integer = _interopRequireDefault(_Integer);
  _Icon = _interopRequireDefault(_Icon);
  _ProgressIndicatorTemplate = _interopRequireDefault(_ProgressIndicatorTemplate);
  _ProgressIndicator = _interopRequireDefault(_ProgressIndicator);

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

  // Styles

  /**
   * @public
   */
  const metadata = {
    tag: "ui5-progress-indicator",
    properties:
    /** @lends sap.ui.webcomponents.main.ProgressIndicator.prototype */
    {
      /**
       * Defines whether component is in disabled state.
       *
       * @type {boolean}
       * @defaultvalue false
       * @public
       */
      disabled: {
        type: Boolean
      },

      /**
       * Defines whether the component value is shown.
       *
       * @type {boolean}
       * @defaultvalue false
       * @public
       */
      hideValue: {
        type: Boolean
      },

      /**
       * Specifies the numerical value in percent for the length of the component.
       *
       * <b>Note:</b>
       * If a value greater than 100 is provided, the percentValue is set to 100. In other cases of invalid value, percentValue is set to its default of 0.
       * @type {Integer}
       * @defaultvalue 0
       * @public
       */
      value: {
        type: _Integer.default,
        defaultValue: 0
      },

      /**
       * Specifies the text value to be displayed in the bar.
       *
       * <b>Note:</b>
       * <ul>
       * <li>If there is no value provided or the value is empty, the default percentage value is shown.</li>
       * <li>If <code>hideValue</code> property is <code>true</code> both the <code>displayValue</code> and <code>value</code> property values are not shown.</li>
       * </ul>
       *
       * @type {string}
       * @public
       */
      displayValue: {
        type: String
      },

      /**
       * Defines the value state of the component.
       * <br><br>
       * Available options are:
       * <ul>
       * <li><code>None</code></li>
       * <li><code>Error</code></li>
       * <li><code>Warning</code></li>
       * <li><code>Success</code></li>
       * <li><code>Information</code></li>
       * </ul>
       *
       * @type {ValueState}
       * @defaultvalue "None"
       * @public
       */
      valueState: {
        type: _ValueState.default,
        defaultValue: _ValueState.default.None
      }
    },
    slots:
    /** @lends sap.ui.webcomponents.main.ProgressIndicator.prototype */
    {//
    },
    events:
    /** @lends sap.ui.webcomponents.main.ProgressIndicator.prototype */
    {//
    }
  };
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
   * @alias sap.ui.webcomponents.main.ProgressIndicator
   * @extends UI5Element
   * @tagname ui5-progress-indicator
   * @public
   * @since 1.0.0-rc.8
   */

  class ProgressIndicator extends _UI5Element.default {
    static get metadata() {
      return metadata;
    }

    static get render() {
      return _LitRenderer.default;
    }

    static get styles() {
      return _ProgressIndicator.default;
    }

    static get template() {
      return _ProgressIndicatorTemplate.default;
    }

    static get dependencies() {
      return [_Icon.default];
    }

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
        "Error": ProgressIndicator.i18nBundle.getText(_i18nDefaults.VALUE_STATE_ERROR),
        "Warning": ProgressIndicator.i18nBundle.getText(_i18nDefaults.VALUE_STATE_WARNING),
        "Success": ProgressIndicator.i18nBundle.getText(_i18nDefaults.VALUE_STATE_SUCCESS),
        "Information": ProgressIndicator.i18nBundle.getText(_i18nDefaults.VALUE_STATE_INFORMATION)
      };
    }

    valueStateIconMappings() {
      return {
        "Error": "status-negative",
        "Warning": "status-critical",
        "Success": "status-positive",
        "Information": "hint"
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
      ProgressIndicator.i18nBundle = await (0, _i18nBundle.getI18nBundle)("@ui5/webcomponents");
    }

  }

  ProgressIndicator.define();
  var _default = ProgressIndicator;
  _exports.default = _default;
});