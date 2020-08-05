/*global QUnit */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/model/json/JSONModel",
	"sap/m/library",
	"sap/m/App",
	"sap/m/Page",
	"sap/m/QuickViewCard",
	"sap/m/QuickViewPage",
	"sap/m/QuickViewGroup",
	"sap/m/QuickViewGroupElement"
], function(
	qutils,
	JSONModel,
	mobileLibrary,
	App,
	Page,
	QuickViewCard,
	QuickViewPage,
	QuickViewGroup,
	QuickViewGroupElement
) {
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
				icon: "sap-icon://building",
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
				icon: "sap-icon://person-placeholder",
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
				icon: "sap-icon://person-placeholder",
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
				icon: "sap-icon://building",
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

	sap.ui.getCore().setModel(oModel);

	// create and add app
	var oApp = new App("myApp", {initialPage: "quickViewPage"});
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
					icon: "{icon}",
					title: "{title}",
					description: "{description}",
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

			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.oQuickViewCard.destroy();
			this.oQuickViewCard = null;
		}
	});

	QUnit.test("Testing if the QuickView is created", function (assert) {
		assert.ok(sap.ui.getCore().byId(this.oQuickViewCard.getId()), "should render");
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

		mData.pages[0].title = "";
		mData.pages[0].icon = "";
		mData.pages[0].description = "";

		oModel.setData(mData);
		sap.ui.getCore().applyChanges();

		QVCardScrollContainer = document.getElementById(this.oQuickViewCard.sId + "-" + mData.pages[0].pageId + "-scroll");
		assert.strictEqual(QVCardScrollContainer.children.length, 1, "ScrollContainer inside QuickViewCard contains only SimpleForm");
	});

	QUnit.module("Rendering", {
		beforeEach: function () {
			this.oQuickViewCard = getQuickViewCard();
			oPage.addContent(this.oQuickViewCard);

			sap.ui.getCore().applyChanges();
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