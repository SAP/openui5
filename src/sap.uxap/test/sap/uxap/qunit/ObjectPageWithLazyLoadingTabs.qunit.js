/*global QUnit, sinon*/

sap.ui.define([
	"sap/ui/core/Core",
	"sap/ui/model/json/JSONModel"
],
function(Core, JSONModel) {
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
});