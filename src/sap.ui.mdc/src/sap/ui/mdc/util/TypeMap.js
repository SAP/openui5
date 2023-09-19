/*!
 * ${copyright}
 */

sap.ui.define([
	'sap/ui/mdc/enums/BaseType',
	'sap/ui/model/SimpleType',
	'sap/base/util/ObjectPath',
	'sap/ui/mdc/util/DateUtil',
	'sap/base/util/merge'
], function(
	BaseType, SimpleType, ObjectPath, DateUtil, merge
) {
	"use strict";

	const sDatePattern = "yyyy-MM-dd";
	const sTimePattern = "HH:mm:ss";

	const _cache = new WeakMap(); // We do not want to share Maps with derived TypeMaps

	/**
	 * Configuration class for type-handling in MDC delegates.
	 * Allows mapping of model-types to <code>sap.ui.mdc.enums.BaseType</code> and enables model-specific type configuration.
	 *
	 * <b>Note:</b>
	 * This utility is experimental and the API/behavior is not finalized and hence this should not be used for productive usage.
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
	TypeMap._get = function (sType) {
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
	TypeMap._set = function (sKey, vValue) {
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
	TypeMap._getMap = function () {
		let oMap = _cache.get(this);
		if (!oMap) {
			oMap = new Map();
			_cache.set(this, oMap);
		}
		return oMap;
	};

	/**
	 * Sets a BaseType and an optional model- or scenario-specific configuration method for a given {@link sap.ui.model.SimpleType} ObjectPath string
	 *
	 * As default <code>string</code> is returned.
	 *
	 * @final
	 * @param {string} sType Objectpath string for {@link sap.ui.model.SimpleType}
	 * @param {sap.ui.mdc.enums.BaseType|function} vBaseType BaseType fitting the given sType or method returning a BaseType based on type configuration
	 * @param {function} [fnOptions] Optional customizing method for formatoptions and constraints. See {@link sap.ui.mdc.DefaultTypeMap} for examples.
	 * @public
	 */
	TypeMap.set = function (sType, vBaseType, fnOptions) {
		this._set(sType, [vBaseType, fnOptions]);
	};

	/**
	 * Allows alternative identifiers for Types, such as "Boolean" for "{@link sap.ui.model.type.Boolean}"
	 *
	 * @final
	 * @param {string} sType Objectpath string for {@link sap.ui.model.SimpleType}
	 * @param {string} sAlias Alternative identifier for sType
	 * @public
	 */
	TypeMap.setAlias = function (sType, sAlias) {
		this._set(sType, sAlias);
	};

	/**
	 * Returns the <code>sap.ui.mdc.enums.BaseType</code> or a method to resolve the BaseType dynamically for the given type
	 *
	 * @param {string} sType Objectpath string for {@link sap.ui.model.SimpleType}
	 * @returns {sap.ui.mdc.enums.BaseType|function} BaseType configured for the {@link sap.ui.model.SimpleType} or function to resolve BaseType based on configuration
	 * @private
	 */
	TypeMap._getBaseType = function (sType) {
		const aResult = this._get(sType);
		return aResult && aResult[1][0];
	};

	/**
	 * Returns the optional customizing method configured for a {@link sap.ui.model.SimpleType}
	 *
	 * @param {string} sType Objectpath string for {@link sap.ui.model.SimpleType}
	 * @returns {function} Method for model-specific type configuration. See <code>sap.ui.mdc.DefaultTypeMap</code> for examples.
	 * @private
	 */
	TypeMap._getOptions = function (sType) {
		const aResult = this._get(sType);
		return aResult && aResult[1][1];
	};

	/**
	 * Returns the ObjectPath string for a given type alias.
	 *
	 * @param {string} sAlias Identifier for a configured Type Alias
	 * @returns {string} Objectpath string for {@link sap.ui.model.SimpleType}
	 * @private
	 */
	TypeMap._getClass = function (sAlias) {
		const aResult = this._get(sAlias);
		return aResult && aResult[0];
	};

	 /**
	 * Exports the TypeMap's current data
	 *
	 * @final
	 * @returns {Array} Array created from this TypeMap's internal map
	 * @public
	 */
	TypeMap.export = function () {
		return Array.from(this._getMap());
	};

	/**
	 * Imports a TypeMap's data into another TypeMap
	 *
	 * @final
	 * @param {module:sap/ui/mdc/util/TypeMap} oTypeMap TypeMap to import
	 * @public
	 */
	TypeMap.import = function (oTypeMap) {
		oTypeMap.export().forEach(function (aEntry) {
			this._getMap().set(aEntry[0], aEntry[1]);
		}.bind(this));
	};

	/**
	 * Prevents further manipulation of a TypeMap's data
	 *
	 * @final
	 * @public
	 */
	TypeMap.freeze = function () {
		this._getMap()._bFrozen = true;
	};



	// <!-- TypeUtil functionality -->

	/**
	 * To determine which internal controls to render, the {@link sap.ui.mdc.Field Field}, {@link sap.ui.mdc.MultiValueField MultiValueField},
	 * or {@link sap.ui.mdc.FilterField FilterField} controls need to know if the type represents a date, a number, or another {@link sap.ui.mdc.enums.BaseType BaseType}.
	 *
	 * As default, <code>String</code> is returned.
	 *
	 * @final
	 * @param {string} sType Given type string or {@link sap.ui.model.SimpleType}
	 * @param {object} oFormatOptions Used <code>FormatOptions</code>
	 * @param {object} oConstraints Used <code>Constraints</code>
	 * @returns {sap.ui.mdc.enums.BaseType} output <code>Date</code>, <code>DateTime</code> or <code>Time</code>...
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
	 * @returns {sap.ui.mdc.enums.BaseType} output <code>Date</code>, <code>DateTime</code> or <code>Time</code>...
	 * @public
	 */
	TypeMap.getBaseTypeForType = function(oType) {
		return this.getBaseType(oType.getMetadata && oType.getMetadata().getName(), oType.getFormatOptions(), oType.getConstraints());
	};

	/**
	 * Returns the data type class name for a given name or alias.
	 * @final
	 * @param {string} sType Given model specific type
	 * @returns {string} Data type name
	 * @public
	 */
	TypeMap.getDataTypeClassName = function(sType) {
		return this._getClass(sType) || sType;
	};

	/**
	 * Returns a data type class based on a given name.
	 *
	 * <b>Note:</b> The module of the data type needs to be loaded before.
	 * @final
	 * @param {string} sDataType Class path as string where each name is separated by '.'
	 * @returns {function(new: sap.ui.model.SimpleType)} returns a dataType class
	 * @public
	 */
	TypeMap.getDataTypeClass = function(sDataType) {
		const sTypeName = this.getDataTypeClassName(sDataType);
		const TypeClass = sTypeName
			? sap.ui.require(sTypeName.replace(/\./g, "/")) || ObjectPath.get(sTypeName)
			: undefined;
		if (!TypeClass) {
			throw new Error("DataType '" + sDataType + "' cannot be determined");
		}
		return TypeClass;
	};

	/**
	 * Returns a data type instance based on a given object path, <code>FormatOptions</code>, and <code>Constraints</code>.
	 *
	 * @final
	 * @param {string} sDataType Class path as string where each name is separated by '.'
	 * @param {object} [oFormatOptions] formatoptions for the dataType
	 * @param {object} [oConstraints] constraints for the dataType
	 * @param {object} [oOptions] Additional options for overrides
	 * @returns {sap.ui.model.SimpleType} creates returns an instance of the resolved dataType
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
	 * Returns a type mapping configuration object for a given type string or {@link sap.ui.model.SimpleType SimpleType}.
	 * @final
	 * @param {string|sap.ui.model.SimpleType} vType Given dataType as string or type
	 * @param {object} [oFormatOptions] formatoptions for the given dataType
	 * @param {object} [oConstraints] constraints for the given dataType
	 * @returns {sap.ui.mdc.TypeConfig} output returns typeConfig object
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
	 * Converts a value into a string using a designated type.
	 *
	 * The value is not checked for validity. The used values must be compatible with the used basic type.
	 *
	 * <b>Note:</b> Number types are not converted, the number conversion is done by the SAPUI5 Flexibility handling.
	 * @final
	 * @param {object} vValue typed value
	 * @param {string|sap.ui.model.SimpleType} vType Data type considered for conversion
	 * @param {object} [oFormatOptions] formatoptions for the dataType
	 * @param {object} [oConstraints] constraints for the dataType
	 * @returns {string} converted value
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
	 * Converts a string into a type-based value.
	 *
	 * The value is not checked for validity. The used values must be compatible with the used basic type.
	 *
	 * <b>Note:</b> Number types are not converted, the number conversion is done by the SAPUI5 Flexibility handling.
	 * @final
	 * @param {string} vValue externalized value
	 * @param {string|sap.ui.model.SimpleType} vType Data type considered for conversion
	 * @param {object} [oFormatOptions] formatoptions for the dataType
	 * @param {object} [oConstraints] constraints for the dataType
	 * @returns {object} converted value
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

	TypeMap._normalizeType = function (vType, oFormatOptions, oConstraints) {
		if (vType instanceof SimpleType) { // simpletype
			return vType;
		}
		return this.getDataTypeInstance(vType, oFormatOptions, oConstraints); // string
	};

	/**
	 * If the <code>Field</code> control is used, the used data type comes from the binding.
	 * Some data types (like Currency or Unit) might need some initialization.
	 * To initialize the internal ("cloned") Type later on, the result of this function
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
	 * This function initializes the internal ("cloned") Type.
	 *
	 * @param {sap.ui.model.SimpleType} oType original Type (e.g. from Binding)
	 * @param {object} oTypeInitialization Information needed to initialize internal type (created in <code>initializeTypeFromValue</code>)
	 * @private
	 * @ui5-restricted sap.ui.mdc.field.FieldBase
	 * @since 1.115.0
	 */
	TypeMap.initializeInternalType = function(oType, oTypeInitialization) {

	};

	return TypeMap;
});