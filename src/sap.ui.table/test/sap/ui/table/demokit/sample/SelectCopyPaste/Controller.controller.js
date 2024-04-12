sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/util/MockServer",
	"sap/ui/model/odata/v2/ODataModel",
	"sap/m/MessageToast",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox",
	"sap/m/plugins/CellSelector",
	"sap/m/plugins/CopyProvider",
	"sap/ui/table/plugins/MultiSelectionPlugin"
], function(Controller, MockServer, ODataModel, MessageToast, JSONModel, MessageBox, CellSelector, CopyProvider, MultiSelectionPlugin) {
	"use strict";

	const sServiceUrl = "http://my.test.service.com/";
	let oCellSelector; let oCopyProvider;

	return Controller.extend("sap.ui.table.sample.SelectCopyPaste.Controller", {

		onInit: function() {
			this.oMockServer = new MockServer({
				rootUri: sServiceUrl
			});

			MockServer.config({autoRespondAfter: 2000});

			const sMockDataPath = sap.ui.require.toUrl("sap/ui/table/sample/OData");
			this.oMockServer.simulate(sMockDataPath + "/metadata.xml", {
				sMockdataBaseUrl: sMockDataPath,
				bGenerateMissingMockData: true
			});

			this.oMockServer.start();

			const oView = this.getView();
			oView.setModel(new ODataModel(sServiceUrl));

			const oUiData = {
				"initial": {"SelectionMode": "MultiToggle"},
				"SelectionMode": [{mode: "MultiToggle"}, {mode: "Single"}, {mode: "None"}]
			};
			oView.setModel(new JSONModel(oUiData), "ui");

			if (window.isSecureContext) {
				const oTable = this.byId("table");
				oCellSelector = new CellSelector();
				oTable.addDependent(oCellSelector);

				oCopyProvider = new CopyProvider({extractData: this.extractData, copy: this.onCopy});
				oTable.addDependent(oCopyProvider);

				const oToolbar = this.byId("toolbar");
				oToolbar.addContent(oCopyProvider.getCopyButton());
			}
		},

		onExit: function() {
			const oModel = this.getView().getModel();
			this.getView().setModel();
			oModel.destroy();

			this.oMockServer.destroy();
			this.oMockServer = null;
			MockServer.config({autoRespondAfter: 0});
		},

		extractData: function(oRowContext, oColumn) {
			const oValue = oRowContext.getProperty(oColumn.getSortProperty());
			return oColumn.__type ? oColumn.__type.formatValue(oValue, "string") : oValue;
		},

		onCopy: function(oEvent) {
			MessageToast.show("Selection copied to clipboard");
		},

		onSelectChange: function(oEvent) {
			const aParams = oEvent.getParameters(); const
oTable = this.byId("table");
			MultiSelectionPlugin.findOn(oTable).setSelectionMode(aParams.selectedItem.getKey());
		},

		onPaste: function(oEvent) {
			function handlePaste(aData, oCellInfo) {
				MessageToast.show("Pasted Data (on " + (oCellInfo ? "Cell (" + (oCellInfo.from.rowIndex + "/" + oCellInfo.from.colIndex) + ")" : "Table") + " Level):\n\n" + aData);
			}

			const aData = oEvent.getParameter("data");
			const oRange = oCellSelector.getSelectionRange();

			if (oRange) {
				MessageBox.confirm("Do you want to paste at position " + (oRange.from.rowIndex + "/" + oRange.from.colIndex) + "?", {onClose: function(sAction) {
					handlePaste(aData, sAction === "OK" ? oRange : null);
				}});
			} else {
				handlePaste(aData, null);
			}
		}
	});

});