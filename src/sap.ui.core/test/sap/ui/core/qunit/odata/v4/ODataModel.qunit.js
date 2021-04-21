/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/base/SyncPromise",
	"sap/ui/core/Element",
	"sap/ui/core/message/Message",
	"sap/ui/model/Binding",
	"sap/ui/model/BindingMode",
	"sap/ui/model/Context",
	"sap/ui/model/Model",
	"sap/ui/model/odata/OperationMode",
	"sap/ui/model/odata/type/String",
	"sap/ui/model/odata/v4/Context",
	"sap/ui/model/odata/v4/ODataMetaModel",
	"sap/ui/model/odata/v4/ODataModel",
	"sap/ui/model/odata/v4/SubmitMode",
	"sap/ui/model/odata/v4/lib/_Helper",
	"sap/ui/model/odata/v4/lib/_MetadataRequestor",
	"sap/ui/model/odata/v4/lib/_Parser",
	"sap/ui/model/odata/v4/lib/_Requestor",
	"sap/ui/test/TestUtils",
	"sap/ui/core/library"
], function (Log, SyncPromise, Element, Message, Binding, BindingMode, BaseContext, Model,
		OperationMode, TypeString, Context, ODataMetaModel, ODataModel, SubmitMode, _Helper,
		_MetadataRequestor, _Parser, _Requestor, TestUtils, library) {
	"use strict";

	// shortcut for sap.ui.core.MessageType
	var MessageType = library.MessageType;

	/*
	 * You can run various tests in this module against a real OData V4 service using the request
	 * property "realOData". See src/sap/ui/test/TestUtils.js for details.
	 */

	var sClassName = "sap.ui.model.odata.v4.ODataModel",
		mFixture = {
			"TEAMS('TEAM_01')/Name" : {source : "Name.json"},
			"TEAMS('UNKNOWN')" : {code : 404, source : "TEAMS('UNKNOWN').json"}
		},
		sServiceUrl = "/sap/opu/odata4/IWBEP/TEA/default/IWBEP/TEA_BUSI/0001/",
		TestControl = Element.extend("test.sap.ui.model.odata.v4.ODataModel", {
			metadata : {
				properties : {
					text : "string"
				}
			}
		});

	/**
	 * Returns a URL within the service that (in case of <code>bRealOData</code>), is passed
	 * through a proxy.
	 *
	 * @param {string} [sPath]
	 *   relative path (with initial /) within service
	 * @returns {string}
	 *   a URL within the service
	 */
	function getServiceUrl(sPath) {
		return TestUtils.proxy(sServiceUrl + (sPath && sPath.slice(1) || ""));
	}

	//*********************************************************************************************
	QUnit.module("sap.ui.model.odata.v4.ODataModel", {
		beforeEach : function () {
			TestUtils.setupODataV4Server(this._oSandbox, mFixture, undefined, sServiceUrl);
			this.oLogMock = this.mock(Log);
			this.oLogMock.expects("warning").never();
			this.oLogMock.expects("error").never();
			this.mock(sap.ui.getCore().getConfiguration()).expects("getLanguageTag").atLeast(0)
				.returns("ab-CD");
		},

		afterEach : function () {
			return TestUtils.awaitRendering();
		},

		/**
		 * Creates a V4 OData service for <code>TEA_BUSI</code>. Blocks prerendering tasks to avoid
		 * unnecessary calls to setTimeout which may disturb the addPrerenderingTask tests. Tests
		 * that need addPrerenderingTask must explicitely request it.
		 *
		 * @param {string} [sQuery] URI query parameters starting with '?'
		 * @param {object} [mParameters] additional model parameters
		 * @param {boolean} [bAllowPrerenderingTasks] avoids that addPrerenderingTasks is blocked
		 * @returns {sap.ui.model.odata.v4.oDataModel} the model
		 */
		createModel : function (sQuery, mParameters, bAllowPrerenderingTasks) {
			var oModel = new ODataModel(Object.assign({}, mParameters, {
					serviceUrl : getServiceUrl() + (sQuery || ""),
					synchronizationMode : "None"
				}));

			if (!bAllowPrerenderingTasks) {
				this.stub(oModel, "addPrerenderingTask");
			}
			return oModel;
		}
	});

	//*********************************************************************************************
	QUnit.test("basics", function (assert) {
		var oMetadataRequestor = {},
			oMetaModel,
			oModel,
			oModelPrototypeMock = this.mock(ODataModel.prototype),
			mUriParameters = {"sap-client" : "279"};

		assert.throws(function () {
			return new ODataModel();
		}, new Error("Synchronization mode must be 'None'"));
		assert.throws(function () {
			return new ODataModel({synchronizationMode : "None"});
		}, new Error("Missing service root URL"));
		assert.throws(function () {
			return new ODataModel({serviceUrl : "/foo", synchronizationMode : "None"});
		}, new Error("Service root URL must end with '/'"));
		assert.throws(function () {
			return new ODataModel({synchronizationMode : "None", useBatch : true});
		}, new Error("Unsupported parameter: useBatch"));
		assert.throws(function () {
			return new ODataModel({operationMode : OperationMode.Auto, serviceUrl : "/foo/",
				synchronizationMode : "None"});
		}, new Error("Unsupported operation mode: Auto"), "Unsupported OperationMode");

		oModelPrototypeMock.expects("initializeSecurityToken").never();

		// code under test: operation mode Server must not throw an error
		oModel = this.createModel("", {operationMode : OperationMode.Server, serviceUrl : "/foo/",
			synchronizationMode : "None"});

		assert.strictEqual(oModel.sOperationMode, OperationMode.Server);

		this.mock(ODataModel.prototype).expects("buildQueryOptions")
			.withExactArgs({}, false, true).returns(mUriParameters);
		this.mock(_MetadataRequestor).expects("create")
			.withExactArgs({"Accept-Language" : "ab-CD"}, "4.0", mUriParameters)
			.returns(oMetadataRequestor);
		this.mock(ODataMetaModel.prototype).expects("fetchEntityContainer").withExactArgs(true);
		oModelPrototypeMock.expects("initializeSecurityToken").withExactArgs();

		// code under test
		oModel = this.createModel("",
			{earlyRequests : true, annotationURI : ["my/annotations.xml"]});

		assert.strictEqual(oModel.sServiceUrl, getServiceUrl());
		assert.strictEqual(oModel.toString(), sClassName + ": " + getServiceUrl());
		assert.strictEqual(oModel.mUriParameters, mUriParameters);
		assert.strictEqual(oModel.getDefaultBindingMode(), BindingMode.TwoWay);
		assert.strictEqual(oModel.isBindingModeSupported(BindingMode.OneTime), true);
		assert.strictEqual(oModel.isBindingModeSupported(BindingMode.OneWay), true);
		assert.strictEqual(oModel.isBindingModeSupported(BindingMode.TwoWay), true);
		assert.strictEqual(oModel.bSharedRequests, false);
		assert.deepEqual(oModel.aAllBindings, []);
		assert.strictEqual(oModel.aPrerenderingTasks, null);
		oMetaModel = oModel.getMetaModel();
		assert.ok(oMetaModel instanceof ODataMetaModel);
		assert.strictEqual(oMetaModel.oRequestor, oMetadataRequestor);
		assert.strictEqual(oMetaModel.sUrl, getServiceUrl() + "$metadata");
		assert.deepEqual(oMetaModel.aAnnotationUris, ["my/annotations.xml"]);
	});

	//*********************************************************************************************
	QUnit.test("metadataUrlParams", function () {
		var mUriParameters = {
				"sap-client" : "279",
				"sap-context-token" : "n/a"
			};

		this.mock(ODataModel.prototype).expects("buildQueryOptions")
			.withExactArgs({}, false, true).returns(mUriParameters);
		this.mock(_MetadataRequestor).expects("create")
			.withExactArgs({"Accept-Language" : "ab-CD"}, "4.0", {
				"sap-client" : "279",
				"sap-context-token" : "20200716120000",
				"sap-language" : "en"
			});
		this.mock(_Requestor).expects("create")
			.withExactArgs(getServiceUrl(), sinon.match.object, {"Accept-Language" : "ab-CD"},
				{"sap-client" : "279", "sap-context-token" : "n/a"}, "4.0")
			.callThrough();

		// code under test
		this.createModel("", {
			metadataUrlParams : {
				"sap-context-token" : "20200716120000",
				"sap-language" : "en"
			}
		});
	});

	//*********************************************************************************************
	QUnit.test("sharedRequests", function (assert) {
		var oModel;

		// code under test
		oModel = this.createModel("", {sharedRequests : true});

		assert.strictEqual(oModel.getDefaultBindingMode(), BindingMode.OneWay);
		assert.strictEqual(oModel.isBindingModeSupported(BindingMode.OneTime), true);
		assert.strictEqual(oModel.isBindingModeSupported(BindingMode.OneWay), true);
		assert.strictEqual(oModel.isBindingModeSupported(BindingMode.TwoWay), false);
		assert.strictEqual(oModel.bSharedRequests, true);

		[false, 0, "", undefined, 1, "X"].forEach(function (vSharedRequests) {
			assert.throws(function () {
				this.createModel("", {sharedRequests : vSharedRequests});
			}, new Error("Value for sharedRequests must be true"));
		});
	});

	//*********************************************************************************************
	QUnit.test("Early requests: $metadata and annotations", function (assert) {
		var oFetchEntityContainerExpectation
			= this.mock(ODataMetaModel.prototype).expects("fetchEntityContainer")
				.withExactArgs(true),
			oModel;

		// code under test
		oModel = this.createModel("", {earlyRequests : true});

		assert.ok(oFetchEntityContainerExpectation.alwaysCalledOn(oModel.getMetaModel()));
	});

	//*********************************************************************************************
	QUnit.test("supportReferences", function () {
		this.createModel("", {supportReferences : false});
	});

	//*********************************************************************************************
	QUnit.test("unsupported OData version", function (assert) {
		assert.throws(function () {
			this.createModel("", {odataVersion : "foo"});
		}, new Error("Unsupported value for parameter odataVersion: foo"));
	});

	//*********************************************************************************************
	["2.0", "4.0"].forEach(function (sODataVersion) {
		QUnit.test("create requestors for odataVersion: " + sODataVersion, function (assert) {
			var fnMetadataRequestorCreateSpy, oModel, fnRequestorCreateSpy;

			fnRequestorCreateSpy = this.mock(_Requestor).expects("create")
				.withExactArgs(getServiceUrl(), sinon.match.object, {"Accept-Language" : "ab-CD"},
					sinon.match.object, sODataVersion)
				.returns({
					checkForOpenRequests : function () {},
					checkHeaderNames : function () {}
				});
			fnMetadataRequestorCreateSpy = this.mock(_MetadataRequestor).expects("create")
				.withExactArgs({"Accept-Language" : "ab-CD"}, sODataVersion, sinon.match.object)
				.returns({});

			// code under test
			oModel = this.createModel("", {odataVersion : sODataVersion});

			assert.strictEqual(oModel.getODataVersion(), sODataVersion);
			assert.notStrictEqual(fnRequestorCreateSpy.args[0][2],
				fnMetadataRequestorCreateSpy.args[0][0]);
			assert.strictEqual(fnRequestorCreateSpy.args[0][2], oModel.mHeaders);
			assert.strictEqual(fnMetadataRequestorCreateSpy.args[0][0], oModel.mMetadataHeaders);
		});
	});

	//*********************************************************************************************
	QUnit.test("with serviceUrl params", function (assert) {
		var oModel,
			mUriParameters = {};

		this.mock(ODataModel.prototype).expects("buildQueryOptions")
			.withExactArgs({"sap-client" : "111"}, false, true)
			.returns(mUriParameters);

		// code under test
		oModel = this.createModel("?sap-client=111");

		assert.strictEqual(oModel.sServiceUrl, getServiceUrl());
		assert.strictEqual(oModel.mUriParameters, mUriParameters);
	});

	//*********************************************************************************************
	QUnit.test("Model construction with group ID", function (assert) {
		var oModel;

		oModel = this.createModel();
		assert.strictEqual(oModel.getGroupId(), "$auto");

		oModel = this.createModel("", {groupId : "$direct"});
		assert.strictEqual(oModel.getGroupId(), "$direct");

		oModel = this.createModel("", {groupId : "$auto"});
		assert.strictEqual(oModel.getGroupId(), "$auto");

		assert.throws(function () {
			oModel = this.createModel("", {groupId : "foo"});
		}, new Error("Group ID must be '$auto' or '$direct'"));
	});

	//*********************************************************************************************
	QUnit.test("Model construction with update group ID", function (assert) {
		var oModel;

		oModel = this.createModel();
		assert.strictEqual(oModel.getUpdateGroupId(), "$auto");

		oModel = this.createModel("", {groupId : "$direct"});
		assert.strictEqual(oModel.getUpdateGroupId(), "$direct");

		oModel = this.createModel("", {updateGroupId : "$direct"});
		assert.strictEqual(oModel.getUpdateGroupId(), "$direct");

		oModel = this.createModel("", {groupId : "$direct", updateGroupId : "applicationId"});
		assert.strictEqual(oModel.getUpdateGroupId(), "applicationId");

		assert.throws(function () {
			oModel = this.createModel("", {updateGroupId : "$foo"});
		}, new Error("Invalid update group ID: $foo"));
	});

	//*********************************************************************************************
	QUnit.test("Model construction with groupProperties, getGroupProperty", function (assert) {
		var oDefaultGroupProperties = {
				"$auto" : {submit : SubmitMode.Auto},
				"$direct" : {submit : SubmitMode.Direct}
			},
			oGroupProperties = {
				"myGroup0" : {submit : SubmitMode.API},
				"myGroup1" : {submit : SubmitMode.Auto},
				"myGroup2" : {submit : SubmitMode.Direct}
			},
			oModel;

		// code under test
		oModel = this.createModel("");
		assert.deepEqual(oModel.mGroupProperties, oDefaultGroupProperties);

		// code under test
		oModel = this.createModel("", {groupProperties : oGroupProperties});
		assert.deepEqual(oModel.mGroupProperties,
			Object.assign(oDefaultGroupProperties, oGroupProperties));

		// code under test
		assert.strictEqual(oModel.getGroupProperty("$auto", "submit"), SubmitMode.Auto);
		assert.strictEqual(oModel.getGroupProperty("$auto.foo", "submit"), SubmitMode.Auto);
		assert.strictEqual(oModel.getGroupProperty("$direct", "submit"), SubmitMode.Direct);
		assert.strictEqual(oModel.getGroupProperty("myGroup0", "submit"), SubmitMode.API);
		assert.strictEqual(oModel.getGroupProperty("myGroup1", "submit"), SubmitMode.Auto);
		assert.strictEqual(oModel.getGroupProperty("myGroup2", "submit"), SubmitMode.Direct);
		assert.strictEqual(oModel.getGroupProperty("unknown", "submit"), SubmitMode.API);

		assert.throws(function () {
			// code under test
			oModel.getGroupProperty("myGroup0", "unknown");
		}, new Error("Unsupported group property: 'unknown'"));
	});

	//*********************************************************************************************
	[{
		groupProperties : {"$foo" : null},
		// only one example for an invalid application group ID
		error : "Invalid group ID: $foo"
	}, {
		groupProperties : {"myGroup" : "Foo"},
		error : "Group 'myGroup' has invalid properties: 'Foo'"
	}, {
		groupProperties : {"myGroup" : undefined},
		error : "Group 'myGroup' has invalid properties: 'undefined'"
	}, {
		groupProperties : {"myGroup" : {submit : SubmitMode.Auto, foo : "bar"}},
		error : "Group 'myGroup' has invalid properties: '[object Object]'"
	}, {
		groupProperties : {"myGroup" : {submit : "foo"}},
		error : "Group 'myGroup' has invalid properties: '[object Object]'"
	}].forEach(function (oFixture) {
		QUnit.test("Model construction with groupProperties, error: " + oFixture.error,
				function (assert) {
			assert.throws(function () {
				// code under test
				this.createModel("", {groupProperties : oFixture.groupProperties});
			}, new Error(oFixture.error));
		});
	});

	//*********************************************************************************************
	QUnit.test("isAutoGroup", function (assert) {
		var oModel = this.createModel("", {
				groupProperties : {
					"myAPIGroup" : {submit : SubmitMode.API},
					"myAutoGroup" : {submit : SubmitMode.Auto},
					"myDirectGroup" : {submit : SubmitMode.Direct}
				}
			});

		// code under test
		assert.ok(oModel.isAutoGroup("$auto"));
		assert.ok(oModel.isAutoGroup("$auto.foo"));
		assert.notOk(oModel.isAutoGroup("Unknown"));
		assert.ok(oModel.isAutoGroup("myAutoGroup"));
		assert.notOk(oModel.isAutoGroup("myAPIGroup"));
		assert.notOk(oModel.isAutoGroup("myDirectGroup"));
	});

	//*********************************************************************************************
	QUnit.test("isDirectGroup", function (assert) {
		var oModel = this.createModel("", {
				groupProperties : {
					"myAPIGroup" : {submit : SubmitMode.API},
					"myAutoGroup" : {submit : SubmitMode.Auto},
					"myDirectGroup" : {submit : SubmitMode.Direct}
				}
			});

		// code under test
		assert.ok(oModel.isDirectGroup("$direct"));
		assert.notOk(oModel.isDirectGroup("Unknown"));
		assert.ok(oModel.isDirectGroup("myDirectGroup"));
		assert.notOk(oModel.isDirectGroup("myAPIGroup"));
		assert.notOk(oModel.isDirectGroup("myAutoGroup"));
	});

	//*********************************************************************************************
	QUnit.test("Model construction with autoExpandSelect", function (assert) {
		var oModel;

		oModel = this.createModel();
		assert.strictEqual(oModel.bAutoExpandSelect, false);

		oModel = this.createModel("", {autoExpandSelect : true});
		assert.strictEqual(oModel.bAutoExpandSelect, true);

		oModel = this.createModel("", {autoExpandSelect : false});
		assert.strictEqual(oModel.bAutoExpandSelect, false);

		assert.throws(function () {
			this.createModel("", {autoExpandSelect : ""});
		}, new Error("Value for autoExpandSelect must be true or false"));

		assert.throws(function () {
			this.createModel("", {autoExpandSelect : "X"});
		}, new Error("Value for autoExpandSelect must be true or false"));
	});

	//*********************************************************************************************
	QUnit.test("Model construction with headers", function (assert) {
		var mHeaders = {"abc" : "123", "accept-language" : "wx-YZ"},
			oModel;

		this.mock(ODataModel.prototype).expects("changeHttpHeaders")
			.withExactArgs(mHeaders).callThrough();

		// code under test
		oModel = this.createModel("", {httpHeaders : mHeaders});

		assert.deepEqual(oModel.mHeaders, mHeaders);
		assert.deepEqual(oModel.mMetadataHeaders, mHeaders);
	});

	//*********************************************************************************************
	QUnit.test("Model creates _Requestor", function (assert) {
		var oExpectedBind0,
			oExpectedBind1,
			oExpectedBind2,
			oExpectedBind3,
			oExpectedBind4,
			oExpectedCreate = this.mock(_Requestor).expects("create"),
			fnFetchEntityContainer = {},
			fnFetchMetadata = {},
			fnGetGroupProperty = {},
			oModel,
			oModelInterface,
			fnReportBoundMessages = {},
			fnReportUnboundMessages = {},
			oRequestor = {
				checkForOpenRequests : function () {},
				checkHeaderNames : function () {}
			},
			fnSubmitAuto = function () {};

		oExpectedCreate
			.withExactArgs(getServiceUrl(), {
					fetchEntityContainer : sinon.match.same(fnFetchEntityContainer),
					fetchMetadata : sinon.match.same(fnFetchMetadata),
					fireSessionTimeout : sinon.match.func,
					getGroupProperty : sinon.match.same(fnGetGroupProperty),
					onCreateGroup : sinon.match.func,
					reportBoundMessages : sinon.match.same(fnReportBoundMessages),
					reportUnboundMessages : sinon.match.same(fnReportUnboundMessages)
				},
				{"Accept-Language" : "ab-CD"},
				{"sap-client" : "123"}, "4.0")
			.returns(oRequestor);
		oExpectedBind0 = this.mock(ODataMetaModel.prototype.fetchEntityContainer).expects("bind")
			.returns(fnFetchEntityContainer);
		oExpectedBind1 = this.mock(ODataMetaModel.prototype.fetchObject).expects("bind")
			.returns(fnFetchMetadata);
		oExpectedBind2 = this.mock(ODataModel.prototype.getGroupProperty).expects("bind")
			.returns(fnGetGroupProperty);
		oExpectedBind3 = this.mock(ODataModel.prototype.reportUnboundMessages).expects("bind")
			.returns(fnReportUnboundMessages);
		oExpectedBind4 = this.mock(ODataModel.prototype.reportBoundMessages).expects("bind")
			.returns(fnReportBoundMessages);

		// code under test
		oModel = this.createModel("?sap-client=123", {}, true);

		assert.ok(oModel instanceof Model);
		assert.strictEqual(oModel.oRequestor, oRequestor);
		assert.strictEqual(oExpectedBind0.firstCall.args[0], oModel.oMetaModel);
		assert.strictEqual(oExpectedBind1.firstCall.args[0], oModel.oMetaModel);
		assert.strictEqual(oExpectedBind2.firstCall.args[0], oModel);
		assert.strictEqual(oExpectedBind3.firstCall.args[0], oModel);
		assert.strictEqual(oExpectedBind4.firstCall.args[0], oModel);
		assert.strictEqual(oExpectedCreate.firstCall.args[1], oModel.oInterface);

		this.mock(oModel._submitBatch).expects("bind")
			.withExactArgs(sinon.match.same(oModel), "$auto", true)
			.returns(fnSubmitAuto);
		this.mock(oModel).expects("addPrerenderingTask")
			.withExactArgs(fnSubmitAuto);

		// code under test - call onCreateGroup
		oModelInterface = oExpectedCreate.firstCall.args[1];
		oModelInterface.onCreateGroup("$auto");
		oModelInterface.onCreateGroup("foo");

		this.mock(oModel).expects("fireEvent")
			.withExactArgs("sessionTimeout");

		// code under test - call fireSessionTimeout
		oModelInterface.fireSessionTimeout();
	});

	//*********************************************************************************************
	QUnit.test("Property access from ManagedObject w/o context binding", function (assert) {
		var oModel = this.createModel("", {}, true), // this test uses $batch w/ $auto
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
		});
	});

	//*********************************************************************************************
	QUnit.skip("Property access from ManagedObject w/ context binding", function (assert) {
		var oModel = this.createModel(),
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
		});
	});

	//*********************************************************************************************
	QUnit.test("requestCanonicalPath", function (assert) {
		var oModel = this.createModel(),
			oEntityContext = Context.create(oModel, null, "/EMPLOYEES/42");

		this.mock(oEntityContext).expects("requestCanonicalPath").withExactArgs()
			.returns(Promise.resolve("/EMPLOYEES(ID='1')"));

		return oModel.requestCanonicalPath(oEntityContext).then(function (sCanonicalPath) {
			assert.strictEqual(sCanonicalPath, "/EMPLOYEES(ID='1')");
		});
	});

	//*********************************************************************************************
	QUnit.test("refresh", function (assert) {
		var oError = new Error(),
			oModel = this.createModel(),
			oModelMock = this.mock(oModel),
			oBaseContext = oModel.createBindingContext("/TEAMS('42')"),
			oContext = Context.create(oModel, undefined, "/TEAMS('43')"),
			oListBinding = oModel.bindList("/TEAMS"),
			oListBindingMock = this.mock(oListBinding),
			oListBinding2 = oModel.bindList("/TEAMS"),
			oListBinding3 = oModel.bindList("TEAM_2_EMPLOYEES"),
			oListBinding3Mock = this.mock(oListBinding3),
			oRelativeContextBinding = oModel.bindContext("TEAM_2_MANAGER", oContext, {}),
			oPropertyBinding = oModel.bindProperty("Name"),
			oPropertyBinding2 = oModel.bindProperty("Team_Id"),
			oPropertyBinding2Mock = this.mock(oPropertyBinding2);

		oListBinding3.setContext(oBaseContext);
		this.mock(oPropertyBinding2).expects("fetchCache");
		this.mock(oPropertyBinding2).expects("checkUpdateInternal");
		oPropertyBinding2.setContext(oBaseContext);

		oListBinding.attachChange(function () {});
		oListBinding3.attachChange(function () {});
		oPropertyBinding.attachChange(function () {});
		oPropertyBinding2.attachChange(function () {});
		oRelativeContextBinding.attachChange(function () {});
		oListBindingMock.expects("refresh").withExactArgs("myGroup");
		oListBinding3Mock.expects("refresh").withExactArgs("myGroup");
		oPropertyBinding2Mock.expects("refresh").withExactArgs("myGroup");
		// check: only bindings with change event handler are refreshed
		this.mock(oListBinding2).expects("refresh").never();
		// check: no refresh on binding with relative path
		this.mock(oRelativeContextBinding).expects("refresh").never();
		this.mock(oPropertyBinding).expects("refresh").never();
		oModelMock.expects("checkGroupId").withExactArgs("myGroup");

		// code under test
		oModel.refresh("myGroup");

		oModelMock.expects("checkGroupId").never();
		oModelMock.expects("getBindings").never();

		// code under test
		assert.throws(function () {
			oModel.refresh(true);
		}, new Error("Unsupported parameter bForceUpdate"));

		oModelMock.expects("checkGroupId").withExactArgs("$Invalid").throws(oError);

		// code under test
		assert.throws(function () {
			oModel.refresh("$Invalid");
		}, oError);

		oModelMock.expects("checkGroupId").withExactArgs("myGroup2");
		oModelMock.expects("getBindings").withExactArgs().returns([oListBinding, oListBinding3,
			oPropertyBinding, oPropertyBinding2, oRelativeContextBinding]);
		oPropertyBinding2Mock.expects("refresh").withExactArgs("myGroup2");

		oListBinding.suspend();
		oListBinding2.suspend();
		oListBinding3.suspend();

		oListBindingMock.expects("refresh").withExactArgs(undefined);
		oListBinding3Mock.expects("refresh").withExactArgs(undefined);

		// code under test (ignore group ID for suspended bindings)
		oModel.refresh("myGroup2");

	});

	//*********************************************************************************************
	QUnit.test("oModel.aBindings modified during refresh", function (assert) {
		var iCallCount = 0,
			oModel = this.createModel(),
			oListBinding = oModel.bindList("/TEAMS"),
			oListBinding2 = oModel.bindList("/TEAMS");

		function change() {}

		function detach() {
			this.detachChange(change); // removes binding from oModel.aBindings
			iCallCount += 1;
		}

		oListBinding.attachChange(change); // adds binding to oModel.aBindings
		oListBinding2.attachChange(change);
		oListBinding.attachRefresh(detach);
		oListBinding2.attachRefresh(detach);

		oModel.refresh();

		assert.strictEqual(iCallCount, 2, "refresh called for both bindings");
	});

	//*********************************************************************************************
	QUnit.test("_submitBatch: success", function (assert) {
		var oBatchResult = {},
			sGroupId = {/*string*/},
			oModel = this.createModel();

		this.mock(oModel.oRequestor).expects("submitBatch")
			.withExactArgs(sinon.match.same(sGroupId))
			.returns(SyncPromise.resolve(Promise.resolve(oBatchResult)));

		// code under test
		return oModel._submitBatch(sGroupId).then(function (oResult) {
			assert.strictEqual(oResult, oBatchResult);
		});
	});

	//*********************************************************************************************
	[undefined, false, true].forEach(function (bCatch) {
		QUnit.test("_submitBatch, failure, bCatch: " + bCatch, function (assert) {
			var oExpectedError = new Error("deliberate failure"),
				oModel = this.createModel(),
				oPromise;

			this.mock(oModel.oRequestor).expects("submitBatch")
				.withExactArgs("groupId")
				.returns(SyncPromise.resolve(Promise.reject(oExpectedError)));
			this.mock(oModel).expects("reportError")
				.withExactArgs("$batch failed", sClassName, oExpectedError);

			// code under test
			oPromise = oModel._submitBatch("groupId", bCatch).then(function (vResult) {
				assert.ok(bCatch);
				assert.strictEqual(vResult, undefined);
			}, function (oError) {
				assert.notOk(bCatch);
				assert.strictEqual(oError, oExpectedError);
			});

			assert.ok(oPromise instanceof SyncPromise);

			return oPromise;
		});
	});

	//*********************************************************************************************
	QUnit.test("submitBatch", function (assert) {
		var oModel = this.createModel("", {}, true),
			oModelMock = this.mock(oModel),
			oSubmitPromise = {};

		oModelMock.expects("checkBatchGroupId").withExactArgs("groupId");
		oModelMock.expects("isAutoGroup").withExactArgs("groupId").returns(false);
		this.mock(oModel.oRequestor).expects("addChangeSet").withExactArgs("groupId");
		oModelMock.expects("_submitBatch").never(); // not yet
		oModelMock.expects("addPrerenderingTask").callsFake(function (fnCallback) {
			setTimeout(function () {
				// make sure that _submitBatch is called within fnCallback
				oModelMock.expects("_submitBatch").withExactArgs("groupId")
					.returns(oSubmitPromise);
				fnCallback();
			}, 0);
		});

		// code under test
		return oModel.submitBatch("groupId").then(function (oResult) {
			// this proves that submitBatch() returns a promise which is resolved with the result
			// of _submitBatch(), which in reality is of course a sync promise itself
			assert.strictEqual(oResult, oSubmitPromise);
		});
	});

	//*********************************************************************************************
	QUnit.test("submitBatch, invalid group ID", function (assert) {
		var oError = new Error(),
			oModel = this.createModel(),
			oModelMock = this.mock(oModel);

		oModelMock.expects("_submitBatch").never();
		oModelMock.expects("checkBatchGroupId").withExactArgs("$direct").throws(oError);

		assert.throws(function () {
			//code under test
			oModel.submitBatch("$direct");
		}, oError);
	});

	//*********************************************************************************************
	QUnit.test("submitBatch: $auto", function (assert) {
		var oModel = this.createModel("", {}, true),
			oModelMock = this.mock(oModel),
			oSubmitPromise = {};

		oModelMock.expects("checkBatchGroupId").withExactArgs("groupId");
		oModelMock.expects("isAutoGroup").withExactArgs("groupId").returns(true);
		this.mock(oModel.oRequestor).expects("relocateAll")
			.withExactArgs("$parked.groupId", "groupId");
		this.mock(oModel.oRequestor).expects("addChangeSet").never();
		oModelMock.expects("_submitBatch").never(); // not yet
		oModelMock.expects("addPrerenderingTask").callsFake(function (fnCallback) {
			setTimeout(function () {
				// make sure that _submitBatch is called within fnCallback
				oModelMock.expects("_submitBatch").withExactArgs("groupId")
					.returns(oSubmitPromise);
				fnCallback();
			}, 0);
		});

		// code under test
		return oModel.submitBatch("groupId").then(function (oResult) {
			// this proves that submitBatch() returns a promise which is resolved with the result
			// of _submitBatch(), which in reality is of course a sync promise itself
			assert.strictEqual(oResult, oSubmitPromise);
		});
	});

	//*********************************************************************************************
	QUnit.test("resetChanges with group ID", function () {
		var oModel = this.createModel();

		this.mock(oModel).expects("checkBatchGroupId").withExactArgs("groupId");
		this.mock(oModel).expects("isAutoGroup").withExactArgs("groupId").returns(false);
		this.mock(oModel.oRequestor).expects("cancelChanges").withExactArgs("groupId");

		// code under test
		oModel.resetChanges("groupId");
	});
	// TODO reset the POST requests in this group

	//*********************************************************************************************
	QUnit.test("resetChanges with $auto group", function () {
		var oModel = this.createModel("", {updateGroupId : "$auto"}),
			oBinding1 = oModel.bindList("/EMPLOYEES"),
			oBinding2 = oModel.bindProperty("/EMPLOYEES('1')/AGE"),
			oBinding3 = oModel.bindContext("/EMPLOYEES('1')", undefined, {
				$$updateGroupId : "anotherGroup"
			}),
			oRequestorMock = this.mock(oModel.oRequestor);

		this.mock(oModel).expects("checkBatchGroupId").withExactArgs("$auto");
		this.mock(oModel).expects("isAutoGroup").withExactArgs("$auto").returns(true);
		oRequestorMock.expects("cancelChanges").withExactArgs("$parked.$auto");
		oRequestorMock.expects("cancelChanges").withExactArgs("$auto");
		this.mock(oBinding1).expects("resetInvalidDataState").withExactArgs();
		this.mock(oBinding2).expects("resetInvalidDataState").withExactArgs();
		this.mock(oBinding3).expects("resetInvalidDataState").never();

		// code under test
		oModel.resetChanges("$auto");
	});

	//*********************************************************************************************
	QUnit.test("resetChanges w/o group ID", function () {
		var oModel = this.createModel("", {updateGroupId : "updateGroupId"}),
			oBinding1 = oModel.bindList("/EMPLOYEES"),
			oBinding2 = oModel.bindProperty("/EMPLOYEES('1')/AGE"),
			oBinding3 = oModel.bindContext("/EMPLOYEES('1')", undefined, {
				$$updateGroupId : "anotherGroup"
			});

		this.mock(oModel).expects("checkBatchGroupId").withExactArgs("updateGroupId");
		this.mock(oModel).expects("isAutoGroup").withExactArgs("updateGroupId").returns(false);
		this.mock(oModel.oRequestor).expects("cancelChanges").withExactArgs("updateGroupId");
		this.mock(oBinding1).expects("resetInvalidDataState").withExactArgs();
		this.mock(oBinding2).expects("resetInvalidDataState").withExactArgs();
		this.mock(oBinding3).expects("resetInvalidDataState").never();

		// code under test
		oModel.resetChanges();
	});

	//*********************************************************************************************
	QUnit.test("resetChanges, invalid group ID", function (assert) {
		var oError = new Error(),
			oModel = this.createModel();

		this.mock(oModel).expects("checkBatchGroupId").withExactArgs("$auto").throws(oError);
		this.mock(oModel.oRequestor).expects("cancelChanges").never();

		assert.throws(function () {
			oModel.resetChanges();
		}, oError);
	});

	//*********************************************************************************************
	QUnit.test("forbidden", function (assert) {
		var oModel = this.createModel();

		assert.throws(function () { //TODO implement
			oModel.bindTree();
		}, new Error("Unsupported operation: v4.ODataModel#bindTree"));

		assert.throws(function () {
			oModel.destroyBindingContext();
		}, new Error("Unsupported operation: v4.ODataModel#destroyBindingContext"));

		assert.throws(function () {
			oModel.getContext();
		}, new Error("Unsupported operation: v4.ODataModel#getContext"));

		assert.throws(function () {
			oModel.getObject();
		}, new Error("Unsupported operation: v4.ODataModel#getObject"));

		assert.throws(function () { //TODO implement
			oModel.getOriginalProperty();
		}, new Error("Unsupported operation: v4.ODataModel#getOriginalProperty"));

		assert.throws(function () {
			oModel.getProperty();
		}, new Error("Unsupported operation: v4.ODataModel#getProperty"));

		assert.throws(function () { //TODO implement
			oModel.isList();
		}, new Error("Unsupported operation: v4.ODataModel#isList"));

		assert.throws(function () {
			oModel.setLegacySyntax();
		}, new Error("Unsupported operation: v4.ODataModel#setLegacySyntax"));
	});

	//*********************************************************************************************
	QUnit.test("events", function (assert) {
		var oModel = this.createModel();

		assert.throws(function () {
			oModel.attachParseError();
		}, new Error("Unsupported event 'parseError': v4.ODataModel#attachEvent"));

		assert.throws(function () {
			oModel.attachRequestCompleted();
		}, new Error("Unsupported event 'requestCompleted': v4.ODataModel#attachEvent"));

		assert.throws(function () {
			oModel.attachRequestFailed();
		}, new Error("Unsupported event 'requestFailed': v4.ODataModel#attachEvent"));

		assert.throws(function () {
			oModel.attachRequestSent();
		}, new Error("Unsupported event 'requestSent': v4.ODataModel#attachEvent"));
	});

	//*********************************************************************************************
	QUnit.test("event: sessionTimeout", function (assert) {
		var oModel = this.createModel(),
			oModelMock = this.mock(oModel),
			fnFunction = {},
			oListener = {};

		oModelMock.expects("attachEvent")
			.withExactArgs("sessionTimeout", sinon.match.same(fnFunction),
				sinon.match.same(oListener))
			.returns(oModel);

		// code under test
		assert.strictEqual(oModel.attachSessionTimeout(fnFunction, oListener), oModel);

		oModelMock.expects("detachEvent")
			.withExactArgs("sessionTimeout", sinon.match.same(fnFunction),
				sinon.match.same(oListener))
			.returns(oModel);

		// code under test
		assert.strictEqual(oModel.detachSessionTimeout(fnFunction, oListener), oModel);
	});

	//*********************************************************************************************
	[{
		stack : "Failure\n    at _Helper.createError", // like Chrome
		message : "Failure\n    at _Helper.createError"
	}, {
		stack : undefined, // like IE
		message : "Failure"
	}, {
		stack : "_Helper.createError@_Helper.js", // like FF
		message : "Failure\n_Helper.createError@_Helper.js"
	}].forEach(function (oFixture, i) {
		QUnit.test("reportError, i:" + i, function () {
			var sClassName = "sap.ui.model.odata.v4.ODataPropertyBinding",
				oError = new Error("Failure"),
				sLogMessage = "Failed to read path /Product('1')/Unknown",
				oModel = this.createModel();

			oError.stack = oFixture.stack;
			this.oLogMock.expects("error").withExactArgs(sLogMessage, oFixture.message, sClassName)
				.twice();
			this.mock(oModel).expects("reportBoundMessages").never();
			this.mock(oModel).expects("reportUnboundMessages")
				.once()// add each error only once to the MessageManager
				.withExactArgs([{
					additionalTargets : undefined,
					code : undefined,
					message : oError.message,
					technical : true,
					"@$ui5.error" : sinon.match.same(oError),
					"@$ui5.originalMessage" : sinon.match.same(oError),
					numericSeverity : 4 // Error
				}]);

			// code under test
			oModel.reportError(sLogMessage, sClassName, oError);
			oModel.reportError(sLogMessage, sClassName, oError);
		});
	});

	//*********************************************************************************************
