/* global QUnit */

sap.ui.define(["sap/ui/security/Security"], function(Security) {
	"use strict";

	QUnit.test("Configuration should respect <meta> tag to fill 'allowlistService' and 'frameOptions'", function(assert) {
		assert.equal(Security.getAllowlistService(), "/url/to/service/via/meta/tag", "Allowlist Service should be set from <meta> tag.");
		assert.equal(Security.getFrameOptions(), "trusted", "Frame Options should default to 'trusted'.");
	});
});
