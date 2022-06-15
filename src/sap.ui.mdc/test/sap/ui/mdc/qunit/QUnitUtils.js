/*!
 * ${copyright}
 */

/**
 * Utilities for QUnit tests in MDC
 *
 * @private
 */
sap.ui.define(function() {
	"use strict";

	function stubPropertyInfos(oTarget, aPropertyInfos) {
		var fnOriginalGetControlDelegate = oTarget.getControlDelegate;
		var fnOriginalAwaitControlDelegate = oTarget.awaitControlDelegate;
		var oDelegate;
		var fnOriginalFetchProperties;
		var bPropertyHelperExists;

		if (typeof fnOriginalGetControlDelegate !== "function") {
			throw new Error("The target cannot be stubbed. " + oTarget);
		}

		if (oTarget.__restorePropertyInfos) {
			throw new Error("The target is already stubbed. " + oTarget);
		}

		if (typeof oTarget.getPropertyHelper === "function") {
			bPropertyHelperExists = !!oTarget.getPropertyHelper();

			if (bPropertyHelperExists) {
				throw new Error("The target cannot be stubbed if the property helper is already initialized. " + oTarget);
			}
		}

		function getDelegate() {
			if (oDelegate) {
				return oDelegate;
			}

			oDelegate = fnOriginalGetControlDelegate.apply(this, arguments);
			fnOriginalFetchProperties = oDelegate.fetchProperties;

			oDelegate.fetchProperties = function() {
				fnOriginalFetchProperties.apply(this, arguments);
				return Promise.resolve(aPropertyInfos);
			};
			return oDelegate;
		}

		oTarget.getControlDelegate = function() {
			return getDelegate.call(this);
		};

		oTarget.awaitControlDelegate = function() {
			return fnOriginalAwaitControlDelegate.apply(this, arguments).then(function() {
				return getDelegate.call(this);
			}.bind(this));
		};

		oTarget.__restorePropertyInfos = function() {
			delete oTarget.__restorePropertyInfos;
			oTarget.getControlDelegate = fnOriginalGetControlDelegate;
			oTarget.awaitControlDelegate = fnOriginalAwaitControlDelegate;

			if (oDelegate) {
				oDelegate.fetchProperties = fnOriginalFetchProperties;
			}
		};
	}

	function restorePropertyInfos(oTarget) {
		if (oTarget.__restorePropertyInfos) {
			oTarget.__restorePropertyInfos();
		}
	}

	return {
		stubPropertyInfos: stubPropertyInfos,
		restorePropertyInfos: restorePropertyInfos
	};
});