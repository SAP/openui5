sap.ui.controller("sap.ui.unified.sample.CalendarSpecialDaysLegend.CalendarSpecialDaysLegend", {

	handleShowSpecialDays: function(oEvent) {	
		var oCal = this.getView().byId("calendar");
		var oLeg = this.getView().byId("legend");
		var bPressed = oEvent.getParameter("pressed");
		if (bPressed) {
			var oRefDate = new Date();
			for (var i = 1; i <= 10; i++) {
				oRefDate.setDate(i);
				var sType = "";
				if (i < 10) {
					sType = "Type0" + i;
				} else {
					sType = "Type" + i;
				}
				oCal.addSpecialDate(new sap.ui.unified.DateTypeRange({
					startDate : new Date(oRefDate),
					type : sType,
					tooltip : "Placeholder " + i
				}));
				oLeg.addItem(new sap.ui.unified.CalendarLegendItem({
					text : "Placeholder " + i
				}));
			}
		} else {
			oCal.destroySpecialDates();
			oLeg.destroyItems();
		}
	}
});