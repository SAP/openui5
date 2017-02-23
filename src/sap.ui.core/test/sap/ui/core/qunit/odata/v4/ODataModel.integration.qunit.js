/*!
 * ${copyright}
 */
sap.ui.require([
	"jquery.sap.global",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/odata/OperationMode",
	"sap/ui/model/odata/v4/ODataModel",
	"sap/ui/model/Sorter",
	"sap/ui/test/TestUtils"
], function (jQuery, Filter, FilterOperator, OperationMode, ODataModel, Sorter, TestUtils) {
	/*global QUnit, sinon */
	/*eslint max-nested-callbacks: 0, no-warning-comments: 0 */
	"use strict";

	/**
	 * Creates a V4 OData model.
	 *
	 * @param {string} sServiceUrl The service URL
	 * @param {object} [mModelParameters] Map of parameters for model construction to enhance and
	 *   potentially overwrite the parameters groupId, operationMode, serviceUrl,
	 *   synchronizationMode which are set by default
	 * @returns {sap.ui.model.odata.v4.ODataModel} The model
	 */
	function createModel(sServiceUrl, mModelParameters) {
		var mDefaultParameters = {
				groupId : "$direct",
				operationMode : OperationMode.Server,
				serviceUrl : TestUtils.proxy(sServiceUrl),
				synchronizationMode : "None"
			};

		return new ODataModel(jQuery.extend(mDefaultParameters, mModelParameters));
	}

	/**
	 * Creates a V4 OData model for <code>TEA_BUSI</code>.
	 *
	 * @param {object} [mModelParameters] Map of parameters for model construction to enhance and
	 *   potentially overwrite the parameters groupId, operationMode, serviceUrl,
	 *   synchronizationMode which are set by default
	 * @returns {sap.ui.model.odata.v4.ODataModel} The model
	 */
	function createTeaBusiModel(mModelParameters) {
		return createModel("/sap/opu/odata4/IWBEP/TEA/default/IWBEP/TEA_BUSI/0001/",
			mModelParameters);
	}

	/**
	 * Creates a V4 OData model for <code>GWSAMPLE_BASIC</code>.
	 *
	 * @param {object} [mModelParameters] Map of parameters for model construction to enhance and
	 *   potentially overwrite the parameters groupId, operationMode, serviceUrl,
	 *   synchronizationMode which are set by default
	 * @returns {ODataModel} The model
	 */
	function createSalesOrdersModel(mModelParameters) {
		return createModel(
			"/sap/opu/odata4/IWBEP/V4_SAMPLE/default/IWBEP/V4_GW_SAMPLE_BASIC/0001/",
			mModelParameters);
	}

	//*********************************************************************************************
	QUnit.module("sap.ui.model.odata.v4.ODataModel.integration", {
		beforeEach : function () {
			this.oSandbox = sinon.sandbox.create();
			TestUtils.setupODataV4Server(this.oSandbox, {
				"/sap/opu/odata4/IWBEP/TEA/default/IWBEP/TEA_BUSI/0001/$metadata"
					: {source : "metadata.xml"},
				"/sap/opu/odata4/IWBEP/V4_SAMPLE/default/IWBEP/V4_GW_SAMPLE_BASIC/0001/$metadata"
					: {source : "metadata_GW_SAMPLE_BASIC.xml"}
			});
			this.oLogMock = this.oSandbox.mock(jQuery.sap.log);
			this.oLogMock.expects("warning").never();
			this.oLogMock.expects("error").never();
		},

		afterEach : function () {
			this.oSandbox.verifyAndRestore();
			// avoid calls to formatters by UI5 localization changes in later tests
			this.oView.destroy();
			this.oModel.destroy();
		},

		/**
		 * Executes the given action and checks
		 * (1) if the requests given in "mResponseByRequest" are sent
		 * (2) if the controls have the values given in "mValueByControl"
		 *
		 * @param {object} mResponseByRequest Map of response objects keyed by request path
		 * @param {object} mValueByControl Map of expected value for a control's text
		 *   property by control id; in case the control is created via template in a list, the
		 *   value is an array
		 * @param {function} fnAction The action to be executed
		 * @returns {Promise} Promise resolving when all expected values for controls have been set
		 */
		check : function (mResponseByRequest, mValueByControl, fnAction) {
			var that = this;

			return new Promise(function (resolve) {
				var iFormatterCallCount = 0;

				that.expectRequests(mResponseByRequest);

				Object.keys(mValueByControl).forEach(function (sControlId) {
					var vExpectedValues = mValueByControl[sControlId];

					if (Array.isArray(vExpectedValues)) {
						iFormatterCallCount += vExpectedValues.filter(function (sExpectedValue) {
							return sExpectedValue !== undefined;
						}).length;
					} else if (vExpectedValues !== undefined) {
						iFormatterCallCount += 1;
					}
				});

				that.formatterCallCount = iFormatterCallCount;
				that.resolve = resolve;

				fnAction();

				// no expected values => no formatter calls: need to resolve here
				if (!iFormatterCallCount) {
					resolve();
				}
			});
		},

		/**
		 * Creates a a view with the given content and adds check-formatter functions to Text
		 * controls with the given IDs. The view is attached to the given test.
		 *
		 * @param {object} assert The QUnit assert object
		 * @param {string} sView View content as XML
		 * @param {object} mValueByControl Map of expected value for a control's text
		 *   property by control id; in case the control is created via template in a list, the
		 *   value is an array
		 */
		createView : function (assert, sView, mValueByControl) {
//			assert.ok(true, sView); // uncomment to see XML in output, e.g. in case of parse issues
			var oView = sap.ui.xmlview({
					viewContent : '<mvc:View xmlns="sap.m" xmlns:form="sap.ui.layout.form" '
						+ 'xmlns:mvc="sap.ui.core.mvc">'
						+ sView
						+ '</mvc:View>'
				}),
				that = this;

			Object.keys(mValueByControl).forEach(function (sControlId) {
				var oControl = oView.byId(sControlId);

				oControl.getBindingInfo("text").formatter = function (sValue) {
					var vExpectedValues = mValueByControl[sControlId],
						sExpectedValue = Array.isArray(vExpectedValues)
							? vExpectedValues[this.getBindingContext().getIndex()]
							: vExpectedValues;

					assert.strictEqual(sValue, sExpectedValue, sControlId + ":" + sValue);
					that.formatterCallCount -= 1;
					if (that.formatterCallCount === 0) {
						that.resolve();
					} else if (that.formatterCallCount < 0 && !that.bSloppy) {
						assert.ok(false, "Unexpected call to formatter for control with ID '"
							+ sControlId + "' with value '" + sValue + "'");
					}
				};
			});
			that.oView = oView;
		},

		/**
		 * Add expectations for the requests and responses from the given map with the given method
		 * to the mock on this test's model.
		 *
		 * @param {object} mResponseByRequest
		 *   Map of response objects keyed by request path.
		 *   For sMethod "POST" the response object holds a map of objects with
		 *   $requestHeaders, $requestPayload and $response keyed by request path.
		 *   For sMethod "DELETE" the response object holds a map of objects with
		 *   $requestHeaders keyed by request path.
		 *   For sMethod "GET", a response object is the expected response; if the request path has
		 *   the special value "POST" or "DELETE", it is a map of "POST/DELETE objects" as described
		 *   above, keyed by request path.
		 * @param {string} [sMethod="GET"] The expected request method
		 */
		expectRequests : function (mResponseByRequest, sMethod) {
			var that = this;

			if (!this.oRequestorMock) {
				this.oRequestorMock = this.mock(this.oModel.oRequestor);
				this.oRequestorMock.expects("request").never();
			}

			sMethod = sMethod || "GET";
			Object.keys(mResponseByRequest).forEach(function (sRequest) {
				var mHeaders,
					oPayload,
					oResponse = mResponseByRequest[sRequest];

				if (sRequest === "POST" || sRequest === "DELETE") {
					that.expectRequests(mResponseByRequest[sRequest], sRequest);
					return;
				}
				mHeaders = mResponseByRequest[sRequest].$requestHeaders;
				oPayload = mResponseByRequest[sRequest].$requestPayload;
				oResponse = mResponseByRequest[sRequest].$response || mResponseByRequest[sRequest];
				if (sMethod === "DELETE") {
					that.oRequestorMock.expects("request")
						.withArgs(sMethod, sRequest, "$direct", mHeaders)
						.returns(Promise.resolve());
				} else {
					that.oRequestorMock.expects("request")
						.withArgs(sMethod, sRequest, "$direct", mHeaders, oPayload)
						.returns(Promise.resolve(oResponse));
				}
			});
		},

		/**
		 * Creates a view with the given content and checks
		 * (1) if the requests given in "mResponseByRequest" are sent
		 * (2) if the controls have the values given in "mValueByControl"
		 *
		 * @param {object} assert The QUnit assert object
		 * @param {string} sView View content as XML
		 * @param {object} mResponseByRequest Map of response objects keyed by request path
		 * @param {object} mValueByControl Map of expected value for a control's text
		 *   property by control id; in case the control is created via template in a list, the
		 *   value is an array
		 * @param {sap.ui.model.odata.v4.ODataModel} [oModel] The model; it is attached to the view
		 *   and to the test instance.
		 *   If no model is given, the <code>TEA_BUSI</code> model is created and used.
		 * @param {boolean} [bSloppy] Whether the test does not check if values are only set once
		 *   per control
		 * @returns {Promise} A promise that is resolved when the view is created and all change
		 *   events have been fired
		 */
		viewStart : function (assert, sView, mResponseByRequest, mValueByControl, oModel, bSloppy) {
			var that = this;

			this.bSloppy = bSloppy;
			this.oModel = oModel || createTeaBusiModel();
			this.createView(assert, sView, mValueByControl);
			return this.check(mResponseByRequest, mValueByControl, function () {
				that.oView.setModel(that.oModel);
			});
		}
	});

	/*
	 * Creates a test with the given title and executes viewStart with the given parameters.
	 */
	function testViewStart(sTitle, sView, mResponseByRequest, mValueByControl, oModel, bSloppy) {
		QUnit.test(sTitle, function (assert) {
			return this.viewStart(assert, sView, mResponseByRequest, mValueByControl, oModel,
				bSloppy);
		});
	}

	//*********************************************************************************************
	testViewStart("Absolute ODPB",
		'<Text id="text" text="{/EMPLOYEES(\'2\')/Name}" />',
		{"EMPLOYEES('2')/Name" : {"value" : "Frederic Fall"}},
		{"text" : "Frederic Fall"}
	);

	//*********************************************************************************************
	testViewStart("Absolute ODCB w/o parameters with relative ODPB", '\
<form:SimpleForm binding="{/EMPLOYEES(\'2\')}">\
	<Text id="text" text="{Name}" />\
</form:SimpleForm>',
		{"EMPLOYEES('2')" : {"Name" : "Frederic Fall"}},
		{"text" : "Frederic Fall"}
	);

	//*********************************************************************************************
	testViewStart("Absolute ODCB with parameters and relative ODPB", '\
<form:SimpleForm binding="{path : \'/EMPLOYEES(\\\'2\\\')\', parameters : {$select : \'Name\'}}">\
	<Text id="text" text="{Name}" />\
</form:SimpleForm>',
		{"EMPLOYEES('2')?$select=Name" : {"Name" : "Frederic Fall"}},
		{"text" : "Frederic Fall"}
	);

	//*********************************************************************************************
	testViewStart("Absolute ODLB w/o parameters and relative ODPB", '\
<Table items="{/EMPLOYEES}">\
	<items>\
		<ColumnListItem>\
			<cells>\
				<Text id="text" text="{Name}" />\
			</cells>\
		</ColumnListItem>\
	</items>\
</Table>',
		{"EMPLOYEES?$skip=0&$top=100" :
			{"value" : [{"Name" : "Frederic Fall"}, {"Name" : "Jonathan Smith"}]}},
		{"text" : ["Frederic Fall", "Jonathan Smith"]}
	);

	//*********************************************************************************************
	testViewStart("Absolute ODLB with parameters and relative ODPB", '\
<Table items="{path : \'/EMPLOYEES\', parameters : {$select : \'Name\'}}">\
	<items>\
		<ColumnListItem>\
			<cells>\
				<Text id="text" text="{Name}" />\
			</cells>\
		</ColumnListItem>\
	</items>\
</Table>',
		{"EMPLOYEES?$select=Name&$skip=0&$top=100" :
			{"value" : [{"Name" : "Frederic Fall"}, {"Name" : "Jonathan Smith"}]}},
		{"text" : ["Frederic Fall", "Jonathan Smith"]}
	);

	//*********************************************************************************************
	testViewStart("Absolute ODLB with Filters and Sorters with relative ODPB", '\
<Table items="{path : \'/EMPLOYEES\', parameters : {\
			$select : \'Name\',\
			$filter : \'TEAM_ID eq 42\',\
			$orderby : \'Name desc\'\
		},\
		filters : {path: \'AGE\', operator: \'GT\', value1: 21},\
		sorter : {path : \'AGE\'}\
	}">\
	<items>\
		<ColumnListItem>\
			<cells>\
				<Text id="text" text="{Name}" />\
			</cells>\
		</ColumnListItem>\
	</items>\
</Table>',
		{"EMPLOYEES?$select=Name&$filter=(AGE%20gt%2021)%20and%20(TEAM_ID%20eq%2042)&$orderby=AGE,Name%20desc&$skip=0&$top=100" :
			{"value" : [{"Name" : "Frederic Fall"}, {"Name" : "Jonathan Smith"}]}},
		{"text" : ["Frederic Fall", "Jonathan Smith"]}
	);

	//*********************************************************************************************
	testViewStart("Absolute ODCB with parameters and relative ODLB with parameters", '\
<form:SimpleForm binding="{path : \'/EMPLOYEES(\\\'2\\\')\', parameters : {$select : \'Name\'}}">\
	<Text id="name" text="{Name}" />\
	<Table items="{path : \'EMPLOYEE_2_EQUIPMENTS\', parameters : {$select : \'Category\'}}">\
		<items>\
			<ColumnListItem>\
				<cells>\
					<Text id="category" text="{Category}" />\
				</cells>\
			</ColumnListItem>\
		</items>\
	</Table>\
</form:SimpleForm>',
		{
			"EMPLOYEES('2')?$select=Name" : {"Name" : "Frederic Fall"},
			"EMPLOYEES('2')/EMPLOYEE_2_EQUIPMENTS?$select=Category&$skip=0&$top=100" :
				{"value" : [{"Category" : "Electronics"}, {"Category" : "Furniture"}]}
		},
		{"name" : "Frederic Fall", "category" : ["Electronics", "Furniture"]}
	);

	//*********************************************************************************************
	testViewStart("FunctionImport", '\
<form:SimpleForm binding="{/GetEmployeeByID(EmployeeID=\'2\')}">\
	<Text id="text" text="{Name}" />\
</form:SimpleForm>',
		{"GetEmployeeByID(EmployeeID='2')" : {"Name" : "Frederic Fall"}},
		{"text" : "Frederic Fall"}
	);

	//*********************************************************************************************
	QUnit.test("Relative ODLB inherits parent OBCB's query options on filter", function (assert) {
		var sView = '\
<form:SimpleForm binding="{path : \'/TEAMS(42)\',\
		parameters : {$expand : {TEAM_2_EMPLOYEES : {$orderby : \'AGE\', $select : \'Name\'}}}}">\
	<Table id="table" items="{TEAM_2_EMPLOYEES}">\
		<items>\
			<ColumnListItem>\
				<cells>\
					<Text id="text" text="{Name}" />\
				</cells>\
			</ColumnListItem>\
		</items>\
	</Table>\
</form:SimpleForm>',
			mResponseByRequest = {
				"TEAMS(42)?$expand=TEAM_2_EMPLOYEES($orderby=AGE;$select=Name)" : {
					"TEAM_2_EMPLOYEES" : [
						{"Name" : "Frederic Fall"},
						{"Name" : "Jonathan Smith"},
						{"Name" : "Peter Burke"}
					]
				}
			},
			mValueByControl = {"text" : ["Frederic Fall", "Jonathan Smith", "Peter Burke"]},
			that = this;

		return this.viewStart(assert, sView, mResponseByRequest, mValueByControl).then(function () {
			mResponseByRequest = {
				"TEAMS(42)/TEAM_2_EMPLOYEES?$orderby=AGE&$select=Name&$filter=AGE%20gt%2042&$skip=0&$top=100" :
					{"value" : [{"Name" : "Frederic Fall"}, {"Name" : "Peter Burke"}]}
			};
			mValueByControl.text = [undefined/*unchanged*/, "Peter Burke"];

			return that.check(mResponseByRequest, mValueByControl, function () {
				that.oView.byId("table").getBinding("items")
					.filter(new Filter("AGE", FilterOperator.GT, 42));
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("Absolute ODLB with sort, relative ODCB resolved on selection", function (assert) {
		var sView = '\
<Table id="table" items="{path : \'/EMPLOYEES\', parameters : {$expand : \'EMPLOYEE_2_MANAGER\'}}">\
	<items>\
		<ColumnListItem>\
			<cells>\
				<Text id="name" text="{Name}" />\
			</cells>\
		</ColumnListItem>\
	</items>\
</Table>\
<form:SimpleForm id="form" binding="{EMPLOYEE_2_MANAGER}">\
	<Text id="id" text="{ID}" />\
</form:SimpleForm>',
			mResponseByRequest = {
				"EMPLOYEES?$expand=EMPLOYEE_2_MANAGER&$skip=0&$top=100" : {
					"value" : [
						{"Name" : "Jonathan Smith", "EMPLOYEE_2_MANAGER" : {"ID" : "2"}},
						{"Name" : "Frederic Fall", "EMPLOYEE_2_MANAGER" : {"ID" : "1"}}
					]
				}
			},
			mValueByControl = {"id": [], "name" : ["Jonathan Smith", "Frederic Fall"]},
			that = this;

		return this.viewStart(assert, sView, mResponseByRequest, mValueByControl).then(function () {
			mResponseByRequest = {
				"EMPLOYEES?$expand=EMPLOYEE_2_MANAGER&$orderby=Name&$skip=0&$top=100" : {
					"value" : [
						{"Name" : "Frederic Fall", "EMPLOYEE_2_MANAGER" : {"ID" : "1"}},
						{"Name" : "Jonathan Smith", "EMPLOYEE_2_MANAGER" : {"ID" : "2"}}
					]
				}
			};
			mValueByControl.name = ["Frederic Fall", "Jonathan Smith"];

			return that.check(mResponseByRequest, mValueByControl, function () {
				that.oView.byId("table").getBinding("items").sort(new Sorter("Name"));
			});
		})
		.then(function () {
			mResponseByRequest = {};
			mValueByControl.name = []; // no change expected
			mValueByControl.id = "2";

			return that.check(mResponseByRequest, mValueByControl, function () {
				that.oView.byId("form").setBindingContext(
					that.oView.byId("table").getBinding("items").getCurrentContexts()[1]);
			});
		});
// TODO Why is formatter on property binding in form called twice for the below?
//		.then(function () {
//			mResponseByRequest = {};
//			mValueByControl.id = "1";
//
//			return that.check(that, mResponseByRequest, mValueByControl, function () {
//				that.oView.byId("form").setBindingContext(
//					that.oView.byId("table").getBinding("items").getCurrentContexts()[0]);
//			});
//		});
	});

	//*********************************************************************************************
	//TODO property bindings fire *two* change events from ODPB#checkUpdate: One triggered by
	// ODLB#createContexts, the second triggered by ODLB#refreshInternal where dependent bindings
	// are refreshed
	QUnit.test("Absolute ODLB refresh", function (assert) {
		var sView = '\
<Table id="table" items="{/EMPLOYEES}">\
	<items>\
		<ColumnListItem>\
			<cells>\
				<Text id="name" text="{Name}" />\
			</cells>\
		</ColumnListItem>\
	</items>\
</Table>',
			mResponseByRequest = {
				"EMPLOYEES?$skip=0&$top=100" : {
					"value" : [
						{"Name" : "Jonathan Smith"},
						{"Name" : "Frederic Fall"}
					]
				}
			},
			mValueByControl = {},
//			mValueByControl = {"name" : ["Jonathan Smith", "Frederic Fall"]}, see test TODO
			that = this;

		return this.viewStart(assert, sView, mResponseByRequest, mValueByControl).then(function () {
			mResponseByRequest = {
				"EMPLOYEES?$skip=0&$top=100" : {
					"value" : [
						{"Name" : "Frederic Fall"},
						{"Name" : "Peter Burke"}
					]
				}
			};
			mValueByControl = {};
//			mValueByControl.name = ["Frederic Fall", "Peter Burke"]; see test TODO

			return that.check(mResponseByRequest, mValueByControl, function () {
				that.oView.byId("table").getBinding("items").refresh();
			});
		});
	});

	//*********************************************************************************************
	//TODO Analyze why property binding fires *three* change events
	QUnit.test("Absolute ODCB refresh", function (assert) {
		var sView = '\
<form:SimpleForm id="form" binding="{/EMPLOYEES(\'2\')}">\
	<Text id="text" text="{Name}" />\
</form:SimpleForm>',
			mResponseByRequest = {"EMPLOYEES('2')" : {"Name" : "Jonathan Smith"}},
			mValueByControl = {},
//			mValueByControl = {"text" : "Jonathan Smith"}, see test TODO
			that = this;

		return this.viewStart(assert, sView, mResponseByRequest, mValueByControl).then(function () {
			mResponseByRequest = {"EMPLOYEES('2')" : {"Name" : "Jonathan Schmidt"}};
			mValueByControl = {};
//			mValueByControl.text = "Jonathan Schmidt"; see test TODO

			return that.check(mResponseByRequest, mValueByControl, function () {
				that.oView.byId("form").getObjectBinding().refresh();
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("Absolute ODPB refresh", function (assert) {
		var sView = '<Text id="name" text="{/EMPLOYEES(\'2\')/Name}" />',
			mResponseByRequest = {"EMPLOYEES('2')/Name" : {"value" : "Jonathan Smith"}},
			mValueByControl = {"name" : "Jonathan Smith"},
			that = this;

		return this.viewStart(assert, sView, mResponseByRequest, mValueByControl).then(function () {
			mResponseByRequest = {"EMPLOYEES('2')/Name" : {"value" : "Jonathan Schmidt"}};
			mValueByControl.name = "Jonathan Schmidt";

			return that.check(mResponseByRequest, mValueByControl, function () {
				that.oView.byId("name").getBinding("text").refresh();
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("ActionImport", function (assert) {
		var sView = '\
<form:SimpleForm id="form" binding="{/ChangeTeamBudgetByID(...)}">\
	<Text id="name" text="{Name}" />\
</form:SimpleForm>',
			mResponseByRequest = {},
			//TODO Why is formatter called with null and not undefined?
			mValueByControl = {"name" : null},
			that = this;

		return this.viewStart(assert, sView, mResponseByRequest, mValueByControl).then(function () {
			mResponseByRequest = {
				"POST" : {
					"ChangeTeamBudgetByID" : {
						$requestHeaders : {"If-Match" : undefined},
						$requestPayload : {"Budget" : "1234.1234", "TeamID" : "TEAM_01"},
						$response : {"Name" : "Business Suite"}
					}
				}
			};
			mValueByControl.name = "Business Suite";

			return that.check(mResponseByRequest, mValueByControl, function () {
				that.oView.byId("form").getObjectBinding()
					.setParameter("TeamID", "TEAM_01")
					.setParameter("Budget", "1234.1234")
					.execute();
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("Absolute ODLB changing parameters", function (assert) {
		var sView = '\
<Table id="table" items="{path : \'/EMPLOYEES\', parameters : {$select : \'Name\'}}">\
	<items>\
		<ColumnListItem>\
			<cells>\
				<Text id="name" text="{Name}" />\
			</cells>\
		</ColumnListItem>\
	</items>\
</Table>',
			mResponseByRequest = {
				"EMPLOYEES?$select=Name&$skip=0&$top=100" : {
					"value" : [
						{"Name" : "Jonathan Smith"},
						{"Name" : "Frederic Fall"}
					]
				}
			},
			mValueByControl = {"name" : ["Jonathan Smith", "Frederic Fall"]},
			that = this;

		return this.viewStart(assert, sView, mResponseByRequest, mValueByControl).then(function () {
			mResponseByRequest = {
				"EMPLOYEES?$select=ID,Name&$search=Fall&$skip=0&$top=100" : {
					"value" : [{"ID": "2", "Name" : "Frederic Fall"}]
				}
			};
			mValueByControl.name = ["Frederic Fall"];

			return that.check(mResponseByRequest, mValueByControl, function () {
				that.oView.byId("table").getBinding("items").changeParameters({
					"$search" : "Fall", "$select" : "ID,Name"});
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("Absolute ODCB changing parameters", function (assert) {
		var sView = '\
<form:SimpleForm id="form" binding="{/EMPLOYEES(\'2\')}">\
	<Text id="text" text="{Name}" />\
</form:SimpleForm>',
			mResponseByRequest = {"EMPLOYEES('2')" : {"Name" : "Jonathan Smith"}},
			mValueByControl = {"text" : "Jonathan Smith"},
			that = this;

		return this.viewStart(assert, sView, mResponseByRequest, mValueByControl).then(function () {
			mResponseByRequest = {"EMPLOYEES('2')?$apply=foo" : {"Name" : "Jonathan Schmidt"}};
			mValueByControl.text = "Jonathan Schmidt";

			return that.check(mResponseByRequest, mValueByControl, function () {
				that.oView.byId("form").getObjectBinding().changeParameters({
					"$apply" : "foo"});
			});
		});
	});

	//*********************************************************************************************
	// Scenario: SalesOrders app
	// * Select a sales order so that items are visible
	// * Filter in the items, so that there are less
	// * See that the count decreases
	// The test simplifies it: It filters in the sales orders list directly
	QUnit.test("ODLB: $count and filter()", function (assert) {
		var sView = '\
<Text id="count" text="{$count}"/>\
<Table id="table" items="{path : \'/SalesOrderList\', parameters : {$select : \'SalesOrderID\'}}">\
	<items>\
		<ColumnListItem>\
			<cells>\
				<Text id="id" text="{SalesOrderID}" />\
			</cells>\
		</ColumnListItem>\
	</items>\
</Table>',
			mResponseByRequest = {
				"SalesOrderList?$select=SalesOrderID&$skip=0&$top=100" : {
					"value" : [
						{"SalesOrderID" : "0500000001"},
						{"SalesOrderID" : "0500000002"}
					]
				}
			},
			mValueByControl = {"count": undefined, "id" : ["0500000001", "0500000002"]},
			that = this;

		return this.viewStart(
			assert, sView, mResponseByRequest, mValueByControl, createSalesOrdersModel()
		).then(function () {
			mValueByControl.count = "2";
			delete mValueByControl.id;
			return that.check({}, mValueByControl, function () {
				// code under test
				that.oView.byId("count").setBindingContext(
					that.oView.byId("table").getBinding("items").getHeaderContext());
			});
		}).then(function () {

			mResponseByRequest = {
				"SalesOrderList?$select=SalesOrderID&$filter=SalesOrderID%20gt%20'0500000001'&$skip=0&$top=100" : {
					"value" : [{"SalesOrderID" : "0500000002"}]
				}
			};
			mValueByControl.count = "1";
			mValueByControl.id = ["0500000002"];

			return that.check(mResponseByRequest, mValueByControl, function () {
				// code under test
				that.oView.byId("table").getBinding("items")
					.filter(new Filter("SalesOrderID", FilterOperator.GT, "0500000001"));
			});
		});
	});

	//*********************************************************************************************
	// Scenario: SalesOrders app
	// * Sort the sales orders
	// * Delete a sales order
	// * See that the count decreases
	// The delete is used to change the count (to see that it is still updated)
	QUnit.test("ODLB: $count and sort()", function (assert) {
		var sView = '\
<Text id="count" text="{$count}"/>\
<Table id="table" items="{path : \'/SalesOrderList\', parameters : {$select : \'SalesOrderID\'}}">\
	<items>\
		<ColumnListItem>\
			<cells>\
				<Text id="id" text="{SalesOrderID}" />\
			</cells>\
		</ColumnListItem>\
	</items>\
</Table>',
			mResponseByRequest = {
				"SalesOrderList?$select=SalesOrderID&$skip=0&$top=100" : {
					"value" : [
						{"SalesOrderID" : "0500000001"},
						{"SalesOrderID" : "0500000002"}
					]
				}
			},
			mValueByControl = {"count": undefined, "id" : ["0500000001", "0500000002"]},
			that = this;

		return this.viewStart(
			assert, sView, mResponseByRequest, mValueByControl, createSalesOrdersModel()
		).then(function () {
			mValueByControl.count = "2";
			delete mValueByControl.id;
			return that.check({}, mValueByControl, function () {
				// code under test
				that.oView.byId("count").setBindingContext(
					that.oView.byId("table").getBinding("items").getHeaderContext());
			});
		}).then(function () {
			mResponseByRequest = {
				"SalesOrderList?$select=SalesOrderID&$orderby=SalesOrderID%20desc&$skip=0&$top=100" : {
					"value" : [
						{"SalesOrderID" : "0500000002"},
						{"SalesOrderID" : "0500000001"}
					]
				}
			};
			delete mValueByControl.count;
			mValueByControl.id = ["0500000002", "0500000001"];

			return that.check(mResponseByRequest, mValueByControl, function () {
				// code under test
				that.oView.byId("table").getBinding("items").sort(new Sorter("SalesOrderID", true));
			});
		}).then(function () {
			mResponseByRequest = {
				"DELETE" : {
					"SalesOrderList('0500000002')" : {
						$requestHeaders : {"If-Match" : undefined}
					}
				}
			};
			mValueByControl.count = "1";
			mValueByControl.id = ["0500000001"];

			return that.check(mResponseByRequest, mValueByControl, function () {
				that.oView.byId("table").getItems()[0].getBindingContext().delete();
			});
		});
	});

	//*********************************************************************************************
	// Scenario: (not possible with the SalesOrders app)
	// * Add a filter to the sales orders list using changeParameters(), so that there are less
	// * See that the count decreases
	QUnit.test("ODLB: $count and changeParameters()", function (assert) {
		var sView = '\
<Text id="count" text="{$count}"/>\
<Table id="table" items="{path : \'/SalesOrderList\', parameters : {$select : \'SalesOrderID\'}}">\
	<items>\
		<ColumnListItem>\
			<cells>\
				<Text id="id" text="{SalesOrderID}" />\
			</cells>\
		</ColumnListItem>\
	</items>\
</Table>',
			mResponseByRequest = {
				"SalesOrderList?$select=SalesOrderID&$skip=0&$top=100" : {
					"value" : [
						{"SalesOrderID" : "0500000001"},
						{"SalesOrderID" : "0500000002"}
					]
				}
			},
			mValueByControl = {"count": undefined, "id" : ["0500000001", "0500000002"]},
			that = this;

		return this.viewStart(
			assert, sView, mResponseByRequest, mValueByControl, createSalesOrdersModel()
		).then(function () {
			mValueByControl.count = "2";
			delete mValueByControl.id;
			return that.check({}, mValueByControl, function () {
				// code under test
				that.oView.byId("count").setBindingContext(
					that.oView.byId("table").getBinding("items").getHeaderContext());
			});
		}).then(function () {

			mResponseByRequest = {
				"SalesOrderList?$select=SalesOrderID&$filter=SalesOrderID%20gt%20'0500000001'&$skip=0&$top=100" : {
					"value" : [{"SalesOrderID" : "0500000002"}]
				}
			};
			mValueByControl.count = "1";
			mValueByControl.id = ["0500000002"];

			return that.check(mResponseByRequest, mValueByControl, function () {
				// code under test
				that.oView.byId("table").getBinding("items")
					.changeParameters({$filter : "SalesOrderID gt '0500000001'"});
			});
		});
	});

	//*********************************************************************************************
	// Scenario: SalesOrders app
	// * Select a sales order
	// * Refresh the sales order list
	// * See that the count of the items is still visible
	// The key point is that the parent of the list is a ContextBinding.
	QUnit.test("ODLB: refresh via parent context binding, shared cache", function (assert) {
		var sView = '\
<form:SimpleForm id="form" binding="{path :\'/SalesOrderList(\\\'0500000001\\\')\', parameters : {$expand : {SO_2_SOITEM : {$select : \'ItemPosition\'}}}}">\
	<Text id="count" text="{headerContext>$count}"/>\
	<Table id="table" items="{SO_2_SOITEM}">\
		<items>\
			<ColumnListItem>\
				<cells>\
					<Text id="item" text="{ItemPosition}" />\
				</cells>\
			</ColumnListItem>\
		</items>\
	</Table>\
</form:SimpleForm>',
			mResponseByRequest = {
				"SalesOrderList('0500000001')?$expand=SO_2_SOITEM($select=ItemPosition)" : {
					"SalesOrderID" : "0500000001",
					"SO_2_SOITEM" : [
						{"ItemPosition" : "0000000010"},
						{"ItemPosition" : "0000000020"}
					]
				}
			},
			mValueByControl = {"count": undefined, "item" : ["0000000010", "0000000020"]},
			that = this;

		return this.viewStart(
			assert, sView, mResponseByRequest, mValueByControl, createSalesOrdersModel()
		).then(function () {
			mValueByControl.count = "2";
			delete mValueByControl.item;
			return that.check({}, mValueByControl, function () {
				var oCount = that.oView.byId("count");

				// code under test
				that.oView.setModel(that.oView.getModel(), "headerContext");
				oCount.setBindingContext(
					that.oView.byId("table").getBinding("items").getHeaderContext(),
					"headerContext");
			});
		}).then(function () {
			// Respond with one employee less to show that the refresh must destroy the bindings for
			// the last row. Otherwise the property binding for that row will cause a "Failed to
			// drill down".
			mResponseByRequest = {
				"SalesOrderList('0500000001')?$expand=SO_2_SOITEM($select=ItemPosition)" : {
					"SalesOrderID" : "0500000001",
					"SO_2_SOITEM" : [
						{"ItemPosition" : "0000000010"}
					]
				}
			};
			mValueByControl.count = "1";
			mValueByControl.item = ["0000000010"];

			return that.check(mResponseByRequest, mValueByControl, function () {
				// code under test
				that.oView.byId("form").getObjectBinding().refresh();
			});
		});
	});

	//*********************************************************************************************
	testViewStart("Auto-mode: Absolute ODCB with relative ODPB", '\
<form:SimpleForm binding="{path : \'/EMPLOYEES(\\\'2\\\')\', parameters : {$select : \'AGE,ROOM_ID\'}}">\
	<Text id="name" text="{Name}" />\
	<Text id="city" text="{LOCATION/City/CITYNAME}" />\
</form:SimpleForm>',
		{"EMPLOYEES('2')?$select=AGE,ROOM_ID,Name,LOCATION/City/CITYNAME" : {
			"Name" : "Frederic Fall",
			"LOCATION" : {"City" : {"CITYNAME" : "Walldorf"}}
		}},
		{"name" : "Frederic Fall", "city" : "Walldorf"},
		createTeaBusiModel({autoExpandSelect : true}),
		true //TODO fix two calls to formatter
	);

	//*********************************************************************************************
	//TODO requires enhancement of ODataModel.integration.qunit as refresh causes multiple calls
	//  to formatters (first one with null value)
	QUnit.skip("Auto-mode: Absolute ODCB, refresh", function (assert) {
		var sView = '\
<form:SimpleForm id="form" binding="{path : \'/EMPLOYEES(\\\'2\\\')\', parameters : {$select : \'AGE\'}}">\
	<Text id="name" text="{Name}" />\
</form:SimpleForm>',
			mResponseByRequest = {"EMPLOYEES('2')?$select=AGE,Name" : {
			"Name" : "Jonathan Smith"
		}},
			mValueByControl = {"name" : "Jonathan Smith"},
			that = this;

		return this.viewStart(assert, sView, mResponseByRequest, mValueByControl,
				createTeaBusiModel({autoExpandSelect : true}), true)
			.then(function () {
				mResponseByRequest = {"EMPLOYEES('2')?$select=AGE,Name" : {
					"Name" : "Jonathan Schmidt"
				}};
				mValueByControl.name = "Jonathan Schmidt";

				return that.check(mResponseByRequest, mValueByControl, function () {
					that.oView.byId("form").getObjectBinding().refresh();
			});
		});
	});

	//TODO $batch?
	//TODO test bound action
	//TODO test create
	//TODO test delete
});
