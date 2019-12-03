/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/base/Object",
	"sap/ui/testrecorder/Dialects"
], function (BaseObject, Dialects) {
	"use strict";

	var DEFAULT_DIALECT = Dialects.UIVERI5;

	var oDialectRegistry = null;

	var DialectRegistry = BaseObject.extend("sap.ui.testrecorder.DialectRegistry", {
		constructor: function () {
			if (!oDialectRegistry) {
				Object.apply(this, arguments);
				this.setActiveDialect(DEFAULT_DIALECT);
			} else {
				return oDialectRegistry;
			}
		}
	});

	DialectRegistry.prototype.getActiveDialect = function () {
		return this._sDialect;
	};

	DialectRegistry.prototype.setActiveDialect = function (sDialect) {
		for (var sKey in Dialects) {
			if (sDialect === Dialects[sKey]) {
				this._sDialect = sDialect;
			}
		}
	};

	oDialectRegistry = new DialectRegistry();

	return oDialectRegistry;
});
