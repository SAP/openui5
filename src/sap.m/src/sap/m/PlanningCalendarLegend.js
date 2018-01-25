/*!
 * ${copyright}
 */

// Provides control sap.m.PlanningCalendarLegend.
sap.ui.define(['sap/ui/unified/CalendarLegend', './PlanningCalendarLegendRenderer'],
	function(CalendarLegend, PlanningCalendarLegendRenderer) {
		"use strict";


		/**
		 * Constructor for a new <code>PlanningCalendarLegend</code>.
		 *
		 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
		 * @param {object} [mSettings] Initial settings for the new control
		 *
		 * @class
		 * A legend for the {@link sap.m.PlanningCalendar} that displays the special dates and appointments in colors with their corresponding description.
		 * The <code>PlanningCalendarLegend</code> extends {@link sap.ui.unified.CalendarLegend} and
		 * overwrites the default value for property <code>columnWidth</code> to <code>auto</code>
		 * @extends sap.ui.unified.CalendarLegend
		 *
		 * @author SAP SE
		 * @version ${version}
		 *
		 * @constructor
		 * @public
		 * @since 1.50
		 * @alias sap.m.PlanningCalendarLegend
		 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
		 */
		var PlanningCalendarLegend = CalendarLegend.extend("sap.m.PlanningCalendarLegend", /** @lends sap.m.PlanningCalendarLegend.prototype */ { metadata : {

			library : "sap.m",
			properties: {
				/**
				 * Defines the text displayed in the header of the items list. It is commonly related to the calendar days.
				 */
				itemsHeader: { type: "string", group: "Appearance", defaultValue: "Calendar" },

				/**
				 * Defines the text displayed in the header of the appointment items list. It is commonly related to the calendar appointments.
				 */
				appointmentItemsHeader: { type: "string", group: "Appearance", defaultValue: "Appointments" }
			},
			aggregations : {
				/**
				 * The legend items which show color and type information about the calendar appointments.
				 */
				appointmentItems: {type: "sap.ui.unified.CalendarLegendItem", multiple: true, singularName: "appointmentItem"}
			},
			designtime: "sap/m/designtime/PlanningCalendarLegend.designtime"
		}});

		/** Default value for column width. */
		PlanningCalendarLegend._COLUMN_WIDTH_DEFAULT = "auto";

		PlanningCalendarLegend.prototype.init = function () {
			CalendarLegend.prototype.init.call(this);
			this.setProperty("columnWidth", PlanningCalendarLegend._COLUMN_WIDTH_DEFAULT);
			this.addStyleClass("sapMPlanCalLegend");
		};

		/* Overrides the setter in order to alter the default value.
		 Since there is no way to define alternative default value in the subclass, we support it in the setter and init methods */
		PlanningCalendarLegend.prototype.setColumnWidth = function (sWidth) {
			if (sWidth == undefined) { //includes null
				sWidth = PlanningCalendarLegend._COLUMN_WIDTH_DEFAULT;
			}
			return this.setProperty("columnWidth", sWidth);
		};

		return PlanningCalendarLegend;
	});
