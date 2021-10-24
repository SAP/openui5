import Log from "sap/base/Log";
export class FrameOptions {
    static Mode = {
        TRUSTED: "trusted",
        ALLOW: "allow",
        DENY: "deny"
    };
    private static __window = window;
    private static __parent = parent;
    private static __self = self;
    private static __top = top;
    private static _events = [
        "mousedown",
        "mouseup",
        "click",
        "dblclick",
        "mouseover",
        "mouseout",
        "touchstart",
        "touchend",
        "touchmove",
        "touchcancel",
        "keydown",
        "keypress",
        "keyup"
    ];
    match(sProbe: any, sPattern: any) {
        if (!(/\*/i.test(sPattern))) {
            return sProbe == sPattern;
        }
        else {
            sPattern = sPattern.replace(/\//gi, "\\/");
            sPattern = sPattern.replace(/\./gi, "\\.");
            sPattern = sPattern.replace(/\*/gi, ".*");
            sPattern = sPattern.replace(/:\.\*$/gi, ":\\d*");
            if (sPattern.substr(sPattern.length - 1, 1) !== "$") {
                sPattern = sPattern + "$";
            }
            if (sPattern.substr(0, 1) !== "^") {
                sPattern = "^" + sPattern;
            }
            var r = new RegExp(sPattern, "i");
            return r.test(sProbe);
        }
    }
    private _createBlockLayer(...args: any) {
        if (document.readyState == "complete") {
            var lockDiv = document.createElement("div");
            lockDiv.style.position = "absolute";
            lockDiv.style.top = "-1000px";
            lockDiv.style.bottom = "-1000px";
            lockDiv.style.left = "-1000px";
            lockDiv.style.right = "-1000px";
            lockDiv.style.opacity = "0";
            lockDiv.style.backgroundColor = "white";
            lockDiv.style.zIndex = 2147483647;
            document.body.appendChild(lockDiv);
            this._lockDiv = lockDiv;
        }
    }
    private _setCursor(...args: any) {
        if (this._lockDiv) {
            this._lockDiv.style.cursor = this.sStatus == "denied" ? "not-allowed" : "wait";
        }
    }
    private _lock(...args: any) {
        var that = this;
        if (this.bBlockEvents) {
            for (var i = 0; i < FrameOptions._events.length; i++) {
                document.addEventListener(FrameOptions._events[i], FrameOptions._lockHandler, true);
            }
        }
        if (this.bShowBlockLayer) {
            this._blockLayer = function () {
                that._createBlockLayer();
                that._setCursor();
            };
            if (document.readyState == "complete") {
                this._blockLayer();
            }
            else {
                document.addEventListener("readystatechange", this._blockLayer);
            }
        }
    }
    private _unlock(...args: any) {
        if (this.bBlockEvents) {
            for (var i = 0; i < FrameOptions._events.length; i++) {
                document.removeEventListener(FrameOptions._events[i], FrameOptions._lockHandler, true);
            }
        }
        if (this.bShowBlockLayer) {
            document.removeEventListener("readystatechange", this._blockLayer);
            if (this._lockDiv) {
                document.body.removeChild(this._lockDiv);
                delete this._lockDiv;
            }
        }
    }
    private _callback(bSuccess: any) {
        this.sStatus = bSuccess ? "allowed" : "denied";
        this._setCursor();
        clearTimeout(this.iTimer);
        if (typeof this.fnCallback === "function") {
            this.fnCallback.call(null, bSuccess);
        }
    }
    private _applyState(bIsRunnable: any, bIsParentUnlocked: any) {
        if (this.bUnlocked) {
            return;
        }
        if (bIsRunnable) {
            this.bRunnable = true;
        }
        if (bIsParentUnlocked) {
            this.bParentUnlocked = true;
        }
        if (!this.bRunnable || !this.bParentUnlocked) {
            return;
        }
        this._unlock();
        this._callback(true);
        this._notifyChildFrames();
        this.bUnlocked = true;
    }
    private _applyTrusted(bTrusted: any) {
        if (bTrusted) {
            this._applyState(true, false);
        }
        else {
            this._callback(false);
        }
    }
    private _check(bParentResponsePending: any) {
        if (this.bRunnable) {
            return;
        }
        var bTrusted = false;
        if (this.bAllowSameOrigin && this.sParentOrigin && FrameOptions.__window.document.URL.indexOf(this.sParentOrigin) == 0) {
            bTrusted = true;
        }
        else if (this.mSettings.allowlist && this.mSettings.allowlist.length != 0) {
            var sHostName = this.sParentOrigin.split("//")[1];
            sHostName = sHostName.split(":")[0];
            for (var i = 0; i < this.mSettings.allowlist.length; i++) {
                var match = sHostName.indexOf(this.mSettings.allowlist[i]);
                if (match != -1 && sHostName.substring(match) == this.mSettings.allowlist[i]) {
                    bTrusted = true;
                    break;
                }
            }
        }
        if (bTrusted) {
            this._applyTrusted(bTrusted);
        }
        else if (this.mSettings.allowlistService) {
            var that = this;
            var xmlhttp = new XMLHttpRequest();
            var url = this.mSettings.allowlistService + "?parentOrigin=" + encodeURIComponent(this.sParentOrigin);
            xmlhttp.onreadystatechange = function () {
                if (xmlhttp.readyState == 4) {
                    that._handleXmlHttpResponse(xmlhttp, bParentResponsePending);
                }
            };
            xmlhttp.open("GET", url, true);
            xmlhttp.setRequestHeader("Accept", "application/json");
            xmlhttp.send();
        }
        else {
            Log.error("Embedding blocked because the allowlist or the allowlist service is not configured correctly", "", "sap/ui/security/FrameOptions");
            this._callback(false);
        }
    }
    private _handleXmlHttpResponse(xmlhttp: any, bParentResponsePending: any) {
        if (xmlhttp.status === 200) {
            var bTrusted = false;
            var sResponseText = xmlhttp.responseText;
            var oRuleSet = JSON.parse(sResponseText);
            if (oRuleSet.active == false) {
                this._applyState(true, true);
            }
            else if (bParentResponsePending) {
                return;
            }
            else {
                if (this.match(this.sParentOrigin, oRuleSet.origin)) {
                    bTrusted = oRuleSet.framing;
                }
                if (!bTrusted) {
                    Log.error("Embedding blocked because the allowlist service does not allow framing", "", "sap/ui/security/FrameOptions");
                }
                this._applyTrusted(bTrusted);
            }
        }
        else {
            Log.error("The configured allowlist service is not available: " + xmlhttp.status, "", "sap/ui/security/FrameOptions");
            this._callback(false);
        }
    }
    private _notifyChildFrames(...args: any) {
        for (var i = 0; i < this.aFPChilds.length; i++) {
            this.aFPChilds[i].postMessage("SAPFrameProtection*parent-unlocked", "*");
        }
    }
    private _sendRequireMessage(...args: any) {
        FrameOptions.__parent.postMessage("SAPFrameProtection*require-origin", "*");
        if (this.mSettings.allowlistService) {
            setTimeout(function () {
                if (!this.bParentResponded) {
                    this._check(true);
                }
            }.bind(this), 10);
        }
    }
    private _handlePostMessage(oEvent: any) {
        var oSource = oEvent.source, sData = oEvent.data;
        if (oSource === FrameOptions.__self || oSource == null || typeof sData !== "string" || sData.indexOf("SAPFrameProtection*") === -1) {
            return;
        }
        if (oSource === FrameOptions.__parent) {
            this.bParentResponded = true;
            if (!this.sParentOrigin) {
                this.sParentOrigin = oEvent.origin;
                this._check();
            }
            if (sData == "SAPFrameProtection*parent-unlocked") {
                this._applyState(false, true);
            }
        }
        else if (oSource.parent === FrameOptions.__self && sData == "SAPFrameProtection*require-origin" && this.bUnlocked) {
            oSource.postMessage("SAPFrameProtection*parent-unlocked", "*");
        }
        else {
            oSource.postMessage("SAPFrameProtection*parent-origin", "*");
            this.aFPChilds.push(oSource);
        }
    }
    private static _lockHandler(oEvent: any) {
        oEvent.stopPropagation();
        oEvent.preventDefault();
    }
    constructor(mSettings: any) {
        this.mSettings = mSettings || {};
        this.sMode = this.mSettings.mode || FrameOptions.Mode.ALLOW;
        this.fnCallback = this.mSettings.callback;
        this.iTimeout = this.mSettings.timeout || 10000;
        this.bBlockEvents = this.mSettings.blockEvents !== false;
        this.bShowBlockLayer = this.mSettings.showBlockLayer !== false;
        this.bAllowSameOrigin = this.mSettings.allowSameOrigin !== false;
        this.sParentOrigin = "";
        this.bUnlocked = false;
        this.bRunnable = false;
        this.bParentUnlocked = false;
        this.bParentResponded = false;
        this.sStatus = "pending";
        this.aFPChilds = [];
        var that = this;
        this.iTimer = setTimeout(function () {
            if (that.bRunnable && that.bParentResponded && !that.bParentUnlocked) {
                Log.error("Reached timeout of " + that.iTimeout + "ms waiting for the parent to be unlocked", "", "sap/ui/security/FrameOptions");
            }
            else {
                Log.error("Reached timeout of " + that.iTimeout + "ms waiting for a response from parent window", "", "sap/ui/security/FrameOptions");
            }
            that._callback(false);
        }, this.iTimeout);
        var fnHandlePostMessage = function () {
            that._handlePostMessage.apply(that, arguments);
        };
        FrameOptions.__window.addEventListener("message", fnHandlePostMessage);
        if (FrameOptions.__parent === FrameOptions.__self || FrameOptions.__parent == null || this.sMode === FrameOptions.Mode.ALLOW) {
            this._applyState(true, true);
        }
        else {
            this._lock();
            if (this.sMode === FrameOptions.Mode.DENY) {
                Log.error("Embedding blocked because configuration mode is set to 'DENY'", "", "sap/ui/security/FrameOptions");
                this._callback(false);
                return;
            }
            if (this.bAllowSameOrigin) {
                try {
                    var oParentWindow = FrameOptions.__parent;
                    var bOk = false;
                    var bTrue = true;
                    do {
                        var test = oParentWindow.document.domain;
                        if (oParentWindow == FrameOptions.__top) {
                            if (test != undefined) {
                                bOk = true;
                            }
                            break;
                        }
                        oParentWindow = oParentWindow.parent;
                    } while (bTrue);
                    if (bOk) {
                        this._applyState(true, true);
                    }
                }
                catch (e) {
                    this._sendRequireMessage();
                }
            }
            else {
                this._sendRequireMessage();
            }
        }
    }
}