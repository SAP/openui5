sap.ui.define([
	'jquery.sap.global', 'sap/ui/core/XMLComposite'],
	function (jQuery, XMLComposite) {
		"use strict";
		var DeepBinding = sap.ui.core.XMLComposite.extend("composites.DeepBinding2", {
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
