/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/dt/OverlayRegistry"
], function(
	OverlayRegistry
) {
	"use strict";

	/**
	 * On-screen status visualization for the frontend actions of
	 * {@link sap.ui.rta.api.FrontendActionsAPI}. This is the default status
	 * reporter installed by the API; a consumer that wants no visible
	 * progress can replace it via
	 * {@link sap.ui.rta.api.FrontendActionsAPI.setStatusReporter} (e.g. with a
	 * no-op reporter).
	 *
	 * Provides:
	 * <ul>
	 *   <li>A full-viewport overlay with an animated "AI magic" wavy border
	 *       and a status pill. While installed, the overlay swallows
	 *       pointer/keyboard events on the underlying app so the user does
	 *       not interfere with the actions in flight. Its z-index sits above
	 *       typical app and RTA overlays but below a plausible chat/assistant
	 *       client so an embedding shell can still layer its own UI on
	 *       top.</li>
	 *   <li>Lazy install via <code>setStatus</code> — the first status update
	 *       brings the overlay up, subsequent updates only change the
	 *       caption. Each <code>setStatus</code> call also restarts an
	 *       internal long safety timer that tears the overlay down if the
	 *       driver goes silent for too long (last-resort against leaks; the
	 *       expected teardown path is an explicit
	 *       <code>removeBlockingOverlay</code>, wired by the API to the RTA
	 *       <code>stop</code> event).</li>
	 *   <li>Transient highlighting of the RTA overlay currently being
	 *       inspected / acted on (getContext / callAction).</li>
	 * </ul>
	 *
	 * All DOM state is module-scoped; install/remove are idempotent. This
	 * module only toggles CSS classes and the <code>data-status</code>
	 * attribute the theme keys off — the styling itself (animated border,
	 * status pill, highlight pulse) ships with the <code>sap.ui.rta</code>
	 * theme (<code>AIVisualization.less</code>).
	 *
	 * @namespace
	 * @alias sap.ui.rta.util.ai.AIVisualization
	 * @since 1.153
	 * @private
	 * @ui5-restricted sap.ui.rta
	 */

	const BLOCKER_ID = "sapUiRtaAIVisualizationBlocker";
	const HIGHLIGHT_CLASS = "sapUiRtaAIVisualizationHighlight";

	// Events the blocker swallows. Captured at the capture phase on the
	// blocker element itself, so they never reach anything underneath.
	const BLOCKED_EVENTS = [
		"click", "mousedown", "mouseup", "dblclick", "contextmenu",
		"pointerdown", "pointerup", "keydown", "keyup", "wheel", "touchstart", "touchend"
	];

	function fnStopEvent(oEvent) {
		oEvent.stopPropagation();
		oEvent.preventDefault();
	}

	function attachBlockingListeners(oBlocker) {
		BLOCKED_EVENTS.forEach((sType) => oBlocker.addEventListener(sType, fnStopEvent, true));
	}

	function detachBlockingListeners(oBlocker) {
		BLOCKED_EVENTS.forEach((sType) => oBlocker.removeEventListener(sType, fnStopEvent, true));
	}

	const oHighlightTimers = new WeakMap();

	// Display name of the currently-driving agent. Used as a prefix in the
	// status pill (e.g. "Joule is applying 'Rename'"). Set once via
	// setAgentName from the caller of startRTA and read back by callers
	// of setStatus. Falls back to the generic "AI" until an agent
	// identifies itself, so nothing changes for callers that never set it.
	const DEFAULT_AGENT_NAME = "AI";
	let sAgentName = DEFAULT_AGENT_NAME;

	// Last-resort safety timer. The overlay is expected to be torn down
	// explicitly (removeBlockingOverlay, wired to the RTA stop event). This
	// timer only fires if that signal never arrives — well above realistic
	// LLM thinking gaps (2–10 s typical) so it does not interrupt a real
	// AI turn.
	const SAFETY_TIMEOUT_MS = 60000;
	let iSafetyTimer = null;

	function cancelSafetyTimer() {
		if (iSafetyTimer !== null) {
			clearTimeout(iSafetyTimer);
			iSafetyTimer = null;
		}
	}

	function removeBlocker() {
		cancelSafetyTimer();
		const oBlocker = document.getElementById(BLOCKER_ID);
		if (oBlocker?.parentNode) {
			detachBlockingListeners(oBlocker);
			oBlocker.parentNode.removeChild(oBlocker);
		}
	}

	function armSafetyTimer() {
		cancelSafetyTimer();
		iSafetyTimer = setTimeout(() => {
			iSafetyTimer = null;
			removeBlocker();
		}, SAFETY_TIMEOUT_MS);
	}

	function ensureBlockerInstalled() {
		let oBlocker = document.getElementById(BLOCKER_ID);
		if (!oBlocker) {
			oBlocker = document.createElement("div");
			oBlocker.id = BLOCKER_ID;
			oBlocker.setAttribute("data-status", `${sAgentName} is working…`);
			document.body.appendChild(oBlocker);
			attachBlockingListeners(oBlocker);
		}
		return oBlocker;
	}

	const AIVisualization = {

		/**
		 * Sets the display name of the driving agent — used as the prefix in
		 * the status pill (e.g. <em>"Joule is applying 'Rename'"</em>). The
		 * name persists until explicitly changed or reset, and is picked up
		 * by all subsequent <code>setStatus</code> calls that do not supply
		 * their own literal caption. Pass a falsy value to fall back to the
		 * generic default ("AI").
		 *
		 * @param {string} [sName] New agent display name; falsy resets to default.
		 */
		setAgentName(sName) {
			sAgentName = (typeof sName === "string" && sName.trim()) || DEFAULT_AGENT_NAME;
		},

		/**
		 * Returns the currently configured agent display name.
		 *
		 * @returns {string} Agent name (never empty — defaults to "AI").
		 */
		getAgentName() {
			return sAgentName;
		},

		/**
		 * Updates the status caption on the AI-magic overlay. Lazily
		 * installs the overlay (with the animated wavy border + input
		 * gating) on first call. Each call restarts the internal safety
		 * timer — so as long as the driver keeps reporting status the overlay
		 * stays up indefinitely, but if the driver goes silent the overlay
		 * tears itself down after <code>SAFETY_TIMEOUT_MS</code> as a
		 * last resort. The expected teardown path is explicit:
		 * <code>removeBlockingOverlay</code>, wired by
		 * {@link sap.ui.rta.api.FrontendActionsAPI} to the RTA
		 * <code>stop</code> event.
		 *
		 * @param {string} sStatus New caption.
		 */
		setStatus(sStatus) {
			const oBlocker = ensureBlockerInstalled();
			oBlocker.setAttribute("data-status", sStatus || `${sAgentName} is working…`);
			armSafetyTimer();
		},

		/**
		 * Removes the blocking overlay immediately and cancels the safety
		 * timer. Safe to call when nothing is installed.
		 */
		removeBlockingOverlay() {
			removeBlocker();
		},

		/**
		 * Briefly highlights the RTA overlay belonging to <code>sControlId</code>
		 * with a pulsing AI-magic border. Used by the inspection actions
		 * (getContext, callAction) so the user can see which control the
		 * model is currently looking at.
		 *
		 * @param {string} sControlId Control id whose overlay should pulse.
		 * @param {int} [iDurationMs=2200] How long the pulse stays on.
		 */
		highlightOverlay(sControlId, iDurationMs) {
			if (!sControlId) {
				return;
			}
			const oOverlay = OverlayRegistry.getOverlay(sControlId);
			const oDom = oOverlay?.getDomRef?.();
			if (!oDom) {
				return;
			}
			oDom.classList.add(HIGHLIGHT_CLASS);
			// Coalesce repeated highlights of the same overlay so the timer
			// always reflects the latest call.
			const oExisting = oHighlightTimers.get(oDom);
			if (oExisting) {
				clearTimeout(oExisting);
			}
			const iTimer = setTimeout(() => {
				oDom.classList.remove(HIGHLIGHT_CLASS);
				oHighlightTimers.delete(oDom);
			}, iDurationMs || 2200);
			oHighlightTimers.set(oDom, iTimer);
		}
	};

	return AIVisualization;
});
