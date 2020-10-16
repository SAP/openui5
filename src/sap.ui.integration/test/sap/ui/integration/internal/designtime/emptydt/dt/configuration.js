sap.ui.define(["sap/ui/integration/Designtime",
	"sap/m/Slider",
	"sap/m/Switch",
	"sap/ui/integration/designtime/editor/fields/viz/IconSelect",
	"sap/ui/integration/designtime/editor/fields/viz/ColorSelect",
	"sap/ui/integration/designtime/editor/fields/viz/ShapeSelect"
], function (
	Designtime
) {
	"use strict";

	var AdvancedDesigntime = Designtime.extend("card.test.AdvancedDesigntime");
	AdvancedDesigntime.prototype.create = function () {
		return {
			form: {
				items: {

				}
			},
			preview: {
				modes: "LiveAbstract"
			}
		};
	};
	return AdvancedDesigntime;
});


