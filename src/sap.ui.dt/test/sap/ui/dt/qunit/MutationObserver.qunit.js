/* global QUnit */

sap.ui.define([
	'sap/ui/dt/MutationObserver',
	'sap/ui/dt/Overlay',
	'sap/ui/dt/ElementOverlay',
	'sap/ui/dt/DesignTime',
	'sap/ui/dt/OverlayRegistry',
	'sap/m/Panel',
	'sap/m/Button',
	'sap/ui/layout/VerticalLayout',
	'sap/ui/dt/DOMUtil',
	'sap/base/util/includes',
	'sap/ui/thirdparty/sinon-4'
],
function(
	MutationObserver,
	Overlay,
	ElementOverlay,
	DesignTime,
	OverlayRegistry,
	Panel,
	Button,
	VerticalLayout,
	DOMUtil,
	includes,
	sinon
) {
	'use strict';

	QUnit.module("Given that a MutationObserver is created", {
		beforeEach: function() {
			this.$Node = jQuery("<div/>", {
				id: 'node-id'
			}).appendTo("#qunit-fixture");

			this.oMutationObserver = new MutationObserver();
			this.oMutationObserver.addToWhiteList(this.$Node.attr('id'));
		},
		afterEach: function() {
			this.oMutationObserver.destroy();
		}
	}, function () {
		QUnit.test("when window is resized", function(assert) {
			var fnDone = assert.async();

			this.oMutationObserver.attachEventOnce("domChanged", function (oEvent) {
				assert.ok(oEvent, 'DomChanged event is fired');
				fnDone();
			});
			jQuery(window).trigger("resize");
		});

		QUnit.test("when a relevant Node is modified", function (assert) {
			var fnDone = assert.async();

			this.oMutationObserver.attachEventOnce("domChanged", function (oEvent) {
				assert.ok(includes(oEvent.getParameter('targetNodes'), this.$Node.get(0)), "then domChanged is fired for relevant node");
				fnDone();
			}.bind(this));

			this.$Node.text("test");
		});

		QUnit.test("when the text node of a relevant node is modified", function (assert) {
			var fnDone = assert.async();
			this.$Node.append("test");
			// setTimeout is needed to ignore a mutation from setting text to Node
			setTimeout(function () {
				this.oMutationObserver.attachEventOnce("domChanged", function (oEvent) {
					assert.ok(includes(oEvent.getParameter('targetNodes'), this.$Node.get(0)), "then domChanged is fired with a relevant node");
					fnDone();
				}.bind(this));
				this.$Node.contents().get(0).nodeValue = "123";
			}.bind(this));
		});

		QUnit.test("ignoreOnce()", function (assert) {
			var fnDone = assert.async();
			assert.expect(1);
			this.oMutationObserver.ignoreOnce({
				target: this.$Node.get(0),
				type: "childList"
			});
			this.oMutationObserver.attachEvent("domChanged", function (oEvent) {
				assert.ok(includes(oEvent.getParameter('targetNodes'), this.$Node.get(0)), "the node change is part of the event, but emitted only once (first mutation is ignored)");
				fnDone();
			}, this);
			this.$Node.append("<div />");
			// setTimeout is needed to avoid native throttling by MutationObserver
			setTimeout(function () {
				this.$Node.append("<div />");
			}.bind(this));
		});

		QUnit.test("when animationend is called", function(assert) {
			var fnDone = assert.async();

			DOMUtil.insertStyles('\
				@keyframes example {\
					from	{ width: 100px; }\
					to		{ width: 200px; }\
				}\
				.customClass {\
					animation-name: example;\
					animation-duration: 0.05s;\
					animation-fill-mode: forwards;\
					height: 30px;\
					width: 100px;\
					background-color: blue;\
				} \
			', document.getElementById("qunit-fixture"));

			this.oMutationObserver.attachEvent("domChanged", function (oEvent) {
				if (oEvent.getParameter('type') === 'animationend') {
					assert.ok(true, 'domChanged event for animationend is fired');
					fnDone();
				}
			});

			this.$Node.addClass('customClass');
		});

		QUnit.test("when transitionend is called", function(assert) {
			var fnDone = assert.async();

			this.$Node.css({
				width: '100px',
				height: '30px',
				backgroundColor: 'blue',
				transition: 'width 0.05s linear'
			});

			this.oMutationObserver.attachEvent("domChanged", function (oEvent) {
				if (oEvent.getParameter('type') === 'transitionend') {
					assert.ok(true, 'domChanged event for transitionend is fired');
					fnDone();
				}
			});

			this.$Node.width('200px');
		});
	});

	QUnit.module("Static area mutations", {
		beforeEach: function() {
			this.$StaticUIArea = jQuery("<div/>", {
				id: "sap-ui-static"
			}).appendTo("#qunit-fixture");

			this.$Node = jQuery("<div/>", {
				id: 'node-id'
			}).appendTo(this.$StaticUIArea);

			this.oMutationObserver = new MutationObserver();
			this.oMutationObserver.addToWhiteList(this.$Node.attr('id'));
		},
		afterEach: function() {
			this.oMutationObserver.destroy();
		}
	}, function () {
		QUnit.test("when mutations in static UIArea happen inside irrelevant node", function (assert) {
			var fnDone = assert.async();
			var oSpy = sinon.spy();
			this.oMutationObserver.attachEvent("domChanged", oSpy);
			jQuery("<div/>").appendTo("#sap-ui-static");
			// setTimeout is needed because of async nature of native MutationObserver
			setTimeout(function () {
				assert.notOk(oSpy.called, 'then domChanged event has not been emitted');
				fnDone();
			});
		});

		QUnit.test("when mutations in static UIArea happen inside relevant node", function (assert) {
			var fnDone = assert.async();
			assert.expect(1);
			this.oMutationObserver.attachEvent("domChanged", function () {
				assert.ok(true, 'then domChanged event has been emitted');
				fnDone();
			});
			jQuery("<div/>").appendTo(this.$Node);
		});

		QUnit.test("when mutations in static UIArea happen on relevant node (simulate UI5 re-rendering)", function (assert) {
			var fnDone = assert.async();
			this.oMutationObserver.attachEventOnce("domChanged", function () {
				assert.ok(true, 'then domChanged event has been emitted');
				fnDone();
			}, this);
			this.$Node.replaceWith(this.$Node.clone());
		});
	});

	QUnit.module("Given a Vertical Layout with a scrollable Panel and another Vertical Layout with two scrollable panels for which DT is started...", {
		beforeEach: function(assert) {

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

			var fnDone = assert.async();

			this.oDesignTime.attachEventOnce("synced", function() {
				this.oVerticalLayoutRootOverlay = OverlayRegistry.getOverlay(this.oVerticalLayoutRoot);
				fnDone();
			}.bind(this));
		},
		afterEach: function() {
			this.oOuterPanel.destroy();
			this.oDesignTime.destroy();
		}
	}, function () {
		QUnit.test("when the panel outside of DT is scrolled", function(assert) {
			var fnDone = assert.async();
			var spy = sinon.spy();
			Overlay.getMutationObserver().attachEventOnce("domChanged", spy);
			setTimeout(function () {
				assert.equal(spy.called, false, "then the event was not fired");
				fnDone();
			});
			this.oOutsidePanel.$().find('>.sapMPanelContent').scrollTop(50);
		});

		QUnit.test("when the outer vertical layout is scrolled", function(assert) {
			var fnDone = assert.async();
			Overlay.getMutationObserver().attachEventOnce("domChanged", function(oEvent) {
				assert.strictEqual(oEvent.mParameters.type, "scroll", "then a 'domChanged' with 'scroll'-type is triggered");
				fnDone();
			});
			this.oOuterPanel.$().find('>.sapMPanelContent').scrollTop(50);
		});

		QUnit.test("when a panel inside DT is scrolled", function(assert) {
			var fnDone = assert.async();
			var spy = sinon.spy();
			Overlay.getMutationObserver().attachEventOnce("domChanged", spy);
			setTimeout(function(){
				assert.equal(spy.called, false, "then the event was not fired");
				fnDone();
			});
			this.Panel0.$().find('>.sapMPanelContent').scrollTop(50);
		});
	});

	QUnit.done(function() {
		jQuery("#qunit-fixture").hide();
	});
});
