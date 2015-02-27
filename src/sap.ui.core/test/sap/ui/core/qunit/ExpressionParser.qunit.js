/*!
 * ${copyright}
 */
(function () {
	"use strict";

	jQuery.sap.require("sap.ui.base.ExpressionParser");

	/**
	 * Checks the string result of an expression binding when bound to a control property of type
	 * string.
	 *
	 * @param {string} sExpression - the expression or the expression binding in {=... syntax
	 * @param {string} sResult - the expected result as string
	 * @param {object} [oScope] - the object to resolve formatter functions in the control
	 */
	function check(sExpression, sResult, oScope) {
		var oIcon = new sap.ui.core.Icon({
				color: sExpression.indexOf("{=") === 0 ? sExpression : "{=" + sExpression + "}"
			}, oScope);

		oIcon.setModel(new sap.ui.model.json.JSONModel(
			{mail: "mail", tel: "tel", tel2: "tel", 3: 3, five: 5, thirteen: 13}
		));
		strictEqual(oIcon.getColor(), sResult);
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
		jQuery.each(aFixtures, function (iUnused, oFixture) {
			test(sTitle + " : " + oFixture.expression + " --> " + oFixture.result, function () {
				if (fnInit) {
					fnInit(this); //call initializer with sandbox
				}
				check(oFixture.expression, oFixture.result);
			});
		});
	}

	/**
	 * @param {function} fnCodeUnderTest
	 * @param {string} sMessage
	 * @param {string} sDetails
	 * @param {number} iAt
	 */
	function checkError(fnCodeUnderTest, sMessage, sDetails, iAt) {
		sinon.test(function () {
			var oLogMock = this.mock(jQuery.sap.log);

			//log mock is restored and verified when closing the sinon.test sandbox
			oLogMock.expects("error").once().withExactArgs(
				sMessage + (iAt !== undefined ? " at position " + iAt : ""),
				sDetails,
				"sap.ui.base.ExpressionParser"
			);
			try {
				fnCodeUnderTest();
				ok(false, "code under test throws");
			}
			catch (e) {
				ok(e instanceof SyntaxError, "Error type: " + e);
				strictEqual(e.message, sMessage, "Error.message");
				strictEqual(e.at, iAt, "Error.at");
				if (iAt) {
					strictEqual(e.text, sDetails, "Error.at");
				}
			}
		}).apply({}); // give Sinon a "this" to enrich
	}

	//*********************************************************************************************
	module("sap.ui.base.ExpressionParser");

	//*********************************************************************************************
	jQuery.each([
			{ binding: "{='foo'}", literal: 'foo' },
			{ binding: '{="foo"}', literal: 'foo' },
			{ binding: "{= 'foo bar' }", literal: 'foo bar' }
		], function(iUnused, oFixture) {
		test("Valid String literal " + oFixture.binding, function () {
			var oExpression;

			oExpression = sap.ui.base.ExpressionParser.parse(
				function () { ok(false, "unexpected call to fnResolveBinding"); },
				oFixture.binding,
				2);
			strictEqual(oExpression.result, undefined, "no formatter for constant expression");
			strictEqual(oExpression.constant, oFixture.literal);
			strictEqual(oExpression.at, oFixture.binding.indexOf("}"));
		});
	});

	//*********************************************************************************************
	jQuery.each([
			{ binding: "{=${target>sap:semantics}}" },
			{ binding: "{=${ b}   }" },
			{ binding: "{=     ${ b} }" }
		], function(iUnused, oFixture) {
		test("Valid embedded binding " + oFixture.binding, function () {
			var oBinding = {
					result: {/*bindingInfo*/},
					at: oFixture.binding.indexOf("}") + 1
				},
				oExpression;

			function resolveBinding(sInput, iStart) {
				strictEqual(sInput, oFixture.binding);
				strictEqual(iStart, oFixture.binding.indexOf("{", 1));
				return oBinding;
			};

			oExpression = sap.ui.base.ExpressionParser.parse(
				resolveBinding,
				oFixture.binding,
				2);
			strictEqual(oExpression.result.formatter("tel"), "tel");
			deepEqual(oExpression.result.parts, [oBinding.result], "parts array holds binding(s)");
			strictEqual(oExpression.at, oFixture.binding.lastIndexOf("}"));
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
	jQuery.each([
			//parser error
			{binding: "{='foo' 'bar'}", message: "Unexpected CONSTANT: 'bar'", at: 9},
			{binding: "{=$invalid}}", message: "Expected '{' instead of 'i'", at: 4},
			{binding: "{='foo' ${bar}}", message: "Unexpected BINDING: ${bar}", at: 9}
		], function(iUnused, oFixture) {
		test("Invalid binding: " + oFixture.binding, function () {
			checkError(function () {
				// call ExpressionParser through BindingParser to gain resolution of bindings
				sap.ui.base.BindingParser.complexParser(oFixture.binding);
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
				result: "http://foo/mail,tel" },
		],
		function (oSandbox) {
			var mGlobals = {
					odata: {
						fillUriTemplate: function(sTemplate, mParameters) {
							if (!sTemplate) {
								return "TODO";
							}
							if (!mParameters) {
								return sTemplate;
							}
							if (typeof mParameters === "string") {
								return sTemplate + mParameters;
							}
							jQuery.map(mParameters, function(sValue, sKey) {
								sTemplate = sTemplate.replace("{" + sKey + "}", sValue);
							});
							return sTemplate;
						},
						foo: "bar"
					},
					encodeURIComponent: encodeURIComponent
				},
				fnOriginalParse = sap.ui.base.ExpressionParser.parse;

			//use test globals in expression parser
			oSandbox.stub(sap.ui.base.ExpressionParser, "parse",
				function(fnResolveBinding, sInput, iStart) {
					return fnOriginalParse.call(null, fnResolveBinding, sInput, iStart, mGlobals);
				}
			);
		}
	);

	//*********************************************************************************************
	jQuery.each([
			{ binding: "{=odata.fillUriTemplate(.}", message: "Unexpected .", token: "." },
			{ binding: "{=odata.fillUriTemplate('foo', )}", message: "Unexpected )", token: ")" },
			{ binding: "{={foo: 'bar', }}", message: "Expected IDENTIFIER but instead saw }",
				at: 16 },
			{ binding: "{={foo: 'bar',",
				message: "Expected IDENTIFIER but instead saw end of input" },
			{ binding: "{={true: 'bar'}}", message: "Expected IDENTIFIER but instead saw true",
				token: "true" },
			{ binding: "{=odata foo}", message: "Unexpected IDENTIFIER: foo", token: "foo" },
			{ binding: "{=odata.fillUriTemplate )}", message: "Unexpected )", token: ")" },
			{ binding: "{=, 'foo'}", message: "Unexpected ,", token: "," },
			{ binding: "{='foo' , 'bar'}", message: "Unexpected ,", token: "," },
			{ binding: "{='foo' ! 'bar'}", message: "Unexpected !", token: "!" },
			{ binding: "{='foo' typeof 'bar'}", message: "Unexpected typeof", token: "typeof" },
			{ binding: "{=odata.}", message: "Expected IDENTIFIER but instead saw }", token: "}" },
			{ binding: "{=odata.", message: "Expected IDENTIFIER but instead saw end of input"},
			{ binding: "{=true ||", message: "Expected expression but instead saw end of input"},
			{ binding: "{=odata.'foo'}", message: "Expected IDENTIFIER but instead saw 'foo'",
				token: "'foo'"},
			{ binding: "{=(1 2)}", message: "Expected ) but instead saw 2", token: "2"}
		], function(iUnused, oFixture) {
		test("Error handling " + oFixture.binding + " --> " + oFixture.message, function () {
			checkError(function () {
					sap.ui.base.BindingParser.complexParser(oFixture.binding);
				},
				oFixture.message,
				oFixture.binding,
				oFixture.at || (oFixture.token
					? oFixture.binding.lastIndexOf(oFixture.token) + 1 : undefined));
		});
	});

	//*********************************************************************************************
	jQuery.each([
			{ binding: "{={}}", result: {} },
			{ binding: "{={'foo': 'bar'}}", result: {foo: "bar"} },
			{ binding: "{={foo: 'bar'}}", result: {foo: "bar"} },
			{ binding: "{={a: 'a', \"b\": \"b\"}}", result: {a: "a", b: "b"} }
		], function(iUnused, oFixture) {
		test("Object literal " + oFixture.binding, function () {
			var oBindingInfo = sap.ui.base.ExpressionParser.parse(undefined /*fnResolver*/,
					oFixture.binding, 2);
			deepEqual(oBindingInfo.constant, oFixture.result);
		});
	});

	//*********************************************************************************************
	test("Object literal: Repeated evaluation", function () {
		var oBindingInfo = sap.ui.base.BindingParser.complexParser("{={t: ${/t}, 'f': ${/f}}}");

		deepEqual(oBindingInfo.formatter(true, false), {t: true, f: false});
		deepEqual(oBindingInfo.formatter(false, true), {t: false, f: true});
	});

	//*********************************************************************************************
	checkFixtures("odata functions", [{
		expression: "{=odata.fillUriTemplate('http://foo.com/{p1,p2}', {'p1': 'v1', 'p2': 'v2'})}",
		result: "http://foo.com/v1,v2"
	}, {
		expression: "{=odata.uriEncode('foo', 'Edm.String')}",
		result: "'foo'"
	}]);

	//*********************************************************************************************
	checkFixtures("Multiplicative operators", [
		{ expression: "${/3} * ${/five}", result: "15" },
		{ expression: "42 / 7", result: "6" },
		{ expression: "-8 % '3'", result: "-2" },
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
		{ expression: "{=typeof 42}", result: "number" },
		{ expression: "{=typeof42}", result: "undefined" } // typeof is no fix length token
	]);

	//*********************************************************************************************
	checkFixtures("RegExp", [
		{ expression: "{=RegExp('foo','i').test('FooBar')}", result: "true" }
	]);

	//*********************************************************************************************
	test("Embedded bindings with formatter", function () {
		var oScope = {
			myFormatter: function (vValue) {
				return "~" + String(vValue) + "~";
			}
		};

		//two embedded bindings: ManagedObject._bindProperty uses CompositeBinding by default then
		check("${/mail} + ${path:'/tel', formatter:'.myFormatter'}", "mail~tel~", oScope);
		//one embedded binding only: need to set flag
		check("${path:'/mail', formatter:'.myFormatter'}", "~mail~", oScope);
	});
} ());
