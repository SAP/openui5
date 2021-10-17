import Log from "sap/base/Log";
import _Parser from "sap/ui/model/odata/v4/lib/_Parser";
import _Requestor from "sap/ui/model/odata/v4/lib/_Requestor";
import TestUtils from "sap/ui/test/TestUtils";
function parseAndRebuild(assert, sFilter, oExpectedSyntaxTree, sResultingFilter) {
    var oSyntaxTree = _Parser.parseFilter(sFilter);
    TestUtils.deepContains(oSyntaxTree, oExpectedSyntaxTree, "parse " + sFilter);
    assert.strictEqual(_Parser.buildFilterString(oSyntaxTree), sResultingFilter || sFilter, "rebuild " + sFilter);
}
QUnit.module("sap.ui.model.odata.v4.lib._Parser", {
    beforeEach: function () {
        this.oLogMock = this.mock(Log);
        this.oLogMock.expects("warning").never();
        this.oLogMock.expects("error").never();
    }
});
[{
        string: "SO_2_BP",
        parsed: { "SO_2_BP": null }
    }, {
        string: "SO_2_BP/BP_2_CONTACTS,SO_2_S\u00D6ITEM,\u0115",
        parsed: { "SO_2_BP/BP_2_CONTACTS": null, "SO_2_S\u00D6ITEM": null, "\u0115": null }
    }, {
        string: "SO_2_BP($expand=BP_2_CONTACT)",
        parsed: { "SO_2_BP": { "$expand": { "BP_2_CONTACT": null } } }
    }, {
        string: "SO_2_BP($expand=BP_2_CONTACT;$select=BusinessPartnerID;$skip=0;$top=10)",
        parsed: {
            "SO_2_BP": {
                "$expand": {
                    "BP_2_CONTACT": null
                },
                "$select": ["BusinessPartnerID"],
                "$skip": "0",
                "$top": "10"
            }
        }
    }, {
        string: "SO_2_BP($select=*;$levels=max)",
        parsed: { "SO_2_BP": { "$select": ["*"], "$levels": "max" } }
    }, {
        string: "*",
        parsed: { "*": null }
    }, {
        string: "*($levels=42)",
        parsed: { "*": { "$levels": "42" } }
    }, {
        string: "*($levels=max)",
        parsed: { "*": { "$levels": "max" } }
    }, {
        string: "*/$ref",
        parsed: { "*/$ref": null }
    }, {
        string: "foo/$ref($search=bar)",
        parsed: { "foo/$ref": { "$search": "bar" } }
    }, {
        string: "foo/$count($search=bar)",
        parsed: { "foo/$count": { "$search": "bar" } }
    }].forEach(function (oFixture) {
    QUnit.test("_Parser: $expand=" + oFixture.string, function (assert) {
        assert.deepEqual(_Parser.parseSystemQueryOption("$expand=" + oFixture.string), { "$expand": oFixture.parsed });
        assert.deepEqual(_Requestor.create("/~/").convertQueryOptions("Foo", { "$expand": oFixture.parsed }), { "$expand": oFixture.string });
    });
});
[{
        string: "SalesOrderID",
        parsed: ["SalesOrderID"]
    }, {
        string: "Address/City",
        parsed: ["Address/City"]
    }, {
        string: "*",
        parsed: ["*"]
    }, {
        string: "*,name.space.Action",
        parsed: ["*", "name.space.Action"]
    }, {
        string: "name.space.Action,*",
        parsed: ["name.space.Action", "*"]
    }, {
        string: "SalesOrderID,Note,name.space.Action",
        parsed: ["SalesOrderID", "Note", "name.space.Action"]
    }, {
        string: "name.space.Function(parameter)",
        parsed: ["name.space.Function(parameter)"]
    }, {
        string: "name.space.Function(parameter1,parameter2)",
        parsed: ["name.space.Function(parameter1,parameter2)"]
    }, {
        string: "name.space.*",
        parsed: ["name.space.*"]
    }].forEach(function (oFixture) {
    QUnit.test("_Parser: $select=" + oFixture.string, function (assert) {
        assert.deepEqual(_Parser.parseSystemQueryOption("$select=" + oFixture.string), { "$select": oFixture.parsed });
        assert.deepEqual(_Requestor.create("/~/").convertQueryOptions("Foo", { "$select": oFixture.parsed }), { "$select": oFixture.string });
    });
});
var mValuesForOption = {
    "$filter": [
        "SalesOrderID eq 1",
        "DeliveryDate gt 2016-04-23",
        "CreatedAt eq 2016-01-13T14:08:31Z",
        "CreatedAt eq 2016-01-13T14:08:31+01:30",
        "CreatedAt eq 2016-01-13T14:08:31-01:30",
        "Delivered eq true",
        "Delivered eq false",
        "Value eq null",
        "Offset eq -1",
        "Offset eq +1",
        "Description eq ''",
        "Description eq 'foo'",
        "Description eq 'foo''bar'",
        "Description eq ';'",
        "Description eq '('",
        "Description eq ')'",
        "Description eq ','",
        "Description eq '='",
        "Description eq ' '",
        "Credit gt 2345.43",
        "Credit lt -2345.43",
        "Time eq 13:48",
        "Time eq 13:48:39",
        "Time eq 13:48:39.439",
        "Guid eq 0050568D-393C-1ED4-9D97-E65F0F3FCC23",
        "Double eq 1.5e24",
        "Double eq -1.5e+24",
        "Double eq 1.5e-24",
        "Double eq -INF",
        "Binary eq binary'_49s59TfTeDRTw495E-582D59g=='",
        "Duration eq duration'P10D'",
        "Duration eq duration'-P5D10H34M24.960S'",
        "Enum eq name.space.MyEnumeration'Value1'",
        "Enum eq name.space.MyEnumeration'Value1,Value2'",
        "Geo eq geography'SRID=59403;Point(49 7)'",
        "Geo eq geometry'SRID=59403;Point(49 7)'",
        "contains(Supplier/Name,'SAP')",
        "foo(bar,baz)",
        "name.space.foo(bar,baz)",
        "(SO_2_BP/CompanyName eq 'SAP' and GrossAmount le 12345) and (GrossAmount ge 1000)",
        "((p1 eq 'v1') or (p2 eq 'v2' and contains( p3 , 'v3' ))) and p4 eq 'v4'",
        "$root/Me",
        "$root/Foo(key='va''lue')/bar",
        "startswith($it, 'T')",
        "$it/member"
    ],
    "$orderby": [
        "SalesOrderID",
        "SalesOrder/ID,GrossAmount desc",
        "SalesOrderID asc,GrossAmount",
        "name.space.func(';') mod foo/bar asc"
    ],
    "$count": ["false", "true"],
    "$search": [
        "blue",
        "blue OR green",
        "( NOT \"foo;bar\" OR b\u00E4r ) AND \"b\u00E4\\\"z\"",
        "( NOT (NOT \"foo;bar\") OR b\u00E4r) AND \"b\u00E4z\\\\\""
    ]
};
Object.keys(mValuesForOption).forEach(function (sOption) {
    mValuesForOption[sOption].forEach(function (sValue) {
        QUnit.test("_Parser: " + sOption + "=" + sValue, function (assert) {
            var sAssignment = sOption + "=" + sValue, oExpand = {
                "$select": ["*"]
            }, oRequestor = _Requestor.create("/~/"), oResult = {};
            oResult[sOption] = sValue;
            oExpand[sOption] = sValue;
            assert.deepEqual(_Parser.parseSystemQueryOption(sAssignment), oResult, "standalone");
            assert.deepEqual(_Parser.parseSystemQueryOption("$expand=foo(" + sAssignment + ")"), {
                "$expand": {
                    "foo": oResult
                }
            }, "as only/last option in an expand, terminated by ')'");
            assert.deepEqual(oRequestor.convertQueryOptions("Foo", {
                "$expand": {
                    "foo": oResult
                }
            }), { "$expand": "foo(" + sAssignment + ")" });
            assert.deepEqual(_Parser.parseSystemQueryOption("$expand=foo(" + sAssignment + ";$select=*)"), {
                "$expand": {
                    "foo": oExpand
                }
            }, "as first/inner option in an expand, terminated by ';'");
            assert.deepEqual(oRequestor.convertQueryOptions("Foo", {
                "$expand": {
                    "foo": oExpand
                }
            }), { "$expand": "foo($select=*;" + sAssignment + ")" });
        });
    });
});
[{
        string: "foo",
        error: "Expected system query option but instead saw 'foo' at 1"
    }, {
        string: "$expand",
        error: "Expected '=' but instead saw end of input"
    }, {
        string: "$expand)",
        error: "Expected '=' but instead saw ')' at 8"
    }, {
        string: "",
        error: "Expected system query option but instead saw end of input"
    }, {
        string: "$expand=SO_2_BP;",
        error: "Expected end of input but instead saw ';' at 16"
    }, {
        string: "$expand=SO_2_BP(#orderby=ID)",
        error: "Unknown character '#' at 17"
    }, {
        string: "*",
        error: "Expected system query option but instead saw '*' at 1"
    }, {
        string: "$filter=(p eq 'v'",
        error: "Expected ')' but instead saw end of input"
    }, {
        string: "$expand=foo($filter=(p eq 'v';select=*)",
        error: "Expected ')' but instead saw ';' at 30"
    }, {
        string: "$expand=foo($filter=(p eq 'v'),bar",
        error: "Expected ')' but instead saw end of input"
    }, {
        string: "$count=",
        error: "Expected an option value but instead saw end of input"
    }, {
        string: "$expand=",
        error: "Expected PATH but instead saw end of input"
    }, {
        string: "$search=(a and 'b'",
        error: "Expected ')' but instead saw end of input"
    }, {
        string: "$expand=foo($search=(a and 'b';select=*)",
        error: "Expected ')' but instead saw ';' at 31"
    }, {
        string: "$expand=foo($search=(a and 'b'%3bselect=*)",
        error: "Expected ')' but instead saw '%3b' at 31"
    }, {
        string: "$search=\"foo",
        error: "Unterminated string at 9"
    }, {
        string: "$filter=a eq 'foo",
        error: "Unterminated string at 14"
    }, {
        string: "$select=a, b",
        error: "Expected PATH but instead saw ' ' at 11"
    }, {
        string: "$expand=foo  eq 'bar'",
        error: "Expected end of input but instead saw 'eq' at 14"
    }, {
        string: "$expand=foo\teq%09'bar'",
        error: "Expected end of input but instead saw 'eq' at 13"
    }, {
        string: "$expand=foo%09eq\t'bar'",
        error: "Expected end of input but instead saw 'eq' at 15"
    }, {
        string: "$expand=foo%20eq%20'bar'",
        error: "Expected end of input but instead saw 'eq' at 15"
    }].forEach(function (oFixture) {
    QUnit.test("_Parser: " + oFixture.string, function (assert) {
        assert.throws(function () {
            _Parser.parseSystemQueryOption(oFixture.string);
        }, new SyntaxError(oFixture.error + ": " + oFixture.string));
    });
});
QUnit.test("parseExpand: examples", function (assert) {
    [{
            string: "SO_2_BP," + "SO_2_SOITEM($expand=SOITEM_2_PRODUCT($expand=PRODUCT_2_BP;$select=ID,Name))",
            parsed: {
                "SO_2_BP": null,
                "SO_2_SOITEM": {
                    "$expand": {
                        "SOITEM_2_PRODUCT": {
                            "$expand": {
                                "PRODUCT_2_BP": null
                            },
                            "$select": ["ID", "Name"]
                        }
                    }
                }
            }
        }, {
            string: "TEAM_2_EMPLOYEES($expand=EMPLOYEE_2_EQUIPMENTS),TEAM_2_MANAGER",
            parsed: {
                "TEAM_2_EMPLOYEES": {
                    "$expand": {
                        "EMPLOYEE_2_EQUIPMENTS": null
                    }
                },
                "TEAM_2_MANAGER": null
            }
        }].forEach(function (oFixture) {
        assert.deepEqual(_Parser.parseSystemQueryOption("$expand=" + oFixture.string), { "$expand": oFixture.parsed }, oFixture.string);
    });
});
QUnit.test("_Parser: %-encoding", function (assert) {
    [{
            string: "$select=a%2Cb%2cc,d,e.%2a",
            parsed: { "$select": ["a", "b", "c", "d", "e.*"] },
            converted: { "$select": "a,b,c,d,e.*" }
        }, {
            string: "$select=%2a",
            parsed: { "$select": ["*"] },
            converted: { "$select": "*" }
        }, {
            string: "$select=%2A",
            parsed: { "$select": ["*"] },
            converted: { "$select": "*" }
        }, {
            string: "$expand=%2a",
            parsed: { "$expand": { "*": null } },
            converted: { "$expand": "*" }
        }, {
            string: "$expand=%2a/$ref",
            parsed: { "$expand": { "*/$ref": null } },
            converted: { "$expand": "*/$ref" }
        }, {
            string: "$expand=foo/%2A",
            parsed: { "$expand": { "foo/*": null } },
            converted: { "$expand": "foo/*" }
        }, {
            string: "$filter=foo eq %2b1e%2B10",
            parsed: { "$filter": "foo eq %2b1e%2B10" },
            converted: { "$filter": "foo eq %2b1e%2B10" }
        }, {
            string: "$filter=foo eq %27a%27%27%27",
            parsed: { "$filter": "foo eq %27a%27%27%27" },
            converted: { "$filter": "foo eq %27a%27%27%27" }
        }, {
            string: "$expand=foo%28$filter=a%20eq%20%27b;%27%3b$orderby=c%20desc%3B$count=true%29",
            parsed: {
                "$expand": {
                    "foo": {
                        "$filter": "a%20eq%20%27b;%27",
                        "$orderby": "c%20desc",
                        "$count": "true"
                    }
                }
            },
            converted: { "$expand": "foo($filter=a%20eq%20%27b;%27;$orderby=c%20desc;$count=true)" }
        }, {
            string: "$filter=((foo eq ''%29   and %28bar gt 1%29%29",
            parsed: { "$filter": "((foo eq ''%29   and %28bar gt 1%29%29" },
            converted: { "$filter": "((foo eq ''%29   and %28bar gt 1%29%29" }
        }, {
            string: "$search=%22foo%5c%22bar%5C\\baz%22",
            parsed: { "$search": "%22foo%5c%22bar%5C\\baz%22" },
            converted: { "$search": "%22foo%5c%22bar%5C\\baz%22" }
        }, {
            string: "$search=%22foo%5c%22bar%5C\\baz%%22",
            parsed: { "$search": "%22foo%5c%22bar%5C\\baz%%22" },
            converted: { "$search": "%22foo%5c%22bar%5C\\baz%%22" }
        }].forEach(function (oFixture) {
        assert.deepEqual(_Parser.parseSystemQueryOption(oFixture.string), oFixture.parsed, oFixture.string);
        assert.deepEqual(_Requestor.create("/~/").convertQueryOptions("Foo", oFixture.parsed), oFixture.converted, JSON.stringify(oFixture.converted));
    });
});
["eq", "ge", "gt", "le", "lt", "ne"].forEach(function (sOperator) {
    QUnit.test("parseFilter: operator=" + sOperator, function (assert) {
        parseAndRebuild(assert, "foo " + sOperator + " 'bar'", {
            id: sOperator,
            value: " " + sOperator + " ",
            type: "Edm.Boolean",
            at: 5,
            left: {
                id: "PATH",
                value: "foo",
                at: 1
            },
            right: {
                id: "VALUE",
                value: "'bar'",
                at: 8
            }
        });
        parseAndRebuild(assert, "'bar' " + sOperator + " foo", {
            id: sOperator,
            value: " " + sOperator + " ",
            type: "Edm.Boolean",
            at: 7,
            left: {
                id: "VALUE",
                value: "'bar'",
                at: 1
            },
            right: {
                id: "PATH",
                value: "foo",
                at: 10
            }
        });
    });
});
QUnit.test("parseFilter: String constants", function (assert) {
    ["'bar'", "'ba''r'", "'ba%27'r'", "'ba'%27r'", "'ba%27%27r'"].forEach(function (sValue) {
        assert.strictEqual(_Parser.buildFilterString(_Parser.parseFilter(sValue)), sValue, sValue);
    });
});
[{
        string: "foo eq bar ne baz",
        parsed: {
            id: "ne",
            left: {
                id: "eq",
                left: { value: "foo" },
                right: { value: "bar" }
            },
            right: { value: "baz" }
        }
    }, {
        string: "foo eq '1' and bar gt 2",
        parsed: {
            id: "and",
            left: {
                id: "eq",
                left: { value: "foo" },
                right: { value: "'1'" }
            },
            right: {
                id: "gt",
                left: { value: "bar" },
                right: { value: "2" }
            }
        }
    }, {
        string: "not foo",
        parsed: {
            id: "not",
            right: { value: "foo" }
        }
    }, {
        string: "not%20foo and%20bar",
        parsed: {
            id: "and",
            left: {
                id: "not",
                right: { value: "foo" }
            },
            right: { value: "bar" }
        }
    }, {
        string: "not  (foo  and  bar)",
        parsed: {
            id: "not",
            right: {
                id: "and",
                left: { value: "foo" },
                right: { value: "bar" }
            }
        }
    }, {
        string: "foo and not bar",
        parsed: {
            id: "and",
            left: { value: "foo" },
            right: {
                id: "not",
                right: { value: "bar" }
            }
        }
    }, {
        string: "foo and ( \t bar or baz %09%20 )",
        parsed: {
            id: "and",
            left: { value: "foo" },
            right: {
                id: "or",
                left: { value: "bar" },
                right: { value: "baz" }
            }
        },
        converted: "foo and (bar or baz)"
    }, {
        string: "trim(foo)",
        parsed: {
            id: "FUNCTION",
            value: "trim",
            type: "Edm.String",
            parameters: [{ value: "foo" }]
        }
    }, {
        string: "concat(foo,bar)",
        parsed: {
            id: "FUNCTION",
            value: "concat",
            type: "Edm.String",
            parameters: [{ value: "foo" }, { value: "bar" }]
        }
    }, {
        string: "concat( foo , bar )",
        parsed: {
            id: "FUNCTION",
            value: "concat",
            parameters: [{ value: "foo" }, { value: "bar" }]
        },
        converted: "concat(foo,bar)"
    }, {
        string: "concat(trim(foo),bar)",
        parsed: {
            id: "FUNCTION",
            value: "concat",
            parameters: [{
                    id: "FUNCTION",
                    value: "trim",
                    parameters: [{ value: "foo" }]
                }, {
                    value: "bar"
                }]
        }
    }, {
        string: "not startswith(foo,'bar')",
        parsed: {
            id: "not",
            type: "Edm.Boolean",
            right: {
                id: "FUNCTION",
                value: "startswith",
                type: "Edm.Boolean",
                parameters: [{ value: "foo" }, { value: "'bar'" }]
            }
        }
    }, {
        string: "endswith(foo,bar)",
        parsed: {
            id: "FUNCTION",
            value: "endswith",
            type: "Edm.Boolean",
            parameters: [{ value: "foo" }, { value: "bar" }]
        }
    }, {
        string: "indexof(foo,bar)",
        parsed: {
            id: "FUNCTION",
            value: "indexof",
            type: "Edm.Int32",
            parameters: [{ value: "foo" }, { value: "bar" }]
        }
    }, {
        string: "length(foo)",
        parsed: {
            id: "FUNCTION",
            value: "length",
            type: "Edm.Int32",
            parameters: [{ value: "foo" }]
        }
    }, {
        string: "substring(foo,bar,baz)",
        parsed: {
            id: "FUNCTION",
            value: "substring",
            type: "Edm.String",
            parameters: [{ value: "foo" }, { value: "bar" }, { value: "baz" }]
        }
    }, {
        string: "tolower(foo)",
        parsed: {
            id: "FUNCTION",
            value: "tolower",
            type: "Edm.String",
            parameters: [{ value: "foo" }]
        }
    }, {
        string: "toupper(foo)",
        parsed: {
            id: "FUNCTION",
            value: "toupper",
            type: "Edm.String",
            parameters: [{ value: "foo" }]
        }
    }, {
        string: "contains(foo,bar)",
        parsed: {
            id: "FUNCTION",
            value: "contains",
            type: "Edm.Boolean",
            parameters: [{ value: "foo" }, { value: "bar" }]
        }
    }, {
        string: "day(foo)",
        parsed: {
            id: "FUNCTION",
            value: "day",
            type: "Edm.Int32",
            parameters: [{ value: "foo", ambiguous: true }]
        }
    }, {
        string: "hour(foo)",
        parsed: {
            id: "FUNCTION",
            value: "hour",
            type: "Edm.Int32",
            parameters: [{ value: "foo", ambiguous: true }]
        }
    }, {
        string: "minute(foo)",
        parsed: {
            id: "FUNCTION",
            value: "minute",
            type: "Edm.Int32",
            parameters: [{ value: "foo", ambiguous: true }]
        }
    }, {
        string: "month(foo)",
        parsed: {
            id: "FUNCTION",
            value: "month",
            type: "Edm.Int32",
            parameters: [{ value: "foo", ambiguous: true }]
        }
    }, {
        string: "second(foo)",
        parsed: {
            id: "FUNCTION",
            value: "second",
            type: "Edm.Int32",
            parameters: [{ value: "foo", ambiguous: true }]
        }
    }, {
        string: "year(foo)",
        parsed: {
            id: "FUNCTION",
            value: "year",
            type: "Edm.Int32",
            parameters: [{ value: "foo", ambiguous: true }]
        }
    }, {
        string: "ceiling(foo)",
        parsed: {
            id: "FUNCTION",
            value: "ceiling",
            parameters: [{ value: "foo", ambiguous: true }]
        }
    }, {
        string: "floor(foo)",
        parsed: {
            id: "FUNCTION",
            value: "floor",
            parameters: [{ value: "foo", ambiguous: true }]
        }
    }, {
        string: "round(foo)",
        parsed: {
            id: "FUNCTION",
            value: "round",
            parameters: [{ value: "foo", ambiguous: true }]
        }
    }].forEach(function (oFixture) {
    QUnit.test("parseFilter: " + oFixture.string, function (assert) {
        parseAndRebuild(assert, oFixture.string, oFixture.parsed, oFixture.converted);
    });
});
[
    { op1: "eq", op2: "ne" },
    { op1: "ge", op2: "gt" },
    { op1: "ge", op2: "le" },
    { op1: "ge", op2: "lt" }
].forEach(function (oFixture) {
    var sTitle = "parseFilter: lpb(" + oFixture.op1 + ") === lpb(" + oFixture.op2 + ")";
    QUnit.test(sTitle, function (assert) {
        parseAndRebuild(assert, "a " + oFixture.op1 + " b " + oFixture.op2 + " c", {
            id: oFixture.op2,
            left: {
                id: oFixture.op1,
                left: { value: "a" },
                right: { value: "b" }
            },
            right: { value: "c" }
        });
        parseAndRebuild(assert, "a " + oFixture.op2 + " b " + oFixture.op1 + " c", {
            id: oFixture.op1,
            left: {
                id: oFixture.op2,
                left: { value: "a" },
                right: { value: "b" }
            },
            right: { value: "c" }
        });
    });
});
[
    { op1: "or", op2: "and" },
    { op1: "and", op2: "eq" },
    { op1: "eq", op2: "ge" }
].forEach(function (oFixture) {
    var sTitle = "parseFilter: lpb(" + oFixture.op1 + ") < lpb(" + oFixture.op2 + ")";
    QUnit.test(sTitle, function (assert) {
        parseAndRebuild(assert, "a " + oFixture.op1 + " b " + oFixture.op2 + " c", {
            id: oFixture.op1,
            left: { value: "a" },
            right: {
                id: oFixture.op2,
                left: { value: "b" },
                right: { value: "c" }
            }
        });
        parseAndRebuild(assert, "a " + oFixture.op2 + " b " + oFixture.op1 + " c", {
            id: oFixture.op1,
            left: {
                id: oFixture.op2,
                left: { value: "a" },
                right: { value: "b" }
            },
            right: { value: "c" }
        });
    });
});
["false", "true", "null"].forEach(function (sLiteral) {
    QUnit.test("parseFilter: literal=" + sLiteral, function (assert) {
        var sFilter = "foo eq " + sLiteral, oSyntaxTree = _Parser.parseFilter(sFilter);
        TestUtils.deepContains(oSyntaxTree, {
            id: "eq",
            value: " eq ",
            at: 5,
            left: {
                id: "PATH",
                value: "foo",
                at: 1
            },
            right: {
                id: "VALUE",
                value: sLiteral,
                at: 8
            }
        });
        assert.strictEqual(_Parser.buildFilterString(oSyntaxTree), sFilter);
    });
});
[{
        string: ";",
        error: "Expected expression but instead saw ';' at 1"
    }, {
        string: "foo='bar'",
        error: "Expected end of input but instead saw '=' at 4"
    }, {
        string: "foo eq",
        error: "Expected end of input but instead saw ' ' at 4"
    }, {
        string: "foo eq ",
        error: "Expected expression but instead saw end of input"
    }, {
        string: "foo eq  ",
        error: "Expected expression but instead saw end of input"
    }, {
        string: "foo and not;",
        error: "Expected end of input but instead saw ';' at 12"
    }, {
        string: "foo and (bar or baz",
        error: "Expected ')' but instead saw end of input"
    }, {
        string: "2()",
        error: "Unexpected '(' at 2"
    }, {
        string: "foo(bar)",
        error: "Unknown function 'foo' at 1"
    }, {
        string: "trim()",
        error: "Expected expression but instead saw ')' at 6"
    }, {
        string: "not(foo and bar)",
        error: "Unknown function 'not' at 1"
    }, {
        string: "foo and(bar or baz)",
        error: "Expected end of input but instead saw ' ' at 4"
    }, {
        string: "(foo and bar)or baz",
        error: "Expected end of input but instead saw 'or' at 14"
    }].forEach(function (oFixture) {
    QUnit.test("_Parser#parseFilter: \"" + oFixture.string + "\"", function (assert) {
        assert.throws(function () {
            _Parser.parseFilter(oFixture.string);
        }, new SyntaxError(oFixture.error + ": " + oFixture.string));
    });
});
QUnit.test("parseKeyPredicate", function (assert) {
    ["false", "true", "3.14", "2016-04-23", "2016-01-13T14:08:31Z", "-1", "'foo'", "'foo''bar'", "'foo/bar'", "F050568D-393C-1ED4-9D97-E65F0F3FCC23"].forEach(function (sValue) {
        var sPredicate = "(" + sValue + ")";
        assert.deepEqual(_Parser.parseKeyPredicate(sPredicate), { "": sValue }, sPredicate);
        sPredicate = "(foo=" + sValue + ")";
        assert.deepEqual(_Parser.parseKeyPredicate(sPredicate), { "foo": sValue }, sPredicate);
        sPredicate = "(foo=" + sValue + ",bar='baz')";
        assert.deepEqual(_Parser.parseKeyPredicate(sPredicate), { "foo": sValue, bar: "'baz'" }, sPredicate);
    });
});