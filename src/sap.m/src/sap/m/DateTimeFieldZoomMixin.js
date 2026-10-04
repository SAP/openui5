/*!
 * ${copyright}
 */
sap.ui.define([], function() {
	"use strict";

	const HIGH_ZOOM_VIEWPORT_THRESHOLD = 300;

	/**
	 * Mixin that adds browser-zoom awareness to DateTimeField-based controls
	 * (TimePicker, DatePicker, DateTimePicker, DateRangeSelection).
	 *
	 * Applied once to DateTimeField.prototype so all subclasses inherit the
	 * behaviour automatically. Each subclass overrides _onZoomChange(bHighZoom)
	 * to perform its own content switch.
	 *
	 * Provides:
	 *  - _isHighZoom()           — true when viewport ≤ 300 px
	 *  - _updateIconVisibility() — hides the value-help icon at high zoom
	 *  - _startZoomWatch()       — registers resize listeners; calls _onZoomChange(bHighZoom)
	 *  - _stopZoomWatch()        — removes the listeners (call from exit())
	 *  - _onZoomChange()         — noop hook; override per control
	 *
	 * @namespace
	 * @alias module:sap/m/DateTimeFieldZoomMixin
	 * @private
	 */
	const DateTimeFieldZoomMixin = {

		/**
		 * Returns true when the viewport width is ≤ 300 px — either because the browser
		 * is zoomed to ≥ 200%, or because the physical screen is that narrow (e.g. small phone).
		 * Uses visualViewport.width when available (zoom-aware); falls back to window.innerWidth.
		 * @returns {boolean}
		 * @private
		 */
		_isHighZoom() {
			const iWidth = (window.visualViewport && window.visualViewport.width) || window.innerWidth;
			return iWidth <= HIGH_ZOOM_VIEWPORT_THRESHOLD;
		},

		/**
		 * Shows or hides the value-help icon based on zoom level and editability.
		 * @private
		 */
		_updateIconVisibility() {
			const oIcon = this._getValueHelpIcon();
			if (oIcon) {
				oIcon.setProperty("visible", this.getEditable() && !this._isHighZoom());
			}
		},

		/**
		 * Registers window/visualViewport resize listeners.
		 * On each resize: updates icon visibility and calls this._onZoomChange(bHighZoom).
		 * @private
		 */
		_startZoomWatch() {
			if (this._fnZoomResizeHandler) {
				window.removeEventListener("resize", this._fnZoomResizeHandler);
				window.visualViewport?.removeEventListener("resize", this._fnZoomResizeHandler);
			}

			this._fnZoomResizeHandler = () => {
				// Skip if control is not yet in the DOM (visualViewport fires during initial layout)
				if (!this.getDomRef()) { return; }
				this._updateIconVisibility();
				this._onZoomChange(this._isHighZoom());
			};

			// Register on visualViewport when available (accurate for pinch-zoom and Chrome/Edge
			// browser zoom). Also always register on window.resize as a fallback for browsers
			// where visualViewport does not fire on keyboard zoom (e.g. Firefox Ctrl+/-).
			if (window.visualViewport) {
				window.visualViewport.addEventListener("resize", this._fnZoomResizeHandler);
			}
			window.addEventListener("resize", this._fnZoomResizeHandler);
		},

		/**
		 * Removes the resize listeners registered by _startZoomWatch.
		 * @private
		 */
		_stopZoomWatch() {
			if (this._fnZoomResizeHandler) {
				window.removeEventListener("resize", this._fnZoomResizeHandler);
				window.visualViewport?.removeEventListener("resize", this._fnZoomResizeHandler);
				this._fnZoomResizeHandler = null;
			}
		},

		/**
		 * Called when the zoom level changes. Override in each subclass to perform the switch.
		 * @param {boolean} bHighZoom - true when viewport ≤ 300 px
		 * @private
		 */
		_onZoomChange(_bHighZoom) {
			// noop — override per control
		}
	};

	return DateTimeFieldZoomMixin;
});
