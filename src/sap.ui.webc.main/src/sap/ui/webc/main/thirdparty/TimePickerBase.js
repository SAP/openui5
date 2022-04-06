sap.ui.define(['sap/ui/webc/common/thirdparty/base/UI5Element', 'sap/ui/webc/common/thirdparty/base/renderer/LitRenderer', 'sap/ui/webc/common/thirdparty/base/i18nBundle', 'sap/ui/webc/common/thirdparty/base/locale/getLocale', 'sap/ui/webc/common/thirdparty/base/types/ValueState', 'sap/ui/webc/common/thirdparty/localization/features/calendar/Gregorian', 'sap/ui/webc/common/thirdparty/localization/DateFormat', 'sap/ui/webc/common/thirdparty/base/asset-registries/LocaleData', 'sap/ui/webc/common/thirdparty/base/Keys', 'sap/ui/webc/common/thirdparty/icons/time-entry-request', './Icon', './ResponsivePopover', './generated/templates/TimePickerTemplate.lit', './generated/templates/TimePickerPopoverTemplate.lit', './Input', './Button', './TimeSelection', './generated/i18n/i18n-defaults', './generated/themes/TimePicker.css', './generated/themes/TimePickerPopover.css', './generated/themes/ResponsivePopoverCommon.css'], function (UI5Element, litRender, i18nBundle, getLocale, ValueState, Gregorian, DateFormat, LocaleData, Keys, timeEntryRequest, Icon, ResponsivePopover, TimePickerTemplate_lit, TimePickerPopoverTemplate_lit, Input, Button, TimeSelection, i18nDefaults, TimePicker_css, TimePickerPopover_css, ResponsivePopoverCommon_css) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var UI5Element__default = /*#__PURE__*/_interopDefaultLegacy(UI5Element);
	var litRender__default = /*#__PURE__*/_interopDefaultLegacy(litRender);
	var getLocale__default = /*#__PURE__*/_interopDefaultLegacy(getLocale);
	var ValueState__default = /*#__PURE__*/_interopDefaultLegacy(ValueState);
	var DateFormat__default = /*#__PURE__*/_interopDefaultLegacy(DateFormat);

	const metadata = {
		languageAware: true,
		managedSlots: true,
		properties:  {
			value: {
				type: String,
				defaultValue: undefined,
			},
			valueState: {
				type: ValueState__default,
				defaultValue: ValueState__default.None,
			},
			disabled: {
				type: Boolean,
			},
			readonly: {
				type: Boolean,
			},
			_isPickerOpen: {
				type: Boolean,
				noAttribute: true,
			},
		},
		slots:  {
			valueStateMessage: {
				type: HTMLElement,
			},
		},
		events:  {
			change: {},
			input: {},
		},
	};
	class TimePickerBase extends UI5Element__default {
		static get metadata() {
			return metadata;
		}
		static get render() {
			return litRender__default;
		}
		static get styles() {
			return TimePicker_css;
		}
		static get staticAreaTemplate() {
			return TimePickerPopoverTemplate_lit;
		}
		static get template() {
			return TimePickerTemplate_lit;
		}
		static get dependencies() {
			return [
				Icon,
				ResponsivePopover,
				TimeSelection,
				Input,
				Button,
			];
		}
		static async onDefine() {
			[TimePickerBase.i18nBundle] = await Promise.all([
				i18nBundle.getI18nBundle("@ui5/webcomponents"),
				LocaleData.fetchCldr(getLocale__default().getLanguage(), getLocale__default().getRegion(), getLocale__default().getScript()),
			]);
		}
		static get staticAreaStyles() {
			return [ResponsivePopoverCommon_css, TimePickerPopover_css];
		}
		constructor() {
			super();
		}
		get _placeholder() {
			return undefined;
		}
		get _formatPattern() {
			return undefined;
		}
		get _effectiveValue() {
			return this.value;
		}
		get _timeSelectionValue() {
			return this.tempValue;
		}
		onTimeSelectionChange(event) {
			this.tempValue = event.detail.value;
		}
		submitPickers() {
			this._updateValueAndFireEvents(this.tempValue, true, ["change", "value-changed"]);
			this.closePicker();
		}
		onResponsivePopoverAfterClose() {
			this._isPickerOpen = false;
		}
		async _handleInputClick() {
			if (this._isPickerOpen) {
				return;
			}
			const inputField = await this._getInputField();
			if (inputField) {
				inputField.select();
			}
		}
		_updateValueAndFireEvents(value, normalizeValue, events) {
			if (value === this.value) {
				return;
			}
			const valid = this.isValid(value);
			if (valid && normalizeValue) {
				value = this.normalizeValue(value);
			}
			if (!events.includes("input")) {
				this.value = "";
				this.value = value;
			}
			this.tempValue = value;
			this._updateValueState();
			events.forEach(event => {
				this.fireEvent(event, { value, valid });
			});
		}
		_updateValueState() {
			const isValid = this.isValid(this.value);
			if (!isValid) {
				this.valueState = ValueState__default.Error;
			} else if (isValid && this.valueState === ValueState__default.Error) {
				this.valueState = ValueState__default.None;
			}
		}
		async _handleInputChange(event) {
			this._updateValueAndFireEvents(event.target.value, true, ["change", "value-changed"]);
		}
		async _handleInputLiveChange(event) {
			this._updateValueAndFireEvents(event.target.value, false, ["input"]);
		}
		async closePicker() {
			const responsivePopover = await this._getPopover();
			responsivePopover.close();
			this._isPickerOpen = false;
		}
		async openPicker() {
			this.tempValue = this.value && this.isValid(this.value) ? this.value : this.getFormat().format(new Date());
			const responsivePopover = await this._getPopover();
			responsivePopover.showAt(this);
			this._isPickerOpen = true;
		}
		togglePicker() {
			if (this.isOpen()) {
				this.closePicker();
			} else if (this._canOpenPicker()) {
				this.openPicker();
			}
		}
		isOpen() {
			return !!this._isPickerOpen;
		}
		_canOpenPicker() {
			return !this.disabled && !this.readonly;
		}
		async _getPopover() {
			const staticAreaItem = await this.getStaticAreaItemDomRef();
			return staticAreaItem.querySelector("[ui5-responsive-popover]");
		}
		_getInput() {
			return this.shadowRoot.querySelector("[ui5-input]");
		}
		_getInputField() {
			const input = this._getInput();
			return input && input.getInputDOMRef();
		}
		_onkeydown(e) {
			if (Keys.isShow(e)) {
				e.preventDefault();
				this.togglePicker();
			}
			if (this.isOpen()) {
				return;
			}
			if (Keys.isPageUpShiftCtrl(e)) {
				e.preventDefault();
				this._modifyValueBy(1, "second");
			} else if (Keys.isPageUpShift(e)) {
				e.preventDefault();
				this._modifyValueBy(1, "minute");
			} else if (Keys.isPageUp(e)) {
				e.preventDefault();
				this._modifyValueBy(1, "hour");
			} else if (Keys.isPageDownShiftCtrl(e)) {
				e.preventDefault();
				this._modifyValueBy(-1, "second");
			} else if (Keys.isPageDownShift(e)) {
				e.preventDefault();
				this._modifyValueBy(-1, "minute");
			} else if (Keys.isPageDown(e)) {
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
				dateFormat = DateFormat__default.getInstance({
					pattern: this._formatPattern,
				});
			} else {
				dateFormat = DateFormat__default.getInstance({
					style: this._formatPattern,
				});
			}
			return dateFormat;
		}
		formatValue(date) {
			return this.getFormat().format(date);
		}
		isValid(value) {
			return value === "" || this.getFormat().parse(value);
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
		_handleWheel(e) {
			e.preventDefault();
		}
		get submitButtonLabel() {
			return TimePickerBase.i18nBundle.getText(i18nDefaults.TIMEPICKER_SUBMIT_BUTTON);
		}
		get cancelButtonLabel() {
			return TimePickerBase.i18nBundle.getText(i18nDefaults.TIMEPICKER_CANCEL_BUTTON);
		}
		get openIconName() {
			return "time-entry-request";
		}
	}

	return TimePickerBase;

});
