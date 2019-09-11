/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/util/ObjectPath",
	"sap/ui/rta/util/hasStableId",
	"sap/ui/core/mvc/View",
	"sap/ui/core/Fragment",
	"sap/ui/dt/OverlayUtil",
	"sap/base/util/isPlainObject"
], function (
	ObjectPath,
	hasStableId,
	View,
	Fragment,
	OverlayUtil,
	isPlainObject
) {
	"use strict";

	function isFioriElementsApp(oComponent) {
		var oManifest = oComponent.getManifest();

		return ObjectPath.get(["sap.ui.generic.app"], oManifest);
	}

	function getFioriElementsExtensions(oComponent) {
		var oManifest = oComponent.getManifest();

		var mViewExtensions = ObjectPath.get(["sap.ui5", "extends", "extensions", "sap.ui.viewExtensions"], oManifest);

		var aViewExtensions = [];

		if (isPlainObject(mViewExtensions)) {
			Object.keys(mViewExtensions).forEach(function (sViewExtensionGroupName) {
				if (sViewExtensionGroupName.startsWith("sap.suite.ui.generic.template")) {
					var mViewExtensionGroup = mViewExtensions[sViewExtensionGroupName];

					Object.keys(mViewExtensionGroup).forEach(function (sViewExtensionName) {
						aViewExtensions.push(mViewExtensionGroup[sViewExtensionName]);
					});
				}
			});
		}

		return aViewExtensions;
	}

	function getExtensionOverlays(aExtensionList, aElementOverlays) {
		var aExtensionOverlays = [];

		for (var i = 0, l = aElementOverlays.length; i < l; i++) {
			var oElementOverlay = aElementOverlays[i];
			var oElement = oElementOverlay.getElement();
			var bIsExtensionOverlay = aExtensionList.some(function (mViewExtension) { // eslint-disable-line no-loop-func
				var ClassDeclaration = ObjectPath.get(mViewExtension.className);
				var sExtensionName;
				var sElementName;

				if (oElement instanceof View) {
					sElementName = oElement.getViewName();
					sExtensionName = mViewExtension.viewName;
				} else if (oElement instanceof Fragment) {
					sElementName = oElement.getFragmentName();
				} else {
					// viewName/fragmentName are essential for proper element detection
					return false;
				}

				return (
					oElement instanceof ClassDeclaration
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

		var aRelevantOverlays = [];

		aExtensionOverlays.forEach(function (oElementOverlay) {
			OverlayUtil.iterateOverlayElementTree(oElementOverlay, function (oElementOverlay) {
				aRelevantOverlays.push(oElementOverlay);
			});
		});

		return aRelevantOverlays;
	}

	return function (aElementOverlays, oComponent) {
		var aResult = [];

		var aRelevantOverlays = aElementOverlays.slice(0);

		if (isFioriElementsApp(oComponent)) {
			var aExtensionList = getFioriElementsExtensions(oComponent);

			aRelevantOverlays = (
				aExtensionList.length
					? getExtensionOverlays(aExtensionList, aRelevantOverlays)
					: [] // If this is a Fiori Elements application and there are no extensions, then we have nothing to check
			);
		}

		aResult = aRelevantOverlays.filter(function (oElementOverlay) {
			return (
				!oElementOverlay.getDesignTimeMetadata().markedAsNotAdaptable()
				&& !hasStableId(oElementOverlay)
			);
		});

		return aResult;
	};
});