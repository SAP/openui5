/*global QUnit*/
sap.ui.define(["sap/ui/thirdparty/jquery",
                "sap/ui/core/Core",
                "sap/m/Label",
                "sap/m/Text",
                "sap/uxap/ObjectPageDynamicHeaderTitle",
                "sap/uxap/ObjectPageLayout",
                "sap/uxap/testblocks/GenericDiv",
                "sap/ui/core/mvc/XMLView"],
function (jQuery, Core, Label, Text, ObjectPageDynamicHeaderTitle, ObjectPageLayout, GenericDiv, XMLView) {
	"use strict";

	QUnit.module("API", {
		beforeEach: function (assert) {
			var done = assert.async();
			XMLView.create({
				id: "UxAP-ObjectPageHeaderContent",
				viewName: "view.UxAP-ObjectPageHeaderContent"
			}).then(function (oView) {
				this.contentView = oView;
				this.contentView.placeAt("qunit-fixture");
				Core.applyChanges();
				done();
			}.bind(this));
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
		Core.applyChanges();

		var aEditHeaderBtn = oPl._getHeaderContent().$().find('#UxAP-ObjectPageHeaderContent--ObjectPageLayout-OPHeaderContent-editHeaderBtn');

		assert.ok(aEditHeaderBtn.length === 1, "button is rendered inside the HeaderContent");

		oPl.rerender();
		aEditHeaderBtn = oPl._getHeaderContent().$().find('#UxAP-ObjectPageHeaderContent--ObjectPageLayout-OPHeaderContent-editHeaderBtn');

		assert.ok(aEditHeaderBtn.length === 1, "button is rendered inside the HeaderContent after rerender");
	});

	QUnit.module("ObjectPageHeaderContent integration inside ObjectPageLayout", {
		beforeEach: function (assert) {
			var done = assert.async();
			XMLView.create({
				id: "UxAP-ObjectPageHeaderContent",
				viewName: "view.UxAP-ObjectPageHeaderContent"
			}).then(function (oView) {
				this.contentView = oView;
				this.contentView.placeAt("qunit-fixture");
				Core.applyChanges();
				done();
			}.bind(this));
		},
		afterEach: function () {
			this.contentView.destroy();
		}
	});

	QUnit.test("Title and Subtitle IDs are correct", function (assert) {
		var sId = "#UxAP-ObjectPageHeaderContent--headerForTest";

		assert.strictEqual(jQuery(sId + "-title").length, 1, "Title in header ID is unique");
		assert.strictEqual(jQuery(sId + "-title-content").length, 1, "Title in content ID is unique");
		assert.strictEqual(jQuery(sId + "-innerTitle").length, 1, "Inner title in header ID is unique");
		assert.strictEqual(jQuery(sId + "-innerTitle-content").length, 1, "Inner title in content ID is unique");
		assert.strictEqual(jQuery(sId + "-subtitle").length, 1, "Subtitle in header ID is unique");
		assert.strictEqual(jQuery(sId + "-subtitle-content").length, 1, "Subtitle in content ID is unique");
	});

	QUnit.test("indexOfHeaderContent", function (assert) {
		var oPage = this.contentView.byId("ObjectPageLayout"),
			oNestedControl = Core.byId("UxAP-ObjectPageHeaderContent--testLink");
		assert.equal(oPage.indexOfHeaderContent(oNestedControl), 0, "the Link inside the ContentHeader aggregation is on 0 position");
		assert.strictEqual(oNestedControl.getParent().getId(), oPage.getId(), "control parent is correct");
	});

	QUnit.test("insertHeaderContent", function (assert) {
		var oPage = this.contentView.byId("ObjectPageLayout"),
			oControl = new Label({id: "label1", text: "label1"});

		oPage.insertHeaderContent(oControl, 1);
		Core.applyChanges();

		assert.equal(oPage.getHeaderContent().length, 5, "contents length is 5 after inserting element in the HeaderContent aggregation");
		assert.equal(oPage.indexOfHeaderContent(Core.byId("label1")), 1, "the label1 inside the ContentHeader aggregation is insert on 1 position");
		assert.strictEqual(oControl.getParent().getId(), oPage.getId(), "control parent is correct");
	});

	QUnit.test("addHeaderContent", function (assert) {
		var oPage = this.contentView.byId("ObjectPageLayout"),
			oControl = new Label({id: "label2", text: "label2"});

		oPage.addHeaderContent(oControl);
		Core.applyChanges();

		assert.equal(this.contentView.byId("ObjectPageLayout").getHeaderContent().length, 5, "contents length is 5 after inserting element in the HeaderContent aggregation");
		assert.equal(this.contentView.byId("ObjectPageLayout").indexOfHeaderContent(Core.byId("label2")), 4, "the label2 inside the ContentHeader aggregation is added on the last position");
		assert.strictEqual(oControl.getParent().getId(), oPage.getId(), "control parent is correct");
	});

	QUnit.test("removeHeaderContent", function (assert) {
		var oPage = this.contentView.byId("ObjectPageLayout"),
			oToRemove = this.contentView.byId("testLink");

		oPage.removeHeaderContent(oToRemove);
		Core.applyChanges();

		assert.equal(oPage.getHeaderContent().length, 3, "contents length is 5 after removing one item");
		assert.strictEqual(oToRemove.getParent(), null, "control parent is correct");

		//cleanup needed since we removed that item from its parent aggregation
		oToRemove.destroy();
	});

	QUnit.test("removeAllHeaderContent", function (assert) {
		var oRemovedContent = this.contentView.byId("ObjectPageLayout").removeAllHeaderContent();
		Core.applyChanges();

		assert.equal(this.contentView.byId("ObjectPageLayout").getHeaderContent().length, 0, "contents length is 0 after removing it all");

		oRemovedContent.forEach(function(oItem) {
			assert.strictEqual(oItem.getParent(), null, "control parent is correct");
		});
		//cleanup needed since we removed those items from their parent aggregation
		oRemovedContent.forEach(function(oItem) {oItem.destroy();});
	});

	QUnit.test("destroyHeaderContent", function (assert) {
		this.contentView.byId("ObjectPageLayout").addHeaderContent(new Label({id: "label3", text: "label3"}));
		Core.applyChanges();

		this.contentView.byId("ObjectPageLayout").destroyHeaderContent();
		Core.applyChanges();

		assert.equal(this.contentView.byId("ObjectPageLayout").getHeaderContent().length, 0, "contents length is 0 after destroying HeaderContent");
	});

	QUnit.module("Dynamic Header State Preserved On Scroll", {
		beforeEach: function () {
			this.oObjectPageWithPreserveHeaderStateOnScroll = new ObjectPageLayout({
				preserveHeaderStateOnScroll: true
			});
			this.oObjectPageWithPreserveHeaderStateOnScroll.setHeaderTitle(new ObjectPageDynamicHeaderTitle());
			this.oObjectPageWithPreserveHeaderStateOnScroll.addHeaderContent(new Text({text: "test"}));
			this.oObjectPageWithPreserveHeaderStateOnScroll.placeAt("qunit-fixture");
			Core.applyChanges();
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

	QUnit.test("Dynamic Header with exceeding height override 'preserveHeaderStateOnScroll' property", function (assert) {
		var oObjectPage = this.oObjectPageWithPreserveHeaderStateOnScroll;

		// Setup header too big to be preserved in the title area
		oObjectPage.$().height(1000);
		oObjectPage.getHeaderTitle().$().height(300);
		oObjectPage._getHeaderContent().$().height(300);
		oObjectPage._bHeaderBiggerThanAllowedHeight = false;
		// Act
		oObjectPage._overridePreserveHeaderStateOnScroll();

		assert.strictEqual(oObjectPage._bHeaderBiggerThanAllowedHeight, true, "flag is updated");
		assert.strictEqual(oObjectPage._preserveHeaderStateOnScroll(), false, "preserveHeaderStateOnScroll should be overridden with 60% or bigger height");

		// Setup header ok to be preserved in the title area
		oObjectPage.$().height(1000);
		oObjectPage.getHeaderTitle().$().height(200);
		oObjectPage._getHeaderContent().$().height(200);

		// Act
		oObjectPage._overridePreserveHeaderStateOnScroll();

		assert.strictEqual(oObjectPage._bHeaderBiggerThanAllowedHeight, false, "flag is updated");
		assert.strictEqual(oObjectPage._preserveHeaderStateOnScroll(), true, "preserveHeaderStateOnScroll should NOT be overridden with less than 60% height");
	});

	QUnit.module("Header content initialization");

	QUnit.test("setShowHeaderContent before rendering", function (assert) {

		var oObjectPage = new ObjectPageLayout({
			showHeaderContent: false
		});

		assert.equal(oObjectPage.getShowHeaderContent(), false, "The value is applied");

		oObjectPage.destroy();
	});

	QUnit.module("ObjectPageLayout content resize", {
		beforeEach: function (assert) {
			var done = assert.async();
			XMLView.create({
				id: "UxAP-ObjectPageHeaderContent",
				viewName: "view.UxAP-ObjectPageHeaderContent"
			}).then(function (oView) {
				this.contentView = oView;
				this.contentView.placeAt("qunit-fixture");
				Core.applyChanges();
				done();
			}.bind(this));
		},
		afterEach: function () {
			this.contentView.destroy();
		}
	});

	QUnit.test("addHeaderContent", function (assert) {
		var	oObjectPageLayout = this.contentView.byId("ObjectPageLayout"),
		oResizableControl = new GenericDiv({height: "100px"}),
		done = assert.async(),
		bResizeListenerCalled = false;

		oObjectPageLayout.addHeaderContent(oResizableControl);

		// proxy the resize listener to check if called
		var fnOrig = oObjectPageLayout._onUpdateContentSize;
		oObjectPageLayout._onUpdateContentSize = function() {
			bResizeListenerCalled = true;
			fnOrig.apply(this, arguments);
		};

		Core.applyChanges();

		// wait for the point where the listener is internally attached
		oObjectPageLayout.attachEventOnce("onAfterRenderingDOMReady", function() {
			// act
			oResizableControl.getDomRef().style.height = "10px"; //decrease height of content
			setTimeout(function() {
				// check
				assert.ok(bResizeListenerCalled, "_onUpdateContentSize method is called");
				done();
			}, 500 /* wait for resizeHandler to be triggered */);
		});
	});

});