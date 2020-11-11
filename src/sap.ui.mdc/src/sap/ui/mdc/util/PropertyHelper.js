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

	function createPropertyFacades(aProperties, oPropertyHelper) {
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

	function finalizePropertyFacades(aFacades, oPropertyHelper) {
		aFacades.forEach(function(oFacade) {
			oPropertyHelper.onCreatePropertyFacade(oFacade);
			Object.freeze(oFacade);
		});
	}

	function deepFreeze(oObject) {
		var aKeys = Object.getOwnPropertyNames(oObject);

		for (var i = 0; i < aKeys.length; i++) {
			var vValue = oObject[aKeys[i]];

			if (isPlainObject(vValue) || Array.isArray(vValue)) {
				if (aKeys[i] === "_relatedProperties") {
					Object.freeze(vValue);
				} else {
					deepFreeze(vValue);
				}
			}
		}

		return Object.freeze(oObject);
	}

	function prepareProperties(aProperties, mProperties, oPropertyHelper) {
		aProperties.forEach(function(oProperty) {
			var aDependenciesForDefaults = [];
			var bIsComplex = oPropertyHelper.isPropertyComplex(oProperty);

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

			deepFreeze(oProperty);
		});
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
			return oProperty.getPropertiesFromComplexProperty().filter(function(oProperty) {
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

			if (oParent && !bParentIsValid) {
				throw new Error("The type of the parent is invalid");
			}

			this.validateProperties(aProperties);

			var aClonedProperties = cloneProperties(aProperties);
			var aPropertyFacades = createPropertyFacades(aClonedProperties, this);
			var mProperties = createPropertyMap(aClonedProperties);
			var mPropertyFacades = createPropertyMap(aClonedProperties, aPropertyFacades);

			_private.set(this, {
				oParent: oParent || null,
				aProperties: aClonedProperties,
				mProperties: mProperties,
				aPropertyFacades: aPropertyFacades,
				mPropertyFacades: mPropertyFacades
			});

			prepareProperties(aClonedProperties, mPropertyFacades, this);
			finalizePropertyFacades(aPropertyFacades, this);
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
		var bIsComplex = this.isPropertyComplex(oProperty);

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
					if (this.isPropertyComplex(oCurrentProperty)) {
						throwInvalidPropertyError("Complex property references other complex properties.", oCurrentProperty);
					}
					oUniquePropertiesSet.delete(oCurrentProperty.name);
				}
			}.bind(this));

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
	 * Gets all property names referenced by a complex property.
	 *
	 * @param {string} sName Name of a complex property
	 * @returns {string[]} The names of the properties the complex property references
	 * @public
	 */
	PropertyHelper.prototype.getKeysFromComplexProperty = function(sName) {
		var oRawProperty = this.getRawProperty(sName);
		return (oRawProperty && oRawProperty.propertyInfos) || [];
	};
	aPropertyFacadeMethods.push("getKeysFromComplexProperty");

	/**
	 * Gets all properties referenced by a complex property.
	 *
	 * @param {string} sName Name of a complex property
	 * @returns {object[]} The properties the complex property references
	 * @public
	 */
	PropertyHelper.prototype.getPropertiesFromComplexProperty = function(sName) {
		var oRawProperty = this.getRawProperty(sName);
		return (oRawProperty && oRawProperty._relatedProperties) || [];
	};
	aPropertyFacadeMethods.push("getPropertiesFromComplexProperty");

	/**
	 * Checks whether a property is sortable.
	 *
	 * @param {string} sName Name of a property
	 * @returns {boolean|null}
	 *     Whether the property is sortable.
	 *     Returns <code>false</code> for complex properties.
	 *     Returns <code>null</code> if the property is unknown.
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
	 * Gets all sortable properties referenced by a complex property. For convenience, a non-complex property can be given that is then
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
	 * @returns {boolean|null}
	 *     Whether the property is filterable.
	 *     Returns <code>true</code> for complex properties.
	 *     Returns <code>null</code> if the property is unknown.
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
	 * Gets all filterable properties referenced by a complex property. For convenience, a non-complex property can be given that is then
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
	 * Gets all visible properties referenced by a complex property. For convenience, a non-complex property can be given that is then
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