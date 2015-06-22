sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/table/sample/TableExampleUtils",
	"sap/ui/core/util/MockServer",
	"sap/ui/model/odata/v2/ODataModel"
], function(Controller, TableExampleUtils, MockServer, ODataModel) {
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
			var oTable = oView.byId("table");
			var oBusyIndicator = oTable.getNoData();
			
			oView.setModel(new ODataModel(sServiceUrl));
			
			var oBinding = oTable.getBinding("rows");
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
		
		formatDimensions : function(sWidth, sHeight, sDepth, sUnit) {
			if (sWidth && sHeight && sDepth && sUnit) {
				return sWidth+"x"+sHeight+"x"+sDepth+" "+(sUnit.toLowerCase());
			}
			return null;
		},
		
		refreshModel : function() {
			this.getView().byId("table").getBinding().refresh(true);
		},
		
		showInfo : function(oEvent) {
			TableExampleUtils.showInfo(jQuery.sap.getModulePath("sap.ui.table.sample.OData", "/info.json"), oEvent.getSource());
		}
		
	});

});
