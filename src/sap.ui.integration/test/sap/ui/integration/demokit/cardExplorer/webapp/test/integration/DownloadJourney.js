/*global QUnit*/

sap.ui.define([
	"sap/ui/test/opaQunit",
	"sap/ui/demo/cardExplorer/model/ExploreNavigationModel",
	"./pages/NavigationList",
	"./pages/Explore"
], function (opaTest, ExploreNavigationModel) {
	"use strict";

	var PATH_TO_HTML_CONSUMPTION_SAMPLE = "/navigation/1/items/6/files";

	QUnit.module("Home");

	opaTest("Should be able to download manifest file.", function (Given, When, Then) {
		Given.iStartMyApp({ hash: "explore/list"});

		When.onTheExplorePage.iPressDownload("Manifest File");

		Then.onTheExplorePage.iShouldHaveFile();
	});

	opaTest("Should be able to download manifest file.", function (Given, When, Then) {
		var sNewValue = JSON.stringify({
			"sap.card": {
				"type": "Table",
				"header": {},
				"content": {}
			}
		}, null, "\t");

		When.onTheExplorePage
			.iChangeCodeEditorValue(sNewValue)
			.and.iPressDownload("Manifest File");

		Then.onTheExplorePage.iShouldHaveFile(sNewValue);
	});

	opaTest("Should be able to download files as zip.", function (Given, When, Then) {

		var aFiles = ExploreNavigationModel.getProperty(PATH_TO_HTML_CONSUMPTION_SAMPLE),
			aFileNames = aFiles.map(function (oFile) { return oFile.name; });

		When.onTheNavigationList.iSwitchToSample("htmlConsumption");
		When.onTheExplorePage.iPressDownload("Bundle as .zip");

		Then.onTheExplorePage
			.iShouldHaveZip(aFileNames)
			.and.iTeardownMyApp();
	});
});
