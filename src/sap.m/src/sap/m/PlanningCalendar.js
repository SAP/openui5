/*!
 * ${copyright}
 */

//Provides control sap.m.PlanningCalendar.
sap.ui.define([
	'jquery.sap.global',
	'sap/ui/core/Control',
	'sap/ui/base/ManagedObjectObserver',
	'./PlanningCalendarRow',
	'./library',
	'sap/ui/unified/library',
	'sap/ui/unified/calendar/CalendarUtils',
	'sap/ui/unified/calendar/CalendarDate',
	'sap/ui/unified/DateRange',
	'sap/ui/unified/CalendarDateInterval',
	'sap/ui/unified/CalendarWeekInterval',
	'sap/ui/unified/CalendarOneMonthInterval',
	'sap/ui/Device',
	'sap/ui/core/ResizeHandler',
	'sap/ui/core/Item',
	'sap/m/Select',
	'sap/m/Button',
	'sap/m/Toolbar',
	'sap/m/Table',
	'sap/m/Column',
	'./PlanningCalendarRenderer',
	'jquery.sap.events'
],
	function(
	jQuery,
	Control,
	ManagedObjectObserver,
	PlanningCalendarRow,
	library,
	unifiedLibrary,
	CalendarUtils,
	CalendarDate,
	DateRange,
	CalendarDateInterval,
	CalendarWeekInterval,
	CalendarOneMonthInterval,
	Device,
	ResizeHandler,
	Item,
	Select,
	Button,
	Toolbar,
	Table,
	Column,
	PlanningCalendarRenderer
	) {
		"use strict";

	// shortcut for sap.ui.unified.CalendarDayType
	var CalendarDayType = unifiedLibrary.CalendarDayType;

	// shortcut for sap.m.ListMode
	var ListMode = library.ListMode;

	// shortcut for sap.m.ToolbarDesign
	var ToolbarDesign = library.ToolbarDesign;

	// shortcut for sap.m.ButtonType
	var ButtonType = library.ButtonType;

	// shortcut for sap.m.PlanningCalendarBuiltInView
	var PlanningCalendarBuiltInView = library.PlanningCalendarBuiltInView;

	// shortcut for sap.m.ScreenSize
	var ScreenSize = library.ScreenSize;

	// shortcut for sap.ui.unified.CalendarAppointmentVisualization
	var CalendarAppointmentVisualization = unifiedLibrary.CalendarAppointmentVisualization;

	// shortcut for sap.ui.unified.GroupAppointmentsMode
	var GroupAppointmentsMode = unifiedLibrary.GroupAppointmentsMode;

	// shortcut for sap.ui.unified.CalendarIntervalType
	var CalendarIntervalType = unifiedLibrary.CalendarIntervalType;

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
	 * <li>The rows of the <code>PlanningCalendar</code> that contain the assigned appointments.
	 * They can be configured with the <code>rows</code> aggregation, which is of type
	 * {@link sap.m.PlanningCalendarRow PlanningCalendarRow}.</li>
	 * </ul>
	 *
	 * Since 1.48 the empty space in the cell that is below an appointment can be removed by adding
	 * the <code>sapUiCalendarAppFitVertically</code> CSS class to the <code>PlanningCalendar</code>.
	 * Please note that it should be used only for a <code>PlanningCalendar</code> with one appointment per day
	 * for a row that doesn't have interval headers set.
	 *
	 * Since 1.44 alternating row colors can be suppressed by adding the <code>sapMPlanCalSuppressAlternatingRowColors</code>
	 * CSS class to the <code>PlanningCalendar</code>.
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
	 * @since 1.34
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
			viewKey : {type : "string", group : "Appearance", defaultValue : CalendarIntervalType.Hour},

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
			groupAppointmentsMode : {type : "sap.ui.unified.GroupAppointmentsMode", group : "Appearance", defaultValue : GroupAppointmentsMode.Collapsed},

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
			appointmentsVisualization : {type : "sap.ui.unified.CalendarAppointmentVisualization", group : "Appearance", defaultValue : CalendarAppointmentVisualization.Standard},

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
			maxDate : {type : "object", group : "Misc", defaultValue : null},

			/**
			 * Determines whether the day names are displayed in a separate line or inside the single days.
			 * @since 1.50
			 */
			showDayNamesLine : {type : "boolean", group : "Appearance", defaultValue : false},

			/**
			 * Determines if the week numbers are displayed.
			 * @since 1.52
			 */
			showWeekNumbers : {type : "boolean", group : "Appearance", defaultValue : false},

			/**
			 * Defines the list of predefined views as an array.
			 * The views should be specified by their keys.
			 *
			 * The default predefined views and their keys are available at
			 * {@link sap.m.PlanningCalendarBuiltInView}.
			 *
			 * <b>Note:</b> If set, all specified views will be displayed along
			 * with any custom views (if available). If not set and no custom
			 * views are available, all default views will be displayed.
			 * If not set and there are any custom views available, only the
			 * custom views will be displayed.
			 * @since 1.50
			 */
			builtInViews : {type : "string[]", group : "Appearance", defaultValue : []},

			/**
			 * Determines whether the header area will remain visible (fixed on top) when the rest of the content is scrolled out of view.
			 *
			 * The sticky header behavior is automatically disabled on phones in landscape mode for better visibility of the content.
			 *
			 * <b>Note:</b> There is limited browser support, hence the API is in experimental state.
			 * Browsers that currently support this feature are Chrome (desktop and mobile), Safari (desktop and mobile) and Edge 41.
			 *
			 * There are also some known issues with respect to the scrolling behavior and focus handling. A few are given below:
			 *
			 * When the PlanningCalendar is placed in certain layout containers, for example the <code>GridLayout</code> control,
			 * the column headers do not fix at the top of the viewport. Similar behavior is also observed with the <code>ObjectPage</code> control.
			 *
			 * This API should not be used in production environment.
			 *
			 * @experimental As of 1.54
			 * @since 1.54
			 */
			stickyHeader : {type : "boolean", group : "Appearance", defaultValue : false}
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
					multiSelect : {type : "boolean"},

					/**
					 * Gives the ID of the DOM element of the clicked appointment
					 * @since 1.50.0
					 */
					domRefId: {type: "string"}
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
		},
		designtime: "sap/m/designtime/PlanningCalendar.designtime"
	},
		constructor: function(vId, mSettings) {
			Control.prototype.constructor.apply(this, arguments);

			if (typeof vId !== "string"){
				mSettings = vId;
			}

			if (mSettings && typeof mSettings.customAppointmentsSorterCallback === "function") {
				this._fnCustomSortedAppointments = mSettings.customAppointmentsSorterCallback;
			}
		}
	});

	//List of private properties controlling different intervals
	var INTERVAL_CTR_REFERENCES = ["_oTimeInterval", "_oDateInterval", "_oMonthInterval", "_oWeekInterval", "_oOneMonthInterval"],
	//Holds metadata of the different interval instances that should be created.
		INTERVAL_METADATA = {};

	INTERVAL_METADATA[CalendarIntervalType.Day] = {
		sInstanceName: "_oDateInterval",
		sIdSuffix: "-DateInt",
		oClass: CalendarDateInterval
	};

	INTERVAL_METADATA[CalendarIntervalType.Week] = {
		sInstanceName: "_oWeekInterval",
		sIdSuffix: "-WeekInt",
		oClass: CalendarWeekInterval
	};

	INTERVAL_METADATA[CalendarIntervalType.OneMonth] = {
		sInstanceName: "_oOneMonthInterval",
		sIdSuffix: "-OneMonthInt",
		oClass: CalendarOneMonthInterval
	};

	//Defines the minimum screen width for the appointments column (it is a popin column)
	var APP_COLUMN_MIN_SCREEN_WIDTH = ScreenSize.Desktop;

	//All supported built-in views
	var KEYS_FOR_ALL_BUILTIN_VIEWS = [
		PlanningCalendarBuiltInView.Hour,
		PlanningCalendarBuiltInView.Day,
		PlanningCalendarBuiltInView.Month,
		PlanningCalendarBuiltInView.Week,
		PlanningCalendarBuiltInView.OneMonth];

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

		this._iBreakPointTablet = Device.media._predefinedRangeSets[Device.media.RANGESETS.SAP_STANDARD_EXTENDED].points[0];
		this._iBreakPointDesktop = Device.media._predefinedRangeSets[Device.media.RANGESETS.SAP_STANDARD_EXTENDED].points[1];
		this._iBreakPointLargeDesktop = Device.media._predefinedRangeSets[Device.media.RANGESETS.SAP_STANDARD_EXTENDED].points[2];

		if (Device.system.phone || jQuery('html').hasClass("sapUiMedia-Std-Phone")) {
			this._iSize = 0;
			this._iSizeScreen = 0;
		}else if (Device.system.tablet || jQuery('html').hasClass("sapUiMedia-Std-Tablet")) {
			this._iSize = 1;
			this._iSizeScreen = 1;
		}else {
			this._iSize = 2;
			this._iSizeScreen = 2;
		}

		this._oRB = sap.ui.getCore().getLibraryResourceBundle("sap.m");

		var sId = this.getId();
		this._oIntervalTypeSelect = new Select(sId + "-IntType", {maxWidth: "15rem", ariaLabelledBy: sId + "-SelDescr"});
		this._oIntervalTypeSelect.attachEvent("change", _changeIntervalType, this);

		this._oTodayButton = new Button(sId + "-Today", {
			text: this._oRB.getText("PLANNINGCALENDAR_TODAY"),
			type: ButtonType.Transparent
		});
		this._oTodayButton.attachEvent("press", this._handleTodayPress, this);

		this._oHeaderToolbar = new Toolbar(sId + "-HeaderToolbar", {
			design: ToolbarDesign.Transparent,
			content: [this._oIntervalTypeSelect, this._oTodayButton]
		});

		this._oCalendarHeader = new CalendarHeader(sId + "-CalHead", {
			toolbar: this._oHeaderToolbar
		});

		this._oInfoToolbar = new Toolbar(sId + "-InfoToolbar", {
			height: "auto",
			design: ToolbarDesign.Transparent,
			content: [this._oCalendarHeader, this._oTimeInterval]
		});

		var oTable = new Table(sId + "-Table", {
			infoToolbar: this._oInfoToolbar,
			mode: ListMode.SingleSelectMaster,
			columns: [ new Column({
					styleClass: "sapMPlanCalRowHead"
				}),
				new Column({
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
		this._fnCustomSortedAppointments = undefined; //transfers a custom appointments sorter function to the CalendarRow

	};

	PlanningCalendar.prototype.exit = function(){

		if (this._sResizeListener) {
			ResizeHandler.deregister(this._sResizeListener);
			this._sResizeListener = undefined;
		}

		Device.orientation.detachHandler(this._updateStickyHeader, this);

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

		if (this._oViews) {
			for (var sKey in this._oViews) {
				this._oViews[sKey].destroy();
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

		Device.orientation.detachHandler(this._updateStickyHeader, this);

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
	 * Verifies if the given date matches the range of given view,
	 * based on the visibility of the current date.
	 * @param {Date} oDateTime the given date
	 * @param {string} sViewKey the key of a view
	 * @returns {boolean} if the date is in the visible range
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
		// also it calls _updateStickyHeader function and in case of stickyHeader property set to true
		// all needed classes will be updated
		oEvent.size = {width: this.getDomRef().offsetWidth};
		_handleResize.call(this, oEvent, true);

		if (!this._sResizeListener) {
			this._sResizeListener = ResizeHandler.register(this, this._resizeProxy);
		}

		if (Device.system.phone && this.getStickyHeader()) {
			Device.orientation.attachHandler(this._updateStickyHeader, this);
		}

		this._updateCurrentTimeVisualization(false); // CalendarRow sets visualization onAfterRendering

	};

	/**
	 * Sets the given date as start date. The current date is used as default.
	 * Depending on the current view the start date may be adjusted (for example, the week view shows always the first weekday
	 * of the same week as the given date).
	 * @param {Date} oStartDate the date to set as <code>sap.m.PlanningCalendar</code> <code>startDate</code>. May be changed(adjusted) if
	 * property <code>startDate</code> is adjusted. See remark about week view above.
	 * @returns {sap.m.PlanningCalendar} <code>this</code> to allow method chaining
	 * @public
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

		if (this.getViewKey() === PlanningCalendarBuiltInView.Week) {
			/* Calculate the first week date for the given oStartDate. Have in mind that the oStartDate is the date that
			 * the user sees in the UI, thus - local one. As CalendarUtils.getFirstDateOfWeek works with UTC dates (this
			 * is because the dates are timezone irrelevant), it should be called with the local datetime values presented
			 * as UTC ones(e.g. if oStartDate is 21 Dec 1981, 13:00 GMT+02:00, it will be converted to 21 Dec 1981, 13:00 GMT+00:00)
			 */
			oFirstDateOfWeek = CalendarUtils.getFirstDateOfWeek(CalendarUtils._createUniversalUTCDate(oStartDate, undefined, true));
			//CalendarUtils.getFirstDateOfWeek works with UTC based date values, restore the result back in local timezone.
			oStartDate.setTime(CalendarUtils._createLocalDate(oFirstDateOfWeek, true).getTime());
		}

		if (this.getViewKey() === PlanningCalendarBuiltInView.OneMonth) {
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

		if (this.getViewKey() === PlanningCalendarBuiltInView.Week || this.getViewKey() === PlanningCalendarBuiltInView.OneMonth) {
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

		if (sKey === PlanningCalendarBuiltInView.Week || sKey === PlanningCalendarBuiltInView.OneMonth) {
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
			case CalendarIntervalType.Hour:
				if (!this._oTimeInterval) {
					this._oTimeInterval = new sap.ui.unified.CalendarTimeInterval(this.getId() + "-TimeInt", {
						startDate: new Date(oStartDate.getTime()), // use new date object
						items: iIntervals,
						pickerPopup: true,
						legend: this.getLegend()
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

			case CalendarIntervalType.Day:
			case CalendarIntervalType.Week:
			case CalendarIntervalType.OneMonth:
				//Date, Week and OneMonth intervals share the same object artifacts
				oIntervalMetadata = INTERVAL_METADATA[sIntervalType];
				oInterval = this[oIntervalMetadata.sInstanceName];

				if (!oInterval) {
					oInterval = new oIntervalMetadata.oClass(this.getId() + oIntervalMetadata.sIdSuffix, {
						startDate: new Date(oStartDate.getTime()), // use new date object
						days: iIntervals,
						showDayNamesLine: this.getShowDayNamesLine(),
						pickerPopup: true,
						legend: this.getLegend(),
						showWeekNumbers: this.getShowWeekNumbers()
					});

					oInterval.attachEvent("startDateChange", this._handleStartDateChange, this);
					oInterval.attachEvent("select", this._handleCalendarSelect, this);

					if (sKey === PlanningCalendarBuiltInView.OneMonth) {
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

			case CalendarIntervalType.Month:
				if (!this._oMonthInterval) {
					this._oMonthInterval = new sap.ui.unified.CalendarMonthInterval(this.getId() + "-MonthInt", {
						startDate: new Date(oStartDate.getTime()), // use new date object
						months: iIntervals,
						pickerPopup: true,
						legend: this.getLegend()
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
				// only set timer, CalendarRow will be re-rendered, so no update needed here
				this._updateCurrentTimeVisualization(false);
				_adaptCalHeaderForWeekNumbers.call(this, this.getShowWeekNumbers(), this._viewAllowsWeekNumbers(sKey));
				_adaptCalHeaderForDayNamesLine.call(this, this.getShowDayNamesLine(), !!oInterval);
			}
		}

		if (this._oOneMonthInterval && sKey === PlanningCalendarBuiltInView.OneMonth) {
			this._oOneMonthInterval._setDisplayMode(this._iSize);
			this._oOneMonthInterval._adjustSelectedDate(CalendarDate.fromLocalJSDate(oOldStartDate));
			if (this._iSize < 2) {
				this._setRowsStartDate(oOldStartDate);
			}
		} else if (this._oOneMonthInterval
			&& sOldViewKey === PlanningCalendarBuiltInView.OneMonth
			&& this._oOneMonthInterval.getSelectedDates().length) {
			oSelectedDate = this._oOneMonthInterval.getSelectedDates()[0].getStartDate();
			if (oSelectedDate) {
				this.setStartDate(oSelectedDate);
			}
		}

		this._updateTodayButtonState();

		return this;

	};

	/**
	 * Determines if the week numbers are visible for a given view.
	 * @param {string} sViewKey The view key
	 * @returns {boolean} true if the week numbers are allowed for the current view
	 * @private
	 */
	PlanningCalendar.prototype._viewAllowsWeekNumbers = function(sViewKey) {
		var sIntervalType = this._getView(sViewKey).getIntervalType(),
			oIntervalMetadata = INTERVAL_METADATA[sIntervalType];

		return !!oIntervalMetadata && !!oIntervalMetadata.oClass.prototype.setShowWeekNumbers;
	};

	/**
	 * Determines if the day names line is allowed for a given view.
	 * @param {string} sViewKey The view key
	 * @returns {boolean} true if the day names line is allowed for the current view
	 * @private
	 */
	PlanningCalendar.prototype._viewAllowsDayNamesLine = function(sViewKey) {
		var sIntervalType = this._getView(sViewKey).getIntervalType(),
			oIntervalMetadata = INTERVAL_METADATA[sIntervalType];

		return !!oIntervalMetadata && !!oIntervalMetadata.oClass.prototype.setShowDayNamesLine;
	};

	/**
	 * Returns the interval for a given view.
	 * @param {string} sViewKey Key of a view
	 * @returns {*} Interval instance in the passed view, if it is already created and has metadata, otherwise returns undefined.
	 * @private
	 */
	PlanningCalendar.prototype._getIntervalInstanceByViewKey = function(sViewKey) {
		var sIntervalType = this._getView(sViewKey).getIntervalType(),
			oIntervalMetadata = INTERVAL_METADATA[sIntervalType],
			oInterval;
		if (oIntervalMetadata) {
			oInterval = this[oIntervalMetadata.sInstanceName];
		}

		return oInterval;
	};

	PlanningCalendar.prototype.setShowWeekNumbers = function (bValue) {
		this.setProperty("showWeekNumbers", bValue, true);

		this._getViews().forEach(function(oView) {
			var sViewKey = oView.getKey(),
				bViewAllowsWeekNumbers = this._viewAllowsWeekNumbers(sViewKey),
				oInterval = this._getIntervalInstanceByViewKey(sViewKey);

			if (oInterval && bViewAllowsWeekNumbers) {
				this._getIntervalInstanceByViewKey(sViewKey).setShowWeekNumbers(bValue);
			}

			//update the pc header classes if needed
			if (this.getDomRef() && this.getViewKey() === sViewKey) {
				_adaptCalHeaderForWeekNumbers.call(this, bValue, bViewAllowsWeekNumbers);
			}
		}, this);

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


	PlanningCalendar.prototype.setShowDayNamesLine = function(bShowDayNamesLine){

		var intervalMetadata,
			sInstanceName,
			oCalDateInterval,
			bRendered = !!this.getDomRef(),
			sCurrentViewKey = this.getViewKey();

		for (intervalMetadata in  INTERVAL_METADATA) {
			sInstanceName = INTERVAL_METADATA[intervalMetadata].sInstanceName;
			if (this[sInstanceName]) {
				oCalDateInterval = this[sInstanceName];
				oCalDateInterval.setShowDayNamesLine(bShowDayNamesLine);

				if (bRendered && intervalMetadata === sCurrentViewKey) {
					_adaptCalHeaderForDayNamesLine.call(this, bShowDayNamesLine, true);
				}
			}
		}

		return this.setProperty("showDayNamesLine", bShowDayNamesLine, false);

	};

	/**
	 * Sets the stickyHeader property.
	 * @override
	 * @public
	 * @param {boolean} bStick Whether the header area will remain visible (fixed on top)
	 * @returns {sap.m.PlanningCalendar} this pointer for chaining
	 */
	PlanningCalendar.prototype.setStickyHeader = function(bStick) {
		if (this.getStickyHeader() === bStick) {
			return this;
		}

		this.setProperty("stickyHeader", bStick, true);
		if (Device.system.phone) {
			if (bStick) {
				Device.orientation.attachHandler(this._updateStickyHeader, this);
			} else {
				Device.orientation.detachHandler(this._updateStickyHeader, this);
			}
		}
		this._updateStickyHeader();

		return this;
	};

	PlanningCalendar.prototype._updateStickyHeader = function() {
		var bStick = this.getStickyHeader(),
			bMobile1MonthView = this.getViewKey() === PlanningCalendarBuiltInView.OneMonth && this._iSize < 2,
			bStickyToolbar = bStick && !Device.system.phone && !bMobile1MonthView,
			bStickyInfoToolbar = bStick && !(Device.system.phone && Device.orientation.landscape) && !bMobile1MonthView;

		if (this._oToolbar) {
			this._oToolbar.toggleStyleClass("sapMPlanCalStickyHeader", bStickyToolbar);
		}
		if (this._oInfoToolbar) {
			this._oInfoToolbar.toggleStyleClass("sapMPlanCalStickyHeader", bStickyInfoToolbar);
		}
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

		//when there's a new row added, be sure that if there's a custom sorter, it'll be set to the corresponding row
		if (this._fnCustomSortedAppointments){
			oCalendarRow._setCustomAppointmentsSorterCallback(this._fnCustomSortedAppointments);
		}

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

		//when there's a new row inserted, be sure that if there's a custom sorter, it'll be set to the corresponding row
		if (this._fnCustomSortedAppointments){
			oCalendarRow._setCustomAppointmentsSorterCallback(this._fnCustomSortedAppointments);
		}

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

		//the reference to the sorter function must be cleared, as it is invalid in other context
		if (this._fnCustomSortedAppointments){
			oCalendarRow._fnCustomSortedAppointments = undefined;
		}

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

			//the reference to the sorter function must be cleared, as it is invalid in other context
			if (this._fnCustomSortedAppointments){
				oCalendarRow._fnCustomSortedAppointments = undefined;
			}
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

	PlanningCalendar.prototype.setLegend = function(vLegend){

		this.setAssociation("legend", vLegend, true);

		var aRows = this.getRows(),
			oLegend = this.getLegend() && sap.ui.getCore().byId(this.getLegend()),
			oLegendDestroyObserver;

		for (var i = 0; i < aRows.length; i++) {
			var oRow = aRows[i];
			oRow.getCalendarRow().setLegend(vLegend);
		}

		INTERVAL_CTR_REFERENCES.forEach(function (sControlRef) {
			if (this[sControlRef]) {
				this[sControlRef].setLegend(vLegend);
			}
		}, this);

		if (oLegend) { //destroy of the associated legend should rerender the PlanningCalendar
			oLegendDestroyObserver = new ManagedObjectObserver(function(oChanges) {
				this.invalidate();
			}.bind(this));
			oLegendDestroyObserver.observe(oLegend, {
				destroy: true
			});
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
		var bOriginInstanceOfDateRange = oOrigin && oOrigin instanceof DateRange;
		//The check for _bIsBeingDestroyed is because here there's no need of any actions when
		//the control is destroyed. It's all handled in the Control's invalidate method.
		if (!this._bIsBeingDestroyed && (this._bDateRangeChanged || bOriginInstanceOfDateRange)) {
			// DateRange changed -> only invalidate calendar control
			if (this.getDomRef()) {
				var sKey = this.getViewKey();
				var oView = this._getView(sKey);
				var sIntervalType = oView.getIntervalType();

				switch (sIntervalType) {
				case CalendarIntervalType.Hour:
					if (this._oTimeInterval) {
						this._oTimeInterval.invalidate(arguments);
					}
					break;

				case CalendarIntervalType.Day:
					if (this._oDateInterval) {
						this._oDateInterval.invalidate(arguments);
					}
					break;

				case CalendarIntervalType.Month:
					if (this._oMonthInterval) {
						this._oMonthInterval.invalidate(arguments);
					}
					break;
				case CalendarIntervalType.OneMonth:
					if (this._oOneMonthInterval) {
						this._oOneMonthInterval.invalidate(arguments);
					}
					break;

				case CalendarIntervalType.Week:
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
		if (oSpecialDate.getType() === CalendarDayType.NonWorking) {
			this.getAggregation("rows").forEach(function (oRow){
				oRow.addAggregation("_nonWorkingDates", this._buildPCRowDateRange(oSpecialDate));
			}, this);
		}

		return Control.prototype.addAggregation.call(this, "specialDates", oSpecialDate);
	};

	PlanningCalendar.prototype.insertSpecialDate = function (oSpecialDate, iIndex) {
		this._bDateRangeChanged = true;

		// forward to PlanningCalendarRow
		if (oSpecialDate.getType() === CalendarDayType.NonWorking) {
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
		if (oSpecialDate && oSpecialDate.getType() === CalendarDayType.NonWorking) {
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
		var aRemoved = this.removeAllAggregation("views"),
			aBuiltInViews = this.getBuiltInViews();
		if (aBuiltInViews.length) {
			this.setViewKey(aBuiltInViews[0]);
		} else {
			this.setViewKey(KEYS_FOR_ALL_BUILTIN_VIEWS[0]);
		}
		return aRemoved;

	};

	PlanningCalendar.prototype.destroyViews = function() {

		this._bCheckView = true; // update view setting onbeforerendering
		var oDestroyed = this.destroyAggregation("views"),
			aBuiltInViews = this.getBuiltInViews();
		if (aBuiltInViews.length) {
			this.setViewKey(aBuiltInViews[0]);
		} else {
			this.setViewKey(KEYS_FOR_ALL_BUILTIN_VIEWS[0]);
		}
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

	PlanningCalendar.prototype.setBuiltInViews = function(aBuiltInViews) {
		this.setProperty("builtInViews", aBuiltInViews);
		this.setViewKey(this._getViews()[0].getKey());
		return this;
	};

	PlanningCalendar.prototype.removeView = function(oView) {
		var oResult = this.removeAggregation("views", oView);
		if (!this.getViews().length) {
			this.setViewKey(this._getViews()[0].getKey());
		}
		return oResult;
	};

	/**
	 * Gets the correct <code>PlanningCalendarView</code> interval depending on the screen size.
	 * @param {PlanningCalendarView} oView Target view
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
	 * @param {string} sKey <code>PlanningCalendarView</code> key
	 * @param {boolean} bNoError Determines if an error should be thrown (false) or not (true) when the given view is missing
	 * @returns {sap.m.PlanningCalendarView} The view of the PlanningCalendar
	 * @private
	 */
	PlanningCalendar.prototype._getView = function (sKey, bNoError) {

		var aViews = this._getViews();
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
	 * @param {boolean} bUpdateRows if there is need for updating the rows
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
			case CalendarIntervalType.Hour:
				iTime = 60000;
				iStartTime = oStartDate.getTime() - 3600000;
				iEndTime = oStartDate.getTime() + iIntervals * 3600000;
				break;

			case CalendarIntervalType.Day:
			case CalendarIntervalType.Week:
			case CalendarIntervalType.OneMonth:
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
	 * @param {jQuery.Event} oEvent the triggered event
	 * @private
	 */
	PlanningCalendar.prototype._handleTodayPress = function (oEvent) {
		var oDate = new Date(),
			oStartDate,
			sViewKey = this.getViewKey();

		// if the OneMonth view is selected and Today btn is pressed,
		// the calendar should start from the 1st date of the current month
		if (sViewKey === PlanningCalendarBuiltInView.OneMonth) {
			oStartDate = CalendarUtils.getFirstDateOfMonth(CalendarUtils._createUniversalUTCDate(oDate, undefined, true));
			this._oOneMonthInterval._adjustSelectedDate(CalendarDate.fromLocalJSDate(oDate), false);

			oDate = CalendarUtils._createLocalDate(oStartDate, true);
		}

		if (sViewKey === PlanningCalendarBuiltInView.Week) {
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
	 * @param {jQuery.Event} oEvent the triggered event
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
		if (sIntervalType !== CalendarIntervalType.OneMonth
			|| this._iSize > 1) {
			aSelectedDates[0].setStartDate();
		}

		switch (sIntervalType) {
		case CalendarIntervalType.Hour:
			oEndDate.setUTCHours(oEndDate.getUTCHours() + 1);
			break;

		case CalendarIntervalType.Day:
		case CalendarIntervalType.Week:
			oEndDate.setUTCDate(oEndDate.getUTCDate() + 1);
			break;
		case CalendarIntervalType.OneMonth:
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
		case CalendarIntervalType.Month:
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
	 * @param {sap.ui.unified.DateRange} oSource the DateRange to be copied
	 * @returns {sap.ui.unified.DateRange} the copied DateRange
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

		if (sIntervalType === CalendarIntervalType.OneMonth
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

	function _adaptCalHeaderForWeekNumbers(bShowWeekNumbers, bCurrentIntervalAllowsWeekNumbers) {
		this.$().toggleClass("sapMPlanCalWithWeekNumbers", bShowWeekNumbers && bCurrentIntervalAllowsWeekNumbers);
	}

	function _adaptCalHeaderForDayNamesLine(bShowDayNamesLine, bCurrentIntervalAllowsDayNamesLine) {
		this.$().toggleClass("sapMPlanCalWithDayNamesLine", bShowDayNamesLine && bCurrentIntervalAllowsDayNamesLine);
	}

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
			case CalendarIntervalType.Hour:
				if (this._oTimeInterval && this._oTimeInterval.getItems() != iIntervals) {
					this._oTimeInterval.setItems(iIntervals);
				}
				break;

			case CalendarIntervalType.Day:
				if (this._oDateInterval && this._oDateInterval.getDays() != iIntervals) {
					this._oDateInterval.setDays(iIntervals);
				}
				break;

			case CalendarIntervalType.Month:
				if (this._oMonthInterval && this._oMonthInterval.getMonths() != iIntervals) {
					this._oMonthInterval.setMonths(iIntervals);
				}
				break;

			case CalendarIntervalType.Week:
				if (this._oWeekInterval && this._oWeekInterval.getDays() != iIntervals) {
					this._oWeekInterval.setDays(iIntervals);
				}
				break;

			case CalendarIntervalType.OneMonth:
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

		// Call _updateStickyHeader only if the property stickyHeader is set to true
		// in order to set or remove the sticky class in special cases like 1MonthView or phone landscape
		// otherwise nothing should be updated
		if (this.getStickyHeader()) {
			this._updateStickyHeader();
		}
	}

	function _handleAppointmentSelect(oEvent) {

		var oAppointment = oEvent.getParameter("appointment"),
			bMultiSelect = oEvent.getParameter("multiSelect"),
			aAppointments = oEvent.getParameter("appointments"),
			sGroupAppointmentDomRef = oEvent.getParameter("domRefId"),
			oEventParam,
			aRows,
			oRow,
			oCalendarRow,
			aRowAppointments,
			oRowAppointment,
			i, j;

		if (!bMultiSelect) {
			// deselect appointments of other rows
			aRows = this.getRows();
			for (i = 0; i < aRows.length; i++) {
				oRow = aRows[i];
				oCalendarRow = oRow.getCalendarRow();
				if (oEvent.oSource != oCalendarRow) {
					aRowAppointments = oRow.getAppointments();
					for (j = 0; j < aRowAppointments.length; j++) {
						oRowAppointment = aRowAppointments[j];
						oRowAppointment.setSelected(false);
					}
				}
			}
		}

		oEventParam = {appointment: oAppointment, appointments: aAppointments, multiSelect: bMultiSelect, domRefId: sGroupAppointmentDomRef};
		this.fireAppointmentSelect(oEventParam);

	}

	/**
	 * Sets the start dates of all calendar rows to a given date.
	 * @param {Date} oDateTime the given start date
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
	 * @param {boolean} popinEnabled the current popin state of the appointments column
	 * @private
	 */
	PlanningCalendar.prototype._toggleAppointmentsColumnPopinState = function(popinEnabled) {
		var oTable = this.getAggregation("table"),
			oAppointmentsCol = oTable.getColumns()[1];

		oAppointmentsCol.setDemandPopin(popinEnabled);
		oAppointmentsCol.setMinScreenWidth(popinEnabled ? APP_COLUMN_MIN_SCREEN_WIDTH : "");
	};

	PlanningCalendar.prototype._getViews = function() {
		var aCustomViews = this.getViews(),
			aBuildInViews = this.getBuiltInViews(),
			aResultViews,
			aKeysForBuiltInViews = [],
			oViewType = PlanningCalendarBuiltInView,
			oIntervalType = CalendarIntervalType;

		if (!this._oViews) {
			this._oViews = {};
		}

		if (aBuildInViews.length) {
			aKeysForBuiltInViews = aBuildInViews;
		} else {
			aKeysForBuiltInViews = aCustomViews.length ? [] : KEYS_FOR_ALL_BUILTIN_VIEWS;
		}

		aResultViews = aKeysForBuiltInViews.map(function (sViewKey) {
			switch (sViewKey) {
				case oViewType.Hour:
					return this._oViews[oViewType.Hour] ||
						(this._oViews[oViewType.Hour] = new sap.m.PlanningCalendarView(this.getId() + "-HourView", {
							key: oViewType.Hour,
							intervalType: oIntervalType.Hour,
							description: this._oRB.getText("PLANNINGCALENDAR_HOURS"),
							intervalsS: 6,
							intervalsM: 6,
							intervalsL: 12
						}));
				case oViewType.Day:
					return this._oViews[oViewType.Day] ||
						(this._oViews[oViewType.Day] = new sap.m.PlanningCalendarView(this.getId() + "-DayView", {
							key: oViewType.Day,
							intervalType: oIntervalType.Day,
							description: this._oRB.getText("PLANNINGCALENDAR_DAYS"),
							intervalsS: 7,
							intervalsM: 7,
							intervalsL: 14
						}));
				case oViewType.Month:
					return  this._oViews[oViewType.Month] ||
						(this._oViews[oViewType.Month] = new sap.m.PlanningCalendarView(this.getId() + "-MonthView", {
							key: oViewType.Month,
							intervalType: oIntervalType.Month,
							description: this._oRB.getText("PLANNINGCALENDAR_MONTHS"),
							intervalsS: 3,
							intervalsM: 6,
							intervalsL: 12
						}));
				case oViewType.Week:
					return this._oViews[oViewType.Week] ||
						(this._oViews[oViewType.Week] = new sap.m.PlanningCalendarView(this.getId() + "-WeekView", {
							key: oViewType.Week,
							intervalType: oIntervalType.Week,
							description: this._oRB.getText("PLANNINGCALENDAR_WEEK"),
							intervalsS: 7,
							intervalsM: 7,
							intervalsL: 7
						}));
				case oViewType.OneMonth:
					return this._oViews[oViewType.OneMonth] ||
						( this._oViews[oViewType.OneMonth] = new sap.m.PlanningCalendarView(this.getId() + "-OneMonthView", {
							key: oViewType.OneMonth,
							intervalType: oIntervalType.OneMonth,
							description: this._oRB.getText("PLANNINGCALENDAR_ONE_MONTH"),
							intervalsS: 1,
							intervalsM: 1,
							intervalsL: 31
						}));
				default:
					jQuery.sap.log.error("Cannot get PlanningCalendar views. Invalid view key " + sViewKey);
					break;
			}
		}, this);

		for (var sKeyExistingViews in this._oViews) { //remove all redundant views
			if (aKeysForBuiltInViews.indexOf(sKeyExistingViews) < 0) {
				this._oViews[sKeyExistingViews].destroy();
				delete this._oViews[sKeyExistingViews];
			}
		}

		if (aCustomViews.length) {
			aResultViews = aResultViews.concat(aCustomViews);
		}

		return aResultViews;
	};


	/**
	 * Holds the selected appointments. If no appointments are selected, an empty array is returned.
	 * @returns {sap.ui.unified.CalendarAppointment[]} Array of IDs of selected appointments
	 * @since 1.54
	 * @public
	 */
	PlanningCalendar.prototype.getSelectedAppointments = function() {
		var aSelAppointments = [];

		this.getRows().filter(function(oRow){
			aSelAppointments.push.apply(aSelAppointments, oRow.getCalendarRow().aSelectedAppointments);
		});

		return aSelAppointments;
	};

	/**
	 * Setter for custom sorting of appointments. If not used, the appointments will be sorted according to their duration vertically.
	 * For example, the start time and order to the X axis won't change.
	 * @param {appointmentsSorterCallback} fnSorter
	 * @since 1.54
	 * @returns {sap.m.PlanningCalendar} <code>this</code> for chaining
	 */
	PlanningCalendar.prototype.setCustomAppointmentsSorterCallback = function(fnSorter) {
		/**
		 * This callback is displayed as part of the Requester class.
		 * @callback appointmentsSorterCallback
		 * @param {sap.ui.unified.CalendarAppointment} appointment1
		 * @param {sap.ui.unified.CalendarAppointment} appointment2
		 */
		if (typeof fnSorter === "function") {
			this.getRows().forEach(function(oRow){
				var oCalendarRow = oRow.getCalendarRow();
				oCalendarRow._setCustomAppointmentsSorterCallback(fnSorter);
			});

			this._fnCustomSortedAppointments = fnSorter;
		}
		return this;
	};

	/**
	 * Getter for custom appointments sorter (if any).
	 * @since 1.54
	 * @returns {appointmentsSorterCallback}
	 */
	PlanningCalendar.prototype.getCustomAppointmentsSorterCallback = function() {
		return this._fnCustomSortedAppointments;
	};

	/**
	 * Removes all previously selected appointments on all rows whenever a new appointment is pressed
	 * @private
	 */
	PlanningCalendar.prototype._onRowDeselectAppointment = function() {
		var rows = this.getRows();

		for (var i = 0; i < rows.length; i++) {
			var aApps = rows[i].getCalendarRow().aSelectedAppointments;
			for (var j = 0; j < aApps.length; j++) {
				var oApp = sap.ui.getCore().byId(aApps[j]);
				if (oApp) {
					oApp.setProperty("selected", false, true);
					oApp.$().removeClass("sapUiCalendarAppSel");
				}

			}
			rows[i].getCalendarRow().aSelectedAppointments = [];
		}
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
					design: ToolbarDesign.Transpaent
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

	function _updateSelectItems() {

		var aViews = this._getViews();
		this._oIntervalTypeSelect.destroyItems();
		var i;
		var oItem;

		for (i = 0; i < aViews.length; i++) {
			var oView = aViews[i];
				oItem = new Item(this.getId() + "-" + i, {
					key: oView.getKey(),
					text: oView.getDescription(),
					tooltip: oView.getTooltip()
				});
			this._oIntervalTypeSelect.addItem(oItem);
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
				sModeNew = ListMode.None;
			} else {
				sModeNew = ListMode.SingleSelectMaster;
			}
		} else {
			sModeNew = ListMode.MultiSelect;
		}

		if (sMode != sModeNew) {
			oTable.setMode(sModeNew);
		}

	}

	function _isThereAnIntervalInstance() {
		return this._oTimeInterval || this._oDateInterval || this._oMonthInterval || this._oWeekInterval || this._oOneMonthInterval;
	}

	return PlanningCalendar;
});
