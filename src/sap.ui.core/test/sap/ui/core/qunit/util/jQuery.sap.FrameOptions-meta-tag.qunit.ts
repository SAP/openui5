QUnit.test("Configuration should respect <meta> tag to fill 'allowlistService' and 'frameOptions'", function (assert) {
    var oConfiguration = sap.ui.getCore().getConfiguration();
    assert.equal(oConfiguration.getAllowlistService(), "/url/to/service/via/meta/tag", "Allowlist Service should be set from <meta> tag.");
    assert.equal(oConfiguration.getFrameOptions(), "trusted", "Frame Options should default to 'trusted'.");
});