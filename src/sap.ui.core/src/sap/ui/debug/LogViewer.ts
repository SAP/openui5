var LogViewer = function (oWindow, sRootId) {
    this.oWindow = oWindow;
    this.oDomNode = oWindow.querySelector("#" + sRootId);
    if (!this.oDomNode) {
        var oDiv = this.oWindow.document.createElement("DIV");
        oDiv.setAttribute("id", sRootId);
        oDiv.style.overflow = "auto";
        oDiv.style.tabIndex = "-1";
        oDiv.style.position = "absolute";
        oDiv.style.bottom = "0px";
        oDiv.style.left = "0px";
        oDiv.style.right = "202px";
        oDiv.style.height = "200px";
        oDiv.style.border = "1px solid gray";
        oDiv.style.fontFamily = "Arial monospaced for SAP,monospace";
        oDiv.style.fontSize = "11px";
        oDiv.style.zIndex = "999999";
        this.oWindow.document.body.appendChild(oDiv);
        this.oDomNode = oDiv;
    }
    this.iLogLevel = 3;
    this.sLogEntryClassPrefix = undefined;
    this.clear();
    this.setFilter(LogViewer.NO_FILTER);
};
LogViewer.NO_FILTER = function (oLogMessage) {
    return true;
};
LogViewer.prototype.clear = function () {
    this.oDomNode.innerHTML = "";
};
LogViewer.xmlEscape = function (sText) {
    sText = sText.replace(/\&/g, "&amp;");
    sText = sText.replace(/\</g, "&lt;");
    sText = sText.replace(/\"/g, "&quot;");
    return sText;
};
LogViewer.prototype.addEntry = function (oLogEntry) {
    var oDomEntry = this.oWindow.ownerDocument.createElement("div");
    if (this.sLogEntryClassPrefix) {
        oDomEntry.className = this.sLogEntryClassPrefix + oLogEntry.level;
    }
    else {
        oDomEntry.style.overflow = "hidden";
        oDomEntry.style.textOverflow = "ellipsis";
        oDomEntry.style.height = "1.3em";
        oDomEntry.style.width = "100%";
        oDomEntry.style.whiteSpace = "noWrap";
    }
    var sText = LogViewer.xmlEscape(oLogEntry.time + "  " + oLogEntry.message), oTextNode = this.oWindow.ownerDocument.createTextNode(sText);
    oDomEntry.appendChild(oTextNode);
    oDomEntry.title = oLogEntry.message;
    oDomEntry.style.display = this.oFilter(sText) ? "" : "none";
    this.oDomNode.appendChild(oDomEntry);
    return oDomEntry;
};
LogViewer.prototype.fillFromLogger = function (iFirstEntry) {
    this.clear();
    this.iFirstEntry = iFirstEntry;
    if (!this.oLogger) {
        return;
    }
    var aLog = this.oLogger.getLogEntries();
    for (var i = this.iFirstEntry, l = aLog.length; i < l; i++) {
        if (aLog[i].level <= this.iLogLevel) {
            this.addEntry(aLog[i]);
        }
    }
    this.scrollToBottom();
};
LogViewer.prototype.scrollToBottom = function () {
    this.oDomNode.scrollTop = this.oDomNode.scrollHeight;
};
LogViewer.prototype.truncate = function () {
    this.clear();
    this.fillFromLogger(this.oLogger.getLogEntries().length);
};
LogViewer.prototype.setFilter = function (oFilter) {
    this.oFilter = oFilter = oFilter || LogViewer.NO_FILTER;
    var childNodes = this.oDomNode.childNodes;
    for (var i = 0, l = childNodes.length; i < l; i++) {
        var sText = childNodes[i].innerText;
        if (!sText) {
            sText = childNodes[i].innerHTML;
        }
        childNodes[i].style.display = oFilter(sText) ? "" : "none";
    }
    this.scrollToBottom();
};
LogViewer.prototype.setLogLevel = function (iLogLevel) {
    this.iLogLevel = iLogLevel;
    if (this.oLogger) {
        this.oLogger.setLevel(iLogLevel);
    }
    this.fillFromLogger(this.iFirstEntry);
};
LogViewer.prototype.lock = function () {
    this.bLocked = true;
};
LogViewer.prototype.unlock = function () {
    this.bLocked = false;
    this.fillFromLogger(0);
};
LogViewer.prototype.onAttachToLog = function (oLogger) {
    this.oLogger = oLogger;
    this.oLogger.setLevel(this.iLogLevel);
    if (!this.bLocked) {
        this.fillFromLogger(0);
    }
};
LogViewer.prototype.onDetachFromLog = function (oLogger) {
    this.oLogger = undefined;
    this.fillFromLogger(0);
};
LogViewer.prototype.onLogEntry = function (oLogEntry) {
    if (!this.bLocked) {
        var oDomRef = this.addEntry(oLogEntry);
        if (oDomRef && oDomRef.style.display !== "none") {
            this.scrollToBottom();
        }
    }
};