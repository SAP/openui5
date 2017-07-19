sap.ui.define([
	'jquery.sap.global', 'sap/ui/core/FragmentControl'],
	function (jQuery, FragmentControl) {
		"use strict";
		var DeepBinding = sap.ui.core.FragmentControl.extend("fragments.DeepBinding2", {
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
