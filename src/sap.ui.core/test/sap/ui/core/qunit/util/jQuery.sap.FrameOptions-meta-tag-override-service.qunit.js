/* global QUnit */

sap.ui.define([], function() {
	"use strict";
	QUnit.test("Configuration should not override 'allowlistService' and 'frameOptions' from <meta> tag", function(assert) {
		var oConfiguration = sap.ui.getCore().getConfiguration();
		assert.equal(oConfiguration.getAllowlistService(), "/url/to/service/via/ui5/config", "Allowlist Service should be set from UI5 config.");
		assert.equal(oConfiguration.getFrameOptions(), "allow", "Frame Options should be set to 'allow' (default value from UI5 config).");
	});
});
