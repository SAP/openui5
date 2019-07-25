/*!
 * ${copyright}
 */

// Provides control sap.m.SinglePlanningCalendarGrid.
sap.ui.define([
		'./SinglePlanningCalendarUtilities',
		'sap/ui/core/Control',
		'sap/ui/core/LocaleData',
		'sap/ui/core/Locale',
		'sap/ui/core/InvisibleText',
		'sap/ui/core/format/DateFormat',
		'sap/ui/core/date/UniversalDate',
		'sap/ui/core/dnd/DragInfo',
		'sap/ui/core/dnd/DropInfo',
		'sap/ui/core/dnd/DragDropInfo',
		'sap/ui/unified/library',
		'sap/ui/unified/CalendarAppointment',
		'sap/ui/unified/calendar/DatesRow',
		'sap/ui/unified/calendar/CalendarDate',
		'sap/ui/unified/calendar/CalendarUtils',
		'sap/ui/events/KeyCodes',
		'./SinglePlanningCalendarGridRenderer',
		'sap/ui/Device',
		'sap/ui/core/delegate/ItemNavigation',
		"sap/ui/thirdparty/jquery",
		'./PlanningCalendarLegend'
	],
	function (
		SinglePlanningCalendarUtilities,
		Control,
		LocaleData,
		Locale,
		InvisibleText,
		DateFormat,
		UniversalDate,
		DragInfo,
		DropInfo,
		DragDropInfo,
		unifiedLibrary,
		CalendarAppointment,
		DatesRow,
		CalendarDate,
		CalendarUtils,
		KeyCodes,
		SinglePlanningCalendarGridRenderer,
		Device,
		ItemNavigation,
		jQuery,
		PlanningCalendarLegend
	) {
		"use strict";

		var ROW_HEIGHT_COZY = 69,
			ROW_HEIGHT_COMPACT = 48,
			BLOCKER_ROW_HEIGHT_COZY = 34,
			BLOCKER_ROW_HEIGHT_COMPACT = 25,
			HALF_HOUR_MS = 3600000 / 2,
			ONE_MIN_MS = 60 * 1000,
			MILLISECONDS_IN_A_DAY = 86400000,
			// Day view only - indicates the special dates
			// 3px height the marker itself + 2x2px on its top and bottom both on cozy & compact
			DAY_MARKER_HEIGHT_PX = 7;

		/**
		 * Constructor for a new SinglePlanningCalendarGrid.
		 *
		 * @param {string} [sId] id for the new control, generated automatically if no id is given
		 * @param {object} [mSettings] initial settings for the new control
		 *
		 * @class
		 *
		 * Displays a grid in which appointments of the {@link sap.m.SinglePlanningCalendar} are rendered.
		 *
		 * <h3>Overview</h3>
		 *
		 * <b>Note:</b> The <code>PlanningCalendarGrid</code> uses parts of the <code>sap.ui.unified</code> library.
		 * This library will be loaded after the <code>PlanningCalendarGrid</code>, if it wasn't previously loaded.
		 * This could lead to a waiting time when a <code>PlanningCalendarGrid</code> is used for the first time.
		 * To prevent this, apps using the <code>PlanningCalendarGrid</code> must also load the
		 * <code>sap.ui.unified</code> library.
		 *
		 * The <code>PlanningCalendarGrid</code> has the following structure:
		 *
		 * <ul>
		 *     <li>Each column in the grid represents a single entity of the view type. For example in the week view one
		 *     column represents a week day.</li>
		 *     <li>Each row represents an hour from each day.</li>
		 *     <li>There are also appointments displayed across the grid. To display an all-day appointment, the
		 *     appointment must start at 00:00 and end on any day in the future in 00:00h.</li>
		 * </ul>
		 *
		 * @extends sap.ui.core.Control
		 *
		 * @author SAP SE
		 * @version ${version}
		 *
		 * @constructor
		 * @private
		 * @since 1.61
		 * @alias sap.m.SinglePlanningCalendarGrid
		 */

		var SinglePlanningCalendarGrid = Control.extend("sap.m.SinglePlanningCalendarGrid", /** @lends sap.m.SinglePlanningCalendarGrid.prototype */ {
			metadata: {

				library: "sap.m",

				properties: {

					/**
					 * Determines the start date of the grid, as a JavaScript date object. It is considered as a local date.
					 * The time part will be ignored. The current date is used as default.
					 */
					startDate: {type: "object", group: "Data"},

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
				aggregations: {

					/**
					 * The appointments to be displayed in the grid. Appointments outside the visible time frame are not rendered.
					 * Appointments, longer than a day, will be displayed in all of the affected days.
					 * An appointment which starts at 00:00 and ends in 00:00 on any day in the future is displayed as an all-day
					 * appointment.
					 */
					appointments: {type: "sap.ui.unified.CalendarAppointment", multiple: true, singularName: "appointment", dnd : {draggable: true}},

					/**
					 * Special days in the header visualized as a date range with type.
					 *
					 * <b>Note:</b> If one day is assigned to more than one type, only the first type is used.
					 * @since 1.66
					 */
					specialDates : {type : "sap.ui.unified.DateTypeRange", multiple : true, singularName : "specialDate"},

					/**
					 * Hidden, for internal use only.
					 * The date row which shows the header of the columns in the <code>SinglePlanningCalendarGrid</code>.
					 *
					 * @private
					 */
					_columnHeaders: {type: "sap.ui.unified.calendar.DatesRow", multiple: false, visibility: "hidden"},

					_intervalPlaceholders : {type : "sap.m.SinglePlanningCalendarGrid._internal.IntervalPlaceholder", multiple : true, visibility : "hidden", dnd : {droppable: true}},
					_blockersPlaceholders : {type : "sap.m.SinglePlanningCalendarGrid._internal.IntervalPlaceholder", multiple : true, visibility : "hidden", dnd : {droppable: true}}

				},
				dnd: true,
				associations: {

					/**
					 * Association to controls / IDs which label this control (see WAI-ARIA attribute aria-labelledby).
					 *
					 * <b>Note</b> These labels are also assigned to the appointments.
					 */
					ariaLabelledBy: {type: "sap.ui.core.Control", multiple: true, singularName: "ariaLabelledBy"},

					/**
					 * Association to the <code>PlanningCalendarLegend</code> explaining the colors of the <code>Appointments</code>.
					 *
					 * <b>Note:</b> The legend does not have to be rendered but must exist and all required types must be assigned.
					 * @since 1.66.0
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
					 * Fired if an appointment is resized.
					 * @since 1.65
					 */
					appointmentResize: {
						parameters: {
							/**
							 * The resized appointment.
							 */
							appointment: { type: "sap.ui.unified.CalendarAppointment" },

							/**
							 * Start date of the dropped appointment, as a JavaScript date object.
							 */
							startDate: { type: "object" },

							/**
							 * Dropped appointment end date as a JavaScript date object.
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
					}
				}
			}
		});

		SinglePlanningCalendarGrid.prototype.init = function () {
			var oStartDate = new Date(),
				oDatesRow = new DatesRow(this.getId() + "-columnHeaders", {
					showDayNamesLine: false,
					showWeekNumbers: false,
					startDate: oStartDate
				}).addStyleClass("sapMSinglePCColumnHeader"),
				iDelay = (60 - oStartDate.getSeconds()) * 1000;

			this.setAggregation("_columnHeaders", oDatesRow);
			this.setStartDate(oStartDate);
			this._setColumns(7);
			this._configureBlockersDragAndDrop();
			this._configureAppointmentsDragAndDrop();
			this._configureAppointmentsResize();
			this._configureAppointmentsCreate();

			this._oUnifiedRB = sap.ui.getCore().getLibraryResourceBundle("sap.ui.unified");
			this._oFormatAriaApp = DateFormat.getDateTimeInstance({
				pattern: "EEEE dd/MM/YYYY 'at' HH:mm:ss a"
			});
			this._oFormatAriaFullDayCell = DateFormat.getDateTimeInstance({
				pattern: "EEEE dd/MM/YYYY"
			});
			this._oFormatAriaCell = DateFormat.getDateTimeInstance({
				pattern: "EEEE dd/MM/YYYY 'at' HH"
			});

			//the id of the SPC's legend if any
			this._sLegendId = undefined;

			setTimeout(this._updateRowHeaderAndNowMarker.bind(this), iDelay);
		};

		SinglePlanningCalendarGrid.prototype.exit = function () {
			if (this._oItemNavigation) {
				this.removeDelegate(this._oItemNavigation);
				this._oItemNavigation.destroy();
				delete this._oItemNavigation;
			}
		};

		SinglePlanningCalendarGrid.prototype.onBeforeRendering = function () {
			var oAppointmentsMap = this._createAppointmentsMap(this.getAppointments()),
				oStartDate = this.getStartDate(),
				oCalStartDate = CalendarDate.fromLocalJSDate(oStartDate),
				iColumns = this._getColumns();

			this._oVisibleAppointments = this._calculateVisibleAppointments(oAppointmentsMap.appointments, this.getStartDate(), iColumns);
			this._oAppointmentsToRender = this._calculateAppointmentsLevelsAndWidth(this._oVisibleAppointments);
			this._aVisibleBlockers = this._calculateVisibleBlockers(oAppointmentsMap.blockers, oCalStartDate, iColumns);
			this._oBlockersToRender = this._calculateBlockersLevelsAndWidth(this._aVisibleBlockers);

			if (this._iOldColumns !== iColumns || this._oOldStartDate !== oStartDate) {
				this._createBlockersDndPlaceholders(oStartDate, iColumns);
				this._createAppointmentsDndPlaceholders(oStartDate, iColumns);
			}

		};

		SinglePlanningCalendarGrid.prototype.onmousedown = function(oEvent) {
			var oClassList = oEvent.target.classList;
			this._isResizeHandleBottomMouseDownTarget = oClassList.contains("sapMSinglePCAppResizeHandleBottom");
			this._isResizeHandleTopMouseDownTarget = oClassList.contains("sapMSinglePCAppResizeHandleTop");
		};

		SinglePlanningCalendarGrid.prototype._isResizingPerformed = function() {
			return this._isResizeHandleBottomMouseDownTarget || this._isResizeHandleTopMouseDownTarget;
		};

		SinglePlanningCalendarGrid.prototype._configureBlockersDragAndDrop = function () {
			this.addDragDropConfig(new DragDropInfo({
				sourceAggregation: "appointments",
				targetAggregation: "_blockersPlaceholders",

				dragStart: function (oEvent) {
					if (!this.getEnableAppointmentsDragAndDrop()) {
						oEvent.preventDefault();
						return false;
					}
					var fnHandleAppsOverlay = function () {
						var $Overlay = jQuery(".sapMSinglePCOverlay");

						setTimeout(function () {
							$Overlay.addClass("sapMSinglePCOverlayDragging");
						});

						jQuery(document).one("dragend", function () {
							$Overlay.removeClass("sapMSinglePCOverlayDragging");
						});
					};

					fnHandleAppsOverlay();
				}.bind(this),

				dragEnter: function (oEvent) {
					var oDragSession = oEvent.getParameter("dragSession"),
						oAppointment = oDragSession.getDragControl(),
						oDropTarget = oDragSession.getDropControl(),
						bIsFullDay = this.isAllDayAppointment(oAppointment.getStartDate(), oAppointment.getEndDate()),
						fnAlignIndicator = function () {
							var $Indicator = jQuery(oDragSession.getIndicator()),
								iAppHeight = oAppointment.$().outerHeight(),
								iAppWidth = oAppointment.$().outerWidth(),
								oGrid = oDropTarget.$().closest(".sapMSinglePCBlockersColumns").get(0).getBoundingClientRect(),
								oDropDim = oDropTarget.getDomRef().getBoundingClientRect(),
								iSubtractFromWidth = (oDropDim.left + iAppWidth) - (oGrid.left + oGrid.width);

							if (bIsFullDay) {
								$Indicator.css("min-height", iAppHeight);
								$Indicator.css("min-width", Math.min(iAppWidth, iAppWidth - iSubtractFromWidth));
							} else {
								$Indicator.css("min-height", oDragSession.getDropControl().$().outerHeight());
								$Indicator.css("min-width", oDragSession.getDropControl().$().outerWidth());
							}
						};

					if (!oDragSession.getIndicator()) {
						setTimeout(fnAlignIndicator, 0);
					} else {
						fnAlignIndicator();
					}
				}.bind(this),

				drop: function (oEvent) {
					var oDragSession = oEvent.getParameter("dragSession"),
						oAppointment = oDragSession.getDragControl(),
						oPlaceholder = oDragSession.getDropControl(),
						oStartDate = oPlaceholder.getDate().getJSDate(),
						oEndDate,
						oBrowserEvent = oEvent.getParameter("browserEvent"),
						bCopy = (oBrowserEvent.metaKey || oBrowserEvent.ctrlKey),
						bIsFullDay = this.isAllDayAppointment(oAppointment.getStartDate(), oAppointment.getEndDate());

					oEndDate = new Date(oStartDate);

					if (bIsFullDay) {
						oEndDate.setMilliseconds(oAppointment.getEndDate().getTime() - oAppointment.getStartDate().getTime());
					}

					this.$().find(".sapMSinglePCOverlay").removeClass("sapMSinglePCOverlayDragging");

					if (bIsFullDay && oAppointment.getStartDate().getTime() === oStartDate.getTime()) {
						return;
					}

					this.fireAppointmentDrop({
						appointment: oAppointment,
						startDate: oStartDate,
						endDate: oEndDate,
						copy: bCopy
					});
				}.bind(this)
			}));
		};

		SinglePlanningCalendarGrid.prototype._configureAppointmentsDragAndDrop = function () {
			this.addDragDropConfig(new DragDropInfo({
				sourceAggregation: "appointments",
				targetAggregation: "_intervalPlaceholders",

				dragStart: function (oEvent) {
					if (!this.getEnableAppointmentsDragAndDrop() || this._isResizingPerformed()) {
						oEvent.preventDefault();
						return false;
					}
					var fnHandleAppsOverlay = function () {
						var $Overlay = jQuery(".sapMSinglePCOverlay");

						setTimeout(function () {
							$Overlay.addClass("sapMSinglePCOverlayDragging");
						});

						jQuery(document).one("dragend", function () {
							$Overlay.removeClass("sapMSinglePCOverlayDragging");
						});
					};

					fnHandleAppsOverlay();
				}.bind(this),

				dragEnter: function (oEvent) {
					var oDragSession = oEvent.getParameter("dragSession"),
						oAppointment = oDragSession.getDragControl(),
						oDropTarget = oDragSession.getDropControl(),
						bIsFullDay = this.isAllDayAppointment(oAppointment.getStartDate(), oAppointment.getEndDate()),
						fnAlignIndicator = function () {
							var $Indicator = jQuery(oDragSession.getIndicator()),
								iAppHeight = oAppointment.$().outerHeight(),
								oGrid = oDropTarget.$().closest(".sapMSinglePCColumn").get(0).getBoundingClientRect(),
								oDropDim = oDragSession.getDropControl().getDomRef().getBoundingClientRect(),
								iSubtractFromHeight = (oDropDim.top + iAppHeight) - (oGrid.top + oGrid.height);

							if (bIsFullDay) {
								$Indicator.css("min-height", 2 * oDragSession.getDropControl().$().outerHeight());
							} else {
								$Indicator.css("min-height", Math.min(iAppHeight, iAppHeight - iSubtractFromHeight));
							}
						};

					if (!oDragSession.getIndicator()) {
						setTimeout(fnAlignIndicator, 0);
					} else {
						fnAlignIndicator();
					}
				}.bind(this),

				drop: function (oEvent) {
					var oDragSession = oEvent.getParameter("dragSession"),
						oAppointment = oDragSession.getDragControl(),
						oPlaceholder = oDragSession.getDropControl(),
						oStartDate = oPlaceholder.getDate().getJSDate(),
						oEndDate,
						oBrowserEvent = oEvent.getParameter("browserEvent"),
						bCopy = (oBrowserEvent.metaKey || oBrowserEvent.ctrlKey),
						bIsFullDay = this.isAllDayAppointment(oAppointment.getStartDate(), oAppointment.getEndDate());

					oEndDate = new Date(oStartDate);

					if (bIsFullDay) {
						oEndDate.setHours(oEndDate.getHours() + 1);
					} else {
						oEndDate.setMilliseconds(oAppointment.getEndDate().getTime() - oAppointment.getStartDate().getTime());
					}

					this.$().find(".sapMSinglePCOverlay").removeClass("sapMSinglePCOverlayDragging");

					if (!bIsFullDay && oAppointment.getStartDate().getTime() === oStartDate.getTime()) {
						return;
					}

					this.fireAppointmentDrop({
						appointment: oAppointment,
						startDate: oStartDate,
						endDate: oEndDate,
						copy: bCopy
					});
				}.bind(this)
			}));
		};

		SinglePlanningCalendarGrid.prototype._configureAppointmentsResize = function() {
			var oResizeConfig = new DragDropInfo({
				sourceAggregation: "appointments",
				targetAggregation: "_intervalPlaceholders",

				/**
				 * Fired when the user starts dragging an appointment.
				 */
				dragStart: function(oEvent) {
					if (!this.getEnableAppointmentsResize() || !this._isResizingPerformed()) {
						oEvent.preventDefault();
						return;
					}

					var oDragSession = oEvent.getParameter("dragSession"),
						$SPCGridOverlay = this.$().find(".sapMSinglePCOverlay"),
						$Indicator = jQuery(oDragSession.getIndicator()),
						$DraggedControl = oDragSession.getDragControl().$();

					if (this._isResizeHandleBottomMouseDownTarget) {
						oDragSession.setData("bottomHandle", "true");
					}

					if (this._isResizeHandleTopMouseDownTarget) {
						oDragSession.setData("topHandle", "true");
					}

					$Indicator.addClass("sapUiDnDIndicatorHide");
					setTimeout(function() {
						$SPCGridOverlay.addClass("sapMSinglePCOverlayDragging");
					}, 0);

					jQuery(document).one("dragend", function() {
						var oAppointmentStartingBoundaries = oDragSession.getComplexData("appointmentStartingBoundaries");

						$SPCGridOverlay.removeClass("sapMSinglePCOverlayDragging");
						$Indicator.removeClass("sapUiDnDIndicatorHide");

						$DraggedControl.css({
							top: oAppointmentStartingBoundaries.top,
							height: oAppointmentStartingBoundaries.height,
							"z-index": "auto",
							opacity: 1
						});
					});

					if (!Device.browser.msie && !Device.browser.edge) {
						oEvent.getParameter("browserEvent").dataTransfer.setDragImage(getResizeGhost(), 0, 0);
					}
				}.bind(this),

				/**
				 * Fired when a dragged appointment enters a drop target.
				 */
				dragEnter: function(oEvent) {
					var oDragSession = oEvent.getParameter("dragSession"),
						oAppointmentRef = oDragSession.getDragControl().$().get(0),
						oDropTarget = oDragSession.getDropControl().getDomRef(),
						oAppointmentStartingBoundaries = oDragSession.getComplexData("appointmentStartingBoundaries"),
						fnHideIndicator = function() {
							var $Indicator = jQuery(oDragSession.getIndicator());
							$Indicator.addClass("sapUiDnDIndicatorHide");
						},
						iTop,
						iBottom,
						iHeight,
						iVariableBoundaryY,
						mDraggedControlConfig;

					if (!oAppointmentStartingBoundaries) {
						oAppointmentStartingBoundaries = {
							top: oAppointmentRef.offsetTop,
							bottom: oAppointmentRef.offsetTop + oAppointmentRef.getBoundingClientRect().height,
							height: oAppointmentRef.getBoundingClientRect().height
						};
						oDragSession.setComplexData("appointmentStartingBoundaries", oAppointmentStartingBoundaries);
					}

					iVariableBoundaryY = oDragSession.getData("bottomHandle") ? oAppointmentStartingBoundaries.top : oAppointmentStartingBoundaries.bottom;

					iTop = Math.min(iVariableBoundaryY, oDropTarget.offsetTop);
					iBottom = Math.max(iVariableBoundaryY, oDropTarget.offsetTop + oDropTarget.getBoundingClientRect().height);
					iHeight = iBottom - iTop;

					mDraggedControlConfig = {
						top: iTop,
						height: iHeight,
						"z-index": 1,
						opacity: 0.8
					};

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
				drop: function(oEvent) {
					var oDragSession = oEvent.getParameter("dragSession"),
						oAppointment = oDragSession.getDragControl(),
						iIndex = this.indexOfAggregation("_intervalPlaceholders", oDragSession.getDropControl()),
						oAppointmentStartingBoundaries = oDragSession.getComplexData("appointmentStartingBoundaries"),
						newPos;

					newPos = this._calcResizeNewHoursAppPos(
						oAppointment.getStartDate(),
						oAppointment.getEndDate(),
						iIndex,
						oDragSession.getData("bottomHandle")
					);

					this.$().find(".sapMSinglePCOverlay").removeClass("sapMSinglePCOverlayDragging");
					jQuery(oDragSession.getIndicator()).removeClass("sapUiDnDIndicatorHide");

					oAppointment.$().css({
						top: oAppointmentStartingBoundaries.top,
						height: oAppointmentStartingBoundaries.height,
						"z-index": "auto",
						opacity: 1
					});

					if (oAppointment.getEndDate().getTime() === newPos.endDate.getTime() &&
							oAppointment.getStartDate().getTime() === newPos.startDate.getTime()) {
						return;
					}

					this.fireAppointmentResize({
						appointment: oAppointment,
						startDate: newPos.startDate,
						endDate: newPos.endDate
					});
				}.bind(this)
			});

			this.addDragDropConfig(oResizeConfig);
		};

		SinglePlanningCalendarGrid.prototype._configureAppointmentsCreate = function () {
			this.addDragDropConfig(new DragDropInfo({
				targetAggregation: "_intervalPlaceholders",

				dragStart: function (oEvent) {
					if (!this.getEnableAppointmentsCreate()) {
						oEvent.preventDefault();
						return;
					}

					var $SPCGridOverlay = this.$().find(".sapMSinglePCOverlay");

					setTimeout(function () {
						$SPCGridOverlay.addClass("sapMSinglePCOverlayDragging");
					});

					jQuery(document).one("dragend", function () {
						$SPCGridOverlay.removeClass("sapMSinglePCOverlayDragging");
						jQuery(".sapUiAppCreate").remove();
						jQuery(".sapUiDnDDragging").removeClass("sapUiDnDDragging");
					});

					if (!Device.browser.msie && !Device.browser.edge) {
						oEvent.getParameter("browserEvent").dataTransfer.setDragImage(getResizeGhost(), 0, 0);
					}
				}.bind(this),

				dragEnter: function (oEvent) {
					var oDragSession = oEvent.getParameter("dragSession"),
						oDropControl = oDragSession.getDropControl(),
						oDropDom = oDropControl.getDomRef(),
						iDropHeight = oDropDom.offsetHeight,
						iDropY = oDropDom.offsetTop,
						iStartingDropY = iDropY,
						iDropX = oDropDom.getBoundingClientRect().left,
						iStartingDropX = iDropX,
						oColumn = oDropControl.$().parents(".sapMSinglePCColumn").get(0),
						$createPlaceHolder = jQuery(".sapUiAppCreate");

					if (!$createPlaceHolder.get(0)) {
						$createPlaceHolder = jQuery("<div></div>")
							.addClass("sapUiCalendarApp sapUiCalendarAppType01 sapUiAppCreate");
						$createPlaceHolder.appendTo(oColumn);
					}

					jQuery(".sapUiDnDDragging").removeClass("sapUiDnDDragging");

					if (!oDragSession.getComplexData("startingRectsDropArea")) {
						oDragSession.setComplexData("startingRectsDropArea", { top: iDropY, left: iDropX });
						oDragSession.setComplexData("startingDropDate", oDropControl.getDate());
					} else {
						iStartingDropY = oDragSession.getComplexData("startingRectsDropArea").top;
						iStartingDropX = oDragSession.getComplexData("startingRectsDropArea").left;
					}

					if (iDropX !== iStartingDropX) {
						oEvent.preventDefault();
						return false;
					}

					// Dim the column
					oDropControl.$().closest(".sapMSinglePCColumn").find(".sapMSinglePCAppointments").addClass("sapUiDnDDragging");

					$createPlaceHolder.css({
						top: Math.min(iStartingDropY, iDropY) + 2,
						height: Math.abs(iStartingDropY - iDropY) + iDropHeight - 4,
						left: 3,
						right: 3,
						"z-index": 2
					});
					oDragSession.setIndicatorConfig({
						display: "none"
					});
				},

				drop: function (oEvent) {
					var oDragSession = oEvent.getParameter("dragSession"),
						oDropControl = oDragSession.getDropControl(),
						THIRTY_MINUTES = 30 * 60 * 1000,
						oStartDate = oDragSession.getComplexData("startingDropDate").getTime(),
						oEndDate = oDropControl.getDate().getJSDate().getTime(),
						iStartTime = Math.min(oStartDate, oEndDate),
						iEndTime = Math.max(oStartDate, oEndDate) + THIRTY_MINUTES;

					this.fireAppointmentCreate({
						startDate: new Date(iStartTime),
						endDate: new Date(iEndTime)
					});

					jQuery(".sapUiAppCreate").remove();
					jQuery(".sapUiDnDDragging").removeClass("sapUiDnDDragging");
				}.bind(this)
			}));
		};

		SinglePlanningCalendarGrid.prototype._calcResizeNewHoursAppPos = function(oAppStartDate, oAppEndDate, iIndex, bBottomHandle) {
			var oSPCStartDate = new Date(this.getStartDate().getFullYear(), this.getStartDate().getMonth(), this.getStartDate().getDate()),
				iMinutesStep = 30 * 60 * 1000, // 30 min
				iPlaceholderStartTime = oSPCStartDate.getTime() + iIndex * iMinutesStep,
				iPlaceholderEndTime = iPlaceholderStartTime + iMinutesStep,
				iVariableBoundaryTime = bBottomHandle ? oAppStartDate.getTime() : oAppEndDate.getTime(),
				iStartTime = Math.min(iVariableBoundaryTime, iPlaceholderStartTime),
				iEndTime = Math.max(iVariableBoundaryTime, iPlaceholderEndTime);

			return {
				startDate: new Date(iStartTime),
				endDate: new Date(iEndTime)
			};
		};

		SinglePlanningCalendarGrid.prototype._adjustAppointmentsHeightforCompact = function (sDate, oColumnStartDateAndHour, oColumnEndDateAndHour) {
			var oAppointment,
				$appointment,
				oAppStartDate,
				oAppEndDate,
				iAppTop,
				iAppBottom,
				bAppStartIsOutsideVisibleStartHour,
				bAppEndIsOutsideVisibleEndHour,
				iRowHeight = this._getRowHeight(),
				that = this;

			if (this._oAppointmentsToRender[sDate]) {
				this._oAppointmentsToRender[sDate].oAppointmentsList.getIterator().forEach(function(oAppNode) {
					oAppointment = oAppNode.getData();
					$appointment = jQuery("div[data-sap-day='" + sDate + "'].sapMSinglePCColumn #" + oAppointment.getId());
					oAppStartDate = oAppointment.getStartDate();
					oAppEndDate = oAppointment.getEndDate();
					bAppStartIsOutsideVisibleStartHour = oColumnStartDateAndHour.getTime() > oAppStartDate.getTime();
					bAppEndIsOutsideVisibleEndHour = oColumnEndDateAndHour.getTime() < oAppEndDate.getTime();

					iAppTop = bAppStartIsOutsideVisibleStartHour ? 0 : that._calculateTopPosition(oAppStartDate);
					iAppBottom = bAppEndIsOutsideVisibleEndHour ? 0 : that._calculateBottomPosition(oAppEndDate);

					$appointment.css("top", iAppTop);
					$appointment.css("bottom", iAppBottom);
					$appointment.find(".sapUiCalendarApp")
								.css("min-height", iRowHeight / 2 - 3);
				});
			}
		};

		SinglePlanningCalendarGrid.prototype._adjustBlockersHeightforCompact = function () {
			var iMaxLevel = this._getBlockersToRender().iMaxlevel,
				iContainerHeight = (iMaxLevel + 1) * this._getBlockerRowHeight(),
				// Day view has bigger height because of the day marker for special days
				iRecalculatedContHeight = this._getColumns() === 1 ? iContainerHeight + DAY_MARKER_HEIGHT_PX : iContainerHeight,
				iBlockerRowHeight = this._getBlockerRowHeight();

			if (iMaxLevel > 0) { // hackie thing to calculate the container witdth. When we have more than 1 line of blockers - we must add 3 px in order to render the blockers visually in the container.
				iRecalculatedContHeight = iRecalculatedContHeight + 3;
			}
			this.$().find(".sapMSinglePCBlockersColumns").css("height", iRecalculatedContHeight);

			this._oBlockersToRender.oBlockersList.getIterator().forEach(function(oBlokcerNode) {
				oBlokcerNode.getData().$().css("top", iBlockerRowHeight * oBlokcerNode.level + 1);
			});
		};

		/*
		 * Calculates the blocker column's height in the day view because of the special dates.
		 */
		SinglePlanningCalendarGrid.prototype._adjustBlockersHeightforCozy = function () {
			var iMaxLevel = this._getBlockersToRender() && this._getBlockersToRender().iMaxlevel,
				iContainerHeight;

			if (this._getColumns() === 1) {
				iContainerHeight = (iMaxLevel + 1) * this._getBlockerRowHeight();
				this.$().find(".sapMSinglePCBlockersColumns").css("height", iContainerHeight + DAY_MARKER_HEIGHT_PX);
			}
		};

		SinglePlanningCalendarGrid.prototype.onAfterRendering = function () {
			var iColumns = this._getColumns(),
				oStartDate = this.getStartDate(),
				iRowHeight = this._getRowHeight();

			if (iRowHeight === ROW_HEIGHT_COMPACT) {
				for (var i = 0; i < iColumns; i++) {
					var oColumnCalDate = new CalendarDate(oStartDate.getFullYear(), oStartDate.getMonth(), oStartDate.getDate() + i),
						sDate = this._getDateFormatter().format(oColumnCalDate.toLocalJSDate()),
						oColumnStartDateAndHour = new UniversalDate(oColumnCalDate.getYear(), oColumnCalDate.getMonth(), oColumnCalDate.getDate(), this._getVisibleStartHour()),
						oColumnEndDateAndHour = new UniversalDate(oColumnCalDate.getYear(), oColumnCalDate.getMonth(), oColumnCalDate.getDate(), this._getVisibleEndHour(), 59, 59);
					this._adjustAppointmentsHeightforCompact(sDate, oColumnStartDateAndHour, oColumnEndDateAndHour);
				}
				this._adjustBlockersHeightforCompact();
			} else {
				this._adjustBlockersHeightforCozy();
			}

			this._updateRowHeaderAndNowMarker();
			_initItemNavigation.call(this);
		};

		/**
		 * Handles the <code>keydown</code> event when any key is pressed.
		 *
		 * @param {jQuery.Event} oEvent The event object.
		 */
		SinglePlanningCalendarGrid.prototype.onkeydown = function (oEvent) {
			var oAppointment = oEvent.srcControl,
				bRemoveOldSelection = !(oEvent.ctrlKey || oEvent.metaKey),
				oGridCell;

			if (oEvent.which === KeyCodes.SPACE || oEvent.which === KeyCodes.ENTER) {
				if (oAppointment && oAppointment.isA("sap.ui.unified.CalendarAppointment")) {
					this.fireAppointmentSelect({
						appointment: oAppointment,
						appointments: this._toggleAppointmentSelection(oAppointment, bRemoveOldSelection)
					});
				} else if (oEvent.target.classList.contains("sapMSinglePCRow") ||
					oEvent.target.classList.contains("sapMSinglePCBlockersColumn")) {

					oGridCell = oEvent.target;
					this.fireEvent("cellPress", {
						startDate: this._getDateFormatter().parse(oGridCell.getAttribute("data-sap-start-date")),
						endDate: this._getDateFormatter().parse(oGridCell.getAttribute("data-sap-end-date"))
					});
				}

				// Prevent scrolling
				oEvent.preventDefault();
			}
		};

		/**
		 * Ensures that the focus is moved from an appointment to the correct cell from the visible grid area or
		 * borderReached event is fired when the correct cell to focus is outside of the visible grid area
		 * and removes the appointments selection.
		 *
		 * @param {object} oEvent The event object that is passed to the onsapup, onsapdown, onsapright, on sapleft handlers
		 * @param {int} iDirection Number representing the key code of the pressed arrow from the keyboard
		 * @private
		 */
		SinglePlanningCalendarGrid.prototype._appFocusHandler = function(oEvent, iDirection) {
			var oAppointment = sap.ui.getCore().byId(oEvent.target.id),
				bIsAppointment = oAppointment && oAppointment.isA("sap.ui.unified.CalendarAppointment");

			if (bIsAppointment) {
				this.fireAppointmentSelect({
					appointment: undefined,
					appointments: this._toggleAppointmentSelection(undefined, true)
				});
				this._focusCellWithKeyboard(oAppointment, iDirection);

				// Prevent scrolling
				oEvent.preventDefault();
			}
		};

		/**
		 * Ensures that the borderReached event is fired when the focus is on a cell and border is reached.
		 *
		 * @param {object} oEvent The event object that is passed to the onsapup, onsapdown, onsapright, on sapleft handlers
		 * @param {int} iDirection Number representing the key code of the pressed arrow from the keyboard
		 * @private
		 */
		SinglePlanningCalendarGrid.prototype._cellFocusHandler = function(oEvent, iDirection) {
			var oGridCell = oEvent.target,
				oFormat = this._getDateFormatter(),
				oFocusedElement;

			if (oGridCell.classList.contains("sapMSinglePCRow") ||
				oGridCell.classList.contains("sapMSinglePCBlockersColumn")) {

				oFocusedElement = oFormat.parse(oGridCell.getAttribute("data-sap-start-date"));
				if (this._isBorderReached(oFocusedElement, iDirection)) {
					this.fireEvent("borderReached", {
						startDate: oFocusedElement,
						next: iDirection === KeyCodes.ARROW_RIGHT,
						fullDay: oGridCell.classList.contains("sapMSinglePCBlockersColumn")
					});
				}
			}
		};

		SinglePlanningCalendarGrid.prototype.onsapup = function (oEvent) {
			this._appFocusHandler(oEvent, KeyCodes.ARROW_UP);
		};

		SinglePlanningCalendarGrid.prototype.onsapdown = function (oEvent) {
			this._appFocusHandler(oEvent, KeyCodes.ARROW_DOWN);
		};

		SinglePlanningCalendarGrid.prototype.onsapright = function (oEvent) {
			this._appFocusHandler(oEvent, KeyCodes.ARROW_RIGHT);
			this._cellFocusHandler(oEvent, KeyCodes.ARROW_RIGHT);
		};

		SinglePlanningCalendarGrid.prototype.onsapleft = function (oEvent) {
			this._appFocusHandler(oEvent, KeyCodes.ARROW_LEFT);
			this._cellFocusHandler(oEvent, KeyCodes.ARROW_LEFT);
		};

		SinglePlanningCalendarGrid.prototype.setStartDate = function (oStartDate) {
			this._oOldStartDate = this.getStartDate();
			this.getAggregation("_columnHeaders").setStartDate(oStartDate);

			return this.setProperty("startDate", oStartDate);
		};

		// This function gets called from CalendarAppointment.prototype.applyFocusInfo function
		// and therefore its only concern is the appointments focus in the SinglePlanningCalendarGrid
		SinglePlanningCalendarGrid.prototype.applyFocusInfo = function (oFocusInfo) {
			var aVisibleBlockers = this._getVisibleBlockers(),
				oVisibleAppointments = this._getVisibleAppointments(),
				aVisibleAppsKeys = Object.keys(oVisibleAppointments),
				aVisibleAppsInDay,
				i, j;

			// Search amongst the visible blockers
			for (i = 0; i < aVisibleBlockers.length; ++i) {
				if (aVisibleBlockers[i].getId() === oFocusInfo.id) {
					aVisibleBlockers[i].focus();
					return this;
				}
			}

			// Search amongst the visible appointments
			for (i = 0; i < aVisibleAppsKeys.length; ++i) {
				aVisibleAppsInDay = oVisibleAppointments[aVisibleAppsKeys[i]];
				for (j = 0; j < aVisibleAppsInDay.length; ++j) {
					if (aVisibleAppsInDay[j].getId() === oFocusInfo.id) {
						aVisibleAppsInDay[j].focus();
						return this;
					}
				}
			}

			return this;
		};

		/**
		 * Holds the selected appointments. If no appointments are selected, an empty array is returned.
		 *
		 * @returns {sap.ui.unified.CalendarAppointment[]} All selected appointments
		 * @since 1.62
		 * @public
		 */
		SinglePlanningCalendarGrid.prototype.getSelectedAppointments = function() {
			return this.getAppointments().filter(function(oAppointment) {
				return oAppointment.getSelected();
			});
		};


		/*
		 * PRIVATE API
		 */

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
		SinglePlanningCalendarGrid.prototype._toggleAppointmentSelection = function (oAppointment, bRemoveOldSelection) {
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

		/**
		 * Checking when an arrow key is pressed from the keyboard weather the cell focus should go in
		 * the next or preveous day or week
		 *
		 * @param {sap.ui.unified.CalendarDate} oCellStartDate The start date the cell or the visible part of the appointment
		 * @param {integer} iDirection The key the was pressed
		 * @returns {boolean} Idicator if the gird border is reached
		 * @private
		 */
		SinglePlanningCalendarGrid.prototype._isBorderReached = function(oFocusedElement, iDirection) {
			var oGridStartDate = CalendarDate.fromLocalJSDate(this.getStartDate()),
				oGridEndDate = new CalendarDate(oGridStartDate.getYear(), oGridStartDate.getMonth(), oGridStartDate.getDate() + this._getColumns() - 1),
				oTargetStartDate = CalendarDate.fromLocalJSDate(oFocusedElement),
				bLeft = iDirection === KeyCodes.ARROW_LEFT && oTargetStartDate.isSame(oGridStartDate),
				bRight = iDirection === KeyCodes.ARROW_RIGHT && oTargetStartDate.isSame(oGridEndDate);

			return bLeft || bRight;
		};

		/**
		 * Ensures that the focus is moved from an appointment to the correct cell from the visible grid area or
		 * borderReached event is fired when the correct cell to focus is outside of the visible grid area.
		 *
		 * @param {object} oEvent The event object that is passed to the onsapup, onsapdown, onsapright, on sapleft handlers
		 * @param {int} iDirection Number representing the key code of the pressed arrow from the keyboard
		 * @private
		 */
		SinglePlanningCalendarGrid.prototype._focusCellWithKeyboard = function (oAppointment, iDirection) {
			var bFullDayApp = this.isAllDayAppointment(oAppointment.getStartDate(), oAppointment.getEndDate()),
				oFormat = this._getDateFormatter(),
				oAppStartDate = new Date(oAppointment.getStartDate().getFullYear(), oAppointment.getStartDate().getMonth(), oAppointment.getStartDate().getDate(), oAppointment.getStartDate().getHours()),
				oGridStartDate = new Date(this.getStartDate().getFullYear(), this.getStartDate().getMonth(), this.getStartDate().getDate(), this.getStartDate().getHours());

			// If an appointment start hour is before the visible grid start date
			// we will use the grid start date as the appointment start date.
			if (oAppStartDate < oGridStartDate) {
				oAppStartDate = oGridStartDate;
			}

			if (this._isBorderReached(oAppStartDate, iDirection)) {
				this.fireEvent("borderReached", {
					startDate: oAppStartDate,
					next: iDirection === KeyCodes.ARROW_RIGHT,
					fullDay: bFullDayApp
				});
				return;
			}

			switch (iDirection) {
				case KeyCodes.ARROW_UP:
					if (!bFullDayApp) {
						oAppStartDate.setHours(oAppStartDate.getHours() - 1);
					}
					break;
				case KeyCodes.ARROW_DOWN:
					if (!bFullDayApp) {
						oAppStartDate.setHours(oAppStartDate.getHours() + 1);
					}
					break;
				case KeyCodes.ARROW_LEFT:
					oAppStartDate.setDate(oAppStartDate.getDate() - 1);
					break;
				case KeyCodes.ARROW_RIGHT:
					oAppStartDate.setDate(oAppStartDate.getDate() + 1);
					break;
				default:
			}

			if (bFullDayApp && iDirection !== KeyCodes.ARROW_DOWN) {
				jQuery("[data-sap-start-date='" + oFormat.format(oAppStartDate) + "'].sapMSinglePCBlockersColumn").focus();
			} else {
				jQuery("[data-sap-start-date='" + oFormat.format(oAppStartDate) + "'].sapMSinglePCRow").focus();
			}
		};

		/**
		 * Handles the <code>tap</code> event on the grid.
		 *
		 * @param {jQuery.Event} oEvent The event object
		 */
		SinglePlanningCalendarGrid.prototype.ontap = function (oEvent) {
			var oAppointment = oEvent.srcControl,
				bRemoveOldSelection = !(oEvent.ctrlKey || oEvent.metaKey);

			if (oAppointment && oAppointment.isA("sap.ui.unified.CalendarAppointment")) {

				this.fireAppointmentSelect({
					appointment: oAppointment,
					appointments: this._toggleAppointmentSelection(oAppointment, bRemoveOldSelection)
				});
			} else if (oEvent.target.classList.contains("sapMSinglePCRow") ||
				oEvent.target.classList.contains("sapMSinglePCBlockersColumn")) {

				this.fireAppointmentSelect({
					appointment: undefined,
					appointments: this._toggleAppointmentSelection(undefined, true)
				});
			}
		};

		/**
		 * Determines which is the first visible hour of the grid.
		 *
		 * @returns {int} the first visible hour of the grid
		 * @private
		 */
		SinglePlanningCalendarGrid.prototype._getVisibleStartHour = function () {
			// inject here the logic about the visibility of the fisrt visible hour, when the startHour property exist
			// example:
			// return this.getShowFullDay() ? 0 : this._getStartHour();
			return 0;
		};

		/**
		 * Determines which is the last visible hour of the grid.
		 *
		 * @returns {int} the last visible hour of the grid
		 * @private
		 */
		SinglePlanningCalendarGrid.prototype._getVisibleEndHour = function () {
			// inject here the logic about the visibility of the last visible hour, when the endHour property exist
			// example:
			// return (this.getShowFullDay() ? 24 : this._getEndHour()) - 1;
			return 23;
		};

		/**
		 * Determines if a given hour is between the first and the last visible hour in the grid.
		 *
		 * @returns {boolean} true if the iHour is in the visible hour range
		 * @private
		 */
		SinglePlanningCalendarGrid.prototype._isVisibleHour = function () {
			// inject here the logic about the visibility of the working time range, when the startHour and endHour
			// properties exist
			// example:
			// return this._getStartHour() <= iHour && iHour <= this._getEndHour();
			return true;
		};

		/**
		 * Determines whether the given hour is outside the visible hours of the grid.
		 *
		 * @returns {boolean} true if the iHour is outside the visible hour range
		 * @private
		 */
		SinglePlanningCalendarGrid.prototype._isOutsideVisibleHours = function () {
			// inject here the logic about the visibility of the working time range, when the startHour and endHour
			// properties exist
			// example:
			// var iVisibleStartHour = this._getVisibleStartHour(),
			// 	   iVisibleEndHour = this._getVisibleEndHour();
			// 	   return iHour < iVisibleStartHour || iHour > iVisibleEndHour;

			return false;
		};

		/**
		 * Determines whether the row header should be hidden based on the visible hours in the grid.
		 *
		 * @param {int} iRow the row to be checked
		 * @returns {boolean} true if the row should be hidden
		 * @private
		 */
		SinglePlanningCalendarGrid.prototype._shouldHideRowHeader = function (iRow) {
			var iCurrentHour = new Date().getHours(),
				bIsNearAfterCurrentHour = CalendarUtils._areCurrentMinutesLessThan(15) && iCurrentHour === iRow,
				bIsNearBeforeCurrentHour = CalendarUtils._areCurrentMinutesMoreThan(45) && iCurrentHour === iRow - 1;

			return bIsNearAfterCurrentHour || bIsNearBeforeCurrentHour;
		};

		/**
		 * Takes a string date and integer hour and returns a JS Date object as a result.
		 * Example: this._parseDateStringAndHours("20180614-0000", 4) -> Thu Jun 14 2018 04:00:00 GMT+0300 (Eastern European Summer Time)
		 *
		 * @param {string} iRow the row to be checked
		 * @param {int} iRow the row to be checked
		 * @returns {Date} The parsed JavaScript date object.
		 * @private
		 */
		SinglePlanningCalendarGrid.prototype._parseDateStringAndHours = function (sDay, iHours) {
			var oDate = this._getDateFormatter().parse(sDay);

			if (iHours) {
				oDate.setHours(iHours);
			}

			return oDate;
		};

		SinglePlanningCalendarGrid.prototype._getDateFormatter = function () {
			if (!(this._oDateFormat instanceof DateFormat)) {
				this._oDateFormat = DateFormat.getDateTimeInstance({ pattern: "YYYYMMdd-HHmm" });
			}
			return this._oDateFormat;
		};

		/**
		 * Formats the hour and minutes of the given date to a string. Example: 2 June 2018 17:54:33 -> "5:54"
		 *
		 * @param {object} oDate the date to be formatted
		 * @returns {string} the formatted string
		 * @private
		 */
		SinglePlanningCalendarGrid.prototype._formatTimeAsString = function (oDate) {
			var sPattern = this._getHoursPattern() + ":mm",
				oFormat = DateFormat.getDateTimeInstance({pattern: sPattern }, new Locale(this._getCoreLocaleId()));

			return oFormat.format(oDate);
		};

		/**
		 * Constructs a sting AM/PM part of a date. Example: 2 June 2018 17:54:33 -> " PM"
		 *
		 * @param {object} oDate the date to be formatted
		 * @returns {string} the formatted string
		 * @private
		 */
		SinglePlanningCalendarGrid.prototype._addAMPM = function (oDate) {
			var oAMPMFormat = this._getAMPMFormat();

			return " " + oAMPMFormat.format(oDate);
		};

		/**
		 * Calculates the top position of the now marker of an appointment - a regular one or an all-day one.
		 *
		 * @param {object} oDate the date of the element to be displayed
		 * @returns {int} the top position of the html element
		 * @private
		 */
		SinglePlanningCalendarGrid.prototype._calculateTopPosition = function (oDate) {
			var iHour = oDate.getHours() - this._getVisibleStartHour(),
				iMinutes = oDate.getMinutes(),
				iRowHeight = this._getRowHeight();

			return Math.floor((iRowHeight * iHour) + (iRowHeight / 60) * iMinutes);
		};

		/**
		 * Calculates the bottom position of an appointment.
		 *
		 * @param {object} oDate the date of the appointment to be displayed
		 * @returns {int} the bottom position of the html element
		 * @private
		 */
		SinglePlanningCalendarGrid.prototype._calculateBottomPosition = function (oDate) {
			var iHour = this._getVisibleEndHour() + 1 - oDate.getHours(),
				iMinutes = oDate.getMinutes(),
				iRowHeight = this._getRowHeight();

			return Math.floor((iRowHeight * iHour) - (iRowHeight / 60) * iMinutes);
		};

		/**
		 * Updates the now marker and the row headers positions in every minute.
		 *
		 * @private
		 */
		SinglePlanningCalendarGrid.prototype._updateRowHeaderAndNowMarker = function () {
			var oCurrentDate = new Date();

			this._updateNowMarker(oCurrentDate);
			this._updateRowHeaders(oCurrentDate);

			setTimeout(this._updateRowHeaderAndNowMarker.bind(this), ONE_MIN_MS);
		};

		/**
		 * Updates the now marker assuming that there is a DOM representation.
		 *
		 * @param {object} oDate the date to be displayed
		 * @private
		 */
		SinglePlanningCalendarGrid.prototype._updateNowMarker = function (oDate) {
			var $nowMarker = this.$("nowMarker"),
				$nowMarkerText = this.$("nowMarkerText"),
				$nowMarkerAMPM = this.$("nowMarkerAMPM"),
				bCurrentHourNotVisible = this._isOutsideVisibleHours(oDate.getHours());

			$nowMarker.toggleClass("sapMSinglePCNowMarkerHidden", bCurrentHourNotVisible);
			$nowMarker.css("top", this._calculateTopPosition(oDate) + "px");
			$nowMarkerText.text(this._formatTimeAsString(oDate));
			$nowMarkerAMPM.text(this._addAMPM(oDate));
			$nowMarkerText.append($nowMarkerAMPM);
		};

		/**
		 * Updates the row headers assuming that there is a DOM representation.
		 *
		 * @param {object} oDate the date to be displayed
		 * @private
		 */
		SinglePlanningCalendarGrid.prototype._updateRowHeaders = function (oDate) {
			var $domRef = this.$(),
				iCurrentHour = oDate.getHours(),
				iNextHour = iCurrentHour + 1;

			$domRef.find(".sapMSinglePCRowHeader").removeClass("sapMSinglePCRowHeaderHidden");

			if (this._shouldHideRowHeader(iCurrentHour)) {
				$domRef.find(".sapMSinglePCRowHeader" + iCurrentHour).addClass("sapMSinglePCRowHeaderHidden");
			} else if (this._shouldHideRowHeader(iNextHour)) {
				$domRef.find(".sapMSinglePCRowHeader" + iNextHour).addClass("sapMSinglePCRowHeaderHidden");
			}
		};

		/**
		 * Distributes the appointments and the all-day appointments in clusters by their date grid.
		 *
		 * @param {Array} aAppointments the appointments in the corresponding aggregation
		 * @returns {object} the clustered appointments - regular and all-day
		 * @private
		 */
		SinglePlanningCalendarGrid.prototype._createAppointmentsMap = function (aAppointments) {
			var that = this;

			return aAppointments.reduce(function (oMap, oAppointment) {
				var oAppStartDate = oAppointment.getStartDate(),
					oAppEndDate = oAppointment.getEndDate(),
					oCurrentAppCalStartDate,
					oCurrentAppCalEndDate,
					sDay;

				if (!oAppStartDate || !oAppEndDate) {
					return oMap;
				}

				if (!that.isAllDayAppointment(oAppStartDate, oAppEndDate)) {
					oCurrentAppCalStartDate = CalendarDate.fromLocalJSDate(oAppStartDate);
					oCurrentAppCalEndDate = CalendarDate.fromLocalJSDate(oAppEndDate);

					while (oCurrentAppCalStartDate.isSameOrBefore(oCurrentAppCalEndDate)) {
						sDay = that._getDateFormatter().format(oCurrentAppCalStartDate.toLocalJSDate());

						if (!oMap.appointments[sDay]) {
							oMap.appointments[sDay] = [];
						}

						oMap.appointments[sDay].push(oAppointment);

						oCurrentAppCalStartDate.setDate(oCurrentAppCalStartDate.getDate() + 1);
					}
				} else {
					oMap.blockers.push(oAppointment);
				}

				return oMap;
			}, { appointments: {}, blockers: []});
		};

		/**
		 * Selects the clusters of appointments which are in the visual port of the grid.
		 *
		 * @param {object} oAppointments the appointments in the corresponding aggregation
		 * @param {Date} oStartDate the start date of the grid
		 * @param {int} iColumns the number of columns to be displayed in the grid
		 * @returns {object} the clusters of appointments in the visual port of the grid
		 * @private
		 */
		SinglePlanningCalendarGrid.prototype._calculateVisibleAppointments = function (oAppointments, oStartDate, iColumns) {
			var oVisibleAppointments = {},
				oCalDate,
				sDate,
				fnIsVisiblePredicate;

			for (var i = 0; i < iColumns; i++) {
				oCalDate = new CalendarDate(oStartDate.getFullYear(), oStartDate.getMonth(), oStartDate.getDate() + i);
				sDate = this._getDateFormatter().format(oCalDate.toLocalJSDate());
				fnIsVisiblePredicate = this._isAppointmentFitInVisibleHours(oCalDate);

				if (oAppointments[sDate]) {
					oVisibleAppointments[sDate] = oAppointments[sDate]
						.filter(fnIsVisiblePredicate, this)
						.sort(this._sortAppointmentsByStartHourCallBack);
				}
			}

			return oVisibleAppointments;
		};

		/**
		 * Determines if an appointment fits in the visible hours of the grid.
		 *
		 * @param {CalendarDate} oColumnCalDate the start date of the grid
		 * @returns {boolean} true if the appointment is in the visible hours
		 * @private
		 */
		SinglePlanningCalendarGrid.prototype._isAppointmentFitInVisibleHours = function (oColumnCalDate) {
			return function (oAppointment) {
				var iAppStartTime = oAppointment.getStartDate().getTime(),
					iAppEndTime = oAppointment.getEndDate().getTime(),
					iColumnStartTime = (new UniversalDate(oColumnCalDate.getYear(), oColumnCalDate.getMonth(), oColumnCalDate.getDate(), this._getVisibleStartHour())).getTime(),
					iColumnEndTime = (new UniversalDate(oColumnCalDate.getYear(), oColumnCalDate.getMonth(), oColumnCalDate.getDate(), this._getVisibleEndHour(), 59, 59)).getTime();

				var bBiggerThanVisibleHours = iAppStartTime < iColumnStartTime && iAppEndTime > iColumnEndTime,
					bStartHourBetweenColumnStartAndEnd = iAppStartTime >= iColumnStartTime && iAppStartTime < iColumnEndTime,
					bEndHourBetweenColumnStartAndEnd = iAppEndTime > iColumnStartTime && iAppEndTime <= iColumnEndTime;

				return bBiggerThanVisibleHours || bStartHourBetweenColumnStartAndEnd || bEndHourBetweenColumnStartAndEnd;
			};
		};

		/**
		 * Calculates the position of each appointment regarding the rest of them.
		 *
		 * @param {object} oVisibleAppointments the visible appointments in the grid
		 * @returns {object} the visible appointments in the grid
		 * @private
		 */
		SinglePlanningCalendarGrid.prototype._calculateAppointmentsLevelsAndWidth = function (oVisibleAppointments) {
			var that = this;

			return Object.keys(oVisibleAppointments).reduce(function (oAcc, sDate) {
				var iMaxLevel = 0,
					oAppointmentsList = new SinglePlanningCalendarUtilities.list(),
					aAppointments = oVisibleAppointments[sDate];

				aAppointments.forEach(function (oCurrentAppointment) {
					var oCurrentAppointmentNode = new SinglePlanningCalendarUtilities.node(oCurrentAppointment),
						iCurrentAppointmentStart = oCurrentAppointment.getStartDate().getTime();

					if (oAppointmentsList.getSize() === 0) {
						oAppointmentsList.add(oCurrentAppointmentNode);
						return;
					}

					oAppointmentsList.getIterator().forEach(function (oAppointmentNode) {
						var bShouldBreak = true,
							oAppointment = oAppointmentNode.getData(),
							iAppointmentStart = oAppointment.getStartDate().getTime(),
							iAppointmentEnd = oAppointment.getEndDate().getTime(),
							iAppointmentDuration = iAppointmentEnd - iAppointmentStart;

						if (iAppointmentDuration < HALF_HOUR_MS) {
							// Take into account that appointments smaller than one hour will be rendered as one hour
							// in height. That's why the calculation for levels should consider this too.
							iAppointmentEnd = iAppointmentEnd + (HALF_HOUR_MS - iAppointmentDuration);
						}

						if (iCurrentAppointmentStart >= iAppointmentStart && iCurrentAppointmentStart < iAppointmentEnd) {
							oCurrentAppointmentNode.level++;
							iMaxLevel = Math.max(iMaxLevel, oCurrentAppointmentNode.level);
						}

						if (oAppointmentNode.next && oAppointmentNode.next.level === oCurrentAppointmentNode.level) {
							bShouldBreak = false;
						}

						if (iCurrentAppointmentStart >= iAppointmentEnd && bShouldBreak) {
							this.interrupt();
						}
					});

					oAppointmentsList.insertAfterLevel(oCurrentAppointmentNode.level, oCurrentAppointmentNode);
				});

				oAcc[sDate] = { oAppointmentsList: that._calculateAppointmentsWidth(oAppointmentsList), iMaxLevel: iMaxLevel };

				return oAcc;
			}, {});
		};

		/**
		 * Calculates width of each appointment.
		 *
		 * @param {object} oAppointmentsList the visible appointments in the grid
		 * @returns {object} the visible appointments in the grid
		 * @private
		 */
		SinglePlanningCalendarGrid.prototype._calculateAppointmentsWidth = function (oAppointmentsList) {

			oAppointmentsList.getIterator().forEach(function (oCurrentAppointmentNode) {
				var oCurrentAppointment = oCurrentAppointmentNode.getData(),
					iLevelFoundSpace = oCurrentAppointmentNode.level,
					iCurrentAppointmentLevel = oCurrentAppointmentNode.level,
					iCurrentAppointmentStart = oCurrentAppointment.getStartDate().getTime(),
					iCurrentAppointmentEnd = oCurrentAppointment.getEndDate().getTime(),
					iCurrentAppointmentDuration = iCurrentAppointmentEnd - iCurrentAppointmentStart;

				if (iCurrentAppointmentDuration < HALF_HOUR_MS) {
					// Take into account that appointments smaller than one hour will be rendered as one hour
					// in height. That's why the calculation for levels should consider this too.
					iCurrentAppointmentEnd = iCurrentAppointmentEnd + (HALF_HOUR_MS - iCurrentAppointmentDuration);
				}

				new SinglePlanningCalendarUtilities.iterator(oAppointmentsList).forEach(function (oAppointmentNode) {
					var oAppointment = oAppointmentNode.getData(),
						iAppointmentLevel = oAppointmentNode.level,
						iAppointmentStart = oAppointment.getStartDate().getTime(),
						iAppointmentEnd = oAppointment.getEndDate().getTime(),
						iAppointmentDuration = iAppointmentEnd - iAppointmentStart;

					if (iAppointmentDuration < HALF_HOUR_MS) {
						// Take into account that appointments smaller than one hour will be rendered as one hour
						// in height. That's why the calculation for levels should consider this too.
						iAppointmentEnd = iAppointmentEnd + (HALF_HOUR_MS - iAppointmentDuration);
					}

					if (iCurrentAppointmentLevel >= iAppointmentLevel) {
						return;
					}

					if (
						iCurrentAppointmentStart >= iAppointmentStart && iCurrentAppointmentStart < iAppointmentEnd ||
						iCurrentAppointmentEnd > iAppointmentStart && iCurrentAppointmentEnd < iAppointmentEnd ||
						iCurrentAppointmentStart <= iAppointmentStart && iCurrentAppointmentEnd >= iAppointmentEnd
					) {
						oCurrentAppointmentNode.width = iAppointmentLevel - iCurrentAppointmentLevel;
						this.interrupt();
						return;
					}

					if (iLevelFoundSpace < iAppointmentLevel) {
						iLevelFoundSpace = iAppointmentLevel;
						oCurrentAppointmentNode.width++;
					}
				});
			});

			return oAppointmentsList;
		};

		/**
		 * Selects the clusters of all-day appointments which are in the visual port of the grid.
		 *
		 * @param {object} aBlockers the all-day appointments in the corresponding aggregation
		 * @param {CalendarDate} oCalStartDate the start date of the grid
		 * @param {int} iColumns the number of columns to be displayed in the grid
		 * @returns {object} the clusters of all-day appointments in the visual port of the grid
		 * @private
		 */
		SinglePlanningCalendarGrid.prototype._calculateVisibleBlockers = function (aBlockers, oCalStartDate, iColumns) {
			var oCalEndDate = new CalendarDate(oCalStartDate.getYear(), oCalStartDate.getMonth(), oCalStartDate.getDate() + iColumns - 1),
				fnIsVisiblePredicate = this._isBlockerVisible(oCalStartDate, oCalEndDate);

			return aBlockers.filter(fnIsVisiblePredicate)
				.sort(this._sortAppointmentsByStartHourCallBack);
		};

		/**
		 * Determines whether the blocker is in the visible grid area.
		 *
		 * @param {CalendarDate} oViewStart The start date of the view
		 * @param {CalendarDate} oViewEnd The end date of the view
		 * @returns {boolean} true if the blocker is visible
		 * @private
		 */
		SinglePlanningCalendarGrid.prototype._isBlockerVisible = function (oViewStart, oViewEnd) {
			return function (oAppointment) {
				var oAppStart = CalendarDate.fromLocalJSDate(oAppointment.getStartDate()),
					oAppEnd = CalendarDate.fromLocalJSDate(oAppointment.getEndDate());

				var bIsBiggerThanView = oAppStart.isBefore(oViewStart) && oAppEnd.isAfter(oViewEnd),
					bStartDateBetweenViewStartAndEnd = CalendarUtils._isBetween(oAppStart, oViewStart, oViewEnd, true),
					bEndDateBetweenViewStartAndEnd = CalendarUtils._isBetween(oAppEnd, oViewStart, oViewEnd, true);

				return bIsBiggerThanView || bStartDateBetweenViewStartAndEnd || bEndDateBetweenViewStartAndEnd;
			};
		};

		/**
		 * Calculates the position of each all-day appointment regarding the rest of them.
		 *
		 * @param {object} aVisibleBlockers the visible all-day appointments in the grid
		 * @returns {object} the visible all-day appointments in the grid
		 * @private
		 */
		SinglePlanningCalendarGrid.prototype._calculateBlockersLevelsAndWidth = function (aVisibleBlockers) {
			var iMaxLevel = 0,
				oBlockersList = new SinglePlanningCalendarUtilities.list();

			aVisibleBlockers.forEach(function (oCurrentBlocker) {
				var oCurrentBlockerNode = new SinglePlanningCalendarUtilities.node(oCurrentBlocker),
					oCurrentBlockerStart = CalendarDate.fromLocalJSDate(oCurrentBlocker.getStartDate()),
					oCurrentBlockerEnd = CalendarDate.fromLocalJSDate(oCurrentBlocker.getEndDate());

				oCurrentBlockerNode.width = CalendarUtils._daysBetween(oCurrentBlockerEnd, oCurrentBlockerStart);

				if (oBlockersList.getSize() === 0) {
					oBlockersList.add(oCurrentBlockerNode);
					return;
				}

				oBlockersList.getIterator().forEach(function (oBlockerNode) {
					var bShouldBreak = true,
						oBlocker = oBlockerNode.getData(),
						oBlockerStart = CalendarDate.fromLocalJSDate(oBlocker.getStartDate()),
						oBlockerEnd = CalendarDate.fromLocalJSDate(oBlocker.getEndDate());

					if (oCurrentBlockerStart.isSameOrAfter(oBlockerStart) && oCurrentBlockerStart.isSameOrBefore(oBlockerEnd)) {
						oCurrentBlockerNode.level++;
						iMaxLevel = Math.max(iMaxLevel, oCurrentBlockerNode.level);
					}

					if (oBlockerNode.next && oBlockerNode.next.level === oCurrentBlockerNode.level) {
						bShouldBreak = false;
					}

					if (oCurrentBlockerStart.isSameOrAfter(oBlockerEnd) && bShouldBreak) {
						this.interrupt();
					}
				});

				oBlockersList.insertAfterLevel(oCurrentBlockerNode.level, oCurrentBlockerNode);
			}, this);

			return { oBlockersList: oBlockersList, iMaxlevel: iMaxLevel };
		};

		/**
		 * Calculates the time difference between the two given appointments.
		 *
		 * @param {object} oApp1 the first appointment to compare
		 * @param {object} oApp2 the other appointment to compare
		 * @returns {int} the time difference between the appointments
		 * @private
		 */
		SinglePlanningCalendarGrid.prototype._sortAppointmentsByStartHourCallBack = function (oApp1, oApp2) {
			return oApp1.getStartDate().getTime() - oApp2.getStartDate().getTime() || oApp2.getEndDate().getTime() - oApp1.getEndDate().getTime();
		};

		/**
		 * Returns the visible appointments in the view port of the grid.
		 *
		 * @returns {object} the visual appointments
		 * @private
		 */
		SinglePlanningCalendarGrid.prototype._getVisibleAppointments = function () {
			return this._oVisibleAppointments;
		};

		/**
		 * Returns the visible appointments in the view port of the grid with their level and width.
		 *
		 * @returns {object} the visual appointments
		 * @private
		 */
		SinglePlanningCalendarGrid.prototype._getAppointmentsToRender = function () {
			return this._oAppointmentsToRender;
		};

		/**
		 * Returns the visible all-day appointments in the view port of the grid.
		 *
		 * @returns {object} the visual all-day appointments
		 * @private
		 */
		SinglePlanningCalendarGrid.prototype._getVisibleBlockers = function () {
			return this._aVisibleBlockers;
		};

		/**
		 * Returns the visible all-day appointments in the view port of the grid with their level and width.
		 *
		 * @returns {object} the visual all-day appointments
		 * @private
		 */
		SinglePlanningCalendarGrid.prototype._getBlockersToRender = function () {
			return this._oBlockersToRender;
		};

		/**
		 * Sets how many columns to be displayed in the grid.
		 *
		 * @param {int} iColumns the number of columns to be displayed
		 * @private
		 */
		SinglePlanningCalendarGrid.prototype._setColumns = function (iColumns) {
			this._iOldColumns = this._iColumns;
			this._iColumns = iColumns;
			this.getAggregation("_columnHeaders").setDays(iColumns);

			this.invalidate();
			return this;
		};

		/**
		 * Returns how many columns will be displayed in the grid.
		 *
		 * @returns {int} the number of columns to be displayed
		 * @private
		 */
		SinglePlanningCalendarGrid.prototype._getColumns = function () {
			return this._iColumns;
		};

		/**
		 * Returns the height of a row in the grid.
		 *
		 * @returns {int} the height of a row
		 * @private
		 */
		SinglePlanningCalendarGrid.prototype._getRowHeight = function () {
			return this._isCompact() ? ROW_HEIGHT_COMPACT : ROW_HEIGHT_COZY;
		};

		/**
		 * Returns the height of an all-day appointment in the grid.
		 *
		 * @returns {int} the height of an all-day appointment
		 * @private
		 */
		SinglePlanningCalendarGrid.prototype._getBlockerRowHeight = function () {
			return this._isCompact() ? BLOCKER_ROW_HEIGHT_COMPACT : BLOCKER_ROW_HEIGHT_COZY;
		};

		SinglePlanningCalendarGrid.prototype._isCompact = function () {
			var oDomRef = this.getDomRef();

			while (oDomRef && oDomRef.classList) {
				if (oDomRef.classList.contains("sapUiSizeCompact")) {
					return true;
				}
				oDomRef = oDomRef.parentNode;
			}

			return false;
		};

		/**
		 * Returns the format settings about the locale.
		 *
		 * @return {string} the format settings about the locale
		 */
		SinglePlanningCalendarGrid.prototype._getCoreLocaleId = function () {
			if (!this._sLocale) {
				this._sLocale = sap.ui.getCore().getConfiguration().getFormatSettings().getFormatLocale().toString();
			}

			return this._sLocale;
		};

		/**
		 * Returns the locale data.
		 *
		 * @return {object} the locale object
		 */
		SinglePlanningCalendarGrid.prototype._getCoreLocaleData = function() {
			var sLocale,
				oLocale;

			if (!this._oLocaleData) {
				sLocale = this._getCoreLocaleId();
				oLocale = new Locale(sLocale);

				this._oLocaleData = LocaleData.getInstance(oLocale);
			}

			return this._oLocaleData;
		};

		/**
		 * Evaluates whether AM/PM is contained in the time format.
		 *
		 * @return {boolean} true if AM/PM is contained
		 */
		SinglePlanningCalendarGrid.prototype._hasAMPM = function () {
			var oLocaleData = this._getCoreLocaleData();

			return oLocaleData.getTimePattern("short").search("a") >= 0;
		};

		/**
		 * Returns the hours format.
		 *
		 * @return {object} the hours format
		 */
		SinglePlanningCalendarGrid.prototype._getHoursFormat = function () {
			var sLocale = this._getCoreLocaleId();

			if (!this._oHoursFormat || this._oHoursFormat.oLocale.toString() !== sLocale) {
				var oLocale = new Locale(sLocale),
					sPattern = this._getHoursPattern();
				this._oHoursFormat = DateFormat.getTimeInstance({pattern: sPattern}, oLocale);
			}

			return this._oHoursFormat;
		};

		/**
		 * Returns the hours pattern.
		 *
		 * @return {object} the hours pattern
		 */
		SinglePlanningCalendarGrid.prototype._getHoursPattern = function () {
			return this._hasAMPM() ? "h" : "H";
		};

		/**
		 * Returns the AM/PM format.
		 *
		 * @return {object} the AM/PM format
		 */
		SinglePlanningCalendarGrid.prototype._getAMPMFormat = function () {
			var sLocale = this._getCoreLocaleId(),
				oLocale = new Locale(sLocale);

			if (!this._oAMPMFormat || this._oAMPMFormat.oLocale.toString() !== sLocale) {
				this._oAMPMFormat = DateFormat.getTimeInstance({pattern: "a"}, oLocale);
			}

			return this._oAMPMFormat;
		};

		/**
		 * Getter for _columnHeaders.
		 *
		 * @returns {object} The _columnHeaders object
		 * @private
		 */
		SinglePlanningCalendarGrid.prototype._getColumnHeaders = function () {
			return this.getAggregation("_columnHeaders");
		};

		/**
		 * Gets Start/End information for a given a appointment.
		 *
		 * @param {sap.ui.unified.CalendarAppointment} oAppointment - The appointment for which Start/End information will be generated.
		 * @returns {string}
		 * @private
		 */
		SinglePlanningCalendarGrid.prototype._getAppointmentAnnouncementInfo = function (oAppointment) {
			var sStartTime = this._oUnifiedRB.getText("CALENDAR_START_TIME"),
				sEndTime = this._oUnifiedRB.getText("CALENDAR_END_TIME"),
				sFormattedStartDate = this._oFormatAriaApp.format(oAppointment.getStartDate()),
				sFormattedEndDate = this._oFormatAriaApp.format(oAppointment.getEndDate()),
				sAppInfo = sStartTime + ": " + sFormattedStartDate + "; " + sEndTime + ": " + sFormattedEndDate;

			return sAppInfo + "; " + PlanningCalendarLegend.findLegendItemForItem(sap.ui.getCore().byId(this._sLegendId), oAppointment);
		};

		/**
		 * This method is a hook for the RenderManager that gets called
		 * during the rendering of child Controls. It allows to add,
		 * remove and update existing accessibility attributes (ARIA) of
		 * those controls.
		 *
		 * @param {sap.ui.core.Control} oControl - The Control that gets rendered by the RenderManager
		 * @param {Object} mAriaProps - The mapping of "aria-" prefixed attributes
		 * @protected
		 */
		SinglePlanningCalendarGrid.prototype.enhanceAccessibilityState = function(oControl, mAriaProps) {
			if (oControl.getId() === this._getColumnHeaders().getId()) {
				mAriaProps.labelledby = InvisibleText.getStaticId("sap.m", "PLANNINGCALENDAR_DAYS");
			}
		};

		/**
		 * Gets Start/End information for a given a appointment or cell.
		 *
		 * @param {Date} oStartDate - The appointment or cell start JS date for which Start information will be generated.
		 * @param {Date} oEndDate - The appointment or cell end JS date for which End information will be generated.
		 * @returns {string}
		 * @private
		 */
		SinglePlanningCalendarGrid.prototype._getCellStartEndInfo = function (oStartDate, oEndDate) {
			var sStartTime = this._oUnifiedRB.getText("CALENDAR_START_TIME"),
				sEndTime = this._oUnifiedRB.getText("CALENDAR_END_TIME"),
				bFullDay = !oEndDate;

			if (bFullDay) {
				return sStartTime + ": " + this._oFormatAriaFullDayCell.format(oStartDate) + "; ";
			}
			return sStartTime + ": " + this._oFormatAriaCell.format(oStartDate) + "; " + sEndTime + ": " + this._oFormatAriaCell.format(oEndDate) + "; ";
		};

		/**
		 * Returns whether the appointment starts at 00:00 and ends in 00:00 on any day in the future.
		 *
		 * @param {Object} oAppStartDate - Start date of the appointment
		 * @param {Object} oAppEndDate - End date of the appointment
		 * @returns {boolean}
		 */
		SinglePlanningCalendarGrid.prototype.isAllDayAppointment = function(oAppStartDate, oAppEndDate) {
			var bStartDateHours = oAppStartDate.getHours() === 0,
				bStartDateMinutes = oAppStartDate.getMinutes() === 0,
				bStartDateSeconds = oAppStartDate.getSeconds() === 0,
				bStartDateMilliseconds = oAppStartDate.getMilliseconds() === 0,
				bStartTimeIs0000 = bStartDateHours && bStartDateMinutes && bStartDateSeconds && bStartDateMilliseconds,
				bAllDay = false;

			if (bStartTimeIs0000) {
				bAllDay = this._isEndTime0000(oAppStartDate, oAppEndDate);
			}

			return bAllDay;
		};

		/**
		 * When we're inside this method we know for sure that the start time is 00:00.
		 * It returns whether the end time is also 00:00.
		 *
		 * @param {Object} oAppStartDate - Start date of the appointment
		 * @param {Object} oAppEndDate - End date of the appointment
		 * @returns {boolean}
		 */
		SinglePlanningCalendarGrid.prototype._isEndTime0000 = function(oAppStartDate, oAppEndDate) {
			return (oAppEndDate.getTime() - oAppStartDate.getTime()) % MILLISECONDS_IN_A_DAY === 0;
		};

		SinglePlanningCalendarGrid.prototype._createBlockersDndPlaceholders = function (oStartDate, iColumns) {
			this.destroyAggregation("_blockersPlaceholders");

			for (var i = 0; i < iColumns; i++) {
				var oColumnCalDate = new UniversalDate(oStartDate.getFullYear(), oStartDate.getMonth(), oStartDate.getDate() + i);

				var oPlaceholder = new IntervalPlaceholder({
					date: oColumnCalDate
				});

				this.addAggregation("_blockersPlaceholders", oPlaceholder, true);
			}
		};

		SinglePlanningCalendarGrid.prototype._createAppointmentsDndPlaceholders = function (oStartDate, iColumns) {
			var iStartHour = this._getVisibleStartHour(),
				iEndHour = this._getVisibleEndHour();

			this._dndPlaceholdersMap = {};
			this.destroyAggregation("_intervalPlaceholders");

			for (var i = 0; i < iColumns; i++) {
				var oColumnCalDate = new CalendarDate(oStartDate.getFullYear(), oStartDate.getMonth(), oStartDate.getDate() + i);

				if (!this._dndPlaceholdersMap[oColumnCalDate]) {
					this._dndPlaceholdersMap[oColumnCalDate] = [];
				}

				for (var j = iStartHour; j <= iEndHour; j++) {
					var aDndForTheDay = this._dndPlaceholdersMap[oColumnCalDate],
						iYear = oColumnCalDate.getYear(),
						iMonth = oColumnCalDate.getMonth(),
						iDate = oColumnCalDate.getDate();
					aDndForTheDay.push(this._createAppointmentsDndPlaceHolder(new UniversalDate(iYear, iMonth, iDate, j)));
					aDndForTheDay.push(this._createAppointmentsDndPlaceHolder(new UniversalDate(iYear, iMonth, iDate, j, 30)));
				}
			}
		};

		SinglePlanningCalendarGrid.prototype._createAppointmentsDndPlaceHolder = function(oDate) {
			var oPlaceholder = new IntervalPlaceholder({
				date: oDate
			});

			this.addAggregation("_intervalPlaceholders", oPlaceholder, true);

			return oPlaceholder;
		};

		function getResizeGhost() {
			var $ghost = jQuery("<span></span>").addClass("sapUiCalAppResizeGhost");
			$ghost.appendTo(document.body);

			setTimeout(function() { $ghost.remove(); }, 0);

			return $ghost.get(0);
		}

		var IntervalPlaceholder = Control.extend("sap.m.SinglePlanningCalendarGrid._internal.IntervalPlaceholder", {
			metadata: {
				properties: {
					date : {type : "object", group : "Data"}
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

		function _initItemNavigation(){
			// Collect the dom references of the items
			var oRootRef = this.getDomRef(),
				aCellsInRow = this.$().find(".sapMSinglePCBlockersColumn").toArray();
				this._aGridCells = Array.prototype.concat(aCellsInRow);

			for (var hour = 0; hour <= this._getVisibleEndHour(); ++hour) {
				aCellsInRow = this.$().find("div[data-sap-hour='" + hour + "']").toArray();
				this._aGridCells = this._aGridCells.concat(aCellsInRow);
			}

			// Initialize the delegate and apply it to the control (only once)
			if (!this._oItemNavigation) {
				this._oItemNavigation = new ItemNavigation();
				this.addDelegate(this._oItemNavigation);
			}
			// After each rendering the delegate needs to be initialized as well

			// Set the root dom node that surrounds the items
			this._oItemNavigation.setRootDomRef(oRootRef);

			// Set the array of dom nodes representing the items
			this._oItemNavigation.setItemDomRefs(this._aGridCells);

			// Turn of the cycling
			this._oItemNavigation.setCycling(false);

			//this way we do not hijack the browser back/forward navigation
			this._oItemNavigation.setDisabledModifiers({
				sapnext: ["alt", "meta"],
				sapprevious: ["alt", "meta"],
				saphome : ["alt", "meta"],
				sapend : ["meta"]
			});

			// explicitly setting table mode
			this._oItemNavigation.setTableMode(true, true).setColumns(this._getColumns());

			// Set the page size
			this._oItemNavigation.setPageSize(this._aGridCells.length);
		}

		return SinglePlanningCalendarGrid;
	});
