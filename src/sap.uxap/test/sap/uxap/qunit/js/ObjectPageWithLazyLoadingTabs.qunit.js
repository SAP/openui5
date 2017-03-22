(function (jQuery, QUnit, sinon, core, controller, xmlview, JSONModel) {
	jQuery.sap.registerModulePath("view", "view");
	jQuery.sap.registerModulePath("sap.uxap.testblocks", "./blocks");

	var oController = controller("viewController", {});

	sinon.config.useFakeTimers = true;

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
			}
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
			})
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
				fnAssertTabLoaded(assert, oSection, iIndex, aExpectedTabIndicedToBeLoaded.indexOf(iIndex) >= 0)
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

	var iLoadingDelay = 2500;
	var oConfigModel = new JSONModel();
	oConfigModel.loadData("model/OPLazyLoadingWithTabs.json", {}, false);

	var oView = xmlview("UxAP-27_ObjectPageConfig", {
		viewName: "view.UxAP-27_ObjectPageConfig",
		controller: oController
	});

	oView.setModel(oConfigModel, "objectPageLayoutMetadata");
	oView.placeAt("qunit-fixture");
	core.applyChanges();

	QUnit.module("ObjectPage with tabs - lazy loading");

	QUnit.test("laoding only the selected section/tab", function (assert) {
		var oObjectPageLayout = oView.byId("objectPageContainer").getObjectPageLayoutInstance(),
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
	});

}(jQuery, QUnit, sinon, sap.ui.getCore(), sap.ui.controller, sap.ui.xmlview, sap.ui.model.json.JSONModel));
