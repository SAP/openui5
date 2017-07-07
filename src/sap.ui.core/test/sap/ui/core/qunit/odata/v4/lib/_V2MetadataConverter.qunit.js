/*
 * ${copyright}
 */
sap.ui.require([
	"jquery.sap.global",
	"sap/ui/model/odata/v4/lib/_V2MetadataConverter",
	"sap/ui/test/TestUtils",
	"jquery.sap.xml" // needed to have jQuery.sap.parseXML
], function (jQuery, _V2MetadataConverter, TestUtils/*, jQuerySapXml*/) {
	/*global QUnit, sinon */
	/*eslint max-nested-callbacks: 0, no-multi-str: 0, no-warning-comments: 0 */
	"use strict";

	var sEdmx = '<edmx:Edmx Version="1.0" xmlns="http://schemas.microsoft.com/ado/2008/09/edm"'
			+ ' xmlns:edmx="http://schemas.microsoft.com/ado/2007/06/edmx"'
			+ ' xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata"'
			+ ' xmlns:sap="http://www.sap.com/Protocols/SAPData">',
		mFixture = {
			"/GWSAMPLE_BASIC/$metadata" : {source : "GWSAMPLE_BASIC.metadata.xml"},
			"/GWSAMPLE_BASIC/annotations" : {source : "GWSAMPLE_BASIC.annotations.xml"},
			"/GWSAMPLE_BASIC/metadata_v4.json" : {source : "GWSAMPLE_BASIC.metadata_v4.json"}
		};

	/**
	 * Tests the conversion of the given XML snippet.
	 * @param {object} assert
	 *   QUnit's assert
	 * @param {string} sXmlSnippet
	 *   the XML snippet; it will be inserted below an <Edmx> element
	 * @param {object} oExpected
	 *   the expected JSON object
	 */
	function testConversion(assert, sXmlSnippet, oExpected) {
		var oXML = xml(assert, sEdmx + '<edmx:DataServices m:DataServiceVersion="2.0">'
				+ sXmlSnippet + '</edmx:DataServices></edmx:Edmx>'),
			oResult = _V2MetadataConverter.convertXMLMetadata(oXML);

		oExpected.$Version = "4.0";
		assert.deepEqual(oResult, oExpected);
	}

	/**
	 * Creates a DOM document from the given string.
	 * @param {object} assert the assertions
	 * @param {string} sXml the XML as string
	 * @returns {Document} the DOM document
	 */
	function xml(assert, sXml) {
		var oDocument = jQuery.sap.parseXML(sXml);
		assert.strictEqual(oDocument.parseError.errorCode, 0, "XML parsed correctly");
		return oDocument;
	}

	//*********************************************************************************************
	QUnit.module("sap.ui.model.odata.v4.lib._V2MetadataConverter", {
		beforeEach : function () {
			this.oSandbox = sinon.sandbox.create();
			TestUtils.useFakeServer(this.oSandbox, "sap/ui/core/qunit/model", mFixture);
			this.oLogMock = this.oSandbox.mock(jQuery.sap.log);
			this.oLogMock.expects("warning").never();
			this.oLogMock.expects("error").never();
		},

		afterEach : function () {
			this.oSandbox.verifyAndRestore();
		}
	});

	//*********************************************************************************************
	QUnit.test("convertXMLMetadata: aliases in types", function (assert) {
		testConversion(assert, '\
				<Schema Namespace="bar" Alias="b">\
					<ComplexType Name="Worker">\
						<Property Name="Something" Type="b.Something"/>\
					</ComplexType>\
				</Schema>\
				<Schema Namespace="foo" Alias="f"/>',
			{
				"bar." : {
					"$kind" : "Schema"
				},
				"bar.Worker" : {
					"$kind" : "ComplexType",
					"Something" : {
						"$kind" : "Property",
						"$Type" : "bar.Something"
					}
				},
				"foo." : {
					"$kind" : "Schema"
				}
			});
	});

	//*********************************************************************************************
	QUnit.test("convertXMLMetadata: EntityType attributes", function (assert) {
		testConversion(assert, '\
				<Schema Namespace="foo" Alias="f">\
					<EntityType Name="Worker">\
						<Key>\
							<PropertyRef Name="Bar"/>\
						</Key>\
					</EntityType>\
					<EntityType Name="Base" Abstract="true"/>\
					<EntityType Name="Derived" BaseType="f.Base"/>\
				</Schema>',
			{
				"foo." : {
					"$kind" : "Schema"
				},
				"foo.Worker" : {
					"$kind" : "EntityType",
					"$Key" : ["Bar"]
				},
				"foo.Base" : {
					"$kind" : "EntityType",
					"$Abstract" : true
				},
				"foo.Derived" : {
					"$kind" : "EntityType",
					"$BaseType" : "foo.Base"
				}
			});
	});

	//*********************************************************************************************
	QUnit.test("convertXMLMetadata: ComplexType", function (assert) {
		testConversion(assert, '\
				<Schema Namespace="foo">\
					<ComplexType Name="Worker" />\
				</Schema>',
			{
				"foo." : {
					"$kind" : "Schema"
				},
				"foo.Worker" : {
					"$kind" : "ComplexType"
				}
			});
	});

	//*********************************************************************************************
	QUnit.test("processFacetAttributes", function (assert) {
		function localTest(sProperty, sValue, vExpectedValue) {
			var oExpectedResult = {},
				oResult = {},
				oXml = xml(assert, '<Foo ' + sProperty + '="' + sValue + '"/>');

			if (typeof vExpectedValue === "object") {
				oExpectedResult = vExpectedValue;
			} else if (vExpectedValue !== undefined) {
				oExpectedResult["$" + sProperty] = vExpectedValue;
			}
			_V2MetadataConverter.processFacetAttributes(oXml.documentElement, oResult);
			assert.deepEqual(oResult, oExpectedResult);
		}

		localTest("Nullable", "false", false);
		localTest("Nullable", "true", undefined);
		localTest("DefaultValue", "foo", "foo");
		localTest("Precision", "8", 8);
		localTest("Scale", "2", 2);
		localTest("Unicode", "false", false);
		localTest("Unicode", "true", undefined);
		localTest("MaxLength", "12345", 12345);
		localTest("FixedLength", "true", undefined);
		localTest("FixedLength", "false", {$Scale : "variable"});
	});

	//*********************************************************************************************
	["ComplexType", "EntityType"].forEach(function (sType) {
		["", "Edm."].forEach(function (sNamespace) {
			var sTitle = "convertXMLMetadata: " + sType + ": Property, Namespace=" + sNamespace;
			QUnit.test(sTitle, function (assert) {
				testConversion(assert, '\
						<Schema Namespace="foo">\
							<' + sType + ' Name="Worker">\
								<Property Name="Salary" Type="' + sNamespace + 'Decimal"\
									Precision="8" Scale="2"/>\
								<Property Name="p1" Type="' + sNamespace + 'String"\
									Unicode="false" />\
								<Property Name="p2" Type="' + sNamespace + 'String"\
									Unicode="true" />\
								<Property Name="p3" Type="' + sNamespace + 'Int32"\
									DefaultValue="42"/>\
								<Property Name="p4" Type="' + sNamespace + 'Time"/>\
								<Property Name="p5" Type="' + sNamespace + 'DateTime"/>\
								<Property Name="p6" Type="' + sNamespace + 'DateTime"\
									Precision="0" sap:display-format="Date"/>\
								<Property Name="p7" Type="' + sNamespace + 'Float"/>\
							</' + sType + '>\
						</Schema>',
					{
						"foo." : {
							"$kind" : "Schema"
						},
						"foo.Worker" : {
							"$kind" : sType,
							"Salary" : {
								"$kind" : "Property",
								"$Type" : "Edm.Decimal",
								"$Precision" : 8,
								"$Scale" : 2
							},
							"p1" : {
								"$kind" : "Property",
								"$Type" : "Edm.String",
								"$Unicode" : false
							},
							"p2" : {
								"$kind" : "Property",
								"$Type" : "Edm.String"
							},
							"p3" : {
								"$kind" : "Property",
								"$Type" : "Edm.Int32",
								"$DefaultValue" : "42"
							},
							"p4" : {
								"$kind" : "Property",
								"$Type" : "Edm.TimeOfDay"
							},
							"p5" : {
								"$kind" : "Property",
								"$Type" : "Edm.DateTimeOffset"
							},
							"p6" : {
								"$kind" : "Property",
								"$Type" : "Edm.Date"
							},
							"p7" : {
								"$kind" : "Property",
								"$Type" : "Edm.Single"
							}
						}
					});
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("convertXMLMetadata: NavigationProperty & Assocation", function (assert) {
		var sXML = '\
				<Schema Namespace="GWSAMPLE_BASIC.0001" Alias="GWSAMPLE_BASIC">\
					<EntityType Name="BusinessPartner">\
						<NavigationProperty Name="ToSalesOrders"\
							Relationship="GWSAMPLE_BASIC.Assoc_BusinessPartner_SalesOrders"\
							FromRole="FromRole_Assoc_BusinessPartner_SalesOrders"\
							ToRole="ToRole_Assoc_BusinessPartner_SalesOrders" />\
					</EntityType>\
					<EntityType Name="SalesOrder">\
						<NavigationProperty Name="ToBusinessPartner"\
								Relationship="GWSAMPLE_BASIC.Assoc_BusinessPartner_SalesOrders"\
								FromRole="ToRole_Assoc_BusinessPartner_SalesOrders"\
								ToRole="FromRole_Assoc_BusinessPartner_SalesOrders" />\
					</EntityType>\
					<Association Name="Assoc_BusinessPartner_SalesOrders" content-version="1">\
						<End Type="GWSAMPLE_BASIC.BusinessPartner" Multiplicity="1"\
							Role="FromRole_Assoc_BusinessPartner_SalesOrders" />\
						<End Type="GWSAMPLE_BASIC.SalesOrder" Multiplicity="*"\
							Role="ToRole_Assoc_BusinessPartner_SalesOrders" />\
						<ReferentialConstraint>\
							<Principal Role="FromRole_Assoc_BusinessPartner_SalesOrders">\
								<PropertyRef Name="BusinessPartnerID" />\
							</Principal>\
							<Dependent Role="ToRole_Assoc_BusinessPartner_SalesOrders">\
								<PropertyRef Name="CustomerID" />\
							</Dependent>\
						</ReferentialConstraint>\
					</Association>\
				</Schema>',
			oExpectedResult = {
				"GWSAMPLE_BASIC.0001." : {
					"$kind" : "Schema"
				},
				"GWSAMPLE_BASIC.0001.BusinessPartner" : {
					"$kind" : "EntityType",
					"ToSalesOrders" : {
						"$Type" : "GWSAMPLE_BASIC.0001.SalesOrder",
						"$isCollection" : true,
						"$kind" : "NavigationProperty"
					}
				},
				"GWSAMPLE_BASIC.0001.SalesOrder" : {
					"$kind" : "EntityType",
					"ToBusinessPartner" : {
						"$Nullable" : false,
						"$ReferentialConstraint" : {
							"CustomerID" : "BusinessPartnerID"
						},
						"$Type" : "GWSAMPLE_BASIC.0001.BusinessPartner",
						"$kind" : "NavigationProperty"
					}
				}
			};

		testConversion(assert, sXML, oExpectedResult);
	});

	//*********************************************************************************************
	QUnit.test("convertXMLMetadata: multiple EntityContainer", function (assert) {
		testConversion(assert, '\
				<Schema Namespace="Schema1">\
					<EntityContainer Name="Container" m:IsDefaultEntityContainer="true"/>\
				</Schema>\
				<Schema Namespace="Schema2">\
					<EntityContainer Name="Container"/>\
				</Schema>',
			{
				"$EntityContainer" : "Schema1.Container",
				"Schema1." : {
					"$kind" : "Schema"
				},
				"Schema1.Container" : {
					"$kind" : "EntityContainer"
				},
				"Schema2." : {
					"$kind" : "Schema"
				},
				"Schema2.Container" : {
					"$kind" : "EntityContainer"
				}
			});
	});

	//*********************************************************************************************
	QUnit.test("convertXMLMetadata: AssociationSets", function (assert) {
		testConversion(assert, '\
				<Schema Namespace="GWSAMPLE_BASIC.0001" Alias="GWSAMPLE_BASIC">\
					<EntityType Name="BusinessPartner">\
						<NavigationProperty Name="Foo"\
							Relationship="GWSAMPLE_BASIC.Foo"\
							FromRole="Foo1"\
							ToRole="Foo2"/>\
						<NavigationProperty Name="ToProducts"\
							Relationship="GWSAMPLE_BASIC.Assoc_BusinessPartner_Products"\
							FromRole="FromRole_Assoc_BusinessPartner_Products"\
							ToRole="ToRole_Assoc_BusinessPartner_Products"/>\
					</EntityType>\
					<EntityType Name="Product"/>\
					<Association Name="Assoc_BusinessPartner_Products">\
						<End Type="GWSAMPLE_BASIC.BusinessPartner" Multiplicity="1"\
								Role="FromRole_Assoc_BusinessPartner_Products"/>\
						<End Type="GWSAMPLE_BASIC.Product" Multiplicity="*"\
								Role="ToRole_Assoc_BusinessPartner_Products"/>\
					</Association>\
					<Association Name="Foo">\
						<End Type="GWSAMPLE_BASIC.BusinessPartner" Multiplicity="1"\
								Role="Foo1"/>\
						<End Type="GWSAMPLE_BASIC.Product" Multiplicity="*"\
								Role="Foo2"/>\
					</Association>\
					<EntityContainer Name="Container">\
						<EntitySet Name="BusinessPartnerSet"\
								EntityType="GWSAMPLE_BASIC.BusinessPartner"/>\
						<EntitySet Name="ProductSet"\ EntityType="GWSAMPLE_BASIC.Product"/>\
						<AssociationSet Name="Assoc_BusinessPartner_Products_AssocSet"\
								Association="GWSAMPLE_BASIC.Assoc_BusinessPartner_Products">\
							<End EntitySet="BusinessPartnerSet"\
								Role="FromRole_Assoc_BusinessPartner_Products"/>\
							<End EntitySet="ProductSet"\
								Role="ToRole_Assoc_BusinessPartner_Products"/>\
						</AssociationSet>\
					</EntityContainer>\
				</Schema>',
			{
				"$EntityContainer" : "GWSAMPLE_BASIC.0001.Container",
				"GWSAMPLE_BASIC.0001." : {
					"$kind" : "Schema"
				},
				"GWSAMPLE_BASIC.0001.BusinessPartner" : {
					"$kind" : "EntityType",
					"Foo" : {
						"$kind" : "NavigationProperty",
						"$isCollection" : true,
						"$Type" : "GWSAMPLE_BASIC.0001.Product"
					},
					"ToProducts" : {
						"$kind" : "NavigationProperty",
						"$isCollection" : true,
						"$Type" : "GWSAMPLE_BASIC.0001.Product"
					}
				},
				"GWSAMPLE_BASIC.0001.Product" : {
					"$kind" : "EntityType"
				},
				"GWSAMPLE_BASIC.0001.Container" : {
					"$kind" : "EntityContainer",
					"BusinessPartnerSet" : {
						"$kind" : "EntitySet",
						"$Type" : "GWSAMPLE_BASIC.0001.BusinessPartner",
						"$NavigationPropertyBinding" : {
							"ToProducts" : "ProductSet"
						}
					},
					"ProductSet" : {
						"$kind" : "EntitySet",
						"$Type" : "GWSAMPLE_BASIC.0001.Product"
					}
				}
			});
	});


	//*********************************************************************************************
	QUnit.test("try to read some random XML as V2", function (assert) {
		var sUrl = "/some/random/xml",
			oXML = xml(assert, '<foo xmlns="http://schemas.microsoft.com/ado/2007/06/edmx"/>');

		assert.throws(function () {
			_V2MetadataConverter.convertXMLMetadata(oXML, sUrl);
		}, new Error(sUrl + " is not a valid OData V2 metadata document"));
	});

	//*********************************************************************************************
	QUnit.test("try to read V3 as V2", function (assert) {
		var sUrl = "/some/v3/service/$metadata",
			oXML = xml(assert, '\
					<Edmx xmlns="http://schemas.microsoft.com/ado/2007/06/edmx"\
						xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata">\
						<DataServices m:DataServiceVersion="3.0"/>\
					</Edmx>');

		assert.throws(function () {
			_V2MetadataConverter.convertXMLMetadata(oXML, sUrl);
		}, new Error(sUrl + " is not a valid OData V2 metadata document"));
	});

	//*********************************************************************************************
	QUnit.test("try to read V4 as V2", function (assert) {
		var sUrl = "/some/v4/service/$metadata",
			oXML = xml(assert, '<Edmx xmlns="http://docs.oasis-open.org/odata/ns/edmx"/>');

		assert.throws(function () {
			_V2MetadataConverter.convertXMLMetadata(oXML, sUrl);
		}, new Error(sUrl + " is not a valid OData V2 metadata document"));
	});

	//*********************************************************************************************
	QUnit.test("convertXMLMetadata: test service", function (assert) {
		return Promise.all([
			jQuery.ajax("/GWSAMPLE_BASIC/$metadata").then(function (oXML) {
					return _V2MetadataConverter.convertXMLMetadata(oXML);
				}),
			jQuery.ajax("/GWSAMPLE_BASIC/metadata_v4.json")
		]).then(function (aResults) {
			assert.deepEqual(aResults[0], aResults[1]);
		});
	});

	//*********************************************************************************************
	[{ // annotations with boolean primitive values
		annotationsV2 : 'sap:aggregation-role="dimension"',
		expectedAnnotationsV4 : {
			'@com.sap.vocabularies.Analytics.v1.Dimension' : true
		}
	}, {
		annotationsV2 : 'sap:aggregation-role="measure"',
		expectedAnnotationsV4 : {
			'@com.sap.vocabularies.Analytics.v1.Measure' : true
		}
	}, {
		annotationsV2 : 'sap:display-format="NonNegative"',
		expectedAnnotationsV4 : {
			'@com.sap.vocabularies.Common.v1.IsDigitSequence' : true
		}
	}, {
		annotationsV2 : 'sap:display-format="UpperCase"',
		expectedAnnotationsV4 : {
			'@com.sap.vocabularies.Common.v1.IsUpperCase' : true
		}
	}, { // annotations with string values
		annotationsV2 : 'sap:heading="Value"',
		expectedAnnotationsV4 : {
			'@com.sap.vocabularies.Common.v1.Heading' : 'Value'
		}
	}, {
		annotationsV2 : 'sap:label="Value"',
		expectedAnnotationsV4 : {
			'@com.sap.vocabularies.Common.v1.Label' : 'Value'
		}
	}, {
		annotationsV2 : 'sap:quickinfo="Value"',
		expectedAnnotationsV4 : {
			'@com.sap.vocabularies.Common.v1.QuickInfo' : 'Value'
		}
	}, { // annotations with path expression as value
		annotationsV2 : 'sap:field-control="PathExpression"',
		expectedAnnotationsV4 : {
			'@com.sap.vocabularies.Common.v1.FieldControl' : {
				$Path : "PathExpression"
			}
		}
	}, {
		annotationsV2 : 'sap:precision="PathExpression"',
		expectedAnnotationsV4 : {
			'@Org.OData.Measures.V1.Scale' : {
				$Path : "PathExpression"
			}
		}
	}, {
		annotationsV2 : 'sap:text="PathExpression"',
		expectedAnnotationsV4 : {
			'@com.sap.vocabularies.Common.v1.Text' : {
				$Path : "PathExpression"
			}
		}
	}, { // multiple V4 annotations for one V2 annotation
		annotationsV2 : 'sap:visible="false"',
		expectedAnnotationsV4 : {
			'@com.sap.vocabularies.Common.v1.FieldControl' : {
				$EnumMember : "com.sap.vocabularies.Common.v1.FieldControlType/Hidden"
			},
			'@com.sap.vocabularies.UI.v1.Hidden' : true
		}
	}, { // combination of v2 annotations
		annotationsV2 : 'sap:text="PathExpression" sap:label="Value"',
		expectedAnnotationsV4 : {
			'@com.sap.vocabularies.Common.v1.Label' : 'Value',
			'@com.sap.vocabularies.Common.v1.Text' : {
				$Path : "PathExpression"
			}
		}
	}].forEach(function (oFixture) {
		var sTitle = "convert: V2 annotation at Property: " + oFixture.annotationsV2;

		QUnit.test(sTitle, function (assert) {
			testConversion(assert, '\
						<Schema Namespace="GWSAMPLE_BASIC.0001">\
						<EntityType Name="Foo">\
							<Property Name="Bar" Type="Edm.String" \
								' + oFixture.annotationsV2 + ' />\
						</EntityType>\
					</Schema>',
				{
					"$Version" : "4.0",
					"GWSAMPLE_BASIC.0001." : {
						"$Annotations" : {
							"GWSAMPLE_BASIC.0001.Foo/Bar" : oFixture.expectedAnnotationsV4
						},
						"$kind" : "Schema"
					},
					"GWSAMPLE_BASIC.0001.Foo" : {
						"$kind" : "EntityType",
						"Bar" : {
							"$kind" : "Property",
							"$Type" : "Edm.String"
						}
					}
				});
		});
	});
	// TODO _V2MetadataConverter.postProcessSchema: merge V2 annotations, don't replace
});
