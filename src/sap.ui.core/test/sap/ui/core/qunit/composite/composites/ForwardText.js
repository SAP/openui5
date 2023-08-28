sap.ui.define([],
	function() {
		"use strict";
		var ForwardText = undefined/*XMLComposite*/.extend("composites.ForwardText", {
			metadata: {
				aggregations: {
					textItems: {
						type: "sap.ui.core.Control",
						multiple: true,
						invalidate: true,
						forwarding: { idSuffix: "--innerVBox", aggregation: "items" }
					},
					text: {
						type: "sap.ui.core.Control",
						multiple: false,
						forwarding: { idSuffix: "--innerControlContainer", aggregation: "content" }
					}
				},
				defaultAggregation: "textItems"
			}
		});

		return ForwardText;
	});
