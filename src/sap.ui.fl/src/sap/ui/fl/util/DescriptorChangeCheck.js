/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/util/includes",
	"sap/ui/fl/Layer"
], function(
	includes,
	Layer
) {
	"use strict";

	function checkChange(oEntityPropertyChange, aSupportedProperties, aSupportedOperations) {
		if (Array.isArray(oEntityPropertyChange)) {
			oEntityPropertyChange.forEach(function(change) {
				formatEntityCheck(change, aSupportedProperties, aSupportedOperations);
			});
		} else {
			formatEntityCheck(oEntityPropertyChange, aSupportedProperties, aSupportedOperations);
		}
	}

	/**
	 * This method is especially for entity property changes.
	 * Returns an array that has only cleared generic paths.
	 * Generic paths are paths which end with /*. This ending will be removed from the paths.
	 * @param {Array} aSupportedProperties - Array of supported properties by change merger
	 * @returns {Array} Only cleared generic paths
	 */
	function getClearedGenericPath(aSupportedProperties) {
		var aPropertiesClearedGenericPath = [];
		var aPropertiesWithGenericPath = aSupportedProperties.filter(function(sProperty) {
			return sProperty.endsWith("/*");
		});

		aPropertiesWithGenericPath.forEach(function(sProperty) {
			var sClearedProperty = sProperty.replaceAll("/*", "");
			if (sClearedProperty) {
				aPropertiesClearedGenericPath.push(sClearedProperty);
			}
		});
		return aPropertiesClearedGenericPath;
	}

	/**
	 * This method is especially for entity property changes.
	 * Iterates through the array which has cleared generic paths and checks whether these paths start with sPropertyPath.
	 * If this is the case then true will be returned otherwise false.
	 * @param {Array} aSupportedProperties - Array of supported properties by change merger
	 * @param {string} sPropertyPath - Path to the property
	 * @returns {boolean} Property Path is supported or is not supported
	 */
	function isGenericPropertyPathSupported(aSupportedProperties, sPropertyPath) {
		var aClearedGenericPath = getClearedGenericPath(aSupportedProperties);
		return aClearedGenericPath.some(function(path) {
			return sPropertyPath.startsWith(path);
		});
	}

	function formatEntityCheck(oChangeEntity, aSupportedProperties, aSupportedOperations) {
		if (!oChangeEntity.propertyPath) {
			throw new Error("Invalid change format: The mandatory 'propertyPath' is not defined. Please define the mandatory property 'propertyPath'");
		}
		if (!oChangeEntity.operation) {
			throw new Error("Invalid change format: The mandatory 'operation' is not defined. Please define the mandatory property 'operation'");
		}
		if (oChangeEntity.operation.toUpperCase() !== "DELETE") {
			if (!oChangeEntity.hasOwnProperty("propertyValue")) {
				throw new Error("Invalid change format: The mandatory 'propertyValue' is not defined. Please define the mandatory property 'propertyValue'");
			}
		}
		if (!includes(aSupportedProperties, oChangeEntity.propertyPath) && !isGenericPropertyPathSupported(aSupportedProperties, oChangeEntity.propertyPath)) {
			throw new Error("Changing " + oChangeEntity.propertyPath + " is not supported. The supported 'propertyPath' is: " + aSupportedProperties.join("|"));
		}
		if (!includes(aSupportedOperations, oChangeEntity.operation)) {
			throw new Error("Operation " + oChangeEntity.operation + " is not supported. The supported 'operation' is " + aSupportedOperations.join("|"));
		}
	}

	/**
	 * Checks the format consistency for change mergers (ChangeDataSource and ChangeInbound)
	 * and other mergers with the prefix "change". The format of a change is valid if it includes the ID as well as <code>entityPropertyChange</code>.
	 *
	 * @param {sap.ui.fl.apply._internal.flexObjects.FlexObject} oChange - Changes to be merged
	 * @param {Array} aSupportedProperties - Array of supported properties by change merger
	 * @param {Array} aSupportedOperations - Array of supported operations by change merger
	 * @private
	 * @ui5-restricted sap.ui.fl, sap.suite.ui.generic.template
	 */
	function checkEntityPropertyChange(oChange, aSupportedProperties, aSupportedOperations) {
		var id = Object.keys(oChange).filter(function(key) {
			return key.endsWith("Id");
		}).shift();
		if (!oChange[id]) {
			throw new Error("Mandatory \"" + id + "\" parameter is not provided.");
		}
		if (!oChange.entityPropertyChange) {
			throw new Error("Changes for \"" + oChange[id] + "\" are not provided.");
		}

		checkChange(oChange.entityPropertyChange, aSupportedProperties, aSupportedOperations);
	}

	var layer_prefixes = {};
	layer_prefixes[Layer.CUSTOMER] = "customer.";
	layer_prefixes[Layer.CUSTOMER_BASE] = "customer.";
	layer_prefixes[Layer.PARTNER] = "partner.";
	layer_prefixes[Layer.VENDOR] = null;

	/**
	 * Checks the namespace compliance of an ID for a given change.
	 * The target layer is derived from the change.
	 * @param {string} sId - The ID to check
	 * @param {sap.ui.fl.apply._internal.flexObjects.FlexObject} oChange - The change from where to derive the layer
	 * @private
	 * @ui5-restricted sap.ui.fl, sap.suite.ui.generic.template
	 */
	function checkIdNamespaceCompliance(sId, oChange) {
		var sLayer = oChange.getLayer();
		if (!sLayer) {
			throw new Error("Mandatory layer parameter is not provided.");
		}
		var sPrefix = getNamespacePrefixForLayer(sLayer);

		if (sPrefix === null) {
			Object.keys(layer_prefixes).forEach(function(sKey) {
				if (layer_prefixes[sKey] && sId.startsWith(layer_prefixes[sKey])) {
					throw new Error("Id " + sId + " must not start with reserved " + layer_prefixes[sKey]);
				}
			});
		} else if (!sId.startsWith(sPrefix)) {
			throw new Error("Id " + sId + " must start with " + sPrefix);
		}
	}

	/**
	 * Returns the namespace prefix to be used for the given layer.
	 * Null means no prefix must be used.
	 * @param {string} sLayer - The target layer
	 * @returns {string|null} The prefix to be used. null means there must not be a prefix
	 */
	function getNamespacePrefixForLayer(sLayer) {
		var sPrefix = layer_prefixes[sLayer];
		if (sPrefix === undefined) {
			throw new Error("Layer " + sLayer + " not supported.");
		}
		return sPrefix;
	}

	return {
		checkEntityPropertyChange: checkEntityPropertyChange,
		checkIdNamespaceCompliance: checkIdNamespaceCompliance,
		getNamespacePrefixForLayer: getNamespacePrefixForLayer,
		getClearedGenericPath: getClearedGenericPath,
		isGenericPropertyPathSupported: isGenericPropertyPathSupported
	};
});
