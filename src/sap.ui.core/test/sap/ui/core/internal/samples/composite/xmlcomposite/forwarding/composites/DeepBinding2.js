sap.ui.define([
	'sap/ui/core/XMLComposite'],
	function (XMLComposite) {
		"use strict";
		var DeepBinding = XMLComposite.extend("composites.DeepBinding2", {
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
