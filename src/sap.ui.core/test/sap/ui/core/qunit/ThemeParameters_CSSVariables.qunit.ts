import Parameters from "sap/ui/core/theming/Parameters";
import Icon from "sap/ui/core/Icon";
import Bar from "sap/m/Bar";
var sBaseUri = new URI(sap.ui.require.toUrl("testdata/core"), document.baseURI).toString();
QUnit.module("CSS Variables - ASYNC");
QUnit.test("Single and multi parameter access", function (assert) {
    return sap.ui.getCore().loadLibrary("testlibs.themeParameters.lib1variables", { async: true }).then(function () {
        var pParameterListCheck = new Promise(function (resolve) {
            var mParamsInitially = Parameters.get({
                name: [
                    "sap.ui.totallyOptional.prefix:lib1_sample-variable",
                    "lib1_sample-variable",
                    "randomPrefix:lib1_with.dot:andcolon",
                    "lib1_andcolon",
                    "lib1_foo",
                    "lib1_paramWithRelativeUrlQuoted",
                    "lib1_paramWithRelativeUrlAutoEscaped",
                    "lib1_paramWithAbsoluteUrlQuoted",
                    "lib1_paramWithAbsoluteUrlAutoEscaped"
                ],
                callback: function (mValues) {
                    assert.equal(Object.keys(mValues).length, 9, "Correct number of parameters returned");
                    assert.equal(mValues["sap.ui.totallyOptional.prefix:lib1_sample-variable"], "16px", "CSS Variable can be retrieved");
                    assert.equal(mValues["lib1_sample-variable"], "16px", "CSS Variable value can be retrieved");
                    assert.equal(mValues["randomPrefix:lib1_with.dot:andcolon"], "24px", "CSS Variable value can be retrieved");
                    assert.equal(mValues["lib1_andcolon"], "14px", "CSS Variable value can be retrieved");
                    assert.equal(mValues["lib1_foo"], "1rem", "CSS Variable value can be retrieved");
                    assert.equal(mValues["lib1_paramWithRelativeUrlQuoted"], "url(\"" + sBaseUri + "/testdata/libraries/themeParameters/lib1variables/themes/sap_hcb/img/icons/relative_quoted.png\")", "[relative URL] quoted: CSS Variable containg a URL can be retrieved and is correctly resolved");
                    assert.equal(mValues["lib1_paramWithRelativeUrlAutoEscaped"], "url(\"" + sBaseUri + "/testdata/libraries/themeParameters/lib1variables/themes/sap_hcb/img/icons/relative_auto-escaped.png\")", "[relative URL] auto-escaped: CSS Variable containg a URL can be retrieved and is correctly resolved");
                    assert.equal(mValues["lib1_paramWithAbsoluteUrlQuoted"], "url(\"http://somewhere.foo/img/icons/absolute_quoted.png\")", "[absolute URL] quoted: CSS Variable with absolute URL is untouched.");
                    assert.equal(mValues["lib1_paramWithAbsoluteUrlAutoEscaped"], "url(\"http://somewhere.foo/img/icons/absolute_auto-escaped.png\")", "[absolute URL] auto-escaped: CSS Variable with absolute URL is untouched.");
                    var mSyncValues = Parameters.get({
                        name: [
                            "sap.ui.totallyOptional.prefix:lib1_sample-variable",
                            "lib1_sample-variable",
                            "randomPrefix:lib1_with.dot:andcolon",
                            "lib1_andcolon",
                            "lib1_foo",
                            "lib1_paramWithRelativeUrlQuoted",
                            "lib1_paramWithRelativeUrlAutoEscaped",
                            "lib1_paramWithAbsoluteUrlQuoted",
                            "lib1_paramWithAbsoluteUrlAutoEscaped"
                        ],
                        callback: function () {
                            assert.ok(false, "Callback must not be triggered after 'themeChanged' event from Core.");
                        }
                    });
                    assert.equal(Object.keys(mSyncValues).length, 9, "Correct number of parameters returned");
                    assert.equal(mSyncValues["sap.ui.totallyOptional.prefix:lib1_sample-variable"], "16px", "CSS Variable can be retrieved");
                    assert.equal(mSyncValues["lib1_sample-variable"], "16px", "CSS Variable value can be retrieved");
                    assert.equal(mSyncValues["randomPrefix:lib1_with.dot:andcolon"], "24px", "CSS Variable value can be retrieved");
                    assert.equal(mSyncValues["lib1_andcolon"], "14px", "CSS Variable value can be retrieved");
                    assert.equal(mSyncValues["lib1_foo"], "1rem", "CSS Variable value can be retrieved");
                    assert.equal(mSyncValues["lib1_paramWithRelativeUrlQuoted"], "url(\"" + sBaseUri + "/testdata/libraries/themeParameters/lib1variables/themes/sap_hcb/img/icons/relative_quoted.png\")", "[relative URL] quoted: CSS Variable containg a URL can be retrieved and is correctly resolved");
                    assert.equal(mSyncValues["lib1_paramWithRelativeUrlAutoEscaped"], "url(\"" + sBaseUri + "/testdata/libraries/themeParameters/lib1variables/themes/sap_hcb/img/icons/relative_auto-escaped.png\")", "[relative URL] auto-escaped: CSS Variable containg a URL can be retrieved and is correctly resolved");
                    assert.equal(mSyncValues["lib1_paramWithAbsoluteUrlQuoted"], "url(\"http://somewhere.foo/img/icons/absolute_quoted.png\")", "[absolute URL] quoted: CSS Variable with absolute URL is untouched.");
                    assert.equal(mSyncValues["lib1_paramWithAbsoluteUrlAutoEscaped"], "url(\"http://somewhere.foo/img/icons/absolute_auto-escaped.png\")", "[absolute URL] auto-escaped: CSS Variable with absolute URL is untouched.");
                    resolve();
                }
            });
            assert.notOk(mParamsInitially, "Initially parameters should not be available. Theme has not finished loading yet.");
        });
        var pSingleParameterCheck = new Promise(function (resolve) {
            var sParamInitially = Parameters.get({
                name: "lib1_paramWithRelativeUrlAutoEscaped",
                callback: function (sValue) {
                    var sExpected = "url(\"" + sBaseUri + "/testdata/libraries/themeParameters/lib1variables/themes/sap_hcb/img/icons/relative_auto-escaped.png\")";
                    assert.equal(sValue, sExpected, "CSS Variable can be retrieved");
                    var sSyncValue = Parameters.get({
                        name: "lib1_paramWithRelativeUrlAutoEscaped",
                        callback: function () {
                            assert.ok(false, "Callback must not be triggered after 'themeChanged' event from Core.");
                        }
                    });
                    assert.equal(sSyncValue, sExpected, "CSS Variable containg a URL can be retrieved and is correctly resolved");
                    resolve();
                }
            });
            assert.notOk(sParamInitially, "Initially single parameter should not be available. Theme has not finished loading yet.");
        });
        return Promise.all([pParameterListCheck, pSingleParameterCheck]);
    });
});
QUnit.test("getActiveScopesFor: Check scope chain for given rendered control", function (assert) {
    assert.expect(18);
    var pLoadLibrary;
    var oInnerIcon1 = new Icon();
    var oInnerIcon2 = new Icon();
    oInnerIcon2.addStyleClass("TestScope1");
    var oOuterIcon1 = new Icon();
    var oOuterIcon2 = new Icon();
    oOuterIcon2.addStyleClass("TestScope1");
    var oInnerBar = new Bar({ contentLeft: [oInnerIcon1, oInnerIcon2] });
    oInnerBar.addStyleClass("TestScope1");
    var oOuterBar = new Bar({ contentLeft: oInnerBar, contentRight: [oOuterIcon1, oOuterIcon2] });
    oOuterBar.addStyleClass("TestScope2");
    oOuterBar.placeAt("qunit-fixture");
    pLoadLibrary = sap.ui.getCore().loadLibrary("testlibs.themeParameters.lib3variables", { async: true }).then(function () {
        var aAllPromises = [];
        var pGetActiveScopeFor = new Promise(function (resolve) {
            var fnAssertThemeChanged = function () {
                assert.deepEqual(Parameters.getActiveScopesFor(oOuterBar, true), [], "OuterBar - no own scope - empty scope chain");
                assert.deepEqual(Parameters.getActiveScopesFor(oInnerBar, true), [["TestScope1"]], "InnerBar - TestScope1 - [['TestScope1']]");
                assert.deepEqual(Parameters.getActiveScopesFor(oOuterIcon1, true), [], "InnerIcon1 - no own scope - empty scope chain");
                assert.deepEqual(Parameters.getActiveScopesFor(oOuterIcon2, true), [["TestScope1"]], "OuterIcon2 - TestScope1 - [['TestScope1']]");
                assert.deepEqual(Parameters.getActiveScopesFor(oInnerIcon1, true), [["TestScope1"]], "InnerIcon1 - no own scope - [['TestScope1']]");
                assert.deepEqual(Parameters.getActiveScopesFor(oInnerIcon2, true), [["TestScope1"], ["TestScope1"]], "InnerIcon2 - TestScope1 - [['TestScope1'], ['TestScope1']]");
                sap.ui.getCore().detachThemeChanged(fnAssertThemeChanged);
                resolve();
            };
            sap.ui.getCore().attachThemeChanged(fnAssertThemeChanged);
        });
        aAllPromises.push(pGetActiveScopeFor);
        aAllPromises.push(Parameters.get({
            name: "sapUiThemeParam1ForLib3",
            scopeElement: oOuterBar,
            callback: function (sParamResult) {
                assert.deepEqual(sParamResult, "#111213", "OuterBar - no own scope - default scope value #111213");
            }
        }));
        aAllPromises.push(Parameters.get({
            name: "sapUiThemeParam1ForLib3",
            scopeElement: oInnerBar,
            callback: function (sParamResult) {
                assert.deepEqual(sParamResult, "#312111", "InnerBar - TestScope1 - TestScope1 value #312111");
            }
        }));
        aAllPromises.push(Parameters.get({
            name: "sapUiThemeParam1ForLib3",
            scopeElement: oOuterIcon1,
            callback: function (sParamResult) {
                assert.deepEqual(sParamResult, "#111213", "OuterIcon1 - no own scope - default scope value #111213");
            }
        }));
        aAllPromises.push(Parameters.get({
            name: "sapUiThemeParam1ForLib3",
            scopeElement: oOuterIcon2,
            callback: function (sParamResult) {
                assert.deepEqual(sParamResult, "#312111", "OuterIcon2 - TestScope1 - TestScope1 value #312111");
            }
        }));
        aAllPromises.push(Parameters.get({
            name: "sapUiThemeParam1ForLib3",
            scopeElement: oInnerIcon1,
            callback: function (sParamResult) {
                assert.deepEqual(sParamResult, "#312111", "InnerIcon1 - no own scope - TestScope1 value #312111");
            }
        }));
        aAllPromises.push(Parameters.get({
            name: "sapUiThemeParam1ForLib3",
            scopeElement: oInnerIcon2,
            callback: function (sParamResult) {
                assert.deepEqual(sParamResult, "#312111", "InnerIcon2 - TestScope1 - TestScope1 value #312111");
            }
        }));
        return Promise.all(aAllPromises).then(function () {
            oOuterBar.destroy();
        });
    });
    assert.deepEqual(Parameters.getActiveScopesFor(oOuterBar, true), [], "OuterBar - no own scope - no scope defined ==> empty scope chain");
    assert.deepEqual(Parameters.getActiveScopesFor(oInnerBar, true), [], "InnerBar - TestScope1 - no scope defined ==> empty scope chain");
    assert.deepEqual(Parameters.getActiveScopesFor(oOuterIcon1, true), [], "InnerIcon1 - no own scope - no scope defined ==> empty scope chain");
    assert.deepEqual(Parameters.getActiveScopesFor(oOuterIcon2, true), [], "OuterIcon2 - TestScope1 - no scope defined ==> empty scope chain");
    assert.deepEqual(Parameters.getActiveScopesFor(oInnerIcon1, true), [], "InnerIcon1 - no own scope - no scope defined ==> empty scope chain");
    assert.deepEqual(Parameters.getActiveScopesFor(oInnerIcon2, true), [], "InnerIcon2 - TestScope1 - no scope defined ==> empty scope chain");
    return pLoadLibrary;
});
QUnit.module("CSS Variables - SYNC");
QUnit.test("Reading parameters from variables using the sync API", function (assert) {
    return sap.ui.getCore().loadLibrary("testlibs.themeParameters.lib5variables", { async: true }).then(function () {
        return new Promise(function (resolve) {
            var fnAssertThemeChanged = function () {
                var mValues = Parameters.get([
                    "sap.ui.totallyOptional.prefix:lib5_sample-variable",
                    "lib5_sample-variable",
                    "randomPrefix:lib5_with.dot:andcolon",
                    "lib5_andcolon",
                    "lib5_foo",
                    "lib5_paramWithRelativeUrlQuoted",
                    "lib5_paramWithRelativeUrlAutoEscaped",
                    "lib5_paramWithAbsoluteUrlQuoted",
                    "lib5_paramWithAbsoluteUrlAutoEscaped"
                ]);
                assert.equal(Object.keys(mValues).length, 9, "Correct number of parameters returned");
                assert.equal(mValues["sap.ui.totallyOptional.prefix:lib5_sample-variable"], "16px", "CSS Variable can be retrieved");
                assert.equal(mValues["lib5_sample-variable"], "16px", "CSS Variable value can be retrieved");
                assert.equal(mValues["randomPrefix:lib5_with.dot:andcolon"], "24px", "CSS Variable value can be retrieved");
                assert.equal(mValues["lib5_andcolon"], "14px", "CSS Variable value can be retrieved");
                assert.equal(mValues["lib5_foo"], "1rem", "CSS Variable value can be retrieved");
                assert.equal(mValues["lib5_paramWithRelativeUrlQuoted"], "url(\"" + sBaseUri + "/testdata/libraries/themeParameters/lib5variables/themes/sap_hcb/img/icons/relative_quoted.png\")", "[relative URL] quoted: CSS Variable containg a URL can be retrieved and is correctly resolved");
                assert.equal(mValues["lib5_paramWithRelativeUrlAutoEscaped"], "url(\"" + sBaseUri + "/testdata/libraries/themeParameters/lib5variables/themes/sap_hcb/img/icons/relative_auto-escaped.png\")", "[relative URL] auto-escaped: CSS Variable containg a URL can be retrieved and is correctly resolved");
                assert.equal(mValues["lib5_paramWithAbsoluteUrlQuoted"], "url(\"http://somewhere.foo/img/icons/absolute_quoted.png\")", "[absolute URL] quoted: CSS Variable with absolute URL is untouched.");
                assert.equal(mValues["lib5_paramWithAbsoluteUrlAutoEscaped"], "url(\"http://somewhere.foo/img/icons/absolute_auto-escaped.png\")", "[absolute URL] auto-escaped: CSS Variable with absolute URL is untouched.");
                sap.ui.getCore().detachThemeChanged(fnAssertThemeChanged);
                resolve();
            };
            sap.ui.getCore().attachThemeChanged(fnAssertThemeChanged);
        });
    });
});