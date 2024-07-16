/*!
 * ${copyright}
 */

sap.ui.define([
], function(
) {
	"use strict";

	// Descriptor Variant
	var Utils = function() {};

	Utils.prototype.getNameAndNameSpace = function(sId, sReference) {
		// namespace and file name according to namespace concept: apps/<Descriptor ID>/appVariants/<Descriptor Variant ID>/manifest.appdescr_variant
		return {
			fileName: "manifest", // appdescr_variant" is the file type
			namespace: `apps/${sReference}/appVariants/${sId}/`
		};
	};

	Utils.prototype.checkEntityPropertyChange = function(mParameters) {
		this.checkParameterAndType(mParameters, "entityPropertyChange", "object");
		if (mParameters.entityPropertyChange instanceof Array) {
			for (var i = 0; i < mParameters.entityPropertyChange.length; i++) {
				var oChange = mParameters.entityPropertyChange[i];
				this.checkEntityPropertyChangeContent(oChange);
			}
		} else if (mParameters.entityPropertyChange instanceof Object) {
			this.checkEntityPropertyChangeContent(mParameters.entityPropertyChange);
		}
	};

	Utils.prototype.checkEntityPropertyChangeContent = function(oChange) {
		this.checkParameterAndType(oChange, "propertyPath", "string");
		this.checkParameterAndType(oChange, "operation", "string");

		if (["INSERT", "UPDATE", "UPSERT", "DELETE"].indexOf(oChange.operation) === -1) {
			throw new Error("Parameter \"entityPropertyChange.operation\" needs to be one of 'INSERT', 'UPDATE', 'UPSERT', 'DELETE'");
		}
		if (oChange.propertyValue === undefined && oChange.operation !== "DELETE") {
			throw new Error("No parameter \"entityPropertyChange.propertyValue\" provided");
		}
	};

	Utils.prototype.checkParameterAndType = function(mParameters, sParameterName, aTypes) {
		if (typeof aTypes === "string") {
			aTypes = [aTypes];
		}
		var bTypeValid;
		aTypes.forEach(function(sType) {
			if (sType === "array") {
				if (mParameters !== undefined && mParameters[sParameterName] !== undefined && Array.isArray(mParameters[sParameterName])) {
					bTypeValid = true;
				}
			// eslint-disable-next-line valid-typeof
			} else if (mParameters !== undefined && mParameters[sParameterName] !== undefined && typeof mParameters[sParameterName] === sType) {
				bTypeValid = true;
			}
		});
		if (!bTypeValid) {
			throw new Error(`No parameter "${sParameterName}" of type ${aTypes} provided`);
		}
	};

	Utils.prototype.checkTexts = function(mTexts) {
		if (mTexts !== undefined && typeof mTexts !== "object") { // further checks could be added
			throw new Error("Wrong format for provided \"texts\" parameter");
		}
	};
	Utils.prototype.checkTransportRequest = function(sTransportRequest) {
		// corresponding data element in ABAP: TRKORR, CHAR20
		// partial check: length le 20, alphanumeric, upper case, no space not underscore
		// ATO_NOTIFICATION is also allowed
		if (!/^[A-Z0-9]{1,20}$/.test(sTransportRequest) && sTransportRequest !== "ATO_NOTIFICATION") {
			throw new Error("Wrong format for provided \"sTransportRequest\" parameter");
		}
	};
	Utils.prototype.checkPackage = function(sPackage) {
		// corresponding data element in ABAP: DEVCLASS, CHAR30
		// partial check: length le 30, alphanumeric, upper case, / for namespace, underscore, hyphen, no space
		if (!/^[A-Z0-9/_$-]{1,30}$/.test(sPackage) && sPackage !== "$TMP") {
			throw new Error(`Wrong format for provided "sPackage" parameter. '${sPackage}' as package name is not allowed.`);
		}
	};
	return new Utils();
});