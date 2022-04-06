sap.ui.define(['sap/ui/webc/common/thirdparty/base/delegate/ResizeHandler', 'sap/ui/webc/common/thirdparty/base/locale/getLocale', 'sap/ui/webc/common/thirdparty/localization/getCachedLocaleDataInstance', 'sap/ui/webc/common/thirdparty/localization/dates/modifyDateBy', 'sap/ui/webc/common/thirdparty/localization/dates/CalendarDate', 'sap/ui/webc/common/thirdparty/icons/date-time', './Button', './ToggleButton', './SegmentedButton', './Calendar', './DatePicker', './TimeSelection', './generated/i18n/i18n-defaults', './generated/templates/DateTimePickerPopoverTemplate.lit', './generated/themes/DateTimePicker.css', './generated/themes/DateTimePickerPopover.css'], function (ResizeHandler, getLocale, getCachedLocaleDataInstance, modifyDateBy, CalendarDate, dateTime, Button, ToggleButton, SegmentedButton, Calendar, DatePicker, TimeSelection, i18nDefaults, DateTimePickerPopoverTemplate_lit, DateTimePicker_css, DateTimePickerPopover_css) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var ResizeHandler__default = /*#__PURE__*/_interopDefaultLegacy(ResizeHandler);
	var getLocale__default = /*#__PURE__*/_interopDefaultLegacy(getLocale);
	var getCachedLocaleDataInstance__default = /*#__PURE__*/_interopDefaultLegacy(getCachedLocaleDataInstance);
	var modifyDateBy__default = /*#__PURE__*/_interopDefaultLegacy(modifyDateBy);
	var CalendarDate__default = /*#__PURE__*/_interopDefaultLegacy(CalendarDate);

	const PHONE_MODE_BREAKPOINT = 640;
	const metadata = {
		tag: "ui5-datetime-picker",
		properties:  {
			_showTimeView: {
				type: Boolean,
				noAttribute: true,
			},
			_phoneMode: {
				type: Boolean,
			},
			_previewValues: {
				type: Object,
			},
			_currentTimeSlider: {
				type: String,
				defaultValue: "hours",
			},
		},
	};
	class DateTimePicker extends DatePicker {
		static get metadata() {
			return metadata;
		}
		static get staticAreaTemplate() {
			return DateTimePickerPopoverTemplate_lit;
		}
		static get styles() {
			return [super.styles, DateTimePicker_css];
		}
		static get staticAreaStyles() {
			return [super.staticAreaStyles, DateTimePickerPopover_css];
		}
		static get dependencies() {
			return [
				...DatePicker.dependencies,
				Calendar,
				Button,
				ToggleButton,
				SegmentedButton,
				TimeSelection,
			];
		}
		constructor() {
			super();
			this._handleResizeBound = this._handleResize.bind(this);
		}
		onResponsivePopoverAfterClose() {
			super.onResponsivePopoverAfterClose();
			this._showTimeView = false;
			this._previewValues = {};
		}
		onEnterDOM() {
			ResizeHandler__default.register(document.body, this._handleResizeBound);
		}
		onExitDOM() {
			ResizeHandler__default.deregister(document.body, this._handleResizeBound);
		}
		async openPicker() {
			await super.openPicker();
			this._currentTimeSlider = "hours";
			this._previewValues.timeSelectionValue = this.value || this.getFormat().format(new Date());
		}
		get classes() {
			return {
				picker: {
					"ui5-dt-picker-content--phone": this.phone,
				},
				dateTimeView: {
					"ui5-dt-cal--hidden": this.phone && this.showTimeView,
					"ui5-dt-time--hidden": this.phone && this.showDateView,
				},
				footer: {
					"ui5-dt-picker-footer-time-hidden": (this.phone && this.showTimeView) || (this.phone && this.showDateView),
				},
			};
		}
		get _formatPattern() {
			const hasHours = !!this.formatPattern.match(/H/i);
			const fallback = !this.formatPattern || !hasHours;
			const localeData = getCachedLocaleDataInstance__default(getLocale__default());
			return fallback ? localeData.getCombinedDateTimePattern("medium", "medium", this._primaryCalendarType) : this.formatPattern;
		}
		get _calendarTimestamp() {
			return this._previewValues.calendarTimestamp ? this._previewValues.calendarTimestamp : super._calendarTimestamp;
		}
		get _calendarSelectedDates() {
			return this._previewValues.calendarValue ? [this._previewValues.calendarValue] : super._calendarSelectedDates;
		}
		get _timeSelectionValue() {
			return this._previewValues.timeSelectionValue ? this._previewValues.timeSelectionValue : this.value;
		}
		get openIconName() {
			return "date-time";
		}
		get btnOKLabel() {
			return DateTimePicker.i18nBundle.getText(i18nDefaults.TIMEPICKER_SUBMIT_BUTTON);
		}
		get btnCancelLabel() {
			return DateTimePicker.i18nBundle.getText(i18nDefaults.TIMEPICKER_CANCEL_BUTTON);
		}
		get btnDateLabel() {
			return DateTimePicker.i18nBundle.getText(i18nDefaults.DATETIME_PICKER_DATE_BUTTON);
		}
		get btnTimeLabel() {
			return DateTimePicker.i18nBundle.getText(i18nDefaults.DATETIME_PICKER_TIME_BUTTON);
		}
		get showFooter() {
			return true;
		}
		get showDateView() {
			return this.phone ? !this._showTimeView : true;
		}
		get showTimeView() {
			return this.phone ? this._showTimeView : true;
		}
		get phone() {
			return super.phone || this._phoneMode;
		}
		get dateAriaDescription() {
			return DateTimePicker.i18nBundle.getText(i18nDefaults.DATETIME_DESCRIPTION);
		}
		get _shouldHideHeader() {
			return true;
		}
		onSelectedDatesChange(event) {
			event.preventDefault();
			const dateTimePickerContent = event.path ? event.path[1] : event.composedPath()[1];
			this._previewValues = {
				...this._previewValues,
				calendarTimestamp: event.detail.timestamp,
				calendarValue: event.detail.values[0],
				timeSelectionValue: dateTimePickerContent.lastChild.value,
			};
		}
		onTimeSelectionChange(event) {
			this._previewValues = {
				...this._previewValues,
				timeSelectionValue: event.detail.value,
			};
		}
		onTimeSliderChange(event) {
			this._currentTimeSlider = event.detail.slider;
		}
		_handleResize() {
			const documentWidth = document.body.offsetWidth;
			const toPhoneMode = documentWidth <= PHONE_MODE_BREAKPOINT;
			const modeChange = (toPhoneMode && !this._phoneMode) || (!toPhoneMode && this._phoneMode);
			if (modeChange) {
				this._phoneMode = toPhoneMode;
			}
		}
		get _submitDisabled() {
			return !this._calendarSelectedDates || !this._calendarSelectedDates.length;
		}
		_submitClick() {
			const selectedDate = this.getSelectedDateTime();
			const value = this.getFormat().format(selectedDate);
			const valid = this.isValid(value);
			if (this.value !== value) {
				this.value = value;
				this.fireEvent("change", { value: this.value, valid });
				this.fireEvent("value-changed", { value: this.value, valid });
			}
			this._updateValueState();
			this.closePicker();
		}
		_cancelClick() {
			this.closePicker();
		}
		_dateTimeSwitchChange(event) {
			this._showTimeView = event.target.getAttribute("key") === "Time";
			if (this._showTimeView) {
				this._currentTimeSlider = "hours";
			}
		}
		_modifyDateValue(amount, unit) {
			if (!this.dateValue) {
				return;
			}
			const modifiedDate = modifyDateBy__default(CalendarDate__default.fromLocalJSDate(this.dateValue), amount, unit, this._minDate, this._maxDate);
			const modifiedLocalDate = modifiedDate.toLocalJSDate();
			modifiedLocalDate.setHours(this.dateValue.getHours());
			modifiedLocalDate.setMinutes(this.dateValue.getMinutes());
			modifiedLocalDate.setSeconds(this.dateValue.getSeconds());
			const newValue = this.formatValue(modifiedLocalDate);
			this._updateValueAndFireEvents(newValue, true, ["change", "value-changed"]);
		}
		async getPicker() {
			const staticAreaItem = await this.getStaticAreaItemDomRef();
			return staticAreaItem.querySelector("[ui5-responsive-popover]");
		}
		getSelectedDateTime() {
			const selectedDate = this.getFormat().parse(this._calendarSelectedDates[0]);
			const selectedTime = this.getFormat().parse(this._timeSelectionValue);
			selectedDate.setHours(selectedTime.getHours());
			selectedDate.setMinutes(selectedTime.getMinutes());
			selectedDate.setSeconds(selectedTime.getSeconds());
			return selectedDate;
		}
	}
	DateTimePicker.define();

	return DateTimePicker;

});
