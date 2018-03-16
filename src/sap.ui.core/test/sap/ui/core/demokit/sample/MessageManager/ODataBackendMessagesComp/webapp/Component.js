sap.ui.define([
	"sap/ui/core/UIComponent"
], function (UIComponent) {
	"use strict";

	return UIComponent.extend("sap.ui.core.sample.MessageManager.ODataBackendMessagesComp.Component", {

		metadata: {
			manifest: "json"
		},

		init: function () {
			// call the init function of the parent
			UIComponent.prototype.init.apply(this, arguments);

			// set message model
			this.setModel(sap.ui.getCore().getMessageManager().getMessageModel(), "message");

			// create the views based on the url/hash
			this.getRouter().initialize();
		}

	});

});
