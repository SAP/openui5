import Log from "sap/base/Log";
import ObjectPath from "sap/base/util/ObjectPath";
import BindingParser from "sap/ui/base/BindingParser";
import ManagedObject from "sap/ui/base/ManagedObject";
import SyncPromise from "sap/ui/base/SyncPromise";
import Component from "sap/ui/core/Component";
import XMLTemplateProcessor from "sap/ui/core/XMLTemplateProcessor";
import XMLPreprocessor from "sap/ui/core/util/XMLPreprocessor";
import BindingMode from "sap/ui/model/BindingMode";
import ChangeReason from "sap/ui/model/ChangeReason";
import Context from "sap/ui/model/Context";
import JSONModel from "sap/ui/model/json/JSONModel";
import Measurement from "sap/ui/performance/Measurement";
import XMLHelper from "sap/ui/util/XMLHelper";
var sComponent = "sap.ui.core.util.XMLPreprocessor", iOldLogLevel = Log.getLevel(sComponent);
function asyncModel(oData) {
    var oModel = new JSONModel(oData);
    oModel.$$valueAsPromise = true;
    oModel.bindProperty = function () {
        var oBinding = JSONModel.prototype.bindProperty.apply(this, arguments);
        oBinding.checkUpdate = function () {
            var vValue = this._getValue();
            if (this.mParameters.$$valueAsPromise) {
                if (0 <= vValue && vValue < 10) {
                    vValue = new Promise(function (resolve) {
                        setTimeout(resolve.bind(null, vValue), vValue);
                    });
                }
                else if (vValue instanceof Error) {
                    vValue = Promise.reject(vValue);
                }
                else if (vValue !== "sync") {
                    vValue = Promise.resolve(vValue);
                }
            }
            else {
                vValue = NaN;
            }
            this.oValue = vValue;
            this._fireChange({ reason: "change" });
        };
        return oBinding;
    };
    oModel.bindList = function () {
        var oBinding = JSONModel.prototype.bindList.apply(this, arguments), fnGetContexts = oBinding.getContexts, bWaited = false;
        oBinding.enableExtendedChangeDetection = function (bDetectUpdates, vKey) {
            if (bDetectUpdates || vKey !== undefined) {
                throw new Error("Unexpected: enableExtendedChangeDetection(" + bDetectUpdates + ", " + vKey + ")");
            }
            this.bUseExtendedChangeDetection = true;
        };
        oBinding.getContexts = function () {
            var aContexts;
            if (bWaited) {
                return fnGetContexts.apply(this, arguments);
            }
            setTimeout(function () {
                bWaited = true;
                oBinding._fireChange({ reason: ChangeReason.Change });
            }, 5);
            aContexts = [];
            if (this.bUseExtendedChangeDetection) {
                aContexts.dataRequested = true;
            }
            return aContexts;
        };
        return oBinding;
    };
    return oModel;
}
function mvcView(sPrefix) {
    sPrefix = sPrefix || "template";
    return "<mvc:View xmlns=\"sap.ui.core\" xmlns:mvc=\"sap.ui.core.mvc\" xmlns:" + sPrefix + "=\"http://schemas.sap.com/sapui5/extension/sap.ui.core.template/1\">";
}
function process(oViewContent, mSettings, bAsync) {
    var oViewInfo = {
        caller: "qux",
        componentId: "this._sOwnerId",
        name: "this.sViewName",
        sync: !bAsync,
        _supportInfo: function () { }
    };
    return XMLPreprocessor.process(oViewContent, oViewInfo, mSettings);
}
function warn(oLogMock, sExpectedWarning, vDetails) {
    return oLogMock.expects("warning").exactly(Log.isLoggable(Log.Level.WARNING, sComponent) ? 1 : 0).withExactArgs(_matchArg(sExpectedWarning), _matchArg(vDetails), sComponent);
}
function xml(assert, aContent) {
    var oDocument = XMLHelper.parse(aContent.join(""));
    assert.strictEqual(oDocument.parseError.errorCode, 0, "XML parsed correctly");
    return oDocument.documentElement;
}
function _matchArg(vExpected) {
    if (typeof vExpected === "string") {
        return sinon.match(function (sActual) {
            return _normalizeXml(vExpected) === _normalizeXml(sActual);
        }, vExpected);
    }
    return vExpected;
}
function _normalizeXml(sXml) {
    sXml = sXml.replace(/ xmlns.*?=\".*?\"/g, "").replace(/ \/>/g, "/>").replace(/ \w+:require=".*?"/, "");
    return sXml;
}
function _withBalancedBindAggregation(that, assert, fnCodeUnderTest) {
    var oBindAggregationExpectation, oUnbindAggregationExpectation;
    oBindAggregationExpectation = that.mock(ManagedObject.prototype).expects("bindAggregation").atLeast(0).withExactArgs("list", sinon.match({ mode: BindingMode.OneTime })).callThrough();
    oUnbindAggregationExpectation = that.mock(ManagedObject.prototype).expects("unbindAggregation").atLeast(0).withExactArgs("list", true).callThrough();
    return SyncPromise.resolve(fnCodeUnderTest()).then(function (oResult) {
        assert.strictEqual(oUnbindAggregationExpectation.callCount, oBindAggregationExpectation.callCount, "balance of bind and unbind");
        return oResult;
    });
}
function _withBalancedBindProperty(that, assert, fnCodeUnderTest) {
    var oBindPropertyExpectation, oUnbindPropertyExpectation;
    function checkBindingMode(oBindingInfo) {
        var aParts = oBindingInfo.parts;
        if (oBindingInfo.mode !== BindingMode.OneTime) {
            return false;
        }
        if (aParts) {
            return aParts.every(function (oInfoPart) {
                return oInfoPart.mode === BindingMode.OneTime;
            });
        }
        return true;
    }
    oBindPropertyExpectation = that.mock(ManagedObject.prototype).expects("bindProperty").atLeast(0).withExactArgs("any", sinon.match(checkBindingMode)).callThrough();
    oUnbindPropertyExpectation = that.mock(ManagedObject.prototype).expects("unbindProperty").atLeast(0).withExactArgs("any", true).callThrough();
    return SyncPromise.resolve(fnCodeUnderTest()).then(function (oResult) {
        assert.strictEqual(oUnbindPropertyExpectation.callCount, oBindPropertyExpectation.callCount, "balance of bind and unbind");
        return oResult;
    });
}
QUnit.module("sap.ui.core.util.XMLPreprocessor", {
    afterEach: function () {
        Log.setLevel(iOldLogLevel, sComponent);
        delete window.foo;
        this.oLogMock.expects("debug").withExactArgs("Plug-in visitor for namespace 'foo', local name 'Bar'", null, sComponent);
        XMLPreprocessor.plugIn(null, "foo", "Bar");
    },
    beforeEach: function () {
        Log.setLevel(Log.Level.DEBUG, sComponent);
        this.oObjectPathMock = this.mock(ObjectPath);
        this.oLogMock = this.mock(Log);
        this.oLogMock.expects("warning").never();
        this.oLogMock.expects("error").never();
        this.oDebugExpectation = this.oLogMock.expects("debug").atLeast(0);
        this.oXMLTemplateProcessorMock = this.mock(XMLTemplateProcessor);
        this.oXMLTemplateProcessorMock.expects("loadTemplate").never();
        this.oXMLTemplateProcessorMock.expects("loadTemplatePromise").never();
        this.oSapUiMock = this.mock(sap.ui);
        this.oSapUiMock.expects("require").on(sap.ui).atLeast(0).withExactArgs("sap/ui/base/EventProvider").callThrough();
    },
    check: function (assert, aViewContent, mSettings, vExpected, bAsync) {
        var sActual, sExpected, oViewContent = xml(assert, aViewContent), i, that = this;
        if (!vExpected) {
            vExpected = [];
            for (i = 1; i < aViewContent.length - 1; i += 1) {
                if (aViewContent[i].startsWith("<In ") || aViewContent[i].startsWith("<!--In:")) {
                    vExpected.push(aViewContent[i]);
                }
            }
        }
        if (Array.isArray(vExpected)) {
            vExpected.unshift(aViewContent[0]);
            vExpected.push(aViewContent[aViewContent.length - 1]);
            if (vExpected.length === 2) {
                vExpected = ["<mvc:View xmlns:mvc=\"sap.ui.core.mvc\"/>"];
            }
        }
        aViewContent.forEach(function (sLine) {
            if (/if test="(false|true|\{= false \})"/.test(sLine)) {
                warn(that.oLogMock, sinon.match(/\[[ \d]\d\] Constant test condition/), sLine);
            }
        });
        return _withBalancedBindAggregation(this, assert, function () {
            return _withBalancedBindProperty(that, assert, function () {
                return process(oViewContent, mSettings, bAsync);
            });
        }).then(function (oResult) {
            assert.strictEqual(oResult, oViewContent);
            sActual = _normalizeXml(XMLHelper.serialize(oViewContent));
            if (Array.isArray(vExpected)) {
                sExpected = _normalizeXml(vExpected.join(""));
                assert.strictEqual(sActual, sExpected, "XML looks as expected: " + sExpected);
            }
            else {
                assert.ok(vExpected.test(sActual), "XML: " + sActual + " matches " + vExpected);
            }
        });
    },
    checkError: function (assert, aViewContent, sExpectedMessage, mSettings, vOffender, bAsync) {
        var oViewContent = xml(assert, aViewContent);
        if (vOffender === undefined || typeof vOffender === "number") {
            vOffender = aViewContent[vOffender || 1];
        }
        sExpectedMessage = sExpectedMessage.replace("{0}", vOffender);
        this.oLogMock.expects("error").withExactArgs(_matchArg(sExpectedMessage), "qux", sComponent);
        return SyncPromise.resolve().then(function () {
            return process(oViewContent, mSettings, bAsync);
        }).then(function () {
            assert.ok(false);
        }, function (oError) {
            assert.strictEqual(_normalizeXml(oError.message), _normalizeXml("qux: " + sExpectedMessage), oError.stack);
        });
    },
    checkTracing: function (assert, bDebug, aExpectedMessages, aViewContent, mSettings, vExpected, bAsync, fnVisitor) {
        var aMessagesInActualOrder = [], aMessagesInExpectedOrder = [], that = this;
        if (fnVisitor) {
            this.oLogMock.expects("debug").withExactArgs("Plug-in visitor for namespace 'foo', local name 'Bar'", sinon.match.func, sComponent);
            XMLPreprocessor.plugIn(fnVisitor, "foo", "Bar");
        }
        this.oDebugExpectation.never();
        if (!bDebug) {
            Log.setLevel(Log.Level.WARNING, sComponent);
        }
        else {
            aExpectedMessages.forEach(function (oExpectedMessage, i) {
                var vExpectedDetail = oExpectedMessage.d;
                if (typeof vExpectedDetail === "number") {
                    vExpectedDetail = aViewContent[vExpectedDetail];
                }
                that.oLogMock.expects("debug").withExactArgs(_matchArg(oExpectedMessage.m), _matchArg(vExpectedDetail), sComponent).callsFake(function (sMessage, vDetail, sComponent) {
                    var s = sMessage + " - " + vDetail;
                    aMessagesInActualOrder.push(s);
                    aMessagesInExpectedOrder[i] = s;
                });
            });
        }
        return this.check(assert, aViewContent, mSettings, vExpected, bAsync).then(function () {
            assert.strictEqual(aMessagesInActualOrder.join("\n"), aMessagesInExpectedOrder.join("\n"), "order of log messages");
        });
    },
    expectLoad: function (bAsync, sName, sXml) {
        if (bAsync) {
            this.oXMLTemplateProcessorMock.expects("loadTemplatePromise").withExactArgs(sName, "fragment").returns(new Promise(function (resolve) {
                setTimeout(resolve.bind(null, sXml), 0);
            }));
        }
        else {
            this.oXMLTemplateProcessorMock.expects("loadTemplate").withExactArgs(sName, "fragment").returns(sXml);
        }
    },
    expectRequire: function (bAsync, aURNs, fnCallback, bAllAvailable) {
        var aAvailableModules = bAllAvailable ? fnCallback() : [aURNs.length > 1 ? {} : null], that = this;
        if (bAsync) {
            aURNs.forEach(function (sURN, i) {
                that.oSapUiMock.expects("require").withExactArgs(sURN, i, aURNs).returns(aAvailableModules[i]);
            });
            if (!bAllAvailable) {
                this.oSapUiMock.expects("require").withExactArgs(aURNs, sinon.match.func, sinon.match.func).callsFake(function (aDependencies, fnFactory, fnErrback) {
                    setTimeout(function () {
                        fnFactory.apply(null, fnCallback && fnCallback());
                    }, 0);
                });
            }
            this.oSapUiMock.expects("requireSync").never();
        }
        else {
            aURNs.forEach(function (sURN, i) {
                that.oSapUiMock.expects("requireSync").withArgs(sURN).callsFake(i === 0 ? fnCallback : undefined);
            });
        }
    },
    unexpected: function (assert, aViewContent, sExpectedMessage) {
        var iUnexpected;
        aViewContent.forEach(function (sViewContent, i) {
            if (/id="unexpected"/.test(sViewContent)) {
                iUnexpected = i;
            }
        });
        this.checkError(assert, aViewContent, sExpectedMessage, undefined, iUnexpected);
    }
});
[{
        aViewContent: [
            mvcView("t"),
            "<t:if test=\"false\">",
            "<Out/>",
            "</t:if>",
            "</mvc:View>"
        ]
    }, {
        aViewContent: [
            mvcView(),
            "<template:if test=\"{= false }\">",
            "<Out/>",
            "</template:if>",
            "</mvc:View>"
        ]
    }].forEach(function (oFixture) {
    [false, true].forEach(function (bWarn) {
        var aViewContent = oFixture.aViewContent;
        QUnit.test(aViewContent[1] + ", warn = " + bWarn, function (assert) {
            if (!bWarn) {
                Log.setLevel(Log.Level.ERROR, sComponent);
            }
            this.check(assert, aViewContent);
        });
    });
});
QUnit.test("XML with template:if test='true'", function (assert) {
    this.check(assert, [
        mvcView(),
        "<template:if test=\"true\">",
        "<In id=\"first\"/>",
        "<In id=\"true\"/>",
        "<In id=\"last\"/>",
        "<!--In: check that comments are tolerated, even as last child -->",
        "</template:if>",
        "</mvc:View>"
    ]);
});
[false, true].forEach(function (bWarn) {
    QUnit.test("Warnings w/o debug output log caller, warn = " + bWarn, function (assert) {
        Log.setLevel(bWarn ? Log.Level.WARNING : Log.Level.ERROR, sComponent);
        warn(this.oLogMock, "Warning(s) during processing of qux", null).exactly(bWarn ? 1 : 0);
        this.check(assert, [
            mvcView(),
            "<template:if test=\"true\"/>",
            "<template:if test=\"true\"/>",
            "</mvc:View>"
        ]);
    });
});
QUnit.test("XML with multiple template:if", function (assert) {
    this.check(assert, [
        mvcView(),
        "<template:if test=\"true\">",
        "<In id=\"true\"/>",
        "</template:if>",
        "<template:if test=\"false\">",
        "<Out/>",
        "</template:if>",
        "</mvc:View>"
    ]);
});
QUnit.test("XML with nested template:if (as last child)", function (assert) {
    this.check(assert, [
        mvcView(),
        "<template:if test=\"true\">",
        "<In id=\"true\"/>",
        "<template:if test=\"false\">",
        "<Out/>",
        "</template:if>",
        "</template:if>",
        "</mvc:View>"
    ]);
});
QUnit.test("XML with nested template:if (as inner child)", function (assert) {
    this.check(assert, [
        mvcView(),
        "<template:if test=\"true\">",
        "<In id=\"true\"/>",
        "<template:if test=\"false\">",
        "<Out/>",
        "</template:if>",
        "<template:if test=\"false\"/>",
        "</template:if>",
        "</mvc:View>"
    ]);
});
["true", true, 1, "X"].forEach(function (oFlag) {
    QUnit.test("XML with template:if test='{/flag}', truthy, flag = " + oFlag, function (assert) {
        this.check(assert, [
            mvcView("t"),
            "<t:if test=\"{path: '/flag', type: 'sap.ui.model.type.Boolean'}\">",
            "<In id=\"flag\"/>",
            "</t:if>",
            "</mvc:View>"
        ], {
            models: new JSONModel({ flag: oFlag })
        });
    });
});
["false", false, 0, null, undefined, NaN, ""].forEach(function (oFlag) {
    QUnit.test("XML with template:if test='{/flag}', falsy, flag = " + oFlag, function (assert) {
        this.check(assert, [
            mvcView(),
            "<template:if test=\"{/flag}\">",
            "<Out/>",
            "</template:if>",
            "</mvc:View>"
        ], {
            models: new JSONModel({ flag: oFlag })
        });
    });
});
["true", true, 1, "X"].forEach(function (oFlag) {
    QUnit.test("XML with template:if test='{flag}', truthy, flag = " + oFlag, function (assert) {
        var oModel = new JSONModel({ flag: oFlag });
        this.check(assert, [
            mvcView(),
            "<template:if test=\"{flag}\">",
            "<In id=\"flag\"/>",
            "</template:if>",
            "</mvc:View>"
        ], {
            models: oModel,
            bindingContexts: oModel.createBindingContext("/")
        });
    });
});
QUnit.test("XML with template:if test='{formatter:...}'", function (assert) {
    window.foo = {
        Helper: {
            not: function (oRawValue) {
                return !oRawValue;
            }
        }
    };
    this.check(assert, [
        mvcView(),
        "<template:if test=\"{formatter: 'foo.Helper.not', path:'/flag'}\">",
        "<In id=\"flag\"/>",
        "</template:if>",
        "</mvc:View>"
    ], {
        models: new JSONModel({ flag: false })
    });
});
[{
        aViewContent: [
            mvcView(),
            "<template:if test=\"" + "{formatter: 'foo.Helper.fail', path:'/flag'}" + "\">",
            "<Out/>",
            "</template:if>",
            "</mvc:View>"
        ],
        aDebugMessages: [
            { m: "[ 0] Start processing qux" },
            { m: "[ 1] test == undefined --> false", d: 1 },
            { m: "[ 1] Finished", d: 3 },
            { m: "[ 0] Finished processing qux" }
        ]
    }, {
        aViewContent: [
            mvcView(),
            "<Fragment fragmentName=\"" + "{formatter: 'foo.Helper.fail', path:'/flag'}" + "\" type=\"XML\"/>",
            "</mvc:View>"
        ],
        bAsIs: true
    }, {
        aViewContent: [
            mvcView(),
            "<ExtensionPoint name=\"" + "{formatter: 'foo.Helper.fail', path:'/flag'}" + "\"/>",
            "</mvc:View>"
        ],
        bAsIs: true
    }].forEach(function (oFixture) {
    [false, true].forEach(function (bWarn) {
        var aViewContent = oFixture.aViewContent, vExpected = oFixture.bAsIs ? [aViewContent[1]] : undefined;
        QUnit.test(aViewContent[1] + ", exception in formatter, warn = " + bWarn, function (assert) {
            var oError = new Error("deliberate failure");
            this.mock(Component).expects("getCustomizing").never();
            if (!bWarn) {
                Log.setLevel(Log.Level.ERROR, sComponent);
            }
            warn(this.oLogMock, sinon.match(/\[ \d\] Error in formatter: Error: deliberate failure/), aViewContent[1]).exactly(bWarn ? 1 : 0);
            window.foo = {
                Helper: {
                    fail: function (oRawValue) {
                        throw oError;
                    }
                }
            };
            if (bWarn && oFixture.aDebugMessages) {
                this.checkTracing(assert, true, oFixture.aDebugMessages, aViewContent, {
                    models: new JSONModel({ flag: true })
                }, vExpected);
            }
            else {
                this.check(assert, aViewContent, {
                    models: new JSONModel({ flag: true })
                }, vExpected);
            }
        });
    });
});
[{
        aViewContent: [
            mvcView(),
            "<template:if test=\"{unrelated>/some/path}\">",
            "<Out/>",
            "</template:if>",
            "</mvc:View>"
        ]
    }, {
        aViewContent: [
            mvcView(),
            "<template:if test=\"" + "{path:'/some/path',formatter:'.someMethod'}" + "\">",
            "<Out/>",
            "</template:if>",
            "</mvc:View>"
        ],
        sMessage: "[ 1] Function name(s) .someMethod not found"
    }, {
        aViewContent: [
            mvcView(),
            "<template:if test=\"" + "{path:'/some/path',formatter:'.someMethod'}" + "{path:'/some/path',formatter:'foo.bar'}" + "\">",
            "<Out/>",
            "</template:if>",
            "</mvc:View>"
        ],
        sMessage: "[ 1] Function name(s) .someMethod, foo.bar not found"
    }, {
        aViewContent: [
            mvcView(),
            "<template:repeat list=\"{path: '/', factory: '.someMethod'}\"/>",
            "</mvc:View>"
        ],
        sMessage: "[ 0] Function name(s) .someMethod not found"
    }, {
        aViewContent: [
            mvcView(),
            "<Fragment fragmentName=\"{foo>/some/path}\" type=\"XML\"/>",
            "</mvc:View>"
        ],
        vExpected: [
            "<Fragment fragmentName=\"{foo&gt;/some/path}\" type=\"XML\"/>"
        ]
    }, {
        aViewContent: [
            mvcView(),
            "<ExtensionPoint name=\"{foo>/some/path}\"/>",
            "</mvc:View>"
        ],
        vExpected: [
            "<ExtensionPoint name=\"{foo&gt;/some/path}\"/>"
        ]
    }].forEach(function (oFixture) {
    [false, true].forEach(function (bWarn) {
        var aViewContent = oFixture.aViewContent, vExpected = oFixture.vExpected && oFixture.vExpected.slice();
        QUnit.test(aViewContent[1] + ", warn = " + bWarn, function (assert) {
            this.mock(Component).expects("getCustomizing").never();
            if (!bWarn) {
                Log.setLevel(Log.Level.ERROR, sComponent);
            }
            warn(this.oLogMock, oFixture.sMessage || sinon.match(/\[ \d\] Binding not ready/), aViewContent[1]).exactly(bWarn ? 1 : 0);
            this.check(assert, aViewContent, {
                models: new JSONModel()
            }, vExpected);
        });
    });
});
QUnit.test("Do not process nested template:ifs if not necessary", function (assert) {
    window.foo = {
        Helper: {
            forbidden: function (oRawValue) {
                assert.ok(false, "formatter MUST not be called!");
            }
        }
    };
    this.check(assert, [
        mvcView(),
        "<template:if test=\"false\">",
        "<template:if test=\"{formatter: 'foo.Helper.forbidden', path:'/flag'}\"/>",
        "</template:if>",
        "</mvc:View>"
    ], {
        models: new JSONModel({ flag: true })
    });
});
QUnit.test("XML with template:if test='false' and template:then", function (assert) {
    this.check(assert, [
        mvcView(),
        "<template:if test=\"false\">",
        "<template:then>",
        "<Out/>",
        "</template:then>",
        "</template:if>",
        "</mvc:View>"
    ]);
});
QUnit.test("XML with template:if test='true' and template:then", function (assert) {
    this.check(assert, [
        mvcView(),
        "<template:if test=\"true\">",
        "<!-- some comment node -->",
        "<template:then>",
        "<In id=\"then\"/>",
        "</template:then>",
        "</template:if>",
        "</mvc:View>"
    ]);
});
QUnit.test("XML with nested template:if test='true' and template:then", function (assert) {
    this.check(assert, [
        mvcView(),
        "<template:if test=\"true\">",
        "<template:if test=\"true\">",
        "<template:then>",
        "<In id=\"true\"/>",
        "</template:then>",
        "</template:if>",
        "</template:if>",
        "</mvc:View>"
    ]);
});
QUnit.test("XML with template:if test='true' and template:then/else", function (assert) {
    this.check(assert, [
        mvcView(),
        "<template:if test=\"true\">",
        "<template:then>",
        "<In id=\"then\"/>",
        "</template:then>",
        "<!-- some comment node -->",
        "<template:else>",
        "<Out/>",
        "</template:else>",
        "</template:if>",
        "</mvc:View>"
    ]);
});
QUnit.test("XML with template:if test='false' and template:then/else", function (assert) {
    this.check(assert, [
        mvcView(),
        "<template:if test=\"false\">",
        "<template:then>",
        "<Out/>",
        "</template:then>",
        "<template:else>",
        "<In id=\"else\"/>",
        "</template:else>",
        "</template:if>",
        "</mvc:View>"
    ]);
});
QUnit.test("XML with nested template:if test='true' and template:then/else", function (assert) {
    this.check(assert, [
        mvcView(),
        "<template:if test=\"true\">",
        "<In id=\"true\"/>",
        "<template:if test=\"false\">",
        "<template:then>",
        "<Out/>",
        "</template:then>",
        "<template:else>",
        "<In id=\"else\"/>",
        "</template:else>",
        "</template:if>",
        "</template:if>",
        "</mvc:View>"
    ]);
});
[[
        mvcView(),
        "<template:foo id=\"unexpected\"/>",
        "</mvc:View>"
    ], [
        mvcView(),
        "<template:then id=\"unexpected\"/>",
        "</mvc:View>"
    ], [
        mvcView(),
        "<template:else id=\"unexpected\"/>",
        "</mvc:View>"
    ]].forEach(function (aViewContent, i) {
    QUnit.test("Unexpected tags (" + i + ")", function (assert) {
        this.unexpected(assert, aViewContent, "Unexpected tag {0}");
    });
});
[[
        mvcView(),
        "<template:if test=\"true\">",
        "<template:then/>",
        "<Icon id=\"unexpected\"/>",
        "</template:if>",
        "</mvc:View>"
    ], [
        mvcView(),
        "<template:if test=\"true\">",
        "<template:then/>",
        "<template:then id=\"unexpected\"/>",
        "</template:if>",
        "</mvc:View>"
    ], [
        mvcView(),
        "<template:if test=\"true\">",
        "<template:then/>",
        "<Icon id=\"unexpected\"/>",
        "<template:else/>",
        "</template:if>",
        "</mvc:View>"
    ]].forEach(function (aViewContent, i) {
    QUnit.test("Expected <template:else>, but instead saw... (" + i + ")", function (assert) {
        this.unexpected(assert, aViewContent, "Expected <template:elseif> or <template:else>, but instead saw {0}");
    });
});
[[
        mvcView("t"),
        "<t:if test=\"true\">",
        "<t:then/>",
        "<t:else/>",
        "<!-- some comment node -->",
        "<Icon id=\"unexpected\"/>",
        "</t:if>",
        "</mvc:View>"
    ], [
        mvcView("t"),
        "<t:if test=\"true\">",
        "<t:then/>",
        "<t:else/>",
        "<t:else id=\"unexpected\"/>",
        "</t:if>",
        "</mvc:View>"
    ]].forEach(function (aViewContent, i) {
    QUnit.test("Expected </t:if>, but instead saw... (" + i + ")", function (assert) {
        this.unexpected(assert, aViewContent, "Expected </t:if>, but instead saw {0}");
    });
});
QUnit.test("<template:elseif>: if is true", function (assert) {
    this.check(assert, [
        mvcView(),
        "<template:if test=\"true\">",
        "<template:then>",
        "<In id=\"true\"/>",
        "</template:then>",
        "<template:elseif test=\"truthy\">",
        "<Out/>",
        "</template:elseif>",
        "<template:else>",
        "<Out/>",
        "</template:else>",
        "</template:if>",
        "</mvc:View>"
    ]);
});
QUnit.test("<template:elseif>: all false, w/ else", function (assert) {
    this.check(assert, [
        mvcView(),
        "<template:if test=\"false\">",
        "<template:then>",
        "<Out/>",
        "</template:then>",
        "<template:elseif test=\"false\">",
        "<Out/>",
        "</template:elseif>",
        "<template:else>",
        "<In id=\"true\"/>",
        "</template:else>",
        "</template:if>",
        "</mvc:View>"
    ]);
});
QUnit.test("<template:elseif>: all false, w/o else", function (assert) {
    this.check(assert, [
        mvcView(),
        "<template:if test=\"false\">",
        "<template:then>",
        "<Out/>",
        "</template:then>",
        "<template:elseif test=\"false\">",
        "<Out/>",
        "</template:elseif>",
        "</template:if>",
        "</mvc:View>"
    ]);
});
QUnit.test("<template:elseif>: elseif is true", function (assert) {
    this.check(assert, [
        mvcView(),
        "<template:if test=\"false\">",
        "<template:then>",
        "<Out/>",
        "</template:then>",
        "<template:elseif test=\"false\">",
        "<Out/>",
        "</template:elseif>",
        "<template:elseif test=\"true\">",
        "<In id=\"true\"/>",
        "</template:elseif>",
        "<template:else>",
        "<Out/>",
        "</template:else>",
        "</template:if>",
        "</mvc:View>"
    ]);
});
QUnit.test("binding resolution", function (assert) {
    window.foo = {
        Helper: {
            help: function (vRawValue) {
                return vRawValue.String || "{" + vRawValue.Path + "}";
            },
            nil: function () {
                return null;
            }
        }
    };
    this.check(assert, [
        mvcView().replace(">", " xmlns:html=\"http://www.w3.org/1999/xhtml\">"),
        "<!-- some comment node -->",
        "<Label text=\"{formatter: 'foo.Helper.help'," + " path: '/com.sap.vocabularies.UI.v1.HeaderInfo/Title/Label'}\"/>",
        "<Text maxLines=\"{formatter: 'foo.Helper.nil'," + " path: '/com.sap.vocabularies.UI.v1.HeaderInfo/Title/Value'}\"" + " text=\"{formatter: 'foo.Helper.help'," + " path: '/com.sap.vocabularies.UI.v1.HeaderInfo/Title/Value'}\"/>",
        "<Label text=\"A \\{ is a special character\"/>",
        "<Text text=\"{unrelated>/some/path}\"/>",
        "<Text text=\"" + "{path:'/some/path',formatter:'.someMethod'}" + "\"/>",
        "<html:img src=\"{formatter: 'foo.Helper.help'," + " path: '/com.sap.vocabularies.UI.v1.HeaderInfo/TypeImageUrl'}\"/>",
        "</mvc:View>"
    ], {
        models: new JSONModel({
            "com.sap.vocabularies.UI.v1.HeaderInfo": {
                "TypeImageUrl": {
                    "String": "/coco/apps/main/img/Icons/product_48.png"
                },
                "Title": {
                    "Label": {
                        "String": "Customer"
                    },
                    "Value": {
                        "Path": "CustomerName"
                    }
                }
            }
        })
    }, [
        "<!-- some comment node -->",
        "<Label text=\"Customer\"/>",
        "<Text text=\"{CustomerName}\"/>",
        "<Label text=\"A \\{ is a special character\"/>",
        "<Text text=\"{unrelated&gt;/some/path}\"/>",
        "<Text text=\"" + "{path:'/some/path',formatter:'.someMethod'}" + "\"/>",
        "<html:img src=\"/coco/apps/main/img/Icons/product_48.png\"/>"
    ]);
});
[false, true].forEach(function (bDebug) {
    var sTitle = "binding resolution: ignore [object Object], debug = " + bDebug;
    QUnit.test(sTitle, function (assert) {
        this.checkTracing(assert, bDebug, [
            { m: "[ 0] Start processing qux" },
            { m: "[ 0] text = [object Object]", d: 1 },
            { m: "[ 0] Ignoring [object Array] value for attribute text", d: 3 },
            { m: "[ 0] Ignoring [object Date] value for attribute text", d: 4 },
            { m: "[ 0] Ignoring [object Object] value for attribute text", d: 5 },
            { m: "[ 0] Finished processing qux" }
        ], [
            mvcView().replace(">", " xmlns:html=\"http://www.w3.org/1999/xhtml\">"),
            "<Text text=\"{/string}\"/>",
            "<Text text=\"[object Object]\"/>",
            "<Text text=\"{/Array}\"/>",
            "<Text text=\"{/Date}\"/>",
            "<Text text=\"{/Object}\"/>",
            "</mvc:View>"
        ], {
            models: new JSONModel({
                "string": "[object Object]",
                "Array": [],
                "Date": new Date(),
                "Object": {}
            })
        }, [
            "<Text text=\"[object Object]\"/>",
            "<Text text=\"[object Object]\"/>",
            "<Text text=\"{/Array}\"/>",
            "<Text text=\"{/Date}\"/>",
            "<Text text=\"{/Object}\"/>"
        ]);
    });
});
[false, true].forEach(function (bDebug) {
    var sTitle = "binding resolution: interface to formatter, debug = " + bDebug;
    QUnit.test(sTitle, function (assert) {
        var oModel = new JSONModel({
            "somewhere": {
                "com.sap.vocabularies.UI.v1.HeaderInfo": {
                    "Title": {
                        "Label": {
                            "String": "Customer"
                        },
                        "Value": {
                            "Path": "CustomerName"
                        }
                    }
                }
            }
        }), that = this;
        function checkInterface(oInterface, sExpectedPath) {
            assert.throws(function () {
                oInterface.getInterface();
            }, /Missing path/);
            assert.throws(function () {
                oInterface.getInterface(0);
            }, /Not the root formatter of a composite binding/);
            assert.strictEqual(oInterface.getInterface("String").getPath(), sExpectedPath + "/String");
            assert.strictEqual(oInterface.getInterface("/absolute/path").getPath(), "/absolute/path");
            assert.strictEqual(oInterface.getInterface("/absolute").getInterface("path").getPath(), "/absolute/path");
            assert.strictEqual(oInterface.getModel(), oModel);
            assert.strictEqual(oInterface.getPath(), sExpectedPath);
            assert.strictEqual(oInterface.getSetting("bindTexts"), true, "settings");
            assert.throws(function () {
                oInterface.getSetting("bindingContexts");
            }, /Illegal argument: bindingContexts/);
            assert.throws(function () {
                oInterface.getSetting("models");
            }, /Illegal argument: models/);
        }
        function help(oInterface, vRawValue) {
            var sExpectedPath = vRawValue.String ? "/somewhere/com.sap.vocabularies.UI.v1.HeaderInfo/Title/Label" : "/somewhere/com.sap.vocabularies.UI.v1.HeaderInfo/Title/Value";
            checkInterface(oInterface, sExpectedPath);
            return vRawValue.String || "{" + vRawValue.Path + "}";
        }
        help.requiresIContext = true;
        function checkInterfaceForPart(oInterface, i) {
            var oCreateBindingContextExpectation, oInterface2Part, oModel = oInterface.getModel(i);
            oInterface2Part = oInterface.getInterface(i);
            assert.strictEqual(oInterface2Part.getModel(), oModel);
            assert.strictEqual(oInterface2Part.getModel(42), oModel);
            assert.strictEqual(oInterface2Part.getPath(), oInterface.getPath(i));
            assert.strictEqual(oInterface2Part.getPath(42), oInterface.getPath(i));
            assert.throws(function () {
                oInterface2Part.getInterface();
            }, /Missing path/);
            assert.throws(function () {
                oInterface2Part.getInterface(0);
            }, /Not the root formatter of a composite binding/);
            assert.strictEqual(oInterface2Part.getInterface(undefined, "foo/bar").getPath(), oInterface.getPath(i) + "/foo/bar");
            assert.strictEqual(oInterface2Part.getInterface("foo/bar").getPath(), oInterface.getPath(i) + "/foo/bar");
            assert.strictEqual(oInterface2Part.getInterface("foo").getInterface("bar").getPath(), oInterface.getPath(i) + "/foo/bar");
            assert.strictEqual(oInterface2Part.getInterface(undefined, "/absolute/path").getPath(), "/absolute/path");
            assert.strictEqual(oInterface2Part.getInterface("/absolute/path").getPath(), "/absolute/path");
            assert.strictEqual(oInterface.getSetting("bindTexts"), true, "settings");
            assert.throws(function () {
                oInterface.getSetting("bindingContexts");
            }, /Illegal argument: bindingContexts/);
            assert.throws(function () {
                oInterface.getSetting("models");
            }, /Illegal argument: models/);
            oInterface2Part = oInterface.getInterface(i, "String");
            assert.strictEqual(oInterface2Part.getModel(), oModel);
            assert.strictEqual(oInterface2Part.getPath(), oInterface.getPath(i) + "/String");
            assert.strictEqual(oInterface2Part.getSetting("bindTexts"), true, "settings");
            try {
                oCreateBindingContextExpectation = that.mock(oModel).expects("createBindingContext").callThrough();
                oInterface2Part = oInterface.getInterface(i, "/absolute/path");
                assert.strictEqual(oInterface2Part.getModel(), oModel);
                assert.strictEqual(oInterface2Part.getPath(), "/absolute/path");
                assert.strictEqual(oInterface2Part.getSetting("bindTexts"), true, "settings");
            }
            finally {
                oCreateBindingContextExpectation.restore();
            }
            try {
                oCreateBindingContextExpectation = that.mock(oModel).expects("createBindingContext").twice();
                oInterface2Part = oInterface.getInterface(i, "String");
                assert.ok(false, "getInterface() MUST throw error for async contexts");
            }
            catch (e) {
                assert.strictEqual(e.message, "Model could not create binding context synchronously: " + oModel);
            }
            finally {
                oCreateBindingContextExpectation.restore();
            }
        }
        function formatParts(oInterface, vRawValue) {
            var i, aResult;
            function formatLabelOrValue(o) {
                return o.String ? "[" + o.String + "]" : "{" + o.Path + "}";
            }
            try {
                if (oInterface.getModel() || oInterface.getPath()) {
                    checkInterface(oInterface, "/somewhere/com.sap.vocabularies.UI.v1.HeaderInfo/Title/Label");
                    return formatLabelOrValue(vRawValue);
                }
                else {
                    aResult = [];
                    assert.throws(function () {
                        oInterface.getInterface();
                    }, /Invalid index of part: undefined/);
                    assert.throws(function () {
                        oInterface.getInterface(-1);
                    }, /Invalid index of part: -1/);
                    assert.strictEqual(oInterface.getModel(), undefined, "exactly as documented");
                    assert.strictEqual(oInterface.getPath(), undefined, "exactly as documented");
                    for (i = 0; oInterface.getModel(i) || oInterface.getPath(i); i += 1) {
                        checkInterfaceForPart(oInterface, i);
                        aResult.push(formatLabelOrValue(oInterface.getModel(i).getProperty(oInterface.getPath(i))));
                    }
                    assert.throws(function () {
                        oInterface.getInterface(i);
                    }, new RegExp("Invalid index of part: " + i));
                    assert.strictEqual(oInterface.getModel(i), undefined, "exactly as documented");
                    assert.strictEqual(oInterface.getPath(i), undefined, "exactly as documented");
                    return aResult.join(" ");
                }
            }
            catch (e) {
                assert.ok(false, e.stack || e);
            }
        }
        formatParts.requiresIContext = true;
        function other(vRawValue) {
            assert.strictEqual(arguments.length, 1);
        }
        other.requiresIContext = "ignored";
        window.foo = {
            Helper: {
                formatParts: formatParts,
                help: help,
                other: other
            }
        };
        this.checkTracing(assert, bDebug, [
            { m: "[ 0] Start processing qux" },
            { m: "[ 0] undefined = /somewhere/com.sap.vocabularies.UI.v1.HeaderInfo" },
            { m: "[ 0] Removed attribute text", d: 1 },
            { m: "[ 0] text = Customer", d: 2 },
            { m: "[ 0] text = Value: {CustomerName}", d: 3 },
            { m: "[ 0] text = Customer: {CustomerName}", d: 4 },
            { m: "[ 0] Binding not ready for attribute text", d: 5 },
            { m: "[ 0] text = [Customer] {CustomerName}", d: 6 },
            { m: "[ 0] text = [Customer]", d: 7 },
            { m: "[ 0] Finished processing qux" }
        ], [
            mvcView(),
            "<Text text=\"{formatter: 'foo.Helper.other', path: 'Title/Label'}\"/>",
            "<Text text=\"{formatter: 'foo.Helper.help', path: 'Title/Label'}\"/>",
            "<Text text=\"Value: {formatter: 'foo.Helper.help', path: 'Title/Value'}\"/>",
            "<Text text=\"{formatter: 'foo.Helper.help', path: 'Title/Label'}" + ": {formatter: 'foo.Helper.help', path: 'Title/Value'}\"/>",
            "<Text text=\"{unrelated>/some/path}\"/>",
            "<Text text=\"{parts: [{path: 'Title/Label'}, {path: 'Title/Value'}]," + " formatter: 'foo.Helper.formatParts'}\"/>",
            "<Text text=\"{formatter: 'foo.Helper.formatParts', path: 'Title/Label'}\"/>",
            "</mvc:View>"
        ], {
            models: oModel,
            bindingContexts: oModel.createBindingContext("/somewhere/com.sap.vocabularies.UI.v1.HeaderInfo"),
            bindTexts: true
        }, [
            "<Text/>",
            "<Text text=\"Customer\"/>",
            "<Text text=\"Value: {CustomerName}\"/>",
            "<Text text=\"Customer: {CustomerName}\"/>",
            "<Text text=\"{unrelated&gt;/some/path}\"/>",
            "<Text text=\"[Customer] {CustomerName}\"/>",
            "<Text text=\"[Customer]\"/>"
        ]);
    });
});
[false, true].forEach(function (bDebug) {
    QUnit.test("binding resolution, exception in formatter, debug = " + bDebug, function (assert) {
        window.foo = {
            Helper: {
                fail: function (oRawValue) {
                    throw new Error("deliberate failure");
                }
            }
        };
        this.checkTracing(assert, bDebug, [
            { m: "[ 0] Start processing qux" },
            { m: "[ 0] Error in formatter of attribute text Error: deliberate failure", d: 1 },
            { m: "[ 0] Error in formatter of attribute text Error: deliberate failure", d: 2 },
            { m: "[ 0] Finished processing qux" }
        ], [
            mvcView(),
            "<In text=\"{formatter: 'foo.Helper.fail'," + " path: '/com.sap.vocabularies.UI.v1.HeaderInfo/Title/Label'}\"/>",
            "<In text=\"{formatter: 'foo.Helper.fail'," + " path: '/com.sap.vocabularies.UI.v1.HeaderInfo/Title/Value'}\"/>",
            "</mvc:View>"
        ], {
            models: new JSONModel({
                "com.sap.vocabularies.UI.v1.HeaderInfo": {
                    "Title": {
                        "Label": {
                            "String": "Customer"
                        },
                        "Value": {
                            "Path": "CustomerName"
                        }
                    }
                }
            })
        });
    });
});
QUnit.test("template:with", function (assert) {
    this.check(assert, [
        mvcView(),
        "<template:with path=\"/some/random/path\">",
        "<template:if test=\"{flag}\">",
        "<In id=\"flag\"/>",
        "</template:if>",
        "</template:with>",
        "</mvc:View>"
    ], {
        models: new JSONModel({
            some: {
                random: {
                    path: {
                        flag: true
                    }
                }
            }
        })
    });
});
QUnit.test("template:with calls createBindingContext()", function (assert) {
    var oDataModel = new JSONModel(), oMetaModel = new JSONModel({
        some: {
            random: {
                path: {
                    flag: true
                }
            }
        }
    });
    this.mock(oDataModel).expects("createBindingContext").withExactArgs("/some/#random/path").returns(oMetaModel.createBindingContext("/some/random/path"));
    this.check(assert, [
        mvcView(),
        "<template:with path=\"/some/#random/path\" var=\"path\">",
        "<template:if test=\"{path>flag}\">",
        "<In id=\"flag\"/>",
        "</template:if>",
        "</template:with>",
        "</mvc:View>"
    ], {
        models: oDataModel
    });
});
[false, true].forEach(function (bHasHelper) {
    QUnit.test("template:with and 'named context', has helper = " + bHasHelper, function (assert) {
        window.foo = {
            Helper: {
                help: function () { }
            }
        };
        this.check(assert, [
            mvcView(),
            "<template:with path=\"/some\" var=\"some\">",
            "<template:with path=\"some>random/path\" var=\"path\"" + (bHasHelper ? " helper=\"foo.Helper.help\"" : "") + ">",
            "<template:if test=\"{path>flag}\">",
            "<In id=\"flag\"/>",
            "</template:if>",
            "</template:with>",
            "</template:with>",
            "</mvc:View>"
        ], {
            models: new JSONModel({
                some: {
                    random: {
                        path: {
                            flag: true
                        }
                    }
                }
            })
        });
    });
});
QUnit.test("template:with and 'named context', missing variable name", function (assert) {
    this.checkError(assert, [
        mvcView(),
        "<template:with path=\"/unused\" var=\"\"/>",
        "</mvc:View>"
    ], "Missing variable name for {0}");
});
QUnit.test("template:with and 'named context', missing model", function (assert) {
    this.checkError(assert, [
        mvcView(),
        "<template:with path=\"some>random/path\" var=\"path\"/>",
        "</mvc:View>"
    ], "Missing model 'some' in {0}");
});
QUnit.test("template:with and 'named context', missing context", function (assert) {
    this.checkError(assert, [
        mvcView(),
        "<template:with path=\"some/random/place\" var=\"place\"/>",
        "</mvc:View>"
    ], "Cannot resolve path for {0}", {
        models: new JSONModel()
    });
});
[false, true].forEach(function (bAsync) {
    [false, true].forEach(function (bWithVar) {
        QUnit.test("template:with and helper, async = " + bAsync + ", with var = " + bWithVar, function (assert) {
            var oModel = new JSONModel({
                target: {
                    flag: true
                }
            });
            window.foo = {
                Helper: {
                    help: function (oContext) {
                        assert.ok(oContext instanceof Context);
                        assert.strictEqual(oContext.getModel(), oModel);
                        assert.strictEqual(oContext.getPath(), "/some/random/path");
                        return bAsync ? Promise.resolve("/target") : "/target";
                    }
                }
            };
            return this.checkTracing(assert, true, [
                { m: "[ 0] Start processing qux" },
                { m: "[ 1] " + (bWithVar ? "target" : "") + " = /target", d: 1 },
                { m: "[ 2] test == true --> true", d: 2 },
                { m: "[ 2] Finished", d: "</template:if>" },
                { m: "[ 1] Finished", d: "</template:with>" },
                { m: "[ 0] Finished processing qux" }
            ], [
                mvcView(),
                "<template:with path=\"/some/random/path\" helper=\"foo.Helper.help\"" + (bWithVar ? " var=\"target\"" : "") + ">",
                "<template:if test=\"{" + (bWithVar ? "target>" : "") + "flag}\">",
                "<In id=\"flag\"/>",
                "</template:if>",
                "</template:with>",
                "</mvc:View>"
            ], {
                models: oModel
            }, undefined, bAsync);
        });
    });
});
[false, true].forEach(function (bWithVar) {
    QUnit.test("template:with and helper changing the model, with var = " + bWithVar, function (assert) {
        var oMetaModel = new JSONModel({
            target: {
                flag: true
            }
        }), oModel = new JSONModel();
        window.foo = {
            Helper: {
                help: function (oContext) {
                    assert.ok(oContext instanceof Context);
                    assert.strictEqual(oContext.getModel(), oModel);
                    assert.strictEqual(oContext.getPath(), "/some/random/path");
                    return oMetaModel.createBindingContext("/target");
                }
            }
        };
        this.check(assert, [
            mvcView(),
            "<template:with path=\"/some/random/path\" helper=\"foo.Helper.help\"" + (bWithVar ? " var=\"target\"" : "") + ">",
            "<template:if test=\"{" + (bWithVar ? "target>" : "") + "flag}\">",
            "<In id=\"flag\"/>",
            "</template:if>",
            "</template:with>",
            "</mvc:View>"
        ], {
            models: {
                meta: oMetaModel,
                "undefined": oModel
            }
        });
    });
});
[undefined, {}].forEach(function (fnHelper) {
    QUnit.test("template:with and helper = " + fnHelper, function (assert) {
        window.foo = fnHelper;
        this.checkError(assert, [
            mvcView(),
            "<template:with path=\"/unused\" var=\"target\" helper=\"foo\"/>",
            "</mvc:View>"
        ], "Cannot resolve helper for {0}", {
            models: new JSONModel()
        });
    });
});
QUnit.test("<template:with helper=\".\">", function (assert) {
    this.checkError(assert, [
        mvcView(),
        "<template:with path=\"/unused\" var=\"target\" helper=\".\"/>",
        "</mvc:View>"
    ], "Cannot resolve helper for {0}", {
        models: new JSONModel()
    });
});
[false, true].forEach(function (bAsync) {
    [true, ""].forEach(function (vResult) {
        QUnit.test("template:with and helper returning " + vResult + ", bAsync = " + bAsync, function (assert) {
            window.foo = function () {
                return vResult;
            };
            this.checkError(assert, [
                mvcView(),
                "<template:with path=\"/unused\" var=\"target\" helper=\"foo\"/>",
                "</mvc:View>"
            ], "Illegal helper result '" + vResult + "' in {0}", {
                models: new JSONModel()
            }, undefined, bAsync);
        });
    });
});
QUnit.test("template:with repeated w/ same variable and value", function (assert) {
    var oModel = new JSONModel(), sTemplate1 = "<template:with path=\"bar>/my/path\" var=\"bar\"/>", sTemplate2 = "<template:with path=\"bar>bla\" helper=\"foo\"/>", sTemplate3 = "<template:with path=\"bar>/my/path\"/>";
    window.foo = function () {
        return "/my/path";
    };
    warn(this.oLogMock, "[ 1] Set unchanged path: /my/path", sTemplate1);
    warn(this.oLogMock, "[ 1] Set unchanged path: /my/path", sTemplate2);
    warn(this.oLogMock, "[ 1] Set unchanged path: /my/path", sTemplate3);
    this.check(assert, [
        mvcView(),
        sTemplate1,
        sTemplate2,
        sTemplate3,
        "</mvc:View>"
    ], {
        models: { bar: oModel },
        bindingContexts: {
            bar: oModel.createBindingContext("/my/path")
        }
    });
});
QUnit.test("template:with synchronously and helper returning Promise", function (assert) {
    window.foo = function () {
        return Promise.resolve();
    };
    this.checkError(assert, [
        mvcView(),
        "<template:with path=\"/unused\" helper=\"foo\"/>",
        "</mvc:View>"
    ], "Async helper in sync view in {0}", {
        models: new JSONModel()
    });
});
QUnit.test("template:with synchronously and helper returning SyncPromise", function (assert) {
    var oModel = new JSONModel({
        target: {
            flag: true
        }
    });
    window.foo = function (oContext) {
        return SyncPromise.resolve("/target");
    };
    this.check(assert, [
        mvcView(),
        "<template:with path=\"/some/random/path\" helper=\"foo\">",
        "<template:if test=\"{flag}\">",
        "<In id=\"flag\"/>",
        "</template:if>",
        "</template:with>",
        "</mvc:View>"
    ], {
        models: oModel
    });
});
QUnit.test("template:repeat w/o named models", function (assert) {
    this.check(assert, [
        mvcView(),
        "<template:repeat list=\"{/items}\">",
        "<In src=\"{src}\"/>",
        "</template:repeat>",
        "</mvc:View>"
    ], {
        models: new JSONModel({
            items: [{
                    src: "A"
                }, {
                    src: "B"
                }, {
                    src: "C"
                }]
        })
    }, [
        "<In src=\"A\"/>",
        "<In src=\"B\"/>",
        "<In src=\"C\"/>"
    ]);
});
QUnit.test("template:repeat & iSizeLimit", function (assert) {
    function many(vValue) {
        var aArray = [], i;
        for (i = 0; i < 200; i += 1) {
            aArray.push(vValue);
        }
        return aArray;
    }
    this.check(assert, [
        mvcView(),
        "<template:repeat list=\"{/items}\">",
        "<In src=\"{src}\"/>",
        "</template:repeat>",
        "</mvc:View>"
    ], {
        models: new JSONModel({
            items: many({ src: "A" })
        })
    }, many("<In src=\"A\"/>"));
});
QUnit.test("template:repeat, startIndex & length", function (assert) {
    this.check(assert, [
        mvcView(),
        "<template:repeat list=\"" + "{path:'/items',startIndex:1,length:2}" + "\">",
        "<In src=\"{src}\"/>",
        "</template:repeat>",
        "</mvc:View>"
    ], {
        models: new JSONModel({
            items: [{
                    src: "A"
                }, {
                    src: "B"
                }, {
                    src: "C"
                }, {
                    src: "D"
                }]
        })
    }, [
        "<In src=\"B\"/>",
        "<In src=\"C\"/>"
    ]);
});
QUnit.test("template:repeat with named models", function (assert) {
    this.check(assert, [
        mvcView(),
        "<template:repeat list=\"{modelName>/items}\">",
        "<In src=\"{modelName>src}\"/>",
        "</template:repeat>",
        "</mvc:View>"
    ], {
        models: {
            modelName: new JSONModel({
                items: [{
                        src: "A"
                    }, {
                        src: "B"
                    }, {
                        src: "C"
                    }]
            })
        }
    }, [
        "<In src=\"A\"/>",
        "<In src=\"B\"/>",
        "<In src=\"C\"/>"
    ]);
});
QUnit.test("template:repeat w/o list", function (assert) {
    this.checkError(assert, [
        mvcView(),
        "<template:repeat/>",
        "</mvc:View>"
    ], "Missing binding for {0}");
});
QUnit.test("template:repeat list=\"no binding\"", function (assert) {
    this.checkError(assert, [
        mvcView(),
        "<template:repeat list=\"no binding\"/>",
        "</mvc:View>"
    ], "Missing binding for {0}");
});
QUnit.test("template:repeat list=\"{unknown>foo}\"", function (assert) {
    this.checkError(assert, [
        mvcView(),
        "<template:repeat list=\"{unknown>foo}\"/>",
        "</mvc:View>"
    ], "Missing model 'unknown' in {0}");
});
QUnit.test("template:repeat list=\"{/unsupported/path}\"", function (assert) {
    this.check(assert, [
        mvcView(),
        "<template:repeat list=\"{/unsupported/path}\"/>",
        "</mvc:View>"
    ], {
        models: new JSONModel()
    });
});
QUnit.test("template:repeat w/ complex binding and model", function (assert) {
    this.check(assert, [
        mvcView(),
        "<template:repeat list=\"{foo: 'bar', path:'modelName>/items'}\">",
        "<In src=\"{modelName>src}\"/>",
        "</template:repeat>",
        "</mvc:View>"
    ], {
        models: {
            modelName: new JSONModel({
                items: [{
                        src: "A"
                    }, {
                        src: "B"
                    }, {
                        src: "C"
                    }]
            })
        }
    }, [
        "<In src=\"A\"/>",
        "<In src=\"B\"/>",
        "<In src=\"C\"/>"
    ]);
});
QUnit.test("template:repeat nested", function (assert) {
    this.check(assert, [
        mvcView(),
        "<template:repeat list=\"{customer>/orders}\">",
        "<In src=\"{customer>id}\"/>",
        "<template:repeat list=\"{customer>items}\">",
        "<In src=\"{customer>no}\"/>",
        "</template:repeat>",
        "</template:repeat>",
        "</mvc:View>"
    ], {
        models: {
            customer: new JSONModel({
                orders: [{
                        id: "A",
                        items: [{
                                no: "A1"
                            }, {
                                no: "A2"
                            }]
                    }, {
                        id: "B",
                        items: [{
                                no: "B1"
                            }, {
                                no: "B2"
                            }]
                    }]
            })
        }
    }, [
        "<In src=\"A\"/>",
        "<In src=\"A1\"/>",
        "<In src=\"A2\"/>",
        "<In src=\"B\"/>",
        "<In src=\"B1\"/>",
        "<In src=\"B2\"/>"
    ]);
});
QUnit.test("template:repeat with loop variable", function (assert) {
    this.check(assert, [
        mvcView(),
        "<template:repeat list=\"{modelName>/items}\" var=\"item\">",
        "<In src=\"{item>src}\"/>",
        "</template:repeat>",
        "</mvc:View>"
    ], {
        models: {
            modelName: new JSONModel({
                items: [{
                        src: "A"
                    }, {
                        src: "B"
                    }, {
                        src: "C"
                    }]
            })
        }
    }, [
        "<In src=\"A\"/>",
        "<In src=\"B\"/>",
        "<In src=\"C\"/>"
    ]);
});
QUnit.test("template:repeat with missing loop variable", function (assert) {
    this.checkError(assert, [
        mvcView(),
        "<template:repeat var=\"\" list=\"{/unused}\"/>",
        "</mvc:View>"
    ], "Missing variable name for {0}");
});
[false, true].forEach(function (bAsync) {
    [false, true].forEach(function (bDebug) {
        QUnit.test("fragment support incl. template:require, async = " + bAsync + ", debug = " + bDebug, function (assert) {
            var sModuleName = "sap.ui.core.sample.ViewTemplate.scenario.Helper", sTextElement = "<Text xmlns=\"sap.ui.core\" xmlns:template=" + "\"http://schemas.sap.com/sapui5/extension/sap.ui.core.template/1\"" + " template:require=\"" + sModuleName + "\" text=\"" + "{formatter: 'foo.Helper.bar', path: '/flag'}" + "\"/>", sFragmentXml = xml(assert, [sTextElement]), aURNs = ["sap/ui/core/sample/ViewTemplate/scenario/Helper"];
            this.expectLoad(bAsync, "myFragment", sFragmentXml);
            this.expectRequire(bAsync, aURNs, function () {
                window.foo = {
                    Helper: {
                        bar: function (vValue) {
                            return "*" + vValue + "*";
                        }
                    }
                };
                return [window.foo.Helper];
            });
            this.expectLoad(bAsync, "yetAnotherFragment", xml(assert, ["<In xmlns=\"sap.ui.core\"/>"]));
            return this.checkTracing(assert, bDebug, [
                { m: "[ 0] Start processing qux" },
                { m: "[ 1] fragmentName = myFragment", d: 1 },
                { m: "[ 1] text = *true*", d: sTextElement },
                { m: "[ 1] Finished", d: "</Fragment>" },
                { m: "[ 1] fragmentName = yetAnotherFragment", d: 4 },
                { m: "[ 1] Finished", d: "</Fragment>" },
                { m: "[ 0] Finished processing qux" }
            ], [
                mvcView(),
                "<Fragment fragmentName=\"myFragment\" type=\"XML\">",
                "<template:error />",
                "</Fragment>",
                "<Fragment fragmentName=\"yetAnotherFragment\" type=\"XML\"/>",
                "</mvc:View>"
            ], {
                models: new JSONModel({ flag: true })
            }, [
                "<Text template:require=\"" + sModuleName + "\" text=\"*true*\"/>",
                "<In/>"
            ], bAsync);
        });
        QUnit.test("fragment with FragmentDefinition incl. template:require, async = " + bAsync + ", debug = " + bDebug, function (assert) {
            var aModuleNames = [
                "foo.Helper",
                "sap.ui.core.sample.ViewTemplate.scenario.Helper",
                "sap.ui.model.odata.AnnotationHelper"
            ], aFragmentContent = [
                "<FragmentDefinition xmlns=\"sap.ui.core\" xmlns:template=" + "\"http://schemas.sap.com/sapui5/extension/sap.ui.core.template/1\"" + " template:require=\"" + aModuleNames.join(" ") + "\">",
                "<Text id=\"first\" text=\"" + "{formatter: 'foo.Helper.bar', path: '/flag'}" + "\"/>",
                "<Fragment fragmentName=\"innerFragment\" type=\"XML\"/>",
                "<In id=\"last\"/>",
                "</FragmentDefinition>"
            ], aURNs = [
                "foo/Helper",
                "sap/ui/core/sample/ViewTemplate/scenario/Helper",
                "sap/ui/model/odata/AnnotationHelper"
            ];
            this.expectLoad(bAsync, "myFragment", xml(assert, aFragmentContent));
            this.expectRequire(bAsync, aURNs, function () {
                window.foo = {
                    Helper: {
                        bar: function (vValue) {
                            return "*" + vValue + "*";
                        }
                    }
                };
                return [window.foo.Helper, {}, {}];
            });
            this.expectLoad(bAsync, "innerFragment", xml(assert, ["<In xmlns=\"sap.ui.core\" id=\"inner\"/>"]));
            this.expectLoad(bAsync, "yetAnotherFragment", xml(assert, ["<In xmlns=\"sap.ui.core\" id=\"yetAnother\"/>"]));
            return this.checkTracing(assert, bDebug, [
                { m: "[ 0] Start processing qux" },
                { m: "[ 1] fragmentName = myFragment", d: 1 },
                { m: "[ 1] text = *true*", d: aFragmentContent[1] },
                { m: "[ 2] fragmentName = innerFragment", d: aFragmentContent[2] },
                { m: "[ 2] Finished", d: "</Fragment>" },
                { m: "[ 1] Finished", d: "</Fragment>" },
                { m: "[ 1] fragmentName = yetAnotherFragment", d: 2 },
                { m: "[ 1] Finished", d: "</Fragment>" },
                { m: "[ 0] Finished processing qux" }
            ], [
                mvcView(),
                "<Fragment fragmentName=\"myFragment\" type=\"XML\"/>",
                "<Fragment fragmentName=\"yetAnotherFragment\" type=\"XML\"/>",
                "</mvc:View>"
            ], {
                models: new JSONModel({ flag: true })
            }, [
                "<Text id=\"first\" text=\"*true*\"/>",
                "<In id=\"inner\"/>",
                "<In id=\"last\"/>",
                "<In id=\"yetAnother\"/>"
            ], bAsync);
        });
    });
});
QUnit.test("dynamic fragment names", function (assert) {
    this.expectLoad(false, "dynamicFragmentName", xml(assert, ["<In xmlns=\"sap.ui.core\"/>"]));
    this.check(assert, [
        mvcView(),
        "<Fragment fragmentName=\"{= 'dynamicFragmentName' }\" type=\"XML\"/>",
        "</mvc:View>"
    ], {}, [
        "<In />"
    ]);
});
QUnit.test("async dynamic fragment names", function (assert) {
    this.expectLoad(true, "world", xml(assert, ["<In xmlns=\"sap.ui.core\"/>"]));
    return this.checkTracing(assert, true, [
        { m: "[ 0] Start processing qux" },
        { m: "[ 1] fragmentName = world", d: 1 },
        { m: "[ 1] Finished", d: "</Fragment>" },
        { m: "[ 0] Finished processing qux" }
    ], [
        mvcView(),
        "<Fragment fragmentName=\"{async>/hello}\" type=\"XML\"/>",
        "</mvc:View>"
    ], {
        models: {
            async: asyncModel({
                hello: "world"
            })
        }
    }, [
        "<In />"
    ], true);
});
QUnit.test("fragment in repeat", function (assert) {
    this.expectLoad(false, "myFragment", xml(assert, ["<In xmlns=\"sap.ui.core\" src=\"{src}\" />"]));
    this.check(assert, [
        mvcView(),
        "<template:repeat list=\"{/items}\">",
        "<Fragment fragmentName=\"myFragment\" type=\"XML\"/>",
        "</template:repeat>",
        "</mvc:View>"
    ], {
        models: new JSONModel({
            items: [{
                    src: "A"
                }, {
                    src: "B"
                }, {
                    src: "C"
                }]
        })
    }, [
        "<In src=\"A\"/>",
        "<In src=\"B\"/>",
        "<In src=\"C\"/>"
    ]);
});
QUnit.test("fragment with type != XML", function (assert) {
    this.check(assert, [
        mvcView(),
        "<Fragment fragmentName=\"nonXMLFragment\" type=\"JS\"/>",
        "</mvc:View>"
    ], {}, [
        "<Fragment fragmentName=\"nonXMLFragment\" type=\"JS\"/>"
    ]);
});
QUnit.test("error on fragment with simple cyclic reference", function (assert) {
    this.expectLoad(false, "cycle", xml(assert, ["<Fragment xmlns=\"sap.ui.core\" fragmentName=\"cycle\" type=\"XML\"/>"]));
    this.checkError(assert, [
        mvcView(),
        "<Fragment fragmentName=\"cycle\" type=\"XML\"/>",
        "</mvc:View>"
    ], "Cyclic reference to fragment 'cycle' {0}");
});
QUnit.test("error on fragment with ping pong cyclic reference", function (assert) {
    var aFragmentContent = [
        "<FragmentDefinition xmlns=\"sap.ui.core\" xmlns:template" + "=\"http://schemas.sap.com/sapui5/extension/sap.ui.core.template/1\">",
        "<template:with path=\"/foo\" var=\"bar\">",
        "<template:with path=\"/bar\" var=\"foo\">",
        "<Fragment xmlns=\"sap.ui.core\" fragmentName=\"B\" type=\"XML\"/>",
        "</template:with>",
        "</template:with>",
        "</FragmentDefinition>"
    ];
    warn(this.oLogMock, "[ 6] Set unchanged path: /foo", aFragmentContent[1]);
    warn(this.oLogMock, "[ 7] Set unchanged path: /bar", aFragmentContent[2]);
    this.expectLoad(false, "A", xml(assert, aFragmentContent));
    this.expectLoad(false, "B", xml(assert, ["<Fragment xmlns=\"sap.ui.core\" fragmentName=\"A\" type=\"XML\"/>"]));
    this.checkError(assert, [
        mvcView(),
        "<Fragment fragmentName=\"A\" type=\"XML\"/>",
        "</mvc:View>"
    ], "Cyclic reference to fragment 'B' {0}", {
        models: new JSONModel()
    }, aFragmentContent[3]);
});
[false, true].forEach(function (bDebug) {
    QUnit.test("tracing, debug=" + bDebug, function (assert) {
        var oBarModel = new JSONModel({
            "com.sap.vocabularies.UI.v1.HeaderInfo": {
                "Title": {
                    "Label": {
                        "String": "Customer"
                    },
                    "Value": {
                        "Path": "CustomerName"
                    }
                }
            },
            "com.sap.vocabularies.UI.v1.Identification": [{
                    Value: { Path: "A" }
                }, {
                    Value: { Path: "B" }
                }, {
                    Value: { Path: "C" }
                }]
        }), oBazModel = new JSONModel({}), aViewContent = [
            mvcView("t"),
            "<t:with path=\"bar>Label\" var=\"foo\">",
            "<t:if test=\"false\">",
            "<t:then>",
            "<Out />",
            "</t:then>",
            "<t:elseif test=\"{bar>Label}\">",
            "<In />",
            "<Fragment fragmentName=\"myFragment\" type=\"XML\"/>",
            "</t:elseif>",
            "</t:if>",
            "</t:with>",
            "<t:repeat list=\"{bar>/com.sap.vocabularies.UI.v1.Identification}\" var=\"foo\">",
            "<In src=\"{foo>Value/Path}\"/>",
            "</t:repeat>",
            "<t:if test=\"{bar>/com.sap.vocabularies.UI.v1.Identification}\"/>",
            "<t:if test=\"{bar>/qux}\"/>",
            "<ExtensionPoint name=\"staticName\"/>",
            "<ExtensionPoint name=\"{:= 'dynamicName' }\"/>",
            "<ExtensionPoint name=\"{foo>/some/path}\"/>",
            "</mvc:View>"
        ];
        if (!bDebug) {
            warn(this.oLogMock, "Warning(s) during processing of qux", null);
        }
        warn(this.oLogMock, "[ 0] Binding not ready", aViewContent[19]);
        this.expectLoad(false, "myFragment", xml(assert, [
            "<FragmentDefinition xmlns=\"sap.ui.core\">",
            "<In src=\"fragment\"/>",
            "</FragmentDefinition>"
        ]));
        this.checkTracing(assert, bDebug, [
            { m: "[ 0] Start processing qux" },
            { m: "[ 0] bar = /com.sap.vocabularies.UI.v1.HeaderInfo/Title" },
            { m: "[ 0] baz = /" },
            { m: "[ 1] foo = /com.sap.vocabularies.UI.v1.HeaderInfo/Title/Label", d: 1 },
            { m: "[ 2] test == \"false\" --> false", d: 2 },
            { m: "[ 2] test == [object Object] --> true", d: 6 },
            { m: "[ 3] fragmentName = myFragment", d: 8 },
            { m: "[ 3] Finished", d: "</Fragment>" },
            { m: "[ 2] Finished", d: 10 },
            { m: "[ 1] Finished", d: 11 },
            { m: "[ 1] Starting", d: 12 },
            { m: "[ 1] foo = /com.sap.vocabularies.UI.v1.Identification/0", d: 12 },
            { m: "[ 1] src = A", d: 13 },
            { m: "[ 1] foo = /com.sap.vocabularies.UI.v1.Identification/1", d: 12 },
            { m: "[ 1] src = B", d: 13 },
            { m: "[ 1] foo = /com.sap.vocabularies.UI.v1.Identification/2", d: 12 },
            { m: "[ 1] src = C", d: 13 },
            { m: "[ 1] Finished", d: 14 },
            { m: "[ 1] test == [object Array] --> true", d: 15 },
            { m: "[ 1] Finished", d: "</t:if>" },
            { m: "[ 1] test == undefined --> false", d: 16 },
            { m: "[ 1] Finished", d: "</t:if>" },
            { m: "[ 0] name = dynamicName", d: 18 },
            { m: "[ 0] Binding not ready for attribute name", d: 19 },
            { m: "[ 0] Finished processing qux" }
        ], aViewContent, {
            models: { bar: oBarModel, baz: oBazModel },
            bindingContexts: {
                bar: oBarModel.createBindingContext("/com.sap.vocabularies.UI.v1.HeaderInfo/Title"),
                baz: oBazModel.createBindingContext("/")
            }
        }, [
            "<In />",
            "<In src=\"fragment\"/>",
            "<In src=\"A\"/>",
            "<In src=\"B\"/>",
            "<In src=\"C\"/>",
            "<ExtensionPoint name=\"staticName\"/>",
            "<ExtensionPoint name=\"{:= 'dynamicName' }\"/>",
            "<ExtensionPoint name=\"{foo&gt;/some/path}\"/>"
        ]);
    });
});
[
    undefined,
    { className: "sap.ui.core.Fragment", type: "JSON" },
    { className: "sap.ui.core.mvc.View", type: "XML" }
].forEach(function (oViewExtension, i) {
    QUnit.test("<ExtensionPoint>: no (supported) configuration, " + i, function (assert) {
        this.mock(Component).expects("getCustomizing").withExactArgs("this._sOwnerId", {
            extensionName: "myExtensionPoint",
            name: "this.sViewName",
            type: "sap.ui.viewExtensions"
        }).returns(oViewExtension);
        this.check(assert, [
            mvcView(),
            "<ExtensionPoint name=\"myExtensionPoint\">",
            "<template:if test=\"true\">",
            "<In />",
            "</template:if>",
            "</ExtensionPoint>",
            "</mvc:View>"
        ], {}, [
            "<ExtensionPoint name=\"myExtensionPoint\">",
            "<In />",
            "</ExtensionPoint>"
        ]);
    });
});
["outerExtensionPoint", "{:= 'outerExtensionPoint' }"].forEach(function (sName) {
    QUnit.test("<ExtensionPoint name='" + sName + "'>: XML fragment configured", function (assert) {
        var oComponentMock = this.mock(Component), aOuterReplacement = [
            "<template:if test=\"true\" xmlns=\"sap.ui.core\" xmlns:template=" + "\"http://schemas.sap.com/sapui5/extension/sap.ui.core.template/1\"" + " template:require=\"foo.Helper bar.Helper\">",
            "<ExtensionPoint name=\"outerReplacement\"/>",
            "</template:if>"
        ];
        oComponentMock.expects("getCustomizing").withExactArgs("this._sOwnerId", {
            extensionName: "outerExtensionPoint",
            name: "this.sViewName",
            type: "sap.ui.viewExtensions"
        }).returns({
            className: "sap.ui.core.Fragment",
            fragmentName: "acme.OuterReplacement",
            type: "XML"
        });
        this.expectLoad(false, "acme.OuterReplacement", xml(assert, aOuterReplacement));
        warn(this.oLogMock, "[ 2] Constant test condition", aOuterReplacement[0]);
        this.expectRequire(false, ["foo/Helper", "bar/Helper"]);
        oComponentMock.expects("getCustomizing").withExactArgs("this._sOwnerId", {
            extensionName: "outerReplacement",
            name: "acme.OuterReplacement",
            type: "sap.ui.viewExtensions"
        });
        this.expectLoad(false, "myFragment", xml(assert, [
            "<ExtensionPoint name=\"innerExtensionPoint\" xmlns=\"sap.ui.core\"/>"
        ]));
        oComponentMock.expects("getCustomizing").withExactArgs("this._sOwnerId", {
            extensionName: "innerExtensionPoint",
            name: "myFragment",
            type: "sap.ui.viewExtensions"
        }).returns({
            className: "sap.ui.core.Fragment",
            fragmentName: "acme.InnerReplacement",
            type: "XML"
        });
        this.expectLoad(false, "acme.InnerReplacement", xml(assert, [
            "<ExtensionPoint name=\"innerReplacement\" xmlns=\"sap.ui.core\"/>"
        ]));
        oComponentMock.expects("getCustomizing").withExactArgs("this._sOwnerId", {
            extensionName: "innerReplacement",
            name: "acme.InnerReplacement",
            type: "sap.ui.viewExtensions"
        });
        oComponentMock.expects("getCustomizing").withExactArgs("this._sOwnerId", {
            extensionName: "lastExtensionPoint",
            name: "this.sViewName",
            type: "sap.ui.viewExtensions"
        });
        this.check(assert, [
            mvcView(),
            "<ExtensionPoint name=\"" + sName + "\">",
            "<template:error />",
            "</ExtensionPoint>",
            "<Fragment fragmentName=\"myFragment\" type=\"XML\"/>",
            "<ExtensionPoint name=\"lastExtensionPoint\"/>",
            "</mvc:View>"
        ], {}, [
            "<ExtensionPoint name=\"outerReplacement\"/>",
            "<ExtensionPoint name=\"innerReplacement\"/>",
            "<ExtensionPoint name=\"lastExtensionPoint\"/>"
        ]);
    });
});
QUnit.test("template:require - single module", function (assert) {
    var oRootElement = xml(assert, [
        mvcView().replace(">", " template:require=\"sap.ui.core.sample.ViewTemplate.scenario.Helper\">"),
        "</mvc:View>"
    ]);
    this.expectRequire(false, ["sap/ui/core/sample/ViewTemplate/scenario/Helper"]);
    process(oRootElement);
});
QUnit.test("template:require - multiple modules", function (assert) {
    var aModuleNames = [
        "foo.Helper",
        "sap.ui.core.sample.ViewTemplate.scenario.Helper",
        "sap.ui.model.odata.AnnotationHelper"
    ], oRootElement = xml(assert, [
        mvcView().replace(">", " template:require=\"" + aModuleNames.join(" ") + "\">"),
        "</mvc:View>"
    ]);
    this.expectRequire(false, [
        "foo/Helper",
        "sap/ui/core/sample/ViewTemplate/scenario/Helper",
        "sap/ui/model/odata/AnnotationHelper"
    ]);
    process(oRootElement);
});
QUnit.test("template:alias", function (assert) {
    window.foo = {
        Helper: {
            bar: function () {
                assert.ok(!this || !("bar" in this), "no jQuery.proxy(..., oScope) used");
                return "/bar";
            },
            checkScope: function () {
                assert.deepEqual(this.getBindingInfo("any").parameters, {
                    foo: "bar",
                    scope: {
                        "bar": window.foo.Helper.bar,
                        "foo": window.foo.Helper.bar
                    }
                }, "scope available in binding info");
            },
            foo: function () {
                assert.ok(!this || !("foo" in this), "no jQuery.proxy(..., oScope) used");
                return "/foo";
            }
        }
    };
    this.oObjectPathMock.expects("get").atLeast(1).withExactArgs(sinon.match.string.or(sinon.match.array)).callThrough();
    this.oObjectPathMock.expects("get").atLeast(1).withExactArgs(sinon.match.string.or(sinon.match.array), sinon.match.object).callThrough();
    this.mock(BindingParser).expects("complexParser").atLeast(1).withExactArgs(sinon.match.string, sinon.match.object, sinon.match.bool, true, true, true).callThrough();
    this.check(assert, [
        mvcView(),
        "<Label text=\"{formatter: '.bar', path: '/'}\"/>",
        "<Label text=\"{formatter: '.foo', path: '/'}\"/>",
        "<template:alias name=\".bar\" value=\"foo.Helper.bar\">",
        "<Text text=\"{formatter: '.bar', path: '/', parameters: {foo : 'bar'}}\"/>",
        "<Label text=\"{formatter: '.foo', path: '/'}\"/>",
        "<template:alias name=\".foo\" value=\"foo.Helper.foo\">",
        "<Text text=\"{formatter: '.foo', path: '/'}\"/>",
        "<template:alias name=\".foo\" value=\"foo.Helper.bar\">",
        "<Text text=\"{formatter: '.foo', path: '/'}\"/>",
        "<Label text=\"{formatter: 'foo.Helper.checkScope', path: '/'}\"/>",
        "</template:alias>",
        "<Text text=\"{formatter: '.foo', path: '/'}\"/>",
        "</template:alias>",
        "<template:repeat list=\"{path: '/', factory: '.bar'}\"/>",
        "<template:with path=\"/\" helper=\".bar\"/>",
        "</template:alias>",
        "<Label text=\"{formatter: '.bar', path: '/'}\"/>",
        "<Label text=\"{formatter: '.foo', path: '/'}\"/>",
        "<template:alias name=\".H\" value=\"foo.Helper\">",
        "<Text text=\"{formatter: '.H.foo', path: '/'}\"/>",
        "<template:alias name=\".bar\" value=\".H.bar\">",
        "<Text text=\"{formatter: '.bar', path: '/'}\"/>",
        "</template:alias>",
        "</template:alias>",
        "</mvc:View>"
    ], {
        models: new JSONModel({})
    }, [
        "<Label text=\"{formatter: '.bar', path: '/'}\"/>",
        "<Label text=\"{formatter: '.foo', path: '/'}\"/>",
        "<Text text=\"/bar\"/>",
        "<Label text=\"{formatter: '.foo', path: '/'}\"/>",
        "<Text text=\"/foo\"/>",
        "<Text text=\"/bar\"/>",
        "<Label text=\"{formatter: 'foo.Helper.checkScope', path: '/'}\"/>",
        "<Text text=\"/foo\"/>",
        "<Label text=\"{formatter: '.bar', path: '/'}\"/>",
        "<Label text=\"{formatter: '.foo', path: '/'}\"/>",
        "<Text text=\"/foo\"/>",
        "<Text text=\"/bar\"/>"
    ]);
});
[
    "<template:alias/>",
    "<template:alias name=\"\"/>",
    "<template:alias name=\".\"/>",
    "<template:alias name=\".foo.bar\"/>"
].forEach(function (sViewContent) {
    QUnit.test(sViewContent, function (assert) {
        this.checkError(assert, [
            mvcView(),
            sViewContent,
            "</mvc:View>"
        ], "Missing proper relative name in {0}");
    });
});
[
    "",
    "value=\"\"",
    "value=\".\"",
    "value=\".notFound\""
].forEach(function (sValue) {
    QUnit.test("<template:alias name=\".foo\" " + sValue + ">", function (assert) {
        this.checkError(assert, [
            mvcView(),
            "<template:alias name=\".foo\" " + sValue + "/>",
            "</mvc:View>"
        ], "Invalid value in {0}");
    });
});
QUnit.test("Test console log for two digit nesting level", function (assert) {
    this.check(assert, [
        mvcView(),
        "<template:if test=\"true\">",
        "<template:if test=\"true\">",
        "<template:if test=\"true\">",
        "<template:if test=\"true\">",
        "<template:if test=\"true\">",
        "<template:if test=\"true\">",
        "<template:if test=\"true\">",
        "<template:if test=\"true\">",
        "<template:if test=\"true\">",
        "<template:if test=\"true\">",
        "<In id=\"true\"/>",
        "</template:if>",
        "</template:if>",
        "</template:if>",
        "</template:if>",
        "</template:if>",
        "</template:if>",
        "</template:if>",
        "</template:if>",
        "</template:if>",
        "</template:if>",
        "</mvc:View>"
    ]);
});
QUnit.test("Performance measurement points", function (assert) {
    var aContent = [
        mvcView(),
        "<Fragment fragmentName=\"myFragment\" type=\"XML\"/>",
        "<Text text=\"{CustomerName}\"/>",
        "</mvc:View>"
    ], oAverageSpy = this.spy(Measurement, "average"), oEndSpy = this.spy(Measurement, "end").withArgs("sap.ui.core.util.XMLPreprocessor.process"), oCountSpy = oAverageSpy.withArgs("sap.ui.core.util.XMLPreprocessor.process", "", ["sap.ui.core.util.XMLPreprocessor"]), oCountEndSpy = oEndSpy.withArgs("sap.ui.core.util.XMLPreprocessor.process"), oInsertSpy = oAverageSpy.withArgs("sap.ui.core.util.XMLPreprocessor/insertFragment", "", ["sap.ui.core.util.XMLPreprocessor"]), oInsertEndSpy = oEndSpy.withArgs("sap.ui.core.util.XMLPreprocessor/insertFragment"), oResolvedSpy = oAverageSpy.withArgs("sap.ui.core.util.XMLPreprocessor/getResolvedBinding", "", ["sap.ui.core.util.XMLPreprocessor"]), oResolvedEndSpy = oEndSpy.withArgs("sap.ui.core.util.XMLPreprocessor/getResolvedBinding");
    this.expectLoad(false, "myFragment", xml(assert, ["<In xmlns=\"sap.ui.core\"/>"]));
    process(xml(assert, aContent));
    assert.strictEqual(oCountSpy.callCount, 1, "process");
    assert.strictEqual(oInsertSpy.callCount, 1, "insertFragment");
    assert.strictEqual(oResolvedSpy.callCount, 6, "getResolvedBinding");
    assert.strictEqual(oCountEndSpy.callCount, 1, "process end");
    assert.strictEqual(oInsertEndSpy.callCount, 1, "insertFragment end");
    assert.strictEqual(oResolvedEndSpy.callCount, 6, "getResolvedBinding end");
});
QUnit.test("Performance measurement end point for incomplete bindings", function (assert) {
    var aContent = [
        mvcView(),
        "<Text text=\"{unrelated>/some/path}\"/>",
        "</mvc:View>"
    ], oAverageSpy = this.spy(Measurement, "average"), oEndSpy = this.spy(Measurement, "end").withArgs("sap.ui.core.util.XMLPreprocessor.process"), oResolvedSpy = oAverageSpy.withArgs("sap.ui.core.util.XMLPreprocessor/getResolvedBinding", "", ["sap.ui.core.util.XMLPreprocessor"]), oResolvedEndSpy = oEndSpy.withArgs("sap.ui.core.util.XMLPreprocessor/getResolvedBinding");
    process(xml(assert, aContent));
    assert.strictEqual(oResolvedSpy.callCount, 4, "getResolvedBinding");
    assert.strictEqual(oResolvedEndSpy.callCount, 4, "getResolvedBinding end");
});
QUnit.test("plugIn returns old visitor", function (assert) {
    var fnElementVisitor = function element() { }, fnNamespaceVisitor = function namespace() { };
    try {
        assert.strictEqual(XMLPreprocessor.plugIn(fnNamespaceVisitor, "foo"), XMLPreprocessor.visitNodeWrapper);
    }
    finally {
        assert.strictEqual(XMLPreprocessor.plugIn(null, "foo"), fnNamespaceVisitor);
    }
    try {
        assert.strictEqual(XMLPreprocessor.plugIn(fnElementVisitor, "foo", "Bar"), XMLPreprocessor.visitNodeWrapper);
    }
    finally {
        assert.strictEqual(XMLPreprocessor.plugIn(null, "foo", "Bar"), fnElementVisitor);
    }
    try {
        assert.strictEqual(XMLPreprocessor.plugIn(fnNamespaceVisitor, "foo"), XMLPreprocessor.visitNodeWrapper);
        assert.strictEqual(XMLPreprocessor.plugIn(fnElementVisitor, "foo", "Bar"), fnNamespaceVisitor);
    }
    finally {
        assert.strictEqual(XMLPreprocessor.plugIn(null, "foo", "Bar"), fnElementVisitor);
        assert.strictEqual(XMLPreprocessor.plugIn(null, "foo"), fnNamespaceVisitor);
    }
});
QUnit.test("plugIn, debug tracing", function (assert) {
    var fnVisitor = function () { };
    this.oLogMock.expects("debug").withExactArgs("Plug-in visitor for namespace 'foo', local name 'Bar'", fnVisitor, sComponent);
    XMLPreprocessor.plugIn(fnVisitor, "foo", "Bar");
});
[{
        aContent: [
            mvcView(),
            "<f:Bar xmlns:f=\"foo\"" + " attribute=\"{path: '/', formatter: 'foo.Helper.forbidden'}\"/>",
            "<f:Baz xmlns:f=\"foo\"/>",
            "</mvc:View>"
        ],
        sLocalName: "Bar"
    }, {
        aContent: [
            mvcView(),
            "<f:Bar xmlns:f=\"foo\"/>",
            "</mvc:View>"
        ],
        sLocalName: undefined
    }].forEach(function (oFixture) {
    QUnit.test("plugIn, sLocalName: " + oFixture.sLocalName, function (assert) {
        var fnVisitor = this.stub().returns(SyncPromise.resolve()), oXml = xml(assert, oFixture.aContent);
        window.foo = {
            Helper: {
                forbidden: function (oRawValue) {
                    assert.ok(false, "formatter MUST not be called!");
                }
            }
        };
        try {
            XMLPreprocessor.plugIn(fnVisitor, "foo", oFixture.sLocalName);
            XMLPreprocessor.plugIn(fnVisitor, "foo", "Invalid");
            process(oXml, { models: new JSONModel() });
        }
        finally {
            XMLPreprocessor.plugIn(null, "foo", oFixture.sLocalName);
            XMLPreprocessor.plugIn(null, "foo", "Invalid");
        }
        assert.strictEqual(fnVisitor.callCount, 1);
        assert.ok(fnVisitor.alwaysCalledWithExactly(oXml.firstChild, {
            find: sinon.match.func,
            getContext: sinon.match.func,
            getResult: sinon.match.func,
            getSettings: sinon.match.func,
            getViewInfo: sinon.match.func,
            insertFragment: sinon.match.func,
            visitAttribute: sinon.match.func,
            visitAttributes: sinon.match.func,
            visitChildNodes: sinon.match.func,
            visitNode: sinon.match.func,
            "with": sinon.match.func
        }), fnVisitor.printf("%C"));
    });
});
[undefined, "0", true, {}, XMLPreprocessor.visitNodeWrapper].forEach(function (fnVisitor) {
    QUnit.test("plugIn, fnVisitor: " + fnVisitor, function (assert) {
        this.oLogMock.expects("debug").never();
        assert.throws(function () {
            XMLPreprocessor.plugIn(fnVisitor, "foo");
        }, new Error("Invalid visitor: " + fnVisitor));
    });
});
[
    undefined,
    "foo bar",
    "sap.ui.core",
    "http://schemas.sap.com/sapui5/extension/sap.ui.core.template/1"
].forEach(function (sNamespace) {
    QUnit.test("plugIn, sNamespace: " + sNamespace, function (assert) {
        this.oLogMock.expects("debug").never();
        assert.throws(function () {
            XMLPreprocessor.plugIn(function () { }, sNamespace);
        }, new Error("Invalid namespace: " + sNamespace));
    });
});
[false, true].forEach(function (bDebug) {
    QUnit.test("plugIn, debug tracing for visitor calls = " + bDebug, function (assert) {
        var aExpectedMessages = [
            { m: "[ 0] Start processing qux" },
            { m: "[ 1] Calling visitor", d: 1 },
            { m: "I am your visitor!" },
            { m: "[ 1] Finished", d: "</f:Bar>" },
            { m: "[ 0] Finished processing qux" }
        ], aViewContent = [
            mvcView(),
            "<f:Bar xmlns:f=\"foo\"/>",
            "</mvc:View>"
        ];
        XMLPreprocessor.plugIn(function () {
            if (bDebug) {
                Log.debug("I am your visitor!", undefined, sComponent);
            }
            return SyncPromise.resolve();
        }, "foo", "Bar");
        this.checkTracing(assert, bDebug, aExpectedMessages, aViewContent, {}, [aViewContent[1]]);
    });
});
QUnit.test("plugIn, getResult", function (assert) {
    var aViewContent = [
        mvcView(),
        "<f:Bar xmlns:f=\"foo\" test=\"{/answer}\" value=\"\\{\\}\"/>",
        "</mvc:View>"
    ], that = this;
    XMLPreprocessor.plugIn(function (oElement, oInterface) {
        var oPromise;
        assert.strictEqual(oInterface.getResult(oElement.getAttribute("test")).unwrap(), 42, "returns {any} value");
        assert.strictEqual(oInterface.getResult(oElement.getAttribute("value")).unwrap(), "{}", "bMandatory must be hardcoded to true");
        warn(that.oLogMock, "[ 1] Binding not ready", aViewContent[1]);
        assert.strictEqual(oInterface.getResult("{missing>/}", oElement), null);
        assert.strictEqual(oInterface.getResult("").unwrap(), "");
        oPromise = oInterface.getResult();
        assert.strictEqual(oPromise.isRejected(), true);
        oPromise.caught();
        return SyncPromise.resolve();
    }, "foo", "Bar");
    process(xml(assert, aViewContent), { models: new JSONModel({ answer: 42 }) });
});
QUnit.test("plugIn, async getResult", function (assert) {
    return this.checkTracing(assert, true, [
        { m: "[ 0] Start processing qux" },
        { m: "[ 1] Calling visitor", d: 1 },
        { m: "[ 1] tooltip = sync", d: "<f:Bar xmlns:f=\"foo\" test=\"world\" tooltip=\"{/sync}\"/>" },
        { m: "[ 1] Finished", d: "</f:Bar>" },
        { m: "[ 0] Finished processing qux" }
    ], [
        mvcView(),
        "<f:Bar xmlns:f=\"foo\" test=\"{/hello}\" tooltip=\"{/sync}\"/>",
        "</mvc:View>"
    ], {
        models: asyncModel({ hello: "world", sync: "sync" })
    }, [
        "<f:Bar xmlns:f=\"foo\" test=\"world\" tooltip=\"sync\"/>"
    ], true, function (oElement, oInterface) {
        return oInterface.getResult(oElement.getAttribute("test")).then(function (vValue) {
            oElement.setAttribute("test", vValue);
            return oInterface.visitAttributes(oElement);
        });
    });
});
QUnit.test("plugIn, getSettings, getViewInfo", function (assert) {
    var mSettings = {
        models: new JSONModel({ answer: 42 })
    }, aViewContent = [
        mvcView(),
        "<f:Bar xmlns:f=\"foo\" />",
        "</mvc:View>"
    ], oViewInfo = {
        caller: "qux",
        componentId: "this._sOwnerId",
        name: "this.sViewName",
        nestedObject: {
            foo: "bar"
        }
    };
    XMLPreprocessor.plugIn(function (oElement, oInterface) {
        var mMySettings = oInterface.getSettings(), oMyViewInfo = oInterface.getViewInfo();
        assert.deepEqual(mMySettings, mSettings);
        assert.deepEqual(oMyViewInfo, oViewInfo);
        oMyViewInfo.nestedObject.foo = "hacked";
        assert.strictEqual(oViewInfo.nestedObject.foo, "bar", "deep copy");
        return SyncPromise.resolve();
    }, "foo", "Bar");
    XMLPreprocessor.process(xml(assert, aViewContent), oViewInfo, mSettings);
});
[false, true].forEach(function (bAsync) {
    QUnit.test("plugIn, visitAttribute; async = " + bAsync, function (assert) {
        var oModel = bAsync ? asyncModel({ answer: 42 }) : new JSONModel({ answer: 42 });
        XMLPreprocessor.plugIn(function (oElement, oInterface) {
            var oChildNode = oElement.childNodes.item(0);
            return oInterface.visitAttribute(oChildNode, oChildNode.getAttributeNodeNS("", "text"));
        }, "foo", "Bar");
        return this.check(assert, [
            mvcView(),
            "<f:Bar xmlns:f=\"foo\">",
            "<In id=\"visitAttribute\" src=\"{/answer}\" text=\"{/answer}\"/>",
            "</f:Bar>",
            "</mvc:View>"
        ], { models: oModel }, [
            "<f:Bar xmlns:f=\"foo\">",
            "<In id=\"visitAttribute\" src=\"{/answer}\" text=\"42\"/>",
            "</f:Bar>"
        ], bAsync);
    });
});
[false, true].forEach(function (bAsync) {
    QUnit.test("plugIn, visitAttributes; async = " + bAsync, function (assert) {
        var oModel = bAsync ? asyncModel({ answer: 42 }) : new JSONModel({ answer: 42 });
        XMLPreprocessor.plugIn(function (oElement, oInterface) {
            return oInterface.visitAttributes(oElement.childNodes.item(0));
        }, "foo", "Bar");
        return this.check(assert, [
            mvcView(),
            "<f:Bar xmlns:f=\"foo\">",
            "<In id=\"visitAttributes: {/answer}\">",
            "<Out id=\"no visitAttributes: {/answer}\"/>",
            "</In>",
            "</f:Bar>",
            "</mvc:View>"
        ], { models: oModel }, [
            "<f:Bar xmlns:f=\"foo\">",
            "<In id=\"visitAttributes: 42\">",
            "<Out id=\"no visitAttributes: {/answer}\"/>",
            "</In>",
            "</f:Bar>"
        ], bAsync);
    });
});
[false, true].forEach(function (bAsync) {
    QUnit.test("plugIn, visitChildNodes; async = " + bAsync, function (assert) {
        var oModel = bAsync ? asyncModel({ answer: 42 }) : new JSONModel({ answer: 42 });
        XMLPreprocessor.plugIn(function (oElement, oInterface) {
            return oInterface.visitChildNodes(oElement.childNodes.item(0));
        }, "foo", "Bar");
        return this.check(assert, [
            mvcView(),
            "<f:Bar xmlns:f=\"foo\">",
            "<Out id=\"no visitChildNodes: {/answer}\">",
            "<In id=\"visitChildNodes: {/answer}\"/>",
            "</Out>",
            "</f:Bar>",
            "</mvc:View>"
        ], { models: oModel }, [
            "<f:Bar xmlns:f=\"foo\">",
            "<Out id=\"no visitChildNodes: {/answer}\">",
            "<In id=\"visitChildNodes: 42\"/>",
            "</Out>",
            "</f:Bar>"
        ], bAsync);
    });
});
[false, true].forEach(function (bAsync) {
    QUnit.test("plugIn, visitNode; async = " + bAsync, function (assert) {
        var oModel = bAsync ? asyncModel({ answer: 42, pi: 3.14 }) : new JSONModel({ answer: 42, pi: 3.14 });
        this.oLogMock.expects("error").withExactArgs("Unexpected tag <template:foo id=\"unexpected\"/>", "qux", sComponent);
        XMLPreprocessor.plugIn(function (oElement, oInterface) {
            oInterface.visitNode(oElement.childNodes.item(1)).then(function () {
                assert.ok(false);
            }, function () {
                assert.ok(true);
            });
            return oInterface.visitNode(oElement.childNodes.item(0));
        }, "foo", "Bar");
        return this.check(assert, [
            mvcView(),
            "<f:Bar xmlns:f=\"foo\">",
            "<In id=\"visitNode: {/answer}\">",
            "<In id=\"visitNode: {/pi}\"/>",
            "</In>",
            "<template:foo id=\"unexpected\"/>",
            "</f:Bar>",
            "</mvc:View>"
        ], { models: oModel }, [
            "<f:Bar xmlns:f=\"foo\">",
            "<In id=\"visitNode: 42\">",
            "<In id=\"visitNode: 3.14\"/>",
            "</In>",
            "<template:foo id=\"unexpected\"/>",
            "</f:Bar>"
        ], bAsync);
    });
});
[false, true].forEach(function (bAsync) {
    QUnit.test("plugIn, visitNodeWrapper; async = " + bAsync, function (assert) {
        var oModel = bAsync ? asyncModel({ answer: 42, pi: 3.14 }) : new JSONModel({ answer: 42, pi: 3.14 });
        XMLPreprocessor.plugIn(function (oElement, oInterface) {
            return XMLPreprocessor.visitNodeWrapper(oElement.childNodes.item(0), oInterface);
        }, "foo", "Bar");
        return this.check(assert, [
            mvcView(),
            "<f:Bar xmlns:f=\"foo\">",
            "<In id=\"visitNodeWrapper: {/answer}\">",
            "<In id=\"visitNodeWrapper: {/pi}\"/>",
            "</In>",
            "</f:Bar>",
            "</mvc:View>"
        ], { models: oModel }, [
            "<f:Bar xmlns:f=\"foo\">",
            "<In id=\"visitNodeWrapper: 42\">",
            "<In id=\"visitNodeWrapper: 3.14\"/>",
            "</In>",
            "</f:Bar>"
        ], bAsync);
    });
});
[false, true].forEach(function (bAsync) {
    QUnit.test("plugIn, insertFragment; async = " + bAsync, function (assert) {
        this.expectLoad(bAsync, "fragmentName", xml(assert, ["<In xmlns=\"sap.ui.core\"/>"]));
        XMLPreprocessor.plugIn(function (oElement, oInterface) {
            return oInterface.insertFragment("fragmentName", oElement);
        }, "foo", "Bar");
        return this.check(assert, [
            mvcView(),
            "<f:Bar xmlns:f=\"foo\"/>",
            "</mvc:View>"
        ], {}, [
            "<In />"
        ], bAsync);
    });
});
QUnit.test("plugIn, call returns something", function (assert) {
    var aViewContent = [
        mvcView(),
        "<f:Bar xmlns:f=\"foo\"/>",
        "</mvc:View>"
    ];
    XMLPreprocessor.plugIn(function (oElement, oInterface) {
        return SyncPromise.resolve(null);
    }, "foo", "Bar");
    this.checkError(assert, aViewContent, "Unexpected return value from visitor for {0}", null, 1);
});
QUnit.test("plugIn, getContext", function (assert) {
    var oModel = new JSONModel({
        hidden: {
            answer: 42
        }
    }), aViewContent = [
        mvcView(),
        "<f:Bar xmlns:f=\"foo\" path=\"meta>answer\"/>",
        "</mvc:View>"
    ];
    XMLPreprocessor.plugIn(function (oElement, oInterface) {
        var oContext = oInterface.getContext(oElement.getAttribute("path")), oDefaultContext = oInterface.getContext();
        assert.strictEqual(oContext.getModel(), oModel);
        assert.strictEqual(oContext.getPath(), "/hidden/answer");
        assert.strictEqual(oDefaultContext.getModel(), oModel);
        assert.strictEqual(oDefaultContext.getPath(), "/hidden/answer");
        assert.throws(function () {
            oInterface.getContext("{meta>answer}");
        }, new Error("Must be a simple path, not a binding: {meta>answer}"));
        assert.throws(function () {
            oInterface.getContext("foo>");
        }, new Error("Unknown model 'foo': foo>"));
        assert.throws(function () {
            oInterface.getContext("other>");
        }, new Error("Cannot resolve path: other>"));
        return SyncPromise.resolve();
    }, "foo", "Bar");
    process(xml(assert, aViewContent), {
        bindingContexts: {
            "undefined": oModel.createBindingContext("/hidden/answer"),
            meta: oModel.createBindingContext("/hidden")
        },
        models: {
            "undefined": oModel,
            meta: oModel,
            other: oModel
        }
    });
});
QUnit.test("plugIn, with", function (assert) {
    var oModel = new JSONModel({
        hidden: {
            answer: 42
        }
    }), aViewContent = [
        mvcView(),
        "<f:Bar xmlns:f=\"foo\" path=\"meta>answer\"/>",
        "</mvc:View>"
    ], that = this;
    XMLPreprocessor.plugIn(function (oElement, oInterface) {
        var oContext = oInterface.getContext(oElement.getAttribute("path")), oDerivedInterface = oInterface.with({ a: oContext, b: oContext }), oEmptyInterface = oInterface.with(null, true), oNewInterface = oInterface.with({ a: oContext, b: oContext }, true);
        assert.strictEqual(oDerivedInterface.getResult("{a>}").unwrap(), 42, "a is known");
        assert.strictEqual(oDerivedInterface.getResult("{b>}").unwrap(), 42, "b is known");
        assert.strictEqual(oDerivedInterface.getResult("{meta>answer}").unwrap(), 42, "meta is inherited");
        warn(that.oLogMock, "[ 1] Binding not ready");
        assert.strictEqual(oEmptyInterface.getResult("{meta>}"), null);
        assert.strictEqual(oNewInterface.getResult("{a>}").unwrap(), 42, "a is known");
        assert.strictEqual(oNewInterface.getResult("{b>}").unwrap(), 42, "b is known");
        warn(that.oLogMock, "[ 1] Binding not ready");
        assert.strictEqual(oNewInterface.getResult("{meta>}"), null);
        assert.strictEqual(oInterface.with(), oInterface, "no map");
        assert.strictEqual(oInterface.with({}), oInterface, "empty map");
        return SyncPromise.resolve();
    }, "foo", "Bar");
    process(xml(assert, aViewContent), {
        bindingContexts: {
            meta: oModel.createBindingContext("/hidden")
        },
        models: {
            meta: oModel
        }
    });
});
[function (assert, oElement, oInterface) {
        var aElements = ["test", "tooltip"];
        return oInterface.find(aElements, function (sAttribute, i, aElements0) {
            assert.strictEqual(i, sAttribute === "test" ? 0 : 1);
            assert.strictEqual(aElements0, aElements);
            return oInterface.visitAttribute(oElement, oElement.attributes.getNamedItem(sAttribute));
        }).then(function (vResult) {
            assert.strictEqual(vResult, undefined);
        });
    }, function (assert, oElement, oInterface) {
        var aElements = ["test", "tooltip", "unknown"];
        return oInterface.find(aElements, function (sAttribute, i, aElements0) {
            assert.strictEqual(i, sAttribute === "test" ? 0 : 1);
            assert.strictEqual(aElements0, aElements);
            return oInterface.visitAttribute(oElement, oElement.attributes.getNamedItem(sAttribute)).then(function () {
                return sAttribute === "tooltip";
            });
        }).then(function (vResult) {
            assert.strictEqual(vResult, "tooltip");
        });
    }, function (assert, oElement, oInterface) {
        var oSyncPromise;
        oSyncPromise = oInterface.find([]);
        assert.strictEqual(oSyncPromise.isFulfilled(), true);
        assert.strictEqual(oSyncPromise.getResult(), undefined);
        oSyncPromise = oInterface.find(["foo"], function (vElement) {
            throw new Error(vElement);
        });
        assert.strictEqual(oSyncPromise.isRejected(), true, "rejects instead of throwing");
        assert.strictEqual(oSyncPromise.getResult().message, "foo");
        oSyncPromise.caught();
        oSyncPromise = oInterface.find(["foo"], function () {
            return Promise.resolve();
        });
        assert.ok(oSyncPromise instanceof SyncPromise);
        assert.strictEqual(oSyncPromise.isPending(), true, "a pending sync promise");
        return oInterface.visitAttributes(oElement).then(function () {
            return oSyncPromise;
        });
    }].forEach(function (fnVisitor, i) {
    QUnit.test("plugIn, find:" + i, function (assert) {
        return this.checkTracing(assert, true, [
            { m: "[ 0] Start processing qux" },
            { m: "[ 1] Calling visitor", d: 1 },
            { m: "[ 1] test = world", d: 1 },
            { m: "[ 1] tooltip = sync", d: "<f:Bar xmlns:f=\"foo\" test=\"world\" tooltip=\"{/sync}\"/>" },
            { m: "[ 1] Finished", d: "</f:Bar>" },
            { m: "[ 0] Finished processing qux" }
        ], [
            mvcView(),
            "<f:Bar xmlns:f=\"foo\" test=\"{/hello}\" tooltip=\"{/sync}\"/>",
            "</mvc:View>"
        ], {
            models: asyncModel({ hello: "world", sync: "sync" })
        }, [
            "<f:Bar xmlns:f=\"foo\" test=\"world\" tooltip=\"sync\"/>"
        ], true, fnVisitor.bind(null, assert));
    });
});
QUnit.test("async fragment in template:alias/if/repeat/with", function (assert) {
    var aFragmentContent = ["<Text text=\"{formatter: '.bar', path: 'here>flag'}\"/>"], sFragmentXml = xml(assert, aFragmentContent), aViewContent = [
        mvcView(),
        "<template:alias name=\".bar\" value=\"foo.Helper.bar\">",
        "<template:with path=\"/some/random/path\" var=\"here\">",
        "<template:if test=\"true\">",
        "<template:repeat list=\"{/items}\">",
        "<Fragment fragmentName=\"{src}\" type=\"XML\"/>",
        "</template:repeat>",
        "</template:if>",
        "</template:with>",
        "</template:alias>",
        "<Text text=\"{here>flag}\"/>",
        "<Label text=\"{formatter: '.bar', path: '/'}\"/>",
        "</mvc:View>"
    ];
    window.foo = {
        Helper: {
            bar: function (vValue) {
                return "*" + vValue + "*";
            }
        }
    };
    this.expectLoad(true, "myFragmentA", sFragmentXml);
    this.expectLoad(true, "myFragmentB", sFragmentXml);
    this.expectLoad(true, "myFragmentC", sFragmentXml);
    return this.checkTracing(assert, true, [
        { m: "[ 0] Start processing qux" },
        { m: "[ 1] here = /some/random/path", d: 2 },
        { m: "[ 2] test == \"true\" --> true", d: 3 },
        { m: "[ 3] Starting", d: 4 },
        { m: "[ 3]  = /items/0", d: 4 },
        { m: "[ 4] fragmentName = myFragmentA", d: 5 },
        { m: "[ 4] text = *true*", d: aFragmentContent[0] },
        { m: "[ 4] Finished", d: "</Fragment>" },
        { m: "[ 3]  = /items/1", d: 4 },
        { m: "[ 4] fragmentName = myFragmentB", d: 5 },
        { m: "[ 4] text = *true*", d: aFragmentContent[0] },
        { m: "[ 4] Finished", d: "</Fragment>" },
        { m: "[ 3]  = /items/2", d: 4 },
        { m: "[ 4] fragmentName = myFragmentC", d: 5 },
        { m: "[ 4] text = *true*", d: aFragmentContent[0] },
        { m: "[ 4] Finished", d: "</Fragment>" },
        { m: "[ 3] Finished", d: "</template:repeat>" },
        { m: "[ 2] Finished", d: "</template:if>" },
        { m: "[ 1] Finished", d: "</template:with>" },
        { m: "[ 0] Binding not ready for attribute text", d: 10 },
        { m: "[ 0] Binding not ready for attribute text", d: 11 },
        { m: "[ 0] Finished processing qux" }
    ], aViewContent, {
        models: new JSONModel({
            items: [{
                    src: "myFragmentA"
                }, {
                    src: "myFragmentB"
                }, {
                    src: "myFragmentC"
                }],
            some: {
                random: {
                    path: {
                        flag: true
                    }
                }
            }
        })
    }, [
        "<Text text=\"*true*\"/>",
        "<Text text=\"*true*\"/>",
        "<Text text=\"*true*\"/>",
        aViewContent[10].replace(">", "&gt;"),
        aViewContent[11]
    ], true);
});
QUnit.test("async binding resolution", function (assert) {
    var aViewContent = [
        mvcView(),
        "<In id=\"{async>/foo}\" text=\"{async>/missing}\" tooltip=\"{async>/bar}\">",
        "<Text text=\"{async>/hello}\"/>",
        "</In>",
        "<Text text=\"{async>/fail}\"/>",
        "<Text text=\"{formatter: 'foo.Helper.star', path: 'async>/hello'}\"/>",
        "<Text text=\"{formatter: 'foo.Helper.star', path: 'async>/sync'}\"/>",
        "<Text text=\"{formatter: 'foo.Helper.join', parts: [{path: 'async>/hello'}, " + "{formatter: 'foo.Helper.path', path: 'async>/sync'}, " + "{formatter: 'foo.Helper.path', path: 'sync>/flag'}]}\"/>",
        "<Text text=\"{= 'hello, '" + " + ${formatter: 'foo.Helper.star', path: 'async>/hello'} }\"/>",
        "</mvc:View>"
    ];
    window.foo = {
        Helper: {
            join: function () {
                return Array.prototype.join.apply(arguments);
            },
            path: function (vValue) {
                return this.getPath() + "=" + vValue;
            },
            star: function (vValue) {
                return "*" + vValue + "*" + this.getMetadata().getName();
            }
        }
    };
    return this.checkTracing(assert, true, [
        { m: "[ 0] Start processing qux" },
        { m: "[ 0] id = 5", d: 1 },
        { m: "[ 0] Removed attribute text", d: "<In id=\"5\" text=\"{async>/missing}\" tooltip=\"{async>/bar}\">" },
        { m: "[ 0] tooltip = 0", d: "<In id=\"5\" tooltip=\"{async>/bar}\">" },
        { m: "[ 0] text = world", d: 2 },
        { m: "[ 0] Error in formatter of attribute text Error: Epic fail", d: 4 },
        { m: "[ 0] text = *world*sap.ui.core.util._with", d: 5 },
        { m: "[ 0] text = *sync*sap.ui.core.util._with", d: 6 },
        { m: "[ 0] text = world,/sync=sync,/flag=true", d: 7 },
        { m: "[ 0] text = hello, *world*sap.ui.model.json.JSONPropertyBinding", d: 8 },
        { m: "[ 0] Finished processing qux" }
    ], aViewContent, {
        models: {
            async: asyncModel({
                bar: 0,
                fail: new Error("Epic fail"),
                foo: 5,
                hello: "world",
                sync: "sync"
            }),
            sync: new JSONModel({ flag: true })
        }
    }, [
        "<In id=\"5\" tooltip=\"0\">",
        "<Text text=\"world\"/>",
        "</In>",
        "<Text text=\"{async&gt;/fail}\"/>",
        "<Text text=\"*world*sap.ui.core.util._with\"/>",
        "<Text text=\"*sync*sap.ui.core.util._with\"/>",
        "<Text text=\"world,/sync=sync,/flag=true\"/>",
        "<Text text=\"hello, *world*sap.ui.model.json.JSONPropertyBinding\"/>"
    ], true);
});
QUnit.test("model which forbids $$valueAsPromise", function (assert) {
    var oModel = new JSONModel({
        foo: "bar"
    });
    oModel.bindProperty = function (sPath, oContext, mParameters) {
        if (mParameters && "$$valueAsPromise" in mParameters) {
            throw new Error("Illegal parameter '$$valueAsPromise'");
        }
        return JSONModel.prototype.bindProperty.apply(this, arguments);
    };
    return this.checkTracing(assert, true, [
        { m: "[ 0] Start processing qux" },
        { m: "[ 0] text = bar", d: 1 },
        { m: "[ 0] Finished processing qux" }
    ], [
        mvcView(),
        "<Text text=\"{/foo}\"/>",
        "</mvc:View>"
    ], {
        models: oModel
    }, [
        "<Text text=\"bar\"/>"
    ], true);
});
QUnit.test("async <template:if>", function (assert) {
    return this.checkTracing(assert, true, [
        { m: "[ 0] Start processing qux" },
        { m: "[ 1] test == false --> false", d: 1 },
        { m: "[ 1] Finished", d: 3 },
        { m: "[ 0] Finished processing qux" }
    ], [
        mvcView(),
        "<template:if test=\"{= %{/hello} !== 'world' }\">",
        "<Out id=\"false\"/>",
        "</template:if>",
        "</mvc:View>"
    ], {
        models: asyncModel({ hello: "world" })
    }, undefined, true);
});
[false, true].forEach(function (bAllAvailable) {
    QUnit.test("async require on view level, all available: " + bAllAvailable, function (assert) {
        var oHelper = {
            bar: function (vValue) {
                return "*" + vValue + "*";
            }
        }, aViewContent = [
            mvcView().replace(">", " template:require=\"foo.Helper not.Used\">"),
            "<Text text=\"{formatter: 'foo.Helper.bar', path: '/flag'}\"/>",
            "</mvc:View>"
        ];
        this.expectRequire(true, ["foo/Helper", "not/Used"], function () {
            window.foo = {
                Helper: oHelper
            };
            return [oHelper, {}];
        }, bAllAvailable);
        return this.checkTracing(assert, true, [
            { m: "[ 0] Start processing qux" },
            { m: "[ 0] text = *true*", d: 1 },
            { m: "[ 0] Finished processing qux" }
        ], aViewContent, {
            models: new JSONModel({ flag: true })
        }, [
            "<Text text=\"*true*\"/>"
        ], true);
    });
});
QUnit.test("AMD require on view and fragment level", function (assert) {
    var aFragmentContent = [
        "<FragmentDefinition xmlns=\"sap.ui.core\" xmlns:template=" + "\"http://schemas.sap.com/sapui5/extension/sap.ui.core.template/1\"" + " template:require=\"{Helper : 'bar/Helper'}\">",
        "<Text text=\"{formatter: 'Helper.bar', path: '/flag'}\"/>",
        "</FragmentDefinition>"
    ], aViewContent = [
        mvcView("t").replace(">", " t:require=\"{Helper : 'foo/Helper'}\">"),
        "<t:alias name=\"bar\" value=\"Helper.bar\">",
        "<Fragment fragmentName=\"myFragment\" type=\"XML\"/>",
        "<Text text=\"{formatter: 'bar', path: '/flag'}\"/>",
        "</t:alias>",
        "</mvc:View>"
    ];
    this.expectRequire(true, ["foo/Helper"], function () {
        var oHelper = {
            bar: function (vValue) {
                return "*" + vValue + "*";
            }
        };
        return [oHelper];
    });
    this.expectLoad(true, "myFragment", xml(assert, aFragmentContent));
    this.expectRequire(true, ["bar/Helper"], function () {
        var oHelper = {
            bar: function (vValue) {
                return "%" + vValue + "%";
            }
        };
        return [oHelper];
    });
    return this.checkTracing(assert, true, [
        { m: "[ 0] Start processing qux" },
        { m: "[ 1] fragmentName = myFragment", d: 2 },
        { m: "[ 1] text = %true%", d: aFragmentContent[1] },
        { m: "[ 1] Finished", d: "</Fragment>" },
        { m: "[ 0] text = *true*", d: 3 },
        { m: "[ 0] Finished processing qux" }
    ], aViewContent, {
        models: new JSONModel({ flag: true })
    }, [
        "<Text text=\"%true%\"/>",
        "<Text text=\"*true*\"/>"
    ], true);
});
QUnit.test("empty template:require", function (assert) {
    return this.checkTracing(assert, true, [
        { m: "[ 0] Start processing qux" },
        { m: "[ 0] Finished processing qux" }
    ], [
        mvcView().replace(">", " template:require=\"\">"),
        "</mvc:View>"
    ], {}, [], true);
});
QUnit.test("async extension point", function (assert) {
    var aReplacement = [
        "<Text text=\"{/foo}\"/>"
    ], aViewContent = [
        mvcView(),
        "<ExtensionPoint name=\"{/hello}\"/>",
        "<Text text=\"{/flag}\"/>",
        "</mvc:View>"
    ];
    this.mock(Component).expects("getCustomizing").withExactArgs("this._sOwnerId", {
        extensionName: "world",
        name: "this.sViewName",
        type: "sap.ui.viewExtensions"
    }).returns({
        className: "sap.ui.core.Fragment",
        fragmentName: "acme.Replacement",
        type: "XML"
    });
    this.expectLoad(true, "acme.Replacement", xml(assert, aReplacement));
    return this.checkTracing(assert, true, [
        { m: "[ 0] Start processing qux" },
        { m: "[ 0] name = world", d: 1 },
        { m: "[ 1] fragmentName = acme.Replacement", d: 1 },
        { m: "[ 1] text = bar", d: aReplacement[0] },
        { m: "[ 1] Finished", d: "</ExtensionPoint>" },
        { m: "[ 0] text = true", d: 2 },
        { m: "[ 0] Finished processing qux" }
    ], aViewContent, {
        models: asyncModel({ flag: true, foo: "bar", hello: "world" })
    }, [
        "<Text text=\"bar\"/>",
        "<Text text=\"true\"/>"
    ], true);
});
QUnit.test("async template:repeat", function (assert) {
    return this.checkTracing(assert, true, [
        { m: "[ 0] Start processing qux" },
        { m: "[ 1] Starting", d: 1 },
        { m: "[ 1]  = /items/0", d: 1 },
        { m: "[ 1] src = A", d: 2 },
        { m: "[ 1]  = /items/1", d: 1 },
        { m: "[ 1] src = B", d: 2 },
        { m: "[ 1]  = /items/2", d: 1 },
        { m: "[ 1] src = C", d: 2 },
        { m: "[ 1] Finished", d: "</template:repeat>" },
        { m: "[ 0] Finished processing qux" }
    ], [
        mvcView(),
        "<template:repeat list=\"{/items}\">",
        "<In src=\"{src}\"/>",
        "</template:repeat>",
        "</mvc:View>"
    ], {
        models: asyncModel({
            items: [{
                    src: "A"
                }, {
                    src: "B"
                }, {
                    src: "C"
                }]
        })
    }, [
        "<In src=\"A\"/>",
        "<In src=\"B\"/>",
        "<In src=\"C\"/>"
    ], true);
});
QUnit.test("async template:repeat in sync view", function (assert) {
    return this.check(assert, [
        mvcView(),
        "<template:repeat list=\"{/items}\">",
        "<In src=\"{src}\"/>",
        "</template:repeat>",
        "</mvc:View>"
    ], {
        models: asyncModel({
            items: [{
                    src: "A"
                }, {
                    src: "B"
                }, {
                    src: "C"
                }]
        })
    }, []);
});
QUnit.test("async formatter in sync view", function (assert) {
    window.foo = function () {
        return Promise.resolve();
    };
    this.checkError(assert, [
        mvcView(),
        "<Text text=\"{path: '/', formatter: 'foo'}\" tooltip=\"{/bar}\"/>",
        "</mvc:View>"
    ], "Async formatter in sync view in {path: '/', formatter: 'foo'} of {0}", {
        models: new JSONModel()
    });
});