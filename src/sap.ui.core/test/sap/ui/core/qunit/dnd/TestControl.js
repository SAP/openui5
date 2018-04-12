sap.ui.define([
	"sap/ui/core/Control"
], function(Control) {
	"use strict";

	var TestControl = Control.extend("test.TestControl", {
		metadata: {
			properties: {
				title: { type: "string", defaultValue: "" },
				showNoData : {type : "boolean", defaultValue : false}
			},
			aggregations: {
				children: { type: "test.TestControl", multiple: true, selector : "#{id}-children"},
				dragDropConfig : {name : "dragDropConfig", type : "sap.ui.core.dnd.DragDropBase", multiple : true},
			}
		},
		renderer: function(rm, oControl) {
			rm.write("<div");
			rm.writeControlData(oControl);
			rm.write(">");

			rm.write("<h1");
			rm.writeAttribute("id", oControl.getId() + "-title");
			rm.writeEscaped(oControl.getTitle());
			rm.write("></h1>");

			rm.write("<div");
			rm.writeAttribute("id", oControl.getId() + "-children");
			rm.write(">");
			var aChildren = oControl.getChildren();
			if (!aChildren.length) {
				rm.write("No data");
			} else {
				oControl.getChildren().forEach(function(oChild) {
					rm.renderControl(oChild);
				});
			}
			rm.write("</div>");

			rm.write("</div>");
		}
	});

	return TestControl;
});