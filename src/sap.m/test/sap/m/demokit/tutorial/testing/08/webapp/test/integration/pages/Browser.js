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
					iRestartTheAppWithTheRememberedItem: function (oOptions) {
						this.waitFor({
							success: function () {
								this.iTeardownMyAppFrame();
							}
						});

						return this.waitFor({
							success: function () {
								var sObjectId = this.getContext().currentItem.getBindingContext().getProperty("PostID");
								oOptions.hash = "Posts/" + encodeURIComponent(sObjectId);
								this.iStartMyApp(oOptions);
							}
						});
					}
				},
				assertions: {}
			}
		});
	});
