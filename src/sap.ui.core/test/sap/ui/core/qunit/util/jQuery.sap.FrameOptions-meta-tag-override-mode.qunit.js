/* global QUnit */

sap.ui.define([], function() {
	"use strict";

	QUnit.test("Configuration should respect <meta> tag to fill 'allowlistService' but not override 'frameOptions'", function(assert) {
		var oConfiguration = sap.ui.getCore().getConfiguration();
		assert.equal(oConfiguration.getAllowlistService(), "/url/to/service/via/meta/tag", "Allowlist Service should be set from <meta> tag.");
		assert.equal(oConfiguration.getFrameOptions(), "deny", "Frame Options should be set to 'deny' from UI5 config.");
	});
});
