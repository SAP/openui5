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
	 * @class
	 * @extends sap.ui.base.ManagedObject
	 * @alias sap.ui.fl.apply._internal.flexObjects.RevertData
	 * @private
	 * @ui5-restricted
	 * @since 1.90.0
	 */
	return ManagedObject.extend("sap.ui.fl.apply._internal.flexObjects.RevertData", {
		metadata: {
			properties: {
				type: {type: "string"},
				content: {type: "object"}
			}
		}
	});
});