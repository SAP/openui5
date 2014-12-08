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
		ok(false, oError.message);
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
<Schema Namespace="zanno4sample_anno_mdl.v1" xmlns="http://docs.oasis-open.org/odata/ns/edm">\
<Annotations Target="GWSAMPLE_BASIC.BusinessPartner">\
	<Annotation Term="com.sap.vocabularies.Common.v1.Foo" String="foo" />\
</Annotations>\
</Schema>\
</edmx:DataServices>\
</edmx:Edmx>\
		', mFixture = {
		"/fake/service/$metadata" : [200, {"Content-Type" : "application/xml"}, sMetadata],
		//TODO separate test for V4 metadata with inline annotations
		"/fake/annotations" : [200, {"Content-Type" : "application/xml"}, sAnnotations],
		//TODO cleanup GWSAMPLE_BASIC.BusinessPartner/BusinessPartnerID (artificial example)
		"/fake/annotations2" : [200, {"Content-Type" : "application/xml"}, sAnnotations2]
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

	// *********************************************************************************************
	module("sap.ui.model.odata.v2.ODataMetaModel", {
		teardown : function () {
			sap.ui.model.odata.v2.ODataModel.mServiceData = {}; // clear cache
		}
	});

	// *********************************************************************************************
	asyncTest("ODataMetaModel loaded: no annotations", sinon.test(function() {
		var oMetaModel, oModel;

		setupSandbox(this);
		oModel = new sap.ui.model.odata.v2.ODataModel("/fake/service", {
			json : true,
			loadMetadataAsync : true
		});
		oModel.attachMetadataFailed(onFailed);

		oMetaModel = oModel.getMetaModel();
		ok(oMetaModel instanceof sap.ui.model.odata.v2.ODataMetaModel);

		oMetaModel.loaded().then(function() {
			var oAnnotations = oModel.getServiceAnnotations(),
				oMetadata = oModel.getServiceMetadata();

			start();
			strictEqual(arguments.length, 1, "almost no args");
			deepEqual(arguments[0], undefined, "almost no args");

			ok(oMetadata, "metadata is loaded");

			deepEqual(oMetaModel.getData(), oMetadata, JSON.stringify(oMetaModel.getData()));
		})["catch"](onError);
	}));

	// *********************************************************************************************
	jQuery.each([{
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
			oMetaModel.loaded().then(function() {
				var oAnnotations = oModel.getServiceAnnotations(),
					oMetadata = oModel.getServiceMetadata(),
					oMetaModelData = oMetaModel.getData(),
					oBusinessPartner = oMetaModelData.dataServices.schema[0].entityType[0],
					oBusinessPartnerId = oBusinessPartner.property[0],
					sSAPData = "http://www.sap.com/Protocols/SAPData";

				start();

				ok(oAnnotations, "annotations are also loaded");
				strictEqual(oBusinessPartner.name, "BusinessPartner");
				strictEqual(oBusinessPartnerId.name, "BusinessPartnerID");

				//TODO needed?
//				deepEqual(oBusinessPartnerId.extensions[sSAPData], {
//					"label" : "Bus. Part. ID",
//					"creatable" : "false",
//					"updatable" : "false"
//				});
//				delete oBusinessPartnerId.extensions[sSAPData];

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

				if (i > 0) { // additional tests for 2nd annotations file
					deepEqual(oBusinessPartner["com.sap.vocabularies.Common.v1.Foo"], {
						"String" : "foo"
					});
					delete oBusinessPartner["com.sap.vocabularies.Common.v1.Foo"];
				}

				//TODO deepEqual() cannot handle arrays with additional properties;
				// JSON.stringify() works the same...
				deepEqual(oMetaModelData, oMetadata, "nothing else left...");
			})["catch"](onError);
		}));
	});

	//TODO test failure handling
}());
