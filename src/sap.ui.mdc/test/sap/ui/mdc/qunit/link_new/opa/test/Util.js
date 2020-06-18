/*
 * ! ${copyright}
 */

/**
 * @namespace Provides utitlity functions for OPA tests
 * @name sap.ui.mdc.qunit.link.opa.test.Util
 * @author SAP SE
 * @version ${version}
 * @private
 * @since 1.30.0
 */
sap.ui.define([
	'sap/ui/base/Object', 'sap/m/library'
], function(BaseObject, MLibrary) {
	"use strict";

	var Util = BaseObject.extend("sap.ui.mdc.qunit.link.opa.test.Util", /** @lends sap.ui.mdc.qunit.link.opa.test.Util */
	{});

	Util.getTextFromResourceBundle = function(sLibraryName, sTextKey) {
		var oCore = sap.ui.test.Opa5.getWindow().sap.ui.getCore();
		return oCore.getLibraryResourceBundle(sLibraryName).getText(sTextKey);
	};

	return Util;
}, /* bExport= */true);
