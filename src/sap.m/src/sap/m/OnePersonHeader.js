/*!
 * ${copyright}
 */

// Provides control sap.m.OnePersonHeader.
sap.ui.define([
	'jquery.sap.global',
	'sap/ui/core/Control',
	'./Toolbar',
	'./OverflowToolbar',
	'./ToolbarDesign',
	'./Button',
	'sap/ui/unified/Calendar',
	'sap/ui/unified/DateRange',
	'sap/ui/core/format/DateFormat',
	'sap/ui/core/date/UniversalDate',
	'sap/ui/core/Popup',
	'sap/ui/core/IconPool',
	'sap/ui/core/LocaleData'
],
function(
	jQuery,
	Control,
	Toolbar,
	OverflowToolbar,
	ToolbarDesign,
	Button,
	Calendar,
	DateRange,
	DateFormat,
	UniversalDate,
	Popup,
	IconPool,
	LocaleData
) {
	"use strict";

	/**
	 * Constructor for a new <code>OnePersonHeader</code>.
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

			startDate: { type : "object", group : "Data" },

			pickerText : { type : "string", group : "Data" }

		},

		aggregations : {

			actions : {
				type : "sap.ui.core.Control",
				multiple: true,
				singularName: "action",
				forwarding: {
					getter: "_getActionsToolbar",
					aggregation: "content"
				}
			},

			actionsToolbar : { type: "sap.m.OverflowToolbar", multiple: false, visibility : "hidden" },

			navigationToolbar : { type: "sap.m.Toolbar", multiple: false, visibility : "hidden" },

			picker : { type : "sap.ui.unified.Calendar", multiple : false, visibility : "hidden" }
		},

		events : {

			pressPrevious: {},

			pressToday: {},

			pressNext: {},

			dateSelect: {}
		}

	}});

	OnePersonHeader.prototype.init = function() {

		var sOPHId = this.getId(),
			sNavToolbarId = sOPHId + "-NavToolbar",
			oDates,
			oDateNow = new Date(),
			oPrevBtn,
			oTodayBtn,
			oNextBtn;

		this.oStartUTCDate = new UniversalDate(UniversalDate.UTC(oDateNow.getFullYear(), oDateNow.getMonth(), oDateNow.getDate()));
		oDates = this._getFirstAndLastWeekDate(this.oStartUTCDate);

		this.setAggregation("actionsToolbar", new OverflowToolbar(sOPHId + "-ActionsToolbar", {
			design: ToolbarDesign.Transparent
		}));

		oPrevBtn = new Button(sNavToolbarId + "-PrevBtn", {
			icon: IconPool.getIconURI('slim-arrow-left'),
			press: function () {
				this.firePressPrevious();
			}.bind(this)
		});
		oTodayBtn = new Button(sNavToolbarId + "-TodayBtn", {
			text: "Today",
			press: function () {
				this.firePressToday();
			}.bind(this)
		});
		oNextBtn = new Button(sNavToolbarId + "-NextBtn", {
			icon: IconPool.getIconURI('slim-arrow-right'),
			press: function () {
				this.firePressNext();
			}.bind(this)
		});
		this.oPickerBtn = new Button(sNavToolbarId + "-PickerBtn", {
			text: this.getPickerText() || this._formatPickerText(oDates.firstDate, oDates.lastDate),
			press: function () {
				if (!this.oPicker) {
					this.oPicker = new Calendar(sOPHId + "-Cal");
					this.oPicker.attachEvent("select", this._handlePickerDateSelect, this);
					this.setAggregation("picker", this.oPicker);
				}

				this.oPicker.displayDate(this.oStartUTCDate.oDate);
				this._setSelectedDateToCalendar();
				this._openPickerPopup(this.oPicker);
			}.bind(this)
		});

		this.setAggregation("navigationToolbar", new Toolbar(sNavToolbarId, {
			design: ToolbarDesign.Transparent,
			content: [
				oPrevBtn,
				oTodayBtn,
				oNextBtn,
				this.oPickerBtn
			]
		}));

	};

	OnePersonHeader.prototype.onBeforeRendering = function () {
		if (!this.getActions().length) {
			this.getAggregation("actionsToolbar").setProperty("visible", false, true);
		}
	};

	OnePersonHeader.prototype.setStartDate = function (oDate) {
		var oUniDate = new UniversalDate(UniversalDate.UTC(oDate.getFullYear(), oDate.getMonth(), oDate.getDate())),
			oDates = this._getFirstAndLastWeekDate(oUniDate),
			sPickerText;

		this.setProperty("startDate", oDates.firstDate.oDate, true);
		this.oStartUTCDate = oUniDate;
		sPickerText = this._formatPickerText(oDates.firstDate, oDates.lastDate);
		this.setPickerText(sPickerText);

		return this;
	};

	OnePersonHeader.prototype.setPickerText = function (sText) {
		this.setProperty("pickerText", sText, true);
		this.oPickerBtn.setText(sText);

		return this;
	};

	OnePersonHeader.prototype._formatPickerText = function (oFirstDate, oLastDate) {
		// TODO: maybe move to OnePerson class

		var sResult;

		// if (oFirstDate.getUTCMonth() !== oLastDate.getUTCMonth()){
		// 	if (oFirstDate.getUTCFullYear() !== oLastDate.getUTCFullYear()) {
		// 		sResult = DateFormat.getDateInstance({style: "long"}).format(oFirstDate.oDate);
		// 	} else {
		// 		sResult = DateFormat.getDateInstance({pattern: "d MMMM"}).format(oFirstDate.oDate);
		// 	}
		// } else {
		// 	sResult = DateFormat.getDateInstance({pattern: "d"}).format(oFirstDate.oDate);
		// }

		sResult = DateFormat.getDateInstance({style: "long"}).format(oFirstDate.oDate) + " - " + DateFormat.getDateInstance({style: "long"}).format(oLastDate.oDate);

		return sResult;
	};

	OnePersonHeader.prototype._handlePickerDateSelect = function () {
		var oSelectedDate = this.oPicker.getSelectedDates()[0].getStartDate(),
			oSelectedUTCDate = new UniversalDate(UniversalDate.UTC(oSelectedDate.getFullYear(), oSelectedDate.getMonth(), oSelectedDate.getDate())),
			oDates = this._getFirstAndLastWeekDate(oSelectedUTCDate),
			sPickerText;

		this.setStartDate(oDates.firstDate.oDate);
		this.oStartUTCDate = new UniversalDate(UniversalDate.UTC(oDates.firstDate.getFullYear(), oDates.firstDate.getMonth(), oDates.firstDate.getDate()));
		sPickerText = this._formatPickerText(oDates.firstDate, oDates.lastDate);
		this.setPickerText(sPickerText);

		this._setSelectedDateToCalendar();
		this._closeCalendarPicker();
		this.fireDateSelect();// TODO: pass the selected date
	};

	OnePersonHeader.prototype._getFirstAndLastWeekDate = function(oDate) {
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

	OnePersonHeader.prototype._setSelectedDateToCalendar = function() {
		var oStartDate = this.oStartUTCDate,
			aDates = this._getFirstAndLastWeekDate(oStartDate),
			oFirstWeekDate = aDates.firstDate,
			oLastWeekDate = aDates.lastDate,
			oSelectedRange = new DateRange({
				startDate: oFirstWeekDate.oDate,
				endDate: oLastWeekDate.oDate
			});

		this.oPicker.removeAllSelectedDates();
		this.oPicker.addSelectedDate(oSelectedRange);
	};

	OnePersonHeader.prototype._openPickerPopup = function(oPicker){

		var eDock;

		if (!this._oPopup) {
			this._oPopup = new Popup();
			this._oPopup.setAutoClose(true);
			this._oPopup.setAutoCloseAreas([this.getDomRef()]);
			this._oPopup.setDurations(0, 0); // no animations
			this._oPopup._oCalendar = this;
			this._oPopup.attachClosed(function() {
				this._closeCalendarPicker(true);
			}, this);
			this._oPopup.onsapescape = function(oEvent) {
				this._oCalendar.onsapescape(oEvent);
			};
		}

		this._oPopup.setContent(oPicker);

		eDock = Popup.Dock;
		this._oPopup.open(0, eDock.CenterTop, eDock.CenterTop, this.oPickerBtn, null, "flipfit", true);

	};

	OnePersonHeader.prototype.onsapescape = function(){
		if (this._oPopup) {
			this._closeCalendarPicker.call(this);
			jQuery.sap.focus(this.oPickerBtn.getDomRef());
		}
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
		if (this.oStartUTCDate) {
			this.oStartUTCDate.destroy();
			this.oStartUTCDate = null;
		}
		if (this.oPickerBtn) {
			this.oPickerBtn = null;
		}
	};

	return OnePersonHeader;

});