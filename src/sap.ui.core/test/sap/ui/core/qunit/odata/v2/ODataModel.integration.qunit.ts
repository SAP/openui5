import Log from "sap/base/Log";
import uid from "sap/base/util/uid";
import Device from "sap/ui/Device";
import ManagedObjectObserver from "sap/ui/base/ManagedObjectObserver";
import SyncPromise from "sap/ui/base/SyncPromise";
import coreLibrary from "sap/ui/core/library";
import Message from "sap/ui/core/message/Message";
import Controller from "sap/ui/core/mvc/Controller";
import View from "sap/ui/core/mvc/View";
import BindingMode from "sap/ui/model/BindingMode";
import Filter from "sap/ui/model/Filter";
import FilterOperator from "sap/ui/model/FilterOperator";
import Sorter from "sap/ui/model/Sorter";
import JSONModel from "sap/ui/model/json/JSONModel";
import CountMode from "sap/ui/model/odata/CountMode";
import MessageScope from "sap/ui/model/odata/MessageScope";
import ODataModel from "sap/ui/model/odata/v2/ODataModel";
import TestUtils from "sap/ui/test/TestUtils";
import datajs from "sap/ui/thirdparty/datajs";
import XMLHelper from "sap/ui/util/XMLHelper";
var sDefaultLanguage = sap.ui.getCore().getConfiguration().getLanguage(), MessageType = coreLibrary.MessageType, NO_CONTENT = {}, sODataMessageParserClassName = "sap.ui.model.odata.ODataMessageParser", sODataModelClassName = "sap.ui.model.odata.v2.ODataModel", rRowIndex = /~(\d+)~/, mSeverityMap = {
    error: MessageType.Error,
    warning: MessageType.Warning,
    success: MessageType.Success,
    info: MessageType.Information
}, rTemporaryKey = /id(?:-[0-9]+){2}/;
function cloneODataMessage(oODataMessage, sTarget, aAdditionalTargets) {
    return Object.assign({}, oODataMessage, { target: sTarget, additionalTargets: aAdditionalTargets });
}
function createErrorResponse(oErrorResponseInfo) {
    var oError;
    oErrorResponseInfo = oErrorResponseInfo || {};
    oError = {
        code: oErrorResponseInfo.messageCode || "UF0",
        message: {
            value: oErrorResponseInfo.message || "Internal Server Error"
        }
    };
    if (oErrorResponseInfo.hasOwnProperty("target")) {
        oError.target = oErrorResponseInfo.target;
    }
    return {
        body: JSON.stringify({
            error: oError
        }),
        crashBatch: oErrorResponseInfo.crashBatch,
        headers: { "Content-Type": "application/json;charset=utf-8" },
        statusCode: oErrorResponseInfo.statusCode || 500,
        statusText: "FAILED"
    };
}
function createModel(sServiceUrl, mModelParameters) {
    var mDefaultParameters = {
        defaultCountMode: CountMode.None,
        serviceUrl: sServiceUrl
    };
    return new ODataModel(Object.assign(mDefaultParameters, mModelParameters));
}
function createPPWorkcenterGroupModel(mModelParameters) {
    return createModel("/sap/opu/odata/sap/PP_WORKCENTER_GROUP_SRV", mModelParameters);
}
function createRMTSampleFlightModel(mModelParameters) {
    return createModel("/sap/opu/odata/IWBEP/RMTSAMPLEFLIGHT", mModelParameters);
}
function createSalesOrdersModel(mModelParameters) {
    return createModel("/sap/opu/odata/IWBEP/GWSAMPLE_BASIC/", mModelParameters);
}
function createSalesOrdersModelMessageScope(mModelParameters) {
    return createModel("/SalesOrderSrv/", mModelParameters);
}
function createAllowanceModel(mModelParameters) {
    return createModel("/sap/opu/odata/sap/UI_C_DFS_ALLWNCREQ/", mModelParameters);
}
function createSpecialCasesModel(mModelParameters) {
    return createModel("/special/cases/", mModelParameters);
}
function getMessageHeader(vMessage) {
    var bIsArray = Array.isArray(vMessage), oMessage = bIsArray ? vMessage[0] : vMessage;
    return JSON.stringify(Object.assign(oMessage, { details: bIsArray ? vMessage.slice(1) : [] }));
}
function resolveLater(fnCallback, iDelay) {
    return new Promise(function (resolve) {
        setTimeout(function () {
            resolve(fnCallback && fnCallback());
        }, iDelay || 5);
    });
}
function xml(sViewXML) {
    var oDocument;
    oDocument = XMLHelper.parse("<mvc:View xmlns=\"sap.m\" xmlns:mvc=\"sap.ui.core.mvc\" xmlns:t=\"sap.ui.table\">" + sViewXML + "</mvc:View>", "application/xml");
    xmlConvertMTables(oDocument);
    xmlConvertGridTables(oDocument);
    return oDocument;
}
function xmlConvertGridTables(oDocument) {
    function convertElements(aElements) {
        var oChildNode, aChildNodes, oColumn, oElement, i, j, oTemplate;
        for (i = aElements.length - 1; i >= 0; i -= 1) {
            oElement = aElements[i];
            aChildNodes = oElement.childNodes;
            for (j = aChildNodes.length - 1; j >= 0; j -= 1) {
                oChildNode = aChildNodes[j];
                if (oChildNode.nodeType === Node.ELEMENT_NODE && oChildNode.localName !== "Column") {
                    oColumn = document.createElementNS("sap.ui.table", "Column");
                    oElement.insertBefore(oColumn, oChildNode);
                    oElement.removeChild(oChildNode);
                    oTemplate = document.createElementNS("sap.ui.table", "template");
                    oColumn.appendChild(oTemplate);
                    oTemplate.appendChild(oChildNode);
                }
            }
        }
    }
    convertElements(oDocument.getElementsByTagNameNS("sap.ui.table", "Table"));
    convertElements(oDocument.getElementsByTagNameNS("sap.ui.table", "TreeTable"));
}
function xmlConvertMTables(oDocument) {
    var aControls, oChildNode, aChildNodes, iColumnCount, aColumnNodes, oColumnsElement, oElement, bHasColumns, bHasListItem, i, j, k, aTableElements;
    aTableElements = oDocument.getElementsByTagNameNS("sap.m", "Table");
    iColumnCount = 0;
    for (i = aTableElements.length - 1; i >= 0; i -= 1) {
        oElement = aTableElements[i];
        aControls = [];
        aChildNodes = oElement.childNodes;
        for (j = aChildNodes.length - 1; j >= 0; j -= 1) {
            oChildNode = aChildNodes[j];
            switch (oChildNode.nodeName) {
                case "columns":
                    bHasColumns = true;
                    break;
                case "items": throw new Error("Do not use <items> in sap.m.Table");
                case "ColumnListItem":
                    aColumnNodes = oChildNode.childNodes;
                    bHasListItem = true;
                    for (k = aColumnNodes.length - 1; k >= 0; k -= 1) {
                        if (aColumnNodes[k].nodeType === Node.ELEMENT_NODE) {
                            iColumnCount += 1;
                        }
                    }
                    break;
                default: if (oChildNode.nodeType === Node.ELEMENT_NODE) {
                    oElement.removeChild(oChildNode);
                    aControls.unshift(oChildNode);
                    iColumnCount += 1;
                }
            }
        }
        if (iColumnCount) {
            if (bHasColumns) {
                throw new Error("Do not use <columns> in sap.m.Table");
            }
            if (aControls.length) {
                if (bHasListItem) {
                    throw new Error("Do not use controls w/ and w/o <ColumnListItem>" + " in sap.m.Table");
                }
                oColumnsElement = document.createElementNS("sap.m", "ColumnListItem");
                for (j = 0; j < aControls.length; j += 1) {
                    oColumnsElement.appendChild(aControls[j]);
                }
                oElement.appendChild(oColumnsElement);
            }
            oColumnsElement = oDocument.createElementNS("sap.m", "columns");
            while (iColumnCount > 0) {
                oColumnsElement.appendChild(oDocument.createElementNS("sap.m", "Column"));
                iColumnCount -= 1;
            }
            oElement.appendChild(oColumnsElement);
        }
    }
}
QUnit.module("sap.ui.model.odata.v2.ODataModel.integration", {
    beforeEach: function () {
        sap.ui.getCore().getConfiguration().setLanguage("en-US");
        TestUtils.useFakeServer(this._oSandbox, "sap/ui/core", {
            "/sap/opu/odata/IWBEP/GWSAMPLE_BASIC/$metadata": { source: "qunit/model/GWSAMPLE_BASIC.metadata.xml" },
            "/sap/opu/odata/IWBEP/GWSAMPLE_BASIC/annotations.xml": { source: "qunit/model/GWSAMPLE_BASIC.annotations.xml" },
            "/SalesOrderSrv/$metadata": { source: "qunit/testdata/SalesOrder/metadata.xml" },
            "/sap/opu/odata/sap/PP_WORKCENTER_GROUP_SRV/$metadata": { source: "qunit/model/PP_WORKCENTER_GROUP_SRV.metadata.xml" },
            "/sap/opu/odata/IWBEP/RMTSAMPLEFLIGHT/$metadata": { source: "qunit/model/RMTSAMPLEFLIGHT.withMessageScope.metadata.xml" },
            "/sap/opu/odata/sap/UI_C_DFS_ALLWNCREQ/$metadata": { source: "qunit/odata/v2/data/UI_C_DFS_ALLWNCREQ.metadata.xml" },
            "/special/cases/$metadata": { source: "qunit/odata/v2/data/metadata_special_cases.xml" },
            "/sap/opu/odata/sap/FAR_CUSTOMER_LINE_ITEMS/$metadata": { source: "qunit/model/FAR_CUSTOMER_LINE_ITEMS.metadata.xml" }
        }, [{
                regExp: /GET \/sap\/opu\/odata\/sap\/ZUI5_GWSAMPLE_BASIC\/\$metadata.*/,
                response: [{ source: "internal/samples/odata/v2/Products/data/metadata.xml" }]
            }]);
        this.oLogMock = this.mock(Log);
        this.oLogMock.expects("warning").withExactArgs(sinon.match.string, "LegacyParametersGet", "sap.ui.support", sinon.match.func).atLeast(0);
        this.oLogMock.expects("error").never();
        this.oLogMock.expects("fatal").never();
        this.iBatchNo = 0;
        this.mChanges = {};
        this.iODataMessageCount = 0;
        this.mIgnoredChanges = {};
        this.mListChanges = {};
        this.aMessages = [];
        this.iPendingResponses = 0;
        this.aRequests = [];
        this.sTemporaryKey = undefined;
        this._oSandbox.stub(Device.resize, "height").value(1000);
    },
    afterEach: function (assert) {
        if (this.oView) {
            this.oView.destroy();
        }
        if (this.oModel) {
            this.oModel.destroy();
        }
        sap.ui.getCore().getConfiguration().setLanguage(sDefaultLanguage);
    },
    checkFinish: function (assert) {
        var sControlId, aExpectedValuesPerRow, i;
        if (this.aRequests.length || this.iPendingResponses) {
            return;
        }
        for (sControlId in this.mChanges) {
            if (!this.hasOnlyOptionalChanges(sControlId)) {
                if (this.mChanges[sControlId].length) {
                    return;
                }
                delete this.mChanges[sControlId];
            }
        }
        for (sControlId in this.mListChanges) {
            aExpectedValuesPerRow = this.mListChanges[sControlId];
            for (i in aExpectedValuesPerRow) {
                if (aExpectedValuesPerRow[i].length) {
                    return;
                }
                delete aExpectedValuesPerRow[i];
            }
            delete this.mListChanges[sControlId];
        }
        if (sap.ui.getCore().getUIDirty() || sap.ui.getCore().getMessageManager().getMessageModel().getObject("/").length < this.aMessages.length) {
            setTimeout(this.checkFinish.bind(this, assert), 10);
            return;
        }
        if (this.resolve) {
            this.resolve();
            this.resolve = null;
        }
        this.oListControlIds = null;
    },
    checkMessages: function (assert) {
        var aCurrentMessages = sap.ui.getCore().getMessageManager().getMessageModel().getObject("/").sort(compareMessages), aExpectedMessages = this.aMessages.slice().sort(compareMessages);
        function compareMessages(oMessage1, oMessage2) {
            return oMessage1.message.localeCompare(oMessage2.message);
        }
        function mapMessage(oMessage) {
            return {
                code: oMessage.code,
                description: oMessage.description,
                descriptionUrl: oMessage.descriptionUrl,
                aFullTargets: oMessage.aFullTargets.map(function (sFullTarget) {
                    return sFullTarget.replace(rTemporaryKey, "~key~");
                }),
                message: oMessage.message,
                persistent: oMessage.persistent,
                aTargets: oMessage.aTargets.map(function (sTarget) {
                    return sTarget.replace(rTemporaryKey, "~key~");
                }),
                technical: oMessage.technical,
                type: oMessage.type
            };
        }
        aCurrentMessages = aCurrentMessages.map(mapMessage);
        aExpectedMessages = aExpectedMessages.map(mapMessage);
        assert.deepEqual(aCurrentMessages, aExpectedMessages, this.aMessages.length + " expected messages in message manager");
    },
    checkValue: function (assert, sValue, sControlId, vRow) {
        var sExpectedValue, iRow = (typeof vRow === "string") ? Number(rRowIndex.exec(vRow)[1]) : vRow, aExpectedValues = (iRow === undefined) ? this.mChanges[sControlId] : this.mListChanges[sControlId] && this.mListChanges[sControlId][iRow], sVisibleId = iRow === undefined ? sControlId : sControlId + "[" + iRow + "]";
        if (!aExpectedValues || !aExpectedValues.length) {
            if (!(sControlId in this.mIgnoredChanges && sValue === null)) {
                assert.ok(false, sVisibleId + ": " + JSON.stringify(sValue) + " (unexpected)");
            }
        }
        else {
            sExpectedValue = aExpectedValues.shift();
            if (sValue !== sExpectedValue || iRow === undefined || typeof iRow !== "number" || iRow < 10) {
                assert.strictEqual(sValue, sExpectedValue, sVisibleId + ": " + JSON.stringify(sValue));
            }
        }
        this.checkFinish(assert);
    },
    checkValueState: function (assert, vControl, sState, sText) {
        var oControl = typeof vControl === "string" ? this.oView.byId(vControl) : vControl;
        return resolveLater(function () {
            assert.strictEqual(oControl.getValueState(), sState, oControl.getId() + ": value state: " + oControl.getValueState());
            assert.strictEqual(oControl.getValueStateText(), sText, oControl.getId() + ": value state text: " + oControl.getValueStateText());
        });
    },
    consumeExpectedRequest: function (oActualRequest) {
        var oExpectedRequest, i;
        if (this.aRequests.length === 1) {
            return this.aRequests.shift();
        }
        for (i = 0; i < this.aRequests.length; i += 1) {
            oExpectedRequest = this.aRequests[i];
            if (oExpectedRequest.requestUri === oActualRequest.requestUri) {
                this.aRequests.splice(i, 1);
                return oExpectedRequest;
            }
        }
    },
    createResponseMessage: function (vTarget, sMessage, sSeverity, bTransition) {
        var i = this.iODataMessageCount, oResponseMessage;
        this.iODataMessageCount += 1;
        oResponseMessage = {
            code: "code-" + i,
            message: sMessage || "message-" + i,
            severity: sSeverity || "error",
            transition: bTransition
        };
        if (vTarget !== undefined) {
            if (Array.isArray(vTarget)) {
                if (vTarget.length > 1) {
                    oResponseMessage.additionalTargets = vTarget.slice(1);
                }
                vTarget = vTarget[0];
            }
            oResponseMessage.target = vTarget;
        }
        return oResponseMessage;
    },
    createView: function (assert, sViewXML, vModel, oController) {
        var mNamedModels, that = this;
        function checkRequest(oRequest, fnSuccess, fnError, oHandler, oHttpClient, oMetadata) {
            if (oRequest.requestUri.includes("$batch")) {
                checkBatchRequest(oRequest, fnSuccess, fnError);
            }
            else {
                checkSingleRequest(oRequest, fnSuccess, fnError);
            }
        }
        function checkBatchRequest(oRequest, fnSuccess, fnError) {
            var oCrashedResponse;
            function processRequest(oRequest) {
                if (oRequest.__changeRequests) {
                    return Promise.all(oRequest.__changeRequests.map(processRequest)).then(function (aResponses) {
                        var oErrorResponse = aResponses.reduce(function (oReduced, oCurrent) {
                            return oReduced || oCurrent.message && oCurrent;
                        }, undefined);
                        if (oErrorResponse) {
                            return oErrorResponse;
                        }
                        return { __changeResponses: aResponses };
                    });
                }
                return checkSingleRequest(oRequest, function (oData, oResponse) {
                    return oResponse;
                }, function (oError) {
                    return { message: "HTTP request failed", response: oError.response };
                }, that.iBatchNo).then(function (oResponse) {
                    if (oResponse.response && oResponse.response.crashBatch) {
                        delete oResponse.response.crashBatch;
                        oCrashedResponse = oResponse;
                    }
                    return oResponse;
                });
            }
            function processRequests(oRequest) {
                var aRequests = oRequest.data.__batchRequests;
                Promise.all(aRequests.map(processRequest)).then(function (aResponses) {
                    var oBatchResponse;
                    if (oCrashedResponse) {
                        fnError(oCrashedResponse);
                    }
                    else {
                        oBatchResponse = {
                            data: {
                                __batchResponses: aResponses
                            }
                        };
                        fnSuccess(oBatchResponse.data, oBatchResponse);
                    }
                });
            }
            that.iBatchNo += 1;
            processRequests(oRequest);
        }
        function checkSingleRequest(oActualRequest, fnSuccess, fnError, iBatchNo) {
            var sContentID, oExpectedRequest, oExpectedResponse, mHeaders, sMethod = oActualRequest.method, oResponse, mResponseHeaders, sUrl = oActualRequest.requestUri, bWaitForResponse = true;
            function checkFinish() {
                if (!that.aRequests.length && !that.iPendingResponses) {
                    setTimeout(that.checkFinish.bind(that, assert), 0);
                }
            }
            function _getResponseMetadata(sRequestUri, iIndex) {
                sRequestUri = sRequestUri.split("?")[0];
                return {
                    uri: (iIndex === undefined) ? sRequestUri : sRequestUri + "('~" + iIndex + "~')"
                };
            }
            oActualRequest = Object.assign({}, oActualRequest);
            oActualRequest.headers = Object.assign({}, oActualRequest.headers);
            sContentID = oActualRequest.contentID;
            if (sUrl.startsWith(that.oModel.sServiceUrl)) {
                oActualRequest.requestUri = sUrl.slice(that.oModel.sServiceUrl.length + 1);
            }
            oExpectedRequest = that.consumeExpectedRequest(oActualRequest);
            mHeaders = oActualRequest.headers;
            delete mHeaders["Accept"];
            delete mHeaders["Accept-Language"];
            delete mHeaders["Content-Type"];
            delete mHeaders["DataServiceVersion"];
            delete mHeaders["MaxDataServiceVersion"];
            delete mHeaders["X-Requested-With"];
            delete mHeaders["sap-cancel-on-close"];
            delete mHeaders["sap-contextid-accept"];
            delete oActualRequest["_handle"];
            delete oActualRequest["adjustDeepPath"];
            delete oActualRequest["async"];
            delete oActualRequest["deferred"];
            delete oActualRequest["eventInfo"];
            delete oActualRequest["expandRequest"];
            delete oActualRequest["functionMetadata"];
            delete oActualRequest["functionTarget"];
            delete oActualRequest["password"];
            delete oActualRequest["requestID"];
            delete oActualRequest["updateAggregatedMessages"];
            delete oActualRequest["user"];
            delete oActualRequest["contentID"];
            if (oExpectedRequest) {
                oExpectedResponse = oExpectedRequest.response;
                if (oExpectedResponse === NO_CONTENT) {
                    oResponse = {
                        statusCode: 204
                    };
                }
                else if (oExpectedResponse && (oExpectedResponse.statusCode < 200 || oExpectedResponse.statusCode >= 300)) {
                    oResponse = {
                        response: oExpectedResponse
                    };
                }
                else if (oExpectedResponse && typeof oExpectedResponse.then === "function") {
                    oResponse = oExpectedResponse;
                }
                else {
                    oResponse = oExpectedResponse && oExpectedResponse.data ? oExpectedResponse : { data: oExpectedResponse, statusCode: 200 };
                    if (oResponse.data && Array.isArray(oResponse.data.results)) {
                        oResponse.data.results.forEach(function (oResponseItem, i) {
                            oResponseItem.__metadata = oResponseItem.__metadata || _getResponseMetadata(oExpectedRequest.requestUri, i);
                        });
                    }
                    else if (oExpectedRequest.method !== "HEAD") {
                        oResponse.data.__metadata = oResponse.data.__metadata || _getResponseMetadata(oExpectedRequest.requestUri);
                    }
                }
                bWaitForResponse = !(oResponse && typeof oResponse.then === "function");
                delete oExpectedRequest.response;
                mResponseHeaders = oExpectedRequest.responseHeaders;
                delete oExpectedRequest.responseHeaders;
                if (oActualRequest.key && sMethod !== "MERGE" && oActualRequest.headers["x-http-method"] !== "MERGE") {
                    that.sTemporaryKey = sContentID || oActualRequest.key.match(rTemporaryKey)[0];
                    oExpectedRequest.deepPath = oExpectedRequest.deepPath.replace("~key~", that.sTemporaryKey);
                    delete oActualRequest["key"];
                    if (oExpectedRequest.headers && oExpectedRequest.headers["Content-ID"]) {
                        oExpectedRequest.headers["Content-ID"] = oExpectedRequest.headers["Content-ID"].replace("~key~", that.sTemporaryKey);
                    }
                }
                if (oExpectedRequest.headers && oExpectedRequest.headers["Content-ID"]) {
                    oExpectedRequest.headers["Content-ID"] = oActualRequest.headers["Content-ID"];
                    if (oExpectedResponse.body && oExpectedResponse.statusCode >= 400) {
                        oExpectedResponse.body = oExpectedResponse.body.replace("~key~", oActualRequest.headers["Content-ID"]);
                    }
                }
                else {
                    delete oActualRequest.headers["Content-ID"];
                }
                if (oActualRequest.requestUri.startsWith("$") && sMethod === "GET") {
                    oExpectedRequest.requestUri = oExpectedRequest.requestUri.replace("~key~", that.sTemporaryKey);
                    oExpectedRequest.deepPath = oExpectedRequest.deepPath.replace("~key~", that.sTemporaryKey);
                }
                if ("batchNo" in oExpectedRequest) {
                    oActualRequest.batchNo = iBatchNo;
                }
                assert.deepEqual(oActualRequest, oExpectedRequest, sMethod + " " + sUrl);
                oResponse.headers = mResponseHeaders || {};
                if (oExpectedRequest.headers["Content-ID"]) {
                    oResponse.headers["Content-ID"] = oExpectedRequest.headers["Content-ID"];
                }
            }
            else {
                assert.ok(false, sMethod + " " + sUrl + " (unexpected)");
                oResponse = { value: [] };
            }
            if (bWaitForResponse) {
                that.iPendingResponses += 1;
            }
            else {
                checkFinish();
            }
            return Promise.resolve(oResponse).then(function (oResponseBody) {
                if (oResponseBody.statusCode >= 200 && oResponseBody.statusCode < 300) {
                    return fnSuccess({}, oResponseBody);
                }
                else {
                    return fnError(oResponseBody);
                }
            }).finally(function () {
                if (bWaitForResponse) {
                    that.iPendingResponses -= 1;
                }
                checkFinish();
            });
        }
        mNamedModels = vModel && !(vModel instanceof sap.ui.model.Model) ? vModel : { undefined: vModel || createSalesOrdersModel() };
        this.oModel = mNamedModels.undefined;
        this.mock(datajs).expects("request").atLeast(0).callsFake(checkRequest);
        this.assert = assert;
        return View.create({
            type: "XML",
            controller: oController && new (Controller.extend(uid(), oController))(),
            definition: xml(sViewXML)
        }).then(function (oView) {
            var sModelName;
            that.oView = oView;
            Object.keys(that.mChanges).forEach(function (sControlId) {
                var oControl = oView.byId(sControlId);
                if (oControl) {
                    that.observe(assert, oControl, sControlId);
                }
            });
            Object.keys(that.mListChanges).forEach(function (sControlId) {
                var oControl = oView.byId(sControlId);
                if (oControl) {
                    that.observe(assert, oControl, sControlId, true);
                }
            });
            for (sModelName in mNamedModels) {
                sModelName = sModelName === "undefined" ? undefined : sModelName;
                oView.setModel(mNamedModels[sModelName], sModelName);
            }
            sap.ui.getCore().getMessageManager().registerObject(oView, true);
            oView.placeAt("qunit-fixture");
            return that.waitForChanges(assert);
        });
    },
    expectChange: function (sControlId, vValue, vRow) {
        if (this.bCheckValue === true) {
            throw Error("Must not call expectChange after using expectValue in a test");
        }
        this.bCheckValue = false;
        this.expectChangeInternal.apply(this, arguments);
        return this;
    },
    expectValue: function (sControlId, vValue, vRow) {
        var bInList;
        if (this.bCheckValue === false) {
            throw Error("Must not call expectValue after using expectChange in a test");
        }
        this.bCheckValue = true;
        bInList = this.expectChangeInternal.apply(this, arguments);
        if (this.oView) {
            this.observe(this.assert, this.oView.byId(sControlId), sControlId, bInList);
        }
        return this;
    },
    expectChangeInternal: function (sControlId, vValue, vRow) {
        var aExpectations, i;
        function array(oObject, vProperty) {
            oObject[vProperty] = oObject[vProperty] || [];
            return oObject[vProperty];
        }
        if (arguments.length === 3) {
            aExpectations = array(this.mListChanges, sControlId);
            if (Array.isArray(vValue)) {
                vValue = Array(vRow || 0).concat(vValue);
                for (i = 0; i < vValue.length; i += 1) {
                    if (i in vValue) {
                        array(aExpectations, i).push(vValue[i]);
                    }
                }
            }
            else {
                array(aExpectations, vRow).push(vValue);
            }
        }
        else if (Array.isArray(vValue)) {
            aExpectations = array(this.mListChanges, sControlId);
            for (i = 0; i < vValue.length; i += 1) {
                if (i in vValue) {
                    array(aExpectations, i).push(vValue[i]);
                }
            }
        }
        else if (vValue === false) {
            array(this.mListChanges, sControlId);
        }
        else {
            aExpectations = array(this.mChanges, sControlId);
            if (arguments.length > 1) {
                aExpectations.push(vValue);
            }
            return false;
        }
        return true;
    },
    expectHeadRequest: function (mAdditionalHeaders) {
        this.aRequests.push({
            deepPath: "",
            headers: Object.assign({ "x-csrf-token": "Fetch" }, mAdditionalHeaders),
            method: "HEAD",
            requestUri: ""
        });
        return this;
    },
    expectMessage: function (oODataMessage, vTargetPrefix, vFullTargetPrefix, bResetMessages) {
        var aAdditionalTargets, aFullTargets, sTargetPrefix, aTargets;
        function computeFullTarget(sODataMessageTarget) {
            return Array.isArray(vFullTargetPrefix) ? vFullTargetPrefix.shift() + sODataMessageTarget : (vFullTargetPrefix || sTargetPrefix) + sODataMessageTarget;
        }
        function computeTarget(sODataMessageTarget) {
            if (Array.isArray(vTargetPrefix)) {
                sTargetPrefix = vTargetPrefix.shift();
            }
            return vTargetPrefix.isComplete ? vTargetPrefix.path : sTargetPrefix + sODataMessageTarget;
        }
        if (bResetMessages) {
            this.aMessages = [];
        }
        if (oODataMessage !== null) {
            sTargetPrefix = vTargetPrefix.isComplete ? "" : vTargetPrefix.path || vTargetPrefix;
            aAdditionalTargets = oODataMessage.additionalTargets || [];
            aTargets = [computeTarget(oODataMessage.target)].concat(aAdditionalTargets.map(computeTarget));
            aFullTargets = [computeFullTarget(oODataMessage.target)].concat(aAdditionalTargets.map(computeFullTarget));
            this.aMessages.push(new Message({
                code: oODataMessage.code,
                description: oODataMessage.description,
                descriptionUrl: "",
                fullTarget: aFullTargets,
                message: oODataMessage.message,
                persistent: false,
                target: aTargets,
                technical: false,
                type: mSeverityMap[oODataMessage.severity]
            }));
        }
        return this;
    },
    expectMessages: function (vExpectedMessages) {
        if (!Array.isArray(vExpectedMessages)) {
            vExpectedMessages = [vExpectedMessages];
        }
        this.aMessages = vExpectedMessages.map(function (oMessage) {
            oMessage.description = oMessage.hasOwnProperty("description") ? oMessage.description : undefined;
            oMessage.descriptionUrl = oMessage.hasOwnProperty("descriptionUrl") ? oMessage.descriptionUrl : "";
            oMessage.technical = oMessage.technical || false;
            return new Message(oMessage);
        });
        return this;
    },
    expectRequest: function (vRequest, oResponse, mResponseHeaders) {
        var aUrlParts;
        if (typeof vRequest === "string") {
            vRequest = {
                deepPath: "/" + vRequest.split("?")[0],
                method: "GET",
                requestUri: vRequest
            };
        }
        if (vRequest.deepPath === undefined) {
            vRequest.deepPath = "/" + vRequest.requestUri + (vRequest.created ? "('~key~')" : "");
        }
        vRequest.headers = vRequest.headers || {};
        vRequest.method = vRequest.method || "GET";
        vRequest.responseHeaders = mResponseHeaders || {};
        vRequest.response = oResponse || {};
        aUrlParts = vRequest.requestUri.split("?");
        if (aUrlParts[1] && vRequest.encodeRequestUri !== false) {
            vRequest.requestUri = aUrlParts[0] + "?" + aUrlParts[1].replace(/ /g, "%20").replace(/'/g, "%27").replace(/~/g, "%7e");
        }
        delete vRequest.encodeRequestUri;
        this.aRequests.push(vRequest);
        return this;
    },
    hasOnlyOptionalChanges: function (sControlId) {
        return this.bNullOptional && this.mChanges[sControlId].every(function (vValue) {
            return vValue === null;
        });
    },
    ignoreNullChanges: function (sControlId) {
        this.mIgnoredChanges[sControlId] = true;
        return this;
    },
    observe: function (assert, oControl, sControlId, bInList) {
        var oBindingInfo, bIsCompositeType, fnOriginalFormatter, oType, sProperty = oControl.getBindingInfo("text") ? "text" : "value", that = this;
        if (this.bCheckValue) {
            this.observeValue(assert, oControl, sControlId, bInList);
            return;
        }
        oBindingInfo = oControl.getBindingInfo(sProperty);
        fnOriginalFormatter = oBindingInfo.formatter;
        oType = oBindingInfo.type;
        bIsCompositeType = oType && oType.getMetadata().isA("sap.ui.model.CompositeType");
        oBindingInfo.formatter = function (sValue) {
            var oContext = bInList && this.getBindingContext();
            if (fnOriginalFormatter) {
                sValue = fnOriginalFormatter.apply(this, arguments);
            }
            else if (bIsCompositeType) {
                sValue = oType.formatValue.call(oType, Array.prototype.slice.call(arguments), "string");
            }
            if (!bIsCompositeType || sValue !== null) {
                that.checkValue(assert, sValue, sControlId, oContext && (oContext.getBinding ? oContext.getBinding() && oContext.getIndex() : oContext.getPath()));
            }
            return sValue;
        };
    },
    observeValue: function (assert, oControl, sControlId, bInList) {
        var oConfiguration, aTables, that = this;
        function extractControlId(sId) {
            sId = sId.slice(sId.indexOf("--") + 2);
            return sId.split("-")[0];
        }
        function getItemIndex(oItem) {
            if (oItem.getIndex) {
                return oItem.getIndex();
            }
            else if (oItem.getList) {
                return oItem.getList().getItems().indexOf(oItem);
            }
        }
        function observeItem(oChange) {
            that.checkValue(assert, oChange.current, extractControlId(oChange.object.getId()), getItemIndex(oChange.object.getParent()));
        }
        function observeItemsAggregation(oChange) {
            var aCells, aItems, oItem = oChange.child;
            if (that.oView.isDestroyStarted()) {
                return;
            }
            aItems = oChange.object.getAggregation(oChange.name);
            if (!aItems) {
                return;
            }
            if (oChange.mutation === "remove") {
                oItem = aItems[oItem.$index];
            }
            aCells = oItem ? oItem.getAggregation("cells") : [];
            aCells.forEach(function (oCurrentCell, iCellIndex) {
                var oCell, i, sCellId = extractControlId(oCurrentCell.getId()), sCellProperty = oCurrentCell.getBindingInfo("text") ? "text" : "value";
                if (that.oListControlIds.has(sCellId)) {
                    for (i = aItems.indexOf(oItem); i < aItems.length; i += 1) {
                        aItems[i].$index = i;
                        oCell = aItems[i].getAggregation("cells")[iCellIndex];
                        that.checkValue(assert, oCell.getProperty(sCellProperty), sCellId, getItemIndex(aItems[i]));
                    }
                    if (oChange.mutation === "insert") {
                        that.oObserver.observe(oCurrentCell, { properties: [sCellProperty] });
                    }
                }
            });
        }
        this.oObserver = this.oObserver || new ManagedObjectObserver(observeItem);
        if (!bInList) {
            oConfiguration = { properties: [
                    oControl.getBindingInfo("text") ? "text" : "value"
                ] };
            if (!this.oObserver.isObserved(oControl, oConfiguration)) {
                this.oObserver.observe(oControl, oConfiguration);
            }
            return;
        }
        this.oListControlIds = this.oListControlIds || new Set();
        this.oListControlIds.add(sControlId);
        if (!this.oTemplateObserver) {
            this.oTemplateObserver = new ManagedObjectObserver(observeItemsAggregation);
            aTables = this.oView.findAggregatedObjects(true, function (oControl) {
                return oControl.isA("sap.m.Table") || oControl.isA("sap.ui.table.Table");
            });
            if (aTables.length !== 1) {
                throw new Error("Expected one table in view but found " + aTables.length);
            }
            oConfiguration = {
                aggregations: [aTables[0].isA("sap.m.Table") ? "items" : "rows"]
            };
            this.oTemplateObserver.observe(aTables[0], oConfiguration);
        }
    },
    waitForChanges: function (assert, bNullOptional, iTimeout) {
        var oPromise, that = this;
        oPromise = new SyncPromise(function (resolve) {
            that.resolve = resolve;
            that.bNullOptional = bNullOptional;
            setTimeout(function () {
                if (oPromise.isPending()) {
                    assert.ok(false, "Timeout in waitForChanges");
                    resolve();
                }
            }, iTimeout || 3000);
            that.checkFinish(assert);
        }).then(function () {
            var sControlId, aExpectedValuesPerRow, i, j;
            that.aRequests.forEach(function (oRequest) {
                assert.ok(false, oRequest.method + " " + oRequest.requestUri + " (not requested)");
            });
            for (sControlId in that.mChanges) {
                if (that.hasOnlyOptionalChanges(sControlId)) {
                    delete that.mChanges[sControlId];
                    continue;
                }
                for (i in that.mChanges[sControlId]) {
                    assert.ok(false, sControlId + ": " + JSON.stringify(that.mChanges[sControlId][i]) + " (not set)");
                }
            }
            for (sControlId in that.mListChanges) {
                aExpectedValuesPerRow = that.mListChanges[sControlId];
                for (i in aExpectedValuesPerRow) {
                    for (j in aExpectedValuesPerRow[i]) {
                        assert.ok(false, sControlId + "[" + i + "]: " + JSON.stringify(aExpectedValuesPerRow[i][j]) + " (not set)");
                    }
                }
            }
            that.checkMessages(assert);
        });
        return oPromise;
    }
});
[{
        expectedCanonicalRequest: "SalesOrderSet",
        expectedRequest: "SalesOrderSet",
        isArrayResponse: true,
        path: "/SalesOrderSet",
        title: "Absolute path with one segment to a collection"
    }, {
        expectedCanonicalRequest: "SalesOrderSet('1')",
        expectedRequest: "SalesOrderSet('1')",
        isArrayResponse: false,
        path: "/SalesOrderSet('1')",
        title: "Absolute path with one segment to a single entity"
    }, {
        expectedCanonicalRequest: "SalesOrder_Confirm(SalesOrderID='1')",
        expectedRequest: "SalesOrder_Confirm(SalesOrderID='1')",
        isArrayResponse: false,
        path: "/SalesOrder_Confirm(SalesOrderID='1')",
        title: "Function import"
    }, {
        expectedCanonicalRequest: "SalesOrderSet('1')/ToLineItems",
        expectedRequest: "SalesOrderSet('1')/ToLineItems",
        isArrayResponse: true,
        path: "/SalesOrderSet('1')/ToLineItems",
        title: "Absolute path with two segments to a collection"
    }, {
        expectedCanonicalRequest: {
            deepPath: "/SalesOrderSet('1')/ToLineItems(SalesOrderID='1',ItemPosition='10')",
            requestUri: "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10')"
        },
        expectedRequest: "SalesOrderSet('1')/ToLineItems(SalesOrderID='1',ItemPosition='10')",
        isArrayResponse: false,
        path: "/SalesOrderSet('1')/ToLineItems(SalesOrderID='1',ItemPosition='10')",
        title: "Absolute path with two segments to a single entity of a collection"
    }, {
        expectedCanonicalRequest: "SalesOrderSet('1')/ToBusinessPartner",
        expectedRequest: "SalesOrderSet('1')/ToBusinessPartner",
        isArrayResponse: false,
        path: "/SalesOrderSet('1')/ToBusinessPartner",
        title: "Absolute path with two segments to a single entity via 'to 1' navigation property"
    }, {
        expectedCanonicalRequest: "BusinessPartnerSet('BP1')/Address",
        expectedRequest: "BusinessPartnerSet('BP1')/Address",
        isArrayResponse: false,
        path: "/BusinessPartnerSet('BP1')/Address",
        title: "Absolute path with two segments to a complex type"
    }, {
        expectedCanonicalRequest: {
            deepPath: "/SalesOrderSet('1')/ToLineItems(SalesOrderID='1',ItemPosition='10')/ToProduct",
            requestUri: "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10')/ToProduct"
        },
        expectedRequest: "SalesOrderSet('1')/ToLineItems(SalesOrderID='1',ItemPosition='10')" + "/ToProduct",
        isArrayResponse: false,
        path: "/SalesOrderSet('1')/ToLineItems(SalesOrderID='1',ItemPosition='10')/ToProduct",
        title: "Absolute path with three segments to a single entity; 'to n' navigation in the" + " middle"
    }, {
        expectedCanonicalRequest: {
            deepPath: "/BusinessPartnerSet('BP1')/ToProducts('P1')/ToSalesOrderLineItems",
            requestUri: "ProductSet('P1')/ToSalesOrderLineItems"
        },
        expectedRequest: "BusinessPartnerSet('BP1')/ToProducts('P1')/ToSalesOrderLineItems",
        isArrayResponse: true,
        path: "/BusinessPartnerSet('BP1')/ToProducts('P1')/ToSalesOrderLineItems",
        title: "Absolute path with three segments to a collection; 'to n' navigation in the middle"
    }, {
        expectedCanonicalRequest: {
            deepPath: "/BusinessPartnerSet('BP1')/ToProducts('P1')" + "/ToSalesOrderLineItems(SalesOrderID='1',ItemPosition='10')",
            requestUri: "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10')"
        },
        expectedRequest: "BusinessPartnerSet('BP1')/ToProducts('P1')" + "/ToSalesOrderLineItems(SalesOrderID='1',ItemPosition='10')",
        isArrayResponse: false,
        path: "/BusinessPartnerSet('BP1')/ToProducts('P1')" + "/ToSalesOrderLineItems(SalesOrderID='1',ItemPosition='10')",
        title: "Absolute path with three segments to a single entity of a collection; 'to n'" + " navigation in the middle"
    }, {
        expectedCanonicalRequest: "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10')/ToProduct" + "/ToSupplier",
        expectedRequest: "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10')/ToProduct" + "/ToSupplier",
        isArrayResponse: false,
        path: "/SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10')/ToProduct/ToSupplier",
        title: "Absolute path with three segments to a single entity; 'to 1' navigation in the" + " middle"
    }, {
        expectedCanonicalRequest: "SalesOrderSet('1')/ToBusinessPartner/ToProducts",
        expectedRequest: "SalesOrderSet('1')/ToBusinessPartner/ToProducts",
        isArrayResponse: true,
        path: "/SalesOrderSet('1')/ToBusinessPartner/ToProducts",
        title: "Absolute path with three segments to a collection; 'to 1' navigation in the middle"
    }, {
        expectedCanonicalRequest: {
            deepPath: "/SalesOrderSet('1')/ToBusinessPartner/ToProducts('P1')",
            requestUri: "ProductSet('P1')"
        },
        expectedRequest: "SalesOrderSet('1')/ToBusinessPartner/ToProducts('P1')",
        isArrayResponse: false,
        path: "/SalesOrderSet('1')/ToBusinessPartner/ToProducts('P1')",
        title: "Absolute path with three segments to a single entity of a collection; 'to 1'" + " navigation in the middle"
    }, {
        expectedCanonicalRequest: "SalesOrderSet('1')/ToBusinessPartner/Address",
        expectedRequest: "SalesOrderSet('1')/ToBusinessPartner/Address",
        isArrayResponse: false,
        path: "/SalesOrderSet('1')/ToBusinessPartner/Address",
        title: "Absolute path with three segments to a complex type; 'to 1' navigation in the" + " middle"
    }, {
        expectedCanonicalRequest: "SalesOrderSet/$count",
        expectedRequest: "SalesOrderSet/$count",
        isArrayResponse: false,
        path: "/SalesOrderSet/$count",
        title: "Absolute path; second segment is $count"
    }, {
        expectedCanonicalRequest: "SalesOrderSet('1')/ToLineItems/$count",
        expectedRequest: "SalesOrderSet('1')/ToLineItems/$count",
        isArrayResponse: false,
        path: "/SalesOrderSet('1')/ToLineItems/$count",
        title: "Absolute path; third segment is $count; 'to n' navigation in the middle"
    }, {
        expectedCanonicalRequest: {
            deepPath: "/BusinessPartnerSet('BP1')/ToProducts('P1')/ToSalesOrderLineItems/$count",
            requestUri: "ProductSet('P1')/ToSalesOrderLineItems/$count"
        },
        expectedRequest: "BusinessPartnerSet('BP1')/ToProducts('P1')/ToSalesOrderLineItems/$count",
        isArrayResponse: false,
        path: "/BusinessPartnerSet('BP1')/ToProducts('P1')/ToSalesOrderLineItems/$count",
        title: "Absolute path; 4th segment is $count"
    }, {
        contextDeepPath: "/SalesOrderSet",
        contextPath: "/SalesOrderSet",
        expectedCanonicalRequest: "SalesOrderSet",
        expectedRequest: "SalesOrderSet",
        isArrayResponse: true,
        path: "",
        title: "Relative empty path; resolved path has 1 segment referencing a collection"
    }, {
        contextDeepPath: "/SalesOrderSet('1')",
        contextPath: "/SalesOrderSet('1')",
        expectedCanonicalRequest: "SalesOrderSet('1')",
        expectedRequest: "SalesOrderSet('1')",
        isArrayResponse: false,
        path: "",
        title: "Relative empty path; resolved path has 1 segment referencing a single entity"
    }].forEach(function (oFixture) {
    [false, true].forEach(function (bCanonical) {
        var sTitle = "ODataModel#read:" + oFixture.title + (bCanonical ? "; using canonical requests" : "");
        QUnit.test(sTitle, function (assert) {
            var oModel = createSalesOrdersModel({ tokenHandling: false }), that = this;
            return this.createView(assert, "", oModel).then(function () {
                var oContext = oFixture.contextPath ? oModel.getContext(oFixture.contextPath, oFixture.contextDeepPath) : undefined, vExpectedRequest = bCanonical ? oFixture.expectedCanonicalRequest : oFixture.expectedRequest, mParameters = { canonicalRequest: bCanonical, context: oContext };
                if (oFixture.pathCache) {
                    oModel.mPathCache = oFixture.pathCache;
                }
                that.expectRequest(vExpectedRequest, oFixture.isArrayResponse ? { results: [] } : {});
                oModel.read(oFixture.path, mParameters);
                return that.waitForChanges(assert);
            });
        });
    });
});
[{
        expectedCanonicalRequest: {
            deepPath: "/SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10')/ToProduct" + "/ToSupplier",
            requestUri: "ProductSet('P1')/ToSupplier"
        },
        expectedRequest: "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10')/ToProduct" + "/ToSupplier",
        isArrayResponse: false,
        path: "/SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10')/ToProduct/ToSupplier",
        previousReads: [{
                request: "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10')/ToProduct",
                response: { __metadata: { uri: "ProductSet('P1')" } }
            }, {
                request: "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10')/ToProduct/ToSupplier",
                response: { __metadata: { uri: "BusinessPartnerSet('BP1')" } }
            }],
        title: "Absolute path with three segments to a single entity; 'to 1' navigation in the" + " middle"
    }, {
        expectedCanonicalRequest: {
            deepPath: "/SalesOrderSet('1')/ToBusinessPartner/ToProducts",
            requestUri: "BusinessPartnerSet('BP1')/ToProducts"
        },
        expectedRequest: "SalesOrderSet('1')/ToBusinessPartner/ToProducts",
        isArrayResponse: true,
        path: "/SalesOrderSet('1')/ToBusinessPartner/ToProducts",
        previousReads: [{
                request: "SalesOrderSet('1')/ToBusinessPartner",
                response: { __metadata: { uri: "BusinessPartnerSet('BP1')" } }
            }],
        title: "Absolute path with three segments to a collection; 'to 1' navigation in the middle"
    }, {
        expectedCanonicalRequest: {
            deepPath: "/SalesOrderSet('1')/ToBusinessPartner/ToProducts('P1')",
            requestUri: "ProductSet('P1')"
        },
        expectedRequest: "SalesOrderSet('1')/ToBusinessPartner/ToProducts('P1')",
        isArrayResponse: false,
        path: "/SalesOrderSet('1')/ToBusinessPartner/ToProducts('P1')",
        previousReads: [{
                request: "SalesOrderSet('1')/ToBusinessPartner",
                response: { __metadata: { uri: "BusinessPartnerSet('BP1')" } }
            }, {
                request: "SalesOrderSet('1')/ToBusinessPartner/ToProducts('P1')",
                response: { __metadata: { uri: "ProductSet('P1')" } }
            }],
        title: "Absolute path with three segments to a single entity of a collection; 'to 1'" + " navigation in the middle"
    }, {
        expectedCanonicalRequest: "SalesOrderSet('1')/ToBusinessPartner/Address",
        expectedRequest: "SalesOrderSet('1')/ToBusinessPartner/Address",
        isArrayResponse: false,
        path: "/SalesOrderSet('1')/ToBusinessPartner/Address",
        previousReads: [{
                request: "SalesOrderSet('1')/ToBusinessPartner",
                response: { __metadata: { uri: "BusinessPartnerSet('BP1')" } }
            }],
        title: "Absolute path with three segments to a complex type; 'to 1' navigation in the" + " middle"
    }, {
        contextDeepPath: "/SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10')/ToProduct",
        contextPath: "/ProductSet('P1')",
        expectedCanonicalRequest: {
            deepPath: "/SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10')/ToProduct" + "/ToSupplier",
            requestUri: "ProductSet('P1')/ToSupplier"
        },
        expectedRequest: {
            deepPath: "/SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10')/ToProduct" + "/ToSupplier",
            requestUri: "ProductSet('P1')/ToSupplier"
        },
        isArrayResponse: false,
        path: "ToSupplier",
        previousReads: [{
                request: "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10')/ToProduct",
                response: { __metadata: { uri: "ProductSet('P1')" } }
            }, {
                request: "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10')/ToProduct/ToSupplier",
                response: { __metadata: { uri: "BusinessPartnerSet('BP1')" } }
            }],
        title: "Relative path 'ToSupplier'; resolved deep path has 3 segments"
    }, {
        contextDeepPath: "/SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10')/ToProduct" + "/ToSupplier",
        contextPath: "/ProductSet('P1')/ToSupplier",
        expectedCanonicalRequest: {
            deepPath: "/SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10')/ToProduct" + "/ToSupplier",
            requestUri: "ProductSet('P1')/ToSupplier"
        },
        expectedRequest: {
            deepPath: "/SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10')/ToProduct" + "/ToSupplier",
            requestUri: "ProductSet('P1')/ToSupplier"
        },
        isArrayResponse: false,
        path: "",
        previousReads: [{
                request: "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10')/ToProduct",
                response: { __metadata: { uri: "ProductSet('P1')" } }
            }, {
                request: "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10')/ToProduct/ToSupplier",
                response: { __metadata: { uri: "BusinessPartnerSet('BP1')" } }
            }],
        title: "Relative empty path with '/ProductSet('P1')/ToSupplier' as context path; resolved" + " deep path has 3 segments"
    }].forEach(function (oFixture) {
    [false, true].forEach(function (bCanonical) {
        var sTitle = "ODataModel#read:" + oFixture.title + (bCanonical ? "; using canonical requests" : "") + "; 'to 1' navigation property in the middle already read";
        QUnit.test(sTitle, function (assert) {
            var oModel = createSalesOrdersModel({ tokenHandling: false }), that = this;
            oFixture.previousReads.forEach(function (oPreviousRead) {
                that.expectRequest(oPreviousRead.request, oPreviousRead.response);
                oModel.read("/" + oPreviousRead.request);
            });
            return this.createView(assert, "", oModel).then(function () {
                var oContext = oFixture.contextPath ? oModel.getContext(oFixture.contextPath, oFixture.contextDeepPath) : undefined, vExpectedRequest = bCanonical ? oFixture.expectedCanonicalRequest : oFixture.expectedRequest, mParameters = { canonicalRequest: bCanonical, context: oContext };
                that.expectRequest(vExpectedRequest, oFixture.isArrayResponse ? { results: [] } : {});
                oModel.read(oFixture.path, mParameters);
                return that.waitForChanges(assert);
            });
        });
    });
});
QUnit.test("ODataModel#read: not addressable 'to n' navigation property", function (assert) {
    var oModel = createSpecialCasesModel({ tokenHandling: false }), sResourcePath = "C_SubscrpnProductChargeTP('ID')/to_AllUserContactCards", that = this;
    this.expectRequest(sResourcePath, {
        results: [{ __metadata: { uri: "I_UserContactCard('Card1')" } }]
    });
    oModel.read("/" + sResourcePath);
    return this.createView(assert, "", oModel).then(function () {
        that.expectRequest(sResourcePath + "('Card1')", {});
        oModel.read("/" + sResourcePath + "('Card1')", { canonicalRequest: true });
        return that.waitForChanges(assert);
    });
});
QUnit.test("ODataModel#read: not addressable 'to 1' navigation property", function (assert) {
    var oModel = createSpecialCasesModel({ tokenHandling: false }), sResourcePath = "C_SubscrpnProductChargeTP('ID')/to_CreatedByUserContactCard", that = this;
    this.expectRequest(sResourcePath, { __metadata: { uri: "I_UserContactCard('Card1')" } });
    oModel.read("/" + sResourcePath);
    return this.createView(assert, "", oModel).then(function () {
        that.expectRequest(sResourcePath, {});
        oModel.read("/" + sResourcePath, { canonicalRequest: true });
        return that.waitForChanges(assert);
    });
});
[{
        path: "/SalesOrderSet('1')/ToBusinessPartner?sap-client=100"
    }, {
        contextPath: "/SalesOrderSet('1')/ToBusinessPartner",
        path: "?sap-client=100"
    }].forEach(function (oFixture) {
    QUnit.test("ODataModel#read: path with query string: " + oFixture.path, function (assert) {
        var oModel = createSalesOrdersModel({ tokenHandling: false }), that = this;
        return this.createView(assert, "", oModel).then(function () {
            that.expectRequest("SalesOrderSet('1')/ToBusinessPartner", { results: {} });
            oModel.read(oFixture.path, oFixture.contextPath ? { context: oModel.getContext(oFixture.contextPath) } : {});
            return that.waitForChanges(assert);
        });
    });
});
QUnit.test("Minimal integration test (useBatch=false)", function (assert) {
    var oModel = createSalesOrdersModel({ useBatch: false }), sView = "<FlexBox binding=\"{/SalesOrderSet('1')}\">\t<Text id=\"id\" text=\"{SalesOrderID}\" /></FlexBox>";
    this.expectRequest("SalesOrderSet('1')", {
        SalesOrderID: "1"
    }).expectValue("id", "1");
    return this.createView(assert, sView, oModel);
});
QUnit.test("Minimal integration test (useBatch=true)", function (assert) {
    var sView = "<FlexBox binding=\"{/SalesOrderSet('1')}\">\t<Text id=\"id\" text=\"{SalesOrderID}\" /></FlexBox>";
    this.expectHeadRequest().expectRequest("SalesOrderSet('1')", {
        SalesOrderID: "1"
    }).expectValue("id", "1");
    return this.createView(assert, sView);
});
QUnit.test("Messages: Failing token requests with logging", function (assert) {
    var oModel = createSalesOrdersModel({ persistTechnicalMessages: true }), sView = "<FlexBox binding=\"{/SalesOrderSet('1')}\">\t<Text id=\"id\" text=\"{SalesOrderID}\" /></FlexBox>";
    this.expectRequest({
        deepPath: "",
        headers: { "x-csrf-token": "Fetch" },
        method: "HEAD",
        requestUri: ""
    }, createErrorResponse({ message: "HEAD failed" })).expectRequest({
        deepPath: "",
        headers: { "x-csrf-token": "Fetch" },
        method: "GET",
        requestUri: ""
    }, createErrorResponse({ message: "GET failed" })).expectRequest("SalesOrderSet('1')", {
        SalesOrderID: "1"
    }).expectValue("id", "1").expectMessages([{
            code: "UF0",
            message: "GET failed",
            persistent: true,
            target: "",
            technical: true,
            type: "Error"
        }]);
    this.oLogMock.expects("error").withExactArgs("Request failed with status code 500: " + "GET /sap/opu/odata/IWBEP/GWSAMPLE_BASIC/", sinon.match.string, sODataMessageParserClassName);
    return this.createView(assert, sView, oModel);
});
QUnit.test("Minimal integration test with collection data (useBatch=false)", function (assert) {
    var oModel = createSalesOrdersModel({ useBatch: false }), sView = "<Table id=\"table\" items=\"{/SalesOrderSet}\">\t<Text id=\"id\" text=\"{SalesOrderID}\" /></Table>";
    this.expectRequest("SalesOrderSet?$skip=0&$top=100", {
        results: [
            { SalesOrderID: "0500000001" },
            { SalesOrderID: "0500000002" }
        ]
    }).expectValue("id", ["0500000001", "0500000002"]);
    return this.createView(assert, sView, oModel);
});
QUnit.test("Minimal integration test with collection data (useBatch=true)", function (assert) {
    var sView = "<Table id=\"table\" items=\"{/SalesOrderSet}\">\t<Text id=\"id\" text=\"{SalesOrderID}\" /></Table>";
    this.expectHeadRequest().expectRequest("SalesOrderSet?$skip=0&$top=100", {
        results: [
            { SalesOrderID: "0500000001" },
            { SalesOrderID: "0500000002" }
        ]
    }).expectValue("id", ["0500000001", "0500000002"]);
    return this.createView(assert, sView);
});
QUnit.test("$batch error handling: single request fails", function (assert) {
    var oErrorResponse = createErrorResponse({ message: "Bad Request", statusCode: 400 }), oEventHandlers = {
        batchCompleted: function () { },
        batchFailed: function () { },
        batchSent: function () { },
        requestCompleted: function () { },
        requestFailed: function () { },
        requestSent: function () { }
    }, oModel = createSalesOrdersModel(), sView = "<FlexBox binding=\"{/SalesOrderSet('1')}\">\t<Text id=\"id\" text=\"{SalesOrderID}\" /></FlexBox><Table id=\"table\" items=\"{/SalesOrderSet}\">\t<Text text=\"{SalesOrderID}\" /></Table>";
    this.expectHeadRequest().expectRequest("SalesOrderSet('1')", {
        SalesOrderID: "1"
    }).expectValue("id", "1").expectRequest("SalesOrderSet?$skip=0&$top=100", oErrorResponse).expectMessages([{
            code: "UF0",
            descriptionUrl: "",
            fullTarget: "/SalesOrderSet",
            message: "Bad Request",
            persistent: false,
            target: "/SalesOrderSet",
            technical: true,
            type: "Error"
        }]);
    this.mock(oEventHandlers).expects("batchCompleted");
    this.mock(oEventHandlers).expects("batchFailed").never();
    this.mock(oEventHandlers).expects("batchSent");
    this.mock(oEventHandlers).expects("requestCompleted").twice();
    this.mock(oEventHandlers).expects("requestFailed");
    this.mock(oEventHandlers).expects("requestSent").twice();
    oModel.attachBatchRequestCompleted(oEventHandlers.batchCompleted);
    oModel.attachBatchRequestFailed(oEventHandlers.batchFailed);
    oModel.attachBatchRequestSent(oEventHandlers.batchSent);
    oModel.attachRequestCompleted(oEventHandlers.requestCompleted);
    oModel.attachRequestFailed(oEventHandlers.requestFailed);
    oModel.attachRequestSent(oEventHandlers.requestSent);
    this.oLogMock.expects("error").withExactArgs("Request failed with status code 400: " + "GET SalesOrderSet?$skip=0&$top=100", sinon.match.string, sODataMessageParserClassName);
    return this.createView(assert, sView, oModel);
});
QUnit.test("$batch error handling: no network connection - generic error", function (assert) {
    var oEventHandlers = {
        batchCompleted: function () { },
        batchFailed: function () { },
        batchSent: function () { },
        requestCompleted: function () { },
        requestFailed: function () { },
        requestSent: function () { }
    }, oModel = createSalesOrdersModel(), sView = "<FlexBox binding=\"{/SalesOrderSet('1')}\">\t<Text id=\"id\" text=\"{SalesOrderID}\" /></FlexBox><Table id=\"table\" items=\"{/SalesOrderSet}\">\t<Text text=\"{SalesOrderID}\" /></Table>";
    this.mock(sap.ui.getCore().getLibraryResourceBundle()).expects("getText").atLeast(1).callsFake(function (sKey) {
        return sKey;
    });
    this.expectHeadRequest().expectRequest("SalesOrderSet('1')", {
        body: "",
        crashBatch: true,
        headers: [],
        statusCode: 0,
        statusText: ""
    }).expectRequest("SalesOrderSet?$skip=0&$top=100").expectMessages([{
            code: "",
            description: "",
            message: "CommunicationError",
            persistent: true,
            target: "",
            technical: true,
            type: "Error"
        }]);
    this.mock(oEventHandlers).expects("batchCompleted");
    this.mock(oEventHandlers).expects("batchFailed");
    this.mock(oEventHandlers).expects("batchSent");
    this.mock(oEventHandlers).expects("requestCompleted").twice();
    this.mock(oEventHandlers).expects("requestFailed").twice();
    this.mock(oEventHandlers).expects("requestSent").twice();
    oModel.attachBatchRequestCompleted(oEventHandlers.batchCompleted);
    oModel.attachBatchRequestFailed(oEventHandlers.batchFailed);
    oModel.attachBatchRequestSent(oEventHandlers.batchSent);
    oModel.attachRequestCompleted(oEventHandlers.requestCompleted);
    oModel.attachRequestFailed(oEventHandlers.requestFailed);
    oModel.attachRequestSent(oEventHandlers.requestSent);
    this.oLogMock.expects("error").withExactArgs("Request failed with unsupported status code 0: " + "POST /sap/opu/odata/IWBEP/GWSAMPLE_BASIC/$batch", undefined, sODataMessageParserClassName);
    return this.createView(assert, sView, oModel);
});
QUnit.test("$batch error handling: complete batch fails", function (assert) {
    var oErrorResponse = createErrorResponse({ crashBatch: true }), oEventHandlers = {
        batchCompleted: function () { },
        batchFailed: function () { },
        batchSent: function () { },
        requestCompleted: function () { },
        requestFailed: function () { },
        requestSent: function () { }
    }, oModel = createSalesOrdersModel(), sView = "<Table id=\"table\" items=\"{/SalesOrderSet}\">\t<Text text=\"{SalesOrderID}\" /></Table><FlexBox binding=\"{/SalesOrderSet('1')}\">\t<Text id=\"id\" text=\"{SalesOrderID}\" /></FlexBox>";
    this.expectHeadRequest().expectRequest("SalesOrderSet?$skip=0&$top=100", oErrorResponse).expectRequest("SalesOrderSet('1')", {
        SalesOrderID: "1"
    }).expectMessages([{
            code: "UF0",
            descriptionUrl: "",
            fullTarget: "/$batch",
            message: "Internal Server Error",
            persistent: false,
            target: "/$batch",
            technical: true,
            type: "Error"
        }]);
    this.mock(oEventHandlers).expects("batchCompleted");
    this.mock(oEventHandlers).expects("batchFailed");
    this.mock(oEventHandlers).expects("batchSent");
    this.mock(oEventHandlers).expects("requestCompleted").twice();
    this.mock(oEventHandlers).expects("requestFailed").twice();
    this.mock(oEventHandlers).expects("requestSent").twice();
    oModel.attachBatchRequestCompleted(oEventHandlers.batchCompleted);
    oModel.attachBatchRequestFailed(oEventHandlers.batchFailed);
    oModel.attachBatchRequestSent(oEventHandlers.batchSent);
    oModel.attachRequestCompleted(oEventHandlers.requestCompleted);
    oModel.attachRequestFailed(oEventHandlers.requestFailed);
    oModel.attachRequestSent(oEventHandlers.requestSent);
    this.oLogMock.expects("error").withExactArgs("Request failed with status code 500: " + "POST /sap/opu/odata/IWBEP/GWSAMPLE_BASIC/$batch", sinon.match.string, sODataMessageParserClassName);
    return this.createView(assert, sView, oModel);
});
QUnit.test("$batch error handling: complete batch fails, plain error", function (assert) {
    var oModel = createSalesOrdersModelMessageScope(), sView = "<Table id=\"table\" items=\"{/SalesOrderSet}\">\t<Text text=\"{SalesOrderID}\" /></Table>";
    this.mock(sap.ui.getCore().getLibraryResourceBundle()).expects("getText").atLeast(1).callsFake(function (sKey, aArgs) {
        return sKey;
    });
    this.expectHeadRequest({ "sap-message-scope": "BusinessObject" }).expectRequest({
        deepPath: "/SalesOrderSet",
        headers: { "sap-message-scope": "BusinessObject" },
        requestUri: "SalesOrderSet?$skip=0&$top=100"
    }, {
        body: "A plain error text",
        crashBatch: true,
        headers: {
            "Content-Type": "text/plain;charset=utf-8"
        },
        statusCode: 503
    }).expectMessages([{
            code: "",
            description: "A plain error text",
            descriptionUrl: "",
            fullTarget: "",
            message: "CommunicationError",
            persistent: true,
            target: "",
            technical: true,
            type: "Error"
        }]);
    this.oLogMock.expects("error").withExactArgs("Request failed with status code 503: POST /SalesOrderSrv/$batch", sinon.match.instanceOf(Error), sODataMessageParserClassName);
    oModel.setMessageScope(MessageScope.BusinessObject);
    return this.createView(assert, sView, oModel);
});
[false, true].forEach(function (bUseBatch) {
    QUnit.test("Messages: empty target (useBatch=" + bUseBatch + ")", function (assert) {
        var oModel = createSalesOrdersModel({ useBatch: bUseBatch }), oResponseMessage = this.createResponseMessage(""), sView = "<FlexBox binding=\"{/SalesOrderSet('1')}\">\t<Text id=\"id\" text=\"{SalesOrderID}\" /></FlexBox>";
        if (bUseBatch) {
            this.expectHeadRequest();
        }
        this.expectRequest("SalesOrderSet('1')", { SalesOrderID: "1" }, { "sap-message": getMessageHeader(oResponseMessage) }).expectValue("id", "1").expectMessage(oResponseMessage, "/SalesOrderSet('1')");
        return this.createView(assert, sView, oModel);
    });
});
QUnit.test("Messages: simple target with complex data type", function (assert) {
    var oResponseMessage = this.createResponseMessage("Address/City", "Foo"), sView = "<FlexBox binding=\"{/BusinessPartnerSet('1')}\">\t<Text id=\"CompanyName\" text=\"{CompanyName}\" />\t<Input id=\"City\" value=\"{Address/City}\" /></FlexBox>", that = this;
    this.expectHeadRequest().expectRequest("BusinessPartnerSet('1')", {
        CompanyName: "SAP SE",
        Address: {
            City: "Walldorf"
        }
    }, { "sap-message": getMessageHeader(oResponseMessage) }).expectValue("CompanyName", "SAP SE").expectValue("City", "Walldorf").expectMessage(oResponseMessage, "/BusinessPartnerSet('1')/");
    return this.createView(assert, sView).then(function () {
        return that.checkValueState(assert, "City", "Error", "Foo");
    });
});
[
    { message: "Bad Request", statusCode: 400 },
    { message: "Internal Server Error", statusCode: 500 }
].forEach(function (oFixture) {
    var sTitle = "Messages: http status code '" + oFixture.statusCode + "' expects a technical " + "error message";
    QUnit.test(sTitle, function (assert) {
        var sView = "<FlexBox binding=\"{/SalesOrderSet('1')}\">\t<Text text=\"{SalesOrderID}\" /></FlexBox>";
        this.oLogMock.expects("error").once();
        this.expectHeadRequest().expectRequest("SalesOrderSet('1')", createErrorResponse(oFixture)).expectMessages([{
                code: "UF0",
                fullTarget: "/SalesOrderSet('1')",
                message: oFixture.message,
                persistent: false,
                technical: true,
                target: "/SalesOrderSet('1')",
                type: MessageType.Error
            }]);
        return this.createView(assert, sView);
    });
});
QUnit.test("Messages: messages within a response body are not processed if http status code is " + "'200'", function (assert) {
    var sView = "<FlexBox binding=\"{/SalesOrderSet('1')}\">\t<Text text=\"{SalesOrderID}\" /></FlexBox>";
    this.expectHeadRequest().expectRequest("SalesOrderSet('1')", createErrorResponse({ statusCode: 200 })).expectMessages([]);
    return this.createView(assert, sView);
});
QUnit.test("Messages: more than one navigation property", function (assert) {
    var oMsgProductName = this.createResponseMessage("Name", "Foo"), oMsgSupplierAddress = this.createResponseMessage("Address/City", "Bar", "warning"), sView = "<FlexBox binding=\"{/SalesOrderSet('1')}\">\t<Text id=\"salesOrderId\" text=\"{SalesOrderID}\" />\t<Table id=\"table\" items=\"{ToLineItems}\">\t\t<Text id=\"itemPosition\" text=\"{ItemPosition}\" />\t</Table></FlexBox><FlexBox id=\"detailProduct\" binding=\"{ToProduct}\">\t<Input id=\"productName\" value=\"{Name}\" /></FlexBox><FlexBox id=\"detailSupplier\" binding=\"{ToSupplier}\">\t<Input id=\"supplierAddress\" value=\"{Address/City}\" /></FlexBox>", that = this;
    this.expectHeadRequest().expectRequest("SalesOrderSet('1')", {
        SalesOrderID: "1"
    }).expectRequest("SalesOrderSet('1')/ToLineItems?$skip=0&$top=100", {
        results: [{
                __metadata: {
                    uri: "/SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10')"
                },
                SalesOrderID: "1",
                ItemPosition: "10"
            }, {
                __metadata: {
                    uri: "/SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='20')"
                },
                SalesOrderID: "1",
                ItemPosition: "20"
            }]
    }).expectValue("salesOrderId", "1").expectValue("itemPosition", ["10", "20"]);
    return this.createView(assert, sView).then(function () {
        that.expectRequest({
            deepPath: "/SalesOrderSet('1')" + "/ToLineItems(SalesOrderID='1',ItemPosition='10')/ToProduct",
            requestUri: "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10')" + "/ToProduct"
        }, {
            __metadata: {
                uri: "ProductSet('P1')"
            },
            ProductID: "P1",
            Name: "Product 1"
        }, { "sap-message": getMessageHeader(oMsgProductName) }).expectValue("productName", "Product 1").expectMessage(oMsgProductName, "/ProductSet('P1')/", "/SalesOrderSet('1')/ToLineItems(SalesOrderID='1',ItemPosition='10')" + "/ToProduct/");
        that.oView.byId("detailProduct").setBindingContext(that.oView.byId("table").getItems()[0].getBindingContext());
        return that.waitForChanges(assert);
    }).then(function () {
        that.expectRequest({
            deepPath: "/SalesOrderSet('1')" + "/ToLineItems(SalesOrderID='1',ItemPosition='10')/ToProduct" + "/ToSupplier",
            requestUri: "ProductSet('P1')/ToSupplier"
        }, {
            __metadata: {
                uri: "BusinessPartnerSet('BP1')"
            },
            BusinessPartnerID: "BP1",
            Address: {
                City: "Walldorf"
            }
        }, { "sap-message": getMessageHeader(oMsgSupplierAddress) }).expectValue("supplierAddress", "Walldorf").expectMessage(oMsgSupplierAddress, "/BusinessPartnerSet('BP1')/", "/SalesOrderSet('1')/ToLineItems(SalesOrderID='1',ItemPosition='10')" + "/ToProduct/ToSupplier/");
        that.oView.byId("detailSupplier").setBindingContext(that.oView.byId("detailProduct").getBindingContext());
        return that.waitForChanges(assert);
    }).then(function () {
        return Promise.all([
            that.checkValueState(assert, "productName", "Error", "Foo"),
            that.checkValueState(assert, "supplierAddress", "Warning", "Bar")
        ]);
    });
});
QUnit.test("Messages: check value state", function (assert) {
    var oMsgGrossAmount = this.createResponseMessage("GrossAmount", "Foo", "warning"), oMsgNote = this.createResponseMessage("Note", "Bar"), that = this, sView = "<FlexBox binding=\"{/SalesOrderSet('1')}\">\t<Input id=\"Note\" value=\"{Note}\" />\t<Input id=\"GrossAmount\" value=\"{GrossAmount}\" />\t<Input id=\"LifecycleStatusDescription\" value=\"{LifecycleStatusDescription}\" /></FlexBox>";
    this.expectHeadRequest().expectRequest("SalesOrderSet('1')", {
        GrossAmount: "GrossAmount A",
        LifecycleStatusDescription: "LifecycleStatusDescription A",
        Note: "Note A"
    }, { "sap-message": getMessageHeader([oMsgNote, oMsgGrossAmount]) }).expectValue("Note", "Note A").expectValue("GrossAmount", "GrossAmount A").expectValue("LifecycleStatusDescription", "LifecycleStatusDescription A").expectMessage(oMsgNote, "/SalesOrderSet('1')/").expectMessage(oMsgGrossAmount, "/SalesOrderSet('1')/");
    return this.createView(assert, sView).then(function () {
        return Promise.all([
            that.checkValueState(assert, "Note", "Error", "Bar"),
            that.checkValueState(assert, "GrossAmount", "Warning", "Foo"),
            that.checkValueState(assert, "LifecycleStatusDescription", "None", ""),
            that.waitForChanges(assert)
        ]);
    }).then(function () {
        that.expectValue("Note", "");
        that.oView.byId("Note").unbindProperty("value");
        return Promise.all([
            that.checkValueState(assert, "Note", "None", ""),
            that.waitForChanges(assert)
        ]);
    });
});
[
    {
        bIsPersistent: true,
        sTarget: "Note",
        bTransient: true
    },
    {
        bIsPersistent: true,
        sTarget: "Note",
        bTransition: true
    },
    {
        bIsPersistent: true,
        sTarget: "/#TRANSIENT#Note"
    },
    {
        bIsPersistent: false,
        sTarget: "Note"
    }
].forEach(function (oFixture) {
    var sTitle = "Messages: message is persistent=" + oFixture.bIsPersistent + " (transient=" + oFixture.bTransient + ", transition=" + oFixture.bTransition + ", target='" + oFixture.sTarget + "')";
    QUnit.test(sTitle, function (assert) {
        var oExpectedMessage = {
            code: "code",
            fullTarget: "/SalesOrderSet('1')/Note",
            message: "Foo",
            persistent: oFixture.bIsPersistent,
            target: "/SalesOrderSet('1')/Note",
            type: MessageType.Error
        }, that = this, sView = "<FlexBox binding=\"{/SalesOrderSet('1')}\">\t<Input id=\"note\" value=\"{Note}\" /></FlexBox>";
        this.expectHeadRequest().expectRequest("SalesOrderSet('1')", {
            SalesOrderID: "1",
            Note: "NoteA"
        }, {
            "sap-message": getMessageHeader({
                code: "code",
                message: "Foo",
                severity: "error",
                target: oFixture.sTarget,
                transient: oFixture.bTransient,
                transition: oFixture.bTransition
            })
        }).expectValue("note", "NoteA").expectMessages([oExpectedMessage]);
        return this.createView(assert, sView).then(function () {
            return that.checkValueState(assert, "note", "Error", "Foo");
        }).then(function () {
            that.expectRequest("SalesOrderSet('1')", {
                SalesOrderID: "1",
                Note: "NoteB"
            }).expectValue("note", "NoteB").expectMessages(oFixture.bIsPersistent ? [oExpectedMessage] : []);
            that.oModel.refresh();
            return that.waitForChanges(assert);
        }).then(function () {
            return oFixture.bIsPersistent ? that.checkValueState(assert, "note", "Error", "Foo") : that.checkValueState(assert, "note", "None", "");
        });
    });
});
QUnit.test("Messages: refresh model or binding", function (assert) {
    var oModel = createSalesOrdersModelMessageScope(), oMsgProductAViaSalesOrder = this.createResponseMessage("ToLineItems(SalesOrderID='1',ItemPosition='3')/ToProduct('A')/Name"), oMsgProductAViaSalesOrderItem = cloneODataMessage(oMsgProductAViaSalesOrder, "(SalesOrderID='1',ItemPosition='3')/ToProduct('A')/Name"), oMsgSalesOrder = this.createResponseMessage(""), oMsgSalesOrderToLineItems1 = this.createResponseMessage("ToLineItems(SalesOrderID='1',ItemPosition='1')/ItemPosition"), oMsgSalesOrderToLineItems3 = this.createResponseMessage("ToLineItems(SalesOrderID='1',ItemPosition='3')/ItemPosition"), oMsgSalesOrderItem1 = cloneODataMessage(oMsgSalesOrderToLineItems1, "(SalesOrderID='1',ItemPosition='1')/ItemPosition"), oMsgSalesOrderItem3 = cloneODataMessage(oMsgSalesOrderToLineItems3, "(SalesOrderID='1',ItemPosition='3')/ItemPosition"), sView = "<FlexBox binding=\"{/SalesOrderSet('1')}\">\t<Text id=\"id\" text=\"{SalesOrderID}\" />\t<Table id=\"table\" items=\"{ToLineItems}\">\t\t<Text id=\"itemPosition\" text=\"{ItemPosition}\" />\t</Table></FlexBox>", that = this;
    this.expectHeadRequest({ "sap-message-scope": "BusinessObject" }).expectRequest({
        deepPath: "/SalesOrderSet('1')",
        requestUri: "SalesOrderSet('1')",
        headers: { "sap-message-scope": "BusinessObject" }
    }, {
        SalesOrderID: "1"
    }, { "sap-message": getMessageHeader([oMsgSalesOrder, oMsgSalesOrderToLineItems1]) }).expectRequest({
        deepPath: "/SalesOrderSet('1')/ToLineItems",
        requestUri: "SalesOrderSet('1')/ToLineItems?$skip=0&$top=100",
        headers: { "sap-message-scope": "BusinessObject" }
    }, {
        results: [
            { SalesOrderID: "1", ItemPosition: "1" },
            { SalesOrderID: "1", ItemPosition: "2" }
        ]
    }, { "sap-message": getMessageHeader(oMsgSalesOrderItem1) }).expectValue("id", "1").expectValue("itemPosition", ["1", "2"]).expectMessage(oMsgSalesOrder, "/SalesOrderSet('1')").expectMessage(oMsgSalesOrderItem1, "/SalesOrderLineItemSet", "/SalesOrderSet('1')/ToLineItems");
    oModel.setMessageScope(MessageScope.BusinessObject);
    return this.createView(assert, sView, oModel).then(function () {
        that.expectRequest({
            deepPath: "/SalesOrderSet('1')",
            requestUri: "SalesOrderSet('1')",
            headers: { "sap-message-scope": "BusinessObject" }
        }, {
            SalesOrderID: "1"
        }, {
            "sap-message": getMessageHeader([
                oMsgSalesOrder,
                oMsgSalesOrderToLineItems3,
                oMsgProductAViaSalesOrder
            ])
        }).expectRequest({
            deepPath: "/SalesOrderSet('1')/ToLineItems",
            requestUri: "SalesOrderSet('1')/ToLineItems?$skip=0&$top=100",
            headers: { "sap-message-scope": "BusinessObject" }
        }, {
            results: [
                { SalesOrderID: "1", ItemPosition: "2" },
                { SalesOrderID: "1", ItemPosition: "3" }
            ]
        }, {
            "sap-message": getMessageHeader([
                oMsgSalesOrderItem3,
                oMsgProductAViaSalesOrderItem
            ])
        }).expectValue("itemPosition", ["2", "3"]).expectMessages([]).expectMessage(oMsgSalesOrder, "/SalesOrderSet('1')").expectMessage(oMsgSalesOrderItem3, "/SalesOrderLineItemSet", "/SalesOrderSet('1')/ToLineItems").expectMessage(oMsgProductAViaSalesOrderItem, { isComplete: true, path: "/ProductSet('A')/Name" }, "/SalesOrderSet('1')/ToLineItems");
        that.oModel.refresh();
        return that.waitForChanges(assert);
    }).then(function () {
        that.expectRequest({
            deepPath: "/SalesOrderSet('1')/ToLineItems",
            requestUri: "SalesOrderSet('1')/ToLineItems?$skip=0&$top=100",
            headers: { "sap-message-scope": "BusinessObject" }
        }, {
            results: [
                { SalesOrderID: "1", ItemPosition: "3" },
                { SalesOrderID: "1", ItemPosition: "4" }
            ]
        }).expectValue("itemPosition", ["3", "4"]).expectMessages([]).expectMessage(oMsgSalesOrder, "/SalesOrderSet('1')");
        that.oView.byId("table").getBinding("items").refresh();
        return that.waitForChanges(assert);
    });
});
QUnit.test("Messages: paging", function (assert) {
    var oModel = createSalesOrdersModelMessageScope(), oMsgProductA = this.createResponseMessage("(SalesOrderID='1',ItemPosition='1')/ToProduct/Name"), oMsgProductB = this.createResponseMessage("(SalesOrderID='1',ItemPosition='3')/ToProduct/Name"), oMsgSalesOrderItem1 = this.createResponseMessage("(SalesOrderID='1',ItemPosition='1')/ItemPosition"), oMsgSalesOrderItem3 = this.createResponseMessage("(SalesOrderID='1',ItemPosition='3')/ItemPosition"), sView = "<Table growing=\"true\" growingThreshold=\"2\" id=\"table\"\t\titems=\"{/SalesOrderSet('1')/ToLineItems}\">\t<Text id=\"itemPosition\" text=\"{ItemPosition}\" /></Table>", that = this;
    this.expectHeadRequest({ "sap-message-scope": "BusinessObject" }).expectRequest({
        deepPath: "/SalesOrderSet('1')/ToLineItems",
        requestUri: "SalesOrderSet('1')/ToLineItems?$skip=0&$top=2",
        headers: { "sap-message-scope": "BusinessObject" }
    }, {
        results: [{
                __metadata: {
                    uri: "/SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='1')"
                },
                SalesOrderID: "1",
                ItemPosition: "1"
            }, {
                __metadata: {
                    uri: "/SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='2')"
                },
                SalesOrderID: "1",
                ItemPosition: "2"
            }]
    }, {
        "sap-message": getMessageHeader([
            oMsgSalesOrderItem1,
            oMsgProductA
        ])
    }).expectValue("itemPosition", ["1", "2"]).expectMessage(oMsgSalesOrderItem1, "/SalesOrderLineItemSet", "/SalesOrderSet('1')/ToLineItems").expectMessage(oMsgProductA, "/SalesOrderLineItemSet", "/SalesOrderSet('1')/ToLineItems");
    oModel.setMessageScope(MessageScope.BusinessObject);
    return this.createView(assert, sView, oModel).then(function () {
        that.expectRequest({
            deepPath: "/SalesOrderSet('1')/ToLineItems",
            requestUri: "SalesOrderSet('1')/ToLineItems?$skip=2&$top=2",
            headers: { "sap-message-scope": "BusinessObject" }
        }, {
            results: [{
                    __metadata: {
                        uri: "/SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='3')"
                    },
                    SalesOrderID: "1",
                    ItemPosition: "3"
                }, {
                    __metadata: {
                        uri: "/SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='4')"
                    },
                    SalesOrderID: "1",
                    ItemPosition: "4"
                }]
        }, {
            "sap-message": getMessageHeader([
                oMsgSalesOrderItem3,
                oMsgProductB
            ])
        }).expectValue("itemPosition", "3", 2).expectValue("itemPosition", "4", 3).expectMessage(oMsgSalesOrderItem3, "/SalesOrderLineItemSet", "/SalesOrderSet('1')/ToLineItems").expectMessage(oMsgProductB, "/SalesOrderLineItemSet", "/SalesOrderSet('1')/ToLineItems");
        that.oView.byId("table").requestItems();
        return that.waitForChanges(assert);
    });
});
QUnit.test("BCP 1980535595: refresh navigation properties to same entity", function (assert) {
    var sAdminDataRequest = "C_WorkCenterGroupAdminvData(ObjectTypeCode='G',ObjectInternalID='10000425')", oModel = createPPWorkcenterGroupModel(), sWCGroupRequest = "C_WorkCenterGroupTree(HierarchyRootNode='10000425'" + ",HierarchyParentNode='00000000',HierarchyNode='10000425',HierarchyNodeType='G')", sView = "<FlexBox id=\"objectPage\" binding=\"{path : '/C_WorkCenterGroupTree(HierarchyRootNode=\\'10000425\\',HierarchyParentNode=\\'00000000\\',HierarchyNode=\\'10000425\\',HierarchyNodeType=\\'G\\')',parameters : {createPreliminaryContext : true, canonicalRequest : true, usePreliminaryContext : false}}\">\t<FlexBox binding=\"{path : 'to_AdminData',\t\t\tparameters : {usePreliminaryContext : true, createPreliminaryContext : false}}\">\t\t<Text id=\"id\" text=\"{ObjectInternalID}\" />\t\t<FlexBox binding=\"{path : 'to_CreatedByUserContactCard',\t\t\t\tparameters : {select : 'FullName', createPreliminaryContext : false,\t\t\t\t\tusePreliminaryContext : false}\t\t\t}\">\t\t\t<Text id=\"createdName\" text=\"{FullName}\" />\t\t</FlexBox>\t</FlexBox>\t<FlexBox binding=\"{path : 'to_AdminData',\t\t\tparameters : {usePreliminaryContext : true, createPreliminaryContext : false}}\">\t\t<FlexBox binding=\"{path : 'to_LastChangedByUserContactCard',\t\t\t\tparameters : {select : 'FullName', createPreliminaryContext : false,\t\t\t\t\tusePreliminaryContext : false}\t\t\t}\">\t\t\t<Text id=\"lastChangedName\" text=\"{FullName}\" />\t\t</FlexBox>\t</FlexBox></FlexBox>", that = this;
    this.expectHeadRequest().expectRequest(sWCGroupRequest, {
        __metadata: { uri: "/" + sWCGroupRequest },
        HierarchyRootNode: "10000425",
        HierarchyParentNode: "00000000",
        HierarchyNode: "10000425",
        HierarchyNodeType: "G"
    }).expectRequest(sWCGroupRequest + "/to_AdminData", {
        __metadata: { uri: "/" + sAdminDataRequest },
        ObjectTypeCode: "G",
        ObjectInternalID: "10000425"
    }).expectRequest({
        deepPath: "/C_WorkCenterGroupTree(HierarchyRootNode='10000425'," + "HierarchyParentNode='00000000',HierarchyNode='10000425'," + "HierarchyNodeType='G')/to_AdminData/to_CreatedByUserContactCard",
        requestUri: sAdminDataRequest + "/to_CreatedByUserContactCard?$select=FullName"
    }, {
        __metadata: { uri: "/I_UserContactCard('Smith')" },
        FullName: "Smith"
    }).expectRequest({
        deepPath: "/C_WorkCenterGroupTree(HierarchyRootNode='10000425'," + "HierarchyParentNode='00000000',HierarchyNode='10000425'," + "HierarchyNodeType='G')/to_AdminData/to_LastChangedByUserContactCard",
        requestUri: sAdminDataRequest + "/to_LastChangedByUserContactCard?$select=FullName"
    }, {
        __metadata: { uri: "/I_UserContactCard('Smith')" },
        FullName: "Smith"
    }).expectValue("id", "10000425").expectValue("createdName", "Smith").expectValue("lastChangedName", "Smith");
    return this.createView(assert, sView, oModel).then(function () {
        that.expectRequest(sWCGroupRequest, {
            __metadata: { uri: "/" + sWCGroupRequest },
            HierarchyRootNode: "10000425",
            HierarchyParentNode: "00000000",
            HierarchyNode: "10000425",
            HierarchyNodeType: "G"
        }).expectRequest(sWCGroupRequest + "/to_AdminData", {
            __metadata: { uri: "/" + sAdminDataRequest },
            ObjectTypeCode: "G",
            ObjectInternalID: "10000425"
        }).expectRequest({
            deepPath: "/C_WorkCenterGroupTree(HierarchyRootNode='10000425'," + "HierarchyParentNode='00000000',HierarchyNode='10000425'," + "HierarchyNodeType='G')/to_AdminData/to_CreatedByUserContactCard",
            requestUri: sAdminDataRequest + "/to_CreatedByUserContactCard?$select=FullName"
        }, {
            __metadata: { uri: "/I_UserContactCard('Smith')" },
            FullName: "Smith"
        }).expectRequest({
            deepPath: "/C_WorkCenterGroupTree(HierarchyRootNode='10000425'," + "HierarchyParentNode='00000000',HierarchyNode='10000425'," + "HierarchyNodeType='G')/to_AdminData/to_LastChangedByUserContactCard",
            requestUri: sAdminDataRequest + "/to_LastChangedByUserContactCard?$select=FullName"
        }, {
            __metadata: { uri: "/I_UserContactCard('Muller')" },
            FullName: "Muller"
        }).expectValue("id", "").expectValue("id", "10000425").expectValue("createdName", "").expectValue("createdName", "Smith").expectValue("lastChangedName", "").expectValue("lastChangedName", "Muller");
        that.oView.byId("objectPage").getObjectBinding().refresh(true);
        return that.waitForChanges(assert);
    });
});
QUnit.test("Use reduced paths for the messages' full target path", function (assert) {
    var oModel = createSalesOrdersModel({ preliminaryContext: true }), oSalesOrderGrossAmountError = this.createResponseMessage("GrossAmount"), sView = "<FlexBox binding=\"{/SalesOrderSet('1')}\">\t<Text id=\"salesOrderID\" text=\"{SalesOrderID}\" />\t<Input id=\"grossAmount\" value=\"{GrossAmount}\" />\t<Table id=\"table\" items=\"{ToLineItems}\">\t\t<Text id=\"itemPosition\" text=\"{ItemPosition}\" />\t\t<Input id=\"grossAmount::item\" value=\"{GrossAmount}\" />\t\t<Input id=\"currencyCode\" value=\"{CurrencyCode}\" />\t</Table></FlexBox>", that = this;
    this.expectHeadRequest().expectRequest("SalesOrderSet('1')", {
        __metadata: { uri: "SalesOrderSet('1')" },
        GrossAmount: "0.00",
        SalesOrderID: "1"
    }, { "sap-message": getMessageHeader(oSalesOrderGrossAmountError) }).expectValue("salesOrderID", "1").expectValue("grossAmount", "0.00").expectRequest("SalesOrderSet('1')/ToLineItems?$skip=0&$top=100", {
        results: [{
                __metadata: {
                    uri: "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10')"
                },
                CurrencyCode: "EUR",
                GrossAmount: "0.00",
                ItemPosition: "10",
                SalesOrderID: "1"
            }]
    }).expectValue("itemPosition", ["10"]).expectValue("grossAmount::item", ["0.00"]).expectValue("currencyCode", ["EUR"]).expectMessage(oSalesOrderGrossAmountError, "/SalesOrderSet('1')/");
    return this.createView(assert, sView, oModel).then(function () {
        var oContext = that.oView.byId("table").getItems()[0].getBindingContext(), oSalesOrderItemToHeaderGrossAmountError = that.createResponseMessage("ToHeader/GrossAmount");
        that.expectRequest({
            deepPath: "/SalesOrderSet('1')" + "/ToLineItems(SalesOrderID='1',ItemPosition='10')",
            requestUri: "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10')" + "?$expand=ToHeader"
        }, {
            __metadata: {
                uri: "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10')"
            },
            SalesOrderID: "1",
            ItemPosition: "10",
            GrossAmount: "1000.00",
            ToHeader: {
                __metadata: { uri: "SalesOrderSet('1')" },
                SalesOrderID: "1",
                GrossAmount: "1000.00"
            }
        }, { "sap-message": getMessageHeader(oSalesOrderItemToHeaderGrossAmountError) }).expectValue("grossAmount", "1000.00").expectValue("grossAmount::item", ["1000.00"]).expectMessages([{
                code: oSalesOrderItemToHeaderGrossAmountError.code,
                fullTarget: "/SalesOrderSet('1')/GrossAmount",
                message: oSalesOrderItemToHeaderGrossAmountError.message,
                persistent: false,
                target: "/SalesOrderSet('1')/GrossAmount",
                type: mSeverityMap[oSalesOrderItemToHeaderGrossAmountError.severity]
            }]);
        oModel.read("", {
            context: oContext,
            urlParameters: { $expand: "ToHeader" }
        });
        return that.waitForChanges(assert);
    });
});
QUnit.test("create payload only contains cleaned up __metadata", function (assert) {
    var oModel = createSalesOrdersModel({ tokenHandling: false }), sView = "<FlexBox binding=\"{path : '/SalesOrderSet(\\'1\\')',\t\tparameters : {select : 'SalesOrderID,Note', expand : 'ToLineItems'}}\">\t<Text id=\"salesOrderID\" text=\"{SalesOrderID}\" />\t<Input id=\"note\" value=\"{Note}\" />\t<Table id=\"table\" items=\"{path : 'ToLineItems',\t\t\tparameters : {select : 'ItemPosition,Note,SalesOrderID'}}\">\t\t<Text id=\"itemPosition\" text=\"{ItemPosition}\" />\t\t<Input id=\"note::item\" value=\"{Note}\" />\t</Table></FlexBox>", that = this;
    this.expectRequest("SalesOrderSet('1')?$select=SalesOrderID%2cNote&$expand=ToLineItems", {
        __metadata: { uri: "SalesOrderSet('1')" },
        Note: "Note",
        SalesOrderID: "1",
        ToLineItems: {
            results: [{
                    __metadata: {
                        uri: "/SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10')"
                    },
                    ItemPosition: "10",
                    Note: "ItemNote",
                    SalesOrderID: "1"
                }]
        }
    }).expectValue("note", "Note").expectValue("salesOrderID", "1").expectValue("itemPosition", ["10"]).expectValue("note::item", ["ItemNote"]);
    return this.createView(assert, sView, oModel).then(function () {
        oModel.setChangeGroups({ SalesOrderLineItem: { groupId: "never" } }, { "*": { groupId: "change" } });
        oModel.setDeferredGroups(["change", "never"]);
        that.expectValue("note::item", "ItemNote Changed", 0);
        oModel.setProperty("/SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10')/Note", "ItemNote Changed");
        return that.waitForChanges(assert);
    }).then(function () {
        var oData;
        that.expectRequest({
            created: true,
            data: {
                SalesOrderID: "2",
                ToLineItems: [{
                        Note: "ItemNote Changed",
                        __metadata: {
                            uri: "/SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10')"
                        }
                    }]
            },
            deepPath: "/SalesOrderSet",
            entityTypes: {
                "GWSAMPLE_BASIC.SalesOrder": true
            },
            method: "POST",
            requestUri: "SalesOrderSet"
        });
        oData = oModel.getObject("/SalesOrderSet('1')", null, { select: "SalesOrderID,ToLineItems/Note", expand: "ToLineItems" });
        oModel.create("/SalesOrderSet", { SalesOrderID: "2", ToLineItems: oData.ToLineItems });
        oModel.submitChanges({ groupId: "change" });
        return that.waitForChanges(assert);
    });
});
QUnit.test("Keep user input and validation error after updating an entity", function (assert) {
    var oModel = createSalesOrdersModel({
        defaultBindingMode: BindingMode.TwoWay,
        preliminaryContext: true,
        refreshAfterChange: true,
        useBatch: false
    }), oNoteInput, sView = "<FlexBox id=\"form\" binding=\"{/SalesOrderSet('1')}\">\t<Text id=\"salesOrderID\" text=\"{SalesOrderID}\" />\t<Input id=\"note\" value=\"{\t\t\tpath : 'Note',\t\t\ttype : 'sap.ui.model.odata.type.String',\t\t\tconstraints : {maxLength : 3}\t\t}\" /></FlexBox>", that = this;
    this.expectRequest("SalesOrderSet('1')", {
        __metadata: { uri: "SalesOrderSet('1')" },
        Note: "Bar",
        SalesOrderID: "1"
    }).expectValue("note", "Bar").expectValue("salesOrderID", "1");
    return this.createView(assert, sView, oModel).then(function () {
        oNoteInput = that.oView.byId("note");
        that.expectMessages([{
                code: undefined,
                descriptionUrl: undefined,
                fullTarget: "",
                message: "Enter a text with a maximum of 3 characters and spaces",
                persistent: false,
                target: oNoteInput.getId() + "/value",
                technical: false,
                type: "Error"
            }]).expectValue("note", "abcd");
        oNoteInput.setValue("abcd");
        return that.waitForChanges(assert);
    }).then(function () {
        var oElementBinding = that.oView.byId("form").getElementBinding();
        that.expectRequest("SalesOrderSet('1')", {
            __metadata: { uri: "SalesOrderSet('1')" },
            Note: "Bar",
            SalesOrderID: "1"
        });
        oModel.invalidateEntry(oElementBinding.getBoundContext());
        oElementBinding.refresh(true);
        return that.waitForChanges(assert);
    }).then(function () {
        that.checkValueState(assert, oNoteInput, "Error", "Enter a text with a maximum of 3 characters and spaces");
        return that.waitForChanges(assert);
    }).then(function () {
        that.expectRequest("SalesOrderSet('2')", {
            __metadata: { uri: "SalesOrderSet('2')" },
            Note: "Bar",
            SalesOrderID: "2"
        }).expectValue("note", "Bar").expectValue("salesOrderID", "2").expectMessages([]);
        that.oView.byId("form").bindObject("/SalesOrderSet('2')");
        return that.waitForChanges(assert);
    }).then(function () {
        that.checkValueState(assert, oNoteInput, "None", "");
        return that.waitForChanges(assert);
    });
});
[MessageScope.BusinessObject, MessageScope.RequestedObjects].forEach(function (sMessageScope) {
    QUnit.test("Message lifecycle (1), scope: " + sMessageScope, function (assert) {
        var oModel = createSalesOrdersModelMessageScope({ preliminaryContext: true }), oSalesOrderNoteError = this.createResponseMessage("Note"), oSalesOrderToBusinessPartnerAddress = this.createResponseMessage("ToBusinessPartner/Address"), oSalesOrderToItemNoteError = this.createResponseMessage("ToLineItems(SalesOrderID='1',ItemPosition='10')/Note"), oSalesOrderToItemPositionError = this.createResponseMessage("ToLineItems(SalesOrderID='1',ItemPosition='10')/ItemPosition"), oSalesOrderItemNoteError = cloneODataMessage(oSalesOrderToItemNoteError, "(SalesOrderID='1',ItemPosition='10')/Note"), oSalesOrderItemPositionError = cloneODataMessage(oSalesOrderToItemPositionError, "(SalesOrderID='1',ItemPosition='10')/ItemPosition"), sView = "<FlexBox binding=\"{/SalesOrderSet('1')}\">\t<Text id=\"salesOrderID\" text=\"{SalesOrderID}\" />\t<Input id=\"note\" value=\"{Note}\" />\t<Table id=\"table\" items=\"{\t\t\tpath : 'ToLineItems',\t\t\tparameters : {transitionMessagesOnly : true}\t\t}\">\t\t<Text id=\"itemPosition\" text=\"{ItemPosition}\" />\t\t<Input id=\"note::item\" value=\"{Note}\" />\t</Table></FlexBox>", bWithMessageScope = sMessageScope === MessageScope.BusinessObject;
        this.expectHeadRequest(bWithMessageScope ? { "sap-message-scope": "BusinessObject" } : {}).expectRequest({
            deepPath: "/SalesOrderSet('1')",
            headers: bWithMessageScope ? { "sap-message-scope": "BusinessObject" } : {},
            requestUri: "SalesOrderSet('1')"
        }, {
            __metadata: { uri: "SalesOrderSet('1')" },
            Note: "Foo",
            SalesOrderID: "1"
        }, {
            "sap-message": getMessageHeader(bWithMessageScope ? [oSalesOrderNoteError, oSalesOrderToBusinessPartnerAddress, oSalesOrderToItemNoteError, oSalesOrderToItemPositionError] : [oSalesOrderNoteError])
        }).expectValue("note", "Foo").expectValue("salesOrderID", "1").expectRequest({
            deepPath: "/SalesOrderSet('1')/ToLineItems",
            headers: bWithMessageScope ? { "sap-message-scope": "BusinessObject", "sap-messages": "transientOnly" } : { "sap-messages": "transientOnly" },
            requestUri: "SalesOrderSet('1')/ToLineItems?$skip=0&$top=100"
        }, {
            results: [{
                    __metadata: {
                        uri: "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10')"
                    },
                    Note: "Bar",
                    ItemPosition: "10",
                    SalesOrderID: "1"
                }]
        }).expectValue("itemPosition", ["10"]).expectValue("note::item", ["Bar"]).expectMessage(oSalesOrderNoteError, "/SalesOrderSet('1')/");
        if (bWithMessageScope) {
            this.expectMessage(oSalesOrderItemNoteError, "/SalesOrderLineItemSet", "/SalesOrderSet('1')/ToLineItems").expectMessage(oSalesOrderItemPositionError, "/SalesOrderLineItemSet", "/SalesOrderSet('1')/ToLineItems").expectMessage(oSalesOrderToBusinessPartnerAddress, "/SalesOrderSet('1')/");
        }
        oModel.setMessageScope(sMessageScope);
        return this.createView(assert, sView, oModel);
    });
});
[MessageScope.BusinessObject, MessageScope.RequestedObjects].forEach(function (sMessageScope) {
    QUnit.test("Message lifecycle (2) + (3), scope: " + sMessageScope, function (assert) {
        var oModel = createSalesOrdersModelMessageScope({ preliminaryContext: true }), oSalesOrderNoteError = this.createResponseMessage("Note"), oSalesOrderToBusinessPartnerAddress = this.createResponseMessage("ToBusinessPartner/Address"), oSalesOrderToItem10NoteError = this.createResponseMessage("ToLineItems(SalesOrderID='1',ItemPosition='10')/Note"), oSalesOrderToItem30NoteError = this.createResponseMessage("ToLineItems(SalesOrderID='1',ItemPosition='30')/Note"), oSalesOrderItem10NoteError = cloneODataMessage(oSalesOrderToItem10NoteError, "(SalesOrderID='1',ItemPosition='10')/Note"), oSalesOrderItem30NoteError = cloneODataMessage(oSalesOrderToItem30NoteError, "(SalesOrderID='1',ItemPosition='30')/Note"), sView = "<FlexBox binding=\"{/SalesOrderSet('1')}\">\t<Text id=\"salesOrderID\" text=\"{SalesOrderID}\" />\t<Input id=\"note\" value=\"{Note}\" />\t<Table growing=\"true\" growingThreshold=\"2\" id=\"table\" items=\"{\t\t\tpath : 'ToLineItems',\t\t\tparameters : {transitionMessagesOnly : true}\t\t}\">\t\t<Text id=\"itemPosition\" text=\"{ItemPosition}\" />\t\t<Input id=\"note::item\" value=\"{Note}\" />\t</Table></FlexBox>", bWithMessageScope = sMessageScope === MessageScope.BusinessObject, that = this;
        this.expectHeadRequest(bWithMessageScope ? { "sap-message-scope": "BusinessObject" } : {}).expectRequest({
            deepPath: "/SalesOrderSet('1')",
            headers: bWithMessageScope ? { "sap-message-scope": "BusinessObject" } : {},
            requestUri: "SalesOrderSet('1')"
        }, {
            __metadata: { uri: "SalesOrderSet('1')" },
            Note: "Foo",
            SalesOrderID: "1"
        }, {
            "sap-message": getMessageHeader(bWithMessageScope ? [oSalesOrderNoteError, oSalesOrderToBusinessPartnerAddress, oSalesOrderToItem10NoteError, oSalesOrderToItem30NoteError] : oSalesOrderNoteError)
        }).expectValue("note", "Foo").expectValue("salesOrderID", "1").expectRequest({
            deepPath: "/SalesOrderSet('1')/ToLineItems",
            headers: bWithMessageScope ? { "sap-message-scope": "BusinessObject", "sap-messages": "transientOnly" } : { "sap-messages": "transientOnly" },
            requestUri: "SalesOrderSet('1')/ToLineItems?$skip=0&$top=2"
        }, {
            results: [{
                    __metadata: {
                        uri: "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10')"
                    },
                    Note: "Bar",
                    ItemPosition: "10",
                    SalesOrderID: "1"
                }, {
                    __metadata: {
                        uri: "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='20')"
                    },
                    Note: "Baz",
                    ItemPosition: "20",
                    SalesOrderID: "1"
                }]
        }).expectValue("itemPosition", ["10", "20"]).expectValue("note::item", ["Bar", "Baz"]).expectMessage(oSalesOrderNoteError, "/SalesOrderSet('1')/");
        if (bWithMessageScope) {
            this.expectMessage(oSalesOrderToBusinessPartnerAddress, "/SalesOrderSet('1')/").expectMessage(oSalesOrderItem10NoteError, "/SalesOrderLineItemSet", "/SalesOrderSet('1')/ToLineItems").expectMessage(oSalesOrderItem30NoteError, "/SalesOrderLineItemSet", "/SalesOrderSet('1')/ToLineItems");
        }
        oModel.setMessageScope(sMessageScope);
        return this.createView(assert, sView, oModel).then(function () {
            that.expectRequest({
                deepPath: "/SalesOrderSet('1')/ToLineItems",
                headers: bWithMessageScope ? { "sap-message-scope": "BusinessObject", "sap-messages": "transientOnly" } : { "sap-messages": "transientOnly" },
                requestUri: "SalesOrderSet('1')/ToLineItems?$skip=2&$top=2"
            }, {
                results: [{
                        __metadata: {
                            uri: "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='30')"
                        },
                        Note: "Qux",
                        ItemPosition: "30",
                        SalesOrderID: "1"
                    }, {
                        __metadata: {
                            uri: "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='40')"
                        },
                        Note: "Quux",
                        ItemPosition: "40",
                        SalesOrderID: "1"
                    }]
            }).expectValue("itemPosition", "30", 2).expectValue("itemPosition", "40", 3).expectValue("note::item", "Qux", 2).expectValue("note::item", "Quux", 3);
            that.oView.byId("table").requestItems();
            return that.waitForChanges(assert);
        });
    });
});
[MessageScope.BusinessObject, MessageScope.RequestedObjects].forEach(function (sMessageScope) {
    QUnit.test("Message lifecycle (4), scope: " + sMessageScope, function (assert) {
        var oModel = createSalesOrdersModelMessageScope({ preliminaryContext: true }), oSalesOrderNoteError = this.createResponseMessage("Note"), oSalesOrderToBusinessPartnerAddress = this.createResponseMessage("ToBusinessPartner/Address"), oSalesOrderToItem10GrossAmountError = this.createResponseMessage("ToLineItems(SalesOrderID='1',ItemPosition='10')/GrossAmount"), oSalesOrderToItem20GrossAmountError = this.createResponseMessage("ToLineItems(SalesOrderID='1',ItemPosition='20')/GrossAmount"), oSalesOrderToItem30GrossAmountError = this.createResponseMessage("ToLineItems(SalesOrderID='1',ItemPosition='30')/GrossAmount"), oSalesOrderItem10GrossAmountError = cloneODataMessage(oSalesOrderToItem10GrossAmountError, "(SalesOrderID='1',ItemPosition='10')/GrossAmount"), oSalesOrderItem20GrossAmountError = cloneODataMessage(oSalesOrderToItem20GrossAmountError, "(SalesOrderID='1',ItemPosition='20')/GrossAmount"), oSalesOrderItem30GrossAmountError = cloneODataMessage(oSalesOrderToItem30GrossAmountError, "(SalesOrderID='1',ItemPosition='30')/GrossAmount"), sView = "<FlexBox binding=\"{/SalesOrderSet('1')}\">\t<Text id=\"salesOrderID\" text=\"{SalesOrderID}\" />\t<Input id=\"note\" value=\"{Note}\" />\t<Table growing=\"true\" growingThreshold=\"2\" id=\"table\" items=\"{\t\t\tpath : 'ToLineItems',\t\t\tparameters : {transitionMessagesOnly : true}\t\t}\">\t\t<Text id=\"itemPosition\" text=\"{ItemPosition}\" />\t\t<Input id=\"grossAmount\" value=\"{GrossAmount}\" />\t</Table></FlexBox>", bWithMessageScope = sMessageScope === MessageScope.BusinessObject, that = this;
        this.expectHeadRequest(bWithMessageScope ? { "sap-message-scope": "BusinessObject" } : {}).expectRequest({
            deepPath: "/SalesOrderSet('1')",
            headers: bWithMessageScope ? { "sap-message-scope": "BusinessObject" } : {},
            requestUri: "SalesOrderSet('1')"
        }, {
            __metadata: { uri: "SalesOrderSet('1')" },
            Note: "Foo",
            SalesOrderID: "1"
        }, {
            "sap-message": getMessageHeader(bWithMessageScope ? [oSalesOrderNoteError, oSalesOrderToBusinessPartnerAddress, oSalesOrderToItem10GrossAmountError, oSalesOrderToItem20GrossAmountError, oSalesOrderToItem30GrossAmountError] : oSalesOrderNoteError)
        }).expectValue("note", "Foo").expectValue("salesOrderID", "1").expectRequest({
            deepPath: "/SalesOrderSet('1')/ToLineItems",
            headers: bWithMessageScope ? { "sap-message-scope": "BusinessObject", "sap-messages": "transientOnly" } : { "sap-messages": "transientOnly" },
            requestUri: "SalesOrderSet('1')/ToLineItems?$skip=0&$top=2"
        }, {
            results: [{
                    __metadata: {
                        uri: "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10')"
                    },
                    GrossAmount: "111.0",
                    ItemPosition: "10",
                    SalesOrderID: "1"
                }, {
                    __metadata: {
                        uri: "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='20')"
                    },
                    GrossAmount: "42.0",
                    ItemPosition: "20",
                    SalesOrderID: "1"
                }]
        }).expectValue("itemPosition", ["10", "20"]).expectValue("grossAmount", ["111.0", "42.0"]).expectMessage(oSalesOrderNoteError, "/SalesOrderSet('1')/");
        if (bWithMessageScope) {
            this.expectMessage(oSalesOrderToBusinessPartnerAddress, "/SalesOrderSet('1')/").expectMessage(oSalesOrderItem10GrossAmountError, "/SalesOrderLineItemSet", "/SalesOrderSet('1')/ToLineItems").expectMessage(oSalesOrderItem20GrossAmountError, "/SalesOrderLineItemSet", "/SalesOrderSet('1')/ToLineItems").expectMessage(oSalesOrderItem30GrossAmountError, "/SalesOrderLineItemSet", "/SalesOrderSet('1')/ToLineItems");
        }
        oModel.setMessageScope(sMessageScope);
        return this.createView(assert, sView, oModel).then(function () {
            that.expectRequest({
                deepPath: "/SalesOrderSet('1')/ToLineItems",
                headers: bWithMessageScope ? { "sap-message-scope": "BusinessObject", "sap-messages": "transientOnly" } : { "sap-messages": "transientOnly" },
                requestUri: "SalesOrderSet('1')/ToLineItems?$skip=0&$top=2" + "&$filter=GrossAmount gt 100.0m"
            }, {
                results: [{
                        __metadata: {
                            uri: "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10')"
                        },
                        GrossAmount: "111.0",
                        ItemPosition: "10",
                        SalesOrderID: "1"
                    }, {
                        __metadata: {
                            uri: "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='30')"
                        },
                        GrossAmount: "222.0",
                        ItemPosition: "30",
                        SalesOrderID: "1"
                    }]
            }).expectValue("itemPosition", "30", 1).expectValue("grossAmount", "222.0", 1);
            that.oView.byId("table").getBinding("items").filter([new Filter({
                    path: "GrossAmount",
                    operator: FilterOperator.GT,
                    value1: "100.0"
                })]);
            return that.waitForChanges(assert);
        });
    });
});
[MessageScope.BusinessObject, MessageScope.RequestedObjects].forEach(function (sMessageScope) {
    QUnit.test("Message lifecycle (5) + (6), scope: " + sMessageScope, function (assert) {
        var oModel = createSalesOrdersModelMessageScope({ preliminaryContext: true }), oSalesOrderNoteError = this.createResponseMessage("Note"), oSalesOrderToBusinessPartnerAddress = this.createResponseMessage("ToBusinessPartner/Address"), oSalesOrderToItem10GrossAmountError = this.createResponseMessage("ToLineItems(SalesOrderID='1',ItemPosition='10~0~')/GrossAmount"), oSalesOrderToItem20GrossAmountError = this.createResponseMessage("ToLineItems(SalesOrderID='1',ItemPosition='20~0~')/GrossAmount"), oSalesOrderToItem30GrossAmountError = this.createResponseMessage("ToLineItems(SalesOrderID='1',ItemPosition='30~0~')/GrossAmount"), oSalesOrderItem10GrossAmountError = cloneODataMessage(oSalesOrderToItem10GrossAmountError, "(SalesOrderID='1',ItemPosition='10~0~')/GrossAmount"), oSalesOrderItem20GrossAmountError = cloneODataMessage(oSalesOrderToItem20GrossAmountError, "(SalesOrderID='1',ItemPosition='20~0~')/GrossAmount"), oSalesOrderItem30GrossAmountError = cloneODataMessage(oSalesOrderToItem30GrossAmountError, "(SalesOrderID='1',ItemPosition='30~0~')/GrossAmount"), sView = "<FlexBox binding=\"{/SalesOrderSet('1')}\">\t<Text id=\"salesOrderID\" text=\"{SalesOrderID}\" />\t<Input id=\"note\" value=\"{Note}\" />\t<Table id=\"table1\" items=\"{path : 'ToLineItems', \t\tparameters : {transitionMessagesOnly : true},\t\tfilters : {path : 'GrossAmount', operator : 'GT', value1 : '100.0'}\t}\">\t\t<Text id=\"itemPosition1\" text=\"{ItemPosition}\" />\t\t<Input id=\"grossAmount1\" value=\"{GrossAmount}\" />\t</Table>\t<Table id=\"table2\" items=\"{path : 'ToLineItems', \t\tparameters : {transitionMessagesOnly : true},\t\tfilters : {path : 'GrossAmount', operator : 'LE', value1 : '100.0'}\t}\">\t\t<Text id=\"itemPosition2\" text=\"{ItemPosition}\" />\t\t<Input id=\"grossAmount2\" value=\"{GrossAmount}\" />\t</Table></FlexBox>", bWithMessageScope = sMessageScope === MessageScope.BusinessObject, that = this;
        this.expectHeadRequest(bWithMessageScope ? { "sap-message-scope": "BusinessObject" } : {}).expectRequest({
            deepPath: "/SalesOrderSet('1')",
            headers: bWithMessageScope ? { "sap-message-scope": "BusinessObject" } : {},
            requestUri: "SalesOrderSet('1')"
        }, {
            __metadata: { uri: "SalesOrderSet('1')" },
            Note: "Foo",
            SalesOrderID: "1"
        }, {
            "sap-message": getMessageHeader(bWithMessageScope ? [oSalesOrderNoteError, oSalesOrderToBusinessPartnerAddress, oSalesOrderToItem10GrossAmountError, oSalesOrderToItem20GrossAmountError, oSalesOrderToItem30GrossAmountError] : oSalesOrderNoteError)
        }).expectChange("note", null).expectChange("note", "Foo").expectChange("salesOrderID", null).expectChange("salesOrderID", "1").expectRequest({
            deepPath: "/SalesOrderSet('1')/ToLineItems",
            headers: bWithMessageScope ? { "sap-message-scope": "BusinessObject", "sap-messages": "transientOnly" } : { "sap-messages": "transientOnly" },
            requestUri: "SalesOrderSet('1')/ToLineItems?$skip=0&$top=100&" + "$filter=GrossAmount gt 100.0m"
        }, {
            results: [{
                    __metadata: {
                        uri: "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10~0~')"
                    },
                    GrossAmount: "111.0",
                    ItemPosition: "10~0~",
                    SalesOrderID: "1"
                }]
        }).expectChange("itemPosition1", ["10~0~"]).expectChange("grossAmount1", ["111.0"]).expectRequest({
            deepPath: "/SalesOrderSet('1')/ToLineItems",
            headers: bWithMessageScope ? { "sap-message-scope": "BusinessObject", "sap-messages": "transientOnly" } : { "sap-messages": "transientOnly" },
            requestUri: "SalesOrderSet('1')/ToLineItems?$skip=0&$top=100&" + "$filter=GrossAmount le 100.0m"
        }, {
            results: [{
                    __metadata: {
                        uri: "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='20~0~')"
                    },
                    GrossAmount: "42.0",
                    ItemPosition: "20~0~",
                    SalesOrderID: "1"
                }]
        }).expectChange("itemPosition2", ["20~0~"]).expectChange("grossAmount2", ["42.0"]).expectMessage(oSalesOrderNoteError, "/SalesOrderSet('1')/");
        if (bWithMessageScope) {
            this.expectMessage(oSalesOrderToBusinessPartnerAddress, "/SalesOrderSet('1')/").expectMessage(oSalesOrderItem10GrossAmountError, {
                isComplete: true,
                path: "/SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10~0~')" + "/GrossAmount"
            }, "/SalesOrderSet('1')/ToLineItems").expectMessage(oSalesOrderItem20GrossAmountError, {
                isComplete: true,
                path: "/SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='20~0~')" + "/GrossAmount"
            }, "/SalesOrderSet('1')/ToLineItems").expectMessage(oSalesOrderItem30GrossAmountError, {
                isComplete: true,
                path: "/SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='30~0~')" + "/GrossAmount"
            }, "/SalesOrderSet('1')/ToLineItems");
        }
        oModel.setMessageScope(sMessageScope);
        return this.createView(assert, sView, oModel).then(function () {
            that.expectRequest({
                deepPath: "/SalesOrderSet('1')/ToLineItems",
                headers: bWithMessageScope ? { "sap-message-scope": "BusinessObject", "sap-messages": "transientOnly" } : { "sap-messages": "transientOnly" },
                requestUri: "SalesOrderSet('1')/ToLineItems?$skip=0&$top=100&" + "$filter=GrossAmount gt 100.0m"
            }, {
                results: [{
                        __metadata: {
                            uri: "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='30~0~')"
                        },
                        GrossAmount: "123.0",
                        ItemPosition: "30~0~",
                        SalesOrderID: "1"
                    }]
            }).expectChange("itemPosition1", ["30~0~"]).expectChange("grossAmount1", ["123.0"]);
            that.oView.byId("table1").getBinding("items").refresh();
            return that.waitForChanges(assert);
        }).then(function () {
            that.expectRequest({
                deepPath: "/SalesOrderSet('1')",
                headers: bWithMessageScope ? { "sap-message-scope": "BusinessObject" } : {},
                requestUri: "SalesOrderSet('1')?$select=SalesOrderID"
            }, {
                __metadata: { uri: "SalesOrderSet('1')" },
                SalesOrderID: "1"
            }, {
                "sap-message": getMessageHeader(bWithMessageScope ? [oSalesOrderNoteError, oSalesOrderToBusinessPartnerAddress, oSalesOrderToItem20GrossAmountError, oSalesOrderToItem30GrossAmountError] : oSalesOrderNoteError)
            }).expectMessages([]).expectMessage(oSalesOrderNoteError, "/SalesOrderSet('1')/");
            if (bWithMessageScope) {
                that.expectMessage(oSalesOrderToBusinessPartnerAddress, "/SalesOrderSet('1')/").expectMessage(oSalesOrderItem20GrossAmountError, {
                    isComplete: true,
                    path: "/SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='20~0~')" + "/GrossAmount"
                }, "/SalesOrderSet('1')/ToLineItems").expectMessage(oSalesOrderToItem30GrossAmountError, {
                    isComplete: true,
                    path: "/SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='30~0~')" + "/GrossAmount"
                }, "/SalesOrderSet('1')/");
            }
            oModel.read("/SalesOrderSet('1')", {
                updateAggregatedMessages: true,
                urlParameters: {
                    $select: "SalesOrderID"
                }
            });
            return that.waitForChanges(assert);
        });
    });
});
[MessageScope.BusinessObject, MessageScope.RequestedObjects].forEach(function (sMessageScope) {
    QUnit.test("Message lifecycle (2) + (7), scope: " + sMessageScope, function (assert) {
        var oModel = createSalesOrdersModelMessageScope({ preliminaryContext: true }), oSalesOrderNoteError = this.createResponseMessage("Note"), oSalesOrderToBusinessPartnerAddress = this.createResponseMessage("ToBusinessPartner/Address"), oSalesOrderToItem10NoteError = this.createResponseMessage("ToLineItems(SalesOrderID='1',ItemPosition='10')/Note"), oSalesOrderToItem30NoteError = this.createResponseMessage("ToLineItems(SalesOrderID='1',ItemPosition='30')/Note"), oSalesOrderItem10NoteError = cloneODataMessage(oSalesOrderToItem10NoteError, "(SalesOrderID='1',ItemPosition='10')/Note"), oSalesOrderItem30NoteError = cloneODataMessage(oSalesOrderToItem30NoteError, "(SalesOrderID='1',ItemPosition='30')/Note"), sView = "<FlexBox binding=\"{/SalesOrderSet('1')}\">\t<Text id=\"salesOrderID\" text=\"{SalesOrderID}\" />\t<Input id=\"note\" value=\"{Note}\" />\t<Table growing=\"true\" growingThreshold=\"2\" id=\"table\" items=\"{\t\t\tpath : 'ToLineItems',\t\t\tparameters : {transitionMessagesOnly : true}\t\t}\">\t\t<Text id=\"itemPosition\" text=\"{ItemPosition}\" />\t\t<Input id=\"note::item\" value=\"{Note}\" />\t</Table></FlexBox>", bWithMessageScope = sMessageScope === MessageScope.BusinessObject, that = this;
        this.expectHeadRequest(bWithMessageScope ? { "sap-message-scope": "BusinessObject" } : {}).expectRequest({
            deepPath: "/SalesOrderSet('1')",
            headers: bWithMessageScope ? { "sap-message-scope": "BusinessObject" } : {},
            requestUri: "SalesOrderSet('1')"
        }, {
            __metadata: { uri: "SalesOrderSet('1')" },
            Note: "Foo",
            SalesOrderID: "1"
        }, {
            "sap-message": getMessageHeader(bWithMessageScope ? [oSalesOrderNoteError, oSalesOrderToBusinessPartnerAddress, oSalesOrderToItem10NoteError, oSalesOrderToItem30NoteError] : oSalesOrderNoteError)
        }).expectValue("note", "Foo").expectValue("salesOrderID", "1").expectRequest({
            deepPath: "/SalesOrderSet('1')/ToLineItems",
            headers: bWithMessageScope ? { "sap-message-scope": "BusinessObject", "sap-messages": "transientOnly" } : { "sap-messages": "transientOnly" },
            requestUri: "SalesOrderSet('1')/ToLineItems?$skip=0&$top=2"
        }, {
            results: [{
                    __metadata: {
                        uri: "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10')"
                    },
                    Note: "Bar",
                    ItemPosition: "10",
                    SalesOrderID: "1"
                }, {
                    __metadata: {
                        uri: "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='20')"
                    },
                    Note: "Baz",
                    ItemPosition: "20",
                    SalesOrderID: "1"
                }]
        }).expectValue("itemPosition", ["10", "20"]).expectValue("note::item", ["Bar", "Baz"]).expectMessage(oSalesOrderNoteError, "/SalesOrderSet('1')/");
        if (bWithMessageScope) {
            this.expectMessage(oSalesOrderToBusinessPartnerAddress, "/SalesOrderSet('1')/").expectMessage(oSalesOrderItem10NoteError, "/SalesOrderLineItemSet", "/SalesOrderSet('1')/ToLineItems").expectMessage(oSalesOrderItem30NoteError, "/SalesOrderLineItemSet", "/SalesOrderSet('1')/ToLineItems");
        }
        oModel.setMessageScope(sMessageScope);
        return this.createView(assert, sView, oModel).then(function () {
            that.expectRequest({
                deepPath: "/SalesOrderSet('1')/ToLineItems",
                headers: bWithMessageScope ? { "sap-message-scope": "BusinessObject", "sap-messages": "transientOnly" } : { "sap-messages": "transientOnly" },
                requestUri: "SalesOrderSet('1')/ToLineItems?$skip=0&$top=2" + "&$orderby=GrossAmount asc"
            }, {
                results: [{
                        __metadata: {
                            uri: "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='30')"
                        },
                        Note: "Qux",
                        ItemPosition: "30",
                        SalesOrderID: "1"
                    }, {
                        __metadata: {
                            uri: "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='40')"
                        },
                        Note: "Quux",
                        ItemPosition: "40",
                        SalesOrderID: "1"
                    }]
            }).expectValue("itemPosition", ["30", "40"]).expectValue("note::item", ["Qux", "Quux"]);
            that.oView.byId("table").getBinding("items").sort(new Sorter("GrossAmount"));
            return that.waitForChanges(assert);
        });
    });
});
[MessageScope.BusinessObject, MessageScope.RequestedObjects].forEach(function (sMessageScope) {
    QUnit.test("Message lifecycle (8), scope: " + sMessageScope, function (assert) {
        var oModel = createSalesOrdersModelMessageScope({
            canonicalRequests: true,
            preliminaryContext: true,
            refreshAfterChange: false,
            useBatch: false
        }), oSalesOrderNoteError = this.createResponseMessage("Note"), oSalesOrderToBusinessPartnerAddress = this.createResponseMessage("ToBusinessPartner/Address"), oSalesOrderToItem10ToProductPriceError = this.createResponseMessage("ToLineItems(SalesOrderID='1',ItemPosition='10')/ToProduct/Price"), oSalesOrderToItem10NoteError = this.createResponseMessage("ToLineItems(SalesOrderID='1',ItemPosition='10')/Note"), oSalesOrderToItem30NoteError = this.createResponseMessage("ToLineItems(SalesOrderID='1',ItemPosition='30')/Note"), oSalesOrderItem10NoteError = cloneODataMessage(oSalesOrderToItem10NoteError, "(SalesOrderID='1',ItemPosition='10')/Note"), oSalesOrderItem30NoteError = cloneODataMessage(oSalesOrderToItem30NoteError, "(SalesOrderID='1',ItemPosition='30')/Note"), oSalesOrderItem10ToProductPriceError = cloneODataMessage(oSalesOrderToItem10ToProductPriceError, "(SalesOrderID='1',ItemPosition='10')/ToProduct/Price"), sView = "<FlexBox binding=\"{/SalesOrderSet('1')}\">\t<Text id=\"salesOrderID\" text=\"{SalesOrderID}\" />\t<Input id=\"note\" value=\"{Note}\" />\t<Table growing=\"true\" growingThreshold=\"2\" id=\"table\" items=\"{\t\t\tpath : 'ToLineItems',\t\t\tparameters : {transitionMessagesOnly : true}\t\t}\">\t\t<Text id=\"itemPosition\" text=\"{ItemPosition}\" />\t\t<Input id=\"note::item\" value=\"{Note}\" />\t</Table></FlexBox>", bWithMessageScope = sMessageScope === MessageScope.BusinessObject, that = this;
        this.expectRequest({
            deepPath: "/SalesOrderSet('1')",
            headers: bWithMessageScope ? { "sap-message-scope": "BusinessObject" } : {},
            requestUri: "SalesOrderSet('1')"
        }, {
            __metadata: { uri: "SalesOrderSet('1')" },
            Note: "Foo",
            SalesOrderID: "1"
        }, {
            "sap-message": getMessageHeader(bWithMessageScope ? [oSalesOrderNoteError, oSalesOrderToBusinessPartnerAddress, oSalesOrderToItem10NoteError, oSalesOrderToItem10ToProductPriceError, oSalesOrderToItem30NoteError] : oSalesOrderNoteError)
        }).expectValue("note", "Foo").expectValue("salesOrderID", "1").expectRequest({
            deepPath: "/SalesOrderSet('1')/ToLineItems",
            headers: bWithMessageScope ? { "sap-message-scope": "BusinessObject", "sap-messages": "transientOnly" } : { "sap-messages": "transientOnly" },
            requestUri: "SalesOrderSet('1')/ToLineItems?$skip=0&$top=2"
        }, {
            results: [{
                    __metadata: {
                        uri: "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10')"
                    },
                    Note: "Bar",
                    ItemPosition: "10",
                    SalesOrderID: "1"
                }, {
                    __metadata: {
                        uri: "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='20')"
                    },
                    Note: "Baz",
                    ItemPosition: "20",
                    SalesOrderID: "1"
                }]
        }).expectValue("itemPosition", ["10", "20"]).expectValue("note::item", ["Bar", "Baz"]).expectMessage(oSalesOrderNoteError, "/SalesOrderSet('1')/");
        if (bWithMessageScope) {
            this.expectMessage(oSalesOrderToBusinessPartnerAddress, "/SalesOrderSet('1')/").expectMessage(oSalesOrderItem10NoteError, "/SalesOrderLineItemSet", "/SalesOrderSet('1')/ToLineItems").expectMessage(oSalesOrderItem30NoteError, "/SalesOrderLineItemSet", "/SalesOrderSet('1')/ToLineItems").expectMessage(oSalesOrderItem10ToProductPriceError, "/SalesOrderLineItemSet", "/SalesOrderSet('1')/ToLineItems");
        }
        oModel.setMessageScope(sMessageScope);
        return this.createView(assert, sView, oModel).then(function () {
            var oItem10ToProductPriceError = cloneODataMessage(oSalesOrderItem10ToProductPriceError, "ToProduct/Price");
            that.expectValue("note::item", "Qux", 0).expectHeadRequest(bWithMessageScope ? { "sap-message-scope": "BusinessObject" } : {}).expectRequest({
                data: {
                    Note: "Qux",
                    __metadata: {
                        uri: "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10')"
                    }
                },
                deepPath: "/SalesOrderSet('1')/ToLineItems(SalesOrderID='1',ItemPosition='10')",
                headers: bWithMessageScope ? { "sap-message-scope": "BusinessObject", "x-http-method": "MERGE" } : { "x-http-method": "MERGE" },
                key: "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10')",
                method: "POST",
                requestUri: "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10')"
            }, NO_CONTENT, bWithMessageScope ? { "sap-message": getMessageHeader(oItem10ToProductPriceError) } : undefined).expectMessages([]).expectMessage(oSalesOrderNoteError, "/SalesOrderSet('1')/");
            if (bWithMessageScope) {
                that.expectMessage(oSalesOrderToBusinessPartnerAddress, "/SalesOrderSet('1')/").expectMessage(oItem10ToProductPriceError, "/SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10')/", "/SalesOrderSet('1')/ToLineItems(SalesOrderID='1',ItemPosition='10')/").expectMessage(oSalesOrderItem30NoteError, "/SalesOrderLineItemSet", "/SalesOrderSet('1')/ToLineItems");
            }
            oModel.setProperty("/SalesOrderSet('1')/ToLineItems(SalesOrderID='1',ItemPosition='10')/Note", "Qux");
            oModel.submitChanges();
            return that.waitForChanges(assert);
        }).then(function () {
            that.expectValue("note", "Quxx").expectRequest({
                data: {
                    Note: "Quxx",
                    __metadata: { uri: "SalesOrderSet('1')" }
                },
                deepPath: "/SalesOrderSet('1')",
                headers: bWithMessageScope ? { "sap-message-scope": "BusinessObject", "x-http-method": "MERGE" } : { "x-http-method": "MERGE" },
                key: "SalesOrderSet('1')",
                method: "POST",
                requestUri: "SalesOrderSet('1')"
            }, NO_CONTENT, bWithMessageScope ? { "sap-message": getMessageHeader(oSalesOrderToItem30NoteError) } : undefined).expectMessages([]).expectMessage(bWithMessageScope ? oSalesOrderItem30NoteError : null, "/SalesOrderLineItemSet", "/SalesOrderSet('1')/ToLineItems");
            oModel.setProperty("/SalesOrderSet('1')/Note", "Quxx");
            oModel.submitChanges();
            return that.waitForChanges(assert);
        });
    });
});
[MessageScope.BusinessObject, MessageScope.RequestedObjects].forEach(function (sMessageScope) {
    QUnit.test("Message lifecycle (10), scope: " + sMessageScope, function (assert) {
        var oModel = createSalesOrdersModelMessageScope({ preliminaryContext: true }), oSalesOrderNoteError = this.createResponseMessage("Note"), oSalesOrderToBusinessPartnerAddress = this.createResponseMessage("ToBusinessPartner/Address"), oSalesOrderToItem10ToProductPriceError = this.createResponseMessage("ToLineItems(SalesOrderID='1',ItemPosition='10')/ToProduct/Price"), oSalesOrderToItem10NoteError = this.createResponseMessage("ToLineItems(SalesOrderID='1',ItemPosition='10')/Note"), oSalesOrderToItem20NoteError = this.createResponseMessage("ToLineItems(SalesOrderID='1',ItemPosition='20')/Note"), oSalesOrderItem10NoteError = cloneODataMessage(oSalesOrderToItem10NoteError, "(SalesOrderID='1',ItemPosition='10')/Note"), oSalesOrderItem10ToProductPriceError = cloneODataMessage(oSalesOrderToItem10ToProductPriceError, "(SalesOrderID='1',ItemPosition='10')/ToProduct/Price"), oSalesOrderItem20NoteError = cloneODataMessage(oSalesOrderToItem20NoteError, "(SalesOrderID='1',ItemPosition='20')/Note"), sView = "<FlexBox binding=\"{/SalesOrderSet('1')}\">\t<Text id=\"salesOrderID\" text=\"{SalesOrderID}\" />\t<Input id=\"note\" value=\"{Note}\" />\t<Table growing=\"true\" growingThreshold=\"2\" id=\"table\" items=\"{\t\t\tpath : 'ToLineItems',\t\t\tparameters : {transitionMessagesOnly : true}\t\t}\">\t\t<Text id=\"itemPosition\" text=\"{ItemPosition}\" />\t\t<Input id=\"note::item\" value=\"{Note}\" />\t</Table></FlexBox>", bWithMessageScope = sMessageScope === MessageScope.BusinessObject, that = this;
        this.expectHeadRequest(bWithMessageScope ? { "sap-message-scope": "BusinessObject" } : {}).expectRequest({
            deepPath: "/SalesOrderSet('1')",
            headers: bWithMessageScope ? { "sap-message-scope": "BusinessObject" } : {},
            requestUri: "SalesOrderSet('1')"
        }, {
            __metadata: { uri: "SalesOrderSet('1')" },
            Note: "Foo",
            SalesOrderID: "1"
        }, {
            "sap-message": getMessageHeader(bWithMessageScope ? [oSalesOrderNoteError, oSalesOrderToBusinessPartnerAddress, oSalesOrderToItem10NoteError, oSalesOrderToItem10ToProductPriceError, oSalesOrderToItem20NoteError] : oSalesOrderNoteError)
        }).expectValue("note", "Foo").expectValue("salesOrderID", "1").expectRequest({
            deepPath: "/SalesOrderSet('1')/ToLineItems",
            headers: bWithMessageScope ? { "sap-message-scope": "BusinessObject", "sap-messages": "transientOnly" } : { "sap-messages": "transientOnly" },
            requestUri: "SalesOrderSet('1')/ToLineItems?$skip=0&$top=2"
        }, {
            results: [{
                    __metadata: {
                        uri: "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10')"
                    },
                    Note: "Bar",
                    ItemPosition: "10",
                    SalesOrderID: "1"
                }, {
                    __metadata: {
                        uri: "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='20')"
                    },
                    Note: "Baz",
                    ItemPosition: "20",
                    SalesOrderID: "1"
                }]
        }).expectValue("itemPosition", ["10", "20"]).expectValue("note::item", ["Bar", "Baz"]).expectMessage(oSalesOrderNoteError, "/SalesOrderSet('1')/");
        if (bWithMessageScope) {
            this.expectMessage(oSalesOrderToBusinessPartnerAddress, "/SalesOrderSet('1')/").expectMessage(oSalesOrderItem10NoteError, "/SalesOrderLineItemSet", "/SalesOrderSet('1')/ToLineItems").expectMessage(oSalesOrderItem10ToProductPriceError, "/SalesOrderLineItemSet", "/SalesOrderSet('1')/ToLineItems").expectMessage(oSalesOrderItem20NoteError, "/SalesOrderLineItemSet", "/SalesOrderSet('1')/ToLineItems");
        }
        oModel.setMessageScope(sMessageScope);
        return this.createView(assert, sView, oModel).then(function () {
            that.expectRequest({
                deepPath: "/SalesOrderSet('1')/ToLineItems(SalesOrderID='1',ItemPosition='10')",
                headers: bWithMessageScope ? { "sap-message-scope": "BusinessObject" } : {},
                method: "DELETE",
                requestUri: "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10')"
            }, NO_CONTENT).expectValue("itemPosition", "", 0).expectValue("note::item", "", 0).expectMessages([]).expectMessage(oSalesOrderNoteError, "/SalesOrderSet('1')/").expectMessage(bWithMessageScope ? oSalesOrderToBusinessPartnerAddress : null, "/SalesOrderSet('1')/").expectMessage(bWithMessageScope ? oSalesOrderItem20NoteError : null, "/SalesOrderLineItemSet", "/SalesOrderSet('1')/ToLineItems");
            oModel.remove("", {
                context: that.oView.byId("table").getItems()[0].getBindingContext(),
                refreshAfterChange: false
            });
            oModel.submitChanges();
            return that.waitForChanges(assert);
        });
    });
});
[MessageScope.BusinessObject, MessageScope.RequestedObjects].forEach(function (sMessageScope) {
    [true, false].forEach(function (bFilter) {
        var sTitle = "Message lifecycle (11), scope: " + sMessageScope + ", bFilter: " + bFilter;
        QUnit.test(sTitle, function (assert) {
            var oModel = createSalesOrdersModelMessageScope({ preliminaryContext: true }), oSalesOrder1NoteError = this.createResponseMessage("('1')/Note"), oSalesOrder1ToBusinessPartnerAddress = this.createResponseMessage("('1')/ToBusinessPartner/Address"), oSalesOrder2NoteError = this.createResponseMessage("('2')/Note"), oSalesOrder2ToBusinessPartnerAddress = this.createResponseMessage("('2')/ToBusinessPartner/Address"), sView = "<Table growing=\"true\" growingThreshold=\"2\" id=\"table\" items=\"{/SalesOrderSet}\">\t<Input id=\"note\" value=\"{Note}\" /></Table>", bWithMessageScope = sMessageScope === MessageScope.BusinessObject, that = this;
            this.expectHeadRequest(bWithMessageScope ? { "sap-message-scope": "BusinessObject" } : {}).expectRequest({
                deepPath: "/SalesOrderSet",
                headers: bWithMessageScope ? { "sap-message-scope": "BusinessObject" } : {},
                requestUri: "SalesOrderSet?$skip=0&$top=2"
            }, {
                results: [{
                        __metadata: { uri: "SalesOrderSet('1')" },
                        Note: "Foo",
                        SalesOrderID: "1"
                    }, {
                        __metadata: { uri: "SalesOrderSet('2')" },
                        Note: "Bar",
                        SalesOrderID: "2"
                    }]
            }, {
                "sap-message": getMessageHeader(bWithMessageScope ? [oSalesOrder1NoteError, oSalesOrder1ToBusinessPartnerAddress, oSalesOrder2NoteError, oSalesOrder2ToBusinessPartnerAddress] : [oSalesOrder1NoteError, oSalesOrder2NoteError])
            }).expectValue("note", ["Foo", "Bar"]).expectMessage(oSalesOrder1NoteError, "/SalesOrderSet").expectMessage(bWithMessageScope ? oSalesOrder1ToBusinessPartnerAddress : null, "/SalesOrderSet").expectMessage(oSalesOrder2NoteError, "/SalesOrderSet").expectMessage(bWithMessageScope ? oSalesOrder2ToBusinessPartnerAddress : null, "/SalesOrderSet");
            oModel.setMessageScope(sMessageScope);
            return this.createView(assert, sView, oModel).then(function () {
                var oSalesOrder3NoteError = that.createResponseMessage("('3')/Note");
                that.expectRequest({
                    deepPath: "/SalesOrderSet",
                    headers: bWithMessageScope ? { "sap-message-scope": "BusinessObject" } : {},
                    requestUri: "SalesOrderSet?$skip=0&$top=2" + (bFilter ? "&$filter=GrossAmount gt 100.0m" : "")
                }, {
                    results: [{
                            __metadata: { uri: "SalesOrderSet('1')" },
                            Note: "Foo",
                            SalesOrderID: "1"
                        }, {
                            __metadata: {
                                uri: "SalesOrderSet('3')"
                            },
                            Note: "Baz",
                            SalesOrderID: "3"
                        }]
                }, {
                    "sap-message": getMessageHeader(bWithMessageScope ? [oSalesOrder1NoteError, oSalesOrder1ToBusinessPartnerAddress, oSalesOrder3NoteError] : [oSalesOrder1NoteError, oSalesOrder3NoteError])
                }).expectValue("note", "Baz", 1).expectMessages([]).expectMessage(oSalesOrder1NoteError, "/SalesOrderSet").expectMessage(bWithMessageScope ? oSalesOrder1ToBusinessPartnerAddress : null, "/SalesOrderSet").expectMessage(!bWithMessageScope ? oSalesOrder2NoteError : null, "/SalesOrderSet").expectMessage(oSalesOrder3NoteError, "/SalesOrderSet");
                if (bFilter) {
                    that.oView.byId("table").getBinding("items").filter([new Filter({
                            path: "GrossAmount",
                            operator: FilterOperator.GT,
                            value1: "100.0"
                        })]);
                }
                else {
                    that.oView.byId("table").getBinding("items").refresh();
                }
                return that.waitForChanges(assert);
            });
        });
    });
});
QUnit.test("ODataModel#createBindingContext with updateAggregatedMessages", function (assert) {
    var oModel = createSalesOrdersModelMessageScope({ preliminaryContext: true }), oSalesOrderNoteError = this.createResponseMessage("Note"), oSalesOrderToItem10NoteError = this.createResponseMessage("ToLineItems(SalesOrderID='1',ItemPosition='10')/Note"), oSalesOrderItem10NoteError = cloneODataMessage(oSalesOrderToItem10NoteError, "(SalesOrderID='1',ItemPosition='10')/Note"), sView = "<FlexBox id=\"form\" binding=\"{/SalesOrderSet('1')}\">\t<Text id=\"salesOrderID\" text=\"{SalesOrderID}\" /></FlexBox>", that = this;
    this.expectHeadRequest({ "sap-message-scope": "BusinessObject" }).expectRequest({
        deepPath: "/SalesOrderSet('1')",
        headers: { "sap-message-scope": "BusinessObject" },
        requestUri: "SalesOrderSet('1')"
    }, {
        __metadata: { uri: "SalesOrderSet('1')" },
        SalesOrderID: "1"
    }, {
        "sap-message": getMessageHeader([oSalesOrderNoteError, oSalesOrderToItem10NoteError])
    }).expectValue("salesOrderID", "1").expectMessage(oSalesOrderNoteError, "/SalesOrderSet('1')/").expectMessage(oSalesOrderItem10NoteError, "/SalesOrderLineItemSet", "/SalesOrderSet('1')/ToLineItems");
    oModel.setMessageScope(MessageScope.BusinessObject);
    return this.createView(assert, sView, oModel).then(function () {
        that.expectRequest({
            deepPath: "/SalesOrderSet('1')",
            headers: { "sap-message-scope": "BusinessObject" },
            requestUri: "SalesOrderSet('1')"
        }, {
            __metadata: { uri: "SalesOrderSet('1')" },
            SalesOrderID: "1"
        }, {
            "sap-message": getMessageHeader([oSalesOrderNoteError])
        }).expectMessages([]).expectMessage(oSalesOrderNoteError, "/SalesOrderSet('1')/");
        that.oView.byId("form").getObjectBinding().refresh();
        return that.waitForChanges(assert);
    });
});
QUnit.test("Filter table by items with messages", function (assert) {
    var oModel = createSalesOrdersModelMessageScope({ preliminaryContext: true }), oItemsBinding, oSalesOrderDeliveryStatusAndToItemError = this.createResponseMessage(["DeliveryStatus", "ToLineItems(SalesOrderID='1',ItemPosition='40')/Quantity"]), oSalesOrderDeliveryStatusAndItemError = cloneODataMessage(oSalesOrderDeliveryStatusAndToItemError, "DeliveryStatus", ["(SalesOrderID='1',ItemPosition='40')/Quantity"]), oSalesOrderNoteError = this.createResponseMessage("Note"), oSalesOrderToItemsError = this.createResponseMessage("ToLineItems"), oSalesOrderToItem10ToProductPriceError = this.createResponseMessage("ToLineItems(SalesOrderID='1',ItemPosition='10')/ToProduct/Price"), oSalesOrderToItem20NoteWarning = this.createResponseMessage("ToLineItems(SalesOrderID='1',ItemPosition='20')/Note", undefined, "warning"), oSalesOrderToItem30NoteError = this.createResponseMessage(["ToLineItems(SalesOrderID='1',ItemPosition='30%20')/Note", "ToLineItems(SalesOrderID='1',ItemPosition='30%20')/GrossAmount"]), oSalesOrderItem10ToProductPriceError = cloneODataMessage(oSalesOrderToItem10ToProductPriceError, "(SalesOrderID='1',ItemPosition='10')/ToProduct/Price"), oSalesOrderItem20NoteWarning = cloneODataMessage(oSalesOrderToItem20NoteWarning, "(SalesOrderID='1',ItemPosition='20')/Note"), oSalesOrderItem30NoteError = cloneODataMessage(oSalesOrderToItem30NoteError, "(SalesOrderID='1',ItemPosition='30%20')/Note", ["(SalesOrderID='1',ItemPosition='30%20')/GrossAmount"]), sView = "<FlexBox binding=\"{/SalesOrderSet('1')}\">\t<Text id=\"salesOrderID\" text=\"{SalesOrderID}\" />\t<Input id=\"note\" value=\"{Note}\" />\t<Table growing=\"true\" growingThreshold=\"2\" id=\"table\" items=\"{\t\t\tpath : 'ToLineItems',\t\t\tparameters : {transitionMessagesOnly : true}\t\t}\">\t\t<Text id=\"itemPosition\" text=\"{ItemPosition}\" />\t\t<Input id=\"note::item\" value=\"{Note}\" />\t</Table></FlexBox>", that = this;
    this.expectHeadRequest({ "sap-message-scope": "BusinessObject" }).expectRequest({
        batchNo: 1,
        deepPath: "/SalesOrderSet('1')",
        headers: { "sap-message-scope": "BusinessObject" },
        requestUri: "SalesOrderSet('1')"
    }, {
        __metadata: { uri: "SalesOrderSet('1')" },
        Note: "Foo",
        SalesOrderID: "1"
    }, {
        "sap-message": getMessageHeader([
            oSalesOrderDeliveryStatusAndToItemError,
            oSalesOrderNoteError,
            oSalesOrderToItemsError,
            oSalesOrderToItem10ToProductPriceError,
            oSalesOrderToItem20NoteWarning,
            oSalesOrderToItem30NoteError
        ])
    }).expectValue("note", "Foo").expectValue("salesOrderID", "1").expectRequest({
        batchNo: 1,
        deepPath: "/SalesOrderSet('1')/ToLineItems",
        headers: { "sap-message-scope": "BusinessObject", "sap-messages": "transientOnly" },
        requestUri: "SalesOrderSet('1')/ToLineItems?$skip=0&$top=2"
    }, {
        results: [{
                __metadata: {
                    uri: "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10')"
                },
                Note: "Bar",
                ItemPosition: "10",
                SalesOrderID: "1"
            }, {
                __metadata: {
                    uri: "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='20')"
                },
                Note: "Baz",
                ItemPosition: "20",
                SalesOrderID: "1"
            }]
    }).expectValue("itemPosition", ["10", "20"]).expectValue("note::item", ["Bar", "Baz"]).expectMessage(oSalesOrderNoteError, "/SalesOrderSet('1')/").expectMessage(oSalesOrderToItemsError, "/SalesOrderSet('1')/").expectMessage(oSalesOrderItem10ToProductPriceError, "/SalesOrderLineItemSet", "/SalesOrderSet('1')/ToLineItems").expectMessage(oSalesOrderItem20NoteWarning, "/SalesOrderLineItemSet", "/SalesOrderSet('1')/ToLineItems").expectMessage(oSalesOrderItem30NoteError, "/SalesOrderLineItemSet", "/SalesOrderSet('1')/ToLineItems").expectMessage(oSalesOrderDeliveryStatusAndItemError, ["/SalesOrderSet('1')/", "/SalesOrderLineItemSet"], ["/SalesOrderSet('1')/", "/SalesOrderSet('1')/ToLineItems"]);
    oModel.setMessageScope(MessageScope.BusinessObject);
    return this.createView(assert, sView, oModel).then(function () {
        function filterErrors(oMessage) {
            return oMessage.getType() === MessageType.Error;
        }
        oItemsBinding = that.oView.byId("table").getBinding("items");
        return oItemsBinding.requestFilterForMessages(filterErrors);
    }).then(function (oFilter) {
        that.expectRequest({
            batchNo: 2,
            deepPath: "/SalesOrderSet('1')/ToLineItems",
            headers: { "sap-message-scope": "BusinessObject", "sap-messages": "transientOnly" },
            requestUri: "SalesOrderSet('1')/ToLineItems?$skip=0&$top=2" + "&$filter=(SalesOrderID eq '1' and ItemPosition eq '40')" + " or (SalesOrderID eq '1' and ItemPosition eq '10')" + " or (SalesOrderID eq '1' and ItemPosition eq '30 ')"
        }, {
            results: [{
                    __metadata: {
                        uri: "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10')"
                    },
                    Note: "Bar",
                    ItemPosition: "10",
                    SalesOrderID: "1"
                }, {
                    __metadata: {
                        uri: "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='30%20')"
                    },
                    Note: "Qux",
                    ItemPosition: "30 ",
                    SalesOrderID: "1"
                }]
        }).expectValue("itemPosition", "30 ", 1).expectValue("note::item", "Qux", 1);
        oItemsBinding.filter(oFilter);
        return that.waitForChanges(assert);
    });
});
QUnit.test("Filter table by items with messages - client side filtering", function (assert) {
    var oItemsBinding, oModel = createRMTSampleFlightModel({ defaultOperationMode: "Client" }), oCarrierToFlight10PriceError = this.createResponseMessage("carrierFlights(carrid='1',connid='10'," + "fldate=datetime'2015-05-30T13:47:26.253')/PRICE"), oCarrierToFlight20PriceWarning = this.createResponseMessage("carrierFlights(carrid='1',connid='20'," + "fldate=datetime'2015-06-30T13:47:26.253')/PRICE", undefined, "warning"), oFlight10PriceError = cloneODataMessage(oCarrierToFlight10PriceError, "(carrid='1',connid='10',fldate=datetime'2015-05-30T13:47:26.253')/PRICE"), oFlight20PriceWarning = cloneODataMessage(oCarrierToFlight20PriceWarning, "(carrid='1',connid='20',fldate=datetime'2015-06-30T13:47:26.253')/PRICE"), sView = "<FlexBox binding=\"{/CarrierCollection('1')}\">\t<Text id=\"carrierID\" text=\"{carrid}\" />\t<Table growing=\"true\" growingThreshold=\"1\" id=\"table\" items=\"{\t\t\tpath : 'carrierFlights',\t\t\tparameters : {transitionMessagesOnly : true}\t\t}\">\t\t<Text id=\"connectionID\" text=\"{connid}\" />\t\t<Text id=\"flightDate\" text=\"{\t\t\tpath : 'fldate',\t\t\ttype : 'sap.ui.model.odata.type.DateTime',\t\t\tformatOptions: {style : 'short', UTC : true}\t\t}\" />\t</Table></FlexBox>", that = this;
    this.expectHeadRequest({ "sap-message-scope": "BusinessObject" }).expectRequest({
        deepPath: "/CarrierCollection('1')",
        headers: { "sap-message-scope": "BusinessObject" },
        requestUri: "CarrierCollection('1')"
    }, {
        __metadata: { uri: "CarrierCollection('1')" },
        carrid: "1"
    }, {
        "sap-message": getMessageHeader([
            oCarrierToFlight10PriceError,
            oCarrierToFlight20PriceWarning
        ])
    }).expectValue("carrierID", "1").expectRequest({
        deepPath: "/CarrierCollection('1')/carrierFlights",
        headers: { "sap-message-scope": "BusinessObject", "sap-messages": "transientOnly" },
        requestUri: "CarrierCollection('1')/carrierFlights"
    }, {
        results: [{
                __metadata: {
                    uri: "FlightCollection(carrid='1',connid='10'," + "fldate=datetime'2015-05-30T13:47:26.253')"
                },
                carrid: "1",
                connid: "10",
                fldate: new Date(1432993646253)
            }, {
                __metadata: {
                    uri: "FlightCollection(carrid='1',connid='20'," + "fldate=datetime'2015-06-30T13:47:26.253')"
                },
                carrid: "1",
                connid: "20",
                fldate: new Date(1435672046253)
            }]
    }).expectValue("connectionID", ["10"]).expectValue("flightDate", ["5/30/15, 1:47 PM"]).expectMessage(oFlight10PriceError, "/FlightCollection", "/CarrierCollection('1')/carrierFlights").expectMessage(oFlight20PriceWarning, "/FlightCollection", "/CarrierCollection('1')/carrierFlights");
    oModel.setMessageScope(MessageScope.BusinessObject);
    return this.createView(assert, sView, oModel).then(function () {
        oItemsBinding = that.oView.byId("table").getBinding("items");
        return oItemsBinding.requestFilterForMessages(function (oMessage) {
            return oMessage.getType() === MessageType.Warning;
        });
    }).then(function (oFilter) {
        that.expectValue("connectionID", ["20"]).expectValue("flightDate", ["6/30/15, 1:47 PM"]);
        oItemsBinding.filter(oFilter);
        return that.waitForChanges(assert);
    });
});
QUnit.test("ODataListBinding: Correct data state after initialization or context switch", function (assert) {
    var oModel = createSalesOrdersModelMessageScope(), oItemsBinding, oSalesOrderToItem10ToProductPriceError = this.createResponseMessage("ToLineItems(SalesOrderID='1',ItemPosition='10')/ToProduct/Price"), oSalesOrderItem10ToProductPriceError = cloneODataMessage(oSalesOrderToItem10ToProductPriceError, "(SalesOrderID='1',ItemPosition='10')/ToProduct/Price"), sView = "<FlexBox binding=\"{/SalesOrderSet('1')}\">\t<Table growing=\"true\" growingThreshold=\"20\" id=\"table\" items=\"{\t\t\tpath : 'ToLineItems',\t\t\tparameters : {transitionMessagesOnly : true},\t\t\ttemplateShareable : true\t\t}\">\t\t<Text id=\"itemPosition\" text=\"{ItemPosition}\" />\t\t<Input id=\"note::item\" value=\"{Note}\" />\t</Table></FlexBox>", that = this;
    this.expectHeadRequest({ "sap-message-scope": "BusinessObject" }).expectRequest({
        deepPath: "/SalesOrderSet('1')",
        headers: { "sap-message-scope": "BusinessObject" },
        requestUri: "SalesOrderSet('1')"
    }, {
        __metadata: { uri: "SalesOrderSet('1')" },
        Note: "Foo",
        SalesOrderID: "1"
    }, {
        "sap-message": getMessageHeader([oSalesOrderToItem10ToProductPriceError])
    }).expectRequest({
        deepPath: "/SalesOrderSet('1')/ToLineItems",
        headers: { "sap-message-scope": "BusinessObject", "sap-messages": "transientOnly" },
        requestUri: "SalesOrderSet('1')/ToLineItems?$skip=0&$top=20"
    }, {
        results: [{
                __metadata: {
                    uri: "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10')"
                },
                Note: "Bar",
                ItemPosition: "10",
                SalesOrderID: "1"
            }]
    }).expectMessage(oSalesOrderItem10ToProductPriceError, "/SalesOrderLineItemSet", "/SalesOrderSet('1')/ToLineItems");
    oModel.setMessageScope(MessageScope.BusinessObject);
    return this.createView(assert, sView, oModel).then(function () {
        oItemsBinding = that.oView.byId("table").getBinding("items");
        assert.strictEqual(oItemsBinding.getDataState().getMessages().length, 1);
        return that.waitForChanges(assert);
    }).then(function (oFilter) {
        var oTable = that.oView.byId("table"), oBindingInfo = oTable.getBindingInfo("items");
        oTable.unbindAggregation("items");
        assert.strictEqual(oTable.getItems().length, 0);
        that.expectRequest({
            deepPath: "/SalesOrderSet('1')/ToLineItems",
            headers: { "sap-message-scope": "BusinessObject", "sap-messages": "transientOnly" },
            requestUri: "SalesOrderSet('1')/ToLineItems?$skip=0&$top=20"
        }, {
            results: [{
                    __metadata: {
                        uri: "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10')"
                    },
                    Note: "Bar",
                    ItemPosition: "10",
                    SalesOrderID: "1"
                }]
        });
        oTable.bindItems(oBindingInfo);
        return that.waitForChanges(assert);
    }).then(function () {
        oItemsBinding = that.oView.byId("table").getBinding("items");
        assert.strictEqual(oItemsBinding.getDataState().getMessages().length, 1);
        return that.waitForChanges(assert);
    });
});
[{
        aExpectedMessages: [],
        aResponses: [{
                data: {
                    __metadata: { uri: "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10')" },
                    ItemPosition: "10",
                    SalesOrderID: "1"
                },
                statusCode: 201
            }, {
                data: {
                    __metadata: { uri: "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='20')" },
                    ItemPosition: "20",
                    SalesOrderID: "1"
                },
                statusCode: 201
            }, {
                results: [{
                        __metadata: { uri: "/SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10')" },
                        ItemPosition: "10",
                        Note: "Foo",
                        SalesOrderID: "1"
                    }, {
                        __metadata: {
                            uri: "/SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='20')"
                        },
                        ItemPosition: "20",
                        Note: "Bar",
                        SalesOrderID: "1"
                    }]
            }],
        sTitle: "Successfully create 2 entities"
    }, {
        aExpectedMessages: [{
                code: "UF0",
                descriptionUrl: "",
                fullTarget: "/SalesOrderSet('1')/ToLineItems('~key~')",
                message: "Internal Server Error",
                persistent: false,
                target: "/SalesOrderLineItemSet('~key~')",
                technical: true,
                type: "Error"
            }, {
                code: "UF0",
                descriptionUrl: "",
                fullTarget: "/SalesOrderSet('1')/ToLineItems('~key~')",
                message: "Internal Server Error",
                persistent: false,
                target: "/SalesOrderLineItemSet('~key~')",
                technical: true,
                type: "Error"
            }],
        aResponses: [createErrorResponse(), undefined, { results: [] }],
        sTitle: "Create 2 entities with error response"
    }].forEach(function (oFixture) {
    QUnit.test("ODataModel#createEntry: " + oFixture.sTitle, function (assert) {
        var oContext, oModel = createSalesOrdersModelMessageScope({ canonicalRequests: true }), bWithError = oFixture.aExpectedMessages.length > 0, that = this;
        return this.createView(assert, "", oModel).then(function () {
            var oEventHandlers = {
                requestCompleted: function () { },
                requestFailed: function () { }
            };
            that.expectHeadRequest().expectRequest({
                batchNo: 1,
                created: true,
                data: {
                    __metadata: {
                        type: "gwsample_basic.SalesOrderLineItem"
                    }
                },
                deepPath: "/SalesOrderSet('1')/ToLineItems('~key~')",
                method: "POST",
                requestUri: "SalesOrderSet('1')/ToLineItems"
            }, oFixture.aResponses[0]).expectRequest({
                batchNo: 1,
                created: true,
                data: {
                    __metadata: {
                        type: "gwsample_basic.SalesOrderLineItem"
                    }
                },
                deepPath: "/SalesOrderSet('1')/ToLineItems('~key~')",
                method: "POST",
                requestUri: "SalesOrderSet('1')/ToLineItems"
            }, oFixture.aResponses[1]).expectRequest({
                batchNo: 1,
                deepPath: "/SalesOrderSet('1')/ToLineItems",
                requestUri: "SalesOrderSet('1')/ToLineItems"
            }, oFixture.aResponses[2]).expectMessages(oFixture.aExpectedMessages);
            if (bWithError) {
                that.oLogMock.expects("error").twice().withExactArgs("Request failed with status code 500: " + "POST SalesOrderSet('1')/ToLineItems", sinon.match.string, sODataMessageParserClassName);
            }
            that.mock(oEventHandlers).expects("requestCompleted").exactly(3);
            that.mock(oEventHandlers).expects("requestFailed").exactly(bWithError ? 2 : 0);
            oModel.attachRequestCompleted(oEventHandlers.requestCompleted);
            oModel.attachRequestFailed(oEventHandlers.requestFailed);
            oContext = oModel.createEntry("/SalesOrderSet('1')/ToLineItems", { properties: {} });
            assert.strictEqual(oContext.isTransient(), true);
            oModel.createEntry("/SalesOrderSet('1')/ToLineItems", { properties: {} });
            oModel.read("/SalesOrderSet('1')/ToLineItems", { groupId: "changes" });
            oModel.submitChanges();
            return that.waitForChanges(assert);
        }).then(function () {
            assert.strictEqual(oContext.isTransient(), bWithError ? true : false);
        });
    });
});
[false, true].forEach(function (bWithFailedPOST) {
    [false, true].forEach(function (bWithPath) {
        [false, true].forEach(function (bDeleteCreatedEntities) {
            [false, true].forEach(function (bPersistTechnicalMessages) {
                var sTitle = "ODataModel#createEntry: discard created entity by using ODataModel#resetChanges " + (bWithPath ? "called with the context path " : "") + (bWithFailedPOST ? "after failed submit " : " immediately ") + (bDeleteCreatedEntities ? "; delete" : "; keep") + " cache data" + "; bPersistTechnicalMessages: " + bPersistTechnicalMessages;
                QUnit.test(sTitle, function (assert) {
                    var oCreatedContext, oModel = createSalesOrdersModelMessageScope({
                        persistTechnicalMessages: bPersistTechnicalMessages
                    }), that = this;
                    return this.createView(assert, "", oModel).then(function () {
                        oCreatedContext = oModel.createEntry("/SalesOrderSet('1')/ToLineItems", {
                            properties: { Note: "Foo" }
                        });
                        if (bWithFailedPOST) {
                            that.expectHeadRequest().expectRequest({
                                created: true,
                                data: {
                                    __metadata: {
                                        type: "gwsample_basic.SalesOrderLineItem"
                                    },
                                    Note: "Foo"
                                },
                                deepPath: "/SalesOrderSet('1')/ToLineItems('~key~')",
                                headers: { "Content-ID": "~key~" },
                                method: "POST",
                                requestUri: "SalesOrderSet('1')/ToLineItems"
                            }, createErrorResponse({
                                message: "POST failed",
                                statusCode: 400,
                                target: ""
                            })).expectMessages([{
                                    code: "UF0",
                                    fullTarget: "/SalesOrderSet('1')/ToLineItems('~key~')",
                                    message: "POST failed",
                                    persistent: bPersistTechnicalMessages,
                                    target: "/SalesOrderLineItemSet('~key~')",
                                    technical: true,
                                    type: "Error"
                                }]);
                            that.oLogMock.expects("error").withExactArgs("Request failed with status code 400: " + "POST SalesOrderSet('1')/ToLineItems", sinon.match.string, sODataMessageParserClassName);
                            oModel.submitChanges();
                        }
                        return that.waitForChanges(assert);
                    }).then(function () {
                        var oResetPromise;
                        if (bWithFailedPOST && bPersistTechnicalMessages && !bDeleteCreatedEntities) {
                            that.expectMessages([{
                                    code: "UF0",
                                    fullTarget: "/SalesOrderSet('1')/ToLineItems('~key~')",
                                    message: "POST failed",
                                    persistent: bPersistTechnicalMessages,
                                    target: "/SalesOrderLineItemSet('~key~')",
                                    technical: true,
                                    type: "Error"
                                }]);
                        }
                        else {
                            that.expectMessages([]);
                        }
                        oResetPromise = oModel.resetChanges(bWithPath ? [oCreatedContext.getPath()] : undefined, undefined, bDeleteCreatedEntities);
                        if (bDeleteCreatedEntities) {
                            assert.strictEqual(oModel.getObject(oCreatedContext.getPath()), undefined);
                        }
                        else {
                            assert.ok(oModel.getObject(oCreatedContext.getPath()));
                            assert.strictEqual(oModel.getObject(oCreatedContext.getPath() + "/Note"), "Foo");
                        }
                        oModel.submitChanges();
                        return Promise.all([
                            oResetPromise,
                            that.waitForChanges(assert)
                        ]);
                    });
                });
            });
        });
    });
});
[false, true].forEach(function (bWithFailedPOST) {
    var sTitle = "ODataModel#createEntry: discard created entity by using " + "ODataModel#deleteCreatedEntry " + (bWithFailedPOST ? "after failed submit" : "immediately");
    QUnit.test(sTitle, function (assert) {
        var oCreatedContext, oModel = createSalesOrdersModelMessageScope(), that = this;
        return this.createView(assert, "", oModel).then(function () {
            oCreatedContext = oModel.createEntry("/SalesOrderSet('1')/ToLineItems", {
                properties: {}
            });
            if (bWithFailedPOST) {
                that.expectHeadRequest().expectRequest({
                    created: true,
                    data: {
                        __metadata: {
                            type: "gwsample_basic.SalesOrderLineItem"
                        }
                    },
                    deepPath: "/SalesOrderSet('1')/ToLineItems('~key~')",
                    headers: { "Content-ID": "~key~" },
                    method: "POST",
                    requestUri: "SalesOrderSet('1')/ToLineItems"
                }, createErrorResponse({ message: "POST failed", statusCode: 400 })).expectMessages([{
                        code: "UF0",
                        fullTarget: "/SalesOrderSet('1')/ToLineItems('~key~')",
                        message: "POST failed",
                        persistent: false,
                        target: "/SalesOrderLineItemSet('~key~')",
                        technical: true,
                        type: "Error"
                    }]);
                that.oLogMock.expects("error").withExactArgs("Request failed with status code 400: " + "POST SalesOrderSet('1')/ToLineItems", sinon.match.string, sODataMessageParserClassName);
                oModel.submitChanges();
            }
            return that.waitForChanges(assert);
        }).then(function () {
            that.expectMessages([]);
            oModel.deleteCreatedEntry(oCreatedContext);
            assert.strictEqual(oModel.getObject(oCreatedContext.getPath()), undefined);
            oModel.submitChanges();
            return that.waitForChanges(assert);
        });
    });
});
QUnit.test("createEntry: automatic expand of navigation properties", function (assert) {
    var iBatchNo = 1, oCreatedContext, oGETRequest = {
        deepPath: "/$~key~",
        requestUri: "$~key~?$expand=ToProduct&$select=ToProduct"
    }, oModel = createSalesOrdersModelMessageScope({ canonicalRequests: true }), oNoteError = this.createResponseMessage("Note"), oPOSTRequest = {
        created: true,
        data: {
            __metadata: {
                type: "gwsample_basic.SalesOrderLineItem"
            }
        },
        deepPath: "/SalesOrderSet('1')/ToLineItems('~key~')",
        headers: { "Content-ID": "~key~", "sap-messages": "transientOnly" },
        method: "POST",
        requestUri: "SalesOrderSet('1')/ToLineItems"
    }, sView = "<FlexBox id=\"productDetails\"\tbinding=\"{path : 'ToProduct', parameters : {select : 'Name'}}\">\t<Text id=\"productName\" text=\"{Name}\" /></FlexBox>", that = this;
    return this.createView(assert, sView, oModel).then(function () {
        var oErrorGET = createErrorResponse({ message: "GET failed", statusCode: 424 }), oErrorPOST = createErrorResponse({ message: "POST failed", statusCode: 400 }), bHandlerCalled;
        function fnHandleError(oEvent) {
            var oResponse = oEvent.getParameter("response");
            if (!bHandlerCalled) {
                assert.strictEqual(oResponse.expandAfterCreateFailed, undefined);
                bHandlerCalled = true;
            }
            else {
                assert.strictEqual(oResponse.expandAfterCreateFailed, true);
                oModel.detachRequestFailed(fnHandleError);
            }
        }
        that.expectHeadRequest().expectRequest(Object.assign({ batchNo: iBatchNo }, oPOSTRequest), oErrorPOST).expectRequest(Object.assign({ batchNo: iBatchNo }, oGETRequest), oErrorGET).expectMessages([{
                code: "UF0",
                descriptionUrl: "",
                fullTarget: "/SalesOrderSet('1')/ToLineItems('~key~')",
                message: "POST failed",
                persistent: false,
                target: "/SalesOrderLineItemSet('~key~')",
                technical: true,
                type: "Error"
            }]);
        oModel.attachRequestFailed(fnHandleError);
        oCreatedContext = oModel.createEntry("/SalesOrderSet('1')/ToLineItems", {
            expand: "ToProduct",
            properties: {}
        });
        that.oLogMock.expects("error").withExactArgs("Request failed with status code 400: " + "POST SalesOrderSet('1')/ToLineItems", sinon.match.string, sODataMessageParserClassName);
        that.oLogMock.expects("error").withExactArgs(sinon.match(new RegExp("Request failed with status code 424: " + "GET \\$id-\\d*-\\d*\\?\\$expand=ToProduct&\\$select=ToProduct")), sinon.match.string, sODataMessageParserClassName);
        oModel.submitChanges();
        iBatchNo += 1;
        return that.waitForChanges(assert);
    }).then(function () {
        that.expectRequest(Object.assign({ batchNo: iBatchNo }, oPOSTRequest), {
            data: {
                __metadata: {
                    uri: "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10')"
                },
                ItemPosition: "10",
                SalesOrderID: "1"
            },
            statusCode: 201
        }).expectRequest(Object.assign({ batchNo: iBatchNo }, oGETRequest), {
            __metadata: {
                uri: "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10')"
            },
            ToProduct: {
                __metadata: { uri: "ProductSet(ProductID='P1')" },
                Name: "Product 1",
                ProductID: "P1"
            }
        }, {
            "sap-message": getMessageHeader([oNoteError])
        }).expectMessage(oNoteError, "/SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10')/", "/SalesOrderSet('1')/ToLineItems(SalesOrderID='1',ItemPosition='10')/");
        oModel.submitChanges();
        return that.waitForChanges(assert);
    }).then(function () {
        that.expectValue("productName", "Product 1");
        that.oView.byId("productDetails").setBindingContext(oCreatedContext);
        return that.waitForChanges(assert);
    }).then(function () {
        [
            "/SalesOrderSet('1')/ToLineItems(SalesOrderID='1',ItemPosition='10')/ToProduct",
            "/SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10')/ToProduct",
            "/ProductSet(ProductID='P1')"
        ].forEach(function (sPath) {
            var oData = oModel.getObject(sPath, null, { select: "Name" });
            assert.strictEqual(oData.Name, "Product 1", "getObject for " + sPath);
        });
        return that.waitForChanges(assert);
    });
});
QUnit.test("createEntry: ignore status code 424 of GET in batch with POST", function (assert) {
    var oModel = createSalesOrdersModelMessageScope({ canonicalRequests: true }), sView = "<FlexBox id=\"productDetails\"\tbinding=\"{path : 'ToProduct', parameters : {select : 'Name'}}\">\t<Text id=\"productName\" text=\"{Name}\" /></FlexBox>", that = this;
    return this.createView(assert, sView, oModel).then(function () {
        var oErrorGET = createErrorResponse({ message: "GET failed", statusCode: 424 }), oErrorPOST = createErrorResponse({ message: "POST failed", statusCode: 400 }), oGETRequest = {
            deepPath: "/$~key~",
            requestUri: "$~key~?$expand=ToProduct&$select=ToProduct"
        }, bHandlerCalled, oPOSTRequest = {
            created: true,
            data: {
                __metadata: {
                    type: "gwsample_basic.SalesOrderLineItem"
                }
            },
            deepPath: "/SalesOrderSet('1')/ToLineItems('~key~')",
            headers: { "Content-ID": "~key~", "sap-messages": "transientOnly" },
            method: "POST",
            requestUri: "SalesOrderSet('1')/ToLineItems"
        };
        function fnHandleError(oEvent) {
            var oResponse = oEvent.getParameter("response");
            if (!bHandlerCalled) {
                assert.strictEqual(oResponse.expandAfterCreateFailed, undefined);
                bHandlerCalled = true;
            }
            else {
                assert.strictEqual(oResponse.expandAfterCreateFailed, true);
                oModel.detachRequestFailed(fnHandleError);
            }
        }
        that.expectHeadRequest().expectRequest(oPOSTRequest, oErrorPOST).expectRequest(oGETRequest, oErrorGET).expectMessages([{
                code: "UF0",
                descriptionUrl: "",
                fullTarget: "/SalesOrderSet('1')/ToLineItems('~key~')",
                message: "POST failed",
                persistent: false,
                target: "/SalesOrderLineItemSet('~key~')",
                technical: true,
                type: "Error"
            }]);
        oModel.attachRequestFailed(fnHandleError);
        oModel.createEntry("/SalesOrderSet('1')/ToLineItems", {
            expand: "ToProduct",
            properties: {}
        });
        that.oLogMock.expects("error").withExactArgs("Request failed with status code 400: " + "POST SalesOrderSet('1')/ToLineItems", sinon.match.string, sODataMessageParserClassName);
        that.oLogMock.expects("error").withExactArgs(sinon.match(new RegExp("Request failed with status code 424: " + "GET \\$id-\\d*-\\d*\\?\\$expand=ToProduct&\\$select=ToProduct")), sinon.match.string, sODataMessageParserClassName);
        oModel.submitChanges();
        return that.waitForChanges(assert);
    });
});
QUnit.test("createEntry: abort automatic expand of navigation properties", function (assert) {
    var oModel = createSalesOrdersModelMessageScope(), that = this;
    return this.createView(assert, "", oModel).then(function () {
        oModel.createEntry("/SalesOrderSet('1')/ToLineItems", {
            expand: "ToProduct",
            properties: {}
        });
        oModel.resetChanges();
        oModel.submitChanges();
        return that.waitForChanges(assert);
    });
});
QUnit.test("createEntry: update deep path with resulting entity", function (assert) {
    var oModel = createSalesOrdersModel(), oNoteError = this.createResponseMessage("Note"), sView = "<FlexBox id=\"page\">\t<Input id=\"note\" value=\"{Note}\" /></FlexBox>", that = this;
    return this.createView(assert, sView, oModel).then(function () {
        that.expectHeadRequest().expectRequest({
            created: true,
            data: {
                __metadata: {
                    type: "GWSAMPLE_BASIC.SalesOrderLineItem"
                }
            },
            deepPath: "/SalesOrderLineItemSet('~key~')",
            method: "POST",
            requestUri: "SalesOrderLineItemSet"
        }, {
            data: {
                __metadata: {
                    uri: "/SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10')"
                },
                ItemPosition: "10",
                Note: "foo",
                SalesOrderID: "1"
            },
            statusCode: 201
        }, {
            location: "/sap/opu/odata/IWBEP/GWSAMPLE_BASIC/SalesOrderLineItemSet" + "(SalesOrderID='1',ItemPosition='10')",
            "sap-message": getMessageHeader(oNoteError)
        }).expectValue("note", "foo").expectMessage(oNoteError, "/SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10')/");
        that.oView.byId("page").setBindingContext(oModel.createEntry("/SalesOrderLineItemSet", { properties: {} }));
        oModel.submitChanges();
        return that.waitForChanges(assert);
    }).then(function () {
        that.checkValueState(assert, "note", "Error", oNoteError.message);
    });
});
QUnit.test("createEntry: update deep path with resulting entity (deep)", function (assert) {
    var oModel = createSalesOrdersModel({ refreshAfterChange: false }), oNoteError = this.createResponseMessage("Note"), sView = "<FlexBox binding=\"{path : '/SalesOrderSet(\\'1\\')',\t\tparameters : {select : 'SalesOrderID,Note', expand : 'ToLineItems'}}\">\t<Text id=\"noteSalesOrder\" text=\"{Note}\" />\t<Table id=\"table\" items=\"{path : 'ToLineItems',\t\t\tparameters : {select : 'ItemPosition,Note,SalesOrderID'}}\">\t\t<Text id=\"itemPosition\" text=\"{ItemPosition}\" />\t</Table></FlexBox><FlexBox id=\"details\">\t<Input id=\"noteLineItem\" value=\"{Note}\" /></FlexBox>", that = this;
    this.expectHeadRequest().expectRequest("SalesOrderSet('1')?$select=SalesOrderID%2cNote&$expand=ToLineItems", {
        __metadata: { uri: "SalesOrderSet('1')" },
        Note: "foo",
        SalesOrderID: "1",
        ToLineItems: {
            results: []
        }
    }).expectValue("noteSalesOrder", "foo");
    return this.createView(assert, sView, oModel).then(function () {
        var oNoteErrorCopy = cloneODataMessage(oNoteError, "(SalesOrderID='1',ItemPosition='10')/Note");
        that.expectRequest({
            created: true,
            data: {
                __metadata: {
                    type: "GWSAMPLE_BASIC.SalesOrderLineItem"
                }
            },
            deepPath: "/SalesOrderSet('1')/ToLineItems('~key~')",
            method: "POST",
            requestUri: "SalesOrderSet('1')/ToLineItems"
        }, {
            data: {
                __metadata: {
                    uri: "/SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10')"
                },
                ItemPosition: "10",
                Note: "bar",
                SalesOrderID: "1"
            },
            statusCode: 201
        }, {
            location: "/sap/opu/odata/IWBEP/GWSAMPLE_BASIC/SalesOrderSet('1')/ToLineItems" + "(SalesOrderID='1',ItemPosition='10')",
            "sap-message": getMessageHeader(oNoteError)
        }).expectValue("noteLineItem", "bar").expectMessage(oNoteErrorCopy, "/SalesOrderLineItemSet", "/SalesOrderSet('1')/ToLineItems");
        that.oView.byId("details").setBindingContext(oModel.createEntry("ToLineItems", {
            context: that.oView.byId("table").getBindingContext(),
            properties: {}
        }));
        oModel.submitChanges();
        return that.waitForChanges(assert);
    }).then(function () {
        that.checkValueState(assert, "noteLineItem", "Error", oNoteError.message);
    });
});
QUnit.test("createEntry: no change of deep path for non-collections", function (assert) {
    var oModel = createSalesOrdersModel(), sView = "<FlexBox binding=\"{/SalesOrderSet('1')}\" id=\"page\">\t<FlexBox id=\"details\">\t\t<Input id=\"name\" value=\"{CompanyName}\" />\t</FlexBox></FlexBox>", that = this;
    this.expectHeadRequest().expectRequest("SalesOrderSet('1')", {
        __metadata: { uri: "SalesOrderSet('1')" },
        SalesOrderID: "1"
    });
    return this.createView(assert, sView, oModel).then(function () {
        var oCompanyNameError = that.createResponseMessage("CompanyName");
        that.expectRequest({
            created: true,
            data: {
                __metadata: {
                    type: "GWSAMPLE_BASIC.BusinessPartner"
                }
            },
            deepPath: "/SalesOrderSet('1')/ToBusinessPartner",
            method: "POST",
            requestUri: "SalesOrderSet('1')/ToBusinessPartner"
        }, {
            data: {
                __metadata: {
                    uri: "/BusinessPartnerSet('BP1')"
                },
                BusinessPartnerID: "BP1",
                CompanyName: "SAP"
            },
            statusCode: 201
        }, {
            location: "/sap/opu/odata/IWBEP/GWSAMPLE_BASIC/BusinessPartnerSet('BP1')",
            "sap-message": getMessageHeader(oCompanyNameError)
        }).expectValue("name", "SAP").expectMessage(oCompanyNameError, "/BusinessPartnerSet('BP1')/", "/SalesOrderSet('1')/ToBusinessPartner/");
        that.oView.byId("details").setBindingContext(oModel.createEntry("ToBusinessPartner", {
            context: that.oView.byId("page").getBindingContext(),
            properties: {}
        }));
        oModel.submitChanges();
        return that.waitForChanges(assert);
    });
});
QUnit.test("ODataListBinding#create: create and discard", function (assert) {
    var oBinding, oCreatedContext, oTable, oModel = createSalesOrdersModel(), sView = "<Table growing=\"true\" growingThreshold=\"2\" id=\"SalesOrderList\" items=\"{/SalesOrderSet}\">\t<Text id=\"SalesOrderNote\" text=\"{Note}\" /></Table>", that = this;
    this.expectHeadRequest().expectRequest("SalesOrderSet?$skip=0&$top=2", {
        results: []
    }).expectValue("SalesOrderNote", []);
    return this.createView(assert, sView, oModel).then(function () {
        oTable = that.oView.byId("SalesOrderList");
        oBinding = oTable.getBinding("items");
        that.expectValue("SalesOrderNote", ["baz"]);
        oCreatedContext = oBinding.create({ Note: "baz" });
        assert.strictEqual(oBinding.getLength(), 1);
        assert.strictEqual(oBinding.getCount(), 1);
        return that.waitForChanges(assert);
    }).then(function () {
        assert.strictEqual(oTable.getItems().length, 1);
        that.expectValue("SalesOrderNote", [""]);
        return Promise.all([
            oModel.resetChanges([oCreatedContext.getPath()], undefined, true),
            oCreatedContext.created().then(function () {
                assert.ok(false, "unexpected success");
            }, function (oError) {
                assert.strictEqual(oError.aborted, true);
            }),
            that.waitForChanges(assert)
        ]);
    }).then(function () {
        assert.strictEqual(oBinding.getLength(), 0);
        assert.strictEqual(oBinding.getCount(), 0);
        assert.strictEqual(oTable.getItems().length, 0);
        that.expectValue("SalesOrderNote", ["foo"]);
        oCreatedContext = oBinding.create({ Note: "foo" });
        assert.strictEqual(oBinding.getLength(), 1);
        assert.strictEqual(oBinding.getCount(), 1);
        return that.waitForChanges(assert);
    }).then(function () {
        that.expectRequest({
            created: true,
            data: {
                __metadata: {
                    type: "GWSAMPLE_BASIC.SalesOrder"
                },
                Note: "foo"
            },
            deepPath: "/SalesOrderSet('~key~')",
            method: "POST",
            requestUri: "SalesOrderSet"
        }, {
            data: {
                __metadata: {
                    uri: "SalesOrderSet('42')"
                },
                Note: "bar",
                SalesOrderID: "42"
            },
            statusCode: 201
        }).expectValue("SalesOrderNote", ["bar"]);
        oModel.submitChanges();
        return Promise.all([
            oCreatedContext.created(),
            that.waitForChanges(assert)
        ]);
    });
});
QUnit.test("Clear table if parent context is transient", function (assert) {
    var oBinding, oObjectPage, oTable, oModel = createSalesOrdersModel(), sView = "<FlexBox id=\"objectPage\">\t<Text id=\"salesOrderId\" text=\"{SalesOrderID}\" />\t<Table id=\"table\" items=\"{ToLineItems}\">\t\t<Text id=\"salesOrderNote\" text=\"{Note}\" />\t</Table></FlexBox>", that = this;
    return this.createView(assert, sView, oModel).then(function (oView) {
        oObjectPage = that.oView.byId("objectPage");
        that.expectHeadRequest().expectRequest("SalesOrderSet('1')", {
            SalesOrderID: "1"
        }).expectRequest("SalesOrderSet('1')/ToLineItems?$skip=0&$top=100", {
            results: []
        }).expectValue("salesOrderId", "1").expectValue("salesOrderNote", []);
        oObjectPage.bindElement({ path: "/SalesOrderSet('1')" });
        return that.waitForChanges(assert);
    }).then(function () {
        var oCreatedContext;
        oTable = that.oView.byId("table");
        oBinding = oTable.getBinding("items");
        that.expectRequest({
            created: true,
            data: {
                __metadata: {
                    type: "GWSAMPLE_BASIC.SalesOrderLineItem"
                },
                Note: "foo"
            },
            deepPath: "/SalesOrderSet('1')/ToLineItems('~key~')",
            method: "POST",
            requestUri: "SalesOrderSet('1')/ToLineItems"
        }, {
            data: {
                __metadata: {
                    uri: "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10')"
                },
                Note: "foo",
                SalesOrderID: "1",
                ItemPosition: "10"
            },
            statusCode: 201
        }).expectValue("salesOrderNote", ["foo"]);
        oCreatedContext = oBinding.create({ Note: "foo" });
        oModel.submitChanges();
        return Promise.all([
            oCreatedContext.created(),
            that.waitForChanges(assert)
        ]);
    }).then(function () {
        var oCreatedContext = oModel.createEntry("/SalesOrderSet", {
            properties: { SalesOrderID: "new" }
        });
        assert.strictEqual(oTable.getItems().length, 1);
        that.expectValue("salesOrderId", "new");
        oObjectPage.bindElement({ path: oCreatedContext.getPath() });
        return that.waitForChanges(assert);
    }).then(function () {
        assert.strictEqual(oTable.getItems().length, 0);
    });
});
QUnit.test("ODataListBinding#create: keep created after refresh", function (assert) {
    var oModel = createSalesOrdersModelMessageScope(), oTable, sView = "<FlexBox id=\"page\" binding=\"{/SalesOrderSet('1')}\">\t<Table growing=\"true\" growingThreshold=\"20\" id=\"table\" items=\"{ToLineItems}\">\t\t<Input id=\"note\" value=\"{Note}\" />\t</Table></FlexBox>", that = this;
    this.expectHeadRequest().expectRequest("SalesOrderSet('1')", {
        __metadata: { uri: "SalesOrderSet('1')" },
        SalesOrderID: "1"
    }).expectRequest("SalesOrderSet('1')/ToLineItems?$skip=0&$top=20", {
        results: [{
                __metadata: {
                    uri: "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10')"
                },
                Note: "Foo",
                ItemPosition: "10",
                SalesOrderID: "1"
            }]
    }).expectValue("note", ["Foo"]).expectMessages([]);
    return this.createView(assert, sView, oModel).then(function () {
        oTable = that.oView.byId("table");
        that.expectValue("note", ["Bar", "Foo"]);
        oTable.getBinding("items").create({ Note: "Bar" });
        return that.waitForChanges(assert);
    }).then(function () {
        assert.strictEqual(oTable.getItems().length, 2);
        that.expectRequest("SalesOrderSet('1')", {
            __metadata: { uri: "SalesOrderSet('1')" },
            SalesOrderID: "1"
        }).expectRequest("SalesOrderSet('1')/ToLineItems?$skip=0&$top=19", {
            results: [{
                    __metadata: {
                        uri: "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10')"
                    },
                    Note: "Foo",
                    ItemPosition: "10",
                    SalesOrderID: "1"
                }]
        });
        that.oView.byId("page").getElementBinding().refresh(true);
        return that.waitForChanges(assert);
    }).then(function () {
        assert.strictEqual(oTable.getItems().length, 2);
    });
});
QUnit.test("BCP 2070126588: binding to nested 0..1 navigation property", function (assert) {
    var sView = "<FlexBox id=\"objectPage\" binding=\"{path : '/SalesOrderLineItemSet(SalesOrderID=\\'0500000005\\',ItemPosition=\\'0000000010\\')',parameters : {expand : 'ToProduct,ToProduct/ToSupplier',\tselect : 'SalesOrderID,ItemPosition,ToProduct/ProductID,ToProduct/ToSupplier/BusinessPartnerID'}}\">\t<Text id=\"salesOrderID\" text=\"{SalesOrderID}\" />\t<Text id=\"itemPosition\" text=\"{ItemPosition}\" />\t<FlexBox binding=\"{path : 'ToProduct', parameters : {expand : 'ToSupplier',\t\t\tselect : 'ProductID,ToSupplier/BusinessPartnerID'}}\">\t\t<Text id=\"productID\" text=\"{ProductID}\" />\t\t<FlexBox binding=\"{path : 'ToSupplier', parameters : {select : 'BusinessPartnerID'}}\">\t\t\t<Text id=\"businessPartnerID\" text=\"{BusinessPartnerID}\" />\t\t</FlexBox>\t</FlexBox></FlexBox>", that = this;
    this.expectHeadRequest().expectRequest("SalesOrderLineItemSet" + "(SalesOrderID='0500000005',ItemPosition='0000000010')" + "?$expand=ToProduct%2cToProduct%2fToSupplier" + "&$select=SalesOrderID%2cItemPosition%2cToProduct%2fProductID" + "%2cToProduct%2fToSupplier%2fBusinessPartnerID", {
        SalesOrderID: "0500000005",
        ItemPosition: "0000000010",
        ToProduct: {
            __metadata: {
                uri: "/sap/opu/odata/sap/GWSAMPLE_BASIC/ProductSet('HT-1500')"
            },
            ProductID: "HT-1500",
            ToSupplier: {
                __metadata: {
                    uri: "/sap/opu/odata/sap/GWSAMPLE_BASIC" + "/BusinessPartnerSet('0100000069')"
                },
                BusinessPartnerID: "0100000069"
            }
        }
    }).expectValue("salesOrderID", "0500000005").expectValue("itemPosition", "0000000010").expectValue("productID", "HT-1500").expectValue("businessPartnerID", "0100000069");
    return this.createView(assert, sView).then(function () {
        return that.waitForChanges(assert);
    });
});
["", undefined].forEach(function (sTarget) {
    [MessageScope.BusinessObject, MessageScope.RequestedObjects].forEach(function (sMessageScope) {
        var sTitle = "Messages: unbound transition messages; target = '" + sTarget + "'; scope = " + sMessageScope;
        QUnit.test(sTitle, function (assert) {
            var bIsBusinessObject = sMessageScope === MessageScope.BusinessObject, oErrorWithoutTarget = this.createResponseMessage(sTarget, undefined, undefined, true), bHasTarget = sTarget !== undefined || !bIsBusinessObject, sExpectedTarget = bHasTarget ? "/SalesOrderSet('1')" : "", oModel = createSalesOrdersModelMessageScope(), sView = "<FlexBox binding=\"{/SalesOrderSet('1')}\">\t<Input id=\"note\" value=\"{Note}\" /></FlexBox>";
            this.expectHeadRequest(bIsBusinessObject ? { "sap-message-scope": "BusinessObject" } : {}).expectRequest({
                deepPath: "/SalesOrderSet('1')",
                headers: bIsBusinessObject ? { "sap-message-scope": "BusinessObject" } : {},
                requestUri: "SalesOrderSet('1')"
            }, {
                SalesOrderID: "1",
                Note: "Foo"
            }, {
                "sap-message": getMessageHeader(oErrorWithoutTarget)
            }).expectValue("note", "Foo").expectMessages([{
                    code: "code-0",
                    fullTarget: sExpectedTarget,
                    message: "message-0",
                    persistent: true,
                    target: sExpectedTarget,
                    type: MessageType.Error
                }]);
            oModel.setMessageScope(sMessageScope);
            return this.createView(assert, sView, oModel);
        });
    });
});
QUnit.test("BCP 2070060665: Ignore __metadata while updating the changed entities", function (assert) {
    var oModel = createSalesOrdersModel({ refreshAfterChange: false }), sView = "<FlexBox binding=\"{/SalesOrderSet('1')}\">\t<Input id=\"note\" value=\"{Note}\" /></FlexBox>", that = this;
    this.expectHeadRequest().expectRequest({
        deepPath: "/SalesOrderSet('1')",
        requestUri: "SalesOrderSet('1')"
    }, {
        __metadata: {
            etag: "W/\"2020-05-19T08:08:58.312Z\"",
            uri: "SalesOrderSet('1')"
        },
        Note: "Foo",
        SalesOrderID: "1"
    }).expectValue("note", "Foo");
    return this.createView(assert, sView, oModel).then(function () {
        that.expectRequest({
            data: {
                __metadata: {
                    etag: "W/\"2020-05-19T08:08:58.312Z\"",
                    uri: "SalesOrderSet('1')"
                },
                Note: "Bar"
            },
            deepPath: "/SalesOrderSet('1')",
            headers: {
                "If-Match": "W/\"2020-05-19T08:08:58.312Z\""
            },
            key: "SalesOrderSet('1')",
            method: "MERGE",
            requestUri: "SalesOrderSet('1')"
        }, {
            data: {
                __metadata: {
                    etag: "W/\"2020-05-19T08:09:00.146Z\"",
                    uri: "SalesOrderSet('1')"
                },
                Note: "Bar",
                SalesOrderID: "1"
            },
            headers: { etag: "W/\"2020-05-19T08:09:00.146Z\"" },
            statusCode: 200
        }).expectValue("note", "Bar");
        oModel.setProperty("/SalesOrderSet('1')/Note", "Bar");
        oModel.submitChanges();
        return that.waitForChanges(assert);
    }).then(function () {
        assert.deepEqual(oModel.getPendingChanges(), {});
    });
});
QUnit.test("BCP 2080271261: Use latest ETag when sending a request", function (assert) {
    var oModel = createSalesOrdersModel({ refreshAfterChange: false }), sView = "<FlexBox binding=\"{/SalesOrderSet('1')}\">\t<Input id=\"note\" value=\"{Note}\" /></FlexBox>", that = this;
    this.expectHeadRequest().expectRequest({
        deepPath: "/SalesOrderSet('1')",
        requestUri: "SalesOrderSet('1')"
    }, {
        __metadata: {
            etag: "InitialETag",
            uri: "SalesOrderSet('1')"
        },
        Note: "Foo",
        SalesOrderID: "1"
    }).expectValue("note", "Foo");
    return this.createView(assert, sView, oModel).then(function () {
        that.expectRequest({
            data: {
                __metadata: {
                    etag: "InitialETag",
                    uri: "SalesOrderSet('1')"
                },
                Note: "Bar"
            },
            deepPath: "/SalesOrderSet('1')",
            headers: {
                "If-Match": "InitialETag"
            },
            key: "SalesOrderSet('1')",
            method: "MERGE",
            requestUri: "SalesOrderSet('1')"
        }, NO_CONTENT, {
            etag: "ETagAfter1stModification"
        }).expectValue("note", "Bar");
        oModel.setProperty("/SalesOrderSet('1')/Note", "Bar");
        oModel.submitChanges();
        that.expectValue("note", "Baz");
        oModel.setProperty("/SalesOrderSet('1')/Note", "Baz");
        return that.waitForChanges(assert);
    }).then(function () {
        that.expectRequest({
            data: {
                __metadata: {
                    etag: "ETagAfter1stModification",
                    uri: "SalesOrderSet('1')"
                },
                Note: "Baz"
            },
            deepPath: "/SalesOrderSet('1')",
            headers: {
                "If-Match": "ETagAfter1stModification"
            },
            key: "SalesOrderSet('1')",
            method: "MERGE",
            requestUri: "SalesOrderSet('1')"
        }, NO_CONTENT, {
            etag: "ETagAfter2ndModification"
        });
        oModel.submitChanges();
        return that.waitForChanges(assert);
    }).then(function () {
        assert.strictEqual(oModel.getObject("/SalesOrderSet('1')").__metadata.etag, "ETagAfter2ndModification");
    });
});
[MessageScope.BusinessObject, MessageScope.RequestedObjects].forEach(function (sMessageScope) {
    var sTitle = "BCP 2070222122: cleanup child messages for #remove, scope: " + sMessageScope;
    QUnit.test(sTitle, function (assert) {
        var oModel = createSalesOrdersModelMessageScope(), oSalesOrderNoteError = this.createResponseMessage("Note"), oSalesOrderToItem10ToProductPriceError = this.createResponseMessage("ToLineItems(SalesOrderID='1',ItemPosition='10')/ToProduct/Price"), oSalesOrderItem10ToProductPriceError = cloneODataMessage(oSalesOrderToItem10ToProductPriceError, "(SalesOrderID='1',ItemPosition='10')/ToProduct/Price"), sView = "<FlexBox binding=\"{/SalesOrderSet('1')}\">\t<Text id=\"salesOrderID\" text=\"{SalesOrderID}\" /></FlexBox>", bWithMessageScope = sMessageScope === MessageScope.BusinessObject, that = this;
        this.expectHeadRequest(bWithMessageScope ? { "sap-message-scope": "BusinessObject" } : {}).expectRequest({
            batchNo: 1,
            deepPath: "/SalesOrderSet('1')",
            headers: bWithMessageScope ? { "sap-message-scope": "BusinessObject" } : {},
            requestUri: "SalesOrderSet('1')"
        }, {
            __metadata: { uri: "SalesOrderSet('1')" },
            SalesOrderID: "1"
        }, {
            "sap-message": getMessageHeader([
                oSalesOrderNoteError,
                oSalesOrderToItem10ToProductPriceError
            ])
        }).expectValue("salesOrderID", "1").expectMessage(oSalesOrderNoteError, "/SalesOrderSet('1')/").expectMessage(oSalesOrderItem10ToProductPriceError, "/SalesOrderLineItemSet", "/SalesOrderSet('1')/ToLineItems");
        oModel.setMessageScope(sMessageScope);
        return this.createView(assert, sView, oModel).then(function () {
            that.expectRequest({
                batchNo: 2,
                deepPath: "/SalesOrderSet('1')",
                headers: bWithMessageScope ? { "sap-message-scope": "BusinessObject" } : {},
                method: "DELETE",
                requestUri: "SalesOrderSet('1')"
            }, {}).expectValue("salesOrderID", "").expectMessages([]);
            if (!bWithMessageScope) {
                that.expectMessage(oSalesOrderItem10ToProductPriceError, "/SalesOrderLineItemSet", "/SalesOrderSet('1')/ToLineItems");
            }
            oModel.remove("/SalesOrderSet('1')");
            oModel.submitChanges();
            return that.waitForChanges(assert);
        });
    });
});
QUnit.test("Messages with multiple targets: value state and lifecycle", function (assert) {
    var oMsgNoteAndGrossAmount = this.createResponseMessage(["Note", "GrossAmount"], "Foo", "warning"), oMsgGrossAmountAndLifecycleStatus = this.createResponseMessage(["Note", "LifecycleStatusDescription"], "Bar", "error"), that = this, sView = "<FlexBox id=\"objectPage\" binding=\"{/SalesOrderSet('1')}\">\t<Input id=\"Note\" value=\"{Note}\" />\t<Input id=\"GrossAmount\" value=\"{GrossAmount}\" />\t<Input id=\"LifecycleStatusDescription\" value=\"{LifecycleStatusDescription}\" /></FlexBox>";
    this.expectHeadRequest().expectRequest("SalesOrderSet('1')", {
        GrossAmount: "GrossAmount A",
        LifecycleStatusDescription: "LifecycleStatusDescription A",
        Note: "Note A"
    }, { "sap-message": getMessageHeader(oMsgNoteAndGrossAmount) }).expectValue("Note", "Note A").expectValue("GrossAmount", "GrossAmount A").expectValue("LifecycleStatusDescription", "LifecycleStatusDescription A").expectMessage(oMsgNoteAndGrossAmount, "/SalesOrderSet('1')/");
    return this.createView(assert, sView).then(function () {
        return Promise.all([
            that.checkValueState(assert, "Note", "Warning", "Foo"),
            that.checkValueState(assert, "GrossAmount", "Warning", "Foo"),
            that.checkValueState(assert, "LifecycleStatusDescription", "None", ""),
            that.waitForChanges(assert)
        ]);
    }).then(function () {
        that.expectRequest("SalesOrderSet('1')", {
            GrossAmount: "GrossAmount A",
            LifecycleStatusDescription: "LifecycleStatusDescription A",
            Note: "Note A"
        }, { "sap-message": getMessageHeader(oMsgGrossAmountAndLifecycleStatus) }).expectMessage(oMsgGrossAmountAndLifecycleStatus, "/SalesOrderSet('1')/", undefined, true);
        that.oView.byId("objectPage").getObjectBinding().refresh();
        return that.waitForChanges(assert);
    }).then(function () {
        return Promise.all([
            that.checkValueState(assert, "Note", "Error", "Bar"),
            that.checkValueState(assert, "GrossAmount", "None", ""),
            that.checkValueState(assert, "LifecycleStatusDescription", "Error", "Bar")
        ]);
    });
});
[
    { functionName: "allUserAssignmentsGET", method: "GET" },
    { functionName: "allUserAssignmentsPOST", method: "POST" }
].forEach(function (oFixture) {
    var sTitle = "ODataModel#callFunction: bind result ($result) to a list, using method " + oFixture.method + " " + oFixture.functionName;
    QUnit.test(sTitle, function (assert) {
        var oFunctionHandle, fnResolve, oModel = createSpecialCasesModel({ tokenHandling: false }), oRequestPromise = new Promise(function (resolve) {
            fnResolve = resolve;
        }), sView = "<t:Table id=\"table\" rows=\"{path : '$result', templateShareable : true}\" visibleRowCount=\"2\">\t<Text id=\"userId\" text=\"{UserId}\" /></t:Table>", that = this;
        this.expectValue("userId", ["", ""]);
        return this.createView(assert, sView, oModel).then(function () {
            that.expectRequest({
                "deepPath": "/" + oFixture.functionName,
                "headers": {},
                "method": oFixture.method,
                "requestUri": oFixture.functionName
            }, oRequestPromise);
            oFunctionHandle = oModel.callFunction("/" + oFixture.functionName, { method: oFixture.method });
            return oFunctionHandle.contextCreated();
        }).then(function (oContext) {
            var oTable = that.oView.byId("table"), oResponse = {
                statusCode: 200,
                data: {
                    results: [{
                            __metadata: { uri: "UserAssignments('User1')" },
                            UserId: "User1"
                        }, {
                            __metadata: { uri: "UserAssignments('User2')" },
                            UserId: "User2"
                        }]
                }
            };
            that.oLogMock.expects("error").withExactArgs(sinon.match(function (sError) {
                return sError.startsWith("List Binding is not bound against a list for " + "/allUserAssignments");
            }));
            oTable.setBindingContext(oContext);
            that.expectValue("userId", ["User1", "User2"]);
            fnResolve(oResponse);
            return Promise.all([
                oRequestPromise,
                that.waitForChanges(assert)
            ]);
        });
    });
});
QUnit.test("Messages: function import for relative list entry; w/ location", function (assert) {
    var oModel = createSalesOrdersModelMessageScope(), oNoteError = this.createResponseMessage("('1')/Note"), oToItem10NoteError = this.createResponseMessage("('1')/ToLineItems(SalesOrderID='1',ItemPosition='10')/Note"), oItem10NoteError = cloneODataMessage(oToItem10NoteError, "(SalesOrderID='1',ItemPosition='10')/Note"), sView = "<FlexBox binding=\"{/BusinessPartnerSet('100')}\">\t<Table items=\"{ToSalesOrders}\">\t\t<Text id=\"soID\" text=\"{SalesOrderID}\" />\t</Table></FlexBox>", that = this;
    this.expectHeadRequest({ "sap-message-scope": "BusinessObject" }).expectRequest({
        deepPath: "/BusinessPartnerSet('100')",
        headers: { "sap-message-scope": "BusinessObject" },
        requestUri: "BusinessPartnerSet('100')"
    }, {
        __metadata: { uri: "BusinessPartnerSet('100')" }
    }).expectRequest({
        deepPath: "/BusinessPartnerSet('100')/ToSalesOrders",
        headers: { "sap-message-scope": "BusinessObject" },
        requestUri: "BusinessPartnerSet('100')/ToSalesOrders?$skip=0&$top=100"
    }, {
        results: [{
                __metadata: { uri: "SalesOrderSet('1')" },
                SalesOrderID: "1"
            }]
    }, { "sap-message": getMessageHeader([oNoteError, oToItem10NoteError]) }).expectMessage(oNoteError, "/SalesOrderSet", "/BusinessPartnerSet('100')/ToSalesOrders").expectMessage(oItem10NoteError, "/SalesOrderLineItemSet", "/BusinessPartnerSet('100')/ToSalesOrders('1')/ToLineItems").expectValue("soID", ["1"]);
    oModel.setMessageScope(MessageScope.BusinessObject);
    return this.createView(assert, sView, oModel).then(function () {
        var oPromise, oGrossAmountError = that.createResponseMessage("GrossAmount"), oToItem20QuantityError = that.createResponseMessage("ToLineItems(SalesOrderID='1',ItemPosition='20')/Quantity"), oItem20QuantityError = cloneODataMessage(oToItem20QuantityError, "(SalesOrderID='1',ItemPosition='20')/Quantity");
        that.expectRequest({
            deepPath: "/SalesOrder_Confirm",
            encodeRequestUri: false,
            headers: { "sap-message-scope": "BusinessObject" },
            method: "POST",
            requestUri: "SalesOrder_Confirm?SalesOrderID='1'"
        }, {
            __metadata: { uri: "SalesOrderSet('1')" },
            SalesOrderID: "1"
        }, {
            location: "/SalesOrderSrv/SalesOrderSet('1')",
            "sap-message": getMessageHeader([oGrossAmountError, oToItem20QuantityError])
        }).expectMessage(oGrossAmountError, "/SalesOrderSet('1')/", "/BusinessPartnerSet('100')/ToSalesOrders('1')/", true).expectMessage(oItem20QuantityError, "/SalesOrderLineItemSet", "/BusinessPartnerSet('100')/ToSalesOrders('1')/ToLineItems");
        oPromise = oModel.callFunction("/SalesOrder_Confirm", {
            method: "POST",
            refreshAfterChange: false,
            urlParameters: {
                SalesOrderID: "1"
            }
        });
        return Promise.all([
            oPromise.contextCreated(),
            that.waitForChanges(assert)
        ]);
    });
});
QUnit.test("Messages: function import for relative list entry; no location", function (assert) {
    var oModel = createSalesOrdersModelMessageScope(), oNoteError = this.createResponseMessage("('1')/Note"), oToItem10NoteError = this.createResponseMessage("('1')/ToLineItems(SalesOrderID='1',ItemPosition='10')/Note"), oItem10NoteError = cloneODataMessage(oToItem10NoteError, "(SalesOrderID='1',ItemPosition='10')/Note"), sView = "<FlexBox binding=\"{/BusinessPartnerSet('100')}\">\t<Table items=\"{ToSalesOrders}\">\t\t<Text id=\"soID\" text=\"{SalesOrderID}\" />\t</Table></FlexBox>", that = this;
    this.expectHeadRequest({ "sap-message-scope": "BusinessObject" }).expectRequest({
        deepPath: "/BusinessPartnerSet('100')",
        headers: { "sap-message-scope": "BusinessObject" },
        requestUri: "BusinessPartnerSet('100')"
    }, {
        __metadata: { uri: "BusinessPartnerSet('100')" }
    }).expectRequest({
        deepPath: "/BusinessPartnerSet('100')/ToSalesOrders",
        headers: { "sap-message-scope": "BusinessObject" },
        requestUri: "BusinessPartnerSet('100')/ToSalesOrders?$skip=0&$top=100"
    }, {
        results: [{
                __metadata: { uri: "SalesOrderSet('1')" },
                SalesOrderID: "1"
            }]
    }, { "sap-message": getMessageHeader([oNoteError, oToItem10NoteError]) }).expectMessage(oNoteError, "/SalesOrderSet", "/BusinessPartnerSet('100')/ToSalesOrders").expectMessage(oItem10NoteError, "/SalesOrderLineItemSet", "/BusinessPartnerSet('100')/ToSalesOrders('1')/ToLineItems").expectValue("soID", ["1"]);
    oModel.setMessageScope(MessageScope.BusinessObject);
    return this.createView(assert, sView, oModel).then(function () {
        var oPromise, oGrossAmountError = that.createResponseMessage("GrossAmount"), oToItem20QuantityError = that.createResponseMessage("ToLineItems(SalesOrderID='1',ItemPosition='20')/Quantity"), oItem20QuantityError = cloneODataMessage(oToItem20QuantityError, "(SalesOrderID='1',ItemPosition='20')/Quantity");
        that.expectRequest({
            deepPath: "/SalesOrder_Confirm",
            encodeRequestUri: false,
            headers: { "sap-message-scope": "BusinessObject" },
            method: "POST",
            requestUri: "SalesOrder_Confirm?SalesOrderID='1'"
        }, {
            __metadata: { uri: "SalesOrderSet('1')" },
            SalesOrderID: "1"
        }, {
            "sap-message": getMessageHeader([oGrossAmountError, oToItem20QuantityError])
        }).expectMessage(oGrossAmountError, "/SalesOrderSet('1')/", undefined, true).expectMessage(oItem20QuantityError, "/SalesOrderLineItemSet", "/SalesOrderSet('1')/ToLineItems").expectMessage(oItem10NoteError, "/SalesOrderLineItemSet", "/BusinessPartnerSet('100')/ToSalesOrders('1')/ToLineItems");
        oPromise = oModel.callFunction("/SalesOrder_Confirm", {
            method: "POST",
            refreshAfterChange: false,
            urlParameters: {
                SalesOrderID: "1"
            }
        });
        return Promise.all([
            oPromise.contextCreated(),
            that.waitForChanges(assert)
        ]);
    });
});
[false, true].forEach(function (bMultipleOccurrences) {
    var sTitle = "Messages: function import for a navigation property; bMultipleOccurrences = " + bMultipleOccurrences;
    QUnit.test(sTitle, function (assert) {
        var oModel = createSalesOrdersModelMessageScope(), oToBPCompanyNameError = this.createResponseMessage("ToBusinessPartner/CompanyName"), oCompanyNameError = cloneODataMessage(oToBPCompanyNameError, "CompanyName"), oToProductADescriptionError = this.createResponseMessage("ToBusinessPartner/ToProducts('A')/Description"), oProductADescriptionError = cloneODataMessage(oToProductADescriptionError, "('A')/Description"), sFlexBox = "<FlexBox binding=\"{path : 'ToBusinessPartner', parameters : {select : 'BusinessPartnerID'}}\">\t<Text id=\"bpID0\" text=\"{BusinessPartnerID}\" /></FlexBox>\t\t\t", sView = "<FlexBox binding=\"{path : '/SalesOrderSet(\\'1\\')', parameters : {\texpand : 'ToBusinessPartner', select : 'ToBusinessPartner/BusinessPartnerID'}}\">" + sFlexBox + (bMultipleOccurrences ? sFlexBox.replace("bpID0", "bpID1") : "") + "</FlexBox>", that = this;
        this.expectHeadRequest({ "sap-message-scope": "BusinessObject" }).expectRequest({
            deepPath: "/SalesOrderSet('1')",
            headers: { "sap-message-scope": "BusinessObject" },
            requestUri: "SalesOrderSet('1')?$expand=ToBusinessPartner" + "&$select=ToBusinessPartner%2fBusinessPartnerID"
        }, {
            __metadata: { uri: "SalesOrderSet('1')" },
            SalesOrderID: "1",
            ToBusinessPartner: {
                __metadata: { uri: "BusinessPartnerSet('100')" },
                BusinessPartnerID: "100"
            }
        }, {
            "sap-message": getMessageHeader([
                oToBPCompanyNameError,
                oToProductADescriptionError
            ])
        }).expectMessage(oCompanyNameError, "/BusinessPartnerSet('100')/", "/SalesOrderSet('1')/ToBusinessPartner/").expectMessage(oProductADescriptionError, "/ProductSet", "/SalesOrderSet('1')/ToBusinessPartner/ToProducts").expectValue("bpID0", "100");
        if (bMultipleOccurrences) {
            this.expectValue("bpID1", "100");
        }
        oModel.setMessageScope(MessageScope.BusinessObject);
        return this.createView(assert, sView, oModel).then(function () {
            var oPromise, oToProductBNameError = that.createResponseMessage("ToProducts('B')/Name"), oProductBNameError = cloneODataMessage(oToProductBNameError, "('B')/Name"), oWebAddressError = that.createResponseMessage("WebAddress");
            that.expectRequest({
                deepPath: "/BusinessPartner_Refresh",
                encodeRequestUri: false,
                headers: { "sap-message-scope": "BusinessObject" },
                method: "POST",
                requestUri: "BusinessPartner_Refresh?BusinessPartnerID='100'"
            }, {
                __metadata: { uri: "BusinessPartnerSet('100')" },
                BusinessPartnerID: "100"
            }, {
                location: "/SalesOrderSrv/BusinessPartnerSet('100')",
                "sap-message": getMessageHeader([oWebAddressError, oToProductBNameError])
            }).expectMessage(oWebAddressError, "/BusinessPartnerSet('100')/", "/SalesOrderSet('1')/ToBusinessPartner/", true).expectMessage(oProductBNameError, "/ProductSet", "/SalesOrderSet('1')/ToBusinessPartner/ToProducts");
            oPromise = oModel.callFunction("/BusinessPartner_Refresh", {
                method: "POST",
                refreshAfterChange: false,
                urlParameters: {
                    BusinessPartnerID: "100"
                }
            });
            return Promise.all([
                oPromise.contextCreated(),
                that.waitForChanges(assert)
            ]);
        });
    });
});
[false, true].forEach(function (bResultingEntityOnUI) {
    var sTitle = "Messages: function import returns different entity; bResultingEntityOnUI = " + bResultingEntityOnUI;
    QUnit.test(sTitle, function (assert) {
        var oModel = createSalesOrdersModelMessageScope(), oCompanyNameError = this.createResponseMessage("CompanyName"), oToProductADescriptionError = this.createResponseMessage("ToProducts('A')/Description"), oProductADescriptionError = cloneODataMessage(oToProductADescriptionError, "('A')/Description"), sView = "<FlexBox binding=\"{/SalesOrderSet('1')}\">\t<FlexBox binding=\"{ToBusinessPartner}\">\t\t<Text id=\"bpID0\" text=\"{BusinessPartnerID}\" />\t</FlexBox></FlexBox>" + (bResultingEntityOnUI ? "<FlexBox binding=\"{/ProductSet('Z')}\">\t\t<FlexBox binding=\"{ToSupplier}\">\t\t\t<Text id=\"bpID1\" text=\"{BusinessPartnerID}\" />\t\t</FlexBox>\t</FlexBox>" : ""), that = this;
        this.expectHeadRequest({ "sap-message-scope": "BusinessObject" }).expectRequest({
            deepPath: "/SalesOrderSet('1')",
            headers: { "sap-message-scope": "BusinessObject" },
            requestUri: "SalesOrderSet('1')"
        }, {
            __metadata: { uri: "SalesOrderSet('1')" },
            SalesOrderID: "1"
        }).expectRequest({
            deepPath: "/SalesOrderSet('1')/ToBusinessPartner",
            headers: { "sap-message-scope": "BusinessObject" },
            requestUri: "SalesOrderSet('1')/ToBusinessPartner"
        }, {
            __metadata: { uri: "BusinessPartnerSet('100')" },
            BusinessPartnerID: "100"
        }, { "sap-message": getMessageHeader([oCompanyNameError, oToProductADescriptionError]) }).expectMessage(oCompanyNameError, "/BusinessPartnerSet('100')/", "/SalesOrderSet('1')/ToBusinessPartner/").expectMessage(oProductADescriptionError, "/ProductSet", "/SalesOrderSet('1')/ToBusinessPartner/ToProducts").expectValue("bpID0", "100");
        if (bResultingEntityOnUI) {
            this.expectRequest({
                deepPath: "/ProductSet('Z')",
                headers: { "sap-message-scope": "BusinessObject" },
                requestUri: "ProductSet('Z')"
            }, {
                __metadata: { uri: "ProductSet('Z')" },
                ProductID: "Z"
            }).expectRequest({
                deepPath: "/ProductSet('Z')/ToSupplier",
                headers: { "sap-message-scope": "BusinessObject" },
                requestUri: "ProductSet('Z')/ToSupplier"
            }, {
                __metadata: { uri: "BusinessPartnerSet('200')" },
                BusinessPartnerID: "200"
            }).expectValue("bpID1", "200");
        }
        oModel.setMessageScope(MessageScope.BusinessObject);
        return this.createView(assert, sView, oModel).then(function () {
            var oPromise, oToProductBNameError = that.createResponseMessage("ToProducts('B')/Name"), oProductBNameError = cloneODataMessage(oToProductBNameError, "('B')/Name"), oWebAddressError = that.createResponseMessage("WebAddress");
            that.expectRequest({
                deepPath: "/BusinessPartner_Refresh",
                encodeRequestUri: false,
                headers: { "sap-message-scope": "BusinessObject" },
                method: "POST",
                requestUri: "BusinessPartner_Refresh?BusinessPartnerID='100'"
            }, {
                __metadata: { uri: "BusinessPartnerSet('200')" },
                BusinessPartnerID: "200"
            }, {
                location: "/SalesOrderSrv/BusinessPartnerSet('200')",
                "sap-message": getMessageHeader([oWebAddressError, oToProductBNameError])
            }).expectMessage(oWebAddressError, "/BusinessPartnerSet('200')/").expectMessage(oProductBNameError, "/ProductSet", "/BusinessPartnerSet('200')/ToProducts");
            oPromise = oModel.callFunction("/BusinessPartner_Refresh", {
                method: "POST",
                refreshAfterChange: false,
                urlParameters: {
                    BusinessPartnerID: "100"
                }
            });
            return Promise.all([
                oPromise.contextCreated(),
                that.waitForChanges(assert)
            ]);
        });
    });
});
QUnit.test("Messages: function import with same entity twice on UI", function (assert) {
    var oModel = createSalesOrdersModelMessageScope(), oCompanyNameError = this.createResponseMessage("CompanyName"), oToProductADescriptionError = this.createResponseMessage("ToProducts('A')/Description"), oProductADescriptionError = cloneODataMessage(oToProductADescriptionError, "('A')/Description"), sView = "<FlexBox binding=\"{/SalesOrderSet('1')}\">\t<FlexBox binding=\"{ToBusinessPartner}\">\t\t<Text id=\"bpID0\" text=\"{BusinessPartnerID}\" />\t</FlexBox></FlexBox><FlexBox binding=\"{/ProductSet('Z')}\">\t<FlexBox binding=\"{ToSupplier}\">\t\t<Text id=\"bpID1\" text=\"{BusinessPartnerID}\" />\t</FlexBox></FlexBox>", that = this;
    this.expectHeadRequest({ "sap-message-scope": "BusinessObject" }).expectRequest({
        deepPath: "/SalesOrderSet('1')",
        headers: { "sap-message-scope": "BusinessObject" },
        requestUri: "SalesOrderSet('1')"
    }, {
        __metadata: { uri: "SalesOrderSet('1')" },
        SalesOrderID: "1"
    }).expectRequest({
        deepPath: "/SalesOrderSet('1')/ToBusinessPartner",
        headers: { "sap-message-scope": "BusinessObject" },
        requestUri: "SalesOrderSet('1')/ToBusinessPartner"
    }, {
        __metadata: { uri: "BusinessPartnerSet('100')" },
        BusinessPartnerID: "100"
    }, { "sap-message": getMessageHeader([oCompanyNameError, oToProductADescriptionError]) }).expectValue("bpID0", "100").expectRequest({
        deepPath: "/ProductSet('Z')",
        headers: { "sap-message-scope": "BusinessObject" },
        requestUri: "ProductSet('Z')"
    }, {
        __metadata: { uri: "ProductSet('Z')" },
        ProductID: "Z"
    }).expectRequest({
        deepPath: "/ProductSet('Z')/ToSupplier",
        headers: { "sap-message-scope": "BusinessObject" },
        requestUri: "ProductSet('Z')/ToSupplier"
    }, {
        __metadata: { uri: "BusinessPartnerSet('100')" },
        BusinessPartnerID: "100"
    }, { "sap-message": getMessageHeader([oCompanyNameError, oToProductADescriptionError]) }).expectMessage(oCompanyNameError, "/BusinessPartnerSet('100')/", "/ProductSet('Z')/ToSupplier/").expectMessage(oProductADescriptionError, "/ProductSet", "/ProductSet('Z')/ToSupplier/ToProducts").expectValue("bpID1", "100");
    oModel.setMessageScope(MessageScope.BusinessObject);
    return this.createView(assert, sView, oModel).then(function () {
        var oPromise, oToProductBNameError = that.createResponseMessage("ToProducts('B')/Name"), oProductBNameError = cloneODataMessage(oToProductBNameError, "('B')/Name"), oWebAddressError = that.createResponseMessage("WebAddress");
        that.expectRequest({
            deepPath: "/BusinessPartner_Refresh",
            encodeRequestUri: false,
            headers: { "sap-message-scope": "BusinessObject" },
            method: "POST",
            requestUri: "BusinessPartner_Refresh?BusinessPartnerID='100'"
        }, {
            __metadata: { uri: "BusinessPartnerSet('100')" },
            BusinessPartnerID: "100"
        }, {
            location: "/SalesOrderSrv/BusinessPartnerSet('100')",
            "sap-message": getMessageHeader([oWebAddressError, oToProductBNameError])
        }).expectMessage(oProductADescriptionError, "/ProductSet", "/ProductSet('Z')/ToSupplier/ToProducts", true).expectMessage(oWebAddressError, "/BusinessPartnerSet('100')/").expectMessage(oProductBNameError, "/ProductSet", "/BusinessPartnerSet('100')/ToProducts");
        oPromise = oModel.callFunction("/BusinessPartner_Refresh", {
            method: "POST",
            refreshAfterChange: false,
            urlParameters: {
                BusinessPartnerID: "100"
            }
        });
        return Promise.all([
            oPromise.contextCreated(),
            that.waitForChanges(assert)
        ]);
    });
});
[
    { method: "GET", functionName: "/SalesOrder_Confirm_GET" },
    { method: "POST", functionName: "/SalesOrder_Confirm" }
].forEach(function (oFixture) {
    var sTitle = "Messages: function import with lazy parameter determination, method=" + oFixture.method;
    QUnit.test(sTitle, function (assert) {
        var oModel = createSalesOrdersModelMessageScope({
            defaultBindingMode: "TwoWay",
            tokenHandling: false
        }), sView = "<FlexBox binding=\"{/BusinessPartnerSet('100')}\">\t<Table items=\"{ToSalesOrders}\">\t\t<Text id=\"soID\" text=\"{SalesOrderID}\" />\t</Table></FlexBox><FlexBox id=\"form\">\t<Input id=\"soIDParameter\" value=\"{SalesOrderID}\" /></FlexBox>", that = this;
        this.expectRequest({
            deepPath: "/BusinessPartnerSet('100')",
            headers: { "sap-message-scope": "BusinessObject" },
            requestUri: "BusinessPartnerSet('100')"
        }, {
            __metadata: { uri: "BusinessPartnerSet('100')" }
        }).expectRequest({
            deepPath: "/BusinessPartnerSet('100')/ToSalesOrders",
            headers: { "sap-message-scope": "BusinessObject" },
            requestUri: "BusinessPartnerSet('100')/ToSalesOrders?$skip=0&$top=100"
        }, {
            results: [{
                    __metadata: { uri: "SalesOrderSet('42')" },
                    SalesOrderID: "42"
                }]
        }).expectValue("soID", ["42"]);
        oModel.setMessageScope(MessageScope.BusinessObject);
        return Promise.all([
            oModel.callFunction(oFixture.functionName, {
                groupId: "changes",
                method: oFixture.method,
                refreshAfterChange: false,
                urlParameters: {
                    SalesOrderID: "1"
                }
            }).contextCreated(),
            this.createView(assert, sView, oModel)
        ]).then(function (aResults) {
            var oRequest = {
                deepPath: oFixture.functionName,
                encodeRequestUri: false,
                headers: { "sap-message-scope": "BusinessObject" },
                method: oFixture.method,
                requestUri: oFixture.functionName.slice(1) + "?SalesOrderID='42'"
            }, oWebAddressError = that.createResponseMessage("WebAddress");
            if (oFixture.method === "POST") {
                oRequest.data = undefined;
            }
            that.expectRequest(oRequest, {
                __metadata: { uri: "SalesOrderSet('42')" },
                SalesOrderID: "42"
            }, {
                location: "/SalesOrderSrv/SalesOrderSet('42')",
                "sap-message": getMessageHeader(oWebAddressError)
            }).expectMessage(oWebAddressError, "/SalesOrderSet('42')/", "/BusinessPartnerSet('100')/ToSalesOrders('42')/");
            that.oView.byId("form").setBindingContext(aResults[0]);
            that.oView.byId("soIDParameter").setValue("42");
            oModel.submitChanges({ groupId: "changes" });
            return that.waitForChanges(assert);
        }).then(function () {
            assert.strictEqual(oModel.hasPendingChanges(true), false);
        });
    });
});
QUnit.test("Messages: function import with expand and lazy parameters", function (assert) {
    var oModel = createSalesOrdersModelMessageScope({
        defaultBindingMode: "TwoWay",
        tokenHandling: false
    }), sView = "<FlexBox id=\"form\">\t<Input id=\"soIDParameter\" value=\"{SalesOrderID}\" /></FlexBox>", that = this;
    oModel.setMessageScope(MessageScope.BusinessObject);
    return Promise.all([
        oModel.callFunction("/SalesOrder_Confirm", {
            expand: "ToLineItems",
            groupId: "changes",
            method: "POST",
            refreshAfterChange: false,
            urlParameters: {
                SalesOrderID: "1"
            }
        }).contextCreated(),
        this.createView(assert, sView, oModel)
    ]).then(function (aResults) {
        var oWebAddressError = that.createResponseMessage("WebAddress");
        that.expectRequest({
            batchNo: 1,
            data: undefined,
            deepPath: "/SalesOrder_Confirm",
            encodeRequestUri: false,
            headers: {
                "Content-ID": "~key~",
                "sap-message-scope": "BusinessObject",
                "sap-messages": "transientOnly"
            },
            method: "POST",
            requestUri: "SalesOrder_Confirm?SalesOrderID='42'"
        }, {
            __metadata: { uri: "SalesOrderSet('42')" },
            SalesOrderID: "42"
        }, {
            location: "/SalesOrderSrv/SalesOrderSet('42')"
        }).expectRequest({
            batchNo: 1,
            deepPath: "/$~key~",
            headers: { "sap-message-scope": "BusinessObject" },
            requestUri: "$~key~?$expand=ToLineItems&$select=ToLineItems"
        }, {
            __metadata: { uri: "SalesOrderSet('42')" },
            ToLineItems: {
                results: [{
                        __metadata: {
                            uri: "SalesOrderLineItemSet(SalesOrderID='42',ItemPosition='10')"
                        },
                        ItemPosition: "10",
                        Note: "ItemNote",
                        SalesOrderID: "42"
                    }]
            }
        }, {
            "sap-message": getMessageHeader(oWebAddressError)
        }).expectMessage(oWebAddressError, "/SalesOrderSet('42')/");
        that.oView.byId("form").setBindingContext(aResults[0]);
        that.oView.byId("soIDParameter").setValue("42");
        oModel.submitChanges({ groupId: "changes" });
        return that.waitForChanges(assert);
    });
});
QUnit.test("Messages: function import with callback function", function (assert) {
    var oModel = createSalesOrdersModelMessageScope(), sView = "<FlexBox binding=\"{/SalesOrderSet('1')}\">\t<Table items=\"{path : 'ToLineItems', parameters : {transitionMessagesOnly : true}}\">\t\t<Text id=\"note\" text=\"{Note}\" />\t</Table></FlexBox>", that = this;
    this.expectHeadRequest({ "sap-message-scope": "BusinessObject" }).expectRequest({
        deepPath: "/SalesOrderSet('1')",
        headers: { "sap-message-scope": "BusinessObject" },
        requestUri: "SalesOrderSet('1')"
    }, {
        __metadata: { uri: "SalesOrderSet('1')" },
        SalesOrderID: "1"
    }).expectRequest({
        deepPath: "/SalesOrderSet('1')/ToLineItems",
        headers: {
            "sap-message-scope": "BusinessObject",
            "sap-messages": "transientOnly"
        },
        requestUri: "SalesOrderSet('1')/ToLineItems?$skip=0&$top=100"
    }, {
        results: [{
                __metadata: {
                    uri: "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10')"
                },
                ItemPosition: "10",
                Note: "Foo",
                SalesOrderID: "1"
            }]
    }).expectValue("note", "Foo", 0);
    oModel.setMessageScope(MessageScope.BusinessObject);
    return this.createView(assert, sView, oModel).then(function () {
        var oNoteError = that.createResponseMessage("Note"), oPromise;
        that.expectRequest({
            deepPath: "/LineItem_Create",
            encodeRequestUri: false,
            headers: { "sap-message-scope": "BusinessObject" },
            method: "POST",
            requestUri: "LineItem_Create?SalesOrderID='1'"
        }, {
            __metadata: {
                uri: "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='20')"
            },
            ItemPosition: "20",
            Note: "Bar",
            SalesOrderID: "1"
        }, {
            location: "/SalesOrderSrv/" + "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='20')",
            "sap-message": getMessageHeader(oNoteError)
        }).expectRequest({
            deepPath: "/SalesOrderSet('1')/ToLineItems",
            headers: {
                "sap-message-scope": "BusinessObject",
                "sap-messages": "transientOnly"
            },
            requestUri: "SalesOrderSet('1')/ToLineItems?$skip=0&$top=100"
        }, {
            results: [{
                    __metadata: {
                        uri: "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10')"
                    },
                    ItemPosition: "10",
                    Note: "Foo",
                    SalesOrderID: "1"
                }, {
                    __metadata: {
                        uri: "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='20')"
                    },
                    ItemPosition: "20",
                    Note: "Bar",
                    SalesOrderID: "1"
                }]
        }).expectValue("note", "Bar", 1).expectMessage(oNoteError, "/SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='20')/", "/SalesOrderSet('1')/ToLineItems(SalesOrderID='1',ItemPosition='20')/");
        oPromise = oModel.callFunction("/LineItem_Create", {
            adjustDeepPath: function (mParameters) {
                assert.strictEqual(mParameters.deepPath, "/SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='20')");
                return "/SalesOrderSet('1')/ToLineItems(SalesOrderID='1',ItemPosition='20')";
            },
            method: "POST",
            urlParameters: {
                SalesOrderID: "1"
            }
        });
        return Promise.all([
            oPromise.contextCreated(),
            that.waitForChanges(assert)
        ]);
    });
});
QUnit.test("Messages: function import with callback function overrides calculated deepPath", function (assert) {
    var oModel = createSalesOrdersModelMessageScope(), oNoteError = this.createResponseMessage("('1')/Note"), oToItem10NoteError = this.createResponseMessage("('1')/ToLineItems(SalesOrderID='1',ItemPosition='10')/Note"), oItem10NoteError = cloneODataMessage(oToItem10NoteError, "(SalesOrderID='1',ItemPosition='10')/Note"), sView = "<FlexBox binding=\"{/BusinessPartnerSet('100')}\">\t<Table items=\"{ToSalesOrders}\">\t\t<Text id=\"soID\" text=\"{SalesOrderID}\" />\t</Table></FlexBox>", that = this;
    this.expectHeadRequest({ "sap-message-scope": "BusinessObject" }).expectRequest({
        deepPath: "/BusinessPartnerSet('100')",
        headers: { "sap-message-scope": "BusinessObject" },
        requestUri: "BusinessPartnerSet('100')"
    }, {
        __metadata: { uri: "BusinessPartnerSet('100')" }
    }).expectRequest({
        deepPath: "/BusinessPartnerSet('100')/ToSalesOrders",
        headers: { "sap-message-scope": "BusinessObject" },
        requestUri: "BusinessPartnerSet('100')/ToSalesOrders?$skip=0&$top=100"
    }, {
        results: [{
                __metadata: { uri: "SalesOrderSet('1')" },
                SalesOrderID: "1"
            }]
    }, { "sap-message": getMessageHeader([oNoteError, oToItem10NoteError]) }).expectMessage(oNoteError, "/SalesOrderSet", "/BusinessPartnerSet('100')/ToSalesOrders").expectMessage(oItem10NoteError, "/SalesOrderLineItemSet", "/BusinessPartnerSet('100')/ToSalesOrders('1')/ToLineItems").expectValue("soID", ["1"]);
    oModel.setMessageScope(MessageScope.BusinessObject);
    return this.createView(assert, sView, oModel).then(function () {
        var oGrossAmountError = that.createResponseMessage("GrossAmount"), oPromise, oToItem20QuantityError = that.createResponseMessage("ToLineItems(SalesOrderID='1',ItemPosition='20')/Quantity"), oItem20QuantityError = cloneODataMessage(oToItem20QuantityError, "(SalesOrderID='1',ItemPosition='20')/Quantity");
        that.expectRequest({
            deepPath: "/SalesOrder_Confirm",
            encodeRequestUri: false,
            headers: { "sap-message-scope": "BusinessObject" },
            method: "POST",
            requestUri: "SalesOrder_Confirm?SalesOrderID='1'"
        }, {
            __metadata: { uri: "SalesOrderSet('1')" },
            SalesOrderID: "1"
        }, {
            location: "/SalesOrderSrv/SalesOrderSet('1')",
            "sap-message": getMessageHeader([oGrossAmountError, oToItem20QuantityError])
        }).expectMessage(oGrossAmountError, "/SalesOrderSet('1')/", "/BusinessPartnerSet('200')/ToSalesOrders('1')/", true).expectMessage(oItem20QuantityError, "/SalesOrderLineItemSet", "/BusinessPartnerSet('200')/ToSalesOrders('1')/ToLineItems").expectMessage(oItem10NoteError, "/SalesOrderLineItemSet", "/BusinessPartnerSet('100')/ToSalesOrders('1')/ToLineItems");
        oPromise = oModel.callFunction("/SalesOrder_Confirm", {
            adjustDeepPath: function (mParameters) {
                assert.strictEqual(mParameters.deepPath, "/BusinessPartnerSet('100')/ToSalesOrders('1')");
                assert.strictEqual(mParameters.response.headers.location, "/SalesOrderSrv/SalesOrderSet('1')");
                return "/BusinessPartnerSet('200')/ToSalesOrders('1')";
            },
            method: "POST",
            refreshAfterChange: false,
            urlParameters: {
                SalesOrderID: "1"
            }
        });
        return Promise.all([
            oPromise.contextCreated(),
            that.waitForChanges(assert)
        ]);
    });
});
QUnit.test("ODataPropertyBindings and CompositeBindings: ignoreMessages", function (assert) {
    var oNoteWarning = this.createResponseMessage("Note", "Foo", "warning"), sView = "<FlexBox id=\"objectPage\" binding=\"{/SalesOrderSet('1')}\">\t<Input id=\"Note0\" value=\"{Note}\" />\t<Input id=\"Note1\" value=\"{path : 'Note', parameters : {ignoreMessages : false}}\" />\t<Input id=\"Note2\" value=\"{path : 'Note', parameters : {ignoreMessages : true}}\" />\t<Input id=\"Composite0\" value=\"{= ${SalesOrderID} + ${value : ' - '} + ${Note}}\" />\t<Input id=\"Composite1\" value=\"{= ${SalesOrderID} + ${value : ' - '} + ${\t\t\tpath : 'Note',\t\t\tparameters : {ignoreMessages : false}\t\t}}\" />\t<Input id=\"Composite2\" value=\"{= ${SalesOrderID} + ${value : ' - '} + ${\t\t\tpath : 'Note',\t\t\tparameters : {ignoreMessages : true}\t\t}}\" />\t<Input id=\"Composite3\" value=\"{parts : ['SalesOrderID', {value : '-'}, {\t\t\tpath : 'Note',\t\t\tparameters : {ignoreMessages : false}\t\t}]}\" />\t<Input id=\"Composite4\" value=\"{parts : ['SalesOrderID', {value : '-'}, {\t\t\tpath : 'Note',\t\t\tparameters : {ignoreMessages : true}\t\t}]}\" /></FlexBox>", that = this;
    this.expectHeadRequest().expectRequest("SalesOrderSet('1')", {
        Note: "Note",
        SalesOrderID: "1"
    }, { "sap-message": getMessageHeader(oNoteWarning) }).expectValue("Note0", "Note").expectValue("Note1", "Note").expectValue("Note2", "Note").expectValue("Composite0", "null - null").expectValue("Composite0", "1 - null").expectValue("Composite0", "1 - Note").expectValue("Composite1", "null - null").expectValue("Composite1", "1 - null").expectValue("Composite1", "1 - Note").expectValue("Composite2", "null - null").expectValue("Composite2", "1 - null").expectValue("Composite2", "1 - Note").expectValue("Composite3", " - ").expectValue("Composite3", "1 - ").expectValue("Composite3", "1 - Note").expectValue("Composite4", " - ").expectValue("Composite4", "1 - ").expectValue("Composite4", "1 - Note").expectMessage(oNoteWarning, "/SalesOrderSet('1')/");
    return this.createView(assert, sView).then(function () {
        return Promise.all([
            that.checkValueState(assert, "Note0", "Warning", "Foo"),
            that.checkValueState(assert, "Note1", "Warning", "Foo"),
            that.checkValueState(assert, "Note2", "None", ""),
            that.checkValueState(assert, "Composite0", "Warning", "Foo"),
            that.checkValueState(assert, "Composite1", "Warning", "Foo"),
            that.checkValueState(assert, "Composite2", "None", ""),
            that.checkValueState(assert, "Composite3", "Warning", "Foo"),
            that.checkValueState(assert, "Composite4", "None", ""),
            that.waitForChanges(assert)
        ]);
    });
});
QUnit.test("ignoreMessages for sap.ui.model.type.Currency", function (assert) {
    var oCurrencyCodeWarning = this.createResponseMessage("CurrencyCode", "Foo", "warning"), sView = "<FlexBox binding=\"{/SalesOrderSet('1')}\">\t<Input id=\"Amount0\" value=\"{\t\t\tformatOptions : {showMeasure : false},\t\t\tmode : 'TwoWay',\t\t\tparts : [{\t\t\t\tconstraints : {precision : 16, scale : 3},\t\t\t\tpath : 'GrossAmount',\t\t\t\ttype : 'sap.ui.model.odata.type.Decimal'\t\t\t}, {\t\t\t\tconstraints : {maxLength : 5},\t\t\t\tpath : 'CurrencyCode',\t\t\t\ttype : 'sap.ui.model.odata.type.String'\t\t\t}],\t\t\ttype : 'sap.ui.model.type.Currency'\t\t}\" />\t<Input id=\"Amount1\" value=\"{\t\t\tformatOptions : {showMeasure : false},\t\t\tmode : 'TwoWay',\t\t\tparts : [{\t\t\t\tconstraints : {precision : 16, scale : 3},\t\t\t\tpath : 'GrossAmount',\t\t\t\ttype : 'sap.ui.model.odata.type.Decimal'\t\t\t}, {\t\t\t\tconstraints : {maxLength : 5},\t\t\t\tparameters : {ignoreMessages : false},\t\t\t\tpath : 'CurrencyCode',\t\t\t\ttype : 'sap.ui.model.odata.type.String'\t\t\t}],\t\t\ttype : 'sap.ui.model.type.Currency'\t\t}\" />\t<Input id=\"Amount2\" value=\"{\t\t\tformatOptions : {showMeasure : false},\t\t\tmode : 'TwoWay',\t\t\tparts : [{\t\t\t\tconstraints : {precision : 16, scale : 3},\t\t\t\tpath : 'GrossAmount',\t\t\t\ttype : 'sap.ui.model.odata.type.Decimal'\t\t\t}, {\t\t\t\tconstraints : {maxLength : 5},\t\t\t\tparameters : {ignoreMessages : true},\t\t\t\tpath : 'CurrencyCode',\t\t\t\ttype : 'sap.ui.model.odata.type.String'\t\t\t}],\t\t\ttype : 'sap.ui.model.type.Currency'\t\t}\" /></FlexBox>", that = this;
    this.expectHeadRequest().expectRequest("SalesOrderSet('1')", {
        CurrencyCode: "JPY",
        GrossAmount: "12345",
        SalesOrderID: "1"
    }, { "sap-message": getMessageHeader(oCurrencyCodeWarning) }).expectValue("Amount0", "12,345.00").expectValue("Amount0", "12,345").expectValue("Amount1", "12,345.00").expectValue("Amount1", "12,345").expectValue("Amount2", "12,345.00").expectValue("Amount2", "12,345").expectMessage(oCurrencyCodeWarning, "/SalesOrderSet('1')/");
    return this.createView(assert, sView).then(function () {
        return Promise.all([
            that.checkValueState(assert, "Amount0", "None", ""),
            that.checkValueState(assert, "Amount1", "Warning", "Foo"),
            that.checkValueState(assert, "Amount2", "None", ""),
            that.waitForChanges(assert)
        ]);
    });
});
QUnit.test("Messages: Handle technical messages as persistent", function (assert) {
    var oErrorMessage = createErrorResponse({ message: "Not Found", statusCode: 404 }), oModel = createSalesOrdersModel({ persistTechnicalMessages: true }), sView = "<Table items=\"{path : '/SalesOrderSet', parameters : {select : 'foo'}}\">\t<Text text=\"{SalesOrderID}\" /></Table><FlexBox binding=\"{/SalesOrderSet('1')}\">\t<Input id=\"idNote\" value=\"{Note}\" /></FlexBox>";
    this.expectHeadRequest().expectRequest({
        batchNo: 1,
        deepPath: "/SalesOrderSet",
        requestUri: "SalesOrderSet?$skip=0&$top=100&$select=foo"
    }, oErrorMessage).expectMessages([{
            code: "UF0",
            descriptionUrl: "",
            fullTarget: "",
            message: "Not Found",
            persistent: true,
            target: "",
            technical: true,
            type: "Error"
        }]).expectRequest({
        batchNo: 1,
        deepPath: "/SalesOrderSet('1')",
        requestUri: "SalesOrderSet('1')"
    }, {
        Note: "bar"
    }).expectValue("idNote", "bar");
    this.oLogMock.expects("error").withExactArgs("Request failed with status code 404: " + "GET SalesOrderSet?$skip=0&$top=100&$select=foo", sinon.match.string, sODataMessageParserClassName);
    return this.createView(assert, sView, oModel);
});
[true, undefined, false].forEach(function (bPersistTechnicalMessages) {
    var sTitle = "Messages: Change persistTechnicalMessages after instantiation, " + "bPersistTechnicalMessages=" + bPersistTechnicalMessages;
    QUnit.test(sTitle, function (assert) {
        var oErrorMessage = createErrorResponse({ message: "Not Found", statusCode: 404 }), oModel = createSalesOrdersModel({
            persistTechnicalMessages: bPersistTechnicalMessages,
            tokenHandling: false
        }), sView = "<FlexBox binding=\"{/SalesOrderSet('1')}\">\t<Input id=\"idNote\" value=\"{Note}\" /></FlexBox>", that = this;
        this.expectRequest("SalesOrderSet('1')", oErrorMessage).expectMessages([{
                code: "UF0",
                descriptionUrl: "",
                fullTarget: bPersistTechnicalMessages ? "" : "/SalesOrderSet('1')",
                message: "Not Found",
                persistent: !!bPersistTechnicalMessages,
                target: bPersistTechnicalMessages ? "" : "/SalesOrderSet('1')",
                technical: true,
                type: "Error"
            }]);
        this.oLogMock.expects("error").withExactArgs("Request failed with status code 404: GET SalesOrderSet('1')", sinon.match.string, sODataMessageParserClassName);
        return this.createView(assert, sView, oModel).then(function () {
            oErrorMessage = createErrorResponse({ message: "Not Found", statusCode: 404 });
            that.expectRequest("SalesOrderSet('1')", oErrorMessage).expectMessages([{
                    code: "UF0",
                    descriptionUrl: "",
                    fullTarget: bPersistTechnicalMessages ? "" : "/SalesOrderSet('1')",
                    message: "Not Found",
                    persistent: !!bPersistTechnicalMessages,
                    target: bPersistTechnicalMessages ? "" : "/SalesOrderSet('1')",
                    technical: true,
                    type: "Error"
                }, {
                    code: "UF0",
                    descriptionUrl: "",
                    fullTarget: !bPersistTechnicalMessages ? "" : "/SalesOrderSet('1')",
                    message: "Not Found",
                    persistent: !bPersistTechnicalMessages,
                    target: !bPersistTechnicalMessages ? "" : "/SalesOrderSet('1')",
                    technical: true,
                    type: "Error"
                }]);
            that.oLogMock.expects("error").withExactArgs("Request failed with status code 404: GET SalesOrderSet('1')", sinon.match.string, sODataMessageParserClassName);
            if (bPersistTechnicalMessages !== undefined) {
                that.oLogMock.expects("warning").withExactArgs("The flag whether technical messages should always be treated as" + " persistent has been overwritten to " + !bPersistTechnicalMessages, undefined, sODataModelClassName);
            }
            oModel.setPersistTechnicalMessages(!bPersistTechnicalMessages);
            oModel.refresh(true);
            return that.waitForChanges(assert);
        });
    });
});
QUnit.test("AnalyticalBinding: gap calculation", function (assert) {
    var iItemCount = 0, oModel = createModel("/sap/opu/odata/sap/FAR_CUSTOMER_LINE_ITEMS", {
        tokenHandling: false
    }), oTable, sView = "<t:AnalyticalTable id=\"table\" rows=\"{path : '/Items', parameters : {useBatchRequests : true}}\"\t\tthreshold=\"10\" visibleRowCount=\"2\">\t<t:AnalyticalColumn grouped=\"true\" leadingProperty=\"AccountingDocumentItem\"\t\ttemplate=\"AccountingDocumentItem\"/>\t<t:AnalyticalColumn leadingProperty=\"AmountInCompanyCodeCurrency\" summed=\"true\"\t\ttemplate=\"AmountInCompanyCodeCurrency\"/></t:AnalyticalTable>", that = this;
    function getItems(iNumberOfItems) {
        var i, aItems = [];
        for (i = 0; i < iNumberOfItems; i += 1) {
            aItems.push({
                __metadata: {
                    uri: "/sap/opu/odata/sap/FAR_CUSTOMER_LINE_ITEMS/Items(" + iItemCount + ")"
                },
                AccountingDocumentItem: String(iItemCount),
                AmountInCompanyCodeCurrency: String(iItemCount),
                Currency: "USD"
            });
            iItemCount += 1;
        }
        return aItems;
    }
    this.expectRequest("Items" + "?$select=AmountInCompanyCodeCurrency,Currency&$top=100" + "&$inlinecount=allpages", {
        __count: "1",
        results: [{
                __metadata: {
                    uri: "/sap/opu/odata/sap/FAR_CUSTOMER_LINE_ITEMS/Items('grandTotal')"
                },
                AmountInCompanyCodeCurrency: "21763001.16",
                Currency: "USD"
            }]
    }).expectRequest("Items" + "?$select=AccountingDocumentItem,AmountInCompanyCodeCurrency,Currency" + "&$orderby=AccountingDocumentItem%20asc&$top=11&$inlinecount=allpages", {
        __count: "550",
        results: getItems(11)
    });
    return this.createView(assert, sView, oModel).then(function () {
        assert.strictEqual(that.oView.byId("table").getBinding("rows").getCount(), 550);
        assert.strictEqual(that.oView.byId("table").getBinding("rows").getLength(), 551);
    }).then(function () {
        oTable = that.oView.byId("table");
        that.expectRequest("Items" + "?$select=AccountingDocumentItem,AmountInCompanyCodeCurrency," + "Currency&$orderby=AccountingDocumentItem%20asc&$skip=11&$top=6", {
            results: getItems(6)
        });
        oTable.setFirstVisibleRow(6);
        return that.waitForChanges(assert);
    }).then(function () {
        oTable.setFirstVisibleRow(11);
        return that.waitForChanges(assert);
    }).then(function () {
        that.expectRequest("Items" + "?$select=AccountingDocumentItem,AmountInCompanyCodeCurrency,Currency" + "&$orderby=AccountingDocumentItem%20asc&$skip=90&$top=21", {
            results: getItems(21)
        });
        oTable.setFirstVisibleRow(100);
        return that.waitForChanges(assert);
    }).then(function () {
        oTable.setFirstVisibleRow(95);
        return that.waitForChanges(assert);
    }).then(function () {
        that.expectRequest("Items" + "?$select=AccountingDocumentItem,AmountInCompanyCodeCurrency,Currency" + "&$orderby=AccountingDocumentItem%20asc&$skip=84&$top=6", {
            results: getItems(6)
        });
        oTable.setFirstVisibleRow(94);
        return that.waitForChanges(assert);
    });
});
QUnit.test("Messages: GET returns 204 No Content", function (assert) {
    var oBusinessPartnerError = this.createResponseMessage("ToBusinessPartner"), oModel = createSalesOrdersModelMessageScope(), sView = "<FlexBox binding=\"{/SalesOrderSet('1')}\">\t<FlexBox binding=\"{ToBusinessPartner}\">\t\t<Text id=\"id\" text=\"{BusinessPartnerID}\" />\t</FlexBox></FlexBox>";
    this.expectHeadRequest({ "sap-message-scope": "BusinessObject" }).expectRequest({
        deepPath: "/SalesOrderSet('1')",
        headers: { "sap-message-scope": "BusinessObject" },
        requestUri: "SalesOrderSet('1')"
    }, {
        __metadata: { uri: "SalesOrderSet('1')" },
        SalesOrderID: "1"
    }, { "sap-message": getMessageHeader(oBusinessPartnerError) }).expectRequest({
        deepPath: "/SalesOrderSet('1')/ToBusinessPartner",
        headers: { "sap-message-scope": "BusinessObject" },
        requestUri: "SalesOrderSet('1')/ToBusinessPartner"
    }, NO_CONTENT).expectMessage(oBusinessPartnerError, "/SalesOrderSet('1')/");
    oModel.setMessageScope(MessageScope.BusinessObject);
    return this.createView(assert, sView, oModel).then(function () {
        assert.strictEqual(oModel.getObject("/SalesOrderSet('1')/ToBusinessPartner"), null);
    });
});
[
    "/BusinessPartner_Alternatives",
    "/BusinessPartner_Alternatives_ReturnType"
].forEach(function (sFunctionName) {
    var sTitle = "Messages: function import returning a collection for different entities;" + " messages are updated only for returned entities: " + sFunctionName;
    QUnit.test(sTitle, function (assert) {
        var oCompanyNameError1 = this.createResponseMessage("CompanyName"), oCompanyNameError2 = this.createResponseMessage("CompanyName"), oModel = createSalesOrdersModelMessageScope(), oToProductADescriptionError1 = this.createResponseMessage("ToProducts('A')/Description"), oProductADescriptionError1 = cloneODataMessage(oToProductADescriptionError1, "('A')/Description"), oToProductADescriptionError2 = this.createResponseMessage("ToProducts('B')/Description"), oProductADescriptionError2 = cloneODataMessage(oToProductADescriptionError2, "('B')/Description"), sView = "<FlexBox binding=\"{/BusinessPartnerSet('1')}\">\t<Input id=\"companyName1\" value=\"{CompanyName}\" /></FlexBox><FlexBox binding=\"{/BusinessPartnerSet('2')}\">\t<Input id=\"companyName2\" value=\"{CompanyName}\" /></FlexBox>", that = this;
        this.expectHeadRequest({ "sap-message-scope": "BusinessObject" }).expectRequest({
            deepPath: "/BusinessPartnerSet('1')",
            headers: { "sap-message-scope": "BusinessObject" },
            requestUri: "BusinessPartnerSet('1')"
        }, {
            __metadata: { uri: "BusinessPartnerSet('1')" },
            BusinessPartnerID: "1",
            CompanyName: "company1"
        }, { "sap-message": getMessageHeader([
                oCompanyNameError1,
                oToProductADescriptionError1
            ]) }).expectRequest({
            deepPath: "/BusinessPartnerSet('2')",
            headers: { "sap-message-scope": "BusinessObject" },
            requestUri: "BusinessPartnerSet('2')"
        }, {
            __metadata: { uri: "BusinessPartnerSet('2')" },
            BusinessPartnerID: "2",
            CompanyName: "company2"
        }, { "sap-message": getMessageHeader([
                oCompanyNameError2,
                oToProductADescriptionError2
            ]) }).expectValue("companyName1", "company1").expectValue("companyName2", "company2").expectMessage(oCompanyNameError1, "/BusinessPartnerSet('1')/").expectMessage(oProductADescriptionError1, "/ProductSet", "/BusinessPartnerSet('1')/ToProducts").expectMessage(oCompanyNameError2, "/BusinessPartnerSet('2')/").expectMessage(oProductADescriptionError2, "/ProductSet", "/BusinessPartnerSet('2')/ToProducts");
        oModel.setMessageScope(MessageScope.BusinessObject);
        return this.createView(assert, sView, oModel).then(function () {
            var oCompanyNameError2_Update = that.createResponseMessage("('2')/CompanyName"), oToProductADescriptionError2 = that.createResponseMessage("('2')/ToProducts('B')/Description"), oProductADescriptionError2 = cloneODataMessage(oToProductADescriptionError2, "('B')/Description");
            that.expectRequest({
                deepPath: sFunctionName,
                encodeRequestUri: false,
                headers: { "sap-message-scope": "BusinessObject" },
                method: "POST",
                requestUri: sFunctionName.slice(1) + "?BusinessPartnerID='1'"
            }, {
                results: [{
                        __metadata: { uri: "BusinessPartnerSet('2')" },
                        BusinessPartnerID: "2",
                        CompanyName: "companyName2New"
                    }]
            }, {
                "sap-message": getMessageHeader([
                    oCompanyNameError2_Update,
                    oToProductADescriptionError2
                ])
            }).expectValue("companyName2", "companyName2New").expectMessage(oCompanyNameError2_Update, "/BusinessPartnerSet", undefined, true).expectMessage(oProductADescriptionError2, "/ProductSet", "/BusinessPartnerSet('2')/ToProducts").expectMessage(oCompanyNameError1, "/BusinessPartnerSet('1')/").expectMessage(oProductADescriptionError1, "/ProductSet", "/BusinessPartnerSet('1')/ToProducts");
            return Promise.all([
                oModel.callFunction(sFunctionName, {
                    method: "POST",
                    refreshAfterChange: false,
                    urlParameters: {
                        BusinessPartnerID: "1"
                    }
                }).contextCreated(),
                that.waitForChanges(assert)
            ]);
        });
    });
});
QUnit.test("Messages: function import returning a collection (adjustDeepPath)", function (assert) {
    var oModel = createSalesOrdersModelMessageScope(), oQuantityError = this.createResponseMessage("(SalesOrderID='1',ItemPosition='20')/Quantity"), sView = "<FlexBox binding=\"{/SalesOrderSet('1')}\">\t<Table items=\"{ToLineItems}\">\t\t<Text id=\"quantity\" text=\"{Quantity}\" />\t</Table></FlexBox>", that = this;
    this.expectHeadRequest({ "sap-message-scope": "BusinessObject" }).expectRequest({
        deepPath: "/SalesOrderSet('1')",
        headers: { "sap-message-scope": "BusinessObject" },
        requestUri: "SalesOrderSet('1')"
    }, {
        __metadata: { uri: "SalesOrderSet('1')" },
        SalesOrderID: "1"
    }).expectRequest({
        deepPath: "/SalesOrderSet('1')/ToLineItems",
        headers: { "sap-message-scope": "BusinessObject" },
        requestUri: "SalesOrderSet('1')/ToLineItems?$skip=0&$top=100"
    }, {
        results: [{
                __metadata: {
                    uri: "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10')"
                },
                ItemPosition: "10",
                Quantity: "2",
                SalesOrderID: "1"
            }, {
                __metadata: {
                    uri: "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='20')"
                },
                ItemPosition: "20",
                Quantity: "0",
                SalesOrderID: "1"
            }]
    }, {
        "sap-message": getMessageHeader(oQuantityError)
    }).expectValue("quantity", ["2", "0"]).expectMessage(oQuantityError, "/SalesOrderLineItemSet", "/SalesOrderSet('1')/ToLineItems");
    oModel.setMessageScope(MessageScope.BusinessObject);
    return this.createView(assert, sView, oModel).then(function () {
        var oQuantitySuccess = that.createResponseMessage("(SalesOrderID='1',ItemPosition='20')/Quantity", undefined, "success");
        that.expectRequest({
            deepPath: "/SalesOrder_FixQuantities",
            encodeRequestUri: false,
            headers: { "sap-message-scope": "BusinessObject" },
            method: "POST",
            requestUri: "SalesOrder_FixQuantities?SalesOrderID='1'"
        }, {
            results: [{
                    __metadata: {
                        uri: "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='20')"
                    },
                    ItemPosition: "20",
                    Quantity: "2",
                    SalesOrderID: "1"
                }]
        }, {
            "sap-message": getMessageHeader(oQuantitySuccess)
        }).expectValue("quantity", "2", 1).expectMessage(oQuantitySuccess, "/SalesOrderLineItemSet", "/SalesOrderSet('1')/ToLineItems", true);
        return Promise.all([
            oModel.callFunction("/SalesOrder_FixQuantities", {
                adjustDeepPath: function (mParameters) {
                    assert.strictEqual(mParameters.deepPath, "/SalesOrderLineItemSet");
                    return "/SalesOrderSet('1')/ToLineItems";
                },
                method: "POST",
                refreshAfterChange: false,
                urlParameters: {
                    SalesOrderID: "1"
                }
            }).contextCreated(),
            that.waitForChanges(assert)
        ]);
    });
});
QUnit.test("callFunction: expand navigation properties in the same $batch", function (assert) {
    var oModel = createSalesOrdersModelMessageScope({
        canonicalRequests: true,
        tokenHandling: false
    }), sView = "<FlexBox id=\"productDetails\">\t<Text id=\"productName\" text=\"{Name}\" /></FlexBox>", that = this;
    oModel.setMessageScope(MessageScope.BusinessObject);
    return this.createView(assert, sView, oModel).then(function () {
        var oEventHandlers = {
            error: function () { },
            success: function () { }
        }, oNoteError = that.createResponseMessage("Note"), oResponse = {
            __metadata: {
                uri: "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='20')"
            },
            ItemPosition: "20",
            SalesOrderID: "1"
        };
        that.mock(oEventHandlers).expects("error").never();
        that.mock(oEventHandlers).expects("success").withExactArgs({
            __metadata: {
                uri: "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='20')"
            },
            ItemPosition: "20",
            SalesOrderID: "1",
            ToProduct: {
                __metadata: { uri: "ProductSet(ProductID='P1')" },
                Name: "Product 1",
                ProductID: "P1"
            }
        }, sinon.match.has("data", oResponse));
        that.expectRequest({
            batchNo: 1,
            deepPath: "/SalesOrderItem_Clone",
            encodeRequestUri: false,
            headers: {
                "Content-ID": "~key~",
                "sap-message-scope": "BusinessObject",
                "sap-messages": "transientOnly"
            },
            method: "POST",
            requestUri: "SalesOrderItem_Clone?ItemPosition='10'&SalesOrderID='1'"
        }, oResponse, {
            location: "/SalesOrderSrv/SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='20')"
        }).expectRequest({
            batchNo: 1,
            deepPath: "/$~key~",
            headers: { "sap-message-scope": "BusinessObject" },
            requestUri: "$~key~?$expand=ToProduct&$select=ToProduct"
        }, {
            __metadata: {
                uri: "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='20')"
            },
            ToProduct: {
                __metadata: { uri: "ProductSet(ProductID='P1')" },
                Name: "Product 1",
                ProductID: "P1"
            }
        }, {
            "sap-message": getMessageHeader(oNoteError)
        }).expectMessage(oNoteError, "/SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='20')/", "/SalesOrderSet('1')/ToLineItems(SalesOrderID='1',ItemPosition='20')/");
        return Promise.all([
            oModel.callFunction("/SalesOrderItem_Clone", {
                adjustDeepPath: function (mParameters) {
                    assert.strictEqual(mParameters.deepPath, "/SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='20')", "Deep path adjusted");
                    return "/SalesOrderSet('1')" + "/ToLineItems(SalesOrderID='1',ItemPosition='20')";
                },
                error: oEventHandlers.error,
                expand: "ToProduct",
                method: "POST",
                success: oEventHandlers.success,
                urlParameters: {
                    ItemPosition: "10",
                    SalesOrderID: "1"
                }
            }).contextCreated(),
            that.waitForChanges(assert)
        ]).then(function () {
            that.expectValue("productName", "Product 1");
            that.oView.byId("productDetails").bindObject({
                parameters: { select: "Name" },
                path: "/SalesOrderSet('1')" + "/ToLineItems(SalesOrderID='1',ItemPosition='20')/ToProduct"
            });
            return that.waitForChanges(assert);
        });
    });
});
[true, false].forEach(function (bDeferred) {
    var sTitle = "callFunction: abort function call with given expand parameter; deferred: " + bDeferred;
    QUnit.test(sTitle, function (assert) {
        var oCallFunctionResult, oModel = createSalesOrdersModelMessageScope(), that = this;
        oModel.setDeferredGroups(["change", "callFunction"]);
        return this.createView(assert, "", oModel).then(function () {
            oCallFunctionResult = oModel.callFunction("/SalesOrderItem_Clone", {
                adjustDeepPath: function (mParameters) {
                    assert.strictEqual(mParameters.deepPath, "/SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='20')", "Deep path adjusted");
                    return "/SalesOrderSet('1')" + "/ToLineItems(SalesOrderID='1',ItemPosition='20')";
                },
                expand: "ToProduct",
                groupId: bDeferred ? "callFunction" : undefined,
                method: "POST",
                urlParameters: {
                    ItemPosition: "10",
                    SalesOrderID: "1"
                }
            });
            if (!bDeferred) {
                oCallFunctionResult.abort();
                oModel.submitChanges();
                return that.waitForChanges(assert);
            }
            return Promise.all([
                Promise.resolve(),
                that.waitForChanges(assert)
            ]).then(function () {
                oCallFunctionResult.abort();
                oModel.submitChanges("callFunction");
                return that.waitForChanges(assert);
            });
        });
    });
});
QUnit.test("callFunction: with given expand parameter fails", function (assert) {
    var oModel = createSalesOrdersModelMessageScope({
        canonicalRequests: true,
        tokenHandling: false
    }), that = this;
    oModel.setMessageScope(MessageScope.BusinessObject);
    return this.createView(assert, "", oModel).then(function () {
        var oErrorGET = createErrorResponse({ message: "GET failed", statusCode: 400 }), oErrorPOST = createErrorResponse({ message: "POST failed", statusCode: 400 }), oEventHandlers = {
            error: function () { },
            success: function () { }
        };
        that.mock(oEventHandlers).expects("error").withExactArgs(sinon.match({
            message: "HTTP request failed",
            responseText: oErrorPOST.body,
            statusCode: 400,
            statusText: "FAILED"
        }));
        that.mock(oEventHandlers).expects("success").never();
        that.oLogMock.expects("error").withExactArgs("Request failed with status code 400: POST " + "SalesOrderItem_Clone?ItemPosition='10'&SalesOrderID='1'", sinon.match.string, sODataMessageParserClassName);
        that.oLogMock.expects("error").withExactArgs(sinon.match(new RegExp("Request failed with status code 400: " + "GET \\$id-\\d*-\\d*\\?\\$expand=ToProduct&\\$select=ToProduct")), sinon.match.string, sODataMessageParserClassName);
        that.expectRequest({
            batchNo: 1,
            deepPath: "/SalesOrderItem_Clone",
            encodeRequestUri: false,
            headers: {
                "Content-ID": "~key~",
                "sap-message-scope": "BusinessObject",
                "sap-messages": "transientOnly"
            },
            method: "POST",
            requestUri: "SalesOrderItem_Clone?ItemPosition='10'&SalesOrderID='1'"
        }, oErrorPOST).expectRequest({
            batchNo: 1,
            deepPath: "/$~key~",
            headers: { "sap-message-scope": "BusinessObject" },
            requestUri: "$~key~?$expand=ToProduct&$select=ToProduct"
        }, oErrorGET).expectMessages([{
                code: "UF0",
                descriptionUrl: "",
                fullTarget: "/SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10')",
                message: "POST failed",
                persistent: false,
                target: "/SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10')",
                technical: true,
                type: "Error"
            }, {
                code: "UF0",
                descriptionUrl: "",
                fullTarget: "/$~key~",
                message: "GET failed",
                persistent: false,
                target: "/$~key~",
                technical: true,
                type: "Error"
            }]);
        return Promise.all([
            oModel.callFunction("/SalesOrderItem_Clone", {
                adjustDeepPath: function (mParameters) {
                    assert.strictEqual(mParameters.deepPath, "/SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='20')", "Deep path adjusted");
                    return "/SalesOrderSet('1')" + "/ToLineItems(SalesOrderID='1',ItemPosition='20')";
                },
                error: oEventHandlers.error,
                expand: "ToProduct",
                method: "POST",
                success: oEventHandlers.success,
                urlParameters: {
                    ItemPosition: "10",
                    SalesOrderID: "1"
                }
            }).contextCreated(),
            that.waitForChanges(assert)
        ]).then(function () {
            oModel.submitChanges();
            return that.waitForChanges(assert);
        });
    });
});
QUnit.test("TreeTable with preliminary context", function (assert) {
    var oModel = createAllowanceModel(), sObjectUri = "C_DFS_AllwncReq(guid'fa163e35-93d9-1eda-b19c-c26490674ab4')", sView = "<FlexBox binding=\"{path : '/C_DFS_AllwncReq(guid\\'fa163e35-93d9-1eda-b19c-c26490674ab4\\')', \t\tparameters : {createPreliminaryContext : true, groupId : 'myGroup'}}\">\t<Text id=\"reqID\" text=\"{DfsAllwncReqID}\" />\t<t:TreeTable id=\"table\"\t\t\trows=\"{path : 'to_AllwncReqToFe', parameters : \t\t\t\t{countMode : 'Inline', groupId : 'myGroup', usePreliminaryContext : true}}\"\t\t\tvisibleRowCount=\"1\"\t\t\tvisibleRowCountMode=\"Fixed\" >\t\t<Text id=\"orgID\" text=\"{ForceElementOrgID}\" />\t</t:TreeTable></FlexBox>";
    this.expectHeadRequest().expectRequest({
        batchNo: 1,
        deepPath: "/" + sObjectUri,
        requestUri: sObjectUri
    }, {
        DfsAllwncReqUUID: "fa163e35-93d9-1eda-b19c-c26490674ab4",
        DfsAllwncReqID: "Request ID"
    }).expectRequest({
        batchNo: 2,
        deepPath: "/" + sObjectUri + "/to_AllwncReqToFe",
        requestUri: sObjectUri + "/to_AllwncReqToFe" + "?$skip=0&$top=101&$inlinecount=allpages&$filter=HierarchyLevel%20le%200"
    }, {
        __count: "1",
        results: [{
                "ForceElementOrgID": "4711"
            }]
    }).expectValue("reqID", "Request ID").expectValue("orgID", [""]).expectValue("orgID", ["4711"]);
    return this.createView(assert, sView, oModel);
});
QUnit.test("ODataTreeBindingFlat: refreshAfterChange leads to GET", function (assert) {
    var oModel = createSpecialCasesModel({ refreshAfterChange: true }), sView = "<t:TreeTable id=\"table\"\t\trows=\"{\t\t\tparameters : {\t\t\t\tcountMode : 'Inline',\t\t\t\tgantt : {\t\t\t\t\trowIdName : 'OrderOperationRowID'\t\t\t\t},\t\t\t\ttreeAnnotationProperties : {\t\t\t\t\thierarchyDrillStateFor : 'OrderOperationIsExpanded',\t\t\t\t\thierarchyLevelFor : 'OrderOperationRowLevel',\t\t\t\t\thierarchyNodeDescendantCountFor : 'HierarchyDescendantCount',\t\t\t\t\thierarchyNodeFor : 'OrderOperationRowID',\t\t\t\t\thierarchyParentNodeFor : 'OrderOperationParentRowID'\t\t\t\t}\t\t\t},\t\t\tpath : '/C_RSHMaintSchedSmltdOrdAndOp'\t\t}\"\t\tvisibleRowCount=\"1\"\t\tvisibleRowCountMode=\"Fixed\" >\t<Text id=\"maintenanceOrder\" text=\"{MaintenanceOrder}\" /></t:TreeTable>", that = this;
    this.expectHeadRequest().expectRequest({
        batchNo: 1,
        deepPath: "/C_RSHMaintSchedSmltdOrdAndOp",
        requestUri: "C_RSHMaintSchedSmltdOrdAndOp?$skip=0&$top=101&$inlinecount=allpages" + "&$filter=OrderOperationRowLevel%20le%200"
    }, {
        __count: "1",
        results: [{
                __metadata: { uri: "C_RSHMaintSchedSmltdOrdAndOp('1')" },
                MaintenanceOrder: "Foo"
            }]
    }).ignoreNullChanges("maintenanceOrder").expectValue("maintenanceOrder", ["Foo"]);
    return this.createView(assert, sView, oModel).then(function () {
        that.expectRequest({
            batchNo: 2,
            data: {
                __metadata: { uri: "C_RSHMaintSchedSmltdOrdAndOp('1')" },
                MaintenanceOrder: "Bar"
            },
            deepPath: "/C_RSHMaintSchedSmltdOrdAndOp('1')",
            headers: {},
            key: "C_RSHMaintSchedSmltdOrdAndOp('1')",
            method: "MERGE",
            requestUri: "C_RSHMaintSchedSmltdOrdAndOp('1')"
        }, NO_CONTENT).expectRequest({
            batchNo: 2,
            deepPath: "/C_RSHMaintSchedSmltdOrdAndOp",
            requestUri: "C_RSHMaintSchedSmltdOrdAndOp?$skip=0&$top=101" + "&$inlinecount=allpages&$filter=OrderOperationRowLevel%20le%200"
        }, {
            __count: "1",
            results: [{
                    __metadata: { uri: "C_RSHMaintSchedSmltdOrdAndOp('1')" },
                    MaintenanceOrder: "Bar"
                }]
        }).expectValue("maintenanceOrder", ["Bar"]);
        oModel.setProperty("/C_RSHMaintSchedSmltdOrdAndOp('1')/MaintenanceOrder", "Bar");
        oModel.submitChanges();
        return that.waitForChanges(assert);
    });
});
QUnit.test("ODataTreeBinding: relative binding, async adapter loading", function (assert) {
    var oModel = createSpecialCasesModel({ preliminaryContext: true }), sView = "<FlexBox id=\"box\">\t<t:TreeTable id=\"table\"\t\t\trows=\"{\t\t\t\tparameters : {\t\t\t\t\tcountMode : 'Inline',\t\t\t\t\ttreeAnnotationProperties : {\t\t\t\t\t\thierarchyDrillStateFor : 'OrderOperationIsExpanded',\t\t\t\t\t\thierarchyLevelFor : 'OrderOperationRowLevel',\t\t\t\t\t\thierarchyNodeDescendantCountFor : 'HierarchyDescendantCount',\t\t\t\t\t\thierarchyNodeFor : 'OrderOperationRowID',\t\t\t\t\t\thierarchyParentNodeFor : 'OrderOperationParentRowID'\t\t\t\t\t}\t\t\t\t},\t\t\t\tpath : 'to_C_RSHMaintSchedSmltdOrdAndOp'\t\t\t}\"\t\t\tvisibleRowCount=\"1\"\t\t\tvisibleRowCountMode=\"Fixed\" >\t\t<Text id=\"maintenanceOrder\" text=\"{MaintenanceOrder}\" />\t</t:TreeTable></FlexBox>", that = this;
    this.expectValue("maintenanceOrder", [""]);
    return this.createView(assert, sView, oModel).then(function () {
        that.expectHeadRequest().expectRequest("DummySet('42')", { DummyID: "42" }).expectRequest({
            deepPath: "/DummySet('42')/to_C_RSHMaintSchedSmltdOrdAndOp",
            requestUri: "DummySet('42')/to_C_RSHMaintSchedSmltdOrdAndOp" + "?$skip=0&$top=101&$inlinecount=allpages&" + "$filter=OrderOperationRowLevel%20le%200"
        }, {
            __count: "1",
            results: [{
                    __metadata: { uri: "C_RSHMaintSchedSmltdOrdAndOp('1')" },
                    MaintenanceOrder: "Bar"
                }]
        }).expectValue("maintenanceOrder", ["Bar"]);
        that.oView.byId("box").bindElement({ path: "/DummySet('42')" });
        return that.waitForChanges(assert);
    });
});
[true, false].forEach(function (bUseStatic) {
    var sTitle = "CompositeBinding: Overwrite invalid entry with model value after context switch, " + "static = " + bUseStatic;
    QUnit.test(sTitle, function (assert) {
        var oAmount0, oCurrency0, sCurrencyCodeJSON = "path : 'JSONModel>CurrencyCode'," + "type : 'sap.ui.model.odata.type.String'", sCurrencyCodeStatic = "value : 'USD'", oJSONModel = new JSONModel({ "CurrencyCode": "USD" }), oModel = createSalesOrdersModel({
            defaultBindingMode: BindingMode.TwoWay,
            refreshAfterChange: false
        }), sView = "<FlexBox binding=\"{/SalesOrderSet('1')}\">\t<Input id=\"Amount0\" value=\"{\t\t\tformatOptions : {showMeasure : false},\t\t\tparts : [{\t\t\t\tpath : 'GrossAmount',\t\t\t\ttype : 'sap.ui.model.odata.type.Decimal'\t\t\t}, {" + (bUseStatic ? sCurrencyCodeStatic : sCurrencyCodeJSON) + "}],\t\t\ttype : 'sap.ui.model.type.Currency'\t\t}\" />\t<Input id=\"Currency0\" value=\"{\t\t\tconstraints : {maxLength : 3},\t\t\tpath : 'CurrencyCode',\t\t\ttype : 'sap.ui.model.odata.type.String'\t\t}\" /></FlexBox><FlexBox binding=\"{/SalesOrderSet('2')}\">\t<Input id=\"Amount1\" value=\"{GrossAmount}\" />\t<Input id=\"Currency1\" value=\"{CurrencyCode}\" /></FlexBox>", that = this;
        this.expectHeadRequest().expectRequest("SalesOrderSet('1')", {
            CurrencyCode: "USD",
            GrossAmount: "10",
            SalesOrderID: "1"
        }).expectRequest("SalesOrderSet('2')", {
            CurrencyCode: "USD",
            GrossAmount: "10",
            SalesOrderID: "2"
        }).expectValue("Amount0", "10.00").expectValue("Currency0", "USD").expectValue("Amount1", "10").expectValue("Currency1", "USD");
        return this.createView(assert, sView, { undefined: oModel, JSONModel: oJSONModel }).then(function () {
            oAmount0 = that.oView.byId("Amount0");
            oCurrency0 = that.oView.byId("Currency0");
            that.expectMessages([{
                    descriptionUrl: undefined,
                    message: "EnterNumber",
                    target: oAmount0.getId() + "/value",
                    type: "Error"
                }, {
                    descriptionUrl: undefined,
                    message: "EnterTextMaxLength 3",
                    target: oCurrency0.getId() + "/value",
                    type: "Error"
                }]).expectValue("Amount0", "invalid amount").expectValue("Currency0", "invalid currency");
            TestUtils.withNormalizedMessages(function () {
                oAmount0.setValue("invalid amount");
                oCurrency0.setValue("invalid currency");
            });
            return Promise.all([
                that.checkValueState(assert, oAmount0, "Error", "EnterNumber"),
                that.checkValueState(assert, oCurrency0, "Error", "EnterTextMaxLength 3"),
                that.waitForChanges(assert)
            ]);
        }).then(function () {
            that.expectMessages([]).expectValue("Amount0", "10.00").expectValue("Currency0", "USD");
            oAmount0.setBindingContext(that.oView.byId("Amount1").getBindingContext());
            oCurrency0.setBindingContext(that.oView.byId("Currency1").getBindingContext());
            assert.strictEqual(oAmount0.getBindingContext().getPath(), "/SalesOrderSet('2')");
            assert.strictEqual(oCurrency0.getBindingContext().getPath(), "/SalesOrderSet('2')");
            return Promise.all([
                that.checkValueState(assert, oAmount0, "None", ""),
                that.checkValueState(assert, oCurrency0, "None", ""),
                that.waitForChanges(assert)
            ]);
        });
    });
});
QUnit.test("CompositeBinding: Set binding context; one model instance for two named models", function (assert) {
    var oModel = createSalesOrdersModel(), sView = "<Table id=\"SalesOrderList\" items=\"{/SalesOrderSet}\">\t<Text id=\"SalesOrderNote\" text=\"{Note}\" /></Table><Table id=\"LineItems0\" items=\"{ToLineItems}\">\t<Text id=\"LineItems0Note\" text=\"{ItemPosition}: {Note}\" /></Table>", that = this;
    this.expectHeadRequest().expectRequest({
        deepPath: "/SalesOrderSet",
        requestUri: "SalesOrderSet?$skip=0&$top=100"
    }, {
        results: [{
                __metadata: { uri: "SalesOrderSet('1')" },
                Note: "Foo",
                SalesOrderID: "1"
            }]
    }).expectChange("LineItems0Note", false);
    return this.createView(assert, sView, { undefined: oModel, model2: oModel }).then(function () {
        that.expectRequest({
            deepPath: "/SalesOrderSet('1')/ToLineItems",
            requestUri: "SalesOrderSet('1')/ToLineItems?$skip=0&$top=100"
        }, {
            results: [{
                    __metadata: {
                        uri: "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10~0~')"
                    },
                    ItemPosition: "10~0~",
                    Note: "note0",
                    SalesOrderID: "1"
                }]
        }).expectChange("LineItems0Note", ["10~0~: note0"]);
        that.oView.byId("LineItems0").setBindingContext(that.oView.byId("SalesOrderList").getItems()[0].getBindingContext());
        return that.waitForChanges(assert);
    });
});
QUnit.test("JSONModel: Value state updated after calling unbindProperty", function (assert) {
    var oModel = new JSONModel({ Note: "Foo" }), sView = "<Input id=\"note\" value=\"{/Note}\" />", that = this;
    this.expectValue("note", "Foo");
    return this.createView(assert, sView, oModel).then(function () {
        that.expectMessages([{
                descriptionUrl: undefined,
                message: "Some message",
                target: "/Note",
                type: "Error"
            }]);
        sap.ui.getCore().getMessageManager().addMessages(new Message({
            message: "Some message",
            processor: oModel,
            target: "/Note",
            type: "Error"
        }));
        return Promise.all([
            that.checkValueState(assert, "note", "Error", "Some message"),
            that.waitForChanges(assert)
        ]);
    }).then(function () {
        that.expectValue("note", "");
        that.oView.byId("note").unbindProperty("value");
        return Promise.all([
            that.checkValueState(assert, "note", "None", ""),
            that.waitForChanges(assert)
        ]);
    });
});
QUnit.test("JSONModel: Correct value state after setting another model", function (assert) {
    var oModel = new JSONModel({ Note: "Foo" }), sView = "<Input id=\"note\" value=\"{/Note}\" />", that = this;
    this.expectValue("note", "Foo");
    return this.createView(assert, sView, oModel).then(function () {
        that.expectMessages([{
                descriptionUrl: undefined,
                message: "Some message",
                target: "/Note",
                type: "Error"
            }]);
        sap.ui.getCore().getMessageManager().addMessages(new Message({
            message: "Some message",
            processor: oModel,
            target: "/Note",
            type: "Error"
        }));
        return Promise.all([
            that.checkValueState(assert, "note", "Error", "Some message"),
            that.waitForChanges(assert)
        ]);
    }).then(function () {
        that.expectValue("note", "Bar");
        that.oView.setModel(new JSONModel({ Note: "Bar" }));
        return Promise.all([
            that.checkValueState(assert, "note", "None", ""),
            that.waitForChanges(assert)
        ]);
    });
});
QUnit.test("OData Unit type without unit customizing falls back to CLDR", function (assert) {
    var oModel = createSalesOrdersModel({ defaultBindingMode: "TwoWay" }), sView = "<FlexBox binding=\"{/ProductSet('P1')}\">\t<Input id=\"weight\" value=\"{\t\tparts : [{\t\t\tconstraints : { scale : 'variable' },\t\t\tpath : 'WeightMeasure',\t\t\ttype : 'sap.ui.model.odata.type.Decimal'\t\t}, {\t\t\tpath : 'WeightUnit',\t\t\ttype : 'sap.ui.model.odata.type.String'\t\t}, {\t\t\tmode : 'OneTime',\t\t\tpath : '/##@@requestUnitsOfMeasure',\t\t\ttargetType : 'any'\t\t}],\t\tmode : 'TwoWay',\t\ttype : 'sap.ui.model.odata.type.Unit'\t}\" /></FlexBox>", that = this;
    this.expectHeadRequest().expectRequest("ProductSet('P1')", {
        ProductID: "P1",
        WeightMeasure: "12.34",
        WeightUnit: "mass-kilogram"
    }).expectValue("weight", "12.34").expectValue("weight", "12.34 kg");
    return this.createView(assert, sView, oModel).then(function () {
        var oControl = that.oView.byId("weight");
        that.expectValue("weight", "23.4 kg");
        oControl.setValue("23.4 kg");
        that.expectValue("weight", "0 kg").expectValue("weight", "0 kg");
        oControl.setValue("");
    });
});
QUnit.test("OData Currency type without customizing falls back to CLDR", function (assert) {
    var oModel = createSalesOrdersModel({ defaultBindingMode: "TwoWay" }), sView = "<FlexBox binding=\"{/ProductSet('P1')}\">\t<Input id=\"price\" value=\"{\t\tparts : [{\t\t\tconstraints : { scale : 'variable' },\t\t\tpath : 'Price',\t\t\ttype : 'sap.ui.model.odata.type.Decimal'\t\t}, {\t\t\tpath : 'CurrencyCode',\t\t\ttype : 'sap.ui.model.odata.type.String'\t\t}, {\t\t\tmode : 'OneTime',\t\t\tpath : '/##@@requestCurrencyCodes',\t\t\ttargetType : 'any'\t\t}],\t\tmode : 'TwoWay',\t\ttype : 'sap.ui.model.odata.type.Currency'\t}\" /></FlexBox>", that = this;
    this.expectHeadRequest().expectRequest("ProductSet('P1')", {
        ProductID: "P1",
        Price: "12.3",
        CurrencyCode: "EUR"
    }).expectValue("price", "12.30").expectValue("price", "12.30\u00A0EUR");
    return this.createView(assert, sView, oModel).then(function () {
        var oControl = that.oView.byId("price");
        that.expectValue("price", "42\u00A0JPY").expectValue("price", "42\u00A0JPY");
        oControl.setValue("42 JPY");
        that.expectValue("price", "0\u00A0JPY").expectValue("price", "0\u00A0JPY");
        oControl.setValue("");
    });
});
QUnit.test("ODataTreeBindingAdapter: collapseToLevel prevents auto expand of child nodes with" + " higher level", function (assert) {
    var oModel = createSpecialCasesModel(), oTable, sView = "<t:TreeTable id=\"table\"\t\trows=\"{\t\t\tparameters : {\t\t\t\tcountMode : 'Inline',\t\t\t\tnumberOfExpandedLevels : 1,\t\t\t\ttreeAnnotationProperties : {\t\t\t\t\thierarchyDrillStateFor : 'OrderOperationIsExpanded',\t\t\t\t\thierarchyLevelFor : 'OrderOperationRowLevel',\t\t\t\t\thierarchyNodeFor : 'OrderOperationRowID',\t\t\t\t\thierarchyParentNodeFor : 'OrderOperationParentRowID'\t\t\t\t}\t\t\t},\t\t\tpath : '/C_RSHMaintSchedSmltdOrdAndOp'\t\t}\"\t\tthreshold=\"0\"\t\tvisibleRowCount=\"2\"\t\tvisibleRowCountMode=\"Fixed\" >\t<Text id=\"maintenanceOrder\" text=\"{MaintenanceOrder}\" /></t:TreeTable>", that = this;
    this.expectHeadRequest().expectRequest("C_RSHMaintSchedSmltdOrdAndOp?$filter=OrderOperationRowLevel%20eq%200" + "&$skip=0&$top=2&$inlinecount=allpages", {
        __count: "273",
        results: [{
                __metadata: { uri: "C_RSHMaintSchedSmltdOrdAndOp('id-0')" },
                MaintenanceOrder: "0",
                OrderOperationIsExpanded: "collapsed",
                OrderOperationRowID: "id-0",
                OrderOperationRowLevel: 0
            }, {
                __metadata: { uri: "C_RSHMaintSchedSmltdOrdAndOp('id-1')" },
                MaintenanceOrder: "1",
                OrderOperationIsExpanded: "leaf",
                OrderOperationRowID: "id-1",
                OrderOperationRowLevel: 0
            }]
    }).expectRequest("C_RSHMaintSchedSmltdOrdAndOp?" + "$filter=OrderOperationParentRowID%20eq%20%27id-0%27&$skip=0&$top=2" + "&$inlinecount=allpages", {
        __count: "5",
        results: [{
                __metadata: { uri: "C_RSHMaintSchedSmltdOrdAndOp('id-0.0')" },
                MaintenanceOrder: "0.0",
                OrderOperationIsExpanded: "leaf",
                OrderOperationParentRowID: "id-0",
                OrderOperationRowID: "id-0.0",
                OrderOperationRowLevel: 1
            }, {
                __metadata: { uri: "C_RSHMaintSchedSmltdOrdAndOp('id-0.1')" },
                MaintenanceOrder: "0.1",
                OrderOperationIsExpanded: "leaf",
                OrderOperationParentRowID: "id-0",
                OrderOperationRowID: "id-0.1",
                OrderOperationRowLevel: 1
            }]
    }).expectValue("maintenanceOrder", ["0", "1"]).expectValue("maintenanceOrder", "0.0", 1);
    return this.createView(assert, sView, oModel).then(function () {
        oTable = that.oView.byId("table");
        that.expectValue("maintenanceOrder", "1", 1);
        oTable.collapseAll();
        return that.waitForChanges(assert);
    }).then(function () {
        that.expectRequest("C_RSHMaintSchedSmltdOrdAndOp" + "?$filter=OrderOperationRowLevel%20eq%200&$skip=2&$top=4", {
            results: [{
                    __metadata: { uri: "C_RSHMaintSchedSmltdOrdAndOp('id-2')" },
                    MaintenanceOrder: "2",
                    OrderOperationIsExpanded: "collapsed",
                    OrderOperationRowID: "id-2",
                    OrderOperationRowLevel: 0
                }, {
                    __metadata: { uri: "C_RSHMaintSchedSmltdOrdAndOp('id-3')" },
                    MaintenanceOrder: "3",
                    OrderOperationIsExpanded: "leaf",
                    OrderOperationRowID: "id-3",
                    OrderOperationRowLevel: 0
                }]
        }).expectValue("maintenanceOrder", "", 2).expectValue("maintenanceOrder", "", 3).expectValue("maintenanceOrder", "2", 2).expectValue("maintenanceOrder", "3", 3);
        oTable.setFirstVisibleRow(2);
        return that.waitForChanges(assert);
    });
});
[{
        sConstraints: "",
        sMessageText: "EnterInt",
        sMessageType: "Error"
    }, {
        sConstraints: "constraints : { skipDecimalsValidation : false },",
        sMessageText: "EnterInt",
        sMessageType: "Error"
    }, {
        sConstraints: "constraints : { skipDecimalsValidation : true },",
        sMessageText: "",
        sMessageType: "None"
    }].forEach(function (oFixture, i) {
    var sTitle = "OData Unit type with code list for units; " + oFixture.sConstraints;
    QUnit.test(sTitle, function (assert) {
        var oControl, oModel = createModel("/sap/opu/odata/sap/ZUI5_GWSAMPLE_BASIC?foo=bar" + i, {
            defaultBindingMode: "TwoWay",
            metadataUrlParams: { "customMeta": "custom/meta" },
            serviceUrlParams: { "customService": "custom/service" },
            tokenHandling: false
        }), sView = "<FlexBox binding=\"{/ProductSet('P1')}\">\t<Input id=\"weight\" value=\"{" + oFixture.sConstraints + "\t\tparts : [{\t\t\tconstraints : { precision : 13, scale : 3 },\t\t\tpath : 'WeightMeasure',\t\t\ttype : 'sap.ui.model.odata.type.Decimal'\t\t}, {\t\t\tpath : 'WeightUnit',\t\t\ttype : 'sap.ui.model.odata.type.String'\t\t}, {\t\t\tmode : 'OneTime',\t\t\tpath : '/##@@requestUnitsOfMeasure',\t\t\ttargetType : 'any'\t\t}],\t\tmode : 'TwoWay',\t\ttype : 'sap.ui.model.odata.type.Unit'\t}\" /></FlexBox>", that = this;
        this.expectRequest("ProductSet('P1')?foo=bar" + i + "&customService=custom%2Fservice", {
            ProductID: "P1",
            WeightMeasure: "12.34",
            WeightUnit: "KG"
        }).expectRequest("SAP__UnitsOfMeasure?foo=bar" + i + "&customService=custom%2Fservice" + "&$skip=0&$top=5000", {
            results: [{
                    DecimalPlaces: 0,
                    ExternalCode: "EA",
                    ISOCode: "EA",
                    Text: "Each",
                    UnitCode: "EA"
                }, {
                    DecimalPlaces: 3,
                    ExternalCode: "KG",
                    ISOCode: "KGM",
                    Text: "Kilogramm",
                    UnitCode: "KG"
                }]
        }).expectValue("weight", "12.340 KG");
        return this.createView(assert, sView, oModel).then(function () {
            oControl = that.oView.byId("weight");
            that.expectValue("weight", "23.400 KG").expectValue("weight", "23.400 KG");
            oControl.setValue("23.4 KG");
            that.expectValue("weight", "0.000 KG").expectValue("weight", "0.000 KG");
            oControl.setValue("");
            that.expectMessages([{
                    descriptionUrl: undefined,
                    message: "EnterNumberFraction 3",
                    target: oControl.getId() + "/value",
                    type: "Error"
                }]).expectValue("weight", "12.3456 KG");
            TestUtils.withNormalizedMessages(function () {
                oControl.setValue("12.3456 KG");
            });
            return that.waitForChanges(assert);
        }).then(function () {
            return that.checkValueState(assert, that.oView.byId("weight"), "Error", "EnterNumberFraction 3");
        }).then(function () {
            that.expectValue("weight", "1.1 EA");
            TestUtils.withNormalizedMessages(function () {
                oControl.setValue("1.1 EA");
            });
        }).then(function () {
            return that.checkValueState(assert, that.oView.byId("weight"), oFixture.sMessageType, oFixture.sMessageText);
        });
    });
});
QUnit.test("OData Currency type with code list for currencies", function (assert) {
    var oModel = createModel("/sap/opu/odata/sap/ZUI5_GWSAMPLE_BASIC?foo=bar", {
        defaultBindingMode: "TwoWay",
        metadataUrlParams: { "customMeta": "custom/meta" },
        serviceUrlParams: { "customService": "custom/service" },
        tokenHandling: false
    }), sView = "<FlexBox binding=\"{/ProductSet('P1')}\">\t<Input id=\"price\" value=\"{\t\tparts : [{\t\t\tconstraints : { scale : 'variable' },\t\t\tpath : 'Price',\t\t\ttype : 'sap.ui.model.odata.type.Decimal'\t\t}, {\t\t\tpath : 'CurrencyCode',\t\t\ttype : 'sap.ui.model.odata.type.String'\t\t}, {\t\t\tmode : 'OneTime',\t\t\tpath : '/##@@requestCurrencyCodes',\t\t\ttargetType : 'any'\t\t}],\t\tmode : 'TwoWay',\t\ttype : 'sap.ui.model.odata.type.Currency'\t}\" /></FlexBox>", that = this;
    this.expectRequest("ProductSet('P1')?foo=bar&customService=custom%2Fservice", {
        ProductID: "P1",
        Price: "12.3",
        CurrencyCode: "EUR"
    }).expectRequest("SAP__Currencies?foo=bar&customService=custom%2Fservice&$skip=0&$top=5000", {
        results: [{
                CurrencyCode: "EUR",
                DecimalPlaces: 2,
                ISOCode: "EUR",
                Text: "Euro"
            }, {
                CurrencyCode: "USDN",
                DecimalPlaces: 5,
                ISOCode: "",
                Text: "US Dollar"
            }]
    }).expectValue("price", "12.30\u00A0EUR");
    return this.createView(assert, sView, oModel).then(function () {
        var oControl = that.oView.byId("price");
        that.expectValue("price", "42.12345\u00A0USDN").expectValue("price", "42.12345\u00A0USDN");
        oControl.setValue("42.12345 USDN");
        that.expectValue("price", "0.00000\u00A0USDN").expectValue("price", "0.00000\u00A0USDN");
        oControl.setValue("");
        that.expectMessages([{
                descriptionUrl: undefined,
                message: "EnterNumberFraction 2",
                target: oControl.getId() + "/value",
                type: "Error"
            }]).expectValue("price", "1.234 EUR");
        TestUtils.withNormalizedMessages(function () {
            oControl.setValue("1.234 EUR");
        });
        return that.waitForChanges(assert);
    }).then(function () {
        return that.checkValueState(assert, that.oView.byId("price"), "Error", "EnterNumberFraction 2");
    });
});
QUnit.skip("OData Currency type with showNumber and showMeasure", function (assert) {
    var oAmountControl, oCurrencyControl, oModel = createModel("/sap/opu/odata/sap/ZUI5_GWSAMPLE_BASIC?foo=baz", {
        defaultBindingMode: "TwoWay",
        tokenHandling: false
    }), sView = "<FlexBox binding=\"{/ProductSet('P1')}\">\t<Input id=\"amount\" value=\"{\t\tparts : [{\t\t\tconstraints : {scale : 'variable'},\t\t\tpath : 'Price',\t\t\ttype : 'sap.ui.model.odata.type.Decimal'\t\t}, {\t\t\tpath : 'CurrencyCode',\t\t\ttype : 'sap.ui.model.odata.type.String'\t\t}, {\t\t\tmode : 'OneTime',\t\t\tpath : '/##@@requestCurrencyCodes',\t\t\ttargetType : 'any'\t\t}],\t\tformatOptions : {emptyString : null, showMeasure : false},\t\tmode : 'TwoWay',\t\ttype : 'sap.ui.model.odata.type.Currency'\t}\" />\t<Input id=\"currency\" value=\"{\t\tparts : [{\t\t\tconstraints : {scale : 'variable'},\t\t\tpath : 'Price',\t\t\ttype : 'sap.ui.model.odata.type.Decimal'\t\t}, {\t\t\tpath : 'CurrencyCode',\t\t\ttype : 'sap.ui.model.odata.type.String'\t\t}, {\t\t\tmode : 'OneTime',\t\t\tpath : '/##@@requestCurrencyCodes',\t\t\ttargetType : 'any'\t\t}],\t\tformatOptions : {emptyString : null, showNumber : false},\t\tmode : 'TwoWay',\t\ttype : 'sap.ui.model.odata.type.Currency'\t}\" />\t<Text id=\"price\" text=\"{\t\tparts : [{\t\t\tconstraints : {scale : 'variable'},\t\t\tpath : 'Price',\t\t\ttype : 'sap.ui.model.odata.type.Decimal'\t\t}, {\t\t\tpath : 'CurrencyCode',\t\t\ttype : 'sap.ui.model.odata.type.String'\t\t}, {\t\t\tmode : 'OneTime',\t\t\tpath : '/##@@requestCurrencyCodes',\t\t\ttargetType : 'any'\t\t}],\t\tmode : 'TwoWay',\t\ttype : 'sap.ui.model.odata.type.Currency'\t}\" /></FlexBox>", that = this;
    this.expectRequest("ProductSet('P1')?foo=baz", {
        ProductID: "P1",
        Price: "12.3",
        CurrencyCode: "EUR"
    }).expectRequest("SAP__Currencies?foo=baz&$skip=0&$top=5000", {
        results: [{
                CurrencyCode: "EUR",
                DecimalPlaces: 2,
                ISOCode: "EUR",
                Text: "Euro"
            }]
    }).expectValue("amount", "12.30").expectValue("currency", "EUR").expectValue("price", "12.30\u00A0EUR");
    return this.createView(assert, sView, oModel).then(function () {
        oAmountControl = that.oView.byId("amount");
        oCurrencyControl = that.oView.byId("currency");
        that.expectValue("amount", "").expectValue("price", "");
        oAmountControl.setValue("");
        return Promise.all([
            that.waitForChanges(assert),
            that.checkValueState(assert, oAmountControl, "None", ""),
            that.checkValueState(assert, oCurrencyControl, "None", "")
        ]);
    }).then(function () {
        that.expectValue("amount", "12.00").expectValue("amount", "12.00").expectValue("price", "12.00\u00A0EUR");
        oAmountControl.setValue("12");
        return Promise.all([
            that.waitForChanges(assert),
            that.checkValueState(assert, oAmountControl, "None", ""),
            that.checkValueState(assert, oCurrencyControl, "None", "")
        ]);
    }).then(function () {
        that.expectValue("currency", "").expectValue("price", "12.00");
        oCurrencyControl.setValue("");
        return Promise.all([
            that.waitForChanges(assert),
            that.checkValueState(assert, oAmountControl, "None", ""),
            that.checkValueState(assert, oCurrencyControl, "None", "")
        ]);
    }).then(function () {
        that.expectValue("amount", "98.70").expectValue("amount", "98.70").expectValue("price", "98.70");
        oAmountControl.setValue("98.7");
        return Promise.all([
            that.waitForChanges(assert),
            that.checkValueState(assert, oAmountControl, "None", ""),
            that.checkValueState(assert, oCurrencyControl, "None", "")
        ]);
    });
});
QUnit.skip("OData Unit type with showNumber and showMeasure", function (assert) {
    var oMeasureControl, oUnitControl, oModel = createModel("/sap/opu/odata/sap/ZUI5_GWSAMPLE_BASIC?foo=baz", {
        defaultBindingMode: "TwoWay",
        tokenHandling: false
    }), sView = "<FlexBox binding=\"{/ProductSet('P1')}\">\t<Input id=\"measure\" value=\"{\t\tparts : [{\t\t\tconstraints : {scale : 'variable'},\t\t\tpath : 'WeightMeasure',\t\t\ttype : 'sap.ui.model.odata.type.Decimal'\t\t}, {\t\t\tpath : 'WeightUnit',\t\t\ttype : 'sap.ui.model.odata.type.String'\t\t}, {\t\t\tmode : 'OneTime',\t\t\tpath : '/##@@requestUnitsOfMeasure',\t\t\ttargetType : 'any'\t\t}],\t\tformatOptions : {emptyString : null, showMeasure : false},\t\tmode : 'TwoWay',\t\ttype : 'sap.ui.model.odata.type.Unit'\t}\" />\t<Input id=\"unit\" value=\"{\t\tparts : [{\t\t\tconstraints : {scale : 'variable'},\t\t\tpath : 'WeightMeasure',\t\t\ttype : 'sap.ui.model.odata.type.Decimal'\t\t}, {\t\t\tpath : 'WeightUnit',\t\t\ttype : 'sap.ui.model.odata.type.String'\t\t}, {\t\t\tmode : 'OneTime',\t\t\tpath : '/##@@requestUnitsOfMeasure',\t\t\ttargetType : 'any'\t\t}],\t\tformatOptions : {emptyString : null, showNumber : false},\t\tmode : 'TwoWay',\t\ttype : 'sap.ui.model.odata.type.Unit'\t}\" />\t<Text id=\"weight\" text=\"{\t\tparts : [{\t\t\tconstraints : {scale : 'variable'},\t\t\tpath : 'WeightMeasure',\t\t\ttype : 'sap.ui.model.odata.type.Decimal'\t\t}, {\t\t\tpath : 'WeightUnit',\t\t\ttype : 'sap.ui.model.odata.type.String'\t\t}, {\t\t\tmode : 'OneTime',\t\t\tpath : '/##@@requestUnitsOfMeasure',\t\t\ttargetType : 'any'\t\t}],\t\tmode : 'TwoWay',\t\ttype : 'sap.ui.model.odata.type.Unit'\t}\" /></FlexBox>", that = this;
    this.expectRequest("ProductSet('P1')?foo=baz", {
        ProductID: "P1",
        WeightMeasure: "12.34",
        WeightUnit: "KG"
    }).expectRequest("SAP__UnitsOfMeasure?foo=baz&$skip=0&$top=5000", {
        results: [{
                DecimalPlaces: 3,
                ExternalCode: "KG",
                ISOCode: "KGM",
                Text: "Kilogramm",
                UnitCode: "KG"
            }]
    }).expectValue("measure", "12.340").expectValue("unit", "KG").expectValue("weight", "12.340 KG");
    return this.createView(assert, sView, oModel).then(function () {
        oMeasureControl = that.oView.byId("measure");
        oUnitControl = that.oView.byId("unit");
        that.expectValue("measure", "").expectValue("weight", "");
        oMeasureControl.setValue("");
        return Promise.all([
            that.waitForChanges(assert),
            that.checkValueState(assert, oMeasureControl, "None", ""),
            that.checkValueState(assert, oUnitControl, "None", "")
        ]);
    }).then(function () {
        that.expectValue("measure", "12.000").expectValue("measure", "12.000").expectValue("weight", "12.000 KG");
        oMeasureControl.setValue("12");
        return Promise.all([
            that.waitForChanges(assert),
            that.checkValueState(assert, oMeasureControl, "None", ""),
            that.checkValueState(assert, oUnitControl, "None", "")
        ]);
    }).then(function () {
        that.expectValue("measure", "12").expectValue("unit", "").expectValue("weight", "12");
        oUnitControl.setValue("");
        return Promise.all([
            that.waitForChanges(assert),
            that.checkValueState(assert, oMeasureControl, "None", ""),
            that.checkValueState(assert, oUnitControl, "None", "")
        ]);
    }).then(function () {
        that.expectValue("measure", "98.7").expectValue("weight", "98.7");
        oMeasureControl.setValue("98.7");
        return Promise.all([
            that.waitForChanges(assert),
            that.checkValueState(assert, oMeasureControl, "None", ""),
            that.checkValueState(assert, oUnitControl, "None", "")
        ]);
    });
});
QUnit.test("TwoFieldSolution: Invalid currency input is kept in control", function (assert) {
    var oControl, oModel = new JSONModel({
        Amount: null,
        Currency: null,
        customCurrencies: {
            EUR: {
                StandardCode: "EUR",
                UnitSpecificScale: 2
            }
        }
    }), sView = "<Input id=\"currency\" value=\"{\tparts : [{\t\tconstraints : {scale : 'variable'},\t\tpath : '/Amount',\t\ttype : 'sap.ui.model.odata.type.Decimal'\t}, {\t\tpath : '/Currency',\t\ttype : 'sap.ui.model.odata.type.String'\t}, {\t\tmode : 'OneTime',\t\tpath : '/customCurrencies',\t\ttargetType : 'any'\t}],\tformatOptions : {showNumber : false},\tmode : 'TwoWay',\ttype : 'sap.ui.model.odata.type.Currency'}\" />", that = this;
    return this.createView(assert, sView, oModel).then(function () {
        oControl = that.oView.byId("currency");
        that.expectValue("currency", "EUR");
        oControl.setValue("EUR");
        return Promise.all([
            that.checkValueState(assert, "currency", "None", ""),
            that.waitForChanges(assert)
        ]);
    }).then(function () {
        that.expectValue("currency", "foo").expectMessages([{
                descriptionUrl: undefined,
                message: "Currency.InvalidMeasure",
                target: oControl.getId() + "/value",
                type: "Error"
            }]);
        TestUtils.withNormalizedMessages(function () {
            oControl.setValue("foo");
        });
        return Promise.all([
            that.checkValueState(assert, "currency", "Error", "Currency.InvalidMeasure"),
            that.waitForChanges(assert)
        ]);
    }).then(function () {
        that.expectValue("currency", "EUR").expectMessages([]);
        oControl.setValue("EUR");
        return Promise.all([
            that.checkValueState(assert, "currency", "None", ""),
            that.waitForChanges(assert)
        ]);
    });
});
QUnit.test("createEntry: update deep path of created context", function (assert) {
    var oCreatedContext, oModel = createSalesOrdersModel(), sView = "<FlexBox id=\"productDetails\" binding=\"{ToProduct}\">\t<Text id=\"productName\" text=\"{Name}\" /></FlexBox>", that = this;
    return this.createView(assert, sView, oModel).then(function () {
        that.expectHeadRequest().expectRequest({
            created: true,
            data: {
                __metadata: {
                    type: "GWSAMPLE_BASIC.SalesOrderLineItem"
                }
            },
            deepPath: "/SalesOrderSet('1')/ToLineItems('~key~')",
            method: "POST",
            requestUri: "SalesOrderSet('1')/ToLineItems"
        }, {
            data: {
                __metadata: {
                    uri: "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10')"
                },
                ItemPosition: "10",
                SalesOrderID: "1"
            },
            statusCode: 201
        });
        oCreatedContext = oModel.createEntry("/SalesOrderSet('1')/ToLineItems", {
            properties: {}
        });
        oModel.submitChanges();
        return that.waitForChanges(assert);
    }).then(function () {
        that.expectRequest({
            deepPath: "/SalesOrderSet('1')" + "/ToLineItems(SalesOrderID='1',ItemPosition='10')/ToProduct",
            requestUri: "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10')" + "/ToProduct"
        }, {
            __metadata: {
                uri: "ProductSet('P1')"
            },
            Name: "Product 1"
        }).expectValue("productName", "Product 1");
        that.oView.byId("productDetails").setBindingContext(oCreatedContext);
        return that.waitForChanges(assert);
    });
});
QUnit.test("Messages: avoid duplicate messages using ContentID", function (assert) {
    var oModel = createSalesOrdersModel({
        defaultBindingMode: BindingMode.TwoWay,
        refreshAfterChange: false,
        tokenHandling: false
    }), sView = "<t:Table id=\"table\" rows=\"{/SalesOrderSet('1')/ToLineItems}\" visibleRowCount=\"2\">\t<Input id=\"note\" value=\"{Note}\" /></t:Table>", that = this;
    this.expectRequest("SalesOrderSet('1')/ToLineItems?$skip=0&$top=102", {
        results: [{
                __metadata: {
                    uri: "/SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10')"
                },
                ItemPosition: "10",
                Note: "Note 10",
                SalesOrderID: "1"
            }, {
                __metadata: {
                    uri: "/SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='20')"
                },
                ItemPosition: "20",
                Note: "Note 20",
                SalesOrderID: "1"
            }]
    }).expectValue("note", ["Note 10", "Note 20"]);
    return this.createView(assert, sView, oModel).then(function () {
        that.expectRequest({
            data: {
                __metadata: {
                    uri: "/SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10')"
                },
                Note: "foo"
            },
            deepPath: "/SalesOrderSet('1')" + "/ToLineItems(SalesOrderID='1',ItemPosition='10')",
            headers: { "Content-ID": "~key~" },
            key: "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10')",
            method: "MERGE",
            requestUri: "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10')"
        }, {
            body: JSON.stringify({
                error: {
                    code: "UF0",
                    innererror: { errordetails: [{
                                code: "UF0",
                                ContentID: "~key~",
                                message: "value not allowed",
                                severity: "error",
                                target: "Note",
                                transition: true
                            }] },
                    message: { value: "value not allowed" }
                }
            }),
            headers: {
                "Content-Type": "application/json;charset=utf-8",
                ContentID: "~key~"
            },
            statusCode: 400,
            statusText: "Bad Request"
        }).expectRequest({
            data: {
                __metadata: {
                    uri: "/SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='20')"
                },
                Note: "bar"
            },
            deepPath: "/SalesOrderSet('1')" + "/ToLineItems(SalesOrderID='1',ItemPosition='20')",
            headers: { "Content-ID": "~key~" },
            key: "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='20')",
            method: "MERGE",
            requestUri: "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='20')"
        }, undefined).expectValue("note", ["foo", "bar"]).expectMessages([{
                fullTarget: "/SalesOrderSet('1')/ToLineItems(SalesOrderID='1',ItemPosition='10')/Note",
                target: "/SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10')/Note",
                code: "UF0",
                message: "value not allowed",
                persistent: true,
                technical: true,
                type: "Error"
            }]);
        that.oView.byId("table").getRows()[0].getCells()[0].setValue("foo");
        that.oView.byId("table").getRows()[1].getCells()[0].setValue("bar");
        that.oLogMock.expects("error").withExactArgs("Request failed with status code 400: MERGE " + "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10')", sinon.match.string, sODataMessageParserClassName);
        that.oLogMock.expects("error").withExactArgs("Request failed with status code 400: MERGE " + "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='20')", "Another request in the same change set failed", sODataMessageParserClassName);
        oModel.submitChanges();
        return that.waitForChanges(assert);
    });
});
QUnit.test("Composite Binding: Value state updated after binding removal", function (assert) {
    var oModel = new JSONModel({
        RequestedQuantity: "-1",
        RequestedQuantityUnit: "mass-kilogram"
    }), sView = "<Input id=\"quantity\" value=\"{\t\tformatOptions : {showMeasure : false},\t\tparts : [{\t\t\tpath : '/RequestedQuantity',\t\t\ttype : 'sap.ui.model.odata.type.Decimal'\t\t}, {\t\t\tpath : 'RequestedQuantityUnit',\t\t\ttype : 'sap.ui.model.odata.type.String'\t\t}],\t\ttype : 'sap.ui.model.type.Unit'\t}\" />", that = this;
    this.expectValue("quantity", "-1");
    return this.createView(assert, sView, oModel).then(function () {
        that.expectMessages([{
                descriptionUrl: undefined,
                message: "Some message",
                target: "/RequestedQuantity",
                type: "Error"
            }]);
        sap.ui.getCore().getMessageManager().addMessages(new Message({
            message: "Some message",
            processor: oModel,
            target: "/RequestedQuantity",
            type: "Error"
        }));
        return Promise.all([
            that.checkValueState(assert, "quantity", "Error", "Some message"),
            that.waitForChanges(assert)
        ]);
    }).then(function () {
        that.expectValue("quantity", "");
        that.oView.byId("quantity").unbindProperty("value");
        return Promise.all([
            that.checkValueState(assert, "quantity", "None", ""),
            that.waitForChanges(assert)
        ]);
    });
});
QUnit.test("ODLB#getCount returns final count", function (assert) {
    var oModel = createSalesOrdersModel(), sView = "<Table id=\"table\" items=\"{/SalesOrderSet}\">\t<Text id=\"id\" text=\"{SalesOrderID}\" /></Table>", that = this;
    this.expectHeadRequest().expectRequest("SalesOrderSet?$skip=0&$top=100", {
        results: [
            { SalesOrderID: "0500000001" },
            { SalesOrderID: "0500000002" }
        ]
    }).expectValue("id", ["0500000001", "0500000002"]);
    return this.createView(assert, sView, oModel).then(function () {
        assert.strictEqual(that.oView.byId("table").getBinding("items").getCount(), 2);
    });
});
QUnit.test("ODLB: transient context, no request", function (assert) {
    var oCreatedContext, sView = "<FlexBox id=\"objectPage\">\t<Text id=\"salesOrderId\" text=\"{SalesOrderID}\" />\t<t:Table id=\"table\" rows=\"{ToLineItems}\" visibleRowCount=\"2\">\t\t<Text id=\"itemPosition\" text=\"{ItemPosition}\" />\t</t:Table></FlexBox>", that = this;
    this.expectValue("itemPosition", ["", ""]);
    return this.createView(assert, sView).then(function () {
        that.expectValue("salesOrderId", "42");
        oCreatedContext = that.oModel.createEntry("/SalesOrderSet", { properties: { SalesOrderID: "42" } });
        that.oView.byId("objectPage").bindElement({ path: oCreatedContext.getPath() });
        return that.waitForChanges(assert);
    }).then(function () {
        that.expectHeadRequest().expectRequest("SalesOrderSet('1')", {
            Note: "Note 1",
            SalesOrderID: "1"
        }).expectRequest("SalesOrderSet('1')/ToLineItems?$skip=0&$top=102", {
            results: [{
                    __metadata: {
                        uri: "/SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10')"
                    },
                    ItemPosition: "10",
                    SalesOrderID: "1"
                }, {
                    __metadata: {
                        uri: "/SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='20')"
                    },
                    ItemPosition: "20",
                    SalesOrderID: "1"
                }]
        }).expectValue("salesOrderId", "1").expectValue("itemPosition", ["10", "20"]);
        that.oView.byId("objectPage").bindElement({ path: "/SalesOrderSet('1')" });
        return that.waitForChanges(assert);
    }).then(function () {
        that.expectValue("salesOrderId", "4711").expectValue("itemPosition", ["", ""]);
        oCreatedContext = that.oModel.createEntry("/SalesOrderSet", { properties: { SalesOrderID: "4711" } });
        that.oView.byId("objectPage").bindElement({ path: oCreatedContext.getPath() });
        return that.waitForChanges(assert);
    });
});
QUnit.test("ODCB: transient context, no request", function (assert) {
    var oCreatedContext, sView = "<FlexBox id=\"salesOrder\">\t<Text id=\"salesOrderId\" text=\"{SalesOrderID}\" />\t<FlexBox id=\"businessPartner\" binding=\"{ToBusinessPartner}\">\t\t<Text id=\"businessPartnerId\" text=\"{BusinessPartnerID}\" />\t</FlexBox></FlexBox>", that = this;
    return this.createView(assert, sView).then(function () {
        that.expectValue("salesOrderId", "42");
        oCreatedContext = that.oModel.createEntry("/SalesOrderSet", { properties: { SalesOrderID: "42" } });
        that.oView.byId("salesOrder").bindElement({ path: oCreatedContext.getPath() });
        return that.waitForChanges(assert);
    }).then(function () {
        that.expectHeadRequest().expectRequest("SalesOrderSet('1')", {
            SalesOrderID: "1"
        }).expectRequest("SalesOrderSet('1')/ToBusinessPartner", {
            __metadata: { uri: "/BusinessPartnerSet('BP1')" },
            BusinessPartnerID: "A"
        }).expectValue("salesOrderId", "1").expectValue("businessPartnerId", "A");
        that.oView.byId("salesOrder").bindElement({ path: "/SalesOrderSet('1')" });
        return that.waitForChanges(assert);
    }).then(function () {
        that.expectValue("salesOrderId", "4711").expectValue("businessPartnerId", "");
        oCreatedContext = that.oModel.createEntry("/SalesOrderSet", { properties: { SalesOrderID: "4711" } });
        that.oView.byId("salesOrder").bindElement({ path: oCreatedContext.getPath() });
        return that.waitForChanges(assert);
    });
});
QUnit.test("ODataListBinding paging and gap calculation", function (assert) {
    var oModel = createSalesOrdersModel({ defaultCountMode: CountMode.Inline }), oTable, sView = "<t:Table id=\"table\" rows=\"{/SalesOrderSet}\" threshold=\"10\" visibleRowCount=\"2\">\t<Text id=\"textId\" text=\"{SalesOrderID}\" /></t:Table>", that = this;
    function getItems(iStart, iLength) {
        var i, aItems = [];
        for (i = 0; i < iLength; i += 1) {
            aItems.push({
                __metadata: {
                    uri: "/sap/opu/odata/sap/ZUI5_GWSAMPLE_BASIC/SalesOrderSet" + "('" + iStart + "')"
                },
                SalesOrderID: "ID " + iStart
            });
            iStart += 1;
        }
        return aItems;
    }
    this.expectHeadRequest().expectRequest("SalesOrderSet?$skip=0&$top=12&$inlinecount=allpages", {
        __count: "550",
        results: getItems(0, 12)
    }).expectValue("textId", "ID 0", 0).expectValue("textId", "ID 1", 1);
    return this.createView(assert, sView, oModel).then(function () {
        oTable = that.oView.byId("table");
        that.expectRequest("SalesOrderSet?$skip=12&$top=6", {
            results: getItems(12, 6)
        }).expectValue("textId", "ID 6", 6).expectValue("textId", "ID 7", 7);
        oTable.setFirstVisibleRow(6);
        return that.waitForChanges(assert);
    }).then(function () {
        that.expectValue("textId", "ID 11", 11).expectValue("textId", "ID 12", 12);
        oTable.setFirstVisibleRow(11);
        return that.waitForChanges(assert);
    }).then(function () {
        that.expectRequest("SalesOrderSet?$skip=90&$top=22", {
            results: getItems(90, 22)
        }).expectValue("textId", "", 100).expectValue("textId", "", 101).expectValue("textId", "ID 100", 100).expectValue("textId", "ID 101", 101);
        oTable.setFirstVisibleRow(100);
        return that.waitForChanges(assert);
    }).then(function () {
        that.expectValue("textId", "ID 95", 95).expectValue("textId", "ID 96", 96);
        oTable.setFirstVisibleRow(95);
        return that.waitForChanges(assert);
    }).then(function () {
        that.expectRequest("SalesOrderSet?$skip=84&$top=6", {
            results: getItems(84, 6)
        }).expectValue("textId", "ID 94", 94).expectValue("textId", "ID 95", 95);
        oTable.setFirstVisibleRow(94);
        return that.waitForChanges(assert);
    });
});
QUnit.test("createEntry: Context#created fulfills", function (assert) {
    var oCreatedContext, oModel = createSalesOrdersModel(), sView = "<FlexBox id=\"salesOrder\">\t<Text id=\"salesOrderID\" text=\"{SalesOrderID}\" /></FlexBox>", that = this;
    return this.createView(assert, sView, oModel).then(function () {
        that.expectHeadRequest().expectRequest({
            created: true,
            data: {
                __metadata: {
                    type: "GWSAMPLE_BASIC.SalesOrder"
                }
            },
            deepPath: "/SalesOrderSet('~key~')",
            method: "POST",
            requestUri: "SalesOrderSet"
        }, {
            data: {
                __metadata: {
                    uri: "SalesOrderSet('42')"
                },
                SalesOrderID: "42"
            },
            statusCode: 201
        });
        oCreatedContext = oModel.createEntry("/SalesOrderSet", { properties: {} });
        oModel.submitChanges();
        return Promise.all([
            that.waitForChanges(assert),
            oCreatedContext.created()
        ]);
    }).then(function () {
        that.expectValue("salesOrderID", "42");
        that.oView.byId("salesOrder").bindElement({
            path: oCreatedContext.getPath(),
            parameters: { select: "SalesOrderID" }
        });
        return that.waitForChanges(assert);
    });
});
QUnit.test("createEntry: Context#created pending, then rejects", function (assert) {
    var oCreatedContext, oModel = createSalesOrdersModel(), sView = "<FlexBox id=\"salesOrder\">\t<Text id=\"salesOrderID\" text=\"{SalesOrderID}\" /></FlexBox>", that = this;
    return this.createView(assert, sView, oModel).then(function () {
        that.expectHeadRequest().expectRequest({
            created: true,
            data: {
                SalesOrderID: "draftID",
                __metadata: {
                    type: "GWSAMPLE_BASIC.SalesOrder"
                }
            },
            deepPath: "/SalesOrderSet('~key~')",
            method: "POST",
            requestUri: "SalesOrderSet"
        }, createErrorResponse({ message: "POST failed", statusCode: 400 })).expectMessages([{
                code: "UF0",
                descriptionUrl: "",
                fullTarget: "/SalesOrderSet('~key~')",
                message: "POST failed",
                persistent: false,
                target: "/SalesOrderSet('~key~')",
                technical: true,
                type: "Error"
            }]);
        oCreatedContext = oModel.createEntry("/SalesOrderSet", { properties: {
                SalesOrderID: "draftID"
            } });
        that.oLogMock.expects("error").withExactArgs("Request failed with status code 400: POST SalesOrderSet", sinon.match.string, sODataMessageParserClassName);
        oModel.submitChanges();
        return that.waitForChanges(assert);
    }).then(function () {
        that.expectValue("salesOrderID", "draftID");
        that.oView.byId("salesOrder").bindElement({
            path: oCreatedContext.getPath(),
            parameters: { select: "SalesOrderID" }
        });
        return that.waitForChanges(assert);
    }).then(function () {
        var pCreated = oCreatedContext.created();
        that.expectValue("salesOrderID", "").expectMessages([]);
        oModel.resetChanges([oCreatedContext.getPath()], undefined, true);
        return Promise.all([
            that.waitForChanges(assert),
            pCreated.then(function () {
                assert.ok(false, "unexpected success");
            }, function (oError) {
                assert.strictEqual(oError.aborted, true);
            })
        ]);
    });
});
QUnit.test("createEntry: create - reset - modify - 'hard' reset", function (assert) {
    var pCreated, oCreatedContext, bResolved, oModel = createSalesOrdersModel(), that = this;
    return this.createView(assert, "", oModel).then(function () {
        oCreatedContext = oModel.createEntry("/SalesOrderSet", { properties: {
                SalesOrderID: "draftID"
            } });
        pCreated = oCreatedContext.created().catch(function (oError) {
            bResolved = true;
            throw oError;
        });
        oModel.resetChanges([oCreatedContext.getPath()]);
        oModel.submitChanges();
        return that.waitForChanges(assert);
    }).then(function () {
        assert.notOk(bResolved);
        oModel.setProperty(oCreatedContext.getPath() + "/Note", "Foo");
        oModel.resetChanges([oCreatedContext.getPath()], undefined, true);
        return Promise.all([
            pCreated.then(function () {
                assert.ok(false, "unexpected success");
            }, function (oError) {
                assert.strictEqual(oError.aborted, true);
            }),
            that.waitForChanges(assert)
        ]);
    });
});
QUnit.test("All pairs test for multi create (1)", function (assert) {
    var oBinding, oCreatedContext0, oCreatedContext1, oTable, oModel = createSalesOrdersModel(), sView = "<t:Table id=\"table\" rows=\"{/SalesOrderSet}\" visibleRowCount=\"5\">\t<Text id=\"id\" text=\"{SalesOrderID}\"/>\t<Text id=\"note\" text=\"{Note}\"/></t:Table>", that = this;
    this.expectHeadRequest().expectRequest("SalesOrderSet?$skip=0&$top=105", {
        results: [{
                __metadata: { uri: "SalesOrderSet('42')" },
                Note: "First SalesOrder",
                SalesOrderID: "42"
            }]
    }).expectValue("id", ["42", "", "", "", ""]).expectValue("note", ["First SalesOrder", "", "", "", ""]);
    return this.createView(assert, sView, oModel).then(function () {
        oTable = that.oView.byId("table");
        oBinding = oTable.getBinding("rows");
        that.expectValue("id", ["", "42"]).expectValue("note", ["New 1", "First SalesOrder"]);
        oCreatedContext0 = oBinding.create({ Note: "New 1" }, false);
        return that.waitForChanges(assert);
    }).then(function () {
        that.expectRequest({
            created: true,
            data: {
                __metadata: { type: "GWSAMPLE_BASIC.SalesOrder" },
                Note: "New 1"
            },
            method: "POST",
            requestUri: "SalesOrderSet"
        }, {
            data: {
                __metadata: { uri: "SalesOrderSet('43')" },
                Note: "New 1",
                SalesOrderID: "43"
            },
            statusCode: 201
        }).expectValue("id", ["43"]);
        return Promise.all([
            oCreatedContext0.created(),
            that.oModel.submitChanges(),
            that.waitForChanges(assert)
        ]);
    }).then(function () {
        that.expectValue("id", ["", "43", "42"]).expectValue("note", ["New 2", "New 1", "First SalesOrder"]);
        oCreatedContext1 = oBinding.create({ Note: "New 2" }, false);
        return that.waitForChanges(assert);
    }).then(function () {
        that.expectRequest({
            created: true,
            data: {
                __metadata: { type: "GWSAMPLE_BASIC.SalesOrder" },
                Note: "New 2"
            },
            deepPath: "/SalesOrderSet('~key~')",
            method: "POST",
            requestUri: "SalesOrderSet"
        }, createErrorResponse({ message: "POST failed", statusCode: 400 })).expectMessages([{
                code: "UF0",
                descriptionUrl: "",
                fullTarget: "/SalesOrderSet('~key~')",
                message: "POST failed",
                persistent: false,
                target: "/SalesOrderSet('~key~')",
                technical: true,
                type: "Error"
            }]);
        that.oLogMock.expects("error").withExactArgs("Request failed with status code 400: POST SalesOrderSet", sinon.match.string, sODataMessageParserClassName);
        oModel.submitChanges();
        return that.waitForChanges(assert);
    }).then(function () {
        that.expectValue("id", ["", "43", "42"], 1).expectValue("note", ["New 3", "New 2", "New 1", "First SalesOrder"]);
        oBinding.create({ Note: "New 3" }, false);
        return that.waitForChanges(assert);
    }).then(function () {
        that.expectMessages([]).expectValue("note", [""], 1).expectValue("id", ["43", "42", ""], 1).expectValue("note", ["New 1", "First SalesOrder", ""], 1);
        oModel.resetChanges([oCreatedContext1.getPath()], undefined, true);
        return that.waitForChanges(assert);
    }).then(function () {
        assert.strictEqual(oBinding.getCount(), 3, "number of contexts");
    });
});
QUnit.skip("All pairs test for multi create (2)", function (assert) {
    var oBinding, oCreatedContext0, oCreatedContext1, oTable, oModel = createSalesOrdersModel(), sView = "<Table id=\"table\" growing=\"true\" items=\"{/SalesOrderSet}\">\t<Text id=\"id\" text=\"{SalesOrderID}\"/>\t<Text id=\"note\" text=\"{Note}\"/></Table>", that = this;
    oModel.setDeferredGroups(["changes", "deleteGroup"]);
    this.expectHeadRequest().expectRequest("SalesOrderSet?$skip=0&$top=20", {
        results: [{
                __metadata: { uri: "SalesOrderSet('42')" },
                Note: "First SalesOrder",
                SalesOrderID: "42"
            }]
    }).expectValue("id", ["42"]).expectValue("note", ["First SalesOrder"]);
    return this.createView(assert, sView, oModel).then(function () {
        oTable = that.oView.byId("table");
        oBinding = oTable.getBinding("items");
        that.expectValue("id", ["", "42"]).expectValue("note", ["New 1", "First SalesOrder"]);
        oCreatedContext0 = oBinding.create({ Note: "New 1" }, false);
        return that.waitForChanges(assert);
    }).then(function () {
        that.expectValue("id", ["", "", "42"]).expectValue("note", ["New 2", "New 1", "First SalesOrder"]);
        oCreatedContext1 = oBinding.create({ Note: "New 2" }, false);
        return that.waitForChanges(assert);
    }).then(function () {
        that.expectRequest({
            created: true,
            data: {
                __metadata: { type: "GWSAMPLE_BASIC.SalesOrder" },
                Note: "New 1"
            },
            method: "POST",
            requestUri: "SalesOrderSet"
        }, {
            data: {
                __metadata: { uri: "SalesOrderSet('43')" },
                Note: "New 1",
                SalesOrderID: "43"
            },
            statusCode: 201
        }).expectRequest({
            created: true,
            data: {
                __metadata: { type: "GWSAMPLE_BASIC.SalesOrder" },
                Note: "New 2"
            },
            method: "POST",
            requestUri: "SalesOrderSet"
        }, {
            data: {
                __metadata: { uri: "SalesOrderSet('44')" },
                Note: "New 2",
                SalesOrderID: "44"
            },
            statusCode: 201
        }).expectValue("id", ["44", "43"]);
        return Promise.all([
            oCreatedContext0.created(),
            oCreatedContext1.created(),
            that.oModel.submitChanges(),
            that.waitForChanges(assert)
        ]);
    }).then(function () {
        that.expectValue("id", ["", "44", "43", "42"]).expectValue("note", ["New 3", "New 2", "New 1", "First SalesOrder"]);
        oBinding.create({ Note: "New 3" }, false);
        return that.waitForChanges(assert);
    }).then(function () {
        that.expectRequest({
            deepPath: "/SalesOrderSet('44')",
            method: "DELETE",
            requestUri: "SalesOrderSet('44')"
        }, {}).expectRequest("SalesOrderSet?$skip=0&$top=17" + "&$filter=not(SalesOrderID eq '44' or SalesOrderID eq '43')", {
            results: [{
                    __metadata: { uri: "SalesOrderSet('42')" },
                    Note: "First SalesOrder",
                    SalesOrderID: "42"
                }]
        }).expectValue("id", [""], 1).expectValue("note", [""], 1).expectValue("id", ["43", "42"], 1).expectValue("note", ["New 1", "First SalesOrder"], 1);
        oModel.remove("", {
            groupId: "deleteGroup",
            context: oCreatedContext1,
            refreshAfterChange: true
        });
        oModel.submitChanges({ groupId: "deleteGroup" });
        return that.waitForChanges(assert);
    }).then(function () {
        assert.strictEqual(oBinding.getCount(), 3, "number of contexts");
        assert.strictEqual(oTable.getItems().length, 3, "number of table items");
    });
});
QUnit.test("All pairs test for multi create (3)", function (assert) {
    var oBinding, oCreatedContext1, oTable, oModel = createSalesOrdersModel(), sView = "<t:Table id=\"table\" rows=\"{/SalesOrderSet}\" visibleRowCount=\"5\">\t<Text id=\"id\" text=\"{SalesOrderID}\"/>\t<Text id=\"note\" text=\"{Note}\"/></t:Table>", that = this;
    this.expectHeadRequest().expectRequest("SalesOrderSet?$skip=0&$top=105", {
        results: [{
                __metadata: { uri: "SalesOrderSet('42')" },
                Note: "First SalesOrder",
                SalesOrderID: "42"
            }]
    }).expectValue("id", ["42", "", "", "", ""]).expectValue("note", ["First SalesOrder", "", "", "", ""]);
    return this.createView(assert, sView, oModel).then(function () {
        oTable = that.oView.byId("table");
        oBinding = oTable.getBinding("rows");
        that.expectValue("id", ["", "42"]).expectValue("note", ["New 1", "First SalesOrder"]);
        oBinding.create({ Note: "New 1" }, false);
        return that.waitForChanges(assert);
    }).then(function () {
        that.expectValue("id", ["", "42"], 1).expectValue("note", ["New 2", "New 1", "First SalesOrder"]);
        oCreatedContext1 = oBinding.create({ Note: "New 2" }, false);
        return that.waitForChanges(assert);
    }).then(function () {
        that.expectRequest({
            created: true,
            data: {
                __metadata: { type: "GWSAMPLE_BASIC.SalesOrder" },
                Note: "New 1"
            },
            deepPath: "/SalesOrderSet('~key~')",
            method: "POST",
            requestUri: "SalesOrderSet"
        }, createErrorResponse({ message: "POST failed", statusCode: 400 })).expectRequest({
            created: true,
            data: {
                __metadata: { type: "GWSAMPLE_BASIC.SalesOrder" },
                Note: "New 2"
            },
            deepPath: "/SalesOrderSet('~key~')",
            method: "POST",
            requestUri: "SalesOrderSet"
        }).expectMessages([{
                code: "UF0",
                descriptionUrl: "",
                fullTarget: "/SalesOrderSet('~key~')",
                message: "POST failed",
                persistent: false,
                target: "/SalesOrderSet('~key~')",
                technical: true,
                type: "Error"
            }, {
                code: "UF0",
                descriptionUrl: "",
                fullTarget: "/SalesOrderSet('~key~')",
                message: "POST failed",
                persistent: false,
                target: "/SalesOrderSet('~key~')",
                technical: true,
                type: "Error"
            }]);
        that.oLogMock.expects("error").withExactArgs("Request failed with status code 400: POST SalesOrderSet", sinon.match.string, sODataMessageParserClassName).exactly(2);
        oModel.submitChanges();
        return that.waitForChanges(assert);
    }).then(function () {
        that.expectValue("id", ["", "42"], 2).expectValue("note", ["New 3", "New 2", "New 1", "First SalesOrder"]);
        oBinding.create({ Note: "New 3" }, false);
        return that.waitForChanges(assert);
    }).then(function () {
        that.expectMessages([{
                code: "UF0",
                descriptionUrl: "",
                fullTarget: "/SalesOrderSet('~key~')",
                message: "POST failed",
                persistent: false,
                target: "/SalesOrderSet('~key~')",
                technical: true,
                type: "Error"
            }]).expectValue("note", [""], 1).expectValue("id", ["42", ""], 2).expectValue("note", ["New 1", "First SalesOrder", ""], 1);
        oModel.resetChanges([oCreatedContext1.getPath()], undefined, true);
        return that.waitForChanges(assert);
    }).then(function () {
        assert.strictEqual(oBinding.getCount(), 3, "number of contexts");
    });
});
QUnit.skip("All pairs test for multi create (4)", function (assert) {
    var oBinding, oCreatedContext0, oCreatedContext1, oCreatedContext2, oTable, oModel = createSalesOrdersModel(), sView = "<t:Table id=\"table\" rows=\"{/SalesOrderSet}\" visibleRowCount=\"5\">\t<Text id=\"id\" text=\"{SalesOrderID}\"/>\t<Text id=\"note\" text=\"{Note}\"/></t:Table>", that = this;
    this.expectHeadRequest().expectRequest("SalesOrderSet?$skip=0&$top=105", {
        results: [{
                __metadata: { uri: "SalesOrderSet('42')" },
                Note: "First SalesOrder",
                SalesOrderID: "42"
            }]
    }).expectValue("id", ["42", "", "", "", ""]).expectValue("note", ["First SalesOrder", "", "", "", ""]);
    return this.createView(assert, sView, oModel).then(function () {
        oTable = that.oView.byId("table");
        oBinding = oTable.getBinding("rows");
        that.expectValue("id", ["", "42"]).expectValue("note", ["New 1", "First SalesOrder"]);
        oCreatedContext0 = oBinding.create({ Note: "New 1" }, false);
        return that.waitForChanges(assert);
    }).then(function () {
        that.expectValue("id", ["", "42"], 1).expectValue("note", ["New 2", "New 1", "First SalesOrder"]);
        oCreatedContext1 = oBinding.create({ Note: "New 2" }, false);
        return that.waitForChanges(assert);
    }).then(function () {
        that.expectValue("id", ["", "42"], 2).expectValue("note", ["New 3", "New 2", "New 1", "First SalesOrder"]);
        oCreatedContext2 = oBinding.create({ Note: "New 3" }, false);
        return that.waitForChanges(assert);
    }).then(function () {
        that.expectRequest({
            created: true,
            data: {
                __metadata: { type: "GWSAMPLE_BASIC.SalesOrder" },
                Note: "New 1"
            },
            method: "POST",
            requestUri: "SalesOrderSet"
        }, {
            data: {
                __metadata: { uri: "SalesOrderSet('43')" },
                Note: "New 1",
                SalesOrderID: "43"
            },
            statusCode: 201
        }).expectRequest({
            created: true,
            data: {
                __metadata: { type: "GWSAMPLE_BASIC.SalesOrder" },
                Note: "New 2"
            },
            method: "POST",
            requestUri: "SalesOrderSet"
        }, {
            data: {
                __metadata: { uri: "SalesOrderSet('44')" },
                Note: "New 2",
                SalesOrderID: "44"
            },
            statusCode: 201
        }).expectRequest({
            created: true,
            data: {
                __metadata: { type: "GWSAMPLE_BASIC.SalesOrder" },
                Note: "New 3"
            },
            method: "POST",
            requestUri: "SalesOrderSet"
        }, {
            data: {
                __metadata: { uri: "SalesOrderSet('45')" },
                Note: "New 3",
                SalesOrderID: "45"
            },
            statusCode: 201
        }).expectValue("id", ["45", "44", "43"]);
        return Promise.all([
            oCreatedContext0.created(),
            oCreatedContext1.created(),
            oCreatedContext2.created(),
            that.oModel.submitChanges(),
            that.waitForChanges(assert)
        ]);
    }).then(function () {
        that.expectRequest({
            deepPath: "/SalesOrderSet('44')",
            method: "DELETE",
            requestUri: "SalesOrderSet('44')"
        }, {}).expectRequest("SalesOrderSet?$skip=0&$top=102" + "&$filter=not(SalesOrderID eq '45' or SalesOrderID eq '44' " + "or SalesOrderID eq '43')", {
            results: [{
                    __metadata: { uri: "SalesOrderSet('42')" },
                    Note: "First SalesOrder",
                    SalesOrderID: "42"
                }]
        }).expectValue("id", [""], 1).expectValue("note", [""], 1).expectValue("id", ["43", "42", ""], 1).expectValue("note", ["New 1", "First SalesOrder", ""], 1);
        oModel.remove("", { context: oCreatedContext1, refreshAfterChange: true });
        return that.waitForChanges(assert);
    }).then(function () {
        assert.strictEqual(oBinding.getCount(), 3, "number of contexts");
    });
});