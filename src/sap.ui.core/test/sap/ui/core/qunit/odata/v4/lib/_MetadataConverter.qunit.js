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

		assert.strictEqual(MetadataConverter.resolveAlias("", oAggregate), "");
		assert.strictEqual(MetadataConverter.resolveAlias("display.Foo", oAggregate),
			"org.example.vocabularies.display.Foo");
		assert.strictEqual(MetadataConverter.resolveAlias("display.bar.Foo", oAggregate),
			"display.bar.Foo");
		assert.strictEqual(MetadataConverter.resolveAlias("bar.Foo", oAggregate), "bar.Foo");
		assert.strictEqual(MetadataConverter.resolveAlias("Foo", oAggregate), "Foo");
	});

	//*********************************************************************************************
	QUnit.test("resolveAliasInPath", function (assert) {
		var oAggregate = {},
			oMock = this.mock(MetadataConverter);

			function test(sPath, sExpected) {
				assert.strictEqual(MetadataConverter.resolveAliasInPath(sPath, oAggregate),
					sExpected || sPath);
			}

			oMock.expects("resolveAlias").never();

			test("Employees");
			test("Employees/Team");

			oMock.expects("resolveAlias")
				.withExactArgs("f.Some", sinon.match.same(oAggregate)).returns("foo.Some");
			oMock.expects("resolveAlias")
				.withExactArgs("f.Random", sinon.match.same(oAggregate)).returns("foo.Random");
			oMock.expects("resolveAlias")
				.withExactArgs("f.Path", sinon.match.same(oAggregate)).returns("foo.Path");
			test("f.Some/f.Random/f.Path", "foo.Some/foo.Random/foo.Path");

			oMock.expects("resolveAlias")
				.withExactArgs("f.Path", sinon.match.same(oAggregate)).returns("foo.Path");
			oMock.expects("resolveAlias")
				.withExactArgs("f.Term", sinon.match.same(oAggregate)).returns("foo.Term");
			test("f.Path@f.Term", "foo.Path@foo.Term");

			oMock.expects("resolveAlias")
				.withExactArgs("f.Path", sinon.match.same(oAggregate)).returns("foo.Path");
			oMock.expects("resolveAlias")
				.withExactArgs("", sinon.match.same(oAggregate)).returns("");
			oMock.expects("resolveAlias")
				.withExactArgs("f.Term", sinon.match.same(oAggregate)).returns("foo.Term");
			test("f.Path/@f.Term", "foo.Path/@foo.Term");
	});

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
						"$kind": "Property",
						"$Type": "qux.Something"
					},
					"ManyThings" : {
						"$kind": "Property",
						"$isCollection" : true,
						"$Type": "qux.Something"
					},
					"DefaultAddress": {
						"$kind": "NavigationProperty",
						"$Type": "foo.Address"
					},
					"AllAddresses": {
						"$kind": "NavigationProperty",
						"$isCollection" : true,
						"$Type": "foo.Address"
					}
				}
			});
	});

	//*********************************************************************************************
	QUnit.test("convertXMLMetadata: aliases in container", function (assert) {
		testConversion(assert, '\
				<DataServices>\
					<Schema Namespace="foo" Alias="f">\
						<EntityContainer Name="Container">\
							<EntitySet Name="SpecialTeams" EntityType="f.Team">\
							</EntitySet>\
							<EntitySet Name="Teams" EntityType="f.Team">\
								<NavigationPropertyBinding Path="Manager"\
									Target="f.Container/Managers"/>\
								<NavigationPropertyBinding Path="Foo"\
									Target="other.Container/Foo"/>\
								<NavigationPropertyBinding Path="Bar"\
									Target="f.Container/Foo/Bar"/>\
								<NavigationPropertyBinding Path="Baz"\
									Target="f.Container/Manager/f.Employee"/>\
							</EntitySet>\
						</EntityContainer>\
					</Schema>\
				</DataServices>',
			{
				"$EntityContainer": "foo.Container",
				"foo.Container": {
					"$kind": "EntityContainer",
					"SpecialTeams": {
						"$kind": "EntitySet",
						"$Type": "foo.Team"
					},
					"Teams": {
						"$kind": "EntitySet",
						"$NavigationPropertyBinding" : {
							"Manager": "Managers",
							"Foo": "other.Container/Foo",
							"Bar": "foo.Container/Foo/Bar",
							"Baz": "foo.Container/Manager/foo.Employee"
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
							<EntitySet Name="Teams" EntityType="foo.Team"\
								IncludeInServiceDocument="false"/>\
							<EntitySet Name="Teams2" EntityType="foo.Team"\
								IncludeInServiceDocument="true"/>\
							<EntitySet Name="Teams3" EntityType="foo.Team"/>\
						</EntityContainer>\
					</Schema>\
				</DataServices>',
			{
				"$EntityContainer": "foo.Container",
				"foo.Container": {
					"$kind": "EntityContainer",
					"Teams": {
						"$kind": "EntitySet",
						"$Type": "foo.Team",
						"$IncludeInServiceDocument": false
					},
					"Teams2": {
						"$kind": "EntitySet",
						"$Type": "foo.Team"
					},
					"Teams3": {
						"$kind": "EntitySet",
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
					"$kind": "EntityType",
					"$Key": [
						{"qux": "Bar/Baz"}
					],
					"$OpenType": true,
					"$HasStream": true
				},
				"foo.Base": {
					"$kind": "EntityType",
					"$Key": [],
					"$Abstract": true
				},
				"foo.Derived": {
					"$kind": "EntityType",
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
	QUnit.test("processFacetAttributes", function (assert) {
		function test(sProperty, sValue, vExpectedValue) {
			var oAttributes = {},
				oResult = {},
				oExpectedResult = {};

			oAttributes[sProperty] = sValue;
			if (vExpectedValue !== undefined) {
				oExpectedResult["$" + sProperty] = vExpectedValue;
			}
			MetadataConverter.processFacetAttributes(oAttributes, oResult);
			assert.deepEqual(oResult, oExpectedResult);
		}

		test("Precision", "8", 8);
		test("Scale", "2", 2);
		test("Scale", "variable", "variable");
		test("Unicode", "false", false);
		test("Unicode", "true", undefined);
		test("MaxLength", "12345", 12345);
		test("SRID", "42", "42");
	});

	//*********************************************************************************************
	["ComplexType", "EntityType"].forEach(function (sType) {
		QUnit.test("convertXMLMetadata: " + sType + ": (Navigation)Property", function (assert) {
			var oExpected = {
					"foo.Worker": {
						"$kind": sType,
						"Salary": {
							"$kind": "Property",
							"$Type": "Edm.Decimal",
							"$Precision": 8,
							"$Scale": 2
						},
						"p1": {
							"$kind": "Property",
							"$Type": "Edm.String",
							"$Unicode": false
						},
						"p2": {
							"$kind": "Property",
							"$Type": "Edm.String"
						},
						"p3": {
							"$kind": "Property",
							"$Type": "Edm.Geometry",
							"$SRID":"42"
						},
						"p4": {
							"$kind": "Property",
							"$Type": "Edm.Int32",
							"$DefaultValue" : "42"
						},
						"team1": {
							"$kind": "NavigationProperty",
							"$Type": "foo.Team",
							"$Partner": "worker",
							"$OnDelete": "SetDefault",
							"$ReferentialConstraint": {
								"p1": "p1Key",
								"p2": "p2Key"
							}
						},
						"team2": {
							"$kind": "NavigationProperty",
							"$Type": "foo.Team",
							"$ContainsTarget": true
						},
						"team3": {
							"$kind": "NavigationProperty",
							"$Type": "foo.Team"
						}
					}
				};

			if (sType === "EntityType") {
				oExpected["foo.Worker"].$Key = [];
			}

			testConversion(assert, '\
					<DataServices>\
						<Schema Namespace="foo">\
							<' + sType + ' Name="Worker">\
								<Property Name="Salary" Type="Edm.Decimal" Precision="8"\
									Scale="2"/>\
								<Property Name="p1" Type="Edm.String" Unicode="false" />\
								<Property Name="p2" Type="Edm.String" Unicode="true" />\
								<Property Name="p3" Type="Edm.Geometry" SRID="42" />\
								<Property Name="p4" Type="Edm.Int32" DefaultValue="42"/>\
								<NavigationProperty Name="team1" Type="foo.Team" Partner="worker">\
									<OnDelete Action="SetDefault"/>\
									<ReferentialConstraint Property="p1"\
										ReferencedProperty="p1Key" />\
									<ReferentialConstraint Property="p2"\
										ReferencedProperty="p2Key" />\
								</NavigationProperty>\
								<NavigationProperty Name="team2" Type="foo.Team"\
									ContainsTarget="true" />\
								<NavigationProperty Name="team3" Type="foo.Team"\
									ContainsTarget="false" />\
							</' + sType + '>\
						</Schema>\
					</DataServices>',
				oExpected);
		});
	});

	//*********************************************************************************************
	QUnit.test("convertXMLMetadata: EnumType", function (assert) {
		testConversion(assert, '\
				<DataServices>\
					<Schema Namespace="foo">\
						<EnumType Name="Bar1" IsFlags="true">\
							<Member Name="p_1" Value="1" />\
						</EnumType>\
						<EnumType Name="Bar2" UnderlyingType="Edm.Int32" >\
							<Member Name="_1" />\
							<Member Name="_2" />\
						</EnumType>\
						<EnumType Name="Baz1"  IsFlags="false" UnderlyingType="Edm.Int64">\
							<Member Name="_1" Value="9007199254740991" />\
							<Member Name="_2" Value="9007199254740992" />\
						</EnumType>\
						<EnumType Name="Baz2" UnderlyingType="Edm.Int64">\
							<Member Name="_1" />\
							<Member Name="_2" />\
						</EnumType>\
						<EnumType Name="Qux1" UnderlyingType="Edm.Int16">\
							<Member Name="_1" />\
						</EnumType>\
						<EnumType Name="Qux2" UnderlyingType="Edm.Byte">\
							<Member Name="_1" />\
						</EnumType>\
						<EnumType Name="Qux3" UnderlyingType="Edm.SByte">\
							<Member Name="_1" />\
						</EnumType>\
					</Schema>\
				</DataServices>',
			{
				"foo.Bar1": {
					"$kind": "EnumType",
					"$IsFlags": true,
					"p_1": 1
				},
				"foo.Bar2": {
					"$kind": "EnumType",
					"_1": 0,
					"_2": 1
				},
				"foo.Baz1": {
					"$kind": "EnumType",
					"$UnderlyingType": "Edm.Int64",
					"_1": 9007199254740991,
					"_2": "9007199254740992"
				},
				"foo.Baz2": {
					"$kind": "EnumType",
					"$UnderlyingType": "Edm.Int64",
					"_1": 0,
					"_2": 1
				},
				"foo.Qux1": {
					"$kind": "EnumType",
					"$UnderlyingType": "Edm.Int16",
					"_1": 0
				},
				"foo.Qux2": {
					"$kind": "EnumType",
					"$UnderlyingType": "Edm.Byte",
					"_1": 0
				},
				"foo.Qux3": {
					"$kind": "EnumType",
					"$UnderlyingType": "Edm.SByte",
					"_1": 0
				}
			});
	});

	//*********************************************************************************************
	QUnit.test("convertXMLMetadata: TypeDefinition", function (assert) {
		this.mock(MetadataConverter).expects("processFacetAttributes")
			.withExactArgs({
				Name: "Bar",
				UnderlyingType: "Edm.String"
			}, {
				$kind: "TypeDefinition",
				$UnderlyingType: "Edm.String"
			});
		testConversion(assert, '\
				<DataServices>\
					<Schema Namespace="foo">\
						<TypeDefinition Name="Bar" UnderlyingType="Edm.String"/>\
					</Schema>\
				</DataServices>',
			{
				"foo.Bar": {
					"$kind": "TypeDefinition",
					"$UnderlyingType": "Edm.String"
				}
			});
	});

	//*********************************************************************************************
	["Action", "Function"].forEach(function (sRunnable) {
		QUnit.test("convertXMLMetadata: " + sRunnable, function (assert) {
			testConversion(assert, '\
					<DataServices>\
						<Schema Namespace="foo" Alias="f">\
							<' + sRunnable + ' Name="Baz" EntitySetPath="Employees"\
								IsBound="false" >\
								<Parameter Name="p1" Type="f.Bar" Nullable="false"/>\
								<Parameter Name="p2" Type="Collection(f.Bar)" MaxLength="10"\
									Precision="2" Scale="variable" SRID="42"/>\
								<ReturnType Type="Collection(Edm.String)" Nullable="false"\
									MaxLength="10" Precision="2" Scale="variable" SRID="42"/>\
							</' + sRunnable + '>\
							<' + sRunnable + ' Name="Baz" IsComposable="true" IsBound="true"/>\
						</Schema>\
					</DataServices>',
				{
					"foo.Baz": [{
						"$kind": sRunnable,
						"$EntitySetPath": "Employees",
						"$Parameter": [{
							"$kind": "Parameter",
							"$Name": "p1",
							"$Type": "foo.Bar",
							"$Nullable": false
						},{
							"$kind": "Parameter",
							"$Name": "p2",
							"$isCollection": true,
							"$Type": "foo.Bar",
							"$MaxLength": 10,
							"$Precision": 2,
							"$Scale": "variable",
							"$SRID": "42"
						}],
						"$ReturnType" : {
							"$isCollection": true,
							"$Type": "Edm.String",
							"$Nullable": false,
							"$MaxLength": 10,
							"$Precision": 2,
							"$Scale": "variable",
							"$SRID": "42"
						}
					},{
						"$kind": sRunnable,
						"$IsBound": true,
						"$IsComposable": true,
						"$Parameter": []
					}]
				});
		});
	});

	//*********************************************************************************************
	["Action", "Function"].forEach(function (sWhat) {
		QUnit.test("convertXMLMetadata: " + sWhat + "Import", function (assert) {
			var oExpected = {
					"$EntityContainer": "foo.Container",
					"foo.Container": {
						"$kind": "EntityContainer",
						"Baz1": {
							"$EntitySet": "Employees",
							"$IncludeInServiceDocument": false
						},
						"Baz2": {
						},
						"Baz3": {
							"$EntitySet": "Employees"
						},
						"Baz4": {
							"$EntitySet": "some.other.Container/Employees"
						},
						"Baz5": {
							"$EntitySet": "foo.Container/Employees/Team"
						}
					}
				},
				oContainer = oExpected["foo.Container"];

			Object.keys(oContainer).forEach(function (sKey) {
				var oValue = oContainer[sKey];
				if (sKey !== "$kind") {
					oValue.$kind = sWhat + "Import";
					oValue["$" + sWhat] = "foo.Baz";
				}
			});
			testConversion(assert, '\
					<DataServices>\
						<Schema Namespace="foo" Alias="f">\
							<EntityContainer Name="Container">\
								<' + sWhat + 'Import Name="Baz1" ' + sWhat + '="foo.Baz"\
									EntitySet="Employees" IncludeInServiceDocument="false"/>\
								<' + sWhat + 'Import Name="Baz2" ' + sWhat + '="f.Baz"\
									IncludeInServiceDocument="true"/>\
								<' + sWhat + 'Import Name="Baz3" ' + sWhat + '="f.Baz"\
									EntitySet="f.Container/Employees"/>\
								<' + sWhat + 'Import Name="Baz4" ' + sWhat + '="f.Baz"\
									EntitySet="some.other.Container/Employees"/>\
								<' + sWhat + 'Import Name="Baz5" ' + sWhat + '="f.Baz"\
									EntitySet="f.Container/Employees/Team"/>\
							</EntityContainer>\
						</Schema>\
					</DataServices>',
				oExpected);
		});
	});

	//*********************************************************************************************
	QUnit.test("convertXMLMetadata: Term", function (assert) {
		testConversion(assert, '\
				<DataServices>\
					<Schema Namespace="foo" Alias="f">\
						<Term Name="Term1" Type="Collection(Edm.String)" Nullable="false"\
							MaxLength="10" Precision="2" Scale="variable" SRID="42"/>\
						<Term Name="Term2" Type="f.Bar" BaseTerm="f.Term1" Nullable="true"/>\
					</Schema>\
				</DataServices>',
			{
				"foo.Term1": {
					"$kind": "Term",
					"$isCollection": true,
					"$Type": "Edm.String",
					"$Nullable": false,
					"$MaxLength": 10,
					"$Precision": 2,
					"$Scale": "variable",
					"$SRID": "42"
				},
				"foo.Term2": {
					"$kind": "Term",
					"$Type": "foo.Bar",
					"$BaseTerm": "foo.Term1"
				}
			});
	});

	//*********************************************************************************************
	QUnit.test("convertXMLMetadata: Annotations", function (assert) {
		testConversion(assert, '\
				<DataServices>\
					<Schema Namespace="foo" Alias="f">\
						<Annotations Target="f.Bar/f.Baz">\
							<Annotation Term="f.Binary" Binary="T0RhdGE"/>\
							<Annotation Term="f.Bool" Bool="false"/>\
							<Annotation Term="f.Date" Date="2015-01-01" />\
							<Annotation Term="f.DateTimeOffset"\
								DateTimeOffset="2000-01-01T16:00:00.000-09:00" />\
							<Annotation Term="f.Decimal" Decimal="3.14" />\
							<Annotation Term="f.Duration" Duration="P11D23H59M59S" />\
							<Annotation Term="f.EnumMember1" EnumMember="0" />\
							<Annotation Term="f.EnumMember2" EnumMember="9007199254740991" />\
							<Annotation Term="f.EnumMember3" EnumMember="9007199254740992" />\
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
							<Annotation Term="f.Baz" Qualifier="Employee"/>\
						</Annotations>\
						<Annotations Target="f.Bar/Abc" Qualifier="Employee">\
							<Annotation Term="f.Baz"/>\
						</Annotations>\
					</Schema>\
				</DataServices>',
			{
				"$Annotations": {
					"foo.Bar/foo.Baz": {
						"@foo.Binary": {"$Binary": "T0RhdGE"},
						"@foo.Bool": false,
						"@foo.Date": {"$Date" : "2015-01-01"},
						"@foo.DateTimeOffset": {
							"$DateTimeOffset" : "2000-01-01T16:00:00.000-09:00"
						},
						"@foo.Decimal": {"$Decimal" : "3.14"},
						"@foo.Duration": {"$Duration" : "P11D23H59M59S"},
						"@foo.EnumMember1": {"$EnumMember" : 0},
						"@foo.EnumMember2": {"$EnumMember" : 9007199254740991},
						"@foo.EnumMember3": {"$EnumMember" : "9007199254740992"},
						"@foo.Float1": 2.718,
						"@foo.Float2": {"$Float": "NaN"},
						"@foo.Float3": {"$Float": "Infinity"},
						"@foo.Float4": {"$Float": "-Infinity"},
						"@foo.Guid": {"$Guid" : "21EC2020-3AEA-1069-A2DD-08002B30309D"},
						"@foo.Int1": 42,
						"@foo.Int2": 9007199254740991,
						"@foo.Int3": {"$Int" : "9007199254740992"},
						"@foo.String": "foobar",
						"@foo.TimeOfDay": {"$TimeOfDay": "21:45:00"},
						"@foo.AnnotationPath": {
							"$AnnotationPath": "Path/foo.Bar/foo.Baz@foo.Term"
						},
						"@foo.NavigationPropertyPath": {
							"$NavigationPropertyPath": "Path/foo.Bar/foo.Baz"
						},
						"@foo.Path": {"$Path": "Path/foo.Bar/foo.Baz"},
						"@foo.PropertyPath": {"$PropertyPath": "Path/foo.Bar/foo.Baz"},
						"@foo.UrlRef": {"$UrlRef": "http://foo.bar"},
						"@foo.Baz#Employee": true
					},
					"foo.Bar/Abc" : {"@foo.Baz#Employee": true}
				}
			});
	});

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
