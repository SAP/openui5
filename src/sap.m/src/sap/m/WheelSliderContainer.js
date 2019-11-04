/*!
 * ${copyright}
 */

sap.ui.define([
	'sap/ui/Device',
	'sap/ui/core/Control',
	"sap/ui/thirdparty/jquery",
	'./WheelSliderContainerRenderer'
],
	function(
		Device,
		Control,
		jQuery,
		WheelSliderContainerRenderer
	) {
		"use strict";

		/**
		 * Constructor for a new <code>WheelSliderContainer</code>.
		 *
		 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
		 * @param {object} [mSettings] Initial settings for the new control
		 *
		 * @class
		 * A picker list container control used to hold sliders of type {@link sap.m.WheelSlider}.
		 * @extends sap.ui.core.Control
		 *
		 * @author SAP SE
		 * @version ${version}
		 *
		 * @constructor
		 * @public
		 * @since 1.73
		 * @alias sap.m.WheelSliderContainer
		 */
		var WheelSliderContainer = Control.extend("sap.m.WheelSliderContainer", /** @lends sap.m.WheelSliderContainer.prototype */ {
			metadata: {
				library: "sap.m",
				properties: {
					/**
					 * Defines the text of the picker label.
					 */
					labelText: { type: "string" },

					/**
					 * Sets the width of the container.
					 * The minimum width is 320px.
					 */
					width: { type: "sap.ui.core.CSSSize", group: "Appearance" },

					/**
					 * Sets the height of the container. If percentage value is used, the parent container must have
					 * specified height.
					 */
					height: { type: "sap.ui.core.CSSSize", group: "Appearance" }
				},
				aggregations: {
					/**
					 * The sliders in the container.
					 */
					sliders: { type: "sap.m.WheelSlider", multiple: true }
				}
			}
		});

		/**
		 * Initializes the control.
		 *
		 * @private
		 */
		WheelSliderContainer.prototype.init = function() {
			this._fnLayoutChanged = jQuery.proxy(this._onOrientationChanged, this);
			Device.resize.attachHandler(this._fnLayoutChanged);

			this._onSliderExpanded = this._onSliderExpanded.bind(this);
		};

		/**
		 * Destroys the control.
		 *
		 * @private
		 */
		WheelSliderContainer.prototype.exit = function() {
			this.$().off('selectstart', fnFalse);
			this.$().off(!!Device.browser.firefox ? "DOMMouseScroll" : "mousewheel", this._onmousewheel);
			Device.resize.detachHandler(this._fnOrientationChanged);
		};

		/**
		 * After rendering.
		 *
		 * @private
		 */
		WheelSliderContainer.prototype.onAfterRendering = function() {
			this.$().off(!!Device.browser.firefox ? "DOMMouseScroll" : "mousewheel", this._onmousewheel);
			this.$().on(!!Device.browser.firefox ? "DOMMouseScroll" : "mousewheel", jQuery.proxy(this._onmousewheel, this));

			this.$().off('selectstart', fnFalse);
			this.$().on('selectstart', fnFalse);
		};

		/**
		 * Handles the home key event.
		 *
		 * Focuses the first slider control.
		 * @param {jQuery.Event} oEvent Event object
		 * @private
		 */
		WheelSliderContainer.prototype.onsaphome = function(oEvent) {
			var oNextSlider = this._getFirstSlider(),
				oCurrentSlider = this._getCurrentSlider();

			if (oCurrentSlider && document.activeElement === oCurrentSlider.getDomRef()) {
				oNextSlider.focus();
			}
		};

		/**
		 * Handles the end key event.
		 *
		 * Focuses the last slider control.
		 * @param {jQuery.Event} oEvent Event object
		 * @private
		 */
		WheelSliderContainer.prototype.onsapend = function(oEvent) {
			var oNextSlider = this._getLastSlider(),
				oCurrentSlider = this._getCurrentSlider();

			if (oCurrentSlider && document.activeElement === oCurrentSlider.getDomRef()) {
				oNextSlider.focus();
			}
		};

		/**
		 * Handles the left arrow key event.
		 *
		 * Focuses the previous slider control.
		 * @param {jQuery.Event} oEvent Event object
		 * @private
		 */
		WheelSliderContainer.prototype.onsapleft = function(oEvent) {
			var oNextSlider,
				oCurrentSlider = this._getCurrentSlider(),
				iCurrentSliderIndex = -1,
				iNextIndex = -1,
				aSliders = this.getSliders();

			if (oCurrentSlider && document.activeElement === oCurrentSlider.getDomRef()) {
				iCurrentSliderIndex = aSliders.indexOf(oCurrentSlider);
				iNextIndex = iCurrentSliderIndex > 0 ? iCurrentSliderIndex - 1 : aSliders.length - 1;
				oNextSlider = aSliders[iNextIndex];
				oNextSlider.focus();
			}
		};

		/**
		 * Handles the right arrow key event.
		 *
		 * Focuses the next slider control.
		 * @param {jQuery.Event} oEvent Event object
		 * @private
		 */
		WheelSliderContainer.prototype.onsapright = function(oEvent) {
			var oNextSlider,
				oCurrentSlider = this._getCurrentSlider(),
				iCurrentSliderIndex = -1,
				iNextIndex = -1,
				aSliders = this.getSliders();

			if (oCurrentSlider && document.activeElement === oCurrentSlider.getDomRef()) {
				iCurrentSliderIndex = aSliders.indexOf(oCurrentSlider);
				iNextIndex = iCurrentSliderIndex < aSliders.length - 1 ? iCurrentSliderIndex + 1 : 0;
				oNextSlider = aSliders[iNextIndex];
				oNextSlider.focus();
			}
		};

		/**
		 * Handles the mouse scroll event.
		 *
		 * @param {jQuery.Event} oEvent Event object
		 * @private
		 */
		WheelSliderContainer.prototype._onmousewheel = function(oEvent) {
			var currentSlider = this._getCurrentSlider();

			if (currentSlider) {
				currentSlider._onMouseWheel(oEvent);
			}
		};

		/**
		 * Handles the orientation change event.
		 *
		 * @private
		 */
		WheelSliderContainer.prototype._onOrientationChanged = function() {
			var aSliders = this.getSliders();

			for (var i = 0; i < aSliders.length; i++) {
				if (aSliders[i].getIsExpanded()) {
					aSliders[i]._updateSelectionFrameLayout();
				}
			}
		};

		/**
		 * Gets the currently expanded slider control.
		 *
		 * @returns {sap.m.WheelSlider|null} Currently expanded slider control or null if there is none
		 * @private
		 */
		WheelSliderContainer.prototype._getCurrentSlider = function() {
			var aSliders = this.getSliders();

			if (aSliders) {
				for (var i = 0; i < aSliders.length; i++) {
					if (aSliders[i].getIsExpanded()) {
						return aSliders[i];
					}
				}
			}

			return null;
		};

		/**
		 * Returns the first slider.
		 * @returns {sap.m.WheelSlider|null} First slider
		 * @private
		 */
		WheelSliderContainer.prototype._getFirstSlider = function() {
			return this.getSliders()[0] || null;
		};

		/**
		 * Returns the last slider.
		 * @returns {sap.m.WheelSlider|null} Last slider
		 * @private
		 */
		WheelSliderContainer.prototype._getLastSlider = function() {
			var aSliders = this.getSliders();

			return aSliders[aSliders.length - 1] || null;
		};

		/**
		 * Default expanded handler.
		 * @param {jQuery.Event} oEvent  Event object
		 * @private
		 */
		WheelSliderContainer.prototype._onSliderExpanded = function(oEvent) {
			var aSliders = this.getSliders();

			for (var i = 0; i < aSliders.length; i++) {
				if (aSliders[i] !== oEvent.oSource && aSliders[i].getIsExpanded()) {
					aSliders[i].setIsExpanded(false);
				}
			}
		};

		WheelSliderContainer.prototype.addSlider = function(oSlider) {
			if (!Device.system.desktop && !sap.ui.base.EventProvider.hasListener(oSlider, "expanded", this._onSliderExpanded, this)) {
				oSlider.attachExpanded(this._onSliderExpanded);
			}

			return this.addAggregation("sliders", oSlider);
		};

		function fnFalse() {
			return false;
		}

		return WheelSliderContainer;
	});