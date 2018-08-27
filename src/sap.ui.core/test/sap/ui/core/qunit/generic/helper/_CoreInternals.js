sap.ui.define([], function() {
	"use strict";

	var oCoreInternals;

	// get access to the real core object to access the control list
	sap.ui.getCore().registerPlugin({
		startPlugin: function(oRealCore) {
			oCoreInternals = oRealCore;
		},
		stopPlugin: function() {
			oCoreInternals = undefined;
		}
	});

	return {
		snapshotOfElements: function() {
			return Object.assign({}, oCoreInternals.mElements);
		},
		forEachElement: function(callback) {
			var mElements = oCoreInternals.mElements;
			for (var sId in mElements) {
				callback(mElements[sId], sId);
			}
		}
	};

});
