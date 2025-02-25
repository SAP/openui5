/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/Utils"
], function(Utils) {
	"use strict";

	/**
		* Returns <code>true</code> if the given component is found in the component
		* usages of the app component manifest.
		*
		* @param {sap.ui.core.Component} oComponent - Component instance
		* @returns {boolean} <code>true</code> if the given component is a reuse component
		*/
	function isReuseComponent(oComponent) {
		if (!oComponent) {
			return false;
		}

		const oAppComponent = Utils.getAppComponentForControl(oComponent);
		if (!oAppComponent) {
			return false;
		}

		const oManifest = oComponent.getManifest();
		const oAppManifest = oAppComponent.getManifest();
		const sComponentName = oManifest?.["sap.app"]?.id;

		// Look for component name in component usages of app component manifest
		const oComponentUsages = oAppManifest?.["sap.ui5"]?.componentUsages;
		return Object.values(oComponentUsages || {}).some((oComponentUsage) => {
			if (oComponentUsage.name === sComponentName) {
				return true;
			}
			return false;
		});
	}

	return isReuseComponent;
});