sap.ui.define([],
	function() {
		"use strict";
		var MySelect = undefined/*XMLComposite*/.extend("composites.MySelect", {
			metadata: {
				aggregations: {
					myItems: {
						type: "sap.ui.core.Item",
						multiple: true,
						bindable: "bindable",
						forwarding: { idSuffix: "--itemList", aggregation: "items"}
					}
				},
				defaultAggregation: "myItems"
			}
		});

		return MySelect;
	});
