sap.ui.require(["sap/ui/performance/BeaconRequest"], function(BeaconRequest) {
	"use strict";

	var beaconRequest = new BeaconRequest({
		url: parent.location.href
	});

	beaconRequest.send = function () {
		parent.postMessage({
			token: "called"
		}, parent.location.origin);
	};

	parent.postMessage({
		token: "arranged"
	}, parent.location.origin);

});