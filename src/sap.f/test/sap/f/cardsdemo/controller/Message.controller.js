sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/library"
], function (Controller, coreLibrary) {
	"use strict";

	return Controller.extend("sap.f.cardsdemo.controller.Message", {

		onInit: function () {
			this.byId("cardContainer").addEventDelegate({
				onAfterRendering: function (e) {
					e.srcControl.$().css({
						resize: "both",
						overflow: "overlay"
					});
				}
			});
		},

		onShowShortMessage: function () {
			this.byId("card").showMessage("Short message", coreLibrary.MessageType.Success);
		},

		onShowLongMessage: function () {
			this.byId("card").showMessage("Very long long long long long long long long long long long long message", coreLibrary.MessageType.Error);
		}
	});
});