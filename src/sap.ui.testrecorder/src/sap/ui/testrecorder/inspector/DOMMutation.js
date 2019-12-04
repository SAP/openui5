/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/ui/base/ManagedObject",
	"sap/ui/testrecorder/Constants"
], function ($, ManagedObject, constants) {
	"use strict";

	var DOMMutation = ManagedObject.extend("sap.ui.testrecorder.inspector.DOMMutation", {
		constructor: function (fnOnMutation) {
			this._observer = new window.MutationObserver(function (aMutations) {
				var isMutationValid = true;
				aMutations.forEach(function (oMutation) {
					if (_isRecorderElement(oMutation, constants.HIGHLIGHTER_ID) || _isRecorderElement(oMutation, constants.CONTEXTMENU_ID)) {
						isMutationValid = false;
					}
				});

				if (isMutationValid) {
					fnOnMutation();
				}
			});
		},
		start: function () {
			this._observer.observe(document.body, {
				subtree: true,
				childList: true
			});
		},
		stop: function () {
			this._observer.disconnect();
		}
	});

	function _isRecorderElement (oMutation, sId) {
		return oMutation.target.id === sId || (oMutation.addedNodes.length && oMutation.addedNodes[0].id === sId) || (oMutation.removedNodes.length && oMutation.removedNodes[0].id === sId);
	}

	return DOMMutation;
});
