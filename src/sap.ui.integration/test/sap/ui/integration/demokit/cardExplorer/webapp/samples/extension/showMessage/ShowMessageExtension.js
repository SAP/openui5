sap.ui.define([
	"sap/ui/integration/Extension",
	"sap/ui/integration/library"
], function (Extension, integrationLibrary) {
	"use strict";

	const CardActionType = integrationLibrary.CardActionType;

	const CardMessageType = integrationLibrary.CardMessageType;

	const ShowMessageExtension = Extension.extend("card.explorer.extension.showMessage.ShowMessageExtension");

	ShowMessageExtension.prototype.init = function () {
		Extension.prototype.init.apply(this, arguments);
		this.attachAction(this._handleAction.bind(this));
	};

	ShowMessageExtension.prototype._handleAction = function (oEvent) {
		if (oEvent.getParameter("type") !== CardActionType.Custom) {
			return;
		}

		const oActionParams = oEvent.getParameter("parameters");
		let pExecuteAction;

		if (oActionParams.method === "addToFavorites") {
			pExecuteAction = this._addItemToFavorites(oActionParams.id);
		} else if (oActionParams.method === "remove") {
			pExecuteAction = this._removeItem(oActionParams.id);
		} else {
			return;
		}

		const oActionSource = oEvent.getParameter("actionSource");
		const oCard = this.getCard();
		oActionSource.setEnabled(false); // temporary disable the button

		// Send request to the backend and show the result to the user
		pExecuteAction
			.then(function(sResponseText) {
				oCard.showMessage(sResponseText, CardMessageType.Success);

				if (oActionParams.method === "addToFavorites") {
					oActionSource.setVisible(false);
				} else if (oActionParams.method === "remove") {
					oCard.refreshData();
				}
			})
			.catch(function (aResponse) {
				const oResponse = aResponse[1];

				oResponse.text().then(function (sText) {
					oCard.showMessage(sText,  CardMessageType.Error);
				});

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
			}
		});
	};

	ShowMessageExtension.prototype._removeItem = function (sProductId) {
		// remove the item from the database and refresh the card data
		return this.getCard().request({
			url: "/products/" + sProductId,
			method: "DELETE"
		});
	};

	ShowMessageExtension.prototype._getCurrentUserId = function () {
		return "CardExplorerUser";
	};

	return ShowMessageExtension;
});
