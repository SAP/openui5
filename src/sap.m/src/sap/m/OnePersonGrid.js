/*!
 * ${copyright}
 */

// Provides control sap.m.OnePersonGrid.
sap.ui.define([
		'sap/ui/core/Control',
		'sap/ui/core/LocaleData',
		'sap/ui/core/Locale',
		'sap/ui/core/format/DateFormat',
		'sap/ui/core/date/UniversalDate',
		'sap/ui/unified/library',
		'sap/ui/unified/calendar/DatesRow',
		'./OnePersonGridRenderer'
	],
	function (Control, LocaleData, Locale, DateFormat, UniversalDate, unifiedLibrary, DatesRow, OnePersonGridRenderer) {
		"use strict";

		// shortcut for sap.ui.unified.CalendarAppointmentVisualization
		var CalendarAppointmentVisualization = unifiedLibrary.CalendarAppointmentVisualization;

		var ROW_HEIGHT = 48,
			BLOCKER_ROW_HEIGHT = 25, // 1
			HALF_HOUR = 3600000 / 2,
			ONE_DAY = 86400000;

		/**
		 * Constructor for a new OnePersonGrid.
		 *
		 * @param {string} [sId] id for the new control, generated automatically if no id is given
		 * @param {object} [mSettings] initial settings for the new control
		 *
		 * @class
		 * A Grid control for rendering OnePersonCalendar Appointments
		 * Disclaimer: this control is in beta state - incompatible API changes may be done before its official public release. Use at your own discretion.
		 *
		 * @extends sap.ui.core.Control
		 *
		 * @author SAP SE
		 * @version ${version}
		 *
		 * @constructor
		 * @private
		 * @alias sap.m.OnePersonGrid
		 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
		 */
		var OnePersonGrid = Control.extend("sap.m.OnePersonGrid", /** @lends sap.m.OnePersonGrid.prototype */ {
			metadata: {
				library: "sap.m",
				properties: {
					startDate: {type: "object", group: "Data"},
					startHour: {type: "int", group: "Appearance", defaultValue: 8},
					endHour: {type: "int", group: "Appearance", defaultValue: 17},
					showFullDay: {type: "boolean", group: "Appearance", defaultValue: true},
					appointmentsVisualization : {type : "sap.ui.unified.CalendarAppointmentVisualization", group : "Appearance", defaultValue : CalendarAppointmentVisualization.Standard}

				},
				aggregations: {
					appointments: {type: "sap.ui.unified.CalendarAppointment", multiple: true, singularName: "appointment"},
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

		OnePersonGrid.prototype.init = function () {
			var oStartDate = this._getUniversalCurrentDate().getJSDate(),
					oDatesRow = new DatesRow(this.getId() + "-columnHeaders", {
					showDayNamesLine: false,
					showWeekNumbers: false,
					startDate: oStartDate
				}).addStyleClass("sapMOnePersonColumnHeader"),
				iDelay = (60 - oStartDate.getSeconds()) * 1000;

			this.setAggregation("_columnHeaders", oDatesRow);
			this.setStartDate(oStartDate);
			this._setColumns(7);


			setTimeout(this._updateRowHeaderAndNowMarker.bind(this), iDelay);
		};

		OnePersonGrid.prototype.onBeforeRendering = function () {
			var oAppointmentsMap = this._createAppointmentsMap(this.getAppointments()),
				oStartDate = this._getUniversalStartDate(),
				iColumns = this._getColumns();

			this._oVisibleAppointments = this._calculateVisibleAppointments(oAppointmentsMap.appointments, oStartDate, iColumns);
			this._oAppointmentsToRender = this._calculateAppointmentsLevelsAndWidth(this._oVisibleAppointments);
			this._aVisibleBlockers = this._calculateVisibleBlockers(oAppointmentsMap.blockers, oStartDate, iColumns);
			this._oBlockersToRender = this._calculateBlockersLevelsAndWidth(this._aVisibleBlockers);
		};

		OnePersonGrid.prototype.setStartDate = function (oStartDate) {
			this._oUniversalStartDate = UniversalDate.getInstance(oStartDate);

			this.getAggregation("_columnHeaders").setStartDate(oStartDate);

			return this.setProperty("startDate", oStartDate);
		};


		/*
		 * PRIVATE API
		 */
		OnePersonGrid.prototype._getUniversalStartDate = function () {
			return this._oUniversalStartDate;
		};

		OnePersonGrid.prototype._getUniversalCurrentDate = function () {
			return UniversalDate.getInstance(new Date());
		};

		OnePersonGrid.prototype._areDatesInSameDay = function (oDate1, oDate2) {
			var bYearEqual = oDate1.getFullYear() === oDate2.getFullYear(),
				bMonthEqual = oDate1.getMonth() === oDate2.getMonth(),
				bDateEqual = oDate1.getDate() === oDate2.getDate();

			return bYearEqual && bMonthEqual && bDateEqual;
		};

		OnePersonGrid.prototype._getStartHour = function () {
			var iMinHour = Math.min(this.getStartHour(), this.getEndHour());

			return iMinHour < 0 ? 0 : iMinHour;
		};

		OnePersonGrid.prototype._getEndHour = function () {
			var iMaxHour = Math.max(this.getStartHour(), this.getEndHour());

			return iMaxHour > 24 ? 24 : iMaxHour;
		};

		OnePersonGrid.prototype._getVisibleStartHour = function () {
			return this.getShowFullDay() ? 0 : this._getStartHour();
		};

		OnePersonGrid.prototype._getVisibleEndHour = function () {
			return (this.getShowFullDay() ? 24 : this._getEndHour()) - 1;
		};

		OnePersonGrid.prototype._isWorkingHour = function (iHour) {
			return this._getStartHour() <= iHour && iHour <= this._getEndHour();
		};

		OnePersonGrid.prototype._isOutsideVisibleHours = function (iHour) {
			var iHour,
				iVisibleStartHour = this._getVisibleStartHour(),
				iVisibleEndHour = this._getVisibleEndHour();

			return iHour < iVisibleStartHour || iHour > iVisibleEndHour;
		};

		OnePersonGrid.prototype._isCurrentMinutesLessThan = function (iMaxMinutes) {
			var iCurrentMinutes = this._getUniversalCurrentDate().getMinutes();

			return iMaxMinutes >= iCurrentMinutes;
		};

		OnePersonGrid.prototype._isCurrentMinutesMoreThan = function (iMinMinutes) {
			var iCurrentMinutes = this._getUniversalCurrentDate().getMinutes();

			return iMinMinutes <= iCurrentMinutes;
		};

		OnePersonGrid.prototype._isWeekend = function (oDate) {
			var iDay = oDate.getDay();

			return iDay % 6 === 0;
		};

		OnePersonGrid.prototype._shouldHideRowHeader = function (iRow) {
			var iCurrentHour = this._getUniversalCurrentDate().getHours(),
				bIsNearAfterCurrentHour = this._isCurrentMinutesLessThan(15) && iCurrentHour === iRow,
				bIsNearBeforeCurrentHour = this._isCurrentMinutesMoreThan(45) && iCurrentHour === iRow - 1;

			return bIsNearAfterCurrentHour || bIsNearBeforeCurrentHour;
		};

		OnePersonGrid.prototype._formatDayAsString = function (oDate) {
			return oDate.getFullYear() + "-" + oDate.getMonth() + "-" + oDate.getDate();
		};

		OnePersonGrid.prototype._formatTimeAsString = function (oDate) {
			var iCurrentMinutes = oDate.getMinutes(),
				oHoursFormat = this._getHoursFormat();

			if (iCurrentMinutes < 10) {
				iCurrentMinutes = "0" + iCurrentMinutes;
			}

			return oHoursFormat.format(oDate) + ":" + iCurrentMinutes; // TODO: use second param true when convert all dates to UTC
		};

		OnePersonGrid.prototype._addAMPM = function (oDate) { // 8
			var oAMPMFormat = this._getAMPMFormat();

			return " " + oAMPMFormat.format(oDate); // TODO: use second param true when convert all dates to UTC
		};

		OnePersonGrid.prototype._calculateTopPosition = function (oDate) {
			var iHour = oDate.getHours() - this._getVisibleStartHour(),
				iMinutes = oDate.getMinutes(),
				iRowHeight = this._getRowHeight();

			return (iRowHeight * iHour) + (iRowHeight / 60) * iMinutes;
		};

		OnePersonGrid.prototype._calculateBottomPosition = function (oDate) {
			var iHour = this._getVisibleEndHour() + 1 - oDate.getHours(),
				iMinutes = oDate.getMinutes(),
				iRowHeight = this._getRowHeight();

			return (iRowHeight * iHour) - (iRowHeight / 60) * iMinutes;
		};

		OnePersonGrid.prototype._updateRowHeaderAndNowMarker = function () {
			var oCurrentDate = this._getUniversalCurrentDate();

			this._updateNowMarker(oCurrentDate);
			this._updateRowHeaders(oCurrentDate);

			setTimeout(this._updateRowHeaderAndNowMarker.bind(this), 60 * 1000);
		};

		OnePersonGrid.prototype._updateNowMarker = function (oDate) {
			var $nowMarker = this.$("nowMarker"),
				$nowMarkerText = this.$("nowMarkerText"),
				$nowMarkerAMPM = this.$("nowMarkerAMPM"),
				bCurrentHourNotVisible = this._isOutsideVisibleHours(oDate.getHours());

			$nowMarker.toggleClass("sapMOnePersonNowMarkerHidden", bCurrentHourNotVisible);
			$nowMarker.css("top", this._calculateTopPosition(oDate) + "px");
			$nowMarkerText.text(this._formatTimeAsString(oDate));
			$nowMarkerAMPM.text(this._addAMPM(oDate)); // 8
			$nowMarkerText.append($nowMarkerAMPM);
		};

		OnePersonGrid.prototype._updateRowHeaders = function (oDate) {
			var $domRef = this.$(),
			iCurrentHour = oDate.getHours(),
			iNextHour = iCurrentHour + 1;

			$domRef.find(".sapMOnePersonRowHeader").removeClass("sapMOnePersonRowHeaderHidden");

			if (this._shouldHideRowHeader(iCurrentHour)) {
				$domRef.find(".sapMOnePersonRowHeader" + iCurrentHour).addClass("sapMOnePersonRowHeaderHidden");
			} else if (this._shouldHideRowHeader(iNextHour)) {
				$domRef.find(".sapMOnePersonRowHeader" + iNextHour).addClass("sapMOnePersonRowHeaderHidden");
			}
		};

		OnePersonGrid.prototype._createAppointmentsMap = function (aAppointments) {
			var that = this;

			return aAppointments.reduce(function (oMap, oAppointment) {
				var oAppStartDate = oAppointment.getStartDate(),
					oAppEndDate = oAppointment.getEndDate(),
					bIsFullDay = oAppointment.getFullDay && oAppointment.getFullDay();

				if (!oAppStartDate || !oAppEndDate) {
					return oMap;
				}

				if (!bIsFullDay) {
					var oCurrentAppStartDate = new UniversalDate(oAppStartDate.getFullYear(), oAppStartDate.getMonth(), oAppStartDate.getDate()),
						oCurrentAppEndDate = new UniversalDate(oAppEndDate.getFullYear(), oAppEndDate.getMonth(), oAppEndDate.getDate());

					while (oCurrentAppStartDate.getTime() <= oCurrentAppEndDate.getTime()) {
						var sDay = that._formatDayAsString(oCurrentAppStartDate);

						if (!oMap.appointments[sDay]) {
							oMap.appointments[sDay] = [];
						}

						oMap.appointments[sDay].push(oAppointment);

						oCurrentAppStartDate.setDate(oCurrentAppStartDate.getDate() + 1);
					}
				} else {
					oMap.blockers.push(oAppointment);
				}

				return oMap;
			}, { appointments: {}, blockers: []});
		};

		OnePersonGrid.prototype._calculateVisibleAppointments = function (oAppointments, oStartDate, iColumns) {
			var oVisibleAppointments = {};

			for (var i = 0; i < iColumns; i++) {
				var oDate = new UniversalDate(oStartDate.getFullYear(), oStartDate.getMonth(), oStartDate.getDate() + i),
					sDate = this._formatDayAsString(oDate),
					fnIsVisiblePredicate = this._isAppointmentFitInVisibleHours(oDate);

				if (oAppointments[sDate]) {
					oVisibleAppointments[sDate] = oAppointments[sDate]
						.filter(fnIsVisiblePredicate, this)
						.sort(this._sortAppointmentsByStartHour);
				}
			}

			return oVisibleAppointments;
		};

		OnePersonGrid.prototype._isAppointmentFitInVisibleHours = function (oColumnDate) {
			return function (oAppointment) {
				var iAppStartTime = oAppointment.getStartDate().getTime(),
					iAppEndTime = oAppointment.getEndDate().getTime(),
					iColumnStartTime = (new UniversalDate(oColumnDate.getFullYear(), oColumnDate.getMonth(), oColumnDate.getDate(), this._getVisibleStartHour())).getTime(),
					iColumnEndTime = (new UniversalDate(oColumnDate.getFullYear(), oColumnDate.getMonth(), oColumnDate.getDate(), this._getVisibleEndHour(), 59, 59)).getTime();

				var bBiggerThanVisibleHours = iAppStartTime < iColumnStartTime && iAppEndTime > iColumnEndTime,
					bStartHourBetweenColumnStartAndEnd = iAppStartTime >= iColumnStartTime && iAppStartTime < iColumnEndTime,
					bEndHourBetweenColumnStartAndEnd = iAppEndTime > iColumnStartTime && iAppEndTime <= iColumnEndTime;

				return bBiggerThanVisibleHours || bStartHourBetweenColumnStartAndEnd || bEndHourBetweenColumnStartAndEnd;
			};
		};

		OnePersonGrid.prototype._calculateAppointmentsLevelsAndWidth = function (oVisibleAppointments) {
			var that = this;

			return Object.keys(oVisibleAppointments).reduce(function (oAcc, sDate) {
				var iMaxLevel = 0,
					oAppointmentsList = new AppointmentsList(),
					aAppointments = oVisibleAppointments[sDate];

				aAppointments.forEach(function (oCurrentAppointment) {
					var oCurrentAppointmentNode = new AppointmentNode(oCurrentAppointment),
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

						if (iAppointmentDuration < HALF_HOUR) {
							// Take into account that appointments smaller than one hour will be rendered as one hour
							// in height. That's why the calculation for levels should consider this too.
							iAppointmentEnd = iAppointmentEnd + (HALF_HOUR - iAppointmentDuration);
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

		OnePersonGrid.prototype._calculateAppointmentsWidth = function (oAppointmentsList) {

			oAppointmentsList.getIterator().forEach(function (oCurrentAppointmentNode) {
				var oCurrentAppointment = oCurrentAppointmentNode.getData(),
					iLevelFoundSpace = oCurrentAppointmentNode.level,
					iCurrentAppointmentLevel = oCurrentAppointmentNode.level,
					iCurrentAppointmentStart = oCurrentAppointment.getStartDate().getTime(),
					iCurrentAppointmentEnd = oCurrentAppointment.getEndDate().getTime(),
					iCurrentAppointmentDuration = iCurrentAppointmentEnd - iCurrentAppointmentStart;

				if (iCurrentAppointmentDuration < HALF_HOUR) {
					// Take into account that appointments smaller than one hour will be rendered as one hour
					// in height. That's why the calculation for levels should consider this too.
					iCurrentAppointmentEnd = iCurrentAppointmentEnd + (HALF_HOUR - iCurrentAppointmentDuration);
				}

				new AppointmentsIterator(oAppointmentsList).forEach(function (oAppointmentNode) {
					var oAppointment = oAppointmentNode.getData(),
						iAppointmentLevel = oAppointmentNode.level,
						iAppointmentStart = oAppointment.getStartDate().getTime(),
						iAppointmentEnd = oAppointment.getEndDate().getTime(),
						iAppointmentDuration = iAppointmentEnd - iAppointmentStart;

					if (iAppointmentDuration < HALF_HOUR) {
						// Take into account that appointments smaller than one hour will be rendered as one hour
						// in height. That's why the calculation for levels should consider this too.
						iAppointmentEnd = iAppointmentEnd + (HALF_HOUR - iAppointmentDuration);
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

		OnePersonGrid.prototype._calculateVisibleBlockers = function (aBlockers, oStartDate, iColumns) {
			oStartDate = this._getDayPart(oStartDate);

			var oEndDate = new UniversalDate(oStartDate.getFullYear(), oStartDate.getMonth(), oStartDate.getDate() + iColumns),
				fnIsVisiblePredicate = this._isBlockerVisible(oStartDate, oEndDate);

			return aBlockers.filter(fnIsVisiblePredicate)
					.sort(this._sortAppointmentsByStartHour);
		};

		OnePersonGrid.prototype._isBlockerVisible = function (oStartDate, oEndDate) {
			var that = this;

			return function (oAppointment) {
				var oAppStartDate = oAppointment.getStartDate(),
					oAppEndDate = oAppointment.getEndDate(),
					iAppStartTime = that._getDayPart(oAppStartDate).getTime(),
					iAppEndTime = that._getDayPart(oAppEndDate).getTime(),
					iViewStartTime = oStartDate.getTime(),
					iViewEndTime = oEndDate.getTime();

				var bIsBiggerThanView = iAppStartTime < iViewStartTime && iAppEndTime > iViewEndTime,
					bStartDateBetweenViewStartAndEnd = iAppStartTime >= iViewStartTime && iAppStartTime < iViewEndTime,
					bEndDateBetweenViewStartAndEnd = iAppEndTime >= iViewStartTime && iAppEndTime <= iViewEndTime;

				return bIsBiggerThanView || bStartDateBetweenViewStartAndEnd || bEndDateBetweenViewStartAndEnd;
			};
		};

		OnePersonGrid.prototype._calculateBlockersLevelsAndWidth = function (aVisibleBlockers) {
			var iMaxLevel = 0,
				oBlockersList = new AppointmentsList(),
				that = this;

			aVisibleBlockers.forEach(function (oCurrentBlocker) {
				var oCurrentBlockerNode = new AppointmentNode(oCurrentBlocker),
					oCurrentBlockerStartDate = oCurrentBlocker.getStartDate(),
					oCurrentBlockerEndDate = oCurrentBlocker.getEndDate(),
					iCurrentBlockerStartTime = that._getDayPart(oCurrentBlockerStartDate).getTime(),
					iCurrentBlockerEndTime = that._getDayPart(oCurrentBlockerEndDate).getTime();

				oCurrentBlockerNode.width = that._calculateDaysDifference(iCurrentBlockerStartTime, iCurrentBlockerEndTime);

				if (oBlockersList.getSize() === 0) {
					oBlockersList.add(oCurrentBlockerNode);
					return;
				}

				oBlockersList.getIterator().forEach(function (oBlockerNode) {
					var bShouldBreak = true,
						oBlocker = oBlockerNode.getData(),
						oBlockerStartDate = oBlocker.getStartDate(),
						oBlockerEndDate = oBlocker.getEndDate(),
						iBlockerStartTime = that._getDayPart(oBlockerStartDate).getTime(),
						iBlockerEndTime = that._getDayPart(oBlockerEndDate).getTime();

					if (iCurrentBlockerStartTime >= iBlockerStartTime && iCurrentBlockerStartTime < iBlockerEndTime) {
						oCurrentBlockerNode.level++;
						iMaxLevel = Math.max(iMaxLevel, oCurrentBlockerNode.level);
					}

					if (oBlockerNode.next && oBlockerNode.next.level === oCurrentBlockerNode.level) {
						bShouldBreak = false;
					}

					if (iCurrentBlockerStartTime >= iBlockerEndTime && bShouldBreak) {
						this.interrupt();
					}
				});

				oBlockersList.insertAfterLevel(oCurrentBlockerNode.level, oCurrentBlockerNode);
			}, this);

			return { oBlockersList: oBlockersList, iMaxlevel: iMaxLevel };
		};

		OnePersonGrid.prototype._calculateDaysDifference = function (iStartTime, iEndTime) {
			var iTimeDifference = iEndTime - iStartTime;

			return Math.round(iTimeDifference / ONE_DAY);
		};

		OnePersonGrid.prototype._sortAppointmentsByStartHour = function (oApp1, oApp2) {
			return oApp1.getStartDate().getTime() - oApp2.getStartDate().getTime() || oApp2.getEndDate().getTime() - oApp1.getEndDate().getTime();
		};

		OnePersonGrid.prototype._getVisibleAppointments = function () {
			return this._oVisibleAppointments;
		};

		OnePersonGrid.prototype._getAppointmentsToRender = function () {
			return this._oAppointmentsToRender;
		};

		OnePersonGrid.prototype._getVisibleBlockers = function () {
			return this._aVisibleBlockers;
		};

		OnePersonGrid.prototype._getBlockersToRender = function () {
			return this._oBlockersToRender;
		};

		OnePersonGrid.prototype._setColumns = function (iColumns) {
			this._iColumns = iColumns;
			this.getAggregation("_columnHeaders").setDays(iColumns);
			this.invalidate();
		};

		OnePersonGrid.prototype._getColumns = function () {
			return this._iColumns; // TODO: should get it from the view
		};

		OnePersonGrid.prototype._getRowHeight = function () {
			return ROW_HEIGHT;
		};

		OnePersonGrid.prototype._getBlockerRowHeight = function () {
			return BLOCKER_ROW_HEIGHT;
		};

		OnePersonGrid.prototype._getDayPart = function (oDate) {
			return new UniversalDate(oDate.getFullYear(), oDate.getMonth(), oDate.getDate());
		};

		OnePersonGrid.prototype._getCoreLocale = function () {
			if (!this._sLocale) {
				this._sLocale = sap.ui.getCore().getConfiguration().getFormatSettings().getFormatLocale().toString();
			}

			return this._sLocale;
		};

		OnePersonGrid.prototype._getCoreLocaleData = function() {
			if (!this._oLocaleData) {
				var sLocale = this._getCoreLocale(),
					oLocale = new Locale(sLocale);

				this._oLocaleData = LocaleData.getInstance(oLocale);
			}

			return this._oLocaleData;
		};

		OnePersonGrid.prototype._hasAMPM = function () {
			var oLocaleData = this._getCoreLocaleData();

			return oLocaleData.getTimePattern("short").search("a") >= 0;
		};

		OnePersonGrid.prototype._getHoursFormat = function () {
			var sLocale = this._getCoreLocale();

			if (!this._oHoursFormat || this._oHoursFormat.oLocale.toString() !== sLocale) {
				var oLocale = new Locale(sLocale),
					bHasAMPM = this._hasAMPM(),
					sPattern = bHasAMPM ? "h" : "H";

				this._oHoursFormat = DateFormat.getTimeInstance({pattern: sPattern}, oLocale);
			}

			return this._oHoursFormat;
		};

		OnePersonGrid.prototype._getAMPMFormat = function () {
			var sLocale = this._getCoreLocale(),
				oLocale = new Locale(sLocale);

			if (!this._oAMPMFormat || this._oAMPMFormat.oLocale.toString() !== sLocale) {
				this._oAMPMFormat = DateFormat.getTimeInstance({pattern: "a"}, oLocale);
			}

			return this._oAMPMFormat;
		};

		// Appointments Node
		function AppointmentNode(oData) {
			this.data = oData;
			this.level = 0;
			this.width = 1;
			this.prev = null;
			this.next = null;
		}

		AppointmentNode.prototype.hasNext = function () {
			return this.next !== null;
		};

		AppointmentNode.prototype.hasPrev = function () {
			return this.prev !== null;
		};

		AppointmentNode.prototype.getData = function () {
			return this.data;
		};


		// Appointments List
		function AppointmentsList() {
			this.head = null;
			this.tail = null;
			this.size = 0;
			this.iterator = new AppointmentsIterator(this);
		}

		AppointmentsList.prototype.getHeadNode = function () {
			return this.head;
		};

		AppointmentsList.prototype.getTailNode = function () {
			return this.tail;
		};

		AppointmentsList.prototype.getSize = function () {
			return this.size;
		};

		AppointmentsList.prototype.isEmpty = function () {
			return this.getSize() === 0;
		};

		AppointmentsList.prototype.createNewNode = function (oData) {
			return new AppointmentNode(oData);
		};

		AppointmentsList.prototype.getIterator = function () {
			return this.iterator;
		};

		AppointmentsList.prototype.indexOf = function (oNode, fnComparator) {
			this.iterator.reset();
			var oCurrentNode,
				iIndex = 0;

			while (this.iterator.hasNext()) {
				oCurrentNode = this.iterator.next();

				if (fnComparator(oCurrentNode)) {
					return iIndex;
				}

				iIndex++;
			}

			return -1;
		};

		AppointmentsList.prototype.add = function (oData) {
			var oNewNode = oData;

			if (!(oData instanceof AppointmentNode)) {
				oNewNode = this.createNewNode(oData);
			}

			if (this.isEmpty()) {
				this.head = this.tail = oNewNode;
			} else {
				this.tail.next = oNewNode;
				oNewNode.prev = this.tail;
				this.tail = oNewNode;
			}

			this.size++;

			return true;
		};

		AppointmentsList.prototype.insertFirst = function (oData) {
			if (this.isEmpty()) {
				this.add(oData);
			} else {
				var oNewNode = oData;

				if (!(oData instanceof AppointmentNode)) {
					oNewNode = this.createNewNode(oData);
				}

				oNewNode.next = this.head;
				this.head.prev = oNewNode;
				this.head = oNewNode;

				this.size++;

				return true;
			}
		};

		AppointmentsList.prototype.insertAt = function (iIndex, oData) {
			var oCurrentNode = this.getHeadNode(),
				position = 0,
				oNewNode = oData;

			if (!(oData instanceof AppointmentNode)) {
				oNewNode = this.createNewNode(oData);
			}

			if (iIndex < 0) {
				return false;
			}

			if (iIndex === 0) {
				return this.insertFirst(oData);
			}

			if (iIndex > this.getSize() - 1) {
				return this.add(oData);
			}

			while (position < iIndex) {
				oCurrentNode = oCurrentNode.next;
				position++;
			}

			oCurrentNode.prev.next = oNewNode;
			oNewNode.prev = oCurrentNode.prev;
			oCurrentNode.prev = oNewNode;
			oNewNode.next = oCurrentNode;

			this.size++;

			return true;
		};

		AppointmentsList.prototype.insertAfterLevel = function (iLevel, oNode) {
			var iIndex = this.indexOf(oNode, function (oCurrentNode) {
					var bLastInLevel = oCurrentNode.level === iLevel;

					if (oCurrentNode.next && oCurrentNode.next.level === iLevel) {
						bLastInLevel = false;
					}

					return bLastInLevel;
				}),
				iSize = this.getSize();

			if (iIndex + 1 === iSize || iIndex === -1) {
				return this.add(oNode);
			} else {
				return this.insertAt(iIndex + 1, oNode);
			}
		};

		// AppointmentsList Iterator
		function AppointmentsIterator (oList) {
			this.list = oList;
			this.stopIterationFlag = false;

			this.currentNode = null;
		}

		AppointmentsIterator.prototype.next = function () {
			var oCurrentNode = this.currentNode;

			if (this.currentNode !== null) {
				this.currentNode = this.currentNode.next;
			}

			return oCurrentNode;
		};

		AppointmentsIterator.prototype.hasNext = function () {
			return this.currentNode !== null;
		};

		AppointmentsIterator.prototype.reset = function () {
			this.currentNode = this.list.getHeadNode();

			return this;
		};

		AppointmentsIterator.prototype.forEach = function (fnCallback, oThis) {
			var oCurrentNode;

			oThis = oThis || this;
			this.reset();

			while (this.hasNext() && !this.stopIterationFlag) {
				oCurrentNode = this.next();
				fnCallback.call(oThis, oCurrentNode);
			}

			this.stopIterationFlag = false;
		};

		AppointmentsIterator.prototype.interrupt = function () {
			this.stopIterationFlag = true;

			return this;
		};

		return OnePersonGrid;
	});
