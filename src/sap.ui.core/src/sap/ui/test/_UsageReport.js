/*!
 * ${copyright}
 */

// private
sap.ui.define([
	"jquery.sap.global",
    "sap/ui/base/Object",
    "./_OpaLogger"
], function ($, Ui5Object, _OpaLogger) {
    "use strict";

    var DEFAULT_URL = "http://localhost:8090";
    var oLogger = _OpaLogger.getLogger("sap.ui.test._UsageReport");

    var _UsageReport = Ui5Object.extend("sap.ui.test._UsageReport", {
        constructor: function (oConfig) {
            this.enabled = oConfig && oConfig.enableUsageReport === "true";
            this.baseUrl = (oConfig && oConfig.usageReportUrl || DEFAULT_URL) + "/api/opa/suites/";
            if (this.enabled) {
                oLogger.info("Enabled OPA usage report");
            }

            // separate report enablement from the report logic: conditionally send XHRs if reporting is explicitly enabled
            var oPrototype = sap.ui.test._UsageReport.prototype;
            Object.keys(oPrototype).forEach(function (sKey) {
                var bIsSpecialFunction = ["constructor", "getMetadata"].indexOf(sKey) > -1;
                if (oPrototype.hasOwnProperty(sKey) && $.isFunction(oPrototype[sKey]) && !bIsSpecialFunction) {
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
            this._suiteBeginPromise = postJson(this.baseUrl + "begin", oDetails)
                .done(function (data) {
                    this._id = data.id;
                    oLogger.debug("Begin report with ID " + data.id);
                }.bind(this))
                .fail(function (err) {
                    oLogger.debug("Failed to begin report. Error: " + err);
                });
        },
        moduleUpdate: function (oDetails) {
            this._postSuiteJson("/modules", oDetails)
                .done(function (data) {
                    oLogger.debug("Sent report for module " + oDetails.name);
                })
                .fail(function (err) {
                    oLogger.debug("Failed to send report for module '" + oDetails.name + "'. Error: " + err);
                });
        },
        testDone: function (oDetails) {
            // there are 2 ways a test end is handled:
            // - if a test is successful or has an OPA timeout, OPA queue is emptied and then the test finishes (testDone is called)
            // - if there is a QUnit timeout, the test finishes (testDone is called), then the OPA queue is stopped and an error message is formed
            if (this._isOpaEmpty) {
                this._reportTest(oDetails);
                this._isOpaEmpty = false;
            } else {
                this._QUnitTimeoutTest = oDetails;
            }
        },
        opaEmpty: function (oOptions) {
            this._isOpaEmpty = true;
            if (this._QUnitTimeoutTest) {
                var assertions = this._QUnitTimeoutTest.assertions;
                assertions[assertions.length - 1].message += "\n" + oOptions.errorMessage;
                this._reportTest(this._QUnitTimeoutTest);
                this._QUnitTimeoutTest = null;
            }
        },
        done: function (oDetails) {
            this._postSuiteJson("/done", oDetails)
                .done(function (data) {
                    oLogger.debug("Completed report with ID " + this._id);
                }.bind(this))
                .fail(function (err) {
                    oLogger.debug("Failed to complete report with ID " + this._id + ". Error: " + err);
                }.bind(this));
        },
        _reportTest: function (oDetails) {
            this._postSuiteJson("/tests", oDetails)
                .done(function (data) {
                    oLogger.debug("Sent report for test " + oDetails.name);
                })
                .fail(function (err) {
                    oLogger.debug("Failed send report for test '" + oDetails.name + "'. Error: " + err);
                });
        },
        _postSuiteJson: function (sUrlSuffix, oData) {
            var oPromise = this._suiteBeginPromise || $.Deferred().resolve().promise();
            return oPromise.done(function () {
                return postJson.call(this, this.baseUrl + this._id + sUrlSuffix, oData);
            }.bind(this));
        }
    });

    function postJson(sUrl, oData) {
        return $.ajax({
            url: sUrl,
            type: "POST",
            data: oData,
            dataType: "json"
        });
    }

    return _UsageReport;
});
