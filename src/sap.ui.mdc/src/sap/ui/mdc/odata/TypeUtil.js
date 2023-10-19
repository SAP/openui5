/*!
 * ${copyright}
 */

sap.ui.define([
		'sap/ui/mdc/util/TypeUtil',
		'sap/ui/mdc/enums/BaseType'
	], function(BaseTypeUtil, BaseType) {
	"use strict";

	/**
	 * Provides mapping functionality for model dependent data types to base types. Extend this object in your project to customize behaviour depending on model usage.
	 * <b>Note:</b>
	 * This utility is experimental and the API/behavior is not finalized and hence this should not be used for productive usage.
	 * @namespace
	 * @author SAP SE
	 * @private
	 * @experimental As of version 1.79
	 * @since 1.79.0
	 * @deprecated since 1.115.0 - please see {@link module:sap/ui/mdc/BaseDelegate.getTypeMap}
	 * @alias sap.ui.mdc.odata.TypeUtil
	 * @ui5-restricted sap.ui.mdc
	 */
	const TypeUtil = Object.assign({}, BaseTypeUtil, {

		/**
		* Maps the Edm type names to primitive type names
		*
		* Falls back to 'object' if type cannot be found.
		*
		* @param {string} sDataType Given model specific type
		* @returns {string} primitive type name
		*/
		getPrimitiveType: function (sDataType) {
			const mType = {
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

			const mEdmTypes = {
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
				sType = BaseTypeUtil.getDataTypeClassName.call(this, sType);
			}

			return sType;
		},

		getBaseType: function(sType, oFormatOptions, oConstraints) {

			switch (sType) {

				case "sap.ui.model.odata.type.DateTime":
					if (oConstraints && oConstraints.displayFormat === "Date") {
						return BaseType.Date;
					} else {
						return BaseType.DateTime;
					}

				case "sap.ui.model.odata.type.DateTimeOffset":
				case "sap.ui.model.odata.type.DateTimeWithTimezone":
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
					return BaseTypeUtil.getBaseType.call(this, sType, oFormatOptions, oConstraints);
			}
		},

		internalizeValue: function (vValue, vType, oFormatOptions, oConstraints) {
			const oTypeInstance = this._normalizeType(vType, oFormatOptions, oConstraints);
			if (this.getBaseTypeForType(oTypeInstance) === BaseType.Numeric) {
				if (typeof vValue !== "string" && (oTypeInstance.getMetadata().getName() === "sap.ui.model.odata.type.Int64" || oTypeInstance.getMetadata().getName() === "sap.ui.model.odata.type.Decimal")) {
					// INT64 and Decimal using string as internal value -> if for some reason a number comes in convert it to string
					return vValue.toString(); // don't use type as this could have locale dependent parsing
				}
			}
			return BaseTypeUtil.internalizeValue.call(this, vValue, vType, oFormatOptions, oConstraints);
		},

		externalizeValue: function (vValue, vType, oFormatOptions, oConstraints) {
			const oTypeInstance = this._normalizeType(vType, oFormatOptions, oConstraints);
			if (this.getBaseTypeForType(oTypeInstance) === BaseType.Numeric) {
				if (typeof vValue !== "string" && (oTypeInstance.getMetadata().getName() === "sap.ui.model.odata.type.Int64" || oTypeInstance.getMetadata().getName() === "sap.ui.model.odata.type.Decimal")) {
					// INT64 and Decimal parsed always to string, if for some reason a number comes in -> convert to string, but don't use type at this might have locale dependent formatting
					return vValue.toString();
				}
			}
			return BaseTypeUtil.externalizeValue.call(this, vValue, vType, oFormatOptions, oConstraints);
		},

		/*
		* For sap.ui.model.odata.type.Currency and sap.ui.model.odata.type.Unit the
		* CompositeBinding has 3 parts, Number, Currency/Unit and unit map.
		* On the first call of formatValue the unit map is analyzed and stored inside the
		* Type. Later, on parsing it is used. Without initializing the unit map parsing is
		* not working.
		*
		* In the sap.ui.mdc.Field the Type is created via Binding. So when the value of the Field
		* gets the unit map for the first time we need to initialize the type via formatValue.
		* (As no condition is created if there is no number or unit formatValue might not be called before
		* first user input.)
		*
		* We return the given unit map in the TypeInitialization object to allow to initialize the "cloned"
		* Unit/Currency-Type (internally used by the two Input controls for number and unit) with the unit map.
		*/
		initializeTypeFromValue: function(oType, vValue) {

			if (oType && this.getBaseType(oType.getMetadata().getName()) === BaseType.Unit && Array.isArray(vValue) && vValue.length > 2) {
				if (vValue[2] !== undefined) {
					const oTypeInitialization = {mCustomUnits: vValue[2]};
					this.initializeInternalType(oType, oTypeInitialization);
					return oTypeInitialization;
				}
			} else {
				return {}; // to mark initialization as finished as not needed for normal types
			}

			return null; // not all needed information are given right now.

		},

		initializeInternalType: function(oType, oTypeInitialization) {

			if (oTypeInitialization && oTypeInitialization.mCustomUnits !== undefined) {
				// if already initialized initialize new type too.
				oType.formatValue([null, null, oTypeInitialization.mCustomUnits], "string");
			}

		}
	});

	return TypeUtil;

});
