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
	"use strict";

	/**
	 * Creates a V4 OData model for <code>TEA_BUSI</code>.
	 * @returns {ODataModel} The model
	 */
	function createModel() {
		return new ODataModel({
			groupId : "$direct",
			operationMode : OperationMode.Server,
			serviceUrl :
				TestUtils.proxy("/sap/opu/odata4/IWBEP/TEA/default/IWBEP/TEA_BUSI/0001/"),
			synchronizationMode : "None"
		});
	}

	//*********************************************************************************************
	QUnit.module("sap.ui.model.odata.v4.ODataModel.integration", {
		beforeEach : function () {
			this.oSandbox = sinon.sandbox.create();
			TestUtils.setupODataV4Server(this.oSandbox, {
				"/sap/opu/odata4/IWBEP/TEA/default/IWBEP/TEA_BUSI/0001/$metadata"
					: {source : "metadata.xml"}
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
		 * controls with the given IDs and creates a model. The view and the model are attached to
		 * the given test.
		 *
		 * @param {object} assert The QUnit assert object
		 * @param {string} sView View content as XML
		 * @param {object} mValueByControl Map of expected value for a control's text
		 *   property by control id; in case the control is created via template in a list, the
		 *   value is an array
		 */
		createViewAndModel : function (assert, sView, mValueByControl) {
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
					} else if (that.formatterCallCount < 0) {
						assert.ok(false, "Unexpected call to formatter for control with ID '"
							+ sControlId + "' with value '" + sValue + "'");
					}
				};
			});
			that.oModel = createModel();
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
		 *   For sMethod "GET", a response object is the expected response; if the request path has
		 *   the special value "POST", it is a map of "POST objects" as described before keyed by
		 *   request path.
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

				if (sRequest === "POST") {
					that.expectRequests(mResponseByRequest["POST"], "POST");
					return;
				}
				mHeaders = mResponseByRequest[sRequest].$requestHeaders;
				oPayload = mResponseByRequest[sRequest].$requestPayload;
				oResponse = mResponseByRequest[sRequest].$response || mResponseByRequest[sRequest];
				that.oRequestorMock.expects("request")
					.withArgs(sMethod, sRequest, "$direct", mHeaders, oPayload)
					.returns(Promise.resolve(oResponse));
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
		 */
		viewStart : function (assert, sView, mResponseByRequest, mValueByControl) {
			var that = this;

			this.createViewAndModel(assert, sView, mValueByControl);
			return this.check(mResponseByRequest, mValueByControl, function () {
				that.oView.setModel(that.oModel);
			});
		}
	});

	/*
	 * Creates a test with the given title and executes viewStart with the given parameters.
	 */
	function testViewStart(sTitle, sView, mResponseByRequest, mValueByControl) {
		QUnit.test(sTitle, function (assert) {
			return this.viewStart(assert, sView, mResponseByRequest,
				mValueByControl);
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
//			return check(that, mResponseByRequest, mValueByControl, function () {
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
	//TODO $batch?
	//TODO test bound action
	//TODO test create
	//TODO test delete
});
