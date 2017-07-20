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
		},
		sModuleName = "sap.ui.model.odata.v4.lib._V2MetadataConverter";

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
			oResult = _V2MetadataConverter.convertXMLMetadata(oXML, "/foo/bar/$metadata");

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
		localTest("MaxLength", "Max", undefined);
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
					"$Annotations": {
						"GWSAMPLE_BASIC.0001.Container/BusinessPartnerSet": {
							"@Org.OData.Capabilities.V1.SearchRestrictions": {
								"Searchable": false
							}
						},
						"GWSAMPLE_BASIC.0001.Container/ProductSet": {
							"@Org.OData.Capabilities.V1.SearchRestrictions": {
								"Searchable": false
							}
						}
					},
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
	[undefined, "GET", "POST"].forEach(function (sMethod) {
		QUnit.test("convert: FunctionImport, Method=" + sMethod, function (assert) {
			var sWhat = sMethod === "POST" ? "Action" : "Function",
				sMethodAttribute = sMethod ? ' m:HttpMethod="' + sMethod + '"' : "",
				sXml = '\
					<Schema Namespace="foo" Alias="f">\
						<EntityContainer Name="Container">\
							<FunctionImport Name="Baz" ReturnType="Collection(Edm.String)"'
									+ sMethodAttribute + '>\
								<Parameter Name="p1" Type="f.Bar" Nullable="false"/>\
								<Parameter Name="p2" Type="Collection(f.Bar)" MaxLength="10"\
									Precision="2" FixedLength="false"/>\
							</FunctionImport>\
						</EntityContainer>\
					</Schema>',
				sExpected = {
					"$EntityContainer" : "foo.Container",
					"foo." : {
						"$kind" : "Schema"
					},
					"foo.Container" : {
						"$kind" : "EntityContainer",
						"Baz": {
							"$kind": sWhat + "Import"
						}
					},
					"foo.Baz" : [{
						"$kind" : sWhat,
						"$Parameter" : [{
							"$Name" : "p1",
							"$Type" : "foo.Bar",
							"$Nullable" : false
						}, {
							"$Name" : "p2",
							"$isCollection" : true,
							"$Type" : "foo.Bar",
							"$MaxLength" : 10,
							"$Precision" : 2,
							"$Scale" : "variable"
						}],
						"$ReturnType" : {
							"$isCollection" : true,
							"$Type" : "Edm.String"
						}
					}]
				};

			sExpected["foo.Container"]["Baz"]["$" + sWhat] = "foo.Baz";
			testConversion(assert, sXml, sExpected);
		});
	});

	//*********************************************************************************************
	QUnit.test("convert: FunctionImport w/ EntitySet", function (assert) {
		testConversion(assert, '\
				<Schema Namespace="foo" Alias="f">\
					<EntityContainer Name="Container">\
						<FunctionImport Name="Baz" ReturnType="Edm.String" EntitySet="Bar"/>\
					</EntityContainer>\
				</Schema>',
			{
				"$Version" : "4.0",
				"$EntityContainer" : "foo.Container",
				"foo." : {
					"$kind" : "Schema"
				},
				"foo.Container" : {
					"$kind" : "EntityContainer",
					"Baz": {
						"$EntitySet" : "Bar",
						"$Function" : "foo.Baz",
						"$kind" : "FunctionImport"
					}
				},
				"foo.Baz" : [{
					"$kind" : "Function",
					"$ReturnType" : {
						"$Type" : "Edm.String"
					}
				}]
			});
	});

	//*********************************************************************************************
	QUnit.test("convert: FunctionImport w/ sap:action-for", function (assert) {
		this.oLogMock.expects("warning")
			.withExactArgs("Unsupported 'sap:action-for' at FunctionImport 'Baz',"
				+ " removing this FunctionImport", undefined, sModuleName);

		testConversion(assert, '\
				<Schema Namespace="foo" Alias="f">\
					<EntityContainer Name="Container">\
						<FunctionImport Name="Bar"/>\
						<FunctionImport Name="Baz" sap:action-for="EntityType">\
							<Parameter Name="p1" Type="String"/>\
						</FunctionImport>\
					</EntityContainer>\
				</Schema>',
			{
				"$Version" : "4.0",
				"$EntityContainer" : "foo.Container",
				"foo." : {
					"$kind" : "Schema"
				},
				"foo.Bar": [{
					"$kind": "Function"
				}],
				"foo.Container": {
					"$kind": "EntityContainer",
					"Bar" : {
						"$kind" : "FunctionImport",
						"$Function" : "foo.Bar"
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
		var oLogMock = this.oLogMock;

		["Confirm", "Cancel", "InvoiceCreated", "GoodsIssueCreated"].forEach(function (sName) {
			oLogMock.expects("warning")
				.withExactArgs("Unsupported 'sap:action-for' at FunctionImport 'SalesOrder_" + sName
						+ "', removing this FunctionImport", undefined,
					"sap.ui.model.odata.v4.lib._V2MetadataConverter");
		});

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
			// there are no $annotations yet at the schema so mergeAnnotations is not called
			this.mock(_V2MetadataConverter).expects("mergeAnnotations").never();

			testConversion(assert, '\
					<Schema Namespace="GWSAMPLE_BASIC.0001">\
						<EntityType Name="Foo">\
							<Property Name="Bar" Type="Edm.String" \
								' + oFixture.annotationsV2 + ' />\
						</EntityType>\
					</Schema>',
				{
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

	//*********************************************************************************************
	[{ // sap:creatable
		annotationsV2 : 'sap:creatable="false"',
		expectedAnnotationsV4 : {
			'@Org.OData.Capabilities.V1.InsertRestrictions' : {
				"Insertable" : false
			}
		}
	}, { // sap:deletable and sap:deletable-path
		annotationsV2 : 'sap:deletable="false"',
		expectedAnnotationsV4 : {
			'@Org.OData.Capabilities.V1.DeleteRestrictions' : {
				"Deletable" : false
			}
		}
	}, {
		annotationsV2 : 'sap:deletable-path="PathExpression"',
		expectedAnnotationsV4 : {
			'@Org.OData.Capabilities.V1.DeleteRestrictions' : {
				"Deletable" : {
					$Path : "PathExpression"
				}
			}
		}
	}, { // if both V2 annotations are set there is an inconsistency -> use false
		annotationsV2 : 'sap:deletable="foo-bar" sap:deletable-path="PathExpression"',
		expectedAnnotationsV4 : {
			'@Org.OData.Capabilities.V1.DeleteRestrictions' : {
				"Deletable" : false
			}
		},
		message : "Use either 'sap:deletable' or 'sap:deletable-path' at entity set" +
			" 'GWSAMPLE_BASIC.Container/FooSet'"
	}, {
		annotationsV2 : 'sap:deletable-path="PathExpression" sap:deletable="foo-bar"',
		expectedAnnotationsV4 : {
			'@Org.OData.Capabilities.V1.DeleteRestrictions' : {
				"Deletable" : false
			}
		},
		message : "Use either 'sap:deletable' or 'sap:deletable-path' at entity set" +
			" 'GWSAMPLE_BASIC.Container/FooSet'"
	}, { // sap:label
		annotationsV2 : 'sap:label="Value"',
		expectedAnnotationsV4 : {
			'@com.sap.vocabularies.Common.v1.Label' : 'Value'
		}
	}, { // sap:pageable
		annotationsV2 : 'sap:pageable="false"',
		expectedAnnotationsV4 : {
			'@Org.OData.Capabilities.V1.SkipSupported' : false,
			'@Org.OData.Capabilities.V1.TopSupported' : false
		}
	}, { // sap:requires-filter
		annotationsV2 : 'sap:requires-filter="true"',
		expectedAnnotationsV4 : {
			'@Org.OData.Capabilities.V1.FilterRestrictions' : {
				"RequiresFilter" : true
			}
		}
	}, { // sap:searchable - different default values in V2 and V2
		annotationsV2 : '',
		expectedAnnotationsV4 : {
			'@Org.OData.Capabilities.V1.SearchRestrictions' : {
				"Searchable" : false
			}
		}
	}, {
		annotationsV2 : 'sap:searchable="false"',
		expectedAnnotationsV4 : {
			'@Org.OData.Capabilities.V1.SearchRestrictions' : {
				"Searchable" : false
			}
		}
	}, {
		annotationsV2 : 'sap:searchable="true"',
		expectedAnnotationsV4 : {}
	}, { // sap:topable
		annotationsV2 : 'sap:topable="false"',
		expectedAnnotationsV4 : {
			'@Org.OData.Capabilities.V1.TopSupported' : false
		}
	}, { // sap:updatable and sap:updatable-path
		annotationsV2 : 'sap:updatable="false"',
		expectedAnnotationsV4 : {
			'@Org.OData.Capabilities.V1.UpdateRestrictions' : {
				"Updatable" : false
			}
		}
	}, {
		annotationsV2 : 'sap:updatable-path="PathExpression"',
		expectedAnnotationsV4 : {
			'@Org.OData.Capabilities.V1.UpdateRestrictions' : {
				"Updatable" : {
					$Path : "PathExpression"
				}
			}
		}
	}, { // if both V2 annotations are set there is an inconsistency -> use false
		annotationsV2 : 'sap:updatable-path="PathExpression" sap:updatable="foo-bar"',
		expectedAnnotationsV4 : {
			'@Org.OData.Capabilities.V1.UpdateRestrictions' : {
				"Updatable" : false
			}
		},
		message : "Use either 'sap:updatable' or 'sap:updatable-path' at entity set" +
			" 'GWSAMPLE_BASIC.Container/FooSet'"
	}, {
		annotationsV2 : 'sap:updatable="foo-bar" sap:updatable-path="PathExpression"',
		expectedAnnotationsV4 : {
			'@Org.OData.Capabilities.V1.UpdateRestrictions' : {
				"Updatable" : false
			}
		},
		message : "Use either 'sap:updatable' or 'sap:updatable-path' at entity set" +
			" 'GWSAMPLE_BASIC.Container/FooSet'"
	}].forEach(function (oFixture) {
		var sTitle = "convert: V2 annotation at EntitySet: " + oFixture.annotationsV2;

		QUnit.test(sTitle, function (assert) {
			var mAnnotations = jQuery.extend({
					'@Org.OData.Capabilities.V1.SearchRestrictions' : {
						"Searchable" : false
					}
				}, oFixture.expectedAnnotationsV4),
				sXML = '\
					<Schema Namespace="GWSAMPLE_BASIC">\
						<EntityType Name="Foo"/>\
						<EntityContainer Name="Container">\
							<EntitySet Name="FooSet" EntityType="GWSAMPLE_BASIC.Foo" '
								+ oFixture.annotationsV2 + '/>\
							</EntityContainer>\
					</Schema>',
				oExpectedResult = {
					"$EntityContainer" : "GWSAMPLE_BASIC.Container",
					"GWSAMPLE_BASIC." : {
						"$Annotations" : {
							"GWSAMPLE_BASIC.Container/FooSet" : mAnnotations
						},
						"$kind" : "Schema"
					},
					"GWSAMPLE_BASIC.Foo" : {
						"$kind" : "EntityType"
					},
					"GWSAMPLE_BASIC.Container" : {
						"$kind" : "EntityContainer",
						"FooSet" : {
							"$kind" : "EntitySet",
							"$Type" : "GWSAMPLE_BASIC.Foo"
						}
					}
				};

			// no expectedAnnotationsV4 so there is no need for $annotations at the schema
			if (!Object.keys(oFixture.expectedAnnotationsV4).length) {
				delete oExpectedResult["GWSAMPLE_BASIC."]["$Annotations"];
			}
			if (oFixture.message) {
				this.oLogMock.expects("warning")
					.withExactArgs("Inconsistent metadata in '/foo/bar/$metadata'",
						oFixture.message, sModuleName);
			}
			testConversion(assert, sXML, oExpectedResult);
		});
	});

	//*********************************************************************************************
	[{
		convertedV2Annotations : {
			"GWSAMPLE_BASIC.0001.Foo/Bar" : {
				'@com.sap.vocabularies.Common.v1.Label' : 'Value'
			}
		},
		v4Annotations : {},
		result : {
			"GWSAMPLE_BASIC.0001.Foo/Bar" : {
				'@com.sap.vocabularies.Common.v1.Label' : 'Value'
			}
		}
	}, {
		convertedV2Annotations : {
			"GWSAMPLE_BASIC.0001.Foo/Bar" : {
				'@com.sap.vocabularies.Common.v1.Label' : 'Value'
			}
		},
		v4Annotations : {
			"GWSAMPLE_BASIC.0001.Foo/tango" : {
				'@com.sap.vocabularies.Common.v1.Label' : 'Value'
			}
		},
		result : {
			"GWSAMPLE_BASIC.0001.Foo/Bar" : {
				'@com.sap.vocabularies.Common.v1.Label' : 'Value'
			},
			"GWSAMPLE_BASIC.0001.Foo/tango" : {
				'@com.sap.vocabularies.Common.v1.Label' : 'Value'
			}
		}
	}, {
		convertedV2Annotations : {
			"GWSAMPLE_BASIC.0001.Foo/Bar" : {
				'@com.sap.vocabularies.Common.v1.Label' : 'ValueV2'
			}
		},
		v4Annotations : {
			"GWSAMPLE_BASIC.0001.Foo/Bar" : {
				'@com.sap.vocabularies.Common.v1.Label' : 'ValueV4'
			}
		},
		result : {
			"GWSAMPLE_BASIC.0001.Foo/Bar" : {
				'@com.sap.vocabularies.Common.v1.Label' : 'ValueV4'
			}
		}
	}, {
		convertedV2Annotations : {
			"GWSAMPLE_BASIC.0001.Foo/Bar" : {
				'@com.sap.vocabularies.Common.v1.Label' : 'Label'
			}
		},
		v4Annotations : {
			"GWSAMPLE_BASIC.0001.Foo/Bar" : {
				'@com.sap.vocabularies.Common.v1.IsDigitSequence' : true
			}
		},
		result : {
			"GWSAMPLE_BASIC.0001.Foo/Bar" : {
				'@com.sap.vocabularies.Common.v1.IsDigitSequence' : true,
				'@com.sap.vocabularies.Common.v1.Label' : 'Label'
			}
		}
	}, {
		convertedV2Annotations : {
			"GWSAMPLE_BASIC.0001.Foo/Bar" : {
				'@Org.OData.Capabilities.V1.DeleteRestrictions' : {
					"Deletable" : false
				},
				'@com.sap.vocabularies.Common.v1.Label' : 'Label',
				'@com.sap.vocabularies.Common.v1.QuickInfo' : 'Value'
			},
			"GWSAMPLE_BASIC.0001.Foo/ChaChaCha" : {
				'@com.sap.vocabularies.Common.v1.Heading' : 'ValueV2',
				'@com.sap.vocabularies.Common.v1.Label' : 'LabelV2'
			}
		},
		v4Annotations : {
			"GWSAMPLE_BASIC.0001.Foo/Bar" : {
				'@Org.OData.Capabilities.V1.DeleteRestrictions' : {
					"NonDeletableNavigationProperties" : []
				},
				'@com.sap.vocabularies.Common.v1.IsDigitSequence' : true,
				'@com.sap.vocabularies.Common.v1.Label' : 'LabelV4'
			},
			"GWSAMPLE_BASIC.0001.Foo/Jive" : {
				'@com.sap.vocabularies.Common.v1.IsDigitSequence' : true,
				'@com.sap.vocabularies.Common.v1.QuickInfo' : 'ValueV4'
			}
		},
		result : {
			"GWSAMPLE_BASIC.0001.Foo/Bar" : {
				'@Org.OData.Capabilities.V1.DeleteRestrictions' : {
					"NonDeletableNavigationProperties" : []
				},
				'@com.sap.vocabularies.Common.v1.IsDigitSequence' : true,
				'@com.sap.vocabularies.Common.v1.Label' : 'LabelV4',
				'@com.sap.vocabularies.Common.v1.QuickInfo' : 'Value'
			},
			"GWSAMPLE_BASIC.0001.Foo/ChaChaCha" : {
				'@com.sap.vocabularies.Common.v1.Heading' : 'ValueV2',
				'@com.sap.vocabularies.Common.v1.Label' : 'LabelV2'
			},
			"GWSAMPLE_BASIC.0001.Foo/Jive" : {
				'@com.sap.vocabularies.Common.v1.IsDigitSequence' : true,
				'@com.sap.vocabularies.Common.v1.QuickInfo' : 'ValueV4'
			}
		}
	}].forEach(function (oFixture, i) {
		QUnit.test("mergeAnnotations: complex merge - " + i, function (assert) {
			// Code under test
			_V2MetadataConverter.mergeAnnotations(oFixture.convertedV2Annotations,
				oFixture.v4Annotations);

			assert.deepEqual(oFixture.v4Annotations, oFixture.result);
		});
	});

	//*********************************************************************************************
	QUnit.test("convert: V4 Annotations", function (assert) {
		testConversion(assert, '\
				<Schema Namespace="foo" Alias="f">\
					<Annotations Target="f.Bar/f.Baz">\
						<Annotation Term="f.Binary" Binary="T0RhdGE"/>\
						<Annotation Term="f.Bool" Bool="false"/>\
						<Annotation Term="f.Date" Date="2015-01-01" />\
						<Annotation Term="f.DateTimeOffset"\
							DateTimeOffset="2000-01-01T16:00:00.000-09:00" />\
						<Annotation Term="f.Decimal" Decimal="3.14" />\
						<Annotation Term="f.Duration" Duration="P11D23H59M59S" />\
						<Annotation Term="f.EnumMember"\
							EnumMember="f.Enum/Member1 f.Enum/Member2"/>\
						<Annotation Term="f.Float1" Float="2.718" />\
						<Annotation Term="f.Float2" Float="NaN" />\
						<Annotation Term="f.Float3" Float="INF" />\
						<Annotation Term="f.Float4" Float="-INF" />\
						<Annotation Term="f.Guid"\
							Guid="21EC2020-3AEA-1069-A2DD-08002B30309D" />\
						<Annotation Term="f.Int1" Int="42"/>\
						<Annotation Term="f.Int2" Int="9007199254740991" />\
						<Annotation Term="f.Int3" Int="9007199254740992" />\
						<Annotation Term="f.String" String="foobar" />\
						<Annotation Term="f.TimeOfDay" TimeOfDay="21:45:00" />\
						<Annotation Term="f.AnnotationPath"\
							AnnotationPath="Path/f.Bar/f.Baz@f.Term" />\
						<Annotation Term="f.NavigationPropertyPath"\
							NavigationPropertyPath="Path/f.Bar/f.Baz" />\
						<Annotation Term="f.Path" Path="Path/f.Bar/f.Baz" />\
						<Annotation Term="f.PropertyPath" PropertyPath="Path/f.Bar/f.Baz" />\
						<Annotation Term="f.UrlRef" UrlRef="http://foo.bar" />\
						<Annotation Term="f.Invalid" Invalid="foo" />\
						<Annotation Term="f.Baz" Qualifier="Employee"/>\
					</Annotations>\
					<Annotations Target="f.Bar/Abc" Qualifier="Employee">\
						<Annotation Term="f.Baz"/>\
					</Annotations>\
				</Schema>',
			{
				"$Version" : "4.0",
				"foo." : {
					"$kind" : "Schema",
					"$Annotations" : {
						"foo.Bar/foo.Baz" : {
							"@foo.Binary" : {"$Binary" : "T0RhdGE"},
							"@foo.Bool" : false,
							"@foo.Date" : {"$Date" : "2015-01-01"},
							"@foo.DateTimeOffset" : {
								"$DateTimeOffset" : "2000-01-01T16:00:00.000-09:00"
							},
							"@foo.Decimal" : {"$Decimal" : "3.14"},
							"@foo.Duration" : {"$Duration" : "P11D23H59M59S"},
							"@foo.EnumMember" : {
								"$EnumMember" : "foo.Enum/Member1 foo.Enum/Member2"
							},
							"@foo.Float1" : 2.718,
							"@foo.Float2" : {"$Float" : "NaN"},
							"@foo.Float3" : {"$Float" : "INF"},
							"@foo.Float4" : {"$Float" : "-INF"},
							"@foo.Guid" : {"$Guid" : "21EC2020-3AEA-1069-A2DD-08002B30309D"},
							"@foo.Int1" : 42,
							"@foo.Int2" : 9007199254740991,
							"@foo.Int3" : {"$Int" : "9007199254740992"},
							"@foo.String" : "foobar",
							"@foo.TimeOfDay" : {"$TimeOfDay" : "21:45:00"},
							"@foo.AnnotationPath" : {
								"$AnnotationPath" : "Path/foo.Bar/foo.Baz@foo.Term"
							},
							"@foo.NavigationPropertyPath" : {
								"$NavigationPropertyPath" : "Path/foo.Bar/foo.Baz"
							},
							"@foo.Path" : {"$Path" : "Path/foo.Bar/foo.Baz"},
							"@foo.PropertyPath" : {"$PropertyPath" : "Path/foo.Bar/foo.Baz"},
							"@foo.UrlRef" : {"$UrlRef" : "http://foo.bar"},
							"@foo.Invalid" : true,
							"@foo.Baz#Employee" : true
						},
						"foo.Bar/Abc" : {"@foo.Baz#Employee" : true}
					}
				}
			});
	});

	//*********************************************************************************************
	QUnit.test("convert: sap:label at EntityType", function (assert) {
		testConversion(assert, '\
				<Schema Namespace="foo">\
					<EntityType Name="Bar" sap:label="LabelEntityType"/>\
				</Schema>',
				{
					"foo." : {
						"$Annotations" : {
							"foo.Bar" : {
								'@com.sap.vocabularies.Common.v1.Label' : 'LabelEntityType'
							}
						},
						"$kind" : "Schema"
					},
					"foo.Bar" : {
						"$kind" : "EntityType"
					}
				});
	});
	// TODO convert sap:label at FunctionImport and Parameter
	// TODO InsertRestrictions, DeleteRestrictions or UpdateRestrictions define two properties
	// Xable and NonXableNavigationProperties (e.g. Insertable and
	// NonInsertableNavigationProperties); take care that both can contain values and do not
	// overwrite the others
});
