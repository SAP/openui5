/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/support/_internal/extractChangeDependencies",
	"sap/ui/fl/Utils"
], function(
	extractChangeDependencies,
	Utils
) {
	"use strict";

	/**
	 * Provides an object with the changes for the current application as well as
	 * further information. I.e. if the changes were applied and their dependencies.
	 *
	 * @namespace sap.ui.fl.support._internal.getChangeDependencies
	 * @since 1.98
	 * @version ${version}
	 * @private
	 * @ui5-restricted sap.ui.fl.support.api.SupportAPI
	 */

	function getChangeDependencies(oCurrentAppContainerObject) {
		var oAppComponent = oCurrentAppContainerObject.oContainer.getComponentInstance();
		return extractChangeDependencies(oAppComponent);
	}

	return async function(oAppComponent) {
		// in most scenarios the appComponent will already be passed, but in iFrame cases (like cFLP) the appComponent is not available
		// outside of the iFrame. In this case the function is called from inside the iFrame and has to fetch the appComponent
		if (!oAppComponent) {
			const oAppLifeCycleService = await Utils.getUShellService("AppLifeCycle");
			return getChangeDependencies(oAppLifeCycleService.getCurrentApplication().componentInstance);
		}
		return getChangeDependencies(oAppComponent);
	};
});
