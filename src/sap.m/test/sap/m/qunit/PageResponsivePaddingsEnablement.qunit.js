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

		this.stub(window, "requestAnimationFrame", window.setTimeout);
		sap.ui.getCore().applyChanges();

		var $page = jQuery("#testPage");
		$page.css("width", "300px");
		this.clock.tick(300);
		sap.ui.getCore().applyChanges();


		var $pageHeader = oTestPage.$().find("#testPage-intHeader"),
			$pageSubHeader = oTestPage.$().find(".sapMPageSubHeader .sapMBar"),
			$pageContent = oTestPage.$().find("#testPage-cont"),
			$pageFooter = oTestPage.$().find(".sapMPageFooter .sapMBar"),
			bIsHeaderResponsive = $pageHeader.hasClass("sapUi-Std-PaddingS"),
			bIsSubHeaderResponsive = $pageContent.hasClass("sapUi-Std-PaddingS"),
			bIsContentResponsive = $pageSubHeader.hasClass("sapUi-Std-PaddingS"),
			bIsFooterResponsive = $pageFooter.hasClass("sapUi-Std-PaddingS");


		//Assert
		assert.ok(bIsHeaderResponsive, "The sapUi-Std-PaddingS class is applied to the header");
		assert.ok(bIsSubHeaderResponsive, "The sapUi-Std-PaddingS class is applied to the subheader");
		assert.ok(bIsContentResponsive, "The sapUi-Std-PaddingS class is applied to the content");
		assert.ok(bIsFooterResponsive, "The sapUi-Std-PaddingS class is applied to the footer");

		//Act
		$page.css("width", "700px");
		this.clock.tick(300);
		sap.ui.getCore().applyChanges();

		bIsHeaderResponsive = $pageHeader.hasClass("sapUi-Std-PaddingM");
		bIsSubHeaderResponsive = $pageSubHeader.hasClass("sapUi-Std-PaddingM");
		bIsContentResponsive = $pageContent.hasClass("sapUi-Std-PaddingM");
		bIsFooterResponsive = $pageFooter.hasClass("sapUi-Std-PaddingM");

		//Assert
		assert.ok(bIsHeaderResponsive, "The sapUi-Std-PaddingM class is applied to the header");
		assert.ok(bIsSubHeaderResponsive, "The sapUi-Std-PaddingM class is applied to the subheader");
		assert.ok(bIsContentResponsive, "The sapUi-Std-PaddingM class is applied to the content");
		assert.ok(bIsFooterResponsive, "The sapUi-Std-PaddingM class is applied to the footer");

		//Act
		$page.css("width", "1300px");
		sap.ui.getCore().applyChanges();
		this.clock.tick(300);

		bIsHeaderResponsive = $pageHeader.hasClass("sapUi-Std-PaddingL");
		bIsSubHeaderResponsive = $pageSubHeader.hasClass("sapUi-Std-PaddingL");
		bIsContentResponsive = $pageContent.hasClass("sapUi-Std-PaddingL");
		bIsFooterResponsive = $pageFooter.hasClass("sapUi-Std-PaddingL");

		//Assert
		assert.ok(bIsHeaderResponsive, "The sapUi-Std-PaddingL class is applied to the header");
		assert.ok(bIsSubHeaderResponsive, "The sapUi-Std-PaddingL class is applied to the subheader");
		assert.ok(bIsContentResponsive, "The sapUi-Std-PaddingL class is applied to the content");
		assert.ok(bIsFooterResponsive, "The sapUi-Std-PaddingL class is applied to the footer");

		//Act
		$page.css("width", "1700px");
		this.clock.tick(300);
		sap.ui.getCore().applyChanges();

		bIsHeaderResponsive = $pageHeader.hasClass("sapUi-Std-PaddingXL");
		bIsSubHeaderResponsive = $pageSubHeader.hasClass("sapUi-Std-PaddingXL");
		bIsContentResponsive = $pageContent.hasClass("sapUi-Std-PaddingXL");
		bIsFooterResponsive = $pageFooter.hasClass("sapUi-Std-PaddingXL");

		//Assert
		assert.ok(bIsHeaderResponsive, "The sapUi-Std-PaddingXL class is applied to the header");
		assert.ok(bIsSubHeaderResponsive, "The sapUi-Std-PaddingXL class is applied to the subheader");
		assert.ok(bIsContentResponsive, "The sapUi-Std-PaddingXL class is applied to the content");
		assert.ok(bIsFooterResponsive, "The sapUi-Std-PaddingXL class is applied to the footer");

		this.stub().reset();
		oTestPage.destroy();
	});
});
