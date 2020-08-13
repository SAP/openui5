/*global QUnit, sinon*/

sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/mvc/XMLView",
	"sap/ui/core/Core",
	"sap/ui/core/StashedControlSupport",
	"sap/uxap/ObjectPageLazyLoader"],
function (controller, XMLView, Core, StashedSupport, ObjectPageLazyLoader) {
	"use strict";

	controller.create({ name: "viewController" });

	QUnit.module("Stashing Tests", {
		beforeEach: function (assert) {
			var done = assert.async();
			XMLView.create({
				id: "UxAP-12-ObjectPageSubSectionStashing",
				viewName: "view.UxAP-12-ObjectPageSubSectionStashing"
			}).then(function (oView) {
				this.objectPageSampleView = oView;
				this.objectPageSampleView.placeAt('qunit-fixture');
				Core.applyChanges();
				done();
			}.bind(this));
		},
		afterEach: function () {
			this.objectPageSampleView.destroy();
		}
	});

	QUnit.test("ObjectPageSubSection stashing", function (assert) {
		var oTestedSection = this.objectPageSampleView.byId("subsection10"),
			oDestroySpy = sinon.spy(ObjectPageLazyLoader.prototype, "destroy"),
			oLazyLoaderRemoveAllContentSpy = sinon.spy(ObjectPageLazyLoader.prototype, "removeAllContent"),
			stashedObjects = 3;

		var aBlocks = oTestedSection.getBlocks();

		assert.equal(aBlocks.length, 0, "There are no blocks in the section");

		oTestedSection.connectToModels();

		assert.equal(oTestedSection.getBlocks().length, stashedObjects, "Blocks successfully unstashed");
		assert.equal(StashedSupport.getStashedControls(oTestedSection.getId()).length, 0, "There are no blocks left to unstash");

		oTestedSection.getBlocks().forEach(function (oContent) {
			assert.ok(oContent.isA("sap.m.Toolbar"), "The correct content is inside the blocks aggregation");
		});

		assert.equal(oLazyLoaderRemoveAllContentSpy.callCount, stashedObjects,
			"Remove all content from the LazyLoader so it can be properly destroyed.");

		// destroy is called once from <code>sap.ui.core.StashedControlSupport</code> after unstashing,
		// and then a second time from <code>sap.uxap.ObjectPageSubSection</code> after emptying the unstashed content
		assert.equal(oDestroySpy.callCount, stashedObjects * 2, "LazyLoaders are properly disposed of");
	});

});
