sap.ui.define(['sap/ui/webc/common/thirdparty/base/locale/getLocale', 'sap/ui/webc/common/thirdparty/localization/getCachedLocaleDataInstance', './TimePickerBase', './generated/i18n/i18n-defaults'], function (getLocale, getCachedLocaleDataInstance, TimePickerBase, i18nDefaults) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var getLocale__default = /*#__PURE__*/_interopDefaultLegacy(getLocale);
	var getCachedLocaleDataInstance__default = /*#__PURE__*/_interopDefaultLegacy(getCachedLocaleDataInstance);

	const metadata = {
		tag: "ui5-time-picker",
		altTag: "ui5-timepicker",
		properties:  {
			placeholder: {
				type: String,
				defaultValue: undefined,
			},
			formatPattern: {
				type: String,
			},
		},
	};
	class TimePicker extends TimePickerBase {
		static get metadata() {
			return metadata;
		}
		get _formatPattern() {
			const hasHours = !!this.formatPattern.match(/H/i);
			const fallback = !this.formatPattern || !hasHours;
			const localeData = getCachedLocaleDataInstance__default(getLocale__default());
			return fallback ? localeData.getTimePattern("medium") : this.formatPattern;
		}
		get _displayFormat() {
			return this.getFormat().oFormatOptions.pattern;
		}
		get _placeholder() {
			return this.placeholder !== undefined ? this.placeholder : this._displayFormat;
		}
		get dateValue() {
			return this.getFormat().parse(this._effectiveValue);
		}
		get accInfo() {
			return {
				"ariaRoledescription": this.dateAriaDescription,
				"ariaHasPopup": "dialog",
				"ariaAutoComplete": "none",
				"role": "combobox",
				"ariaControls": `${this._id}-responsive-popover`,
				"ariaExpanded": this.isOpen(),
			};
		}
		get dateAriaDescription() {
			return this.i18nBundle.getText(i18nDefaults.TIMEPICKER_INPUT_DESCRIPTION);
		}
	}
	TimePicker.define();

	return TimePicker;

});
