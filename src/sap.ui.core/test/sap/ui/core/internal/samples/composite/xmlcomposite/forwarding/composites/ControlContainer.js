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
			renderer: {
				apiVersion: 2,
				render: function (oRm, oControl) {
					oRm.openStart("div", oControl).openEnd();
					oRm.renderControl(oControl.getContent());
					oRm.close("div");
				}
			}
		});
		return ControlContainer;
	});