sap.ui.define(["sap/ui/integration/Extension", "sap/ui/integration/ActionDefinition", "sap/base/Log"], function (Extension, ActionDefinition, Log) {
	"use strict";

	return Extension.extend("cardWithExtension.ListCardSampleExtension", {
		init: function () {
			Extension.prototype.init.apply(this, arguments);

			this.attachAction(function (oEvent) {
				Log.error("Action handled in the Extension:" + JSON.stringify(oEvent.getParameters().parameters));
			});
		},
		getData: function () {
			var oCard = this.getCard();

			return oCard.request({
				"url": "./wrong_name.json"
			}).then(function (aData) {
				return aData;
			}).catch(function (oResult) {
				return [
					{"city": "Invalid", "description": oResult.message}
				];
			});
		}
	});
});
