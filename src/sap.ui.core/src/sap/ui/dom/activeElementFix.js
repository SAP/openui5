/*!
 * ${copyright}
 */
/*
 * IMPORTANT: This is a private module, its API must not be used and is subject to change.
 * Code other than the OpenUI5 libraries must not introduce dependencies to this module.
 */

sap.ui.define(["sap/base/Log"], function(Log) {
	"use strict";

	/*
	 * Fix for accessing <code>document.activeElement</code> synchronously from within an iframe while that iframe is loading.
	 * In IE11 and some versions of Edge this leads to an "Unspecified error" exception.
	 *
	 * This code will suppress that exception.
	 */
	return function() {
		var desc = Object.getOwnPropertyDescriptor(Document.prototype, 'activeElement');
		if (!desc) {
			Log.warning("activeElementFix: Unable to retrieve property descriptor for 'Document.prototype.activeElement'");
			return;
		}

		var getActiveElement = desc.get;
		if (!getActiveElement) {
			Log.warning("activeElementFix: Unable to retrieve getter of property 'Document.prototype.activeElement'");
			return;
		}

		Object.defineProperty(Document.prototype, 'activeElement', {
			configurable: true,
			enumerable: true,
			get: function() {
				try {
					return getActiveElement.call(this);
				} catch (e) {
					return null;
				}
			}
		});
	};
});
