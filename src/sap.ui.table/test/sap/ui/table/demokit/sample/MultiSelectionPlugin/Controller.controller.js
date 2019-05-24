sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/util/MockServer",
	"sap/ui/model/odata/v2/ODataModel",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/odata/OperationMode",
	"sap/ui/table/sample/TableExampleUtils",
	"sap/m/MessageToast",
	"sap/ui/table/plugins/MultiSelectionPlugin"
], function(Controller, MockServer, ODataModel, JSONModel, OperationMode, TableExampleUtils, MessageToast, MultiSelectionPlugin) {
	"use strict";

	var sServiceUrl = "http://my.test.service.com/";

	return Controller.extend("sap.ui.table.sample.MultiSelectionPlugin.Controller", {

		onInit : function() {
			this.oMockServer = new MockServer({
				rootUri : sServiceUrl
			});

			MockServer.config({autoRespondAfter: 2000});

			var sSamplePath = sap.ui.require.toUrl("sap/ui/table/sample/");
			this.oMockServer.simulate(sSamplePath + "MultiSelectionPlugin/metadata.xml", {
				sMockdataBaseUrl : sSamplePath + "OData",
				bGenerateMissingMockData : true
			});

			this.oMockServer.start();

			var oView = this.getView();
			oView.setModel(new ODataModel(sServiceUrl));

			var oTable = this.getTable();
			oTable.addPlugin(new MultiSelectionPlugin({
				limit: 20,
				selectionChange: function(oEvent) {
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
				}
			}));
		},

		onExit : function() {
			this.oMockServer.destroy();
			this.oMockServer = null;
			MockServer.config({autoRespondAfter: 0});
		},

		getTable : function(){
			return this.byId("table");
		},

		toggleShowHeaderSelector : function(oEvent) {
			var oTable = this.getTable();
			oTable._oSelectionPlugin.setShowHeaderSelector(oEvent.getParameter("pressed"));
		},

		submitValue : function() {
			var oView = this.getView(),
				oTable = this.getTable(),
				iLimit = parseInt(oView.byId("inputLimit").getValue()),
				sMessage = "";

			oTable._oSelectionPlugin.setLimit(iLimit);
			if (isNaN(iLimit) || iLimit < 0) {
				var iCurrentLimit = oTable._oSelectionPlugin.getLimit();
				oView.byId("inputLimit").setValue(iCurrentLimit);
				sMessage = "The Limit accepts positive integer values. To disable it set its value to 0. \nCurrent limit is " + iCurrentLimit;
			} else if (iLimit === 0) {
				sMessage = "Limit disabled";
			} else {
				sMessage = "Limit set to " + oTable._oSelectionPlugin.getLimit();
			}
			MessageToast.show(sMessage);
		}
	});

});