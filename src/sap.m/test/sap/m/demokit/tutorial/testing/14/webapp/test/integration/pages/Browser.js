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
					iPressOnTheForwardButton: function () {
						return this.waitFor({
							success: function () {
								Opa5.getWindow().history.forward();
							}
						});
					},
				},
				assertions: {}
			}
		});
	});
