/*!
 * ${copyright}
 */

//Provides control sap.m.PlanningCalendar.
sap.ui.define(['jquery.sap.global', 'sap/ui/core/Control', 'sap/ui/core/LocaleData', './PlanningCalendarRow',
               './library', 'sap/ui/unified/library', 'sap/ui/unified/calendar/CalendarUtils'],
		function(jQuery, Control, LocaleData, PlanningCalendarRow, library, unifiedLibrary, CalendarUtils) {
	"use strict";

	/**
	 * Constructor for a new <code>PlanningCalendar</code>.
	 *
	 * @param {string} [sID] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * The <code>PlanningCalendar</code> can display rows with appointments for different persons.
	 * It is possible to define different views and switch between the views.
	 * You can add your own buttons or other controls to the toolbar.
	 *
	 * <b>Note:</b> The <code>PlanningCalendar</code> uses parts of the <code>sap.ui.unified</code> library.
	 * If the <code>sap.ui.unified</code> library is not loaded before the <code>PlanningCalendar</code> is loaded,
	 * it will be loaded after the <code>PlanningCalendar</code> is loaded.
	 * This could lead to a waiting time before a <code>PlanningCalendar</code> is used for the first time.
	 * To prevent this, applications using the <code>PlanningCalendar</code> should also load the <code>sap.ui.unified</code> library.
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
			 * Start date of the row, as JavaScript date object. As a default the current date is used.
			 */
			startDate : {type : "object", group : "Data"},

			/**
			 * Key of the <code>PlanningCalendarView</code> used for the output. The default value uses a default view.
			 * If you are using own views, the keys of these views must be used instead.
			 */
			viewKey : {type : "string", group : "Appearance", defaultValue : sap.ui.unified.CalendarIntervalType.Hour},

			/**
			 * If set, only a single row can be selected
			 */
			singleSelection : {type : "boolean", group : "Misc", defaultValue : true},

			/**
			 * Width of the <code>PlanningCalendar</code>
			 */
			width : {type : "sap.ui.core.CSSSize", group : "Dimension", defaultValue : null},

			/**
			 * Height of the <code>PlanningCalendar</code>
			 */
			height : {type : "sap.ui.core.CSSSize", group : "Dimension", defaultValue : null},

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
			 * <b>Note:</b> This property is only used if <code>showIntervalHeaders</code> is set to <code>true</code>.
			 * @since 1.38.0
			 */
			showEmptyIntervalHeaders : {type : "boolean", group : "Appearance", defaultValue : true},

			/**
			 * If set, headers of the <code>PlanningCalendarRows</code> are shown. This means the column with the headers is shown.
			 *
			 * If not set, the header column is not shown at all, even if header information is provided.
			 */
			showRowHeaders : {type : "boolean", group : "Appearance", defaultValue : true},

			/**
			 * This text is displayed when no rows are assigned.
			 */
			noDataText : {type : "string", group : "Misc", defaultValue : null},

			/**
			 * If set the appointments without text (only title) are rendered with a smaller height.
			 *
			 * <b>Note:</b> On phone devices this property is ignored, appointments are always rendered in full height
			 * to allow touching.
			 * @since 1.38.0
			 */
			appointmentsReducedHeight : {type : "boolean", group : "Appearance", defaultValue : false},

			/**
			 * Minimum date that can be shown and selected in the <code>PlanningCalendar</code>. This must be a JavaScript date object.
			 *
			 * <b>Note:</b> If the <code>minDate</code> is set to be after the <code>maxDate</code>,
			 * the <code>maxDate</code> is set to the end of the month of the <code>minDate</code>.
			 * @since 1.38.0
			 */
			minDate : {type : "object", group : "Misc", defaultValue : null},

			/**
			 * Maximum date that can be shown and selected in the <code>PlanningCalendar</code>. This must be a JavaScript date object.
			 *
			 * <b>Note:</b> If the <code>maxDate</code> is set to be before the <code>minDate</code>,
			 * the <code>minDate</code> is set to the begin of the month of the <code>maxDate</code>.
			 * @since 1.38.0
			 */
			maxDate : {type : "object", group : "Misc", defaultValue : null}
		},
		aggregations : {

			/**
			 * rows of the <code>PlanningCalendar</code>
			 */
			rows : {type : "sap.m.PlanningCalendarRow", multiple : true, singularName : "row"},

			/**
			 * Views of the <code>PlanningCalendar</code>.
			 *
			 * If not set, three default views are used to allow you to switch between hour, day and month granularity.
			 * The default views have the keys defined in </code>sap.ui.unified.CalendarIntervalType</code>
			 */
			views : {type : "sap.m.PlanningCalendarView", multiple : true, singularName : "view"},

			/**
			 * Date range along with a type to visualize special days in the header calendar.
			 * If one day is assigned to more than one type, only the first one will be used.
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
		events : {

			/**
			 * Fired if an appointment was selected
			 */
			appointmentSelect : {
				parameters : {
					/**
					 * Selected appointment
					 */
					appointment : {type : "sap.ui.unified.CalendarAppointment"},

					/**
					 * Selected appointments in case a group appointment is selected
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
			 * Fired if an interval was selected in the header calendar or in the row
			 */
			intervalSelect : {
				parameters : {
					/**
					 * Start date of the selected interval, as JavaScript date object.
					 */
					startDate : {type : "object"},

					/**
					 * Interval end date as JavaScript date object
					 * @since 1.38.0
					 */
					endDate : {type : "object"},

					/**
					 * If set, the selected interval is a subinterval
					 * @since 1.38.0
					 */
					subInterval : {type : "boolean"},

					/**
					 * Row of the selected interval
					 * @since 1.38.0
					 */
					row : {type : "sap.m.PlanningCalendarRow"}
				}
			},

			/**
			 * Fires when row selection is changed
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
			 * <code>startDate</code> was changed while navigating in <code>PlanningCalendar</code>
			 */
			startDateChange : {},

			/**
			 * <code>viewKey</code> was changed by user interaction
			 */
			viewChange : {}
		}
	}});

	var CalendarHeader = sap.ui.core.Control.extend("CalendarHeader", {

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

		this._oIntervalTypeSelect = new sap.m.Select(this.getId() + "-IntType", {maxWidth: "15rem"});
		this._oIntervalTypeSelect.attachEvent("change", _changeIntervalType, this);

		this._oTodayButton = new sap.m.Button(this.getId() + "-Today", {
			text: this._oRB.getText("PLANNINGCALENDAR_TODAY"),
			type: sap.m.ButtonType.Transparent
		});
		this._oTodayButton.attachEvent("press", _handleTodayPress, this);

		this._oHeaderToolbar = new sap.m.Toolbar(this.getId() + "-HeaderToolbar", {
			design: sap.m.ToolbarDesign.Transparent,
			content: [this._oIntervalTypeSelect, this._oTodayButton]
		});

		this._oCalendarHeader = new CalendarHeader(this.getId() + "-CalHead", {
			toolbar: this._oHeaderToolbar
		});

		this._oInfoToolbar = new sap.m.Toolbar(this.getId() + "-InfoToolbar", {
			height: "auto",
			design: sap.m.ToolbarDesign.Transparent,
			content: [this._oCalendarHeader, this._oTimeInterval]
		});

		var oTable = new sap.m.Table(this.getId() + "-Table", {
			infoToolbar: this._oInfoToolbar,
			mode: sap.m.ListMode.SingleSelectMaster,
			columns: [ new sap.m.Column({
				styleClass: "sapMPlanCalRowHead"
			}),
			new sap.m.Column({
				width: "80%",
				styleClass: "sapMPlanCalAppRow",
				minScreenWidth: sap.m.ScreenSize.Desktop,
				demandPopin: true
			})
			]
		});
		oTable.attachEvent("selectionChange", _handleTableSelectionChange, this);

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
		if (this._oTimeInterval) {
			this._oTimeInterval._oPlanningCalendar = undefined;
			this._oTimeInterval.destroy();
			this._oTimeInterval = undefined;
		}

		if (this._oDateInterval) {
			this._oDateInterval._oPlanningCalendar = undefined;
			this._oDateInterval.destroy();
			this._oDateInterval = undefined;
		}

		if (this._oMonthInterval) {
			this._oMonthInterval._oPlanningCalendar = undefined;
			this._oMonthInterval.destroy();
			this._oMonthInterval = undefined;
		}

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

	};

	PlanningCalendar.prototype.onBeforeRendering = function(){

		this._bBeforeRendering = true;

		if ((!this._oTimeInterval && !this._oDateInterval && !this._oMonthInterval) || this._bCheckView) {
			// init intervalType settings if default is used
			this.setViewKey(this.getViewKey());
			this._bCheckView = undefined;
		}

		_updateSelectItems.call(this);

		if (this._sUpdateCurrentTime) {
			jQuery.sap.clearDelayedCall(this._sUpdateCurrentTime);
			this._sUpdateCurrentTime = undefined;
		}

		this._bBeforeRendering = undefined;

	};

	PlanningCalendar.prototype.onAfterRendering = function(oEvent){

		// check if size is right and adopt it if necessary
		oEvent.size = {width: this.getDomRef().offsetWidth};
		_handleResize.call(this, oEvent, true);

		if (!this._sResizeListener) {
			this._sResizeListener = sap.ui.core.ResizeHandler.register(this, this._resizeProxy);
		}

		_updateCurrentTimeVisualization.call(this, false); // CalendarRow sets visualization onAfterRendering

	};

	PlanningCalendar.prototype.setStartDate = function(oStartDate){

		if (!oStartDate) {
			//set default value
			oStartDate = new Date();
		}

		if (jQuery.sap.equal(oStartDate, this.getStartDate())) {
			return this;
		}

		if (!(oStartDate instanceof Date)) {
			throw new Error("Date must be a JavaScript date object; " + this);
		}

		var iYear = oStartDate.getFullYear();
		if (iYear < 1 || iYear > 9999) {
			throw new Error("Date must not be in valid range (between 0001-01-01 and 9999-12-31); " + this);
		}

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

		if (this._oTimeInterval) {
			this._oTimeInterval.setStartDate(new Date(oStartDate.getTime())); // use new date object
		}

		if (this._oDateInterval) {
			this._oDateInterval.setStartDate(new Date(oStartDate.getTime())); // use new date object
		}

		if (this._oMonthInterval) {
			this._oMonthInterval.setStartDate(new Date(oStartDate.getTime())); // use new date object
		}

		var aRows = this.getRows();
		for (var i = 0; i < aRows.length; i++) {
			var oRow = aRows[i];
			oRow.getCalendarRow().setStartDate(new Date(oStartDate.getTime())); // use new date object
		}

		if (this.getDomRef()) {
			// only set timer, CalendarRow will be rerendered, so no update needed here
			_updateCurrentTimeVisualization.call(this, false);
		}

		return this;

	};

	PlanningCalendar.prototype.setMinDate = function(oDate){

		if (jQuery.sap.equal(oDate, this.getMinDate())) {
			return this;
		}

		if (oDate) {
			if (!(oDate instanceof Date)) {
				throw new Error("Date must be a JavaScript date object; " + this);
			}

			var iYear = oDate.getFullYear();
			if (iYear < 1 || iYear > 9999) {
				throw new Error("Date must not be in valid range (between 0001-01-01 and 9999-12-31); " + this);
			}

			this.setProperty("minDate", oDate, true);

			if (this._oTimeInterval) {
				this._oTimeInterval.setMinDate(new Date(oDate.getTime())); // use new date object
			}

			if (this._oDateInterval) {
				this._oDateInterval.setMinDate(new Date(oDate.getTime())); // use new date object
			}

			if (this._oMonthInterval) {
				this._oMonthInterval.setMinDate(new Date(oDate.getTime())); // use new date object
			}

			var oMaxDate = this.getMaxDate();
			if (oMaxDate && oMaxDate.getTime() < oDate.getTime()) {
				jQuery.sap.log.warning("minDate > maxDate -> maxDate set to end of the month", this);
				oMaxDate = new Date(oDate.getTime());
				oMaxDate.setMonth(oMaxDate.getonth() + 1, 0);
				oMaxDate.setHours(23);
				oMaxDate.setMinutes(59);
				oMaxDate.setSeconds(59);
				oMaxDate.setMilliseconds(0);
				this.setMaxDate(oMaxDate);
			}

			var oStartDate = this.getStartDate();
			if (oStartDate && oStartDate.getTime() < oDate.getTime()) {
				jQuery.sap.log.warning("StartDate < minDate -> StartDate set to minDate", this);
				oStartDate = new Date(oDate.getTime());
				this.setStartDate(oStartDate);
			}
		} else {
			this.setProperty("minDate", undefined, true);

			if (this._oTimeInterval) {
				this._oTimeInterval.setMinDate();
			}

			if (this._oDateInterval) {
				this._oDateInterval.setMinDate();
			}

			if (this._oMonthInterval) {
				this._oMonthInterval.setMinDate();
			}
		}

		return this;

	};

	PlanningCalendar.prototype.setMaxDate = function(oDate){

		if (jQuery.sap.equal(oDate, this.getMaxDate())) {
			return this;
		}

		if (oDate) {
			if (!(oDate instanceof Date)) {
				throw new Error("Date must be a JavaScript date object; " + this);
			}

			var iYear = oDate.getFullYear();
			if (iYear < 1 || iYear > 9999) {
				throw new Error("Date must not be in valid range (between 0001-01-01 and 9999-12-31); " + this);
			}

			this.setProperty("maxDate", oDate, true);

			if (this._oTimeInterval) {
				this._oTimeInterval.setMaxDate(new Date(oDate.getTime())); // use new date object
			}

			if (this._oDateInterval) {
				this._oDateInterval.setMaxDate(new Date(oDate.getTime())); // use new date object
			}

			if (this._oMonthInterval) {
				this._oMonthInterval.setMaxDate(new Date(oDate.getTime())); // use new date object
			}

			var oMinDate = this.getMinDate();
			if (oMinDate && oMinDate.getTime() > oDate.getTime()) {
				jQuery.sap.log.warning("maxDate < minDate -> maxDate set to begin of the month", this);
				oMinDate = new Date(oDate.getTime());
				oMinDate.setUTCDate(1);
				oMinDate.setHours(0);
				oMinDate.setMinutes(0);
				oMinDate.setSeconds(0);
				oMinDate.setMilliseconds(0);
				this.setMinDate(oMinDate);
			}

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

			if (this._oTimeInterval) {
				this._oTimeInterval.setMaxDate();
			}

			if (this._oDateInterval) {
				this._oDateInterval.setMaxDate();
			}

			if (this._oMonthInterval) {
				this._oMonthInterval.setMaxDate();
			}
		}

		return this;

	};

	PlanningCalendar.prototype.setViewKey = function(sKey){

		this.setProperty("viewKey", sKey, true);

		this._oIntervalTypeSelect.setSelectedKey(sKey);

		if (this._oInfoToolbar.getContent().length > 1) {
			this._oInfoToolbar.removeContent(1);
		}

		var oStartDate = this.getStartDate();
		var oMinDate = this.getMinDate();
		var oMaxDate = this.getMaxDate();
		var oView = _getView.call(this, sKey, !this._bBeforeRendering);

		if (!oView) {
			this._bCheckView = true;
			this.invalidate(); // view not exist now, maybe added later, so rerender
		} else {
			var sIntervalType = oView.getIntervalType();
			var iIntervals = _getIntervals.call(this, oView);

			switch (sIntervalType) {
			case sap.ui.unified.CalendarIntervalType.Hour:
				if (!this._oTimeInterval) {
					this._oTimeInterval = new sap.ui.unified.CalendarTimeInterval(this.getId() + "-TimeInt", {
						startDate: new Date(oStartDate.getTime()), // use new date object
						items: iIntervals,
						pickerPopup: true
					});
					this._oTimeInterval.attachEvent("startDateChange", _handleStartDateChange, this);
					this._oTimeInterval.attachEvent("select", _handleCalendarSelect, this);
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
				if (!this._oDateInterval) {
					this._oDateInterval = new sap.ui.unified.CalendarDateInterval(this.getId() + "-DateInt", {
						startDate: new Date(oStartDate.getTime()), // use new date object
						days: iIntervals,
						showDayNamesLine: false,
						pickerPopup: true
					});
					this._oDateInterval.attachEvent("startDateChange", _handleStartDateChange, this);
					this._oDateInterval.attachEvent("select", _handleCalendarSelect, this);
					this._oDateInterval._oPlanningCalendar = this;
					this._oDateInterval.getSpecialDates = function(){
						return this._oPlanningCalendar.getSpecialDates();
					};
					if (oMinDate) {
						this._oDateInterval.setMinDate(new Date(oMinDate.getTime()));
					}
					if (oMaxDate) {
						this._oDateInterval.setMaxDate(new Date(oMaxDate.getTime()));
					}
				}else if (this._oDateInterval.getDays() != iIntervals) {
					this._oDateInterval.setDays(iIntervals);
				}
				this._oInfoToolbar.addContent(this._oDateInterval);
				break;

			case sap.ui.unified.CalendarIntervalType.Month:
				if (!this._oMonthInterval) {
					this._oMonthInterval = new sap.ui.unified.CalendarMonthInterval(this.getId() + "-MonthInt", {
						startDate: new Date(oStartDate.getTime()), // use new date object
						months: iIntervals,
						pickerPopup: true
					});
					this._oMonthInterval.attachEvent("startDateChange", _handleStartDateChange, this);
					this._oMonthInterval.attachEvent("select", _handleCalendarSelect, this);
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
				_updateCurrentTimeVisualization.call(this, false);
			}
		}

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

	PlanningCalendar.prototype.setAppointmentsReducedHeight = function(bAppointmentsReducedHeight){

		this.setProperty("appointmentsReducedHeight", bAppointmentsReducedHeight, true);

		var aRows = this.getRows();
		for (var i = 0; i < aRows.length; i++) {
			var oRow = aRows[i];
			oRow.getCalendarRow().setAppointmentsReducedHeight(bAppointmentsReducedHeight);
		}

		return this;

	};

	PlanningCalendar.prototype.setShowRowHeaders = function(bShowRowHeaders){

		// set header column to invisible as each row is a ColumnListItem with two columns
		// removing the column would need to change every row

		this.setProperty("showRowHeaders", bShowRowHeaders, true);

		var oTable = this.getAggregation("table");
		oTable.getColumns()[0].setVisible(bShowRowHeaders);

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
		oCalendarRow.setAppointmentsReducedHeight(this.getAppointmentsReducedHeight());
		oCalendarRow.attachEvent("select", _handleAppointmentSelect, this);
		oCalendarRow.attachEvent("startDateChange", _handleStartDateChange, this);
		oCalendarRow.attachEvent("leaveRow", _handleLeaveRow, this);
		oCalendarRow.attachEvent("intervalSelect", _handleIntervalSelect, this);

		_updateSelectAllCheckBox.call(this);

		if (this._oTimeInterval || this._oDateInterval || this._oMonthInterval) {
			var sKey = this.getViewKey();
			var oView = _getView.call(this, sKey);
			var sIntervalType = oView.getIntervalType();
			var iIntervals = _getIntervals.call(this, oView);
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
		oCalendarRow.setAppointmentsReducedHeight(this.getAppointmentsReducedHeight());
		oCalendarRow.attachEvent("select", _handleAppointmentSelect, this);
		oCalendarRow.attachEvent("startDateChange", _handleStartDateChange, this);
		oCalendarRow.attachEvent("leaveRow", _handleLeaveRow, this);
		oCalendarRow.attachEvent("intervalSelect", _handleIntervalSelect, this);

		_updateSelectAllCheckBox.call(this);

		if (this._oTimeInterval || this._oDateInterval || this._oMonthInterval) {
			var sKey = this.getViewKey();
			var oView = _getView.call(this, sKey);
			var sIntervalType = oView.getIntervalType();
			var iIntervals = _getIntervals.call(this, oView);
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
		oCalendarRow.detachEvent("startDateChange", _handleStartDateChange, this);
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
			oCalendarRow.detachEvent("startDateChange", _handleStartDateChange, this);
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

	PlanningCalendar.prototype.invalidate = function(oOrigin) {

		if (this._bDateRangeChanged || (oOrigin && oOrigin instanceof sap.ui.unified.DateRange)) {
			// DateRange changed -> only invalidate calendar control
			if (this.getDomRef()) {
				var sKey = this.getViewKey();
				var oView = _getView.call(this, sKey);
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

				default:
					throw new Error("Unknown IntervalType: " + sIntervalType + "; " + this);
				}
			}
			this._bDateRangeChanged = undefined;
		} else {
			Control.prototype.invalidate.apply(this, arguments);
		}

	};

	PlanningCalendar.prototype.removeAllSpecialDates = function() {

		this._bDateRangeChanged = true;
		var aRemoved = this.removeAllAggregation("specialDates");
		return aRemoved;

	};

	PlanningCalendar.prototype.destroySpecialDates = function() {

		this._bDateRangeChanged = true;
		var oDestroyed = this.destroyAggregation("specialDates");
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
	 * <b>Note:</b> Selection only works if <code>singleSelection</code> is not set
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

	function _changeIntervalType(oEvent) {

		this.setViewKey(oEvent.getParameter("selectedItem").getKey());

		this.fireViewChange();

	}

	function _handleTodayPress(oEvent) {

		this.setStartDate(new Date());

		this.fireStartDateChange();

	}

	function _handleStartDateChange(oEvent){

		var oStartDate = oEvent.oSource.getStartDate();

		this.setStartDate(new Date(oStartDate.getTime())); // use new Date object

		this.fireStartDateChange();

	}

	function _handleCalendarSelect(oEvent){

		var aSelectedDates = oEvent.oSource.getSelectedDates();
		var oStartDate = new Date(aSelectedDates[0].getStartDate());

		// remove old selection
		aSelectedDates[0].setStartDate();

		// calculate end date
		var oEndDate = CalendarUtils._createUniversalUTCDate(oStartDate, undefined, true);
		var sKey = this.getViewKey();
		var oView = _getView.call(this, sKey);
		var sIntervalType = oView.getIntervalType();

		switch (sIntervalType) {
		case sap.ui.unified.CalendarIntervalType.Hour:
			oEndDate.setUTCHours(oEndDate.getUTCHours() + 1);
			break;

		case sap.ui.unified.CalendarIntervalType.Day:
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

		this.fireIntervalSelect({startDate: oStartDate, endDate: oEndDate, subInterval: false, row: undefined});

	}

	function _handleIntervalSelect(oEvent){

		var oStartDate = oEvent.getParameter("startDate");
		var oEndDate = oEvent.getParameter("endDate");
		var bSubInterval = oEvent.getParameter("subInterval");
		var oRow = oEvent.oSource._oPlanningCalendarRow;

		this.fireIntervalSelect({startDate: oStartDate, endDate: oEndDate, subInterval: bSubInterval, row: oRow});

	}

	function _handleResize(oEvent, bNoRowResize){

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
			var sKey = this.getViewKey();
			var oView = _getView.call(this, sKey);
			var sIntervalType = oView.getIntervalType();
			var iIntervals = _getIntervals.call(this, oView);
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

	}

	function _updateCurrentTimeVisualization(bUpdateRows){

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
		var oView = _getView.call(this, sKey);
		var sIntervalType = oView.getIntervalType();
		var iIntervals = _getIntervals.call(this, oView);
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
			iTime = 1800000;
			iStartTime = oStartDate.getTime() - 3600000;
			iEndTime = oStartDate.getTime() + iIntervals * 86400000;
			break;

		default:
			iTime = -1; // not needed
		break;
		}

		if (oNowDate.getTime() <= iEndTime && oNowDate.getTime() >= iStartTime && iTime > 0) {
			this._sUpdateCurrentTime = jQuery.sap.delayedCall(iTime, this, _updateCurrentTimeVisualization, [true]);
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
			}

			aViews = this._aViews;
		}

		return aViews;

	}

	function _getView(sKey, bNoError) {

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

	}

	function _getIntervals(oView) {

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

	return PlanningCalendar;

}, /* bExport= */ true);
