sap.ui.define([
	"sap/m/App",
	"sap/m/Input",
	"sap/m/Label",
	"sap/m/MessageToast",
	"sap/m/Page",
	"sap/m/PagingButton"
], function(App, Input, Label, MessageToast, Page, PagingButton) {
	"use strict";

	var app = new App("myApp", {initialPage: "page1"}),
		oPagingButton = new PagingButton({
			count: 10,
			positionChange: function (oEvent) {
				var msg = 'Position was ' + oEvent.getParameter("oldPosition")
						+ ", now is " + oEvent.getParameter("newPosition");
				MessageToast.show(msg);
			}
		}),
		oChangePositionInput = new Input("changePosition", {
			liveChange: function (oEvent) {
				oPagingButton.setPosition(+oEvent.getParameter("value"));
			}
		}),
		oChangePositionLabel = new Label({
			text: "Change position value",
			labelFor: "changePosition"
		}),
		oChangeCountInput = new Input("changeCount", {
			liveChange: function (oEvent) {
				oPagingButton.setCount(+oEvent.getParameter("value"));
			}
		}),
		oChangeCountLabel = new Label({
			text: "Change count value",
			labelFor: "changeCount"
		}),
		page1 = new Page("page1", {
			title: "PagingButton",
			titleLevel: "H1",
			headerContent: [
				oPagingButton
			],
			content: [
				oChangePositionLabel,
				oChangePositionInput,
				oChangeCountLabel,
				oChangeCountInput,
				new PagingButton({
					count: 10,
					positionChange: function (oEvent) {
						var msg = 'Position was ' + oEvent.getParameter("oldPosition")
								+ ", now is " + oEvent.getParameter("newPosition");
						MessageToast.show(msg);
					}
				})
			]
		});

	app.addPage(page1);

	app.placeAt("body");
});
