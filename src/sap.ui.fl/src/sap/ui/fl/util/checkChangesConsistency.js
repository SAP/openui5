/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/util/includes"
], function(
	includes
) {
	"use strict";

	function checkChange(oEntityPropertyChange, aSupportedProperties, aSupportedOperations) {
		if (Array.isArray(oEntityPropertyChange)) {
			oEntityPropertyChange.forEach(function (change) {
				formatEntityCheck(change, aSupportedProperties, aSupportedOperations);
			});
		} else {
			formatEntityCheck(oEntityPropertyChange, aSupportedProperties, aSupportedOperations);
		}
	}

	function formatEntityCheck(oChangeEntity, aSupportedProperties, aSupportedOperations) {
		if (!oChangeEntity.propertyPath) {
			throw new Error("Invalid change format: The mandatory 'propertyPath' is not defined. Please define the mandatory property 'propertyPath'");
		}
		if (!oChangeEntity.operation) {
			throw new Error("Invalid change format: The mandatory 'operation' is not defined. Please define the mandatory property 'operation'");
		}
		if (!oChangeEntity.propertyValue) {
			throw new Error("Invalid change format: The mandatory 'propertyValue' is not defined. Please define the mandatory property 'propertyValue'");
		}
		if (!includes(aSupportedProperties, oChangeEntity.propertyPath)) {
			throw new Error("Changing " + oChangeEntity.propertyPath + " is not supported. The supported 'propertyPath' is: " + aSupportedProperties.join("|"));
		}
		if (!includes(aSupportedOperations, oChangeEntity.operation)) {
			throw new Error("Operation " + oChangeEntity.operation + " is not supported. The supported 'operation' is " + aSupportedOperations.join("|"));
		}
	}

	/**
	 * Use to check format consistency for change mergers (ChangeDataSource and ChangeInbound)
	 * and others mergers with prefix "change". Valid format of the Change should include ID and entityPropertyChange.
	 *
	 * @param {Object} oChange - changes to be merged
	 * @param {Array} aSupportedProperties - array of supported properties by change merger
	 * @param {Array} aSupportedOperations - array of supported operations by change merger
	 * @ui5-restricted sap.ui.fl
	 */
	return function (oChange, aSupportedProperties, aSupportedOperations) {
		var id = Object.keys(oChange).filter(function (key) {
			return key.endsWith("Id");
		}).shift();
		if (!oChange[id]) {
			throw new Error("Mandatory \"" + id + "\" parameter is not provided.");
		}
		if (!oChange.entityPropertyChange) {
			throw new Error("Changes for \"" + oChange[id] + "\" are not provided.");
		}

		checkChange(oChange.entityPropertyChange, aSupportedProperties, aSupportedOperations);
	};
});
