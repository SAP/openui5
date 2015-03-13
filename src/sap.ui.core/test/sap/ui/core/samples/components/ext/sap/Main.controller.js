sap.ui.define(['jquery.sap.global', 'sap/ui/core/mvc/Controller'],
	function(jQuery, Controller) {
	"use strict";

	var MainController = Controller.extend("samples.components.ext.sap.Main", {

		onInit : function () {
			jQuery.sap.log.info("samples.components.ext.sap.Main - onInit");
		},
	
		destroySub2View: function() {
			this.byId("sub2View").destroy();
		}
	
	});

	return MainController;

});
