sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/util/MockServer",
	"sap/ui/model/odata/v2/ODataModel",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/ui/table/library"
], function(Controller, MockServer, ODataModel, JSONModel, MessageToast, library) {
	"use strict";

	// shortcut for sap.ui.table.SelectionMode
	const SelectionMode = library.SelectionMode;

	const sServiceUrl = "http://my.test.service.com/";

	return Controller.extend("sap.ui.table.sample.MultiSelectionPlugin.Controller", {

		onInit: function() {
			this.oMockServer = new MockServer({
				rootUri: sServiceUrl
			});

			MockServer.config({autoRespondAfter: 2000});

			const sSamplePath = sap.ui.require.toUrl("sap/ui/table/sample/");
			this.oMockServer.simulate(sSamplePath + "MultiSelectionPlugin/metadata.xml", {
				sMockdataBaseUrl: sSamplePath + "OData",
				bGenerateMissingMockData: true
			});

			this.oMockServer.start();

			const aSelectionModes = [];
			Object.keys(SelectionMode).forEach(function(k) {
				aSelectionModes.push({key: k, text: SelectionMode[k]});
			});

			const oView = this.getView();
			oView.setModel(new ODataModel(sServiceUrl));
			oView.setModel(new JSONModel({
				limit: 20,
				showHeaderSelector: true,
				selectionModes: aSelectionModes,
				selectionMode: SelectionMode.MultiToggle
			}), "config");
		},

		onSelectionChange: function(oEvent) {
			const oPlugin = oEvent.getSource();
			const bLimitReached = oEvent.getParameters().limitReached;
			const iIndices = oPlugin.getSelectedIndices();
			let sMessage = "";

			if (iIndices.length > 0) {
				sMessage = iIndices.length + " row(s) selected.";
				if (bLimitReached) {
					sMessage = sMessage + " The recently selected range was limited to " + oPlugin.getLimit() + " rows!";
				}
			} else {
				sMessage = "Selection cleared.";
			}

			MessageToast.show(sMessage);
		},

		onLimitChange: function(oEvent) {
			const oInput = oEvent.getSource();
			const iLimit = parseInt(oInput.getValue());
			let sMessage = "";

			if (isNaN(iLimit) || iLimit < 0) {
				const oTable = this.byId("table");
				const oPlugin = oTable.getDependents()[0];
				const iCurrentLimit = oPlugin.getLimit();

				oInput.setValue(iCurrentLimit);
				sMessage = "The Limit accepts positive integer values. To disable it set its value to 0. \nCurrent limit is " + iCurrentLimit;
			} else if (iLimit === 0) {
				sMessage = "Limit disabled";
			} else {
				sMessage = "Limit set to " + iLimit;
			}

			MessageToast.show(sMessage);
		},

		onExit: function() {
			const oModel = this.getView().getModel();
			this.getView().setModel();
			oModel.destroy();

			this.oMockServer.destroy();
			this.oMockServer = null;
			MockServer.config({autoRespondAfter: 0});
		}
	});
});