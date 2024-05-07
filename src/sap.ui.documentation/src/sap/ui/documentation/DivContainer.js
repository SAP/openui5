/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/Control"
], function (Control) {
	"use strict";

	return Control.extend("sap.ui.documentation.DivContainer", {
		metadata: {
			library: "sap.ui.documentation",
			defaultAggregation: "content",
			aggregations: {
				content: {type: "sap.ui.core.Control", multiple: true, singularName: "content"}
			}
		},
		renderer: {
			apiVersion: 2,
			render: function(oRm, oControl) {
				oRm.openStart("div", oControl);
				oRm.openEnd();

				const aContent = oControl.getContent();
				aContent.forEach((oContent) => {
					oRm.renderControl(oContent);
				});

				oRm.close("div");
			}
		}
	});
});

