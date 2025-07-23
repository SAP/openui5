/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/base/BindingInfo",
	"sap/ui/base/ManagedObject",
	"sap/ui/fl/Utils"
], function(
	BindingInfo,
	ManagedObject,
	FlUtils
) {
	"use strict";

	// Helper class to resolve bindings
	var HelperControl = ManagedObject.extend("sap.ui.rta.util.changeVisualization.HelperControl", {
		metadata: {
			library: "sap.ui.rta",
			properties: {
				resolved: {
					type: "any"
				}
			}
		}
	});

	/**
	 * Resolves bindings synchronously by copying model and binding context information
	 * from a given reference control.
	 *
	 * @param {object|string} vValue - Binding string or binding object
	 * @param {sap.ui.core.Control} oReferenceControl - Control to copy binding information from
	 * @returns {any} - Resolved value
	 *
	 * @function
	 * @author SAP SE
	 * @version ${version}
	 * @alias sap.ui.rta.util.ChangeVisualization.resolveBinding
	 * @since 1.140
	 * @private
	 * @ui5-restricted sap.ui.rta
	 */
	return function(vValue, oReferenceControl) {
		const oView = FlUtils.getViewForControl(oReferenceControl);
		const oController = oView && oView.getController();
		if (!FlUtils.isBinding(vValue, oController)) {
			return undefined;
		}
		const oBindingInfo = typeof vValue === "string"
			? BindingInfo.parse(vValue, oController)
			: { ...vValue };

		if (!oBindingInfo) {
			return undefined;
		}

		const oHelperControl = new HelperControl();

		const aParts = oBindingInfo.parts || [oBindingInfo];
		aParts.forEach(function(oBindingPart) {
			const sModelName = oBindingPart.model;
			if (sModelName) {
				oHelperControl.setModel(oReferenceControl.getModel(sModelName), sModelName);
				oHelperControl.setBindingContext(oReferenceControl.getBindingContext(sModelName), sModelName);
			} else {
				oHelperControl.setModel(oReferenceControl.getModel());
				oHelperControl.setBindingContext(oReferenceControl.getBindingContext());
			}
		});

		oHelperControl.bindProperty("resolved", oBindingInfo);
		const vResolvedValue = oHelperControl.getResolved();
		oHelperControl.destroy();

		return vResolvedValue;
	};
});
