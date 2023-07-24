/*global QUnit, sinon */
sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/Core",
	"sap/ui/qunit/QUnitUtils",
	"sap/m/App",
	"sap/m/Avatar",
	"sap/m/library",
	"sap/m/Page",
	"sap/m/QuickViewPage",
	"sap/m/QuickViewGroup",
	"sap/m/QuickViewGroupElement"
], function(
	JSONModel,
	Core,
	QUnitUtils,
	App,
	Avatar,
	library,
	Page,
	QuickViewPage,
	QuickViewGroup,
	QuickViewGroupElement
) {
	"use strict";

	var AVATAR_INDEX = 0;

	// shortcut for sap.m.AvatarShape
	var AvatarShape = library.AvatarShape;

	//create JSON model instance
	var oModel = new JSONModel();

	// JSON sample data
	var mData = {
		header: "Employee Info",
		title: "John Doe",
		titleActive: false,
		avatarSrc: "sap-icon://person-placeholder",
		description: "Department Manager1",
		iconVisibility: true,
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
					},
					{
						label: "Other",
						value: "",
						elementType: "text"
					}
				]
			}

		]

	};

	// set the data for the model
	oModel.setData(mData);

	Core.setModel(oModel);

	// create and add app
	var oApp = new App("myApp", {initialPage: "quickViewPage"});
	oApp.placeAt("qunit-fixture");

	// create and add a page
	var oPage = new Page("quickViewPage", {
		title: "Quick View Page"
	});
	oApp.addPage(oPage);

	function getQuickViewPage() {
		return new QuickViewPage({
			header: "{/header}",
			title: "{/title}",
			description: "{/description}",
			avatar: new Avatar({
				src: "{/avatarSrc}",
				visible: "{/iconVisibility}"
			}),
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
			Core.applyChanges();
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
		Core.applyChanges();


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
		assert.strictEqual(this.oQuickViewPage.getAvatar().getSrc(), "sap-icon://person-placeholder", "Icon should be set correctly");
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

	QUnit.test("Value is not provided and hyphen is rendered", function (assert) {
		assert.strictEqual(document.getElementsByClassName("sapMEmptyIndicator").length, 1, "Hyphen is rendered.");
	});

	QUnit.module("Rendering", {
		beforeEach: function () {
			this.oQuickViewPage = getQuickViewPage();

			this.oQuickViewPage.setModel(oModel);
			oPage.addContent(this.oQuickViewPage);
			Core.applyChanges();
		},
		afterEach: function () {
			this.oQuickViewPage.destroy();
			this.oQuickViewPage = null;
		}
	});

	QUnit.test("Testing if the QuickView is created", function (assert) {
		assert.strictEqual(this.oQuickViewPage.$().length, 1, "should render");
	});

	QUnit.test("Testing if the QuickView Header is created when it is with no content", function (assert) {
		mData.title = "";
		mData.description = "";
		mData.iconVisibility = false;
		oModel.setData(mData);
		Core.applyChanges();

		assert.strictEqual(this.oQuickViewPage.$()[0].childElementCount, 1, "only the form should be rendered");
	});

	QUnit.module("Icon (deprecated)", {
		beforeEach: function () {
			this.oQuickViewPage = new QuickViewPage();
			this.oQuickViewPage.placeAt("qunit-fixture");
		},
		afterEach: function () {
			this.oQuickViewPage.destroy();
			this.oQuickViewPage = null;
		}
	});

	/**
	 * @deprecated As of version 1.92
	 */
	QUnit.test("Deprecated property 'icon'", function (assert) {
		// Arrange
		var sIcon = "sap-icon://building";
		this.oQuickViewPage.setIcon(sIcon);
		Core.applyChanges();
		var oAvatar = this.oQuickViewPage._mPageContent.header.getContent()[AVATAR_INDEX];

		// Assert
		assert.strictEqual(oAvatar.getSrc(), sIcon, "'icon' property should be correctly propagated to inner avatar");
	});

	/**
	 * @deprecated As of version 1.111
	 */
	QUnit.test("crossApplicationNavigation when property 'icon and 'titleUrl' are set", function (assert) {
		// Arrange
		var oStub = sinon.stub(this.oQuickViewPage, "_crossApplicationNavigation");
		this.oQuickViewPage.setTitleUrl("someTitleUrl");
		this.oQuickViewPage.setAvatar(new Avatar({src: "sap-icon://building"}));
		Core.applyChanges();
		var oAvatar = this.oQuickViewPage._mPageContent.header.getContent()[AVATAR_INDEX];

		// Act
		QUnitUtils.triggerMouseEvent(oAvatar.getDomRef(), "tap");

		// Assert
		assert.ok(oStub.called, "crossApplicationNavigation should happen");
	});

	/**
	 * @deprecated As of version 1.92
	 */
	QUnit.test("Deprecated property 'fallbackIcon'", function (assert) {
		// Arrange
		var sFallbackIcon = "sap-icon://error";
		this.oQuickViewPage.setIcon("some/invalid/image.jpg");
		this.oQuickViewPage.setFallbackIcon(sFallbackIcon);
		Core.applyChanges();
		var oAvatar = this.oQuickViewPage._mPageContent.header.getContent()[AVATAR_INDEX];

		// Assert
		assert.strictEqual(oAvatar.getFallbackIcon(), sFallbackIcon, "'fallbackIcon' property should be correctly propagated to inner avatar");
	});

	QUnit.module("Avatar", {
		beforeEach: function () {
			this.oQuickViewPage = new QuickViewPage();
			this.oQuickViewPage.placeAt("qunit-fixture");
		},
		afterEach: function () {
			this.oQuickViewPage.destroy();
			this.oQuickViewPage = null;
		}
	});

	QUnit.test("Properties are correctly cloned", function (assert) {
		// Arrange
		var oAvatar = new Avatar({
			src: "sap-icon://error",
			displayShape: AvatarShape.Square
		});
		this.oQuickViewPage.setAvatar(oAvatar);
		Core.applyChanges();

		var oRenderedAvatar = this.oQuickViewPage._mPageContent.header.getContent()[AVATAR_INDEX];

		// Assert
		assert.strictEqual(oRenderedAvatar.getSrc(), oAvatar.getSrc(), "Properties should have same values");
		assert.strictEqual(oRenderedAvatar.getDisplayShape(), oAvatar.getDisplayShape(), "Properties should have same values");
	});

	QUnit.test("Properties are correctly cloned when they depend on binding context", function (assert) {
		// Arrange
		var oAvatar = new Avatar({
			src: "{src}",
			displayShape: "{displayShape}"
		});
		oAvatar.setModel(new JSONModel({
			src: "sap-icon://error",
			displayShape: AvatarShape.Square
		}));
		oAvatar.bindObject("/");
		this.oQuickViewPage.setAvatar(oAvatar);
		var oRenderedAvatar = this.oQuickViewPage._getAvatar();

		// Assert
		assert.strictEqual(oRenderedAvatar.getSrc(), oAvatar.getSrc(), "Properties should have same values");
		assert.strictEqual(oRenderedAvatar.getDisplayShape(), oAvatar.getDisplayShape(), "Properties should have same values");
	});

	QUnit.test("Rendered avatar is correctly updated when the real avatar is updated", function (assert) {
		// Arrange
		var oAvatar = new Avatar({
			src: "sap-icon://error"
		});
		this.oQuickViewPage.setAvatar(oAvatar);

		// Act
		oAvatar.setSrc("sap-icon://hint");
		var oRenderedAvatar = this.oQuickViewPage._getAvatar();

		// Assert
		assert.strictEqual(oRenderedAvatar.getSrc(), "sap-icon://hint", "Properties should have same values");
	});

	QUnit.test("No avatar but titleUrl", function (assert) {

		this.oQuickViewPage.setTitle("Title");
		this.oQuickViewPage.setTitleUrl("www.sap.com");
		Core.applyChanges();

		var oRenderedAvatar = this.oQuickViewPage._getAvatar();

		// Assert
		assert.notOk(oRenderedAvatar, "Avatar is not created and error is not thrown");
	});
});