sap.ui.define(["sap/ui/performance/BeaconRequest"], function(BeaconRequest) {
    "use strict";

    var beaconRequest = new BeaconRequest({
        url: parent.location.href
    });

    beaconRequest.append("key", "value");
    beaconRequest.append("key", "value");
    beaconRequest.append("key", "value");

    beaconRequest.send = function() {
        parent.postMessage({
            sendTo: parent.location.href,
            numberOfEntries: this.getBufferLength()
        });
    };
});