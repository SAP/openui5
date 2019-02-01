/*!
 * ${copyright}
 */
/*
 * IMPORTANT: This is a private module, its API must not be used and is subject to change.
 * Code other than the OpenUI5 libraries must not introduce dependencies to this module.
 */
sap.ui.define([], function() {
	"use strict";

	/**
	 * @class SafeObject.
	 *
	 * Wraps a object and exposes safe setters and getters which won't throw error
	 * if the wrapped object is invalid.
	 *
	 * @example
	 * sap.ui.require(["sap/f/shellBar/SafeObject"], function(SafeObject){
	 *      var wObject = new SafeObject(undefined);
	 *      wObject.setWidth(100);
	 * });
	 *
	 * @param {object|undefined} oControl the wrapped object
	 *
	 * @alias module:sap/f/shellBar/SafeObject
	 * @since 1.63
	 * @experimental Since 1.63. This class is experimental and provides only limited functionality. Also the API might be changed in future.
	 * @private
	 */
	var SafeObject = function (oControl) {
		this._oControl = oControl;
		this.getWidth = function () {
			if (this._oControl && this._oControl.$().length) {
				return this._oControl.$().width();
			} else {
				return 0;
			}
		};
		this.setWidth = function (iWidth) {
			if (this._oControl) {
				this._oControl.setWidth(iWidth);
			}
			return this;
		};
		this.setVisible = function (bVisible) {
			if (this._oControl) {
				this._oControl.setVisible(bVisible);
			}
			return this;
		};
		this.getVisible = function () {
			if (this._oControl) {
				return this._oControl.getVisible();
			}
		};
		this.setIcon = function (sIcon) {
			if (this._oControl) {
				this._oControl.setIcon(sIcon);
			}
			return this;
		};
		this.setText = function (sText) {
			if (this._oControl) {
				this._oControl.setText(sText);
			}
			return this;
		};
	};

	return SafeObject;
});
