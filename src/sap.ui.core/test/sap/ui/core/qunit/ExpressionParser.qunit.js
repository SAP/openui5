/*!
 * ${copyright}
 */
(function () {
	"use strict";

	jQuery.sap.require("sap.ui.base.ExpressionParser");

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
			strictEqual(typeof oExpression.result.formatter, "function", "formatter is function");
			strictEqual(oExpression.result.formatter(), oFixture.literal);
			deepEqual(oExpression.result.parts, [], "parts array is empty");
			strictEqual(oExpression.at, oFixture.binding.indexOf("}"));
		});
	});

	//*********************************************************************************************
	jQuery.each([
			{ binding: "{={target>sap:semantics}}" },
			{ binding: "{={ b}   }" },
			{ binding: "{=     { b} }" }
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
	jQuery.each([
			{ binding: "{={binding0} === 'tel'}", args: ["tel"], result: true },
			{ binding: "{={binding0} === 'mail'}", args: ["tel"], result: false },
			{ binding: "{='tel' === {binding0}}", args: ["tel"], result: true },
			{ binding: "{={binding0} === {binding1}}",
				args: ["Felix", "Felix"], result: true },
			{ binding: "{={binding0} === {binding1}}",
				args: ["Kurt", "Felix"], result: false }
		], function(iUnused, oFixture) {
		test("Operator === with result " + oFixture.result + ": " + oFixture.binding, function () {
			var iPartsLength = 0,
				i,
				oExpression;

			function resolveBinding(sInput, iStart) {
				strictEqual(sInput, oFixture.binding, "binding String");
				strictEqual(sInput.charAt(iStart), "{", "iStart on {");
				iPartsLength += 1;
				return {
					//mock binding result to check proper sequence of parts
					result: "binding" + (iPartsLength - 1),
					at: oFixture.binding.indexOf("}", iStart) + 1
				};
			};

			oExpression = sap.ui.base.ExpressionParser.parse(
				resolveBinding,
				oFixture.binding,
				2 /*start after {=*/);
			strictEqual(oExpression.result.formatter.apply(null, oFixture.args), oFixture.result,
				"formatter result is " + oFixture.result);
			strictEqual(oExpression.result.parts.length, iPartsLength, "parts length");
			for (i = 0; i < iPartsLength; i += 1) {
				strictEqual(oExpression.result.parts[i], "binding" + i, "part " + i);
			}
			strictEqual(oExpression.at, oFixture.binding.lastIndexOf("}"), "at");
		});
	});

	//*********************************************************************************************
	jQuery.each([
			{binding: "'foo'"},
			{binding: "'foo' "} //with trailing whitespace
		], function(iUnused, oFixture) {
		test("Valid expression in complete string (no start index for parse)", function () {
			var oExpression;

			oExpression = sap.ui.base.ExpressionParser.parse(
				function () { ok(false, "unexpected call to fnResolveBinding"); },
				oFixture.binding);
			strictEqual(oExpression.result.formatter(), 'foo');
			deepEqual(oExpression.result.parts, [], "parts array is empty");
			strictEqual(oExpression.at, oFixture.binding.length);
		});
	});

	//*********************************************************************************************
	jQuery.each([
			{expression: "'foo'  invalid", message: "Invalid token in expression", at: 7},
			//tokenizer error
			{expression: "'foo' ==! 'bar'", message: "Expected '=' instead of '!'", at: 9},
			//parser error
			{expression: "'foo' 'bar'", message: "Invalid expression" /*TODO , at: 7 */}
		], function(iUnused, oFixture) {
		test("Invalid expression: " + oFixture.expression, sinon.test(function () {
			var oError;

			this.stub(jQuery.sap.log, "error");
			try {
				sap.ui.base.ExpressionParser.parse(
					function () { ok(false, "unexpected call to fnResolveBinding"); },
					oFixture.expression);
			}
			catch (e) {
				strictEqual(jQuery.sap.log.error.args[0][0],
					oFixture.message + (oFixture.at ? " at " + oFixture.at : ""),
					"console error message");
				strictEqual(jQuery.sap.log.error.args[0][1], oFixture.expression,
					"console error details");
				strictEqual(jQuery.sap.log.error.args[0][2], "sap.ui.base.ExpressionParser",
						"console error component");
				oError = e;
				ok(e instanceof SyntaxError, "Error type");
				strictEqual(e.message, oFixture.message, "Error.message");
				strictEqual(e.at, oFixture.at, "Error.at");
				strictEqual(e.text, oFixture.expression, "Error.at");
			}
			ok(oError, "error is thrown on invalid expression");
		}));
	});
} ());
