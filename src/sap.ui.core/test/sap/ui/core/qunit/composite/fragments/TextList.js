sap.ui.define([
	'jquery.sap.global', 'sap/ui/core/FragmentControl'
], function(jQuery, FragmentControl) {
	"use strict";
	return FragmentControl.extend("fragments.TextList", {
		metadata: {
			aggregations: {
				texts: {
					type: "sap.ui.core.Item",
					multiple: true
				},
				outerButton: {
					type: "sap.m.Button",
					multiple: false
				},
				outerlinks: {
					type: "sap.m.Link",
					multiple: true
				}
			}
		}
	});
}, /* bExport= */true);
