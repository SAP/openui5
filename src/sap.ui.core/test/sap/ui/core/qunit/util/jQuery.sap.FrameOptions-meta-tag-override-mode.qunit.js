/* global QUnit */

sap.ui.define(["sap/ui/security/Security"], function(Security) {
	"use strict";

	QUnit.test("Configuration should respect <meta> tag to fill 'allowlistService' but not override 'frameOptions'", function(assert) {
		assert.equal(Security.getAllowlistService(), "/url/to/service/via/meta/tag", "Allowlist Service should be set from <meta> tag.");
		assert.equal(Security.getFrameOptions(), "deny", "Frame Options should be set to 'deny' from UI5 config.");
	});
});
