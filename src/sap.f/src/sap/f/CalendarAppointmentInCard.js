/*!
 * ${copyright}
 */
//Provides control sap.f.CalendarInCard.
sap.ui.define([
	'sap/ui/unified/CalendarAppointment'
], function(
	CalendarAppointment
) {
	"use strict";

	/**
	 * Constructor for a new CalendarAppointmentInCard.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {Object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * This calendar appointment is used in card content of type Calendar.
	 *
	 * @extends sap.ui.unified.CalendarAppointment
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @since 1.88.0
	 * @alias sap.f.CalendarAppointmentInCard
	 */
	var CalendarAppointmentInCard = CalendarAppointment.extend("sap.f.CalendarAppointmentInCard", /** @lends sap.f.CalendarAppointmentInCard.prototype */ {
		metadata : {
			library : "sap.f",
			properties : {
				/**
				 * Indicates if the appointment is interactive.
				 */
				clickable : {type : "boolean", group : "Data", defaultValue : false}
			},
			events: {
				/**
				 * Fired when the appointment is selected.
				 */
				press: {}
			}
		}
	});

	CalendarAppointmentInCard.prototype.ontap = function() {
		this._firePress();
	};

	CalendarAppointmentInCard.prototype.onsapenter = function() {
		this._firePress();
	};

	CalendarAppointmentInCard.prototype._firePress = function() {
		if (this.getClickable()) {
			this.$().addClass("sapUiCalendarAppSel");
			setTimeout(function() {
				// remove active state
				this.$().removeClass("sapUiCalendarAppSel");
			}.bind(this), 180);
			this.firePress({});
		}
	};

	return CalendarAppointmentInCard;

});