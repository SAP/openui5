/*!
 * ${copyright}
 */

// Provides control sap.m.OnePersonCalendar.
sap.ui.define([
	'jquery.sap.global',
	'sap/ui/core/Control',
	'sap/m/OnePersonHeader',
	'sap/m/OnePersonGrid',
	'sap/ui/core/date/UniversalDate',
	'sap/ui/core/LocaleData'
],
function(
	jQuery,
	Control,
	OnePersonHeader,
	OnePersonGrid,
	UniversalDate,
	LocaleData
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

			showFullDay: { type: "boolean", group: "Appearance", defaultValue: true },

			appointmentsVisualization : { type : "sap.ui.unified.CalendarAppointmentVisualization", group : "Appearance", defaultValue : sap.ui.unified.CalendarAppointmentVisualization.Standard }

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

			_header : { type : "sap.m.OnePersonHeader", multiple : false, visibility : "hidden" },

			_grid : { type : "sap.m.OnePersonGrid", multiple : false, visibility : "hidden" }

		}

	}});

	OnePersonCalendar.prototype.init = function() {
		var sOPCId = this.getId(),
			oDateNow = new Date(),
			oUniDate = new UniversalDate(UniversalDate.UTC(oDateNow.getFullYear(), oDateNow.getMonth(), oDateNow.getDate())),
			oStartDate = this._getFirstAndLastWeekDate(oUniDate);

		this.setAggregation("_header", new OnePersonHeader(sOPCId + "-Header", {}));

		var oHeader = this._getHeader();
		oHeader.attachEvent("pressPrevious", this._handlePressArrow, this);
		oHeader.attachEvent("pressToday", this._handlePressToday, this);
		oHeader.attachEvent("pressNext", this._handlePressArrow, this);
		oHeader.attachEvent("dateSelect", this._handleDateSelect, this);

		this.setAggregation("_grid", new OnePersonGrid(sOPCId + "-Grid", {}));

		this._getGrid().setStartDate(oStartDate.firstDate.oDate);
	};

	OnePersonCalendar.prototype.setTitle = function (sTitle) {
		this._getHeader().setTitle(sTitle);

		return this.setProperty("title", sTitle, true);
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

	OnePersonCalendar.prototype.setAppointmentsVisualization = function (oValue) {
		this.setProperty("appointmentsVisualization", oValue, true);
		this._getGrid().setProperty("appointmentsVisualization", oValue);

		return this;
	};

	OnePersonCalendar.prototype._handlePressArrow = function (oEvent) {
		if (oEvent.getId() === "pressPrevious") {
			this._fireArrowsLogic(-7);
		} else {
			this._fireArrowsLogic(7);
		}
	};

	OnePersonCalendar.prototype._handlePressToday = function () {
		var oDateNow = new Date(),
			oUniDate = new UniversalDate(UniversalDate.UTC(oDateNow.getFullYear(), oDateNow.getMonth(), oDateNow.getDate())),
			oUniFirstDate = this._getFirstAndLastWeekDate(oUniDate);

		this.setStartDate(oUniFirstDate.firstDate.oDate);
	};

	OnePersonCalendar.prototype._handleDateSelect = function () {
		this.setStartDate(this.getAggregation("header").getStartDate());
	};

	OnePersonCalendar.prototype._fireArrowsLogic = function (iNumberToAdd) {
		var oStartDate = this.getStartDate() || new Date(),
			oFirstWeekDate = new Date(oStartDate.getFullYear(), oStartDate.getMonth(), oStartDate.getDate() + iNumberToAdd);

		this.setStartDate(oFirstWeekDate);
	};

	OnePersonCalendar.prototype.setStartDate = function (oDate) {
		var oUniDate = new UniversalDate(UniversalDate.UTC(oDate.getFullYear(), oDate.getMonth(), oDate.getDate())),
			oUniFirstDate = this._getFirstAndLastWeekDate(oUniDate);

		this.setProperty("startDate", oDate, true);
		this._getGrid().setStartDate(oUniFirstDate.firstDate.oDate);
		this._getHeader().setStartDate(oDate);

		return this;
	};

	OnePersonCalendar.prototype._getFirstAndLastWeekDate = function(oDate) {
		var oWeek = UniversalDate.getWeekByDate(oDate.getCalendarType(), oDate.getUTCFullYear(), oDate.getUTCMonth(), oDate.getUTCDate()),
			oFirstWeekDateNumbers = UniversalDate.getFirstDateOfWeek(oDate.getCalendarType(), oWeek.year, oWeek.week),
			oFirstWeekDate = new UniversalDate(UniversalDate.UTC(oFirstWeekDateNumbers.year, oFirstWeekDateNumbers.month, oFirstWeekDateNumbers.day)),
			oLastWeekDate,
			iCLDRFirstWeekDay = LocaleData.getInstance(sap.ui.getCore().getConfiguration().getFormatSettings().getFormatLocale()).getFirstDayOfWeek();

		while (oFirstWeekDate.getUTCDay() !== iCLDRFirstWeekDay) {
			oFirstWeekDate.setUTCDate(oFirstWeekDate.getUTCDate() - 1);
		}

		oLastWeekDate = new UniversalDate(UniversalDate.UTC(oFirstWeekDate.getUTCFullYear(), oFirstWeekDate.getUTCMonth(), oFirstWeekDate.getUTCDate() + 6));

		return {
			firstDate: oFirstWeekDate,
			lastDate: oLastWeekDate
		};
	};

	OnePersonCalendar.prototype._getHeader = function () {
		return this.getAggregation("_header");
	};

	OnePersonCalendar.prototype._getGrid = function () {
		return this.getAggregation("_grid");
	};

	return OnePersonCalendar;

});