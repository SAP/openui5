/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/model/odata/v4/lib/_Batch",
	"sap/ui/model/odata/v4/lib/_Helper"
], function (Log, _Batch, _Helper) {
	"use strict";

	var oEntity = {"@odata.etag" : "W/\"20180830000000.0000000\""},
		oNewEmployeeBody = {
			ID : "7",
			Name : "Egon",
			AGE : 17,
			ENTRYDATE : "2015-10-01",
			MANAGER_ID : "",
			ROOM_ID : "",
			TEAM_ID : "",
			Is_Manager : false,
			LOCATION : {
				COUNTRY : "",
				City : {
					POSTALCODE : "",
					CITYNAME : ""
				}
			},
			SALARY : {
				MONTHLY_BASIC_SALARY_AMOUNT : 0.00,
				BASIC_SALARY_CURR : "EUR",
				YEARLY_BONUS_AMOUNT : 0.00,
				BONUS_CURR : "EUR"
			}
		},
		oNewTeamBody = {
			Team_Id : "TEAM_04",
			Name : "UI2 Services",
			MEMBER_COUNT : 9,
			MANAGER_ID : "1",
			BudgetCurrency : "EUR",
			Budget : 5555
		};

	//*********************************************************************************************
	QUnit.module("sap.ui.model.odata.v4.lib._Batch", {
		beforeEach : function () {
			this.oLogMock = this.mock(Log);
			this.oLogMock.expects("warning").never();
			this.oLogMock.expects("error").never();
		}
	});

	//*********************************************************************************************
	[{// serialization
		testTitle : "query parts without headers",
		epilogue : "foo",
		requests : [
			{
				method : "GET",
				url : "Employees('1')"
			}, {
				method : "GET",
				url : "Employees('2')"
			}
		],
		body : "--batch_id-0123456789012-345\r\n"
		+ "Content-Type:application/http\r\n"
		+ "Content-Transfer-Encoding:binary\r\n"
		+ "\r\n"
		+ "GET Employees('1') HTTP/1.1\r\n"
		+ "\r\n"
		+ "\r\n"
		+ "--batch_id-0123456789012-345\r\n"
		+ "Content-Type:application/http\r\n"
		+ "Content-Transfer-Encoding:binary\r\n"
		+ "\r\n"
		+ "GET Employees('2') HTTP/1.1\r\n"
		+ "\r\n"
		+ "\r\n"
		+ "--batch_id-0123456789012-345--\r\n"
		+ "foo",
		"Content-Type" : "multipart/mixed; boundary=batch_id-0123456789012-345",
		"MIME-Version" : "1.0"
	}, {
		testTitle : "query parts with headers",
		requests : [
			{
				method : "GET",
				url : "Employees('1')?$select=EmployeeID",
				headers : {
					foo : "bar1",
					abc : "123"
				}
			}, {
				method : "GET",
				url : "Employees('2')",
				headers : {
					foo : "bar2",
					abc : "456"
				}
			}
		],
		body : "--batch_id-0123456789012-345\r\n"
		+ "Content-Type:application/http\r\n"
		+ "Content-Transfer-Encoding:binary\r\n"
		+ "\r\n"
		+ "GET Employees('1')?$select=EmployeeID HTTP/1.1\r\n"
		+ "foo:bar1\r\n"
		+ "abc:123\r\n"
		+ "\r\n"
		+ "\r\n"
		+ "--batch_id-0123456789012-345\r\n"
		+ "Content-Type:application/http\r\n"
		+ "Content-Transfer-Encoding:binary\r\n"
		+ "\r\n"
		+ "GET Employees('2') HTTP/1.1\r\n"
		+ "foo:bar2\r\n"
		+ "abc:456\r\n"
		+ "\r\n"
		+ "\r\n"
		+ "--batch_id-0123456789012-345--\r\n",
		"Content-Type" : "multipart/mixed; boundary=batch_id-0123456789012-345",
		"MIME-Version" : "1.0"
	}, {
		testTitle : "batch request with changesets",
		expectedBoundaryIDs : ["id-0123456789012-345", "id-9876543210987-654"],
		requests : [[
			{
				method : "PATCH",
				url : "Employees('1')",
				headers : {
					"Content-Type" : "application/json"
				},
				body : {TEAM_ID : "TEAM_03"}
			}, {
				method : "PATCH",
				url : "Employees('2')",
				headers : {
					"Content-Type" : "application/json"
				},
				body : {TEAM_ID : "TEAM_01"}
			}
		]],
		$ContentIDs : [["0.0", "1.0"]],
		body : "--batch_id-0123456789012-345\r\n"
		+ "Content-Type: multipart/mixed;boundary=changeset_id-9876543210987-654\r\n"
		+ "\r\n"
		+ "--changeset_id-9876543210987-654\r\n"
		+ "Content-Type:application/http\r\n"
		+ "Content-Transfer-Encoding:binary\r\n"
		+ "Content-ID:0.0\r\n"
		+ "\r\n"
		+ "PATCH Employees('1') HTTP/1.1\r\n"
		+ "Content-Type:application/json\r\n"
		+ "\r\n"
		+ '{"TEAM_ID":"TEAM_03"}\r\n'
		+ "--changeset_id-9876543210987-654\r\n"
		+ "Content-Type:application/http\r\n"
		+ "Content-Transfer-Encoding:binary\r\n"
		+ "Content-ID:1.0\r\n"
		+ "\r\n"
		+ "PATCH Employees('2') HTTP/1.1\r\n"
		+ "Content-Type:application/json\r\n"
		+ "\r\n"
		+ '{"TEAM_ID":"TEAM_01"}\r\n'
		+ "--changeset_id-9876543210987-654--\r\n"
		+ "--batch_id-0123456789012-345--\r\n",
		"Content-Type" : "multipart/mixed; boundary=batch_id-0123456789012-345",
		"MIME-Version" : "1.0"
	}, {
		testTitle : "batch request with changesets and individual requests",
		expectedBoundaryIDs :
			["id-0123456789012-345", "id-9876543210987-654", "id-0123456789012-912"],
		requests : [
			{
				method : "GET",
				url : "Employees('1')",
				headers : {
					foo : "bar1",
					abc : "123"
				}
			},
			[
				{
					method : "PATCH",
					url : "Employees('1')",
					headers : {
						"Content-Type" : "application/json"
					},
					body : {TEAM_ID : "TEAM_03"}
				}, {
					method : "PATCH",
					url : "Employees('2')",
					headers : {
						"Content-Type" : "application/json"
					},
					body : {TEAM_ID : "TEAM_01"}
				}
			],
			{
				method : "PATCH",
				url : "Employees('3')",
				headers : {
					"Content-Type" : "application/json"
				},
				body : {TEAM_ID : "TEAM_01"}
			},
			[
				{
					method : "PATCH",
					url : "Employees('3')",
					headers : {
						"Content-Type" : "application/json"
					},
					body : {TEAM_ID : "TEAM_02"}
				}, {
					method : "PATCH",
					url : "Employees('4')",
					headers : {
						"Content-Type" : "application/json"
					},
					body : {TEAM_ID : "TEAM_01"}
				}
			]
		],
		$ContentIDs : [[], ["0.1", "1.1"], [], ["0.3", "1.3"]],
		body : "--batch_id-0123456789012-345\r\n"
		+ "Content-Type:application/http\r\n"
		+ "Content-Transfer-Encoding:binary\r\n"
		+ "\r\n"
		+ "GET Employees('1') HTTP/1.1\r\n"
		+ "foo:bar1\r\n"
		+ "abc:123\r\n"
		+ "\r\n"
		+ "\r\n"
		+ "--batch_id-0123456789012-345\r\n"
		+ "Content-Type: multipart/mixed;boundary=changeset_id-9876543210987-654\r\n"
		+ "\r\n"
		+ "--changeset_id-9876543210987-654\r\n"
		+ "Content-Type:application/http\r\n"
		+ "Content-Transfer-Encoding:binary\r\n"
		+ "Content-ID:0.1\r\n"
		+ "\r\n"
		+ "PATCH Employees('1') HTTP/1.1\r\n"
		+ "Content-Type:application/json\r\n"
		+ "\r\n"
		+ '{"TEAM_ID":"TEAM_03"}\r\n'
		+ "--changeset_id-9876543210987-654\r\n"
		+ "Content-Type:application/http\r\n"
		+ "Content-Transfer-Encoding:binary\r\n"
		+ "Content-ID:1.1\r\n"
		+ "\r\n"
		+ "PATCH Employees('2') HTTP/1.1\r\n"
		+ "Content-Type:application/json\r\n"
		+ "\r\n"
		+ '{"TEAM_ID":"TEAM_01"}\r\n'
		+ "--changeset_id-9876543210987-654--\r\n"
		+ "--batch_id-0123456789012-345\r\n"
		+ "Content-Type:application/http\r\n"
		+ "Content-Transfer-Encoding:binary\r\n"
		+ "\r\n"
		+ "PATCH Employees('3') HTTP/1.1\r\n"
		+ "Content-Type:application/json\r\n"
		+ "\r\n"
		+ '{"TEAM_ID":"TEAM_01"}\r\n'
		+ "--batch_id-0123456789012-345\r\n"
		+ "Content-Type: multipart/mixed;boundary=changeset_id-0123456789012-912\r\n"
		+ "\r\n"
		+ "--changeset_id-0123456789012-912\r\n"
		+ "Content-Type:application/http\r\n"
		+ "Content-Transfer-Encoding:binary\r\n"
		+ "Content-ID:0.3\r\n"
		+ "\r\n"
		+ "PATCH Employees('3') HTTP/1.1\r\n"
		+ "Content-Type:application/json\r\n"
		+ "\r\n"
		+ '{"TEAM_ID":"TEAM_02"}\r\n'
		+ "--changeset_id-0123456789012-912\r\n"
		+ "Content-Type:application/http\r\n"
		+ "Content-Transfer-Encoding:binary\r\n"
		+ "Content-ID:1.3\r\n"
		+ "\r\n"
		+ "PATCH Employees('4') HTTP/1.1\r\n"
		+ "Content-Type:application/json\r\n"
		+ "\r\n"
		+ '{"TEAM_ID":"TEAM_01"}\r\n'
		+ "--changeset_id-0123456789012-912--\r\n"
		+ "--batch_id-0123456789012-345--\r\n",
		"Content-Type" : "multipart/mixed; boundary=batch_id-0123456789012-345",
		"MIME-Version" : "1.0"
	}, {
		testTitle : "batch request with Content-ID references",
		expectedBoundaryIDs :
			["id-1450426018742-911", "id-1450426018742-912", "id-1450426018742-913"],
		requests : [
			[{
				method : "POST",
				url : "TEAMS",
				headers : {
					"Content-Type" : "application/json"
				},
				body : oNewTeamBody
			}, {
				method : "POST",
				url : "$0/TEAM_2_EMPLOYEES",
				headers : {
					"Content-Type" : "application/json"
				},
				body : oNewEmployeeBody
			}],
			[{
				method : "POST",
				url : "TEAMS",
				headers : {
					"Content-Type" : "application/json"
				},
				body : {
					Team_Id : "TEAM_05",
					Name : "UI2 Services",
					MEMBER_COUNT : 9,
					MANAGER_ID : "1",
					BudgetCurrency : "EUR",
					Budget : 5555
				}
			}, {
				method : "POST",
				// Note: do not confuse with Content-ID reference! BCP: 2070180250
				url : "TEAMS?$expand=TEAM_2_EMPLOYEES($filter=STATUS%20eq%20'$42')",
				headers : {
					"Content-Type" : "application/json"
				},
				body : {
					Team_Id : "TEAM_06",
					Name : "UI2 Services",
					MEMBER_COUNT : 9,
					MANAGER_ID : "1",
					BudgetCurrency : "EUR",
					Budget : 5555
				}
			}, {
				method : "POST",
				url : "$1/TEAM_2_EMPLOYEES",
				headers : {
					"Content-Type" : "application/json"
				},
				body : oNewEmployeeBody
			}, {
				method : "DELETE",
				// Note: This is unrealistic as key predicates use encodeURIComponent and entity set
				// names cannot contain a dollar, but still we should not confuse it with a
				// Content-ID reference!
				url : "$TEAMS('$1')",
				headers : {
					"Content-Type" : "application/json"
				}
			}], {
				method : "GET",
				// Note: do not confuse with Content-ID reference! BCP: 2070180250
				url : "EMPLOYEES?$filter=STATUS%20eq%20'$42'",
				headers : {
					"Content-Type" : "application/json"
				}
			}
		],
		$ContentIDs : [["0.0", "1.0"], ["0.1", "1.1", "2.1", "3.1"]],
		body : "--batch_id-1450426018742-911\r\n"
		+ "Content-Type: multipart/mixed;boundary=changeset_id-1450426018742-912\r\n"
		+ "\r\n"
		+ "--changeset_id-1450426018742-912\r\n"
		+ "Content-Type:application/http\r\n"
		+ "Content-Transfer-Encoding:binary\r\n"
		+ "Content-ID:0.0\r\n"
		+ "\r\n"
		+ "POST TEAMS HTTP/1.1\r\n"
		+ "Content-Type:application/json\r\n"
		+ "\r\n"
		+ JSON.stringify(oNewTeamBody) + "\r\n"
		+ "--changeset_id-1450426018742-912\r\n"
		+ "Content-Type:application/http\r\n"
		+ "Content-Transfer-Encoding:binary\r\n"
		+ "Content-ID:1.0\r\n"
		+ "\r\n"
		+ "POST $0.0/TEAM_2_EMPLOYEES HTTP/1.1\r\n"
		+ "Content-Type:application/json\r\n"
		+ "\r\n"
		+ JSON.stringify(oNewEmployeeBody) + "\r\n"
		+ "--changeset_id-1450426018742-912--\r\n"
		+ "--batch_id-1450426018742-911\r\n"
		+ "Content-Type: multipart/mixed;boundary=changeset_id-1450426018742-913\r\n"
		+ "\r\n"
		+ "--changeset_id-1450426018742-913\r\n"
		+ "Content-Type:application/http\r\n"
		+ "Content-Transfer-Encoding:binary\r\n"
		+ "Content-ID:0.1\r\n"
		+ "\r\n"
		+ "POST TEAMS HTTP/1.1\r\n"
		+ "Content-Type:application/json\r\n"
		+ "\r\n"
		+ '{"Team_Id":"TEAM_05",'
		+ '"Name":"UI2 Services",'
		+ '"MEMBER_COUNT":9,'
		+ '"MANAGER_ID":"1",'
		+ '"BudgetCurrency":"EUR",'
		+ '"Budget":5555}\r\n'
		+ "--changeset_id-1450426018742-913\r\n"
		+ "Content-Type:application/http\r\n"
		+ "Content-Transfer-Encoding:binary\r\n"
		+ "Content-ID:1.1\r\n"
		+ "\r\n"
		+ "POST TEAMS?$expand=TEAM_2_EMPLOYEES($filter=STATUS%20eq%20'$42') HTTP/1.1\r\n"
		+ "Content-Type:application/json\r\n"
		+ "\r\n"
		+ '{"Team_Id":"TEAM_06",'
		+ '"Name":"UI2 Services",'
		+ '"MEMBER_COUNT":9,'
		+ '"MANAGER_ID":"1",'
		+ '"BudgetCurrency":"EUR",'
		+ '"Budget":5555}\r\n'
		+ "--changeset_id-1450426018742-913\r\n"
		+ "Content-Type:application/http\r\n"
		+ "Content-Transfer-Encoding:binary\r\n"
		+ "Content-ID:2.1\r\n"
		+ "\r\n"
		+ "POST $1.1/TEAM_2_EMPLOYEES HTTP/1.1\r\n"
		+ "Content-Type:application/json\r\n"
		+ "\r\n"
		+ JSON.stringify(oNewEmployeeBody) + "\r\n"
		+ "--changeset_id-1450426018742-913\r\n"
		+ "Content-Type:application/http\r\n"
		+ "Content-Transfer-Encoding:binary\r\n"
		+ "Content-ID:3.1\r\n"
		+ "\r\n"
		+ "DELETE $TEAMS('$1') HTTP/1.1\r\n"
		+ "Content-Type:application/json\r\n"
		+ "\r\n"
		+ "\r\n"
		+ "--changeset_id-1450426018742-913--\r\n"
		+ "--batch_id-1450426018742-911\r\n"
		+ "Content-Type:application/http\r\n"
		+ "Content-Transfer-Encoding:binary\r\n"
		+ "\r\n"
		+ "GET EMPLOYEES?$filter=STATUS%20eq%20'$42' HTTP/1.1\r\n"
		+ "Content-Type:application/json\r\n"
		+ "\r\n"
		+ "\r\n"
		+ "--batch_id-1450426018742-911--\r\n",
		"Content-Type" : "multipart/mixed; boundary=batch_id-1450426018742-911",
		"MIME-Version" : "1.0"
	}, {
		testTitle : "If-Match parameter is an object",
		expectedBoundaryIDs : ["id-0123456789012-345", "id-9876543210987-654"],
		requests : [[
			{
				method : "PATCH",
				url : "Employees('1')",
				headers : {
					"Content-Type" : "application/json",
					"If-Match" : oEntity
				},
				body : {TEAM_ID : "TEAM_03"}
			}
		]],
		$ContentIDs : [["0.0"]],
		body : "--batch_id-0123456789012-345\r\n"
		+ "Content-Type: multipart/mixed;boundary=changeset_id-9876543210987-654\r\n"
		+ "\r\n"
		+ "--changeset_id-9876543210987-654\r\n"
		+ "Content-Type:application/http\r\n"
		+ "Content-Transfer-Encoding:binary\r\n"
		+ "Content-ID:0.0\r\n"
		+ "\r\n"
		+ "PATCH Employees('1') HTTP/1.1\r\n"
		+ "Content-Type:application/json\r\n"
		+ "If-Match:" + oEntity["@odata.etag"] + "\r\n"
		+ "\r\n"
		+ '{"TEAM_ID":"TEAM_03"}\r\n'
		+ "--changeset_id-9876543210987-654--\r\n"
		+ "--batch_id-0123456789012-345--\r\n",
		"Content-Type" : "multipart/mixed; boundary=batch_id-0123456789012-345",
		"MIME-Version" : "1.0"
	}, {
		testTitle : "If-Match:*", ////////////////////////////////////////////////
		expectedBoundaryIDs : ["id-0123456789012-345", "id-9876543210987-654"],
		ignoreETag : true,
		requests : [[
			{
				method : "PATCH",
				url : "Employees('1')",
				headers : {
					"Content-Type" : "application/json",
					"If-Match" : oEntity
				},
				body : {TEAM_ID : "TEAM_03"}
			}
		]],
		$ContentIDs : [["0.0"]],
		body : "--batch_id-0123456789012-345\r\n"
		+ "Content-Type: multipart/mixed;boundary=changeset_id-9876543210987-654\r\n"
		+ "\r\n"
		+ "--changeset_id-9876543210987-654\r\n"
		+ "Content-Type:application/http\r\n"
		+ "Content-Transfer-Encoding:binary\r\n"
		+ "Content-ID:0.0\r\n"
		+ "\r\n"
		+ "PATCH Employees('1') HTTP/1.1\r\n"
		+ "Content-Type:application/json\r\n"
		+ "If-Match:*\r\n"
		+ "\r\n"
		+ '{"TEAM_ID":"TEAM_03"}\r\n'
		+ "--changeset_id-9876543210987-654--\r\n"
		+ "--batch_id-0123456789012-345--\r\n",
		"Content-Type" : "multipart/mixed; boundary=batch_id-0123456789012-345",
		"MIME-Version" : "1.0"
	}, {
		testTitle : "If-Match parameter is a string",
		expectedBoundaryIDs : ["id-0123456789012-345", "id-9876543210987-654"],
		requests : [[
			{
				method : "PATCH",
				url : "Employees('1')",
				headers : {
					"Content-Type" : "application/json",
					"If-Match" : "W/\"20151211144619.4328660\""
				},
				body : {TEAM_ID : "TEAM_03"}
			}
		]],
		$ContentIDs : [["0.0"]],
		body : "--batch_id-0123456789012-345\r\n"
		+ "Content-Type: multipart/mixed;boundary=changeset_id-9876543210987-654\r\n"
		+ "\r\n"
		+ "--changeset_id-9876543210987-654\r\n"
		+ "Content-Type:application/http\r\n"
		+ "Content-Transfer-Encoding:binary\r\n"
		+ "Content-ID:0.0\r\n"
		+ "\r\n"
		+ "PATCH Employees('1') HTTP/1.1\r\n"
		+ "Content-Type:application/json\r\n"
		+ "If-Match:W/\"20151211144619.4328660\"\r\n"
		+ "\r\n"
		+ '{"TEAM_ID":"TEAM_03"}\r\n'
		+ "--changeset_id-9876543210987-654--\r\n"
		+ "--batch_id-0123456789012-345--\r\n",
		"Content-Type" : "multipart/mixed; boundary=batch_id-0123456789012-345",
		"MIME-Version" : "1.0"
	}, {
		testTitle : "If-Match: @odata.etag is undefined",
		expectedBoundaryIDs : ["id-0123456789012-345", "id-9876543210987-654"],
		ignoreETag : true,
		requests : [[
			{
				method : "PATCH",
				url : "Employees('1')",
				headers : {
					"Content-Type" : "application/json",
					"If-Match" : {
						/*"@odata.etag" : undefined*/
					}
				},
				body : {TEAM_ID : "TEAM_03"}
			}
		]],
		$ContentIDs : [["0.0"]],
		body : "--batch_id-0123456789012-345\r\n"
		+ "Content-Type: multipart/mixed;boundary=changeset_id-9876543210987-654\r\n"
		+ "\r\n"
		+ "--changeset_id-9876543210987-654\r\n"
		+ "Content-Type:application/http\r\n"
		+ "Content-Transfer-Encoding:binary\r\n"
		+ "Content-ID:0.0\r\n"
		+ "\r\n"
		+ "PATCH Employees('1') HTTP/1.1\r\n"
		+ "Content-Type:application/json\r\n"
		+ "\r\n"
		+ '{"TEAM_ID":"TEAM_03"}\r\n'
		+ "--changeset_id-9876543210987-654--\r\n"
		+ "--batch_id-0123456789012-345--\r\n",
		"Content-Type" : "multipart/mixed; boundary=batch_id-0123456789012-345",
		"MIME-Version" : "1.0"
	}, {
		testTitle : "Header with empty value",
		expectedBoundaryIDs : ["id-0123456789012-345", "id-9876543210987-654"],
		requests : [[
			{
				method : "PATCH",
				url : "Employees('1')",
				headers : {
					"Content-Type" : "application/json",
					Foo : ""
				},
				body : {TEAM_ID : "TEAM_03"}
			}
		]],
		$ContentIDs : [["0.0"]],
		body : "--batch_id-0123456789012-345\r\n"
		+ "Content-Type: multipart/mixed;boundary=changeset_id-9876543210987-654\r\n"
		+ "\r\n"
		+ "--changeset_id-9876543210987-654\r\n"
		+ "Content-Type:application/http\r\n"
		+ "Content-Transfer-Encoding:binary\r\n"
		+ "Content-ID:0.0\r\n"
		+ "\r\n"
		+ "PATCH Employees('1') HTTP/1.1\r\n"
		+ "Content-Type:application/json\r\n"
		+ "Foo:\r\n"
		+ "\r\n"
		+ '{"TEAM_ID":"TEAM_03"}\r\n'
		+ "--changeset_id-9876543210987-654--\r\n"
		+ "--batch_id-0123456789012-345--\r\n",
		"Content-Type" : "multipart/mixed; boundary=batch_id-0123456789012-345",
		"MIME-Version" : "1.0"
	}].forEach(function (oFixture) {
			QUnit.test("serializeBatchRequest: " + oFixture.testTitle, function (assert) {
				var oBatchRequest,
					oHelperMock = this.mock(_Helper),
					aRequests = JSON.parse(JSON.stringify(oFixture.requests));

				if (oFixture.$ContentIDs) {
					oFixture.$ContentIDs.forEach(function (aContentIds, i) {
						aContentIds.forEach(function (sContentID, j) {
							oFixture.requests[i][j].$ContentID = sContentID;
						});
					});
				}

				if (oFixture.expectedBoundaryIDs) {
					oFixture.expectedBoundaryIDs.forEach(function (oValue) {
						oHelperMock.expects("uid").returns(oValue);
					});
				} else {
					oHelperMock.expects("uid").returns("id-0123456789012-345");
				}

				// code under test
				oBatchRequest = _Batch.serializeBatchRequest(aRequests, oFixture.epilogue,
					oFixture.ignoreETag);

				assert.deepEqual(aRequests, oFixture.requests,
					"aRequests remained unchanged, apart from $ContentID");
				assert.strictEqual(oBatchRequest.body, oFixture.body);
				assert.strictEqual(oBatchRequest.headers["Content-Type"], oFixture["Content-Type"]);
				assert.strictEqual(oBatchRequest.headers["MIME-Version"], oFixture["MIME-Version"]);
			});
		}
	);

	//*********************************************************************************************
	[{
		title : "changeset within a changeset",
		requests : [
			[{
				method : "PATCH",
				url : "Employees('1')",
				headers : {
					"Content-Type" : "application/json"
				},
				body : '{"TEAM_ID" : "TEAM_03"}'
			},
			[
				{
					method : "PATCH",
					url : "Employees('2')",
					headers : {
						"Content-Type" : "application/json"
					},
					body : '{"TEAM_ID" : "TEAM_01"}'
				}
			]]
		],
		errorMessage : "Change set must not contain a nested change set."
	}, {
		title : "changeset with GET request",
		requests : [
			[{
				method : "PATCH",
				url : "Employees('1')",
				headers : {
					"Content-Type" : "application/json"
				},
				body : '{"TEAM_ID" : "TEAM_03"}'
			}, {
				method : "GET",
				url : "Employees('2')",
				headers : {
					"Content-Type" : "application/json"
				},
				body : '{"TEAM_ID" : "TEAM_01"}'
			}]
		],
		errorMessage : "Invalid HTTP request method: GET. Change set must contain only POST, "
		+ "PUT, PATCH, or DELETE requests."
	}].forEach(function (oFixture) {
			QUnit.test("validation serializeBatchRequest: " + oFixture.title, function (assert) {
				assert.throws(
					function () { _Batch.serializeBatchRequest(oFixture.requests); },
					new Error(oFixture.errorMessage));
			});
		}
	);

	//*********************************************************************************************
	// deserialization
	[{
		testTitle : "batch parts with preamble and epilogue, and \r\n\r\n in batch body",
		contentType : "multipart/mixed; boundary=batch_id-0123456789012-345",
		body : "this is a preamble for the batch request\r\n\
--batch_id-0123456789012-345\r\n\
Content-Type: application/http\r\n\
Content-Length: 4711\r\n\
content-transfer-encoding: binary\r\n\
\r\n\
HTTP/1.1 200\r\n\
Content-Type: application/json;odata.metadata=minimal\r\n\
Content-Length: 9\r\n\
odata-version: 4.0\r\n\
\r\n\
{\"foo\":\"bar\"}\r\n\
--batch_id-0123456789012-345\r\n\
Content-Type: application/http\r\n\
Content-Length: 459\r\n\
content-transfer-encoding: binary\r\n\
\r\n\
HTTP/1.1 200 OK\r\n\
Content-Type: application/json;odata.metadata=minimal\r\n\
Content-Length: 11\r\n\
odata-version: 4.0\r\n\
header-with-colonValue: http://host:8080/sap/opu/MyService\r\n\
header-with-space-before-colon : Headername with space before colon\r\n\
\r\n\
{\"foo1\":\"bar1\"}\r\n\
\r\n\
--batch_id-0123456789012-345--\r\n\
this is a batch request epilogue",
		expectedResponses : [{
			status : 200,
			statusText : "", // optional!
			headers : {
				"Content-Type" : "application/json;odata.metadata=minimal",
				"Content-Length" : "9",
				"odata-version" : "4.0"
			},
			responseText : "{\"foo\":\"bar\"}"
		}, {
			status : 200,
			statusText : "OK",
			headers : {
				"Content-Type" : "application/json;odata.metadata=minimal",
				"Content-Length" : "11",
				"odata-version" : "4.0",
				"header-with-colonValue" : "http://host:8080/sap/opu/MyService",
				"header-with-space-before-colon" : "Headername with space before colon"
			},
			responseText : "{\"foo1\":\"bar1\"}\r\n"
		}]
	}, {
		testTitle : "no final CRLF",
		contentType : "multipart/mixed; boundary=batch_id-0123456789012-345",
		body : "--batch_id-0123456789012-345\r\n\
Content-Type: application/http\r\n\
\r\n\
HTTP/1.1 200 OK\r\n\
Content-Type: application/json;odata.metadata=minimal\r\n\
Content-Length: 9\r\n\
odata-version: 4.0\r\n\
\r\n\
{\"foo\":\"bar\"}\r\n\
--batch_id-0123456789012-345--",
		expectedResponses : [{
			status : 200,
			statusText : "OK",
			headers : {
				"Content-Type" : "application/json;odata.metadata=minimal",
				"Content-Length" : "9",
				"odata-version" : "4.0"
			},
			responseText : "{\"foo\":\"bar\"}"
		}]
	}, {
		testTitle : "batch parts without headers",
		contentType : 'multipart/mixed; boundary="batch_1 23456"',
		body : "--batch_1 23456\r\n\
Content-Type: application/http\r\n\
Content-Length: 4711\r\n\
content-transfer-encoding: binary\r\n\
\r\n\
HTTP/1.1 200 OK\r\n\
\r\n\
{\"foo\":\"bar\"}\r\n\
--batch_1 23456\r\n\
Content-Type: application/http\r\n\
Content-Length: 459\r\n\
content-transfer-encoding: binary\r\n\
\r\n\
HTTP/1.1 200 OK\r\n\
\r\n\
{\"foo1\":\"bar1\"}\r\n\
--batch_1 23456--\r\n",
		expectedResponses : [{
			status : 200,
			statusText : "OK",
			headers : {},
			responseText : "{\"foo\":\"bar\"}"
		}, {
			status : 200,
			statusText : "OK",
			headers : {},
			responseText : "{\"foo1\":\"bar1\"}"
		}]
	}, {
		testTitle : "batch boundary with special characters",
		contentType : ' multipart/mixed; myboundary="invalid"; '
		+ 'boundary="batch_id-0123456789012-345\'()+_,-./:=?"',
		body : "--batch_id-0123456789012-345\'()+_,-./:=?\t\r\n\
Content-Type: application/http\r\n\
Content-Length: 4711\r\n\
content-transfer-encoding: binary\r\n\
\r\n\
HTTP/1.1 200 OK\r\n\
\r\n\
{\"foo\":\"bar\"}\r\n\
--batch_id-0123456789012-345\'()+_,-./:=?  \r\n\
Content-Type: application/http\r\n\
Content-Length: 459\r\n\
content-transfer-encoding: binary\r\n\
\r\n\
HTTP/1.1 200 OK\r\n\
\r\n\
{\"foo1\":\"bar1\"}\r\n\
--batch_id-0123456789012-345\'()+_,-./:=?-- \r\n",
		expectedResponses : [{
			status : 200,
			statusText : "OK",
			headers : {},
			responseText : "{\"foo\":\"bar\"}"
		}, {
			status : 200,
			statusText : "OK",
			headers : {},
			responseText : "{\"foo1\":\"bar1\"}"
		}]
	}, {
		testTitle : "multiple Content-Type parameters separated with space",
		contentType : "multipart/mixed; boundary=batch_id-0123456789012-345 ; foo=bar",
		body : "--batch_id-0123456789012-345\r\n\
Content-Type: application/http\r\n\
Content-Length: 459\r\n\
content-transfer-encoding: binary\r\n\
\r\n\
HTTP/1.1 200 OK\r\n\
\r\n\
{\"foo1\":\"bar1\"}\r\n\
--batch_id-0123456789012-345--\r\n",
		expectedResponses : [{
			status : 200,
			statusText : "OK",
			headers : {},
			responseText : "{\"foo1\":\"bar1\"}"
		}]
	}, {
		testTitle : "multiple Content-Type parameters separated w/o space",
		contentType : "multipart/mixed; boundary=batch_id-0123456789012-345;foo=bar",
		body : "--batch_id-0123456789012-345\r\n\
Content-Type: application/http\r\n\
Content-Length: 459\r\n\
content-transfer-encoding: binary\r\n\
\r\n\
HTTP/1.1 200 OK\r\n\
\r\n\
{\"foo1\":\"bar1\"}\r\n\
--batch_id-0123456789012-345--\r\n",
		expectedResponses : [{
			status : 200,
			statusText : "OK",
			headers : {},
			responseText : "{\"foo1\":\"bar1\"}"
		}]
	}, {
		testTitle : "Content-Type with charset parameter lowercase",
		contentType : "multipart/mixed; boundary=batch_id-0123456789012-345;foo=bar",
		body : "--batch_id-0123456789012-345\r\n\
Content-Type: application/http\r\n\
Content-Length: 459\r\n\
content-transfer-encoding: binary\r\n\
\r\n\
HTTP/1.1 200 OK\r\n\
Content-Type: application/json;odata.metadata=minimal;charset=utf-8\r\n\
\r\n\
{\"foo1\":\"bar1\"}\r\n\
--batch_id-0123456789012-345--\r\n",
		expectedResponses : [{
			status : 200,
			statusText : "OK",
			headers : {"Content-Type" : "application/json;odata.metadata=minimal;charset=utf-8"},
			responseText : "{\"foo1\":\"bar1\"}"
		}]
	}, {
		testTitle : "Content-Type with charset parameter uppercase + space + following parameter",
		contentType : "multipart/mixed; boundary=batch_id-0123456789012-345;foo=bar",
		body : "--batch_id-0123456789012-345\r\n\
Content-Type: application/http\r\n\
Content-Length: 459\r\n\
content-transfer-encoding: binary\r\n\
\r\n\
HTTP/1.1 200 OK\r\n\
Content-Type: application/json;odata.metadata=minimal;charset=UTF-8 ;foo=bar\r\n\
\r\n\
{\"foo1\":\"bar1\"}\r\n\
--batch_id-0123456789012-345--\r\n",
		expectedResponses : [{
			status : 200,
			statusText : "OK",
			headers : {
				"Content-Type" : "application/json;odata.metadata=minimal;charset=UTF-8 ;foo=bar"
			},
			responseText : "{\"foo1\":\"bar1\"}"
		}]
	}, {
		testTitle : "Content-Type text/plain with only spaces in response body",
		contentType : "multipart/mixed; boundary=batch_id-0123456789012-345",
		body : "--batch_id-0123456789012-345\r\n\
Content-Type: application/http\r\n\
Content-Length: 459\r\n\
content-transfer-encoding: binary\r\n\
\r\n\
HTTP/1.1 200 OK\r\n\
Content-Type: text/plain\r\n\
\r\n\
  \r\n\
--batch_id-0123456789012-345--\r\n",
		expectedResponses : [{
			status : 200,
			statusText : "OK",
			headers : {
				"Content-Type" : "text/plain"
			},
			responseText : "  "
		}]
	}, {
		testTitle : "individual requests and change sets",
		contentType : "multipart/mixed; boundary=batch_id-0123456789012-345",
		body : "--batch_id-0123456789012-345\r\n\
Content-Type: application/http\r\n\
Content-Length: 2768\r\n\
content-transfer-encoding: binary\r\n\
\r\n\
HTTP/1.1 200 OK\r\n\
Content-Type: application/json;odata.metadata=minimal\r\n\
Content-Length: 2652\r\n\
odata-version: 4.0\r\n\
\r\n\
{\"foo\":\"bar\"}\r\n\
--batch_id-0123456789012-345\r\n\
Content-Type: multipart/mixed; boundary=changeset_id-9876543210987-654\r\n\
Content-Length: 1603\r\n\
\r\n\
--changeset_id-9876543210987-654\r\n\
Content-Type: application/http\r\n\
Content-Length: 655\r\n\
content-transfer-encoding: binary\r\n\
content-id: 0.1\r\n\
\r\n\
HTTP/1.1 200 OK\r\n\
Content-Type: application/json;odata.metadata=minimal\r\n\
Content-Length: 491\r\n\
odata-version: 4.0\r\n\
etag: W/\"20151211144619.4328660\"\r\n\
\r\n\
{\"foo1\":\"bar1\"}\r\n\
--changeset_id-9876543210987-654\r\n\
Content-Type: application/http\r\n\
Content-Length: 651\r\n\
content-transfer-encoding: binary\r\n\
content-id: 1.1\r\n\
\r\n\
HTTP/1.1 200 OK\r\n\
Content-Type: application/json;odata.metadata=minimal\r\n\
Content-Length: 487\r\n\
odata-version: 4.0\r\n\
etag: W/\"20151211144619.4430570\"\r\n\
\r\n\
{\"foo2\":\"bar2\"}\r\n\
--changeset_id-9876543210987-654--\r\n\
\r\n\
--batch_id-0123456789012-345\r\n\
Content-Type: application/http\r\n\
Content-Length: 633\r\n\
content-transfer-encoding: binary\r\n\
\r\n\
HTTP/1.1 200 OK\r\n\
Content-Type: application/json;odata.metadata=minimal\r\n\
Content-Length: 484\r\n\
odata-version: 4.0\r\n\
etag: W/\"20151211144619.4550440\"\r\n\
\r\n\
{\"foo3\":\"bar3\"}\r\n\
--batch_id-0123456789012-345\r\n\
Content-Type: multipart/mixed; boundary=changeset_id-0123456789012-912\r\n\
Content-Length:      1599\r\n\
\r\n\
--changeset_id-0123456789012-912\r\n\
Content-Type: application/http\r\n\
Content-Length: 650\r\n\
content-transfer-encoding: binary\r\n\
content-id: 1.3\r\n\
\r\n\
HTTP/1.1 200 OK\r\n\
Content-Type: application/json;odata.metadata=minimal\r\n\
Content-Length: 486\r\n\
odata-version: 4.0\r\n\
etag: W/\"20151211144619.4760440\"\r\n\
\r\n\
{\"foo5\":\"bar5\"}\r\n\
--changeset_id-0123456789012-912\r\n\
Content-Type: application/http\r\n\
Content-Length: 652\r\n\
content-transfer-encoding: binary\r\n\
content-id: 0.3\r\n\
\r\n\
HTTP/1.1 200 OK\r\n\
Content-Type: application/json;odata.metadata=minimal\r\n\
Content-Length: 488\r\n\
odata-version: 4.0\r\n\
etag: W/\"20151211144619.4660570\"\r\n\
\r\n\
{\"foo4\":\"bar4\"}\r\n\
--changeset_id-0123456789012-912--\r\n\
\r\n\
--batch_id-0123456789012-345--\r\n",
		expectedResponses : [
			{
				status : 200,
				statusText : "OK",
				headers : {
					"Content-Type" : "application/json;odata.metadata=minimal",
					"Content-Length" : "2652",
					"odata-version" : "4.0"
				},
				responseText : '{\"foo\":\"bar\"}'
			},
			[
				{
					status : 200,
					statusText : "OK",
					headers : {
						"Content-Type" : "application/json;odata.metadata=minimal",
						"Content-Length" : "491",
						"odata-version" : "4.0",
						etag : 'W/"20151211144619.4328660"'
					},
					responseText : '{\"foo1\":\"bar1\"}'
				}, {
					status : 200,
					statusText : "OK",
					headers : {
						"Content-Type" : "application/json;odata.metadata=minimal",
						"Content-Length" : "487",
						"odata-version" : "4.0",
						etag : 'W/"20151211144619.4430570"'
					},
					responseText : '{\"foo2\":\"bar2\"}'
				}
			],
			{
				status : 200,
				statusText : "OK",
				headers : {
					"Content-Type" : "application/json;odata.metadata=minimal",
					"Content-Length" : "484",
					"odata-version" : "4.0",
					etag : 'W/"20151211144619.4550440"'
				},
				responseText : '{\"foo3\":\"bar3\"}'
			},
			[
				{
					status : 200,
					statusText : "OK",
					headers : {
						"Content-Type" : "application/json;odata.metadata=minimal",
						"Content-Length" : "488",
						"odata-version" : "4.0",
						etag : 'W/"20151211144619.4660570"'
					},
					responseText : '{\"foo4\":\"bar4\"}'
				}, {
					status : 200,
					statusText : "OK",
					headers : {
						"Content-Type" : "application/json;odata.metadata=minimal",
						"Content-Length" : "486",
						"odata-version" : "4.0",
						etag : 'W/"20151211144619.4760440"'
					},
					responseText : '{\"foo5\":\"bar5\"}'
				}
			]
		]
	}].forEach(function (oFixture) {
			QUnit.test("deserializeBatchResponse: " + oFixture.testTitle, function (assert) {
				var aResponses
					= _Batch.deserializeBatchResponse(oFixture.contentType, oFixture.body);

				assert.deepEqual(aResponses, oFixture.expectedResponses);
			});
		}
	);

	//*********************************************************************************************
	[{
		title : "detect unsupported charset",
		body : "--batch_id-0123456789012-345\r\n\
Content-Type: application/http\r\n\
Content-Length: 459\r\n\
content-transfer-encoding: binary\r\n\
\r\n\
HTTP/1.1 200 OK\r\n\
Content-Type: application/json;odata.metadata=minimal;charset=UTF-16 ;foo=bar \r\n\
\r\n\
{\"foo1\":\"bar1\"}\r\n\
--batch_id-0123456789012-345--\r\n",
		errorMessage : 'Unsupported "Content-Type" charset: UTF-16'
	}, {
		title : "no Content-ID for change set response",
		body : "--batch_id-0123456789012-345\r\n\
Content-Type: multipart/mixed; boundary=changeset_id-0123456789012-912\r\n\
Content-Length: 1599\r\n\
\r\n\
--changeset_id-0123456789012-912\r\n\
Content-Type: application/http\r\n\
Content-Length: 650\r\n\
content-transfer-encoding: binary\r\n\
\r\n\
HTTP/1.1 200 OK\r\n\
Content-Type: application/json;odata.metadata=minimal\r\n\
Content-Length: 486\r\n\
odata-version: 4.0\r\n\
etag: W/\"20151211144619.4760440\"\r\n\
\r\n\
{\"foo5\":\"bar5\"}\r\n\
--changeset_id-0123456789012-912--\r\n\
\r\n\
--batch_id-0123456789012-345--\r\n",
		errorMessage : "Content-ID MIME header missing for the change set response."
	}, {
		title : "invalid Content-ID for change set response",
		body : "--batch_id-0123456789012-345\r\n\
Content-Type: multipart/mixed; boundary=changeset_id-0123456789012-912\r\n\
Content-Length: 1599\r\n\
\r\n\
--changeset_id-0123456789012-912\r\n\
Content-Type: application/http\r\n\
Content-Length: 650\r\n\
content-transfer-encoding: binary\r\n\
content-ID: x.1\r\n\
\r\n\
HTTP/1.1 200 OK\r\n\
Content-Type: application/json;odata.metadata=minimal\r\n\
Content-Length: 486\r\n\
odata-version: 4.0\r\n\
etag: W/\"20151211144619.4760440\"\r\n\
\r\n\
{\"foo5\":\"bar5\"}\r\n\
--changeset_id-0123456789012-912--\r\n\
\r\n\
--batch_id-0123456789012-345--\r\n",
		errorMessage : "Invalid Content-ID value in change set response."
	}].forEach(function (oFixture) {
		QUnit.test("Validation for deserializeBatchResponse: " + oFixture.title, function (assert) {
			assert.throws(function () {
				_Batch.deserializeBatchResponse(
					"multipart/mixed; boundary=batch_id-0123456789012-345",
					oFixture.body);
			}, new Error(oFixture.errorMessage));
		});
	});

	//*********************************************************************************************
	[
		"application/json",
		"multipart/mixed; foo=bar",
		"application/json; boundary=batch_id-0123456789012-345"
	].forEach(function (sContentType) {
		QUnit.test("deserializeBatchResponse: detect invalid content type: ", function (assert) {
			var sBody = "--batch_id-0123456789012-345\r\n\
Content-Type: application/http\r\n\
Content-Length: 459\r\n\
content-transfer-encoding: binary\r\n\
\r\n\
HTTP/1.1 200 OK\r\n\
Content-Type: application/json;odata.metadata=minimal;charset=UTF-8\r\n\
\r\n\
{\"foo1\":\"bar1\"}\r\n\
--batch_id-0123456789012-345--\r\n";

			assert.throws(function () {
				_Batch.deserializeBatchResponse(sContentType, sBody);
			}, new Error('Invalid $batch response header "Content-Type": ' + sContentType));
		});
	});
});
