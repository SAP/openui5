/*!
 * ${copyright}
 */
sap.ui.require([
	"sap/ui/model/odata/v4/lib/_MetadataConverter",
	"sap/ui/test/TestUtils",
	'jquery.sap.xml' // needed to have jQuery.sap.parseXML
], function (MetadataConverter, TestUtils) {
	/*global QUnit, sinon */
	/*eslint max-nested-callbacks: 0, no-multi-str: 0, no-warning-comments: 0 */
	"use strict";

	var mFixture = {
			"/sap/opu/local_v4/IWBEP/TEA_BUSI/$metadata" : {source : "metadata.xml"},
			"/sap/opu/local_v4/IWBEP/TEA_BUSI/metadata.json" : {source : "metadata.json"}
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
		var oXML = xml(assert, '<Edmx>' + sXmlSnippet + '</Edmx>'),
			oResult = MetadataConverter.convertXMLMetadata(oXML);

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
	QUnit.module("sap.ui.model.odata.v4.lib._MetadataConverter", {
		beforeEach : function () {
			this.oSandbox = sinon.sandbox.create();
			TestUtils.useFakeServer(this.oSandbox, "sap/ui/core/qunit/odata/v4/data", mFixture);
			this.oLogMock = this.oSandbox.mock(jQuery.sap.log);
			this.oLogMock.expects("warning").never();
			this.oLogMock.expects("error").never();
		},

		afterEach : function () {
			this.oSandbox.verifyAndRestore();
		}
	});

	//*********************************************************************************************
	QUnit.test("traverse", function (assert) {
		var oXML = xml(assert, "<foo><!-- a comment -->text<bar/>more text <ignore/><bar/>"
				+ "<bar><included/></bar>"
				+ "\n<bar><innerBar/><innerBar/><innerBar2/></bar></foo>"),
			oAggregate = {
				bar: 0,
				innerBar: 0,
				innerBar2: 0,
				included: 0
			},
			oIncludeConfig = {
				"included" : {
					__processor: processor.bind(null, "included")
				}
			},
			oSchemaConfig = {
				"bar": {
					__processor: processor.bind(null, "bar"),
					__include: oIncludeConfig,
					"innerBar": {
						__processor: processor.bind(null, "innerBar")
					},
					"innerBar2": {
						__processor: processor.bind(null, "innerBar2")
					}
				}
			};

		function processor(sExpectedName, oElement, oMyAggregate) {
			assert.strictEqual(oElement.nodeType, 1, "is an Element");
			assert.strictEqual(oElement.localName, sExpectedName);
			assert.strictEqual(oMyAggregate, oAggregate);
			oMyAggregate[sExpectedName]++;
		}

		MetadataConverter.traverse(oXML.documentElement, oAggregate, oSchemaConfig);
		assert.strictEqual(oAggregate.bar, 4);
		assert.strictEqual(oAggregate.innerBar, 2);
		assert.strictEqual(oAggregate.innerBar2, 1);
		assert.strictEqual(oAggregate.included, 1);
	});

	//*********************************************************************************************
	QUnit.test("resolveAlias", function (assert) {
		var oAggregate = {
				aliases : {
					"display": "org.example.vocabularies.display"
				}
			};

		// Types
		assert.strictEqual(MetadataConverter.resolveAlias("display.Foo", oAggregate),
			"org.example.vocabularies.display.Foo");
		assert.strictEqual(MetadataConverter.resolveAlias("display.bar.Foo", oAggregate),
			"display.bar.Foo");
		assert.strictEqual(MetadataConverter.resolveAlias("bar.Foo", oAggregate), "bar.Foo");
		assert.strictEqual(MetadataConverter.resolveAlias("Foo", oAggregate), "Foo");

		// EntitySets etc
		assert.strictEqual(MetadataConverter.resolveAlias("display.Container/Foo", oAggregate),
			"org.example.vocabularies.display.Container/Foo");
	});
	// TODO paths with type cast (not relevant for walking skeleton)

	//*********************************************************************************************
	QUnit.test("convertXMLMetadata: Singleton", function (assert) {
		testConversion(assert, '\
				<DataServices>\
					<Schema Namespace="foo" Alias="f">\
						<EntityContainer Name="Container">\
							<Singleton Name="Me" Type="f.Worker">\
								<NavigationPropertyBinding Path="Manager" Target="f.Manager"/>\
							</Singleton>\
						</EntityContainer>\
					</Schema>\
				</DataServices>',
			{
				"$EntityContainer": "foo.Container",
				"foo.Container": {
					"$kind": "EntityContainer",
					"Me": {
						"$kind": "Singleton",
						"$NavigationPropertyBinding" : {
							"Manager" : "foo.Manager"
						},
						"$Type": "foo.Worker"
					}
				}
			});
	});

	//*********************************************************************************************
	QUnit.test("convertXMLMetadata: aliases in types", function (assert) {
		testConversion(assert, '\
				<Reference Uri="qux/$metadata">\
					<Include Namespace="qux" Alias="q"/>\
				</Reference>\
				<DataServices>\
					<Schema Namespace="bar">\
						<ComplexType Name="Worker">\
							<Property Name="Something" Type="q.Something"/>\
							<Property Name="ManyThings" Type="Collection(q.Something)"/>\
							<NavigationProperty Name="DefaultAddress" Type="f.Address"/>\
							<NavigationProperty Name="AllAddresses" Type="Collection(f.Address)"/>\
						</ComplexType>\
					</Schema>\
					<Schema Namespace="foo" Alias="f"/>\
				</DataServices>',
			{
				"qux": {
					"$kind": "Reference",
					"$ref": "qux/$metadata"
				},
				"bar.Worker": {
					"$kind": "ComplexType",
					"Something": {
						"$Type": "qux.Something"
					},
					"ManyThings" : {
						"$isCollection" : true,
						"$Type": "qux.Something"
					},
					"DefaultAddress": {
						"$kind": "navigation",
						"$Type": "foo.Address"
					},
					"AllAddresses": {
						"$kind": "navigation",
						"$isCollection" : true,
						"$Type": "foo.Address"
					}
				}
			});
	});
	QUnit.test("convertXMLMetadata: aliases in container", function (assert) {
		testConversion(assert, '\
				<DataServices>\
					<Schema Namespace="foo" Alias="f">\
						<EntityContainer Name="Container">\
							<EntitySet Name="SpecialTeams" EntityType="f.Team">\
							</EntitySet>\
							<EntitySet Name="Teams" EntityType="f.Team">\
								<NavigationPropertyBinding Path="Manager" Target="f.Container/Managers"/>\
							</EntitySet>\
						</EntityContainer>\
					</Schema>\
				</DataServices>',
			{
				"$EntityContainer": "foo.Container",
				"foo.Container": {
					"$kind": "EntityContainer",
					"SpecialTeams": {
						"$Type": "foo.Team"
					},
					"Teams": {
						"$NavigationPropertyBinding" : {
							"Manager": "foo.Container/Managers"
						},
						"$Type": "foo.Team"
					}
				}
			});
	});

	//*********************************************************************************************
	QUnit.test("convertXMLMetadata: IncludeInServiceDocument", function (assert) {
		testConversion(assert, '\
				<DataServices>\
					<Schema Namespace="foo">\
						<EntityContainer Name="Container">\
							<EntitySet Name="Teams" EntityType="foo.Team" IncludeInServiceDocument="false"/>\
							<EntitySet Name="Teams2" EntityType="foo.Team" IncludeInServiceDocument="true"/>\
							<EntitySet Name="Teams3" EntityType="foo.Team"/>\
						</EntityContainer>\
					</Schema>\
				</DataServices>',
			{
				"$EntityContainer": "foo.Container",
				"foo.Container": {
					"$kind": "EntityContainer",
					"Teams": {
						"$Type": "foo.Team",
						"$IncludeInServiceDocument": false
					},
					"Teams2": {
						"$Type": "foo.Team"
					},
					"Teams3": {
						"$Type": "foo.Team"
					}
				}
			});
	});

	//*********************************************************************************************
	QUnit.test("convertXMLMetadata: EntityType attributes, key alias", function (assert) {
		testConversion(assert, '\
				<DataServices>\
					<Schema Namespace="foo">\
						<EntityType Name="Worker" OpenType="true" HasStream="true">\
							<Key>\
								<PropertyRef Name="Bar/Baz" Alias="qux"/>\
							</Key>\
						</EntityType>\
						<EntityType Name="Base" Abstract="true"/>\
						<EntityType Name="Derived" BaseType="foo.Base"/>\
					</Schema>\
				</DataServices>',
			{
				"foo.Worker": {
					"$Key": [
						{"qux": "Bar/Baz"}
					],
					"$OpenType": true,
					"$HasStream": true
				},
				"foo.Base": {
					"$Key": [],
					"$Abstract": true
				},
				"foo.Derived": {
					"$Key": [],
					"$BaseType": "foo.Base"
				}
			});
	});

	//*********************************************************************************************
	QUnit.test("convertXMLMetadata: ComplexType attributes", function (assert) {
		testConversion(assert, '\
				<DataServices>\
					<Schema Namespace="foo">\
						<ComplexType Name="Worker" OpenType="true" HasStream="true"/>\
						<ComplexType Name="Base" Abstract="true"/>\
						<ComplexType Name="Derived" BaseType="foo.Base"/>\
					</Schema>\
				</DataServices>',
			{
				"foo.Worker": {
					"$kind": "ComplexType",
					"$OpenType": true,
					"$HasStream": true
				},
				"foo.Base": {
					"$kind": "ComplexType",
					"$Abstract": true
				},
				"foo.Derived": {
					"$kind": "ComplexType",
					"$BaseType": "foo.Base"
				}
			});
	});

	//*********************************************************************************************
	["ComplexType", "EntityType"].forEach(function (sType) {
		QUnit.test("convertXMLMetadata: " + sType + ": (Navigation)Property", function (assert) {
			var oExpected = {
					"foo.Worker": {
						"Salary": {
							"$Type": "Edm.Decimal",
							"$Precision": 8,
							"$Scale": 2
						},
						"p1": {
							"$Type": "Edm.String",
							"$Unicode": false
						},
						"p2": {
							"$Type": "Edm.String"
						},
						"p3": {
							"$Type": "Edm.Geometry",
							"$SRID":"42"
						},
						"p4": {
							"$Type": "Edm.Int32",
							"$DefaultValue": "12345"
						},
						"team1": {
							"$kind": "navigation",
							"$Type": "foo.Team",
							"$Partner": "worker",
							"$OnDelete": "SetDefault",
							"$ReferentialConstraint": {
								"p1": "p1Key",
								"p2": "p2Key"
							}
						},
						"team2": {
							"$kind": "navigation",
							"$Type": "foo.Team",
							"$ContainsTarget": true
						},
						"team3": {
							"$kind": "navigation",
							"$Type": "foo.Team"
						}
					}
				};

			if (sType === "ComplexType") {
				oExpected["foo.Worker"].$kind = sType;
			} else {
				oExpected["foo.Worker"].$Key = [];
			}
			testConversion(assert, '\
					<DataServices>\
						<Schema Namespace="foo">\
							<' + sType + ' Name="Worker">\
								<Property Name="Salary" Type="Edm.Decimal" Precision="8" Scale="2"/>\
								<Property Name="p1" Type="Edm.String" Unicode="false" />\
								<Property Name="p2" Type="Edm.String" Unicode="true" />\
								<Property Name="p3" Type="Edm.Geometry" SRID="42" />\
								<Property Name="p4" Type="Edm.Int32" DefaultValue="12345" />\
								<NavigationProperty Name="team1" Type="foo.Team" Partner="worker">\
									<OnDelete Action="SetDefault"/>\
									<ReferentialConstraint Property="p1" ReferencedProperty="p1Key" />\
									<ReferentialConstraint Property="p2" ReferencedProperty="p2Key" />\
								</NavigationProperty>\
								<NavigationProperty Name="team2" Type="foo.Team" ContainsTarget="true" />\
								<NavigationProperty Name="team3" Type="foo.Team" ContainsTarget="false" />\
							</' + sType + '>\
						</Schema>\
					</DataServices>',
				oExpected);
		});
	});
	// TODO adjust $DefaultValue to property type?

	//*********************************************************************************************
	QUnit.test("convertXMLMetadata: test service", function (assert) {
		return Promise.all([
			jQuery.ajax("/sap/opu/local_v4/IWBEP/TEA_BUSI/$metadata")
				.then(function (oXML) {
					return MetadataConverter.convertXMLMetadata(oXML);
				}),
			jQuery.ajax("/sap/opu/local_v4/IWBEP/TEA_BUSI/metadata.json")
		]).then(function (aResults) {
			assert.deepEqual(aResults[0], aResults[1]);
		});
	});
});
