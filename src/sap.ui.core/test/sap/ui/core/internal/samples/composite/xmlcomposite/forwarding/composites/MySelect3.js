sap.ui.define(['sap/ui/core/XMLComposite'],
	function (XMLComposite) {
		"use strict";
		var MySelect3 = XMLComposite.extend("composites.MySelect3", {
			metadata: {
				aggregations: {
					myItems: {
						type: "sap.ui.core.Item",
						multiple: true,
						bindable: "bindable",
						forwarding: { idSuffix: "--select", aggregation: "items"}
					}
				},
				defaultAggregation: "myItems"
			}
		});

		return MySelect3;
	});
