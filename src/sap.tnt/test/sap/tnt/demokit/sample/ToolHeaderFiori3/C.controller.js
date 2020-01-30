sap.ui.define([
	'sap/ui/core/mvc/Controller',
	'sap/m/MessageToast',
	'sap/m/library'
], function (Controller, MessageToast, library) {
	"use strict";

	return Controller.extend("sap.tnt.sample.ToolHeaderFiori3.C", {

		onAvatarPressed: function () {
			MessageToast.show("Avatar pressed!");
		}

	});
});