/*!
 * ${copyright}
 */

// Provides control sap.m.DatePicker.
sap.ui.define([
	'jquery.sap.global',
	'sap/ui/Device',
	'./InputBase',
	'./DateTimeField',
	'sap/ui/core/Control',
	'sap/m/library',
	'sap/ui/unified/Calendar',
	'sap/ui/unified/calendar/CalendarDate',
	'sap/ui/unified/calendar/CalendarUtils',
	'sap/ui/core/format/DateFormat',
	'sap/ui/core/date/UniversalDate',
	'sap/ui/core/Popup'
],
function(
	jQuery,
	Device,
	InputBase,
	DateTimeField,
	Control,
	library,
	Calendar,
	CalendarDate,
	CalendarUtils,
	DateFormat,
	UniversalDate,
	Popup
) {
	"use strict";

	/**
	 * Constructor for a new <code>DatePicker</code>.
	 *
	 * @class
	 * Disclaimer: this control is in beta state - incompatible API changes may be done before its official public release. Use at your own discretion.
	 *
	 * @constructor
	 * @private
	 * @since 1.58.0
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */

	var OnePersonHeader = Control.extend("sap.m.OnePersonHeader", /** @lends sap.m.OnePersonHeader.prototype */ { metadata : {

			library : "sap.m",
			properties : {

				selectedDate: {type : "object", group : "Data"},

				pickerText : {type : "string", group : "Data", visibility : "hidden"}

			},

			aggregations : {

				actionsToolbar : {type: "sap.m.OverflowToolbar", multiple: false, visibility : "hidden"},

				navigationToolbar : {type: "sap.m.Toolbar", multiple: false, visibility : "hidden"},

				actions : {
					type : "sap.ui.core.Control",
					multiple: true,
					singularName: "action",
					forwarding: {
						getter: "_getActionsToolbar",
						aggregation: "content"
					}
				},

				picker : {type : "sap.ui.unified.Calendar", multiple : false, visibility : "hidden"}
			},

			events : {

				pressPrevious: {},

				pressToday: {},

				pressNext: {}
			}

		}});

	// TODO: CSS: hide the border-bottom of OnePersonHeader-NavToolbar
	// TODO: CSS: make OnePersonHeader-NavToolbar responsible
	// TODO: CSS: align with v spec
	// TODO: setter of selectedDate
	// TODO: correct focus in the picker on ESC

	OnePersonHeader.prototype.init = function() {

		var sOPHId = this.getId(),
			sNavToolbarId = sOPHId + "-NavToolbar",
			oDates,
			oDateNow = new Date();

		this.oSelectedUTCDate = new UniversalDate(UniversalDate.UTC(oDateNow.getFullYear(), oDateNow.getMonth(), oDateNow.getDate()));
		oDates = this._getFirstAndLastWeekDate(this.oSelectedUTCDate);

		Control.prototype.init.apply(this, arguments);

		this.setAggregation("actionsToolbar", new sap.m.OverflowToolbar(sOPHId + "-ActionsToolbar", { // !
			design: library.ToolbarDesign.Transparent
		}));

		this.oPrevBtn = new sap.m.Button(sNavToolbarId + "-PrevBtn", {
			icon: "sap-icon://slim-arrow-left",
			press: function (oEvent) {
				this.firePressPrevious();
				// TODO: move the rest to OnePerson class

				this._fireArrowsLogic(false);
			}.bind(this)
		});
		this.oTodayBtn = new sap.m.Button(sNavToolbarId + "-TodayBtn", {
			text: "Today",
			press: function (oEvent) {
				this.firePressToday();
				// TODO: move the rest to OnePerson class

				var oDateNow = new Date(),
					oDates,
					sPickerText;

				this.setSelectedDate(oDateNow);
				this.oSelectedUTCDate = new UniversalDate(UniversalDate.UTC(oDateNow.getFullYear(), oDateNow.getMonth(), oDateNow.getDate()));
				oDates = this._getFirstAndLastWeekDate(this.oSelectedUTCDate);
				sPickerText = this._formatPickerText(oDates.firstDate, oDates.lastDate);
				this.setPickerText(sPickerText);
				if (this.oPicker) {
					this._setSelectedDateToCalendar();
				}
			}.bind(this)
		});
		this.oNextBtn = new sap.m.Button(sNavToolbarId + "-NextBtn", {
			icon: "sap-icon://slim-arrow-right",
			press: function (oEvent) {
				this.firePressNext();
				// TODO: move the rest to OnePerson class

				this._fireArrowsLogic(true);
			}.bind(this)
		});
		this.oPickerButton = new sap.m.Button(sNavToolbarId + "-DateLink", {
			text: this.getPickerText() || this._formatPickerText(oDates.firstDate, oDates.lastDate),
			press: function () {
				if (!this.oPicker) {
					this.oPicker = new Calendar(sOPHId + "-Cal");
					this.oPicker.attachEvent("select", this._handlePickerDateSelect, this);
					this.setAggregation("picker", this.oPicker);
				}

				this.oPicker.displayDate(this.oSelectedUTCDate.oDate);
				this._setSelectedDateToCalendar();
				this._openPickerPopup(this.oPicker);
			}.bind(this)
		});

		this.setAggregation("navigationToolbar", new sap.m.Toolbar(sNavToolbarId, { // !
			design: library.ToolbarDesign.Transparent,
			content: [
				this.oPrevBtn,
				this.oTodayBtn,
				this.oNextBtn,
				this.oPickerButton
			]
		}));

	};

	OnePersonHeader.prototype.onBeforeRendering = function () {
		if (!this.getActions().length) {
			this.getAggregation("actionsToolbar").setProperty("visible", false, true);
		}
	};

	OnePersonHeader.prototype.setSelectedDate = function (oDate) {
		var oUniDate = new UniversalDate(UniversalDate.UTC(oDate.getFullYear(), oDate.getMonth(), oDate.getDate())),
			oDates,
			sPickerText;

		this.setProperty("selectedDate", oDate, true);
		this.oSelectedUTCDate = oUniDate;
		oDates = this._getFirstAndLastWeekDate(this.oSelectedUTCDate);
		sPickerText = this._formatPickerText(oDates.firstDate, oDates.lastDate);
		this.setPickerText(sPickerText);

		return this;
	};

	OnePersonHeader.prototype.setPickerText = function (sText) {
		this.setProperty("pickerText", sText, true);
		this.oPickerButton.setText(sText);

		return this;
	};

	OnePersonHeader.prototype._formatPickerText = function (oFirstDate, oLastDate) {
		// TODO: maybe move to OnePerson class

		var sResult;

		if (oFirstDate.getUTCMonth() !== oLastDate.getUTCMonth()){
			if (oFirstDate.getUTCFullYear() !== oLastDate.getUTCFullYear()) {
				sResult = DateFormat.getDateInstance({style: "long"}).format(oFirstDate.oDate);
			} else {
				sResult = DateFormat.getDateInstance({pattern: "d MMMM"}).format(oFirstDate.oDate);
			}
		} else {
			sResult = DateFormat.getDateInstance({pattern: "d"}).format(oFirstDate.oDate);
		}

		sResult += " - " + DateFormat.getDateInstance({style: "long"}).format(oLastDate.oDate);

		return sResult;
	};

	OnePersonHeader.prototype._handlePickerDateSelect = function () {
		var oSelectedDate = this.oPicker.getSelectedDates()[0].getStartDate(),
			oDates,
			sPickerText;

		this.setSelectedDate(oSelectedDate);
		this.oSelectedUTCDate = new UniversalDate(UniversalDate.UTC(oSelectedDate.getFullYear(), oSelectedDate.getMonth(), oSelectedDate.getDate()));
		oDates = this._getFirstAndLastWeekDate(this.oSelectedUTCDate);
		sPickerText = this._formatPickerText(oDates.firstDate, oDates.lastDate);
		this.setPickerText(sPickerText);

		this._setSelectedDateToCalendar();
		this._closeCalendarPicker();
	};

	OnePersonHeader.prototype._getFirstAndLastWeekDate = function(oDate) {
		var oWeek = UniversalDate.getWeekByDate(oDate.getCalendarType(), oDate.getUTCFullYear(), oDate.getUTCMonth(), oDate.getUTCDate()),
			oFirstWeekDateNumbers = UniversalDate.getFirstDateOfWeek(this.oSelectedUTCDate.getCalendarType(), oWeek.year, oWeek.week),
			oFirstWeekDate = new UniversalDate(UniversalDate.UTC(oFirstWeekDateNumbers.year, oFirstWeekDateNumbers.month, oFirstWeekDateNumbers.day)),
			oLastWeekDate = new UniversalDate(oFirstWeekDate.getTime());

		oLastWeekDate.setDate(oLastWeekDate.getDate() + 6);

		return {
			firstDate: oFirstWeekDate,
			lastDate: oLastWeekDate
		};
	};

	OnePersonHeader.prototype._setSelectedDateToCalendar = function() {
		var oSelectedDate = this.oSelectedUTCDate,
			aDates = this._getFirstAndLastWeekDate(oSelectedDate),
			oFirstWeekDate = aDates.firstDate,
			oLastWeekDate = aDates.lastDate,
			oSelectedRange = new sap.ui.unified.DateRange({
				startDate: oFirstWeekDate.oDate,
				endDate: oLastWeekDate.oDate
			});

		this.oPicker.removeAllSelectedDates();
		this.oPicker.addSelectedDate(oSelectedRange);
	};

	OnePersonHeader.prototype._fireArrowsLogic = function (bNextLogic) {
		var iNumberToAdd = bNextLogic ? 7 : -7,
			oDates,
			sPickerText;

		if (this.getSelectedDate()) {
			this.getSelectedDate().setDate(this.getSelectedDate().getDate() + iNumberToAdd);
		}
		this.oSelectedUTCDate.setDate(this.oSelectedUTCDate.getDate() + iNumberToAdd);
		oDates = this._getFirstAndLastWeekDate(this.oSelectedUTCDate);
		sPickerText = this._formatPickerText(oDates.firstDate, oDates.lastDate);
		this.setPickerText(sPickerText);
		if (this.oPicker) {
			this._setSelectedDateToCalendar();
		}
	};

	OnePersonHeader.prototype._openPickerPopup = function(oPicker){

		if (!this._oPopup) {
			this._oPopup = new Popup();
			this._oPopup.setAutoClose(true);
			this._oPopup.setAutoCloseAreas([this.getDomRef()]);
			this._oPopup.setDurations(0, 0); // no animations
			this._oPopup._oCalendar = this;
			this._oPopup.attachClosed(function() {
				this._closeCalendarPicker(true);
			}, this);
		}

		this._oPopup.setContent(oPicker);

		var oLink = this.oPickerButton;
		var eDock = sap.ui.core.Popup.Dock;
		this._oPopup.open(0, eDock.CenterTop, eDock.CenterTop, oLink, null, "flipfit", true);

	};

	OnePersonHeader.prototype._closeCalendarPicker = function() {
		if (this._oPopup && this._oPopup.isOpen()) {
			this._oPopup.close();
		}
	};

	OnePersonHeader.prototype._getActionsToolbar = function () {
		return this.getAggregation("actionsToolbar");
	};

	OnePersonHeader.prototype.exit = function() {

		Control.prototype.exit.apply(this, arguments);

		this.oSelectedUTCDate.destroy();

	};

	return OnePersonHeader;

});