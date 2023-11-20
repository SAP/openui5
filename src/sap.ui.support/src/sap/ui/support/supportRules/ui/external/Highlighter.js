/*!
 * ${copyright}
 */

sap.ui.define([],
	function () {
		"use strict";

		var Highlighter = function (sId) {
			// ID of the highlighter DOM element
			this._sId = sId;
			// Reference for the highlighter DOM element
			this._highLighter = document.getElementById(this._sId) || null;
		};

		/**
		 * Set the position of the visual highlighter.
		 * @param {string} elementId - The ID of the DOM element that will be highlighted
		 * @returns {object} highlighter isntance
		 */
		Highlighter.prototype.highlight = function (elementId) {
			if (this._highLighter) {
				this.showHighLighter();
			} else {
				this._createHighLighter();
			}

			var highlighter = this._highLighter.firstElementChild;
			var targetDomElement = document.getElementById(elementId);

			if (targetDomElement) {
				var targetRect = targetDomElement.getBoundingClientRect();

				highlighter.style.top = targetRect.top + "px";
				highlighter.style.left = targetRect.left + "px";
				highlighter.style.height = targetRect.height + "px";
				highlighter.style.width = targetRect.width + "px";
			}

			return this;
		};

		/**
		 * Hide the highlighter.
		 */
		Highlighter.prototype.hideHighLighter = function () {
			this._highLighter.style.display = "none";
		};

		/**
		 * Show the highlighter.
		 */
		Highlighter.prototype.showHighLighter = function () {
			this._highLighter.style.display = "block";
		};

		/**
		 * Create DOM element for visual highlighting.
		 * @private
		 */
		Highlighter.prototype._createHighLighter = function () {
			var highLighterRect = document.createElement("div");

			highLighterRect.style.cssText = "box-sizing: border-box;border:1px solid blue;background: rgba(20, 20, 200, 0.4);position: absolute";

			var highLighter = document.createElement("div");

			highLighter.id = this._sId;
			highLighter.style.cssText = "position: fixed;top:0;right:0;bottom:0;left:0;z-index: 1000;overflow: hidden;";
			highLighter.appendChild(highLighterRect);

			document.body.appendChild(highLighter);

			highLighter.onmousemove = this.hideHighLighter.bind(this);

			this._highLighter = highLighter;
		};

		/**
		 * Highlight controls.
		 * @type {{setDimensions: Function}}
		 */
		return Highlighter;
	});
