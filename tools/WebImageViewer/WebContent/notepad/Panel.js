jQuery.sap.declare("notepad.Panel");
sap.ui.core.Control.extend("notepad.Panel", {
	metadata : {
		properties : {
			"width" : {
				type : "sap.ui.core.CSSSize",
			},
			"height" : {
				type : "sap.ui.core.CSSSize",
			},
		},
		defaultAggregation : "content",
		aggregations : {
			"header" : {
				type : "sap.ui.core.Control",
				multiple : false,
			},
			"content" : {
				type : "sap.ui.core.Control",
				multiple : false,
			},
		}
	},

	renderer : function(rm, ctrl) {
		rm.write("<div");
		rm.writeControlData(ctrl);
		rm.addClass("npPanel");
		rm.writeClasses();
		rm.addStyle("width", ctrl.getWidth());
		rm.addStyle("height", ctrl.getHeight());
		rm.writeStyles();
		rm.write(">");

		//header
		var header = ctrl.getAggregation("header");
		rm.write("<header");
		rm.addClass("sapUiPanelHdr");
		rm.addClass("sapUiPanelHdrEmph");
		rm.writeClasses();
		rm.write(">");
		rm.renderControl(header);
		rm.write("</header>");

		//content
		var ctnt = ctrl.getAggregation("content");
		rm.write("<div");
		rm.addClass("sapUiPanelCont");
		rm.addClass("notepadCont");
		rm.writeClasses();
		rm.write(">");
		rm.renderControl(ctnt);
		rm.write("</div>");

		rm.write("</div>");
	}

});
