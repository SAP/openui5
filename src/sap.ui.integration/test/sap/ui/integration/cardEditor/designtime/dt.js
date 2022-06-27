/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/integration/Designtime",
	"sap/ui/thirdparty/jquery",
	"sap/base/util/merge"
], function (
	Designtime,
	jQuery,
	merge
) {
	"use strict";
	return function () {
		var oDesigntime = new Designtime({
			"form": {
				"items": {}
			},
			"preview": {
				"modes": "LiveAbstract"
			}
		});
		oDesigntime._readyPromise = function (oCardInterface, oInternalCard) {
			var that = this;
			that.onCardReady(oCardInterface, oInternalCard);
			var aJsonFiles = [
				"dt/items1.json",
				"dt/items2.json",
				"dt/items3.json"
			];
			var aPromises = [];
			aJsonFiles.forEach(function (sFileName) {
				// the prefix of the json files should match the id in manifest.json
				// "id": "sap.ui5.test.cardeditor.listcard"
				var sItemsPath = sap.ui.require.toUrl("sap/ui5/test/cardeditor/listcard/" + sFileName);
				aPromises.push(
					new Promise(function (resolve, reject) {
						jQuery.ajax(sItemsPath, {
							dataType: "json"
						}).done(function (oItems) {
							resolve(oItems);
						}).fail(function (jqXHR, sTextStatus, sError) {
							reject();
						});
					})
				);
			});
			var createPromise = function(oItem, n) {
				return new Promise(function (res) {
					sap.ui.require([oItem.testJS], function(n, testJS) {
						// process with the js file after loading it
						var newValue = testJS(n);
						this.testValue = newValue;
						res();
					}.bind(oItem, n));
				});
			};
			// load json files
			return Promise.all(aPromises).then(function (aItems) {
				var items1 = aItems[0],
					items2 = aItems[1],
					items3 = aItems[2];
				var oItems = merge(items1, items2, items3);
				that.settings.form.items = oItems;
			}).then(function () {
				aPromises = [];
				// create promises for loading js files
				for (var n in that.settings.form.items) {
					var oItem = that.settings.form.items[n];
					if (oItem.testJS && oItem.testJS !== "") {
						aPromises.push(
							createPromise(oItem, n)
						);
					}
				}
				if (aPromises.length > 0) {
					// loading js files
					return Promise.all(aPromises);
				} else {
					return Promise.resolve();
				}
			});
		};
		return oDesigntime;
	};
});