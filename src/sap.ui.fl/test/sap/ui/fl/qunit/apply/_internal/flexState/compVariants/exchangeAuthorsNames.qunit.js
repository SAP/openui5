/* global QUnit */

sap.ui.define([
	"sap/ui/core/Lib",
	"sap/ui/fl/apply/_internal/flexObjects/FlexObjectFactory",
	"sap/ui/fl/apply/_internal/flexState/compVariants/exchangeAuthorsNames",
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/registry/Settings",
	"sap/ui/fl/Layer",
	"sap/ui/thirdparty/sinon-4"
], function(
	Lib,
	FlexObjectFactory,
	exchangeAuthorsNames,
	FlexState,
	Settings,
	Layer,
	sinon
) {
	"use strict";
	const sandbox = sinon.createSandbox();
	const oControl = {
		updateAuthors() {
		}
	};
	const sYou = Lib.getResourceBundleFor("sap.ui.fl").getText("VARIANT_SELF_OWNER_NAME");
	QUnit.module("exchange authors names", {
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when variant author feature is not available", function(assert) {
			sandbox.stub(Settings, "getInstance").resolves({
				isVariantAuthorNameAvailable() {return false;},
				getUserId() { return "userA";}
			});
			const aVariants = [
				FlexObjectFactory.createCompVariant({
					layer: Layer.USER,
					fileName: "id1"
				}),
				FlexObjectFactory.createCompVariant({
					layer: Layer.PUBLIC,
					fileName: "id2",
					support: {
						user: "userA"
					}
				}),
				FlexObjectFactory.createCompVariant({
					layer: Layer.CUSTOMER,
					fileName: "id3",
					support: {
						user: "userB"
					}
				})
			];
			const oSpyLoadVariantsAuthor = sandbox.spy(FlexState, "getVariantsAuthorsNames");
			const oStubUpdateAuthors = sandbox.stub(oControl, "updateAuthors").returns();
			return exchangeAuthorsNames(oControl, aVariants).then(function() {
				assert.notOk(oSpyLoadVariantsAuthor.calledOnce, "getVariantsAuthorsNames is not called");
				assert.equal(aVariants[0].getAuthor(), sYou, "author of USER variant is correct");
				assert.equal(aVariants[1].getAuthor(), sYou, "author of PUBLIC variant is correct");
				assert.equal(aVariants[2].getAuthor(), "userB", "author of CUSTOMER variant is correct");
				assert.ok(oStubUpdateAuthors.calledOnce, "control update author callback is trigger");
			});
		});

		QUnit.test("when variant author feature is true and no public or keyuser variant available", function(assert) {
			sandbox.stub(Settings, "getInstance").resolves({
				isVariantAuthorNameAvailable() {return true;},
				getUserId() { return "userA";}
			});
			const aVariants = [
				FlexObjectFactory.createCompVariant({
					layer: Layer.USER,
					fileName: "id1"
				})
			];
			const oSpyLoadVariantsAuthor = sandbox.spy(FlexState, "getVariantsAuthorsNames");
			const oStubUpdateAuthors = sandbox.stub(oControl, "updateAuthors").returns();
			return exchangeAuthorsNames(oControl, aVariants).then(function() {
				assert.notOk(oSpyLoadVariantsAuthor.calledOnce, "getVariantsAuthorsNames is not called");
				assert.equal(aVariants[0].getAuthor(), sYou, "author of USER variant is correct");
				assert.ok(oStubUpdateAuthors.calledOnce, "control update author callback is trigger");
			});
		});

		QUnit.test("when variant author feature is available and public or keyuser variants available", function(assert) {
			sandbox.stub(Settings, "getInstance").resolves({
				isVariantAuthorNameAvailable() {return true;},
				getUserId() { return "userB";}
			});
			const aVariants = [
				FlexObjectFactory.createCompVariant({
					layer: Layer.USER,
					fileName: "id1"
				}),
				FlexObjectFactory.createCompVariant({
					layer: Layer.PUBLIC,
					fileName: "id2",
					support: {
						user: "userA"
					}
				}),
				FlexObjectFactory.createCompVariant({
					layer: Layer.CUSTOMER,
					fileName: "id3",
					support: {
						user: "userB"
					}
				}),
				FlexObjectFactory.createCompVariant({
					layer: Layer.CUSTOMER_BASE,
					fileName: "id4",
					support: {
						user: "userB"
					}
				})
			];

			const oStubUpdateAuthors = sandbox.stub(oControl, "updateAuthors").returns();
			const oStubLoadVariantsAuthor = sandbox.stub(FlexState, "getVariantsAuthorsNames").resolves(
				{
					userA: "nameA",
					userB: "nameB"
				}
			);
			return exchangeAuthorsNames(oControl, aVariants).then(function() {
				assert.ok(oStubLoadVariantsAuthor.calledOnce, "getVariantsAuthorsNames is called");
				assert.equal(aVariants[0].getAuthor(), sYou, "author of USER variant is correct");
				assert.equal(aVariants[1].getAuthor(), "nameA", "author of PUBLIC variant is correct");
				assert.equal(aVariants[2].getAuthor(), sYou, "author of CUSTOMER variant is correct");
				assert.equal(aVariants[3].getAuthor(), sYou, "author of CUSTOMER variant is correct");
				assert.equal(oStubUpdateAuthors.getCall(0).args[0].length, 4, "control update author callback is trigger with correct number of variants");
			});
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});