sap.ui.loader.config({
    paths: {
        "custom/Chart": sap.ui.require.toUrl("sap/ui/mdc/demokit/sample/Chart/ChartJS/control/ChartJS"),
		"custom/Hammer": sap.ui.require.toUrl("sap/ui/mdc/demokit/sample/Chart/ChartJS/control/hammerjs"),
		"custom/ChartZoom": sap.ui.require.toUrl("sap/ui/mdc/demokit/sample/Chart/ChartJS/control/chartjs-plugin-zoom")
    },
    shim: {
        "custom/Chart": {
            amd: true,
            exports: "Chart"
        },
		"custom/Hammer": {
            amd: true,
            exports: "Hammer"
        },
		"custom/ChartZoom": {
			amd: true,
			deps: [
				"custom/Chart"
			],
			exports: "ChartZoom"
		}
    }
});

sap.ui.define([
	"sap/ui/core/UIComponent",
	"custom/Chart",
	"custom/ChartZoom"
], function(UIComponent, Chart, ChartZoom) {
	"use strict";

	return UIComponent.extend("sap.ui.mdc.demokit.sample.Chart.ChartJS.Component", {
		init: function() {
			UIComponent.prototype.init.apply(this, arguments);
			Chart.register(ChartZoom);
		}
	});
});
