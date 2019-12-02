/*!
 * ${copyright}
 */

//Provides control sap.m.PlanningCalendar.
sap.ui.define([
	'sap/m/delegate/DateNavigation',
	'sap/ui/core/Control',
	'sap/ui/base/ManagedObject',
	'sap/ui/base/ManagedObjectObserver',
	'sap/ui/unified/library',
	'sap/ui/unified/calendar/CalendarUtils',
	'sap/ui/unified/calendar/CalendarDate',
	'sap/ui/unified/calendar/DatesRow',
	'sap/ui/unified/calendar/OneMonthDatesRow',
	'sap/ui/unified/calendar/MonthsRow',
	'sap/ui/unified/calendar/TimesRow',
	'sap/ui/unified/DateRange',
	'sap/ui/unified/CalendarAppointment',
	'sap/ui/unified/CalendarRow',
	'sap/ui/unified/CalendarRowRenderer',
	'sap/ui/Device',
	'sap/ui/core/Core',
	'sap/ui/core/Element',
	'sap/ui/core/Renderer',
	'sap/ui/core/ResizeHandler',
	'sap/ui/core/InvisibleText',
	'sap/ui/core/Item',
	'sap/ui/core/dnd/DragInfo',
	'sap/ui/core/dnd/DropInfo',
	'sap/ui/core/dnd/DragDropInfo',
	'sap/ui/core/format/DateFormat',
	'sap/m/Select',
	'sap/m/Button',
	'sap/m/OverflowToolbar',
	'sap/m/Toolbar',
	'sap/m/Table',
	'sap/m/Column',
	'sap/m/ColumnListItem',
	'sap/m/ColumnListItemRenderer',
	'sap/m/SegmentedButtonItem',
	'sap/m/StandardListItem',
	'sap/m/StandardListItemRenderer',
	'sap/m/PlanningCalendarHeader',
	'sap/m/PlanningCalendarRow',
	'sap/m/PlanningCalendarRenderer',
	'sap/m/PlanningCalendarView',
	'sap/m/CheckBox',
	'sap/m/library',
	"sap/base/util/deepEqual",
	"sap/base/Log",
	"sap/ui/thirdparty/jquery",
	// jQuery Plugin "control"
	"sap/ui/dom/jquery/control"
], function(
	DateNavigation,
	Control,
	ManagedObject,
	ManagedObjectObserver,
	unifiedLibrary,
	CalendarUtils,
	CalendarDate,
	DatesRow,
	OneMonthDatesRow,
	MonthsRow,
	TimesRow,
	DateRange,
	CalendarAppointment,
	CalendarRow,
	CalendarRowRenderer,
	Device,
	Core,
	Element,
	Renderer,
	ResizeHandler,
	InvisibleText,
	Item,
	DragInfo,
	DropInfo,
	DragDropInfo,
	DateFormat,
	Select,
	Button,
	OverflowToolbar,
	Toolbar,
	Table,
	Column,
	ColumnListItem,
	ColumnListItemRenderer,
	SegmentedButtonItem,
	StandardListItem,
	StandardListItemRenderer,
	PlanningCalendarHeader,
	PlanningCalendarRow,
	PlanningCalendarRenderer,
	PlanningCalendarView,
	CheckBox,
	library,
	deepEqual,
	Log,
	jQuery
) {
	"use strict";

	// shortcut for sap.m.Sticky
	var Sticky = library.Sticky;

	// shortcut for sap.ui.unified.CalendarDayType
	var CalendarDayType = unifiedLibrary.CalendarDayType;

	// shortcut for sap.m.ListMode
	var ListMode = library.ListMode;

	// shortcut for sap.m.ToolbarDesign
	var ToolbarDesign = library.ToolbarDesign;

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

	var DRAG_DROP_CONFIG_NAME = "DragDropConfig";
	var RESIZE_CONFIG_NAME = "ResizeConfig";
	var CREATE_CONFIG_NAME = "CreateConfig";

	var LISTITEM_SUFFIX = "-CLI";

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
	 * @see {@link fiori:https://experience.sap.com/fiori-design-web/planning-calendar/ Planning Calendar}
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var PlanningCalendar = Control.extend("sap.m.PlanningCalendar", /** @lends sap.m.PlanningCalendar.prototype */ {
		metadata : {
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
				 * <b>Note:</b> If the set height is less than the displayed content, it will not be applied
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
				 *<b>Note:</b> The <code>stickyHeader</code> of the <code>PlanningCalendar</code> uses the <code>sticky</code> property of <code>sap.m.Table</code>.
				 * Therefore, all features and limitations of the property in <code>sap.m.Table</code> apply to the <code>PlanningCalendar</code> as well.
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
				toolbarContent : {
					type : "sap.ui.core.Control",
					multiple : true,
					singularName : "toolbarContent",
					forwarding : {
						getter : "_getHeader",
						aggregation : "actions"
					},
					forwardBinding: true
				},

				/**
				 * Hidden, for internal use only.
				 */
				table : {type : "sap.m.Table", multiple : false, visibility : "hidden"},

				/**
				 * Hidden, for internal use only.
				 */
				header : {type : "sap.ui.core.Control", multiple : false, visibility : "hidden"}

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
					parameters : {

						/**
						 * The ID of the <code>PlanningCalendarRowHeader</code> of the selected appointment.
						 *
						 * <b>Note:</b> Intended to be used as an easy way to get an ID of a <code>PlanningCalendarRowHeader</code>. Do NOT use for modification.
						 *
						 * @since 1.73
						 */
						headerId : {type : "string"},

						/**
						 * The row user clicked on.
						 */
						row : {type : "sap.m.PlanningCalendarRow"}
					}
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
	var INTERVAL_CTR_REFERENCES = ["_oTimesRow", "_oDatesRow", "_oMonthsRow", "_oWeeksRow", "_oOneMonthsRow"],
	//Holds metadata of the different interval instances that should be created.
	INTERVAL_METADATA = {};

	INTERVAL_METADATA[CalendarIntervalType.Day] = {
		sInstanceName: "_oDatesRow",
		sIdSuffix: "-DatesRow",
		oClass: DatesRow
	};

	INTERVAL_METADATA[CalendarIntervalType.Week] = {
		sInstanceName: "_oWeeksRow",
		sIdSuffix: "-WeeksRow",
		oClass: DatesRow
	};

	INTERVAL_METADATA[CalendarIntervalType.OneMonth] = {
		sInstanceName: "_oOneMonthsRow",
		sIdSuffix: "-OneMonthsRow",
		oClass: OneMonthDatesRow
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

	var SCREEEN_BREAKPOINTS = {
		PHONE: "600",
		TABLET: "1024"
	};

	var aIntervalRepresentatives = [
		"sap.ui.unified.calendar.TimesRow",
		"sap.ui.unified.calendar.DatesRow",
		"sap.ui.unified.calendar.MonthsRow",
		"sap.ui.unified.calendar.OneMonthDatesRow"
	];

	var CalendarHeader = Control.extend("CalendarHeader", {

		metadata : {
			aggregations: {
				"toolbar"   : {type: "sap.m.Toolbar", multiple: false},
				"allCheckBox" : {type: "sap.m.CheckBox", multiple: false}
			}
		},

		renderer : {
			apiVersion: 2,
			render: function(oRm, oHeader) {
				oRm.openStart("div", oHeader);
				oRm.class("sapMPlanCalHead");
				oRm.openEnd();

				var oToolbar = oHeader.getToolbar();
				if (oToolbar) {
					oRm.renderControl(oToolbar);
				}

				var oAllCB = oHeader.getAllCheckBox();
				if (oAllCB) {
					oRm.renderControl(oAllCB);
				}

				oRm.close("div");
			}
		}
	});

	PlanningCalendar.prototype.init = function(){
		this._dateNav = new DateNavigation();
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

		this.setAggregation("header", this._createHeader());
		this._attachHeaderEvents();

		this._oRB = Core.getLibraryResourceBundle("sap.m");

		var sId = this.getId();
		this._oIntervalTypeSelect = this._getHeader()._getOrCreateViewSwitch();
		this._oIntervalTypeSelect.attachEvent("selectionChange", changeIntervalType, this);

		this._oTodayButton = this._getHeader()._getTodayButton();

		this._oCalendarHeader = new CalendarHeader(sId + "-CalHead", {});

		this._oInfoToolbar = new Toolbar(sId + "-InfoToolbar", {
			height: "auto",
			design: ToolbarDesign.Transparent,
			content: [this._oCalendarHeader, this._oTimesRow]
		});

		var oTable = new Table(sId + "-Table", {
			sticky: [], // set sticky property to an empty array this correspondents to PlanningCalendar stickyHeader = false
			infoToolbar: this._oInfoToolbar,
			mode: ListMode.SingleSelectMaster,
			columns: [
				new Column({
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
		oTable.attachEvent("selectionChange", handleTableSelectionChange, this);

		oTable.addDelegate({
			onBeforeRendering: function () {
				if (this._rowHeaderClickEvent) {
					this._rowHeaderClickEvent.off();
				}
			},
			onAfterRendering: function () {
				this._rowHeaderClickEvent = oTable.$().find(".sapMPlanCalRowHead > div.sapMLIB").click(function (oEvent) {
					var oRowHeader = jQuery(oEvent.currentTarget).control(0),
						oRow = getRow(oRowHeader.getParent()),
						sRowHeaderId = oRowHeader.getId();

					this.fireRowHeaderClick({headerId: sRowHeaderId, row: oRow});
				}.bind(this));
				this._adjustColumnHeadersTopOffset();
			}
		}, false, this);

		this.setAggregation("table", oTable, true);

		this.setStartDate(new Date());

		this._resizeProxy = jQuery.proxy(handleResize, this);
		this._fnCustomSortedAppointments = undefined; //transfers a custom appointments sorter function to the CalendarRow
		this.iWidth = 0;
	};

	PlanningCalendar.prototype.exit = function(){

		if (this._sResizeListener) {
			ResizeHandler.deregister(this._sResizeListener);
			this._sResizeListener = undefined;
		}

		Device.orientation.detachHandler(this._updateStickyHeader, this);

		if (this._sUpdateCurrentTime) {
			clearTimeout(this._sUpdateCurrentTime);
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

		// Remove event listener for rowHeaderClick event
		if (this._rowHeaderClickEvent) {
			this._rowHeaderClickEvent.off();
			this._rowHeaderClickEvent = null;
		}
	};

	PlanningCalendar.prototype.onBeforeRendering = function(){

		this._bBeforeRendering = true;

		if ((!this._oTimesRow && !this._oDatesRow && !this._oMonthsRow && !this._oWeeksRow && !this._oOneMonthsRow) || this._bCheckView) {
			// init intervalType settings if default is used
			this.setViewKey(this.getViewKey());
			this._bCheckView = undefined;
		}

		updateSelectItems.call(this);

		if (this._sUpdateCurrentTime) {
			clearTimeout(this._sUpdateCurrentTime);
			this._sUpdateCurrentTime = undefined;
		}

		this._updatePickerSelection();

		Device.orientation.detachHandler(this._updateStickyHeader, this);

		this._bBeforeRendering = undefined;

		this._toggleStickyClasses();

	};

	PlanningCalendar.prototype.attachEvent = function (eventId, data, functionToCall, listener) {
		Control.prototype.attachEvent.call(this, eventId, data, functionToCall, listener);
		if (this.hasListeners("intervalSelect")) {
			INTERVAL_CTR_REFERENCES.forEach(function (sControlRef) {
				if (this[sControlRef]) {
					this[sControlRef]._setAriaRole("button"); // set new aria role
				}
			}, this);
		}
		return this;
	};

	PlanningCalendar.prototype.detachEvent = function (eventId, functionToCall, listener) {
		Control.prototype.detachEvent.call(this, eventId, functionToCall, listener);
		if (!this.hasListeners("intervalSelect")) {
			INTERVAL_CTR_REFERENCES.forEach(function (sControlRef) {
				if (this[sControlRef]) {
					this[sControlRef]._setAriaRole("gridcell"); // set new aria role
				}
			}, this);
		}
		return this;
	};

	/**
	 * Creates the header and adds proper <code>ariaLabelledBy</code> references on its toolbars.
	 *
	 * @returns {sap.m.PlanningCalendarHeader} The created header
	 * @private
	 */
	PlanningCalendar.prototype._createHeader = function () {
		var oHeader = new PlanningCalendarHeader(this.getId() + "-Header");

		oHeader.getAggregation("_actionsToolbar")
			.addAriaLabelledBy(InvisibleText.getStaticId("sap.m", "PC_FUNCTIONS_TOOLBAR"));

		oHeader.getAggregation("_navigationToolbar")
			.addAriaLabelledBy(InvisibleText.getStaticId("sap.m", "PC_INTERVAL_SELECTION_TOOLBAR"));

		return oHeader;
	};

	/**
	 * Attaches handlers to the events in the _header aggregation.
	 *
	 * @returns {object} this for method chaining
	 * @private
	 */
	PlanningCalendar.prototype._attachHeaderEvents = function () {
		var oHeader = this._getHeader();

		oHeader.attachEvent("pressPrevious", this._handlePressArrow, this);
		oHeader.attachEvent("pressToday", this._handleTodayPress, this);
		oHeader.attachEvent("pressNext", this._handlePressArrow, this);
		oHeader.attachEvent("dateSelect", this._handleDateSelect, this);

		return this;
	};

	/**
	 * Handler for the pressPrevious and pressNext events in the _header aggregation.
	 * @param {object} oEvent The triggered event
	 * @private
	 */
	PlanningCalendar.prototype._handlePressArrow = function (oEvent) {
		this._applyArrowsLogic(oEvent.getId() === "pressPrevious");
	};

	/**
	 * Logic for moving the selected time range in the control via the navigation arrows.
	 * @param {boolean} bBackwards Whether the left arrow is pressed
	 * @private
	 */
	PlanningCalendar.prototype._applyArrowsLogic = function(bBackwards) {
		if (bBackwards) {
			this._dateNav.previous();
		} else {
			this._dateNav.next();
		}

		if (this.getMinDate()) {
			if (this._dateNav.getStart().getTime() <= this.getMinDate().getTime()) {
				this._getHeader()._oPrevBtn.setEnabled(false);
				this._dateNav.setStart(this.getMinDate());
				this._dateNav.setCurrent(this.getMinDate());
			} else {
				this._getHeader()._oPrevBtn.setEnabled(true);
			}
		}
		if (this.getMaxDate()){
			if (this._dateNav.getEnd().getTime() >= this.getMaxDate().getTime()) {
				this._getHeader()._oNextBtn.setEnabled(false);
				this._dateNav.setStart(this.getMaxDate());
				this._dateNav.setCurrent(this.getMaxDate());
			} else {
				this._getHeader()._oNextBtn.setEnabled(true);
			}
		}

		var oRow = this._getRowInstanceByViewKey(this.getViewKey());

		this.setStartDate(this._dateNav.getStart());
		oRow.setDate(this._dateNav.getCurrent());
		this._updatePickerSelection();
		this.fireStartDateChange();
	};

	/**
	 * Creates and formats a string to be displayed in the picker button from the _header aggregation.
	 * If the date part of the start and end range of the showed view are different, the string contains
	 * info about the current date. Otherwise, the result string shows info about a date range.
	 * @returns {string} The concatenated string to be displayed
	 * @private
	 */
	PlanningCalendar.prototype._formatPickerText = function () {
		var oRangeDates = this._getFirstAndLastRangeDate(),
			oStartDate = CalendarUtils._createLocalDate(oRangeDates.oStartDate, true),
			oEndDate = CalendarUtils._createLocalDate(oRangeDates.oEndDate, true),
			sViewKey = this.getViewKey(),
			sViewType = CalendarIntervalType[sViewKey] ? CalendarIntervalType[sViewKey] : this._getView(sViewKey).getIntervalType(),
			bRTL = Core.getConfiguration().getRTL(),
			oDateFormat,
			sResult,
			sBeginningResult,
			sEndResult;

		switch (sViewType) {
			case CalendarIntervalType.Hour:
				oDateFormat = DateFormat.getDateInstance({format: "yMMMMd"});
				sBeginningResult = oDateFormat.format(oStartDate);
				if (oStartDate.getDate() !== oEndDate.getDate()) {
					sEndResult = oDateFormat.format(oEndDate);
				}
				break;

			case CalendarIntervalType.Day:
			case CalendarIntervalType.Week:
				oDateFormat = DateFormat.getDateInstance({format: "yMMMMd"});
				sBeginningResult = oDateFormat.format(oStartDate);
				sEndResult = oDateFormat.format(oEndDate);
				break;

			case CalendarIntervalType.OneMonth:
				oDateFormat = DateFormat.getDateInstance({format: "yMMMM"});
				sBeginningResult = oDateFormat.format(oStartDate);
				break;

			case CalendarIntervalType.Month:
				oDateFormat = DateFormat.getDateInstance({format: "y"});
				sBeginningResult = oDateFormat.format(oStartDate);
				if (oStartDate.getFullYear() !== oEndDate.getFullYear()) {
					sEndResult = oDateFormat.format(oEndDate);
				}
				break;

			default:
				throw new Error("Unknown IntervalType: " + sViewKey + "; " + this);
		}

		if (!bRTL) {
			sResult = sBeginningResult;
			if (sEndResult) {
				sResult += " - " + sEndResult;
			}
		} else {
			if (sEndResult) {
				sResult = sEndResult + " - " + sBeginningResult;
			} else {
				sResult = sBeginningResult;
			}
		}

		return sResult;
	};

	/**
	 * Calculates the first and the last date of the range to be displayed. The size of the range depends on the
	 * currently selected view.
	 * @returns {object} Two properties containing the first and the last date from the range
	 * @private
	 */
	PlanningCalendar.prototype._getFirstAndLastRangeDate = function () {
		var oUniStartDate = CalendarUtils._createUniversalUTCDate(this.getStartDate(), "Gregorian", true),
			oUniEndDate = CalendarUtils._createUniversalUTCDate(this._dateNav.getEnd(), "Gregorian", true);

		return {
			oStartDate: oUniStartDate,
			oEndDate: oUniEndDate
		};
	};

	/**
	 * Getter for header aggregation.
	 *
	 * @returns {sap.m.PlanningCalendarHeader} The header object
	 * @private
	 */
	PlanningCalendar.prototype._getHeader = function () {
		return this.getAggregation("header");
	};

	/**
	 * Applies or removes sticky class based on <code>stickyHeader</code>'s value.
	 *
	 * @returns {sap.m.PlanningCalendar} <code>this</code> for chaining
	 * @private
	 */
	PlanningCalendar.prototype._toggleStickyClasses = function () {
		this.toggleStyleClass("sapMPCSticky", this.getStickyHeader());

		return this;
	};

	/**
	 * Makes sure that the column headers are offset in such a way, that they are positioned right
	 * after the navigation toolbar.
	 *
	 * @returns {sap.m.PlanningCalendar} <code>this</code> for chaining
	 * @private
	 */
	PlanningCalendar.prototype._adjustColumnHeadersTopOffset = function () {
		var bStickyMode = this.getStickyHeader(),
			oColumnHeaders = this.getDomRef().querySelector(".sapMListInfoTBarContainer"),
			iTop;

		switch (bStickyMode) {
			case true:
				// Since the header will be visible, columnHeaders should be offset by its height.
				iTop = this._getHeader().$().outerHeight() + "px";
				break;
			default:
				// Reset to default, if not in sticky mode
				iTop = "auto";
				break;
		}

		oColumnHeaders.style.top = iTop;

		return this;
	};

	PlanningCalendar.prototype._setAriaRole = function (oInterval) {
		if (this.hasListeners("intervalSelect")) {
			oInterval._setAriaRole("button"); // set new aria role
		} else {
			oInterval._setAriaRole("gridcell"); // set new aria role
		}
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

		if (oInterval && sViewKey === "One Month") {
			return CalendarUtils._isSameMonthAndYear(CalendarDate.fromLocalJSDate(this.getStartDate()),
				CalendarDate.fromLocalJSDate(oDateTime));
		} else if (oInterval && sViewKey === "Week") {
			var iIntervals = oInterval.getDays(),
				oDate = CalendarDate.fromLocalJSDate(oDateTime),
				oStartDate = CalendarDate.fromLocalJSDate(this.getStartDate()),
				oEndDate = CalendarDate.fromLocalJSDate(this.getStartDate());

			oEndDate.setDate(oEndDate.getDate() + iIntervals);

			return oDate.isSameOrAfter(oStartDate) && oDate.isBefore(oEndDate);
		}

		return bResult;
	};

	PlanningCalendar.prototype.onAfterRendering = function(oEvent){

		// check if size is right and adopt it if necessary
		// also it calls _updateStickyHeader function and in case of stickyHeader property set to true
		// all needed classes will be updated
		oEvent.size = {width: this.getDomRef().offsetWidth};
		handleResize.call(this, oEvent, true);

		if (!this._sResizeListener) {
			this._sResizeListener = ResizeHandler.register(this, this._resizeProxy);
		}

		if (Device.system.phone && this.getStickyHeader()) {
			Device.orientation.attachHandler(this._updateStickyHeader, this);
		}

		this._updateCurrentTimeVisualization(false); // CalendarRow sets visualization onAfterRendering

		if (this.getHeight()) {
			var $Table = this.getDomRef().querySelector("table");

			if (this.getHeight().indexOf("%") > -1){
				$Table.style.height = this.getHeight();
				return;
			}
			// Table height is the PlanningCalendar height minus the height of the toolbars
			var sStyle = this.$().height() - this._oInfoToolbar.$().height() + "px";
			$Table.style.height = sStyle;
		}

		this._adjustColumnHeadersTopOffset();
	};

	PlanningCalendar.prototype.onThemeChanged = function() {
		// adjust offset only if the control is rendered
		if (this.getDomRef()) {
			this._adjustColumnHeadersTopOffset();
		}
	};

	PlanningCalendar.prototype.addToolbarContent = function(oContent) {
		if (oContent && oContent.isA("sap.m.Title")) {
			this._observeHeaderTitleText(oContent);
			this._getHeader().setTitle(oContent.getText());
			oContent.setVisible(false);
		}
		this.addAggregation("toolbarContent", oContent);

		return this;
	 };

	PlanningCalendar.prototype.insertToolbarContent = function(oContent, iIndex) {
		if (oContent && oContent.isA("sap.m.Title")) {
			this._observeHeaderTitleText(oContent);
			this._getHeader().setTitle(oContent.getText());
			oContent.setVisible(false);
		}
		this.insertAggregation("toolbarContent", oContent, iIndex);

		return this;
	};

	PlanningCalendar.prototype.removeToolbarContent = function(oContent) {
		var oRemoved;

		if (oContent && oContent.isA("sap.m.Title")) {
			this._getHeader().setTitle("");
			this._disconnectAndDestroyHeaderObserver();
		} else {
			oRemoved = this.removeAggregation("toolbarContent", oContent);
		}

		return oRemoved;
	};

	PlanningCalendar.prototype.removeAllToolbarContent = function() {
		var aRemoved = this.removeAllAggregation("toolbarContent");
		this._getHeader().setTitle("");
		this._disconnectAndDestroyHeaderObserver();
		return aRemoved;
	};

	PlanningCalendar.prototype.destroyToolbarContent = function() {
		var destroyed = this.destroyAggregation("toolbarContent");
		this._getHeader().setTitle("");
		this._disconnectAndDestroyHeaderObserver();
		return destroyed;
	};

	/**
	* Returns the ManagedObjectObserver for the title.
	*
	* @return {sap.ui.base.ManagedObjectObserver} The header observer object
	* @private
	*/
	PlanningCalendar.prototype._getHeaderObserver = function () {
		if (!this._oHeaderObserver) {
			this._oHeaderObserver = new ManagedObjectObserver(this._handleTitleTextChange.bind(this));
		}
		return this._oHeaderObserver;
	};

	/**
	* Observes the text property of the title.
	*
	* @param {sap.m.Title} oTitle text property will be observed
	* @private
	*/
	PlanningCalendar.prototype._observeHeaderTitleText = function (oTitle) {
		this._getHeaderObserver().observe(oTitle, {
			properties: ["text"]
		});
	};

	 PlanningCalendar.prototype._handleTitleTextChange = function (oChanges) {
		this._getHeader().setTitle(oChanges.current);
	};

	/**
	 * Disconnects and destroys the ManagedObjectObserver observing title's text.
	 *
	 * @private
	 */
	PlanningCalendar.prototype._disconnectAndDestroyHeaderObserver = function () {
		if (this._oHeaderObserver) {
			this._oHeaderObserver.disconnect();
			this._oHeaderObserver.destroy();
			this._oHeaderObserver = null;
		}
	};

	/**
	 * Sets the given date as start date. The current date is used as default.
	 * Depending on the current view the start date may be adjusted (for example, the week view shows always the first weekday
	 * of the same week as the given date).
	 * @param {Date} oDate the date to set as <code>sap.m.PlanningCalendar</code> <code>startDate</code>. May be changed(adjusted) if
	 * property <code>startDate</code> is adjusted. See remark about week view above.
	 * @returns {sap.m.PlanningCalendar} <code>this</code> to allow method chaining
	 * @public
	 */
	PlanningCalendar.prototype.setStartDate = function(oDate) {
		var oFirstDateOfWeek,
			oFirstDateOfMonth,
			oStartDate;

		if (!oDate) {
			//set default value
			oStartDate = new Date();
		} else {
			CalendarUtils._checkJSDateObject(oDate);
			oStartDate = new Date(oDate.getTime());
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

		if (this.getViewKey() === PlanningCalendarBuiltInView.OneMonth || this.getViewKey() === PlanningCalendarBuiltInView.Month) {
			/*
			 * Have in mind that the oStartDate is the date that the user sees in the UI, thus - local one. As
			 * CalendarUtils.getFirstDateOfMonth works with UTC dates (this is because the dates are timezone irrelevant),
			 * it should be called with the local datetime values presented as UTC ones.
			 */
			oFirstDateOfMonth = CalendarUtils.getFirstDateOfMonth(CalendarUtils._createUniversalUTCDate(oStartDate, undefined, true));
			//CalendarUtils.getFirstDateOfMonth works with UTC based date values, restore the result back in local timezone.
			oStartDate.setTime(CalendarUtils._createLocalDate(oFirstDateOfMonth, true).getTime());
		}

		if (deepEqual(oStartDate, this.getStartDate())) {
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
			Log.warning("StartDate < minDate -> StartDate set to minDate", this);
			oStartDate = new Date(oMinDate.getTime());
		} else {
			var oMaxDate = this.getMaxDate();
			if (oMaxDate && oMaxDate.getTime() < oStartDate.getTime()) {
				Log.warning("StartDate > maxDate -> StartDate set to minDate", this);
				if (oMinDate) {
					oStartDate = new Date(oMinDate.getTime());
				} else {
					oStartDate = new Date(1, 0, 1);
					oStartDate.setFullYear(1);
				}
			}
		}

		this.setProperty("startDate", oStartDate, true);
		this._dateNav.setStart(oStartDate);
		this._getHeader().setStartDate(oStartDate);

		INTERVAL_CTR_REFERENCES.forEach(function (sControlRef) {
			if (this[sControlRef]) {
				this[sControlRef].setStartDate(new Date(oStartDate.getTime())); // use new date object
			}
		}, this);

		// in OneMonth view there is selection,
		// start date of the rows should match the selected date
		if (this.getViewKey() === PlanningCalendarBuiltInView.OneMonth && this._oOneMonthsRow.getMode() < 2 && this._oOneMonthsRow.getSelectedDates().length) {
			this._setRowsStartDate(this._oOneMonthsRow.getSelectedDates()[0].getStartDate());
		} else {
			this._setRowsStartDate(new Date(oStartDate.getTime()));
		}

		if (this.getViewKey() === PlanningCalendarBuiltInView.Week || this.getViewKey() === PlanningCalendarBuiltInView.OneMonth) {
			this._updateTodayButtonState();
		}

		if (this.getDomRef()) {
			// only set timer, CalendarRow will be rerendered, so no update needed here
			this._updateCurrentTimeVisualization(false);
			this._updatePickerSelection();
		}

		return this;

	};

	PlanningCalendar.prototype.setMinDate = function(oDate){

		if (deepEqual(oDate, this.getMinDate())) {
			return this;
		}

		var oMaxDate = this.getMaxDate(),
			oHeader = this._getHeader();

		if (oDate) {
			CalendarUtils._checkJSDateObject(oDate);

			var iYear = oDate.getFullYear();
			CalendarUtils._checkYearInValidRange(iYear);

			this.setProperty("minDate", oDate, true);
			this._bNoStartDateChange = true; // set the start date after all calendars are updated

			oHeader.getAggregation("_calendarPicker").setMinDate(new Date(oDate.getTime()));

			if (oMaxDate && oMaxDate.getTime() < oDate.getTime()) {
				Log.warning("minDate > maxDate -> maxDate set to end of the month", this);
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
				Log.warning("StartDate < minDate -> StartDate set to minDate", this);
				oStartDate = new Date(oDate.getTime());
				this.setStartDate(oStartDate);
				oHeader.setPickerText(this._formatPickerText());
			}
		} else {
			this.setProperty("minDate", undefined, true);
			oHeader.getAggregation("_calendarPicker").setMinDate();
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

		if (deepEqual(oDate, this.getMaxDate())) {
			return this;
		}

		var oMinDate = this.getMinDate(),
			oHeader = this._getHeader();

		if (oDate) {
			CalendarUtils._checkJSDateObject(oDate);

			var iYear = oDate.getFullYear();
			CalendarUtils._checkYearInValidRange(iYear);

			this.setProperty("maxDate", oDate, true);
			this._bNoStartDateChange = true; // set the start date after all calendars are updated

			oHeader.getAggregation("_calendarPicker").setMaxDate(new Date(oDate.getTime()));

			if (oMinDate && oMinDate.getTime() > oDate.getTime()) {
				Log.warning("maxDate < minDate -> maxDate set to begin of the month", this);
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
				Log.warning("StartDate > maxDate -> StartDate set to minDate", this);
				if (oMinDate) {
					oStartDate = new Date(oMinDate.getTime());
				} else {
					oStartDate = new Date(1, 0, 1);
					oStartDate.setFullYear(1);
				}
				this.setStartDate(oStartDate);
				oHeader.setPickerText(this._formatPickerText());
			}
		} else {
			this.setProperty("maxDate", undefined, true);

			oHeader.getAggregation("_calendarPicker").setMaxDate();
		}

		var oToday = new Date();
		if (oDate && oToday.getTime() > oDate.getTime()) {
			this._oTodayButton.setVisible(false);
		} else if (!oMinDate || oToday.getTime() > oMinDate.getTime()) {
			this._oTodayButton.setVisible(true);
		}

		return this;

	};

	PlanningCalendar.prototype.removeIntervalInstanceFromInfoToolbar = function () {
		var aInfoToolbarContent = this._oInfoToolbar.getContent();
		aInfoToolbarContent.forEach(function (oControl) {
			if (oControl.isA(aIntervalRepresentatives)) {
				this._oInfoToolbar.removeContent(oControl);
			}
		}.bind(this));
	};

	PlanningCalendar.prototype.setViewKey = function(sKey){
		var oInterval, oOldStartDate, oIntervalMetadata,
			sOldViewKey = this.getViewKey(),
			oHeader = this._getHeader(),
			oSelectedDate;

		this.setProperty("viewKey", sKey, true);

		this._oIntervalTypeSelect.setSelectedKey(sKey);

		this.removeIntervalInstanceFromInfoToolbar();

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

			this._dateNav.setUnit(sIntervalType);
			this._dateNav.setStep(iIntervals);
			this._dateNav.setCurrent(undefined);
			switch (sIntervalType) {
				case CalendarIntervalType.Hour:
					if (!this._oTimesRow) {
						this._oTimesRow = new TimesRow(this.getId() + "-TimesRow", {
							startDate: new Date(oStartDate.getTime()), // use new date object
							items: iIntervals,
							legend: this.getLegend()
						});
						this._setAriaRole(this._oTimesRow);
						this._oTimesRow._setLegendControlOrigin(this);

						this._oTimesRow.attachEvent("focus", this._handleFocus, this);
						this._oTimesRow.attachEvent("select", this._handleCalendarSelect, this);
						this._oTimesRow._oPlanningCalendar = this;
						this._oTimesRow.getSpecialDates = function(){
							return this._oPlanningCalendar.getSpecialDates();
						};
					} else if (this._oTimesRow.getItems() !== iIntervals) {
						this._oTimesRow.setItems(iIntervals);
						this._dateNav.setStep(iIntervals);
					}
					this._oTimesRow.addAriaLabelledBy(InvisibleText.getStaticId("sap.m", "PC_INTERVAL_TOOLBAR"));
					this._insertInterval(this._oTimesRow);
					oHeader.setAssociation("currentPicker", oHeader.getAggregation("_calendarPicker"));
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
							legend: this.getLegend(),
							showWeekNumbers: this.getShowWeekNumbers()
						});
						this._setAriaRole(oInterval);

						oInterval.attachEvent("select", this._handleCalendarSelect, this);
						oInterval.attachEvent("focus", this._handleFocus, this);

						if (sKey === PlanningCalendarBuiltInView.OneMonth) {
							oInterval._setRowsStartDate = this._setRowsStartDate.bind(this);
						}

						oInterval._oPlanningCalendar = this;
						oInterval.getSpecialDates = function(){
							return this._oPlanningCalendar.getSpecialDates();
						};
					} else if (oInterval.getDays() !== iIntervals) {
						oInterval.setDays(iIntervals);
						this._dateNav.setStep(iIntervals);
					}
					oInterval.addAriaLabelledBy(InvisibleText.getStaticId("sap.m", "PC_INTERVAL_TOOLBAR"));
					this._insertInterval(oInterval);
					this[oIntervalMetadata.sInstanceName] = oInterval;
					if (sIntervalType === CalendarIntervalType.OneMonth) {
						oHeader.setAssociation("currentPicker", oHeader.getAggregation("_monthPicker"));
					} else {
						oHeader.setAssociation("currentPicker", oHeader.getAggregation("_calendarPicker"));
					}
					break;

				case CalendarIntervalType.Month:
					if (!this._oMonthsRow) {
						this._oMonthsRow = new MonthsRow(this.getId() + "-MonthsRow", {
							startDate: new Date(oStartDate.getTime()), // use new date object
							months: iIntervals,
							legend: this.getLegend()
						});
						this._setAriaRole(this._oMonthsRow);
						this._oMonthsRow._setLegendControlOrigin(this);

						this._oMonthsRow.attachEvent("focus", this._handleFocus, this);
						this._oMonthsRow.attachEvent("select", this._handleCalendarSelect, this);
						this._oMonthsRow._oPlanningCalendar = this;
						this._oMonthsRow.getSpecialDates = function(){
							return this._oPlanningCalendar.getSpecialDates();
						};
					} else if (this._oMonthsRow.setMonths() !== iIntervals) {
						this._oMonthsRow.setMonths(iIntervals);
						this._dateNav.setStep(iIntervals);
					}
					this._oMonthsRow.addAriaLabelledBy(InvisibleText.getStaticId("sap.m", "PC_INTERVAL_TOOLBAR"));
					this._insertInterval(this._oMonthsRow);
					oHeader.setAssociation("currentPicker", oHeader.getAggregation("_yearPicker"));
					break;

				default:
					throw new Error("Unknown IntervalType: " + sIntervalType + "; " + this);
			}

			var aRows = this.getRows();
			for (var i = 0; i < aRows.length; i++) {
				var oRow = aRows[i];
				var oTimeline = getRowTimeline(oRow);
				oTimeline.setIntervalType(sIntervalType);
				oTimeline.setIntervals(iIntervals);
				oTimeline.setShowSubIntervals(oView.getShowSubIntervals());
			}

			if (this.getDomRef()) {
				// only set timer, CalendarRow will be re-rendered, so no update needed here
				this._updateCurrentTimeVisualization(false);
				adaptCalHeaderForWeekNumbers.call(this, this.getShowWeekNumbers(), this._viewAllowsWeekNumbers(sKey));
				adaptCalHeaderForDayNamesLine.call(this, this.getShowDayNamesLine(), !!oInterval);
			}
			this._updatePickerSelection();
		}

		if (sKey === PlanningCalendarBuiltInView.Week || sKey === PlanningCalendarBuiltInView.OneMonth || sKey === PlanningCalendarBuiltInView.Month) {
			oOldStartDate = this.getStartDate();
			this.setStartDate(new Date(oOldStartDate.getTime())); //make sure the start date is aligned according to the week/month rules
			if (oOldStartDate.getTime() !== this.getStartDate().getTime()) {
				this.fireStartDateChange();
			}
		}

		if (this._oOneMonthsRow && sKey === PlanningCalendarBuiltInView.OneMonth) {
			this._oOneMonthsRow.setMode(this._iSize);
			this._adjustSelectedDate(CalendarDate.fromLocalJSDate(oOldStartDate));
			if (this._iSize < 2) {
				this._setRowsStartDate(oOldStartDate);
			}
		} else if (this._oOneMonthsRow
			&& sOldViewKey === PlanningCalendarBuiltInView.OneMonth
			&& this._oOneMonthsRow.getSelectedDates().length) {
			oSelectedDate = this._oOneMonthsRow.getSelectedDates()[0].getStartDate();
			if (oSelectedDate) {
				this.setStartDate(oSelectedDate);
			}
		}

		if (oMinDate) {
			oHeader.getAggregation("_calendarPicker").setMinDate(new Date(oMinDate.getTime()));
			oHeader.getAggregation("_yearPicker").setMinDate(new Date(oMinDate.getTime()));
		}
		if (oMaxDate) {
			oHeader.getAggregation("_calendarPicker").setMaxDate(new Date(oMaxDate.getTime()));
			oHeader.getAggregation("_yearPicker").setMaxDate(new Date(oMaxDate.getTime()));
		}
		this._updateTodayButtonState();

		return this;

	};

	PlanningCalendar.prototype._handleFocus = function (oEvent) {
		var oDate = oEvent.getParameter("date"),
			bRestoreOldDate = oEvent.getParameter("restoreOldDate");

		if (bRestoreOldDate) {
			return;
		}

		this.shiftToDate(oDate, oEvent.getParameter("otherMonth"));
	};

	/**
	 * Navigates to the given date after it is focused or selected.
	 * @param {object} oDate The date to be navigated to
	 * @param {boolean} bOtherMonth If the date is in the same month as the start date
	 * @private
	 */
	PlanningCalendar.prototype.shiftToDate = function(oDate, bOtherMonth) {
		var oRowInstance = this._getRowInstanceByViewKey(this.getViewKey()),
			oStart,
			oCurrent;

		this._dateNav.toDate(oDate);

		oStart = this._dateNav.getStart();
		oCurrent = this._dateNav.getCurrent();

		if (this._dateNav.getCurrent() > this._dateNav.getEnd()){
			oStart = new Date(this._dateNav.getStart());
			oStart.setDate(oStart.getDate() + 1);
		}

		if ((this.getMaxDate() && this.getMaxDate() < oDate) || (this.getMinDate() && this.getMinDate() > oDate)){
			return;
		}

		if (oRowInstance &&
			!(oRowInstance.getMode && oRowInstance.getMode() < 2 && !bOtherMonth)) {
			this.setStartDate(oStart);
			oRowInstance.setStartDate(oStart);
			oRowInstance.setDate(oCurrent);
		}
	};

	/**
	 * Updates the selection in the header's calendarPicker aggregation.
	 * @private
	 */
	PlanningCalendar.prototype._updatePickerSelection = function() {
		var oRangeDates = this._getFirstAndLastRangeDate(),
			sCurrentPickerId = this._getHeader().getAssociation("currentPicker"),
			oPicker = Core.byId(sCurrentPickerId),
			oSelectedRange;

		oSelectedRange = new DateRange({
			startDate: CalendarUtils._createLocalDate(oRangeDates.oStartDate, true),
			endDate: CalendarUtils._createLocalDate(oRangeDates.oEndDate, true)
		});

		oPicker.destroySelectedDates();
		oPicker.addSelectedDate(oSelectedRange);

		this._getHeader().setPickerText(this._formatPickerText());
		this._updateTodayButtonState();
	};

	/**
	 * Sets the selection in one month mode to match the focused date for size S and M.
	 * @param {sap.ui.unified.calendar.CalendarDate} oDate The date to select unless bUseFirstOfMonth is used
	 * @param {boolean} bUseFirstOfMonth If specified the first month of the given date will be used
	 * @private
	 */
	PlanningCalendar.prototype._adjustSelectedDate = function(oDate, bUseFirstOfMonth) {
		var oSelectDate = bUseFirstOfMonth ? CalendarUtils._getFirstDateOfMonth(oDate) : oDate,
			oLocaleDate = oSelectDate.toLocalJSDate();

		if (this._oOneMonthsRow.getMode && this._oOneMonthsRow.getMode() < 2) {
			this._oOneMonthsRow.removeAllSelectedDates();
			this._oOneMonthsRow.addSelectedDate(new DateRange({startDate: oLocaleDate}));
			this._oOneMonthsRow.selectDate(oLocaleDate);
		}
	};

	/**
	 * Inserts the needed interval to the right position in the toolbar of the PlanningCalendar.
	 * When the screen is big, the interval should be placed at the end.
	 * Else - after(below) the calendar header.
	 * @param {object} oInterval The interval to be placed in the toolbar
	 * @private
	 */
	PlanningCalendar.prototype._insertInterval = function  (oInterval) {
		if (this._iSizeScreen > 1) {
			// place the interval at the end.
			this._oInfoToolbar.addContent(oInterval);
		} else {
			// place the interval after the calendar header.
			this._oInfoToolbar.insertContent(oInterval, 1);
		}
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
	PlanningCalendar.prototype._getRowInstanceByViewKey = function(sViewKey) {
		var sIntervalType = this._getView(sViewKey).getIntervalType(),
			oIntervalMetadata = INTERVAL_METADATA[sIntervalType],
			oInterval;
		if (oIntervalMetadata) {
			oInterval = this[oIntervalMetadata.sInstanceName];
		}

		if (sIntervalType === CalendarIntervalType.Month) {
			oInterval = this._oMonthsRow;
		}

		if (sIntervalType === CalendarIntervalType.Hour) {
			oInterval = this._oTimesRow;
		}

		return oInterval;
	};

	PlanningCalendar.prototype.setShowWeekNumbers = function (bValue) {
		this.setProperty("showWeekNumbers", bValue, true);

		this._getViews().forEach(function(oView) {
			var sViewKey = oView.getKey(),
				bViewAllowsWeekNumbers = this._viewAllowsWeekNumbers(sViewKey),
				oInterval = this._getRowInstanceByViewKey(sViewKey);

			if (oInterval && bViewAllowsWeekNumbers) {
				oInterval.setShowWeekNumbers(bValue);
			}

			//update the pc header classes if needed
			if (this.getDomRef() && this.getViewKey() === sViewKey) {
				adaptCalHeaderForWeekNumbers.call(this, bValue, bViewAllowsWeekNumbers);
			}
		}, this);

		return this;
	};

	PlanningCalendar.prototype.setShowIntervalHeaders = function(bShowIntervalHeaders){

		this.setProperty("showIntervalHeaders", bShowIntervalHeaders, true);

		var aRows = this.getRows();
		for (var i = 0; i < aRows.length; i++) {
			var oRow = aRows[i];
			getRowTimeline(oRow).setShowIntervalHeaders(bShowIntervalHeaders);
		}

		return this;

	};

	PlanningCalendar.prototype.setShowEmptyIntervalHeaders = function(bShowEmptyIntervalHeaders){

		this.setProperty("showEmptyIntervalHeaders", bShowEmptyIntervalHeaders, true);

		var aRows = this.getRows();
		for (var i = 0; i < aRows.length; i++) {
			var oRow = aRows[i];
			getRowTimeline(oRow).setShowEmptyIntervalHeaders(bShowEmptyIntervalHeaders);
		}

		return this;

	};

	PlanningCalendar.prototype.setGroupAppointmentsMode = function (bGroupAppointmentsMode) {

		this.setProperty("groupAppointmentsMode", bGroupAppointmentsMode, true);

		var aRows = this.getRows();
		for (var i = 0; i < aRows.length; i++) {
			var oRow = aRows[i];
			getRowTimeline(oRow).setGroupAppointmentsMode(bGroupAppointmentsMode);
		}

		return this;
	};

	PlanningCalendar.prototype.setAppointmentsReducedHeight = function(bAppointmentsReducedHeight){

		this.setProperty("appointmentsReducedHeight", bAppointmentsReducedHeight, true);

		var aRows = this.getRows();
		for (var i = 0; i < aRows.length; i++) {
			var oRow = aRows[i];
			getRowTimeline(oRow).setAppointmentsReducedHeight(bAppointmentsReducedHeight);
		}

		return this;

	};

	PlanningCalendar.prototype.setAppointmentsVisualization = function(sAppointmentsVisualization){

		this.setProperty("appointmentsVisualization", sAppointmentsVisualization, true);

		var aRows = this.getRows();
		for (var i = 0; i < aRows.length; i++) {
			var oRow = aRows[i];
			getRowTimeline(oRow).setAppointmentsVisualization(sAppointmentsVisualization);
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
		positionSelectAllCheckBox.call(this);
		setSelectionMode.call(this);

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
					adaptCalHeaderForDayNamesLine.call(this, bShowDayNamesLine, true);
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
		var aStickyParts = [],
			bStick = this.getStickyHeader(),
			bMobile1MonthView = this.getViewKey() === PlanningCalendarBuiltInView.OneMonth && this._iSize < 2,
			bStickyToolbar = bStick && !Device.system.phone && !bMobile1MonthView,
			bStickyInfoToolbar = bStick && !(Device.system.phone && Device.orientation.landscape) && !bMobile1MonthView;

		if (bStickyToolbar) {
			aStickyParts.push(Sticky.HeaderToolbar);
		}
		if (this._oInfoToolbar && bStickyInfoToolbar) {
			aStickyParts.push(Sticky.InfoToolbar);
		}

		this.getAggregation("table").setSticky(aStickyParts);
	};

	PlanningCalendar.prototype.addRow = function(oRow) {
		this.addAggregation("rows", oRow, true);
		this.getAggregation("table").addItem(this._createPlanningCalendarListItem(oRow));

		return this;
	};

	PlanningCalendar.prototype.insertRow = function(oRow, iIndex) {
		this.insertAggregation("rows", oRow, iIndex);
		this.getAggregation("table").insertItem(this._createPlanningCalendarListItem(oRow), iIndex, true);

		return this;
	};

	PlanningCalendar.prototype.removeRow = function(vObject) {
		var oRow = this.removeAggregation("rows", vObject, true),
			oTable = this.getAggregation("table");

		oTable.removeItem(getListItem(oRow), true);

		this._handleRowRemoval(oRow);

		updateSelectAllCheckBox.call(this);

		setSelectionMode.call(this);

		return oRow;
	};

	PlanningCalendar.prototype.removeAllRows = function() {
		var aRows = this.removeAllAggregation("rows", true),
			oTable = this.getAggregation("table");

		oTable.removeAllItems(true);

		aRows.forEach(this._handleRowRemoval, this);

		updateSelectAllCheckBox.call(this);

		setSelectionMode.call(this);

		return aRows;

	};

	PlanningCalendar.prototype.destroyRows = function() {

		var destroyed;

		var oTable = this.getAggregation("table");
		oTable.destroyItems(true);

		destroyed = this.destroyAggregation("rows");

		updateSelectAllCheckBox.call(this);

		setSelectionMode.call(this);

		return destroyed;

	};


	PlanningCalendar.prototype.setSingleSelection = function(bSingleSelection) {

		this.setProperty("singleSelection", bSingleSelection, true);

		positionSelectAllCheckBox.call(this);
		setSelectionMode.call(this);

		if (bSingleSelection) {
			this.selectAllRows(false);
		} else {
			updateSelectAllCheckBox.call(this);
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
			oLegend = this.getLegend() && Core.byId(this.getLegend()),
			oLegendDestroyObserver;

		for (var i = 0; i < aRows.length; i++) {
			var oRow = aRows[i];
			getRowTimeline(oRow).setLegend(vLegend);
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
						if (this._oTimesRow) {
							this._oTimesRow.invalidate(arguments);
						}
						break;

					case CalendarIntervalType.Day:
						if (this._oDatesRow) {
							this._oDatesRow.invalidate(arguments);
						}
						break;

					case CalendarIntervalType.Month:
						if (this._oMonthsRow) {
							this._oMonthsRow.invalidate(arguments);
						}
						break;
					case CalendarIntervalType.OneMonth:
						if (this._oOneMonthsRow) {
							this._oOneMonthsRow.invalidate(arguments);
						}
						break;

					case CalendarIntervalType.Week:
						if (this._oWeeksRow) {
							this._oWeeksRow.invalidate(arguments);
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

		return Control.prototype.addAggregation.call(this, "specialDates", oSpecialDate);
	};

	PlanningCalendar.prototype.insertSpecialDate = function (oSpecialDate, iIndex) {
		this._bDateRangeChanged = true;

		return Control.prototype.insertAggregation.call(this, "specialDates", oSpecialDate, iIndex);
	};

	PlanningCalendar.prototype.removeSpecialDate = function(oSpecialDate) {
		this._bDateRangeChanged = true;

		return Control.prototype.removeAggregation.call(this, "specialDates", oSpecialDate);
	};

	PlanningCalendar.prototype.removeAllSpecialDates = function() {

		this._bDateRangeChanged = true;

		return this.removeAllAggregation("specialDates");
	};

	PlanningCalendar.prototype.destroySpecialDates = function() {

		this._bDateRangeChanged = true;

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

			getRowTimeline(oRow).onsaphome(oNewEvent);

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

			getRowTimeline(oRow).onsapend(oNewEvent);

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
		this._updatePickerSelection();
		this.fireStartDateChange();
	};

	/**
	 *
	 * @param {boolean} bUpdateRows if there is need for updating the rows
	 * @private
	 */
	PlanningCalendar.prototype._updateCurrentTimeVisualization = function (bUpdateRows) {

		if (this._sUpdateCurrentTime) {
			clearTimeout(this._sUpdateCurrentTime);
			this._sUpdateCurrentTime = undefined;
		}

		if (bUpdateRows) {
			var aRows = this.getRows();
			for (var i = 0; i < aRows.length; i++) {
				var oRow = aRows[i];
				getRowTimeline(oRow).updateCurrentTimeVisualization();
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
			this._sUpdateCurrentTime = setTimeout(this['_updateCurrentTimeVisualization'].bind(this, true), iTime);
		}

	};

	function changeIntervalType(oEvent) {

		this.setViewKey(oEvent.getParameter("item").getKey());

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
			this._adjustSelectedDate(CalendarDate.fromLocalJSDate(oDate), false);

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
		this._dateNav.setCurrent(oDate);
		this._updatePickerSelection();
		this.fireStartDateChange();

	};

	/**
	 * Handles the <code>startDateChange</code> event of the <code>PlanningCalendar</code>
	 * @param {jQuery.Event} oEvent the triggered event
	 * @private
	 */
	PlanningCalendar.prototype._handleStartDateChange = function(oEvent){
		var oStartDate = oEvent.oSource.getStartDate();

		// Checking if the current view (custom or not) is different than type Hour
		if (this._getView(this.getViewKey()).getIntervalType() !== CalendarIntervalType.Hour) {
			var oCurrentStartDate = this.getStartDate();

			oStartDate.setHours(oCurrentStartDate.getHours());
			oStartDate.setMinutes(oCurrentStartDate.getMinutes());
			oStartDate.setSeconds(oCurrentStartDate.getSeconds());
		}

		this._changeStartDate(oStartDate);
	};

	/**
	 * Handles the <code>dateSelect</code> event of the <code>PlanningCalendarHeader</code>
	 * @param {jQuery.Event} oEvent the triggered event
	 * @private
	 */
	PlanningCalendar.prototype._handleDateSelect = function(oEvent){
		var oStartDate = oEvent.oSource.getStartDate();

		// Checking if the current view (custom or not) is of type Hour
		if (this._getView(this.getViewKey()).getIntervalType() === CalendarIntervalType.Hour) {
			var oCurrentStartDate = this.getStartDate();

			oStartDate.setHours(oCurrentStartDate.getHours());
			oStartDate.setMinutes(oCurrentStartDate.getMinutes());
			oStartDate.setSeconds(oCurrentStartDate.getSeconds());
		}

		this._changeStartDate(oStartDate);
		this._dateNav.setCurrent(oStartDate);

		var sViewKey = this.getViewKey(),
			oCurrentView = this._getView(sViewKey),
			sCurrentViewIntervalType = oCurrentView.getIntervalType(),
			sControlRef,
			oEndDate = new Date(this._dateNav.getEnd().setHours(23,59,59));

		if (sCurrentViewIntervalType === "Hour") {
			sCurrentViewIntervalType = "Time";
		} else if (sCurrentViewIntervalType === "Day") {
			sCurrentViewIntervalType = "Date";
		} else if (sCurrentViewIntervalType === "One Month") {
			sCurrentViewIntervalType = "OneMonth";
		}
		sControlRef = "_o" + sCurrentViewIntervalType + "sRow";

		if (this[sControlRef]) {
			this[sControlRef].setDate(oStartDate);
		}

		if (oStartDate > this.getMinDate() && oStartDate < this.getMaxDate()) {
			this._getHeader()._oNextBtn.setEnabled(true);
			this._getHeader()._oPrevBtn.setEnabled(true);
		} else if (this.getMinDate() >= this._dateNav.getStart() && this.getMinDate() <= oEndDate) {
			this._getHeader()._oPrevBtn.setEnabled(false);
		} else if (this.getMaxDate() >= this._dateNav.getStart() && this.getMaxDate() <= oEndDate) {
			this._getHeader()._oNextBtn.setEnabled(false);
		}
	};

	PlanningCalendar.prototype._handleCalendarSelect = function (oEvent) {

		var aSelectedDates = oEvent.getSource().getSelectedDates();

		if (!aSelectedDates.length) {
			return;
		}

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
						this._getHeader().setPickerText(this._formatPickerText());
					}
					this._setRowsStartDate(oFocusedDate);
					this._oOneMonthsRow._focusDate(CalendarDate.fromLocalJSDate(oFocusedDate), true);
				} else if (CalendarUtils._isNextMonth(oEvtSelectedStartDate, this.getStartDate())) {
					this.shiftToDate(oEvtSelectedStartDate);
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
		this._formatPickerText();

		this.fireIntervalSelect({startDate: oEvtSelectedStartDate, endDate: oEndDate, subInterval: false, row: undefined});

	};

	function handleIntervalSelect(oEvent){

		var oStartDate = oEvent.getParameter("startDate");

		var sKey = this.getViewKey();
		var oView = this._getView(sKey);
		var sIntervalType = oView.getIntervalType();

		if (sIntervalType === CalendarIntervalType.OneMonth
			&& CalendarUtils._isNextMonth(oStartDate, this.getStartDate())) {
			this.shiftToDate(oStartDate);
			return;
		}

		var oEndDate = oEvent.getParameter("endDate");
		var bSubInterval = oEvent.getParameter("subInterval");
		var oRow = getRow(oEvent.oSource.getParent());
		this._formatPickerText();

		this.fireIntervalSelect({startDate: oStartDate, endDate: oEndDate, subInterval: bSubInterval, row: oRow});

	}

	PlanningCalendar.prototype._applyContextualSettings = function (oSettings) {
		return Control.prototype._applyContextualSettings.call(this, oSettings || ManagedObject._defaultContextualSettings);
	};

	function adaptCalHeaderForWeekNumbers(bShowWeekNumbers, bCurrentIntervalAllowsWeekNumbers) {
		this.$().toggleClass("sapMPlanCalWithWeekNumbers", bShowWeekNumbers && bCurrentIntervalAllowsWeekNumbers);
	}

	function adaptCalHeaderForDayNamesLine(bShowDayNamesLine, bCurrentIntervalAllowsDayNamesLine) {
		this.$().toggleClass("sapMPlanCalWithDayNamesLine", bShowDayNamesLine && bCurrentIntervalAllowsDayNamesLine);
	}

	function handleResize(oEvent, bNoRowResize) {
		if (oEvent.size.width <= 0) {
			// only if visible at all
			return;
		}

		// guard against resize loops
		// 1870423752
		if (Math.abs(this.iWidth - oEvent.size.width) < 15) {
			return;
		}
		this.iWidth = oEvent.size.width;

		this._applyContextualSettings({
			contextualWidth: this.iWidth
		});

		var aRows = this.getRows();
		var oRow;
		var i = 0;

		var iOldSize = this._iSize;
		determineSize.call(this, oEvent.size.width);
		if (iOldSize != this._iSize) {
			toggleSizeClasses.call(this, this._iSize);

			var sKey = this.getViewKey();
			var oView = this._getView(sKey);
			var sIntervalType = oView.getIntervalType();
			var iIntervals = this._getIntervals(oView);
			for (i = 0; i < aRows.length; i++) {
				oRow = aRows[i];
				var oTimeline = getRowTimeline(oRow);
				if (iIntervals != oTimeline.getIntervals()) {
					oTimeline.setIntervals(iIntervals);
				} else {
					oTimeline.handleResize();
				}
			}

			switch (sIntervalType) {
				case CalendarIntervalType.Hour:
					if (this._oTimesRow && this._oTimesRow.getItems() != iIntervals) {
						this._oTimesRow.setItems(iIntervals);
						this._dateNav.setStep(iIntervals);
					}
					break;

				case CalendarIntervalType.Day:
					if (this._oDatesRow && this._oDatesRow.getDays() != iIntervals) {
						this._oDatesRow.setDays(iIntervals);
						this._dateNav.setStep(iIntervals);
					}
					break;

				case CalendarIntervalType.Month:
					if (this._oMonthsRow && this._oMonthsRow.getMonths() != iIntervals) {
						this._oMonthsRow.setMonths(iIntervals);
						this._dateNav.setStep(iIntervals);
					}
					break;

				case CalendarIntervalType.Week:
					if (this._oWeeksRow && this._oWeeksRow.getDays() != iIntervals) {
						this._oWeeksRow.setDays(iIntervals);
						this._dateNav.setStep(iIntervals);
					}
					break;

				case CalendarIntervalType.OneMonth:
					if (this._oOneMonthsRow && this._oOneMonthsRow.getDays() != iIntervals) {
						this._oOneMonthsRow.setDays(iIntervals);
						this._dateNav.setStep(iIntervals);
						if (this._iSize > 1) {
							//set start date to 1st of the month
							this._setRowsStartDate(new Date(this.getStartDate().getTime()));
						}
					}
					break;

				default:
					throw new Error("Unknown IntervalType: " + sIntervalType + "; " + this);
			}

			positionSelectAllCheckBox.call(this);
		}else if (!bNoRowResize) {
			for (i = 0; i < aRows.length; i++) {
				oRow = aRows[i];
				getRowTimeline(oRow).handleResize();
			}
		}

		if (this._oOneMonthsRow) {
			this._oOneMonthsRow.setMode(this._iSize);
			this._adjustSelectedDate(CalendarDate.fromLocalJSDate(this.getStartDate()));
		}

		// Call _updateStickyHeader only if the property stickyHeader is set to true
		// in order to set or remove the sticky class in special cases like 1MonthView or phone landscape
		// otherwise nothing should be updated
		if (this.getStickyHeader()) {
			this._updateStickyHeader();
		}
	}

	function handleAppointmentSelect(oEvent) {

		var oAppointment = oEvent.getParameter("appointment"),
			bMultiSelect = oEvent.getParameter("multiSelect"),
			aAppointments = oEvent.getParameter("appointments"),
			sGroupAppointmentDomRef = oEvent.getParameter("domRefId"),
			oEventParam,
			aRows,
			oRow,
			aRowAppointments,
			oRowAppointment,
			i, j;

		if (!bMultiSelect) {
			// deselect appointments of other rows
			aRows = this.getRows();
			for (i = 0; i < aRows.length; i++) {
				oRow = aRows[i];
				if (oEvent.oSource != getRowTimeline(oRow)) {
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
			getRowTimeline(oRow).setStartDate(oDateTime);
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
						(this._oViews[oViewType.Hour] = new PlanningCalendarView(this.getId() + "-HourView", {
							key: oViewType.Hour,
							intervalType: oIntervalType.Hour,
							description: this._oRB && this._oRB.getText("PLANNINGCALENDAR_HOURS"),
							intervalsS: 6,
							intervalsM: 6,
							intervalsL: 12
						}));
				case oViewType.Day:
					return this._oViews[oViewType.Day] ||
						(this._oViews[oViewType.Day] = new PlanningCalendarView(this.getId() + "-DayView", {
							key: oViewType.Day,
							intervalType: oIntervalType.Day,
							description: this._oRB && this._oRB.getText("PLANNINGCALENDAR_DAYS"),
							intervalsS: 7,
							intervalsM: 7,
							intervalsL: 14
						}));
				case oViewType.Month:
					return  this._oViews[oViewType.Month] ||
						(this._oViews[oViewType.Month] = new PlanningCalendarView(this.getId() + "-MonthView", {
							key: oViewType.Month,
							intervalType: oIntervalType.Month,
							description: this._oRB && this._oRB.getText("PLANNINGCALENDAR_MONTHS"),
							intervalsS: 3,
							intervalsM: 6,
							intervalsL: 12
						}));
				case oViewType.Week:
					return this._oViews[oViewType.Week] ||
						(this._oViews[oViewType.Week] = new PlanningCalendarView(this.getId() + "-WeekView", {
							key: oViewType.Week,
							intervalType: oIntervalType.Week,
							description: this._oRB && this._oRB.getText("PLANNINGCALENDAR_WEEK"),
							intervalsS: 7,
							intervalsM: 7,
							intervalsL: 7
						}));
				case oViewType.OneMonth:
					return this._oViews[oViewType.OneMonth] ||
						( this._oViews[oViewType.OneMonth] = new PlanningCalendarView(this.getId() + "-OneMonthView", {
							key: oViewType.OneMonth,
							intervalType: oIntervalType.OneMonth,
							description: this._oRB && this._oRB.getText("PLANNINGCALENDAR_ONE_MONTH"),
							intervalsS: 1,
							intervalsM: 1,
							intervalsL: 31
						}));
				default:
					Log.error("Cannot get PlanningCalendar views. Invalid view key " + sViewKey);
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
			aSelAppointments.push.apply(aSelAppointments, getRowTimeline(oRow).aSelectedAppointments);
		});

		return aSelAppointments;
	};

	/**
	 * A comparison function for appointments.
	 *
	 * Used by the {@link sap.m.PlanningCalendar PlanningCalendar} to sort appointments in a timeline.
	 *
	 * @callback sap.m.PlanningCalendar.appointmentsSorterCallback
	 * @param {sap.ui.unified.CalendarAppointment} appointment1 First appointment to compare
	 * @param {sap.ui.unified.CalendarAppointment} appointment2 Second appointment to compare
	 * @returns {int} A negative value to indicate that <code>appointment1</code> should be sorted before
	 *    <code>appointment2</code>, a positive value to indicate that <code>appointment1</code> should be sorted
	 *    after <code>appointment2</code>; a value of 0 if the relative order of <code>appointment1</code> and
	 *    <code>appointment2</code> should be preserved by the sort. <br>
	 *
	 *    <b>Note:</b> The behavior for a return value of 0 cannot be guaranteed, it depends on the browser's
	 *    implementation of <code>Array.prototype.sort</code>. In modern browsers, it works as described above.
	 * @public
	 */

	/**
	 * Setter for custom sorting of appointments. If not used, the appointments will be sorted according to their duration vertically.
	 * For example, the start time and order to the X axis won't change.
	 * @param {sap.m.PlanningCalendar.appointmentsSorterCallback} fnSorter
	 * @since 1.54
	 * @returns {sap.m.PlanningCalendar} <code>this</code> for chaining
	 * @public
	 */

	PlanningCalendar.prototype.setCustomAppointmentsSorterCallback = function(fnSorter) {
		if (typeof fnSorter === "function" || fnSorter === null || fnSorter === undefined) {
			this.getRows().forEach(function(oRow){
				getRowTimeline(oRow)._setCustomAppointmentsSorterCallback(fnSorter);
			});

			this._fnCustomSortedAppointments = fnSorter;
		} else {
			Log.warning("Your custom sort function won't be used, but the old one will be preserved.", this);
		}
		return this;
	};

	/**
	 * Getter for custom appointments sorter (if any).
	 * @since 1.54
	 * @returns {sap.m.PlanningCalendar.appointmentsSorterCallback}
	 * @public
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
			var aApps = getRowTimeline(rows[i]).aSelectedAppointments;
			for (var j = 0; j < aApps.length; j++) {
				var oApp = Core.byId(aApps[j]);
				if (oApp) {
					oApp.setProperty("selected", false, true);
					oApp.$().removeClass("sapUiCalendarAppSel");
				}

			}
			getRowTimeline(rows[i]).aSelectedAppointments = [];
		}
	};

	/**
	 * Initializes the row timeline instance with the properties of the planning calendar and planing calendar row
	 *
	 * @param oRow
	 * @private
	 */
	PlanningCalendar.prototype._updateRowTimeline = function (oRow) {
		var oRowTimeline = getRowTimeline(oRow),
			sKey, oView, sIntervalType, iIntervals,
			bMobile1MonthView = this.getViewKey() === PlanningCalendarBuiltInView.OneMonth && this._iSize < 2,
			oStartDate = this.getStartDate();

		oRowTimeline.setNonWorkingDays(oRow.getNonWorkingDays());
		oRowTimeline.setNonWorkingHours(oRow.getNonWorkingHours());

		//in onemonthview in mobile
		//set the start dates of the newly created rows
		//to match the currently selected day
		if (bMobile1MonthView
			&& this._oOneMonthsRow
			&& this._oOneMonthsRow.getSelectedDates().length) {
			oStartDate = this._oOneMonthsRow.getSelectedDates()[0].getStartDate();
		}

		oRowTimeline.setStartDate(oStartDate);
		oRowTimeline.setShowIntervalHeaders(this.getShowIntervalHeaders());
		oRowTimeline.setShowEmptyIntervalHeaders(this.getShowEmptyIntervalHeaders());
		oRowTimeline.setGroupAppointmentsMode(this.getGroupAppointmentsMode());
		oRowTimeline.setAppointmentsReducedHeight(this.getAppointmentsReducedHeight());
		oRowTimeline.setLegend(this.getLegend());
		oRowTimeline.setAppointmentsVisualization(this.getAppointmentsVisualization());
		oRowTimeline.attachEvent("select", handleAppointmentSelect, this);
		oRowTimeline.attachEvent("startDateChange", this._handleStartDateChange, this);
		oRowTimeline.attachEvent("leaveRow", handleLeaveRow, this);
		oRowTimeline.attachEvent("intervalSelect", handleIntervalSelect, this);

		updateSelectAllCheckBox.call(this);

		if (isThereAnIntervalInstance.call(this)) {
			sKey = this.getViewKey();
			oView = this._getView(sKey);
			sIntervalType = oView.getIntervalType();
			iIntervals = this._getIntervals(oView);

			oRowTimeline.setIntervalType(sIntervalType);
			oRowTimeline.setIntervals(iIntervals);
			oRowTimeline.setShowSubIntervals(oView.getShowSubIntervals());
		}

		setSelectionMode.call(this);

		//when there's a new row added, be sure that if there's a custom sorter, it'll be set to the corresponding row
		if (this._fnCustomSortedAppointments) {
			oRowTimeline._setCustomAppointmentsSorterCallback(this._fnCustomSortedAppointments);
		}
	};

	/**
	 * Observes for changes in the PlanningCalendarRow that is being created and passes the new values to the
	 * corresponding internal controls that are used for rendering the row.
	 *
	 * @param oRow the row that is observed
	 * @private
	 */
	PlanningCalendar.prototype._observeRowChanges = function (oRow) {
		var oListItem = getListItem(oRow),
			oRowHeader = getRowHeader(oRow),
			oRowTimeline = getRowTimeline(oRow);

		var RowHandler = {
			destroy: function () {
				oListItem.destroy();
			},
			change: {
				title: function (oChanges) {
					oRowHeader.setProperty(oChanges.name, oChanges.current);
				},
				icon: function (oChanges) {
					oRowHeader.setProperty(oChanges.name, oChanges.current);
				},
				text: function (oChanges) {
					// Large row style class
					oRowTimeline.toggleStyleClass("sapMPlanCalRowLarge", !!oChanges.current);

					oRowHeader.setProperty("description", oChanges.current);
				},
				enableAppointmentsDragAndDrop: function (oChanges) {
					this._enableAppointmentsDragAndDrop(oRow);
				}.bind(this),
				enableAppointmentsResize: function (oChanges) {
					this._enableAppointmentsResize(oRow);
				}.bind(this),
				enableAppointmentsCreate: function (oChanges) {
					this._enableAppointmentsCreate(oRow);
				}.bind(this),
				nonWorkingDays: function (oChanges) {
					oRowTimeline.setProperty(oChanges.name, oChanges.current);
				},
				nonWorkingHours: function (oChanges) {
					oRowTimeline.setProperty(oChanges.name, oChanges.current);
				},
				selected: function (oChanges) {
					updateSelectAllCheckBox.call(this);

					oListItem.setProperty(oChanges.name, oChanges.current);
				}.bind(this),
				tooltip: function (oChanges) {
					if (oChanges.mutation === "insert") {
						oRowHeader.setTooltip(oChanges.child);
					} else if (oChanges.mutation === "remove") {
						oRowHeader.setTooltip();
					}
				},
				intervalHeaders: function (oChanges) {
					oRowTimeline.invalidate();
				},
				appointments: function (oChanges) {
					oRowTimeline.invalidate();
				}
			}
		};

		new ManagedObjectObserver(function (oChanges) {
			if (oChanges.type === "destroy") {
				RowHandler.destroy();
			} else if (RowHandler.change[oChanges.name]) {
				RowHandler.change[oChanges.name](oChanges);
			}
		}).observe(oRow, {
			properties: ["icon", "text", "title", "nonWorkingDays", "nonWorkingHours", "selected", "enableAppointmentsDragAndDrop", "enableAppointmentsResize", "enableAppointmentsCreate"],
			aggregations: ["tooltip", "appointments", "intervalHeaders", "headerContent"],
			destroy: true
		});

		oRow.invalidate = function(oOrigin) {
			if (!oOrigin || !(oOrigin instanceof CalendarAppointment)) {
				Element.prototype.invalidate.apply(this, arguments);
			} else if (oListItem) {
				// Appointment changed -> only invalidate internal CalendarRow (not if ColumnListItem is already destroyed)
				oRowTimeline.invalidate(oOrigin);
			}
		};

		oRow.applyFocusInfo = function (oFocusInfo) {
			// forward to CalendarRow
			oRowTimeline.applyFocusInfo(oFocusInfo);

			return this;
		};
	};

	/**
	 * Creates and initializes all the controls that are needed to represent a row.
	 *
	 * @param oRow
	 * @returns {PlanningCalendarRowListItem|*}
	 * @private
	 */
	PlanningCalendar.prototype._createPlanningCalendarListItem = function(oRow) {
		var oListItem, oRowHeader, oRowTimeline;

		//if there's a headerContent in the row or binding - render only the content,
		//otherwise render PlanningCalendarRowHeader
		if (oRow.getHeaderContent().length || oRow.getBindingInfo("headerContent")) {
			oRowHeader = oRow._getPlanningCalendarCustomRowHeader();
		} else {
			oRowHeader = new PlanningCalendarRowHeader(oRow.getId() + "-Head", {
				icon : oRow.getIcon(),
				description : oRow.getText(),
				title : oRow.getTitle(),
				tooltip : oRow.getTooltip(),
				// set iconDensityAware to false (the default is true for the StandardListItem)
				// in order to avoid multiple 404 requests for the applications that do not have these images
				iconDensityAware: false
			});
		}

		oRowTimeline = new PlanningCalendarRowTimeline(oRow.getId() + "-CalRow", {
			checkResize: false,
			updateCurrentTime: false,
			ariaLabelledBy: oRowHeader.getId()
		});

		oRowTimeline.getAppointments = function() {
			return oRow.getAppointments();
		};

		oRowTimeline.getIntervalHeaders = function() {
			return oRow.getIntervalHeaders();
		};

		oListItem = new PlanningCalendarRowListItem(oRow.getId() + LISTITEM_SUFFIX, {
			cells: [oRowHeader, oRowTimeline]
		});

		this._updateRowTimeline(oRow);

		this._observeRowChanges(oRow);

		this._enableAppointmentsDragAndDrop(oRow);
		this._enableAppointmentsResize(oRow);
		this._enableAppointmentsCreate(oRow);

		return oListItem;
	};

	/**
	 * Detaches the attached functions from the PlanningCalendarRowTimeline instance that corresponts to the row and
	 * destorys the corresponding PlanningCalendarRowListItem.
	 *
	 * @param oRow
	 * @private
	 */
	PlanningCalendar.prototype._handleRowRemoval = function(oRow) {
		var oTimeline = getRowTimeline(oRow);

		oTimeline.detachEvent("select", handleAppointmentSelect, this);
		oTimeline.detachEvent("startDateChange", this._handleStartDateChange, this);
		oTimeline.detachEvent("leaveRow", handleLeaveRow, this);
		oTimeline.detachEvent("intervalSelect", handleIntervalSelect, this);

		//the reference to the sorter function must be cleared, as it is invalid in other context
		if (this._fnCustomSortedAppointments){
			oTimeline._fnCustomSortedAppointments = undefined;
		}

		getListItem(oRow).destroy();
	};

	// ************************************* PRIVATE CLASSES BEGIN *****************************************************

	/**
	 * Represents a header inside PlanningCalendarRowListItem.
	 */
	var PlanningCalendarRowHeader = StandardListItem.extend("PlanningCalendarRowHeader", {

		renderer: Renderer.extend(StandardListItemRenderer),
		TagName: "div"

	});


	PlanningCalendarRowHeader.prototype.isSelectable = function () {
		// The header itself isn't selectable - the row is.
		return false;
	};

	/*global PlanningCalendarRowHeaderRenderer:true*/
	PlanningCalendarRowHeaderRenderer.renderTabIndex = function(oRm, oLI) {
	};

	PlanningCalendarRowHeaderRenderer.getAriaRole = function (oRm, oLI) {
	};

	var PlanningCalendarRowTimelineRenderer = Renderer.extend(CalendarRowRenderer);
	PlanningCalendarRowTimelineRenderer.apiVersion = 2;

	/* Returns AppointmentItems or Items depends on the Legend type:
		sap.m.PlanningCalendarLegend or sap.ui.unified.CalendarLegend
	 */
	PlanningCalendarRowTimelineRenderer.getLegendItems = function (oTimeline) {
		var aTypes = [],
			oLegend,
			sLegendId = oTimeline.getLegend();

		if (sLegendId) {
			oLegend = Core.byId(sLegendId);
			if (oLegend) {
				aTypes = oLegend.getAppointmentItems ? oLegend.getAppointmentItems() : oLegend.getItems();
			} else {
				Log.error("PlanningCalendarLegend with id '" + sLegendId + "' does not exist!", oTimeline);
			}
		}
		return aTypes;
	};

	PlanningCalendarRowTimelineRenderer.renderBeforeAppointments = function (oRm, oTimeline) {
		var oRow = getRow(oTimeline.getParent()),
			aIntervalPlaceholders;

		if (!oRow.getEnableAppointmentsDragAndDrop() && !oRow.getEnableAppointmentsResize() && !oRow.getEnableAppointmentsCreate() ||
			oTimeline._isOneMonthsRowOnSmallSizes()) {
			return;
		}

		aIntervalPlaceholders = oTimeline.getAggregation("_intervalPlaceholders");

		oRm.openStart("div");
		oRm.class("sapUiCalendarRowAppsOverlay");
		oRm.openEnd(); // div element
		if (aIntervalPlaceholders) {
			for (var i = 0; i < aIntervalPlaceholders.length; i++) {
				var intervalPlaceholder = aIntervalPlaceholders[i];
				intervalPlaceholder.setWidth(100 / aIntervalPlaceholders.length + "%");
				oRm.renderControl(intervalPlaceholder);
			}
		}
		oRm.close("div");
	};

	PlanningCalendarRowTimelineRenderer.renderResizeHandle = function (oRm, oTimeline, oAppointment) {
		if (!getRow(oTimeline.getParent()).getEnableAppointmentsResize() || oTimeline._isOneMonthsRowOnSmallSizes() || (oAppointment._aAppointments && oAppointment._aAppointments.length > 0)) {
			return;
		}

		oRm.openStart("span");
		oRm.class("sapUiCalendarAppResizeHandle");
		oRm.openEnd(); // span element
		oRm.close("span");
	};

	PlanningCalendarRowTimelineRenderer.writeCustomAttributes = function (oRm, oTimeline) {
		if (getRow(oTimeline.getParent()).getEnableAppointmentsCreate()) {
			oRm.attr("draggable", "true");
		}
	};

	PlanningCalendarRowTimelineRenderer.renderInterval = function (oRm, oTimeline, iInterval, iWidth,  aIntervalHeaders, aNonWorkingItems, iStartOffset, iNonWorkingMax, aNonWorkingSubItems, iSubStartOffset, iNonWorkingSubMax, bFirstOfType, bLastOfType) {
		var sIntervalType = oTimeline.getIntervalType();

		if (sIntervalType === CalendarIntervalType.Day || sIntervalType === CalendarIntervalType.Week || sIntervalType === CalendarIntervalType.OneMonth) {
			var oRow = getRow(oTimeline.getParent()),
				oPC = oRow.getParent(),
				fnNonWorkingFilter = function (oSpecialDate) {
					return oSpecialDate.getType() === CalendarDayType.NonWorking;
				},
				aRowNonWorkingDates = oRow.getSpecialDates().filter(fnNonWorkingFilter),
				aPCNonWorkingDates = oPC.getSpecialDates().filter(fnNonWorkingFilter),
				oRowStartDate = oTimeline.getStartDate(),
				aAllNonworkingDates, oCurrentDate, oNonWorkingStartDate, oNonWorkingEndDate;

			if (aPCNonWorkingDates && aRowNonWorkingDates) {
				aAllNonworkingDates = aPCNonWorkingDates.concat(aRowNonWorkingDates);
			} else if (aRowNonWorkingDates) {
				aAllNonworkingDates = aRowNonWorkingDates;
			}

			if (aAllNonworkingDates && aAllNonworkingDates.length) {
				var fnDayMatchesCurrentDate = function (iDay) {
					return iDay === oCurrentDate.getDay();
				};
				oCurrentDate = new Date(oRowStartDate.getTime());
				oCurrentDate.setHours(0, 0, 0);
				oCurrentDate.setDate(oRowStartDate.getDate() + iInterval);

				for (var i = 0; i < aAllNonworkingDates.length; i++) {
					if (aAllNonworkingDates[i].getStartDate()) {
						oNonWorkingStartDate = new Date(aAllNonworkingDates[i].getStartDate().getTime());
					}
					if (aAllNonworkingDates[i].getEndDate()) {
						oNonWorkingEndDate = new Date(aAllNonworkingDates[i].getEndDate().getTime());
					} else {
						oNonWorkingEndDate = new Date(aAllNonworkingDates[i].getStartDate().getTime());
						oNonWorkingEndDate.setHours(23, 59, 59);
					}
					if (oCurrentDate.getTime() >= oNonWorkingStartDate.getTime() && oCurrentDate.getTime() <= oNonWorkingEndDate.getTime()) {
						var bAlreadyNonWorkingDate = aNonWorkingItems.some(fnDayMatchesCurrentDate);
						if (!bAlreadyNonWorkingDate) {
							oRm.class("sapUiCalendarRowAppsNoWork");
						}
					}
				}
			}
		}
		CalendarRowRenderer.renderInterval(oRm, oTimeline, iInterval, iWidth,  aIntervalHeaders, aNonWorkingItems, iStartOffset, iNonWorkingMax, aNonWorkingSubItems, iSubStartOffset, iNonWorkingSubMax, bFirstOfType, bLastOfType);
	};

	/**
	 * Represents timeline that holds the appointments and intervals indide the PlanningCalendarRowListItem
	 */
	var PlanningCalendarRowTimeline = CalendarRow.extend("PlanningCalendarRowTimeline", {
		metadata: {
			aggregations : {
				intervalHeaders : {type : "sap.ui.unified.CalendarAppointment", multiple : true},
				_intervalPlaceholders : {type : "IntervalPlaceholder", multiple : true, visibility : "hidden", dnd : {droppable: true}}
			},
			dnd: true
		},
		renderer: PlanningCalendarRowTimelineRenderer
	});

	PlanningCalendarRowTimeline.prototype._updatePlaceholders = function() {
		var iPlaceholders = this.getProperty("intervals");

		if (this.getIntervalType() === CalendarIntervalType.Hour) {
			iPlaceholders *= 2 ;
		}

		this.removeAllAggregation("_intervalPlaceholders");
		for (var i = 0; i < iPlaceholders; i++) {
			this.addAggregation("_intervalPlaceholders", new IntervalPlaceholder());
		}
	};

	PlanningCalendarRowTimeline.prototype.onBeforeRendering = function() {
		CalendarRow.prototype.onBeforeRendering.call(this);
		this._updatePlaceholders();
	};

	PlanningCalendarRowTimeline.prototype.onmousedown = function (oEvent) {
		var oClassList = oEvent.target.classList;
		this._isResizeHandleMouseDownTarget = oClassList.contains("sapUiCalendarAppResizeHandle");
		this._isRowAppsIntervalMouseDownTarget = oClassList.contains("sapUiCalendarRowAppsInt");
	};

	PlanningCalendarRowTimeline.prototype._isResizingPerformed = function () {
		return this._isResizeHandleMouseDownTarget;
	};

	PlanningCalendarRowTimeline.prototype._isDraggingPerformed = function () {
		return !this._isResizeHandleMouseDownTarget && !this._isRowAppsIntervalMouseDownTarget;
	};

	PlanningCalendarRowTimeline.prototype._isCreatingPerformed = function () {
		return this._isRowAppsIntervalMouseDownTarget;
	};

	/**
	 * Renders invisible interval placeholders that are used for drop targets.
	 */
	var IntervalPlaceholder = Control.extend("IntervalPlaceholder", {
		metadata: {
			properties: {
				width : {type : "sap.ui.core.CSSSize", group : "Appearance", defaultValue : null}
			}
		},
		renderer: function(oRm, oControl) {
			oRm.openStart("div", oControl);
			oRm.style("width", oControl.getWidth());
			oRm.class("sapUiCalendarRowAppsPlaceholder");
			oRm.openEnd();
			oRm.close("div");
		}
	});

	/**
	 * Represents planning calendar row that holds header and timeline inside the internal table.
	 */
	var PlanningCalendarRowListItem = ColumnListItem.extend("sap.m.internal.PlanningCalendarRowListItem", {
		metadata: {
			library: "sap.m"
		},
		renderer: ColumnListItemRenderer
	});

	PlanningCalendarRowListItem.prototype.getHeader = function() {
		return this.getCells()[0];
	};

	PlanningCalendarRowListItem.prototype.getTimeline = function() {
		return this.getCells()[1];
	};

	/**
	 * Takes care to ensure that the custom data given to the PlanningCalendarRow (sap.ui.core.Element) is used.
	 * @returns {*} the custom data
	 */
	PlanningCalendarRowListItem.prototype.getCustomData = function() {
		return getRow(this).getCustomData();
	};
	// ************************************* PRIVATE CLASSES END *******************************************************
	PlanningCalendar.prototype._getSelectedDates = function () {
		var sViewKey = this.getViewKey(),
			oCurrentView = this._getView(sViewKey),
			sCurrentViewIntervalType = oCurrentView.getIntervalType(),
			oIntervalMetadata = INTERVAL_METADATA[sCurrentViewIntervalType];

		return this[oIntervalMetadata.sInstanceName].getSelectedDates();
	};

	PlanningCalendar.prototype._enableAppointmentsDragAndDrop = function (oRow) {
		var oTimeline = getRowTimeline(oRow),
			bConfigExists;

		if (oRow.getEnableAppointmentsDragAndDrop()) {
			bConfigExists = oRow.getDragDropConfig().some(function (oDragDropInfo) {
				return oDragDropInfo.getGroupName() === DRAG_DROP_CONFIG_NAME;
			});

			if (!bConfigExists) {
				this._addDragDropInfo(oRow, getRowTimeline(oRow));
			}

		} else {

			oRow.getDragDropConfig().forEach(function (oDragDropInfo) {
				if (oDragDropInfo.getGroupName() === DRAG_DROP_CONFIG_NAME) {
					oRow.removeDragDropConfig(oDragDropInfo);
				}
			});

			oTimeline.getDragDropConfig().forEach(function (oDragDropInfo) {
				if (oDragDropInfo.getGroupName() === DRAG_DROP_CONFIG_NAME) {
					oTimeline.removeDragDropConfig(oDragDropInfo);
				}
			});
		}
	};

	PlanningCalendar.prototype._enableAppointmentsResize = function (oRow) {
		var enableAppointmentsResize = oRow.getEnableAppointmentsResize(),
			oOldConfig = this._getConfigFromDragDropConfigAggregation(oRow.getAggregation("dragDropConfig"), RESIZE_CONFIG_NAME),
			oNewConfig = this._getResizeConfig(oRow);

		if (enableAppointmentsResize && !oOldConfig) {
			oRow.addAggregation("dragDropConfig", oNewConfig, true); // do not invalidate
		}

		if (!enableAppointmentsResize) {
			oRow.removeAggregation("dragDropConfig", oOldConfig, true); // do not invalidate
		}
	};

	PlanningCalendar.prototype._enableAppointmentsCreate = function (oRow) {
		var enableAppointmentsCreate = oRow.getEnableAppointmentsCreate(),
			oTimeline = getRowTimeline(oRow),
			oOldConfig = this._getConfigFromDragDropConfigAggregation(oTimeline.getAggregation("dragDropConfig"), CREATE_CONFIG_NAME),
			oNewConfig = this._getAppointmentsCreateConfig(oRow);

		if (enableAppointmentsCreate && !oOldConfig) {
			oTimeline.addAggregation("dragDropConfig", oNewConfig, true); // do not invalidate
		}

		if (!enableAppointmentsCreate) {
			oTimeline.removeAggregation("dragDropConfig", oOldConfig, true); // do not invalidate
		}
	};

	PlanningCalendar.prototype._addDragDropInfo = function (oSourceTimeline, oTargetTimeline) {

		oSourceTimeline.addDragDropConfig(new DragInfo({
			groupName: DRAG_DROP_CONFIG_NAME,
			sourceAggregation: "appointments",

			/**
			 * Fired when the user starts dragging an appointment.
			 */
			dragStart: function (oEvent) {
				var fnHandleAppsOverlay = function () {
					var $CalendarRowAppsOverlay = jQuery(".sapUiCalendarRowAppsOverlay");

					setTimeout(function () {
						$CalendarRowAppsOverlay.addClass("sapUiCalendarRowAppsOverlayDragging");
					}, 0);

					jQuery(document).one("dragend", function () {
						$CalendarRowAppsOverlay.removeClass("sapUiCalendarRowAppsOverlayDragging");
					});
				};
				if (oTargetTimeline._isOneMonthsRowOnSmallSizes() || !oTargetTimeline._isDraggingPerformed()) {
					oEvent.preventDefault();
					return;
				}

				fnHandleAppsOverlay();
			}
		}));

		oTargetTimeline.addDragDropConfig(new DropInfo({
			groupName: DRAG_DROP_CONFIG_NAME,
			targetAggregation: "_intervalPlaceholders",

			/**
			 * Fired when a dragged appointment enters a drop target.
			 */
			dragEnter: function (oEvent) {
				var oDragSession = oEvent.getParameter("dragSession"),
					oAppointment = oDragSession.getDragControl(),
					sIntervalType = oTargetTimeline.getIntervalType(),
					oRowStartDate = oTargetTimeline.getStartDate(),
					iIndex = oTargetTimeline.indexOfAggregation("_intervalPlaceholders", oDragSession.getDropControl()),
					sTargetElementId = oTargetTimeline.getId(),
					newPos,
					fnAlignIndicator = function () {
						var $Indicator = jQuery(oDragSession.getIndicator()),
							oDropRects = oDragSession.getDropControl().getDomRef().getBoundingClientRect(),
							oRowRects = Core.byId(sTargetElementId).getDomRef().getBoundingClientRect(),
							iAppWidth = oDragSession.getDragControl().$().outerWidth(),
							bRTL = Core.getConfiguration().getRTL(),
							iAvailWidth = bRTL ? Math.ceil(oDropRects.right) - oRowRects.left : oRowRects.right - Math.ceil(oDropRects.left);

						$Indicator
							.css("min-width", (iAppWidth < iAvailWidth) ? iAppWidth : iAvailWidth)
							.css(bRTL ? "border-left-width" : "border-right-width", (iAppWidth > iAvailWidth) ? "0" : "")
							.css("margin-left", bRTL ? -($Indicator.outerWidth() - parseFloat($Indicator.context.style.width)) : "");
					};

				if (oSourceTimeline.hasListeners("appointmentDragEnter")) {

					if (sIntervalType === CalendarIntervalType.Hour) {
						newPos = this._calcNewHoursAppPos(oRowStartDate, oAppointment.getStartDate(), oAppointment.getEndDate(), iIndex);
					} else if (sIntervalType === CalendarIntervalType.Day
						|| sIntervalType === CalendarIntervalType.Week
						|| (sIntervalType === CalendarIntervalType.OneMonth && !oTargetTimeline._isOneMonthsRowOnSmallSizes())) {

						newPos = this._calcNewDaysAppPos(oRowStartDate, oAppointment.getStartDate(), oAppointment.getEndDate(), iIndex);
					} else if (sIntervalType === CalendarIntervalType.Month) {

						newPos = this._calcNewMonthsAppPos(oRowStartDate, oAppointment.getStartDate(), oAppointment.getEndDate(), iIndex);
					}

					var bDropabbleArea = oSourceTimeline.fireAppointmentDragEnter({
						appointment: oAppointment,
						startDate: newPos.startDate,
						endDate: newPos.endDate,
						calendarRow: getRow(oTargetTimeline.getParent())
					});

					if (!bDropabbleArea) {
						oEvent.preventDefault();
						return;
					}

				} else if (getRowTimeline(oAppointment.getParent()) !== oTargetTimeline) {
					oEvent.preventDefault();
					return;
				}

				if (oTargetTimeline.getIntervalType() !== CalendarIntervalType.Hour) {
					return;
				}

				if (!oDragSession.getIndicator()) {
					setTimeout(fnAlignIndicator, 0);
				} else {
					fnAlignIndicator();
				}
			}.bind(this),

			/**
			 * Fired when an appointment is dropped.
			 */
			drop: function (oEvent) {
				var oDragSession = oEvent.getParameter("dragSession"),
					oAppointment = oDragSession.getDragControl(),
					sIntervalType = oTargetTimeline.getIntervalType(),
					oRowStartDate = oTargetTimeline.getStartDate(),
					iIndex = oTargetTimeline.indexOfAggregation("_intervalPlaceholders", oDragSession.getDropControl()),
					newPos,
					oBrowserEvent = oEvent.getParameter("browserEvent"),
					bCopy = (oBrowserEvent.metaKey || oBrowserEvent.ctrlKey);

				if (sIntervalType === CalendarIntervalType.Hour) {
					newPos = this._calcNewHoursAppPos(oRowStartDate, oAppointment.getStartDate(), oAppointment.getEndDate(), iIndex);
				} else if (sIntervalType === CalendarIntervalType.Day
					|| sIntervalType === CalendarIntervalType.Week
					|| (sIntervalType === CalendarIntervalType.OneMonth && !oTargetTimeline._isOneMonthsRowOnSmallSizes())) {

					newPos = this._calcNewDaysAppPos(oRowStartDate, oAppointment.getStartDate(), oAppointment.getEndDate(), iIndex);
				} else if (sIntervalType === CalendarIntervalType.Month) {

					newPos = this._calcNewMonthsAppPos(oRowStartDate, oAppointment.getStartDate(), oAppointment.getEndDate(), iIndex);
				}

				oTargetTimeline.$().find(".sapUiCalendarRowAppsOverlay").removeClass("sapUiCalendarRowAppsOverlayDragging");

				if (oAppointment.getStartDate().getTime() === newPos.startDate.getTime()
					&& oAppointment.getParent() === getRow(oTargetTimeline.getParent())) {

					return;
				}

				oSourceTimeline.fireAppointmentDrop({
					appointment: oAppointment,
					startDate: newPos.startDate,
					endDate: newPos.endDate,
					calendarRow: getRow(oTargetTimeline.getParent()),
					copy: bCopy
				});
			}.bind(this)
		}));
	};

	PlanningCalendar.prototype._calcNewHoursAppPos = function(oRowStartDate, oAppStartDate, oAppEndDate, iIndex) {
		var oStartDate = new Date(oRowStartDate.getFullYear(), oRowStartDate.getMonth(), oRowStartDate.getDate(), oRowStartDate.getHours());
		oStartDate = new Date(oStartDate.getTime() + (iIndex * 30 * 60 * 1000)); // 30 min

		return {
			startDate: oStartDate,
			endDate: new Date(oStartDate.getTime() + oAppEndDate.getTime() - oAppStartDate.getTime())
		};
	};

	PlanningCalendar.prototype._calcNewDaysAppPos = function(oRowStartDate, oAppStartDate, oAppEndDate, iIndex) {
		var oStartDate = new Date(oRowStartDate);

		oStartDate.setDate(oStartDate.getDate() + iIndex);
		oStartDate = new Date(oStartDate.getFullYear(), oStartDate.getMonth(), oStartDate.getDate(), oAppStartDate.getHours(), oAppStartDate.getMinutes(), oAppStartDate.getSeconds());

		return {
			startDate: oStartDate,
			endDate: new Date(oStartDate.getTime() + oAppEndDate.getTime() - oAppStartDate.getTime())
		};
	};

	PlanningCalendar.prototype._calcNewMonthsAppPos = function(oRowStartDate, oAppStartDate, oAppEndDate, iIndex) {
		var oStartDate = new Date(oRowStartDate);

		oStartDate.setMonth(oStartDate.getMonth() + iIndex);
		oStartDate = new Date(oStartDate.getFullYear(), oStartDate.getMonth(), oAppStartDate.getDate(), oAppStartDate.getHours(), oAppStartDate.getMinutes(), oAppStartDate.getSeconds());

		return {
			startDate: oStartDate,
			endDate: new Date(oStartDate.getTime() + oAppEndDate.getTime() - oAppStartDate.getTime())
		};
	};

	PlanningCalendar.prototype._getResizeConfig = function (oRow) {
		var oTimeline = getRowTimeline(oRow),
			oResizeConfig = new DragDropInfo({
				sourceAggregation: "appointments",
				targetAggregation: "_intervalPlaceholders",
				targetElement: getRowTimeline(oRow),

				/**
				 * Fired when the user starts dragging an appointment.
				 */
				dragStart: function (oEvent) {
					if (!oRow.getEnableAppointmentsResize() || oTimeline._isOneMonthsRowOnSmallSizes() || !oTimeline._isResizingPerformed()) {
						oEvent.preventDefault();
						return;
					}

					var oDragSession = oEvent.getParameter("dragSession"),
						$CalendarRowAppsOverlay = oTimeline.$().find(".sapUiCalendarRowAppsOverlay"),
						$Indicator = jQuery(oDragSession.getIndicator()),
						$DraggedControl = oDragSession.getDragControl().$();

					$Indicator.addClass("sapUiDnDIndicatorHide");
					setTimeout(function () {
						$CalendarRowAppsOverlay.addClass("sapUiCalendarRowAppsOverlayDragging");
					}, 0);

					jQuery(document).one("dragend", function () {
						$CalendarRowAppsOverlay.removeClass("sapUiCalendarRowAppsOverlayDragging");
						$Indicator.removeClass("sapUiDnDIndicatorHide");
						$DraggedControl.css({
							width: "auto",
							"min-width": "auto",
							"z-index": "auto",
							opacity: 1
						});
					});

					if (!Device.browser.msie && !Device.browser.edge) {
						oEvent.getParameter("browserEvent").dataTransfer.setDragImage(getResizeGhost(), 0, 0);
					}
				},

				/**
				 * Fired when a dragged appointment enters a drop target.
				 */
				dragEnter: function (oEvent) {
					var oDragSession = oEvent.getParameter("dragSession"),
						sTargetElementId = this.getTargetElement(),
						fnHideIndicator = function () {
							var $Indicator = jQuery(oDragSession.getIndicator());
							$Indicator.addClass("sapUiDnDIndicatorHide");
						},
						oDropRects = oDragSession.getDropControl().getDomRef().getBoundingClientRect(),
						oRowRects = Core.byId(sTargetElementId).getDomRef().getBoundingClientRect(),
						mDraggedControlConfig = {
							width: oDropRects.left + oDropRects.width - (oDragSession.getDragControl().$().position().left + oRowRects.left),
							"z-index": 1,
							opacity: 0.8
						},
						fMinWidth = mDraggedControlConfig.width;

					if (oDropRects.width > 0) {
						while (fMinWidth <= 0) {
							fMinWidth += oDropRects.width;
						}
						while (fMinWidth > oDropRects.width) {
							fMinWidth -= oDropRects.width;
						}
					}
					mDraggedControlConfig["min-width"] = fMinWidth;

					oDragSession.getDragControl().$().css(mDraggedControlConfig);

					if (!oDragSession.getIndicator()) {
						setTimeout(fnHideIndicator, 0);
					} else {
						fnHideIndicator();
					}
				},

				/**
				 * Fired when an appointment is dropped.
				 */
				drop: function (oEvent) {
					var oTimeline = getRowTimeline(oRow),
						oDragSession = oEvent.getParameter("dragSession"),
						oAppointment = oDragSession.getDragControl(),
						sIntervalType = oTimeline.getIntervalType(),
						oRowStartDate = oTimeline.getStartDate(),
						iIndex = oTimeline.indexOfAggregation("_intervalPlaceholders", oDragSession.getDropControl()),
						newPos;

					if (sIntervalType === CalendarIntervalType.Hour) {
						newPos = this._calcResizeNewHoursAppPos(oRowStartDate, oAppointment.getStartDate(), oAppointment.getEndDate(), iIndex);
					} else if (sIntervalType === CalendarIntervalType.Day
						|| sIntervalType === CalendarIntervalType.Week
						|| (sIntervalType === CalendarIntervalType.OneMonth && !oTimeline._isOneMonthsRowOnSmallSizes())) {

						newPos = this._calcResizeNewDaysAppPos(oRowStartDate, oAppointment.getStartDate(), oAppointment.getEndDate(), iIndex);
					} else if (sIntervalType === CalendarIntervalType.Month) {

						newPos = this._calcResizeNewMonthsAppPos(oRowStartDate, oAppointment.getStartDate(), oAppointment.getEndDate(), iIndex);
					}

					oTimeline.$().find(".sapUiCalendarRowAppsOverlay").removeClass("sapUiCalendarRowAppsOverlayDragging");
					jQuery(oDragSession.getIndicator()).removeClass("sapUiDnDIndicatorHide");

					oAppointment.$().css({
						width: "auto",
						"min-width": "auto",
						"z-index": "auto",
						opacity: 1
					});

					if (oAppointment.getEndDate().getTime() === newPos.endDate.getTime() ) {
						return;
					}

					oRow.fireAppointmentResize({
						appointment: oAppointment,
						startDate: newPos.startDate,
						endDate: newPos.endDate,
						calendarRow: oRow
					});
				}.bind(this)
			});

		oResizeConfig.setProperty("groupName", RESIZE_CONFIG_NAME);

		return oResizeConfig;
	};

	PlanningCalendar.prototype._calcResizeNewHoursAppPos = function(oRowStartDate, oAppStartDate, oAppEndDate, iIndex) {
		var oEndDate = new Date(oRowStartDate.getFullYear(), oRowStartDate.getMonth(), oRowStartDate.getDate(), oRowStartDate.getHours()),
			iMinutesStep = 30 * 60 * 1000; // 30 min

		oEndDate = new Date(oEndDate.getTime() + ((iIndex + 1) *  iMinutesStep));

		if (oEndDate.getTime() <= oAppStartDate.getTime()) {
			oEndDate = new Date(oAppStartDate.getTime() + iMinutesStep);
		}

		return {
			startDate: oAppStartDate,
			endDate: oEndDate
		};
	};

	PlanningCalendar.prototype._calcResizeNewDaysAppPos = function(oRowStartDate, oAppStartDate, oAppEndDate, iIndex) {
		var oEndDate = new Date(oRowStartDate),
			iNewEndDate = oEndDate.getDate() + iIndex + 1,
			oNewEndDate = new Date(oEndDate.getFullYear(), oEndDate.getMonth(), oEndDate.getDate());

		oNewEndDate.setDate(iNewEndDate);

		// This line checks if the start date is after the new end date and if so it just adds 1 to the startdate.
		if (oNewEndDate.getTime() <= oAppStartDate.getTime()) {
			iNewEndDate = oAppStartDate.getDate() + 1;
		}

		oEndDate.setDate(iNewEndDate);
		oEndDate = new Date(oEndDate.getFullYear(), oEndDate.getMonth(), oEndDate.getDate());

		return {
			startDate: oAppStartDate,
			endDate: oEndDate
		};
	};

	PlanningCalendar.prototype._calcResizeNewMonthsAppPos = function(oRowStartDate, oAppStartDate, oAppEndDate, iIndex) {
		var oEndDate = new Date(oRowStartDate),
			iNewEndMonth = oEndDate.getMonth() + iIndex + 1;

		if (iNewEndMonth <= oAppStartDate.getMonth()) {
			iNewEndMonth = oAppStartDate.getMonth() + 1;
		}

		oEndDate.setMonth(iNewEndMonth);
		oEndDate = new Date(oEndDate.getFullYear(), oEndDate.getMonth(), 1);

		return {
			startDate: oAppStartDate,
			endDate: oEndDate
		};
	};

	PlanningCalendar.prototype._calcCreateNewAppHours = function(oRowStartDate, iStartIndex, iEndIndex) {
		var iMinutesStep = 30 * 60 * 1000,  // 30 min
			oAppStartDate,
			oAppEndDate;

		if (iStartIndex <= iEndIndex) {
			oAppStartDate = new Date(oRowStartDate.getTime() + (iStartIndex *  iMinutesStep));
			oAppEndDate = new Date(oRowStartDate.getTime() + ((iEndIndex + 1) *  iMinutesStep));
		} else {
			oAppStartDate = new Date(oRowStartDate.getTime() + (iEndIndex *  iMinutesStep));
			oAppEndDate = new Date(oRowStartDate.getTime() + (iStartIndex *  iMinutesStep));
		}

		return {
			startDate: oAppStartDate,
			endDate: oAppEndDate
		};
	};

	PlanningCalendar.prototype._calcCreateNewAppDays = function(oRowStartDate, iStartIndex, iEndIndex) {
		var oAppStartDate = new Date(oRowStartDate),
			oAppEndDate = new Date(oRowStartDate);

		if (iStartIndex <= iEndIndex) {
			oAppStartDate = new Date(oRowStartDate.getFullYear(), oRowStartDate.getMonth(), oRowStartDate.getDate() + iStartIndex);
			oAppEndDate = new Date(oRowStartDate.getFullYear(), oRowStartDate.getMonth(), oRowStartDate.getDate() + iEndIndex + 1);
		} else {
			oAppStartDate = new Date(oRowStartDate.getFullYear(), oRowStartDate.getMonth(), oRowStartDate.getDate() + iEndIndex);
			oAppEndDate = new Date(oRowStartDate.getFullYear(), oRowStartDate.getMonth(), oRowStartDate.getDate() + iStartIndex);
		}

		return {
			startDate: oAppStartDate,
			endDate: oAppEndDate
		};
	};

	PlanningCalendar.prototype._calcCreateNewAppMonths = function(oRowStartDate, iStartIndex, iEndIndex) {
		var oAppStartDate = new Date(oRowStartDate),
			oAppEndDate = new Date(oRowStartDate);

		if (iStartIndex <= iEndIndex) {
			oAppStartDate = new Date(oRowStartDate.getFullYear(), oRowStartDate.getMonth() + iStartIndex, 1);
			oAppEndDate = new Date(oRowStartDate.getFullYear(), oRowStartDate.getMonth() + iEndIndex + 1, 1);
		} else {
			oAppStartDate = new Date(oRowStartDate.getFullYear(), oRowStartDate.getMonth() + iEndIndex, 1);
			oAppEndDate = new Date(oRowStartDate.getFullYear(), oRowStartDate.getMonth() + iStartIndex, 1);
		}

		return {
			startDate: oAppStartDate,
			endDate: oAppEndDate
		};
	};

	PlanningCalendar.prototype._getConfigFromDragDropConfigAggregation = function (aAggregation, sConfigName) {
		var aDragDropConfigs = aAggregation,
			iDragDropConfigsLength = aDragDropConfigs && aDragDropConfigs.length;

		for (var i = 0; i < iDragDropConfigsLength; i++) {
			if (aDragDropConfigs[i].getGroupName() === sConfigName) {
				return aDragDropConfigs[i];
			}
		}

		return null;
	};

	PlanningCalendar.prototype._getAppointmentsCreateConfig = function (oRow) {
		var oTimeline = getRowTimeline(oRow),
			oCreateConfig = new DragDropInfo({
				targetAggregation: "_intervalPlaceholders",

				dragStart: function (oEvent) {
					if (!oRow.getEnableAppointmentsCreate() || oTimeline._isOneMonthsRowOnSmallSizes() || !oTimeline._isCreatingPerformed()) {
						oEvent.preventDefault();
						return;
					}

					var oDragSession = oEvent.getParameter("dragSession"),
						$CalendarRowAppsOverlay = oTimeline.$().find(".sapUiCalendarRowAppsOverlay"),
						$Indicator = jQuery(oDragSession.getIndicator());

					setTimeout(function () {
						$CalendarRowAppsOverlay.addClass("sapUiCalendarRowAppsOverlayDragging");
					}, 0);

					jQuery(document).one("dragend", function () {
						$CalendarRowAppsOverlay.removeClass("sapUiCalendarRowAppsOverlayDragging");
						$Indicator.html("");
						$Indicator.removeClass("sapUiCalendarApp sapUiCalendarAppType01 sapUiAppCreate");
					});

					if (!Device.browser.msie && !Device.browser.edge) {
						oEvent.getParameter("browserEvent").dataTransfer.setDragImage(getResizeGhost(), 0, 0);
					}
				},

				dragEnter: function (oEvent) {
					var oDragSession = oEvent.getParameter("dragSession"),
						oDropRects = oDragSession.getDropControl().getDomRef().getBoundingClientRect(),
						fnAlignIndicator = function () {
							var $Indicator = jQuery(oDragSession.getIndicator());
							$Indicator.addClass("sapUiCalendarApp sapUiCalendarAppType01 sapUiAppCreate");
						};

					var iStartXPosition = oDragSession.getData("text") ? parseFloat(oDragSession.getData("text").split("|")[0]) : 0;
					if (iStartXPosition) {
						if (iStartXPosition <= oDropRects.left) {
							oDragSession.setIndicatorConfig({ left: iStartXPosition, width: Math.max((oDropRects.left + oDropRects.width - iStartXPosition), oDropRects.width) });
						} else {
							oDragSession.setIndicatorConfig({ left: oDropRects.left, width: iStartXPosition - oDropRects.left });
						}
					} else {
						oDragSession.setData("text", oDropRects.left + "|" + oTimeline.indexOfAggregation("_intervalPlaceholders", oDragSession.getDropControl()));
					}

					if (!oDragSession.getIndicator()) {
						setTimeout(fnAlignIndicator, 0);
					} else {
						fnAlignIndicator();
					}
				},

				drop: function (oEvent) {
					var oDragSession = oEvent.getParameter("dragSession"),
						$Indicator = jQuery(oDragSession.getIndicator()),
						sIntervalType = oTimeline.getIntervalType(),
						oRowStartDate = getRowTimeline(oRow).getStartDate(),
						iStartIndex = parseInt(oDragSession.getData("text").split("|")[1]),
						iEndIndex = oTimeline.indexOfAggregation("_intervalPlaceholders", oDragSession.getDropControl()),
						oNewPos;

					if (sIntervalType === CalendarIntervalType.Hour) {
						oNewPos = this._calcCreateNewAppHours(oRowStartDate, iStartIndex, iEndIndex);
					} else if (sIntervalType === CalendarIntervalType.Day
						|| sIntervalType === CalendarIntervalType.Week
						|| (sIntervalType === CalendarIntervalType.OneMonth && !oTimeline._isOneMonthsRowOnSmallSizes())) {
						oNewPos = this._calcCreateNewAppDays(oRowStartDate, iStartIndex, iEndIndex);
					} else if (sIntervalType === CalendarIntervalType.Month) {
						oNewPos = this._calcCreateNewAppMonths(oRowStartDate, iStartIndex, iEndIndex);
					}

					oRow.fireAppointmentCreate({
						startDate: oNewPos.startDate,
						endDate: oNewPos.endDate,
						calendarRow: oRow
					});

					$Indicator.html("");
					$Indicator.removeClass("sapUiCalendarApp sapUiCalendarAppType01 sapUiAppCreate");
				}.bind(this)
			});

		oCreateConfig.setProperty("groupName", CREATE_CONFIG_NAME);

		return oCreateConfig;
	};

	function getResizeGhost() {
		var $ghost = jQuery("<span></span>").addClass("sapUiCalAppResizeGhost");
		$ghost.appendTo(document.body);

		setTimeout(function() { $ghost.remove(); }, 0);

		return $ghost.get(0);
	}

	function getRow(oListItem) {
		var sId = oListItem.getId();

		return Core.byId(sId.substring(0, sId.indexOf(LISTITEM_SUFFIX)));
	}

	function getListItem(oRow) {
		return Core.byId(oRow.getId() + LISTITEM_SUFFIX);
	}

	function getRowHeader(oRow) {
		var oListItem = getListItem(oRow);

		return oListItem ? oListItem.getHeader() : null;
	}

	function getRowTimeline(oRow) {
		var oListItem = getListItem(oRow);

		return oListItem ? oListItem.getTimeline() : null;
	}

	function handleTableSelectionChange(oEvent) {

		var aChangedRows = [];
		var aRows = this.getRows();

		for (var i = 0; i < aRows.length; i++) {
			var oRow = aRows[i];
			var oRowItem = getListItem(oRow);
			var bSelected = oRowItem.getSelected();
			if (oRow.getSelected() != bSelected) {
				oRow.setProperty("selected", bSelected, true);
				aChangedRows.push(oRow);
			}

		}

		if (!this.getSingleSelection()) {
			updateSelectAllCheckBox.call(this);
		}

		if (aChangedRows.length > 0) {
			this.fireRowSelectionChange({rows: aChangedRows});
		}

	}

	function determineSize(iWidth) {

		if (iWidth < this._iBreakPointTablet) {
			this._iSize = 0; // phone
		} else if (iWidth < this._iBreakPointDesktop){
			this._iSize = 1; // tablet
		} else {
			this._iSize = 2; // desktop
		}

		if (iWidth < SCREEEN_BREAKPOINTS.PHONE) {
			this._iSizeScreen = 0;
		} else if (iWidth < SCREEEN_BREAKPOINTS.TABLET) {
			this._iSizeScreen = 1;
		} else {
			this._iSizeScreen = 2;
		}
	}

	// as all our css should depend on the main container size, not screen size like sapUiMedia-Std-Tablet...
	function toggleSizeClasses(iSize) {
		var sCurrentSizeClass = 'sapMSize' + iSize,
			i,
			sClass;

			for (i = 0; i < 3; i++) {
				sClass = 'sapMSize' + i;
				if (sClass === sCurrentSizeClass) {
					this.addStyleClass(sClass);
				} else {
					this.removeStyleClass(sClass);
				}
			}
	}

	function updateSelectItems() {

		var aViews = this._getViews();
		this._oIntervalTypeSelect.destroyItems();
		var i;
		var oItem;

		for (i = 0; i < aViews.length; i++) {
			var oView = aViews[i];
			oItem = new SegmentedButtonItem(this.getId() + "-" + i, {
				key: oView.getKey(),
				text: oView.getDescription(),
				tooltip: oView.getTooltip()
			});
			this._oIntervalTypeSelect.addItem(oItem);
		}

		if (this._oIntervalTypeSelect.getItems().length > 4) {
			this._getHeader()._convertViewSwitchToSelect();
		} else {
			this._getHeader()._convertViewSwitchToSegmentedButton();
		}

		// Toggle interval select visibility if only one items is available there should be no select visible
		this._oIntervalTypeSelect.setVisible(!(aViews.length === 1));

	}

	function handleSelectAll(oEvent) {

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

	function handleLeaveRow(oEvent){

		var oTimeline = oEvent.oSource;
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
			if (getRowTimeline(oRow) == oTimeline) {
				iIndex = i;
				break;
			}
		}

		switch (sType) {
			case "sapup":
				oAppointment = oTimeline.getFocusedAppointment();
				oDate = oAppointment.getStartDate();

				// get nearest appointment in row above
				if (iIndex > 0) {
					iIndex--;
				}

				oNewRow = aRows[iIndex];
				getRowTimeline(oNewRow).focusNearestAppointment(oDate);

				break;

			case "sapdown":
				oAppointment = oTimeline.getFocusedAppointment();
				oDate = oAppointment.getStartDate();

				// get nearest appointment in row above
				if (iIndex < aRows.length - 1) {
					iIndex++;
				}

				oNewRow = aRows[iIndex];
				getRowTimeline(oNewRow).focusNearestAppointment(oDate);

				break;

			case "saphome":
				if (iIndex > 0) {
					oNewRow = aRows[0];

					oNewEvent = new jQuery.Event(sType);
					oNewEvent._bPlanningCalendar = true;

					getRowTimeline(oNewRow).onsaphome(oNewEvent);
				}

				break;

			case "sapend":
				if (iIndex < aRows.length - 1) {
					oNewRow = aRows[aRows.length - 1];

					oNewEvent = new jQuery.Event(sType);
					oNewEvent._bPlanningCalendar = true;

					getRowTimeline(oNewRow).onsapend(oNewEvent);
				}

				break;

			default:
				break;
		}

	}

	function updateSelectAllCheckBox() {

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

	function positionSelectAllCheckBox() {

		if (this.getSingleSelection()) {
			if (this._oCalendarHeader.getAllCheckBox()) {
				this._oCalendarHeader.setAllCheckBox();
			}else if (this._oInfoToolbar.getContent().length > 2) {
				this._oInfoToolbar.removeContent(this._oSelectAllCheckBox);
			}
		} else {
			if (!this._oSelectAllCheckBox) {
				this._oSelectAllCheckBox = new CheckBox(this.getId() + "-All", {
					text: this._oRB.getText("COLUMNSPANEL_SELECT_ALL")
				});
				this._oSelectAllCheckBox.attachEvent("select", handleSelectAll, this);
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

	function setSelectionMode() {

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

	function isThereAnIntervalInstance() {
		return this._oTimesRow || this._oDatesRow || this._oMonthsRow || this._oWeeksRow || this._oOneMonthsRow;
	}

	return PlanningCalendar;
});
