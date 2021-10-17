var BeaconRequest = function (option) {
    option = option || {};
    if (!BeaconRequest.isSupported()) {
        throw Error("Beacon API is not supported");
    }
    if (typeof option.url !== "string") {
        throw Error("Beacon url must be valid");
    }
    this._nMaxBufferLength = option.maxBufferLength || 10;
    this._aBuffer = [];
    this._sUrl = option.url;
    document.addEventListener("visibilitychange", function () {
        if (document.visibilityState === "hidden") {
            this.send();
        }
    }.bind(this));
    window.addEventListener("beforeunload", function () {
        this.send();
    }.bind(this));
};
BeaconRequest.isSupported = function () {
    return "navigator" in window && "sendBeacon" in window.navigator && "Blob" in window;
};
BeaconRequest.prototype.append = function (key, value) {
    this._aBuffer.push({ key: key, value: value });
    if (this.getBufferLength() === this._nMaxBufferLength) {
        this.send();
    }
};
BeaconRequest.prototype.getBufferLength = function () {
    return this._aBuffer.length;
};
BeaconRequest.prototype.send = function () {
    if (this.getBufferLength()) {
        var sBody = this._aBuffer.reduce(function (sResult, oEntry) {
            sResult += "&" + oEntry.key + "=" + oEntry.value;
            return sResult;
        }, "sap-fesr-only=1");
        var oBeaconDataToSend = new Blob([sBody], {
            type: "application/x-www-form-urlencoded;charset=UTF-8"
        });
        window.navigator.sendBeacon(this._sUrl, oBeaconDataToSend);
        this.clear();
    }
};
BeaconRequest.prototype.clear = function () {
    this._aBuffer = [];
};