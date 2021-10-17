import LabelEnablement from "./LabelEnablement";
import BaseObject from "sap/ui/base/Object";
import Interaction from "sap/ui/performance/trace/Interaction";
import uid from "sap/base/util/uid";
import ActivityDetection from "sap/ui/util/ActivityDetection";
import jQuery from "sap/ui/thirdparty/jquery";
import encodeXML from "sap/base/security/encodeXML";
import encodeCSS from "sap/base/security/encodeCSS";
import assert from "sap/base/assert";
import Measurement from "sap/ui/performance/Measurement";
import Log from "sap/base/Log";
import extend from "sap/base/util/extend";
import InvisibleRenderer from "./InvisibleRenderer";
import Patcher from "./Patcher";
var aCommonMethods = ["renderControl", "cleanupControlWithoutRendering", "accessibilityState", "icon"];
var aStrInterfaceMethods = ["write", "writeEscaped", "writeAcceleratorKey", "writeControlData", "writeElementData", "writeAttribute", "writeAttributeEscaped", "addClass", "writeClasses", "addStyle", "writeStyles", "writeAccessibilityState", "writeIcon", "translate", "getConfiguration", "getHTML"];
var aDomInterfaceMethods = ["openStart", "voidStart", "attr", "class", "style", "openEnd", "voidEnd", "text", "unsafeHtml", "close"];
var aNonRendererMethods = ["render", "flush", "destroy"];
var oTemplate = document.createElement("template");
var ATTR_STYLE_KEY_MARKER = "data-sap-ui-stylekey";
function RenderManager() {
    var that = this, oFocusHandler, aBuffer, aRenderedControls, aStyleStack, aRenderStack, bLocked, sOpenTag = "", bVoidOpen = false, bDomInterface, sLegacyRendererControlId = "", oStringInterface = {}, oDomInterface = {}, aRenderingStyles = [], oPatcher = new Patcher(), sLastStyleMethod, sLastClassMethod;
    this._setFocusHandler = function (oNewFocusHandler) {
        assert(oNewFocusHandler && BaseObject.isA(oNewFocusHandler, "sap.ui.core.FocusHandler"), "oFocusHandler must be an sap.ui.core.FocusHandler");
        oFocusHandler = oNewFocusHandler;
    };
    function reset() {
        assert(!(sLastStyleMethod = sLastClassMethod = ""));
        aBuffer = that.aBuffer = [];
        aRenderedControls = that.aRenderedControls = [];
        aStyleStack = that.aStyleStack = [{}];
        bDomInterface = undefined;
        bVoidOpen = false;
        sOpenTag = "";
    }
    function assertValidName(sName, sField) {
        assert(sName && typeof sName == "string" && /^[a-z_][a-zA-Z0-9_\-]*$/.test(sName), "The " + sField + " name provided '" + sName + "' is not valid; it must contain alphanumeric characters, hyphens or underscores");
    }
    function assertOpenTagHasStarted(sMethod) {
        assert(sOpenTag, "There is no open tag; '" + sMethod + "' must not be called without an open tag");
    }
    function assertOpenTagHasEnded(bCustomAssertion) {
        var bAssertion = (bCustomAssertion === undefined) ? !sOpenTag : bCustomAssertion;
        assert(bAssertion, "There is an open tag; '" + sOpenTag + "' tag has not yet ended with '" + (bVoidOpen ? "voidEnd" : "openEnd") + "'");
    }
    function assertValidAttr(sAttr) {
        assertValidName(sAttr, "attr");
        assert((sAttr != "class" || sLastClassMethod != "class" && (sLastClassMethod = "attr")) && (sAttr != "style" || sLastStyleMethod != "style" && (sLastStyleMethod = "attr")), "Attributes 'class' and 'style' must not be written when the methods with the same name" + " have been called for the same element already");
    }
    function assertValidClass(sClass) {
        assert(sLastClassMethod != "attr" && (sLastClassMethod = "class"), "Method class() must not be called after the 'class' attribute has been written for the same element");
        assert(typeof sClass == "string" && !/\s/.test(sClass) && arguments.length === 1, "Method 'class' must be called with exactly one class name");
    }
    function assertValidStyle(sStyle) {
        assert(sLastStyleMethod != "attr" && (sLastStyleMethod = "style"), "Method style() must not be called after the 'style' attribute has been written for the same element");
        assert(sStyle && typeof sStyle == "string" && !/\s/.test(sStyle), "Method 'style' must be called with a non-empty string name");
    }
    this.write = function (sText) {
        assert((typeof sText === "string") || (typeof sText === "number"), "sText must be a string or number");
        aBuffer.push.apply(aBuffer, arguments);
        return this;
    };
    this.writeEscaped = function (sText, bLineBreaks) {
        if (sText != null) {
            sText = encodeXML(String(sText));
            if (bLineBreaks) {
                sText = sText.replace(/&#xa;/g, "<br>");
            }
            aBuffer.push(sText);
        }
        return this;
    };
    this.writeAttribute = function (sName, vValue) {
        assert(typeof sName === "string", "sName must be a string");
        assert(typeof vValue === "string" || typeof vValue === "number" || typeof vValue === "boolean", "value must be a string, number or boolean");
        aBuffer.push(" ", sName, "=\"", vValue, "\"");
        return this;
    };
    this.writeAttributeEscaped = function (sName, vValue) {
        assert(typeof sName === "string", "sName must be a string");
        aBuffer.push(" ", sName, "=\"", encodeXML(String(vValue)), "\"");
        return this;
    };
    this.addStyle = function (sName, vValue) {
        assert(typeof sName === "string", "sName must be a string");
        if (vValue != null && vValue != "") {
            assert((typeof vValue === "string" || typeof vValue === "number"), "value must be a string or number");
            var oStyle = aStyleStack[aStyleStack.length - 1];
            if (!oStyle.aStyle) {
                oStyle.aStyle = [];
            }
            oStyle.aStyle.push(sName + ": " + vValue + ";");
        }
        return this;
    };
    this.writeStyles = function () {
        var oStyle = aStyleStack[aStyleStack.length - 1];
        if (oStyle.aStyle && oStyle.aStyle.length) {
            this.writeAttribute(ATTR_STYLE_KEY_MARKER, aRenderingStyles.push(oStyle.aStyle.join(" ")) - 1);
        }
        oStyle.aStyle = null;
        return this;
    };
    this.addClass = function (sName) {
        if (sName) {
            assert(typeof sName === "string", "sName must be a string");
            var oStyle = aStyleStack[aStyleStack.length - 1];
            if (!oStyle.aClasses) {
                oStyle.aClasses = [];
            }
            oStyle.aClasses.push(sName);
        }
        return this;
    };
    this.writeClasses = function (oElement) {
        assert(!oElement || typeof oElement === "boolean" || BaseObject.isA(oElement, "sap.ui.core.Element"), "oElement must be empty, a boolean, or an sap.ui.core.Element");
        var oStyle = aStyleStack[aStyleStack.length - 1];
        var aCustomClasses;
        if (oElement) {
            aCustomClasses = oElement.aCustomStyleClasses;
        }
        else if (oElement === false) {
            aCustomClasses = [];
        }
        else {
            aCustomClasses = oStyle.aCustomStyleClasses;
        }
        if (oStyle.aClasses || aCustomClasses) {
            var aClasses = [].concat(oStyle.aClasses || [], aCustomClasses || []);
            if (aClasses.length) {
                this.writeAttribute("class", aClasses.join(" "));
            }
        }
        if (!oElement) {
            oStyle.aCustomStyleClasses = null;
        }
        oStyle.aClasses = null;
        return this;
    };
    this.openStart = function (sTagName, vControlOrId) {
        assertValidName(sTagName, "tag");
        assertOpenTagHasEnded();
        assert(!(sLastStyleMethod = sLastClassMethod = ""));
        sOpenTag = sTagName;
        this.write("<" + sTagName);
        if (vControlOrId) {
            if (typeof vControlOrId == "string") {
                this.attr("id", vControlOrId);
            }
            else {
                this.writeElementData(vControlOrId);
            }
        }
        return this;
    };
    this.openEnd = function (bExludeStyleClasses) {
        assertOpenTagHasStarted("openEnd");
        assertOpenTagHasEnded(!bVoidOpen);
        assert(bExludeStyleClasses === undefined || bExludeStyleClasses === true, "The private parameter bExludeStyleClasses must be true or omitted!");
        sOpenTag = "";
        this.writeClasses(bExludeStyleClasses === true ? false : undefined);
        this.writeStyles();
        this.write(">");
        return this;
    };
    this.close = function (sTagName) {
        assertValidName(sTagName, "tag");
        assertOpenTagHasEnded();
        this.write("</" + sTagName + ">");
        return this;
    };
    this.voidStart = function (sTagName, vControlOrId) {
        this.openStart(sTagName, vControlOrId);
        bVoidOpen = true;
        return this;
    };
    this.voidEnd = function (bExludeStyleClasses) {
        assertOpenTagHasStarted("voidEnd");
        assertOpenTagHasEnded(bVoidOpen || !sOpenTag);
        bVoidOpen = false;
        sOpenTag = "";
        this.writeClasses(bExludeStyleClasses ? false : undefined);
        this.writeStyles();
        this.write(">");
        return this;
    };
    this.unsafeHtml = function (sHtml) {
        assertOpenTagHasEnded();
        this.write(sHtml);
        return this;
    };
    this.text = function (sText) {
        assertOpenTagHasEnded();
        this.writeEscaped(sText);
        return this;
    };
    this.attr = function (sName, vValue) {
        assertValidAttr(sName);
        if (sName == "style") {
            aStyleStack[aStyleStack.length - 1].aStyle = [vValue];
        }
        else {
            this.writeAttributeEscaped(sName, vValue);
        }
        return this;
    };
    this.class = function (sClass) {
        if (sClass) {
            assertValidClass.apply(this, arguments);
            this.addClass(encodeXML(sClass));
        }
        return this;
    };
    this.style = function (sName, sValue) {
        assertValidStyle(sName);
        this.addStyle(sName, sValue);
        return this;
    };
    this.accessibilityState = this.writeAccessibilityState;
    this.icon = this.writeIcon;
    oDomInterface.openStart = function (sTagName, vControlOrId) {
        assertValidName(sTagName, "tag");
        assertOpenTagHasEnded();
        assert(!(sLastStyleMethod = sLastClassMethod = ""));
        sOpenTag = sTagName;
        if (!vControlOrId) {
            oPatcher.openStart(sTagName);
        }
        else if (typeof vControlOrId == "string") {
            oPatcher.openStart(sTagName, vControlOrId);
        }
        else {
            oPatcher.openStart(sTagName, vControlOrId.getId());
            renderElementData(this, vControlOrId);
        }
        return this;
    };
    oDomInterface.voidStart = function (sTagName, vControlOrId) {
        this.openStart(sTagName, vControlOrId);
        bVoidOpen = true;
        return this;
    };
    oDomInterface.attr = function (sName, vValue) {
        assertValidAttr(sName);
        assertOpenTagHasStarted("attr");
        oPatcher.attr(sName, vValue);
        return this;
    };
    oDomInterface.class = function (sClass) {
        if (sClass) {
            assertValidClass.apply(this, arguments);
            assertOpenTagHasStarted("class");
            oPatcher.class(sClass);
        }
        return this;
    };
    oDomInterface.style = function (sName, vValue) {
        assertValidStyle(sName);
        assertOpenTagHasStarted("style");
        oPatcher.style(sName, vValue);
        return this;
    };
    oDomInterface.openEnd = function (bExludeStyleClasses) {
        if (bExludeStyleClasses !== true) {
            var oStyle = aStyleStack[aStyleStack.length - 1];
            var aStyleClasses = oStyle.aCustomStyleClasses;
            if (aStyleClasses) {
                aStyleClasses.forEach(oPatcher.class, oPatcher);
                oStyle.aCustomStyleClasses = null;
            }
        }
        assertOpenTagHasStarted("openEnd");
        assertOpenTagHasEnded(!bVoidOpen);
        assert(bExludeStyleClasses === undefined || bExludeStyleClasses === true, "The private parameter bExludeStyleClasses must be true or omitted!");
        sOpenTag = "";
        oPatcher.openEnd();
        return this;
    };
    oDomInterface.voidEnd = function (bExludeStyleClasses) {
        if (!bExludeStyleClasses) {
            var oStyle = aStyleStack[aStyleStack.length - 1];
            var aStyleClasses = oStyle.aCustomStyleClasses;
            if (aStyleClasses) {
                aStyleClasses.forEach(oPatcher.class, oPatcher);
                oStyle.aCustomStyleClasses = null;
            }
        }
        assertOpenTagHasStarted("voidEnd");
        assertOpenTagHasEnded(bVoidOpen || !sOpenTag);
        bVoidOpen = false;
        sOpenTag = "";
        oPatcher.voidEnd();
        return this;
    };
    oDomInterface.text = function (sText) {
        assertOpenTagHasEnded();
        if (sText != null) {
            oPatcher.text(sText);
        }
        return this;
    };
    oDomInterface.unsafeHtml = function (sHtml) {
        assertOpenTagHasEnded();
        oPatcher.unsafeHtml(sHtml);
        return this;
    };
    oDomInterface.close = function (sTagName) {
        assertValidName(sTagName, "tag");
        assertOpenTagHasEnded();
        oPatcher.close(sTagName);
        return this;
    };
    function triggerBeforeRendering(oControl) {
        bLocked = true;
        try {
            var oEvent = new jQuery.Event("BeforeRendering");
            oEvent.srcControl = oControl;
            oControl._handleEvent(oEvent);
        }
        finally {
            bLocked = false;
        }
    }
    this.cleanupControlWithoutRendering = function (oControl) {
        assert(!oControl || BaseObject.isA(oControl, "sap.ui.core.Control"), "oControl must be an sap.ui.core.Control or empty");
        if (!oControl) {
            return;
        }
        var oDomRef = oControl.getDomRef();
        if (oDomRef) {
            triggerBeforeRendering(oControl);
            RenderManager.preserveContent(oDomRef, false, false);
            if (!oDomRef.hasAttribute(ATTR_PRESERVE_MARKER)) {
                oControl.bOutput = false;
            }
        }
    };
    this.renderControl = function (oControl) {
        assert(!oControl || BaseObject.isA(oControl, "sap.ui.core.Control"), "oControl must be an sap.ui.core.Control or empty");
        if (!oControl) {
            return this;
        }
        if (!aRenderStack) {
            aRenderStack = [];
        }
        if (aRenderStack && aRenderStack.length > 0) {
            Measurement.pause(aRenderStack[0] + "---renderControl");
        }
        else if (oControl.getParent() && oControl.getParent().getMetadata().getName() == "sap.ui.core.UIArea") {
            Measurement.pause(oControl.getParent().getId() + "---rerender");
        }
        aRenderStack.unshift(oControl.getId());
        Measurement.start(oControl.getId() + "---renderControl", "Rendering of " + oControl.getMetadata().getName(), ["rendering", "control"]);
        triggerBeforeRendering(oControl);
        Measurement.pause(oControl.getId() + "---renderControl");
        var oRenderer;
        var oMetadata = oControl.getMetadata();
        var bVisible = oControl.getVisible();
        if (bVisible) {
            oRenderer = oMetadata.getRenderer();
        }
        else {
            var oVisibleProperty = oMetadata.getProperty("visible");
            var bUsesDefaultVisibleProperty = oVisibleProperty && oVisibleProperty._oParent && oVisibleProperty._oParent.getName() == "sap.ui.core.Control";
            oRenderer = bUsesDefaultVisibleProperty ? InvisibleRenderer : oMetadata.getRenderer();
        }
        Measurement.resume(oControl.getId() + "---renderControl");
        var aBindings = oControl.aBindParameters, oDomRef;
        if (aBindings && aBindings.length > 0 && (oDomRef = oControl.getDomRef())) {
            var $DomRef = jQuery(oDomRef);
            for (var i = 0; i < aBindings.length; i++) {
                var oParams = aBindings[i];
                $DomRef.off(oParams.sEventType, oParams.fnProxy);
            }
        }
        if (oRenderer && typeof oRenderer.render === "function") {
            if (aBuffer.length) {
                bDomInterface = false;
            }
            else if (bDomInterface === undefined) {
                if (RenderManager.getApiVersion(oRenderer) == 2) {
                    oDomRef = oDomRef || oControl.getDomRef() || InvisibleRenderer.getDomRef(oControl);
                    if (RenderManager.isPreservedContent(oDomRef)) {
                        bDomInterface = false;
                    }
                    else {
                        if (oDomRef && oFocusHandler) {
                            oFocusHandler.storePatchingControlFocusInfo(oDomRef);
                        }
                        oPatcher.setRootNode(oDomRef);
                        bDomInterface = true;
                    }
                }
                else {
                    bDomInterface = false;
                }
            }
            else if (!sLegacyRendererControlId && bDomInterface) {
                if (RenderManager.getApiVersion(oRenderer) != 2) {
                    sLegacyRendererControlId = oControl.getId();
                    bDomInterface = false;
                }
            }
            var oControlStyles = {};
            if (oControl.aCustomStyleClasses && oControl.aCustomStyleClasses.length > 0) {
                oControlStyles.aCustomStyleClasses = oControl.aCustomStyleClasses;
            }
            aStyleStack.push(oControlStyles);
            if (bDomInterface) {
                var oCurrentNode = oPatcher.getCurrentNode();
                oRenderer.render(oDomInterface, oControl);
                if (oPatcher.getCurrentNode() == oCurrentNode) {
                    oPatcher.unsafeHtml("", oControl.getId());
                    oControl.bOutput = false;
                }
                else {
                    oControl.bOutput = true;
                }
            }
            else {
                var iBufferLength = aBuffer.length;
                oRenderer.render(oStringInterface, oControl);
                oControl.bOutput = (aBuffer.length !== iBufferLength);
            }
            aStyleStack.pop();
            if (sLegacyRendererControlId && sLegacyRendererControlId === oControl.getId()) {
                oPatcher.unsafeHtml(aBuffer.join(""), sLegacyRendererControlId, restoreStyles);
                sLegacyRendererControlId = "";
                bDomInterface = true;
                aBuffer = [];
            }
        }
        else {
            Log.error("The renderer for class " + oMetadata.getName() + " is not defined or does not define a render function! Rendering of " + oControl.getId() + " will be skipped!");
        }
        aRenderedControls.push(oControl);
        var oUIArea = oControl.getUIArea();
        if (oUIArea) {
            oUIArea._onControlRendered(oControl);
        }
        if (oRenderer === InvisibleRenderer) {
            oControl.bOutput = "invisible";
        }
        Measurement.end(oControl.getId() + "---renderControl");
        aRenderStack.shift();
        if (aRenderStack && aRenderStack.length > 0) {
            Measurement.resume(aRenderStack[0] + "---renderControl");
        }
        else if (oControl.getParent() && oControl.getParent().getMetadata().getName() == "sap.ui.core.UIArea") {
            Measurement.resume(oControl.getParent().getId() + "---rerender");
        }
        return this;
    };
    this.getHTML = function (oControl) {
        assert(oControl && BaseObject.isA(oControl, "sap.ui.core.Control"), "oControl must be an sap.ui.core.Control");
        var tmp = aBuffer;
        var aResult = aBuffer = this.aBuffer = [];
        this.renderControl(oControl);
        aBuffer = this.aBuffer = tmp;
        return aResult.join("");
    };
    function finalizeRendering(oStoredFocusInfo) {
        var i, size = aRenderedControls.length;
        for (i = 0; i < size; i++) {
            aRenderedControls[i]._sapui_bInAfterRenderingPhase = true;
        }
        bLocked = true;
        try {
            for (i = 0; i < size; i++) {
                var oControl = aRenderedControls[i];
                if (oControl.bOutput && oControl.bOutput !== "invisible") {
                    var oEvent = new jQuery.Event("AfterRendering");
                    oEvent.srcControl = oControl;
                    Measurement.start(oControl.getId() + "---AfterRendering", "AfterRendering of " + oControl.getMetadata().getName(), ["rendering", "after"]);
                    oControl._handleEvent(oEvent);
                    Measurement.end(oControl.getId() + "---AfterRendering");
                }
            }
        }
        finally {
            for (i = 0; i < size; i++) {
                delete aRenderedControls[i]._sapui_bInAfterRenderingPhase;
            }
            bLocked = false;
        }
        try {
            oFocusHandler.restoreFocus(oStoredFocusInfo);
        }
        catch (e) {
            Log.warning("Problems while restoring the focus after rendering: " + e, null);
        }
        for (i = 0; i < size; i++) {
            var oControl = aRenderedControls[i], aBindings = oControl.aBindParameters, oDomRef;
            if (aBindings && aBindings.length > 0 && (oDomRef = oControl.getDomRef())) {
                var $DomRef = jQuery(oDomRef);
                for (var j = 0; j < aBindings.length; j++) {
                    var oParams = aBindings[j];
                    $DomRef.on(oParams.sEventType, oParams.fnProxy);
                }
            }
        }
    }
    function flushInternal(fnPutIntoDom, fnDone, oTargetDomNode) {
        var oStoredFocusInfo;
        if (!bDomInterface) {
            oStoredFocusInfo = oFocusHandler && oFocusHandler.getControlFocusInfo();
            var sHtml = aBuffer.join("");
            if (sHtml && aRenderingStyles.length) {
                if (oTargetDomNode instanceof SVGElement && oTargetDomNode.localName != "foreignObject") {
                    oTemplate.innerHTML = "<svg>" + sHtml + "</svg>";
                    oTemplate.replaceWith.apply(oTemplate.content.firstChild, oTemplate.content.firstChild.childNodes);
                }
                else {
                    oTemplate.innerHTML = sHtml;
                }
                restoreStyles(oTemplate.content.childNodes);
                fnPutIntoDom(oTemplate.content);
            }
            else {
                fnPutIntoDom(sHtml);
            }
        }
        else {
            var oRootNode = oPatcher.getRootNode();
            if (oRootNode.nodeType == 11) {
                oStoredFocusInfo = oFocusHandler && oFocusHandler.getControlFocusInfo();
                fnPutIntoDom(oRootNode.lastChild ? oRootNode : "");
            }
            else {
                oStoredFocusInfo = oFocusHandler && oFocusHandler.getPatchingControlFocusInfo();
            }
            oPatcher.reset();
        }
        finalizeRendering(oStoredFocusInfo);
        reset();
        ActivityDetection.refresh();
        if (fnDone) {
            fnDone();
        }
    }
    function restoreStyle(oElement, iDomIndex) {
        var sStyleIndex = oElement.getAttribute(ATTR_STYLE_KEY_MARKER);
        if (sStyleIndex != iDomIndex) {
            return 0;
        }
        oElement.style = aRenderingStyles[iDomIndex];
        oElement.removeAttribute(ATTR_STYLE_KEY_MARKER);
        return 1;
    }
    function restoreStyles(aDomNodes) {
        if (!aRenderingStyles.length) {
            return;
        }
        var iDomIndex = 0;
        aDomNodes.forEach(function (oDomNode) {
            if (oDomNode.nodeType == 1) {
                iDomIndex += restoreStyle(oDomNode, iDomIndex);
                oDomNode.querySelectorAll("[" + ATTR_STYLE_KEY_MARKER + "]").forEach(function (oElement) {
                    iDomIndex += restoreStyle(oElement, iDomIndex);
                });
            }
        });
        aRenderingStyles = [];
    }
    this.flush = function (oTargetDomNode, bDoNotPreserve, vInsert) {
        assert((typeof oTargetDomNode === "object") && (oTargetDomNode.ownerDocument == document), "oTargetDomNode must be a DOM element");
        var fnDone = Interaction.notifyAsyncStep();
        if (!bDoNotPreserve && (typeof vInsert !== "number") && !vInsert) {
            RenderManager.preserveContent(oTargetDomNode);
        }
        flushInternal(function (vHTML) {
            for (var i = 0; i < aRenderedControls.length; i++) {
                var oldDomNode = aRenderedControls[i].getDomRef();
                if (oldDomNode && !RenderManager.isPreservedContent(oldDomNode)) {
                    if (RenderManager.isInlineTemplate(oldDomNode)) {
                        jQuery(oldDomNode).empty();
                    }
                    else {
                        jQuery(oldDomNode).remove();
                    }
                }
            }
            if (typeof vInsert === "number") {
                if (vInsert <= 0) {
                    insertAdjacent(oTargetDomNode, "prepend", vHTML);
                }
                else {
                    var oPredecessor = oTargetDomNode.children[vInsert - 1];
                    if (oPredecessor) {
                        insertAdjacent(oPredecessor, "after", vHTML);
                    }
                    else {
                        insertAdjacent(oTargetDomNode, "append", vHTML);
                    }
                }
            }
            else if (!vInsert) {
                jQuery(oTargetDomNode).html(vHTML);
            }
            else {
                insertAdjacent(oTargetDomNode, "append", vHTML);
            }
        }, fnDone, oTargetDomNode);
    };
    this.render = function (oControl, oTargetDomNode) {
        assert(oControl && BaseObject.isA(oControl, "sap.ui.core.Control"), "oControl must be a control");
        assert(typeof oTargetDomNode === "object" && oTargetDomNode.ownerDocument == document, "oTargetDomNode must be a DOM element");
        if (bLocked) {
            Log.error("Render must not be called within Before or After Rendering Phase. Call ignored.", null, this);
            return;
        }
        var fnDone = Interaction.notifyAsyncStep();
        reset();
        this.renderControl(oControl);
        flushInternal(function (vHTML) {
            if (oControl && oTargetDomNode) {
                var oldDomNode = oControl.getDomRef();
                if (!oldDomNode || RenderManager.isPreservedContent(oldDomNode)) {
                    oldDomNode = InvisibleRenderer.getDomRef(oControl) || document.getElementById(RenderPrefixes.Dummy + oControl.getId());
                }
                var bNewTarget = oldDomNode && oldDomNode.parentNode != oTargetDomNode;
                if (bNewTarget) {
                    if (!RenderManager.isPreservedContent(oldDomNode)) {
                        if (RenderManager.isInlineTemplate(oldDomNode)) {
                            jQuery(oldDomNode).empty();
                        }
                        else {
                            jQuery(oldDomNode).remove();
                        }
                    }
                    if (vHTML) {
                        insertAdjacent(oTargetDomNode, "append", vHTML);
                    }
                }
                else {
                    if (vHTML) {
                        if (oldDomNode) {
                            if (RenderManager.isInlineTemplate(oldDomNode)) {
                                jQuery(oldDomNode).html(vHTML);
                            }
                            else {
                                insertAdjacent(oldDomNode, "after", vHTML);
                                jQuery(oldDomNode).remove();
                            }
                        }
                        else {
                            insertAdjacent(oTargetDomNode, "append", vHTML);
                        }
                    }
                    else {
                        if (RenderManager.isInlineTemplate(oldDomNode)) {
                            jQuery(oldDomNode).empty();
                        }
                        else {
                            if (!oControl.getParent() || !oControl.getParent()._onChildRerenderedEmpty || !oControl.getParent()._onChildRerenderedEmpty(oControl, oldDomNode)) {
                                jQuery(oldDomNode).remove();
                            }
                        }
                    }
                }
            }
        }, fnDone, oTargetDomNode);
    };
    this.destroy = function () {
        reset();
    };
    var oInterface = {};
    aCommonMethods.forEach(function (sMethod) {
        oStringInterface[sMethod] = oDomInterface[sMethod] = oInterface[sMethod] = this[sMethod];
    }, this);
    aDomInterfaceMethods.forEach(function (sMethod) {
        oStringInterface[sMethod] = oInterface[sMethod] = this[sMethod];
    }, this);
    aStrInterfaceMethods.forEach(function (sMethod) {
        oStringInterface[sMethod] = oInterface[sMethod] = this[sMethod];
    }, this);
    aNonRendererMethods.forEach(function (sMethod) {
        oInterface[sMethod] = this[sMethod];
    }, this);
    this.getRendererInterface = function () {
        return oStringInterface;
    };
    this.getInterface = function () {
        return oInterface;
    };
    reset();
}
RenderManager.prototype.getConfiguration = function () {
    return sap.ui.getCore().getConfiguration();
};
RenderManager.prototype.translate = function (sKey) {
};
RenderManager.prototype.writeAcceleratorKey = function () {
    return this;
};
RenderManager.prototype.writeControlData = function (oControl) {
    assert(oControl && BaseObject.isA(oControl, "sap.ui.core.Control"), "oControl must be an sap.ui.core.Control");
    this.writeElementData(oControl);
    return this;
};
RenderManager.prototype.writeElementData = function (oElement) {
    assert(oElement && BaseObject.isA(oElement, "sap.ui.core.Element"), "oElement must be an sap.ui.core.Element");
    this.attr("id", oElement.getId());
    renderElementData(this, oElement);
    return this;
};
RenderManager.prototype.writeAccessibilityState = function (oElement, mProps) {
    if (!sap.ui.getCore().getConfiguration().getAccessibility()) {
        return this;
    }
    if (arguments.length == 1 && !(BaseObject.isA(oElement, "sap.ui.core.Element"))) {
        mProps = oElement;
        oElement = null;
    }
    var mAriaProps = {};
    if (oElement != null) {
        var oMetadata = oElement.getMetadata();
        var addACCForProp = function (sElemProp, sACCProp, oVal) {
            var oProp = oMetadata.getProperty(sElemProp);
            if (oProp && oElement[oProp._sGetter]() === oVal) {
                mAriaProps[sACCProp] = "true";
            }
        };
        var addACCForAssoc = function (sElemAssoc, sACCProp) {
            var oAssoc = oMetadata.getAssociation(sElemAssoc);
            if (oAssoc && oAssoc.multiple) {
                var aIds = oElement[oAssoc._sGetter]();
                if (sElemAssoc == "ariaLabelledBy") {
                    var aLabelIds = LabelEnablement.getReferencingLabels(oElement);
                    var iLen = aLabelIds.length;
                    if (iLen) {
                        var aFilteredLabelIds = [];
                        for (var i = 0; i < iLen; i++) {
                            if (aIds.indexOf(aLabelIds[i]) < 0) {
                                aFilteredLabelIds.push(aLabelIds[i]);
                            }
                        }
                        aIds = aFilteredLabelIds.concat(aIds);
                    }
                }
                if (aIds.length > 0) {
                    mAriaProps[sACCProp] = aIds.join(" ");
                }
            }
        };
        addACCForProp("editable", "readonly", false);
        addACCForProp("enabled", "disabled", false);
        addACCForProp("visible", "hidden", false);
        if (LabelEnablement.isRequired(oElement)) {
            mAriaProps["required"] = "true";
        }
        addACCForProp("selected", "selected", true);
        addACCForProp("checked", "checked", true);
        addACCForAssoc("ariaDescribedBy", "describedby");
        addACCForAssoc("ariaLabelledBy", "labelledby");
    }
    if (mProps) {
        var checkValue = function (v) {
            var type = typeof (v);
            return v === null || type === "number" || type === "string" || type === "boolean";
        };
        var prop = {};
        var x, val, autoVal;
        for (x in mProps) {
            val = mProps[x];
            if (checkValue(val)) {
                prop[x] = val;
            }
            else if (typeof (val) === "object" && checkValue(val.value)) {
                autoVal = "";
                if (val.append && (x === "describedby" || x === "labelledby")) {
                    autoVal = mAriaProps[x] ? mAriaProps[x] + " " : "";
                }
                prop[x] = autoVal + val.value;
            }
        }
        Object.assign(mAriaProps, prop);
    }
    if (BaseObject.isA(oElement, "sap.ui.core.Element") && oElement.getParent() && oElement.getParent().enhanceAccessibilityState) {
        oElement.getParent().enhanceAccessibilityState(oElement, mAriaProps);
    }
    for (var p in mAriaProps) {
        if (mAriaProps[p] != null && mAriaProps[p] !== "") {
            this.attr(p === "role" ? p : "aria-" + p, mAriaProps[p]);
        }
    }
    return this;
};
RenderManager.prototype.writeIcon = function (sURI, aClasses, mAttributes) {
    var IconPool = sap.ui.require("sap/ui/core/IconPool");
    if (!IconPool) {
        Log.warning("Synchronous loading of IconPool due to sap.ui.core.RenderManager#icon call. " + "Ensure that 'sap/ui/core/IconPool is loaded before this function is called", "SyncXHR", null, function () {
            return {
                type: "SyncXHR",
                name: "rendermanager-icon"
            };
        });
        IconPool = sap.ui.requireSync("sap/ui/core/IconPool");
    }
    var bIconURI = IconPool.isIconURI(sURI), bAriaLabelledBy = false, sProp, oIconInfo, mDefaultAttributes, sLabel, sInvTextId;
    if (typeof aClasses === "string") {
        aClasses = [aClasses];
    }
    if (bIconURI) {
        oIconInfo = IconPool.getIconInfo(sURI);
        if (!oIconInfo) {
            Log.error("An unregistered icon: " + sURI + " is used in sap.ui.core.RenderManager's writeIcon method.");
            return this;
        }
        if (!aClasses) {
            aClasses = [];
        }
        aClasses.push("sapUiIcon");
        if (!oIconInfo.suppressMirroring) {
            aClasses.push("sapUiIconMirrorInRTL");
        }
    }
    if (bIconURI) {
        this.openStart("span");
    }
    else {
        this.voidStart("img");
    }
    if (Array.isArray(aClasses)) {
        aClasses.forEach(function (sClass) {
            this.class(sClass);
        }, this);
    }
    if (bIconURI) {
        mDefaultAttributes = {
            "data-sap-ui-icon-content": oIconInfo.content,
            "role": "presentation",
            "title": oIconInfo.text || null
        };
        this.style("font-family", "'" + encodeCSS(oIconInfo.fontFamily) + "'");
    }
    else {
        mDefaultAttributes = {
            role: "presentation",
            alt: "",
            src: sURI
        };
    }
    mAttributes = extend(mDefaultAttributes, mAttributes);
    if (!mAttributes.id) {
        mAttributes.id = uid();
    }
    if (bIconURI) {
        sLabel = mAttributes.alt || mAttributes.title || oIconInfo.text || oIconInfo.name;
        sInvTextId = mAttributes.id + "-label";
        if (mAttributes["aria-labelledby"]) {
            bAriaLabelledBy = true;
            mAttributes["aria-labelledby"] += (" " + sInvTextId);
        }
        else if (!mAttributes.hasOwnProperty("aria-label")) {
            mAttributes["aria-label"] = sLabel;
        }
    }
    if (typeof mAttributes === "object") {
        for (sProp in mAttributes) {
            if (mAttributes.hasOwnProperty(sProp) && mAttributes[sProp] !== null) {
                this.attr(sProp, mAttributes[sProp]);
            }
        }
    }
    if (bIconURI) {
        this.openEnd();
        if (bAriaLabelledBy) {
            this.openStart("span");
            this.style("display", "none");
            this.attr("id", sInvTextId);
            this.openEnd();
            this.text(sLabel);
            this.close("span");
        }
        this.close("span");
    }
    else {
        this.voidEnd();
    }
    return this;
};
RenderManager.prototype.getRenderer = function (oControl) {
    assert(oControl && BaseObject.isA(oControl, "sap.ui.core.Control"), "oControl must be an sap.ui.core.Control");
    return RenderManager.getRenderer(oControl);
};
var RenderPrefixes = RenderManager.RenderPrefixes = {
    Invisible: InvisibleRenderer.PlaceholderPrefix,
    Dummy: "sap-ui-dummy-",
    Temporary: "sap-ui-tmp-"
};
RenderManager.getRenderer = function (oControl) {
    assert(oControl && BaseObject.isA(oControl, "sap.ui.core.Control"), "oControl must be an sap.ui.core.Control");
    return oControl.getMetadata().getRenderer();
};
RenderManager.forceRepaint = function (vDomNode) {
    var oDomNodeById = vDomNode ? window.document.getElementById(vDomNode) : null;
    var oDomNode = typeof vDomNode == "string" ? oDomNodeById : vDomNode;
    if (oDomNode) {
        Log.debug("forcing a repaint for " + (oDomNode.id || String(oDomNode)));
        var sOriginalDisplay = oDomNode.style.display;
        var oActiveElement = document.activeElement;
        oDomNode.style.display = "none";
        oDomNode.offsetHeight;
        oDomNode.style.display = sOriginalDisplay;
        if (document.activeElement !== oActiveElement && oActiveElement) {
            oActiveElement.focus();
        }
    }
};
RenderManager.createInvisiblePlaceholderId = function (oElement) {
    return InvisibleRenderer.createInvisiblePlaceholderId(oElement);
};
var ID_PRESERVE_AREA = "sap-ui-preserve", ID_STATIC_AREA = "sap-ui-static", ATTR_PRESERVE_MARKER = "data-sap-ui-preserve", ATTR_UI_AREA_MARKER = "data-sap-ui-area";
function getPreserveArea() {
    var $preserve = jQuery(document.getElementById(ID_PRESERVE_AREA));
    if ($preserve.length === 0) {
        $preserve = jQuery("<div></div>", { "aria-hidden": "true", id: ID_PRESERVE_AREA }).addClass("sapUiHidden").addClass("sapUiForcedHidden").css("width", "0").css("height", "0").css("overflow", "hidden").appendTo(document.body);
    }
    return $preserve;
}
function makePlaceholder(node) {
    jQuery("<div></div>", { id: RenderPrefixes.Dummy + node.id }).addClass("sapUiHidden").insertBefore(node);
}
var aPreserveContentListeners = [];
RenderManager.attachPreserveContent = function (fnListener, oContext) {
    RenderManager.detachPreserveContent(fnListener);
    aPreserveContentListeners.push({
        fn: fnListener,
        context: oContext
    });
};
RenderManager.detachPreserveContent = function (fnListener) {
    aPreserveContentListeners = aPreserveContentListeners.filter(function (oListener) {
        return oListener.fn !== fnListener;
    });
};
RenderManager.preserveContent = function (oRootNode, bPreserveRoot, bPreserveNodesWithId, oControlBeforeRerender) {
    assert(typeof oRootNode === "object" && oRootNode.ownerDocument == document, "oRootNode must be a DOM element");
    aPreserveContentListeners.forEach(function (oListener) {
        oListener.fn.call(oListener.context || RenderManager, { domNode: oRootNode });
    });
    var $preserve = getPreserveArea();
    function needsPlaceholder(elem) {
        while (elem && elem != oRootNode && elem.parentNode) {
            elem = elem.parentNode;
            if (elem.hasAttribute(ATTR_PRESERVE_MARKER)) {
                return true;
            }
            if (elem.hasAttribute("data-sap-ui")) {
                break;
            }
        }
    }
    function isAncestor(oAncestor, oDescendant, oDescendantDom) {
        if (oAncestor === oDescendant) {
            return true;
        }
        for (var oParent = oDescendant.getParent(); oParent; oParent = oParent.isA("sap.ui.core.UIComponent") ? oParent.oContainer : oParent.getParent()) {
            if (oParent.isA("sap.ui.core.Control")) {
                if (!oParent.getVisible()) {
                    return false;
                }
                var oParentDom = oParent.getDomRef();
                if (oParentDom && !oParentDom.contains(oDescendantDom)) {
                    return false;
                }
            }
            if (oParent === oAncestor) {
                return true;
            }
        }
    }
    function check(candidate) {
        if (candidate.id === ID_PRESERVE_AREA || candidate.id === ID_STATIC_AREA) {
            return;
        }
        var sPreserveMarker = candidate.getAttribute(ATTR_PRESERVE_MARKER);
        if (sPreserveMarker) {
            if (oControlBeforeRerender) {
                var oCandidateControl = sap.ui.getCore().byId(sPreserveMarker);
                if (oCandidateControl && isAncestor(oControlBeforeRerender, oCandidateControl, candidate)) {
                    return;
                }
            }
            if (candidate === oRootNode || needsPlaceholder(candidate)) {
                makePlaceholder(candidate);
            }
            $preserve.append(candidate);
        }
        else if (bPreserveNodesWithId && candidate.id) {
            RenderManager.markPreservableContent(jQuery(candidate), candidate.id);
            $preserve.append(candidate);
            return;
        }
        if (!candidate.hasAttribute(ATTR_UI_AREA_MARKER)) {
            var next = candidate.firstChild;
            while (next) {
                candidate = next;
                next = next.nextSibling;
                if (candidate.nodeType === 1) {
                    check(candidate);
                }
            }
        }
    }
    Measurement.start(oRootNode.id + "---preserveContent", "preserveContent for " + oRootNode.id, ["rendering", "preserve"]);
    if (bPreserveRoot) {
        check(oRootNode);
    }
    else {
        jQuery(oRootNode).children().each(function (i, oNode) {
            check(oNode);
        });
    }
    Measurement.end(oRootNode.id + "---preserveContent");
};
RenderManager.findPreservedContent = function (sId) {
    assert(typeof sId === "string", "sId must be a string");
    var $preserve = getPreserveArea(), $content = $preserve.children("[" + ATTR_PRESERVE_MARKER + "='" + sId.replace(/(:|\.)/g, "\\$1") + "']");
    return $content;
};
RenderManager.markPreservableContent = function ($content, sId) {
    $content.attr(ATTR_PRESERVE_MARKER, sId);
};
RenderManager.isPreservedContent = function (oElement) {
    return (oElement && oElement.getAttribute(ATTR_PRESERVE_MARKER) && oElement.parentNode && oElement.parentNode.id == ID_PRESERVE_AREA);
};
RenderManager.getPreserveAreaRef = function () {
    return getPreserveArea()[0];
};
var ATTR_INLINE_TEMPLATE_MARKER = "data-sap-ui-template";
RenderManager.markInlineTemplate = function ($content) {
    $content.attr(ATTR_INLINE_TEMPLATE_MARKER, "");
};
RenderManager.isInlineTemplate = function (oDomNode) {
    return (oDomNode && oDomNode.hasAttribute(ATTR_INLINE_TEMPLATE_MARKER));
};
RenderManager.getApiVersion = function (oRenderer) {
    if (oRenderer.hasOwnProperty("apiVersion")) {
        return oRenderer.apiVersion;
    }
    return 1;
};
function renderElementData(oRm, oElement) {
    var sId = oElement.getId();
    oRm.attr("data-sap-ui", sId);
    if (oElement.__slot) {
        oRm.attr("slot", oElement.__slot);
    }
    oElement.getCustomData().forEach(function (oData) {
        var oCheckResult = oData._checkWriteToDom(oElement);
        if (oCheckResult) {
            oRm.attr(oCheckResult.key.toLowerCase(), oCheckResult.value);
        }
    });
    var bDraggable = oElement.getDragDropConfig().some(function (vDragDropInfo) {
        return vDragDropInfo.isDraggable(oElement);
    });
    if (!bDraggable) {
        var oParent = oElement.getParent();
        if (oParent && oParent.getDragDropConfig) {
            bDraggable = oParent.getDragDropConfig().some(function (vDragDropInfo) {
                return vDragDropInfo.isDraggable(oElement);
            });
        }
    }
    if (bDraggable) {
        oRm.attr("draggable", "true");
        oRm.attr("data-sap-ui-draggable", "true");
    }
    return this;
}
var mAdjacentMap = { before: "beforebegin", prepend: "afterbegin", append: "beforeend", after: "afterend" };
function insertAdjacent(oElement, sPosition, vHTMLorNode) {
    if (typeof vHTMLorNode == "string") {
        oElement.insertAdjacentHTML(mAdjacentMap[sPosition], vHTMLorNode);
    }
    else {
        oElement[sPosition](vHTMLorNode);
    }
}