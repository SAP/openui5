/*!
 * ${copyright}
 */
sap.ui.require([
	"jquery.sap.global",
	"sap/ui/model/odata/v4/lib/_Parser"
], function (jQuery, _Parser) {
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
		s : "SO_2_BP",
		r : {"SO_2_BP" : null}
	}, {
		s : "SO_2_BP/BP_2_CONTACTS,SO_2_SÖITEM,ĕ",
		r : {"SO_2_BP/BP_2_CONTACTS" : null, "SO_2_SÖITEM" : null, "ĕ" : null}
	}, {
		s : "SO_2_BP($expand=BP_2_CONTACT)",
		r : {"SO_2_BP" : {"$expand" : {"BP_2_CONTACT" : null}}}
	}, {
		s : "SO_2_BP($expand=BP_2_CONTACT;$select=BusinessPartnerID)",
		r : {
			"SO_2_BP" : {
				"$expand" : {
					"BP_2_CONTACT" : null
				},
				"$select" : ["BusinessPartnerID"]
			}
		}
	}].forEach(function (oFixture) {
		QUnit.test("_Parser: $expand=" + oFixture.s, function (assert) {
			assert.deepEqual(_Parser.parseSystemQueryOption("$expand=" + oFixture.s),
				{"$expand" : oFixture.r});
		});
	});

	//*********************************************************************************************
	[{
		s : "SalesOrderID",
		r : ["SalesOrderID"]
	}, {
		s : "Address/City",
		r : ["Address/City"]
	}, {
		s : "SalesOrderID,Note",
		r : ["SalesOrderID", "Note"]
	}].forEach(function (oFixture) {
		QUnit.test("_Parser: $select=" + oFixture.s, function (assert) {
			assert.deepEqual(_Parser.parseSystemQueryOption("$select=" + oFixture.s),
					{"$select" : oFixture.r});
		});
	});

	//*********************************************************************************************
	[{
		s : "foo",
		e : "Expected option but instead saw 'foo' at 0"
	}, {
		s : "$expand",
		e : "Expected '=' but instead saw end of input"
	}, {
		s : "$expand)",
		e : "Expected '=' but instead saw ')' at 7"
	}, {
		s : "",
		e : "Expected option but instead saw end of input"
	}, {
		s : "$expand=SO_2_BP;",
		e : "Expected end of input but instead saw ';'"
	}, {
		s : "$expand=SO_2_BP$",
		e : "Unknown character '$' at 15"
	}].forEach(function (oFixture) {
		QUnit.test("_Parser: =" + oFixture.s, function (assert) {
			assert.throws(function () {
				_Parser.parseSystemQueryOption(oFixture.s);
			}, new SyntaxError(oFixture.e));
		});
	});

	//*********************************************************************************************
	QUnit.test("parseExpand: examples", function (assert) {
		[{
			s : "SO_2_BP,"
				+ "SO_2_SOITEM($expand=SOITEM_2_PRODUCT($expand=PRODUCT_2_BP;$select=ID,Name))",
			o : {
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
			s : "TEAM_2_EMPLOYEES($expand=EMPLOYEE_2_EQUIPMENTS),TEAM_2_MANAGER",
			o : {
				"TEAM_2_EMPLOYEES" : {
					"$expand" : {
						"EMPLOYEE_2_EQUIPMENTS" : null
					}
				},
				"TEAM_2_MANAGER" : null
			}
		}].forEach(function (oFixture) {
			assert.deepEqual(_Parser.parseSystemQueryOption("$expand=" + oFixture.s),
				{"$expand" : oFixture.o}, oFixture.s);
		});
	});
});
// TODO unicode character classes not supported by ECMAscript 5
//   rWord = /[\p{L}\p{Nl}_][\p{L}\p{Nl}\p{Nd}\p{Mn}\p{Mc}\p{Pc}\p{Cf}]*/
//   for this reason we accept ALL non-ascii characters in identifiers
