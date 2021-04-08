/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/base/ManagedObject"
], function (ManagedObject) {
	"use strict";

	/**
	 * Class for storing information about reverting variants.
	 *
	 * @class sap.ui.fl.apply._internal.flexObjects.CompVariantRevertData
	 * @extends sap.ui.base.ManagedObject
	 * @private
	 * @ui5-restricted
	 * @since Since 1.87.0
	 */
	return ManagedObject.extend("sap.ui.fl.apply._internal.flexObjects.CompVariantRevertData", /** @lends sap.ui.fl.apply._internal.flexObjects.CompVariantRevertData */ {
		metadata: {
			properties: {
				type: {type: "string"},
				content: {type: "object"},
				change: {type: "object"}
			}
		}
	});
});