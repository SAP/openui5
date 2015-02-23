/*!
 * ${copyright}
 */
(function() {
	/*global asyncTest, deepEqual, equal, expect, module, notDeepEqual,
	notEqual, notStrictEqual, ok, raises, sinon, start, strictEqual, stop, test,
	*/
	"use strict";

	jQuery.sap.require("sap.ui.model.odata.v2.ODataModel");
	jQuery.sap.require("sap.ui.thirdparty.datajs");

	sinon.config.useFakeServer = true;
	// WARNING! These are on by default and break the Promise polyfill...
	sinon.config.useFakeTimers = false;

	function onError(oError) {
		start();
		ok(false, oError.message + ", stack: " + oError.stack);
	}

	function onFailed(oEvent) {
		var oParameters = oEvent.getParameters();
		start();
		while (oParameters.getParameters) { // drill down to avoid circular structure
			oParameters = oParameters.getParameters();
		}
		ok(false, "Failed to load: " + JSON.stringify(oParameters));
	}

	var oDataMetaModel, // single cached instance, see withMetaModel()
		sMetadata = '\
<?xml version="1.0" encoding="utf-8"?>\
<edmx:Edmx Version="1.0"\
	xmlns="http://schemas.microsoft.com/ado/2008/09/edm"\
	xmlns:edmNs4="http://docs.oasis-open.org/odata/ns/edm"\
	xmlns:edmx="http://schemas.microsoft.com/ado/2007/06/edmx"\
	xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata"\
	xmlns:sap="http://www.sap.com/Protocols/SAPData">\
	<edmx:DataServices m:DataServiceVersion="2.0">\
		<Schema Namespace="GWSAMPLE_BASIC" xml:lang="en"\
			sap:schema-version="0000">\
			<EntityType Name="BusinessPartner" sap:content-version="1">\
				<Property Name="BusinessPartnerID" Type="Edm.String"\
					Nullable="false" MaxLength="10" sap:label="Bus. Part. ID"\
					sap:creatable="false" sap:updatable="false">\
					<edmNs4:Annotation Term="com.sap.vocabularies.Common.v1.Label" String="Label via inline annotation" />\
				</Property>\
				<Property Name="NakedProperty" Type="Edm.String"/>\
				<NavigationProperty Name="ToFoo" Relationship="GWSAMPLE_BASIC.Assoc_Foo" FromRole="FromRole_Foo" ToRole="ToRole_Foo" sap:filterable="true"/>\
				<edmNs4:Annotation Term="com.sap.vocabularies.Common.v1.Label" String="Label via inline annotation: Business Partner" />\
			</EntityType>\
			<EntityContainer Name="GWSAMPLE_BASIC_Entities"\
				m:IsDefaultEntityContainer="true" sap:use-batch="false">\
				<EntitySet Name="BusinessPartnerSet" EntityType="GWSAMPLE_BASIC.BusinessPartner"\
					sap:content-version="1" />\
				<AssociationSet Name="Assoc_FooSet" Association="GWSAMPLE_BASIC.Assoc_Foo" sap:creatable="false">\
					<End EntitySet="BusinessPartnerSet" Role="FromRole_Foo"/>\
					<End EntitySet="BusinessPartnerSet" Role="ToRole_Foo"/>\
				</AssociationSet>\
				<FunctionImport Name="Foo" ReturnType="GWSAMPLE_BASIC.BusinessPartner" EntitySet="BusinessPartnerSet" m:HttpMethod="POST" sap:action-for="GWSAMPLE_BASIC.BusinessPartner">\
					<Parameter Name="BusinessPartnerID" Type="Edm.String" Mode="In" MaxLength="10" sap:label="ID"/>\
				</FunctionImport>\
			</EntityContainer>\
			<ComplexType Name="CT_Address">\
				<Property Name="City" Type="Edm.String" MaxLength="40" sap:label="City"/>\
			</ComplexType>\
			<Association Name="Assoc_Foo" sap:content-version="1">\
				<End Type="GWSAMPLE_BASIC.BusinessPartner" Multiplicity="1" Role="FromRole_Foo"/>\
				<End Type="GWSAMPLE_BASIC.BusinessPartner" Multiplicity="*" Role="ToRole_Foo"/>\
			</Association>\
		</Schema>\
	</edmx:DataServices>\
</edmx:Edmx>\
		', sAnnotations = '\
<?xml version="1.0" encoding="utf-8"?>\
<edmx:Edmx Version="4.0"\
	xmlns="http://docs.oasis-open.org/odata/ns/edm"\
	xmlns:edmx="http://docs.oasis-open.org/odata/ns/edmx">\
<edmx:DataServices>\
<Schema Namespace="zanno4sample_anno_mdl.v1">\
<Annotations Target="GWSAMPLE_BASIC.BusinessPartner">\
	<Annotation Term="com.sap.vocabularies.Common.v1.Label" String="Label via external annotation: Business Partner" />\
	<Annotation Term="com.sap.vocabularies.UI.v1.HeaderInfo">\
		<Record Type="com.sap.vocabularies.UI.v1.HeaderInfoType">\
			<PropertyValue Property="TypeName" String="Business Partner"/>\
			<PropertyValue Property="Title">\
				<Record Type="com.sap.vocabularies.UI.v1.DataField">\
					<PropertyValue Property="Label" String="Name"/>\
					<PropertyValue Property="Value">\
						<Apply Function="odata.concat">\
							<Path>CompanyName</Path>\
							<String/>\
							<Path>LegalForm</Path>\
						</Apply>\
					</PropertyValue>\
				</Record>\
			</PropertyValue>\
		</Record>\
	</Annotation>\
</Annotations>\
	<Annotations Target="GWSAMPLE_BASIC.BusinessPartner/BusinessPartnerID">\
		<Annotation Term="Org.OData.Measures.V1.ISOCurrency" Path="CurrencyCode"/>\
	</Annotations>\
</Schema>\
</edmx:DataServices>\
</edmx:Edmx>\
		', sAnnotations2 = '\
<?xml version="1.0" encoding="utf-8"?>\
<edmx:Edmx Version="4.0" xmlns:edmx="http://docs.oasis-open.org/odata/ns/edmx">\
<edmx:DataServices>\
<Schema Namespace="foo" xmlns="http://docs.oasis-open.org/odata/ns/edm">\
<Annotations Target="GWSAMPLE_BASIC">\
	<Annotation Term="acme.Foo.v1.Foo" String="GWSAMPLE_BASIC" />\
</Annotations>\
<Annotations Target="GWSAMPLE_BASIC.Assoc_Foo">\
	<Annotation Term="acme.Foo.v1.Foo" String="GWSAMPLE_BASIC.Assoc_Foo" />\
</Annotations>\
<Annotations Target="GWSAMPLE_BASIC.Assoc_Foo/FromRole_Foo">\
	<Annotation Term="acme.Foo.v1.Foo" String="GWSAMPLE_BASIC.Assoc_Foo/FromRole_Foo" />\
</Annotations>\
<Annotations Target="GWSAMPLE_BASIC.BusinessPartner/ToFoo">\
	<Annotation Term="acme.Foo.v1.Foo" String="GWSAMPLE_BASIC.BusinessPartner/ToFoo" />\
</Annotations>\
<Annotations Target="GWSAMPLE_BASIC.CT_Address">\
	<Annotation Term="acme.Foo.v1.Foo" String="GWSAMPLE_BASIC.CT_Address" />\
</Annotations>\
<Annotations Target="GWSAMPLE_BASIC.CT_Address/City">\
	<Annotation Term="com.sap.vocabularies.Common.v1.Label" String="GWSAMPLE_BASIC.CT_Address/City" />\
</Annotations>\
<Annotations Target="GWSAMPLE_BASIC.GWSAMPLE_BASIC_Entities">\
	<Annotation Term="acme.Foo.v1.Foo" String="GWSAMPLE_BASIC.GWSAMPLE_BASIC_Entities" />\
</Annotations>\
<Annotations Target="GWSAMPLE_BASIC.GWSAMPLE_BASIC_Entities/Assoc_FooSet">\
	<Annotation Term="acme.Foo.v1.Foo" String="GWSAMPLE_BASIC.GWSAMPLE_BASIC_Entities/Assoc_FooSet" />\
</Annotations>\
<Annotations Target="GWSAMPLE_BASIC.GWSAMPLE_BASIC_Entities/Assoc_FooSet/FromRole_Foo">\
	<Annotation Term="acme.Foo.v1.Foo" String="GWSAMPLE_BASIC.GWSAMPLE_BASIC_Entities/Assoc_FooSet/FromRole_Foo" />\
</Annotations>\
<Annotations Target="GWSAMPLE_BASIC.GWSAMPLE_BASIC_Entities/BusinessPartnerSet">\
	<Annotation Term="acme.Foo.v1.Foo" String="GWSAMPLE_BASIC.GWSAMPLE_BASIC_Entities/BusinessPartnerSet" />\
</Annotations>\
<Annotations Target="GWSAMPLE_BASIC.GWSAMPLE_BASIC_Entities/Foo">\
	<Annotation Term="acme.Foo.v1.Foo" String="GWSAMPLE_BASIC.GWSAMPLE_BASIC_Entities/Foo" />\
</Annotations>\
<Annotations Target="GWSAMPLE_BASIC.GWSAMPLE_BASIC_Entities/Foo/BusinessPartnerID">\
	<Annotation Term="acme.Foo.v1.Foo" String="GWSAMPLE_BASIC.GWSAMPLE_BASIC_Entities/Foo/BusinessPartnerID" />\
</Annotations>\
</Schema>\
</edmx:DataServices>\
</edmx:Edmx>\
		', sEmptyAnnotations = '\
<?xml version="1.0" encoding="utf-8"?>\
<edmx:Edmx Version="4.0" xmlns:edmx="http://docs.oasis-open.org/odata/ns/edmx">\
<edmx:DataServices>\
<Schema Namespace="foo" xmlns="http://docs.oasis-open.org/odata/ns/edm"/>\
</edmx:DataServices>\
</edmx:Edmx>\
		', sEmptyMetadata = '\
<?xml version="1.0" encoding="utf-8"?>\
<edmx:Edmx Version="1.0"\
	xmlns:edmx="http://schemas.microsoft.com/ado/2007/06/edmx"\
	/>\
		', sEmptyDataServices = '\
<?xml version="1.0" encoding="utf-8"?>\
<edmx:Edmx Version="1.0"\
	xmlns:edmx="http://schemas.microsoft.com/ado/2007/06/edmx"\
	xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata"\
	>\
	<edmx:DataServices m:DataServiceVersion="2.0"/>\
</edmx:Edmx>\
		', sEmptySchema = '\
<?xml version="1.0" encoding="utf-8"?>\
<edmx:Edmx Version="1.0"\
	xmlns="http://schemas.microsoft.com/ado/2008/09/edm"\
	xmlns:edmx="http://schemas.microsoft.com/ado/2007/06/edmx"\
	xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata"\
	>\
	<edmx:DataServices m:DataServiceVersion="2.0">\
		<Schema Namespace="GWSAMPLE_BASIC" xml:lang="en"/>\
	</edmx:DataServices>\
</edmx:Edmx>\
		', sEmptyEntityType = '\
<?xml version="1.0" encoding="utf-8"?>\
<edmx:Edmx Version="1.0"\
	xmlns="http://schemas.microsoft.com/ado/2008/09/edm"\
	xmlns:edmx="http://schemas.microsoft.com/ado/2007/06/edmx"\
	xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata"\
	xmlns:sap="http://www.sap.com/Protocols/SAPData">\
	<edmx:DataServices m:DataServiceVersion="2.0">\
		<Schema Namespace="GWSAMPLE_BASIC" xml:lang="en"\
			sap:schema-version="0000">\
			<EntityType Name="BusinessPartner" sap:content-version="1"/>\
			<EntityContainer Name="GWSAMPLE_BASIC_Entities"\
				m:IsDefaultEntityContainer="true">\
				<EntitySet Name="BusinessPartnerSet" EntityType="GWSAMPLE_BASIC.BusinessPartner"\
					sap:content-version="1" />\
			</EntityContainer>\
		</Schema>\
	</edmx:DataServices>\
</edmx:Edmx>\
		',
		sGWAnnotations = jQuery.sap.syncGetText("model/GWSAMPLE_BASIC.annotations.xml", "", null),
		sGWMetadata = jQuery.sap.syncGetText("model/GWSAMPLE_BASIC.metadata.xml", "", null),
		mHeaders = {"Content-Type" : "application/xml"},
		mFixture = {
			"/fake/emptyDataServices/$metadata" : [200, mHeaders, sEmptyDataServices],
			"/fake/emptyEntityType/$metadata" : [200, mHeaders, sEmptyEntityType],
			"/fake/emptyMetadata/$metadata" : [200, mHeaders, sEmptyDataServices],
			"/fake/emptySchema/$metadata" : [200, mHeaders, sEmptySchema],
			"/fake/service/$metadata" : [200, mHeaders, sMetadata],
			//TODO separate test for V4 metadata with inline annotations
			"/fake/annotations" : [200, mHeaders, sAnnotations],
			//TODO cleanup GWSAMPLE_BASIC.BusinessPartner/BusinessPartnerID (artificial example)
			"/fake/annotations2" : [200, mHeaders, sAnnotations2],
			"/fake/emptyAnnotations" : [200, mHeaders, sEmptyAnnotations],
			"/GWSAMPLE_BASIC/$metadata" : [200, mHeaders, sGWMetadata],
			"/GWSAMPLE_BASIC/annotations" : [200, mHeaders, sGWAnnotations]
		};

	/**
	 * Sets up the given sandbox in order to use the URLs and responses defined in mFixture;
	 * leaves unknown URLs alone.
	 *
	 * @param {object} oSandbox
	 *   <a href ="http://sinonjs.org/docs/#sandbox">a Sinon.JS sandbox</a>
	 */
	function setupSandbox(oSandbox) {
		var oServer = oSandbox.useFakeServer();

		//TODO how to properly tear down this stuff?
		sinon.FakeXMLHttpRequest.useFilters = true;
		sinon.FakeXMLHttpRequest.addFilter(function(sMethod, sUrl, bAsync) {
			return mFixture[sUrl] === undefined; // do not fake if URL is unknown
		});

		jQuery.each(mFixture, function(sUrl, vResponse) {
			oServer.respondWith(sUrl, vResponse);
		});
		oServer.autoRespond = true;
	}

	/**
	 * Runs the given code under test with an <code>ODataMetaModel</code>.
	 *
	 * @param {function} fnCodeUnderTest
	 * @param {boolean} bImmediately
	 *   whether to run the test immediately instead of waiting for the meta model to be loaded
	 */
	function withMetaModel(fnCodeUnderTest, bImmediately) {
		var oMetaModel,
			oModel,
			oSandbox; // <a href ="http://sinonjs.org/docs/#sandbox">a Sinon.JS sandbox</a>

		/*
		 * Call the given "code under test" with the given OData meta model, making sure that
		 * no changes to the model are kept in the cached singleton.
		 */
		function call(fnCodeUnderTest, oDataMetaModel) {
			var sCopy = oDataMetaModel.oModel.getJSON();

			try {
				fnCodeUnderTest(oDataMetaModel);
			} finally {
				oDataMetaModel.oModel.setJSON(sCopy);
			}
		}

		// Note: bImmediately requires a fresh instance
		if (oDataMetaModel && !bImmediately) {
			call(fnCodeUnderTest, oDataMetaModel);
			return;
		}

		try {
			oSandbox = sinon.sandbox.create();
			setupSandbox(oSandbox);

			// sets up a v2 ODataModel and retrieves an ODataMetaModel from there
			oModel = new sap.ui.model.odata.v2.ODataModel("/GWSAMPLE_BASIC", {
				annotationURI : "/GWSAMPLE_BASIC/annotations",
				json : true,
				loadMetadataAsync : true
			});
			oModel.attachMetadataFailed(onFailed);
			oModel.attachAnnotationsFailed(onFailed);

			if (bImmediately) {
				// no caching, no undo of modifications!
				fnCodeUnderTest(oModel.getMetaModel());
			} else {
				// calls the code under test once the meta model has loaded
				oDataMetaModel = oModel.getMetaModel();
				stop();
				oDataMetaModel.loaded().then(function() {
					call(fnCodeUnderTest, oDataMetaModel);
					start();
				}, onError)["catch"](onError);
			}
		} finally {
			oSandbox.restore();
		}
	}

	//*********************************************************************************************
	module("sap.ui.model.odata.ODataMetaModel", {
		teardown : function () {
			sap.ui.model.odata.v2.ODataModel.mServiceData = {}; // clear cache
		}
	});

	//*********************************************************************************************
	asyncTest("functions using 'this.oModel' directly", function() {
		withMetaModel(function (oMetaModel) {
			// call functions before loaded() promise has been resolved
			throws(function () {
				oMetaModel._getObject("/");
			}, "_getObject")
			throws(function () {
				oMetaModel.destroy();
			}, "destroy")
			throws(function () {
				oMetaModel.getODataAssociationEnd({
					"navigationProperty" : [{
						"name" : "ToSalesOrders",
						"relationship" : "GWSAMPLE_BASIC.Assoc_BusinessPartner_SalesOrders",
						"fromRole" : "FromRole_Assoc_BusinessPartner_SalesOrders",
						"toRole" : "ToRole_Assoc_BusinessPartner_SalesOrders"
					}]
				}, "ToSalesOrders");
			}, "getODataAssociationEnd")
			throws(function () {
				oMetaModel.getODataComplexType("don't care");
			}, "getODataComplexType")
			throws(function () {
				oMetaModel.getODataEntityContainer();
			}, "getODataEntityContainer")
			throws(function () {
				oMetaModel.getODataEntityType("don't care");
			}, "getODataEntityType")
			throws(function () {
				oMetaModel.isList();
			}, "isList")

			oMetaModel.loaded().then(function() {
				start();
			}, onError)["catch"](onError);
		}, true);
	});

	//*********************************************************************************************
	asyncTest("basics", function() {
		var oMetaModel = new sap.ui.model.odata.ODataMetaModel({
				getServiceMetadata : function () { return {dataServices : {}}; },
				isLoaded : function () { return true; }
			});

		oMetaModel.loaded().then(sinon.test(function() {
			var oMetaModelMock = this.mock(oMetaModel),
				oModelMock = this.mock(oMetaModel.oModel),
				oResult = {};

			start();
			this.mock(sap.ui.model.Model.prototype).expects("destroy").once();
			// do not mock/stub this or else "destroy" will not bubble up!
			this.spy(sap.ui.model.MetaModel.prototype, "destroy");

			// generic dispatching
			jQuery.each(["destroy", "isList"], function (i, sName) {
				oModelMock.expects(sName).once().withExactArgs("foo", 0, false).returns(oResult);

				strictEqual(oMetaModel[sName]("foo", 0, false), oResult, sName);
			});

			// getProperty dispatches to _getObject
			oMetaModelMock.expects("_getObject").once().withExactArgs("foo", 0, false)
				.returns(oResult);
			strictEqual(oMetaModel.getProperty("foo", 0, false), oResult, "getProperty");

			ok(sap.ui.model.MetaModel.prototype.destroy.calledOnce);

			raises(function () {
				oMetaModel.refresh();
			}, /Unsupported operation: ODataMetaModel#refresh/);

			oMetaModel.setLegacySyntax(); // allowed
			oMetaModel.setLegacySyntax(false); // allowed
			raises(function () {
				oMetaModel.setLegacySyntax(true);
			}, /Legacy syntax not supported by ODataMetaModel/);

			strictEqual(oMetaModel.getDefaultBindingMode(), sap.ui.model.BindingMode.OneTime);
			strictEqual(oMetaModel.oModel.getDefaultBindingMode(), sap.ui.model.BindingMode.OneTime);
			raises(function () {
				oMetaModel.setDefaultBindingMode(sap.ui.model.BindingMode.OneWay);
			});
			raises(function () {
				oMetaModel.setDefaultBindingMode(sap.ui.model.BindingMode.TwoWay);
			});
		}).apply({/*give Sinon a "this" to enrich*/}), onError)["catch"](onError);
	});

	//*********************************************************************************************
	test("bindings", function() {
		withMetaModel(function (oMetaModel) {
			var oBinding,
				oContext = oMetaModel.createBindingContext("/foo"),
				aFilters = [],
				mParameters = {},
				sPath = "some/relative/path",
				aSorters = [];

			// Note: support for events not needed
			oBinding = oMetaModel.bindContext(sPath, oContext, mParameters);
			ok(oBinding instanceof sap.ui.model.ClientContextBinding);
			strictEqual(oBinding.getModel(), oMetaModel);
			strictEqual(oBinding.getPath(), sPath);
			strictEqual(oBinding.getContext(), oContext);
			strictEqual(oBinding.mParameters, mParameters);

			oBinding = oMetaModel.bindProperty(sPath, oContext, mParameters);
			ok(oBinding instanceof sap.ui.model.json.JSONPropertyBinding);
			strictEqual(oBinding.getModel(), oMetaModel);
			strictEqual(oBinding.getPath(), sPath);
			strictEqual(oBinding.getContext(), oContext);
			strictEqual(oBinding.mParameters, mParameters);

			raises(function () {
				oBinding.setValue("foo");
			}, /Unsupported operation: ODataMetaModel#setProperty/);

			oBinding = oMetaModel.bindList(sPath, oContext, aSorters, aFilters, mParameters);
			ok(oBinding instanceof sap.ui.model.json.JSONListBinding);
			strictEqual(oBinding.getModel(), oMetaModel, "inner model not leaked");
			strictEqual(oBinding.getPath(), sPath);
			strictEqual(oBinding.getContext(), oContext);
			strictEqual(oBinding.aSorters, aSorters);
			strictEqual(oBinding.aApplicationFilters, aFilters); //TODO spy on ListBinding instead?
			strictEqual(oBinding.mParameters, mParameters);

			oBinding = oMetaModel.bindTree(sPath, oContext, aFilters, mParameters);
			ok(oBinding instanceof sap.ui.model.json.JSONTreeBinding);
			strictEqual(oBinding.getModel(), oMetaModel);
			strictEqual(oBinding.getPath(), sPath);
			strictEqual(oBinding.getContext(), oContext);
			strictEqual(oBinding.aFilters, aFilters);
			strictEqual(oBinding.mParameters, mParameters);
		});
	});

	//*********************************************************************************************
	test("_getObject", function () {
		withMetaModel(function (oMetaModel) {
			var oContext;

			// w/o context
			strictEqual(oMetaModel._getObject(""), null);
			strictEqual(oMetaModel._getObject("/"), oMetaModel.oModel._getObject("/"));
			strictEqual(oMetaModel._getObject("/foo"), undefined);
			strictEqual(oMetaModel._getObject("/dataServices"),
				oMetaModel.oModel._getObject("/dataServices"));
			strictEqual(oMetaModel._getObject("/dataServices/schema"),
				oMetaModel.oModel._getObject("/dataServices/schema"));

			// with sap.ui.model.Context
			oContext = oMetaModel.getContext("/dataServices/schema");
			strictEqual(oMetaModel._getObject(undefined, oContext),
				oMetaModel.oModel._getObject("/dataServices/schema"));
			oContext = oMetaModel.getContext("/dataServices");
			strictEqual(oMetaModel._getObject("schema", oContext),
				oMetaModel.oModel._getObject("/dataServices/schema"));

			// with object context
			oContext = oMetaModel._getObject("/dataServices");
			strictEqual(oMetaModel._getObject("schema", oContext),
				oMetaModel.oModel._getObject("/dataServices/schema"));
			oContext = oMetaModel._getObject("/dataServices/schema");
			strictEqual(oMetaModel._getObject(undefined, oContext),
				oMetaModel.oModel._getObject("/dataServices/schema"));
			// absolute path wins over object context
			oContext = oMetaModel._getObject("/dataServices/schema/0/entityType/0");
			strictEqual(oMetaModel._getObject("/dataServices/schema/0/entityType/1", oContext),
				oMetaModel.oModel._getObject("/dataServices/schema/0/entityType/1"));
		});
	});

	//*********************************************************************************************
	jQuery.each([false, true], function (i, bIsLoggable) {
		test("_getObject: warning w/o context, log = " + bIsLoggable, function () {
			// Note: this only works in case withMetaModel() is synchronous
			var oLogMock = this.mock(jQuery.sap.log);

			oLogMock.expects("isLoggable").once()
				.withExactArgs(jQuery.sap.log.Level.WARNING)
				.returns(bIsLoggable);
			oLogMock.expects("warning")
				.exactly(bIsLoggable ? 1 : 0) // do not construct arguments in vain!
				.withExactArgs("Invalid part: bar", "path: /foo/bar, context: undefined",
					"sap.ui.model.odata.ODataMetaModel");

			withMetaModel(function (oMetaModel) {
				strictEqual(oMetaModel._getObject("/foo/bar"), undefined);
			});
		});

		test("_getObject: warning with sap.ui.model.Context, log = " + bIsLoggable, function () {
			// Note: this only works in case withMetaModel() is synchronous
			var oLogMock = this.mock(jQuery.sap.log);

			oLogMock.expects("isLoggable").once()
				.withExactArgs(jQuery.sap.log.Level.WARNING)
				.returns(bIsLoggable);
			oLogMock.expects("warning")
				.exactly(bIsLoggable ? 1 : 0) // do not construct arguments in vain!
				.withExactArgs("Invalid part: relative",
					"path: some/relative/path, context: /dataServices/schema/0/entityType/0",
					"sap.ui.model.odata.ODataMetaModel");

			withMetaModel(function (oMetaModel) {
				var oContext = oMetaModel.getContext("/dataServices/schema/0/entityType/0");
				strictEqual(oMetaModel._getObject("some/relative/path", oContext), undefined);
			});
		});

		test("_getObject: warning with object context, log = " + bIsLoggable, function () {
			// Note: this only works in case withMetaModel() is synchronous
			var oLogMock = this.mock(jQuery.sap.log);

			oLogMock.expects("isLoggable").once()
				.withExactArgs(jQuery.sap.log.Level.WARNING)
				.returns(bIsLoggable);
			oLogMock.expects("warning")
				.exactly(bIsLoggable ? 1 : 0) // do not construct arguments in vain!
				.withExactArgs("Invalid part: relative",
					"path: some/relative/path, context: [object Object]",
					"sap.ui.model.odata.ODataMetaModel");

			withMetaModel(function (oMetaModel) {
				var oContext = oMetaModel._getObject("/dataServices/schema/0/entityType/0");
				strictEqual(oMetaModel._getObject("some/relative/path", oContext), undefined);
			});
		});
	});

	//*********************************************************************************************
	test("_getObject: Invalid relative path w/o context", function () {
		// Note: this only works in case withMetaModel() is synchronous
		this.mock(jQuery.sap.log).expects("error").once().withExactArgs(
			"Invalid relative path w/o context",
			"some/relative/path",
			"sap.ui.model.odata.ODataMetaModel");

		withMetaModel(function (oMetaModel) {
			strictEqual(oMetaModel._getObject("some/relative/path"), null);
		});
	});

	//*********************************************************************************************
	jQuery.each([{
		annotationURI : null,
		title : "no annotations"
	}, {
		annotationURI : "/fake/annotations",
		title : "one annotation file"
	}, {
		annotationURI : ["/fake/annotations", "/fake/annotations2"],
		title : "multiple annotation files"
	}], function (i, oFixture) {
		asyncTest("ODataMetaModel loaded: " + oFixture.title, function() {
			var oMetaModel, oModel;

			setupSandbox(this.sandbox);
			oModel = new sap.ui.model.odata.v2.ODataModel("/fake/service", {
				annotationURI : oFixture.annotationURI,
				json : true,
				loadMetadataAsync : true
			});
			oModel.attachMetadataFailed(onFailed);
			oModel.attachAnnotationsFailed(onFailed);

			oMetaModel = oModel.getMetaModel();
			ok(oMetaModel instanceof sap.ui.model.odata.ODataMetaModel);

			oMetaModel.loaded().then(function() {
				var oAnnotations = oModel.getServiceAnnotations(),
					oMetadata = oModel.getServiceMetadata(),
					oMetaModelData = oMetaModel.getObject("/"),
					oGWSampleBasic = oMetaModelData.dataServices.schema[0],
					oEntityContainer = oGWSampleBasic.entityContainer[0],
					oAssociation = oGWSampleBasic.association[0],
					oAssociationEnd = oAssociation.end[0],
					oAssociationSet = oEntityContainer.associationSet[0],
					oBusinessPartner = oGWSampleBasic.entityType[0],
					oBusinessPartnerId = oBusinessPartner.property[0],
					oBusinessPartnerSet = oEntityContainer.entitySet[0],
					oCTAddress = oGWSampleBasic.complexType[0],
					oCTAddressCity = oCTAddress.property[0],
					oFunctionImport = oEntityContainer.functionImport[0],
					oNavigationProperty = oBusinessPartner.navigationProperty[0],
					oParameter = oFunctionImport.parameter[0],
					sSAPData = "http://www.sap.com/Protocols/SAPData";

				start();
				strictEqual(oBusinessPartner.name, "BusinessPartner");
				strictEqual(oBusinessPartnerId.name, "BusinessPartnerID");

				strictEqual(arguments.length, 1, "almost no args");
				deepEqual(arguments[0], undefined, "almost no args");
				ok(oMetadata, "metadata is loaded");

				strictEqual(oBusinessPartner.$path, "/dataServices/schema/0/entityType/0");
				delete oBusinessPartner.$path;

				deepEqual(oGWSampleBasic["sap:schema-version"], "0000");
				delete oGWSampleBasic["sap:schema-version"];

				deepEqual(oBusinessPartner["sap:content-version"], "1");
				delete oBusinessPartner["sap:content-version"];

				deepEqual(oBusinessPartnerId["sap:label"], "Bus. Part. ID");
				delete oBusinessPartnerId["sap:label"];
				deepEqual(oBusinessPartnerId["sap:creatable"], "false");
				delete oBusinessPartnerId["sap:creatable"];
				deepEqual(oBusinessPartnerId["sap:updatable"], "false");
				delete oBusinessPartnerId["sap:updatable"];

				strictEqual(oCTAddress.$path, "/dataServices/schema/0/complexType/0", "$path");
				delete oCTAddress.$path;

				deepEqual(oCTAddressCity["sap:label"], "City");
				delete oCTAddressCity["sap:label"];

				deepEqual(oAssociation["sap:content-version"], "1");
				delete oAssociation["sap:content-version"];

				strictEqual(oAssociation.$path, "/dataServices/schema/0/association/0");
				delete oAssociation.$path;

				deepEqual(oAssociationSet["sap:creatable"], "false");
				delete oAssociationSet["sap:creatable"];

				deepEqual(oBusinessPartnerSet["sap:content-version"], "1");
				delete oBusinessPartnerSet["sap:content-version"];

				deepEqual(oEntityContainer["sap:use-batch"], "false");
				delete oEntityContainer["sap:use-batch"];

				strictEqual(oEntityContainer.$path, "/dataServices/schema/0/entityContainer/0");
				delete oEntityContainer.$path;

				deepEqual(oFunctionImport["sap:action-for"], "GWSAMPLE_BASIC.BusinessPartner");
				delete oFunctionImport["sap:action-for"];

				deepEqual(oParameter["sap:label"], "ID");
				delete oParameter["sap:label"];

				deepEqual(oNavigationProperty["sap:filterable"], "true");
				delete oNavigationProperty["sap:filterable"];

				if (i > 0) {
					ok(oAnnotations, "annotations are also loaded");

					deepEqual(oBusinessPartnerId["Org.OData.Measures.V1.ISOCurrency"], {
						"Path" : "CurrencyCode"
					});
					delete oBusinessPartnerId["Org.OData.Measures.V1.ISOCurrency"];

					deepEqual(oBusinessPartner["com.sap.vocabularies.Common.v1.Label"], {
						"String" : "Label via external annotation: Business Partner"
					});
					delete oBusinessPartner["com.sap.vocabularies.Common.v1.Label"];

					deepEqual(oBusinessPartner["com.sap.vocabularies.UI.v1.HeaderInfo"], {
						"RecordType" : "com.sap.vocabularies.UI.v1.HeaderInfoType",
						"Title" : {
							"Label" : {
								"String" : "Name"
							},
							"RecordType" : "com.sap.vocabularies.UI.v1.DataField",
							"Value" : {
								"Apply" : {
									"Name" : "odata.concat",
									"Parameters" : [{
										"Type" : "Path",
										"Value" : "CompanyName"
									}, {
										"Type" : "String",
										"Value" : ""
									}, {
										"Type" : "Path",
										"Value" : "LegalForm"
									}]
								}
							}
						},
						"TypeName" : {
							"String" : "Business Partner"
						}
					});
					delete oBusinessPartner["com.sap.vocabularies.UI.v1.HeaderInfo"];

					if (i > 1) { // additional tests for 2nd annotations file
						// schema
						deepEqual(oGWSampleBasic["acme.Foo.v1.Foo"], {
							"String" : "GWSAMPLE_BASIC"
						});
						delete oGWSampleBasic["acme.Foo.v1.Foo"];
						// entity type: navigation property
						deepEqual(oNavigationProperty["acme.Foo.v1.Foo"], {
							"String" : "GWSAMPLE_BASIC.BusinessPartner/ToFoo"
						});
						delete oNavigationProperty["acme.Foo.v1.Foo"];
						// complex type
						deepEqual(oCTAddress["acme.Foo.v1.Foo"], {
							"String" : "GWSAMPLE_BASIC.CT_Address"
						});
						delete oCTAddress["acme.Foo.v1.Foo"];
						// complex type: property
						deepEqual(oCTAddressCity["com.sap.vocabularies.Common.v1.Label"], {
							"String" : "GWSAMPLE_BASIC.CT_Address/City"
						});
						delete oCTAddressCity["com.sap.vocabularies.Common.v1.Label"];
						// association
						deepEqual(oAssociation["acme.Foo.v1.Foo"], {
							"String" : "GWSAMPLE_BASIC.Assoc_Foo"
						});
						delete oAssociation["acme.Foo.v1.Foo"];
						// association: end
						deepEqual(oAssociationEnd["acme.Foo.v1.Foo"], {
							"String" : "GWSAMPLE_BASIC.Assoc_Foo/FromRole_Foo"
						});
						delete oAssociationEnd["acme.Foo.v1.Foo"];
						// entity container
						deepEqual(oEntityContainer["acme.Foo.v1.Foo"], {
							"String" : "GWSAMPLE_BASIC.GWSAMPLE_BASIC_Entities"
						});
						delete oEntityContainer["acme.Foo.v1.Foo"];
						// entity container: association set
						deepEqual(oAssociationSet["acme.Foo.v1.Foo"], {
							"String" : "GWSAMPLE_BASIC.GWSAMPLE_BASIC_Entities/Assoc_FooSet"
						});
						delete oAssociationSet["acme.Foo.v1.Foo"];
						// Note: "entity container: association set: end" is not needed!
						// entity container: entity set
						deepEqual(oBusinessPartnerSet["acme.Foo.v1.Foo"], {
							"String" : "GWSAMPLE_BASIC.GWSAMPLE_BASIC_Entities/BusinessPartnerSet"
						});
						delete oBusinessPartnerSet["acme.Foo.v1.Foo"];
						// entity container: function import
						deepEqual(oFunctionImport["acme.Foo.v1.Foo"], {
							"String" : "GWSAMPLE_BASIC.GWSAMPLE_BASIC_Entities/Foo"
						});
						delete oFunctionImport["acme.Foo.v1.Foo"];
						// entity container: function import: parameter
						deepEqual(oParameter["acme.Foo.v1.Foo"], {
							"String"
								: "GWSAMPLE_BASIC.GWSAMPLE_BASIC_Entities/Foo/BusinessPartnerID"
						});
						delete oParameter["acme.Foo.v1.Foo"];
					}
				}

				deepEqual(oMetaModelData, oMetadata, "nothing else left...");
			}, onError)["catch"](onError);
		});
	});

	//*********************************************************************************************
	jQuery.each([false, true, false, true], function (i, bAsync) {
		asyncTest("Error loading" + (i < 2 ? " meta data" : " annotations" )
				+ ", async: " + bAsync, function() {
			var oModel,
				sMetadataURL = i < 2 ? "/invalid/service" : "/fake/service",
				sAnnotationsURL = i < 2 ? "" : "/invalid/annotations",
				fnConstructor = bAsync
					? sap.ui.model.odata.v2.ODataModel
					: sap.ui.model.odata.ODataModel;

			setupSandbox(this.sandbox);
			oModel = new fnConstructor(sMetadataURL, {
				annotationURI : sAnnotationsURL,
				json : true
			});

			// code under test
			oModel.getMetaModel().loaded().then(function () {
				start();
				ok(false, "not expected");
			}, function (ex) {
				start();
				ok(ex instanceof Error);
				ok(/Error loading meta model/.test(ex.message), ex.message);
				ok(true, "error handler called as expected");
			})["catch"](onError);
		});
	});

	//*********************************************************************************************
	jQuery.each(["annotations", "emptyAnnotations"], function (i, sAnnotation) {
		jQuery.each(["emptyMetadata", "emptyDataServices", "emptySchema", "emptyEntityType"],
			function (j, sPath) {
				asyncTest(sAnnotation + ", " + sPath, function() {
					var oMetaModel, oModel;

					setupSandbox(this.sandbox);
					oModel = new sap.ui.model.odata.v2.ODataModel("/fake/" + sPath, {
						// annotations are mandatory for this test case
						annotationURI : "/fake/" + sAnnotation,
						json : true
					});

					// code under test
					oMetaModel = oModel.getMetaModel();
					oMetaModel.loaded().then(function () {
						start();
						ok(true, "expected");

						// check that no errors happen for empty/missing structures
						strictEqual(oMetaModel.getODataEntityType("GWSAMPLE_BASIC.Product"),
							null, "getODataEntityType");
						strictEqual(oMetaModel.getODataEntityType("GWSAMPLE_BASIC.Product", true),
							undefined, "getODataEntityType as path");
						strictEqual(oMetaModel.getODataEntitySet("ProductSet"), null,
							"getODataEntitySet");
						strictEqual(oMetaModel.getODataEntitySet("ProductSet", true), undefined,
							"getODataEntitySet as path");
					}, onError)["catch"](onError);
				});
			}
		);
	});

	//*********************************************************************************************
	test("getODataEntityContainer", function() {
		withMetaModel(function (oMetaModel) {
			strictEqual(oMetaModel.getODataEntityContainer(),
				oMetaModel.getObject("/dataServices/schema/0/entityContainer/0"));
		});
	});

	//*********************************************************************************************
	test("getODataEntityContainer as path", function() {
		withMetaModel(function (oMetaModel) {
			strictEqual(oMetaModel.getODataEntityContainer(true),
				"/dataServices/schema/0/entityContainer/0");
		});
	});

	//*********************************************************************************************
	test("getODataEntitySet", function() {
		withMetaModel(function (oMetaModel) {
			strictEqual(oMetaModel.getODataEntitySet("ProductSet"),
				oMetaModel.getObject("/dataServices/schema/0/entityContainer/0/entitySet/1"));
			strictEqual(oMetaModel.getODataEntitySet("FooSet"), null);
			strictEqual(oMetaModel.getODataEntitySet(), null);
		});
	});

	//*********************************************************************************************
	test("getODataEntitySet as path", function() {
		withMetaModel(function (oMetaModel) {
			strictEqual(oMetaModel.getODataEntitySet("ProductSet", true),
				"/dataServices/schema/0/entityContainer/0/entitySet/1");
			strictEqual(oMetaModel.getODataEntitySet("FooSet", true), undefined);
			strictEqual(oMetaModel.getODataEntitySet(undefined, true), undefined);
		});
	});
	//TODO test with multiple schemas; what if there is no default entity container?
	/*
	 * http://www.odata.org/documentation/odata-version-2-0/overview/ says about
	 * "IsDefaultEntityContainer":
	 * "A CSDL document may include many Entity Containers; this attribute is used by data services
	 * to indicate the default container. As described in [OData:URI], Entities in the default
	 * container do not need to be container-qualified when addressed in URIs.This attribute may be
	 * present on any element in a CSDL document"
	 * e.g. "GWSAMPLE_BASIC_Entities.ProductSet"
	 *
	 * http://docs.oasis-open.org/odata/odata/v4.0/odata-v4.0-part3-csdl.html
	 * "13 Entity Container" says
	 * "Each metadata document used to describe an OData service MUST define exactly one entity
	 * container." But then again, there is "13.1.2 Attribute Extends"...
	 *
	 * ==> SAP Gateway supports a single entity container only, and OData v4 has been adjusted
	 * accordingly.
	 */

	//*********************************************************************************************
	test("getODataComplexType", function() {
		withMetaModel(function (oMetaModel) {
			strictEqual(oMetaModel.getODataComplexType("GWSAMPLE_BASIC.CT_Address"),
					oMetaModel.getObject("/dataServices/schema/0/complexType/0"));
			strictEqual(oMetaModel.getODataComplexType("FOO.CT_Address"), null);
			strictEqual(oMetaModel.getODataComplexType("GWSAMPLE_BASIC.Foo"), null);
			strictEqual(oMetaModel.getODataComplexType("GWSAMPLE_BASIC"), null);
			strictEqual(oMetaModel.getODataComplexType(), null);
		});
	});

	//*********************************************************************************************
	test("getODataEntityType", function() {
		withMetaModel(function (oMetaModel) {
			strictEqual(oMetaModel.getODataEntityType("GWSAMPLE_BASIC.Product"),
				oMetaModel.getObject("/dataServices/schema/0/entityType/1"));
			strictEqual(oMetaModel.getODataEntityType("FOO.Product"), null);
			strictEqual(oMetaModel.getODataEntityType("GWSAMPLE_BASIC.Foo"), null);
			strictEqual(oMetaModel.getODataEntityType("GWSAMPLE_BASIC"), null);
			strictEqual(oMetaModel.getODataEntityType(), null);

			// change the namespace to contain a dot
			oMetaModel.getObject("/dataServices/schema/0").namespace = "GWSAMPLE.BASIC";
			strictEqual(oMetaModel.getODataEntityType("GWSAMPLE.BASIC.Product"),
				oMetaModel.getObject("/dataServices/schema/0/entityType/1"));
		});
	});

	//*********************************************************************************************
	test("getODataEntityType as path", function() {
		withMetaModel(function (oMetaModel) {
			strictEqual(oMetaModel.getODataEntityType("GWSAMPLE_BASIC.Product", true),
				"/dataServices/schema/0/entityType/1");
			strictEqual(oMetaModel.getODataEntityType("FOO.Product", true), undefined);
			strictEqual(oMetaModel.getODataEntityType("GWSAMPLE_BASIC.Foo", true), undefined);
			strictEqual(oMetaModel.getODataEntityType("GWSAMPLE_BASIC", true), undefined);
			strictEqual(oMetaModel.getODataEntityType(undefined, true), undefined);
		});
	});

	//*********************************************************************************************
	test("getODataAssociationEnd", function() {
		withMetaModel(function (oMetaModel) {
			var oEntityType = oMetaModel.getODataEntityType("GWSAMPLE_BASIC.Product");

			strictEqual(oMetaModel.getODataAssociationEnd(oEntityType, "ToSupplier"),
				oMetaModel.getObject("/dataServices/schema/0/association/5/end/0"));
			strictEqual(oMetaModel.getODataAssociationEnd(oEntityType, "ToFoo"), null);
			strictEqual(oMetaModel.getODataAssociationEnd(null, "ToSupplier"), null);
			strictEqual(oMetaModel.getODataAssociationEnd({}, "ToSupplier"), null);
		});
	});

	//*********************************************************************************************
	test("getODataAssociation*Set*End", function() {
		withMetaModel(function (oMetaModel) {
			var oEntityType = oMetaModel.getODataEntityType("GWSAMPLE_BASIC.Product");

			strictEqual(oMetaModel.getODataAssociationSetEnd(oEntityType, "ToSupplier"),
				oMetaModel.getObject(
					"/dataServices/schema/0/entityContainer/0/associationSet/10/end/0"));
			strictEqual(oMetaModel.getODataAssociationSetEnd(oEntityType, "ToFoo"), null);
			strictEqual(oMetaModel.getODataAssociationSetEnd(null, "ToSupplier"), null);
			strictEqual(oMetaModel.getODataAssociationSetEnd({}, "ToSupplier"), null);
		});
	});

	//*********************************************************************************************
	test("getODataProperty", function() {
		withMetaModel(function (oMetaModel) {
			var oComplexType = oMetaModel.getODataComplexType("GWSAMPLE_BASIC.CT_Address"),
				oEntityType = oMetaModel.getODataEntityType("GWSAMPLE_BASIC.BusinessPartner"),
				aParts;

			// entity type
			strictEqual(oMetaModel.getODataProperty(oEntityType, "Address"),
				oMetaModel.getObject("/dataServices/schema/0/entityType/0/property/0"));
			strictEqual(oMetaModel.getODataProperty(), null);
			strictEqual(oMetaModel.getODataProperty(oEntityType), null);
			strictEqual(oMetaModel.getODataProperty(oEntityType, "foo"), null);

			// complex type
			strictEqual(oMetaModel.getODataProperty(oComplexType, "Street"),
				oMetaModel.getObject("/dataServices/schema/0/complexType/0/property/2"));
			strictEqual(oMetaModel.getODataProperty(oComplexType), null);
			strictEqual(oMetaModel.getODataProperty(oComplexType, "foo"), null);

			// {string[]} path
			aParts = ["foo"];
			strictEqual(oMetaModel.getODataProperty(oEntityType, aParts), null);
			strictEqual(aParts.length, 1, "no parts consumed");
			aParts = ["Address"];
			strictEqual(oMetaModel.getODataProperty(oEntityType, aParts),
				oMetaModel.getObject("/dataServices/schema/0/entityType/0/property/0"));
			strictEqual(aParts.length, 0, "all parts consumed");
			aParts = ["Address", "foo"];
			strictEqual(oMetaModel.getODataProperty(oEntityType, aParts),
				oMetaModel.getObject("/dataServices/schema/0/entityType/0/property/0"));
			strictEqual(aParts.length, 1, "one part consumed");
			aParts = ["Street"];
			strictEqual(oMetaModel.getODataProperty(oComplexType, aParts),
				oMetaModel.getObject("/dataServices/schema/0/complexType/0/property/2"));
			strictEqual(aParts.length, 0, "all parts consumed");
			aParts = ["Address", "Street"];
			strictEqual(oMetaModel.getODataProperty(oEntityType, aParts),
				oMetaModel.getObject("/dataServices/schema/0/complexType/0/property/2"));
			strictEqual(aParts.length, 0, "all parts consumed");
		});
	});

	//*********************************************************************************************
	test("getODataProperty as path", function() {
		withMetaModel(function (oMetaModel) {
			var oComplexType = oMetaModel.getODataComplexType("GWSAMPLE_BASIC.CT_Address"),
				oEntityType = oMetaModel.getODataEntityType("GWSAMPLE_BASIC.BusinessPartner"),
				aParts;

			// entity type
			strictEqual(oMetaModel.getODataProperty(oEntityType, "Address", true),
				"/dataServices/schema/0/entityType/0/property/0");
			strictEqual(oMetaModel.getODataProperty(null, "", true), undefined);
			strictEqual(oMetaModel.getODataProperty(oEntityType, undefined, true), undefined);
			strictEqual(oMetaModel.getODataProperty(oEntityType, "foo", true), undefined);

			// complex type
			strictEqual(oMetaModel.getODataProperty(oComplexType, "Street", true),
				"/dataServices/schema/0/complexType/0/property/2");
			strictEqual(oMetaModel.getODataProperty(oComplexType, undefined, true), undefined);
			strictEqual(oMetaModel.getODataProperty(oComplexType, "foo", true), undefined);

			// {string[]} path
			aParts = ["foo"];
			strictEqual(oMetaModel.getODataProperty(oEntityType, aParts, true), undefined);
			strictEqual(aParts.length, 1, "no parts consumed");
			aParts = ["Address"];
			strictEqual(oMetaModel.getODataProperty(oEntityType, aParts, true),
				"/dataServices/schema/0/entityType/0/property/0");
			strictEqual(aParts.length, 0, "all parts consumed");
			aParts = ["Address", "foo"];
			strictEqual(oMetaModel.getODataProperty(oEntityType, aParts, true),
				"/dataServices/schema/0/entityType/0/property/0");
			strictEqual(aParts.length, 1, "one part consumed");
			aParts = ["Street"];
			strictEqual(oMetaModel.getODataProperty(oComplexType, aParts, true),
				"/dataServices/schema/0/complexType/0/property/2");
			strictEqual(aParts.length, 0, "all parts consumed");
			aParts = ["Address", "Street"];
			strictEqual(oMetaModel.getODataProperty(oEntityType, aParts, true),
				"/dataServices/schema/0/complexType/0/property/2");
			strictEqual(aParts.length, 0, "all parts consumed");
		});
	});

	//*********************************************************************************************
	test("getMetaContext: empty data path", function() {
		withMetaModel(function (oMetaModel) {
			strictEqual(oMetaModel.getMetaContext(undefined), null);
			strictEqual(oMetaModel.getMetaContext(null), null);
			strictEqual(oMetaModel.getMetaContext(""), null);
		});
	});

	//*********************************************************************************************
	test("getMetaContext: entity set only", function() {
		withMetaModel(function (oMetaModel) {
			var oMetaContext = oMetaModel.getMetaContext("/ProductSet('ABC')");

			ok(oMetaContext instanceof sap.ui.model.Context);
			strictEqual(oMetaContext.getModel(), oMetaModel);
			strictEqual(oMetaContext.getPath(), "/dataServices/schema/0/entityType/1");

			strictEqual(oMetaModel.getMetaContext("/ProductSet('ABC')"), oMetaContext,
				"the context has been cached");

			raises(function () {
				oMetaModel.getMetaContext("foo/bar");
			}, /Not an absolute path: foo\/bar/);
			raises(function () {
				oMetaModel.getMetaContext("/FooSet('123')");
			}, /Entity set not found: FooSet\('123'\)/);
			raises(function () {
				oMetaModel.getMetaContext("/('123')");
			}, /Entity set not found: \('123'\)/);
		});
	});

	//*********************************************************************************************
	test("getMetaContext: entity set & navigation properties", function() {
		withMetaModel(function (oMetaModel) {
			var oMetaContext = oMetaModel.getMetaContext("/ProductSet('ABC')/ToSupplier");

			ok(oMetaContext instanceof sap.ui.model.Context);
			strictEqual(oMetaContext.getModel(), oMetaModel);
			strictEqual(oMetaContext.getPath(), "/dataServices/schema/0/entityType/0");

			strictEqual(oMetaModel.getMetaContext("/ProductSet('ABC')/ToSupplier"), oMetaContext,
				"the context has been cached");

			raises(function () {
				oMetaModel.getMetaContext("/ProductSet('ABC')/ToFoo(0)");
			}, /Property not found: ToFoo\(0\)/);

			raises(function () {
				oMetaModel.getMetaContext("/ProductSet('ABC')/ToSupplier('ABC')");
			}, /Multiplicity is 1: ToSupplier\('ABC'\)/);

			// many navigation properties
			oMetaContext = oMetaModel.getMetaContext(
				"/SalesOrderSet('123')/ToLineItems(SalesOrderID='123',ItemPosition='1')/ToProduct"
				+ "/ToSupplier/ToContacts(guid'01234567-89AB-CDEF-0123-456789ABCDEF')");
			strictEqual(oMetaContext.getPath(), "/dataServices/schema/0/entityType/4");
		});
	});

	//*********************************************************************************************
	test("getMetaContext: entity set & property", function() {
		withMetaModel(function (oMetaModel) {
			var sPath = "/ProductSet('ABC')/ProductID",
				oMetaContext = oMetaModel.getMetaContext(sPath);

			ok(oMetaContext instanceof sap.ui.model.Context);
			strictEqual(oMetaContext.getModel(), oMetaModel);
			strictEqual(oMetaContext.getPath(), "/dataServices/schema/0/entityType/1/property/0");

			strictEqual(oMetaModel.getMetaContext(sPath), oMetaContext, "cached");

			raises(function () {
				oMetaModel.getMetaContext("/ProductSet('ABC')/ProductID(0)");
			}, /Property not found: ProductID\(0\)/);

			raises(function () {
				oMetaModel.getMetaContext("/FooSet('123')/Bar");
			}, /Entity set not found: FooSet/);
		});
	});

	//*********************************************************************************************
	test("getMetaContext: entity set, navigation property & property", function() {
		withMetaModel(function (oMetaModel) {
			var sPath = "/ProductSet('ABC')/ToSupplier/BusinessPartnerID",
				oMetaContext = oMetaModel.getMetaContext(sPath);

			ok(oMetaContext instanceof sap.ui.model.Context);
			strictEqual(oMetaContext.getModel(), oMetaModel);
			strictEqual(oMetaContext.getPath(), "/dataServices/schema/0/entityType/0/property/1");

			strictEqual(oMetaModel.getMetaContext(sPath), oMetaContext, "cached");

			raises(function () {
				oMetaModel.getMetaContext("/ProductSet('ABC')/ToSupplier/Foo");
			}, /Property not found: Foo/);
		});
	});

	//*********************************************************************************************
	test("getMetaContext: entity set & complex property", function() {
		withMetaModel(function (oMetaModel) {
			var sPath = "/ProductSet('ABC')/ToSupplier/Address/Street",
				oMetaContext = oMetaModel.getMetaContext(sPath);

			ok(oMetaContext instanceof sap.ui.model.Context);
			strictEqual(oMetaContext.getModel(), oMetaModel);
			strictEqual(oMetaContext.getPath(), "/dataServices/schema/0/complexType/0/property/2");

			strictEqual(oMetaModel.getMetaContext(sPath), oMetaContext, "cached");

			raises(function () {
				oMetaModel.getMetaContext("/ProductSet('ABC')/ToSupplier/Address/Foo");
			}, /Property not found: Foo/);

			//TODO "nested" complex types are supported, we just need an example
			raises(function () {
				oMetaModel.getMetaContext("/ProductSet('ABC')/ToSupplier/Address/Street/AndSoOn");
			}, /Property not found: AndSoOn/);
		});
	});
	//TODO our errors do not include sufficient detail for error analysis, e.g. a full path
}());
