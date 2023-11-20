sap.ui.define([
	"sap/ui/core/Messaging",
	"sap/ui/core/mvc/Controller"
], function(Messaging, Controller) {
	"use strict";

	return Controller.extend("sap.ui.mdc.sample.TableWithFilterBar.Controller", {

		onInit: function() {
			// this.getView().bindElement("/Books");
			Messaging.registerObject(this.getView(), true);
		}

	});
});
