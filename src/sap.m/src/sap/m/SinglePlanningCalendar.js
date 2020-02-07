/*!
 * ${copyright}
 */

// Provides control sap.m.SinglePlanningCalendar.
sap.ui.define([
	'./library',
	'./PlanningCalendarHeader',
	'./SegmentedButtonItem',
	"./SinglePlanningCalendarWeekView",
	'./SinglePlanningCalendarGrid',
	'./SinglePlanningCalendarMonthGrid',
	'./SinglePlanningCalendarRenderer',
	'sap/base/Log',
	'sap/ui/core/Control',
	'sap/ui/core/InvisibleText',
	'sap/ui/core/ResizeHandler',
	'sap/ui/core/format/DateFormat',
	'sap/ui/unified/calendar/CalendarDate',
	'sap/ui/unified/DateRange',
	'sap/ui/base/ManagedObjectObserver',
	"sap/ui/thirdparty/jquery"
],
function(
	library,
	PlanningCalendarHeader,
	SegmentedButtonItem,
	SinglePlanningCalendarWeekView,
	SinglePlanningCalendarGrid,
	SinglePlanningCalendarMonthGrid,
	SinglePlanningCalendarRenderer,
	Log,
	Control,
	InvisibleText,
	ResizeHandler,
	DateFormat,
	CalendarDate,
	DateRange,
	ManagedObjectObserver,
	jQuery
) {
	"use strict";

	var PlanningCalendarStickyMode = library.PlanningCalendarStickyMode;
	var HEADER_RESIZE_HANDLER_ID = "_sHeaderResizeHandlerId";
	var MAX_NUMBER_OF_VIEWS_IN_SEGMENTED_BUTTON = 4;
	var SEGMENTEDBUTTONITEM__SUFFIX = "--item";

	/**
	 * Constructor for a new <code>SinglePlanningCalendar</code>.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 *
	 * Displays a calendar of a single entity (such as person, resource) for the selected time interval.
	 *
	 * <h3>Overview</h3>
	 *
	 * <b>Note:</b> The <code>SinglePlanningCalendar</code> uses parts of the <code>sap.ui.unified</code> library.
	 * This library will be loaded after the <code>SinglePlanningCalendar</code>, if it wasn't previously loaded.
	 * This could lead to a waiting time when a <code>SinglePlanningCalendar</code> is used for the first time.
	 * To prevent this, apps using the <code>SinglePlanningCalendar</code> must also load the
	 * <code>sap.ui.unified</code> library.
	 *
	 * The <code>SinglePlanningCalendar</code> has the following structure:
	 *
	 * <ul>
	 *     <li>A <code>PlanningCalendarHeader</code> at the top. It contains the <code>title</code> set from the
	 *     corresponding property, the <code>SegmentedButton</code>, which facilitates navigation through the views,
	 *     controls, passed to the <code>actions</code> aggregation and the navigation, assisting the user in
	 *     choosing the desired time period. The views, either custom or not, can be configured and passed through the
	 *     <code>views</code> aggregation.
	 *
	 *     To create custom views, extend the <code>SinglePlanningCalendarView</code> basic view class. It defines three
	 *     methods that should be overwritten: <code>getEntityCount</code>, <code>getScrollEntityCount</code> and
	 *     <code>calculateStartDate</code>
	 *     <ul>
	 *         <li><code>getEntityCount</code> - returns number of columns to be displayed</li>
	 *         <li><code>getScrollEntityCount</code> - used when next and previous arrows in the calendar are used.
	 *         For example, in work week view, the <code>getEntityCount</code> returns 5 (5 columns from Monday to
	 *         Friday), but when next arrow is selected, the control navigates 7 days ahead and
	 *         <code>getScrollEntityCount</code> returns 7.</li>
	 *         <li><code>calculateStartDate</code> - calculates the first day displayed in the calendar based on the
	 *         <code>startDate</code> property of the <code>SinglePlanningCalendar</code>. For example, it returns the
	 *         first date of a month or a week to display the first 10 days of the month.</li>
	 *     </ul>
	 *
	 *     <li>A <code>SinglePlanningCalendarGrid</code> or <code>SinglePlanningCalendarMonthGrid</code>, which displays the appointments, set to the visual time range.
	 *     An all-day appointment is an appointment which starts at 00:00 and ends in 00:00 on any day in the future.
	 * </ul>
	 *
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
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
			startDate: { type : "object", group : "Data" },

			/**
			 * Determines the start hour of the grid to be shown if the <code>fullDay</code> property is set to
			 * <code>false</code>. Otherwise the previous hours are displayed as non-working. The passed hour is
			 * considered as 24-hour based.
			 */
			startHour: {type: "int", group: "Data", defaultValue: 0},

			/**
			 * Determines the end hour of the grid to be shown if the <code>fullDay</code> property is set to
			 * <code>false</code>. Otherwise the next hours are displayed as non-working. The passed hour is
			 * considered as 24-hour based.
			 */
			endHour: {type: "int", group: "Data", defaultValue: 24},

			/**
			 * Determines if all of the hours in a day are displayed. If set to <code>false</code>, the hours shown are
			 * between the <code>startHour</code> and <code>endHour</code>.
			 */
			fullDay: {type: "boolean", group: "Data", defaultValue: true},

			/**
			 * Determines which part of the control will remain fixed at the top of the page during vertical scrolling
			 * as long as the control is in the viewport.
			 *
			 * <b>Note:</b> Limited browser support. Browsers which do not support this feature:
			 * <ul>
			 * 	<li>Microsoft Internet Explorer</li>
			 * 	<li>Microsoft Edge lower than version 41 (EdgeHTML 16)</li>
			 * 	<li>Mozilla Firefox lower than version 59</li>
			 * </ul>
			 *
			 * @since 1.62
			 */
			stickyMode: {type: "sap.m.PlanningCalendarStickyMode", group: "Behavior", defaultValue: PlanningCalendarStickyMode.None},

			/**
			 * Determines whether the appointments in the grid are draggable.
			 *
			 * The drag and drop interaction is visualized by a placeholder highlighting the area where the
			 * appointment can be dropped by the user.
			 *
			 * @since 1.64
			 */
			enableAppointmentsDragAndDrop: { type: "boolean", group: "Misc", defaultValue: false },

			/**
			 * Determines whether the appointments are resizable.
			 *
			 * The resize interaction is visualized by making the appointment transparent.
			 *
			 * The appointment snaps on every interval
			 * of 30 minutes. After the resize is finished, the {@link #event:appointmentResize appointmentResize} event is fired, containing
			 * the new start and end JavaScript date objects.
			 *
			 * @since 1.65
			 */
			enableAppointmentsResize: { type: "boolean", group: "Misc", defaultValue: false },

			/**
			 * Determines whether the appointments can be created by dragging on empty cells.
			 *
			 * See {@link #property:enableAppointmentsResize enableAppointmentsResize} for the specific points for events snapping
			 *
			 * @since 1.65
			 */
			enableAppointmentsCreate: { type: "boolean", group: "Misc", defaultValue: false }
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
			 * To display an all-day appointment, the appointment must start at 00:00 and end on any day in the future in 00:00h.
			 */
			appointments : {
				type: "sap.ui.unified.CalendarAppointment",
				multiple: true,
				singularName: "appointment",
				forwarding: {
					getter: "_getCurrentGrid",
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
			 * Special days in the header visualized as a date range with type.
			 *
			 * <b>Note:</b> If one day is assigned to more than one type, only the first type is used.
			 * @since 1.66
			 */
			specialDates : {type : "sap.ui.unified.DateTypeRange",
							multiple : true,
							singularName : "specialDate",
							forwarding: {
								getter: "_getCurrentGrid",
								aggregation: "specialDates"
							}
			},

			/**
			 * The header part of the <code>SinglePlanningCalendar</code>.
			 *
			 * @private
			 */
			_header : { type : "sap.m.PlanningCalendarHeader", multiple : false, visibility : "hidden" },

			/**
			 * The grid part of the <code>SinglePlanningCalendar</code>.
			 *
			 * @private
			 */
			_grid: { type: "sap.ui.core.Control", multiple: false, visibility: "hidden" },

			/**
			 * The grid part of the <code>SinglePlanningCalendar</code>.
			 *
			 * @private
			 */
			_mvgrid: { type: "sap.ui.core.Control", multiple: false, visibility: "hidden" }

		},

		associations: {

			/**
			 * Corresponds to the currently selected view.
			 */
			selectedView: { type: "sap.m.SinglePlanningCalendarView", multiple: false },

			/**
			 * Association to the <code>PlanningCalendarLegend</code> explaining the colors of the <code>Appointments</code>.
			 *
			 * <b>Note:</b> The legend does not have to be rendered but must exist and all required types must be assigned.
			 * @since 1.65.0
			 */
			legend: { type: "sap.m.PlanningCalendarLegend", multiple: false}

		},

		events: {

			/**
			 * Fired when the selected state of an appointment is changed.
			 */
			appointmentSelect: {
				parameters: {

					/**
					 * The appointment on which the event was triggered.
					 */
					appointment: {type: "sap.ui.unified.CalendarAppointment"},
					/**
					 * All appointments with changed selected state.
					 * @since 1.67.0
					 */
					appointments : {type : "sap.ui.unified.CalendarAppointment[]"}

				}
			},

			/**
			 * Fired if an appointment is dropped.
			 * @since 1.64
			 */
			appointmentDrop : {
				parameters : {
					/**
					 * The dropped appointment.
					 */
					appointment : {type : "sap.ui.unified.CalendarAppointment"},

					/**
					 * Start date of the dropped appointment, as a JavaScript date object.
					 */
					startDate : {type : "object"},

					/**
					 * Dropped appointment end date as a JavaScript date object.
					 */
					endDate : {type : "object"},

					/**
					 * The drop type. If true - it's "Copy", if false - it's "Move".
					 */
					copy : {type : "boolean"}
				}
			},

			/**
			 * Fired when an appointment is resized.
			 * @since 1.65
			 */
			appointmentResize: {
				parameters: {
					/**
					 * The resized appointment.
					 */
					appointment: { type: "sap.ui.unified.CalendarAppointment" },

					/**
					 * Start date of the resized appointment, as a JavaScript date object.
					 */
					startDate: { type: "object" },

					/**
					 * End date of the resized appointment, as a JavaScript date object.
					 */
					endDate: { type: "object" }
				}
			},

			/**
			 * Fired if an appointment is created.
			 * @since 1.65
			 */
			appointmentCreate: {
				parameters: {
					/**
					 * Start date of the created appointment, as a JavaScript date object.
					 */
					startDate: {type: "object"},

					/**
					 * End date of the created appointment, as a JavaScript date object.
					 */
					endDate: {type: "object"}
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
			},

			/**
			 * Fired when a grid cell is focused.
			 * @since 1.65
			 */
			cellPress: {
				parameters: {
					/**
					 * The start date as a JavaScript date object of the focused grid cell.
					 */
					startDate: {type: "object"},
					/**
					 * The end date as a JavaScript date object of the focused grid cell.
					 */
					endDate: {type: "object"}
				}
			},

			/**
			 * Fired when a 'more' button is pressed.
			 * <b>Note:</b> The 'more' button appears in a month view cell
			 * when multiple appointments exist and the available space
			 * is not sufficient to display all of them.
			 */
			moreLinkPress: {
				parameters: {
					/**
					 * The date as a JavaScript date object of the cell with the
					 * pressed more link.
					 */
					date: { type: "object" }
				}
			},

			/**
			 * The view was changed by user interaction.
			 * @since 1.71.0
			 */
			viewChange : {}
		}

	}});

	SinglePlanningCalendar.prototype.init = function() {
		var sOPCId = this.getId();

		this._oRB = sap.ui.getCore().getLibraryResourceBundle("sap.m");
		this._oDefaultView = new SinglePlanningCalendarWeekView({
			key: "DEFAULT_INNER_WEEK_VIEW_CREATED_FROM_CONTROL",
			title: ""
		});
		this.setAssociation("selectedView", this._oDefaultView);

		this.setAggregation("_header", this._createHeader());

		this.setAggregation("_grid", new SinglePlanningCalendarGrid(sOPCId + "-Grid"));
		this.setAggregation("_mvgrid", new SinglePlanningCalendarMonthGrid(sOPCId + "-GridMV"));

		this._attachHeaderEvents();
		this._attachGridEvents();
		this._attachDelegates();
		this.setStartDate(new Date());
	};

	/**
	 * Called before rendering starts.
	 *
	 * @private
	 */
	SinglePlanningCalendar.prototype.onBeforeRendering = function () {
		// We can apply/remove sticky classes even before the control is rendered.
		this._toggleStickyClasses();
	};

	/**
	 * Called when rendering is completed.
	 *
	 * @private
	 */
	SinglePlanningCalendar.prototype.onAfterRendering = function () {
		var oHeader = this._getHeader();

		// Adjusting is done after rendering, because otherwise we won't have
		// info about how much offset is actually needed.
		this._adjustColumnHeadersTopOffset();

		// Indicate if the actions toolbar is hidden
		this.toggleStyleClass("sapMSinglePCActionsHidden", !oHeader._getActionsToolbar().getVisible());

		this._registerResizeHandler(HEADER_RESIZE_HANDLER_ID, oHeader, this._onHeaderResize.bind(this));
	};

	SinglePlanningCalendar.prototype.exit = function () {
		if (this._oDefaultView) {
			this._oDefaultView.destroy();
			this._oDefaultView = null;
		}

		if (this._afterRenderFocusCell) {
			this.removeDelegate(this._afterRenderFocusCell);
			this._afterRenderFocusCell = null;
		}

		this._deRegisterResizeHandler(HEADER_RESIZE_HANDLER_ID);
	};

	/**
	 * Called when the navigation toolbar changes its width or height.
	 *
	 * @param oEvent The resize event
	 * @returns {sap.m.SinglePlanningCalendar} <code>this</code> for chaining
	 * @private
	 */
	SinglePlanningCalendar.prototype._onHeaderResize = function (oEvent) {
		if (oEvent.oldSize.height === oEvent.size.height) {
			// We need only height changes
			return this;
		}

		// If resizing happened due to the actions toolbar changing its visibility,
		// then update the corresponding class
		this.toggleStyleClass("sapMSinglePCActionsHidden", !this._getHeader()._getActionsToolbar().getVisible());

		// There are 3 reasons why the header's height might have changed and we need to adjust
		// columnHeaders' offset for each of them.
		// - Actions toolbar showed up: columnHeaders need to go lower
		// - Actions toolbar got hidden: columnHeaders need to go higher
		// - Screen width became too small and some of the navigation toolbar's content went
		//   on a second line: second line: columnHeaders need to go lower
		this._adjustColumnHeadersTopOffset();

		return this;
	};

	SinglePlanningCalendar.prototype.setTitle = function (sTitle) {
		this._getHeader().setTitle(sTitle);

		return this.setProperty("title", sTitle);
	};

	SinglePlanningCalendar.prototype.setStartDate = function (oDate) {
		this.setProperty("startDate", oDate);
		this._alignColumns();

		return this;
	};

	SinglePlanningCalendar.prototype.setStartHour = function (iHour) {
		this.getAggregation("_grid").setStartHour(iHour);
		this.setProperty("startHour", iHour);

		return this;
	};

	SinglePlanningCalendar.prototype.setEndHour = function (iHour) {
		this.getAggregation("_grid").setEndHour(iHour);
		this.setProperty("endHour", iHour);

		return this;
	};

	SinglePlanningCalendar.prototype.setFullDay = function (bFullDay) {
		this.getAggregation("_grid").setFullDay(bFullDay);
		this.setProperty("fullDay", bFullDay);

		return this;
	};

	SinglePlanningCalendar.prototype.setEnableAppointmentsDragAndDrop = function (bEnabled) {
		this.getAggregation("_grid").setEnableAppointmentsDragAndDrop(bEnabled);
		this.getAggregation("_mvgrid").setEnableAppointmentsDragAndDrop(bEnabled);

		return this.setProperty("enableAppointmentsDragAndDrop", bEnabled, true);
	};

	SinglePlanningCalendar.prototype.setEnableAppointmentsResize = function(bEnabled) {
		this.getAggregation("_grid").setEnableAppointmentsResize(bEnabled);

		return this.setProperty("enableAppointmentsResize", bEnabled, true);
	};

	SinglePlanningCalendar.prototype.setEnableAppointmentsCreate = function(bEnabled) {
		this.getAggregation("_grid").setEnableAppointmentsCreate(bEnabled);

		return this.setProperty("enableAppointmentsCreate", bEnabled, true);
	};

	/**
	 * Applies or removes sticky classes based on <code>stickyMode</code>'s value.
	 *
	 * @returns {sap.m.SinglePlanningCalendar} <code>this</code> for chaining
	 * @private
	 */
	SinglePlanningCalendar.prototype._toggleStickyClasses = function () {
		var sStickyMode = this.getStickyMode();

		this.toggleStyleClass("sapMSinglePCStickyAll", sStickyMode === PlanningCalendarStickyMode.All);
		this.toggleStyleClass("sapMSinglePCStickyNavBarAndColHeaders", sStickyMode === PlanningCalendarStickyMode.NavBarAndColHeaders);

		return this;
	};

	/**
	 * Makes sure that the column headers are offset in such a way, that they are positioned right
	 * after the navigation toolbar.
	 *
	 * @returns {sap.m.SinglePlanningCalendar} <code>this</code> for chaining
	 * @private
	 */
	SinglePlanningCalendar.prototype._adjustColumnHeadersTopOffset = function () {
		var sStickyMode = this.getStickyMode(),
			oGrid = this.getAggregation("_grid"),
			oColumnHeaders = oGrid && oGrid._getColumnHeaders(),
			iTop;

		// Make sure that the columnHeaders are rendered
		if (!oColumnHeaders || !oColumnHeaders.getDomRef()) {
			return this;
		}

		switch (sStickyMode) {
			case PlanningCalendarStickyMode.All:
				// Since the whole header will be visible, columnHeaders should be offset by its whole height.
				iTop = this._getHeader().$().outerHeight();
				break;
			case PlanningCalendarStickyMode.NavBarAndColHeaders:
				// Since the action toolbar will be hidden, columnHeaders should be
				iTop = this._getHeader()._getActionsToolbar().$().outerHeight();
				break;
			default:
				// Reset to default, if not in sticky mode
				iTop = "auto";
				break;
		}

		oColumnHeaders.$().css("top", iTop);
		oColumnHeaders._setTopPosition(iTop);

		return this;
	};

	SinglePlanningCalendar.prototype.addView = function (oView) {
		var oViewsButton,
			oHeader = this._getHeader(),
			sSegmentedButtonItemId = oView.getId() + SEGMENTEDBUTTONITEM__SUFFIX,
			oSegmentedButtonItem;

		if (!oView) {
			return this;
		}

		if (this._isViewKeyExisting(oView.getKey())) {
			Log.error("There is an existing view with the same key.", this);
			return this;
		}

		this.addAggregation("views", oView);

		oViewsButton = oHeader._getOrCreateViewSwitch();

		oSegmentedButtonItem = new SegmentedButtonItem(sSegmentedButtonItemId, {
			key: oView.getKey(),
			text: oView.getTitle()
		});
		oViewsButton.addItem(oSegmentedButtonItem);

		this._observeViewTitle(oView);

		if (this._getSelectedView().getKey() === this._oDefaultView.getKey()) {
			this.setAssociation("selectedView", oView);
		}
		this._alignView();
		if (this.getViews().length > MAX_NUMBER_OF_VIEWS_IN_SEGMENTED_BUTTON) {
			oHeader._convertViewSwitchToSelect();
		}

		return this;
	};

	SinglePlanningCalendar.prototype.insertView = function (oView, iPos) {
		var oViewsButton,
			oHeader = this._getHeader(),
			sSegmentedButtonItemId = oView.getId() + SEGMENTEDBUTTONITEM__SUFFIX,
			oSegmentedButtonItem;

		if (!oView) {
			return this;
		}

		if (this._isViewKeyExisting(oView.getKey())) {
			Log.error("There is an existing view with the same key.", this);
			return this;
		}

		this.insertAggregation("views", oView, iPos);

		oViewsButton = oHeader._getOrCreateViewSwitch();

		oSegmentedButtonItem = new SegmentedButtonItem(sSegmentedButtonItemId, {
			key: oView.getKey(),
			text: oView.getTitle()
		});
		oViewsButton.insertItem(oSegmentedButtonItem, iPos);

		this._observeViewTitle(oView);

		if (this._getSelectedView().getKey() === this._oDefaultView.getKey()) {
			this.setAssociation("selectedView", oView);
		}
		this._alignView();
		if (this.getViews().length > MAX_NUMBER_OF_VIEWS_IN_SEGMENTED_BUTTON) {
			oHeader._convertViewSwitchToSelect();
		}

		return this;
	};

	SinglePlanningCalendar.prototype.removeView = function (oView) {

		if (!oView) {
			return this;
		}

		var oHeader = this._getHeader(),
			oViewsButton = oHeader._getOrCreateViewSwitch(),
			oViewsButtonItems = oViewsButton.getItems(),
			oCurrentlySelectedView = this._getSelectedView(),
			oViewToRemoveKey = oView.getKey(),
			oCurrentItem,
			i;

		if (this.getViews().length === 1) {
			this._disconnectAndDestroyViewsObserver();
		} else {
			this._oViewsObserver.unobserve(oView, {
				properties: ["title"]
			});
		}

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
		if (this.getViews().length <= MAX_NUMBER_OF_VIEWS_IN_SEGMENTED_BUTTON) {
			oHeader._convertViewSwitchToSegmentedButton();
		}

		return this;
	};

	SinglePlanningCalendar.prototype.removeAllViews = function () {
		var oViewsButton = this._getHeader()._getOrCreateViewSwitch();

		this._disconnectAndDestroyViewsObserver();

		oViewsButton.removeAllItems();
		this.setAssociation("selectedView", this._oDefaultView);
		this._alignView();

		return this.removeAllAggregation("views");
	};

	SinglePlanningCalendar.prototype.destroyViews = function () {
		var oViewsButton = this._getHeader()._getOrCreateViewSwitch();

		this._disconnectAndDestroyViewsObserver();

		oViewsButton.destroyItems();
		this.setAssociation("selectedView", this._oDefaultView);
		this._alignView();

		return this.destroyAggregation("views");
	};

	/**
	 * Sets the text property of the SegmentedButton view item
	 *
	 * @param {object} oChanges the detected from the ManagedObjectObserver changes
	 * @private
	 */
	SinglePlanningCalendar.prototype._viewsObserverCallbackFunction = function (oChanges) {
		sap.ui.getCore().byId(oChanges.object.getId() + SEGMENTEDBUTTONITEM__SUFFIX).setText(oChanges.current);
	};

	/**
	 * Returns the ManagedObjectObserver for the views
	 *
	 * @return {sap.ui.base.ManagedObjectObserver} the views observer object
	 * @private
	 */
	SinglePlanningCalendar.prototype._getViewsObserver = function () {
		if (!this._oViewsObserver) {
			this._oViewsObserver = new ManagedObjectObserver(this._viewsObserverCallbackFunction);
		}
		return this._oViewsObserver;
	};

	/**
	 * Observes the title property of the passed view
	 *
	 * @param {sap.m.SinglePlanningCalendarView} oView the view, which property will be observed
	 * @private
	 */
	SinglePlanningCalendar.prototype._observeViewTitle = function (oView) {
		this._getViewsObserver().observe(oView, {
			properties: ["title"]
		});
	};

	/**
	 * Disconnects and destroys the ManagedObjectObserver observing the used views
	 *
	 * @private
	 */
	SinglePlanningCalendar.prototype._disconnectAndDestroyViewsObserver = function () {
		if (this._oViewsObserver) {
			this._oViewsObserver.disconnect();
			this._oViewsObserver.destroy();
			this._oViewsObserver = null;
		}
	};

	SinglePlanningCalendar.prototype.setSelectedView = function(vView) {
		// first check if vView is string (ID), or object with getKey method
		if (typeof vView === "string") {
			// it is string, try to find corresponding view
			vView = this._getViewById(vView);
		} else if (vView.isA("sap.m.SinglePlanningCalendarView") && !this._isViewKeyExisting(vView.getKey())) {
			// non-existing view
			vView = null;
		}

		if (!vView) {
			// view is missing
			Log.error("There is no such view.", this);
			return this;
		}

		// view is found
		this._setupNewView(vView);
		this._getHeader()._getOrCreateViewSwitch().setSelectedKey(vView.getKey());
		return this;
	};

	/**
	 * Holds the selected appointments. If no appointments are selected, an empty array is returned.
	 *
	 * @returns {sap.ui.unified.CalendarAppointment[]} All selected appointments
	 * @since 1.62
	 * @public
	 */
	SinglePlanningCalendar.prototype.getSelectedAppointments = function() {
		return this.getAggregation("_grid").getSelectedAppointments();
	};

	SinglePlanningCalendar.prototype.setLegend = function (vLegend) {
		var oLegendDestroyObserver,
			sLegend,
			oLegend;

		this.setAssociation("legend", vLegend);
		this.getAggregation("_grid").setAssociation("legend", vLegend);
		this.getAggregation("_mvgrid").setAssociation("legend", vLegend);

		sLegend = this.getLegend();

		if (sLegend) {
			this.getAggregation("_grid")._sLegendId = sLegend;
			this.getAggregation("_mvgrid")._sLegendId = sLegend;
			oLegend = sap.ui.getCore().byId(sLegend);
		}

		if (oLegend) { //destroy of the associated legend should rerender the SPC
			oLegendDestroyObserver = new ManagedObjectObserver(function(oChanges) {
				this.invalidate();
			}.bind(this));
			oLegendDestroyObserver.observe(oLegend, {
				destroy: true
			});
		}

		return this;
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
	 * Creates the header and adds proper <code>ariaLabelledBy</code> references on it's toolbars.
	 * @returns {object} The created header
	 * @private
	 */
	SinglePlanningCalendar.prototype._createHeader = function () {
		var oHeader = new PlanningCalendarHeader(this.getId() + "-Header");

		oHeader.getAggregation("_actionsToolbar")
			.addAriaLabelledBy(InvisibleText.getStaticId("sap.m", "SPC_ACTIONS_TOOLBAR"));

		oHeader.getAggregation("_navigationToolbar")
			.addAriaLabelledBy(InvisibleText.getStaticId("sap.m", "SPC_NAVIGATION_TOOLBAR"));

		return oHeader;
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
	 * Finds the view object by given key
	 * @param {String} sKey The key of the view
	 * @public
	 * @since 1.75
	 * @returns {sap.m.SinglePlanningCalendarView} the view object matched the given sKey, of null if there is no such view
	 */
	SinglePlanningCalendar.prototype.getViewByKey = function (sKey) {
		var aViews = this.getViews(),
			i;
		for (i = 0; i < aViews.length; i++) {
			if (aViews[i].getKey() === sKey) {
				return aViews[i];
			}
		}
		return null;
	};

	/**
	 * Finds the view object by given ID
	 * @param {String} sId The ID of the view
	 * @private
	 * @returns {sap.m.SinglePlanningCalendarView} the view object matched the given sId, of null if there is no such view
	 */
	SinglePlanningCalendar.prototype._getViewById = function (sId) {
		var aViews = this.getViews(),
			i;
		for (i = 0; i < aViews.length; i++) {
				if (aViews[i].getId() === sId) {
				return aViews[i];
			}
		}
		return null;
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

		oHeader.attachEvent("viewChange", this._handleViewChange, this);
		oHeader.attachEvent("pressPrevious", this._handlePressArrow, this);
		oHeader.attachEvent("pressToday", this._handlePressToday, this);
		oHeader.attachEvent("pressNext", this._handlePressArrow, this);
		oHeader.attachEvent("dateSelect", this._handleCalendarPickerDateSelect, this);

		return this;
	};

	/**
	 * Attaches delegates to the events in the _grid aggregation.
	 *
	 * @private
	 */
	SinglePlanningCalendar.prototype._attachDelegates = function() {
			// After the grid renders apply the focus on the cell
			this._afterRenderFocusCell = {
				onAfterRendering: function() {
					if (this._sGridCellFocusSelector) {
						jQuery(this._sGridCellFocusSelector).focus();
						this._sGridCellFocusSelector = null;
					}
				}.bind(this)
			};
		this.getAggregation("_grid").addDelegate(this._afterRenderFocusCell);
		this.getAggregation("_mvgrid").addDelegate(this._afterRenderFocusCell);
	};

	/**
	 * Attaches handlers to the events in the _grid aggregation.
	 *
	 * @returns {object} this for method chaining
	 * @private
	 */
	SinglePlanningCalendar.prototype._attachGridEvents = function () {
		var oGrid = this.getAggregation("_grid"),
			oGridMV = this.getAggregation("_mvgrid");

		var fnHandleHeadersSelect = function(oEvent) {
			this.fireHeaderDateSelect({
				date: oEvent.getSource().getDate()
			});
		};
		var fnHandleAppointmentSelect = function(oEvent) {
			this.fireAppointmentSelect({
				appointment: oEvent.getParameter("appointment"),
				appointments: oEvent.getParameter("appointments")
			});
		};
		var fnHandleAppointmentDrop = function(oEvent) {
			this.fireAppointmentDrop({
				appointment: oEvent.getParameter("appointment"),
				startDate: oEvent.getParameter("startDate"),
				endDate: oEvent.getParameter("endDate"),
				copy: oEvent.getParameter("copy")
			});
		};
		var fnHandleAppointmentResize = function(oEvent) {
			this.fireAppointmentResize({
				appointment: oEvent.getParameter("appointment"),
				startDate: oEvent.getParameter("startDate"),
				endDate: oEvent.getParameter("endDate")
			});
		};
		var fnHandleAppointmentCreate = function(oEvent) {
			this.fireAppointmentCreate({
				startDate: oEvent.getParameter("startDate"),
				endDate: oEvent.getParameter("endDate")
			});
		};
		var fnHandleCellPress = function(oEvent) {
			this.fireEvent("cellPress", {
				startDate: oEvent.getParameter("startDate"),
				endDate: oEvent.getParameter("endDate")
			});
		};
		var fnHandleMoreLinkPress = function(oEvent) {
			this.fireEvent("moreLinkPress", {
				date: oEvent.getParameter("date")
			});
		};
		var fnHandleBorderReached = function(oEvent) {
			var oGrid = this.getAggregation("_grid"),
				oFormat = oGrid._getDateFormatter(),
				iNavDelta = this._getSelectedView().getScrollEntityCount() - oGrid._getColumns() + 1,
				oCellStartDate = new Date(oEvent.getParameter("startDate")),
				bFullDay = oEvent.getParameter("fullDay"),
				oNavDate = this.getStartDate();

			if (oEvent.getParameter("next")) {
				oCellStartDate.setDate(oCellStartDate.getDate() + iNavDelta);
				oNavDate = new Date(oNavDate.setDate(oNavDate.getDate() + this._getSelectedView().getScrollEntityCount()));
				this.setStartDate(oNavDate);
			} else {
				oCellStartDate.setDate(oCellStartDate.getDate() - iNavDelta);
				oNavDate = new Date(oNavDate.setDate(oNavDate.getDate() - this._getSelectedView().getScrollEntityCount()));
				this.setStartDate(oNavDate);
			}

			this._sGridCellFocusSelector = bFullDay ?
				"[data-sap-start-date='" + oFormat.format(oCellStartDate) + "'].sapMSinglePCBlockersColumn" :
				"[data-sap-start-date='" + oFormat.format(oCellStartDate) + "'].sapMSinglePCRow";
		};
		var fnHandleBorderReachedMonthView = function(oEvent) {
			var oDate = new Date(oEvent.getParameter("startDate")),
				oCalNextDate = CalendarDate.fromLocalJSDate(oDate),
				oNextDate;

			oCalNextDate.setDate(oCalNextDate.getDate() + oEvent.getParameter("offset"));
			oNextDate = oCalNextDate.toLocalJSDate();

			this.setStartDate(oNextDate);

			this._sGridCellFocusSelector =
				"[sap-ui-date='" + oCalNextDate.valueOf() + "'].sapMSPCMonthDay";
		};

		oGrid._getColumnHeaders().attachEvent("select", fnHandleHeadersSelect, this);

		oGrid.attachEvent("appointmentSelect", fnHandleAppointmentSelect, this);
		oGridMV.attachEvent("appointmentSelect", fnHandleAppointmentSelect, this);

		oGrid.attachEvent("appointmentDrop", fnHandleAppointmentDrop, this);
		oGridMV.attachEvent("appointmentDrop", fnHandleAppointmentDrop, this);

		oGrid.attachEvent("appointmentResize", fnHandleAppointmentResize, this);

		oGrid.attachEvent("appointmentCreate", fnHandleAppointmentCreate, this);

		oGrid.attachEvent("cellPress", fnHandleCellPress, this);
		oGridMV.attachEvent("cellPress", fnHandleCellPress, this);
		oGridMV.attachEvent("moreLinkPress", fnHandleMoreLinkPress, this);

		oGrid.attachEvent("borderReached", fnHandleBorderReached, this);
		oGridMV.attachEvent("borderReached", fnHandleBorderReachedMonthView, this);

		return this;
	};

	/**
	 * Handler for the viewChange event in the _header aggregation.
	 * @private
	 */
	SinglePlanningCalendar.prototype._handleViewChange = function (oEvent) {
		var sNewViewKey = oEvent.getParameter("item").getProperty("key"),
			oNewView = this.getViewByKey(sNewViewKey);
		this._setupNewView(oNewView);
		this.fireViewChange();
	};

	/**
	 * Handler for the pressPrevious and pressNext events in the _header aggregation.
	 * @param {Date} oEvent The triggered event
	 * @private
	 */
	SinglePlanningCalendar.prototype._handlePressArrow = function (oEvent) {
		this._applyArrowsLogic(oEvent.getId() === "pressPrevious");
		this._adjustColumnHeadersTopOffset();
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
		this._adjustColumnHeadersTopOffset();
	};

	/**
	 * Sets given view in the selectedView association and then prepares the calendar
	 * for the new view.
	 * @param {Object || String}  vViwe The new view
	 * @private
	 */
	SinglePlanningCalendar.prototype._setupNewView = function(vView) {
		var oPreviousGrid = this._getCurrentGrid();
		this.setAssociation("selectedView", vView);
		this._transferAggregations(oPreviousGrid);
		this._alignColumns();
		this._adjustColumnHeadersTopOffset();
	};

	SinglePlanningCalendar.prototype._transferAggregations = function(oPreviousGrid) {
		var oNextGrid = this._getCurrentGrid(),
			aApps,
			aSpecialDates,
			i;

		if (oPreviousGrid.getId() !== oNextGrid.getId()) {
			aApps = oPreviousGrid.removeAllAggregation("appointments", true);

			for (i = 0; i < aApps.length; i++) {
				oNextGrid.addAggregation("appointments", aApps[i], true);
			}

			aSpecialDates = oPreviousGrid.removeAllAggregation("specialDates", true);

			for (i = 0; i < aSpecialDates.length; i++) {
				oNextGrid.addAggregation("specialDates", aSpecialDates[i], true);
			}
		}
	};

	/**
	 * Handler for the dateSelect event in the _header aggregation.
	 * @private
	 */
	SinglePlanningCalendar.prototype._handleCalendarPickerDateSelect = function () {
		var oStartDate = this._getHeader().getStartDate(),
			oSPCStartDate;

		oSPCStartDate = this._getSelectedView().calculateStartDate(new Date(oStartDate.getTime()));
		this.setStartDate(oSPCStartDate);
		if (!this._getSelectedView().isA("sap.m.SinglePlanningCalendarMonthView")) {
			this.getAggregation("_grid")._getColumnHeaders().setDate(oStartDate);
		}
		this.fireStartDateChange({
			date: oSPCStartDate
		});
		this._adjustColumnHeadersTopOffset();
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
			oLongDateFormat = DateFormat.getDateInstance({format: "yMMMMd"}),
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
			iOffset = bBackwards ? -1 : 1,
			iNumberToAdd = this._getSelectedView().getScrollEntityCount(this.getStartDate(), iOffset),
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
			oGrid = this.getAggregation("_grid"),
			oGridMV = this.getAggregation("_mvgrid"),
			oView = this._getSelectedView(),
			oDate = this.getStartDate() || new Date(),
			oViewStartDate = oView.calculateStartDate(new Date(oDate.getTime())),
			oCalViewDate = CalendarDate.fromLocalJSDate(oViewStartDate);

		oHeader.setStartDate(oViewStartDate);
		oHeader.setPickerText(this._formatPickerText(oCalViewDate));
		this._updateCalendarPickerSelection();
		oGrid.setStartDate(oViewStartDate);
		oGridMV.setStartDate(oViewStartDate);
		oGrid._setColumns(oView.getEntityCount());

		this._setColumnHeaderVisibility();
	};

	/**
	 * Switches the visibility of the column headers in the _grid.
	 * If the selectedView association of the SinglePlanningCalendar is day view, the column headers are not visible.
	 * Otherwise, they are displayed in the _grid.
	 * @private
	 */
	SinglePlanningCalendar.prototype._setColumnHeaderVisibility = function() {
		var bVisible;

		if (this._getSelectedView().isA("sap.m.SinglePlanningCalendarMonthView")) {
			return;
		}

		bVisible = !this._getSelectedView().isA("sap.m.SinglePlanningCalendarDayView");

		this.getAggregation("_grid")._getColumnHeaders().setVisible(bVisible);
		this.toggleStyleClass("sapMSinglePCHiddenColHeaders", !bVisible);
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
	SinglePlanningCalendar.prototype._getCurrentGrid = function() {
		if (this._getSelectedView().isA("sap.m.SinglePlanningCalendarMonthView")) {
			return this.getAggregation("_mvgrid");
		} else {
			return this.getAggregation("_grid");
		}
	};

	/**
	 * Registers resize handler.
	 * @param {string} sHandler the handler ID
	 * @param {Object} oObject
	 * @param {Function} fnHandler
	 * @returns {sap.m.SinglePlanningCalendar} <code>this</code> for chaining
	 * @private
	 */
	SinglePlanningCalendar.prototype._registerResizeHandler = function (sHandler, oObject, fnHandler) {
		if (!this[sHandler]) {
			this[sHandler] = ResizeHandler.register(oObject, fnHandler);
		}

		return this;
	};

	/**
	 * De-registers resize handler.
	 * @param {string} sHandler the handler ID
	 * @returns {sap.m.SinglePlanningCalendar} <code>this</code> for chaining
	 * @private
	 */
	SinglePlanningCalendar.prototype._deRegisterResizeHandler = function (sHandler) {
		if (this[sHandler]) {
			ResizeHandler.deregister(this[sHandler]);
			this[sHandler] = null;
		}

		return this;
	};

	return SinglePlanningCalendar;

});
