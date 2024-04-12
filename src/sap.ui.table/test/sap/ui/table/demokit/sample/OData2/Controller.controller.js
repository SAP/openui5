sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/util/MockServer",
	"sap/ui/model/odata/v2/ODataModel",
	"sap/ui/table/Column",
	"sap/ui/unified/Currency",
	"sap/m/Label",
	"sap/m/Text",
	"sap/ui/model/type/String"
], function(Controller, MockServer, ODataModel, Column, Currency, Label, Text, StringType) {
	"use strict";

	const sServiceUrl = "http://my.test.service.com/";

	return Controller.extend("sap.ui.table.sample.OData2.Controller", {

		onInit: function() {
			this.oMockServer = new MockServer({
				rootUri: sServiceUrl
			});

			MockServer.config({autoRespondAfter: 2000});

			this.oMockServer.simulate(sap.ui.require.toUrl("sap/ui/table/sample/OData2/metadata.xml"), {
				sMockdataBaseUrl: sap.ui.require.toUrl("sap/ui/table/sample/OData"),
				bGenerateMissingMockData: true
			});

			this.oMockServer.start();

			const oView = this.getView();
			const oDataModel = new ODataModel(sServiceUrl);

			oDataModel.getMetaModel().loaded().then(function() {
				oView.setModel(oDataModel.getMetaModel(), "meta");
			});
			oView.setModel(oDataModel);

			const oTable = oView.byId("table");
			const oBinding = oTable.getBinding();
			const oBusyIndicator = oTable.getNoData();
			oBinding.attachDataRequested(function() {
				oTable.setNoData(oBusyIndicator);
			});
			oBinding.attachDataReceived(function() {
				oTable.setNoData(null); //Use default again ("No Data" in case no data is available)
			});
		},

		onExit: function() {
			const oModel = this.getView().getModel();
			this.getView().setModel();
			oModel.destroy();

			this.oMockServer.destroy();
			this.oMockServer = null;
			MockServer.config({autoRespondAfter: 0});
		},

		columnFactory: function(sId, oContext) {
			const oModel = this.getView().getModel();
			const sName = oContext.getProperty("name");
			const sType = oContext.getProperty("type");
			const sSemantics = oContext.getProperty("sap:semantics");
			const bVisible = oContext.getProperty("sap:visible") !== "false";
			let iLen = oContext.getProperty("maxLength");
			let sColumnWidth = "5rem";

			function specialTemplate() {
				const sUnit = oContext.getProperty("sap:unit");
				if (sUnit) {
					const sUnitType = oModel.getMetaModel().getMetaContext("/ProductSet/" + sUnit).getProperty()["sap:semantics"];
					if (sUnitType === "currency-code") {
						return new Currency({value: {path: sName, type: new StringType()}, currency: {path: sUnit}});
					}
				}
				return null;
			}

			iLen = iLen ? parseInt(iLen) : 10;

			if (iLen > 50) {
				sColumnWidth = "15rem";
			} else if (iLen > 9) {
				sColumnWidth = "10rem";
			}

			return new Column(sId, {
				visible: bVisible && sSemantics !== "unit-of-measure" && sSemantics !== "currency-code",
				sortProperty: oContext.getProperty("sap:sortable") === "true" ? sName : null,
				filterProperty: oContext.getProperty("sap:filterable") === "true" ? sName : null,
				width: sColumnWidth,
				label: new Label({text: "{/#Product/" + sName + "/@sap:label}"}),
				hAlign: sType && sType.indexOf("Decimal") >= 0 ? "End" : "Begin",
				template: specialTemplate() || new Text({text: {path: sName}, wrapping: false})
			});
		}

	});

});