sap.ui.require([
	"sap/m/App",
	"sap/m/Page",
	"sap/ui/core/ComponentContainer"
], function(
	App,
	Page,
	ComponentContainer
) {
	"use strict";

	sap.ui.getCore().attachInit(function() {
		new App({
			pages: [
				new Page({
					title: "simple Planning Calendar",
					enableScrolling : true,
					content: [
						new ComponentContainer({
							name : "sap.m.sample.PlanningCalendar",
							settings : {
								id : "PlanningCalendar"
							},
							manifest:true
						})
					]
				})
			]
		}).placeAt("content");
	});
});
