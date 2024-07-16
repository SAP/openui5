// Note: the HTML page 'Localization_HeapUsage.html' loads this module via data-sap-ui-on-init

sap.ui.define([
	"sap/base/i18n/ResourceBundle"
], function(ResourceBundle) {
	"use strict";
	var data = [];
	var sLocale = new URLSearchParams(window.location.search).get("sap-language") ?? "en";

	function loadi18n(lib) {
		return ResourceBundle.create({
			bundleName: lib + ".messagebundle",
			locale: sLocale
		});
	}

	// try to enforce code compilation
	for ( var i = 0; i < 10; i++ ) {
		ResourceBundle._getPropertiesCache().clear();
		loadi18n('sap.m');
	}

	document.getElementById("readall").addEventListener("click", function() {

		ResourceBundle._getPropertiesCache().clear();

		// the following libs represents a typical set of libraries used in a Fiori environment

		// ---- openui5
		data.push( loadi18n('sap.ui.core') ) ;
		data.push( loadi18n('sap.ui.layout') ) ;
		data.push( loadi18n('sap.ui.unified') ) ;
		data.push( loadi18n('sap.f') ) ;
		data.push( loadi18n('sap.m') ) ;
		data.push( loadi18n('sap.ui.table') ) ;
		data.push( loadi18n('sap.uxap') ) ;

		// ---- outside openui5 ---
		data.push( loadi18n('sap.ui.comp') ) ;
		data.push( loadi18n('sap.suite.ui.microchart') ) ;
		data.push( loadi18n('sap.ui.generic.app') ) ;
		//data.push( loadi18n('sap.ui.generic.template') ) ; // no texts currently

	});
});