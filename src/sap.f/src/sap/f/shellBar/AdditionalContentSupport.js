/*!
 * ${copyright}
 */

// Provides helper sap.f.shellBar.AdditionalContentSupport
sap.ui.define([
		"sap/m/OverflowToolbarLayoutData",
		"sap/base/Log",
		"sap/m/library"
	],
	function(
		OverflowToolbarLayoutData,
		Log,
		library
	) {
		"use strict";

		// shortcut for sap.m.OverflowToolbarPriority
		var OverflowToolbarPriority = library.OverflowToolbarPriority;

		/**
		 * @author SAP SE
		 * @version ${version}
		 *
		 * @private
		 * @since 1.64
		 * @alias sap.f.shellBar.AdditionalContentSupport
		 * @function
		 */
		var AdditionalContentSupport = function () {
			// "this" is the prototype now when called with call()

			// Ensure only Elements are enhanced
			if (!this.isA("sap.ui.core.Element")) {
				return;
			}

			this._prepareNewAdditionalControl = function (oControl) {
				if (!oControl.getLayoutData()) {
					oControl.setLayoutData(new OverflowToolbarLayoutData({
						priority: OverflowToolbarPriority.Low
					}));
				}
				return oControl;
			};

			this.addAdditionalContent = function (oControl) {
				if (!this._aAdditionalContent) {
					this._aAdditionalContent = [];
				}

				this._aAdditionalContent.push(this._prepareNewAdditionalControl(oControl));
				this._bOTBUpdateNeeded = true;
				return this;
			};

			this.insertAdditionalContent = function (oControl, iIndex) {
				var i;

				if (!this._aAdditionalContent) {
					this._aAdditionalContent = [];
				}

				if (iIndex < 0) {
					i = 0;
				} else if (iIndex > this._aAdditionalContent.length) {
					i = this._aAdditionalContent.length;
				} else {
					i = iIndex;
				}
				this._aAdditionalContent.splice(i, 0, oControl);

				this._bOTBUpdateNeeded = true;
				return this;
			};

			this.indexOfAdditionalContent = function (oControl) {
				for (var i = 0; i < this._aAdditionalContent.length; i++) {
					if (this._aAdditionalContent[i] === oControl) {
						return i;
					}
				}
				return -1;
			};

			this.removeAdditionalContent = function (vObject) {
				var oChild,
					i;

				if (typeof (vObject) === "string") { // ID of the object is given
					for (i = 0; i < this._aAdditionalContent.length; i++) {
						if (this._aAdditionalContent[i] && this._aAdditionalContent[i].getId() === vObject) {
							vObject = i;
							break;
						}
					}
				}

				if (typeof (vObject) === "object") { // the object itself is given or has just been retrieved
					for (i = 0; i < this._aAdditionalContent.length; i++) {
						if (this._aAdditionalContent[i] === vObject) {
							vObject = i;
							break;
						}
					}
				}

				if (typeof (vObject) === "number") { // "vObject" is the index now
					if (vObject < 0 || vObject >= this._aAdditionalContent.length) {
						Log.warning("ShellBar.removeAggregation called with invalid index: AdditionalContent, " + vObject);
					} else {
						oChild = this._aAdditionalContent[vObject];
						this._aAdditionalContent.splice(vObject, 1); // first remove it from array, then call setParent (avoids endless recursion)
						oChild.setParent(null);
					}
				}

			};

			this.destroyAdditionalContent = function (oControl) {
				return this;
			};

			this.getAdditionalContent = function () {
				return this._aAdditionalContent;
			};

		};

		return AdditionalContentSupport;

	});