/*global QUnit */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/m/semantic/SemanticPage",
	"sap/m/semantic/SemanticButton",
	"sap/m/semantic/MessagesIndicator",
	"sap/m/semantic/PositiveAction",
	"sap/m/semantic/FlagAction",
	"sap/m/semantic/FavoriteAction",
	"sap/m/semantic/EditAction",
	"sap/m/semantic/MasterPage",
	"sap/m/semantic/DetailPage",
	"sap/m/semantic/FullscreenPage",
	"sap/m/Button",
	"sap/m/Bar",
	"sap/m/Title",
	"sap/ui/model/json/JSONModel",
	"sap/m/PagingButton",
	"sap/m/semantic/MultiSelectAction",
	"sap/m/library",
	"sap/m/Label",
	"sap/ui/core/InvisibleText"
], function(
	qutils,
	createAndAppendDiv,
	SemanticPage,
	SemanticButton,
	MessagesIndicator,
	PositiveAction,
	FlagAction,
	FavoriteAction,
	EditAction,
	MasterPage,
	DetailPage,
	FullscreenPage,
	Button,
	Bar,
	Title,
	JSONModel,
	PagingButton,
	MultiSelectAction,
	mobileLibrary,
	Label,
	InvisibleText
) {
	// shortcut for sap.m.OverflowToolbarPriority
	var OverflowToolbarPriority = mobileLibrary.OverflowToolbarPriority;

	createAndAppendDiv("qunit-fixture-visible");



	//

	var _SemanticPageTypes = {
		master: "master",
		detail: "details",
		fullscreen: "fullscreen"
	};

	function createSemanticPageFactory(sPageType, oConfig) {
		var oPage;
		switch (sPageType) {
			case _SemanticPageTypes.master:
				oPage = new MasterPage(oConfig);
				break;
			case _SemanticPageTypes.detail:
				oPage = new DetailPage(oConfig);
				break;
			case _SemanticPageTypes.fullscreen:
				oPage = new FullscreenPage(oConfig);
				break;
			default:
				oPage = new SemanticPage(oConfig);
		}

		oPage.placeAt("qunit-fixture-visible");
		sap.ui.getCore().applyChanges();

		return oPage;
	}

	QUnit.module("Initial check", {
		beforeEach: function () {

		},

		afterEach: function () {

			jQuery("#qunit-fixture-visible").html("");
		}
	});

	QUnit.test("Semantic page and all its internal controls are rendered", function (assert) {

		var oConfig = {
					title: "This is a title",
					showNavButton: true
				},
				oSemanticPage = createSemanticPageFactory(null, oConfig);

		assert.strictEqual(oSemanticPage.$().length, 1, "Semantic page is in the DOM");
		assert.strictEqual(oSemanticPage.getAggregation("_page").$().length, 1, "Page is in the DOM");
		assert.strictEqual(oSemanticPage._getAnyHeader().$().length, 1, "Header is in the DOM");
		//assert.strictEqual(oSemanticPage._getPage().getFooter().$().length, 1, "Footer is in the DOM");

		oSemanticPage.destroy();
	});

	QUnit.test("Detail page share menu is rendered", function (assert) {

		var oConfig = {
					customShareMenuContent: [
						new Button({text: "button1"}),
						new Button({text: "button1"})
					]
				},
				oSemanticPage = createSemanticPageFactory(_SemanticPageTypes.detail, oConfig);

		assert.strictEqual(oSemanticPage.$("footer").length, 1, "Footer is in the DOM");
		assert.strictEqual(oSemanticPage.$("shareButton").length, 1, "shareButton is in the DOM");

		oSemanticPage.destroy();
	});

	QUnit.test("Fullscreen page share menu is rendered", function (assert) {

		var oConfig = {
					customShareMenuContent: [
						new Button({text: "button1"})
					]
				},
				oSemanticPage = createSemanticPageFactory(_SemanticPageTypes.fullscreen, oConfig);

		assert.strictEqual(oSemanticPage._getPage().getFooter().$().length, 1, "Footer is in the DOM");
		assert.strictEqual(oSemanticPage._getPage().getFooter().getContent().length, 2, "ShareMenu button is in the DOM");

		oSemanticPage.destroy();
	});

	QUnit.test("Semantic page has correct header and footer components", function (assert) {
		var oConfig = {
					customFooterContent: [
						new Button({text: "button1"})
					]
				},
				oSemanticPage = createSemanticPageFactory(null, oConfig);

		assert.ok(oSemanticPage.getAggregation("_page").getFooter() instanceof sap.m.Toolbar, "The footer is Toolbar");

		assert.strictEqual(oSemanticPage._getPage().getFooter().getContent()[0] instanceof sap.m.ToolbarSpacer, true, "inner footer first item is spacer");

		oSemanticPage.destroy();
	});

	QUnit.test("Detail page has correct header and footer components", function (assert) {
		var oConfig = {
					customFooterContent: [
						new Button({text: "button1"})
					]
				},
				oSemanticPage = createSemanticPageFactory(_SemanticPageTypes.detail, oConfig);

		assert.ok(oSemanticPage.getAggregation("_page").getFooter() instanceof sap.m.Toolbar, "The footer is Toolbar");

		assert.strictEqual(oSemanticPage._getPage().getFooter().getContent()[1] instanceof Button, true, "inner footer last item is button (for shareMenu)");

		oSemanticPage.destroy();
	});

	QUnit.test("Fullscreen page has correct header and footer components", function (assert) {
		var oConfig = {
					customFooterContent: [
						new Button({text: "button1"})
					]
				},
				oSemanticPage = createSemanticPageFactory(_SemanticPageTypes.fullscreen, oConfig);

		assert.ok(oSemanticPage.getAggregation("_page").getFooter() instanceof sap.m.Toolbar, "The footer is Toolbar");

		assert.strictEqual(oSemanticPage._getPage().getFooter().getContent()[1] instanceof Button, true, "inner footer last item is button (for shareMenu)");

		oSemanticPage.destroy();
	});

	QUnit.test("Header hidden when no header content", function (assert) {
		var oConfig = {},
			oSemanticPage = createSemanticPageFactory(_SemanticPageTypes.fullscreen, oConfig);

		assert.strictEqual(oSemanticPage._getPage().getShowHeader(), false, "header not shown");

		oSemanticPage.destroy();
	});

	QUnit.test("Header shown when there is header content", function (assert) {
		var oConfig = {
					title: "Test"
				},
				oSemanticPage = createSemanticPageFactory(_SemanticPageTypes.fullscreen, oConfig);

		assert.strictEqual(oSemanticPage._getPage().getShowHeader(), true, "header is shown");

		oSemanticPage.destroy();
	});

	QUnit.module("Properties");

	QUnit.test("Semantic page properties have correct default values", function (assert) {

		var oSemanticPage = createSemanticPageFactory(),
				oMasterPage = createSemanticPageFactory(_SemanticPageTypes.master, null),
				oDetailPage = createSemanticPageFactory(_SemanticPageTypes.detail, null);

		assert.strictEqual(oSemanticPage.getTitle(), "", "The default value for title is empty");
		assert.strictEqual(oSemanticPage.getShowNavButton(), false, "Navigation Button should not be showed by default");

		oSemanticPage.destroy();
		oMasterPage.destroy();
		oDetailPage.destroy();
	});

	QUnit.test("title is set correctly", function (assert) {
		var oConfig = {
					title: "This is a title"
				},
				oSemanticPage1 = createSemanticPageFactory(null, oConfig),
				oSemanticPage2 = createSemanticPageFactory();

		assert.ok(oSemanticPage1._getInternalHeader().getContentMiddle()[0] instanceof Title, "header content contains title");
		assert.strictEqual(oSemanticPage1._getInternalHeader().getContentMiddle()[0].getText(), "This is a title", "header content contains title");
		assert.strictEqual(oSemanticPage1.getTitle(), "This is a title", "title is set");
		assert.strictEqual(oSemanticPage2._getInternalHeader().getContentMiddle()[0], undefined, "Header content middle is empty");

		// Arrange
		var sUpdatedTitle = "Updated title";

		// Act
		oSemanticPage1.setTitle(sUpdatedTitle);

		assert.strictEqual(oSemanticPage1.getTitle(), sUpdatedTitle, "title is updated");
		assert.strictEqual(oSemanticPage1._getInternalHeader().getContentMiddle()[0].getText(), sUpdatedTitle, "header content contains updated title");

		oSemanticPage1.destroy();
		oSemanticPage2.destroy();
	});

	QUnit.test("showNavButton is set correctly", function (assert) {
		var oConfig = {
					showNavButton: true
				},
				oSemanticPage1 = createSemanticPageFactory(null, oConfig),
				oSemanticPage2 = createSemanticPageFactory();

		assert.ok(oSemanticPage1._getInternalHeader().getContentLeft()[0] instanceof Button, "header content contains navButton");
		assert.strictEqual(oSemanticPage1.getShowNavButton(), true, "showNavButton is set");
		assert.strictEqual(oSemanticPage2._getInternalHeader().getContentLeft()[0], undefined, "Header content left is empty");

		oSemanticPage1.destroy();
		oSemanticPage2.destroy();
	});

	QUnit.test("floatingFooter is set correctly", function (assert) {

		var oConfig = {
					title: "This is a title",
					showNavButton: true,
					customFooterContent: [new Button({text: "custom"})]
				},
				oSemanticPage = createSemanticPageFactory(null, oConfig);

		oSemanticPage.setFloatingFooter(true);
		assert.strictEqual(oSemanticPage._getPage().getFloatingFooter(), true);
		oSemanticPage.setFloatingFooter(false);
		assert.strictEqual(oSemanticPage._getPage().getFloatingFooter(), false);
		oSemanticPage.destroy();
	});

	QUnit.test("MessagesIndicator aria-labelledby is correct", function (assert) {
		var oMessagesIndicator = new MessagesIndicator(),
			sAriaLabelledBy = oMessagesIndicator._getControl().getAriaLabelledBy()[0],
			sTextId = InvisibleText.getStaticId("sap.m", "SEMANTIC_CONTROL_MESSAGES_INDICATOR");

		assert.strictEqual(sAriaLabelledBy, sTextId, "MessagesIndicator button aria-labelledby is set correctly.");
	});

	QUnit.module("Aggregations", {
		beforeEach: function () {

		},

		afterEach: function () {
			jQuery("#qunit-fixture-visible").html("");
		}
	});

	QUnit.test("Subheader", function (assert) {
		var oSemanticPage = createSemanticPageFactory(),
				oBar = new Bar(),
				oTitle = new Title();

		oSemanticPage.setSubHeader(oBar);
		assert.strictEqual(oSemanticPage.getAggregation("_page").getSubHeader(), oBar, "Subheader is set to Bar");

		//TODO: check how restrictions of type are imposed
		//oSemanticPage.setSubHeader(oTitle);
		//assert.ok(!(oSemanticPage.getAggregation("_page").getSubHeader() instanceof sap.m.Title), "Subheader content should not allow adding components that does not implement IBar interface");

		oSemanticPage.getAggregation("_page").setSubHeader(oBar);
		assert.strictEqual(oSemanticPage.getSubHeader(), oBar, "Retrieved content is Bar");

		oSemanticPage.setShowSubHeader(true);
		assert.ok(oSemanticPage.getAggregation("_page").getShowSubHeader(), "SubHeader content should be shown");

		oSemanticPage.setShowSubHeader(false);
		assert.ok(!oSemanticPage.getAggregation("_page").getShowSubHeader(), "SubHeader content should not be hidden");

		oSemanticPage.destroySubHeader();
		assert.strictEqual(oSemanticPage.getAggregation("_page").getSubHeader(), null, "There should be no subheader content");

		oSemanticPage.destroy();
	});

	QUnit.test("Content", function (assert) {

		var oButton1 = new Button(),
				oButton2 = new Button(),
				oButton3 = new Button(),
				oTitle = new Title(),
				oConfig = {
					content: [
						oButton1, oButton2
					]
				},
				oSemanticPage = createSemanticPageFactory(null, oConfig);

		assert.strictEqual(oSemanticPage.getContent().length, 2, "getContent has correct content length");
		assert.strictEqual(oSemanticPage._getPage().getContent().length, 2, "inner page content has correct content length");

		assert.strictEqual(oSemanticPage.getContent()[0], oButton1, "getContent retrieves the correct content[0]");
		assert.strictEqual(oSemanticPage.indexOfContent(oButton1), 0, "index of the inner content is 0");
		assert.strictEqual(oSemanticPage._getPage().indexOfContent(oButton1), 0, "index of the inner page content is 0");

		assert.strictEqual(oSemanticPage.getContent()[1], oButton2, "getContent retrieves the correct content[1]");
		assert.strictEqual(oSemanticPage.indexOfContent(oButton2), 1, "index of the inner content is 1");
		assert.strictEqual(oSemanticPage._getPage().indexOfContent(oButton2), 1, "index of the inner page content is 1");

		var oInsertResult = oSemanticPage.insertContent(oTitle, 1);
		assert.strictEqual(oInsertResult, oSemanticPage, "insert method returns semanticPage reference");
		assert.strictEqual(oSemanticPage.indexOfContent(oTitle), 1, "index of the inserted inner content is 1");
		assert.strictEqual(oSemanticPage._getPage().indexOfContent(oTitle), 1, "index of the inserted inner page content is 1");

		var oRemoveResult = oSemanticPage.removeContent(oButton1);
		assert.strictEqual(oRemoveResult, oButton1, "remove method returns remove content reference");
		assert.ok(oSemanticPage.getContent()[0] !== oButton1, "Button 1 is removed from the aggregation");
		assert.ok(oSemanticPage._getPage().getContent()[0] !== oButton1, "Button 1 is removed from the inner page aggregation");

		var oRemoveAllResult = oSemanticPage.removeAllContent();
		assert.strictEqual(oRemoveAllResult.length, 2, "removeAll method returns all removed content");
		assert.strictEqual(oSemanticPage.getContent().length, 0, "all content is removed");
		assert.strictEqual(oSemanticPage._getPage().getContent().length, 0, "all inner page content is removed");

		var oAddResult = oSemanticPage.addContent(oButton3);
		assert.strictEqual(oAddResult, oSemanticPage, "add method returns semanticPage reference");
		assert.strictEqual(oSemanticPage.getContent().length, 1, "A button is added to the custom inner content");
		assert.strictEqual(oSemanticPage._getPage().getContent().length, 1, "A button is added to the inner page content");

		oSemanticPage.destroyContent();
		assert.ok(oButton3.bIsDestroyed, "custom innner content is destroyed");
		assert.strictEqual(oSemanticPage.getContent().length, 0, "no custom inner content is available");
		assert.strictEqual(oSemanticPage._getPage().getContent().length, 0, "no inner page content is available");

		oSemanticPage.destroy();
	});

	QUnit.test("Content binding", function (assert) {
		// Arrange
		var oModel = new JSONModel({
			data: [{
				text: "Custom",
				tooltip: "Martin",
				buttonType: "Reject"
			}
			]
		});

		var oPage = new DetailPage({
			content: {
				path: "/data",
				template: new Button({
							text: "{text}",
							tooltip: "{tooltip}",
							type: "{buttonType}"
						}
				)
			}
		});

		oPage.setModel(oModel);

		assert.strictEqual(oPage.getContent().length, 1, "page has custom inner content");
		assert.strictEqual(oPage._getPage().getContent().length, 1, "inner page has content");

		var oButton = oPage.getContent()[0];
		assert.strictEqual(oButton.getText(), "Custom", "content has correct text");
		assert.strictEqual(oButton.getType(), "Reject", "content has correct button type");
		assert.strictEqual(oButton.getTooltip(), "Martin", "content has correct tooltip");

		var oInnerButton = oPage._getPage().getContent()[0];
		assert.strictEqual(oInnerButton, oButton, "inner page has correct content");

		// Clean up
		oPage.destroy();
	});

	QUnit.test("CustomHeaderContent", function (assert) {

		var oButton1 = new Button(),
				oButton2 = new Button(),
				oButton3 = new Button(),
				oTitle = new Title(),
				oConfig = {
					customHeaderContent: [
						oButton1, oButton2
					]
				},
				oSemanticPage = createSemanticPageFactory(null, oConfig);

		var iInitFooterContentLength = 0; //no other content in header

		assert.strictEqual(oSemanticPage.getCustomHeaderContent().length, 2, "getCustomHeaderContent has correct content length");
		assert.strictEqual(oSemanticPage._getInternalHeader().getContentRight().length, (iInitFooterContentLength + 2), "inner footer content has correct content length");

		assert.strictEqual(oSemanticPage.getCustomHeaderContent()[0], oButton1, "getCustomHeaderContent retrieves the correct content");
		assert.strictEqual(oSemanticPage._getInternalHeader().getContentRight()[0], oButton1, "inner header has the correct content");

		assert.strictEqual(oSemanticPage.indexOfCustomHeaderContent(oButton1), 0, "index of the first header content item  is 0");
		assert.strictEqual(oSemanticPage._getInternalHeader().indexOfContentRight(oButton1), 0, "inner header has the correct index 0");

		assert.strictEqual(oSemanticPage.indexOfCustomHeaderContent(oButton2), 1, "index of the second header content item is 1");
		assert.strictEqual(oSemanticPage._getInternalHeader().indexOfContentRight(oButton2), 1, "inner header has the correct index 1");

		var oInsertResult = oSemanticPage.insertCustomHeaderContent(oTitle, 1);
		assert.strictEqual(oInsertResult, oSemanticPage, "insert method returns the semantic page");
		assert.strictEqual(oSemanticPage.indexOfCustomHeaderContent(oTitle), 1, "index of the inserted header content is 1");
		assert.strictEqual(oSemanticPage._getInternalHeader().indexOfContentRight(oTitle), 1, "index of the inner inserted header content is 1");

		var oRemoveResult = oSemanticPage.removeCustomHeaderContent(oButton1);
		assert.strictEqual(oRemoveResult, oButton1, "remove method returns the removed content");
		assert.ok(oSemanticPage.getCustomHeaderContent()[0] !== oButton1, "Button 1 is removed from the aggregation");
		assert.ok(oSemanticPage._getInternalHeader().getContentRight()[1] !== oButton1, "Button 1 is removed from the inner header aggregation");

		var oRemoveAllResult = oSemanticPage.removeAllCustomHeaderContent();
		assert.strictEqual(oRemoveAllResult.length, 2, "removeAll method reurns all removed content");
		assert.strictEqual(oSemanticPage.getCustomHeaderContent().length, 0, "all content is removed");
		assert.strictEqual(oSemanticPage._getInternalHeader().getContentRight().length, iInitFooterContentLength, "all content is removed");

		var oAddResult = oSemanticPage.addCustomHeaderContent(oButton3);
		assert.strictEqual(oAddResult, oSemanticPage, "insert method returns the semantic page");
		assert.strictEqual(oSemanticPage.getCustomHeaderContent().length, 1, "A button is added to the custom header content");
		assert.strictEqual(oSemanticPage._getInternalHeader().getContentRight().length, (iInitFooterContentLength + 1), "A button is added to the custom header content");

		oSemanticPage.destroyCustomHeaderContent();
		assert.ok(oButton3.bIsDestroyed, "custom innner content is destroyed");
		assert.strictEqual(oSemanticPage.getCustomHeaderContent().length, 0, "no custom header content is available");

		oSemanticPage.destroy();
	});

	QUnit.test("CustomHeaderContent binding", function (assert) {
		// Arrange
		var oModel = new JSONModel({
			data: [{
				text: "Custom",
				tooltip: "Martin",
				buttonType: "Reject"
			}
			]
		});

		var oPage = new DetailPage({
			customHeaderContent: {
				path: "/data",
				template: new Button({
							text: "{text}",
							tooltip: "{tooltip}",
							type: "{buttonType}"
						}
				)
			}
		});

		oPage.setModel(oModel);

		var iInitFooterContentLength = 0; //no init content

		assert.strictEqual(oPage.getCustomHeaderContent().length, 1, "page has custom header content");
		assert.strictEqual(oPage._getInternalHeader().getContentRight().length, (1 + iInitFooterContentLength), "page has custom header content");

		var oButton = oPage.getCustomHeaderContent()[0];
		assert.strictEqual(oButton.getText(), "Custom", "content has correct text");
		assert.strictEqual(oButton.getType(), "Reject", "content has correct button type");
		assert.strictEqual(oButton.getTooltip(), "Martin", "content has correct tooltip");

		var oInnerButton = oPage._getInternalHeader().getContentRight()[0];
		assert.strictEqual(oInnerButton, oButton, "inner header has correct content");

		// Clean up
		oPage.destroy();
	});

	QUnit.test("CustomHeaderContent with paging action", function (assert) {

		var oButton1 = new Button(),
				oButton2 = new Button(),
				oButton3 = new Button(),
				oTitle = new Title(),
				oConfig = {
					customHeaderContent: [
						oButton1, oButton2
					],
					pagingAction: new PagingButton()
				},
				oSemanticPage = createSemanticPageFactory(_SemanticPageTypes.detail, oConfig);

		var iInitFooterContentLength = 1; //paging button

		assert.strictEqual(oSemanticPage.getCustomHeaderContent().length, 2, "getCustomHeaderContent has correct content length");
		assert.strictEqual(oSemanticPage._getInternalHeader().getContentRight().length, (iInitFooterContentLength + 2), "inner footer content has correct content length");

		assert.strictEqual(oSemanticPage.getCustomHeaderContent()[0], oButton1, "getCustomHeaderContent retrieves the correct content");
		assert.strictEqual(oSemanticPage._getInternalHeader().getContentRight()[0], oButton1, "inner header has the correct content");

		assert.strictEqual(oSemanticPage.indexOfCustomHeaderContent(oButton1), 0, "index of the first header content item  is 0");
		assert.strictEqual(oSemanticPage._getInternalHeader().indexOfContentRight(oButton1), 0, "inner header has the correct index 0");

		assert.strictEqual(oSemanticPage.indexOfCustomHeaderContent(oButton2), 1, "index of the second header content item is 1");
		assert.strictEqual(oSemanticPage._getInternalHeader().indexOfContentRight(oButton2), 1, "inner header has the correct index 1");

		var oInsertResult = oSemanticPage.insertCustomHeaderContent(oTitle, 1);
		assert.strictEqual(oInsertResult, oSemanticPage, "insert method returns the semantic page");
		assert.strictEqual(oSemanticPage.indexOfCustomHeaderContent(oTitle), 1, "index of the inserted header content is 1");
		assert.strictEqual(oSemanticPage._getInternalHeader().indexOfContentRight(oTitle), 1, "index of the inner inserted header content is 1");

		var oRemoveResult = oSemanticPage.removeCustomHeaderContent(oButton1);
		assert.strictEqual(oRemoveResult, oButton1, "remove method returns the removed content");
		assert.ok(oSemanticPage.getCustomHeaderContent()[0] !== oButton1, "Button 1 is removed from the aggregation");
		assert.ok(oSemanticPage._getInternalHeader().getContentRight()[1] !== oButton1, "Button 1 is removed from the inner header aggregation");

		var oRemoveAllResult = oSemanticPage.removeAllCustomHeaderContent();
		assert.strictEqual(oRemoveAllResult.length, 2, "removeAll method reurns all removed content");
		assert.strictEqual(oSemanticPage.getCustomHeaderContent().length, 0, "all content is removed");
		assert.strictEqual(oSemanticPage._getInternalHeader().getContentRight().length, iInitFooterContentLength, "all content is removed");

		var oAddResult = oSemanticPage.addCustomHeaderContent(oButton3);
		assert.strictEqual(oAddResult, oSemanticPage, "insert method returns the semantic page");
		assert.strictEqual(oSemanticPage.getCustomHeaderContent().length, 1, "A button is added to the custom header content");
		assert.strictEqual(oSemanticPage._getInternalHeader().getContentRight().length, (iInitFooterContentLength + 1), "A button is added to the custom header content");

		oSemanticPage.destroyCustomHeaderContent();
		assert.ok(oButton3.bIsDestroyed, "custom innner content is destroyed");
		assert.strictEqual(oSemanticPage.getCustomHeaderContent().length, 0, "no custom header content is available");

		oSemanticPage.destroy();
	});

	QUnit.test("CustomHeaderContent with multiSelect action", function (assert) {

		var oButton1 = new Button(),
				oButton2 = new Button(),
				oButton3 = new Button(),
				oTitle = new Title(),
				oConfig = {
					customHeaderContent: [
						oButton1, oButton2
					],
					multiSelectAction: new MultiSelectAction()
				},
				oSemanticPage = createSemanticPageFactory(_SemanticPageTypes.master, oConfig);

		var iInitFooterContentLength = 1; //multiselect action

		assert.strictEqual(oSemanticPage.getCustomHeaderContent().length, 2, "getCustomHeaderContent has correct content length");
		assert.strictEqual(oSemanticPage._getInternalHeader().getContentRight().length, (iInitFooterContentLength + 2), "inner footer content has correct content length");

		assert.strictEqual(oSemanticPage.getCustomHeaderContent()[0], oButton1, "getCustomHeaderContent retrieves the correct content");
		assert.strictEqual(oSemanticPage._getInternalHeader().getContentRight()[0], oButton1, "inner header has the correct content");

		assert.strictEqual(oSemanticPage.indexOfCustomHeaderContent(oButton1), 0, "index of the first header content item  is 0");
		assert.strictEqual(oSemanticPage._getInternalHeader().indexOfContentRight(oButton1), 0, "inner header has the correct index 0");

		assert.strictEqual(oSemanticPage.indexOfCustomHeaderContent(oButton2), 1, "index of the second header content item is 1");
		assert.strictEqual(oSemanticPage._getInternalHeader().indexOfContentRight(oButton2), 1, "inner header has the correct index 1");

		var oInsertResult = oSemanticPage.insertCustomHeaderContent(oTitle, 1);
		assert.strictEqual(oInsertResult, oSemanticPage, "insert method returns the semantic page");
		assert.strictEqual(oSemanticPage.indexOfCustomHeaderContent(oTitle), 1, "index of the inserted header content is 1");
		assert.strictEqual(oSemanticPage._getInternalHeader().indexOfContentRight(oTitle), 1, "index of the inner inserted header content is 1");

		var oRemoveResult = oSemanticPage.removeCustomHeaderContent(oButton1);
		assert.strictEqual(oRemoveResult, oButton1, "remove method returns the removed content");
		assert.ok(oSemanticPage.getCustomHeaderContent()[0] !== oButton1, "Button 1 is removed from the aggregation");
		assert.ok(oSemanticPage._getInternalHeader().getContentRight()[1] !== oButton1, "Button 1 is removed from the inner header aggregation");

		var oRemoveAllResult = oSemanticPage.removeAllCustomHeaderContent();
		assert.strictEqual(oRemoveAllResult.length, 2, "removeAll method reurns all removed content");
		assert.strictEqual(oSemanticPage.getCustomHeaderContent().length, 0, "all content is removed");
		assert.strictEqual(oSemanticPage._getInternalHeader().getContentRight().length, iInitFooterContentLength, "all content is removed");

		var oAddResult = oSemanticPage.addCustomHeaderContent(oButton3);
		assert.strictEqual(oAddResult, oSemanticPage, "insert method returns the semantic page");
		assert.strictEqual(oSemanticPage.getCustomHeaderContent().length, 1, "A button is added to the custom header content");
		assert.strictEqual(oSemanticPage._getInternalHeader().getContentRight().length, (iInitFooterContentLength + 1), "A button is added to the custom header content");

		oSemanticPage.destroyCustomHeaderContent();
		assert.ok(oButton3.bIsDestroyed, "custom innner content is destroyed");
		assert.strictEqual(oSemanticPage.getCustomHeaderContent().length, 0, "no custom header content is available");

		oSemanticPage.destroy();
	});

	QUnit.test("CustomHeaderContent binding for page with pagingAction", function (assert) {
		// Arrange
		var oModel = new JSONModel({
			data: [{
				text: "Custom",
				tooltip: "Martin",
				buttonType: "Reject"
			}
			]
		});

		var oPage = new DetailPage({
			customHeaderContent: {
				path: "/data",
				template: new Button({
							text: "{text}",
							tooltip: "{tooltip}",
							type: "{buttonType}"
						}
				)
			},
			pagingAction: new PagingButton()
		});

		oPage.setModel(oModel);

		var iInitFooterContentLength = 1; //paging button

		assert.strictEqual(oPage.getCustomHeaderContent().length, 1, "page has custom header content");
		assert.strictEqual(oPage._getInternalHeader().getContentRight().length, (1 + iInitFooterContentLength), "page has custom header content");

		var oButton = oPage.getCustomHeaderContent()[0];
		assert.strictEqual(oButton.getText(), "Custom", "content has correct text");
		assert.strictEqual(oButton.getType(), "Reject", "content has correct button type");
		assert.strictEqual(oButton.getTooltip(), "Martin", "content has correct tooltip");

		var oInnerButton = oPage._getInternalHeader().getContentRight()[0];
		assert.strictEqual(oInnerButton, oButton, "inner header has correct content");

		// Clean up
		oPage.destroy();
	});

	QUnit.test("CustomHeaderContent binding for page with multiSelectAction", function (assert) {
		// Arrange
		var oModel = new JSONModel({
			data: [{
				text: "Custom",
				tooltip: "Martin",
				buttonType: "Reject"
			}
			]
		});

		var oPage = new MasterPage({
			customHeaderContent: {
				path: "/data",
				template: new Button({
							text: "{text}",
							tooltip: "{tooltip}",
							type: "{buttonType}"
						}
				)
			},
			multiSelectAction: new MultiSelectAction()
		});

		oPage.setModel(oModel);

		var iInitFooterContentLength = 1; //multiselect button

		assert.strictEqual(oPage.getCustomHeaderContent().length, 1, "page has custom header content");
		assert.strictEqual(oPage._getInternalHeader().getContentRight().length, (1 + iInitFooterContentLength), "page has custom header content");

		var oButton = oPage.getCustomHeaderContent()[0];
		assert.strictEqual(oButton.getText(), "Custom", "content has correct text");
		assert.strictEqual(oButton.getType(), "Reject", "content has correct button type");
		assert.strictEqual(oButton.getTooltip(), "Martin", "content has correct tooltip");

		var oInnerButton = oPage._getInternalHeader().getContentRight()[0];
		assert.strictEqual(oInnerButton, oButton, "inner header has correct content");

		// Clean up
		oPage.destroy();
	});

	QUnit.test("CustomFooterContent", function (assert) {

		var oButton1 = new Button(),
				oButton2 = new Button(),
				oButton3 = new Button(),
				oTitle = new Title(),
				oConfig = {
					customFooterContent: [
						oButton1, oButton2
					]
				},
				oSemanticPage = createSemanticPageFactory(null, oConfig);

		var iInitFooterContentLength = 1; //spacer

		assert.strictEqual(oSemanticPage.getCustomFooterContent().length, 2, "getCustomFooterContent has correct content length");
		assert.strictEqual(oSemanticPage._getPage().getFooter().getContent().length, (iInitFooterContentLength + 2), "inner footer content has correct content length");

		assert.strictEqual(oSemanticPage.getCustomFooterContent()[0], oButton1, "getCustomFooterContent retrieves the correct content");
		assert.strictEqual(oSemanticPage._getPage().getFooter().getContent()[1], oButton1, "inner footer has the correct content"); //spacer is the first item

		assert.strictEqual(oSemanticPage.indexOfCustomFooterContent(oButton1), 0, "index of the first footer content item  is 0");
		assert.strictEqual(oSemanticPage._getPage().getFooter().indexOfContent(oButton1), 1, "inner footer has the correct index 1"); //spacer is the first item

		assert.strictEqual(oSemanticPage.indexOfCustomFooterContent(oButton2), 1, "index of the second footer content item is 1");
		assert.strictEqual(oSemanticPage._getPage().getFooter().indexOfContent(oButton2), 2, "inner footer has the correct index 2"); //spacer is the first item

		var oInsertResult = oSemanticPage.insertCustomFooterContent(oTitle, 1);
		assert.strictEqual(oInsertResult, oSemanticPage, "insert method returns the semantic page");
		assert.strictEqual(oSemanticPage.indexOfCustomFooterContent(oTitle), 1, "index of the inserted Footer content is 1");
		assert.strictEqual(oSemanticPage._getPage().getFooter().indexOfContent(oTitle), 2, "index of the inner inserted Footer content is 2"); //spacer is the first item

		var oRemoveResult = oSemanticPage.removeCustomFooterContent(oButton1);
		assert.strictEqual(oRemoveResult, oButton1, "remove method returns the removed content");
		assert.ok(oSemanticPage.getCustomFooterContent()[0] !== oButton1, "Button 1 is removed from the aggregation");
		assert.ok(oSemanticPage._getPage().getFooter().getContent()[1] !== oButton1, "Button 1 is removed from the inner footer aggregation");

		var oRemoveAllResult = oSemanticPage.removeAllCustomFooterContent();
		assert.strictEqual(oRemoveAllResult.length, 2, "removeAll method reurns all removed content");
		assert.strictEqual(oSemanticPage.getCustomFooterContent().length, 0, "all content is removed");
		assert.strictEqual(oSemanticPage._getPage().getFooter().getContent().length, iInitFooterContentLength, "all content is removed");

		var oAddResult = oSemanticPage.addCustomFooterContent(oButton3);
		assert.strictEqual(oAddResult, oSemanticPage, "insert method returns the semantic page");
		assert.strictEqual(oSemanticPage.getCustomFooterContent().length, 1, "A button is added to the custom Footer content");
		assert.strictEqual(oSemanticPage._getPage().getFooter().getContent().length, (iInitFooterContentLength + 1), "A button is added to the custom Footer content");

		oSemanticPage.destroyCustomFooterContent();
		assert.ok(oButton3.bIsDestroyed, "custom innner content is destroyed");
		assert.strictEqual(oSemanticPage.getCustomFooterContent().length, 0, "no custom Footer content is available");

		oSemanticPage.destroy();
	});

	QUnit.test("CustomFooterContent binding", function (assert) {
		// Arrange
		var oModel = new JSONModel({
			data: [{
				text: "Custom",
				tooltip: "Martin",
				buttonType: "Reject"
			}
			]
		});

		var oPage = new DetailPage({
			customFooterContent: {
				path: "/data",
				template: new Button({
							text: "{text}",
							tooltip: "{tooltip}",
							type: "{buttonType}"
						}
				)
			}
		});

		oPage.setModel(oModel);

		var iInitFooterContentLength = 1; //spacer

		assert.strictEqual(oPage.getCustomFooterContent().length, 1, "page has custom footer content");
		assert.strictEqual(oPage._getPage().getFooter().getContent().length, (1 + iInitFooterContentLength), "page has custom footer content");

		var oButton = oPage.getCustomFooterContent()[0];
		assert.strictEqual(oButton.getText(), "Custom", "content has correct text");
		assert.strictEqual(oButton.getType(), "Reject", "content has correct button type");
		assert.strictEqual(oButton.getTooltip(), "Martin", "content has correct tooltip");

		var oInnerButton = oPage._getPage().getFooter().getContent()[1];
		assert.strictEqual(oInnerButton, oButton, "inner footer has correct content");

		// Clean up
		oPage.destroy();
	});

	QUnit.test("CustomShareMenuContent", function (assert) {

		var oButton1 = new Button({text: "button1"}),
				oButton2 = new Button({text: "button2"}),
				oButton3 = new Button({text: "button3"}),
				oButton4 = new Button({text: "button3"}),

				oConfig = {
					customShareMenuContent: [
						oButton1, oButton2
					]
				},
				oSemanticPage = createSemanticPageFactory(_SemanticPageTypes.detail, oConfig);

		assert.strictEqual(oSemanticPage.getCustomShareMenuContent().length, 2, "getCustomShareMenuContent has correct content length");
		assert.strictEqual(oSemanticPage._getActionSheet().getButtons().length, 2, "inner menu content has correct content length");

		assert.strictEqual(oSemanticPage.getCustomShareMenuContent()[0], oButton1, "getCustomShareMenuContent retrieves the correct content[0]");
		assert.strictEqual(oSemanticPage.indexOfCustomShareMenuContent(oButton1), 0, "index of the inner content is 0");
		//assert.strictEqual(oSemanticPage._getActionSheet().indexOfContent(oButton1), 0, "index of the inner page content is 0");

		assert.strictEqual(oSemanticPage.getCustomShareMenuContent()[1], oButton2, "getCustomShareMenuContent retrieves the correct content[1]");
		assert.strictEqual(oSemanticPage.indexOfCustomShareMenuContent(oButton2), 1, "index of the inner content is 1");
		//assert.strictEqual(oSemanticPage._getSegmentedShareMenu().indexOfContent(oButton2), 1, "index of the inner page content is 1");

		var oInsertResult = oSemanticPage.insertCustomShareMenuContent(oButton4, 1);
		assert.strictEqual(oInsertResult, oSemanticPage, "insert method returns semanticPage reference");
		assert.strictEqual(oSemanticPage.indexOfCustomShareMenuContent(oButton4), 1, "index of the inserted inner content is 1");
		//assert.strictEqual(oSemanticPage._getSegmentedShareMenu().indexOfContent(oButton4), 1, "index of the inserted inner page content is 1");

		var oRemoveResult = oSemanticPage.removeCustomShareMenuContent(oButton1);
		assert.strictEqual(oRemoveResult, oButton1, "remove method returns remove content reference");
		assert.ok(oSemanticPage.getCustomShareMenuContent()[0] !== oButton1, "Button 1 is removed from the aggregation");
		//assert.ok(oSemanticPage._getSegmentedShareMenu().getContent()[0] !== oButton1, "Button 1 is removed from the inner page aggregation");

		var oRemoveAllResult = oSemanticPage.removeAllCustomShareMenuContent();
		assert.strictEqual(oRemoveAllResult.length, 2, "removeAll method returns all removed content");
		assert.strictEqual(oSemanticPage.getCustomShareMenuContent().length, 0, "all content is removed");
		//assert.strictEqual(oSemanticPage._getSegmentedShareMenu().getContent().length, 0, "all inner page content is removed");

		var oAddResult = oSemanticPage.addCustomShareMenuContent(oButton3);
		assert.strictEqual(oAddResult, oSemanticPage, "add method returns semanticPage reference");
		assert.strictEqual(oSemanticPage.getCustomShareMenuContent().length, 1, "A button is added to the custom inner content");
		//assert.strictEqual(oSemanticPage._getSegmentedShareMenu().getContent().length, 1, "A button is added to the inner page content");

		oSemanticPage.destroyCustomShareMenuContent();
		assert.ok(oButton3.bIsDestroyed, "custom innner content is destroyed");
		assert.strictEqual(oSemanticPage.getCustomShareMenuContent().length, 0, "no custom inner content is available");
		//assert.strictEqual(oSemanticPage._oWrappedShareMenu.getContent().length, 0, "no inner page content is available");

		oSemanticPage.destroy();
	});

	QUnit.test("CustomShareMenuContent binding", function (assert) {
		// Arrange
		var oModel = new JSONModel({
			data: [{
				text: "Custom1",
				tooltip: "Martin",
				buttonType: "Reject"
			},
				{
					text: "Custom2",
					tooltip: "CustomTooltip",
					buttonType: "Emphasized"
				}
			]
		});

		var oPage = new DetailPage({
			customShareMenuContent: {
				path: "/data",
				template: new Button({
							text: "{text}",
							tooltip: "{tooltip}",
							type: "{buttonType}"
						}
				)
			}
		});

		oPage.setModel(oModel);

		assert.strictEqual(oPage.getCustomShareMenuContent().length, 2, "page has custom shareMenu content");
		assert.strictEqual(oPage._getActionSheet().getButtons().length, 2, "page has custom shareMenu content");

		var oButton1 = oPage.getCustomShareMenuContent()[0];
		assert.strictEqual(oButton1.getText(), "Custom1", "content has correct text");
		assert.strictEqual(oButton1.getType(), "Reject", "content has correct button type");
		assert.strictEqual(oButton1.getTooltip(), "Martin", "content has correct tooltip");

		var oInnerButton1 = oPage._getActionSheet().getButtons()[0];
		assert.strictEqual(oInnerButton1, oButton1, "inner menu has correct content");

		var oButton2 = oPage.getCustomShareMenuContent()[1];
		assert.strictEqual(oButton2.getText(), "Custom2", "content has correct text");
		//assert.strictEqual(oButton2.getType(), "Emphasized", "content has correct button type"); TODO: check why emphasized is lost in the action sheet
		assert.strictEqual(oButton2.getTooltip(), "CustomTooltip", "content has correct tooltip");

		var oInnerButton2 = oPage._getActionSheet().getButtons()[1];
		assert.strictEqual(oInnerButton2, oButton2, "inner menu has correct content");

		// Clean up
		oPage.destroy();
	});

	QUnit.test("set positiveAction", function (assert) {

		//setup
		var oPage = new DetailPage();
		var oPositiveAction = new PositiveAction();

		//act
		var oResult = oPage.setPositiveAction(oPositiveAction);
		var iInitFooterContentLength = 2; //spacer + shareMenuButton

		assert.strictEqual(oPage.getPositiveAction(), oPositiveAction, "page has positive action");
		assert.strictEqual(oPage._getPage().getFooter().getContent().length, (1 + iInitFooterContentLength), "footer has semantic content");
		assert.strictEqual(oResult, oPage, "setPositiveAction returns reference to page");

		// Clean up
		oPage.destroy();
	});

	QUnit.test("replace positiveAction", function (assert) {

		//setup
		var oPage = new DetailPage();
		var oPositiveAction1 = new PositiveAction();
		var oPositiveAction2 = new PositiveAction();

		//act
		oPage.setPositiveAction(oPositiveAction1);
		oPage.setPositiveAction(oPositiveAction2); //replace
		var iInitFooterContentLength = 2; //spacer + shareMenuButton

		assert.strictEqual(oPage.getPositiveAction(), oPositiveAction2, "page has the latest set positive action");
		assert.strictEqual(oPage._getPage().getFooter().getContent().length, (1 + iInitFooterContentLength), "footer has correct number of semantic content");

		// Clean up
		oPage.destroy();
	});

	QUnit.test("remove positiveAction via set to null", function (assert) {

		//setup
		var oPage = new DetailPage();
		var oPositiveAction = new PositiveAction();

		oPage.setPositiveAction(oPositiveAction);
		var iInitFooterContentLength = 2; //spacer + shareMenuButton

		assert.equal(oPage.getPositiveAction(), oPositiveAction, "page has positive action");
		assert.strictEqual(oPage._getPage().getFooter().getContent().length, (1 + iInitFooterContentLength), "footer has semantic content");

		//act
		oPage.setPositiveAction(null);
		var oRevievedAction = oPage.getPositiveAction();
		assert.equal(oRevievedAction, null, "page has no positive action");
		assert.strictEqual(oPage._getPage().getFooter().getContent().length, (iInitFooterContentLength), "footer does not have semantic content");

		// Clean up
		oPage.destroy();
	});

	QUnit.test("remove positiveAction via set to undefined", function (assert) {

		//setup
		var oPage = new DetailPage();
		var oPositiveAction = new PositiveAction();

		oPage.setPositiveAction(oPositiveAction);
		var iInitFooterContentLength = 2; //spacer + shareMenuButton

		assert.equal(oPage.getPositiveAction(), oPositiveAction, "page has positive action");
		assert.strictEqual(oPage._getPage().getFooter().getContent().length, (1 + iInitFooterContentLength), "footer has semantic content");

		//act
		oPage.setPositiveAction(undefined);
		var oRevievedAction = oPage.getPositiveAction();
		assert.equal(oRevievedAction, null, "page has no positive action");
		assert.strictEqual(oPage._getPage().getFooter().getContent().length, (iInitFooterContentLength), "footer does not have semantic content");

		// Clean up
		oPage.destroy();
	});

	QUnit.test("destroy positiveAction", function (assert) {

		//setup
		var oPage = new DetailPage();
		var oPositiveAction = new PositiveAction();

		oPage.setPositiveAction(oPositiveAction);
		var iInitFooterContentLength = 2; //spacer + shareMenuButton

		assert.equal(oPage.getPositiveAction(), oPositiveAction, "page has positive action");
		assert.strictEqual(oPage._getPage().getFooter().getContent().length, (1 + iInitFooterContentLength), "footer has semantic content");

		//act
		var oResult = oPage.destroyPositiveAction(undefined);
		var oRevievedAction = oPage.getPositiveAction();
		assert.equal(oRevievedAction, null, "page has no positive action");
		assert.strictEqual(oPage._getPage().getFooter().getContent().length, (iInitFooterContentLength), "footer does not have semantic content");
		assert.strictEqual(oPositiveAction.bIsDestroyed, true, "action is destroyed");
		assert.strictEqual(oResult, oPage, "destroyPositiveAction returns reference to page");

		// Clean up
		oPage.destroy();
	});

	QUnit.test("set saveAsTileAction", function (assert) {

		//setup
		var oPage = new DetailPage();
		var oSaveAsTileAction = new Button({text: "Save as tile"});

		//act
		oPage.setSaveAsTileAction(oSaveAsTileAction);
		var iInitFooterContentLength = 2; //spacer + shareMenuButton

		var oRetrievedAction = oPage.getSaveAsTileAction();
		assert.equal(oRetrievedAction, oSaveAsTileAction, "page has saveAsTile action");
		assert.strictEqual(oPage._getPage().getFooter().getContent().length, iInitFooterContentLength, "footer has initial content");
		assert.strictEqual(oPage._getActionSheet().getButtons().length, 0, "shareMenu has correct length"); //save as tile has replaced shareButton
		assert.strictEqual(oPage._getPage().getFooter().getContent()[1], oSaveAsTileAction, "footer contains saveAsTile button");

		// Clean up
		oPage.destroy();
	});

	QUnit.test("remove saveAsTileAction by setting it to null", function (assert) {

		//setup
		var oPage = new DetailPage();
		var oSaveAsTileAction = new Button({text: "Save as tile"});
		var iInitFooterContentLength = 2; //spacer + shareMenuButton
		oPage.setSaveAsTileAction(oSaveAsTileAction);
		assert.equal(oPage.getSaveAsTileAction(), oSaveAsTileAction, "page has saveAsTile action");

		//act
		oPage.setSaveAsTileAction(null);

		//check
		assert.equal(oPage.getSaveAsTileAction(), null, "page no longer has saveAsTile action");
		assert.strictEqual(oPage._getActionSheet().getButtons().length, 0, "shareMenu has correct length");
		assert.strictEqual(oPage._getPage().getFooter().getContent().length, iInitFooterContentLength, "footer has initial content");

		// Clean up
		oPage.destroy();
	});

	QUnit.test("remove saveAsTileAction by setting it to undefined", function (assert) {

		//setup
		var oPage = new DetailPage();
		var oSaveAsTileAction = new Button({text: "Save as tile"});
		var iInitFooterContentLength = 2; //spacer + shareMenuButton
		oPage.setSaveAsTileAction(oSaveAsTileAction);
		assert.equal(oPage.getSaveAsTileAction(), oSaveAsTileAction, "page has saveAsTile action");

		//act
		oPage.setSaveAsTileAction(undefined);

		//check
		assert.equal(oPage.getSaveAsTileAction(), null, "page no longer has saveAsTile action");
		assert.strictEqual(oPage._getActionSheet().getButtons().length, 0, "shareMenu has correct length");
		assert.strictEqual(oPage._getPage().getFooter().getContent().length, iInitFooterContentLength, "footer has initial content");

		// Clean up
		oPage.destroy();
	});

	QUnit.test("destroy saveAsTileAction", function (assert) {

		//setup
		var oPage = new DetailPage();
		var oSaveAsTileAction = new Button({text: "Save as tile"});
		var iInitFooterContentLength = 2; //spacer + shareMenuButton
		oPage.setSaveAsTileAction(oSaveAsTileAction);
		assert.equal(oPage.getSaveAsTileAction(), oSaveAsTileAction, "page has saveAsTile action");

		//act
		oPage.destroySaveAsTileAction();

		//check
		assert.equal(oPage.getSaveAsTileAction(), null, "page no longer has saveAsTile action");
		assert.strictEqual(oPage._getActionSheet().getButtons().length, 0, "shareMenu has correct length");
		assert.strictEqual(oPage._getPage().getFooter().getContent().length, iInitFooterContentLength, "footer has initial content");
		assert.strictEqual(oSaveAsTileAction.bIsDestroyed, true, "button is destroyed");

		// Clean up
		oPage.destroy();
	});

	QUnit.test("set paging action", function (assert) {

		//setup
		var oPage = new DetailPage();
		var oPagingAction = new PagingButton();

		//act
		oPage.setPagingAction(oPagingAction);

		//check
		assert.strictEqual(oPage.getPagingAction(), oPagingAction, "page has paging action");
		assert.strictEqual(oPage._getInternalHeader().getContentRight().length, 1, "header has expected length");
		assert.strictEqual(oPage._getInternalHeader().getContentRight()[0], oPagingAction, "header contains paging button");

		// Clean up
		oPage.destroy();
	});

	QUnit.test("remove paging action by setting it to null", function (assert) {

		//setup
		var oPage = new DetailPage();
		var oPagingAction = new PagingButton();

		//act
		oPage.setPagingAction(oPagingAction);
		oPage.setPagingAction(null);

		//check
		assert.strictEqual(oPage.getPagingAction(), null, "page has paging action");
		assert.strictEqual(oPage._getInternalHeader().getContentRight().length, 0, "header has expected length");

		// Clean up
		oPage.destroy();
	});

	QUnit.test("remove paging action by setting it to undefined", function (assert) {

		//setup
		var oPage = new DetailPage();
		var oPagingAction = new PagingButton();

		//act
		oPage.setPagingAction(oPagingAction);
		oPage.setPagingAction(undefined);

		//check
		assert.strictEqual(oPage.getPagingAction(), null, "page has paging action");
		assert.strictEqual(oPage._getInternalHeader().getContentRight().length, 0, "header has expected length");

		// Clean up
		oPage.destroy();
	});

	QUnit.test("destroy paging action", function (assert) {

		//setup
		var oPage = new DetailPage();
		var oPagingAction = new PagingButton();

		//act
		oPage.setPagingAction(oPagingAction);
		oPage.destroyPagingAction();

		//check
		assert.strictEqual(oPage.getPagingAction(), null, "page has paging action");
		assert.strictEqual(oPage._getInternalHeader().getContentRight().length, 0, "header has expected length");
		assert.strictEqual(oPagingAction.bIsDestroyed, true, "button is destroyed");

		// Clean up
		oPage.destroy();
	});

	/*
	//TODO: verify this test is probably not relevant anymore because we do not have multiple element semantic aggregations anymore

	QUnit.test("SemanticControls binding", function (assert) {
		// Arrange
		var oModel = new sap.ui.model.json.JSONModel({
			data: [{
				tooltip: "Martin",
				text: "Positive"
			}
			]
		});

		var oPage = new sap.m.semantic.DetailPage({
			positiveAction: {
				path: "/data",
				template: new sap.m.semantic.PositiveAction({
							tooltip: "{tooltip}",
							text: "{text}"
						}
				)
			}
		});

		oPage.setModel(oModel);

		var iInitFooterContentLength = 2; //spacer + shareMenuButton

		assert.notEqual(oPage.getPositiveAction(), null, "page has semantic content");
		assert.strictEqual(oPage._getPage().getFooter().getContent().length, (1 + iInitFooterContentLength), "footer has semantic content");

		var oButton = oPage.getPositiveAction();
		//assert.strictEqual(oButton.getTooltip(), "Martin", "content has correct tooltip");
		//assert.strictEqual(oButton.getText(), "Positive", "content has correct tooltip");

		// Clean up
		oPage.destroy();
	}); */

	QUnit.module("Semantic Share Button should behave correctly", {
		beforeEach: function () {
		},

		afterEach: function () {
			jQuery("#qunit-fixture-visible").html("");
		}
	});

	QUnit.test("Semantic share button should be always at the rightmost position", function (assert) {
		// Arrange
		var oDetailPage = createSemanticPageFactory(_SemanticPageTypes.detail, {
					customShareMenuContent: [new Button("customBtnId", {text: "custom"})]
				}),
				oFlagButton = new FlagAction(),
				oFavorite = new FavoriteAction(),
				iFooterContentLength = oDetailPage._getPage().getFooter().getContent().length,
				oExpectedButton = oDetailPage._getPage().getFooter().getContent()[iFooterContentLength - 1];

		function _getActualButton() {
			var content = oDetailPage._getPage().getFooter().getContent();
			return content[content.length - 1];
		}

		// Assert
		assert.strictEqual(_getActualButton(), oExpectedButton, "Semantic share button is correctly positioned last by default");

		// Act
		oDetailPage.setFlagAction(oFlagButton);

		// Assert
		assert.strictEqual(_getActualButton(), oExpectedButton, "Semantic share button is correctly positioned last even if new content is added");

		// Act
		var content = oDetailPage._getPage().getFooter().getContent();
		oDetailPage.setFavoriteAction(oFavorite);

		// Assert
		assert.strictEqual(_getActualButton(), oExpectedButton, "Semantic share button is correctly positioned last even if new content is inserted at the last index");

		// Clean up
		oDetailPage.destroy();
		oFlagButton.destroy();
		oFavorite.destroy();
	});

	QUnit.test("Share button's should not go into overflow", function (assert) {
		// Arrange
		var oDetailPage = createSemanticPageFactory(_SemanticPageTypes.detail, {
					customShareMenuContent: [
						new Button({text: "custom1"}),
						new Button({text: "custom2"})]
				}),
				iFooterContentLength = oDetailPage._getPage().getFooter().getContent().length,
				oShareButton = oDetailPage._getPage().getFooter().getContent()[iFooterContentLength - 1];


		var layout = oShareButton.getLayoutData(),
				sPriority = layout.getPriority(),
				sExpectedPriority = OverflowToolbarPriority.NeverOverflow;

		assert.strictEqual(layout.getPriority(), sExpectedPriority, "The share button has correct priority: NeverOverflow");

		// Clean up
		oDetailPage.destroy();
	});

	QUnit.module("Using custom content in the footer should preserve its correct state", {
		beforeEach: function () {
		},

		afterEach: function () {
			jQuery("#qunit-fixture-visible").html("");
		}
	});

	QUnit.test('Footer custom right section should hold correct content', function (assert) {
		var oLabel = new Label({text: "CustomLblRight"}),
				oSecondLabel = new Label({text: "CustomLbl2"}),
				oButton = new Button({text: "CustomBtnRight"}),
				oSemanticButton = new EditAction(),
				oDetailPage = createSemanticPageFactory(_SemanticPageTypes.detail, {
					customFooterContent: [oLabel, oButton]
				});

		// Act
		var bCustomButtonIsContained = oDetailPage.indexOfCustomFooterContent(oButton) >= 0;

		// Assert
		assert.strictEqual(bCustomButtonIsContained, true, "The custom footer section correctly contains the custom content");

		// Act
		oDetailPage.removeCustomFooterContent(oButton);
		var bCustomButtonIsRemoved = oDetailPage.indexOfCustomFooterContent(oButton) < 0;

		// Assert
		assert.strictEqual(bCustomButtonIsRemoved, true, "The item has been correctly removed");

		// Assert
		assert.throws(function () {
			oDetailPage.addCustomFooterContent(oSemanticButton);
		}, "correctly throws an error when semantic content is added");

		oDetailPage.destroy();
		oLabel.destroy();
		oSemanticButton.destroy();
		oButton.destroy();
	});

	QUnit.module("SemanticControls positioning");

	/*test("SemanticControls are positioned in the correct inner aggregation", function () {
		// Arrange
		var oModel = new sap.ui.model.json.JSONModel({
			data: [{ type: sap.m.semantic.SemanticType.Edit },
				{ type: sap.m.semantic.SemanticType.Save },
				{ type: sap.m.semantic.SemanticType.Cancel },
				{ type: sap.m.semantic.SemanticType.Approve },
				{ type: sap.m.semantic.SemanticType.Reject },
				{ type: sap.m.semantic.SemanticType.Forward },
				{ type: sap.m.semantic.SemanticType.Flag },
				{ type: sap.m.semantic.SemanticType.Favorite },
				{ type: sap.m.semantic.SemanticType.Add },
				{ type: sap.m.semantic.SemanticType.SendEmail },
				{ type: sap.m.semantic.SemanticType.DiscussInJam },
				{ type: sap.m.semantic.SemanticType.ShareInJam },
				{ type: sap.m.semantic.SemanticType.SendMessage },
				{ type: sap.m.semantic.SemanticType.Print },
				{ type: sap.m.semantic.SemanticType.MessagesIndicator }
			]
		});

		var oPage = new sap.m.semantic.DetailPage({
			semanticControls: {
				path: "/data",
				template: new sap.m.semantic.SemanticButton({
							type:  "{type}"
						}
				)
			},
			customFooterContent: [
				new sap.m.OverflowToolbarButton({
					icon: "sap-icon://task",
					text: "Custom1"
				}),
				new sap.m.Button({
					text: "Custom2"
				})
			]
		});

		oPage.setModel(oModel);

		var iInitFooterContentLength = 2; //spacer + shareMenuButton
		var iCustomFooterContentLength = 2;

		assert.strictEqual(oPage.getSemanticControls().length, 15, "page has semantic content");
		assert.strictEqual(oPage._getPage().getFooter().getContent().length, (10 + iInitFooterContentLength + iCustomFooterContentLength), "footer has semantic content");
		assert.strictEqual(oPage._getSegmentedShareMenu().getSection("semantic").getContent().length, 5, "shareMenu has semantic content");

		// Clean up
		oPage.destroy();
	});

	QUnit.test("SemanticControls are positioned in correct sequence order", function (assert) {
		// Arrange
		var oModel = new sap.ui.model.json.JSONModel({
			data: [{ type: sap.m.semantic.SemanticType.Group },
				{ type: sap.m.semantic.SemanticType.Save },
				{ type: sap.m.semantic.SemanticType.Edit },
				{ type: sap.m.semantic.SemanticType.SendMessage },
				{ type: sap.m.semantic.SemanticType.Cancel },
				{ type: sap.m.semantic.SemanticType.Reject },
				{ type: sap.m.semantic.SemanticType.Forward },
				{ type: sap.m.semantic.SemanticType.DiscussInJam },
				{ type: sap.m.semantic.SemanticType.Approve },
				{ type: sap.m.semantic.SemanticType.Filter },
				{ type: sap.m.semantic.SemanticType.Sort },
				{ type: sap.m.semantic.SemanticType.Flag },
				{ type: sap.m.semantic.SemanticType.Favorite },
				{ type: sap.m.semantic.SemanticType.Add },
				{ type: sap.m.semantic.SemanticType.SendEmail },
				{ type: sap.m.semantic.SemanticType.ShareInJam },
				{ type: sap.m.semantic.SemanticType.Print },
				{ type: sap.m.semantic.SemanticType.MessagesIndicator }
			]
		});

		var oPage = new sap.m.semantic.DetailPage({
			semanticControls: {
				path: "/data",
				template: new sap.m.semantic.SemanticButton({
							type:  "{type}"
						}
				)
			},
			customFooterContent: [
				new sap.m.OverflowToolbarButton({
					icon: "sap-icon://task",
					text: "Custom1"
				}),
				new sap.m.Button({
					text: "Custom2"
				})
			]
		});

		oPage.setModel(oModel);

		var iInitFooterContentLength = 2; //spacer + shareMenuButton
		var iCustomFooterContentLength = 2;
		var oBundle = sap.ui.getCore().getLibraryResourceBundle("sap.m");

		//messages indicator
		assert.strictEqual(oPage._getPage().getFooter().getContent()[0].getType(), sap.m.ButtonType.Emphasized, "MessagesIndicator button type is Accept");
		assert.strictEqual(oPage._getPage().getFooter().getContent()[0].getIcon(), "sap-icon://alert", "MessagesIndicator button icon");

		//spacer
		assert.strictEqual(oPage._getPage().getFooter().getContent()[1] instanceof sap.m.ToolbarSpacer, true, "contains spacer");

		//edit
		assert.strictEqual(oPage._getPage().getFooter().getContent()[2].getText(), oBundle.getText("SEMANTIC_CONTROL_EDIT"), "Edit button type has correct text");
		assert.strictEqual(oPage._getPage().getFooter().getContent()[2].getType(), sap.m.ButtonType.Emphasized, "Edit button type is Emphasized");

		//save
		assert.strictEqual(oPage._getPage().getFooter().getContent()[3].getText(), oBundle.getText("SEMANTIC_CONTROL_SAVE"), "Save button type has correct text");
		assert.strictEqual(oPage._getPage().getFooter().getContent()[3].getType(), sap.m.ButtonType.Emphasized, "Save button type is Emphasized");

		//cancel
		assert.strictEqual(oPage._getPage().getFooter().getContent()[4].getText(), oBundle.getText("SEMANTIC_CONTROL_CANCEL"), "Cancel button type has correct text");
		assert.strictEqual(oPage._getPage().getFooter().getContent()[4].getType(), sap.m.ButtonType.Default, "Cancel button type is of Default type");

		//approve
		assert.strictEqual(oPage._getPage().getFooter().getContent()[5].getText(), oBundle.getText("SEMANTIC_CONTROL_APPROVE"), "Approve button type has correct text");
		assert.strictEqual(oPage._getPage().getFooter().getContent()[5].getType(), sap.m.ButtonType.Accept, "Approve button type is of Accept type");

		//reject
		assert.strictEqual(oPage._getPage().getFooter().getContent()[6].getText(), oBundle.getText("SEMANTIC_CONTROL_REJECT"), "Reject button type has correct text");
		assert.strictEqual(oPage._getPage().getFooter().getContent()[6].getType(), sap.m.ButtonType.Reject, "Reject button type is of Reject type");

		//forward
		assert.strictEqual(oPage._getPage().getFooter().getContent()[7].getText(), oBundle.getText("SEMANTIC_CONTROL_FORWARD"), "Forward button type has correct text");
		assert.strictEqual(oPage._getPage().getFooter().getContent()[7].getType(), sap.m.ButtonType.Default, "Forward button type is of Default type");

		// Clean up
		oPage.destroy();
	});*/

	QUnit.module("Construction/Destruction", {
		beforeEach: function () {

		},

		afterEach: function () {
			jQuery("#qunit-fixture-visible").html("");
		}
	});

	QUnit.test("Semantic page and its internal controls are destroyed successfully", function (assert) {

		var oConfig = {
					title: "This is a title",
					showNavButton: true,
					customFooterContent: [new Button({text: "custom"})]
				},
				oSemanticPage = createSemanticPageFactory(null, oConfig),
				oPage = oSemanticPage.getAggregation("_page"),
				oFooter = oSemanticPage._getPage().getFooter();

		oSemanticPage.destroy();

		assert.strictEqual(oSemanticPage.$().length, 0, "There is no dom ref for semantic page");

		// check if all internal controls are destroyed successfully
		assert.strictEqual(oPage.bIsDestroyed, true, "page is destroyed successfully");
		assert.strictEqual(oFooter.bIsDestroyed, true, "footer is destroyed successfully");
		// check if all controls are set to null correctly
		assert.strictEqual(oSemanticPage.getAggregation("_page"), null, "page is null");
		assert.strictEqual(oSemanticPage._oWrappedFooter, null, "footer is null");
	});

	QUnit.test("Detail page and its internal controls are destroyed successfully", function (assert) {

		var oConfig = {
					title: "This is a title",
					showNavButton: true,
					customShareMenuContent: [
						new Button({text: "button1"})
					]
				},
				oSemanticPage = createSemanticPageFactory(_SemanticPageTypes.detail, oConfig),
				oActionSheet = oSemanticPage.getAggregation("_actionSheet");

		oSemanticPage.destroy();

		if (oActionSheet) {
			assert.strictEqual(oActionSheet.bIsDestroyed, true, "action sheet is destroyed successfully");
		}
		// check if all controls are set to null correctly
		assert.strictEqual(oSemanticPage.getAggregation("_actionSheet"), null, "action sheet is null");

	});
});