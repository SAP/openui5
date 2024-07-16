sap.ui.define([
], function() {
	"use strict";
	return undefined/*XMLComposite*/.extend("composites.ForwardText2", {
		metadata: {
			aggregations: {
				textItems: {
					type: "sap.m.Text",
					multiple: true,
					forwarding: { idSuffix: "--VBox", aggregation: "items" }
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
});
