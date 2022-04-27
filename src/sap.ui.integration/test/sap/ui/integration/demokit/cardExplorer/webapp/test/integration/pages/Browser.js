sap.ui.define([
	"sap/ui/test/Opa5"
], function(Opa5) {
	"use strict";

	Opa5.createPageObjects({
		onTheBrowserPage: {
			actions: {
				iChangeTheHashTo: function (sHash) {
					return this.waitFor({
						success: function () {
							Opa5.getHashChanger().setHash(sHash);
						}
					});
				}
			}
		}
	});

});
