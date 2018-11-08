/*!
 * ${copyright}
 */

// Provides control sap.m.OnePersonCalendar.
sap.ui.define([
	'sap/ui/core/Control',
	'sap/m/OnePersonHeader',
	'sap/m/OnePersonGrid',
	'sap/m/SegmentedButtonItem',
	'sap/ui/unified/DateRange',
	'sap/ui/core/date/UniversalDate',
	'sap/ui/core/Locale',
	'sap/ui/core/LocaleData',
	'sap/ui/core/format/DateFormat',
	"./OnePersonCalendarRenderer"
],
function(
	Control,
	OnePersonHeader,
	OnePersonGrid,
	SegmentedButtonItem,
	DateRange,
	UniversalDate,
	Locale,
	LocaleData,
	DateFormat,
	OnePersonCalendarRenderer
) {
	"use strict";

	/**
	 * Constructor for a new <code>OnePersonCalendar</code>.
	 *
	 * @class
	 * Disclaimer: this control is in beta state - incompatible API changes may be done before its official public release. Use at your own discretion.
	 *
	 * @constructor
	 * @private
	 * @since 1.58.0
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */

	var OnePersonCalendar = Control.extend("sap.m.OnePersonCalendar", /** @lends sap.m.OnePersonCalendar.prototype */ { metadata : {

		library : "sap.m",

		properties : {

			title: { type : "string", group : "Data", defaultValue : "" },

			startDate: { type : "object", group : "Data" },

			startHour: { type: "int", group: "Appearance", defaultValue: 8 },

			endHour: { type: "int", group: "Appearance", defaultValue: 17 },

			showFullDay: { type: "boolean", group: "Appearance", defaultValue: true }

		},

		aggregations : {

			actions : {
				type : "sap.ui.core.Control",
				multiple: true,
				singularName: "action",
				forwarding: {
					getter: "_getHeader",
					aggregation: "actions"
				}
			},

			appointments : {
				type: "sap.ui.unified.CalendarAppointment",
				multiple: true,
				singularName: "appointment",
				forwarding: {
					getter: "_getGrid",
					aggregation: "appointments"
				}
			},

			views : {type : "sap.m.OnePersonView", multiple : true, singularName : "view"},

			_header : { type : "sap.m.OnePersonHeader", multiple : false, visibility : "hidden" },

			_grid : { type : "sap.m.OnePersonGrid", multiple : false, visibility : "hidden" }

		}

	}});

	var KEYS_FOR_ALL_BUILTIN_VIEWS = [
		sap.m.OnePersonCalendarView.Day,
		sap.m.OnePersonCalendarView.WorkWeek,
		sap.m.OnePersonCalendarView.Week];

	OnePersonCalendar.prototype.init = function() {
		var sOPCId = this.getId(),
			oDateNow = new Date(),
			oUniDate = new UniversalDate(UniversalDate.UTC(oDateNow.getFullYear(), oDateNow.getMonth(), oDateNow.getDate())),
			oStartDate;

		if (!this.oSelectedItem) {
			this.oSelectedItem = new SegmentedButtonItem(/*("segBtnItem-" + oView.getKey()).split(' ').join(''), */{
				key: sap.m.OnePersonCalendarView.Week,
				text: sap.m.OnePersonCalendarView.Week
			});
		}

		oStartDate = this._getFirstAndLastWeekDate(oUniDate);
		this.setAggregation("_header", new OnePersonHeader(sOPCId + "-Header", {
			pickerText: this._formatPickerText(oStartDate.firstDate, oStartDate.lastDate)
		}));

		var oHeader = this._getHeader();
		oHeader.attachEvent("pressPrevious", this._handlePressArrow, this);
		oHeader.attachEvent("pressToday", this._handlePressToday, this);
		oHeader.attachEvent("pressNext", this._handlePressArrow, this);
		oHeader.attachEvent("dateSelect", this._handleDateSelect, this);

		this.setAggregation("_grid", new OnePersonGrid(sOPCId + "-Grid", {}));

		this._getGrid().setStartDate(oStartDate.firstDate.oDate);
		this._setSelectedDateToCalendar();
		this._getHeader()._getViewSwitch().attachEvent("selectionChange", function (oEvent) {
			this.oSelectedItem = oEvent.getParameter("item");
			this._alignColumns(this.oSelectedItem);
			this._setSelectedDateToCalendar();
		}.bind(this));
	};

	OnePersonCalendar.prototype.exit = function () {
		if (this.oSelectedItem) {
			this.oSelectedItem.destroy();
			this.oSelectedItem = null;
		}
	};

	OnePersonCalendar.prototype.setTitle = function (sTitle) {
		this._getHeader().setTitle(sTitle);

		return this.setProperty("title", sTitle, true);
	};

	OnePersonCalendar.prototype.setStartDate = function (oDate) {
		var oUniDate = new UniversalDate(UniversalDate.UTC(oDate.getFullYear(), oDate.getMonth(), oDate.getDate())),
			oUniWeekDates,
			oStartDate,
			oEndDate,
			sPickerText;

		if (this.oSelectedItem.getKey() === sap.m.OnePersonCalendarView.Day) {
			oStartDate = oUniDate;
		} else {
			oUniWeekDates = this._getFirstAndLastWeekDate(oUniDate);
			oStartDate = oUniWeekDates.firstDate;
			oEndDate = oUniWeekDates.lastDate;
		}
		this.setProperty("startDate", oDate, true);
		this._getGrid().setStartDate(oStartDate.oDate); // in day view we don't want to use the first day of week
		this._getHeader().setSelectedDate(oStartDate.oDate);
		this._setSelectedDateToCalendar();
		sPickerText = this._formatPickerText(oStartDate, oEndDate);
		this._getHeader().setPickerText(sPickerText);

		return this;
	};

	OnePersonCalendar.prototype.setStartHour = function (bValue) {
		this.setProperty("startHour", bValue, true);
		this._getGrid().setStartHour(bValue);

		return this;
	};

	OnePersonCalendar.prototype.setEndHour = function (bValue) {
		this.setProperty("endHour", bValue, true);
		this._getGrid().setEndHour(bValue);

		return this;
	};

	OnePersonCalendar.prototype.setShowFullDay = function (bValue) {
		this.setProperty("showFullDay", bValue, true);
		this._getGrid().setProperty("showFullDay", bValue);

		return this;
	};

	OnePersonCalendar.prototype.addView = function (oView) {
		var oViewsButton = this._getHeader()._getViewSwitch();

		if (KEYS_FOR_ALL_BUILTIN_VIEWS.indexOf(oView.getIntervalType()) > -1) {
			var oItem = new SegmentedButtonItem(/*("segBtnItem-" + oView.getKey()).split(' ').join(''), */{
				key: oView.getIntervalType(),
				text: oView.getTitle()
			});
			oViewsButton.addItem(oItem);
			this.oSelectedItem = oViewsButton.getItems()[0];
			this._switchVisibility();
			this._alignColumns(oViewsButton.getItems()[0]);
		}

		return this.addAggregation("views", oView);
	};

	OnePersonCalendar.prototype.insertView = function (oView, iPos) {
		var oViewsButton = this._getHeader()._getViewSwitch();

		if (KEYS_FOR_ALL_BUILTIN_VIEWS.indexOf(oView.getIntervalType()) > -1) {
			var oItem = new SegmentedButtonItem(/*("segBtnItem-" + oView.getKey()).split(' ').join(''),*/ {
				key: oView.getIntervalType(),
				text: oView.getTitle()
			});
			oViewsButton.insertItem(oItem, iPos);
			this.oSelectedItem = oViewsButton.getItems()[0];
			this._switchVisibility();
			this._alignColumns(oViewsButton.getItems()[0]);
		}

		return this.insertAggregation("views", oView, iPos);
	};

	OnePersonCalendar.prototype.removeView = function (oView) {
		var oViewsButton = this._getHeader()._getViewSwitch();

		oViewsButton.getItems().forEach(function (oItem) {
			if (oItem.getKey() === oView.getIntervalType()) {
				oViewsButton.removeItem(oItem);
				this._switchVisibility();
				this._alignColumns(oViewsButton.getItems()[0]);
			}
		}.bind(this));

		return this.removeAggregation("views", oView);
	};

	OnePersonCalendar.prototype.removeAllViews = function () {
		var oViewsButton = this._getHeader()._getViewSwitch(),
			oItem = new SegmentedButtonItem(/*("segBtnItem-" + oView.getKey()).split(' ').join(''),*/ {
			key: sap.m.OnePersonCalendarView.Week,
			text: sap.m.OnePersonCalendarView.Week
		});

		oViewsButton.removeAllItems();
		this.oSelectedItem = oItem;
		this._switchVisibility();
		this._alignColumns(oItem);

		return this.removeAllAggregation("views");
	};

	OnePersonCalendar.prototype.destroyViews = function () {
		var oViewsButton = this._getHeader()._getViewSwitch(),
			oItem = new SegmentedButtonItem(/*("segBtnItem-" + oView.getKey()).split(' ').join(''),*/ {
			key: sap.m.OnePersonCalendarView.Week,
			text: sap.m.OnePersonCalendarView.Week
		});

		oViewsButton.destroyItems();
		this.oSelectedItem = oItem;
		this._switchVisibility();
		this._alignColumns(oItem);

		return this.destroyAggregation("views");
	};

	OnePersonCalendar.prototype._switchVisibility = function () {
		var oSegmentedButton = this._getHeader()._getViewSwitch();

		if (oSegmentedButton.getItems().length > 1) {
			oSegmentedButton.setProperty("visible", true, true);
		} else {
			oSegmentedButton.setProperty("visible", false, true);
		}
	};

	OnePersonCalendar.prototype._handlePressArrow = function (oEvent) {
		if (oEvent.getId() === "pressPrevious") {
			this._fireArrowsLogic(false);
		} else {
			this._fireArrowsLogic(true);
		}
	};

	OnePersonCalendar.prototype._handlePressToday = function () {
		var oDateNow = new Date(),
			oUniDate = new UniversalDate(UniversalDate.UTC(oDateNow.getFullYear(), oDateNow.getMonth(), oDateNow.getDate())),
			oUniFirstDate,
			oStartDate;

		if (this.oSelectedItem.getKey() === sap.m.OnePersonCalendarView.Day) {
			oStartDate = oUniDate;
		} else {
			oUniFirstDate = this._getFirstAndLastWeekDate(oUniDate);
			oStartDate = oUniFirstDate.firstDate;
		}

		this.setStartDate(oStartDate.oDate);
	};

	OnePersonCalendar.prototype._handleDateSelect = function () {
		var oSelectedDate = this._getHeader().getSelectedDate(),
			oSelectedUTCDate = new UniversalDate(UniversalDate.UTC(oSelectedDate.getFullYear(), oSelectedDate.getMonth(), oSelectedDate.getDate())),
			oDates;

		if (this.oSelectedItem.getKey() === sap.m.OnePersonCalendarView.Day) {
			this.setStartDate(oSelectedUTCDate.oDate);
		} else {
			oDates = this._getFirstAndLastWeekDate(oSelectedUTCDate);
			this.setStartDate(oDates.firstDate.oDate);
		}
	};

	OnePersonCalendar.prototype._setSelectedDateToCalendar = function() {
		var oSelectedDate = this._getHeader().getSelectedDate() || new Date(),
			oSelectedUTCDate = new UniversalDate(UniversalDate.UTC(oSelectedDate.getFullYear(), oSelectedDate.getMonth(), oSelectedDate.getDate())),
			aDates,
			oFirstWeekDate,
			oLastWeekDate,
			oSelectedRange;

		if (this.oSelectedItem.getKey() === sap.m.OnePersonCalendarView.Day) {
			oSelectedRange = new DateRange({
				startDate: oSelectedUTCDate.oDate,
				endDate: oSelectedUTCDate.oDate
			});
		} else {
			aDates = this._getFirstAndLastWeekDate(oSelectedUTCDate);
			oFirstWeekDate = aDates.firstDate;
			oLastWeekDate = aDates.lastDate;
			oSelectedRange = new DateRange({
				startDate: oFirstWeekDate.oDate,
				endDate: oLastWeekDate.oDate
			});
		}

		this._getHeader().getAggregation("_picker").removeAllSelectedDates();
		this._getHeader().getAggregation("_picker").addSelectedDate(oSelectedRange);
	};

	OnePersonCalendar.prototype._formatPickerText = function (oFirstDate, oLastDate) {
		var oResult = DateFormat.getDateInstance({style: "long"}).format(oFirstDate.oDate);

		if (oLastDate) {
			oResult += " - " + DateFormat.getDateInstance({style: "long"}).format(oLastDate.oDate);
		}
		return oResult;
	};

	OnePersonCalendar.prototype._fireArrowsLogic = function (bForward) {
		var oStartDate = this.getStartDate() || new Date(),
			iNumberToAdd,
			oFirstVisibleDate;

		if (bForward) {
			if (this.oSelectedItem.getKey() === sap.m.OnePersonCalendarView.Day) {
				iNumberToAdd = 1;
			} else {
				iNumberToAdd = 7;
			}
		} else {
			if (this.oSelectedItem.getKey() !== sap.m.OnePersonCalendarView.Day) {
				iNumberToAdd = -7;
			} else {
				iNumberToAdd = -1;
			}
		}

		oFirstVisibleDate = new UniversalDate(UniversalDate.UTC(oStartDate.getFullYear(), oStartDate.getMonth(), oStartDate.getDate() + iNumberToAdd));
		this.setStartDate(oFirstVisibleDate.oDate);
	};

	OnePersonCalendar.prototype._getFirstAndLastWeekDate = function(oDate) {
		var oWeek = UniversalDate.getWeekByDate(oDate.getCalendarType(), oDate.getUTCFullYear(), oDate.getUTCMonth(), oDate.getUTCDate()),
			oFirstWeekDateNumbers = UniversalDate.getFirstDateOfWeek(oDate.getCalendarType(), oWeek.year, oWeek.week),
			oFirstWeekDate = new UniversalDate(UniversalDate.UTC(oFirstWeekDateNumbers.year, oFirstWeekDateNumbers.month, oFirstWeekDateNumbers.day)),
			iCLDRFirstWeekDay = LocaleData.getInstance(sap.ui.getCore().getConfiguration().getFormatSettings().getFormatLocale()).getFirstDayOfWeek(),
			oLastWeekDate,
			iDaysToAdd;

		while (oFirstWeekDate.getUTCDay() !== iCLDRFirstWeekDay) {
			oFirstWeekDate.setUTCDate(oFirstWeekDate.getUTCDate() - 1);
		}

		if (this.oSelectedItem.getKey() === sap.m.OnePersonCalendarView.Day) {
			iDaysToAdd = 0;
		} else if (this.oSelectedItem.getKey() === sap.m.OnePersonCalendarView.WorkWeek) {
			var sLocale = this._getLocale(),
				oLocale = new Locale(sLocale),
				oLocaleData = LocaleData.getInstance(oLocale);

			if (oFirstWeekDate.getDay() === oLocaleData.getWeekendEnd()) {
				oFirstWeekDate.setUTCDate(oFirstWeekDate.getUTCDate() + 1);
				this._getGrid().setStartDate(oFirstWeekDate.oDate);
			}

			iDaysToAdd = 4;
		} else if (this.oSelectedItem.getKey() === sap.m.OnePersonCalendarView.Week) {
			iDaysToAdd = 6;
			this._getGrid() && this._getGrid().setStartDate(oFirstWeekDate.oDate);
		}

		oLastWeekDate = new UniversalDate(UniversalDate.UTC(oFirstWeekDate.getUTCFullYear(), oFirstWeekDate.getUTCMonth(), oFirstWeekDate.getUTCDate() + iDaysToAdd));

		return {
			firstDate: oFirstWeekDate,
			lastDate: oLastWeekDate
		};
	};

	OnePersonCalendar.prototype._getLocale = function () {
		return sap.ui.getCore().getConfiguration().getFormatSettings().getFormatLocale().toString();
	};

	OnePersonCalendar.prototype._alignColumns = function (oView) {
		var oDate = this.getStartDate() || new Date(),
			oUniDate = new UniversalDate(UniversalDate.UTC(oDate.getFullYear(), oDate.getMonth(), oDate.getDate())),
			oGrid = this._getGrid(),
			oStartDate;

		this._setSelectedDateToCalendar();
		if (oView.getKey() === sap.m.OnePersonCalendarView.Day) {
			oGrid._setColumns(1);
			this._getHeader().setPickerText(this._formatPickerText(oUniDate));
			this.getStartDate() ? this.setStartDate(this.getStartDate()) : this.setStartDate(new Date());
		} else if (oView.getKey() === sap.m.OnePersonCalendarView.WorkWeek) {
			var sLocale = this._getLocale(),
				oLocale = new Locale(sLocale),
				oLocaleData = LocaleData.getInstance(oLocale);

			if (this.getStartDate() && this.getStartDate().getDay() === oLocaleData.getWeekendEnd()) {
				this.getStartDate().setUTCDate(this.getStartDate().getUTCDate() + 1);
				oGrid.setStartDate(this.getStartDate());
			}
			this.getStartDate() && this.setStartDate(this.getStartDate());
			oGrid._setColumns(5);
			oStartDate = this._getFirstAndLastWeekDate(oUniDate);
			this._getHeader().setPickerText(this._formatPickerText(oStartDate.firstDate, oStartDate.lastDate));
		} else if (oView.getKey() === sap.m.OnePersonCalendarView.Week) {
			oGrid._setColumns(7);
			this.getStartDate() && this.setStartDate(this.getStartDate());
			oStartDate = this._getFirstAndLastWeekDate(oUniDate);
			this._getHeader().setPickerText(this._formatPickerText(oStartDate.firstDate, oStartDate.lastDate));
		}

		this._setColumnHeaderVisibility(oView);
	};

	OnePersonCalendar.prototype._setColumnHeaderVisibility = function (oView) {
		if (oView.getKey() === sap.m.OnePersonCalendarView.Day) {
			this._getGrid()._getColumnHeaders().setVisible(false);
		} else {
			this._getGrid()._getColumnHeaders().setVisible(true);
		}
	};

	OnePersonCalendar.prototype._getHeader = function () {
		return this.getAggregation("_header");
	};

	OnePersonCalendar.prototype._getGrid = function () {
		return this.getAggregation("_grid");
	};

	return OnePersonCalendar;

});