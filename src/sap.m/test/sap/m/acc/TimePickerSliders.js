sap.ui.define([
	"sap/m/App",
	"sap/m/Page",
	"sap/m/Panel",
	"sap/m/TimePickerSliders",
	"sap/m/MessageToast"
], function(App, Page, Panel, TimePickerSliders, MessageToast) {
	"use strict";

	new App({
		pages: [
			new Page({
				enableScrolling: false,
				title: "TimePickerSliders accessibility example",
				content: new Panel({
					headerText: "sap.m.TimePickerSliders in a standalone scenario",
					expandable: false,
					height: "300px",
					content: new TimePickerSliders({
						change: function (oEvent) {
							MessageToast.show("Selected time: " + oEvent.getParameter("value"));
						}
					})
				})
			})
		]
	}).placeAt("content");
});
