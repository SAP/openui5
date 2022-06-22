/* global QUnit */

sap.ui.define([
	"sap/m/App",
	"sap/ui/core/mvc/XMLView",
	"sap/ui/core/ComponentContainer",
	"sap/ui/core/Core",
	"sap/ui/core/UIComponent",
	"sap/ui/fl/apply/_internal/controlVariants/Utils",
	"sap/ui/fl/apply/_internal/flexObjects/FlexObjectFactory",
	"sap/ui/thirdparty/jquery",
	"sap/ui/thirdparty/sinon-4"
], function(
	App,
	XMLView,
	ComponentContainer,
	Core,
	UIComponent,
	VariantUtils,
	FlexObjectFactory,
	jQuery
) {
	"use strict";

	function assertVMControlFound(sLocalControlId, sLocalVMControlId, aVMControlIds, assert) {
		var oControl = Core.byId("testComponent2---mockview--" + sLocalControlId);
		assert.equal(VariantUtils.getRelevantVariantManagementControlId(oControl, aVMControlIds), "testComponent2---mockview--" + sLocalVMControlId, "the correct VM Control was found");
	}

	function assertNoVMControlFound(sLocalControlId, aVMControlIds, assert) {
		var oControl = Core.byId("testComponent2---mockview--" + sLocalControlId);
		assert.notOk(VariantUtils.getRelevantVariantManagementControlId(oControl, aVMControlIds), "no VM Control was found");
	}

	function createVariant(sTitle) {
		return {
			instance: FlexObjectFactory.createFlVariant({
				variantName: sTitle,
				reference: "myReference"
			})
		};
	}

	QUnit.module("Given VariantUtils class..", function() {
		QUnit.test("when compareVariants is called", function(assert) {
			var oVariantData1 = createVariant("TEST").instance;
			var oVariantData2 = createVariant("test").instance;
			var oVariantData3 = createVariant("test1").instance;
			var oVariantData4 = createVariant("abc").instance;

			assert.equal(VariantUtils.compareVariants(oVariantData1, oVariantData2), 0, "the function is not case sensitive");
			assert.equal(VariantUtils.compareVariants(oVariantData2, oVariantData3), -1, "the function sorts correctly");
			assert.equal(VariantUtils.compareVariants(oVariantData2, oVariantData4), 1, "the function sorts correctly");
			assert.equal(VariantUtils.compareVariants(oVariantData4, oVariantData2), -1, "the function sorts correctly");
		});

		QUnit.test("when getIndexToSortVariant is called", function(assert) {
			var oVariantData1 = createVariant("abc");
			var oVariantData2 = createVariant("myVariant");
			var oVariantData3 = createVariant("test");
			assert.equal(VariantUtils.getIndexToSortVariant([oVariantData1, oVariantData3], oVariantData2), 1, "the function returns the correct index");
			assert.equal(VariantUtils.getIndexToSortVariant([oVariantData2, oVariantData3], oVariantData1), 0, "the function returns the correct index");
			assert.equal(VariantUtils.getIndexToSortVariant([oVariantData1, oVariantData2], oVariantData3), 2, "the function returns the correct index");
		});
	});

	QUnit.module("Given a view with variant management controls", {
		before: function(assert) {
			var done = assert.async();

			jQuery.get("test-resources/sap/ui/fl/qunit/testResources/VariantManagementTestApp.view.xml", null, function(viewContent) {
				var oViewPromise;
				var MockComponent = UIComponent.extend("MockController", {
					metadata: {
						manifest: {
							"sap.app": {
								applicationVersion: {
									version: "1.2.3"
								}
							}
						}
					},
					createContent: function() {
						var oApp = new App(this.createId("mockapp"));
						oViewPromise = XMLView.create({
							id: this.createId("mockview"),
							definition: viewContent
						}).then(function(oView) {
							oApp.addPage(oView);
							return oView.loaded();
						});
						return oApp;
					}
				});
				this.oComp = new MockComponent("testComponent2");
				this.oCompContainer = new ComponentContainer("foo", {
					component: this.oComp
				}).placeAt("qunit-fixture");

				oViewPromise.then(done);
			}.bind(this));
		},
		after: function() {
			this.oComp.destroy();
			this.oCompContainer.destroy();
		}
	}, function() {
		QUnit.test("when getRelevantVariantManagementControlId / belongsToVariantManagement is called with various controls", function(assert) {
			var aVMControlIds = [
				"testComponent2---mockview--VariantManagement1",
				"testComponent2---mockview--VariantManagement2",
				"testComponent2---mockview--VariantManagement3",
				"testComponent2---mockview--VariantManagementNotAvailable"
			];
			assertVMControlFound("ObjectPageSubSection1", "VariantManagement1", aVMControlIds, assert);
			assertVMControlFound("ObjectPageSection3", "VariantManagement1", aVMControlIds, assert);
			assertVMControlFound("ObjectPageSubSection3", "VariantManagement2", aVMControlIds, assert);
			assertVMControlFound("TextTitle1", "VariantManagement2", aVMControlIds, assert);
			assertVMControlFound("hbox2InnerButton1", "VariantManagement3", aVMControlIds, assert);
			assertVMControlFound("hbox1Button1", "VariantManagement3", aVMControlIds, assert);

			assertNoVMControlFound("ObjectPageSubSection3", ["testComponent2---mockview--VariantManagement3"], assert);
			assertNoVMControlFound("ObjectPageSubSection1", ["testComponent2---mockview--VariantManagement2"], assert);
			assertNoVMControlFound("Button", aVMControlIds, assert);

			var bBelongsToVM1 = VariantUtils.belongsToVariantManagement(Core.byId("testComponent2---mockview--ObjectPageLayout"));
			var bBelongsToVM2 = VariantUtils.belongsToVariantManagement(Core.byId("testComponent2---mockview--TextTitle1"));
			var bBelongsToVM3 = VariantUtils.belongsToVariantManagement(Core.byId("testComponent2---mockview--Button"));
			assert.strictEqual(bBelongsToVM1, true, "true is returned for the first variant management control");
			assert.strictEqual(bBelongsToVM2, true, "true is returned for the second variant management control");
			assert.strictEqual(bBelongsToVM3, false, "false is returned for the control not belonging to a variant management control");
		});
	});

	QUnit.done(function() {
		jQuery("#qunit-fixture").hide();
	});
});