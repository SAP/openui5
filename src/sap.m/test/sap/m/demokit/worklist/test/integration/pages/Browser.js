sap.ui.require([
		"sap/ui/test/Opa5",
		"sap/ui/demo/worklist/test/integration/pages/Common"
	],
	function(Opa5, Common) {
		"use strict";

		Opa5.createPageObjects({
			onTheBrowser: {
				baseClass: Common,
				actions: {
					iPressOnTheBackwardsButton : function () {
						return this.waitFor({
							success : function () {
								// manipulate history directly for testing purposes
								Opa5.getWindow().history.back();
							}
						});
					},

					iPressOnTheForwardsButton : function () {
						return this.waitFor({
							success : function () {
								// manipulate history directly for testing purposes
								Opa5.getWindow().history.forward();
							}
						});
					},

					iChangeTheHashToSomethingInvalid : function () {
						return this.waitFor({
							success : function () {
								Opa5.getWindow().location.hash = "#/somethingInvalid";
							}
						});
					},

					iChangeTheHashToTheRememberedItem : function () {
						return this.waitFor({
							success: function () {
								var sObjectId = this.getContext().currentItem.getBindingContext().getProperty("ObjectID");
								Opa5.getHashChanger().setHash("/object/" + sObjectId);
							}
						});
					},

					iRestartTheAppWithTheRememberedItem: function (oOptions) {
						this.waitFor({
							success: function () {
								this.iTeardownMyAppFrame();
							}
						});

						return this.waitFor({
							success: function() {
								var sObjectId = this.getContext().currentItem.getBindingContext().getProperty("ObjectID");
								oOptions.hash = "/object/" + encodeURIComponent(sObjectId);
								this.iStartMyApp(oOptions);
							}
						});
					}
				},
				assertions: {}
			}
		});
	});
