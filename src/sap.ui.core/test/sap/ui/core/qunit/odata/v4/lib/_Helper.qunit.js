/*!
 * ${copyright}
 */
sap.ui.require([
	"sap/ui/model/odata/v4/lib/_Helper",
	"sap/ui/test/TestUtils",
	"sap/ui/thirdparty/URI",
	'jquery.sap.xml' // needed to have jQuery.sap.parseXML
], function (Helper, TestUtils, URI) {
	/*global QUnit, sinon */
	/*eslint no-warning-comments: 0, no-multi-str: 0 */
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
			oResult = Helper.convertXMLMetadata(oXML);

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
	QUnit.module("sap.ui.model.odata.v4.lib._Helper", {
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
	[{
		message : "CSRF token validation failed",
		"response" : {
			"headers" : {
				"Content-Type" : "text/plain;charset=utf-8",
				"x-csrf-token" : "Required"
			},
			"responseText" : "CSRF token validation failed",
			"status" : 403,
			"statusText" : "Forbidden"
		}
	}, {
		message : "401 Unauthorized",
		"response" : {
			"headers" : {
				"Content-Type" : "text/html;charset=utf-8"
			},
			"responseText" : "<html>...</html>",
			"status" : 401,
			"statusText" : "Unauthorized"
		}
	}, {
		// OData v4 error response body as JSON
		// "The error response MUST be a single JSON object. This object MUST have a
		// single name/value pair named error. The value must be a JSON object."
		body : {
			"error" : {
				"code" : "/IWBEP/CM_V4_RUNTIME/021",
				"message" :
					// Note: "a human-readable, language-dependent representation of the error"
					"The state of the resource (entity) was already changed (If-Match)",
				"@Common.ExceptionCategory" : "Client_Error",
				"@Common.Application" : {
					"ComponentId" : "OPU-BSE-BEP",
					"ServiceRepository" : "DEFAULT",
					"ServiceId" : "/IWBEP/TEA_BUSI",
					"ServiceVersion" : "0001"
				},
				"@Common.TransactionId" : "5617D1F235DE73F0E10000000A60180C",
				"@Common.Timestamp" : "20151009142600.103179",
				"@Common.ErrorResolution" : {
					"Analysis" : "Run transaction /IWFND/ERROR_LOG [...]",
					"Note" : "See SAP Note 1797736 for error analysis "
						+ "(https://service.sap.com/sap/support/notes/1797736)"
				}
			}
		},
		isConcurrentModification : true,
		message : "The state of the resource (entity) was already changed (If-Match)",
		"response" : {
			"headers" : {
				"Content-Type" : "application/json; odata.metadata=minimal;charset=utf-8"
			},
//			"responseText" : JSON.stringify(this.body)
			"status" : 412,
			"statusText" : "Precondition Failed"
		}
	}, {
		message : "999 Invalid JSON",
		"response" : {
			"headers" : {
				"Content-Type" : "application/json"
			},
			"responseText" : "<html>...</html>",
			"status" : 999,
			"statusText" : "Invalid JSON"
		},
		warning : sinon.match(/SyntaxError/)
	}, {
		message : "403 Forbidden",
		"response" : {
			"headers" : {
				"Content-Type" : "text/plain-not-quite-right"
			},
			"status" : 403,
			"statusText" : "Forbidden",
			"responseText" : "ignore this!"
		}
	}].forEach(function (oFixture) {
		QUnit.test("createError: " + oFixture.message, function (assert) {
			var oError,
				jqXHR = {
					getResponseHeader : function (sName) {
						return oFixture.response.headers[sName];
					},
					"status" : oFixture.response.status,
					"statusText" : oFixture.response.statusText,
					"responseText" : oFixture.response.responseText || JSON.stringify(oFixture.body)
				};

			if (oFixture.warning) {
				this.oLogMock.expects("warning").withExactArgs(oFixture.warning,
					oFixture.response.responseText, "sap.ui.model.odata.v4.lib._Helper");
			}

			oError = Helper.createError(jqXHR);

			assert.ok(oError instanceof Error);
			assert.deepEqual(oError.error, oFixture.body && oFixture.body.error);
			assert.strictEqual(oError.isConcurrentModification, oFixture.isConcurrentModification);
			assert.strictEqual(oError.message, oFixture.message);
			assert.strictEqual(oError.status, oFixture.response.status);
			assert.strictEqual(oError.statusText, oFixture.response.statusText);
		});
	});

	//*********************************************************************************************
	QUnit.test("encode", function (assert) {
		var sUnchanged = "foo$,/:?@()";

		assert.strictEqual(Helper.encode(sUnchanged, false), sUnchanged);
		assert.strictEqual(Helper.encode(sUnchanged, true), sUnchanged);

		assert.strictEqual(Helper.encode("€_&_=_#_+_;", false), "%E2%82%AC_%26_=_%23_%2B_%3B");
		assert.strictEqual(Helper.encode("€_&_=_#_+_;", true), "%E2%82%AC_%26_%3D_%23_%2B_%3B");
	});

	//*********************************************************************************************
	QUnit.test("encodePair", function (assert) {
		var sEncoded,
			oHelperMock = this.mock(Helper);

		oHelperMock.expects("encode").withExactArgs("key", true).returns("~key~");
		oHelperMock.expects("encode").withExactArgs("value", false).returns("~value~");

		sEncoded = Helper.encodePair("key", "value");
		assert.strictEqual(sEncoded, "~key~=~value~");
	});

	//*********************************************************************************************
	QUnit.test("buildQuery: no query", function (assert) {
		assert.strictEqual(Helper.buildQuery(), "");
		assert.strictEqual(Helper.buildQuery({}), "");
	});

	//*********************************************************************************************
	QUnit.test("buildQuery: query", function (assert) {
		var sEncoded,
			oHelperMock = this.mock(Helper);

		oHelperMock.expects("encodePair").withExactArgs("a", "b").returns("a=b");
		oHelperMock.expects("encodePair").withExactArgs("c", "d").returns("c=d");
		oHelperMock.expects("encodePair").withExactArgs("c", "e").returns("c=e");

		sEncoded = Helper.buildQuery({a : "b", c: ["d", "e"]});
		assert.strictEqual(sEncoded, "?a=b&c=d&c=e");
	});

	//*********************************************************************************************
	QUnit.test("buildQuery and decoding via URI.js", function (assert) {
		var sComplexString = "",
			i,
			mParameters = {},
			sUri;

		for (i = 32; i < 127; i++) {
			sComplexString = sComplexString + String.fromCharCode(i);
		}

		sUri = "/" + Helper.buildQuery({foo: sComplexString});

		// decode via URI.js
		assert.strictEqual(new URI(sUri).search(true).foo, sComplexString);

		mParameters[sComplexString] = "foo";
		sUri = "/" + Helper.buildQuery(mParameters);

		// decode via URI.js
		assert.strictEqual(new URI(sUri).search(true)[sComplexString], "foo");
	});

	//*********************************************************************************************
	QUnit.test("xml.traverse", function (assert) {
		var oXML = xml(assert, "<foo><!-- a comment -->text<bar/>more text <ignore/><bar/>"
				+ "\n<bar><innerBar/><innerBar/><innerBar2/></bar></foo>"),
			oAggregate = {
				bar: 0,
				innerBar: 0,
				innerBar2: 0
			},
			oSchemaConfig = {
				"bar": {
					__processor: processor.bind(null, "bar"),
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

		Helper.xml.traverse(oXML.documentElement, oAggregate, oSchemaConfig);
		assert.strictEqual(oAggregate.bar, 3);
		assert.strictEqual(oAggregate.innerBar, 2);
		assert.strictEqual(oAggregate.innerBar2, 1);
	});

	//*********************************************************************************************
	QUnit.test("resolveAlias", function (assert) {
		var oAggregate = {
				aliases : {
					"display": "org.example.vocabularies.display"
				}
			};

		// Types
		assert.strictEqual(Helper.xml.resolveAlias("display.Foo", oAggregate),
			"org.example.vocabularies.display.Foo");
		assert.strictEqual(Helper.xml.resolveAlias("display.bar.Foo", oAggregate),
			"display.bar.Foo");
		assert.strictEqual(Helper.xml.resolveAlias("bar.Foo", oAggregate), "bar.Foo");
		assert.strictEqual(Helper.xml.resolveAlias("Foo", oAggregate), "Foo");

		// EntitySets etc
		assert.strictEqual(Helper.xml.resolveAlias("display.Container/Foo", oAggregate),
			"org.example.vocabularies.display.Container/Foo");
	});
	// TODO "Collection(display.Foo)" not supported yet (wait for review results)
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
				"$Schema": {
					"foo.Container": {
						"$kind": "EntityContainer",
						"Me": {
							"$kind": "Singleton",
							"$Type": "foo.Worker",
							"Manager" : "foo.Manager"
						}
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
							<NavigationProperty Name="Address" Type="f.Address"/>\
						</ComplexType>\
					</Schema>\
					<Schema Namespace="foo" Alias="f"/>\
				</DataServices>',
			{
				"$Schema": {
					"qux": {
						"$kind": "Reference",
						"$ref": "qux/$metadata"
					},
					"bar.Worker": {
						"$kind": "ComplexType",
						"Something": {
							"$Type": "qux.Something"
						},
						"Address": {
							"$kind": "navigation",
							"$Type": "foo.Address"
						}
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
							<EntitySet Name="Teams" EntityType="f.Team">\
								<NavigationPropertyBinding Path="Manager" Target="f.Container/Managers"/>\
							</EntitySet>\
						</EntityContainer>\
					</Schema>\
				</DataServices>',
			{
				"$EntityContainer": "foo.Container",
				"$Schema": {
					"foo.Container": {
						"$kind": "EntityContainer",
						"Teams": {
							"$Type": "foo.Team",
							"Manager": "foo.Container/Managers"
						}
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
				"$Schema": {
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
				"$Schema": {
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
				"$Schema": {
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
				}
			});
	});

	//*********************************************************************************************
	QUnit.test("convertXMLMetadata: Property and NavigationProperty", function (assert) {
		testConversion(assert, '\
				<DataServices>\
					<Schema Namespace="foo">\
						<EntityType Name="Worker">\
							<Property Name="Salary" Type="Edm.Decimal" Precision="8" Scale="2"/>\
							<Property Name="p1" Type="Edm.String" Unicode="false" />\
							<Property Name="p2" Type="Edm.String" Unicode="true" />\
							<Property Name="p3" Type="Edm.Geometry" SRID="42" />\
							<Property Name="p4" Type="Edm.Int32" DefaultValue="12345" />\
							<NavigationProperty Name="team1" Type="foo.Team" Partner="worker" />\
							<NavigationProperty Name="team2" Type="foo.Team" ContainsTarget="true" />\
							<NavigationProperty Name="team3" Type="foo.Team" ContainsTarget="false" />\
						</EntityType>\
					</Schema>\
				</DataServices>',
			{
				"$Schema": {
					"foo.Worker": {
						"$Key": [],
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
							"$Partner": "worker"
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
				}
			});
	});
	// TODO adjust $DefaultValue to property type?
	// TODO ReferentialConstraint, OnDelete

	//*********************************************************************************************
	QUnit.test("convertXMLMetadata: test service", function (assert) {
		return Promise.all([
			jQuery.ajax("/sap/opu/local_v4/IWBEP/TEA_BUSI/$metadata")
				.then(function (oXML) {
					return Helper.convertXMLMetadata(oXML);
				}),
			jQuery.ajax("/sap/opu/local_v4/IWBEP/TEA_BUSI/metadata.json")
		]).then(function (aResults) {
			assert.deepEqual(aResults[0], aResults[1]);
		});
	});
});
