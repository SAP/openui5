/*!
 * ${copyright}
 */
sap.ui.require([
	"jquery.sap.global",
	"sap/ui/model/odata/v4/lib/_MetadataConverter",
	"sap/ui/test/TestUtils",
	"jquery.sap.xml" // needed to have jQuery.sap.parseXML
], function (jQuery, _MetadataConverter, TestUtils/*, jQuerySapXml*/) {
	/*global QUnit, sinon */
	/*eslint max-nested-callbacks: 0, no-multi-str: 0, no-warning-comments: 0 */
	"use strict";

	var mFixture = {
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
		var oXML = xml(assert, '<Edmx>' + sXmlSnippet + '</Edmx>'),
			oResult = _MetadataConverter.convertXMLMetadata(oXML);

		assert.deepEqual(oResult, oExpected);
	}

	/**
	 * Tests the conversion of the given XML snippet of a constant/dynamic expression below an
	 * Annotation element. If the expression contains a Path element, a second test is performed
	 * with the Path element replaced by an expression. By this recursive expressions are tested
	 * automatically.
	 *
	 * @param {object} assert
	 *   QUnit's assert
	 * @param {string} sXmlSnippet
	 *   the XML snippet; it will be inserted below an Annotation element
	 * @param {any} vExpected
	 *   the expected value for the annotation
	 */
	function testExpression(assert, sXmlSnippet, vExpected) {
		var aMatches, sPath;

		function test() {
			var oXml = xml(assert, '\
					<Edmx>\
						<DataServices>\
							<Schema Namespace="foo" Alias="f">\
								<Annotations Target="foo.Bar">\
									<Annotation Term="foo.Term">' + sXmlSnippet + '\
									</Annotation>\
								</Annotations>\
							</Schema>\
						</DataServices>\
					</Edmx>'),
				// code under test
				oResult = _MetadataConverter.convertXMLMetadata(oXml);
			assert.deepEqual(oResult["foo."].$Annotations["foo.Bar"]["@foo.Term"], vExpected,
				sXmlSnippet);
		}

		test();

		// Rewrite sXmlSnippet and vExpectedValue so that the (first) Path is converted to a
		// (rather stupid) If and thus create a recursive expression.
		aMatches = /<Path>(.*?)<\/Path>/.exec(sXmlSnippet);
		if (aMatches) {
			sPath = aMatches[1];
			sXmlSnippet = sXmlSnippet.replace("<Path>" + sPath + "</Path>",
				"<If><Bool>true</Bool><Path>" + sPath + "</Path><Null/></If>");
			sPath = '{"$Path":"' + sPath.replace(/f\./g, "foo.") + '"}';
			vExpected = JSON.parse(JSON.stringify(vExpected)
				.replace(sPath, '{"$If":[true,' + sPath + ',null]}'));
			test();
		}
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
				+ "<bar><included1/><included2/></bar>"
				+ "\n<bar><innerBar/><innerBar/><innerBar2/></bar></foo>"),
			oAggregate = {
				bar : 0,
				innerBar : 0,
				innerBar2 : 0,
				included1 : 0,
				included2 : 0
			},
			oInclude1Config = {
				"included1" : {
					__processor : processor.bind(null, "included1")
				}
			},
			oInclude2Config = {
				"included2" : {
					__processor : processor.bind(null, "included2")
				}
			},
			oSchemaConfig = {
				"bar" : {
					__processor : processor.bind(null, "bar"),
					__include : [oInclude1Config, oInclude2Config],
					"innerBar" : {
						__processor : processor.bind(null, "innerBar")
					},
					"innerBar2" : {
						__processor : processor.bind(null, "innerBar2")
					}
				}
			};

		function processor(sExpectedName, oElement, oMyAggregate) {
			assert.strictEqual(oElement.nodeType, 1, "is an Element");
			assert.strictEqual(oElement.localName, sExpectedName);
			assert.strictEqual(oMyAggregate, oAggregate);
			oMyAggregate[sExpectedName]++;
		}

		_MetadataConverter.traverse(oXML.documentElement, oAggregate, oSchemaConfig);
		assert.strictEqual(oAggregate.bar, 4);
		assert.strictEqual(oAggregate.innerBar, 2);
		assert.strictEqual(oAggregate.innerBar2, 1);
		assert.strictEqual(oAggregate.included1, 1);
		assert.strictEqual(oAggregate.included2, 1);
	});

	//*********************************************************************************************
	QUnit.test("traverse: __postProcessor", function (assert) {
		var oXML = xml(assert, "<And><Bool>true</Bool><Bool>false</Bool></And>"),
			oResult = _MetadataConverter.traverse(oXML.documentElement, {}, {
				__postProcessor : function (oElement, aResults) {
					return {$And : aResults};
				},
				"Bool" : {
					__postProcessor : function (oElement, aResults) {
						assert.deepEqual(aResults, []);
						return oElement.childNodes[0].nodeValue === "true";
					}
				}
			});
			assert.deepEqual(oResult, {$And : [true, false]});
	});

	//*********************************************************************************************
	QUnit.test("resolveAlias", function (assert) {
		var oAggregate = {
				aliases : {
					"display" : "org.example.vocabularies.display."
				}
			};

		assert.strictEqual(_MetadataConverter.resolveAlias("", oAggregate), "");
		assert.strictEqual(_MetadataConverter.resolveAlias("display.Foo", oAggregate),
			"org.example.vocabularies.display.Foo");
		assert.strictEqual(_MetadataConverter.resolveAlias("display.bar.Foo", oAggregate),
			"display.bar.Foo");
		assert.strictEqual(_MetadataConverter.resolveAlias("bar.Foo", oAggregate), "bar.Foo");
		assert.strictEqual(_MetadataConverter.resolveAlias("Foo", oAggregate), "Foo");
	});

	//*********************************************************************************************
	QUnit.test("resolveAliasInPath", function (assert) {
		var oAggregate = {},
			oMock = this.mock(_MetadataConverter);

			function test(sPath, sExpected) {
				assert.strictEqual(_MetadataConverter.resolveAliasInPath(sPath, oAggregate),
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
				<Reference Uri="/qux/$metadata">\
					<Include Namespace="qux.foo"/>\
					<Include Namespace="qux.bar"/>\
					<IncludeAnnotations TermNamespace="qux.foo"/>\
					<IncludeAnnotations TermNamespace="qux.bar" TargetNamespace="qux.bar"\
						Qualifier="Tablet"/>\
				</Reference>\
				<Reference Uri="/bla/$metadata">\
					<Include Namespace="bla"/>\
				</Reference>',
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
				<Reference Uri="/qux/$metadata">\
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
				<DataServices>\
					<Schema Namespace="foo">\
						<ComplexType Name="Worker" OpenType="true" HasStream="true"/>\
						<ComplexType Name="Base" Abstract="true"/>\
						<ComplexType Name="Derived" BaseType="foo.Base"/>\
					</Schema>\
				</DataServices>',
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
		function test(sProperty, sValue, vExpectedValue) {
			var oXml = xml(assert, '<Foo ' + sProperty + '="' + sValue + '"/>'),
				oResult = {},
				oExpectedResult = {};

			if (vExpectedValue !== undefined) {
				oExpectedResult["$" + sProperty] = vExpectedValue;
			}
			_MetadataConverter.processFacetAttributes(oXml.documentElement, oResult);
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
		this.mock(_MetadataConverter).expects("processFacetAttributes")
			.withExactArgs(
				sinon.match.has("localName", "TypeDefinition"),
				{
					$kind : "TypeDefinition",
					$UnderlyingType : "Edm.String"
				});
		testConversion(assert, '\
				<DataServices>\
					<Schema Namespace="foo">\
						<TypeDefinition Name="Bar" UnderlyingType="Edm.String"/>\
					</Schema>\
				</DataServices>',
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
					"foo." : {
						"$kind" : "Schema"
					},
					"foo.Baz" : [{
						"$kind" : sRunnable,
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
						"$IsBound" : true,
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
					<DataServices>\
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
				</DataServices>',
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
	QUnit.test("annotations: leaf elements", function (assert) {
		testExpression(assert, '<String>foo\nbar</String>', "foo\nbar");
		testExpression(assert, '<String>foo<!-- bar --></String>', "foo");
		testExpression(assert, '<String><!-- foo -->bar</String>', "bar");
		testExpression(assert, '<String>foo<!-- bar -->baz</String>', "foobaz");

		testExpression(assert, '<Binary>T0RhdGE</Binary>', {"$Binary": "T0RhdGE"});
		testExpression(assert, '<Bool>false</Bool>', false);
		testExpression(assert, '<Date>2015-01-01</Date>', {"$Date" : "2015-01-01"});
		testExpression(assert, '<DateTimeOffset>2000-01-01T16:00:00.000-09:00</DateTimeOffset>',
			{"$DateTimeOffset" : "2000-01-01T16:00:00.000-09:00"});
		testExpression(assert, '<Decimal>3.14</Decimal>', {"$Decimal" : "3.14"});
		testExpression(assert, '<Duration>P11D23H59M59S</Duration>',
			{"$Duration" : "P11D23H59M59S"});
		testExpression(assert, '<EnumMember> foo.Enum/Member1  foo.Enum/Member2 </EnumMember>',
			{"$EnumMember" : "foo.Enum/Member1 foo.Enum/Member2"});
		testExpression(assert, '<Float>2.718</Float>', 2.718);
		testExpression(assert, '<Float>NaN</Float>', {"$Float" : "NaN"});
		testExpression(assert, '<Float>-INF</Float>', {"$Float" : "-INF"});
		testExpression(assert, '<Float>INF</Float>', {"$Float" : "INF"});
		testExpression(assert, '<Guid>21EC2020-3AEA-1069-A2DD-08002B30309D</Guid>',
			{"$Guid" : "21EC2020-3AEA-1069-A2DD-08002B30309D"});
		testExpression(assert, '<Int>42</Int>', 42);
		testExpression(assert, '<Int>9007199254740991</Int>', 9007199254740991);
		testExpression(assert, '<Int>9007199254740992</Int>', {"$Int" : "9007199254740992"});
		testExpression(assert, '<TimeOfDay>21:45:00</TimeOfDay>', {"$TimeOfDay" : "21:45:00"});
		testExpression(assert, '<AnnotationPath>Path/f.Bar@f.Term</AnnotationPath>',
			{"$AnnotationPath" : "Path/foo.Bar@foo.Term"});
		testExpression(assert,
			'<NavigationPropertyPath>Path/f.Bar/f.Baz</NavigationPropertyPath>',
			{"$NavigationPropertyPath" : "Path/foo.Bar/foo.Baz"});
		testExpression(assert, '<Path>Path/f.Bar/f.Baz</Path>', {"$Path" : "Path/foo.Bar/foo.Baz"});
		testExpression(assert, '<PropertyPath>Path/f.Bar/f.Baz</PropertyPath>',
			{"$PropertyPath" : "Path/foo.Bar/foo.Baz"});
		testExpression(assert, '<Null/>', null);
		testExpression(assert,
			'<LabeledElementReference>f.LabeledElement</LabeledElementReference>',
			{"$LabeledElementReference" : "foo.LabeledElement"});
	});

	//*********************************************************************************************
	QUnit.test("annotations: operators", function (assert) {
		testExpression(assert, '<And><Path>IsMale</Path><Path>IsMarried</Path></And>',
			{"$And" : [{"$Path" : "IsMale"}, {"$Path" : "IsMarried"}]});
		testExpression(assert, '<Or><Path>IsMale</Path><Path>IsMarried</Path></Or>',
			{"$Or" : [{"$Path" : "IsMale"}, {"$Path" : "IsMarried"}]});
		testExpression(assert, '<Not><Path>IsMale</Path></Not>', {"$Not" : {"$Path" : "IsMale"}});
		testExpression(assert, '<Eq><Null/><Path>IsMale</Path></Eq>',
			{"$Eq" : [null, {"$Path" : "IsMale"}]});
		testExpression(assert, '<Ne><Null/><Path>IsMale</Path></Ne>',
			{"$Ne" : [null, {"$Path" : "IsMale"}]});
		testExpression(assert, '<Gt><Path>Price</Path><Int>20</Int></Gt>',
			{"$Gt" : [{"$Path" : "Price"}, 20]});
		testExpression(assert, '<Ge><Path>Price</Path><Int>20</Int></Ge>',
			{"$Ge" : [{"$Path" : "Price"}, 20]});
		testExpression(assert, '<Le><Path>Price</Path><Int>20</Int></Le>',
			{"$Le" : [{"$Path" : "Price"}, 20]});
		testExpression(assert, '<Lt><Path>Price</Path><Int>20</Int></Lt>',
			{"$Lt" : [{"$Path" : "Price"}, 20]});
		testExpression(assert,
			'<If><Path>IsFemale</Path><String>Female</String><String>Male</String></If>',
			{"$If" : [{"$Path" : "IsFemale"}, "Female", "Male"]});
	});

	//*********************************************************************************************
	QUnit.test("annotations: Apply", function (assert) {
		testExpression(assert, '<Apply Function="f.Bar"/>',
			{"$Apply" : [], "$Function" : "foo.Bar"});
		testExpression(assert, '<Apply Function="odata.concat"><String>Product: </String>'
			+ '<Path>ProductName</Path></Apply>',
			{"$Apply" : ["Product: ", {"$Path" : "ProductName"}], "$Function" : "odata.concat"});
	});

	//*********************************************************************************************
	QUnit.test("annotations: Cast and IsOf", function (assert) {
		testExpression(assert, '<Cast Type="Collection(f.Type)"><Path>Average</Path></Cast>', {
			"$Cast" : {"$Path" : "Average"},
			"$Type" : "foo.Type",
			"$isCollection" : true
		});
		testExpression(assert, '<Cast Type="Edm.Decimal" MaxLength="10" Precision="8" Scale="2"'
			+ ' SRID="42"><Float>42</Float></Cast>', {
				"$Cast" : 42,
				"$Type" : "Edm.Decimal",
				"$MaxLength" : 10,
				"$Precision" : 8,
				"$Scale" : 2,
				"$SRID" : "42"
			});
		testExpression(assert, '<Cast Type="Edm.Decimal"/>',
			{"$Cast" : undefined, "$Type" : "Edm.Decimal"});  // do not crash
		testExpression(assert, '<IsOf Type="Collection(f.Type)"><Path>Average</Path></IsOf>', {
			"$IsOf" : {"$Path" : "Average"},
			"$Type" : "foo.Type",
			"$isCollection" : true
		});
		testExpression(assert, '<IsOf Type="Edm.Decimal" MaxLength="10" Precision="8" Scale="2"'
			+ ' SRID="42"><Float>42</Float></IsOf>', {
				"$IsOf" : 42,
				"$Type" : "Edm.Decimal",
				"$MaxLength" : 10,
				"$Precision" : 8,
				"$Scale" : 2,
				"$SRID" : "42"
			});
		testExpression(assert, '<IsOf Type="Edm.Decimal"/>',
			{"$IsOf" : undefined, "$Type" : "Edm.Decimal"});  // do not crash
	});

	//*********************************************************************************************
	QUnit.test("annotations: Collection", function (assert) {
		testExpression(assert, '<Collection/>', []);
		testExpression(assert,
			'<Collection><String>Product</String><Path>Supplier</Path></Collection>',
			["Product", {"$Path" : "Supplier"}]);
	});

	//*********************************************************************************************
	QUnit.test("annotations: LabeledElement", function (assert) {
		testExpression(assert, '<LabeledElement Name="CustomerFirstName" Path="FirstName" />',
			{"$LabeledElement" : {"$Path" : "FirstName"}, "$Name" : "CustomerFirstName"});
		testExpression(assert,
			'<LabeledElement Name="CustomerFirstName"><Path>FirstName</Path></LabeledElement>',
			{"$LabeledElement" : {"$Path" : "FirstName"}, "$Name" : "CustomerFirstName"});
	});

	//*********************************************************************************************
	QUnit.test("annotations: Record", function (assert) {
		testExpression(assert, '<Record Type="f.Record"/>', {"$Type" : "foo.Record"});
		testExpression(assert, '\
				<Record>\
					<PropertyValue Property="GivenName" Path="FirstName"/>\
					<PropertyValue Property="Surname"><Path>LastName</Path></PropertyValue>\
				</Record>',
			{
				"GivenName" : {"$Path" : "FirstName"},
				"Surname" : {"$Path" : "LastName"}
			});
	});

	//*********************************************************************************************
	QUnit.test("annotations: UrlRef", function (assert) {
		testExpression(assert, '<UrlRef><Path>/Url</Path></UrlRef>',
			{"$UrlRef" : {"$Path" : "/Url"}});
	});
	// TODO look at xml:base if the URL in UrlRef is static and relative

	//*********************************************************************************************
	QUnit.test("inline annotations: Schema, EntityType, ComplexType", function (assert) {
		testConversion(assert, '\
				<DataServices>\
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
				</DataServices>',
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
				<DataServices>\
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
				</DataServices>',
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
				<DataServices>\
					<Schema Namespace="foo" Alias="f">\
						<Action Name="Action">\
							<Parameter Name="Parameter" Type="Edm.String">\
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
						<Function Name="Function">\
							<Annotation Term="f.Term" String="Function"/>\
						</Function>\
					</Schema>\
				</DataServices>',
			{
				"foo." : {
					"$kind" : "Schema"
				},
				"foo.Action" : [{
					"$kind" : "Action",
					"$Parameter" : [{
						"$Name" : "Parameter",
						"$Type" : "Edm.String",
						"@foo.Term" : "Parameter"
					}],
					"$ReturnType" : {
						"$Type" : "Edm.String",
						"@foo.Term" : "ReturnType"
					},
					"@foo.Term" : "Action1"
				}, {
					"$kind" : "Action",
					"@foo.Term" : "Action2"
				}],
				"foo.Function" : [{
					"$kind" : "Function",
					"@foo.Term" : "Function"
				}]
			});
	});

	//*********************************************************************************************
	QUnit.test("inline annotations: EntityContainer and children", function (assert) {
		testConversion(assert, '\
				<DataServices>\
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
				</DataServices>',
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
				<Reference Uri="qux/$metadata">\
					<Annotation Term="foo.Term" String="Reference"/>\
				</Reference>',
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
				<DataServices>\
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
				</DataServices>',
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
	QUnit.test("annotated expressions", function (assert) {
		testExpression(assert, '\
				<Apply Function="f.Function">\
					<Annotation Term="f.Term" String="Apply"/>\
				</Apply>',
			{
				"$Apply" : [],
				"$Function" : "foo.Function",
				"@foo.Term" : "Apply"
			});
		testExpression(assert, '\
				<Cast Type="Edm.String">\
					<Annotation Term="f.Term" String="Cast"/>\
				</Cast>',
			{
				"$Cast" : undefined,
				"$Type" : "Edm.String",
				"@foo.Term" : "Cast"
			});
		["And", "Eq", "Ge", "Gt", "If", "Le", "Lt", "Ne", "Or"].forEach(
			function (sOperator) {
				var sXml = '<' + sOperator + '><Annotation Term="f.Term" String="Annotation"/></'
						+ sOperator + '>',
					oExpected = {"@foo.Term" : "Annotation"};

				oExpected["$" + sOperator] = [];
				testExpression(assert, sXml, oExpected);
			});
		testExpression(assert, '\
				<IsOf Type="Edm.String">\
					<Annotation Term="f.Term" String="IsOf"/>\
				</IsOf>',
			{
				"$IsOf" : undefined,
				"$Type" : "Edm.String",
				"@foo.Term" : "IsOf"
			});
		testExpression(assert, '\
				<LabeledElement Name="LabeledElement" String="Foo">\
					<Annotation Term="f.Term" String="LabeledElement"/>\
				</LabeledElement>',
			{
				"$Name" : "LabeledElement",
				"$LabeledElement" : "Foo",
				"@foo.Term" : "LabeledElement"
			});
		testExpression(assert, '\
				<Not Type="Edm.String">\
					<Annotation Term="f.Term" String="Not"/>\
				</Not>',
			{
				"$Not" : undefined,
				"@foo.Term" : "Not"
			});
		testExpression(assert, '\
				<Null>\
					<Annotation Term="f.Term" String="Null"/>\
				</Null>',
			{
				"$Null" : null,
				"@foo.Term" : "Null"
			});
		testExpression(assert, '\
				<Record Type="f.Record">\
					<Annotation Term="f.Term" String="Record"/>\
					<PropertyValue Property="GivenName" Path="FirstName">\
						<Annotation Term="f.Term" String="PropertyValue"/>\
					</PropertyValue>\
				</Record>',
			{
				"$Type" : "foo.Record",
				"GivenName" : {"$Path" : "FirstName"},
				"@foo.Term" : "Record",
				"GivenName@foo.Term" : "PropertyValue"
			});
	});

	//*********************************************************************************************
	QUnit.test("convertXMLMetadata: test service", function (assert) {
		return Promise.all([
			Promise.resolve(
					jQuery.ajax("/sap/opu/odata4/IWBEP/TEA/default/IWBEP/TEA_BUSI/0001/$metadata"))
				.then(function (oXML) {
					return _MetadataConverter.convertXMLMetadata(oXML);
				}),
			jQuery.ajax("/sap/opu/odata4/IWBEP/TEA/default/IWBEP/TEA_BUSI/0001/metadata.json")
		]).then(function (aResults) {
			assert.deepEqual(aResults[0], aResults[1]);
		});
	});
});
