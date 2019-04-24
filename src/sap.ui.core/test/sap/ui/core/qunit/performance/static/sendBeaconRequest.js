(function () {
	"use strict";

	// Must be loaded sync at the moment to wait for script initialization
	// TODO: Need to be replaced by
	var BeaconRequest = sap.ui.requireSync("sap/ui/performance/BeaconRequest");

	var beaconRequest = new BeaconRequest({
		url: parent.location.href
	});

	beaconRequest.append("key", "value");
	beaconRequest.append("key", "value");
	beaconRequest.append("key", "value");

	beaconRequest.send = function () {
		parent.postMessage({
			sendTo: parent.location.href,
			numberOfEntries: this.getBufferLength()
		}, parent.location.origin);
	};

})();