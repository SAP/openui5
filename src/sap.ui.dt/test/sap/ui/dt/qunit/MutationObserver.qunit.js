/* global QUnit */

sap.ui.define([
	"sap/ui/dt/MutationObserver",
	"sap/ui/dt/DesignTime",
	"sap/ui/dt/OverlayRegistry",
	"sap/m/Panel",
	"sap/m/Button",
	"sap/ui/layout/VerticalLayout",
	"sap/ui/dt/DOMUtil",
	"sap/base/util/includes",
	"sap/ui/thirdparty/sinon-4"
],
function(
	MutationObserver,
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

	// Styles on "qunit-fixture" influence the scrolling tests if positioned on the screen during test execution.
	// Please keep this tag without any styling.
	jQuery("#qunit-fixture").removeAttr("style");

	var sandbox = sinon.sandbox.create();

	QUnit.module("Given that a MutationObserver is created", {
		beforeEach: function() {
			this.sNodeId = 'node-id';
			this.$Node = jQuery("<div/>", {
				id: this.sNodeId
			}).appendTo("#qunit-fixture");

			this.oMutationObserver = new MutationObserver();
		},
		afterEach: function() {
			this.oMutationObserver.destroy();
		}
	}, function () {
		QUnit.test("when registration is called once with root parameter", function (assert) {
			this.oMutationObserver.registerHandler(this.sNodeId, function () {}, true);
			assert.ok(this.oMutationObserver._bHandlerRegistred, "then mutation observer contains registered handlers");
			assert.strictEqual(typeof this.oMutationObserver._mMutationHandlers[this.sNodeId][0], "function", "then handler function is registered by the given nodeId");
			assert.strictEqual(this.oMutationObserver._aRootIds[0], this.sNodeId, "then the nodeId is registered as root");
		});

		QUnit.test("when registration and deregistration is called once", function (assert) {
			this.oMutationObserver.registerHandler(this.sNodeId, function () {}, true);
			this.oMutationObserver.deregisterHandler(this.sNodeId);
			assert.notOk(this.oMutationObserver._bHandlerRegistred, "then mutation observer does not contain registered handlers");
			assert.notOk(this.oMutationObserver._mMutationHandlers[this.sNodeId], "then handler function is not registered by the given nodeId");
			assert.notOk(this.oMutationObserver._aRootIds.length, "then root registration is empty");
		});

		QUnit.test("when window is resized several times directly behind each other", function(assert) {
			var fnDone = assert.async();
			var fnHandlerSpy = sinon.spy(function (mParameters) {
				assert.strictEqual(mParameters.type, "MutationOnResize", "then DomChanged handler is triggered by resize mutation");
				window.requestAnimationFrame(function () {
					assert.strictEqual(fnHandlerSpy.callCount, 1, "then DomChanged handler is called just once");
					fnDone();
				});
			});
			this.oMutationObserver.registerHandler(this.$Node.attr("id"), fnHandlerSpy, true);
			for (var i = 0; i < 3; i++) {
				jQuery(window).trigger("resize");
			}
		});

		QUnit.test("when a relevant Node is modified", function (assert) {
			var fnDone = assert.async();

			this.oMutationObserver.registerHandler(this.sNodeId, function (mParameters) {
				assert.ok(includes(mParameters.type, "MutationObserver"), "then domChanged callback is called for relevant node");
				fnDone();
			}, true);

			this.$Node.text("test");
		});

		QUnit.test("when the overlay container is added to the body", function (assert) {
			var fnDone = assert.async();
			var oMutationHandlerSpy = sandbox.spy();
			this.oMutationObserver.registerHandler(this.sNodeId, oMutationHandlerSpy, true);
			jQuery("<div/>").attr("id", "overlay-container").appendTo("body");
			// setTimeout required. requestAnimationFrame inside MutationObserver should be started first
			setTimeout(function () {
				window.requestAnimationFrame(function () {
					assert.notOk(oMutationHandlerSpy.called, "the handler should not be called when overlay-container is added to the body");
					fnDone();
				});
			});
		});

		QUnit.test("when the text node of a relevant node is modified", function (assert) {
			var fnDone = assert.async();
			this.$Node.append("test");
			// setTimeout is needed to ignore a mutation from setting text to Node
			setTimeout(function () {
				this.oMutationObserver.registerHandler(this.sNodeId, function (mParameters) {
					assert.ok(includes(mParameters.type, "MutationObserver"), "then domChanged callback is called with a relevant node");
					fnDone();
				}, true);
				this.$Node.contents().get(0).nodeValue = "123";
			}.bind(this));
		});

		QUnit.test("ignoreOnce()", function (assert) {
			var fnDone = assert.async();
			assert.expect(4);
			this.oMutationObserver.ignoreOnce({
				target: this.$Node.get(0),
				type: "childList"
			});
			this.oMutationObserver.registerHandler(this.sNodeId, function (mParameters) {
				// for the target node only one domChanged event should be fired
				assert.ok(includes(mParameters.type, "MutationObserver"), "then domChanged callback is called with a relevant node");
				assert.ok(true, "the node change is part of the event, but emitted only once (first mutation is ignored)");
				assert.equal(this.$Node[0].childNodes[0].id, "test1", "then first div is appended");
				assert.equal(this.$Node[0].childNodes[1].id, "test2", "then second div is appended");
				fnDone();
			}.bind(this), true);
			this.$Node.append('<div id="test1"/>');
			// setTimeout is needed to avoid native throttling by MutationObserver
			setTimeout(function () {
				this.$Node.append('<div id="test2"/>');
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

			this.oMutationObserver.registerHandler(this.sNodeId, function (mParameters) {
				if (mParameters.type === 'MutationOnAnimationEnd') {
					assert.ok(true, 'then domchanged callback called for mutation triggered by animationend');
					fnDone();
				}
			}, true);

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

			this.oMutationObserver.registerHandler(this.sNodeId, function (mParameters) {
				if (mParameters.type === 'MutationOnTransitionend') {
					assert.ok(true, 'then domchanged callback called for mutation triggered by transitionend');
					fnDone();
				}
			}, true);

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
		},
		afterEach: function() {
			this.oMutationObserver.destroy();
			sandbox.restore();
		}
	}, function () {
		QUnit.test("when mutations in static UIArea happen inside irrelevant node", function (assert) {
			var fnDone = assert.async();
			var oSpy = sandbox.spy();
			this.oMutationObserver.registerHandler(this.$Node.attr('id'), oSpy, true);
			jQuery("<div/>").appendTo("#sap-ui-static");
			// setTimeout is needed because of async nature of native MutationObserver
			setTimeout(function () {
				assert.notOk(oSpy.called, 'then domChanged callback has not been called');
				fnDone();
			});
		});

		QUnit.test("when mutations in static UIArea happen inside relevant node", function (assert) {
			var fnDone = assert.async();
			assert.expect(1);
			this.oMutationObserver.registerHandler(this.$Node.attr('id'), function () {
				assert.ok(true, 'then domChanged callback has been called');
				fnDone();
			}, true);
			jQuery("<div/>").appendTo(this.$Node);
		});

		QUnit.test("when mutations in static UIArea happen on relevant node (simulate UI5 re-rendering)", function (assert) {
			var fnDone = assert.async();
			this.oMutationObserver.registerHandler(this.$Node.attr('id'), function () {
				assert.ok(true, 'then domChanged callback has been called');
				fnDone();
			}, true);
			this.$Node.replaceWith(this.$Node.clone());
		});
	});

	QUnit.module("Given a Vertical Layout with a scrollable Panel and another Vertical Layout with two scrollable panels for which DT is started...", {
		beforeEach: function(assert) {
			var aButtons0 = [20, 21, 22, 23, 24, 25].map(function(i) {
				return new Button("button" + i);
			});
			this.Panel0 = new Panel({
				id : "SmallPanel",
				content : aButtons0,
				width : "100px",
				height : "100px"
			});

			var aButtons1 = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19].map(function(i) {
				return new Button("button" + i);
			});
			this.Panel1 = new Panel({
				id : "BigPanel",
				content : aButtons1,
				width : "100px",
				height : "1500px"
			});

			var aOutsideButtons = [26, 27, 28, 29, 30, 31].map(function(i) {
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
				this.oSmallPanelOverlay = OverlayRegistry.getOverlay(this.Panel0);
				fnDone();
			}.bind(this));
		},
		afterEach: function() {
			this.oOuterPanel.destroy();
			this.oDesignTime.destroy();
			sandbox.restore();
		}
	}, function () {
		QUnit.test("when the panel outside of DT is scrolled", function(assert) {
			var fnDone = assert.async();
			var fnHandlerSpy = sandbox.spy();
			this.oVerticalLayoutRootOverlay.attachEventOnce("applyStylesRequired", fnHandlerSpy);
			this.oOutsidePanel.$().find('>.sapMPanelContent').scrollTop(50);
			window.requestAnimationFrame(function () {
				assert.equal(fnHandlerSpy.called, false, "then the domchanged callback was not called");
				fnDone();
			});
		});

		QUnit.test("when the outer vertical layout is scrolled", function(assert) {
			var fnDone = assert.async();
			this.oVerticalLayoutRootOverlay.attachEventOnce("applyStylesRequired", function (oEvent) {
				assert.strictEqual(oEvent.getParameters().type, "MutationOnScroll", "then a domchanged callback with 'scroll'-type is called");
				fnDone();
			});
			this.oOuterPanel.$().find('>.sapMPanelContent').scrollTop(50);
		});

		QUnit.test("when a panel inside DT is scrolled", function(assert) {
			var fnDone = assert.async();
			var spy = sandbox.spy();
			this.oVerticalLayoutRootOverlay.attachEventOnce("applyStylesRequired", spy);
			setTimeout(function() {
				assert.equal(spy.called, false, "then the domchanged callback was not fired");
				fnDone();
			});
			this.Panel0.$().find('>.sapMPanelContent').scrollTop(50);
		});
	});

	QUnit.module("Given a outer Panel and VerticalLayout inside containing inner Panel with Button...", {
		beforeEach: function() {
			this.oButton = new Button("Button0");
			this.oInnerPanel = new Panel({
				id : "InnerPanel",
				content : [this.oButton],
				height : "200px"
			});

			this.oVerticalLayoutInner = new VerticalLayout({
				id : "InnerVerticalLayout",
				content : [this.oInnerPanel]
			}).placeAt("qunit-fixture");

			this.oOuterPanel = new Panel({
				id : "OuterPanel",
				content : [this.oVerticalLayoutInner]
			}).placeAt("qunit-fixture");

			sap.ui.getCore().applyChanges();

			// Makes the area where DT will be active more prominent
			jQuery(this.oVerticalLayoutInner.getDomRef()).css("outline", "solid");

			this.oMutationObserver = new MutationObserver();
		},
		afterEach: function() {
			this.oOuterPanel.destroy();
			this.oMutationObserver.destroy();
		}
	}, function () {
		QUnit.test("when the just the Inner Layout is registered for mutations and button is modified", function(assert) {
			var fnDone = assert.async();
			this.oMutationObserver.registerHandler(this.oVerticalLayoutInner.getId(), function () {
				// First mutation is triggered by qunit
				assert.ok(true, 'then domChanged callback on Inner Layout has been called');
				fnDone();
			}, true);
			this.oButton.setText('hallo');
		});

		QUnit.test("when the the inner Layout and button are registered for mutations and the button is modified", function(assert) {
			var fnDone = assert.async();
			this.oMutationObserver.registerHandler(this.oVerticalLayoutInner.getId(), function () {
				// First mutation is triggered by qunit
				assert.ok(true, 'then domChanged callback on Inner Layout has been called');
				fnDone();
			}, true);
			this.oMutationObserver.registerHandler(this.oButton.getId(), function () {
				assert.notOk(true, 'then domChanged callback on Button should not been called');
			});
			this.oButton.setText('hallo');
		});

		QUnit.test("when outerPanel has a scrollbar and all Elements are registered for mutations and the button is modified", function(assert) {
			var fnDone = assert.async();
			this.oOuterPanel.setHeight("150px");
			sap.ui.getCore().applyChanges();

			this.oMutationObserver.registerHandler(this.oOuterPanel.getId(), function () {
				// First mutation is triggered by qunit
				this.oMutationObserver.exit();
				assert.ok(true, 'then domChanged callback on outer Panel has been called');
				fnDone();
			}.bind(this), true);
			this.oMutationObserver.registerHandler(this.oInnerPanel.getId(), function () {
				assert.notOk(true, 'then domChanged callback on Inner Panel should not been called');
			});
			this.oMutationObserver.registerHandler(this.oVerticalLayoutInner.getId(), function () {
				assert.notOk(true, 'then domChanged callback on Inner Layout should not been called');
			});
			this.oMutationObserver.registerHandler(this.oButton.getId(), function () {
				assert.notOk(true, 'then domChanged callback on Button should not been called');
			});
			this.oButton.setText('hallo');
		});

		QUnit.test("when outerPanel has a scrollbar, is registered and is modified", function(assert) {
			var fnDone = assert.async();
			this.oOuterPanel.setHeight("150px");
			sap.ui.getCore().applyChanges();

			this.oMutationObserver.registerHandler(this.oOuterPanel.getId(), function () {
				// First mutation is triggered by qunit
				this.oMutationObserver.exit();
				assert.ok(true, 'then domChanged callback on outer Panel have been called');
				fnDone();
			}.bind(this), true);
			this.oMutationObserver.registerHandler(this.oInnerPanel.getId(), function () {
				assert.notOk(true, 'then domChanged callback on inner Panel should not been called');
			});
			this.oMutationObserver.registerHandler(this.oButton.getId(), function () {
				assert.notOk(true, 'then domChanged callback on Button should not been called');
			});
			this.oOuterPanel.setHeaderText('hallo');
		});
	});

	QUnit.module("Given two layouts as siblings...", {
		beforeEach: function() {
			this.oButton0 = new Button("button0", { text: "button0-text" });
			this.oButton1 = new Button("button1", { text: "button1-text" });

			this.oVerticalLayout0 = new VerticalLayout({
				id : "verticalLayout0",
				content : [this.oButton0]
			}).placeAt("qunit-fixture");

			this.oVerticalLayout1 = new VerticalLayout({
				id : "verticalLayout1",
				content : [this.oButton1]
			}).placeAt("qunit-fixture");

			sap.ui.getCore().applyChanges();

			// Makes the area where DT will be active more prominent
			jQuery(this.oVerticalLayout0.getDomRef()).css("outline", "solid");
			jQuery(this.oVerticalLayout1.getDomRef()).css("outline", "solid");

			this.oMutationObserver = new MutationObserver();
		},
		afterEach: function() {
			this.oVerticalLayout0.destroy();
			this.oVerticalLayout1.destroy();
			this.oMutationObserver.destroy();
		}
	}, function () {
		QUnit.test("when both layouts are registered as root elements", function(assert) {
			var fnDone = assert.async();
			this.oMutationObserver.registerHandler(this.oVerticalLayout0.getId(), function () {
				// First mutation is triggered by qunit
				assert.notOk(true, 'then domChanged callback on layout0 should not been called');
			}, true);
			this.oMutationObserver.registerHandler(this.oVerticalLayout1.getId(), function () {
				// First mutation is triggered by qunit
				assert.ok(true, 'then domChanged callback on layout1 has been called');
				fnDone();
			}, true);
			this.oButton1.setText('button1-text-RENAMED');
		});
	});

	QUnit.done(function() {
		jQuery("#qunit-fixture").hide();
	});
});
