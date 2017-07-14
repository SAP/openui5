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

	var mFixture = {
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
		var oXML = xml(assert, '<Edmx xmlns:sap="http://www.sap.com/Protocols/SAPData">'
				+ '<DataServices>' + sXmlSnippet + '</DataServices></Edmx>'),
			oResult = _V2MetadataConverter.convertXMLMetadata(oXML);

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
						<Property Name="ManyThings" Type="Collection(b.Something)"/>\
					</ComplexType>\
				</Schema>\
				<Schema Namespace="foo" Alias="f"/>',
			{
				"$Version" : "4.0",
				"bar." : {
					"$kind" : "Schema"
				},
				"bar.Worker" : {
					"$kind" : "ComplexType",
					"Something" : {
						"$kind" : "Property",
						"$Type" : "bar.Something"
					},
					"ManyThings" : {
						"$kind" : "Property",
						"$isCollection" : true,
						"$Type" : "bar.Something"
					}
				},
				"foo." : {
					"$kind" : "Schema"
				}
			});
	});

	//*********************************************************************************************
	QUnit.test("convertXMLMetadata: EntityType attributes, key alias", function (assert) {
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
				"$Version" : "4.0",
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
	QUnit.test("convertXMLMetadata: ComplexType attributes", function (assert) {
		testConversion(assert, '\
				<Schema Namespace="foo">\
					<ComplexType Name="Worker" />\
				</Schema>',
			{
				"$Version" : "4.0",
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
								<Property Name="p1" Type="Collection(' + sNamespace + 'String)"\
									Unicode="false" />\
								<Property Name="p2" Type="' + sNamespace + 'String"\
								    Unicode="true" />\
								<Property Name="p3" Type="' + sNamespace + 'Int32"\
									DefaultValue="42"/>\
								<Property Name="p4" Type="' + sNamespace + 'Time"/>\
								<Property Name="p5" Type="' + sNamespace + 'DateTime"/>\
								<Property Name="p6" Type="' + sNamespace + 'DateTime"\
									sap:display-format="Date"/>\
								<Property Name="p7" Type="' + sNamespace + 'Float"/>\
							</' + sType + '>\
						</Schema>',
					{
						"$Version" : "4.0",
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
								"$isCollection" : true,
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
	QUnit.test("testNavigationPropertyConversion", function (assert) {
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
				"$Version" : "4.0",
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
});
