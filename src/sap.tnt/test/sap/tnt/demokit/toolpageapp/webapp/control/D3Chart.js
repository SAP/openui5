sap.ui.define([
	"sap/ui/core/Control"
], function (Control) {
	"use strict";

	return Control.extend("sap.ui.demo.toolpageapp.control.D3Chart", {

		metadata: {
			properties: {
				type: {type: "string", defaultValue: "Radial"}
			}
		},

		init: function () {
			// TODO: put 1-time initialization here
		},

		onAfterRendering: function () {
			// TODO: hook in the D3 charts here
			this._renderCharts();
		},

		_renderCharts: function () {
			// TODO: set up the D3 charts once
			var $this = this.$();
			switch(this.getType()) {
				case "Delta": break;
				case "Bullet": break;
				case "Harvey": break;
				case "Area": break;
				case "Column": break;
				case "Comparison": break;
				case "Radial":
				default: // "Radial"
			}

			// TODO: connect it to the dom node provided by the renderer
			$this.html(this.getType());
		},

		renderer: function (oRM, oControl) {
			// TODO: add dom as needed here
			oRM.write("<div");
			oRM.writeControlData(oControl);
			oRM.addClass("customD3Chart");
			oRM.writeClasses();
			oRM.write(">");
			oRM.write("</div>");
		}
	});

});
