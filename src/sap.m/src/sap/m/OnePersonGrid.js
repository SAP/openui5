/*!
 * ${copyright}
 */

// Provides control sap.m.OnePersonGrid.
sap.ui.define([
		'jquery.sap.global',
		'sap/ui/core/Control',
		'sap/ui/core/date/UniversalDate',
		'sap/ui/unified/library',
		'sap/ui/unified/calendar/DatesRow',
		'./OnePersonGridRenderer'
	],
	function (jQuery, Control, UniversalDate, unifiedLibrary, DatesRow, OnePersonGridRenderer) {
		"use strict";

		// shortcut for sap.ui.unified.CalendarAppointmentVisualization
		var CalendarAppointmentVisualization = unifiedLibrary.CalendarAppointmentVisualization;

		var ROW_HEIGHT = 48,
			ONE_HOUR = 3600000;

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

			jQuery.sap.delayedCall(iDelay, this, this._updateRowHeaderAndNowMarker);
		};

		OnePersonGrid.prototype.onBeforeRendering = function () {
			var oAppointmentsMap = this._createAppointmentsMap(this.getAppointments()),
				oStartDate = this._getUniversalStartDate(),
				iColumns = this._getColumns();

			this._oVisibleAppointments = this._calculateVisibleAppointments(oAppointmentsMap, oStartDate, iColumns);
			this._oAppointmentsToRender = this._calculateAppointmentsLevels(this._getVisibleAppointments());

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
			return this.getShowFullDay() ? 24 : this._getEndHour();
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
			var iCurrentHour = oDate.getHours(),
				iCurrentMinutes = oDate.getMinutes();

			if (iCurrentMinutes < 10) {
				iCurrentMinutes = "0" + iCurrentMinutes;
			}

			return iCurrentHour + ":" + iCurrentMinutes;
		};

		OnePersonGrid.prototype._calculateTopPosition = function (oDate) {
			var iHour = oDate.getHours() - this._getVisibleStartHour(),
				iMinutes = oDate.getMinutes(),
				iRowHeight = this._getRowHeight();

			return (iRowHeight * iHour) + (iRowHeight / 60) * iMinutes;
		};

		OnePersonGrid.prototype._updateRowHeaderAndNowMarker = function () {
			var oCurrentDate = this._getUniversalCurrentDate();

			this._updateNowMarker(oCurrentDate);
			this._updateRowHeaders(oCurrentDate);

			jQuery.sap.delayedCall(60 * 1000, this, this._updateRowHeaderAndNowMarker);
		};

		OnePersonGrid.prototype._updateNowMarker = function (oDate) {
			var $nowMarker = this.$("nowMarker"),
				bCurrentHourNotVisible = this._isOutsideVisibleHours(oDate.getHours());

			$nowMarker.toggleClass("sapMOnePersonNowMarkerHidden", bCurrentHourNotVisible);
			$nowMarker.css("top", this._calculateTopPosition(oDate) + "px");
			$nowMarker.text(this._formatTimeAsString(oDate));
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
				var oStartDate = oAppointment.getStartDate(),
					oEndDate = oAppointment.getEndDate();

				if (oStartDate && that._areDatesInSameDay(oStartDate, oEndDate)) {
					var sDay = that._formatDayAsString(oStartDate);

					if (!oMap[sDay]) {
						oMap[sDay] = [];
					}

					oMap[sDay].push(oAppointment);
				}

				return oMap;
			}, {});
		};

		OnePersonGrid.prototype._calculateVisibleAppointments = function (oAppointments, oStartDate, iColumns) {
			var oVisibleAppointments = {};

			for (var i = 0; i < iColumns; i++) {
				var oDate = new UniversalDate(oStartDate.getFullYear(), oStartDate.getMonth(), oStartDate.getDate() + i),
					sDate = this._formatDayAsString(oDate);

				if (oAppointments[sDate]) {
					oVisibleAppointments[sDate] = oAppointments[sDate]
						.filter(this._isAppointmentFitInVisibleHours, this)
						.sort(this._sortAppointmentsByStartHour);
				}
			}

			return oVisibleAppointments;
		};

		OnePersonGrid.prototype._isAppointmentFitInVisibleHours = function (oAppointment) {
			var oAppStartDate = oAppointment.getStartDate(),
				oAppEndDate = oAppointment.getEndDate(),
				iAppStartHour = oAppStartDate.getHours(),
				iAppEndHour = oAppEndDate.getHours(),
				iAppEndMinutes = oAppEndDate.getMinutes(),
				iCalendarStartHour = this._getVisibleStartHour(),
				iCalendarEndHour = this._getVisibleEndHour();

			var bAppStartIsBetweenCalendarStartAndEnd = iAppStartHour >= iCalendarStartHour && iAppStartHour < iCalendarEndHour,
				bAppEndIsBetweenCalendarStartAndEnd = iAppEndHour > iCalendarStartHour && iAppEndHour <= iCalendarEndHour,
				bAppEndIsSameAsCalendarStart = iAppEndHour === iCalendarStartHour && iAppEndMinutes > 0,
				bAppEndIsSameAsCalendarEnd = iAppEndHour - 1 === iCalendarEndHour && iAppEndMinutes === 0,
				bAppIsBiggerThanVisibleHours = iAppStartHour < iCalendarStartHour && iAppEndHour > iCalendarEndHour;

			return bAppStartIsBetweenCalendarStartAndEnd || bAppEndIsBetweenCalendarStartAndEnd || bAppEndIsSameAsCalendarStart || bAppEndIsSameAsCalendarEnd || bAppIsBiggerThanVisibleHours;
		};

		OnePersonGrid.prototype._calculateAppointmentsLevels = function (oVisibleAppointments) {
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

						if (iAppointmentDuration < ONE_HOUR) {
							// Take into account that appointments smaller than one hour will be rendered as one hour
							// in height. That's why the calculation for levels should consider this too.
							iAppointmentEnd = iAppointmentEnd + (ONE_HOUR - iAppointmentDuration);
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

				if (iCurrentAppointmentDuration < ONE_HOUR) {
					// Take into account that appointments smaller than one hour will be rendered as one hour
					// in height. That's why the calculation for levels should consider this too.
					iCurrentAppointmentEnd = iCurrentAppointmentEnd + (ONE_HOUR - iCurrentAppointmentDuration);
				}

				new AppointmentsIterator(oAppointmentsList).forEach(function (oAppointmentNode) {
					var oAppointment = oAppointmentNode.getData(),
						iAppointmentLevel = oAppointmentNode.level,
						iAppointmentStart = oAppointment.getStartDate().getTime(),
						iAppointmentEnd = oAppointment.getEndDate().getTime(),
						iAppointmentDuration = iAppointmentEnd - iAppointmentStart;

					if (iAppointmentDuration < ONE_HOUR) {
						// Take into account that appointments smaller than one hour will be rendered as one hour
						// in height. That's why the calculation for levels should consider this too.
						iAppointmentEnd = iAppointmentEnd + (ONE_HOUR - iAppointmentDuration);
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

		OnePersonGrid.prototype._sortAppointmentsByStartHour = function (oApp1, oApp2) {
			return oApp1.getStartDate().getTime() - oApp2.getStartDate().getTime() || oApp2.getEndDate().getTime() - oApp1.getEndDate().getTime();
		};

		OnePersonGrid.prototype._getVisibleAppointments = function () {
			return this._oVisibleAppointments;
		};

		OnePersonGrid.prototype._getAppointmentsToRender = function () {
			return this._oAppointmentsToRender;
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
