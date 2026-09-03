/* global QUnit */

sap.ui.define([
	"sap/ui/dt/ScrollbarSynchronizer"
],
function(
	ScrollbarSynchronizer
) {
	"use strict";

	QUnit.module("Given three elements with vertical and horizontal scrollbars...", {
		beforeEach() {
			const oContent = document.getElementById("qunit-fixture");

			const fnCreatePanelWithBiggerSubPanel = function(sId, sColor) {
				const oPanel = document.createElement("div");
				oPanel.id = sId;
				Object.assign(oPanel.style, {
					maxWidth: "100px",
					maxHeight: "100px",
					overflow: "auto",
					display: "inline-block"
				});
				oContent.appendChild(oPanel);

				const subPanel = document.createElement("div");
				subPanel.id = `${sId}-sub`;
				Object.assign(subPanel.style, {
					width: "200px",
					height: "200px",
					overflow: "auto",
					background: sColor
				});
				oPanel.appendChild(subPanel);

				return oPanel;
			};

			this.oPanel1 = fnCreatePanelWithBiggerSubPanel("panel1", "#555");
			this.oPanel2 = fnCreatePanelWithBiggerSubPanel("panel2", "#abc");
			this.oPanel3 = fnCreatePanelWithBiggerSubPanel("panel3", "#def");

			this.oScrollbarSynchronizer = new ScrollbarSynchronizer();
		},
		afterEach() {
			this.oPanel1.remove();
			this.oPanel2.remove();
			this.oPanel3.remove();

			this.oScrollbarSynchronizer.destroy();
		}
	}, function() {
		QUnit.test("when scrollbar syncronizer is destroyed", function(assert) {
			const fnDone = assert.async();
			this.oScrollbarSynchronizer.attachEventOnce("destroyed", function() {
				assert.ok(true, "then the destroyed event is thrown by scrollbar synchroniser");
				assert.notOk(this.oScrollbarSynchronizer.isSyncing(), "then after destroy the scrollbarSynchronizer should not be in 'syncing' state anymore");
				fnDone();
			}.bind(this));
			this.oScrollbarSynchronizer.addTarget(this.oPanel1);
			assert.ok(this.oScrollbarSynchronizer.isSyncing(), "then before destroy and after addTarget the scrollbarSynchronizer should be in 'syncing' state");
			this.oScrollbarSynchronizer.destroy();
		});

		QUnit.test("when panel1 and panel2 are both added as targets to the ScrollbarSynchronizer", function(assert) {
			const fnDone = assert.async();

			this.oScrollbarSynchronizer.addTarget(this.oPanel1);
			this.oScrollbarSynchronizer.addTarget(this.oPanel2);

			assert.deepEqual(this.oScrollbarSynchronizer.getTargets(), [this.oPanel1, this.oPanel2], "then the function getTargets returns both elements");

			this.oScrollbarSynchronizer.attachEventOnce("synced", function() {
				assert.equal(this.oPanel2.scrollTop, 20, "then vertical scrolling on Panel1 is reflected on Panel2");
				assert.equal(this.oPanel2.scrollLeft, 30, "then horizontal scrolling on Panel1 is reflected on Panel2");
				this.oScrollbarSynchronizer.attachEventOnce("synced", function() {
					assert.equal(this.oPanel1.scrollTop, 50, "then vertical scrolling on Panel2 is reflected on Panel1");
					assert.equal(this.oPanel1.scrollLeft, 70, "then horizontal scrolling on Panel2 is reflected on Panel1");
					fnDone();
				}.bind(this));
				this.oPanel2.scrollTop = 50;
				this.oPanel2.scrollLeft = 70;
			}.bind(this));
			this.oPanel1.scrollTop = 20;
			this.oPanel1.scrollLeft = 30;
		});

		QUnit.test("when panel2 is removed from the targets", function(assert) {
			const fnDone = assert.async();
			this.oScrollbarSynchronizer.addTarget(this.oPanel1);
			this.oScrollbarSynchronizer.addTarget(this.oPanel2);

			this.oScrollbarSynchronizer.attachEventOnce("synced", function() {
				this.oScrollbarSynchronizer.removeTarget(this.oPanel2);

				this.oScrollbarSynchronizer.attachEventOnce("synced", function() {
					assert.equal(this.oPanel2.scrollTop, 20, "then further vertical scrolling on Panel1 is not reflected on Panel2");
					assert.equal(this.oPanel2.scrollLeft, 30, "then further horizontal scrolling on Panel1 is not reflected on Panel2");
					this.oPanel2.scrollTop = 80;
					this.oPanel2.scrollLeft = 90;
					window.requestAnimationFrame(function() {
						assert.equal(this.oPanel1.scrollTop, 40, "then vertical scrolling on Panel2 is not reflected on Panel1");
						assert.equal(this.oPanel1.scrollLeft, 50, "then horizontal scrolling on Panel2 is not reflected on Panel1");
						fnDone();
					}.bind(this));
				}.bind(this));
				this.oPanel1.scrollTop = 40;
				this.oPanel1.scrollLeft = 50;
			}.bind(this));
			this.oPanel1.scrollTop = 20;
			this.oPanel1.scrollLeft = 30;
		});

		QUnit.test("when panel1 and panel2 are both added as targets, then we set targets to panel1 and panel3", function(assert) {
			const fnDone = assert.async();
			this.oScrollbarSynchronizer.addTarget(this.oPanel1);
			this.oScrollbarSynchronizer.addTarget(this.oPanel2);

			this.oScrollbarSynchronizer.attachEventOnce("synced", function() {
				this.oScrollbarSynchronizer.setTargets([this.oPanel1, this.oPanel3]);

				this.oScrollbarSynchronizer.attachEventOnce("synced", function() {
					assert.equal(this.oPanel3.scrollTop, 40, "then vertical scrolling on Panel1 is reflected on Panel3");
					assert.equal(this.oPanel3.scrollLeft, 50, "then horizontal scrolling on Panel1 is reflected on Panel3");
					assert.equal(this.oPanel2.scrollTop, 20, "then vertical scrolling on Panel1 is no longer reflected on Panel2");
					assert.equal(this.oPanel2.scrollLeft, 30, "then horizontal scrolling on Panel1 is no longer reflected on Panel2");
					fnDone();
				}.bind(this));
				this.oPanel1.scrollTop = 40;
				this.oPanel1.scrollLeft = 50;
			}.bind(this));
			this.oPanel1.scrollTop = 20;
			this.oPanel1.scrollLeft = 30;
		});

		QUnit.test("when panel1 is already scrolled when it is added as a target", function(assert) {
			const fnDone = assert.async();

			this.oScrollbarSynchronizer.attachEventOnce("synced", function() {
				assert.equal(this.oPanel2.scrollTop, 20, "then vertical scrolling on Panel1 is reflected on Panel2");
				assert.equal(this.oPanel2.scrollLeft, 30, "then horizontal scrolling on Panel1 is reflected on Panel2");
				fnDone();
			}.bind(this));

			this.oPanel1.scrollTop = 20;
			this.oPanel1.scrollLeft = 30;
			this.oScrollbarSynchronizer.addTarget(this.oPanel1);
			this.oScrollbarSynchronizer.addTarget(this.oPanel2);
		});

		QUnit.test("when panel1 is a target, gets scrolled and then panel2 is added as a target", function(assert) {
			const fnDone = assert.async();

			this.oScrollbarSynchronizer.attachEventOnce("synced", function() {
				assert.equal(this.oPanel2.scrollTop, 20, "then vertical scrolling on Panel1 is reflected on Panel2");
				assert.equal(this.oPanel2.scrollLeft, 30, "then horizontal scrolling on Panel1 is reflected on Panel2");
				fnDone();
			}.bind(this));

			this.oScrollbarSynchronizer.addTarget(this.oPanel1);
			this.oPanel1.scrollTop = 20;
			this.oPanel1.scrollLeft = 30;
			this.oScrollbarSynchronizer.addTarget(this.oPanel2);
		});

		QUnit.test("when Panel1 is added as Target and function 'hasTarget' is called with Panel1", function(assert) {
			this.oScrollbarSynchronizer.addTarget(this.oPanel1);
			assert.ok(this.oScrollbarSynchronizer.hasTarget(this.oPanel1), "then the function returns true");

			this.oScrollbarSynchronizer.removeTarget(this.oPanel1);

			assert.notOk(this.oScrollbarSynchronizer.hasTarget(this.oPanel1), "and after removing it from targets the function returns false");
		});

		QUnit.test("when Panel3 is added as Target and then removed from the DOM", function(assert) {
			this.oScrollbarSynchronizer.addTarget(this.oPanel3);

			this.oPanel3.remove();

			this.oScrollbarSynchronizer.addTarget(this.oPanel1);

			assert.deepEqual(this.oScrollbarSynchronizer.getTargets(), [this.oPanel1], "then the function getTargets returns only Panel1");
		});

		QUnit.test("when addTarget is called without a parameter", function(assert) {
			this.oScrollbarSynchronizer.addTarget();

			assert.equal(this.oScrollbarSynchronizer.getTargets().length, 0, "then the function getTargets returns an empty array");
		});

		QUnit.test("when listeners are re-attached properly via refreshLisneters()", function(assert) {
			const fnDone = assert.async();

			this.oScrollbarSynchronizer.attachEventOnce("synced", function() {
				this.oPanel2.removeEventListener("scroll", this.oScrollbarSynchronizer._scrollEventHandler);

				this.oScrollbarSynchronizer.attachEventOnce("synced", function() {
					assert.equal(this.oPanel1.scrollTop, 40, "then vertical scrolling on Panel2 is reflected on Panel1");
					assert.equal(this.oPanel1.scrollLeft, 60, "then horizontal scrolling on Panel2 is reflected on Panel1");
					fnDone();
				}, this);

				this.oScrollbarSynchronizer.refreshListeners();
				this.oPanel2.scrollTop = 40;
				this.oPanel2.scrollLeft = 60;
			}, this);

			this.oPanel1.scrollTop = 20;
			this.oPanel1.scrollLeft = 30;
			this.oScrollbarSynchronizer.addTarget(this.oPanel1);
			this.oScrollbarSynchronizer.addTarget(this.oPanel2);
		});

		QUnit.test("when panel1 and panel2 are both change scrollbar position simultaneously", function(assert) {
			const fnDone = assert.async();

			this.oScrollbarSynchronizer.attachEventOnce("synced", function() {
				this.oScrollbarSynchronizer.attachEventOnce("synced", function() {
					assert.equal(this.oPanel1.scrollTop, 50, "then vertical scrolling on Panel1 is correct");
					assert.equal(this.oPanel1.scrollLeft, 70, "then horizontal scrolling on Panel1 is correct");

					assert.equal(this.oPanel2.scrollTop, 50, "then vertical scrolling on Panel2 is correct");
					assert.equal(this.oPanel2.scrollLeft, 70, "then horizontal scrolling on Panel2 is correct");

					fnDone();
				}, this);

				this.oPanel1.scrollTop = 20;
				this.oPanel1.scrollLeft = 30;

				this.oPanel2.scrollTop = 50;
				this.oPanel2.scrollLeft = 70;
			}, this);

			this.oScrollbarSynchronizer.addTarget(this.oPanel1);
			this.oScrollbarSynchronizer.addTarget(this.oPanel2);
		});

		QUnit.test("when sync is called with bForce=true, targets are updated synchronously without requestAnimationFrame (rAF)", function(assert) {
			this.oScrollbarSynchronizer.addTarget(this.oPanel1);
			this.oScrollbarSynchronizer.addTarget(this.oPanel2);

			this.oPanel1.scrollTop = 40;
			this.oPanel1.scrollLeft = 60;

			this.oScrollbarSynchronizer.sync(this.oPanel1, true);

			assert.equal(this.oPanel2.scrollTop, 40, "then panel2 scrollTop is updated synchronously");
			assert.equal(this.oPanel2.scrollLeft, 60, "then panel2 scrollLeft is updated synchronously");
			assert.notOk(this.oScrollbarSynchronizer.isSyncing(), "then no rAF is pending after bForce=true sync");
		});

		QUnit.test("when sync is called with bForce=true while a rAF is pending, the pending rAF is cancelled", function(assert) {
			const fnDone = assert.async();

			this.oScrollbarSynchronizer.addTarget(this.oPanel1);
			this.oScrollbarSynchronizer.addTarget(this.oPanel2);

			// Trigger the rAF path (bForce=false via scroll event)
			this.oPanel1.scrollTop = 20;
			this.oPanel1.scrollLeft = 30;
			// Dispatch a synthetic scroll event to enter the rAF path
			this.oPanel1.dispatchEvent(new Event("scroll"));
			assert.ok(this.oScrollbarSynchronizer.isSyncing(), "then a rAF is pending after scroll event");

			// Now call sync with bForce=true — must cancel the pending rAF and apply immediately
			this.oPanel1.scrollTop = 50;
			this.oPanel1.scrollLeft = 70;
			this.oScrollbarSynchronizer.sync(this.oPanel1, true);

			assert.notOk(this.oScrollbarSynchronizer.isSyncing(), "then the pending rAF is cancelled");
			assert.equal(this.oPanel2.scrollTop, 50, "then panel2 reflects the bForce values, not the pre-rAF values");
			assert.equal(this.oPanel2.scrollLeft, 70, "then panel2 scrollLeft reflects the bForce values");

			// Confirm the cancelled rAF does not fire after the frame
			window.requestAnimationFrame(function() {
				assert.equal(this.oPanel2.scrollTop, 50, "then panel2 scrollTop is not overwritten by the cancelled rAF");
				fnDone();
			}.bind(this));
		});

		QUnit.test("when sync is called with bForce=true, the synced event is fired", function(assert) {
			const fnDone = assert.async();

			this.oScrollbarSynchronizer.addTarget(this.oPanel1);
			this.oScrollbarSynchronizer.addTarget(this.oPanel2);

			this.oScrollbarSynchronizer.attachEventOnce("synced", function() {
				assert.ok(true, "then the synced event is fired synchronously for the bForce path");
				fnDone();
			});

			this.oPanel1.scrollTop = 30;
			this.oScrollbarSynchronizer.sync(this.oPanel1, true);
		});

		QUnit.test("when _syncTargets is called, it only writes positions that differ from the source", function(assert) {
			this.oScrollbarSynchronizer.addTarget(this.oPanel1);
			this.oScrollbarSynchronizer.addTarget(this.oPanel2);
			this.oScrollbarSynchronizer.addTarget(this.oPanel3);

			// Pre-align panel2 but not panel3
			this.oPanel1.scrollTop = 40;
			this.oPanel2.scrollTop = 40;
			this.oPanel3.scrollTop = 0;

			const iOriginalScrollTopPanel2 = this.oPanel2.scrollTop;
			this.oScrollbarSynchronizer.sync(this.oPanel1, true);

			assert.equal(this.oPanel2.scrollTop, 40, "then panel2 scrollTop stays at 40 (no unnecessary write)");
			assert.equal(iOriginalScrollTopPanel2, this.oPanel2.scrollTop, "then panel2 is not written when already in sync");
			assert.equal(this.oPanel3.scrollTop, 40, "then panel3 scrollTop is updated to match panel1");
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});