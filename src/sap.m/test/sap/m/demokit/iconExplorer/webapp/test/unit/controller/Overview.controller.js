sap.ui.define([
		"sap/ui/demo/iconexplorer/controller/Overview.controller",
		"sap/ui/demo/iconexplorer/controller/BaseController",
		"sap/ui/base/ManagedObject",
		"test/unit/helper/FakeI18nModel",
		"sap/ui/thirdparty/sinon",
		"sap/ui/thirdparty/sinon-qunit"
	], function(OverviewController, BaseController ,ManagedObject, FakeI18n) {
	"use strict";

	QUnit.module("Overview controller tests", {

		beforeEach: function () {
			this.oOverviewController = new OverviewController();
			this.oRouterStub = {
				navTo: sinon.stub()
			};
			this.oViewStub = new ManagedObject();
			this.oComponentStub = new ManagedObject();
			this.oComponentStub.setModel(new FakeI18n(), "i18n");

			sinon.stub(this.oOverviewController, "getRouter").returns(this.oRouterStub);
			sinon.stub(this.oOverviewController, "getOwnerComponent").returns(this.oComponentStub);
			sinon.stub(this.oOverviewController, "getView").returns(this.oViewStub);

			this.oOverviewController._oCurrentQueryContext = {};
		},

		afterEach: function () {
			this.oOverviewController.destroy();
			this.oViewStub.destroy();
			this.oComponentStub.destroy();
		}
	});

	QUnit.test("Should keep the context and set the new value when updating the hash", function () {
		this.oOverviewController._oCurrentQueryContext.tab = "test";
		this.oOverviewController._oCurrentQueryContext.icon = "test";
		this.oOverviewController._oCurrentQueryContext.tag = "test";
		this.oOverviewController._oCurrentQueryContext.cat = "test";
		this.oOverviewController._oCurrentQueryContext.search = "test";

		this.oOverviewController._updateHash("icon", "new");
		sinon.assert.calledWith(this.oRouterStub.navTo, "overview", {query: {
			tab: "test",
			icon: "new",
			tag: "test",
			cat: "test",
			search: "test"
		}});
	});

	QUnit.test("Should write the parameter to the hash if key and value are passed", function () {
		this.oOverviewController._updateHash("foo", "bar");
		sinon.assert.calledWith(this.oRouterStub.navTo, "overview", {query: {foo: "bar"}});
	});

	QUnit.test("Should update the tab properly in the hash", function () {
		this.oOverviewController._updateHash("tab", "test");
		sinon.assert.calledWith(this.oRouterStub.navTo, "overview", {query: {tab: "test"}});
	});

	QUnit.test("Should update the icon properly in the hash", function () {
		this.oOverviewController._updateHash("icon", "test");
		sinon.assert.calledWith(this.oRouterStub.navTo, "overview", {query: {icon: "test"}});
	});

	QUnit.test("Should update the tag properly in the hash", function () {
		this.oOverviewController._updateHash("tag", "test");
		sinon.assert.calledWith(this.oRouterStub.navTo, "overview", {query: {tag: "test"}});
	});

	QUnit.test("Should update the category properly in the hash", function () {
		this.oOverviewController._updateHash("cat", "test");
		sinon.assert.calledWith(this.oRouterStub.navTo, "overview", {query: {cat: "test"}});
	});

	QUnit.test("Should update the search properly in the hash", function () {
		this.oOverviewController._updateHash("search", "test");
		sinon.assert.calledWith(this.oRouterStub.navTo, "overview", {query: {search: "test"}});
	});

	QUnit.test("Should reset tag and search in the hash when passing reset", function () {
		this.oOverviewController._oCurrentQueryContext.tab = "test";
		this.oOverviewController._oCurrentQueryContext.icon = "test";
		this.oOverviewController._oCurrentQueryContext.tag = "test";
		this.oOverviewController._oCurrentQueryContext.cat = "test";
		this.oOverviewController._oCurrentQueryContext.search = "test";

		this.oOverviewController._updateHash("reset");
		sinon.assert.calledWith(this.oRouterStub.navTo, "overview", {query: {tab: "test", icon: "test"}});
	});

	QUnit.test("Should reset search in the hash when passing no value", function () {
		this.oOverviewController._oCurrentQueryContext.search = "test";

		this.oOverviewController._updateHash("search");
		sinon.assert.calledWith(this.oRouterStub.navTo, "overview", {query: {}});
	});

	QUnit.test("Should reset tag in the hash when passing no value", function () {
		this.oOverviewController._oCurrentQueryContext.tag = "test";

		this.oOverviewController._updateHash("tag");
		sinon.assert.calledWith(this.oRouterStub.navTo, "overview", {query: {}});
	});

	QUnit.test("Should reset icon in the hash when passing no value", function () {
		this.oOverviewController._oCurrentQueryContext.icon = "test";

		this.oOverviewController._updateHash("icon");
		sinon.assert.calledWith(this.oRouterStub.navTo, "overview", {query: {}});
	});

	QUnit.test("Should reset tag if category was changed", function () {
		this.oOverviewController._oCurrentQueryContext.tag = "test";
		this.oOverviewController._oCurrentQueryContext.cat = "test";

		this.oOverviewController._updateHash("cat", "new");
		sinon.assert.calledWith(this.oRouterStub.navTo, "overview", {query: {cat: "new"}});
	});

	QUnit.test("Should reset tag if category was changed to favorites", function () {
		this.oOverviewController._oCurrentQueryContext.tag = "test";
		this.oOverviewController._oCurrentQueryContext.tab = "details";

		this.oOverviewController._updateHash("tab", "favorites");
		sinon.assert.calledWith(this.oRouterStub.navTo, "overview", {query: {tab: "favorites"}});
	});

	QUnit.test("Should reset tag if category was changed from favorites", function () {
		this.oOverviewController._oCurrentQueryContext.tag = "test";
		this.oOverviewController._oCurrentQueryContext.tab = "favorites";

		this.oOverviewController._updateHash("tab", "details");
		sinon.assert.calledWith(this.oRouterStub.navTo, "overview", {query: {tab: "details"}});
	});

});
