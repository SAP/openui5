/*!
 * ${copyright}
 */
sap.ui.define([
	"jquery.sap.global",
	"sap/base/Log",
	"sap/ui/model/odata/v4/lib/_Batch",
	"sap/ui/model/odata/v4/lib/_Helper",
	"sap/ui/test/TestUtils"
], function (jQuery, Log, _Batch, _Helper, TestUtils) {
	/*global QUnit */
	/*eslint max-nested-callbacks: 0, no-multi-str: 0, no-warning-comments: 0 */
	"use strict";

	var oEntity = {"@odata.etag" : "W/\"20180830000000.0000000\""},
		oEmployeesBody = {
			"@odata.context": "$metadata#EMPLOYEES",
			"value" : [{
				"ID" : "1",
				"Name" : "Walter\"s Win's",
				"AGE" : 52,
				"ENTRYDATE" : "1977-07-24",
				"MANAGER_ID" : "",
				"ROOM_ID" : "1",
				"TEAM_ID" : "TEAM_01",
				"Is_Manager" : false,
				"LAST_MODIFIED_AT" : "1977-07-24T00:00:00Z",
				"LOCATION" : {
					"COUNTRY" : "Germany",
					"City" : {
						"POSTALCODE" : "69124",
						"CITYNAME" : "Heidelberg"
					}
				},
				"SALARY" : {
					"MONTHLY_BASIC_SALARY_AMOUNT" : 5000.00,
					"BASIC_SALARY_CURR" : "EUR",
					"YEARLY_BONUS_AMOUNT" : 5000.000,
					"BONUS_CURR" : "KWD"
				},
				"STATUS": "Available"
			}, {
				"ID" : "2",
				"Name" : "Frederic Fall",
				"AGE" : 32,
				"ENTRYDATE" : "2003-07-01",
				"MANAGER_ID" : "2",
				"ROOM_ID" : "2",
				"TEAM_ID" : "TEAM_03",
				"Is_Manager" : true,
				"LAST_MODIFIED_AT" : "2003-07-01T00:00:00Z",
				"LOCATION" : {
					"COUNTRY" : "Germany",
					"City" : {
						"POSTALCODE" : "69190",
						"CITYNAME" : "Walldorf"
					}
				},
				"SALARY" : {
					"MONTHLY_BASIC_SALARY_AMOUNT" : 5100.33,
					"BASIC_SALARY_CURR" : "EUR",
					"YEARLY_BONUS_AMOUNT" : 10000.00,
					"BONUS_CURR" : "EUR"
				},
				"STATUS": "Occupied"
			}, {
				"ID" : "3",
				"Name" : "Jonathan Smith",
				"AGE" : 56,
				"ENTRYDATE" : "1977-07-24",
				"MANAGER_ID" : "1",
				"ROOM_ID" : "2",
				"TEAM_ID" : "TEAM_01",
				"Is_Manager" : true,
				"LAST_MODIFIED_AT" : "1977-07-24T00:00:00Z",
				"LOCATION" : {
					"COUNTRY" : "Germany",
					"City" : {
						"POSTALCODE" : "69190",
						"CITYNAME" : "Walldorf"
					}
				},
				"SALARY" : {
					"MONTHLY_BASIC_SALARY_AMOUNT" : 5100.33,
					"BASIC_SALARY_CURR" : "EUR",
					"YEARLY_BONUS_AMOUNT" : 10000.00,
					"BONUS_CURR" : "EUR"
				},
				"STATUS": "Occupied"
			}, {
				"ID" : "4",
				"Name" : "Peter Burke",
				"AGE" : 39,
				"ENTRYDATE" : "2004-09-12",
				"MANAGER_ID" : "3",
				"ROOM_ID" : "2",
				"TEAM_ID" : "TEAM_02",
				"Is_Manager" : false,
				"LAST_MODIFIED_AT" : "2004-09-12T00:00:00Z",
				"LOCATION" : {
					"COUNTRY" : "Germany",
					"City" : {
						"POSTALCODE" : "69190",
						"CITYNAME" : "Walldorf"
					}
				},
				"SALARY" : {
					"MONTHLY_BASIC_SALARY_AMOUNT" : 2689.44,
					"BASIC_SALARY_CURR" : "GBP",
					"YEARLY_BONUS_AMOUNT" : 15000.00,
					"BONUS_CURR" : "USD"
				},
				"STATUS": "Available"
			}, {
				"ID" : "5",
				"Name" : "John Field",
				"AGE" : 42,
				"ENTRYDATE" : "2001-02-01",
				"MANAGER_ID" : "3",
				"ROOM_ID" : "3",
				"TEAM_ID" : "TEAM_02",
				"Is_Manager" : true,
				"LAST_MODIFIED_AT" : "2001-02-01T00:00:00Z",
				"LOCATION" : {
					"COUNTRY" : "Germany",
					"City" : {
						"POSTALCODE" : "69190",
						"CITYNAME" : "Walldorf"
					}
				},
				"SALARY" : {
					"MONTHLY_BASIC_SALARY_AMOUNT" : 2689.44,
					"BASIC_SALARY_CURR" : "GBP",
					"YEARLY_BONUS_AMOUNT" : 15000.00,
					"BONUS_CURR" : "USD"
				},
				"STATUS": "Available"
			}, {
				"ID" : "6",
				"Name" : "Susan Bay",
				"AGE" : 29,
				"ENTRYDATE" : "2010-12-01",
				"MANAGER_ID" : "1",
				"ROOM_ID" : "2",
				"TEAM_ID" : "TEAM_03",
				"Is_Manager" : false,
				"LAST_MODIFIED_AT" : "2010-12-01T00:00:00Z",
				"LOCATION" : {
					"COUNTRY" : "Germany",
					"City" : {
						"POSTALCODE" : "69190",
						"CITYNAME" : "Walldorf"
					}
				},
				"SALARY" : {
					"MONTHLY_BASIC_SALARY_AMOUNT" : 2689.44,
					"BASIC_SALARY_CURR" : "GBP",
					"YEARLY_BONUS_AMOUNT" : 15000.00,
					"BONUS_CURR" : "USD"
				},
				"STATUS": "Occupied"
			}]
		},
		oDepartmentsBody = {
			"value" : [{
				"Sector" : "Consulting",
				"ID" : "1",
				"Name" : "Business Suite Consulting",
				"MemberCount" : 100,
				"ManagerID" : "3"
			}, {
				"Sector" : "Consulting",
				"ID" : "2002",
				"Name" : "BASIS Consulting",
				"MemberCount" : 200,
				"ManagerID" : "4"
			}, {
				"Sector" : "Financials",
				"ID" : "1001",
				"Name" : "Business Suite",
				"MemberCount" : 100,
				"ManagerID" : "5"
			}]
		},
		oNewEmployeeBody = {
			"ID" : "7",
			"Name" : "Egon",
			"AGE" : 17,
			"ENTRYDATE" : "2015-10-01",
			"MANAGER_ID" : "",
			"ROOM_ID" : "",
			"TEAM_ID" : "",
			"Is_Manager" : false,
			"LOCATION" : {
				"COUNTRY" : "",
				"City" : {
					"POSTALCODE" : "",
					"CITYNAME" : ""
				}
			},
			"SALARY" : {
				"MONTHLY_BASIC_SALARY_AMOUNT" : 0.00,
				"BASIC_SALARY_CURR" : "EUR",
				"YEARLY_BONUS_AMOUNT" : 0.00,
				"BONUS_CURR" : "EUR"
			}
		},
		oNewTeamBody =  {
			"Team_Id" : "TEAM_04",
			"Name" : "UI2 Services",
			"MEMBER_COUNT" : 9,
			"MANAGER_ID" : "1",
			"BudgetCurrency" : "EUR",
			"Budget" : 5555
		},
		sServiceUrl = "/sap/opu/odata4/IWBEP/TEA/default/IWBEP/TEA_BUSI/0001/";

	function parseResponses(aResponses) {
		var i, oResponse;
		for (i = 0; i < aResponses.length; i += 1) {
			oResponse = aResponses[i];
			if (Array.isArray(oResponse)) {
				parseResponses(oResponse);
			} else if (aResponses[i].responseText && aResponses[i].status < 400) {
				aResponses[i].responseText =
					JSON.parse(aResponses[i].responseText);
			}
		}
	}

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
		requests : [
			{
				method : "GET",
				url : "Employees('1')"
			}, {
				method : "GET",
				url : "Employees('2')"
			}
		],
		body : "--batch_id-0123456789012-345\r\n" +
		"Content-Type:application/http\r\n" +
		"Content-Transfer-Encoding:binary\r\n" +
		"\r\n" +
		"GET Employees('1') HTTP/1.1\r\n" +
		"\r\n" +
		"\r\n" +
		"--batch_id-0123456789012-345\r\n" +
		"Content-Type:application/http\r\n" +
		"Content-Transfer-Encoding:binary\r\n" +
		"\r\n" +
		"GET Employees('2') HTTP/1.1\r\n" +
		"\r\n" +
		"\r\n" +
		"--batch_id-0123456789012-345--\r\n",
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
		body : "--batch_id-0123456789012-345\r\n" +
		"Content-Type:application/http\r\n" +
		"Content-Transfer-Encoding:binary\r\n" +
		"\r\n" +
		"GET Employees('1')?$select=EmployeeID HTTP/1.1\r\n" +
		"foo:bar1\r\n" +
		"abc:123\r\n" +
		"\r\n" +
		"\r\n" +
		"--batch_id-0123456789012-345\r\n" +
		"Content-Type:application/http\r\n" +
		"Content-Transfer-Encoding:binary\r\n" +
		"\r\n" +
		"GET Employees('2') HTTP/1.1\r\n" +
		"foo:bar2\r\n" +
		"abc:456\r\n" +
		"\r\n" +
		"\r\n" +
		"--batch_id-0123456789012-345--\r\n",
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
				body : {"TEAM_ID" : "TEAM_03"}
			}, {
				method : "PATCH",
				url : "Employees('2')",
				headers : {
					"Content-Type" : "application/json"
				},
				body : {"TEAM_ID" : "TEAM_01"}
			}
		]],
		body : "--batch_id-0123456789012-345\r\n" +
		"Content-Type: multipart/mixed;boundary=changeset_id-9876543210987-654\r\n" +
		"\r\n" +
		"--changeset_id-9876543210987-654\r\n" +
		"Content-Type:application/http\r\n" +
		"Content-Transfer-Encoding:binary\r\n" +
		"Content-ID:0.0\r\n" +
		"\r\n" +
		"PATCH Employees('1') HTTP/1.1\r\n" +
		"Content-Type:application/json\r\n" +
		"\r\n" +
		'{"TEAM_ID":"TEAM_03"}\r\n' +
		"--changeset_id-9876543210987-654\r\n" +
		"Content-Type:application/http\r\n" +
		"Content-Transfer-Encoding:binary\r\n" +
		"Content-ID:1.0\r\n" +
		"\r\n" +
		"PATCH Employees('2') HTTP/1.1\r\n" +
		"Content-Type:application/json\r\n" +
		"\r\n" +
		'{"TEAM_ID":"TEAM_01"}\r\n' +
		"--changeset_id-9876543210987-654--\r\n" +
		"--batch_id-0123456789012-345--\r\n",
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
					body : {"TEAM_ID" : "TEAM_03"}
				}, {
					method : "PATCH",
					url : "Employees('2')",
					headers : {
						"Content-Type" : "application/json"
					},
					body : {"TEAM_ID" : "TEAM_01"}
				}
			],
			{
				method : "PATCH",
				url : "Employees('3')",
				headers : {
					"Content-Type" : "application/json"
				},
				body : {"TEAM_ID" : "TEAM_01"}
			},
			[
				{
					method : "PATCH",
					url : "Employees('3')",
					headers : {
						"Content-Type" : "application/json"
					},
					body : {"TEAM_ID" : "TEAM_02"}
				}, {
					method : "PATCH",
					url : "Employees('4')",
					headers : {
						"Content-Type" : "application/json"
					},
					body : {"TEAM_ID" : "TEAM_01"}
				}
			]
		],
		body : "--batch_id-0123456789012-345\r\n" +
		"Content-Type:application/http\r\n" +
		"Content-Transfer-Encoding:binary\r\n" +
		"\r\n" +
		"GET Employees('1') HTTP/1.1\r\n" +
		"foo:bar1\r\n" +
		"abc:123\r\n" +
		"\r\n" +
		"\r\n" +
		"--batch_id-0123456789012-345\r\n" +
		"Content-Type: multipart/mixed;boundary=changeset_id-9876543210987-654\r\n" +
		"\r\n" +
		"--changeset_id-9876543210987-654\r\n" +
		"Content-Type:application/http\r\n" +
		"Content-Transfer-Encoding:binary\r\n" +
		"Content-ID:0.1\r\n" +
		"\r\n" +
		"PATCH Employees('1') HTTP/1.1\r\n" +
		"Content-Type:application/json\r\n" +
		"\r\n" +
		'{"TEAM_ID":"TEAM_03"}\r\n' +
		"--changeset_id-9876543210987-654\r\n" +
		"Content-Type:application/http\r\n" +
		"Content-Transfer-Encoding:binary\r\n" +
		"Content-ID:1.1\r\n" +
		"\r\n" +
		"PATCH Employees('2') HTTP/1.1\r\n" +
		"Content-Type:application/json\r\n" +
		"\r\n" +
		'{"TEAM_ID":"TEAM_01"}\r\n' +
		"--changeset_id-9876543210987-654--\r\n" +
		"--batch_id-0123456789012-345\r\n" +
		"Content-Type:application/http\r\n" +
		"Content-Transfer-Encoding:binary\r\n" +
		"\r\n" +
		"PATCH Employees('3') HTTP/1.1\r\n" +
		"Content-Type:application/json\r\n" +
		"\r\n" +
		'{"TEAM_ID":"TEAM_01"}\r\n' +
		"--batch_id-0123456789012-345\r\n" +
		"Content-Type: multipart/mixed;boundary=changeset_id-0123456789012-912\r\n" +
		"\r\n" +
		"--changeset_id-0123456789012-912\r\n" +
		"Content-Type:application/http\r\n" +
		"Content-Transfer-Encoding:binary\r\n" +
		"Content-ID:0.3\r\n" +
		"\r\n" +
		"PATCH Employees('3') HTTP/1.1\r\n" +
		"Content-Type:application/json\r\n" +
		"\r\n" +
		'{"TEAM_ID":"TEAM_02"}\r\n' +
		"--changeset_id-0123456789012-912\r\n" +
		"Content-Type:application/http\r\n" +
		"Content-Transfer-Encoding:binary\r\n" +
		"Content-ID:1.3\r\n" +
		"\r\n" +
		"PATCH Employees('4') HTTP/1.1\r\n" +
		"Content-Type:application/json\r\n" +
		"\r\n" +
		'{"TEAM_ID":"TEAM_01"}\r\n' +
		"--changeset_id-0123456789012-912--\r\n" +
		"--batch_id-0123456789012-345--\r\n",
		"Content-Type" : "multipart/mixed; boundary=batch_id-0123456789012-345",
		"MIME-Version" : "1.0"
	}, {
		testTitle : "batch request with content-ID references",
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
					"Team_Id" : "TEAM_05",
					"Name" : "UI2 Services",
					"MEMBER_COUNT" : 9,
					"MANAGER_ID" : "1",
					"BudgetCurrency" : "EUR",
					"Budget" : 5555
				}
			}, {
				method : "POST",
				url : "TEAMS",
				headers : {
					"Content-Type" : "application/json"
				},
				body : {
					"Team_Id" : "TEAM_06",
					"Name" : "UI2 Services",
					"MEMBER_COUNT" : 9,
					"MANAGER_ID" : "1",
					"BudgetCurrency" : "EUR",
					"Budget" : 5555
				}
			}, {
				method : "POST",
				url : "$1/TEAM_2_EMPLOYEES",
				headers : {
					"Content-Type" : "application/json"
				},
				body : oNewEmployeeBody
			}]
		],
		body : "--batch_id-1450426018742-911\r\n" +
		"Content-Type: multipart/mixed;boundary=changeset_id-1450426018742-912\r\n" +
		"\r\n" +
		"--changeset_id-1450426018742-912\r\n" +
		"Content-Type:application/http\r\n" +
		"Content-Transfer-Encoding:binary\r\n" +
		"Content-ID:0.0\r\n" +
		"\r\n" +
		"POST TEAMS HTTP/1.1\r\n" +
		"Content-Type:application/json\r\n" +
		"\r\n" +
		JSON.stringify(oNewTeamBody) + "\r\n" +
		"--changeset_id-1450426018742-912\r\n" +
		"Content-Type:application/http\r\n" +
		"Content-Transfer-Encoding:binary\r\n" +
		"Content-ID:1.0\r\n" +
		"\r\n" +
		"POST $0.0/TEAM_2_EMPLOYEES HTTP/1.1\r\n" +
		"Content-Type:application/json\r\n" +
		"\r\n" +
		JSON.stringify(oNewEmployeeBody) + "\r\n" +
		"--changeset_id-1450426018742-912--\r\n" +
		"--batch_id-1450426018742-911\r\n" +
		"Content-Type: multipart/mixed;boundary=changeset_id-1450426018742-913\r\n" +
		"\r\n" +
		"--changeset_id-1450426018742-913\r\n" +
		"Content-Type:application/http\r\n" +
		"Content-Transfer-Encoding:binary\r\n" +
		"Content-ID:0.1\r\n" +
		"\r\n" +
		"POST TEAMS HTTP/1.1\r\n" +
		"Content-Type:application/json\r\n" +
		"\r\n" +
		'{"Team_Id":"TEAM_05",'
		+ '"Name":"UI2 Services",'
		+ '"MEMBER_COUNT":9,'
		+ '"MANAGER_ID":"1",'
		+ '"BudgetCurrency":"EUR",'
		+ '"Budget":5555}\r\n' +
		"--changeset_id-1450426018742-913\r\n" +
		"Content-Type:application/http\r\n" +
		"Content-Transfer-Encoding:binary\r\n" +
		"Content-ID:1.1\r\n" +
		"\r\n" +
		"POST TEAMS HTTP/1.1\r\n" +
		"Content-Type:application/json\r\n" +
		"\r\n" +
		'{"Team_Id":"TEAM_06",'
		+ '"Name":"UI2 Services",'
		+ '"MEMBER_COUNT":9,'
		+ '"MANAGER_ID":"1",'
		+ '"BudgetCurrency":"EUR",'
		+ '"Budget":5555}\r\n' +
		"--changeset_id-1450426018742-913\r\n" +
		"Content-Type:application/http\r\n" +
		"Content-Transfer-Encoding:binary\r\n" +
		"Content-ID:2.1\r\n" +
		"\r\n" +
		"POST $1.1/TEAM_2_EMPLOYEES HTTP/1.1\r\n" +
		"Content-Type:application/json\r\n" +
		"\r\n" +
		JSON.stringify(oNewEmployeeBody) + "\r\n" +
		"--changeset_id-1450426018742-913--\r\n" +
		"--batch_id-1450426018742-911--\r\n",
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
				body : {"TEAM_ID" : "TEAM_03"}
			}
		]],
		body : "--batch_id-0123456789012-345\r\n" +
		"Content-Type: multipart/mixed;boundary=changeset_id-9876543210987-654\r\n" +
		"\r\n" +
		"--changeset_id-9876543210987-654\r\n" +
		"Content-Type:application/http\r\n" +
		"Content-Transfer-Encoding:binary\r\n" +
		"Content-ID:0.0\r\n" +
		"\r\n" +
		"PATCH Employees('1') HTTP/1.1\r\n" +
		"Content-Type:application/json\r\n" +
		"If-Match:" + oEntity["@odata.etag"] + "\r\n" +
		"\r\n" +
		'{"TEAM_ID":"TEAM_03"}\r\n' +
		"--changeset_id-9876543210987-654--\r\n" +
		"--batch_id-0123456789012-345--\r\n",
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
				body : {"TEAM_ID" : "TEAM_03"}
			}
		]],
		body : "--batch_id-0123456789012-345\r\n" +
		"Content-Type: multipart/mixed;boundary=changeset_id-9876543210987-654\r\n" +
		"\r\n" +
		"--changeset_id-9876543210987-654\r\n" +
		"Content-Type:application/http\r\n" +
		"Content-Transfer-Encoding:binary\r\n" +
		"Content-ID:0.0\r\n" +
		"\r\n" +
		"PATCH Employees('1') HTTP/1.1\r\n" +
		"Content-Type:application/json\r\n" +
		"If-Match:W/\"20151211144619.4328660\"\r\n" +
		"\r\n" +
		'{"TEAM_ID":"TEAM_03"}\r\n' +
		"--changeset_id-9876543210987-654--\r\n" +
		"--batch_id-0123456789012-345--\r\n",
		"Content-Type" : "multipart/mixed; boundary=batch_id-0123456789012-345",
		"MIME-Version" : "1.0"
	}, {
		testTitle : "If-Match: @odata.etag is undefined",
		expectedBoundaryIDs : ["id-0123456789012-345", "id-9876543210987-654"],
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
				body : {"TEAM_ID" : "TEAM_03"}
			}
		]],
		body : "--batch_id-0123456789012-345\r\n" +
		"Content-Type: multipart/mixed;boundary=changeset_id-9876543210987-654\r\n" +
		"\r\n" +
		"--changeset_id-9876543210987-654\r\n" +
		"Content-Type:application/http\r\n" +
		"Content-Transfer-Encoding:binary\r\n" +
		"Content-ID:0.0\r\n" +
		"\r\n" +
		"PATCH Employees('1') HTTP/1.1\r\n" +
		"Content-Type:application/json\r\n" +
		"\r\n" +
		'{"TEAM_ID":"TEAM_03"}\r\n' +
		"--changeset_id-9876543210987-654--\r\n" +
		"--batch_id-0123456789012-345--\r\n",
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
					"Foo" : ""
				},
				body : {"TEAM_ID" : "TEAM_03"}
			}
		]],
		body : "--batch_id-0123456789012-345\r\n" +
		"Content-Type: multipart/mixed;boundary=changeset_id-9876543210987-654\r\n" +
		"\r\n" +
		"--changeset_id-9876543210987-654\r\n" +
		"Content-Type:application/http\r\n" +
		"Content-Transfer-Encoding:binary\r\n" +
		"Content-ID:0.0\r\n" +
		"\r\n" +
		"PATCH Employees('1') HTTP/1.1\r\n" +
		"Content-Type:application/json\r\n" +
		"Foo:\r\n" +
		"\r\n" +
		'{"TEAM_ID":"TEAM_03"}\r\n' +
		"--changeset_id-9876543210987-654--\r\n" +
		"--batch_id-0123456789012-345--\r\n",
		"Content-Type" : "multipart/mixed; boundary=batch_id-0123456789012-345",
		"MIME-Version" : "1.0"
	}].forEach(function (oFixture) {
			QUnit.test("serializeBatchRequest: " + oFixture.testTitle, function (assert) {
				var oBatchRequest,
					oHelperMock = this.mock(_Helper),
					aRequests = JSON.parse(JSON.stringify(oFixture.requests));

				if (oFixture.expectedBoundaryIDs) {
					oFixture.expectedBoundaryIDs.forEach(function (oValue) {
						oHelperMock.expects("uid").returns(oValue);
					});
				} else {
					oHelperMock.expects("uid").returns("id-0123456789012-345");
				}

				oBatchRequest = _Batch.serializeBatchRequest(aRequests);

				assert.deepEqual(aRequests, oFixture.requests, "input remained unchanged");
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
		errorMessage : "Invalid HTTP request method: GET. Change set must contain only POST, " +
		"PUT, PATCH or DELETE requests."
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
		contentType : 'multipart/mixed; boundary=batch_id-0123456789012-345 ; foo=bar',
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
		contentType : 'multipart/mixed; boundary=batch_id-0123456789012-345;foo=bar',
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
		contentType : 'multipart/mixed; boundary=batch_id-0123456789012-345;foo=bar',
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
		contentType : 'multipart/mixed; boundary=batch_id-0123456789012-345;foo=bar',
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
		contentType : 'multipart/mixed; boundary=batch_id-0123456789012-345',
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
		contentType : 'multipart/mixed; boundary=batch_id-0123456789012-345',
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
						"etag" : 'W/"20151211144619.4328660"'
					},
					responseText : '{\"foo1\":\"bar1\"}'
				}, {
					status : 200,
					statusText : "OK",
					headers : {
						"Content-Type" : "application/json;odata.metadata=minimal",
						"Content-Length" : "487",
						"odata-version" : "4.0",
						"etag" : 'W/"20151211144619.4430570"'
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
					"etag" : 'W/"20151211144619.4550440"'
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
						"etag" : 'W/"20151211144619.4660570"'
					},
					responseText : '{\"foo4\":\"bar4\"}'
				}, {
					status : 200,
					statusText : "OK",
					headers : {
						"Content-Type" : "application/json;odata.metadata=minimal",
						"Content-Length" : "486",
						"odata-version" : "4.0",
						"etag" : 'W/"20151211144619.4760440"'
					},
					responseText : '{\"foo5\":\"bar5\"}'
				}
			]
		]
	}].forEach(function (oFixture) {
			QUnit.test("deserializeBatchResponse: " + oFixture.testTitle, function (assert) {
				var aResponses =
					_Batch.deserializeBatchResponse(oFixture.contentType, oFixture.body);
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
		errorMessage : 'Content-ID MIME header missing for the change set response.'
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
		errorMessage : 'Invalid Content-ID value in change set response.'
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

	//*********************************************************************************************
	// Integration Tests with real backend
	if (TestUtils.isRealOData()) {
		// integration tests serialization/deserialization
		// --------------------------------------------
		[{  testTitle : "two get request for employees and departments",
			batchRequests : [{
				method : "GET",
				url : "EMPLOYEES",
				headers : { "Accept" : "application/json" }
			}, {
				method : "GET",
				url : "Departments",
				headers : {"Accept" : "application/json"}
			}],
			expectedResponses : [{
				status : 200,
				statusText : "OK",
				headers : {
					"Content-Type" : /^application\/json;odata\.metadata=minimal/,
					"odata-version" : "4.0"
				},
				responseText : oEmployeesBody
			}, {
				status : 200,
				statusText : "OK",
				headers : {
					"Content-Type" : /^application\/json;odata\.metadata=minimal/,
					"odata-version" : "4.0"
				},
				responseText : oDepartmentsBody
			}]
		},
		// --------------------------------------------
		{   testTitle : "get, delete and post request",
			batchRequests : [{
				method : "GET",
				url : "EMPLOYEES",
				headers : { "Accept" : "application/json"}
			}, {
				method : "DELETE",
				url : "EMPLOYEES('1')",
				headers : {
					"Accept" : "application/json",
					"If-Match" : "W/\"19770724000000.0000000\""
				}
			}, {
				method : "POST",
				url : "EMPLOYEES",
				headers : {
					"Accept" : "application/json",
					"Content-Type" : "application/json;charset=UTF-8"
				},
				// TODO:
				// Nowadays for POST we have to provide all properties, hence we need a new employee
				// with initial values for all properties as gateway strictly checks now that all
				// properties are available
				// -> we may reduce properties again if back-end provides defaulting
				body : {
					"ID" : "7",
					"Name" : "Egon",
					"AGE" : 17,
					"ENTRYDATE" : "2015-10-01",
					"MANAGER_ID" : "",
					"ROOM_ID" : "",
					"TEAM_ID" : "",
					"Is_Manager" : false,
					"LAST_MODIFIED_AT" : "1970-01-01T00:00:00Z",
					"LOCATION" : {
						"COUNTRY" : "",
						"City" : {
							"POSTALCODE" : "",
							"CITYNAME" : ""
						}
					},
					"SALARY" : {
						"MONTHLY_BASIC_SALARY_AMOUNT" : 0.00,
						"BASIC_SALARY_CURR" : "EUR",
						"YEARLY_BONUS_AMOUNT" : 0.00,
						"BONUS_CURR" : "EUR"
					},
					"STATUS" : "Available"
				}
			}],
			expectedResponses : [{
				status : 200,
				statusText : "OK",
				headers : {
					"Content-Type" : /^application\/json;odata\.metadata=minimal/,
					"odata-version" : "4.0"
				},
				responseText : oEmployeesBody
			}, {
				status : 204,
				statusText : "No Content",
				headers : {
					"odata-version" : "4.0"
				},
				responseText : ""
			}, {
				status : 201,
				statusText : "Created",
				headers : {
					"Content-Type" : /^application\/json;odata\.metadata=minimal/,
					"odata-version" : "4.0"
				},
				responseText : oNewEmployeeBody
			}]
		},
		// --------------------------------------------
		{   testTitle : "GET not existing entity set",
			batchRequests : [{
				method : "GET",
				url : "Departments",
				headers : { "Accept" : "application/json"}
			},{
				method : "GET",
				url : "Unknown",
				headers : { "Accept" : "application/json"}
			},{
				method : "GET",
				url : "TEAMS",
				headers : { "Accept" : "application/json"}
			}],
			expectedResponses : [{
				status : 200,
				statusText : "OK",
				headers : {
					"Content-Type" : /^application\/json;odata\.metadata=minimal/,
					"odata-version" : "4.0"
				},
				responseText : oDepartmentsBody
			}, {
				status : 404,
				statusText : "Not Found",
				headers : {
					"Content-Type" : /^application\/json;odata\.metadata=minimal/,
					"odata-version" : "4.0"
				}
			}]
		},
		// --------------------------------------------
		{   testTitle : "POST to not existing entity within change set",
			batchRequests : [{
				method : "GET",
				url : "Departments",
				headers : { "Accept" : "application/json"}
			},
			[
				{
					method : "PATCH",
					url : "EMPLOYEES('1')",
					headers : {
						"Content-Type" : "application/json",
						"If-Match" : "W/\"19770724000000.0000000\""
					},
					body : {"TEAM_ID" : "TEAM_03"}
				}, {
					method : "POST",
					url : "Unknown",
					headers : {
						"Content-Type" : "application/json"
					},
					body : {"bar" : "bar"}
				}
			],
			{
				method : "GET",
				url : "TEAMS",
				headers : { "Accept" : "application/json"}
			}],
			expectedResponses : [{
				status : 200,
				statusText : "OK",
				headers : {
					"Content-Type" : /^application\/json;odata\.metadata=minimal/,
					"odata-version" : "4.0"
				},
				responseText : oDepartmentsBody
			}, {
				status : 404,
				statusText : "Not Found",
				headers : {
					"Content-Type" : /^application\/json;odata\.metadata=minimal/,
					"odata-version" : "4.0"
				}
			}]
		},
		// --------------------------------------------
		{   testTitle : "POST to not exist. entity within change set (odata.continue-on-error)",
			continueOnError : true,
			batchRequests : [{
					method : "GET",
					url : "Departments",
					headers : { "Accept" : "application/json"}
				},
				[
					{
						method : "PATCH",
						url : "EMPLOYEES('1')",
						headers : {
							"Content-Type" : "application/json",
							"If-Match" : "W/\"19770724000000.0000000\""
						},
						body : {"TEAM_ID" : "TEAM_03"}
					}, {
						method : "POST",
						url : "Unknown",
						headers : {
							"Content-Type" : "application/json"
						},
						body : {"bar" : "bar"}
					}
				],
				{
					method : "GET",
					url : "TEAMS",
					headers : { "Accept" : "application/json"}
				}
			],
			expectedResponses : [{
				status : 200,
				statusText : "OK",
				headers : {
					"Content-Type" : /^application\/json;odata\.metadata=minimal/,
					"odata-version" : "4.0"
				},
				responseText : oDepartmentsBody
			}, {
				status : 404,
				statusText : "Not Found",
				headers : {
					"Content-Type" : /^application\/json;odata\.metadata=minimal/,
					"odata-version" : "4.0"
				}
			}, {
				status : 200,
				statusText : "OK",
				headers : {
					"Content-Type" : /^application\/json;odata\.metadata=minimal/,
					"odata-version" : "4.0"
				},
				responseText : {
					"value" : [
						{
							"Budget" : 555.55,
							"BudgetCurrency" : "USD",
							"MANAGER_ID" : "3",
							"MEMBER_COUNT" : 2,
							"Name" : "Business Suite",
							"Team_Id" : "TEAM_01"
						},
						{
							"Budget" : 666.666,
							"BudgetCurrency" : "KWD",
							"MANAGER_ID" : "5",
							"MEMBER_COUNT" : 2,
							"Name" : "SAP NetWeaver Gateway Core",
							"Team_Id" : "TEAM_02"
						},
						{
							"Budget" : 4444,
							"BudgetCurrency" : "JPY",
							"MANAGER_ID" : "2",
							"MEMBER_COUNT" : 2,
							"Name" : "SAP NetWeaver Gateway Content",
							"Team_Id" : "TEAM_03"
						}
					]
				}
			}]
		},
		// --------------------------------------------
		{   testTitle : "changesets and individual requests",
			batchRequests : [{
				method : "GET",
				url : "EMPLOYEES",
				headers : {
					"Accept" : "application/json"
				}
			},
			[
				{
					method : "PATCH",
					url : "EMPLOYEES('1')",
					headers : {
						"Content-Type" : "application/json",
						"If-Match" : "W/\"19770724000000.0000000\""
					},
					body : {"TEAM_ID" : "TEAM_03"}
				}, {
					method : "PATCH",
					url : "EMPLOYEES('2')",
					headers : {
						"Content-Type" : "application/json",
						"If-Match" : "W/\"20030701000000.0000000\""
					},
					body : {"TEAM_ID" : "TEAM_01"}
				}
			],
			{
				method : "PATCH",
				url : "EMPLOYEES('5')",
				headers : {
					"Content-Type" : "application/json",
					"If-Match" : "W/\"20010201000000.0000000\""
				},
				body : {"TEAM_ID" : "TEAM_01"}
			},
			[
				{
					method : "PATCH",
					url : "EMPLOYEES('3')",
					headers : {
						"Content-Type" : "application/json",
						"If-Match" : "W/\"19770724000000.0000000\""
					},
					body : {"TEAM_ID" : "TEAM_02"}
				}, {
					method : "PATCH",
					url : "EMPLOYEES('4')",
					headers : {
						"Content-Type" : "application/json",
						"If-Match" : "W/\"20040912000000.0000000\""
					},
					body : {"TEAM_ID" : "TEAM_01"}
				}
			]],
			expectedResponses : [{
				status : 200,
				statusText : "OK",
				headers : {
					"Content-Type" : /^application\/json;odata\.metadata=minimal/,
					"odata-version" : "4.0"
				},
				responseText : oEmployeesBody
			},
			[
				{
					status : 200,
					statusText : "OK",
					headers : {
						"Content-Type" : /^application\/json;odata\.metadata=minimal/,
						"odata-version" : "4.0"
					},
					responseText : {
						"ID" : "1",
						"Name" : "Walter\"s Win's",
						"AGE" : 52,
						"ENTRYDATE" : "1977-07-24",
						"MANAGER_ID" : "",
						"ROOM_ID" : "1",
						"TEAM_ID" : "TEAM_03",
						"Is_Manager" : false,
						"LOCATION" : {
							"COUNTRY" : "Germany",
							"City" : {
								"POSTALCODE" : "69124",
								"CITYNAME" : "Heidelberg"
							}
						},
						"SALARY" : {
							"MONTHLY_BASIC_SALARY_AMOUNT" : 5000,
							"BASIC_SALARY_CURR" : "EUR",
							"YEARLY_BONUS_AMOUNT" : 5000,
							"BONUS_CURR" : "KWD"
						}
					}
				},
				{
					status : 200,
					statusText : "OK",
					headers : {
						"Content-Type" : /^application\/json;odata\.metadata=minimal/,
						"odata-version" : "4.0"
					},
					responseText : {
						"ID" : "2",
						"Name" : "Frederic Fall",
						"AGE" : 32,
						"ENTRYDATE" : "2003-07-01",
						"MANAGER_ID" : "2",
						"ROOM_ID" : "2",
						"TEAM_ID" : "TEAM_01",
						"Is_Manager" : true,
						"LOCATION" : {
							"COUNTRY" : "Germany",
							"City" : {
								"POSTALCODE" : "69190",
								"CITYNAME" : "Walldorf"
							}
						},
						"SALARY" : {
							"MONTHLY_BASIC_SALARY_AMOUNT" : 5100.33,
							"BASIC_SALARY_CURR" : "EUR",
							"YEARLY_BONUS_AMOUNT" : 10000,
							"BONUS_CURR" : "EUR"
						}
					}
				}
			],
			{
				status : 200,
				statusText : "OK",
				headers : {
					"Content-Type" : /^application\/json;odata\.metadata=minimal/,
					"odata-version" : "4.0"
				},
				responseText : {
					"ID" : "5",
					"Name" : "John Field",
					"AGE" : 42,
					"ENTRYDATE" : "2001-02-01",
					"MANAGER_ID" : "3",
					"ROOM_ID" : "3",
					"TEAM_ID" : "TEAM_01",
					"Is_Manager" : true,
					"LOCATION" : {
						"COUNTRY" : "Germany",
						"City" : {
							"POSTALCODE" : "69190",
							"CITYNAME" : "Walldorf"
						}
					},
					"SALARY" : {
						"MONTHLY_BASIC_SALARY_AMOUNT" : 2689.44,
						"BASIC_SALARY_CURR" : "GBP",
						"YEARLY_BONUS_AMOUNT" : 15000,
						"BONUS_CURR" : "USD"
					}
				}
			},
			[
				{
					status : 200,
					statusText : "OK",
					headers : {
						"Content-Type" : /^application\/json;odata\.metadata=minimal/,
						"odata-version" : "4.0"
					},
					responseText : {
						"ID" : "3",
						"Name" : "Jonathan Smith",
						"AGE" : 56,
						"ENTRYDATE" : "1977-07-24",
						"MANAGER_ID" : "1",
						"ROOM_ID" : "2",
						"TEAM_ID" : "TEAM_02",
						"Is_Manager" : true,
						"LOCATION" : {
							"COUNTRY" : "Germany",
							"City" : {
								"POSTALCODE" : "69190",
								"CITYNAME" : "Walldorf"
							}
						},
						"SALARY" : {
							"MONTHLY_BASIC_SALARY_AMOUNT" : 5100.33,
							"BASIC_SALARY_CURR" : "EUR",
							"YEARLY_BONUS_AMOUNT" : 10000,
							"BONUS_CURR" : "EUR"
						}
					}
				},
				{
					status : 200,
					statusText : "OK",
					headers : {
						"Content-Type" : /^application\/json;odata\.metadata=minimal/,
						"odata-version" : "4.0"
					},
					responseText : {
						"ID" : "4",
						"Name" : "Peter Burke",
						"AGE" : 39,
						"ENTRYDATE" : "2004-09-12",
						"MANAGER_ID" : "3",
						"ROOM_ID" : "2",
						"TEAM_ID" : "TEAM_01",
						"Is_Manager" : false,
						"LOCATION" : {
							"COUNTRY" : "Germany",
							"City" : {
								"POSTALCODE" : "69190",
								"CITYNAME" : "Walldorf"
							}
						},
						"SALARY" : {
							"MONTHLY_BASIC_SALARY_AMOUNT" : 2689.44,
							"BASIC_SALARY_CURR" : "GBP",
							"YEARLY_BONUS_AMOUNT" : 15000,
							"BONUS_CURR" : "USD"
						}
					}
				}
			]]
		},
		// --------------------------------------------
		{   testTitle : "changeset with Content-ID reference",
			// TODO: remove skip as soon as gateway supports Content-ID references
			skip : true,
			batchRequests : [
				[{
					method : "POST",
					url : "TEAMS",
					headers : {
						"Content-Type" : "application/json"
					},
					body : JSON.stringify(oNewTeamBody)
				}, {
					method : "POST",
					url : "$0/TEAM_2_EMPLOYEES",
					headers : {
						"Content-Type" : "application/json"
					},
					body : JSON.stringify(oNewEmployeeBody)
				}]
			],
			expectedResponses : [
				[{
					status : 201,
					statusText : "Created",
					headers : {
						"Content-Type" : /^application\/json;odata\.metadata=minimal/,
						"odata-version" : "4.0"
					},
					responseText : oNewTeamBody
				},
				{
					status : 201,
					statusText : "Created",
					headers : {
						"Content-Type" : /^application\/json;odata\.metadata=minimal/,
						"odata-version" : "4.0"
					},
					responseText : oNewEmployeeBody
				}]]
		}].forEach(function (oFixture) {
			QUnit[oFixture.skip ? "skip" : "test"](
				"Multipart Integration Test: " + oFixture.testTitle,
				function (assert) {
					var oBatchRequestContent,
						done = assert.async();

					oBatchRequestContent = _Batch.serializeBatchRequest(oFixture.batchRequests);

					jQuery.ajax(TestUtils.proxy(sServiceUrl), {
						method : "HEAD",
						headers : {
							"X-CSRF-Token" : "Fetch"
						}
					}).then(function (oData, sTextStatus, jqXHR) {
						var sCsrfToken = jqXHR.getResponseHeader("X-CSRF-Token"),
							oBatchHeaders = {
								"Content-Type" : oBatchRequestContent.headers["Content-Type"],
								"MIME-Version" : oBatchRequestContent.headers["MIME-Version"],
								"X-CSRF-Token" : sCsrfToken
							};

						if (oFixture.continueOnError) {
							oBatchHeaders["Prefer"] = "odata.continue-on-error";
						}

						jQuery.ajax(TestUtils.proxy(sServiceUrl) + '$batch', {
							method : "POST",
							headers : oBatchHeaders,
							data : oBatchRequestContent.body
						}).then(function (oData, sTextStatus, jqXHR) {
							var aResponses;

							assert.strictEqual(jqXHR.status, 200);
							aResponses = _Batch.deserializeBatchResponse(
								jqXHR.getResponseHeader("Content-Type"), oData);

							parseResponses(aResponses);

							TestUtils.deepContains(aResponses, oFixture.expectedResponses);
							done();
						});
					}, function (jqXHR, sTextStatus, sErrorMessage) {
						assert.ok(false, sErrorMessage);
						done();
					});
				}
			);
		});

		// integration tests regarding error handling
		QUnit.test("Multipart Integration Test: response error handling",
			function (assert) {
				var oBatchRequestContent,
					done = assert.async(),
					sResolvedServiceUrl = TestUtils.proxy(sServiceUrl),
					aBatchRequests = [{
						method : "GET",
						url : "EMPLOYEES('9')",
						headers : { "Accept" : "application/json" }
					}];

				oBatchRequestContent = _Batch.serializeBatchRequest(aBatchRequests);

				jQuery.ajax(sResolvedServiceUrl, {
					method : "HEAD",
					headers : {
						"X-CSRF-Token" : "Fetch"
					}
				}).then(function (oData, sTextStatus, jqXHR) {
					var sCsrfToken = jqXHR.getResponseHeader("X-CSRF-Token");
					jQuery.ajax(sResolvedServiceUrl + '$batch', {
						method : "POST",
						headers : {
							"Content-Type" : oBatchRequestContent.headers["Content-Type"],
							"MIME-Version" : oBatchRequestContent.headers["MIME-Version"],
							"X-CSRF-Token" : sCsrfToken
						},
						data : oBatchRequestContent.body
					}).then(function (oData, sTextStatus, jqXHR) {
						var aResponses, oResponse;

						assert.strictEqual(jqXHR.status, 200);
						aResponses = _Batch.deserializeBatchResponse(
							jqXHR.getResponseHeader("Content-Type"), oData);

						assert.strictEqual(aResponses.length, 1);
						oResponse = aResponses[0];

						assert.strictEqual(oResponse.status, 404);
						assert.ok(oResponse.headers["content-language"]);
						done();
					});
				}, function (jqXHR, sTextStatus, sErrorMessage) {
					assert.ok(false, sErrorMessage);
					done();
				});
			}
		);
	}
});