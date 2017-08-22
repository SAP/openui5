/*!
 * ${copyright}
 */

sap.ui.define([
	'jquery.sap.global'
],
function(jQuery) {
	"use strict";

	var module = {};

	/**
	 * CSS Transition helper
	 * @param {jQuery} $element - jQuery element(s)
	 * @param {Function} fnCallback - The function should start animation process (e.g. by adding class to the element)
	 * @return {Promise} Returns a Promise performing the animation
	 */
	module.waitTransition = function ($element, fnCallback) {
		if (!($element instanceof jQuery)) {
			throw new Error('$element should be wrapped into jQuery object');
		}
		if (!jQuery.isFunction(fnCallback)) {
			throw new Error('fnCallback should be a function');
		}

		return new Promise(function (fnResolve) {
			$element.one('transitionend', fnResolve);

			// perform animation in the next animation frame, normally 16-17ms later.
			var iTimestampInitial;
			var fnAnimCallback = function (iTimestamp) {
				if (!iTimestampInitial) {
					iTimestampInitial = iTimestamp;
				}
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
