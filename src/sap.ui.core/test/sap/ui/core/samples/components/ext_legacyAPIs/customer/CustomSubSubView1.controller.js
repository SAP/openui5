sap.ui.define(['sap/base/Log', 'sap/ui/core/mvc/Controller'],
	function(Log/*, Controller*/) {
	"use strict";

	sap.ui.controller("samples.components.ext_legacyAPIs.customer.CustomSubSubView1", {

		onInit: function() {
			Log.info("CustomSubSubView1 Controller onInit()");
		},

		formatNumber: function(iNumber) {
			return "[ext" + iNumber + "]";
		}

	});

});
