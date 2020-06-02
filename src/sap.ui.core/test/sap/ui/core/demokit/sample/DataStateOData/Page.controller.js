sap.ui.define(['sap/m/MessageToast', 'sap/ui/core/mvc/Controller', 'sap/ui/core/util/MockServer', 'sap/ui/model/json/JSONModel', 'sap/ui/model/odata/v2/ODataModel', 'sap/ui/model/type/String', 'sap/base/util/extend'],
	function(MessageToast, Controller, MockServer, JSONModel, ODataModel, TypeString, extend) {
	"use strict";

	var PageController = Controller.extend("sap.ui.core.sample.DataStateOData.Page", {

		onInit: function (oEvent) {
			var that = this;
			this.sMockServerBaseUri = "test-resources/sap/ui/core/demokit/sample/DataStateOData/mockdata/";
			this.sServiceUri = "/sap/opu/odata/IWBEP/GWSAMPLE_BASIC/";
			this.oMockServer = new MockServer({rootUri : this.sServiceUri});
			// configure
			MockServer.config({
				autoRespond: true,
				autoRespondAfter: 2000
			});
			this.oMockServer.simulate(this.sMockServerBaseUri + "metadata.xml", {
				sMockdataBaseUrl : this.sMockServerBaseUri,
				bGenerateMissingMockData : true
			});
			this.oMockServer.start();

			this.oModel = new ODataModel(this.sServiceUri, {defaultBindingMode:"TwoWay", refreshAfterChange:false});
			this.oModel.setChangeBatchGroups({});

			this.getView().setModel(this.oModel);
			this.oDataStateModel = new JSONModel({});

			this.getView().setModel(this.oDataStateModel,"DataState");
			this.getView().bindElement("/ProductSet('HT-1000')");

			var oNameType = new TypeString();
			oNameType.setConstraints({maxlength:15});

			this.byId("Name").bindProperty("value",{path:"Name",type:oNameType});
			sap.ui.getCore().getMessageManager().registerObject(this.getView(), true);
			this.byId("Name").getBinding("value").attachDataStateChange(function(oEvent) {
				var oDataState = oEvent.mParameters['dataState'];
				that.applyDataStateChanged(oDataState); //visualize the data state changes on value
			});
		},
		applyDataStateChanged: function(oDataState) {
			var aChangedProperties = [],
				//that = this,
				oChanges = oDataState.getChanges();

			for (var n in oDataState.mProperties) {
					if (n in oChanges) {
						aChangedProperties.push(n);
						this.oDataStateModel.setProperty("/" + n, extend({}, oChanges[n]));
					}
			}
			if (oChanges['dirty']) {
				this.oDataStateModel.setProperty("/dirty", extend({}, oChanges['dirty']));
			}
		}
	});

	return PageController;

});

