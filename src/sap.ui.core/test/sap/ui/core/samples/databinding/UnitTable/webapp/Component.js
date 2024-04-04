sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/model/type/Unit"
], function (UIComponent, UnitType) {
	"use strict";

	return UIComponent.extend("sap.ui.core.samples.unittable.Component", {
		metadata: {
			manifest: "json"
		},

		init: function () {
			// call the base component's init function
			UIComponent.prototype.init.call(this); // create the views based on the url/hash

			UnitType.extend("sap.ui.core.samples.unittable.MeterType", {
				constructor: function (oFormatOptions, oConstraints) {
					UnitType.apply(this, [oFormatOptions, oConstraints, ["decimals"]]);
				}
			});

			UnitType.extend("sap.ui.core.samples.unittable.BoundUnitsType", {
				constructor: function (oFormatOptions, oConstraints) {
					UnitType.apply(this, [oFormatOptions, oConstraints, ["customUnits"]]);
				}
			});
		}
	});
});
