(function ($, QUnit) {
	"use strict";

	jQuery.sap.registerModulePath("view", "view");

	sap.ui.controller("viewController", {});

	var core = sap.ui.getCore(),
		viewController = new sap.ui.controller("viewController"),
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
		ok(oHeaderView.$().find(".sapUxAPObjectPageHeaderChangesBtn").length === 0, "Unsaved changes mark is not rendered when Locked mark is set");
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

	QUnit.module("Breadcrumb links API", {
		setup: function () {
			this._oHeader = core.byId("UxAP-ObjectPageHeader--header");
		}
	});

	QUnit.test("The Breadcrumb trail of links in the ObjectPageHeader should dynamically update", function (assert) {
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

	QUnit.module("Action buttons", {
		setup: function () {
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

}(jQuery, QUnit));
