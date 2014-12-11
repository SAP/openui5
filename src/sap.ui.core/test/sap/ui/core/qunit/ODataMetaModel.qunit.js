/*!
 * ${copyright}
 */
(function() {
	/*
	 * global asyncTest, deepEqual, equal, expect, module, notDeepEqual, notEqual, notStrictEqual, ok, raises, sinon,
	 * start, strictEqual, stop, test,
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

	var sMetadata = '\
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
		', mHeaders = {"Content-Type" : "application/xml"},
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
			"/fake/emptyAnnotations" : [200, mHeaders, sEmptyAnnotations]
		};

	/**
	 * Sets up the given sandbox in order to use the URLs and responses defined in mFixture;
	 * leaves unknown URLs alone.
	 *
	 * @param {object} oSandbox
	 *   <a href ="http://sinonjs.org/docs/#sandbox">a Sinon.JS sandbox</a>
	 */
	function setupSandbox(oSandbox) {
		var oServer = oSandbox.sandbox.useFakeServer();

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

	//*********************************************************************************************
	module("sap.ui.model.odata.ODataMetaModel", {
		teardown : function () {
			sap.ui.model.odata.v2.ODataModel.mServiceData = {}; // clear cache
		}
	});

	//*********************************************************************************************
	test("basics", sinon.test(function() {
		var oMetaModel = new sap.ui.model.odata.ODataMetaModel({
				getServiceMetadata : function () { return {}; },
				isLoaded : function () { return true; }
			}),
			oModelMock = this.mock(oMetaModel.oModel),
			oResult = {};

		// generic dispatching
		jQuery.each(["bindContext", "bindList", "bindProperty", "bindTree",
			"getObject", "getProperty", "isList", "setSizeLimit"], function (i, sName) {
			oModelMock.expects(sName).once().withExactArgs("foo", 0, false).returns(oResult);

			strictEqual(oMetaModel[sName]("foo", 0, false), oResult, sName);
		});

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
	}));

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
		asyncTest("ODataMetaModel loaded: " + oFixture.title, sinon.test(function() {
			var oMetaModel, oModel;

			setupSandbox(this);
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
		}));
	});

	//*********************************************************************************************
	jQuery.each([false, true, false, true], function (i, bAsync) {
		asyncTest("Error loading" + (i < 2 ? " meta data" : " annotations" )
				+ ", async: " + bAsync, sinon.test(function() {
			var oModel,
				sMetadataURL = i < 2 ? "/invalid/service" : "/fake/service",
				sAnnotationsURL = i < 2 ? "" : "/invalid/annotations",
				fnConstructor = bAsync
					? sap.ui.model.odata.v2.ODataModel
					: sap.ui.model.odata.ODataModel;

			setupSandbox(this);
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
		}));
	});

	//*********************************************************************************************
	jQuery.each(["annotations", "emptyAnnotations"], function (i, sAnnotation) {
		jQuery.each(["emptyMetadata", "emptyDataServices", "emptySchema", "emptyEntityType"],
			function (j, sPath) {
				asyncTest(sAnnotation + ", " + sPath, sinon.test(function() {
					var oModel;

					setupSandbox(this);
					oModel = new sap.ui.model.odata.v2.ODataModel("/fake/" + sPath, {
						// annotations are mandatory for this test case
						annotationURI : "/fake/" + sAnnotation,
						json : true
					});

					// code under test
					oModel.getMetaModel().loaded().then(function () {
						start();
						ok(true, "expected");
					}, onError)["catch"](onError);
				}));
			}
		);
	});
	//TODO test liftSAPData() in case no extensions available!
}());
