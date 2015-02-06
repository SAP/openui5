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
				<edmNs4:Annotation Term="com.sap.vocabularies.Common.v1.Label" String="Label via inline annotation: Business Partner" />\
			</EntityType>\
			<EntityContainer Name="GWSAMPLE_BASIC_Entities"\
				m:IsDefaultEntityContainer="true">\
				<EntitySet Name="BusinessPartnerSet" EntityType="GWSAMPLE_BASIC.BusinessPartner"\
					sap:content-version="1" />\
			</EntityContainer>\
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
<Annotations Target="GWSAMPLE_BASIC.BusinessPartner">\
	<Annotation Term="com.sap.vocabularies.Common.v1.Foo" String="foo" />\
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
	 */
	function withMetaModel(fnCodeUnderTest) {
		var oMetaModel,
			oModel,
			oSandbox; // <a href ="http://sinonjs.org/docs/#sandbox">a Sinon.JS sandbox</a>

		/*
		 * Call the given "code under test" with the given OData meta model, making sure that
		 * no changes to the model are kept in the cached singleton.
		 */
		function call(fnCodeUnderTest, oDataMetaModel) {
			var sCopy = JSON.stringify(oDataMetaModel.getObject("/"));

			try {
				fnCodeUnderTest(oDataMetaModel);
			} finally {
				oDataMetaModel.getObject("/").dataServices = JSON.parse(sCopy).dataServices;
			}
		}

		if (oDataMetaModel) {
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
			oDataMetaModel = oModel.getMetaModel();

			// calls the code under test once the meta model has loaded
			stop();
			oDataMetaModel.loaded().then(function() {
				call(fnCodeUnderTest, oDataMetaModel);
				start();
			}, onError)["catch"](onError);
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
	test("basics", function() {
		var oMetaModel = new sap.ui.model.odata.ODataMetaModel({
				getServiceMetadata : function () { return {}; },
				isLoaded : function () { return true; }
			}),
			oModelMock = this.mock(oMetaModel.oModel),
			oResult = {};

		this.mock(sap.ui.model.Model.prototype).expects("destroy").once();
		// do not mock/stub this or else "destroy" will not bubble up!
		this.spy(sap.ui.model.MetaModel.prototype, "destroy");

		// generic dispatching
		jQuery.each(["destroy", "_getObject", "getProperty", "isList"], function (i, sName) {
			oModelMock.expects(sName).once().withExactArgs("foo", 0, false).returns(oResult);

			strictEqual(oMetaModel[sName]("foo", 0, false), oResult, sName);
		});

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
					oBusinessPartner = oGWSampleBasic.entityType[0],
					oBusinessPartnerId = oBusinessPartner.property[0],
					sSAPData = "http://www.sap.com/Protocols/SAPData";

				start();
				strictEqual(oBusinessPartner.name, "BusinessPartner");
				strictEqual(oBusinessPartnerId.name, "BusinessPartnerID");

				strictEqual(arguments.length, 1, "almost no args");
				deepEqual(arguments[0], undefined, "almost no args");
				ok(oMetadata, "metadata is loaded");

				strictEqual(oBusinessPartner.$path, "/dataServices/schema/0/entityType/0",
					"$path");
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
						deepEqual(oBusinessPartner["com.sap.vocabularies.Common.v1.Foo"], {
							"String" : "foo"
						});
						delete oBusinessPartner["com.sap.vocabularies.Common.v1.Foo"];
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
					}, onError)["catch"](onError);
				});
			}
		);
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
				oMetaModel.getMetaContext();
			}); // don't care about exception
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
