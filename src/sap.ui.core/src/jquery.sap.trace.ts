import jQuery from "jquery.sap.global";
import Passport from "sap/ui/performance/trace/Passport";
import Interaction from "sap/ui/performance/trace/Interaction";
import FESR from "sap/ui/performance/trace/FESR";
import Log from "sap/base/Log";
function logSupportWarning() {
    if (!(window.performance && window.performance.getEntries)) {
        Log.warning("Interaction tracking is not supported on browsers with insufficient performance API");
    }
}
jQuery.sap.interaction = {};
jQuery.sap.interaction.setActive = function () {
    logSupportWarning();
    Interaction.setActive.apply(this, arguments);
};
jQuery.sap.interaction.getActive = Interaction.getActive;
jQuery.sap.interaction.notifyStepStart = Interaction.notifyStepStart;
jQuery.sap.interaction.notifyStepEnd = Interaction.notifyStepEnd;
jQuery.sap.interaction.notifyEventStart = Interaction.notifyEventStart;
jQuery.sap.interaction.notifyScrollEvent = Interaction.notifyScrollEvent;
jQuery.sap.interaction.notifyEventEnd = Interaction.notifyEventEnd;
jQuery.sap.interaction.setStepComponent = Interaction.setStepComponent;
jQuery.sap.fesr = {};
jQuery.sap.fesr.setActive = function () {
    logSupportWarning();
    FESR.setActive.apply(this, arguments);
};
jQuery.sap.fesr.getActive = FESR.getActive;
jQuery.sap.fesr.getCurrentTransactionId = Passport.getTransactionId;
jQuery.sap.fesr.getRootId = Passport.getRootId;
jQuery.sap.fesr.addBusyDuration = Interaction.addBusyDuration;
jQuery.sap.passport = {};
jQuery.sap.passport.setActive = Passport.setActive;
jQuery.sap.passport.traceFlags = Passport.traceFlags;
function getInitialFESRState() {
    var bActive = !!document.querySelector("meta[name=sap-ui-fesr][content=true]"), aParamMatches = window.location.search.match(/[\?|&]sap-ui-(?:xx-)?fesr=(true|x|X|false)&?/);
    if (aParamMatches) {
        bActive = aParamMatches[1] && aParamMatches[1] != "false";
    }
    return bActive;
}
jQuery.sap.interaction.notifyStepStart(null, true);
FESR.setActive(getInitialFESRState());
if (/sap-ui-xx-e2e-trace=(true|x|X)/.test(location.search)) {
    sap.ui.requireSync("sap/ui/core/support/trace/E2eTraceLib");
}