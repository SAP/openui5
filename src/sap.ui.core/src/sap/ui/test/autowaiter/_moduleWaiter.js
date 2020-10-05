/*!
 * ${copyright}
 */

/*global HTMLScriptElement */
sap.ui.define([
	"./WaiterBase",
	"sap/ui/thirdparty/jquery"
], function (WaiterBase, jQueryDOM) {
	"use strict";

	var STATE = {
		PENDING: "PENDING",
		LOADED: "LOADED",
		ERROR: "ERROR"
	};

	var ModuleWaiter = WaiterBase.extend("sap.ui.test.autowaiter._ModuleWaiter", {
		constructor: function () {
			// (see sap.ui.performance.trace.Interaction)
			/* As UI5 resources gets also loaded via script tags we need to
			 * intercept this kind of loading as well. We assume that changing the
			 * 'src' property indicates a resource loading via a script tag. In some cases
			 * the src property will be updated multiple times, so we should intercept
			 * the same script tag only once (dataset.sapUiTestModuleWaiterHandled)
			*/
			this._aModules = [];
			var that = this;
			var mSrcDescriptor = Object.getOwnPropertyDescriptor(HTMLScriptElement.prototype, "src");

			Object.defineProperty(HTMLScriptElement.prototype, "src", {
				set: function(val) {
					if (!this.dataset.sapUiTestModuleWaiterHandled) {
						var mNewModule = {
							src: val,
							state: STATE.PENDING,
							script: this
						};
						that._aModules.push(mNewModule);
						this.addEventListener("load", function() {
							mNewModule.state = STATE.LOADED;
							that._oLogger.trace("Script with src '" + val + "' loaded successfully");
						});
						this.addEventListener("error" , function() {
							mNewModule.state = STATE.ERROR;
							that._oLogger.trace("Script with src '" + val + "' failed to load");
						});
						this.dataset.sapUiTestModuleWaiterHandled = "true";
						that._oLogger.trace("Script with src '" + val + "' is tracked");
					}
					mSrcDescriptor.set.call(this, val);
				},
				get: mSrcDescriptor.get
			});

			WaiterBase.apply(this, arguments);
		},
		hasPending: function () {
			var aPendingModules = this._aModules.filter(function (mModule) {
				if (!jQueryDOM(mModule.script).length) {
					this._oLogger.trace("Script with src '" + mModule.src + "' was removed");
					return false;
				}
				if (mModule.script.noModule) {
					this._oLogger.trace("Script with src '" + mModule.src + "' and 'nomodule' will be ignored because the browser supports ES6 modules");
					return false;
				}
				return mModule.state === STATE.PENDING;
			}.bind(this));

			var bHasPendingModules = aPendingModules.length > 0;
			if (bHasPendingModules) {
				this._oHasPendingLogger.debug("There are " + aPendingModules.length + " modules still loading");
				aPendingModules.forEach(function (mModule) {
					this._oHasPendingLogger.debug("Pending module: " + mModule.src);
				}.bind(this));
			}
			return bHasPendingModules;
		}
	});

	return new ModuleWaiter();
});
