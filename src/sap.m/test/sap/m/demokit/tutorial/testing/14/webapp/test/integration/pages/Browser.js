sap.ui.define([
	'sap/ui/test/Opa5'
], function (Opa5) {
	"use strict";

		Opa5.createPageObjects({
			onTheBrowser: {
				actions: {
					iPressOnTheForwardButton: function () {
						return this.waitFor({
							success: function () {
								Opa5.getWindow().history.forward();
							}
						});
					}
				},
				assertions: {}
			}
		});
	});
