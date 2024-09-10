/* global QUnit */

sap.ui.define([
	"sap/m/library",
	"sap/ui/core/Element",
	"sap/ui/fl/registry/Settings",
	"sap/ui/rta/util/whatsNew/WhatsNewOverview",
	"sap/ui/rta/util/whatsNew/whatsNewContent/WhatsNewFeatures",
	"sap/ui/rta/util/whatsNew/WhatsNewUtils",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/thirdparty/sinon-4"
], function(
	mLibrary,
	Element,
	Settings,
	WhatsNewOverview,
	WhatsNewFeatures,
	whatsNewUtils,
	nextUIUpdate,
	sinon
) {
	"use strict";

	const sandbox = sinon.createSandbox();
	const aFeatureCollection = [
		{
			featureId: "onlyText",
			title: "Shows Only Text",
			description: "this is a test description",
			documentationUrls: {
				btpUrl: "btpUrlTestString",
				s4HanaCloudUrl: "s4HanaCloudUrlTestString",
				s4HanaOnPremUrl: "s4HanaOnPremUrlTestString"
			},
			information: [{
				text: "this is a Test",
				image: null
			}]
		},
		{
			featureId: "multipleElements",
			title: "Multiple Elements",
			documentationUrls: {
				btpUrl: "btpUrlTestString",
				s4HanaCloudUrl: "s4HanaCloudUrlTestString",
				s4HanaOnPremUrl: "s4HanaOnPremUrlTestString"
			},
			information: [
				{
					text: "This is only the text",
					image: null
				},
				{
					text: "Text and image",
					image: "/resources/sap/ui/rta/util/whatsNew/whatsNewContent/whatsNewImages/WhatsNewFeatureImg.png"
				}
			]
		}
	];

	QUnit.module("Basic What's New Overview Functionality", {
		async beforeEach() {
			this.oFeaturesStub = sandbox.stub(WhatsNewFeatures, "getAllFeatures").returns(aFeatureCollection);
			this.oRedirectStub = sandbox.stub(mLibrary.URLHelper, "redirect");
			this.oWhatsNewOverviewDialog = await WhatsNewOverview.openWhatsNewOverviewDialog();
			await nextUIUpdate();
		},
		afterEach() {
			WhatsNewOverview.closeWhatsNewOverviewDialog();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("When the overview dialog is opened", function(assert) {
			assert.ok(this.oWhatsNewOverviewDialog.isOpen());
			const oModel = this.oWhatsNewOverviewDialog.getModel("whatsNewModel");
			const aFeatures = oModel.getProperty("/featureCollection");
			assert.strictEqual(aFeatures.length, 2, "all features are loaded");
			assert.ok(this.oWhatsNewOverviewDialog.getContent()[0].isActive(), "the first page is active");
			assert.strictEqual(
				this.oWhatsNewOverviewDialog.getContent()[0].getItems().length,
				2,
				"the items are set correctly"
			);
			assert.strictEqual(
				this.oWhatsNewOverviewDialog.getContent()[0].getItems()[1].getTitle(),
				aFeatureCollection[0].title,
				"the text is correct and the first feature that is visible in the dialog is the last feature from the features"
			);
			assert.strictEqual(
				this.oWhatsNewOverviewDialog.getContent()[0].getItems()[1].getDescription(),
				aFeatureCollection[0].description,
				"the description is correct"
			);
			assert.strictEqual(
				this.oWhatsNewOverviewDialog.getContent()[0].getItems()[0].getTitle(),
				aFeatureCollection[1].title,
				"the text is correct"
			);
			assert.strictEqual(
				this.oWhatsNewOverviewDialog.getContent()[0].getItems()[0].getDescription(),
				"",
				"no description is set"
			);
		});

		QUnit.test("Open S4Hana Learn more Link", async function(assert) {
			const oGetLearnMoreURLSpy = sandbox.spy(whatsNewUtils, "getLearnMoreURL");
			const oS4HanaSettings = {
				isAtoEnabled: () => true,
				getSystem: () => "test"
			};
			sandbox.stub(Settings, "getInstanceOrUndef").returns(oS4HanaSettings);
			const aOverviewListItems = Element.getElementById("whatsNewOverview").getItems();
			aOverviewListItems[0].firePress();
			await nextUIUpdate();
			const oLearnMoreButton = Element.getElementById("sapUiRtaWhatsNewOverviewDialog_LearnMore");
			oLearnMoreButton.firePress();
			await nextUIUpdate();
			assert.ok(
				oGetLearnMoreURLSpy.returned(aFeatureCollection[0].documentationUrls.s4HanaCloudUrl),
				"Then correct URL was returned"
			);
			assert.strictEqual(
				this.oRedirectStub.lastCall.args[0], aFeatureCollection[0].documentationUrls.s4HanaCloudUrl,
				"Then the correct URL was passed to the URL Helper"
			);
		});

		QUnit.test("Open BTP Learn more Link", async function(assert) {
			const oGetLearnMoreURLSpy = sandbox.spy(whatsNewUtils, "getLearnMoreURL");
			const oBTPSettings = {
				isAtoEnabled: () => undefined,
				getSystem: () => undefined
			};
			sandbox.stub(Settings, "getInstanceOrUndef").returns(oBTPSettings);
			const aOverviewListItems = Element.getElementById("whatsNewOverview").getItems();
			aOverviewListItems[0].firePress();
			await nextUIUpdate();
			const oLearnMoreButton = Element.getElementById("sapUiRtaWhatsNewOverviewDialog_LearnMore");
			oLearnMoreButton.firePress();
			await nextUIUpdate();
			assert.ok(oGetLearnMoreURLSpy.returned(aFeatureCollection[0].documentationUrls.btpUrl), "Then correct URL was returned");
			assert.strictEqual(
				this.oRedirectStub.lastCall.args[0], aFeatureCollection[0].documentationUrls.btpUrl,
				"Then the correct URL was passed to the URL Helper"
			);
		});

		QUnit.test("Open ABAP on-Premise  Learn more Link", async function(assert) {
			const sLearnMoreUrl = aFeatureCollection[0].documentationUrls.s4HanaOnPremUrl;
			const oGetLearnMoreURLSpy = sandbox.spy(whatsNewUtils, "getLearnMoreURL");
			const oOnPremSettings = {
				isAtoEnabled: () => false,
				getSystem: () => "test"
			};
			sandbox.stub(Settings, "getInstanceOrUndef").returns(oOnPremSettings);
			const aOverviewListItems = Element.getElementById("whatsNewOverview").getItems();
			aOverviewListItems[0].firePress();
			await nextUIUpdate();
			const oLearnMoreButton = Element.getElementById("sapUiRtaWhatsNewOverviewDialog_LearnMore");
			oLearnMoreButton.firePress();
			await nextUIUpdate();
			assert.ok(oGetLearnMoreURLSpy.returned(sLearnMoreUrl), "Then correct URL was returned");
			assert.strictEqual(
				this.oRedirectStub.lastCall.args[0], sLearnMoreUrl,
				"Then the correct URL was passed to the URL Helper"
			);
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});