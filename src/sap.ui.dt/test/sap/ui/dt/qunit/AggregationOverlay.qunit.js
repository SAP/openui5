/*global QUnit*/

QUnit.config.autostart = false;

sap.ui.require([
	'sap/ui/dt/Overlay',
	'sap/ui/dt/ElementOverlay',
	'sap/ui/dt/AggregationOverlay',
	'sap/ui/dt/AggregationDesignTimeMetadata',
	'sap/m/Page',
	'sap/m/Button',
	'sap/m/Panel',
	'jquery.sap.global'
],
function(
	Overlay,
	ElementOverlay,
	AggregationOverlay,
	AggregationDesignTimeMetadata,
	Page,
	Button,
	Panel,
	jQuery
) {
	"use strict";

	QUnit.start();

	QUnit.module("Given that an AggregationOverlay is created for an aggregation without domRef DT metadata and without children", {
		beforeEach: function(assert) {
			this.oPage = new Page();
			this.oPage.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			this.oAggregationOverlay = new AggregationOverlay({
				element: this.oPage,
				designTimeMetadata: new AggregationDesignTimeMetadata()
			});
			Overlay.getOverlayContainer().append(this.oAggregationOverlay.render());
		},
		afterEach: function() {
			this.oPage.destroy();
			this.oAggregationOverlay.destroy();
			Overlay.removeOverlayContainer();
		}
	}, function () {
		QUnit.test("when AggregationOverlay is initialized", function(assert) {
			assert.strictEqual(this.oAggregationOverlay.getGeometry(), undefined, "geometry for the overlay is undefined when no children are given");
			assert.strictEqual(this.oAggregationOverlay.$().is(":visible"), false, "aggregation is hidden because no children are given");
		});
	});

	QUnit.module("Given that an AggregationOverlay is created for an aggregation with domRef DT metadata", {
		beforeEach: function(assert) {
			this.oPage = new Page();
			this.oPage.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			this.oAggregationOverlay = new AggregationOverlay({
				isRoot: true,
				element: this.oPage,
				designTimeMetadata: new AggregationDesignTimeMetadata({
					data : {
						domRef : ":sap-domref > section"
					}
				})
			});
			Overlay.getOverlayContainer().append(this.oAggregationOverlay.render());
		},
		afterEach: function() {
			this.oPage.destroy();
			this.oAggregationOverlay.destroy();
			Overlay.removeOverlayContainer();
		}
	}, function () {
		QUnit.test("when AggregationOverlay is initialized", function(assert) {
			assert.strictEqual(this.oAggregationOverlay.getGeometry().domRef, this.oPage.$().find(">section").get(0), "domRef for the overlay is correct");
			assert.strictEqual(this.oAggregationOverlay.$().is(":visible"), true, "aggregation is rendered");
		});
	});

	QUnit.module("Given that an AggregationOverlay is created for an aggregation without domRef DT metadata, but with children", {
		beforeEach: function(assert) {
			var fnDone = assert.async();

			this.oButton1 = new Button({text : "button1"});
			this.oButton2 = new Button({text : "button2"});
			this.oPage = new Page({
				content: [
					this.oButton1,
					this.oButton2
				]
			});
			this.oPage.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			Promise.all(
				[this.oButton1, this.oButton2].map(function (oElement) {
					return new Promise(function (fnResolve) {
						new ElementOverlay({
							element: oElement,
							init: function (oEvent) {
								fnResolve(oEvent.getSource());
							}
						});
					});
				})
			).then(function (aOverlays) {
				this.oAggregationOverlay = new AggregationOverlay({
					element: this.oPage,
					designTimeMetadata : new AggregationDesignTimeMetadata(),
					children: aOverlays,
					init: function (oEvent) {
						Overlay.getOverlayContainer().append(oEvent.getSource().render());
						fnDone();
					}
				});
			}.bind(this));
		},
		afterEach: function() {
			this.oPage.destroy();
			this.oAggregationOverlay.destroy();
			Overlay.removeOverlayContainer();
		}
	}, function () {
		QUnit.test("when AggregationOverlay is initialized", function(assert) {
			assert.strictEqual(this.oAggregationOverlay.getGeometry().domRef, undefined, "domRef for the overlay is undefined");
			assert.strictEqual(this.oAggregationOverlay.$().is(":visible"), true, "aggregation is rendered");
		});
	});

	QUnit.module("Given that an AggregationOverlay is created for an aggregation where scroll is needed", {
		beforeEach: function(assert) {
			var fnDone = assert.async();
			this.aPanels = [];
			for (var i = 0; i < 50; i++) {
				var oPanel = new Panel();
				this.aPanels.push(oPanel);
			}
			this.oPage = new Page({
				content: this.aPanels
			}).placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			this.oAggregationOverlay = new AggregationOverlay({
				element: this.oPage,
				isRoot: true,
				designTimeMetadata: new AggregationDesignTimeMetadata({
					data: {
						domRef : ":sap-domref > section"
					}
				})
			});

			Overlay.getOverlayContainer().append(this.oAggregationOverlay.render());
			this.oAggregationOverlay.attachEventOnce('scrollSynced', fnDone);
			this.oAggregationOverlay.applyStyles();

			this.$PageContentOverlay = this.oAggregationOverlay.$();
			this.$PageContent = jQuery(this.oAggregationOverlay.getGeometry().domRef);
		},
		afterEach: function() {
			this.oPage.destroy();
			this.oAggregationOverlay.destroy();
			Overlay.removeOverlayContainer();
		}
	}, function () {
		QUnit.test("when AggregationOverlay is scrolled", function(assert) {
			var done = assert.async();

			assert.strictEqual(this.$PageContent.scrollTop(), this.$PageContentOverlay.scrollTop(), "initial scroll position is equal");

			this.$PageContent.on("scroll", function() {
				assert.strictEqual(this.$PageContent.scrollTop(), 100, "page content is also scrolled to same position");
				done();
			}.bind(this));

			this.$PageContentOverlay.scrollTop(100);
		});

		QUnit.test("when aggregation dom is scrolled", function(assert) {
			var done = assert.async();

			this.$PageContentOverlay.on("scroll", function() {
				assert.strictEqual(this.$PageContentOverlay.scrollTop(), 20, "page content overlay is also scrolled to same position");
				done();
			}.bind(this));

			this.$PageContent.scrollTop(20);
		});
	});

	QUnit.module("Given that an AggregationOverlay is created for an aggregation-like association", {
		beforeEach: function(assert) {
			this.oPage = new Page();

			this.oAggregationLikeOverlay = new AggregationOverlay({
				element: this.oPage,
				designTimeMetadata: new AggregationDesignTimeMetadata({
					data: {
						aggregationLike: true
					}
				})
			});

			this.oAggregationOverlay = new AggregationOverlay({
				element: this.oPage,
				designTimeMetadata: new AggregationDesignTimeMetadata()
			});
		},
		afterEach: function() {
			this.oPage.destroy();
			this.oAggregationOverlay.destroy();
			this.oAggregationLikeOverlay.destroy();
			Overlay.removeOverlayContainer();
		}
	}, function () {
		QUnit.test("when asked for being an association", function(assert) {
			assert.strictEqual(this.oAggregationOverlay.isAssociation(), false, "regular aggregation is no association");
			assert.strictEqual(this.oAggregationLikeOverlay.isAssociation(), true, "aggregation-like association is an association");
		});
	});

	QUnit.done(function( details ) {
		jQuery("#qunit-fixture").hide();
	});
});
