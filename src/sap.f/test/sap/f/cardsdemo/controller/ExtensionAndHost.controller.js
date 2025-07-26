sap.ui.define([
	"sap/base/Log",
	"sap/ui/core/mvc/Controller",
	"sap/ui/integration/ActionDefinition",
	"sap/ui/integration/Host"
], function (Log, Controller, ActionDefinition, Host) {
	"use strict";

	return Controller.extend("sap.f.cardsdemo.controller.ExtensionAndHost", {
		onInit: function () {
			var oHost = new Host({
				actions: [{
						type: 'Navigation',
						url: "http://www.sap.com",
						target: "_blank",
						text: 'AutoOpen - SAP website - Host'
					},
					{
						type: 'Navigation',
						parameters: {
							url: "http://www.sap.com",
							target: "_blank"
						},
						text: 'Navigation - SAP website - Host'
					}
				],
				action: function (oEvent) {
					Log.error("Action handled in the Host:" + JSON.stringify(oEvent.getParameters().parameters));
				},
				resolveDestination: function (sDestinationName, oCard) {
					switch (sDestinationName) {
						case "Northwind":
							return "https://services.odata.org/V3/Northwind/Northwind.svc";
						case "Navigation":
							return new Promise(function (resolve) {
								setTimeout(function () {
									resolve("https://some.domain.com");
								}, 10);
							});
					}
				}
			});

			this.byId("card1").setHost(oHost);
			this.byId("card21").setHost(oHost);
			this.byId("card3").setHost(oHost);
			this.byId("card4").setHost(oHost);

			// Simulate library location for the shared extension
			sap.ui.loader.config({
				paths: {
					"sap/f/cardsdemo/testLib": sap.ui.require.toUrl("sap/f/cardsdemo/testLib")
				}
			});
		},
		onCardAction: function (oEvent) {
			Log.error("Action handled in the Card:" + JSON.stringify(oEvent.getParameters().parameters));
		},
		onSetNewActionsPress: function (oEvent) {
			this.byId("card1").destroyActionDefinitions();
			this.byId("card1").addActionDefinition(new ActionDefinition({
				type: 'Navigation',
				parameters: {
					url: "http://www.sap.com",
					target: "_blank"
				},
				text: 'Action 1'
			}));
			this.byId("card1").addActionDefinition(new ActionDefinition({
				type: 'Navigation',
				parameters: {
					url: "http://www.sap.com",
					target: "_blank"
				},
				text: 'Action 2'
			}));
		},
		onSetNewFormattersPress: function (oEvent) {
			this.byId("card1").getAggregation("_extension").setFormatters({
				titleToUpperCase: function (title) {
					return title.toUpperCase() + " NEW";
				},
				descriptionToUpperCase: function (sDescr) {
					return sDescr.toUpperCase() + " NEW";
				}
			});
		}
	});
});