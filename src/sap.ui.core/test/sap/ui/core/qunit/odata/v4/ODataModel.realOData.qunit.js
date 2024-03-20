/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/base/ManagedObject",
	"sap/ui/model/odata/type/String",
	"sap/ui/model/odata/v4/ODataMetaModel",
	"sap/ui/model/odata/v4/ODataModel",
	"sap/ui/model/odata/v4/ValueListType",
	"sap/ui/model/odata/v4/lib/_Batch",
	"sap/ui/model/odata/v4/lib/_Helper",
	"sap/ui/model/odata/v4/lib/_Requestor",
	"sap/ui/test/TestUtils",
	"sap/ui/thirdparty/jquery"
], function (Log, ManagedObject, TypeString, ODataMetaModel, ODataModel, ValueListType, _Batch,
		_Helper, _Requestor, TestUtils, jQuery) {
	"use strict";

	var oDepartmentsBody = {
			value : [{
				Sector : "Consulting",
				ID : "1",
				Name : "Business Suite Consulting",
				MemberCount : 100,
				ManagerID : "3"
			}, {
				Sector : "Consulting",
				ID : "2002",
				Name : "BASIS Consulting",
				MemberCount : 200,
				ManagerID : "4"
			}, {
				Sector : "Financials",
				ID : "1001",
				Name : "Business Suite",
				MemberCount : 100,
				ManagerID : "5"
			}]
		},
		oEmployeesBody = {
			"@odata.context" : "$metadata#EMPLOYEES",
			value : [{
				ID : "1",
				Name : "Walter\"s Win's",
				AGE : 52,
				ENTRYDATE : "1977-07-24",
				MANAGER_ID : "",
				ROOM_ID : "1",
				TEAM_ID : "TEAM_01",
				Is_Manager : false,
				LAST_MODIFIED_AT : "1977-07-24T00:00:00Z",
				LOCATION : {
					COUNTRY : "Germany",
					City : {
						POSTALCODE : "69124",
						CITYNAME : "Heidelberg"
					}
				},
				SALARY : {
					MONTHLY_BASIC_SALARY_AMOUNT : 5000.00,
					BASIC_SALARY_CURR : "EUR",
					YEARLY_BONUS_AMOUNT : 5000.000,
					BONUS_CURR : "KWD"
				},
				STATUS : "Available"
			}, {
				ID : "2",
				Name : "Frederic Fall",
				AGE : 32,
				ENTRYDATE : "2003-07-01",
				MANAGER_ID : "2",
				ROOM_ID : "2",
				TEAM_ID : "TEAM_03",
				Is_Manager : true,
				LAST_MODIFIED_AT : "2003-07-01T00:00:00Z",
				LOCATION : {
					COUNTRY : "Germany",
					City : {
						POSTALCODE : "69190",
						CITYNAME : "Walldorf"
					}
				},
				SALARY : {
					MONTHLY_BASIC_SALARY_AMOUNT : 5100.33,
					BASIC_SALARY_CURR : "EUR",
					YEARLY_BONUS_AMOUNT : 10000.00,
					BONUS_CURR : "EUR"
				},
				STATUS : "Occupied"
			}, {
				ID : "3",
				Name : "Jonathan Smith",
				AGE : 56,
				ENTRYDATE : "1977-07-24",
				MANAGER_ID : "1",
				ROOM_ID : "2",
				TEAM_ID : "TEAM_01",
				Is_Manager : true,
				LAST_MODIFIED_AT : "1977-07-24T00:00:00Z",
				LOCATION : {
					COUNTRY : "Germany",
					City : {
						POSTALCODE : "69190",
						CITYNAME : "Walldorf"
					}
				},
				SALARY : {
					MONTHLY_BASIC_SALARY_AMOUNT : 5100.33,
					BASIC_SALARY_CURR : "EUR",
					YEARLY_BONUS_AMOUNT : 10000.00,
					BONUS_CURR : "EUR"
				},
				STATUS : "Occupied"
			}, {
				ID : "4",
				Name : "Peter Burke",
				AGE : 39,
				ENTRYDATE : "2004-09-12",
				MANAGER_ID : "3",
				ROOM_ID : "2",
				TEAM_ID : "TEAM_02",
				Is_Manager : false,
				LAST_MODIFIED_AT : "2004-09-12T00:00:00Z",
				LOCATION : {
					COUNTRY : "Germany",
					City : {
						POSTALCODE : "69190",
						CITYNAME : "Walldorf"
					}
				},
				SALARY : {
					MONTHLY_BASIC_SALARY_AMOUNT : 2689.44,
					BASIC_SALARY_CURR : "GBP",
					YEARLY_BONUS_AMOUNT : 15000.00,
					BONUS_CURR : "USD"
				},
				STATUS : "Available"
			}, {
				ID : "5",
				Name : "John Field",
				AGE : 42,
				ENTRYDATE : "2001-02-01",
				MANAGER_ID : "3",
				ROOM_ID : "3",
				TEAM_ID : "TEAM_02",
				Is_Manager : true,
				LAST_MODIFIED_AT : "2001-02-01T00:00:00Z",
				LOCATION : {
					COUNTRY : "Germany",
					City : {
						POSTALCODE : "69190",
						CITYNAME : "Walldorf"
					}
				},
				SALARY : {
					MONTHLY_BASIC_SALARY_AMOUNT : 2689.44,
					BASIC_SALARY_CURR : "GBP",
					YEARLY_BONUS_AMOUNT : 15000.00,
					BONUS_CURR : "USD"
				},
				STATUS : "Available"
			}, {
				ID : "6",
				Name : "Susan Bay",
				AGE : 29,
				ENTRYDATE : "2010-12-01",
				MANAGER_ID : "1",
				ROOM_ID : "2",
				TEAM_ID : "TEAM_03",
				Is_Manager : false,
				LAST_MODIFIED_AT : "2010-12-01T00:00:00Z",
				LOCATION : {
					COUNTRY : "Germany",
					City : {
						POSTALCODE : "69190",
						CITYNAME : "Walldorf"
					}
				},
				SALARY : {
					MONTHLY_BASIC_SALARY_AMOUNT : 2689.44,
					BASIC_SALARY_CURR : "GBP",
					YEARLY_BONUS_AMOUNT : 15000.00,
					BONUS_CURR : "USD"
				},
				STATUS : "Occupied"
			}]
		},
		mFixture = {
			"TEAMS('TEAM_01')/Name" : {message : {value : "Business Suite"}}
		},
		oModelInterface = {
			fireSessionTimeout : function () {},
			getGroupProperty : defaultGetGroupProperty,
			isIgnoreETag : function () {},
			onCreateGroup : function () {},
			reportStateMessages : function () {},
			reportTransitionMessages : function () {}
		},
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
		},
		sSampleServiceUrl = "/sap/opu/odata4/sap/zui5_testv4/default/sap/zui5_epm_sample/0002/",
		sServiceUrl = "/sap/opu/odata4/IWBEP/TEA/default/IWBEP/TEA_BUSI/0001/",
		TestControl = ManagedObject.extend("test.sap.ui.model.odata.v4.ODataModel", {
			metadata : {
				properties : {
					text : "string"
				}
			},
			// @see sap.ui.model.DataState and sap.ui.base.ManagedObject#_bindProperty
			refreshDataState : function () {}
		});

	/*
	 * Simulation of {@link sap.ui.model.odata.v4.ODataModel#getGroupProperty}
	 */
	function defaultGetGroupProperty(sGroupId, sPropertyName) {
		if (sPropertyName !== "submit") {
			throw new Error("Unsupported property name: " + sPropertyName);
		}
		if (sGroupId === "$direct") {
			return "Direct";
		}
		if (sGroupId === "$auto") {
			return "Auto";
		}
		return "API";
	}

	function parseResponses(aResponses) {
		var i, oResponse;

		for (i = 0; i < aResponses.length; i += 1) {
			oResponse = aResponses[i];
			if (Array.isArray(oResponse)) {
				parseResponses(oResponse);
			} else if (aResponses[i].responseText && aResponses[i].status < 400) {
				aResponses[i].responseText
					= JSON.parse(aResponses[i].responseText);
			}
		}
	}

	//*********************************************************************************************
	QUnit.module("sap.ui.model.odata.v4.ODataModel.realOData", {
		beforeEach : function () {
			this.oLogMock = this.mock(Log);
			this.oLogMock.expects("warning").never();
			this.oLogMock.expects("error").never();
		},

		/**
		 *  Returns a fake group lock.
		 *
		 *  Expects that <code>getGroupId</code>, <code>getSerialNumber</code> and
		 *  <code>unlock</code> are called once.
		 *
		 * @param {string} [sGroupId="groupId"]
		 *   The group lock's group ID
		 * @returns {object}
		 *   A group lock mock
		 */
		createGroupLock : function (sGroupId) {
			var oGroupLock = {
					getGroupId : function () {},
					getSerialNumber : function () {},
					isCanceled : function () {},
					unlock : function () {}
				};

			this.mock(oGroupLock).expects("getGroupId").withExactArgs()
				.returns(sGroupId || "groupId");
			this.mock(oGroupLock).expects("isCanceled").withExactArgs().returns(false);
			this.mock(oGroupLock).expects("getSerialNumber").withExactArgs().returns(Infinity);
			this.mock(oGroupLock).expects("unlock").withExactArgs();

			return oGroupLock;
		}
	});

	//*********************************************************************************************
	QUnit.test("Early requests: $metadata and annotations", function (assert) {
		var oFetchEntityContainerExpectation
			= this.mock(ODataMetaModel.prototype).expects("fetchEntityContainer")
				.withExactArgs(true),
			oModel;

		if (!TestUtils.isRealOData()) {
			this.mock(_Requestor.prototype).expects("refreshSecurityToken").withExactArgs()
				.resolves();
		}

		// code under test
		oModel = new ODataModel({earlyRequests : true, serviceUrl : sServiceUrl});

		assert.ok(oFetchEntityContainerExpectation.alwaysCalledOn(oModel.getMetaModel()));
	});

	//*********************************************************************************************
	QUnit.test("Property access from ManagedObject w/o context binding", function (assert) {
		var _ = TestUtils.setupODataV4Server(this._oSandbox, mFixture, undefined, sServiceUrl),
			oModel = new ODataModel({serviceUrl : sServiceUrl}), // this test uses $batch w/ $auto
			oControl = new TestControl({models : oModel}),
			done = assert.async();

		oControl.bindProperty("text", {
			path : "/TEAMS('TEAM_01')/Name",
			type : new TypeString()
		});
		// bindProperty creates an ODataPropertyBinding and calls its initialize which results in
		// checkUpdate and a request. The value is updated asynchronously via a change event later
		oControl.getBinding("text").attachChange(function () {
			assert.strictEqual(oControl.getText(), "Business Suite", "property value");
			done();
			String(_); // no-unused-vars ;-)
		});
	});

	//*********************************************************************************************
	QUnit.skip("Property access from ManagedObject w/ context binding", function (assert) {
		var _ = TestUtils.setupODataV4Server(this._oSandbox, mFixture, undefined, sServiceUrl),
			oModel = new ODataModel({serviceUrl : sServiceUrl}),
			oControl = new TestControl({models : oModel}),
			done = assert.async();

		oControl.bindObject("/TEAMS('TEAM_01')");
		oControl.bindProperty("text", {
			path : "Name",
			type : new TypeString()
		});
		// bindProperty creates an ODataPropertyBinding and calls its initialize which results in
		// checkUpdate and a request. The value is updated asynchronously via a change event later
		oControl.getBinding("text").attachChange(function () {
			assert.strictEqual(oControl.getText(), "Business Suite", "property value");
			done();
			String(_); // no-unused-vars ;-)
		});
	});

	//*******************************************************************************************
	if (!TestUtils.isRealOData()) {
		QUnit.skip("Most tests run only with realOData=true");
		return;
	}

	//*****************************************************************************************
	QUnit.test("ODataContextBinding: Action import on navigation property", function () {
		var oModel = new ODataModel({serviceUrl : sServiceUrl}),
			oBinding = oModel.bindContext("EMPLOYEE_2_TEAM/"
				+ "com.sap.gateway.default.iwbep.tea_busi.v0001.AcChangeManagerOfTeam(...)"),
			oParentBinding = oModel.bindContext("/EMPLOYEES('1')", null,
				{$expand : "EMPLOYEE_2_TEAM"});

		// ensure object of bound action is loaded
		return oParentBinding.getBoundContext().requestObject().then(function () {
			oBinding.setContext(oParentBinding.getBoundContext());
			return oBinding.setParameter("ManagerID", "3").invoke();
		});
	});

	//*****************************************************************************************
	QUnit.test("ODataMetaModel: getValueListType, requestValueListInfo", function (assert) {
		var oModel = new ODataModel({serviceUrl : sSampleServiceUrl}),
			oMetaModel = oModel.getMetaModel(),
			sPropertyPath = "/ProductList('HT-1000')/Category";

		return oMetaModel.requestObject("/ProductList/").then(function () {
			assert.strictEqual(oMetaModel.getValueListType(
					"/com.sap.gateway.default.zui5_epm_sample.v0002.Contact/Sex"),
				ValueListType.Fixed);
			assert.strictEqual(oMetaModel.getValueListType(sPropertyPath), ValueListType.Standard);
			return oMetaModel.requestValueListInfo(sPropertyPath).then(function (oResult) {
				var oValueListInfo = oResult[""];

				assert.strictEqual(oValueListInfo.CollectionPath, "H_EPM_PD_CATS_SH_Set");
			});
		});
	});

	//*****************************************************************************************
	QUnit.test("ODataMetaModel#requestValueListInfo: same model w/o reference", function (assert) {
		var oModel = new ODataModel({serviceUrl : sSampleServiceUrl}),
			oMetaModel = oModel.getMetaModel(),
			sPropertyPath = "/ProductList/0/CurrencyCode",
			oValueListMetaModel;

		return oMetaModel.requestObject("/ProductList/").then(function () {
			// value list in the data service
			assert.strictEqual(oMetaModel.getValueListType(sPropertyPath), ValueListType.Standard);
			return oMetaModel.requestValueListInfo(sPropertyPath);
		}).then(function (oValueListInfo) {
			var sPropertyPath2 = "/H_TCURC_SH_Set/1/WAERS";

			// value list in the value list service
			oValueListMetaModel = oValueListInfo[""].$model.getMetaModel();
			assert.strictEqual(oValueListMetaModel.getValueListType(sPropertyPath2),
				ValueListType.Standard);
			assert.strictEqual(oValueListInfo[""].CollectionPath, "H_TCURC_SH_Set");
			return oValueListMetaModel.requestValueListInfo(sPropertyPath2);
		}).then(function (oValueListInfo) {
			assert.strictEqual(oValueListInfo[""].$model.getMetaModel(), oValueListMetaModel);
			assert.strictEqual(oValueListInfo[""].CollectionPath, "TCURC_CT_Set");
		});
	});

	//*****************************************************************************************
	QUnit.test("ODataPropertyBinding: PATCH an entity", function () {
		var oModel = new ODataModel({serviceUrl : sSampleServiceUrl}),
			oControl = new TestControl({
				models : oModel,
				objectBindings : "/BusinessPartnerList('0100000000')",
				text : "{path : 'PhoneNumber', type : 'sap.ui.model.odata.type.String'}"
			}),
			oBinding = oControl.getBinding("text");

		return new Promise(function (resolve, reject) {
			// Note: cannot use "dataReceived" because oControl.getText() === undefined then...
			oBinding.attachEventOnce("change", function () {
				var sPhoneNumber = !oControl.getText().includes("/")
						? "06227/34567"
						: "0622734567";

				// code under test
				oControl.setText(sPhoneNumber);

				// Wait for #setValue to finish (then the response has been processed). The
				// assertion is only that no error/warning logs happen.
				oBinding.getContext().getBinding()
					.attachEventOnce("patchCompleted", function (oEvent) {
						if (oEvent.getParameter("success")) {
							resolve();
						} else {
							reject(new Error("Unexpected error"));
						}
					});
			});
		});
	});

	//*****************************************************************************************
	// integration tests serialization/deserialization
	// --------------------------------------------
	[{
		testTitle : "two get request for employees and departments",
		batchRequests : [{
			method : "GET",
			url : "EMPLOYEES",
			headers : {Accept : "application/json"}
		}, {
			method : "GET",
			url : "Departments",
			headers : {Accept : "application/json"}
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
	{
		testTitle : "get, delete and post request",
		batchRequests : [{
			method : "GET",
			url : "EMPLOYEES",
			headers : {Accept : "application/json"}
		}, {
			method : "DELETE",
			url : "EMPLOYEES('1')",
			headers : {
				Accept : "application/json",
				"If-Match" : "W/\"19770724000000.0000000\""
			}
		}, {
			method : "POST",
			url : "EMPLOYEES",
			headers : {
				Accept : "application/json",
				"Content-Type" : "application/json;charset=UTF-8"
			},
			// TODO:
			// Nowadays for POST we have to provide all properties, hence we need a new employee
			// with initial values for all properties as gateway strictly checks now that all
			// properties are available
			// -> we may reduce properties again if the back end provides defaulting
			body : {
				ID : "7",
				Name : "Egon",
				AGE : 17,
				ENTRYDATE : "2015-10-01",
				MANAGER_ID : "",
				ROOM_ID : "",
				TEAM_ID : "",
				Is_Manager : false,
				LAST_MODIFIED_AT : "1970-01-01T00:00:00Z",
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
				},
				STATUS : "Available"
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
	{
		testTitle : "GET not existing entity set",
		batchRequests : [{
			method : "GET",
			url : "Departments",
			headers : {Accept : "application/json"}
		}, {
			method : "GET",
			url : "Unknown",
			headers : {Accept : "application/json"}
		}, {
			method : "GET",
			url : "TEAMS",
			headers : {Accept : "application/json"}
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
	{
		testTitle : "POST to not existing entity within change set",
		batchRequests : [{
			method : "GET",
			url : "Departments",
			headers : {Accept : "application/json"}
		},
		[
			{
				method : "PATCH",
				url : "EMPLOYEES('1')",
				headers : {
					"Content-Type" : "application/json",
					"If-Match" : "W/\"19770724000000.0000000\""
				},
				body : {TEAM_ID : "TEAM_03"}
			}, {
				method : "POST",
				url : "Unknown",
				headers : {
					"Content-Type" : "application/json"
				},
				body : {bar : "bar"}
			}
		],
		{
			method : "GET",
			url : "TEAMS",
			headers : {Accept : "application/json"}
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
	{
		testTitle : "POST to not exist. entity within change set (odata.continue-on-error)",
		continueOnError : true,
		batchRequests : [{
			method : "GET",
			url : "Departments",
			headers : {Accept : "application/json"}
		}, [
			{
				method : "PATCH",
				url : "EMPLOYEES('1')",
				headers : {
					"Content-Type" : "application/json",
					"If-Match" : "W/\"19770724000000.0000000\""
				},
				body : {TEAM_ID : "TEAM_03"}
			}, {
				method : "POST",
				url : "Unknown",
				headers : {
					"Content-Type" : "application/json"
				},
				body : {bar : "bar"}
			}
		], {
			method : "GET",
			url : "TEAMS",
			headers : {Accept : "application/json"}
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
		}, {
			status : 200,
			statusText : "OK",
			headers : {
				"Content-Type" : /^application\/json;odata\.metadata=minimal/,
				"odata-version" : "4.0"
			},
			responseText : {
				value : [{
					Budget : 555.55,
					BudgetCurrency : "USD",
					MANAGER_ID : "3",
					MEMBER_COUNT : 2,
					Name : "Business Suite",
					Team_Id : "TEAM_01"
				}, {
					Budget : 666.666,
					BudgetCurrency : "KWD",
					MANAGER_ID : "5",
					MEMBER_COUNT : 2,
					Name : "SAP NetWeaver Gateway Core",
					Team_Id : "TEAM_02"
				}, {
					Budget : 4444,
					BudgetCurrency : "JPY",
					MANAGER_ID : "2",
					MEMBER_COUNT : 2,
					Name : "SAP NetWeaver Gateway Content",
					Team_Id : "TEAM_03"
				}]
			}
		}]
	},
	// --------------------------------------------
	{
		testTitle : "changesets and individual requests",
		batchRequests : [{
			method : "GET",
			url : "EMPLOYEES",
			headers : {
				Accept : "application/json"
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
				body : {TEAM_ID : "TEAM_03"}
			}, {
				method : "PATCH",
				url : "EMPLOYEES('2')",
				headers : {
					"Content-Type" : "application/json",
					"If-Match" : "W/\"20030701000000.0000000\""
				},
				body : {TEAM_ID : "TEAM_01"}
			}
		],
		{
			method : "PATCH",
			url : "EMPLOYEES('5')",
			headers : {
				"Content-Type" : "application/json",
				"If-Match" : "W/\"20010201000000.0000000\""
			},
			body : {TEAM_ID : "TEAM_01"}
		},
		[
			{
				method : "PATCH",
				url : "EMPLOYEES('3')",
				headers : {
					"Content-Type" : "application/json",
					"If-Match" : "W/\"19770724000000.0000000\""
				},
				body : {TEAM_ID : "TEAM_02"}
			}, {
				method : "PATCH",
				url : "EMPLOYEES('4')",
				headers : {
					"Content-Type" : "application/json",
					"If-Match" : "W/\"20040912000000.0000000\""
				},
				body : {TEAM_ID : "TEAM_01"}
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
					ID : "1",
					Name : "Walter\"s Win's",
					AGE : 52,
					ENTRYDATE : "1977-07-24",
					MANAGER_ID : "",
					ROOM_ID : "1",
					TEAM_ID : "TEAM_03",
					Is_Manager : false,
					LOCATION : {
							COUNTRY : "Germany",
							City : {
								POSTALCODE : "69124",
								CITYNAME : "Heidelberg"
							}
					},
					SALARY : {
							MONTHLY_BASIC_SALARY_AMOUNT : 5000,
							BASIC_SALARY_CURR : "EUR",
							YEARLY_BONUS_AMOUNT : 5000,
							BONUS_CURR : "KWD"
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
					ID : "2",
					Name : "Frederic Fall",
					AGE : 32,
					ENTRYDATE : "2003-07-01",
					MANAGER_ID : "2",
					ROOM_ID : "2",
					TEAM_ID : "TEAM_01",
					Is_Manager : true,
					LOCATION : {
							COUNTRY : "Germany",
							City : {
								POSTALCODE : "69190",
								CITYNAME : "Walldorf"
							}
					},
					SALARY : {
							MONTHLY_BASIC_SALARY_AMOUNT : 5100.33,
							BASIC_SALARY_CURR : "EUR",
							YEARLY_BONUS_AMOUNT : 10000,
							BONUS_CURR : "EUR"
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
				ID : "5",
				Name : "John Field",
				AGE : 42,
				ENTRYDATE : "2001-02-01",
				MANAGER_ID : "3",
				ROOM_ID : "3",
				TEAM_ID : "TEAM_01",
				Is_Manager : true,
				LOCATION : {
					COUNTRY : "Germany",
					City : {
							POSTALCODE : "69190",
							CITYNAME : "Walldorf"
					}
				},
				SALARY : {
					MONTHLY_BASIC_SALARY_AMOUNT : 2689.44,
					BASIC_SALARY_CURR : "GBP",
					YEARLY_BONUS_AMOUNT : 15000,
					BONUS_CURR : "USD"
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
					ID : "3",
					Name : "Jonathan Smith",
					AGE : 56,
					ENTRYDATE : "1977-07-24",
					MANAGER_ID : "1",
					ROOM_ID : "2",
					TEAM_ID : "TEAM_02",
					Is_Manager : true,
					LOCATION : {
						COUNTRY : "Germany",
						City : {
							POSTALCODE : "69190",
							CITYNAME : "Walldorf"
						}
					},
					SALARY : {
						MONTHLY_BASIC_SALARY_AMOUNT : 5100.33,
						BASIC_SALARY_CURR : "EUR",
						YEARLY_BONUS_AMOUNT : 10000,
						BONUS_CURR : "EUR"
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
					ID : "4",
					Name : "Peter Burke",
					AGE : 39,
					ENTRYDATE : "2004-09-12",
					MANAGER_ID : "3",
					ROOM_ID : "2",
					TEAM_ID : "TEAM_01",
					Is_Manager : false,
					LOCATION : {
						COUNTRY : "Germany",
						City : {
							POSTALCODE : "69190",
							CITYNAME : "Walldorf"
						}
					},
					SALARY : {
						MONTHLY_BASIC_SALARY_AMOUNT : 2689.44,
						BASIC_SALARY_CURR : "GBP",
						YEARLY_BONUS_AMOUNT : 15000,
						BONUS_CURR : "USD"
					}
				}
			}
		]]
	},
	// --------------------------------------------
	{
		testTitle : "changeset with Content-ID reference",
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
			}, {
				status : 201,
				statusText : "Created",
				headers : {
					"Content-Type" : /^application\/json;odata\.metadata=minimal/,
					"odata-version" : "4.0"
				},
				responseText : oNewEmployeeBody
			}]
		]
	}].forEach(function (oFixture) {
		var sTitle = "_Batch: Multipart Integration Test: " + oFixture.testTitle;

		QUnit[oFixture.skip ? "skip" : "test"](sTitle, function (assert) {
			var oBatchRequestContent,
				done = assert.async();

			oBatchRequestContent = _Batch.serializeBatchRequest(oFixture.batchRequests);

			jQuery.ajax(sServiceUrl, {
				method : "HEAD",
				headers : {
					"X-CSRF-Token" : "Fetch"
				}
			}).then(function (_oData, _sTextStatus, jqXHR) {
				var sCsrfToken = jqXHR.getResponseHeader("X-CSRF-Token"),
					oBatchHeaders = {
						"Content-Type" : oBatchRequestContent.headers["Content-Type"],
						"MIME-Version" : oBatchRequestContent.headers["MIME-Version"],
						"X-CSRF-Token" : sCsrfToken
					};

				if (oFixture.continueOnError) {
					oBatchHeaders["Prefer"] = "odata.continue-on-error";
				}

				jQuery.ajax(sServiceUrl + "$batch", {
					method : "POST",
					headers : oBatchHeaders,
					data : oBatchRequestContent.body
				}).then(function (oData, _sTextStatus, jqXHR) {
					var aResponses;

					assert.strictEqual(jqXHR.status, 200);
					aResponses = _Batch.deserializeBatchResponse(
						jqXHR.getResponseHeader("Content-Type"), oData);

					parseResponses(aResponses);

					TestUtils.deepContains(aResponses, oFixture.expectedResponses);
					done();
				});
			}, function (_jqXHR, _sTextStatus, sErrorMessage) {
				assert.ok(false, sErrorMessage);
				done();
			});
		});
	});

	//*****************************************************************************************
	// integration tests regarding error handling
	QUnit.test("_Batch: Multipart Integration Test: response error handling", function (assert) {
		var oBatchRequestContent,
			done = assert.async(),
			sResolvedServiceUrl = sServiceUrl,
			aBatchRequests = [{
				method : "GET",
				url : "EMPLOYEES('9')",
				headers : {Accept : "application/json"}
			}];

		oBatchRequestContent = _Batch.serializeBatchRequest(aBatchRequests);

		jQuery.ajax(sResolvedServiceUrl, {
			method : "HEAD",
			headers : {
				"X-CSRF-Token" : "Fetch"
			}
		}).then(function (_oData, _sTextStatus, jqXHR) {
			var sCsrfToken = jqXHR.getResponseHeader("X-CSRF-Token");

			jQuery.ajax(sResolvedServiceUrl + "$batch", {
				method : "POST",
				headers : {
					"Content-Type" : oBatchRequestContent.headers["Content-Type"],
					"MIME-Version" : oBatchRequestContent.headers["MIME-Version"],
					"X-CSRF-Token" : sCsrfToken
				},
				data : oBatchRequestContent.body
			}).then(function (oData, _sTextStatus, jqXHR) {
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
		}, function (_jqXHR, _sTextStatus, sErrorMessage) {
			assert.ok(false, sErrorMessage);
			done();
		});
	});

	//*****************************************************************************************
	QUnit.test("_Helper: Integration test for formatLiteral", function (assert) {
		var done = assert.async();

		jQuery.ajax(sSampleServiceUrl + "BusinessPartnerList?"
			+ "$filter=CompanyName eq + " + _Helper.formatLiteral("Becker Berlin", "Edm.String")
			, {method : "GET"}
		).then(function (oData) {
			assert.strictEqual(oData.value[0].CompanyName, "Becker Berlin");
			done();
		});
	});

	//*****************************************************************************************
	QUnit.test("_Requestor: request(...)/processBatch success", function (assert) {
		var oRequestor = _Requestor.create(sServiceUrl, oModelInterface),
			sResourcePath = "TEAMS('TEAM_01')",
			that = this;

		function assertResult(oPayload) {
			delete oPayload["@odata.metadataEtag"];
			assert.deepEqual(oPayload, {
				"@odata.context" : "$metadata#TEAMS/$entity",
				Team_Id : "TEAM_01",
				Name : "Business Suite",
				MEMBER_COUNT : 2,
				MANAGER_ID : "3",
				BudgetCurrency : "USD",
				Budget : "555.55"
			});
		}

		return oRequestor.request("GET", sResourcePath).then(assertResult).then(function () {
			return Promise.all([
				oRequestor.request("GET", sResourcePath, that.createGroupLock()).then(assertResult),
				oRequestor.request("GET", sResourcePath, that.createGroupLock()).then(assertResult),
				oRequestor.processBatch("groupId")
			]);
		});
	});

	//*****************************************************************************************
	QUnit.test("_Requestor: request(...)/processBatch fail", function (assert) {
		var oRequestor = _Requestor.create(sServiceUrl, oModelInterface);

		oRequestor.request(
			"GET", "TEAMS('TEAM_01')", this.createGroupLock()
		).then(function (oResult) {
			delete oResult["@odata.metadataEtag"];
			assert.deepEqual(oResult, {
				"@odata.context" : "$metadata#TEAMS/$entity",
				Team_Id : "TEAM_01",
				Name : "Business Suite",
				MEMBER_COUNT : 2,
				MANAGER_ID : "3",
				BudgetCurrency : "USD",
				Budget : "555.55"
			});
		}, function (oError) {
			assert.ok(false, oError);
		});

		oRequestor.request("GET", "fail", this.createGroupLock()).then(function (oResult) {
			assert.ok(false, oResult);
		}, function (oError) {
			assert.ok(oError instanceof Error);
			assert.strictEqual(typeof oError.error, "object");
			assert.strictEqual(typeof oError.message, "string");
			assert.strictEqual(oError.status, 404);
		});

		// code under test
		return oRequestor.processBatch("groupId").then(function (oResult) {
			assert.strictEqual(oResult, undefined);
		});
	});

	//*****************************************************************************************
	QUnit.test("_Requestor: request(ProductList)/processBatch patch", function () {
		var oBody = {Name : "modified by QUnit test"},
			oRequestor = _Requestor.create(sSampleServiceUrl, oModelInterface),
			sResourcePath = "ProductList('HT-1001')";

		// code under test
		return Promise.all([
			oRequestor.request("PATCH", sResourcePath, this.createGroupLock(), {
					"If-Match" : {"@odata.etag" : "*"}
				}, oBody)
			.then(function (oResult) {
				TestUtils.deepContains(oResult, oBody);
			}),
			oRequestor.processBatch("groupId")
		]);
	});

	//*****************************************************************************************
	QUnit.test("_Requestor: processBatch (real OData): error in change set", function (assert) {
		var sCommonMessage,
			oEntity = {
				"@odata.etag" : "*"
			},
			fnMergeRequests = function () {},
			oRequestor = _Requestor.create(sSampleServiceUrl, oModelInterface);

		function onError(sRequestUrl, oError) {
			if (sCommonMessage) {
				assert.strictEqual(oError.message, sCommonMessage);
			} else {
				sCommonMessage = oError.message;
			}
			assert.strictEqual(oError.requestUrl, sRequestUrl);
		}

		// code under test
		return Promise.all([
			oRequestor.request("PATCH", "ProductList('HT-1001')", this.createGroupLock(),
					{"If-Match" : oEntity}, {Name : "foo"}, undefined, undefined, undefined,
					undefined, undefined, undefined, undefined, fnMergeRequests)
				.then(undefined,
					onError.bind(null, sSampleServiceUrl + "ProductList('HT-1001')")),
			oRequestor.request("POST", "Unknown", this.createGroupLock(), undefined, {})
				.then(undefined, onError.bind(null, sSampleServiceUrl + "Unknown")),
			oRequestor.request("PATCH", "ProductList('HT-1001')", this.createGroupLock(),
					{"If-Match" : oEntity}, {Name : "bar"}, undefined, undefined, undefined,
					undefined, undefined, undefined, undefined, fnMergeRequests)
				.then(undefined,
					onError.bind(null, sSampleServiceUrl + "ProductList('HT-1001')")),
			oRequestor.request("GET", "SalesOrderList?$skip=0&$top=10", this.createGroupLock())
				.then(undefined, function (oError) {
					assert.strictEqual(oError.message,
						"HTTP request was not processed because the previous request failed");
					assert.strictEqual(oError.$reported, true);
				}),
			oRequestor.processBatch("groupId")
		]);
	});
});
