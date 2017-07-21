sap.ui.define([
	'jquery.sap.global', 'sap/ui/core/XMLComposite'],
	function (jQuery, XMLComposite) {
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
						multiple: true
					}
				},
				defaultAggregation: "fcItems"
			}
		});

		return DeepBinding;
	}, /* bExport= */true);
