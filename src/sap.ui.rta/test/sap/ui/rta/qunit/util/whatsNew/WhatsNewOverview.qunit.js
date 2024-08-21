/* global QUnit */

sap.ui.define([
	"sap/ui/rta/util/whatsNew/WhatsNewOverview",
	"sap/ui/rta/util/whatsNew/whatsNewContent/whatsNewFeatures",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/thirdparty/sinon-4"
], function(
	WhatsNewOverview,
	WhatsNewFeatures,
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
			featureId: "multipleElements",
			title: "Multiple Elements",
			description: "this is a test description",
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
				this.oWhatsNewOverviewDialog.getContent()[0].getItems()[0].getTitle(),
				aFeatureCollection[0].title,
				"the text is correct and the first feature that is visible in the dialog is the last feature from the features"
			);
			assert.strictEqual(
				this.oWhatsNewOverviewDialog.getContent()[0].getItems()[0].getDescription(),
				aFeatureCollection[0].description,
				"the description is correct"
			);
			assert.strictEqual(
				this.oWhatsNewOverviewDialog.getContent()[0].getItems()[1].getTitle(),
				aFeatureCollection[1].title,
				"the text is correct"
			);
			assert.strictEqual(
				this.oWhatsNewOverviewDialog.getContent()[0].getItems()[1].getDescription(),
				"",
				"no description is set"
			);
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});