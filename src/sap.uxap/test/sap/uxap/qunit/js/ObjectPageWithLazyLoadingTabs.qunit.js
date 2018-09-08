/*global QUnit,sinon*/

sap.ui.require(["sap/ui/model/json/JSONModel"],
	function (JSONModel) {
	"use strict";

	var core = sap.ui.getCore(),
		controller = sap.ui.controller,
		xmlview = sap.ui.xmlview;

	sap.ui.loader.config({
		paths: {
		   "sap/uxap/testblocks": "./blocks",
		   "view": "./view"
		 }
	  });

	// global vars
	var oController = controller("viewController", {}),
		oConfigModel = new JSONModel();
		oConfigModel.loadData("model/OPLazyLoadingWithTabs.json", {}, false);

	sinon.config.useFakeTimers = true;
	var iLoadingDelay = 2500;

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
			core.applyChanges();
			testContext.clock.tick(iLoadingDelay);
			fnAssertTabsAreLoaded(assert, aSections, aLoadedSections);
		};


	QUnit.module("ObjectPage with tabs - lazy loading", {
		beforeEach: function (assert) {
			this.oView = xmlview("UxAP-27_ObjectPageConfig", {
				viewName: "view.UxAP-27_ObjectPageConfig",
				controller: oController
			});

			this.oView.setModel(oConfigModel, "objectPageLayoutMetadata");
			this.oView.placeAt("qunit-fixture");
			core.applyChanges();
		},
		afterEach: function () {
			this.oView.destroy();
		}
	});

	QUnit.test("loading the selected section/tab", function (assert) {
		var oObjectPageLayout = this.oView.byId("objectPageContainer").getObjectPageLayoutInstance(),
			oData = oConfigModel.getData(),
			aSections = oObjectPageLayout.getSections(),
			aLoadedSections = [0];

		fnLoadMoreBlocks(oData);
		oConfigModel.setData(oData);

		core.applyChanges();
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

		core.applyChanges();
		this.clock.tick(iLoadingDelay);

		// load some tab > bottom subSection
		var targetSubSection = aSections[2].getSubSections()[1],
			precedingSubSection = aSections[2].getSubSections()[0];
		oObjectPageLayout.scrollToSection(targetSubSection.getId(), 0);
		core.applyChanges();
		this.clock.tick(iLoadingDelay);
		assert.ok(fnSubSectionIsloaded(targetSubSection), "target subsection is loaded");
		assert.ok(!fnSubSectionIsloaded(precedingSubSection), "preceding subsection is not loaded");

		// load next tab > top subSection
		targetSubSection = aSections[3].getSubSections()[0];
		oObjectPageLayout.scrollToSection(targetSubSection.getId(), 0);
		core.applyChanges();
		this.clock.tick(iLoadingDelay);
		assert.ok(fnSubSectionIsloaded(targetSubSection),"target subsection is loaded");
		assert.ok(!fnSubSectionIsloaded(precedingSubSection), "preceding subsection is still not loaded");
	});
});