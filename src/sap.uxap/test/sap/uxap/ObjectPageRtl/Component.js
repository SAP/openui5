sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/base/i18n/Localization"
], function (UIComponent, Localization) {
	"use strict";

	return UIComponent.extend("sap.uxap.ObjectPageRtl.Component", {

		metadata : {
			manifest: "json"
		},

		init: function () {
			// call the init function of the parent
			UIComponent.prototype.init.apply(this, arguments);
			Localization.setRTL(true);
		}
	});
});
