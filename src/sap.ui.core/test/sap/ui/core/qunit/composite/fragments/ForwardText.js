sap.ui.define([
	'sap/ui/core/FragmentControl'
], function(FragmentControl) {
	"use strict";
	return FragmentControl.extend("fragments.ForwardText", {
		metadata: {
			aggregations: {
				textItems: {
					type: "sap.m.Text",
					multiple: true
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
}, /* bExport= */true);
