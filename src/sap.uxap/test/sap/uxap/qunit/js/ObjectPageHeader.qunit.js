(function ($, QUnit) {
	"use strict";

	var core = sap.ui.getCore();

	sinon.config.useFakeTimers = true;

	jQuery.sap.registerModulePath("view", "view");

	sap.ui.controller("viewController", {});

	var viewController = new sap.ui.controller("viewController"),
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

	oHeaderView.placeAt('qunit-fixture');

	QUnit.module("rendering API");

	QUnit.test("Title block rendering", function (assert) {
		assert.ok($title, "Title block is rendered");
	});

	QUnit.test("Title rendering", function (assert) {
		assert.ok($title.find("sapUxAPObjectPageHeaderTitleTextWrappable"), "Title is rendered");
	});

	QUnit.test("Markers rendering", function (assert) {
		assert.ok(oHeaderView.$("-favorite"), "Favourite marker is rendered");
		assert.ok(oHeaderView.$("-flag"), "Flag marker is rendered");
	});

	QUnit.test("SelectTitleArrow rendering", function (assert) {
		assert.ok(oHeaderView.$("-titleArrow"), "Title Arrow is rendered");
	});

	QUnit.test("Locked mark rendering", function (assert) {
		assert.ok(oHeaderView.$("-lock"), "Locked mark is rendered");
	});

	QUnit.test("SubTitle rendering", function (assert) {
		assert.ok(oHeaderView.$("-subtitle"), "SubTitle is rendered");
	});

	QUnit.test("Image rendering", function (assert) {
		assert.ok($title.find(".sapUxAPObjectPageHeaderObjectImage"), "Image is rendered");
	});

	QUnit.test("Actions rendering", function (assert) {
		assert.ok($title.find("sapUxAPObjectPageHeaderIdentifierActions"), "Action buttons are rendered");
	});
	QUnit.test("Placeholder rendering", function (assert) {
		assert.ok(oHeaderView.$().find("sapUxAPObjectPageHeaderPlaceholder"), "placeholder rendered");
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

	QUnit.test("When the header title is changed so is the currentLocation of the breadcrumbs control", function (assert) {
		var oTitle = this._oHeader.getObjectTitle(),
			oBreadcrumbs = this._oHeader._getInternalAggregation("_breadCrumbs"),
			sNewTitle = "newTitle";

		assert.strictEqual(oBreadcrumbs.getCurrentLocation().getText(), oTitle);

		this._oHeader.setObjectTitle(sNewTitle);

		assert.strictEqual(oBreadcrumbs.getCurrentLocation().getText(), sNewTitle);
	});

}(jQuery, QUnit));
