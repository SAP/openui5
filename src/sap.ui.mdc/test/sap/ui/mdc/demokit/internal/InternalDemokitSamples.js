// Note: the HTML page 'InternalDemokitSamples.html' loads this module via data-sap-ui-on-init

sap.ui.define([
	"sap/ui/core/Core",
	"sap/ui/core/util/LibraryInfo",
	"sap/ui/util/openWindow",
	"sap/ui/model/json/JSONModel",
	"sap/m/Table",
	"sap/m/Column",
	"sap/m/ColumnListItem",
	"sap/m/Label",
	"sap/m/Text"
], async function(Core, LibraryInfo, openWindow, JSONModel, Table, Column, ColumnListItem, Label, Text) {
	"use strict";
	var oLibraryInfo = new LibraryInfo();

	await Core.ready();

	oLibraryInfo._getDocuIndex("sap/ui/mdc", function(res) {
		var data = {
			samples: res.explored.samples
		};

		var oModel = new JSONModel();
		oModel.setData(data);

		var oTable = new Table({
			headerText: "MDC Internal Demokit Samples",
			mode: "None",
			itemPress: function(oEvent) {
				var sPathname = window.location.pathname.split('/')[1];
				var sBaseUrl;
				if (sPathname === "testsuite") {
					sBaseUrl = window.location.origin + "/" + sPathname + "/documentation.html";
				} else if (sPathname === "test-resources") {
					sBaseUrl = window.location.origin + "/documentation.html"
				} else {
					sBaseUrl = window.location.origin + "/" + sPathname + "/";
				}
				var sSampleId = oEvent.getParameter("listItem").getBindingContext().getProperty("id");
				openWindow(sBaseUrl + "#/entity/sap.ui.mdc.sample.Table/sample/" + sSampleId);
			},
			columns: [
				new Column({
					header: new Label({text: "Name"})
				}),
				new Column({
					header: new Label({text: "Description"})
				})
			],
			items: {
				path: "/samples",
				template: new ColumnListItem({
					cells: [
						new Text({text: "{name}"}),
						new Text({text: "{description}"})
					],
					type: "Navigation"
				})
			}
		});

		oTable.placeAt("content");
		oTable.setModel(oModel);
	});
});