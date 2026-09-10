/*!
 * ${copyright}
 */

// Provides class sap.ui.core.tooltip.TooltipFocusGuard.
sap.ui.define([
	"sap/ui/base/Object"
],
	function(
		BaseObject
	) {
		"use strict";

		// Sticky: true until the first keyboard navigation, never reset.
		let bInitialFocus = true;

		// Shared listeners are attached only while > 0.
		let iGuardCount = 0;

		// Live guards, notified on page leave.
		const oActiveGuards = new Set();

		function onDocumentKeyDown() {
			bInitialFocus = false;
			detachInitialFocusListener();
		}

		function attachInitialFocusListener() {
			if (bInitialFocus) {
				document.addEventListener("keydown", onDocumentKeyDown, true);
			}
		}

		function detachInitialFocusListener() {
			document.removeEventListener("keydown", onDocumentKeyDown, true);
		}

		function onPageHidden() {
			if (!document.hidden) {
				return;
			}
			oActiveGuards.forEach((oGuard) => oGuard._dismissOnPageLeave());
		}

		function attachPageVisibilityListener() {
			document.addEventListener("visibilitychange", onPageHidden, true);
		}

		function detachPageVisibilityListener() {
			document.removeEventListener("visibilitychange", onPageHidden, true);
		}

		// The "sapUiPopupInitial" class marks a dialog's open-focus (dropped once
		// open); scoped to "sapMDialog" so modal popovers are excluded.
		function isDialogOpenFocus(oElement) {
			const oDialog = oElement && oElement.closest && oElement.closest(".sapMDialog");
			return !!(oDialog && oDialog.classList.contains("sapUiPopupInitial"));
		}

		/**
		 * Constructor for a new <code>sap.ui.core.tooltip.TooltipFocusGuard</code>.
		 *
		 * @param {object} oConfig Configuration for the guard.
		 * @param {function():boolean} oConfig.isPendingOrOpen Whether the owner's tooltip is pending or open.
		 * @param {function()} oConfig.onClose Closes the owner's tooltip.
		 *
		 * @class
		 * Decides whether a keyboard-focus tooltip may open. By design, a tooltip
		 * must not appear for focus the user did not drive, so it guards three cases:
		 * <ul>
		 *   <li>initial page-load focus;</li>
		 *   <li>the focus a modal dialog takes on open;</li>
		 *   <li>refocus after the page was left (until a fresh interaction).</li>
		 * </ul>
		 *
		 * One guard per trigger; shared document listeners live only while a guard does.
		 *
		 * @author SAP SE
		 * @version ${version}
		 *
		 * @extends sap.ui.base.Object
		 *
		 * @since 1.151
		 * @constructor
		 * @private
		 * @alias sap.ui.core.tooltip.TooltipFocusGuard
		 */
		const TooltipFocusGuard = BaseObject.extend("sap.ui.core.tooltip.TooltipFocusGuard", /** @lends sap.ui.core.tooltip.TooltipFocusGuard.prototype */ {
			constructor: function(oConfig) {
				BaseObject.apply(this);

				oConfig = oConfig || {};
				this._fnIsPendingOrOpen = oConfig.isPendingOrOpen;
				this._fnOnClose = oConfig.onClose;

				// Set on page-leave dismissal; blocks reopen until a fresh interaction.
				this._bAwaitReentryInteraction = false;

				oActiveGuards.add(this);

				if (iGuardCount === 0) {
					attachInitialFocusListener();
					attachPageVisibilityListener();
				}
				iGuardCount++;
			}
		});

		/**
		 * Whether a keyboard-focus tooltip must be suppressed for the given target.
		 * @private
		 * @param {HTMLElement} oFocusTarget The element receiving focus.
		 * @returns {boolean} <code>true</code> when the tooltip must not open.
		 */
		TooltipFocusGuard.prototype.shouldSuppressFocusOpen = function(oFocusTarget) {
			if (isDialogOpenFocus(oFocusTarget)) {
				return true;
			}
			if (bInitialFocus) {
				return true;
			}
			if (this._bAwaitReentryInteraction) {
				return true;
			}
			return false;
		};

		/**
		 * Ends the post-page-leave reentry wait, so a later focus reopens normally.
		 * @private
		 */
		TooltipFocusGuard.prototype.noteFreshInteraction = function() {
			this._bAwaitReentryInteraction = false;
		};

		/**
		 * Dismisses a pending/open tooltip on page leave; it reopens only after a fresh interaction.
		 * @private
		 */
		TooltipFocusGuard.prototype._dismissOnPageLeave = function() {
			if (this._fnIsPendingOrOpen && this._fnIsPendingOrOpen()) {
				this._bAwaitReentryInteraction = true;
				this._fnOnClose();
			}
		};

		/**
		 * Disposes the guard; drops the shared listeners once the last guard is gone.
		 * @private
		 */
		TooltipFocusGuard.prototype.destroy = function() {
			this._fnIsPendingOrOpen = null;
			this._fnOnClose = null;

			iGuardCount--;
			if (iGuardCount === 0) {
				detachInitialFocusListener();
				detachPageVisibilityListener();
			}
			oActiveGuards.delete(this);

			BaseObject.prototype.destroy.apply(this, arguments);
		};

		/**
		 * Resets the sticky initial-focus state and shared listeners. Test-only.
		 * @private
		 * @ui5-restricted sap.ui.core
		 */
		TooltipFocusGuard._resetForTesting = function() {
			detachInitialFocusListener();
			detachPageVisibilityListener();
			bInitialFocus = true;
			iGuardCount = 0;
			oActiveGuards.clear();
		};

		return TooltipFocusGuard;
	});
