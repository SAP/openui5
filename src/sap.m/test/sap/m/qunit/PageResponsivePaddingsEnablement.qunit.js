/*global sinon, QUnit */
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/m/Button",
	"sap/m/Page",
	"sap/m/Bar",
	"jquery.sap.global"
], function(
	qutils,
	createAndAppendDiv,
	Button,
	Page,
	Bar,
	jQuery
) {
	"use strict";
	createAndAppendDiv("content");

	QUnit.test("_initResponsivePaddingsEnablement is called on init", function (assert) {
		// Arrange
		var oSpy = sinon.spy(Page.prototype, "_initResponsivePaddingsEnablement"),
			oTestPage = new Page({}).placeAt("content");

		// Assert
		assert.strictEqual(oSpy.callCount, 1, "Method _initResponsivePaddingsEnablement called on init of control");
		assert.ok(oSpy.calledOn(oTestPage), "The spy is called on the tested control instance");

		oSpy.restore();
		oTestPage.destroy();
    });

	QUnit.test("Correct style classes are applied", function (assert) {
		// Arrange
		var oTestPage = new Page("testPage", {
			title: "Page Control",
			showNavButton: true,
			headerContent: [new Button({text:"Header Button"})],
			subHeader: [new Bar({})],
			content: [new Button({text: "Test"})],
			footer: [new Bar({
						contentLeft: [new Button({text: "Footer Left Button"})],
						contentRight: [new Button({text: "Footer Right Button"})]
					})]
		}).placeAt("content");

		this.clock = sinon.useFakeTimers();

		//Act
		oTestPage.addStyleClass("sapUiResponsivePadding--header");
		oTestPage.addStyleClass("sapUiResponsivePadding--subHeader");
		oTestPage.addStyleClass("sapUiResponsivePadding--content");
		oTestPage.addStyleClass("sapUiResponsivePadding--footer");
		sap.ui.getCore().applyChanges();

		var $page = jQuery("#testPage");
		$page.css("width", "300px");
		this.clock.tick(300);
		sap.ui.getCore().applyChanges();


		var $pageHeader = oTestPage.$().find("#testPage-intHeader"),
			$pageSubHeader = oTestPage.$().find(".sapMPageSubHeader .sapMBar"),
			$pageContent = oTestPage.$().find("#testPage-cont"),
			$pageFooter = oTestPage.$().find(".sapMPageFooter .sapMBar"),
			bIsHeaderResponsive = $pageHeader.hasClass("sapM-Std-PaddingS"),
			bIsSubHeaderResponsive = $pageContent.hasClass("sapM-Std-PaddingS"),
			bIsContentResponsive = $pageSubHeader.hasClass("sapM-Std-PaddingS"),
			bIsFooterResponsive = $pageFooter.hasClass("sapM-Std-PaddingS");


		//Assert
		assert.ok(bIsHeaderResponsive, "The sapM-Std-PaddingS class is applied to the header");
		assert.ok(bIsSubHeaderResponsive, "The sapM-Std-PaddingS class is applied to the subheader");
		assert.ok(bIsContentResponsive, "The sapM-Std-PaddingS class is applied to the content");
		assert.ok(bIsFooterResponsive, "The sapM-Std-PaddingS class is applied to the footer");

		//Act
		$page.css("width", "700px");
		this.clock.tick(300);
		sap.ui.getCore().applyChanges();

		bIsHeaderResponsive = $pageHeader.hasClass("sapM-Std-PaddingM");
		bIsSubHeaderResponsive = $pageSubHeader.hasClass("sapM-Std-PaddingM");
		bIsContentResponsive = $pageContent.hasClass("sapM-Std-PaddingM");
		bIsFooterResponsive = $pageFooter.hasClass("sapM-Std-PaddingM");

		//Assert
		assert.ok(bIsHeaderResponsive, "The sapM-Std-PaddingM class is applied to the header");
		assert.ok(bIsSubHeaderResponsive, "The sapM-Std-PaddingM class is applied to the subheader");
		assert.ok(bIsContentResponsive, "The sapM-Std-PaddingM class is applied to the content");
		assert.ok(bIsFooterResponsive, "The sapM-Std-PaddingM class is applied to the footer");

		//Act
		$page.css("width", "1300px");
		sap.ui.getCore().applyChanges();
		this.clock.tick(300);

		bIsHeaderResponsive = $pageHeader.hasClass("sapM-Std-PaddingL");
		bIsSubHeaderResponsive = $pageSubHeader.hasClass("sapM-Std-PaddingL");
		bIsContentResponsive = $pageContent.hasClass("sapM-Std-PaddingL");
		bIsFooterResponsive = $pageFooter.hasClass("sapM-Std-PaddingL");

		//Assert
		assert.ok(bIsHeaderResponsive, "The sapM-Std-PaddingL class is applied to the header");
		assert.ok(bIsSubHeaderResponsive, "The sapM-Std-PaddingL class is applied to the subheader");
		assert.ok(bIsContentResponsive, "The sapM-Std-PaddingL class is applied to the content");
		assert.ok(bIsFooterResponsive, "The sapM-Std-PaddingL class is applied to the footer");

		//Act
		$page.css("width", "1700px");
		this.clock.tick(300);
		sap.ui.getCore().applyChanges();

		bIsHeaderResponsive = $pageHeader.hasClass("sapM-Std-PaddingXL");
		bIsSubHeaderResponsive = $pageSubHeader.hasClass("sapM-Std-PaddingXL");
		bIsContentResponsive = $pageContent.hasClass("sapM-Std-PaddingXL");
		bIsFooterResponsive = $pageFooter.hasClass("sapM-Std-PaddingXL");

		//Assert
		assert.ok(bIsHeaderResponsive, "The sapM-Std-PaddingXL class is applied to the header");
		assert.ok(bIsSubHeaderResponsive, "The sapM-Std-PaddingXL class is applied to the subheader");
		assert.ok(bIsContentResponsive, "The sapM-Std-PaddingXL class is applied to the content");
		assert.ok(bIsFooterResponsive, "The sapM-Std-PaddingXL class is applied to the footer");

		oTestPage.destroy();
	});
});
