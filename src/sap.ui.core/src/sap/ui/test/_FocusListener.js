/*!
 * ${copyright}
 */

sap.ui.define(["./autowaiter/_utils"
], function (_utils) {
	"use strict";

	var oLastFocusedElement,
		oLastBlurredElement;

	_utils.onElementAvailable("body", function(oRootDomNode) {
		oRootDomNode.addEventListener("focus", function(oEvent) {
			oLastFocusedElement = oEvent.target;
		}, true);
		oRootDomNode.addEventListener("blur", function(oEvent) {
			oLastBlurredElement = oEvent.target;
		}, true);
	});

	return {
		/**
		 * Returns the target element of the last <code>focus</code> event.
		 *
		 * The difference with <code>document.activeElement</code> is that
		 * it also covers the cases when the test fires articifial <code>focus</code>
		 * events.
		 *
		 * So this function will return the target of the last either artificial
		 * (a.k.a. untrusted) or real (a.k.a. trusted) <code>focus</code> event.
		 * @returns {object} the DOM eelement
		 * @private
		 */
		getLastFocusedElement: function () {
			return oLastFocusedElement;
		},
		/**
		 * Returns the target element of the last <code>blur</code> event,
		 * either real (a.k.a. trusted) or artificial (a.k.a. untrusted).
		 * @returns {object} the DOM eelement
		 * @private
		 */
		getLastBlurredElement: function () {
			return oLastBlurredElement;
		}
	};
}, true);