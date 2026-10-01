/* global sinon, QUnit */

sap.ui.define([
	"sap/ui/test/Opa5",
	"./arrangements/Startup",
	"sap/ui/test/opaQunit",
	"./DownloadJourney",
	"./NavigationJourney",
	"./SampleJourney",
	"./SchemaVersionJourney",
	"./TopicJourney"
], function (Opa5, Startup) {
	"use strict";

	const URL = "https://raw.githubusercontent.com/SAP/ui5-manifest/main/mapping.json";
	const fnOriginalFetch = window.fetch.bind(window);

	const oFetchStub = sinon.stub(window, "fetch", function (sUrl) {
		if (sUrl === URL) {
			return Promise.resolve({
				json: function () {
					return Promise.resolve({
						latest: "1.99.0"
					});
				}
			});
		}
		return fnOriginalFetch.apply(window, arguments);
	});

	QUnit.done(function () {
		oFetchStub.restore();
	});

	Opa5.extendConfig({
		arrangements: new Startup(),
		viewNamespace: "sap.ui.demo.cardExplorer.view.",
		autoWait: true
	});
});
