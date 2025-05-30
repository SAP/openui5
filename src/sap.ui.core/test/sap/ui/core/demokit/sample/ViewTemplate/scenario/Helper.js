/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/model/odata/AnnotationHelper"
], function (AnnotationHelper) {
	"use strict";

	// @see sap.ui.core.ID.type: [A-Za-z_][-A-Za-z0-9_.:]*
	// Note: "-" is somehow reserved for composition
	var rBadIdChars = /[^A-Za-z0-9_.:]/g;

	/**
	 * Custom formatter function for complex bindings to demonstrate access to ith part of binding.
	 * Delegates to {@link sap.ui.model.odata.AnnotationHelper#format} and wraps label texts in
	 * square brackets. Joins parts together, separated by a space.
	 *
	 * @param {sap.ui.core.util.XMLPreprocessor.IContext|sap.ui.model.Context} oInterface
	 *   the callback interface related to the current formatter call
	 * @param {...any} [vRawValue]
	 *   the raw value(s) from the meta model
	 * @returns {string}
	 *   the resulting string value to write into the processed XML
	 */
	function formatParts(oInterface, vRawValue) {
		var i, aResult;

		/*
		 * Delegates to {@link sap.ui.model.odata.AnnotationHelper#format} and wraps label texts
		 * in square brackets.
		 *
		 * @param {sap.ui.model.Context} oMyInterface
		 *   the callback interface related to the current formatter call
		 * @param {any} [vRawValue0]
		 *   the raw value from the meta model
		 * @returns {string}
		 */
		function formatLabelValue(oMyInterface, vRawValue0) {
			var sResult = AnnotationHelper.format(oMyInterface, vRawValue0);

			return oMyInterface.getPath().endsWith("/Label")
				? "[" + sResult + "]"
				: sResult;
		}

		try {
			if (oInterface.getModel()) {
				return formatLabelValue(oInterface, vRawValue);
			}
			// root formatter for a composite binding
			aResult = [];
			// "probe for the smallest non-negative integer"
			for (i = 0; oInterface.getModel(i); i += 1) {
				aResult.push(
					// Note: arguments[i + 1] is the raw value of the ith part!
					formatLabelValue(oInterface.getInterface(i), arguments[i + 1])
				);
			}
			return aResult.join(" ");
		} catch (e) {
			return e.message;
		}
	}
	formatParts.requiresIContext = true;

	/**
	 * Custom formatter function to compute an unstable ID from the given interface's path(s).
	 *
	 * @param {sap.ui.core.util.XMLPreprocessor.IContext} oInterface
	 *   the callback interface related to the current formatter call
	 * @returns {string}
	 *   the resulting ID string value to write into the processed XML
	 */
	function id(oInterface) {
		var i,
			sPath = oInterface.getPath(),
			aResult;

		if (sPath) {
			return sPath.replace(rBadIdChars, ".");
		}
		aResult = [];
		// "probe for the smallest non-negative integer"
		for (i = 0; oInterface.getPath(i); i += 1) {
			aResult.push(oInterface.getPath(i).replace(rBadIdChars, "."));
		}
		return aResult.join("::");
	}
	id.requiresIContext = true;

	return {
		formatParts : formatParts,
		id : id
	};
}, /* bExport= */ true);
