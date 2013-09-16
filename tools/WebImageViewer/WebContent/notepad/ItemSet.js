jQuery.sap.declare("notepad.ItemSet");
sap.ui.core.Control.extend("notepad.ItemSet", {
	metadata: {
		properties: {
			"width": {
				type: "sap.ui.core.CSSSize",
			},
			"height": {
				type: "sap.ui.core.CSSSize",
			},
			"showToolbar": {
				type: "boolean",
				defaultValue: true,
			},
		},
		aggregations: {
			"items": {
				type: "sap.ui.core.Control",
				multiple: true,
				singularName: "item"
			},
			"tools" : {
				type : "sap.ui.core.Control",
				multiple : true,
				singularName: "tool"
			},
			"rightTools" : {
				type : "sap.ui.core.Control",
				multiple : true,
				singularName: "rightTool"
			},
		}
	},
	init: function() {},

	bindItems: function(path, param) {
		if (param instanceof notepad.ImageItem) {
			this.bindAggregation("items", path, param);
		} else {
			this.bindAggregation("items", path, new aug.MatrixItem(param));
		}
	},

	addItem: function(item) {
		this.addAggregation("items", item);
	},

	onAfterRendering: function() {},

	renderer: function(rm, ctrl) {
		var items = ctrl.getAggregation("items") || [];

		rm.write("<div");
		rm.writeControlData(ctrl);
		rm.addClass("itemSetLayout");
		rm.writeClasses();
		rm.addStyle("width", ctrl.getWidth());
		rm.addStyle("height", ctrl.getHeight());
		rm.writeStyles();
		rm.write(">");

		//toolbar
		if (ctrl.getProperty('showToolbar')) {
			var tools = ctrl.getAggregation("tools") || [];
			var rightTools = ctrl.getAggregation("rightTools") || [];
			if (tools.length > 0 || rightTools > 0) {
				rm.write("<div");
				rm.writeAttribute("class", "itemSetToolbar");
				rm.write(">");

				//left tool item
				rm.write("<div");
				rm.writeAttribute("class", "itemSetToolbarItem");
				rm.write(">");
				for (var i = 0; i < tools.length; i++) {
					rm.renderControl(tools[i]);
				}
				rm.write("</div>");

				//right tool item
				rm.write("<div");
				rm.writeAttribute("class", "itemSetToolbarRightItem");
				rm.write(">");
				for (var i = 0; i < rightTools.length; i++) {
					rm.renderControl(rightTools[i]);
				}
				rm.write("</div>");

				rm.write("</div>");
			}
		} else {
			rm.write("<div");
			rm.writeAttribute("class", "itemSetToolbar");
			rm.write(">");

			rm.write("</div>");
		}

		//content
		rm.write("<div");
		rm.writeAttribute("class", "itemSetContent");
		rm.writeAttribute("style", "height: 90%;overflow-y:scroll;");
		rm.write(">");
		for (var i = 0; i < items.length; i++) {
			rm.renderControl(items[i]);
		}
		rm.write("</div>");

		rm.write("</div>");
	},

});