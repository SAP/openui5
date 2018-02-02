/*!
 * ${copyright}
 */
sap.ui.require([
	"jquery.sap.global",
	"sap/ui/model/odata/v4/lib/_MetadataConverter",
	"sap/ui/model/odata/v4/lib/_V2MetadataConverter",
	"sap/ui/model/odata/v4/lib/_V4MetadataConverter",
	"jquery.sap.xml" // unused, needed to have jQuery.sap.parseXML
], function (jQuery, _MetadataConverter, _V2MetadataConverter, _V4MetadataConverter) {
	/*global QUnit */
	/*eslint no-warning-comments: 0 */
	"use strict";

	var sV2Start = '<edmx:Edmx Version="1.0" xmlns="http://schemas.microsoft.com/ado/2008/09/edm"'
			+ ' xmlns:edmx="http://schemas.microsoft.com/ado/2007/06/edmx"'
			+ ' xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata">'
			+ '<edmx:DataServices m:DataServiceVersion="2.0">',
		sV4Start = '<edmx:Edmx Version="4.0" xmlns:edmx="http://docs.oasis-open.org/odata/ns/edmx"'
			+ ' xmlns="http://docs.oasis-open.org/odata/ns/edm"><edmx:DataServices>',
		sEnd = "</edmx:DataServices></edmx:Edmx>";

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
	// TODO how to avoid duplication of this test method?

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
	 * @param {string} sODataVersion
	 *   the OData version to use for the test
	 */
	function testExpression(assert, sXmlSnippet, vExpected, sODataVersion) {
		var aMatches, sPath;

		function convert(Converter, sXml) {
			var oResult = new Converter().convertXMLMetadata(xml(assert, sXml));
			assert.deepEqual(oResult["foo."].$Annotations["foo.Bar"]["@foo.Term"], vExpected,
				sXml);
		}

		function localTest() {
			if (!sODataVersion || sODataVersion === "2.0") {
				convert(_V2MetadataConverter, sV2Start + sXmlSnippet + sEnd);
			}
			if (!sODataVersion || sODataVersion === "4.0") {
				convert(_V4MetadataConverter, sV4Start + sXmlSnippet + sEnd);
			}
		}

		sXmlSnippet = '\
			<Schema Namespace="foo" Alias="f">\
				<Annotations xmlns="http://docs.oasis-open.org/odata/ns/edm" Target="foo.Bar">\
					<Annotation Term="foo.Term">' + sXmlSnippet + '</Annotation>\
				</Annotations>\
			</Schema>';

		localTest();

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
			localTest();
		}
	}

	//*********************************************************************************************
	QUnit.module("sap.ui.model.odata.v4.lib._MetadataConverter", {
		beforeEach : function () {
			this.oLogMock = this.mock(jQuery.sap.log);
			this.oLogMock.expects("warning").never();
			this.oLogMock.expects("error").never();
		}
	});

	//*********************************************************************************************
	QUnit.test("traverse", function (assert) {
		var oXML = xml(assert, "<foo><!-- a comment -->text<bar/>more text <ignore/><bar/>"
				+ "<bar><included1/><included2/></bar>"
				+ "\n<bar><innerBar/><innerBar/><innerBar2/></bar></foo>"),
			oInclude1Config = {
				"included1" : {
					__processor : function (oElement) {
						this.processor("included1", oElement);
					}
				}
			},
			oInclude2Config = {
				"included2" : {
					__processor : function (oElement) {
						this.processor("included2", oElement);
					}
				}
			},
			oSchemaConfig = {
				"bar" : {
					__processor : function (oElement) {
						this.processor("bar", oElement);
					},
					__include : [oInclude1Config, oInclude2Config],
					"innerBar" : {
						__processor : function (oElement) {
							this.processor("innerBar", oElement);
						}
					},
					"innerBar2" : {
						__processor : function (oElement) {
							this.processor("innerBar2", oElement);
						}
					}
				}
			},
			oMetadataConverter = new _MetadataConverter();

		oMetadataConverter.bar = 0;
		oMetadataConverter.innerBar = 0;
		oMetadataConverter.innerBar2 = 0;
		oMetadataConverter.included1 = 0;
		oMetadataConverter.included2 = 0;
		oMetadataConverter.processor = function (sExpectedName, oElement) {
			assert.strictEqual(oElement.nodeType, 1, "is an Element");
			assert.strictEqual(oElement.localName, sExpectedName);
			this[sExpectedName]++;
		};

		oMetadataConverter.traverse(oXML.documentElement, oSchemaConfig);
		assert.strictEqual(oMetadataConverter.bar, 4);
		assert.strictEqual(oMetadataConverter.innerBar, 2);
		assert.strictEqual(oMetadataConverter.innerBar2, 1);
		assert.strictEqual(oMetadataConverter.included1, 1);
		assert.strictEqual(oMetadataConverter.included2, 1);
	});

	//*********************************************************************************************
	QUnit.test("traverse: __postProcessor", function (assert) {
		var oXML = xml(assert, "<And><Bool>true</Bool><Bool>false</Bool></And>"),
			oResult = new _MetadataConverter().traverse(oXML.documentElement, {
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
		var oMetadataConverter = new _MetadataConverter();

		oMetadataConverter.aliases = {
			"display" : "org.example.vocabularies.display."
		};

		assert.strictEqual(oMetadataConverter.resolveAlias(""), "");
		assert.strictEqual(oMetadataConverter.resolveAlias("display.Foo"),
			"org.example.vocabularies.display.Foo");
		assert.strictEqual(oMetadataConverter.resolveAlias("display.bar.Foo"),
			"display.bar.Foo");
		assert.strictEqual(oMetadataConverter.resolveAlias("bar.Foo"), "bar.Foo");
		assert.strictEqual(oMetadataConverter.resolveAlias("Foo"), "Foo");
	});

	//*********************************************************************************************
	QUnit.test("resolveAliasInPath", function (assert) {
		var oMock = this.mock(_MetadataConverter.prototype);

			function localTest(sPath, sExpected) {
				assert.strictEqual(new _MetadataConverter().resolveAliasInPath(sPath),
					sExpected || sPath);
			}

			oMock.expects("resolveAlias").never();

			localTest("Employees");
			localTest("Employees/Team");

			oMock.expects("resolveAlias")
				.withExactArgs("f.Some").returns("foo.Some");
			oMock.expects("resolveAlias")
				.withExactArgs("f.Random").returns("foo.Random");
			oMock.expects("resolveAlias")
				.withExactArgs("f.Path").returns("foo.Path");
			localTest("f.Some/f.Random/f.Path", "foo.Some/foo.Random/foo.Path");

			oMock.expects("resolveAlias")
				.withExactArgs("f.Path").returns("foo.Path");
			oMock.expects("resolveAlias")
				.withExactArgs("f.Term").returns("foo.Term");
			localTest("f.Path@f.Term", "foo.Path@foo.Term");

			oMock.expects("resolveAlias")
				.withExactArgs("f.Path").returns("foo.Path");
			oMock.expects("resolveAlias")
				.withExactArgs("").returns("");
			oMock.expects("resolveAlias")
				.withExactArgs("f.Term").returns("foo.Term");
			localTest("f.Path/@f.Term", "foo.Path/@foo.Term");
	});

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
		testExpression(assert, '<Cast Type="Edm.Decimal" MaxLength="10" Precision="8" Scale="2">'
			+ '<Float>42</Float></Cast>', {
			"$Cast" : 42,
			"$Type" : "Edm.Decimal",
			"$MaxLength" : 10,
			"$Precision" : 8,
			"$Scale" : 2
		}, "2.0");
		testExpression(assert, '<Cast Type="Edm.Decimal" MaxLength="10" Precision="8" Scale="2"'
			+ ' SRID="42"><Float>42</Float></Cast>', {
			"$Cast" : 42,
			"$Type" : "Edm.Decimal",
			"$MaxLength" : 10,
			"$Precision" : 8,
			"$Scale" : 2,
			"$SRID" : "42"
		}, "4.0");
		testExpression(assert, '<Cast Type="Edm.Decimal"/>',
			{"$Cast" : undefined, "$Type" : "Edm.Decimal"});  // do not crash
		testExpression(assert, '<IsOf Type="Collection(f.Type)"><Path>Average</Path></IsOf>', {
			"$IsOf" : {"$Path" : "Average"},
			"$Type" : "foo.Type",
			"$isCollection" : true
		});
		testExpression(assert, '<IsOf Type="Edm.Decimal" MaxLength="10" Precision="8" Scale="2">'
			+ '<Float>42</Float></IsOf>', {
			"$IsOf" : 42,
			"$Type" : "Edm.Decimal",
			"$MaxLength" : 10,
			"$Precision" : 8,
			"$Scale" : 2
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
});
