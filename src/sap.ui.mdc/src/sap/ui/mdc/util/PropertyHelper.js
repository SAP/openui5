/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/ui/base/Object",
	"sap/ui/base/DataType",
	"sap/base/util/merge",
	"sap/base/util/isPlainObject",
	"sap/base/Log"
], function(
	BaseObject,
	DataType,
	merge,
	isPlainObject,
	Log
) {
	"use strict";

	/*global Set, WeakMap */

	/*
	 * Key-value map to define the characteristics of a property attribute, where the key is the name of the attribute.
	 *
	 * Metadata information:
	 * - type
	 *     Can be any type that is also allowed for a control property, plus "PropertyReference" for references to simple properties.
	 *     Complex types can be specified with an object that describes sub-attributes.
	 *     Examples: "string", "string[]", "sap.ui.mdc.MyEnum", "any", "PropertyReference",
	 *               {
	 *                   subAttribute: {type: "string", defaultValue: "myDefaultValue"}
	 *                   ...
	 *               }
	 * - mandatory (optional, default=false, only for top-level attribute)
	 *     Whether this attribute must be provided.
	 * - allowedForComplexProperty (optional, default=false)
	 *     Whether it is allowed to provide this attribute for a complex property.
	 * - defaultValue (optional):
	 *     This can either be a value, or a reference to another attribute in the form "attribute:x", with x being the name of the other
	 *     attribute. The default value of this attribute is then the value of the other attribute. This works only one level deep.
	 *     Examples: "attribute:name", "attribute:attributeName.subAttributeName"
	 */
	var mAttributeMetadata = {
		name: {
			type: "string",
			mandatory: true,
			allowedForComplexProperty: true
		},
		label: {
			type: "string",
			mandatory: true,
			allowedForComplexProperty: true
		},
		path: {
			type: "string",
			defaultValue: "attribute:name"
		},
		key: {
			type: "boolean"
		},
		visible: {
			type: "boolean",
			defaultValue: true,
			allowedForComplexProperty: true
		},
		filterable: {
			type: "boolean",
			defaultValue: true
		},
		sortable: {
			type: "boolean",
			defaultValue: true
		},
		groupable: {
			type: "boolean"
		},
		propertyInfos: {
			type: "PropertyReference[]",
			allowedForComplexProperty: true
		},
		unit: {
			type: "PropertyReference"
		},
		groupLabel: {
			type: "string",
			allowedForComplexProperty: true
		},
		exportSettings: {
			type: "object",
			allowedForComplexProperty: true
		},
		typeConfig: {
			type: "object"
		},
		maxConditions: {
			type: "int",
			defaultValue: -1
		},
		fieldHelp: {
			type: "string"
		}
	};

	var aMandatoryAttributes = Object.keys(mAttributeMetadata).filter(function(sAttribute) {
		return mAttributeMetadata[sAttribute].mandatory;
	});
	var aPropertyFacadeMethods = [];
	var _private = new WeakMap();

	function stringifyPlainObject(oObject) {
		return JSON.stringify(oObject, function(sKey, oValue) {
			return oValue === undefined ? null : oValue;
		}) || "";
	}

	function reportInvalidProperty(sMessage, oAdditionalInfo) {
		// TODO: warning is logged momentarily so that consumers can adapt to have valid property definitions
		//  valid use case would be to throw an error
		var sAdditionalInfo = stringifyPlainObject(oAdditionalInfo);
		Log.warning("Invalid property definition: " + sMessage + (sAdditionalInfo ? "\n" + sAdditionalInfo : ""));
	}

	function throwInvalidPropertyError(sMessage, oAdditionalInfo) {
		var sAdditionalInfo = stringifyPlainObject(oAdditionalInfo);
		throw new Error("Invalid property definition: " + sMessage + (sAdditionalInfo ? "\n" + sAdditionalInfo : ""));
	}

	function cloneProperties(aProperties) {
		return aProperties.map(function(oProperty) {
			return merge({}, oProperty);
		});
	}

	function createPropertyFacades(oPropertyHelper, aProperties) {
		var aPropertyFacades = aProperties.map(function(oProperty) {
			var oFacade = {};

			aPropertyFacadeMethods.forEach(function(sMethod) {
				Object.defineProperty(oFacade, sMethod, {
					value: function() {
						return oPropertyHelper[sMethod].call(oPropertyHelper, oProperty.name);
					}
				});
			});

			return oFacade;
		});

		return Object.freeze(aPropertyFacades);
	}

	function finalizePropertyFacades(oPropertyHelper, aFacades) {
		aFacades.forEach(function(oFacade) {
			oPropertyHelper.onCreatePropertyFacade(oFacade);
			Object.freeze(oFacade);
		});
	}

	function deepFreeze(oObject) {
		var aKeys = Object.getOwnPropertyNames(oObject);

		for (var i = 0; i < aKeys.length; i++) {
			var vValue = oObject[aKeys[i]];
			var bValueIsArray = Array.isArray(vValue);

			if (isPlainObject(vValue) || bValueIsArray) {
				if (aKeys[i].startsWith("_")) {
					if (bValueIsArray) {
						Object.freeze(vValue);
					}
				} else {
					deepFreeze(vValue);
				}
			}
		}

		return Object.freeze(oObject);
	}

	function deepFind(oObject, sPath) {
		if (!sPath) {
			return oObject;
		}

		return sPath.split(".").reduce(function(oCurrent, sSection) {
			return oCurrent && oCurrent[sSection] ? oCurrent[sSection] : null;
		}, oObject);
	}

	function getAttributeDataType(mAttributeSection) {
		var sType;

		if (typeof mAttributeSection.type === "object") {
			sType = "object";
		} else {
			sType = mAttributeSection.type.replace("PropertyReference", "string");
		}

		return DataType.getType(sType);
	}

	function prepareProperties(oPropertyHelper, aProperties, mProperties) {
		aProperties.forEach(function(oProperty) {
			var aDependenciesForDefaults = preparePropertyDeep(oPropertyHelper, oProperty, mProperties);

			aDependenciesForDefaults.forEach(function(mDependency) {
				var oPropertySection = deepFind(oProperty, mDependency.targetPath);

				if (oPropertySection) {
					oPropertySection[mDependency.targetAttribute] = deepFind(oProperty, mDependency.source);

					if (mDependency.isPropertyReference) {
						preparePropertyReferences(oPropertySection, mDependency.targetAttribute, mProperties);
					}
				}
			});

			deepFreeze(oProperty);
		});
	}

	function preparePropertyDeep(oPropertyHelper, oProperty, mProperties, sPath, oPropertySection, mAttributeSection) {
		var bTopLevel = sPath == null;
		var aDependenciesForDefaults = [];
		var bIsComplex = oPropertyHelper.isPropertyComplex(oProperty);

		if (bTopLevel) {
			mAttributeSection = _private.get(oPropertyHelper).mAttributeMetadata;
			oPropertySection = oProperty;
		}

		if (!oPropertySection) {
			return [];
		}

		for (var sAttribute in mAttributeSection) {
			var mAttribute = mAttributeSection[sAttribute];
			var sAttributePath = bTopLevel ? sAttribute : sPath + "." + sAttribute;
			var vValue = oPropertySection[sAttribute];

			if (bIsComplex && !mAttribute.allowedForComplexProperty) {
				continue;
			}

			if (vValue != null && typeof mAttribute.type === "string" && mAttribute.type.startsWith("PropertyReference")
				|| sAttributePath === "propertyInfos") {

				if (bIsComplex || sAttributePath !== "propertyInfos") {
					preparePropertyReferences(oPropertySection, sAttribute, mProperties);
				}

				continue;
			}

			if (vValue == null) {
				setAttributeDefault(oPropertySection, mAttribute, sPath, sAttribute, aDependenciesForDefaults);
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
		var vPropertyReference = oPropertySection[sAttribute];
		var vProperties;

		if (Array.isArray(vPropertyReference)) {
			vProperties = vPropertyReference.map(function(sName) {
				return mProperties[sName];
			});
		} else {
			vProperties = mProperties[vPropertyReference];
		}

		Object.defineProperty(oPropertySection, "_" + sAttribute, {
			value: vProperties
		});
	}

	function setAttributeDefault(oPropertySection, mAttributeSection, sSection, sAttribute, aDependenciesForDefaults) {
		if ("defaultValue" in mAttributeSection) {
			if (typeof mAttributeSection.defaultValue === "string" && mAttributeSection.defaultValue.startsWith("attribute:")) {
				// Attributes that reference another attribute for the default value need to be processed in a second step.
				// This is only supported 1 level deep.
				aDependenciesForDefaults.push({
					source: mAttributeSection.defaultValue.substring(mAttributeSection.defaultValue.indexOf(":") + 1),
					targetPath: sSection,
					targetAttribute: sAttribute,
					isPropertyReference: typeof mAttributeSection.type === "string" && mAttributeSection.type.startsWith("PropertyReference")
				});
			} else if (typeof mAttributeSection.defaultValue === "object" && mAttributeSection.defaultValue !== null) {
				oPropertySection[sAttribute] = merge({}, mAttributeSection.defaultValue);
			} else {
				oPropertySection[sAttribute] = mAttributeSection.defaultValue;
			}
		} else {
			var oDataType = getAttributeDataType(mAttributeSection);

			if (oDataType.isArrayType()) {
				oPropertySection[sAttribute] = oDataType.getBaseType().getDefaultValue();
			} else {
				oPropertySection[sAttribute] = oDataType.getDefaultValue();
			}
		}
	}

	function createPropertyMap(aProperties, aFacades) {
		var mProperties = {};

		aProperties.forEach(function(oProperty, iIndex) {
			mProperties[oProperty.name] = aFacades ? aFacades[iIndex] : oProperty;
		});

		return Object.freeze(mProperties);
	}

	function extractProperties(oPropertyHelper, sPropertyName, fnFilter) {
		var oProperty = oPropertyHelper.getProperty(sPropertyName);

		if (!oProperty) {
			return [];
		}

		if (oProperty.isComplex()) {
			return oProperty.getReferencedProperties().filter(function(oProperty) {
				return fnFilter.call(oPropertyHelper, oProperty.getName());
			});
		} else if (fnFilter.call(oPropertyHelper, oProperty.getName())) {
			return [oProperty];
		}

		return [];
	}

	/**
	 * Constructor for a new helper for the given properties.
	 *
	 * @param {object[]} aProperties The properties to process in this helper
	 * @param {sap.ui.base.ManagedObject} [oParent] A reference to an instance that will act as the parent of this helper
	 * @param {object} [mAttributeMetadataExtension]
	 *      Attribute metadata for additional property information in an <code>extension</code> attribute. The property infos may contain an
	 *      <code>extension</code> attribute only attribute metadata is provided for it.
	 *
	 * @class
	 * Property helpers give this library a consistent and standardized view on properties and their attributes.
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
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var PropertyHelper = BaseObject.extend("sap.ui.mdc.util.PropertyHelper", {
		constructor: function(aProperties, oParent, mAttributeMetadataExtension) {
			BaseObject.call(this);

			var bParentIsValid = BaseObject.isA(oParent, ["sap.ui.base.ManagedObject"]);
			var mPrivate = {};

			if (oParent && !bParentIsValid) {
				throw new Error("The type of the parent is invalid");
			}

			_private.set(this, mPrivate);

			if (mAttributeMetadataExtension) {
				mPrivate.mAttributeMetadata = Object.assign({
					extension: {
						type: mAttributeMetadataExtension,
						mandatory: true,
						allowedForComplexProperty: true
					}
				}, mAttributeMetadata);
				mPrivate.aMandatoryAttributes = aMandatoryAttributes.concat("extension");
				mPrivate.aMandatoryExtensionAttributes = Object.keys(mAttributeMetadataExtension).filter(function(sAttribute) {
					return mAttributeMetadataExtension[sAttribute].mandatory;
				});
			} else {
				mPrivate.mAttributeMetadata = mAttributeMetadata;
				mPrivate.aMandatoryAttributes = aMandatoryAttributes;
				mPrivate.aMandatoryExtensionAttributes = [];
			}

			this.validateProperties(aProperties);

			var aClonedProperties = cloneProperties(aProperties);
			var aPropertyFacades = createPropertyFacades(this, aClonedProperties);
			var mProperties = createPropertyMap(aClonedProperties);
			var mPropertyFacades = createPropertyMap(aClonedProperties, aPropertyFacades);

			mPrivate.oParent = oParent || null;
			mPrivate.aProperties = aClonedProperties;
			mPrivate.mProperties = mProperties;
			mPrivate.aPropertyFacades = aPropertyFacades;
			mPrivate.mPropertyFacades = mPropertyFacades;

			prepareProperties(this, aClonedProperties, mPropertyFacades);
			finalizePropertyFacades(this, aPropertyFacades);
		}
	});

	/**
	 * Validates an array of properties.
	 *
	 * <b>Note for classes that override this method:</b>
	 * The only method that may be called from here is {@link #validateProperty}. The properties are not yet stored in the helper, and therefore
	 * any method that tries to access them might not work as expected.
	 *
	 * @param {object[]} aProperties The properties to validate
	 * @throws {Error} If the properties are invalid
	 * @protected
	 */
	PropertyHelper.prototype.validateProperties = function(aProperties) {
		if (!Array.isArray(aProperties)) {
			throwInvalidPropertyError("Property infos must be an array.");
		}

		var oUniquePropertiesSet = new Set();

		for (var i = 0; i < aProperties.length; i++) {
			this.validateProperty(aProperties[i], aProperties);
			oUniquePropertiesSet.add(aProperties[i].name);
		}

		if (oUniquePropertiesSet.size !== aProperties.length) {
			throwInvalidPropertyError("Properties do not have unique names.");
		}
	};

	/**
	 * Validates a single property. The entire array properties needs to be provided for validation of a complex property.
	 *
	 * <b>Note for classes that override this method:</b>
	 * No other method of the helper may be called from here. The properties are not yet stored in the helper, and therefore
	 * any method that tries to access them might not work as expected.
	 *
	 * @param {object} oProperty The property to validate
	 * @param {aProperties} aProperties The entire array properties
	 * @throws {Error} If the property is invalid
	 * @protected
	 */
	PropertyHelper.prototype.validateProperty = function(oProperty, aProperties) {
		if (!isPlainObject(oProperty)) {
			throwInvalidPropertyError("Property info must be a plain object.", oProperty);
		}

		validatePropertyDeep(this, oProperty, aProperties);

		if (this.isPropertyComplex(oProperty)) {
			if (oProperty.propertyInfos.length === 0) {
				throwInvalidPropertyError("Complex property does not reference existing properties.", oProperty);
			}
		}

		_private.get(this).aMandatoryAttributes.forEach(function(sMandatoryAttribute) {
			if (!(sMandatoryAttribute in oProperty)) {
				reportInvalidProperty("Property does not contain mandatory attribute '" + sMandatoryAttribute + "'.", oProperty);
			} else if (oProperty[sMandatoryAttribute] == null) {
				throwInvalidPropertyError("Property does not contain mandatory attribute '" + sMandatoryAttribute + "'.", oProperty);
			}
		});

		_private.get(this).aMandatoryExtensionAttributes.forEach(function(sMandatoryAttribute) {
			if (!(sMandatoryAttribute in oProperty.extension)) {
				reportInvalidProperty("Property does not contain mandatory attribute 'extension." + sMandatoryAttribute + "'.", oProperty);
			} else if (oProperty.extension[sMandatoryAttribute] == null) {
				throwInvalidPropertyError("Property does not contain mandatory attribute 'extension." + sMandatoryAttribute + "'.", oProperty);
			}
		});
	};

	function validatePropertyDeep(oPropertyHelper, oProperty, aProperties, sPath, oPropertySection, mAttributeSection) {
		var bTopLevel = sPath == null;

		if (bTopLevel) {
			mAttributeSection = _private.get(oPropertyHelper).mAttributeMetadata;
			oPropertySection = oProperty;
		}

		for (var sAttribute in oPropertySection) {
			var mAttribute = mAttributeSection[sAttribute];
			var sAttributePath = bTopLevel ? sAttribute : sPath + "." + sAttribute;
			var vValue = oPropertySection[sAttribute];

			if (!mAttribute) {
				reportInvalidProperty("Property contains invalid attribute '" + sAttributePath + "'.", oProperty);
			} else if (oPropertyHelper.isPropertyComplex(oProperty) && !mAttribute.allowedForComplexProperty) {
				reportInvalidProperty("Complex property contains invalid attribute '" + sAttributePath + "'.", oProperty);
			} else if (typeof mAttribute.type === "object" && vValue && typeof vValue === "object") {
				validatePropertyDeep(
					oPropertyHelper, oProperty, aProperties, sAttributePath, vValue, mAttribute.type
				);
			} else if (vValue != null && !getAttributeDataType(mAttribute).isValid(vValue)) {
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
		var aPropertyNames = mAttributeSection.type.endsWith("[]") ? oPropertySection : [oPropertySection];
		var oUniquePropertiesSet = new Set(aPropertyNames);

		if (aPropertyNames.indexOf(oProperty.name) > -1) {
			throwInvalidPropertyError("Property references itself in the '" + sPath + "' attribute", oProperty);
		}

		if (oUniquePropertiesSet.size !== aPropertyNames.length) {
			throwInvalidPropertyError("Property contains duplicate names in the '" + sPath + "' attribute.", oProperty);
		}

		for (var i = 0; i < aProperties.length; i++) {
			if (oUniquePropertiesSet.has(aProperties[i].name)) {
				if (oPropertyHelper.isPropertyComplex(aProperties[i])) {
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
	 * If available, it gets the instance that acts as the parent of this helper. This may not reflect the UI5 object relationship tree.
	 *
	 * @returns {sap.ui.base.ManagedObject|null} The parent if one was passed to the constructor, <code>null</code> otherwise.
	 * @protected
	 */
	PropertyHelper.prototype.getParent = function() {
		var oPrivate = _private.get(this);
		return oPrivate ? oPrivate.oParent : null;
	};

	/**
	 * Gets all properties known to this helper.
	 *
	 * @returns {object[]} All properties
	 * @public
	 */
	PropertyHelper.prototype.getProperties = function() {
		var oPrivate = _private.get(this);
		return oPrivate ? oPrivate.aPropertyFacades : [];
	};

	/**
	 * Gets the properties as a key-value map, where the key is the <code>name</code> attribute of a property.
	 *
	 * @returns {object} A map of all properties
	 * @public
	 */
	PropertyHelper.prototype.getPropertyMap = function() {
		var oPrivate = _private.get(this);
		return oPrivate ? oPrivate.mPropertyFacades : {};
	};

	/**
	 * Gets a property by its name.
	 *
	 * @param {string} sName Name of a property
	 * @returns {object|null} The property, or <code>null</code> if it is unknown
	 * @public
	 */
	PropertyHelper.prototype.getProperty = function(sName) {
		return this.getPropertyMap()[sName] || null;
	};

	/**
	 * Gets the array of raw property infos.
	 *
	 * @returns {Array|null} the array of propertyInfos
	 * @public
	 */
	PropertyHelper.prototype.getRawPropertyInfos = function() {
		var mPrivate = _private.get(this);
		return mPrivate && mPrivate.aProperties;
	};

	/**
	 * Gets the raw property by its name.
	 *
	 * @param {string} sName Name of a property
	 * @returns {object|null} The raw property, or <code>null</code> if it is unknown
	 * @public
	 */
	PropertyHelper.prototype.getRawProperty = function(sName) {
		var mPrivate = _private.get(this);
		return mPrivate && mPrivate.mProperties[sName] ? mPrivate.mProperties[sName] : null;
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
	 * Checks whether a property is complex.
	 *
	 * @see #isPropertyComplex
	 * @param {string} sName Name of a property
	 * @returns {boolean|null} Whether the property is complex, or <code>null</code> if it is unknown
	 * @public
	 */
	PropertyHelper.prototype.isComplex = function(sName) {
		var oRawProperty = this.getRawProperty(sName);
		return oRawProperty ? this.isPropertyComplex(oRawProperty) : null;
	};
	aPropertyFacadeMethods.push("isComplex");

	/**
	 * Checks whether a property is a complex property. Works with any raw property info object. Does not work with property objects that are
	 * returned by the property helper. Used during initialization.
	 *
	 * @see #isComplex
	 * @param {object} oProperty A property info object
	 * @returns {boolean|null} Whether the property is complex
	 * @protected
	 */
	PropertyHelper.prototype.isPropertyComplex = function(oProperty) {
		return oProperty != null && typeof oProperty === "object" ? "propertyInfos" in oProperty : false;
	};

	/**
	 * Gets all properties referenced by a complex property.
	 *
	 * @param {string} sName Name of a complex property
	 * @returns {object[]} The properties the complex property references
	 * @public
	 */
	PropertyHelper.prototype.getReferencedProperties = function(sName) {
		var oRawProperty = this.getRawProperty(sName);
		return (oRawProperty && oRawProperty._propertyInfos) || [];
	};
	aPropertyFacadeMethods.push("getReferencedProperties");

	/**
	 * Gets the unit property.
	 *
	 * @param {string} sName Name of a property
	 * @returns {object|null} The unit property, or <code>null</code> if it is unknown
	 * @public
	 */
	PropertyHelper.prototype.getUnitProperty = function(sName) {
		var oRawProperty = this.getRawProperty(sName);
		return (oRawProperty && oRawProperty._unit) || null;
	};
	aPropertyFacadeMethods.push("getUnitProperty");

	/**
	 * Checks whether a property is sortable.
	 *
	 * @param {string} sName Name of a property
	 * @returns {boolean|null} Whether the property is sortable, or <code>null</code> if it is unknown
	 * @public
	 */
	PropertyHelper.prototype.isSortable = function(sName) {
		var oProperty = this.getProperty(sName);

		if (oProperty) {
			return oProperty.isComplex() ? false : this.getRawProperty(sName).sortable;
		}

		return null;
	};
	aPropertyFacadeMethods.push("isSortable");

	/**
	 * Gets all sortable properties referenced by a complex property. For convenience, the name of a non-complex property can be given that is then
	 * returned if it is sortable.
	 *
	 * @param {string} sName Name of a property
	 * @returns {object[]} The sortable properties
	 * @public
	 */
	PropertyHelper.prototype.getSortableProperties = function(sName) {
		return extractProperties(this, sName, this.isSortable);
	};
	aPropertyFacadeMethods.push("getSortableProperties");

	/**
	 * Gets all sortable, non-complex properties.
	 *
	 * @returns {object[]} All sortable properties
	 * @public
	 */
	PropertyHelper.prototype.getAllSortableProperties = function() {
		return this.getProperties().filter(function(oProperty) {
			return oProperty.isSortable();
		});
	};

	/**
	 * Checks whether a property is filterable.
	 *
	 * @param {string} sName Name of a property
	 * @returns {boolean|null} Whether the property is filterable, or <code>null</code> if it is unknown
	 * @public
	 */
	PropertyHelper.prototype.isFilterable = function(sName) {
		var oProperty = this.getProperty(sName);

		if (oProperty) {
			return oProperty.isComplex() ? false : this.getRawProperty(sName).filterable;
		}

		return null;
	};
	aPropertyFacadeMethods.push("isFilterable");

	/**
	 * Gets all filterable properties referenced by a complex property. For convenience, the name of a non-complex property can be given that is then
	 * returned if it is filterable.
	 *
	 * @param {string} sName Name of a property
	 * @returns {object[]} The filterable properties
	 * @public
	 */
	PropertyHelper.prototype.getFilterableProperties = function(sName) {
		return extractProperties(this, sName, this.isFilterable);
	};
	aPropertyFacadeMethods.push("getFilterableProperties");

	/**
	 * Gets all filterable, non-complex properties.
	 *
	 * @returns {object[]} All filterable properties
	 * @public
	 */
	PropertyHelper.prototype.getAllFilterableProperties = function() {
		return this.getProperties().filter(function(oProperty) {
			return oProperty.isFilterable();
		});
	};


	/**
	 * Checks whether a property is goupable.
	 *
	 * @param {string} sName Name of a property
	 * @returns {boolean|null} Whether the property is groupable, or <code>null</code> if it is unknown
	 * @public
	 */
	PropertyHelper.prototype.isGroupable = function(sName) {
		var oProperty = this.getProperty(sName);

		if (oProperty) {
			return oProperty.isComplex() ? false : this.getRawProperty(sName).groupable;
		}

		return null;
	};
	aPropertyFacadeMethods.push("isGroupable");

	/**
	 * Gets all groupable properties referenced by a complex property. For convenience, the name of a non-complex property can be given that is then
	 * returned if it is groupable.
	 *
	 * @param {string} sName Name of a property
	 * @returns {object[]} The groupable properties
	 * @public
	 */
	PropertyHelper.prototype.getGroupableProperties = function(sName) {
		return extractProperties(this, sName, this.isGroupable);
	};
	aPropertyFacadeMethods.push("getGroupableProperties");

	/**
	 * Gets all groupable properties.
	 *
	 * @returns {object[]} All groupable properties
	 * @public
	 */
	PropertyHelper.prototype.getAllGroupableProperties = function() {
		return this.getProperties().filter(function(oProperty) {
			return oProperty.isGroupable();
		});
	};

	/**
	 * Gets the label of a property.
	 *
	 * @param {string} sName Name of a property
	 * @returns {string|null} The label of the property, or <code>null</code> if it is unknown
	 * @public
	 */
	PropertyHelper.prototype.getLabel = function(sName) {
		var oRawProperty = this.getRawProperty(sName);
		return oRawProperty ? oRawProperty.label : null;
	};
	aPropertyFacadeMethods.push("getLabel");

	/**
	 * Gets the label of the group a property is in.
	 *
	 * @param {string} sName Name of a property
	 * @returns {string|null} The group label of the property, or <code>null</code> if it is unknown
	 * @public
	 */
	PropertyHelper.prototype.getGroupLabel = function(sName) {
		var oRawProperty = this.getRawProperty(sName);
		return oRawProperty ? oRawProperty.groupLabel : null;
	};
	aPropertyFacadeMethods.push("getGroupLabel");

	/**
	 * Gets the binding path of a property.
	 *
	 * @param {string} sName Name of a property
	 * @returns {string|null} The binding path of the property, or <code>null</code> if it is complex or unknown
	 * @public
	 */
	PropertyHelper.prototype.getPath = function(sName) {
		var oProperty = this.getProperty(sName);

		if (oProperty) {
			return oProperty.isComplex() ? null : this.getRawProperty(sName).path;
		}

		return null;
	};
	aPropertyFacadeMethods.push("getPath");

	/**
	 * Checks whether a property is part of the key of its entity.
	 *
	 * @param {string} sName Name of a property
	 * @returns {string|null} Whether it is a key property, or <code>null</code> if it is unknown
	 * @public
	 */
	PropertyHelper.prototype.isKey = function(sName) {
		var oProperty = this.getProperty(sName);

		if (oProperty) {
			return oProperty.isComplex() ? false : this.getRawProperty(sName).key;
		}

		return null;
	};
	aPropertyFacadeMethods.push("isKey");

	/**
	 * Gets all key properties.
	 *
	 * @returns {object[]} All key properties
	 * @public
	 */
	PropertyHelper.prototype.getAllKeyProperties = function() {
		return this.getProperties().filter(function(oProperty) {
			return oProperty.isKey();
		});
	};

	/**
	 * Checks whether a property is visible.
	 *
	 * @param {string} sName Name of a property
	 * @returns {boolean|null} Whether the property is visible, or <code>null</code> if it is unknown
	 * @public
	 */
	PropertyHelper.prototype.isVisible = function(sName) {
		var oRawProperty = this.getRawProperty(sName);
		return oRawProperty ? oRawProperty.visible : null;
	};
	aPropertyFacadeMethods.push("isVisible");

	/**
	 * Gets all visible properties referenced by a complex property. For convenience, the name of a non-complex property can be given that is then
	 * returned if it is visible.
	 *
	 * @param {string} sName Name of a property
	 * @returns {object[]} The visible properties
	 * @public
	 */
	PropertyHelper.prototype.getVisibleProperties = function(sName) {
		return extractProperties(this, sName, this.isVisible);
	};
	aPropertyFacadeMethods.push("getVisibleProperties");

	/**
	 * Gets all visible properties.
	 *
	 * @returns {object[]} All visible properties
	 * @public
	 */
	PropertyHelper.prototype.getAllVisibleProperties = function() {
		return this.getProperties().filter(function(oProperty) {
			return oProperty.isVisible();
		});
	};

	/**
	 * Gets the export settings. Primarily to be used with the {@link sap.ui.export.Spreadsheet}.
	 *
	 * @see {@link topic:2691788a08fc43f7bf269ea7c6336caf Spreadsheet Export}
	 * @param {string} sName Name of a property
	 * @returns {object|null} Export settings
	 * @public
	 */
	PropertyHelper.prototype.getExportSettings = function(sName) {
		var oRawProperty = this.getRawProperty(sName);
		return oRawProperty && oRawProperty.exportSettings ? oRawProperty.exportSettings : null;
	};
	aPropertyFacadeMethods.push("getExportSettings");

	/**
	 * Gets the unique name (key) of a property.
	 *
	 * <b>Subclasses must not change the return value!</b>
	 *
	 * @param {string} sName Name of a property
	 * @returns {string|null} The name of the property, or <code>null</code> if it is unknown
	 * @public
	 */
	PropertyHelper.prototype.getName = function(sName) {
		var oRawProperty = this.getRawProperty(sName);
		return oRawProperty ? oRawProperty.name : null;
	};
	aPropertyFacadeMethods.push("getName");

	/**
	 * Gets the maximum possible conditions of a property.
	 *
	 * @param {string} sName Name of a property
	 * @returns {int|null} The maximum possible conditions of the property, or <code>null</code> if it is complex or unknown
	 * @public
	 */
	PropertyHelper.prototype.getMaxConditions = function(sName) {
		var oProperty = this.getProperty(sName);

		if (oProperty) {
			return oProperty.isComplex() ? null : this.getRawProperty(sName).maxConditions;
		}

		return null;
	};
	aPropertyFacadeMethods.push("getMaxConditions");

	/**
	 * Gets the type config of a property.
	 *
	 * @param {string} sName Name of a property
	 * @returns {object|null} The type config of the property, or <code>null</code> if it is complex or unknown
	 * @public
	 */
	PropertyHelper.prototype.getTypeConfig = function(sName) {
		var oProperty = this.getProperty(sName);

		if (oProperty) {
			return oProperty.isComplex() ? null : this.getRawProperty(sName).typeConfig;
		}

		return null;
	};
	aPropertyFacadeMethods.push("getTypeConfig");

	/**
	 * Gets the field help of a property.
	 *
	 * @param {string} sName Name of a property
	 * @returns {string|null} The field help of the property, or <code>null</code> if it is complex or unknown
	 * @public
	 */
	PropertyHelper.prototype.getFieldHelp = function(sName) {
		var oProperty = this.getProperty(sName);

		if (oProperty) {
			return oProperty.isComplex() ? null : this.getRawProperty(sName).fieldHelp;
		}

		return null;
	};
	aPropertyFacadeMethods.push("getFieldHelp");

	/**
	 * This hook is called when a new property facade is created. Can be used to add information to the facade, but not to remove or change
	 * information.
	 *
	 * @param {object} oFacade The property facade
	 * @protected
	 * @virtual
	 */
	PropertyHelper.prototype.onCreatePropertyFacade = function(oFacade) {};

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