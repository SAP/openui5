sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"sap/m/Shell",
		"sap/ui/core/ComponentContainer"
	], function (Shell, ComponentContainer) {

		new Shell("Shell", {
			title : "flexiblecolumnlayoutHighlighting demo",
			app : new ComponentContainer({
				name : 'flexiblecolumnlayoutHighlighting',
				height : "100%",
				manifest: true,
				settings : {
					id : "flexiblecolumnlayoutHighlighting"
				}
			}),
			backgroundOpacity: 0,
			appWidthLimited: false //false
		}).placeAt('content');
	});
});
