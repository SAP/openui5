sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/message/MessageType"
], function (Controller, MessageType) {
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
			this.byId("card").showMessage("Short message", MessageType.Success);
		},

		onShowLongMessage: function () {
			this.byId("card").showMessage("Very long long long long long long long long long long long long message", MessageType.Error);
		}
	});
});