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
			 * Title of the <code>TeamCalendar</code>
			 */
			title : {type : "string", group : "Data"},

			/**
			 * If set, a button to add a row will be shown. If the button is pressed the <code>addRow</code> event is fired
			 */
			showAddRowButton : {type : "boolean", group : "Misc", defaultValue : true},

			/**
			 * If set, a button to add an appointment will be shown. If the button is pressed the <code>addAppointment</code> event is fired
			 */
			showAddAppointmentButton : {type : "boolean", group : "Misc", defaultValue : true},

			/**
			 * Width of the <code>TeamCalendar</code>
			 */
			width : {type : "sap.ui.core.CSSSize", group : "Dimension", defaultValue : null},

			/**
			 * Height of the <code>TeamCalendar</code>
			 */
			height : {type : "sap.ui.core.CSSSize", group : "Dimension", defaultValue : null}

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
			 * <code>SearchField</code> displayed in the <code>TeamCalendar</code>.
			 * The search must be implemented by the calling application because the <code>TeamCalendar</code> might not have access
			 * to all of the data and the backend.
			 * <b>Note:</b> From interaction design purpose this <code>SearchField</code> should only search for displayed <code>TeamCalendarRows</code>,
			 * not for appointments or any other things.
			 */
			searchField : {type : "sap.m.SearchField", multiple : false},

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
			 * Fired if the button to add a row is pressed
			 */
			addRow : {},

			/**
			 * Fired if the button to add an appointment is pressed
			 */
			addAppointment : {},

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
			startDateChange : {}
		}
	}});

	(function() {

		var CalendarHeader = sap.ui.core.Control.extend("CalendarHeader", {

			metadata : {
				aggregations: {
					"toolbar"   : {type: "sap.m.Toolbar", multiple: false}
				},
				associations: {
					"searchField" : {type: "sap.m.SearchField", multiple: false}
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

				var oSearchField = sap.ui.getCore().byId(oHeader.getSearchField());
				if (oSearchField) {
					oRm.renderControl(oSearchField);
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

			this._oToolbarSpacer = new sap.m.ToolbarSpacer(this.getId() + "-ToolbarSpacer");

			this._oToolbar = new sap.m.Toolbar(this.getId() + "-Toolbar", {
				design: sap.m.ToolbarDesign.Transpaent,
				content: [this._oIntervalTypeSelect, this._oTodayButton, this._oToolbarSpacer] // add as toolbar content even getContent is overwritten to have correct parent relation
			});
			this._oToolbar._oTeamCalendar = this;
			this._oToolbar.getContent = function() {
				return this._oTeamCalendar._getToolbarContent();
			};

			this._oTitle = new sap.m.Title(this.getId() + "-Title");

			this._oHeaderToolbar = new sap.m.Toolbar(this.getId() + "-HeaderToolbar", {
				design: sap.m.ToolbarDesign.Transpaent,
				content: [this._oTitle, new sap.m.ToolbarSpacer(this.getId() + "-HeadToolbarSpacer")]
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
				headerToolbar: this._oToolbar,
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
				this._oTimeInterval.destroy();
				this._oTimeInterval = undefined;
			}

			if (this._oDateInterval) {
				this._oDateInterval.destroy();
				this._oDateInterval = undefined;
			}

			if (this._oMonthInterval) {
				this._oMonthInterval.destroy();
				this._oMonthInterval = undefined;
			}

			if (!this.getShowAddRowButton() && this._oAddRowButton) {
				this._oAddRowButton.destroy();
				this._oAddRowButton = undefined;
			}

			if (!this.getShowAddAppointmentButton() && this._oAddAppointmentButton) {
				this._oAddAppointmentButton.destroy();
				this._oAddAppointmentButton = undefined;
			}

			if (this._aViews) {
				for (var i = 0; i < this._aViews.length; i++) {
					this._aViews[i].destroy();
				}
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

			_addToolbarButtons.call(this);

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
							items: iIntervals
						});
						this._oTimeInterval.attachEvent("startDateChange", _handleStartDateChange, this);
						this._oTimeInterval.attachEvent("select", _handleIntervalSelect, this);
					}else if (this._oTimeInterval.getItems() != iIntervals) {
						this._oTimeInterval.setItems(iIntervals);
					}
					this._oInfoToolbar.addContent(this._oTimeInterval);
					break;

				case sap.ui.unified.CalendarIntervalType.Day:
					if (!this._oDateInterval) {
						this._oDateInterval = new sap.ui.unified.CalendarDateInterval(this.getId() + "-DateInt", {
							startDate: new Date(oStartDate.getTime()), // use new date object
							days: iIntervals
						});
						this._oDateInterval.attachEvent("startDateChange", _handleStartDateChange, this);
						this._oDateInterval.attachEvent("select", _handleIntervalSelect, this);
					}else if (this._oDateInterval.getDays() != iIntervals) {
						this._oDateInterval.setDays(iIntervals);
					}
					this._oInfoToolbar.addContent(this._oDateInterval);
					break;

				case sap.ui.unified.CalendarIntervalType.Month:
					if (!this._oMonthInterval) {
						this._oMonthInterval = new sap.ui.unified.CalendarMonthInterval(this.getId() + "-MonthInt", {
							startDate: new Date(oStartDate.getTime()), // use new date object
							months: iIntervals
						});
						this._oMonthInterval.attachEvent("startDateChange", _handleStartDateChange, this);
						this._oMonthInterval.attachEvent("select", _handleIntervalSelect, this);
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
				}

				if (this.getDomRef()) {
					// only set timer, CalendarRow will be rerendered, so no update needed here
					_updateCurrentTimeVisualization.call(this, false);
				}
			}

			return this;

		};

		TeamCalendar.prototype.addRow = function(oRow) {

			this.addAggregation("rows", oRow, true);

			var oTable = this.getAggregation("table");
			oTable.addItem(oRow.getColumnListItem());

			var oCalendarRow = oRow.getCalendarRow();
			oCalendarRow.setStartDate(this.getStartDate());
			oCalendarRow.attachEvent("select", _handleAppointmentSelect, this);

			if (this.getDomRef()) {
				var sKey = this.getViewKey();
				var oView = _getView.call(this, sKey);
				var sIntervalType = oView.getIntervalType();
				var iIntervals = _getIntervals.call(this, oView);
				oCalendarRow.setIntervalType(sIntervalType);
				oCalendarRow.setIntervals(iIntervals);
			}

			return this;

		};

		TeamCalendar.prototype.insertRow = function(oRow, iIndex) {

			this.insertAggregation("rows", oRow, iIndex);

			var oTable = this.getAggregation("table");
			oTable.insertItem(oRow.getColumnListItem(), iIndex, true);

			var oCalendarRow = oRow.getCalendarRow();
			oCalendarRow.setStartDate(this.getStartDate());
			oCalendarRow.attachEvent("select", _handleAppointmentSelect, this);

			if (this.getDomRef()) {
				var sKey = this.getViewKey();
				var oView = _getView.call(this, sKey);
				var sIntervalType = oView.getIntervalType();
				var iIntervals = _getIntervals.call(this, oView);
				oCalendarRow.setIntervalType(sIntervalType);
				oCalendarRow.setIntervals(iIntervals);
			}

			return this;

		};

		TeamCalendar.prototype.removeRow = function(vObject) {

			var oRemoved = this.removeAggregation("rows", vObject, true);

			var oTable = this.getAggregation("table");
			oTable.removeItem(oRemoved.getColumnListItem(), true);

			var oCalendarRow = oRemoved.getCalendarRow();
			oCalendarRow.detachEvent("select", _handleAppointmentSelect, this);

			return oRemoved;

		};

		TeamCalendar.prototype.removeAllRows = function() {

			var aRemoved = this.removeAllAggregation("rows", true);

			var oTable = this.getAggregation("table");
			oTable.removeAllItems(true);

			for (var i = 0; i < aRemoved.length; i++) {
				var oRow = aRemoved[i];
				var oCalendarRow = oRow.getCalendarRow();
				oCalendarRow.detachEvent("select", _handleAppointmentSelect, this);
			}

			return aRemoved;

		};

		TeamCalendar.prototype.destroyRows = function() {

			var destroyed = this.destroyAggregation("rows", true);

			var oTable = this.getAggregation("table");
			oTable.destroyItems(true);

			return destroyed;

		};

		TeamCalendar.prototype.setSingleSelection = function(bSingleSelection) {

			this.setProperty("singleSelection", bSingleSelection, true);

			var oTable = this.getAggregation("table");
			if (bSingleSelection) {
				oTable.setMode(sap.m.ListMode.SingleSelectMaster);
			} else {
				oTable.setMode(sap.m.ListMode.MultiSelect);
			}

		};

		TeamCalendar.prototype.setTitle = function(sTitle){

			this.setProperty("title", sTitle, true);
			this._oTitle.setText(sTitle);
			return this;

		};

		TeamCalendar.prototype.setSearchField = function(oSearchField){

			this.setAggregation("searchField", oSearchField, true);
			this._oCalendarHeader.setSearchField(oSearchField);
			return this;

		};

		/*
		 * overwrites the getContent function of the toolbar to allow to mix static content from the TeamCalendar
		 * and application content.
		 *
		 * @private
		 */
		TeamCalendar.prototype._getToolbarContent = function(){

			var aContent = [];
			aContent.push(this._oIntervalTypeSelect);
			aContent.push(this._oTodayButton);
			aContent.push(this._oToolbarSpacer);

			jQuery.merge(aContent, this.getToolbarContent());

			if (this.getShowAddAppointmentButton()) {
				if (!this._oAddAppointmentButton) {
					this._oAddAppointmentButton = new sap.m.Button(this.getId() + "-AddAppointment", {
						icon: "sap-icon://add",
						type: sap.m.ButtonType.Transparent
					});
					this._oAddAppointmentButton.attachEvent("press", _handleAddAppointmentPress, this);
				}
				aContent.push(this._oAddAppointmentButton);
				if (this._oToolbar.indexOfContent(this._oAddAppointmentButton) < 0) {
					this._oToolbar.addContent(this._oAddAppointmentButton); // add as toolbar content even getContent is overwritten to have correct parent relation
				}
			}else if (this._oToolbar.indexOfContent(this._oAddAppointmentButton) >= 0) {
				this._oToolbar.removeContent(this._oAddAppointmentButton);
			}

			return aContent;

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

		function _changeIntervalType(oEvent) {

			this.setViewKey(oEvent.getParameter("selectedItem").getKey());

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
			var oSelectedDate = aSelectedDates[0].getStartDate();
			var sKey = this.getViewKey();
			var aViews = _getViews.call(this);
			var oView;
			var i = 0;

			for (i = 0; i < aViews.length; i++) {
				oView = aViews[i];
				if (oView.getKey() == sKey) {
					break;
				}
			}

			if (i > 0) {
				this.setStartDate(oSelectedDate);
				this.setViewKey(aViews[i - 1].getKey());
			}

			// remove old selection
			aSelectedDates[0].setStartDate();

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

		function _addToolbarButtons() {

			if (this.getShowAddRowButton()) {
				if (!this._oAddRowButton) {
					this._oAddRowButton = new sap.m.Button(this.getId() + "-AddRow", {
						icon: "sap-icon://add",
						type: sap.m.ButtonType.Transparent
					});
					this._oAddRowButton.attachEvent("press", _handleAddRowPress, this);
				}
				this._oHeaderToolbar.addContent(this._oAddRowButton);
			}else if (this._oAddRowButton) {
				this._oHeaderToolbar.removeContent(this._oAddRowButton);
			}

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

			this.fireRowSelectionChange({rows: aChangedRows});

		}

		function _handleAddRowPress(oEvent) {

			this.fireAddRow();

		}

		function _handleAddAppointmentPress(oEvent) {

			this.fireAddAppointment();

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

	}());

	return TeamCalendar;

}, /* bExport= */ true);
