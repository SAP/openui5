/*!
 * ${copyright}
 */

// Provides class sap.ui.core.tooltip.TooltipEventTrigger.
sap.ui.define([
	"sap/ui/Device",
	"sap/ui/base/Object",
	"sap/ui/core/tooltip/TooltipFocusGuard"
],
	function(
		Device,
		BaseObject,
		TooltipFocusGuard
	) {
		"use strict";

		// Long-press threshold in ms for touch devices.
		const LONG_PRESS_MS = 500;

		// Only reports a selection anchored inside oContainer, so a selection on an
		// unrelated element does not suppress this element's tooltip.
		function hasTextSelection(oContainer) {
			const oSel = window.getSelection && window.getSelection();
			return !!(oSel && oSel.toString().length > 0 &&
				oContainer && oSel.anchorNode && oContainer.contains(oSel.anchorNode));
		}

		/**
		 * Constructor for a new <code>sap.ui.core.tooltip.TooltipEventTrigger</code>.
		 *
		 * @param {object} oConfig Configuration for the trigger.
		 * @param {sap.ui.core.Element} oConfig.host The control the gesture delegate is registered on.
		 * @param {function():HTMLElement} oConfig.domRefProvider Returns the DOM element for hover events (mouseenter/mouseleave) and tooltip positioning. May return <code>null</code> before the first render.
		 * @param {function():HTMLElement} [oConfig.focusDomRefProvider] Returns the DOM element for focus events (focusin/focusout). Defaults to <code>domRefProvider</code>. May return <code>null</code> before the first render.
		 * @param {function(boolean)} oConfig.onOpen Opens the tooltip. Called with <code>true</code> for deferred gestures (hover, keyboard focus), no argument for instant ones (long-press). Second argument is the trigger source: "hover", "focus", or "touch".
		 * @param {function(boolean)} oConfig.onClose Closes the tooltip. Called with <code>true</code> for deferred gestures (mouseleave, focusout), no argument for instant ones (left mousedown, Escape).
		 * @param {function():boolean} oConfig.isPendingOrOpen Whether a tooltip is pending or open; the Escape handler consumes the key only then.
		 * @param {function():boolean} [oConfig.hasText] Predicate telling whether the host currently has tooltip text. Used to gate the touch-device suppressions (text-selection class, native context menu), so they only kick in for a control that actually has a tooltip. When omitted, the suppressions are not applied.
		 * @param {boolean} [oConfig.enableForTouchDevices=true] Whether long-press should open the tooltip on touch devices.
		 *
		 * @class
		 * Translates raw DOM gestures (hover, keyboard focus, Escape, long-press)
		 * into open/close signals delivered via the configured callbacks.
		 *
		 * The trigger registers a single UI5 event delegate on the host control,
		 * so its handlers survive host re-renders without an attach/detach lifecycle.
		 * It reacts only to gestures inside the element returned by
		 * <code>domRefProvider</code>, so several triggers can coexist on one host —
		 * one per focus target — each showing its own tooltip.
		 *
		 * @author SAP SE
		 * @version ${version}
		 *
		 * @extends sap.ui.base.Object
		 *
		 * @since 1.151
		 * @constructor
		 * @private
		 * @alias sap.ui.core.tooltip.TooltipEventTrigger
		 */
		const TooltipEventTrigger = BaseObject.extend("sap.ui.core.tooltip.TooltipEventTrigger", /** @lends sap.ui.core.tooltip.TooltipEventTrigger.prototype */ {
			constructor: function(oConfig) {
				BaseObject.apply(this);

				oConfig = oConfig || {};

				this._oHost = oConfig.host;
				this._fnDomRefProvider = oConfig.domRefProvider;
				this._fnFocusDomRefProvider = oConfig.focusDomRefProvider || this._fnDomRefProvider;
				this._fnOnOpen = oConfig.onOpen;
				this._fnOnClose = oConfig.onClose;
				this._fnIsPendingOrOpen = oConfig.isPendingOrOpen;
				this._fnHasText = oConfig.hasText;
				this._bEnableForTouchDevices = oConfig.enableForTouchDevices !== false;

				this._iLongPressTimer = null;

				this._oFocusGuard = new TooltipFocusGuard({
					isPendingOrOpen: () => this._fnIsPendingOrOpen && this._fnIsPendingOrOpen(),
					onClose: () => this._fnOnClose && this._fnOnClose()
				});

				this._oDelegate = this._buildDelegate();
				if (this._oHost) {
					this._oHost.addDelegate(this._oDelegate, this);
				}

				// Host may already be rendered; sync touch-suppression now.
				this._syncTouchSuppression();
			}
		});

		/**
		 * Enables or disables the long-press / contextmenu tooltip on touch devices.
		 * @public
		 * @param {boolean} bEnable
		 * @returns {this}
		 */
		TooltipEventTrigger.prototype.setEnableForTouchDevices = function(bEnable) {
			this._bEnableForTouchDevices = !!bEnable;
			this._syncTouchSuppression();
			return this;
		};

		/**
		 * @public
		 * @returns {boolean}
		 */
		TooltipEventTrigger.prototype.getEnableForTouchDevices = function() {
			return this._bEnableForTouchDevices;
		};

		/**
		 * Whether the host currently has tooltip text, per the configured
		 * <code>hasText</code> predicate. Returns <code>false</code> when no
		 * predicate was configured.
		 * @private
		 * @returns {boolean}
		 */
		TooltipEventTrigger.prototype._hasText = function() {
			return !!(this._fnHasText && this._fnHasText());
		};

		/**
		 * Disposes the trigger: removes its event delegate from the host.
		 * @public
		 */
		TooltipEventTrigger.prototype.destroy = function() {
			if (this._iLongPressTimer) {
				clearTimeout(this._iLongPressTimer);
				this._iLongPressTimer = null;
			}
			// Drop the touch-suppression class so it does not linger on the host.
			const oTarget = this._fnDomRefProvider && this._fnDomRefProvider();
			if (oTarget) {
				oTarget.classList.remove("sapUiCoreTooltipHostSuppressSelection");
			}
			if (this._oHost && this._oDelegate) {
				this._oHost.removeDelegate(this._oDelegate);
			}
			this._oDelegate = null;
			this._oHost = null;
			this._fnDomRefProvider = null;
			this._fnFocusDomRefProvider = null;
			this._fnOnOpen = null;
			this._fnOnClose = null;
			this._fnIsPendingOrOpen = null;
			this._fnHasText = null;

			this._oFocusGuard.destroy();
			this._oFocusGuard = null;

			BaseObject.prototype.destroy.apply(this, arguments);
		};

		/**
		 * Builds the UI5 event delegate. Handler names are UI5 pseudo-event names,
		 * so UI5 rebinds them across host re-renders.
		 * @private
		 * @returns {object}
		 */
		TooltipEventTrigger.prototype._buildDelegate = function() {
			const oDelegate = {};

			if (Device.system.desktop || Device.system.combi) {
				oDelegate.onmousedown = this._onMouseDown;
				oDelegate.onmouseover = this._onMouseOver;
				oDelegate.onmouseout  = this._onMouseOut;
				oDelegate.onfocusin   = this._onFocusIn;
				oDelegate.onfocusout  = this._onFocusOut;
				oDelegate.onsapescape = this._onSapEscape;
			}

			// Touch-only (phone or tablet, not combi).
			if ((Device.system.phone || Device.system.tablet) && !Device.system.combi) {
				oDelegate.oncontextmenu = this._onContextMenu;
				oDelegate.ontouchstart  = this._onTouchStart;
				oDelegate.ontouchmove   = this._onTouchMove;
				oDelegate.ontouchend    = this._onTouchEnd;
				oDelegate.ontouchcancel = this._onTouchCancel;
				oDelegate.onAfterRendering = this._onAfterRendering;
			}

			return oDelegate;
		};

		/**
		 * The suppress-selection class is touch-scoped: it is applied on touchstart
		 * (when a tooltip exists and touch is enabled) and dropped once the touch
		 * gesture ends. This clears any leftover class after a re-render or setter.
		 * @private
		 */
		TooltipEventTrigger.prototype._syncTouchSuppression = function() {
			if (!((Device.system.phone || Device.system.tablet) && !Device.system.combi)) {
				return;
			}
			this._stopSuppressSelection();
		};

		/**
		 * Adds the touch-suppression class on the current hover target.
		 * @private
		 */
		TooltipEventTrigger.prototype._startSuppressSelection = function() {
			const oTarget = this._fnDomRefProvider && this._fnDomRefProvider();
			if (oTarget) {
				oTarget.classList.add("sapUiCoreTooltipHostSuppressSelection");
			}
		};

		/**
		 * Removes the touch-suppression class from the current hover target.
		 * @private
		 */
		TooltipEventTrigger.prototype._stopSuppressSelection = function() {
			const oTarget = this._fnDomRefProvider && this._fnDomRefProvider();
			if (oTarget) {
				oTarget.classList.remove("sapUiCoreTooltipHostSuppressSelection");
			}
		};

		/**
		 * Whether the gesture landed inside the hover target.
		 * @private
		 * @param {jQuery.Event} oEvent
		 * @returns {boolean}
		 */
		TooltipEventTrigger.prototype._isForHoverTarget = function(oEvent) {
			const oTarget = this._fnDomRefProvider && this._fnDomRefProvider();
			return !!(oTarget && oEvent.target && oTarget.contains(oEvent.target));
		};

		/**
		 * Whether the gesture landed inside the focus target.
		 * @private
		 * @param {jQuery.Event} oEvent
		 * @returns {boolean}
		 */
		TooltipEventTrigger.prototype._isForFocusTarget = function(oEvent) {
			const oTarget = this._fnFocusDomRefProvider && this._fnFocusDomRefProvider();
			return !!(oTarget && oEvent.target && oTarget.contains(oEvent.target));
		};

		/**
		 * Whether the move stayed inside the hover target (an inner move, not a real
		 * enter/leave).
		 * @private
		 * @param {jQuery.Event} oEvent
		 * @returns {boolean}
		 */
		TooltipEventTrigger.prototype._isMoveWithinHoverTarget = function(oEvent) {
			const oTarget = this._fnDomRefProvider && this._fnDomRefProvider();
			const oRelated = oEvent.relatedTarget;
			return !!(oTarget && oRelated && oTarget.contains(oRelated));
		};

		/**
		 * Left mousedown (normal activation) closes the tooltip immediately.
		 * Right mousedown is left to the browser's contextmenu gesture.
		 * @private
		 */
		TooltipEventTrigger.prototype._onMouseDown = function(oEvent) {
			if (!this._isForHoverTarget(oEvent)) {
				return;
			}
			// Fresh interaction.
			this._oFocusGuard.noteFreshInteraction();
			if (oEvent.button === 2) {
				return;
			}
			if (hasTextSelection(this._fnDomRefProvider && this._fnDomRefProvider())) {
				return;
			}
			this._fnOnClose();
		};

		/**
		 * @private
		 */
		TooltipEventTrigger.prototype._onMouseOver = function(oEvent) {
			if (!this._isForHoverTarget(oEvent)) {
				return;
			}
			if (this._isMoveWithinHoverTarget(oEvent)) {
				return;
			}
			// Fresh interaction.
			this._oFocusGuard.noteFreshInteraction();
			// A live selection here means a likely drag-select; opening would clear it.
			if (hasTextSelection(this._fnDomRefProvider && this._fnDomRefProvider())) {
				return;
			}
			this._fnOnOpen(true, "hover");
		};

		/**
		 * @private
		 */
		TooltipEventTrigger.prototype._onMouseOut = function(oEvent) {
			if (!this._isForHoverTarget(oEvent)) {
				return;
			}
			if (this._isMoveWithinHoverTarget(oEvent)) {
				return;
			}
			this._fnOnClose(true);
		};

		/**
		 * Open on keyboard focus only, via :focus-visible.
		 * @private
		 */
		TooltipEventTrigger.prototype._onFocusIn = function(oEvent) {
			if (!this._isForFocusTarget(oEvent)) {
				return;
			}
			const oTarget = this._fnFocusDomRefProvider();
			if (!(oTarget && oTarget.matches && oTarget.matches(":focus-visible"))) {
				return;
			}
			if (this._oFocusGuard.shouldSuppressFocusOpen(oTarget)) {
				return;
			}
			this._fnOnOpen(true, "focus");
		};

		/**
		 * @private
		 */
		TooltipEventTrigger.prototype._onFocusOut = function(oEvent) {
			if (!this._isForFocusTarget(oEvent)) {
				return;
			}
			// Fresh interaction.
			this._oFocusGuard.noteFreshInteraction();
			this._fnOnClose(true);
		};

		/**
		 * Escape closes a pending or open tooltip without swallowing the event
		 * from ancestors (e.g. a Dialog's Escape).
		 * @private
		 */
		TooltipEventTrigger.prototype._onSapEscape = function(oEvent) {
			if (this._fnIsPendingOrOpen && this._fnIsPendingOrOpen()) {
				this._fnOnClose();
				oEvent.preventDefault();
			}
		};

		/**
		 * @private
		 */
		TooltipEventTrigger.prototype._onContextMenu = function(oEvent) {
			if (!this._isForHoverTarget(oEvent)) {
				return;
			}
			if (this._bEnableForTouchDevices && this._hasText()) {
				oEvent.preventDefault();
			}
		};

		/**
		 * @private
		 */
		TooltipEventTrigger.prototype._onTouchStart = function(oEvent) {
			if (!this._isForHoverTarget(oEvent)) {
				return;
			}
			// @todo make the option for late desision for a tooltip to be well documented in the official contract. Better move to isEnabled or beforeOpen which is publicly documented, rather than to rely on late hasText check
			if (!this._bEnableForTouchDevices || !this._hasText()) {
				return;
			}
			// Suppress selection while the tooltip is pending/open; kept until the touch is cancelled or closed.
			this._startSuppressSelection();
			this._clearLongPressTimer();
			this._iLongPressTimer = setTimeout(() => {
				this._iLongPressTimer = null;
				this._fnOnOpen(false, "touch");
			}, LONG_PRESS_MS);
		};

		/**
		 * @private
		 */
		TooltipEventTrigger.prototype._clearLongPressTimer = function() {
			if (this._iLongPressTimer) {
				clearTimeout(this._iLongPressTimer);
				this._iLongPressTimer = null;
			}
		};

		/**
		 * @private
		 */
		TooltipEventTrigger.prototype._onTouchMove = function() {
			this._clearLongPressTimer();
			this._stopSuppressSelection();
		};

		/**
		 * @private
		 */
		TooltipEventTrigger.prototype._onTouchEnd = function() {
			this._clearLongPressTimer();
			this._stopSuppressSelection();
		};

		/**
		 * @private
		 */
		TooltipEventTrigger.prototype._onTouchCancel = function() {
			this._clearLongPressTimer();
			this._stopSuppressSelection();
		};

		/**
		 * Reapplies the touch-suppression class, whose target DOM is recreated on re-render.
		 * @private
		 */
		TooltipEventTrigger.prototype._onAfterRendering = function() {
			this._syncTouchSuppression();
		};

		return TooltipEventTrigger;
	});
