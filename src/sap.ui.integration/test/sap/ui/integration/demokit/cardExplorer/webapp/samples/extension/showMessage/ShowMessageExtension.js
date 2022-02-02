sap.ui.define([
	"sap/ui/integration/Extension",
	"sap/ui/integration/library",
	"sap/ui/core/library"
], function (Extension, integrationLibrary, coreLibrary) {
	"use strict";

	var CardActionType = integrationLibrary.CardActionType;
	var MessageType = coreLibrary.MessageType;

	var ShowMessageExtension = Extension.extend("card.explorer.extension.showMessage.ShowMessageExtension");

	ShowMessageExtension.prototype.init = function () {
		Extension.prototype.init.apply(this, arguments);
		this.attachAction(this._handleAction.bind(this));
	};

	ShowMessageExtension.prototype._handleAction = function (oEvent) {
		if (oEvent.getParameter("type") !== CardActionType.Custom) {
			return;
		}

		var oActionParams = oEvent.getParameter("parameters");
		var pExecuteAction;

		if (oActionParams.method === "addToFavorites") {
			pExecuteAction = this._addItemToFavorites(oActionParams.id);
		} else if (oActionParams.method === "remove") {
			pExecuteAction = this._removeItem(oActionParams.id);
		} else {
			return;
		}

		var oActionSource = oEvent.getParameter("actionSource");
		var oCard = this.getCard();
		oActionSource.setEnabled(false); // temporary disable the button

		// Send request to the backend and show the result to the user
		pExecuteAction
			.then(function(sResponseText) {
				oCard.showMessage(sResponseText, MessageType.Success);

				if (oActionParams.method === "addToFavorites") {
					oActionSource.setVisible(false);
				} else if (oActionParams.method === "remove") {
					oCard.refreshData();
				}
			})
			.catch(function (aResponse) {
				var oResponse = aResponse[1];

				oCard.showMessage(oResponse.responseText, MessageType.Error);

				oActionSource.setEnabled(true);
			});
	};

	ShowMessageExtension.prototype._addItemToFavorites = function (sProductId) {
		// add the item to favorites of the current user
		return this.getCard().request({
			url: "/user/" + this._getCurrentUserId() + "/favorites",
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			parameters: {
				productId: sProductId
			},
			dataType: "text"
		});
	};

	ShowMessageExtension.prototype._removeItem = function (sProductId) {
		// remove the item from the database and refresh the card data
		return this.getCard().request({
			url: "/products/" + sProductId,
			method: "DELETE",
			dataType: "text"
		});
	};

	ShowMessageExtension.prototype._getCurrentUserId = function () {
		return "CardExplorerUser";
	};

	return ShowMessageExtension;
});
