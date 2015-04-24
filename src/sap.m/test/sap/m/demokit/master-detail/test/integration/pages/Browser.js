sap.ui.require([
		'sap/ui/test/Opa5',
		'sap/ui/demo/masterdetail/test/integration/pages/Common'
	],
	function(Opa5, Common) {
		"use strict";

		Opa5.createPageObjects({
			onTheBrowserPage: {
				baseClass: Common,
				actions: {
					iChangeTheHashToObjectN : function (iObjIndex) {
						return this.waitFor(this.createAWaitForAnEntitySet({
							entitySet : "Objects",
							success : function (aEntitySet) {
								Opa5.getHashChanger().setHash("/object/" + aEntitySet[iObjIndex].ObjectID);
							}
						}));
					},

					iChangeTheHashToTheRememberedId : function (iObjIndex) {
						return this.waitFor({
							success: function (aEntitySet) {
								var sObjectId = this.getContext().currentListItem.getBindingContext().getProperty("ObjectID");
								Opa5.getHashChanger().setHash("/object/" + sObjectId);
							}
						});
					},

					iChangeTheHashToSomethingInvalid : function () {
						return this.waitFor({
							success : function () {
								Opa5.getHashChanger().setHash("/somethingInvalid");
							}
						});
					},

					iReloadMyAppWithTheRememberedId : function () {
						this.waitFor({
							success: function () {
								this.iTeardownMyAppFrame();
							}
						});

						return this.waitFor({
							success: function() {
								this.iStartTheApp("#/object/" + encodeURIComponent(this.getContext().currentId));
							}
						});
					}
				},
				assertions: {
					iShouldSeeTheHashForObjectN : function (iObjIndex) {
						return this.waitFor(this.createAWaitForAnEntitySet({
							entitySet : "Objects",
							success : function (aEntitySet) {
								var oHashChanger = Opa5.getHashChanger(),
									sHash = oHashChanger.getHash();
								QUnit.strictEqual(sHash, "object/" + aEntitySet[iObjIndex].ObjectID, "The Hash is not correct");
							}
						}));
					},

					iShouldSeeTheHashForTheRememberedObject : function () {
						return this.waitFor({
							success : function () {
								var sObjectId = this.getContext().currentListItem.getBindingContext().getProperty("ObjectID"),
									oHashChanger = Opa5.getHashChanger(),
									sHash = oHashChanger.getHash();

								QUnit.strictEqual(sHash, "object/" + sObjectId, "The Hash is not correct");
							}
						});
					},

					iShouldSeeAnEmptyHash : function () {
						return this.waitFor({
							success : function () {
								var oHashChanger = Opa5.getHashChanger(),
									sHash = oHashChanger.getHash();
								QUnit.strictEqual(sHash, "", "The Hash should be empty");
							},
							errorMessage : "The Hash is not Correct!"
						});
					}
				}
			}
		});
	});
