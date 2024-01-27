sap.ui.define([
	"sap/ui/core/ComponentContainer"
], function (ComponentContainer) {
	"use strict";

	new ComponentContainer({
		name : 'sap.m.TableScrollToIndex',
		height : "100%",
		settings : {
			id : "sap.m.TableScrollToIndex"
		},
		manifest: true
	}).placeAt('content');
});
