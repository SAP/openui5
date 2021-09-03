sap.ui.define([
	"sap/ui/integration/Extension"
], function (Extension) {
	"use strict";

	// mock of database entries
	var aData = {
		products: [{
				"Id": "HT-1000",
				"Name": "Notebook Basic 15",
				"Description": "Notebook Basic 15 with 2,80 GHz quad core, 15\" LCD, 4 GB DDR3 RAM, 500 GB Hard Disc, Windows 8 Pro",
				"CurrencyCode": "USD",
				"Price": "956.00"
			},
			{
				"Id": "HT-1001",
				"Name": "Notebook Basic 17",
				"Description": "Notebook Basic 17 with 2,80 GHz quad core, 17\" LCD, 4 GB DDR3 RAM, 500 GB Hard Disc, Windows 8 Pro",
				"CurrencyCode": "USD",
				"Price": "1249.00"
			},
			{
				"Id": "HT-1002",
				"Name": "Notebook Basic 18",
				"Description": "Notebook Basic 18 with 2,80 GHz quad core, 18\" LCD, 8 GB DDR3 RAM, 1000 GB Hard Disc, Windows 8 Pro",
				"CurrencyCode": "USD",
				"Price": "1570.00"
			},
			{
				"Id": "HT-1003",
				"Name": "Notebook Basic 19",
				"Description": "Notebook Basic 19 with 2,80 GHz quad core, 19\" LCD, 8 GB DDR3 RAM, 1000 GB Hard Disc, Windows 8 Pro",
				"CurrencyCode": "USD",
				"Price": "1650.00"
			},
			{
				"Id": "HT-1004",
				"Name": "ITelO Vault",
				"Description": "Digital Organizer with State-of-the-Art Storage Encryption",
				"CurrencyCode": "USD",
				"Price": "299.00"
			},
			{
				"Id": "HT-1005",
				"Name": "Notebook Professional 15",
				"Description": "Notebook Professional 15 with 2,80 GHz quad core, 15\" Multitouch LCD, 8 GB DDR3 RAM, 500 GB SSD - DVD-Writer (DVD-R/+R/-RW/-RAM),Windows 8 Pro",
				"CurrencyCode": "USD",
				"Price": "1999.00"
			},
			{
				"Id": "HT-1006",
				"Name": "Notebook Professional 17",
				"Description": "Notebook Professional 17 with 2,80 GHz quad core, 17\" Multitouch LCD, 8 GB DDR3 RAM, 500 GB SSD - DVD-Writer (DVD-R/+R/-RW/-RAM),Windows 8 Pro",
				"CurrencyCode": "USD",
				"Price": "2299.00"
			}
		],
		count: 7
	};

	return Extension.extend("card.explorer.quickActions.QuickActionsExtension", {
		init: function () {
			Extension.prototype.init.apply(this, arguments);

			this.attachAction(this._handleAction.bind(this));
		},

		getData: function () {
			return Promise.resolve(aData);
		},

		_handleAction: function (oEvent) {
			var oCard = this.getCard(),
				oParameters = oEvent.getParameter("parameters");

			if (oParameters.method === "remove") {
				// remove this item from database
				this._removeItem(oParameters.id)
					.then(function () {
						oCard.refreshData();
					});
			}
		},

		_removeItem: function (sId) {
			// simulate backend request that removes the item from the database
			return new Promise(function (resolve, reject) {
				var iInd = aData.products.findIndex(function (oProduct) {
					return oProduct.Id === sId;
				});

				if (iInd !== -1) {
					aData.products.splice(iInd, 1);
					aData.count--;
					resolve();
				} else {
					reject();
				}
			});
		}
	});
});