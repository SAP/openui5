sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function(Controller) {
	"use strict";

	return Controller.extend("sap.ui.mdc.sample.Chart.Controller", {

		onInit: function() {
			this.getView().bindElement("/Books");
			sap.ui.getCore().getMessageManager().registerObject(this.getView(), true);
		}

	});
}, true);
