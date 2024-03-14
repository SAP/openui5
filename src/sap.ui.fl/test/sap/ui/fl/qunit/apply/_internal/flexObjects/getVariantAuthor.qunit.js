/* global QUnit */

sap.ui.define([
	"sap/ui/core/Lib",
	"sap/ui/fl/apply/_internal/flexObjects/FlexObjectFactory",
	"sap/ui/fl/apply/_internal/flexObjects/getVariantAuthor",
	"sap/ui/fl/registry/Settings",
	"sap/ui/fl/Layer",
	"sap/ui/thirdparty/sinon-4"
], function(
	Lib,
	FlexObjectFactory,
	getVariantAuthor,
	Settings,
	Layer,
	sinon
) {
	"use strict";
	const sandbox = sinon.createSandbox();

	const sYou = Lib.getResourceBundleFor("sap.ui.fl").getText("VARIANT_SELF_OWNER_NAME");
	QUnit.module("get variant authors", {
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("get variant authors", function(assert) {
			sandbox.stub(Settings, "getInstanceOrUndef").returns({
				getUserId() { return "userA";}
			});
			assert.equal(getVariantAuthor("userB", Layer.USER, {}), sYou, "user variant always has You as author");
			assert.equal(getVariantAuthor("userA", Layer.PUBLIC, {}), sYou, "public variant of same user has You as author");
			assert.equal(getVariantAuthor("vendorA", Layer.VENDOR, {}), "vendorA", "vendor variant has support user as author");
			assert.equal(getVariantAuthor("userC", Layer.CUSTOMER, {}), "userC", "customer variant has support user as author when no author name provided");
			assert.equal(getVariantAuthor("userD", Layer.PUBLIC, {userD: "Name of user D"}), "Name of user D", "public variant has user name as author when user name provided");
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});