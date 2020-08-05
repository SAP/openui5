sap.ui.define(['sap/ui/core/XMLComposite'],
	function(XMLComposite) {
	"use strict";
	var FfText = XMLComposite.extend("composites.FfText", {
		metadata: {
			aggregations: {
				items: {
					type: "sap.ui.core.Control",
					multiple: true,
					forwarding: { idSuffix: "--forwardText", aggregation: "textItems" }
				}
			},
			defaultAggregation: "items"
		}
	});

	return FfText;
});
