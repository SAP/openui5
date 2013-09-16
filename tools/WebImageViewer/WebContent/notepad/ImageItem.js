jQuery.sap.declare("notepad.ImageItem");
sap.ui.core.Control.extend("notepad.ImageItem", {
	metadata : {
		properties : {
			"src" : "string",
			"text" : "string",
			"checkable" : {
				type : "boolean",
				defaultValue : false,
			},
			"checked" : {
				type : "boolean",
				defaultValue : false,
			},
			"width" : {
				type : "sap.ui.core.CSSSize",
			},
			"height" : {
				type : "sap.ui.core.CSSSize",
			},
		},
		aggregations : {
			"_checkbox" : {
				type : "sap.ui.commons.CheckBox",
				multiple : false,
				visibility : "hidden"
			}
		},
		events : {
			"select" : {},
		}
	},
	init : function() {
		this._image = new sap.ui.commons.Image({
		});
		this._bCancelled = false;
		var ctrl = this;
		this._checkbox = new sap.ui.commons.CheckBox({
			width : "210px",
			change : function(oEvent) {
				ctrl.setProperty("checked", oEvent.getParameter("checked"));
				ctrl._bCancelled = true;
			}

		});
		this.setAggregation("_checkbox", this._checkbox);
	},

	onclick : function(evt) {
		if(!this._bCancelled) {
			this.fireSelect({
				checked : this._checkbox.getChecked()
			});
		}
		this._bCancelled = false;
	},

	setSrc : function(src) {
		this.setProperty("src", src);
		this._image.setSrc(src);
		this._image.setTooltip(src);
	},

	setChecked : function(c) {
		this.setProperty("checked", c);
		this._checkbox.setChecked(c);
	},

	onAfterRendering : function() {
		var height = this.getProperty("height");
		var width = this.getProperty("width");
		if(width && height) {
			height = parseInt(height.slice(0, -2)) - 30;
			this._image.$().attr('style', "max-width:" + width + ";max-height:" + height + "px");
		}
	},

	renderer : function(rm, ctrl) {
		rm.write("<div");
		rm.writeControlData(ctrl);
		rm.writeAttribute("class", "imageItemLayout");
		rm.write(">");
		rm.write("<table");
		rm.addStyle("width", ctrl.getWidth());
		rm.addStyle("height", ctrl.getHeight());
		rm.addStyle("border-collapse", 'collapse');
		rm.writeStyles();
		rm.write(">");

		rm.write("<tr class='imageItemImg'>");
		rm.write("<td colSpan=2>");
		rm.renderControl(ctrl._image);
		rm.write("</td>");
		rm.write("</tr>");

		rm.write("<tr >");

		rm.write("<td class='imageItemFooter'>");
		var txt = ctrl.getProperty('text');
		if(ctrl.getProperty('checkable')) {
			// rm.write("<td style='width: 30px;'>");
			var chb = ctrl.getAggregation("_checkbox");
			chb.setText(txt);
			chb.setTooltip(txt);
			rm.renderControl(chb);
			// rm.write("</td>");
		} else {
			ctrl._textView = new sap.ui.commons.TextView({
				width : "80%",
				text : txt,
				textAlign : "Center",
			});
			rm.renderControl(ctrl._textView);
		}
		// rm.write("<td>");
		rm.write("</td>");
		rm.write("</tr>");
		rm.write("</table>");
		rm.write("</div>");
	},

});
