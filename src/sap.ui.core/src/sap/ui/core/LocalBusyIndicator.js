/*!
 * ${copyright}
 */

// Provides control sap.ui.core.LocalBusyIndicator.
sap.ui.define([
	'./Control',
	'./theming/Parameters',
	"./LocalBusyIndicatorRenderer",
	'./library' // ensure loading of types
],
	function(Control, Parameters, LocalBusyIndicatorRenderer) {
	"use strict";


	/**
	 * Constructor for a new LocalBusyIndicator.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * The LocalBusyIndicator is a special version of the
	 * BusyIndicator. This one doesn't block the whole screen - it just
	 * blocks the corresponding control and puts a local animation over the
	 * control. To use the functionality of this control the corresponding
	 * control needs to be enabled via the 'LocalBusyIndicatorSupport'
	 * accordingly to the ListBox control (see the init-function of the
	 * ListBox).
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @public
	 * @since 1.11.0
	 * @deprecated Since version 1.14.2.
	 * The LocalBusyIndicator Control is not needed anymore by the new implementation of the LBI. Hence, it is not used anymore.
	 * @alias sap.ui.core.LocalBusyIndicator
	 */
	var LocalBusyIndicator = Control.extend("sap.ui.core.LocalBusyIndicator", /** @lends sap.ui.core.LocalBusyIndicator.prototype */ {
		metadata : {

			deprecated : true,
			library : "sap.ui.core",
			properties : {

				/**
				 * This property is the width of the control that has to
				 * be covered. With this width the position of the animation can be
				 * properly set.
				 */
				width : {type : "sap.ui.core.CSSSize", group : "Misc", defaultValue : '100px'},

				/**
				 * This property is the height of the control that has to
				 * be covered. With this height the position of the animation can be
				 * properly set.
				 */
				height : {type : "sap.ui.core.CSSSize", group : "Misc", defaultValue : '100px'}
			}
		},
		renderer: LocalBusyIndicatorRenderer
	});


	LocalBusyIndicator.prototype.init = function() {
		var sRoot = "sap.ui.core.LocalBusyIndicator:";

		var sParam = "sapUiLocalBusyIndicatorBoxSize";
		sParam = Parameters.get(sRoot + sParam);
		// this._iBoxSize = parseInt(sParam, 10);
		this._iBoxSize = 8;

		sParam = "sapUiLocalBusyIndicatorBoxColor";
		this._sBoxColor = Parameters.get(sRoot + sParam);

		sParam = "sapUiLocalBusyIndicatorBoxColorActive";
		this._sBoxColorActive = Parameters.get(sRoot + sParam);

		this._animateProxy = fnAnimate.bind(this);
	};

	LocalBusyIndicator.prototype.exit = function() {
		clearTimeout(this._delayedCallId);
		delete this._delayedCallId;
	};

	LocalBusyIndicator.prototype.onThemeChanged = function(oEvent) {
		if (this.getDomRef()) {
			this.invalidate();
		}
	};

	LocalBusyIndicator.prototype.onAfterRendering = function() {
		var w = parseInt(this.getWidth());
		var h = parseInt(this.getHeight());

		var $this = this.$();
		$this.css("width", w + "px");
		$this.css("height", h + "px");

		var $animation = this.$("animation");

		var left = Math.floor(w / 2);
		left -= Math.floor((5 * this._iBoxSize) / 2);

		var top = Math.floor(h / 2) - Math.floor(this._iBoxSize / 2);

		$animation.css("left", left + "px");
		$animation.css("top", top + "px");

		if (!this._$left) {
			this._$left = this.$("leftBox");
		}
		if (!this._$middle) {
			this._$middle = this.$("middleBox");
		}
		if (!this._$right) {
			this._$right = this.$("rightBox");
		}

		this._delayedCallId = setTimeout(this._animateProxy, 0);
	};

	var fnAnimate = function() {
		if (this.getDomRef()) {
			var that = this;
			var $left, $middle, $right;
			var color = "", colorActive = "";

			/*
			 * All this steps ensure that the control won't crash if during an
			 * animation the control was destroyed.
			 */
			if (that._$left) {
				$left = that._$left;
			} else {
				return;
			}
			if (that._$middle) {
				$middle = that._$middle;
			} else {
				return;
			}
			if (that._$right) {
				$right = that._$right;
			} else {
				return;
			}
			if (that._sBoxColor) {
				color = that._sBoxColor;
			} else {
				return;
			}
			if (that._sBoxColorActive) {
				colorActive = that._sBoxColorActive;
			} else {
				return;
			}

			$left.css("background-color", colorActive);

			setTimeout(function() {
				$left.css("background-color", color);

				$middle.css("background-color", colorActive);

				setTimeout(function() {
					$middle.css("background-color", color);

					$right.css("background-color", colorActive);

					setTimeout(function() {
						$right.css("background-color", color);
					}, 150);
				}, 150);
			}, 150);

			this._delayedCallId = setTimeout(this._animateProxy, 1200);
		}
	};

	return LocalBusyIndicator;

});