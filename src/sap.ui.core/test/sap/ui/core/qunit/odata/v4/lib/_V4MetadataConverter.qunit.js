/*!
 * ${copyright}
 */
sap.ui.define([
	"jquery.sap.global",
	"sap/base/Log",
	"sap/ui/model/odata/v4/lib/_V4MetadataConverter",
	"sap/ui/test/TestUtils",
	"sap/ui/util/XMLHelper"
], function (jQuery, Log, _V4MetadataConverter, TestUtils, XMLHelper) {
	/*global QUnit, sinon */
	/*eslint max-nested-callbacks: 0, no-multi-str: 0, no-warning-comments: 0 */
	"use strict";

	var sEdmx = '<edmx:Edmx Version="4.0" xmlns:edmx="http://docs.oasis-open.org/odata/ns/edmx"'
			+ ' xmlns="http://docs.oasis-open.org/odata/ns/edm">',
		mFixture = {
			"/sap/opu/odata4/IWBEP/TEA/default/IWBEP/TEA_BUSI/0001/$metadata"
				: {source : "metadata.xml"},
			"/sap/opu/odata4/IWBEP/TEA/default/IWBEP/TEA_BUSI/0001/metadata.json"
				: {source : "metadata.json"}
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
		var oXML = xml(assert, sEdmx + sXmlSnippet + "</edmx:Edmx>"),
			oResult = new _V4MetadataConverter().convertXMLMetadata(oXML);

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
		var oDocument = XMLHelper.parse(sXml);
		assert.strictEqual(oDocument.parseError.errorCode, 0, "XML parsed correctly");
		return oDocument;
	}

	//*********************************************************************************************
	QUnit.module("sap.ui.model.odata.v4.lib._V4MetadataConverter", {
		beforeEach : function () {
			TestUtils.useFakeServer(this._oSandbox, "sap/ui/core/qunit/odata/v4/data", mFixture);
			this.oLogMock = this.mock(Log);
			this.oLogMock.expects("warning").never();
			this.oLogMock.expects("error").never();
		}
	});

	//*********************************************************************************************
	QUnit.test("convertXMLMetadata: Singleton", function (assert) {
		testConversion(assert, '\
				<edmx:DataServices>\
					<Schema Namespace="foo" Alias="f">\
						<EntityContainer Name="Container">\
							<Singleton Name="Me" Type="f.Worker">\
								<NavigationPropertyBinding Path="Manager" Target="f.Manager"/>\
							</Singleton>\
						</EntityContainer>\
					</Schema>\
				</edmx:DataServices>',
			{
				"$EntityContainer" : "foo.Container",
				"foo." : {
					"$kind" : "Schema"
				},
				"foo.Container" : {
					"$kind" : "EntityContainer",
					"Me" : {
						"$kind" : "Singleton",
						"$NavigationPropertyBinding" : {
							"Manager" : "foo.Manager"
						},
						"$Type" : "foo.Worker"
					}
				}
			});
	});

	//*********************************************************************************************
	QUnit.test("convertXMLMetadata: Reference", function (assert) {
		testConversion(assert, '\
				<edmx:Reference Uri="/qux/$metadata">\
					<edmx:Include Namespace="qux.foo"/>\
					<edmx:Include Namespace="qux.bar"/>\
					<edmx:IncludeAnnotations TermNamespace="qux.foo"/>\
					<edmx:IncludeAnnotations TermNamespace="qux.bar" TargetNamespace="qux.bar"\
						Qualifier="Tablet"/>\
				</edmx:Reference>\
				<edmx:Reference Uri="/bla/$metadata">\
					<edmx:Include Namespace="bla"/>\
				</edmx:Reference>',
			{
				"$Reference" : {
					"/qux/$metadata" : {
						"$Include" : ["qux.foo.", "qux.bar."],
						"$IncludeAnnotations" : [{
							"$TermNamespace" : "qux.foo."
						}, {
							"$TermNamespace" : "qux.bar.",
							"$TargetNamespace" : "qux.bar.",
							"$Qualifier" : "Tablet"
						}]
					},
					"/bla/$metadata" : {
						"$Include" : ["bla."]
					}
				}
			});
	});
	// TODO look at xml:base if the Uri in Reference is relative

	//*********************************************************************************************
	QUnit.test("convertXMLMetadata: aliases in types", function (assert) {
		testConversion(assert, '\
				<edmx:Reference Uri="/qux/$metadata">\
					<edmx:Include Namespace="qux" Alias="q"/>\
				</edmx:Reference>\
				<edmx:DataServices>\
					<Schema Namespace="bar">\
						<ComplexType Name="Worker">\
							<Property Name="Something" Type="q.Something"/>\
							<Property Name="ManyThings" Type="Collection(q.Something)"/>\
							<NavigationProperty Name="DefaultAddress" Type="f.Address"/>\
							<NavigationProperty Name="AllAddresses" Type="Collection(f.Address)"/>\
						</ComplexType>\
					</Schema>\
					<Schema Namespace="foo" Alias="f"/>\
				</edmx:DataServices>',
			{
				"$Reference" : {
					"/qux/$metadata" : {
						"$Include" : ["qux."]
					}
				},
				"bar." : {
					"$kind" : "Schema"
				},
				"bar.Worker" : {
					"$kind" : "ComplexType",
					"Something" : {
						"$kind" : "Property",
						"$Type" : "qux.Something"
					},
					"ManyThings" : {
						"$kind" : "Property",
						"$isCollection" : true,
						"$Type" : "qux.Something"
					},
					"DefaultAddress" : {
						"$kind" : "NavigationProperty",
						"$Type" : "foo.Address"
					},
					"AllAddresses" : {
						"$kind" : "NavigationProperty",
						"$isCollection" : true,
						"$Type" : "foo.Address"
					}
				},
				"foo." : {
					"$kind" : "Schema"
				}
			});
	});

	//*********************************************************************************************
	QUnit.test("convertXMLMetadata: aliases in container", function (assert) {
		testConversion(assert, '\
				<edmx:DataServices>\
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
				</edmx:DataServices>',
			{
				"$EntityContainer" : "foo.Container",
				"foo." : {
					"$kind" : "Schema"
				},
				"foo.Container" : {
					"$kind" : "EntityContainer",
					"SpecialTeams" : {
						"$kind" : "EntitySet",
						"$Type" : "foo.Team"
					},
					"Teams" : {
						"$kind" : "EntitySet",
						"$NavigationPropertyBinding" : {
							"Manager" : "Managers",
							"Foo" : "other.Container/Foo",
							"Bar" : "foo.Container/Foo/Bar",
							"Baz" : "foo.Container/Manager/foo.Employee"
						},
						"$Type" : "foo.Team"
					}
				}
			});
	});

	//*********************************************************************************************
	QUnit.test("convertXMLMetadata: IncludeInServiceDocument", function (assert) {
		testConversion(assert, '\
				<edmx:DataServices>\
					<Schema Namespace="foo">\
						<EntityContainer Name="Container">\
							<EntitySet Name="Teams" EntityType="foo.Team"\
								IncludeInServiceDocument="false"/>\
							<EntitySet Name="Teams2" EntityType="foo.Team"\
								IncludeInServiceDocument="true"/>\
							<EntitySet Name="Teams3" EntityType="foo.Team"/>\
						</EntityContainer>\
					</Schema>\
				</edmx:DataServices>',
			{
				"$EntityContainer" : "foo.Container",
				"foo." : {
					"$kind" : "Schema"
				},
				"foo.Container" : {
					"$kind" : "EntityContainer",
					"Teams" : {
						"$kind" : "EntitySet",
						"$Type" : "foo.Team",
						"$IncludeInServiceDocument" : false
					},
					"Teams2" : {
						"$kind" : "EntitySet",
						"$Type" : "foo.Team"
					},
					"Teams3" : {
						"$kind" : "EntitySet",
						"$Type" : "foo.Team"
					}
				}
			});
	});

	//*********************************************************************************************
	QUnit.test("convertXMLMetadata: EntityType attributes, key alias", function (assert) {
		testConversion(assert, '\
				<edmx:DataServices>\
					<Schema Namespace="foo" Alias="f">\
						<EntityType Name="Worker" OpenType="true" HasStream="true">\
							<Key>\
								<PropertyRef Name="Bar/Baz" Alias="qux"/>\
							</Key>\
						</EntityType>\
						<EntityType Name="Base" Abstract="true"/>\
						<EntityType Name="Derived" BaseType="f.Base"/>\
					</Schema>\
				</edmx:DataServices>',
			{
				"foo." : {
					"$kind" : "Schema"
				},
				"foo.Worker" : {
					"$kind" : "EntityType",
					"$Key" : [
						{"qux" : "Bar/Baz"}
					],
					"$OpenType" : true,
					"$HasStream" : true
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
				<edmx:DataServices>\
					<Schema Namespace="foo">\
						<ComplexType Name="Worker" OpenType="true" HasStream="true"/>\
						<ComplexType Name="Base" Abstract="true"/>\
						<ComplexType Name="Derived" BaseType="foo.Base"/>\
					</Schema>\
				</edmx:DataServices>',
			{
				"foo." : {
					"$kind" : "Schema"
				},
				"foo.Worker" : {
					"$kind" : "ComplexType",
					"$OpenType" : true,
					"$HasStream" : true
				},
				"foo.Base" : {
					"$kind" : "ComplexType",
					"$Abstract" : true
				},
				"foo.Derived" : {
					"$kind" : "ComplexType",
					"$BaseType" : "foo.Base"
				}
			});
	});

	//*********************************************************************************************
	QUnit.test("processFacetAttributes", function (assert) {
		function localTest(sProperty, sValue, vExpectedValue) {
			var oXml = xml(assert, '<Foo ' + sProperty + '="' + sValue + '"/>'),
				oResult = {},
				oExpectedResult = {};

			if (vExpectedValue !== undefined) {
				oExpectedResult["$" + sProperty] = vExpectedValue;
			}
			new _V4MetadataConverter().processFacetAttributes(oXml.documentElement, oResult);
			assert.deepEqual(oResult, oExpectedResult);
		}

		localTest("Precision", "8", 8);
		localTest("Scale", "2", 2);
		localTest("Scale", "variable", "variable");
		localTest("Unicode", "false", false);
		localTest("Unicode", "true", undefined);
		localTest("MaxLength", "12345", 12345);
		localTest("MaxLength", "max", undefined);
		localTest("SRID", "42", "42");
	});

	//*********************************************************************************************
	["ComplexType", "EntityType"].forEach(function (sType) {
		QUnit.test("convertXMLMetadata: " + sType + ": (Navigation)Property", function (assert) {
			var oExpected = {
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
							"$DefaultValue" : "<a>",
							"$Unicode" : false
						},
						"p2" : {
							"$kind" : "Property",
							"$Type" : "Edm.String"
						},
						"p3" : {
							"$kind" : "Property",
							"$Type" : "Edm.Geometry",
							"$SRID" :"42"
						},
						"p4" : {
							"$kind" : "Property",
							"$Type" : "Edm.Int32",
							"$DefaultValue" : "42"
						},
						"team1" : {
							"$kind" : "NavigationProperty",
							"$Type" : "foo.Team",
							"$Partner" : "worker",
							"$OnDelete" : "SetDefault",
							"$ReferentialConstraint" : {
								"p1" : "p1Key",
								"p2" : "p2Key"
							}
						},
						"team2" : {
							"$kind" : "NavigationProperty",
							"$Type" : "foo.Team",
							"$ContainsTarget" : true
						},
						"team3" : {
							"$kind" : "NavigationProperty",
							"$Type" : "foo.Team"
						}
					}
				};

			testConversion(assert, '\
					<edmx:DataServices>\
						<Schema Namespace="foo">\
							<' + sType + ' Name="Worker">\
								<Property Name="Salary" Type="Edm.Decimal" Precision="8"\
									Scale="2"/>\
								<Property Name="p1" Type="Edm.String" DefaultValue="&lt;a&gt;"\
									Unicode="false" />\
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
					</edmx:DataServices>',
				oExpected);
		});
	});

	//*********************************************************************************************
	QUnit.test("convertXMLMetadata: EnumType", function (assert) {
		testConversion(assert, '\
				<edmx:DataServices>\
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
				</edmx:DataServices>',
			{
				"foo." : {
					"$kind" : "Schema"
				},
				"foo.Bar1" : {
					"$kind" : "EnumType",
					"$IsFlags" : true,
					"p_1" : 1
				},
				"foo.Bar2" : {
					"$kind" : "EnumType",
					"_1" : 0,
					"_2" : 1
				},
				"foo.Baz1" : {
					"$kind" : "EnumType",
					"$UnderlyingType" : "Edm.Int64",
					"_1" : 9007199254740991,
					"_2" : "9007199254740992"
				},
				"foo.Baz2" : {
					"$kind" : "EnumType",
					"$UnderlyingType" : "Edm.Int64",
					"_1" : 0,
					"_2" : 1
				},
				"foo.Qux1" : {
					"$kind" : "EnumType",
					"$UnderlyingType" : "Edm.Int16",
					"_1" : 0
				},
				"foo.Qux2" : {
					"$kind" : "EnumType",
					"$UnderlyingType" : "Edm.Byte",
					"_1" : 0
				},
				"foo.Qux3" : {
					"$kind" : "EnumType",
					"$UnderlyingType" : "Edm.SByte",
					"_1" : 0
				}
			});
	});

	//*********************************************************************************************
	QUnit.test("convertXMLMetadata: TypeDefinition", function (assert) {
		this.mock(_V4MetadataConverter.prototype).expects("processFacetAttributes")
			.withExactArgs(
				sinon.match.has("localName", "TypeDefinition"),
				{
					$kind : "TypeDefinition",
					$UnderlyingType : "Edm.String"
				});
		testConversion(assert, '\
				<edmx:DataServices>\
					<Schema Namespace="foo">\
						<TypeDefinition Name="Bar" UnderlyingType="Edm.String"/>\
					</Schema>\
				</edmx:DataServices>',
			{
				"foo." : {
					"$kind" : "Schema"
				},
				"foo.Bar" : {
					"$kind" : "TypeDefinition",
					"$UnderlyingType" : "Edm.String"
				}
			});
	});

	//*********************************************************************************************
	["Action", "Function"].forEach(function (sRunnable) {
		QUnit.test("convertXMLMetadata: " + sRunnable, function (assert) {
			testConversion(assert, '\
					<edmx:DataServices>\
						<Schema Namespace="foo" Alias="f">\
							<' + sRunnable + ' Name="Baz" EntitySetPath="Employees"\
								IsBound="true" >\
								<Parameter Name="p1" Type="f.Bar" Nullable="false"/>\
								<Parameter Name="p2" Type="Collection(f.Bar)" MaxLength="10"\
									Precision="2" Scale="variable" SRID="42"/>\
								<ReturnType Type="Collection(Edm.String)" Nullable="false"\
									MaxLength="10" Precision="2" Scale="variable" SRID="42"/>\
							</' + sRunnable + '>\
							<' + sRunnable + ' Name="Baz" IsComposable="true" IsBound="false"/>\
						</Schema>\
					</edmx:DataServices>',
				{
					"foo." : {
						"$kind" : "Schema"
					},
					"foo.Baz" : [{
						"$kind" : sRunnable,
						"$IsBound" : true,
						"$EntitySetPath" : "Employees",
						"$Parameter" : [{
							"$Name" : "p1",
							"$Type" : "foo.Bar",
							"$Nullable" : false
						},{
							"$Name" : "p2",
							"$isCollection" : true,
							"$Type" : "foo.Bar",
							"$MaxLength" : 10,
							"$Precision" : 2,
							"$Scale" : "variable",
							"$SRID" : "42"
						}],
						"$ReturnType" : {
							"$isCollection" : true,
							"$Type" : "Edm.String",
							"$Nullable" : false,
							"$MaxLength" : 10,
							"$Precision" : 2,
							"$Scale" : "variable",
							"$SRID" : "42"
						}
					},{
						"$kind" : sRunnable,
						"$IsComposable" : true
					}]
				});
		});
	});

	//*********************************************************************************************
	["Action", "Function"].forEach(function (sWhat) {
		QUnit.test("convertXMLMetadata: " + sWhat + "Import", function (assert) {
			var oExpected = {
					"$EntityContainer" : "foo.Container",
					"foo." : {
						"$kind" : "Schema"
					},
					"foo.Container" : {
						"$kind" : "EntityContainer",
						"Baz1" : {
							"$EntitySet" : "Employees",
							"$IncludeInServiceDocument" : true
						},
						"Baz2" : {
						},
						"Baz3" : {
							"$EntitySet" : "Employees"
						},
						"Baz4" : {
							"$EntitySet" : "some.other.Container/Employees"
						},
						"Baz5" : {
							"$EntitySet" : "foo.Container/Employees/Team"
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
					<edmx:DataServices>\
						<Schema Namespace="foo" Alias="f">\
							<EntityContainer Name="Container">\
								<' + sWhat + 'Import Name="Baz1" ' + sWhat + '="foo.Baz"\
									EntitySet="Employees" IncludeInServiceDocument="true"/>\
								<' + sWhat + 'Import Name="Baz2" ' + sWhat + '="f.Baz"\
									IncludeInServiceDocument="false"/>\
								<' + sWhat + 'Import Name="Baz3" ' + sWhat + '="f.Baz"\
									EntitySet="f.Container/Employees"/>\
								<' + sWhat + 'Import Name="Baz4" ' + sWhat + '="f.Baz"\
									EntitySet="some.other.Container/Employees"/>\
								<' + sWhat + 'Import Name="Baz5" ' + sWhat + '="f.Baz"\
									EntitySet="f.Container/Employees/Team"/>\
							</EntityContainer>\
						</Schema>\
					</edmx:DataServices>',
				oExpected);
		});
	});

	//*********************************************************************************************
	QUnit.test("convertXMLMetadata: Term", function (assert) {
		testConversion(assert, '\
				<edmx:DataServices>\
					<Schema Namespace="foo" Alias="f">\
						<Term Name="Term1" Type="Collection(Edm.String)" Nullable="false"\
							MaxLength="10" Precision="2" Scale="variable" SRID="42"/>\
						<Term Name="Term2" Type="f.Bar" BaseTerm="f.Term1" Nullable="true"/>\
					</Schema>\
				</edmx:DataServices>',
			{
				"foo." : {
					"$kind" : "Schema"
				},
				"foo.Term1" : {
					"$kind" : "Term",
					"$isCollection" : true,
					"$Type" : "Edm.String",
					"$Nullable" : false,
					"$MaxLength" : 10,
					"$Precision" : 2,
					"$Scale" : "variable",
					"$SRID" : "42"
				},
				"foo.Term2" : {
					"$kind" : "Term",
					"$Type" : "foo.Bar",
					"$BaseTerm" : "foo.Term1"
				}
			});
	});

	//*********************************************************************************************
	QUnit.test("convertXMLMetadata: Annotations", function (assert) {
		testConversion(assert, '\
				<edmx:DataServices>\
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
					</Schema>\
				</edmx:DataServices>',
			{
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
	// TODO look at xml:base if the UrlRef is static and relative

	//*********************************************************************************************
	QUnit.test("inline annotations: Schema, EntityType, ComplexType", function (assert) {
		testConversion(assert, '\
				<edmx:DataServices>\
					<Schema Namespace="foo" Alias="f">\
						<Annotation Term="f.Term1" String="Schema"/>\
						<EntityType Name="EntityType">\
							<Property Name="Property" Type="Edm.String">\
								<Annotation Term="f.Term" String="Property"/>\
							</Property>\
							<NavigationProperty Name="NavigationProperty" Type="foo.Target">\
								<Annotation Term="f.Term" String="NavigationProperty"/>\
								<ReferentialConstraint Property="p" ReferencedProperty="r">\
									<Annotation Term="f.Term" String="ReferentialConstraint"/>\
								</ReferentialConstraint>\
								<OnDelete Action="a">\
									<Annotation Term="f.Term" String="OnDelete"/>\
								</OnDelete>\
							</NavigationProperty>\
							<Annotation Term="f.Term" String="EntityType"/>\
						</EntityType>\
						<ComplexType Name="ComplexType">\
							<Annotation Term="f.Term" String="ComplexType"/>\
						</ComplexType>\
						<Annotation Term="f.Term2" String="Schema"/>\
					</Schema>\
				</edmx:DataServices>',
			{
				"foo." : {
					"$kind" : "Schema",
					"@foo.Term1" : "Schema",
					"@foo.Term2" : "Schema",
					"$Annotations" : {
						"foo.EntityType" : {
							"@foo.Term" : "EntityType"
						},
						"foo.EntityType/Property" : {
							"@foo.Term" : "Property"
						},
						"foo.EntityType/NavigationProperty" : {
							"@foo.Term" : "NavigationProperty"
						},
						"foo.ComplexType" : {
							"@foo.Term" : "ComplexType"
						}
					}
				},
				"foo.EntityType" : {
					"$kind" : "EntityType",
					"Property" : {
						"$kind" : "Property",
						"$Type" : "Edm.String"
					},
					"NavigationProperty" : {
						"$kind" : "NavigationProperty",
						"$Type" : "foo.Target",
						"$ReferentialConstraint" : {
							"p" : "r",
							"p@foo.Term" : "ReferentialConstraint"
						},
						"$OnDelete" : "a",
						"$OnDelete@foo.Term" : "OnDelete"
					}
				},
				"foo.ComplexType" : {
					"$kind" : "ComplexType"
				}
			});
	});

	//*********************************************************************************************
	QUnit.test("inline annotations: EnumType, Term, TypeDefinition", function (assert) {
		testConversion(assert, '\
				<edmx:DataServices>\
					<Schema Namespace="foo" Alias="f">\
						<EnumType Name="EnumType">\
							<Member Name="Member">\
								<Annotation Term="f.Term" String="Member"/>\
							</Member>\
							<Annotation Term="f.Term" String="EnumType"/>\
						</EnumType>\
						<Term Name="Term" Type="Edm.String">\
							<Annotation Term="f.Term" String="Term"/>\
						</Term>\
						<TypeDefinition Name="TypeDefinition" UnderlyingType="Edm.String">\
							<Annotation Term="f.Term" String="TypeDefinition"/>\
						</TypeDefinition>\
					</Schema>\
				</edmx:DataServices>',
			{
				"foo." : {
					"$kind" : "Schema",
					"$Annotations" : {
						"foo.EnumType" : {
							"@foo.Term" : "EnumType"
						},
						"foo.EnumType/Member" : {
							"@foo.Term" : "Member"
						},
						"foo.Term" : {
							"@foo.Term" : "Term"
						},
						"foo.TypeDefinition" : {
							"@foo.Term" : "TypeDefinition"
						}
					}
				},
				"foo.EnumType" : {
					"$kind" : "EnumType",
					"Member" : 0
				},
				"foo.Term" : {
					"$kind" : "Term",
					"$Type" : "Edm.String"
				},
				"foo.TypeDefinition" : {
					"$kind" : "TypeDefinition",
					"$UnderlyingType" : "Edm.String"
				}
			});
	});

	//*********************************************************************************************
	QUnit.test("inline annotations: Action, Function", function (assert) {
		testConversion(assert, '\
				<edmx:DataServices>\
					<Schema Namespace="foo" Alias="f">\
						<Action IsBound="true" Name="Action">\
							<Parameter Name="_it" Type="Edm.String">\
								<Annotation Term="f.Term" String="Parameter"/>\
							</Parameter>\
							<ReturnType Type="Edm.String">\
								<Annotation Term="f.Term" String="ReturnType"/>\
							</ReturnType>\
							<Annotation Term="f.Term" String="Action1"/>\
						</Action>\
						<Action Name="Action">\
							<Annotation Term="f.Term" String="Action2"/>\
						</Action>\
						<Action IsBound="true" Name="Action">\
							<Parameter Name="_it" Type="Collection(f.Type)"/>\
							<Parameter Name="NonBinding" Type="Edm.Int"/>\
							<Annotation Term="f.Term" String="Action3"/>\
						</Action>\
						<Function Name="Function">\
							<Annotation Term="f.Term" String="Function1"/>\
						</Function>\
						<Function IsBound="true" Name="Function">\
							<Parameter Name="Parameter" Type="f.Type"/>\
							<Annotation Term="f.Term" String="Function2"/>\
						</Function>\
						<Function IsBound="true" Name="Function">\
							<Parameter Name="A" Type="f.Type"/>\
							<Parameter Name="B" Type="Collection(f.Int)"/>\
							<Annotation Term="f.Term" String="Function3"/>\
						</Function>\
					</Schema>\
				</edmx:DataServices>',
			{
				"foo." : {
					"$Annotations" : {
						"foo.Action(Edm.String)" : {
							"@foo.Term" : "Action1"
						},
						"foo.Action(Edm.String)/_it" : {
							"@foo.Term" : "Parameter"
						},
						"foo.Action(Edm.String)/$ReturnType" : {
							"@foo.Term" : "ReturnType"
						},
						"foo.Action()" : {
							"@foo.Term" : "Action2"
						},
						"foo.Action(Collection(foo.Type))" : {
							"@foo.Term" : "Action3"
						},
						"foo.Function()" : {
							"@foo.Term" : "Function1"
						},
						"foo.Function(foo.Type)" : {
							"@foo.Term" : "Function2"
						},
						"foo.Function(foo.Type,Collection(foo.Int))" : {
							"@foo.Term" : "Function3"
						}
					},
					"$kind" : "Schema"
				},
				"foo.Action" : [{
					"$kind" : "Action",
					"$IsBound" : true,
					"$Parameter" : [{
						"$Name" : "_it",
						"$Type" : "Edm.String"
					}],
					"$ReturnType" : {
						"$Type" : "Edm.String"
					}
				}, {
					"$kind" : "Action"
				}, {
					"$kind" : "Action",
					"$IsBound" : true,
					"$Parameter" : [{
						"$Name" : "_it",
						"$Type" : "foo.Type",
						"$isCollection" : true
					}, {
						"$Name" : "NonBinding",
						"$Type" : "Edm.Int"
					}]
				}],
				"foo.Function" : [{
					"$kind" : "Function"
				}, {
					"$kind" : "Function",
					"$IsBound" : true,
					"$Parameter" : [{
						"$Name" : "Parameter",
						"$Type" : "foo.Type"
					}]
				}, {
					"$kind" : "Function",
					"$IsBound" : true,
					"$Parameter" : [{
						"$Name" : "A",
						"$Type" : "foo.Type"
					}, {
						"$Name" : "B",
						"$Type" : "foo.Int",
						"$isCollection" : true
					}]
				}]
			});
	});

	//*********************************************************************************************
	QUnit.test("inline annotations: EntityContainer and children", function (assert) {
		testConversion(assert, '\
				<edmx:DataServices>\
					<Schema Namespace="foo" Alias="f">\
						<EntityContainer Name="Container">\
							<EntitySet Name="EntitySet" EntityType="f.EntityType">\
								<Annotation Term="f.Term1" String="EntitySet"/>\
							</EntitySet>\
							<Singleton Name="Singleton" Type="f.EntityType">\
								<Annotation Term="f.Term" String="Singleton"/>\
							</Singleton>\
							<ActionImport Name="ActionImport" Action="f.Action">\
								<Annotation Term="f.Term" String="ActionImport"/>\
							</ActionImport>\
							<FunctionImport Name="FunctionImport" Function="f.Function">\
								<Annotation Term="f.Term" String="FunctionImport"/>\
							</FunctionImport>\
							<Annotation Term="f.Term" String="EntityContainer"/>\
						</EntityContainer>\
						<Annotations Target="foo.Container/EntitySet">\
							<Annotation Term="f.Term2" String="EntitySet"/>\
						</Annotations>\
					</Schema>\
				</edmx:DataServices>',
			{
				"$EntityContainer" : "foo.Container",
				"foo." : {
					"$kind" : "Schema",
					"$Annotations" : {
						"foo.Container" : {
							"@foo.Term" : "EntityContainer"
						},
						"foo.Container/EntitySet" : {
							"@foo.Term1" : "EntitySet",
							"@foo.Term2" : "EntitySet"
						},
						"foo.Container/Singleton" : {
							"@foo.Term" : "Singleton"
						},
						"foo.Container/ActionImport" : {
							"@foo.Term" : "ActionImport"
						},
						"foo.Container/FunctionImport" : {
							"@foo.Term" : "FunctionImport"
						}
					}
				},
				"foo.Container" : {
					"$kind" : "EntityContainer",
					"EntitySet" : {
						"$kind" : "EntitySet",
						"$Type" : "foo.EntityType"
					},
					"Singleton" : {
						"$kind" : "Singleton",
						"$Type" : "foo.EntityType"
					},
					"ActionImport" : {
						"$kind" : "ActionImport",
						"$Action" : "foo.Action"
					},
					"FunctionImport" : {
						"$kind" : "FunctionImport",
						"$Function" : "foo.Function"
					}
				}
			});
	});

	//*********************************************************************************************
	QUnit.test("inline annotations: Reference", function (assert) {
		testConversion(assert, '\
				<edmx:Reference Uri="qux/$metadata">\
					<Annotation Term="foo.Term" String="Reference"/>\
				</edmx:Reference>',
			{
				"$Reference" : {
					"qux/$metadata" : {
						"@foo.Term" : "Reference"
					}
				}
			});
	});

	//*********************************************************************************************
	QUnit.test("annotated annotations", function (assert) {
		testConversion(assert, '\
				<edmx:DataServices>\
					<Schema Namespace="foo" Alias="f">\
						<Annotation Term="f.Term1" String="Schema" Qualifier="q1">\
							<Annotation Term="f.Term2" Qualifier="q2" String="Annotation2">\
								<Annotation Term="f.Term3" Qualifier="q3" String="Annotation3"/>\
							</Annotation>\
						</Annotation>\
						<ComplexType Name="ComplexType">\
							<Annotation Term="f.Term1" String="ComplexType">\
								<Annotation Term="f.Term2" String="Annotation"/>\
							</Annotation>\
						</ComplexType>\
					</Schema>\
				</edmx:DataServices>',
			{
				"foo." : {
					"$kind" : "Schema",
					"@foo.Term1#q1" : "Schema",
					"@foo.Term1#q1@foo.Term2#q2" : "Annotation2",
					"@foo.Term1#q1@foo.Term2#q2@foo.Term3#q3" : "Annotation3",
					"$Annotations" : {
						"foo.ComplexType" : {
							"@foo.Term1" : "ComplexType",
							"@foo.Term1@foo.Term2" : "Annotation"
						}
					}
				},
				"foo.ComplexType" : {
					"$kind" : "ComplexType"
				}
			});
	});

	//*********************************************************************************************
	QUnit.test("try to read some random XML as V4", function (assert) {
		var sUrl = "/some/random/xml",
			oXML = xml(assert, '<foo xmlns="http://docs.oasis-open.org/odata/ns/edmx"/>');

		assert.throws(function () {
			new _V4MetadataConverter().convertXMLMetadata(oXML, sUrl);
		}, new Error(sUrl
			+ ": expected <Edmx> in namespace 'http://docs.oasis-open.org/odata/ns/edmx'"));
	});

	//*********************************************************************************************
	QUnit.test("try to read V2 as V4", function (assert) {
		var sUrl = "/some/v2/service/$metadata",
			oXML = xml(assert, '<Edmx xmlns="http://schemas.microsoft.com/ado/2007/06/edmx"/>');

		assert.throws(function () {
			new _V4MetadataConverter().convertXMLMetadata(oXML, sUrl);
		}, new Error(sUrl
			+ ": expected <Edmx> in namespace 'http://docs.oasis-open.org/odata/ns/edmx'"));
	});

	//*********************************************************************************************
	QUnit.test("try to read V4.01 as V4", function (assert) {
		var sUrl = "/some/v2/service/$metadata",
			oXML = xml(assert,
				'<Edmx Version="4.01" xmlns="http://docs.oasis-open.org/odata/ns/edmx"/>');

		assert.throws(function () {
			new _V4MetadataConverter().convertXMLMetadata(oXML, sUrl);
		}, new Error(sUrl + ": Unsupported OData version 4.01"));
	});

	//*********************************************************************************************
	QUnit.test("ignore foreign namespaces", function (assert) {
		testConversion(assert, '\
				<edmx:DataServices>\
					<Schema Namespace="foo" Alias="f" xmlns:foo="http://foo.bar">\
						<ComplexType Name="Worker" foo:OpenType="true"/>\
						<foo:ComplexType Name="Ignore"/>\
					</Schema>\
				</edmx:DataServices>',
			{
				"foo." : {
					"$kind" : "Schema"
				},
				"foo.Worker" : {
					"$kind" : "ComplexType"
					// no $OpenType
				}
			});
	});

	//*********************************************************************************************
	QUnit.test("convertXMLMetadata: test service", function (assert) {
		return Promise.all([
			Promise.resolve(
					jQuery.ajax("/sap/opu/odata4/IWBEP/TEA/default/IWBEP/TEA_BUSI/0001/$metadata"))
				.then(function (oXML) {
					return new _V4MetadataConverter().convertXMLMetadata(oXML);
				}),
			jQuery.ajax("/sap/opu/odata4/IWBEP/TEA/default/IWBEP/TEA_BUSI/0001/metadata.json")
		]).then(function (aResults) {
			assert.deepEqual(aResults[0], aResults[1]);
		});
	});

	//*********************************************************************************************
	QUnit.test("duplicate schema children; last one wins", function (assert) {
		var that = this;

		[
			"Duplicate qualified name duplicates.",
			"Duplicate qualified name $EntityContainer", // caused by "YetAnotherContainer"
			"Duplicate qualified name duplicates.ArtistsType",
			"Duplicate qualified name duplicates.Address",
			"Duplicate qualified name duplicates.Enumeration",
			"Duplicate qualified name duplicates.Term",
			"Duplicate qualified name duplicates.TypeDefinition",
			"Duplicate qualified name duplicates.GetDefaults",
			"Duplicate qualified name duplicates.Container"
		].forEach(function (sWarning) {
			that.oLogMock.expects("warning").withExactArgs(sWarning, undefined,
				"sap.ui.model.odata.v4.lib._MetadataConverter");
		});

		testConversion(assert, '\
<edmx:DataServices>\
	<Schema Namespace="duplicates"/>\
	<Schema Namespace="duplicates">\
		<ComplexType Name="ArtistsType"/>\
		<EntityType Name="ArtistsType">\
			<Key>\
				<PropertyRef Name="ArtistID"/>\
				<PropertyRef Name="IsActiveEntity"/>\
			</Key>\
			<Property Name="ArtistID" Type="Edm.String" Nullable="false"/>\
			<Property Name="IsActiveEntity" Type="Edm.Boolean" Nullable="false"/>\
		</EntityType>\
\
		<EntityType Name="Address"/>\
		<ComplexType Name="Address">\
			<Property Name="City" Type="Edm.String"/>\
		</ComplexType>\
\
		<ComplexType Name="Enumeration"/>\
		<EnumType Name="Enumeration" UnderlyingType="Edm.Int32">\
			<Member Name="ENO"/>\
		</EnumType>\
\
		<ComplexType Name="Term"/>\
		<Term Name="Term" Type="Edm.String"/>\
\
		<ComplexType Name="TypeDefinition"/>\
		<TypeDefinition Name="TypeDefinition" UnderlyingType="Edm.String"/>\
\
		<ComplexType Name="GetDefaults"/>\
		<Function Name="GetDefaults" EntitySetPath="_it" IsBound="true">\
			<Parameter Name="_it" Type="Collection(duplicates.ArtistsType)" Nullable="false"/>\
			<ReturnType Type="duplicates.ArtistsType" Nullable="false"/>\
		</Function>\
		<Function Name="GetDefaults" EntitySetPath="_it" IsBound="true">\
			<Parameter Name="_it" Type="duplicates.ArtistsType" Nullable="false"/>\
			<ReturnType Type="duplicates.ArtistsType" Nullable="false"/>\
		</Function>\
\
		<ComplexType Name="Container"/>\
		<EntityContainer Name="YetAnotherContainer"/>\
		<EntityContainer Name="Container">\
			<EntitySet Name="Artists" EntityType="duplicates.ArtistsType"/>\
		</EntityContainer>\
	</Schema>\
</edmx:DataServices>', {
			"$EntityContainer" : "duplicates.Container",
			"duplicates." : {
				"$kind" : "Schema"
			},
			"duplicates.Address" : {
				"$kind" : "ComplexType",
				"City" : {
					"$Type" : "Edm.String",
					"$kind" : "Property"
				}
			},
			"duplicates.ArtistsType" : {
				"$Key" : [
					"ArtistID",
					"IsActiveEntity"
				],
				"$kind" : "EntityType",
				"ArtistID" : {
					"$Nullable" : false,
					"$Type" : "Edm.String",
					"$kind" : "Property"
				},
				"IsActiveEntity" : {
					"$Nullable" : false,
					"$Type" : "Edm.Boolean",
					"$kind" : "Property"
				}
			},
			"duplicates.Container" : {
				"$kind" : "EntityContainer",
				"Artists" : {
					"$Type" : "duplicates.ArtistsType",
					"$kind" : "EntitySet"
				}
			},
			"duplicates.Enumeration" : {
				"$kind" : "EnumType",
				"ENO" : 0
			},
			"duplicates.GetDefaults" : [{
				"$EntitySetPath" : "_it",
				"$IsBound" : true,
				"$Parameter" : [{
					"$Name" : "_it",
					"$Nullable" : false,
					"$Type" : "duplicates.ArtistsType",
					"$isCollection" : true
				}],
				"$ReturnType" : {
					"$Nullable" : false,
					"$Type" : "duplicates.ArtistsType"
				},
				"$kind" : "Function"
			}, {
				"$EntitySetPath" : "_it",
				"$IsBound" : true,
				"$Parameter" : [{
					"$Name" : "_it",
					"$Nullable" : false,
					"$Type" : "duplicates.ArtistsType"
				}],
				"$ReturnType" : {
					"$Nullable" : false,
					"$Type" : "duplicates.ArtistsType"
				},
				"$kind" : "Function"
			}],
			"duplicates.Term" : {
				"$Type" : "Edm.String",
				"$kind" : "Term"
			},
			"duplicates.TypeDefinition" : {
				"$UnderlyingType" : "Edm.String",
				"$kind" : "TypeDefinition"
			},
			"duplicates.YetAnotherContainer" : {
				"$kind" : "EntityContainer"
			}
		});
	});
});