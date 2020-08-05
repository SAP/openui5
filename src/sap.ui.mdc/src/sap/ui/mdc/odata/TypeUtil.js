/*!
 * ${copyright}
 */

sap.ui.define([
		'sap/ui/mdc/util/TypeUtil',
		'sap/ui/mdc/enum/BaseType',
		'sap/base/util/ObjectPath'
	], function(BaseTypeUtil, BaseType, ObjectPath) {
	"use strict";

	/**
	 * Provides mapping functionality for model dependent data types to base types. Extend this object in your project to customize behaviour depending on model usage.
	 * <b>Note:</b>
	 * This utility is experimental and the API/behavior is not finalized and hence this should not be used for productive usage.
	 * @author SAP SE
	 * @private
	 * @experimental
	 * @since 1.79.0
	 * @alias sap.ui.mdc.odata.TypeUtil
	 */
	var TypeUtil = Object.assign({}, BaseTypeUtil, {

		/**
		* Maps the Edm type names to primitive type names
		*
		* Falls back to 'object' if type cannot be found.
		*
		* @param {string} sType Given model specific type
		* @returns {string} primitive type name
		*/
		getPrimitiveType: function (sDataType) {
			var mType = {
				"Edm.Binary": "boolean",
				"Edm.Boolean": "boolean",
				"Edm.Byte": "boolean",
				"Edm.Date": "date",
				"Edm.DateTimeOffset": "dateTime",
				"Edm.Decimal": "int",
				"Edm.Double": "boolean",
				"Edm.Duration": "float",
				"Edm.Guid": "string",
				"Edm.Int16": "int",
				"Edm.Int32": "int",
				"Edm.Int64": "int",
				"Edm.SByte": "boolean",
				"Edm.Single": "float",
				"Edm.String": "string",
				"Edm.TimeOfDay": "time"
			};
			return mType[sDataType] || "object";
		},

		getDataTypeClassName: function(sType) {

			var mEdmTypes = {
				"Edm.Boolean": "sap.ui.model.odata.type.Boolean",
				"Edm.Byte": "sap.ui.model.odata.type.Byte",
				"Edm.DateTime": "sap.ui.model.odata.type.DateTime",
				"Edm.DateTimeOffset": "sap.ui.model.odata.type.DateTimeOffset",
				"Edm.Decimal": "sap.ui.model.odata.type.Decimal",
				"Edm.Double": "sap.ui.model.odata.type.Double",
				"Edm.Float": "sap.ui.model.odata.type.Single",
				"Edm.Guid": "sap.ui.model.odata.type.Guid",
				"Edm.Int16": "sap.ui.model.odata.type.Int16",
				"Edm.Int32": "sap.ui.model.odata.type.Int32",
				"Edm.Int64": "sap.ui.model.odata.type.Int64",
				"Edm.SByte": "sap.ui.model.odata.type.SByte",
				"Edm.Single": "sap.ui.model.odata.type.Single",
				"Edm.String": "sap.ui.model.odata.type.String",
				"Edm.Time": "sap.ui.model.odata.type.Time"
			};

			if (mEdmTypes[sType]) {
				sType = mEdmTypes[sType];
			} else if (sType && sType.startsWith("Edm.")) {
				// unknown Edm type -> throw error to not continue with strange data
				throw new Error("Invalid data type " + sType);
			} else {
				sType = BaseTypeUtil.getDataTypeClassName(sType);
			}

			return sType;
		},

		getBaseType: function(sType, oFormatOptions, oConstraints) {

			switch (sType) {

				case "sap.ui.model.odata.type.DateTime":
					if (oConstraints && (oConstraints.displayFormat === "Date" || oConstraints.isDateOnly)) {
						return BaseType.Date;
					} else {
						return BaseType.DateTime;
					}
					break;

				case "sap.ui.model.odata.type.DateTimeOffset":
					return BaseType.DateTime;

				case "sap.ui.model.odata.type.Time":
					return BaseType.Time;

				case "sap.ui.model.odata.type.Boolean":
					return BaseType.Boolean;

				case "sap.ui.model.odata.type.Byte":
				case "sap.ui.model.odata.type.SByte":
				case "sap.ui.model.odata.type.Decimal":
				case "sap.ui.model.odata.type.Int16":
				case "sap.ui.model.odata.type.Int32":
				case "sap.ui.model.odata.type.Int64":
				case "sap.ui.model.odata.type.Single":
				case "sap.ui.model.odata.type.Double":
					return BaseType.Numeric;

				default:
					return BaseTypeUtil.getBaseType(sType, oFormatOptions, oConstraints);
			}
		}
	});

	return TypeUtil;

}, /* bExport= */ true);
