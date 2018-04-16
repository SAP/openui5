/*global QUnit*/

(function ($, QUnit) {
	"use strict";

	jQuery.sap.registerModulePath("view", "view");



	QUnit.module("API", {
		beforeEach: function () {
			this.contentView = sap.ui.xmlview("UxAP-ObjectPageHeaderContent", {
				viewName: "view.UxAP-ObjectPageHeaderContent"
			});
			this.contentView.placeAt('qunit-fixture');
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.contentView.destroy();
		}
	});

	QUnit.test("HeaderContent rendering", function (assert) {
		assert.ok(this.contentView.$().find(".sapUxAPObjectPageHeaderContent"), "HeaderContent div is rendered");
	});

	QUnit.test("showTitleInHeaderContent", function (assert) {
		assert.ok(this.contentView.$().find(".sapUxAPObjectPageHeaderIdentifierTitleInContent"), "Title is rendered inside the HeaderContent");
	});

	QUnit.test("showEditHeaderBtn", function (assert) {
		var oPl = this.contentView.byId("ObjectPageLayout");
		oPl.setShowEditHeaderButton(true);
		sap.ui.getCore().applyChanges();

		var aEditHeaderBtn = oPl._getHeaderContent().$().find('#__content2-editHeaderBtn');

		assert.ok(aEditHeaderBtn.length === 1, "button is rendered inside the HeaderContent");

		oPl.rerender();
		aEditHeaderBtn = oPl._getHeaderContent().$().find('#__content2-editHeaderBtn');

		assert.ok(aEditHeaderBtn.length === 1, "button is rendered inside the HeaderContent after rerender");
	});

	QUnit.module("ObjectPageHeaderContent integration inside ObjectPageLayout", {
		beforeEach: function () {
			this.contentView = sap.ui.xmlview("UxAP-ObjectPageHeaderContent", {
				viewName: "view.UxAP-ObjectPageHeaderContent"
			});
			this.contentView.placeAt('qunit-fixture');
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.contentView.destroy();
		}
	});

	QUnit.test("indexOfHeaderContent", function (assert) {
		assert.equal(this.contentView.byId("ObjectPageLayout").indexOfHeaderContent(sap.ui.getCore().byId("UxAP-ObjectPageHeaderContent--testLink")), 0, "the Link inside the ContentHeader aggregation is on 0 position");
	});

	QUnit.test("insertHeaderContent", function (assert) {
		this.contentView.byId("ObjectPageLayout").insertHeaderContent(new sap.m.Label({id: "label1", text: "label1"}), 1);
		sap.ui.getCore().applyChanges();

		assert.equal(this.contentView.byId("ObjectPageLayout").getHeaderContent().length, 5, "contents length is 5 after inserting element in the HeaderContent aggregation");
		assert.equal(this.contentView.byId("ObjectPageLayout").indexOfHeaderContent(sap.ui.getCore().byId("label1")), 1, "the label1 inside the ContentHeader aggregation is insert on 1 position");
	});

	QUnit.test("addHeaderContent", function (assert) {
		this.contentView.byId("ObjectPageLayout").addHeaderContent(new sap.m.Label({id: "label2", text: "label2"}));
		sap.ui.getCore().applyChanges();

		assert.equal(this.contentView.byId("ObjectPageLayout").getHeaderContent().length, 5, "contents length is 5 after inserting element in the HeaderContent aggregation");
		assert.equal(this.contentView.byId("ObjectPageLayout").indexOfHeaderContent(sap.ui.getCore().byId("label2")), 4, "the label2 inside the ContentHeader aggregation is added on the last position");
	});

	QUnit.test("removeHeaderContent", function (assert) {
		var oToRemove = this.contentView.byId("testLink");
		this.contentView.byId("ObjectPageLayout").removeHeaderContent(oToRemove);
		sap.ui.getCore().applyChanges();

		assert.equal(this.contentView.byId("ObjectPageLayout").getHeaderContent().length, 3, "contents length is 5 after removing one item");

		//cleanup needed since we removed that item from its parent aggregation
		oToRemove.destroy();
	});

	QUnit.test("removeAllHeaderContent", function (assert) {
		var oRemovedContent = this.contentView.byId("ObjectPageLayout").removeAllHeaderContent();
		sap.ui.getCore().applyChanges();

		assert.equal(this.contentView.byId("ObjectPageLayout").getHeaderContent().length, 0, "contents length is 0 after removing it all");

		//cleanup needed since we removed those items from their parent aggregation
		oRemovedContent.forEach(function(oItem) {oItem.destroy();});
	});

	QUnit.test("destroyHeaderContent", function (assert) {
		this.contentView.byId("ObjectPageLayout").addHeaderContent(new sap.m.Label({id: "label3", text: "label3"}));
		sap.ui.getCore().applyChanges();

		this.contentView.byId("ObjectPageLayout").destroyHeaderContent();
		sap.ui.getCore().applyChanges();

		assert.equal(this.contentView.byId("ObjectPageLayout").getHeaderContent().length, 0, "contents length is 0 after destroying HeaderContent");
	});

	QUnit.module("Dynamic Header State Preserved On Scroll", {
		beforeEach: function () {
			this.oObjectPageWithPreserveHeaderStateOnScroll = new sap.uxap.ObjectPageLayout({
				preserveHeaderStateOnScroll: true
			});
			this.oObjectPageWithPreserveHeaderStateOnScroll.setHeaderTitle(new sap.uxap.ObjectPageDynamicHeaderTitle());
			this.oObjectPageWithPreserveHeaderStateOnScroll.addHeaderContent(new sap.m.Text({text: "test"}));
			this.oObjectPageWithPreserveHeaderStateOnScroll.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.oObjectPageWithPreserveHeaderStateOnScroll.destroy();
			this.oObjectPageWithPreserveHeaderStateOnScroll = null;
		}
	});

	QUnit.test("Dynamic Header rendered within Header Wrapper", function (assert) {
		var $headerWrapper = this.oObjectPageWithPreserveHeaderStateOnScroll.$("headerTitle"),
			sHeaderId = this.oObjectPageWithPreserveHeaderStateOnScroll._getHeaderContent().getId();

		assert.equal($headerWrapper.find("#" + sHeaderId).length, 1, "The Header is in the Header Title Wrapper");
	});

	QUnit.test("Dynamic Pin button is hidden", function (assert) {
		var $pinButtonDom = this.oObjectPageWithPreserveHeaderStateOnScroll._getHeaderContent().getAggregation("_pinButton").getDomRef();

		assert.equal($pinButtonDom, null, "The Dynamic Header Pin Button not rendered");
	});

	QUnit.module("Header content initialization");

	QUnit.test("setShowHeaderContent before rendering", function (assert) {

		var oObjectPage = new sap.uxap.ObjectPageLayout({
			showHeaderContent: false
		});

		assert.equal(oObjectPage.getShowHeaderContent(), false, "The value is applied");

		oObjectPage.destroy();
	});

	QUnit.module("ObjectPageLayout content resize");

	QUnit.test("addHeaderContent", function (assert) {
		var contentView = sap.ui.xmlview("UxAP-ObjectPageHeaderContent", {
			viewName: "view.UxAP-ObjectPageHeaderContent"
		}),
		oObjectPageLayout = contentView.byId("ObjectPageLayout"),
		oResizableControl = new sap.ui.core.HTML({content: "<div style='height:100px'></div>"}),
		done = assert.async(),
		bResizeListenerCalled = false;

		oObjectPageLayout.addHeaderContent(oResizableControl);

		// proxy the resize listener to check if called
		var fnOrig = oObjectPageLayout._onUpdateContentSize;
		oObjectPageLayout._onUpdateContentSize = function() {
			bResizeListenerCalled = true;
			fnOrig.apply(this, arguments);
		};

		// wait for the point where the listener is internally attached
		oObjectPageLayout.attachEventOnce("onAfterRenderingDOMReady", function() {
			// act
			oResizableControl.getDomRef().style.height = "10px"; //decrease height of content
			setTimeout(function() {
				// check
				assert.ok(bResizeListenerCalled, "_onUpdateContentSize method is called");
				contentView.destroy();
				done();
			}, 500 /* wait for resizeHandler to be triggered */);
		});

		contentView.placeAt('qunit-fixture');
	});

}(jQuery, QUnit));
