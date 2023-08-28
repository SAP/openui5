sap.ui.define([],
	function() {
	"use strict";
	var FfText = undefined/*XMLComposite*/.extend("composites.FfText", {
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
