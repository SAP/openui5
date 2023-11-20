sap.ui.define([
	'sap/ui/core/UIComponent'
],
	function(UIComponent) {
	"use strict";

	return UIComponent.extend("sap.m.sample.invisibleMessaging.Component", {
		metadata : {
			manifest: "json"
		},
		init: function () {
			UIComponent.prototype.init.apply(this, arguments);
		}
	});
});
