/*!
 * ${copyright}
 */

// Provides control sap.m.SinglePlanningCalendarMonthGrid.
sap.ui.define([
	'sap/ui/core/Control',
	'sap/ui/core/format/DateFormat',
	'sap/ui/unified/calendar/CalendarDate',
	'sap/ui/unified/calendar/CalendarUtils',
	'sap/ui/unified/DateTypeRange',
	'sap/ui/unified/library',
	'sap/ui/core/LocaleData',
	'sap/ui/core/Locale',
	'sap/ui/core/delegate/ItemNavigation',
	'sap/ui/core/dnd/DragDropInfo',
	'sap/ui/core/CustomData',
	'sap/ui/events/KeyCodes',
	'sap/base/Log',
	'sap/ui/core/Core',
	'./Link',
	'./library',
	'./PlanningCalendarLegend',
	'./SinglePlanningCalendarMonthGridRenderer',
	'sap/ui/thirdparty/jquery',
	'sap/ui/core/InvisibleMessage',
	'sap/ui/core/library',
	"sap/ui/core/date/CalendarWeekNumbering",
	"sap/ui/core/date/CalendarUtils",
	"sap/ui/core/Configuration",
	"sap/ui/core/date/UI5Date",
	"sap/ui/unified/DateRange"
	],
	function (
		Control,
		DateFormat,
		CalendarDate,
		CalendarUtils,
		DateTypeRange,
		unifiedLibrary,
		LocaleData,
		Locale,
		ItemNavigation,
		DragDropInfo,
		CustomData,
		KeyCodes,
		Log,
		Core,
		Link,
		library,
		PlanningCalendarLegend,
		SinglePlanningCalendarMonthGridRenderer,
		jQuery,
		InvisibleMessage,
		coreLibrary,
		CalendarWeekNumbering,
		CalendarDateUtils,
		Configuration,
		UI5Date,
		DateRange
	) {
		"use strict";

		var APP_HEIGHT_COMPACT = 1.5625; //rem
		var CELL_HEADER_HEIGHT_COMPACT = 1.5; //rem
		var APP_HEIGHT_COZY = 2.125; //rem
		var CELL_HEADER_HEIGHT_COZY = 1.75; //rem
		var InvisibleMessageMode = coreLibrary.InvisibleMessageMode;
		var SinglePlanningCalendarSelectionMode = library.SinglePlanningCalendarSelectionMode;
		var LinkAccessibleRole = library.LinkAccessibleRole;

		/**
		 * Constructor for a new <code>SinglePlanningCalendarMonthGrid</code>.
		 *
		 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
		 * @param {object} [mSettings] Initial settings for the new control
		 *
		 * @class
		 *
		 * Displays a grid for the <code>SinglePlanningCalendarMonthView</code> in which appointments are rendered.
		 *
		 * <h3>Overview</h3>
		 *
		 * The <code>SinglePlanningCalendarMonthGrid</code> has the following structure:
		 *
		 * <ul>
		 *     <li>The grid shows one whole month.</li>
		 *     <li>Each cell in the grid represents a single day.</li>
		 *     <li>Each row represents a week.</li>
		 *     <li>Appointments are displayed as a list inside each day.
		 *     They are sorted by their start dates.
		 *     Their widths do not show their durations.</li>
		 * </ul>
		 *
		 * @extends sap.ui.core.Control
		 *
		 * @author SAP SE
		 * @version ${version}
		 *
		 * @constructor
		 * @private
		 * @alias sap.m.SinglePlanningCalendarMonthGrid
		 */
		var SinglePlanningCalendarMonthGrid = Control.extend("sap.m.SinglePlanningCalendarMonthGrid", /** @lends sap.m.SinglePlanningCalendarMonthGrid.prototype */ {
			metadata: {

				library: "sap.m",

				properties: {

					/**
					 * Determines the start date of the grid, as a UI5Date or JavaScript Date object. It is considered as a local date.
					 * The time part will be ignored. The current date is used as default.
					 */
					startDate: { type: "object", group: "Data" },

					/**
					 * Determines whether the appointments in the grid are draggable.
					 *
					 * The drag and drop interaction is visualized by a placeholder highlighting the area where the
					 * appointment can be dropped by the user.
					 */
					enableAppointmentsDragAndDrop: { type: "boolean", group: "Misc", defaultValue: false },

					/**
					 * If set, the first day of the displayed week is this day. Valid values are 0 to 6 starting on Sunday.
					 * If there is no valid value set, the default of the used locale is used.
					 *
					 * @since 1.98
					 */
					firstDayOfWeek : {type : "int", group : "Appearance", defaultValue : -1},
					/**
			 		 * If set, the calendar week numbering is used for display.
					 * If not set, the calendar week numbering of the global configuration is used.
					 * Note: This property should not be used with firstDayOfWeek property.
					 * @since 1.110.0
					 */
					calendarWeekNumbering : { type : "sap.ui.core.date.CalendarWeekNumbering", group : "Appearance", defaultValue: null},

					/**
					 * Determines whether more than one day will be selectable.
					 * <b>Note:</b> selecting more than one day is possible with a combination of <code>Ctrl + mouse click</code>
					 */
					 dateSelectionMode: { type: "sap.m.SinglePlanningCalendarSelectionMode", group: "Behavior", defaultValue: SinglePlanningCalendarSelectionMode.SingleSelect }

				},
				aggregations: {

					/**
					 * The appointments to be displayed in the grid. Appointments outside the visible time frame are not rendered.
					 * Appointments longer than a day are displayed in all of the affected days.
					 */
					appointments: { type: "sap.ui.unified.CalendarAppointment", multiple: true, singularName: "appointment", dnd: { draggable: true }},

					/**
					 * The special days in the header visualized as a date range with type.
					 *
					 * <b>Note:</b> If one day is assigned to more than one type, only the first type is used.
					 */
					specialDates: { type: "sap.ui.unified.DateTypeRange", multiple: true, singularName: "specialDate" },

					_appsPlaceholders: { type: "sap.m.SinglePlanningCalendarMonthGrid._internal.IntervalPlaceholder", multiple: true, visibility: "hidden", dnd: { droppable: true } },

					/**
					 * Dates or date ranges for selected dates.
					 *
					 * To set a single date (instead of a range), set only the <code>startDate</code> property
					 * of the {@link sap.ui.unified.DateRange} class.
					 */
					selectedDates : {type : "sap.ui.unified.DateRange", multiple : true, singularName : "selectedDate"}
				},
				dnd: true,
				associations: {
					/**
					 * Association to the <code>PlanningCalendarLegend</code> explaining the colors of the <code>Appointments</code>.
					 *
					 * <b>Note:</b> The legend does not have to be rendered but must exist and all required types must be assigned.
					 */
					legend: { type: "sap.m.PlanningCalendarLegend", multiple: false }
				},
				events: {
					/**
					 * Fired when a grid cell is pressed.
					 */
					cellPress: {
						parameters: {
							/**
							 * The start date as a UI5Date or JavaScript Date object of the focused grid cell.
							 */
							startDate: { type: "object" },
							/**
							 * The end date as a UI5Date or JavaScript Date object of the focused grid cell.
							 */
							endDate: { type: "object" }
						}
					},
					/**
					 * Fired when a 'more' button is pressed.
					 * <b>Note:</b> The 'more' button appears when multiple appointments
					 * exist and the available space is not sufficient to display all of them.
					 */
					moreLinkPress: {
						parameters: {
							/**
							 * The date as a UI5Date or JavaScript Date object of the cell with the
							 * pressed more link.
							 */
							date: { type: "object" }
						}
					},
					/**
					 * Fired if an appointment is dropped.
					 */
					appointmentDrop: {
						parameters: {
							/**
							 * The dropped appointment.
							 */
							appointment: { type: "sap.ui.unified.CalendarAppointment" },

							/**
							 * Start date of the dropped appointment as a UI5Date or JavaScript Date object.
							 */
							startDate: { type: "object" },

							/**
							 * End date of the dropped appointment as a UI5Date or JavaScript Date object.
							 */
							endDate: { type: "object" },

							/**
							 * Determines whether the drop type is to copy the appointment (when <code>true</code>) or to move it.
							 */
							copy: { type: "boolean" }
						}
					},
					/**
					 * Fired when the selected state of an appointment is changed.
					 * @since 1.72
					 */
					appointmentSelect: {
						parameters: {

							/**
							 * The appointment on which the event was triggered.
							 */
							appointment: {type: "sap.ui.unified.CalendarAppointment"},
							/**
							 * All appointments with changed selected state.
							 */
							appointments : {type : "sap.ui.unified.CalendarAppointment[]"}

						}
					}
				}
			},

			renderer: SinglePlanningCalendarMonthGridRenderer
		});

		SinglePlanningCalendarMonthGrid.prototype.init = function() {
			this._aLinks = [];
			this._handleMorePress = this._handleMorePress.bind(this);
			this._oDateFormat = DateFormat.getDateTimeInstance({ pattern: "YYYYMMdd" });
			this._oFormatAriaApp = DateFormat.getDateTimeInstance({
				pattern: "EEEE dd/MM/YYYY 'at' " + this._getCoreLocaleData().getTimePattern("medium")
			});
			this._oFormatAriaFullDayCell = DateFormat.getDateTimeInstance({
				pattern: "EEEE dd/MM/YYYY"
			});

			this.setStartDate(UI5Date.getInstance());
			this._configureAppointmentsDragAndDrop();

			this._oUnifiedRB = sap.ui.getCore().getLibraryResourceBundle("sap.ui.unified");
		};

		SinglePlanningCalendarMonthGrid.prototype.exit = function() {
			if (this._oItemNavigation) {
				this.removeDelegate(this._oItemNavigation);
				this._oItemNavigation.destroy();
				delete this._oItemNavigation;
			}

			for (var i = 0; i < this._aLinks.length; i++) {
				if (this._aLinks[i]) {
					this._aLinks[i].destroy();
				}
			}
			delete this._aLinks;
		};

		SinglePlanningCalendarMonthGrid.prototype.onBeforeRendering = function() {
			var oStartDate = this.getStartDate();

			this._oAppointmentsToRender = this._calculateAppointmentsNodes(oStartDate);
			this._createAppointmentsDndPlaceholders(oStartDate);
			this._oInvisibleMessage = InvisibleMessage.getInstance();

			if (this.getFirstDayOfWeek() !== -1 && this.getCalendarWeekNumbering()) {
				Log.warning("Both properties firstDayOfWeek and calendarWeekNumbering should not be used at the same time!");
			}
		};

		SinglePlanningCalendarMonthGrid.prototype._checkDateSelected = function(oDay) {
			var aSelectedDate = this.getAggregation("selectedDates");
			var oRange;
			var oStartDate;
			var oEndDate;
			if (!aSelectedDate) {
				return false;
			}

			for (var i = 0; i < aSelectedDate.length; i++) {
				oRange = aSelectedDate[i];

				oStartDate = oRange.getStartDate() && CalendarDate.fromLocalJSDate(oRange.getStartDate());
				oEndDate = oRange.getEndDate() && CalendarDate.fromLocalJSDate(oRange.getEndDate());

				if (oStartDate && oDay.isSame(oStartDate) || (oStartDate && oEndDate && oDay.isSameOrAfter(oStartDate) && oDay.isSameOrBefore(oEndDate))) {
					return true;
				}
			}

			return false;
		};

		SinglePlanningCalendarMonthGrid.prototype.onAfterRendering = function() {
			this._initItemNavigation();
		};

		SinglePlanningCalendarMonthGrid.prototype._getColumns = function() {
			return 7;
		};

		SinglePlanningCalendarMonthGrid.prototype._getRows = function() {
			return 6;
		};

		SinglePlanningCalendarMonthGrid.prototype._getDateFormatter = function() {
			return this._oDateFormat;
		};

		SinglePlanningCalendarMonthGrid.prototype._getAppointmetsForADay = function(oDate) {
			return this._oAppointmentsToRender.filter(function(app) {
				return app.start.valueOf() === oDate.valueOf();
			});
		};

		SinglePlanningCalendarMonthGrid.prototype._getPreviousAppointmetsForADay = function(oDate) {
			return this._oAppointmentsToRender.filter(function(app) {
				return app.start.valueOf() < oDate.valueOf()
					&& app.end.valueOf() >= oDate.valueOf();
			}).map(function(app) {
				// adjust their widths because we could render
				// them in several weeks separately
				var newApp = {
					data: app.data,
					start: app.start,
					end: app.end,
					len: app.len,
					level: app.level,
					width: app.width
				};

				newApp.width -= CalendarUtils._daysBetween(oDate, app.start);
				newApp.hasPrevious = true;

				return newApp;
			}, this);
		};

		/**
		 * Handles the <code>tap</code> event on the grid.
		 *
		 * @param {jQuery.Event} oEvent The event object
		 */
		SinglePlanningCalendarMonthGrid.prototype.ontap = function(oEvent) {
			var bMultiDateSelection = SinglePlanningCalendarSelectionMode.MultiSelect === this.getDateSelectionMode();
			if (!bMultiDateSelection && !(oEvent.metaKey || oEvent.ctrlKey)) {
				this.removeAllSelectedDates();
			}
			this._bMultiDateSelect = true;
			this._fireSelectionEvent(oEvent);
		};

		SinglePlanningCalendarMonthGrid.prototype._rangeSelection = function(oStartDate) {
			var oCurrentDate = UI5Date.getInstance(oStartDate),
				_bSelectWeek = false,
				oTarget,
				i,
				oCurrentDateUTCTimestamp;

			for (i = 0; i < 7; i++) {
				if (!this._checkDateSelected(CalendarDate.fromLocalJSDate(oCurrentDate))) {
					_bSelectWeek = true;
					break;
				}
				oCurrentDate.setDate(oCurrentDate.getDate() + 1);
			}

			oCurrentDate = UI5Date.getInstance(oStartDate);

			for (i = 0; i < 7; i++) {
				oCurrentDateUTCTimestamp = Date.UTC(oCurrentDate.getFullYear(), oCurrentDate.getMonth(), oCurrentDate.getDate());
				oTarget = document.querySelector('[sap-ui-date="' + oCurrentDateUTCTimestamp + '"]');
				if (!(_bSelectWeek && oTarget && oTarget.classList.contains("sapMSPCMonthDaySelected"))){
					this._toggleMarkCell(oTarget, oCurrentDate);
				}
				oCurrentDate.setDate(oCurrentDate.getDate() + 1);
			}
		};

		SinglePlanningCalendarMonthGrid.prototype.removeAllSelectedDates = function() {
			this.removeAllAggregation("selectedDates");
		};

		/**
		 * Handles the <code>keydown</code> event when any key is pressed.
		 *
		 * @param {jQuery.Event} oEvent The event object.
		 */
		SinglePlanningCalendarMonthGrid.prototype.onkeydown = function(oEvent) {
			var bMultiDateSelection = SinglePlanningCalendarSelectionMode.MultiSelect === this.getDateSelectionMode();

			if (oEvent.which === KeyCodes.SPACE || oEvent.which === KeyCodes.ENTER || oEvent.which === KeyCodes.ARROW_UP ||
				oEvent.which === KeyCodes.ARROW_DOWN || oEvent.which === KeyCodes.ARROW_LEFT || oEvent.which === KeyCodes.ARROW_RIGHT) {
				if (oEvent.which === KeyCodes.SPACE && !oEvent.shiftKey && bMultiDateSelection) {
					this._bMultiDateSelect = true;
				} else if (oEvent.which === KeyCodes.SPACE && oEvent.shiftKey && bMultiDateSelection) {
					this._bCurrentWeekSelection = true;
				} else if (
					(oEvent.which === KeyCodes.ARROW_UP ||  oEvent.which === KeyCodes.ARROW_DOWN ||
					oEvent.which === KeyCodes.ARROW_LEFT || oEvent.which === KeyCodes.ARROW_RIGHT) &&
					oEvent.shiftKey && bMultiDateSelection) {
						this._bMultiDateSelectWithArrow = true;
				}

				this._fireSelectionEvent(oEvent);

				var oControl = this._findSrcControl(oEvent);
				if (oControl && oControl.isA("sap.ui.unified.CalendarAppointment")) {
					var sBundleKey = oControl.getSelected() ? "APPOINTMENT_SELECTED" : "APPOINTMENT_UNSELECTED";
					this._oInvisibleMessage.announce(this._oUnifiedRB.getText(sBundleKey), InvisibleMessageMode.Polite);
				}

				// Prevent scrolling
				oEvent.preventDefault();
			}
		};

		SinglePlanningCalendarMonthGrid.prototype._findSrcControl = function (oEvent) {
			// data-sap-ui-related - This is a relation to appointment object.
			// This is the connection between the DOM Element and the Object representing an appointment.
			var oTargetElement = oEvent.target,
				oTargetsParentElement = oTargetElement.parentElement,
				sAppointmentId;
			if (!oTargetsParentElement || oTargetsParentElement.classList.contains("sapMSPCMonthDays")) {
				return oEvent.srcControl;
			} else if (oTargetsParentElement.classList.contains("sapUiCalendarRowApps")) {
				sAppointmentId = oTargetsParentElement.getAttribute("data-sap-ui-related") || oTargetsParentElement.id;
			} else {
				sAppointmentId = oTargetElement.getAttribute("data-sap-ui-related") || oTargetElement.id;
			}

			// finding the appointment
			return this.getAppointments().find(function (oAppointment) {
				return oAppointment.sId === sAppointmentId;
			});
		};

		SinglePlanningCalendarMonthGrid.prototype._handelMultiDateSelection = function (oTarget, oStartDate,  oEndDate, oEvent) {

			if (this._bMultiDateSelect) {
				this._bMultiDateSelect = false;
				this._toggleMarkCell(oTarget, oStartDate);

			} else if (this._bMultiDateSelectWithArrow){
				this._bMultiDateSelectWithArrow = false;
				var oDate = UI5Date.getInstance(CalendarDate.fromLocalJSDate(oStartDate));

				switch (oEvent.which) {
					case KeyCodes.ARROW_UP : oDate.setDate(oDate.getDate() - 7); break;
					case KeyCodes.ARROW_DOWN : oDate.setDate(oDate.getDate() + 7); break;
					case KeyCodes.ARROW_LEFT: oDate.setDate(oDate.getDate() - 1); break;
					case KeyCodes.ARROW_RIGHT: oDate.setDate(oDate.getDate() + 1); break;
					default: break;
				}

				oTarget = document.querySelector('[sap-ui-date="' + oDate.getTime() + '"]');
				oStartDate = UI5Date.getInstance(oDate.getTime());
				oStartDate = UI5Date.getInstance(oDate.getUTCFullYear(), oStartDate.getUTCMonth(), oStartDate.getUTCDate());
				this._toggleMarkCell(oTarget, oStartDate);

			} else if (this._bCurrentWeekSelection && SinglePlanningCalendarSelectionMode.MultiSelect === this.getDateSelectionMode()){
				var iStartDate = oStartDate.getDate(),
					oWeekConfigurationValues = CalendarDateUtils.getWeekConfigurationValues(this.getCalendarWeekNumbering(), new Locale(Configuration.getFormatSettings().getFormatLocale().toString())),
					iAPIFirstDayOfWeek = this.getFirstDayOfWeek(),
					iFirstDayOfWeek,
					iWeekStartDate;

				this._bCurrentWeekSelection = false;
				if (iAPIFirstDayOfWeek < 0 || iAPIFirstDayOfWeek > 6) {

					if (oWeekConfigurationValues) {
						iFirstDayOfWeek = oWeekConfigurationValues.firstDayOfWeek;
					} else {
						var oLocaleData = this._getCoreLocaleData();
						iFirstDayOfWeek = oLocaleData.getFirstDayOfWeek();
					}
				} else {
					iFirstDayOfWeek = iAPIFirstDayOfWeek;
				}
				iWeekStartDate = iStartDate - oStartDate.getDay() + iFirstDayOfWeek;
				if (iWeekStartDate > iStartDate) {
					iWeekStartDate -= 7;
				}
				oStartDate.setDate(iWeekStartDate);
				oEndDate.setDate(oStartDate.getDate() + 6);
				this._rangeSelection(oStartDate, oEndDate);
			}
		};

		/**
		 * Helper function handling <code>keydown</code> or <code>tap</code> event on the grid.
		 *
		 * @param {jQuery.Event} oEvent The event object.
		 */
		SinglePlanningCalendarMonthGrid.prototype._fireSelectionEvent = function (oEvent) {
			var oSrcControl = this._findSrcControl(oEvent),
				oTarget = oEvent.target,
				bIsCell = oTarget && oTarget.classList.contains("sapMSPCMonthDay"),
				bIsLink = oTarget && oTarget.classList.contains("sapMLnk"),
				bWeekNumberSelect = oTarget && oTarget.classList.contains("sapMSPCMonthWeekNumber"),
				oFirstSiblingElement = bWeekNumberSelect && oEvent.originalEvent.target.nextSibling.children[0],
				iTimestamp,
				oStartDate,
				oEndDate;

			if (oSrcControl && oSrcControl.isA("sap.m.SinglePlanningCalendarMonthGrid") && bIsCell && !bIsLink) {
				iTimestamp = parseInt(oTarget.getAttribute("sap-ui-date"));

				oStartDate = UI5Date.getInstance(iTimestamp);
				oStartDate = UI5Date.getInstance(oStartDate.getUTCFullYear(), oStartDate.getUTCMonth(), oStartDate.getUTCDate());

				oEndDate = UI5Date.getInstance(oStartDate);
				oEndDate.setDate(oEndDate.getDate() + 1);
				if (this._bMultiDateSelect || this._bCurrentWeekSelection || this._bMultiDateSelectWithArrow) {
					this._handelMultiDateSelection(oTarget, oStartDate, oEndDate, oEvent);
					this.fireEvent("selectDate", {startDate: oStartDate, endDate: oEndDate});
				}

				this.fireEvent("cellPress", {startDate: oStartDate, endDate: oEndDate});
				this.fireAppointmentSelect({
					appointment: undefined,
					appointments: this._toggleAppointmentSelection(undefined, true)
				});
			} else if (bWeekNumberSelect) {
				iTimestamp = parseInt(oFirstSiblingElement.getAttribute("sap-ui-date"));
				oStartDate = UI5Date.getInstance(iTimestamp);
				oStartDate = UI5Date.getInstance(oStartDate.getUTCFullYear(), oStartDate.getUTCMonth(), oStartDate.getUTCDate());

				oEndDate = UI5Date.getInstance(oStartDate);
				oEndDate.setDate(oEndDate.getDate() + 6);

				this._bCurrentWeekSelection = true;
				this._bMultiDateSelect = false;
				this._handelMultiDateSelection(oTarget, oStartDate, oEndDate, oEvent);
				this.fireEvent("selectDate", {startDate: oStartDate, endDate: oEndDate});

			} else if (oSrcControl && oSrcControl.isA("sap.ui.unified.CalendarAppointment")) {
				// add suffix in appointment
				if (oTarget.parentElement && oTarget.parentElement.getAttribute("id")) {
					var sTargetId = oTarget.parentElement.getAttribute("id");

					// data-sap-ui-related - This is a relation to appointment object.
					// This is the connection between the DOM Element and the Object representing an appointment.
					var sBaseIDPart = oTarget.parentElement.getAttribute("data-sap-ui-related");
					var sSuffix = sTargetId.replace(sBaseIDPart + "-", "");

					oSrcControl._setAppointmentPartSuffix(sSuffix);
				}

				this.fireAppointmentSelect({
					appointment: oSrcControl,
					appointments: this._toggleAppointmentSelection(oSrcControl, !(oEvent.ctrlKey || oEvent.metaKey))
				});
			}
		};

		SinglePlanningCalendarMonthGrid.prototype._toggleMarkCell = function (oTarget, oDay) {
			if (oTarget && !oTarget.classList.contains("sapMSPCMonthDaySelected")) {
				this.addAggregation("selectedDates", new DateRange({startDate: UI5Date.getInstance(oDay)}));
			} else {
				var aSelectedDates = this.getAggregation("selectedDates");

				if (!aSelectedDates) {
					return;
				}

				for (var i = 0; i < aSelectedDates.length; i++){
					var oSelectStartDate = aSelectedDates[i].getStartDate();
					if (CalendarDate.fromLocalJSDate(oSelectStartDate).isSame(CalendarDate.fromLocalJSDate(oDay))) {
						this.removeAggregation("selectedDates", i);
						break;
					}
				}
			}
		};

		/**
		 * Selects or deselects an appointment that is passed as a parameter. If it is selected, it is going to be
		 * deselected and vice versa. If modifier keys are pressed - the previously selected appointments will be
		 * preserved.
		 *
		 * @param {sap.m.CalendarAppointment} oAppointment The appointment to be selected/deselected.
		 * @param {boolean} [bRemoveOldSelection=false] If true, previously selected appointments will be deselected.
		 * @returns {array} Array of the appointments with changed selected state
		 * @private
		 */
		SinglePlanningCalendarMonthGrid.prototype._toggleAppointmentSelection = function (oAppointment, bRemoveOldSelection) {
			var aChangedApps = [],
				oAppointmentDomRef = oAppointment && oAppointment.getDomRef(),
				aAppointments,
				iAppointmentsLength,
				i;

			if (bRemoveOldSelection) {
				aAppointments = this.getAppointments();
				for (i = 0, iAppointmentsLength = aAppointments.length; i < iAppointmentsLength; i++) {
					// Deselecting all selected appointments if a grid cell is focused or
					// all selected appointments different than the currently focused appointment
					if ( (!oAppointment || aAppointments[i].getId() !== oAppointment.getId()) && aAppointments[i].getSelected()) {
						aAppointments[i].setProperty("selected", false);
						aChangedApps.push(aAppointments[i]);
					}
				}
			}

			if (oAppointment) {
				oAppointment.setProperty("selected", !oAppointment.getSelected());
				aChangedApps.push(oAppointment);
				this._sSelectedAppointment = oAppointment.getSelected() && oAppointmentDomRef ? oAppointment : undefined;
			} else {
				this._sSelectedAppointment = undefined;
			}

			return aChangedApps;
		};

		SinglePlanningCalendarMonthGrid.prototype._getMoreLink = function(iAppointmentsCount, oCalendarDate, iCellIndex) {
			var sMore = Core
					.getLibraryResourceBundle("sap.m")
					.getText("SPC_MORE_LINK", [iAppointmentsCount.toString()]),
				oLink = new Link({
					accessibleRole: LinkAccessibleRole.Button,
					text: sMore,
					press: this._handleMorePress
				}).addCustomData(new CustomData({
					key: "date",
					value: oCalendarDate.valueOf().toString(),
					writeToDom: true
				}));

			if (this._aLinks[iCellIndex]) {
				this._aLinks[iCellIndex].destroy();
			}
			this._aLinks[iCellIndex] = oLink;

			return oLink;
		};

		SinglePlanningCalendarMonthGrid.prototype._handleMorePress = function(oEvent) {
			var iTimestamp = parseInt(oEvent.getSource().getCustomData()[0].getValue()),
				oDate = UI5Date.getInstance(iTimestamp);

			oDate = UI5Date.getInstance(oDate.getUTCFullYear(), oDate.getUTCMonth(), oDate.getUTCDate());

			this.fireEvent("moreLinkPress", { date: oDate });
		};

		SinglePlanningCalendarMonthGrid.prototype._getCoreLocaleData = function() {
			var sLocale = Core.getConfiguration().getFormatSettings().getFormatLocale().toString(),
				oLocale = new Locale(sLocale);

			return LocaleData.getInstance(oLocale);
		};

		SinglePlanningCalendarMonthGrid.prototype._getCells = function() {
			return this._getVisibleDays(this.getStartDate());
		};

		SinglePlanningCalendarMonthGrid.prototype._getVerticalLabels = function() {
			var aDays = this._getVisibleDays(this.getStartDate()),
				iColumns = this._getColumns(),
				aResult = [],
				sLocale = Core.getConfiguration().getFormatLocale().toString();

			for (var i = 0; i < this._getRows(); i++) {
				var oDateFormat = DateFormat.getInstance({pattern: "w", calendarType: "Gregorian", calendarWeekNumbering: this.getCalendarWeekNumbering()}, new Locale(sLocale));
				var iWeekNumber = Number(oDateFormat.format(aDays[i * iColumns].toUTCJSDate(), true));

				aResult.push(iWeekNumber);
			}

			return aResult;
		};

		SinglePlanningCalendarMonthGrid.prototype._getVisibleDays = function(oStartDate) {
			var oCalStartDate,
				oDay,
				oCalDate,
				iDaysOldMonth,
				oFirstDay,
				iFirstDayOfWeek,
				aVisibleDays = [];

			// If date passed generate days for new start date else return the current one
			if (!oStartDate) {
				return aVisibleDays;
			}

			iFirstDayOfWeek = this._getFirstDayOfWeek();
			oCalStartDate = CalendarDate.fromLocalJSDate(oStartDate);

			// determine weekday of first day in month
			oFirstDay = new CalendarDate(oCalStartDate);
			oFirstDay.setDate(1);
			iDaysOldMonth = oFirstDay.getDay() - iFirstDayOfWeek;
			if (iDaysOldMonth < 0) {
				iDaysOldMonth = 7 + iDaysOldMonth;
			}

			if (iDaysOldMonth > 0) {
				// determine first day for display
				oFirstDay.setDate(1 - iDaysOldMonth);
			}

			oDay = new CalendarDate(oFirstDay);
			for (var i = 0; i < this._getColumns() * this._getRows(); i++) {
				oCalDate = new CalendarDate(oDay);
				aVisibleDays.push(oCalDate);
				oDay.setDate(oDay.getDate() + 1);
			}

			return aVisibleDays;
		};

		SinglePlanningCalendarMonthGrid.prototype._getFirstDayOfWeek = function() {
			var oWeekConfigurationValues, oLocaleData;

			if (this.getFirstDayOfWeek() < 0 || this.getFirstDayOfWeek() > 6) {
				oWeekConfigurationValues = CalendarDateUtils.getWeekConfigurationValues(
					this.getCalendarWeekNumbering(),
					new Locale(Configuration.getFormatSettings().getFormatLocale().toString())
				);

				if (oWeekConfigurationValues) {
					return oWeekConfigurationValues.firstDayOfWeek;
				} else {
					oLocaleData = this._getCoreLocaleData();
					return oLocaleData.getFirstDayOfWeek();
				}
			} else {
				return this.getFirstDayOfWeek();
			}
		};

		SinglePlanningCalendarMonthGrid.prototype._getAppointmentsToRender = function() {
			return this._oAppointmentsToRender;
		};

		SinglePlanningCalendarMonthGrid.prototype._calculateAppointmentsNodes = function(oStartDate) {
			var aVisibleDays = this._getVisibleDays(oStartDate),
				oFirstVisibleDay = aVisibleDays[0],
				oLastVisibleDay = aVisibleDays[aVisibleDays.length - 1],
					// We do not need appointments without start and end dates
				aApps = this.getAppointments().filter(function(app) {
					var bValid = app.getStartDate() && app.getEndDate();
					if (!bValid) {
						Log.warning("Appointment " + app.getId() + " has no start or no end date. It is ignored.");
					}
					return bValid;
					// Map to a structure ready for calculations
				}).map(function(app) {
					var oStart = CalendarDate.fromLocalJSDate(app.getStartDate()),
						oEnd = CalendarDate.fromLocalJSDate(app.getEndDate());
					return {
						data: app,
						start: oStart,
						end: oEnd,
						len: CalendarUtils._daysBetween(oEnd, oStart)
					};
					// Get only the visible appointments
				}).filter(function(app) {
					return CalendarUtils._isBetween(app.start, oFirstVisibleDay, oLastVisibleDay, true) // app starts in the current view port
						|| CalendarUtils._isBetween(app.end, oFirstVisibleDay, oLastVisibleDay, true) // app ends in the current view port
						|| (CalendarUtils._isBetween(oFirstVisibleDay, app.start, oLastVisibleDay, true) // app starts before the view port...
							&& CalendarUtils._isBetween(oLastVisibleDay, oFirstVisibleDay, app.end,true)); // ...and ends after the view port
					// Sort by start date
				}).sort(function compare(a, b) {
					return a.start.valueOf() - b.start.valueOf();
				}),
				// Array of taken levels per visible day
				aVisibleDaysLevels = [],
				oApp,
				iAppointmentStartIndex,
				iAppointmentEndIndex,
				iFirstFreeIndex,
				i,
				j,
				k;

			for (i = 0; i < aVisibleDays.length; i++) {
				aVisibleDaysLevels.push([]);
			}

			// Each appointment gets its width and level
			for (i = 0; i < aApps.length; i++) {
				oApp = aApps[i];
				iAppointmentStartIndex = CalendarUtils._daysBetween(oApp.start, aVisibleDays[0]);
				iAppointmentEndIndex = iAppointmentStartIndex + oApp.len;

				// If appointment is out of bounds, set it in bounds
				iAppointmentStartIndex = iAppointmentStartIndex > 0 ? iAppointmentStartIndex : 0;
				iAppointmentEndIndex = iAppointmentEndIndex < aVisibleDays.length ? iAppointmentEndIndex : aVisibleDays.length - 1;

				oApp.width = oApp.len + 1;

				// Find the first level that is not taken for the start date of the appointment
				iFirstFreeIndex = aVisibleDaysLevels[iAppointmentStartIndex].indexOf(true);
				if (iFirstFreeIndex === -1) {
					iFirstFreeIndex = aVisibleDaysLevels[iAppointmentStartIndex].length;
				}

				// Rendered position of appointment in day
				oApp.level = iFirstFreeIndex;

				// Adjust the taken levels for all days of the current appointment
				for (j = iAppointmentStartIndex; j <= iAppointmentEndIndex; j++) {
					aVisibleDaysLevels[j][iFirstFreeIndex] = false;

					for (k = 0; k < iFirstFreeIndex; k++) {
						if (aVisibleDaysLevels[j][k] === undefined) {
							aVisibleDaysLevels[j][k] = true;
						}
					}
				}
			}

			this._aAppsLevelsPerDay = aVisibleDaysLevels;

			return aApps;
		};

		SinglePlanningCalendarMonthGrid.prototype._getMoreCountPerCell = function(iCellIndex) {
			var aLevelsForADay = this._aAppsLevelsPerDay[iCellIndex];
			var iMaxAppointmentsRendered = this._getMaxAppointments();
			var iMoreCount = 0;

			if (aLevelsForADay.length < iMaxAppointmentsRendered) {
				return 0;
			}

			// Count the number of hidden appointments
			for (var i = iMaxAppointmentsRendered - 1; i < aLevelsForADay.length; i++){
				if (!aLevelsForADay[i]) {
					iMoreCount++;
				}
			}
			return iMoreCount;
		};

		SinglePlanningCalendarMonthGrid.prototype._configureAppointmentsDragAndDrop = function() {
			this.addDragDropConfig(new DragDropInfo({
				sourceAggregation: "appointments",
				targetAggregation: "_appsPlaceholders",

				dragStart: function(oEvent) {
					if (!this.getEnableAppointmentsDragAndDrop()) {
						oEvent.preventDefault();
						return false;
					}
					var fnHandleAppsOverlay = function() {
						var $Overlay = jQuery(".sapMSinglePCOverlay");

						setTimeout(function() {
							$Overlay.addClass("sapMSinglePCOverlayDragging");
						});

						jQuery(document).one("dragend", function() {
							$Overlay.removeClass("sapMSinglePCOverlayDragging");
						});
					};

					fnHandleAppsOverlay();
				}.bind(this),

				dragEnter: function(oEvent) {
					var oDragSession = oEvent.getParameter("dragSession"),
						fnAlignIndicator = function() {
							var $Indicator = jQuery(oDragSession.getIndicator());
							$Indicator.css("min-height", oDragSession.getDropControl().$().outerHeight());
							$Indicator.css("min-width", oDragSession.getDropControl().$().outerWidth());
						};

					if (!oDragSession.getIndicator()) {
						setTimeout(fnAlignIndicator, 0);
					} else {
						fnAlignIndicator();
					}
				},

				drop: function(oEvent) {
					var oDragSession = oEvent.getParameter("dragSession"),
						oAppointment = oDragSession.getDragControl(),
						oPlaceholder = oDragSession.getDropControl(),
						oCellCalStartDate = oPlaceholder.getDate(),
						oAppCalStartDate = CalendarDate.fromLocalJSDate(oAppointment.getStartDate()),
						oAppCalEndDate = CalendarDate.fromLocalJSDate(oAppointment.getEndDate()),
						iOffset = CalendarUtils._daysBetween(oCellCalStartDate, oAppCalStartDate),
						oStartDate = new CalendarDate(oAppCalStartDate),
						oEndDate = new CalendarDate(oAppCalEndDate),
						oBrowserEvent = oEvent.getParameter("browserEvent"),
						bCopy = (oBrowserEvent.metaKey || oBrowserEvent.ctrlKey);

					oStartDate.setDate(oStartDate.getDate() + iOffset);
					oEndDate.setDate(oEndDate.getDate() + iOffset);

					this.$().find(".sapMSinglePCOverlay").removeClass("sapMSinglePCOverlayDragging");

					if (oAppCalStartDate.valueOf() === oCellCalStartDate.valueOf()) {
						return;
					}

					this.fireAppointmentDrop({
						appointment: oAppointment,
						startDate: oStartDate.toLocalJSDate(),
						endDate: oEndDate.toLocalJSDate(),
						copy: bCopy
					});
				}.bind(this)
			}));
		};

		SinglePlanningCalendarMonthGrid.prototype._initItemNavigation = function() {
			// Collect the dom references of the items
			var oRootRef = this.getDomRef();
			this._aGridCells = this.$().find(".sapMSPCMonthDay").toArray();

			// Initialize the delegate and apply it to the control (only once)
			if (!this._oItemNavigation) {
				this._oItemNavigation = new ItemNavigation();
				this.addDelegate(this._oItemNavigation);
				this._oItemNavigation.attachEvent(ItemNavigation.Events.BorderReached, this._itemNavigationBorderReached, this);
			}
			// After each rendering the delegate needs to be initialized as well

			// Set the root dom node that surrounds the items
			this._oItemNavigation.setRootDomRef(oRootRef);

			// Set the array of dom nodes representing the items
			this._oItemNavigation.setItemDomRefs(this._aGridCells);

			// Turn off the cycling
			this._oItemNavigation.setCycling(false);

			//this way we do not hijack the browser back/forward navigation
			this._oItemNavigation.setDisabledModifiers({
				sapnext: ["alt", "meta"],
				sapprevious: ["alt", "meta"],
				saphome: ["alt", "meta"],
				sapend: ["meta"]
			});

			// explicitly setting table mode
			this._oItemNavigation.setTableMode(false).setColumns(this._getColumns(), true);

			// Set the page size
			this._oItemNavigation.setPageSize(this._aGridCells.length);
		};

		SinglePlanningCalendarMonthGrid.prototype._itemNavigationBorderReached = function(oEvent) {
			var oGridCell,
				iFocusedDateTimestamp,
				oItemNavigationEvent = oEvent.getParameter("event"),
				iOffset;

			if (oItemNavigationEvent.target.classList.contains("sapMSPCMonthDay")) {
				oGridCell = oItemNavigationEvent.target;
				iFocusedDateTimestamp = parseInt(oGridCell.getAttribute("sap-ui-date"));

				switch (oItemNavigationEvent.keyCode) {
					case KeyCodes.ARROW_LEFT:
						iOffset = -1;
						break;
					case KeyCodes.ARROW_UP:
						iOffset = -this._getColumns();
						break;
					case KeyCodes.ARROW_RIGHT:
						iOffset = 1;
						break;
					case KeyCodes.ARROW_DOWN:
						iOffset = this._getColumns();
						break;
					default:
						break;
				}

				this.fireEvent("borderReached", {
					startDate: iFocusedDateTimestamp,
					offset: iOffset
				});
			}
		};

		SinglePlanningCalendarMonthGrid.prototype._createAppointmentsDndPlaceholders = function(oStartDate) {
			var aDays = this._getVisibleDays(oStartDate);

			this.destroyAggregation("_appsPlaceholders");
			for (var i = 0; i < aDays.length; i++) {
				var oPlaceholder = new IntervalPlaceholder({
					date: aDays[i]
				});

				this.addAggregation("_appsPlaceholders", oPlaceholder, true);
			}
		};

		var IntervalPlaceholder = Control.extend("sap.m.SinglePlanningCalendarMonthGrid._internal.IntervalPlaceholder", {
			metadata: {
				properties: {
					date: { type: "object", group: "Data" }
				}
			},
			renderer: {
				apiVersion: 2,
				render: function(oRm, oControl) {
					oRm.openStart("div", oControl)
						.class("sapMSinglePCPlaceholder")
						.openEnd()
						.close("div");
				}
			}
		});

		SinglePlanningCalendarMonthGrid.prototype._getCellStartInfo = function(oStartDate) {
			var sStartTime = Core
				.getLibraryResourceBundle("sap.ui.unified")
				.getText("CALENDAR_START_TIME");

				return sStartTime + ": " + this._oFormatAriaFullDayCell.format(oStartDate) + "; ";
		};

		SinglePlanningCalendarMonthGrid.prototype._getAppointmentAnnouncementInfo = function(oAppointment) {
			var oUnifiedRB = Core.getLibraryResourceBundle("sap.ui.unified"),
				sStartTime = oUnifiedRB.getText("CALENDAR_START_TIME"),
				sEndTime = oUnifiedRB.getText("CALENDAR_END_TIME"),
				sFormattedStartDate = this._oFormatAriaApp.format(oAppointment.getStartDate()),
				sFormattedEndDate = this._oFormatAriaApp.format(oAppointment.getEndDate()),
				sAppInfo = sStartTime + ": " + sFormattedStartDate + "; " + sEndTime + ": " + sFormattedEndDate;

			return sAppInfo + "; " + PlanningCalendarLegend.findLegendItemForItem(Core.byId(this._sLegendId), oAppointment);
		};

		SinglePlanningCalendarMonthGrid.prototype._getMaxAppointments = function() {
			return this._isCompact() ? 4 : 3;
		};

		SinglePlanningCalendarMonthGrid.prototype._getDensitySizes = function() {
			return this._isCompact() ? {
				appHeight: APP_HEIGHT_COMPACT,
				cellHeaderHeight: CELL_HEADER_HEIGHT_COMPACT
			} : {
				appHeight: APP_HEIGHT_COZY,
				cellHeaderHeight: CELL_HEADER_HEIGHT_COZY
			};
		};

		SinglePlanningCalendarMonthGrid.prototype._isCompact = function() {
			var oDomRef = this.getDomRef()
				|| (this.getParent() && this.getParent().getDomRef && this.getParent().getDomRef()
				|| (this.getParent() && this.getParent().getRootNode && this.getParent().getRootNode()));

			while (oDomRef && oDomRef.classList) {
				if (oDomRef.classList.contains("sapUiSizeCompact")) {
					return true;
				}
				oDomRef = oDomRef.parentNode;
			}

			return false;
		};

		SinglePlanningCalendarMonthGrid.prototype._getSpecialDates = function(){
			var specialDates = this.getSpecialDates();
			for (var i = 0; i < specialDates.length; i++) {
				var bNeedsSecondTypeAdding = specialDates[i].getSecondaryType() === unifiedLibrary.CalendarDayType.NonWorking
					&& specialDates[i].getType() !== unifiedLibrary.CalendarDayType.NonWorking;
				if (bNeedsSecondTypeAdding) {
					var newSpecialDate = new DateTypeRange();
					newSpecialDate.setType(unifiedLibrary.CalendarDayType.NonWorking);
					newSpecialDate.setStartDate(specialDates[i].getStartDate());
					if (specialDates[i].getEndDate()) {
						newSpecialDate.setEndDate(specialDates[i].getEndDate());
					}
					specialDates.push(newSpecialDate);
				}
			}
			return specialDates;
		};

		SinglePlanningCalendarMonthGrid.prototype._isNonWorkingDay = function(oCalendarDate) {
			return this._getSpecialDates().filter(function(oDateRange) {
				return oDateRange.getType() === unifiedLibrary.CalendarDayType.NonWorking;
			}).map(function(oDateRange) {
				return CalendarDate.fromLocalJSDate(oDateRange.getStartDate());
			}).some(function(oDate) {
				return oDate.isSame(oCalendarDate);
			});
		};

		SinglePlanningCalendarMonthGrid.prototype.applyFocusInfo = function() {
			// directly focus appointment part, if there is any selected
			this._sSelectedAppointment && this._sSelectedAppointment.focus();
			return this;
		};

		return SinglePlanningCalendarMonthGrid;
	});
