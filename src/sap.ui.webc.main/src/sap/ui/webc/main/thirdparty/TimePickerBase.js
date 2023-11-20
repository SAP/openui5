sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/Device", "sap/ui/webc/common/thirdparty/base/UI5Element", "sap/ui/webc/common/thirdparty/base/decorators/customElement", "sap/ui/webc/common/thirdparty/base/decorators/property", "sap/ui/webc/common/thirdparty/base/decorators/event", "sap/ui/webc/common/thirdparty/base/decorators/slot", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer", "sap/ui/webc/common/thirdparty/base/i18nBundle", "sap/ui/webc/common/thirdparty/base/locale/getLocale", "sap/ui/webc/common/thirdparty/base/types/ValueState", "sap/ui/webc/common/thirdparty/localization/features/calendar/Gregorian", "sap/ui/webc/common/thirdparty/localization/DateFormat", "sap/ui/webc/common/thirdparty/base/asset-registries/LocaleData", "sap/ui/webc/common/thirdparty/base/Keys", "sap/ui/webc/common/thirdparty/icons/time-entry-request", "./Icon", "./Popover", "./ResponsivePopover", "./generated/templates/TimePickerTemplate.lit", "./generated/templates/TimePickerPopoverTemplate.lit", "./Input", "./Button", "./TimeSelectionClocks", "./TimeSelectionInputs", "./generated/i18n/i18n-defaults", "./generated/themes/TimePicker.css", "./generated/themes/TimePickerPopover.css", "./generated/themes/Popover.css", "./generated/themes/ResponsivePopoverCommon.css"], function (_exports, _Device, _UI5Element, _customElement, _property, _event, _slot, _LitRenderer, _i18nBundle, _getLocale, _ValueState, _Gregorian, _DateFormat, _LocaleData, _Keys, _timeEntryRequest, _Icon, _Popover, _ResponsivePopover, _TimePickerTemplate, _TimePickerPopoverTemplate, _Input, _Button, _TimeSelectionClocks, _TimeSelectionInputs, _i18nDefaults, _TimePicker, _TimePickerPopover, _Popover2, _ResponsivePopoverCommon) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _UI5Element = _interopRequireDefault(_UI5Element);
  _customElement = _interopRequireDefault(_customElement);
  _property = _interopRequireDefault(_property);
  _event = _interopRequireDefault(_event);
  _slot = _interopRequireDefault(_slot);
  _LitRenderer = _interopRequireDefault(_LitRenderer);
  _getLocale = _interopRequireDefault(_getLocale);
  _ValueState = _interopRequireDefault(_ValueState);
  _DateFormat = _interopRequireDefault(_DateFormat);
  _Icon = _interopRequireDefault(_Icon);
  _Popover = _interopRequireDefault(_Popover);
  _ResponsivePopover = _interopRequireDefault(_ResponsivePopover);
  _TimePickerTemplate = _interopRequireDefault(_TimePickerTemplate);
  _TimePickerPopoverTemplate = _interopRequireDefault(_TimePickerPopoverTemplate);
  _Input = _interopRequireDefault(_Input);
  _Button = _interopRequireDefault(_Button);
  _TimeSelectionClocks = _interopRequireDefault(_TimeSelectionClocks);
  _TimeSelectionInputs = _interopRequireDefault(_TimeSelectionInputs);
  _TimePicker = _interopRequireDefault(_TimePicker);
  _TimePickerPopover = _interopRequireDefault(_TimePickerPopover);
  _Popover2 = _interopRequireDefault(_Popover2);
  _ResponsivePopoverCommon = _interopRequireDefault(_ResponsivePopoverCommon);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  var __decorate = void 0 && (void 0).__decorate || function (decorators, target, key, desc) {
    var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
  var TimePickerBase_1;

  // default calendar for bundling

  // Styles

  /**
   * @class
   *
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webc.main.TimePickerBase
   * @extends sap.ui.webc.base.UI5Element
   * @public
   * @since 1.0.0-rc.6
   */
  let TimePickerBase = TimePickerBase_1 = class TimePickerBase extends _UI5Element.default {
    static async onDefine() {
      [TimePickerBase_1.i18nBundle] = await Promise.all([(0, _i18nBundle.getI18nBundle)("@ui5/webcomponents"), (0, _LocaleData.fetchCldr)((0, _getLocale.default)().getLanguage(), (0, _getLocale.default)().getRegion(), (0, _getLocale.default)().getScript())]);
    }
    constructor() {
      super();
    }
    /**
     * @abstract
     * @protected
     */
    get _placeholder() {
      return undefined;
    }
    /**
     * @abstract
     * @protected
     */
    get _formatPattern() {
      return undefined;
    }
    get _effectiveValue() {
      return this.value;
    }
    get _timeSelectionValue() {
      return this.tempValue;
    }
    get _isPhone() {
      return (0, _Device.isPhone)();
    }
    onTimeSelectionChange(e) {
      this.tempValue = e.detail.value; // every time the user changes the time selection -> update tempValue
    }
    /**
     * Opens the picker.
     * @async
     * @public
     * @method
     * @name sap.ui.webc.main.TimePickerBase#openPicker
     * @returns {Promise} Resolves when the picker is open
     */
    async openPicker() {
      this.tempValue = this.value && this.isValid(this.value) ? this.value : this.getFormat().format(new Date());
      const responsivePopover = await this._getPopover();
      responsivePopover.showAt(this);
    }
    /**
     * Closes the picker
     * @public
     * @method
     * @name sap.ui.webc.main.TimePickerBase#closePicker
     * @returns {Promise} Resolves when the picker is closed
     */
    async closePicker() {
      const responsivePopover = await this._getPopover();
      responsivePopover.close();
      this._isPickerOpen = false;
    }
    togglePicker() {
      if (this.isOpen()) {
        this.closePicker();
      } else if (this._canOpenPicker()) {
        this.openPicker();
      }
    }
    /**
     * Checks if the picker is open
     * @public
     * @method
     * @name sap.ui.webc.main.TimePickerBase#isOpen
     * @returns {boolean}
     */
    isOpen() {
      return !!this._isPickerOpen;
    }
    submitPickers() {
      this._updateValueAndFireEvents(this.tempValue, true, ["change", "value-changed"]);
      this.closePicker();
    }
    onResponsivePopoverAfterClose() {
      this._isPickerOpen = false;
    }
    async onResponsivePopoverAfterOpen() {
      this._isPickerOpen = true;
      const responsivePopover = await this._getPopover();
      responsivePopover.querySelector("[ui5-time-selection-clocks]")._focusFirstButton();
    }
    /**
     * Opens the Inputs popover.
     * @async
     * @private
     * @method
     * @name sap.ui.webc.main.TimePickerBase#openInputsPopover
     * @returns {Promise} Resolves when the Inputs popover is open
     */
    async openInputsPopover() {
      this.tempValue = this.value && this.isValid(this.value) ? this.value : this.getFormat().format(new Date());
      const popover = await this._getInputsPopover();
      popover.showAt(this);
      this._isInputsPopoverOpen = true;
    }
    /**
     * Closes the Inputs popover
     * @private
     * @method
     * @name sap.ui.webc.main.TimePickerBase#closeInputsPopover
     * @returns {Promise} Resolves when the Inputs popover is closed
     */
    async closeInputsPopover() {
      const popover = await this._getInputsPopover();
      popover.close();
    }
    toggleInputsPopover() {
      if (this.isInputsPopoverOpen()) {
        this.closeInputsPopover();
      } else if (this._canOpenInputsPopover()) {
        this.openInputsPopover();
      }
    }
    /**
     * Checks if the inputs popover is open
     * @private
     * @method
     * @name sap.ui.webc.main.TimePickerBase#isInputsPopoverOpen
     * @returns {boolean}
     */
    isInputsPopoverOpen() {
      return !!this._isInputsPopoverOpen;
    }
    submitInputsPopover() {
      this._updateValueAndFireEvents(this.tempValue, true, ["change", "value-changed"]);
      this.closeInputsPopover();
    }
    async onInputsPopoverAfterOpen() {
      const popover = await this._getInputsPopover();
      popover.querySelector("[ui5-time-selection-inputs]")._addNumericAttributes();
    }
    onInputsPopoverAfterClose() {
      this._isInputsPopoverOpen = false;
    }
    async _handleInputClick(evt) {
      const target = evt.target;
      if (this._isPickerOpen) {
        return;
      }
      if (this._isPhone && target && !target.hasAttribute("ui5-icon")) {
        this.toggleInputsPopover();
      }
      const inputField = await this._getInputField();
      if (inputField) {
        inputField.select();
      }
    }
    _updateValueAndFireEvents(value, normalizeValue, eventsNames) {
      if (value === this.value) {
        return;
      }
      const valid = this.isValid(value);
      if (value !== undefined && valid && normalizeValue) {
        // if value === undefined, valid is guaranteed to be falsy
        value = this.normalizeValue(value); // transform valid values (in any format) to the correct format
      }

      if (!eventsNames.includes("input")) {
        this.value = ""; // Do not remove! DurationPicker (an external component extending TimePickerBase) use case -> value is 05:10, user tries 05:12, after normalization value is changed back to 05:10 so no invalidation happens, but the input still shows 05:12. Thus we enforce invalidation with the ""
        this.value = value;
      }
      this.tempValue = value; // if the picker is open, sync it
      this._updateValueState(); // Change the value state to Error/None, but only if needed
      eventsNames.forEach(eventName => {
        this.fireEvent(eventName, {
          value,
          valid
        });
      });
    }
    _updateValueState() {
      const isValid = this.isValid(this.value);
      if (!isValid) {
        // If not valid - always set Error regardless of the current value state
        this.valueState = _ValueState.default.Error;
      } else if (isValid && this.valueState === _ValueState.default.Error) {
        // However if valid, change only Error (but not the others) to None
        this.valueState = _ValueState.default.None;
      }
    }
    _handleInputChange(e) {
      const target = e.target;
      this._updateValueAndFireEvents(target.value, true, ["change", "value-changed"]);
    }
    _handleInputLiveChange(e) {
      const target = e.target;
      this._updateValueAndFireEvents(target.value, false, ["input"]);
    }
    _canOpenPicker() {
      return !this.disabled && !this.readonly;
    }
    _canOpenInputsPopover() {
      return !this.disabled && this._isPhone;
    }
    async _getPopover() {
      const staticAreaItem = await this.getStaticAreaItemDomRef();
      return staticAreaItem.querySelector("[ui5-responsive-popover]");
    }
    async _getInputsPopover() {
      const staticAreaItem = await this.getStaticAreaItemDomRef();
      return staticAreaItem.querySelector("[ui5-popover]");
    }
    _getInput() {
      return this.shadowRoot.querySelector("[ui5-input]");
    }
    _getInputField() {
      const input = this._getInput();
      return input && input.getInputDOMRef();
    }
    _onkeydown(e) {
      if (this._isPhone && !this.isInputsPopoverOpen()) {
        e.preventDefault();
      }
      if ((0, _Keys.isShow)(e)) {
        e.preventDefault();
        this.togglePicker();
      }
      const target = e.target;
      if (this._getInput().isEqualNode(target) && this.isOpen() && ((0, _Keys.isTabNext)(e) || (0, _Keys.isTabPrevious)(e) || (0, _Keys.isF6Next)(e) || (0, _Keys.isF6Previous)(e))) {
        this.closePicker();
      }
      if (this.isOpen()) {
        return;
      }
      if ((0, _Keys.isPageUpShiftCtrl)(e)) {
        e.preventDefault();
        this._modifyValueBy(1, "second");
      } else if ((0, _Keys.isPageUpShift)(e)) {
        e.preventDefault();
        this._modifyValueBy(1, "minute");
      } else if ((0, _Keys.isPageUp)(e)) {
        e.preventDefault();
        this._modifyValueBy(1, "hour");
      } else if ((0, _Keys.isPageDownShiftCtrl)(e)) {
        e.preventDefault();
        this._modifyValueBy(-1, "second");
      } else if ((0, _Keys.isPageDownShift)(e)) {
        e.preventDefault();
        this._modifyValueBy(-1, "minute");
      } else if ((0, _Keys.isPageDown)(e)) {
        e.preventDefault();
        this._modifyValueBy(-1, "hour");
      }
    }
    get _isPattern() {
      return this._formatPattern !== "medium" && this._formatPattern !== "short" && this._formatPattern !== "long";
    }
    getFormat() {
      let dateFormat;
      if (this._isPattern) {
        dateFormat = _DateFormat.default.getDateInstance({
          pattern: this._formatPattern
        });
      } else {
        dateFormat = _DateFormat.default.getDateInstance({
          style: this._formatPattern
        });
      }
      return dateFormat;
    }
    /**
     * Formats a Java Script date object into a string representing a locale date and time
     * according to the <code>formatPattern</code> property of the TimePicker instance
     * @param {Date} date A Java Script date object to be formatted as string
     * @public
     * @method
     * @name sap.ui.webc.main.TimePickerBase#formatValue
     * @returns {string}
     */
    formatValue(date) {
      return this.getFormat().format(date);
    }
    /**
     * Checks if a value is valid against the current <code>formatPattern</code> value.
     *
     * <br><br>
     * <b>Note:</b> an empty string is considered as valid value.
     * @param {string} value The value to be tested against the current date format
     * @public
     * @method
     * @name sap.ui.webc.main.TimePickerBase#isValid
     * @returns {boolean}
     */
    isValid(value) {
      if (value === "") {
        return true;
      }
      return !!this.getFormat().parse(value);
    }
    normalizeValue(value) {
      if (value === "") {
        return value;
      }
      return this.getFormat().format(this.getFormat().parse(value));
    }
    _modifyValueBy(amount, unit) {
      const date = this.getFormat().parse(this._effectiveValue);
      if (!date) {
        return;
      }
      if (unit === "hour") {
        date.setHours(date.getHours() + amount);
      } else if (unit === "minute") {
        date.setMinutes(date.getMinutes() + amount);
      } else if (unit === "second") {
        date.setSeconds(date.getSeconds() + amount);
      }
      const newValue = this.formatValue(date);
      this._updateValueAndFireEvents(newValue, true, ["change", "value-changed"]);
    }
    /**
     *
     * @param {event} e Wheel Event
     * @private
     *
     * The listener for this event can't be passive as it calls preventDefault()
     */
    _handleWheel(e) {
      e.preventDefault();
    }
    /**
     * Hides mobile device keyboard by temporary setting the input to readonly state.
     */
    _hideMobileKeyboard() {
      this._getInput().readonly = true;
      setTimeout(() => {
        this._getInput().readonly = false;
      }, 0);
    }
    async _onfocusin(evt) {
      if (this._isPhone) {
        this._hideMobileKeyboard();
        if (this._isInputsPopoverOpen) {
          const popover = await this._getInputsPopover();
          popover.applyFocus();
        }
        evt.preventDefault();
      }
    }
    _oninput(evt) {
      if (this._isPhone) {
        evt.preventDefault();
      }
    }
    get submitButtonLabel() {
      return TimePickerBase_1.i18nBundle.getText(_i18nDefaults.TIMEPICKER_SUBMIT_BUTTON);
    }
    get cancelButtonLabel() {
      return TimePickerBase_1.i18nBundle.getText(_i18nDefaults.TIMEPICKER_CANCEL_BUTTON);
    }
    /**
     * @protected
     */
    get openIconName() {
      return "time-entry-request";
    }
  };
  __decorate([(0, _property.default)({
    defaultValue: undefined
  })], TimePickerBase.prototype, "value", void 0);
  __decorate([(0, _property.default)({
    type: _ValueState.default,
    defaultValue: _ValueState.default.None
  })], TimePickerBase.prototype, "valueState", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], TimePickerBase.prototype, "disabled", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], TimePickerBase.prototype, "readonly", void 0);
  __decorate([(0, _property.default)({
    type: Boolean,
    noAttribute: true
  })], TimePickerBase.prototype, "_isPickerOpen", void 0);
  __decorate([(0, _property.default)({
    type: Boolean,
    noAttribute: true
  })], TimePickerBase.prototype, "_isInputsPopoverOpen", void 0);
  __decorate([(0, _slot.default)()], TimePickerBase.prototype, "valueStateMessage", void 0);
  TimePickerBase = TimePickerBase_1 = __decorate([(0, _customElement.default)({
    languageAware: true,
    renderer: _LitRenderer.default,
    template: _TimePickerTemplate.default,
    styles: _TimePicker.default,
    staticAreaTemplate: _TimePickerPopoverTemplate.default,
    staticAreaStyles: [_ResponsivePopoverCommon.default, _Popover2.default, _TimePickerPopover.default],
    dependencies: [_Icon.default, _Popover.default, _ResponsivePopover.default, _TimeSelectionClocks.default, _TimeSelectionInputs.default, _Input.default, _Button.default]
  })
  /**
   * Fired when the input operation has finished by clicking the "OK" button or
   * when the text in the input field has changed and the focus leaves the input field.
  *
  * @event sap.ui.webc.main.TimePickerBase#change
   * @public
   * @param {string} value The submitted value.
   * @param {boolean} valid Indicator if the value is in correct format pattern and in valid range.
  */, (0, _event.default)("change", {
    detail: {
      value: {
        type: String
      },
      valid: {
        type: Boolean
      }
    }
  })
  /**
   * Fired when the value of the <code>ui5-time-picker</code> is changed at each key stroke.
   *
   * @event sap.ui.webc.main.TimePickerBase#input
   * @public
   * @param {string} value The current value.
   * @param {boolean} valid Indicator if the value is in correct format pattern and in valid range.
  */, (0, _event.default)("input", {
    detail: {
      value: {
        type: String
      },
      valid: {
        type: Boolean
      }
    }
  })], TimePickerBase);
  var _default = TimePickerBase;
  _exports.default = _default;
});