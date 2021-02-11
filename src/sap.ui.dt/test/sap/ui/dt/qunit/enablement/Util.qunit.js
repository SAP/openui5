/*global QUnit*/

sap.ui.define([
	"sap/ui/dt/enablement/Util",
	"sap/ui/dt/DesignTime",
	"sap/m/Button",
	"sap/ui/layout/VerticalLayout"
],
function (
	EnablementUtil,
	DesignTime,
	Button,
	VerticalLayout
) {
	"use strict";

	QUnit.module("Given that a sap.mButton is tested", {
		beforeEach: function (assert) {
			this.oButton = new Button({text: "my button"});
			this.oButton.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			this.oDesignTime = new DesignTime({
				rootElements: [this.oButton]
			});
			this.oDesignTime.attachEventOnce("synced", assert.async());
		},
		afterEach: function() {
			this.oDesignTime.destroy();
			this.oButton.destroy();
		}
	}, function () {
		QUnit.test("when the getInfo is called", function(assert) {
			var oElementTestInfo = EnablementUtil.getInfo(this.oButton);
			assert.ok(oElementTestInfo.metadata, "metadata is retrieved");
			assert.ok(oElementTestInfo.overlay, "overlay is retrieved");
		});

		QUnit.test("when the getAggregationsInfo is called for layout without content", function(assert) {
			var oAggregationsTestInfo = EnablementUtil.getAggregationsInfo(this.oButton);
			var aAggregationNames = Object.keys(oAggregationsTestInfo);
			var bNotIgnoredAggregationFound = false;
			aAggregationNames.forEach(function(sAggregationName) {
				bNotIgnoredAggregationFound = bNotIgnoredAggregationFound || !oAggregationsTestInfo[sAggregationName].ignored;
			});
			assert.strictEqual(bNotIgnoredAggregationFound, false, "no not-ignored aggregations found");
		});
	});

	QUnit.module("Given that a sap.ui.layout.VerticalLayout without content is tested", {
		beforeEach: function(assert) {
			this.oVerticalLayout = new VerticalLayout();
			this.oVerticalLayout.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			this.oDesignTime = new DesignTime({
				rootElements: [this.oVerticalLayout]
			});
			this.oDesignTime.attachEventOnce("synced", assert.async());
		},
		afterEach: function() {
			this.oDesignTime.destroy();
			this.oVerticalLayout.destroy();
		}
	}, function () {
		QUnit.test("when the getAggregationInfo is called for layout without content", function(assert) {
			var oAggregationTestInfo = EnablementUtil.getAggregationInfo(this.oVerticalLayout, "content");
			assert.strictEqual(oAggregationTestInfo.ignored, false, "aggregation isn't ignored in DT Metadata");
			assert.strictEqual(oAggregationTestInfo.domRefDeclared, true, "domRef for content aggregation is declared in DT Metadata");
			assert.strictEqual(oAggregationTestInfo.domRefFound, true, "domRef for content aggregation is found in dom");
			assert.strictEqual(oAggregationTestInfo.domRefVisible, false, "domRef for content aggregation isn't visible");
			assert.strictEqual(oAggregationTestInfo.overlayTooSmall, true, "overlay domRef is too small");
			assert.strictEqual(oAggregationTestInfo.overlayGeometryCalculatedByChildren, false, "overlay geometry is not calculated by children");
			assert.strictEqual(oAggregationTestInfo.overlayVisible, false, "overlay isn't visible");
		});

		QUnit.test("when the getAggregationsInfo is called for layout without content", function(assert) {
			var oAggregationsTestInfo = EnablementUtil.getAggregationsInfo(this.oVerticalLayout);
			assert.ok(oAggregationsTestInfo.content, "content aggregation info is retrieved");
		});
	});

	QUnit.module("Given that a sap.ui.layout.VerticalLayout with content is tested", {
		beforeEach: function(assert) {
			this.oButton = new Button({text: "my button"});
			this.oVerticalLayout = new VerticalLayout({
				content: [this.oButton]
			});
			this.oVerticalLayout.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			this.oDesignTime = new DesignTime({
				rootElements: [this.oVerticalLayout]
			});
			this.oDesignTime.attachEventOnce("synced", assert.async());
		},
		afterEach: function() {
			this.oDesignTime.destroy();
			this.oVerticalLayout.destroy();
		}
	}, function () {
		QUnit.test("when the getAggregationInfo is called for layout with content", function (assert) {
			var oAggregationTestInfo = EnablementUtil.getAggregationInfo(this.oVerticalLayout, "content");
			assert.strictEqual(oAggregationTestInfo.ignored, false, "aggregation isn't ignored in DT Metadata");
			assert.strictEqual(oAggregationTestInfo.domRefDeclared, true, "domRef for content aggregation is declared in DT Metadata");
			assert.strictEqual(oAggregationTestInfo.domRefFound, true, "domRef for content aggregation is found in dom");
			assert.strictEqual(oAggregationTestInfo.domRefVisible, true, "domRef for content aggregation is visible");
			assert.strictEqual(oAggregationTestInfo.overlayTooSmall, false, "overlay domRef is big enough");
			assert.strictEqual(oAggregationTestInfo.overlayGeometryCalculatedByChildren, false, "overlay geometry is not calculated by children");
			assert.strictEqual(oAggregationTestInfo.overlayVisible, true, "overlay is visible");
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});