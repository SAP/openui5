import jQuery from "sap/ui/thirdparty/jquery";
import DataType from "sap/ui/base/DataType";
import ManagedObject from "sap/ui/base/ManagedObject";
import CustomData from "sap/ui/core/CustomData";
import Component from "sap/ui/core/Component";
import View from "./mvc/View";
import ViewType from "./mvc/ViewType";
import XMLProcessingMode from "./mvc/XMLProcessingMode";
import EventHandlerResolver from "./mvc/EventHandlerResolver";
import ExtensionPoint from "./ExtensionPoint";
import StashedControlSupport from "./StashedControlSupport";
import SyncPromise from "sap/ui/base/SyncPromise";
import Log from "sap/base/Log";
import ObjectPath from "sap/base/util/ObjectPath";
import values from "sap/base/util/values";
import assert from "sap/base/assert";
import encodeXML from "sap/base/security/encodeXML";
import LoaderExtensions from "sap/base/util/LoaderExtensions";
import JSTokenizer from "sap/base/util/JSTokenizer";
import isEmptyObject from "sap/base/util/isEmptyObject";
export class XMLTemplateProcessor {
    private static _preprocessMetadataContexts = null;
    static loadTemplate(sTemplateName: any, sExtension: any) {
        var sResourceName = sTemplateName.replace(/\./g, "/") + ("." + (sExtension || "view") + ".xml");
        return LoaderExtensions.loadResource(sResourceName).documentElement;
    }
    static loadTemplatePromise(sTemplateName: any, sExtension: any) {
        var sResourceName = sTemplateName.replace(/\./g, "/") + ("." + (sExtension || "view") + ".xml");
        return LoaderExtensions.loadResource(sResourceName, { async: true }).then(function (oResult) {
            return oResult.documentElement;
        });
    }
    static parseViewAttributes(xmlNode: any, oView: any, mSettings: any) {
        var mAllProperties = oView.getMetadata().getAllProperties();
        for (var i = 0; i < xmlNode.attributes.length; i++) {
            var attr = xmlNode.attributes[i];
            if (attr.name === "controllerName") {
                oView._controllerName = attr.value;
            }
            else if (attr.name === "resourceBundleName") {
                oView._resourceBundleName = attr.value;
            }
            else if (attr.name === "resourceBundleUrl") {
                oView._resourceBundleUrl = attr.value;
            }
            else if (attr.name === "resourceBundleLocale") {
                oView._resourceBundleLocale = attr.value;
            }
            else if (attr.name === "resourceBundleAlias") {
                oView._resourceBundleAlias = attr.value;
            }
            else if (attr.name === "class") {
                oView.addStyleClass(attr.value);
            }
            else if (!mSettings[attr.name] && mAllProperties[attr.name]) {
                mSettings[attr.name] = parseScalarType(mAllProperties[attr.name].type, attr.value, attr.name, oView._oContainingView.oController);
            }
        }
    }
    static enrichTemplateIds(xmlNode: any, oView: any) {
        XMLTemplateProcessor.enrichTemplateIdsPromise(xmlNode, oView, false);
        return xmlNode;
    }
    static enrichTemplateIdsPromise(xmlNode: any, oView: any, bAsync: any) {
        return parseTemplate(xmlNode, oView, true, bAsync).then(function () {
            return xmlNode;
        });
    }
    static parseTemplate(xmlNode: any, oView: any) {
        return XMLTemplateProcessor.parseTemplatePromise(xmlNode, oView, false).unwrap();
    }
    static parseTemplatePromise(xmlNode: any, oView: any, bAsync: any, oParseConfig: any) {
        return parseTemplate(xmlNode, oView, false, bAsync, oParseConfig).then(function () {
            var p = SyncPromise.resolve(arguments[0]);
            if (oView.isA("sap.ui.core.Fragment")) {
                return p;
            }
            var args = arguments;
            if (oView.isA("sap.ui.core.mvc.View") && oView._epInfo && oView._epInfo.all.length > 0) {
                p = fnTriggerExtensionPointProvider(bAsync, oView, {
                    "content": oView._epInfo.all
                });
            }
            return p.then(function () {
                if (Array.isArray(args[0])) {
                    args[0] = args[0].filter(function (e) {
                        return e == null || !e._isExtensionPoint;
                    });
                }
                return args[0];
            });
        });
    }
    private static _calculatedModelMapping(sBinding: any, oContext: any, bAllowMultipleBindings: any) {
        var oCtx, mBinding = {}, oBinding = ManagedObject.bindingParser(sBinding, oContext);
        function checkFormatter(aFragments) {
            if (aFragments.length % 2 === 0) {
                throw new Error("The last entry is no binding");
            }
            for (var i = 1; i <= aFragments.length; i = i + 2) {
                if (typeof aFragments[i - 1] == "string") {
                    throw new Error("Binding expected not a string");
                }
                if (aFragments[i]) {
                    if ((typeof aFragments[i] != "string") || (aFragments[i] != ",")) {
                        throw new Error("Missing delimiter ','");
                    }
                }
            }
        }
        if (oBinding) {
            if (!oBinding.formatter) {
                oCtx = oBinding;
                oBinding = { parts: [oCtx] };
            }
            else {
                checkFormatter(oBinding.formatter.textFragments);
            }
            for (var i = 0; i < oBinding.parts.length; i++) {
                oCtx = oBinding.parts[i];
                mBinding[oCtx.model] = mBinding[oCtx.model] || (bAllowMultipleBindings ? [] : null);
                if (Array.isArray(mBinding[oCtx.model])) {
                    mBinding[oCtx.model].push(oCtx);
                }
                else {
                    mBinding[oCtx.model] = oCtx;
                }
            }
        }
        return mBinding;
    }
}
function parseScalarType(sType, sValue, sName, oContext, oRequireModules) {
    var oBindingInfo = ManagedObject.bindingParser(sValue, oContext, true, false, false, false, oRequireModules);
    if (oBindingInfo && typeof oBindingInfo === "object") {
        return oBindingInfo;
    }
    var vValue = sValue = typeof oBindingInfo === "string" ? oBindingInfo : sValue;
    var oType = DataType.getType(sType);
    if (oType) {
        if (oType instanceof DataType) {
            vValue = oType.parseValue(sValue, {
                context: oContext,
                locals: oRequireModules
            });
            if (!oType.isValid(vValue)) {
                Log.error("Value '" + sValue + "' is not valid for type '" + oType.getName() + "'.");
            }
        }
    }
    else {
        throw new Error("Property " + sName + " has unknown type " + sType);
    }
    return typeof vValue === "string" ? ManagedObject.bindingParser.escape(vValue) : vValue;
}
function localName(xmlNode) {
    return xmlNode.localName || xmlNode.nodeName;
}
var XHTML_NAMESPACE = "http://www.w3.org/1999/xhtml";
var XMLNS_NAMESPACE = "http://www.w3.org/2000/xmlns/";
var SVG_NAMESPACE = "http://www.w3.org/2000/svg";
var CORE_NAMESPACE = "sap.ui.core";
var CUSTOM_DATA_NAMESPACE = "http://schemas.sap.com/sapui5/extension/sap.ui.core.CustomData/1";
var SUPPORT_INFO_NAMESPACE = "http://schemas.sap.com/sapui5/extension/sap.ui.core.support.Support.info/1";
var XML_COMPOSITE_NAMESPACE = "http://schemas.sap.com/sapui5/extension/sap.ui.core.xmlcomposite/1";
var UI5_INTERNAL_NAMESPACE = "http://schemas.sap.com/sapui5/extension/sap.ui.core.Internal/1";
var PREPROCESSOR_NAMESPACE_PREFIX = "http://schemas.sap.com/sapui5/preprocessorextension/";
var rVoidTags = /^(?:area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)$/;
function getHandleChildrenStrategy(bAsync, fnCallback) {
    function syncStrategy(node, oAggregation, mAggregations, pRequireContext, oClosestBinding) {
        var childNode, vChild, aChildren = [];
        for (childNode = node.firstChild; childNode; childNode = childNode.nextSibling) {
            vChild = fnCallback(node, oAggregation, mAggregations, childNode, false, pRequireContext, oClosestBinding);
            if (vChild) {
                aChildren.push(vChild.unwrap());
            }
        }
        return SyncPromise.resolve(aChildren);
    }
    function asyncStrategy(node, oAggregation, mAggregations, pRequireContext, oClosestBinding) {
        var childNode, pChain = Promise.resolve(), aChildPromises = [pRequireContext];
        for (childNode = node.firstChild; childNode; childNode = childNode.nextSibling) {
            pChain = pChain.then(fnCallback.bind(null, node, oAggregation, mAggregations, childNode, false, pRequireContext, oClosestBinding));
            aChildPromises.push(pChain);
        }
        return Promise.all(aChildPromises);
    }
    return bAsync ? asyncStrategy : syncStrategy;
}
function validateRequireContext(oRequireContext) {
    var sErrorMessage, rIdentifier = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/;
    if (!oRequireContext || typeof oRequireContext !== "object") {
        sErrorMessage = "core:require in XMLView can't be parsed to a valid object";
    }
    else {
        Object.keys(oRequireContext).some(function (sKey) {
            if (!rIdentifier.test(sKey)) {
                sErrorMessage = "core:require in XMLView contains invalid identifier: '" + sKey + "'";
                return true;
            }
            if (!oRequireContext[sKey] || typeof oRequireContext[sKey] !== "string") {
                sErrorMessage = "core:require in XMLView contains invalide value '" + oRequireContext[sKey] + "'under key '" + sKey + "'";
                return true;
            }
        });
    }
    return sErrorMessage;
}
function parseAndLoadRequireContext(xmlNode, bAsync) {
    var sCoreContext = xmlNode.getAttributeNS(CORE_NAMESPACE, "require"), oRequireContext, oModules, sErrorMessage;
    if (sCoreContext) {
        try {
            oRequireContext = JSTokenizer.parseJS(sCoreContext);
        }
        catch (e) {
            Log.error("Require attribute can't be parsed on Node: ", xmlNode.nodeName);
            throw e;
        }
        sErrorMessage = validateRequireContext(oRequireContext);
        if (sErrorMessage) {
            throw new Error(sErrorMessage + " on Node: " + xmlNode.nodeName);
        }
        if (!isEmptyObject(oRequireContext)) {
            oModules = {};
            if (bAsync) {
                return new Promise(function (resolve, reject) {
                    var bAllLoaded = Object.keys(oRequireContext).reduce(function (bAll, sKey) {
                        oModules[sKey] = sap.ui.require(oRequireContext[sKey]);
                        return bAll && oModules[sKey] !== undefined;
                    }, true);
                    if (bAllLoaded) {
                        resolve(oModules);
                        return;
                    }
                    sap.ui.require(values(oRequireContext), function () {
                        var aLoadedModules = arguments;
                        Object.keys(oRequireContext).forEach(function (sKey, i) {
                            oModules[sKey] = aLoadedModules[i];
                        });
                        resolve(oModules);
                    }, reject);
                });
            }
            else {
                Object.keys(oRequireContext).forEach(function (sKey) {
                    oModules[sKey] = sap.ui.requireSync(oRequireContext[sKey]);
                });
                return SyncPromise.resolve(oModules);
            }
        }
    }
}
function fnTriggerExtensionPointProvider(bAsync, oTargetControl, mAggregationsWithExtensionPoints) {
    var pProvider = SyncPromise.resolve();
    if (!isEmptyObject(mAggregationsWithExtensionPoints)) {
        var aAppliedExtensionPoints = [];
        var fnResolveExtensionPoints;
        if (bAsync) {
            pProvider = new Promise(function (resolve) {
                fnResolveExtensionPoints = resolve;
            });
        }
        Object.keys(mAggregationsWithExtensionPoints).forEach(function (sAggregationName) {
            var aExtensionPoints = mAggregationsWithExtensionPoints[sAggregationName];
            aExtensionPoints.forEach(function (oExtensionPoint) {
                oExtensionPoint.targetControl = oTargetControl;
                var fnExtClass = sap.ui.require(oExtensionPoint.providerClass);
                if (fnExtClass) {
                    aAppliedExtensionPoints.push(fnExtClass.applyExtensionPoint(oExtensionPoint));
                }
                else {
                    var p = new Promise(function (resolve, reject) {
                        sap.ui.require([oExtensionPoint.providerClass], function (ExtensionPointProvider) {
                            resolve(ExtensionPointProvider);
                        }, reject);
                    }).then(function (ExtensionPointProvider) {
                        return ExtensionPointProvider.applyExtensionPoint(oExtensionPoint);
                    });
                    aAppliedExtensionPoints.push(p);
                }
            });
        });
        if (bAsync) {
            Promise.all(aAppliedExtensionPoints).then(fnResolveExtensionPoints);
        }
    }
    return pProvider;
}
function findNamespacePrefix(node, namespace, prefix) {
    var sCandidate = prefix;
    for (var iCount = 0; iCount < 100; iCount++) {
        var sRegisteredNamespace = node.lookupNamespaceURI(sCandidate);
        if (sRegisteredNamespace == null || sRegisteredNamespace === namespace) {
            return sCandidate;
        }
        sCandidate = prefix + iCount;
    }
    throw new Error("Could not find an unused namespace prefix after 100 tries, giving up");
}
function parseTemplate(xmlNode, oView, bEnrichFullIds, bAsync, oParseConfig) {
    var aResult = [], sInternalPrefix = findNamespacePrefix(xmlNode, UI5_INTERNAL_NAMESPACE, "__ui5"), pResultChain = parseAndLoadRequireContext(xmlNode, bAsync) || SyncPromise.resolve(), rm = {
        openStart: function (tagName, sId) {
            aResult.push(["openStart", [tagName, sId]]);
        },
        voidStart: function (tagName, sId) {
            aResult.push(["voidStart", [tagName, sId]]);
        },
        style: function (name, value) {
            aResult.push(["style", [name, value]]);
        },
        "class": function (clazz) {
            aResult.push(["class", [clazz]]);
        },
        attr: function (name, value) {
            aResult.push(["attr", [name, value]]);
        },
        openEnd: function () {
            aResult.push(["openEnd"]);
        },
        voidEnd: function () {
            aResult.push(["voidEnd"]);
        },
        text: function (str) {
            aResult.push(["text", [str]]);
        },
        unsafeHtml: function (str) {
            aResult.push(["unsafeHtml", [str]]);
        },
        close: function (tagName) {
            aResult.push(["close", [tagName]]);
        },
        renderControl: function (content) {
            aResult.push(pResultChain);
        }
    };
    bAsync = bAsync && !!oView._sProcessingMode;
    Log.debug("XML processing mode is " + (oView._sProcessingMode || "default") + ".", "", "XMLTemplateProcessor");
    Log.debug("XML will be processed " + bAsync ? "asynchronously" : "synchronously" + ".", "", "XMLTemplateProcessor");
    var bDesignMode = sap.ui.getCore().getConfiguration().getDesignMode();
    if (bDesignMode) {
        oView._sapui_declarativeSourceInfo = {
            xmlNode: xmlNode,
            xmlRootNode: oView._oContainingView === oView ? xmlNode : oView._oContainingView._sapui_declarativeSourceInfo.xmlRootNode
        };
    }
    var sCurrentName = oView.sViewName || oView._sFragmentName;
    if (!sCurrentName) {
        var oTopView = oView;
        var iLoopCounter = 0;
        while (++iLoopCounter < 1000 && oTopView && oTopView !== oTopView._oContainingView) {
            oTopView = oTopView._oContainingView;
        }
        sCurrentName = oTopView.sViewName;
    }
    if (oView.isSubView()) {
        parseNode(xmlNode, true, false, pResultChain);
    }
    else {
        if (xmlNode.localName === "View" && xmlNode.namespaceURI !== "sap.ui.core.mvc") {
            Log.warning("XMLView root node must have the 'sap.ui.core.mvc' namespace, not '" + xmlNode.namespaceURI + "'" + (sCurrentName ? " (View name: " + sCurrentName + ")" : ""));
        }
        xmlNode.setAttributeNS(XMLNS_NAMESPACE, "xmlns:" + sInternalPrefix, UI5_INTERNAL_NAMESPACE);
        parseChildren(xmlNode, false, false, pResultChain);
    }
    var i = 0;
    function resolveResultPromises() {
        for (; i < aResult.length; i++) {
            var vElement = aResult[i];
            if (vElement && typeof vElement.then === "function") {
                return vElement.then(spliceContentIntoResult).then(resolveResultPromises);
            }
        }
        return aResult;
    }
    function spliceContentIntoResult(vContent) {
        var args = [i, 1].concat(vContent);
        Array.prototype.splice.apply(aResult, args);
    }
    return pResultChain.then(resolveResultPromises);
    function identity(sId) {
        return sId;
    }
    function createId(sId) {
        return oView._oContainingView.createId(sId);
    }
    function parseNode(xmlNode, bRoot, bIgnoreTopLevelTextNodes, pRequireContext) {
        if (xmlNode.nodeType === 1) {
            var sLocalName = localName(xmlNode);
            var bXHTML = xmlNode.namespaceURI === XHTML_NAMESPACE;
            if (bXHTML || xmlNode.namespaceURI === SVG_NAMESPACE) {
                var sId = xmlNode.getAttribute("id");
                if (sId == null) {
                    sId = bRoot === true ? oView.getId() : undefined;
                }
                else {
                    sId = getId(oView, xmlNode);
                }
                if (sLocalName === "style") {
                    xmlNode = xmlNode.cloneNode(true);
                    if (sId != null) {
                        xmlNode.setAttribute("id", sId);
                    }
                    if (bRoot === true) {
                        xmlNode.setAttribute("data-sap-ui-preserve", oView.getId());
                    }
                    rm.unsafeHtml(xmlNode.outerHTML);
                    return;
                }
                var bVoid = rVoidTags.test(sLocalName);
                if (bVoid) {
                    rm.voidStart(sLocalName, sId);
                }
                else {
                    rm.openStart(sLocalName, sId);
                }
                for (var i = 0; i < xmlNode.attributes.length; i++) {
                    var attr = xmlNode.attributes[i];
                    if (attr.name !== "id") {
                        rm.attr(bXHTML ? attr.name.toLowerCase() : attr.name, attr.value);
                    }
                }
                if (bRoot === true) {
                    rm.attr("data-sap-ui-preserve", oView.getId());
                }
                if (bVoid) {
                    rm.voidEnd();
                    if (xmlNode.firstChild) {
                        Log.error("Content of void HTML element '" + sLocalName + "' will be ignored");
                    }
                }
                else {
                    rm.openEnd();
                    var oContent = xmlNode instanceof HTMLTemplateElement ? xmlNode.content : xmlNode;
                    parseChildren(oContent, false, false, pRequireContext);
                    rm.close(sLocalName);
                }
            }
            else if (sLocalName === "FragmentDefinition" && xmlNode.namespaceURI === CORE_NAMESPACE) {
                parseChildren(xmlNode, false, true, pRequireContext);
            }
            else {
                pResultChain = pResultChain.then(function () {
                    return createControlOrExtension(xmlNode, pRequireContext).then(function (aChildControls) {
                        for (var i = 0; i < aChildControls.length; i++) {
                            var oChild = aChildControls[i];
                            if (oView.getMetadata().hasAggregation("content")) {
                                oView._epInfo = oView._epInfo || {
                                    contentControlsCount: 0,
                                    last: null,
                                    all: []
                                };
                                if (oChild._isExtensionPoint) {
                                    oChild.index = oView._epInfo.contentControlsCount;
                                    oChild.targetControl = oView;
                                    oChild.aggregationName = "content";
                                    if (oView._epInfo.last) {
                                        oView._epInfo.last._nextSibling = oChild;
                                    }
                                    oView._epInfo.last = oChild;
                                    oView._epInfo.all.push(oChild);
                                }
                                else {
                                    oView._epInfo.contentControlsCount++;
                                    oView.addAggregation("content", oChild);
                                }
                            }
                            else if (oView.getMetadata().hasAssociation(("content"))) {
                                oView.addAssociation("content", oChild);
                            }
                        }
                        return aChildControls;
                    });
                });
                rm.renderControl(pResultChain);
            }
        }
        else if (xmlNode.nodeType === 3 && !bIgnoreTopLevelTextNodes) {
            rm.text(xmlNode.textContent);
        }
    }
    function parseChildren(xmlNode, bRoot, bIgnoreToplevelTextNodes, pRequireContext) {
        var children = xmlNode.childNodes;
        for (var i = 0; i < children.length; i++) {
            parseNode(children[i], bRoot, bIgnoreToplevelTextNodes, pRequireContext);
        }
    }
    function findControlClass(sNamespaceURI, sLocalName) {
        var sClassName;
        var mLibraries = sap.ui.getCore().getLoadedLibraries();
        jQuery.each(mLibraries, function (sLibName, oLibrary) {
            if (sNamespaceURI === oLibrary.namespace || sNamespaceURI === oLibrary.name) {
                sClassName = oLibrary.name + "." + ((oLibrary.tagNames && oLibrary.tagNames[sLocalName]) || sLocalName);
            }
        });
        sClassName = sClassName || sNamespaceURI + "." + sLocalName;
        function getObjectFallback(oClassObject) {
            if (!oClassObject) {
                Log.error("Control '" + sClassName + "' did not return a class definition from sap.ui.define.", "", "XMLTemplateProcessor");
                oClassObject = ObjectPath.get(sClassName);
            }
            if (!oClassObject) {
                Log.error("Can't find object class '" + sClassName + "' for XML-view", "", "XMLTemplateProcessor");
            }
            return oClassObject;
        }
        var sResourceName = sClassName.replace(/\./g, "/");
        var oClassObject = sap.ui.require(sResourceName);
        if (!oClassObject) {
            if (bAsync) {
                return new Promise(function (resolve, reject) {
                    sap.ui.require([sResourceName], function (oClassObject) {
                        oClassObject = getObjectFallback(oClassObject);
                        resolve(oClassObject);
                    }, reject);
                });
            }
            else {
                oClassObject = sap.ui.requireSync(sResourceName);
                oClassObject = getObjectFallback(oClassObject);
            }
        }
        return oClassObject;
    }
    function createControls(node, pRequireContext, oClosestBinding) {
        if (node.namespaceURI === XHTML_NAMESPACE || node.namespaceURI === SVG_NAMESPACE) {
            var id = node.attributes["id"] ? node.attributes["id"].textContent || node.attributes["id"].text : null;
            if (bEnrichFullIds) {
                return XMLTemplateProcessor.enrichTemplateIdsPromise(node, oView, bAsync).then(function () {
                    return [];
                });
            }
            else {
                var fnCreateView = function (oViewClass) {
                    var mViewParameters = {
                        id: id ? getId(oView, node, id) : undefined,
                        xmlNode: node,
                        containingView: oView._oContainingView,
                        processingMode: oView._sProcessingMode
                    };
                    if (oView.fnScopedRunWithOwner) {
                        return oView.fnScopedRunWithOwner(function () {
                            return new oViewClass(mViewParameters);
                        });
                    }
                    return new oViewClass(mViewParameters);
                };
                if (bAsync) {
                    return new Promise(function (resolve, reject) {
                        sap.ui.require(["sap/ui/core/mvc/XMLView"], function (XMLView) {
                            resolve([fnCreateView(XMLView)]);
                        }, reject);
                    });
                }
                else {
                    var XMLView = sap.ui.requireSync("sap/ui/core/mvc/XMLView");
                    return SyncPromise.resolve([fnCreateView(XMLView)]);
                }
            }
        }
        else {
            return createControlOrExtension(node, pRequireContext, oClosestBinding);
        }
    }
    function createControlOrExtension(node, pRequireContext, oClosestBinding) {
        if (localName(node) === "ExtensionPoint" && node.namespaceURI === CORE_NAMESPACE) {
            if (bEnrichFullIds) {
                return SyncPromise.resolve([]);
            }
            else {
                var oContainer = oView instanceof View ? oView._oContainingView : oView;
                var fnExtensionPointFactory = ExtensionPoint._factory.bind(null, oContainer, node.getAttribute("name"), function () {
                    var pChild = SyncPromise.resolve();
                    var aChildControlPromises = [];
                    var children = node.childNodes;
                    for (var i = 0; i < children.length; i++) {
                        var oChildNode = children[i];
                        if (oChildNode.nodeType === 1) {
                            pChild = pChild.then(createControls.bind(null, oChildNode, pRequireContext, oClosestBinding));
                            aChildControlPromises.push(pChild);
                        }
                    }
                    return SyncPromise.all(aChildControlPromises).then(function (aChildControl) {
                        var aDefaultContent = [];
                        aChildControl.forEach(function (aControls) {
                            aDefaultContent = aDefaultContent.concat(aControls);
                        });
                        return aDefaultContent;
                    });
                }, undefined, undefined, bAsync);
                return SyncPromise.resolve(oView.fnScopedRunWithOwner ? oView.fnScopedRunWithOwner(fnExtensionPointFactory) : fnExtensionPointFactory());
            }
        }
        else {
            var vClass = findControlClass(node.namespaceURI, localName(node));
            if (vClass && typeof vClass.then === "function") {
                return vClass.then(function (fnClass) {
                    return createRegularControls(node, fnClass, pRequireContext, oClosestBinding);
                });
            }
            else {
                return createRegularControls(node, vClass, pRequireContext, oClosestBinding);
            }
        }
    }
    function createRegularControls(node, oClass, pRequireContext, oClosestBinding) {
        var ns = node.namespaceURI, mSettings = {}, mAggregationsWithExtensionPoints = {}, sStyleClasses = "", aCustomData = [], mCustomSettings = null, sSupportData = null, bStashedControl = node.getAttribute("stashed") === "true";
        if (!bEnrichFullIds) {
            node.removeAttribute("stashed");
        }
        if (!oClass) {
            return SyncPromise.resolve([]);
        }
        var oMetadata = oClass.getMetadata();
        var mKnownSettings = oMetadata.getAllSettings();
        var pSelfRequireContext = parseAndLoadRequireContext(node, bAsync);
        if (pSelfRequireContext) {
            pRequireContext = SyncPromise.all([pRequireContext, pSelfRequireContext]).then(function (aRequiredModules) {
                return Object.assign({}, aRequiredModules[0], aRequiredModules[1]);
            });
        }
        pRequireContext = pRequireContext.then(function (oRequireModules) {
            if (isEmptyObject(oRequireModules)) {
                oRequireModules = null;
            }
            if (!bEnrichFullIds) {
                for (var i = 0; i < node.attributes.length; i++) {
                    var attr = node.attributes[i], sName = attr.name, sNamespace = attr.namespaceURI, oInfo = mKnownSettings[sName], sValue = attr.value;
                    if (sName === "id") {
                        mSettings[sName] = getId(oView, node, sValue);
                    }
                    else if (sName === "class") {
                        sStyleClasses += sValue;
                    }
                    else if (sName === "viewName") {
                        mSettings[sName] = sValue;
                    }
                    else if (sName === "fragmentName") {
                        mSettings[sName] = sValue;
                        mSettings["containingView"] = oView._oContainingView;
                    }
                    else if ((sName === "binding" && !oInfo) || sName === "objectBindings") {
                        if (!bStashedControl) {
                            var oBindingInfo = ManagedObject.bindingParser(sValue, oView._oContainingView.oController);
                            if (oBindingInfo) {
                                mSettings.objectBindings = mSettings.objectBindings || {};
                                mSettings.objectBindings[oBindingInfo.model || undefined] = oBindingInfo;
                            }
                        }
                    }
                    else if (sName === "metadataContexts") {
                        if (!bStashedControl) {
                            var mMetaContextsInfo = null;
                            try {
                                mMetaContextsInfo = XMLTemplateProcessor._calculatedModelMapping(sValue, oView._oContainingView.oController, true);
                            }
                            catch (e) {
                                Log.error(oView + ":" + e.message);
                            }
                            if (mMetaContextsInfo) {
                                mSettings.metadataContexts = mMetaContextsInfo;
                                if (XMLTemplateProcessor._preprocessMetadataContexts) {
                                    XMLTemplateProcessor._preprocessMetadataContexts(oClass.getMetadata().getName(), mSettings, oView._oContainingView.oController);
                                }
                            }
                        }
                    }
                    else if (sName.indexOf(":") > -1) {
                        sNamespace = attr.namespaceURI;
                        if (sNamespace === CUSTOM_DATA_NAMESPACE) {
                            var sLocalName = localName(attr);
                            aCustomData.push(new CustomData({
                                key: sLocalName,
                                value: parseScalarType("any", sValue, sLocalName, oView._oContainingView.oController, oRequireModules)
                            }));
                        }
                        else if (sNamespace === SUPPORT_INFO_NAMESPACE) {
                            sSupportData = sValue;
                        }
                        else if (sNamespace && sNamespace.startsWith(PREPROCESSOR_NAMESPACE_PREFIX)) {
                            Log.debug(oView + ": XMLView parser ignored preprocessor attribute '" + sName + "' (value: '" + sValue + "')");
                        }
                        else if (sNamespace === UI5_INTERNAL_NAMESPACE && localName(attr) === "invisible") {
                            oInfo = mKnownSettings.visible;
                            if (oInfo && oInfo._iKind === 0 && oInfo.type === "boolean") {
                                mSettings.visible = false;
                            }
                        }
                        else if (sNamespace === CORE_NAMESPACE || sNamespace === UI5_INTERNAL_NAMESPACE || sName.startsWith("xmlns:")) {
                        }
                        else {
                            if (!mCustomSettings) {
                                mCustomSettings = {};
                            }
                            if (!mCustomSettings.hasOwnProperty(attr.namespaceURI)) {
                                mCustomSettings[attr.namespaceURI] = {};
                            }
                            mCustomSettings[attr.namespaceURI][localName(attr)] = attr.nodeValue;
                            Log.debug(oView + ": XMLView parser encountered unknown attribute '" + sName + "' (value: '" + sValue + "') with unknown namespace, stored as sap-ui-custom-settings of customData");
                        }
                    }
                    else if (oInfo && oInfo._iKind === 0) {
                        mSettings[sName] = parseScalarType(oInfo.type, sValue, sName, oView._oContainingView.oController, oRequireModules);
                    }
                    else if (oInfo && oInfo._iKind === 1 && oInfo.altTypes) {
                        if (!bStashedControl) {
                            mSettings[sName] = parseScalarType(oInfo.altTypes[0], sValue, sName, oView._oContainingView.oController, oRequireModules);
                        }
                    }
                    else if (oInfo && oInfo._iKind === 2) {
                        if (!bStashedControl) {
                            var oBindingInfo = ManagedObject.bindingParser(sValue, oView._oContainingView.oController, false, false, false, false, oRequireModules);
                            if (oBindingInfo) {
                                mSettings[sName] = oBindingInfo;
                            }
                            else {
                                Log.error(oView + ": aggregations with cardinality 0..n only allow binding paths as attribute value (wrong value: " + sName + "='" + sValue + "')");
                            }
                        }
                    }
                    else if (oInfo && oInfo._iKind === 3) {
                        if (!bStashedControl) {
                            mSettings[sName] = createId(sValue);
                        }
                    }
                    else if (oInfo && oInfo._iKind === 4) {
                        if (!bStashedControl) {
                            mSettings[sName] = sValue.split(/[\s,]+/g).filter(identity).map(createId);
                        }
                    }
                    else if (oInfo && oInfo._iKind === 5) {
                        if (!bStashedControl) {
                            var aEventHandlers = [];
                            EventHandlerResolver.parse(sValue).forEach(function (sEventHandler) {
                                var vEventHandler = EventHandlerResolver.resolveEventHandler(sEventHandler, oView._oContainingView.oController, oRequireModules);
                                if (vEventHandler) {
                                    aEventHandlers.push(vEventHandler);
                                }
                                else {
                                    Log.warning(oView + ": event handler function \"" + sEventHandler + "\" is not a function or does not exist in the controller.");
                                }
                            });
                            if (aEventHandlers.length) {
                                mSettings[sName] = aEventHandlers;
                            }
                        }
                    }
                    else if (oInfo && oInfo._iKind === -1) {
                        if (oMetadata.isA("sap.ui.core.mvc.View") && sName == "async") {
                            mSettings[sName] = parseScalarType(oInfo.type, sValue, sName, oView._oContainingView.oController, oRequireModules);
                        }
                        else {
                            Log.warning(oView + ": setting '" + sName + "' for class " + oMetadata.getName() + " (value:'" + sValue + "') is not supported");
                        }
                    }
                    else {
                        assert(sName === "xmlns", oView + ": encountered unknown setting '" + sName + "' for class " + oMetadata.getName() + " (value:'" + sValue + "')");
                        if (XMLTemplateProcessor._supportInfo) {
                            XMLTemplateProcessor._supportInfo({
                                context: node,
                                env: {
                                    caller: "createRegularControls",
                                    error: true,
                                    info: "unknown setting '" + sName + "' for class " + oMetadata.getName()
                                }
                            });
                        }
                    }
                }
                if (mCustomSettings) {
                    aCustomData.push(new CustomData({
                        key: "sap-ui-custom-settings",
                        value: mCustomSettings
                    }));
                }
                if (aCustomData.length > 0) {
                    mSettings.customData = aCustomData;
                }
            }
            return oRequireModules;
        }).catch(function (oError) {
            if (!oError.isEnriched) {
                var sType = oView.getMetadata().isA("sap.ui.core.mvc.View") ? "View" : "Fragment";
                var sNodeSerialization = node && node.cloneNode(false).outerHTML;
                oError = new Error("Error found in " + sType + " (id: '" + oView.getId() + "').\nXML node: '" + sNodeSerialization + "':\n" + oError);
                oError.isEnriched = true;
                Log.error(oError);
            }
            if (bAsync && oView._sProcessingMode !== XMLProcessingMode.SequentialLegacy) {
                throw oError;
            }
        });
        var handleChildren = getHandleChildrenStrategy(bAsync, handleChild);
        function handleChild(node, oAggregation, mAggregations, childNode, bActivate, pRequireContext, oClosestBinding) {
            var oNamedAggregation, fnCreateStashedControl;
            if (childNode.nodeType === 1) {
                if (childNode.namespaceURI === XML_COMPOSITE_NAMESPACE) {
                    mSettings[localName(childNode)] = childNode.querySelector("*");
                    return;
                }
                oNamedAggregation = childNode.namespaceURI === ns && mAggregations && mAggregations[localName(childNode)];
                if (oNamedAggregation) {
                    return handleChildren(childNode, oNamedAggregation, false, pRequireContext, oClosestBinding);
                }
                else if (oAggregation) {
                    if (!bActivate && childNode.getAttribute("stashed") === "true" && !bEnrichFullIds) {
                        var oStashedNode = childNode;
                        childNode = childNode.cloneNode();
                        oStashedNode.removeAttribute("stashed");
                        fnCreateStashedControl = function () {
                            var sControlId = getId(oView, childNode);
                            StashedControlSupport.createStashedControl({
                                wrapperId: sControlId,
                                fnCreate: function () {
                                    var bPrevAsync = bAsync;
                                    bAsync = false;
                                    try {
                                        return handleChild(node, oAggregation, mAggregations, oStashedNode, true, pRequireContext, oClosestBinding).unwrap();
                                    }
                                    finally {
                                        bAsync = bPrevAsync;
                                    }
                                }
                            });
                        };
                        if (oView.fnScopedRunWithOwner) {
                            oView.fnScopedRunWithOwner(fnCreateStashedControl);
                        }
                        else {
                            fnCreateStashedControl();
                        }
                        childNode.removeAttribute("visible");
                        setUI5Attribute(childNode, "invisible");
                    }
                    if (mSettings[oAggregation.name] && mSettings[oAggregation.name].path && typeof mSettings[oAggregation.name].path === "string") {
                        oClosestBinding = {
                            aggregation: oAggregation.name,
                            id: mSettings.id
                        };
                    }
                    return createControls(childNode, pRequireContext, oClosestBinding).then(function (aControls) {
                        for (var j = 0; j < aControls.length; j++) {
                            var oControl = aControls[j];
                            var name = oAggregation.name;
                            if (oControl._isExtensionPoint) {
                                if (!mSettings[name]) {
                                    mSettings[name] = [];
                                }
                                var aExtensionPointList = mAggregationsWithExtensionPoints[name];
                                if (!aExtensionPointList) {
                                    aExtensionPointList = mAggregationsWithExtensionPoints[name] = [];
                                }
                                oControl.index = mSettings[name].length;
                                oControl.aggregationName = name;
                                oControl.closestAggregationBindingCarrier = oClosestBinding && oClosestBinding.id;
                                oControl.closestAggregationBinding = oClosestBinding && oClosestBinding.aggregation;
                                var oLast = aExtensionPointList[aExtensionPointList.length - 1];
                                if (oLast) {
                                    oLast._nextSibling = oControl;
                                }
                                aExtensionPointList.push(oControl);
                            }
                            else if (oAggregation.multiple) {
                                if (!mSettings[name]) {
                                    mSettings[name] = [];
                                }
                                if (typeof mSettings[name].path === "string") {
                                    assert(!mSettings[name].template, "list bindings support only a single template object");
                                    mSettings[name].template = oControl;
                                }
                                else {
                                    mSettings[name].push(oControl);
                                }
                            }
                            else {
                                assert(!mSettings[name], "multiple aggregates defined for aggregation with cardinality 0..1");
                                mSettings[name] = oControl;
                            }
                        }
                        return aControls;
                    });
                }
                else if (localName(node) !== "FragmentDefinition" || node.namespaceURI !== CORE_NAMESPACE) {
                    throw new Error("Cannot add direct child without default aggregation defined for control " + oMetadata.getElementName());
                }
            }
            else if (childNode.nodeType === 3) {
                var sTextContent = childNode.textContent || childNode.text;
                if (sTextContent && sTextContent.trim()) {
                    throw new Error("Cannot add text nodes as direct child of an aggregation. For adding text to an aggregation, a surrounding html tag is needed: " + sTextContent.trim());
                }
            }
        }
        var oAggregation = oMetadata.getDefaultAggregation();
        var mAggregations = oMetadata.getAllAggregations();
        return handleChildren(node, oAggregation, mAggregations, pRequireContext, oClosestBinding).then(function () {
            var vNewControlInstance;
            var pProvider = SyncPromise.resolve();
            var pInstanceCreated = SyncPromise.resolve();
            var sType = node.getAttribute("type");
            var oOwnerComponent = Component.getOwnerComponentFor(oView);
            var bIsAsyncComponent = oOwnerComponent && oOwnerComponent.isA("sap.ui.core.IAsyncContentCreation");
            if (bEnrichFullIds && node.hasAttribute("id")) {
                setId(oView, node);
            }
            else if (!bEnrichFullIds) {
                if (oClass.getMetadata().isA("sap.ui.core.mvc.View")) {
                    var fnCreateViewInstance = function () {
                        if (!oClass._sType && !mSettings.viewName) {
                            mSettings.viewName = "module:" + oClass.getMetadata().getName().replace(/\./g, "/");
                        }
                        if (bIsAsyncComponent && bAsync) {
                            if (mSettings.async === false) {
                                throw new Error("A nested view contained in a Component implementing 'sap.ui.core.IAsyncContentCreation' is processed asynchronously by default and cannot be processed synchronously.\n" + "Affected Component '" + oOwnerComponent.getMetadata().getComponentName() + "' and View '" + mSettings.viewName + "'.");
                            }
                            mSettings.type = oClass._sType || sType;
                            pInstanceCreated = View.create(mSettings);
                        }
                        else {
                            if (oClass.getMetadata().isA("sap.ui.core.mvc.XMLView") && oView._sProcessingMode) {
                                mSettings.processingMode = oView._sProcessingMode;
                            }
                            return View._create(mSettings, undefined, oClass._sType || sType);
                        }
                    };
                    if (oView.fnScopedRunWithOwner) {
                        vNewControlInstance = oView.fnScopedRunWithOwner(fnCreateViewInstance);
                    }
                    else {
                        vNewControlInstance = fnCreateViewInstance();
                    }
                }
                else if (oClass.getMetadata().isA("sap.ui.core.Fragment") && bAsync) {
                    if (sType !== ViewType.JS) {
                        mSettings.processingMode = oView._sProcessingMode;
                    }
                    var sFragmentPath = "sap/ui/core/Fragment";
                    var Fragment = sap.ui.require(sFragmentPath);
                    mSettings.name = mSettings.name || mSettings.fragmentName;
                    if (Fragment) {
                        pInstanceCreated = Fragment.load(mSettings);
                    }
                    else {
                        pInstanceCreated = new Promise(function (resolve, reject) {
                            sap.ui.require([sFragmentPath], function (Fragment) {
                                Fragment.load(mSettings).then(function (oFragmentContent) {
                                    resolve(oFragmentContent);
                                });
                            }, reject);
                        });
                    }
                }
                else {
                    var fnCreateInstance = function () {
                        var oInstance;
                        if (oView.fnScopedRunWithOwner) {
                            oInstance = oView.fnScopedRunWithOwner(function () {
                                var oInstance = new oClass(mSettings);
                                return oInstance;
                            });
                        }
                        else {
                            oInstance = new oClass(mSettings);
                        }
                        pProvider = fnTriggerExtensionPointProvider(bAsync, oInstance, mAggregationsWithExtensionPoints);
                        return oInstance;
                    };
                    if (oParseConfig && oParseConfig.fnRunWithPreprocessor) {
                        vNewControlInstance = oParseConfig.fnRunWithPreprocessor(fnCreateInstance);
                    }
                    else {
                        vNewControlInstance = fnCreateInstance();
                    }
                }
            }
            return pInstanceCreated.then(function (vContent) {
                return vContent || vNewControlInstance;
            }).then(function (vFinalInstance) {
                if (sStyleClasses && vFinalInstance.addStyleClass) {
                    vFinalInstance.addStyleClass(sStyleClasses);
                }
                if (!vFinalInstance) {
                    vFinalInstance = [];
                }
                else if (!Array.isArray(vFinalInstance)) {
                    vFinalInstance = [vFinalInstance];
                }
                if (XMLTemplateProcessor._supportInfo && vFinalInstance) {
                    for (var i = 0, iLength = vFinalInstance.length; i < iLength; i++) {
                        var oInstance = vFinalInstance[i];
                        if (oInstance && oInstance.getId()) {
                            var iSupportIndex = XMLTemplateProcessor._supportInfo({ context: node, env: { caller: "createRegularControls", nodeid: node.getAttribute("id"), controlid: oInstance.getId() } }), sData = sSupportData ? sSupportData + "," : "";
                            sData += iSupportIndex;
                            XMLTemplateProcessor._supportInfo.addSupportInfo(oInstance.getId(), sData);
                        }
                    }
                }
                if (bDesignMode) {
                    vFinalInstance.forEach(function (oInstance) {
                        if (oMetadata.getCompositeAggregationName) {
                            var aNodes = node.getElementsByTagName(oInstance.getMetadata().getCompositeAggregationName());
                            for (var i = 0; i < aNodes.length; i++) {
                                node.removeChild(aNodes[0]);
                            }
                        }
                        oInstance._sapui_declarativeSourceInfo = {
                            xmlNode: node,
                            xmlRootNode: oView._sapui_declarativeSourceInfo.xmlRootNode,
                            fragmentName: oMetadata.getName() === "sap.ui.core.Fragment" ? mSettings["fragmentName"] : null
                        };
                    });
                }
                return pProvider.then(function () {
                    return vFinalInstance;
                });
            });
        });
    }
    function setUI5Attribute(node, name) {
        var sPrefix = findNamespacePrefix(node, UI5_INTERNAL_NAMESPACE, sInternalPrefix);
        node.setAttributeNS(UI5_INTERNAL_NAMESPACE, sPrefix + ":" + name, "true");
    }
    function getId(oView, xmlNode, sId) {
        if (xmlNode.getAttributeNS(UI5_INTERNAL_NAMESPACE, "id")) {
            return xmlNode.getAttribute("id");
        }
        else {
            return createId(sId ? sId : xmlNode.getAttribute("id"));
        }
    }
    function setId(oView, xmlNode) {
        xmlNode.setAttribute("id", createId(xmlNode.getAttribute("id")));
        setUI5Attribute(xmlNode, "id");
    }
}