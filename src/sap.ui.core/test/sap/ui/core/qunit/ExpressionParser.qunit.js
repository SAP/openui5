/*!
 * ${copyright}
 */
sap.ui.require([
	"sap/ui/base/BindingParser",
	"sap/ui/base/ExpressionParser",
	"sap/ui/core/Icon",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/odata/ODataUtils"
], function (BindingParser, ExpressionParser, Icon, JSONModel, ODataUtils) {
	/*global QUnit, sinon */
	/*eslint max-nested-callbacks: 4, no-warning-comments: 0 */
	"use strict";

	var oModel = new JSONModel(
			{mail: "mail", tel: "tel", tel2: "tel", 3: 3, five: 5, thirteen: 13}
		);

	/**
	 * Checks the string result of an expression binding when bound to a control property of type
	 * string.
	 *
	 * @param {object} assert the assertions
	 * @param {string} sExpression - the expression or the expression binding in {=... syntax
	 * @param {any} vResult - the expected result before automatic conversion
	 * @param {object} [oScope] - the object to resolve formatter functions in the control
	 */
	function check(assert, sExpression, vResult, oScope) {
		var oIcon = new Icon({
				color: sExpression.charAt(0) === "{" ? sExpression : "{=" + sExpression + "}",
				models: oModel
			}, oScope);

		oIcon.bindObject("/");
		assert.strictEqual(oIcon.getColor(), oIcon.validateProperty("color", vResult));
	}

	/**
	 * Runs tests with the given title for each fixture in the given array; each
	 * fixture has string properties expression and result as needed by the check function and is
	 * checked using the check function.
	 *
	 * @param {string} sTitle - test title
	 * @param {object[]} aFixtures - the array of test fixtures
	 * @param {function} [fnInit] - optional initializer function to e.g. set stubs
	 */
	function checkFixtures(sTitle, aFixtures, fnInit) {
		aFixtures.forEach(function (oFixture) {
			QUnit.test(sTitle + " : " + oFixture.expression + " --> " + oFixture.result,
				function (assert) {
					if (fnInit) {
						fnInit(this); //call initializer with sandbox
					}
					check(assert, oFixture.expression, oFixture.result);
				}
			);
		});
	}

	//*********************************************************************************************
	QUnit.module("sap.ui.base.ExpressionParser", {
		/**
		 * Checks that the code throws an expected error.
		 *
		 * @param {object} assert the assertions
		 * @param {function} fnCodeUnderTest
		 *   the code under test
		 * @param {string} sMessage
		 *   the expected error message
		 * @param {string} sDetails
		 *   the expected error details
		 * @param {number} iAt
		 *   the expected error position
		 */
		checkError : function (assert, fnCodeUnderTest, sMessage, sDetails, iAt) {
			var oLogMock = this.mock(jQuery.sap.log);

			oLogMock.expects("error").withExactArgs(
				sMessage + (iAt !== undefined ? " at position " + iAt : ""),
				sDetails,
				"sap.ui.base.ExpressionParser"
			);
			try {
				fnCodeUnderTest();
				assert.ok(false, "code under test throws");
			} catch (e) {
				assert.ok(e instanceof SyntaxError, "Error type: " + e);
				assert.strictEqual(e.message, sMessage, "Error.message");
				assert.strictEqual(e.at, iAt, "Error.at");
				if (iAt) {
					assert.strictEqual(e.text, sDetails, "Error.at");
				}
			}
		}
	});

	//*********************************************************************************************
	[
		{ binding: "{='foo'}", literal: 'foo' },
		{ binding: '{="foo"}', literal: 'foo' },
		{ binding: "{= 'foo bar' }", literal: 'foo bar' }
	].forEach(function(oFixture) {
		QUnit.test("Valid String literal " + oFixture.binding, function (assert) {
			var oExpression;

			oExpression = ExpressionParser.parse(
				function () { assert.ok(false, "unexpected call to fnResolveBinding"); },
				oFixture.binding,
				2);
			assert.strictEqual(oExpression.result, undefined,
					"no formatter for constant expression");
			assert.strictEqual(oExpression.constant, oFixture.literal);
			assert.strictEqual(oExpression.at, oFixture.binding.indexOf("}"));
		});
	});

	//*********************************************************************************************
	[
		{ binding: "{=${target>sap:semantics}}" },
		{ binding: "{=${ b}   }" },
		{ binding: "{=     ${ b} }" }
	].forEach(function(oFixture) {
		QUnit.test("Valid embedded binding " + oFixture.binding, function (assert) {
			var oBinding = {
					result: {/*bindingInfo*/},
					at: oFixture.binding.indexOf("}") + 1
				},
				oExpression;

			function resolveBinding(sInput, iStart) {
				assert.strictEqual(sInput, oFixture.binding);
				assert.strictEqual(iStart, oFixture.binding.indexOf("{", 1));
				return oBinding;
			}

			oExpression = ExpressionParser.parse(
				resolveBinding,
				oFixture.binding,
				2);
			assert.strictEqual(oExpression.result.formatter("tel"), "tel");
			assert.deepEqual(oExpression.result.parts, [oBinding.result],
				"parts array holds binding(s)");
			assert.strictEqual(oExpression.at, oFixture.binding.lastIndexOf("}"));
		});
	});

	//*********************************************************************************************
	checkFixtures("String literal", [
		{ expression: "'foo'", result: "foo" },
		{ expression: "'foo' ", result: "foo" }, //trailing whitespace
		{ expression: "'Hello, world!'", result: "Hello, world!" },
		{ expression: "'{\\\\}escaping'", result: "{\\}escaping" },
		{ expression: "{='{\\\\}escaping'}\\{\\\\\\}", result: "{\\}escaping{\\}" }
	]);

	//*********************************************************************************************
	checkFixtures("Number literal", [
		{ expression: "42", result: "42" },
		{ expression: "3.14", result: "3.14" },
		{ expression: "6.022e+23", result: "6.022e+23" },
		{ expression: ".57721", result: "0.57721" },
		{ expression: "-273.15", result: "-273.15" }
	]);

	//*********************************************************************************************
	checkFixtures("Operators ===, !==", [
		{ expression: "${/tel} === 'tel'", result: "true" },
		{ expression: "${/tel} === 'mail'", result: "false" },
		{ expression: "'tel' === ${/tel}", result: "true" },
		{ expression: "${/tel} === ${/tel2}", result: "true" },
		{ expression: "${/tel} === ${/mail}", result: "false" },
		{ expression: "true || false === false", result: "true" }, //true || (false === false)
		{ expression: "true !== false", result: "true" }
	]);

	//*********************************************************************************************
	[
		//parser error
		{binding: "{=$invalid}}", message: "Expected '{' instead of 'i'", at: 4}
	].forEach(function(oFixture) {
		QUnit.test("Invalid binding: " + oFixture.binding, function (assert) {
			this.checkError(assert, function () {
				// call ExpressionParser through BindingParser to gain resolution of bindings
				BindingParser.complexParser(oFixture.binding);
			}, oFixture.message, oFixture.binding, oFixture.at);
		});
	});

	//*********************************************************************************************
	checkFixtures("Boolean literals, &&, ||, !", [
		{ expression: "true", result: "true" },
		{ expression: "false", result: "false" },
		{ expression: "null", result: "null" },
		{ expression: "true || false", result: "true" },
		{ expression: "true && false", result: "false" },
		{ expression: "false || false || true", result: "true" },
		{ expression: "true || true && false", result: "true" },
		{ expression: "false && true || true", result: "true" },
		{ expression: "!true", result: "false" },
		{ expression: "!!true", result: "true" },
		{ expression: "!true || true", result: "true" },
		{ expression: "null && null.foo", result: "null" }, //guard may only eval left side
		{ expression: "true || null.foo", result: "true" } //default may only eval left side
	]);

	//*********************************************************************************************
	checkFixtures("Grouping", [
		{ expression: "(true || false) === false", result: "false" }
	]);

	//*********************************************************************************************
	checkFixtures("Conditional", [
		{ expression: "true ? 'foo' : 'bar'", result: "foo" },
		{ expression: "true ? false ? 'foo' : 'bar' : 'baz'", result: "bar" },
		//right associativity test:
		//correct: true ? 'foo' : (true ? 'bar' : 'baz') --> "foo"
		//wrong: (true ? 'foo' : true) ? 'bar' : 'baz' --> "bar"
		{ expression: "true ? 'foo' : true ? 'bar' : 'baz'", result: "foo" },
		{ expression: "(true ? 'foo' : true) ? 'bar' : 'baz'", result: "bar" }
	]);

	//*********************************************************************************************
	checkFixtures("Member access and function call", [
			{ expression: "odata.fillUriTemplate()", result: "TODO" },
			{ expression: "odata.fillUriTemplate('http://www.foo.com')",
				result: "http://www.foo.com" },
			{ expression: "odata.fillUriTemplate('http://www.foo.com', '/foo')",
				result: "http://www.foo.com/foo" },
			{ expression: "'foo'.concat('bar')", result: "foobar" }, //method with call context
			{ expression: "encodeURIComponent('foo bar')", result: "foo%20bar" }, //global function
			{ expression:
				"odata.fillUriTemplate('http://foo/{t},{m}', {t: ${/tel}, 'm': ${/mail}})",
				result: "http://foo/tel,mail" },
			{ expression:
				"odata.fillUriTemplate('http://foo/{t},{m}', {t: ${/mail}, 'm': ${/tel}})",
				result: "http://foo/mail,tel" }
		],
		function (oSandbox) {
			var mGlobals = {
					odata: {
						fillUriTemplate: function(sTemplate, mParameters) {
							var sKey;
							if (!sTemplate) {
								return "TODO";
							}
							if (!mParameters) {
								return sTemplate;
							}
							if (typeof mParameters === "string") {
								return sTemplate + mParameters;
							}
							for (sKey in mParameters) {
								sTemplate = sTemplate.replace("{" + sKey + "}", mParameters[sKey]);
							}
							return sTemplate;
						},
						foo: "bar"
					},
					encodeURIComponent: encodeURIComponent
				},
				fnOriginalParse = ExpressionParser.parse;

			//use test globals in expression parser
			oSandbox.stub(ExpressionParser, "parse",
				function(fnResolveBinding, sInput, iStart) {
					return fnOriginalParse.call(null, fnResolveBinding, sInput, iStart, mGlobals);
				}
			);
		}
	);

	//*********************************************************************************************
	[
		{ binding: "{=odata.fillUriTemplate(.}", message: "Unexpected .", token: "." },
		{ binding: "{=odata.fillUriTemplate('foo', )}", message: "Unexpected )", token: ")" },
		{ binding: "{={foo: 'bar', }}", message: "Expected IDENTIFIER but instead saw }",
			at: 16 },
		{ binding: "{={foo: 'bar',",
			message: "Expected IDENTIFIER but instead saw end of input" },
		{ binding: "{={true: 'bar'}}", message: "Expected IDENTIFIER but instead saw true",
			token: "true" },
		{ binding: "{=, 'foo'}", message: "Unexpected ,", token: "," },
		{ binding: "{='foo' ! 'bar'}", message: "Unexpected !", token: "!" },
		{ binding: "{='foo' typeof 'bar'}", message: "Unexpected typeof", token: "typeof" },
		{ binding: "{=odata.}", message: "Expected IDENTIFIER but instead saw }", token: "}" },
		{ binding: "{=odata.", message: "Expected IDENTIFIER but instead saw end of input"},
		{ binding: "{=true ||", message: "Expected expression but instead saw end of input"},
		{ binding: "{=odata.'foo'}", message: "Expected IDENTIFIER but instead saw 'foo'",
			token: "'foo'"},
		{ binding: "{=(1 2)}", message: "Expected ) but instead saw 2", token: "2"},
		{ binding: "{='foo'[1+]}", message: "Unexpected ]", token: "]"},
		{ binding: "{='foo'[1}", message: "Expected ] but instead saw }", token: "}"},
		{ binding: "{=[1}", message: "Expected , but instead saw }", token: "}"},
		{ binding: "{=[1 2]}", message: "Expected , but instead saw 2", token: "2"},
		{ binding: "{=[1+]}", message: "Unexpected ]", token: "]"},
		{ binding: "{=[1,]}", message: "Unexpected ]", token: "]"}
	].forEach(function(oFixture) {
		QUnit.test("Error handling " + oFixture.binding + " --> " + oFixture.message,
			function (assert) {
				this.checkError(assert, function () {
						BindingParser.complexParser(oFixture.binding);
					},
					oFixture.message,
					oFixture.binding,
					oFixture.at || (oFixture.token
						? oFixture.binding.lastIndexOf(oFixture.token) + 1 : undefined));
			});
	});

	//*********************************************************************************************
	[
		{binding: "{='foo' 'bar'}", at: 8},
		{binding: "{='foo' ${bar}}", at: 8},
		{binding: "{=odata foo}", at: 8},
		{binding: "{=odata.fillUriTemplate )}", at: 24},
		{binding: "{='foo' , 'bar'}", at: 8}
	].forEach(function(oFixture) {
		QUnit.test("Error handling: excess tokens: " + oFixture.binding, function (assert) {
			assert.throws(function () {
				BindingParser.complexParser(oFixture.binding);
			}, new SyntaxError("Expected '}' and instead saw '"
					+ oFixture.binding.charAt(oFixture.at) + "' in expression binding "
					+ oFixture.binding + " at position " + oFixture.at)
			);
		});
	});

	//*********************************************************************************************
	[
		{ binding: "{={}}", result: {} },
		{ binding: "{={'foo': 'bar'}}", result: {foo: "bar"} },
		{ binding: "{={foo: 'bar'}}", result: {foo: "bar"} },
		{ binding: "{={a: 'a', \"b\": \"b\"}}", result: {a: "a", b: "b"} }
	].forEach(function(oFixture) {
		QUnit.test("Object literal " + oFixture.binding, function (assert) {
			var oBindingInfo = ExpressionParser.parse(undefined /*fnResolver*/,
					oFixture.binding, 2);
			assert.deepEqual(oBindingInfo.constant, oFixture.result);
		});
	});

	//*********************************************************************************************
	QUnit.test("Object literal: Repeated evaluation", function (assert) {
		var oBindingInfo = BindingParser.complexParser("{={t: ${/t}, 'f': ${/f}}}");

		assert.deepEqual(oBindingInfo.formatter(true, false), {t: true, f: false});
		assert.deepEqual(oBindingInfo.formatter(false, true), {t: false, f: true});
	});

	//*********************************************************************************************
	checkFixtures("odata fillUriTemplate", [{
		expression: "{=odata.fillUriTemplate('http://foo.com/{p1,p2}', {'p1': 'v1', 'p2': 'v2'})}",
		result: "http://foo.com/v1,v2"
	}]);

	//*********************************************************************************************
	checkFixtures("Multiplicative operators", [
		{ expression: "${/3} * ${/five}", result: "15" },
		{ expression: "42 / 7", result: "6" },
		{ expression: "-8 % '3'", result: "-2" }
	]);

	//*********************************************************************************************
	checkFixtures("Additive operators", [
		{ expression: "${/3} + ${/five}", result: "8" },
		{ expression: "'foo' + 'bar'", result: "foobar" },
		{ expression: "42 - ${/thirteen}", result: "29" },
		{ expression: "3-2", result: "1" }
	]);

	//*********************************************************************************************
	checkFixtures("Relational operators", [
		{ expression: "3 <= 2", result: "false" },
		{ expression: "${/thirteen} <= ${/3}", result: "false" },
		{ expression: "'foo' < 'bar'", result: "false" },
		{ expression: "-1 >= -1", result: "true" },
		{ expression: "'foobar' > 'foo'", result: "true" },
		{ expression: "${/thirteen} < ${/3}", result: "false" }
	]);

	//*********************************************************************************************
	checkFixtures("Math", [
		{ expression: "Math.max(5, ${/3})", result: "5" },
		{ expression: "Math.max(5, ${/3}, '42')", result: "42" },
		{ expression: "Math.SQRT1_2 < 1", result: "true" }
	]);

	//*********************************************************************************************
	checkFixtures("encodeURIComponent", [
		{ expression: "encodeURIComponent('foo bar')", result: "foo%20bar" }
	]);

	//*********************************************************************************************
	checkFixtures("Unary +, -, typeof", [
		{ expression: "{=+true}", result: "1" },
		{ expression: "{=--42}", result: "42" },
		{ expression: "{=typeof 42}", result: "number" }
	]);

	//*********************************************************************************************
	checkFixtures("RegExp", [
		{ expression: "{=RegExp('foo','i').test('FooBar')}", result: "true" }
	]);

	//*********************************************************************************************
	QUnit.test("Embedded bindings with formatter", function (assert) {
		var oScope = {
			myFormatter: function (vValue) {
				return "~" + String(vValue) + "~";
			}
		};

		//two embedded bindings: ManagedObject._bindProperty uses CompositeBinding by default then
		check(assert, "${/mail} + ${path:'/tel', formatter:'.myFormatter'}", "mail~tel~", oScope);
		//one embedded binding only: need to set flag
		check(assert, "${path:'/mail', formatter:'.myFormatter'}", "~mail~", oScope);
	});

	//*********************************************************************************************
	checkFixtures("Property and array access", [
		{ expression: "'foo@bar'.split('@')[0]", result: "foo" },
		{ expression: "'foo@bar'.split('@')[${/3} - 2]", result: "bar" },
		{ expression: "'foo@bar'.split('@')[6]", result: "undefined" },
		{ expression: "${/}['mail']", result: "mail" }
	]);

	//*********************************************************************************************
	checkFixtures("Array literal", [
		{ expression: "[].length", result: "0" },
		{ expression: "['foo', 'bar']", result: "foo,bar" },
		{ expression: "[,'foo',, 'bar'][2]", result: "undefined" },
		{ expression: "[42][0]", result: "42" },
		{ expression: "[42 + ${/3}]", result: "45" }
	]);

	//*********************************************************************************************
	checkFixtures("in", [
		{ expression: "'PI' in Math", result: "true" },
		{ expression: "'foo' in {}", result: "false" }
	]);

	//*********************************************************************************************
	QUnit.test("Warning for undefined global identifier", function (assert) {
		var oLogMock = this.mock(jQuery.sap.log);

		oLogMock.expects("warning").withExactArgs(
			"Unsupported global identifier 'foo' in expression parser input '{=42 === foo}'",
			undefined, "sap.ui.base.ExpressionParser");

		check(assert, "{=42 === foo}", "false");

		oLogMock.expects("warning").withExactArgs(
			"Unsupported global identifier 'typeof42' in expression parser input '{=typeof42}'",
			undefined, "sap.ui.base.ExpressionParser");

		check(assert, "{=typeof42}", "undefined"); // typeof is no fix length token
	});

	//*********************************************************************************************
	checkFixtures("Global identifiers", [
		{expression: "{=${/foo} === undefined}", result: "true"},
		{expression: "{=isNaN(NaN)}", result: "true"},
		{expression: "{=NaN !== NaN}", result: "true"},
		{expression: "{=-1/0 === -Infinity}", result: "true"},
		{expression: "{=isFinite(-Infinity)}", result: "false"},
		{expression: "{=parseFloat('3.14')}", result: "3.14"},
		{expression: "{=typeof parseFloat('3.14')}", result: "number"},
		{expression: "{=parseInt('3.14')}", result: "3"},
		{expression: "{=typeof parseInt('3.14')}", result: "number"},
		{expression: "{=Object.keys({'a':'b'})[0]}", result: "a"},
		{expression: "{=Boolean(0)}", result: "false"},
		{expression: "{=Boolean(1)}", result: "true"},
		{expression: "{=isFinite(Number.POSITIVE_INFINITY)}", result: "false"},
		{expression: "{=Date.UTC(1970, 0, 1)}", result: "0"},
		{expression: "{=String.fromCharCode(32)}", result: " "},
		{expression: "{=Array.isArray([])}", result: "true"},
		{expression: "{=Array.isArray({})}", result: "false"},
		{expression: "{=JSON.stringify({a:1})}", result: '{"a":1}'}
	], function (oSandbox) {
		oSandbox.mock(jQuery.sap.log).expects("warning").never();
	});

	//*********************************************************************************************
	QUnit.test("odata.compare", function (assert) {
		this.mock(jQuery.sap).expects("require").withExactArgs("sap.ui.model.odata.ODataUtils");
		this.mock(ODataUtils).expects("compare")
			.withExactArgs(2, 3).returns("-1");

		check(assert, "{=odata.compare(2,3)}", "-1");
	});

	//*********************************************************************************************
	QUnit.test("odata.uriEncode", function (assert) {
		this.mock(jQuery.sap).expects("require").withExactArgs("sap.ui.model.odata.ODataUtils");
		this.mock(ODataUtils).expects("formatValue")
			.withExactArgs("foo", "Edm.String").returns("'foo'");

		check(assert, "{=odata.uriEncode('foo', 'Edm.String')}", "'foo'");
	});

	//*********************************************************************************************
	QUnit.test("errors during evaluation", function (assert) {
		var sExpression = "{:= null.toString() }";

		// w/o try/catch, a formatter's exception is thrown out of the control's c'tor...
		// --> expression binding provides the comfort of an "automatic try/catch"
		assert.throws(function () {
			var unused = new Icon({
					color : {
						path : '/',
						formatter : function () { return null.toString(); }
					},
					models : new JSONModel()
				});
			unused = !unused;
		});

		// Note: no need to log the stacktrace, it does not really matter to most people here
		// Note: the exact error message is browser-dependent
		this.mock(jQuery.sap.log).expects("warning").withExactArgs(
			sinon.match(/TypeError:.*null/),
			sExpression,
			"sap.ui.base.ExpressionParser");

		//TODO drop String() once BindingParser can properly handle constant result values
		check(assert, sExpression, String(undefined));
	});

	//*********************************************************************************************
	QUnit.test("Internal incident 1570800230", function (assert) {
		var oIcon,
			oModel = new JSONModel({/*IsActiveEntity : undefined*/});

		oIcon = new Icon({
			decorative : "{= !${/IsActiveEntity} }",
			models : oModel
		});
		assert.strictEqual(oIcon.getDecorative(), true);

		oIcon = new Icon({
			decorative : "{= !!${/IsActiveEntity} }",
			models : oModel
		});
		assert.strictEqual(oIcon.getDecorative(), false);

		oIcon = new Icon({
			decorative : "{= ${/IsActiveEntity} }",
			models : oModel
		});
		assert.strictEqual(oIcon.getDecorative(), true, "default value used!");
		assert.strictEqual(oIcon.validateProperty("decorative", undefined), true,
			"default value used!");
	});

	//*********************************************************************************************
	QUnit.test("multiple references to the same binding", function (assert) {
		var oScope = {
				myFormatter: function (vValue) {
					return "~" + String(vValue) + "~";
				}
			};

		function checkParts(sExpression, sExpectedResult, iExpectedParts) {
			var sBinding = "{=" + sExpression + "}",
				oBindingInfo = BindingParser.complexParser(sBinding, oScope, true);
			assert.strictEqual(oBindingInfo.parts.length, iExpectedParts, sExpression);
			check(assert, sBinding, sExpectedResult, oScope);
		}

		this.mock(jQuery.sap.log).expects("warning").never();

		checkParts("${/five} ? ${/five} : '7'", "5", 1);
		checkParts("${/five} ? ${path: '/five', type: 'sap.ui.model.type.String'} : '7'", "5", 2);
		checkParts("${path: '/five', type: 'sap.ui.model.type.String'} ? "
				+ "${path: '/five', type: 'sap.ui.model.type.String'} : '7'", "5", 1);
		checkParts("${/five} ? ${path: '/five', formatter: '.myFormatter'} : '7'", "~5~", 2);
		checkParts("${path: '/five', formatter: '.myFormatter'} ? "
				+ "${path: '/five', formatter: '.myFormatter'} : '7'", "~5~", 1);

		// if we do not ensure that both ${mail} become the same part, evaluation is performed on
		// partly resolved parts when calling oIcon.bindObject() after oIcon.bindProperty() in
		// check(). Then the first ${mail} is already resolved (-> truthy) while the second still
		// is null, the expression runs into an exception (" Cannot read property 'indexOf' of
		// null") and raises a warning.
		check(assert, "${mail} && ${mail}.indexOf('mail')", "0");
	});
});
