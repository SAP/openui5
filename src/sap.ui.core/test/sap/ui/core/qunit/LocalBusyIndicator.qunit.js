/*global QUnit, sinon */
sap.ui.define([
	"sap/ui/core/LocalBusyIndicatorSupport",
	"sap/m/BusyDialog",
	"sap/m/Button",
	"sap/m/List",
	"sap/m/Slider",
	"sap/m/StandardListItem",
	"sap/m/VBox",
	"sap/ui/core/Control",
	"sap/ui/core/Element",
	"sap/ui/core/mvc/XMLView",
	"sap/ui/events/KeyCodes",
	"sap/ui/thirdparty/jquery",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/nextUIUpdate"
], function(LocalBusyIndicatorSupport, BusyDialog, Button, List, Slider, StandardListItem, VBox, Control, Element, XMLView, KeyCodes, jQuery, qutils, nextUIUpdate) {
	"use strict";

	// Checks whether the given DomRef is contained or equals (in) one of the given container
	function isContained(aContainers, oRef) {
		for (var i = 0; i < aContainers.length; i++) {
			if (aContainers[i] === oRef || jQuery.contains(aContainers[i], oRef)) {
				return true;
			}
		}
		return false;
	}

	// Returns a jQuery object which contains all next/previous (bNext) tabbable DOM elements of the given starting point (oRef) within the given scopes (DOMRefs)
	function findTabbables(oRef, aScopes, bNext) {
		var $Ref = jQuery(oRef),
			$All, $Tabbables;

		if (bNext) {
			$All = jQuery.merge($Ref.find("*"), jQuery.merge($Ref.nextAll(), $Ref.parents().nextAll()));
			$Tabbables = $All.find(':sapTabbable').addBack(':sapTabbable');
		} else {
			$All = jQuery.merge($Ref.prevAll(), $Ref.parents().prevAll());
			$Tabbables = jQuery.merge($Ref.parents(':sapTabbable'), $All.find(':sapTabbable').addBack(':sapTabbable'));
		}

		$Tabbables = jQuery.uniqueSort($Tabbables);
		return $Tabbables.filter(function() {
			return isContained(aScopes, this);
		});
	}

	function simulateTabEvent(oTarget, bBackward) {
		var oParams = {};
		oParams.keyCode = KeyCodes.TAB;
		oParams.which = oParams.keyCode;
		oParams.shiftKey = !!bBackward;
		oParams.altKey = false;
		oParams.metaKey = false;
		oParams.ctrlKey = false;

		if (typeof (oTarget) == "string") {
			oTarget = document.getElementById(oTarget);
		}

		var oEvent = jQuery.Event({type: "keydown"});
		for (var x in oParams) {
			oEvent[x] = oParams[x];
			oEvent.originalEvent[x] = oParams[x];
		}

		jQuery(oTarget).trigger(oEvent);

		if (oEvent.isDefaultPrevented()) {
			return;
		}

		var $Tabbables = findTabbables(document.activeElement, [document.getElementById("target1")], !bBackward);
		if ($Tabbables.length) {
			$Tabbables.get(bBackward ? $Tabbables.length - 1 : 0).focus();
		}
	}

	/**
	 * Check whether an element is focused.
	 * @param {jQuery|HTMLElement} oElement The element to check.
	 * @param {Object} assert QUnit assert object.
	 * @returns {jQuery} A jQuery object containing the active element.
	 */
	function checkFocus(oElement, assert) {
		var $ActiveElement = jQuery(document.activeElement);
		var $Element = jQuery(oElement);

		assert.ok($Element[0] === document.activeElement, "Focus is on: " + $ActiveElement.attr("id") + ", should be on: " + $Element.attr("id"));

		return $ActiveElement;
	}

	// create page content
	["target1", "target2", "target3", "failsafeTests"].forEach(function(sId) {
		var oDIV = document.createElement("div");
		oDIV.id = sId;
		document.body.appendChild(oDIV);
	});



	QUnit.module("Basic", {
		beforeEach : function() {
			this.oFocusBefore = new Button("FocusBefore").placeAt("target1");
			this.oListBox = new List({
				tooltip : "Country",
				width : "200px",
				items : [ new StandardListItem({
					title : "I'm an item, and you?"
				}) ]
			}).placeAt("target1");
			this.oFocusAfter = new Button("FocusAfter").placeAt("target1");
			this.oSlider = new Slider().placeAt("target2");

			return nextUIUpdate();
		},

		afterEach : function() {
			this.oFocusBefore.destroy();
			this.oFocusAfter.destroy();
			this.oListBox.destroy();
			this.oSlider.destroy();
		}
	});

	// make sure the controls are not busy
	QUnit.test("InitialCheck", function(assert) {
		assert.equal(this.oSlider.getBusy(), false, "Slider is not busy");
		assert.equal(this.oListBox.getBusy(), false, "Listbox is not busy");
	});

	QUnit.test("Accessibility", function(assert) {
		var done = assert.async();
		this.oListBox.setBusy(true);
		var $LB = this.oListBox.$();
		var iChildren = $LB.children().length;

		setTimeout(function() {
			var oBusyIndicatorDOM = $LB.children('.sapUiLocalBusyIndicator')[0];
			assert.equal($LB.children().length, iChildren + 1, 'Busy Indicator added to DOM tree');
			assert.ok(!$LB[0].hasAttribute("aria-busy"), "ARIA busy isn't set to Control");
			assert.equal(oBusyIndicatorDOM.getAttribute("role"), "progressbar", 'ARIA role "progressbar" is set to busy indicator');
			assert.ok(oBusyIndicatorDOM.hasAttribute("title"), 'title is set to busy indicator');
			assert.ok(oBusyIndicatorDOM.hasAttribute("aria-valuemin"), 'aria-valuemin is set to busy indicator');
			assert.ok(oBusyIndicatorDOM.hasAttribute("aria-valuemax"), 'aria-valuemax is set to busy indicator');
			assert.ok(oBusyIndicatorDOM.hasAttribute("aria-valuetext"), 'aria-valuetext is set to busy indicator');
			done();
		}, 1200);
	});

	QUnit.test("tab chain - busy delay 0", function(assert) {
		var done = assert.async(),
			oElem;
		this.oFocusBefore.getDomRef().focus();
		this.oListBox.setBusyIndicatorDelay(0);
		this.oListBox.setBusy(true);
		simulateTabEvent(this.oFocusBefore.getDomRef());
		oElem = this.oListBox.getDomRef("busyIndicator");
		checkFocus(oElem, assert);
		simulateTabEvent(oElem);
		checkFocus(this.oFocusAfter.getDomRef(), assert);
		simulateTabEvent(this.oFocusAfter.getDomRef(), true);
		checkFocus(oElem, assert);
		simulateTabEvent(oElem, true);
		checkFocus(this.oFocusBefore.getDomRef(), assert);
		done();
	});

	QUnit.test("tab chain - normal delay", function(assert) {
		var done = assert.async(),
			oElem;
		this.oFocusBefore.getDomRef().focus();
		this.oListBox.setBusy(true);

		simulateTabEvent(this.oFocusBefore.getDomRef());
		oElem = document.getElementById(this.oListBox.getItems()[0].getId());
		checkFocus(oElem, assert);
		simulateTabEvent(oElem);
		checkFocus(this.oFocusAfter.getDomRef(), assert);
		simulateTabEvent(this.oFocusAfter.getDomRef(), true);
		checkFocus(oElem, assert);
		simulateTabEvent(oElem, true);
		checkFocus(this.oFocusBefore.getDomRef(), assert);

		setTimeout(function() {
			simulateTabEvent(this.oFocusBefore.getDomRef());
			oElem = this.oListBox.getDomRef("busyIndicator");
			checkFocus(oElem, assert);
			simulateTabEvent(oElem);
			checkFocus(this.oFocusAfter.getDomRef(), assert);
			simulateTabEvent(this.oFocusAfter.getDomRef(), true);
			oElem = this.oListBox.getDomRef("busyIndicator");
			checkFocus(oElem, assert);
			simulateTabEvent(oElem, true);
			checkFocus(this.oFocusBefore.getDomRef(), assert);
			done();
		}.bind(this), 1200);
	});

	QUnit.test("Check suppressed events", function(assert) {
		var done = assert.async();
		this.oListBox.setBusyIndicatorDelay(0);
		this.oListBox.setBusy(true);
		var $LB = this.oListBox.$();

		var aPreventedEvents = [
			"focusin",
			"focusout",
			"keydown",
			"keypress",
			"keyup",
			"mousedown",
			"touchstart",
			"touchmove",
			"mouseup",
			"touchend",
			"click"
		];

		var sListenerCalled = 'not called';
		function fnEventListener(oEvent) {
			sListenerCalled = 'called';
		}

		// register listener for all prevented events
		// Note: the issues described in BCP 1680184582 only occurs when the prevent-listener of the LocalBusyIndicator
		// is executed __BEFORE__ this listener here. As jQuery uses a while(--i) loop, this means we have to register
		// our listener before the LBI registers its own listener.
		// TODO consider using a capturing phase listener in LBI to make this more robust.
		for (var i = 0; i < aPreventedEvents.length; i++) {
			$LB.on(aPreventedEvents[i], fnEventListener);
		}

		setTimeout(function() {

			for (var i = 0; i < aPreventedEvents.length; i++) {

				try {
					sListenerCalled = 'not called';
					qutils.triggerEvent(aPreventedEvents[i], $LB);
					assert.equal(sListenerCalled, 'not called', "Event '" + aPreventedEvents[i] + "' should be suppressed");
				} catch (ex) {
					assert.ok(false, "Event '" + aPreventedEvents[i] + "' NOT suppressed");
				}

			}

			// hide busy indicator and test that events are no longer prevented
			this.oListBox.setBusy(false);
			$LB = this.oListBox.$();

			setTimeout(function() {

				for (var i = 0; i < aPreventedEvents.length; i++) {

					try {
						sListenerCalled = 'not called';
						qutils.triggerEvent(aPreventedEvents[i], $LB);
						assert.equal(sListenerCalled, 'called', "Event '" + aPreventedEvents[i] + "' should no longer be suppressed");
					} catch (ex) {
						// assert.ok(false, "Event '" + aPreventedEvents[i] + "' NOT suppressed");
					}

				}

				done();

			}, 250);

		}.bind(this), 250);
	});



	QUnit.module("Open and Close", {
		beforeEach : function() {
			this.oListBox = new List({
				tooltip : "Country",
				width : "200px",
				items : [ new StandardListItem({
					title : "I'm an item, and you?"
				}) ]
			}).placeAt("target1");

			this.oSlider = new Slider().placeAt("target2");

			return nextUIUpdate();
		},

		afterEach : function() {
			this.oListBox.destroy();
			this.oSlider.destroy();
		}
	});

	QUnit.test("Delayed opening", function(assert) {
		var done = assert.async();
		var that = this;
		this.oListBox.setBusy(true);

		assert.equal(this.oListBox.$().children('.sapUiLocalBusyIndicator').length, 0, 'Busy Indicator not yet added to DOM');
		assert.equal(this.oListBox.getBusy(), true, 'ListBox is busy');

		setTimeout(function() {
			assert.equal(that.oListBox.$().children('.sapUiLocalBusyIndicator').length, 1, 'Busy Indicator is part of the DOM');
			done();
		}, 1200);
	});

	QUnit.test("Close Busy Indicator", function(assert) {
		var done = assert.async();
		assert.expect(7);
		var that = this;
		this.oListBox.setBusy(true);

		assert.equal(this.oListBox.$().children('.sapUiLocalBusyIndicator').length, 0, 'Busy Indicator not yet added to DOM');
		assert.equal(this.oListBox.getBusy(), true, 'ListBox is busy');
		assert.equal(this.oListBox.getDomRef().parentElement.children.length, 1, 'No additional elements in dom');

		setTimeout(function() {
			assert.equal(that.oListBox.$().children('.sapUiLocalBusyIndicator').length, 1, 'Busy Indicator is part of the DOM');

			that.oListBox.setBusy(false);

			setTimeout(function() {
				assert.equal(that.oListBox.$().children('.sapUiLocalBusyIndicator').length, 0, 'Busy Indicator was romoved from DOM');
				assert.equal(that.oListBox.getBusy(), false, 'ListBox is not busy anymore');
				assert.equal(that.oListBox.getDomRef().parentElement.children.length, 1, 'No additional elements in dom');
				done();
			}, 250);
		}, 1200);
	});

	/**
	 * This test checks if the busy indicator does not crash after the outer control was already
	 * removed from the DOM, when the
	 */
	QUnit.test("BusyIndicator and Already Closed sap.m.BusyDialog does not crash", function(assert) {
		var done = assert.async();

		var dialog = new BusyDialog({
			title: "Loading",
			text: "something loading..."
		});

		dialog.open();
		setTimeout(function () {
			Element.closestTo("#__dialog0-busyInd").setBusy(true);
			dialog.close();
			assert.ok("everythings fine");
			done();
		}, 250);

	});

	QUnit.test("Open multiple busy indicators", function(assert) {
		var done = assert.async();
		var that = this;

		this.oListBox.setBusy(true);
		this.oSlider.setBusy(true);

		assert.equal(this.oListBox.$().children('.sapUiLocalBusyIndicator').length, 0, 'Listbox Busy Indicator not yet added to DOM');
		assert.equal(this.oSlider.$().children('.sapUiLocalBusyIndicator').length, 0, 'Slider Busy Indicator not yet added to DOM');
		assert.equal(this.oListBox.getBusy(), true, 'ListBox is busy');
		assert.equal(this.oSlider.getBusy(), true, 'Slider is busy');

		setTimeout(function() {
			assert.equal(that.oListBox.$().children('.sapUiLocalBusyIndicator').length, 1, 'Listbox Busy Indicator is part of the DOM');
			assert.equal(that.oSlider.$().children('.sapUiLocalBusyIndicator').length, 1, 'Slider Busy Indicator is part of the DOM');
			done();
		}, 1200);
	});

	// as XML-View maintains the DOM itself, busy indicator should treat this particularly, as otherwise duplicate
	// busy indicators would be created when rerendering and never removed
	QUnit.test("Busy indicator on XML View", function(assert) {
		var done = assert.async();
		// setup the busy view
		return XMLView.create({
			definition: '<mvc:View xmlns:mvc="sap.ui.core.mvc" busyIndicatorDelay="0"></mvc:View>'
		}).then(async function(myView) {
			myView.placeAt('target1');
			await nextUIUpdate();
			myView.setBusy(true);
			// this rerendering is crucial to test the behavior
			myView.invalidate();
			await nextUIUpdate();
			setTimeout(function() {
				// assert
				assert.ok(myView.$("busyIndicator").length, "BusyIndicator rendered");
				myView.setBusy(false);
				assert.ok(!myView.$("busyIndicator").length, "All BusyIndicators removed");
				//cleanup
				myView.destroy();
				done();
			}, 50);
		});
	});

	QUnit.test("span elements for tab chain", function(assert) {
		this.oListBox.setBusyIndicatorDelay(0);
		var oBusySection = jQuery(this.oListBox.getDomRef(this.oListBox._sBusySection));
		var aChildrenBefore = oBusySection.parent()[0].childNodes;

		assert.equal(aChildrenBefore.length, 1, 'No busy spans inserted');
		this.oListBox.setBusy(true);
		assert.equal(this.oListBox.getBusy(), true, 'ListBox is busy');
		assert.equal(aChildrenBefore.length, 3, 'busy spans inserted');
		this.oListBox.setBusy(true);
		assert.equal(aChildrenBefore.length, 3, 'busy spans inserted only once');
		this.oListBox.setBusy(false);
		assert.equal(aChildrenBefore.length, 1, 'No busy spans inserted');
		this.oListBox.setBusy(false);
		this.oListBox.setBusy(false);
		assert.equal(aChildrenBefore.length, 1, 'No busy spans inserted');
		this.oListBox.setBusy(true);
		assert.equal(aChildrenBefore.length, 3, 'busy spans inserted only once');
		this.oListBox.setBusy(false);
	});



	QUnit.module("Delay", {
		beforeEach : function() {
			this.iDelay = 500;
			this.oButton = new Button({
				busy : true,
				busyIndicatorDelay : this.iDelay,
				text : "Delayed BusyIndicator"
			});
		},

		afterEach : function() {
			delete this.iDelay;
			this.oButton.destroy();
		}
	});

	QUnit.test("OnBeforeRendering", async function(assert) {
		var done = assert.async();

		this.oButton.setBusyIndicatorDelay(0);

		this.oButton.placeAt("target1");
		this.oButton.setBusy(true);

		await nextUIUpdate();

		// before delegate
		this.oButton.addDelegate({
			onBeforeRendering: function() {
				var oControl = this.getDomRef();
				var oBusyIndicator = this.getDomRef("busyIndicator");

				assert.equal(oControl.previousElementSibling.nodeName.toLowerCase(), "span", "<span> before is available.");
				assert.equal(oControl.previousElementSibling.getAttribute("tabindex"), 0, "Previous <span> has tabindex 0.");
				assert.ok(oBusyIndicator, "BusyIndicator DOM is still available.");
				assert.equal(oControl.nextElementSibling.nodeName.toLowerCase(), "span", "<span> after is available.");
				assert.equal(oControl.previousElementSibling.getAttribute("tabindex"), 0, "Next <span> has tabindex 0.");
			}
		}, true, this.oButton);

		// after delegate
		this.oButton.addDelegate({
			onBeforeRendering: function() {
				var oControl = this.getDomRef();
				var oBusyIndicator = this.getDomRef("busyIndicator");

				// check if prev & next sibilings are either not existant or not a <span tabindex='0'> element
				var oTabSpan = oControl.previousElementSibling;
				assert.ok(oTabSpan === null || (oTabSpan.getAttribute("tabindex") !== "0" && oTabSpan.nodeName !== "SPAN"), "Previous tabbable span shouldn't be available.");

				assert.notOk(oBusyIndicator, "BusyIndicator DOM is now removed");

				oTabSpan = oControl.nextElementSibling;
				assert.ok(oTabSpan === null || (oTabSpan.getAttribute("tabindex") !== "0" && oTabSpan.nodeName !== "SPAN"), "Previous tabbable span shouldn't be available.");

				done();
			}
		}, false, this.oButton);

		// force a rendering
		this.oButton.invalidate();
		await nextUIUpdate();
	});

	QUnit.test("OnAfterRendering", async function(assert) {
		var done = assert.async();
		assert.expect(4);
		this.oButton.placeAt("target1");
		await nextUIUpdate();
		var that = this;

		setTimeout(function() {
			// set busy after rendering but no animation shown
			assert.ok(that.oButton.getBusy(), "Button is set to busy");
			var $BusyIndicator = that.oButton.$("busyIndicator");
			assert.ok(!$BusyIndicator.length, "BusyIndicator isn't shown yet");

			setTimeout(function() {
				// set busy and animation shown
				assert.ok(that.oButton.getBusy(), "Button still set to busy");
				$BusyIndicator = that.oButton.$("busyIndicator");
				assert.ok($BusyIndicator.length, "BusyIndicator is shown after delay");

				done();
			}, that.iDelay);
		}, 200);
	});

	QUnit.test("Ensuring DelayedCall Only Used Once", async function(assert) {
		var done = assert.async();
		assert.expect(2);

		var iFirstDelayedCallId,
			iSecondDelayedCallId;
		var oOnAfterRenderingDelegate = {
			onAfterRendering : function() {
				if (!iFirstDelayedCallId) {
					// first rendering will call delegate
					iFirstDelayedCallId = this.oButton._busyIndicatorDelayedCallId;
				} else if (!iSecondDelayedCallId) {
					// second call will happen when the text of the button is being changed
					iSecondDelayedCallId = this.oButton._busyIndicatorDelayedCallId;
				}
			}
		};
		this.oButton.addDelegate(oOnAfterRenderingDelegate, false, this);
		this.oButton.placeAt("target1");
		await nextUIUpdate();
		var that = this;

		setTimeout(function() {
			assert.ok(iFirstDelayedCallId && !iSecondDelayedCallId, "Delayed call started in afterRendering of control");

			// Force a re-rendering while waiting for the delay
			// (possible for example if a binding changes properties asynchronously)
			that.oButton.setText("Changed Text");

			setTimeout(function() {
				// set busy and animation shown
				assert.ok(iFirstDelayedCallId === iSecondDelayedCallId, "Delayed call not overwritten by rerendering");

				done();
			}, that.iDelay);
		}, 20);
	});



	QUnit.module("Busy Animation");

	QUnit.test("Check if small Animation is used", async function(assert) {
		var done = assert.async();

		this.oBtn = new Button({
			text : "Blub",
			width : "45px",
			busyIndicatorSize : 'Small',
			busy : true,
			busyIndicatorDelay : 0
		}).placeAt("target1");

		this.oDelegate = {
			onAfterRendering : function(oEvent) {}
		};
		this.oBtn.addDelegate(this.oDelegate);
		this.oSpy = sinon.spy(this.oDelegate, "onAfterRendering");

		await nextUIUpdate();

		setTimeout(function() {
			var $Animation = jQuery(".sapUiLocalBusyIndicatorAnimation");
			assert.ok($Animation.length, "Animation exists");
			assert.ok($Animation.hasClass("sapUiLocalBusyIndicatorAnimSmall"), "Correct CSS class set to DOM");

			assert.equal(this.oSpy.callCount, 1, "Icon should be rendered once");

			this.oSpy.restore();
			delete this.oSpy;
			this.oBtn.removeDelegate(this.oDelegate);
			delete this.oDelegate;
			this.oBtn.destroy();

			done();
		}.bind(this), 50);
	});

	QUnit.test("Check if small Animation is used", async function(assert) {
		var done = assert.async();

		this.oBtn = new Button({
			text : "Blub",
			width : "45px",
			busyIndicatorSize : 'Auto',
			busy : true,
			busyIndicatorDelay : 0
		}).placeAt("target1");

		this.oDelegate = {
			onAfterRendering : function(oEvent) {}
		};
		this.oBtn.addDelegate(this.oDelegate);
		this.oSpy = sinon.spy(this.oDelegate, "onAfterRendering");

		await nextUIUpdate();

		setTimeout(function() {
			var $Animation = jQuery(".sapUiLocalBusyIndicatorAnimation");
			assert.ok($Animation.length, "Animation exists");
			assert.ok($Animation.hasClass("sapUiLocalBusyIndicatorAnimSmall"), "Correct CSS class set to DOM");

			assert.equal(this.oSpy.callCount, 1, "Icon should be rendered once");

			this.oSpy.restore();
			delete this.oSpy;
			this.oBtn.removeDelegate(this.oDelegate);
			delete this.oDelegate;
			this.oBtn.destroy();

			done();
		}.bind(this), 50);
	});

	QUnit.test("Check if animations are stacked", async function(assert) {
		var done = assert.async();
		this.oVBox = new VBox({
			items : [
				new List({
					busyIndicatorDelay : 0,
					busy : true
				}),
				new List({
					busyIndicatorDelay : 0,
					busy : true
				})
			],
			busyIndicatorDelay : 0,
			busy : true
		}).placeAt("target3");

		await nextUIUpdate();

		setTimeout(function() {
			var $Animation = jQuery(".sapUiLocalBusyIndicatorAnimation");

			assert.equal($Animation.length, 3, "3 animations should be in DOM");
			assert.ok(!jQuery($Animation.get(0)).is(":visible"), "List1's animation is hidden");
			assert.ok(!jQuery($Animation.get(1)).is(":visible"), "List2's animation is hidden");
			assert.ok(jQuery($Animation.get(2)).is(":visible"), "VBox's animation is visible");

			this.oVBox.destroy();
			done();
		}.bind(this), 50);
	});

	QUnit.module("setBusy with rendering delegate", {
		beforeEach: function() {
			this.oButton = new Button({
				text: "Rendering Delegate"
			});

			this.oButton.setBusyIndicatorDelay(0);

			this.testClickEventOn = function (oControl, assert) {
				var oDomRef = oControl.getDomRef(),
					fnEventListener = sinon.spy();

				if (oDomRef) {
					oDomRef.addEventListener("click", fnEventListener);
					qutils.triggerEvent("click", oDomRef);
					assert.equal(fnEventListener.callCount, 1, "click event can be triggered correctly");
					oDomRef.removeEventListener("click", fnEventListener);
				} else {
					assert.ok(false, "The given control doesn't have DOM reference");
				}
			};
		},
		afterEach: function() {
			this.oButton.destroy();
		}
	});

	QUnit.test("on control which is migrated with the new renderer mechanism", async function(assert) {
		// add one event delegate which set the busy state before the control is rerendered
		this.oButton.addEventDelegate({
			onBeforeRendering: function() {
				this.setBusy(true);
			}
		}, this.oButton);

		this.oButton.placeAt("target1");
		await nextUIUpdate();
		this.oButton.setBusy(false);
		// after reset the busy state, the control should be able to react to click event
		this.testClickEventOn(this.oButton, assert);

		// rerender the control to activate the busy state (problem only occurs with 2nd. rendering)
		this.oButton.invalidate();
		await nextUIUpdate();
		this.oButton.setBusy(false);
		// after reset the busy state, the control should be able to react to click event
		this.testClickEventOn(this.oButton, assert);
	});


	QUnit.module("Legacy", {
		beforeEach: function(assert) {
			var Log = sap.ui.require("sap/base/Log");
			assert.ok(Log, "Log module should be available");
			this.oLogSpy = sinon.spy(Log, "error");
		},
		afterEach: function() {
			this.oLogSpy.restore();
		}
	});

	/**
	 * @deprecated Since 1.15
	 */
	QUnit.test("LocalBusyIndicatorSupport", function(assert) {

		assert.equal(typeof Control.prototype.setDelay, "undefined", "Control#setDelay should not be available by default");

		// apply deprecated LocalBusyIndicatorSupport to Control prototype to make "setDelay" method available
		LocalBusyIndicatorSupport.apply(Control.prototype);

		assert.equal(Control.prototype.setDelay, Control.prototype.setBusyIndicatorDelay,
			"Control#setDelay should be available and a reference to #setBusyIndicatorDelay after applying legacy support");

		assert.ok(this.oLogSpy.notCalled, "No error should be logged");

	});

	/**
	 * @deprecated Since 1.15
	 */
	QUnit.test("LocalBusyIndicatorSupport (error handling)", function(assert) {

		// apply deprecated LocalBusyIndicatorSupport to a specific control
		LocalBusyIndicatorSupport.apply(Button.prototype);

		// LocalBusyIndicatorSupport should log an error when applying on a specific control
		sinon.assert.calledWithExactly(this.oLogSpy, "Only controls can use the LocalBusyIndicator", Button.prototype);

	});

});
