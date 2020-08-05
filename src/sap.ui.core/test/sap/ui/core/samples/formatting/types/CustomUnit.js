sap.ui.define([
	"sap/ui/model/type/Unit",
	"sap/ui/core/samples/formatting/model/Customizing"],
function (UnitType, Customizing) {
	"use strict";

	return UnitType.extend("sap.ui.core.samples.formatting.types.CustomUnit", {
		constructor: function (oFormatOptions, oConstraints) {
			oFormatOptions = oFormatOptions || {};
			oFormatOptions.customUnits = Customizing.customUnits;
			UnitType.apply(this, [oFormatOptions, oConstraints]);
		}
	});
});