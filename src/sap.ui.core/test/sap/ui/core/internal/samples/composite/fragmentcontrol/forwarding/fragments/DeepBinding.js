sap.ui.define([
	'jquery.sap.global', 'sap/ui/core/FragmentControl'],
	function (jQuery, FragmentControl) {
		"use strict";
		var DeepBinding = sap.ui.core.FragmentControl.extend("fragments.DeepBinding", {
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
				defaultAggregation: "items"
			}
		});

		return DeepBinding;
	}, /* bExport= */true);
