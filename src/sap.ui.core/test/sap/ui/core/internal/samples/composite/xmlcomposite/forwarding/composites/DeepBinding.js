sap.ui.define(['sap/ui/core/XMLComposite'],
	function (XMLComposite) {
		"use strict";
		var DeepBinding = sap.ui.core.XMLComposite.extend("composites.DeepBinding", {
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
	}, /* bExport= */true);
