/*!
 * ${copyright}
 */

sap.ui.define([
],
function() {
	"use strict";

	var module = {};

	/**
	 * CSS Transition helper
	 * @param {HTMLElement} oElement - Element
	 * @param {Function} fnCallback - The function should start animation process (e.g. by adding class to the element)
	 * @return {Promise} Returns a Promise performing the animation
	 */
	module.waitTransition = function(oElement, fnCallback) {
		if (typeof fnCallback !== "function") {
			throw new Error("fnCallback should be a function");
		}

		return new Promise(function(fnResolve) {
			oElement.addEventListener("transitionend", fnResolve, {once: true});

			// perform animation in the next animation frame, normally 16-17ms later.
			var iTimestampInitial;
			var fnAnimCallback = function(iTimestamp) {
				iTimestampInitial ||= iTimestamp;
				if (iTimestamp !== iTimestampInitial) {
					fnCallback();
				} else {
					window.requestAnimationFrame(fnAnimCallback);
				}
			};
			window.requestAnimationFrame(fnAnimCallback);
		});
	};

	return module;
}, true);