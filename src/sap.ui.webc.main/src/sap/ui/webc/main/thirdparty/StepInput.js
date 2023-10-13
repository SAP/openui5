sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/UI5Element", "sap/ui/webc/common/thirdparty/base/decorators/customElement", "sap/ui/webc/common/thirdparty/base/decorators/property", "sap/ui/webc/common/thirdparty/base/decorators/slot", "sap/ui/webc/common/thirdparty/base/decorators/event", "sap/ui/webc/common/thirdparty/base/Keys", "sap/ui/webc/common/thirdparty/base/i18nBundle", "sap/ui/webc/common/thirdparty/base/types/ValueState", "sap/ui/webc/common/thirdparty/base/util/AriaLabelHelper", "sap/ui/webc/common/thirdparty/base/FeaturesRegistry", "sap/ui/webc/common/thirdparty/base/types/Float", "sap/ui/webc/common/thirdparty/base/types/Integer", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer", "./generated/templates/StepInputTemplate.lit", "./generated/i18n/i18n-defaults", "sap/ui/webc/common/thirdparty/icons/less", "sap/ui/webc/common/thirdparty/icons/add", "./Icon", "./Input", "./types/InputType", "./generated/themes/StepInput.css"], function (_exports, _UI5Element, _customElement, _property, _slot, _event, _Keys, _i18nBundle, _ValueState, _AriaLabelHelper, _FeaturesRegistry, _Float, _Integer, _LitRenderer, _StepInputTemplate, _i18nDefaults, _less, _add, _Icon, _Input, _InputType, _StepInput) {
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
  _ValueState = _interopRequireDefault(_ValueState);
  _Float = _interopRequireDefault(_Float);
  _Integer = _interopRequireDefault(_Integer);
  _LitRenderer = _interopRequireDefault(_LitRenderer);
  _StepInputTemplate = _interopRequireDefault(_StepInputTemplate);
  _Icon = _interopRequireDefault(_Icon);
  _Input = _interopRequireDefault(_Input);
  _InputType = _interopRequireDefault(_InputType);
  _StepInput = _interopRequireDefault(_StepInput);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  var __decorate = void 0 && (void 0).__decorate || function (decorators, target, key, desc) {
    var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
  var StepInput_1;

  // Styles

  // Spin variables
  const INITIAL_WAIT_TIMEOUT = 500; // milliseconds
  const ACCELERATION = 0.8;
  const MIN_WAIT_TIMEOUT = 50; // milliseconds
  const INITIAL_SPEED = 120; // milliseconds
  /**
   * @class
   *
   * <h3 class="comment-api-title">Overview</h3>
   *
   * The <code>ui5-step-input</code> consists of an input field and buttons with icons to increase/decrease the value
   * with the predefined step.
   * <br><br>
   * The user can change the value of the component by pressing the increase/decrease buttons,
   * by typing a number directly, by using the keyboard up/down and page up/down,
   * or by using the mouse scroll wheel. Decimal values are supported.
   *
   * <h3>Usage</h3>
   *
   * The default step is 1 but the app developer can set a different one.
   *
   * App developers can set a maximum and minimum value for the <code>StepInput</code>.
   * The increase/decrease button and the up/down keyboard navigation become disabled when
   * the value reaches the max/min or a new value is entered from the input which is greater/less than the max/min.
   * <br><br>
   * <h4>When to use:</h4>
   * <ul>
   * <li>To adjust amounts, quantities, or other values quickly.</li>
   * <li>To adjust values for a specific step.</li>
   * </ul>
   *
   * <h4>When not to use:</h4>
   * <ul>
   * <li>To enter a static number (for example, postal code, phone number, or ID). In this case,
   * use the regular <code>ui5-input</code> instead.</li>
   * <li>To display a value that rarely needs to be adjusted and does not pertain to a particular step.
   * In this case, use the regular <code>ui5-input</code> instead.</li>
   * <li>To enter dates and times. In this case, use date/time related components instead.</li>
   * </ul>
   *
   * <h3>ES6 Module Import</h3>
   *
   * <code>import "@ui5/webcomponents/dist/StepInput.js";</code>
   *
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webc.main.StepInput
   * @extends sap.ui.webc.base.UI5Element
   * @tagname ui5-step-input
   * @since 1.0.0-rc.13
   * @public
   */
  let StepInput = StepInput_1 = class StepInput extends _UI5Element.default {
    static async onDefine() {
      StepInput_1.i18nBundle = await (0, _i18nBundle.getI18nBundle)("@ui5/webcomponents");
    }
    get type() {
      return _InputType.default.Number;
    }
    // icons-related
    get decIconTitle() {
      return StepInput_1.i18nBundle.getText(_i18nDefaults.STEPINPUT_DEC_ICON_TITLE);
    }
    get decIconName() {
      return "less";
    }
    get incIconTitle() {
      return StepInput_1.i18nBundle.getText(_i18nDefaults.STEPINPUT_INC_ICON_TITLE);
    }
    get incIconName() {
      return "add";
    }
    get _decIconClickable() {
      return !this._decIconDisabled && !this.readonly && !this.disabled;
    }
    get _incIconClickable() {
      return !this._incIconDisabled && !this.readonly && !this.disabled;
    }
    get _isFocused() {
      return this.focused;
    }
    get _valuePrecisioned() {
      return this.value.toFixed(this.valuePrecision);
    }
    get accInfo() {
      return {
        "ariaRequired": this.required,
        "ariaLabel": (0, _AriaLabelHelper.getEffectiveAriaLabelText)(this)
      };
    }
    get inputAttributes() {
      return {
        min: this.min === undefined ? undefined : this.min,
        max: this.max === undefined ? undefined : this.max,
        step: this.step
      };
    }
    onBeforeRendering() {
      this._setButtonState();
      if (this._previousValue === undefined) {
        this._previousValue = this.value;
      }
      const formSupport = (0, _FeaturesRegistry.getFeature)("FormSupport");
      if (formSupport) {
        formSupport.syncNativeHiddenInput(this);
      } else if (this.name) {
        console.warn(`In order for the "name" property to have effect, you should also: import "@ui5/webcomponents/dist/features/InputElementsFormSupport.js";`); // eslint-disable-line
      }
    }

    get input() {
      return this.shadowRoot.querySelector("[ui5-input]");
    }
    get inputOuter() {
      return this.shadowRoot.querySelector(".ui5-step-input-input");
    }
    _onButtonFocusOut() {
      setTimeout(() => {
        if (!this._inputFocused) {
          this.inputOuter.removeAttribute("focused");
        }
      }, 0);
    }
    _onInputFocusIn() {
      this._inputFocused = true;
      if (this.value !== this._previousValue) {
        this._previousValue = this.value;
      }
    }
    _onInputFocusOut() {
      this._inputFocused = false;
      this._onInputChange();
    }
    _setButtonState() {
      this._decIconDisabled = this.min !== undefined && this.value <= this.min;
      this._incIconDisabled = this.max !== undefined && this.value >= this.max;
    }
    _validate() {
      if (this._initialValueState === undefined) {
        this._initialValueState = this.valueState;
      }
      this.valueState = this.min !== undefined && this.value < this.min || this.max !== undefined && this.value > this.max ? _ValueState.default.Error : this._initialValueState;
    }
    _preciseValue(value) {
      const pow = 10 ** this.valuePrecision;
      return Math.round(value * pow) / pow;
    }
    _fireChangeEvent() {
      if (this._previousValue !== this.value) {
        this._previousValue = this.value;
        this.fireEvent("change", {
          value: this.value
        });
      }
    }
    /**
     * Value modifier - modifies the value of the component, validates the new value and enables/disables increment and
     * decrement buttons according to the value and min/max values (if set). Fires <code>change</code> event when requested
     *
     * @param {Float} modifier modifies the value of the component with the given modifier (positive or negative)
     * @param {boolean} fireChangeEvent if <code>true</code>, fires <code>change</code> event when the value is changed
     */
    _modifyValue(modifier, fireChangeEvent = false) {
      let value;
      this.value = this._preciseValue(parseFloat(this.input.value));
      value = this.value + modifier;
      if (this.min !== undefined && value < this.min) {
        value = this.min;
      }
      if (this.max !== undefined && value > this.max) {
        value = this.max;
      }
      value = this._preciseValue(value);
      if (value !== this.value) {
        this.value = value;
        this._validate();
        this._setButtonState();
        this.focused = true;
        this.inputOuter.setAttribute("focused", "");
        if (fireChangeEvent) {
          this._fireChangeEvent();
        } else {
          this.input.focus();
        }
      }
    }
    _incValue(e) {
      if (this._incIconClickable && e.isTrusted && !this.disabled && !this.readonly) {
        this._modifyValue(this.step, true);
        this._previousValue = this.value;
      }
    }
    _decValue(e) {
      if (this._decIconClickable && e.isTrusted && !this.disabled && !this.readonly) {
        this._modifyValue(-this.step, true);
        this._previousValue = this.value;
      }
    }
    _onInputChange() {
      if (this.input.value === "") {
        this.input.value = this.min || 0;
      }
      const inputValue = this._preciseValue(parseFloat(this.input.value));
      if (this.value !== this._previousValue || this.value !== inputValue) {
        this.value = inputValue;
        this._validate();
        this._setButtonState();
        this._fireChangeEvent();
      }
    }
    _onfocusin() {
      this.focused = true;
    }
    _onfocusout() {
      this.focused = false;
    }
    _onkeydown(e) {
      let preventDefault = true;
      if (this.disabled || this.readonly) {
        return;
      }
      if ((0, _Keys.isEnter)(e)) {
        this._onInputChange();
        return;
      }
      if ((0, _Keys.isUp)(e)) {
        // step up
        this._modifyValue(this.step);
      } else if ((0, _Keys.isDown)(e)) {
        // step down
        this._modifyValue(-this.step);
      } else if ((0, _Keys.isEscape)(e)) {
        // return previous value
        this.value = this._previousValue;
        this.input.value = this.value.toFixed(this.valuePrecision);
      } else if (this.max !== undefined && ((0, _Keys.isPageUpShift)(e) || (0, _Keys.isUpShiftCtrl)(e))) {
        // step to max
        this._modifyValue(this.max - this.value);
      } else if (this.min !== undefined && ((0, _Keys.isPageDownShift)(e) || (0, _Keys.isDownShiftCtrl)(e))) {
        // step to min
        this._modifyValue(this.min - this.value);
      } else if (!(0, _Keys.isUpCtrl)(e) && !(0, _Keys.isDownCtrl)(e) && !(0, _Keys.isUpShift)(e) && !(0, _Keys.isDownShift)(e)) {
        preventDefault = false;
      }
      if (preventDefault) {
        e.preventDefault();
      }
    }
    _decSpin() {
      if (!this._decIconDisabled) {
        this._spinValue(false, true);
      }
    }
    _incSpin() {
      if (!this._incIconDisabled) {
        this._spinValue(true, true);
      }
    }
    /**
     * Calculates the time which should be waited until _spinValue function is called.
     */
    _calcWaitTimeout() {
      this._speed *= ACCELERATION;
      this._waitTimeout = this._waitTimeout - this._speed < MIN_WAIT_TIMEOUT ? MIN_WAIT_TIMEOUT : this._waitTimeout - this._speed;
      return this._waitTimeout;
    }
    /**
     * Called when the increment or decrement button is pressed and held to set new value.
     * @param {boolean} increment - is this the increment button or not so the values should be spin accordingly up or down
     * @param {boolean} resetVariables - whether to reset the spin-related variables or not
     */
    _spinValue(increment, resetVariables = false) {
      if (resetVariables) {
        this._waitTimeout = INITIAL_WAIT_TIMEOUT;
        this._speed = INITIAL_SPEED;
        this._btnDown = true;
      }
      this._spinTimeoutId = setTimeout(() => {
        if (this._btnDown) {
          this._spinStarted = true;
          this._modifyValue(increment ? this.step : -this.step);
          this._setButtonState();
          if (!this._incIconDisabled && increment || !this._decIconDisabled && !increment) {
            this._spinValue(increment);
          } else {
            this._resetSpin();
            this._fireChangeEvent();
          }
        }
      }, this._calcWaitTimeout());
    }
    /**
    * Resets spin process
    */
    _resetSpin() {
      clearTimeout(this._spinTimeoutId);
      this._btnDown = false;
      this._spinStarted = false;
    }
    /**
    * Resets spin process when mouse outs + or - buttons
    */
    _resetSpinOut() {
      if (this._btnDown) {
        this._resetSpin();
        this._fireChangeEvent();
      }
    }
  };
  __decorate([(0, _property.default)({
    validator: _Float.default,
    defaultValue: 0
  })], StepInput.prototype, "value", void 0);
  __decorate([(0, _property.default)({
    validator: _Float.default
  })], StepInput.prototype, "min", void 0);
  __decorate([(0, _property.default)({
    validator: _Float.default
  })], StepInput.prototype, "max", void 0);
  __decorate([(0, _property.default)({
    validator: _Float.default,
    defaultValue: 1
  })], StepInput.prototype, "step", void 0);
  __decorate([(0, _property.default)({
    type: _ValueState.default,
    defaultValue: _ValueState.default.None
  })], StepInput.prototype, "valueState", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], StepInput.prototype, "required", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], StepInput.prototype, "disabled", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], StepInput.prototype, "readonly", void 0);
  __decorate([(0, _property.default)({
    defaultValue: undefined
  })], StepInput.prototype, "placeholder", void 0);
  __decorate([(0, _property.default)()], StepInput.prototype, "name", void 0);
  __decorate([(0, _property.default)({
    validator: _Integer.default,
    defaultValue: 0
  })], StepInput.prototype, "valuePrecision", void 0);
  __decorate([(0, _property.default)()], StepInput.prototype, "accessibleName", void 0);
  __decorate([(0, _property.default)({
    defaultValue: ""
  })], StepInput.prototype, "accessibleNameRef", void 0);
  __decorate([(0, _property.default)({
    type: Boolean,
    noAttribute: true
  })], StepInput.prototype, "_decIconDisabled", void 0);
  __decorate([(0, _property.default)({
    type: Boolean,
    noAttribute: true
  })], StepInput.prototype, "_incIconDisabled", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], StepInput.prototype, "focused", void 0);
  __decorate([(0, _property.default)({
    type: Boolean,
    noAttribute: true
  })], StepInput.prototype, "_inputFocused", void 0);
  __decorate([(0, _property.default)({
    validator: _Float.default,
    noAttribute: true
  })], StepInput.prototype, "_previousValue", void 0);
  __decorate([(0, _property.default)({
    validator: _Float.default,
    noAttribute: true
  })], StepInput.prototype, "_waitTimeout", void 0);
  __decorate([(0, _property.default)({
    validator: _Float.default,
    noAttribute: true
  })], StepInput.prototype, "_speed", void 0);
  __decorate([(0, _property.default)({
    type: Boolean,
    noAttribute: true
  })], StepInput.prototype, "_btnDown", void 0);
  __decorate([(0, _property.default)({
    validator: _Integer.default,
    noAttribute: true
  })], StepInput.prototype, "_spinTimeoutId", void 0);
  __decorate([(0, _property.default)({
    type: Boolean,
    noAttribute: true
  })], StepInput.prototype, "_spinStarted", void 0);
  __decorate([(0, _slot.default)()], StepInput.prototype, "valueStateMessage", void 0);
  __decorate([(0, _slot.default)()], StepInput.prototype, "formSupport", void 0);
  StepInput = StepInput_1 = __decorate([(0, _customElement.default)({
    tag: "ui5-step-input",
    renderer: _LitRenderer.default,
    styles: _StepInput.default,
    template: _StepInputTemplate.default,
    dependencies: [_Icon.default, _Input.default]
  })
  /**
   * Fired when the input operation has finished by pressing Enter or on focusout.
   *
   * @event sap.ui.webc.main.StepInput#change
   * @public
   */, (0, _event.default)("change")], StepInput);
  StepInput.define();
  var _default = StepInput;
  _exports.default = _default;
});