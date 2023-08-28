sap.ui.define([],
	function() {
		"use strict";
		var MySelect2 = undefined/*XMLComposite*/.extend("composites.MySelect2", {
			metadata: {
				aggregations: {
					myItems: {
						type: "sap.ui.core.Item",
						multiple: true,
						bindable: "bindable",
						forwarding: { idSuffix: "--selectList", aggregation: "items"}
					}
				},
				defaultAggregation: "myItems"
			}
		});

		return MySelect2;
	});
