sap.ui.define([
	'sap/ui/core/UIComponent',
	'sap/ui/core/InvisibleMessage'
	], function(UIComponent, InvisibleMessage) {
	"use strict";

	var Component = UIComponent.extend("sap.ui.core.sample.InvisibleMessage.Component", {

		metadata : {
			manifest: "json"
		},
		init: function () {
			UIComponent.prototype.init.apply(this, arguments);
			// we should instantiate the sap.ui.core.InvisibleMessage as earlier as posiible,in order to be compatible with the ARIA standard recommendations.
			this.oInvisibleMesage = InvisibleMessage.getInstance();
		}
	});

	return Component;

});
