sap.ui.define(['sap/ui/core/Control'],
	function (Control) {
		"use strict";
		var ControlContainer = Control.extend("composites.ControlContainer", {
			metadata: {
				aggregations: {
					content: {
						type: "sap.ui.core.Control",
						multiple: false
					}
				},
				defaultAggregation: "content"
			},
			renderer: function (oRm, oControl) {
				oRm.write("<div");
				oRm.writeControlData(oControl);
				oRm.writeClasses();
				oRm.write(">");
                oRm.renderControl(oControl.getContent());
				oRm.write("</div>");
			}
		});
		return ControlContainer;
	}, /* bExport= */true);