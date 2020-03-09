/*global QUnit, sinon */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/Core",
	"sap/m/App",
	"sap/m/Page",
	"sap/m/QuickViewPage",
	"sap/m/QuickViewGroup",
	"sap/m/QuickViewGroupElement"
], function(
	qutils,
	JSONModel,
	Core,
	App,
	Page,
	QuickViewPage,
	QuickViewGroup,
	QuickViewGroupElement
) {
	"use strict";

	//create JSON model instance
	var oModel = new JSONModel();

	// JSON sample data
	var mData = {
		header  : "Employee Info",
		title  : "John Doe",
		titleActive: false,
		icon  : "sap-icon://person-placeholder",
		description: "Department Manager1",
		groups: [
			{
				heading: "Job",
				elements: [
					{
						label: "Company",
						value: "SAP AG",
						url: "http://sap.com",
						elementType: "link"
					},
					{
						label: "Company address",
						value: "Sofia, Boris III, 136A"
					}
				]
			},
			{
				heading: "Other",
				elements: [
					{
						label: "Email",
						value: "john.dow@sap.com",
						url: "john.dow@sap.com",
						emailSubject: 'Subject',
						elementType: "email"
					},
					{
						label: "Phone",
						value: "+359 888 888 888",
						elementType: "phone"
					},
					{
						label: "Phone",
						value: "+359 888 888 888",
						elementType: "phone",
						visible : false
					}
				]
			}

		]

	};

	// set the data for the model
	oModel.setData(mData);

	sap.ui.getCore().setModel(oModel);

	// create and add app
	var oApp = new App("myApp", {initialPage: "quickViewPage"});
	oApp.placeAt("qunit-fixture");

	// create and add a page with icon tab bar
	var oPage = new Page("quickViewPage", {
		title: "Quick View Page"
	});
	oApp.addPage(oPage);

	function getQuickViewPage() {
		return new QuickViewPage({
			header: "{/header}",
			title: "{/title}",
			icon: "{/icon}",
			description: "{/description}",
			groups: {
				path: '/groups',
				template: new QuickViewGroup({
					heading: '{heading}',
					elements: {
						path: 'elements',
						template: new QuickViewGroupElement({
							label: "{label}",
							value: "{value}",
							url: "{url}",
							type: "{elementType}",
							emailSubject: '{emailSubject}',
							visible: '{visible}'
						}),
						templateShareable: false
					}
				})
			}
		});
	}

	QUnit.module("Data binding", {
		beforeEach: function () {
			this.oQuickViewPage = getQuickViewPage();

			this.oQuickViewPage.setModel(oModel);
			oPage.addContent(this.oQuickViewPage);
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.oQuickViewPage.destroy();
			this.oQuickViewPage = null;
		}
	});

	QUnit.test("When testing the binding of the control", function (assert) {
		// Act
		var fnSpyCreatePageContent = sinon.spy(this.oQuickViewPage, "_createPageContent");
		var fnSpyCreateForm = sinon.spy(this.oQuickViewPage, "_createForm");
		var fnSpyGetPage = sinon.spy(this.oQuickViewPage, "_getPageHeaderContent");
		var fnSpyRenderGroup = sinon.spy(this.oQuickViewPage, "_renderGroup");

		this.oQuickViewPage.setModel(oModel);
		oPage.addContent(this.oQuickViewPage);
		sap.ui.getCore().applyChanges();


		// Assert
		assert.strictEqual(fnSpyCreatePageContent.callCount, 1, "_createPageContent() should be called");
		assert.strictEqual(fnSpyCreateForm.callCount, 1, "_createForm() should be called");
		assert.strictEqual(fnSpyGetPage.callCount, 1, "__getPageHeaderContent should be called");
		assert.strictEqual(fnSpyRenderGroup.callCount, 2, "_renderGroup() should be called twice");
	});

	QUnit.test("Page properties", function (assert) {
		assert.strictEqual(this.oQuickViewPage.getHeader(), "Employee Info", "Header should be set correctly");
		assert.strictEqual(this.oQuickViewPage.getTitle(), "John Doe", "Title should be set correctly");
		assert.strictEqual(this.oQuickViewPage.getDescription(), "Department Manager1", "Description should be set correctly");
		assert.strictEqual(this.oQuickViewPage.getIcon(), "sap-icon://person-placeholder", "Icon should be set correctly");
	});

	QUnit.test("Group element properties", function (assert) {
		var oGroup = this.oQuickViewPage.getGroups()[1];
		var oElement = oGroup.getElements()[0];

		assert.strictEqual(oElement.getLabel(), "Email", "Label should be set correctly");
		assert.strictEqual(oElement.getValue(), "john.dow@sap.com", "Value should be set correctly");
		assert.strictEqual(oElement.getUrl(), "john.dow@sap.com", "Url should be set correctly");
		assert.strictEqual(oElement.getEmailSubject(), "Subject", "Email Subject should be set correctly");

		oElement = oGroup.getElements()[1];
		assert.strictEqual(oElement.getValue(), "+359 888 888 888", "Phone value should be set correctly");
	});

	QUnit.test("Element is not visible", function (assert) {
		var $phoneLinks = this.oQuickViewPage.$().find('a[href*="tel"]');
		assert.strictEqual($phoneLinks.length, 1, "Second phone is not visible");
	});

	QUnit.module("Rendering", {
		beforeEach: function () {
			this.oQuickViewPage = getQuickViewPage();

			this.oQuickViewPage.setModel(oModel);
			oPage.addContent(this.oQuickViewPage);
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.oQuickViewPage.destroy();
			this.oQuickViewPage = null;
		}
	});

	QUnit.test("Testing if the QuickView is created", function (assert) {
		assert.strictEqual(this.oQuickViewPage.$().length, 1, "should render");
	});

	QUnit.module("Fallback icon", {
		beforeEach: function () {
			this.oQuickViewPage = getQuickViewPage();
			this.oQuickViewPage.setModel(oModel);
		},
		afterEach: function () {
			this.oQuickViewPage.destroy();
			this.oQuickViewPage = null;
		}
	});

	QUnit.test("Fallback icon when the real icon failed to load", function (assert) {
		// Arrange
		var FALLBACK_ICON_INDEX = 0,
			IMAGE_INDEX = 1,
			aHeaderContent,
			oImage,
			oFallbackIcon,
			done = assert.async();

		this.oQuickViewPage.setIcon("some/invalid/path");
		this.oQuickViewPage.setFallbackIcon("sap-icon://error");
		this.oQuickViewPage.placeAt("qunit-fixture");
		Core.applyChanges();

		aHeaderContent = this.oQuickViewPage._mPageContent.header.getContent();
		oFallbackIcon = aHeaderContent[FALLBACK_ICON_INDEX];
		oImage = aHeaderContent[IMAGE_INDEX];

		oImage.$().on("error", function () {
			// Assert
			assert.notStrictEqual(oFallbackIcon.$().css("display"), "none", "The fallback icon should be displayed.");
			assert.strictEqual(oImage.$().css("display"), "none", "The image should NOT be displayed.");

			done();
		});
	});

	QUnit.test("Fallback icon when the real icon is successfully loaded", function (assert) {
		// Arrange
		var FALLBACK_ICON_INDEX = 0,
			aHeaderContent,
			oFallbackIcon;

		this.oQuickViewPage.setIcon("test-resources/sap/m/images/SAPLogo.jpg");
		this.oQuickViewPage.setFallbackIcon("sap-icon://error");
		this.oQuickViewPage.placeAt("qunit-fixture");
		Core.applyChanges();

		aHeaderContent = this.oQuickViewPage._mPageContent.header.getContent();
		oFallbackIcon = aHeaderContent[FALLBACK_ICON_INDEX];

		// Assert
		assert.ok(oFallbackIcon.hasStyleClass("sapMQuickViewPageFallbackIconHidden"), "The fallback icon should NOT be displayed.");
	});

	QUnit.module("Private API", {
		beforeEach: function () {
			this.oQuickViewPage = new QuickViewPage();
		},
		afterEach: function () {
			this.oQuickViewPage.destroy();
			this.oQuickViewPage = null;
		}
	});

	QUnit.test("_createIcon", function (assert) {
		// Arrange
		var bDecorative = false,
			sTooltip = "test tooltip",
			sIconSrc = "sap-icon://error",
			oIcon = this.oQuickViewPage._createIcon(sIconSrc, bDecorative, sTooltip);

		// Assert
		assert.ok(oIcon.isA("sap.ui.core.Icon"), "The method should return new Icon instance");
		assert.strictEqual(oIcon.getDecorative(), bDecorative, "The 'decorative' property should be set");
		assert.strictEqual(oIcon.getTooltip(), sTooltip, "The 'tooltip' property should be set");
		assert.strictEqual(oIcon.getSrc(), sIconSrc, "The 'src' property should be set");
		assert.strictEqual(oIcon.getUseIconTooltip(), false, "The 'useIconTooltip' should be 'false'");

		// Clean up
		oIcon.destroy();
		oIcon = null;
	});
});