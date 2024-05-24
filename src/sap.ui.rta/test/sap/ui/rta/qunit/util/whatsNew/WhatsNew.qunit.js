/* global QUnit */

sap.ui.define([
	"sap/ui/core/Element",
	"sap/ui/core/Lib",
	"sap/ui/rta/util/whatsNew/whatsNewContent/whatsNewFeatures",
	"sap/ui/rta/util/whatsNew/WhatsNew",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/thirdparty/sinon-4"
], function(
	Element,
	Lib,
	WhatsNewFeatures,
	WhatsNew,
	nextUIUpdate,
	sinon
) {
	"use strict";

	const sandbox = sinon.createSandbox();
	const aFeatureCollection = [
		{
			featureId: "onlyText",
			title: "Shows Only Text",
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

	QUnit.module("Basic What's New Dialog Functionality", {
		async beforeEach() {
			this.oFeaturesStub = sandbox.stub(WhatsNewFeatures, "filterDontShowAgainFeatures").returns(aFeatureCollection);
			this.oWhatsNewDialog = await WhatsNew.openWhatsNewDialog();
			await nextUIUpdate();
			[this.oCarousel] = this.oWhatsNewDialog.getContent();
		},
		afterEach() {
			WhatsNew.closeWhatsNewDialog();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("When the Dialog is opened", function(assert) {
			assert.ok(this.oWhatsNewDialog.isOpen());
			const oModel = this.oWhatsNewDialog.getModel("whatsNewModel");
			const aFeatures = oModel.getProperty("/featureCollection");
			const oDontShowAgainCheckbox = Element.getElementById("whatsNewDialog_DontShowAgain");
			assert.notOk(oDontShowAgainCheckbox.getSelected(), "the checkbox is not selected");
			assert.strictEqual(aFeatures.length, 5, "all features with the overview are loaded");
			assert.strictEqual(this.oCarousel.getPages().length, 5, "all pages are created in the carousel");
		});

		QUnit.test("When the overview page is visible", function(assert) {
			const _oTextResources = Lib.getResourceBundleFor("sap.ui.rta");
			assert.strictEqual(this.oCarousel.getActivePage(), "whatsNewPage-sapWhatsNewDialogCarousel-0", "the overview page is shown");
			const oOverview = Element.getElementById("whatsNewDialogOverview-sapWhatsNewDialogCarousel-0");
			const oOverviewTitle = oOverview.getItems()[0].getText();
			assert.strictEqual(oOverviewTitle, _oTextResources.getText("TIT_WHATS_NEW_DIALOG_OVERVIEW"), "the title is set correctly");
			const oOverviewList = oOverview.getItems()[1];
			assert.strictEqual(oOverviewList.getContent().getItems().length, 4, "all features are listed in the overview");
		});

		QUnit.test("When only text should be visible", function(assert) {
			this.oCarousel.next();
			assert.strictEqual(this.oCarousel.getActivePage(), "whatsNewPage-sapWhatsNewDialogCarousel-1", "next page is shown");
			const oPageTitle = Element.getElementById(this.oCarousel.getActivePage()).getContent()[1].getItems()[0];
			const oPageText = Element.getElementById("whatsNewDialogText-__vbox1-sapWhatsNewDialogCarousel-1-0");
			const oPageImage = Element.getElementById("whatsNewDialogImage-__vbox1-sapWhatsNewDialogCarousel-1-0");
			const oPageWhatsNewDialogGrid = Element.getElementById("whatsNewDialogGrid-__vbox1-sapWhatsNewDialogCarousel-1-0");
			assert.strictEqual(oPageTitle.getText(), aFeatureCollection[0].title, "the title is set correctly");
			assert.strictEqual(oPageText.getText(), aFeatureCollection[0].information[0].text, "the text is visible");
			assert.notOk(oPageImage.getVisible(), "the image is not visible");
			assert.notOk(oPageWhatsNewDialogGrid.getVisible(), "the grid is not visible");
		});

		QUnit.test("When only a image should be visible", function(assert) {
			this.oCarousel.next();
			assert.strictEqual(this.oCarousel.getActivePage(), "whatsNewPage-sapWhatsNewDialogCarousel-2", "next page is shown");
			const oPageTitle = Element.getElementById(this.oCarousel.getActivePage()).getContent()[1].getItems()[0];
			const oPageText = Element.getElementById("whatsNewDialogText-__vbox1-sapWhatsNewDialogCarousel-2-0");
			const oPageImage = Element.getElementById("whatsNewDialogImage-__vbox1-sapWhatsNewDialogCarousel-2-0");
			const oPageWhatsNewDialogGrid = Element.getElementById("whatsNewDialogGrid-__vbox1-sapWhatsNewDialogCarousel-2-0");
			assert.strictEqual(oPageTitle.getText(), aFeatureCollection[1].title, "the title is set correctly");
			assert.notOk(oPageText.getVisible(), "the text element is not visible");
			assert.ok(oPageImage.getVisible(), "the image is visible");
			assert.notOk(oPageWhatsNewDialogGrid.getVisible(), "the grid is not visible");
		});

		QUnit.test("When the text & image should be visible", function(assert) {
			this.oCarousel.next();
			assert.strictEqual(this.oCarousel.getActivePage(), "whatsNewPage-sapWhatsNewDialogCarousel-3", "next page is shown");
			const oPageTitle = Element.getElementById(this.oCarousel.getActivePage()).getContent()[1].getItems()[0];
			const oPageText = Element.getElementById("whatsNewDialogText-__vbox1-sapWhatsNewDialogCarousel-3-0");
			const oPageImage = Element.getElementById("whatsNewDialogImage-__vbox1-sapWhatsNewDialogCarousel-3-0");
			const oPageWhatsNewDialogGrid = Element.getElementById("whatsNewDialogGrid-__vbox1-sapWhatsNewDialogCarousel-3-0");
			assert.strictEqual(oPageTitle.getText(), aFeatureCollection[2].title, "the correct title is set correctly");
			assert.notOk(oPageText.getVisible(), "the title is set correctly");
			assert.notOk(oPageImage.getVisible(), "the image is visible");
			assert.ok(oPageWhatsNewDialogGrid.getVisible(), "the grid is visible");
		});

		QUnit.test("When multiple elements should be displayed on the page", function(assert) {
			this.oCarousel.next();
			assert.strictEqual(this.oCarousel.getActivePage(), "whatsNewPage-sapWhatsNewDialogCarousel-4", "next page is shown");
			const oPageTitle = Element.getElementById(this.oCarousel.getActivePage()).getContent()[1].getItems()[0];
			const oPageText = Element.getElementById("whatsNewDialogText-__vbox1-sapWhatsNewDialogCarousel-4-0");
			const oPageImage = Element.getElementById("whatsNewDialogImage-__vbox1-sapWhatsNewDialogCarousel-4-0");
			const oPageWhatsNewDialogGrid = Element.getElementById("whatsNewDialogGrid-__vbox1-sapWhatsNewDialogCarousel-4-0");
			const oPageText2 = Element.getElementById("whatsNewDialogText-__vbox1-sapWhatsNewDialogCarousel-4-1");
			const oPageImage2 = Element.getElementById("whatsNewDialogImage-__vbox1-sapWhatsNewDialogCarousel-4-1");
			const oPageWhatsNewDialogGrid2 = Element.getElementById("whatsNewDialogGrid-__vbox1-sapWhatsNewDialogCarousel-4-1");
			assert.strictEqual(oPageTitle.getText(), aFeatureCollection[3].title, "the title is set correctly");
			assert.ok(oPageText.getVisible(), "the title is set correctly");
			assert.notOk(oPageImage.getVisible(), "the image element is not visible");
			assert.notOk(oPageWhatsNewDialogGrid.getVisible(), "the grid element is not visible");
			assert.notOk(oPageText2.getVisible(), "the title is set correctly");
			assert.notOk(oPageImage2.getVisible(), "the image is visible");
			assert.ok(oPageWhatsNewDialogGrid2.getVisible(), "the grid is visible");
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});