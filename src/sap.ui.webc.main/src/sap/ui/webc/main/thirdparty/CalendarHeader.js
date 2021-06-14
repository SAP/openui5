sap.ui.define(['sap/ui/webc/common/thirdparty/localization/dates/CalendarDate', 'sap/ui/webc/common/thirdparty/base/locale/getLocale', 'sap/ui/webc/common/thirdparty/localization/DateFormat', 'sap/ui/webc/common/thirdparty/localization/getCachedLocaleDataInstance', 'sap/ui/webc/common/thirdparty/base/UI5Element', 'sap/ui/webc/common/thirdparty/base/renderer/LitRenderer', 'sap/ui/webc/common/thirdparty/base/Keys', 'sap/ui/webc/common/thirdparty/base/i18nBundle', 'sap/ui/webc/common/thirdparty/base/types/Integer', 'sap/ui/webc/common/thirdparty/base/types/CalendarType', 'sap/ui/webc/common/thirdparty/icons/slim-arrow-left', 'sap/ui/webc/common/thirdparty/icons/slim-arrow-right', './Icon', './generated/templates/CalendarHeaderTemplate.lit', './generated/i18n/i18n-defaults', './generated/themes/CalendarHeader.css'], function (CalendarDate, getLocale, DateFormat, getCachedLocaleDataInstance, UI5Element, litRender, Keys, i18nBundle, Integer, CalendarType, slimArrowLeft, slimArrowRight, Icon, CalendarHeaderTemplate_lit, i18nDefaults, CalendarHeader_css) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var CalendarDate__default = /*#__PURE__*/_interopDefaultLegacy(CalendarDate);
	var getLocale__default = /*#__PURE__*/_interopDefaultLegacy(getLocale);
	var DateFormat__default = /*#__PURE__*/_interopDefaultLegacy(DateFormat);
	var getCachedLocaleDataInstance__default = /*#__PURE__*/_interopDefaultLegacy(getCachedLocaleDataInstance);
	var UI5Element__default = /*#__PURE__*/_interopDefaultLegacy(UI5Element);
	var litRender__default = /*#__PURE__*/_interopDefaultLegacy(litRender);
	var Integer__default = /*#__PURE__*/_interopDefaultLegacy(Integer);
	var CalendarType__default = /*#__PURE__*/_interopDefaultLegacy(CalendarType);

	const metadata = {
		tag: "ui5-calendar-header",
		languageAware: true,
		properties: {
			timestamp: {
				type: Integer__default,
			},
			primaryCalendarType: {
				type: CalendarType__default,
			},
			isNextButtonDisabled: {
				type: Boolean,
			},
			isPrevButtonDisabled: {
				type: Boolean,
			},
			isMonthButtonHidden: {
				type: Boolean,
			},
		},
		events: {
			"previous-press": {},
			"next-press": {},
			"show-month-press": {},
			"show-year-press": {},
		},
	};
	class CalendarHeader extends UI5Element__default {
		static get metadata() {
			return metadata;
		}
		static get render() {
			return litRender__default;
		}
		static get template() {
			return CalendarHeaderTemplate_lit;
		}
		static get styles() {
			return CalendarHeader_css;
		}
		static get dependencies() {
			return [Icon];
		}
		static async onDefine() {
			await i18nBundle.fetchI18nBundle("@ui5/webcomponents");
		}
		constructor() {
			super();
			this.i18nBundle = i18nBundle.getI18nBundle("@ui5/webcomponents");
		}
		onBeforeRendering() {
			const localeData = getCachedLocaleDataInstance__default(getLocale__default());
			const yearFormat = DateFormat__default.getDateInstance({ format: "y", calendarType: this.primaryCalendarType });
			const localDate = new Date(this.timestamp * 1000);
			const calendarDate = CalendarDate__default.fromTimestamp(localDate.getTime(), this.primaryCalendarType);
			this._monthButtonText = localeData.getMonths("wide", this.primaryCalendarType)[calendarDate.getMonth()];
			this._yearButtonText = yearFormat.format(localDate, true);
			this._prevButtonText = this.i18nBundle.getText(i18nDefaults.CALENDAR_HEADER_PREVIOUS_BUTTON);
			this._nextButtonText = this.i18nBundle.getText(i18nDefaults.CALENDAR_HEADER_NEXT_BUTTON);
		}
		onPrevButtonClick(event) {
			this.fireEvent("previous-press", event);
		}
		onNextButtonClick(event) {
			this.fireEvent("next-press", event);
		}
		onMonthButtonClick(event) {
			this.fireEvent("show-month-press", event);
		}
		onMonthButtonKeyDown(event) {
			if (Keys.isSpace(event) || Keys.isEnter(event)) {
				event.preventDefault();
				this.fireEvent("show-month-press", event);
			}
		}
		onYearButtonClick(event) {
			this.fireEvent("show-year-press", event);
		}
		onYearButtonKeyDown(event) {
			if (Keys.isSpace(event) || Keys.isEnter(event)) {
				event.preventDefault();
				this.fireEvent("show-year-press", event);
			}
		}
		get classes() {
			return {
				prevButton: {
					"ui5-calheader-arrowbtn": true,
					"ui5-calheader-arrowbtn-disabled": this.isPrevButtonDisabled,
				},
				nextButton: {
					"ui5-calheader-arrowbtn": true,
					"ui5-calheader-arrowbtn-disabled": this.isNextButtonDisabled,
				},
			};
		}
	}
	CalendarHeader.define();

	return CalendarHeader;

});
