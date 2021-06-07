/*!
 * ${copyright}
 */

/*global HTMLElement */
sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/ui/base/ManagedObject",
	"sap/ui/testrecorder/Constants",
	"sap/base/util/restricted/_debounce"
], function ($, ManagedObject, constants, _debounce) {
	"use strict";

	var MutationObserver = ManagedObject.extend("sap.ui.testrecorder.mutationObservers.MutationObserver", {
		metadata: {
			library: "sap.ui.testrecorder"
		},
		constructor: function (fnCallback) {
			ManagedObject.call(this);
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
			return _debounce(function () {
				this._isValidMutation(aMutations).then(function (bIsValidMutation) {
					if (bIsValidMutation) {
						this._fnObservationCb();
					}
				}.bind(this)).catch(function (oError) {
					throw new Error("Erro in mutation observer: " + oError);
				});
			}.bind(this), 100)();
		},

		// utilities

		_isValidMutation: function (aMutations) {
			return Promise.all(aMutations.map(function (oMutation) {
				return new Promise(function (resolve, reject) {
					if (this._isRecorderElement(oMutation)) {
						resolve(false);
					} else {
						this._hasHiddenElements(oMutation).then(function (bHasHiddenElements) {
							resolve(!bHasHiddenElements);
						}).catch(reject);
					}
				}.bind(this));
			}.bind(this))).then(function (aResult) {
				// observation is valid only if all mutations are valid
				return aResult.every(Boolean);
			});
		},
		// ignore changes in test recorded elements such as highlight and context menu
		_isRecorderElement: function (oMutation) {
			return [constants.HIGHLIGHTER_ID, constants.CONTEXTMENU_ID].filter(function (sId) {
				return oMutation.target.id === sId || (oMutation.addedNodes.length && oMutation.addedNodes[0].id === sId) ||
					(oMutation.removedNodes.length && oMutation.removedNodes[0].id === sId);
			}).length;
		},
		// ignore change if all newly introduced elements are hidden
		_hasHiddenElements: function (oMutation) {
			return new Promise(function (resolve) {
				if (!oMutation.addedNodes.length) {
					resolve(false);
				}
				Promise.all(Array.prototype.map.call(oMutation.addedNodes, function (oNode) {
					return new Promise(function (resolve) {
						this._waitForElement(oNode)().then(function () {
							resolve(this._isHidden(oNode));
						}.bind(this)).catch(function () {
							// if element never appeared, mark it as hidden
							resolve(true);
						});
					}.bind(this));
				}.bind(this))).then(function (aResult) {
					// a mutation is valid only if all of its addedNodes are visible
					resolve(aResult.some(Boolean));
				});
			}.bind(this));
		},
		_waitForElement: function (oNode) {
			return function (iCallCount) {
				iCallCount = iCallCount || 5;
				return new Promise(function (resolve, reject) {
					if (oNode instanceof HTMLElement) {
						resolve();
					} else if (!iCallCount) {
						reject();
					} else {
						setTimeout(this._waitForElement(iCallCount - 1), 100);
					}
				});
			};
		},
		_isHidden: function (oNode) {
			var $node = $(oNode);
			return $node.is(":hidden") || $node.css("visibility") === "hidden";
		}

	});

	return MutationObserver;
});
