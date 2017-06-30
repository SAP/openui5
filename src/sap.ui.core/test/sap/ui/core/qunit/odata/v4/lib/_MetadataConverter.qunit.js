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
	"use strict";
	/*eslint no-warning-comments: 0 */

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

	//*********************************************************************************************
	QUnit.module("sap.ui.model.odata.v4.lib._MetadataConverter", {
		beforeEach : function () {
			this.oSandbox = sinon.sandbox.create();
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

			function localTest(sPath, sExpected) {
				assert.strictEqual(_MetadataConverter.resolveAliasInPath(sPath, oAggregate),
					sExpected || sPath);
			}

			oMock.expects("resolveAlias").never();

			localTest("Employees");
			localTest("Employees/Team");

			oMock.expects("resolveAlias")
				.withExactArgs("f.Some", sinon.match.same(oAggregate)).returns("foo.Some");
			oMock.expects("resolveAlias")
				.withExactArgs("f.Random", sinon.match.same(oAggregate)).returns("foo.Random");
			oMock.expects("resolveAlias")
				.withExactArgs("f.Path", sinon.match.same(oAggregate)).returns("foo.Path");
			localTest("f.Some/f.Random/f.Path", "foo.Some/foo.Random/foo.Path");

			oMock.expects("resolveAlias")
				.withExactArgs("f.Path", sinon.match.same(oAggregate)).returns("foo.Path");
			oMock.expects("resolveAlias")
				.withExactArgs("f.Term", sinon.match.same(oAggregate)).returns("foo.Term");
			localTest("f.Path@f.Term", "foo.Path@foo.Term");

			oMock.expects("resolveAlias")
				.withExactArgs("f.Path", sinon.match.same(oAggregate)).returns("foo.Path");
			oMock.expects("resolveAlias")
				.withExactArgs("", sinon.match.same(oAggregate)).returns("");
			oMock.expects("resolveAlias")
				.withExactArgs("f.Term", sinon.match.same(oAggregate)).returns("foo.Term");
			localTest("f.Path/@f.Term", "foo.Path/@foo.Term");
	});
});
