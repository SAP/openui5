/*global QUnit, sinon */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/m/Fiori20Adapter",
	"sap/m/Page",
	"sap/ui/thirdparty/jquery",
	"sap/ui/Device",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessagePage",
	"sap/m/Bar",
	"sap/m/Text",
	"sap/m/Button",
	"sap/m/App",
	"sap/m/Title",
	"sap/m/NavContainer",
	"sap/m/SplitContainer",
	"sap/m/HBox",
	"sap/m/SelectDialog",
	"sap/m/Dialog",
	"sap/m/Table",
	"sap/ui/core/mvc/XMLView",
	"sap/ui/core/Core"
], function(
	qutils,
	createAndAppendDiv,
	Fiori20Adapter,
	Page,
	jQuery,
	Device,
	JSONModel,
	MessagePage,
	Bar,
	Text,
	Button,
	App,
	Title,
	NavContainer,
	SplitContainer,
	HBox,
	SelectDialog,
	Dialog,
	Table,
	XMLView,
	Core
) {
	createAndAppendDiv("content");
	var styleElement = document.createElement("style");
	styleElement.textContent =
		"#p2content {" +
		"    width: 2000px;" +
		"    height: 2000px;" +
		"}" +
		"html," +
		"#content," +
		"#p3content," +
		"#p4content {" +
		"    width: 100%;" +
		"    height: 100%;" +
		"}";
	document.head.appendChild(styleElement);
	var sObjectPageView =
		"<mvc:View" +
		"        xmlns=\"sap.uxap\"" +
		"        xmlns:core=\"sap.ui.core\"" +
		"        xmlns:mvc=\"sap.ui.core.mvc\"" +
		"        xmlns:layout=\"sap.ui.layout\"" +
		"        xmlns:m=\"sap.m\"" +
		"        xmlns:f=\"sap.ui.layout.form\"" +
		"        height=\"100%\">" +
		"    <m:App>" +
		"    <ObjectPageLayout id=\"objectPageLayout\" showTitleInHeaderContent=\"true\">" +
		"        <headerTitle>" +
		"            <ObjectPageHeader id=\"headerForTest\"" +
		"                              headerDesign=\"Light\"" +
		"                              objectTitle=\"Long title that wraps and goes over more lines\"" +
		"                              showTitleSelector=\"true\"" +
		"                              showMarkers=\"true\"" +
		"                              markFavorite=\"true\"" +
		"                              markLocked=\"true\"" +
		"                              markFlagged=\"true\"" +
		"                              objectSubtitle=\"Long subtitle that wraps and goes over more lines\"" +
		"                              objectImageShape=\"Circle\"" +
		"                              objectImageURI=\"./images/imageID_275314.png\">" +
		"                <navigationBar>" +
		"                    <m:Bar>" +
		"                        <m:contentLeft>" +
		"                            <m:Button id=\"navButton\" icon=\"sap-icon://nav-back\"></m:Button>" +
		"                        </m:contentLeft>" +
		"                        <m:contentMiddle>" +
		"                            <m:Text id=\"title\" text=\"Employee Profile\"/>" +
		"                        </m:contentMiddle>" +
		"                    </m:Bar>" +
		"                </navigationBar>" +
		"                <actions>" +
		"                    <ObjectPageHeaderActionButton icon=\"sap-icon://action\" text=\"action\" importance=\"Low\"/>" +
		"                    <ObjectPageHeaderActionButton icon=\"sap-icon://action-settings\" text=\"settings\" importance=\"Low\"/>" +
		"                    <ObjectPageHeaderActionButton icon=\"sap-icon://edit\" text=\"edit\" importance=\"Medium\"/>" +
		"                    <ObjectPageHeaderActionButton icon=\"sap-icon://save\" text=\"save\" visible=\"false\"/>" +
		"                    <ObjectPageHeaderActionButton icon=\"sap-icon://refresh\" text=\"refresh\"/>" +
		"                    <ObjectPageHeaderActionButton icon=\"sap-icon://attachment\" text=\"attach\"/>" +
		"                </actions>" +
		"                <breadCrumbsLinks>" +
		"                    <m:Link text=\"Page 1 a very long link\"/>" +
		"                    <m:Link text=\"Page 2 long link\"/>" +
		"                </breadCrumbsLinks>" +
		"            </ObjectPageHeader>" +
		"        </headerTitle>" +
		"        <headerContent>" +
		"            <layout:VerticalLayout>" +
		"                <m:ObjectStatus title=\"User ID\" text=\"12345678\"/>" +
		"                <m:ObjectStatus title=\"Functional Area\" text=\"Developement\"/>" +
		"                <m:ObjectStatus title=\"Cost Center\" text=\"PI DFA GD Programs and Product\"/>" +
		"                <m:ObjectStatus title=\"Email\" text=\"email@address.com\"/>" +
		"            </layout:VerticalLayout>" +
		"            <m:Text width=\"200px\"" +
		"                    text=\"Hi, I'm Denise. I am passionate about what I do and I'll go the extra mile to make the customer win.\"/>" +
		"            <m:ObjectStatus text=\"In Stock\" state=\"Error\"/>" +
		"            <m:ObjectStatus title=\"Label\" text=\"In Stock\" state=\"Warning\"/>" +
		"            <m:ObjectNumber number=\"1000\" numberUnit=\"SOOK\" emphasized=\"false\" state=\"Success\"/>" +
		"            <m:ProgressIndicator" +
		"                    percentValue=\"30\"" +
		"                    displayValue=\"30%\"" +
		"                    showValue=\"true\"" +
		"                    state=\"None\"/>" +
		"            <layout:VerticalLayout>" +
		"                <layout:layoutData>" +
		"                    <ObjectPageHeaderLayoutData" +
		"                            showSeparatorAfter=\"false\"/>" +
		"                </layout:layoutData>" +
		"                <m:Label text=\"PC, Unrestricted-Use Stock\"/>" +
		"                <m:ObjectNumber number=\"219\" numberUnit=\"K\"></m:ObjectNumber>" +
		"            </layout:VerticalLayout>" +
		"            <layout:VerticalLayout>" +
		"                <layout:layoutData>" +
		"                    <ObjectPageHeaderLayoutData" +
		"                            visibleS=\"false\"" +
		"                            showSeparatorAfter=\"false\"/>" +
		"                </layout:layoutData>" +
		"                <m:Label text=\"PC, Not in Small Size\"/>" +
		"                <m:ObjectNumber number=\"220\" numberUnit=\"K\"></m:ObjectNumber>" +
		"            </layout:VerticalLayout>" +
		"            <layout:VerticalLayout>" +
		"                <layout:layoutData>" +
		"                    <ObjectPageHeaderLayoutData" +
		"                            visibleM=\"false\"" +
		"                            showSeparatorAfter=\"false\"/>" +
		"                </layout:layoutData>" +
		"                <m:Label text=\"PC, Not in Medium Size\"/>" +
		"                <m:ObjectNumber number=\"221\" numberUnit=\"K\"></m:ObjectNumber>" +
		"            </layout:VerticalLayout>" +
		"            <layout:VerticalLayout>" +
		"                <layout:layoutData>" +
		"                    <ObjectPageHeaderLayoutData" +
		"                            visibleL=\"false\"" +
		"                            showSeparatorAfter=\"true\"/>" +
		"                </layout:layoutData>" +
		"                <m:Label text=\"PC, Not in Large Size\"/>" +
		"                <m:ObjectNumber number=\"219\" numberUnit=\"K\"></m:ObjectNumber>" +
		"            </layout:VerticalLayout>" +
		"            <m:ObjectAttribute title=\"Label\" text=\"In Stock\"/>" +
		"            <m:Button icon=\"sap-icon://nurse\"/>" +
		"            <m:Tokenizer>" +
		"                <m:Token text=\"Wayne Enterprises\"/>" +
		"                <m:Token text=\"Big's Caramels\"/>" +
		"            </m:Tokenizer>" +
		"            <m:RatingIndicator maxValue=\"8\" class=\"sapUiSmallMarginBottom\" value=\"4\" tooltip=\"Rating Tooltip\"/>" +
		"        </headerContent>" +
		"        <sections>" +
		"            <ObjectPageSection title=\"2014 Goals Plan\">" +
		"                <subSections>" +
		"                    <ObjectPageSubSection title=\" \">" +
		"                        <blocks>" +
		"                            <f:SimpleForm" +
		"                                    maxContainerCols=\"1\"" +
		"                                    layout=\"ResponsiveGridLayout\"" +
		"                                    width=\"100%\">" +
		"                                <layout:VerticalLayout>" +
		"                                    <m:Label text=\"Evangelize the UI framework accross the company\" design=\"Bold\"/>" +
		"                                    <m:Text text=\"4 days overdue Cascaded\"/>" +
		"                                    <m:Text text=\" \"/>" +
		"                                    <m:Label text=\"Get trained in development management direction\" design=\"Bold\"/>" +
		"                                    <m:Text text=\"Due Nov 21\"/>" +
		"                                    <m:Text text=\" \"/>" +
		"                                    <m:Label text=\"Mentor junior developers\" design=\"Bold\"/>" +
		"                                    <m:Text text=\"Due Dec 31 Cascaded\"/>" +
		"                                </layout:VerticalLayout>" +
		"                            </f:SimpleForm>" +
		"                        </blocks>" +
		"                    </ObjectPageSubSection>" +
		"                </subSections>" +
		"            </ObjectPageSection>" +
		"            <ObjectPageSection title=\"Personal\">" +
		"                <subSections>" +
		"                    <ObjectPageSubSection title=\"Connect\">" +
		"                        <blocks>" +
		"                            <f:SimpleForm labelSpanL=\"4\" labelSpanM=\"4\"" +
		"                                          labelSpanS=\"4\" emptySpanL=\"0\" emptySpanM=\"0\" emptySpanS=\"0\"" +
		"                                          maxContainerCols=\"2\" layout=\"ResponsiveLayout\">" +
		"                                <core:Title text=\"Main Payment Method\"/>" +
		"                                <m:Label text=\"Bank Transfer\"/>" +
		"                                <layout:VerticalLayout>" +
		"                                    <m:Text text=\"Sparkasse Heimfeld, Germany\"/>" +
		"                                    <m:Text text=\"Account 458784545\"/>" +
		"                                </layout:VerticalLayout>" +
		"                            </f:SimpleForm>" +
		"                            <f:SimpleForm labelSpanL=\"4\" labelSpanM=\"4\"" +
		"                                              labelSpanS=\"4\" emptySpanL=\"0\" emptySpanM=\"0\" emptySpanS=\"0\"" +
		"                                              maxContainerCols=\"2\" layout=\"ResponsiveLayout\">" +
		"                                <core:Title text=\"Payment method for Expenses\"/>" +
		"                                <m:Label text=\"Extra Travel Expenses\"/>" +
		"                                <m:Text text=\"Cash 100 USD\"/>" +
		"                            </f:SimpleForm>" +
		"                        </blocks>" +
		"                    </ObjectPageSubSection>" +
		"                    <ObjectPageSubSection id=\"paymentSubSection\" title=\"Payment information\">" +
		"                        <blocks>" +
		"                            <f:SimpleForm labelSpanL=\"4\" labelSpanM=\"4\"" +
		"                                          labelSpanS=\"4\" emptySpanL=\"0\" emptySpanM=\"0\" emptySpanS=\"0\"" +
		"                                          maxContainerCols=\"2\" layout=\"ResponsiveGridLayout\"" +
		"                                          width=\"100%\">" +
		"                                <core:Title text=\"Termination information\"/>" +
		"                                <m:Label text=\"Ok to return\"/>" +
		"                                <m:Text text=\"No\"/>" +
		"                                <m:Label text=\"Regret Termination\"/>" +
		"                                <m:Text text=\"Yes\"/>" +
		"                            </f:SimpleForm>" +
		"                        </blocks>" +
		"                        <moreBlocks>" +
		"                            <f:SimpleForm labelSpanL=\"4\" labelSpanM=\"4\"" +
		"                                          labelSpanS=\"4\" emptySpanL=\"0\" emptySpanM=\"0\" emptySpanS=\"0\"" +
		"                                          maxContainerCols=\"2\"" +
		"                                          layout=\"ResponsiveGridLayout\"" +
		"                                          width=\"100%\">" +
		"                                <m:Label text=\"Start Date\"/>" +
		"                                <m:Text text=\"Jan 01, 2001\"/>" +
		"                                <m:Label text=\"End Date\"/>" +
		"                                <m:Text text=\"Jun 30, 2014\"/>" +
		"                                <m:Label text=\"Last Date Worked\"/>" +
		"                                <m:Text text=\"Jun 01, 2014\"/>" +
		"                                <m:Label text=\"Payroll End Date\"/>" +
		"                                <m:Text text=\"Jun 01, 2014\"/>" +
		"                            </f:SimpleForm>" +
		"                        </moreBlocks>" +
		"                    </ObjectPageSubSection>" +
		"                </subSections>" +
		"            </ObjectPageSection>" +
		"        </sections>" +
		"    </ObjectPageLayout>" +
		"    </m:App>" +
		"</mvc:View>",


		sEmptyView =
			"<mvc:View" +
			"        xmlns:mvc=\"sap.ui.core.mvc\"" +
			"        height=\"100%\">" +
			"</mvc:View>";



	QUnit.module("Fiori2 adaptation of page header", {
		beforeEach: function () {
			this.oPage = new Page("myPage");
			this.oPage.placeAt("content");
			Core.applyChanges();
		},
		afterEach: function () {
			this.oPage.destroy();
		}
	});

	QUnit.test("Page is not styled when bStylePage=false", function(assert) {
		var oAdaptOptions = {bStylePage: false};
		Fiori20Adapter.traverse(this.oPage, oAdaptOptions);
		Core.applyChanges();

		// Assert
		assert.ok(!jQuery("#myPage").hasClass("sapF2Adapted"), "page style is not adapted");
	});

	QUnit.test("Page is styled when bStylePage=true", function(assert) {
		var oAdaptOptions = {bStylePage: true};

		Fiori20Adapter.traverse(this.oPage, oAdaptOptions);
		Core.applyChanges();

		// Assert
		assert.ok(jQuery("#myPage").hasClass("sapF2Adapted"), "page style is adapted");
	});

	QUnit.test("Back Button is not adapted when bHideBackButton=false", function(assert) {

		var oAdaptOptions = {bHideBackButton: false};
		this.oPage.setShowNavButton(true);

		Fiori20Adapter.traverse(this.oPage, oAdaptOptions);
		Core.applyChanges();

		// Assert
		assert.ok(!jQuery("#myPage-navButton").hasClass("sapF2AdaptedNavigation"), "back button is not adapted");
	});

	QUnit.test("Back Button is not adapted if already hidden", function(assert) {

		var oAdaptOptions = {bHideBackButton: true},
		bShowNavButton = Device.system.phone,
		oModel = new JSONModel({showButton: bShowNavButton});

		this.oPage.bindProperty("showNavButton", "device>/showButton");
		this.oPage.setModel(oModel, "device");

		Fiori20Adapter.traverse(this.oPage, oAdaptOptions);
		Core.applyChanges();

		// Assert
		assert.strictEqual(jQuery("#myPage-navButton").hasClass("sapF2AdaptedNavigation"), bShowNavButton , "back button is not adapted");
	});

	QUnit.test("Back Button is adapted when bHideBackButton=true", function(assert) {
		var oAdaptOptions = {bHideBackButton: true};
		this.oPage.setShowNavButton(true);

		Fiori20Adapter.traverse(this.oPage, oAdaptOptions);
		Core.applyChanges();

		// Assert
		assert.ok(jQuery("#myPage-navButton").hasClass("sapF2AdaptedNavigation"), "back button is adapted");
	});

	QUnit.test("Title is adapted when bMoveTitle=true", function(assert) {
		var oAdaptOptions = {bMoveTitle: true};
		this.oPage.setTitle("Test");

		Fiori20Adapter.traverse(this.oPage, oAdaptOptions);

		Core.applyChanges();

		// Assert
		assert.ok(jQuery("#myPage-title").hasClass("sapF2AdaptedTitle"), "title is adapted");
	});

	QUnit.test("MessagePage title is adapted when bMoveTitle=true", function(assert) {
		var oAdaptOptions = {bMoveTitle: true};
		this.oMessagePage = new MessagePage("messagePage", {
			title: "Some title"
		});
		this.oMessagePage.placeAt("content");
		Core.applyChanges();

		Fiori20Adapter.traverse(this.oMessagePage, oAdaptOptions);

		Core.applyChanges();

		// Assert
		assert.ok(jQuery("#messagePage-title").hasClass("sapF2AdaptedTitle"), "title is adapted");

		// Clean-up
		this.oMessagePage.destroy();
	});

	QUnit.test("Title is adapted when header is replaced", function(assert) {
		var oAdaptOptions = {bMoveTitle: true};
		this.oPage.setTitle("Test");

		//act
		Fiori20Adapter.traverse(this.oPage, oAdaptOptions);
		this.oPage.setCustomHeader(new Bar({
			contentMiddle: new Text("newTitle", {text: "New Title"})
		}));

		Core.applyChanges();

		// Assert
		assert.ok(jQuery("#newTitle").hasClass("sapF2AdaptedTitle"), "new title is adapted");
	});

	QUnit.test("Header is collapsed", function(assert) {

		var oAdaptOptions = {bMoveTitle: true, bHideBackButton: true, bCollapseHeader: true};
		this.oPage.setTitle("Test");
		this.oPage.setShowNavButton(true);

		Fiori20Adapter.traverse(this.oPage, oAdaptOptions);

		// Assert
		assert.ok(this.oPage.hasStyleClass("sapF2CollapsedHeader"), "header is collapsed");
	});

	QUnit.test("Header is not collapsed if bCollapseHeader: false", function(assert) {
		var oAdaptOptions = {bMoveTitle: true, bHideBackButton: true, bCollapseHeader: false};
		this.oPage.setTitle("Test");
		this.oPage.setShowNavButton(true);

		Fiori20Adapter.traverse(this.oPage, oAdaptOptions);

		// Assert
		assert.ok(!this.oPage.hasStyleClass("sapF2CollapsedHeader"), "header is collapsed");
	});

	QUnit.test("Header is not collapsed if it contains visible content", function(assert) {
		this.oPage.addHeaderContent(new Button({text:"HDRBTN"}));
		var oAdaptOptions = {bMoveTitle: true, bHideBackButton: true, bCollapseHeader: true};
		this.oPage.setTitle("Test");
		this.oPage.setShowNavButton(true);

		Fiori20Adapter.traverse(this.oPage, oAdaptOptions);

		// Assert
		assert.ok(!this.oPage.hasStyleClass("sapF2CollapsedHeader"), "header is collapsed");
	});

	QUnit.test("Header is collapsed if it contains hidden non adaptable content", function(assert) {

		var oAdaptOptions = {bCollapseHeader: true},
			oModel = new JSONModel({show: false}),
			oContentBegin = new Button({text: "HDRBTN", visible:"{/show}"}),
			oContentMiddle = new Text({text: "HDRTXT", visible:"{/show}"}),
			oContentEnd = new Button({text: "HDRBTN", visible:"{/show}"});

		this.oPage.setCustomHeader(new Bar({
			contentLeft: oContentBegin,
			contentMiddle: oContentMiddle,
			contentRight: oContentEnd
		}));
		this.oPage.setModel(oModel);

		Fiori20Adapter.traverse(this.oPage, oAdaptOptions);
		Core.applyChanges();

		// Assert
		assert.strictEqual(this.oPage.hasStyleClass("sapF2CollapsedHeader"), true , "header is collapsed");
	});

	QUnit.test("Header is adapted dynamically based on content visibility", function(assert) {

		var oAdaptOptions = {bCollapseHeader: true, bHideBackButton: true},
			oModel = new JSONModel({showButton: false}),
			oBackButton = new Button("newBackButton", {type: "Back", visible: "{/showButton}"}),
			oDetectedBackButton,
			fnViewListener = function(oEvent) {
				oDetectedBackButton = oEvent.getParameter("oBackButton");
			},
			oSpy = sinon.spy(fnViewListener);

		this.oPage.setCustomHeader(new Bar({
			contentLeft: [oBackButton]
		}));
		this.oPage.setModel(oModel);
		Fiori20Adapter.attachViewChange(oSpy);

		Fiori20Adapter.traverse(this.oPage, oAdaptOptions);
		Core.applyChanges();

		// Assert
		assert.strictEqual(this.oPage.hasStyleClass("sapF2CollapsedHeader"), true , "header is collapsed");
		assert.strictEqual(oSpy.called, false, "spy is not called");

		oSpy.reset();
		oModel.setProperty("/showButton", true);
		Core.applyChanges();

		assert.strictEqual(this.oPage.hasStyleClass("sapF2CollapsedHeader"), true , "header is still collapsed");
		assert.ok(oBackButton.hasStyleClass("sapF2AdaptedNavigation"), "back button is adapted");
		assert.strictEqual(oSpy.calledOnce, true, "spy is called");
		assert.strictEqual(oDetectedBackButton.getId(), oBackButton.getId(), "back button is detected");

		oSpy.reset();
		oDetectedBackButton = null;
		oModel.setProperty("/showButton", false);
		Core.applyChanges();

		assert.strictEqual(this.oPage.hasStyleClass("sapF2CollapsedHeader"), true , "header is still collapsed");
		assert.ok(!oBackButton.hasStyleClass("sapF2AdaptedNavigation"), "back button is not adapted");
		assert.strictEqual(oSpy.calledOnce, true, "spy is called");
		assert.strictEqual(oDetectedBackButton, undefined, "back button is detected");

		// cleanup
		Fiori20Adapter.detachViewChange(oSpy);
	});

	QUnit.module("Fiori2 post adaptation of page header", {
		beforeEach: function () {
			this.oApp = new App();
			this.oPage = new Page("myPage1");
			this.oApp.addPage(this.oPage);
			this.oApp.placeAt("content");
			Core.applyChanges();
		},
		afterEach: function () {
			this.oApp.destroy();
			this.oPage = null;
		}
	});

	QUnit.test("Header is adapted if page body content is added at a later time", function(assert) {
		var oAdaptOptions = {bMoveTitle: true, bHideBackButton: true, bCollapseHeader: true},
		oTitleInfo,
		oBackButton,
		sViewId,
		fnViewListener = function(oEvent) {
			oBackButton = oEvent.getParameter("oBackButton");
			oTitleInfo = oEvent.getParameter("oTitleInfo");
			sViewId = oEvent.getParameter("sViewId");
		},
		oSpy = sinon.spy(fnViewListener);
		Fiori20Adapter.attachViewChange(oSpy);
		Fiori20Adapter.traverse(this.oApp, oAdaptOptions);

		var oInnerPage = new Page("innerPage");
		oInnerPage.setTitle("Test");
		oInnerPage.setShowNavButton(true);

		// Act
		this.oPage.addContent(oInnerPage);

		// Assert
		assert.ok(oInnerPage.hasStyleClass("sapF2CollapsedHeader"), "header is collapsed");
		assert.ok(oTitleInfo.text, "Test", "title is adapted");
		assert.equal(oBackButton.getId(),"innerPage-navButton", "back button is adapted");
		assert.equal(sViewId, "myPage1", "the correct viewId is returned");

		// cleanup
		Fiori20Adapter.detachViewChange(oSpy);
	});

	QUnit.test("Button visibility is post adapted", function(assert) {
		var oAdaptOptions = {bHideBackButton: true},
				oBackButton = new Button("newBackButton", {type: "Back", visible: false}),
				oChangedBackButton,
				fnViewListener = function(oEvent) {
					oChangedBackButton = oEvent.getParameter("oBackButton");
				},
				oSpy = sinon.spy(fnViewListener);

		this.oPage.setCustomHeader(new Bar({
			contentLeft: [oBackButton]
		}));
		Fiori20Adapter.traverse(this.oApp, oAdaptOptions);
		Fiori20Adapter.attachViewChange(oSpy);

		oBackButton.setVisible(true);

		// Assert
		assert.strictEqual(oSpy.callCount, 1, "change is fired");
		assert.strictEqual(oChangedBackButton.getVisible(), true, "correct change is fired");

		// cleanup
		Fiori20Adapter.detachViewChange(oSpy);
	});

	QUnit.test("Unrelated button properties are skipped in post adaptation", function(assert) {
		var oAdaptOptions = {bHideBackButton: true},
				oBackButton = new Button("newBackButton", {type: "Back", visible: false}),
				oChangedBackButton,
				fnViewListener = function(oEvent) {
					oChangedBackButton = oEvent.getParameter("oBackButton");
				},
				oSpy = sinon.spy(fnViewListener);

		this.oPage.setCustomHeader(new Bar({
			contentLeft: [oBackButton]
		}));
		Fiori20Adapter.traverse(this.oApp, oAdaptOptions);
		Fiori20Adapter.attachViewChange(oSpy);

		// Act: change unrelated property
		oBackButton.setText("Back");

		// Assert
		assert.strictEqual(oSpy.callCount, 0, "no change is fired");

		// cleanup
		Fiori20Adapter.detachViewChange(oSpy);
	});

	QUnit.test("Header is adapted if page body content is inserted at a later time", function(assert) {
		var oAdaptOptions = {bMoveTitle: true, bHideBackButton: true, bCollapseHeader: true},
			oTitleInfo,
			oBackButton,
			sViewId,
			fnViewListener = function(oEvent) {
				oBackButton = oEvent.getParameter("oBackButton");
				oTitleInfo = oEvent.getParameter("oTitleInfo");
				sViewId = oEvent.getParameter("sViewId");
			},
			oSpy = sinon.spy(fnViewListener);
		Fiori20Adapter.attachViewChange(oSpy);
		Fiori20Adapter.traverse(this.oApp, oAdaptOptions);

		var oInnerPage = new Page("innerPage");
		oInnerPage.setTitle("Test");
		oInnerPage.setShowNavButton(true);

		// Act
		this.oPage.insertContent(oInnerPage, 0);

		// Assert
		assert.ok(oInnerPage.hasStyleClass("sapF2CollapsedHeader"), "header is collapsed");
		assert.equal(sViewId, "myPage1", "the correct viewId is returned");
		assert.equal(oTitleInfo.text, "Test", "title is adapted");
		assert.equal(oBackButton.getId(), "innerPage-navButton", "back button is adapted");

		// cleanup
		Fiori20Adapter.detachViewChange(oSpy);
	});

	QUnit.test("Header is adapted when replaced", function(assert) {

		var oAdaptOptions = {bHideBackButton: true, bMoveTitle: true},
			oTitleInfo,
			oBackButton,
			fnViewListener = function(oEvent) {
				oBackButton = oEvent.getParameter("oBackButton");
				oTitleInfo = oEvent.getParameter("oTitleInfo");
			},
			oSpy = sinon.spy(fnViewListener);
		Fiori20Adapter.attachViewChange(oSpy);

		Fiori20Adapter.traverse(this.oPage, oAdaptOptions);
		this.oPage.setCustomHeader(new Bar({
			contentLeft: [new Button("newBackButton", {type: "Back"})],
			contentMiddle: [new Title("newTitle", {text: "New Title"})]
		}));
		Core.applyChanges();

		// Assert
		assert.ok(jQuery("#newBackButton").hasClass("sapF2AdaptedNavigation"), "new back button is adapted");
		assert.equal(oBackButton.getId(), "newBackButton", "back button is returned");
		assert.equal(oTitleInfo.text, "New Title", "title is returned");
	});

	QUnit.test("Title is not adapted when header content is added at a later time and lateAdaptation=false", function(assert) {
		var oAdaptOptions = {bMoveTitle: true},
			oTitleInfo,
			oBackButton,
			fnViewListener = function(oEvent) {
				oBackButton = oEvent.getParameter("oBackButton");
				oTitleInfo = oEvent.getParameter("oTitleInfo");
			},
			oSpy = sinon.spy(fnViewListener);

		Fiori20Adapter.attachViewChange(oSpy);
		this.oPage.setTitle("Test");

		//act
		Fiori20Adapter.traverse(this.oPage, oAdaptOptions);
		var oBar = new Bar({});
		this.oPage.setCustomHeader(oBar);

		oBar.addContentMiddle(new Text("newTitle", {text: "New Title"}));

		Core.applyChanges();

		// Assert
		assert.ok(!jQuery("#newTitle").hasClass("sapF2AdaptedTitle"), "new title is not adapted");
		assert.ok(oTitleInfo.text !== "New Title", "new title is not returned");
	});

	QUnit.test("Title is adapted when header content is added at a later time and lateAdaptation=true", function(assert) {
		var oAdaptOptions = {bMoveTitle: true, bLateAdaptation: true},
				oTitleInfo,
				oBackButton,
				fnViewListener = function(oEvent) {
					oBackButton = oEvent.getParameter("oBackButton");
					oTitleInfo = oEvent.getParameter("oTitleInfo");
				},
				oSpy = sinon.spy(fnViewListener);

		Fiori20Adapter.attachViewChange(oSpy);
		this.oPage.setTitle("Test");

		//act
		Fiori20Adapter.traverse(this.oPage, oAdaptOptions);
		var oBar = new Bar({});
		this.oPage.setCustomHeader(oBar);

		oBar.addContentMiddle(new Text("newTitle", {text: "New Title"}));

		Core.applyChanges();

		// Assert
		assert.ok(jQuery("#newTitle").hasClass("sapF2AdaptedTitle"), "new title is adapted");
		assert.equal(oTitleInfo.text, "New Title", "new title is returned");
	});

	QUnit.test("Title is adapted when header content is inserted at a later time and lateAdaptation=true", function(assert) {
		var oAdaptOptions = {bMoveTitle: true, bLateAdaptation: true},
				oTitleInfo,
				oBackButton,
				fnViewListener = function(oEvent) {
					oBackButton = oEvent.getParameter("oBackButton");
					oTitleInfo = oEvent.getParameter("oTitleInfo");
				},
				oSpy = sinon.spy(fnViewListener);

		Fiori20Adapter.attachViewChange(oSpy);
		this.oPage.setTitle("Test");

		//act
		Fiori20Adapter.traverse(this.oPage, oAdaptOptions);
		var oBar = new Bar({});
		this.oPage.setCustomHeader(oBar);

		oBar.insertContentMiddle(new Text("newTitle", {text: "New Title"}), 0);

		Core.applyChanges();

		// Assert
		assert.ok(jQuery("#newTitle").hasClass("sapF2AdaptedTitle"), "new title is adapted");
		assert.equal(oTitleInfo.text, "New Title", "new title is returned");
	});

	QUnit.test("Nested page with empty header is ignored", function(assert) {

		var oAdaptOptions = {bMoveTitle: true, bHideBackButton: true, bCollapseHeader: true},
				oTitleInfo,
				oBackButton,
				sExpectedBackButtonId = this.oPage.getId() + "-navButton",
				fnViewListener = function(oEvent) {
					oTitleInfo = oEvent.getParameter("oTitleInfo");
					oBackButton = oEvent.getParameter("oBackButton");
				},
				oSpy = sinon.spy(fnViewListener);

		// Arrange
		this.oPage.setTitle("Test");
		this.oPage.setShowNavButton(true);
		this.oPage.addContent(new Page());

		Fiori20Adapter.attachViewChange(oSpy);

		// Act
		Fiori20Adapter.traverse(this.oPage, oAdaptOptions);
		Core.applyChanges();

		// Assert
		assert.ok(this.oPage.hasStyleClass("sapF2CollapsedHeader"), "header is collapsed");
		assert.equal(oTitleInfo.text, "Test", "header is collapsed");
		assert.strictEqual(oBackButton.getId(), sExpectedBackButtonId, "back button is correct");
	});

	QUnit.test("Nested messagePage with empty header is ignored", function(assert) {

		var oAdaptOptions = {bMoveTitle: true, bHideBackButton: true, bCollapseHeader: true},
			oTitleInfo,
			oBackButton,
			sExpectedBackButtonId = this.oPage.getId() + "-navButton",
			fnViewListener = function(oEvent) {
				oTitleInfo = oEvent.getParameter("oTitleInfo");
				oBackButton = oEvent.getParameter("oBackButton");
			},
			oSpy = sinon.spy(fnViewListener);

		// Arrange
		this.oPage.setTitle("Test");
		this.oPage.setShowNavButton(true);
		this.oPage.addContent(new MessagePage());

		Fiori20Adapter.attachViewChange(oSpy);

		// Act
		Fiori20Adapter.traverse(this.oPage, oAdaptOptions);
		Core.applyChanges();

		// Assert
		assert.ok(this.oPage.hasStyleClass("sapF2CollapsedHeader"), "header is collapsed");
		assert.strictEqual(oTitleInfo.text, "Test", "header is collapsed");
		assert.strictEqual(oBackButton.getId(), sExpectedBackButtonId, "back button is correct");
	});

	QUnit.module("Fiori2 post adaptation of application content");

	QUnit.test("Header is adapted if the root navigable control is added at a later time", function(assert) {

		var oRootPage = new Page();
		oRootPage.placeAt("content");
		Core.applyChanges();

		var oAdaptOptions = {bMoveTitle: true, bHideBackButton: true, bCollapseHeader: true},
				oTitleInfo,
				oBackButton,
				sViewId,
				fnViewListener = function(oEvent) {
					oBackButton = oEvent.getParameter("oBackButton");
					oTitleInfo = oEvent.getParameter("oTitleInfo");
					sViewId = oEvent.getParameter("sViewId");
				},
				oSpy = sinon.spy(fnViewListener);
		Fiori20Adapter.attachViewChange(oSpy);
		Fiori20Adapter.traverse(oRootPage, oAdaptOptions);

		oRootPage.addContent(new App({
			pages: [new Page({
				title: "Test"
			})]
		}));

		// Assert
		assert.ok(oTitleInfo.text, "Test", "title is adapted");

		// cleanup
		Fiori20Adapter.detachViewChange(oSpy);

		oRootPage.destroy();
	});

	QUnit.test("Header is adapted if the content of the root view is added at a later time", function(assert) {

		var done = assert.async();
		XMLView.create(
			{definition: sEmptyView}).then(function(oRootView) {
				oRootView.placeAt("content");
				Core.applyChanges();

				var oAdaptOptions = {bMoveTitle: true, bHideBackButton: true, bCollapseHeader: true},
					oTitleInfo,
					oBackButton,
					sViewId,
					fnViewListener = function(oEvent) {
						oBackButton = oEvent.getParameter("oBackButton");
						oTitleInfo = oEvent.getParameter("oTitleInfo");
						sViewId = oEvent.getParameter("sViewId");
					},
					oSpy = sinon.spy(fnViewListener);

				Fiori20Adapter.attachViewChange(oSpy);
				Fiori20Adapter.traverse(oRootView, oAdaptOptions);

				oRootView.addContent(new App({
					pages: [new Page({
						title: "Test"
					})]
				}));

				// Assert
				assert.ok(oTitleInfo.text, "Test", "title is adapted");

				// cleanup
				Fiori20Adapter.detachViewChange(oSpy);

				oRootView.destroy();
				done();
		});
	});


	QUnit.module("Fiori2 adaptation of navigable views", {
		beforeEach: function () {
			this.oNavContainer = new NavContainer("myNc");
			this.oNavContainer.addPage(new Page("page1", {title: "Test", showNavButton: true}));
			this.oNavContainer.placeAt("content");
			Core.applyChanges();
		},
		afterEach: function () {
			this.oNavContainer.destroy();
		}
	});

	QUnit.test("Initial page of navContainer is adapted", function(assert) {
		var oAdaptOptions = {bMoveTitle: true, bHideBackButton: true, bCollapseHeader: true},
				sPageTitle,
				oBackButton,
				sViewId,
				fnViewListener = function(oEvent) {
					oBackButton = oEvent.getParameter("oBackButton");
					var oTitleInfo = oEvent.getParameter("oTitleInfo");
					sPageTitle = oTitleInfo.text;
					sViewId = oEvent.getParameter("sViewId");
				},
				oSpy = sinon.spy(fnViewListener);

		//setup
		Fiori20Adapter.attachViewChange(oSpy);

		//act
		Fiori20Adapter.traverse(this.oNavContainer, oAdaptOptions);

		// Assert
		assert.ok(this.oNavContainer.getPages()[0].hasStyleClass("sapF2CollapsedHeader"), "page header is collapsed");
		assert.ok(oSpy.calledOnce, "view change called once");
		assert.equal(sViewId, "page1", "the correct viewId is returned");
		assert.equal(sPageTitle, "Test", "page title is identified");
		assert.equal(oBackButton.getId(), "page1-navButton", "back button is identified");
		assert.ok(oBackButton.hasStyleClass("sapF2AdaptedNavigation"), "back button is adapted");

		//cleanup
		Fiori20Adapter.detachViewChange(oSpy);
	});

	QUnit.test("Navigated page of navContainer is adapted", function(assert) {
		var oAdaptOptions = {bMoveTitle: true, bHideBackButton: true, bCollapseHeader: true},
				sPageTitle,
				oBackButton,
				sViewId,
				done = assert.async(),
				fnTitleListener = function(oEvent) {
					oBackButton = oEvent.getParameter("oBackButton");
					var oTitleInfo = oEvent.getParameter("oTitleInfo");
					sPageTitle = oTitleInfo.text;
					sViewId = oEvent.getParameter("sViewId");
				},
				oSpy = sinon.spy(fnTitleListener);

		//setup
		this.oNavContainer.addPage(new Page("page2", {title: "Test2", showNavButton: true}));
		Fiori20Adapter.attachViewChange(oSpy);

		//act
		Fiori20Adapter.traverse(this.oNavContainer, oAdaptOptions);
		this.oNavContainer.to("page2");

		//assert
		this.oNavContainer.attachAfterNavigate(function() {
			// Assert
			assert.ok(this.oNavContainer.getPages()[1].hasStyleClass("sapF2CollapsedHeader"), "second page header is collapsed");
			assert.ok(oSpy.calledTwice, "view change called twice");
			assert.equal(sViewId, "page2", "the correct viewId is returned");
			assert.equal(sPageTitle, "Test2", "second page title is identified");
			assert.ok(oBackButton.getId(), "page2-navButton", "second page back button is identified");
			assert.ok(oBackButton.hasStyleClass("sapF2AdaptedNavigation"), "back button is adapted");
			done();
		}.bind(this));

		//cleanup
		Fiori20Adapter.detachViewChange(oSpy);
	});

	QUnit.test("Update adapt options on context switch", function(assert) {
		var oAdaptOptions = {bMoveTitle: true, bHideBackButton: true},
			sTitleId,
			oBackButton,
			oInitPage = this.oNavContainer.getCurrentPage(),
			onViewChange = function(oEvent) {
				var oTitleInfo = oEvent.getParameter("oTitleInfo");
				sTitleId = oTitleInfo ? oTitleInfo.id : null;
				oBackButton = oEvent.getParameter("oBackButton");
			},
			oNestedNavContainer = new sap.m.NavContainer({pages: oInitPage}),
			oNestedSplitContainer = new SplitContainer(),
			oSpy = sinon.spy(onViewChange);

		//setup
		Fiori20Adapter.attachViewChange(oSpy);
		this.oNavContainer.addPage(oNestedNavContainer);
		this.oNavContainer.addPage(oNestedSplitContainer);

		// adapt the init view
		Fiori20Adapter.traverse(this.oNavContainer, oAdaptOptions);
		assert.strictEqual(sTitleId, "page1-title", "title is found");
		assert.ok(oBackButton, "button is found");

		// move the init view to another container where title should not be adapted
		oNestedSplitContainer.addPage(oInitPage);
		this.oNavContainer.to(oNestedSplitContainer);
		assert.strictEqual(sTitleId, null, "title is ignored");

		oSpy.reset();
		oInitPage.setTitle("Changed");
		assert.strictEqual(oSpy.callCount, 0, "title update is ignored");


		oSpy.reset();
		oInitPage.setShowNavButton(false);
		assert.strictEqual(oSpy.callCount, 0, "button update is ignored");


		// move the view pack to where its title should be adapted
		oNestedNavContainer.addPage(oInitPage);
		this.oNavContainer.to(oNestedNavContainer);
		assert.strictEqual(sTitleId, "page1-title", "title is found");

		Fiori20Adapter.detachViewChange(oSpy);
	});


	QUnit.module("Fiori2 adaptation of navContainer first page", {
		beforeEach: function () {
			this.oNavContainer = new NavContainer("myNc");
		},
		afterEach: function () {
			this.oNavContainer.destroy();
		}
	});

	QUnit.test("First page of navContainer is adapted", function(assert) {
		var oAdaptOptions = {bMoveTitle: true, bHideBackButton: true, bCollapseHeader: true},
				sPageTitle,
				oBackButton,
				sViewId,
				fnViewListener = function(oEvent) {
					oBackButton = oEvent.getParameter("oBackButton");
					var oTitleInfo = oEvent.getParameter("oTitleInfo");
					sPageTitle = oTitleInfo.text;
					sViewId = oEvent.getParameter("sViewId");
				},
				oSpy = sinon.spy(fnViewListener);
		//setup
		this.oNavContainer.placeAt("content");
		Core.applyChanges();
		Fiori20Adapter.attachViewChange(oSpy);

		//act
		Fiori20Adapter.traverse(this.oNavContainer, oAdaptOptions);

		//check
		assert.equal(oSpy.callCount, 0, "view change not called when no view in navContainer");

		//act
		this.oNavContainer.addPage(new Page("page1", {title: "Test", showNavButton: true}));

		// Assert
		assert.ok(this.oNavContainer.getPages()[0].hasStyleClass("sapF2CollapsedHeader"), "page header is collapsed");
		assert.ok(oSpy.calledOnce, "view change called once");
		assert.equal(sViewId, "page1", "viewId is identified");
		assert.equal(sPageTitle, "Test", "page title is identified");
		assert.equal(oBackButton.getId(), "page1-navButton", "back button is identified");
		assert.ok(oBackButton.hasStyleClass("sapF2AdaptedNavigation"), "back button is adapted");

		//cleanup
		Fiori20Adapter.detachViewChange(oSpy);
	});

	QUnit.test("First added page of navContainer is adapted before container was rendered", function(assert) {
		var oAdaptOptions = {bMoveTitle: true, bHideBackButton: true, bCollapseHeader: true},
			sPageTitle,
			oBackButton,
			sViewId,
			fnViewListener = function(oEvent) {
				oBackButton = oEvent.getParameter("oBackButton");
				var oTitleInfo = oEvent.getParameter("oTitleInfo");
				sPageTitle = oTitleInfo.text;
				sViewId = oEvent.getParameter("sViewId");
			},
			oSpy = sinon.spy(fnViewListener);

		//setup: only attach listener and DO NOT PLACE IN DOM YET
		Fiori20Adapter.attachViewChange(oSpy);

		//act
		Fiori20Adapter.traverse(this.oNavContainer, oAdaptOptions);

		//check
		assert.equal(oSpy.callCount, 0, "view change not called when no view in navContainer");

		//act
		this.oNavContainer.addPage(new Page("page1", {title: "Test", showNavButton: true}));

		// Assert
		assert.ok(this.oNavContainer.getPages()[0].hasStyleClass("sapF2CollapsedHeader"), "page header is collapsed");
		assert.ok(oSpy.calledOnce, "view change called once");
		assert.equal(sViewId, "page1", "viewId is identified");
		assert.equal(sPageTitle, "Test", "page title is identified");
		assert.equal(oBackButton.getId(), "page1-navButton", "back button is identified");
		assert.ok(oBackButton.hasStyleClass("sapF2AdaptedNavigation"), "back button is adapted");

		//cleanup
		Fiori20Adapter.detachViewChange(oSpy);
	});

	QUnit.test("First inserted page of navContainer is adapted before container was rendered", function(assert) {
		var oAdaptOptions = {bMoveTitle: true, bHideBackButton: true, bCollapseHeader: true},
			sPageTitle,
			oBackButton,
			sViewId,
			fnViewListener = function(oEvent) {
				oBackButton = oEvent.getParameter("oBackButton");
				var oTitleInfo = oEvent.getParameter("oTitleInfo");
				sPageTitle = oTitleInfo.text;
				sViewId = oEvent.getParameter("sViewId");
			},
			oSpy = sinon.spy(fnViewListener);

		//setup: only attach listener and DO NOT PLACE IN DOM YET
		Fiori20Adapter.attachViewChange(oSpy);

		//act
		Fiori20Adapter.traverse(this.oNavContainer, oAdaptOptions);

		//check
		assert.equal(oSpy.callCount, 0, "view change not called when no view in navContainer");

		//act
		this.oNavContainer.insertPage(new Page("page1", {title: "Test", showNavButton: true}), 0);

		// Assert
		assert.ok(this.oNavContainer.getPages()[0].hasStyleClass("sapF2CollapsedHeader"), "page header is collapsed");
		assert.ok(oSpy.calledOnce, "view change called once");
		assert.equal(sViewId, "page1", "viewId is identified");
		assert.equal(sPageTitle, "Test", "page title is identified");
		assert.equal(oBackButton.getId(), "page1-navButton", "back button is identified");
		assert.ok(oBackButton.hasStyleClass("sapF2AdaptedNavigation"), "back button is adapted");

		//cleanup
		Fiori20Adapter.detachViewChange(oSpy);
	});


	QUnit.module("Fiori2 adaptation of nested navContainer", {
		beforeEach: function () {
			this.oNavContainer = new NavContainer("myNc");
			this.oNavContainer.placeAt("content");
			Core.applyChanges();
		},
		afterEach: function () {
			this.oNavContainer.destroy();
		}
	});

	QUnit.test("First page of nested navContainer is adapted", function(assert) {
		var oAdaptOptions = {bMoveTitle: true, bHideBackButton: true, bCollapseHeader: true},
				sPageTitle,
				oBackButton,
				fnViewListener = function(oEvent) {
					oBackButton = oEvent.getParameter("oBackButton");
					var oTitleInfo = oEvent.getParameter("oTitleInfo");
					sPageTitle = oTitleInfo.text;
				},
				oSpy = sinon.spy(fnViewListener);
		//setup

		this.oNavContainer.addPage(new Page("myBasePage", {
			content:[
					new NavContainer({
						pages: [new Page("page1", {title: "Test", showNavButton: true})]
					})
			]
		}));
		Fiori20Adapter.attachViewChange(oSpy);

		//act
		Fiori20Adapter.traverse(this.oNavContainer, oAdaptOptions);

		// Assert
		assert.ok(Core.byId("page1").hasStyleClass("sapF2CollapsedHeader"), "page header is collapsed");
		assert.ok(oSpy.calledOnce, "view change called once");
		assert.ok(sPageTitle === "Test", "page title is identified");
		assert.ok(oBackButton instanceof Button, "back button is identified");
		assert.ok(oBackButton.hasStyleClass("sapF2AdaptedNavigation"), "back button is adapted");

		//cleanup
		Fiori20Adapter.detachViewChange(oSpy);
	});

	QUnit.test("First page of nested navContainer is adapted when added later", function(assert) {
		var oAdaptOptions = {bMoveTitle: true, bHideBackButton: true, bCollapseHeader: true},
				sPageTitle,
				oBackButton,
				sViewId,
				fnViewListener = function(oEvent) {
					oBackButton = oEvent.getParameter("oBackButton");
					var oTitleInfo = oEvent.getParameter("oTitleInfo");
					sPageTitle = oTitleInfo && oTitleInfo.text;
					sViewId = oEvent.getParameter("sViewId");
				},
				oNestedNavContainer = new NavContainer(),
				oSpy = sinon.spy(fnViewListener);
		//setup

		this.oNavContainer.addPage(new Page("myBasePage", {
			content:[
				oNestedNavContainer
			]
		}));
		Fiori20Adapter.attachViewChange(oSpy);

		//act
		Fiori20Adapter.traverse(this.oNavContainer, oAdaptOptions);

		//check
		assert.ok(oSpy.calledOnce, "view change called once");
		assert.equal(sViewId, "myBasePage", "view id is identified");

		oSpy.reset();

		//act
		oNestedNavContainer.addPage(new Page("page1", {title: "Test1", showNavButton: true}));
		oNestedNavContainer.addPage(new Page("page2", {title: "Test2", showNavButton: true}));

		// Assert
		assert.ok(Core.byId("page1").hasStyleClass("sapF2CollapsedHeader"), "page header is collapsed");
		assert.ok(oSpy.calledOnce, "view change called once");
		assert.equal(sViewId, "myBasePage", "view id is identified");
		assert.ok(sPageTitle === "Test1", "page title is identified");
		assert.equal(oBackButton.getId(), "page1-navButton", "back button is identified");
		assert.ok(oBackButton.hasStyleClass("sapF2AdaptedNavigation"), "back button is adapted");

		//cleanup
		Fiori20Adapter.detachViewChange(oSpy);
	});

	QUnit.test("First page of nested navContainer is identified on revisit", function(assert) {
		var oAdaptOptions = {bMoveTitle: true, bHideBackButton: true, bCollapseHeader: true},
				sPageTitle,
				oBackButton,
				sViewId,
				fnViewListener = function(oEvent) {
					oBackButton = oEvent.getParameter("oBackButton");
					var oTitleInfo = oEvent.getParameter("oTitleInfo");
					sPageTitle = oTitleInfo && oTitleInfo.text;
					sViewId = oEvent.getParameter("sViewId");
				},
				oNestedNavContainer = new NavContainer(),
				oSpy = sinon.spy(fnViewListener),
				done = assert.async();
		//setup
		this.oNavContainer.addPage(new Page("myBasePage", {
			content:[
				oNestedNavContainer
			]
		}));
		Fiori20Adapter.attachViewChange(oSpy);

		//act
		Fiori20Adapter.traverse(this.oNavContainer, oAdaptOptions);
		oNestedNavContainer.addPage(new Page("page1", {title: "Test1", showNavButton: true}));
		oNestedNavContainer.addPage(new Page("page2", {title: "Test2", showNavButton: true}));

		function checkOnAfterNavigateToPage2 () {
			// Assert
			assert.ok(Core.byId("page2").hasStyleClass("sapF2CollapsedHeader"), "page header is collapsed");
			assert.ok(oSpy.calledOnce, "view change called once");
			assert.equal(sViewId, "myBasePage", "view id is identified");
			assert.ok(sPageTitle === "Test2", "page title is identified");
			assert.equal(oBackButton.getId(), "page2-navButton", "back button is identified");
			assert.ok(oBackButton.hasStyleClass("sapF2AdaptedNavigation"), "back button is adapted");

			oSpy.reset();
			oNestedNavContainer.attachEventOnce("afterNavigate", checkOnAfterReturnToPage1);
			oNestedNavContainer.to("page1");
		}

		function checkOnAfterReturnToPage1 () {
			// Assert
			assert.ok(Core.byId("page1").hasStyleClass("sapF2CollapsedHeader"), "page header is collapsed");
			assert.ok(oSpy.calledOnce, "view change called once");
			assert.equal(sViewId, "myBasePage", "view id is identified");
			assert.ok(sPageTitle === "Test1", "page title is identified");
			assert.equal(oBackButton.getId(), "page1-navButton", "back button is identified");
			assert.ok(oBackButton.hasStyleClass("sapF2AdaptedNavigation"), "back button is adapted");

			//cleanup
			Fiori20Adapter.detachViewChange(oSpy);

			done();
		}
		oSpy.reset();
		oNestedNavContainer.attachEventOnce("afterNavigate", checkOnAfterNavigateToPage2);
		oNestedNavContainer.to("page2");
	});

	QUnit.test("Leveled header info is correctly adapted", function(assert) {
		var oAdaptOptions = {bMoveTitle: true,
					bHideBackButton: true,
					bCollapseHeader: true},
				sViewId,
				sPageTitle,
				oBackButton,
				oNestedNavC = new NavContainer({
					pages: [new Page("headerlessPage1"),
						new Page("headerlessPage2")]
				}),
				fnViewListener = function(oEvent) {
					oBackButton = oEvent.getParameter("oBackButton");
					var oTitleInfo = oEvent.getParameter("oTitleInfo");
					sPageTitle = oTitleInfo.text;
					sViewId = oEvent.getParameter("sViewId");
				},
				oSpy = sinon.spy(fnViewListener),
				done = assert.async();

		//setup
		this.oNavContainer.addPage(new Page("myBasePage", {
			title: "Test",
			showNavButton: true,
			content:[ oNestedNavC ]
		}));
		Fiori20Adapter.attachViewChange(oSpy);

		//act
		Fiori20Adapter.traverse(this.oNavContainer, oAdaptOptions);

		// Assert
		assert.ok(Core.byId("myBasePage").hasStyleClass("sapF2CollapsedHeader"), "page header is collapsed");
		assert.ok(oSpy.calledOnce, "view change called once");
		assert.equal(sViewId, "myBasePage", "view id is identified");
		assert.equal(sPageTitle, "Test", "page title is identified");
		assert.equal(oBackButton.getId(), "myBasePage-navButton", "back button is identified");
		assert.ok(oBackButton.hasStyleClass("sapF2AdaptedNavigation"), "back button is adapted");

		oSpy.reset();

		oNestedNavC.attachAfterNavigate(function() {
			assert.equal(sViewId, "myBasePage", "view id is identified");
			assert.equal(sPageTitle, "Test", "page title is identified");
			assert.equal(oBackButton.getId(), "myBasePage-navButton", "back button is identified");
			assert.ok(oBackButton.hasStyleClass("sapF2AdaptedNavigation"), "back button is adapted");

			//cleanup
			Fiori20Adapter.detachViewChange(oSpy);
			done();
		});
		oNestedNavC.to("headerlessPage2");
	});

	QUnit.test("Leveled header info is correctly updated", function(assert) {
		var oAdaptOptions = {bMoveTitle: true,
					bHideBackButton: true,
					bCollapseHeader: true},
				sViewId,
				sPageTitle,
				oBackButton,
				oNestedNavC = new NavContainer({
					pages: [new Page("nestedPage1",
							{title: "Test1",
							showNavButton: true}),
						new Page("nestedPage2",
								{title: "Test2",
									showNavButton: true})]
				}),
				fnViewListener = function(oEvent) {
					oBackButton = oEvent.getParameter("oBackButton");
					var oTitleInfo = oEvent.getParameter("oTitleInfo");
					sPageTitle = oTitleInfo.text;
					sViewId = oEvent.getParameter("sViewId");
				},
				oSpy = sinon.spy(fnViewListener),
				done = assert.async();

		//setup
		this.oNavContainer.addPage(new Page("myBasePage", {
			content:[ oNestedNavC ]
		}));
		Fiori20Adapter.attachViewChange(oSpy);

		//act
		Fiori20Adapter.traverse(this.oNavContainer, oAdaptOptions);

		// Assert
		assert.ok(Core.byId("myBasePage").hasStyleClass("sapF2CollapsedHeader"), "page header is collapsed");
		assert.ok(oSpy.calledOnce, "view change called once");
		assert.equal(sViewId, "myBasePage", "view id is identified");
		assert.equal(sPageTitle, "Test1", "page title is identified");
		assert.equal(oBackButton.getId(), "nestedPage1-navButton", "back button is identified");
		assert.ok(oBackButton.hasStyleClass("sapF2AdaptedNavigation"), "back button is adapted");

		oSpy.reset();

		oNestedNavC.attachAfterNavigate(function() {
			assert.equal(sViewId, "myBasePage", "view id is identified");
			assert.equal(sPageTitle, "Test2", "page title is identified");
			assert.equal(oBackButton.getId(), "nestedPage2-navButton", "back button is identified");
			assert.ok(oBackButton.hasStyleClass("sapF2AdaptedNavigation"), "back button is adapted");

			//cleanup
			Fiori20Adapter.detachViewChange(oSpy);
			done();
		});
		oNestedNavC.to("nestedPage2");
	});

	QUnit.test("2-level navigation is correctly identified", function(assert) {
		var oAdaptOptions = {bMoveTitle: true,
					bHideBackButton: true,
					bCollapseHeader: true},
				sViewId,
				sPageTitle,
				oBackButton,
				oNestedNavC1 = new NavContainer({
					pages: [new Page("nestedPage1",
							{title: "Test1",
								showNavButton: true}),
						new Page("nestedPage2",
								{title: "Test2",
									showNavButton: true})]
				}),
				oNestedNavC2 = new NavContainer({
					pages: [new Page("nestedPage3",
							{title: "Test3",
								showNavButton: true})]
				}),
				fnViewListener = function(oEvent) {
					oBackButton = oEvent.getParameter("oBackButton");
					var oTitleInfo = oEvent.getParameter("oTitleInfo");
					sPageTitle = oTitleInfo.text;
					sViewId = oEvent.getParameter("sViewId");
				},
				oSpy = sinon.spy(fnViewListener),
				done = assert.async();

		//setup
		this.oNavContainer.addPage(new Page("myBasePage1", {
			content:[ oNestedNavC1 ]
		}));
		this.oNavContainer.addPage(new Page("myBasePage2", {
			content:[ oNestedNavC2 ]
		}));
		Fiori20Adapter.attachViewChange(oSpy);

		//act
		Fiori20Adapter.traverse(this.oNavContainer, oAdaptOptions);

		// Assert
		assert.ok(Core.byId("myBasePage1").hasStyleClass("sapF2CollapsedHeader"), "page header is collapsed");
		assert.ok(oSpy.calledOnce, "view change called once");
		assert.equal(sViewId, "myBasePage1", "view id is identified");
		assert.equal(sPageTitle, "Test1", "page title is identified");
		assert.equal(oBackButton.getId(), "nestedPage1-navButton", "back button is identified");
		assert.ok(oBackButton.hasStyleClass("sapF2AdaptedNavigation"), "back button is adapted");

		oSpy.reset();

		function checkAfterNavigateToPage2() {
			assert.equal(sViewId, "myBasePage1", "view id is identified");
			assert.equal(sPageTitle, "Test2", "page title is identified");
			assert.equal(oBackButton.getId(), "nestedPage2-navButton", "back button is identified");
			assert.ok(oBackButton.hasStyleClass("sapF2AdaptedNavigation"), "back button is adapted");

			this.oNavContainer.attachEventOnce("afterNavigate", checkAfterNavigateToPage3, this);
			this.oNavContainer.to("myBasePage2");
		}

		function checkAfterNavigateToPage3() {
			assert.equal(sViewId, "myBasePage2", "view id is identified");
			assert.equal(sPageTitle, "Test3", "page title is identified");
			assert.equal(oBackButton.getId(), "nestedPage3-navButton", "back button is identified");
			assert.ok(oBackButton.hasStyleClass("sapF2AdaptedNavigation"), "back button is adapted");

			this.oNavContainer.attachEventOnce("afterNavigate", checkAfterBackToPage2, this);
			this.oNavContainer.to("myBasePage1");
		}

		function checkAfterBackToPage2() {
			assert.equal(sViewId, "myBasePage1", "view id is identified");
			assert.equal(sPageTitle, "Test2", "page title is identified");
			assert.equal(oBackButton.getId(), "nestedPage2-navButton", "back button is identified");
			assert.ok(oBackButton.hasStyleClass("sapF2AdaptedNavigation"), "back button is adapted");

			//cleanup
			Fiori20Adapter.detachViewChange(oSpy);
			done();
		}

		oNestedNavC1.attachEventOnce("afterNavigate", checkAfterNavigateToPage2, this);
		oNestedNavC1.to("nestedPage2");

	});

	QUnit.module("Fiori2 adaptation of split container", {
		beforeEach: function () {
			this.oSplitContainer = new SplitContainer("mySc");
			this.oSplitContainer.addMasterPage(new Page("masterPage1", {title: "Master1", showNavButton: true}));
			this.oSplitContainer.addDetailPage(new Page("detailPage1", {title: "Detail1", showNavButton: true}));
			this.oSplitContainer.placeAt("content");
			Core.applyChanges();
		},
		afterEach: function () {
			this.oSplitContainer.destroy();
		}
	});

	QUnit.test("Initial pages of splitContainer are correctly adapted", function(assert) {
		var oAdaptOptions = {bMoveTitle: true, bHideBackButton: true, bCollapseHeader: true},
				oTitleInfo,
				oBackButton,
				sViewId,
				fnTitleListener = function(oEvent) {
					oTitleInfo = oEvent.getParameter("oTitleInfo");
					oBackButton = oEvent.getParameter("oBackButton");
					sViewId = oEvent.getParameter("sViewId");
				},
				oSpy = sinon.spy(fnTitleListener);

		//setup
		Fiori20Adapter.attachViewChange(oSpy);

		//act
		Fiori20Adapter.traverse(this.oSplitContainer, oAdaptOptions);

		//assert
		assert.ok(jQuery("#masterPage1-navButton").hasClass("sapF2AdaptedNavigation"), "master back button is adapted");
		assert.ok(!jQuery("#masterPage1-title").hasClass("sapF2AdaptedTitle"), "master title is not adapted");

		assert.ok(jQuery("#detailPage1-navButton").hasClass("sapF2AdaptedNavigation"), "detail back button is adapted");
		assert.ok(!jQuery("#detailPage1-title").hasClass("sapF2AdaptedTitle"), "detail title is not adapted");

		assert.ok(oSpy.calledOnce, "title callback executed");
		assert.equal(sViewId, "mySc",  "viewId is correct");
		assert.ok(oTitleInfo === undefined, "default title is reset");
		assert.equal(oBackButton.getId(), "detailPage1-navButton",  "back button is returned");

		//cleanup
		Fiori20Adapter.detachViewChange(oSpy);
	});

	QUnit.test("Master back button is correctly returned", function(assert) {
		var oAdaptOptions = {bHideBackButton: true},
				oBackButton,
				sViewId,
				fnTitleListener = function(oEvent) {
					oBackButton = oEvent.getParameter("oBackButton");
					sViewId = oEvent.getParameter("sViewId");
				},
				oSpy = sinon.spy(fnTitleListener);

		//setup
		Core.byId("detailPage1-navButton").setVisible(false); //only master page has back button
		Fiori20Adapter.attachViewChange(oSpy);

		//act
		Fiori20Adapter.traverse(this.oSplitContainer, oAdaptOptions);

		//assert
		assert.ok(jQuery("#masterPage1-navButton").hasClass("sapF2AdaptedNavigation"), "master back button is adapted");
		assert.ok(oSpy.calledOnce, "title callback executed");
		assert.equal(sViewId, "mySc",  "viewId is correct");
		assert.ok(oBackButton instanceof Button, "back button is returned");
		assert.equal(oBackButton.getId(), "masterPage1-navButton", "master back button is returned");

		//cleanup
		Fiori20Adapter.detachViewChange(oSpy);
	});

	QUnit.test("Detail back button is correctly returned", function(assert) {
		var oAdaptOptions = {bHideBackButton: true},
				oBackButton,
				sViewId,
				fnTitleListener = function(oEvent) {
					oBackButton = oEvent.getParameter("oBackButton");
					sViewId = oEvent.getParameter("sViewId");
				},
				oSpy = sinon.spy(fnTitleListener);

		//setup
		Core.byId("masterPage1-navButton").setVisible(false); //only detail page has back button
		Fiori20Adapter.attachViewChange(oSpy);

		//act
		Fiori20Adapter.traverse(this.oSplitContainer, oAdaptOptions);

		//assert
		assert.ok(jQuery("#detailPage1-navButton").hasClass("sapF2AdaptedNavigation"), "detail back button is adapted");
		assert.ok(oSpy.calledOnce, "title callback executed");
		assert.equal(sViewId, "mySc",  "viewId is correct");
		assert.ok(oBackButton instanceof Button, "back button is returned");
		assert.equal(oBackButton.getId(), "detailPage1-navButton", "detail back button is returned");

		//cleanup
		Fiori20Adapter.detachViewChange(oSpy);
	});

	QUnit.test("SplitContainer back button is correctly returned", function(assert) {
		var oAdaptOptions = {bHideBackButton: true},
				oBackButton,
				sViewId,
				fnTitleListener = function(oEvent) {
					oBackButton = oEvent.getParameter("oBackButton");
					sViewId = oEvent.getParameter("sViewId");
				},
				oSpy = sinon.spy(fnTitleListener);

		//setup
		Fiori20Adapter.attachViewChange(oSpy);

		//act
		Fiori20Adapter.traverse(this.oSplitContainer, oAdaptOptions);

		//assert
		assert.ok(jQuery("#detailPage1-navButton").hasClass("sapF2AdaptedNavigation"), "detail back button is adapted"); //if oth master and details back present, detail wins
		assert.ok(oSpy.calledOnce, "title callback executed");
		assert.ok(oBackButton instanceof Button, "back button is returned");
		assert.equal(oBackButton.getId(), "detailPage1-navButton", "detail back button is returned");
		assert.equal(sViewId, "mySc",  "viewId is correct");

		//cleanup
		Fiori20Adapter.detachViewChange(oSpy);
	});

	QUnit.test("master-master page of splitContainer is correctly adapted", function(assert) {
		var oAdaptOptions = {bMoveTitle: true, bHideBackButton: true, bStylePage: true},
				oTitleInfo,
				oBackButton,
				sViewId,
				bHideBackButton,
				fnTitleListener = function(oEvent) {
					oTitleInfo = oEvent.getParameter("oTitleInfo");
					oBackButton = oEvent.getParameter("oBackButton");
					sViewId = oEvent.getParameter("sViewId");
					bHideBackButton = oEvent.getParameter("oAdaptOptions").bHideBackButton;
				},
				oSpy = sinon.spy(fnTitleListener);

		//setup
		this.oSplitContainer.addMasterPage(new Page("masterPage2", {title: "Master2", showNavButton: true}));
		Fiori20Adapter.attachViewChange(oSpy);

		//act
		Fiori20Adapter.traverse(this.oSplitContainer, oAdaptOptions);
		this.oSplitContainer.toMaster("masterPage2");

		//assert
		assert.ok(oSpy.calledTwice, "title callback executed twice");
		assert.ok(!jQuery("#masterPage2-navButton").hasClass("sapF2AdaptedNavigation"), "master2 back button is not adapted");
		assert.equal(oBackButton.getId(), "detailPage1-navButton",  "master2 back button is not returned");
		assert.equal(bHideBackButton, false,  "the bHideBackButton option for master-master is correct");
		assert.ok(!jQuery("#masterPage2-title").hasClass("sapF2AdaptedTitle"), "master2 title is not adapted");
		assert.ok(oTitleInfo === undefined, "master2 title is not returned");
		assert.ok(jQuery("#masterPage2").hasClass("sapF2Adapted"), "master2 page style is adapted");
		assert.equal(sViewId, "mySc",  "viewId is correct");
	});

	QUnit.test("detail-detail page of splitContainer is correctly adapted", function(assert) {
		var oAdaptOptions = {bMoveTitle: true, bHideBackButton: true, bStylePage: true},
				oTitleInfo,
				oBackButton,
				sViewId,
				bHideBackButton,
				fnTitleListener = function(oEvent) {
					oTitleInfo = oEvent.getParameter("oTitleInfo");
					oBackButton = oEvent.getParameter("oBackButton");
					sViewId = oEvent.getParameter("sViewId");
					bHideBackButton = oEvent.getParameter("oAdaptOptions").bHideBackButton;
				},
				oSpy = sinon.spy(fnTitleListener);

		//setup
		this.oSplitContainer.addDetailPage(new Page("detailPage2", {title: "Detail2", showNavButton: true}));
		Fiori20Adapter.attachViewChange(oSpy);

		//act
		Fiori20Adapter.traverse(this.oSplitContainer, oAdaptOptions);
		this.oSplitContainer.toDetail("detailPage2");

		//assert
		assert.ok(oSpy.calledTwice, "title callback executed twice");
		assert.ok(!jQuery("#detailPage2-navButton").hasClass("sapF2AdaptedNavigation"), "detail2 back button is not adapted");
		assert.ok(oBackButton === undefined, "detail2 back button is not returned");
		assert.equal(bHideBackButton, false,  "the bHideBackButton option for detail-detail is correct");
		assert.ok(!jQuery("#detailPage2-title").hasClass("sapF2AdaptedTitle"), "detail2 title is not adapted");
		assert.ok(oTitleInfo === undefined, "detail2 title is not returned");
		assert.ok(jQuery("#detailPage2").hasClass("sapF2Adapted"), "detail2 page style is adapted");
		assert.equal(sViewId, "mySc",  "viewId is correct");
	});

	QUnit.test("page of splitContainer is correctly adapted on secondary adaptation", function(assert) {
		var oAdaptOptions = {bMoveTitle: true, bHideBackButton: true, bStylePage: true},
				oTitleInfo;

		//setup step1: adapt once
		this.oSplitContainer.addDetailPage(new Page("detailPage2", {title: "Detail2", showNavButton: true}));
		Fiori20Adapter.traverse(this.oSplitContainer, oAdaptOptions);
		this.oSplitContainer.toDetail("detailPage2");
		this.oSplitContainer.destroy();

		//setup step2: re-init content reusing ids
		this.oSplitContainer = new SplitContainer("mySc");
		this.oSplitContainer.addMasterPage(new Page("masterPage1", {title: "Master1", showNavButton: true}));
		this.oSplitContainer.placeAt("content");
		Core.applyChanges();

		//act: re-trigger adaptation
		Fiori20Adapter.traverse(this.oSplitContainer, oAdaptOptions);

		//assert
		assert.ok(jQuery("#masterPage1-navButton").hasClass("sapF2AdaptedNavigation"), "master back button is adapted");
		assert.ok(!jQuery("#masterPage1-title").hasClass("sapF2AdaptedTitle"), "master title is not adapted");
	});


	QUnit.test("master navContainer of splitContainer can be accessed", function(assert) {
		// test because we are accessing private api of the SplitContainer
		var aChildren = this.oSplitContainer.findAggregatedObjects();
		assert.ok(aChildren.length > 1, "split container has children");
		assert.equal(aChildren[0].getId(), this.oSplitContainer._oMasterNav.getId(), "master container can be accessed");
	});


	QUnit.module("Fiori2 adaptation of split container on phone", {
		beforeEach: function () {
			Device.system.phone = true;
			this.oSplitContainer = new SplitContainer("mySc");
			this.oSplitContainer.addMasterPage(new Page("masterPage1", {title: "Master1", showNavButton: true}));
			this.oSplitContainer.addDetailPage(new Page("detailPage1", {title: "Detail1", showNavButton: true}));
			this.oSplitContainer.placeAt("content");
			Core.applyChanges();
		},
		afterEach: function () {
			Device.system.phone = false;
			this.oSplitContainer.destroy();
		}
	});

	QUnit.test("Initial pages of splitContainer are correctly adapted", function(assert) {
		var oAdaptOptions = {bMoveTitle: true, bHideBackButton: true, bCollapseHeader: true},
				oTitleInfo,
				oBackButton,
				sViewId,
				fnTitleListener = function(oEvent) {
					oTitleInfo = oEvent.getParameter("oTitleInfo");
					oBackButton = oEvent.getParameter("oBackButton");
					sViewId = oEvent.getParameter("sViewId");
				},
				oSpy = sinon.spy(fnTitleListener);

		//setup
		Fiori20Adapter.attachViewChange(oSpy);

		//act
		Fiori20Adapter.traverse(this.oSplitContainer, oAdaptOptions);

		/**
		 * note that on phone only the master part is created initially
		 */

		//assert
		assert.ok(jQuery("#masterPage1-navButton").hasClass("sapF2AdaptedNavigation"), "master back button is adapted");
		assert.ok(jQuery("#masterPage1-title").hasClass("sapF2AdaptedTitle"), "master title is adapted");

		assert.ok(oSpy.calledOnce, "title callback executed");
		assert.ok(oTitleInfo.text === "Master1", "detail title is  adapted");
		assert.ok(oBackButton.getId() === "masterPage1-navButton", "back button is returned");
		assert.equal(sViewId, "masterPage1",  "viewId is correct");

		//cleanup
		Fiori20Adapter.detachViewChange(oSpy);
	});


	QUnit.test("master-master page of splitContainer is correctly adapted", function(assert) {
		var oAdaptOptions = {bMoveTitle: true, bHideBackButton: true, bStylePage: true},
				oTitleInfo,
				oBackButton,
				bHideBackButton,
				fnTitleListener = function(oEvent) {
					oTitleInfo = oEvent.getParameter("oTitleInfo");
					oBackButton = oEvent.getParameter("oBackButton");
					bHideBackButton = oEvent.getParameter("oAdaptOptions").bHideBackButton;
				},
				oSpy = sinon.spy(fnTitleListener);

		//setup
		this.oSplitContainer.addMasterPage(new Page("masterPage2", {title: "Master2", showNavButton: true}));
		Fiori20Adapter.attachViewChange(oSpy);

		//act
		Fiori20Adapter.traverse(this.oSplitContainer, oAdaptOptions);
		this.oSplitContainer.toMaster("masterPage2");

		//assert
		assert.ok(oSpy.calledTwice, "title callback executed twice");
		assert.ok(jQuery("#masterPage2-navButton").hasClass("sapF2AdaptedNavigation"), "master2 back button is adapted");
		assert.equal(oBackButton.getId(), "masterPage2-navButton", "master2 back button is returned");
		assert.ok(jQuery("#masterPage2-title").hasClass("sapF2AdaptedTitle"), "master2 title is adapted");
		assert.ok(oTitleInfo.text === "Master2", "master2 title is not returned");
		assert.ok(bHideBackButton, true, "master2 bHideBackButton on phone is correct");
		assert.ok(jQuery("#masterPage2").hasClass("sapF2Adapted"), "master2 page style is adapted");
	});

	QUnit.test("detail-detail page of splitContainer is correctly adapted", function(assert) {
		var oAdaptOptions = {bMoveTitle: true, bHideBackButton: true, bStylePage: true},
				oTitleInfo,
				oBackButton,
				fnTitleListener = function(oEvent) {
					oTitleInfo = oEvent.getParameter("oTitleInfo");
					oBackButton = oEvent.getParameter("oBackButton");
				},
				oSpy = sinon.spy(fnTitleListener);

		//setup
		this.oSplitContainer.addDetailPage(new Page("detailPage2", {title: "Detail2", showNavButton: true}));
		Fiori20Adapter.attachViewChange(oSpy);

		//act
		Fiori20Adapter.traverse(this.oSplitContainer, oAdaptOptions);
		this.oSplitContainer.toDetail("detailPage2");

		//assert
		assert.ok(oSpy.calledTwice, "title callback executed twice");
		assert.ok(jQuery("#detailPage2-navButton").hasClass("sapF2AdaptedNavigation"), "detail2 back button is adapted");
		assert.ok(oBackButton.getId() === "detailPage2-navButton", "detail2 back button is returned");
		assert.ok(jQuery("#detailPage2-title").hasClass("sapF2AdaptedTitle"), "detail2 title is adapted");
		assert.ok(oTitleInfo.text === "Detail2", "detail2 title is not returned");
		assert.ok(jQuery("#detailPage2").hasClass("sapF2Adapted"), "detail2 page style is adapted");
	});

	QUnit.module("Post adaptation of split container", {
		beforeEach: function () {
			this.oSplitContainer = new SplitContainer("mySc");
			this.oSplitContainer.placeAt("content");
			Core.applyChanges();
		},
		afterEach: function () {
			this.oSplitContainer.destroy();
		}
	});

	QUnit.test("Initial pages of splitContainer are correctly adapted", function(assert) {
		var oAdaptOptions = {bMoveTitle: true, bHideBackButton: true, bCollapseHeader: true},
				oTitleInfo,
				oBackButton,
				fnTitleListener = function(oEvent) {
					oTitleInfo = oEvent.getParameter("oTitleInfo");
					oBackButton = oEvent.getParameter("oBackButton");
				},
				oSpy = sinon.spy(fnTitleListener);

		//setup
		Fiori20Adapter.attachViewChange(oSpy);

		//act
		Fiori20Adapter.traverse(this.oSplitContainer, oAdaptOptions);

		//assert
		assert.equal(oSpy.callCount, 0, "callback not executed");

		//act
		this.oSplitContainer.addMasterPage(new Page("masterPage1", {title: "Master1", showNavButton: true}));

		//assert
		assert.equal(oSpy.callCount, 1, "callback executed");
		assert.ok(jQuery("#masterPage1-navButton").hasClass("sapF2AdaptedNavigation"), "master back button is adapted");
		assert.ok(!jQuery("#masterPage1-title").hasClass("sapF2AdaptedTitle"), "master title is not adapted");

		//act
		oSpy.reset();
		this.oSplitContainer.addDetailPage(new Page("detailPage1", {title: "Detail1", showNavButton: false}));

		//assert
		assert.equal(oSpy.callCount, 1, "callback executed");
		assert.ok(!jQuery("#detailPage1-title").hasClass("sapF2AdaptedTitle"), "detail title is not adapted");
		assert.ok(oTitleInfo === undefined, "default title is reset");
		assert.equal(oBackButton.getId(), "masterPage1-navButton", "back button is returned");

		//cleanup
		Fiori20Adapter.detachViewChange(oSpy);
	});


	QUnit.module("Fiori2 adaptation of ObjectPage header", {
		beforeEach: function (assert) {
			var done = assert.async();
			XMLView.create({
				id: "oplView",
				definition: sObjectPageView
			}).then(function (oView) {
				this.oPage = oView;
				this.oPage.placeAt("content");
				Core.applyChanges();
				done();
			}.bind(this));
		},
		afterEach: function () {
			this.oPage.destroy();
		}
	});

	QUnit.test("Page is styled when bStylePage=true", function(assert) {
		var oAdaptOptions = {bStylePage: true};

		Fiori20Adapter.traverse(this.oPage, oAdaptOptions);
		Core.applyChanges();

		// Assert
		assert.ok(this.oPage.byId("objectPageLayout").getHeaderTitle().hasStyleClass("sapF2Adapted"), "page style is adapted");
	});

	QUnit.test("Back Button is adapted when bHideBackButton=true", function(assert) {
		var oAdaptOptions = {bHideBackButton: true};

		Fiori20Adapter.traverse(this.oPage, oAdaptOptions);
		Core.applyChanges();

		// Assert
		assert.ok(this.oPage.byId("navButton").hasStyleClass("sapF2AdaptedNavigation"), "back button is adapted");
	});

	QUnit.test("Title is adapted when bMoveTitle=true", function(assert) {
		var oAdaptOptions = {bMoveTitle: true};

		Fiori20Adapter.traverse(this.oPage, oAdaptOptions);

		Core.applyChanges();

		// Assert
		assert.ok(this.oPage.byId("title").hasStyleClass("sapF2AdaptedTitle"), "title is adapted");
	});

	QUnit.test("Header is collapsed", function(assert) {

		var oAdaptOptions = {bMoveTitle: true, bHideBackButton: true, bCollapseHeader: true};

		Fiori20Adapter.traverse(this.oPage, oAdaptOptions);

		// Assert
		assert.ok(this.oPage.byId("objectPageLayout").getHeaderTitle().hasStyleClass("sapF2CollapsedHeader"), "header is collapsed");
	});

	QUnit.test("Title is adapted if changed at a later time", function(assert) {
		var oAdaptOptions = {bMoveTitle: true, bHideBackButton: true, bCollapseHeader: true},
		oTitleInfo,
		fnTitleListener = function(oEvent) {
			oTitleInfo = oEvent.getParameter("oTitleInfo");
		};
		Fiori20Adapter.attachViewChange(fnTitleListener);
		Fiori20Adapter.traverse(this.oPage, oAdaptOptions);

		this.oPage.byId("title").setText("ProfileChanged");

		// Assert
		assert.ok(oTitleInfo.text === "ProfileChanged", "changed title is adapted");

		//cleanup
		Fiori20Adapter.detachViewChange(fnTitleListener);
	});

	QUnit.test("Only text of title is adapted if changed at a later time", function(assert) {
		var oAdaptOptions = {bMoveTitle: true, bHideBackButton: true, bCollapseHeader: true},
				oTitleInfo,
				fnTitleListener = function(oEvent) {
					oTitleInfo = oEvent.getParameter("oTitleInfo");
				};
		Fiori20Adapter.traverse(this.oPage, oAdaptOptions);
		Fiori20Adapter.attachViewChange(fnTitleListener);

		// Act: change unrelated property
		this.oPage.byId("title").setMaxLines(1);

		// Assert
		assert.ok(!oTitleInfo, "no change is fired");

		//cleanup
		Fiori20Adapter.detachViewChange(fnTitleListener);
	});

	QUnit.test("Header is adapted if changed at a later time", function(assert) {
		var oAdaptOptions = {bMoveTitle: true, bHideBackButton: true, bCollapseHeader: true},
				oTitleInfo,
				fnTitleListener = function(oEvent) {
					oTitleInfo = oEvent.getParameter("oTitleInfo");
				};
		Fiori20Adapter.attachViewChange(fnTitleListener);
		Fiori20Adapter.traverse(this.oPage, oAdaptOptions);

		this.oPage.byId("objectPageLayout").getHeaderTitle().setNavigationBar(new Bar({
			contentMiddle: [new Title({text: "New NavBar Title"})]
		}));

		// Assert
		assert.ok(oTitleInfo.text === "New NavBar Title", "changed title is adapted");

		//cleanup
		Fiori20Adapter.detachViewChange(fnTitleListener);
	});

	QUnit.module("Adaptable header criteria", {
		beforeEach: function () {
			this.oApp = new App();
			this.oApp.placeAt("content");
			Core.applyChanges();
		},
		afterEach: function () {
			this.oApp.destroy();
		}
	});

	QUnit.test("Non-adaptable header type is skipped", function(assert) {

		var oView = new HBox({
			items: [
				new Page({title: "Page Title"}),
				new SelectDialog("TestSelectDialog", {
					title: "Dialog Title"
				})
			]
		});

		this.oApp.addPage(oView);

		var oAdaptOptions = {bMoveTitle: true},
				oTitleInfo,
				fnTitleListener = function(oEvent) {
					oTitleInfo = oEvent.getParameter("oTitleInfo");
				},
				oSpy = sinon.spy(fnTitleListener);

		Fiori20Adapter.attachViewChange(oSpy);
		Fiori20Adapter.traverse(this.oApp, oAdaptOptions);
		Core.applyChanges();

		// Assert
		assert.ok(oTitleInfo.text === "Page Title", "the correct title is shown");
		assert.ok(oSpy.calledOnce, "view change called once");

		//cleanup
		Fiori20Adapter.detachViewChange(fnTitleListener);
	});

	QUnit.test("Dependent non-adaptable content is skipped", function (assert) {

		var oView = new HBox({
					items: [
						new Page({title: "Page Title"})
					]
				}),
				oDialog = new Dialog("TestDialog", {
					content: [new Page({title: "Dialog Title"})]
				});

		oView.addDependent(oDialog);

		this.oApp.addPage(oView);

		var oAdaptOptions = {bMoveTitle: true},
				oTitleInfo,
				fnTitleListener = function (oEvent) {
					oTitleInfo = oEvent.getParameter("oTitleInfo");
				},
				oSpy = sinon.spy(fnTitleListener);

		Fiori20Adapter.attachViewChange(oSpy);
		Fiori20Adapter.traverse(this.oApp, oAdaptOptions);
		Core.applyChanges();

		// Assert
		assert.ok(oTitleInfo.text === "Page Title", "the correct title is shown");
		assert.ok(oSpy.calledOnce, "view change called once");

		//cleanup
		Fiori20Adapter.detachViewChange(fnTitleListener);
	});

	QUnit.test("Blacklisted non-adaptable content is skipped", function (assert) {

		var oBlacklistedControl = new Table(),
			oPage = new Page({title: "Page Title", content:[oBlacklistedControl]});

		this.oApp.addPage(oPage);

		var oAdaptOptions = {bMoveTitle: true},
			oTitleInfo,
			fnTitleListener = function (oEvent) {
				oTitleInfo = oEvent.getParameter("oTitleInfo");
			},
			oViewChangeSpy = sinon.spy(fnTitleListener),
			oProcessNodeSpy = sinon.spy(Fiori20Adapter, "_processNode");

		Fiori20Adapter.attachViewChange(oViewChangeSpy);
		Fiori20Adapter.traverse(this.oApp, oAdaptOptions);
		Core.applyChanges();

		// Assert
		assert.ok(oTitleInfo.text === "Page Title", "the correct title is shown");
		assert.ok(oViewChangeSpy.calledOnce, "view change called once");
		assert.ok(oProcessNodeSpy.calledThrice, "3 nodes processed");
		assert.ok(oProcessNodeSpy.calledWith, this.oApp);
		assert.ok(oProcessNodeSpy.calledWith, oPage);
		assert.ok(oProcessNodeSpy.calledWith, oPage._getInternalHeader());
		assert.ok(oProcessNodeSpy.neverCalledWith,oBlacklistedControl);

		//cleanup
		Fiori20Adapter.detachViewChange(fnTitleListener);
	});

	QUnit.module("Utils", {
		beforeEach: function () {
		},
		afterEach: function () {
		}
	});

	QUnit.test("Adaptation is not required for list-based-controls", function(assert) {

		var oAdaptOptions = {bMoveTitle: true, bHideBackButton: true, bCollapseHeader: true},
			oNode = new Table();

		var bRequired = Fiori20Adapter._isAdaptationRequired(oNode, oAdaptOptions);

		// Assert
		assert.strictEqual(bRequired, false, "adaptation is not required");
	});

	QUnit.test("Adaptation is not required if all disabled", function(assert) {

		var oAdaptOptions = {bMoveTitle: false, bHideBackButton: false, bCollapseHeader: false},
			oNode = new Page({title: "Page Title"});

		var bRequired = Fiori20Adapter._isAdaptationRequired(oNode, oAdaptOptions);

		// Assert
		assert.strictEqual(bRequired, false, "adaptation is not required");
	});

	QUnit.test("Adaptation is not required if all options disabled", function(assert) {

		var oAdaptOptions = {bMoveTitle: false, bHideBackButton: false, bCollapseHeader: false},
			oNode = new Page({title: "Page Title"});

		var bRequired = Fiori20Adapter._isAdaptationRequired(oNode, oAdaptOptions);

		// Assert
		assert.strictEqual(bRequired, false, "adaptation is not required");
	});

	QUnit.test("Adaptation is required if any options enabled", function(assert) {

		var oAdaptOptions = {bMoveTitle: true, bHideBackButton: false, bCollapseHeader: false},
			oNode = new Page({title: "Page Title"});

		var bRequired = Fiori20Adapter._isAdaptationRequired(oNode, oAdaptOptions);

		// Assert
		assert.strictEqual(bRequired, true, "adaptation is required");
	});


	QUnit.module("Listeners cache");

	QUnit.test("_checkHasListener", function(assert) {
		var oNavContainer = new sap.m.NavContainer();
		Fiori20Adapter.traverse(oNavContainer, {});
		Fiori20Adapter._setHasListener(oNavContainer, "_adaptableContentChange", function(){});
		Fiori20Adapter._setHasListener(oNavContainer, "navigate", function(){});

		// Assert
		assert.ok(
			Fiori20Adapter._checkHasListener(oNavContainer, "_adaptableContentChange"),
			"listener is saved");
		assert.ok(Fiori20Adapter._checkHasListener(oNavContainer, "navigate"),
			"listener is saved");
	});
});
