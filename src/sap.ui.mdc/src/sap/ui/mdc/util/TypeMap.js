/*!
 * ${copyright}
 */

sap.ui.define([
	'sap/ui/mdc/enums/BaseType',
	'sap/ui/model/SimpleType',
	'sap/base/util/ObjectPath',
	'sap/ui/mdc/util/DateUtil',
	'sap/base/util/merge'
], (
	BaseType, SimpleType, ObjectPath, DateUtil, merge
) => {
	"use strict";

	const sDatePattern = "yyyy-MM-dd";
	const sTimePattern = "HH:mm:ss";

	const _cache = new WeakMap(); // We do not want to share Maps with derived TypeMaps

	/**
	 * Configuration class for type handling in delegates.
	 * Allows mapping of model types to {@link sap.ui.mdc.enums.BaseType} and enables model-specific type configuration.
	 *
	 * @namespace
	 * @author SAP SE
	 * @public
	 * @since 1.114.0
	 * @alias module:sap/ui/mdc/util/TypeMap
	 */
	const TypeMap = {};

	/*
	 * Gets values of the internal map, treating string values as references to other keys (aliases)
	 */
	TypeMap._get = function(sType) {
		const vEntry = this._getMap().get(sType);
		if (typeof vEntry === "string") {
			return this._get(vEntry);
		} else if (vEntry) {
			return [sType, vEntry];
		}
	};

	/*
	 * Updates the internal map's values, if not suppressed by TypeMap.freeze()
	 */
	TypeMap._set = function(sKey, vValue) {
		const oMap = this._getMap();
		if (oMap._bFrozen) {
			throw "TypeMap: You must not modify a frozen TypeMap";
		}
		oMap.set(sKey, vValue);
	};

	/*
	 * As derived typemaps want to act as singletons with separate data-sets, we provide a context based cache for each map's internal data.
	 * Please also see <code>module:sap/ui/mdc/util/TypeMap.import</code>
	 */
	TypeMap._getMap = function() {
		let oMap = _cache.get(this);
		if (!oMap) {
			oMap = new Map();
			_cache.set(this, oMap);
		}
		return oMap;
	};

	/**
	 * Sets a {@link sap.ui.mdc.enums.BaseType BaseType} and an optional model- or scenario-specific configuration method for a given {@link sap.ui.model.SimpleType} <code>ObjectPath</code> <code>string</code>.
	 *
	 * As default, <code>string</code> is returned.
	 *
	 * @final
	 * @param {string} sType <code>Objectpath</code> <code>string</code> for {@link sap.ui.model.SimpleType}
	 * @param {sap.ui.mdc.enums.BaseType|function} vBaseType {@link sap.ui.mdc.enums.BaseType BaseType} fitting the given <code>sType</code> parameter or method returning a {@link sap.ui.mdc.enums.BaseType BaseType} based on type configuration
	 * @param {function} [fnOptions] Optional customizing method for format options and constraints. See {@link module:sap/ui/mdc/DefaultTypeMap DefaultTypeMap} for examples.
	 * @public
	 */
	TypeMap.set = function(sType, vBaseType, fnOptions) {
		this._set(sType, [vBaseType, fnOptions]);
	};

	/**
	 * Allows alternative identifiers for types, such as a Boolean for {@link sap.ui.model.type.Boolean}.
	 *
	 * @final
	 * @param {string} sType <code>Objectpath</code> <code>string</code> for {@link sap.ui.model.SimpleType}
	 * @param {string} sAlias Alternative identifier for the <code>sType</code> parameter
	 * @public
	 */
	TypeMap.setAlias = function(sType, sAlias) {
		this._set(sType, sAlias);
	};

	/**
	 * Returns the <code>sap.ui.mdc.enums.BaseType</code> or a method to resolve the <code>BaseType</code> dynamically for the given type
	 *
	 * @param {string} sType <code>Objectpath</code> <code>string</code> for {@link sap.ui.model.SimpleType}
	 * @returns {sap.ui.mdc.enums.BaseType|function} BaseType configured for the {@link sap.ui.model.SimpleType} or function to resolve BaseType based on configuration
	 * @private
	 */
	TypeMap._getBaseType = function(sType) {
		const aResult = this._get(sType);
		return aResult && aResult[1][0];
	};

	/**
	 * Returns the optional customizing method configured for a {@link sap.ui.model.SimpleType}
	 *
	 * @param {string} sType <code>Objectpath</code> <code>string</code> for {@link sap.ui.model.SimpleType}
	 * @returns {function} Method for model-specific type configuration. See <code>sap.ui.mdc.DefaultTypeMap</code> for examples.
	 * @private
	 */
	TypeMap._getOptions = function(sType) {
		const aResult = this._get(sType);
		return aResult && aResult[1][1];
	};

	/**
	 * Returns the ObjectPath string for a given type alias.
	 *
	 * @param {string} sAlias Identifier for a configured type alias
	 * @returns {string} <code>Objectpath</code> <code>string</code> for {@link sap.ui.model.SimpleType}
	 * @private
	 */
	TypeMap._getClass = function(sAlias) {
		const aResult = this._get(sAlias);
		return aResult && aResult[0];
	};

	/**
	 * Exports the current data of the <code>TypeMap</code>.
	 *
	 * @final
	 * @returns {Array} <code>Array</code> created from this <code>TypeMap</code>'s internal <code>Map</code>
	 * @public
	 */
	TypeMap.export = function() {
		return Array.from(this._getMap());
	};

	/**
	 * Imports the data of a <code>TypeMap</code> into another <code>TypeMap</code>.
	 *
	 * @final
	 * @param {module:sap/ui/mdc/util/TypeMap} oTypeMap <code>TypeMap</code> that gets imported
	 * @public
	 */
	TypeMap.import = function(oTypeMap) {
		oTypeMap.export().forEach((aEntry) => {
			this._getMap().set(aEntry[0], aEntry[1]);
		});
	};

	/**
	 * Prevents further modification of the data of a <code>TypeMap</code>.
	 *
	 * @final
	 * @public
	 */
	TypeMap.freeze = function() {
		this._getMap()._bFrozen = true;
	};



	// <!-- TypeUtil functionality -->

	/**
	 * To determine which internal controls to render, either the {@link sap.ui.mdc.Field Field}, the {@link sap.ui.mdc.MultiValueField MultiValueField},
	 * or the {@link sap.ui.mdc.FilterField FilterField} control needs information about whether the type represents a <code>date</code>, a <code>number</code>, or another {@link sap.ui.mdc.enums.BaseType BaseType}.
	 *
	 * As default, <code>string</code> is returned.
	 *
	 * @final
	 * @param {string} sType Given type string or {@link sap.ui.model.SimpleType}
	 * @param {object} oFormatOptions Used format options
	 * @param {object} oConstraints Used constraints
	 * @returns {sap.ui.mdc.enums.BaseType} Corresponding {@link sap.ui.mdc.enums.BaseType BaseType}, for example, <code>Date</code>, <code>DateTime</code> or <code>Time</code>
	 * @public
	 */
	TypeMap.getBaseType = function(sType, oFormatOptions, oConstraints) {
		const vBaseType = this._getBaseType(sType);
		return vBaseType && (typeof vBaseType === "function" ? vBaseType(oFormatOptions, oConstraints) : vBaseType) || BaseType.String;
	};

	/**
	 * Convenience method to retrieve the <code>BaseType</code> for a given {@link sap.ui.model.SimpleType SimpleType}.
	 * @final
	 * @param {sap.ui.model.SimpleType} oType Given type string or {@link sap.ui.model.SimpleType}
	 * @returns {sap.ui.mdc.enums.BaseType} Corresponding {@link sap.ui.mdc.enums.BaseType BaseType}, for example, <code>Date</code>, <code>DateTime</code> or <code>Time</code>
	 * @public
	 */
	TypeMap.getBaseTypeForType = function(oType) {
		return this.getBaseType(oType.getMetadata && oType.getMetadata().getName(), oType.getFormatOptions(), oType.getConstraints());
	};

	/**
	 * Gets the data type class name for a given name or alias.
	 * @final
	 * @param {string} sType Given model-specific type
	 * @returns {string} Data type name
	 * @public
	 */
	TypeMap.getDataTypeClassName = function(sType) {
		return this._getClass(sType) || sType;
	};

	/**
	 * Gets a data type class based on a given name.
	 *
	 * <b>Note:</b> The module of the data type needs to be loaded before.
	 * @final
	 * @param {string} sDataType Class path as <code>string</code> where each name is separated by '.'
	 * @returns {function(new: sap.ui.model.SimpleType)} Corresponding data type class
	 * @public
	 */
	TypeMap.getDataTypeClass = function(sDataType) {
		const sTypeName = this.getDataTypeClassName(sDataType);
		const TypeClass = sTypeName ?
			sap.ui.require(sTypeName.replace(/\./g, "/")) || ObjectPath.get(sTypeName) :
			undefined;
		if (!TypeClass) {
			throw new Error("DataType '" + sDataType + "' cannot be determined");
		}
		return TypeClass;
	};

	/**
	 * Gets a data type instance based on a given <code>ObjectPath</code>, <code>FormatOptions</code>, and <code>Constraints</code>.
	 *
	 * @final
	 * @param {string} sDataType Class path as <code>string</code> where each name is separated by '.'
	 * @param {object} [oFormatOptions] Format options for the data type
	 * @param {object} [oConstraints] Constraints for the data type
	 * @param {object} [oOptions] Additional options for overrides
	 * @returns {sap.ui.model.SimpleType} Instance of the resolved data type
	 * @public
	 */
	TypeMap.getDataTypeInstance = function(sDataType, oFormatOptions, oConstraints, oOptions) {
		const TypeClass = this.getDataTypeClass(sDataType);
		const fnOptions = this._getOptions(TypeClass.getMetadata().getName());
		const aOverrides = fnOptions && fnOptions(merge({}, oFormatOptions), merge({}, oConstraints), oOptions);
		oFormatOptions = aOverrides && aOverrides[0] || oFormatOptions;
		oConstraints = aOverrides && aOverrides[1] || oConstraints;
		return new TypeClass(oFormatOptions, oConstraints);
	};

	/**
	 * Gets a type mapping configuration <code>object</code> for a given type <code>string</code> or {@link sap.ui.model.SimpleType SimpleType}.
	 * @final
	 * @param {string|sap.ui.model.SimpleType} vType Given data type as <code>string</code> or type
	 * @param {object} [oFormatOptions] Format options for the given data type
	 * @param {object} [oConstraints] Constraints for the given data type
	 * @returns {sap.ui.mdc.TypeConfig} Type config <code>object</code>
	 * @public
	 */
	TypeMap.getTypeConfig = function(vType, oFormatOptions, oConstraints) {
		const oType = this._normalizeType.call(this, vType, oFormatOptions, oConstraints);
		return {
			className: oType.getMetadata().getName(),
			typeInstance: oType,
			baseType: this.getBaseTypeForType(oType)
		};
	};

	/**
	 * Converts a value into a <code>string</code> using a designated type.
	 *
	 * The value is not checked for validity. The used values must be compatible with the used basic type.
	 *
	 * <b>Note:</b> Number types are not converted, the number conversion is done by the SAPUI5 flexibility handling.
	 * @final
	 * @param {object} vValue Typed value
	 * @param {string|sap.ui.model.SimpleType} vType Data type considered for conversion
	 * @param {object} [oFormatOptions] Format options for the data type
	 * @param {object} [oConstraints] Constraints for the data type
	 * @returns {string} Converted value
	 * @public
	 */
	TypeMap.externalizeValue = function(vValue, vType, oFormatOptions, oConstraints) {
		const oTypeInstance = this._normalizeType.call(this, vType, oFormatOptions, oConstraints);
		const sBaseType = this.getBaseTypeForType(oTypeInstance);
		switch (sBaseType) {
			case BaseType.DateTime:
				return DateUtil.typeToISO(vValue, oTypeInstance, sBaseType);

			case BaseType.Date:
				return DateUtil.typeToString(vValue, oTypeInstance, sDatePattern);

			case BaseType.Time:
				return DateUtil.typeToString(vValue, oTypeInstance, sTimePattern);

			case BaseType.Boolean:
				return vValue;

			case BaseType.Numeric:
				if (typeof vValue !== "string" && (oTypeInstance.getMetadata().getName() === "sap.ui.model.odata.type.Int64" || oTypeInstance.getMetadata().getName() === "sap.ui.model.odata.type.Decimal")) {
					// INT64 and Decimal parsed always to string, if for some reason a number comes in -> convert to string, but don't use type at this might have locale dependent formatting
					return vValue.toString();
				}
				return vValue;

			default:
				// just use type to convert
				return oTypeInstance.formatValue(vValue, "string");
		}
	};

	/**
	 * Converts a <code>string</code> into a type-based value.
	 *
	 * The value is not checked for validity. The used values must be compatible with the used basic type.
	 *
	 * <b>Note:</b> Number types are not converted. The number conversion is done by the SAPUI5 flexibility handling.
	 * @final
	 * @param {string} vValue Externalized value
	 * @param {string|sap.ui.model.SimpleType} vType Data type considered for conversion
	 * @param {object} [oFormatOptions] Format options for the data type
	 * @param {object} [oConstraints] Constraints for the data type
	 * @returns {object} Converted value
	 * @public
	 */
	TypeMap.internalizeValue = function(vValue, vType, oFormatOptions, oConstraints) {
		const oTypeInstance = this._normalizeType.call(this, vType, oFormatOptions, oConstraints);
		const sBaseType = this.getBaseTypeForType(oTypeInstance);
		switch (sBaseType) {
			case BaseType.DateTime:
				// eslint-disable-next-line new-cap
				return DateUtil.ISOToType(vValue, oTypeInstance, sBaseType);

			case BaseType.Date:
				if (vValue.indexOf("T") >= 0) { // old variant with DateTime for DateValues
					vValue = vValue.substr(0, vValue.indexOf("T")); // just take the date part
				}
				return DateUtil.stringToType(vValue, oTypeInstance, sDatePattern);

			case BaseType.Time:
				return DateUtil.stringToType(vValue, oTypeInstance, sTimePattern);

			case BaseType.Boolean:
				return vValue;

			case BaseType.Numeric:
				if (typeof vValue !== "string" && (oTypeInstance.getMetadata().getName() === "sap.ui.model.odata.type.Int64" || oTypeInstance.getMetadata().getName() === "sap.ui.model.odata.type.Decimal")) {
					// INT64 and Decimal parsed always to string, if for some reason a number comes in -> convert to string, but don't use type at this might have locale dependent formatting
					return vValue.toString();
				}
				return vValue;

			default:
				// just use type to convert
				return oTypeInstance.parseValue(vValue, "string");
		}
	};

	TypeMap._normalizeType = function(vType, oFormatOptions, oConstraints) {
		if (vType instanceof SimpleType) { // simpletype
			return vType;
		}
		return this.getDataTypeInstance(vType, oFormatOptions, oConstraints); // string
	};

	/**
	 * If the {@link sap.ui.mdc.Field Field} control is used, the used data type comes from the binding.
	 * Some data types (like <code>Currency</code> or <code>Unit</code>) might need some initialization.
	 * To initialize the internal ("cloned") type later on, the result of this function
	 * is provided to <code>initializeInternalType</code>.
	 *
	 * @param {sap.ui.model.SimpleType} oType Type from binding
	 * @param {any} vValue Given value
	 * @returns {null|object} Information needed to initialize internal type
	 * @private
	 * @ui5-restricted sap.ui.mdc.field.FieldBase
	 * @since 1.115.0
	 */
	TypeMap.initializeTypeFromValue = function(oType, vValue) {

		return {}; // to mark initialization as finished as not needed for normal types

	};

	/**
	 * This function initializes the internal ("cloned") type.
	 *
	 * @param {sap.ui.model.SimpleType} oType Original type (e.g. from Binding)
	 * @param {object} oTypeInitialization Information needed to initialize internal type (created in <code>initializeTypeFromValue</code>)
	 * @private
	 * @ui5-restricted sap.ui.mdc.field.FieldBase
	 * @since 1.115.0
	 */
	TypeMap.initializeInternalType = function(oType, oTypeInitialization) {

	};

	return TypeMap;
});