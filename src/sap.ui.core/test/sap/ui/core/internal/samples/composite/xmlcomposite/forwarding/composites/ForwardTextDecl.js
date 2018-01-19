sap.ui.define(['sap/ui/core/XMLComposite'],
	function (XMLComposite) {
		"use strict";
		var ForwardTextDecl = sap.ui.core.XMLComposite.extend("composites.ForwardTextDecl", {
			metadata: {
				aggregations: {
					textItems: {
						type: "sap.ui.core.Control",
						multiple: true,
						invalidate: true, 
						forwarding: { idSuffix: "--innerVBox", aggregation: "items"}
					},
					text: {
						type: "sap.m.Text",
						multiple: false,
						forwarding: { idSuffix: "--text", aggregation: "content"}
					}
				},
				defaultAggregation: "textItems"
			},
			alias: "forwardtext"
		});

		return ForwardTextDecl;
	}, /* bExport= */true);
