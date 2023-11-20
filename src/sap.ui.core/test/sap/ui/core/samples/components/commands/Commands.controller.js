sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/ShortcutHintsMixin"
], function(Controller, ShortcutHintsMixin) {
	"use strict";

	return Controller.extend("samples.components.commands.Commands", {
		onInit: function() {
			for (var i = 1; i <= 6; i++) {
				var oBtn = this.getView().byId("b" + i);
				ShortcutHintsMixin.addConfig(oBtn, { message: "Ctrl+Y" }, oBtn);
			}
		}
	});
});