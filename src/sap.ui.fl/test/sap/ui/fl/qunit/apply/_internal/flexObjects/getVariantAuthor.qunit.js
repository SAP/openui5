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
		QUnit.test("Given comp variants", function(assert) {
			sandbox.stub(Settings, "getInstanceOrUndef").returns({
				getUserId() { return "userA";}
			});
			const oUserVariant = FlexObjectFactory.createCompVariant({
				layer: Layer.USER,
				fileName: "id1",
				support: {
					user: "userB"
				}
			});
			assert.equal(getVariantAuthor(oUserVariant, {}), sYou, "user variant always has You as author");

			const oPublicVariantOfSameUser = FlexObjectFactory.createCompVariant({
				layer: Layer.PUBLIC,
				fileName: "id2",
				support: {
					user: "userA"
				}
			});
			assert.equal(getVariantAuthor(oPublicVariantOfSameUser, {}), sYou, "public variant of same user has You as author");

			const oVendorVariant = FlexObjectFactory.createCompVariant({
				layer: Layer.VENDOR,
				fileName: "id3",
				support: {
					user: "vendorA"
				}
			});
			assert.equal(getVariantAuthor(oVendorVariant, {}), "vendorA", "vendor variant has support user as author");

			const oCustomerVariantWithNoAuthorName = FlexObjectFactory.createCompVariant({
				layer: Layer.CUSTOMER,
				fileName: "id4",
				support: {
					user: "userC"
				}
			});
			assert.equal(getVariantAuthor(oCustomerVariantWithNoAuthorName, {}), "userC", "customer variant has support user as author when no author name provided");

			const oPublicVariantWithAuthorName = FlexObjectFactory.createCompVariant({
				layer: Layer.PUBLIC,
				fileName: "id5",
				support: {
					user: "userD"
				}
			});
			assert.equal(getVariantAuthor(oPublicVariantWithAuthorName, {userD: "Name of user D"}), "Name of user D", "public variant has user name as author when user name provided");
		});

		QUnit.test("Given fl variants", function(assert) {
			sandbox.stub(Settings, "getInstanceOrUndef").returns({
				getUserId() { return "userA";}
			});
			const oUserVariant = FlexObjectFactory.createFlVariant({
				layer: Layer.USER,
				fileName: "id1",
				user: "userB"
			});
			assert.equal(getVariantAuthor(oUserVariant, {}), sYou, "user variant always has You as author");

			const oPublicVariantOfSameUser = FlexObjectFactory.createFlVariant({
				layer: Layer.PUBLIC,
				fileName: "id2",
				user: "userA"
			});
			assert.equal(getVariantAuthor(oPublicVariantOfSameUser, {}), sYou, "public variant of same user has You as author");

			const oVendorVariant = FlexObjectFactory.createFlVariant({
				layer: Layer.VENDOR,
				fileName: "id3",
				user: "vendorA"
			});
			assert.equal(getVariantAuthor(oVendorVariant, {}), "vendorA", "vendor variant has support user as author");

			const oCustomerVariantWithNoAuthorName = FlexObjectFactory.createFlVariant({
				layer: Layer.CUSTOMER,
				fileName: "id4",
				user: "userC"
			});
			assert.equal(getVariantAuthor(oCustomerVariantWithNoAuthorName, {}), "userC", "customer variant has support user as author when no author name provided");

			const oPublicVariantWithAuthorName = FlexObjectFactory.createFlVariant({
				layer: Layer.PUBLIC,
				fileName: "id5",
				user: "userD"
			});
			assert.equal(getVariantAuthor(oPublicVariantWithAuthorName, {userD: "Name of user D"}), "Name of user D", "public variant has user name as author when user name provided");
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});