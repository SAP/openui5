sap.ui.define([],
	function() {
		"use strict";
		var MySelectWrapper = undefined/*XMLComposite*/.extend("composites.MySelectWrapper", {
			metadata: {
				aggregations: {
					fcItems: {
						type: "sap.ui.core.Item",
						multiple: true,
						bindable: "bindable",
						forwarding: { idSuffix: "--mySelect", aggregation: "myItems"}
					}
				},
				defaultAggregation: "fcItems"
			},
			alias: "mySelectWrapper"
		});

		return MySelectWrapper;
	});
