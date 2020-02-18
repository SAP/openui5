sap.ui.define([
		'sap/ui/core/mvc/Controller',
		'sap/ui/unified/CalendarLegendItem',
		'sap/ui/unified/DateTypeRange',
		'sap/ui/unified/library'
	], function(Controller, CalendarLegendItem, DateTypeRange, unifiedLibrary) {
	"use strict";

	var CalendarDayType = unifiedLibrary.CalendarDayType;

	return Controller.extend("sap.ui.unified.sample.CalendarSpecialDaysLegend.CalendarSpecialDaysLegend", {

		handleShowSpecialDays: function(oEvent) {
			var oCal1 = this.byId("calendar1"),
				oLeg1 = this.byId("legend1"),
				oCal2 = this.byId("calendar2"),
				oLeg2 = this.byId("legend2"),
				bPressed = oEvent.getParameter("pressed"),
				oRefDate;

			if (bPressed) {
				oRefDate = new Date();
				for (var i = 1; i <= 10; i++) {
					oRefDate.setDate(i);
					var sType = "";
					if (i < 10) {
						sType = "Type0" + i;
					} else {
						sType = "Type" + i;
					}
					oCal1.addSpecialDate(new DateTypeRange({
						startDate : new Date(oRefDate),
						type : sType,
						tooltip : "Placeholder " + i
					}));
					oCal2.addSpecialDate(new DateTypeRange({
						startDate : new Date(oRefDate),
						type : sType,
						tooltip : "Placeholder " + i
					}));

					oLeg1.addItem(new CalendarLegendItem({
						text : "Placeholder " + i
					}));
					oLeg2.addItem(new CalendarLegendItem({
						text : "Placeholder " + i
					}));
				}

				oCal1.addSpecialDate(new DateTypeRange({
					startDate : new Date(oRefDate.setDate(11)),
					endDate : new Date(oRefDate.setDate(21)),
					type : CalendarDayType.NonWorking
				}));

				oCal1.addSpecialDate(new DateTypeRange({
					startDate : new Date(oRefDate.setDate(25)),
					type : CalendarDayType.NonWorking
				}));

				oCal2.addSpecialDate(new DateTypeRange({
					startDate : new Date(oRefDate.setDate(22)),
					type : CalendarDayType.NonWorking
				}));

				oCal2.addSpecialDate(new DateTypeRange({
					startDate : new Date(oRefDate.setDate(22)),
					type : CalendarDayType.Type03
				}));

				oCal2.addSpecialDate(new DateTypeRange({
					startDate : new Date(oRefDate.setDate(24)),
					type : CalendarDayType.NonWorking
				}));

				oCal2.addSpecialDate(new DateTypeRange({
					startDate : new Date(oRefDate.setDate(24)),
					type : CalendarDayType.Type03
				}));

			} else {
				oCal1.destroySpecialDates();
				oCal2.destroySpecialDates();
				oLeg1.destroyItems();
				oLeg2.destroyItems();
			}
		}
	});

});
