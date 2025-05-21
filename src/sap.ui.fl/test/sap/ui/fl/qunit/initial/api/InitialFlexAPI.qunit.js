/* global QUnit */

sap.ui.define([
	"sap/ui/fl/initial/_internal/FlexInfoSession",
	"sap/ui/fl/initial/api/InitialFlexAPI",
	"sap/ui/fl/initial/_internal/Settings",
	"sap/ui/thirdparty/sinon-4"
], (
	FlexInfoSession,
	InitialFlexAPI,
	Settings,
	sinon
) => {
	"use strict";
	const sandbox = sinon.createSandbox();
	const sReference = "test.app";

	QUnit.module("InitialFlexAPI", {
		afterEach() {
			sandbox.restore();
			FlexInfoSession.removeByReference(sReference);
		}
	}, function() {
		QUnit.test("isKeyUser", function(assert) {
			sandbox.stub(Settings, "getInstance").resolves({
				getIsKeyUser: () => true
			});
			const bIsKeyUser = InitialFlexAPI.isKeyUser();
			assert.ok(bIsKeyUser, "the user is a key user");
		});

		QUnit.test("getFlexVersion - flex info session exists with version", function(assert) {
			FlexInfoSession.setByReference({version: "1"}, sReference);
			assert.equal(InitialFlexAPI.getFlexVersion({reference: sReference}), "1", "version exists");
		});

		QUnit.test("getFlexVersion - no flex info session exists", function(assert) {
			FlexInfoSession.removeByReference(sReference);
			assert.equal(InitialFlexAPI.getFlexVersion({reference: sReference}), undefined, "version doesn't exists");
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});