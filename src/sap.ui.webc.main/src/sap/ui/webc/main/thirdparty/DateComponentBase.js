sap.ui.define(['sap/ui/webc/common/thirdparty/base/UI5Element', 'sap/ui/webc/common/thirdparty/base/renderer/LitRenderer', 'sap/ui/webc/common/thirdparty/base/asset-registries/LocaleData', 'sap/ui/webc/common/thirdparty/base/i18nBundle', 'sap/ui/webc/common/thirdparty/base/config/CalendarType', 'sap/ui/webc/common/thirdparty/localization/DateFormat', 'sap/ui/webc/common/thirdparty/localization/getCachedLocaleDataInstance', 'sap/ui/webc/common/thirdparty/base/types/CalendarType', 'sap/ui/webc/common/thirdparty/base/locale/getLocale', 'sap/ui/webc/common/thirdparty/localization/dates/CalendarDate', 'sap/ui/webc/common/thirdparty/localization/dates/ExtremeDates'], function (UI5Element, litRender, LocaleData, i18nBundle, CalendarType, DateFormat, getCachedLocaleDataInstance, CalendarType$1, getLocale, CalendarDate, ExtremeDates) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var UI5Element__default = /*#__PURE__*/_interopDefaultLegacy(UI5Element);
	var litRender__default = /*#__PURE__*/_interopDefaultLegacy(litRender);
	var DateFormat__default = /*#__PURE__*/_interopDefaultLegacy(DateFormat);
	var getCachedLocaleDataInstance__default = /*#__PURE__*/_interopDefaultLegacy(getCachedLocaleDataInstance);
	var CalendarType__default = /*#__PURE__*/_interopDefaultLegacy(CalendarType$1);
	var getLocale__default = /*#__PURE__*/_interopDefaultLegacy(getLocale);
	var CalendarDate__default = /*#__PURE__*/_interopDefaultLegacy(CalendarDate);

	const metadata = {
		languageAware: true,
		properties:  {
			primaryCalendarType: {
				type: CalendarType__default,
			},
			secondaryCalendarType: {
				type: CalendarType__default,
			},
			minDate: {
				type: String,
			},
			maxDate: {
				type: String,
			},
			formatPattern: {
				type: String,
			},
		},
	};
	class DateComponentBase extends UI5Element__default {
		static get metadata() {
			return metadata;
		}
		static get render() {
			return litRender__default;
		}
		constructor() {
			super();
			this.i18nBundle = i18nBundle.getI18nBundle("@ui5/webcomponents");
		}
		get _primaryCalendarType() {
			const localeData = getCachedLocaleDataInstance__default(getLocale__default());
			return this.primaryCalendarType || CalendarType.getCalendarType() || localeData.getPreferredCalendarType();
		}
		get _minDate() {
			return this.minDate && this.getFormat().parse(this.minDate) ? this._getCalendarDateFromString(this.minDate) : ExtremeDates.getMinCalendarDate(this._primaryCalendarType);
		}
		get _maxDate() {
			return this.maxDate && this.getFormat().parse(this.maxDate) ? this._getCalendarDateFromString(this.maxDate) : ExtremeDates.getMaxCalendarDate(this._primaryCalendarType);
		}
		get _formatPattern() {
			return this.formatPattern || "medium";
		}
		get _isPattern() {
			return this._formatPattern !== "medium" && this._formatPattern !== "short" && this._formatPattern !== "long";
		}
		_getCalendarDateFromString(value) {
			const jsDate = this.getFormat().parse(value);
			if (jsDate) {
				return CalendarDate__default.fromLocalJSDate(jsDate, this._primaryCalendarType);
			}
		}
		_getTimeStampFromString(value) {
			const calDate = this._getCalendarDateFromString(value);
			if (calDate) {
				return calDate.toUTCJSDate().valueOf();
			}
		}
		_getStringFromTimestamp(timestamp) {
			const localDate = new Date(timestamp);
			return this.getFormat().format(localDate, true);
		}
		getFormat() {
			let dateFormat;
			if (this._isPattern) {
				dateFormat = DateFormat__default.getInstance({
					pattern: this._formatPattern,
					calendarType: this._primaryCalendarType,
				});
			} else {
				dateFormat = DateFormat__default.getInstance({
					style: this._formatPattern,
					calendarType: this._primaryCalendarType,
				});
			}
			return dateFormat;
		}
		static async onDefine() {
			await Promise.all([
				LocaleData.fetchCldr(getLocale__default().getLanguage(), getLocale__default().getRegion(), getLocale__default().getScript()),
				i18nBundle.fetchI18nBundle("@ui5/webcomponents"),
			]);
		}
	}

	return DateComponentBase;

});
