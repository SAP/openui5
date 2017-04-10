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
	"sap/ui/model/odata/v4/lib/_SyncPromise",
	"sap/ui/model/odata/v4/ODataContextBinding",
	"sap/ui/model/odata/v4/ODataListBinding",
	"sap/ui/model/odata/v4/ODataMetaModel",
	"sap/ui/model/odata/v4/ODataModel",
	"sap/ui/model/odata/v4/ODataPropertyBinding",
	"sap/ui/test/TestUtils"
], function (jQuery, Message, Binding, BindingMode, BaseContext, Model, TypeString, ODataUtils,
		OperationMode, Context, _MetadataRequestor, _Parser, _Requestor, _SyncPromise,
		ODataContextBinding, ODataListBinding, ODataMetaModel, ODataModel, ODataPropertyBinding,
		TestUtils) {
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
			this.oSandbox = sinon.sandbox.create();
			TestUtils.setupODataV4Server(this.oSandbox, mFixture, undefined, sServiceUrl);
			this.oLogMock = this.oSandbox.mock(jQuery.sap.log);
			this.oLogMock.expects("warning").never();
			this.oLogMock.expects("error").never();
			this.oSandbox.mock(sap.ui.getCore().getConfiguration()).expects("getLanguageTag")
				.atLeast(0).returns("ab-CD");
		},

		afterEach : function () {
			// I would consider this an API, see https://github.com/cjohansen/Sinon.JS/issues/614
			this.oSandbox.verifyAndRestore();
		}
	});

	//*********************************************************************************************
	QUnit.test("basics", function (assert) {
		var oMetadataRequestor = {},
			oMetaModel,
			oModel,
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

		// code under test: operation mode Server must not throw an error
		oModel = createModel("", {operationMode : OperationMode.Server, serviceUrl : "/foo/",
			synchronizationMode : "None"});

		assert.strictEqual(oModel.sOperationMode, OperationMode.Server);
		oMetaModel = oModel.getMetaModel();

		this.mock(ODataModel.prototype).expects("buildQueryOptions")
			.withExactArgs({}, false, true).returns(mModelOptions);
		this.mock(_MetadataRequestor).expects("create")
			.withExactArgs({"Accept-Language" : "ab-CD"}, sinon.match.same(mModelOptions))
			.returns(oMetadataRequestor);

		// code under test
		oModel = createModel("", {annotationURI : ["my/annotations.xml"]});

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
	QUnit.test("supportReferences", function (assert) {
		createModel("", {supportReferences : false});
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
		var oExpectedCreate = this.mock(_Requestor).expects("create"),
			oModel,
			oRequestor = {},
			fnSubmitAuto = function () {};

		oExpectedCreate
			.withExactArgs(getServiceUrl(), {"Accept-Language" : "ab-CD"}, {"sap-client" : "123"},
					sinon.match.func)
			.returns(oRequestor);

		// code under test
		oModel = createModel("?sap-client=123");

		assert.ok(oModel instanceof Model);
		assert.strictEqual(oModel.oRequestor, oRequestor);

		this.mock(oModel._submitBatch).expects("bind")
			.withExactArgs(sinon.match.same(oModel), "$auto")
			.returns(fnSubmitAuto);
		this.mock(sap.ui.getCore()).expects("addPrerenderingTask")
			.withExactArgs(fnSubmitAuto);

		// code under test - call fnOnCreateGroup
		oExpectedCreate.args[0][3]("$auto");
		oExpectedCreate.args[0][3]("foo");
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
		this.oLogMock.expects("error")
			.withExactArgs("$batch failed", oExpectedError.message, sClassName);

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
			oReturn,
			oSubmitPromise = {};

		oModelMock.expects("checkGroupId").withExactArgs("groupId", true);
		oModelMock.expects("_submitBatch").withExactArgs("groupId")
			.returns(oSubmitPromise);

		// code under test
		oReturn = oModel.submitBatch("groupId");

		assert.strictEqual(oReturn, oSubmitPromise);
	});

	//*********************************************************************************************
	QUnit.test("submitBatch, invalid group ID", function (assert) {
		var oError = new Error(),
			oModel = createModel(),
			oModelMock = this.mock(oModel);

		oModelMock.expects("_submitBatch").never();
		oModelMock.expects("checkGroupId").withExactArgs("$auto", true).throws(oError);

		assert.throws(function () {
			oModel.submitBatch("$auto");
		}, oError);
	});

	//*********************************************************************************************
	QUnit.test("resetChanges with group ID", function (assert) {
		var oModel = createModel();

		this.mock(oModel).expects("checkGroupId").withExactArgs("groupId", true);
		this.mock(oModel.oRequestor).expects("cancelChanges").withExactArgs("groupId");

		// code under test
		oModel.resetChanges("groupId");
	});
	// TODO reset the POST requests in this group

	//*********************************************************************************************
	QUnit.test("resetChanges w/o group ID", function (assert) {
		var oModel = createModel("", {updateGroupId : "updateGroupId"}),
			oAgeBinding = oModel.bindProperty("/EMPLOYEES('1')/AGE"),
			oNameBinding = oModel.bindProperty("/EMPLOYEES('1')/Name"),
			oEntryDateBinding = oModel.bindProperty("/EMPLOYEES('1')/ENTRYDATE", undefined, {
				$$updateGroupId : "anotherGroup"
			});

		this.mock(oModel).expects("checkGroupId").withExactArgs("updateGroupId", true);
		this.mock(oModel.oRequestor).expects("cancelChanges").withExactArgs("updateGroupId");
		this.mock(oAgeBinding).expects("resetInvalidDataState").withExactArgs();
		this.mock(oNameBinding).expects("resetInvalidDataState").withExactArgs();
		this.mock(oEntryDateBinding).expects("resetInvalidDataState").never();

		// code under test
		oModel.resetChanges();
	});

	//*********************************************************************************************
	QUnit.test("resetChanges, invalid group ID", function (assert) {
		var oError = new Error(),
			oModel = createModel();

		this.mock(oModel).expects("checkGroupId").withExactArgs("$auto", true).throws(oError);
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
	QUnit.test("getDependentBindings: skip created entities", function (assert) {
		var oModel = createModel(),
			oParentBinding = {},
			oContextCreated = Context.create(oModel, oParentBinding, "/Foo/-1"),
			oBindingCreated = new Binding(oModel, "bar", oContextCreated),
			oContext0 = Context.create(oModel, oParentBinding, "/Foo/0"),
			oBinding0 = new Binding(oModel, "bar", oContext0),
			oBindingUnresolved = new Binding(oModel, "baz");

		this.mock(oContextCreated).expects("created").withExactArgs()
			.returns(_SyncPromise.resolve());

		// to be called by V4 binding's c'tors
		oModel.bindingCreated(oBindingCreated);
		oModel.bindingCreated(oBinding0);
		oModel.bindingCreated(oBindingUnresolved);

		// code under test
		assert.deepEqual(oModel.getDependentBindings(oParentBinding), [oBindingCreated, oBinding0]);
		assert.deepEqual(oModel.getDependentBindings(oParentBinding, true), [oBinding0]);
	});

	//*********************************************************************************************
	QUnit.test("createBindingContext - absolute path, no context", function (assert) {
		var oBindingContext,
			oModel = createModel();

		// code under test
		oBindingContext = oModel.createBindingContext("/foo");

		assert.deepEqual(oBindingContext, new BaseContext(oModel, "/foo"));
		assert.ok(oBindingContext instanceof BaseContext);
	});

	//*********************************************************************************************
	QUnit.test("createBindingContext - relative path and context", function (assert) {
		var oBindingContext,
		oModel = createModel(),
		oModelMock = this.mock(oModel),
		oContext = new BaseContext(oModel, "/foo");

		oModelMock.expects("resolve").withExactArgs("bar", oContext).returns("/foo/bar");

		// code under test
		oBindingContext = oModel.createBindingContext("bar", oContext);

		assert.deepEqual(oBindingContext, new BaseContext(oModel, "/foo/bar"));
		assert.ok(oBindingContext instanceof BaseContext);
	});

	//*********************************************************************************************
	[{
		dataPath : "/BusinessPartnerList('42')",
		metaPath : ""
	}, {
		dataPath : "/BusinessPartnerList('42')",
		metaPath : "@com.sap.vocabularies.UI.v1.LineItem"
	}, {
		dataPath : "/",
		metaPath : "BusinessPartnerList/@com.sap.vocabularies.UI.v1.LineItem"
	}, {
		dataPath : "/BusinessPartnerList",
		metaPath : "/",
		relativeMetaPath : "./" // meta path is always treated as a relative path
	}, {
		dataPath : "/BusinessPartnerList",
		metaPath : "/Name",
		relativeMetaPath : "./Name" // meta path is always treated as a relative path
	}].forEach(function (oFixture){
		var sPath = (oFixture.dataPath + "#" + oFixture.metaPath);

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
			oModel.buildBindingParameters({$$operationMode : "Auto"}, aAllowedParams);
		}, new Error("Unsupported operation mode: Auto"));
		assert.throws(function () {
			oModel.buildBindingParameters({$$operationMode : "any"}, aAllowedParams);
		}, new Error("Unsupported operation mode: any"));

		assert.deepEqual(oModel.buildBindingParameters({$$operationMode : "Server"},
				aAllowedParams),
			{$$operationMode : "Server"});
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

	[{
		mParameters : {"$expand" : {"foo" : {}}, "$select" : ["bar"], "custom" : "baz"},
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
				"FOO2" : false
//TODO undefined values are removed by jQuery.extend, but should also be normalized to {}
				//"FOO3" : undefined
			}
		},
		bSystemQueryOptionsAllowed : true,
		expected : {
			$expand : {
				"TEAM_2_MANAGER" : {},
				"TEAM_2_EMPLOYEES" : {},
				"FOO1" : {},
				"FOO2" : {}
//				"FOO3" : {}
			}
		}
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
		mOptions : {"sap-foo" : "300"},
		error : "Custom query option sap-foo is not supported"
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
