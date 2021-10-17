import Log from "sap/base/Log";
import extend from "sap/base/util/extend";
var mHeaderTypes = {
    xml: {
        "Content-Type": "application/xml;charset=utf-8",
        "DataServiceVersion": "1.0;"
    },
    atom: {
        "Content-Type": "application/atom+xml;charset=utf-8",
        "DataServiceVersion": "2.0;"
    },
    json: {
        "Content-Type": "application/json;charset=utf-8",
        "DataServiceVersion": "2.0;"
    },
    text: {
        "Content-Type": "text/plain;charset=utf-8",
        "DataServiceVersion": "2.0;"
    }
};
var mPredefinedServiceResponses = {};
(function (sinon) {
    var mServiceData = {
        serviceUrl: "fakeservice://testdata/odata/northwind/",
        collections: {
            "Products": {
                count: 20,
                type: "NorthwindModel.Product",
                properties: {
                    "ProductID": { type: "id" },
                    "ProductName": { type: "string" },
                    "SupplierID": { type: "int", maxValue: 5 },
                    "CategoryID": { type: "int", maxValue: 20 },
                    "QuantityPerUnit": { type: "string", choices: ["kg", "pcs", "ml"] },
                    "UnitPrice": { type: "float" },
                    "UnitsInStock": { type: "int" },
                    "UnitsOnOrder": { type: "int" },
                    "ReorderLevel": { type: "int" },
                    "Discontinued": { type: "bool" }
                },
                navigationProperties: {
                    "Supplier": { entitySet: "Suppliers", key: "4", multiple: false }
                },
                itemMessages: [{
                        "target": "ProductName",
                        "code": "Item",
                        "message": "This Item is very doof",
                        "severity": "error"
                    }],
                collectionMessages: [{
                        "code": "BL/308",
                        "message": "Steward(ess) Miss Piggy is ill and not available",
                        "severity": "info"
                    }]
            },
            "Suppliers": {
                count: 5,
                type: "NorthwindModel.Supplier",
                properties: {
                    "SupplierID": { type: "id" },
                    "SupplierName": { type: "string" }
                },
                itemMessages: [{
                        "target": "SupplierName",
                        "code": "Item",
                        "message": "This supplier has a name I cannot accept",
                        "severity": "error"
                    }],
                collectionMessages: [{
                        "code": "XY/123",
                        "message": "What the...?",
                        "severity": "info"
                    }]
            }
        },
        metadata: mPredefinedServiceResponses.northwindMetadata
    };
    var oRandomService = new ODataRandomService(mServiceData);
    var xhr = sinon.useFakeXMLHttpRequest(), responseDelay = 50, _setTimeout = window.setTimeout;
    xhr.useFilters = true;
    xhr.addFilter(function (method, url) {
        return url.indexOf("fakeservice://") != 0;
    });
    xhr.onCreate = function (request) {
        request.onSend = function () {
            var sUrl = request.url;
            var bJson = request.url.indexOf("$format=json") > -1 || request.requestHeaders["Accept"].indexOf("application/json") > -1;
            var sRandomServiceUrl = null;
            var iResponseDelay = 200;
            var iStatus = 404;
            var mResponseHeaders = [];
            var sAnswer = "Not found";
            switch (sUrl) {
                case "fakeservice://testdata/odata/northwind/Products(1)?$expand=Supplier":
                    iStatus = 200;
                    mResponseHeaders = extend({}, mHeaderTypes["json"]);
                    mResponseHeaders["sap-message"] = JSON.stringify({
                        "code": "999",
                        "message": "This is a server test message",
                        "severity": "error",
                        "target": "/Suppliers(1)/Name",
                        "details": []
                    });
                    sAnswer = mPredefinedServiceResponses.ProductsExpandSupplier;
                    break;
                case "fakeservice://testdata/odata/function-imports/":
                    iStatus = 200;
                    mResponseHeaders = extend({}, mHeaderTypes["xml"]);
                    mResponseHeaders["sap-message"] = JSON.stringify({
                        "code": "999",
                        "message": "This is a server wide test message",
                        "severity": "error",
                        "target": "",
                        "details": []
                    });
                    sAnswer = mPredefinedServiceResponses.functionImportMain;
                    break;
                case "fakeservice://testdata/odata/function-imports/$metadata":
                    iStatus = 200;
                    mResponseHeaders = extend({}, mHeaderTypes["xml"]);
                    sAnswer = mPredefinedServiceResponses.functionImportMetadata;
                    break;
                case "fakeservice://testdata/odata/function-imports/EditProduct?ProductUUID=guid'00000000-0000-0000-0000-000000000001'":
                    iStatus = 200;
                    mResponseHeaders = extend({}, mHeaderTypes["atom"]);
                    mResponseHeaders["sap-message"] = JSON.stringify({
                        "code": "999",
                        "message": "This is FunctionImport specific test message",
                        "severity": "error",
                        "target": "",
                        "details": []
                    });
                    mResponseHeaders["location"] = "fakeservice://testdata/odata/function-imports/Products(guid'10000000-0000-0000-0000-000000000000')";
                    sAnswer = mPredefinedServiceResponses.functionImportProduct1;
                    break;
                case "fakeservice://testdata/odata/function-imports/EditProduct?ProductUUID=guid'00000000-0000-0000-0000-000000000002'":
                    iStatus = 200;
                    mResponseHeaders = extend({}, mHeaderTypes["atom"]);
                    mResponseHeaders["sap-message"] = JSON.stringify({
                        "code": "999",
                        "message": "This is FunctionImport specific test message",
                        "severity": "error",
                        "target": "/Products(guid'20000000-0000-0000-0000-000000000000')",
                        "details": []
                    });
                    sAnswer = mPredefinedServiceResponses.functionImportProduct1;
                    break;
                case "fakeservice://testdata/odata/function-imports/EditProduct?ProductUUID=guid'30000000-0000-0000-0000-000000000003'":
                    iStatus = 200;
                    mResponseHeaders = extend({}, mHeaderTypes["atom"]);
                    mResponseHeaders["sap-message"] = JSON.stringify({
                        "code": "999",
                        "message": "This is FunctionImport specific test message",
                        "severity": "error",
                        "details": []
                    });
                    sAnswer = mPredefinedServiceResponses.functionImportProduct1;
                    break;
                case "fakeservice://testdata/odata/technical-errors/Error(400)":
                    iStatus = 400;
                    sAnswer = bJson ? mPredefinedServiceResponses.technicalError400Json : mPredefinedServiceResponses.technicalError400Xml;
                    mResponseHeaders = extend({}, mHeaderTypes[bJson ? "json" : "xml"]);
                    break;
                case "fakeservice://testdata/odata/technical-errors/Error(500)":
                    iStatus = 500;
                    sAnswer = bJson ? mPredefinedServiceResponses.technicalError500Json : mPredefinedServiceResponses.technicalError500Xml;
                    mResponseHeaders = extend({}, mHeaderTypes[bJson ? "json" : "xml"]);
                    break;
                case "fakeservice://testdata/odata/technical-errors/$metadata":
                    iStatus = 200;
                    mResponseHeaders = extend({}, mHeaderTypes["xml"]);
                    sAnswer = mPredefinedServiceResponses.functionImportMetadata;
                    break;
                case "fakeservice://testdata/odata/technical-errors/Error2(400)":
                    iStatus = 400;
                    sAnswer = bJson ? mPredefinedServiceResponses.technicalError400Json2 : mPredefinedServiceResponses.technicalError400Xml2;
                    mResponseHeaders = extend({}, mHeaderTypes[bJson ? "json" : "xml"]);
                    break;
                case "fakeservice://testdata/odata/function-imports/ActionForFunction?SupplierUUID=guid'00000000-0000-0000-0000-000000000001'":
                    iStatus = 200;
                    mResponseHeaders = extend({}, mHeaderTypes["atom"]);
                    mResponseHeaders["sap-message"] = JSON.stringify({
                        "code": "999",
                        "message": "This is FunctionImport specific test message",
                        "severity": "error",
                        "target": "",
                        "details": []
                    });
                    sAnswer = mPredefinedServiceResponses.functionImportProduct1;
                    break;
                case "fakeservice://testdata/odata/function-imports/ActionForFunction?SupplierUUID=guid'00000000-0000-0000-0000-000000000002'":
                    iStatus = 200;
                    mResponseHeaders = extend({}, mHeaderTypes["atom"]);
                    mResponseHeaders["sap-message"] = JSON.stringify({
                        "code": "999",
                        "message": "This is FunctionImport specific test message",
                        "severity": "error",
                        "target": "/Products(999)/ProductName",
                        "details": []
                    });
                    sAnswer = mPredefinedServiceResponses.functionImportProduct1;
                    break;
                case "fakeservice://testdata/odata/northwind/functionWithInvalidTarget":
                    iStatus = 204;
                    mResponseHeaders = extend({}, mHeaderTypes["atom"]);
                    mResponseHeaders["sap-message"] = JSON.stringify({
                        "code": Date.now(),
                        "message": "This is FunctionImport specific message that will stay until the function is called again.",
                        "severity": "error",
                        "target": "/PersistedMessages/functionWithInvalidTarget",
                        "details": [{
                                "code": Date.now(),
                                "message": "This is a message for '/Products(1)'.",
                                "severity": "warning",
                                "target": "/Products(1)/SupplierID"
                            }]
                    });
                    mResponseHeaders["location"] = "fakeservice://testdata/odata/northwind/Products(1)";
                    sAnswer = "";
                    break;
                case "fakeservice://testdata/odata/northwind/functionWithInvalidReturnType":
                    iStatus = 204;
                    mResponseHeaders = extend({}, mHeaderTypes["atom"]);
                    mResponseHeaders["location"] = "fakeservice://testdata/odata/northwind";
                    mResponseHeaders["sap-message"] = JSON.stringify({
                        "code": Date.now(),
                        "message": "This is FunctionImport specific message with an invalid return type.",
                        "severity": "error"
                    });
                    sAnswer = "";
                    break;
                case "fakeservice://testdata/odata/northwind/functionWithInvalidEntitySet":
                    iStatus = 204;
                    mResponseHeaders = extend({}, mHeaderTypes["atom"]);
                    mResponseHeaders["location"] = "fakeservice://testdata/odata/northwind";
                    mResponseHeaders["sap-message"] = JSON.stringify({
                        "code": Date.now(),
                        "message": "This is FunctionImport specific message with an invalid entityset.",
                        "severity": "error"
                    });
                    sAnswer = "";
                    break;
                case "fakeservice://testdata/odata/northwind/TransientTest1":
                    var iDate = Date.now();
                    iStatus = 200;
                    mResponseHeaders = extend({}, mHeaderTypes["json"]);
                    mResponseHeaders["sap-message"] = JSON.stringify({
                        "code": iDate,
                        "message": "This is a normal message.",
                        "severity": "error",
                        "target": "/TransientTest1/SupplierID",
                        "details": [{
                                "code": iDate + 1,
                                "message": "This is a transient message using /#TRANSIENT# notation.",
                                "severity": "error",
                                "target": "/#TRANSIENT#/TransientTest1/SupplierID"
                            }, {
                                "code": iDate + 2,
                                "message": "This is a transient message using transient flag.",
                                "severity": "error",
                                "transient": true,
                                "target": "/TransientTest1/SupplierID"
                            }]
                    });
                    sAnswer = JSON.stringify({
                        "d": {
                            "results": [
                                {
                                    "__metadata": {
                                        "id": "fakeservice://testdata/odata/northwind/TransientTest1",
                                        "uri": "fakeservice://testdata/odata/northwind/TransientTest1",
                                        "type": "NorthwindModel.Product"
                                    },
                                    "ProductID": "transient-1",
                                    "ProductName": "snoyweh",
                                    "SupplierID": 0,
                                    "CategoryID": 17,
                                    "QuantityPerUnit": "ml",
                                    "UnitPrice": 25.35128231184987,
                                    "UnitsInStock": 12,
                                    "UnitsOnOrder": 2,
                                    "ReorderLevel": 75,
                                    "Discontinued": false
                                }
                            ]
                        }
                    });
                    break;
                default: if (sUrl.startsWith(mServiceData["serviceUrl"])) {
                    sRandomServiceUrl = sUrl.substr(mServiceData["serviceUrl"].length);
                }
                else {
                    debugger;
                    throw new Error("Unknown Fakeservice URL");
                }
            }
            if (sRandomServiceUrl !== null) {
                oRandomService.serveUrl({
                    url: sRandomServiceUrl,
                    request: request,
                    json: bJson
                });
            }
            else if (request.async === true) {
                var oRequest = request;
                _setTimeout(function () {
                    oRequest.respond(iStatus, mResponseHeaders, sAnswer);
                }, iResponseDelay);
            }
            else {
                request.respond(iStatus, mResponseHeaders, sAnswer);
            }
        };
    };
    function ODataRandomService(oServiceConfig) {
        this._config = oServiceConfig;
        this._serviceUrl = this._config["serviceUrl"];
    }
    ODataRandomService.prototype.serveUrl = function (mOptions) {
        this._url = mOptions.url;
        this._request = mOptions.request;
        this._useJson = !!mOptions.json;
        this._urlInfo = this._parseUrl(mOptions.url);
        var mResponse = this._createResponse(this._urlInfo, mOptions);
        this._answer(mResponse);
    };
    ODataRandomService.prototype._createResponse = function (mUrlInfo, mOptions) {
        var mResponse;
        var mCollection = mServiceData.collections[mUrlInfo.collection];
        if (mUrlInfo.path == "") {
            mResponse = this._answerService(mServiceData);
        }
        else if (mUrlInfo.path == "$metadata") {
            mResponse = this._answerMetadata();
        }
        else if (mUrlInfo.path == "$batch") {
            mResponse = this.handleBatchRequest(mOptions);
        }
        else if (mUrlInfo.postfix == "$count" && mCollection) {
            mResponse = this._answerCollectionCount(mCollection);
        }
        else if (!mUrlInfo.item && mCollection) {
            mResponse = this._answerCollection(mUrlInfo.collection, mCollection);
        }
        else if (mUrlInfo.item && mCollection && mUrlInfo.postfix && mCollection.navigationProperties[mUrlInfo.postfix]) {
            var sResolvedPath = this.resolveNavigationProperty(mCollection, mUrlInfo.item, mUrlInfo.postfix);
            var mResolvedUrlInfo = this._parseUrl(sResolvedPath);
            mOptions.useAboluteMessagePath = true;
            mResponse = this._createResponse(mResolvedUrlInfo, mOptions);
        }
        else if (mUrlInfo.item && mCollection) {
            mResponse = this._answerCollectionItem(mUrlInfo.item, mUrlInfo.collection, mCollection, mOptions);
        }
        else {
            mResponse = this._answerError();
        }
        return mResponse;
    };
    ODataRandomService.prototype.resolveNavigationProperty = function (mCollection, sItem, sNavigationProperty) {
        var mNavigationProperty = mCollection.navigationProperties[sNavigationProperty];
        return mNavigationProperty.entitySet + "(" + mNavigationProperty.key + ")";
    };
    ODataRandomService.prototype.handleBatchRequest = function (mOptions) {
        var mBatchResponse = {};
        var aSubRequests = this.parseBatchRequest(mOptions.request.requestBody);
        var sBatchSeparator = "batch_36522ad7-fc75-4b56-8c71-56071383e77b";
        mBatchResponse.status = 202;
        mBatchResponse.headers = {
            "DataServiceVersion": "2.0",
            "Content-Type": "multipart/mixed; boundary=" + sBatchSeparator
        };
        mBatchResponse.body = "";
        function createHeaderString(mHeaders) {
            return Object.keys(mHeaders).map(function (sKey) {
                return sKey + ": " + mHeaders[sKey];
            }).join("\r\n");
        }
        var bInChangeset = false;
        for (var i = 0; i < aSubRequests.length; ++i) {
            var mRequest = aSubRequests[i];
            var mResponse = this._createResponse(this._parseUrl(mRequest.url), mOptions);
            var sBatchContentType = "Content-Type: application/http\r\n";
            if (mRequest.method == "GET") {
                bInChangeset = false;
            }
            else if (mRequest.method === "HEAD") {
                bInChangeset = false;
                mResponse.status = 204;
                mResponse.body = "";
            }
            else {
                Log.warning("ODataRandomService ignores writes...");
                if (!bInChangeset) {
                    mBatchResponse.body += "\r\n--" + sBatchSeparator + "\r\n";
                    mBatchResponse.body += "Content-Type: multipart/mixed; boundary=changeset_" + sBatchSeparator + "\r\n";
                }
                bInChangeset = true;
                mResponse.status = 204;
                mResponse.body = "";
                delete mResponse.headers["Content-Type"];
            }
            mBatchResponse.body += "\r\n--" + (bInChangeset ? "changeset_" : "") + sBatchSeparator + "\r\n";
            mBatchResponse.body += sBatchContentType;
            mBatchResponse.body += "Content-Transfer-Encoding:binary\r\n";
            mBatchResponse.body += "\r\n";
            mBatchResponse.body += "HTTP/1.1 " + mResponse.status + " Ok\r\n";
            mBatchResponse.body += createHeaderString(mResponse.headers) + "\r\n\r\n";
            mBatchResponse.body += mResponse.body + "\r\n\r\n";
        }
        if (bInChangeset) {
            mBatchResponse.body += "--changeset_" + sBatchSeparator + "--\r\n";
        }
        mBatchResponse.body += "--" + sBatchSeparator + "--";
        return mBatchResponse;
    };
    ODataRandomService.prototype.parseBatchRequest = function (sBatchContent) {
        function parseHeaders(vHeaders) {
            var mHeaders = {};
            var aHeaders = Array.isArray(vHeaders) ? vHeaders : vHeaders.split("\n");
            for (var i = 0; i < aHeaders.length; ++i) {
                var aSingleHeader = aHeaders[i].toLowerCase().split(":");
                mHeaders[aSingleHeader[0].trim()] = aSingleHeader[1].trim();
            }
            return mHeaders;
        }
        var aMatches = sBatchContent.match(/^[\r\n]*([^\n]*)/m);
        if (!aMatches || !aMatches[1]) {
            throw new Error("Batch request did not contain separator");
        }
        var sSeparator = aMatches[1].trim();
        var aContentParts = sBatchContent.replace(sSeparator + "--", "").trim().split(sSeparator).slice(1);
        if (aContentParts.length == 1) {
            sBatchContent = aContentParts[0];
            aMatches = sBatchContent.match(/^.*boundary=([^\n]*)/m);
            if (!aMatches || !aMatches[1]) {
                throw new Error("Changeset did not contain separator");
            }
            sSeparator = aMatches[1].trim();
            aContentParts = aContentParts[0].replace(sSeparator + "--", "").trim().split(sSeparator).slice(2);
        }
        var aRequests = aContentParts.map(function (sSingleRequest) {
            var mRequest = {};
            sSingleRequest = sSingleRequest.replace(/\r\n|\r/g, "\n").trim();
            if (sSingleRequest.length === 0) {
                return {};
            }
            var aSplitted = sSingleRequest.trim().split("\n\n");
            mRequest.batchHeaders = parseHeaders(aSplitted[0]);
            var aLines = aSplitted[1].trim().split("\n");
            var sRequestLine = aLines.shift();
            var aMatches = /([^ ]*) (.*) (HTTP.*)/.exec(sRequestLine);
            mRequest.method = aMatches[1];
            mRequest.url = aMatches[2];
            mRequest.headers = parseHeaders(aLines);
            mRequest.body = aSplitted[2] ? aSplitted[2] : "";
            return mRequest;
        });
        return aRequests;
    };
    ODataRandomService.prototype._answer = function (mResponse) {
        function fnRespond(oRequest, mResponse) {
            oRequest.respond(mResponse.status, mResponse.headers, mResponse.body);
        }
        if (this._request.async === true) {
            _setTimeout(fnRespond.bind(this, this._request, mResponse), responseDelay);
        }
        else {
            fnRespond(this._request, mResponse);
        }
    };
    ODataRandomService.prototype._parseUrl = function (sUrl) {
        var sPath = "", sCollection = "", sItem = "", sPostfix = "", sParams = "";
        var aMatches = sUrl.match(/^(.*)\?(.*)$/);
        if (aMatches) {
            sPath = aMatches[1];
            sParams = aMatches[2];
        }
        else {
            sPath = sUrl;
            sParams = "";
        }
        aMatches = sPath.match(/^([A-Za-z0-9]+)([\(\)(A-Za-z0-9=_%'\-)]*)\/{0,1}(.*)$/);
        if (aMatches && aMatches.length === 3) {
            sCollection = aMatches[1];
            sPostfix = aMatches[2];
        }
        else if (aMatches && aMatches.length === 4) {
            sCollection = aMatches[1];
            sItem = aMatches[2].replace(/^\(|\)$/g, "");
            sPostfix = aMatches[3];
        }
        else {
            sCollection = sPath;
        }
        return {
            path: sPath,
            collection: sCollection,
            item: sItem,
            postfix: sPostfix,
            parameters: sParams
        };
    };
    ODataRandomService.prototype._answerCollectionItem = function (sItem, sCollection, mCollection, mOptions) {
        var mMessage, aMessages = [];
        var sTargetPrefix = mOptions.useAboluteMessagePath ? "/" + sCollection + "(" + sItem + ")/" : "";
        var sItemUrl = this._serviceUrl + sCollection + "(" + sItem + ")";
        var mItem = {
            "__metadata": {
                "id": sItemUrl,
                "uri": sItemUrl,
                "type": mCollection.type
            }
        };
        for (var sName in mCollection.properties) {
            mItem[sName] = this._createData(mCollection.properties[sName], sItem);
        }
        if (mCollection.itemMessages) {
            for (var n = 0; n < mCollection.itemMessages.length; ++n) {
                mMessage = extend({}, mCollection.itemMessages[n]);
                mMessage.target = sTargetPrefix + mCollection.itemMessages[n].target;
                aMessages.push(mMessage);
            }
        }
        var mAnswer = {
            d: {
                results: [mItem]
            }
        };
        if (mCollection.message) {
            aMessages.push(mCollection.message);
        }
        if (mCollection.collectionMessages) {
            for (var i = 0; i < mCollection.collectionMessages.length; ++i) {
                mMessage = extend({}, mCollection.collectionMessages[i]);
                mMessage.target = "/" + sCollection;
                aMessages.push(mMessage);
            }
        }
        var sType = this._useJson ? "json" : "atom";
        var sAnswer = this._useJson ? JSON.stringify(mAnswer) : this._createXmlAnswer(mAnswer, "collection");
        var mHead = extend({}, mHeaderTypes[sType]);
        mHead["sap-message"] = this._createMessageHeader(aMessages);
        return {
            status: 200,
            headers: mHead,
            body: sAnswer
        };
    };
    ODataRandomService.prototype._answerError = function () {
        var mAnswer = {
            error: {
                code: "GNARF/42",
                message: {
                    lang: "en-US",
                    value: "Good news everyone: Something horrible happened!"
                }
            }
        };
        var sType = this._useJson ? "json" : "atom";
        var sAnswer = this._useJson ? JSON.stringify(mAnswer) : this._createXmlAnswer(mAnswer, "error");
        return {
            status: 200,
            headers: mHeaderTypes[sType],
            body: sAnswer
        };
    };
    ODataRandomService.prototype._createXmlAnswer = function (mAnswer, sType) {
        var i;
        var sAnswer = "<?xml version=\"1.0\" encoding=\"utf-8\"?>";
        if (sType === "error") {
            sAnswer += "<m:error xmlns:m=\"http://schemas.microsoft.com/ado/2007/08/dataservices/metadata\">";
            sAnswer += "<m:code>" + mAnswer.error.code + "</m:code>";
            sAnswer += "<m:message xml:lang=\"" + mAnswer.error.message.lang + "\">" + mAnswer.error.message.value + "</m:message>";
            sAnswer += "</m:error>";
        }
        else if (sType === "service") {
            sAnswer += "<service xmlns=\"http://www.w3.org/2007/app\" xmlns:atom=\"http://www.w3.org/2005/Atom\" xml:base=\"http://services.odata.org/V3/Northwind/Northwind.svc/\">";
            sAnswer += "<workspace>";
            sAnswer += "<atom:title>Default</atom:title>";
            for (i = 0; i < mAnswer.d.EntitySets.length; ++i) {
                var sName = mAnswer.d.EntitySets[i];
                sAnswer += "<collection href=\"" + sName + "\">";
                sAnswer += "<atom:title>" + sName + "</atom:title>";
                sAnswer += "</collection>";
            }
            sAnswer += "</workspace>";
            sAnswer += "</service>";
        }
        else if (sType === "collection") {
            sAnswer += "<feed xmlns=\"http://www.w3.org/2005/Atom\" xmlns:d=\"http://schemas.microsoft.com/ado/2007/08/dataservices\" xmlns:m=\"http://schemas.microsoft.com/ado/2007/08/dataservices/metadata\">";
            for (i = 0; i < mAnswer.d.results.length; ++i) {
                var mEntry = mAnswer.d.results[i];
                sAnswer += "<entry>";
                sAnswer += "<id>" + mEntry.__metadata.id + "</id>";
                sAnswer += "<content type=\"application/xml\">";
                sAnswer += "<m:properties>";
                for (var sProp in mEntry) {
                    if (sProp === "__metadata") {
                        continue;
                    }
                    sAnswer += "<d:" + sProp + ">";
                    sAnswer += mEntry[sProp];
                    sAnswer += "</d:" + sProp + ">";
                }
                sAnswer += "</m:properties>";
                sAnswer += "</content>";
                sAnswer += "</entry>";
            }
            sAnswer += "</feed>";
        }
        else if (sType === "entity") {
            throw "n\u00F6";
        }
        return sAnswer;
    };
    ODataRandomService.prototype._answerMetadata = function () {
        return {
            status: 200,
            headers: mHeaderTypes["xml"],
            body: mPredefinedServiceResponses.northwindMetadata
        };
    };
    ODataRandomService.prototype._answerService = function (oServiceData) {
        var mAnswer = {
            d: {
                EntitySets: oServiceData.collections
            }
        };
        var sType = this._useJson ? "json" : "atom";
        var sAnswer = this._useJson ? JSON.stringify(mAnswer) : this._createXmlAnswer(mAnswer, "service");
        return {
            status: 200,
            headers: mHeaderTypes[sType],
            body: sAnswer
        };
    };
    ODataRandomService.prototype._answerCollectionCount = function (oColData) {
        return {
            status: 200,
            headers: mHeaderTypes[mHeaderTypes["text"]],
            body: "" + oColData.count
        };
    };
    ODataRandomService.prototype._answerCollection = function (sColName, oColData) {
        var aItems = [];
        var aMessages = [];
        var mMessage, i;
        for (i = 0; i < oColData.count; ++i) {
            var sItemUrl = this._serviceUrl + sColName + "(" + (i + 1) + ")";
            var mItem = {
                "__metadata": {
                    "id": sItemUrl,
                    "uri": sItemUrl,
                    "type": oColData.type
                }
            };
            for (var sName in oColData.properties) {
                mItem[sName] = this._createData(oColData.properties[sName], i + 1);
            }
            aItems.push(mItem);
            if (oColData.itemMessages) {
                for (var n = 0; n < oColData.itemMessages.length; ++n) {
                    mMessage = extend({}, oColData.itemMessages[n]);
                    mMessage.code = oColData.itemMessages[n].code + i;
                    mMessage.target = "(" + (i + 1) + ")/" + oColData.itemMessages[n].target;
                    mMessage.propertyRef = "(" + (i + 1) + ")/" + oColData.itemMessages[n].target;
                    aMessages.push(mMessage);
                }
            }
        }
        var mAnswer = {
            d: {
                results: aItems
            }
        };
        if (oColData.message) {
            aMessages.push(oColData.message);
        }
        if (oColData.collectionMessages) {
            for (i = 0; i < oColData.collectionMessages.length; ++i) {
                mMessage = extend({}, oColData.collectionMessages[i]);
                mMessage.target = "/" + sColName;
                aMessages.push(mMessage);
            }
        }
        var sType = this._useJson ? "json" : "atom";
        var sAnswer = this._useJson ? JSON.stringify(mAnswer) : this._createXmlAnswer(mAnswer, "collection");
        var mHead = extend({}, mHeaderTypes[sType]);
        mHead["sap-message"] = this._createMessageHeader(aMessages);
        return {
            status: 200,
            headers: mHead,
            body: sAnswer
        };
    };
    ODataRandomService.prototype._createMessageHeader = function (aMessages) {
        var mMessage = {
            "code": aMessages[0].code,
            "message": aMessages[0].message,
            "severity": aMessages[0].severity,
            "target": aMessages[0].target,
            "details": []
        };
        for (var i = 1; i < aMessages.length; ++i) {
            mMessage.details.push({
                "code": aMessages[i].code,
                "message": aMessages[i].message,
                "severity": aMessages[i].severity,
                "target": aMessages[i].target
            });
        }
        return JSON.stringify(mMessage);
    };
    ODataRandomService.prototype._createData = function (mOptions, sId) {
        var sResult, iMax;
        switch (mOptions.type) {
            case "string":
                if (mOptions.choices) {
                    sResult = mOptions.choices[Math.floor(Math.random() * mOptions.choices.length)];
                }
                else {
                    sResult = this._createRandomString();
                }
                break;
            case "id":
                sResult = sId;
                break;
            case "int":
                iMax = mOptions.maxValue ? mOptions.maxValue : 99;
                sResult = Math.round(Math.random() * iMax);
                break;
            case "float":
                iMax = mOptions.maxValue ? mOptions.maxValue : 99;
                sResult = Math.random() * iMax;
                break;
            case "bool":
                sResult = Math.random >= 0.5;
                break;
            default:
                sResult = "INVALID DATA TYPE!!!";
                break;
        }
        return sResult;
    };
    ODataRandomService.prototype._createRandomString = function (iSyllables) {
        var aSyllables = [[
                "b",
                "c",
                "d",
                "f",
                "g",
                "h",
                "j",
                "k",
                "l",
                "m",
                "n",
                "p",
                "r",
                "s",
                "t",
                "v",
                "w",
                "y",
                "z",
                "th",
                "sh",
                "ph",
                "bl",
                "cl",
                "kl",
                "pl",
                "sl",
                "gn",
                "kn",
                "pn",
                "sn",
                "br",
                "cr",
                "dr",
                "fr",
                "gr",
                "kr",
                "pr",
                "tr"
            ], [
                "a",
                "e",
                "i",
                "o",
                "u",
                "y",
                "ai",
                "au",
                "ay",
                "ei",
                "ey",
                "ou",
                "oy"
            ]];
        var iSizes = [
            aSyllables[0].length,
            aSyllables[1].length
        ];
        if (iSyllables === undefined) {
            iSyllables = 5;
        }
        var sString = "";
        var s = 0;
        for (var i = 0; i < iSyllables; i++) {
            sString += aSyllables[s][Math.floor(Math.random() * iSizes[s])];
            s = s == 0 ? 1 : 0;
        }
        return sString;
    };
})(window.sinon);
mPredefinedServiceResponses.northwindMetadata = "<?xml version=\"1.0\" encoding=\"utf-8\"?><edmx:Edmx Version=\"1.0\" xmlns:edmx=\"http://schemas.microsoft.com/ado/2007/06/edmx\">\t<edmx:DataServices m:DataServiceVersion=\"1.0\" m:MaxDataServiceVersion=\"3.0\"\t\txmlns:m=\"http://schemas.microsoft.com/ado/2007/08/dataservices/metadata\"\t\txmlns:sap=\"http://www.sap.com/Protocols/SAPData\">\t\t<Schema Namespace=\"NorthwindModel\" xmlns=\"http://schemas.microsoft.com/ado/2008/09/edm\">\t\t\t<EntityType Name=\"Category\">\t\t\t\t<Key>\t\t\t\t\t<PropertyRef Name=\"CategoryID\" />\t\t\t\t</Key>\t\t\t\t<Property Name=\"CategoryID\" Type=\"Edm.Int32\" Nullable=\"false\" p6:StoreGeneratedPattern=\"Identity\"\t\t\t\t\txmlns:p6=\"http://schemas.microsoft.com/ado/2009/02/edm/annotation\" />\t\t\t\t<Property Name=\"CategoryName\" Type=\"Edm.String\" Nullable=\"false\" MaxLength=\"15\" FixedLength=\"false\"\t\t\t\t\tUnicode=\"true\" />\t\t\t\t<Property Name=\"Description\" Type=\"Edm.String\" MaxLength=\"Max\" FixedLength=\"false\" Unicode=\"true\" />\t\t\t\t<Property Name=\"Picture\" Type=\"Edm.Binary\" MaxLength=\"Max\" FixedLength=\"false\" />\t\t\t\t<NavigationProperty Name=\"Products\" Relationship=\"NorthwindModel.FK_Products_Categories\" ToRole=\"Products\"\t\t\t\t\tFromRole=\"Categories\" />\t\t\t</EntityType>\t\t\t<EntityType Name=\"CustomerDemographic\">\t\t\t\t<Key>\t\t\t\t\t<PropertyRef Name=\"CustomerTypeID\" />\t\t\t\t</Key>\t\t\t\t<Property Name=\"CustomerTypeID\" Type=\"Edm.String\" Nullable=\"false\" MaxLength=\"10\" FixedLength=\"true\"\t\t\t\t\tUnicode=\"true\" />\t\t\t\t<Property Name=\"CustomerDesc\" Type=\"Edm.String\" MaxLength=\"Max\" FixedLength=\"false\" Unicode=\"true\" />\t\t\t\t<NavigationProperty Name=\"Customers\" Relationship=\"NorthwindModel.CustomerCustomerDemo\" ToRole=\"Customers\"\t\t\t\t\tFromRole=\"CustomerDemographics\" />\t\t\t</EntityType>\t\t\t<EntityType Name=\"Customer\">\t\t\t\t<Key>\t\t\t\t\t<PropertyRef Name=\"CustomerID\" />\t\t\t\t</Key>\t\t\t\t<Property Name=\"CustomerID\" Type=\"Edm.String\" Nullable=\"false\" MaxLength=\"5\" FixedLength=\"true\" Unicode=\"true\" />\t\t\t\t<Property Name=\"CompanyName\" Type=\"Edm.String\" Nullable=\"false\" MaxLength=\"40\" FixedLength=\"false\" Unicode=\"true\" />\t\t\t\t<Property Name=\"ContactName\" Type=\"Edm.String\" MaxLength=\"30\" FixedLength=\"false\" Unicode=\"true\" />\t\t\t\t<Property Name=\"ContactTitle\" Type=\"Edm.String\" MaxLength=\"30\" FixedLength=\"false\" Unicode=\"true\" />\t\t\t\t<Property Name=\"Address\" Type=\"Edm.String\" MaxLength=\"60\" FixedLength=\"false\" Unicode=\"true\" />\t\t\t\t<Property Name=\"City\" Type=\"Edm.String\" MaxLength=\"15\" FixedLength=\"false\" Unicode=\"true\" />\t\t\t\t<Property Name=\"Region\" Type=\"Edm.String\" MaxLength=\"15\" FixedLength=\"false\" Unicode=\"true\" />\t\t\t\t<Property Name=\"PostalCode\" Type=\"Edm.String\" MaxLength=\"10\" FixedLength=\"false\" Unicode=\"true\" />\t\t\t\t<Property Name=\"Country\" Type=\"Edm.String\" MaxLength=\"15\" FixedLength=\"false\" Unicode=\"true\" />\t\t\t\t<Property Name=\"Phone\" Type=\"Edm.String\" MaxLength=\"24\" FixedLength=\"false\" Unicode=\"true\" />\t\t\t\t<Property Name=\"Fax\" Type=\"Edm.String\" MaxLength=\"24\" FixedLength=\"false\" Unicode=\"true\" />\t\t\t\t<NavigationProperty Name=\"Orders\" Relationship=\"NorthwindModel.FK_Orders_Customers\" ToRole=\"Orders\"\t\t\t\t\tFromRole=\"Customers\" />\t\t\t\t<NavigationProperty Name=\"CustomerDemographics\" Relationship=\"NorthwindModel.CustomerCustomerDemo\"\t\t\t\t\tToRole=\"CustomerDemographics\" FromRole=\"Customers\" />\t\t\t</EntityType>\t\t\t<EntityType Name=\"Employee\">\t\t\t\t<Key>\t\t\t\t\t<PropertyRef Name=\"EmployeeID\" />\t\t\t\t</Key>\t\t\t\t<Property Name=\"EmployeeID\" Type=\"Edm.Int32\" Nullable=\"false\" p6:StoreGeneratedPattern=\"Identity\"\t\t\t\t\txmlns:p6=\"http://schemas.microsoft.com/ado/2009/02/edm/annotation\" />\t\t\t\t<Property Name=\"LastName\" Type=\"Edm.String\" Nullable=\"false\" MaxLength=\"20\" FixedLength=\"false\" Unicode=\"true\" />\t\t\t\t<Property Name=\"FirstName\" Type=\"Edm.String\" Nullable=\"false\" MaxLength=\"10\" FixedLength=\"false\" Unicode=\"true\" />\t\t\t\t<Property Name=\"Title\" Type=\"Edm.String\" MaxLength=\"30\" FixedLength=\"false\" Unicode=\"true\" />\t\t\t\t<Property Name=\"TitleOfCourtesy\" Type=\"Edm.String\" MaxLength=\"25\" FixedLength=\"false\" Unicode=\"true\" />\t\t\t\t<Property Name=\"BirthDate\" Type=\"Edm.DateTime\" />\t\t\t\t<Property Name=\"HireDate\" Type=\"Edm.DateTime\" />\t\t\t\t<Property Name=\"Address\" Type=\"Edm.String\" MaxLength=\"60\" FixedLength=\"false\" Unicode=\"true\" />\t\t\t\t<Property Name=\"City\" Type=\"Edm.String\" MaxLength=\"15\" FixedLength=\"false\" Unicode=\"true\" />\t\t\t\t<Property Name=\"Region\" Type=\"Edm.String\" MaxLength=\"15\" FixedLength=\"false\" Unicode=\"true\" />\t\t\t\t<Property Name=\"PostalCode\" Type=\"Edm.String\" MaxLength=\"10\" FixedLength=\"false\" Unicode=\"true\" />\t\t\t\t<Property Name=\"Country\" Type=\"Edm.String\" MaxLength=\"15\" FixedLength=\"false\" Unicode=\"true\" />\t\t\t\t<Property Name=\"HomePhone\" Type=\"Edm.String\" MaxLength=\"24\" FixedLength=\"false\" Unicode=\"true\" />\t\t\t\t<Property Name=\"Extension\" Type=\"Edm.String\" MaxLength=\"4\" FixedLength=\"false\" Unicode=\"true\" />\t\t\t\t<Property Name=\"Photo\" Type=\"Edm.Binary\" MaxLength=\"Max\" FixedLength=\"false\" />\t\t\t\t<Property Name=\"Notes\" Type=\"Edm.String\" MaxLength=\"Max\" FixedLength=\"false\" Unicode=\"true\" />\t\t\t\t<Property Name=\"ReportsTo\" Type=\"Edm.Int32\" />\t\t\t\t<Property Name=\"PhotoPath\" Type=\"Edm.String\" MaxLength=\"255\" FixedLength=\"false\" Unicode=\"true\" />\t\t\t\t<NavigationProperty Name=\"Employees1\" Relationship=\"NorthwindModel.FK_Employees_Employees\"\t\t\t\t\tToRole=\"Employees1\" FromRole=\"Employees\" />\t\t\t\t<NavigationProperty Name=\"Employee1\" Relationship=\"NorthwindModel.FK_Employees_Employees\" ToRole=\"Employees\"\t\t\t\t\tFromRole=\"Employees1\" />\t\t\t\t<NavigationProperty Name=\"Orders\" Relationship=\"NorthwindModel.FK_Orders_Employees\" ToRole=\"Orders\"\t\t\t\t\tFromRole=\"Employees\" />\t\t\t\t<NavigationProperty Name=\"Territories\" Relationship=\"NorthwindModel.EmployeeTerritories\" ToRole=\"Territories\"\t\t\t\t\tFromRole=\"Employees\" />\t\t\t</EntityType>\t\t\t<EntityType Name=\"Order_Detail\">\t\t\t\t<Key>\t\t\t\t\t<PropertyRef Name=\"OrderID\" />\t\t\t\t\t<PropertyRef Name=\"ProductID\" />\t\t\t\t</Key>\t\t\t\t<Property Name=\"OrderID\" Type=\"Edm.Int32\" Nullable=\"false\" />\t\t\t\t<Property Name=\"ProductID\" Type=\"Edm.Int32\" Nullable=\"false\" />\t\t\t\t<Property Name=\"UnitPrice\" Type=\"Edm.Decimal\" Nullable=\"false\" Precision=\"19\" Scale=\"4\" />\t\t\t\t<Property Name=\"Quantity\" Type=\"Edm.Int16\" Nullable=\"false\" />\t\t\t\t<Property Name=\"Discount\" Type=\"Edm.Single\" Nullable=\"false\" />\t\t\t\t<NavigationProperty Name=\"Order\" Relationship=\"NorthwindModel.FK_Order_Details_Orders\" ToRole=\"Orders\"\t\t\t\t\tFromRole=\"Order_Details\" />\t\t\t\t<NavigationProperty Name=\"Product\" Relationship=\"NorthwindModel.FK_Order_Details_Products\"\t\t\t\t\tToRole=\"Products\" FromRole=\"Order_Details\" />\t\t\t</EntityType>\t\t\t<EntityType Name=\"Order\">\t\t\t\t<Key>\t\t\t\t\t<PropertyRef Name=\"OrderID\" />\t\t\t\t</Key>\t\t\t\t<Property Name=\"OrderID\" Type=\"Edm.Int32\" Nullable=\"false\" p6:StoreGeneratedPattern=\"Identity\"\t\t\t\t\txmlns:p6=\"http://schemas.microsoft.com/ado/2009/02/edm/annotation\" />\t\t\t\t<Property Name=\"CustomerID\" Type=\"Edm.String\" MaxLength=\"5\" FixedLength=\"true\" Unicode=\"true\" />\t\t\t\t<Property Name=\"EmployeeID\" Type=\"Edm.Int32\" />\t\t\t\t<Property Name=\"OrderDate\" Type=\"Edm.DateTime\" />\t\t\t\t<Property Name=\"RequiredDate\" Type=\"Edm.DateTime\" />\t\t\t\t<Property Name=\"ShippedDate\" Type=\"Edm.DateTime\" />\t\t\t\t<Property Name=\"ShipVia\" Type=\"Edm.Int32\" />\t\t\t\t<Property Name=\"Freight\" Type=\"Edm.Decimal\" Precision=\"19\" Scale=\"4\" />\t\t\t\t<Property Name=\"ShipName\" Type=\"Edm.String\" MaxLength=\"40\" FixedLength=\"false\" Unicode=\"true\" />\t\t\t\t<Property Name=\"ShipAddress\" Type=\"Edm.String\" MaxLength=\"60\" FixedLength=\"false\" Unicode=\"true\" />\t\t\t\t<Property Name=\"ShipCity\" Type=\"Edm.String\" MaxLength=\"15\" FixedLength=\"false\" Unicode=\"true\" />\t\t\t\t<Property Name=\"ShipRegion\" Type=\"Edm.String\" MaxLength=\"15\" FixedLength=\"false\" Unicode=\"true\" />\t\t\t\t<Property Name=\"ShipPostalCode\" Type=\"Edm.String\" MaxLength=\"10\" FixedLength=\"false\" Unicode=\"true\" />\t\t\t\t<Property Name=\"ShipCountry\" Type=\"Edm.String\" MaxLength=\"15\" FixedLength=\"false\" Unicode=\"true\" />\t\t\t\t<NavigationProperty Name=\"Customer\" Relationship=\"NorthwindModel.FK_Orders_Customers\" ToRole=\"Customers\"\t\t\t\t\tFromRole=\"Orders\" />\t\t\t\t<NavigationProperty Name=\"Employee\" Relationship=\"NorthwindModel.FK_Orders_Employees\" ToRole=\"Employees\"\t\t\t\t\tFromRole=\"Orders\" />\t\t\t\t<NavigationProperty Name=\"Order_Details\" Relationship=\"NorthwindModel.FK_Order_Details_Orders\"\t\t\t\t\tToRole=\"Order_Details\" FromRole=\"Orders\" />\t\t\t\t<NavigationProperty Name=\"Shipper\" Relationship=\"NorthwindModel.FK_Orders_Shippers\" ToRole=\"Shippers\"\t\t\t\t\tFromRole=\"Orders\" />\t\t\t</EntityType>\t\t\t<EntityType Name=\"Product\">\t\t\t\t<Key>\t\t\t\t\t<PropertyRef Name=\"ProductID\" />\t\t\t\t</Key>\t\t\t\t<Property Name=\"ProductID\" Type=\"Edm.Int32\" Nullable=\"false\" p6:StoreGeneratedPattern=\"Identity\"\t\t\t\t\txmlns:p6=\"http://schemas.microsoft.com/ado/2009/02/edm/annotation\" />\t\t\t\t<Property Name=\"ProductName\" Type=\"Edm.String\" Nullable=\"false\" MaxLength=\"40\" FixedLength=\"false\" Unicode=\"true\" />\t\t\t\t<Property Name=\"SupplierID\" Type=\"Edm.Int32\" />\t\t\t\t<Property Name=\"CategoryID\" Type=\"Edm.Int32\" />\t\t\t\t<Property Name=\"QuantityPerUnit\" Type=\"Edm.String\" MaxLength=\"20\" FixedLength=\"false\" Unicode=\"true\" />\t\t\t\t<Property Name=\"UnitPrice\" Type=\"Edm.Decimal\" Precision=\"19\" Scale=\"4\" />\t\t\t\t<Property Name=\"UnitsInStock\" Type=\"Edm.Int16\" />\t\t\t\t<Property Name=\"UnitsOnOrder\" Type=\"Edm.Int16\" />\t\t\t\t<Property Name=\"ReorderLevel\" Type=\"Edm.Int16\" />\t\t\t\t<Property Name=\"Discontinued\" Type=\"Edm.Boolean\" Nullable=\"false\" />\t\t\t\t<NavigationProperty Name=\"Category\" Relationship=\"NorthwindModel.FK_Products_Categories\" ToRole=\"Categories\"\t\t\t\t\tFromRole=\"Products\" />\t\t\t\t<NavigationProperty Name=\"Order_Details\" Relationship=\"NorthwindModel.FK_Order_Details_Products\"\t\t\t\t\tToRole=\"Order_Details\" FromRole=\"Products\" />\t\t\t\t<NavigationProperty Name=\"Supplier\" Relationship=\"NorthwindModel.FK_Products_Suppliers\" ToRole=\"Suppliers\"\t\t\t\t\tFromRole=\"Products\" />\t\t\t</EntityType>\t\t\t<EntityType Name=\"Region\">\t\t\t\t<Key>\t\t\t\t\t<PropertyRef Name=\"RegionID\" />\t\t\t\t</Key>\t\t\t\t<Property Name=\"RegionID\" Type=\"Edm.Int32\" Nullable=\"false\" />\t\t\t\t<Property Name=\"RegionDescription\" Type=\"Edm.String\" Nullable=\"false\" MaxLength=\"50\" FixedLength=\"true\"\t\t\t\t\tUnicode=\"true\" />\t\t\t\t<NavigationProperty Name=\"Territories\" Relationship=\"NorthwindModel.FK_Territories_Region\"\t\t\t\t\tToRole=\"Territories\" FromRole=\"Region\" />\t\t\t</EntityType>\t\t\t<EntityType Name=\"Shipper\">\t\t\t\t<Key>\t\t\t\t\t<PropertyRef Name=\"ShipperID\" />\t\t\t\t</Key>\t\t\t\t<Property Name=\"ShipperID\" Type=\"Edm.Int32\" Nullable=\"false\" p6:StoreGeneratedPattern=\"Identity\"\t\t\t\t\txmlns:p6=\"http://schemas.microsoft.com/ado/2009/02/edm/annotation\" />\t\t\t\t<Property Name=\"CompanyName\" Type=\"Edm.String\" Nullable=\"false\" MaxLength=\"40\" FixedLength=\"false\" Unicode=\"true\" />\t\t\t\t<Property Name=\"Phone\" Type=\"Edm.String\" MaxLength=\"24\" FixedLength=\"false\" Unicode=\"true\" />\t\t\t\t<NavigationProperty Name=\"Orders\" Relationship=\"NorthwindModel.FK_Orders_Shippers\" ToRole=\"Orders\"\t\t\t\t\tFromRole=\"Shippers\" />\t\t\t</EntityType>\t\t\t<EntityType Name=\"Supplier\">\t\t\t\t<Key>\t\t\t\t\t<PropertyRef Name=\"SupplierID\" />\t\t\t\t</Key>\t\t\t\t<Property Name=\"SupplierID\" Type=\"Edm.Int32\" Nullable=\"false\" p6:StoreGeneratedPattern=\"Identity\"\t\t\t\t\txmlns:p6=\"http://schemas.microsoft.com/ado/2009/02/edm/annotation\" />\t\t\t\t<Property Name=\"CompanyName\" Type=\"Edm.String\" Nullable=\"false\" MaxLength=\"40\" FixedLength=\"false\" Unicode=\"true\" />\t\t\t\t<Property Name=\"ContactName\" Type=\"Edm.String\" MaxLength=\"30\" FixedLength=\"false\" Unicode=\"true\" />\t\t\t\t<Property Name=\"ContactTitle\" Type=\"Edm.String\" MaxLength=\"30\" FixedLength=\"false\" Unicode=\"true\" />\t\t\t\t<Property Name=\"Address\" Type=\"Edm.String\" MaxLength=\"60\" FixedLength=\"false\" Unicode=\"true\" />\t\t\t\t<Property Name=\"City\" Type=\"Edm.String\" MaxLength=\"15\" FixedLength=\"false\" Unicode=\"true\" />\t\t\t\t<Property Name=\"Region\" Type=\"Edm.String\" MaxLength=\"15\" FixedLength=\"false\" Unicode=\"true\" />\t\t\t\t<Property Name=\"PostalCode\" Type=\"Edm.String\" MaxLength=\"10\" FixedLength=\"false\" Unicode=\"true\" />\t\t\t\t<Property Name=\"Country\" Type=\"Edm.String\" MaxLength=\"15\" FixedLength=\"false\" Unicode=\"true\" />\t\t\t\t<Property Name=\"Phone\" Type=\"Edm.String\" MaxLength=\"24\" FixedLength=\"false\" Unicode=\"true\" />\t\t\t\t<Property Name=\"Fax\" Type=\"Edm.String\" MaxLength=\"24\" FixedLength=\"false\" Unicode=\"true\" />\t\t\t\t<Property Name=\"HomePage\" Type=\"Edm.String\" MaxLength=\"Max\" FixedLength=\"false\" Unicode=\"true\" />\t\t\t\t<NavigationProperty Name=\"Products\" Relationship=\"NorthwindModel.FK_Products_Suppliers\" ToRole=\"Products\"\t\t\t\t\tFromRole=\"Suppliers\" />\t\t\t</EntityType>\t\t\t<EntityType Name=\"Territory\">\t\t\t\t<Key>\t\t\t\t\t<PropertyRef Name=\"TerritoryID\" />\t\t\t\t</Key>\t\t\t\t<Property Name=\"TerritoryID\" Type=\"Edm.String\" Nullable=\"false\" MaxLength=\"20\" FixedLength=\"false\" Unicode=\"true\" />\t\t\t\t<Property Name=\"TerritoryDescription\" Type=\"Edm.String\" Nullable=\"false\" MaxLength=\"50\" FixedLength=\"true\"\t\t\t\t\tUnicode=\"true\" />\t\t\t\t<Property Name=\"RegionID\" Type=\"Edm.Int32\" Nullable=\"false\" />\t\t\t\tNavigationProperty Name=\"Region\" Relationship=\"NorthwindModel.FK_Territories_Region\" ToRole=\"Region\"\t\t\t\tFromRole=\"Territories\" />\t\t\t\t<NavigationProperty Name=\"Employees\" Relationship=\"NorthwindModel.EmployeeTerritories\" ToRole=\"Employees\"\t\t\t\t\tFromRole=\"Territories\" />\t\t\t</EntityType>\t\t\t<EntityType Name=\"Alphabetical_list_of_product\">\t\t\t\t<Key>\t\t\t\t\t<PropertyRef Name=\"CategoryName\" />\t\t\t\t\t<PropertyRef Name=\"Discontinued\" />\t\t\t\t\t<PropertyRef Name=\"ProductID\" />\t\t\t\t\t<PropertyRef Name=\"ProductName\" />\t\t\t\t</Key>\t\t\t\t<Property Name=\"ProductID\" Type=\"Edm.Int32\" Nullable=\"false\" />\t\t\t\t<Property Name=\"ProductName\" Type=\"Edm.String\" Nullable=\"false\" MaxLength=\"40\" FixedLength=\"false\" Unicode=\"true\" />\t\t\t\t<Property Name=\"SupplierID\" Type=\"Edm.Int32\" />\t\t\t\t<Property Name=\"CategoryID\" Type=\"Edm.Int32\" />\t\t\t\t<Property Name=\"QuantityPerUnit\" Type=\"Edm.String\" MaxLength=\"20\" FixedLength=\"false\" Unicode=\"true\" />\t\t\t\t<Property Name=\"UnitPrice\" Type=\"Edm.Decimal\" Precision=\"19\" Scale=\"4\" />\t\t\t\t<Property Name=\"UnitsInStock\" Type=\"Edm.Int16\" />\t\t\t\t<Property Name=\"UnitsOnOrder\" Type=\"Edm.Int16\" />\t\t\t\t<Property Name=\"ReorderLevel\" Type=\"Edm.Int16\" />\t\t\t\t<Property Name=\"Discontinued\" Type=\"Edm.Boolean\" Nullable=\"false\" />\t\t\t\t<Property Name=\"CategoryName\" Type=\"Edm.String\" Nullable=\"false\" MaxLength=\"15\" FixedLength=\"false\"\t\t\t\t\tUnicode=\"true\" />\t\t\t</EntityType>\t\t\t<EntityType Name=\"Category_Sales_for_1997\">\t\t\t\t<Key>\t\t\t\t\t<PropertyRef Name=\"CategoryName\" />\t\t\t\t</Key>\t\t\t\t<Property Name=\"CategoryName\" Type=\"Edm.String\" Nullable=\"false\" MaxLength=\"15\" FixedLength=\"false\"\t\t\t\t\tUnicode=\"true\" />\t\t\t\t<Property Name=\"CategorySales\" Type=\"Edm.Decimal\" Precision=\"19\" Scale=\"4\" />\t\t\t</EntityType>\t\t\t<EntityType Name=\"Current_Product_List\">\t\t\t\t<Key>\t\t\t\t\t<PropertyRef Name=\"ProductID\" />\t\t\t\t\t<PropertyRef Name=\"ProductName\" />\t\t\t\t</Key>\t\t\t\t<Property Name=\"ProductID\" Type=\"Edm.Int32\" Nullable=\"false\" p6:StoreGeneratedPattern=\"Identity\"\t\t\t\t\txmlns:p6=\"http://schemas.microsoft.com/ado/2009/02/edm/annotation\" />\t\t\t\t<Property Name=\"ProductName\" Type=\"Edm.String\" Nullable=\"false\" MaxLength=\"40\" FixedLength=\"false\" Unicode=\"true\" />\t\t\t</EntityType>\t\t\t<EntityType Name=\"Customer_and_Suppliers_by_City\">\t\t\t\t<Key>\t\t\t\t\t<PropertyRef Name=\"CompanyName\" />\t\t\t\t\t<PropertyRef Name=\"Relationship\" />\t\t\t\t</Key>\t\t\t\t<Property Name=\"City\" Type=\"Edm.String\" MaxLength=\"15\" FixedLength=\"false\" Unicode=\"true\" />\t\t\t\t<Property Name=\"CompanyName\" Type=\"Edm.String\" Nullable=\"false\" MaxLength=\"40\" FixedLength=\"false\" Unicode=\"true\" />\t\t\t\t<Property Name=\"ContactName\" Type=\"Edm.String\" MaxLength=\"30\" FixedLength=\"false\" Unicode=\"true\" />\t\t\t\t<Property Name=\"Relationship\" Type=\"Edm.String\" Nullable=\"false\" MaxLength=\"9\" FixedLength=\"false\" Unicode=\"false\" />\t\t\t</EntityType>\t\t\t<EntityType Name=\"Invoice\">\t\t\t\t<Key>\t\t\t\t\t<PropertyRef Name=\"CustomerName\" />\t\t\t\t\t<PropertyRef Name=\"Discount\" />\t\t\t\t\t<PropertyRef Name=\"OrderID\" />\t\t\t\t\t<PropertyRef Name=\"ProductID\" />\t\t\t\t\t<PropertyRef Name=\"ProductName\" />\t\t\t\t\t<PropertyRef Name=\"Quantity\" />\t\t\t\t\t<PropertyRef Name=\"Salesperson\" />\t\t\t\t\t<PropertyRef Name=\"ShipperName\" />\t\t\t\t\t<PropertyRef Name=\"UnitPrice\" />\t\t\t\t</Key>\t\t\t\t<Property Name=\"ShipName\" Type=\"Edm.String\" MaxLength=\"40\" FixedLength=\"false\" Unicode=\"true\" />\t\t\t\t<Property Name=\"ShipAddress\" Type=\"Edm.String\" MaxLength=\"60\" FixedLength=\"false\" Unicode=\"true\" />\t\t\t\t<Property Name=\"ShipCity\" Type=\"Edm.String\" MaxLength=\"15\" FixedLength=\"false\" Unicode=\"true\" />\t\t\t\t<Property Name=\"ShipRegion\" Type=\"Edm.String\" MaxLength=\"15\" FixedLength=\"false\" Unicode=\"true\" />\t\t\t\t<Property Name=\"ShipPostalCode\" Type=\"Edm.String\" MaxLength=\"10\" FixedLength=\"false\" Unicode=\"true\" />\t\t\t\t<Property Name=\"ShipCountry\" Type=\"Edm.String\" MaxLength=\"15\" FixedLength=\"false\" Unicode=\"true\" />\t\t\t\t<Property Name=\"CustomerID\" Type=\"Edm.String\" MaxLength=\"5\" FixedLength=\"true\" Unicode=\"true\" />\t\t\t\t<Property Name=\"CustomerName\" Type=\"Edm.String\" Nullable=\"false\" MaxLength=\"40\" FixedLength=\"false\"\t\t\t\t\tUnicode=\"true\" />\t\t\t\t<Property Name=\"Address\" Type=\"Edm.String\" MaxLength=\"60\" FixedLength=\"false\" Unicode=\"true\" />\t\t\t\t<Property Name=\"City\" Type=\"Edm.String\" MaxLength=\"15\" FixedLength=\"false\" Unicode=\"true\" />\t\t\t\t<Property Name=\"Region\" Type=\"Edm.String\" MaxLength=\"15\" FixedLength=\"false\" Unicode=\"true\" />\t\t\t\t<Property Name=\"PostalCode\" Type=\"Edm.String\" MaxLength=\"10\" FixedLength=\"false\" Unicode=\"true\" />\t\t\t\t<Property Name=\"Country\" Type=\"Edm.String\" MaxLength=\"15\" FixedLength=\"false\" Unicode=\"true\" />\t\t\t\t<Property Name=\"Salesperson\" Type=\"Edm.String\" Nullable=\"false\" MaxLength=\"31\" FixedLength=\"false\" Unicode=\"true\" />\t\t\t\t<Property Name=\"OrderID\" Type=\"Edm.Int32\" Nullable=\"false\" />\t\t\t\t<Property Name=\"OrderDate\" Type=\"Edm.DateTime\" />\t\t\t\t<Property Name=\"RequiredDate\" Type=\"Edm.DateTime\" />\t\t\t\t<Property Name=\"ShippedDate\" Type=\"Edm.DateTime\" />\t\t\t\t<Property Name=\"ShipperName\" Type=\"Edm.String\" Nullable=\"false\" MaxLength=\"40\" FixedLength=\"false\" Unicode=\"true\" />\t\t\t\t<Property Name=\"ProductID\" Type=\"Edm.Int32\" Nullable=\"false\" />\t\t\t\t<Property Name=\"ProductName\" Type=\"Edm.String\" Nullable=\"false\" MaxLength=\"40\" FixedLength=\"false\" Unicode=\"true\" />\t\t\t\t<Property Name=\"UnitPrice\" Type=\"Edm.Decimal\" Nullable=\"false\" Precision=\"19\" Scale=\"4\" />\t\t\t\t<Property Name=\"Quantity\" Type=\"Edm.Int16\" Nullable=\"false\" />\t\t\t\t<Property Name=\"Discount\" Type=\"Edm.Single\" Nullable=\"false\" />\t\t\t\t<Property Name=\"ExtendedPrice\" Type=\"Edm.Decimal\" Precision=\"19\" Scale=\"4\" />\t\t\t\t<Property Name=\"Freight\" Type=\"Edm.Decimal\" Precision=\"19\" Scale=\"4\" />\t\t\t</EntityType>\t\t\t<EntityType Name=\"Order_Details_Extended\">\t\t\t\t<Key>\t\t\t\t\t<PropertyRef Name=\"Discount\" />\t\t\t\t\t<PropertyRef Name=\"OrderID\" />\t\t\t\t\t<PropertyRef Name=\"ProductID\" />\t\t\t\t\t<PropertyRef Name=\"ProductName\" />\t\t\t\t\t<PropertyRef Name=\"Quantity\" />\t\t\t\t\t<PropertyRef Name=\"UnitPrice\" />\t\t\t\t</Key>\t\t\t\t<Property Name=\"OrderID\" Type=\"Edm.Int32\" Nullable=\"false\" />\t\t\t\t<Property Name=\"ProductID\" Type=\"Edm.Int32\" Nullable=\"false\" />\t\t\t\t<Property Name=\"ProductName\" Type=\"Edm.String\" Nullable=\"false\" MaxLength=\"40\" FixedLength=\"false\" Unicode=\"true\" />\t\t\t\t<Property Name=\"UnitPrice\" Type=\"Edm.Decimal\" Nullable=\"false\" Precision=\"19\" Scale=\"4\" />\t\t\t\t<Property Name=\"Quantity\" Type=\"Edm.Int16\" Nullable=\"false\" />\t\t\t\t<Property Name=\"Discount\" Type=\"Edm.Single\" Nullable=\"false\" />\t\t\t\t<Property Name=\"ExtendedPrice\" Type=\"Edm.Decimal\" Precision=\"19\" Scale=\"4\" />\t\t\t</EntityType>\t\t\t<EntityType Name=\"Order_Subtotal\">\t\t\t\t<Key>\t\t\t\t\t<PropertyRef Name=\"OrderID\" />\t\t\t\t</Key>\t\t\t\t<Property Name=\"OrderID\" Type=\"Edm.Int32\" Nullable=\"false\" />\t\t\t\t<Property Name=\"Subtotal\" Type=\"Edm.Decimal\" Precision=\"19\" Scale=\"4\" />\t\t\t</EntityType>\t\t\t<EntityType Name=\"Orders_Qry\">\t\t\t\t<Key>\t\t\t\t\t<PropertyRef Name=\"CompanyName\" />\t\t\t\t\t<PropertyRef Name=\"OrderID\" />\t\t\t\t</Key>\t\t\t\t<Property Name=\"OrderID\" Type=\"Edm.Int32\" Nullable=\"false\" />\t\t\t\t<Property Name=\"CustomerID\" Type=\"Edm.String\" MaxLength=\"5\" FixedLength=\"true\" Unicode=\"true\" />\t\t\t\t<Property Name=\"EmployeeID\" Type=\"Edm.Int32\" />\t\t\t\t<Property Name=\"OrderDate\" Type=\"Edm.DateTime\" />\t\t\t\t<Property Name=\"RequiredDate\" Type=\"Edm.DateTime\" />\t\t\t\t<Property Name=\"ShippedDate\" Type=\"Edm.DateTime\" />\t\t\t\t<Property Name=\"ShipVia\" Type=\"Edm.Int32\" />\t\t\t\t<Property Name=\"Freight\" Type=\"Edm.Decimal\" Precision=\"19\" Scale=\"4\" />\t\t\t\t<Property Name=\"ShipName\" Type=\"Edm.String\" MaxLength=\"40\" FixedLength=\"false\" Unicode=\"true\" />\t\t\t\t<Property Name=\"ShipAddress\" Type=\"Edm.String\" MaxLength=\"60\" FixedLength=\"false\" Unicode=\"true\" />\t\t\t\t<Property Name=\"ShipCity\" Type=\"Edm.String\" MaxLength=\"15\" FixedLength=\"false\" Unicode=\"true\" />\t\t\t\t<Property Name=\"ShipRegion\" Type=\"Edm.String\" MaxLength=\"15\" FixedLength=\"false\" Unicode=\"true\" />\t\t\t\t<Property Name=\"ShipPostalCode\" Type=\"Edm.String\" MaxLength=\"10\" FixedLength=\"false\" Unicode=\"true\" />\t\t\t\t<Property Name=\"ShipCountry\" Type=\"Edm.String\" MaxLength=\"15\" FixedLength=\"false\" Unicode=\"true\" />\t\t\t\t<Property Name=\"CompanyName\" Type=\"Edm.String\" Nullable=\"false\" MaxLength=\"40\" FixedLength=\"false\" Unicode=\"true\" />\t\t\t\t<Property Name=\"Address\" Type=\"Edm.String\" MaxLength=\"60\" FixedLength=\"false\" Unicode=\"true\" />\t\t\t\t<Property Name=\"City\" Type=\"Edm.String\" MaxLength=\"15\" FixedLength=\"false\" Unicode=\"true\" />\t\t\t\t<Property Name=\"Region\" Type=\"Edm.String\" MaxLength=\"15\" FixedLength=\"false\" Unicode=\"true\" />\t\t\t\t<Property Name=\"PostalCode\" Type=\"Edm.String\" MaxLength=\"10\" FixedLength=\"false\" Unicode=\"true\" />\t\t\t\t<Property Name=\"Country\" Type=\"Edm.String\" MaxLength=\"15\" FixedLength=\"false\" Unicode=\"true\" />\t\t\t</EntityType>\t\t\t<EntityType Name=\"Product_Sales_for_1997\">\t\t\t\t<Key>\t\t\t\t\t<PropertyRef Name=\"CategoryName\" />\t\t\t\t\t<PropertyRef Name=\"ProductName\" />\t\t\t\t</Key>\t\t\t\t<Property Name=\"CategoryName\" Type=\"Edm.String\" Nullable=\"false\" MaxLength=\"15\" FixedLength=\"false\"\t\t\t\t\tUnicode=\"true\" />\t\t\t\tProperty Name=\"ProductName\" Type=\"Edm.String\" Nullable=\"false\" MaxLength=\"40\" FixedLength=\"false\" Unicode=\"true\" />\t\t\t\t<Property Name=\"ProductSales\" Type=\"Edm.Decimal\" Precision=\"19\" Scale=\"4\" />\t\t\t</EntityType>\t\t\t<EntityType Name=\"Products_Above_Average_Price\">\t\t\t\t<Key>\t\t\t\t\t<PropertyRef Name=\"ProductName\" />\t\t\t\t</Key>\t\t\t\t<Property Name=\"ProductName\" Type=\"Edm.String\" Nullable=\"false\" MaxLength=\"40\" FixedLength=\"false\" Unicode=\"true\" />\t\t\t\t<Property Name=\"UnitPrice\" Type=\"Edm.Decimal\" Precision=\"19\" Scale=\"4\" />\t\t\t</EntityType>\t\t\t<EntityType Name=\"Products_by_Category\">\t\t\t\t<Key>\t\t\t\t\t<PropertyRef Name=\"CategoryName\" />\t\t\t\t\t<PropertyRef Name=\"Discontinued\" />\t\t\t\t\t<PropertyRef Name=\"ProductName\" />\t\t\t\t</Key>\t\t\t\t<Property Name=\"CategoryName\" Type=\"Edm.String\" Nullable=\"false\" MaxLength=\"15\" FixedLength=\"false\"\t\t\t\t\tUnicode=\"true\" />\t\t\t\t<Property Name=\"ProductName\" Type=\"Edm.String\" Nullable=\"false\" MaxLength=\"40\" FixedLength=\"false\" Unicode=\"true\" />\t\t\t\t<Property Name=\"QuantityPerUnit\" Type=\"Edm.String\" MaxLength=\"20\" FixedLength=\"false\" Unicode=\"true\" />\t\t\t\t<Property Name=\"UnitsInStock\" Type=\"Edm.Int16\" />\t\t\t\t<Property Name=\"Discontinued\" Type=\"Edm.Boolean\" Nullable=\"false\" />\t\t\t</EntityType>\t\t\t<EntityType Name=\"Sales_by_Category\">\t\t\t\t<Key>\t\t\t\t\t<PropertyRef Name=\"CategoryID\" />\t\t\t\t\t<PropertyRef Name=\"CategoryName\" />\t\t\t\t\t<PropertyRef Name=\"ProductName\" />\t\t\t\t</Key>\t\t\t\t<Property Name=\"CategoryID\" Type=\"Edm.Int32\" Nullable=\"false\" />\t\t\t\t<Property Name=\"CategoryName\" Type=\"Edm.String\" Nullable=\"false\" MaxLength=\"15\" FixedLength=\"false\"\t\t\t\t\tUnicode=\"true\" />\t\t\t\t<Property Name=\"ProductName\" Type=\"Edm.String\" Nullable=\"false\" MaxLength=\"40\" FixedLength=\"false\" Unicode=\"true\" />\t\t\t\t<Property Name=\"ProductSales\" Type=\"Edm.Decimal\" Precision=\"19\" Scale=\"4\" />\t\t\t</EntityType>\t\t\t<EntityType Name=\"Sales_Totals_by_Amount\">\t\t\t\t<Key>\t\t\t\t\t<PropertyRef Name=\"CompanyName\" />\t\t\t\t\t<PropertyRef Name=\"OrderID\" />\t\t\t\t</Key>\t\t\t\t<Property Name=\"SaleAmount\" Type=\"Edm.Decimal\" Precision=\"19\" Scale=\"4\" />\t\t\t\t<Property Name=\"OrderID\" Type=\"Edm.Int32\" Nullable=\"false\" />\t\t\t\t<Property Name=\"CompanyName\" Type=\"Edm.String\" Nullable=\"false\" MaxLength=\"40\" FixedLength=\"false\" Unicode=\"true\" />\t\t\t\t<Property Name=\"ShippedDate\" Type=\"Edm.DateTime\" />\t\t\t</EntityType>\t\t\t<EntityType Name=\"Summary_of_Sales_by_Quarter\">\t\t\t\t<Key>\t\t\t\t\t<PropertyRef Name=\"OrderID\" />\t\t\t\t</Key>\t\t\t\t<Property Name=\"ShippedDate\" Type=\"Edm.DateTime\" />\t\t\t\t<Property Name=\"OrderID\" Type=\"Edm.Int32\" Nullable=\"false\" />\t\t\t\t<Property Name=\"Subtotal\" Type=\"Edm.Decimal\" Precision=\"19\" Scale=\"4\" />\t\t\t</EntityType>\t\t\t<EntityType Name=\"Summary_of_Sales_by_Year\">\t\t\t\t<Key>\t\t\t\t\t<PropertyRef Name=\"OrderID\" />\t\t\t\t</Key>\t\t\t\t<Property Name=\"ShippedDate\" Type=\"Edm.DateTime\" />\t\t\t\t<Property Name=\"OrderID\" Type=\"Edm.Int32\" Nullable=\"false\" />\t\t\t\t<Property Name=\"Subtotal\" Type=\"Edm.Decimal\" Precision=\"19\" Scale=\"4\" />\t\t\t</EntityType>\t\t\t<Association Name=\"FK_Products_Categories\">\t\t\t\t<End Type=\"NorthwindModel.Category\" Role=\"Categories\" Multiplicity=\"0..1\" />\t\t\t\t<End Type=\"NorthwindModel.Product\" Role=\"Products\" Multiplicity=\"*\" />\t\t\t\t<ReferentialConstraint>\t\t\t\t\t<Principal Role=\"Categories\">\t\t\t\t\t\t<PropertyRef Name=\"CategoryID\" />\t\t\t\t\t</Principal>\t\t\t\t\t<Dependent Role=\"Products\">\t\t\t\t\t\t<PropertyRef Name=\"CategoryID\" />\t\t\t\t\t</Dependent>\t\t\t\t</ReferentialConstraint>\t\t\t</Association>\t\t\t<Association Name=\"CustomerCustomerDemo\">\t\t\t\t<End Type=\"NorthwindModel.Customer\" Role=\"Customers\" Multiplicity=\"*\" />\t\t\t\t<End Type=\"NorthwindModel.CustomerDemographic\" Role=\"CustomerDemographics\" Multiplicity=\"*\" />\t\t\t</Association>\t\t\t<Association Name=\"FK_Orders_Customers\">\t\t\t\t<End Type=\"NorthwindModel.Customer\" Role=\"Customers\" Multiplicity=\"0..1\" />\t\t\t\t<End Type=\"NorthwindModel.Order\" Role=\"Orders\" Multiplicity=\"*\" />\t\t\t\t<ReferentialConstraint>\t\t\t\t\t<Principal Role=\"Customers\">\t\t\t\t\t\t<PropertyRef Name=\"CustomerID\" />\t\t\t\t\t</Principal>\t\t\t\t\t<Dependent Role=\"Orders\">\t\t\t\t\t\t<PropertyRef Name=\"CustomerID\" />\t\t\t\t\t</Dependent>\t\t\t\t</ReferentialConstraint>\t\t\t</Association>\t\t\t<Association Name=\"FK_Employees_Employees\">\t\t\t\t<End Type=\"NorthwindModel.Employee\" Role=\"Employees\" Multiplicity=\"0..1\" />\t\t\t\t<End Type=\"NorthwindModel.Employee\" Role=\"Employees1\" Multiplicity=\"*\" />\t\t\t\t<ReferentialConstraint>\t\t\t\t\t<Principal Role=\"Employees\">\t\t\t\t\t\t<PropertyRef Name=\"EmployeeID\" />\t\t\t\t\t</Principal>\t\t\t\t\t<Dependent Role=\"Employees1\">\t\t\t\t\t\t<PropertyRef Name=\"ReportsTo\" />\t\t\t\t\t</Dependent>\t\t\t\t</ReferentialConstraint>\t\t\t</Association>\t\t\t<Association Name=\"FK_Orders_Employees\">\t\t\t\t<End Type=\"NorthwindModel.Employee\" Role=\"Employees\" Multiplicity=\"0..1\" />\t\t\t\t<End Type=\"NorthwindModel.Order\" Role=\"Orders\" Multiplicity=\"*\" />\t\t\t\t<ReferentialConstraint>\t\t\t\t\t<Principal Role=\"Employees\">\t\t\t\t\t\t<PropertyRef Name=\"EmployeeID\" />\t\t\t\t\t</Principal>\t\t\t\t\t<Dependent Role=\"Orders\">\t\t\t\t\t\t<PropertyRef Name=\"EmployeeID\" />\t\t\t\t\t</Dependent>\t\t\t\t</ReferentialConstraint>\t\t\t</Association>\t\t\t<Association Name=\"EmployeeTerritories\">\t\t\t\t<End Type=\"NorthwindModel.Territory\" Role=\"Territories\" Multiplicity=\"*\" />\t\t\t\t<End Type=\"NorthwindModel.Employee\" Role=\"Employees\" Multiplicity=\"*\" />\t\t\t</Association>\t\t\t<Association Name=\"FK_Order_Details_Orders\">\t\t\t\t<End Type=\"NorthwindModel.Order\" Role=\"Orders\" Multiplicity=\"1\" />\t\t\t\t<End Type=\"NorthwindModel.Order_Detail\" Role=\"Order_Details\" Multiplicity=\"*\" />\t\t\t\t<ReferentialConstraint>\t\t\t\t\t<Principal Role=\"Orders\">\t\t\t\t\t\t<PropertyRef Name=\"OrderID\" />\t\t\t\t\t</Principal>\t\t\t\t\t<Dependent Role=\"Order_Details\">\t\t\t\t\t\t<PropertyRef Name=\"OrderID\" />\t\t\t\t\t</Dependent>\t\t\t\t</ReferentialConstraint>\t\t\t</Association>\t\t\t<Association Name=\"FK_Order_Details_Products\">\t\t\t\t<End Type=\"NorthwindModel.Product\" Role=\"Products\" Multiplicity=\"1\" />\t\t\t\t<End Type=\"NorthwindModel.Order_Detail\" Role=\"Order_Details\" Multiplicity=\"*\" />\t\t\t\t<ReferentialConstraint>\t\t\t\t\t<Principal Role=\"Products\">\t\t\t\t\t\t<PropertyRef Name=\"ProductID\" />\t\t\t\t\t</Principal>\t\t\t\t\t<Dependent Role=\"Order_Details\">\t\t\t\t\t\t<PropertyRef Name=\"ProductID\" />\t\t\t\t\t</Dependent>\t\t\t\t</ReferentialConstraint>\t\t\t</Association>\t\t\t<Association Name=\"FK_Orders_Shippers\">\t\t\t\t<End Type=\"NorthwindModel.Shipper\" Role=\"Shippers\" Multiplicity=\"0..1\" />\t\t\t\t<End Type=\"NorthwindModel.Order\" Role=\"Orders\" Multiplicity=\"*\" />\t\t\t\t<ReferentialConstraint>\t\t\t\t\t<Principal Role=\"Shippers\">\t\t\t\t\t\t<PropertyRef Name=\"ShipperID\" />\t\t\t\t\t</Principal>\t\t\t\t\t<Dependent Role=\"Orders\">\t\t\t\t\t\t<PropertyRef Name=\"ShipVia\" />\t\t\t\t\t</Dependent>\t\t\t\t</ReferentialConstraint>\t\t\t</Association>\t\t\t<Association Name=\"FK_Products_Suppliers\">\t\t\t\t<End Type=\"NorthwindModel.Supplier\" Role=\"Suppliers\" Multiplicity=\"0..1\" />\t\t\t\t<End Type=\"NorthwindModel.Product\" Role=\"Products\" Multiplicity=\"*\" />\t\t\t\t<ReferentialConstraint>\t\t\t\t\t<Principal Role=\"Suppliers\">\t\t\t\t\t\t<PropertyRef Name=\"SupplierID\" />\t\t\t\t\t</Principal>\t\t\t\t\t<Dependent Role=\"Products\">\t\t\t\t\t\t<PropertyRef Name=\"SupplierID\" />\t\t\t\t\t</Dependent>\t\t\t\t</ReferentialConstraint>\t\t\t</Association>\t\t\t<Association Name=\"FK_Territories_Region\">\t\t\t\t<End Type=\"NorthwindModel.Region\" Role=\"Region\" Multiplicity=\"1\" />\t\t\t\t<End Type=\"NorthwindModel.Territory\" Role=\"Territories\" Multiplicity=\"*\" />\t\t\t\t<ReferentialConstraint>\t\t\t\t\t<Principal Role=\"Region\">\t\t\t\t\t\t<PropertyRef Name=\"RegionID\" />\t\t\t\t\t</Principal>\t\t\t\t\t<Dependent Role=\"Territories\">\t\t\t\t\t\t<PropertyRef Name=\"RegionID\" />\t\t\t\t\t</Dependent>\t\t\t\t</ReferentialConstraint>\t\t\t</Association>\t\t\t<EntityContainer Name=\"FunctionImports\">\t\t\t\t<FunctionImport Name=\"functionWithInvalidTarget\" m:HttpMethod=\"POST\">\t\t\t\t</FunctionImport>\t\t\t\t<FunctionImport Name=\"functionWithInvalidReturnType\" ReturnType=\"InvalidReturnType\" m:HttpMethod=\"POST\">\t\t\t\t</FunctionImport>\t\t\t\t<FunctionImport Name=\"functionWithInvalidEntitySet\" EntitySet=\"InvalidEntitySet\" m:HttpMethod=\"POST\">\t\t\t\t</FunctionImport>\t\t\t</EntityContainer>\t\t</Schema>\t\t<Schema Namespace=\"ODataWebV3.Northwind.Model\" xmlns=\"http://schemas.microsoft.com/ado/2008/09/edm\">\t\t\t<EntityContainer Name=\"NorthwindEntities\" m:IsDefaultEntityContainer=\"true\" p6:LazyLoadingEnabled=\"true\"\t\t\t\txmlns:p6=\"http://schemas.microsoft.com/ado/2009/02/edm/annotation\">\t\t\t\t<EntitySet Name=\"Categories\" EntityType=\"NorthwindModel.Category\" />\t\t\t\t<EntitySet Name=\"CustomerDemographics\" EntityType=\"NorthwindModel.CustomerDemographic\" />\t\t\t\t<EntitySet Name=\"Customers\" EntityType=\"NorthwindModel.Customer\" />\t\t\t\t<EntitySet Name=\"Employees\" EntityType=\"NorthwindModel.Employee\" />\t\t\t\t<EntitySet Name=\"Order_Details\" EntityType=\"NorthwindModel.Order_Detail\" />\t\t\t\t<EntitySet Name=\"Orders\" EntityType=\"NorthwindModel.Order\" />\t\t\t\t<EntitySet Name=\"Products\" EntityType=\"NorthwindModel.Product\" />\t\t\t\t<EntitySet Name=\"Regions\" EntityType=\"NorthwindModel.Region\" />\t\t\t\t<EntitySet Name=\"Shippers\" EntityType=\"NorthwindModel.Shipper\" />\t\t\t\t<EntitySet Name=\"Suppliers\" EntityType=\"NorthwindModel.Supplier\" />\t\t\t\t<EntitySet Name=\"Territories\" EntityType=\"NorthwindModel.Territory\" />\t\t\t\t<EntitySet Name=\"Alphabetical_list_of_products\" EntityType=\"NorthwindModel.Alphabetical_list_of_product\" />\t\t\t\t<EntitySet Name=\"Category_Sales_for_1997\" EntityType=\"NorthwindModel.Category_Sales_for_1997\" />\t\t\t\t<EntitySet Name=\"Current_Product_Lists\" EntityType=\"NorthwindModel.Current_Product_List\" />\t\t\t\t<EntitySet Name=\"Customer_and_Suppliers_by_Cities\" EntityType=\"NorthwindModel.Customer_and_Suppliers_by_City\" />\t\t\t\t<EntitySet Name=\"Invoices\" EntityType=\"NorthwindModel.Invoice\" />\t\t\t\t<EntitySet Name=\"Order_Details_Extendeds\" EntityType=\"NorthwindModel.Order_Details_Extended\" />\t\t\t\t<EntitySet Name=\"Order_Subtotals\" EntityType=\"NorthwindModel.Order_Subtotal\" />\t\t\t\t<EntitySet Name=\"Orders_Qries\" EntityType=\"NorthwindModel.Orders_Qry\" />\t\t\t\t<EntitySet Name=\"Product_Sales_for_1997\" EntityType=\"NorthwindModel.Product_Sales_for_1997\" />\t\t\t\t<EntitySet Name=\"Products_Above_Average_Prices\" EntityType=\"NorthwindModel.Products_Above_Average_Price\" />\t\t\t\t<EntitySet Name=\"Products_by_Categories\" EntityType=\"NorthwindModel.Products_by_Category\" />\t\t\t\t<EntitySet Name=\"Sales_by_Categories\" EntityType=\"NorthwindModel.Sales_by_Category\" />\t\t\t\t<EntitySet Name=\"Sales_Totals_by_Amounts\" EntityType=\"NorthwindModel.Sales_Totals_by_Amount\" />\t\t\t\t<EntitySet Name=\"Summary_of_Sales_by_Quarters\" EntityType=\"NorthwindModel.Summary_of_Sales_by_Quarter\" />\t\t\t\t<EntitySet Name=\"Summary_of_Sales_by_Years\" EntityType=\"NorthwindModel.Summary_of_Sales_by_Year\" />\t\t\t\t<AssociationSet Name=\"FK_Products_Categories\" Association=\"NorthwindModel.FK_Products_Categories\">\t\t\t\t\t<End Role=\"Categories\" EntitySet=\"Categories\" />\t\t\t\t\t<End Role=\"Products\" EntitySet=\"Products\" />\t\t\t\t</AssociationSet>\t\t\t\t<AssociationSet Name=\"CustomerCustomerDemo\" Association=\"NorthwindModel.CustomerCustomerDemo\">\t\t\t\t\t<End Role=\"CustomerDemographics\" EntitySet=\"CustomerDemographics\" />\t\t\t\t\t<End Role=\"Customers\" EntitySet=\"Customers\" />\t\t\t\t</AssociationSet>\t\t\t\t<AssociationSet Name=\"FK_Orders_Customers\" Association=\"NorthwindModel.FK_Orders_Customers\">\t\t\t\t\t<End Role=\"Customers\" EntitySet=\"Customers\" />\t\t\t\t\t<End Role=\"Orders\" EntitySet=\"Orders\" />\t\t\t\t</AssociationSet>\t\t\t\t<AssociationSet Name=\"FK_Employees_Employees\" Association=\"NorthwindModel.FK_Employees_Employees\">\t\t\t\t\t<End Role=\"Employees\" EntitySet=\"Employees\" />\t\t\t\t\t<End Role=\"Employees1\" EntitySet=\"Employees\" />\t\t\t\t</AssociationSet>\t\t\t\t<AssociationSet Name=\"FK_Orders_Employees\" Association=\"NorthwindModel.FK_Orders_Employees\">\t\t\t\t\t<End Role=\"Employees\" EntitySet=\"Employees\" />\t\t\t\t\t<End Role=\"Orders\" EntitySet=\"Orders\" />\t\t\t\t</AssociationSet>\t\t\t\t<AssociationSet Name=\"EmployeeTerritories\" Association=\"NorthwindModel.EmployeeTerritories\">\t\t\t\t\t<End Role=\"Employees\" EntitySet=\"Employees\" />\t\t\t\t\t<End Role=\"Territories\" EntitySet=\"Territories\" />\t\t\t\t</AssociationSet>\t\t\t\t<AssociationSet Name=\"FK_Order_Details_Orders\" Association=\"NorthwindModel.FK_Order_Details_Orders\">\t\t\t\t\t<End Role=\"Order_Details\" EntitySet=\"Order_Details\" />\t\t\t\t\t<End Role=\"Orders\" EntitySet=\"Orders\" />\t\t\t\t</AssociationSet>\t\t\t\t<AssociationSet Name=\"FK_Order_Details_Products\" Association=\"NorthwindModel.FK_Order_Details_Products\">\t\t\t\t\t<End Role=\"Order_Details\" EntitySet=\"Order_Details\" />\t\t\t\t\t<End Role=\"Products\" EntitySet=\"Products\" />\t\t\t\t</AssociationSet>\t\t\t\t<AssociationSet Name=\"FK_Orders_Shippers\" Association=\"NorthwindModel.FK_Orders_Shippers\">\t\t\t\t\t<End Role=\"Orders\" EntitySet=\"Orders\" />\t\t\t\t\t<End Role=\"Shippers\" EntitySet=\"Shippers\" />\t\t\t\t</AssociationSet>\t\t\t\t<AssociationSet Name=\"FK_Products_Suppliers\" Association=\"NorthwindModel.FK_Products_Suppliers\">\t\t\t\t\t<End Role=\"Products\" EntitySet=\"Products\" />\t\t\t\t\t<End Role=\"Suppliers\" EntitySet=\"Suppliers\" />\t\t\t\t</AssociationSet>\t\t\t\t<AssociationSet Name=\"FK_Territories_Region\" Association=\"NorthwindModel.FK_Territories_Region\">\t\t\t\t\t<End Role=\"Region\" EntitySet=\"Regions\" />\t\t\t\t\t<End Role=\"Territories\" EntitySet=\"Territories\" />\t\t\t\t</AssociationSet>\t\t\t</EntityContainer>\t\t</Schema>\t</edmx:DataServices></edmx:Edmx>";
mPredefinedServiceResponses.functionImportMain = "<?xml version=\"1.0\" encoding=\"utf-8\"?><app:service xml:lang=\"en\"\txml:base=\"https://https:/sap/opu/odata/sap/SEPMRA_PROD_MAN/\" xmlns:app=\"http://www.w3.org/2007/app\"\txmlns:atom=\"http://www.w3.org/2005/Atom\"\txmlns:m=\"http://schemas.microsoft.com/ado/2007/08/dataservices/metadata\"\txmlns:sap=\"http://www.sap.com/Protocols/SAPData\">\t<app:workspace>\t\t<atom:title type=\"text\">Data</atom:title>\t\t<app:collection sap:creatable=\"false\" sap:updatable=\"false\"\t\t\tsap:deletable=\"false\" sap:searchable=\"true\" sap:content-version=\"1\"\t\t\thref=\"DimensionUnits\">\t\t\t<atom:title type=\"text\">DimensionUnits</atom:title>\t\t\t<sap:member-title>DimensionUnit</sap:member-title>\t\t\t<atom:link href=\"DimensionUnits/OpenSearchDescription.xml\"\t\t\t\trel=\"search\" type=\"application/opensearchdescription+xml\" title=\"searchDimensionUnits\" />\t\t</app:collection>\t\t<app:collection sap:creatable=\"false\" sap:updatable=\"false\"\t\t\tsap:deletable=\"false\" sap:searchable=\"true\" sap:content-version=\"1\"\t\t\thref=\"QuantityUnits\">\t\t\t<atom:title type=\"text\">QuantityUnits</atom:title>\t\t\t<sap:member-title>QuantityUnit</sap:member-title>\t\t\t<atom:link href=\"QuantityUnits/OpenSearchDescription.xml\"\t\t\t\trel=\"search\" type=\"application/opensearchdescription+xml\" title=\"searchQuantityUnits\" />\t\t</app:collection>\t\t<app:collection sap:creatable=\"false\" sap:updatable=\"false\"\t\t\tsap:deletable=\"false\" sap:searchable=\"true\" sap:content-version=\"1\"\t\t\thref=\"WeightUnits\">\t\t\t<atom:title type=\"text\">WeightUnits</atom:title>\t\t\t<sap:member-title>WeightUnit</sap:member-title>\t\t\t<atom:link href=\"WeightUnits/OpenSearchDescription.xml\"\t\t\t\trel=\"search\" type=\"application/opensearchdescription+xml\" title=\"searchWeightUnits\" />\t\t</app:collection>\t\t<app:collection sap:creatable=\"false\" sap:updatable=\"false\"\t\t\tsap:deletable=\"false\" sap:searchable=\"true\" sap:content-version=\"1\"\t\t\thref=\"Suppliers\">\t\t\t<atom:title type=\"text\">Suppliers</atom:title>\t\t\t<sap:member-title>Supplier</sap:member-title>\t\t\t<atom:link href=\"Suppliers/OpenSearchDescription.xml\" rel=\"search\"\t\t\t\ttype=\"application/opensearchdescription+xml\" title=\"searchSuppliers\" />\t\t</app:collection>\t\t<app:collection sap:searchable=\"true\"\t\t\tsap:content-version=\"1\" href=\"Products\">\t\t\t<atom:title type=\"text\">Products</atom:title>\t\t\t<sap:member-title>Product</sap:member-title>\t\t\t<atom:link href=\"Products/OpenSearchDescription.xml\" rel=\"search\"\t\t\t\ttype=\"application/opensearchdescription+xml\" title=\"searchProducts\" />\t\t</app:collection>\t\t<app:collection sap:creatable=\"false\" sap:updatable=\"false\"\t\t\tsap:deletable=\"false\" sap:searchable=\"true\" sap:addressable=\"false\"\t\t\tsap:content-version=\"1\" href=\"DraftAdministrativeData\">\t\t\t<atom:title type=\"text\">DraftAdministrativeData</atom:title>\t\t\t<sap:member-title>DraftAdministrativeData</sap:member-title>\t\t\t<atom:link href=\"DraftAdministrativeData/OpenSearchDescription.xml\"\t\t\t\trel=\"search\" type=\"application/opensearchdescription+xml\" title=\"searchDraftAdministrativeData\" />\t\t</app:collection>\t\t<app:collection sap:searchable=\"true\" sap:addressable=\"false\"\t\t\tsap:content-version=\"1\" href=\"Attachments\">\t\t\t<atom:title type=\"text\">Attachments</atom:title>\t\t\t<sap:member-title>Attachment</sap:member-title>\t\t\t<atom:link href=\"Attachments/OpenSearchDescription.xml\"\t\t\t\trel=\"search\" type=\"application/opensearchdescription+xml\" title=\"searchAttachments\" />\t\t</app:collection>\t\t<app:collection sap:creatable=\"false\" sap:updatable=\"false\"\t\t\tsap:deletable=\"false\" sap:pageable=\"false\" sap:addressable=\"false\"\t\t\tsap:content-version=\"1\" href=\"ProductCategories\">\t\t\t<atom:title type=\"text\">ProductCategories</atom:title>\t\t\t<sap:member-title>ProductCategory</sap:member-title>\t\t</app:collection>\t\t<app:collection sap:creatable=\"false\" sap:updatable=\"false\"\t\t\tsap:deletable=\"false\" sap:pageable=\"false\" sap:addressable=\"false\"\t\t\tsap:content-version=\"1\" href=\"MainProductCategories\">\t\t\t<atom:title type=\"text\">MainProductCategories</atom:title>\t\t\t<sap:member-title>MainProductCategory</sap:member-title>\t\t</app:collection>\t\t<app:collection sap:creatable=\"false\" sap:updatable=\"false\"\t\t\tsap:deletable=\"false\" sap:searchable=\"true\" sap:content-version=\"1\"\t\t\thref=\"SalesDataSet\">\t\t\t<atom:title type=\"text\">SalesDataSet</atom:title>\t\t\t<sap:member-title>SalesData</sap:member-title>\t\t\t<atom:link href=\"SalesDataSet/OpenSearchDescription.xml\"\t\t\t\trel=\"search\" type=\"application/opensearchdescription+xml\" title=\"searchSalesDataSet\" />\t\t</app:collection>\t\t<app:collection sap:creatable=\"false\" sap:updatable=\"false\"\t\t\tsap:deletable=\"false\" sap:searchable=\"true\" sap:content-version=\"1\"\t\t\thref=\"Currencies\">\t\t\t<atom:title type=\"text\">Currencies</atom:title>\t\t\t<sap:member-title>Currency</sap:member-title>\t\t\t<atom:link href=\"Currencies/OpenSearchDescription.xml\" rel=\"search\"\t\t\t\ttype=\"application/opensearchdescription+xml\" title=\"searchCurrencies\" />\t\t</app:collection>\t</app:workspace>\t<atom:link rel=\"self\"\t\thref=\"https://https:/sap/opu/odata/sap/SEPMRA_PROD_MAN/\" />\t<atom:link rel=\"latest-version\"\t\thref=\"https://https:/sap/opu/odata/sap/SEPMRA_PROD_MAN/\" /></app:service>";
mPredefinedServiceResponses.functionImportMetadata = "<?xml version=\"1.0\" encoding=\"utf-8\"?><edmx:Edmx Version=\"1.0\"\txmlns:edmx=\"http://schemas.microsoft.com/ado/2007/06/edmx\"\txmlns:m=\"http://schemas.microsoft.com/ado/2007/08/dataservices/metadata\"\txmlns:sap=\"http://www.sap.com/Protocols/SAPData\">\t<edmx:Reference\t\tUri=\"https://https:/sap/opu/odata/IWFND/CATALOGSERVICE;v=2/Vocabularies(TechnicalName='%2FIWBEP%2FVOC_COMMON',Version='0001',SAP__Origin='LOCAL')/$value\"\t\txmlns:edmx=\"http://docs.oasis-open.org/odata/ns/edmx\" />\t<edmx:DataServices m:DataServiceVersion=\"2.0\">\t\t<Schema Namespace=\"SEPMRA_PROD_MAN\" xml:lang=\"en\"\t\t\tsap:schema-version=\"1\" xmlns=\"http://schemas.microsoft.com/ado/2008/09/edm\">\t\t\t<EntityType Name=\"Currency\" sap:content-version=\"1\">\t\t\t\t<Key>\t\t\t\t\t<PropertyRef Name=\"Code\" />\t\t\t\t</Key>\t\t\t\t<Property Name=\"Code\" Type=\"Edm.String\" Nullable=\"false\"\t\t\t\t\tMaxLength=\"5\" sap:label=\"Currency\" sap:creatable=\"false\"\t\t\t\t\tsap:updatable=\"false\" sap:semantics=\"currency-code\" />\t\t\t\t<Property Name=\"Text\" Type=\"Edm.String\" Nullable=\"false\"\t\t\t\t\tMaxLength=\"15\" sap:label=\"Short text\" sap:creatable=\"false\"\t\t\t\t\tsap:updatable=\"false\" />\t\t\t\t<Property Name=\"LongText\" Type=\"Edm.String\" Nullable=\"false\"\t\t\t\t\tMaxLength=\"40\" sap:label=\"Long Text\" sap:creatable=\"false\"\t\t\t\t\tsap:updatable=\"false\" />\t\t\t</EntityType>\t\t\t<EntityType Name=\"DimensionUnit\" sap:content-version=\"1\">\t\t\t\t<Key>\t\t\t\t\t<PropertyRef Name=\"Unit\" />\t\t\t\t</Key>\t\t\t\t<Property Name=\"Dimension\" Type=\"Edm.String\" Nullable=\"false\"\t\t\t\t\tMaxLength=\"6\" sap:label=\"Dimension\" sap:creatable=\"false\"\t\t\t\t\tsap:updatable=\"false\" />\t\t\t\t<Property Name=\"ISOCode\" Type=\"Edm.String\" Nullable=\"false\"\t\t\t\t\tMaxLength=\"3\" sap:label=\"ISO code\" sap:creatable=\"false\"\t\t\t\t\tsap:updatable=\"false\" />\t\t\t\t<Property Name=\"Unit\" Type=\"Edm.String\" Nullable=\"false\"\t\t\t\t\tMaxLength=\"3\" sap:label=\"Int. meas. unit\" sap:creatable=\"false\"\t\t\t\t\tsap:updatable=\"false\" sap:semantics=\"unit-of-measure\" />\t\t\t\t<Property Name=\"CommercialName\" Type=\"Edm.String\" Nullable=\"false\"\t\t\t\t\tMaxLength=\"3\" sap:label=\"Commercial\" sap:creatable=\"false\"\t\t\t\t\tsap:updatable=\"false\" />\t\t\t\t<Property Name=\"ShortText\" Type=\"Edm.String\" Nullable=\"false\"\t\t\t\t\tMaxLength=\"10\" sap:label=\"Meas. unit text\" sap:creatable=\"false\"\t\t\t\t\tsap:updatable=\"false\" />\t\t\t\t<Property Name=\"TechnicalName\" Type=\"Edm.String\" Nullable=\"false\"\t\t\t\t\tMaxLength=\"6\" sap:label=\"Technical\" sap:creatable=\"false\"\t\t\t\t\tsap:updatable=\"false\" />\t\t\t\t<Property Name=\"Text\" Type=\"Edm.String\" Nullable=\"false\"\t\t\t\t\tMaxLength=\"30\" sap:label=\"Unit text\" sap:creatable=\"false\"\t\t\t\t\tsap:updatable=\"false\" />\t\t\t</EntityType>\t\t\t<EntityType Name=\"QuantityUnit\" sap:content-version=\"1\">\t\t\t\t<Key>\t\t\t\t\t<PropertyRef Name=\"Unit\" />\t\t\t\t</Key>\t\t\t\t<Property Name=\"Dimension\" Type=\"Edm.String\" Nullable=\"false\"\t\t\t\t\tMaxLength=\"6\" sap:label=\"Dimension\" sap:creatable=\"false\"\t\t\t\t\tsap:updatable=\"false\" />\t\t\t\t<Property Name=\"ISOCode\" Type=\"Edm.String\" Nullable=\"false\"\t\t\t\t\tMaxLength=\"3\" sap:label=\"ISO code\" sap:creatable=\"false\"\t\t\t\t\tsap:updatable=\"false\" />\t\t\t\t<Property Name=\"Unit\" Type=\"Edm.String\" Nullable=\"false\"\t\t\t\t\tMaxLength=\"3\" sap:label=\"Int. meas. unit\" sap:creatable=\"false\"\t\t\t\t\tsap:updatable=\"false\" sap:semantics=\"unit-of-measure\" />\t\t\t\t<Property Name=\"CommercialName\" Type=\"Edm.String\" Nullable=\"false\"\t\t\t\t\tMaxLength=\"3\" sap:label=\"Commercial\" sap:creatable=\"false\"\t\t\t\t\tsap:updatable=\"false\" />\t\t\t\t<Property Name=\"ShortText\" Type=\"Edm.String\" Nullable=\"false\"\t\t\t\t\tMaxLength=\"10\" sap:label=\"Meas. unit text\" sap:creatable=\"false\"\t\t\t\t\tsap:updatable=\"false\" />\t\t\t\t<Property Name=\"TechnicalName\" Type=\"Edm.String\" Nullable=\"false\"\t\t\t\t\tMaxLength=\"6\" sap:label=\"Technical\" sap:creatable=\"false\"\t\t\t\t\tsap:updatable=\"false\" />\t\t\t\t<Property Name=\"Text\" Type=\"Edm.String\" Nullable=\"false\"\t\t\t\t\tMaxLength=\"30\" sap:label=\"Unit text\" sap:creatable=\"false\"\t\t\t\t\tsap:updatable=\"false\" />\t\t\t</EntityType>\t\t\t<EntityType Name=\"WeightUnit\" sap:content-version=\"1\">\t\t\t\t<Key>\t\t\t\t\t<PropertyRef Name=\"Unit\" />\t\t\t\t</Key>\t\t\t\t<Property Name=\"Dimension\" Type=\"Edm.String\" Nullable=\"false\"\t\t\t\t\tMaxLength=\"6\" sap:label=\"Dimension\" sap:creatable=\"false\"\t\t\t\t\tsap:updatable=\"false\" />\t\t\t\t<Property Name=\"ISOCode\" Type=\"Edm.String\" Nullable=\"false\"\t\t\t\t\tMaxLength=\"3\" sap:label=\"ISO code\" sap:creatable=\"false\"\t\t\t\t\tsap:updatable=\"false\" />\t\t\t\t<Property Name=\"Unit\" Type=\"Edm.String\" Nullable=\"false\"\t\t\t\t\tMaxLength=\"3\" sap:label=\"Int. meas. unit\" sap:creatable=\"false\"\t\t\t\t\tsap:updatable=\"false\" sap:semantics=\"unit-of-measure\" />\t\t\t\t<Property Name=\"CommercialName\" Type=\"Edm.String\" Nullable=\"false\"\t\t\t\t\tMaxLength=\"3\" sap:label=\"Commercial\" sap:creatable=\"false\"\t\t\t\t\tsap:updatable=\"false\" />\t\t\t\t<Property Name=\"ShortText\" Type=\"Edm.String\" Nullable=\"false\"\t\t\t\t\tMaxLength=\"10\" sap:label=\"Meas. unit text\" sap:creatable=\"false\"\t\t\t\t\tsap:updatable=\"false\" />\t\t\t\t<Property Name=\"TechnicalName\" Type=\"Edm.String\" Nullable=\"false\"\t\t\t\t\tMaxLength=\"6\" sap:label=\"Technical\" sap:creatable=\"false\"\t\t\t\t\tsap:updatable=\"false\" />\t\t\t\t<Property Name=\"Text\" Type=\"Edm.String\" Nullable=\"false\"\t\t\t\t\tMaxLength=\"30\" sap:label=\"Unit text\" sap:creatable=\"false\"\t\t\t\t\tsap:updatable=\"false\" />\t\t\t</EntityType>\t\t\t<EntityType Name=\"Supplier\" sap:content-version=\"1\">\t\t\t\t<Key>\t\t\t\t\t<PropertyRef Name=\"SupplierUUID\" />\t\t\t\t</Key>\t\t\t\t<Property Name=\"SupplierUUID\" Type=\"Edm.Guid\" Nullable=\"false\"\t\t\t\t\tsap:label=\"Busi. Partner UUID\" sap:creatable=\"false\" sap:updatable=\"false\"\t\t\t\t\tsap:filterable=\"false\" />\t\t\t\t<Property Name=\"SupplierId\" Type=\"Edm.String\" Nullable=\"false\"\t\t\t\t\tMaxLength=\"10\" sap:label=\"Business Partner ID\" sap:creatable=\"false\"\t\t\t\t\tsap:updatable=\"false\" sap:filterable=\"false\" />\t\t\t\t<Property Name=\"Name\" Type=\"Edm.String\" Nullable=\"false\"\t\t\t\t\tMaxLength=\"80\" sap:label=\"Supplier\" sap:creatable=\"false\"\t\t\t\t\tsap:updatable=\"false\" />\t\t\t\t<Property Name=\"EmailAddress\" Type=\"Edm.String\" Nullable=\"false\"\t\t\t\t\tMaxLength=\"255\" sap:label=\"E-Mail\" sap:creatable=\"false\"\t\t\t\t\tsap:updatable=\"false\" sap:filterable=\"false\" />\t\t\t\t<Property Name=\"FaxNumber\" Type=\"Edm.String\" Nullable=\"false\"\t\t\t\t\tMaxLength=\"30\" sap:label=\"Phone No.\" sap:creatable=\"false\"\t\t\t\t\tsap:updatable=\"false\" sap:filterable=\"false\" />\t\t\t\t<Property Name=\"PhoneNumber\" Type=\"Edm.String\" Nullable=\"false\"\t\t\t\t\tMaxLength=\"30\" sap:label=\"Phone No.\" sap:creatable=\"false\"\t\t\t\t\tsap:updatable=\"false\" sap:filterable=\"false\" />\t\t\t\t<Property Name=\"Url\" Type=\"Edm.String\" Nullable=\"false\"\t\t\t\t\tsap:label=\"URI\" sap:creatable=\"false\" sap:updatable=\"false\"\t\t\t\t\tsap:filterable=\"false\" />\t\t\t\t<Property Name=\"FormattedAddress\" Type=\"Edm.String\"\t\t\t\t\tNullable=\"false\" MaxLength=\"164\" sap:label=\"Address\" sap:creatable=\"false\"\t\t\t\t\tsap:updatable=\"false\" sap:filterable=\"false\" />\t\t\t\t<Property Name=\"FormattedContactName\" Type=\"Edm.String\"\t\t\t\t\tNullable=\"false\" MaxLength=\"88\" sap:label=\"Contact Name\"\t\t\t\t\tsap:creatable=\"false\" sap:updatable=\"false\" sap:filterable=\"false\" />\t\t\t\t<Property Name=\"ContactPhone1\" Type=\"Edm.String\" Nullable=\"false\"\t\t\t\t\tMaxLength=\"30\" sap:label=\"Phone No.\" sap:creatable=\"false\"\t\t\t\t\tsap:updatable=\"false\" sap:filterable=\"false\" />\t\t\t\t<Property Name=\"ContactPhone2\" Type=\"Edm.String\" Nullable=\"false\"\t\t\t\t\tMaxLength=\"30\" sap:label=\"Phone No.\" sap:creatable=\"false\"\t\t\t\t\tsap:updatable=\"false\" sap:filterable=\"false\" />\t\t\t\t<Property Name=\"ContactEmail\" Type=\"Edm.String\" Nullable=\"false\"\t\t\t\t\tMaxLength=\"255\" sap:label=\"E-Mail\" sap:creatable=\"false\"\t\t\t\t\tsap:updatable=\"false\" sap:filterable=\"false\" />\t\t\t</EntityType>\t\t\t<EntityType Name=\"Product\" sap:content-version=\"1\">\t\t\t\t<Key>\t\t\t\t\t<PropertyRef Name=\"ProductUUID\" />\t\t\t\t</Key>\t\t\t\t<Property Name=\"ExclusiveBy\" Type=\"Edm.String\" Nullable=\"false\"\t\t\t\t\tMaxLength=\"12\" sap:label=\"Exclusive For\" sap:creatable=\"false\"\t\t\t\t\tsap:updatable=\"false\" sap:filterable=\"false\" />\t\t\t\t<Property Name=\"IsDraft\" Type=\"Edm.Boolean\" Nullable=\"false\"\t\t\t\t\tsap:label=\"Is Draft\" sap:creatable=\"false\" sap:updatable=\"false\"\t\t\t\t\tsap:sortable=\"false\" sap:filterable=\"false\" />\t\t\t\t<Property Name=\"HasTwin\" Type=\"Edm.Boolean\" Nullable=\"false\"\t\t\t\t\tsap:label=\"Has Twin\" sap:creatable=\"false\" sap:updatable=\"false\"\t\t\t\t\tsap:sortable=\"false\" sap:filterable=\"false\" />\t\t\t\t<Property Name=\"ProductUUID\" Type=\"Edm.Guid\" Nullable=\"false\"\t\t\t\t\tsap:label=\"Node Key\" sap:creatable=\"false\" sap:updatable=\"false\"\t\t\t\t\tsap:filterable=\"false\" />\t\t\t\t<Property Name=\"ExclusiveSince\" Type=\"Edm.DateTime\"\t\t\t\t\tPrecision=\"7\" sap:label=\"Exclusive Since\" sap:creatable=\"false\"\t\t\t\t\tsap:updatable=\"false\" sap:filterable=\"false\" />\t\t\t\t<Property Name=\"SupplierUUID\" Type=\"Edm.Guid\" sap:label=\"Node Key\"\t\t\t\t\tsap:creatable=\"false\" sap:updatable=\"false\" sap:filterable=\"false\" />\t\t\t\t<Property Name=\"SupplierId\" Type=\"Edm.String\" MaxLength=\"10\"\t\t\t\t\tsap:label=\"Supplier\" sap:creatable=\"false\" />\t\t\t\t<Property Name=\"ProductId\" Type=\"Edm.String\" Nullable=\"false\"\t\t\t\t\tMaxLength=\"10\" sap:label=\"Product ID\" sap:creatable=\"false\"\t\t\t\t\tsap:updatable=\"false\" />\t\t\t\t<Property Name=\"ProductType\" Type=\"Edm.String\" Nullable=\"false\"\t\t\t\t\tMaxLength=\"2\" sap:label=\"Type Code\" sap:creatable=\"false\" />\t\t\t\t<Property Name=\"ProductTypeName\" Type=\"Edm.String\"\t\t\t\t\tNullable=\"false\" MaxLength=\"60\" sap:label=\"Short Descript.\"\t\t\t\t\tsap:creatable=\"false\" sap:updatable=\"false\" sap:filterable=\"false\" />\t\t\t\t<Property Name=\"Category\" Type=\"Edm.String\" Nullable=\"false\"\t\t\t\t\tMaxLength=\"40\" sap:label=\"Category\" sap:creatable=\"false\" />\t\t\t\t<Property Name=\"CategoryName\" Type=\"Edm.String\" Nullable=\"false\"\t\t\t\t\tMaxLength=\"40\" sap:label=\"Category\" sap:creatable=\"false\"\t\t\t\t\tsap:updatable=\"false\" />\t\t\t\t<Property Name=\"MainCategory\" Type=\"Edm.String\" Nullable=\"false\"\t\t\t\t\tMaxLength=\"40\" sap:label=\"Main Category\" sap:creatable=\"false\" />\t\t\t\t<Property Name=\"MainCategoryName\" Type=\"Edm.String\"\t\t\t\t\tNullable=\"false\" MaxLength=\"40\" sap:label=\"Main Category\"\t\t\t\t\tsap:creatable=\"false\" sap:updatable=\"false\" />\t\t\t\t<Property Name=\"Name\" Type=\"Edm.String\" Nullable=\"false\"\t\t\t\t\tMaxLength=\"255\" sap:label=\"Name\" />\t\t\t\t<Property Name=\"Description\" Type=\"Edm.String\" Nullable=\"false\"\t\t\t\t\tMaxLength=\"255\" sap:label=\"Description\" sap:filterable=\"false\" />\t\t\t\t<Property Name=\"Price\" Type=\"Edm.Decimal\" Nullable=\"false\"\t\t\t\t\tPrecision=\"15\" Scale=\"2\" sap:unit=\"Currency\" sap:label=\"Price\" />\t\t\t\t<Property Name=\"Currency\" Type=\"Edm.String\" Nullable=\"false\"\t\t\t\t\tMaxLength=\"5\" sap:label=\"Currency Code\" sap:creatable=\"false\"\t\t\t\t\tsap:semantics=\"currency-code\" />\t\t\t\t<Property Name=\"ValueAddedTax\" Type=\"Edm.Int32\" Nullable=\"false\"\t\t\t\t\tsap:filterable=\"false\" />\t\t\t\t<Property Name=\"ValueAddedTaxName\" Type=\"Edm.String\"\t\t\t\t\tNullable=\"false\" MaxLength=\"60\" sap:label=\"Short Descript.\"\t\t\t\t\tsap:creatable=\"false\" sap:updatable=\"false\" sap:filterable=\"false\" />\t\t\t\t<Property Name=\"HeightInDimensionUnit\" Type=\"Edm.Decimal\"\t\t\t\t\tNullable=\"false\" Precision=\"13\" Scale=\"3\" sap:unit=\"DimensionUnit\"\t\t\t\t\tsap:label=\"Height\" sap:creatable=\"false\" sap:filterable=\"false\" />\t\t\t\t<Property Name=\"WidthInDimensionUnit\" Type=\"Edm.Decimal\"\t\t\t\t\tNullable=\"false\" Precision=\"13\" Scale=\"3\" sap:unit=\"DimensionUnit\"\t\t\t\t\tsap:label=\"Width\" sap:creatable=\"false\" sap:filterable=\"false\" />\t\t\t\t<Property Name=\"LengthInDimensionUnit\" Type=\"Edm.Decimal\"\t\t\t\t\tNullable=\"false\" Precision=\"13\" Scale=\"3\" sap:unit=\"DimensionUnit\"\t\t\t\t\tsap:label=\"Depth\" sap:creatable=\"false\" sap:filterable=\"false\" />\t\t\t\t<Property Name=\"DimensionUnit\" Type=\"Edm.String\" Nullable=\"false\"\t\t\t\t\tMaxLength=\"3\" sap:label=\"Dimension Unit\" sap:creatable=\"false\"\t\t\t\t\tsap:filterable=\"false\" sap:semantics=\"unit-of-measure\" />\t\t\t\t<Property Name=\"DimensionUnitName\" Type=\"Edm.String\"\t\t\t\t\tNullable=\"false\" MaxLength=\"10\" sap:label=\"Meas. unit text\"\t\t\t\t\tsap:creatable=\"false\" sap:updatable=\"false\" sap:filterable=\"false\" />\t\t\t\t<Property Name=\"Weight\" Type=\"Edm.Decimal\" Nullable=\"false\"\t\t\t\t\tPrecision=\"13\" Scale=\"3\" sap:unit=\"WeightUnit\" sap:label=\"Weight\"\t\t\t\t\tsap:filterable=\"false\" />\t\t\t\t<Property Name=\"WeightUnit\" Type=\"Edm.String\" Nullable=\"false\"\t\t\t\t\tMaxLength=\"3\" sap:label=\"Unit of Measure\" sap:creatable=\"false\"\t\t\t\t\tsap:filterable=\"false\" sap:semantics=\"unit-of-measure\" />\t\t\t\t<Property Name=\"WeightUnitName\" Type=\"Edm.String\" Nullable=\"false\"\t\t\t\t\tMaxLength=\"10\" sap:label=\"Meas. unit text\" sap:creatable=\"false\"\t\t\t\t\tsap:updatable=\"false\" sap:filterable=\"false\" />\t\t\t\t<Property Name=\"StockQuantityInBaseUnit\" Type=\"Edm.Decimal\"\t\t\t\t\tNullable=\"false\" Precision=\"13\" Scale=\"3\" sap:unit=\"BaseUnit\"\t\t\t\t\tsap:label=\"Stock Quantity\" />\t\t\t\t<Property Name=\"BaseUnit\" Type=\"Edm.String\" Nullable=\"false\"\t\t\t\t\tMaxLength=\"3\" sap:label=\"Unit of Measure\" sap:creatable=\"false\"\t\t\t\t\tsap:filterable=\"false\" sap:semantics=\"unit-of-measure\" />\t\t\t\t<Property Name=\"BaseUnitName\" Type=\"Edm.String\" Nullable=\"false\"\t\t\t\t\tMaxLength=\"10\" sap:label=\"Meas. unit text\" sap:creatable=\"false\"\t\t\t\t\tsap:updatable=\"false\" sap:filterable=\"false\" />\t\t\t\t<Property Name=\"ImageUrl\" Type=\"Edm.String\" Nullable=\"false\"\t\t\t\t\tMaxLength=\"255\" sap:label=\"Image\" sap:creatable=\"false\"\t\t\t\t\tsap:updatable=\"false\" sap:filterable=\"false\" />\t\t\t\t<Property Name=\"AverageRating\" Type=\"Edm.Decimal\" Nullable=\"false\"\t\t\t\t\tPrecision=\"4\" Scale=\"2\" sap:label=\"Average Rating\" sap:creatable=\"false\"\t\t\t\t\tsap:updatable=\"false\" />\t\t\t\t<Property Name=\"NumberOfRatings\" Type=\"Edm.Int32\" Nullable=\"false\"\t\t\t\t\tsap:label=\"Number of Reviews\" sap:creatable=\"false\" sap:updatable=\"false\" />\t\t\t\t<Property Name=\"SupplierName\" Type=\"Edm.String\" MaxLength=\"80\"\t\t\t\t\tsap:label=\"Supplier\" sap:creatable=\"false\" sap:updatable=\"false\" />\t\t\t\t<Property Name=\"EditState\" Type=\"Edm.Int32\" Nullable=\"false\"\t\t\t\t\tsap:creatable=\"false\" sap:updatable=\"false\" />\t\t\t\t<NavigationProperty Name=\"SalesDataSet\"\t\t\t\t\tRelationship=\"SEPMRA_PROD_MAN.Product2SalesData\" FromRole=\"FromRole_Product2SalesData\"\t\t\t\t\tToRole=\"ToRole_Product2SalesData\" />\t\t\t\t<NavigationProperty Name=\"ProductCategory\"\t\t\t\t\tRelationship=\"SEPMRA_PROD_MAN.Product2ProductCategory\" FromRole=\"ToRole_Product2ProductCategory\"\t\t\t\t\tToRole=\"FromRole_Product2ProductCategory\" />\t\t\t\t<NavigationProperty Name=\"Attachments\"\t\t\t\t\tRelationship=\"SEPMRA_PROD_MAN.Product2Attachment\" FromRole=\"FromRole_Product2Attachment\"\t\t\t\t\tToRole=\"ToRole_Product2Attachment\" />\t\t\t\t<NavigationProperty Name=\"Supplier\"\t\t\t\t\tRelationship=\"SEPMRA_PROD_MAN.Product2Supplier\" FromRole=\"ToRole_Product2Supplier\"\t\t\t\t\tToRole=\"FromRole_Product2Supplier\" />\t\t\t\t<NavigationProperty Name=\"DraftAdministrativeData\"\t\t\t\t\tRelationship=\"SEPMRA_PROD_MAN.Product2DraftAdministrativeData\"\t\t\t\t\tFromRole=\"ToRole_Product2DraftAdministrativeData\" ToRole=\"FromRole_Product2DraftAdministrativeData\" />\t\t\t\t<NavigationProperty Name=\"TwinEntity\"\t\t\t\t\tRelationship=\"SEPMRA_PROD_MAN.Product2TwinEntity\" FromRole=\"FromRole_Product2TwinEntity\"\t\t\t\t\tToRole=\"ToRole_Product2TwinEntity\" />\t\t\t</EntityType>\t\t\t<EntityType Name=\"DraftAdministrativeData\"\t\t\t\tsap:content-version=\"1\">\t\t\t\t<Key>\t\t\t\t\t<PropertyRef Name=\"DraftEntityUUID\" />\t\t\t\t</Key>\t\t\t\t<Property Name=\"DraftEntityUUID\" Type=\"Edm.Guid\" Nullable=\"false\"\t\t\t\t\tsap:label=\"Draft Document UUID\" sap:creatable=\"false\"\t\t\t\t\tsap:updatable=\"false\" sap:filterable=\"false\" />\t\t\t\t<Property Name=\"EditState\" Type=\"Edm.Byte\" Nullable=\"false\"\t\t\t\t\tsap:label=\"Edit State\" sap:creatable=\"false\" sap:updatable=\"false\"\t\t\t\t\tsap:filterable=\"false\" />\t\t\t\t<Property Name=\"CreatedAt\" Type=\"Edm.DateTime\" Nullable=\"false\"\t\t\t\t\tPrecision=\"7\" sap:label=\"Created\" sap:creatable=\"false\"\t\t\t\t\tsap:updatable=\"false\" sap:filterable=\"false\" />\t\t\t\t<Property Name=\"CreatedBy\" Type=\"Edm.String\" Nullable=\"false\"\t\t\t\t\tMaxLength=\"12\" sap:label=\"Created by\" sap:creatable=\"false\"\t\t\t\t\tsap:updatable=\"false\" sap:filterable=\"false\" />\t\t\t\t<Property Name=\"ChangedAt\" Type=\"Edm.DateTime\" Precision=\"7\"\t\t\t\t\tsap:label=\"Last Changed\" sap:creatable=\"false\" sap:updatable=\"false\"\t\t\t\t\tsap:filterable=\"false\" />\t\t\t\t<Property Name=\"ChangedBy\" Type=\"Edm.String\" Nullable=\"false\"\t\t\t\t\tMaxLength=\"12\" sap:label=\"Last Changed by\" sap:creatable=\"false\"\t\t\t\t\tsap:updatable=\"false\" sap:filterable=\"false\" />\t\t\t\t<Property Name=\"ExclusiveBy\" Type=\"Edm.String\" Nullable=\"false\"\t\t\t\t\tMaxLength=\"12\" sap:label=\"Exclusive For\" sap:creatable=\"false\"\t\t\t\t\tsap:updatable=\"false\" sap:filterable=\"false\" />\t\t\t\t<Property Name=\"ExclusiveSince\" Type=\"Edm.DateTime\"\t\t\t\t\tPrecision=\"7\" sap:label=\"Exclusive Since\" sap:creatable=\"false\"\t\t\t\t\tsap:updatable=\"false\" sap:filterable=\"false\" />\t\t\t</EntityType>\t\t\t<EntityType Name=\"Attachment\" m:HasStream=\"true\"\t\t\t\tsap:content-version=\"1\">\t\t\t\t<Key>\t\t\t\t\t<PropertyRef Name=\"ActiveAttachmentObjectUUID\" />\t\t\t\t\t<PropertyRef Name=\"ActiveAttachmentId\" />\t\t\t\t\t<PropertyRef Name=\"DraftAttachmentUUID\" />\t\t\t\t</Key>\t\t\t\t<Property Name=\"ActiveAttachmentObjectUUID\" Type=\"Edm.Guid\"\t\t\t\t\tNullable=\"false\" sap:creatable=\"false\" sap:updatable=\"false\" />\t\t\t\t<Property Name=\"ActiveAttachmentId\" Type=\"Edm.String\"\t\t\t\t\tNullable=\"false\" MaxLength=\"70\" sap:label=\"Instance ID\"\t\t\t\t\tsap:creatable=\"false\" sap:updatable=\"false\" />\t\t\t\t<Property Name=\"DraftAttachmentUUID\" Type=\"Edm.Guid\"\t\t\t\t\tNullable=\"false\" sap:creatable=\"false\" sap:updatable=\"false\" />\t\t\t\t<Property Name=\"Type\" Type=\"Edm.String\" Nullable=\"false\"\t\t\t\t\tMaxLength=\"3\" sap:label=\"File extension\" sap:creatable=\"false\"\t\t\t\t\tsap:updatable=\"false\" sap:sortable=\"false\" sap:filterable=\"false\" />\t\t\t\t<Property Name=\"FileName\" Type=\"Edm.String\" Nullable=\"false\"\t\t\t\t\tMaxLength=\"255\" sap:creatable=\"false\" sap:updatable=\"false\"\t\t\t\t\tsap:sortable=\"false\" sap:filterable=\"false\" />\t\t\t\t<Property Name=\"MimeType\" Type=\"Edm.String\" Nullable=\"false\"\t\t\t\t\tMaxLength=\"100\" sap:creatable=\"false\" sap:updatable=\"false\"\t\t\t\t\tsap:sortable=\"false\" sap:filterable=\"false\" />\t\t\t\t<Property Name=\"CreatedBy\" Type=\"Edm.String\" Nullable=\"false\"\t\t\t\t\tMaxLength=\"136\" sap:creatable=\"false\" sap:updatable=\"false\" />\t\t\t\t<Property Name=\"CreatedAt\" Type=\"Edm.DateTime\" Nullable=\"false\"\t\t\t\t\tPrecision=\"7\" sap:label=\"Created\" sap:creatable=\"false\"\t\t\t\t\tsap:updatable=\"false\" sap:sortable=\"false\" sap:filterable=\"false\" />\t\t\t\t<Property Name=\"ChangedBy\" Type=\"Edm.String\" Nullable=\"false\"\t\t\t\t\tMaxLength=\"136\" sap:creatable=\"false\" sap:updatable=\"false\" />\t\t\t\t<Property Name=\"ChangedAt\" Type=\"Edm.DateTime\" Nullable=\"false\"\t\t\t\t\tPrecision=\"7\" sap:label=\"Last Changed\" sap:creatable=\"false\"\t\t\t\t\tsap:updatable=\"false\" sap:sortable=\"false\" sap:filterable=\"false\" />\t\t\t\t<Property Name=\"EditState\" Type=\"Edm.Byte\" Nullable=\"false\"\t\t\t\t\tsap:creatable=\"false\" sap:updatable=\"false\" />\t\t\t</EntityType>\t\t\t<EntityType Name=\"ProductCategory\" sap:content-version=\"1\">\t\t\t\t<Key>\t\t\t\t\t<PropertyRef Name=\"Id\" />\t\t\t\t</Key>\t\t\t\t<Property Name=\"Id\" Type=\"Edm.String\" Nullable=\"false\"\t\t\t\t\tMaxLength=\"40\" sap:label=\"Category\" sap:creatable=\"false\"\t\t\t\t\tsap:updatable=\"false\" />\t\t\t\t<Property Name=\"Name\" Type=\"Edm.String\" Nullable=\"false\"\t\t\t\t\tMaxLength=\"40\" sap:label=\"Category\" sap:creatable=\"false\"\t\t\t\t\tsap:updatable=\"false\" />\t\t\t\t<Property Name=\"MainCategoryId\" Type=\"Edm.String\" Nullable=\"false\"\t\t\t\t\tMaxLength=\"40\" sap:label=\"Main Category\" sap:creatable=\"false\"\t\t\t\t\tsap:updatable=\"false\" />\t\t\t\t<Property Name=\"MainCategoryName\" Type=\"Edm.String\"\t\t\t\t\tNullable=\"false\" MaxLength=\"40\" sap:label=\"Main Category\"\t\t\t\t\tsap:creatable=\"false\" sap:updatable=\"false\" />\t\t\t\t<NavigationProperty Name=\"MainCategory\"\t\t\t\t\tRelationship=\"SEPMRA_PROD_MAN.MainProductCategory2ProductCategory\"\t\t\t\t\tFromRole=\"ToRole_MainProductCategory2ProductCategory\" ToRole=\"FromRole_MainProductCategory2ProductCategory\" />\t\t\t</EntityType>\t\t\t<EntityType Name=\"MainProductCategory\"\t\t\t\tsap:content-version=\"1\">\t\t\t\t<Key>\t\t\t\t\t<PropertyRef Name=\"Id\" />\t\t\t\t</Key>\t\t\t\t<Property Name=\"Id\" Type=\"Edm.String\" Nullable=\"false\"\t\t\t\t\tMaxLength=\"40\" sap:label=\"Main Category\" sap:creatable=\"false\"\t\t\t\t\tsap:updatable=\"false\" />\t\t\t\t<Property Name=\"Name\" Type=\"Edm.String\" Nullable=\"false\"\t\t\t\t\tMaxLength=\"40\" sap:label=\"Main Category\" sap:creatable=\"false\"\t\t\t\t\tsap:updatable=\"false\" />\t\t\t\t<NavigationProperty Name=\"Categories\"\t\t\t\t\tRelationship=\"SEPMRA_PROD_MAN.MainProductCategory2ProductCategory\"\t\t\t\t\tFromRole=\"FromRole_MainProductCategory2ProductCategory\" ToRole=\"ToRole_MainProductCategory2ProductCategory\" />\t\t\t</EntityType>\t\t\t<EntityType Name=\"SalesData\" sap:content-version=\"1\">\t\t\t\t<Key>\t\t\t\t\t<PropertyRef Name=\"ProductUUID\" />\t\t\t\t</Key>\t\t\t\t<Property Name=\"ProductUUID\" Type=\"Edm.Guid\" Nullable=\"false\"\t\t\t\t\tsap:label=\"Node Key\" sap:creatable=\"false\" sap:updatable=\"false\"\t\t\t\t\tsap:filterable=\"false\" />\t\t\t\t<Property Name=\"ProductId\" Type=\"Edm.String\" Nullable=\"false\"\t\t\t\t\tMaxLength=\"10\" sap:label=\"Product ID\" sap:creatable=\"false\"\t\t\t\t\tsap:updatable=\"false\" />\t\t\t\t<Property Name=\"DeliveryYear\" Type=\"Edm.String\" Nullable=\"false\"\t\t\t\t\tMaxLength=\"4\" sap:label=\"Delivery Year\" sap:creatable=\"false\"\t\t\t\t\tsap:updatable=\"false\" sap:sortable=\"false\" sap:filterable=\"false\" />\t\t\t\t<Property Name=\"DeliveryMonthName\" Type=\"Edm.String\"\t\t\t\t\tNullable=\"false\" MaxLength=\"10\" sap:label=\"Delivery Month\"\t\t\t\t\tsap:creatable=\"false\" sap:updatable=\"false\" sap:sortable=\"false\"\t\t\t\t\tsap:filterable=\"false\" />\t\t\t\t<Property Name=\"DeliveryDateTime\" Type=\"Edm.DateTime\"\t\t\t\t\tNullable=\"false\" Precision=\"0\" sap:label=\"Delivery Date\"\t\t\t\t\tsap:creatable=\"false\" sap:updatable=\"false\" />\t\t\t\t<Property Name=\"Revenue\" Type=\"Edm.Decimal\" Nullable=\"false\"\t\t\t\t\tPrecision=\"15\" Scale=\"2\" sap:label=\"Revenue\" sap:creatable=\"false\"\t\t\t\t\tsap:updatable=\"false\" sap:sortable=\"false\" sap:filterable=\"false\" />\t\t\t</EntityType>\t\t\t<Association Name=\"Product2DraftAdministrativeData\"\t\t\t\tsap:content-version=\"1\">\t\t\t\t<End Type=\"SEPMRA_PROD_MAN.DraftAdministrativeData\"\t\t\t\t\tMultiplicity=\"0..1\" Role=\"FromRole_Product2DraftAdministrativeData\" />\t\t\t\t<End Type=\"SEPMRA_PROD_MAN.Product\" Multiplicity=\"1\"\t\t\t\t\tRole=\"ToRole_Product2DraftAdministrativeData\" />\t\t\t</Association>\t\t\t<Association Name=\"Product2Supplier\" sap:content-version=\"1\">\t\t\t\t<End Type=\"SEPMRA_PROD_MAN.Supplier\" Multiplicity=\"1\"\t\t\t\t\tRole=\"FromRole_Product2Supplier\" />\t\t\t\t<End Type=\"SEPMRA_PROD_MAN.Product\" Multiplicity=\"*\"\t\t\t\t\tRole=\"ToRole_Product2Supplier\" />\t\t\t\t<ReferentialConstraint>\t\t\t\t\t<Principal Role=\"FromRole_Product2Supplier\">\t\t\t\t\t\t<PropertyRef Name=\"SupplierUUID\" />\t\t\t\t\t</Principal>\t\t\t\t\t<Dependent Role=\"ToRole_Product2Supplier\">\t\t\t\t\t\t<PropertyRef Name=\"SupplierUUID\" />\t\t\t\t\t</Dependent>\t\t\t\t</ReferentialConstraint>\t\t\t</Association>\t\t\t<Association Name=\"Product2TwinEntity\"\t\t\t\tsap:content-version=\"1\">\t\t\t\t<End Type=\"SEPMRA_PROD_MAN.Product\" Multiplicity=\"0..1\"\t\t\t\t\tRole=\"FromRole_Product2TwinEntity\" />\t\t\t\t<End Type=\"SEPMRA_PROD_MAN.Product\" Multiplicity=\"0..1\"\t\t\t\t\tRole=\"ToRole_Product2TwinEntity\" />\t\t\t</Association>\t\t\t<Association Name=\"Product2Attachment\"\t\t\t\tsap:content-version=\"1\">\t\t\t\t<End Type=\"SEPMRA_PROD_MAN.Product\" Multiplicity=\"1\"\t\t\t\t\tRole=\"FromRole_Product2Attachment\" />\t\t\t\t<End Type=\"SEPMRA_PROD_MAN.Attachment\" Multiplicity=\"*\"\t\t\t\t\tRole=\"ToRole_Product2Attachment\" />\t\t\t</Association>\t\t\t<Association Name=\"Product2SalesData\"\t\t\t\tsap:content-version=\"1\">\t\t\t\t<End Type=\"SEPMRA_PROD_MAN.Product\" Multiplicity=\"1\"\t\t\t\t\tRole=\"FromRole_Product2SalesData\" />\t\t\t\t<End Type=\"SEPMRA_PROD_MAN.SalesData\" Multiplicity=\"*\"\t\t\t\t\tRole=\"ToRole_Product2SalesData\" />\t\t\t</Association>\t\t\t<Association Name=\"Product2ProductCategory\"\t\t\t\tsap:content-version=\"1\">\t\t\t\t<End Type=\"SEPMRA_PROD_MAN.ProductCategory\" Multiplicity=\"1\"\t\t\t\t\tRole=\"FromRole_Product2ProductCategory\" />\t\t\t\t<End Type=\"SEPMRA_PROD_MAN.Product\" Multiplicity=\"*\"\t\t\t\t\tRole=\"ToRole_Product2ProductCategory\" />\t\t\t\t<ReferentialConstraint>\t\t\t\t\t<Principal Role=\"FromRole_Product2ProductCategory\">\t\t\t\t\t\t<PropertyRef Name=\"Id\" />\t\t\t\t\t</Principal>\t\t\t\t\t<Dependent Role=\"ToRole_Product2ProductCategory\">\t\t\t\t\t\t<PropertyRef Name=\"Category\" />\t\t\t\t\t</Dependent>\t\t\t\t</ReferentialConstraint>\t\t\t</Association>\t\t\t<Association Name=\"MainProductCategory2ProductCategory\"\t\t\t\tsap:content-version=\"1\">\t\t\t\t<End Type=\"SEPMRA_PROD_MAN.MainProductCategory\" Multiplicity=\"1\"\t\t\t\t\tRole=\"FromRole_MainProductCategory2ProductCategory\" />\t\t\t\t<End Type=\"SEPMRA_PROD_MAN.ProductCategory\" Multiplicity=\"*\"\t\t\t\t\tRole=\"ToRole_MainProductCategory2ProductCategory\" />\t\t\t\t<ReferentialConstraint>\t\t\t\t\t<Principal Role=\"FromRole_MainProductCategory2ProductCategory\">\t\t\t\t\t\t<PropertyRef Name=\"Id\" />\t\t\t\t\t</Principal>\t\t\t\t\t<Dependent Role=\"ToRole_MainProductCategory2ProductCategory\">\t\t\t\t\t\t<PropertyRef Name=\"MainCategoryId\" />\t\t\t\t\t</Dependent>\t\t\t\t</ReferentialConstraint>\t\t\t</Association>\t\t\t<EntityContainer Name=\"SEPMRA_PROD_MAN_Entities\"\t\t\t\tm:IsDefaultEntityContainer=\"true\" sap:supported-formats=\"atom json xlsx\">\t\t\t\t<EntitySet Name=\"DimensionUnits\" EntityType=\"SEPMRA_PROD_MAN.DimensionUnit\"\t\t\t\t\tsap:creatable=\"false\" sap:updatable=\"false\" sap:deletable=\"false\"\t\t\t\t\tsap:searchable=\"true\" sap:content-version=\"1\" />\t\t\t\t<EntitySet Name=\"QuantityUnits\" EntityType=\"SEPMRA_PROD_MAN.QuantityUnit\"\t\t\t\t\tsap:creatable=\"false\" sap:updatable=\"false\" sap:deletable=\"false\"\t\t\t\t\tsap:searchable=\"true\" sap:content-version=\"1\" />\t\t\t\t<EntitySet Name=\"WeightUnits\" EntityType=\"SEPMRA_PROD_MAN.WeightUnit\"\t\t\t\t\tsap:creatable=\"false\" sap:updatable=\"false\" sap:deletable=\"false\"\t\t\t\t\tsap:searchable=\"true\" sap:content-version=\"1\" />\t\t\t\t<EntitySet Name=\"Suppliers\" EntityType=\"SEPMRA_PROD_MAN.Supplier\"\t\t\t\t\tsap:creatable=\"false\" sap:updatable=\"false\" sap:deletable=\"false\"\t\t\t\t\tsap:searchable=\"true\" sap:content-version=\"1\" />\t\t\t\t<EntitySet Name=\"Products\" EntityType=\"SEPMRA_PROD_MAN.Product\"\t\t\t\t\tsap:searchable=\"true\" sap:content-version=\"1\" />\t\t\t\t<EntitySet Name=\"DraftAdministrativeData\" EntityType=\"SEPMRA_PROD_MAN.DraftAdministrativeData\"\t\t\t\t\tsap:creatable=\"false\" sap:updatable=\"false\" sap:deletable=\"false\"\t\t\t\t\tsap:searchable=\"true\" sap:addressable=\"false\" sap:content-version=\"1\" />\t\t\t\t<EntitySet Name=\"Attachments\" EntityType=\"SEPMRA_PROD_MAN.Attachment\"\t\t\t\t\tsap:searchable=\"true\" sap:addressable=\"false\" sap:content-version=\"1\" />\t\t\t\t<EntitySet Name=\"ProductCategories\" EntityType=\"SEPMRA_PROD_MAN.ProductCategory\"\t\t\t\t\tsap:creatable=\"false\" sap:updatable=\"false\" sap:deletable=\"false\"\t\t\t\t\tsap:pageable=\"false\" sap:addressable=\"false\" sap:content-version=\"1\" />\t\t\t\t<EntitySet Name=\"MainProductCategories\" EntityType=\"SEPMRA_PROD_MAN.MainProductCategory\"\t\t\t\t\tsap:creatable=\"false\" sap:updatable=\"false\" sap:deletable=\"false\"\t\t\t\t\tsap:pageable=\"false\" sap:addressable=\"false\" sap:content-version=\"1\" />\t\t\t\t<EntitySet Name=\"SalesDataSet\" EntityType=\"SEPMRA_PROD_MAN.SalesData\"\t\t\t\t\tsap:creatable=\"false\" sap:updatable=\"false\" sap:deletable=\"false\"\t\t\t\t\tsap:searchable=\"true\" sap:content-version=\"1\" />\t\t\t\t<EntitySet Name=\"Currencies\" EntityType=\"SEPMRA_PROD_MAN.Currency\"\t\t\t\t\tsap:creatable=\"false\" sap:updatable=\"false\" sap:deletable=\"false\"\t\t\t\t\tsap:searchable=\"true\" sap:content-version=\"1\" />\t\t\t\t<AssociationSet Name=\"MainProductCategory2ProductCategorySet\"\t\t\t\t\tAssociation=\"SEPMRA_PROD_MAN.MainProductCategory2ProductCategory\"\t\t\t\t\tsap:creatable=\"false\" sap:updatable=\"false\" sap:deletable=\"false\"\t\t\t\t\tsap:content-version=\"1\">\t\t\t\t\t<End EntitySet=\"MainProductCategories\" Role=\"FromRole_MainProductCategory2ProductCategory\" />\t\t\t\t\t<End EntitySet=\"ProductCategories\" Role=\"ToRole_MainProductCategory2ProductCategory\" />\t\t\t\t</AssociationSet>\t\t\t\t<AssociationSet Name=\"Product2DraftAdministrativeDataSet\"\t\t\t\t\tAssociation=\"SEPMRA_PROD_MAN.Product2DraftAdministrativeData\"\t\t\t\t\tsap:creatable=\"false\" sap:updatable=\"false\" sap:deletable=\"false\"\t\t\t\t\tsap:content-version=\"1\">\t\t\t\t\t<End EntitySet=\"DraftAdministrativeData\" Role=\"FromRole_Product2DraftAdministrativeData\" />\t\t\t\t\t<End EntitySet=\"Products\" Role=\"ToRole_Product2DraftAdministrativeData\" />\t\t\t\t</AssociationSet>\t\t\t\t<AssociationSet Name=\"Product2SalesDataSet\"\t\t\t\t\tAssociation=\"SEPMRA_PROD_MAN.Product2SalesData\" sap:creatable=\"false\"\t\t\t\t\tsap:updatable=\"false\" sap:deletable=\"false\" sap:content-version=\"1\">\t\t\t\t\t<End EntitySet=\"Products\" Role=\"FromRole_Product2SalesData\" />\t\t\t\t\t<End EntitySet=\"SalesDataSet\" Role=\"ToRole_Product2SalesData\" />\t\t\t\t</AssociationSet>\t\t\t\t<AssociationSet Name=\"Product2SupplierSet\"\t\t\t\t\tAssociation=\"SEPMRA_PROD_MAN.Product2Supplier\" sap:creatable=\"false\"\t\t\t\t\tsap:updatable=\"false\" sap:deletable=\"false\" sap:content-version=\"1\">\t\t\t\t\t<End EntitySet=\"Suppliers\" Role=\"FromRole_Product2Supplier\" />\t\t\t\t\t<End EntitySet=\"Products\" Role=\"ToRole_Product2Supplier\" />\t\t\t\t</AssociationSet>\t\t\t\t<AssociationSet Name=\"Product2AttachmentSet\"\t\t\t\t\tAssociation=\"SEPMRA_PROD_MAN.Product2Attachment\" sap:creatable=\"false\"\t\t\t\t\tsap:updatable=\"false\" sap:deletable=\"false\" sap:content-version=\"1\">\t\t\t\t\t<End EntitySet=\"Products\" Role=\"FromRole_Product2Attachment\" />\t\t\t\t\t<End EntitySet=\"Attachments\" Role=\"ToRole_Product2Attachment\" />\t\t\t\t</AssociationSet>\t\t\t\t<AssociationSet Name=\"Product2ProductCategorySet\"\t\t\t\t\tAssociation=\"SEPMRA_PROD_MAN.Product2ProductCategory\"\t\t\t\t\tsap:creatable=\"false\" sap:updatable=\"false\" sap:deletable=\"false\"\t\t\t\t\tsap:content-version=\"1\">\t\t\t\t\t<End EntitySet=\"ProductCategories\" Role=\"FromRole_Product2ProductCategory\" />\t\t\t\t\t<End EntitySet=\"Products\" Role=\"ToRole_Product2ProductCategory\" />\t\t\t\t</AssociationSet>\t\t\t\t<AssociationSet Name=\"Product2TwinEntitySet\"\t\t\t\t\tAssociation=\"SEPMRA_PROD_MAN.Product2TwinEntity\" sap:creatable=\"false\"\t\t\t\t\tsap:updatable=\"false\" sap:deletable=\"false\" sap:content-version=\"1\">\t\t\t\t\t<End EntitySet=\"Products\" Role=\"FromRole_Product2TwinEntity\" />\t\t\t\t\t<End EntitySet=\"Products\" Role=\"ToRole_Product2TwinEntity\" />\t\t\t\t</AssociationSet>\t\t\t\t<FunctionImport Name=\"ActivateProduct\" ReturnType=\"SEPMRA_PROD_MAN.Product\"\t\t\t\t\tEntitySet=\"Products\" m:HttpMethod=\"POST\" sap:action-for=\"SEPMRA_PROD_MAN.Product\">\t\t\t\t\t<Parameter Name=\"ProductUUID\" Type=\"Edm.Guid\" Mode=\"In\" />\t\t\t\t</FunctionImport>\t\t\t\t<FunctionImport Name=\"CopyProduct\" ReturnType=\"SEPMRA_PROD_MAN.Product\"\t\t\t\t\tEntitySet=\"Products\" m:HttpMethod=\"POST\" sap:action-for=\"SEPMRA_PROD_MAN.Product\">\t\t\t\t\t<Parameter Name=\"ProductUUID\" Type=\"Edm.Guid\" Mode=\"In\" />\t\t\t\t</FunctionImport>\t\t\t\t<FunctionImport Name=\"EditProduct\" ReturnType=\"SEPMRA_PROD_MAN.Product\"\t\t\t\t\tEntitySet=\"Products\" m:HttpMethod=\"POST\" sap:action-for=\"SEPMRA_PROD_MAN.Product\">\t\t\t\t\t<Parameter Name=\"ProductUUID\" Type=\"Edm.Guid\" Mode=\"In\" />\t\t\t\t</FunctionImport>\t\t\t\t<FunctionImport Name=\"ActionForFunction\" ReturnType=\"SEPMRA_PROD_MAN.Category\"\t\t\t\t\tEntitySet=\"Categories\" m:HttpMethod=\"POST\" sap:action-for=\"SEPMRA_PROD_MAN.Supplier\">\t\t\t\t\t<Parameter Name=\"SupplierUUID\" Type=\"Edm.Guid\" Mode=\"In\" />\t\t\t\t</FunctionImport>\t\t\t</EntityContainer>\t\t\t<Annotations Target=\"SEPMRA_PROD_MAN.Product/SupplierName\"\t\t\t\txmlns=\"http://docs.oasis-open.org/odata/ns/edm\">\t\t\t\t<Annotation Term=\"com.sap.vocabularies.Common.v1.ValueList\">\t\t\t\t\t<Record>\t\t\t\t\t\t<PropertyValue Property=\"CollectionPath\" String=\"Suppliers\" />\t\t\t\t\t\t<PropertyValue Property=\"SearchSupported\" Bool=\"true\" />\t\t\t\t\t\t<PropertyValue Property=\"Parameters\">\t\t\t\t\t\t\t<Collection>\t\t\t\t\t\t\t\t<Record Type=\"com.sap.vocabularies.Common.v1.ValueListParameterInOut\">\t\t\t\t\t\t\t\t\t<PropertyValue Property=\"LocalDataProperty\"\t\t\t\t\t\t\t\t\t\tPropertyPath=\"SupplierName\" />\t\t\t\t\t\t\t\t\t<PropertyValue Property=\"ValueListProperty\"\t\t\t\t\t\t\t\t\t\tString=\"Name\" />\t\t\t\t\t\t\t\t</Record>\t\t\t\t\t\t\t\t<Record Type=\"com.sap.vocabularies.Common.v1.ValueListParameterOut\">\t\t\t\t\t\t\t\t\t<PropertyValue Property=\"LocalDataProperty\"\t\t\t\t\t\t\t\t\t\tPropertyPath=\"SupplierUUID\" />\t\t\t\t\t\t\t\t\t<PropertyValue Property=\"ValueListProperty\"\t\t\t\t\t\t\t\t\t\tString=\"SupplierUUID\" />\t\t\t\t\t\t\t\t</Record>\t\t\t\t\t\t\t\t<Record\t\t\t\t\t\t\t\t\tType=\"com.sap.vocabularies.Common.v1.ValueListParameterDisplayOnly\">\t\t\t\t\t\t\t\t\t<PropertyValue Property=\"ValueListProperty\"\t\t\t\t\t\t\t\t\t\tString=\"FormattedAddress\" />\t\t\t\t\t\t\t\t</Record>\t\t\t\t\t\t\t</Collection>\t\t\t\t\t\t</PropertyValue>\t\t\t\t\t</Record>\t\t\t\t</Annotation>\t\t\t</Annotations>\t\t\t<Annotations Target=\"SEPMRA_PROD_MAN.Product/SupplierId\"\t\t\t\txmlns=\"http://docs.oasis-open.org/odata/ns/edm\">\t\t\t\t<Annotation Term=\"com.sap.vocabularies.Common.v1.ValueList\">\t\t\t\t\t<Record>\t\t\t\t\t\t<PropertyValue Property=\"CollectionPath\" String=\"Suppliers\" />\t\t\t\t\t\t<PropertyValue Property=\"SearchSupported\" Bool=\"true\" />\t\t\t\t\t\t<PropertyValue Property=\"Parameters\">\t\t\t\t\t\t\t<Collection>\t\t\t\t\t\t\t\t<Record Type=\"com.sap.vocabularies.Common.v1.ValueListParameterInOut\">\t\t\t\t\t\t\t\t\t<PropertyValue Property=\"LocalDataProperty\"\t\t\t\t\t\t\t\t\t\tPropertyPath=\"SupplierId\" />\t\t\t\t\t\t\t\t\t<PropertyValue Property=\"ValueListProperty\"\t\t\t\t\t\t\t\t\t\tString=\"SupplierId\" />\t\t\t\t\t\t\t\t</Record>\t\t\t\t\t\t\t\t<Record Type=\"com.sap.vocabularies.Common.v1.ValueListParameterOut\">\t\t\t\t\t\t\t\t\t<PropertyValue Property=\"LocalDataProperty\"\t\t\t\t\t\t\t\t\t\tPropertyPath=\"SupplierName\" />\t\t\t\t\t\t\t\t\t<PropertyValue Property=\"ValueListProperty\"\t\t\t\t\t\t\t\t\t\tString=\"Name\" />\t\t\t\t\t\t\t\t</Record>\t\t\t\t\t\t\t\t<Record\t\t\t\t\t\t\t\t\tType=\"com.sap.vocabularies.Common.v1.ValueListParameterDisplayOnly\">\t\t\t\t\t\t\t\t\t<PropertyValue Property=\"ValueListProperty\"\t\t\t\t\t\t\t\t\t\tString=\"FormattedAddress\" />\t\t\t\t\t\t\t\t</Record>\t\t\t\t\t\t\t</Collection>\t\t\t\t\t\t</PropertyValue>\t\t\t\t\t</Record>\t\t\t\t</Annotation>\t\t\t</Annotations>\t\t\t<Annotations Target=\"SEPMRA_PROD_MAN.Product/Currency\"\t\t\t\txmlns=\"http://docs.oasis-open.org/odata/ns/edm\">\t\t\t\t<Annotation Term=\"com.sap.vocabularies.Common.v1.ValueList\">\t\t\t\t\t<Record>\t\t\t\t\t\t<PropertyValue Property=\"CollectionPath\" String=\"Currencies\" />\t\t\t\t\t\t<PropertyValue Property=\"SearchSupported\" Bool=\"true\" />\t\t\t\t\t\t<PropertyValue Property=\"Parameters\">\t\t\t\t\t\t\t<Collection>\t\t\t\t\t\t\t\t<Record Type=\"com.sap.vocabularies.Common.v1.ValueListParameterInOut\">\t\t\t\t\t\t\t\t\t<PropertyValue Property=\"LocalDataProperty\"\t\t\t\t\t\t\t\t\t\tPropertyPath=\"Currency\" />\t\t\t\t\t\t\t\t\t<PropertyValue Property=\"ValueListProperty\"\t\t\t\t\t\t\t\t\t\tString=\"Code\" />\t\t\t\t\t\t\t\t</Record>\t\t\t\t\t\t\t\t<Record Type=\"com.sap.vocabularies.Common.v1.ValueListParameterOut\">\t\t\t\t\t\t\t\t\t<PropertyValue Property=\"LocalDataProperty\"\t\t\t\t\t\t\t\t\t\tPropertyPath=\"Currency\" />\t\t\t\t\t\t\t\t\t<PropertyValue Property=\"ValueListProperty\"\t\t\t\t\t\t\t\t\t\tString=\"Code\" />\t\t\t\t\t\t\t\t</Record>\t\t\t\t\t\t\t\t<Record\t\t\t\t\t\t\t\t\tType=\"com.sap.vocabularies.Common.v1.ValueListParameterDisplayOnly\">\t\t\t\t\t\t\t\t\t<PropertyValue Property=\"ValueListProperty\"\t\t\t\t\t\t\t\t\t\tString=\"Text\" />\t\t\t\t\t\t\t\t</Record>\t\t\t\t\t\t\t</Collection>\t\t\t\t\t\t</PropertyValue>\t\t\t\t\t</Record>\t\t\t\t</Annotation>\t\t\t</Annotations>\t\t\t<Annotations Target=\"SEPMRA_PROD_MAN.Product/BaseUnit\"\t\t\t\txmlns=\"http://docs.oasis-open.org/odata/ns/edm\">\t\t\t\t<Annotation Term=\"com.sap.vocabularies.Common.v1.ValueList\">\t\t\t\t\t<Record>\t\t\t\t\t\t<PropertyValue Property=\"CollectionPath\" String=\"QuantityUnits\" />\t\t\t\t\t\t<PropertyValue Property=\"SearchSupported\" Bool=\"true\" />\t\t\t\t\t\t<PropertyValue Property=\"Parameters\">\t\t\t\t\t\t\t<Collection>\t\t\t\t\t\t\t\t<Record Type=\"com.sap.vocabularies.Common.v1.ValueListParameterInOut\">\t\t\t\t\t\t\t\t\t<PropertyValue Property=\"LocalDataProperty\"\t\t\t\t\t\t\t\t\t\tPropertyPath=\"BaseUnit\" />\t\t\t\t\t\t\t\t\t<PropertyValue Property=\"ValueListProperty\"\t\t\t\t\t\t\t\t\t\tString=\"Unit\" />\t\t\t\t\t\t\t\t</Record>\t\t\t\t\t\t\t\t<Record Type=\"com.sap.vocabularies.Common.v1.ValueListParameterOut\">\t\t\t\t\t\t\t\t\t<PropertyValue Property=\"LocalDataProperty\"\t\t\t\t\t\t\t\t\t\tPropertyPath=\"BaseUnitName\" />\t\t\t\t\t\t\t\t\t<PropertyValue Property=\"ValueListProperty\"\t\t\t\t\t\t\t\t\t\tString=\"Text\" />\t\t\t\t\t\t\t\t</Record>\t\t\t\t\t\t\t</Collection>\t\t\t\t\t\t</PropertyValue>\t\t\t\t\t</Record>\t\t\t\t</Annotation>\t\t\t</Annotations>\t\t\t<Annotations Target=\"SEPMRA_PROD_MAN.Product/WeightUnit\"\t\t\t\txmlns=\"http://docs.oasis-open.org/odata/ns/edm\">\t\t\t\t<Annotation Term=\"com.sap.vocabularies.Common.v1.ValueList\">\t\t\t\t\t<Record>\t\t\t\t\t\t<PropertyValue Property=\"CollectionPath\" String=\"WeightUnits\" />\t\t\t\t\t\t<PropertyValue Property=\"SearchSupported\" Bool=\"true\" />\t\t\t\t\t\t<PropertyValue Property=\"Parameters\">\t\t\t\t\t\t\t<Collection>\t\t\t\t\t\t\t\t<Record Type=\"com.sap.vocabularies.Common.v1.ValueListParameterInOut\">\t\t\t\t\t\t\t\t\t<PropertyValue Property=\"LocalDataProperty\"\t\t\t\t\t\t\t\t\t\tPropertyPath=\"WeightUnit\" />\t\t\t\t\t\t\t\t\t<PropertyValue Property=\"ValueListProperty\"\t\t\t\t\t\t\t\t\t\tString=\"Unit\" />\t\t\t\t\t\t\t\t</Record>\t\t\t\t\t\t\t\t<Record Type=\"com.sap.vocabularies.Common.v1.ValueListParameterOut\">\t\t\t\t\t\t\t\t\t<PropertyValue Property=\"LocalDataProperty\"\t\t\t\t\t\t\t\t\t\tPropertyPath=\"WeightUnitName\" />\t\t\t\t\t\t\t\t\t<PropertyValue Property=\"ValueListProperty\"\t\t\t\t\t\t\t\t\t\tString=\"Text\" />\t\t\t\t\t\t\t\t</Record>\t\t\t\t\t\t\t</Collection>\t\t\t\t\t\t</PropertyValue>\t\t\t\t\t</Record>\t\t\t\t</Annotation>\t\t\t</Annotations>\t\t\t<Annotations Target=\"SEPMRA_PROD_MAN.Product/DimensionUnit\"\t\t\t\txmlns=\"http://docs.oasis-open.org/odata/ns/edm\">\t\t\t\t<Annotation Term=\"com.sap.vocabularies.Common.v1.ValueList\">\t\t\t\t\t<Record>\t\t\t\t\t\t<PropertyValue Property=\"CollectionPath\" String=\"DimensionUnits\" />\t\t\t\t\t\t<PropertyValue Property=\"SearchSupported\" Bool=\"true\" />\t\t\t\t\t\t<PropertyValue Property=\"Parameters\">\t\t\t\t\t\t\t<Collection>\t\t\t\t\t\t\t\t<Record Type=\"com.sap.vocabularies.Common.v1.ValueListParameterInOut\">\t\t\t\t\t\t\t\t\t<PropertyValue Property=\"LocalDataProperty\"\t\t\t\t\t\t\t\t\t\tPropertyPath=\"DimensionUnit\" />\t\t\t\t\t\t\t\t\t<PropertyValue Property=\"ValueListProperty\"\t\t\t\t\t\t\t\t\t\tString=\"ISOCode\" />\t\t\t\t\t\t\t\t</Record>\t\t\t\t\t\t\t\t<Record Type=\"com.sap.vocabularies.Common.v1.ValueListParameterOut\">\t\t\t\t\t\t\t\t\t<PropertyValue Property=\"LocalDataProperty\"\t\t\t\t\t\t\t\t\t\tPropertyPath=\"DimensionUnitName\" />\t\t\t\t\t\t\t\t\t<PropertyValue Property=\"ValueListProperty\"\t\t\t\t\t\t\t\t\t\tString=\"Text\" />\t\t\t\t\t\t\t\t</Record>\t\t\t\t\t\t\t</Collection>\t\t\t\t\t\t</PropertyValue>\t\t\t\t\t</Record>\t\t\t\t</Annotation>\t\t\t</Annotations>\t\t\t<Annotations Target=\"SEPMRA_PROD_MAN.Product/MainCategory\"\t\t\t\txmlns=\"http://docs.oasis-open.org/odata/ns/edm\">\t\t\t\t<Annotation Term=\"com.sap.vocabularies.Common.v1.ValueList\">\t\t\t\t\t<Record>\t\t\t\t\t\t<PropertyValue Property=\"CollectionPath\" String=\"MainProductCategories\" />\t\t\t\t\t\t<PropertyValue Property=\"SearchSupported\" Bool=\"true\" />\t\t\t\t\t\t<PropertyValue Property=\"Parameters\">\t\t\t\t\t\t\t<Collection>\t\t\t\t\t\t\t\t<Record Type=\"com.sap.vocabularies.Common.v1.ValueListParameterInOut\">\t\t\t\t\t\t\t\t\t<PropertyValue Property=\"LocalDataProperty\"\t\t\t\t\t\t\t\t\t\tPropertyPath=\"MainCategory\" />\t\t\t\t\t\t\t\t\t<PropertyValue Property=\"ValueListProperty\"\t\t\t\t\t\t\t\t\t\tString=\"Id\" />\t\t\t\t\t\t\t\t</Record>\t\t\t\t\t\t\t</Collection>\t\t\t\t\t\t</PropertyValue>\t\t\t\t\t</Record>\t\t\t\t</Annotation>\t\t\t</Annotations>\t\t\t<Annotations Target=\"SEPMRA_PROD_MAN.Product/Category\"\t\t\t\txmlns=\"http://docs.oasis-open.org/odata/ns/edm\">\t\t\t\t<Annotation Term=\"com.sap.vocabularies.Common.v1.ValueList\">\t\t\t\t\t<Record>\t\t\t\t\t\t<PropertyValue Property=\"CollectionPath\" String=\"ProductCategories\" />\t\t\t\t\t\t<PropertyValue Property=\"SearchSupported\" Bool=\"true\" />\t\t\t\t\t\t<PropertyValue Property=\"Parameters\">\t\t\t\t\t\t\t<Collection>\t\t\t\t\t\t\t\t<Record Type=\"com.sap.vocabularies.Common.v1.ValueListParameterInOut\">\t\t\t\t\t\t\t\t\t<PropertyValue Property=\"LocalDataProperty\"\t\t\t\t\t\t\t\t\t\tPropertyPath=\"Category\" />\t\t\t\t\t\t\t\t\t<PropertyValue Property=\"ValueListProperty\"\t\t\t\t\t\t\t\t\t\tString=\"Id\" />\t\t\t\t\t\t\t\t</Record>\t\t\t\t\t\t\t\t<Record Type=\"com.sap.vocabularies.Common.v1.ValueListParameterIn\">\t\t\t\t\t\t\t\t\t<PropertyValue Property=\"LocalDataProperty\"\t\t\t\t\t\t\t\t\t\tPropertyPath=\"MainCategory\" />\t\t\t\t\t\t\t\t\t<PropertyValue Property=\"ValueListProperty\"\t\t\t\t\t\t\t\t\t\tString=\"MainCategoryId\" />\t\t\t\t\t\t\t\t</Record>\t\t\t\t\t\t\t</Collection>\t\t\t\t\t\t</PropertyValue>\t\t\t\t\t</Record>\t\t\t\t</Annotation>\t\t\t</Annotations>\t\t\t<Annotations Target=\"SEPMRA_PROD_MAN.SEPMRA_PROD_MAN_Entities/Products\"\t\t\t\txmlns=\"http://docs.oasis-open.org/odata/ns/edm\">\t\t\t\t<Annotation Term=\"com.sap.vocabularies.Common.v1.DraftRoot\">\t\t\t\t\t<Record>\t\t\t\t\t\t<PropertyValue Property=\"ActivationAction\"\t\t\t\t\t\t\tString=\"SEPMRA_PROD_MAN.SEPMRA_PROD_MAN_Entities/ActivateProduct\" />\t\t\t\t\t\t<PropertyValue Property=\"EditAction\"\t\t\t\t\t\t\tString=\"SEPMRA_PROD_MAN.SEPMRA_PROD_MAN_Entities/EditProduct\" />\t\t\t\t\t</Record>\t\t\t\t</Annotation>\t\t\t</Annotations>\t\t\t<Annotations Target=\"SEPMRA_PROD_MAN.Product\"\t\t\t\txmlns=\"http://docs.oasis-open.org/odata/ns/edm\">\t\t\t\t<Annotation Term=\"com.sap.vocabularies.Common.v1.SemanticKey\">\t\t\t\t\t<Collection>\t\t\t\t\t\t<PropertyPath>ProductId</PropertyPath>\t\t\t\t\t</Collection>\t\t\t\t</Annotation>\t\t\t</Annotations>\t\t\t<Annotations Target=\"SEPMRA_PROD_MAN.SEPMRA_PROD_MAN_Entities/Attachment\"\t\t\t\txmlns=\"http://docs.oasis-open.org/odata/ns/edm\">\t\t\t\t<Annotation Term=\"com.sap.vocabularies.Common.v1.DraftActivationVia\">\t\t\t\t\t<Collection>\t\t\t\t\t\t<String>SEPMRA_PROD_MAN.SEPMRA_PROD_MAN_Entities/Products</String>\t\t\t\t\t</Collection>\t\t\t\t</Annotation>\t\t\t</Annotations>\t\t\t<Annotations Target=\"SEPMRA_PROD_MAN.Supplier\"\t\t\t\txmlns=\"http://docs.oasis-open.org/odata/ns/edm\">\t\t\t\t<Annotation Term=\"com.sap.vocabularies.Common.v1.SemanticKey\">\t\t\t\t\t<Collection>\t\t\t\t\t\t<PropertyPath>SupplierId</PropertyPath>\t\t\t\t\t</Collection>\t\t\t\t</Annotation>\t\t\t</Annotations>\t\t\t<atom:link rel=\"self\"\t\t\t\thref=\"https://https:/sap/opu/odata/sap/SEPMRA_PROD_MAN/$metadata\"\t\t\t\txmlns:atom=\"http://www.w3.org/2005/Atom\" />\t\t\t<atom:link rel=\"latest-version\"\t\t\t\thref=\"https://https:/sap/opu/odata/sap/SEPMRA_PROD_MAN/$metadata\"\t\t\t\txmlns:atom=\"http://www.w3.org/2005/Atom\" />\t\t</Schema>\t</edmx:DataServices></edmx:Edmx>";
mPredefinedServiceResponses.functionImportProduct1 = "<?xml version=\"1.0\" encoding=\"utf-8\"?><entry xml:base=\"https://https:/sap/opu/odata/sap/SEPMRA_PROD_MAN/\"\txmlns=\"http://www.w3.org/2005/Atom\" xmlns:m=\"http://schemas.microsoft.com/ado/2007/08/dataservices/metadata\"\txmlns:d=\"http://schemas.microsoft.com/ado/2007/08/dataservices\">\t<id>https://https:/sap/opu/odata/sap/SEPMRA_PROD_MAN/Products(guid'005056A7-004E-1ED4-BCD3-08AB3F15C97E')\t</id>\t<title type=\"text\">Products(guid'005056A7-004E-1ED4-BCD3-08AB3F15C97E')\t</title>\t<updated>2015-05-05T09:05:16Z</updated>\t<category term=\"SEPMRA_PROD_MAN.Product\"\t\tscheme=\"http://schemas.microsoft.com/ado/2007/08/dataservices/scheme\" />\t<link href=\"Products(guid'005056A7-004E-1ED4-BCD3-08AB3F15C97E')\"\t\trel=\"edit\" title=\"Product\" />\t<link\t\thref=\"Products(guid'005056A7-004E-1ED4-BCD3-08AB3F15C97E')/SalesDataSet\"\t\trel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/SalesDataSet\"\t\ttype=\"application/atom+xml;type=feed\" title=\"SalesDataSet\" />\t<link\t\thref=\"Products(guid'005056A7-004E-1ED4-BCD3-08AB3F15C97E')/ProductCategory\"\t\trel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/ProductCategory\"\t\ttype=\"application/atom+xml;type=entry\" title=\"ProductCategory\" />\t<link\t\thref=\"Products(guid'005056A7-004E-1ED4-BCD3-08AB3F15C97E')/Attachments\"\t\trel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Attachments\"\t\ttype=\"application/atom+xml;type=feed\" title=\"Attachments\" />\t<link href=\"Products(guid'005056A7-004E-1ED4-BCD3-08AB3F15C97E')/Supplier\"\t\trel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier\"\t\ttype=\"application/atom+xml;type=entry\" title=\"Supplier\" />\t<link\t\thref=\"Products(guid'005056A7-004E-1ED4-BCD3-08AB3F15C97E')/DraftAdministrativeData\"\t\trel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/DraftAdministrativeData\"\t\ttype=\"application/atom+xml;type=entry\" title=\"DraftAdministrativeData\" />\t<link href=\"Products(guid'005056A7-004E-1ED4-BCD3-08AB3F15C97E')/TwinEntity\"\t\trel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/TwinEntity\"\t\ttype=\"application/atom+xml;type=entry\" title=\"TwinEntity\" />\t<content type=\"application/xml\">\t\t<m:properties>\t\t\t<d:ExclusiveBy />\t\t\t<d:IsDraft>false</d:IsDraft>\t\t\t<d:HasTwin>false</d:HasTwin>\t\t\t<d:ProductUUID>005056A7-004E-1ED4-BCD3-08AB3F15C97E</d:ProductUUID>\t\t\t<d:ExclusiveSince m:null=\"true\" />\t\t\t<d:SupplierUUID>005056A7-004E-1ED4-BCD3-08AB3ED0C97E</d:SupplierUUID>\t\t\t<d:SupplierId>100000000</d:SupplierId>\t\t\t<d:ProductId>HT-1000</d:ProductId>\t\t\t<d:ProductType>PR</d:ProductType>\t\t\t<d:ProductTypeName>Product</d:ProductTypeName>\t\t\t<d:Category>Notebooks</d:Category>\t\t\t<d:CategoryName>Notebooks</d:CategoryName>\t\t\t<d:MainCategory>Computer Systems</d:MainCategory>\t\t\t<d:MainCategoryName>Computer Systems</d:MainCategoryName>\t\t\t<d:Name>Notebook Basic 15</d:Name>\t\t\t<d:Description>Notebook Basic 15 with 2,80 GHz quad core, 15\" LCD, 4\t\t\t\tGB DDR3 RAM, 500 GB Hard Disc, Windows 8 Pro</d:Description>\t\t\t<d:Price>956.00</d:Price>\t\t\t<d:Currency>USD</d:Currency>\t\t\t<d:ValueAddedTax>1</d:ValueAddedTax>\t\t\t<d:ValueAddedTaxName>Regular VAT</d:ValueAddedTaxName>\t\t\t<d:HeightInDimensionUnit>3.000</d:HeightInDimensionUnit>\t\t\t<d:WidthInDimensionUnit>30.000</d:WidthInDimensionUnit>\t\t\t<d:LengthInDimensionUnit>18.000</d:LengthInDimensionUnit>\t\t\t<d:DimensionUnit>CM</d:DimensionUnit>\t\t\t<d:DimensionUnitName>cm</d:DimensionUnitName>\t\t\t<d:Weight>4.200</d:Weight>\t\t\t<d:WeightUnit>KG</d:WeightUnit>\t\t\t<d:WeightUnitName>kg</d:WeightUnitName>\t\t\t<d:StockQuantityInBaseUnit>145</d:StockQuantityInBaseUnit>\t\t\t<d:BaseUnit>EA</d:BaseUnit>\t\t\t<d:BaseUnitName>each</d:BaseUnitName>\t\t\t<d:ImageUrl>/sap/public/bc/NWDEMO_MODEL/IMAGES/HT-1000.jpg\t\t\t</d:ImageUrl>\t\t\t<d:AverageRating>3.33</d:AverageRating>\t\t\t<d:NumberOfRatings>3</d:NumberOfRatings>\t\t\t<d:SupplierName>SAP</d:SupplierName>\t\t\t<d:EditState>0</d:EditState>\t\t</m:properties>\t</content></entry>";
mPredefinedServiceResponses.technicalError400Xml = "<?xml version=\"1.0\" encoding=\"utf-8\"?><error xmlns=\"http://schemas.microsoft.com/ado/2007/08/dataservices/metadata\">\t<code>/BOBF/FRW_COMMON/118</code>\t<message xml:lang=\"en\">Field \"SALESORDERID\" cannot be changed since it is read only</message>\t<innererror>\t\t<transactionid>55025622675C2E69E10000000A4450F0</transactionid>\t\t<timestamp>20150318080838.2106030</timestamp>\t\t<Error_Resolution>\t\t\t<SAP_Transaction>Run transaction /IWFND/ERROR_LOG on SAP NW Gateway hub system and search for entries with the timestamp above for more details</SAP_Transaction>\t\t\t<SAP_Note>See SAP Note 1797736 for error analysis (https://service.sap.com/sap/support/notes/1797736)</SAP_Note>\t\t\t<Batch_SAP_Note>See SAP Note 1869434 for details about working with $batch (https://service.sap.com/sap/support/notes/1869434)</Batch_SAP_Note>\t\t</Error_Resolution>\t\t<errordetails>\t\t\t<errordetail>\t\t\t\t<code>/BOBF/FRW_COMMON/118</code>\t\t\t\t<message>Field \"SALESORDERID\" cannot be changed since it is read only</message>\t\t\t\t<propertyref></propertyref>\t\t\t\t<severity>error</severity>\t\t\t\t<target></target>\t\t\t\t<longtext_url>/sap/opu/odata/iwbep/message_text;o=G1Y_400_BEP/T100_longtexts(MSGID='%2FIWBEP%2FCM_TEA',MSGNO='010',MESSAGE_V1='RAISE_BUSI_EXCEPTION_DETAILS',MESSAGE_V2='',MESSAGE_V3='',MESSAGE_V4='')/$value</longtext_url>\t\t\t</errordetail>\t\t\t<errordetail>\t\t\t\t<code>/IWBEP/CX_MGW_BUSI_EXCEPTION</code>\t\t\t\t<message>Some other error</message>\t\t\t\t<propertyref></propertyref>\t\t\t\t<severity>error</severity>\t\t\t\t<target></target>\t\t\t\t<longtext_url>/sap/opu/odata/iwbep/message_text;o=G1Y_400_BEP/T100_longtexts(MSGID='%2FIWBEP%2FCM_TEA',MSGNO='010',MESSAGE_V1='RAISE_BUSI_EXCEPTION_DETAILS',MESSAGE_V2='',MESSAGE_V3='',MESSAGE_V4='')/$value</longtext_url>\t\t\t</errordetail>\t\t</errordetails>\t</innererror></error>";
mPredefinedServiceResponses.technicalError500Xml = mPredefinedServiceResponses.technicalError400Xml;
mPredefinedServiceResponses.technicalError400Json = "{\t\"error\": {\t\t\"code\": \"/BOBF/FRW_COMMON/118\",\t\t\"message\": {\t\t\t\"lang\": \"en\",\t\t\t\"value\": \"Field \\\"SALESORDERID\\\" cannot be changed since it is read only\"\t\t},\t\t\"innererror\": {\t\t\t\"transactionid\": \"55025622675C2E69E10000000A4450F0\",\t\t\t\"timestamp\": \"20150318080838.2106030\",\t\t\t\"Error_Resolution\": {\t\t\t\t\"SAP_Transaction\": \"Run transaction /IWFND/ERROR_LOG on SAP NW Gateway hub system and search for entries with the timestamp above for more details\",\t\t\t\t\"SAP_Note\": \"See SAP Note 1797736 for error analysis (https://service.sap.com/sap/support/notes/1797736)\",\t\t\t\t\"Batch_SAP_Note\": \"See SAP Note 1869434 for details about working with $batch (https://service.sap.com/sap/support/notes/1869434)\"\t\t\t},\t\t\t\"errordetails\": [{\t\t\t\t\"code\": \"/BOBF/FRW_COMMON/118\",\t\t\t\t\"message\": \"Field \\\"SALESORDERID\\\" cannot be changed since it is read only\",\t\t\t\t\"propertyref\": \"\",\t\t\t\t\"severity\": \"error\",\t\t\t\t\"target\": \"\",\t\t\t\t\"longtext_url\": \"/sap/opu/odata/iwbep/message_text;o=G1Y_400_BEP/T100_longtexts(MSGID='%2FIWBEP%2FCM_TEA',MSGNO='010',MESSAGE_V1='RAISE_BUSI_EXCEPTION_DETAILS',MESSAGE_V2='',MESSAGE_V3='',MESSAGE_V4='')/$value\"\t\t\t}, {\t\t\t\t\"code\": \"/IWBEP/CX_MGW_BUSI_EXCEPTION\",\t\t\t\t\"message\": \"Some other error\",\t\t\t\t\"propertyref\": \"\",\t\t\t\t\"severity\": \"error\",\t\t\t\t\"target\": \"\",\t\t\t\t\"longtext_url\": \"/sap/opu/odata/iwbep/message_text;o=G1Y_400_BEP/T100_longtexts(MSGID='%2FIWBEP%2FCM_TEA',MSGNO='010',MESSAGE_V1='RAISE_BUSI_EXCEPTION_DETAILS',MESSAGE_V2='',MESSAGE_V3='',MESSAGE_V4='')/$value\"\t\t\t}]\t\t}\t}}";
mPredefinedServiceResponses.technicalError500Json = mPredefinedServiceResponses.technicalError400Json;
mPredefinedServiceResponses.technicalError400Json2 = "{\t\"error\": {\t\t\"code\": \"SY/530\",\t\t\"message\": {\t\t\t\"lang\": \"en\",\t\t\t\"value\": \"Warning\"\t\t},\t\t\"innererror\": {\t\t\t\"transactionid\": \"5570DDCFC85D6352E10000000A445279\",\t\t\t\"timestamp\": \"20150610070411.9523060\",\t\t\t\"Error_Resolution\": {\t\t\t\t\"SAP_Transaction\": \"Run transaction /IWFND/ERROR_LOG on SAP NW Gateway hub system and search for entries with the timestamp above for more details\",\t\t\t\t\"SAP_Note\": \"See SAP Note 1797736 for error analysis (https://service.sap.com/sap/support/notes/1797736)\",\t\t\t\t\"Batch_SAP_Note\": \"See SAP Note 1869434 for details about working with $batch (https://service.sap.com/sap/support/notes/1869434)\"\t\t\t},\t\t\t\"errordetails\": [{\t\t\t\t\"code\": \"\",\t\t\t\t\"message\": \"Multiple error/warning messages\",\t\t\t\t\"propertyref\": \"\",\t\t\t\t\"severity\": \"error\",\t\t\t\t\"target\": \"Property\"\t\t\t}, {\t\t\t\t\"code\": \"\",\t\t\t\t\"message\": \"Inner error\",\t\t\t\t\"propertyref\": \"\",\t\t\t\t\"severity\": \"error\",\t\t\t\t\"target\": \"Message\"\t\t\t}, {\t\t\t\t\"code\": \"\",\t\t\t\t\"message\": \"Inner error 2\",\t\t\t\t\"propertyref\": \"\",\t\t\t\t\"severity\": \"error\",\t\t\t\t\"target\": \"Type\"\t\t\t}, {\t\t\t\t\"code\": \"\",\t\t\t\t\"message\": \"Warning\",\t\t\t\t\"propertyref\": \"\",\t\t\t\t\"severity\": \"warning\",\t\t\t\t\"target\": \"Type\"\t\t\t},{\t\t\t\t\"code\": \"/IWBEP/CX_MGW_BUSI_EXCEPTION\",\t\t\t\t\"message\": \"Business Error with details in TEA application\",\t\t\t\t\"propertyref\": \"\",\t\t\t\t\"severity\": \"error\",\t\t\t\t\"target\":\"\"\t\t\t}]\t\t}\t}}";
mPredefinedServiceResponses.expandedData = mPredefinedServiceResponses.technicalError400Xml2 = "<?xml version=\"1.0\" encoding=\"utf-8\"?><error xmlns=\"http://schemas.microsoft.com/ado/2007/08/dataservices/metadata\">\t<code>SY/530</code>\t<message xml:lang=\"en\">Warning</message>\t<innererror>\t\t<transactionid>55755400750A3A92E10000000A445279</transactionid>\t\t<timestamp>20150610072313.5174130</timestamp>\t\t<Error_Resolution>\t\t\t<SAP_Transaction>Run transaction /IWFND/ERROR_LOG on SAP NW Gateway hub system and search for entries with the timestamp above for more details</SAP_Transaction>\t\t\t<SAP_Note>See SAP Note 1797736 for error analysis (https://service.sap.com/sap/support/notes/1797736)</SAP_Note>\t\t</Error_Resolution>\t\t<errordetails>\t\t\t<errordetail>\t\t\t\t<code/>\t\t\t\t<message>Multiple error/warning messages</message>\t\t\t\t<propertyref/>\t\t\t\t<severity>error</severity>\t\t\t\t<target>Property</target>\t\t\t</errordetail>\t\t\t<errordetail>\t\t\t\t<code/>\t\t\t\t<message>Inner error</message>\t\t\t\t<propertyref/>\t\t\t\t<severity>error</severity>\t\t\t\t<target>Message</target>\t\t\t</errordetail>\t\t\t<errordetail>\t\t\t\t<code/>\t\t\t\t<message>Inner error 2</message>\t\t\t\t<propertyref/>\t\t\t\t<severity>error</severity>\t\t\t\t<target>Type</target>\t\t\t</errordetail>\t\t\t<errordetail>\t\t\t\t<code/>\t\t\t\t<message>Warning</message>\t\t\t\t<propertyref/>\t\t\t\t<severity>warning</severity>\t\t\t\t<target>Type</target>\t\t\t</errordetail>\t\t\t<errordetail>\t\t\t\t<code>/IWBEP/CX_MGW_BUSI_EXCEPTION</code>\t\t\t\t<message>Business Error with details in TEA application</message>\t\t\t\t<propertyref/>\t\t\t\t<severity>error</severity>\t\t\t\t<target/>\t\t\t</errordetail>\t\t</errordetails>\t</innererror></error>";
mPredefinedServiceResponses.ProductsExpandSupplier = "{\"d\" : {\"__metadata\": {\"uri\": \"http://services.odata.org/V2/Northwind/Northwind.svc/Products(1)\", \"type\": \"NorthwindModel.Product\"}, \"ProductID\": 1, \"ProductName\": \"Chai\", \"SupplierID\": 1, \"CategoryID\": 1, \"QuantityPerUnit\": \"10 boxes x 20 bags\", \"UnitPrice\": \"18.0000\", \"UnitsInStock\": 39, \"UnitsOnOrder\": 0, \"ReorderLevel\": 10, \"Discontinued\": false, \"Category\": {\"__deferred\": {\"uri\": \"http://services.odata.org/V2/Northwind/Northwind.svc/Products(1)/Category\"}}, \"Order_Details\": {\"__deferred\": {\"uri\": \"http://services.odata.org/V2/Northwind/Northwind.svc/Products(1)/Order_Details\"}}, \"Supplier\": {\"__metadata\": {\"uri\": \"http://services.odata.org/V2/Northwind/Northwind.svc/Suppliers(1)\", \"type\": \"NorthwindModel.Supplier\"}, \"SupplierID\": 1, \"CompanyName\": \"Exotic Liquids\", \"ContactName\": \"Charlotte Cooper\", \"ContactTitle\": \"Purchasing Manager\", \"Address\": \"49 Gilbert St.\", \"City\": \"London\", \"Region\": null, \"PostalCode\": \"EC1 4SD\", \"Country\": \"UK\", \"Phone\": \"(171) 555-2222\", \"Fax\": null, \"HomePage\": null, \"Products\": {\"__deferred\": {\"uri\": \"http://services.odata.org/V2/Northwind/Northwind.svc/Suppliers(1)/Products\"}}}}}";