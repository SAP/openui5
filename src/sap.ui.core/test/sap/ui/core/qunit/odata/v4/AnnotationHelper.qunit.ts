import Log from "sap/base/Log";
import SyncPromise from "sap/ui/base/SyncPromise";
import InvisibleText from "sap/ui/core/InvisibleText";
import BaseContext from "sap/ui/model/Context";
import JSONModel from "sap/ui/model/json/JSONModel";
import AnnotationHelper from "sap/ui/model/odata/v4/AnnotationHelper";
import ODataMetaModel from "sap/ui/model/odata/v4/ODataMetaModel";
import Expression from "sap/ui/model/odata/v4/_AnnotationHelperExpression";
var mScope = {
    "$Annotations": {
        "tea_busi.DefaultContainer/EMPLOYEES": {
            "@Common.Text": {
                "$Path": "ID"
            }
        },
        "tea_busi.Product": {
            "@UI.LineItem": [{
                    "Value": {
                        "$Path": "Price"
                    }
                }]
        },
        "tea_busi.Product/Price": {
            "@Org.OData.Measures.V1.ISOCurrency": {
                "$Path": "Currency"
            },
            "@com.sap.vocabularies.UI.v1.DoNotCheckScaleOfMeasureQuantity": true
        },
        "tea_busi.TEAM": {
            "@UI.LineItem": [{
                    "@UI.Importance": {
                        "$EnumMember": "UI.ImportanceType/High"
                    },
                    "$Type": "UI.DataFieldWithNavigationPath",
                    "Label": "Team ID",
                    "Label@Common.Label": "Team ID's Label",
                    "Target": {
                        "$NavigationPropertyPath": "TEAM_2_EMPLOYEES"
                    },
                    "Value": {
                        "$Path": "Team_Id"
                    }
                }]
        },
        "tea_busi.Worker": {
            "@UI.Facets": [{
                    "$Type": "UI.ReferenceFacet",
                    "Target": {
                        "$AnnotationPath": "@UI.LineItem"
                    }
                }, {
                    "$Type": "UI.ReferenceFacet",
                    "Target": {
                        "$AnnotationPath": "EMPLOYEE_2_TEAM@Common.Label"
                    }
                }, {
                    "$Type": "UI.ReferenceFacet",
                    "Target": {
                        "$AnnotationPath": "EMPLOYEE_2_TEAM/@UI.LineItem"
                    }
                }, {
                    "$Type": "UI.ReferenceFacet",
                    "Target": {
                        "$AnnotationPath": "tea_busi.TEAM/TEAM_2_EMPLOYEES/EMPLOYEE_2_TEAM/@UI.LineItem"
                    }
                }]
        },
        "tea_busi.Worker/ID": {
            "@Common.Label": "Worker's ID",
            "@Common.Text": {
                "$Path": "Name"
            }
        },
        "tea_busi.Worker/Name": {
            "@Common.Label": "Worker's Name"
        }
    },
    "$EntityContainer": "tea_busi.DefaultContainer",
    "tea_busi.": {
        "$kind": "Schema",
        "@Schema": {}
    },
    "tea_busi.DefaultContainer": {
        "$kind": "EntityContainer",
        "EMPLOYEES": {
            "$kind": "EntitySet",
            "$NavigationPropertyBinding": {
                "EMPLOYEE_2_TEAM": "TEAMS"
            },
            "$Type": "tea_busi.Worker"
        },
        "Products": {
            "$kind": "EntitySet",
            "Type": "tea_busi.Product"
        },
        "TEAMS": {
            "$kind": "EntitySet",
            "$NavigationPropertyBinding": {
                "TEAM_2_EMPLOYEES": "EMPLOYEES"
            },
            "$Type": "tea_busi.TEAM"
        }
    },
    "tea_busi.Product": {
        "$kind": "EntityType",
        "$Key": ["Id"],
        "Id": {
            "$kind": "Property",
            "$Type": "Edm.String",
            "$Nullable": false
        },
        "Currency": {
            "$kind": "Property",
            "$Type": "Edm.String",
            "$Nullable": false
        },
        "Price": {
            "$kind": "Property",
            "$Type": "Edm.Decimal",
            "$Nullable": false
        }
    },
    "tea_busi.TEAM": {
        "$kind": "EntityType",
        "$Key": ["Team_Id"],
        "Team_Id": {
            "$kind": "Property",
            "$Type": "name.space.Id",
            "$Nullable": false,
            "$MaxLength": 10
        },
        "TEAM_2_EMPLOYEES": {
            "$kind": "NavigationProperty",
            "$isCollection": true,
            "$Type": "tea_busi.Worker"
        }
    },
    "tea_busi.Worker": {
        "$kind": "EntityType",
        "$Key": ["ID"],
        "ID": {
            "$kind": "Property",
            "$Type": "Edm.String",
            "$Nullable": false,
            "$MaxLength": 4
        },
        "Name": {
            "$kind": "Property",
            "$Type": "Edm.String"
        },
        "EMPLOYEE_2_TEAM": {
            "$kind": "NavigationProperty",
            "$Type": "tea_busi.TEAM",
            "$Nullable": false
        }
    }
};
function check(assert, vRawValue, vResult, oMetaModel, oModel) {
    var oContext = new BaseContext(oMetaModel, "/"), sText = AnnotationHelper.value(vRawValue, { context: oContext }), oInvisibleText = new InvisibleText({ text: sText, models: oModel });
    oInvisibleText.bindObject("/");
    assert.strictEqual(oInvisibleText.getText(), oInvisibleText.validateProperty("text", vResult), JSON.stringify(vRawValue) + " --> " + sText);
}
QUnit.module("sap.ui.model.odata.v4.AnnotationHelper", {
    beforeEach: function () {
        this.oLogMock = this.mock(Log);
        this.oLogMock.expects("warning").never();
        this.oLogMock.expects("error").never();
    }
});
QUnit.test("isMultiple", function (assert) {
    var mFixture = {
        "": false,
        "@UI.LineItem": false,
        "EMPLOYEE_2_TEAM@Common.Label": false,
        "EMPLOYEE_2_TEAM/@UI.LineItem": false,
        "EMPLOYEE_2_TEAM/TEAM_2_EMPLOYEES": true,
        "EMPLOYEE_2_TEAM/TEAM_2_EMPLOYEES/$count": true,
        "EMPLOYEE_2_TEAM/TEAM_2_EMPLOYEES/@UI.LineItem": true,
        "EMPLOYEE_2_TEAM/TEAM_2_EMPLOYEES@Common.Label": true,
        "tea_busi.TEAM/TEAM_2_EMPLOYEES/EMPLOYEE_2_TEAM/@UI.LineItem": false
    }, oMetaModel = new ODataMetaModel(), oContext = new BaseContext(oMetaModel), sPath;
    this.mock(oMetaModel).expects("fetchEntityContainer").atLeast(1).returns(SyncPromise.resolve(mScope));
    for (sPath in mFixture) {
        assert.strictEqual(AnnotationHelper.isMultiple(sPath, {
            context: oContext,
            schemaChildName: "tea_busi.Worker"
        }), mFixture[sPath], sPath);
    }
});
[true, false, {}, [], null, undefined].forEach(function (vFetchObjectResult, i) {
    QUnit.test("isMultiple: $$valueAsPromise - " + i, function (assert) {
        var oMetaModel = {
            fetchObject: function () { }
        }, oPromise;
        this.mock(oMetaModel).expects("fetchObject").withExactArgs("/tea_busi.Worker/EMPLOYEE_2_TEAM/TEAM_2_EMPLOYEES/$isCollection").returns(SyncPromise.resolve(Promise.resolve(vFetchObjectResult)));
        oPromise = AnnotationHelper.isMultiple("EMPLOYEE_2_TEAM/TEAM_2_EMPLOYEES", {
            $$valueAsPromise: true,
            context: {
                getModel: function () { return oMetaModel; }
            },
            schemaChildName: "tea_busi.Worker"
        });
        assert.ok(oPromise instanceof Promise, "Promise returned");
        return oPromise.then(function (bIsMultiple) {
            assert.strictEqual(bIsMultiple, i === 0);
        });
    });
});
QUnit.test("getNavigationPath", function (assert) {
    var mFixture = {
        "": "",
        "@UI.LineItem": "",
        "EMPLOYEE_2_TEAM@Common.Label": "EMPLOYEE_2_TEAM",
        "EMPLOYEE_2_TEAM/@UI.LineItem": "EMPLOYEE_2_TEAM",
        "EMPLOYEE_2_TEAM/TEAM_2_EMPLOYEES": "EMPLOYEE_2_TEAM/TEAM_2_EMPLOYEES",
        "EMPLOYEE_2_TEAM/TEAM_2_EMPLOYEES/$count": "EMPLOYEE_2_TEAM/TEAM_2_EMPLOYEES",
        "EMPLOYEE_2_TEAM/TEAM_2_EMPLOYEES/@UI.LineItem": "EMPLOYEE_2_TEAM/TEAM_2_EMPLOYEES",
        "EMPLOYEE_2_TEAM/TEAM_2_EMPLOYEES@Common.Label": "EMPLOYEE_2_TEAM/TEAM_2_EMPLOYEES",
        "tea_busi.TEAM/TEAM_2_EMPLOYEES/EMPLOYEE_2_TEAM/@UI.LineItem": "TEAM_2_EMPLOYEES/EMPLOYEE_2_TEAM",
        "tea_busi.TEAM/TEAM_2_EMPLOYEES/tea_busi.WORKER/EMPLOYEE_2_TEAM/@UI.LineItem": "TEAM_2_EMPLOYEES/EMPLOYEE_2_TEAM"
    }, sPath;
    for (sPath in mFixture) {
        assert.strictEqual(AnnotationHelper.getNavigationPath(sPath), mFixture[sPath], sPath);
    }
    this.mock(Array.prototype).expects("filter").never();
    assert.strictEqual(AnnotationHelper.getNavigationPath("EMPLOYEE_2_TEAM"), "EMPLOYEE_2_TEAM", "EMPLOYEE_2_TEAM");
});
QUnit.test("getNavigationBinding", function (assert) {
    var oAnnotationHelperMock = this.mock(AnnotationHelper), mFixture = {
        "": "",
        "EMPLOYEE_2_TEAM/TEAM_2_EMPLOYEES": "{EMPLOYEE_2_TEAM/TEAM_2_EMPLOYEES}",
        "foo\\bar": Error,
        "foo{bar": Error,
        "foo}bar": Error,
        "foo:bar": Error
    }, sPath;
    function codeUnderTest() {
        return AnnotationHelper.getNavigationBinding("foo/bar");
    }
    for (sPath in mFixture) {
        oAnnotationHelperMock.expects("getNavigationPath").withExactArgs("foo/bar").returns(sPath);
        if (mFixture[sPath] === Error) {
            assert.throws(codeUnderTest, new Error("Invalid OData identifier: " + sPath));
        }
        else {
            assert.strictEqual(codeUnderTest(), mFixture[sPath], sPath);
        }
    }
});
["/my/path", "/my/path/"].forEach(function (sPath) {
    QUnit.test("value", function (assert) {
        var aArguments = [{}], oMetaModel = {}, oContext = new BaseContext(oMetaModel, sPath), vRawValue = {}, sResult = "foo";
        this.mock(Expression).expects("getExpression").withExactArgs({
            asExpression: false,
            complexBinding: false,
            ignoreAsPrefix: "",
            model: sinon.match.same(oMetaModel),
            parameters: sinon.match.same(aArguments[0]),
            path: "/my/path",
            prefix: "",
            value: sinon.match.same(vRawValue),
            $$valueAsPromise: undefined
        }).returns(sResult);
        assert.strictEqual(AnnotationHelper.value(vRawValue, { arguments: aArguments, context: oContext }), sResult);
    });
});
QUnit.test("value: path ends with /$Path", function (assert) {
    var oMetaModel = {}, oContext = new BaseContext(oMetaModel, "/Equipments/@UI.LineItem/4/Value/$Path"), vRawValue = {}, vResult = {};
    this.mock(Expression).expects("getExpression").withExactArgs({
        asExpression: false,
        complexBinding: false,
        ignoreAsPrefix: "",
        model: sinon.match.same(oMetaModel),
        parameters: undefined,
        path: "/Equipments/@UI.LineItem/4/Value",
        prefix: "",
        value: { $Path: sinon.match.same(vRawValue) },
        $$valueAsPromise: undefined
    }).returns(vResult);
    assert.strictEqual(AnnotationHelper.value(vRawValue, { context: oContext }), vResult);
});
QUnit.test("value: path ends with /$PropertyPath", function (assert) {
    var oMetaModel = {}, oContext = new BaseContext(oMetaModel, "/Artists/@UI.SelectionFields/0/$PropertyPath"), vRawValue = {}, vResult = {};
    this.mock(Expression).expects("getExpression").withExactArgs({
        asExpression: false,
        complexBinding: false,
        ignoreAsPrefix: "",
        model: sinon.match.same(oMetaModel),
        parameters: undefined,
        path: "/Artists/@UI.SelectionFields/0",
        prefix: "",
        value: { $PropertyPath: sinon.match.same(vRawValue) },
        $$valueAsPromise: undefined
    }).returns(vResult);
    assert.strictEqual(AnnotationHelper.value(vRawValue, { context: oContext }), vResult);
});
QUnit.test("value: $$valueAsPromise", function (assert) {
    var oModel = {
        fetchObject: function () { }
    }, oContext = {
        getModel: function () {
            return oModel;
        },
        getPath: function () {
            return "/Equipments/@com.sap.vocabularies.UI.v1.LineItem/4/Value/";
        }
    }, oPromise, oProperty = {
        $Type: "Edm.String"
    }, vRawValue = { $Path: "EQUIPMENT_2_PRODUCT/Name" };
    this.mock(Expression).expects("getExpression").withExactArgs({
        asExpression: false,
        complexBinding: false,
        ignoreAsPrefix: "",
        model: sinon.match.same(oModel),
        parameters: undefined,
        path: "/Equipments/@com.sap.vocabularies.UI.v1.LineItem/4/Value",
        prefix: "",
        value: sinon.match.same(vRawValue),
        $$valueAsPromise: true
    }).callThrough();
    this.mock(oModel).expects("fetchObject").withExactArgs("/Equipments/@com.sap.vocabularies.UI.v1.LineItem/4/Value/$Path/$").returns(SyncPromise.resolve(Promise.resolve(oProperty)));
    oPromise = AnnotationHelper.value(vRawValue, { $$valueAsPromise: true, context: oContext });
    assert.ok(oPromise instanceof Promise);
    return oPromise.then(function (sValue) {
        assert.strictEqual(sValue, "{EQUIPMENT_2_PRODUCT/Name}");
    });
});
QUnit.test("value: 14.5.1 Comparison and Logical Operators", function (assert) {
    check(assert, {
        $And: [{
                $And: [
                    {
                        $Eq: [
                            { "$DateTimeOffset": "1970-01-01T00:00:00.000Z" },
                            { "$DateTimeOffset": "1970-01-01T00:00:00.000+00:00" }
                        ]
                    },
                    {
                        $Eq: [
                            { "$DateTimeOffset": "1970-01-01T00:00:00.000Z" },
                            { "$DateTimeOffset": "1970-01-01T00:00:00.000-00:00" }
                        ]
                    }
                ]
            }, {
                $Le: [
                    { "$DateTimeOffset": "1970-01-01T00:00:00.000Z" },
                    { "$DateTimeOffset": "1970-01-01T00:00:00.000-01:00" }
                ]
            }]
    }, true);
});
QUnit.test("value: 14.5.3.1.2 Function odata.fillUriTemplate", function (assert) {
    var oMetaModel = {
        fetchObject: function () { }
    }, oMetaModelMock = this.mock(oMetaModel), oModel = new JSONModel({
        Address: {
            City: "MyCity",
            Street: "O'Neil's Alley"
        }
    }), sUrl = "https://www.google.de/maps/place/'O''Neil''s Alley',MyCity".replace(/ /g, "%20").replace(/'/g, "%27");
    oMetaModelMock.expects("fetchObject").withExactArgs("/$Apply/1/$LabeledElement/$Apply/0/$Path/$").returns(SyncPromise.resolve({ $Type: "Edm.Guid" }));
    oMetaModelMock.expects("fetchObject").withExactArgs("/$Apply/2/$LabeledElement/$Apply/0/$Path/$").returns(SyncPromise.resolve({ $Type: "Edm.String" }));
    check(assert, {
        $Apply: [
            "https://www.google.de/maps/place/{street},{city}",
            {
                $LabeledElement: {
                    $Apply: [{
                            $Path: "Address/City"
                        }],
                    $Function: "odata.uriEncode"
                },
                $Name: "city"
            },
            {
                $LabeledElement: {
                    $Apply: [{
                            $Path: "Address/Street"
                        }],
                    $Function: "odata.uriEncode"
                },
                $Name: "street"
            }
        ],
        $Function: "odata.fillUriTemplate"
    }, sUrl, oMetaModel, oModel);
});
QUnit.test("getValueListType: property path", function (assert) {
    var oMetaModel = {
        getValueListType: function () { }
    }, oDetails = {
        context: {
            getModel: function () { return oMetaModel; }
        },
        schemaChildName: "tea_busi.Worker"
    }, oResult = {};
    this.mock(oMetaModel).expects("getValueListType").withExactArgs("/tea_busi.Worker/ID").returns(oResult);
    assert.strictEqual(AnnotationHelper.getValueListType("ID", oDetails), oResult);
});
QUnit.test("getValueListType: property object", function (assert) {
    var oMetaModel = {
        getValueListType: function () { }
    }, oDetails = {
        context: {
            getModel: function () { return oMetaModel; },
            getPath: function () { return "/tea_busi.Worker/ID"; }
        }
    }, oResult = {};
    this.mock(oMetaModel).expects("getValueListType").withExactArgs("/tea_busi.Worker/ID").returns(oResult);
    assert.strictEqual(AnnotationHelper.getValueListType(mScope["tea_busi.Worker"].ID, oDetails), oResult);
});
QUnit.test("getValueListType: $$valueAsPromise", function (assert) {
    var oMetaModel = {
        fetchValueListType: function () { }
    }, oDetails = {
        $$valueAsPromise: true,
        context: {
            getModel: function () { return oMetaModel; }
        },
        schemaChildName: "tea_busi.Worker"
    }, oResult = {}, oSyncPromise = SyncPromise.resolve();
    this.mock(oMetaModel).expects("fetchValueListType").withExactArgs("/tea_busi.Worker/ID").returns(oSyncPromise);
    this.mock(oSyncPromise).expects("unwrap").withExactArgs().returns(oResult);
    assert.strictEqual(AnnotationHelper.getValueListType("ID", oDetails), oResult);
});
QUnit.test("label - DataField has a label", function () {
    var oAnnotationHelperMock = this.mock(AnnotationHelper), oContext = {}, oModel = {
        createBindingContext: function () { }
    }, oDetails = {
        context: {
            getModel: function () { return oModel; }
        }
    }, vRawValue = {
        Label: "ID",
        Value: {}
    };
    this.mock(oModel).expects("createBindingContext").withExactArgs("Label", sinon.match.same(oDetails.context)).returns(oContext);
    oAnnotationHelperMock.expects("value").withExactArgs(vRawValue.Label, sinon.match({
        context: sinon.match.same(oContext)
    }));
    AnnotationHelper.label(vRawValue, oDetails);
});
QUnit.test("label - follow the path", function () {
    var oAnnotationHelperMock = this.mock(AnnotationHelper), oContext = {
        getObject: function () { }
    }, oModel = {
        createBindingContext: function () { }
    }, oDetails = {
        context: {
            getModel: function () { return oModel; }
        }
    }, vRawValue = {
        Value: {
            $Path: "PhoneNumber"
        }
    }, vResult = {};
    this.mock(oModel).expects("createBindingContext").withExactArgs("Value/$Path@com.sap.vocabularies.Common.v1.Label", sinon.match.same(oDetails.context)).returns(oContext);
    this.mock(oContext).expects("getObject").withExactArgs("").returns(vResult);
    oAnnotationHelperMock.expects("value").withExactArgs(sinon.match.same(vResult), sinon.match({
        context: sinon.match.same(oContext)
    }));
    AnnotationHelper.label(vRawValue, oDetails);
});
QUnit.test("label: follow the path, $$valueAsPromise", function (assert) {
    var oModel = {
        createBindingContext: function () { },
        fetchObject: function () { }
    }, oContext = {
        getModel: function () { return oModel; }
    }, oDetails = {
        $$valueAsPromise: true,
        context: {
            getModel: function () { return oModel; }
        }
    }, oModelMock = this.mock(oModel), oPromise, vRawValue = {
        Value: {
            $Path: "PhoneNumber"
        }
    }, vResult = {}, vValueAtPath = {}, oFetchObjectPromise = SyncPromise.resolve(Promise.resolve(vValueAtPath));
    oModelMock.expects("createBindingContext").withExactArgs("Value/$Path@com.sap.vocabularies.Common.v1.Label", sinon.match.same(oDetails.context)).returns(oContext);
    oModelMock.expects("fetchObject").withExactArgs("", oContext).returns(oFetchObjectPromise);
    this.mock(AnnotationHelper).expects("value").withExactArgs(sinon.match.same(vValueAtPath), sinon.match({
        context: sinon.match.same(oContext)
    })).returns(vResult);
    oPromise = AnnotationHelper.label(vRawValue, oDetails);
    assert.ok(oPromise instanceof Promise);
    return oPromise.then(function (vResult0) {
        assert.strictEqual(vResult0, vResult);
    });
});
[
    {},
    { Value: { $Path: "" } },
    { Value: "PhoneNumber" },
    { Value: { $Apply: ["foo", "/", "bar"], $Function: "odata.concat" } }
].forEach(function (vRawValue) {
    var sTitle = "label - returns undefined, vRawValue = " + JSON.stringify(vRawValue);
    QUnit.test(sTitle, function (assert) {
        assert.strictEqual(AnnotationHelper.label(vRawValue, {}), undefined);
    });
});
["/my/path", "/my/path/"].forEach(function (sPath) {
    QUnit.test("format", function (assert) {
        var aArguments = [{}, {}], oMetaModel = {}, oContext = new BaseContext(oMetaModel, sPath), vRawValue = {}, vResult = {};
        this.mock(Expression).expects("getExpression").withExactArgs({
            asExpression: false,
            complexBinding: true,
            formatOptions: sinon.match.same(aArguments[1]),
            ignoreAsPrefix: "",
            model: sinon.match.same(oMetaModel),
            parameters: sinon.match.same(aArguments[0]),
            path: "/my/path",
            prefix: "",
            value: sinon.match.same(vRawValue),
            $$valueAsPromise: true
        }).returns(vResult);
        assert.strictEqual(AnnotationHelper.format(vRawValue, { arguments: aArguments, context: oContext }), vResult);
    });
});
QUnit.test("format: path ends with /$Path", function (assert) {
    var oMetaModel = {}, oContext = new BaseContext(oMetaModel, "/Equipments/@UI.LineItem/4/Value/$Path"), vRawValue = {}, vResult = {};
    this.mock(Expression).expects("getExpression").withExactArgs({
        asExpression: false,
        complexBinding: true,
        formatOptions: undefined,
        ignoreAsPrefix: "",
        model: sinon.match.same(oMetaModel),
        parameters: undefined,
        path: "/Equipments/@UI.LineItem/4/Value",
        prefix: "",
        value: { $Path: sinon.match.same(vRawValue) },
        $$valueAsPromise: true
    }).returns(vResult);
    assert.strictEqual(AnnotationHelper.format(vRawValue, { context: oContext }), vResult);
});
QUnit.test("format: with $Path in between and at end", function (assert) {
    var oMetaModel = {
        fetchObject: function () { },
        getObject: function () { }
    }, oMetaModelMock = this.mock(oMetaModel), oContext = new BaseContext(oMetaModel, "/Equipments/@UI.LineItem/0/Value/$Path@Common.Text/$Path"), vRawValue = {}, vResult = {};
    oMetaModelMock.expects("fetchObject").withExactArgs("/Equipments/@UI.LineItem/0/Value/$Path").returns(SyncPromise.resolve("EQUIPMENT_2_PRODUCT/Name"));
    this.mock(Expression).expects("getExpression").withExactArgs({
        asExpression: false,
        complexBinding: true,
        formatOptions: undefined,
        ignoreAsPrefix: "",
        model: sinon.match.same(oMetaModel),
        parameters: undefined,
        path: "/Equipments/@UI.LineItem/0/Value/$Path@Common.Text",
        prefix: "EQUIPMENT_2_PRODUCT/",
        value: { $Path: sinon.match.same(vRawValue) },
        $$valueAsPromise: true
    }).returns(vResult);
    AnnotationHelper.format(vRawValue, { context: oContext }).then(function (vResult0) {
        assert.strictEqual(vResult0, vResult);
    });
});
[{
        sPath: "/Equipments/@UI.LineItem/0/Value/$Path@Common.Label",
        sPathForFetchObject: "/Equipments/@UI.LineItem/0/Value/$Path",
        sPathValue: "EQUIPMENT_2_PRODUCT/Name",
        sPrefix: "EQUIPMENT_2_PRODUCT/"
    }, {
        sPath: "/Equipments/@UI.LineItem/0/Value/$Path@Common.Label",
        sPathForFetchObject: "/Equipments/@UI.LineItem/0/Value/$Path",
        sPathValue: "Name",
        sPrefix: ""
    }, {
        sPath: "/Equipments/@UI.LineItem/0/Value/$Path/@Common.Label",
        sPathForFetchObject: "/Equipments/@UI.LineItem/0/Value/$Path",
        sPathValue: "EQUIPMENT_2_PRODUCT",
        sPrefix: "EQUIPMENT_2_PRODUCT/"
    }, {
        sPath: "/Products/@namespace.foo/0/Value/$AnnotationPath/",
        sPathForGetExpression: "/Products/@namespace.foo/0/Value/$AnnotationPath",
        sPathForFetchObject: "/Products/@namespace.foo/0/Value/$AnnotationPath",
        sPathValue: "PRODUCT_2_SUPPLIER/@namespace.bar",
        sPrefix: "PRODUCT_2_SUPPLIER/"
    }, {
        sPath: "/Products/@namespace.foo/0/Value/$AnnotationPath/",
        sPathForGetExpression: "/Products/@namespace.foo/0/Value/$AnnotationPath",
        sPathForFetchObject: "/Products/@namespace.foo/0/Value/$AnnotationPath",
        sPathValue: "PRODUCT_2_SUPPLIER/@namespace.bar",
        sPrefix: "PRODUCT_2_SUPPLIER/"
    }, {
        sPath: "/Products/@namespace.foo/0/Value/$AnnotationPath/",
        sPathForGetExpression: "/Products/@namespace.foo/0/Value/$AnnotationPath",
        sPathForFetchObject: "/Products/@namespace.foo/0/Value/$AnnotationPath",
        sPathValue: "PRODUCT_2_SUPPLIER@namespace.bar",
        sPrefix: ""
    }].forEach(function (oFixture, i) {
    QUnit.test("format: with $Path in value - " + i, function (assert) {
        var oMetaModel = {
            fetchObject: function () { },
            getObject: function () { }
        }, oMetaModelMock = this.mock(oMetaModel), oContext = new BaseContext(oMetaModel, oFixture.sPath), vRawValue = {}, vResult = {};
        oMetaModelMock.expects("fetchObject").withExactArgs(oFixture.sPathForFetchObject).returns(SyncPromise.resolve(oFixture.sPathValue));
        this.mock(Expression).expects("getExpression").withExactArgs({
            asExpression: false,
            complexBinding: true,
            formatOptions: undefined,
            ignoreAsPrefix: "",
            model: sinon.match.same(oMetaModel),
            parameters: undefined,
            path: oFixture.sPathForGetExpression || oFixture.sPath,
            prefix: oFixture.sPrefix,
            value: sinon.match.same(vRawValue),
            $$valueAsPromise: true
        }).returns(vResult);
        AnnotationHelper.format(vRawValue, { context: oContext }).then(function (vResult0) {
            assert.strictEqual(vResult0, vResult);
        });
    });
});
QUnit.test("format: path ends with /$PropertyPath", function (assert) {
    var oMetaModel = {}, oContext = new BaseContext(oMetaModel, "/Artists/@UI.SelectionFields/0/$PropertyPath"), vRawValue = {}, vResult = {};
    this.mock(Expression).expects("getExpression").withExactArgs({
        asExpression: false,
        complexBinding: true,
        formatOptions: undefined,
        ignoreAsPrefix: "",
        model: sinon.match.same(oMetaModel),
        parameters: undefined,
        path: "/Artists/@UI.SelectionFields/0",
        prefix: "",
        value: { $PropertyPath: sinon.match.same(vRawValue) },
        $$valueAsPromise: true
    }).returns(vResult);
    assert.strictEqual(AnnotationHelper.format(vRawValue, { context: oContext }), vResult);
});
["$PropertyPath", "$NavigationPropertyPath"].forEach(function (sPathSuffix) {
    QUnit.test("format: unsupported path: " + sPathSuffix, function (assert) {
        var sPath = "/Foo/@namespace.annotation/Value/" + sPathSuffix + "/";
        this.mock(Expression).expects("getExpression").never();
        assert.throws(function () {
            AnnotationHelper.format({}, { context: new BaseContext({}, sPath) });
        }, new Error("Unsupported path segment " + sPathSuffix + " in " + sPath));
    });
});
[
    "/Foo/@namespace.annotation/Value/$Path/@namespace.other/Value/$Path/",
    "/Foo/@namespace.annotation/Value/$AnnotationPath/@namespace.other/Value/$Path/",
    "/Foo/@namespace.annotation/Value/$Path/@namespace.other/Value/$AnnotationPath/",
    "/Foo/@namespace.annotation/Value/$AnnotationPath/@namespace.other/Value/$AnnotationPath/"
].forEach(function (sPath) {
    QUnit.test("format: unsupported path: " + sPath, function (assert) {
        this.mock(Expression).expects("getExpression").never();
        assert.throws(function () {
            AnnotationHelper.format({}, { context: new BaseContext({}, sPath) });
        }, new Error("Only one $Path or $AnnotationPath segment is supported: " + sPath));
    });
});
QUnit.test("format: integration test", function (assert) {
    var mConstraints = {
        maxLength: 10
    }, oModel = {
        fetchObject: function () { },
        getConstraints: function () { },
        getObject: function () { }
    }, oContext = {
        getModel: function () {
            return oModel;
        },
        getPath: function () {
            return "/Equipments/@com.sap.vocabularies.UI.v1.LineItem/4/Value/";
        }
    }, sMetaPath = "/Equipments/@com.sap.vocabularies.UI.v1.LineItem/4/Value/$Path", oModelMock = this.mock(oModel), oProperty = {
        $MaxLength: "10",
        $Type: "Edm.String"
    }, vRawValue = { $Path: "EQUIPMENT_2_PRODUCT/Name" };
    this.mock(Expression).expects("getExpression").withExactArgs({
        asExpression: false,
        complexBinding: true,
        formatOptions: undefined,
        ignoreAsPrefix: "",
        model: sinon.match.same(oModel),
        parameters: undefined,
        path: "/Equipments/@com.sap.vocabularies.UI.v1.LineItem/4/Value",
        prefix: "",
        value: sinon.match.same(vRawValue),
        $$valueAsPromise: true
    }).callThrough();
    oModelMock.expects("fetchObject").withExactArgs("/Equipments/@com.sap.vocabularies.UI.v1.LineItem/4/Value/$Path/$").returns(SyncPromise.resolve(oProperty));
    oModelMock.expects("getConstraints").withExactArgs(sinon.match.same(oProperty), sMetaPath).returns(mConstraints);
    oModelMock.expects("getObject").withExactArgs("/Equipments/@com.sap.vocabularies.UI.v1.LineItem/4/Value/$Path" + "@Org.OData.Measures.V1.Unit/$Path").returns(undefined);
    oModelMock.expects("getObject").withExactArgs("/Equipments/@com.sap.vocabularies.UI.v1.LineItem/4/Value/$Path" + "@Org.OData.Measures.V1.ISOCurrency/$Path").returns(undefined);
    assert.strictEqual(AnnotationHelper.format(vRawValue, { context: oContext }), "{path:'EQUIPMENT_2_PRODUCT/Name',type:'sap.ui.model.odata.type.String'," + "constraints:{'maxLength':10},formatOptions:{'parseKeepsEmptyString':true}}");
});
QUnit.test("format: ISOCurrency", function (assert) {
    var oMetaModel = new ODataMetaModel(), oContext = {
        getModel: function () {
            return oMetaModel;
        },
        getPath: function () {
            return "/tea_busi.Product/@UI.LineItem/0/Value/";
        }
    }, vRawValue = { $Path: "Price" };
    this.mock(oMetaModel).expects("fetchEntityContainer").atLeast(1).withExactArgs().returns(SyncPromise.resolve(mScope));
    assert.strictEqual(AnnotationHelper.format(vRawValue, {
        arguments: [{ $$foo: "bar" }, { maxLength: 10 }],
        context: oContext
    }), "{mode:'TwoWay',parts:[" + "{path:'Price',type:'sap.ui.model.odata.type.Decimal',constraints:{'nullable':false}" + ",formatOptions:{'maxLength':10},parameters:{'$$foo':'bar'}}" + ",{path:'Currency',type:'sap.ui.model.odata.type.String'" + ",constraints:{'nullable':false},formatOptions:{'parseKeepsEmptyString':true" + ",'maxLength':10},parameters:{'$$foo':'bar'}}" + ",{mode:'OneTime',path:'/##@@requestCurrencyCodes',targetType:'any'}]" + ",type:'sap.ui.model.odata.type.Currency'" + ",constraints:{'skipDecimalsValidation':true}}");
});
[false, true].forEach(function (bIsBound) {
    QUnit.test("format: overload; $IsBound : " + bIsBound, function (assert) {
        var oMetaModel = {}, sPath = "/T\u20ACAMS/name.space.OverloadedAction@Core.OperationAvailable", oContext = new BaseContext(oMetaModel, sPath), vRawValue = {}, vResult = {};
        this.mock(Expression).expects("getExpression").withExactArgs({
            asExpression: false,
            complexBinding: true,
            formatOptions: undefined,
            ignoreAsPrefix: bIsBound ? "_it/" : "",
            model: sinon.match.same(oMetaModel),
            parameters: undefined,
            path: sPath,
            prefix: "",
            value: sinon.match.same(vRawValue),
            $$valueAsPromise: true
        }).returns(vResult);
        assert.strictEqual(AnnotationHelper.format(vRawValue, {
            context: oContext,
            overload: {
                $IsBound: bIsBound,
                $Parameter: [{
                        $Name: "_it"
                    }]
            }
        }), vResult);
    });
});
QUnit.test("format: for annotation on parameters of bound operations", function (assert) {
    var oMetaModel = {}, sPath = "/T\u20ACAMS/name.space.OverloadedAction/$Parameter/p1@UI.Hidden", oContext = new BaseContext(oMetaModel, sPath), vRawValue = {}, vResult = {};
    this.mock(Expression).expects("getExpression").withExactArgs({
        asExpression: false,
        complexBinding: true,
        formatOptions: undefined,
        ignoreAsPrefix: "",
        model: sinon.match.same(oMetaModel),
        parameters: undefined,
        path: sPath,
        prefix: "",
        value: sinon.match.same(vRawValue),
        $$valueAsPromise: true
    }).returns(vResult);
    assert.strictEqual(AnnotationHelper.format(vRawValue, {
        context: oContext,
        overload: {
            $IsBound: true,
            $Parameter: [{
                    $Name: "_it"
                }, {
                    $Name: "p1"
                }]
        }
    }), vResult);
});
[false, true].forEach(function (bIsBound) {
    QUnit.test("value: overload; $IsBound : " + bIsBound, function (assert) {
        var oMetaModel = {}, sPath = "/T\u20ACAMS/name.space.OverloadedAction@Core.OperationAvailable", oContext = new BaseContext(oMetaModel, sPath), vRawValue = {}, vResult = {}, oValueAsPromise = {};
        this.mock(Expression).expects("getExpression").withExactArgs({
            asExpression: false,
            complexBinding: false,
            ignoreAsPrefix: bIsBound ? "_it/" : "",
            model: sinon.match.same(oMetaModel),
            parameters: undefined,
            path: sPath,
            prefix: "",
            value: sinon.match.same(vRawValue),
            $$valueAsPromise: sinon.match.same(oValueAsPromise)
        }).returns(vResult);
        assert.strictEqual(AnnotationHelper.value(vRawValue, {
            context: oContext,
            overload: {
                $IsBound: bIsBound,
                $Parameter: [{
                        $Name: "_it"
                    }]
            },
            $$valueAsPromise: oValueAsPromise
        }), vResult);
    });
});
QUnit.test("value: for parameters of bound operations", function (assert) {
    var oMetaModel = {}, sPath = "/T\u20ACAMS/name.space.OverloadedAction/$Parameter/p1@UI.Hidden", oContext = new BaseContext(oMetaModel, sPath), vRawValue = {}, vResult = {}, oValueAsPromise = {};
    this.mock(Expression).expects("getExpression").withExactArgs({
        asExpression: false,
        complexBinding: false,
        ignoreAsPrefix: "",
        model: sinon.match.same(oMetaModel),
        parameters: undefined,
        path: sPath,
        prefix: "",
        value: sinon.match.same(vRawValue),
        $$valueAsPromise: sinon.match.same(oValueAsPromise)
    }).returns(vResult);
    assert.strictEqual(AnnotationHelper.value(vRawValue, {
        context: oContext,
        overload: {
            $IsBound: true,
            $Parameter: [{
                    $Name: "_it"
                }, {
                    $Name: "p1"
                }]
        },
        $$valueAsPromise: oValueAsPromise
    }), vResult);
});
QUnit.test("value: $If w/o else as direct child of $Collection", function (assert) {
    var oMetaModel = {
        fetchObject: function () { }
    }, sPath = "/EMPLOYEES/ROOM_ID/@com.sap.vocabularies.Common.v1.ValueListRelevantQualifiers", oContext = {
        getModel: function () {
            return oMetaModel;
        },
        getPath: function () {
            return sPath;
        }
    }, oMetaModelMock = this.mock(oMetaModel), oModel = new JSONModel({
        EMPLOYEE_2_TEAM: {
            MEMBER_COUNT: 11
        }
    }), vRawValue = ["in", {
            $If: [{
                    $Gt: [{ $Path: "EMPLOYEE_2_TEAM/MEMBER_COUNT" }, 10]
                }, "maybe"]
        }];
    oMetaModelMock.expects("fetchObject").withExactArgs(sPath + "/1/$If/0/$Gt/0/$Path/$").returns(SyncPromise.resolve({ $Type: "Edm.Int32" }));
    assert.strictEqual(AnnotationHelper.value(vRawValue, { context: oContext }), "{=odata.collection(['in',(%{EMPLOYEE_2_TEAM/MEMBER_COUNT}>10)?'maybe':undefined])}");
    oMetaModelMock.expects("fetchObject").twice().withExactArgs("/1/$If/0/$Gt/0/$Path/$").returns(SyncPromise.resolve({ $Type: "Edm.Int32" }));
    check(assert, vRawValue, "in,maybe", oMetaModel, oModel);
    oModel.setProperty("/EMPLOYEE_2_TEAM/MEMBER_COUNT", 10);
    check(assert, vRawValue, "in", oMetaModel, oModel);
});
QUnit.test("value: $If w/o else, but no direct child of $Collection", function (assert) {
    var oMetaModel = {
        fetchObject: function () { }
    }, sPath = "/EMPLOYEES/ROOM_ID/@com.sap.vocabularies.Common.v1.ValueListRelevantQualifiers", oContext = {
        getModel: function () {
            return oMetaModel;
        },
        getPath: function () {
            return sPath;
        }
    }, sMessage = sPath + "/0/$If/0/$If/2: Expected object", vRawValue = [{
            $If: [{
                    $If: [{
                            $Gt: [{ $Path: "EMPLOYEE_2_TEAM/MEMBER_COUNT" }, 10]
                        }, true]
                }, "then", "else"]
        }];
    this.mock(oMetaModel).expects("fetchObject").withExactArgs(sPath + "/0/$If/0/$If/0/$Gt/0/$Path/$").returns(SyncPromise.resolve({ $Type: "Edm.Int32" }));
    this.oLogMock.expects("error").withExactArgs(sMessage, "undefined", "sap.ui.model.odata.AnnotationHelper");
    assert.throws(function () {
        AnnotationHelper.value(vRawValue, { context: oContext });
    }, new SyntaxError(sMessage));
});
QUnit.test("resolve$Path: no $Path, just $P...", function (assert) {
    var sPath = "/Equipments@com.sap.vocabularies.UI.v1.LineItem/4/Value/$Precision", oContext = {
        getPath: function () { return sPath; }
    };
    assert.strictEqual(AnnotationHelper.resolve$Path(oContext), sPath);
});
["", "/@bar"].forEach(function (sSuffix) {
    [
        "/Equipments/@foo/Value/$Path",
        "/Equipments@foo/Value/$Path"
    ].forEach(function (sPath) {
        QUnit.test("resolve$Path: " + sPath + sSuffix, function (assert) {
            var oMetaModel = {
                getObject: function () { }
            }, oContext = {
                getModel: function () { return oMetaModel; },
                getPath: function () { return sPath + sSuffix; }
            };
            this.mock(oMetaModel).expects("getObject").withExactArgs(sPath).returns("EQUIPMENT_2_PRODUCT/Name");
            assert.strictEqual(AnnotationHelper.resolve$Path(oContext), "/Equipments/EQUIPMENT_2_PRODUCT/Name" + sSuffix);
        });
    });
});
["$AnnotationPath", "$NavigationPropertyPath", "$Path", "$PropertyPath"].forEach(function (sName) {
    QUnit.test("resolve$Path: " + sName + " at entity container", function (assert) {
        var oMetaModel = {
            getObject: function () { }
        }, sPath = "/@foo/" + sName + "/@bar", oContext = {
            getModel: function () { return oMetaModel; },
            getPath: function () { return sPath; }
        };
        this.mock(oMetaModel).expects("getObject").withExactArgs("/@foo/" + sName).returns("Me/Name");
        assert.strictEqual(AnnotationHelper.resolve$Path(oContext), "/Me/Name/@bar");
    });
});
QUnit.test("resolve$Path: at property", function (assert) {
    var oMetaModel = {
        getObject: function () { }
    }, sPath = "/Equipments/Category@foo#Q1@foobar#Q2/$Path/@baz", oContext = {
        getModel: function () { return oMetaModel; },
        getPath: function () { return sPath; }
    };
    this.mock(oMetaModel).expects("getObject").withExactArgs("/Equipments/Category@foo#Q1@foobar#Q2/$Path").returns("EQUIPMENT_2_PRODUCT/Name");
    assert.strictEqual(AnnotationHelper.resolve$Path(oContext), "/Equipments/EQUIPMENT_2_PRODUCT/Name/@baz");
});
QUnit.test("resolve$Path: no slash after $Path", function (assert) {
    var oMetaModel = {
        getObject: function () { }
    }, sPath = "/Equipments/Category@foo/$Path@bar", oContext = {
        getModel: function () { return oMetaModel; },
        getPath: function () { return sPath; }
    };
    this.mock(oMetaModel).expects("getObject").withExactArgs("/Equipments/Category@foo/$Path").returns("EQUIPMENT_2_PRODUCT/Name");
    assert.strictEqual(AnnotationHelper.resolve$Path(oContext), "/Equipments/EQUIPMENT_2_PRODUCT/Name@bar");
});
["$NavigationPropertyPath", "$Path", "$PropertyPath"].forEach(function (sName) {
    QUnit.test("resolve$Path: multiple " + sName, function (assert) {
        var oMetaModel = {
            getObject: function () { }
        }, oMetaModelMock = this.mock(oMetaModel), sPath = "/Equipments@foo/" + sName + "@bar/" + sName + "/@baz", oContext = {
            getModel: function () { return oMetaModel; },
            getPath: function () { return sPath; }
        };
        oMetaModelMock.expects("getObject").withExactArgs("/Equipments@foo/" + sName).returns("EQUIPMENT_2_PRODUCT/ID");
        oMetaModelMock.expects("getObject").withExactArgs("/Equipments/EQUIPMENT_2_PRODUCT/ID@bar/" + sName).returns("PRODUCT_2_SUPPLIER/Supplier_Name");
        assert.strictEqual(AnnotationHelper.resolve$Path(oContext), "/Equipments/EQUIPMENT_2_PRODUCT/PRODUCT_2_SUPPLIER/Supplier_Name/@baz");
    });
});
[
    "/Equipments/@com.sap.vocabularies.UI.v1.Facets/0/Target/$AnnotationPath",
    "/Equipments@com.sap.vocabularies.UI.v1.Facets/0/Target/$AnnotationPath"
].forEach(function (sPath) {
    QUnit.test("resolve$Path: " + sPath, function (assert) {
        var oMetaModel = {
            getObject: function () { }
        }, oContext = {
            getModel: function () { return oMetaModel; },
            getPath: function () { return sPath; }
        };
        this.mock(oMetaModel).expects("getObject").withExactArgs(sPath).returns("EQUIPMENT_2_PRODUCT/@com.sap.vocabularies.Common.v1.QuickInfo");
        assert.strictEqual(AnnotationHelper.resolve$Path(oContext), "/Equipments/EQUIPMENT_2_PRODUCT/@com.sap.vocabularies.Common.v1.QuickInfo");
    });
});
QUnit.test("resolve$Path: resulting path is equivalent", function (assert) {
    var oMetaModel = new ODataMetaModel(), sPath = "/EMPLOYEES/@UI.Facets/2/Target/$AnnotationPath/", oContext = {
        getModel: function () { return oMetaModel; },
        getPath: function () { return sPath; }
    };
    this.mock(oMetaModel).expects("fetchEntityContainer").atLeast(1).returns(SyncPromise.resolve(mScope));
    assert.strictEqual(oMetaModel.getObject(AnnotationHelper.resolve$Path(oContext)), oMetaModel.getObject(sPath));
});
QUnit.test("resolve$Path: empty $Path resolves to entity container", function (assert) {
    var oMetaModel = {
        getObject: function () { }
    }, sPath = "/@foo/$Path@bar", oContext = {
        getModel: function () { return oMetaModel; },
        getPath: function () { return sPath; }
    };
    this.mock(oMetaModel).expects("getObject").withExactArgs("/@foo/$Path").returns("");
    assert.strictEqual(AnnotationHelper.resolve$Path(oContext), "/@bar");
});
QUnit.test("resolve$Path: empty $Path resolves to entity set", function (assert) {
    var oMetaModel = {
        getObject: function () { }
    }, sPath = "/Equipments@foo/$Path@bar", oContext = {
        getModel: function () { return oMetaModel; },
        getPath: function () { return sPath; }
    };
    this.mock(oMetaModel).expects("getObject").withExactArgs("/Equipments@foo/$Path").returns("");
    assert.strictEqual(AnnotationHelper.resolve$Path(oContext), "/Equipments@bar");
});
QUnit.test("resolve$Path: empty $Path resolves to entity type", function (assert) {
    var oMetaModel = {
        getObject: function () { }
    }, sPath = "/Equipments/@foo/$Path@bar", oContext = {
        getModel: function () { return oMetaModel; },
        getPath: function () { return sPath; }
    };
    this.mock(oMetaModel).expects("getObject").withExactArgs("/Equipments/@foo/$Path").returns("");
    assert.strictEqual(AnnotationHelper.resolve$Path(oContext), "/Equipments/@bar");
});
QUnit.test("resolve$Path: empty $Path resolves to enclosing type", function (assert) {
    var oMetaModel = {
        getObject: function () { }
    }, sPath = "/Equipments/Category@foo/$Path@bar", oContext = {
        getModel: function () { return oMetaModel; },
        getPath: function () { return sPath; }
    };
    this.mock(oMetaModel).expects("getObject").withExactArgs("/Equipments/Category@foo/$Path").returns("");
    assert.strictEqual(AnnotationHelper.resolve$Path(oContext), "/Equipments/@bar");
});
[undefined, null, false, true, 0, 1, {}, ["a"]].forEach(function (vValue) {
    var sTitle = "resolve$Path: cannot resolve path, unexpected value " + vValue;
    QUnit.test(sTitle, function (assert) {
        var oMetaModel = {
            getObject: function () { }
        }, sPath = "/@foo/$Path/@bar", oContext = {
            getModel: function () { return oMetaModel; },
            getPath: function () { return sPath; }
        };
        this.mock(oMetaModel).expects("getObject").withExactArgs("/@foo/$Path").returns(vValue);
        assert.throws(function () {
            AnnotationHelper.resolve$Path(oContext);
        }, new Error("Cannot resolve /@foo/$Path due to unexpected value " + vValue));
    });
});
[{
        sInput: "/tea_busi.Worker/ID@Common.Text/$Path@Common.Label",
        sOutput: "/tea_busi.Worker/Name@Common.Label"
    }].forEach(function (oFixture) {
    var sPath = oFixture.sInput;
    QUnit.test("resolve$Path: " + sPath, function (assert) {
        var oMetaModel = new ODataMetaModel(), oContext = {
            getModel: function () { return oMetaModel; },
            getPath: function () { return sPath; }
        }, sResolvedPath;
        this.mock(oMetaModel).expects("fetchEntityContainer").atLeast(1).returns(SyncPromise.resolve(mScope));
        assert.notStrictEqual(oMetaModel.getObject(sPath), undefined, "sanity check");
        sResolvedPath = AnnotationHelper.resolve$Path(oContext);
        assert.strictEqual(sResolvedPath, oFixture.sOutput);
        assert.strictEqual(oMetaModel.getObject(sResolvedPath), oMetaModel.getObject(sPath));
    });
});