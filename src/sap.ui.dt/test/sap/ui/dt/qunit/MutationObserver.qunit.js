/* global QUnit */

QUnit.config.autostart = false;

sap.ui.require([
	'sap/ui/dt/MutationObserver',
	'sap/ui/dt/OverlayUtil',
	'sap/ui/dt/Overlay',
	'sap/ui/dt/DesignTime',
	'sap/ui/dt/OverlayRegistry',
	'sap/m/Panel',
	'sap/m/Button',
	'sap/ui/layout/VerticalLayout',
	'sap/m/Label',
	'sap/ui/thirdparty/sinon'
],
function(
	MutationObserver,
	OverlayUtil,
	Overlay,
	DesignTime,
	OverlayRegistry,
	Panel,
	Button,
	VerticalLayout,
	Label,
	sinon
) {
	'use strict';
	QUnit.start();

	QUnit.module("Given that a MutationObserver is created", {
		beforeEach : function() {
			this.oLabel = new Label({
				text : "text text text text text text text text text text text text text text text text text text"
			});
			this.oLabel.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
			this.oMutationObserver = new MutationObserver();
			this.oMutationObserver.addToWhiteList(this.oLabel.getId());
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
		var $Fixture = jQuery('#qunit-fixture');
		var iFixtureWidth = $Fixture.width();
		var done = assert.async();
		this.oMutationObserver.ignoreOnce({
			target: this.oLabel.getDomRef(),
			type: "childList"
		});
		assert.equal(this.oMutationObserver._aIgnoredMutations.length, 1, "the mutation is in ignore list");

		this.oMutationObserver.attachEventOnce("domChanged", function(oEvent) {
			assert.equal(oEvent.mParameters.targetNodes.indexOf(this.oLabel.getDomRef()), -1, "the label change is not part of the event");
			assert.equal(this.oMutationObserver._aIgnoredMutations.length, 0, "the mutation is no longer ignored");
			$Fixture.width(iFixtureWidth);
			done();
		}.bind(this));
		this.oLabel.$().append("<div />");
		$Fixture.width(100);
	});

	QUnit.module("Given a Vertical Layout with a scrollable Panel and another Vertical Layout with two scrollable panels for which DT is started...", {
		beforeEach : function(assert) {

			var aButtons0 = [20,21,22,23,24,25].map(function(i) {
				return new Button("button" + i);
			});
			this.Panel0 = new Panel({
				id : "SmallPanel",
				content : aButtons0,
				width : "100px",
				height : "100px"
			});

			var aButtons1 = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19].map(function(i) {
				return new Button("button" + i);
			});
			this.Panel1 = new Panel({
				id : "BigPanel",
				content : aButtons1,
				width : "100px",
				height : "1500px"
			});

			var aOutsideButtons = [26,27,28,29,30,31].map(function(i) {
				return new Button("button" + i);
			});

			this.oOutsidePanel = new Panel({
				id : "OutsidePanel",
				content : aOutsideButtons,
				width : "100px",
				height : "100px"
			});

			this.oVerticalLayoutOutsideDT = new VerticalLayout({
				id : "OutsiderVerticalLayout",
				content : this.oOutsidePanel
			});

			this.oVerticalLayoutRoot = new VerticalLayout({
				id : "RootVerticalLayout",
				content : [this.Panel0, this.Panel1]
			});

			this.oOuterPanel = new Panel({
				id : "OuterPanel",
				content : [this.oVerticalLayoutOutsideDT, this.oVerticalLayoutRoot],
				height : "1200px"
			}).placeAt("qunit-fixture");

			sap.ui.getCore().applyChanges();

			// Makes the area where DT will be active more prominent
			jQuery(this.oVerticalLayoutRoot.getDomRef()).css("outline", "solid");

			this.oDesignTime = new DesignTime({
				rootElements : [this.oVerticalLayoutRoot]
			});

			var done = assert.async();

			this.oDesignTime.attachEventOnce("synced", function() {
				this.oVerticalLayoutRootOverlay = OverlayRegistry.getOverlay(this.oVerticalLayoutRoot);
				done();
			}.bind(this));
		},
		afterEach : function() {
			this.oOuterPanel.destroy();
			this.oDesignTime.destroy();
		}
	});

	QUnit.test("when the panel outside of DT is scrolled", function(assert) {
		var done = assert.async();
		var spy = sinon.spy();
		Overlay.getMutationObserver().attachEventOnce("domChanged", spy);
		setTimeout(function () {
			assert.equal(spy.called, false, "then the event was not fired");
			done();
		});
		this.oOutsidePanel.$().find('>.sapMPanelContent').scrollTop(50);
	});

	QUnit.test("when the outer vertical layout is scrolled", function(assert) {
		var done = assert.async();
		Overlay.getMutationObserver().attachEventOnce("domChanged", function(oEvent) {
			assert.strictEqual(oEvent.mParameters.type, "scroll", "then a 'domChanged' with 'scroll'-type is triggered");
			done();
		});
		this.oOuterPanel.$().find('>.sapMPanelContent').scrollTop(50);
	});

	QUnit.test("when a panel inside DT is scrolled", function(assert) {
		var done = assert.async();
		var spy = sinon.spy();
		Overlay.getMutationObserver().attachEventOnce("domChanged", spy);
		setTimeout(function(){
			assert.equal(spy.called, false, "then the event was not fired");
			done();
		});
		this.Panel0.$().find('>.sapMPanelContent').scrollTop(50);
	});

	QUnit.done(function( details ) {
		jQuery("#qunit-fixture").hide();
	});
});
