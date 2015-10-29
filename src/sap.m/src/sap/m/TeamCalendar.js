/*!
 * ${copyright}
 */

// Provides control sap.m.TeamCalendar.
sap.ui.define(['jquery.sap.global', 'sap/ui/core/Control', 'sap/ui/core/LocaleData', './TeamCalendarRow', './library', 'sap/ui/unified/library'],
	function(jQuery, Control, LocaleData, TeamCalendarRow, library, unifiedLibrary) {
	"use strict";

	/**
	 * Constructor for a new <code>TeamCalendar</code>.
	 *
	 * @param {string} [sID] Id for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * The <code>TeamCalendar</code> can display rows with appointments for different persons.
	 * It is possible to define different views and switch between the views.
	 * Own buttons or other controls could be added to the toolbar.
	 *
	 * @extends sap.m.InputBase
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.34.0
	 * @alias sap.m.TeamCalendar
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var TeamCalendar = Control.extend("sap.m.TeamCalendar", /** @lends sap.m.TeamCalendar.prototype */ { metadata : {

		library : "sap.m",
		properties : {

			/**
			 * Start date, as JavaScript Date object, of the row. As default the current date is used.
			 */
			startDate : {type : "object", group : "Data"},

			/**
			 * Key of the <code>TeamCalendarView</code> used for the output. The default value uses a default view.
			 * If own views are used the keys of this views must be used.
			 */
			viewKey : {type : "string", group : "Appearance", defaultValue : sap.ui.unified.CalendarIntervalType.Hour},

			/**
			 * If set, only a single row can be selected
			 */
			singleSelection : {type : "boolean", group : "Misc", defaultValue : true},

			/**
			 * Width of the <code>TeamCalendar</code>
			 */
			width : {type : "sap.ui.core.CSSSize", group : "Dimension", defaultValue : null},

			/**
			 * Height of the <code>TeamCalendar</code>
			 */
			height : {type : "sap.ui.core.CSSSize", group : "Dimension", defaultValue : null},

			/**
			 * If set interval headers are shown even if no <code>intervalHeaders</code> are assigned to the row in the visible time frame.
			 *
			 * If not set no interval headers are shown even if <code>intervalHeaders</code> are assigned to the row.
			 */
			showIntervalHeaders : {type : "boolean", group : "Appearance", defaultValue : true},

			/**
			 * If set, headers of the <code>TeamCalendarRows</code> are shown. This means the column with the headers is shown.
			 *
			 * If not set, the header column is not shown at all, even if header information are provided.
			 */
			showRowHeaders : {type : "boolean", group : "Appearance", defaultValue : true}

		},
		aggregations : {

			/**
			 * rows of the <code>TeamCalendar</code>
			 */
			rows : {type : "sap.m.TeamCalendarRow", multiple : true, singularName : "row"},

			/**
			 * views of the <code>TeamCalendar</code>.
			 *
			 * If not set 3 default views are used to allow to switch between hour, day and month granularity.
			 * The default views have the keys defined in </code>sap.ui.unified.CalendarIntervalType</code>
			 */
			views : {type : "sap.m.TeamCalendarView", multiple : true, singularName : "view"},

			/**
			 * Date Range with type to visualize special days in the header calendar.
			 * If one day is assigned to more than one Type, only the first one will be used.
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
			 * Fired if an interval was selected in the header calendar
			 */
			intervalSelect : {
				parameters : {
					/**
					 * Start date, as JavaScript Date object, of the selected interval
					 */
					startDate : {type : "object"}
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
					rows : {type : "sap.m.TeamCalendarRow[]"}
				}
			},

			/**
			 * <code>startDate</code> was changed while navigation in <code>TeamCalendar</code>
			 */
			startDateChange : {},

			/**
			 * <code>viewKey</code> was changed by user interaction
			 */
			viewChange : {}
		}
	}});

	(function() {

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
				oRm.addClass("sapMTeamCalHead");
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

		TeamCalendar.prototype.init = function(){

			this._iBreakPointTablet = sap.ui.Device.media._predefinedRangeSets[sap.ui.Device.media.RANGESETS.SAP_STANDARD_EXTENDED].points[0];
			this._iBreakPointDesktop = sap.ui.Device.media._predefinedRangeSets[sap.ui.Device.media.RANGESETS.SAP_STANDARD_EXTENDED].points[1];
			this._iBreakPointLargeDesktop = sap.ui.Device.media._predefinedRangeSets[sap.ui.Device.media.RANGESETS.SAP_STANDARD_EXTENDED].points[2];

			if (sap.ui.Device.system.phone || jQuery('html').hasClass("sapUiMedia-Std-Phone")) {
				this._iSize = 0;
			}else if (sap.ui.Device.system.tablet || jQuery('html').hasClass("sapUiMedia-Std-Tablet")) {
				this._iSize = 1;
			}else {
				this._iSize = 2;
			}

			var sLocale = sap.ui.getCore().getConfiguration().getFormatSettings().getFormatLocale().toString();
			var oLocale = new sap.ui.core.Locale(sLocale);
			this._oLocaleData = LocaleData.getInstance(oLocale);

			this._oIntervalTypeSelect = new sap.m.Select(this.getId() + "-IntType");
			this._oIntervalTypeSelect.attachEvent("change", _changeIntervalType, this);

			this._oTodayButton = new sap.m.Button(this.getId() + "-Today", {
				text: this._oLocaleData.getRelativeDay(0),
				type: sap.m.ButtonType.Transparent
			});
			this._oTodayButton.attachEvent("press", _handleTodayPress, this);

			this._oHeaderToolbar = new sap.m.Toolbar(this.getId() + "-HeaderToolbar", {
				design: sap.m.ToolbarDesign.Transpaent,
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
										styleClass: "sapMTeamCalRowHead"
										}),
									new sap.m.Column({
										width: "80%",
										styleClass: "sapMTeamCalAppRow",
										minScreenWidth: sap.m.ScreenSize.Tablet,
										demandPopin: true
										})
									]
			});
			oTable.attachEvent("selectionChange", _handleTableSelectionChange, this);

			this.setAggregation("table", oTable, true);

			this.setStartDate(new Date());

			this._resizeProxy = jQuery.proxy(_handleResize, this);

		};

		TeamCalendar.prototype.exit = function(){

			if (this._sResizeListener) {
				sap.ui.core.ResizeHandler.deregister(this._sResizeListener);
				this._sResizeListener = undefined;
			}

			if (this._sUpdateCurrentTime) {
				jQuery.sap.clearDelayedCall(this._sUpdateCurrentTime);
				this._sUpdateCurrentTime = undefined;
			}

			// remove ColumnListItems from table to not destroy them with table but from parent TeamCalendarRow
			var oTable = this.getAggregation("table");
			oTable.removeAllItems();

			// destroy also currently not used controls
			if (this._oTimeInterval) {
				this._oTimeInterval._oTeamCalendar = undefined;
				this._oTimeInterval.destroy();
				this._oTimeInterval = undefined;
			}

			if (this._oDateInterval) {
				this._oDateInterval._oTeamCalendar = undefined;
				this._oDateInterval.destroy();
				this._oDateInterval = undefined;
			}

			if (this._oMonthInterval) {
				this._oMonthInterval._oTeamCalendar = undefined;
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

		TeamCalendar.prototype.onBeforeRendering = function(){

			this._bBeforeRendering = true;

			if ((!this._oTimeInterval && !this._oMonthInterval && !this._oMonthInterval) || this._bCheckView) {
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

		TeamCalendar.prototype.onAfterRendering = function(oEvent){

			// check if size is right and adopt it if necessary
			oEvent.size = {width: this.getDomRef().offsetWidth};
			_handleResize.call(this, oEvent, true);

			if (!this._sResizeListener) {
				this._sResizeListener = sap.ui.core.ResizeHandler.register(this, this._resizeProxy);
			}

			_updateCurrentTimeVisualization.call(this, false); // CalendarRow sets visualization onAfterRendering

		};

		TeamCalendar.prototype.setStartDate = function(oStartDate){

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

		TeamCalendar.prototype.setViewKey = function(sKey){

			this.setProperty("viewKey", sKey, true);

			this._oIntervalTypeSelect.setSelectedKey(sKey);

			if (this._oInfoToolbar.getContent().length > 1) {
				this._oInfoToolbar.removeContent(1);
			}

			var oStartDate = this.getStartDate();
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
						this._oTimeInterval.attachEvent("select", _handleIntervalSelect, this);
						this._oTimeInterval._oTeamCalendar = this;
						this._oTimeInterval.getSpecialDates = function(){
							return this._oTeamCalendar.getSpecialDates();
						};
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
						this._oDateInterval.attachEvent("select", _handleIntervalSelect, this);
						this._oDateInterval._oTeamCalendar = this;
						this._oDateInterval.getSpecialDates = function(){
							return this._oTeamCalendar.getSpecialDates();
						};
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
						this._oMonthInterval.attachEvent("select", _handleIntervalSelect, this);
						this._oMonthInterval._oTeamCalendar = this;
						this._oMonthInterval.getSpecialDates = function(){
							return this._oTeamCalendar.getSpecialDates();
						};
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

		TeamCalendar.prototype.setShowIntervalHeaders = function(bShowIntervalHeaders){

			this.setProperty("showIntervalHeaders", bShowIntervalHeaders, true);

			var aRows = this.getRows();
			for (var i = 0; i < aRows.length; i++) {
				var oRow = aRows[i];
				oRow.getCalendarRow().setShowIntervalHeaders(bShowIntervalHeaders);
			}

			return this;

		};

		TeamCalendar.prototype.setShowRowHeaders = function(bShowRowHeaders){

			// set header column to invisible as each row is a ColumnListItem with two columns
			// removing the column would need to change every row

			this.setProperty("showRowHeaders", bShowRowHeaders, true);

			var oTable = this.getAggregation("table");
			oTable.getColumns()[0].setVisible(bShowRowHeaders);

			this.$().toggleClass("sapMTeamCalNoHead", !bShowRowHeaders);
			_positionSelectAllCheckBox.call(this);

			return this;

		};

		TeamCalendar.prototype.addRow = function(oRow) {

			this.addAggregation("rows", oRow, true);

			oRow.attachEvent("_change", _handleRowChanged, this);

			var oTable = this.getAggregation("table");
			oTable.addItem(oRow.getColumnListItem());

			var oCalendarRow = oRow.getCalendarRow();
			oCalendarRow.setStartDate(this.getStartDate());
			oCalendarRow.setShowIntervalHeaders(this.getShowIntervalHeaders());
			oCalendarRow.attachEvent("select", _handleAppointmentSelect, this);
			oCalendarRow.attachEvent("startDateChange", _handleStartDateChange, this);
			oCalendarRow.attachEvent("leaveRow", _handleLeaveRow, this);

			_updateSelectAllCheckBox.call(this);

			if (this.getDomRef()) {
				var sKey = this.getViewKey();
				var oView = _getView.call(this, sKey);
				var sIntervalType = oView.getIntervalType();
				var iIntervals = _getIntervals.call(this, oView);
				oCalendarRow.setIntervalType(sIntervalType);
				oCalendarRow.setIntervals(iIntervals);
				oCalendarRow.setShowSubIntervals(oView.getShowSubIntervals());
			}

			return this;

		};

		TeamCalendar.prototype.insertRow = function(oRow, iIndex) {

			this.insertAggregation("rows", oRow, iIndex);

			oRow.attachEvent("_change", _handleRowChanged, this);

			var oTable = this.getAggregation("table");
			oTable.insertItem(oRow.getColumnListItem(), iIndex, true);

			var oCalendarRow = oRow.getCalendarRow();
			oCalendarRow.setStartDate(this.getStartDate());
			oCalendarRow.setShowIntervalHeaders(this.getShowIntervalHeaders());
			oCalendarRow.attachEvent("select", _handleAppointmentSelect, this);
			oCalendarRow.attachEvent("startDateChange", _handleStartDateChange, this);
			oCalendarRow.attachEvent("leaveRow", _handleLeaveRow, this);

			_updateSelectAllCheckBox.call(this);

			if (this.getDomRef()) {
				var sKey = this.getViewKey();
				var oView = _getView.call(this, sKey);
				var sIntervalType = oView.getIntervalType();
				var iIntervals = _getIntervals.call(this, oView);
				oCalendarRow.setIntervalType(sIntervalType);
				oCalendarRow.setIntervals(iIntervals);
				oCalendarRow.setShowSubIntervals(oView.getShowSubIntervals());
			}

			return this;

		};

		TeamCalendar.prototype.removeRow = function(vObject) {

			var oRemoved = this.removeAggregation("rows", vObject, true);

			oRemoved.detachEvent("_change", _handleRowChanged, this);

			var oTable = this.getAggregation("table");
			oTable.removeItem(oRemoved.getColumnListItem(), true);

			var oCalendarRow = oRemoved.getCalendarRow();
			oCalendarRow.detachEvent("select", _handleAppointmentSelect, this);
			oCalendarRow.detachEvent("startDateChange", _handleStartDateChange, this);
			oCalendarRow.detachEvent("leaveRow", _handleLeaveRow, this);

			_updateSelectAllCheckBox.call(this);

			return oRemoved;

		};

		TeamCalendar.prototype.removeAllRows = function() {

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
			}

			_updateSelectAllCheckBox.call(this);

			return aRemoved;

		};

		TeamCalendar.prototype.destroyRows = function() {

			var destroyed = this.destroyAggregation("rows", true);

			var oTable = this.getAggregation("table");
			oTable.destroyItems(true);

			_updateSelectAllCheckBox.call(this);

			return destroyed;

		};

		TeamCalendar.prototype.addToolbarContent = function(oContent) {

			this.addAggregation("toolbarContent", oContent, true);

			_changeToolbar.call(this);

			return this;

		};

		TeamCalendar.prototype.insertToolbarContent = function(oContent, iIndex) {

			this.insertAggregation("toolbarContent", oContent, iIndex);

			_changeToolbar.call(this);

			return this;

		};

		TeamCalendar.prototype.removeToolbarContent = function(vObject) {

			var oRemoved = this.removeAggregation("toolbarContent", vObject, true);

			_changeToolbar.call(this);

			return oRemoved;

		};

		TeamCalendar.prototype.removeAllToolbarContent = function() {

			var aRemoved = this.removeAllAggregation("toolbarContent", true);

			_changeToolbar.call(this);

			return aRemoved;

		};

		TeamCalendar.prototype.destroyToolbarContent = function() {

			var destroyed = this.destroyAggregation("toolbarContent", true);

			_changeToolbar.call(this);

			return destroyed;

		};

		TeamCalendar.prototype.setSingleSelection = function(bSingleSelection) {

			this.setProperty("singleSelection", bSingleSelection, true);

			var oTable = this.getAggregation("table");
			if (bSingleSelection) {
				oTable.setMode(sap.m.ListMode.SingleSelectMaster);
				this.selectAllRows(false);
			} else {
				oTable.setMode(sap.m.ListMode.MultiSelect);
				_updateSelectAllCheckBox.call(this);
			}

			_positionSelectAllCheckBox.call(this);

			this.$().toggleClass("sapMTeamCalMultiSel", !bSingleSelection);

			return this;

		};

		TeamCalendar.prototype.invalidate = function(oOrigin) {

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

		TeamCalendar.prototype.removeAllSpecialDates = function() {

			this._bDateRangeChanged = true;
			var aRemoved = this.removeAllAggregation("specialDates");
			return aRemoved;

		};

		TeamCalendar.prototype.destroySpecialDates = function() {

			this._bDateRangeChanged = true;
			var oDestroyed = this.destroyAggregation("specialDates");
			return oDestroyed;

		};

		/*
		 * overwrites the getContent function of the toolbar to allow to mix static content from the TeamCalendar
		 * and application content.
		 *
		 * @private
		 */
		TeamCalendar.prototype._getToolbarContent = function(){

			return this.getToolbarContent();

		};

		/**
		 * Returns an array containing the selected rows. If no row is selected, an empty array is returned.
		 *
		 * @returns {sap.m.TeamCalendarRow[]} selected rows
		 * @public
		 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
		 */
		TeamCalendar.prototype.getSelectedRows = function() {

			return this.getRows().filter(function(oRow) {
				return oRow.getSelected();
			});

		};


		/**
		 * Selects or deselects all <code>TeamCalendarRows</code>.
		 *
		 * <b>Note:</b> Selection only works if <code>singleSelection</code> is not set
		 *
		 * @param {boolean} bSelect Indicator if <code>TeamCalendarRows</code> should be selected or deselected
		 * @returns {sap.m.TeamCalendar} <code>this</code> to allow method chaining
		 * @public
		 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
		 */
		TeamCalendar.prototype.selectAllRows = function(bSelect) {

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

		TeamCalendar.prototype.onsaphomemodifiers = function(oEvent) {

			if ((oEvent.metaKey || oEvent.ctrlKey) && !oEvent.altKey && !oEvent.shiftKey) {
				var aRows = this.getRows();
				var oRow = aRows[0];

				var oNewEvent = new jQuery.Event("saphome");
				oNewEvent.originalEvent = oNewEvent.originalEvent || {};
				oNewEvent._bTeamCalendar = true;

				oRow.getCalendarRow().onsaphome(oNewEvent);

				oEvent.preventDefault();
				oEvent.stopPropagation();
			}

		};

		TeamCalendar.prototype.onsapendmodifiers = function(oEvent) {

			if ((oEvent.metaKey || oEvent.ctrlKey) && !oEvent.altKey && !oEvent.shiftKey) {
				var aRows = this.getRows();
				var oRow = aRows[aRows.length - 1];

				var oNewEvent = new jQuery.Event("sapend");
				oNewEvent.originalEvent = oNewEvent.originalEvent || {};
				oNewEvent._bTeamCalendar = true;

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

		function _handleIntervalSelect(oEvent){

			var aSelectedDates = oEvent.oSource.getSelectedDates();
			var oStartDate = new Date(aSelectedDates[0].getStartDate());

			// remove old selection
			aSelectedDates[0].setStartDate();

			this.fireIntervalSelect({startDate: oStartDate});

		}

		function _handleResize(oEvent, bNoRowResize){

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
					this._oToolbar = new sap.m.Toolbar(this.getId() + "-Toolbar", {
						design: sap.m.ToolbarDesign.Transpaent
					});
					this._oToolbar._oTeamCalendar = this;
					this._oToolbar.getContent = function() {
						return this._oTeamCalendar._getToolbarContent();
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

		}

		function _getViews() {

			var aViews = this.getViews();

			if (aViews.length == 0) {
				if (!this._aViews) {
					this._aViews = [];

					var oViewHour = new sap.m.TeamCalendarView(this.getId() + "-HourView", {
						key: sap.ui.unified.CalendarIntervalType.Hour,
						intervalType: sap.ui.unified.CalendarIntervalType.Hour,
						description: this._oLocaleData.getDisplayName("hour"),
						intervalsS: 6,
						intervalsM: 6,
						intervalsL: 12
					});
					this._aViews.push(oViewHour);

					var oViewDay = new sap.m.TeamCalendarView(this.getId() + "-DayView", {
						key: sap.ui.unified.CalendarIntervalType.Day,
						intervalType: sap.ui.unified.CalendarIntervalType.Day,
						description: this._oLocaleData.getDisplayName("day"),
						intervalsS: 7,
						intervalsM: 7,
						intervalsL: 14
					});
					this._aViews.push(oViewDay);

					var oViewMonth = new sap.m.TeamCalendarView(this.getId() + "-MonthView", {
						key: sap.ui.unified.CalendarIntervalType.Month,
						intervalType: sap.ui.unified.CalendarIntervalType.Month,
						description: this._oLocaleData.getDisplayName("month"),
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
				throw new Error("TeamCalendarView with key " + sKey + "not assigned " + this);
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
					oNewEvent.originalEvent = oNewEvent.originalEvent || {};
					oNewEvent._bTeamCalendar = true;

					oNewRow.getCalendarRow().onsaphome(oNewEvent);
				}

				break;

			case "sapend":
				if (iIndex < aRows.length - 1) {
					oNewRow = aRows[aRows.length - 1];

					oNewEvent = new jQuery.Event(sType);
					oNewEvent.originalEvent = oNewEvent.originalEvent || {};
					oNewEvent._bTeamCalendar = true;

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

			var bOneColumn = this._iSize == 0 || !this.getShowRowHeaders();

			if (this.getSingleSelection()) {
				if (this._oCalendarHeader.getAllCheckBox()) {
					this._oCalendarHeader.setAllCheckBox();
				}else if (this._oInfoToolbar.getContent().length > 2) {
					this._oInfoToolbar.removeContent(this._oSelectAllCheckBox);
				}
			} else {
				if (!this._oSelectAllCheckBox) {
					this._oSelectAllCheckBox = new sap.m.CheckBox(this.getId() + "-All", {
						text: sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("COLUMNSPANEL_SELECT_ALL")
					});
					this._oSelectAllCheckBox.attachEvent("select", _handleSelectAll, this);
				}
				if (bOneColumn) {
					if (this._iSize == 0) {
						// on phone: checkbox below calendar
						this._oInfoToolbar.addContent(this._oSelectAllCheckBox);
					} else {
						// one column on desktop: checkbox left of calendar
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

	}());

	return TeamCalendar;

}, /* bExport= */ true);
