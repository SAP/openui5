/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/base/i18n/Localization",
	"sap/ui/base/SyncPromise",
	"sap/ui/core/Rendering",
	"sap/ui/core/Supportability",
	"sap/ui/core/cache/CacheManager",
	"sap/ui/core/message/Message",
	"sap/ui/core/Messaging",
	"sap/ui/model/Binding",
	"sap/ui/model/BindingMode",
	"sap/ui/model/Context",
	"sap/ui/model/Model",
	"sap/ui/model/odata/OperationMode",
	"sap/ui/model/odata/v4/Context",
	"sap/ui/model/odata/v4/ODataMetaModel",
	"sap/ui/model/odata/v4/ODataModel",
	"sap/ui/model/odata/v4/SubmitMode",
	"sap/ui/model/odata/v4/lib/_Helper",
	"sap/ui/model/odata/v4/lib/_MetadataRequestor",
	"sap/ui/model/odata/v4/lib/_Parser",
	"sap/ui/model/odata/v4/lib/_Requestor",
	"sap/ui/core/message/MessageType",
	"sap/ui/test/TestUtils"
], function (Log, Localization, SyncPromise, Rendering, Supportability, CacheManager, Message,
		Messaging, Binding, BindingMode, BaseContext, Model, OperationMode, Context,
		ODataMetaModel, ODataModel, SubmitMode, _Helper, _MetadataRequestor, _Parser, _Requestor,
		MessageType, TestUtils) {
	"use strict";

	var sClassName = "sap.ui.model.odata.v4.ODataModel",
		sServiceUrl = "/sap/opu/odata4/IWBEP/TEA/default/IWBEP/TEA_BUSI/0001/";

	function mustBeMocked() { throw new Error("Must be mocked"); }

	//*********************************************************************************************
	QUnit.module("sap.ui.model.odata.v4.ODataModel", {
		beforeEach : function () {
			this.oLogMock = this.mock(Log);
			this.oLogMock.expects("warning").never();
			this.oLogMock.expects("error").never();
			this.mock(Localization).expects("getLanguageTag").atLeast(0).returns("ab-CD");
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
					serviceUrl : sServiceUrl + (sQuery || "")
				}));

			if (!bAllowPrerenderingTasks) {
				this.stub(oModel, "addPrerenderingTask");
			}
			return oModel;
		}
	});

	//*********************************************************************************************
	QUnit.test("basics", function (assert) {
		var oModel;

		// @deprecated As of Version 1.110.0
		assert.throws(function () {
			return new ODataModel({synchronizationMode : undefined});
		}, new Error("Synchronization mode must be 'None'"));
		// @deprecated As of Version 1.110.0
		assert.throws(function () {
			return new ODataModel({synchronizationMode : "Nope"});
		}, new Error("Synchronization mode must be 'None'"));
		assert.throws(function () {
			return new ODataModel();
		}, new Error("Missing service root URL"));
		assert.throws(function () {
			return new ODataModel({serviceUrl : "/foo"});
		}, new Error("Service root URL must end with '/'"));
		assert.throws(function () {
			return new ODataModel({useBatch : true});
		}, new Error("Unsupported parameter: useBatch"));
		assert.throws(function () {
			return new ODataModel({operationMode : OperationMode.Client, serviceUrl : "/foo/"});
		}, new Error("Unsupported operation mode: Client"), "Unsupported OperationMode");

		this.mock(ODataModel.prototype).expects("initializeSecurityToken").never();
		this.mock(_Requestor.prototype).expects("sendOptimisticBatch").never();

		// code under test: operation mode Server must not throw an error
		oModel = this.createModel("", {
			operationMode : OperationMode.Server,
			// @deprecated As of Version 1.110.0
			synchronizationMode : "None" // deprecated and optional, but still allowed
		});

		assert.strictEqual(oModel.sOperationMode, OperationMode.Server);
		assert.strictEqual(oModel.getServiceUrl(), sServiceUrl);
		assert.strictEqual(oModel.getMetaModel().sLanguage, undefined);
	});

	//*********************************************************************************************
