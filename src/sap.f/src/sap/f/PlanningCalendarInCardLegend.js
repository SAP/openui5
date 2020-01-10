/*!
 * ${copyright}
 */

// Provides control sap.f.PlanningCalendarInCardLegend.
sap.ui.define(['sap/m/PlanningCalendarLegend', 'sap/ui/unified/CalendarAppointment', 'sap/m/Label', './PlanningCalendarInCardLegendRenderer'],
	function(PlanningCalendarLegend, CalendarAppointment, Label, PlanningCalendarInCardLegendRenderer) {
		"use strict";


		/**
		 * Constructor for a new <code>PlanningCalendarInCardLegend</code>.
		 *
		 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
		 * @param {object} [mSettings] Initial settings for the new control
		 *
		 * @class
		 * A legend for the {@link sap.f.PlanningCalendarInCard} that displays the special dates and appointments in
		 * colors with their corresponding description.
		 * @extends sap.f.PlanningCalendarLegend
		 *
		 * @author SAP SE
		 * @version ${version}
		 *
		 * @constructor
		 * @private
		 * @since 1.74
		 * @experimental Since 1.74.
		 * @alias sap.f.PlanningCalendarInCardLegend
		 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
		 */
		var PlanningCalendarInCardLegend = PlanningCalendarLegend.extend("sap.f.PlanningCalendarInCardLegend", /** @lends sap.f.PlanningCalendarInCardLegend.prototype */ { metadata : {

			library : "sap.m",
			properties: {
				/**
				 * Defines the number of visible calendar and appointment items.
				 */
				visibleLegendItemsCount: {type : "int", group : "Data", defaultValue: 2}
			}
		}});

		PlanningCalendarInCardLegend.prototype.exit = function () {
			PlanningCalendarLegend.prototype.exit.call(this, arguments);
			if (this._oItemsLink) {
				this._oItemsLink.destroy();
				this._oItemsLink = null;
			}
		};

		/**
		 * Makes or returns the object, defining how many legend items are hidden.
		 * @param {integer} iItemsLeft the number of hidden legend items
		 * @returns {sap.m.Label} the object
		 */
		PlanningCalendarInCardLegend.prototype._getMoreLabel = function (iItemsLeft) {
			if (!this._oItemsLink) {
				this._oItemsLink = new Label({
					text: iItemsLeft + " More"
				});
			}
			return this._oItemsLink;
		};

		return PlanningCalendarInCardLegend;
	});
