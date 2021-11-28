/* global QUnit */

sap.ui.define([
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/fl/Layer",
	"sap/ui/fl/write/api/TranslationAPI",
	"sap/ui/fl/initial/_internal/connectors/Utils",
	"sap/ui/fl/apply/_internal/flexState/ManifestUtils",
	"sap/ui/fl/Utils",
	"sap/ui/core/Core"
], function(
	sinon,
	Layer,
	TranslationAPI,
	InitialConnector,
	ManifestUtils,
	FlUtils,
	oCore
) {
	"use strict";

	var sandbox = sinon.createSandbox();
	QUnit.module("TranslationAPI rejects", {
		before: function() {
			this.vSelector = {
				elementId: "selector",
				elementType: "sap.ui.core.Control"
			};
		},
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("When getTexts is triggered, with missing source language", function (assert) {
			var mPropertyBag = {
				targetLanguage: "de-DE",
				selector: this.vSelector,
				appComponent: "reference",
				layer: Layer.CUSTOMER
			};
			return TranslationAPI.getTexts(mPropertyBag).catch(function (sRejectionMessage) {
				assert.equal(sRejectionMessage, "No sourceLanguage was provided", "then the rejection message is passed");
			});
		});

		QUnit.test("When getTexts is triggered, with missing target language", function (assert) {
			var mPropertyBag = {
				sourceLanguage: "en-US",
				selector: this.vSelector,
				appComponent: "reference",
				layer: Layer.CUSTOMER
			};
			return TranslationAPI.getTexts(mPropertyBag).catch(function (sRejectionMessage) {
				assert.equal(sRejectionMessage, "No targetLanguage was provided", "then the rejection message is passed");
			});
		});

		QUnit.test("Wwhen getTexts is triggered, with missing selector", function (assert) {
			var mPropertyBag = {
				reference: "reference",
				layer: Layer.CUSTOMER
			};
			return TranslationAPI.getSourceLanguages(mPropertyBag).catch(function (sRejectionMessage) {
				assert.equal(sRejectionMessage, "No selector was provided", "then the rejection message is passed");
			});
		});

		QUnit.test("When getTexts is triggered, with missing selector", function (assert) {
			var mPropertyBag = {
				reference: "reference",
				layer: Layer.CUSTOMER
			};
			return TranslationAPI.getSourceLanguages(mPropertyBag).catch(function (sRejectionMessage) {
				assert.equal(sRejectionMessage, "No selector was provided", "then the rejection message is passed");
			});
		});

		QUnit.test("When getTexts is triggered, with missing layer", function (assert) {
			var mPropertyBag = {
				sourceLanguage: "en-US",
				selector: this.vSelector,
				appComponent: "reference"
			};
			return TranslationAPI.getSourceLanguages(mPropertyBag).catch(function (sRejectionMessage) {
				assert.equal(sRejectionMessage, "No layer was provided", "then the rejection message is passed");
			});
		});
	});

	QUnit.module("TranslationAPI", {
		before: function () {
			this.oAppComponent = {
				getManifest: function () {
					return {};
				},
				getId: function () {
					return "sComponentId";
				},
				getComponentData: function () {
					return {};
				}
			};
			this.vSelector = {
				elementId: "selector",
				elementType: "sap.ui.core.Control"
			};
		},
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("given a mock server, when getSourceLanguage is triggered", function (assert) {
			var mPropertyBag = {
				selector: this.vSelector,
				layer: Layer.CUSTOMER
			};

			var aReturnedLanguages = [
				"en-US",
				"de-DE"
			];
			sandbox.stub(oCore.getConfiguration(), "getFlexibilityServices").returns([
				{connector: "KeyUserConnector", layers: [Layer.CUSTOMER], url: "/flexKeyUser"}
			]);

			var sUrl = "/flexKeyUser/flex/keyuser/v1/translation/sourcelanguages/reference";
			var oStubSendRequest = sandbox.stub(InitialConnector, "sendRequest").resolves({response: aReturnedLanguages});
			sandbox.stub(FlUtils, "getAppComponentForControl").returns(this.oAppComponent);
			sandbox.stub(ManifestUtils, "getFlexReferenceForControl").returns("reference");

			return TranslationAPI.getSourceLanguages(mPropertyBag).then(function (oResponse) {
				assert.deepEqual(oResponse, [
					"en-US",
					"de-DE"
				], "the languages are returned correctly");
				assert.equal(oStubSendRequest.getCall(0).args[0], sUrl, "the request has the correct url");
				assert.equal(oStubSendRequest.getCall(0).args[1], "GET", "the method is correct");
				assert.deepEqual(oStubSendRequest.getCall(0).args[2], mPropertyBag, "the propertyBag is passed correct");
			});
		});

		QUnit.test("given a mock server, when getTexts is triggered", function (assert) {
			var mPropertyBag = {
				sourceLanguage: "en-US",
				targetLanguage: "de-DE",
				selector: this.vSelector,
				layer: Layer.CUSTOMER
			};
			sandbox.stub(oCore.getConfiguration(), "getFlexibilityServices").returns([
				{connector: "KeyUserConnector", layers: [Layer.CUSTOMER], url: "/flexKeyUser"}
			]);

			var sUrl = "/flexKeyUser/flex/keyuser/v1/translation/texts/reference?sourceLanguage=en-US&targetLanguage=de-DE";
			sandbox.stub(ManifestUtils, "getFlexReferenceForControl").returns("reference");
			var oStubSendRequest = sandbox.stub(InitialConnector, "sendRequest").resolves({response: {}});
			return TranslationAPI.getTexts(mPropertyBag).then(function () {
				assert.equal(oStubSendRequest.getCall(0).args[0], sUrl, "the request has the correct url");
				assert.equal(oStubSendRequest.getCall(0).args[1], "GET", "the method is correct");
				assert.deepEqual(oStubSendRequest.getCall(0).args[2], mPropertyBag, "the propertyBag is passed correct");
			});
		});
	});
});
