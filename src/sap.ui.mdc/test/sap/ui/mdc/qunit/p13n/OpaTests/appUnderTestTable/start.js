sap.ui.require([
	'sap/ui/core/ComponentContainer', 'sap/m/Shell'
], function(ComponentContainer, Shell) {
	"use strict";

	new Shell({
		title: "V4 Sample",
		app: new ComponentContainer({
			name: 'AppUnderTestTable',
			height: "100%",
			settings: {
				id: "FlexTestComponent"
			}
		})
	}).placeAt('content');

});
