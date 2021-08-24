/*
* ! ${copyright}
*/
sap.ui.define([
], function() {
	"use strict";

    var oMDCBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc");
    //var oMBundle = sap.ui.getCore().getLibraryResourceBundle("sap.m");

	var Util = {

        texts: {
            go: oMDCBundle.getText("filterbar.GO")
        },

        icons: {
            decline: "sap-icon://decline",
            valueHelp: "sap-icon://value-help"
        }

    };

	return Util;
});
