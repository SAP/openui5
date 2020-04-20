/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/ui/base/ManagedObject",
	"sap/ui/testrecorder/Constants"
], function ($, ManagedObject, constants) {
	"use strict";

	var MutationObserver = ManagedObject.extend("sap.ui.testrecorder.mutationObservers.MutationObserver", {
		constructor: function (fnCallback) {
			this._fnObservationCb = fnCallback;
			this._observer = new window.MutationObserver(this._onObservation.bind(this));
		},
		start: function (oTarget) {
			this._oTarget = oTarget || document.body; // save to use later in observations
			this._observer.observe(this._oTarget, this._getOptions());
		},
		stop: function () {
			this._observer.disconnect();
		},

		// methods thatshould be overwritten by extending modules

		_getOptions: function () {
			return {};
		},
		_onObservation: function (aMutations) {
			if (this._isValidMutation(aMutations)) {
				this._fnObservationCb();
			}
		},

		// utilities

		_isValidMutation: function (aMutations) {
			var isValidMutation = true;
			aMutations.forEach(function (oMutation) {
				if (this._isRecorderElement(oMutation)) {
					isValidMutation = false;
				}
			}.bind(this));
			return isValidMutation;
		},
		_isRecorderElement: function (oMutation) {
			return [constants.HIGHLIGHTER_ID, constants.CONTEXTMENU_ID].filter(function (sId) {
				return oMutation.target.id === sId || (oMutation.addedNodes.length && oMutation.addedNodes[0].id === sId) ||
					(oMutation.removedNodes.length && oMutation.removedNodes[0].id === sId);
			}).length;
		}

	});

	return MutationObserver;
});
