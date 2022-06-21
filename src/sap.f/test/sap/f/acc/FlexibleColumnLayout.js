sap.ui.define([
	"sap/m/Shell",
	"sap/ui/core/ComponentContainer"
], function (Shell, ComponentContainer) {
	"use strict";

	new Shell("Shell", {
		title : "FlexibleColumnLayout demo",
		app : new ComponentContainer({
			name : 'flexiblecolumnlayout',
			height : "100%",
			manifest: true,
			settings : {
				id : "flexiblecolumnlayout"
			}
		}),
		backgroundOpacity: 0,
		appWidthLimited: false //false
	}).placeAt('content');
});
