/*!
 * ${copyright}
 */

// Provides control sap.m.SinglePlanningCalendarGrid.
sap.ui.define([
		'./SinglePlanningCalendarUtilities',
		'sap/ui/core/Control',
		'sap/ui/core/LocaleData',
		'sap/ui/core/Locale',
		'sap/ui/core/format/DateFormat',
		'sap/ui/core/date/UniversalDate',
		'sap/ui/unified/library',
		'sap/ui/unified/calendar/DatesRow',
		'sap/ui/unified/calendar/CalendarDate',
		'sap/ui/unified/calendar/CalendarUtils',
		'./SinglePlanningCalendarGridRenderer'
	],
	function (SinglePlanningCalendarUtilities, Control, LocaleData, Locale, DateFormat, UniversalDate, unifiedLibrary, DatesRow, CalendarDate, CalendarUtils, SinglePlanningCalendarGridRenderer) {
		"use strict";

		var ROW_HEIGHT = 48,
			BLOCKER_ROW_HEIGHT = 25,
			HALF_HOUR_MS = 3600000 / 2,
			ONE_MIN_MS = 60 * 1000;

		/**
		 * Constructor for a new SinglePlanningCalendarGrid.
		 *
		 * @param {string} [sId] id for the new control, generated automatically if no id is given
		 * @param {object} [mSettings] initial settings for the new control
		 *
		 * @class
		 * Disclaimer: This control is in a beta state - incompatible API changes may be done before its official public release. Use at your own discretion.
		 *
		 * <h3>Overview</h3>
		 *
		 * Displays a grid in which appointments and blockers are rendered.
		 *
		 * <b>Note:</b> The <code>PlanningCalendarGrid</code> uses parts of the <code>sap.ui.unified</code> library.
		 * This library will be loaded after the <code>PlanningCalendarGrid</code>, if it wasn't previously loaded.
		 * This could lead to a waiting time when a <code>PlanningCalendarGrid</code> is used for the first time.
		 * To prevent this, apps using the <code>PlanningCalendarGrid</code> must also load the
		 * <code>sap.ui.unified</code> library.
		 *
		 * <h3>Usage</h3>
		 *
		 * The <code>PlanningCalendarGrid</code> has the following structure:
		 *
		 * <ul>
		 *     <li>Each column in the grid represents a single entity of the view type. For example in the week view one
		 *     column represents a week day.</li>
		 *     <li>Each row represents an hour from each day.</li>
		 *     <li>There are also appointments and blockers displayed across the grid. To display blockers, see
		 *     {@link #property:fullDay} of the <code>sap.ui.unified.CalendarAppointment</code>.</li>
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
					startDate: {type: "object", group: "Data"}

				},
				aggregations: {

					/**
					 * The appointments to be displayed in the grid. Appointments outside the visible time frame are not rendered.
					 * Appointments, longer than a day, will be displayed in all of the affected days.
					 * To display blockers, see {@link #property:fullDay} of the <code>sap.m.CalendarAppointment</code>.
					 */
					appointments: {type: "sap.m.CalendarAppointment", multiple: true, singularName: "appointment"},

					/**
					 * Hidden, for internal use only.
					 * The date row which shows the header of the columns in the <code>SinglePlanningCalendarGrid</code>.
					 *
					 * @private
					 */
					_columnHeaders: {type: "sap.ui.unified.calendar.DatesRow", multiple: false, visibility: "hidden"}

				},
				associations: {

					/**
					 * Association to controls / IDs which label this control (see WAI-ARIA attribute aria-labelledby).
					 *
					 * <b>Note</b> These labels are also assigned to the appointments.
					 */
					ariaLabelledBy: {type: "sap.ui.core.Control", multiple: true, singularName: "ariaLabelledBy"}

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


			setTimeout(this._updateRowHeaderAndNowMarker.bind(this), iDelay);
		};

		SinglePlanningCalendarGrid.prototype.onBeforeRendering = function () {
			var oAppointmentsMap = this._createAppointmentsMap(this.getAppointments()),
				oCalStartDate = CalendarDate.fromLocalJSDate(this.getStartDate()),
				iColumns = this._getColumns();

			this._oVisibleAppointments = this._calculateVisibleAppointments(oAppointmentsMap.appointments, this.getStartDate(), iColumns);
			this._oAppointmentsToRender = this._calculateAppointmentsLevelsAndWidth(this._oVisibleAppointments);
			this._aVisibleBlockers = this._calculateVisibleBlockers(oAppointmentsMap.blockers, oCalStartDate, iColumns);
			this._oBlockersToRender = this._calculateBlockersLevelsAndWidth(this._aVisibleBlockers);
		};

		SinglePlanningCalendarGrid.prototype.setStartDate = function (oStartDate) {
			this.getAggregation("_columnHeaders").setStartDate(oStartDate);

			return this.setProperty("startDate", oStartDate);
		};


		/*
		 * PRIVATE API
		 */

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
		 * Formats a given date to a string. Example: 2 Jun 2018 -> "20180502"
		 *
		 * @param {CalendarDate} oCalDate the date to be formatted
		 * @returns {string} the formatted string
		 * @private
		 */
		SinglePlanningCalendarGrid.prototype._formatDayAsString = function (oCalDate) {
			var sResult = "" + oCalDate.getYear(),
				sMonth =  oCalDate.getMonth(),
				sDate =  oCalDate.getDate();

			if (sMonth < 10) {
				sResult += "0";
			}
			sResult += sMonth;

			if (sDate < 10) {
				sResult += "0";
			}
			sResult += sDate;

			return sResult;
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
		 * Calculates the top position of the now marker, of a blocker or of an appointment.
		 *
		 * @param {object} oDate the date of the element to be displayed
		 * @returns {int} the top position of the html element
		 * @private
		 */
		SinglePlanningCalendarGrid.prototype._calculateTopPosition = function (oDate) {
			var iHour = oDate.getHours() - this._getVisibleStartHour(),
				iMinutes = oDate.getMinutes(),
				iRowHeight = this._getRowHeight();

			return (iRowHeight * iHour) + (iRowHeight / 60) * iMinutes;
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

			return (iRowHeight * iHour) - (iRowHeight / 60) * iMinutes;
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
		 * Distributes the appointments and the blockers in clusters by their date grid.
		 *
		 * @param {Array} aAppointments the appointments in the corresponding aggregation
		 * @returns {object} the clustered appointments and the blockers
		 * @private
		 */
		SinglePlanningCalendarGrid.prototype._createAppointmentsMap = function (aAppointments) {
			var that = this;

			return aAppointments.reduce(function (oMap, oAppointment) {
				var oAppStartDate = oAppointment.getStartDate(),
					oAppEndDate = oAppointment.getEndDate(),
					bIsFullDay = oAppointment.getFullDay(),
					oCurrentAppCalStartDate,
					oCurrentAppCalEndDate,
					sDay;

				if (!oAppStartDate || !oAppEndDate) {
					return oMap;
				}

				if (!bIsFullDay) {
					oCurrentAppCalStartDate = CalendarDate.fromLocalJSDate(oAppStartDate);
					oCurrentAppCalEndDate = CalendarDate.fromLocalJSDate(oAppEndDate);

					while (oCurrentAppCalStartDate.isSameOrBefore(oCurrentAppCalEndDate)) {
						sDay = that._formatDayAsString(oCurrentAppCalStartDate);

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
				sDate = this._formatDayAsString(oCalDate);
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
		 * @returns {boolaen} true if the appointment is in the visible hours
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
		 * Selects the clusters of blockers which are in the visual port of the grid.
		 *
		 * @param {object} aBlockers the blockers in the corresponding aggregation
		 * @param {CalendarDate} oCalStartDate the start date of the grid
		 * @param {int} iColumns the number of columns to be displayed in the grid
		 * @returns {object} the clusters of blockers in the visual port of the grid
		 * @private
		 */
		SinglePlanningCalendarGrid.prototype._calculateVisibleBlockers = function (aBlockers, oCalStartDate, iColumns) {
			var oCalEndDate = new CalendarDate(oCalStartDate.getYear(), oCalStartDate.getMonth(), oCalStartDate.getDate() + iColumns),
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
					bStartDateBetweenViewStartAndEnd = oAppStart.isSameOrAfter(oViewStart) && oAppStart.isBefore(oViewEnd),
					bEndDateBetweenViewStartAndEnd = CalendarUtils._isBetween(oAppEnd, oViewStart, oViewEnd, true);

				return bIsBiggerThanView || bStartDateBetweenViewStartAndEnd || bEndDateBetweenViewStartAndEnd;
			};
		};

		/**
		 * Calculates the position of each blocker regarding the rest of them.
		 *
		 * @param {object} aVisibleBlockers the visible blockers in the grid
		 * @returns {object} the visible blockers in the grid
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

					if (oCurrentBlockerStart.isSameOrAfter(oBlockerStart) && oCurrentBlockerStart.isBefore(oBlockerEnd)) {
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
		 * Returns the visible blockers in the view port of the grid.
		 *
		 * @returns {object} the visual blockers
		 * @private
		 */
		SinglePlanningCalendarGrid.prototype._getVisibleBlockers = function () {
			return this._aVisibleBlockers;
		};

		/**
		 * Returns the visible blockers in the view port of the grid with their level and width.
		 *
		 * @returns {object} the visual blockers
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
			this._iColumns = iColumns;
			this.getAggregation("_columnHeaders").setDays(iColumns);
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
			return ROW_HEIGHT;
		};

		/**
		 * Returns the height of a blocker in the grid.
		 *
		 * @returns {int} the height of a blocker
		 * @private
		 */
		SinglePlanningCalendarGrid.prototype._getBlockerRowHeight = function () {
			return BLOCKER_ROW_HEIGHT;
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

		return SinglePlanningCalendarGrid;
	});
