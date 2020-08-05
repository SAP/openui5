(function() {
	"use strict";

	window["sap-ui-config"] = {
		theme : "fantasy",
		language : "klingon",
		accessibility : true,
		animation : false,
		rtl : true,
		debug : true,
		noConflict : true,
		trace : true,
		libs : "sap.m",
		modules : "sap.m.Button",
		areas : "area-51,no-go",
		onInit : function() { window["I was here"] = "u.g.a.d.m.k."; },
		ignoreUrlParams : true
	};

}());