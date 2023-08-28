sap.ui.define([],
	function() {
		"use strict";
		var DeepBinding = undefined/*XMLComposite*/.extend("composites.DeepBinding", {
			metadata: {
				properties: {
					text: {
						type: "string",
						defaultValue: "Default Value Text"
					}
				},
				aggregations: {
					fcItems: {
						type: "sap.ui.core.Control",
						multiple: true,
						forwarding: { idSuffix: "--innerVBox", aggregation: "items"}
					}
				},
				defaultAggregation: "fcItems"
			}
		});

		return DeepBinding;
	});
