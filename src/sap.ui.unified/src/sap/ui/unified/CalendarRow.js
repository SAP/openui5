/*!
 * ${copyright}
 */

//Provides control sap.ui.unified.Calendar.
sap.ui.define([
	"sap/base/i18n/Formatting",
	"sap/base/i18n/Localization",
	'sap/ui/core/Control',
	'sap/ui/Device',
	"sap/ui/core/Lib",
	'sap/ui/core/LocaleData',
	'sap/ui/unified/calendar/CalendarUtils',
	'sap/ui/core/date/UniversalDate',
	'./library',
	'sap/ui/core/InvisibleText',
	'sap/ui/core/format/DateFormat',
	'sap/ui/core/ResizeHandler',
	'sap/ui/core/Locale',
	"./CalendarRowRenderer",
	"sap/ui/dom/containsOrEquals",
	"sap/ui/thirdparty/jquery",
	"sap/ui/unified/CalendarAppointment",
	'sap/ui/core/library',
	"sap/ui/core/date/UI5Date"
], function(
	Formatting,
	Localization,
	Control,
	Device,
	Library,
	LocaleData,
	CalendarUtils,
	UniversalDate,
	library,
	InvisibleText,
	DateFormat,
	ResizeHandler,
	Locale,
	CalendarRowRenderer,
	containsOrEquals,
	jQuery,
	CalendarAppointment,
	corelibrary,
	UI5Date
) {
	"use strict";

	// shortcut for sap.ui.unified.CalendarDayType
	var CalendarDayType = library.CalendarDayType;

	// shortcut for sap.ui.unified.CalendarAppointmentVisualization
	var CalendarAppointmentVisualization = library.CalendarAppointmentVisualization;

	// shortcut for sap.ui.unified.GroupAppointmentsMode
	var GroupAppointmentsMode = library.GroupAppointmentsMode;

	// shortcut for sap.ui.unified.CalendarIntervalType
	var CalendarIntervalType = library.CalendarIntervalType;

	// shortcut for sap.ui.unified.CalendarAppointmentHeight
	var CalendarAppointmentHeight = library.CalendarAppointmentHeight;

	// shortcut for sap.ui.unified.CalendarAppointmentRoundWidth
	var CalendarAppointmentRoundWidth = library.CalendarAppointmentRoundWidth;

	/*
	 * <code>UniversalDate</code> objects are used inside the <code>CalendarRow</code>, whereas UI5Date or JavaScript dates are used in the API.
	 * So conversion must be done on API functions.
	 *
	 * ItemNavigation is not used as the keyboard navigation is somehow different.
	 * Navigation goes to the next/previous appointment even if it's not visible in the current output.
	 * Arrow up/down leaves the row (To navigate to the next row in PlanningCalendar).
	 */

	/**
	 * Constructor for a new <code>CalendarRow</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * A calendar row with a header and appointments. The Appointments will be placed in the defined interval.
	 * @extends sap.ui.core.Control
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.34.0
	 * @alias sap.ui.unified.CalendarRow
	 */
	var CalendarRow = Control.extend("sap.ui.unified.CalendarRow", /** @lends sap.ui.unified.CalendarRow.prototype */ { metadata : {

		library : "sap.ui.unified",
		properties : {
			/**
			 * Start date, as UI5Date or JavaScript Date object, of the row. As default, the current date is used.
			 */
			startDate : {type : "object", group : "Data"},

			/**
			 * Number of displayed intervals. The size of the intervals is defined with <code>intervalType</code>
			 */
			intervals : {type : "int", group : "Appearance", defaultValue : 12},

			/**
			 * Number of interval type units merged. It's used when presenting Relative View in sap.m.PlanningCalendar.
			 * Note: If the value is more than 1, the NonWorkingDays type is not presented.
			 */
			intervalSize : { type: "int", group: "Appearance", defaultValue: 1},

			/**
			 * Type of the intervals of the row. The default is one hour.
			 */
			intervalType : {type : "sap.ui.unified.CalendarIntervalType", group : "Appearance", defaultValue : CalendarIntervalType.Hour},

			/**
			 * If set, subintervals are shown.
			 *
			 * If the interval type is <code>Hour</code>, quarter hours are shown.
			 *
			 * If the interval type is <code>Day</code>, hours are shown.
			 *
			 * If the interval type is <code>Month</code>, days are shown.
			 */
			showSubIntervals : {type : "boolean", group : "Appearance", defaultValue : false},

			/**
			 * If set, interval headers are shown like specified in <code>showEmptyIntervalHeaders</code>.
			 *
			 * If not set, no interval headers are shown even if <code>intervalHeaders</code> are assigned.
			 */
			showIntervalHeaders : {type : "boolean", group : "Appearance", defaultValue : true},

			/**
			 * If set, interval headers are shown even if no <code>intervalHeaders</code> are assigned to the visible time frame.
			 *
			 * If not set, no interval headers are shown if no <code>intervalHeaders</code> are assigned.
			 *
			 * <b>Note:</b> This property is only used if <code>showIntervalHeaders</code> is set to true.
			 * @since 1.38.0
			 */
			showEmptyIntervalHeaders : {type : "boolean", group : "Appearance", defaultValue : true},

			/**
			 * If set, the provided weekdays are displayed as non-working days.
			 * Valid values inside the array are 0 to 6. (Other values will just be ignored.)
			 *
			 * If not set, the weekend defined in the locale settings is displayed as non-working days.
			 *
			 * <b>Note:</b> The non working days are only visualized if <code>intervalType</code> is set to day.
			 */
			nonWorkingDays : {type : "int[]", group : "Misc", defaultValue : null},

			/**
			 * If set, the provided hours are displayed as non-working hours.
			 * Valid values inside the array are 0 to 23. (Other values will just be ignored.)
			 *
			 * <b>Note:</b> The non working hours are only visualized if <code>intervalType</code> is set to hour.
			 */
			nonWorkingHours : {type : "int[]", group : "Misc", defaultValue : null},

			/**
			 * Width of the row
			 */
			width : {type : "sap.ui.core.CSSSize", group : "Dimension", defaultValue : null},

			/**
			 * Height of the row
			 */
			height : {type : "sap.ui.core.CSSSize", group : "Dimension", defaultValue : null},

			/**
			 * If set, the <code>CalendarRow</code> checks for resize by itself.
			 *
			 * If a lot of <code>CalendarRow</code> controls are used in one container control (like <code>PlanningCalendar</code>).
			 * the resize checks should be done only by this container control. Then the container control should
			 * call <code>handleResize</code> of the <code>CalendarRow</code> if a resize happens.
			 */
			checkResize : {type : "boolean", group : "Behavior", defaultValue : true},

			/**
			 * If set the <code>CalendarRow</code> triggers a periodic update to visualize the current time.
			 *
			 * If a lot of <code>CalendarRow</code> controls are used in one container control (like <code>PlanningCalendar</code>)
			 * the periodic update should be triggered only by this container control. Then the container control should
			 * call <code>updateCurrentTimeVisualization</code> of the <code>CalendarRow</code> to update the visualization.
			 */
			updateCurrentTime : {type : "boolean", group : "Behavior", defaultValue : true},

			/**
			 * Defines the mode in which the overlapping appointments are displayed.
			 *
			 * <b>Note:</b> This property takes effect, only if the <code>intervalType</code> of the current calendar view
			 * is set to <code>sap.ui.unified.CalendarIntervalType.Month</code>. On phone devices this property is ignored,
			 * and the default value is applied.
			 */
			groupAppointmentsMode : {type : "sap.ui.unified.GroupAppointmentsMode", group : "Appearance", defaultValue : GroupAppointmentsMode.Collapsed},

			/**
			 * Defines the visualization of the <code>CalendarAppoinment</code>
			 *
			 * <b>Note:</b> The real visualization depends on the used theme.
			 * @since 1.40.0
			 */
			appointmentsVisualization: { type: "sap.ui.unified.CalendarAppointmentVisualization", group: "Appearance", defaultValue: CalendarAppointmentVisualization.Standard },

			/**
			 * Defines the height of the <code>CalendarAppoinment<code>
			 * @since 1.81.0
			 */
			appointmentHeight: { type: "sap.ui.unified.CalendarAppointmentHeight", group: "Appearance", defaultValue: CalendarAppointmentHeight.Regular},

			/**
			 * Defines rounding of the width of <code>CalendarAppoinment<code>
			 * <b>Note:</b> This property is applied, when the calendar interval type is Day and the view shows more than 20 days
			 * @since 1.81.0
			 */
			appointmentRoundWidth: { type: "sap.ui.unified.CalendarAppointmentRoundWidth", group: "Appearance", defaultValue: CalendarAppointmentRoundWidth.None},

			/**
			 * Determines whether the selection of multiple appointments is enabled.
			 *
			 * Note: selection of multiple appointments is possible using CTRL key regardless of the value of this property.
			 *
			 * @since 1.97
			 */
			multipleAppointmentsSelection : {type : "boolean", group : "Data", defaultValue : false}
		},
		aggregations : {

			/**
			 * Appointments to be displayed in the row. Appointments outside the visible time frame are not rendered.
			 *
			 * <b>Note:</b> For performance reasons, only appointments in the visible time range or nearby should be assigned.
			 */
			appointments : {type : "sap.ui.unified.CalendarAppointment", defaultClass: CalendarAppointment, multiple : true, singularName : "appointment"},

			/**
			 * Sets the provided period to be displayed as a non-working.
			 * @since 1.128
			 */
			nonWorkingPeriods: {type: "sap.ui.unified.NonWorkingPeriod", multiple: true},

			/**
			 * Appointments to be displayed in the top of the intervals. The <code>intervalHeaders</code> are used to visualize
			 * public holidays and similar things.
			 *
			 * Appointments outside the visible time frame are not rendered.
			 *
			 * The <code>intervalHeaders</code> always fill whole intervals. If they are shorter than one interval, they are not displayed.
			 *
			 * <b>Note:</b> For performance reasons, only appointments in the visible time range or nearby should be assigned.
			 */
			intervalHeaders : {type : "sap.ui.unified.CalendarAppointment", multiple : true, singularName : "intervalHeader"},

			groupAppointments : {type : "sap.ui.unified.CalendarAppointment", multiple : true, singularName : "groupAppointment", visibility : "hidden"}

		},
		associations: {

			/**
			 * Association to controls / IDs which label this control (see WAI-ARIA attribute aria-labelledby).
			 *
			 * <b>Note</b> These labels are also assigned to the appointments.
			 */
			ariaLabelledBy: { type: "sap.ui.core.Control", multiple: true, singularName: "ariaLabelledBy" },

			/**
			 * Association to the <code>CalendarLegend</code> explaining the colors of the <code>Appointments</code>.
			 *
			 * <b>Note</b> The legend does not have to be rendered but must exist, and all required types must be assigned.
			 * @since 1.40.0
			 */
			legend: { type: "sap.ui.unified.CalendarLegend", multiple: false}
		},
		events : {

			/**
			 * Fired if an appointment was selected
			 */
			select : {
				parameters : {
					/**
					 * selected appointment
					 */
					appointment : {type : "sap.ui.unified.CalendarAppointment"},

					/**
					 * selected appointments in case a group appointment is selected
					 */
					appointments : {type : "sap.ui.unified.CalendarAppointment[]"},

					/**
					 * If set, the appointment was selected by multiple selection (e.g. shift + mouse click).
					 * So more than the current appointment could be selected.
					 */
					multiSelect : {type : "boolean"},

					/**
					 * Gives the ID of the DOM element of the clicked appointment
					 * @since 1.50
					 */
					domRefId: {type: "string"}
				}
			},
			/**
			 * <code>startDate</code> was changed while navigating in <code>CalendarRow</code>
			 */
			startDateChange : {},

			/**
			 * The <code>CalendarRow</code> should be left while navigating. (Arrow up or arrow down.)
			 * The caller should determine the next control to be focused
			 */
			leaveRow : {
				parameters : {
					/**
					 * The type of the event that triggers this <code>leaveRow</code>
					 */
					type : {type : "string"}
				}
			},

			/**
			 * Fired if an interval was selected
			 * @since 1.38.0
			 */
			intervalSelect : {
				parameters : {
					/**
					 * Interval start date as UI5Date or JavaScript Date object
					 */
					startDate : {type : "object"},

					/**
					 * Interval end date as UI5Date or JavaScript Date object
					 */
					endDate : {type : "object"},

					/**
					 * If set, the selected interval is a subinterval
					 */
					subInterval : {type : "boolean"}
				}
			}
		}
	}, renderer: CalendarRowRenderer});

	CalendarRow.prototype.init = function(){

		this._bRTL  = Localization.getRTL();
		this._oRb = Library.getResourceBundleFor("sap.ui.unified");
		var pattern = this._oRb.getText("APPOINTMENT_DATE_TIME_DESCRIPTION", [_getLocaleData.call(this).getDatePattern("long"), _getLocaleData.call(this).getTimePattern("medium")]);

		this._oFormatAria = DateFormat.getDateTimeInstance({
			pattern: "EEEE " + pattern
		});

		this._aVisibleAppointments = [];
		this._aVisibleIntervalHeaders = [];

		this.setStartDate(UI5Date.getInstance());

		this._resizeProxy = jQuery.proxy(this.handleResize, this);

		//array to store the selected appointments and to pass them to getSelectedAppointments method in the PlanningCalendar
		this.aSelectedAppointments = [];

		this._fnCustomSortedAppointments = undefined; //to store the custom appointments sorter function, given to the PlanningCalendar

	};

	CalendarRow.prototype.exit = function(){

		if (this._sResizeListener) {
			ResizeHandler.deregister(this._sResizeListener);
			this._sResizeListener = undefined;
		}

		if (this._sUpdateCurrentTime) {
			clearTimeout(this._sUpdateCurrentTime);
			this._sUpdateCurrentTime = undefined;
		}

		this._fnCustomSortedAppointments = undefined;
	};

	CalendarRow.prototype.onBeforeRendering = function(){
		this._aVisibleAppointments = [];
		_calculateIntervals.call(this);
		_determineVisibleAppointments.call(this);
		_determineVisibleIntervalHeaders.call(this);

		if (this._sUpdateCurrentTime) {
			clearTimeout(this._sUpdateCurrentTime);
			this._sUpdateCurrentTime = undefined;
		}

		if (!this.getAppointments().length) {
			this.aSelectedAppointments = [];
		} else {
			this.getAppointments().forEach(function (oApp) {
				this._updateSelectedAppointmentsArray(oApp);
			}.bind(this));
		}
	};

	CalendarRow.prototype.onAfterRendering = function(){

		_positionAppointments.call(this);
		this.updateCurrentTimeVisualization();

		if (this.getCheckResize() && !this._sResizeListener) {
			this._sResizeListener = ResizeHandler.register(this, this._resizeProxy);
		}

	};

	CalendarRow.prototype.onThemeChanged = function (oEvent) {

		if (this.getDomRef()) {
			// already rendered -> recalculate positions of appointments as size can change
			for (var i = 0; i < this._aVisibleAppointments.length; i++) {
				var oAppointment = this._aVisibleAppointments[i];
				oAppointment.level = -1;
			}
			this.handleResize(oEvent);
		}

	};

	CalendarRow.prototype.invalidate = function(oOrigin) {
		if (oOrigin && oOrigin instanceof CalendarAppointment) {
			// as position could change -> delete visible appointments to recalculate positions
			var bFound = false;
			for (var i = 0; i < this._aVisibleAppointments.length; i++) {
				if (this._aVisibleAppointments[i].appointment == oOrigin) {
					bFound = true;
					break;
				}
			}

			if (bFound) {
				this._aVisibleAppointments = [];
			}
			// removes or adds the selected appointments from this.aSelectedAppointments
			this._updateSelectedAppointmentsArray(oOrigin);
		}

		Control.prototype.invalidate.apply(this, arguments);

	};

	/**
	 * Set the start date of the row.
	 *
	 * @param {Date|module:sap/ui/core/date/UI5Date} [oStartDate] Start date, as date instance, of the row
	 * @returns {this} Reference to <code>this</code> for method chaining
	 * @public
	 */
	CalendarRow.prototype.setStartDate = function(oStartDate){

		if (!oStartDate) {
			//set default value
			oStartDate = UI5Date.getInstance();
		}

		CalendarUtils._checkJSDateObject(oStartDate);

		var iYear = oStartDate.getFullYear();
		CalendarUtils._checkYearInValidRange(iYear);

		this._oUTCStartDate = CalendarUtils._createUniversalUTCDate(oStartDate, undefined, true);

		this.setProperty("startDate", oStartDate);

		return this;

	};

	/**
	 * Returns the start date of the row.
	 *
	 * @returns {sap.ui.core.date.UniversalDate} in UTC timezone
	 * @private
	 */
	CalendarRow.prototype._getStartDate = function(){

		if (!this._oUTCStartDate) {
			this._oUTCStartDate = CalendarUtils._createUniversalUTCDate(this.getStartDate(), undefined, true);
		}

		return this._oUTCStartDate;
	};

	CalendarRow.prototype.setIntervalType = function(sIntervalType){

		this.setProperty("intervalType", sIntervalType);

		// as min. interval size changes and the min. delta, the old levels can not be reused
		this._aVisibleAppointments = [];

		return this;

	};

	CalendarRow.prototype._getAppointmentReducedHeight = function(oAppointment){
		var bReducedHeight = !Device.system.phone && false && oAppointment.size === CalendarAppointmentHeight.Regular;

		return bReducedHeight;
	};

	CalendarRow.prototype.onfocusin = function(oEvent) {

		if (jQuery(oEvent.target).hasClass("sapUiCalendarApp")) {
			// focus on appointment
			_focusAppointment.call(this, oEvent.target.id);
		} else {
			// check if inside appointment
			var aVisibleAppointments = this._getVisibleAppointments();
			var bFound = false;
			var oAppointment;

			for (var i = 0; i < aVisibleAppointments.length; i++) {
				oAppointment = aVisibleAppointments[i].appointment;
				if (containsOrEquals(oAppointment.getDomRef(), oEvent.target)) {
					bFound = true;
					oAppointment.focus();
					break;
				}
			}

			if (!bFound) {
				// focus somewhere else -> focus appointment
				oAppointment = this.getFocusedAppointment();
				if (oAppointment) {
					oAppointment.focus();
				}
			}
		}

	};

	CalendarRow.prototype.applyFocusInfo = function (oFocusInfo) {

		if (this._sFocusedAppointmentId) {
			this.getFocusedAppointment().focus();
		}

		return this;

	};

	CalendarRow.prototype.onsapleft = function(oEvent) {

		if (jQuery(oEvent.target).hasClass("sapUiCalendarApp")) {
			_navigateToAppointment.call(this, this._bRTL, 1);
		}

		oEvent.preventDefault();
		oEvent.stopPropagation();

	};

	CalendarRow.prototype.onsapright = function(oEvent) {

		if (jQuery(oEvent.target).hasClass("sapUiCalendarApp")) {
			_navigateToAppointment.call(this, !this._bRTL, 1);
		}

		oEvent.preventDefault();
		oEvent.stopPropagation();

	};

	CalendarRow.prototype.onsapup = function(oEvent) {

		this.fireLeaveRow({type: oEvent.type});

	};

	CalendarRow.prototype.onsapdown = function(oEvent) {

		this.fireLeaveRow({type: oEvent.type});

	};

	CalendarRow.prototype.onsaphome = function(oEvent) {

		_handleHomeEnd.call(this, oEvent);

		oEvent.preventDefault();
		oEvent.stopPropagation();

	};

	CalendarRow.prototype.onsapend = function(oEvent) {

		_handleHomeEnd.call(this, oEvent);

		oEvent.preventDefault();
		oEvent.stopPropagation();

	};

	CalendarRow.prototype.onsapselect = function(oEvent){
		// focused appointment must be selected
		var aVisibleAppointments = this._getVisibleAppointments(),
			oAppointment;


		for (var i = 0; i < aVisibleAppointments.length; i++) {
			oAppointment = aVisibleAppointments[i].appointment;
			if (containsOrEquals(oAppointment.getDomRef(), oEvent.target)) {
				var bRemoveOldSelection = !(this.getMultipleAppointmentsSelection() || oEvent.ctrlKey || oEvent.metaKey);
				_selectAppointment.call(this, oAppointment, bRemoveOldSelection);
				break;
			}
		}

		//To prevent bubbling into PlanningCalendar.
		//For appointments, this will prevent tap event on ColumnListItem, which in turn fires rowSelectionChange.
		oEvent.stopPropagation();
		oEvent.preventDefault();

	};

	CalendarRow.prototype.ontap = function(oEvent) {
		var aIntervals = this.$("Apps").children(".sapUiCalendarRowAppsInt");
		var iIndex = 0;
		var bInterval = false;

		// check if part of an Interval
		for (iIndex = 0; iIndex < aIntervals.length; iIndex++) {
			var oInterval = aIntervals[iIndex];
			if (!this._isOneMonthsRowOnSmallSizes() && containsOrEquals(oInterval, oEvent.target)) {
				bInterval = true;
				break;
			}
		}

		if (bInterval) {
			// click on interval
			_selectInterval.call(this, iIndex, oEvent.target);
		} else {
			// click on appointment?
			this.onsapselect(oEvent);
		}

	};

	CalendarRow.prototype.onsapselectmodifiers = function(oEvent){

		this.onsapselect(oEvent);

	};

	/**
	 * After a resize of the <code>CalendarRow</code>, some calculations for appointment
	 * sizes are needed.
	 *
	 * For this, each <code>CalendarRow</code> can trigger the resize check for it's own DOM.
	 * But if multiple <code>CalendarRow</code>s are used in one container (e.g. <code>PlanningCalendar</code>),
	 * it is better if the container triggers the resize check once and then calls this function
	 * of each <code>CalendarRow</code>.
	 *
	 * @param {jQuery.Event} oEvent The event object of the resize handler.
	 * @returns {this} Reference to <code>this</code> for method chaining
	 * @public
	 */
	CalendarRow.prototype.handleResize = function(oEvent) {

		if (oEvent && oEvent.size && oEvent.size.width <= 0) {
			// only if visible at all
			return this;
		}

		var $DummyApp = this.$("DummyApp");

		// show dummy appointment
		$DummyApp.css("display", "");

		_positionAppointments.call(this);

		return this;

	};

	/**
	 * If the current time is in the visible output of the <code>CalendarRow</code>,
	 * the indicator for the current time must be positioned.
	 *
	 * For this, each <code>CalendarRow</code> can trigger a timer.
	 * But if multiple <code>CalendarRow</code>s are used in one container (e.G. <code>PlanningCalendar</code>),
	 * it is better if the container triggers the interval once and then calls this function
	 * of each <code>CalendarRow</code>.
	 *
	 * @returns {this} Reference to <code>this</code> for method chaining
	 * @public
	 */
	CalendarRow.prototype.updateCurrentTimeVisualization = function() {
		var $Now = this.$("Now");
		var oNowDate = CalendarUtils._createUniversalUTCDate(UI5Date.getInstance(), undefined, true);
		var iIntervals = this.getIntervals();
		var sIntervalType = this.getIntervalType();
		var oStartDate = this._getStartDate();
		var iStartTime = oStartDate.getTime();
		var oEndDate = this._oUTCEndDate;
		var iEndTime = oEndDate.getTime();

		this._sUpdateCurrentTime = undefined;

		if (oNowDate.getTime() <= iEndTime && oNowDate.getTime() >= iStartTime) {
			var iBegin = _calculateBegin.call(this, sIntervalType, iIntervals, oStartDate, oEndDate, iStartTime, oNowDate);
			var iTime = 0;

			if (this._bRTL) {
				$Now.css("right", iBegin + "%");
			} else {
				$Now.css("left", iBegin + "%");
			}
			$Now.css("display", "");

			if (this.getUpdateCurrentTime()) {
				switch (sIntervalType) {
				case CalendarIntervalType.Hour:
					iTime = 60000;
					break;

				case CalendarIntervalType.Day:
				case CalendarIntervalType.Week:
				case CalendarIntervalType.OneMonth:
				case "OneMonth":
					iTime = 1800000;
					break;

				default:
					iTime = -1; // not needed
				break;
				}

				if (iTime > 0) {
					this._sUpdateCurrentTime = setTimeout(this.updateCurrentTimeVisualization.bind(this), iTime);
				}
			}
		} else  {
			$Now.css("display", "none");
		}

		return this;

	};

	/**
	 * Returns the focused <code>CalendarAppointment</code> of the <code>CalendarRow</code>.
	 *
	 * The focus must not really be on the <code>CalendarAppointment</code>, it have just to
	 * be the one that has the focus when the <code>CalendarRow</code> was focused last time.
	 *
	 * @returns {sap.ui.unified.CalendarAppointment} Focused Appointment
	 * @public
	 */
	CalendarRow.prototype.getFocusedAppointment = function() {

		var aAppointments = this._getAppointmentsSorted();
		var aGroupAppointments = this.getAggregation("groupAppointments", []);
		var oAppointment;
		var i = 0;

		for (i = 0; i < aGroupAppointments.length; i++) {
			if (aGroupAppointments[i].getId() == this._sFocusedAppointmentId) {
				oAppointment = aGroupAppointments[i];
				break;
			}
		}

		if (!oAppointment) {
			for (i = 0; i < aAppointments.length; i++) {
				if (aAppointments[i].getId() == this._sFocusedAppointmentId) {
					oAppointment = aAppointments[i];
					break;
				}
			}
		}

		return oAppointment;

	};

	/**
	 * Focus the given <code>CalendarAppointment</code> in the <code>CalendarRow</code>.
	 *
	 * @param {sap.ui.unified.CalendarAppointment} oAppointment Appointment to be focused.
	 * @returns {this} Reference to <code>this</code> for method chaining
	 * @public
	 */
	CalendarRow.prototype.focusAppointment = function(oAppointment) {

		if (!oAppointment || !(oAppointment instanceof CalendarAppointment)) {
			throw new Error("Appointment must be a CalendarAppointment; " + this);
		}

		var sId = oAppointment.getId();
		if (this._sFocusedAppointmentId != sId) {
			_focusAppointment.call(this, sId);
		} else  {
			oAppointment.focus();
		}

		return this;

	};

	/**
	 * Focus the <code>CalendarAppointment</code> in the <code>CalendarRow</code> that is nearest to
	 * the given date.
	 *
	 * @param {Date|module:sap/ui/core/date/UI5Date} oDate date instance.
	 * @returns {this} Reference to <code>this</code> for method chaining
	 * @public
	 */
	CalendarRow.prototype.focusNearestAppointment = function(oDate) {

		CalendarUtils._checkJSDateObject(oDate);

		var aAppointments = this._getAppointmentsSorted();
		var oNextAppointment;
		var oPrevAppointment;
		var oAppointment;

		for (var i = 0; i < aAppointments.length; i++) {
			oNextAppointment = aAppointments[i];
			if (oNextAppointment.getStartDate() > oDate) {
				if (i > 0) {
					oPrevAppointment = aAppointments[i - 1];
				} else {
					oPrevAppointment = oNextAppointment;
				}
				break;
			}
		}

		if (oNextAppointment) {
			if (oPrevAppointment && Math.abs(oNextAppointment.getStartDate() - oDate) >= Math.abs(oPrevAppointment.getStartDate() - oDate)) {
				oAppointment = oPrevAppointment;
			} else {
				oAppointment = oNextAppointment;
			}

			this.focusAppointment(oAppointment);
		}

		return this;

	};

	CalendarRow.prototype._getVisibleAppointments = function() {

		return this._aVisibleAppointments;

	};

	CalendarRow.prototype._getVisibleIntervalHeaders = function() {

		return this._aVisibleIntervalHeaders;

	};

	CalendarRow.prototype._getNonWorkingDays = function() {
		if (this.getIntervalSize() !== 1) {
			return [];
		}

		var aNonWorkingDays = this.getNonWorkingDays();

		if (!aNonWorkingDays) {
			var oLocaleData = _getLocaleData.call(this);
			var iWeekendStart = oLocaleData.getWeekendStart();
			var iWeekendEnd = oLocaleData.getWeekendEnd();
			aNonWorkingDays = [];

			for (var i = 0; i <= 6; i++) {
				if ((iWeekendStart <= iWeekendEnd && i >= iWeekendStart && i <= iWeekendEnd) ||
						(iWeekendStart > iWeekendEnd && (i >= iWeekendStart || i <= iWeekendEnd))) {
					aNonWorkingDays.push(i);
				}
			}
		} else if (!Array.isArray(aNonWorkingDays)) {
			aNonWorkingDays = [];
		}

		return aNonWorkingDays;

	};

	/*
	 * returns if the appointments are rendered as list instead in a table
	 */
	CalendarRow.prototype._isOneMonthsRowOnSmallSizes = function() {
		return (this.getIntervalType() === CalendarIntervalType.OneMonth || this.getIntervalType() === "OneMonth") && this.getIntervals() === 1;
	};

	/*
	* Returns sorted appointments depending on duration or custom sorter (if any).
	* @private
	*/
	CalendarRow.prototype._getAppointmentsSorted = function() {
		var aAppointments = this.getAppointments(),
			fnDefaultSorter = _fnDefaultAppointmentsSorter;

		//if there is a custom sort - respect it
		aAppointments.sort(this._fnCustomSortedAppointments ? this._fnCustomSortedAppointments : fnDefaultSorter);

		return aAppointments;
	};

	/*
	* Sets the given custom sorter function from the PlanningCalendar.
	* Have in mind that fnSorter is not validated as this code is considered safe.
	* @private
	*/
	CalendarRow.prototype._setCustomAppointmentsSorterCallback = function(fnSorter) {
		this._fnCustomSortedAppointments = fnSorter;
		this.invalidate();
	};

	/*
	* Returns a javascript object with two floating point numbers,
	* which represent the difference in time units, depending on the view type,
	* between calendar appointment start date and calendar row start date and
	* calendar appointment end date and calendar row end date
	* @private
	*/
	CalendarRow.prototype._calculateAppoitnmentVisualCue = function(oAppointment) {

		if (_isGroupAppoitment(this, oAppointment)) {
			return {
				appTimeUnitsDifRowStart: 0,
				appTimeUnitsDifRowEnd: 0
			};
		}

		var oAppStartDate = oAppointment.getStartDate(),
			oAppEndDate = oAppointment.getEndDate(),
			oUniversalAppStartDate = new UniversalDate(oAppStartDate.getFullYear(), oAppStartDate.getMonth(), oAppStartDate.getDate(), oAppStartDate.getHours(), oAppStartDate.getMinutes()),
			oUniversalAppEndDate = new UniversalDate(oAppEndDate.getFullYear(), oAppEndDate.getMonth(), oAppEndDate.getDate(), oAppEndDate.getHours(), oAppEndDate.getMinutes()),
			sIntervalType = this.getIntervalType(),
			oTableStartDate = this.getStartDate(),
			oUniversalTableStart = sIntervalType === "Hour" ?
				new UniversalDate(oTableStartDate.getFullYear(), oTableStartDate.getMonth(), oTableStartDate.getDate(), oTableStartDate.getHours()) :
				new UniversalDate(oTableStartDate.getFullYear(), oTableStartDate.getMonth(), oTableStartDate.getDate()),
			iColumns = this.getIntervals(),
			oUniversalTableEnd;

		switch (sIntervalType) {
			case "Hour":
				oUniversalTableEnd = new UniversalDate(oTableStartDate.getFullYear(), oTableStartDate.getMonth(), oTableStartDate.getDate(), oTableStartDate.getHours() + iColumns);
				break;
			case "Day":
			case "Week":
			case "One Month":
				oUniversalTableEnd = new UniversalDate(oTableStartDate.getFullYear(), oTableStartDate.getMonth(), oTableStartDate.getDate() + iColumns);
				break;
			case "Month":
				oUniversalTableEnd = new UniversalDate(oTableStartDate.getFullYear(), oTableStartDate.getMonth() + iColumns, oTableStartDate.getDate());
				break;
			default:
				break;
		}

		return {
			appTimeUnitsDifRowStart: oUniversalTableStart.getTime() - oUniversalAppStartDate.getTime(),
			appTimeUnitsDifRowEnd: oUniversalAppEndDate.getTime() - oUniversalTableEnd.getTime()
		};
	};

	/**
	 * Removes or adds the given appointment id from this.aSelectedAppointments
	 * @param {sap.ui.unified.CalendarAppointment} oAppointment the appointment whose id should be added or remove=
	 * @private
	 */
	CalendarRow.prototype._updateSelectedAppointmentsArray = function(oAppointment) {
		if (oAppointment.getSelected()) {
			if (this.aSelectedAppointments.indexOf(oAppointment.getId()) === -1) {
				this.aSelectedAppointments.push(oAppointment.getId());
			}
		} else {
			this.aSelectedAppointments = this.aSelectedAppointments.filter(function(oApp) {
				return oApp !== oAppointment.getId();
			});
		}
	};

	function _isGroupAppoitment(oRow, oAppointment) {
		var oGroupAppointments = oRow.getAggregation("groupAppointments", []);

		var i;
		for (i = 0; i < oGroupAppointments.length; ++i) {
			if (oAppointment === oGroupAppointments[i]) {
				return true;
			}
		}
		return false;
	}

	function _getLocale(){

		if (!this._sLocale) {
			this._sLocale = new Locale(Formatting.getLanguageTag()).toString();
		}

		return this._sLocale;

	}

	function _getLocaleData(){

		if (!this._oLocaleData) {
			var sLocale = _getLocale.call(this);
			var oLocale = new Locale(sLocale);
			this._oLocaleData = LocaleData.getInstance(oLocale);
		}

		return this._oLocaleData;

	}

	/*
	 * If start date, IntervalType or interval number is changed the interval information must be calculated new
	 * The internal UTC Start date must be set to the begin of an interval
	 * The interval size and the row size must be calculated
	 */
	function _calculateIntervals() {

		var oStartDate = this.getStartDate();
		var oEndDate;
		var iIntervals = this.getIntervals();
		var sIntervalType = this.getIntervalType();

		this._oUTCStartDate = _calculateStartDate.call(this, oStartDate);

		switch (sIntervalType) {
		case CalendarIntervalType.Hour:
			oEndDate = new UniversalDate(this._oUTCStartDate.getTime());
			oEndDate.setUTCHours(oEndDate.getUTCHours() + iIntervals);
			break;

		case CalendarIntervalType.Day:
		case CalendarIntervalType.Week:
		case CalendarIntervalType.OneMonth:
		case "OneMonth":
			oEndDate = new UniversalDate(this._oUTCStartDate.getTime());
			oEndDate.setUTCDate(oEndDate.getUTCDate() + iIntervals * this.getIntervalSize());
			break;

		case CalendarIntervalType.Month:
			oEndDate = new UniversalDate(this._oUTCStartDate.getTime());
			oEndDate.setUTCMonth(oEndDate.getUTCMonth() + iIntervals);
			break;

		default:
			throw new Error("Unknown IntervalType: " + sIntervalType + "; " + this);
		}

		oEndDate.setUTCMilliseconds(-1);
		this._iRowSize = oEndDate.getTime() - this._oUTCStartDate.getTime();
		this._iIntervalSize = Math.floor(this._iRowSize / iIntervals);
		this._oUTCEndDate = oEndDate;

	}

	/*
	 * @param {object} oDate date instace
	 * @returns {UniversalDate} Start date for date object
	 */
	function _calculateStartDate(oDate) {

		var sIntervalType = this.getIntervalType();
		var oUTCStartDate = CalendarUtils._createUniversalUTCDate(oDate, undefined, true);

		switch (sIntervalType) {
		case CalendarIntervalType.Hour:
			oUTCStartDate.setUTCMinutes(0);
			oUTCStartDate.setUTCSeconds(0);
			oUTCStartDate.setUTCMilliseconds(0);
			break;

		case CalendarIntervalType.Day:
		case CalendarIntervalType.Week:
		case CalendarIntervalType.OneMonth:
		case "OneMonth":
			oUTCStartDate.setUTCHours(0);
			oUTCStartDate.setUTCMinutes(0);
			oUTCStartDate.setUTCSeconds(0);
			oUTCStartDate.setUTCMilliseconds(0);
			break;

		case CalendarIntervalType.Month:
			oUTCStartDate.setUTCDate(1);
			oUTCStartDate.setUTCHours(0);
			oUTCStartDate.setUTCMinutes(0);
			oUTCStartDate.setUTCSeconds(0);
			oUTCStartDate.setUTCMilliseconds(0);
			break;

		default:
			throw new Error("Unknown IntervalType: " + sIntervalType + "; " + this);
		}

		return oUTCStartDate;

	}

	/*
	 * @returns {boolean} <code>true</code> if group appointments should be enabled, <code>false</code> otherwise.
	 */
	function _isGroupAppointmentsEnabled() {
		return Device.system.phone ||
			(this.getGroupAppointmentsMode() === GroupAppointmentsMode.Collapsed);
	}

	/*
	 * returns an array of visible appointments
	 * each entry is an object with the following properties
	 * - appointment: the appointment object
	 * - begin: begin position in %
	 * - end: end position in %
	 * - level: level of the appointment to not overlap
	 */
	function _determineVisibleAppointments() {

		var aAppointments = this._getAppointmentsSorted();
		var oAppointment;
		var oGroupAppointment;
		var oGroupAppointment2;
		var iIntervals = this.getIntervals();
		var sIntervalType = this.getIntervalType();
		var oStartDate = this._getStartDate();
		var iStartTime = oStartDate.getTime();
		var oEndDate = this._oUTCEndDate;
		var iEndTime = oEndDate.getTime();
		var aVisibleAppointments = [];
		var bFocusIdFound = false;
		var i = 0;
		var j = 0;
		var bGroupsEnabled = _isGroupAppointmentsEnabled.call(this);
		var bHorizontalFit = this._needAppointmentHorizontalFit();

		this.destroyAggregation("groupAppointments", true);

		for (i = 0; i < aAppointments.length; i++) {
			oAppointment = aAppointments[i];

			if (!oAppointment || !oAppointment.getStartDate()) {
				continue;
			}

			var oAppointmentStartDate = CalendarUtils._createUniversalUTCDate(oAppointment.getStartDate(), undefined, true);
			var oAppointmentStartDateTime = oAppointmentStartDate.getTime();
			oAppointmentStartDate.setUTCSeconds(0); // ignore seconds
			oAppointmentStartDate.setUTCMilliseconds(0); // ignore milliseconds
			var oAppointmentEndDate = oAppointment.getEndDate()
				? CalendarUtils._createUniversalUTCDate(oAppointment.getEndDate(), undefined, true)
				: CalendarUtils._createUniversalUTCDate(UI5Date.getInstance(864000000000000), undefined, true); //max date
			var oAppointmentEndDateTime = oAppointmentEndDate.getTime();
			oAppointmentEndDate.setUTCSeconds(0); // ignore seconds
			oAppointmentEndDate.setUTCMilliseconds(0); // ignore milliseconds

			// set start and end time to be in visible range for minimum calculation
			var bCut = false;
			if (oAppointmentStartDate.getTime() < iStartTime && oAppointmentEndDate.getTime() >= iStartTime) {
				oAppointmentStartDate = new UniversalDate(iStartTime);
				bCut = true;
			}
			if (oAppointmentEndDate.getTime() > iEndTime && oAppointmentStartDate.getTime() <= iEndTime) {
				oAppointmentEndDate = new UniversalDate(iEndTime);
				bCut = true;
			}

			var iDelta = (oAppointmentEndDate.getTime() - oAppointmentStartDate.getTime()) / 60000;
			if (bCut && iDelta == 0) {
				// no size after cut -> e.g. starts in past and ends exactly on startDate
				continue;
			}

			var iBegin = 0;
			var iEnd = 0;
			var iLevel = -1;
			oGroupAppointment = undefined;
			oGroupAppointment2 = undefined;

			if (oAppointmentStartDate && oAppointmentStartDate.getTime() <= iEndTime &&
				oAppointmentEndDate && oAppointmentEndDate.getTime() >= iStartTime &&
				oAppointmentStartDateTime <= oAppointmentEndDateTime) {

				if (bGroupsEnabled &&
					(sIntervalType == CalendarIntervalType.Month) &&
					((oAppointmentEndDate.getTime() - oAppointmentStartDate.getTime()) < 604800000/*7 days*/)) {
					// in month mode, group appointment < one week

					oGroupAppointment = _getGroupAppointment.call(this, oAppointmentStartDate, oAppointment, sIntervalType, iIntervals, oStartDate, oEndDate, iStartTime, aVisibleAppointments);
					var oGroupEndDate = CalendarUtils._createUniversalUTCDate(oGroupAppointment.getEndDate(), undefined, true);

					if (oAppointmentEndDate.getTime() > oGroupEndDate.getTime()) {
						// appointment ends in next group
						oGroupAppointment2 = _getGroupAppointment.call(this, oAppointmentEndDate, oAppointment, sIntervalType, iIntervals, oStartDate, oEndDate, iStartTime, aVisibleAppointments);
					}
				}
				if (bHorizontalFit) {
					this._setHorizontalRoundingWidth(oAppointment, oAppointmentStartDate, oAppointmentEndDate);
				}

				iBegin = _calculateBegin.call(this, sIntervalType, iIntervals, oStartDate, oEndDate, iStartTime, oAppointmentStartDate);
				iEnd = _calculateEnd.call(this, sIntervalType, iIntervals, oStartDate, oEndDate, iStartTime, oAppointmentEndDate);

				if (oGroupAppointment) {
					oGroupAppointment._iBegin = iBegin;
					oGroupAppointment._iEnd = iEnd;
					oGroupAppointment._iLevel = iLevel;
					if (oGroupAppointment2) {
						oGroupAppointment2._iBegin = iBegin;
						oGroupAppointment2._iEnd = iEnd;
						oGroupAppointment2._iLevel = iLevel;
					}
					continue;
				}

				aVisibleAppointments.push({ appointment: oAppointment, begin: iBegin, end: iEnd, calculatedEnd: iEnd, level: iLevel, size: this.getProperty("appointmentHeight") });

				if (this._sFocusedAppointmentId && this._sFocusedAppointmentId == oAppointment.getId()) {
					bFocusIdFound = true;
				}
			}
		}

		// if group appointment only has one appointment -> show this appointment
		var aGroupAppointments = this.getAggregation("groupAppointments", []);
		if (aGroupAppointments.length > 0) {
			for (i = 0; i < aVisibleAppointments.length; i++) {
				oAppointment = aVisibleAppointments[i];
				if (oAppointment.appointment._aAppointments && oAppointment.appointment._aAppointments.length <= 1) {
					oGroupAppointment = oAppointment.appointment;
					// check if already shown
					var bFound = false;
					if (oGroupAppointment._aAppointments.length == 0) {
						// group has no appointment - removed before -> remove from visible appointments
						bFound = true;
					} else {
						for (j = 0; j < aVisibleAppointments.length; j++) {
							if (aVisibleAppointments[j].appointment == oGroupAppointment._aAppointments[0]) {
								bFound = true;
								break;
							}
						}
					}
					if (!bFound) {
						// check if in other group appointment - remove it
						for (j = 0; j < aGroupAppointments.length; j++) {
							oGroupAppointment2 = aGroupAppointments[j];
							if (oGroupAppointment != oGroupAppointment2) {
								for (var k = 0; k < oGroupAppointment2._aAppointments.length; k++) {
									if (oGroupAppointment._aAppointments[0] == oGroupAppointment2._aAppointments[k]) {
										oGroupAppointment2._aAppointments.splice(k, 1);
										if (oGroupAppointment2._aAppointments.length == 1) {
											// no appointments left -> delete group
											this.removeAggregation("groupAppointments", oGroupAppointment2);
											oGroupAppointment2.destroy();
											aGroupAppointments = this.getAggregation("groupAppointments", []);
										} else {
											oGroupAppointment2.setProperty("title", oGroupAppointment2._aAppointments.length, true);
										}
										break;
									}
								}
							}
						}

						oAppointment.begin = oGroupAppointment._iBegin;
						oAppointment.end = oGroupAppointment._iEnd;
						oAppointment.calculatedEnd = oGroupAppointment._iEnd;
						oAppointment.level = oGroupAppointment._iLevel;
						oAppointment.appointment = oGroupAppointment._aAppointments[0];
					} else {
						aVisibleAppointments.splice(i, 1);
						i--;
					}
					this.removeAggregation("groupAppointments", oGroupAppointment);
					oGroupAppointment.destroy();
					aGroupAppointments = this.getAggregation("groupAppointments", []);
				}
			}
		}

		// determine levels after rendering because min. size must be used in calculation

		if (!bFocusIdFound) {
			// focused appointment not visible or no focus set
			if (aVisibleAppointments.length > 0) {
				this._sFocusedAppointmentId = aVisibleAppointments[0].appointment.getId();
			} else  {
				this._sFocusedAppointmentId = undefined;
			}
		}

		this._aVisibleAppointments = aVisibleAppointments;
		return this._aVisibleAppointments;

	}

	function _getGroupAppointment(oDate, oAppointment, sIntervalType, iIntervals, oStartDate, oEndDate, iStartTime, aVisibleAppointments) {

		var aGroupAppointments = this.getAggregation("groupAppointments", []);
		var oGroupAppointment;
		var oLocaleData = _getLocaleData.call(this);
		var iFirstDayOfWeek = oLocaleData.getFirstDayOfWeek();
		var iDay = oDate.getUTCDay();
		var oGroupStartDate = new UniversalDate(oDate.getTime());
		oGroupStartDate.setUTCHours(0);
		oGroupStartDate.setUTCMinutes(0);
		oGroupStartDate.setUTCSeconds(0);
		oGroupStartDate.setUTCMilliseconds(0);

		if (iFirstDayOfWeek <= iDay) {
			oGroupStartDate.setDate(oGroupStartDate.getDate() - (iDay - iFirstDayOfWeek));
		} else {
			oGroupStartDate.setDate(oGroupStartDate.getDate() - (7 - iDay - iFirstDayOfWeek));
		}

		for (var j = 0; j < aGroupAppointments.length; j++) {
			oGroupAppointment = aGroupAppointments[j];
			var oGroupAppointmentStartDate = CalendarUtils._createUniversalUTCDate(oGroupAppointment.getStartDate(), undefined, true);
			if (oGroupAppointmentStartDate.getTime() == oGroupStartDate.getTime()) {
				break;
			}
			oGroupAppointment = undefined;
		}

		if (!oGroupAppointment) {
			var oGroupEndDate = new UniversalDate(oGroupStartDate.getTime());
			oGroupEndDate.setDate(oGroupEndDate.getDate() + 7);
			oGroupEndDate.setMilliseconds(-1);
			oGroupAppointment = new CalendarAppointment(this.getId() + "-Group" + aGroupAppointments.length, {
				type: oAppointment.getType(),
				startDate: CalendarUtils._createLocalDate(UI5Date.getInstance(oGroupStartDate.getTime()), true),
				endDate: CalendarUtils._createLocalDate(UI5Date.getInstance(oGroupEndDate.getTime()), true)
			});
			oGroupAppointment._aAppointments = [];
			this.addAggregation("groupAppointments", oGroupAppointment, true);
			var iBegin = _calculateBegin.call(this, sIntervalType, iIntervals, oStartDate, oEndDate, iStartTime, oGroupStartDate);
			var iEnd = _calculateEnd.call(this, sIntervalType, iIntervals, oStartDate, oEndDate, iStartTime, oGroupEndDate);
			aVisibleAppointments.push({appointment: oGroupAppointment, begin: iBegin, end: iEnd, calculatedEnd: iEnd, level: -1, size: this.getProperty("appointmentHeight")});
		}
		oGroupAppointment._aAppointments.push(oAppointment);
		if (oGroupAppointment.getType() != CalendarDayType.None && oGroupAppointment.getType() != oAppointment.getType()){
			oGroupAppointment.setType(CalendarDayType.None);
		}
		oGroupAppointment.setProperty("title", oGroupAppointment._aAppointments.length, true);

		return oGroupAppointment;

	}

	function _calculateBegin(sIntervalType, iIntervals, oStartDate, oEndDate, iStartTime, oAppointmentStartDate) {

		var iBegin = 0;

		if (sIntervalType != CalendarIntervalType.Month) {
			iBegin =  100 * (oAppointmentStartDate.getTime() - iStartTime) / this._iRowSize;
		} else {
			// as months have different lengths, calculate the % depending on the interval borders
			var oMonthFirstDate = new UniversalDate(oAppointmentStartDate.getTime());
			oMonthFirstDate.setUTCDate(1);
			oMonthFirstDate.setUTCHours(0);
			oMonthFirstDate.setUTCMinutes(0);
			oMonthFirstDate.setUTCSeconds(0);
			oMonthFirstDate.setUTCMilliseconds(0);
			var oMonthLastDate = new UniversalDate(oMonthFirstDate.getTime());
			oMonthLastDate.setUTCMonth(oMonthLastDate.getUTCMonth() + 1);
			oMonthLastDate.setMilliseconds(-1);
			var iMonthSize = oMonthLastDate.getTime() - oMonthFirstDate.getTime();
			var iMyInterval = (oMonthFirstDate.getUTCFullYear() - oStartDate.getUTCFullYear()) * 12 + oMonthFirstDate.getUTCMonth() - oStartDate.getUTCMonth();
			iBegin = (100 * iMyInterval / iIntervals) + (100 * (oAppointmentStartDate.getTime() - oMonthFirstDate.getTime()) / iMonthSize) / iIntervals;
		}

		if (iBegin < 0) {
			iBegin = 0;
		}

		// round because of minimal calculation differences
		iBegin = Math.round(iBegin * 100000) / 100000;

		return iBegin;

	}

	function _calculateEnd(sIntervalType, iIntervals, oStartDate, oEndDate, iStartTime, oAppointmentEndDate) {

		var iEnd = 0;

		if (sIntervalType != CalendarIntervalType.Month) {
			iEnd =  100 - (100 * (oAppointmentEndDate.getTime() - iStartTime) / this._iRowSize);
		} else {
			// as months have different lengths, calculate the % depending on the interval borders
			var oMonthFirstDate = new UniversalDate(oAppointmentEndDate.getTime());
			oMonthFirstDate.setUTCDate(1);
			oMonthFirstDate.setUTCHours(0);
			oMonthFirstDate.setUTCMinutes(0);
			oMonthFirstDate.setUTCSeconds(0);
			oMonthFirstDate.setUTCMilliseconds(0);
			var oMonthLastDate = new UniversalDate(oMonthFirstDate.getTime());
			oMonthLastDate.setUTCMonth(oMonthLastDate.getUTCMonth() + 1);
			oMonthLastDate.setMilliseconds(-1);
			var iMonthSize = oMonthLastDate.getTime() - oMonthFirstDate.getTime();
			var iMyInterval = (oMonthFirstDate.getUTCFullYear() - oStartDate.getUTCFullYear()) * 12 + oMonthFirstDate.getUTCMonth() - oStartDate.getUTCMonth();
			iEnd = 100 - ((100 * iMyInterval / iIntervals) + (100 * (oAppointmentEndDate.getTime() - oMonthFirstDate.getTime()) / iMonthSize) / iIntervals);
		}

		if (iEnd < 0) {
			iEnd = 0;
		}

		// round because of minimal calculation differences
		iEnd = Math.round(iEnd * 100000) / 100000;

		return iEnd;

	}

	/*
	 * returns an array of visible intervalHeaders
	 * each entry is an object with the following properties
	 * - interval: number of the interval
	 * - appointment: the appointment object
	 * - first: interval is the first one displaying the appointment
	 */
	function _determineVisibleIntervalHeaders() {

		var aVisibleIntervalHeaders = [];

		if (this.getShowIntervalHeaders()) {
			// only use appointments in visible time frame for rendering
			var aAppointments = this.getIntervalHeaders();
			var oAppointment;
			var iIntervals = this.getIntervals();
			var sIntervalType = this.getIntervalType();
			var oStartDate = this._getStartDate();
			var iStartTime = oStartDate.getTime();
			var oEndDate = this._oUTCEndDate;
			var iEndTime = oEndDate.getTime();
			var i = 0;
			var j = 0;

			for (i = 0; i < aAppointments.length; i++) {
				oAppointment = aAppointments[i];
				var oAppointmentStartDate = CalendarUtils._createUniversalUTCDate(oAppointment.getStartDate(), undefined, true);
				oAppointmentStartDate.setUTCSeconds(0); // ignore seconds
				oAppointmentStartDate.setUTCMilliseconds(0); // ignore milliseconds
				var oAppointmentEndDate = oAppointment.getEndDate()
					? CalendarUtils._createUniversalUTCDate(oAppointment.getEndDate(), undefined, true)
					: CalendarUtils._createUniversalUTCDate(UI5Date.getInstance(864000000000000), undefined, true); //max date;
				oAppointmentEndDate.setUTCSeconds(0); // ignore seconds
				oAppointmentEndDate.setUTCMilliseconds(0); // ignore milliseconds

				if (oAppointmentStartDate && oAppointmentStartDate.getTime() <= iEndTime &&
						oAppointmentEndDate && oAppointmentEndDate.getTime() >= iStartTime) {
					// appointment is visible in row - check intervals
					var oIntervalStartDate = new UniversalDate(oStartDate.getTime());
					var oIntervalEndDate = new UniversalDate(oStartDate.getTime());
					oIntervalEndDate.setUTCMinutes(oIntervalEndDate.getUTCMinutes() - 1);
					var iFirstInterval = -1;
					var iLastInterval = -1;

					for (j = 0; j < iIntervals; j++) {

						switch (sIntervalType) {
						case CalendarIntervalType.Hour:
							oIntervalEndDate.setUTCHours(oIntervalEndDate.getUTCHours() + 1);
							if (j > 0) {
								oIntervalStartDate.setUTCHours(oIntervalStartDate.getUTCHours() + 1);
							}
							break;

						case CalendarIntervalType.Day:
						case CalendarIntervalType.Week:
						case CalendarIntervalType.OneMonth:
						case "OneMonth":
							oIntervalEndDate.setUTCDate(oIntervalEndDate.getUTCDate() + 1);
							if (j > 0) {
								oIntervalStartDate.setUTCDate(oIntervalStartDate.getUTCDate() + 1);
							}
							break;

						case CalendarIntervalType.Month:
							// as months have different length, go to 1st of next month to determine last of month
							oIntervalEndDate.setUTCDate(1);
							oIntervalEndDate.setUTCMonth(oIntervalEndDate.getUTCMonth() + 2);
							oIntervalEndDate.setUTCDate(0);
							if (j > 0) {
								oIntervalStartDate.setUTCMonth(oIntervalStartDate.getUTCMonth() + 1);
							}
							break;

						default:
							throw new Error("Unknown IntervalType: " + sIntervalType + "; " + this);
						}

						if (oAppointmentStartDate && oAppointmentStartDate.getTime() <= oIntervalStartDate.getTime() &&
								oAppointmentEndDate && oAppointmentEndDate.getTime() >= oIntervalEndDate.getTime()) {
							// interval is completely in appointment
							if (iFirstInterval < 0) {
								iFirstInterval = j;
							}
							iLastInterval = j;
						}
					}
					if (iFirstInterval >= 0) {
						aVisibleIntervalHeaders.push({interval: iFirstInterval, appointment: oAppointment, last: iLastInterval});
					}
				}
			}
		}

		this._aVisibleIntervalHeaders = aVisibleIntervalHeaders;
		return this._aVisibleIntervalHeaders;

	}

	// as the top position of the appointments depends on the rendered height it must be calculated after rendering
	function _positionAppointments() {

		if (this._isOneMonthsRowOnSmallSizes()) {
			return;
		}

		var $Apps = this.$("Apps");
		var iRowWidth = $Apps.innerWidth();

		if (iRowWidth <= 0) {
			// if no size (invisible) do nothing
			return;
		}

		var $DummyApp = this.$("DummyApp");
		var iHeight = $DummyApp.outerHeight(true);

		if (iHeight <= 0) {
			// if no size (theme seems not to be loaded) do nothing
			return;
		}

		var TOP_BOT_APP_MARGIN = 4;
		var iMinWidth = $DummyApp.outerWidth();
		var iMinPercent =  iMinWidth / iRowWidth * 100;
		var iMinPercentCeil =  Math.ceil(1000 * iMinPercent) / 1000;
		var oAppointment;
		var $Appointment;
		var iStaticHeight = 0;
		var iLevels = 0;
		var i = 0;
		var bIntervalContainer = false;
		var iTop;
		var bHorizontalFit = this._needAppointmentHorizontalFit();

		if (this.getShowIntervalHeaders() && (this.getShowEmptyIntervalHeaders() || this._getVisibleIntervalHeaders().length > 0)) {
			iStaticHeight = jQuery(this.$("AppsInt0").children(".sapUiCalendarRowAppsIntHead")[0]).outerHeight(true);
			bIntervalContainer = true;
		}

		// adjust min width
		for (i = 0; i < this._aVisibleAppointments.length; i++) {
			oAppointment = this._aVisibleAppointments[i];
			$Appointment = oAppointment.appointment.$();
			var iPercent = Math.floor(1000 * (100 - oAppointment.calculatedEnd - oAppointment.begin)) / 1000;
			var bChanged = false;

			if (iPercent < iMinPercentCeil) {
				oAppointment.end = 100 - oAppointment.begin - iMinPercent;
				if (oAppointment.end < 0) {
					oAppointment.end = 0;
				}
				bChanged = true;
				$Appointment.addClass("sapUiCalendarAppSmall");
			} else if ($Appointment.hasClass("sapUiCalendarAppSmall")){
				// not longer too small
				oAppointment.end = oAppointment.calculatedEnd;
				bChanged = true;
				$Appointment.removeClass("sapUiCalendarAppSmall");
			}

			if (bChanged) {
				oAppointment.level = -1; // level must be new calculated
			}

			if (bChanged && !bHorizontalFit) {
				if (this._bRTL) {
					$Appointment.css("left", oAppointment.end + "%");
				} else {
					$Appointment.css("right", oAppointment.end + "%");
				}
			}

			// if it is possible to round off the appointment, it is necessary to replace its end value with its pre-calculated
			if (bHorizontalFit) {
				oAppointment.end = oAppointment.calculatedEnd;
			}
		}

		// calculate levels
		for (i = 0; i < this._aVisibleAppointments.length; i++) {
			oAppointment = this._aVisibleAppointments[i];
			$Appointment = oAppointment.appointment.$();
			var oBlockedLevels = {};

			if (oAppointment.level < 0) {
				for (var j = 0; j < this._aVisibleAppointments.length; j++) {
					var oVisibleAppointment = this._aVisibleAppointments[j];
					if (oAppointment != oVisibleAppointment &&
							oAppointment.begin < (Math.floor(1000 * (100 - oVisibleAppointment.end)) / 1000) &&
							(Math.floor(1000 * (100 - oAppointment.end)) / 1000) > oVisibleAppointment.begin &&
							oVisibleAppointment.level >= 0) {
						this._setBlockedLevelsForAppointment(oVisibleAppointment, oBlockedLevels);
					}
				}

				oAppointment.level = this._getAppointmetLevel(oBlockedLevels, oAppointment);

				$Appointment.attr("data-sap-level", oAppointment.level);
			}

			iTop = iHeight * oAppointment.level + iStaticHeight;
			if (!bIntervalContainer) {
				iTop += TOP_BOT_APP_MARGIN;
			}
			$Appointment.css("top", iTop + "px");

			var iAppointmentEndLevel = oAppointment.level;
			iAppointmentEndLevel += this._getAppointmentRowCount(oAppointment) - 1;

			if (iLevels < iAppointmentEndLevel) {
				iLevels = iAppointmentEndLevel;
			}
		}

		iLevels++; // as 0 is a valid level
		iHeight = iHeight * iLevels + iStaticHeight;

		if (!bIntervalContainer) {
			// synchronize row height with content height
			iHeight += TOP_BOT_APP_MARGIN;
		}

		if (!this.getHeight()) {
			// no height set -> determine from rendered levels
			$Apps.outerHeight(iHeight);
		} else {
			// make intervals as large as scroll height
			var aIntervals = this.$("Apps").children(".sapUiCalendarRowAppsInt");
			for (i = 0; i < aIntervals.length; i++) {
				var $Interval = jQuery(aIntervals[i]);
				$Interval.outerHeight(iHeight);
			}
		}

		// hide dummy appointment
		$DummyApp.css("display", "none");

	}

	function _selectAppointment(oAppointment, bRemoveOldSelection) {

		var i = 0;
		var oApp;
		var sAriaDescribedBy;
		var sAriaDescribedByNotSelected;
		var sCurrentAriaDescribedBy;
		var sCurrentAriaDescribedBySelected;
		var sCurrentAriaDescribedByNotSelected;
		var sSelectedTextId = InvisibleText.getStaticId("sap.ui.unified", "APPOINTMENT_SELECTED");
		var bSelect = !oAppointment.getSelected();

		if (bRemoveOldSelection) {
			var aAppointments = this.getAppointments();
			var aGroupAppointments = this.getAggregation("groupAppointments", []);
			jQuery.merge(aAppointments, aGroupAppointments);

			// update the other appointments
			for (i = 0; i < aAppointments.length; i++) {
				oApp = aAppointments[i];
				if (oApp.getId() !== oAppointment.getId() && oApp.getSelected()) {
					oApp.setProperty("selected", false, true); // do not invalidate CalendarRow
					oApp.$().removeClass("sapUiCalendarAppSel");
					for (var j = 0; j < this.aSelectedAppointments.length; j++) {
						if (this.aSelectedAppointments[j] !== oApp.getId()){
							this.aSelectedAppointments.splice(j);
						}
					}
					sAriaDescribedBy = oApp.$().attr("aria-describedby");
					sAriaDescribedByNotSelected = sAriaDescribedBy ? sAriaDescribedBy.replace(sSelectedTextId, "") : "";
					oApp.$().attr("aria-describedby", sAriaDescribedByNotSelected);
				}
			}
		}

		sCurrentAriaDescribedBy = oAppointment.$().attr("aria-describedby");
		sCurrentAriaDescribedByNotSelected = (sCurrentAriaDescribedBy ? sCurrentAriaDescribedBy.replace(sSelectedTextId, "") : "").trim();
		sCurrentAriaDescribedBySelected = (sCurrentAriaDescribedByNotSelected + " " + sSelectedTextId).trim();

		if (oAppointment.getSelected()) {
			oAppointment.setProperty("selected", false, true); // do not invalidate CalendarRow
			oAppointment.$().removeClass("sapUiCalendarAppSel");
			if (sCurrentAriaDescribedByNotSelected) {
				oAppointment.$().attr("aria-describedby", sCurrentAriaDescribedByNotSelected);
			} else {
				oAppointment.$().removeAttr("aria-describedby");
			}
			_removeAllAppointmentSelections(this, bRemoveOldSelection);
		} else {
			oAppointment.setProperty("selected", true, true); // do not invalidate CalendarRow
			oAppointment.$().addClass("sapUiCalendarAppSel");
			oAppointment.$().attr("aria-describedby", sCurrentAriaDescribedBySelected);
			_removeAllAppointmentSelections(this, bRemoveOldSelection);
		}
		// removes or adds the selected appointments from this.aSelectedAppointments
		this._updateSelectedAppointmentsArray(oAppointment);

		if (oAppointment._aAppointments) {
			// it's a group Appointment
			for (i = 0; i < oAppointment._aAppointments.length; i++) {
				oApp = oAppointment._aAppointments[i];
				oApp.setProperty("selected", bSelect, true); // do not invalidate CalendarRow
			}
			this.fireSelect({
				appointments: oAppointment._aAppointments,
				multiSelect: !bRemoveOldSelection,
				domRefId: oAppointment.getId()
			});
		} else {
			this.fireSelect({
				appointment: oAppointment,
				multiSelect: !bRemoveOldSelection,
				domRefId: oAppointment.getId()
			});
		}

	}

	/**
	* Informs the PlanningCalendar that deselections might have to be made regarding all rows
	* @private
	*/
	function _informPlanningCalendar(sFuncName){
		var oPC = this._getPlanningCalendar();

		if (oPC) { //it may be a PC object or undefined
			oPC["_onRow" + sFuncName]();
		}
	}

	CalendarRow.prototype._needAppointmentHorizontalFit = function (){
		var oPC = this._getPlanningCalendar(),
			sKey,
			oView,
			iIntervals;

		if (!oPC || this.getAppointmentRoundWidth() === CalendarAppointmentRoundWidth.None) {
			return false;
		}

		sKey = oPC.getViewKey();
		oView = oPC._getView(sKey);
		iIntervals = oPC._getIntervals(oView);

		return iIntervals >= 20;
	};

	CalendarRow.prototype._setHorizontalRoundingWidth = function(oAppointment, oAppointmentStartDate, oAppointmentEndDate) {
		var iRound;
		switch (this.getAppointmentRoundWidth()) {
			case CalendarAppointmentRoundWidth.HalfColumn :
				iRound = 12;
			break;
		}
		this._roundAppointment(oAppointment, oAppointmentStartDate, oAppointmentEndDate, iRound);
	};

	CalendarRow.prototype._roundAppointment = function(oAppointment, oAppointmentStartDate, oAppointmentEndDate,iRound) {
		var iNewStartHour,
			iNewEndHour;

			iNewStartHour = oAppointment.getStartDate().getHours() - oAppointment.getStartDate().getHours() % iRound;
			oAppointmentStartDate.setUTCHours(iNewStartHour);
			oAppointmentStartDate.setUTCMinutes(0);
			oAppointmentStartDate.setUTCSeconds(0);
			oAppointmentStartDate.setUTCMilliseconds(0);

			iNewEndHour = oAppointment.getEndDate().getHours() - oAppointment.getEndDate().getHours() % iRound + iRound;
			oAppointmentEndDate.setUTCHours(iNewEndHour);
			oAppointmentEndDate.setUTCMinutes(0);
			oAppointmentEndDate.setUTCSeconds(0);
			oAppointmentEndDate.setUTCMilliseconds(0);
	};

	CalendarRow.prototype._setBlockedLevelsForAppointment = function (oVisibleAppointment, oBlockedLevels) {
		var iBlockedLevels = this._getAppointmentRowCount(oVisibleAppointment);
		for (var iLevels = 0; iLevels < iBlockedLevels; iLevels++) {
			oBlockedLevels[oVisibleAppointment.level + iLevels] = true;
		}
		return oBlockedLevels;
	};

	CalendarRow.prototype._getAppointmentRowCount = function (oVisibleAppointment){
		var iBlockedLevels,
			bReducedHeight = this._getAppointmentReducedHeight(oVisibleAppointment);
		switch (oVisibleAppointment.size) {
			case CalendarAppointmentHeight.HalfSize :
				iBlockedLevels = 1;
				break;
			case CalendarAppointmentHeight.Regular :
				iBlockedLevels = 2;
				if (bReducedHeight && !oVisibleAppointment.appointment.getText() && !oVisibleAppointment.appointment.getDescription() ) {
					iBlockedLevels = 1;
				}
				break;
			case CalendarAppointmentHeight.Large :
				iBlockedLevels = 3;
				break;
			case CalendarAppointmentHeight.Automatic :
				iBlockedLevels = 1;
				if (oVisibleAppointment.appointment.getText()) {
					iBlockedLevels += 1;
				}
				if (oVisibleAppointment.appointment.getDescription()) {
					iBlockedLevels += 1;
				}
				break;
		}

		return iBlockedLevels;
	};

	CalendarRow.prototype._getAppointmetLevel = function (oBlockedLevels, oAppointment){
		var iAppointmentLevel = 0;
		var iNeedFreeLevel = this._getAppointmentRowCount(oAppointment);
		var bFoundSlots = true;
		while (bFoundSlots) {
			bFoundSlots = this._isPosibleToPositionAppointment(iAppointmentLevel,oBlockedLevels, iNeedFreeLevel);
			if (!bFoundSlots) {
				bFoundSlots = true;
				iAppointmentLevel += 1;
			} else {
				bFoundSlots = false;
			}
		}
		return iAppointmentLevel;
	};

	CalendarRow.prototype._isPosibleToPositionAppointment = function(iAppointmentLevel, oBlockedLevels, iNeedFreeLevel){
		for (var p = iAppointmentLevel; p < iNeedFreeLevel + iAppointmentLevel; p++) {
			if (oBlockedLevels[p]) {
				return false;
			}
		}
		return true;
	};

	/**
	* Checks if there's a PlanningCalendar or not
	* returns {sap.m.PlanningCalendar}
	* @private
	*/
	CalendarRow.prototype._getPlanningCalendar = function () {
		var oParent = this;

		while (oParent.getParent() !== null) {
			if (oParent.isA("sap.m.PlanningCalendar")) {
				return oParent;
			}
			oParent = oParent.getParent();
		}
	};

	/**
	 * Hook for controls that extend the sap.ui.unified.CalendarRow control.
	 * Checks whether an interval representing a day as part of a row will be displayed as non working.
	 * @private
	 * @param {int} iInterval The interval number representing a day as part of a row.
	 * @param {array} aNonWorkingItems The interval number representing a day as part of a row.
	 * @param {int} iStartOffset The interval index based on the start date of the view.
	 * @param {int} iNonWorkingMax The non working maximal index based on the view.
	 * @returns {boolean}
	 */
	CalendarRow.prototype._isNonWorkingInterval = function (iInterval, aNonWorkingItems, iStartOffset, iNonWorkingMax) {
		return aNonWorkingItems.includes((iInterval + iStartOffset) % iNonWorkingMax);
	};

	/**
	* Handles the situation when more than one appointment are selected and they must be deselected
	* when a single one is selected afterwards
	* @private
	*/
	function _removeAllAppointmentSelections(that, bRemoveOldSelection){
		if (bRemoveOldSelection) { //if !oEvent.ctrlKey
			_informPlanningCalendar.call(that, "DeselectAppointment");
		}
	}

	function _checkAppointmentInGroup(sId) {

		var aGroupAppointments = this.getAggregation("groupAppointments", []);
		var oGroupAppointment;
		var bFound = false;

		for (var i = 0; i < aGroupAppointments.length; i++) {
			var aInternalAppointments = aGroupAppointments[i]._aAppointments;
			for (var j = 0; j < aInternalAppointments.length; j++) {
				if (aInternalAppointments[j].getId() == sId) {
					oGroupAppointment = aGroupAppointments[i];
					bFound = true;
					break;
				}
			}
			if (bFound) {
				break;
			}
		}

		return oGroupAppointment;

	}

	function _focusAppointment(sId) {

		if (this._sFocusedAppointmentId != sId) {
			var aAppointments = this._getAppointmentsSorted();
			var aVisibleAppointments = this._aVisibleAppointments;
			var oAppointment;
			var i = 0;

			// check if groupAppointment
			oAppointment = _checkAppointmentInGroup.call(this, sId);
			if (oAppointment) {
				sId = oAppointment.getId();
				oAppointment = undefined;
			}

			for (i = 0; i < aVisibleAppointments.length; i++) {
				if (aVisibleAppointments[i].appointment.getId() == sId) {
					oAppointment = aVisibleAppointments[i].appointment;
					break;
				}
			}

			if (oAppointment) {
				var $OldAppointment = this.getFocusedAppointment().$();
				var $Appointment = oAppointment.$();
				this._sFocusedAppointmentId = oAppointment.getId();
				$OldAppointment.attr("tabindex", "-1");
				$Appointment.attr("tabindex", "0");
				$Appointment.trigger("focus");
			} else  {
				// appointment not visible -> find it and show it
				for (i = 0; i < aAppointments.length; i++) {
					if (aAppointments[i].getId() == sId) {
						oAppointment = aAppointments[i];
						break;
					}
				}

				if (oAppointment) {
					this._sFocusedAppointmentId = oAppointment.getId();
					var oUTCStartDate = _calculateStartDate.call(this, oAppointment.getStartDate());
					this.setStartDate(CalendarUtils._createLocalDate(oUTCStartDate, true));
					if (!containsOrEquals(this.getDomRef(), document.activeElement)) {
						// focus is outside control -> set focus after rerendering
						setTimeout(function(){
							this.getFocusedAppointment().focus();
						}.bind(this), 0);
					}
					this.fireStartDateChange();
				}
			}
		}

	}

	function _navigateToAppointment(bForward, iStep) {

		var sId = this._sFocusedAppointmentId;
		var aAppointments = this._getAppointmentsSorted();
		var aGroupAppointments = this.getAggregation("groupAppointments", []);
		var oAppointment;
		var iIndex = 0;
		var i = 0;

		// check if groupAppointment
		for (i = 0; i < aGroupAppointments.length; i++) {
			if (aGroupAppointments[i].getId() == sId) {
				var aInternalAppointments = aGroupAppointments[i]._aAppointments;
				if (bForward) {
					sId = aInternalAppointments[aInternalAppointments.length - 1].getId();
				} else {
					sId = aInternalAppointments[0].getId();
				}
				break;
			}
		}

		for (i = 0; i < aAppointments.length; i++) {
			if (aAppointments[i].getId() == sId) {
				iIndex = i;
				break;
			}
		}

		if (bForward) {
			iIndex = iIndex + iStep;
		} else {
			iIndex = iIndex - iStep;
		}

		if (iIndex < 0) {
			iIndex = 0;
		} else if (iIndex >= aAppointments.length) {
			iIndex = aAppointments.length - 1;
		}

		oAppointment = aAppointments[iIndex];
		_focusAppointment.call(this, oAppointment.getId());

	}

	function _handleHomeEnd(oEvent) {

		// focus first appointment of the day/month/year
		// if already focused, fire leaveRow event
		var aAppointments = this._getAppointmentsSorted();
		var oAppointment;
		var oStartDate = new UniversalDate(this._getStartDate());
		var oEndDate = new UniversalDate(this._oUTCEndDate);
		var sIntervalType = this.getIntervalType();
		var sId;
		var oGroupAppointment;

		oStartDate.setUTCHours(0);
		oEndDate.setUTCHours(0);
		oEndDate.setUTCMinutes(0);
		oEndDate.setUTCSeconds(0);

		switch (sIntervalType) {
		case CalendarIntervalType.Hour:
			oEndDate.setUTCDate(oEndDate.getUTCDate() + 1);
			oEndDate.setUTCMilliseconds(-1);
			break;

		case CalendarIntervalType.Day:
		case CalendarIntervalType.Week:
		case CalendarIntervalType.OneMonth:
		case "OneMonth":
			oStartDate.setUTCDate(1);
			oEndDate.setUTCMonth(oEndDate.getUTCMonth() + 1);
			oEndDate.setUTCDate(1);
			oEndDate.setUTCMilliseconds(-1);
			break;

			case CalendarIntervalType.Month:
			oStartDate.setUTCMonth(0);
			oStartDate.setUTCDate(1);
			oEndDate.setUTCFullYear(oEndDate.getUTCFullYear() + 1);
			oEndDate.setUTCMonth(1);
			oEndDate.setUTCDate(1);
			oEndDate.setUTCMilliseconds(-1);
			break;

		default:
			throw new Error("Unknown IntervalType: " + sIntervalType + "; " + this);
		}

		var oLocalStartDate = CalendarUtils._createLocalDate(oStartDate, true);
		var oLocalEndDate = CalendarUtils._createLocalDate(oEndDate, true);
		for (var i = 0; i < aAppointments.length; i++) {
			if (aAppointments[i].getStartDate() >= oLocalStartDate && aAppointments[i].getStartDate() <= oLocalEndDate) {
				oAppointment = aAppointments[i];
				sId = oAppointment.getId();
				if (oEvent.type == "saphome") {
					break;
				}
			} else if (aAppointments[i].getStartDate() > oLocalEndDate) {
				break;
			}
		}

		// check if groupAppointment
		oGroupAppointment = _checkAppointmentInGroup.call(this, sId);
		if (oGroupAppointment) {
			oAppointment = oGroupAppointment;
			sId = oAppointment.getId();
		}

		if (sId && sId != this._sFocusedAppointmentId) {
			_focusAppointment.call(this, sId);
		} else if (oEvent._bPlanningCalendar && oAppointment) {
			oAppointment.focus();
		} else {
			this.fireLeaveRow({type: oEvent.type});
		}

	}

	function _selectInterval(iInterval, oDomRef){

		var sIntervalType = this.getIntervalType();
		var oStartDate = this._getStartDate();
		var oIntervalStartDate = new UniversalDate(oStartDate.getTime());
		var oIntervalEndDate;
		var bSubInterval = false;
		var iSubInterval = 0;
		var iSubIntervals = 0;

		if (jQuery(oDomRef).hasClass("sapUiCalendarRowAppsSubInt")) {
			// it's a sub-interval
			bSubInterval = true;
			var aSubIntervals = jQuery(jQuery(oDomRef).parent()).children(".sapUiCalendarRowAppsSubInt");
			iSubIntervals = aSubIntervals.length;
			for (iSubInterval = 0; iSubInterval < iSubIntervals; iSubInterval++) {
				var oSubInterval = aSubIntervals[iSubInterval];
				if (oSubInterval == oDomRef) {
					break;
				}
			}

		}

		// calculate with hours, days and months and not timestamps and millisecons because of rounding issues
		switch (sIntervalType) {
		case CalendarIntervalType.Hour:
			oIntervalStartDate.setUTCHours(oIntervalStartDate.getUTCHours() + iInterval);
			if (bSubInterval) {
				oIntervalStartDate.setUTCMinutes(oIntervalStartDate.getUTCMinutes() + iSubInterval * 60 / iSubIntervals);
				oIntervalEndDate = new UniversalDate(oIntervalStartDate.getTime());
				oIntervalEndDate.setUTCMinutes(oIntervalEndDate.getUTCMinutes() + 60 / iSubIntervals);
			} else {
				oIntervalEndDate = new UniversalDate(oIntervalStartDate.getTime());
				oIntervalEndDate.setUTCHours(oIntervalEndDate.getUTCHours() + 1);
			}
			break;

		case CalendarIntervalType.Day:
		case CalendarIntervalType.Week:
		case CalendarIntervalType.OneMonth:
		case "OneMonth":
			oIntervalStartDate.setUTCDate(oIntervalStartDate.getUTCDate() + iInterval);
			if (bSubInterval) {
				oIntervalStartDate.setUTCHours(oIntervalStartDate.getUTCHours() + iSubInterval * 24 / iSubIntervals);
				oIntervalEndDate = new UniversalDate(oIntervalStartDate.getTime());
				oIntervalEndDate.setUTCHours(oIntervalEndDate.getUTCHours() + 24 / iSubIntervals);
			} else {
				oIntervalEndDate = new UniversalDate(oIntervalStartDate.getTime());
				oIntervalEndDate.setUTCDate(oIntervalEndDate.getUTCDate() + 1);
			}
			break;

		case CalendarIntervalType.Month:
			oIntervalStartDate.setUTCMonth(oIntervalStartDate.getUTCMonth() + iInterval);
			if (bSubInterval) {
				oIntervalStartDate.setUTCDate(oIntervalStartDate.getUTCDate() + iSubInterval);
				oIntervalEndDate = new UniversalDate(oIntervalStartDate.getTime());
				oIntervalEndDate.setUTCDate(oIntervalEndDate.getUTCDate() + 1);
			} else {
				oIntervalEndDate = new UniversalDate(oIntervalStartDate.getTime());
				oIntervalEndDate.setUTCMonth(oIntervalEndDate.getUTCMonth() + 1);
			}
			break;

		default:
			throw new Error("Unknown IntervalType: " + sIntervalType + "; " + this);
		}

		oIntervalEndDate.setUTCMilliseconds(oIntervalEndDate.getUTCMilliseconds() - 1);

		oIntervalStartDate = CalendarUtils._createLocalDate(oIntervalStartDate, true);
		oIntervalEndDate = CalendarUtils._createLocalDate(oIntervalEndDate, true);

		this.fireIntervalSelect({startDate: oIntervalStartDate, endDate: oIntervalEndDate, subInterval: bSubInterval});

	}

	function _fnDefaultAppointmentsSorter(oApp1, oApp2) {
		var iResult = oApp1.getStartDate() - oApp2.getStartDate();
		if (iResult == 0) {
			// same start date -> longest appointment should be on top
			iResult = oApp2.getEndDate() - oApp1.getEndDate();
		}
		return iResult;
	}

	return CalendarRow;

});
