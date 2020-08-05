/* global QUnit */

sap.ui.define([], function() {
	"use strict";

	QUnit.test("Configuration should respect <meta> tag to fill 'whitelistService' and 'frameOptions'", function(assert) {
		var oConfiguration = sap.ui.getCore().getConfiguration();
		assert.equal(oConfiguration.getWhitelistService(), "/url/to/service/via/meta/tag", "Whitelist Service should be set from <meta> tag.");
		assert.equal(oConfiguration.getFrameOptions(), "trusted", "Frame Options should default to 'trusted'.");
	});
});
