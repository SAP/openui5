import Log from "sap/base/Log";
import AnnotationParser from "sap/ui/model/odata/AnnotationParser";
import TestUtils from "sap/ui/test/TestUtils";
QUnit.module("sap.ui.model.odata.AnnotationParser (AnnotationParserNoFakeService)", {
    beforeEach: function () {
        this.oLogMock = this.mock(Log);
        this.oLogMock.expects("error").never();
        this.oLogMock.expects("warning").never();
    },
    afterEach: function (assert) {
        return TestUtils.awaitRendering();
    }
});
QUnit.test("_parseReferences: sorts aliases by length (no aliases)", function (assert) {
    var oParserData = {
        aliases: {},
        xmlDocument: "~XMLDocument"
    }, oXPath = {
        selectNodes: function () { }
    }, oXPathMock = this.mock(oXPath);
    AnnotationParser._parserData = oParserData;
    AnnotationParser._oXPath = oXPath;
    oXPathMock.expects("selectNodes").withExactArgs("//edmx:Reference/edmx:Include[@Namespace and @Alias]", "~XMLDocument").returns({});
    oXPathMock.expects("selectNodes").withExactArgs("//edmx:Reference[@Uri]/edmx:IncludeAnnotations[@TermNamespace]", "~XMLDocument").returns({});
    assert.strictEqual(AnnotationParser._parseReferences({}), false);
    assert.deepEqual(oParserData.aliasesByLength, []);
    delete AnnotationParser._parserData;
    delete AnnotationParser._oXPath;
});
QUnit.test("_parseReferences: sorts aliases by length (with aliases)", function (assert) {
    var oAliasNode0 = { getAttribute: function () { } }, oAliasNode0Mock = this.mock(oAliasNode0), oAliasNode1 = { getAttribute: function () { } }, oAliasNode1Mock = this.mock(oAliasNode1), oAliasNode2 = { getAttribute: function () { } }, oAliasNode2Mock = this.mock(oAliasNode2), oAliasNodes = { length: 3 }, oParserData = {
        aliases: {},
        xmlDocument: "~XMLDocument"
    }, oXPath = {
        nextNode: function () { },
        selectNodes: function () { }
    }, oXPathMock = this.mock(oXPath);
    AnnotationParser._parserData = oParserData;
    AnnotationParser._oXPath = oXPath;
    oXPathMock.expects("selectNodes").withExactArgs("//edmx:Reference/edmx:Include[@Namespace and @Alias]", "~XMLDocument").returns(oAliasNodes);
    oXPathMock.expects("nextNode").withExactArgs(sinon.match.same(oAliasNodes), 0).returns(oAliasNode0);
    oAliasNode0Mock.expects("getAttribute").withExactArgs("Alias").returns("Foo");
    oAliasNode0Mock.expects("getAttribute").withExactArgs("Namespace").returns("com.sap.foo");
    oXPathMock.expects("nextNode").withExactArgs(sinon.match.same(oAliasNodes), 1).returns(oAliasNode1);
    oAliasNode1Mock.expects("getAttribute").withExactArgs("Alias").returns("FooBar");
    oAliasNode1Mock.expects("getAttribute").withExactArgs("Namespace").returns("com.sap.foo.bar");
    oXPathMock.expects("nextNode").withExactArgs(sinon.match.same(oAliasNodes), 2).returns(oAliasNode2);
    oAliasNode2Mock.expects("getAttribute").withExactArgs("Alias").returns("Bazz");
    oAliasNode2Mock.expects("getAttribute").withExactArgs("Namespace").returns("com.sap.bazz");
    oXPathMock.expects("selectNodes").withExactArgs("//edmx:Reference[@Uri]/edmx:IncludeAnnotations[@TermNamespace]", "~XMLDocument").returns({});
    assert.strictEqual(AnnotationParser._parseReferences({}), true);
    assert.deepEqual(oParserData.aliasesByLength, ["FooBar", "Bazz", "Foo"]);
    assert.deepEqual(oParserData.aliases, {
        Bazz: "com.sap.bazz",
        Foo: "com.sap.foo",
        FooBar: "com.sap.foo.bar"
    });
    delete AnnotationParser._parserData;
    delete AnnotationParser._oXPath;
});
[{
        _parserData: { aliases: {}, aliasesByLength: [] },
        sValue: "~value",
        sResult: "~value"
    }, {
        _parserData: { aliases: { foo: "bar" }, aliasesByLength: ["foo"] },
        sValue: "foo.Value",
        sResult: "bar.Value"
    }, {
        _parserData: { aliases: { foo: "bar" }, aliasesByLength: ["foo"] },
        sValue: "my.foo.Value",
        sResult: "my.foo.Value"
    }, {
        _parserData: { aliases: { foo: "bar", zfoo: "baz" }, aliasesByLength: ["zfoo", "foo"] },
        sValue: "zfoo.Value",
        sResult: "baz.Value"
    }, {
        _parserData: {
            aliases: { foo: "bar", zfoo: "baz" },
            aliasesByLength: ["foo", "zfoo"]
        },
        sValue: "zfoo.Value",
        sResult: "zbar.Value"
    }].forEach(function (oFixture) {
    var sTitle = "replaceWithAlias: " + oFixture.sValue + " -> " + oFixture.sResult;
    QUnit.test(sTitle, function (assert) {
        AnnotationParser._parserData = oFixture._parserData;
        assert.strictEqual(AnnotationParser.replaceWithAlias(oFixture.sValue), oFixture.sResult);
        delete AnnotationParser._parserData;
    });
});