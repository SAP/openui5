/*!
 * ${copyright}
 */

// Provides control sap.m.PlanningCalendarLegend.
sap.ui.define(['sap/ui/unified/CalendarLegend', 'sap/ui/unified/CalendarAppointment', 'sap/ui/core/Core', './PlanningCalendarLegendRenderer'],
	function(CalendarLegend, CalendarAppointment, Core, PlanningCalendarLegendRenderer) {
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
		 */
		var PlanningCalendarLegend = CalendarLegend.extend("sap.m.PlanningCalendarLegend", /** @lends sap.m.PlanningCalendarLegend.prototype */ { metadata : {

			library : "sap.m",
			properties: {
				/**
				 * Defines the text displayed in the header of the items list. It is commonly related to the calendar days.
				 */
				itemsHeader: { type: "string", group: "Appearance" },

				/**
				 * Defines the text displayed in the header of the appointment items list. It is commonly related to the calendar appointments.
				 */
				appointmentItemsHeader: { type: "string", group: "Appearance" }
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

		/*
		* Finds the legend text for a given appointment or legend item.
		*
		* @param {sap.m.PlanningCalendarLegend} oLegend A legend
		* @param {sap.ui.unified.CalendarLegendItem|sap.ui.unified.CalendarAppointment} oSpecialItem An appointment or a legend type
		* @returns {string} The matching legend item's default text.
		* @private
		*/
		PlanningCalendarLegend.findLegendItemForItem = function(oLegend, oSpecialItem) {
			var aLegendAppointments = oLegend ? oLegend.getAppointmentItems() : null,
				aLegendItems = oLegend ? oLegend.getItems() : null,
				bAppointmentItem = oSpecialItem instanceof CalendarAppointment,
				aItems = bAppointmentItem ? aLegendAppointments : aLegendItems,
				oItemType = bAppointmentItem ? oSpecialItem.getType() : oSpecialItem.type,
				oItem,
				sLegendItemText,
				i;

			if (aItems && aItems.length) {
				for (i = 0; i < aItems.length; i++) {
					oItem = aItems[i];
					if (oItem.getType() === oItemType) {
						sLegendItemText = oItem.getText();
						break;
					}
				}
			}

			// if the special item's type is not present in the legend's items,
			// the screen reader has to read it's type
			if (!sLegendItemText) {
				sLegendItemText = oItemType;
			}

			return sLegendItemText;
		};

		PlanningCalendarLegend.prototype._getItemsHeader = function() {
			var sItemsHeader = this.getItemsHeader();

			if (sItemsHeader == undefined) {
				return Core.getLibraryResourceBundle('sap.m').getText("PLANNING_CALENDAR_LEGEND_ITEMS_HEADER");
			}

			return sItemsHeader;
		};

		PlanningCalendarLegend.prototype._getAppointmentItemsHeader = function() {
			var sAppointmentItemsHeader = this.getAppointmentItemsHeader();

			if (sAppointmentItemsHeader == undefined) {
				return Core.getLibraryResourceBundle('sap.m').getText("PLANNING_CALENDAR_LEGEND_APPOINTMENT_ITEMS_HEADER");
			}

			return sAppointmentItemsHeader;
		};

		return PlanningCalendarLegend;
	});
