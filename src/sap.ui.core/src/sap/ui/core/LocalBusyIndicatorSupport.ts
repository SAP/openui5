import Control from "./Control";
import Log from "sap/base/Log";
var LocalBusyIndicatorSupport = function () {
    if (this === Control.prototype) {
        this.setDelay = this.setBusyIndicatorDelay;
    }
    else {
        Log.error("Only controls can use the LocalBusyIndicator", this);
    }
};