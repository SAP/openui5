/*global QUnit */
sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/opaQunit",
	"sap/ui/thirdparty/sinon"
], function (Opa5, opaTest, sinon) {
	"use strict";

	var EMPTY_SITE_URL = "test-resources/sap/ui/core/qunit/opa/fixture/emptySiteWithOpaExtensions.html";

	QUnit.module("Extensions");

	QUnit.test("Should load and call assertion from sample extension", function (assert) {
		var done = assert.async(),
		oOpa5 = new Opa5();

		var extensionLoadSpy = sinon.spy(Opa5.prototype, '_loadExtensions');
		var extensionUnloadSpy = sinon.spy(Opa5.prototype, '_unloadExtensions');
		oOpa5.extendConfig({
			extensions: ["testResources/sap/ui/core/qunit/opa/opaExtensions/SampleOpaExtension"]
		});

		oOpa5.iStartMyAppInAFrame(EMPTY_SITE_URL);
		oOpa5.waitFor({
			success: function () {
				sinon.assert.called(extensionLoadSpy);
				QUnit.assert.myCustomAssertion();
			}
		});

		oOpa5.iTeardownMyApp();
		oOpa5.waitFor({
			success: function() {
				sinon.assert.called(extensionUnloadSpy);
			}
		});

		Opa5.emptyQueue().done(done);
	});

});
