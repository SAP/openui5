/*!
 * ${copyright}
 */
sap.ui.define(["jquery.sap.global", "sap/ui/base/ManagedObject", "sap/ui/mdc/condition/Condition"],
	function(jQuery, ManagedObject, Condition) {
		"use strict";

		/**
		 * Constructs a class to parse condition values and create token elements inside a MultiInput field
		 *
		 * @constructor
		 * @experimental This module is only for internal/experimental use!
		 * @private
		 * @author Peter Harbusch
		 */
		var BoolExprTool = function(sDefaultOperation) {};

		BoolExprTool.booleanExprParser = function(parseText, oConditionModel) {
			// inspired by https://unnikked.ga/how-to-build-a-boolean-expression-evaluator-518e9e068a65
			// <expression>::= <term>{<or><term>}
			// <term>::= <factor>{<and><factor>}
			// <factor>::=<complexvalue>|<not><factor>|(<expression>)
			// <complexvalue>::= <fieldPath>:=<conditionvalue> | <conditionvalue>
			// <fieldPath>  ::= A-Z*
			// <conditionvalue>::= =v | v* | *v | *v* | <v | <=v | >v | >=v | !=v | v...v

			var aWhiteSpaces = [" ", "\r", "\n", "\t"];
			var aComment = [
				["//", "\n"],
				["/*", "*/"]
			];
			var aDelimiters = [" ", "(", ")", "!", ":", "*", "...", "/", "\r", "\n", "\t"];
			var aKeyWords = ["AND", "OR", "(", ")", "<EMPTY>", "<NOTEMPTY>", "!=", "!", ":=", "==", "=", "*", ">=", ">", "<=", "<", "..."];

			var sOrgText = parseText;
			var sText = parseText;
			var pos = 0;
			var sy = "";
			var cm = oConditionModel;

			var nextSymbol = function() {
				if (sy === "EOF" && sText === "") {
					throwError("EOF reached!", pos);
				}

				var handleWhitespaces = function() {
					while (aWhiteSpaces.indexOf(sText[0]) > -1) {
						sText = sText.slice(1);
						pos++;
					}
				};
				var handleComment = function(aComment) {
					sText = sText.slice(aComment[0].length);
					pos += aComment[0].length;

					var l = aComment[1].length;
					while (sText.slice(0, l) !== aComment[1] && sText !== "") {
						sText = sText.slice(1);
						pos++;
					}
					sText = sText.slice(l);
					pos += l;
				};

				var startswithDelimiter = function(s) {
					var i = 0;
					while (i < aDelimiters.length) {
						var l = aDelimiters[i].length;
						if (s.slice(0, l) === aDelimiters[i]) {
							return true;
						}
						i++;
					}
					return false;
				};

				handleWhitespaces();

				while (sText.slice(0, 2) === aComment[0][0] || sText.slice(0, 2) === aComment[1][0]) {
					if (sText.slice(0, 2) === aComment[0][0]) {
						handleComment(["//", "\n"]);
					}
					if (sText.slice(0, 2) === aComment[1][0]) {
						handleComment(["/*", "*/"]);
					}
					handleWhitespaces();
				}

				var sUpper = sText.toUpperCase();
				var i = 0;
				while (i < aKeyWords.length) {
					var l = aKeyWords[i].length;
					if (sUpper.slice(0, l) === aKeyWords[i]) {
						var sResult = aKeyWords[i];
						sText = sText.slice(l);
						pos += l;
						// return "<" + sResult + ">";
						return { "keyword": sResult, "id": i, "pos": pos - sResult.length };
					}
					i++;
				}

				// read next token
				var startPos;
				var c = "";
				if ("\"'".indexOf(sText[0]) > -1) { // if it starts with " or ' read until next " or '
					var quote = sText[0];
					sText = sText.slice(1);
					pos++;
					startPos = pos;
					while (sText !== "" && sText[0] !== quote) {
						c += sText[0];
						sText = sText.slice(1);
						pos++;
					}
					sText = sText.slice(1);
					pos++;
				} else {
					startPos = pos;
					while (sText !== "" && !startswithDelimiter(sText)) {
						c += sText[0];
						sText = sText.slice(1);
						pos++;
					}
				}

				if (c === "") { return "EOF"; }

				// return c;
				return { "token": c, "pos": startPos };
			};

			var inSymbol = function() {
				sy = nextSymbol();

				if (typeof sy === "string") {
					return;
				}

				if (sy.token) {
					sy = sy.token;
				}
				if (sy.keyword) {
					sy = sy.keyword;
				}
			};

			var checkSymbol = function(_sy) {
				if (sy == _sy) {
					if (sy !== "EOF") {
						inSymbol();
					}
				} else {
					throwError("error: '" + _sy + "' expected!", pos, _sy);
				}
			};

			var throwError = function(message, index, lastSym) {
				index -= lastSym ? lastSym.length : 0;
				var sErrorPos = sOrgText.slice(0, index) + ">>><<<" + sOrgText.slice(index);
				var error = new Error(message + ' at character ' + index + " in '" + sErrorPos + "'");
				error.index = index;
				error.description = message;
				error.sParseText = sOrgText;
				throw error;
			};

			var parse = function() {
				inSymbol();
				var ast = expression();
				checkSymbol("EOF");
				return ast;
			};

			// <expression>::= <term>{<or><term>}
			var expression = function() {
				var astLeft = term();
				while (sy === "OR") {
					checkSymbol("OR");
					var astRight = term();
					astLeft = { "type": "expr", "operator": "OR", "left": astLeft, "right": astRight };
				}
				return astLeft;
			};

			// <term>::= <factor>{<and><factor>}
			var term = function() {
				var astLeft = factor();
				while (sy === "AND") {
					checkSymbol("AND");
					var astRight = factor();
					astLeft = { "type": "expr", "operator": "AND", "left": astLeft, "right": astRight };
				}
				return astLeft;
			};

			// <factor>::= <complexvalue>|<not><factor>|(<expression>)
			var factor = function() {
				switch (sy) {
					case "!":
						checkSymbol("!");
						var astRight = factor();
						return { "type": "expr", "operator": "NOT", "right": astRight };

					case "(":
						checkSymbol("(");
						var astRight = expression();
						checkSymbol(")");
						return { "type": "expr", "operator": "()", "right": astRight };

					default:
						return complexvalue();
				}
			};

			// <complexvalue>::= <fieldPath>:=<v> | <v>
			var complexvalue = function() {
				var sfieldPath, sValue;
				sValue = conditionvalue();
				switch (sy) {
					case ":=":
						sfieldPath = sValue;
						// if (cm && !cm.getFilterField(sfieldPath)) {
						// 	throwError("unkown fieldPath '" + sfieldPath + "' found!", pos, sy);
						// }

						checkSymbol(":=");
						sValue = conditionvalue();
						break;

					default:
						break;
				}

				// Try to convert the value into the correct type
				if (cm) { //} && cm.getFilterField(sfieldPath)) {
					// var oType = cm.getFilterField(sfieldPath)._getFormatOptions().valueType;
					try {
						sValue.values[0] = sValue.values[0]; //oType.parseValue(sValue.values[0], "string");
						if (sValue.values.length > 1) {
							sValue.values[1] = sValue.values[1]; //oType.parseValue(sValue.values[1], "string");
						}
					} catch (error) {
						throwError("value type parse exception : " + error.message, pos, sy);
					}
				}

				return sfieldPath ? { "type": "complexvalue", "fieldPath": sfieldPath, "value": sValue } : sValue;
			};

			var conditionvalue = function() {
				var v;
				switch (sy) {
					case "*":
						checkSymbol("*");
						v = conditionvalue();
						if (v.type === "value" && v.operator === "StartsWith") {
							return { "type": "value", "operator": "Contains", "values": [v.values[0]] };
						}
						return { "type": "value", "operator": "EndsWith", "values": [v] };

					case ">":
						checkSymbol(">");
						v = conditionvalue();
						return { "type": "value", "operator": "GT", "values": [v] };

					case ">=":
						checkSymbol(">=");
						v = conditionvalue();
						return { "type": "value", "operator": "GE", "values": [v] };

					case "<":
						checkSymbol("<");
						v = conditionvalue();
						return { "type": "value", "operator": "LT", "values": [v] };

					case "<=":
						checkSymbol("<=");
						v = conditionvalue();
						return { "type": "value", "operator": "LE", "values": [v] };

					case "=":
						checkSymbol("=");
						v = conditionvalue();
						return { "type": "value", "operator": "EQ", "values": [v] };

					case "!=":
						checkSymbol("!=");
						v = conditionvalue();
						return { "type": "value", "operator": "NE", "values": [v] };

					case "<EMPTY>":
						checkSymbol("<EMPTY>");
						return { "type": "value", "operator": "Empty", "values": [] };

					case "<NOTEMPTY>":
						checkSymbol("<NOTEMPTY>");
						return { "type": "value", "operator": "NotEmpty", "values": [] };

					default:
						v = sy;
						inSymbol();
						switch (sy) {
							case "*":
								checkSymbol("*");
								return { "type": "value", "operator": "StartsWith", "values": [v] };
							case "...":
								checkSymbol("...");
								return { "type": "value", "operator": "BT", "values": [v, conditionvalue()] };
						}
						return v;
				}
			};

			if (sText === "") { return null; }
			return parse();
		};

		BoolExprTool.booleanExprFormatter = function(ast, oConditionModel) {
			// window.console.log(JSON.stringify(ast));

			//var oType;
			//var cm = oConditionModel;

			var format = function(ast) {
				if (typeof ast === "string") {
					// if (oType.getName() === "Date") {
						// return "'" + oType.formatValue(new Date(ast), "string") + "'";
					// }
					return ast;
				}
				switch (ast.type) {
					case "expr":
						// oType = null;
						switch (ast.operator) {
							case "OR":
								return format(ast.left) + " OR " + format(ast.right);
							case "AND":
								return format(ast.left) + " AND " + format(ast.right);
							case "NOT":
								return "!" + format(ast.right);
							case "()":
								return "(" + format(ast.right) + ")";
							default:
								break;
						}
						break;
					case "complexvalue":
						if (ast.fieldPath) {
							// oType = cm ? cm.getFilterField(ast.fieldPath)._getFormatOptions().valueType : null;

							return ast.fieldPath + ":= " + format(ast.value);
						}
						break;
					case "value":
						switch (ast.operator) {
							case "EQ":
								return "=" + format(ast.values[0]);
							case "NE":
								return "!=" + format(ast.values[0]);
							case "GT":
								return ">" + format(ast.values[0]);
							case "GE":
								return ">=" + format(ast.values[0]);
							case "LT":
								return "<" + format(ast.values[0]);
							case "LE":
								return "<=" + format(ast.values[0]);
							case "StartsWith":
								return format(ast.values[0]) + "*";
							case "EndsWith":
								return "*" + format(ast.values[0]);
							case "Contains":
								return "*" + format(ast.values[0]) + "*";
							case "Empty":
								return "<EMPTY>";
							case "NotEmpty":
								return "<NOTEMPTY>";
							case "BT":
								return format(ast.values[0]) + "..." + format(ast.values[1]);
							default:
								break;
						}
						break;

					default:
				}
				return ast;
				// return oType ? oType.formatValue(ast, "string") : ast;
			};

			if (!ast || ast === undefined) { return ""; }
			return format(ast);
		};

		BoolExprTool.ASTtoCM = function(ast, oConditionModel) {

			var loop = function(ast, cnd) {
				if (typeof ast === "string") {
					return ast;
				}
				switch (ast.type) {
					case "expr":
						switch (ast.operator) {
							case "OR":
								loop(ast.left);
								loop(ast.right);
								break;
							case "AND":
								loop(ast.left);
								loop(ast.right);
								break;
							case "NOT":
								loop(ast.right);
								break;
							case "()":
								loop(ast.right);
								break;
							default:
								break;
						}
						break;
					case "complexvalue":
						if (ast.fieldPath) {
							var cnd = {};
							cnd.fieldPath = ast.fieldPath;
							loop(ast.value, cnd);
						}
						break;
					case "value":
						if (!cnd) {
							cnd = { fieldPath: "" };
						}
						switch (ast.operator) {
							case "EQ":
							case "NE":
							case "GT":
							case "GE":
							case "LT":
							case "LE":
							case "StartsWith":
							case "EndsWith":
							case "Contains":
								cnd.operator = ast.operator;
								cnd.values = [ast.values[0]];
								break;
							case "BT":
								cnd.operator = ast.operator;
								cnd.values = [ast.values[0], ast.values[1]];
								break;
							case "Empty":
							case "NotEmpty":
								cnd.operator = ast.operator;
								cnd.values = [];
								break;
							default:
								break;
						}
						oConditionModel.addCondition(cnd.fieldPath, Condition.createCondition(cnd.operator, cnd.values));
						break;

					default:
				}
			};

			if (!ast || ast === undefined) { return; }
			return loop(ast);
		};

		BoolExprTool.prettyPrintCM = function(oConditionModel) {
			var sExpr = "";
			var cm = oConditionModel;
			var oConditions = cm.getAllConditions();
			for (var fieldPath in oConditions) {

				// var oFF = cm.getFilterField(fieldPath);
				//var oType = oFF._getFormatOptions().valueType;
				//ff.getFilterOperatorConfig()

				var aConditions = oConditions[fieldPath];
				if (sExpr != "" && aConditions.length > 0) { sExpr += " AND "; }
				if (aConditions.length > 1) { sExpr += "("; }
				for (var index = 0; index < aConditions.length; index++) { //function(oCondition, index) {
					var oCondition = aConditions[index];
					if (index >= 1) { sExpr += " OR "; }
					sExpr += fieldPath + ":= ";
					var sValue1 = oCondition.values[0]; // oType.formatValue(oCondition.values[0], "string");
					if (oCondition.values[0] instanceof Date) {
						sValue1 = "'" + sValue1 + "'";
					}
					switch (oCondition.operator) {
						case "EQ":
							sExpr += "=" + sValue1;
							break;
						case "NE":
							sExpr += "!=" + sValue1;
							break;
						case "GT":
							sExpr += ">" + sValue1;
							break;
						case "GE":
							sExpr += ">=" + sValue1;
							break;
						case "LT":
							sExpr += "<" + sValue1;
							break;
						case "LE":
							sExpr += "<=" + sValue1;
							break;
						case "StartsWith":
							sExpr += sValue1 + "*";
							break;
						case "EndsWith":
							sExpr += "*" + sValue1;
							break;
						case "Contains":
							sExpr += "*" + sValue1 + "*";
							break;
						case "Empty":
							sExpr += "<EMPTY>";
							break;
						case "NotEmpty":
							sExpr += "<NOTEMPTY>";
							break;
						case "BT":
							sExpr += sValue1 + "..." + oCondition.values[1]; //oType.formatValue(oCondition.values[1], "string");
							break;
						default:
							break;
					}
				}
				if (aConditions.length > 1) { sExpr += ")"; }
			}

			return sExpr;
		};


		return BoolExprTool;
	}, true);
