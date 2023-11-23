/*global QUnit */

sap.ui.define([
	"sap/ui/core/Element",
	"sap/ui/model/json/JSONModel",
	"sap/m/library",
	"sap/m/App",
	"sap/m/Page",
	"sap/m/Avatar",
	"sap/m/QuickViewCard",
	"sap/m/QuickViewPage",
	"sap/m/QuickViewGroup",
	"sap/m/QuickViewGroupElement",
	"sap/ui/core/Core"
], function(
	Element,
	JSONModel,
	mobileLibrary,
	App,
	Page,
	Avatar,
	QuickViewCard,
	QuickViewPage,
	QuickViewGroup,
	QuickViewGroupElement,
	oCore
) {
	"use strict";

	// shortcut for sap.m.QuickViewGroupElementType
	var QuickViewGroupElementType = mobileLibrary.QuickViewGroupElementType;

	//create JSON model instance
	var oModel = new JSONModel();

	// JSON sample data
	var mData = {
		"pages": [
			{
				pageId: "customPageId",
				header: "Employee Info",
				title: "John Doe",
				avatarSrc: "sap-icon://building",
				description: "Department Manager1",
				groups: [
					{
						heading: "Job",
						elements: [
							{
								label: "Company",
								value: "SAP AG",
								url: "http://sap.com",
								elementType: QuickViewGroupElementType.pageLink,
								pageLinkId: "customPageId4"
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
								elementType: QuickViewGroupElementType.email
							},
							{
								label: "Phone",
								value: "+359 888 888 888",
								elementType: QuickViewGroupElementType.phone
							},
							{
								label: "Best Friend",
								value: "Michael Muller",
								elementType: QuickViewGroupElementType.pageLink,
								pageLinkId: "customPageId2"
							},
							{
								label: "Favorite Player",
								value: "Ivaylo Ivanov",
								elementType: QuickViewGroupElementType.pageLink,
								pageLinkId: "customPageId3"
							}
						]
					}

				]
			},
			{
				pageId: "customPageId2",
				header: "Page 2",
				avatarSrc: "sap-icon://person-placeholder",
				title: "Michael Muller",
				description: "Account Manager",
				groups: [
					{
						heading: "Job",
						elements: [
							{
								label: "Company",
								value: "SAP AG",
								url: "http://sap.com",
								elementType: QuickViewGroupElementType.pageLink,
								pageLinkId: "customPageId4"
							},
							{
								label: "Company address",
								value: "Sofia, Boris III, 136A"
							}
						]
					},
					{
						heading: "Hobby",
						elements: [
							{
								label: "Name",
								value: "Jaga",
								elementType: "text"
							},
							{
								label: "Level",
								value: "Beginner"
							}

						]
					}

				]
			},
			{
				pageId: "customPageId3",
				header: "Page 3",
				avatarSrc: "sap-icon://person-placeholder",
				title: "Ivaylo Ivanov",
				description: "Developer",
				groups: [
					{
						heading: "Job",
						elements: [
							{
								label: "Company",
								value: "SAP AG",
								url: "http://sap.com",
								elementType: QuickViewGroupElementType.pageLink,
								pageLinkId: "customPageId4"
							},
							{
								label: "Company address",
								value: "Sofia, Boris III, 136A"
							}
						]
					},
					{
						heading: "Hobby",
						elements: [
							{
								label: "Name",
								value: "Table Tennis",
								elementType: "text"
							},
							{
								label: "Level",
								value: "Beginner"
							}

						]
					}

				]
			},
			{
				pageId: "customPageId4",
				header: "Company View",
				avatarSrc: "sap-icon://building",
				title: "SAP AG",
				description: "Run it simple",
				groups: [
					{
						heading: "Contact Information",
						elements: [
							{
								label: "Address",
								value: "Waldorf, Germany",
								url: "http://sap.com",
								elementType: "link"
							},
							{
								label: "Email",
								value: "office@sap.com",
								emailSubject: 'Subject',
								elementType: "email"
							}
						]
					},
					{
						heading: "Main Contact",
						elements: [
							{
								label: "Name",
								value: "Michael Muller",
								elementType: QuickViewGroupElementType.pageLink,
								pageLinkId: "customPageId2"
							},
							{
								label: "E-mail",
								value: "michael.muller@sap.com",
								emailSubject: 'Subject',
								elementType: "email"
							},
							{
								label: "Phone",
								value: "+359 888 888 888",
								elementType: "phone"
							},
							{
								label: "Mobile",
								value: "+359 888 999 999",
								elementType: "phone"
							}
						]
					}

				]
			}
		]

	};

	// set the data for the model
	oModel.setData(mData);

	// create and add app
	var oApp = new App("myApp", {initialPage: "quickViewPage"});
	oApp.setModel(oModel);
	oApp.placeAt("qunit-fixture");

	// create and add a page with icon tab bar
	var oPage = new Page("quickViewPage", {
		title: "Quick View"
	});
	oApp.addPage(oPage);

	function getQuickViewCard() {
		return new QuickViewCard({
			pages: {
				path: '/pages',
				template: new QuickViewPage({
					pageId: "{pageId}",
					header: "{header}",
					title: "{title}",
					description: "{description}",
					avatar: new Avatar({
						src: "{avatarSrc}"
					}),
					groups: {
						path: 'groups',
						template: new QuickViewGroup({
							heading: '{heading}',
							elements: {
								path: 'elements',
								template: new QuickViewGroupElement({
									label: "{label}",
									value: "{value}",
									url: "{url}",
									type: "{elementType}",
									pageLinkId: "{pageLinkId}",
									emailSubject: '{emailSubject}'
								})
							}
						})
					}
				})
			}
		});
	}

	QUnit.module("API", {
		beforeEach: function () {
			this.oQuickViewCard = getQuickViewCard();
			oPage.addContent(this.oQuickViewCard);

			oCore.applyChanges();
		},
		afterEach: function () {
			this.oQuickViewCard.destroy();
			this.oQuickViewCard = null;
		}
	});

	QUnit.test("Testing if the QuickView is created", function (assert) {
		assert.ok(Element.getElementById(this.oQuickViewCard.getId()), "should render");
	});

	QUnit.test("Test binding", function (assert) {
		var aQuickViewPages = this.oQuickViewCard.getPages();

		aQuickViewPages.forEach(function (page, index) {
			assert.strictEqual(page.mProperties.header, mData.pages[index].header, "Header property is set correctly");
		});
	});

	QUnit.test("Check if the Header can be removed if changing data", function(assert) {

		var QVCardScrollContainer = document.getElementById(this.oQuickViewCard.sId + "-" + mData.pages[0].pageId + "-scroll");

		assert.strictEqual(QVCardScrollContainer.children.length, 2, "ScrollContainer inside QuickViewCard contains header and SimpleForm");

		this.oQuickViewCard.getPages()[0].destroyAvatar();

		mData.pages[0].title = "";
		mData.pages[0].description = "";

		oModel.setData(mData);
		oCore.applyChanges();

		QVCardScrollContainer = document.getElementById(this.oQuickViewCard.sId + "-" + mData.pages[0].pageId + "-scroll");
		assert.strictEqual(QVCardScrollContainer.children.length, 1, "ScrollContainer inside QuickViewCard contains only SimpleForm");
	});

	QUnit.module("Rendering", {
		beforeEach: function () {
			this.oQuickViewCard = getQuickViewCard();
			oPage.addContent(this.oQuickViewCard);

			oCore.applyChanges();
		},
		afterEach: function () {
			this.oQuickViewCard.destroy();
			this.oQuickViewCard = null;
		}
	});

	QUnit.test("check aria-label", function(assert) {
		assert.ok(this.oQuickViewCard.$().attr('aria-label'), 'aria-label is set');
	});

	QUnit.test("Checking if all link have width of 'auto'", function(assert) {
		// act
		var aLinks = this.oQuickViewCard.$().find(".sapMLnk");

		// assert
		for (var index = 0; index < aLinks.length; index += 1) {
			assert.strictEqual(aLinks[index].style.width, 'auto', "The Link should have width set to 'auto'");
		}
	});
});