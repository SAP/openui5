// Note: the HTML page 'YearRangePicker.html' loads this module via data-sap-ui-on-init

sap.ui.define([
	"sap/m/App",
	"sap/m/Page",
	"sap/m/Panel",
	"sap/ui/core/Element",
	"sap/ui/core/date/UniversalDate",
	"sap/m/Label",
	"sap/m/Input",
	"sap/ui/unified/calendar/YearRangePicker"
], function(
	App,
	Page,
	Panel,
	Element,
	UniversalDate,
	Label,
	Input,
	YearRangePicker
) {
	"use strict";

	var oPage = new Page({
		title: "Test Page for sap.ui.unified.calendar.YearRangePicker",
		content: [
			new Panel({
				content: [
					new Label({text: "selected Year", labelFor: "I1"}),
					new Input("I1", {
						placeholder: "Enter a year...",
						change: function(oEvent){
							var sValue = oEvent.getParameter('newValue'),
								oYRP = Element.getElementById("YRP1"),
								iYear,
								oDate;

							if (sValue && !isNaN(sValue)){
								iYear = parseInt(sValue),
								oDate = new UniversalDate();

								oDate.setFullYear(iYear);
								oDate.setMonth(0);
								oDate.setDate(1);
								oYRP.setDate(oDate.getJSDate());
							}
						}
					}),
					new YearRangePicker("YRP1", {
						select: function(oEvent) {
							var oInput = Element.getElementById("I1"),
								oYRP = oEvent.oSource,
								oDate = new UniversalDate(oYRP.getDate());

							oInput.setValue(oDate.getFullYear());
						}
					})
				]
			})
		]
	});

	new App().addPage(oPage).placeAt("body");
});