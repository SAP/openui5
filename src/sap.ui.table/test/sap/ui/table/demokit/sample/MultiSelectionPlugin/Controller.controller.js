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
	var SelectionMode = library.SelectionMode;

	var sServiceUrl = "http://my.test.service.com/";

	return Controller.extend("sap.ui.table.sample.MultiSelectionPlugin.Controller", {

		onInit: function() {
			this.oMockServer = new MockServer({
				rootUri: sServiceUrl
			});

			MockServer.config({autoRespondAfter: 2000});

			var sSamplePath = sap.ui.require.toUrl("sap/ui/table/sample/");
			this.oMockServer.simulate(sSamplePath + "MultiSelectionPlugin/metadata.xml", {
				sMockdataBaseUrl: sSamplePath + "OData",
				bGenerateMissingMockData: true
			});

			this.oMockServer.start();

			var aSelectionModes = [];
			jQuery.each(SelectionMode, function(k, v){
				if (k != SelectionMode.Multi) {
					aSelectionModes.push({key: k, text: v});
				}
			});

			var oView = this.getView();
			oView.setModel(new ODataModel(sServiceUrl));
			oView.setModel(new JSONModel({
				limit: 20,
				showHeaderSelector: true,
				selectionModes: aSelectionModes
			}), "config");
		},

		onSelectionModeChange: function(oEvent) {
			var oTable = this.byId("table");
			var oPlugin = oTable.getPlugins()[0];
			oPlugin.setSelectionMode(oEvent.getParameter("selectedItem").getKey());
		},

		onSelectionChange: function(oEvent) {
			var oPlugin = oEvent.getSource();
			var bLimitReached = oEvent.getParameters().limitReached;
			var iIndices = oPlugin.getSelectedIndices();
			var sMessage = "";

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
			var oInput = oEvent.getSource();
			var iLimit = parseInt(oInput.getValue());
			var sMessage = "";

			if (isNaN(iLimit) || iLimit < 0) {
				var oTable = this.byId("table");
				var oPlugin = oTable.getPlugins()[0];
				var iCurrentLimit = oPlugin.getLimit();

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
			this.oMockServer.destroy();
			this.oMockServer = null;
			MockServer.config({autoRespondAfter: 0});
		}
	});
});