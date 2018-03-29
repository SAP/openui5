/*global QUnit*/

(function ($, QUnit) {
	"use strict";

	jQuery.sap.registerModulePath("view", "view");

	sap.ui.controller("viewController", {});

	var core = sap.ui.getCore(),
		viewController = sap.ui.controller("viewController"),
		oHeaderView = sap.ui.xmlview("UxAP-ObjectPageHeader", {
			viewName: "view.UxAP-ObjectPageHeader",
			controller: viewController
		}),
		$title = oHeaderView.$("title"),
		oFactory = {
			getLink: function (sText, sHref) {
				return new sap.m.Link({
					text: sText || "Page 1 long link",
					href: sHref || "http://go.sap.com/index.html"
				});
			}
		};

	oHeaderView.placeAt("qunit-fixture");

	QUnit.module("rendering API");

	QUnit.test("Title block rendering", function (assert) {
		assert.ok($title, "Title block is rendered");
	});

	QUnit.test("Title rendering", function (assert) {
		assert.ok($title.find(".sapUxAPObjectPageHeaderTitleTextWrappable"), "Title is rendered");
	});

	QUnit.test("Markers rendering", function (assert) {
		assert.ok(oHeaderView.$("-favorite"), "Favourite marker is rendered");
		assert.ok(oHeaderView.$("-flag"), "Flag marker is rendered");
	});

	QUnit.test("SelectTitleArrow rendering", function (assert) {
		assert.ok(oHeaderView.$("-titleArrow"), "Title Arrow is rendered");
	});

	QUnit.test("Locked mark rendering", function (assert) {
		assert.ok(oHeaderView.$().find(".sapUxAPObjectPageHeaderLockBtn").length === 1, "Locked mark is rendered");
	});

	QUnit.test("Unsaved changes mark is not rendered when Locked mark is set", function (assert) {
		assert.ok(oHeaderView.$().find(".sapUxAPObjectPageHeaderChangesBtn").length === 0, "Unsaved changes mark is not rendered when Locked mark is set");
	});

	QUnit.test("Unsaved changes mark rendering", function (assert) {
		this._oHeader = core.byId("UxAP-ObjectPageHeader--header");
		this._oHeader.setMarkLocked(false);
		core.applyChanges();

		assert.ok(oHeaderView.$().find(".sapUxAPObjectPageHeaderChangesBtn").length === 1, "Unsaved chages mark is rendered");
	});

	QUnit.test("SubTitle rendering", function (assert) {
		assert.ok(oHeaderView.$().find(".sapUxAPObjectPageHeaderIdentifierDescription").length === 1, "SubTitle is rendered");
	});

	QUnit.test("Image rendering", function (assert) {
		assert.ok($title.find(".sapUxAPObjectPageHeaderObjectImage"), "Image is rendered");
	});

	QUnit.test("Actions rendering", function (assert) {
		assert.ok($title.find(".sapUxAPObjectPageHeaderIdentifierActions"), "Action buttons are rendered");
	});
	QUnit.test("Placeholder rendering", function (assert) {
		assert.ok(oHeaderView.$().find(".sapUxAPObjectPageHeaderPlaceholder"), "placeholder rendered");
	});
	QUnit.test("Updates when header invisible", function (assert) {
		var oPage = oHeaderView.byId("ObjectPageLayout"),
			oHeader = core.byId("UxAP-ObjectPageHeader--header");

		oPage.setVisible(false);
		oPage.setShowTitleInHeaderContent(true);
		core.applyChanges();

		try {
			oHeader.setObjectSubtitle("Updated");
			assert.ok(true, "no error upon update");
		} catch (e) {
			assert.ok(false, "Expected to succeed");
		}

		//restore
		oPage.setVisible(true);
		oPage.setShowTitleInHeaderContent(false);
	});

	QUnit.test("titleSelectorTooltip aggregation validation", function (assert) {
		var oHeader = core.byId("UxAP-ObjectPageHeader--header"),
			oLibraryResourceBundleOP = oHeader.oLibraryResourceBundleOP,
			oTitleArrowIconAggr = oHeader.getAggregation("_titleArrowIcon"),
			oTitleArrowIconContAggr = oHeader.getAggregation("_titleArrowIconCont");

		assert.strictEqual(oHeader.getTitleSelectorTooltip(), "Custom Tooltip", "titleSelectorTooltip aggregation is initially set");
		assert.strictEqual(oTitleArrowIconAggr.getTooltip(), "Custom Tooltip", "_titleArrowIcon aggregation tooltip is initially set");
		assert.strictEqual(oTitleArrowIconContAggr.getTooltip(), "Custom Tooltip", "_titleArrowIconCont aggregation tooltip is initially set");

		oHeader.setTitleSelectorTooltip("Test tooltip");
		core.applyChanges();

		assert.strictEqual(oHeader.getTitleSelectorTooltip(), "Test tooltip", "titleSelectorTooltip aggregation is updated with the new value");
		assert.strictEqual(oTitleArrowIconAggr.getTooltip(), "Test tooltip", "_titleArrowIcon aggregation tooltip is updated with the new value");
		assert.strictEqual(oTitleArrowIconContAggr.getTooltip(), "Test tooltip", "_titleArrowIconCont aggregation tooltip is updated with the new value");

		oHeader.destroyTitleSelectorTooltip();
		core.applyChanges();

		assert.strictEqual(oHeader.getTitleSelectorTooltip(), null, "titleSelectorTooltip aggregation is destroyed");
		assert.strictEqual(oTitleArrowIconAggr.getTooltip(), oLibraryResourceBundleOP.getText("OP_SELECT_ARROW_TOOLTIP"), "_titleArrowIcon aggregation tooltip is set to default");
		assert.strictEqual(oTitleArrowIconContAggr.getTooltip(), oLibraryResourceBundleOP.getText("OP_SELECT_ARROW_TOOLTIP"), "_titleArrowIconCont aggregation tooltip is set to default");
	});

	QUnit.module("image rendering", {
		beforeEach: function () {
			this._oPage = oHeaderView.byId("ObjectPageLayout");
			this._oHeader = core.byId("UxAP-ObjectPageHeader--header");
		}, afterEach: function() {
			this._oPage = null;
			this._oHeader = null;
		}
	});
	QUnit.test("Image is in DOM if image URI", function (assert) {

		assert.strictEqual(oHeaderView.$().find(".sapMImg.sapUxAPObjectPageHeaderObjectImage").length, 1, "image is in DOM");
	});
	QUnit.test("Placeholder is hidden if image URI", function (assert) {

		assert.strictEqual(oHeaderView.$().find(".sapUxAPHidePlaceholder.sapUxAPObjectPageHeaderObjectImage").length, 1, "hidden placeholder is in DOM");
	});
	QUnit.test("Two different images in DOM if showTitleInHeaderContent===true", function (assert) {
		//act
		this._oPage.getHeaderTitle().setObjectImageURI("./img/HugeHeaderPicture.png");
		this._oPage.setShowTitleInHeaderContent(true);
		sap.ui.getCore().applyChanges();

		assert.strictEqual(oHeaderView.$().find(".sapMImg.sapUxAPObjectPageHeaderObjectImage").length, 2, "two images in DOM");

		var img1 = oHeaderView.$().find(".sapMImg.sapUxAPObjectPageHeaderObjectImage")[0],
			img2 = oHeaderView.$().find(".sapMImg.sapUxAPObjectPageHeaderObjectImage")[1];

		assert.notEqual(img1.id, img2.id, "two different images in DOM");
	});
	QUnit.test("Images in DOM updated on URI change", function (assert) {
		var sUpdatedSrc = "./img/imageID_273624.png";
		//act
		this._oPage.getHeaderTitle().setObjectImageURI(sUpdatedSrc);
		this._oPage.setShowTitleInHeaderContent(true);
		sap.ui.getCore().applyChanges();

		assert.strictEqual(oHeaderView.$().find(".sapMImg.sapUxAPObjectPageHeaderObjectImage").length, 2, "two images in DOM");

		var img1 = oHeaderView.$().find(".sapMImg.sapUxAPObjectPageHeaderObjectImage")[0],
			img2 = oHeaderView.$().find(".sapMImg.sapUxAPObjectPageHeaderObjectImage")[1];

		assert.strictEqual($(img1).control()[0].getSrc(), sUpdatedSrc, "image1 is updated");
		assert.strictEqual($(img2).control()[0].getSrc(), sUpdatedSrc, "image2 is updated");
	});
	QUnit.test("Two different placeholders in DOM if showTitleInHeaderContent===true", function (assert) {
		//act
		this._oPage.getHeaderTitle().setObjectImageURI("");
		this._oPage.getHeaderTitle().setShowPlaceholder(true);
		this._oPage.setShowTitleInHeaderContent(true);
		sap.ui.getCore().applyChanges();

		assert.strictEqual(oHeaderView.$().find(".sapUxAPObjectPageHeaderPlaceholder.sapUxAPObjectPageHeaderObjectImage .sapUiIcon").length, 2, "two placeholders in DOM");

		var oPlaceholder1 = oHeaderView.$().find(".sapUxAPObjectPageHeaderPlaceholder.sapUxAPObjectPageHeaderObjectImage .sapUiIcon")[0],
			oPlaceholder2 = oHeaderView.$().find(".sapUxAPObjectPageHeaderPlaceholder.sapUxAPObjectPageHeaderObjectImage .sapUiIcon")[1];

		 assert.notEqual(oPlaceholder1.id, oPlaceholder2.id, "two different placeholders in DOM");
	});

	QUnit.module("Breadcrumbs API", {
		beforeEach: function () {
			this._oHeader = core.byId("UxAP-ObjectPageHeader--header");
		}
	});

	QUnit.test("Legacy breadCrumbsLinks: Trail of links in the ObjectPageHeader should dynamically update", function (assert) {
		var iInitialLinksCount = this._oHeader.getBreadCrumbsLinks().length,
			oNewLink = oFactory.getLink();

		this._oHeader.addBreadCrumbLink(oNewLink);

		assert.strictEqual(this._oHeader.getBreadCrumbsLinks().length, iInitialLinksCount + 1,
			"The link was added to the breadcrumbs");

		assert.strictEqual(this._oHeader.getBreadCrumbsLinks()[iInitialLinksCount].sId, oNewLink.sId,
			"The correct link was added to the breadcrumbs");

		assert.strictEqual(this._oHeader.indexOfBreadCrumbLink(oNewLink), iInitialLinksCount);

		this._oHeader.removeBreadCrumbLink(oNewLink);

		assert.strictEqual(this._oHeader.getBreadCrumbsLinks().length, iInitialLinksCount,
			"The link was removed from the breadcrumbs");

		assert.strictEqual(this._oHeader.getBreadCrumbsLinks().indexOf(oNewLink), -1,
			"The link was removed from the breadcrumbs");

		this._oHeader.removeAllBreadCrumbsLinks();

		assert.ok(!this._oHeader.getBreadCrumbsLinks().length,
			"There are no breadcrumb links left");

		this._oHeader.insertBreadCrumbLink(oNewLink, 0);

		assert.strictEqual(this._oHeader.getBreadCrumbsLinks()[0].sId, oNewLink.sId,
			"The link was added to in the correct position in the breadcrumb");

		this._oHeader.destroyBreadCrumbsLinks();

		assert.ok(oNewLink.bIsDestroyed, "There breadcrumbs are destroyed");
	});

	QUnit.module("API");

	QUnit.test("setObjectTitle", function (assert) {
		var sHeaderTitle = "myTitle",
			sHeaderNewTitle = "myNewTitle",
			oHeaderTitle =  new sap.uxap.ObjectPageHeader({
			isObjectTitleAlwaysVisible: false,
			objectTitle: sHeaderTitle
		}),
		oNotifyParentSpy = this.spy(oHeaderTitle, "_notifyParentOfChanges"),
		oObjectPageWithHeaderOnly = new sap.uxap.ObjectPageLayout({
			showTitleInHeaderContent:true,
			headerTitle: oHeaderTitle
		}).placeAt("qunit-fixture");

		sap.ui.getCore().applyChanges();

		assert.equal(oHeaderTitle.getObjectTitle(), sHeaderTitle, "The initial title text is set correctly: " + sHeaderTitle);
		assert.ok(!oNotifyParentSpy.called, "_notifyParentOfChanges not called on first rendering");

		oHeaderTitle.setObjectTitle(sHeaderNewTitle);
		assert.equal(oHeaderTitle.getObjectTitle(), sHeaderNewTitle, "The new title text is set correctly: " + sHeaderNewTitle);
		assert.equal(oNotifyParentSpy.callCount, 1, "_notifyParentOfChanges called once after runtime change of the title text");

		oObjectPageWithHeaderOnly.destroy();
	});

	QUnit.module("Private API", {
		beforeEach: function() {
			var sViewXML = '<core:View xmlns:core="sap.ui.core" xmlns="sap.uxap" xmlns:layout="sap.ui.layout" xmlns:m="sap.m" height="100%">' +
							'<m:App>' +
								'<ObjectPageLayout id="objectPageLayout" subSectionLayout="TitleOnLeft">' +
									'<headerTitle>' +
										'<ObjectPageHeader id = "applicationHeader" objectTitle="My Pastube">' +
											'<actions>' +
												'<m:CheckBox id="testCheckBox" text="Test"/>' +
												'<ObjectPageHeaderActionButton id="installButton" text="Install" hideIcon="true" hideText="false" type="Emphasized"/>' +
											'</actions>' +
										'</ObjectPageHeader>' +
									'</headerTitle>' +
								'</ObjectPageLayout>' +
							'</m:App>' +
							'</core:View>';

			this.myView = sap.ui.xmlview({ viewContent: sViewXML });
			this.myView.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function() {
			this.myView.destroy();
		}
	});

	QUnit.test("_adaptActions", function (assert) {
		var oHeader = core.byId("UxAP-ObjectPageHeader--header"),
			$overflowButton = oHeader._oOverflowButton.$();

		oHeader._adaptActions(100);

		assert.strictEqual($overflowButton.css("display"), "inline-block", "OverflowButton is shown");

		oHeader._adaptActions(1000);

		assert.strictEqual($overflowButton.css("display"), "none", "OverflowButton is hidden when not needed");
	});

	QUnit.test("_adaptLayoutForDomElement", function (assert) {
		this.stub(sap.ui.Device, "system", {
			desktop: false,
			phone: true,
			tablet: false
		});

		this.stub(sap.ui.Device, "orientation", {
			portrait: true,
			landscape: false
		});

		// assert
		assert.strictEqual(this.myView.byId("installButton").$().css("visibility"), "visible", "Button is visible");

		this.myView.byId("applicationHeader")._adaptLayoutForDomElement();

		// assert
		assert.strictEqual(this.myView.byId("installButton").$().css("visibility"), "visible", "Button is visible");
	});

	QUnit.test("_getActionsWidth", function (assert) {
		this.stub(sap.ui.Device, "system", {
			desktop: false,
			phone: true,
			tablet: false
		});

		this.stub(sap.ui.Device, "orientation", {
			portrait: true,
			landscape: false
		});

		// act
		this.myView.byId("applicationHeader")._getActionsWidth();

		// assert
		assert.strictEqual(this.myView.byId("testCheckBox").$().css("visibility"), "visible", "sap.m.CheckBox is visible");
		assert.strictEqual(this.myView.byId("installButton").$().css("visibility"), "hidden", "ObjectPageHeaderActionButton is hidden");
	});

	QUnit.module("Action buttons", {
		beforeEach: function () {
			this._oHeader = core.byId("UxAP-ObjectPageHeader--header");
		}
	});

	QUnit.test("Adding action buttons as invisible doesn't prevent them from becoming transparent", function (assert) {

		var oActionButton = new sap.uxap.ObjectPageHeaderActionButton({
			text:"Invisible Button",
			visible: false
		});

		this._oHeader.addAction(oActionButton);

		sap.ui.getCore().applyChanges();

		oActionButton.setVisible(true);

		sap.ui.getCore().applyChanges();

		assert.strictEqual(oActionButton.getType(), "Transparent",
			"The button is transparent");
	});

	QUnit.test("Setting visibility to action buttons", function (assert) {
		var oButton = new sap.m.Button({
			text : "Some button",
			visible: false
		});

		this._oHeader.addAction(oButton);

		sap.ui.getCore().applyChanges();

		oButton.setVisible(true);

		sap.ui.getCore().applyChanges();

		assert.strictEqual(oButton._getInternalVisible(), true, "The button is visible");
		assert.ok(this._oHeader._oOverflowButton.$().is(':hidden'), "There is no overflow button");

		oButton.setVisible(false);

		sap.ui.getCore().applyChanges();

		assert.strictEqual(oButton._getInternalVisible(), false, "The button is invisible");
		assert.ok(this._oHeader._oOverflowButton.$().is(':hidden'), "There is no overflow button");

	});

	QUnit.module("Breadcrumbs rendering", {
		beforeEach: function () {
			this._oHeader = core.byId("UxAP-ObjectPageHeader--header");
			this._oHeader.destroyBreadCrumbsLinks();
			this._oHeader.destroyBreadcrumbs();
			core.applyChanges();
		}
	});

	QUnit.test("There should be no BreadCrumbs rendered", function (assert) {
		assert.strictEqual(oHeaderView.$().find(".sapMBreadcrumbs").length, 0, "There are No instances of sap.m.Breadcrumbs rendered in ObjectPageHeader");
	});

	QUnit.test("After inserting a link in Legacy breadCrumnsLinks aggregation, the Legacy breadCrumbsLinks aggregation should be rendered", function (assert) {
		this._oHeader.insertBreadCrumbLink(oFactory.getLink());
		core.applyChanges();
		assert.strictEqual(oHeaderView.$().find(".sapMBreadcrumbs").length, 1, "There is one instance of sap.m.Breadcrumbs rendered in ObjectPageHeader");
		assert.ok(this._oHeader.getBreadCrumbsLinks()[0].$().length > 0, "Legacy breadCrumbsLinks is rendered");
	});

	QUnit.test("After setting the New breadcrumbs aggregation, the New breadcrumbs aggregation should be rendered", function (assert) {
		this._oHeader.setBreadcrumbs(new sap.m.Breadcrumbs());
		core.applyChanges();
		assert.strictEqual(oHeaderView.$().find(".sapMBreadcrumbs").length, 1, "There is one instance of sap.m.Breadcrumbs rendered in ObjectPageHeader");
		assert.ok(this._oHeader.getBreadcrumbs().$().length > 0, "the New breadcrumbs aggregation is rendered");
	});

	QUnit.test("Having both New breadcrumbs and Legacy breadCrumbsLinks, the New breadcrumbs aggregation should be rendered", function (assert) {
		this._oHeader.setBreadcrumbs(new sap.m.Breadcrumbs());
		this._oHeader.insertBreadCrumbLink(oFactory.getLink());
		core.applyChanges();
		assert.strictEqual(oHeaderView.$().find(".sapMBreadcrumbs").length, 1, "There is one instance of sap.m.Breadcrumbs rendered in ObjectPageHeader");
		assert.ok(this._oHeader.getBreadcrumbs().$().length > 0, "the New breadcrumbs aggregation is rendered");
		assert.strictEqual(this._oHeader.getBreadCrumbsLinks()[0].$().length, 0, "Legacy breadCrumbsLinks is Not rendered");
	});

	QUnit.test("Having both New breadcrumbs and Legacy breadCrumbsLinks. After destroying the New breadcrumbs, Legacy breadCrumbsLinks should be rendered", function (assert) {
		this._oHeader.setBreadcrumbs(new sap.m.Breadcrumbs());
		this._oHeader.insertBreadCrumbLink(oFactory.getLink());
		core.applyChanges();
		this._oHeader.destroyBreadcrumbs();
		core.applyChanges();
		assert.strictEqual(oHeaderView.$().find(".sapMBreadcrumbs").length, 1, "There is one instance of sap.m.Breadcrumbs rendered in ObjectPageHeader");
		assert.ok(this._oHeader.getBreadCrumbsLinks()[0].$().length > 0, "Legacy breadCrumbsLinks is rendered");
	});

	QUnit.test("Having the New breadcrumbs aggregation. After adding the Legacy breadCrumbsLinks, New  breadcrumbs should remain rendered", function (assert) {
		this._oHeader.setBreadcrumbs(new sap.m.Breadcrumbs());
		core.applyChanges();
		this._oHeader.insertBreadCrumbLink(oFactory.getLink());
		core.applyChanges();
		assert.strictEqual(oHeaderView.$().find(".sapMBreadcrumbs").length, 1, "There is one instance of sap.m.Breadcrumbs rendered in ObjectPageHeader");
		assert.ok(this._oHeader.getBreadcrumbs().$().length > 0, "the New breadcrumbs aggregation should be rendered");
	});

	QUnit.module("Lifecycle", {
		beforeEach: function () {
			this.oOPH = new sap.uxap.ObjectPageHeader();
		},
		afterEach: function () {
			this.oOPH.destroy();
			this.oOPH = null;
		},
		/**
		 * Fill internal object with mock buttons to simulate rendered control with buttons
		 */
		generateMockedASButtons: function () {
			this.mockButton1 = new sap.m.Button();
			this.mockButton2 = new sap.m.Button();

			this.oOPH._oActionSheetButtonMap = {
				__button1: this.mockButton1,
				__button2: this.mockButton2
			};
		},
		/**
		 * Assert that there are no available buttons in the map and all mock buttons are destroyed
		 * @param {object} assert qUnit "assert" reference
		 */
		assertAllButtonsAreDestroyed: function (assert) {
			assert.strictEqual(this.mockButton1._bIsBeingDestroyed, true, "Mock button 1 is destroyed");
			assert.strictEqual(this.mockButton2._bIsBeingDestroyed, true, "Mock button 2 is destroyed");
			assert.deepEqual(this.oOPH._oActionSheetButtonMap, {}, "Internal _oActionSheetButtonMap should be empty");
		}
	});

	QUnit.test("_oActionSheetButtonMap contained buttons are destroyed on re-rendering", function (assert) {
		// Arrange
		this.generateMockedASButtons();

		// Act - call onBeforeRendering to simulate control invalidation
		this.oOPH.onBeforeRendering.call(this.oOPH);

		// Assert
		this.assertAllButtonsAreDestroyed(assert);
	});

	QUnit.test("_oActionSheetButtonMap contained buttons are destroyed on control destruction", function (assert) {
		// Arrange
		this.generateMockedASButtons();

		// Act - destroy the control
		this.oOPH.destroy();

		// Assert
		this.assertAllButtonsAreDestroyed(assert);
	});

	QUnit.test("_resetActionSheetMap method destroys all buttons and empty's the object", function (assert) {
		// Arrange
		this.generateMockedASButtons();

		// Act
		this.oOPH._resetActionSheetMap.call(this.oOPH);

		// Assert
		this.assertAllButtonsAreDestroyed(assert);
	});

}(jQuery, QUnit));
