/*!
 * ${copyright}
 */

//Provides control sap.m.PlanningCalendar.
sap.ui.define(['jquery.sap.global', 'sap/ui/core/Control', 'sap/ui/core/LocaleData', './PlanningCalendarRow',
		'./library', 'sap/ui/unified/library', 'sap/ui/unified/calendar/CalendarUtils', 'sap/ui/unified/calendar/CalendarDate',
		'sap/ui/unified/DateRange', 'sap/ui/unified/CalendarDateInterval', 'sap/ui/unified/CalendarWeekInterval',
		'sap/ui/unified/CalendarOneMonthInterval'],
	function (jQuery, Control, LocaleData, PlanningCalendarRow, library, unifiedLibrary, CalendarUtils, CalendarDate,
			  DateRange, CalendarDateInterval, CalendarWeekInterval, CalendarOneMonthInterval) {
		"use strict";

	/**
	 * Constructor for a new <code>PlanningCalendar</code>.
	 *
	 * @param {string} [sID] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * Displays rows with appointments for different entities (such as persons or teams) for the selected time interval.
	 *
	 * <h3>Overview</h3>
	 *
	 * You can use the <code>PlanningCalendar</code> to represent a calendar containing multiple rows with
	 * appointments, where each row represents a different person.
	 *
	 * You can configure different time-interval views that the user can switch between, such as hours or days, and even
	 * a whole week/month. The available navigation allows the user to select a specific interval using a picker, or
	 * move to the previous/next interval using arrows.
	 *
	 * <b>Note:</b> The <code>PlanningCalendar</code> uses parts of the <code>sap.ui.unified</code> library.
	 * This library will be loaded after the <code>PlanningCalendar</code>, if it wasn't loaded first.
	 * This could lead to a waiting time when a <code>PlanningCalendar</code> is used for the first time.
	 * To prevent this, apps that use the <code>PlanningCalendar</code> should also load the
	 * <code>sap.ui.unified</code> library.
	 *
	 * <h3>Usage</h3>
	 *
	 * The <code>PlanningCalendar</code> has the following structure from top to bottom:
	 *
	 * <ul>
	 * <li>A toolbar where you can add your own buttons or other controls using the <code>toolbarContent</code> aggregation.</li>
	 * <li>A header containing a drop-down menu for selecting the {@link sap.m.PlanningCalendarView PlanningCalendarViews},
	 * and navigation for moving through the intervals using arrows or selecting a specific interval with a picker.
	 * Custom views can be configured using the <code>views</code> aggregation. If not configured, the following set of default
	 * built-in views is available - Hours, Days, 1 Week, 1 Month, and Months. Setting a custom view(s) replaces the built-in ones.</li>
	 * <li>The rows of the <code>PlanningCalendar</code> that contain the the assigned appointments.
	 * They can be configured with the <code>rows</code> aggregation, which is of type
	 * {@link sap.m.PlanningCalendarRow PlanningCalendarRow}.</li>
	 * </ul>
	 *
	 * <h3>Responsive behavior</h3>
	 *
	 * You can define the number of displayed intervals based on the size of the <code>PlanningCalendar</code> using the
	 * {@link sap.m.PlanningCalendarView PlanningCalendarView}'s properties.
	 *
	 * @extends sap.ui.core.Control
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.34.0
	 * @alias sap.m.PlanningCalendar
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var PlanningCalendar = Control.extend("sap.m.PlanningCalendar", /** @lends sap.m.PlanningCalendar.prototype */ { metadata : {

		library : "sap.m",
		properties : {

			/**
			 * Determines the start date of the row, as a JavaScript date object. The current date is used as default.
			 */
			startDate : {type : "object", group : "Data"},

			/**
			 * Defines the key of the <code>PlanningCalendarView</code> used for the output.
			 *
			 * <b>Note:</b> The default value is set <code>Hour</code>. If you are using your own views, the keys of these
			 * views should be used instead.
			 */
			viewKey : {type : "string", group : "Appearance", defaultValue : sap.ui.unified.CalendarIntervalType.Hour},

			/**
			 * Determines whether only a single row can be selected.
			 */
			singleSelection : {type : "boolean", group : "Misc", defaultValue : true},

			/**
			 * Specifies the width of the <code>PlanningCalendar</code>.
			 */
			width : {type : "sap.ui.core.CSSSize", group : "Dimension", defaultValue : null},

			/**
			 * Specifies the height of the <code>PlanningCalendar</code>.
			 */
			height : {type : "sap.ui.core.CSSSize", group : "Dimension", defaultValue : null},

			/**
			 * Determines whether the assigned interval headers are displayed. You can assign them using the
			 * <code>intervalHeaders</code> aggregation of the {@link sap.m.PlanningCalendarRow PlanningCalendarRow}.
			 *
			 * <b>Note:</b> If you set both <code>showIntervalHeaders</code> and <code>showEmptyIntervalHeaders</code>
			 * properties to <code>true</code>, the space (at the top of the intervals) where the assigned interval
			 * headers appear, will remain visible even if no interval headers are assigned.
			 */
			showIntervalHeaders : {type : "boolean", group : "Appearance", defaultValue : true},

			/**
			 * Determines whether the space (at the top of the intervals), where the assigned interval headers appear, should remain
			 * visible even when no interval headers are present in the visible time frame. If set to <code>false</code>, this
			 * space would collapse/disappear when no interval headers are assigned.
			 *
			 * <b>Note:</b> This property takes effect, only if <code>showIntervalHeaders</code> is also set to <code>true</code>.
			 * @since 1.38.0
			 */
			showEmptyIntervalHeaders : {type : "boolean", group : "Appearance", defaultValue : true},

			/**
			 * Determines whether the column containing the headers of the {@link sap.m.PlanningCalendarRow PlanningCalendarRows}
			 * is displayed.
			 */
			showRowHeaders : {type : "boolean", group : "Appearance", defaultValue : true},

			/**
			 * Defines the text that is displayed when no {@link sap.m.PlanningCalendarRow PlanningCalendarRows} are assigned.
			 */
			noDataText : {type : "string", group : "Misc", defaultValue : null},

			/**
			 * Defines the mode in which the overlapping appointments are displayed.
			 *
			 * <b>Note:</b> This property takes effect, only if the <code>intervalType</code> of the current calendar view
			 * is set to <code>sap.ui.unified.CalendarIntervalType.Month</code>. On phone devices this property is ignored,
			 * and the default value is applied.
			 * @since 1.48.0
			 */
			groupAppointmentsMode : {type : "sap.ui.unified.GroupAppointmentsMode", group : "Appearance", defaultValue : sap.ui.unified.GroupAppointmentsMode.Collapsed},

			/**
			 * Determines whether the appointments that have only title without text are rendered with smaller height.
			 *
			 * <b>Note:</b> On phone devices this property is ignored, appointments are always rendered in full height
			 * to facilitate touching.
			 * @since 1.38.0
			 */
			appointmentsReducedHeight : {type : "boolean", group : "Appearance", defaultValue : false},

			/**
			 * Determines how the appointments are visualized depending on the used theme.
			 * @since 1.40.0
			 */
			appointmentsVisualization : {type : "sap.ui.unified.CalendarAppointmentVisualization", group : "Appearance", defaultValue : sap.ui.unified.CalendarAppointmentVisualization.Standard},

			/**
			 * Defines the minimum date that can be displayed and selected in the <code>PlanningCalendar</code>.
			 * This must be a JavaScript date object.
			 *
			 * <b>Note:</b> If the <code>minDate</code> is set to be after the current <code>maxDate</code>,
			 * the <code>maxDate</code> is set to the last date of the month in which the <code>minDate</code> belongs.
			 * @since 1.38.0
			 */
			minDate : {type : "object", group : "Misc", defaultValue : null},

			/**
			 * Defines the maximum date that can be displayed and selected in the <code>PlanningCalendar</code>.
			 * This must be a JavaScript date object.
			 *
			 * <b>Note:</b> If the <code>maxDate</code> is set to be before the current <code>minDate</code>,
			 * the <code>minDate</code> is set to the first date of the month in which the <code>maxDate</code> belongs.
			 * @since 1.38.0
			 */
			maxDate : {type : "object", group : "Misc", defaultValue : null}
		},
		aggregations : {

			/**
			 * Rows of the <code>PlanningCalendar</code>.
			 */
			rows : {type : "sap.m.PlanningCalendarRow", multiple : true, singularName : "row"},

			/**
			 * Views of the <code>PlanningCalendar</code>.
			 *
			 * <b>Note:</b> If not set, all the default views are available. Their keys are defined in
			 * {@link sap.ui.unified.CalendarIntervalType}.
			 */
			views : {type : "sap.m.PlanningCalendarView", multiple : true, singularName : "view"},

			/**
			 * Special days in the header calendar visualized as date range with a type.
			 *
			 * <b>Note:</b> If one day is assigned to more than one type, only the first type will be used.
			 */
			specialDates : {type : "sap.ui.unified.DateTypeRange", multiple : true, singularName : "specialDate"},

			/**
			 * The content of the toolbar.
			 */
			toolbarContent : {type : "sap.ui.core.Control", multiple : true, singularName : "toolbarContent"},

			/**
			 * Hidden, for internal use only.
			 */
			table : {type : "sap.m.Table", multiple : false, visibility : "hidden"}

		},
		associations: {

			/**
			 * Association to controls / IDs which label this control (see WAI-ARIA attribute aria-labelledby).
			 * @since 1.40.0
			 */
			ariaLabelledBy: { type: "sap.ui.core.Control", multiple: true, singularName: "ariaLabelledBy" },

			/**
			 * Association to the <code>CalendarLegend</code> explaining the colors of the <code>Appointments</code>.
			 *
			 * <b>Note:</b> The legend does not have to be rendered but must exist, and all required types must be assigned.
			 * @since 1.40.0
			 */
			legend: { type: "sap.ui.unified.CalendarLegend", multiple: false}
		},
		events : {

			/**
			 * Fired if an appointment is selected.
			 */
			appointmentSelect : {
				parameters : {
					/**
					 * The selected appointment.
					 */
					appointment : {type : "sap.ui.unified.CalendarAppointment"},

					/**
					 * The selected appointments in case a group appointment is selected.
					 */
					appointments : {type : "sap.ui.unified.CalendarAppointment[]"},

					/**
					 * If set, the appointment was selected using multiple selection (e.g. Shift + single mouse click),
					 * meaning more than the current appointment could be selected.
					 */
					multiSelect : {type : "boolean"}
				}
			},

			/**
			 * Fired if an interval was selected in the calendar header or in the row.
			 */
			intervalSelect : {
				parameters : {
					/**
					 * Start date of the selected interval, as a JavaScript date object.
					 */
					startDate : {type : "object"},

					/**
					 * Interval end date as a JavaScript date object.
					 * @since 1.38.0
					 */
					endDate : {type : "object"},

					/**
					 * If set, the selected interval is a subinterval.
					 * @since 1.38.0
					 */
					subInterval : {type : "boolean"},

					/**
					 * Row of the selected interval.
					 * @since 1.38.0
					 */
					row : {type : "sap.m.PlanningCalendarRow"}
				}
			},

			/**
			 * Fires when row selection is changed.
			 */
			rowSelectionChange : {
				parameters : {

					/**
					 * Array of rows whose selection has changed.
					 */
					rows : {type : "sap.m.PlanningCalendarRow[]"}
				}
			},

			/**
			 * <code>startDate</code> was changed while navigating in the <code>PlanningCalendar</code>.
			 * The new value can be obtained using the <code>sap.m.PlanningCalendar#getStartDate()</code> method.
			 */
			startDateChange : {},

			/**
			 * <code>viewKey</code> was changed by user interaction.
			 */
			viewChange : {},

			/**
			 * Fires when a row header is clicked.
			 * @since 1.46.0
			 */
			rowHeaderClick: {

				/**
				 * The row user clicked on.
				 */
				row : {type : "sap.m.PlanningCalendarRow"}
			}
		}
	}});

	//List of private properties controlling different intervals
	var INTERVAL_CTR_REFERENCES = ["_oTimeInterval", "_oDateInterval", "_oMonthInterval", "_oWeekInterval", "_oOneMonthInterval"],
	//Holds metadata of the different interval instances that should be created.
		INTERVAL_METADATA = {};

	INTERVAL_METADATA[sap.ui.unified.CalendarIntervalType.Day] = {
		sInstanceName: "_oDateInterval",
		sIdSuffix: "-DateInt",
		oClass: CalendarDateInterval
	};

	INTERVAL_METADATA[sap.ui.unified.CalendarIntervalType.Week] = {
		sInstanceName: "_oWeekInterval",
		sIdSuffix: "-WeekInt",
		oClass: CalendarWeekInterval
	};

	INTERVAL_METADATA[sap.ui.unified.CalendarIntervalType.OneMonth] = {
		sInstanceName: "_oOneMonthInterval",
		sIdSuffix: "-OneMonthInt",
		oClass: CalendarOneMonthInterval
	};

	//Defines the minimum screen width for the appointments column (it is a popin column)
	var APP_COLUMN_MIN_SCREEN_WIDTH = sap.m.ScreenSize.Desktop;

	var CalendarHeader = Control.extend("CalendarHeader", {

		metadata : {
			aggregations: {
				"toolbar"   : {type: "sap.m.Toolbar", multiple: false},
				"allCheckBox" : {type: "sap.m.CheckBox", multiple: false}
			}
		},

		renderer : function(oRm, oHeader) {

			oRm.write("<div");
			oRm.writeControlData(oHeader);
			oRm.addClass("sapMPlanCalHead");
			oRm.writeClasses();
			oRm.write(">");

			var oToolbar = oHeader.getToolbar();
			if (oToolbar) {
				oRm.renderControl(oToolbar);
			}

			var oAllCB = oHeader.getAllCheckBox();
			if (oAllCB) {
				oRm.renderControl(oAllCB);
			}

			oRm.write("</div>");
		}

	});

	PlanningCalendar.prototype.init = function(){

		this._iBreakPointTablet = sap.ui.Device.media._predefinedRangeSets[sap.ui.Device.media.RANGESETS.SAP_STANDARD_EXTENDED].points[0];
		this._iBreakPointDesktop = sap.ui.Device.media._predefinedRangeSets[sap.ui.Device.media.RANGESETS.SAP_STANDARD_EXTENDED].points[1];
		this._iBreakPointLargeDesktop = sap.ui.Device.media._predefinedRangeSets[sap.ui.Device.media.RANGESETS.SAP_STANDARD_EXTENDED].points[2];

		if (sap.ui.Device.system.phone || jQuery('html').hasClass("sapUiMedia-Std-Phone")) {
			this._iSize = 0;
			this._iSizeScreen = 0;
		}else if (sap.ui.Device.system.tablet || jQuery('html').hasClass("sapUiMedia-Std-Tablet")) {
			this._iSize = 1;
			this._iSizeScreen = 1;
		}else {
			this._iSize = 2;
			this._iSizeScreen = 2;
		}

		this._oRB = sap.ui.getCore().getLibraryResourceBundle("sap.m");

		var sId = this.getId();
		this._oIntervalTypeSelect = new sap.m.Select(sId + "-IntType", {maxWidth: "15rem", ariaLabelledBy: sId + "-SelDescr"});
		this._oIntervalTypeSelect.attachEvent("change", _changeIntervalType, this);

		this._oTodayButton = new sap.m.Button(sId + "-Today", {
			text: this._oRB.getText("PLANNINGCALENDAR_TODAY"),
			type: sap.m.ButtonType.Transparent
		});
		this._oTodayButton.attachEvent("press", this._handleTodayPress, this);

		this._oHeaderToolbar = new sap.m.Toolbar(sId + "-HeaderToolbar", {
			design: sap.m.ToolbarDesign.Transparent,
			content: [this._oIntervalTypeSelect, this._oTodayButton]
		});

		this._oCalendarHeader = new CalendarHeader(sId + "-CalHead", {
			toolbar: this._oHeaderToolbar
		});

		this._oInfoToolbar = new sap.m.Toolbar(sId + "-InfoToolbar", {
			height: "auto",
			design: sap.m.ToolbarDesign.Transparent,
			content: [this._oCalendarHeader, this._oTimeInterval]
		});

		var oTable = new sap.m.Table(sId + "-Table", {
			infoToolbar: this._oInfoToolbar,
			mode: sap.m.ListMode.SingleSelectMaster,
			columns: [ new sap.m.Column({
					styleClass: "sapMPlanCalRowHead"
				}),
				new sap.m.Column({
					width: "80%",
					styleClass: "sapMPlanCalAppRow",
					minScreenWidth: APP_COLUMN_MIN_SCREEN_WIDTH,
					demandPopin: true
				})
			],
			ariaLabelledBy: sId + "-Descr"
		});
		oTable.attachEvent("selectionChange", _handleTableSelectionChange, this);

		oTable.addDelegate({
			onBeforeRendering: function () {
				if (this._rowHeaderClickEvent) {
					this._rowHeaderClickEvent.off();
				}
			},
			onAfterRendering: function () {
				this._rowHeaderClickEvent = oTable.$().find(".sapMPlanCalRowHead > div.sapMLIB").click(function (oEvent) {
					var oRowHeader = jQuery(oEvent.currentTarget).control(0),
						oRow = sap.ui.getCore().byId(oRowHeader.getAssociation("parentRow"));

					this.fireRowHeaderClick({row: oRow});
				}.bind(this));
			}
		}, false, this);

		this.setAggregation("table", oTable, true);

		this.setStartDate(new Date());

		this._resizeProxy = jQuery.proxy(_handleResize, this);

	};

	PlanningCalendar.prototype.exit = function(){

		if (this._sResizeListener) {
			sap.ui.core.ResizeHandler.deregister(this._sResizeListener);
			this._sResizeListener = undefined;
		}

		if (this._sUpdateCurrentTime) {
			jQuery.sap.clearDelayedCall(this._sUpdateCurrentTime);
			this._sUpdateCurrentTime = undefined;
		}

		// remove ColumnListItems from table to not destroy them with table but from parent PlanningCalendarRow
		var oTable = this.getAggregation("table");
		oTable.removeAllItems();

		// destroy also currently not used controls
		INTERVAL_CTR_REFERENCES.forEach(function (sControlRef) {
			if (this[sControlRef]) {
				this[sControlRef]._oPlanningCalendar = undefined;
				this[sControlRef].destroy();
				this[sControlRef] = undefined;
			}
		}, this);

		if (this._aViews) {
			for (var i = 0; i < this._aViews.length; i++) {
				this._aViews[i].destroy();
			}
		}

		if (this._oSelectAllCheckBox) {
			this._oSelectAllCheckBox.destroy();
		}

		if (this.getToolbarContent().length == 0 && this._oToolbar) {
			this._oToolbar.destroy();
			this._oToolbar = undefined;
		}

		// Remove event listener for rowHeaderClick event
		if (this._rowHeaderClickEvent) {
			this._rowHeaderClickEvent.off();
			this._rowHeaderClickEvent = null;
		}
	};

	PlanningCalendar.prototype.onBeforeRendering = function(){

		this._bBeforeRendering = true;

		if ((!this._oTimeInterval && !this._oDateInterval && !this._oMonthInterval && !this._oWeekInterval && !this._oOneMonthInterval) || this._bCheckView) {
			// init intervalType settings if default is used
			this.setViewKey(this.getViewKey());
			this._bCheckView = undefined;
		}

		_updateSelectItems.call(this);

		if (this._sUpdateCurrentTime) {
			jQuery.sap.clearDelayedCall(this._sUpdateCurrentTime);
			this._sUpdateCurrentTime = undefined;
		}

		this._updateTodayButtonState();

		this._bBeforeRendering = undefined;

	};

	/**
	 * Handles the enabled/disabled state of the Today button
	 * based on the visibility of the current date.
	 * @private
	 */
	PlanningCalendar.prototype._updateTodayButtonState = function() {
		if (this._oTodayButton) {
			this._oTodayButton.setEnabled(!this._dateMatchesVisibleRange(new Date(), this.getViewKey()));
		}
	};

	/**
	 * Verifies if the given date matches the range of currently visible intervals,
	 * based on the visibility of the current date.
	 * @param {Date} oDateTime
	 * @private
	 */
	PlanningCalendar.prototype._dateMatchesVisibleRange = function(oDateTime, sViewKey) {
		var oView = this._getView(sViewKey, !this._bBeforeRendering);

		if (!oView) {
			return false;
		}

		var sIntervalType = oView.getIntervalType(),
			oIntervalMetadata = INTERVAL_METADATA[sIntervalType],
			oInterval = oIntervalMetadata ? this[oIntervalMetadata.sInstanceName] : null,
			bResult = false;

		if (oInterval && oInterval._dateMatchesVisibleRange) {
			bResult = oInterval._dateMatchesVisibleRange(oDateTime);
		}

		return bResult;
	};

	PlanningCalendar.prototype.onAfterRendering = function(oEvent){

		// check if size is right and adopt it if necessary
		oEvent.size = {width: this.getDomRef().offsetWidth};
		_handleResize.call(this, oEvent, true);

		if (!this._sResizeListener) {
			this._sResizeListener = sap.ui.core.ResizeHandler.register(this, this._resizeProxy);
		}

		this._updateCurrentTimeVisualization(false); // CalendarRow sets visualization onAfterRendering

	};

	/**
	 * Sets the given date as start date.
	 * Depending on the current view the start date may be adjusted (for example, the week view shows always the first weekday
	 * of the same week as the given date).
	 * @param {Date} oStartDate the date to set as <code>sap.m.PlanningCalendar</code> <code>startDate</code>. May be changed(adjusted) if
	 * property <code>startDate</code> is adjusted. See remark about week view above.
	 * @returns {sap.m.PlanningCalendar}
	*/
	PlanningCalendar.prototype.setStartDate = function(oStartDate){
		var oFirstDateOfWeek,
			oFirstDateOfMonth;

		if (!oStartDate) {
			//set default value
			oStartDate = new Date();
		} else {
			CalendarUtils._checkJSDateObject(oStartDate);
		}

		if (this.getViewKey() ===  sap.ui.unified.CalendarIntervalType.Week) {
			/* Calculate the first week date for the given oStartDate. Have in mind that the oStartDate is the date that
			 * the user sees in the UI, thus - local one. As CalendarUtils.getFirstDateOfWeek works with UTC dates (this
			 * is because the dates are timezone irrelevant), it should be called with the local datetime values presented
			 * as UTC ones(e.g. if oStartDate is 21 Dec 1981, 13:00 GMT+02:00, it will be converted to 21 Dec 1981, 13:00 GMT+00:00)
			 */
			oFirstDateOfWeek = CalendarUtils.getFirstDateOfWeek(CalendarUtils._createUniversalUTCDate(oStartDate, undefined, true));
			//CalendarUtils.getFirstDateOfWeek works with UTC based date values, restore the result back in local timezone.
			oStartDate.setTime(CalendarUtils._createLocalDate(oFirstDateOfWeek, true).getTime());
		}

		if (this.getViewKey() ===  sap.ui.unified.CalendarIntervalType.OneMonth) {
			/*
			 * Have in mind that the oStartDate is the date that the user sees in the UI, thus - local one. As
			 * CalendarUtils.getFirstDateOfMonth works with UTC dates (this is because the dates are timezone irrelevant),
			 * it should be called with the local datetime values presented as UTC ones.
			 */
			oFirstDateOfMonth = CalendarUtils.getFirstDateOfMonth(CalendarUtils._createUniversalUTCDate(oStartDate, undefined, true));
			//CalendarUtils.getFirstDateOfMonth works with UTC based date values, restore the result back in local timezone.
			oStartDate.setTime(CalendarUtils._createLocalDate(oFirstDateOfMonth, true).getTime());
		}

		if (jQuery.sap.equal(oStartDate, this.getStartDate())) {
			/* Logically this _updateTodayButtonState should not be needed, because if the date didn't change,
			 there is no need to update the button's state (the last state is correct).
			 Still, as setStartDate can be called just by changing a view, where the startDate may remains the same,
			 we need to make sure the today button is up-to date, as it depends on the view type*/
			this._updateTodayButtonState();
			return this;
		}

		var iYear = oStartDate.getFullYear();
		CalendarUtils._checkYearInValidRange(iYear);

		var oMinDate = this.getMinDate();
		if (oMinDate && oMinDate.getTime() > oStartDate.getTime()) {
			jQuery.sap.log.warning("StartDate < minDate -> StartDate set to minDate", this);
			oStartDate = new Date(oMinDate.getTime());
		} else {
			var oMaxDate = this.getMaxDate();
			if (oMaxDate && oMaxDate.getTime() < oStartDate.getTime()) {
				jQuery.sap.log.warning("StartDate > maxDate -> StartDate set to minDate", this);
				if (oMinDate) {
					oStartDate = new Date(oMinDate.getTime());
				} else {
					oStartDate = new Date(1, 0, 1);
					oStartDate.setFullYear(1);
				}
			}
		}

		this.setProperty("startDate", oStartDate, true);

		INTERVAL_CTR_REFERENCES.forEach(function (sControlRef) {
			if (this[sControlRef]) {
				this[sControlRef].setStartDate(new Date(oStartDate.getTime())); // use new date object
			}
		}, this);

		this._setRowsStartDate(new Date(oStartDate.getTime()));

		if (this.getViewKey() ===  sap.ui.unified.CalendarIntervalType.Week || this.getViewKey() === sap.ui.unified.CalendarIntervalType.OneMonth ) {
			this._updateTodayButtonState();
		}

		if (this.getDomRef()) {
			// only set timer, CalendarRow will be rerendered, so no update needed here
			this._updateCurrentTimeVisualization(false);
		}

		return this;

	};

	PlanningCalendar.prototype.setMinDate = function(oDate){

		if (jQuery.sap.equal(oDate, this.getMinDate())) {
			return this;
		}

		var oMaxDate = this.getMaxDate();

		if (oDate) {
			CalendarUtils._checkJSDateObject(oDate);

			var iYear = oDate.getFullYear();
			CalendarUtils._checkYearInValidRange(iYear);

			this.setProperty("minDate", oDate, true);
			this._bNoStartDateChange = true; // set the start date after all calendars are updated

			INTERVAL_CTR_REFERENCES.forEach(function (sControlRef) {
				if (this[sControlRef]) {
					this[sControlRef].setMinDate(new Date(oDate.getTime())); // use new date object
				}
			}, this);

			if (oMaxDate && oMaxDate.getTime() < oDate.getTime()) {
				jQuery.sap.log.warning("minDate > maxDate -> maxDate set to end of the month", this);
				oMaxDate = new Date(oDate.getTime());
				oMaxDate.setMonth(oMaxDate.getMonth() + 1, 0);
				oMaxDate.setHours(23);
				oMaxDate.setMinutes(59);
				oMaxDate.setSeconds(59);
				oMaxDate.setMilliseconds(0);
				this.setMaxDate(oMaxDate);
			}

			this._bNoStartDateChange = undefined;
			var oStartDate = this.getStartDate();
			if (oStartDate && oStartDate.getTime() < oDate.getTime()) {
				jQuery.sap.log.warning("StartDate < minDate -> StartDate set to minDate", this);
				oStartDate = new Date(oDate.getTime());
				this.setStartDate(oStartDate);
			}
		} else {
			this.setProperty("minDate", undefined, true);

			INTERVAL_CTR_REFERENCES.forEach(function (sControlRef) {
				if (this[sControlRef]) {
					this[sControlRef].setMinDate();
				}
			}, this);
		}

		var oToday = new Date();
		if (oDate && oToday.getTime() < oDate.getTime()) {
			this._oTodayButton.setVisible(false);
		} else if (!oMaxDate || oToday.getTime() < oMaxDate.getTime()) {
			this._oTodayButton.setVisible(true);
		}

		return this;

	};

	PlanningCalendar.prototype.setMaxDate = function(oDate){

		if (jQuery.sap.equal(oDate, this.getMaxDate())) {
			return this;
		}

		var oMinDate = this.getMinDate();

		if (oDate) {
			CalendarUtils._checkJSDateObject(oDate);

			var iYear = oDate.getFullYear();
			CalendarUtils._checkYearInValidRange(iYear);

			this.setProperty("maxDate", oDate, true);
			this._bNoStartDateChange = true; // set the start date after all calendars are updated

			INTERVAL_CTR_REFERENCES.forEach(function (sControlRef) {
				if (this[sControlRef]) {
					this[sControlRef].setMaxDate(new Date(oDate.getTime())); // use new date object
				}
			}, this);

			if (oMinDate && oMinDate.getTime() > oDate.getTime()) {
				jQuery.sap.log.warning("maxDate < minDate -> maxDate set to begin of the month", this);
				oMinDate = new Date(oDate.getTime());
				oMinDate.setDate(1);
				oMinDate.setHours(0);
				oMinDate.setMinutes(0);
				oMinDate.setSeconds(0);
				oMinDate.setMilliseconds(0);
				this.setMinDate(oMinDate);
			}

			this._bNoStartDateChange = undefined;
			var oStartDate = this.getStartDate();
			if (oStartDate && oStartDate.getTime() > oDate.getTime()) {
				jQuery.sap.log.warning("StartDate > maxDate -> StartDate set to minDate", this);
				if (oMinDate) {
					oStartDate = new Date(oMinDate.getTime());
				} else {
					oStartDate = new Date(1, 0, 1);
					oStartDate.setFullYear(1);
				}
				this.setStartDate(oStartDate);
			}
		} else {
			this.setProperty("maxDate", undefined, true);

			INTERVAL_CTR_REFERENCES.forEach(function (sControlRef) {
				if (this[sControlRef]) {
					this[sControlRef].setMaxDate();
				}
			}, this);
		}

		var oToday = new Date();
		if (oDate && oToday.getTime() > oDate.getTime()) {
			this._oTodayButton.setVisible(false);
		} else if (!oMinDate || oToday.getTime() > oMinDate.getTime()) {
			this._oTodayButton.setVisible(true);
		}

		return this;

	};

	PlanningCalendar.prototype.setViewKey = function(sKey){
		var oInterval, oOldStartDate, oIntervalMetadata,
			sOldViewKey = this.getViewKey(),
			oSelectedDate;

		this.setProperty("viewKey", sKey, true);

		this._oIntervalTypeSelect.setSelectedKey(sKey);

		if (this._oInfoToolbar.getContent().length > 1) {
			this._oInfoToolbar.removeContent(1);
		}

		if (sKey === sap.ui.unified.CalendarIntervalType.Week || sKey === sap.ui.unified.CalendarIntervalType.OneMonth) {
			oOldStartDate = this.getStartDate();
			this.setStartDate(new Date(oOldStartDate.getTime())); //make sure the start date is aligned according to the week/month rules
			if (oOldStartDate.getTime() !== this.getStartDate().getTime()) {
				this.fireStartDateChange();
			}
		}

		var oStartDate = this.getStartDate();
		var oMinDate = this.getMinDate();
		var oMaxDate = this.getMaxDate();
		var oView = this._getView(sKey, !this._bBeforeRendering);

		if (!oView) {
			this._bCheckView = true;
			this.invalidate(); // view not exist now, maybe added later, so rerender
		} else {
			var sIntervalType = oView.getIntervalType();
			var iIntervals = this._getIntervals(oView);

			this._bCheckView = false; // no additional check needed

			switch (sIntervalType) {
			case sap.ui.unified.CalendarIntervalType.Hour:
				if (!this._oTimeInterval) {
					this._oTimeInterval = new sap.ui.unified.CalendarTimeInterval(this.getId() + "-TimeInt", {
						startDate: new Date(oStartDate.getTime()), // use new date object
						items: iIntervals,
						pickerPopup: true
					});
					this._oTimeInterval.attachEvent("startDateChange", this._handleStartDateChange, this);
					this._oTimeInterval.attachEvent("select", this._handleCalendarSelect, this);
					this._oTimeInterval._oPlanningCalendar = this;
					this._oTimeInterval.getSpecialDates = function(){
						return this._oPlanningCalendar.getSpecialDates();
					};
					if (oMinDate) {
						this._oTimeInterval.setMinDate(new Date(oMinDate.getTime()));
					}
					if (oMaxDate) {
						this._oTimeInterval.setMaxDate(new Date(oMaxDate.getTime()));
					}
				}else if (this._oTimeInterval.getItems() != iIntervals) {
					this._oTimeInterval.setItems(iIntervals);
				}
				this._oInfoToolbar.addContent(this._oTimeInterval);
				break;

			case sap.ui.unified.CalendarIntervalType.Day:
			case sap.ui.unified.CalendarIntervalType.Week:
			case sap.ui.unified.CalendarIntervalType.OneMonth:
				//Date, Week and OneMonth intervals share the same object artifacts
				oIntervalMetadata = INTERVAL_METADATA[sIntervalType];
				oInterval = this[oIntervalMetadata.sInstanceName];

				if (!oInterval) {
					oInterval = new oIntervalMetadata.oClass(this.getId() + oIntervalMetadata.sIdSuffix, {
						startDate: new Date(oStartDate.getTime()), // use new date object
						days: iIntervals,
						showDayNamesLine: false,
						pickerPopup: true
					});

					oInterval.attachEvent("startDateChange", this._handleStartDateChange, this);
					oInterval.attachEvent("select", this._handleCalendarSelect, this);
					if (sKey === sap.ui.unified.CalendarIntervalType.OneMonth) {
						oInterval._setRowsStartDate = this._setRowsStartDate.bind(this);
					}

					oInterval._oPlanningCalendar = this;
					oInterval.getSpecialDates = function(){
						return this._oPlanningCalendar.getSpecialDates();
					};

					if (oMinDate) {
						oInterval.setMinDate(new Date(oMinDate.getTime()));
					}
					if (oMaxDate) {
						oInterval.setMaxDate(new Date(oMaxDate.getTime()));
					}
				} else if (oInterval.getDays() !== iIntervals) {
					oInterval.setDays(iIntervals);
				}
				this._oInfoToolbar.addContent(oInterval);
				this[oIntervalMetadata.sInstanceName] = oInterval;
				break;

			case sap.ui.unified.CalendarIntervalType.Month:
				if (!this._oMonthInterval) {
					this._oMonthInterval = new sap.ui.unified.CalendarMonthInterval(this.getId() + "-MonthInt", {
						startDate: new Date(oStartDate.getTime()), // use new date object
						months: iIntervals,
						pickerPopup: true
					});
					this._oMonthInterval.attachEvent("startDateChange", this._handleStartDateChange, this);
					this._oMonthInterval.attachEvent("select", this._handleCalendarSelect, this);
					this._oMonthInterval._oPlanningCalendar = this;
					this._oMonthInterval.getSpecialDates = function(){
						return this._oPlanningCalendar.getSpecialDates();
					};
					if (oMinDate) {
						this._oMonthInterval.setMinDate(new Date(oMinDate.getTime()));
					}
					if (oMaxDate) {
						this._oMonthInterval.setMaxDate(new Date(oMaxDate.getTime()));
					}
				}else if (this._oMonthInterval.setMonths() != iIntervals) {
					this._oMonthInterval.setMonths(iIntervals);
				}
				this._oInfoToolbar.addContent(this._oMonthInterval);
				break;

			default:
				throw new Error("Unknown IntervalType: " + sIntervalType + "; " + this);
			}

			var aRows = this.getRows();
			for (var i = 0; i < aRows.length; i++) {
				var oRow = aRows[i];
				var oCalendarRow = oRow.getCalendarRow();
				oCalendarRow.setIntervalType(sIntervalType);
				oCalendarRow.setIntervals(iIntervals);
				oCalendarRow.setShowSubIntervals(oView.getShowSubIntervals());
			}

			if (this.getDomRef()) {
				// only set timer, CalendarRow will be rerendered, so no update needed here
				this._updateCurrentTimeVisualization(false);
			}
		}

		if (this._oOneMonthInterval && sKey === sap.ui.unified.CalendarIntervalType.OneMonth) {
			this._oOneMonthInterval._setDisplayMode(this._iSize);
			this._oOneMonthInterval._adjustSelectedDate(CalendarDate.fromLocalJSDate(oOldStartDate));
			if (this._iSize < 2) {
				this._setRowsStartDate(oOldStartDate);
			}
		} else if (this._oOneMonthInterval
			&& sOldViewKey === sap.ui.unified.CalendarIntervalType.OneMonth
			&& this._oOneMonthInterval.getSelectedDates().length) {
			oSelectedDate = this._oOneMonthInterval.getSelectedDates()[0].getStartDate();
			if (oSelectedDate) {
				this.setStartDate(oSelectedDate);
			}
		}

		this._updateTodayButtonState();

		return this;

	};

	PlanningCalendar.prototype.setShowIntervalHeaders = function(bShowIntervalHeaders){

		this.setProperty("showIntervalHeaders", bShowIntervalHeaders, true);

		var aRows = this.getRows();
		for (var i = 0; i < aRows.length; i++) {
			var oRow = aRows[i];
			oRow.getCalendarRow().setShowIntervalHeaders(bShowIntervalHeaders);
		}

		return this;

	};

	PlanningCalendar.prototype.setShowEmptyIntervalHeaders = function(bShowEmptyIntervalHeaders){

		this.setProperty("showEmptyIntervalHeaders", bShowEmptyIntervalHeaders, true);

		var aRows = this.getRows();
		for (var i = 0; i < aRows.length; i++) {
			var oRow = aRows[i];
			oRow.getCalendarRow().setShowEmptyIntervalHeaders(bShowEmptyIntervalHeaders);
		}

		return this;

	};

	PlanningCalendar.prototype.setGroupAppointmentsMode = function (bGroupAppointmentsMode) {

		this.setProperty("groupAppointmentsMode", bGroupAppointmentsMode, true);

		var aRows = this.getRows();
		for (var i = 0; i < aRows.length; i++) {
			var oRow = aRows[i];
			oRow.getCalendarRow().setGroupAppointmentsMode(bGroupAppointmentsMode);
		}

		return this;
	};

	PlanningCalendar.prototype.setAppointmentsReducedHeight = function(bAppointmentsReducedHeight){

		this.setProperty("appointmentsReducedHeight", bAppointmentsReducedHeight, true);

		var aRows = this.getRows();
		for (var i = 0; i < aRows.length; i++) {
			var oRow = aRows[i];
			oRow.getCalendarRow().setAppointmentsReducedHeight(bAppointmentsReducedHeight);
		}

		return this;

	};

	PlanningCalendar.prototype.setAppointmentsVisualization = function(sAppointmentsVisualization){

		this.setProperty("appointmentsVisualization", sAppointmentsVisualization, true);

		var aRows = this.getRows();
		for (var i = 0; i < aRows.length; i++) {
			var oRow = aRows[i];
			oRow.getCalendarRow().setAppointmentsVisualization(sAppointmentsVisualization);
		}

		return this;

	};

	PlanningCalendar.prototype.setShowRowHeaders = function(bShowRowHeaders){

		// set header column to invisible as each row is a ColumnListItem with two columns
		// removing the column would need to change every row

		this.setProperty("showRowHeaders", bShowRowHeaders, true);

		var oTable = this.getAggregation("table");
		oTable.getColumns()[0].setVisible(bShowRowHeaders);
		this._toggleAppointmentsColumnPopinState(bShowRowHeaders);

		this.$().toggleClass("sapMPlanCalNoHead", !bShowRowHeaders);
		_positionSelectAllCheckBox.call(this);
		_setSelectionMode.call(this);

		return this;

	};

	PlanningCalendar.prototype.addRow = function(oRow) {

		this.addAggregation("rows", oRow, true);

		oRow.attachEvent("_change", _handleRowChanged, this);

		var oTable = this.getAggregation("table");
		oTable.addItem(oRow.getColumnListItem());

		var oCalendarRow = oRow.getCalendarRow();
		oCalendarRow.setStartDate(this.getStartDate());
		oCalendarRow.setShowIntervalHeaders(this.getShowIntervalHeaders());
		oCalendarRow.setShowEmptyIntervalHeaders(this.getShowEmptyIntervalHeaders());
		oCalendarRow.setGroupAppointmentsMode(this.getGroupAppointmentsMode());
		oCalendarRow.setAppointmentsReducedHeight(this.getAppointmentsReducedHeight());
		oCalendarRow.setLegend(this.getLegend());
		oCalendarRow.setAppointmentsVisualization(this.getAppointmentsVisualization());
		oCalendarRow.attachEvent("select", _handleAppointmentSelect, this);
		oCalendarRow.attachEvent("startDateChange", this._handleStartDateChange, this);
		oCalendarRow.attachEvent("leaveRow", _handleLeaveRow, this);
		oCalendarRow.attachEvent("intervalSelect", _handleIntervalSelect, this);

		_updateSelectAllCheckBox.call(this);

		if (_isThereAnIntervalInstance.call(this)) {
			var sKey = this.getViewKey();
			var oView = this._getView(sKey);
			var sIntervalType = oView.getIntervalType();
			var iIntervals = this._getIntervals(oView);
			oCalendarRow.setIntervalType(sIntervalType);
			oCalendarRow.setIntervals(iIntervals);
			oCalendarRow.setShowSubIntervals(oView.getShowSubIntervals());
		}

		_setSelectionMode.call(this);

		return this;

	};

	PlanningCalendar.prototype.insertRow = function(oRow, iIndex) {

		this.insertAggregation("rows", oRow, iIndex);

		oRow.attachEvent("_change", _handleRowChanged, this);

		var oTable = this.getAggregation("table");
		oTable.insertItem(oRow.getColumnListItem(), iIndex, true);

		var oCalendarRow = oRow.getCalendarRow();
		oCalendarRow.setStartDate(this.getStartDate());
		oCalendarRow.setShowIntervalHeaders(this.getShowIntervalHeaders());
		oCalendarRow.setShowEmptyIntervalHeaders(this.getShowEmptyIntervalHeaders());
		oCalendarRow.setGroupAppointmentsMode(this.getGroupAppointmentsMode());
		oCalendarRow.setAppointmentsReducedHeight(this.getAppointmentsReducedHeight());
		oCalendarRow.setLegend(this.getLegend());
		oCalendarRow.setAppointmentsVisualization(this.getAppointmentsVisualization());
		oCalendarRow.attachEvent("select", _handleAppointmentSelect, this);
		oCalendarRow.attachEvent("startDateChange", this._handleStartDateChange, this);
		oCalendarRow.attachEvent("leaveRow", _handleLeaveRow, this);
		oCalendarRow.attachEvent("intervalSelect", _handleIntervalSelect, this);

		_updateSelectAllCheckBox.call(this);

		if (_isThereAnIntervalInstance.call(this)) {
			var sKey = this.getViewKey();
			var oView = this._getView(sKey);
			var sIntervalType = oView.getIntervalType();
			var iIntervals = this._getIntervals(oView);
			oCalendarRow.setIntervalType(sIntervalType);
			oCalendarRow.setIntervals(iIntervals);
			oCalendarRow.setShowSubIntervals(oView.getShowSubIntervals());
		}

		_setSelectionMode.call(this);

		return this;

	};

	PlanningCalendar.prototype.removeRow = function(vObject) {

		var oRemoved = this.removeAggregation("rows", vObject, true);

		oRemoved.detachEvent("_change", _handleRowChanged, this);

		var oTable = this.getAggregation("table");
		oTable.removeItem(oRemoved.getColumnListItem(), true);

		var oCalendarRow = oRemoved.getCalendarRow();
		oCalendarRow.detachEvent("select", _handleAppointmentSelect, this);
		oCalendarRow.detachEvent("startDateChange", this._handleStartDateChange, this);
		oCalendarRow.detachEvent("leaveRow", _handleLeaveRow, this);
		oCalendarRow.detachEvent("intervalSelect", _handleIntervalSelect, this);

		_updateSelectAllCheckBox.call(this);

		_setSelectionMode.call(this);

		return oRemoved;

	};

	PlanningCalendar.prototype.removeAllRows = function() {

		var aRemoved = this.removeAllAggregation("rows", true);

		var oTable = this.getAggregation("table");
		oTable.removeAllItems(true);

		for (var i = 0; i < aRemoved.length; i++) {
			var oRow = aRemoved[i];
			oRow.detachEvent("_change", _handleRowChanged, this);

			var oCalendarRow = oRow.getCalendarRow();
			oCalendarRow.detachEvent("select", _handleAppointmentSelect, this);
			oCalendarRow.detachEvent("startDateChange", this._handleStartDateChange, this);
			oCalendarRow.detachEvent("leaveRow", _handleLeaveRow, this);
			oCalendarRow.detachEvent("intervalSelect", _handleIntervalSelect, this);
		}

		_updateSelectAllCheckBox.call(this);

		_setSelectionMode.call(this);

		return aRemoved;

	};

	PlanningCalendar.prototype.destroyRows = function() {

		var destroyed = this.destroyAggregation("rows", true);

		var oTable = this.getAggregation("table");
		oTable.destroyItems(true);

		_updateSelectAllCheckBox.call(this);

		_setSelectionMode.call(this);

		return destroyed;

	};

	PlanningCalendar.prototype.addToolbarContent = function(oContent) {

		this.addAggregation("toolbarContent", oContent, true);

		_changeToolbar.call(this);

		return this;

	};

	PlanningCalendar.prototype.insertToolbarContent = function(oContent, iIndex) {

		this.insertAggregation("toolbarContent", oContent, iIndex);

		_changeToolbar.call(this);

		return this;

	};

	PlanningCalendar.prototype.removeToolbarContent = function(vObject) {

		var oRemoved = this.removeAggregation("toolbarContent", vObject, true);

		_changeToolbar.call(this);

		return oRemoved;

	};

	PlanningCalendar.prototype.removeAllToolbarContent = function() {

		var aRemoved = this.removeAllAggregation("toolbarContent", true);

		_changeToolbar.call(this);

		return aRemoved;

	};

	PlanningCalendar.prototype.destroyToolbarContent = function() {

		var destroyed = this.destroyAggregation("toolbarContent", true);

		_changeToolbar.call(this);

		return destroyed;

	};

	// as OverflowToolbar uses indexOfContent function of controls parent to get Index
	PlanningCalendar.prototype.indexOfContent = function(vControl) {

		return this.indexOfToolbarContent(vControl);

	};

	PlanningCalendar.prototype.setSingleSelection = function(bSingleSelection) {

		this.setProperty("singleSelection", bSingleSelection, true);

		_positionSelectAllCheckBox.call(this);
		_setSelectionMode.call(this);

		if (bSingleSelection) {
			this.selectAllRows(false);
		} else {
			_updateSelectAllCheckBox.call(this);
		}

		this.$().toggleClass("sapMPlanCalMultiSel", !bSingleSelection);

		return this;

	};

	PlanningCalendar.prototype.setNoDataText = function(sNoDataText) {

		this.setProperty("noDataText", sNoDataText, true);

		var oTable = this.getAggregation("table");
		oTable.setNoDataText(sNoDataText);

		return this;

	};

	PlanningCalendar.prototype.setLegend = function(sLegendId){

		this.setAssociation("legend", sLegendId, true);

		var aRows = this.getRows();
		for (var i = 0; i < aRows.length; i++) {
			var oRow = aRows[i];
			oRow.getCalendarRow().setLegend(sLegendId);
		}

		return this;

	};

	PlanningCalendar.prototype.addAriaLabelledBy = function(sId) {

		this.addAssociation("ariaLabelledBy", sId, true);

		var oTable = this.getAggregation("table");
		oTable.addAriaLabelledBy(sId);

		return this;

	};

	PlanningCalendar.prototype.removeAriaLabelledBy = function(vObject) {

		this.removeAssociation("ariaLabelledBy", vObject, true);

		var oTable = this.getAggregation("table");
		oTable.removeAriaLabelledBy(vObject);

		return this;

	};

	PlanningCalendar.prototype.removeAllAriaLabelledBy = function() {

		this.removeAllAssociation("ariaLabelledBy", true);

		var oTable = this.getAggregation("table");
		oTable.removeAllAriaLabelledBy();
		oTable.addAriaLabelledBy(this.getId() + "-Descr");

		return this;

	};

	PlanningCalendar.prototype.invalidate = function(oOrigin) {

		if (this._bDateRangeChanged || (oOrigin && oOrigin instanceof DateRange)) {
			// DateRange changed -> only invalidate calendar control
			if (this.getDomRef()) {
				var sKey = this.getViewKey();
				var oView = this._getView(sKey);
				var sIntervalType = oView.getIntervalType();

				switch (sIntervalType) {
				case sap.ui.unified.CalendarIntervalType.Hour:
					if (this._oTimeInterval) {
						this._oTimeInterval.invalidate(arguments);
					}
					break;

				case sap.ui.unified.CalendarIntervalType.Day:
					if (this._oDateInterval) {
						this._oDateInterval.invalidate(arguments);
					}
					break;

				case sap.ui.unified.CalendarIntervalType.Month:
					if (this._oMonthInterval) {
						this._oMonthInterval.invalidate(arguments);
					}
					break;
				case sap.ui.unified.CalendarIntervalType.OneMonth:
					if (this._oOneMonthInterval) {
						this._oOneMonthInterval.invalidate(arguments);
					}
					break;

				case sap.ui.unified.CalendarIntervalType.Week:
					if (this._oWeekInterval) {
						this._oWeekInterval.invalidate(arguments);
					}
					break;

				default:
					throw new Error("Unknown IntervalType: " + sIntervalType + "; " + this);
				}
			}
			this._bDateRangeChanged = undefined;
		} else {
			if (oOrigin && oOrigin instanceof sap.m.PlanningCalendarView) {
				this._bCheckView = true; // update view setting onbeforerendering
			}
			Control.prototype.invalidate.apply(this, arguments);
		}

	};

	PlanningCalendar.prototype.addSpecialDate = function(oSpecialDate) {
		this._bDateRangeChanged = true;

		// forward to PlanningCalendarRow
		if (oSpecialDate.getType() === sap.ui.unified.CalendarDayType.NonWorking) {
			this.getAggregation("rows").forEach(function (oRow){
				oRow.addAggregation("_nonWorkingDates", this._buildPCRowDateRange(oSpecialDate));
			}, this);
		}

		return Control.prototype.addAggregation.call(this, "specialDates", oSpecialDate);
	};

	PlanningCalendar.prototype.insertSpecialDate = function (oSpecialDate, iIndex) {
		this._bDateRangeChanged = true;

		// forward to PlanningCalendarRow
		if (oSpecialDate.getType() === sap.ui.unified.CalendarDayType.NonWorking) {
			this.getAggregation("rows").forEach(function (oRow){
				oRow.insertAggregation("_nonWorkingDates", this._buildPCRowDateRange(oSpecialDate), iIndex);
			}, this);
		}

		return Control.prototype.insertAggregation.call(this, "specialDates", oSpecialDate, iIndex);
	};

	PlanningCalendar.prototype.removeSpecialDate = function(oSpecialDate) {
		var aRemovableNonWorkingDate;

		if (typeof  oSpecialDate === "string") {
			oSpecialDate = sap.ui.getCore().byId(oSpecialDate);
		}
		this._bDateRangeChanged = true;
		// forward to PlanningCalendarRow
		if (oSpecialDate && oSpecialDate.getType() === sap.ui.unified.CalendarDayType.NonWorking) {
			this.getAggregation("rows").forEach(function (oPCRow){
				if (oPCRow.getAggregation("_nonWorkingDates")) {
					aRemovableNonWorkingDate = oPCRow.getAggregation("_nonWorkingDates").filter(function(oNonWorkingDate) {
						return oNonWorkingDate.data(PlanningCalendarRow.PC_FOREIGN_KEY_NAME) === oSpecialDate.getId();
					});
					if (aRemovableNonWorkingDate.length) {
						jQuery.sap.assert(aRemovableNonWorkingDate.length == 1, "Inconsistency between PlanningCalendar " +
							"special date instance and PlanningCalendar nonWorkingDates instance. For PC instance " +
							"there are more than one(" + aRemovableNonWorkingDate.length + ") nonWorkingDates in PlanningCalendarRow ");
						oPCRow.removeAggregation("_nonWorkingDates", aRemovableNonWorkingDate[0]);
					}
				}
			});
		}

		return Control.prototype.removeAggregation.call(this, "specialDates", oSpecialDate);
	};

	PlanningCalendar.prototype.removeAllSpecialDates = function() {

		this._bDateRangeChanged = true;
		if (this.getAggregation("rows")) {
			this.getAggregation("rows").forEach(function (oRow) {
				oRow.removeAllAggregation("_nonWorkingDates");
			});
		}
		return this.removeAllAggregation("specialDates");
	};

	PlanningCalendar.prototype.destroySpecialDates = function() {

		this._bDateRangeChanged = true;
		this.getAggregation("rows").forEach(function (oRow){
			oRow.destroyAggregation("_nonWorkingDates");
		});
		return this.destroyAggregation("specialDates");
	};

	PlanningCalendar.prototype.removeAllViews = function() {

		this._bCheckView = true; // update view setting onbeforerendering
		var aRemoved = this.removeAllAggregation("views");
		return aRemoved;

	};

	PlanningCalendar.prototype.destroyViews = function() {

		this._bCheckView = true; // update view setting onbeforerendering
		var oDestroyed = this.destroyAggregation("views");
		return oDestroyed;

	};

	/**
	 * Returns an array containing the selected rows. If no row is selected, an empty array is returned.
	 *
	 * @returns {sap.m.PlanningCalendarRow[]} selected rows
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	PlanningCalendar.prototype.getSelectedRows = function() {

		return this.getRows().filter(function(oRow) {
			return oRow.getSelected();
		});

	};


	/**
	 * Selects or deselects all <code>PlanningCalendarRows</code>.
	 *
	 * <b>Note:</b> Selection only works if <code>singleSelection</code> is set to <code>false</code>.
	 *
	 * @param {boolean} bSelect Indicator showing whether <code>PlanningCalendarRows</code> should be selected or deselected
	 * @returns {sap.m.PlanningCalendar} <code>this</code> to allow method chaining
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	PlanningCalendar.prototype.selectAllRows = function(bSelect) {

		var aRows = this.getRows();

		if (!(bSelect && this.getSingleSelection())) {
			for (var i = 0; i < aRows.length; i++) {
				var oRow = aRows[i];
				oRow.setSelected(bSelect);
			}

			if (this._oSelectAllCheckBox) {
				this._oSelectAllCheckBox.setSelected(bSelect);
			}
		}

		return this;

	};

	PlanningCalendar.prototype.onsaphomemodifiers = function(oEvent) {

		if ((oEvent.metaKey || oEvent.ctrlKey) && !oEvent.altKey && !oEvent.shiftKey) {
			var aRows = this.getRows();
			var oRow = aRows[0];

			var oNewEvent = new jQuery.Event("saphome");
			oNewEvent._bPlanningCalendar = true;

			oRow.getCalendarRow().onsaphome(oNewEvent);

			oEvent.preventDefault();
			oEvent.stopPropagation();
		}

	};

	PlanningCalendar.prototype.onsapendmodifiers = function(oEvent) {

		if ((oEvent.metaKey || oEvent.ctrlKey) && !oEvent.altKey && !oEvent.shiftKey) {
			var aRows = this.getRows();
			var oRow = aRows[aRows.length - 1];

			var oNewEvent = new jQuery.Event("sapend");
			oNewEvent._bPlanningCalendar = true;

			oRow.getCalendarRow().onsapend(oNewEvent);

			oEvent.preventDefault();
			oEvent.stopPropagation();
		}

	};

	/**
	 * Gets the correct <code>PlanningCalendarView</code> interval depending on the screen size.
	 * @param {PlanningCalendarView} oView - Target view
	 * @returns {number} Interval for the target view that corresponds to the screen size
	 * @private
	 */
	PlanningCalendar.prototype._getIntervals = function (oView) {
		var iIntervals = 0;

		switch (this._iSize) {
			case 0:
				iIntervals = oView.getIntervalsS();
				break;

			case 1:
				iIntervals = oView.getIntervalsM();
				break;

			default:
				iIntervals = oView.getIntervalsL();
				break;
		}

		return iIntervals;

	};

	/**
	 * Gets a <code>PlanningCalendarView</code> by a given view key.
	 * @param {string} sKey - <code>PlanningCalendarView</code> key
	 * @param {boolean} bNoError
	 * @returns {*}
	 * @private
	 */
	PlanningCalendar.prototype._getView = function (sKey, bNoError) {

		var aViews = _getViews.call(this);
		var oView;

		for (var i = 0; i < aViews.length; i++) {
			oView = aViews[i];
			if (oView.getKey() != sKey) {
				oView = undefined;
			}else {
				break;
			}
		}

		if (!oView && !bNoError) {
			throw new Error("PlanningCalendarView with key " + sKey + "not assigned " + this);
		}

		return oView;

	};

	PlanningCalendar.prototype._changeStartDate = function(oStartDate) {
		if (this._bNoStartDateChange) {
			return;
		}

		this.setStartDate(new Date(oStartDate.getTime()));
		this.fireStartDateChange();
	};

	/**
	 *
	 * @param bUpdateRows
	 * @private
	 */
	PlanningCalendar.prototype._updateCurrentTimeVisualization = function (bUpdateRows) {

		if (this._sUpdateCurrentTime) {
			jQuery.sap.clearDelayedCall(this._sUpdateCurrentTime);
			this._sUpdateCurrentTime = undefined;
		}

		if (bUpdateRows) {
			var aRows = this.getRows();
			for (var i = 0; i < aRows.length; i++) {
				var oRow = aRows[i];
				oRow.getCalendarRow().updateCurrentTimeVisualization();
			}
		}

		// set timer only if date is in visible area or one hour before
		var oNowDate = new Date();
		var oStartDate = this.getStartDate();
		var sKey = this.getViewKey();
		var oView = this._getView(sKey);
		var sIntervalType = oView.getIntervalType();
		var iIntervals = this._getIntervals(oView);
		var iTime = 0;
		var iStartTime = 0;
		var iEndTime = 0;

		switch (sIntervalType) {
			case sap.ui.unified.CalendarIntervalType.Hour:
				iTime = 60000;
				iStartTime = oStartDate.getTime() - 3600000;
				iEndTime = oStartDate.getTime() + iIntervals * 3600000;
				break;

			case sap.ui.unified.CalendarIntervalType.Day:
			case sap.ui.unified.CalendarIntervalType.Week:
			case sap.ui.unified.CalendarIntervalType.OneMonth:
				iTime = 1800000;
				iStartTime = oStartDate.getTime() - 3600000;
				iEndTime = oStartDate.getTime() + iIntervals * 86400000;
				break;

			default:
				iTime = -1; // not needed
				break;
		}

		if (oNowDate.getTime() <= iEndTime && oNowDate.getTime() >= iStartTime && iTime > 0) {
			this._sUpdateCurrentTime = jQuery.sap.delayedCall(iTime, this, '_updateCurrentTimeVisualization', [true]);
		}

	};

	function _changeIntervalType(oEvent) {

		this.setViewKey(oEvent.getParameter("selectedItem").getKey());

		this.fireViewChange();

	}

	/**
	 * Handles the <code>press</code> event of the <code>PlanningCalendar</code>'s today button
	 * @param oEvent {jQuery.Event}
	 * @private
	 */
	PlanningCalendar.prototype._handleTodayPress = function (oEvent) {
		var oDate = new Date(),
			oStartDate,
			sViewKey = this.getViewKey();

		// if the OneMonth view is selected and Today btn is pressed,
		// the calendar should start from the 1st date of the current month
		if (sViewKey === sap.ui.unified.CalendarIntervalType.OneMonth) {
			oStartDate = CalendarUtils.getFirstDateOfMonth(CalendarUtils._createUniversalUTCDate(oDate, undefined, true));
			this._oOneMonthInterval._adjustSelectedDate(CalendarDate.fromLocalJSDate(oDate), false);

			oDate = CalendarUtils._createLocalDate(oStartDate, true);
		}

		if (sViewKey ===  sap.ui.unified.CalendarIntervalType.Week) {
			//clicking of today in week view should not point to the current hour, but to the one defined by app. developer
			oStartDate = this.getStartDate();
			oDate.setHours(oStartDate.getHours());
			oDate.setMinutes(oStartDate.getMinutes());
			oDate.setSeconds(oStartDate.getSeconds());
		}

		this.setStartDate(oDate);
		this.fireStartDateChange();

	};

	/**
	 * Handles the <code>startDateChange</code> event of the <code>PlanningCalendar</code>
	 * @param oEvent {jQuery.Event}
	 * @private
	 */
	PlanningCalendar.prototype._handleStartDateChange = function(oEvent){
		var oStartDate = oEvent.oSource.getStartDate();
		this._changeStartDate(oStartDate);
	};

	PlanningCalendar.prototype._handleCalendarSelect = function (oEvent) {

		var aSelectedDates = oEvent.oSource.getSelectedDates();
		var oEvtSelectedStartDate = new Date(aSelectedDates[0].getStartDate());
		// calculate end date
		var oEndDate = CalendarUtils._createUniversalUTCDate(oEvtSelectedStartDate, undefined, true);
		var sKey = this.getViewKey();
		var oView = this._getView(sKey);
		var sIntervalType = oView.getIntervalType();

		// remove old selection
		// unless the select acts as a picker, then the selection stays
		// in OneMonth view smaller sizes
		if (sIntervalType !== sap.ui.unified.CalendarIntervalType.OneMonth
			|| this._iSize > 1) {
			aSelectedDates[0].setStartDate();
		}

		switch (sIntervalType) {
		case sap.ui.unified.CalendarIntervalType.Hour:
			oEndDate.setUTCHours(oEndDate.getUTCHours() + 1);
			break;

		case sap.ui.unified.CalendarIntervalType.Day:
		case sap.ui.unified.CalendarIntervalType.Week:
			oEndDate.setUTCDate(oEndDate.getUTCDate() + 1);
			break;
		case sap.ui.unified.CalendarIntervalType.OneMonth:
			if (this._iSize < 2) { // change rows' startDate on S and M sizes
				var oFocusedDate = new Date(oEvtSelectedStartDate.getTime());
				if (CalendarUtils.monthsDiffer(this.getStartDate(), oEvtSelectedStartDate)) {
					this.setStartDate(oEvtSelectedStartDate);
				}
				this._setRowsStartDate(oFocusedDate);
				this._oOneMonthInterval.getAggregation('month')[0]._focusDate(CalendarDate.fromLocalJSDate(oFocusedDate), true);
			} else if (CalendarUtils._isNextMonth(oEvtSelectedStartDate, this.getStartDate())) {
				this._oOneMonthInterval._handleNext();
				return;
			}
			oEndDate.setUTCDate(oEndDate.getUTCDate() + 1);
			break;
		case sap.ui.unified.CalendarIntervalType.Month:
			oEndDate.setUTCMonth(oEndDate.getUTCMonth() + 1);
			break;

		default:
			throw new Error("Unknown IntervalType: " + sIntervalType + "; " + this);
		}

		oEndDate.setUTCMilliseconds(oEndDate.getUTCMilliseconds() - 1);
		oEndDate = CalendarUtils._createLocalDate(oEndDate, true);

		this.fireIntervalSelect({startDate: oEvtSelectedStartDate, endDate: oEndDate, subInterval: false, row: undefined});

	};

	/**
	 * Clone from the passed DateRange and sets the foreign key to the source DateRange, that is used for cloning
	 * @param {sap.ui.unified.DateRange} oSource
	 * @returns {sap.ui.unified.DateRange}
	 * @private
	 */
	PlanningCalendar.prototype._buildPCRowDateRange = function (oSource) {
		var oRangeCopy = new DateRange();

		if (oSource.getStartDate()) {
			oRangeCopy.setStartDate(new Date(oSource.getStartDate().getTime()));
		}
		if (oSource.getEndDate()) {
			oRangeCopy.setEndDate(new Date(oSource.getEndDate().getTime()));
		}
		oRangeCopy.data(PlanningCalendarRow.PC_FOREIGN_KEY_NAME, oSource.getId());

		return oRangeCopy;
	};

	function _handleIntervalSelect(oEvent){

		var oStartDate = oEvent.getParameter("startDate");

		var sKey = this.getViewKey();
		var oView = this._getView(sKey);
		var sIntervalType = oView.getIntervalType();

		if (sIntervalType === sap.ui.unified.CalendarIntervalType.OneMonth
			&& CalendarUtils._isNextMonth(oStartDate, this.getStartDate())) {
			this._oOneMonthInterval._handleNext();
			return;
		}

		var oEndDate = oEvent.getParameter("endDate");
		var bSubInterval = oEvent.getParameter("subInterval");
		var oRow = oEvent.oSource._oPlanningCalendarRow;

		this.fireIntervalSelect({startDate: oStartDate, endDate: oEndDate, subInterval: bSubInterval, row: oRow});

	}

	PlanningCalendar.prototype._applyContextualSettings = function () {
		return Control.prototype._applyContextualSettings.call(this, {contextualWidth: this.$().width()});
	};

	function _handleResize(oEvent, bNoRowResize){

		this._applyContextualSettings();

		if (oEvent.size.width <= 0) {
			// only if visible at all
			return;
		}

		var aRows = this.getRows();
		var oRow;
		var i = 0;

		var iOldSize = this._iSize;
		_determineSize.call(this, oEvent.size.width);
		if (iOldSize != this._iSize) {
			toggleSizeClasses.call(this, this._iSize);

			var sKey = this.getViewKey();
			var oView = this._getView(sKey);
			var sIntervalType = oView.getIntervalType();
			var iIntervals = this._getIntervals(oView);
			for (i = 0; i < aRows.length; i++) {
				oRow = aRows[i];
				var oCalendarRow = oRow.getCalendarRow();
				if (iIntervals != oCalendarRow.getIntervals()) {
					oCalendarRow.setIntervals(iIntervals);
				} else {
					oCalendarRow.handleResize();
				}
			}

			switch (sIntervalType) {
			case sap.ui.unified.CalendarIntervalType.Hour:
				if (this._oTimeInterval && this._oTimeInterval.getItems() != iIntervals) {
					this._oTimeInterval.setItems(iIntervals);
				}
				break;

			case sap.ui.unified.CalendarIntervalType.Day:
				if (this._oDateInterval && this._oDateInterval.getDays() != iIntervals) {
					this._oDateInterval.setDays(iIntervals);
				}
				break;

			case sap.ui.unified.CalendarIntervalType.Month:
				if (this._oMonthInterval && this._oMonthInterval.getMonths() != iIntervals) {
					this._oMonthInterval.setMonths(iIntervals);
				}
				break;

			case sap.ui.unified.CalendarIntervalType.Week:
				if (this._oWeekInterval && this._oWeekInterval.getDays() != iIntervals) {
					this._oWeekInterval.setDays(iIntervals);
				}
				break;

			case sap.ui.unified.CalendarIntervalType.OneMonth:
				if (this._oOneMonthInterval && this._oOneMonthInterval.getDays() != iIntervals) {
					this._oOneMonthInterval.setDays(iIntervals);
					if (this._iSize > 1) {
						//set start date to 1st of the month
						this._setRowsStartDate(new Date(this.getStartDate().getTime()));
					}
				}
				break;

			default:
				throw new Error("Unknown IntervalType: " + sIntervalType + "; " + this);
			}

			_positionSelectAllCheckBox.call(this);
		}else if (!bNoRowResize) {
			for (i = 0; i < aRows.length; i++) {
				oRow = aRows[i];
				oRow.getCalendarRow().handleResize();
			}
		}

		if (this._oOneMonthInterval) {
			this._oOneMonthInterval._setDisplayMode(this._iSize);
			// this._oOneMonthInterval._adjustSelectedDate(this.getStartDate());
		}

	}

	function _handleAppointmentSelect(oEvent) {

		var oAppointment = oEvent.getParameter("appointment");
		var bMultiSelect = oEvent.getParameter("multiSelect");
		var aAppointments = oEvent.getParameter("appointments");

		if (!bMultiSelect) {
			// deselect appointments of other rows
			var aRows = this.getRows();
			for (var i = 0; i < aRows.length; i++) {
				var oRow = aRows[i];
				var oCalendarRow = oRow.getCalendarRow();
				if (oEvent.oSource != oCalendarRow) {
					var aRowAppointments = oRow.getAppointments();
					for (var j = 0; j < aRowAppointments.length; j++) {
						var oRowAppointment = aRowAppointments[j];
						oRowAppointment.setSelected(false);
					}
				}
			}
		}

		this.fireAppointmentSelect({appointment: oAppointment, appointments: aAppointments, multiSelect: bMultiSelect});

	}

	/**
	 * Sets the start dates of all calendar rows to a given date.
	 * @param {Date} oDateTime
	 * @private
	 */
	PlanningCalendar.prototype._setRowsStartDate = function(oDateTime) {
		var aRows = this.getRows(),
			oRow,
			i;

		for (i = 0; i < aRows.length; i++) {
			oRow = aRows[i];
			oRow.getCalendarRow().setStartDate(oDateTime);
		}
	};


	/**
	 * Enables/disables the popin nature of a the appointments column.
	 * @param {boolean} popinEnabled
	 * @private
	 */
	PlanningCalendar.prototype._toggleAppointmentsColumnPopinState = function(popinEnabled) {
		var oTable = this.getAggregation("table"),
			oAppointmentsCol = oTable.getColumns()[1];

		oAppointmentsCol.setDemandPopin(popinEnabled);
		oAppointmentsCol.setMinScreenWidth(popinEnabled ? APP_COLUMN_MIN_SCREEN_WIDTH : "");
	};

	function _handleTableSelectionChange(oEvent) {

		var aChangedRows = [];
		var aRows = this.getRows();

		for (var i = 0; i < aRows.length; i++) {
			var oRow = aRows[i];
			var oRowItem = oRow.getColumnListItem();
			var bSelected = oRowItem.getSelected();
			if (oRow.getSelected() != bSelected) {
				oRow.setProperty("selected", bSelected, true);
				aChangedRows.push(oRow);
			}

		}

		if (!this.getSingleSelection()) {
			_updateSelectAllCheckBox.call(this);
		}

		if (aChangedRows.length > 0) {
			this.fireRowSelectionChange({rows: aChangedRows});
		}

	}

	function _changeToolbar() {

		var oTable = this.getAggregation("table");

		if (this.getToolbarContent().length > 0) {
			if (!this._oToolbar) {
				this._oToolbar = new sap.m.OverflowToolbar(this.getId() + "-Toolbar", {
					design: sap.m.ToolbarDesign.Transpaent
				});
				this._oToolbar._oPlanningCalendar = this;
				this._oToolbar.getContent = function() {
					return this._oPlanningCalendar.getToolbarContent();
				};
			}
			if (!oTable.getHeaderToolbar()) {
				oTable.setHeaderToolbar(this._oToolbar);
			}
		} else if (oTable.getHeaderToolbar()) {
			oTable.setHeaderToolbar();
		}

		this._oToolbar.invalidate();

	}

	function _determineSize(iWidth) {

		if (iWidth < this._iBreakPointTablet) {
			this._iSize = 0; // phone
		} else if (iWidth < this._iBreakPointDesktop){
			this._iSize = 1; // tablet
		} else {
			this._iSize = 2; // desktop
		}

		// use header sizes, as m.Table uses this for it's resizing
		if (jQuery('html').hasClass("sapUiMedia-Std-Phone")) {
			this._iSizeScreen = 0;
		}else if (jQuery('html').hasClass("sapUiMedia-Std-Tablet")) {
			this._iSizeScreen = 1;
		}else {
			this._iSizeScreen = 2;
		}

	}

	// as all our css should depend on the main container size, not screen size like sapUiMedia-Std-Tablet...
	function toggleSizeClasses(iSize) {
		var sCurrentSizeClass = 'sapMSize' + iSize,
			oRef = this.$(),
			i,
			sClass;

		if (oRef) {
			for (i = 0; i < 3; i++) {
				sClass = 'sapMSize' + i;
				if (sClass === sCurrentSizeClass) {
					oRef.addClass(sClass);
				} else {
					oRef.removeClass(sClass);
				}
			}
		}
	}

	function _getViews() {

		var aViews = this.getViews();

		if (aViews.length == 0) {
			if (!this._aViews) {
				this._aViews = [];

				var oViewHour = new sap.m.PlanningCalendarView(this.getId() + "-HourView", {
					key: sap.ui.unified.CalendarIntervalType.Hour,
					intervalType: sap.ui.unified.CalendarIntervalType.Hour,
					description: this._oRB.getText("PLANNINGCALENDAR_HOURS"),
					intervalsS: 6,
					intervalsM: 6,
					intervalsL: 12
				});
				this._aViews.push(oViewHour);

				var oViewDay = new sap.m.PlanningCalendarView(this.getId() + "-DayView", {
					key: sap.ui.unified.CalendarIntervalType.Day,
					intervalType: sap.ui.unified.CalendarIntervalType.Day,
					description: this._oRB.getText("PLANNINGCALENDAR_DAYS"),
					intervalsS: 7,
					intervalsM: 7,
					intervalsL: 14
				});
				this._aViews.push(oViewDay);

				var oViewMonth = new sap.m.PlanningCalendarView(this.getId() + "-MonthView", {
					key: sap.ui.unified.CalendarIntervalType.Month,
					intervalType: sap.ui.unified.CalendarIntervalType.Month,
					description: this._oRB.getText("PLANNINGCALENDAR_MONTHS"),
					intervalsS: 3,
					intervalsM: 6,
					intervalsL: 12
				});
				this._aViews.push(oViewMonth);

				var oViewWeek = new sap.m.PlanningCalendarView(this.getId() + "-WeekView", {
					key: sap.ui.unified.CalendarIntervalType.Week,
					intervalType: sap.ui.unified.CalendarIntervalType.Week,
					description: this._oRB.getText("PLANNINGCALENDAR_WEEK"),
					intervalsS: 7,
					intervalsM: 7,
					intervalsL: 7
				});
				this._aViews.push(oViewWeek);

				var oViewOneMonth = new sap.m.PlanningCalendarView(this.getId() + "-OneMonthView", {
					key: sap.ui.unified.CalendarIntervalType.OneMonth,
					intervalType: sap.ui.unified.CalendarIntervalType.OneMonth,
					description: this._oRB.getText("PLANNINGCALENDAR_ONE_MONTH"),
					intervalsS: 1,
					intervalsM: 1,
					intervalsL: 31
				});
				this._aViews.push(oViewOneMonth);
			}

			aViews = this._aViews;
		}

		return aViews;

	}

	function _updateSelectItems() {

		var aViews = _getViews.call(this);
		var aItems = this._oIntervalTypeSelect.getItems();
		var i = 0;
		var oItem;

		if (aViews.length < aItems.length) {
			for (i = aViews.length; i < aItems.length; i++) {
				oItem = aItems[i];
				this._oIntervalTypeSelect.removeItem(oItem);
				oItem.destroy();
			}
		}

		for (i = 0; i < aViews.length; i++) {
			var oView = aViews[i];
			oItem = aItems[i];
			if (oItem) {
				if (oItem.getKey() != oView.getKey() || oItem.getText() != oView.getDescription()) {
					oItem.setKey(oView.getKey());
					oItem.setText(oView.getDescription());
					oItem.setTooltip(oView.getTooltip());
				}
			} else {
				oItem = new sap.ui.core.Item(this.getId() + "-" + i, {
					key: oView.getKey(),
					text: oView.getDescription(),
					tooltip: oView.getTooltip()
				});
				this._oIntervalTypeSelect.addItem(oItem);
			}
		}

		// Toggle interval select visibility if only one items is available there should be no select visible
		this._oIntervalTypeSelect.setVisible(!(aViews.length === 1));

	}

	function _handleSelectAll(oEvent) {

		var bAll = oEvent.getParameter("selected");
		var aRows = this.getRows();

		if (bAll) {
			aRows = this.getRows().filter(function(oRow) {
				return !oRow.getSelected();
			});
		}

		this.selectAllRows(bAll);

		this.fireRowSelectionChange({rows: aRows});

	}

	function _handleLeaveRow(oEvent){

		var oCalendarRow = oEvent.oSource;
		var sType = oEvent.getParameter("type");
		var aRows = this.getRows();
		var oRow;
		var oNewRow;
		var oAppointment;
		var oDate;
		var i = 0;
		var iIndex = 0;
		var oNewEvent;

		for (i = 0; i < aRows.length; i++) {
			oRow = aRows[i];
			if (oRow.getCalendarRow() == oCalendarRow) {
				iIndex = i;
				break;
			}
		}

		switch (sType) {
		case "sapup":
			oAppointment = oCalendarRow.getFocusedAppointment();
			oDate = oAppointment.getStartDate();

			// get nearest appointment in row above
			if (iIndex > 0) {
				iIndex--;
			}

			oNewRow = aRows[iIndex];
			oNewRow.getCalendarRow().focusNearestAppointment(oDate);

			break;

		case "sapdown":
			oAppointment = oCalendarRow.getFocusedAppointment();
			oDate = oAppointment.getStartDate();

			// get nearest appointment in row above
			if (iIndex < aRows.length - 1) {
				iIndex++;
			}

			oNewRow = aRows[iIndex];
			oNewRow.getCalendarRow().focusNearestAppointment(oDate);

			break;

		case "saphome":
			if (iIndex > 0) {
				oNewRow = aRows[0];

				oNewEvent = new jQuery.Event(sType);
				oNewEvent._bPlanningCalendar = true;

				oNewRow.getCalendarRow().onsaphome(oNewEvent);
			}

			break;

		case "sapend":
			if (iIndex < aRows.length - 1) {
				oNewRow = aRows[aRows.length - 1];

				oNewEvent = new jQuery.Event(sType);
				oNewEvent._bPlanningCalendar = true;

				oNewRow.getCalendarRow().onsapend(oNewEvent);
			}

			break;

		default:
			break;
		}

	}

	function _updateSelectAllCheckBox() {

		if (this._oSelectAllCheckBox) {
			var aRows = this.getRows();
			var aSelectedRows = this.getSelectedRows();
			if (aRows.length == aSelectedRows.length && aSelectedRows.length > 0) {
				this._oSelectAllCheckBox.setSelected(true);
			} else {
				this._oSelectAllCheckBox.setSelected(false);
			}
		}

	}

	function _positionSelectAllCheckBox() {

		if (this.getSingleSelection()) {
			if (this._oCalendarHeader.getAllCheckBox()) {
				this._oCalendarHeader.setAllCheckBox();
			}else if (this._oInfoToolbar.getContent().length > 2) {
				this._oInfoToolbar.removeContent(this._oSelectAllCheckBox);
			}
		} else {
			if (!this._oSelectAllCheckBox) {
				this._oSelectAllCheckBox = new sap.m.CheckBox(this.getId() + "-All", {
					text: this._oRB.getText("COLUMNSPANEL_SELECT_ALL")
				});
				this._oSelectAllCheckBox.attachEvent("select", _handleSelectAll, this);
			}
			if (this._iSizeScreen < 2 || !this.getShowRowHeaders()) {
				var iIndex = this._oInfoToolbar.indexOfContent(this._oSelectAllCheckBox);
				if (this._iSizeScreen < 2) {
					// on phone: checkbox below calendar
					if (iIndex < this._oInfoToolbar.getContent().length - 1) {
						this._oInfoToolbar.addContent(this._oSelectAllCheckBox);
					}
				} else if (iIndex < 0 || iIndex > 1) {
					// one column on desktop: checkbox left of calendar
					if (iIndex > 1) {
						// as insertAggregation do not change position in aggregation
						this._oInfoToolbar.removeContent(this._oSelectAllCheckBox);
					}
					this._oInfoToolbar.insertContent(this._oSelectAllCheckBox, 1);
				}
			} else {
				this._oCalendarHeader.setAllCheckBox(this._oSelectAllCheckBox);
			}
		}

	}

	function _handleRowChanged(oEvent) {

		if (oEvent.getParameter("name") == "selected") {
			_updateSelectAllCheckBox.call(this);
		}

	}

	function _setSelectionMode() {

		var oTable = this.getAggregation("table");
		var sMode = oTable.getMode();
		var sModeNew;

		if (this.getSingleSelection()) {
			if (!this.getShowRowHeaders() && this.getRows().length == 1) {
				// if only one row is displayed without header - do not enable row selection
				sModeNew = sap.m.ListMode.None;
			} else {
				sModeNew = sap.m.ListMode.SingleSelectMaster;
			}
		} else {
			sModeNew = sap.m.ListMode.MultiSelect;
		}

		if (sMode != sModeNew) {
			oTable.setMode(sModeNew);
		}

	}

	function _isThereAnIntervalInstance() {
		return this._oTimeInterval || this._oDateInterval || this._oMonthInterval || this._oWeekInterval || this._oOneMonthInterval;
	}
	return PlanningCalendar;

}, /* bExport= */ true);
