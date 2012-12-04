/*
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */
jQuery.sap.declare("sap.m.SelectCustom");

(function(sap) {
	var sPath = "sap.ui.thirdparty.mobiscroll.",
		sCSSPath = sPath + "css";

	sap.require(sPath + "js.mobiscroll-core");
	sap.require(sPath + "js.mobiscroll-select");
	sap.includeStyleSheet(sap.getModulePath(sCSSPath, "/") + "mobiscroll-core.css");
	sap.includeStyleSheet(sap.getModulePath(sCSSPath, "/") + "mobiscroll-animation.css");
	sap.includeStyleSheet(sap.getModulePath(sCSSPath, "/") + "mobiscroll-android-ics.css");
})(jQuery.sap);