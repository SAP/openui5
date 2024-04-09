/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/test/OpaPlugin",
	"sap/ui/core/Element",
	"sap/ui/core/IntervalTrigger",
	"./WaiterBase"
], function(OpaPlugin, Element, IntervalTrigger, WaiterBase) {
	"use strict";

	var oState = {
		NAVIGATING: "NAVIGATING",
		NAVIGATION_END: "NAVIGATION_END"
	};

	var TIMEOUT = 1000; //ms

	var NavigationContainerWaiter = WaiterBase.extend("sap.ui.test.autowaiter._navigationContainerWaiter", {
		constructor: function() {
			WaiterBase.apply(this, arguments);
			this._bIsTracking = false;
			this._oTrackedNavigations = new Map();
			this._initTracking();
		},

		_initTracking: function() {
			if (this._bIsTracking) {
				// tracking already initialized
				return;
			}
			var fnNavContainer = sap.ui.require("sap/m/NavContainer");
			// no Nav container has been loaded - continue
			if (!fnNavContainer) {
				return;
			}

			// instanceof filter
			function isNavContainer(oControl) {
				return oControl instanceof fnNavContainer;
			}

			OpaPlugin.getElementRegistry().filter(isNavContainer).some(function (oNavContainer) {
				if (oNavContainer._bNavigating) {
					this._register(oNavContainer, oState.NAVIGATING);
				}
			}.bind(this));

			this._trackNavigationStart(fnNavContainer);
			this._trackNavigationEnd(fnNavContainer);

			// deregister only at the next time-interval following navigation-end,
			// to ensure the ResizeHandler also completed its notifications to listeners
			IntervalTrigger.addListener(this._deregisterAllEndedNavigations, this);

			this._bIsTracking = true;
		},

		_trackNavigationStart: function(fnNavContainer) {
			var fnOriginalFireNavigate = fnNavContainer.prototype.fireNavigate,
				fnRegisterNavigation = this._register.bind(this);
			fnNavContainer.prototype.fireNavigate = function() {
				var bContinue = fnOriginalFireNavigate.apply(this, arguments);
				if (bContinue) {
					fnRegisterNavigation(this.getId(), oState.NAVIGATING);
				}
				return bContinue;
			};
		},

		_trackNavigationEnd: function(fnNavContainer) {
			var fnOriginalAfterFireNavigate = fnNavContainer.prototype.fireAfterNavigate,
				fnRegisterAfterNavigation = this._register.bind(this);
			fnNavContainer.prototype.fireAfterNavigate = function() {
				var oResult;
				try {
					oResult = fnOriginalAfterFireNavigate.apply(this, arguments);
				} finally {
					fnRegisterAfterNavigation(this.getId(), oState.NAVIGATION_END);
				}
				return oResult;
			};
		},

		_register(sId, sState) {
			this._oLogger.trace("register", "ID: " + sId + " Reason: " + sState);
			this._oTrackedNavigations.set(sId, {state: sState});

			setTimeout(function() {
				if (this._oTrackedNavigations.has(sId)) {
					this._deregister(sId);
				}
			}.bind(this), TIMEOUT, 'TIMEOUT_WAITER_IGNORE');
		},

		_deregister(sId) {
			this._oLogger.trace("deregister", "ID: " + sId + " Reason: " + oState.NAVIGATION_END);
			this._oTrackedNavigations.delete(sId);
		},

		_deregisterAllEndedNavigations() {
			this._oTrackedNavigations.forEach(function(oEntry, sId) {
				if (oEntry.state === oState.NAVIGATION_END) {
					this._deregister(sId);
				}
			}, this);
		},

		hasPending: function () {
			var bHasPending = false;
			this._initTracking();
			this._oTrackedNavigations.forEach(function(oEntry, sId) {
				this._oHasPendingLogger.debug("The NavContainer " + Element.getElementById(sId) + " is currently navigating");
				bHasPending = true;
			}, this);

			return bHasPending;
		}
	});

	return new NavigationContainerWaiter();
});
