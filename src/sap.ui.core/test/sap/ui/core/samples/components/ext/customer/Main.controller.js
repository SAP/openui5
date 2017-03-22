sap.ui.define(['jquery.sap.global', 'samples/components/ext/sap/Main.controller'],
	function(jQuery, Controller) {
	"use strict";

	var MainController = Controller.extend("samples.components.ext.customer.Main", {

		onInit : function () {
			Controller.prototype.onInit.apply(this, arguments);
			jQuery.sap.log.info("samples.components.ext.customer.Main - onInit");
		},

		formatNumber: function(iNumber) {
			return "123" + iNumber;
		}

	});

	return MainController;

});
