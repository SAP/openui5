/* global QUnit */

QUnit.config.autostart = false;

sap.ui.require([
	'sap/ui/dt/MutationObserver',
	'sap/ui/dt/OverlayUtil',
	'sap/ui/dt/DesignTime',
	'sap/ui/dt/OverlayRegistry',
	'sap/m/Button',
	'sap/ui/thirdparty/sinon'
],
function(
	MutationObserver,
	OverlayUtil,
	DesignTime,
	OverlayRegistry,
	Button,
	sinon
) {
	'use strict';
	QUnit.start();

	// var sandbox = sinon.sandbox.create();

	QUnit.module("Given that a MutationObserver is created", {
		beforeEach : function() {
			this.oLabel = new sap.m.Label({
				text : "text"
			});
			this.oMutationObserver = new sap.ui.dt.MutationObserver();
			this.oLabel.placeAt("content");
			sap.ui.getCore().applyChanges();
		},
		afterEach : function() {
			this.oMutationObserver.destroy();
			this.oLabel.destroy();
		}
	});

	QUnit.test("when window is resized", function(assert) {
		var done = assert.async();

		this.oMutationObserver.attachEventOnce("domChanged", function(oEvent) {
			assert.ok(oEvent, 'DomChanged event is fired');
			done();
		});
		jQuery(window).trigger("resize");
	});

	QUnit.test("when the text node of a control is modified", function(assert) {
		var done = assert.async();

		this.oMutationObserver.attachEventOnce("domChanged", function(oEvent) {
			assert.ok(oEvent, 'then a "domChanged" event is fired because of the mutation observer');
			assert.notEqual(oEvent.mParameters.targetNodes.indexOf(this.oLabel.getDomRef().firstChild), -1, "the label change is not part of the event");
			done();
		}.bind(this));

		this.oLabel.setText("test");
	});

	QUnit.test("when a mutation is ignored", function(assert) {
		var done = assert.async();

		this.oMutationObserver.ignoreOnce({
			target: this.oLabel.getDomRef(),
			type: "childList"
		});
		assert.equal(this.oMutationObserver._aIgnoredMutations.length, 1, "the mutation is being ignored");

		this.oMutationObserver.attachEventOnce("domChanged", function(oEvent) {
			assert.equal(oEvent.mParameters.targetNodes.indexOf(this.oLabel.getDomRef()), -1, "the label change is not part of the event");
			assert.equal(this.oMutationObserver._aIgnoredMutations.length, 0, "the mutation is no longer ignored");
			done();
		}.bind(this));
		this.oLabel.$().append("<div />");
	});

	// QUnit.module("Given that a MutationObserver and DesignTime with root control have been created", {
	// 	beforeEach : function(assert) {
	//
	// 		sandbox.stub(sap.ui.dt.OverlayUtil, "isInOverlayContainer").returns(false);
	// 		sandbox.stub(sap.ui.dt.OverlayUtil, "getClosestOverlayForNode").returns(false);
	//
	// 		var aButtons0 = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19].map(function(i) {
	// 			return new sap.m.Button("button" + i);
	// 		});
	// 		this.oVerticalLayout0 = new sap.ui.layout.VerticalLayout({
	// 			id : "__layout0",
	// 			content : aButtons0
	// 		});
	//
	// 		var aButtons1 = [20,21,22,23,24,25].map(function(i) {
	// 			return new sap.m.Button("button" + i);
	// 		});
	// 		this.oVerticalLayout1 = new sap.ui.layout.VerticalLayout({
	// 			id : "__layout1",
	// 			content : aButtons1
	// 		});
	//
	// 		this.oVerticalLayoutRoot = new sap.ui.layout.VerticalLayout({
	// 			id : "__layout2",
	// 			content : [this.oVerticalLayout0, this.oVerticalLayout1]
	// 		}).placeAt("content");
	//
	// 		sap.ui.getCore().applyChanges();
	//
	// 		this.oDesignTime = new sap.ui.dt.DesignTime({
	// 			rootElements : [this.oVerticalLayoutRoot]
	// 		});
	//
	// 		var done = assert.async();
	//
	// 		this.oDesignTime.attachEventOnce("synced", function() {
	// 			this.oVerticalLayout1Overlay = sap.ui.dt.OverlayRegistry.getOverlay(this.oVerticalLayout1);
	// 			this.oVerticalLayoutRootOverlay = sap.ui.dt.OverlayRegistry.getOverlay(this.oVerticalLayoutRoot);
	// 			done();
	// 		}.bind(this));
	// 	},
	// 	afterEach : function() {
	// 		this.oVerticalLayout0.destroy();
	// 		this.oVerticalLayout1.destroy();
	// 		this.oVerticalLayoutRoot.destroy();
	// 		this.oDesignTime.destroy();
	// 		sandbox.restore();
	// 	}
	// });
	//
	// QUnit.test("when whole document is scrolled", function(assert) {
	// 	var done = assert.async();
	// 	var fnAssertScrollEvent = function(oEvent) {
	// 		assert.ok(oEvent, "then a 'scroll' event is fired because of the mutation observer");
	// 		document.removeEventListener("scroll", fnAssertScrollEvent, { once: true });
	// 		done();
	// 	};
	// 	document.addEventListener("scroll", fnAssertScrollEvent, { once: true });
	// 	this.oVerticalLayoutRootOverlay._oMutationObserver.attachDomChanged(function(oEvent) {
	// 		if (oEvent.mParameters.type === "scroll") {
	// 			assert.notEqual(oEvent.mParameters.type, "scroll", "then a 'domChanged' with 'scroll'-type shouldn't be triggered");
	// 		}
	// 	});
	// 	jQuery(document).scrollTop(50);
	// });
	//
	// QUnit.test("when verticalLayoutOverlay is scrolled", function(assert) {
	// 	var done = assert.async();
	// 	this.oVerticalLayoutRootOverlay._oMutationObserver.attachEventOnce("domChanged", function(oEvent) {
	// 		assert.strictEqual(oEvent.mParameters.type, "scroll", "then a 'domChanged' with 'scroll'-type is triggered");
	// 			done();
	// 	}, this.oVerticalLayoutRootOverlay);
	// 	jQuery(this.oVerticalLayout1.getDomRef()).scrollTop(50);
	// });
});
