sap.ui.define(['jquery.sap.global', 'sap/ui/core/mvc/Controller'],
	function(jQuery, Controller) {
	"use strict";

	var MainController = Controller.extend("samples.components.ext.sap.Main", {

		onInit : function () {
			jQuery.sap.log.info("samples.components.ext.sap.Main - onInit");
			
			var model = new sap.ui.model.json.JSONModel();
			model.setData({
				number: 42
			});
			this.getView().setModel(model);
		},
	
		destroySub2View: function() {
			this.byId("sub2View").destroy();
		},
		
		formatNumber: function(iNumber) {
			return "000" + iNumber;
		}
	
	});

	return MainController;

});
