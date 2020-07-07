/*!
 * ${copyright}
 */

sap.ui.define([], function () {
	"use strict";
	/**
	 *
	 * @constructor
	 */
	function Tooltip (oParent) {
		this.oContainer = document.createElement('div');
		this.oContainer.classList.add("area-tooltip");

		if (oParent) {
			this.attachTo(oParent);
		}
	}

	/**
	 * Sets the container where the tooltip will be attached to
	 * @param oParent {HTMLElement}
	 */
	Tooltip.prototype.attachTo = function (oParent) {
		this.oParent = oParent;
		this.oParent.appendChild(this.oContainer);
	};

	/**
	 * Sets the text to be displayed in tooltip container
	 * @param sText {string}
	 */
	Tooltip.prototype.setText = function (sText) {
		this.oContainer.innerText = sText;
	};

	/**
	 * Return the bounds of the tooltip container
	 * @return {{offsetHeight: number, offsetWidth: number}}
	 */
	Tooltip.prototype.getBounds = function () {
		return {
			offsetHeight: this.oContainer.offsetHeight,
			offsetWidth: this.oContainer.offsetWidth
		};
	};

	/**
	 * Sets the tooltip container top and left style properties
	 * @param oPosition {{top: number|string, left: number|string}}
	 */
	Tooltip.prototype.setPosition = function (oPosition) {
		// position the tooltip at center and on top of mouse position relative to the hovered element
		this.oContainer.style.top = oPosition.top + 'px';
		this.oContainer.style.left = oPosition.left + 'px';
	};

	Tooltip.prototype.show = function () {
		this.oContainer.style.opacity = "1";
	};

	Tooltip.prototype.hide = function () {
		this.oContainer.style.opacity = "0";
	};

	return Tooltip;
});