/*global QUnit, sinon */
sap.ui.define([
	"sap/ui/core/Element",
	"sap/ui/core/TooltipBase",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/layout/HorizontalLayout",
	"sap/m/Button",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/events/KeyCodes"
], function (Element, TooltipBase, QUnitUtils, HorizontalLayout, Button, createAndAppendDiv, nextUIUpdate, KeyCodes) {
	"use strict";

	createAndAppendDiv("target");

	/**
	 * This function checks whether the given tooltip is a standard tooltip or
	 * a MyToolTip
	 * @param  {object | string} vTooltip either a string with text or an instanceof
	 *                   of the MyToolTip
	 * @return {boolean} <code>true</code> if the tooltip is just a string. <false>
	 *                                     if the tooltip is a MyToolTip
	 */
	var isStandardTooltip = function(vTooltip, assert) {
		return (typeof vTooltip === "string" && vTooltip.trim() !== "");
	};

	/**
	 * Checks if the given tooltip is in DOM and visible
	 *
	 * @param  {sap.ui.core.TooltipBase} oTooltip is the bastard to be checked
	 * @return {boolean} true if the tooltip is visible
	 */
	var isTooltipVisible = function(oTooltip, assert) {
		var $Tooltip = oTooltip.$();
		assert.equal($Tooltip.length, 1, "Tooltip " + oTooltip + " in DOM");
		assert.ok($Tooltip.is(":visible"), oTooltip.getId() + " is visible");
	};

	/**
	 * Checks if the given tooltip is in DOM and visible
	 *
	 * @param  {sap.ui.core.TooltipBase} oTooltip is the bastard to be checked
	 * @return {boolean} true if the tooltip is visible
	 */
	var isTooltipNotVisible = function(oTooltip, assert) {
		var $Tooltip = oTooltip.$();
		assert.notOk($Tooltip.is(":visible"), oTooltip.getId() + " is NOT visible");
	};

	/**
	 * Opens the tooltip of a given Control
	 *
	 * @param {Control} oControl which has a tooltip that should be opened
	 * @param {object} mParams with the necessary spies
	 * @param {sinon.spy} mParams.mouseOver is the mouseover spy
	 * @param {sinon.spy} mParams.mouseOut is the mouseout spy
	 * @param {sinon.spy} mParams.openPopup is the openPopup spy
	 *
	 * @return {Promise} that is resolved when the tooltip has been opened
	 */
	var openTooltip = function(oControl, mParams, assert) {
		return new Promise(function(resolve, reject) {
			if (mParams.keyboard) {
				QUnitUtils.triggerKeydown(oControl.$(), KeyCodes.I, /*Shift*/ false, /*Alt*/ false, /*Ctrl*/ true);
				mParams.keydown.openedWithKey = true;
			} else {
				QUnitUtils.triggerMouseEvent(oControl.$(), "mouseover");
			}

			setTimeout(function() {
				if (mParams.keyboard) {
					assert.ok(mParams.keydown.calledOnce, "'onkeydown' was called for " + oControl.getId());
				} else {
					assert.ok(mParams.mouseOver.calledOnce, "'onmouseover' was called for " + oControl.getId());
					assert.notOk(mParams.mouseOut.callCount > 0, "'onmouseout' wasn't called for " + oControl.getId());
				}

				assert.ok(mParams.openPopup.calledOnce, "'openPopup' was called for " + oControl.getId());

				isTooltipVisible(oControl.getTooltip(), assert);

				resolve();
			}, oControl.getTooltip().getOpenDelay() + 300);
		});
	};

	/**
	 * Closes the tooltip of a given Control
	 *
	 * @param {Control} oControl which has a tooltip that should be opened
	 * @param {object} mParams with the necessary spies
	 * @param {sinon.spy} mParams.mouseOver is the mouseover spy
	 * @param {sinon.spy} mParams.mouseOut is the mouseout spy
	 * @param {sinon.spy} mParams.closePopup is the openPopup spy
	 *
	 * @return {Promise} that is resolved when the tooltip has been closed
	 */
	var closeTooltip = function(oControl, mParams, assert) {
		return new Promise(function(resolve, reject) {
			if (mParams.keyboard) {
				QUnitUtils.triggerKeydown(oControl.$(), KeyCodes.ESCAPE);
			} else {
				QUnitUtils.triggerMouseEvent(oControl.$(), "mouseout");
			}

			setTimeout(function() {
				if (mParams.keyboard) {
					if (mParams.keydown.openedWithKey) {
						assert.equal(mParams.keydown.callCount, 2, "'onkeydown' was called with ESC key event");
						mParams.keydown.openedWithKey = null;
					} else {
						assert.ok(mParams.keydown.calledOnce, "'onkeydown' was called with ESC key event");
					}
				} else {
					assert.ok(mParams.mouseOver.calledOnce, "'onmouseover' wasn't called again for tooltip");
					assert.ok(mParams.mouseOut.calledOnce, "'onmouseout' was called for tooltip");
				}

				assert.ok(mParams.closePopup.calledOnce, "'closePopup' was called for tooltip");
				isTooltipNotVisible(oControl.getTooltip(), assert);

				resolve();
			}, oControl.getTooltip().getCloseDelay() + 300);
		});
	};

	/*
	 * a simple Tooltip control, inheriting from TooltipBase
	 */
	var MyToolTip = TooltipBase.extend("MyToolTip", {
		metadata: {
			properties: {
				title: "string",
				text: "string"
			}
		},
		renderer: {
			apiVersion: 2,
			render: function (rm, ctrl) {
				rm.openStart("div", ctrl)
					.style("background", "white")
					.style("border", "1px solid black")
					.style("padding", "0.5rem")
					.openEnd();
				if (ctrl.getTitle()) {
					rm.openStart("div")
						.style("font-weight", "bold")
						.style("border-bottom", "1px solid gray")
						.style("margin-bottom", "1rem")
						.attr("role", "tooltip")
						.openEnd();
					rm.text(ctrl.getTitle());
					rm.close("div");
				}
				rm.openStart("div").openEnd();
				rm.text(ctrl.getText());
				rm.close("div");
				rm.close("div");
			}
		}
	});

	QUnit.module("Basics", {
		beforeEach: function() {
			this.oButton1 = new Button({
				icon: "sap-icon://syringe",
				text: "Rich Fuel Injection",
				tooltip: new MyToolTip({
					title: "Title",
					text: "Text"
				})
			});
			this.oTooltip1 = this.oButton1.getTooltip();

			this.oButton2 = new Button({
				icon: "sap-icon://syringe",
				text: "Rich Fuel Injection",
				tooltip: new MyToolTip({
					title: "Title",
					text: "Text"
				})
			});
			this.oTooltip2 = this.oButton2.getTooltip();

			this.oButton3 = new Button({
				icon: "sap-icon://syringe",
				text: "Simple Fuel Injection",
				tooltip: "Simple Tooltip"
			});
			this.oTooltip3 = this.oButton3.getTooltip();

			this.oButton4 = new Button({
				icon: "sap-icon://syringe",
				text: "No Fuel Injection"
			});

			this.oLayout = new HorizontalLayout({
				tooltip: new MyToolTip({
					title: "Title",
					text: "Text"
				}),

				content: [
					this.oButton1,
					this.oButton2,
					this.oButton3,
					this.oButton4
				]
			}).placeAt("target");
			this.oTooltipLayout = this.oLayout.getTooltip();

			this.oSpyMouseOver1 = sinon.spy(this.oTooltip1, "onmouseover");
			this.oSpyMouseOut1 = sinon.spy(this.oTooltip1, "onmouseout");
			this.oSpyOpenPopup1 = sinon.spy(this.oTooltip1, "openPopup");
			this.oSpyClosePopup1 = sinon.spy(this.oTooltip1, "closePopup");

			return nextUIUpdate();
		},

		afterEach: function() {
			this.oLayout.destroy();

			this.oSpyMouseOver1.restore();
			this.oSpyMouseOut1.restore();
			this.oSpyOpenPopup1.restore();
			this.oSpyClosePopup1.restore();
		}
	});

	QUnit.test("Check Type of Set Tooltip", function(assert) {
		assert.equal(isStandardTooltip(this.oTooltip1, assert), false, "Button1 has a MyToolTip");
		assert.equal(isStandardTooltip(this.oTooltip2, assert), false, "Button2 has a MyToolTip");
		assert.equal(isStandardTooltip(this.oTooltip3, assert), true, "Button3 has a standard tooltip");
	});

	QUnit.test("Durations And Delays", function(assert) {
		assert.equal(this.oTooltip1.getOpenDuration(), 200, "Tooltip1 has default open duration of 200");
		assert.equal(this.oTooltip1.getCloseDuration(), 200, "Tooltip1 has default close duration of 200");

		assert.equal(this.oTooltip1.getOpenDelay(), 500, "Tooltip1 has default open delay of 500");
		assert.equal(this.oTooltip1.getCloseDelay(), 100, "Tooltip1 has default close delay of 100");
	});

	QUnit.test("Remove HTML-title from DOM-element", function(assert) {
		var done = assert.async();

		// needed to wait for rendering the icons
		setTimeout(function() {
			var $DomRef = this.oButton1.$();
			assert.ok(!$DomRef.attr("title"), "There should be no title attribute by default");

			$DomRef.attr("title", "Remove me");
			assert.ok($DomRef.attr("title"), "Title attribute added");

			openTooltip(this.oButton1, {
					mouseOver: this.oSpyMouseOver1,
					mouseOut: this.oSpyMouseOut1,
					openPopup: this.oSpyOpenPopup1
				}, assert)
				.then(function() {
					assert.notOk($DomRef.attr("title"), "Title attribute should have been removed");

					closeTooltip(this.oButton1, {
							mouseOver: this.oSpyMouseOver1,
							mouseOut: this.oSpyMouseOut1,
							closePopup: this.oSpyClosePopup1
						}, assert)
						.then(function() {
							assert.equal($DomRef.attr("title"), "Remove me", "Title should have been restored");

							done();
						});
				}.bind(this));
		}.bind(this), 150);
	});

	QUnit.module("Open and Close", {
		beforeEach: function() {
			this.oButton1 = new Button({
				id: "button1MyToolTip",
				icon: "sap-icon://syringe",
				text: "Rich Fuel Injection",
				tooltip: new MyToolTip({
					title: "Title",
					text: "Text",
					openDuration: 0,
					closeDuration: 0,
					openDelay: 100,
					closeDelay: 50
				})
			});
			this.oTooltip1 = this.oButton1.getTooltip();

			this.oButton2 = new Button({
				id: "button2MyToolTip",
				icon: "sap-icon://syringe",
				text: "Rich Fuel Injection",
				tooltip: new MyToolTip({
					title: "Title",
					text: "Text",
					openDuration: 0,
					closeDuration: 0,
					openDelay: 100,
					closeDelay: 50
				})
			});
			this.oTooltip2 = this.oButton2.getTooltip();

			this.oButton3 = new Button({
				id: "buttonSimpleTooltip",
				icon: "sap-icon://syringe",
				text: "Simple Fuel Injection",
				tooltip: "Simple Tooltip"
			});
			this.oTooltip3 = this.oButton3.getTooltip();

			this.oButton4 = new Button({
				id: "buttonNoTooltip",
				icon: "sap-icon://syringe",
				text: "Simple No Fuel Injection"
			});

			this.oLayout = new HorizontalLayout({
				tooltip: new MyToolTip({
					title: "Title",
					text: "Text",
					openDuration: 0,
					closeDuration: 0,
					openDelay: 100,
					closeDelay: 50
				}),

				content: [
					this.oButton1,
					this.oButton2,
					this.oButton3,
					this.oButton4
				]
			}).placeAt("target");
			this.oTooltipLayout = this.oLayout.getTooltip();

			this.oSpyMouseOver1 = sinon.spy(this.oTooltip1, "onmouseover");
			this.oSpyMouseOut1 = sinon.spy(this.oTooltip1, "onmouseout");
			this.oSpyOpenPopup1 = sinon.spy(this.oTooltip1, "openPopup");
			this.oSpyClosePopup1 = sinon.spy(this.oTooltip1, "closePopup");
			this.oSpyKeyDown1 = sinon.spy(this.oTooltip1, "onkeydown");

			this.oSpyMouseOver2 = sinon.spy(this.oTooltip2, "onmouseover");
			this.oSpyMouseOut2 = sinon.spy(this.oTooltip2, "onmouseout");
			this.oSpyOpenPopup2 = sinon.spy(this.oTooltip2, "openPopup");
			this.oSpyClosePopup2 = sinon.spy(this.oTooltip2, "closePopup");

			this.oSpyMouseOverLayout = sinon.spy(this.oTooltipLayout, "onmouseover");
			this.oSpyMouseOutLayout = sinon.spy(this.oTooltipLayout, "onmouseout");
			this.oSpyOpenPopupLayout = sinon.spy(this.oTooltipLayout, "openPopup");
			this.oSpyClosePopupLayout = sinon.spy(this.oTooltipLayout, "closePopup");

			return nextUIUpdate();
		},

		afterEach: function() {
			this.oButton1.destroy();
			this.oButton2.destroy();
			this.oButton3.destroy();
			this.oButton4.destroy();
			this.oLayout.destroy();

			this.oSpyMouseOver1.restore();
			this.oSpyMouseOut1.restore();
			this.oSpyOpenPopup1.restore();
			this.oSpyClosePopup1.restore();
			this.oSpyKeyDown1.restore();

			this.oSpyMouseOver2.restore();
			this.oSpyMouseOut2.restore();
			this.oSpyOpenPopup2.restore();
			this.oSpyClosePopup2.restore();

			this.oSpyMouseOverLayout.restore();
			this.oSpyMouseOutLayout.restore();
			this.oSpyOpenPopupLayout.restore();
			this.oSpyClosePopupLayout.restore();
		}
	});

	QUnit.test("Open And Close Same Tooltip", function(assert) {
		var done = assert.async();

		// needed to wait for rendering the icons
		setTimeout(function() {
			openTooltip(this.oButton1, {
					mouseOver: this.oSpyMouseOver1,
					mouseOut: this.oSpyMouseOut1,
					openPopup: this.oSpyOpenPopup1
				}, assert)
				.then(function() {
					closeTooltip(this.oButton1, {
							mouseOver: this.oSpyMouseOver1,
							mouseOut: this.oSpyMouseOut1,
							closePopup: this.oSpyClosePopup1
						}, assert)
						.then(function() {
							done();
						});
				}.bind(this));
		}.bind(this), 150);
	});

	QUnit.test("Renderer is only called once when opening a tooltip", function(assert) {
		var fnAfterRenderingSpy = sinon.spy();
		this.oTooltip1.addDelegate({
			onAfterRendering: fnAfterRenderingSpy
		});

		return openTooltip(this.oButton1, {
			mouseOver: this.oSpyMouseOver1,
			mouseOut: this.oSpyMouseOut1,
			openPopup: this.oSpyOpenPopup1
		}, assert)
			.then(function() {
				assert.equal(fnAfterRenderingSpy.callCount, 1, "Tooltip is only rendered once");
			})
			.then(function() {
				return closeTooltip(this.oButton1, {
					mouseOver: this.oSpyMouseOver1,
					mouseOut: this.oSpyMouseOut1,
					closePopup: this.oSpyClosePopup1
				}, assert);
			}.bind(this));
	});

	QUnit.test("Mouseout And Mouseover so The Tooltip Remains Open", function(assert) {
		var done = assert.async();

		// needed to wait for rendering the icons
		setTimeout(function() {
			openTooltip(this.oButton1, {
					mouseOver: this.oSpyMouseOver1,
					mouseOut: this.oSpyMouseOut1,
					openPopup: this.oSpyOpenPopup1
				}, assert)
				.then(function() {
					QUnitUtils.triggerMouseEvent(this.oButton1.$(), "mouseout");

					setTimeout(function() {
						QUnitUtils.triggerMouseEvent(this.oButton1.$(), "mouseover");

						setTimeout(function() {
							assert.equal(this.oSpyMouseOver1.callCount, 2, "'onmouseover' called twice for tooltip1");
							assert.ok(this.oSpyOpenPopup1.calledOnce, "'openPopup' was called only once for tooltip1");
							assert.ok(!this.oSpyClosePopup1.calledOnce, "'closePopup' wasn't called for tooltip1");

							isTooltipVisible(this.oButton1.getTooltip(), assert);

							done();
						}.bind(this), 40);
					}.bind(this), 40);
				}.bind(this));
		}.bind(this), 150);
	});

	QUnit.test("Mouseover Between Tooltip1 And Tooltip2", function(assert) {
		var done = assert.async();

		// needed to wait for rendering the icons
		setTimeout(function() {
			openTooltip(this.oButton1, {
					mouseOver: this.oSpyMouseOver1,
					mouseOut: this.oSpyMouseOut1,
					openPopup: this.oSpyOpenPopup1
				}, assert)
				.then(function() {
					QUnitUtils.triggerMouseEvent(this.oButton1.$(), "mouseout");

					openTooltip(this.oButton2, {
							mouseOver: this.oSpyMouseOver2,
							mouseOut: this.oSpyMouseOut2,
							openPopup: this.oSpyOpenPopup2
						}, assert)
						.then(function() {
							assert.ok(this.oSpyClosePopup1.calledOnce, "'closePopup' called for tooltip1");

							isTooltipNotVisible(this.oTooltip1, assert);
							isTooltipVisible(this.oTooltip2, assert);

							// Move back to button1
							QUnitUtils.triggerMouseEvent(this.oButton2.$(), "mouseout");
							QUnitUtils.triggerMouseEvent(this.oButton1.$(), "mouseover");

							setTimeout(function() {
								assert.equal(this.oSpyMouseOver1.callCount, 2, "'onmouseover' was called twice for tooltip1");
								assert.equal(this.oSpyOpenPopup1.callCount, 2, "'openPopup' was called for the second time for tooltip1");

								assert.equal(this.oSpyClosePopup2.callCount, 1, "'closePopup' was called for tooltip2");

								isTooltipVisible(this.oTooltip1, assert);
								isTooltipNotVisible(this.oTooltip2, assert);

								done();
							}.bind(this), 150);
						}.bind(this));
				}.bind(this));
		}.bind(this), 150);
	});

	QUnit.test("Hover Icon of Button withouth Tooltip -> parent should be opened", function(assert) {
		var done = assert.async();

		// needed to wait for rendering the icons
		setTimeout(function() {
			var oIcon = Element.getElementById(this.oButton2.getId() + "-img");
			var oSpyIconMoveOver = sinon.spy(oIcon, "onmouseover");

			QUnitUtils.triggerMouseEvent(this.oButton2.$(), "mouseover");
			QUnitUtils.triggerMouseEvent(this.oButton2.$(), "mouseout");
			QUnitUtils.triggerMouseEvent(this.oButton2.$("img"), "mouseover");

			setTimeout(function() {
				isTooltipVisible(this.oTooltip2, assert);

				assert.equal(oSpyIconMoveOver.callCount, 1, "'mouseover' of Icon called");
				assert.ok(oSpyIconMoveOver.calledBefore(this.oSpyMouseOver2), "'mouseover' of Icon was called first");

				oSpyIconMoveOver.restore();
				done();
			}.bind(this), 150);
		}.bind(this), 100);
	});

	QUnit.test("Hover Button (without Tooltip) of Layout -> parent shouldn't be opened", function(assert) {
		var done = assert.async();

		// needed to wait for rendering the icons
		setTimeout(function() {
			QUnitUtils.triggerMouseEvent(this.oLayout.$(), "mouseover");
			QUnitUtils.triggerMouseEvent(this.oLayout.$(), "mouseout");
			QUnitUtils.triggerMouseEvent(this.oButton4.$(), "mouseover");

			setTimeout(function() {
				isTooltipVisible(this.oTooltipLayout, assert);

				done();
			}.bind(this), 150);
		}.bind(this), 100);
	});

	QUnit.test("Hover Icon, Parent should be open, move to Tooltip and hover Icon again", function(assert) {
		var done = assert.async();

		// needed to wait for rendering the icons
		setTimeout(function() {
			// hover icon (child) of button to trigger opening the tooltip
			QUnitUtils.triggerMouseEvent(this.oButton2.$(), "mouseover");
			QUnitUtils.triggerMouseEvent(this.oButton2.$(), "mouseout");
			QUnitUtils.triggerMouseEvent(this.oButton2.$("img"), "mouseover");

			setTimeout(function() {
				isTooltipVisible(this.oTooltip2, assert);

				// move from icon to tooltip -> it should remain open
				QUnitUtils.triggerMouseEvent(this.oButton2.$("img"), "mouseout");
				QUnitUtils.triggerMouseEvent(this.oButton2.$(), "mouseover");
				QUnitUtils.triggerMouseEvent(this.oButton2.$(), "mouseout");

				QUnitUtils.triggerMouseEvent(this.oTooltip2.$(), "mouseover");

				setTimeout(function() {
					isTooltipVisible(this.oTooltip2, assert);

					// move back to icon -> tooltip should remain open
					QUnitUtils.triggerMouseEvent(this.oTooltip2.$(), "mouseout");
					QUnitUtils.triggerMouseEvent(this.oButton2.$(), "mouseover");
					QUnitUtils.triggerMouseEvent(this.oButton2.$(), "mouseout");
					QUnitUtils.triggerMouseEvent(this.oButton2.$("img"), "mouseover");

					setTimeout(function() {
						isTooltipVisible(this.oTooltip2, assert);

						done();
					}.bind(this), 150);
				}.bind(this), 150);
			}.bind(this), 150);
		}.bind(this), 100);
	});

	QUnit.test("Hover Icon of Tooltip1 and move to Button2", function(assert) {
		var done = assert.async();

		var fnTT1Closed = function() {
			this.oTooltip1.detachClosed(fnTT1Closed, this);

			// tests for button2 not needed because they are done within 'openTooltip'

			// tooltip1 should have been closed
			assert.equal(this.oSpyOpenPopup1.callCount, 1, "'openPopup' wasn't called again for tooltip1");
			assert.equal(this.oSpyMouseOut1.callCount, 3, "'onmouseout' was called three times for tooltip1");
			assert.equal(this.oSpyClosePopup1.callCount, 1, "'closePopup' was called for tooltip1");

			isTooltipNotVisible(this.oTooltip1, assert);
		}.bind(this);

		var fnTT2Opened = function() {
			assert.equal(this.oSpyMouseOut2.callCount, 0, "'onmouseout' wasn't called once for tooltip2");
			assert.equal(this.oSpyClosePopup2.callCount, 0, "'closePopup' wasn't called for tooltip2");

			isTooltipVisible(this.oTooltip2, assert);

			assert.equal(this.oSpyMouseOver1.callCount, 3, "'onmouseover' was called 3 times for tooltip1");
			assert.equal(this.oSpyMouseOut1.callCount, 3, "'onmouseout' was called 3 times for tooltip1");
			assert.equal(this.oSpyOpenPopup1.callCount, 1, "'openPopup' wasn't called again for tooltip1");
			assert.equal(this.oSpyClosePopup1.callCount, 1, "'closePopup' was called for tooltip1");

			isTooltipNotVisible(this.oTooltip1, assert);

			// move mouse with open tooltip2 from button2 back to the icon of button1
			QUnitUtils.triggerMouseEvent(this.oButton2.$(), "mouseout");
			QUnitUtils.triggerMouseEvent(this.oButton1.$(), "mouseover");
			QUnitUtils.triggerMouseEvent(this.oButton1.$(), "mouseout");
			QUnitUtils.triggerMouseEvent(this.oButton1.$("img"), "mouseover");

			setTimeout(function() {
				assert.equal(this.oSpyMouseOut2.callCount, 1, "'onmouseout' was called once for tooltip2");
				assert.equal(this.oSpyClosePopup2.callCount, 1, "'closePopup' was called for tooltip2");

				isTooltipNotVisible(this.oTooltip2, assert);

				assert.equal(this.oSpyMouseOver1.callCount, 5, "'onmouseover' was called 5 times for tooltip1");
				assert.equal(this.oSpyMouseOut1.callCount, 4, "'onmouseout' was called 4 times for tooltip1");
				assert.equal(this.oSpyOpenPopup1.callCount, 2, "'openPopup' was for the second time for tooltip1");
				assert.equal(this.oSpyClosePopup1.callCount, 1, "'closePopup' wasn't called during open for tooltip1");

				isTooltipVisible(this.oTooltip1, assert);

				done();
			}.bind(this), 150);
		}.bind(this);

		// needed to wait for rendering the icons
		setTimeout(function() {
			// move mouse into button then straight over the icon
			QUnitUtils.triggerMouseEvent(this.oButton1.$(), "mouseover");
			QUnitUtils.triggerMouseEvent(this.oButton1.$(), "mouseout");
			QUnitUtils.triggerMouseEvent(this.oButton1.$("img"), "mouseover");

			setTimeout(function() {
				assert.equal(this.oSpyMouseOver1.callCount, 2, "'onmouseover' was called twice for tooltip1");
				assert.equal(this.oSpyMouseOut1.callCount, 1, "'onmouseout' was called for tooltip1");
				assert.equal(this.oSpyOpenPopup1.callCount, 1, "'openPopup' was called once for tooltip1");

				isTooltipVisible(this.oTooltip1, assert);

				// move mouse from icon of button1, then to button1 and then to button2
				QUnitUtils.triggerMouseEvent(this.oButton1.$("img"), "mouseout");
				QUnitUtils.triggerMouseEvent(this.oButton1.$(), "mouseover");
				QUnitUtils.triggerMouseEvent(this.oButton1.$(), "mouseout");

				setTimeout(function() {
					openTooltip(this.oButton2, {
							mouseOver: this.oSpyMouseOver2,
							mouseOut: this.oSpyMouseOut2,
							openPopup: this.oSpyOpenPopup2
						}, assert)
						.then(fnTT2Opened.bind(this));

				}.bind(this), 150);
			}.bind(this), 150);
		}.bind(this), 250);

		this.oTooltip1.attachClosed(fnTT1Closed, this);
	});

	QUnit.test("Open Tooltip1 And Move Mouse Between Button1 And Tooltip1", function(assert) {
		var done = assert.async();

		// needed to wait for rendering the icons
		setTimeout(function() {
			openTooltip(this.oButton1, {
					mouseOver: this.oSpyMouseOver1,
					mouseOut: this.oSpyMouseOut1,
					openPopup: this.oSpyOpenPopup1
				}, assert)
				.then(function() {
					// move mouse from button into tooltip
					QUnitUtils.triggerMouseEvent(this.oButton1.$(), "mouseout");
					QUnitUtils.triggerMouseEvent(this.oTooltip1.$(), "mouseover");

					setTimeout(function() {
						assert.ok(this.oSpyMouseOut1.calledOnce, "'mouseout' called for tooltip1");
						assert.equal(this.oSpyMouseOver1.callCount, 2, "'mouseout' called for the second time for tooltip1");
						assert.ok(!this.oSpyClosePopup1.calledOnce, "'closePopup' wasn't called for tooltip1");

						// move mouse back to button
						QUnitUtils.triggerMouseEvent(this.oButton1.$(), "mouseout");
						QUnitUtils.triggerMouseEvent(this.oTooltip1.$(), "mouseover");

						setTimeout(function() {
							assert.equal(this.oSpyMouseOut1.callCount, 2, "'mouseout' called for the second time for tooltip1");
							assert.equal(this.oSpyMouseOver1.callCount, 3, "'mouseout' called for the third time for tooltip1");
							assert.ok(!this.oSpyClosePopup1.calledOnce, "'closePopup' still wasn't called for tooltip1");

							done();
						}.bind(this), 150);
					}.bind(this), 150);
				}.bind(this), 150);
		}.bind(this), 150);
	});

	QUnit.test("Open/Close Tooltip1 Via Keyboad-Support", function(assert) {
		var done = assert.async();

		// needed to wait for rendering the icons
		setTimeout(function() {
			this.oButton1.focus();

			setTimeout(function() {
				openTooltip(this.oButton1, {
						mouseOver: this.oSpyMouseOver1,
						mouseOut: this.oSpyMouseOut1,
						openPopup: this.oSpyOpenPopup1,
						keyboard: true,
						keydown: this.oSpyKeyDown1
					}, assert)
					.then(function() {
						closeTooltip(this.oButton1, {
								mouseOver: this.oSpyMouseOver1,
								mouseOut: this.oSpyMouseOut1,
								closePopup: this.oSpyClosePopup1,
								keyboard: true,
								keydown: this.oSpyKeyDown1
							}, assert)
							.then(function() {
								done();
							});
					}.bind(this));
			}.bind(this), 150);
		}.bind(this), 150);
	});

});