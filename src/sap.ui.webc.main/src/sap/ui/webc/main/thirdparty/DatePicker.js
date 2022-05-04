sap.ui.define(['sap/ui/webc/common/thirdparty/base/FeaturesRegistry', 'sap/ui/webc/common/thirdparty/localization/dates/CalendarDate', 'sap/ui/webc/common/thirdparty/localization/dates/modifyDateBy', 'sap/ui/webc/common/thirdparty/localization/dates/getRoundedTimestamp', 'sap/ui/webc/common/thirdparty/localization/dates/getTodayUTCTimestamp', 'sap/ui/webc/common/thirdparty/base/types/ValueState', 'sap/ui/webc/common/thirdparty/base/util/AriaLabelHelper', 'sap/ui/webc/common/thirdparty/base/Keys', 'sap/ui/webc/common/thirdparty/base/Device', 'sap/ui/webc/common/thirdparty/icons/appointment-2', 'sap/ui/webc/common/thirdparty/icons/decline', './types/HasPopup', './generated/i18n/i18n-defaults', './DateComponentBase', './Icon', './Button', './ResponsivePopover', './Calendar', './CalendarDate', './Input', './types/InputType', './generated/templates/DatePickerTemplate.lit', './generated/templates/DatePickerPopoverTemplate.lit', 'sap/ui/webc/common/thirdparty/localization/features/calendar/Gregorian', './generated/themes/DatePicker.css', './generated/themes/DatePickerPopover.css', './generated/themes/ResponsivePopoverCommon.css'], function (FeaturesRegistry, CalendarDate, modifyDateBy, getRoundedTimestamp, getTodayUTCTimestamp, ValueState, AriaLabelHelper, Keys, Device, appointment2, decline, HasPopup, i18nDefaults, DateComponentBase, Icon, Button, ResponsivePopover, Calendar, CalendarDate$1, Input, InputType, DatePickerTemplate_lit, DatePickerPopoverTemplate_lit, Gregorian, DatePicker_css, DatePickerPopover_css, ResponsivePopoverCommon_css) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var CalendarDate__default = /*#__PURE__*/_interopDefaultLegacy(CalendarDate);
	var modifyDateBy__default = /*#__PURE__*/_interopDefaultLegacy(modifyDateBy);
	var getRoundedTimestamp__default = /*#__PURE__*/_interopDefaultLegacy(getRoundedTimestamp);
	var getTodayUTCTimestamp__default = /*#__PURE__*/_interopDefaultLegacy(getTodayUTCTimestamp);
	var ValueState__default = /*#__PURE__*/_interopDefaultLegacy(ValueState);

	const metadata = {
		tag: "ui5-date-picker",
		altTag: "ui5-datepicker",
		managedSlots: true,
		properties:  {
			value: {
				type: String,
			},
			valueState: {
				type: ValueState__default,
				defaultValue: ValueState__default.None,
			},
			required: {
				type: Boolean,
			},
			disabled: {
				type: Boolean,
			},
			readonly: {
				type: Boolean,
			},
			placeholder: {
				type: String,
				defaultValue: undefined,
			},
			name: {
				type: String,
			},
			hideWeekNumbers: {
				type: Boolean,
			},
			accessibleName: {
				type: String,
			},
			accessibleNameRef: {
				type: String,
				defaultValue: "",
			},
			_isPickerOpen: {
				type: Boolean,
				noAttribute: true,
			},
			_respPopoverConfig: {
				type: Object,
			},
			_calendarCurrentPicker: {
				type: String,
				defaultValue: "day",
			},
		},
		slots:  {
			valueStateMessage: {
				type: HTMLElement,
			},
			formSupport: {
				type: HTMLElement,
			},
		},
		events:  {
			change: {
				details: {
					value: {
						type: String,
					},
					valid: {
						type: Boolean,
					},
				},
			},
			input: {
				details: {
					value: {
						type: String,
					},
					valid: {
						type: Boolean,
					},
				},
			},
		},
	};
	class DatePicker extends DateComponentBase {
		static get metadata() {
			return metadata;
		}
		static get template() {
			return DatePickerTemplate_lit;
		}
		static get staticAreaTemplate() {
			return DatePickerPopoverTemplate_lit;
		}
		static get styles() {
			return DatePicker_css;
		}
		static get staticAreaStyles() {
			return [ResponsivePopoverCommon_css, DatePickerPopover_css];
		}
		constructor() {
			super();
			this.FormSupport = undefined;
		}
		onResponsivePopoverAfterClose() {
			this._isPickerOpen = false;
			if (Device.isPhone()) {
				this.blur();
			} else {
				this._getInput().focus();
			}
		}
		onBeforeRendering() {
			this.FormSupport = FeaturesRegistry.getFeature("FormSupport");
			["minDate", "maxDate"].forEach(prop => {
				if (this[prop] && !this.isValid(this[prop])) {
					console.warn(`Invalid value for property "${prop}": ${this[prop]} is not compatible with the configured format pattern: "${this._displayFormat}"`);
				}
			});
			const FormSupport = FeaturesRegistry.getFeature("FormSupport");
			if (FormSupport) {
				FormSupport.syncNativeHiddenInput(this);
			} else if (this.name) {
				console.warn(`In order for the "name" property to have effect, you should also: import "@ui5/webcomponents/dist/features/InputElementsFormSupport.js";`);
			}
			this.value = this.normalizeValue(this.value) || this.value;
			this.liveValue = this.value;
		}
		get _calendarSelectionMode() {
			return "Single";
		}
		get _calendarTimestamp() {
			if (this.value && this._checkValueValidity(this.value)) {
				const millisecondsUTC = this.dateValueUTC.getTime();
				return getRoundedTimestamp__default(millisecondsUTC);
			}
			return getTodayUTCTimestamp__default(this._primaryCalendarType);
		}
		get _calendarSelectedDates() {
			if (this.value && this._checkValueValidity(this.value)) {
				return [this.value];
			}
			return [];
		}
		_onkeydown(event) {
			if (Keys.isShow(event)) {
				event.preventDefault();
				if (this.isOpen()) {
					if (!Keys.isF4(event)) {
						this._toggleAndFocusInput();
					}
				} else {
					this._toggleAndFocusInput();
				}
			}
			if (this.isOpen()) {
				return;
			}
			if (Keys.isEnter(event)) {
				if (this.FormSupport) {
					this.FormSupport.triggerFormSubmit(this);
				}
			} else if (Keys.isPageUpShiftCtrl(event)) {
				event.preventDefault();
				this._modifyDateValue(1, "year");
			} else if (Keys.isPageUpShift(event)) {
				event.preventDefault();
				this._modifyDateValue(1, "month");
			} else if (Keys.isPageUp(event)) {
				event.preventDefault();
				this._modifyDateValue(1, "day");
			} else if (Keys.isPageDownShiftCtrl(event)) {
				event.preventDefault();
				this._modifyDateValue(-1, "year");
			} else if (Keys.isPageDownShift(event)) {
				event.preventDefault();
				this._modifyDateValue(-1, "month");
			} else if (Keys.isPageDown(event)) {
				event.preventDefault();
				this._modifyDateValue(-1, "day");
			}
		}
		_modifyDateValue(amount, unit) {
			if (!this.dateValue) {
				return;
			}
			const modifiedDate = modifyDateBy__default(CalendarDate__default.fromLocalJSDate(this.dateValue), amount, unit, this._minDate, this._maxDate);
			const newValue = this.formatValue(modifiedDate.toUTCJSDate());
			this._updateValueAndFireEvents(newValue, true, ["change", "value-changed"]);
		}
		_updateValueAndFireEvents(value, normalizeValue, events, updateValue = true) {
			const valid = this._checkValueValidity(value);
			if (valid && normalizeValue) {
				value = this.normalizeValue(value);
			}
			let executeEvent = true;
			this.liveValue = value;
			events.forEach(event => {
				if (!this.fireEvent(event, { value, valid }, true)) {
					executeEvent = false;
				}
			});
			if (!executeEvent) {
				return;
			}
			if (updateValue) {
				this._getInput().getInputDOMRef().then(innnerInput => {
					innnerInput.value = value;
				});
				this.value = value;
				this._updateValueState();
			}
		}
		_updateValueState() {
			const isValid = this._checkValueValidity(this.value);
			if (!isValid) {
				this.valueState = ValueState__default.Error;
			} else if (isValid && this.valueState === ValueState__default.Error) {
				this.valueState = ValueState__default.None;
			}
		}
		_toggleAndFocusInput() {
			this.togglePicker();
			this._getInput().focus();
		}
		_getInput() {
			return this.shadowRoot.querySelector("[ui5-input]");
		}
		_onInputSubmit(event) {}
		_onInputChange(event) {
			this._updateValueAndFireEvents(event.target.value, true, ["change", "value-changed"]);
		}
		async _onInputInput(event) {
			this._updateValueAndFireEvents(event.target.value, false, ["input"], false);
		}
		_checkValueValidity(value) {
			if (value === "") {
				return true;
			}
			return this.isValid(value) && this.isInValidRange(value);
		}
		_click(event) {
			if (Device.isPhone()) {
				this.responsivePopover.showAt(this);
				event.preventDefault();
			}
		}
		isValid(value = "") {
			if (value === "") {
				return true;
			}
			return !!this.getFormat().parse(value);
		}
		isInValidRange(value = "") {
			if (value === "") {
				return true;
			}
			const calendarDate = this._getCalendarDateFromString(value);
			return calendarDate.valueOf() >= this._minDate.valueOf() && calendarDate.valueOf() <= this._maxDate.valueOf();
		}
		normalizeValue(value) {
			if (value === "") {
				return value;
			}
			return this.getFormat().format(this.getFormat().parse(value, true), true);
		}
		get _displayFormat() {
			return this.getFormat().oFormatOptions.pattern;
		}
		get _placeholder() {
			return this.placeholder !== undefined ? this.placeholder : this._displayFormat;
		}
		get _headerTitleText() {
			return DatePicker.i18nBundle.getText(i18nDefaults.INPUT_SUGGESTIONS_TITLE);
		}
		get phone() {
			return Device.isPhone();
		}
		get showHeader() {
			return this.phone;
		}
		get showFooter() {
			return this.phone;
		}
		get _isIE() {
			return Device.isIE();
		}
		get accInfo() {
			return {
				"ariaRoledescription": this.dateAriaDescription,
				"ariaHasPopup": HasPopup.Grid,
				"ariaAutoComplete": "none",
				"ariaRequired": this.required,
				"ariaLabel": AriaLabelHelper.getEffectiveAriaLabelText(this),
			};
		}
		get openIconTitle() {
			return DatePicker.i18nBundle.getText(i18nDefaults.DATEPICKER_OPEN_ICON_TITLE);
		}
		get openIconName() {
			return "appointment-2";
		}
		get dateAriaDescription() {
			return DatePicker.i18nBundle.getText(i18nDefaults.DATEPICKER_DATE_DESCRIPTION);
		}
		get _shouldHideHeader() {
			return false;
		}
		async _respPopover() {
			const staticAreaItem = await this.getStaticAreaItemDomRef();
			return staticAreaItem.querySelector("[ui5-responsive-popover]");
		}
		_canOpenPicker() {
			return !this.disabled && !this.readonly;
		}
		onSelectedDatesChange(event) {
			event.preventDefault();
			const newValue = event.detail.values && event.detail.values[0];
			this._updateValueAndFireEvents(newValue, true, ["change", "value-changed"]);
			this.closePicker();
		}
		onHeaderShowMonthPress() {
			this._calendarCurrentPicker = "month";
		}
		onHeaderShowYearPress() {
			this._calendarCurrentPicker = "year";
		}
		formatValue(date) {
			return this.getFormat().format(date);
		}
		closePicker() {
			this.responsivePopover.close();
		}
		async openPicker() {
			this._isPickerOpen = true;
			this._calendarCurrentPicker = "day";
			this.responsivePopover = await this._respPopover();
			this.responsivePopover.showAt(this);
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
		get dateValue() {
			return this.liveValue ? this.getFormat().parse(this.liveValue) : this.getFormat().parse(this.value);
		}
		get dateValueUTC() {
			return this.liveValue ? this.getFormat().parse(this.liveValue, true) : this.getFormat().parse(this.value);
		}
		get styles() {
			return {
				main: {
					width: "100%",
				},
			};
		}
		get type() {
			return InputType.Text;
		}
		static get dependencies() {
			return [
				Icon,
				ResponsivePopover,
				Calendar,
				CalendarDate$1,
				Input,
				Button,
			];
		}
	}
	DatePicker.define();

	return DatePicker;

});
