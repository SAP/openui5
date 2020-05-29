sap.ui.define([
	"sap/ui/core/Control"
], function(Control) {
	"use strict";

	var TestControl = Control.extend("test.TestControl", {
		metadata: {
			dnd: true,
			properties: {
				title: { type: "string", defaultValue: "" },
				showNoData : {type : "boolean", defaultValue : false}
			},
			aggregations: {
				children: { type: "test.TestControl", multiple: true, selector : "#{id}-children", dnd : true },
				test : { type: "test.TestControl", multiple: true, dnd : {draggable: true, droppable: true, layout: "Horizontal"}}
			}
		},
		renderer: {
			apiVersion: 2,
			render: function(rm, oControl) {
				rm.openStart("div", oControl).openEnd();

					rm.openStart("h1", oControl.getId() + "-title")
						.openEnd()
						.text(oControl.getTitle())
						.close("h1");

					rm.openStart("div", oControl.getId() + "-children").openEnd();
					var aChildren = oControl.getChildren();
					if (!aChildren.length) {
						rm.openStart("span")
							.openEnd()
							.text("No data")
							.close("span");
					} else {
						aChildren.forEach(function(oChild) {
							rm.renderControl(oChild);
						});
					}
					rm.close("div");

				rm.close("div");
			}
		}
	});

	return TestControl;
});