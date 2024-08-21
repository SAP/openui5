/* global QUnit */

sap.ui.define([
	"sap/m/library",
	"sap/ui/core/Element",
	"sap/ui/fl/registry/Settings",
	"sap/ui/fl/write/api/FeaturesAPI",
	"sap/ui/rta/util/whatsNew/whatsNewContent/WhatsNewFeatures",
	"sap/ui/rta/util/whatsNew/WhatsNewUtils",
	"sap/ui/rta/util/whatsNew/WhatsNew",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/thirdparty/sinon-4"
], function(
	mLibrary,
	Element,
	Settings,
	FeaturesAPI,
	WhatsNewFeatures,
	WhatsNewUtils,
	WhatsNew,
	nextUIUpdate,
	sinon
) {
	"use strict";

	const sandbox = sinon.createSandbox();
	const aFeatureIdList = WhatsNewFeatures.getAllFeatures().map((oFeature) => oFeature.featureId);
	const aFeatureCollection = [
		{
			featureId: "onlyText",
			title: "Shows Only Text",
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
			featureId: "onlyImage",
			title: "Shows Only Image",
			information: [{
				text: null,
				image: "/resources/sap/ui/rta/util/whatsNew/whatsNewContent/whatsNewImages/WhatsNewFeatureImg.png"
			}]
		},
		{
			featureId: "text&Image",
			title: "Shows Text and Image",
			information: [
				{
					text: "Image and Text",
					image: "/resources/sap/ui/rta/util/whatsNew/whatsNewContent/whatsNewImages/WhatsNewFeatureImg.png"
				}
			]
		},
		{
			featureId: "twoText1Img",
			title: "Two text 1 img",
			information: [
				{
					text: "Two text 1 img",
					image: null
				},
				{
					text: "Two text 1 img",
					image: "/resources/sap/ui/rta/util/whatsNew/whatsNewContent/whatsNewImages/WhatsNewFeatureImg.png"
				}
			]
		}
	];

	function getPageTitle() {
		return Element.getElementById(this.oCarousel.getActivePage()).getContent()[0].getItems()[0];
	}

	function getPageContentContainer(oPageContentContainerIndex) {
		return Element.getElementById(this.oCarousel.getActivePage())
		.getContent()[0]
		.getItems()[1]
		.getContent()
		.getContent()[0]
		.getItems()[oPageContentContainerIndex || 0];
	}

	QUnit.module("What's New Dialog Carousel Functionality", {
		before() {
			this.oWhatsNew = new WhatsNew({ layer: "CUSTOMER" });
		},
		async beforeEach() {
			this.oFeaturesStub = sandbox.stub(WhatsNewFeatures, "filterDontShowAgainFeatures").returns(aFeatureCollection);
			await this.oWhatsNew.initializeWhatsNewDialog();
			this.oWhatsNewDialog = Element.getElementById("sapUiRtaWhatsNewDialog");
			await nextUIUpdate();
			[this.oCarousel] = this.oWhatsNewDialog.getContent();
			this.oRedirectStub = sandbox.stub(mLibrary.URLHelper, "redirect");
		},
		afterEach() {
			this.oWhatsNew.closeWhatsNewDialog();
			sandbox.restore();
		},
		after() {
			this.oWhatsNew.destroy();
		}
	}, function() {
		QUnit.test("When the Dialog is opened", function(assert) {
			assert.ok(this.oWhatsNewDialog.isOpen());
			const oModel = this.oWhatsNewDialog.getModel("whatsNewModel");
			const aFeatures = oModel.getProperty("/featureCollection");
			const oDontShowAgainCheckbox = Element.getElementById("whatsNewDialog_DontShowAgain");
			assert.notOk(oDontShowAgainCheckbox.getSelected(), "the checkbox is not selected");
			assert.strictEqual(aFeatures.length, 4, "all features with the overview are loaded");
			assert.strictEqual(this.oCarousel.getPages().length, 4, "all pages are created in the carousel");
		});

		QUnit.test("When only text should be visible", function(assert) {
			const oFirstPage = Element.getElementById("sapWhatsNewDialogCarousel").getPages()[0];
			assert.strictEqual(this.oCarousel.getActivePage(), oFirstPage.getId(), "first page is shown");
			const oPageTitle = getPageTitle.call(this);
			const [oPageText, oPageImage, oPageGrid] = getPageContentContainer.call(this).getItems();
			assert.strictEqual(oPageTitle.getText(), aFeatureCollection[0].title, "the title is set correctly");
			assert.strictEqual(oPageText.getHtmlText(), aFeatureCollection[0].information[0].text, "the text is visible");
			assert.notOk(oPageImage.getVisible(), "the image is not visible");
			assert.notOk(oPageGrid.getVisible(), "the grid is not visible");
		});

		QUnit.test("When only a image should be visible", function(assert) {
			const oSecondPage = Element.getElementById("sapWhatsNewDialogCarousel").getPages()[1];
			this.oCarousel.next();
			assert.strictEqual(this.oCarousel.getActivePage(), oSecondPage.getId(), "next page is shown");
			const oPageTitle = getPageTitle.call(this);
			const [oPageText, oPageImage, oPageGrid] = getPageContentContainer.call(this).getItems();
			assert.strictEqual(oPageTitle.getText(), aFeatureCollection[1].title, "the title is set correctly");
			assert.notOk(oPageText.getVisible(), "the text element is not visible");
			assert.ok(oPageImage.getVisible(), "the image is visible");
			assert.notOk(oPageGrid.getVisible(), "the grid is not visible");
		});

		QUnit.test("When the text & image should be visible", function(assert) {
			const oThirdPage = Element.getElementById("sapWhatsNewDialogCarousel").getPages()[2];
			this.oCarousel.next();
			assert.strictEqual(this.oCarousel.getActivePage(), oThirdPage.getId(), "next page is shown");
			const oPageTitle = getPageTitle.call(this);
			const [oPageText, oPageImage, oPageGrid] = getPageContentContainer.call(this).getItems();
			assert.strictEqual(oPageTitle.getText(), aFeatureCollection[2].title, "the correct title is set correctly");
			assert.notOk(oPageText.getVisible(), "the title is set correctly");
			assert.notOk(oPageImage.getVisible(), "the image is visible");
			assert.ok(oPageGrid.getVisible(), "the grid is visible");
		});

		QUnit.test("When multiple elements should be displayed on the page", function(assert) {
			const oFourthPage = Element.getElementById("sapWhatsNewDialogCarousel").getPages()[3];
			this.oCarousel.next();
			assert.strictEqual(this.oCarousel.getActivePage(), oFourthPage.getId(), "next page is shown");
			const oPageTitle = getPageTitle.call(this);
			const [oPageText, oPageImage, oPageGrid] = getPageContentContainer.call(this).getItems();
			const [oPageText2, oPageImage2, oPageGrid2] = getPageContentContainer.call(this, 1).getItems();
			assert.strictEqual(oPageTitle.getText(), aFeatureCollection[3].title, "the title is set correctly");
			assert.ok(oPageText.getVisible(), "the title is set correctly");
			assert.notOk(oPageImage.getVisible(), "the image element is not visible");
			assert.notOk(oPageGrid.getVisible(), "the grid element is not visible");
			assert.notOk(oPageText2.getVisible(), "the title is set correctly");
			assert.notOk(oPageImage2.getVisible(), "the image is visible");
			assert.ok(oPageGrid2.getVisible(), "the grid is visible");
		});

		QUnit.test("Open S4Hana Learn more Link", async function(assert) {
			const oFirstPage = Element.getElementById("sapWhatsNewDialogCarousel").getPages()[0];
			this.oCarousel.setActivePage(oFirstPage.getId());
			await nextUIUpdate();
			const oGetLearnMoreURLSpy = sandbox.spy(WhatsNewUtils, "getLearnMoreURL");
			const oS4HanaSettings = {
				isAtoEnabled: () => true,
				getSystem: () => "test"
			};
			sandbox.stub(Settings, "getInstanceOrUndef").returns(oS4HanaSettings);
			const oLearnMoreButton = Element.getElementById("sapUiRtaWhatsNewDialog_LearnMore");
			oLearnMoreButton.firePress();
			await nextUIUpdate();
			assert.ok(
				oGetLearnMoreURLSpy.returned(aFeatureCollection[0].documentationUrls.s4HanaCloudUrl),
				"Then correct URL was returned"
			);
			assert.strictEqual(
				this.oRedirectStub.lastCall.args[0], aFeatureCollection[0].documentationUrls.s4HanaCloudUrl,
				"The correct URL was passed to the URL Helper"
			);
		});

		QUnit.test("Open BTP Learn more Link", async function(assert) {
			const oFirstPage = Element.getElementById("sapWhatsNewDialogCarousel").getPages()[0];
			this.oCarousel.setActivePage(oFirstPage.getId());
			const oGetLearnMoreURLSpy = sandbox.spy(WhatsNewUtils, "getLearnMoreURL");
			const oBTPSettings = {
				isAtoEnabled: () => undefined,
				getSystem: () => undefined
			};
			sandbox.stub(Settings, "getInstanceOrUndef").returns(oBTPSettings);
			const oLearnMoreButton = Element.getElementById("sapUiRtaWhatsNewDialog_LearnMore");
			oLearnMoreButton.firePress();
			await nextUIUpdate();
			assert.ok(oGetLearnMoreURLSpy.returned(aFeatureCollection[0].documentationUrls.btpUrl), "Then correct URL was returned");
			assert.strictEqual(
				this.oRedirectStub.lastCall.args[0], aFeatureCollection[0].documentationUrls.btpUrl,
				"The correct URL was passed to the URL Helper"
			);
		});

		QUnit.test("Open ABAP on-Premise Learn more Link", async function(assert) {
			const sLearnMoreUrl = aFeatureCollection[0].documentationUrls.s4HanaOnPremUrl;
			const oFirstPage = Element.getElementById("sapWhatsNewDialogCarousel").getPages()[0];
			this.oCarousel.setActivePage(oFirstPage.getId());
			const oGetLearnMoreURLSpy = sandbox.spy(WhatsNewUtils, "getLearnMoreURL");
			const oOnPremSettings = {
				isAtoEnabled: () => false,
				getSystem: () => "test"
			};
			sandbox.stub(Settings, "getInstanceOrUndef").returns(oOnPremSettings);
			const oLearnMoreButton = Element.getElementById("sapUiRtaWhatsNewDialog_LearnMore");
			oLearnMoreButton.firePress();
			await nextUIUpdate();
			assert.ok(oGetLearnMoreURLSpy.returned(sLearnMoreUrl), "Then correct URL was returned");
			assert.strictEqual(
				this.oRedirectStub.lastCall.args[0], sLearnMoreUrl,
				"The correct URL was passed to the URL Helper"
			);
		});
	});

	QUnit.module("Basic What's New Dialog Functionality", {
		afterEach() {
			sandbox.restore();
			this.oWhatsNew.destroy();
		}
	}, function() {
		QUnit.test("When the Dialog is opened with the wrong layer", async function(assert) {
			this.oWhatsNew = new WhatsNew({ layer: "DEVELOPER" });
			await this.oWhatsNew.initializeWhatsNewDialog();
			this.oWhatsNewDialog = Element.getElementById("sapUiRtaWhatsNewDialog");
			await nextUIUpdate();
			assert.notOk(this.oWhatsNewDialog, "then the dialog is not opened");
		});

		QUnit.test("When all features have been seen", async function(assert) {
			sandbox.stub(FeaturesAPI, "getSeenFeatureIds").resolves(aFeatureIdList);
			this.oWhatsNew = new WhatsNew({ layer: "CUSTOMER" });
			await this.oWhatsNew.initializeWhatsNewDialog();
			this.oWhatsNewDialog = Element.getElementById("sapUiRtaWhatsNewDialog");
			await nextUIUpdate();
			assert.notOk(this.oWhatsNewDialog, "then the dialog is not opened");
		});

		QUnit.test("When the don't show again checkbox is checked", async function(assert) {
			const sLayer = "CUSTOMER";
			const oSetSeenFeatureIdsSpy = sandbox.spy(FeaturesAPI, "setSeenFeatureIds");
			this.oWhatsNew = new WhatsNew({ layer: sLayer });
			await this.oWhatsNew.initializeWhatsNewDialog();
			this.oWhatsNewDialog = Element.getElementById("sapUiRtaWhatsNewDialog");
			await nextUIUpdate();
			assert.ok(this.oWhatsNewDialog.isOpen(), "then the dialog is opened");
			const oDontShowAgainCheckbox = Element.getElementById("whatsNewDialog_DontShowAgain");
			oDontShowAgainCheckbox.setSelected(true);
			this.oWhatsNew.closeWhatsNewDialog();
			await nextUIUpdate();
			assert.ok(oSetSeenFeatureIdsSpy.calledOnce, "then the setSeenFeatureIds function is called");
			assert.ok(
				oSetSeenFeatureIdsSpy.calledWith({seenFeatureIds: aFeatureIdList, layer: sLayer}),
				"then the setSeenFeatureIds function is called with the correct parameters"
			);
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});