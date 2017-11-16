/*!
 * ${copyright}
 */
sap.ui.require([
	"jquery.sap.global",
	"sap/ui/model/odata/v4/lib/_Parser",
	"sap/ui/model/odata/v4/lib/_Requestor"
], function (jQuery, _Parser, _Requestor) {
	/*global QUnit, sinon */
	/*eslint no-warning-comments: 0 */
	"use strict";

	//*********************************************************************************************
	QUnit.module("sap.ui.model.odata.v4.lib._Parser", {
		beforeEach : function () {
			this.oLogMock = sinon.mock(jQuery.sap.log);
			this.oLogMock.expects("warning").never();
			this.oLogMock.expects("error").never();
		},

		afterEach : function () {
			this.oLogMock.verify();
		}
	});

	//*********************************************************************************************
	[{
		string : "SO_2_BP",
		parsed : {"SO_2_BP" : null}
	}, {
		string : "SO_2_BP/BP_2_CONTACTS,SO_2_SÖITEM,ĕ",
		parsed : {"SO_2_BP/BP_2_CONTACTS" : null, "SO_2_SÖITEM" : null, "ĕ" : null}
	}, {
		string : "SO_2_BP($expand=BP_2_CONTACT)",
		parsed : {"SO_2_BP" : {"$expand" : {"BP_2_CONTACT" : null}}}
	}, {
		string : "SO_2_BP($expand=BP_2_CONTACT;$select=BusinessPartnerID;$skip=0;$top=10)",
		parsed : {
			"SO_2_BP" : {
				"$expand" : {
					"BP_2_CONTACT" : null
				},
				"$select" : ["BusinessPartnerID"],
				"$skip" : "0",
				"$top" : "10"
			}
		}
	}, {
		string : "SO_2_BP($select=*;$levels=max)",
		parsed : {"SO_2_BP" : {"$select" : ["*"], "$levels" : "max"}}
	}, {
		string : "*",
		parsed : {"*" : null}
	}, {
		string : "*($levels=42)",
		parsed : {"*" : {"$levels" : "42"}}
	}, {
		string : "*($levels=max)",
		parsed : {"*" : {"$levels" : "max"}}
	}, {
		string : "*/$ref",
		parsed : {"*/$ref" : null}
	}, {
		string : "foo/$ref($search=bar)",
		parsed : {"foo/$ref" : {"$search" : "bar"}}
	}, {
		string : "foo/$count($search=bar)",
		parsed : {"foo/$count" : {"$search" : "bar"}}
	}].forEach(function (oFixture) {
		QUnit.test("_Parser: $expand=" + oFixture.string, function (assert) {
			assert.deepEqual(_Parser.parseSystemQueryOption("$expand=" + oFixture.string),
				{"$expand" : oFixture.parsed});
			// verify that the parsed result is consumable
			assert.deepEqual(_Requestor.create("/~/")
					.convertQueryOptions("Foo", {"$expand" : oFixture.parsed}),
				{"$expand" : oFixture.string});
		});
	});

	//*********************************************************************************************
	[{
		string : "SalesOrderID",
		parsed : ["SalesOrderID"]
	}, {
		string : "Address/City",
		parsed : ["Address/City"]
	}, {
		string : "*",
		parsed : ["*"]
	}, {
		string : "*,name.space.Action",
		parsed : ["*", "name.space.Action"]
	}, {
		string : "name.space.Action,*",
		parsed : ["name.space.Action", "*"]
	}, {
		string : "SalesOrderID,Note,name.space.Action",
		parsed : ["SalesOrderID", "Note", "name.space.Action"]
	}, {
		string : "name.space.Function(parameter)",
		parsed : ["name.space.Function(parameter)"]
	}, {
		string : "name.space.Function(parameter1,parameter2)",
		parsed : ["name.space.Function(parameter1,parameter2)"]
	}, {
		string : "name.space.*",
		parsed : ["name.space.*"]
	}].forEach(function (oFixture) {
		QUnit.test("_Parser: $select=" + oFixture.string, function (assert) {
			assert.deepEqual(_Parser.parseSystemQueryOption("$select=" + oFixture.string),
					{"$select" : oFixture.parsed});
			// verify that the parsed result is consumable
			assert.deepEqual(_Requestor.create("/~/")
					.convertQueryOptions("Foo", {"$select" : oFixture.parsed}),
				{"$select" : oFixture.string});
		});
	});

	//*********************************************************************************************
	var mValuesForOption = {
			"$filter" : [
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
				"foo(bar,baz)", // see that the actual names do not matter
				"name.space.foo(bar,baz)",
				"(SO_2_BP/CompanyName eq 'SAP' and GrossAmount le 12345) and (GrossAmount ge 1000)",
				"((p1 eq 'v1') or (p2 eq 'v2' and contains( p3 , 'v3' ))) and p4 eq 'v4'",
				"$root/Me",
				"$root/Foo(key='va''lue')/bar",
				"startswith($it, 'T')",
				"$it/member"
			],
			"$orderby" : [
				"SalesOrderID",
				"SalesOrder/ID,GrossAmount desc",
				"SalesOrderID asc,GrossAmount",
				"name.space.func(';') mod foo/bar asc" // ABNF: orderbyItem may be an expression
			],
			"$count" : ["false", "true"],
			"$search" : [
				"blue",
				"blue OR green",
				'( NOT "foo;bar" OR bär ) AND "bä\\"z"',
				'( NOT (NOT "foo;bar") OR bär) AND "bäz\\\\"'
			]
		};

	Object.keys(mValuesForOption).forEach(function (sOption) {
		mValuesForOption[sOption].forEach(function (sValue) {
			QUnit.test("_Parser: " + sOption + "=" + sValue, function (assert) {
				var sAssignment = sOption + "=" + sValue,
					oExpand = {
						"$select" : ["*"]
					},
					oRequestor = _Requestor.create("/~/"),
					oResult = {};

				oResult[sOption] = sValue;
				oExpand[sOption] = sValue;
				assert.deepEqual(_Parser.parseSystemQueryOption(sAssignment), oResult,
					"standalone");

				assert.deepEqual(
					_Parser.parseSystemQueryOption("$expand=foo(" + sAssignment + ")"), {
						"$expand" : {
							"foo" : oResult
						}
					},
					"as only/last option in an expand, terminated by ')'");
				// verify that the parsed result is consumable
				assert.deepEqual(
					oRequestor.convertQueryOptions("Foo", {
						"$expand" : {
							"foo" : oResult
						}
					}),
					{"$expand" : "foo(" + sAssignment + ")"});

				assert.deepEqual(
					_Parser.parseSystemQueryOption(
						"$expand=foo(" + sAssignment + ";$select=*)"), {
						"$expand" : {
							"foo" : oExpand
						}
					},
					"as first/inner option in an expand, terminated by ';'");
				// verify that the parsed result is consumable
				assert.deepEqual(
					oRequestor.convertQueryOptions("Foo", {
						"$expand" : {
							"foo" : oExpand
						}
					}),
					// Note: We added $select to oExpand before sOption
					{"$expand" : "foo($select=*;" + sAssignment + ")"});
			});
		});
	});

	//*********************************************************************************************
	[{
		string : "foo",
		error : "Expected system query option but instead saw 'foo' at 1"
	}, {
		string : "$expand",
		error : "Expected '=' but instead saw end of input"
	}, {
		string : "$expand)",
		error : "Expected '=' but instead saw ')' at 8"
	}, {
		string : "",
		error : "Expected system query option but instead saw end of input"
	}, {
		string : "$expand=SO_2_BP;",
		error : "Expected end of input but instead saw ';' at 16"
	}, {
		string : "$expand=SO_2_BP(#orderby=ID)",
		error : "Unknown character '#' at 17"
	}, {
		string : "*",
		error : "Expected system query option but instead saw '*' at 1"
	}, {
		string : "$filter=(p eq 'v'",
		error : "Expected ')' but instead saw end of input"
	}, {
		string : "$expand=foo($filter=(p eq 'v';select=*)",
		error : "Expected ')' but instead saw ';' at 30"
	}, {
		string : "$expand=foo($filter=(p eq 'v'),bar",
		error : "Expected ')' but instead saw end of input"
	}, {
		string : "$count=",
		error : "Expected an option value but instead saw end of input"
	}, {
		string : "$expand=",
		error : "Expected PATH but instead saw end of input"
	}, {
		string : "$search=(a and 'b'",
		error : "Expected ')' but instead saw end of input"
	}, {
		string : "$expand=foo($search=(a and 'b';select=*)",
		error : "Expected ')' but instead saw ';' at 31"
	}, {
		string : "$expand=foo($search=(a and 'b'%3bselect=*)",
		error : "Expected ')' but instead saw '%3b' at 31"
	}, {
		string : "$search=\"foo",
		error : "Unterminated string at 9"
	}, {
		string : "$filter=a eq 'foo",
		error : "Unterminated string at 14"
	}, {
		string : "$select=a, b",
		error : "Expected PATH but instead saw ' ' at 11"
	}, {
		string : "$expand=foo  eq 'bar'",
		error : "Expected end of input but instead saw 'eq' at 14"
	}, {
		string : "$expand=foo\teq%09'bar'",
		error : "Expected end of input but instead saw 'eq' at 13"
	}, {
		string : "$expand=foo%09eq\t'bar'",
		error : "Expected end of input but instead saw 'eq' at 15"
	}, {
		string : "$expand=foo%20eq%20'bar'",
		error : "Expected end of input but instead saw 'eq' at 15"
	}].forEach(function (oFixture) {
		QUnit.test("_Parser: " + oFixture.string, function (assert) {
			assert.throws(function () {
				_Parser.parseSystemQueryOption(oFixture.string);
			}, new SyntaxError(oFixture.error + ": " + oFixture.string));
		});
	});

	//*********************************************************************************************
	QUnit.test("parseExpand: examples", function (assert) {
		[{
			string : "SO_2_BP,"
				+ "SO_2_SOITEM($expand=SOITEM_2_PRODUCT($expand=PRODUCT_2_BP;$select=ID,Name))",
			parsed : {
				"SO_2_BP" : null,
				"SO_2_SOITEM" : {
					"$expand" : {
						"SOITEM_2_PRODUCT" : {
							"$expand" : {
								"PRODUCT_2_BP" : null
							},
							"$select" : ["ID", "Name"]
						}
					}
				}
			}
		}, {
			string : "TEAM_2_EMPLOYEES($expand=EMPLOYEE_2_EQUIPMENTS),TEAM_2_MANAGER",
			parsed : {
				"TEAM_2_EMPLOYEES" : {
					"$expand" : {
						"EMPLOYEE_2_EQUIPMENTS" : null
					}
				},
				"TEAM_2_MANAGER" : null
			}
		}].forEach(function (oFixture) {
			assert.deepEqual(_Parser.parseSystemQueryOption("$expand=" + oFixture.string),
				{"$expand" : oFixture.parsed}, oFixture.string);
		});
	});

	//*********************************************************************************************
	QUnit.test("_Parser: %-encoding", function (assert) {
		[{
			string : "$select=a%2Cb%2cc,d,e.%2a",
			parsed : {"$select" : ["a", "b", "c", "d", "e.*"]},
			converted : {"$select" : "a,b,c,d,e.*"}
		}, {
			string : "$select=%2a",
			parsed : {"$select" : ["*"]},
			converted : {"$select" : "*"}
		}, {
			string : "$select=%2A",
			parsed : {"$select" : ["*"]},
			converted : {"$select" : "*"}
		}, {
			string : "$expand=%2a",
			parsed : {"$expand" : {"*" : null}},
			converted : {"$expand" : "*"}
		}, {
			string : "$expand=%2a/$ref",
			parsed : {"$expand" : {"*/$ref" : null}},
			converted : {"$expand" : "*/$ref"}
		}, {
			string : "$expand=foo/%2A",
			parsed : {"$expand" : {"foo/*" : null}},
			converted : {"$expand" : "foo/*"}
		}, {
			//       "$filter=foo eq  + 1e + 10"
			string : "$filter=foo eq %2b1e%2B10",
			parsed : {"$filter" : "foo eq %2b1e%2B10"},
			converted : {"$filter" : "foo eq %2b1e%2B10"}
		}, {
			//       "$filter=foo eq  ' a '  '  ' "
			string : "$filter=foo eq %27a%27%27%27",
			parsed : {"$filter" : "foo eq %27a%27%27%27"},
			converted : {"$filter" : "foo eq %27a%27%27%27"}
		}, {
			//       "$expand=foo ( $filter=a   eq    ' b; '  ; $orderby=c   desc ; $count=true ) ",
			string : "$expand=foo%28$filter=a%20eq%20%27b;%27%3b$orderby=c%20desc%3B$count=true%29",
			parsed : {
				"$expand" : {
					"foo" : {
						"$filter" : "a%20eq%20%27b;%27",
						"$orderby" : "c%20desc",
						"$count" : "true"
					}
				}
			},
			converted : {"$expand" : "foo($filter=a%20eq%20%27b;%27;$orderby=c%20desc;$count=true)"}
		}, {
			//       "$filter=((foo eq '' )    and  ( bar gt 1 )  ) ",
			string : "$filter=((foo eq ''%29   and %28bar gt 1%29%29",
			parsed : {"$filter" : "((foo eq ''%29   and %28bar gt 1%29%29"},
			converted : {"$filter" : "((foo eq ''%29   and %28bar gt 1%29%29"}
		}, {
			//       "$search= " foo \  " bar \ \ baz ",
			string : '$search=%22foo%5c%22bar%5C\\baz%22',
			parsed : {"$search" : '%22foo%5c%22bar%5C\\baz%22'},
			converted : {"$search" : '%22foo%5c%22bar%5C\\baz%22'}
		}].forEach(function (oFixture) {
			assert.deepEqual(_Parser.parseSystemQueryOption(oFixture.string), oFixture.parsed,
				oFixture.string);
			// verify that the parsed result is consumable
			assert.deepEqual(_Requestor.create("/~/").convertQueryOptions("Foo", oFixture.parsed),
				oFixture.converted, JSON.stringify(oFixture.converted));
		});
	});

	//*********************************************************************************************
	['eq', 'ge', 'gt', 'le', 'lt', 'ne'].forEach(function (sOperator) {
		QUnit.test("_Parser#parseFilter, operator=" + sOperator, function (assert) {

			function parseAndRebuild(sFilter, oExpectedSyntaxTree) {
				var oSyntaxTree = _Parser.parseFilter(sFilter);

				assert.deepEqual(oSyntaxTree, oExpectedSyntaxTree, 'parse ' + sFilter);
				assert.strictEqual(_Parser.buildFilterString(oSyntaxTree), sFilter,
					"rebuild " + sFilter);
			}

			// Part 1: foo op 'bar'
			parseAndRebuild("foo " + sOperator + " 'bar'", {
				id : sOperator,
				value : " " + sOperator + " ",
				at : 5,
				left : {
					id : "PATH",
					value : "foo",
					at : 1
				},
				right : {
					id : "VALUE",
					value : "'bar'",
					at : 8
				}
			});

			// Part 2: 'bar' op foo
			parseAndRebuild("'bar' " + sOperator + " foo", {
				id : sOperator,
				value : " " + sOperator + " ",
				at : 7,
				left : {
					id : "VALUE",
					value : "'bar'",
					at : 1
				},
				right : {
					id : "PATH",
					value : "foo",
					at : 10
				}
			});
		});
	});

	//*********************************************************************************************
	["false", "true", "null"].forEach(function (sLiteral) {
		QUnit.test("parseFilter: literal=" + sLiteral, function (assert) {
			var sFilter = "foo eq " + sLiteral,
				oSyntaxTree = _Parser.parseFilter(sFilter);

			assert.deepEqual(oSyntaxTree, {
				id : "eq",
				value : " eq ",
				at : 5,
				left : {
					id : "PATH",
					value : "foo",
					at : 1
				},
				right : {
					id : "VALUE",
					value : sLiteral,
					at : 8
				}
			});

			assert.strictEqual(_Parser.buildFilterString(oSyntaxTree), sFilter);
		});
	});

	//*********************************************************************************************
	[{
		string : ";",
		error : "Unexpected ';' at 1"
	}, {
		string : "foo='bar'",
		error : "Unexpected '=' at 4"
	}, {
		string : "foo eq",
		error : "Expected expression but instead saw end of input"
	}, {
		string : "foo eq ",
		error : "Expected expression but instead saw end of input"
	}, {
		string : "foo eq  ",
		error : "Expected expression but instead saw end of input"
	}].forEach(function (oFixture) {
		QUnit.test('_Parser#parseFilter: "' + oFixture.string + '"', function (assert) {
			assert.throws(function () {
				_Parser.parseFilter(oFixture.string);
			}, new SyntaxError(oFixture.error + ": " + oFixture.string));
		});
	});
});
// TODO unicode character classes not supported by ECMAscript 5
//   rWord = /[\p{L}\p{Nl}_][\p{L}\p{Nl}\p{Nd}\p{Mn}\p{Mc}\p{Pc}\p{Cf}]*/
//   for this reason we accept ALL non-ascii characters in identifiers
