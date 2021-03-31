sap.ui.define([
	'sap/ui/core/mvc/Controller'
], function(Controller) {
	"use strict";

	return Controller.extend("sap.ui.mdc.sample.FieldDisplay.Controller", {

		onInit: function() {
			this.getView().bindElement("/Books(1)");
			sap.ui.getCore().getMessageManager().registerObject(this.getView(), true);
		}

	});
}, true);
