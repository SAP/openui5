(function() {
	"use strict";

	window["sap-ui-config"] = window["sap-ui-config"] || {};
	window["sap-ui-config"]["preloadLibCss"] = [ "!sap.ui.core", "sap.ui.testlib" ];
	window["sap-ui-config"]["xx-bootTask"] = function(callback) {
		sap.ui.getCore().loadLibrary("sap.ui.testlib", "test-resources/sap/ui/core/qunit/testdata/uilib");
		callback();
	};
	window["sap-ui-config"]["themeroots"] = {
		"sap_belize": "foo/bar"
	};

}());
