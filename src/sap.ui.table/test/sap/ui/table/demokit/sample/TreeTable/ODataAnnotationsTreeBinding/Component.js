sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/model/odata/v2/ODataModel",
	"sap/ui/table/sample/TreeTable/ODataAnnotationsTreeBinding/localService/mockserver"
], function(UIComponent, ODataModel, mockserver) {
	"use strict";

	return UIComponent.extend("sap.ui.table.sample.TreeTable.ODataAnnotationsTreeBinding.Component", {
		metadata: {
			manifest: "json"
		},
		init: function() {
			// call the init function of the parent
			UIComponent.prototype.init.apply(this, arguments);

			const sODataServiceUrl = "/here/goes/your/odata/service/url/";

			// init our mock server
			this.oMockServer = mockserver.init(sODataServiceUrl);

			// set model on component
			this.setModel(
				new ODataModel(sODataServiceUrl, {
					json: true,
					useBatch: true
				})
			);
		},
		exit: function() {
			const oModel = this.getModel();
			this.setModel();
			oModel.destroy();

			this.oMockServer.destroy();
			this.oMockServer = null;
		}
	});
});