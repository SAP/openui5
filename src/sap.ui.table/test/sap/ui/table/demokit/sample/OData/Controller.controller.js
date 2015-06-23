sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/table/sample/TableExampleUtils",
	"sap/ui/core/util/MockServer",
	"sap/ui/model/odata/v2/ODataModel",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/odata/OperationMode"
], function(Controller, TableExampleUtils, MockServer, ODataModel, JSONModel, OperationMode) {
	"use strict";
	
	var sServiceUrl = "http://my.test.service.com/";

	return Controller.extend("sap.ui.table.sample.OData.Controller", {
		
		onInit : function () {
			this.oMockServer = new MockServer({
				rootUri : sServiceUrl
			});
			
			MockServer.config({autoRespondAfter: 2000});
			
			var sMockDataPath = jQuery.sap.getModulePath("sap.ui.table.sample.OData");
			this.oMockServer.simulate(sMockDataPath + "/metadata.xml", {
				sMockdataBaseUrl : sMockDataPath,
				bGenerateMissingMockData : true
			});
			
			this.oMockServer.start();
			
			var oView = this.getView();
			this.oBusyIndicator = this.getTable().getNoData();
			oView.setModel(new ODataModel(sServiceUrl));
			
			this.initBindingEventHandler();
			
			var oUiData = {
				operationModes : [],
				selectedOperationMode : OperationMode.Server
			};
			for (var mode in OperationMode) {
				oUiData.operationModes.push({name: OperationMode[mode]});
			}
			oView.setModel(new JSONModel(oUiData), "ui");
		},
		
		onExit : function () {
			this.oBusyIndicator.destroy();
			this.oBusyIndicator = null;
			
			this.oMockServer.destroy();
			this.oMockServer = null;
			MockServer.config({autoRespondAfter: 0});
		},
		
		formatDimensions : function(sWidth, sHeight, sDepth, sUnit) {
			if (sWidth && sHeight && sDepth && sUnit) {
				return sWidth+"x"+sHeight+"x"+sDepth+" "+(sUnit.toLowerCase());
			}
			return null;
		},
		
		getTable : function(){
			return this.getView().byId("table");
		},
		
		onModelRefresh : function() {
			this.getTable().getBinding().refresh(true);
		},
		
		onOperationModeChange : function(oEvent) {
			this.getTable().bindRows({
				path: "/ProductSet",
				parameters: {operationMode: oEvent.getParameter("key")}
			});
			this.initBindingEventHandler();
			this.onModelRefresh();
		},
		
		initBindingEventHandler : function(){
			var oBusyIndicator = this.oBusyIndicator;
			var oTable = this.getTable();
			var oBinding = oTable.getBinding("rows");
			
			oBinding.attachDataRequested(function(){
				oTable.setNoData(oBusyIndicator);
			});
			oBinding.attachDataReceived(function(){
				oTable.setNoData(null); //Use default again ("No Data" in case no data is available)
			});
		},
		
		showInfo : function(oEvent) {
			TableExampleUtils.showInfo(jQuery.sap.getModulePath("sap.ui.table.sample.OData", "/info.json"), oEvent.getSource());
		}
		
	});

});