[true, false].forEach(function (bIgnoreTopLevel) {
	var sTitle = "reportError: JSON response, top-level unbound and details, $ignoreTopLevel = "
			+ bIgnoreTopLevel;

	QUnit.test(sTitle, function () {
		var sClassName = "sap.ui.model.odata.v4.ODataPropertyBinding",
			sResourcePath = "/Product('1')",
			oError = {
				"error" : {
					"@Common.longtextUrl" : "top/longtext",
					"code" : "top",
					"$ignoreTopLevel" : bIgnoreTopLevel,
					"details" : [{
						"@com.sap.vocabularies.Common.v1.longtextUrl" : "bound/longtext",
						"@com.sap.vocabularies.Common.v1.numericSeverity" : 3,
						"code" : "bound",
						"message" : "Value must be greater than 0",
						"target" : "Quantity"
					}, {
						"@Common.numericSeverity" : 3,
						"code" : "unbound",
						"message" : "some unbound message"
					}, {
						"@Common.additionalTargets" : ["ProductID", "Name"],
						"@Common.numericSeverity" : 2,
						"@foo" : "bar",
						"code" : "bound",
						"message" : "some other Quantity message",
						"target" : "Quantity"
					}],
					"message" : "Error occurred while processing the request"
				},
				"message" : "Failure",
				"requestUrl" : "/service/Product",
				"resourcePath" : sResourcePath + "?foo=bar"
			},
			oHelperMock = this.mock(_Helper),
			sLogMessage = "Failed to read path /Product('1')/Unknown",
			oModel = this.createModel(),
			aUnboundMessages = [{
				additionalTargets : undefined,
				code : oError.error.code,
				longtextUrl : "/service/Product/top/longtext",
				message : oError.error.message,
				numericSeverity : 4, // Error
				technical : true,
				"@$ui5.error" : sinon.match.same(oError),
				"@$ui5.originalMessage" : sinon.match.same(oError.error)
			}, {
				additionalTargets : undefined,
				code : "unbound",
				message : "some unbound message",
				numericSeverity : 3,
				technical : undefined,
				"@$ui5.error" : sinon.match.same(oError),
				"@$ui5.originalMessage" : sinon.match.same(oError.error.details[1])
			}];

		this.oLogMock.expects("error").withExactArgs(sLogMessage, oError.message, sClassName);
		oHelperMock.expects("getAdditionalTargets").exactly(bIgnoreTopLevel ? 0 : 1)
			.withExactArgs(sinon.match.same(oError.error))
			.returns(undefined);
		oHelperMock.expects("getAdditionalTargets")
			.withExactArgs(sinon.match.same(oError.error.details[0]))
			.returns(undefined);
		oHelperMock.expects("getAdditionalTargets")
			.withExactArgs(sinon.match.same(oError.error.details[1]))
			.returns(undefined);
		oHelperMock.expects("getAdditionalTargets")
			.withExactArgs(sinon.match.same(oError.error.details[2]))
			.returns("~additionalTargets~");
		oHelperMock.expects("makeAbsolute")
			.withExactArgs("top/longtext", oError.requestUrl)
			.exactly(bIgnoreTopLevel ? 0 : 1)
			.returns("/service/Product/top/longtext");
		oHelperMock.expects("makeAbsolute")
			.withExactArgs("bound/longtext", oError.requestUrl)
			.returns("/service/Product/bound/longtext");
		this.mock(oModel).expects("reportUnboundMessages")
			.withExactArgs(bIgnoreTopLevel ? aUnboundMessages.slice(1) : aUnboundMessages);
		this.mock(oModel).expects("reportBoundMessages")
			.withExactArgs(sResourcePath, {
				"" : [{
					additionalTargets : undefined,
					code : "bound",
					longtextUrl : "/service/Product/bound/longtext",
					message : "Value must be greater than 0",
					numericSeverity : 3,
					target : "Quantity",
					technical : undefined,
					transition : true,
					"@$ui5.error" : sinon.match.same(oError),
					"@$ui5.originalMessage" : sinon.match.same(oError.error.details[0])
				}, {
					additionalTargets : "~additionalTargets~",
					code : "bound",
					message : "some other Quantity message",
					numericSeverity : 2,
					target : "Quantity",
					technical : undefined,
					transition : true,
					"@$ui5.error" : sinon.match.same(oError),
					"@$ui5.originalMessage" : sinon.match.same(oError.error.details[2])
				}]
			}, []);

		// code under test
		oModel.reportError(sLogMessage, sClassName, oError);
	});
});

	//*********************************************************************************************
	QUnit.test("reportError: invoked by an action", function () {
		var sClassName = "sap.ui.model.odata.v4.ODataPropertyBinding",
			aBoundMessages = [{
				additionalTargets : undefined,
				code :  "param",
				message : "TeamID is wrong",
				numericSeverity : 3,
				target : "/Employees('1')/service.ChangeEmployee(...)/$Parameter/TeamID",
				technical : undefined,
				transition : true
			}, {
				additionalTargets : undefined,
				code :  "bindingParam",
				message : "Status is not there",
				numericSeverity : 3,
				target : "/Employees('1')/STATUS",
				technical : undefined,
				transition : true
			}],
			oError = {
				code : "top",
				error : {
					details : [{
						"@.numericSeverity" : 3,
						code :  "param",
						message : "TeamID is wrong",
						target : "/Employees('1')/service.ChangeEmployee(...)/$Parameter/TeamID"
					}, {
						"@.numericSeverity" : 3,
						code :  "bindingParam",
						message : "Status is not there",
						target : "/Employees('1')/STATUS"
					}]
				},
				message : "Failure",
				requestUrl : "/Employees('1')/service.ChangeTeamOfEmployee(...)",
				resourcePath : "Employees('1')"
			},
			sLogMessage = "Action could not be executed",
			oModel = this.createModel();

		aBoundMessages[0]["@$ui5.error"] = sinon.match.same(oError);
		aBoundMessages[0]["@$ui5.originalMessage"] = Object.assign({}, oError.error.details[0]);
		aBoundMessages[1]["@$ui5.error"] = sinon.match.same(oError);
		aBoundMessages[1]["@$ui5.originalMessage"] = Object.assign({}, oError.error.details[1]);

		this.oLogMock.expects("error").withExactArgs(sLogMessage, oError.message, sClassName);
		this.mock(_Helper).expects("makeAbsolute").never();
		this.mock(oModel).expects("reportBoundMessages")
			.withExactArgs("Employees('1')", {"" : aBoundMessages}, []);
		this.mock(oModel).expects("reportUnboundMessages").once(/* don't care*/);

		// code under test
		oModel.reportError(sLogMessage, sClassName, oError);
	});

	//*********************************************************************************************
	QUnit.test("reportError: JSON response, top-level bound, no details", function () {
		var sClassName = "sap.ui.model.odata.v4.ODataPropertyBinding",
			oError = {
				"error" : {
					"code" : "top",
					"message" : "Value must be greater than 0",
					"target" : "Quantity",
					"@foo.additionalTargets" : ["ProductID"]
				},
				"message" : "Failure",
				"resourcePath" : "/Product('1')"
			},
			sLogMessage = "Failed to read path /Product('1')/Unknown",
			oModel = this.createModel();

		this.oLogMock.expects("error").withExactArgs(sLogMessage, oError.message, sClassName);
		this.mock(_Helper).expects("getAdditionalTargets")
			.withExactArgs(sinon.match.same(oError.error)).returns("~additionalTargets~");
		this.mock(oModel).expects("reportUnboundMessages")
			.withExactArgs([]);
		this.mock(oModel).expects("reportBoundMessages")
			.withExactArgs(oError.resourcePath, {"" : [{
				additionalTargets : "~additionalTargets~",
				code : "top",
				message : "Value must be greater than 0",
				numericSeverity : 4, // Error
				target : "Quantity",
				technical : true,
				transition : true,
				"@$ui5.error" : sinon.match.same(oError),
				"@$ui5.originalMessage" : sinon.match.same(oError.error)
			}]}, []);

		// code under test
		oModel.reportError(sLogMessage, sClassName, oError);
	});

	//*********************************************************************************************
	QUnit.test("reportError: JSON response, top-level bound to query option", function () {
		var sClassName = "sap.ui.model.odata.v4.ODataPropertyBinding",
			oError = {
				"error" : {
					"@Common.longtextUrl" : "/long/text",
					"code" : "top",
					"message" : "Invalid token 'name' at position '1'",
					"target" : "$filter"
				},
				"message" : "Failure",
				"requestUrl" : "/service/SalesOrderList",
				"resourcePath" : "/SalesOrderList"
			},
			sLogMessage = "Failed to read path /SalesOrderList?$filter=name eq 'Hugo'",
			oModel = this.createModel();

		this.oLogMock.expects("error").withExactArgs(sLogMessage, oError.message, sClassName);
		this.mock(oModel).expects("reportBoundMessages").never();
		this.mock(oModel).expects("reportUnboundMessages")
			.withExactArgs([{
				additionalTargets : undefined,
				code : "top",
				message : "$filter: Invalid token 'name' at position '1'",
				longtextUrl : "/long/text",
				numericSeverity : 4, // Error
				technical : true,
				"@$ui5.error" : sinon.match.same(oError),
				"@$ui5.originalMessage" : sinon.match.same(oError.error)
			}]);

		// code under test
		oModel.reportError(sLogMessage, sClassName, oError);
	});

	//*********************************************************************************************
	QUnit.test("reportError on canceled error", function () {
		var oError = {canceled : true, message : "Canceled", stack: "Canceled\n    at foo.bar"},
			oModel = this.createModel();

		this.oLogMock.expects("debug")
			.withExactArgs("Failure", "Canceled\n    at foo.bar", "class");
		this.mock(oModel).expects("fireMessageChange").never();

		// code under test
		oModel.reportError("Failure", "class", oError);
	});

	//*********************************************************************************************
	QUnit.test("reportError on canceled error, no debug log", function () {
		var oError = {canceled : "noDebugLog"},
			oModel = this.createModel();

		this.oLogMock.expects("debug").never();
		this.mock(oModel).expects("fireMessageChange").never();

		// code under test
		oModel.reportError("Failure", "class", oError);
	});

	//*********************************************************************************************
	QUnit.test("reportError: no message for $reported", function () {
		var sClassName = "class",
			oError = {$reported : true, message : "Reported"},
			sLogMessage = "Failure",
			oModel = this.createModel();

		this.oLogMock.expects("error").withExactArgs(sLogMessage, oError.message, sClassName);
		this.mock(oModel).expects("fireMessageChange").never();

		// code under test
		oModel.reportError(sLogMessage, sClassName, oError);
	});

	//*********************************************************************************************
	QUnit.test("destroy", function (assert) {
		var oModel = this.createModel(),
			oModelPrototypeMock = this.mock(Model.prototype);

		this.mock(oModel.oRequestor).expects("destroy").withExactArgs();
		oModelPrototypeMock.expects("destroy").on(oModel).withExactArgs(1, 2, 3).returns("foo");
		oModelPrototypeMock.expects("destroy").on(oModel.getMetaModel()).withExactArgs();

		// code under test
		assert.strictEqual(oModel.destroy(1, 2, 3), "foo");

		assert.strictEqual(oModel.mHeaders, undefined);
		assert.strictEqual(oModel.mMetadataHeaders, undefined);
	});

	//*********************************************************************************************
	QUnit.test("hasPendingChanges", function (assert) {
		var oModel = this.createModel(),
			oModelMock = this.mock(oModel),
			oRequestorMock = this.mock(oModel.oRequestor),
			oResult = {};

		oModelMock.expects("checkBatchGroupId").never();
		oRequestorMock.expects("hasPendingChanges").withExactArgs(undefined).returns(oResult);

		// code under test (all groups)
		assert.strictEqual(oModel.hasPendingChanges(), oResult);

		oModelMock.expects("checkBatchGroupId").withExactArgs("update");
		oModelMock.expects("isAutoGroup").withExactArgs("update").returns(false);
		oRequestorMock.expects("hasPendingChanges").withExactArgs("update").returns(oResult);

		// code under test (only given API group)
		assert.strictEqual(oModel.hasPendingChanges("update"), oResult);

		oModelMock.expects("checkBatchGroupId").withExactArgs("$auto");
		oModelMock.expects("isAutoGroup").withExactArgs("$auto").returns(true);
		oRequestorMock.expects("hasPendingChanges").withExactArgs("$parked.$auto").returns(true);

		// code under test ($auto (check also parked))
		assert.strictEqual(oModel.hasPendingChanges("$auto"), true);

		oModelMock.expects("checkBatchGroupId").withExactArgs("$auto");
		oModelMock.expects("isAutoGroup").withExactArgs("$auto").returns(true);
		oRequestorMock.expects("hasPendingChanges").withExactArgs("$parked.$auto").returns(false);
		oRequestorMock.expects("hasPendingChanges").withExactArgs("$auto").returns(oResult);

		// code under test ($auto (check also parked))
		assert.strictEqual(oModel.hasPendingChanges("$auto"), oResult);
	});

	//*********************************************************************************************
	QUnit.test("hasPendingChanges, invalid groupId", function (assert) {
		var oError = new Error("Invalid batch group"),
			oModel = this.createModel(),
			oModelMock = this.mock(oModel);

		oModelMock.expects("checkBatchGroupId").withExactArgs("").throws(oError);

		assert.throws(function () {
			// code under test (invalid groupId)
			oModel.hasPendingChanges("");
		}, oError);
	});

	//*********************************************************************************************
	QUnit.test("getDependentBindings: binding", function (assert) {
		var oModel = this.createModel(),
			oParentBinding = {},
			oContext = Context.create(oModel, oParentBinding, "/absolute"),
			oBinding = new Binding(oModel, "relative", oContext);

		assert.deepEqual(oModel.getDependentBindings(oParentBinding), []);

		// to be called by V4 binding's c'tors
		oModel.bindingCreated(oBinding);
		oModel.bindingCreated(new Binding(oModel, "/somewhere/else", oContext));
		oModel.bindingCreated(
			new Binding(oModel, "unrelated", Context.create(oModel, {}, "/absolute")));
		oModel.bindingCreated(new Binding(oModel, "relative"));

		assert.deepEqual(oModel.getDependentBindings(oParentBinding), [oBinding]);

		// to be called by V4 binding's destroy() method
		oModel.bindingDestroyed(oBinding);

		assert.deepEqual(oModel.getDependentBindings(oParentBinding), []);

		assert.throws(function () {
			// missing bindingCreated() or duplicate call
			oModel.bindingDestroyed(oBinding);
		}, new Error("Unknown " + oBinding));
	});

	//*********************************************************************************************
	QUnit.test("getDependentBindings: base context", function (assert) {
		var oModel = this.createModel(),
			oParentBinding = {},
			oContext = new BaseContext(oModel, "/foo"),
			oBinding = new Binding(oModel, "relative", oContext);

		// to be called by V4 binding's c'tors
		oModel.bindingCreated(oBinding);
		oModel.bindingCreated(
			new Binding(oModel, "unrelated", Context.create(oModel, {}, "/absolute")));
		oModel.bindingCreated(new Binding(oModel, "relative"));

		assert.deepEqual(oModel.getDependentBindings(oParentBinding), []);
	});

	//*********************************************************************************************
	QUnit.test("getDependentBindings: context", function (assert) {
		var oModel = this.createModel(),
			oParentContext = Context.create(oModel, null, "/absolute"),
			oBinding = new Binding(oModel, "relative", oParentContext);

		assert.deepEqual(oModel.getDependentBindings(oParentContext), []);

		// to be called by V4 binding's c'tors
		oModel.bindingCreated(oBinding);

		assert.deepEqual(oModel.getDependentBindings(oParentContext), [oBinding]);

		// to be called by V4 binding's destroy() method
		oModel.bindingDestroyed(oBinding);

		assert.deepEqual(oModel.getDependentBindings(oParentContext), []);
	});

	//*********************************************************************************************
	[
		"/foo",
		"/EMPLOYEES('4711')/#com.sap.foo.bar.AcFoo",
		"/EMPLOYEES('4711')/#com.sap.foo.bar.AcFoo/Title"
	].forEach(function (sPath) {
		QUnit.test("createBindingContext - absolute path, no context " + sPath, function (assert) {
			var oBindingContext,
				oModel = this.createModel();

			// code under test
			oBindingContext = oModel.createBindingContext(sPath);

			assert.deepEqual(oBindingContext, new BaseContext(oModel, sPath));
			assert.ok(oBindingContext instanceof BaseContext);
		});
	});

	//*********************************************************************************************
	[{
		entityPath : "/foo",
		propertyPath : "bar"
	}, {
		entityPath : "/foo",
		propertyPath : "foo_2_bar/#com.sap.foo.bar.AcBar"
	}, {
		entityPath : "/foo",
		propertyPath : "#com.sap.foo.bar.AcBar/Title"
	}].forEach(function (oFixture) {
		var sResolvedPath = oFixture.entityPath + "/" + oFixture.propertyPath,
			sTitle = "createBindingContext - relative path and context " + sResolvedPath;

		QUnit.test(sTitle, function (assert) {
			var oBindingContext,
				oModel = this.createModel(),
				oModelMock = this.mock(oModel),
				oContext = new BaseContext(oModel, oFixture.entityPath);

			oModelMock.expects("resolve")
				.withExactArgs(oFixture.propertyPath, sinon.match.same(oContext))
				.returns(sResolvedPath);

			// code under test
			oBindingContext = oModel.createBindingContext(oFixture.propertyPath, oContext);

			assert.deepEqual(oBindingContext, new BaseContext(oModel, sResolvedPath));
			assert.ok(oBindingContext instanceof BaseContext);
		});
	});

	//*********************************************************************************************
	[false, true].forEach(function (bDoubleHash) {
		[{
			dataPath : "/BusinessPartnerList('42')",
			metaPath : ""
		}, {
			dataPath : "/BusinessPartnerList('42')",
			metaPath : "@com.sap.vocabularies.UI.v1.LineItem"
		}, {
			dataPath : "/BusinessPartnerList('42')/",
			metaPath : "/com.sap.foo.bar.AcFoo",
			relativeMetaPath : "./com.sap.foo.bar.AcFoo"
		}, {
			dataPath : "/BusinessPartnerList('42')/",
			doubleHash : true, // single hash goes to data and is tested above
			metaPath : "com.sap.foo.bar.AcFoo"
		}, {
			dataPath : "/",
			metaPath : "com.sap.foo.bar.AcFoo"
		}, {
			dataPath : "/",
			metaPath : "BusinessPartnerList/@com.sap.vocabularies.UI.v1.LineItem"
		}, {
			dataPath : "/BusinessPartnerList",
			metaPath : "/",
			relativeMetaPath : "./" // meta path is always treated as a relative path
		}, {
			dataPath: "/BusinessPartnerList",
			metaPath: "Name"
		}, {
			dataPath : "/BusinessPartnerList",
			metaPath : "/Name",
			relativeMetaPath : "./Name" // meta path is always treated as a relative path
		}].forEach(function (oFixture) {
			var sPath = oFixture.dataPath + (bDoubleHash ? "##" : "#") + oFixture.metaPath;

			if ("doubleHash" in oFixture && oFixture.doubleHash !== bDoubleHash) {
				return;
			}
			QUnit.test("createBindingContext - go to metadata " + sPath, function (assert) {
				var oContext = {},
					oModel = this.createModel(),
					oMetaContext = {},
					oMetaModel = oModel.getMetaModel(),
					oMetaModelMock = this.mock(oMetaModel),
					sMetaPath = oFixture.relativeMetaPath || oFixture.metaPath;

				oMetaModelMock.expects("getMetaContext").withExactArgs(oFixture.dataPath)
					.returns(oMetaContext);
				oMetaModelMock.expects("createBindingContext")
					.withExactArgs(sMetaPath, sinon.match.same(oMetaContext))
					.returns(oContext);

				// code under test
				assert.strictEqual(oModel.createBindingContext(sPath), oContext);
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("createBindingContext - error cases", function (assert) {
		var oModel = this.createModel(),
			oEntityContext = Context.create(oModel, null, "/EMPLOYEES/42");

		assert.throws(function () {
			oModel.createBindingContext("bar");
		}, new Error("Cannot create binding context from relative path 'bar' without context"),
			"relative path, no context");
		assert.throws(function () {
			oModel.createBindingContext("/foo", undefined, {"param" : "bar"});
		}, new Error("Only the parameters sPath and oContext are supported"),
			"more than two parameters not allowed");
		assert.throws(function () {
			oModel.createBindingContext("foo", oEntityContext);
		}, new Error("Unsupported type: oContext must be of type sap.ui.model.Context, but was "
				+ "sap.ui.model.odata.v4.Context"), "sap.ui.model.odata.v4.Context not allowed");
	});
	// TODO allow v4.Context and return v4.Context

	//*********************************************************************************************
	QUnit.test("checkGroupId", function (assert) {
		var oModel = this.createModel();

		// valid group IDs
		oModel.checkGroupId("myGroup");
		oModel.checkGroupId("$auto");
		oModel.checkGroupId("$auto.foo");
		oModel.checkGroupId("$auto.1");
		oModel.checkGroupId("$direct");
		oModel.checkGroupId(undefined);
		oModel.checkGroupId("myGroup", true);

		// invalid group IDs
		["", "$invalid", 42].forEach(function (vGroupId) {
			assert.throws(function () {
				oModel.checkGroupId(vGroupId);
			}, new Error("Invalid group ID: " + vGroupId));
		});

		// invalid application group IDs
		["", "$invalid", 42, "$auto", "$direct", undefined].forEach(function (vGroupId) {
			assert.throws(function () {
				oModel.checkGroupId(vGroupId, true);
			}, new Error("Invalid group ID: " + vGroupId));
		});

		// invalid group with custom message
		assert.throws(function () {
			oModel.checkGroupId("$invalid", false, "Custom error message: ");
		}, new Error("Custom error message: $invalid"));
	});

	//*********************************************************************************************
	QUnit.test("checkBatchGroupId: success", function () {
		var sGroupId = {/*string*/},
			oModel = this.createModel();

		this.mock(oModel).expects("checkGroupId").withExactArgs(sinon.match.same(sGroupId));
		this.mock(oModel).expects("isDirectGroup").withExactArgs(sinon.match.same(sGroupId))
			.returns(false);

		// code under test
		oModel.checkBatchGroupId(sGroupId);
	});

	//*********************************************************************************************
	QUnit.test("checkBatchGroupId: checkGroupId fails", function (assert) {
		var oError = new Error(),
			sGroupId = {/*string*/},
			oModel = this.createModel();

		this.mock(oModel).expects("checkGroupId").withExactArgs(sinon.match.same(sGroupId))
			.throws(oError);
		this.mock(oModel).expects("isDirectGroup").never();

		assert.throws(function () {
			// code under test
			oModel.checkBatchGroupId(sGroupId);
		}, oError);
	});

	//*********************************************************************************************
	QUnit.test("checkBatchGroupId: fails due to isDirectGroup", function (assert) {
		var oModel = this.createModel();

		this.mock(oModel).expects("checkGroupId").withExactArgs("foo");
		this.mock(oModel).expects("isDirectGroup").withExactArgs("foo").returns(true);

		assert.throws(function () {
			// code under test
			oModel.checkBatchGroupId("foo");
		}, new Error("Group ID does not use batch requests: foo"));
	});

	//*********************************************************************************************
	[{
		mParameters : {
			"$expand" : {
				"foo" : {
					"$count" : true,
					"$expand" : {"bar" : {}},
					"$filter" : "baz eq 0",
					"$levels" : "max",
					"$orderby" : "qux",
					"$search" : "key",
					"$select" : ["*"]
				}
			},
			"$select" : ["bar"],
			"custom" : "baz"
		},
		bSystemQueryOptionsAllowed : true
	}, {
		mParameters : {
			"$apply" : "apply",
			"$count" : true,
			"$filter" : "foo eq 42",
			"$orderby" : "bar",
			"$search" : '"foo bar" AND NOT foobar'
		},
		bSystemQueryOptionsAllowed : true
	}, {
		mParameters : {"custom" : "foo"}
	}, {
		mParameters : undefined
	}, {
		mParameters : {"sap-client" : "111"},
		bSapAllowed : true
	}, {
		mParameters : {
			"sap-valid-" : "now",
			"sap-valid-foo" : "bar",
			"sap-valid-*" : "n/a"
		},
		bSapAllowed : false // always allowed
	},{
		mParameters : {
			$expand : { "TEAM_2_MANAGER" : {} },
			$select : "bar"
		},
		bSystemQueryOptionsAllowed : true,
		expected : {
			$expand : { "TEAM_2_MANAGER" : {} },
			$select : ["bar"]
		}
	}, {
		mParameters : {
			$expand : { "TEAM_2_MANAGER" : {
				$expand : "TEAM_2_EMPLOYEES($select=Name)",
				$select : "Team_Id"
			}}
		},
		bSystemQueryOptionsAllowed : true,
		expected : {
			$expand : { "TEAM_2_MANAGER" : {
				$expand : {
					TEAM_2_EMPLOYEES : {
						$select : ["Name"]
					}
				},
				$select : ["Team_Id"]
			}}
		}
	}, {
		mParameters : {
			$expand : {
				"TEAM_2_MANAGER" : true,
				"TEAM_2_EMPLOYEES" : null,
				"FOO1" : 42,
				"FOO2" : false,
//TODO undefined values are removed by _Helper.clone, but should also be normalized to {}
				//"FOO3" : undefined
				"FOO4" : {
					$count : false
				}
			}
		},
		bSystemQueryOptionsAllowed : true,
		expected : {
			$expand : {
				"TEAM_2_MANAGER" : {},
				"TEAM_2_EMPLOYEES" : {},
				"FOO1" : {},
				"FOO2" : {},
//				"FOO3" : {}
				"FOO4" : {}
			}
		}
	}, {
		bSystemQueryOptionsAllowed : true,
		mParameters : {
			$count : "true"
		},
		expected : {
			$count : true
		}
	}, {
		bSystemQueryOptionsAllowed : true,
		mParameters : {
			$count : "false"
		},
		expected : {}
	}, {
		bSystemQueryOptionsAllowed : true,
		mParameters : {
			$count : "TrUe"
		},
		expected : {
			$count : true
		}
	}, {
		bSystemQueryOptionsAllowed : true,
		mParameters : {
			$count : false
		},
		expected : {}
	}].forEach(function (oFixture) {
		QUnit.test("buildQueryOptions success " + JSON.stringify(oFixture), function (assert) {
			var mOptions,
				sOriginalParameters = JSON.stringify(oFixture.mParameters);

			// code under test
			mOptions = ODataModel.prototype.buildQueryOptions(oFixture.mParameters,
				oFixture.bSystemQueryOptionsAllowed, oFixture.bSapAllowed);

			assert.deepEqual(mOptions, oFixture.expected || oFixture.mParameters || {});
			assert.strictEqual(JSON.stringify(oFixture.mParameters), sOriginalParameters);
		});
	});

	//*********************************************************************************************
	QUnit.test("buildQueryOptions with $$ options", function (assert) {
		assert.deepEqual(ODataModel.prototype.buildQueryOptions({$$groupId : "$direct"}), {});
	});

	//*********************************************************************************************
	QUnit.test("buildQueryOptions: parse system query options", function (assert) {
		var oExpand = {"foo" : null},
			oParserMock = this.mock(_Parser),
			aSelect = ["bar"];

		oParserMock.expects("parseSystemQueryOption")
			.withExactArgs("$expand=foo").returns({"$expand" : oExpand});
		oParserMock.expects("parseSystemQueryOption")
			.withExactArgs("$select=bar").returns({"$select" : aSelect});

		assert.deepEqual(ODataModel.prototype.buildQueryOptions({
			$expand : "foo",
			$select : "bar"
		}, true), {
			$expand : oExpand,
			$select : aSelect
		});
	});

	//*********************************************************************************************
	[{
		mOptions : {"$foo" : "foo"},
		bSystemQueryOptionsAllowed : true,
		error : "System query option $foo is not supported"
	}, {
		mOptions : {"@alias" : "alias"},
		bSystemQueryOptionsAllowed : true,
		error : "Parameter @alias is not supported"
	}, {
		mOptions : {"$expand" : {"foo" : true}},
		error : "System query option $expand is not supported"
	}, {
		mOptions : {"$expand" : {"foo" : {"$unknown" : "bar"}}},
		bSystemQueryOptionsAllowed : true,
		error : "System query option $unknown is not supported"
	}, {
		mOptions : {"$expand" : {"foo" : {"select" : "bar"}}},
		bSystemQueryOptionsAllowed : true,
		error : "System query option select is not supported"
	}, {
		mOptions : {"$levels" : 2},
		bSystemQueryOptionsAllowed : true,
		error : "System query option $levels is not supported"
	}, {
		mOptions : {"$expand" : {"foo" : {"$apply" : "bar"}}},
		bSystemQueryOptionsAllowed : true,
		error : "System query option $apply is not supported"
	}, {
		mOptions : {"$expand" : {"foo" : {"$skip" : "10"}}},
		bSystemQueryOptionsAllowed : true,
		error : "System query option $skip is not supported"
	}, {
		mOptions : {"$expand" : {"foo" : {"$top" : "10"}}},
		bSystemQueryOptionsAllowed : true,
		error : "System query option $top is not supported"
	}, {
		mOptions : {"sap-foo" : "300"},
		error : "Custom query option sap-foo is not supported"
	}, {
		mOptions : {"$count" : "foo"},
		bSystemQueryOptionsAllowed : true,
		error : "Invalid value for $count: foo"
	}, {
		mOptions : {"$count" : {}},
		bSystemQueryOptionsAllowed : true,
		error : "Invalid value for $count: [object Object]"
	}, {
		mOptions : {"$count" : undefined},
		bSystemQueryOptionsAllowed : true,
		error : "Invalid value for $count: undefined"
	}].forEach(function (o) {
		QUnit.test("buildQueryOptions error " + JSON.stringify(o), function (assert) {
			assert.throws(function () {
				ODataModel.prototype.buildQueryOptions(o.mOptions, o.bSystemQueryOptionsAllowed);
			}, new Error(o.error));
		});
	});

	//*********************************************************************************************
	QUnit.test("resolve", function (assert) {
		var oModel = this.createModel();

		// relative path w/o context
		assert.strictEqual(
			oModel.resolve("Name"),
			undefined);

		// just "/"
		assert.strictEqual(
			oModel.resolve("/"),
			"/");
		assert.strictEqual(
			oModel.resolve("", new BaseContext(oModel, "/")),
			"/");
		assert.strictEqual(
			oModel.resolve("/", new BaseContext(oModel, "/BusinessPartnerList#")),
			"/",
			"resolve does not handle # specially");

		// some entity set
		assert.strictEqual(
			oModel.resolve("/BusinessPartnerList"),
			"/BusinessPartnerList");
		assert.strictEqual(
			oModel.resolve("/BusinessPartnerList/"),
			"/BusinessPartnerList");
		assert.strictEqual(
			oModel.resolve("/BusinessPartnerList", {/*must be ignored*/}),
			"/BusinessPartnerList");
		assert.strictEqual(
			oModel.resolve("BusinessPartnerList", new BaseContext(oModel, "/")),
			"/BusinessPartnerList");
		assert.strictEqual(
			oModel.resolve("BusinessPartnerList/", new BaseContext(oModel, "/")),
			"/BusinessPartnerList");
		assert.strictEqual(
			oModel.resolve("", new BaseContext(oModel, "/BusinessPartnerList")),
			"/BusinessPartnerList");
		assert.strictEqual(
			oModel.resolve("", new BaseContext(oModel, "/BusinessPartnerList/")),
			"/BusinessPartnerList");

		// an entity set's property
		assert.strictEqual(
			oModel.resolve("Name/", new BaseContext(oModel, "/BusinessPartnerList")),
			"/BusinessPartnerList/Name");

		// an entity set's type (metadata!)
		assert.strictEqual(
			oModel.resolve("/BusinessPartnerList#/"),
			"/BusinessPartnerList#/");
		assert.strictEqual(
			oModel.resolve("BusinessPartnerList#/", new BaseContext(oModel, "/")),
			"/BusinessPartnerList#/");
		assert.strictEqual(
			oModel.resolve("#/", new BaseContext(oModel, "/BusinessPartnerList")),
			"/BusinessPartnerList/#/",
			"there is a / added before the relative path");
		assert.strictEqual(
			oModel.resolve("#/", new BaseContext(oModel, "/BusinessPartnerList/")),
			"/BusinessPartnerList/#/");
		assert.strictEqual(
			oModel.resolve("", new BaseContext(oModel, "/BusinessPartnerList#/")),
			"/BusinessPartnerList#/");

		// legacy compatibility (see sap.ui.model.Model#resolve)
		assert.strictEqual(
			oModel.resolve(42, new BaseContext(oModel, "/")),
			"/42");
		assert.throws(function () {
			Model.prototype.resolve(42, new BaseContext(oModel, "/"));
		});
		assert.strictEqual(
			oModel.resolve(0, new BaseContext(oModel, "/")),
			Model.prototype.resolve(0, new BaseContext(oModel, "/")),
			"/");
		assert.strictEqual(
			oModel.resolve(undefined, new BaseContext(oModel, "/")),
			"/");
		// Note: we do not go this far; JsDoc of @return wins: (string|undefined), nothing else!
		assert.strictEqual(Model.prototype.resolve(null), null);
	});

	//*********************************************************************************************
	QUnit.test("initializeSecurityToken", function () {
		var oModel = this.createModel("");

		this.mock(oModel.oRequestor).expects("refreshSecurityToken").withExactArgs()
			.rejects(new Error()); // simulate that the request failed

		// code under test - must not cause "Uncaught in promise"
		oModel.initializeSecurityToken();
	});

	//*********************************************************************************************
	[
		{numericSeverity : 1, type : MessageType.Success},
		{numericSeverity : 2, type : MessageType.Information},
		{numericSeverity : 3, type : MessageType.Warning},
		{numericSeverity : 4, type : MessageType.Error},
		{numericSeverity : 0, type : MessageType.None},
		{numericSeverity : 5, type : MessageType.None},
		{numericSeverity : null, type : MessageType.None},
		{numericSeverity : undefined, type : MessageType.None}
	].forEach(function (oFixture, i) {
		QUnit.test("reportUnboundMessages, " + i, function () {
			var oHelperMock = this.mock(_Helper),
				aMessages = [{
					code : 42,
					message : "foo0",
					longtextUrl : "foo/bar0",
					numericSeverity : oFixture.numericSeverity
				}, {
					code : 78,
					message : "foo2",
					numericSeverity : oFixture.numericSeverity
				}, {
					code : 79,
					message : "foo3",
					numericSeverity : oFixture.numericSeverity,
					technical : true
				}],
				oModel = this.createModel(),
				sResourcePath = "Foo('42')/to_Bar",
				aTechnicalDetails = [{}, {}, {}];

			oHelperMock.expects("makeAbsolute")
				.withExactArgs(aMessages[0].longtextUrl, oModel.sServiceUrl + sResourcePath)
				.returns("~URL~");
			oHelperMock.expects("createTechnicalDetails").withExactArgs(aMessages[0]).twice()
				.returns(aTechnicalDetails[0]);
			oHelperMock.expects("createTechnicalDetails").withExactArgs(aMessages[1]).twice()
				.returns(aTechnicalDetails[1]);
			oHelperMock.expects("createTechnicalDetails").withExactArgs(aMessages[2]).twice()
				.returns(aTechnicalDetails[2]);
			this.mock(oModel).expects("fireMessageChange").twice()
				.withExactArgs(sinon.match(function (mArguments) {
					var aMessages0 = mArguments.newMessages;

					return aMessages0.length === aMessages.length
						&& aMessages0.every(function (oMessage, j) {
							var sExpectedUrl = j === 0 ? "~URL~" : aMessages[j].longtextUrl;

							return oMessage instanceof Message
								&& oMessage.getCode() === aMessages[j].code
								&& oMessage.getDescriptionUrl() ===
									(sResourcePath ? sExpectedUrl : aMessages[j].longtextUrl)
								&& oMessage.getMessage() === aMessages[j].message
								&& oMessage.getMessageProcessor() === oModel
								&& oMessage.getPersistent() === true
								&& oMessage.getTarget() === ""
								&& oMessage.getTechnical() === (j === 2)
								&& oMessage.getTechnicalDetails() === aTechnicalDetails[j]
								&& oMessage.getType() === oFixture.type;
						});
				}));

			// code under test
			oModel.reportUnboundMessages(aMessages, sResourcePath);

			// code under test
			oModel.reportUnboundMessages([], sResourcePath);

			// code under test
			oModel.reportUnboundMessages(null, sResourcePath);

			sResourcePath = undefined;

			// code under test
			// w/o sResourcePath the longtext URLs should be absolute and remain unchanged
			oModel.reportUnboundMessages(aMessages, sResourcePath);
		});
	});

	//*********************************************************************************************
	[
		{numericSeverity : 1, type : MessageType.Success},
		{numericSeverity : 2, type : MessageType.Information},
		{numericSeverity : 3, type : MessageType.Warning},
		{numericSeverity : 4, type : MessageType.Error},
		{numericSeverity : 0, type : MessageType.None},
		{numericSeverity : 5, type : MessageType.None},
		{numericSeverity : null, type : MessageType.None},
		{numericSeverity : undefined, type : MessageType.None}
	].forEach(function (oFixture, i) {
		QUnit.test("reportBoundMessages #" + i, function (assert) {
			var oHelperlMock = this.mock(_Helper),
				aMessages = [{
					"additionalTargets" : ["additionalTarget1", "additionalTarget2", ""],
					"code" : "F42",
					"longtextUrl" : "/service/Messages(3)/LongText/$value",
					"message" : "foo0",
					"numericSeverity" : oFixture.numericSeverity,
					"target" : "Name",
					"technical" : true,
					"transition" : false
				}, {
					"code" : "UF1",
					"longtextUrl" : "/service/baz",
					"message" : "foo1",
					"numericSeverity" : oFixture.numericSeverity,
					"target" : "",
					"transition" : true
				}],
				oModel = this.createModel(),
				oModelMock = this.mock(oModel),
				aTechnicalDetails = [{}, {}];

			oHelperlMock.expects("createTechnicalDetails").withExactArgs(aMessages[0])
				.returns(aTechnicalDetails[0]);
			oHelperlMock.expects("createTechnicalDetails").withExactArgs(aMessages[1])
				.returns(aTechnicalDetails[1]);
			oModelMock.expects("fireMessageChange").withExactArgs(sinon.match.object)
				.callsFake(function (mArguments) {
					var aNewMessages = mArguments.newMessages,
						aOldMessages = mArguments.oldMessages;

					assert.strictEqual(aNewMessages.length, aMessages.length);
					assert.strictEqual(aOldMessages.length, 0);

					aNewMessages.forEach(function (oMessage, j) {
						assert.ok(oMessage instanceof Message);
						assert.strictEqual(oMessage.getCode(), aMessages[j].code);
						assert.strictEqual(oMessage.getDescriptionUrl(), aMessages[j].longtextUrl);
						assert.strictEqual(oMessage.getMessage(), aMessages[j].message);
						assert.strictEqual(oMessage.getMessageProcessor(), oModel);
						assert.strictEqual(oMessage.getPersistent(), aMessages[j].transition);
						assert.strictEqual(oMessage.getTechnicalDetails(), aTechnicalDetails[j]);
						assert.strictEqual(oMessage.getTechnical(), j === 0);
						assert.strictEqual(oMessage.getType(), oFixture.type);
					});
					// Tests for targets
					assert.strictEqual(aNewMessages[0].getTarget(), "/Team('42')/foo/bar/Name");
					assert.deepEqual(aNewMessages[0].getTargets(), [
						"/Team('42')/foo/bar/Name",
						"/Team('42')/foo/bar/additionalTarget1",
						"/Team('42')/foo/bar/additionalTarget2",
						"/Team('42')/foo/bar"
					]);

					assert.strictEqual(aNewMessages[1].getTarget(), "/Team('42')/foo/bar");
					assert.deepEqual(aNewMessages[1].getTargets(), ["/Team('42')/foo/bar"]);
				});

			// code under test
			oModel.reportBoundMessages("Team('42')", {"foo/bar" : aMessages});

			oModelMock.expects("fireMessageChange").never();

			// code under test
			oModel.reportBoundMessages("Team('42')", {});
		});
	});

	//*********************************************************************************************
	QUnit.test("reportBoundMessages: absolute target, sResourcePath ignored", function (assert) {
		var oModel = this.createModel();

		this.mock(oModel).expects("fireMessageChange").withExactArgs(sinon.match.object)
			.callsFake(function (mArguments) {
				assert.strictEqual(mArguments.newMessages[0].getTarget(), "/Team('42')/Name");
				assert.deepEqual(mArguments.newMessages[0].getTargets(), [
					"/Team('42')/Name",
					"/Team('43')/Name",
					"/Team('44')/Name"
				]);
			});

		// code under test
		oModel.reportBoundMessages(undefined, {
			"~any~" : [{
				target : "/Team('42')/Name",
				additionalTargets : ["/Team('43')/Name", "/Team('44')/Name"]
			}]
		});
	});

	//*********************************************************************************************
	QUnit.test("reportBoundMessages: special targets", function (assert) {
		var oModel = this.createModel(),
			oModelMock = this.mock(oModel);

		oModelMock.expects("fireMessageChange").withExactArgs(sinon.match.object)
			.callsFake(function (mArguments) {
				assert.strictEqual(mArguments.newMessages[0].getTarget(), "/Team('42')/Name");
				assert.deepEqual(mArguments.newMessages[0].getTargets(), [
					"/Team('42')/Name",
					"/Team('43')/Name",
					"/Team('44')/Name"
				]);
			});

		// code under test
		oModel.reportBoundMessages("Team", {
			"" : [{
				target : "('42')/Name",
				additionalTargets : ["('43')/Name", "('44')/Name"]
			}]
		});

		oModelMock.expects("fireMessageChange").withExactArgs(sinon.match.object)
			.callsFake(function (mArguments) {
				assert.strictEqual(mArguments.newMessages[0].getTarget(), "/Team('42')/Name");
				assert.deepEqual(mArguments.newMessages[0].getTargets(), [
					"/Team('42')/Name",
					"/Team('42')/Name1",
					"/Team('42')/Name2"
				]);
			});

		// code under test
		oModel.reportBoundMessages("Team", {
			"('42')" : [{
				target : "Name",
				additionalTargets : ["Name1", "Name2"]
			}]
		});
	});

	//*********************************************************************************************
	QUnit.test("reportBoundMessages: longtextUrl special cases", function (assert) {
		var aMessages = [{longtextUrl : "", target : ""}, {target : ""}],
			oModel = this.createModel();

		this.mock(oModel).expects("fireMessageChange")
			.withExactArgs(sinon.match.object)
			.callsFake(function (mArguments) {
				assert.strictEqual(mArguments.newMessages[0].getDescriptionUrl(), undefined);
				assert.strictEqual(mArguments.newMessages[1].getDescriptionUrl(), undefined);
			});

		// code under test
		oModel.reportBoundMessages("Team('42')", {"" : aMessages});
	});

	//*********************************************************************************************
	QUnit.test("reportBoundMessages: remove old messages w/o key predicates", function (assert) {
		var mMessages = {
				"/FOO('1')" : [{}, {}],
				// TODO use Message.getPersistent() instead of Message.persistent?
				"/FOO('1')/bar" : [{persistent : true}, {}, {persistent : true}, {}],
				"/FOO('2')" : [{}],
				"/FOO('3')/NavSingle" : [{}],
				"/FOO('3')/NavSingle/Name" : [{}, {}],
				"/FOO('3')/NavSingleBar/Name" : [{}]
			},
			oModel = this.createModel(),
			oModelMock = this.mock(oModel);

		oModel.mMessages = mMessages;

		oModelMock.expects("fireMessageChange")
			.withExactArgs(sinon.match.object)
			.callsFake(function (mArguments) {
				var aNewMessages = mArguments.newMessages,
					aOldMessages = mArguments.oldMessages;

				assert.ok(aOldMessages.indexOf(mMessages["/FOO('1')"][0]) >= 0);
				assert.ok(aOldMessages.indexOf(mMessages["/FOO('1')"][1]) >= 0);
				assert.ok(aOldMessages.indexOf(mMessages["/FOO('1')/bar"][0]) < 0);
				assert.ok(aOldMessages.indexOf(mMessages["/FOO('1')/bar"][1]) >= 0);
				assert.ok(aOldMessages.indexOf(mMessages["/FOO('1')/bar"][2]) < 0);
				assert.ok(aOldMessages.indexOf(mMessages["/FOO('1')/bar"][3]) >= 0);
				assert.strictEqual(aNewMessages.length, 0);
				assert.strictEqual(aOldMessages.length, 4);
			});

		// code under test
		oModel.reportBoundMessages("FOO('1')", {});

		oModelMock.expects("fireMessageChange")
			.withExactArgs(sinon.match.object)
			.callsFake(function (mArguments) {
				var aNewMessages = mArguments.newMessages,
					aOldMessages = mArguments.oldMessages;

				assert.ok(aOldMessages.indexOf(mMessages["/FOO('3')/NavSingle"][0]) >= 0);
				assert.ok(aOldMessages.indexOf(mMessages["/FOO('3')/NavSingle/Name"][0]) >= 0);
				assert.ok(aOldMessages.indexOf(mMessages["/FOO('3')/NavSingle/Name"][1]) >= 0);
				assert.ok(aOldMessages.indexOf(mMessages["/FOO('3')/NavSingleBar/Name"][0]) < 0);
				assert.strictEqual(aNewMessages.length, 0);
				assert.strictEqual(aOldMessages.length, 3);
			});

		// code under test
		oModel.reportBoundMessages("FOO('3')/NavSingle", {});
	});

	//*********************************************************************************************
	QUnit.test("reportBoundMessages: remove old messages with key predicates", function (assert) {
		var oHelperMock = this.mock(_Helper),
			mMessages = {
				"/FOO('1')" : [{}, {}],
				"/FOO('1')/bar" : [{}],
				"/FOO('2')" : [{persistent : true}, {}, {persistent : true}, {}],
				"/FOO('3')/NavSingle" : [{}],
				"/FOO('3')/NavSingle/Name" : [{}, {}],
				"/FOO('3')/NavSingleBar/Name" : [{}]
			},
			oModel = this.createModel(),
			oModelMock = this.mock(oModel);

		oModel.mMessages = mMessages;
		oHelperMock.expects("buildPath").withExactArgs("/FOO", "('1')").returns("/FOO('1')");
		oHelperMock.expects("buildPath").withExactArgs("/FOO", "('2')").returns("/FOO('2')");
		oModelMock.expects("fireMessageChange")
			.withExactArgs(sinon.match.object)
			.callsFake(function (mArguments) {
				var aNewMessages = mArguments.newMessages,
					aOldMessages = mArguments.oldMessages;

				assert.ok(aOldMessages.indexOf(mMessages["/FOO('1')"][0]) >= 0);
				assert.ok(aOldMessages.indexOf(mMessages["/FOO('1')"][1]) >= 0);
				assert.ok(aOldMessages.indexOf(mMessages["/FOO('1')/bar"][0]) >= 0);
				assert.ok(aOldMessages.indexOf(mMessages["/FOO('2')"][0]) < 0);
				assert.ok(aOldMessages.indexOf(mMessages["/FOO('2')"][1]) >= 0);
				assert.ok(aOldMessages.indexOf(mMessages["/FOO('2')"][2]) < 0);
				assert.ok(aOldMessages.indexOf(mMessages["/FOO('2')"][3]) >= 0);
				assert.ok(aOldMessages.indexOf(mMessages["/FOO('3')/NavSingleBar/Name"][0]) < 0);
				assert.strictEqual(aNewMessages.length, 0);
				assert.strictEqual(aOldMessages.length, 5);
			});

		// code under test - only keys 1 and 2 were read
		oModel.reportBoundMessages("FOO", {}, ["('1')", "('2')"]);
	});

	//*********************************************************************************************
	QUnit.test("reportBoundMessages: remove old messages - complete collection", function (assert) {
		var mMessages = {
				"/FOO('1')" : [{}, {}],
				"/FOO('1')/bar" : [{}],
				"/FOO('2')" : [{persistent : true}, {}, {persistent : true}, {}],
				"/FOO('3')/NavSingle" : [{}],
				"/FOO('3')/NavSingle/Name" : [{}, {}],
				"/FOO('3')/NavSingleBar/Name" : [{}]
			},
			oModel = this.createModel(),
			oModelMock = this.mock(oModel);

		oModel.mMessages = mMessages;
		oModelMock.expects("fireMessageChange")
			.withExactArgs(sinon.match.object)
			.callsFake(function (mArguments) {
				var aNewMessages = mArguments.newMessages,
					aOldMessages = mArguments.oldMessages;

				assert.ok(aOldMessages.indexOf(mMessages["/FOO('1')"][0]) >= 0);
				assert.ok(aOldMessages.indexOf(mMessages["/FOO('1')"][1]) >= 0);
				assert.ok(aOldMessages.indexOf(mMessages["/FOO('1')/bar"][0]) >= 0);
				assert.ok(aOldMessages.indexOf(mMessages["/FOO('2')"][0]) < 0);
				assert.ok(aOldMessages.indexOf(mMessages["/FOO('2')"][1]) >= 0);
				assert.ok(aOldMessages.indexOf(mMessages["/FOO('2')"][2]) < 0);
				assert.ok(aOldMessages.indexOf(mMessages["/FOO('2')"][3]) >= 0);
				assert.ok(aOldMessages.indexOf(mMessages["/FOO('3')/NavSingle"][0]) >= 0);
				assert.ok(aOldMessages.indexOf(mMessages["/FOO('3')/NavSingle/Name"][0]) >= 0);
				assert.ok(aOldMessages.indexOf(mMessages["/FOO('3')/NavSingle/Name"][1]) >= 0);
				assert.ok(aOldMessages.indexOf(mMessages["/FOO('3')/NavSingleBar/Name"][0]) >= 0);
				assert.strictEqual(aNewMessages.length, 0);
				assert.strictEqual(aOldMessages.length, 9);
			});

		// code under test
		oModel.reportBoundMessages("FOO", {});
	});

	//*********************************************************************************************
	QUnit.test("getAllBindings", function (assert) {
		var oModel = this.createModel(),
			oBinding1 = new Binding(oModel, "relative"),
			oBinding2 = new Binding(oModel, "/absolute");

		assert.deepEqual(oModel.aAllBindings, []);

		// code under test
		assert.deepEqual(oModel.getAllBindings(), oModel.aAllBindings);
		assert.notStrictEqual(oModel.getAllBindings(), oModel.aAllBindings);

		oModel.bindingCreated(oBinding1);
		oModel.bindingCreated(oBinding2);
		assert.deepEqual(oModel.aAllBindings, [oBinding1, oBinding2]);

		// code under test
		assert.deepEqual(oModel.getAllBindings(), oModel.aAllBindings);
		assert.notStrictEqual(oModel.getAllBindings(), oModel.aAllBindings);
	});

	//*********************************************************************************************
	QUnit.test("withUnresolvedBindings", function (assert) {
		var oAbsoluteBinding = {
				isResolved : function () {}
			},
			oModel = this.createModel(),
			vParameter = {},
			oResolvedBinding = {
				isResolved : function () {}
			},
			oUnresolvedBinding0 = {
				anyCallback : function () {},
				isResolved : function () {}
			},
			oUnresolvedBinding0Mock = this.mock(oUnresolvedBinding0),
			oUnresolvedBinding1 = {
				anyCallback : function () {},
				isResolved : function () {}
			},
			oUnresolvedBinding2 = {
				anyCallback : function () {},
				isResolved : function () {}
			},
			oUnresolvedBinding2Mock = this.mock(oUnresolvedBinding2);

		this.mock(oModel).expects("getAllBindings").never();
		oModel.aAllBindings = [];

		// code under test
		assert.strictEqual(oModel.withUnresolvedBindings(), false);

		oModel.aAllBindings = [oResolvedBinding, oUnresolvedBinding0, oAbsoluteBinding,
			oUnresolvedBinding1, oUnresolvedBinding2];

		this.mock(oResolvedBinding).expects("isResolved").withExactArgs().returns(true);
		oUnresolvedBinding0Mock.expects("isResolved").withExactArgs().returns(false);
		oUnresolvedBinding0Mock.expects("anyCallback").withExactArgs(sinon.match.same(vParameter))
			.returns(false);
		this.mock(oAbsoluteBinding).expects("isResolved").withExactArgs().returns(true);
		this.mock(oUnresolvedBinding1).expects("isResolved").withExactArgs().returns(false);
		this.mock(oUnresolvedBinding1).expects("anyCallback")
			.withExactArgs(sinon.match.same(vParameter))
			.returns(true);
		oUnresolvedBinding2Mock.expects("isResolved").withExactArgs().returns(false);
		oUnresolvedBinding2Mock.expects("anyCallback").never();

		// code under test
		assert.strictEqual(oModel.withUnresolvedBindings("anyCallback", vParameter), true);

		oModel.aAllBindings = [oUnresolvedBinding0, oUnresolvedBinding2];

		oUnresolvedBinding0Mock.expects("isResolved").withExactArgs().returns(false);
		oUnresolvedBinding0Mock.expects("anyCallback").withExactArgs(sinon.match.same(vParameter))
			.returns(false);
		oUnresolvedBinding2Mock.expects("isResolved").withExactArgs().returns(false);
		oUnresolvedBinding2Mock.expects("anyCallback").withExactArgs(sinon.match.same(vParameter))
			.returns();

		// code under test
		assert.strictEqual(oModel.withUnresolvedBindings("anyCallback", vParameter), false);
	});

	//*********************************************************************************************
	QUnit.test("lockGroup", function (assert) {
		var fnCancel = {},
			sGroupId = {/*string*/},
			oGroupLock = {},
			bLocked  = {/*boolean*/},
			oModel = this.createModel(),
			bModifying = {/*boolean*/},
			oOwner = {};

		this.mock(oModel.oRequestor).expects("lockGroup")
			.withExactArgs(sinon.match.same(sGroupId), sinon.match.same(oOwner),
				sinon.match.same(bLocked), sinon.match.same(bModifying), sinon.match.same(fnCancel))
			.returns(oGroupLock);

		// code under test
		assert.strictEqual(oModel.lockGroup(sGroupId, oOwner, bLocked, bModifying, fnCancel),
			oGroupLock);
	});

	//*********************************************************************************************
	QUnit.test("changeHttpHeaders", function (assert) {
		var oModel = this.createModel(),
			mHeaders = oModel.mHeaders,
			mMetadataHeaders = oModel.mMetadataHeaders,
			mMyHeaders = {abc : undefined, def : undefined, "x-CsRf-ToKeN" : "abc123"},
			oRequestorMock = this.mock(oModel.oRequestor);

		assert.deepEqual(mHeaders, {"Accept-Language" : "ab-CD"});
		oRequestorMock.expects("checkHeaderNames").withExactArgs(sinon.match.object);
		oRequestorMock.expects("checkForOpenRequests").withExactArgs().exactly(5);

		// code under test
		oModel.changeHttpHeaders({aBc : "xyz"});

		assert.strictEqual(oModel.mHeaders, mHeaders);
		assert.strictEqual(oModel.mMetadataHeaders, mMetadataHeaders);
		assert.deepEqual(mHeaders, {"Accept-Language" : "ab-CD", aBc : "xyz"});
		assert.deepEqual(mMetadataHeaders, {"Accept-Language" : "ab-CD", aBc : "xyz"});

		oRequestorMock.expects("checkHeaderNames").withExactArgs(sinon.match.object);

		// code under test
		oModel.changeHttpHeaders({AbC : "12 [3] $4: ~"});

		assert.deepEqual(mMetadataHeaders, {AbC : "12 [3] $4: ~", "Accept-Language" : "ab-CD"});
		assert.deepEqual(mHeaders, {AbC : "12 [3] $4: ~", "Accept-Language" : "ab-CD"});

		oRequestorMock.expects("checkHeaderNames").withExactArgs(sinon.match.same(mMyHeaders));

		// code under test
		oModel.changeHttpHeaders(mMyHeaders);

		assert.deepEqual(mMetadataHeaders, {"Accept-Language" : "ab-CD"});
		assert.deepEqual(mHeaders, {"Accept-Language" : "ab-CD", "X-CSRF-Token" : "abc123"});
		assert.deepEqual(mMyHeaders, {abc : undefined, def : undefined, "x-CsRf-ToKeN" : "abc123"});

		oRequestorMock.expects("checkHeaderNames").withExactArgs(undefined);

		// code under test
		oModel.changeHttpHeaders();

		assert.deepEqual(mMetadataHeaders, {"Accept-Language" : "ab-CD"});
		assert.deepEqual(mHeaders, {"Accept-Language" : "ab-CD", "X-CSRF-Token" : "abc123"});

		oRequestorMock.expects("checkHeaderNames").withExactArgs(null);

		// code under test
		oModel.changeHttpHeaders(null);

		assert.deepEqual(mMetadataHeaders, {"Accept-Language" : "ab-CD"});
		assert.deepEqual(mHeaders, {"Accept-Language" : "ab-CD", "X-CSRF-Token" : "abc123"});
	});

	//*********************************************************************************************
[true, 42, NaN, {}, null, function () {}, "", "Motörhead", "a\r\nb: c"].forEach(function (vValue) {
	QUnit.test("changeHttpHeaders: unsupported header value: " + vValue, function (assert) {
		var oModel = this.createModel();

		oModel.changeHttpHeaders({def : "123"});

		// code under test
		assert.throws(function () {
			oModel.changeHttpHeaders({def : undefined, abc : vValue});
		}, new Error("Unsupported value for header 'abc': " + vValue));

		assert.deepEqual(oModel.mHeaders, {"Accept-Language" : "ab-CD", def : "123"});
		assert.deepEqual(oModel.mMetadataHeaders, {"Accept-Language" : "ab-CD", def : "123"});
	});
});

	//*********************************************************************************************
["123", undefined].forEach(function (sValue) {
	QUnit.test("changeHttpHeaders: duplicate header name, value: " + sValue, function (assert) {
		var oModel = this.createModel();

		// code under test
		assert.throws(function () {
			oModel.changeHttpHeaders({aBc : sValue, AbC : "456"});
		}, new Error("Duplicate header AbC"));

		assert.deepEqual(oModel.mHeaders, {"Accept-Language" : "ab-CD"});
		assert.deepEqual(oModel.mMetadataHeaders, {"Accept-Language" : "ab-CD"});
	});
});

	//*********************************************************************************************
	QUnit.test("changeHttpHeaders: error on open requests", function (assert) {
		var oError = new Error("message"),
			oModel = this.createModel();

		this.mock(oModel.oRequestor).expects("checkForOpenRequests").withExactArgs().throws(oError);

		// code under test
		assert.throws(function () {
			oModel.changeHttpHeaders({abc : "123"});
		}, oError);

		assert.deepEqual(oModel.mHeaders, {"Accept-Language" : "ab-CD"});
		assert.deepEqual(oModel.mMetadataHeaders, {"Accept-Language" : "ab-CD"});
	});

	//*********************************************************************************************
	QUnit.test("getHttpHeaders", function (assert) {
		var oModel = this.createModel();

		// code under test
		assert.deepEqual(oModel.getHttpHeaders(), {"Accept-Language" : "ab-CD"});

		// code under test
		assert.deepEqual(oModel.getHttpHeaders(true), {"Accept-Language" : "ab-CD"});

		// code under test
		assert.notStrictEqual(oModel.getHttpHeaders(), oModel.getHttpHeaders(), "no copy on write");

		assert.deepEqual(oModel.mHeaders, {"Accept-Language" : "ab-CD"},
			"model's headers unchanged");

		// SAP-ContextId is the only header not changeable via #changeHttpHeaders that is set to
		// oModel.mHeaders in our coding
		oModel.mHeaders["SAP-ContextId"] = "123";
		// X-CSRF-Token header is set to null if the response does not contain this header
		oModel.mHeaders["X-CSRF-Token"] = null;

		// code under test
		assert.deepEqual(oModel.getHttpHeaders(), {"Accept-Language" : "ab-CD"});

		// code under test
		assert.deepEqual(oModel.getHttpHeaders(true),
			{"Accept-Language" : "ab-CD", "SAP-ContextId" : "123"});

		assert.deepEqual(oModel.mHeaders, {
			"Accept-Language" : "ab-CD",
			"SAP-ContextId" : "123",
			"X-CSRF-Token" : null
		}, "model's headers unchanged");

		oModel.mHeaders["X-CSRF-Token"] = "xyz";

		// code under test
		assert.deepEqual(oModel.getHttpHeaders(),
			{"Accept-Language" : "ab-CD", "X-CSRF-Token" : "xyz"});

		// code under test
		assert.deepEqual(oModel.getHttpHeaders(true),
			{"Accept-Language" : "ab-CD", "SAP-ContextId" : "123", "X-CSRF-Token" : "xyz"});

		assert.deepEqual(oModel.mHeaders, {
			"Accept-Language" : "ab-CD",
			"SAP-ContextId" : "123",
			"X-CSRF-Token" : "xyz"
		}, "model's headers unchanged");
	});

	//*********************************************************************************************
	QUnit.test("getMessages", function (assert) {
		var oContext = {
				getPath : function () { return "~path~"; }
			},
			aMessagesByPath = [/*unsorted*/],
			oModel = this.createModel();

		this.mock(oModel).expects("getMessagesByPath").withExactArgs("~path~", true)
			.returns(aMessagesByPath);
		this.mock(aMessagesByPath).expects("sort").withExactArgs(Message.compare)
			.returns("~messagesByPathSorted~");

		// code under test
		assert.strictEqual(oModel.getMessages(oContext), "~messagesByPathSorted~");
	});

	//*********************************************************************************************
	QUnit.test("addPrerenderingTask: queue", function (assert) {
		var oExpectation = this.mock(sap.ui.getCore()).expects("addPrerenderingTask")
				.withExactArgs(sinon.match.func),
			fnFirstPrerenderingTask = "first",
			fnPrerenderingTask0 = "0",
			fnPrerenderingTask1 = "1",
			oModel = this.createModel("", {}, true);

		this.mock(window).expects("setTimeout"); // avoid prerendering timers
		assert.strictEqual(oModel.aPrerenderingTasks, null);

		// code under test
		oModel.addPrerenderingTask(fnPrerenderingTask0);

		oExpectation.verify();
		assert.deepEqual(oModel.aPrerenderingTasks, [fnPrerenderingTask0]);

		// code under test
		oModel.addPrerenderingTask(fnPrerenderingTask1);

		assert.deepEqual(oModel.aPrerenderingTasks, [fnPrerenderingTask0, fnPrerenderingTask1]);

		// code under test
		oModel.addPrerenderingTask(fnFirstPrerenderingTask, /*bFirst*/true);

		assert.deepEqual(oModel.aPrerenderingTasks,
			[fnFirstPrerenderingTask, fnPrerenderingTask0, fnPrerenderingTask1]);
	});

	//*********************************************************************************************
	QUnit.test("addPrerenderingTask: rendering before 1st setTimeout", function (assert) {
		var oAddTaskMock,
			fnFirstTask = this.spy(),
			fnLastTask = this.spy(),
			oModel = this.createModel("", {}, true),
			fnPrerenderingTask0 = this.spy(function () {
				assert.notStrictEqual(oModel.aPrerenderingTasks, null);
				oModel.addPrerenderingTask(fnFirstTask, /*bFirst*/true);
			}),
			fnPrerenderingTask1 = this.spy(function () {
				oModel.addPrerenderingTask(fnLastTask);
			});

		oAddTaskMock = this.mock(sap.ui.getCore()).expects("addPrerenderingTask")
			.withExactArgs(sinon.match.func);
		this.mock(window).expects("setTimeout").withExactArgs(sinon.match.func, 0).returns(42);
		oModel.addPrerenderingTask(fnPrerenderingTask0);
		oModel.addPrerenderingTask(fnPrerenderingTask1);
		this.mock(window).expects("clearTimeout").withExactArgs(42);

		// code under test - run core prerendering task
		oAddTaskMock.firstCall.args[0]();

		assert.ok(fnPrerenderingTask0.calledOnce);
		assert.ok(fnPrerenderingTask0.calledOn());
		assert.ok(fnPrerenderingTask0.calledWithExactly());

		assert.ok(fnFirstTask.calledOnce);
		assert.ok(fnFirstTask.calledOn());
		assert.ok(fnFirstTask.calledWithExactly());
		assert.ok(fnFirstTask.calledAfter(fnPrerenderingTask0));

		assert.ok(fnPrerenderingTask1.calledOnce);
		assert.ok(fnPrerenderingTask1.calledOn());
		assert.ok(fnPrerenderingTask1.calledWithExactly());
		assert.ok(fnPrerenderingTask1.calledAfter(fnFirstTask));

		assert.ok(fnLastTask.calledOnce);
		assert.ok(fnLastTask.calledOn());
		assert.ok(fnLastTask.calledWithExactly());
		assert.ok(fnLastTask.calledAfter(fnPrerenderingTask1));

		assert.strictEqual(oModel.aPrerenderingTasks, null);
	});

	//*********************************************************************************************
	QUnit.test("addPrerenderingTask: rendering before 2nd setTimeout", function (assert) {
		var oAddTaskExpectation,
			oModel = this.createModel("", {}, true),
			oSetTimeoutExpectation,
			fnTask = this.spy(),
			oWindowMock = this.mock(window);

		oAddTaskExpectation = this.mock(sap.ui.getCore()).expects("addPrerenderingTask")
			.withExactArgs(sinon.match.func);
		oSetTimeoutExpectation = oWindowMock.expects("setTimeout")
			.withExactArgs(sinon.match.func, 0);

		// code under test
		oModel.addPrerenderingTask(fnTask);

		assert.ok(fnTask.notCalled);
		oWindowMock.expects("setTimeout").withExactArgs(sinon.match.func, 0).returns(42);

		// code under test - run the first setTimeout task
		oSetTimeoutExpectation.args[0][0]();

		assert.ok(fnTask.notCalled);

		oWindowMock.expects("clearTimeout").withExactArgs(42);

		// code under test - run core prerendering task
		oAddTaskExpectation.firstCall.args[0]();

		assert.ok(fnTask.calledOnce);
	});

	//*********************************************************************************************
	QUnit.test("addPrerenderingTask: via setTimeout", function (assert) {
		var oAddTaskExpectation,
			oModel = this.createModel("", {}, true),
			oSetTimeoutExpectation,
			fnTask1 = this.spy(),
			fnTask2 = "~task~2~";

		oAddTaskExpectation = this.mock(sap.ui.getCore()).expects("addPrerenderingTask").twice()
			.withExactArgs(sinon.match.func);
		oSetTimeoutExpectation = this.mock(window).expects("setTimeout").thrice()
			.withExactArgs(sinon.match.func, 0);

		// code under test
		oModel.addPrerenderingTask(fnTask1);

		assert.ok(fnTask1.notCalled);

		// code under test - run the first setTimeout task
		oSetTimeoutExpectation.args[0][0]();

		assert.ok(fnTask1.notCalled);

		// code under test - run the second setTimeout task
		oSetTimeoutExpectation.args[1][0]();

		assert.ok(fnTask1.calledOnce);

		// code under test
		oModel.addPrerenderingTask(fnTask2);

		// code under test - run core prerendering task
		oAddTaskExpectation.firstCall.args[0]();

		assert.deepEqual(oModel.aPrerenderingTasks, [fnTask2]);
	});

	//*********************************************************************************************
	QUnit.test("requestSideEffects", function (assert) {
		var oBinding1 = {
				isRoot : function () { return  true; },
				requestAbsoluteSideEffects : function () {}
			},
			oBinding2 = { // has requestAbsoluteSideEffects, but is not root
				isRoot : function () { return  false; },
				requestAbsoluteSideEffects : function () {}
			},
			oBinding3 = {
				isRoot : function () { return  true; },
				requestAbsoluteSideEffects : function () {}
			},
			oBinding4 = { // is root, but has no requestAbsoluteSideEffects
				isRoot : function () { return  true; }
			},
			oModel = this.createModel(),
			aPaths = ["/foo", "/bar/baz"],
			oPromise;

		oModel.aAllBindings = [oBinding1, oBinding2, oBinding3, oBinding4];
		this.mock(oBinding1).expects("requestAbsoluteSideEffects")
			.withExactArgs("group", sinon.match.same(aPaths)).resolves("~1");
		this.mock(oBinding2).expects("requestAbsoluteSideEffects").never();
		this.mock(oBinding3).expects("requestAbsoluteSideEffects")
			.withExactArgs("group", sinon.match.same(aPaths)).resolves("~3");

		// code under test
		oPromise = oModel.requestSideEffects("group", aPaths);

		assert.notOk(oPromise.isFulfilled());
		return oPromise.then(function (aResults) {
			assert.deepEqual(aResults, ["~1", "~3"]);
		});
	});

	//*********************************************************************************************
	QUnit.test("requestSideEffects: nothing to do", function (assert) {
		var oBinding = {
				isRoot : function () { return  true; },
				requestAbsoluteSideEffects : function () {}
			},
			oModel = this.createModel();

		oModel.aAllBindings = [oBinding];
		this.mock(oBinding).expects("requestAbsoluteSideEffects").never();

		assert.strictEqual(oModel.requestSideEffects("group", []), undefined);
	});

	//*********************************************************************************************
	QUnit.test("filterMatchingMessages: no match", function (assert) {
		var oModel = this.createModel();

		this.mock(_Helper).expects("hasPathPrefix").withExactArgs("/target", "/prefix")
			.returns(false);

		// code under test
		assert.deepEqual(oModel.filterMatchingMessages("/target", "/prefix"), []);
	});

	//*********************************************************************************************
	QUnit.test("filterMatchingMessages: match", function (assert) {
		var aMessages = [],
			oModel = this.createModel();

		oModel.mMessages = {
			"/target" : aMessages
		};
		this.mock(_Helper).expects("hasPathPrefix").withExactArgs("/target", "/prefix")
			.returns(true);

		// code under test
		assert.strictEqual(oModel.filterMatchingMessages("/target", "/prefix"), aMessages);
	});

	//*********************************************************************************************
[Promise, SyncPromise].forEach(function (oThenable) {
	QUnit.test("getReporter " + oThenable, function () {
		var oError1 = new Error("failed intentionally"),
			oError2 = new Error("already reported"),
			oModel = this.createModel(),
			oPromise1 = oThenable.reject(oError1),
			oPromise2 = oThenable.reject(oError2);

		this.mock(oModel).expects("reportError").withExactArgs(
			oError1.message, sClassName, sinon.match.same(oError1));

		// code under test
		oPromise1.catch(oModel.getReporter());

		oError2.$reported = true;

		// code under test
		oPromise2.catch(oModel.getReporter());

		return Promise.all([oPromise1, oPromise2])
			.catch(function () {/* avoid that the test fails */});
	});
});
});

//TODO constructor: test that the service root URL is absolute?
//TODO read: support the mParameters context, urlParameters, filters, sorters, batchGroupId
//TODO read etc.: provide access to "abort" functionality

// oResponse.headers look like this:
// Content-Type:application/json; odata.metadata=minimal;charset=utf-8
// etag:W/"20150915102433.7994750"
// location:.../sap/opu/odata4/IWBEP/TEA/default/IWBEP/TEA_BUSI/0001/EMPLOYEES('7')
//TODO can we make use of "location" header? relation to canonical URL?
// oData looks like this:
// {
//   "@odata.context" : "$metadata#EMPLOYEES",
//   "@odata.etag" : "W/\"20150915102433.7994750\"",
// }
//TODO can we make use of @odata.context in response data?
//TODO etag handling
//TODO use standard APIs like URL/URLSearchParams for URL handling?

//TODO support "/#" syntax, e.g. "/EMPLOYEES(ID='1')/ENTRYDATE/#Type/QualifiedName"
//     do it for bindings, not as a JS API (getMetaModel().getMetaContext() etc. is already there)
