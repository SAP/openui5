/*!
 * ${copyright}
 */

// Provides control sap.m.SinglePlanningCalendar.
sap.ui.define([
	'./PlanningCalendarHeader',
	'./SegmentedButtonItem',
	"./SinglePlanningCalendarWeekView",
	'./SinglePlanningCalendarGrid',
	'./SinglePlanningCalendarRenderer',
	'sap/base/Log',
	'sap/ui/core/Control',
	'sap/ui/core/Locale',
	'sap/ui/core/LocaleData',
	'sap/ui/core/date/UniversalDate',
	'sap/ui/core/format/DateFormat',
	'sap/ui/unified/calendar/CalendarDate',
	'sap/ui/unified/calendar/CalendarUtils',
	'sap/ui/unified/DateRange'
],
function(
	PlanningCalendarHeader,
	SegmentedButtonItem,
	SinglePlanningCalendarWeekView,
	SinglePlanningCalendarGrid,
	SinglePlanningCalendarRenderer,
	Log,
	Control,
	Locale,
	LocaleData,
	UniversalDate,
	DateFormat,
	CalendarDate,
	CalendarUtils,
	DateRange
) {
	"use strict";

	/**
	 * Constructor for a new <code>SinglePlanningCalendar</code>.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * Disclaimer: This control is in a beta state - incompatible API changes may be done before its official public
	 * release. Use at your own discretion.
	 *
	 * <h3>Overview</h3>
	 *
	 * Displays a calendar of a single entity (such as person, resource) for the selected time interval.
	 *
	 * <b>Note:</b> The <code>SinglePlanningCalendar</code> uses parts of the <code>sap.ui.unified</code> library.
	 * This library will be loaded after the <code>SinglePlanningCalendar</code>, if it wasn't previously loaded.
	 * This could lead to a waiting time when a <code>SinglePlanningCalendar</code> is used for the first time.
	 * To prevent this, apps using the <code>SinglePlanningCalendar</code> must also load the
	 * <code>sap.ui.unified</code> library.
	 *
	 * <h3>Usage</h3>
	 *
	 * The <code>SinglePlanningCalendar</code> has the following structure:
	 *
	 * <ul>
	 *     <li>A <code>PlanningCalendarHeader</code> at the top. It contains the <code>title</code> set from the
	 *     corresponding property, the <code>SegmentedButton</code>, which facilitates navigation through the views,
	 *     controls, passed to the <code>actions</code> aggregation and the navigation, assisting the user in
	 *     choosing the desired time period. The views can be configured and passed through the <code>views</code>
	 *     aggregation.</li>
	 *     <li>A <code>SinglePlanningCalendarGrid</code>, which displays the blockers and the appointments, set to the
	 *     visual time range. To display blockers, see {@link #property:fullDay} of the
	 *     <code>sap.ui.unified.CalendarAppointment</code>.</li>
	 * </ul>
	 *
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @since 1.61
	 * @alias sap.m.SinglePlanningCalendar
	 */

	var SinglePlanningCalendar = Control.extend("sap.m.SinglePlanningCalendar", /** @lends sap.m.SinglePlanningCalendar.prototype */ { metadata : {

		library : "sap.m",

		properties : {

			/**
			 * Determines the title of the <code>SinglePlanningCalendar</code>.
			 */
			title: { type : "string", group : "Appearance", defaultValue : "" },

			/**
			 * Determines the start date of the grid, as a JavaScript date object. It is considered as a local date.
			 * The time part will be ignored. The current date is used as default.
			 */
			startDate: { type : "object", group : "Data" }

		},

		aggregations : {

			/**
			 * The controls to be passed to the toolbar.
			 */
			actions : {
				type : "sap.ui.core.Control",
				multiple: true,
				singularName: "action",
				forwarding: {
					getter: "_getHeader",
					aggregation: "actions"
				}
			},

			/**
			 * The appointments to be displayed in the grid. Appointments outside the visible time frame are not rendered.
			 * Appointments, longer than a day, will be displayed in all of the affected days.
			 * To display blockers, see {@link #property:fullDay} of the <code>sap.m.CalendarAppointment</code>.
			 */
			appointments : {
				type: "sap.m.CalendarAppointment",
				multiple: true,
				singularName: "appointment",
				forwarding: {
					getter: "_getGrid",
					aggregation: "appointments"
				}
			},

			/**
			 * Views of the <code>SinglePlanningCalendar</code>.
			 *
			 * <b>Note:</b> If not set, the Week view is available.
			 */
			views : {type : "sap.m.SinglePlanningCalendarView", multiple : true, singularName : "view"},

			/**
			 * Hidden, for internal use only.
			 * The header part of the <code>SinglePlanningCalendar</code>.
			 *
			 * @private
			 */
			_header : { type : "sap.m.PlanningCalendarHeader", multiple : false, visibility : "hidden" },

			/**
			 * Hidden, for internal use only.
			 * The gid part of the <code>SinglePlanningCalendar</code>.
			 *
			 * @private
			 */
			_grid : { type : "sap.m.SinglePlanningCalendarGrid", multiple : false, visibility : "hidden" }

		},

		associations: {

			/**
			 * Corresponds to the currently selected view.
			 */
			selectedView: { type: "sap.m.SinglePlanningCalendarView", multiple: false }

		},

		events: {

			/**
			 * Fired if an appointment is selected.
			 */
			appointmentSelect: {
				parameters: {

					/**
					 * The selected appointment.
					 */
					appointment: {type: "sap.m.CalendarAppointment"}

				}
			},

			/**
			 * Fired if a date is selected in the calendar header.
			 */
			headerDateSelect: {
				parameters: {

					/**
					 * Date of the selected header, as a JavaScript date object. It is considered as a local date.
					 */
					date: {type: "object"}

				}
			},

			/**
			 * <code>startDate</code> is changed while navigating in the <code>SinglePlanningCalendar</code>.
			 */
			startDateChange: {
				parameters: {

					/**
					 * The new start date, as a JavaScript date object. It is considered as a local date.
					 */
					date: {type: "object"}

				}
			}
		}

	}});

	SinglePlanningCalendar.prototype.init = function() {
		var sOPCId = this.getId();

		this._oDefaultView = new SinglePlanningCalendarWeekView({
			key: "DEFAULT_INNER_WEEK_VIEW_CREATED_FROM_CONTROL",
			title: ""
		});
		this.setAssociation("selectedView", this._oDefaultView);

		this.setAggregation("_header", new PlanningCalendarHeader(sOPCId + "-Header"));
		this.setAggregation("_grid", new SinglePlanningCalendarGrid(sOPCId + "-Grid"));

		this._attachHeaderEvents();
		this._attachGridEvents();
		this.setStartDate(new Date());
	};

	SinglePlanningCalendar.prototype.exit = function () {
		if (this._oDefaultView) {
			this._oDefaultView.destroy();
			this._oDefaultView = null;
		}
	};

	SinglePlanningCalendar.prototype.setTitle = function (sTitle) {
		this._getHeader().setTitle(sTitle);

		return this.setProperty("title", sTitle, true);
	};

	SinglePlanningCalendar.prototype.setStartDate = function (oDate) {
		this.setProperty("startDate", oDate, true /*Suppressing because _alignColumns will do the rendering.*/ );
		this._alignColumns();

		return this;
	};

	SinglePlanningCalendar.prototype.addView = function (oView) {
		var oViewsButton;

		if (!oView) {
			return this;
		}

		if (this._isViewKeyExisting(oView.getKey())) {
			Log.error("There is an existing view with the same key.", this);
			return;
		}

		this.addAggregation("views", oView);

		oViewsButton = this._getHeader()._getOrCreateViewSwitch();
		oViewsButton.addItem(new SegmentedButtonItem({
			key: oView.getKey(),
			text: oView.getTitle()
		}));
		if (this._getSelectedView().getKey() === this._oDefaultView.getKey()) {
			this.setAssociation("selectedView", oView);
		}
		this._alignView();

		return this;
	};

	SinglePlanningCalendar.prototype.insertView = function (oView, iPos) {
		var oViewsButton;

		if (!oView) {
			return this;
		}

		if (this._isViewKeyExisting(oView.getKey())) {
			Log.error("There is an existing view with the same key.", this);
			return;
		}

		this.insertAggregation("views", oView, iPos);

		oViewsButton = this._getHeader()._getOrCreateViewSwitch();
		oViewsButton.insertItem(new SegmentedButtonItem({
			key: oView.getKey(),
			text: oView.getTitle()
		}), iPos);
		if (this._getSelectedView().getKey() === this._oDefaultView.getKey()) {
			this.setAssociation("selectedView", oView);
		}
		this._alignView();

		return this;
	};

	SinglePlanningCalendar.prototype.removeView = function (oView) {

		if (!oView) {
			return this;
		}

		var oViewsButton = this._getHeader()._getOrCreateViewSwitch(),
			oViewsButtonItems = oViewsButton.getItems(),
			oCurrentlySelectedView = this._getSelectedView(),
			oViewToRemoveKey = oView.getKey(),
			oCurrentItem,
			i;

		for (i = 0; i < oViewsButtonItems.length; i++) {
			oCurrentItem = oViewsButtonItems[i];
			if (oCurrentItem.getKey() === oViewToRemoveKey) {
				oViewsButton.removeItem(oCurrentItem);
				break;
			}
		}

		this.removeAggregation("views", oView);

		// if the removed view is the selected one, either set the first view as selected
		// or if all views are removed point to the _oDefaultView
		if (oViewToRemoveKey === oCurrentlySelectedView.getKey()) {
			this.setAssociation("selectedView", this.getViews()[0] || this._oDefaultView);
		}

		this._alignView();

		return this;
	};

	SinglePlanningCalendar.prototype.removeAllViews = function () {
		var oViewsButton = this._getHeader()._getOrCreateViewSwitch();

		oViewsButton.removeAllItems();
		this.setAssociation("selectedView", this._oDefaultView);
		this._alignView();

		return this.removeAllAggregation("views");
	};

	SinglePlanningCalendar.prototype.destroyViews = function () {
		var oViewsButton = this._getHeader()._getOrCreateViewSwitch();

		oViewsButton.destroyItems();
		this.setAssociation("selectedView", this._oDefaultView);
		this._alignView();

		return this.destroyAggregation("views");
	};

	/**
	 * Switches the visibility of the SegmentedButton in the _header and aligns the columns in the grid after an
	 * operation (add, insert, remove, removeAll, destroy) with the views is performed.
	 *
	 * @returns {object} this for method chaining
	 * @private
	 */
	SinglePlanningCalendar.prototype._alignView = function () {
		this._switchViewButtonVisibility();
		this._alignColumns();

		return this;
	};

	/**
	 * Checks whether a view with given key already exists in the views aggregation.
	 *
	 * @param {string} sKey the key to be checked
	 * @returns {boolean} true if view with given key exists
	 * @private
	 */
	SinglePlanningCalendar.prototype._isViewKeyExisting = function (sKey) {
		return this.getViews().some(function (oView) {
			return oView.getKey() === sKey;
		});
	};

	/**
	 * Getter for the associated as selectedView view.
	 * @returns {object} The currently selected view object
	 * @private
	 */
	SinglePlanningCalendar.prototype._getSelectedView = function () {
		var oSelectedView,
			aViews = this.getViews(),
			sCurrentViewKey = sap.ui.getCore().byId(this.getAssociation("selectedView")).getKey();

		for (var i = 0; i < aViews.length; i++) {
			if (sCurrentViewKey === aViews[i].getKey()) {
				oSelectedView = aViews[i];
				break;
			}
		}

		return oSelectedView || this._oDefaultView;
	};

	/**
	 * Switches the visibility of the button, controlling the views.
	 * If the SinglePlanningCalendar has only one view added to its view aggregation, the button is not visible.
	 * Otherwise, it is displayed in the _header.
	 *
	 * @returns {object} this for method chaining
	 * @private
	 */
	SinglePlanningCalendar.prototype._switchViewButtonVisibility = function () {
		var oSegmentedButton = this._getHeader()._getOrCreateViewSwitch(),
			bVisible = oSegmentedButton.getItems().length > 1;

		oSegmentedButton.setProperty("visible", bVisible);

		return this;
	};

	/**
	 * Attaches handlers to the events in the _header aggregation.
	 *
	 * @returns {object} this for method chaining
	 * @private
	 */
	SinglePlanningCalendar.prototype._attachHeaderEvents = function () {
		var oHeader = this._getHeader();

		oHeader.attachEvent("pressPrevious", this._handlePressArrow, this);
		oHeader.attachEvent("pressToday", this._handlePressToday, this);
		oHeader.attachEvent("pressNext", this._handlePressArrow, this);
		oHeader.attachEvent("dateSelect", this._handleCalendarPickerDateSelect, this);
		oHeader._getOrCreateViewSwitch().attachEvent("selectionChange", this._handleViewSwitchChange, this);

		return this;
	};

	/**
	 * Attaches handlers to the events in the _grid aggregation.
	 *
	 * @returns {object} this for method chaining
	 * @private
	 */
	SinglePlanningCalendar.prototype._attachGridEvents = function () {
		var oGrid = this._getGrid();

		oGrid._getColumnHeaders().attachEvent("select", function (oEvent) {
			this.fireHeaderDateSelect({
				date: oEvent.getSource().getDate()
			});
		}, this);

		oGrid.attachEvent("appointmentSelect", function (oEvent) {
			this.fireAppointmentSelect({
				appointment: oEvent.getParameter("appointment")
			});
		}, this);

		return this;
	};

	/**
	 * Handler for the pressPrevious and pressNext events in the _header aggregation.
	 * @param {Date} oEvent The triggered event
	 * @private
	 */
	SinglePlanningCalendar.prototype._handlePressArrow = function (oEvent) {
		this._applyArrowsLogic(oEvent.getId() === "pressPrevious");
	};

	/**
	 * Handler for the pressToday event in the _header aggregation.
	 * @private
	 */
	SinglePlanningCalendar.prototype._handlePressToday = function () {
		var oStartDate = this._getSelectedView().calculateStartDate(new Date());

		this.setStartDate(oStartDate);
		this.fireStartDateChange({
			date: oStartDate
		});
	};

	/**
	 * Handler for the selectionChange event in the _header aggregation.
	 * @param {Date} oEvent The triggered event
	 * @private
	 */
	SinglePlanningCalendar.prototype._handleViewSwitchChange = function (oEvent) {
		this.setAssociation("selectedView", oEvent.getParameter("item"));
		this._alignColumns();
	};

	/**
	 * Handler for the dateSelect event in the _header aggregation.
	 * @private
	 */
	SinglePlanningCalendar.prototype._handleCalendarPickerDateSelect = function () {
		var oStartDate = this._getHeader().getStartDate();

		oStartDate = this._getSelectedView().calculateStartDate(new Date(oStartDate.getTime()));
		this.setStartDate(oStartDate);
		this.fireStartDateChange({
			date: oStartDate
		});
	};

	/**
	 * Updates the selection in the header's calendarPicker aggregation.
	 * @private
	 */
	SinglePlanningCalendar.prototype._updateCalendarPickerSelection = function() {
		var oRangeDates = this._getFirstAndLastRangeDate(),
			oSelectedRange;

		oSelectedRange = new DateRange({
			startDate: oRangeDates.oStartDate.toLocalJSDate(),
			endDate: oRangeDates.oEndDate.toLocalJSDate()
		});

		this._getHeader().getAggregation("_calendarPicker").removeAllSelectedDates();
		this._getHeader().getAggregation("_calendarPicker").addSelectedDate(oSelectedRange);
	};

	/**
	 * Creates and formats a string to be displayed in the picker button from the _header aggregation.
	 * If no oLastDate is passed, this means that the SinglePlanningCalendar is showing Day view, so the string contains
	 * info about the current date. Otherwise, the result string shows info about a date range.
	 * @returns {string} The concatenated string to displayed
	 * @private
	 */
	SinglePlanningCalendar.prototype._formatPickerText = function () {
		var oRangeDates = this._getFirstAndLastRangeDate(),
			oStartDate = oRangeDates.oStartDate.toLocalJSDate(),
			oEndDate = oRangeDates.oEndDate.toLocalJSDate(),
			oLongDateFormat = DateFormat.getDateInstance({style: "long"}),
			oResult = oLongDateFormat.format(oStartDate);

		if (oStartDate.getTime() !== oEndDate.getTime()) {
			oResult += " - " + oLongDateFormat.format(oEndDate);
		}

		return oResult;
	};

	/**
	 * Logic for moving the selected time range in the control via the navigation arrows.
	 * @param {boolean} bBackwards Whether the left arrow is pressed
	 * @private
	 */
	SinglePlanningCalendar.prototype._applyArrowsLogic = function (bBackwards) {
		var oCalStartDate = CalendarDate.fromLocalJSDate(this.getStartDate() || new Date()),
			iNumberToAdd = this._getSelectedView().getScrollEntityCount(),
			oStartDate;

		if (bBackwards) {
			iNumberToAdd *= -1;
		}

		oCalStartDate.setDate(oCalStartDate.getDate() + iNumberToAdd);
		oStartDate = oCalStartDate.toLocalJSDate();

		this.setStartDate(oStartDate);
		this.fireStartDateChange({
			date: oStartDate
		});
	};

	/**
	 * Calculates the first and the last date of the range to be displayed. The size of the range depends on the
	 * currently selected view.
	 * @returns {object} Two properties containing the first and the last date from the range
	 * @private
	 */
	SinglePlanningCalendar.prototype._getFirstAndLastRangeDate = function () {
		var oSelectedView = this._getSelectedView(),
			oStartDate = this._getHeader().getStartDate() || new Date(),
			iDaysToAdd = oSelectedView.getEntityCount() - 1,
			oCalViewStartDate,
			oCalViewEndDate;

		oCalViewStartDate = CalendarDate.fromLocalJSDate(oSelectedView.calculateStartDate(new Date(oStartDate.getTime())));
		oCalViewEndDate = new CalendarDate(oCalViewStartDate);
		oCalViewEndDate.setDate(oCalViewStartDate.getDate() + iDaysToAdd);

		return {
			oStartDate: oCalViewStartDate,
			oEndDate: oCalViewEndDate
		};
	};

	/**
	 * Responsible for aligning the columns due to startDate or view change.
	 * @private
	 */
	SinglePlanningCalendar.prototype._alignColumns = function () {
		var oHeader = this._getHeader(),
			oGrid = this._getGrid(),
			oView = this._getSelectedView(),
			oDate = this.getStartDate() || new Date(),
			oViewStartDate = oView.calculateStartDate(new Date(oDate.getTime())),
			oCalViewDate = CalendarDate.fromLocalJSDate(oViewStartDate);

		oHeader.setStartDate(oViewStartDate);
		oHeader.setPickerText(this._formatPickerText(oCalViewDate));
		this._updateCalendarPickerSelection();
		oGrid.setStartDate(oViewStartDate);
		oGrid._setColumns(oView.getEntityCount());

		this._setColumnHeaderVisibility();
	};

	/**
	 * Switches the visibility of the column headers in the _grid.
	 * If the selectedView association of the SinglePlanningCalendar is day view, the column headers are not visible.
	 * Otherwise, they are displayed in the _grid.
	 * @private
	 */
	SinglePlanningCalendar.prototype._setColumnHeaderVisibility = function () {
		var bVisible = !this._getSelectedView().isA("sap.m.SinglePlanningCalendarDayView");

		this._getGrid()._getColumnHeaders().setVisible(bVisible);
	};

	/**
	 * Getter for _header.
	 * @returns {object} The _header object
	 * @private
	 */
	SinglePlanningCalendar.prototype._getHeader = function () {
		return this.getAggregation("_header");
	};

	/**
	 * Getter for _grid.
	 * @returns {object} The _grid object
	 * @private
	 */
	SinglePlanningCalendar.prototype._getGrid = function () {
		return this.getAggregation("_grid");
	};

	return SinglePlanningCalendar;

});