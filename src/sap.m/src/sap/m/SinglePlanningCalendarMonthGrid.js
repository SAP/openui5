/*!
 * ${copyright}
 */

// Provides control sap.m.SinglePlanningCalendarMonthGrid.
sap.ui.define([
	'sap/ui/core/Control',
	'sap/ui/core/format/DateFormat',
	'sap/ui/unified/calendar/CalendarDate',
	'sap/ui/unified/calendar/CalendarUtils',
	'sap/ui/core/LocaleData',
	'sap/ui/core/Locale',
	'sap/ui/core/delegate/ItemNavigation',
	'sap/ui/core/dnd/DragDropInfo',
	'sap/ui/core/CustomData',
	'sap/ui/events/KeyCodes',
	'sap/base/Log',
	'sap/ui/core/Core',
	'./Link',
	'./PlanningCalendarLegend',
	'./SinglePlanningCalendarMonthGridRenderer'
	],
	function (
		Control,
		DateFormat,
		CalendarDate,
		CalendarUtils,
		LocaleData,
		Locale,
		ItemNavigation,
		DragDropInfo,
		CustomData,
		KeyCodes,
		Log,
		Core,
		Link,
		PlanningCalendarLegend,
		SinglePlanningCalendarMonthGridRenderer
	) {
		"use strict";

		var APP_HEIGHT_COMPACT = 1.5625; //rem
		var CELL_HEADER_HEIGHT_COMPACT = 1.5; //rem
		var APP_HEIGHT_COZY = 2.125; //rem
		var CELL_HEADER_HEIGHT_COZY = 1.75; //rem

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
					 * Determines the start date of the grid, as a JavaScript date object. It is considered as a local date.
					 * The time part will be ignored. The current date is used as default.
					 */
					startDate: { type: "object", group: "Data" },

					/**
					 * Determines whether the appointments in the grid are draggable.
					 *
					 * The drag and drop interaction is visualized by a placeholder highlighting the area where the
					 * appointment can be dropped by the user.
					 */
					enableAppointmentsDragAndDrop: { type: "boolean", group: "Misc", defaultValue: false }
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

					_appsPlaceholders: { type: "sap.m.SinglePlanningCalendarMonthGrid._internal.IntervalPlaceholder", multiple: true, visibility: "hidden", dnd: { droppable: true } }
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
							 * The start date as a JavaScript date object of the focused grid cell.
							 */
							startDate: { type: "object" },
							/**
							 * The end date as a JavaScript date object of the focused grid cell.
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
							 * The date as a JavaScript date object of the cell with the
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
							 * Start date of the dropped appointment as a JavaScript date object.
							 */
							startDate: { type: "object" },

							/**
							 * End date of the dropped appointment as a JavaScript date object.
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
			}
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

			this.setStartDate(new Date());
			this._configureAppointmentsDragAndDrop();
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
			this._fireSelectionEvent(oEvent);
		};

		/**
		 * Handles the <code>keydown</code> event when any key is pressed.
		 *
		 * @param {jQuery.Event} oEvent The event object.
		 */
		SinglePlanningCalendarMonthGrid.prototype.onkeydown = function(oEvent) {
			if (oEvent.which === KeyCodes.SPACE || oEvent.which === KeyCodes.ENTER) {
				this._fireSelectionEvent(oEvent);

				// Prevent scrolling
				oEvent.preventDefault();
			}
		};

		/**
		 * Helper function handling <code>keydown</code> or <code>tap</code> event on the grid.
		 *
		 * @param {jQuery.Event} oEvent The event object.
		 */
		SinglePlanningCalendarMonthGrid.prototype._fireSelectionEvent = function (oEvent) {
			var oTarget = oEvent.srcControl,
				$target = jQuery(oEvent.target).eq(0),
				$cell = $target.closest('.sapMSPCMonthDay').eq(0),
				bIsLink = $target.length && $target[0].classList.contains("sapMLnk"),
				iTimestamp,
				oStartDate,
				oEndDate;

			if (oTarget && oTarget.isA("sap.m.SinglePlanningCalendarMonthGrid") && $cell && !bIsLink) {
				iTimestamp = parseInt($cell.attr("sap-ui-date"));

				oStartDate = new Date(iTimestamp);
				oStartDate = new Date(oStartDate.getFullYear(), oStartDate.getMonth(), oStartDate.getDate());

				oEndDate = new Date(oStartDate);
				oEndDate.setDate(oEndDate.getDate() + 1);

				this.fireEvent("cellPress", {startDate: oStartDate, endDate: oEndDate});
				this.fireAppointmentSelect({
					appointment: undefined,
					appointments: this._toggleAppointmentSelection(undefined, true)
				});
			} else if (oTarget && oTarget.isA("sap.ui.unified.CalendarAppointment")) {
				this.fireAppointmentSelect({
					appointment: oTarget,
					appointments: this._toggleAppointmentSelection(oTarget, !(oEvent.ctrlKey || oEvent.metaKey))
				});
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
				aAppointments,
				iAppointmentsLength,
				i;

			if (bRemoveOldSelection) {
				aAppointments = this.getAppointments();
				for (i = 0, iAppointmentsLength = aAppointments.length; i < iAppointmentsLength; i++) {
					// Deselecting all selected appointments if a grid cell is focused or
					// all selected appointments different than the currently focused appointment
					if ( (!oAppointment || aAppointments[i].getId() !== oAppointment.getId()) && aAppointments[i].getSelected()) {
						aAppointments[i].setProperty("selected", false, true); // do not invalidate
						aChangedApps.push(aAppointments[i]);
						// Get appointment element(s) (it might be rendered in several columns)
						// remove its selection class and set aria-selected attribute to false
						jQuery('[data-sap-ui=' + aAppointments[i].getId() + ']')
							.attr("aria-selected", "false")
							.find(".sapUiCalendarApp").removeClass("sapUiCalendarAppSel");
					}
				}
			}

			if (oAppointment) {
				oAppointment.setProperty("selected", !oAppointment.getSelected(), true); // do not invalidate
				aChangedApps.push(oAppointment);

				// Get appointment element(s) and toggle its selection class and aria-selected attribute
				jQuery('[data-sap-ui=' + oAppointment.getId() + ']')
					.attr("aria-selected", oAppointment.getSelected())
					.find(".sapUiCalendarApp").toggleClass("sapUiCalendarAppSel", oAppointment.getSelected());
			}

			return aChangedApps;
		};

		SinglePlanningCalendarMonthGrid.prototype._getMoreLink = function(iAppointmentsCount, oCalendarDate, iCellIndex) {
			var sMore = Core
					.getLibraryResourceBundle("sap.m")
					.getText("SPC_MORE_LINK", [iAppointmentsCount.toString()]),
				oLink = new Link({
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
				oDate = new Date(iTimestamp);

			oDate = new Date(oDate.getFullYear(), oDate.getMonth(), oDate.getDate());

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
				sLocale = Core.getConfiguration().getFormatLocale().toString(),
				oLocaleData = this._getCoreLocaleData();

			for (var i = 0; i < this._getRows(); i++) {
				aResult.push(CalendarUtils.calculateWeekNumber(
					aDays[i * iColumns].toUTCJSDate(),
					aDays[i * iColumns].getYear(),
					sLocale,
					oLocaleData));
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

			oCalStartDate = CalendarDate.fromLocalJSDate(oStartDate);
			iFirstDayOfWeek = this._getCoreLocaleData().getFirstDayOfWeek();

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

		SinglePlanningCalendarMonthGrid.prototype._getAppointmentsToRender = function() {
			return this._oAppointmentsToRender;
		};

		SinglePlanningCalendarMonthGrid.prototype._calculateAppointmentsNodes = function(oStartDate) {
			var aVisibleDays = this._getVisibleDays(oStartDate),
				oFirstVisibleDay = aVisibleDays[0],
				oLastVisibleDay = aVisibleDays[aVisibleDays.length - 1],
					// we do not need appointments without start and end dates
				aApps = this.getAppointments().filter(function(app) {
					var bValid = app.getStartDate() && app.getEndDate();
					if (!bValid) {
						Log.warning("Appointment " + app.getId() + " has no start or no end date. It is ignored.");
					}
					return bValid;
					// map to a structure ready for calculations
				}).map(function(app) {
					var oStart = CalendarDate.fromLocalJSDate(app.getStartDate()),
						oEnd = CalendarDate.fromLocalJSDate(app.getEndDate());
					return {
						data: app,
						start: oStart,
						end: oEnd,
						len: CalendarUtils._daysBetween(oEnd, oStart)
					};
					// get only the visible appointments
				}).filter(function(app) {
					return CalendarUtils._isBetween(app.start, oFirstVisibleDay, oLastVisibleDay, true)
						|| CalendarUtils._isBetween(app.end, oFirstVisibleDay, oLastVisibleDay, true);
					// sort by start date
				}).sort(function compare(a, b) {
					return a.start.valueOf() - b.start.valueOf();
				}),
				// array of taken levels per visible day
				aVisibleDaysLevels = [],
				oApp,
				iStartIndexVisibleDays,
				iEndIndexVisibleDays,
				iFirstFreeIndex,
				i,
				j,
				k;

			for (i = 0; i < aVisibleDays.length; i++) {
				aVisibleDaysLevels.push([]);
			}

			// each appointment gets its width and level
			for (i = 0; i < aApps.length; i++) {
				oApp = aApps[i];
				iStartIndexVisibleDays = CalendarUtils._daysBetween(oApp.start, aVisibleDays[0]);
				iEndIndexVisibleDays = iStartIndexVisibleDays + oApp.len;
				iStartIndexVisibleDays = iStartIndexVisibleDays > 0 ? iStartIndexVisibleDays : 0;
				iEndIndexVisibleDays = iEndIndexVisibleDays < aVisibleDays.length ? iEndIndexVisibleDays : aVisibleDays.length - 1;

				oApp.width = oApp.len + 1;

				// find the first level that is not taken for the start date of the appointment
				iFirstFreeIndex = aVisibleDaysLevels[iStartIndexVisibleDays].indexOf(true);
				if (iFirstFreeIndex === -1) {
					iFirstFreeIndex = aVisibleDaysLevels[iStartIndexVisibleDays].length;
				}
				oApp.level = iFirstFreeIndex;

				// adjust the taken levels for all days of the current appointment
				for (j = iStartIndexVisibleDays; j <= iEndIndexVisibleDays; j++) {
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
			var iAllApps = 0;
			var iSlotsToRender = 0;

			if (aLevelsForADay.length <= iMaxAppointmentsRendered) {
				return 0;
			}

			for (var i = 0; i < aLevelsForADay.length; i++) {
				if (!aLevelsForADay[i]) {
					iAllApps++;
				}

				if (i < iMaxAppointmentsRendered - 1) {
					iSlotsToRender++;
				}
			}

			return iAllApps - iSlotsToRender;
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
			renderer: function(oRm, oControl) {
				oRm.write("<div");
				oRm.writeControlData(oControl);
				oRm.addClass("sapMSinglePCPlaceholder");
				oRm.writeClasses();
				oRm.write("></div>");
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

		return SinglePlanningCalendarMonthGrid;
	});