[false, true].forEach(function (bStatistics) {
	QUnit.test("c'tor, sap-statistics=" + bStatistics, function (assert) {
		var oMetadataRequestor = {},
			oMetaModel,
			oModel;

		this.mock(ODataModel.prototype).expects("buildQueryOptions")
			.withExactArgs({}, false, true).returns({"sap-client" : "279"});
		this.mock(Supportability).expects("isStatisticsEnabled")
			.withExactArgs().returns(bStatistics);
		this.mock(_MetadataRequestor).expects("create")
			.withExactArgs({"Accept-Language" : "ab-CD"}, "4.0", undefined, bStatistics
				? {"sap-client" : "279", "sap-statistics" : true}
				: {"sap-client" : "279"}, undefined)
			.returns(oMetadataRequestor);
		this.mock(ODataMetaModel.prototype).expects("fetchEntityContainer").withExactArgs(true);
		this.mock(ODataModel.prototype).expects("initializeSecurityToken").withExactArgs();
		this.mock(_Requestor.prototype).expects("sendOptimisticBatch").withExactArgs();

		// code under test
		oModel = this.createModel("",
			{earlyRequests : true, annotationURI : ["my/annotations.xml"]});

		assert.strictEqual(oModel.sServiceUrl, sServiceUrl);
		assert.strictEqual(oModel.toString(), sClassName + ": " + sServiceUrl);
		assert.deepEqual(oModel.mUriParameters, {"sap-client" : "279"});
		assert.strictEqual(oModel.getDefaultBindingMode(), BindingMode.TwoWay);
		assert.strictEqual(oModel.isBindingModeSupported(BindingMode.OneTime), true);
		assert.strictEqual(oModel.isBindingModeSupported(BindingMode.OneWay), true);
		assert.strictEqual(oModel.isBindingModeSupported(BindingMode.TwoWay), true);
		assert.strictEqual(oModel.bSharedRequests, false);
		assert.strictEqual(oModel.bEarlyRequests, true);
		assert.deepEqual(oModel.aAllBindings, []);
		assert.strictEqual(oModel.aPrerenderingTasks, null);
		assert.strictEqual(oModel.getOptimisticBatchEnabler(), null);
		oMetaModel = oModel.getMetaModel();
		assert.ok(oMetaModel instanceof ODataMetaModel);
		assert.strictEqual(oMetaModel.oRequestor, oMetadataRequestor);
		assert.strictEqual(oMetaModel.sUrl, sServiceUrl + "$metadata");
		assert.deepEqual(oMetaModel.aAnnotationUris, ["my/annotations.xml"]);
		assert.deepEqual(oModel.mPath2DataRequestedCount, {});
		assert.deepEqual(oModel.mPath2DataReceivedError, {});
	});
});

	//*********************************************************************************************
	QUnit.test("ignoreAnnotationsFromMetadata, metadataUrlParams", function (assert) {
		var oModel,
			mUriParameters = {
				"sap-client" : "279",
				"sap-context-token" : "n/a"
			};

		this.mock(ODataModel.prototype).expects("buildQueryOptions")
			.withExactArgs({}, false, true).returns(mUriParameters);
		this.mock(_MetadataRequestor).expects("create")
			.withExactArgs({"Accept-Language" : "ab-CD"}, "4.0", true, {
				"sap-client" : "279",
				"sap-context-token" : "20200716120000",
				"sap-language" : "EN"
			}, undefined);
		this.mock(_Requestor).expects("create")
			.withExactArgs(sServiceUrl, sinon.match.object, {"Accept-Language" : "ab-CD"},
				{"sap-client" : "279", "sap-context-token" : "n/a"}, "4.0", undefined)
			.callThrough();

		// code under test
		oModel = this.createModel("", {
			ignoreAnnotationsFromMetadata : true,
			metadataUrlParams : {
				"sap-context-token" : "20200716120000",
				"sap-language" : "EN"
			}
		});

		assert.strictEqual(oModel.getMetaModel().sLanguage, "EN");
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
		assert.strictEqual(oModel.bEarlyRequests, undefined);

		[false, 0, "", undefined, 1, "X"].forEach(function (vSharedRequests) {
			assert.throws(function () {
				this.createModel("", {sharedRequests : vSharedRequests});
			}, new Error("Value for sharedRequests must be true"));
		});
	});

	//*********************************************************************************************
	QUnit.test("ignoreAnnotationsFromMetadata", function (assert) {
		[false, 0, "", undefined, 1, "X"].forEach(function (vValue) {
			assert.throws(function () {
				this.createModel("", {ignoreAnnotationsFromMetadata : vValue});
			}, new Error("Value for ignoreAnnotationsFromMetadata must be true"));
		});
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
			var oMetadataRequestorCreateExpectation, oModel, oRequestorCreateExpectation;

			oRequestorCreateExpectation = this.mock(_Requestor).expects("create")
				.withExactArgs(sServiceUrl, sinon.match.object, {"Accept-Language" : "ab-CD"},
					sinon.match.object, sODataVersion, undefined)
				.returns({
					checkForOpenRequests : function () {},
					checkHeaderNames : function () {}
				});
			oMetadataRequestorCreateExpectation = this.mock(_MetadataRequestor).expects("create")
				.withExactArgs({"Accept-Language" : "ab-CD"}, sODataVersion, undefined,
					sinon.match.object, undefined)
				.returns({});

			// code under test
			oModel = this.createModel("", {odataVersion : sODataVersion});

			assert.strictEqual(oModel.getODataVersion(), sODataVersion);
			assert.notStrictEqual(oRequestorCreateExpectation.args[0][2],
				oMetadataRequestorCreateExpectation.args[0][0]);
			assert.strictEqual(oRequestorCreateExpectation.args[0][2], oModel.mHeaders);
			assert.strictEqual(oMetadataRequestorCreateExpectation.args[0][0],
				oModel.mMetadataHeaders);
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

		assert.strictEqual(oModel.sServiceUrl, sServiceUrl);
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

		assert.throws(function () {
			oModel = this.createModel("", {updateGroupId : "$single"});
		}, new Error("Invalid update group ID: $single"));
	});

	//*********************************************************************************************
	QUnit.test("Model construction with groupProperties, getGroupProperty", function (assert) {
		var oDefaultGroupProperties = {
				$auto : {submit : SubmitMode.Auto},
				$direct : {submit : SubmitMode.Direct}
			},
			oGroupProperties = {
				myAPIGroup : {submit : SubmitMode.API},
				myAutoGroup : {submit : SubmitMode.Auto},
				myDirectGroup : {submit : SubmitMode.Direct}
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
		assert.strictEqual(oModel.getGroupProperty("$single", "submit"), "Single");
		assert.strictEqual(oModel.getGroupProperty("myAPIGroup", "submit"), SubmitMode.API);
		assert.strictEqual(oModel.getGroupProperty("myAutoGroup", "submit"), SubmitMode.Auto);
		assert.strictEqual(oModel.getGroupProperty("myDirectGroup", "submit"), SubmitMode.Direct);
		assert.strictEqual(oModel.getGroupProperty("unknown", "submit"), SubmitMode.API);

		assert.throws(function () {
			// code under test
			oModel.getGroupProperty("myAPIGroup", "unknown");
		}, new Error("Unsupported group property: 'unknown'"));
	});

	//*********************************************************************************************
	[{
		groupProperties : {$foo : null},
		// only one example for an invalid application group ID
		error : "Invalid group ID: $foo"
	}, {
		groupProperties : {myGroup : "Foo"},
		error : "Group 'myGroup' has invalid properties: 'Foo'"
	}, {
		groupProperties : {myGroup : undefined},
		error : "Group 'myGroup' has invalid properties: 'undefined'"
	}, {
		groupProperties : {myGroup : {submit : SubmitMode.Auto, foo : "bar"}},
		error : "Group 'myGroup' has invalid properties: '[object Object]'"
	}, {
		groupProperties : {myGroup : {submit : "foo"}},
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
[SubmitMode.API, SubmitMode.Auto, SubmitMode.Direct].forEach(function (sSubmitMode) {
	var sTitle = "isApiGroup, isAutoGroup, isDirectGroup: getGroupProperty returns " + sSubmitMode;

	QUnit.test(sTitle, function (assert) {
		var oModel = this.createModel("");

		this.mock(oModel).expects("getGroupProperty").thrice().withExactArgs("myGroup", "submit")
			.returns(sSubmitMode);

		// code under test
		assert.strictEqual(oModel.isApiGroup("myGroup"), sSubmitMode === SubmitMode.API);
		assert.strictEqual(oModel.isAutoGroup("myGroup"), sSubmitMode === SubmitMode.Auto);
		assert.strictEqual(oModel.isDirectGroup("myGroup"), sSubmitMode === SubmitMode.Direct);
	});
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
		var mHeaders = {abc : "123", "accept-language" : "wx-YZ"},
			oModel;

		this.mock(ODataModel.prototype).expects("changeHttpHeaders")
			.withExactArgs(mHeaders).callThrough();

		// code under test
		oModel = this.createModel("", {httpHeaders : mHeaders});

		assert.deepEqual(oModel.mHeaders, mHeaders);
		assert.deepEqual(oModel.mMetadataHeaders, mHeaders);
	});

	//*********************************************************************************************
[false, true].forEach(function (bWithCredentials) {
	QUnit.test("Model creates _Requestor, withCredentials=" + bWithCredentials, function () {
		this.mock(_MetadataRequestor).expects("create")
			.withExactArgs({"Accept-Language" : "ab-CD"}, "4.0",
				/*bIngnoreAnnotationsFromMetadata*/undefined, /*mQueryParams*/{},
				/*bWithCredentials*/bWithCredentials);
		this.mock(_Requestor).expects("create")
			.withExactArgs(sServiceUrl, {
					fetchEntityContainer : sinon.match.func,
					fetchMetadata : sinon.match.func,
					fireDataReceived : sinon.match.func,
					fireDataRequested : sinon.match.func,
					fireSessionTimeout : sinon.match.func,
					getGroupProperty : sinon.match.func,
					getMessagesByPath : sinon.match.func,
					getOptimisticBatchEnabler : sinon.match.func,
					getReporter : sinon.match.func,
					isIgnoreETag : sinon.match.func,
					onCreateGroup : sinon.match.func,
					reportStateMessages : sinon.match.func,
					reportTransitionMessages : sinon.match.func,
					updateMessages : sinon.match.func
				},
				{"Accept-Language" : "ab-CD"},
				{},
				"4.0",
				bWithCredentials)
			.returns({
				checkForOpenRequests : function () {},
				checkHeaderNames : function () {}
			});

		this.createModel(undefined, {withCredentials : bWithCredentials});
	});
});

	//*********************************************************************************************
[false, true].forEach(function (bStatistics) {
	QUnit.test("Model creates _Requestor, sap-statistics=" + bStatistics, function (assert) {
		var oExpectedBind0,
			oExpectedBind1,
			oExpectedBind2,
			oExpectedBind3,
			oExpectedBind4,
			oExpectedBind5,
			oExpectedBind6,
			oExpectedBind7,
			oExpectedBind8,
			oExpectedBind9,
			oExpectedCreate = this.mock(_Requestor).expects("create"),
			oModel,
			oModelInterface,
			oRequestor = {
				checkForOpenRequests : function () {},
				checkHeaderNames : function () {}
			},
			fnSubmitAuto = function () {};

		this.mock(Supportability).expects("isStatisticsEnabled")
			.withExactArgs().returns(bStatistics);
		oExpectedCreate
			.withExactArgs(sServiceUrl, {
					fetchEntityContainer : "~fnFetchEntityContainer~",
					fetchMetadata : "~fnFetchMetadata~",
					fireDataReceived : "~fnFireDataReceived~",
					fireDataRequested : "~fnFireDataRequested~",
					fireSessionTimeout : sinon.match.func,
					getGroupProperty : "~fnGetGroupProperty~",
					getMessagesByPath : "~fnGetMessagesByPath~",
					getOptimisticBatchEnabler : "~fnGetOptimisticBatchEnabler~",
					getReporter : "~fnGetReporter~",
					isIgnoreETag : sinon.match.func,
					onCreateGroup : sinon.match.func,
					reportStateMessages : "~fnReportStateMessages~",
					reportTransitionMessages : "~fnReportTransitionMessages~",
					updateMessages : sinon.match.func
				},
				{"Accept-Language" : "ab-CD"},
				bStatistics
					? {"sap-client" : "123", "sap-statistics" : true}
					: {"sap-client" : "123"},
				"4.0", undefined)
			.returns(oRequestor);
		oExpectedBind0 = this.mock(ODataMetaModel.prototype.fetchEntityContainer).expects("bind")
			.returns("~fnFetchEntityContainer~");
		oExpectedBind1 = this.mock(ODataMetaModel.prototype.fetchObject).expects("bind")
			.returns("~fnFetchMetadata~");
		oExpectedBind2 = this.mock(ODataModel.prototype.fireDataReceived).expects("bind")
			.returns("~fnFireDataReceived~");
		oExpectedBind3 = this.mock(ODataModel.prototype.fireDataRequested).expects("bind")
			.returns("~fnFireDataRequested~");
		oExpectedBind4 = this.mock(ODataModel.prototype.getGroupProperty).expects("bind")
			.returns("~fnGetGroupProperty~");
		oExpectedBind5 = this.mock(ODataModel.prototype.getMessagesByPath).expects("bind")
			.returns("~fnGetMessagesByPath~");
		oExpectedBind6 = this.mock(ODataModel.prototype.getOptimisticBatchEnabler).expects("bind")
			.returns("~fnGetOptimisticBatchEnabler~");
		oExpectedBind7 = this.mock(ODataModel.prototype.getReporter).expects("bind")
			.returns("~fnGetReporter~");
		oExpectedBind8 = this.mock(ODataModel.prototype.reportTransitionMessages).expects("bind")
			.returns("~fnReportTransitionMessages~");
		oExpectedBind9 = this.mock(ODataModel.prototype.reportStateMessages).expects("bind")
			.returns("~fnReportStateMessages~");

		// code under test
		oModel = this.createModel("?sap-client=123", {}, true);

		assert.ok(oModel instanceof Model);
		assert.strictEqual(oModel.oRequestor, oRequestor);
		assert.strictEqual(oExpectedBind0.firstCall.args[0], oModel.oMetaModel);
		assert.strictEqual(oExpectedBind1.firstCall.args[0], oModel.oMetaModel);
		assert.strictEqual(oExpectedBind2.firstCall.args[0], oModel);
		assert.strictEqual(oExpectedBind3.firstCall.args[0], oModel);
		assert.strictEqual(oExpectedBind4.firstCall.args[0], oModel);
		assert.strictEqual(oExpectedBind5.firstCall.args[0], oModel);
		assert.strictEqual(oExpectedBind6.firstCall.args[0], oModel);
		assert.strictEqual(oExpectedBind7.firstCall.args[0], oModel);
		assert.strictEqual(oExpectedBind8.firstCall.args[0], oModel);
		assert.strictEqual(oExpectedBind9.firstCall.args[0], oModel);
		oModelInterface = oExpectedCreate.firstCall.args[1];
		assert.strictEqual(oModelInterface, oModel.oInterface);

		// code under test
		assert.strictEqual(oModelInterface.isIgnoreETag(), false);

		this.mock(oModel._submitBatch).expects("bind")
			.withExactArgs(sinon.match.same(oModel), "$auto", true)
			.returns(fnSubmitAuto);
		this.mock(oModel).expects("addPrerenderingTask").withExactArgs(fnSubmitAuto);

		// code under test - call onCreateGroup
		oModelInterface.onCreateGroup("$auto");
		oModelInterface.onCreateGroup("foo");

		this.mock(oModel).expects("fireEvent").withExactArgs("sessionTimeout");

		// code under test - call fireSessionTimeout
		oModelInterface.fireSessionTimeout();

		// code under test
		oModel.setIgnoreETag("~bIgnoreETag~");

		this.mock(Messaging).expects("updateMessages")
			.withExactArgs("~oldMessages~", "~newMessages~");

		// code under test
		oModelInterface.updateMessages("~oldMessages~", "~newMessages~");

		assert.strictEqual(oModelInterface.isIgnoreETag(), "~bIgnoreETag~");
	});
});

	//*********************************************************************************************
	/**
	 * @deprecated since 1.39.0
	 */
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
			oHelperMock = this.mock(_Helper),
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
		this.mock(oPropertyBinding2).expects("checkUpdateInternal").returns(SyncPromise.resolve());
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
		oHelperMock.expects("checkGroupId").withExactArgs("myGroup");

		// code under test
		oModel.refresh("myGroup");

		oHelperMock.expects("checkGroupId").never();
		oModelMock.expects("getBindings").never();

		// code under test
		assert.throws(function () {
			oModel.refresh(true);
		}, new Error("Unsupported parameter bForceUpdate"));

		oHelperMock.expects("checkGroupId").withExactArgs("$Invalid").throws(oError);

		// code under test
		assert.throws(function () {
			oModel.refresh("$Invalid");
		}, oError);

		oHelperMock.expects("checkGroupId").withExactArgs("myGroup2");
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
		oRequestorMock.expects("cancelChanges").withExactArgs("$inactive.$auto", true);
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
	});

	//*********************************************************************************************
	/**
	 * @deprecated since 1.88.0
	 */
	QUnit.test("forbidden & deprecated", function (assert) {
		var oModel = this.createModel();

		assert.throws(function () {
			oModel.setLegacySyntax();
		}, new Error("Unsupported operation: v4.ODataModel#setLegacySyntax"));
	});

	//*********************************************************************************************
	QUnit.test("events", function (assert) {
		var oModel = this.createModel(),
			oModelPrototypeMock = this.mock(Model.prototype);

		[
			"dataReceived", "dataRequested", "messageChange", "sessionTimeout"
		].forEach(function (sEventId) {
			oModelPrototypeMock.expects("attachEvent")
				.withExactArgs(sEventId, "~oData~", "~fnFunction~", "~oListener~")
				.returns(oModel);

			assert.strictEqual(
				oModel.attachEvent(sEventId, "~oData~", "~fnFunction~", "~oListener~"),
				oModel);
		});

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
	QUnit.test("event: dataRequested", function (assert) {
		var oModel = this.createModel(),
			oModelMock = this.mock(oModel);

		oModelMock.expects("attachEvent")
			.withExactArgs("dataRequested", "~fnFunction~", "~oListener~")
			.returns(oModel);

		// code under test
		assert.strictEqual(oModel.attachDataRequested("~fnFunction~", "~oListener~"), oModel);

		oModelMock.expects("detachEvent")
			.withExactArgs("dataRequested", "~fnFunction~", "~oListener~")
			.returns(oModel);

		// code under test
		assert.strictEqual(oModel.detachDataRequested("~fnFunction~", "~oListener~"), oModel);
	});

	//*********************************************************************************************
	QUnit.test("event: dataReceived", function (assert) {
		var oModel = this.createModel(),
			oModelMock = this.mock(oModel);

		oModelMock.expects("attachEvent")
			.withExactArgs("dataReceived", "~fnFunction~", "~oListener~")
			.returns(oModel);

		// code under test
		assert.strictEqual(oModel.attachDataReceived("~fnFunction~", "~oListener~"), oModel);

		oModelMock.expects("detachEvent")
			.withExactArgs("dataReceived", "~fnFunction~", "~oListener~")
			.returns(oModel);

		// code under test
		assert.strictEqual(oModel.detachDataReceived("~fnFunction~", "~oListener~"), oModel);
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
[undefined, "~oError~"].forEach(function (oError) {
	var sTitle = "fireDataRequested/fireDataReceived: " + (oError ? "failed" : "sucess");

	QUnit.test(sTitle, function (assert) {
		var oModel = this.createModel(),
			oModelMock = this.mock(oModel);

		oModelMock.expects("fireEvent").withExactArgs("dataRequested", {path : "~sPath1~"});

		// code under test
		oModel.fireDataRequested("~sPath1~");

		assert.deepEqual(oModel.mPath2DataRequestedCount, {
			"~sPath1~" : 1
		});

		oModelMock.expects("fireEvent").withExactArgs("dataRequested", {path : "~sPath2~"});

		// code under test
		oModel.fireDataRequested("~sPath2~");

		assert.deepEqual(oModel.mPath2DataRequestedCount, {
			"~sPath1~" : 1,
			"~sPath2~" : 1
		});

		// code under test
		oModel.fireDataRequested("~sPath1~");

		assert.deepEqual(oModel.mPath2DataRequestedCount, {
			"~sPath1~" : 2,
			"~sPath2~" : 1
		});

		// code under test
		oModel.fireDataReceived(oError, "~sPath1~");

		assert.deepEqual(oModel.mPath2DataRequestedCount, {
			"~sPath1~" : 1,
			"~sPath2~" : 1
		});

		oModelMock.expects("fireEvent")
			.withExactArgs("dataReceived", oError
				? {error : oError, path : "~sPath1~"}
				: {data : {}, path : "~sPath1~"});

		// code under test
		oModel.fireDataReceived(oError && "~anotherError~", "~sPath1~");

		assert.deepEqual(oModel.mPath2DataRequestedCount, {
			"~sPath2~" : 1
		});

		oModelMock.expects("fireEvent")
			.withExactArgs("dataReceived", {data : {}, path : "~sPath2~"});

		// code under test
		oModel.fireDataReceived(undefined, "~sPath2~");

		assert.deepEqual(oModel.mPath2DataRequestedCount, {});

		assert.throws(function () {
			// code under test
			oModel.fireDataReceived(undefined, "~sPath1~");
		}, new Error("Received more data than requested"));

		oModelMock.expects("fireEvent").withExactArgs("dataRequested", {path : "~sPath1~"});
		oModelMock.expects("fireEvent")
			.withExactArgs("dataReceived", {data : {}, path : "~sPath1~"});

		// code under test
		oModel.fireDataRequested("~sPath1~");
		oModel.fireDataReceived(undefined, "~sPath1~");
	});
});

	//*********************************************************************************************
	[{
		stack : "Failure\n    at _Helper.createError", // like Chrome
		message : "Failure\n    at _Helper.createError"
	}, {
		stack : "_Helper.createError@_Helper.js", // like FF
		message : "Failure\n_Helper.createError@_Helper.js"
	}].forEach(function (oFixture, i) {
		QUnit.test("reportError, i:" + i, function () {
			var sClassName = "sap.ui.model.odata.v4.ODataPropertyBinding",
				oError = new Error("Failure"),
				oHelperMock = this.mock(_Helper),
				sLogMessage = "Failed to read path /Product('1')/Unknown",
				oModel = this.createModel(),
				oModelMock = this.mock(oModel);

			oError.stack = oFixture.stack;
			oError.resourcePath = "resource/path";

			oHelperMock.expects("extractMessages").withExactArgs(sinon.match.same(oError))
				.returns("~extractedMessages~");
			this.oLogMock.expects("error").withExactArgs(sLogMessage, oFixture.message, sClassName)
				.twice();
			oModelMock.expects("reportStateMessages").never();
			oModelMock.expects("reportTransitionMessages")
				.once()// add each error only once to the Messaging
				.withExactArgs("~extractedMessages~", "resource/path");

			// code under test
			oModel.reportError(sLogMessage, sClassName, oError);
			oModel.reportError(sLogMessage, sClassName, oError); // oError.$reported is now true
		});
	});

	//*********************************************************************************************
	QUnit.test("reportError on canceled error", function () {
		var oError = {canceled : true, message : "Canceled", stack : "Canceled\n    at foo.bar"},
			oModel = this.createModel();

		this.oLogMock.expects("debug")
			.withExactArgs("Failure", "Canceled\n    at foo.bar", "class");
		this.mock(_Helper).expects("extractMessages").never();
		this.mock(oModel).expects("reportStateMessages").never();
		this.mock(oModel).expects("reportTransitionMessages").never();

		// code under test
		oModel.reportError("Failure", "class", oError);
	});

	//*********************************************************************************************
	QUnit.test("reportError on canceled error, no debug log", function () {
		var oError = {canceled : "noDebugLog"},
			oModel = this.createModel();

		this.oLogMock.expects("debug").never();
		this.mock(_Helper).expects("extractMessages").never();
		this.mock(oModel).expects("reportStateMessages").never();
		this.mock(oModel).expects("reportTransitionMessages").never();

		// code under test
		oModel.reportError("Failure", "class", oError);
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
			dataPath : "/BusinessPartnerList",
			metaPath : "Name"
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
			oModel.createBindingContext("/foo", undefined, {param : "bar"});
		}, new Error("Only the parameters sPath and oContext are supported"),
			"more than two parameters not allowed");
		assert.throws(function () {
			oModel.createBindingContext("foo", oEntityContext);
		}, new Error("Unsupported type: oContext must be of type sap.ui.model.Context, but was "
				+ "sap.ui.model.odata.v4.Context"), "sap.ui.model.odata.v4.Context not allowed");
	});
	// TODO allow v4.Context and return v4.Context

	//*********************************************************************************************
	QUnit.test("checkBatchGroupId: success", function () {
		var sGroupId = {/*string*/},
			oModel = this.createModel();

		this.mock(_Helper).expects("checkGroupId").withExactArgs(sinon.match.same(sGroupId));
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

		this.mock(_Helper).expects("checkGroupId").withExactArgs(sinon.match.same(sGroupId))
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

		this.mock(_Helper).expects("checkGroupId").withExactArgs("foo");
		this.mock(oModel).expects("isDirectGroup").withExactArgs("foo").returns(true);

		assert.throws(function () {
			// code under test
			oModel.checkBatchGroupId("foo");
		}, new Error("Group ID does not use batch requests: foo"));
	});

	//*********************************************************************************************
	[{
		mParameters : {
			$expand : {
				foo : {
					$count : true,
					$expand : {bar : {}},
					$filter : "baz eq 0",
					$levels : "max",
					$orderby : "qux",
					$search : "key",
					$select : ["*"]
				}
			},
			$select : ["bar"],
			custom : "baz"
		},
		bSystemQueryOptionsAllowed : true
	}, {
		mParameters : {
			$apply : "apply",
			$count : true,
			$filter : "foo eq 42",
			$orderby : "bar",
			$search : '"foo bar" AND NOT foobar'
		},
		bSystemQueryOptionsAllowed : true
	}, {
		mParameters : {custom : "foo"}
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
	}, {
		mParameters : {
			$expand : {TEAM_2_MANAGER : {}},
			$select : "bar"
		},
		bSystemQueryOptionsAllowed : true,
		expected : {
			$expand : {TEAM_2_MANAGER : {}},
			$select : ["bar"]
		}
	}, {
		mParameters : {
			$expand : {TEAM_2_MANAGER : {
				$expand : "TEAM_2_EMPLOYEES($select=Name)",
				$select : "Team_Id"
			}}
		},
		bSystemQueryOptionsAllowed : true,
		expected : {
			$expand : {TEAM_2_MANAGER : {
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
				TEAM_2_MANAGER : true,
				TEAM_2_EMPLOYEES : null,
				FOO1 : 42,
				FOO2 : false,
//TODO undefined values are removed by _Helper.clone, but should also be normalized to {}
				//"FOO3" : undefined
				FOO4 : {
					$count : false
				}
			}
		},
		bSystemQueryOptionsAllowed : true,
		expected : {
			$expand : {
				TEAM_2_MANAGER : {},
				TEAM_2_EMPLOYEES : {},
				FOO1 : {},
				FOO2 : {},
				// "FOO3" : {}
				FOO4 : {}
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

		assert.deepEqual(ODataModel.prototype.buildQueryOptions({
				$$aggregation : { // avoid "TypeError: Converting circular structure to JSON"
					$foo : this.createModel()
				}
			}), {});
	});

	//*********************************************************************************************
	QUnit.test("buildQueryOptions: parse system query options", function (assert) {
		var oParserMock = this.mock(_Parser);

		oParserMock.expects("parseSystemQueryOption")
			.withExactArgs("$expand=foo").returns({$expand : {foo : null}});
		oParserMock.expects("parseSystemQueryOption")
			.withExactArgs("$select=bar").returns({$select : ["bar"]});

		assert.deepEqual(ODataModel.prototype.buildQueryOptions({
			$expand : "foo",
			$select : "bar"
		}, true), {
			$expand : {foo : {}},
			$select : ["bar"]
		});
	});

	//*********************************************************************************************
	[{
		mOptions : {$foo : "foo"},
		bSystemQueryOptionsAllowed : true,
		error : "System query option $foo is not supported"
	}, {
		mOptions : {"@alias" : "alias"},
		bSystemQueryOptionsAllowed : true,
		error : "Parameter @alias is not supported"
	}, {
		mOptions : {$expand : {foo : true}},
		error : "System query option $expand is not supported"
	}, {
		mOptions : {$expand : {foo : {$unknown : "bar"}}},
		bSystemQueryOptionsAllowed : true,
		error : "System query option $unknown is not supported"
	}, {
		mOptions : {$expand : {foo : {select : "bar"}}},
		bSystemQueryOptionsAllowed : true,
		error : "System query option select is not supported"
	}, {
		mOptions : {$levels : 2},
		bSystemQueryOptionsAllowed : true,
		error : "System query option $levels is not supported"
	}, {
		mOptions : {$expand : {foo : {$apply : "bar"}}},
		bSystemQueryOptionsAllowed : true,
		error : "System query option $apply is not supported"
	}, {
		mOptions : {$expand : {foo : {$skip : "10"}}},
		bSystemQueryOptionsAllowed : true,
		error : "System query option $skip is not supported"
	}, {
		mOptions : {$expand : {foo : {$top : "10"}}},
		bSystemQueryOptionsAllowed : true,
		error : "System query option $top is not supported"
	}, {
		mOptions : {"sap-foo" : "300"},
		error : "Custom query option sap-foo is not supported"
	}, {
		mOptions : {$count : "foo"},
		bSystemQueryOptionsAllowed : true,
		error : "Invalid value for $count: foo"
	}, {
		mOptions : {$count : {}},
		bSystemQueryOptionsAllowed : true,
		error : "Invalid value for $count: [object Object]"
	}, {
		mOptions : {$count : undefined},
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
		// Note: we do not go this far; JsDoc of @returns wins: (string|undefined), nothing else!
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
	QUnit.test("reportTransitionMessages", function () {
		var oModel = this.createModel(),
			oModelMock = this.mock(oModel),
			aMessages = [{}, {}],
			sResourcePath = "~res~";

		oModelMock.expects("createUI5Message")
			.withExactArgs(sinon.match(function (oMessage) {
				return oMessage === aMessages[0] && oMessage.transition === true;
			}), sResourcePath)
			.returns("~UI5msg0~");
		oModelMock.expects("createUI5Message")
			.withExactArgs(sinon.match(function (oMessage) {
				return oMessage === aMessages[1] && oMessage.transition === true;
			}), sResourcePath)
			.returns("~UI5msg1~");
		this.mock(Messaging).expects("updateMessages")
			.withExactArgs(undefined, sinon.match(["~UI5msg0~", "~UI5msg1~"]));

		// code under test
		oModel.reportTransitionMessages(aMessages, sResourcePath);

		// code under test
		oModel.reportTransitionMessages([], sResourcePath);

		// code under test
		oModel.reportTransitionMessages(null, sResourcePath);
	});

	//*********************************************************************************************
	QUnit.test("reportStateMessages", function () {
		var aBarMessages = ["~rawMessage0~", "~rawMessage1~"],
			aBazMessages = ["~rawMessage2~"],
			oMessagingMock = this.mock(Messaging),
			oModel = this.createModel(),
			oModelMock = this.mock(oModel);

		oModelMock.expects("createUI5Message")
			.withExactArgs(aBarMessages[0], "Team('42')", "foo/bar").returns("~UI5msg0~");
		oModelMock.expects("createUI5Message")
			.withExactArgs(aBarMessages[1], "Team('42')", "foo/bar").returns("~UI5msg1~");
		oModelMock.expects("createUI5Message")
			.withExactArgs(aBazMessages[0], "Team('42')", "foo/baz").returns("~UI5msg2~");
		oMessagingMock.expects("updateMessages")
			.withExactArgs([], ["~UI5msg0~", "~UI5msg1~", "~UI5msg2~"]);

		// code under test
		oModel.reportStateMessages("Team('42')",
			{"foo/bar" : aBarMessages, "foo/baz" : aBazMessages});

		oMessagingMock.expects("updateMessages").never();

		// code under test
		oModel.reportStateMessages("Team('42')", {});
	});

	//*********************************************************************************************
	QUnit.test("reportStateMessages: remove old messages w/o key predicates", function (assert) {
		var mMessages = {
				"/FOO('1')" : [{}, {}],
				// TODO use Message.getPersistent() instead of Message.persistent?
				"/FOO('1')/bar" : [{persistent : true}, {}, {persistent : true}, {}],
				"/FOO('2')" : [{}],
				"/FOO('3')/NavSingle" : [{}],
				"/FOO('3')/NavSingle/Name" : [{}, {}],
				"/FOO('3')/NavSingleBar/Name" : [{}]
			},
			oMessagingMock = this.mock(Messaging),
			oModel = this.createModel();

		oModel.mMessages = mMessages;

		oMessagingMock.expects("updateMessages")
			.withExactArgs(sinon.match.array, sinon.match.array)
			.callsFake(function (aOldMessages, aNewMessages) {
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
		oModel.reportStateMessages("FOO('1')", {});

		oMessagingMock.expects("updateMessages")
			.withExactArgs(sinon.match.array, sinon.match.array)
			.callsFake(function (aOldMessages, aNewMessages) {
				assert.ok(aOldMessages.indexOf(mMessages["/FOO('3')/NavSingle"][0]) >= 0);
				assert.ok(aOldMessages.indexOf(mMessages["/FOO('3')/NavSingle/Name"][0]) >= 0);
				assert.ok(aOldMessages.indexOf(mMessages["/FOO('3')/NavSingle/Name"][1]) >= 0);
				assert.ok(aOldMessages.indexOf(mMessages["/FOO('3')/NavSingleBar/Name"][0]) < 0);
				assert.strictEqual(aNewMessages.length, 0);
				assert.strictEqual(aOldMessages.length, 3);
			});

		// code under test
		oModel.reportStateMessages("FOO('3')/NavSingle", {});
	});

	//*********************************************************************************************
	QUnit.test("reportStateMessages: remove old messages with key predicates", function (assert) {
		var oHelperMock = this.mock(_Helper),
			mMessages = {
				"/FOO('1')" : [{}, {}],
				"/FOO('1')/bar" : [{}],
				"/FOO('2')" : [{persistent : true}, {}, {persistent : true}, {}],
				"/FOO('3')/NavSingle" : [{}],
				"/FOO('3')/NavSingle/Name" : [{}, {}],
				"/FOO('3')/NavSingleBar/Name" : [{}]
			},
			oModel = this.createModel();

		oModel.mMessages = mMessages;
		oHelperMock.expects("buildPath").withExactArgs("/FOO", "('1')").returns("/FOO('1')");
		oHelperMock.expects("buildPath").withExactArgs("/FOO", "('2')").returns("/FOO('2')");
		this.mock(Messaging).expects("updateMessages")
			.withExactArgs(sinon.match.array, sinon.match.array)
			.callsFake(function (aOldMessages, aNewMessages) {
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
		oModel.reportStateMessages("FOO", {}, ["('1')", "('2')"]);
	});

	//*********************************************************************************************
	QUnit.test("reportStateMessages: remove old messages - complete collection", function (assert) {
		var mMessages = {
				"/FOO('1')" : [{}, {}],
				"/FOO('1')/bar" : [{}],
				"/FOO('2')" : [{persistent : true}, {}, {persistent : true}, {}],
				"/FOO('3')/NavSingle" : [{}],
				"/FOO('3')/NavSingle/Name" : [{}, {}],
				"/FOO('3')/NavSingleBar/Name" : [{}]
			},
			oModel = this.createModel();

		oModel.mMessages = mMessages;
		this.mock(Messaging).expects("updateMessages")
			.withExactArgs(sinon.match.array, sinon.match.array)
			.callsFake(function (aOldMessages, aNewMessages) {
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
		oModel.reportStateMessages("FOO", {});
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
			bLocked = {/*boolean*/},
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
	QUnit.test("lock", function (assert) {
		var oGroupLock = {
				isLocked : function () {},
				unlock : function () {}
			},
			oLock,
			oModel = this.createModel();

		this.mock(oModel).expects("isAutoGroup").withExactArgs("group").returns(true);
		this.mock(oModel).expects("lockGroup")
			.withExactArgs("group", sinon.match.same(oModel), true)
			.returns(oGroupLock);

		// code under test
		oLock = oModel.lock("group");

		this.mock(oGroupLock).expects("isLocked").withExactArgs().returns("~isLocked~");

		// code under test
		assert.strictEqual(oLock.isLocked("foo"), "~isLocked~", "arguments ignored");

		this.mock(oGroupLock).expects("unlock").withExactArgs().returns("n/a");

		// code under test
		assert.strictEqual(oLock.unlock("bar"), undefined, "no return");
	});

	//*********************************************************************************************
	QUnit.test("lock: not an auto group", function (assert) {
		var oModel = this.createModel();

		this.mock(oModel).expects("isAutoGroup").withExactArgs("~sGroupId~").returns(false);
		this.mock(oModel).expects("lockGroup").never();

		assert.throws(function () {
			// code under test
			oModel.lock("~sGroupId~");
		}, new Error("Group ID does not use automatic batch requests: ~sGroupId~"));
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
	QUnit.test("clearSessionContext", function (assert) {
		var oModel = this.createModel();

		this.mock(oModel.oRequestor).expects("clearSessionContext")
			.withExactArgs() // no way to influence internal method
			.returns("n/a"); // no way to leak internal results

		// code under test
		assert.strictEqual(oModel.clearSessionContext(2, "b", "ignored"), undefined);
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
		var oExpectation = this.mock(Rendering).expects("addPrerenderingTask")
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

		oAddTaskMock = this.mock(Rendering).expects("addPrerenderingTask")
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

		oAddTaskExpectation = this.mock(Rendering).expects("addPrerenderingTask")
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

		oAddTaskExpectation = this.mock(Rendering).expects("addPrerenderingTask").twice()
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
				isRoot : function () { return true; },
				requestAbsoluteSideEffects : function () {}
			},
			oBinding2 = {
				isRoot : function () { return false; },
				requestAbsoluteSideEffects : function () {}
			},
			oBinding3 = {
				isRoot : function () { return true; },
				requestAbsoluteSideEffects : function () {}
			},
			oModel = this.createModel(),
			aPaths = ["/foo", "/bar/baz"],
			oPromise;

		oModel.aAllBindings = [oBinding1, oBinding2, oBinding3];
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
				isRoot : function () { return true; },
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
			.catch(function () { /* avoid that the test fails */ });
	});
});

	//*********************************************************************************************
	QUnit.test("createUI5Message: basic tests", function (assert) {
		var oModel = this.createModel(),
			oRawMessage = {
				code : "CODE",
				longtextUrl : "longtextUrl",
				message : "message",
				technical : "technical",
				transition : false
			},
			oUI5Message;

		this.mock(_Helper).expects("createTechnicalDetails")
			.withExactArgs(sinon.match.same(oRawMessage))
			.returns("~technicalDetails~");

		// code under test
		oUI5Message = oModel.createUI5Message(oRawMessage);

		assert.ok(oUI5Message instanceof Message);
		assert.strictEqual(oUI5Message.getCode(), "CODE");
		assert.strictEqual(oUI5Message.getDescriptionUrl(), "longtextUrl");
		assert.strictEqual(oUI5Message.getMessage(), "message");
		assert.strictEqual(oUI5Message.getTechnical(), "technical");
		assert.strictEqual(oUI5Message.processor, oModel);
		assert.strictEqual(oUI5Message.getPersistent(), true);
		assert.strictEqual(oUI5Message.getTargets()[0], "");
		assert.strictEqual(oUI5Message.getTechnicalDetails(), "~technicalDetails~");
	});

	//*********************************************************************************************
[
	{numericSeverity : undefined, type : MessageType.None},
	{numericSeverity : null, type : MessageType.None},
	{numericSeverity : 1, type : MessageType.Success},
	{numericSeverity : 2, type : MessageType.Information},
	{numericSeverity : 3, type : MessageType.Warning},
	{numericSeverity : 4, type : MessageType.Error},
	{numericSeverity : 5, type : MessageType.None}
].forEach(function (oFixture) {
	var sTitle = "createUI5Message: numeric severities: " + oFixture.numericSeverity;

	QUnit.test(sTitle, function (assert) {
		this.mock(_Helper).expects("createTechnicalDetails"); // ignore details

		assert.strictEqual(
			// code under test
			this.createModel().createUI5Message({numericSeverity : oFixture.numericSeverity}).type,
			oFixture.type);
	});
});

	//*********************************************************************************************
[undefined, "target"].forEach(function (sTarget) {
	QUnit.test("createUI5Message: longtextUrl, target: " + sTarget, function (assert) {
		var oModel = this.createModel(),
			oRawMessage = {
				longtextUrl : "longtextUrl",
				target : sTarget
			},
			oUI5Message;

		this.mock(oModel).expects("normalizeMessageTarget").exactly(sTarget ? 1 : 0)
			.withExactArgs("/~path~/" + oRawMessage.target)
			.returns("/~path~/~normalizedTarget~");
		this.mock(_Helper).expects("createTechnicalDetails"); // ignore details
		this.mock(_Helper).expects("makeAbsolute")
			.withExactArgs("longtextUrl", sServiceUrl + "~path~")
			.returns("~absoluteLongtextUrl~");

		// code under test
		oUI5Message = oModel.createUI5Message(oRawMessage, "~path~");

		assert.strictEqual(oUI5Message.getDescriptionUrl(), "~absoluteLongtextUrl~");
		assert.strictEqual(oUI5Message.getTargets()[0], oRawMessage.target
			? "/~path~/~normalizedTarget~"
			: "");
	});
});

	//*********************************************************************************************
	QUnit.test("createUI5Message: makeAbsolute for empty longtextUrl", function (assert) {
		this.mock(_Helper).expects("createTechnicalDetails"); // ignore details

		assert.strictEqual(
			// code under test
			this.createModel().createUI5Message({longtextUrl : ""}).getDescriptionUrl(),
			undefined);
	});

	//*********************************************************************************************
[{
	target : "",
	expectedTargets : ["/res/cache/"]
}, {
	target : "target",
	expectedTargets : ["/res/cache/target"]
}, {
	target : "/target",
	additionalTargets : ["/add0", "/add1"],
	transition : true, // default is false. for unbound it's always true.
	expectedTargets : ["/target", "/add0", "/add1"],
	expectedPersistent : true
}, {
	target : "target",
	additionalTargets : ["add0", "add1"],
	expectedTargets : [
		"/res/cache/target",
		"/res/cache/add0",
		"/res/cache/add1"
	]
}, { // mixed resolved/unresolved targets
	target : "target",
	additionalTargets : ["/alreadyResolvedAdd0", "add1"],
	expectedTargets : [
		"/res/cache/target",
		"/alreadyResolvedAdd0",
		"/res/cache/add1"
	]
}].forEach(function (oFixture, i) {
	QUnit.test("createUI5Message: bound: " + i, function (assert) {
		var oHelperMock = this.mock(_Helper),
			oModel = this.createModel(),
			oModelMock = this.mock(oModel),
			oRawMessage = {
				target : oFixture.target,
				additionalTargets : oFixture.additionalTargets,
				transition : oFixture.transition
			},
			oUI5Message;

		oHelperMock.expects("createTechnicalDetails"); // ignore details
		oHelperMock.expects("buildPath").never();
		[oFixture.target].concat(oFixture.additionalTargets || []).forEach(function (sTarget) {
			if (sTarget[0] !== "/") {
				oHelperMock.expects("buildPath")
					.withExactArgs("/" + "~resourcePath~", "~cachePath~", sTarget)
					.returns("/res/cache/" + sTarget);
				oModelMock.expects("normalizeMessageTarget")
					.withExactArgs("/res/cache/" + sTarget)
					.returns("/res/cache/" + sTarget);

				return;
			}
			oModelMock.expects("normalizeMessageTarget")
				.withExactArgs(sTarget)
				.returns(sTarget);
		});

		// code under test
		oUI5Message = oModel.createUI5Message(oRawMessage, "~resourcePath~", "~cachePath~");

		assert.deepEqual(oUI5Message.getTargets(), oFixture.expectedTargets);
		assert.strictEqual(oUI5Message.getPersistent(), oFixture.expectedPersistent || false);
	});
});

	//*********************************************************************************************
	QUnit.test("createUI5Message: no resourcePath", function (assert) {
		var oHelperMock = this.mock(_Helper),
			oModel = this.createModel(),
			oRawMessage = {
				target : "/foo"
			},
			oUI5Message;

		this.mock(oModel).expects("normalizeMessageTarget")
			.withExactArgs(oRawMessage.target)
			.returns("/~normalizedTarget~");
		oHelperMock.expects("createTechnicalDetails"); // ignore details

		// code under test
		oUI5Message = oModel.createUI5Message(oRawMessage);

		assert.deepEqual(oUI5Message.getTargets(), ["/~normalizedTarget~"]);
	});

	//*********************************************************************************************
	QUnit.test("createUI5Message: resource path w/ query string", function (assert) {
		var oHelperMock = this.mock(_Helper),
			oModel = this.createModel(),
			oModelMock = this.mock(oModel),
			oRawMessage = {
				target : "foo",
				additionalTargets : ["bar", "baz"]
			},
			oUI5Message;

		oModelMock.expects("normalizeMessageTarget")
			.withExactArgs("/~resourcePath~/~cachePath~/" + oRawMessage.target)
			.returns("/~normalizedFoo~");
		oModelMock.expects("normalizeMessageTarget")
			.withExactArgs("/~resourcePath~/~cachePath~/" + oRawMessage.additionalTargets[0])
			.returns("/~normalizedBar~");
		oModelMock.expects("normalizeMessageTarget")
			.withExactArgs("/~resourcePath~/~cachePath~/" + oRawMessage.additionalTargets[1])
			.returns("/~normalizedBaz~");
		oHelperMock.expects("createTechnicalDetails"); // ignore details

		// code under test
		oUI5Message = oModel.createUI5Message(oRawMessage, "~resourcePath~?foo=bar", "~cachePath~");

		assert.deepEqual(oUI5Message.getTargets(), [
			"/~normalizedFoo~",
			"/~normalizedBar~",
			"/~normalizedBaz~"
		]);
	});

	//*********************************************************************************************
[false, true].forEach(function (bFound) {
	[undefined, {}, {$$groupId : "group"}].forEach(function (mParameters) {
		var sTitle = "getKeepAliveContext: " + (bFound ? "one" : "no")
				+ " binding found, mParameters=" + JSON.stringify(mParameters);

	QUnit.test(sTitle, function (assert) {
		// do not use real bindings because they become active asynchronously (esp. ODLB)
		var oMatch = {
				getKeepAliveContext : function () {},
				isKeepAliveBindingFor : function () {},
				mParameters : {$$getKeepAliveContext : true},
				removeCachesAndMessages : function () {}
			},
			oNoMatch1 = { /* simulates a ODCB/ODPB */ },
			oNoMatch2 = { // simulates an non-matching ODLB
				isKeepAliveBindingFor : function () {},
				mParameters : {$$getKeepAliveContext : true},
				removeCachesAndMessages : function () {}
			},
			oNoMatch3 = { // simulates an non-matching ODLB
				isKeepAliveBindingFor : function () {},
				mParameters : {$$getKeepAliveContext : true},
				removeCachesAndMessages : function () {}
			},
			oModel = this.createModel("", {autoExpandSelect : true}),
			bUseGroupId = mParameters && "$$groupId" in mParameters;

		oModel.aAllBindings = [oNoMatch1, oNoMatch2, oNoMatch3];
		if (bFound) {
			oModel.aAllBindings.push(oMatch);
			this.mock(oMatch).expects("removeCachesAndMessages")
				.withExactArgs("SalesOrders('1')/Items", true);
			this.mock(oMatch).expects("isKeepAliveBindingFor")
				.withExactArgs("/SalesOrders('1')/Items").returns(true);
		}
		this.mock(_Helper).expects("getPredicateIndex")
				.withExactArgs("/SalesOrders('1')/Items('2')")
			.returns(23);
		this.mock(oNoMatch2).expects("removeCachesAndMessages")
			.withExactArgs("SalesOrders('1')/Items", true);
		this.mock(oNoMatch2).expects("isKeepAliveBindingFor")
			.withExactArgs("/SalesOrders('1')/Items").returns(false);
		this.mock(oNoMatch3).expects("removeCachesAndMessages")
			.withExactArgs("SalesOrders('1')/Items", true);
		this.mock(oNoMatch3).expects("isKeepAliveBindingFor")
			.withExactArgs("/SalesOrders('1')/Items").returns(false);
		this.mock(oModel).expects("bindList").exactly(bFound ? 0 : 1)
			.withExactArgs("/SalesOrders('1')/Items", undefined, undefined, undefined,
				mParameters ? sinon.match.same(mParameters) : {})
			.returns(oMatch);
		this.mock(oMatch).expects("getKeepAliveContext")
			.withExactArgs("/SalesOrders('1')/Items('2')", "~bRequestMessages~",
				bUseGroupId ? "group" : undefined)
			.returns("~oContext~");

		assert.strictEqual(
			// code under test
			oModel.getKeepAliveContext("/SalesOrders('1')/Items('2')", "~bRequestMessages~",
				mParameters),
			"~oContext~");

		assert.strictEqual(oModel.mKeepAliveBindingsByPath["/SalesOrders('1')/Items"],
			bFound ? undefined : oMatch);
	});
	});
});

	//*********************************************************************************************
	QUnit.test("getKeepAliveContext: two bindings found", function (assert) {
		// do not use real bindings because they become active asynchronously (esp. ODLB)
		var oMatch1 = {
				isKeepAliveBindingFor : function () {}
			},
			oMatch2 = {
				isKeepAliveBindingFor : function () {}
			},
			oModel = this.createModel("", {autoExpandSelect : true});

		oModel.aAllBindings = [oMatch1, oMatch2];
		this.mock(oMatch1).expects("isKeepAliveBindingFor")
			.withExactArgs("/EMPLOYEES").returns(true);
		this.mock(oMatch2).expects("isKeepAliveBindingFor")
			.withExactArgs("/EMPLOYEES").returns(true);

		assert.throws(function () {
			// code under test
			oModel.getKeepAliveContext("/EMPLOYEES('1')", "~bRequestMessages~");
		}, new Error("Multiple bindings with $$getKeepAliveContext for: /EMPLOYEES('1')"));
	});

	//*********************************************************************************************
[false, true].forEach(function (bUseGroupId) {
	QUnit.test("getKeepAliveContext: temporary binding, group=" + bUseGroupId, function (assert) {
		// do not use real bindings because they become active asynchronously (esp. ODLB)
		var oMatch = {
				getKeepAliveContext : function () {}
			},
			oNoMatch = { // simulates an ODLB which should not be considered
				isKeepAliveBindingFor : function () {}
			},
			oModel = this.createModel("", {autoExpandSelect : true}),
			mParameters;

		if (bUseGroupId) {
			mParameters = {
				foo : "bar",
				bar : "baz",
				"sap-valid-at" : "2020-02-02",
				$$groupId : "group",
				$$patchWithoutSideEffects : true,
				$$updateGroupId : "update"
			};
		}
		oModel.aAllBindings = [oNoMatch];
		oModel.mKeepAliveBindingsByPath["/SalesOrders('1')/Items"] = oMatch;
		this.mock(_Helper).expects("getPredicateIndex")
				.withExactArgs("/SalesOrders('1')/Items('2')")
			.returns(23);
		this.mock(oNoMatch).expects("isKeepAliveBindingFor").never();
		this.mock(oModel).expects("bindList").never();
		this.mock(oMatch).expects("getKeepAliveContext")
			.withExactArgs("/SalesOrders('1')/Items('2')", "~bRequestMessages~",
				bUseGroupId ? "group" : undefined)
			.returns("~oContext~");

		assert.strictEqual(
			// code under test
			oModel.getKeepAliveContext("/SalesOrders('1')/Items('2')", "~bRequestMessages~",
				mParameters),
			"~oContext~");

		assert.strictEqual(oModel.mKeepAliveBindingsByPath["/SalesOrders('1')/Items"], oMatch);
	});
});

	//*********************************************************************************************
	QUnit.test("getKeepAliveContext: no autoExpandSelect", function (assert) {
		// autoExpandSelect is important when creating a kept-alive context w/o data. This context
		// needs late property requests to become valid.
		assert.throws(function () {
			// code under test
			this.createModel().getKeepAliveContext();
		}, new Error("Missing parameter autoExpandSelect"));
	});

	//*********************************************************************************************
	QUnit.test("getKeepAliveContext: relative path", function (assert) {
		var oModel = this.createModel("", {autoExpandSelect : true});

		assert.throws(function () {
			// code under test
			oModel.getKeepAliveContext("TEAMS('1')");
		}, new Error("Not a list context path to an entity: TEAMS('1')"));
	});

	//*********************************************************************************************
[
	"sap-statistics", "$apply", "$count", "$expand", "$filter", "$levels", "$orderby", "$search",
	"$select", "$$aggregation", "$$canonicalPath", "$$getKeepAliveContext", "$$operationMode",
	"$$ownRequest", "$$sharedRequest"
].forEach(function (sParameter) {
	QUnit.test("getKeepAliveContext: invalid parameter " + sParameter, function (assert) {
		var oModel = this.createModel("", {autoExpandSelect : true}),
			mParameters = {};

		mParameters[sParameter] = "anything";

		assert.throws(function () {
			// code under test
			oModel.getKeepAliveContext("/TEAMS('1')", false, mParameters);
		}, new Error("Invalid parameter: " + sParameter));
	});
});

	//*********************************************************************************************
	QUnit.test("releaseKeepAliveBinding", function (assert) {
		var oModel = this.createModel("", {autoExpandSelect : true});

		oModel.mKeepAliveBindingsByPath["/EMPLOYEES"] = "~oBinding~";

		// code under test
		assert.strictEqual(oModel.releaseKeepAliveBinding("/foo"), undefined);
		assert.strictEqual(oModel.releaseKeepAliveBinding("/EMPLOYEES"), "~oBinding~");

		assert.notOk("/EMPLOYEES" in oModel.mKeepAliveBindingsByPath);
	});

	//*********************************************************************************************
	QUnit.test("waitForKeepAliveBinding", function (assert) {
		const oModel = this.createModel("", {autoExpandSelect : true});

		oModel.mKeepAliveBindingsByPath["/EMPLOYEES"] = {
			oCachePromise : "~oCachePromise~"
		};

		// code under test
		assert.strictEqual(oModel.waitForKeepAliveBinding({}), SyncPromise.resolve());

		const oBinding0 = {
			mParameters : {} // just having parameters is not sufficient
		};

		// code under test
		assert.strictEqual(oModel.waitForKeepAliveBinding(oBinding0), SyncPromise.resolve());

		const oBinding1 = {
			mParameters : {$$getKeepAliveContext : true},
			getResolvedPath : mustBeMocked
		};
		this.mock(oBinding1).expects("getResolvedPath").withExactArgs().returns("/EMPLOYEES");

		// code under test
		assert.strictEqual(oModel.waitForKeepAliveBinding(oBinding1), "~oCachePromise~");

		const oBinding2 = {
			mParameters : {$$getKeepAliveContext : true},
			getResolvedPath : mustBeMocked
		};
		this.mock(oBinding2).expects("getResolvedPath").withExactArgs().returns("/TEAMS");

		// code under test
		assert.strictEqual(oModel.waitForKeepAliveBinding(oBinding2), SyncPromise.resolve());
	});

	//*********************************************************************************************
	QUnit.test("set+getOptimisticBatchEnabler, success", function (assert) {
		var fnEnabler = function () {},
			oModel;

		// prevent early requests during model creation
		this.mock(ODataMetaModel.prototype).expects("fetchEntityContainer").withExactArgs(true);
		this.mock(ODataModel.prototype).expects("initializeSecurityToken").withExactArgs();
		oModel = this.createModel("", {earlyRequests : true});

		assert.strictEqual(oModel.getOptimisticBatchEnabler(), null);

		// code under test
		oModel.setOptimisticBatchEnabler(fnEnabler);

		assert.strictEqual(oModel.getOptimisticBatchEnabler(), fnEnabler);
	});

	//*********************************************************************************************
	QUnit.test("setOptimisticBatchEnabler, no earlyRequests set", function (assert) {
		var oModel = this.createModel("");

		assert.throws(function () {
			// code under test
			oModel.setOptimisticBatchEnabler("n/a");
		}, new Error("The earlyRequests model parameter is not set"));
	});

	//*********************************************************************************************
	QUnit.test("setOptimisticBatchEnabler, other errors", function (assert) {
		var oModel,
			oRequestorMock;

		// prevent early requests during model creation
		this.mock(ODataMetaModel.prototype).expects("fetchEntityContainer").withExactArgs(true);
		this.mock(ODataModel.prototype).expects("initializeSecurityToken").withExactArgs();
		oModel = this.createModel("", {earlyRequests : true});

		oRequestorMock = this.mock(oModel.oRequestor);
		oRequestorMock.expects("isBatchSent").thrice().withExactArgs().returns(false);

		assert.throws(function () {
			// code under test - not a function
			oModel.setOptimisticBatchEnabler("~not~a~function~");
		}, new Error("The given fnOptimisticBatchEnabler parameter is not a function"));

		oModel.setOptimisticBatchEnabler(function () {});

		assert.throws(function () {
			// code under test - already set
			oModel.setOptimisticBatchEnabler(function () {});
		}, new Error("The setter is called more than once"));

		oRequestorMock.expects("isBatchSent").withExactArgs().returns(true);

		assert.throws(function () {
			// code under test - to late
			oModel.setOptimisticBatchEnabler("n/a");
		}, new Error("The setter is called after a non-optimistic batch is sent"));
	});

	//*********************************************************************************************
	QUnit.test("cleanUpOptimisticBatch: default", function (assert) {
		this.mock(CacheManager).expects("delWithFilters")
			.withExactArgs({
				olderThan : undefined,
				prefix : "sap.ui.model.odata.v4.optimisticBatch:"
			})
			.resolves("~nothing~");

		// code under test
		return ODataModel.cleanUpOptimisticBatch().then(function (oResult) {
			assert.strictEqual(oResult, "~nothing~");
		});
	});

	QUnit.test("cleanUpOptimisticBatch: with olderThan", function (assert) {
		this.mock(CacheManager).expects("delWithFilters")
			.withExactArgs({
				olderThan : "~anyDate~",
				prefix : "sap.ui.model.odata.v4.optimisticBatch:"
			})
			.resolves("~nothing~");

		// code under test
		return ODataModel.cleanUpOptimisticBatch("~anyDate~").then(function (oResult) {
			assert.strictEqual(oResult, "~nothing~");
		});
	});

	//*********************************************************************************************
[{
	sTarget : "foo(propertyA='1')",
	sResult : "foo('1')",
	parseKeyPredicate : [{
		sPredicate : "(propertyA='1')",
		oResult : {propertyA : "'1'"}
	}],
	fetchType : [{
		sMetaPath : "foo",
		oResult : {$Key : ["propertyA"]}
	}],
	buildPath : [{
		sMetaPath : "",
		sCollection : "foo",
		sResult : "foo"
	}]
}, {
	sTarget : "foo('1')",
	sResult : "foo('1')",
	parseKeyPredicate : [{
		sPredicate : "('1')",
		oResult : {"" : "'1'"}
	}],
	fetchType : [],
	buildPath : [{
		sMetaPath : "",
		sCollection : "foo",
		sResult : "foo"
	}]
}, {
	sTarget : "bar(propertyB='2',propertyA='1')",
	sResult : "bar(propertyA='1',propertyB='2')",
	parseKeyPredicate : [{
		sPredicate : "(propertyB='2',propertyA='1')",
		oResult : {propertyB : "'2'", propertyA : "'1'"}
	}],
	fetchType : [{
		sMetaPath : "bar",
		oResult : {$Key : ["propertyA", "propertyB"]}
	}],
	buildPath : [{
		sMetaPath : "",
		sCollection : "bar",
		sResult : "bar"
	}]
}, {
	sTarget : "foo(propertyA='1')/bar(propertyB='2',propertyA='1')",
	sResult : "foo('1')/bar(propertyA='1',propertyB='2')",
	parseKeyPredicate : [{
		sPredicate : "(propertyA='1')",
		oResult : {propertyA : "'1'"}
	}, {
		sPredicate : "(propertyB='2',propertyA='1')",
		oResult : {propertyB : "'2'", propertyA : "'1'"}
	}],
	fetchType : [{
		sMetaPath : "foo",
		oResult : {$Key : ["propertyA"]}
	}, {
		sMetaPath : "foo/bar",
		oResult : {$Key : ["propertyA", "propertyB"]}
	}],
	buildPath : [{
		sMetaPath : "",
		sCollection : "foo",
		sResult : "foo"
	}, {
		sMetaPath : "foo",
		sCollection : "bar",
		sResult : "foo/bar"
	}]
}, {
	sTarget : "foo(propertyA='1')/baz/bar(propertyB='2',propertyA='1')",
	sResult : "foo('1')/baz/bar(propertyA='1',propertyB='2')",
	parseKeyPredicate : [{
		sPredicate : "(propertyA='1')",
		oResult : {propertyA : "'1'"}
	}, {
		sPredicate : "(propertyB='2',propertyA='1')",
		oResult : {propertyB : "'2'", propertyA : "'1'"}
	}],
	fetchType : [{
		sMetaPath : "foo",
		oResult : {$Key : ["propertyA"]}
	}, {
		sMetaPath : "foo/baz/bar",
		oResult : {$Key : ["propertyA", "propertyB"]}
	}],
	buildPath : [{
		sMetaPath : "",
		sCollection : "foo",
		sResult : "foo"
	}, {
		sMetaPath : "foo",
		sCollection : "baz",
		sResult : "foo/baz"
	}, {
		sMetaPath : "foo/baz",
		sCollection : "bar",
		sResult : "foo/baz/bar"
	}]
}].forEach(function (oFixture) {
	QUnit.test("normalizeMessageTarget: '" + oFixture.sTarget + "'", function (assert) {
		var oModel = this.createModel(""),
			oMetaModelMock = this.mock(oModel.getMetaModel()),
			oHelperMock = this.mock(_Helper),
			oParserMock = this.mock(_Parser);

		oFixture.parseKeyPredicate.forEach(function (oParameters) {
			oParserMock.expects("parseKeyPredicate").withExactArgs(oParameters.sPredicate)
				.returns(oParameters.oResult);
		});

		oFixture.fetchType.forEach(function (oParameters) {
			oMetaModelMock.expects("getObject")
				.withExactArgs("/" + oParameters.sMetaPath + "/")
				.returns(oParameters.oResult);
		});

		oFixture.buildPath.forEach(function (oParameters) {
			oHelperMock.expects("buildPath")
				.withExactArgs(oParameters.sMetaPath, oParameters.sCollection)
				.returns(oParameters.sResult);
		});

		// code under test
		assert.strictEqual(oModel.normalizeMessageTarget(oFixture.sTarget), oFixture.sResult);
	});
});

	//*********************************************************************************************
	QUnit.test("normalizeMessageTarget: no type found", function (assert) {
		var oModel = this.createModel();

		this.mock(_Parser).expects("parseKeyPredicate").withExactArgs("(propertyA='1')")
			.returns({propertyA : "'1'"});
		this.mock(oModel.getMetaModel()).expects("fetchObject").withExactArgs("/baz/")
			.returns(SyncPromise.resolve(undefined));

		assert.strictEqual(
			// code under test
			oModel.normalizeMessageTarget("baz(propertyA='1')"),
			"baz(propertyA='1')"
		);
	});

	//*********************************************************************************************
	QUnit.test("normalizeMessageTarget: type does not contain keys", function (assert) {
		var oModel = this.createModel(),
			oMetaModelMock = this.mock(oModel.getMetaModel()),
			oParserMock = this.mock(_Parser),
			oTypeFoo = {$Key : ["propertyA", "propertyB"]},
			oTypeBar = {};

		oParserMock.expects("parseKeyPredicate").withExactArgs("(propertyA='1')")
			.returns({propertyA : "'1'"});
		oParserMock.expects("parseKeyPredicate").withExactArgs("(propertyB='2',propertyA='1')")
			.returns({propertyA : "'1'", propertyB : "'2'"});
		oMetaModelMock.expects("getObject").withExactArgs("/foo/").returns(oTypeFoo);
		oMetaModelMock.expects("getObject").withExactArgs("/foo/bar/").returns(oTypeBar);

		assert.strictEqual(
			// code under test
			oModel.normalizeMessageTarget("foo(propertyB='2',propertyA='1')/bar(propertyA='1')"),
			"foo(propertyB='2',propertyA='1')/bar(propertyA='1')"
		);
	});

	//*********************************************************************************************
	QUnit.test("normalizeMessageTarget: %encoding upper vs lower cases", function (assert) {
		var oModel = this.createModel(),
			sResourcePath = "~resourcePath~";

		this.mock(_Parser).expects("parseKeyPredicate").withExactArgs("('foo%2fbar')")
			.returns({"" : "'foo%2fbar'"});

		assert.strictEqual(
			// code under test
			oModel.normalizeMessageTarget("foo('foo%2fbar')", sResourcePath),
			"foo('foo%2Fbar')"
		);
	});

	//*********************************************************************************************
	QUnit.test("normalizeMessageTarget: not matching key predicates", function (assert) {
		var oModel = this.createModel(),
			oMetaModelMock = this.mock(oModel.getMetaModel()),
			oParserMock = this.mock(_Parser),
			oTypeFoo = {$Key : ["propertyA", "propertyB"]},
			oTypeBar = {$Key : ["propertyC"]};

		oParserMock.expects("parseKeyPredicate")
			.withExactArgs("(prop%65rtyB='100%3f',propertyA='200%3f')")
			.returns({"prop%65rtyB" : "'100%3f'", propertyA : "'200%3f'"});
		oParserMock.expects("parseKeyPredicate")
			.withExactArgs("(prop%65rtyC='300')")
			.returns({"prop%65rtyC" : "'300'"});
		oMetaModelMock.expects("getObject").withExactArgs("/foo/").returns(oTypeFoo);
		oMetaModelMock.expects("getObject").withExactArgs("/foo/bar/").returns(oTypeBar);

		assert.strictEqual(
			// code under test
			oModel.normalizeMessageTarget(
				"foo(prop%65rtyB='100%3f',propertyA='200%3f')/bar(prop%65rtyC='300')"),
			"foo(prop%65rtyB='100%3f',propertyA='200%3f')/bar(prop%65rtyC='300')"
		);
	});

	//*********************************************************************************************
	QUnit.test("normalizeMessageTarget: containing '$uid=...' stays untouched", function (assert) {
		var oModel = this.createModel(),
			sResourcePath = "~resourcePath~";

		this.mock(_Parser).expects("parseKeyPredicate").never();
		this.mock(oModel.getMetaModel()).expects("getObject").never();

		assert.strictEqual(
			// code under test
			oModel.normalizeMessageTarget("foo($uid=...)/bar(propertyA='200')", sResourcePath),
			"foo($uid=...)/bar(propertyA='200')"
		);
	});

	//*********************************************************************************************
[
	{iStatus : 204, bSuccess : true},
	{iStatus : 404, bSuccess : true},
	{iStatus : 412, bSuccess : true},
	{iStatus : 500, bSuccess : false},
	{bRejectIfNotFound : true, iStatus : 404, bSuccess : false},
	{bRejectIfNotFound : true, iStatus : 412, bSuccess : false}
].forEach(function (oFixture) {
	[undefined, "group"].forEach(function (sGroupId) {
		[false, true].forEach(function (bServerOnly) {
			var sTitle = "delete: " + JSON.stringify(oFixture) + "; groupId=" + sGroupId
					+ "; server only: " + bServerOnly;

	QUnit.test(sTitle, function (assert) {
		var aAllBindings = [{
				onDelete : function () {}
			}, {
				onDelete : function () {}
			}],
			sCanonicalPath = "/Entity('key')",
			oContext,
			oError = new Error(),
			bInAllBindings = oFixture.bSuccess && !bServerOnly,
			oModel = this.createModel("?sap-client=123"),
			oPromise,
			// w/o If-Match:*, 412 must not be ignored!
			bSuccess = oFixture.bSuccess && !(bServerOnly && oFixture.iStatus === 412);

		oError.status = oFixture.iStatus;
		oModel.aAllBindings = aAllBindings;
		if (bServerOnly) {
			oContext = Context.create(oModel, /*oBinding*/null, sCanonicalPath);
			this.mock(oContext).expects("fetchCanonicalPath").withExactArgs()
				.returns(SyncPromise.resolve(Promise.resolve(sCanonicalPath)));
			this.mock(oContext).expects("fetchValue").withExactArgs("@odata.etag", null, true)
				.returns(SyncPromise.resolve(Promise.resolve("ETag")));
		}
		this.mock(_Helper).expects("checkGroupId").withExactArgs(sGroupId, false, true);
		this.mock(oModel).expects("getUpdateGroupId").exactly(sGroupId ? 0 : 1)
			.withExactArgs().returns("group");
		this.mock(oModel).expects("isApiGroup").withExactArgs("group").returns(false);
		this.mock(_Helper).expects("buildQuery")
			.withExactArgs(sinon.match.same(oModel.mUriParameters))
			.returns("?~");
		this.mock(oModel).expects("lockGroup")
			.withExactArgs("group", sinon.match.same(oModel), true, true)
			.returns("~groupLock~");
		this.mock(oModel.oRequestor).expects("request")
			.withExactArgs("DELETE", "Entity('key')?~", "~groupLock~",
				{"If-Match" : bServerOnly ? "ETag" : "*"})
			.returns(oFixture.iStatus === 204
				? Promise.resolve()
				: Promise.reject(oError));
		this.mock(oModel).expects("reportError").exactly(bSuccess ? 0 : 1)
			.withExactArgs("Failed to delete " + sCanonicalPath, sClassName,
				sinon.match.same(oError));
		this.mock(aAllBindings[0]).expects("onDelete").exactly(bInAllBindings ? 1 : 0)
			.withExactArgs(sCanonicalPath);
		this.mock(aAllBindings[1]).expects("onDelete").exactly(bInAllBindings ? 1 : 0)
			.withExactArgs(sCanonicalPath);

		// code under test
		oPromise = oModel.delete(bServerOnly ? oContext : sCanonicalPath, sGroupId,
			oFixture.bRejectIfNotFound);

		assert.ok(oPromise instanceof Promise);

		return oPromise.then(function () {
				assert.ok(bSuccess);
			}, function (oResult) {
				assert.notOk(bSuccess);
				assert.strictEqual(oResult, oError);
			});
	});
		});
	});
});

	//*********************************************************************************************
[undefined, "group"].forEach(function (sGroupId) {
	QUnit.test("delete: API group " + sGroupId, function (assert) {
		var oModel = this.createModel();

		this.mock(oModel).expects("getUpdateGroupId").exactly(sGroupId ? 0 : 1)
			.withExactArgs().returns("group");
		this.mock(oModel).expects("isApiGroup").withExactArgs("group").returns(true);
		this.mock(oModel.oRequestor).expects("request").never();

		assert.throws(function () {
			// code under test
			oModel.delete("/Entity('key')", sGroupId);
		}, new Error("Illegal update group ID: group"));
	});
});

	//*********************************************************************************************
	QUnit.test("delete: not an absolute path", function (assert) {
		var oModel = this.createModel();

		this.mock(oModel).expects("isApiGroup").never();
		this.mock(oModel).expects("hasPendingChanges").never();
		this.mock(oModel.oRequestor).expects("request").never();

		assert.throws(function () {
			// code under test
			oModel.delete("Entity('key')", "group");
		}, new Error("Invalid path: Entity('key')"));
	});

	//*********************************************************************************************
	QUnit.test("fetchKeyPredicate", function (assert) {
		var oModel = this.createModel(),
			mTypeForMetaPathExpected;

		this.mock(oModel.oRequestor).expects("fetchType")
			.withExactArgs(sinon.match(function (mTypeForMetaPath) {
				mTypeForMetaPathExpected = mTypeForMetaPath;
				return typeof mTypeForMetaPath === "object";
			}), "~metaPath~")
			.returns(SyncPromise.resolve());
		this.mock(_Helper).expects("getKeyPredicate")
			.withExactArgs("~oEntity~", "~metaPath~",
				sinon.match(function (mTypeForMetaPath) {
					return mTypeForMetaPath === mTypeForMetaPathExpected;
				}))
			.returns("~keyPredicate~");

		// code under test
		return oModel.fetchKeyPredicate("~metaPath~", "~oEntity~").then(function (sPredicate) {
			assert.strictEqual(sPredicate, "~keyPredicate~");
		});
	});

	//*********************************************************************************************
	QUnit.test("getKeyPredicate, requestKeyPredicate", function (assert) {
		return TestUtils.checkGetAndRequest(this, this.createModel(), assert, "fetchKeyPredicate",
			["~metapath~", {/*oEntity*/}], true);
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
