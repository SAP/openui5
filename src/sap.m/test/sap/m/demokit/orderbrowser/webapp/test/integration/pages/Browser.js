sap.ui.define([
	"sap/ui/test/Opa5"
], function (Opa5) {
	"use strict";

	Opa5.createPageObjects({
		onTheBrowserPage: {

			actions: {

				iChangeTheHashToObjectN: function (iObjIndex) {
					return this.waitFor({
						success: function () {
							var aEntitySet = this.getEntitySet("Objects");
							Opa5.getHashChanger().setHash("/Orders/" + aEntitySet[iObjIndex].OrderID);
						}
					});
				},

				iChangeTheHashToTheRememberedItem: function () {
					return this.waitFor({
						success: function () {
							var sObjectId = this.getContext().currentItem.id;
							Opa5.getHashChanger().setHash("/Orders/" + sObjectId);
						}
					});
				},

				iChangeTheHashToSomethingInvalid: function () {
					return this.waitFor({
						success: function () {
							Opa5.getHashChanger().setHash("/somethingInvalid");
						}
					});
				}

			},

			assertions: {

				iShouldSeeTheHashForObjectN: function (iObjIndex) {
					return this.waitFor({
						success: function () {
							var aEntitySet = this.getEntitySet("Objects");
							var oHashChanger = Opa5.getHashChanger();
							var sHash = oHashChanger.getHash();
							Opa5.assert.strictEqual(sHash, "Orders/" + aEntitySet[iObjIndex].OrderID, "The Hash is not correct");
						}
					});
				},

				iShouldSeeTheHashForTheRememberedObject: function () {
					return this.waitFor({
						success: function () {
							var sObjectId = this.getContext().currentItem.id;
							var	oHashChanger = Opa5.getHashChanger();
							var	sHash = oHashChanger.getHash();
							Opa5.assert.strictEqual(sHash, "Orders/" + sObjectId + "/?tab=shipping", "The Hash is not correct");
						}
					});
				},

				iShouldSeeAnEmptyHash: function () {
					return this.waitFor({
						success: function () {
							var oHashChanger = Opa5.getHashChanger();
							var sHash = oHashChanger.getHash();
							Opa5.assert.strictEqual(sHash, "", "The Hash should be empty");
						},
						errorMessage: "The Hash is not Correct!"
					});
				}

			}

		}

	});

});
