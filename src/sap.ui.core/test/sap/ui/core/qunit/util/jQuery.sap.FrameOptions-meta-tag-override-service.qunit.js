/* global QUnit */

sap.ui.define(["sap/ui/security/Security"], function(Security) {
	"use strict";
	QUnit.test("Configuration should not override 'allowlistService' and 'frameOptions' from <meta> tag", function(assert) {
		assert.equal(Security.getAllowlistService(), "/url/to/service/via/ui5/config", "Allowlist Service should be set from UI5 config.");
		assert.equal(Security.getFrameOptions(), "allow", "Frame Options should be set to 'allow' (default value from UI5 config).");
	});
});
