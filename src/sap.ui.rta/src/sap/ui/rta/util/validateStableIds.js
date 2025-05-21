/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/util/ObjectPath",
	"sap/ui/rta/util/hasStableId",
	"sap/ui/dt/OverlayUtil",
	"sap/base/util/isPlainObject"
], function(
	ObjectPath,
	hasStableId,
	OverlayUtil,
	isPlainObject
) {
	"use strict";

	function isFioriElementsApp(oComponent) {
		const mManifest = oComponent.getManifest();

		const isV4 = !!ObjectPath.get(["sap.ui5", "dependencies", "libs", "sap.fe.templates"], mManifest);
		const isV2 = !!ObjectPath.get(["sap.ui.generic.app"], mManifest);
		const isOVP = !!ObjectPath.get(["sap.ovp"], mManifest);
		return isV2 || isV4 || isOVP;
	}

	function getFioriElementsExtensions(oComponent) {
		const oManifest = oComponent.getManifest();

		const mViewExtensions = ObjectPath.get(["sap.ui5", "extends", "extensions", "sap.ui.viewExtensions"], oManifest);

		const aViewExtensions = [];

		if (isPlainObject(mViewExtensions)) {
			Object.keys(mViewExtensions).forEach(function(sViewExtensionGroupName) {
				if (sViewExtensionGroupName.startsWith("sap.suite.ui.generic.template")) {
					const mViewExtensionGroup = mViewExtensions[sViewExtensionGroupName];

					Object.keys(mViewExtensionGroup).forEach(function(sViewExtensionName) {
						aViewExtensions.push(mViewExtensionGroup[sViewExtensionName]);
					});
				}
			});
		}

		return aViewExtensions;
	}

	function getExtensionOverlays(aExtensionList, aElementOverlays) {
		const aExtensionOverlays = [];

		for (let i = 0, l = aElementOverlays.length; i < l; i++) {
			const oElementOverlay = aElementOverlays[i];
			const oElement = oElementOverlay.getElement();
			const bIsExtensionOverlay = aExtensionList.some(function(mViewExtension) { // eslint-disable-line no-loop-func
				let sExtensionName;
				let sElementName;

				if (oElement.isA("sap.ui.core.mvc.View")) {
					sElementName = oElement.getViewName();
					sExtensionName = mViewExtension.viewName;
				} else if (oElement.isA("sap.ui.core.Fragment")) {
					sElementName = oElement.getFragmentName();
				} else {
					// viewName/fragmentName are essential for proper element detection
					return false;
				}

				return (
					oElement.isA(mViewExtension.className)
					&& sElementName === sExtensionName
				);
			});

			if (bIsExtensionOverlay) {
				aExtensionOverlays.push(oElementOverlay);

				// When all overlays for all extensions are found, we can stop search
				if (aExtensionOverlays.length === aExtensionList.length) {
					break;
				}
			}
		}

		const aRelevantOverlays = [];

		aExtensionOverlays.forEach(function(oElementOverlay) {
			OverlayUtil.iterateOverlayElementTree(oElementOverlay, function(oElementOverlay) {
				aRelevantOverlays.push(oElementOverlay);
			});
		});

		return aRelevantOverlays;
	}

	return function(aElementOverlays, oComponent) {
		let aRelevantOverlays = aElementOverlays.slice(0);

		if (isFioriElementsApp(oComponent)) {
			const aExtensionList = getFioriElementsExtensions(oComponent);

			aRelevantOverlays = (
				aExtensionList.length
					? getExtensionOverlays(aExtensionList, aRelevantOverlays)
					: [] // If this is a Fiori Elements application and there are no extensions, then we have nothing to check
			);
		}

		return aRelevantOverlays.filter(function(oElementOverlay) {
			return (
				!oElementOverlay.getDesignTimeMetadata().markedAsNotAdaptable()
				&& !hasStableId(oElementOverlay)
			);
		});
	};
});