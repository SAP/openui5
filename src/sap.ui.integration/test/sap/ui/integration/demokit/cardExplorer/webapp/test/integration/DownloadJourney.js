/*global QUnit*/

sap.ui.define([
	"sap/ui/test/opaQunit",
	"sap/ui/demo/cardExplorer/controller/ExploreSamples.controller",
	"./pages/NavigationList",
	"./pages/ExploreSamples"
], function (opaTest, ExploreSamplesController) {
	"use strict";

	QUnit.module("Download Samples");

	opaTest("Should be able to download manifest file.", function (Given, When, Then) {
		Given.iStartMyApp({ hash: "explore/list"});

		When.onTheExploreSamplesPage.iPressDownload("Manifest File");

		Then.onTheExploreSamplesPage.iShouldHaveFile();
	});

	opaTest("Should be able to download manifest file.", function (Given, When, Then) {
		var sNewValue = JSON.stringify({
			"sap.card": {
				"type": "Table"
			}
		}, null, "\t");

		When.onTheExploreSamplesPage
			.iChangeFileEditorValue(sNewValue)
			.and.iPressDownload("Manifest File");

		Then.onTheExploreSamplesPage.iShouldHaveFile(sNewValue);
	});

	opaTest("Should be able to download files as zip.", function (Given, When, Then) {

		var oSample = ExploreSamplesController.prototype._findSample.call(null, "htmlConsumption"),
			aFiles = oSample.files,
			aFileNames = aFiles.map(function (oFile) { return oFile.name; });

		When.onTheNavigationList.iSwitchToSample("htmlConsumption");
		When.onTheExploreSamplesPage.iPressDownload("Bundle as card.zip");

		Then.onTheExploreSamplesPage
			.iShouldHaveZip(aFileNames)
			.and.iTeardownMyApp();
	});
});
