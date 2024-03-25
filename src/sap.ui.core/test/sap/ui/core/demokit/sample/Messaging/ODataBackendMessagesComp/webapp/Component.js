sap.ui.define([
	"sap/ui/core/Messaging",
	"sap/ui/core/UIComponent"
], function (Messaging, UIComponent) {
	"use strict";

	return UIComponent.extend("sap.ui.core.sample.Messaging.ODataBackendMessagesComp.Component", {

		metadata: {
			interfaces: ["sap.ui.core.IAsyncContentCreation"],
			manifest: "json"
		},

		init() {
			// call the init function of the parent
			UIComponent.prototype.init.apply(this, arguments);

			// set message model
			this.setModel(Messaging.getMessageModel(), "message");

			// create the views based on the url/hash
			this.getRouter().initialize();
		}

	});

});
