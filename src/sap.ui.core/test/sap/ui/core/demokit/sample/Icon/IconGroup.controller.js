sap.ui.define(['sap/ui/core/mvc/Controller'],
	function(Controller) {
	"use strict";

	var IconGroupController = Controller.extend("sap.ui.core.sample.Icon.IconGroup", {
		handleStethoscopePress: function(evt) {
			sap.m.MessageToast.show("Over budget!");
		}
	});

	return IconGroupController;

});
