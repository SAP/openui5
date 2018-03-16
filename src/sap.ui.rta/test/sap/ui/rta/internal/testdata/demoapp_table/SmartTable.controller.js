sap.ui.controller("sap.ui.comp.sample.smarttable.SmartTable", {
	onInit: function() {
		"use strict";
		jQuery.sap.require("sap.ui.fl.FakeLrepConnectorLocalStorage");

		sap.ui.fl.FakeLrepConnectorLocalStorage.enableFakeConnector();


		var oModel, oView;
		jQuery.sap.require("sap.ui.core.util.MockServer");
		var oMockServer = new sap.ui.core.util.MockServer({
			rootUri: "sapuicompsmarttable/"
		});
		this._oMockServer = oMockServer;
		oMockServer.simulate("./mockserver/metadata.xml");
		oMockServer.start();
		oModel = new sap.ui.model.odata.ODataModel("sapuicompsmarttable", true);
		oModel.setCountSupported(false);
		oView = this.getView();
		oView.setModel(oModel);
	},
	onExit: function() {
		"use strict";
		this._oMockServer.stop();
	},
	switchToAdaptionMode: function() {
		"use strict";
		jQuery.sap.require("sap.ui.rta.RuntimeAuthoring");
		var oRta = new sap.ui.rta.RuntimeAuthoring({
			rootControl : this.getOwnerComponent().getAggregation("rootControl"),
			flexSettings: {
				developerMode: false
			}
		});
		oRta.attachEvent('stop', function() {
			oRta.destroy();
		});
		oRta.start();
	}
});
