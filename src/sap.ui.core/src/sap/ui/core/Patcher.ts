import Device from "sap/ui/Device";
var oCSSStyleDeclaration = document.createElement("title").style;
var oTemplateElement = document.createElement("template");
var AttributeMutators = {
    value: function (oElement, sNewValue) {
        if (oElement.tagName == "INPUT") {
            oElement.value = (sNewValue == null) ? "" : sNewValue;
        }
    },
    checked: function (oElement, sNewValue) {
        if (oElement.tagName == "INPUT") {
            oElement.checked = (sNewValue == null) ? false : true;
        }
    },
    selected: function (oElement, sNewValue) {
        if (oElement.tagName == "OPTION") {
            oElement.selected = (sNewValue == null) ? false : true;
        }
    }
};
if (Device.browser.safari) {
    AttributeMutators.style = function (oElement, sNewValue) {
        if (sNewValue == null) {
            oElement.style = "";
            return true;
        }
    };
}
var createElement = function (sTagName, oParent) {
    if (sTagName == "svg") {
        return document.createElementNS("http://www.w3.org/2000/svg", "svg");
    }
    var sNamespaceURI = oParent && oParent.namespaceURI;
    if (!sNamespaceURI || sNamespaceURI == "http://www.w3.org/1999/xhtml" || oParent.localName == "foreignObject") {
        return document.createElement(sTagName);
    }
    return document.createElementNS(sNamespaceURI, sTagName);
};
var Patcher = function () {
    this._oRoot = null;
    this._oCurrent = null;
    this._oParent = null;
    this._oReference = null;
    this._oNewElement = null;
    this._oNewParent = null;
    this._oNewReference = null;
    this._iTagOpenState = 0;
    this._sStyles = "";
    this._sClasses = "";
    this._mAttributes = Object.create(null);
};
Patcher.prototype.setRootNode = function (oRootNode) {
    if (this._oRoot) {
        this.reset();
    }
    this._oRoot = oRootNode || document.createDocumentFragment();
};
Patcher.prototype.getRootNode = function () {
    return this._oRoot;
};
Patcher.prototype.getCurrentNode = function () {
    return this._oCurrent;
};
Patcher.prototype.reset = function () {
    this._oRoot = this._oCurrent = this._oParent = this._oReference = this._oNewElement = this._oNewParent = this._oNewReference = null;
    this._iTagOpenState = 0;
};
Patcher.prototype._walkOnTree = function () {
    this._oReference = null;
    if (!this._oCurrent) {
        if (this._oRoot.nodeType == 11) {
            this._oParent = this._oRoot;
        }
        else {
            this._oParent = this._oRoot.parentNode;
            this._oCurrent = this._oRoot;
        }
    }
    else if (this._iTagOpenState) {
        this._oParent = this._oCurrent;
        this._oCurrent = this._oCurrent.firstChild;
    }
    else {
        this._oParent = this._oCurrent.parentNode;
        this._oCurrent = this._oCurrent.nextSibling;
    }
};
Patcher.prototype._matchElement = function (sId) {
    if (!sId) {
        return;
    }
    if (!this._oCurrent) {
        return;
    }
    if (this._oCurrent.id == sId || this._oCurrent == this._oRoot) {
        return;
    }
    var oCurrent = document.getElementById(sId);
    if (oCurrent) {
        this._oCurrent = this._oParent.insertBefore(oCurrent, this._oCurrent);
        return;
    }
    if (this._oCurrent.id) {
        this._oReference = this._oCurrent;
        this._oCurrent = null;
    }
};
Patcher.prototype._matchNodeName = function (sNodeName) {
    if (!this._oCurrent) {
        return;
    }
    var sCurrentNodeName = (this._oCurrent.nodeType == 1) ? this._oCurrent.localName : this._oCurrent.nodeName;
    if (sCurrentNodeName == sNodeName) {
        return;
    }
    this._oReference = this._oCurrent;
    this._oCurrent = null;
};
Patcher.prototype._getAttributes = function () {
    for (var i = 0, aAttributeNames = this._oCurrent.getAttributeNames(); i < aAttributeNames.length; i++) {
        this._mAttributes[aAttributeNames[i]] = this._oCurrent.getAttribute(aAttributeNames[i]);
    }
};
Patcher.prototype._setNewElement = function (oNewElement) {
    if (!oNewElement) {
        return;
    }
    if (!this._oNewElement) {
        this._oNewElement = this._oCurrent;
        this._oNewParent = this._oParent;
        this._oNewReference = this._oReference;
    }
    else {
        this._oParent.insertBefore(this._oCurrent, this._oReference);
    }
};
Patcher.prototype._insertNewElement = function () {
    if (this._oCurrent == this._oNewElement) {
        this._oNewParent[this._oNewReference == this._oRoot ? "replaceChild" : "insertBefore"](this._oNewElement, this._oNewReference);
        this._oNewElement = this._oNewParent = this._oNewReference = null;
    }
};
Patcher.prototype.openStart = function (sTagName, sId) {
    this._walkOnTree();
    this._matchElement(sId);
    this._matchNodeName(sTagName);
    if (this._oCurrent) {
        this._getAttributes();
        this._iTagOpenState = 2;
    }
    else {
        this._oCurrent = createElement(sTagName, this._oParent);
        this._setNewElement(this._oCurrent);
        this._iTagOpenState = 1;
    }
    if (sId) {
        this.attr("id", sId);
    }
    return this;
};
Patcher.prototype.voidStart = Patcher.prototype.openStart;
Patcher.prototype.attr = function (sAttr, vValue) {
    if (sAttr === "style") {
        this._sStyles = vValue;
        return this;
    }
    if (this._iTagOpenState == 1) {
        this._oCurrent.setAttribute(sAttr, vValue);
        return this;
    }
    var sNewValue = String(vValue);
    var sOldValue = this._mAttributes[sAttr];
    var fnMutator = AttributeMutators[sAttr];
    if (sOldValue !== undefined) {
        delete this._mAttributes[sAttr];
    }
    if (fnMutator && fnMutator(this._oCurrent, sNewValue, sOldValue)) {
        return this;
    }
    if (sOldValue !== sNewValue) {
        this._oCurrent.setAttribute(sAttr, sNewValue);
    }
    return this;
};
Patcher.prototype.class = function (sClass) {
    if (sClass) {
        this._sClasses += (this._sClasses) ? " " + sClass : sClass;
    }
    return this;
};
Patcher.prototype.style = function (sName, vValue) {
    if (!sName || vValue == null || vValue == "") {
        return this;
    }
    vValue = vValue + "";
    if (vValue.includes(";")) {
        oCSSStyleDeclaration.setProperty(sName, vValue);
        vValue = oCSSStyleDeclaration.getPropertyValue(sName);
    }
    this._sStyles += (this._sStyles ? " " : "") + (sName + ": " + vValue + ";");
    return this;
};
Patcher.prototype.openEnd = function () {
    if (this._sClasses) {
        this.attr("class", this._sClasses);
        this._sClasses = "";
    }
    if (this._sStyles) {
        if (this._mAttributes.style != this._sStyles) {
            this._oCurrent.style = this._sStyles;
        }
        delete this._mAttributes.style;
        this._sStyles = "";
    }
    if (this._iTagOpenState == 1) {
        return this;
    }
    for (var sAttribute in this._mAttributes) {
        var fnMutator = AttributeMutators[sAttribute];
        if (!fnMutator || !fnMutator(this._oCurrent, null)) {
            this._oCurrent.removeAttribute(sAttribute);
        }
        delete this._mAttributes[sAttribute];
    }
    return this;
};
Patcher.prototype.voidEnd = function () {
    this.openEnd();
    this._iTagOpenState = 0;
    this._insertNewElement();
    return this;
};
Patcher.prototype.text = function (sText) {
    this._walkOnTree();
    this._matchNodeName("#text");
    if (!this._oCurrent) {
        this._oCurrent = document.createTextNode(sText);
        this._oParent.insertBefore(this._oCurrent, this._oReference);
    }
    else if (this._oCurrent.data != sText) {
        this._oCurrent.data = sText;
    }
    this._iTagOpenState = 0;
    return this;
};
Patcher.prototype.close = function (sTagName) {
    if (this._iTagOpenState) {
        this._iTagOpenState = 0;
        this._oCurrent.textContent = "";
    }
    else {
        var oParent = this._oCurrent.parentNode;
        for (var oLastChild = oParent.lastChild; oLastChild && oLastChild != this._oCurrent; oLastChild = oParent.lastChild) {
            oParent.removeChild(oLastChild);
        }
        this._oCurrent = oParent;
    }
    this._insertNewElement();
    return this;
};
Patcher.prototype.unsafeHtml = function (sHtml, sId, fnCallback) {
    var oReference = null;
    var oCurrent = this._oCurrent;
    if (!oCurrent) {
        oReference = this._oRoot;
    }
    else if (this._iTagOpenState) {
        oReference = oCurrent.firstChild;
        if (sHtml) {
            this._iTagOpenState = 0;
            oCurrent.insertAdjacentHTML("afterbegin", sHtml);
            this._oCurrent = oReference ? oReference.previousSibling : oCurrent.lastChild;
        }
    }
    else {
        oReference = oCurrent.nextSibling;
        if (sHtml) {
            if (oCurrent.nodeType == 1) {
                oCurrent.insertAdjacentHTML("afterend", sHtml);
            }
            else {
                oTemplateElement.innerHTML = sHtml;
                oCurrent.parentNode.insertBefore(oTemplateElement.content, oReference);
            }
            this._oCurrent = oReference ? oReference.previousSibling : oCurrent.parentNode.lastChild;
        }
    }
    if (sHtml && fnCallback) {
        var aNodes = [this._oCurrent];
        for (var oNode = this._oCurrent.previousSibling; oNode && oNode != oCurrent; oNode = oNode.previousSibling) {
            aNodes.unshift(oNode);
        }
        fnCallback(aNodes);
    }
    if (sId && oReference && oReference.id == sId) {
        oReference.remove();
    }
    return this;
};