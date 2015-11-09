/*!
 * ${copyright}
 */

// Provides control sap.ui.unified.Calendar.
sap.ui.define(['jquery.sap.global', 'sap/ui/core/Control', 'sap/ui/core/LocaleData', 'sap/ui/model/type/Date', 'sap/ui/unified/calendar/CalendarUtils',
               'sap/ui/core/date/UniversalDate', './library'],
	function(jQuery, Control, LocaleData, Date1, CalendarUtils, UniversalDate, library) {
	"use strict";

	/*
	 * <code>UniversalDate</code> objects are used inside the <code>CalendarRow</code>, whereas JavaScript dates are used in the API.
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
	 * A calendar row with an header and appointments. The Appointments will be placed in the defined interval.
	 * @extends sap.ui.core.Control
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.34.0
	 * @alias sap.ui.unified.CalendarRow
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var CalendarRow = Control.extend("sap.ui.unified.CalendarRow", /** @lends sap.ui.unified.CalendarRow.prototype */ { metadata : {

		library : "sap.ui.unified",
		properties : {

			/**
			 * Start date, as JavaScript Date object, of the row. As default the current date is used.
			 */
			startDate : {type : "object", group : "Data"},

			/**
			 * Number of displayed intervals. The size of the intervals defined with <code>intervalType</code>
			 */
			intervals : {type : "int", group : "Appearance", defaultValue : 12},

			/**
			 * Type of the intervals of the row. The default is one hour.
			 */
			intervalType : {type : "sap.ui.unified.CalendarIntervalType", group : "Appearance", defaultValue : sap.ui.unified.CalendarIntervalType.Hour},

			/**
			 * If set subintervals are shown.
			 *
			 * If the interval type is <code>Hour</code> quarter hours are shown.
			 *
			 * If the interval type is <code>Day</code> hours are shown.
			 *
			 * If the interval type is <code>Month</code> days are shown.
			 */
			showSubIntervals : {type : "boolean", group : "Appearance", defaultValue : false},

			/**
			 * If set interval headers are shown even if no <code>intervalHeaders</code> are assigned to the visible time frame.
			 *
			 * If not set no interval headers are shown even if <code>intervalHeaders</code> are assigned.
			 */
			showIntervalHeaders : {type : "boolean", group : "Appearance", defaultValue : true},

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
			 * If set the <code>CalendarRow</code> checks for resize by itself.
			 *
			 * If a lot of <code>CalendarRow</code> controls are used in one container control (like <code>PlanningCalendar</code>)
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
			updateCurrentTime : {type : "boolean", group : "Behavior", defaultValue : true}
		},
		aggregations : {

			/**
			 * Appointments to be displayed in the row. Appointments outside the visible time frame are not rendered.
			 *
			 * <b>Note</b> For performance reasons only appointments in the visible time range or nearby should be assigned.
			 */
			appointments : {type : "sap.ui.unified.CalendarAppointment", multiple : true, singularName : "appointment"},

			/**
			 * Appointments to be displayed in the top of the intervals. The <code>intervalHeaders</code> are used to visualize
			 * public holidays and similar things.
			 *
			 * Appointments outside the visible time frame are not rendered.
			 *
			 * The <code>intervalHeaders</code> always fill whole intervals. If they are shorter that one interval they are not displayed.
			 *
			 * <b>Note</b> For performance reasons only appointments in the visible time range or nearby should be assigned.
			 */
			intervalHeaders : {type : "sap.ui.unified.CalendarAppointment", multiple : true, singularName : "intervalHeader"},

			groupAppointments : {type : "sap.ui.unified.CalendarAppointment", multiple : true, singularName : "groupAppointment", visibility : "hidden"}

		},
		associations: {

			/**
			 * Association to controls / IDs which label this control (see WAI-ARIA attribute aria-labelledby).
			 */
			ariaLabelledBy: { type: "sap.ui.core.Control", multiple: true, singularName: "ariaLabelledBy" }
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
					 * If set the appointment was selected by multiple selection (e.g. shift + mouse click).
					 * So more than the current appointment could be selected.
					 */
					multiSelect : {type : "boolean"}
				}
			},

			/**
			 * <code>startDate</code> was changed while navigation in <code>CalendarRow</code>
			 */
			startDateChange : {},

			/**
			 * The <code>CalendarRow</code> should be left while navigation. (Arrow up or arrow down.)
			 * The caller must determine what next control should be focused
			 */
			leaveRow : {
				parameters : {
					/**
					 * The type of the event that triggers this event
					 */
					type : {type : "string"}
				}
			}
		}
	}});

	(function() {

		CalendarRow.prototype.init = function(){

			this._bRtl  = sap.ui.getCore().getConfiguration().getRTL();

			this._iHoursMinDelta = 1; // minutes - to position appointments in 1 minutes steps
			this._iDaysMinDelta = 30; // minutes
			this._iMonthsMinDelta = 720; // minutes
			this._aVisibleAppointments = [];
			this._aVisibleIntervalHeaders = [];

			this.setStartDate(new Date());

			this._resizeProxy = jQuery.proxy(this.handleResize, this);

		};

		CalendarRow.prototype.exit = function(){

			if (this._sResizeListener) {
				sap.ui.core.ResizeHandler.deregister(this._sResizeListener);
				this._sResizeListener = undefined;
			}

			if (this._sUpdateCurrentTime) {
				jQuery.sap.clearDelayedCall(this._sUpdateCurrentTime);
				this._sUpdateCurrentTime = undefined;
			}

		};

		CalendarRow.prototype.onBeforeRendering = function(){

			_calculateIntervals.call(this);
			_determineVisibleAppointments.call(this);
			_determineVisibleIntervalHeaders.call(this);

			if (this._sUpdateCurrentTime) {
				jQuery.sap.clearDelayedCall(this._sUpdateCurrentTime);
				this._sUpdateCurrentTime = undefined;
			}

		};

		CalendarRow.prototype.onAfterRendering = function(){

			_positionAppointments.call(this);
			this.updateCurrentTimeVisualization();

			if (this.getCheckResize() && !this._sResizeListener) {
				this._sResizeListener = sap.ui.core.ResizeHandler.register(this, this._resizeProxy);
			}

		};

		CalendarRow.prototype.setStartDate = function(oStartDate){

			if (!oStartDate) {
				//set default value
				oStartDate = new Date();
			}

			if (!(oStartDate instanceof Date)) {
				throw new Error("Date must be a JavaScript date object; " + this);
			}

			var iYear = oStartDate.getFullYear();
			if (iYear < 1 || iYear > 9999) {
				throw new Error("Date must not be in valid range (between 0001-01-01 and 9999-12-31); " + this);
			}

			this.setProperty("startDate", oStartDate);

			return this;

		};

		CalendarRow.prototype._getStartDate = function(){

			if (!this._oUTCStartDate) {
				this._oUTCStartDate = CalendarUtils._createUniversalUTCDate(this.getStartDate(), true);
			}

			return this._oUTCStartDate;
		};

		CalendarRow.prototype.setIntervalType = function(sIntervalType){

			this.setProperty("intervalType", sIntervalType);

			// as min. interval size changes and the min. delta, the old levels can not be reused
			this._aVisibleAppointments = [];

			return this;

		};

		CalendarRow.prototype.onfocusin = function(oEvent) {

			if (jQuery(oEvent.target).hasClass("sapUiCalendarApp")) {
				// focus on appointment
				_focusAppointment.call(this, oEvent.target.id);
			} else {
				// focus somewhere else -> focus appointment
				this.getFocusedAppointment().focus();
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
			var aVisibleAppointments = this._getVisibleAppointments();

			for (var i = 0; i < aVisibleAppointments.length; i++) {
				var oAppointment = aVisibleAppointments[i].appointment;
				if (jQuery.sap.containsOrEquals(oAppointment.getDomRef(), oEvent.target)) {
					_selectAppointment.call(this, oAppointment, !oEvent.ctrlKey);
					break;
				}
			}

			//to prevent bubbling into PlanningCalendar
			oEvent.stopPropagation();
			oEvent.preventDefault();

		};

		CalendarRow.prototype.onclick = function(oEvent) {

			this.onsapselect(oEvent);

		};

		CalendarRow.prototype.onsapselectmodifiers = function(oEvent){

			this.onsapselect(oEvent);

		};

		/**
		 * After a resize of the <code>CalendarRow</code> some calculations for appointment
		 * sizes are needed.
		 *
		 * For this each <code>CalendarRow</code> can trigger the resize check for it's own DOM.
		 * But if multiple <code>CalendarRow</code>s are used in one container (e.G. <code>PlanningCalendar</code>)
		 * it is better if the container triggers the resize check once an then calls this function
		 * of each <code>CalendarRow</code>.
		 *
		 * @returns {sap.ui.unified.CalendarRow} <code>this</code> to allow method chaining
		 * @public
		 */
		CalendarRow.prototype.handleResize = function() {

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
		 * For this each <code>CalendarRow</code> can trigger a timer.
		 * But if multiple <code>CalendarRow</code>s are used in one container (e.G. <code>PlanningCalendar</code>)
		 * it is better if the container triggers the interval once an then calls this function
		 * of each <code>CalendarRow</code>.
		 *
		 * @returns {sap.ui.unified.CalendarRow} <code>this</code> to allow method chaining
		 * @public
		 */
		CalendarRow.prototype.updateCurrentTimeVisualization = function() {

			var $Now = this.$("Now");
			var oNowDate = CalendarUtils._createUniversalUTCDate(new Date(), true);
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
					case sap.ui.unified.CalendarIntervalType.Hour:
						iTime = 60000;
						break;

					case sap.ui.unified.CalendarIntervalType.Day:
						iTime = 1800000;
						break;

					default:
						iTime = -1; // not needed
					break;
					}

					if (iTime > 0) {
						this._sUpdateCurrentTime = jQuery.sap.delayedCall(iTime, this, this.updateCurrentTimeVisualization);
					}
				}
			}else {
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

			var aAppointments = _getAppointmentsSorted.call(this);
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
		 * @param {CalendarAppointment} oAppointment Appointment to be focused.
		 * @returns {sap.ui.unified.CalendarRow} <code>this</code> to allow method chaining
		 * @public
		 */
		CalendarRow.prototype.focusAppointment = function(oAppointment) {

			if (!oAppointment || !(oAppointment instanceof sap.ui.unified.CalendarAppointment)) {
				throw new Error("Appointment must be a CalendarAppointment; " + this);
			}

			var sId = oAppointment.getId();
			if (this._sFocusedAppointmentId != sId) {
				_focusAppointment.call(this, sId);
			}else {
				oAppointment.focus();
			}

			return this;

		};

		/**
		 * Focus the <code>CalendarAppointment</code> in the <code>CalendarRow</code> that is nearest to
		 * the given date.
		 *
		 * @param {object} oDate Javascript Date object.
		 * @returns {sap.ui.unified.CalendarRow} <code>this</code> to allow method chaining
		 * @public
		 */
		CalendarRow.prototype.focusNearestAppointment = function(oDate) {

			if (!oDate || !(oDate instanceof Date)) {
				throw new Error("Date must be a JavaScript date object; " + this);
			}

			var aAppointments = _getAppointmentsSorted.call(this);
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
			}else if (!jQuery.isArray(aNonWorkingDays)) {
				aNonWorkingDays = [];
			}

			return aNonWorkingDays;

		};

		function _getLocale(){

			if (!this._sLocale) {
				this._sLocale = sap.ui.getCore().getConfiguration().getFormatSettings().getFormatLocale().toString();
			}

			return this._sLocale;

		}

		function _getLocaleData(){

			if (!this._oLocaleData) {
				var sLocale = _getLocale.call(this);
				var oLocale = new sap.ui.core.Locale(sLocale);
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
			case sap.ui.unified.CalendarIntervalType.Hour:
				oEndDate = new UniversalDate(this._oUTCStartDate.getTime());
				oEndDate.setUTCHours(oEndDate.getUTCHours() + iIntervals);
				this._iMinDelta = this._iHoursMinDelta;
				break;

			case sap.ui.unified.CalendarIntervalType.Day:
				oEndDate = new UniversalDate(this._oUTCStartDate.getTime());
				oEndDate.setUTCDate(oEndDate.getUTCDate() + iIntervals);
				this._iMinDelta = this._iDaysMinDelta;
				break;

			case sap.ui.unified.CalendarIntervalType.Month:
				oEndDate = new UniversalDate(this._oUTCStartDate.getTime());
				oEndDate.setUTCMonth(oEndDate.getUTCMonth() + iIntervals);
				this._iMinDelta = this._iMonthsMinDelta;
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
		 * @param {object} oDate JavaScript date object
		 * @returns {UniversalDate} Start date for date object
		 */
		function _calculateStartDate(oDate) {

			var sIntervalType = this.getIntervalType();
			var oUTCStartDate = CalendarUtils._createUniversalUTCDate(oDate, true);

			switch (sIntervalType) {
			case sap.ui.unified.CalendarIntervalType.Hour:
				oUTCStartDate.setUTCMinutes(0);
				oUTCStartDate.setUTCSeconds(0);
				oUTCStartDate.setUTCMilliseconds(0);
				break;

			case sap.ui.unified.CalendarIntervalType.Day:
				oUTCStartDate.setUTCHours(0);
				oUTCStartDate.setUTCMinutes(0);
				oUTCStartDate.setUTCSeconds(0);
				oUTCStartDate.setUTCMilliseconds(0);
				break;

			case sap.ui.unified.CalendarIntervalType.Month:
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
		 * returns a array of visible appointments
		 * each entry is an object with the following properties
		 * - appointment: the appointment object
		 * - begin: begin position in %
		 * - end: end position in %
		 * - level: level of the appointment to not overlap
		 */
		function _determineVisibleAppointments() {

			// only use appointments in visible time frame for rendering
			var aOldVisibleAppointments = this._aVisibleAppointments || [];
			var aAppointments = _getAppointmentsSorted.call(this);
			var oAppointment;
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

			this.destroyAggregation("groupAppointments", true);

			for (i = 0; i < aAppointments.length; i++) {
				oAppointment = aAppointments[i];
				var oAppointmentStartDate = CalendarUtils._createUniversalUTCDate(oAppointment.getStartDate(), true);
				oAppointmentStartDate.setUTCSeconds(0); // ignore seconds
				oAppointmentStartDate.setUTCMilliseconds(0); // ignore milliseconds
				var oAppointmentEndDate = CalendarUtils._createUniversalUTCDate(oAppointment.getEndDate(), true);
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

				// adjust start date to min. delta
				var iStartMinutes = oAppointmentStartDate.getUTCHours() * 60 + oAppointmentStartDate.getUTCMinutes();
				oAppointmentStartDate.setUTCMinutes(oAppointmentStartDate.getUTCMinutes() - (iStartMinutes % this._iMinDelta));

				var iDelta = (oAppointmentEndDate.getTime() - oAppointmentStartDate.getTime()) / 60000;
				if (bCut && iDelta == 0) {
					// no size after cut -> e.g. starts in past and ends exactly on startDate
					continue;
				}

				var iBegin = 0;
				var iEnd = 0;
				var iLevel = -1;

				if (oAppointmentStartDate && oAppointmentStartDate.getTime() <= iEndTime &&
						oAppointmentEndDate && oAppointmentEndDate.getTime() >= iStartTime) {
					if (sIntervalType == sap.ui.unified.CalendarIntervalType.Month && oAppointmentEndDate.getTime() - oAppointmentStartDate.getTime() < 604800000) {
						// in month mode, group appointment < one week

						var oGroupAppointment = _getGroupAppointment.call(this, oAppointmentStartDate, oAppointment, sIntervalType, iIntervals, oStartDate, oEndDate, iStartTime, aVisibleAppointments);
						var oGroupEndDate = CalendarUtils._createUniversalUTCDate(oGroupAppointment.getEndDate(), true);

						if (oAppointmentEndDate.getTime() > oGroupEndDate.getTime()) {
							// appointment ends in next group
							_getGroupAppointment.call(this, oAppointmentEndDate, oAppointment, sIntervalType, iIntervals, oStartDate, oEndDate, iStartTime, aVisibleAppointments);
						}

						continue;
					}

					iBegin = _calculateBegin.call(this, sIntervalType, iIntervals, oStartDate, oEndDate, iStartTime, oAppointmentStartDate);
					iEnd = _calculateEnd.call(this, sIntervalType, iIntervals, oStartDate, oEndDate, iStartTime, oAppointmentEndDate);

					// check if displayed before -> keep level
					for (j = 0; j < aOldVisibleAppointments.length; j++) {
						var oOldAppointment = aOldVisibleAppointments[j];
						if (oAppointment == oOldAppointment.appointment) {
							iLevel = oOldAppointment.level;
						}
					}
					aVisibleAppointments.push({appointment: oAppointment, begin: iBegin, end: iEnd, calculatedEnd: iEnd, level: iLevel});

					if (this._sFocusedAppointmentId && this._sFocusedAppointmentId == oAppointment.getId()) {
						bFocusIdFound = true;
					}
				}
			}

			// determine levels after rendering because min. size must be used in calculation

			if (!bFocusIdFound) {
				// focused appointment not visible or no focus set
				if (aVisibleAppointments.length > 0) {
					this._sFocusedAppointmentId = aVisibleAppointments[0].appointment.getId();
				}else {
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
			var iDay = oDate.getDay();
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
				var oGroupAppointmentStartDate = CalendarUtils._createUniversalUTCDate(oGroupAppointment.getStartDate(), true);
				if (oGroupAppointmentStartDate.getTime() == oGroupStartDate.getTime()) {
					break;
				}
				oGroupAppointment = undefined;
			}

			if (!oGroupAppointment) {
				var oGroupEndDate = new UniversalDate(oGroupStartDate.getTime());
				oGroupEndDate.setDate(oGroupEndDate.getDate() + 7);
				oGroupEndDate.setMilliseconds(-1);
				oGroupAppointment = new sap.ui.unified.CalendarAppointment(this.getId() + "-Group" + aGroupAppointments.length, {
					type: oAppointment.getType(),
					startDate: CalendarUtils._createLocalDate(new Date(oGroupStartDate.getTime()), true),
					endDate: CalendarUtils._createLocalDate(new Date(oGroupEndDate.getTime()), true)
				});
				oGroupAppointment._aAppointments = [];
				this.addAggregation("groupAppointments", oGroupAppointment, true);
				var iBegin = _calculateBegin.call(this, sIntervalType, iIntervals, oStartDate, oEndDate, iStartTime, oGroupStartDate);
				var iEnd = _calculateEnd.call(this, sIntervalType, iIntervals, oStartDate, oEndDate, iStartTime, oGroupEndDate);
				aVisibleAppointments.push({appointment: oGroupAppointment, begin: iBegin, end: iEnd, calculatedEnd: iEnd, level: -1});
			}
			oGroupAppointment._aAppointments.push(oAppointment);
			if (oGroupAppointment.getType() != sap.ui.unified.CalendarDayType.None && oGroupAppointment.getType() != oAppointment.getType()){
				oGroupAppointment.setType(sap.ui.unified.CalendarDayType.None);
			}
			oGroupAppointment.setProperty("title", oGroupAppointment._aAppointments.length, true);

			return oGroupAppointment;

		}

		function _calculateBegin(sIntervalType, iIntervals, oStartDate, oEndDate, iStartTime, oAppointmentStartDate) {

			var iBegin = 0;

			if (sIntervalType != sap.ui.unified.CalendarIntervalType.Month) {
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

			if (sIntervalType != sap.ui.unified.CalendarIntervalType.Month) {
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
		 * returns a array of visible intervalHeaders
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
					var oAppointmentStartDate = CalendarUtils._createUniversalUTCDate(oAppointment.getStartDate(), true);
					oAppointmentStartDate.setUTCSeconds(0); // ignore seconds
					oAppointmentStartDate.setUTCMilliseconds(0); // ignore milliseconds
					var oAppointmentEndDate = CalendarUtils._createUniversalUTCDate(oAppointment.getEndDate(), true);
					oAppointmentEndDate.setUTCSeconds(0); // ignore seconds
					oAppointmentEndDate.setUTCMilliseconds(0); // ignore milliseconds

					if (oAppointmentStartDate && oAppointmentStartDate.getTime() <= iEndTime &&
							oAppointmentEndDate && oAppointmentEndDate.getTime() >= iStartTime) {
						// appointment is visible in row - check intervals
						var oIntervalStartDate = new UniversalDate(oStartDate.getTime());
						var oIntervalEndDate = new UniversalDate(oStartDate.getTime());
						oIntervalEndDate.setUTCMinutes(oIntervalEndDate.getUTCMinutes() - 1);
						var iFirstInterval = -1;

						for (j = 0; j < iIntervals; j++) {

							switch (sIntervalType) {
							case sap.ui.unified.CalendarIntervalType.Hour:
								oIntervalEndDate.setUTCHours(oIntervalEndDate.getUTCHours() + 1);
								if (j > 0) {
									oIntervalStartDate.setUTCHours(oIntervalStartDate.getUTCHours() + 1);
								}
								break;

							case sap.ui.unified.CalendarIntervalType.Day:
								oIntervalEndDate.setUTCDate(oIntervalEndDate.getUTCDate() + 1);
								if (j > 0) {
									oIntervalStartDate.setUTCDate(oIntervalStartDate.getUTCDate() + 1);
								}
								break;

							case sap.ui.unified.CalendarIntervalType.Month:
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
								aVisibleIntervalHeaders.push({interval: j, appointment: oAppointment, first: iFirstInterval == j});
							}
						}
					}
				}
			}

			this._aVisibleIntervalHeaders = aVisibleIntervalHeaders;
			return this._aVisibleIntervalHeaders;

		}

		// as the top position of the appointments depends on the rendered height it must be calculated after rendering
		function _positionAppointments() {

			var $DummyApp = this.$("DummyApp");
			var iHeight = $DummyApp.outerHeight(true);
			var iMinWidth = $DummyApp.outerWidth();
			var $Apps = this.$("Apps");
			var iRowWidth = $Apps.innerWidth();
			var iMinPercent =  iMinWidth / iRowWidth * 100;
			var iMinPercentCeil =  Math.ceil(1000 * iMinPercent) / 1000;
			var oAppointment;
			var $Appointment;
			var iStaticHeight = 0;
			var iLevels = 0;
			var i = 0;

			if (this.getShowIntervalHeaders()) {
				iStaticHeight = jQuery(this.$("AppsInt0").children(".sapUiCalendarRowAppsIntHead")[0]).outerHeight(true);
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
					oAppointment.level = -1; // level must be new calculated
					bChanged = true;
					$Appointment.addClass("sapUiCalendarAppSmall");
				}else if ($Appointment.hasClass("sapUiCalendarAppSmall")){
					// not longer too small
					oAppointment.end = oAppointment.calculatedEnd;
					bChanged = true;
					$Appointment.removeClass("sapUiCalendarAppSmall");
				}

				if (bChanged) {
					if (this._bRTL) {
						$Appointment.css("left", oAppointment.end + "%");
					} else {
						$Appointment.css("right", oAppointment.end + "%");
					}
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
						    oAppointment.begin < 100 - oVisibleAppointment.end &&
						    100 - oAppointment.end > oVisibleAppointment.begin &&
						    oVisibleAppointment.level >= 0) {
							// if one appointment starts directly at the end of an other one place it at the same level
							if (oBlockedLevels[oVisibleAppointment.level]) {
								oBlockedLevels[oVisibleAppointment.level]++;
							} else {
								oBlockedLevels[oVisibleAppointment.level] = 1;
							}
						}
					}

					oAppointment.level = 0;
					while (oBlockedLevels[oAppointment.level]) {
						oAppointment.level++;
					}
					$Appointment.attr("data-sap-level", oAppointment.level);
				}

				$Appointment.css("top", (iHeight * oAppointment.level + iStaticHeight) + "px");

				if (iLevels < oAppointment.level) {
					iLevels = oAppointment.level;
				}
			}

			iLevels++; // as 0 is a valid level
			iHeight = iHeight * iLevels + iStaticHeight;

			if (!this.getHeight()) {
				// no height set -> determine from rendered levels
				$Apps.outerHeight(iHeight);
			}else {
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
			var oOtherAppointment;

			if (bRemoveOldSelection) {
				var aAppointments = this.getAppointments();
				var aGroupAppointments = this.getAggregation("groupAppointments", []);
				jQuery.merge(aAppointments, aGroupAppointments);
				for (i = 0; i < aAppointments.length; i++) {
					oOtherAppointment = aAppointments[i];
					if (oOtherAppointment.getSelected()) {
						oOtherAppointment.setProperty("selected", false, true); // do not invalidate CalendarRow
						oOtherAppointment.$().removeClass("sapUiCalendarAppSel");
					}
				}
			}

			oAppointment.setProperty("selected", true, true); // do not invalidate CalendarRow
			oAppointment.$().addClass("sapUiCalendarAppSel");

			if (oAppointment._aAppointments) {
				// it's a group Appointment
				for (i = 0; i < oAppointment._aAppointments.length; i++) {
					oOtherAppointment = oAppointment._aAppointments[i];
					oOtherAppointment.setProperty("selected", true, true); // do not invalidate CalendarRow
				}
				this.fireSelect({appointments: oAppointment._aAppointments, multiSelect: !bRemoveOldSelection});
			}else {
				this.fireSelect({appointment: oAppointment, multiSelect: !bRemoveOldSelection});
			}


		}

		function _getAppointmentsSorted() {

			var aAppointments = this.getAppointments();

			aAppointments.sort(function(oApp1, oApp2){

				return oApp1.getStartDate() - oApp2.getStartDate();

			});

			return aAppointments;

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
				var aAppointments = _getAppointmentsSorted.call(this);
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
					$Appointment.focus();
				}else {
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
						if (!jQuery.sap.containsOrEquals(this.getDomRef(), document.activeElement)) {
							// focus is outside control -> set focus after rerendering
							jQuery.sap.delayedCall(0, this, function(){
								this.getFocusedAppointment().focus();
							});
						}
						this.fireStartDateChange();
					}
				}
			}

		}

		function _navigateToAppointment(bForward, iStep) {

			var sId = this._sFocusedAppointmentId;
			var aAppointments = _getAppointmentsSorted.call(this);
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
			var aAppointments = _getAppointmentsSorted.call(this);
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
			case sap.ui.unified.CalendarIntervalType.Hour:
				oEndDate.setUTCDate(oEndDate.getUTCDate() + 1);
				oEndDate.setUTCMilliseconds(-1);
				break;

			case sap.ui.unified.CalendarIntervalType.Day:
				oStartDate.setUTCDate(1);
				oEndDate.setUTCMonth(oEndDate.getUTCMonth() + 1);
				oEndDate.setUTCDate(1);
				oEndDate.setUTCMilliseconds(-1);
				break;

			case sap.ui.unified.CalendarIntervalType.Month:
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
				}else if (aAppointments[i].getStartDate() > oLocalEndDate) {
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

	}());

	return CalendarRow;

}, /* bExport= */ true);
