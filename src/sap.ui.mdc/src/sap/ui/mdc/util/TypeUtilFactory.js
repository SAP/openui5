/*!
 * ${copyright}
 */

sap.ui.define([
	'sap/ui/mdc/enum/BaseType',
	'sap/ui/model/SimpleType',
	'sap/base/util/ObjectPath',
	'sap/ui/mdc/util/DateUtil',
	'sap/base/util/isEmptyObject',
	'sap/base/util/merge',
	'sap/base/Log'
], function (BaseType, SimpleType, ObjectPath, DateUtil, isEmptyObject, merge, Log) {
	"use strict";

	var _mTypeUtilCache = new WeakMap();


	var sDatePattern = "yyyy-MM-dd";
	var sTimePattern = "HH:mm:ss";

	/**
	 * TypeUtilFactory is a static class for {@link sap.ui.mdc.util.TypeMap TypeMap} based creation of {@link sap.ui.mdc.ITypeUtil TypeUtils}
	 *
	 * @class
	 * @author SAP SE
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 * @experimental As of version 1.114.0
	 * @since 1.114.0
 	 * @hideconstructor
	 * @alias sap.ui.mdc.util.TypeUtilFactory
	 *
	 */
	var TypeUtilFactory = function() {
		// Do not use the constructor
		throw new Error();
	};

	/**
	 * Creates and caches {@link sap.ui.mdc.ITypeUtil TypeUtils} based on a given {@link sap.ui.mdc.util.TypeMap TypeMap}. Calling <code>TypeUtilFactory.getUtil(MyTypeMap)</code> twice will return the same object
	 *
	 * @param {sap.ui.mdc.util.TypeMap} oTypeMap Map of supported types
	 * @returns {sap.ui.mdc.ITypeUtil} TypeUtil for the given typemap and overrides
	 * @private
	 */
	TypeUtilFactory.getUtil = function (oTypeMap) {
		var oExistingTypeUtil = _mTypeUtilCache.get(oTypeMap);
		if (oExistingTypeUtil) {
			return oExistingTypeUtil;
		}
		var oNewTypeUtil = TypeUtilFactory._create(oTypeMap);
		_mTypeUtilCache.set(oTypeMap, oNewTypeUtil);
		return oNewTypeUtil;
	};

	/**
	 * Creates a new type util for the given typemap
	 *
	 * @param {sap.ui.mdc.util.TypeMap} oTypeMap Map of supported types
	 * @returns {sap.ui.mdc.ITypeUtil} TypeUtil for the given typemap and overrides
	 * @private
	 */
	TypeUtilFactory._create = function (oTypeMap) {

		return {

			getBaseType: function(sType, oFormatOptions, oConstraints) {
				var vBaseType = oTypeMap.getBaseType(sType);
				return vBaseType && (typeof vBaseType === "function" ? vBaseType(oFormatOptions, oConstraints) : vBaseType) || BaseType.String;
			},

			getBaseTypeForType: function(oType) {
				return this.getBaseType(oType.getMetadata && oType.getMetadata().getName(), oType.getFormatOptions(), oType.getConstraints());
			},

			getDataTypeClassName: function(sType) {
				return oTypeMap.getClass(sType) || sType;
			},

			getDataTypeClass: function(sDataType) {
				var TypeClass = ObjectPath.get(this.getDataTypeClassName(sDataType) || "");
				if (!TypeClass) {
					throw new Error("DataType '" + sDataType + "' cannot be determined");
				}
				return TypeClass;
			},

			getDataTypeInstance: function(sDataType, oFormatOptions, oConstraints, oOptions) {
				var TypeClass = this.getDataTypeClass(sDataType);
				var fnOptions = oTypeMap.getOptions(TypeClass.getMetadata().getName());
				var aOverrides = fnOptions && fnOptions(merge({}, oFormatOptions), merge({}, oConstraints), oOptions);
				oFormatOptions = aOverrides && aOverrides[0] || oFormatOptions;
				oConstraints = aOverrides && aOverrides[1] || oConstraints;
				return new TypeClass(oFormatOptions, oConstraints);
			},

			getTypeConfig: function(vType, oFormatOptions, oConstraints) {
				var oType = this._normalizeType.call(this, vType, oFormatOptions, oConstraints);
				return {
					className: oType.getMetadata().getName(),
					typeInstance: oType,
					baseType: this.getBaseTypeForType(oType)
				};
			},

			externalizeValue: function(vValue, vType, oFormatOptions, oConstraints) {
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
			},

			internalizeValue: function(vValue, vType, oFormatOptions, oConstraints) {
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
			},

			_normalizeType: function (vType, oFormatOptions, oConstraints) {
				if (vType instanceof SimpleType) { // simpletype
					return vType;
				}
				return this.getDataTypeInstance(vType, oFormatOptions, oConstraints); // string
			}
		};

	};

	return TypeUtilFactory;

});