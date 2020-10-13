/*
 * ! ${copyright}
 */

/**
 * Utilities for QUnit tests in MDC
 *
 * @private
 */
sap.ui.define(function() {
	"use strict";

	function stubFetchProperties(aPropertyInfos, oTarget) {
		var fnOriginalGetControlDelegate = oTarget.getControlDelegate;
		var oDelegate;
		var fnOriginalFetchProperties;

		restoreFetchProperties(oTarget);

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

		var fnGetControlDelegate = oTarget.getControlDelegate;
		oTarget.getControlDelegate = function() {
			return getDelegate.call(this);
		};
		oTarget.getControlDelegate.restore = function() {
			oTarget.getControlDelegate = fnGetControlDelegate;
		};

		var fnAwaitControlDelegate = oTarget.awaitControlDelegate;
		oTarget.awaitControlDelegate = function() {
			return Promise.resolve(getDelegate.call(this));
		};
		oTarget.awaitControlDelegate.restore = function() {
			oTarget.awaitControlDelegate = fnAwaitControlDelegate;
		};

		oTarget.__restoreFetchProperties = function() {
			delete oTarget.__restoreFetchProperties;
			if (oTarget.awaitControlDelegate.restore) {
				oTarget.awaitControlDelegate.restore();
			}
			if (oTarget.getControlDelegate.restore) {
				oTarget.getControlDelegate.restore();
			}
			oDelegate.fetchProperties = fnOriginalFetchProperties;
		};
	}

	function restoreFetchProperties(oTarget) {
		if (oTarget.__restoreFetchProperties) {
			oTarget.__restoreFetchProperties();
		}
	}

	return {
		stubFetchProperties: stubFetchProperties,
		restoreFetchProperties: restoreFetchProperties
	};
});