/*!
 * ${copyright}
 */

/**
 * @namespace Provides utility functions for OPA tests
 * @name sap.ui.mdc.qunit.link.opa.test.Util
 * @author SAP SE
 * @version ${version}
 * @private
 * @since 1.30.0
 */
sap.ui.define([
	'sap/ui/base/Object', 'sap/m/library', 'sap/ui/core/Lib'
], function(BaseObject, MLibrary, Library) {
	"use strict";

	const Util = BaseObject.extend("sap.ui.mdc.qunit.link.opa.test.Util", /** @lends sap.ui.mdc.qunit.link.opa.test.Util.prototype */
	{});

	Util.getTextFromResourceBundle = function(sLibraryName, sTextKey) {
		return Library.getResourceBundleFor(sLibraryName).getText(sTextKey);
	};

	return Util;
});
