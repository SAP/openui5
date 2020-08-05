sap.ui.define(['sap/ui/core/XMLComposite'], function (XMLComposite) {
	"use strict";
	var oTable = XMLComposite.extend("sap.ui.core.sample.XMLComposite.02.comp.Table", {
		metadata: {
			aggregations: {
				content: {
					type: "sap.ui.core.Item",
					multiple: true
				},
				columns: {
					type: "sap.m.Column",
					multiple: true,
						// the aggregation will be forwarded directly to the corresponding aggregation in the inner table in table.control.xml
					forwarding: { idSuffix: "--innerTable", aggregation: "columns"}
				},
				items: {
					type: "sap.m.ListItemBase",
					multiple: true,
					// the aggregation will be forwarded directly to the corresponding aggregation in the inner table in table.control.xml
					forwarding: { idSuffix: "--innerTable", aggregation: "items"}
				}
			},
			events: {
				press: {
					parameters: {
						value: { type: "string" }
					}
				}
			}
		}
	});
	return oTable;
});
