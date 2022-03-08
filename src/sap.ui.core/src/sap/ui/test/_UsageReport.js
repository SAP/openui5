/*!
 * ${copyright}
 */

// private
sap.ui.define([
    "sap/ui/base/Object",
    "sap/ui/test/_OpaLogger",
    "sap/ui/thirdparty/jquery"
], function(Ui5Object, _OpaLogger, jQueryDOM) {
    "use strict";

    var DEFAULT_URL = "http://localhost:8090";
    var oLogger = _OpaLogger.getLogger("sap.ui.test._UsageReport");

    var _UsageReport = Ui5Object.extend("sap.ui.test._UsageReport", {
        constructor: function (oConfig) {
            this.enabled = oConfig && oConfig.enableUsageReport;
            this.baseUrl = (oConfig && oConfig.usageReportUrl || DEFAULT_URL) + "/api/opa/suites/";
            if (this.enabled) {
                oLogger.info("Enabled OPA usage report");
            }

            // separate report enablement from the report logic: conditionally send XHRs if reporting is explicitly enabled
            var oPrototype = _UsageReport.prototype;
            Object.keys(oPrototype).forEach(function (sKey) {
                var bIsSpecialFunction = ["constructor", "getMetadata"].indexOf(sKey) > -1;
                if (oPrototype.hasOwnProperty(sKey) && typeof oPrototype[sKey] === "function" && !bIsSpecialFunction) {
                    var fnOriginal = oPrototype[sKey];
                    oPrototype[sKey] = function () {
                        if (this.enabled) {
                            return fnOriginal.apply(this, arguments);
                        }
                    };
                }
            });
        },
        begin: function (oDetails) {
            this._beginSuitePromise = postJson(this.baseUrl + "begin", oDetails)
                .done(function (data) {
                    this._id = data.id;
                    oLogger.debug("Begin report with ID " + data.id);
                }.bind(this))
                .fail(function (err) {
                    oLogger.debug("Failed to begin report. Error: " + JSON.stringify(err));
                });
        },
        moduleStart: function (oDetails) {
            this._moduleUpdate(oDetails);
        },
        testStart: function () {
            this._isOpaEmpty = false;
            this._QUnitTimeoutDetails = null;
        },
        testDone: function (oDetails) {
            // the details available depend on whether a QUnit timeout occurred:
            // - no QUnit timeout: OPA queue is emptied and then the test finishes (call opaEmpty, then testDone)
            // - with QUnit timeout: the test finishes, then the OPA queue is stopped and an error message is formed (call testDone, then opaEmpty)
            // details for tests without an OPA queue will NOT be reported
            if (this._isOpaEmpty) {
                this._reportOpaTest(oDetails);
                this._isOpaEmpty = false;
            } else {
                this._QUnitTimeoutDetails = oDetails;
            }
        },
        opaEmpty: function (oOptions) {
            this._isOpaEmpty = true;
            if (oOptions && oOptions.qunitTimeout) {
                var oLastAssertion = this._QUnitTimeoutDetails.assertions.slice(-1)[0];
                oLastAssertion.message += "\n" + oOptions.errorMessage;
                this._reportOpaTest(this._QUnitTimeoutDetails);
            }
        },
        moduleDone: function (oDetails) {
            this._moduleUpdate(oDetails);
        },
        done: function (oDetails) {
            this._postSuiteJson("/done", oDetails)
                .done(function (data) {
                    oLogger.debug("Completed report with ID " + this._id);
                }.bind(this))
                .fail(function (err) {
                    oLogger.debug("Failed to complete report with ID " + this._id + ". Error: " + JSON.stringify(err));
                }.bind(this))
                .always(function () {
                    this._beginSuitePromise = null;
                }.bind(this));
        },
        _moduleUpdate: function (oDetails) {
            this._postSuiteJson("/modules", oDetails)
            .done(function (data) {
                oLogger.debug("Sent report for module " + oDetails.name);
            })
            .fail(function (err) {
                oLogger.debug("Failed to send report for module '" + oDetails.name + "'. Error: " + JSON.stringify(err));
            });
        },
        _reportOpaTest: function (oDetails) {
            this._postSuiteJson("/tests", oDetails)
                .done(function (data) {
                    oLogger.debug("Sent report for test " + oDetails.name);
                })
                .fail(function (err) {
                    oLogger.debug("Failed send report for test '" + oDetails.name + "'. Error: " + JSON.stringify(err));
                });
        },
        _postSuiteJson: function (sUrlSuffix, oData) {
            // wait for begin suite request
            var oPromise = this._beginSuitePromise || new jQueryDOM.Deferred().resolve().promise();
            return oPromise.done(function () {
                return postJson.call(this, this.baseUrl + this._id + sUrlSuffix, oData);
            }.bind(this));
        }
    });

    function postJson(sUrl, oData) {
        return jQueryDOM.ajax({
            url: sUrl,
            type: "XHR_WAITER_IGNORE:POST",
            data: oData,
            dataType: "json"
        });
    }

    return _UsageReport;
});
