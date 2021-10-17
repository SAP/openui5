var oActivityDetection = {}, _active = true, _deactivateTimer = null, _I_MAX_IDLE_TIME = 10000, _aActivateListeners = [], _activityDetected = false, _domChangeObserver = null;
function _onDeactivate() {
    _deactivateTimer = null;
    if (_activityDetected && document.hidden !== true) {
        _onActivate();
        return;
    }
    _active = false;
    _domChangeObserver.observe(document.documentElement, { childList: true, attributes: true, subtree: true, characterData: true });
}
function _onActivate() {
    if (document.hidden) {
        return;
    }
    if (!_active) {
        _active = true;
        _triggerEvent(_aActivateListeners);
        _domChangeObserver.disconnect();
    }
    if (_deactivateTimer) {
        _activityDetected = true;
    }
    else {
        _deactivateTimer = setTimeout(_onDeactivate, _I_MAX_IDLE_TIME);
        _activityDetected = false;
    }
}
function _triggerEvent(aListeners) {
    if (aListeners.length === 0) {
        return;
    }
    var aEventListeners = aListeners.slice();
    setTimeout(function () {
        var oInfo;
        for (var i = 0, iL = aEventListeners.length; i < iL; i++) {
            oInfo = aEventListeners[i];
            oInfo.fFunction.call(oInfo.oListener || window);
        }
    }, 0);
}
oActivityDetection.attachActivate = function (fnFunction, oListener) {
    _aActivateListeners.push({ oListener: oListener, fFunction: fnFunction });
};
oActivityDetection.detachActivate = function (fnFunction, oListener) {
    for (var i = 0, iL = _aActivateListeners.length; i < iL; i++) {
        if (_aActivateListeners[i].fFunction === fnFunction && _aActivateListeners[i].oListener === oListener) {
            _aActivateListeners.splice(i, 1);
            break;
        }
    }
};
oActivityDetection.isActive = function () { return _active; };
oActivityDetection.refresh = _onActivate;
var aEvents = ["resize", "orientationchange", "mousemove", "mousedown", "mouseup", "paste", "cut", "keydown", "keyup", "DOMMouseScroll", "mousewheel"];
if ("ontouchstart" in window) {
    aEvents.push("touchstart", "touchmove", "touchend", "touchcancel");
}
for (var i = 0; i < aEvents.length; i++) {
    window.addEventListener(aEvents[i], oActivityDetection.refresh, {
        capture: true,
        passive: true
    });
}
if (window.MutationObserver) {
    _domChangeObserver = new window.MutationObserver(oActivityDetection.refresh);
}
else if (window.WebKitMutationObserver) {
    _domChangeObserver = new window.WebKitMutationObserver(oActivityDetection.refresh);
}
else {
    _domChangeObserver = {
        observe: function () {
            document.documentElement.addEventListener("DOMSubtreeModified", oActivityDetection.refresh);
        },
        disconnect: function () {
            document.documentElement.removeEventListener("DOMSubtreeModified", oActivityDetection.refresh);
        }
    };
}
if (typeof document.hidden === "boolean") {
    document.addEventListener("visibilitychange", function () {
        if (document.hidden !== true) {
            oActivityDetection.refresh();
        }
    }, false);
}
_onActivate();