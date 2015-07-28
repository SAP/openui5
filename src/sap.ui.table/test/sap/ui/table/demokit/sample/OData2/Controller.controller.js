sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/util/MockServer",
	"sap/ui/model/odata/v2/ODataModel",
	"sap/ui/model/json/JSONModel",
	"sap/ui/table/Column",
	"sap/ui/unified/Currency",
	"sap/m/Text",
	"sap/ui/model/type/String"
], function(Controller, MockServer, ODataModel, JSONModel, Column, Currency, Text, String) {
	"use strict";
	
	var sServiceUrl = "http://my.test.service.com/";

	return Controller.extend("sap.ui.table.sample.OData2.Controller", {
		
		onInit : function () {
			this.oMockServer = new MockServer({
				rootUri : sServiceUrl
			});
			
			MockServer.config({autoRespondAfter: 2000});
			
			this.oMockServer.simulate(jQuery.sap.getModulePath("sap.ui.table.sample.OData2") + "/metadata.xml", {
				sMockdataBaseUrl : jQuery.sap.getModulePath("sap.ui.table.sample.OData"),
				bGenerateMissingMockData : true
			});
			
			this.oMockServer.start();
			
			var oView = this.getView();
			var oDataModel = new ODataModel(sServiceUrl);
			
			oDataModel.getMetaModel().loaded().then(function(){
				oView.setModel(oDataModel.getMetaModel(), "meta");
			});
			oView.setModel(oDataModel);
			
			var oTable = oView.byId("table");
			var oBinding = oTable.getBinding("rows");
			var oBusyIndicator = oTable.getNoData();
			oBinding.attachDataRequested(function(){
				oTable.setNoData(oBusyIndicator);
			});
			oBinding.attachDataReceived(function(){
				oTable.setNoData(null); //Use default again ("No Data" in case no data is available)
			});
		},
		
		onExit : function () {
			this.oMockServer.destroy();
			this.oMockServer = null;
			MockServer.config({autoRespondAfter: 0});
		},
		
		columnFactory : function(sId, oContext) {
			var oModel = this.getView().getModel();
			var sName = oContext.getProperty("name");
			var sType = oContext.getProperty("type");
			var sSemantics = oContext.getProperty("sap:semantics");
			var bVisible = oContext.getProperty("sap:visible") != "false";
			var iLen = oContext.getProperty("maxLength");
			iLen = iLen ? parseInt(iLen, 10) : 10;
			
			function specialTemplate() {
				var sUnit = oContext.getProperty("sap:unit");
				if (sUnit) {
					var sUnitType = oModel.getMetaModel().getMetaContext("/ProductSet/" + sUnit).getProperty()["sap:semantics"];
					if (sUnitType == "currency-code") {
						return new Currency({value: {path: sName, type: new String()}, currency: {path: sName}});
					}
				}
				return null;
			}
			
			return new Column(sId, {
				visible: bVisible && sSemantics != "unit-of-measure" && sSemantics != "currency-code",
				sortProperty: oContext.getProperty("sap:sortable") == "true" ? sName : null,
				filterProperty: oContext.getProperty("sap:filterable") == "true" ? sName : null,
				width: (iLen > 9 ? (iLen > 50 ? 15 : 10) : 5) + "rem",
				label: new sap.m.Label({text: "{/#Product/" + sName + "/@sap:label}"}),
				hAlign: sType && sType.indexOf("Decimal") >= 0 ? "End" : "Begin",
				template: specialTemplate() || new Text({text: {path: sName}})
			});
		}
		
	});

});
