/*global QUnit, sinon*/

sap.ui.define([
	"sap/ui/core/mvc/XMLView",
	"sap/ui/core/StashedControlSupport",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/uxap/ObjectPageLazyLoader"
],
function(XMLView, StashedSupport, nextUIUpdate, ObjectPageLazyLoader) {
	"use strict";

	QUnit.module("Stashing Tests", {
		beforeEach: function (assert) {
			var done = assert.async();
			XMLView.create({
				id: "UxAP-12-ObjectPageSubSectionStashing",
				viewName: "view.UxAP-12-ObjectPageSubSectionStashing"
			}).then(async function(oView) {
				this.objectPageSampleView = oView;
				this.objectPageSampleView.placeAt('qunit-fixture');
				await nextUIUpdate();
				done();
			}.bind(this));
		},
		afterEach: function () {
			this.objectPageSampleView.destroy();
		}
	});

	QUnit.test("ObjectPageSubSection stashing", async function (assert) {
		var oTestedSection = this.objectPageSampleView.byId("subsection10"),
			oDestroySpy = sinon.spy(ObjectPageLazyLoader.prototype, "destroy"),
			oLazyLoaderRemoveAllContentSpy = sinon.spy(ObjectPageLazyLoader.prototype, "removeAllContent"),
			stashedObjects = 3;

		var aBlocks = oTestedSection.getBlocks();

		assert.equal(aBlocks.length, 0, "There are no blocks in the section");

		await oTestedSection.connectToModelsAsync();

		assert.equal(oTestedSection.getBlocks().length, stashedObjects, "Blocks successfully unstashed");
		assert.equal(StashedSupport.getStashedControls(oTestedSection.getId()).length, 0, "There are no blocks left to unstash");

		oTestedSection.getBlocks().forEach(function (oContent) {
			assert.ok(oContent.isA("sap.m.Toolbar"), "The correct content is inside the blocks aggregation");
		});

		assert.equal(oLazyLoaderRemoveAllContentSpy.callCount, stashedObjects,
			"Remove all content from the LazyLoader so it can be properly destroyed.");

		// destroy is called once from <code>sap.ui.core.StashedControlSupport</code> after unstashing,
		// and then a second time from <code>sap.uxap.ObjectPageSubSection</code> after emptying the unstashed content
		assert.equal(oDestroySpy.callCount, stashedObjects, "LazyLoaders are properly disposed of");
	});

	QUnit.test("ObjectPageSubSection async unstashing does not throw an error if a control is already unstashed", async function (assert) {
		var oTestedSection = this.objectPageSampleView.byId("subsection10"),
			oStashedControl = oTestedSection._aStashedControls[0].control;

		this.stub(oStashedControl, "isStashed").returns(false);

		// Act
		await oTestedSection.connectToModelsAsync();

		// Assert
		assert.ok(true, "No error is thrown");
	});

	QUnit.module("Stashing optimization", {
		beforeEach: function (assert) {
			var done = assert.async();
			XMLView.create({
				id: "UxAP-12-ObjectPageSubSectionStashing-Optimization",
				viewName: "view.UxAP-12-ObjectPageSubSectionStashing-Optimization"
			}).then(async function(oView) {
				this.objectPageSampleView = oView;
				this.objectPageSampleView.placeAt('qunit-fixture');
				await nextUIUpdate();
				done();
			}.bind(this));
		},
		afterEach: function () {
			this.objectPageSampleView.destroy();
		}
	});

	QUnit.test("ObjectPageSubSection unstashing improved", function (assert) {
		// Arrange
		var oOpl = this.objectPageSampleView.byId("ObjectPageLayout"),
			oSection1 = this.objectPageSampleView.byId("subsection1"),
			oSection2 = this.objectPageSampleView.byId("subsection2"),
			oSection4 = this.objectPageSampleView.byId("subsection4"),
			fnDone = assert.async();

		assert.expect(6);

		oOpl.attachEventOnce("onAfterRenderingDOMReady", function () {
			// Assert
			assert.strictEqual(oSection1._aStashedControls.length, 0, "First SubSection is unstashed");
			assert.ok(!oSection1.$().hasClass("sapUxAPObjectPageSubSectionStashed"), "sapUxAPObjectPageSubSectionStashed class is not added to first SubSection");
			assert.strictEqual(oSection2._aStashedControls.length, 0, "Second SubSection is unstashed");
			assert.ok(!oSection2.$().hasClass("sapUxAPObjectPageSubSectionStashed"), "sapUxAPObjectPageSubSectionStashed class is not added to second SubSection");
			assert.strictEqual(oSection4._aStashedControls.length, 1, "Forth SubSection is not unstashed after optimization");
			assert.ok(oSection4.$().hasClass("sapUxAPObjectPageSubSectionStashed"), "sapUxAPObjectPageSubSectionStashed class is added to forth SubSection");

			// Clean up
			fnDone();
		});
	});

});
