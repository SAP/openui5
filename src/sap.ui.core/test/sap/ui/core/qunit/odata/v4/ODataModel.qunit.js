/*!
 * ${copyright}
 */
sap.ui.require([
	"jquery.sap.global",
	"sap/ui/core/message/Message",
	"sap/ui/model/Binding",
	"sap/ui/model/BindingMode",
	"sap/ui/model/Context",
	"sap/ui/model/Model",
	"sap/ui/model/odata/type/String",
	"sap/ui/model/odata/ODataUtils",
	"sap/ui/model/odata/OperationMode",
	"sap/ui/model/odata/v4/Context",
	"sap/ui/model/odata/v4/lib/_MetadataRequestor",
	"sap/ui/model/odata/v4/lib/_Parser",
	"sap/ui/model/odata/v4/lib/_Requestor",
	"sap/ui/model/odata/v4/ODataContextBinding",
	"sap/ui/model/odata/v4/ODataListBinding",
	"sap/ui/model/odata/v4/ODataMetaModel",
	"sap/ui/model/odata/v4/ODataModel",
	"sap/ui/model/odata/v4/ODataPropertyBinding",
	"sap/ui/model/odata/v4/SubmitMode",
	"sap/ui/test/TestUtils"
], function (jQuery, Message, Binding, BindingMode, BaseContext, Model, TypeString,
		ODataUtils, OperationMode, Context, _MetadataRequestor, _Parser, _Requestor,
		ODataContextBinding, ODataListBinding, ODataMetaModel, ODataModel, ODataPropertyBinding,
		SubmitMode, TestUtils) {
	/*global QUnit, sinon */
	/*eslint max-nested-callbacks: 0, no-warning-comments: 0 */
	"use strict";

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
		TestControl = sap.ui.core.Element.extend("test.sap.ui.model.odata.v4.ODataModel", {
			metadata : {
				properties : {
					text : "string"
				}
			}
		});

	/**
	 * Clones the given object
	 *
	 * @param {any} v the object
	 * @returns {any} the clone
	 */
	function clone(v) {
		return v && JSON.parse(JSON.stringify(v));
	}

	/**
	 * Creates a V4 OData service for <code>TEA_BUSI</code>.
	 *
	 * @param {string} [sQuery] URI query parameters starting with '?'
	 * @param {object} [mParameters] additional model parameters
	 * @returns {sap.ui.model.odata.v4.oDataModel} the model
	 */
	function createModel(sQuery, mParameters) {
		mParameters = jQuery.extend({}, mParameters, {
			serviceUrl : getServiceUrl() + (sQuery || ""),
			synchronizationMode : "None"
		});
		return new ODataModel(mParameters);
	}

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
			this.oLogMock = this.mock(jQuery.sap.log);
			this.oLogMock.expects("warning").never();
			this.oLogMock.expects("error").never();
			this.mock(sap.ui.getCore().getConfiguration()).expects("getLanguageTag").atLeast(0)
				.returns("ab-CD");
		}
	});

	//*********************************************************************************************
	QUnit.test("basics", function (assert) {
		var oMetadataRequestor = {},
			oMetaModel,
			oModel,
			oModelPrototypeMock = this.mock(ODataModel.prototype),
			mModelOptions = {};

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
		oModel = createModel("", {operationMode : OperationMode.Server, serviceUrl : "/foo/",
			synchronizationMode : "None"});

		assert.strictEqual(oModel.sOperationMode, OperationMode.Server);

		this.mock(ODataModel.prototype).expects("buildQueryOptions")
			.withExactArgs({}, false, true).returns(mModelOptions);
		this.mock(_MetadataRequestor).expects("create")
			.withExactArgs({"Accept-Language" : "ab-CD"}, "4.0", sinon.match.same(mModelOptions))
			.returns(oMetadataRequestor);
		this.mock(ODataMetaModel.prototype).expects("fetchEntityContainer").withExactArgs(true);
		oModelPrototypeMock.expects("initializeSecurityToken").withExactArgs();

		// code under test
		oModel = createModel("", {earlyRequests : true, annotationURI : ["my/annotations.xml"]});

		assert.strictEqual(oModel.sServiceUrl, getServiceUrl());
		assert.strictEqual(oModel.toString(), sClassName + ": " + getServiceUrl());
		assert.strictEqual(oModel.mUriParameters, mModelOptions);
		assert.strictEqual(oModel.getDefaultBindingMode(), BindingMode.TwoWay);
		assert.strictEqual(oModel.isBindingModeSupported(BindingMode.OneTime), true);
		assert.strictEqual(oModel.isBindingModeSupported(BindingMode.OneWay), true);
		assert.strictEqual(oModel.isBindingModeSupported(BindingMode.TwoWay), true);
		assert.deepEqual(oModel.aAllBindings, []);
		oMetaModel = oModel.getMetaModel();
		assert.ok(oMetaModel instanceof ODataMetaModel);
		assert.strictEqual(oMetaModel.oRequestor, oMetadataRequestor);
		assert.strictEqual(oMetaModel.sUrl, getServiceUrl() + "$metadata");
		assert.deepEqual(oMetaModel.aAnnotationUris, ["my/annotations.xml"]);
	});

	//*********************************************************************************************
	QUnit.test("Early requests: $metadata and annotations", function (assert) {
		var oFetchEntityContainerExpectation
			= this.mock(ODataMetaModel.prototype).expects("fetchEntityContainer")
				.withExactArgs(true),
			oModel;

		// code under test
		oModel = createModel("", {earlyRequests : true});

		assert.ok(oFetchEntityContainerExpectation.alwaysCalledOn(oModel.getMetaModel()));
	});

	//*********************************************************************************************
	QUnit.test("supportReferences", function (assert) {
		createModel("", {supportReferences : false});
	});

	//*********************************************************************************************
	QUnit.test("unsupported OData version", function (assert) {
		assert.throws(function () {
			createModel("", {odataVersion : "foo"});
		}, new Error("Unsupported value for parameter odataVersion: foo"));
	});

	//*********************************************************************************************
	["2.0", "4.0"].forEach(function (sODataVersion) {
		QUnit.test("create requestors for odataVersion: " + sODataVersion, function (assert) {
			var oModel;

			this.mock(_Requestor).expects("create")
				.withExactArgs(getServiceUrl(), sinon.match.object, {"Accept-Language" : "ab-CD"},
					sinon.match.object, sODataVersion)
				.returns({});

			this.mock(_MetadataRequestor).expects("create")
				.withExactArgs({"Accept-Language" : "ab-CD"}, sODataVersion, sinon.match.object)
				.returns({});

			// code under test
			oModel = createModel("", {odataVersion : sODataVersion});

			assert.strictEqual(oModel.getODataVersion(), sODataVersion);
		});
	});

	//*********************************************************************************************
	QUnit.test("with serviceUrl params", function (assert) {
		var oModel,
			mModelOptions = {};

		this.mock(ODataModel.prototype).expects("buildQueryOptions")
			.withExactArgs({"sap-client" : "111"}, false, true)
			.returns(mModelOptions);

		// code under test
		oModel = createModel("?sap-client=111");

		assert.strictEqual(oModel.sServiceUrl, getServiceUrl());
		assert.strictEqual(oModel.mUriParameters, mModelOptions);
	});

	//*********************************************************************************************
	QUnit.test("Model construction with group ID", function (assert) {
		var oModel;

		oModel = createModel();
		assert.strictEqual(oModel.getGroupId(), "$auto");

		oModel = createModel("", {groupId : "$direct"});
		assert.strictEqual(oModel.getGroupId(), "$direct");

		oModel = createModel("", {groupId : "$auto"});
		assert.strictEqual(oModel.getGroupId(), "$auto");

		assert.throws(function () {
			oModel = createModel("", {groupId : "foo"});
		}, new Error("Group ID must be '$auto' or '$direct'"));
	});

	//*********************************************************************************************
	QUnit.test("Model construction with update group ID", function (assert) {
		var oModel;

		oModel = createModel();
		assert.strictEqual(oModel.getUpdateGroupId(), "$auto");

		oModel = createModel("", {groupId : "$direct"});
		assert.strictEqual(oModel.getUpdateGroupId(), "$direct");

		oModel = createModel("", {updateGroupId : "$direct"});
		assert.strictEqual(oModel.getUpdateGroupId(), "$direct");

		oModel = createModel("", {groupId : "$direct", updateGroupId : "applicationId"});
		assert.strictEqual(oModel.getUpdateGroupId(), "applicationId");

		assert.throws(function () {
			oModel = createModel("", {updateGroupId : "$foo"});
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
		oModel = createModel("");
		assert.deepEqual(oModel.mGroupProperties, oDefaultGroupProperties);

		// code under test
		oModel = createModel("", {groupProperties : oGroupProperties});
		assert.deepEqual(oModel.mGroupProperties,
			jQuery.extend(oDefaultGroupProperties, oGroupProperties));

		// code under test
		assert.strictEqual(oModel.getGroupProperty("$auto", "submit"), SubmitMode.Auto);
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
				createModel("", {groupProperties : oFixture.groupProperties});
			}, new Error(oFixture.error));
		});
	});

	//*********************************************************************************************
	QUnit.test("isAutoGroup", function (assert) {
		var oModel = createModel("", {
				groupProperties : {
					"myAPIGroup" : {submit : SubmitMode.API},
					"myAutoGroup" : {submit : SubmitMode.Auto},
					"myDirectGroup" : {submit : SubmitMode.Direct}
				}
			});

		// code under test
		assert.ok(oModel.isAutoGroup("$auto"));
		assert.notOk(oModel.isAutoGroup("Unknown"));
		assert.ok(oModel.isAutoGroup("myAutoGroup"));
		assert.notOk(oModel.isAutoGroup("myAPIGroup"));
		assert.notOk(oModel.isAutoGroup("myDirectGroup"));
	});

	//*********************************************************************************************
	QUnit.test("isDirectGroup", function (assert) {
		var oModel = createModel("", {
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

		oModel = createModel();
		assert.strictEqual(oModel.bAutoExpandSelect, false);

		oModel = createModel("", {autoExpandSelect : true});
		assert.strictEqual(oModel.bAutoExpandSelect, true);

		oModel = createModel("", {autoExpandSelect : false});
		assert.strictEqual(oModel.bAutoExpandSelect, false);

		assert.throws(function () {
			createModel("", {autoExpandSelect : ""});
		}, new Error("Value for autoExpandSelect must be true or false"));

		assert.throws(function () {
			createModel("", {autoExpandSelect : "X"});
		}, new Error("Value for autoExpandSelect must be true or false"));
	});

	//*********************************************************************************************
	QUnit.test("Model creates _Requestor", function (assert) {
		var oExpectedBind0,
			oExpectedBind1,
			oExpectedBind2,
			oExpectedCreate = this.mock(_Requestor).expects("create"),
			fnFetchEntityContainer = function () {},
			fnFetchMetadata = function () {},
			oModel,
			oModelInterface,
			oRequestor = {},
			fnSubmitAuto = function () {};

		oExpectedCreate
			.withExactArgs(getServiceUrl(), sinon.match.object, {"Accept-Language" : "ab-CD"},
				{"sap-client" : "123"}, "4.0")
			.returns(oRequestor);
		oExpectedBind0 = this.mock(ODataMetaModel.prototype.fetchEntityContainer).expects("bind")
			.returns(fnFetchEntityContainer);
		oExpectedBind1 = this.mock(ODataMetaModel.prototype.fetchObject).expects("bind")
			.returns(fnFetchMetadata);
		oExpectedBind2 = this.mock(ODataModel.prototype.getGroupProperty).expects("bind")
			.returns(ODataModel.prototype.getGroupProperty);

		// code under test
		oModel = createModel("?sap-client=123");

		assert.ok(oModel instanceof Model);
		assert.strictEqual(oModel.oRequestor, oRequestor);
		assert.strictEqual(oExpectedBind0.firstCall.args[0], oModel.oMetaModel);
		assert.strictEqual(oExpectedBind1.firstCall.args[0], oModel.oMetaModel);
		assert.strictEqual(oExpectedBind2.firstCall.args[0], oModel);

		this.mock(oModel._submitBatch).expects("bind")
			.withExactArgs(sinon.match.same(oModel), "$auto")
			.returns(fnSubmitAuto);
		this.mock(sap.ui.getCore()).expects("addPrerenderingTask")
			.withExactArgs(fnSubmitAuto);

		// code under test - call fnOnCreateGroup
		oModelInterface = oExpectedCreate.firstCall.args[1];
		oModelInterface.fnOnCreateGroup("$auto");
		oModelInterface.fnOnCreateGroup("foo");
	});

	//*********************************************************************************************
	QUnit.test("Property access from ManagedObject w/o context binding", function (assert) {
		var oModel = createModel(),
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
		var oModel = createModel(),
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
		var oModel = createModel(),
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
			oModel = createModel(),
			oModelMock = this.mock(oModel),
			oBaseContext = oModel.createBindingContext("/TEAMS('42')"),
			oContext = Context.create(oModel, undefined, "/TEAMS('43')"),
			oListBinding = oModel.bindList("/TEAMS"),
			oListBinding2 = oModel.bindList("/TEAMS"),
			oListBinding3 = oModel.bindList("TEAM_2_EMPLOYEES"),
			oRelativeContextBinding = oModel.bindContext("TEAM_2_MANAGER", oContext, {}),
			oPropertyBinding = oModel.bindProperty("Name"),
			oPropertyBinding2 = oModel.bindProperty("Team_Id");

		oListBinding3.setContext(oBaseContext);
		this.mock(oPropertyBinding2).expects("fetchCache");
		this.mock(oPropertyBinding2).expects("checkUpdate");
		oPropertyBinding2.setContext(oBaseContext);

		oListBinding.attachChange(function () {});
		oListBinding3.attachChange(function () {});
		oPropertyBinding.attachChange(function () {});
		oPropertyBinding2.attachChange(function () {});
		oRelativeContextBinding.attachChange(function () {});
		this.mock(oListBinding).expects("refresh").withExactArgs("myGroup");
		this.mock(oListBinding3).expects("refresh").withExactArgs("myGroup");
		this.mock(oPropertyBinding2).expects("refresh").withExactArgs("myGroup");
		// check: only bindings with change event handler are refreshed
		this.mock(oListBinding2).expects("refresh").never();
		// check: no refresh on binding with relative path
		this.mock(oRelativeContextBinding).expects("refresh").never();
		this.mock(oPropertyBinding).expects("refresh").never();
		oModelMock.expects("checkGroupId").withExactArgs("myGroup");

		// code under test
		oModel.refresh("myGroup");

		oModelMock.expects("checkGroupId").withExactArgs("$Invalid").throws(oError);

		// code under test
		assert.throws(function () {
			oModel.refresh("$Invalid");
		}, oError);
	});

	//*********************************************************************************************
	QUnit.test("oModel.aBindings modified during refresh", function (assert) {
		var iCallCount = 0,
			oModel = createModel(),
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
			oModel = createModel();

		this.mock(oModel.oRequestor).expects("submitBatch").withExactArgs("groupId")
			.returns(Promise.resolve(oBatchResult));

		// code under test
		return oModel._submitBatch("groupId").then(function (oResult) {
			assert.strictEqual(oResult, oBatchResult);
		});
	});

	//*********************************************************************************************
	QUnit.test("_submitBatch, failure", function (assert) {
		var oExpectedError = new Error("deliberate failure"),
			oModel = createModel();

		this.mock(oModel.oRequestor).expects("submitBatch")
			.withExactArgs("groupId")
			.returns(Promise.reject(oExpectedError));
		this.mock(oModel).expects("reportError")
			.withExactArgs("$batch failed", sClassName, oExpectedError.message);

		// code under test
		return oModel._submitBatch("groupId").then(function () {
			assert.ok(false);
		}, function (oError) {
			assert.strictEqual(oError, oExpectedError);
		});
	});

	//*********************************************************************************************
	QUnit.test("submitBatch", function (assert) {
		var oModel = createModel(),
			oModelMock = this.mock(oModel),
			oSubmitPromise = {};

		oModelMock.expects("checkDeferredGroupId").withExactArgs("groupId");
		oModelMock.expects("_submitBatch").never(); // not yet
		this.mock(sap.ui.getCore()).expects("addPrerenderingTask").callsFake(function (fnCallback) {
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
			// of _submitBatch(), which in reality is of course a promise itself
			assert.strictEqual(oResult, oSubmitPromise);
		});
	});

	//*********************************************************************************************
	QUnit.test("submitBatch, invalid group ID", function (assert) {
		var oError = new Error(),
			oModel = createModel(),
			oModelMock = this.mock(oModel);

		oModelMock.expects("_submitBatch").never();
		oModelMock.expects("checkDeferredGroupId").withExactArgs("$auto").throws(oError);

		assert.throws(function () {
			//code under test
			oModel.submitBatch("$auto");
		}, oError);
	});

	//*********************************************************************************************
	QUnit.test("resetChanges with group ID", function (assert) {
		var oModel = createModel();

		this.mock(oModel).expects("checkDeferredGroupId").withExactArgs("groupId");
		this.mock(oModel.oRequestor).expects("cancelChanges").withExactArgs("groupId");

		// code under test
		oModel.resetChanges("groupId");
	});
	// TODO reset the POST requests in this group

	//*********************************************************************************************
	QUnit.test("resetChanges w/o group ID", function (assert) {
		var oModel = createModel("", {updateGroupId : "updateGroupId"}),
			oBinding1 = oModel.bindList("/EMPLOYEES"),
			oBinding2 = oModel.bindProperty("/EMPLOYEES('1')/AGE"),
			oBinding3 = oModel.bindContext("/EMPLOYEES('1')", undefined, {
				$$updateGroupId : "anotherGroup"
			});

		this.mock(oModel).expects("checkDeferredGroupId").withExactArgs("updateGroupId");
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
			oModel = createModel();

		this.mock(oModel).expects("checkDeferredGroupId").withExactArgs("$auto").throws(oError);
		this.mock(oModel.oRequestor).expects("cancelChanges").never();

		assert.throws(function () {
			oModel.resetChanges();
		}, oError);
	});

	//*********************************************************************************************
	QUnit.test("forbidden", function (assert) {
		var oModel = createModel();

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
		var oModel = createModel();

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
	[{
		stack : "Failure\n    at _Helper.createError", // like Chrome
		message : "Failure\n    at _Helper.createError"
	}, {
		stack : undefined, // like IE
		message : "Failure"
	}, {
		stack : "_Helper.createError@_Helper.js", // like FF
		message : "Failure\n_Helper.createError@_Helper.js"
	}].forEach(function (oFixture) {
		QUnit.test("reportError", function (assert) {
			var sClassName = "sap.ui.model.odata.v4.ODataPropertyBinding",
				oError = {
					message : "Failure",
					stack : oFixture.stack
				},
				sLogMessage = "Failed to read path /Product('1')/Unknown",
				oMessageManager = sap.ui.getCore().getMessageManager(),
				oModel = createModel();

			this.oLogMock.expects("error").withExactArgs(sLogMessage, oFixture.message, sClassName)
				.twice();
			this.mock(oMessageManager).expects("addMessages")
				.once()// add each error only once to the MessageManager
				.withExactArgs(sinon.match(function (oMessage) {
					return oMessage instanceof Message
						&& oMessage.message === oError.message
						&& oMessage.processor === oModel
						&& oMessage.technical === true
						&& oMessage.type === "Error";
				}));

			// code under test
			oModel.reportError(sLogMessage, sClassName, oError);
			oModel.reportError(sLogMessage, sClassName, oError);
		});
	});

	//*********************************************************************************************
	QUnit.test("reportError on canceled error", function (assert) {
		var oError = {canceled : true, message : "Canceled", stack: "Canceled\n    at foo.bar"};

		this.oLogMock.expects("debug")
			.withExactArgs("Failure", "Canceled\n    at foo.bar", "class");
		this.mock(sap.ui.getCore().getMessageManager()).expects("addMessages").never();

		// code under test
		createModel().reportError("Failure", "class", oError);
	});

	//*********************************************************************************************
	QUnit.test("reportError on canceled error, no debug log", function (assert) {
		var oError = {canceled : "noDebugLog"};

		this.oLogMock.expects("debug").never();
		this.mock(sap.ui.getCore().getMessageManager()).expects("addMessages").never();

		// code under test
		createModel().reportError("Failure", "class", oError);
	});

	//*********************************************************************************************
	QUnit.test("destroy", function (assert) {
		var oModel = createModel(),
			oModelPrototypeMock = this.mock(Model.prototype);

		oModelPrototypeMock.expects("destroy").on(oModel).withExactArgs(1, 2, 3).returns("foo");
		oModelPrototypeMock.expects("destroy").on(oModel.getMetaModel()).withExactArgs();

		// code under test
		assert.strictEqual(oModel.destroy(1, 2, 3), "foo");
	});

	//*********************************************************************************************
	QUnit.test("hasPendingChanges", function (assert) {
		var oModel = createModel(),
			oResult = {};

		this.mock(oModel.oRequestor).expects("hasPendingChanges").withExactArgs().returns(oResult);

		// code under test
		assert.strictEqual(oModel.hasPendingChanges(), oResult);
	});

	//*********************************************************************************************
	QUnit.test("getDependentBindings: binding", function (assert) {
		var oModel = createModel(),
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
		var oModel = createModel(),
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
		var oModel = createModel(),
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
	].forEach(function(sPath) {
		QUnit.test("createBindingContext - absolute path, no context " + sPath, function (assert) {
			var oBindingContext,
				oModel = createModel();

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
	}].forEach(function(oFixture) {
		var sResolvedPath = oFixture.entityPath + "/" + oFixture.propertyPath,
			sTitle = "createBindingContext - relative path and context " + sResolvedPath;

		QUnit.test(sTitle, function (assert) {
			var oBindingContext,
				oModel = createModel(),
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
					oModel = createModel(),
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
		var oModel = createModel(),
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
		var oModel = createModel();

		// valid group IDs
		oModel.checkGroupId("myGroup");
		oModel.checkGroupId("$auto");
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
	QUnit.test("checkDeferredGroupId", function (assert) {
		var oModel = createModel("", {
				groupProperties : {
					"myAPIGroup" : {submit : SubmitMode.API},
					"myAutoGroup" : {submit : SubmitMode.Auto},
					"myDirectGroup" : {submit : SubmitMode.Direct}
				}
			});

		// valid group IDs
		// code under test
		assert.strictEqual(oModel.checkDeferredGroupId("myAPIGroup"), undefined);

		// invalid group IDs, others already tested by checkGroupId
		["myAutoGroup", "myDirectGroup"].forEach(function (sGroupId) {
			assert.throws(function () {
				// code under test
				oModel.checkDeferredGroupId(sGroupId);
			}, new Error("Group ID is not deferred: " + sGroupId));
		});
	});

	//*********************************************************************************************
	QUnit.test("buildBindingParameters, $$aggregation", function (assert) {
		var aAggregation = [],
			aAllowed = ["$$aggregation"],
			oModel = createModel(),
			mParameters = {$$aggregation : aAggregation},
			mResult;

		// code under test
		mResult = oModel.buildBindingParameters(mParameters, aAllowed);

		assert.deepEqual(mResult, mParameters);
		assert.strictEqual(mResult.$$aggregation, aAggregation);
	});

	//*********************************************************************************************
	QUnit.test("buildBindingParameters, $$groupId", function (assert) {
		var aAllowedParams = ["$$groupId"],
			oModel = createModel();

		assert.deepEqual(oModel.buildBindingParameters(undefined), {});
		assert.deepEqual(oModel.buildBindingParameters({}), {});
		assert.deepEqual(oModel.buildBindingParameters({$$groupId : "$auto"}, aAllowedParams),
			{$$groupId : "$auto"});
		assert.deepEqual(oModel.buildBindingParameters(
			{$$groupId : "$direct", custom : "foo"}, aAllowedParams), {$$groupId : "$direct"});

		assert.throws(function () {
			oModel.buildBindingParameters({$$unsupported : "foo"});
		}, new Error("Unsupported binding parameter: $$unsupported"));

		assert.throws(function () {
			oModel.buildBindingParameters({$$groupId : ""}, aAllowedParams);
		}, new Error("Unsupported value for binding parameter '$$groupId': "));
		assert.throws(function () {
			oModel.buildBindingParameters({$$groupId : "~invalid"}, aAllowedParams);
		}, new Error("Unsupported value for binding parameter '$$groupId': ~invalid"));
		assert.throws(function () {
			oModel.buildBindingParameters({$$groupId : "$auto"});
		}, new Error("Unsupported binding parameter: $$groupId"));
	});

	//*********************************************************************************************
	QUnit.test("buildBindingParameters, $$operationMode", function (assert) {
		var aAllowedParams = ["$$operationMode"],
			oModel = createModel();

		assert.throws(function () {
			oModel.buildBindingParameters({$$operationMode : "Client"}, aAllowedParams);
		}, new Error("Unsupported operation mode: Client"));
		assert.throws(function () {
			oModel.buildBindingParameters({$$operationMode : SubmitMode.Auto}, aAllowedParams);
		}, new Error("Unsupported operation mode: Auto"));
		assert.throws(function () {
			oModel.buildBindingParameters({$$operationMode : "any"}, aAllowedParams);
		}, new Error("Unsupported operation mode: any"));

		assert.deepEqual(oModel.buildBindingParameters({$$operationMode : "Server"},
				aAllowedParams),
			{$$operationMode : "Server"});
	});

	//*********************************************************************************************
	QUnit.test("buildBindingParameters, $$ownRequest", function (assert) {
		var aAllowedParams = ["$$ownRequest"],
			oModel = createModel();

		assert.throws(function () {
			oModel.buildBindingParameters({$$ownRequest : "foo"}, aAllowedParams);
		}, new Error("Unsupported value for binding parameter '$$ownRequest': foo"));
		assert.throws(function () {
			oModel.buildBindingParameters({$$ownRequest : false}, aAllowedParams);
		}, new Error("Unsupported value for binding parameter '$$ownRequest': false"));
		assert.throws(function () {
			oModel.buildBindingParameters({$$ownRequest : undefined}, aAllowedParams);
		}, new Error("Unsupported value for binding parameter '$$ownRequest': undefined"));

		assert.deepEqual(oModel.buildBindingParameters({$$ownRequest : true},
				aAllowedParams),
			{$$ownRequest : true});
	});

	//*********************************************************************************************
	QUnit.test("buildBindingParameters, $$updateGroupId", function (assert) {
		var aAllowedParams = ["$$updateGroupId"],
			oModel = createModel();

		assert.deepEqual(oModel.buildBindingParameters({$$updateGroupId : "myGroup"},
				aAllowedParams),
			{$$updateGroupId : "myGroup"});
		assert.deepEqual(oModel.buildBindingParameters(
			{$$updateGroupId : "$direct", custom : "foo"}, aAllowedParams),
			{$$updateGroupId : "$direct"});

		assert.throws(function () {
			oModel.buildBindingParameters({$$unsupported : "foo"}, aAllowedParams);
		}, new Error("Unsupported binding parameter: $$unsupported"));

		assert.throws(function () {
			oModel.buildBindingParameters({$$updateGroupId : "~invalid"}, aAllowedParams);
		}, new Error("Unsupported value for binding parameter '$$updateGroupId': ~invalid"));
	});

	//*********************************************************************************************
	QUnit.test("buildBindingParameters, unknown $$-parameter", function (assert) {
		var oModel = createModel();

		assert.throws(function () {
			oModel.buildBindingParameters({$$someName : "~"}, ["$$someName"]);
		}, new Error("Unknown binding-specific parameter: $$someName"));
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
//TODO undefined values are removed by jQuery.extend, but should also be normalized to {}
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
				mOriginalParameters = clone(oFixture.mParameters);

			mOptions = ODataModel.prototype.buildQueryOptions(oFixture.mParameters,
				oFixture.bSystemQueryOptionsAllowed, oFixture.bSapAllowed);

			assert.deepEqual(mOptions, oFixture.expected || oFixture.mParameters || {});
			assert.deepEqual(oFixture.mParameters, mOriginalParameters, "unchanged");
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
		var oModel = createModel();

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
	QUnit.test("initializeSecurityToken", function (assert) {
		var oModel = createModel("");

		this.mock(oModel.oRequestor).expects("refreshSecurityToken").withExactArgs();

		// code under test
		oModel.initializeSecurityToken();
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
//TODO use 'sap/ui/thirdparty/URI' for URL handling?

//TODO support "/#" syntax, e.g. "/EMPLOYEES(ID='1')/ENTRYDATE/#Type/QualifiedName"
//     do it for bindings, not as a JS API (getMetaModel().getMetaContext() etc. is already there)
