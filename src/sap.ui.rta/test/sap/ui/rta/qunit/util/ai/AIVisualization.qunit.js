/* global QUnit */

sap.ui.define([
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/rta/util/ai/AIVisualization",
	"sap/ui/thirdparty/sinon-4"
], function(
	OverlayRegistry,
	AIVisualization,
	sinon
) {
	"use strict";

	const sandbox = sinon.createSandbox();
	const BLOCKER_ID = "sapUiRtaAIVisualizationBlocker";
	const HIGHLIGHT_CLASS = "sapUiRtaAIVisualizationHighlight";
	const SAFETY_TIMEOUT_MS = 60000;

	function getBlocker() {
		return document.getElementById(BLOCKER_ID);
	}

	QUnit.module("Given the AIVisualization status reporter", {
		afterEach() {
			// The reporter is module-scoped and stateful — reset DOM, timers and
			// the agent name so tests stay isolated.
			AIVisualization.removeBlockingOverlay();
			AIVisualization.setAgentName();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when setStatus is called for the first time", function(assert) {
			AIVisualization.setStatus("scanning");

			const oBlocker = getBlocker();
			assert.ok(oBlocker, "then the blocking overlay is installed");
			assert.strictEqual(oBlocker.getAttribute("data-status"), "scanning", "then the caption reflects the status");
		});

		QUnit.test("when setStatus is called repeatedly", function(assert) {
			AIVisualization.setStatus("first");
			const oFirstBlocker = getBlocker();
			AIVisualization.setStatus("second");

			assert.strictEqual(document.querySelectorAll(`#${BLOCKER_ID}`).length, 1, "then only one overlay exists");
			assert.strictEqual(getBlocker(), oFirstBlocker, "then the same overlay node is reused");
			assert.strictEqual(getBlocker().getAttribute("data-status"), "second", "then the caption is updated");
		});

		QUnit.test("when setStatus is called with an empty status", function(assert) {
			AIVisualization.setAgentName("Joule");
			AIVisualization.setStatus("");

			assert.strictEqual(
				getBlocker().getAttribute("data-status"),
				"Joule is working…",
				"then a default caption using the agent name is shown"
			);
		});

		QUnit.test("when removeBlockingOverlay is called", function(assert) {
			AIVisualization.setStatus("working");
			assert.ok(getBlocker(), "then the overlay is installed first");

			AIVisualization.removeBlockingOverlay();
			assert.notOk(getBlocker(), "then the overlay is removed from the DOM");
		});

		QUnit.test("when removeBlockingOverlay is called without an installed overlay", function(assert) {
			AIVisualization.removeBlockingOverlay();
			assert.notOk(getBlocker(), "then it is a no-op and nothing is installed");
		});

		QUnit.test("when a blocked event is dispatched on the overlay", function(assert) {
			AIVisualization.setStatus("working");
			const oBlocker = getBlocker();

			const oClick = new MouseEvent("click", { bubbles: true, cancelable: true });
			oBlocker.dispatchEvent(oClick);

			assert.ok(oClick.defaultPrevented, "then the event is prevented so it cannot reach the app underneath");
		});

		QUnit.test("when the driver goes silent past the safety timeout", function(assert) {
			const oClock = sandbox.useFakeTimers();
			AIVisualization.setStatus("working");
			assert.ok(getBlocker(), "then the overlay is installed");

			oClock.tick(SAFETY_TIMEOUT_MS - 1);
			assert.ok(getBlocker(), "then it is still up just before the timeout");

			oClock.tick(1);
			assert.notOk(getBlocker(), "then it tears itself down once the safety timeout elapses");
		});

		QUnit.test("when setStatus is called again before the safety timeout", function(assert) {
			const oClock = sandbox.useFakeTimers();
			AIVisualization.setStatus("first");

			oClock.tick(SAFETY_TIMEOUT_MS - 1);
			AIVisualization.setStatus("second");
			oClock.tick(SAFETY_TIMEOUT_MS - 1);

			assert.ok(getBlocker(), "then the timer was re-armed and the overlay stays up");
		});
	});

	QUnit.module("Given the AIVisualization agent name", {
		afterEach() {
			AIVisualization.setAgentName();
		}
	}, function() {
		QUnit.test("when no agent name has been set", function(assert) {
			assert.strictEqual(AIVisualization.getAgentName(), "AI", "then it defaults to 'AI'");
		});

		QUnit.test("when an agent name is set", function(assert) {
			AIVisualization.setAgentName("  Joule  ");
			assert.strictEqual(AIVisualization.getAgentName(), "Joule", "then it is used and trimmed");
		});

		QUnit.test("when a falsy agent name is set", function(assert) {
			AIVisualization.setAgentName("Joule");
			AIVisualization.setAgentName();
			assert.strictEqual(AIVisualization.getAgentName(), "AI", "then it resets to the default");
		});
	});

	QUnit.module("Given the AIVisualization overlay highlight", {
		beforeEach() {
			this.oDom = document.createElement("div");
			this.oOverlay = { getDomRef: () => this.oDom };
			sandbox.stub(OverlayRegistry, "getOverlay").returns(this.oOverlay);
			this.oClock = sandbox.useFakeTimers();
		},
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when an overlay is highlighted", function(assert) {
			AIVisualization.highlightOverlay("ctrl1", 1000);
			assert.ok(this.oDom.classList.contains(HIGHLIGHT_CLASS), "then the highlight class is added");

			this.oClock.tick(1000);
			assert.notOk(this.oDom.classList.contains(HIGHLIGHT_CLASS), "then it is removed after the duration");
		});

		QUnit.test("when the same overlay is highlighted again before the timer elapses", function(assert) {
			AIVisualization.highlightOverlay("ctrl1", 1000);
			this.oClock.tick(500);
			// Re-highlight — the earlier timer must be coalesced so the class is
			// not dropped at the original deadline.
			AIVisualization.highlightOverlay("ctrl1", 1000);

			this.oClock.tick(500);
			assert.ok(this.oDom.classList.contains(HIGHLIGHT_CLASS), "then the earlier timer was cleared and the class stays");

			this.oClock.tick(500);
			assert.notOk(this.oDom.classList.contains(HIGHLIGHT_CLASS), "then it is removed after the latest duration");
		});

		QUnit.test("when highlightOverlay is called without a control id", function(assert) {
			AIVisualization.highlightOverlay();
			assert.ok(OverlayRegistry.getOverlay.notCalled, "then no overlay is looked up and it is a no-op");
		});

		QUnit.test("when the overlay has no DOM reference", function(assert) {
			this.oOverlay.getDomRef = () => null;
			AIVisualization.highlightOverlay("ctrl1");
			assert.ok(true, "then it is a no-op and does not throw");
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
