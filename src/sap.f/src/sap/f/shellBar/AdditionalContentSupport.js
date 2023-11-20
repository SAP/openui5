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

				this.validateAggregation("additionalContent", oControl, true);

				if (this.indexOfAdditionalContent(oControl) !== -1) {
					Log.warning("Object" + oControl + " is already added to ShellBar");
					return this;
				}

				this._aAdditionalContent.push(this._prepareNewAdditionalControl(oControl));
				this._updateParent();
				return this;
			};

			this.insertAdditionalContent = function (oControl, iIndex) {

				this.validateAggregation("additionalContent", oControl, true);

				if (this.indexOfAdditionalContent(oControl) !== -1) {
					Log.warning("Object" + oControl + " is already added to ShellBar");
					return this;
				}

				this._aAdditionalContent.splice(iIndex, 0, oControl);

				this._updateParent();
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
					i,
					_vObject = vObject;

				if (typeof (_vObject) === "string") { // ID of the object is given
					for (i = 0; i < this._aAdditionalContent.length; i++) {
						if (this._aAdditionalContent[i] && this._aAdditionalContent[i].getId() === _vObject) {
							_vObject = i;
							break;
						} else if (i === this._aAdditionalContent.length - 1) {
							_vObject = -1;
						}
					}
				}

				if (typeof (_vObject) === "object") { // the object itself is given or has just been retrieved
					for (i = 0; i < this._aAdditionalContent.length; i++) {
						if (this._aAdditionalContent[i] === _vObject) {
							_vObject = i;
							break;
						} else if (i === this._aAdditionalContent.length - 1) {
						_vObject = -1;
					}
					}
				}

				if (typeof (_vObject) === "number") { // "_vObject" is the index now
					if (_vObject < 0 || _vObject >= this._aAdditionalContent.length) {
						Log.warning("ShellBar.removeAggregation AdditionalContent called with invalid parameter for " +
							"non-existing object:, " + vObject);
						return null;
					} else {
						oChild = this._aAdditionalContent[_vObject];
						this._aAdditionalContent.splice(_vObject, 1); // first remove it from array, then call setParent (avoids endless recursion)

						oChild.setParent(null);
						this._updateParent();
						return oChild;
					}
				} else {
					return null;
				}
			};

			this.removeAllAdditionalContent = function () {
				var oChild,
					aChildren = this._aAdditionalContent,
					i;
				if (!aChildren) {
					return [];
				}

				this._aAdditionalContent = [];

				for (i = 0; i < aChildren.length; i++) {
					oChild = aChildren[i];
					oChild.setParent(null);
				}

				this._updateParent();
				return aChildren;
			};

			this.destroyAdditionalContent = function () {
				this._aAdditionalContent.forEach(this._destroyAllAdditionalContent, this);
				this._aAdditionalContent = [];
				this._updateParent();
				return this;
			};

			this._destroyAllAdditionalContent = function (oControl) {
				return oControl.destroy();
			};

			this.getAdditionalContent = function () {
				return this._aAdditionalContent;
			};

			this._updateParent = function () {
				this._bOTBUpdateNeeded = true;
				this.invalidate();
			};

		};

		return AdditionalContentSupport;

	});