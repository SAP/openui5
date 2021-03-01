sap.ui.define(['sap/ui/webc/common/thirdparty/base/UI5Element', 'sap/ui/webc/common/thirdparty/base/types/Integer', 'sap/ui/webc/common/thirdparty/base/renderer/LitRenderer', 'sap/ui/webc/common/thirdparty/base/Device', 'sap/ui/webc/common/thirdparty/base/i18nBundle', 'sap/ui/webc/common/thirdparty/base/locale/getLocale', 'sap/ui/webc/common/thirdparty/localization/DateFormat', 'sap/ui/webc/common/thirdparty/localization/getCachedLocaleDataInstance', 'sap/ui/webc/common/thirdparty/localization/features/calendar/Gregorian', 'sap/ui/webc/common/thirdparty/base/asset-registries/LocaleData', 'sap/ui/webc/common/thirdparty/base/Keys', 'sap/ui/webc/common/thirdparty/icons/time-entry-request', './generated/templates/TimeSelectionTemplate.lit', './WheelSlider', './timepicker-utils/TimeSlider', './generated/i18n/i18n-defaults', './generated/themes/TimeSelection.css'], function (UI5Element, Integer, litRender, Device, i18nBundle, getLocale, DateFormat, getCachedLocaleDataInstance, Gregorian, LocaleData, Keys, timeEntryRequest, TimeSelectionTemplate_lit, WheelSlider, TimeSlider, i18nDefaults, TimeSelection_css) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var UI5Element__default = /*#__PURE__*/_interopDefaultLegacy(UI5Element);
	var Integer__default = /*#__PURE__*/_interopDefaultLegacy(Integer);
	var litRender__default = /*#__PURE__*/_interopDefaultLegacy(litRender);
	var getLocale__default = /*#__PURE__*/_interopDefaultLegacy(getLocale);
	var DateFormat__default = /*#__PURE__*/_interopDefaultLegacy(DateFormat);
	var getCachedLocaleDataInstance__default = /*#__PURE__*/_interopDefaultLegacy(getCachedLocaleDataInstance);

	const capitalizeFirst = str => str.substr(0, 1).toUpperCase() + str.substr(1);
	const metadata = {
		tag: "ui5-time-selection",
		languageAware: true,
		managedSlots: true,
		properties:  {
			value: {
				type: String,
				defaultValue: undefined,
			},
			formatPattern: {
				type: String,
			},
			hideHours: {
				type: Boolean,
			},
			hideMinutes: {
				type: Boolean,
			},
			hideSeconds: {
				type: Boolean,
			},
			maxHours: {
				type: Integer__default,
			},
			maxMinutes: {
				type: Integer__default,
			},
			maxSeconds: {
				type: Integer__default,
			},
			secondsStep: {
				type: Integer__default,
				defaultValue: 1,
			},
			minutesStep: {
				type: Integer__default,
				defaultValue: 1,
			},
			_currentSlider: {
				type: String,
				defaultValue: "hours",
			},
		},
		events:  {
			change: {},
			sliderChange: {},
		},
	};
	class TimeSelection extends UI5Element__default {
		static get metadata() {
			return metadata;
		}
		static get render() {
			return litRender__default;
		}
		static get styles() {
			return TimeSelection_css;
		}
		static get template() {
			return TimeSelectionTemplate_lit;
		}
		static get dependencies() {
			return [WheelSlider];
		}
		static async onDefine() {
			await Promise.all([
				LocaleData.fetchCldr(getLocale__default().getLanguage(), getLocale__default().getRegion(), getLocale__default().getScript()),
				i18nBundle.fetchI18nBundle("@ui5/webcomponents"),
			]);
		}
		constructor() {
			super();
			this.i18nBundle = i18nBundle.getI18nBundle("@ui5/webcomponents");
		}
		get _hoursConfiguration() {
			const hourFormat = this.getFormat().aFormatArray.find(item => item.type.startsWith("hour"));
			return TimeSlider.getHoursConfigByFormat(hourFormat ? hourFormat.type : "hour0_23");
		}
		get _neededSliders() {
			const formatArray = this.getFormat().aFormatArray;
			return TimeSlider.getTimeControlsByFormat(formatArray, this._hoursConfiguration);
		}
		get _hasHoursSlider() {
			return this._neededSliders[0] && !this.hideHours;
		}
		get _hasMinutesSlider() {
			return this._neededSliders[1] && !this.hideMinutes;
		}
		get _hasSecondsSlider() {
			return this._neededSliders[2] && !this.hideSeconds;
		}
		get _hasPeriodsSlider() {
			return this._neededSliders[3];
		}
		get secondsArray() {
			return TimeSlider.getSeconds(this.maxSeconds ? this.maxSeconds + 1 : undefined, this.secondsStep);
		}
		get minutesArray() {
			return TimeSlider.getMinutes(this.maxMinutes ? this.maxMinutes + 1 : undefined, this.minutesStep);
		}
		get hoursArray() {
			return TimeSlider.getHours(this._hoursConfiguration, this.maxHours ? this.maxHours + 1 : undefined);
		}
		get periodsArray() {
			return this.getFormat().aDayPeriods.map(x => x.toUpperCase());
		}
		get _hoursSliderFocused() {
			return this._currentSlider === "hours";
		}
		get _minutesSliderFocused() {
			return this._currentSlider === "minutes";
		}
		get _secondsSliderFocused() {
			return this._currentSlider === "seconds";
		}
		get _periodSliderFocused() {
			return this._currentSlider === "period";
		}
		get _hours() {
			let hours;
			const dateValue = this.validDateValue;
			if (this._hoursConfiguration.isTwelveHoursFormat && dateValue.getHours() > this._hoursConfiguration.maxHour) {
				hours = dateValue.getHours() - 12;
			} else if (this._hoursConfiguration.isTwelveHoursFormat && dateValue.getHours() < this._hoursConfiguration.minHour) {
				hours = dateValue.getHours() + 12;
			} else {
				hours = dateValue.getHours();
			}
			if (hours.toString().length === 1) {
				hours = `0${hours}`;
			}
			return hours.toString();
		}
		get _minutes() {
			const minutes = this.validDateValue.getMinutes().toString();
			return minutes.length === 1 ? `0${minutes}` : minutes;
		}
		get _seconds() {
			const seconds = this.validDateValue.getSeconds().toString();
			return seconds.length === 1 ? `0${seconds}` : seconds;
		}
		get _period() {
			if (!this._hoursConfiguration.isTwelveHoursFormat) {
				return undefined;
			}
			let period;
			const dateValue = this.validDateValue;
			if (this._hoursConfiguration.minHour === 1) {
				period = dateValue.getHours() >= this._hoursConfiguration.maxHour ? this.periodsArray[1] : this.periodsArray[0];
			} else {
				period = (dateValue.getHours() > this._hoursConfiguration.maxHour || dateValue.getHours() === this._hoursConfiguration.minHour) ? this.periodsArray[1] : this.periodsArray[0];
			}
			return period;
		}
		setValue(date) {
			const value = this.formatValue(date);
			if (this.isValid(value)) {
				this.value = this.normalizeValue(value);
				this.fireEvent("change", { value: this.value, valid: true });
			}
		}
		onHoursChange(event) {
			let hours = event.detail.value;
			const isTwelveHoursFormat = this._hoursConfiguration.isTwelveHoursFormat;
			if (isTwelveHoursFormat) {
				if (this._period === this.periodsArray[0]) {
					hours = hours === "12" ? 0 : hours;
				}
				if (this._period === this.periodsArray[1]) {
					hours = hours === "12" ? hours : hours * 1 + 12;
				}
			}
			const date = this.validDateValue;
			date.setHours(hours);
			this.setValue(date);
		}
		onMinutesChange(event) {
			const minutes = event.detail.value;
			const date = this.validDateValue;
			date.setMinutes(minutes);
			this.setValue(date);
		}
		onSecondsChange(event) {
			const seconds = event.detail.value;
			const date = this.validDateValue;
			date.setSeconds(seconds);
			this.setValue(date);
		}
		onPeriodChange(event) {
			const period = event.detail.value;
			const date = this.validDateValue;
			if (period === this.periodsArray[0] && date.getHours() >= 12) {
				date.setHours(date.getHours() - 12);
			} if (period === this.periodsArray[1] && date.getHours() < 12) {
				date.setHours(date.getHours() + 12);
			}
			this.setValue(date);
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
		get _formatPattern() {
			const pattern = this.formatPattern;
			const hasHours = !!pattern.match(/H/i);
			const fallback = !pattern || !hasHours;
			const localeData = getCachedLocaleDataInstance__default(getLocale__default());
			return fallback ? localeData.getCombinedDateTimePattern("medium", "medium", this._primaryCalendarType) : pattern;
		}
		get _isPattern() {
			return this._formatPattern !== "medium" && this._formatPattern !== "short" && this._formatPattern !== "long";
		}
		selectSlider(event) {
			this._setCurrentSlider(event.target.closest("[ui5-wheelslider]").getAttribute("data-sap-slider"));
		}
		_setCurrentSlider(slider) {
			if (this._currentSlider === slider) {
				return;
			}
			this._currentSlider = slider;
			this.fireEvent("slider-change", { slider });
		}
		get _currentSliderDOM() {
			return this.shadowRoot.querySelector(`[data-sap-slider="${this._currentSlider}"]`);
		}
		get _activeSliders() {
			return ["hours", "minutes", "seconds", "period"].filter(slider => this[`_has${capitalizeFirst(slider)}Slider`]);
		}
		_onfocusin(event) {
			if (!this._currentSlider) {
				this._setCurrentSlider(this._activeSliders[0]);
			}
			if (event.target === event.currentTarget) {
				this._currentSliderDOM.focus();
			}
		}
		_onfocusout(event) {
			if (!this.shadowRoot.contains(event.relatedTarget)) {
				this._setCurrentSlider("");
			}
		}
		async _onkeydown(event) {
			if (!(Keys.isLeft(event) || Keys.isRight(event))) {
				return;
			}
			event.preventDefault();
			const activeSliders = this._activeSliders;
			const activeSlider = event.target.closest("[ui5-wheelslider]").getAttribute("data-sap-slider");
			let index = activeSliders.indexOf(activeSlider);
			if (Keys.isLeft(event)) {
				index = index === 0 ? activeSliders.length - 1 : index - 1;
			} else if (Keys.isRight(event)) {
				index = index === activeSliders.length - 1 ? 0 : index + 1;
			}
			this._setCurrentSlider(activeSliders[index]);
			this._currentSliderDOM.focus();
		}
		_handleWheel(e) {
			e.preventDefault();
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
		get dateValue() {
			return this.value ? this.getFormat().parse(this.value) : new Date();
		}
		get validDateValue() {
			return this.isValid(this.value) ? this.dateValue : new Date();
		}
		get hoursSliderTitle() {
			return this.i18nBundle.getText(i18nDefaults.TIMEPICKER_HOURS_LABEL);
		}
		get minutesSliderTitle() {
			return this.i18nBundle.getText(i18nDefaults.TIMEPICKER_MINUTES_LABEL);
		}
		get secondsSliderTitle() {
			return this.i18nBundle.getText(i18nDefaults.TIMEPICKER_SECONDS_LABEL);
		}
		get periodSliderTitle() {
			return this.i18nBundle.getText(i18nDefaults.TIMEPICKER_PERIODS_LABEL);
		}
		get _isCyclic() {
			return !Device.isIE();
		}
		get classes() {
			return {
				root: {
					"ui5-time-selection-root": true,
					"ui5-phone": Device.isPhone(),
				},
			};
		}
	}
	TimeSelection.define();

	return TimeSelection;

});
