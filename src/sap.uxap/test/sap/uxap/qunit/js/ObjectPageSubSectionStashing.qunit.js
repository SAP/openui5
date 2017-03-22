(function (QUnit, sinon, core, controller, xmlview) {
	sap.ui.require(["jquery.sap.global",
		"sap/ui/core/StashedControlSupport",
		"sap/uxap/ObjectPageLazyLoader"
	], function (jQuery, StashedSupport, ObjectPageLazyLoader) {

		jQuery.sap.registerModulePath("view", "./view");
		jQuery.sap.registerModulePath("sap.uxap.testblocks", "./blocks");

		controller("viewController", {});

		QUnit.module("Stashing Tests", {
			beforeEach: function () {
				this.objectPageSampleView = xmlview("UxAP-12-ObjectPageSubSectionStashing", {
					viewName: "view.UxAP-12-ObjectPageSubSectionStashing"
				});

				this.objectPageSampleView.placeAt('qunit-fixture');
				sap.ui.getCore().applyChanges();
			},
			afterEach: function () {
				this.objectPageSampleView.destroy();
			}
		});

		QUnit.test("ObjectPageSubSection stashing", function (assert) {
			var oTestedSection = this.objectPageSampleView.byId("subsection10"),
				oLazyLoaderSpy = sinon.spy(ObjectPageLazyLoader.prototype, "destroy"),
				oLazyLoaderRemoveAllContentSpy = sinon.spy(ObjectPageLazyLoader.prototype, "removeAllContent"),
				aStashedControls = StashedSupport.getStashedControls(oTestedSection.getId()),
				stashedObjects = 3;

			assert.ok(oTestedSection.getBlocks(), "There are no blocks in the section");
			assert.equal(aStashedControls.length, stashedObjects, "Blocks are stashed");

			oTestedSection.connectToModels();

			assert.equal(oTestedSection.getBlocks().length, stashedObjects, "Blocks successfully unstashed");
			assert.equal(StashedSupport.getStashedControls(oTestedSection.getId()).length, 0, "There are no blocks left to unstash");

			oTestedSection.getBlocks().forEach(function (oContent) {
				assert.ok(oContent instanceof sap.m.Toolbar, "The correct content is inside the blocks aggregation");
			});

			assert.equal(oLazyLoaderRemoveAllContentSpy.callCount, stashedObjects,
				"Remove all content from the LazyLoader so it can be properly destroyed.");

			assert.equal(oLazyLoaderSpy.callCount, stashedObjects, "LazyLoaders are properly disposed of");
		});
	});

}(QUnit, sinon, sap.ui.getCore(), sap.ui.controller, sap.ui.xmlview));
