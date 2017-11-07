/*global QUnit*/

QUnit.config.autostart = false;

sap.ui.require([
	"sap/ui/dt/Overlay",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/dt/DesignTime",
	"sap/m/Button",
	"sap/m/TextArea",
	"sap/uxap/ObjectPageLayout",
	"sap/uxap/ObjectPageSection",
	"sap/uxap/ObjectPageSubSection",
	"sap/uxap/ObjectPageHeader",
	"sap/m/Bar",
	"sap/m/VBox",
	"dt/control/SimpleScrollControl",
	// should be last:
	"sap/ui/thirdparty/sinon",
	"sap/ui/thirdparty/sinon-ie",
	"sap/ui/thirdparty/sinon-qunit"
],
function(
	Overlay,
	OverlayRegistry,
	DesignTime,
	Button,
	TextArea,
	ObjectPageLayout,
	ObjectPageSection,
	ObjectPageSubSection,
	ObjectPageHeader,
	Bar,
	VBox,
	SimpleScrollControl,
	sinon
) {
	"use strict";

	QUnit.start();

	QUnit.module("Given a SimpleScrollControl with Overlays", {
		beforeEach : function(assert) {
			this.sandbox = sinon.sandbox.create();

			var done = assert.async();

			this.oSimpleScrollControl = new SimpleScrollControl("scrollControl");
			this.oSimpleScrollControl.addContent1(new TextArea({
				height: "500px",
				width: "400px",
				value: "foo"
			}));
			this.oSimpleScrollControl.addContent2(new TextArea({
				height: "500px",
				width: "400px",
				value: "bar"
			}));

			this.oVBox = new sap.m.VBox({
				items : [this.oSimpleScrollControl]
			}).placeAt("content");
			sap.ui.getCore().applyChanges();

			this.oDesignTime = new sap.ui.dt.DesignTime({
				rootElements : [this.oVBox]
			});

			this.oDesignTime.attachEventOnce("synced", function() {
				this.oSimpleScrollControlOverlay = sap.ui.dt.OverlayRegistry.getOverlay(this.oSimpleScrollControl);
				sap.ui.getCore().applyChanges();
				done();
			}.bind(this));
		},
		afterEach : function() {
			this.sandbox.restore();
			this.oVBox.destroy();
			this.oDesignTime.destroy();
		}
	});

	QUnit.test("when the control is scrolled", function(assert) {
		var done = assert.async();
		var oContent1 = this.oSimpleScrollControl.getContent1()[0];
		var oContent1Overlay = sap.ui.dt.OverlayRegistry.getOverlay(oContent1);
		var sInitialOffsetTop = oContent1.$().offset().top;
		var oInitialControlOffset = oContent1.$().offset();
		var oInitialOverlayOffset = oContent1Overlay.$().offset();

		var oApplyStylesSpy = this.sandbox.spy(Overlay.prototype, "applyStyles");
		var oEnsureDomOrder = this.sandbox.spy(Overlay.prototype, "_ensureDomOrder");

		this.oSimpleScrollControlOverlay._aScrollContainers[0].overlayDomRef.scroll(function() {
			assert.equal(oApplyStylesSpy.callCount, 0,  "then the applyStyles Method is not called");
			assert.equal(oEnsureDomOrder.callCount, 0,  "then the _ensureDomOrder Method is not called");
			assert.equal(oContent1.$().offset().top, sInitialOffsetTop - 100, "Then the top offset is 100px lower");
			assert.deepEqual(oContent1.$().offset(), oContent1Overlay.$().offset(), "Then the offset is still equal");
			assert.deepEqual(oInitialControlOffset, oInitialOverlayOffset, "Then the offset is still equal");
			done();
		});
		this.oSimpleScrollControl.$().find("> .sapUiDtTestSSCScrollContainer").scrollTop(100);
	});

	QUnit.test("when the overlay is scrolled", function(assert) {
		var done = assert.async();
		var oContent1 = this.oSimpleScrollControl.getContent1()[0];
		var oContent1Overlay = sap.ui.dt.OverlayRegistry.getOverlay(oContent1);
		var sInitialOffsetTop = oContent1.$().offset().top;
		var oInitialControlOffset = oContent1.$().offset();
		var oInitialOverlayOffset = oContent1Overlay.$().offset();

		var oApplyStylesSpy = this.sandbox.spy(Overlay.prototype, "applyStyles");
		var oEnsureDomOrder = this.sandbox.spy(Overlay.prototype, "_ensureDomOrder");

		this.oSimpleScrollControl.$().find("> .sapUiDtTestSSCScrollContainer").scroll(function() {
			assert.equal(oApplyStylesSpy.callCount, 0,  "then the applyStyles Method is not called");
			assert.equal(oEnsureDomOrder.callCount, 0,  "then the _ensureDomOrder Method is not called");
			assert.equal(oContent1.$().offset().top, sInitialOffsetTop - 100, "Then the top offset is 100px lower");
			assert.deepEqual(oContent1.$().offset(), oContent1Overlay.$().offset(), "Then the offset is still equal");
			assert.deepEqual(oInitialControlOffset, oInitialOverlayOffset, "Then the offset is still equal");
			done();
		});
		this.oSimpleScrollControlOverlay._aScrollContainers[0].overlayDomRef.scrollTop(100);
	});


	QUnit.module("Given that a DesignTime is created for a control", {
		beforeEach : function(assert) {
			this.sandbox = sinon.sandbox.create();
			var done = assert.async();
			var done2 = assert.async();

			var oSubSection = new ObjectPageSubSection("subsection", {
				blocks: [new Button({text: "abc"}), new Button({text: "def"}), new Button({text: "ghi"})]
			});
			var oSubSection2 = new ObjectPageSubSection("subsection2", {
				blocks: [new Button({text: "foo"}), new Button({text: "bar"}), new Button({text: "foobar"})]
			});
			var oSection = new ObjectPageSection("section", {
				subSections: [oSubSection]
			});
			var oSection2 = new ObjectPageSection("section2", {
				subSections: [oSubSection2]
			});
			this.oLayout = new ObjectPageLayout("layout", {
				height: "300px",
				sections : [oSection, oSection2],
				headerTitle: new ObjectPageHeader({
					objectTitle: "Title"
				}),
				headerContent: new Button({
					text: "headerContent"
				}),
				footer: new Bar({
					contentMiddle: [new Button({text: "footer"})]
				}),
				showFooter: true
			}).attachEventOnce('onAfterRenderingDOMReady', done2);
			this.oVBox = new sap.m.VBox({
				items : [this.oLayout]
			}).placeAt("content");
			sap.ui.getCore().applyChanges();

			this.oDesignTime = new sap.ui.dt.DesignTime({
				rootElements : [this.oVBox]
			});

			this.oDesignTime.attachEventOnce("synced", function() {
				this.oLayoutOverlay = sap.ui.dt.OverlayRegistry.getOverlay(this.oLayout);

				sap.ui.getCore().applyChanges();

				done();
			}.bind(this));
		},
		afterEach : function() {
			this.sandbox.restore();
			this.oDesignTime.destroy();
			this.oVBox.destroy();
		}
	});

	QUnit.test("when the control is rendered", function(assert) {
		var oHeaderTitleOverlay = this.oLayoutOverlay.getAggregationOverlay("headerTitle");
		var oHeaderContentOverlay = this.oLayoutOverlay.getAggregationOverlay("headerContent");
		var oSectionsOverlay = this.oLayoutOverlay.getAggregationOverlay("sections");
		var oFooterOverlay = this.oLayoutOverlay.getAggregationOverlay("footer");

		var aAggregationOverlays = this.oLayoutOverlay.getAggregationOverlays();
		var iIndexHeaderTitleOverlay = aAggregationOverlays.indexOf(oHeaderTitleOverlay);
		var iIndexHeaderContentOverlay = aAggregationOverlays.indexOf(oHeaderContentOverlay);
		var iIndexSectionsOverlay = aAggregationOverlays.indexOf(oSectionsOverlay);
		var iIndexFooterOverlay = aAggregationOverlays.indexOf(oFooterOverlay);

		assert.ok(iIndexHeaderTitleOverlay < iIndexHeaderContentOverlay, "then the overlay for headerTitle is above headerContent");
		assert.ok(iIndexHeaderContentOverlay < iIndexSectionsOverlay, "then the overlay for headerContent is above sections");
		assert.ok(iIndexSectionsOverlay < iIndexFooterOverlay, "then the overlay for sections is above footer");

		var $AggregationOverlays = jQuery(this.oLayoutOverlay.$().children()[1]).children();
		assert.equal($AggregationOverlays.get(1).className, "sapUiDtOverlayScrollContainer", "then a scrollContainer is second in DOM");
		var $scrollContainerChildren = jQuery($AggregationOverlays.get(1)).children();
		assert.equal($AggregationOverlays.get(2).className, "sapUiDtOverlayScrollContainer", "then a scrollContainer is third in DOM");

		assert.equal($AggregationOverlays.get(0).dataset["sapUiDtAggregation"], "headerTitle", "then the overlay for headerTitle is first in DOM");
		assert.equal($scrollContainerChildren.get(0).dataset["sapUiDtAggregation"], "headerContent", "then the overlay for headerContent is first in the first ScrollContainer in DOM");
		assert.equal($scrollContainerChildren.get(1).dataset["sapUiDtAggregation"], "sections", "then the overlay for headerContent is second in the first ScrollContainer in DOM");
		assert.equal($AggregationOverlays.get(3).dataset["sapUiDtAggregation"], "footer", "then the overlay for headerTitle is fourth in DOM");
	});

	QUnit.test("when _cloneDomRef is called", function(assert) {
		this.oLayoutOverlay._cloneDomRef(this.oLayout.$().find("header")[0]);

		var oSrcDomElement = this.oLayout.$().find("header").get(0);
		var oDestDomElement = this.oLayoutOverlay.$().find(">.sapUiDtClonedDom").get(0);

		assert.equal(window.getComputedStyle(oSrcDomElement)["visibility"], "hidden", "then the original domRef is hidden");
		assert.equal(window.getComputedStyle(oDestDomElement)["visibility"], "visible", "then the cloned domRef is visible");

		this.oLayoutOverlay._restoreVisibility();
		assert.equal(window.getComputedStyle(oSrcDomElement)["visibility"], "visible",
			"then after restoring visibility the original domRef is visible again");
	});


	QUnit.module("Given another SimpleScrollControl with Overlays and one scroll container aggregation is ignored", {
		beforeEach : function(assert) {
			var ScrollControl = SimpleScrollControl.extend('sap.ui.dt.test.controls.ScrollControl', {
				metadata: {
					designtime: {
						aggregations: {
							content1: {
								ignore: true
							}
						}
					}
				},
				renderer: SimpleScrollControl.getMetadata().getRenderer().render
			});
			this.sandbox = sinon.sandbox.create();

			var done = assert.async();

			this.oScrollControl = new ScrollControl({
				id: "scrollControl",
				content1: [new TextArea({
					value: "foo"
				})],
				content2: [new TextArea({
					value: "bar"
				})],
				footer: [new TextArea({
					value: "footer"
				})]
			});

			this.oVBox = new sap.m.VBox({
				items : [this.oScrollControl]
			}).placeAt("content");
			sap.ui.getCore().applyChanges();

			this.oDesignTime = new sap.ui.dt.DesignTime({
				rootElements : [this.oVBox]
			});

			this.oDesignTime.attachEventOnce("synced", function() {
				this.oScrollControlOverlay = sap.ui.dt.OverlayRegistry.getOverlay(this.oScrollControl);
				sap.ui.getCore().applyChanges();
				done();
			}.bind(this));
		},
		afterEach : function() {
			this.sandbox.restore();
			this.oVBox.destroy();
			this.oDesignTime.destroy();
		}
	});
	QUnit.test("when the overlay is rendered, also aggregation overlays are rendered", function(assert) {
		assert.ok(this.oScrollControlOverlay.getDomRef(), "overlay has domRef");
		assert.ok(this.oScrollControlOverlay.getAggregationOverlay("content2").getDomRef(), "aggregation overlay in scroll container has domRef");
		assert.ok(this.oScrollControlOverlay.getAggregationOverlay("footer").getDomRef(), "aggregation overlay outside scroll container has domRef");
	});
});