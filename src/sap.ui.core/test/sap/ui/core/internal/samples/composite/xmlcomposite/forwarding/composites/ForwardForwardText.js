sap.ui.define([
],
	function() {
	"use strict";
	var ForwardForwardText = undefined/*XMLComposite*/.extend("composites.ForwardForwardText", {
		metadata: {
			aggregations: {
				items: {
					type: "sap.ui.core.Control",
					multiple: true,
					forwarding: { idSuffix: "--VBox", aggregation: "items" }
				},
				items2: {
					type: "sap.ui.core.Control",
					multiple: true,
					forwarding: { idSuffix: "--ForwardText", aggregation: "textItems" }
				}
			},
			defaultAggregation: "items"
		}
	});

	return ForwardForwardText;
});
