/*!
 * ${copyright}
 */

//Provides control sap.ui.unified.PlanningCalendarInCardRow.
sap.ui.define(['sap/m/PlanningCalendarRow', 'sap/m/Button', 'sap/ui/core/date/UniversalDate'], function (PlanningCalendarRow, Button, UniversalDate) {
	"use strict";


	/**
	 * Constructor for a new <code>PlanningCalendarInCardRow</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * Represents a row in the {@link sap.f.PlanningCalendarInCard}.
	 *
	 * This element holds the data of one row in the {@link sap.f.PlanningCalendarInCard}. Once the header information
	 * (for example, person information) is assigned, the appointments are assigned.
	 * The <code>sap.f.PlanningCalendarInCardRow</code> allows you to modify appointments at row level.
	 *
	 * @extends sap.ui.core.Element
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @since 1.74
	 * @experimental Since 1.74.
	 * @alias sap.f.PlanningCalendarInCardRow
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var PlanningCalendarInCardRow = PlanningCalendarRow.extend("sap.f.PlanningCalendarInCardRow", /** @lends sap.f.PlanningCalendarInCardRow.prototype */ { metadata : {

		library : "sap.m",
		properties : {

			/**
			 * Defines the number of visible appointments.
			 */
			visibleAppointmentsCount : {type : "int", group : "Data", defaultValue: 2}

		}

	}});

	PlanningCalendarInCardRow.prototype.exit = function () {
		PlanningCalendarRow.prototype.exit.call(this, arguments);
		if (this._oMoreAppsButton) {
			this._oMoreAppsButton.destroy();
			this._oMoreAppsButton = null;
		}
	};

	/**
	 * Determines which appointments should be displayed.
	 * @param {array} aSelectedDates the current time frame
	 * @param {array} aSortedAppInfos information about the sorted appointments in the current time frame
	 * @returns {object} an object with two values - the indexes of the first and the last appointments to be shown
	 */
	PlanningCalendarInCardRow.prototype._calculateVisibleAppointments = function (aSelectedDates, aSortedAppInfos) {
		var oNow = new UniversalDate(),
			oToday = new UniversalDate(oNow.getFullYear(), oNow.getMonth(), oNow.getDate()),
			oCurrentDay = UniversalDate.getInstance(new Date(aSelectedDates[0].getStartDate().getFullYear(), aSelectedDates[0].getStartDate().getMonth(), aSelectedDates[0].getStartDate().getDate())),
			bToday = oToday.getTime() === oCurrentDay.getTime(),
			iSortedAppInfosLength = aSortedAppInfos.length,
			iVisibleAppointmentsCountSet = this.getVisibleAppointmentsCount(),
			iNearestAppointmentIndex,
			iStart,
			iEnd;
		if (bToday) {
			for (var i = 0; i < iSortedAppInfosLength; i++) {
				if (aSortedAppInfos[i].appointment.getEndDate().getTime() > oNow.getTime()) {
					iNearestAppointmentIndex = i;
					break;
				}
			}
			if (iNearestAppointmentIndex === undefined) {
				iStart = 0;
				iEnd = 0;
				this._getMoreButton().setVisible(false);
			} else if ((iNearestAppointmentIndex + iVisibleAppointmentsCountSet) > iSortedAppInfosLength) {
				if (iNearestAppointmentIndex <= iVisibleAppointmentsCountSet && (iSortedAppInfosLength - iVisibleAppointmentsCountSet <= 0)) {
					iStart = 0;
				} else {
					iStart = iSortedAppInfosLength - iVisibleAppointmentsCountSet;
				}
				iEnd = iSortedAppInfosLength;
				this._getMoreButton().setVisible(false);
			} else if ((iSortedAppInfosLength - iNearestAppointmentIndex) <= iVisibleAppointmentsCountSet) {
				iStart = iSortedAppInfosLength - iVisibleAppointmentsCountSet;
				iEnd = iSortedAppInfosLength;
				this._getMoreButton().setVisible(false);
			} else {
				iStart = iNearestAppointmentIndex;
				iEnd = iNearestAppointmentIndex + iVisibleAppointmentsCountSet;
				this._getMoreButton().setVisible(true);
			}
		} else { // every other day
			iStart = 0;
			if (iSortedAppInfosLength <= iVisibleAppointmentsCountSet) {
				iEnd = iSortedAppInfosLength; // iVisibleAppointmentsCountSet = 4 --> 4 of 4/3 of 3, no more button
				this._getMoreButton().setVisible(false);
			} else {
				iEnd = iVisibleAppointmentsCountSet; // iVisibleAppointmentsCountSet = 4 --> 4 of 5, 1 More
				this._getMoreButton().setVisible(true);
			}
		}
		return {iStart: iStart, iEnd: iEnd};
	};

	/**
	 * Makes or returns the object, showing that some appointments are hidden.
	 * @returns {sap.m.Button} the object
	 */
	PlanningCalendarInCardRow.prototype._getMoreButton = function () {
		if (!this._oMoreAppsButton) {
			this._oMoreAppsButton = new Button({ text: "More" });
		}
		return this._oMoreAppsButton;
	};

	return PlanningCalendarInCardRow;

});
