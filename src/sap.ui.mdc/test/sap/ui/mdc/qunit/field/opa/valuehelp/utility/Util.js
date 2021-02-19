/*
 * ! ${copyright}
 */

/**
 * @namespace Provides utitlity functions for OPA tests
 * @name sap.ui.mdc.qunit.p13n.OpaTests.utility.Util
 * @author SAP SE
 * @version ${version}
 * @private
 * @since 1.30.0
 */
sap.ui.define([
	'sap/ui/base/Object',
	'sap/ui/core/Core'
], function(BaseObject, Core) {
	"use strict";

	var Util = {};

	Util.getTextFromResourceBundle = function(sLibraryName, sTextKey, iCount) {
		return Core.getLibraryResourceBundle(sLibraryName).getText(sTextKey, iCount);
	};

	return Util;
}, /* bExport= */true);
