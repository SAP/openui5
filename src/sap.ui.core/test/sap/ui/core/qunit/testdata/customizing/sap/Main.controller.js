sap.ui.define(['jquery.sap.global', 'sap/ui/core/mvc/Controller'],
	function(jQuery, Controller) {
	"use strict";

	var MainController = Controller.extend("testdata.customizing.sap.Main", {

		onInit : function () {
			jQuery.sap.log.info("testdata.customizing.sap.Main - onInit");
		}

	});

	return MainController;

});
