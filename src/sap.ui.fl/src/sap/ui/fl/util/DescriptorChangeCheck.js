/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/Layer"
], function(
	Layer
) {
	"use strict";

	const SUPPORTED_KEYS_FOR_CHANGE = {
		inbound: "appdescr_app_addNewInbound",
		outbound: "appdescr_app_addNewOutbound"
	};

	function checkObjectProperties(oChangeInOrOutbound, sInOrOutboundName, aMandatoryProperties, aSupportedProperties, oSupportedPropertyPattern) {
		const oSetOfProperties = new Set(Object.keys(oChangeInOrOutbound[sInOrOutboundName]));
		aMandatoryProperties.forEach(function(sMandatoryProperty) {
			if (!oSetOfProperties.has(sMandatoryProperty)) {
				throw new Error(`Mandatory property '${sMandatoryProperty}' is missing. Mandatory properties are ${aMandatoryProperties.join("|")}.`);
			}
		});

		const notSupportedProperties = [];
		oSetOfProperties.forEach(function(sProperty) {
			if (!aSupportedProperties.includes(sProperty)) {
				notSupportedProperties.push(sProperty);
			}
		});
		if (notSupportedProperties.length > 0) {
			throw new Error(`Properties ${notSupportedProperties.join("|")} are not supported. Supported properties are ${aSupportedProperties.join("|")}.`);
		}

		oSetOfProperties.forEach(function(sProperty) {
			if (oSupportedPropertyPattern[sProperty]) {
				const regex = new RegExp(oSupportedPropertyPattern[sProperty]);
				if (!regex.test(oChangeInOrOutbound[sInOrOutboundName][sProperty])) {
					throw new Error(`The property has disallowed values. Supported values for '${sProperty}' should adhere to regular expression ${regex}.`);
				}
			}
		});
	}

	function getAndCheckInOrOutbound(oChangeContent, sKey, aMandatoryProperties, aSupportedProperties, oSupportedPropertyPattern) {
		const aObjectKeyNames = Object.keys(oChangeContent);
		if (aObjectKeyNames.length > 1) {
			throw new Error("It is not allowed to add more than one object under change object 'content'.");
		}
		if (aObjectKeyNames.length < 1) {
			throw new Error(`The change object 'content' cannot be empty. Please provide the necessary property, as outlined in the change schema for '${SUPPORTED_KEYS_FOR_CHANGE[sKey]}'.`);
		}
		const sKeyNameOfChangeContent = aObjectKeyNames[0];
		if (aObjectKeyNames.length === 1) {
			if (!SUPPORTED_KEYS_FOR_CHANGE[sKeyNameOfChangeContent]) {
				throw new Error(`The provided property '${sKeyNameOfChangeContent}' is not supported. Supported property for change '${SUPPORTED_KEYS_FOR_CHANGE[sKey]}' is '${sKey}'.`);
			}
		}
		const aInOrOutbounds = Object.keys(oChangeContent[sKeyNameOfChangeContent]);
		if (aInOrOutbounds.length > 1) {
			throw new Error(`It is not allowed to add more than one ${sKeyNameOfChangeContent}: ${aInOrOutbounds.join(", ")}.`);
		}
		if (aInOrOutbounds.length < 1) {
			throw new Error(`There is no ${sKeyNameOfChangeContent} provided. Please provide an ${sKeyNameOfChangeContent}.`);
		}
		const sInOrOutbound = aInOrOutbounds[0];
		if (sInOrOutbound === "") {
			throw new Error(`The ID of your ${sKeyNameOfChangeContent} is empty.`);
		}
		checkObjectProperties(oChangeContent[sKey], sInOrOutbound, aMandatoryProperties, aSupportedProperties, oSupportedPropertyPattern);
		return aInOrOutbounds[aInOrOutbounds.length - 1];
	}

	function checkChange(oEntityPropertyChange, aSupportedProperties, aSupportedOperations, oSupportedPropertyPattern, aNotAllowedToBeDeleteProperties) {
		const aEntityPropertyChanges = Array.isArray(oEntityPropertyChange) ? oEntityPropertyChange : [oEntityPropertyChange];
		aEntityPropertyChanges.forEach(function(oChange) {
			formatEntityCheck(oChange, aSupportedProperties, aSupportedOperations, aNotAllowedToBeDeleteProperties);
			checkPropertyValuePattern(oChange, oSupportedPropertyPattern);
		});
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

	function formatEntityCheck(oChangeEntity, aSupportedProperties, aSupportedOperations, aNotAllowedToBeDeleteProperties) {
		if (!oChangeEntity.propertyPath) {
			throw new Error("Invalid change format: The mandatory 'propertyPath' is not defined. Please define the mandatory property 'propertyPath'");
		}
		if (!oChangeEntity.operation) {
			throw new Error("Invalid change format: The mandatory 'operation' is not defined. Please define the mandatory property 'operation'");
		}
		const sOpertationUpperCase = oChangeEntity.operation.toUpperCase();
		if (sOpertationUpperCase === "DELETE") {
			if (aNotAllowedToBeDeleteProperties.includes(oChangeEntity.propertyPath)) {
				throw new Error(`The property '${oChangeEntity.propertyPath}' was attempted to be deleted. The mandatory properties ${aNotAllowedToBeDeleteProperties.join("|")} cannot be deleted.`);
			}
			if (oChangeEntity.hasOwnProperty("propertyValue")) {
				throw new Error(`The property 'propertyValue' must not be provided in a 'DELETE' operation. Please remove 'propertyValue'.`);
			}
		}
		if (sOpertationUpperCase !== "DELETE") {
			if (!oChangeEntity.hasOwnProperty("propertyValue")) {
				throw new Error("Invalid change format: The mandatory 'propertyValue' is not defined. Please define the mandatory property 'propertyValue'");
			}

			if (!aSupportedProperties.includes(oChangeEntity.propertyPath) && !isGenericPropertyPathSupported(aSupportedProperties, oChangeEntity.propertyPath)) {
				throw new Error(`Changing ${oChangeEntity.propertyPath} is not supported. The supported 'propertyPath' is: ${aSupportedProperties.join("|")}`);
			}
		}
		if (!aSupportedOperations.includes(sOpertationUpperCase)) {
			throw new Error(`Operation ${sOpertationUpperCase} is not supported. The supported 'operation' is ${aSupportedOperations.join("|")}`);
		}
	}

	/**
	 * Checks the format consistency for change mergers (ChangeDataSource and ChangeInbound)
	 * and other mergers with the prefix "change". The format of a change is valid if it includes the ID as well as <code>entityPropertyChange</code>.
	 *
	 * @param {sap.ui.fl.apply._internal.flexObjects.FlexObject} oChange - Changes to be merged
	 * @param {Array} aSupportedProperties - Array of supported properties by change merger
	 * @param {Array} aSupportedOperations - Array of supported operations by change merger
	 * @param {Object} oSupportedPropertyPattern - Object with supported pattern as regex
	 * @param {Array} aNotAllowedToBeDeleteProperties - Array of properties which must not be deleted by change merger
	 * @private
	 * @ui5-restricted sap.ui.fl, sap.suite.ui.generic.template
	 */
	function checkEntityPropertyChange(oChange, aSupportedProperties, aSupportedOperations, oSupportedPropertyPattern, aNotAllowedToBeDeleteProperties) {
		var sId = Object.keys(oChange).filter(function(sKey) {
			return sKey.endsWith("Id");
		}).shift();
		if (!oChange[sId]) {
			throw new Error(`Mandatory "${sId}" parameter is not provided.`);
		}
		if (!oChange.entityPropertyChange) {
			throw new Error(`Changes for "${oChange[sId]}" are not provided.`);
		}

		checkChange(oChange.entityPropertyChange, aSupportedProperties, aSupportedOperations, oSupportedPropertyPattern, aNotAllowedToBeDeleteProperties);
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
					throw new Error(`Id ${sId} must not start with reserved ${layer_prefixes[sKey]}`);
				}
			});
		} else if (!sId.startsWith(sPrefix)) {
			throw new Error(`Id ${sId} must start with ${sPrefix}`);
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
			throw new Error(`Layer ${sLayer} not supported.`);
		}
		return sPrefix;
	}

	/**
	 * Checks the format consistency for change mergers (ChangeDataSource and ChangeInbound)
	 * and other mergers with the prefix "change". The format of a change is valid if it includes the ID as well as <code>entityPropertyChange</code>.
	 *
	 * @param {sap.ui.fl.apply._internal.flexObjects.FlexObject} oChange - Changes to be merged
	 * @param {object} oSupportedPattern - Object with pattern for limited property values
	 * @private
	 * @ui5-restricted sap.ui.fl, sap.suite.ui.generic.template
	 */
	function checkPropertyValuePattern(oChange, oSupportedPattern) {
		// if no pattern is provided, everything is allowed
		if (!Object.keys(oSupportedPattern).includes(oChange.propertyPath)) { return; }
		if (!oChange.propertyValue.match(oSupportedPattern[oChange.propertyPath])) {
			throw new Error(`Not supported format for propertyPath ${oChange.propertyPath}. ` +
							`The supported pattern is ${oSupportedPattern[oChange.propertyPath]}`);
		}
	}

	return {
		checkEntityPropertyChange,
		checkIdNamespaceCompliance,
		getNamespacePrefixForLayer,
		getClearedGenericPath,
		isGenericPropertyPathSupported,
		getAndCheckInOrOutbound
	};
});
