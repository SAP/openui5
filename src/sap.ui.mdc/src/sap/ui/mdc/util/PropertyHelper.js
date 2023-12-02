/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/base/Object",
	"sap/ui/base/DataType",
	"sap/base/util/merge",
	"sap/base/util/isPlainObject",
	"sap/base/Log",
	"sap/ui/core/Lib"
], (
	BaseObject,
	DataType,
	merge,
	isPlainObject,
	Log,
	Lib
) => {
	"use strict";

	/*global Set, WeakMap */

	/**
	 * @typedef {object} sap.ui.mdc.util.PropertyInfo
	 *
	 * An object literal describing a data property.
	 *
	 * @property {string} name
	 *   Unique, stable key for the property. It must only contain characters allowed for IDs, see {@link sap.ui.core.ID}. Does not have to be an
	 *   existing attribute in the data model or the technical name of an attribute in the data model.
	 * @property {string} [path]
	 *   The technical path for a data source property.
	 * @property {string} label
	 *   Translatable text that labels the property.
	 * @property {string} [tooltip]
	 *   Translatable text that can optionally be offered as tooltip (For example in a personalization dialog).
	 * @property {boolean} [visible=true]
	 *   Whether the property is or can be visible to a user.
	 * @property {int} [maxConditions]
	 *   Defines the maximum number of filter conditions for the property. Possible values that can be used:
	 *   <ul>
	 *     <li>1 is a single-filter expression field</li>
	 *     <li>-1 is a multi-filter expression field</li>
	 *   </ul>
	 *   This information is, for example, used in the <code>addItem</code> method of the <code>FilterBar</code> control to forward this information to
	 *   the created <code>FilterField</code> instance.
	 * @property {string} dataType
	 *   The name of the data type
	 * @property {object} [formatOptions]
	 *   Defines the format options for the data type
	 * @property {object} [constraints]
	 * Defines the constraints for the data type
	 * @property {string} [group]
	 *   Key of the group the property is inside. Used to visually group properties in personalization dialogs.
	 * @property {string} [groupLabel]
	 *   Translatable text of the group.
	 * @property {boolean} [caseSensitive=true]
	 *   Whether filtering by this property is case-sensitive.
	 *
	 * @public
	 */

	/*
	 * Key-value map to define the characteristics of a property attribute, where the key is the name of the attribute.
	 *
	 * Metadata information:
	 * - type
	 * 	   Can be any type that is also allowed for a control property, plus "PropertyReference" for references to simple properties.
	 *     Complex types can be specified with an object that describes sub-attributes.
	 *     Examples: "string", "string[]", "sap.ui.mdc.MyEnum", "any", "PropertyReference",
	 *               {
	 *                   subAttribute: {
	 *  				     type: "string",
	 * 					     default: {
	 *                           value: "myDefaultValue"
	 *                       }
	 *                   }
	 *                   ...
	 *               }
	 * - mandatory (optional, default=false, only for top-level attribute)
	 *     Whether this attribute must be provided.
	 * - default (optional, type: Object)
	 *     Specifies the default value
	 * 	   - value
	 * 	   	   This can either be a value, or a reference to another attribute in the form "attribute:x", with x being the name of the other
	 *     	   attribute. The default value of this attribute is then the value of the other attribute. This works only one level deep.
	 *     	   Examples: "attribute:name", "attribute:attributeName.subAttributeName"
	 *     - ignoreIfNull (optional, default=false)
	 *     	   Prevents setting the default value for this attribute if set to <code>true</code>.
	 * 	       Defines the entire attribute as <code>null</code> if the attribute value itself is from type <code>null</code>.
	 * - forComplexProperty (optional, type: Object}
	 *     Settings that take effect if the property is complex.
	 *     - allowed (optional, default=false)
	 *         Whether it is allowed to provide this attribute.
	 *     - valueIfNotAllowed (optional)
	 *         An attribute that is not allowed will get this value.
	 *     - propagateAllowance (optional, default=true)
	 *         Whether the value of 'allowed' is propagated to all sub-attributes.
	 */
	const mAttributeMetadata = { // TODO: reserve reference attributes, e.g. unit -> unitProperty
		// Common
		name: { // Unique key
			type: "string",
			mandatory: true,
			forComplexProperty: {
				allowed: true
			}
		},
		label: { // Translatable text describing the property.
			type: "string",
			mandatory: true,
			forComplexProperty: {
				allowed: true
			}
		},
		tooltip: { // Translatable text describing additional information in the property to be displayed in a tooltip.
			type: "string",
			forComplexProperty: {
				allowed: true
			}
		},
		visible: { // Whether the property is visible in the "Items" personalization.
			type: "boolean",
			"default": {
				value: true
			},
			forComplexProperty: {
				allowed: true
			}
		},
		path: { // The technical path for a data source property.
			type: "string"
		},
		dataType: {
			type: "string", // The name of a subclass of sap.ui.model.SimpleType, e.g. "sap.ui.model.type.String".
			mandatory: true
		},
		formatOptions: {
			type: "object"
		},
		constraints: {
			type: "object"
		},
		// TODO: Used in odata.v4.util.DelegateUtil.getParametersInfo, which is used by FE. DelegateUtil is private, though.
		maxConditions: {
			type: "int",
			"default": {
				value: -1
			}
		},
		caseSensitive: {
			type: "boolean",
			"default": {
				value: true
			}
		},
		group: { // Key of the group the property is inside. Used to visually group properties in personalization dialogs.
			type: "string",
			forComplexProperty: {
				allowed: true
			}
		},
		groupLabel: { // Translatable text of the group.
			type: "string",
			forComplexProperty: {
				allowed: true
			}
		},

		// Enabled by:
		// sap.ui.mdc.table.PropertyHelper
		// sap.ui.mdc.chart.PropertyHelper
		// sap.ui.mdc.p13n.PropertyHelper
		filterable: { // Whether it is possible to filter by this property.
			type: "boolean",
			"default": {
				value: true
			},
			forComplexProperty: {
				valueIfNotAllowed: false
			}
		},
		sortable: { // Whether it is possible to sort by this property.
			type: "boolean",
			"default": {
				value: true
			},
			forComplexProperty: {
				valueIfNotAllowed: false
			}
		},

		// Enabled by:
		// sap.ui.mdc.table.PropertyHelper
		propertyInfos: { // List of names of simple properties. If this attribute is set, the property is a "complex property".
			type: "PropertyReference[]",
			forComplexProperty: {
				allowed: true
			}
		}
	};

	/**
	 * The methods listed in this map are added to every <code>PropertyInfo</code> object.
	 */
	const mPropertyMethods = {
		/**
		 * Checks whether the property is complex.
		 *
		 * @this sap.ui.mdc.util.PropertyInfo
		 * @returns {boolean | null} Whether the property is complex
		 */
		isComplex: function() {
			return PropertyHelper.isPropertyComplex(this);
		},
		/**
		 * Gets all relevant simple properties. Returns itself if it is a simple property, and the referenced simple properties if it is complex.
		 *
		 * @this sap.ui.mdc.util.PropertyInfo
		 * @returns {sap.ui.mdc.util.PropertyInfo[]} The referenced simple properties if it is complex, otherwise itself
		 */
		getSimpleProperties: function() {
			return this.propertyInfosProperties || [this];
		},
		/**
		 * Gets all sortable properties referenced by the property, including the property itself if it is not complex.
		 *
		 * @this sap.ui.mdc.util.PropertyInfo
		 * @returns {sap.ui.mdc.util.PropertyInfo[]} The sortable properties
		 */
		getSortableProperties: function() {
			return this.getSimpleProperties().filter((oProperty) => {
				return oProperty.sortable;
			});
		},
		/**
		 * Gets all filterable properties referenced by the property, including the property itself if it is not complex.
		 *
		 * @this sap.ui.mdc.util.PropertyInfo
		 * @returns {sap.ui.mdc.util.PropertyInfo[]} The filterable properties
		 */
		getFilterableProperties: function() {
			return this.getSimpleProperties().filter((oProperty) => {
				return oProperty.filterable;
			});
		},
		/**
		 * Gets all visible properties referenced by the property, including the property itself if it is not complex.
		 *
		 * @this sap.ui.mdc.util.PropertyInfo
		 * @returns {sap.ui.mdc.util.PropertyInfo[]} The visible properties
		 */
		getVisibleProperties: function() {
			return this.getSimpleProperties().filter((oProperty) => {
				return oProperty.visible;
			});
		}
	};

	const aCommonAttributes = ["name",
		"label",
		"tooltip",
		"visible",
		"path",
		"dataType",
		"formatOptions",
		"constraints",
		"maxConditions",
		"group",
		"groupLabel",
		"caseSensitive"
	];
	const _private = new WeakMap();

	function stringifyPlainObject(oObject) {
		return JSON.stringify(oObject, (sKey, oValue) => {
			return oValue === undefined ? null : oValue;
		}) || "";
	}

	function reportInvalidProperty(sMessage, oAdditionalInfo) {
		const mLoadedLibraries = Lib.all();

		// Enable strict validation if
		// 1. it is not disabled explicitly
		// 2. we're not in any library that is temporarily allowed to bypass (fe & df)
		// 3. the explicit enablement via url param is activated --> overrules the first to conditions
		if (
			(
				!(window['sap-ui-mdc-config'] && window['sap-ui-mdc-config'].disableStrictPropertyInfoValidation ||
					new URLSearchParams(window.location.search).get("sap-ui-xx-disableStrictPropertyValidation") == "true") &&
				!("sap.fe.core" in mLoadedLibraries ||
					"sap.fe.macros" in mLoadedLibraries ||
					"sap.sac.df" in mLoadedLibraries)
			) ||
			(new URLSearchParams(window.location.search).get("sap-ui-xx-enableStrictPropertyValidation") == "true")
		) {
			throwInvalidPropertyError(sMessage, oAdditionalInfo);
		}

		// TODO: warning is logged momentarily so that consumers can adapt to have valid property definitions
		//  valid use case would be to throw an error
		if (Log.getLevel() < Log.WARNING) {
			return; // Avoid stringification overhead if logging is not required.
		}

		const sAdditionalInfo = stringifyPlainObject(oAdditionalInfo);
		Log.warning("Invalid property definition: " + sMessage + (sAdditionalInfo ? "\n" + sAdditionalInfo : ""));
	}

	function throwInvalidPropertyError(sMessage, oAdditionalInfo) {
		const sAdditionalInfo = oAdditionalInfo ? stringifyPlainObject(oAdditionalInfo) : null;
		throw new Error("Invalid property definition: " + sMessage + (sAdditionalInfo ? "\n" + sAdditionalInfo : ""));
	}

	function enrichProperties(oPropertyHelper, aProperties) {
		aProperties.map((oProperty) => {
			Object.keys(mPropertyMethods).forEach((sMethod) => {
				Object.defineProperty(oProperty, sMethod, {
					value: function() {
						return mPropertyMethods[sMethod].call(this);
					},
					writable: true
				});
			});
		});
	}

	function deepFreeze(oObject) {
		const aKeys = Object.getOwnPropertyNames(oObject);

		Object.freeze(oObject);

		for (let i = 0; i < aKeys.length; i++) {
			const vValue = oObject[aKeys[i]];

			if (typeof vValue === "function") {
				Object.freeze(vValue);
			} else if (isPlainObject(vValue) && !Object.isFrozen(vValue)) {
				deepFreeze(vValue);
			} else if (Array.isArray(vValue)) {
				deepFreeze(vValue);
			}
		}
	}

	function deepFind(oObject, sPath) {
		if (!sPath) {
			return oObject;
		}

		return sPath.split(".").reduce((oCurrent, sSection) => {
			return oCurrent && oCurrent[sSection] ? oCurrent[sSection] : null;
		}, oObject);
	}

	function getAttributeDataType(vAttributeType) {
		let sType;

		if (typeof vAttributeType === "object") {
			sType = "object";
		} else {
			sType = vAttributeType.replace("PropertyReference", "string");
		}

		return DataType.getType(sType);
	}

	function getTypeDefault(vAttributeType) {
		const oDataType = getAttributeDataType(vAttributeType);

		if (oDataType.isArrayType()) {
			return oDataType.getBaseType().getDefaultValue();
		} else {
			return oDataType.getDefaultValue();
		}
	}

	function prepareProperties(oPropertyHelper, aProperties) {
		aProperties.forEach((oProperty) => {
			oPropertyHelper.prepareProperty(oProperty);
		});

		deepFreeze(aProperties);
	}

	function preparePropertyDeep(oPropertyHelper, oProperty, mProperties, sPath, oPropertySection, mAttributeSection) {
		const bTopLevel = sPath == null;
		let aDependenciesForDefaults = [];
		const bIsComplex = PropertyHelper.isPropertyComplex(oProperty);

		if (bTopLevel) {
			mAttributeSection = _private.get(oPropertyHelper).mAttributeMetadata;
			oPropertySection = oProperty;
		}

		if (!oPropertySection) {
			return [];
		}

		for (const sAttribute in mAttributeSection) {
			const mAttribute = mAttributeSection[sAttribute];
			const sAttributePath = bTopLevel ? sAttribute : sPath + "." + sAttribute;
			const vValue = oPropertySection[sAttribute];

			if (bIsComplex && !mAttribute.forComplexProperty.allowed) {
				if ("valueIfNotAllowed" in mAttribute.forComplexProperty) {
					oPropertySection[sAttribute] = mAttribute.forComplexProperty.valueIfNotAllowed;
				}
				continue;
			}

			if (vValue != null && typeof mAttribute.type === "string" && mAttribute.type.startsWith("PropertyReference") ||
				sAttributePath === "propertyInfos") {

				if (bIsComplex || sAttributePath !== "propertyInfos") {
					preparePropertyReferences(oPropertySection, sAttribute, mProperties);
				}

				continue;
			}

			if (vValue == null) {
				setAttributeDefault(oPropertySection, mAttribute, sPath, sAttribute, aDependenciesForDefaults, vValue);
			}

			if (typeof mAttribute.type === "object") {
				aDependenciesForDefaults = aDependenciesForDefaults.concat(preparePropertyDeep(
					oPropertyHelper, oProperty, mProperties, sAttributePath, oPropertySection[sAttribute], mAttribute.type
				));
			}
		}

		return aDependenciesForDefaults;
	}

	function preparePropertyReferences(oPropertySection, sAttribute, mProperties) {
		const vPropertyReference = oPropertySection[sAttribute];
		let vProperties;
		let sPropertyName = sAttribute;

		if (Array.isArray(vPropertyReference)) {
			vProperties = vPropertyReference.map((sName) => {
				return mProperties[sName];
			});
			sPropertyName += "Properties";
		} else {
			vProperties = mProperties[vPropertyReference];
			sPropertyName += "Property";
		}

		Object.defineProperty(oPropertySection, sPropertyName, {
			value: vProperties
		});
	}

	function setAttributeDefault(oPropertySection, mAttributeSection, sSection, sAttribute, aDependenciesForDefaults, vValue) {
		if ("default" in mAttributeSection) {
			const oDefault = mAttributeSection.default;

			// "ignoreIfNull" takes effect only if a default value for the attribute has been specified in its metadata.
			if (vValue === null && oDefault.ignoreIfNull && "value" in oDefault) {
				return;
			}

			if (oDefault.value === undefined) {
				oPropertySection[sAttribute] = getTypeDefault(mAttributeSection.type);
			} else if (typeof oDefault.value === "string" && oDefault.value.startsWith("attribute:")) {
				// Attributes that reference another attribute for the default value need to be processed in a second step.
				// This is only supported 1 level deep.
				aDependenciesForDefaults.push({
					source: oDefault.value.substring(oDefault.value.indexOf(":") + 1),
					targetPath: sSection,
					targetAttribute: sAttribute,
					targetType: mAttributeSection.type
				});
			} else if (typeof oDefault.value === "object") {
				oPropertySection[sAttribute] = merge({}, oDefault.value);
			} else {
				oPropertySection[sAttribute] = oDefault.value;
			}
		} else {
			oPropertySection[sAttribute] = getTypeDefault(mAttributeSection.type);
		}
	}

	function createPropertyMap(aProperties) {
		return Object.freeze(aProperties.reduce((mMap, oProperty) => {
			mMap[oProperty.name] = oProperty;
			return mMap;
		}, {}));
	}

	function finalizeAttributeMetadata(mAttributeSection, sPath, mParentAttributeSection) {
		for (const sAttribute in mAttributeSection) {
			const mAttribute = mAttributeSection[sAttribute];
			const sAttributePath = sPath == null ? sAttribute : sPath + "." + sAttribute;
			const mParentForComplexProperty = mParentAttributeSection ? mParentAttributeSection.forComplexProperty : {};

			mAttribute.forComplexProperty = Object.assign({
				allowed: mParentForComplexProperty.allowed && mParentForComplexProperty.propagateAllowance,
				propagateAllowance: true
			}, mAttribute.forComplexProperty);

			if (typeof mAttribute.type === "object") {
				finalizeAttributeMetadata(mAttribute.type, sAttributePath, mAttribute);
			}
		}
	}

	/**
	 * Validates the properties, applies defaults, and enriches them with additional information and functions.
	 *
	 * @param {sap.ui.mdc.util.PropertyHelper} oPropertyHelper
	 *     The instance of the <code>PropertyHelper</code> to initialize or re-initialize.
	 * @param {sap.ui.mdc.util.PropertyInfo[]} aProperties
	 *     The properties to process in this helper.
	 * @throws {Error} If the properties are invalid.
	 */
	function processProperties(oPropertyHelper, aProperties) {
		if (!Array.isArray(aProperties)) {
			throwInvalidPropertyError("Property infos must be an array.");
		}

		const mPrivate = _private.get(oPropertyHelper);
		const aClonedProperties = merge([], aProperties);

		oPropertyHelper.validateProperties(aClonedProperties, mPrivate.aPreviousRawProperties);

		mPrivate.aProperties = aClonedProperties;
		mPrivate.mProperties = createPropertyMap(aClonedProperties);
		mPrivate.aPreviousRawProperties = merge([], aProperties);

		enrichProperties(oPropertyHelper, aClonedProperties);
		prepareProperties(oPropertyHelper, aClonedProperties);
	}

	/**
	 * Constructor for a new helper for the given properties.
	 *
	 * @param {sap.ui.mdc.util.PropertyInfo[]} aProperties
	 *     The properties to process in this helper
	 * @param {sap.ui.base.ManagedObject} [oParent]
	 *     A reference to an instance that will act as the parent of this helper
	 * @param {object} [mAdditionalAttributes]
	 *     Additional attributes that the <code>PropertyInfo</code> may contain. It is a key-value map, where the key is the name of the
	 *     attribute, and the value is the attribute metadata definition. To add a standard property, the value must be <code>true</code>. Metadata
	 *     of standard attributes cannot be overridden.
	 *     The following common standard attributes are always included. They do not need to be added explicitly and cannot be excluded.
	 *     name, label, visible, path, dataType, formatOptions, constraints, maxConditions, group, groupLabel, caseSensitive
	 *
	 * @class
	 * Property helpers in this SAPUI5 library provide a consistent and standardized structure of properties and their attributes.
	 * Validates the given properties, sets defaults, and provides utilities to work with these properties.
	 * The utilities can only be used for properties that are known to the helper. Known properties are all those that are passed to the constructor.
	 *
	 * @extends sap.ui.base.Object
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @private
	 * @experimental
	 * @since 1.83
	 * @alias sap.ui.mdc.util.PropertyHelper
	 */
	const PropertyHelper = BaseObject.extend("sap.ui.mdc.util.PropertyHelper", {
		constructor: function(aProperties, oParent, mAdditionalAttributes) {
			BaseObject.call(this);

			if (oParent && !BaseObject.isObjectA(oParent, "sap.ui.base.ManagedObject")) {
				throw new Error("The type of the parent is invalid.");
			}

			Object.keys(mAdditionalAttributes || {}).forEach((sAdditionalAttribute) => {
				if (sAdditionalAttribute in mAttributeMetadata && mAdditionalAttributes[sAdditionalAttribute] !== true) {
					throw new Error("The attribute '" + sAdditionalAttribute + "' is reserved and cannot be overridden by additional attributes.");
				}
			});

			const mPrivate = {};
			const aAdditionalAttributes = Object.keys(mAdditionalAttributes || {});

			mPrivate.mAttributeMetadata = aCommonAttributes.concat(aAdditionalAttributes).reduce((mMetadata, sAttribute) => {
				mMetadata[sAttribute] = sAttribute in mAttributeMetadata ? mAttributeMetadata[sAttribute] : mAdditionalAttributes[sAttribute];
				return mMetadata;
			}, {});
			finalizeAttributeMetadata(mPrivate.mAttributeMetadata);

			mPrivate.aMandatoryAttributes = Object.keys(mPrivate.mAttributeMetadata).filter((sAttribute) => {
				return mPrivate.mAttributeMetadata[sAttribute].mandatory;
			});

			mPrivate.oParent = oParent || null;
			_private.set(this, mPrivate);

			processProperties(this, aProperties);
		}
	});

	/**
	 * Validates an array of properties.
	 *
	 * <b>Note for classes that override this method:</b>
	 * The only method that may be called from here is {@link #validateProperty}. The properties are not yet stored in the helper, and therefore
	 * any method that tries to access them might not work as expected.
	 *
	 * @param {sap.ui.mdc.util.PropertyInfo[]} aProperties The properties to validate
	 * @param {sap.ui.mdc.util.PropertyInfo[]} [aPreviousProperties] The previous set of properties to validate against
	 * @throws {Error} If the properties are invalid
	 * @protected
	 */
	PropertyHelper.prototype.validateProperties = function(aProperties, aPreviousProperties) {
		const oUniquePropertiesSet = new Set();

		for (let i = 0; i < aProperties.length; i++) {
			this.validateProperty(aProperties[i], aProperties, aPreviousProperties);
			oUniquePropertiesSet.add(aProperties[i].name);
		}

		if (oUniquePropertiesSet.size !== aProperties.length) {
			throwInvalidPropertyError("Properties do not have unique names.");
		}
	};

	/**
	 * Validates a property. The entire array of properties needs to be provided for validation of a complex property.
	 *
	 * <b>Note for classes that override this method:</b>
	 * No other method of the helper must be called from here. The properties are not yet stored in the helper, and therefore
	 * any method that tries to access them might not work as expected.
	 *
	 * @param {sap.ui.mdc.util.PropertyInfo} oProperty The property to validate
	 * @param {sap.ui.mdc.util.PropertyInfo[]} aProperties The entire array properties
	 * @param {sap.ui.mdc.util.PropertyInfo[]} [aPreviousProperties] The previous set of properties to validate against
	 * @throws {Error} If the property is invalid
	 * @protected
	 */
	PropertyHelper.prototype.validateProperty = function(oProperty, aProperties, aPreviousProperties) {
		if (!isPlainObject(oProperty)) {
			throwInvalidPropertyError("Property info must be a plain object.");
		}

		validatePropertyDeep(this, oProperty, aProperties);

		if (PropertyHelper.isPropertyComplex(oProperty)) {
			if (!oProperty.propertyInfos || oProperty.propertyInfos.length === 0) {
				throwInvalidPropertyError("Complex property does not reference existing properties.", oProperty);
			}
		}

		const mPrivate = _private.get(this);

		mPrivate.aMandatoryAttributes.forEach((sMandatoryAttribute) => {
			const bAllowedForComplexProperty = mPrivate.mAttributeMetadata[sMandatoryAttribute].forComplexProperty.allowed;

			if (oProperty[sMandatoryAttribute] == null && PropertyHelper.isPropertyComplex(oProperty) && !bAllowedForComplexProperty) {
				// Don't throw an error if a complex property does not contain a mandatory attribute that is not allowed for complex properties.
				return;
			}

			if (!(sMandatoryAttribute in oProperty)) {
				reportInvalidProperty("Property does not contain mandatory attribute '" + sMandatoryAttribute + "'.", oProperty);
			} else if (oProperty[sMandatoryAttribute] == null) {
				throwInvalidPropertyError("Property does not contain mandatory attribute '" + sMandatoryAttribute + "'.", oProperty);
			}
		});
	};

	function validatePropertyDeep(oPropertyHelper, oProperty, aProperties, sPath, oPropertySection, mAttributeSection) {
		const bTopLevel = sPath == null;

		if (bTopLevel) {
			mAttributeSection = _private.get(oPropertyHelper).mAttributeMetadata;
			oPropertySection = oProperty;
		}

		for (const sAttribute in oPropertySection) {
			const mAttribute = mAttributeSection[sAttribute];
			const sAttributePath = bTopLevel ? sAttribute : sPath + "." + sAttribute;
			const vValue = oPropertySection[sAttribute];

			if (!mAttribute) {
				reportInvalidProperty("Property contains invalid attribute '" + sAttributePath + "'.", oProperty);
			} else if (PropertyHelper.isPropertyComplex(oProperty) && !mAttribute.forComplexProperty.allowed) {
				reportInvalidProperty("Complex property contains invalid attribute '" + sAttributePath + "'.", oProperty);
			} else if (typeof mAttribute.type === "object" && vValue && typeof vValue === "object") {
				validatePropertyDeep(
					oPropertyHelper, oProperty, aProperties, sAttributePath, vValue, mAttribute.type
				);
			} else if (vValue != null && !getAttributeDataType(mAttribute.type).isValid(vValue)) {
				// Optional attributes may have null or undefined as value.
				throwInvalidPropertyError("The value of '" + sAttributePath + "' is invalid.", oProperty);
			} else if (vValue && typeof mAttribute.type === "string" && mAttribute.type.startsWith("PropertyReference")) {
				validatePropertyReferences(
					oPropertyHelper, oProperty, aProperties, sAttributePath, vValue, mAttribute
				);
			}
		}
	}

	function validatePropertyReferences(oPropertyHelper, oProperty, aProperties, sPath, oPropertySection, mAttributeSection) {
		const aPropertyNames = mAttributeSection.type.endsWith("[]") ? oPropertySection : [oPropertySection];
		const oUniquePropertiesSet = new Set(aPropertyNames);

		if (aPropertyNames.indexOf(oProperty.name) > -1) {
			throwInvalidPropertyError("Property references itself in the '" + sPath + "' attribute.", oProperty);
		}

		if (oUniquePropertiesSet.size !== aPropertyNames.length) {
			throwInvalidPropertyError("Property contains duplicate names in the '" + sPath + "' attribute.", oProperty);
		}

		for (let i = 0; i < aProperties.length; i++) {
			if (oUniquePropertiesSet.has(aProperties[i].name)) {
				if (PropertyHelper.isPropertyComplex(aProperties[i])) {
					throwInvalidPropertyError("Property references complex properties in the '" + sPath + "' attribute.", oProperty);
				}
				oUniquePropertiesSet.delete(aProperties[i].name);
			}
		}

		if (oUniquePropertiesSet.size > 0) {
			throwInvalidPropertyError("Property references non-existing properties in the '" + sPath + "' attribute.", oProperty);
		}
	}

	/**
	 * Applies defaults and resolves property references.
	 *
	 * @param {sap.ui.mdc.util.PropertyInfo} oProperty The property to prepare
	 * @protected
	 */
	PropertyHelper.prototype.prepareProperty = function(oProperty) {
		const mProperties = this.getPropertyMap();
		const aDependenciesForDefaults = preparePropertyDeep(this, oProperty, mProperties);

		aDependenciesForDefaults.forEach((mDependency) => {
			const oPropertySection = deepFind(oProperty, mDependency.targetPath);

			if (oPropertySection) {
				let vValue = deepFind(oProperty, mDependency.source);

				if (vValue == null) {
					vValue = getTypeDefault(mDependency.targetType);
				}

				oPropertySection[mDependency.targetAttribute] = vValue;

				if (typeof mDependency.targetType === "string" && mDependency.targetType.startsWith("PropertyReference")) {
					preparePropertyReferences(oPropertySection, mDependency.targetAttribute, mProperties);
				}
			}
		});
	};

	/**
	 * If available, it gets the instance that acts as the parent of this helper. This may not reflect the UI5 object relationship tree.
	 *
	 * @returns {sap.ui.base.ManagedObject | null} The parent if one was passed to the constructor, <code>null</code> otherwise.
	 * @public
	 */
	PropertyHelper.prototype.getParent = function() {
		const oPrivate = _private.get(this);
		return oPrivate ? oPrivate.oParent : null;
	};

	/**
	 * Sets all properties known to this helper. Properties that are currently known but are not in the set of new properties are no longer known.
	 *
	 * @param {sap.ui.mdc.util.PropertyInfo[]} aProperties The properties to process
	 * @public
	 */
	PropertyHelper.prototype.setProperties = function(aProperties) {
		processProperties(this, aProperties);
	};

	/**
	 * Gets all properties known to this helper.
	 *
	 * @returns {sap.ui.mdc.util.PropertyInfo[]} All properties
	 * @public
	 */
	PropertyHelper.prototype.getProperties = function() {
		const oPrivate = _private.get(this);
		return oPrivate ? oPrivate.aProperties : [];
	};

	/**
	 * Gets the properties as a key-value map, where the key is the <code>name</code> attribute of a property.
	 *
	 * @returns {sap.ui.mdc.util.PropertyInfo} A map of all properties
	 * @public
	 */
	PropertyHelper.prototype.getPropertyMap = function() {
		const oPrivate = _private.get(this);
		return oPrivate ? oPrivate.mProperties : {};
	};

	/**
	 * Gets a property by its name.
	 *
	 * @param {string} sName Name of a property
	 * @returns {sap.ui.mdc.util.PropertyInfo | null} The property, or <code>null</code> if it is unknown
	 * @public
	 */
	PropertyHelper.prototype.getProperty = function(sName) {
		return this.getPropertyMap()[sName] || null;
	};

	/**
	 * Checks whether the property helper knows a property.
	 *
	 * @param {string} sName Name of a property
	 * @returns {boolean} Whether the property is known
	 * @public
	 */
	PropertyHelper.prototype.hasProperty = function(sName) {
		return sName in this.getPropertyMap();
	};

	/**
	 * Checks whether a property is a complex property. Works with any <code>PropertyInfo</code>, even if unknown to the property helper.
	 *
	 * @param {sap.ui.mdc.util.PropertyInfo} oProperty A <code>PropertyInfo</code> object
	 * @returns {boolean} Whether the property is complex
	 * @protected
	 * @static
	 */
	PropertyHelper.isPropertyComplex = function(oProperty) {
		return oProperty != null && typeof oProperty === "object" ? "propertyInfos" in oProperty : false;
	};

	/**
	 * Gets all sortable properties.
	 *
	 * @returns {sap.ui.mdc.util.PropertyInfo[]} All sortable properties
	 * @public
	 */
	PropertyHelper.prototype.getSortableProperties = function() {
		return this.getProperties().filter((oProperty) => {
			return oProperty.sortable;
		});
	};

	/**
	 * Gets all filterable properties.
	 *
	 * @returns {sap.ui.mdc.util.PropertyInfo[]} All filterable properties
	 * @public
	 */
	PropertyHelper.prototype.getFilterableProperties = function() {
		return this.getProperties().filter((oProperty) => {
			return oProperty.filterable;
		});
	};

	/**
	 * Gets all visible properties.
	 *
	 * @returns {sap.ui.mdc.util.PropertyInfo[]} All visible properties
	 * @public
	 */
	PropertyHelper.prototype.getVisibleProperties = function() {
		return this.getProperties().filter((oProperty) => {
			return oProperty.visible;
		});
	};

	/**
	 * @override
	 * @inheritDoc
	 */
	PropertyHelper.prototype.destroy = function() {
		BaseObject.prototype.destroy.apply(this, arguments);
		_private.delete(this);
	};

	return PropertyHelper;
});