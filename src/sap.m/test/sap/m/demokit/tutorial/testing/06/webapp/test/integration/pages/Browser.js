sap.ui.require([
		'sap/ui/test/Opa5',
		'sap/ui/demo/bulletinboard/test/integration/pages/Common'
	],
	function (Opa5, Common) {
		"use strict";

		Opa5.createPageObjects({
			onTheBrowser: {
				baseClass: Common,
				actions: {
					iPressOnTheBackwardsButton: function () {
						return this.waitFor({
							success: function () {
								// manipulate history directly for testing purposes
								Opa5.getWindow().history.back();
							}
						});
					},

					iPressOnTheForwardsButton: function () {
						return this.waitFor({
							success: function () {
								// manipulate history directly for testing purposes
								Opa5.getWindow().history.forward();
							}
						});
					},

					iChangeTheHashToTheRememberedItem: function () {
						return this.waitFor({
							success: function () {
								var sObjectId = this.getContext().currentItem.getBindingContext().getProperty("PostID");
								Opa5.getHashChanger().setHash("/Posts/" + sObjectId);
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
							success: function () {
								var sObjectId = this.getContext().currentItem.getBindingContext().getProperty("PostID");
								oOptions.hash = "/Posts/" + encodeURIComponent(sObjectId);
								this.iStartMyApp(oOptions);
							}
						});
					}
				},
				assertions: {}
			}
		});
	});
