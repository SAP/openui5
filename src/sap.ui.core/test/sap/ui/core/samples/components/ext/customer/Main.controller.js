sap.ui.define(['sap/base/Log', 'samples/components/ext/sap/Main.controller'],
	function(Log, Controller) {
	"use strict";

	var MainController = Controller.extend("samples.components.ext.customer.Main", {

		onInit : function () {
			Controller.prototype.onInit.apply(this, arguments);
			Log.info("samples.components.ext.customer.Main - onInit");
		},

		formatNumber: function(iNumber) {
			return "123" + iNumber;
		}

	});

	return MainController;

});
