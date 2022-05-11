/*global QUnit */
sap.ui.define([
	'sap/ui/core/Core'
], function(Core) {
	"use strict";

	var bAsync = sap.ui.loader.config().async;
	var bPreloadEnabled = window["sap-ui-optimized"] && Core.getConfiguration().getDebug() !== true;

	QUnit.test("Preload Configuration", function(assert) {
		var sPreloadConfig = Core.getConfiguration().getPreload();
		var sExpectedPreloadConfig;
		if (!bPreloadEnabled) {
			sExpectedPreloadConfig = "";
		} else {
			sExpectedPreloadConfig = bAsync ? "async" : "sync";
		}
		assert.equal(sPreloadConfig, sExpectedPreloadConfig, "Preload config should be '" + sExpectedPreloadConfig + "'");
	});

});
