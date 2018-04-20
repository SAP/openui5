/*!
 * ${copyright}
 */

/*global window */

sap.ui.define([],
function () {
	"use strict";

	var oCore;
	sap.ui.getCore().registerPlugin({
		startPlugin: function(oCoreFromPlugin) {
			oCore = oCoreFromPlugin;
		}
	});

	/**
	 * @class A Plugin to access the UI5 Core
	 * This class is containing the core functionality of the OpaPlugin to avoid circular dependencies,
	 * since the OpaPlugin uses Interactable to filter
	 *
	 * @private
	 * @alias sap.ui.test._opaCorePlugin
	 * @author SAP SE
	 */
	return {
		/**
		 * Gets all the controls of a certain type that are currently instantiated.
		 * If the control type is omitted, nothing is returned.
		 *
		 * @param {Function} [fnConstructorType] the control type, e.g: sap.m.CheckBox
		 * @returns {Array} an array of the found controls (can be empty)
		 * @private
		 */
		getAllControls: function (fnConstructorType) {
			var oControl,
				sPropertyName,
				aResult = [],
				oCoreElements = this.getCoreElements();

			//Performance critical
			for (sPropertyName in oCoreElements) {
				if (!oCoreElements.hasOwnProperty(sPropertyName)) {
					continue;
				}

				oControl = oCoreElements[sPropertyName];

				if (this.checkControlType(oControl, fnConstructorType)) {
					aResult.push(oControl);
				}
			}

			return aResult;
		},

		checkControlType: function (oControl, fnControlType) {
			if (fnControlType) {
				return oControl instanceof fnControlType;
			} else {
				return true;
			}
		},

		getCoreElements: function () {
			var oElements = {};

			if (!oCore) {
				return oElements;
			}

			return oCore.mElements || oElements;
		},

		isUIDirty: function () {
			return oCore && oCore.getUIDirty();
		}
	};
}, /* bExport= */ true);

