/*!
 * ${copyright}
 */

sap.ui.define([
	'sap/ui/mdc/enum/BaseType',
	'sap/ui/model/SimpleType',
	'sap/base/util/ObjectPath',
	'sap/ui/mdc/util/DateUtil',
	'sap/base/util/merge'
], function(
	BaseType, SimpleType, ObjectPath, DateUtil, merge
) {
	"use strict";

	var sDatePattern = "yyyy-MM-dd";
	var sTimePattern = "HH:mm:ss";

	var _cache = new WeakMap(); // We do not want to share Maps with derived TypeMaps

	/**
	 * Configuration class for type-handling in MDC delegates.
	 * Allows mapping of model-types to <code>sap.ui.mdc.enum.BaseType</code> and enables model-specific type configuration.
	 *
	 * <b>Note:</b>
	 * This utility is experimental and the API/behavior is not finalized and hence this should not be used for productive usage.
	 *
	 * @namespace
	 * @author SAP SE
	 * @private
	 * @ui5-restricted sap.fe
	 * @experimental As of version 1.114.0
	 * @MDC_PUBLIC_CANDIDATE
	 * @since 1.114.0
	 * @alias sap.ui.mdc.util.TypeMap
	 */
	var TypeMap = {};

	/*
	* Gets values of the internal map, treating string values as references to other keys (aliases)
	*/
	TypeMap._get = function (sType) {
		var vEntry = this._getMap().get(sType);
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
		var oMap = this._getMap();
		if (oMap._bFrozen) {
			throw "TypeMap: You must not modify a frozen TypeMap";
		}
		oMap.set(sKey, vValue);
	};

	/*
	* As derived typemaps want to act as singletons with separate data-sets, we provide a context based cache for each map's internal data.
	* Please also see <code>sap.ui.mdc.util.TypeMap.import</code>
	*/
	TypeMap._getMap = function () {
		var oMap = _cache.get(this);
		if (!oMap) {
			oMap = new Map();
			_cache.set(this, oMap);
		}
		return oMap;
	};

	/**
	 * Sets a BaseType and an optional model- or scenario-specific configuration method for a given sap.ui.model.SimpleType ObjectPath string
	 *
	 * As default <code>string</code> is returned.
	 *
	 * @final
	 * @param {string} sType Objectpath string for sap.ui.model.SimpleType
	 * @param {sap.ui.mdc.enum.BaseType|function} vBaseType BaseType fitting the given sType or method returning a BaseType based on type configuration
	 * @param {function} [fnOptions] Optional customizing method for formatoptions and constraints. See <code>sap.ui.mdc.DefaultTypeMap</code> for examples.
	 * @private
	 * @ui5-restricted sap.fe
	 * @MDC_PUBLIC_CANDIDATE
	 */
	TypeMap.set = function (sType, vBaseType, fnOptions) {
		this._set(sType, [vBaseType, fnOptions]);
	};

	/**
	 * Allows alternative identifiers for Types, such as "Boolean" for "sap.ui.model.type.Boolean"
	 *
	 * @final
	 * @param {string} sType Objectpath string for sap.ui.model.SimpleType
	 * @param {string} sAlias Alternative identifier for sType
	 * @private
	 * @ui5-restricted sap.fe
	 * @MDC_PUBLIC_CANDIDATE
	 */
	TypeMap.setAlias = function (sType, sAlias) {
		this._set(sType, sAlias);
	};

	/**
	 * Returns the <code>sap.ui.mdc.enum.BaseType</code> or a method to resolve the BaseType dynamically for the given type
	 *
	 * @param {string} sType Objectpath string for sap.ui.model.SimpleType
	 * @returns {sap.ui.mdc.enum.BaseType|function} BaseType configured for the sap.ui.model.SimpleType or function to resolve BaseType based on configuration
	 * @private
	 */
	TypeMap._getBaseType = function (sType) {
		var aResult = this._get(sType);
		return aResult && aResult[1][0];
	};

	/**
	 * Returns the optional customizing method configured for a sap.ui.model.SimpleType
	 *
	 * @param {string} sType Objectpath string for sap.ui.model.SimpleType
	 * @returns {function} Method for model-specific type configuration. See <code>sap.ui.mdc.DefaultTypeMap</code> for examples.
	 * @private
	 */
	TypeMap._getOptions = function (sType) {
		var aResult = this._get(sType);
		return aResult && aResult[1][1];
	};

	/**
	 * Returns the ObjectPath string for a given type alias.
	 *
	 * @param {string} sAlias Identifier for a configured Type Alias
	 * @returns {string} Objectpath string for sap.ui.model.SimpleType
	 * @private
	 */
	TypeMap._getClass = function (sAlias) {
		var aResult = this._get(sAlias);
		return aResult && aResult[0];
	};

	 /**
	 * Exports the TypeMap's current data
	 *
	 * @final
	 * @returns {Array} Array created from this TypeMap's internal map
	 * @private
	 * @ui5-restricted sap.fe
	 * @MDC_PUBLIC_CANDIDATE
	 */
	TypeMap.export = function () {
		return Array.from(this._getMap());
	};

	/**
	 * Imports a TypeMap's data into another TypeMap
	 *
	 * @final
	 * @param {sap.ui.mdc.util.TypeMap} oTypeMap TypeMap to import
	 * @private
	 * @ui5-restricted sap.fe
	 * @MDC_PUBLIC_CANDIDATE
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
	 * @private
	 * @ui5-restricted sap.fe
	 * @MDC_PUBLIC_CANDIDATE
	 */
	TypeMap.freeze = function () {
		this._getMap()._bFrozen = true;
	};



	// <!-- TypeUtil functionality -->

	/**
	 * @final
	 * @param {string} sType Given type string or sap.ui.model.SimpleType
	 * @param {object} oFormatOptions Used <code>FormatOptions</code>
	 * @param {object} oConstraints Used <code>Constraints</code>
	 * @returns {sap.ui.mdc.enum.BaseType} output <code>Date</code>, <code>DateTime</code> or <code>Time</code>...
	 * @private
	 * @ui5-restricted sap.fe
	 * @MDC_PUBLIC_CANDIDATE
	 */
	TypeMap.getBaseType = function(sType, oFormatOptions, oConstraints) {
		var vBaseType = this._getBaseType(sType);
		return vBaseType && (typeof vBaseType === "function" ? vBaseType(oFormatOptions, oConstraints) : vBaseType) || BaseType.String;
	};

	/**
	 * @final
	 * @param {sap.ui.model.SimpleType} oType Given type string or sap.ui.model.SimpleType
	 * @returns {string} output <code>Date</code>, <code>DateTime</code> or <code>Time</code>...
	 * @private
	 * @ui5-restricted sap.fe
	 * @MDC_PUBLIC_CANDIDATE
	 */
	TypeMap.getBaseTypeForType = function(oType) {
		return this.getBaseType(oType.getMetadata && oType.getMetadata().getName(), oType.getFormatOptions(), oType.getConstraints());
	};

	/**
	 * @final
	 * @param {string} sType Given model specific type
	 * @returns {string} Data type name
	 * @private
	 * @ui5-restricted sap.fe
	 * @MDC_PUBLIC_CANDIDATE
	 */
	TypeMap.getDataTypeClassName = function(sType) {
		return this._getClass(sType) || sType;
	};

	/**
	 * @final
	 * @param {string} sDataType Class path as string where each name is separated by '.'
	 * @returns {sap.ui.model.SimpleType} creates returns a dataType class
	 * @private
	 * @ui5-restricted sap.fe
	 * @MDC_PUBLIC_CANDIDATE
	 */
	TypeMap.getDataTypeClass = function(sDataType) {
		var TypeClass = ObjectPath.get(this.getDataTypeClassName(sDataType) || "");
		if (!TypeClass) {
			throw new Error("DataType '" + sDataType + "' cannot be determined");
		}
		return TypeClass;
	};

	/**
	 * @final
	 * @param {string} sDataType Class path as string where each name is separated by '.'
	 * @param {object} [oFormatOptions] formatoptions for the dataType
	 * @param {object} [oConstraints] constraints for the dataType
	 * @param {object} [oOptions] Additional options for overrides
	 * @returns {sap.ui.model.SimpleType} creates returns an instance of the resolved dataType
	 * @private
	 * @ui5-restricted sap.fe
	 * @MDC_PUBLIC_CANDIDATE
	 */
	TypeMap.getDataTypeInstance = function(sDataType, oFormatOptions, oConstraints, oOptions) {
		var TypeClass = this.getDataTypeClass(sDataType);
		var fnOptions = this._getOptions(TypeClass.getMetadata().getName());
		var aOverrides = fnOptions && fnOptions(merge({}, oFormatOptions), merge({}, oConstraints), oOptions);
		oFormatOptions = aOverrides && aOverrides[0] || oFormatOptions;
		oConstraints = aOverrides && aOverrides[1] || oConstraints;
		return new TypeClass(oFormatOptions, oConstraints);
	};

	/**
	 * @final
	 * @param {string|sap.ui.model.SimpleType} vType Given dataType as string or type
	 * @param {object} [oFormatOptions] formatoptions for the given dataType
	 * @param {object} [oConstraints] constraints for the given dataType
	 * @returns {sap.ui.mdc.TypeConfig} output returns typeConfig object
	 * @private
	 * @ui5-restricted sap.fe
	 * @MDC_PUBLIC_CANDIDATE
	 */
	TypeMap.getTypeConfig = function(vType, oFormatOptions, oConstraints) {
		var oType = this._normalizeType.call(this, vType, oFormatOptions, oConstraints);
		return {
			className: oType.getMetadata().getName(),
			typeInstance: oType,
			baseType: this.getBaseTypeForType(oType)
		};
	};

	/**
	 * @final
	 * @param {object} vValue typed value
	 * @param {string|sap.ui.model.SimpleType} vType Data type considered for conversion
	 * @param {object} [oFormatOptions] formatoptions for the dataType
	 * @param {object} [oConstraints] constraints for the dataType
	 * @returns {string} converted value
	 * @private
	 * @ui5-restricted sap.fe
	 * @MDC_PUBLIC_CANDIDATE
	 */
	TypeMap.externalizeValue = function(vValue, vType, oFormatOptions, oConstraints) {
		var oTypeInstance = this._normalizeType.call(this, vType, oFormatOptions, oConstraints);
		var sBaseType = this.getBaseTypeForType(oTypeInstance);
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
	 * @final
	 * @param {string} vValue externalized value
	 * @param {string|sap.ui.model.SimpleType} vType Data type considered for conversion
	 * @param {object} [oFormatOptions] formatoptions for the dataType
	 * @param {object} [oConstraints] constraints for the dataType
	 * @returns {object} converted value
	 * @private
	 * @ui5-restricted sap.fe
	 * @MDC_PUBLIC_CANDIDATE
	 */
	TypeMap.internalizeValue = function(vValue, vType, oFormatOptions, oConstraints) {
		var oTypeInstance = this._normalizeType.call(this, vType, oFormatOptions, oConstraints);
		var sBaseType = this.getBaseTypeForType(oTypeInstance);
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

	return TypeMap;
});