/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/ui/base/Object",
	"sap/ui/base/DataType",
	"sap/base/Log",
	"sap/base/util/deepClone",
	"sap/base/util/isPlainObject"
], function(
	BaseObject,
	DataType,
	Log,
	deepClone,
	isPlainObject
) {
	"use strict";

	/*global Set, WeakMap */

	/*
	 * Key-value map to define the characteristics of a property attribute, where the key is the name of the attribute.
	 *
	 * Metadata information:
	 * - type
	 *     Any type that is also allowed for a control property.
	 *     Examples: "string", "string[]", "sap.ui.mdc.MyEnum", "any"
	 * - mandatory (optional, default=false)
	 *     Whether this attribute must be provided.
	 * - allowedForComplexProperty (optional, default=false)
	 *     Whether it is allowed to provide this attribute for a complex property.
	 * - defaultValue (optional):
	 *     This can either be a value, or a reference to another attribute in the form "attribute:x", with x being the name of the other
	 *     attribute. The default value of this attribute is then the value of the other attribute. This works only one level deep.
	 *     Examples: "attribute:name"
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
		groupLabel: {
			type: "string",
			defaultValue: "",
			allowedForComplexProperty: true
		},
		visible: {
			type: "boolean",
			defaultValue: true,
			allowedForComplexProperty: true
		},
		propertyInfos: {
			type: "string[]",
			allowedForComplexProperty: true
		},
		exportSettings: {
			type: "object",
			defaultValue: null,
			allowedForComplexProperty: true
		},
		typeConfig: {
			type: "object",
			defaultValue: null
		},
		maxConditions: {
			type: "int",
			defaultValue: null
		},
		filterable: {
			type: "boolean",
			defaultValue: true
		},
		sortable: {
			type: "boolean",
			defaultValue: true
		},
		fieldHelp: {
			type: "string",
			defaultValue: ""
		}
	};

	var aMandatoryAttributes = Object.keys(mAttributeMetadata).filter(function(sAttribute) {
		return mAttributeMetadata[sAttribute].mandatory;
	});

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
		var aClonedProperties = [];

		aProperties.forEach(function(oProperty) {
			var oClonedProperty;
			var oTypeInstance;

			// The type instance is not a plain object and cannot be cloned with sap.base.util.deepClone.
			if (oProperty.typeConfig && "typeInstance" in oProperty.typeConfig) {
				oTypeInstance = oProperty.typeConfig.typeInstance;
				delete oProperty.typeConfig.typeInstance;
			}

			oClonedProperty = deepClone(oProperty);

			if (oTypeInstance) {
				oProperty.typeConfig.typeInstance = oTypeInstance;
				oClonedProperty.typeConfig.typeInstance = oTypeInstance;
			}

			aClonedProperties.push(oClonedProperty);
		});

		return Object.freeze(aClonedProperties);
	}

	function prepareProperties(aProperties, mProperties) {
		aProperties.forEach(function(oProperty) {
			var aDependenciesForDefaults = [];
			var bIsComplex = isComplex(oProperty);

			for (var sAttributeName in mAttributeMetadata) {
				var mAttribute = mAttributeMetadata[sAttributeName];

				if (bIsComplex && !mAttribute.allowedForComplexProperty) {
					continue;
				}

				if ("defaultValue" in mAttribute && oProperty[sAttributeName] == null) {
					if (typeof mAttribute.defaultValue === "string" && mAttribute.defaultValue.startsWith("attribute:")) {
						// Attributes that reference another attribute for the default value need to be processed in a second step.
						// This is only supported 1 level deep.
						aDependenciesForDefaults.push({
							source: mAttribute.defaultValue.substring(mAttribute.defaultValue.indexOf(":") + 1),
							target: sAttributeName
						});
					} else {
						oProperty[sAttributeName] = mAttribute.defaultValue;
					}
				}
			}

			aDependenciesForDefaults.forEach(function(mDependency) {
				oProperty[mDependency.target] = oProperty[mDependency.source];
			});

			if (bIsComplex) {
				Object.defineProperty(oProperty, "_relatedProperties", {
					value: oProperty.propertyInfos.map(function(sKey) {
						return mProperties[sKey];
					})
				});
			}

			Object.freeze(oProperty);
		});
	}

	function createPropertyMap(aProperties) {
		var mProperties = {};

		aProperties.forEach(function(oProperty) {
			mProperties[oProperty.name] = oProperty;
		});

		return Object.freeze(mProperties);
	}

	function extractProperties(oPropertyHelper, vProperty, fnFilter) {
		var oProperty = oPropertyHelper.getProperty(vProperty);

		if (oPropertyHelper.isComplex(oProperty)) {
			return oPropertyHelper.getPropertiesFromComplexProperty(oProperty).filter(function(oProperty) {
				return fnFilter.call(oPropertyHelper, oProperty);
			});
		} else if (fnFilter.call(oPropertyHelper, oProperty)) {
			return [oProperty];
		}

		return oProperty ? [] : null;
	}

	/**
	 * Constructor for a new helper for the given properties.
	 *
	 * @param {object[]} aProperties The properties to process in this helper
	 * @param {sap.ui.base.ManagedObject} [oParent] A reference to an instance that will act as the parent of this helper
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
	 * @ui5-restricted sap.ui.mdc
	 * @experimental
	 * @since 1.83
	 * @alias sap.ui.mdc.util.PropertyHelper
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var PropertyHelper = BaseObject.extend("sap.ui.mdc.util.PropertyHelper", {
		constructor: function(aProperties, oParent) {
			BaseObject.call(this);

			var bParentIsValid = BaseObject.isA(oParent, ["sap.ui.base.ManagedObject"]);

			if (oParent != null && !bParentIsValid) {
				throw new Error("The type of the parent is invalid");
			}

			this.validateProperties(aProperties);

			var aClonedProperties = cloneProperties(aProperties);

			_private.set(this, {
				oParent: bParentIsValid ? oParent : null,
				aProperties: aClonedProperties,
				mProperties: createPropertyMap(aClonedProperties)
			});

			prepareProperties(_private.get(this).aProperties, _private.get(this).mProperties);
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

		var sAttribute;
		var bIsComplex = isComplex(oProperty);

		for (sAttribute in oProperty) {
			if (!(sAttribute in mAttributeMetadata)) {
				reportInvalidProperty("Property contains invalid attribute '" + sAttribute + "'.", oProperty);
			} else if (bIsComplex && !mAttributeMetadata[sAttribute].allowedForComplexProperty) {
				reportInvalidProperty("Complex property contains invalid attribute '" + sAttribute + "'.", oProperty);
			} else if (!DataType.getType(mAttributeMetadata[sAttribute].type).isValid(oProperty[sAttribute])
					   && (mAttributeMetadata[sAttribute].mandatory || oProperty[sAttribute] != null)) {
				// Optional attributes may have null or undefined as value.
				throwInvalidPropertyError("The value of '" + sAttribute + "' is invalid.", oProperty);
			}
		}

		aMandatoryAttributes.forEach(function(sMandatoryAttribute) {
			if (!(sMandatoryAttribute in oProperty)) {
				reportInvalidProperty("Property does not contain mandatory attribute '" + sMandatoryAttribute + "'.", oProperty);
			}
		});

		if (bIsComplex) {
			var aSimpleProperties = oProperty.propertyInfos;
			var oUniquePropertiesSet = new Set(aSimpleProperties);

			if (aSimpleProperties.length === 0) {
				throwInvalidPropertyError("Complex property does not reference existing properties", aSimpleProperties);
			}

			if (oUniquePropertiesSet.size !== aSimpleProperties.length) {
				throwInvalidPropertyError("Complex property contains duplicate keys in the 'propertyInfos' attribute.", aSimpleProperties);
			}

			aProperties.forEach(function(oCurrentProperty) {
				if (oUniquePropertiesSet.has(oCurrentProperty.name)) {
					if (isComplex(oCurrentProperty)) {
						throwInvalidPropertyError("Complex property references other complex properties.", oCurrentProperty);
					}
					oUniquePropertiesSet.delete(oCurrentProperty.name);
				}
			});

			if (oUniquePropertiesSet.size > 0) {
				throwInvalidPropertyError("Complex property references non-existing properties.", oProperty);
			}
		}
	};

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
	 * @returns {object[]|null} All properties
	 * @public
	 */
	PropertyHelper.prototype.getProperties = function() {
		var oPrivate = _private.get(this);
		return oPrivate ? oPrivate.aProperties : null;
	};

	/**
	 * Gets the properties as a key-value map, where the key is the <code>name</code> attribute of a property.
	 *
	 * @returns {object|null} A map of all properties
	 * @public
	 */
	PropertyHelper.prototype.getPropertyMap = function() {
		var oPrivate = _private.get(this);
		return oPrivate ? oPrivate.mProperties : null;
	};

	/**
	 * Gets a property by its <code>name</code>. For convenience, a property can be given that is then returned.
	 *
	 * @param {string|object} vProperty A property or its name
	 * @returns {object|null} The property, or <code>null</code> if it is unknown
	 * @public
	 */
	PropertyHelper.prototype.getProperty = function(vProperty) {
		var mProperties = this.getPropertyMap();

		if (typeof vProperty === "string") {
			return mProperties[vProperty] || null;
		}

		if (vProperty && vProperty.name && typeof vProperty.name === "string") {
			var oFoundProperty = mProperties[vProperty.name];

			if (oFoundProperty && oFoundProperty === vProperty) {
				return oFoundProperty;
			}
		}

		return null;
	};

	/**
	 * Checks whether a property is a complex property.
	 *
	 * @param {string|object} vProperty A property or its name
	 * @returns {boolean|null} Whether the property is complex, or <code>null</code> if it is unknown
	 * @public
	 */
	PropertyHelper.prototype.isComplex = function(vProperty) {
		var oProperty = this.getProperty(vProperty);
		return oProperty ? isComplex(oProperty) : null;
	};

	function isComplex(oProperty) {
		return oProperty ? "propertyInfos" in oProperty : false;
	}

	/**
	 * Gets all property names referenced by a complex property.
	 *
	 * @param {string|object} vProperty A complex property or its name
	 * @returns {string[]|null}
	 *     The names of the properties the complex property references.
	 *     Returns an empty array if the property is not complex, or <code>null</code> if it is unknown.
	 * @public
	 */
	PropertyHelper.prototype.getKeysFromComplexProperty = function(vProperty) {
		var oProperty = this.getProperty(vProperty);
		return oProperty ? oProperty.propertyInfos || [] : null;
	};

	/**
	 * Gets all properties referenced by a complex property.
	 *
	 * @param {string|object} vProperty A complex property or its name
	 * @returns {object[]|null}
	 *     The properties the complex property references.
	 *     Returns an empty array if the property is not complex, or <code>null</code> if it is unknown.
	 * @public
	 */
	PropertyHelper.prototype.getPropertiesFromComplexProperty = function(vProperty) {
		var oProperty = this.getProperty(vProperty);
		return oProperty ? oProperty._relatedProperties || [] : null;
	};

	/**
	 * Checks whether a property is sortable.
	 *
	 * @param {string|object} vProperty A property or its name
	 * @returns {boolean|null}
	 *     Whether the property is sortable.
	 *     Returns <code>false</code> for complex properties.
	 *     Returns <code>null</code> if the property is unknown.
	 * @public
	 */
	PropertyHelper.prototype.isSortable = function(vProperty) {
		var oProperty = this.getProperty(vProperty);

		if (this.isComplex(oProperty)) {
			return false;
		}

		return oProperty ? oProperty.sortable : null;
	};

	/**
	 * Gets all sortable properties referenced by a complex property. For convenience, a non-complex property can be given that is then
	 * returned if it is sortable.
	 *
	 * @param {string|object} vProperty A property or its name
	 * @returns {object[]|null} The sortable properties, or <code>null</code> if the property is unknown
	 * @public
	 */
	PropertyHelper.prototype.getSortableProperties = function(vProperty) {
		return extractProperties(this, vProperty, this.isSortable);
	};

	/**
	 * Gets all sortable, non-complex properties.
	 *
	 * @returns {object[]} All sortable properties
	 * @public
	 */
	PropertyHelper.prototype.getAllSortableProperties = function() {
		return this.getProperties().filter(function(oProperty) {
			return this.isSortable(oProperty);
		}, this);
	};

	/**
	 * Checks whether a property is filterable.
	 *
	 * @param {string|object} vProperty A property or its name
	 * @returns {boolean}
	 *     Whether the property is filterable.
	 *     Returns <code>true</code> for complex properties.
	 *     Returns <code>null</code> if the property is unknown.
	 * @public
	 */
	PropertyHelper.prototype.isFilterable = function(vProperty) {
		var oProperty = this.getProperty(vProperty);

		if (this.isComplex(oProperty)) {
			return false;
		}

		return oProperty ? oProperty.filterable : null;
	};

	/**
	 * Gets all filterable properties referenced by a complex property. For convenience, a non-complex property can be given that is then
	 * returned if it is filterable.
	 *
	 * @param {string|object} vProperty A property or its name
	 * @returns {object[]|null} The filterable properties, or <code>null</code> if the property is unknown
	 * @public
	 */
	PropertyHelper.prototype.getFilterableProperties = function(vProperty) {
		return extractProperties(this, vProperty, this.isFilterable);
	};

	/**
	 * Gets all filterable, non-complex properties.
	 *
	 * @returns {object[]} All filterable properties
	 * @public
	 */
	PropertyHelper.prototype.getAllFilterableProperties = function() {
		return this.getProperties().filter(function(oProperty) {
			return this.isFilterable(oProperty);
		}, this);
	};

	/**
	 * Gets the label of a property.
	 *
	 * @param {string|object} vProperty A property or its name
	 * @returns {string|null} The label of the property, or <code>null</code> if it is unknown
	 * @public
	 */
	PropertyHelper.prototype.getLabel = function(vProperty) {
		var oProperty = this.getProperty(vProperty);
		return oProperty ? oProperty.label : null;
	};

	/**
	 * Gets the label of the group a property is in.
	 *
	 * @param {string|object} vProperty A property or its name
	 * @returns {string|null} The group label of the property, or <code>null</code> if it is unknown
	 * @public
	 */
	PropertyHelper.prototype.getGroupLabel = function(vProperty) {
		var oProperty = this.getProperty(vProperty);
		return oProperty ? oProperty.groupLabel : null;
	};

	/**
	 * Gets the binding path of a property.
	 *
	 * @param {string|object} vProperty A property or its name
	 * @returns {string|null} The binding path of the property, or <code>null</code> if it is complex or unknown
	 * @public
	 */
	PropertyHelper.prototype.getPath = function(vProperty) {
		var oProperty = this.getProperty(vProperty);

		if (this.isComplex(oProperty)) {
			return null;
		}

		return oProperty ? oProperty.path : null;
	};

	/**
	 * Checks whether a property is visible.
	 *
	 * @param {string|object} vProperty A property or its name
	 * @returns {boolean|null} Whether the property is visible, or <code>null</code> if it is unknown
	 * @public
	 */
	PropertyHelper.prototype.isVisible = function(vProperty) {
		var oProperty = this.getProperty(vProperty);
		return oProperty ? oProperty.visible : null;
	};

	/**
	 * Gets all visible properties referenced by a complex property. For convenience, a non-complex property can be given that is then
	 * returned if it is visible.
	 *
	 * @param {string|object} vProperty A property or its name
	 * @returns {object[]|null} The visible properties, or <code>null</code> if the property is unknown
	 * @public
	 */
	PropertyHelper.prototype.getVisibleProperties = function(vProperty) {
		return extractProperties(this, vProperty, this.isVisible);
	};

	/**
	 * Gets all visible properties.
	 *
	 * @returns {object[]} All visible properties
	 * @public
	 */
	PropertyHelper.prototype.getAllVisibleProperties = function() {
		return this.getProperties().filter(function(oProperty) {
			return this.isVisible(oProperty);
		}, this);
	};

	/**
	 * Gets the export settings. Primarily to be used with the {@link sap.ui.export.Spreadsheet}.
	 *
	 * @see {@link topic:2691788a08fc43f7bf269ea7c6336caf Spreadsheet Export}
	 * @param {string|object} vProperty A property or its name
	 * @returns {object|null} Export settings
	 * @public
	 */
	PropertyHelper.prototype.getExportSettings = function(vProperty) {
		var oProperty = this.getProperty(vProperty);
		return oProperty && oProperty.exportSettings ? oProperty.exportSettings : null;
	};

	/**
	 * Gets the unique name (key) of a property.
	 *
	 * @param {string|object} vProperty A property or its name
	 * @returns {string|null} The name of the property, or <code>null</code> if it is unknown
	 * @public
	 */
	PropertyHelper.prototype.getName = function(vProperty) {
		var oProperty = this.getProperty(vProperty);
		return oProperty ? oProperty.name : null;
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