sap.ui.define(["sap/ui/core/Core", "sap/ui/model/type/Unit", "sap/ui/core/mvc/XMLView"], function (Core, UnitType, XMLView) {
	"use strict";
	Core.ready().then(function () {

		UnitType.extend("sap.ui.core.samples.MeterType", {
			constructor: function (oFormatOptions, oConstraints) {
				UnitType.apply(this, [oFormatOptions, oConstraints, ["decimals"]]);
			}
		});

		UnitType.extend("sap.ui.core.samples.BoundUnitsType", {
			constructor: function (oFormatOptions, oConstraints) {
				UnitType.apply(this, [oFormatOptions, oConstraints, ["customUnits"]]);
			}
		});

		XMLView.create({viewName: "sap.ui.core.samples.UnitTable"}).then(function(oView) {
			oView.placeAt("content");
		});
	});
});
