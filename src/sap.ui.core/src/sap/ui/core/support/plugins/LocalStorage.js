/*!
 * ${copyright}
 */

// Provides class sap.ui.core.support.plugins.LocalStorage (support plugin for functionality related to localStorage that should be executed on the app side)
sap.ui.define(['sap/ui/core/support/Plugin', "sap/base/Log"],
	function(Plugin, Log) {
	"use strict";


		/**
		 * Creates an instance of sap.ui.core.support.plugins.LocalStorage.
		 * @class This class represents the LocalStorage plugin for the support tool functionality of UI5. This class is internal and all its functions must not be used by an application.
		 *
		 * @extends sap.ui.core.support.Plugin
		 * @version ${version}
		 * @private
		 * @alias sap.ui.core.support.plugins.LocalStorage
		 */
		var LocalStorage = Plugin.extend("sap.ui.core.support.plugins.LocalStorage", {
			constructor : function(oSupportStub) {
				Plugin.apply(this, ["sapUiSupportLocalStorage", "", oSupportStub]);

				this._oStub = oSupportStub;
				this._aEventIds = [this.getId() + "GetItem", this.getId() + "SetItem"];
			}
		});

		LocalStorage.prototype.isToolPlugin = function(){
			return false;
		};

		/**
		 * Handler for sapUiSupportLocalStorageGetItem event
		 * Calls the callback in any case with a string (might be an empty one if error occurred or item does not exist)
		 * and passes on the "passThroughData" event parameter to the callback
		 *
		 * @param {sap.ui.base.Event} oEvent the event
		 * @private
		 */
		LocalStorage.prototype.onsapUiSupportLocalStorageGetItem = function(oEvent) {
			var sItemId = oEvent.getParameter("id"),
				sPassThroughData = oEvent.getParameter("passThroughData"),
				sValue = "";

			try { // Necessary for FF when Cookies are disabled
				sValue = window.localStorage.getItem(sItemId);
				if (!sValue || sValue === "undefined") {
					sValue = "";
				}
			} catch (e) {
				Log.error("Could not get item '" + sItemId + "' from localStorage: " + e.message);
				sValue = "";
			}

			// send callback event
			this._oStub.sendEvent(oEvent.getParameter("callback"), {
				value: sValue,
				passThroughData: sPassThroughData
			});
		};

		/**
		 * Handler for sapUiSupportLocalStorageSetItem event
		 *
		 * @param {sap.ui.base.Event} oEvent the event
		 * @private
		 */
		LocalStorage.prototype.onsapUiSupportLocalStorageSetItem = function(oEvent) {
			var sItemId = oEvent.getParameter("id"),
				sValue = oEvent.getParameter("value");

			try { // Necessary for FF when Cookies are disabled
				window.localStorage.setItem(sItemId, sValue);
			} catch (e) {
				Log.error("Could not write to localStorage: '" + sItemId + "' : '" + sValue + "': " + e.message);
			}
		};

	return LocalStorage;

});