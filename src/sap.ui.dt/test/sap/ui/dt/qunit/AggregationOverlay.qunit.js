/*global QUnit*/

sap.ui.define([
	"sap/ui/dt/Overlay",
	"sap/ui/dt/ElementOverlay",
	"sap/ui/dt/AggregationOverlay",
	"sap/ui/dt/AggregationDesignTimeMetadata",
	"sap/ui/dt/DOMUtil",
	"sap/m/Page",
	"sap/m/Button",
	"sap/m/Panel",
	"sap/ui/thirdparty/jquery",
	"sap/ui/thirdparty/sinon-4"
],
function(
	Overlay,
	ElementOverlay,
	AggregationOverlay,
	AggregationDesignTimeMetadata,
	DOMUtil,
	Page,
	Button,
	Panel,
	jQuery,
	sinon
) {
	"use strict";
	var sandbox = sinon.sandbox.create();
	QUnit.module("Given that an AggregationOverlay is created for an aggregation without domRef DT metadata and without children", {
		beforeEach: function() {
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
			assert.strictEqual(DOMUtil.isVisible(this.oAggregationOverlay.getDomRef()), false, "aggregation is hidden because no children are given");
		});
	});

	QUnit.module("Given that an AggregationOverlay is created for an aggregation with domRef DT metadata", {
		beforeEach: function () {
			this.oPage = new Page();
			this.oPage.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			this.oAggregationOverlay = new AggregationOverlay({
				isRoot: true,
				element: this.oPage,
				designTimeMetadata: new AggregationDesignTimeMetadata({
					data: {
						domRef: ":sap-domref > section"
					}
				})
			});
			Overlay.getOverlayContainer().append(this.oAggregationOverlay.render());

			this.oAggregationOverlay.applyStyles();
		},
		afterEach: function() {
			this.oPage.destroy();
			this.oAggregationOverlay.destroy();
			Overlay.removeOverlayContainer();
		}
	}, function () {
		QUnit.test("when AggregationOverlay is initialized", function(assert) {
			assert.strictEqual(this.oAggregationOverlay.getGeometry().domRef, this.oPage.$().find(">section").get(0), "domRef for the overlay is correct");
			assert.strictEqual(DOMUtil.isVisible(this.oAggregationOverlay.getDomRef()), true, "aggregation is rendered");
		});
	});

	QUnit.module("Given that an AggregationOverlay is created for an aggregation and a rendered child is added", {
		beforeEach: function(assert) {
			var fnDone = assert.async();

			this.oButton1 = new Button({text: "button1"});
			this.oButton2 = new Button({text: "button2"});
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
					isRoot: true,
					designTimeMetadata: new AggregationDesignTimeMetadata(),
					children: [aOverlays[0]],
					init: function (oEvent) {
						Overlay.getOverlayContainer().append(oEvent.getSource().render());
						this.oAggregationOverlay.applyStyles();
						fnDone();
					}.bind(this)
				});
				this.oChildNotAdded = aOverlays[1];
			}.bind(this));
		},
		afterEach: function() {
			this.oPage.destroy();
			this.oAggregationOverlay.destroy();
			Overlay.removeOverlayContainer();
		}
	}, function () {
		QUnit.test("when AggregationOverlay is initialized", function(assert) {
			assert.strictEqual(DOMUtil.isVisible(this.oAggregationOverlay.getDomRef()), true, "aggregation is rendered");
		});

		QUnit.test("when an un-rendered ElementOverlay is added as child into the AggregationOverlay", function(assert) {
			var done = assert.async();
			this.oChildNotAdded.attachEventOnce("afterRendering", function(oEvent) {
				assert.deepEqual(oEvent.getSource(), this.oChildNotAdded, "then 'afterRendering' event is fired for the added un-rendered ElementOverlay");
				done();
			}, this);
			assert.notOk(this.oChildNotAdded.isRendered(), "then the child ElementOverlay to be added is not rendered");
			this.oAggregationOverlay.addChild(this.oChildNotAdded);
		});

		QUnit.test("when a rendered ElementOverlay is added as child into the AggregationOverlay", function(assert) {
			// render ElementOverlay to be added
			this.oChildNotAdded.render();

			sandbox.stub(this.oChildNotAdded, "fireEvent")
				.callThrough()
				.withArgs("afterRendering")
				.callsFake(function() {
					assert.ok(false, "then 'afterRendering' should not be called for a rendered ElementOverlay");
				});

			assert.ok(this.oChildNotAdded.isRendered(), "then the child ElementOverlay to be added is rendered");
			this.oAggregationOverlay.addChild(this.oChildNotAdded);
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
						domRef: ":sap-domref > section"
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
		beforeEach: function() {
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

	QUnit.module("Given that an AggregationOverlay is created and is not rendered", {
		beforeEach: function () {
			this.oPage = new Page();

			this.oAggregationOverlay = new AggregationOverlay({
				id: "unRenderedAggregationOverlay",
				element: this.oPage,
				designTimeMetadata: new AggregationDesignTimeMetadata({
					data: {
						domRef: ":sap-domref > section"
					}
				})
			});
		},
		afterEach: function() {
			this.oPage.destroy();
			this.oAggregationOverlay.destroy();
			Overlay.removeOverlayContainer();
		}
	}, function () {
		QUnit.test("when this AggregationOverlay is rendered later and two browser events exist for it", function(assert) {
			var fnDone = assert.async(2);
			var sMockText1 = "mockContextText1";
			var sMockText2 = "mockContextText2";
			var sEventName = "mockEvent";

			var fnEventHandler = sandbox.stub()
				.withArgs(sinon.match.any, sMockText1).callsFake(fnDone)
				.withArgs(sinon.match.any, sMockText2).callsFake(fnDone);

			this.oAggregationOverlay.attachEventOnce("afterRendering", function(oEvent) {
				assert.ok(true, "then AggregationOverlay is rendered");
				oEvent.getSource().$().trigger(sEventName, [sMockText1]);
				oEvent.getSource().$().trigger(sEventName, [sMockText2]);
			});

			this.oAggregationOverlay.attachBrowserEvent(sEventName, fnEventHandler, this.oAggregationOverlay);
			this.oAggregationOverlay.render();
		});
	});

	QUnit.done(function() {
		jQuery("#qunit-fixture").hide();
	});
});
