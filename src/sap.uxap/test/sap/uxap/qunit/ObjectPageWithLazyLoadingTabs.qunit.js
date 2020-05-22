/*global QUnit, sinon*/

sap.ui.define([
	"sap/ui/core/Core",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/mvc/XMLView"],
function (Core, JSONModel, XMLView) {
	"use strict";

	// global vars
	var	oConfigModel = new JSONModel(),
		oConfigModelNoTitles = new JSONModel(),
		iLoadingDelay = 2500;

	oConfigModel.loadData("test-resources/sap/uxap/qunit/model/OPLazyLoadingWithTabs.json", {}, false);
	oConfigModelNoTitles.loadData("test-resources/sap/uxap/qunit/model/OPLazyLoadingWithTabsNoTitles.json", {}, false);

	// utility function that will be used in these tests
	var fnGetOneBlock = function () {
			return {
				Type: "sap.uxap.testblocks.employmentblockjob.EmploymentBlockJob",
				mappings: [{
					"externalModelName": "objectPageData",
					"externalPath": "/Employee/0",
					"internalModelName": "emp1"
				}, {
					"externalModelName": "objectPageData",
					"externalPath": "/Employee/1",
					"internalModelName": "emp2"
				}, {
					"externalModelName": "objectPageData",
					"externalPath": "/Employee/2",
					"internalModelName": "emp3"
				}, {
					"externalModelName": "objectPageData",
					"externalPath": "/Employee/3",
					"internalModelName": "emp4"
				}, {
					"externalModelName": "objectPageData",
					"externalPath": "/Employee/4",
					"internalModelName": "emp5"
				}, {
					"externalModelName": "objectPageData",
					"externalPath": "/Employee/5",
					"internalModelName": "emp6"
				}]
			};
		},
		fnLoadMoreBlocks = function (oData) {
			oData.sections.forEach(function (oSection, iIndexSection) {
				oSection.subSections.forEach(function (oSubSection) {
					oSubSection.blocks = [fnGetOneBlock()];
					if (iIndexSection <= 4) {
						oSubSection.mode = "Collapsed";
						oSubSection.moreBlocks = [fnGetOneBlock()];
					}
				});
			});
		},
		fnBlockIsConnected = function (oBlock) {
			return !!oBlock._bConnected;
		},
		fnSubSectionIsloaded = function (oSubSection) {
			return oSubSection.getBlocks().every(fnBlockIsConnected);
		},
		fnSectionIsLoaded = function (oSection) {
			return oSection.getSubSections().every(fnSubSectionIsloaded);
		},
		fnAssertTabLoaded = function (assert, oSection, iIndex, bExpectLoaded) {
			var sMessage = "Section/tab [" + (iIndex + 1) + "]";
			if (bExpectLoaded) {
				assert.ok(fnSectionIsLoaded(oSection), sMessage + " loaded");
			} else {
				assert.ok(!fnSectionIsLoaded(oSection), sMessage + " not loaded");
			}
		},
		fnAssertTabsAreLoaded = function (assert, aSections, aExpectedTabIndicedToBeLoaded) {
			aSections.forEach(function (oSection, iIndex) {
				fnAssertTabLoaded(assert, oSection, iIndex, aExpectedTabIndicedToBeLoaded.indexOf(iIndex) >= 0);
			});
		},
		fnTestSection = function (oObjectPageLayout, iIndex, aLoadedSections, assert, testContext) {
			var aSections = oObjectPageLayout.getSections();
			oObjectPageLayout.scrollToSection(aSections[iIndex].getId());
			aLoadedSections.push(iIndex);
			Core.applyChanges();
			testContext.clock.tick(iLoadingDelay);
			fnAssertTabsAreLoaded(assert, aSections, aLoadedSections);
		};


	QUnit.module("ObjectPage with tabs - lazy loading", {
		beforeEach: function (assert) {
			var done = assert.async();
			this.clock = sinon.useFakeTimers();
			XMLView.create({
				id: "UxAP-27_ObjectPageConfig",
				viewName: "view.UxAP-27_ObjectPageConfig"
			}).then(function (oView) {
				this.oView = oView;
				this.oView.setModel(oConfigModel, "objectPageLayoutMetadata");
				this.oView.placeAt("qunit-fixture");
				Core.applyChanges();
				done();
			}.bind(this));
		},
		afterEach: function () {
			this.oView.destroy();
			this.clock.restore();
		}
	});

	QUnit.test("loading the selected section/tab", function (assert) {
		var oObjectPageLayout = this.oView.byId("objectPageContainer").getObjectPageLayoutInstance(),
			oData = oConfigModel.getData(),
			aSections = oObjectPageLayout.getSections(),
			aLoadedSections = [0];

		fnLoadMoreBlocks(oData);
		oConfigModel.setData(oData);

		Core.applyChanges();
		this.clock.tick(iLoadingDelay);

		// Expect the first section to be loaded by default
		fnAssertTabsAreLoaded(assert, aSections, aLoadedSections);

		// expect each section to load when selected
		for (var i = 1; i < aSections.length; i++) {
			fnTestSection(oObjectPageLayout, i, aLoadedSections, assert, this);
		}

		// cleanup
		oObjectPageLayout.destroy();
	});

	QUnit.test("loading only the selected section/tab", function (assert) {
		var oObjectPageLayout = this.oView.byId("objectPageContainer").getObjectPageLayoutInstance(),
			oData = oConfigModel.getData(),
			aSections = oObjectPageLayout.getSections();

		fnLoadMoreBlocks(oData);
		oConfigModel.setData(oData);

		Core.applyChanges();
		this.clock.tick(iLoadingDelay);

		// load some tab > bottom subSection
		var targetSubSection = aSections[2].getSubSections()[1],
			precedingSubSection = aSections[2].getSubSections()[0];
		oObjectPageLayout.scrollToSection(targetSubSection.getId(), 0);
		Core.applyChanges();
		this.clock.tick(iLoadingDelay);
		assert.ok(fnSubSectionIsloaded(targetSubSection), "target subsection is loaded");
		assert.ok(!fnSubSectionIsloaded(precedingSubSection), "preceding subsection is not loaded");

		// load next tab > top subSection
		targetSubSection = aSections[3].getSubSections()[0];
		oObjectPageLayout.scrollToSection(targetSubSection.getId(), 0);
		Core.applyChanges();
		this.clock.tick(iLoadingDelay);
		assert.ok(fnSubSectionIsloaded(targetSubSection),"target subsection is loaded");
		assert.ok(!fnSubSectionIsloaded(precedingSubSection), "preceding subsection is still not loaded");
	});

	QUnit.test("loading in IconTab mode", function (assert) {
		// Arrange
		var oObjectPageLayout = this.oView.byId("objectPageContainer").getObjectPageLayoutInstance(),
			oData = oConfigModelNoTitles.getData(),
			aSections = oObjectPageLayout.getSections(),
			oTargetSection;

		fnLoadMoreBlocks(oData);
		oConfigModel.setData(oData);

		Core.applyChanges();
		this.clock.tick(iLoadingDelay);

		// Act
		oTargetSection = aSections[6];
		oObjectPageLayout.scrollToSection(oTargetSection.getId(), 0, undefined, true); // Simulate click on IconTabBar
		Core.applyChanges();
		this.clock.tick(iLoadingDelay);

		// Assert
		assert.ok(fnSubSectionIsloaded(oTargetSection.getSubSections()[0]),"target subsection is loaded");
		assert.ok(oObjectPageLayout._grepCurrentTabSectionBases().length === 2, "Section and SubSection are returned");

		// Cleanup
		oObjectPageLayout.destroy();
	});
});