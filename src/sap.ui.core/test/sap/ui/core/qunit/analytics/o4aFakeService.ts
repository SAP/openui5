export class o4aFakeService {
    static addResponse(oResponse: any) {
        if (oResponse.uri[0] === "/") {
            oResponse.uri = oResponse.uri.substring(1, oResponse.uri.length);
        }
        this._aResponses.push(oResponse);
    }
    static findResponse(oRequest: any) {
        var sURI = oRequest.url;
        var bBatch = sURI.indexOf("$batch") >= 0;
        for (var i = 0; i < this._aResponses.length; i++) {
            var oResponse = this._aResponses[i];
            if (bBatch && oResponse.batch) {
                var iNumberOfContainedSubRequests = 0;
                for (var j = 0; j < oResponse.uri.length; j++) {
                    var sSingleUriFromBatch = oResponse.uri[j];
                    if (oRequest.requestBody.indexOf(sSingleUriFromBatch) >= 0) {
                        iNumberOfContainedSubRequests++;
                    }
                }
                if (iNumberOfContainedSubRequests === oResponse.uri.length) {
                    return oResponse;
                }
            }
            else if (!bBatch && !oResponse.batch) {
                var sFinalURI = this.baseURI + oResponse.uri;
                if (sURI === sFinalURI) {
                    return oResponse;
                }
            }
        }
    }
    static setBaseURI(sBaseURI: any) {
        this.baseURI = sBaseURI || this.baseURI;
        if (this.baseURI[this.baseURI.length - 1] !== "/") {
            this.baseURI += "/";
        }
    }
    static setResponseDelay(iDelayTime: any) {
        this._iResponseDelay = iDelayTime;
    }
    static fake(mParams: any) {
        mParams = mParams || {};
        this.setBaseURI(mParams.baseURI);
        this.setResponseDelay(mParams.responseDelay || 200);
        var xhr = sinon.useFakeXMLHttpRequest(), _setTimeout = window.setTimeout, that = this;
        xhr.useFilters = true;
        xhr.addFilter(function (method, url) {
            return url.indexOf(that.baseURI) != 0;
        });
        xhr.onCreate = function (request) {
            request.onSend = function () {
                var oResponse = that.findResponse(request);
                if (oResponse) {
                    if (request.async === true) {
                        _setTimeout(function () {
                            request.respond(200, oResponse.header, oResponse.content);
                        }, that._iResponseDelay);
                    }
                    else {
                        request.respond(200, oResponse.header, oResponse.content);
                    }
                }
            };
        };
    }
}