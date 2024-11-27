/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/base/util/deepEqual"
], (
	Log,
	deepEqual
) => {
	"use strict";

	const MANDATORY_PROPERTIES = {
		"dataType": "dataType",
		"dataTypeConstraints": "constraints",
		"dataTypeFormatOptions": "formatOptions",
		"label": "label",
		"maxConditions": "maxConditions"
	};

	/**
	 * Provides validation functionality for property info and related controls.
	 * @namespace
	 * @author SAP SE
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 * @since 1.131
	 * @alias sap.ui.mdc.filterbar.PropertyInfoValidator
	 */
	const PropertyInfoValidator = {};

	PropertyInfoValidator._getPropertyInfoPropertyName = function(sPropertyName) {
		return MANDATORY_PROPERTIES[sPropertyName] ?? sPropertyName;
	};

	PropertyInfoValidator._getPropertyNameFromPropertyInfo = function(sPropertyNameInPropertyInfo) {
		const aEntries = Object.entries(MANDATORY_PROPERTIES).filter(([key, value]) => {
			return value === sPropertyNameInPropertyInfo;
		});
		if (aEntries.length === 0) {
			return sPropertyNameInPropertyInfo;
		}

		const [ aEntry ] = aEntries;
		const [ key ] = aEntry;

		return key;
	};

	/**
	 * Checks if property with given name <code>sPropertyName</code> exists on given <code>Control</code> and if the value of that property is not initial.
	 * If the property is not set on the given <code>Control</code> an error is logged.
	 * @param {sap.ui.mdc.Control} oControl Control instance to be checked.
	 * @param {string} sPropertyName Name of the property that is checked.
	 * @returns {boolean} Whether the property is set.
	 */
	PropertyInfoValidator.checkMandatoryProperty = (oControl, sPropertyName) => {
		if (!oControl || !sPropertyName) {
			Log.warning(`sap.ui.mdc.util.PropertyInfoValidator:checkMandatoryProperty either Control or property name are not defined.`);
			return false;
		}

		if (oControl.isPropertyInitial(sPropertyName)) {
			return false;
		}

		const vPropertyValue = oControl.getProperty(sPropertyName);
		if ((vPropertyValue === undefined || vPropertyValue === null || vPropertyValue === "")) {
			Log.error(`sap.ui.mdc.util.PropertyInfoValidator: Control '${oControl.getId()}' is missing mandatory property '${sPropertyName}'`);
			return false;
		}

		return true;
	};

	/**
	 * Checks if given <code>aProperties</code> exist on given <code>Control</code> and if the value of a property is not initial.
	 * If the property is not set on the given <code>Control</code> an error is logged.
	 * @param {sap.ui.mdc.Control} oControl Control instance to be checked.
	 * @returns {boolean} Whether all properties are set.
	 */
	PropertyInfoValidator.checkMandatoryProperties = (oControl) => {
		const aProperties = Object.keys(MANDATORY_PROPERTIES);
		let bHasAllMandatoryProperties = true;

		for (const sPropertyName of aProperties) {
			if (!PropertyInfoValidator.checkMandatoryProperty(oControl, sPropertyName)) {
				bHasAllMandatoryProperties = false;
			}
		}

		return bHasAllMandatoryProperties;
	};

	/**
	 * Checks if all defined properties in <code>oPropertyInfo</code> are NOT initial on the given <code>Control</code>.
	 * @param {sap.ui.mdc.Control} oControl Control instance to be checked.
	 * @param {object} oPropertyInfo Property Info object to be checked.
	 * @returns {void}
	 */
	PropertyInfoValidator.comparePropertyInfoWithControl = (oControl, oPropertyInfo) => {
		if (!oControl || !oPropertyInfo) {
			return;
		}

		const aIgnoredKeys = [
			"name", "key", "group", "groupLabel"
		];
		const aPropertyInfoProperties = Object.keys(oPropertyInfo).filter((sKey) => {
			return !aIgnoredKeys.includes(sKey);
		});

		if (!aPropertyInfoProperties.length) {
			return;
		}

		const aDefinedPropertiesOnControl = aPropertyInfoProperties.filter((sPropertyName) => {
			const sTranslatedPropertyName = PropertyInfoValidator._getPropertyNameFromPropertyInfo(sPropertyName) ?? sPropertyName;
			return !oControl.isPropertyInitial(sTranslatedPropertyName);
		});

		if (aPropertyInfoProperties.length > aDefinedPropertiesOnControl.length) {
			Log.error(`sap.ui.mdc.util.PropertyInfoValidator: the propertyInfo for Control '${oControl.getId()}' contains more information than the control itself!`);
		}
	};

	/**
	 * Checks if mandatory properties are set on the given <code>Control</code>.
	 * If a certain property is not set on the <code>Control</code> and it's set on the given <code>oPropertyInfo</code>, it is overriden by the value in the <code>oPropertyInfo</code>.
	 * If a certain property is set on the <code>Control</code> and it's also set on the given <code>oPropertyInfo</code>, both are compared. If they are not equal an error is logged.
	 * @param {sap.ui.mdc.Control} oControl Control instance to be checked.
	 * @param {object} oPropertyInfo Property Info object to be compared to.
	 * @returns {void}
	 */
	PropertyInfoValidator.compareControlWithPropertyInfo = (oControl, oPropertyInfo) => {
		if (!oControl || !oPropertyInfo) {
			return;
		}
		const aProperties = [ ...Object.keys(MANDATORY_PROPERTIES), "required" ];

		for (const sPropertyName of aProperties) {
			const bHasMandatoryProperty = PropertyInfoValidator.checkMandatoryProperty(oControl, sPropertyName);
			const sMappedPropertyName = PropertyInfoValidator._getPropertyInfoPropertyName(sPropertyName) ?? sPropertyName;
			if (!bHasMandatoryProperty) { // when property is not set in Control we set it to value of property info
				// check if property is set in property info, if it's a boolean we take it as is, if not we just take the value
				if (oPropertyInfo.hasOwnProperty(sMappedPropertyName) && (typeof oPropertyInfo[sMappedPropertyName] === "boolean" || oPropertyInfo[sMappedPropertyName])) {
					oControl.setProperty(sPropertyName, oPropertyInfo[sMappedPropertyName]);
				}
				continue;
			}
			if (bHasMandatoryProperty && oPropertyInfo.hasOwnProperty(sMappedPropertyName)) {
				const vPropertyValueInPropertyInfo = oPropertyInfo[sMappedPropertyName],
					vPropertyValueInFilterField = oControl.getProperty(sPropertyName);

					const bEqualValues = vPropertyValueInPropertyInfo === vPropertyValueInFilterField || deepEqual(vPropertyValueInPropertyInfo, vPropertyValueInFilterField);
					if (!bEqualValues) {
						Log.error(`sap.ui.mdc.util.PropertyInfoValidator: Control '${oControl.getId()}' with mandatory property '${sPropertyName}' has a different value for property '${sMappedPropertyName}' in given 'propertyInfo'!`);
					}
			}
		}
	};

	return PropertyInfoValidator;

});