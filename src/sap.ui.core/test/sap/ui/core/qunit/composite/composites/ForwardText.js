sap.ui.define([
	'sap/ui/core/XMLComposite'
], function(XMLComposite) {
	"use strict";
	return XMLComposite.extend("composites.ForwardText", {
		metadata: {
			aggregations: {
				textItems: {
					type: "sap.m.Text",
					multiple: true
				},
				text: {
					type: "sap.m.Text",
					multiple: false
				}
			},
			defaultAggregation: "textItems"
		},
		alias: "forwardtext"
	});
}, /* bExport= */true);
