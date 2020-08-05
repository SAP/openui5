(function webpackUniversalModuleDefinition(root, factory) {
	if (typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if (typeof sap.ui.define === 'function')
		sap.ui.define([], factory);
	else if (typeof exports === 'object')
		exports["ACData"] = factory();
	else
		root["ACData"] = factory();
})(window, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if (installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if (!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if (mode & 1) value = __webpack_require__(value);
/******/ 		if (mode & 8) return value;
/******/ 		if ((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if (mode & 2 && typeof value != 'string') for (var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/adaptivecards-templating.ts");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/adaptivecards-templating.ts":
/*!*****************************************!*\
  !*** ./src/adaptivecards-templating.ts ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
__export(__webpack_require__(/*! ./expression-parser */ "./src/expression-parser.ts"));
__export(__webpack_require__(/*! ./template-engine */ "./src/template-engine.ts"));


/***/ }),

/***/ "./src/expression-parser.ts":
/*!**********************************!*\
  !*** ./src/expression-parser.ts ***!
  \**********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var orderedOperators = [
    "/",
    "*",
    "-",
    "+",
    "==",
    "!=",
    "<",
    "<=",
    ">",
    ">="
];
var literals = [
    "identifier",
    "string",
    "number",
    "boolean"
];
var Tokenizer = /** @class */ (function () {
    function Tokenizer() {
    }
    Tokenizer.init = function () {
        Tokenizer.rules.push({ tokenType: undefined, regEx: /^\s/ }, { tokenType: "{", regEx: /^{/ }, { tokenType: "?#", regEx: /^\?#/ }, { tokenType: "}", regEx: /^}/ }, { tokenType: "[", regEx: /^\[/ }, { tokenType: "]", regEx: /^\]/ }, { tokenType: "(", regEx: /^\(/ }, { tokenType: ")", regEx: /^\)/ }, { tokenType: "boolean", regEx: /^true|^false/ }, { tokenType: "identifier", regEx: /^[$a-z_]+/i }, { tokenType: ".", regEx: /^\./ }, { tokenType: ",", regEx: /^,/ }, { tokenType: "+", regEx: /^\+/ }, { tokenType: "-", regEx: /^-/ }, { tokenType: "*", regEx: /^\*/ }, { tokenType: "/", regEx: /^\// }, { tokenType: "==", regEx: /^==/ }, { tokenType: "!=", regEx: /^!=/ }, { tokenType: "<=", regEx: /^<=/ }, { tokenType: "<", regEx: /^</ }, { tokenType: ">=", regEx: /^>=/ }, { tokenType: ">", regEx: /^>/ }, { tokenType: "string", regEx: /^"([^"]*)"/ }, { tokenType: "string", regEx: /^'([^']*)'/ }, { tokenType: "number", regEx: /^\d*\.?\d+/ });
    };
    Tokenizer.parse = function (expression) {
        var result = [];
        var i = 0;
        while (i < expression.length) {
            var subExpression = expression.substring(i);
            var matchFound = false;
            for (var _i = 0, _a = Tokenizer.rules; _i < _a.length; _i++) {
                var rule = _a[_i];
                var matches = rule.regEx.exec(subExpression);
                if (matches) {
                    if (matches.length > 2) {
                        throw new Error("A tokenizer rule matched more than one group.");
                    }
                    if (rule.tokenType != undefined) {
                        result.push({
                            type: rule.tokenType,
                            value: matches[matches.length == 1 ? 0 : 1],
                            originalPosition: i
                        });
                    }
                    i += matches[0].length;
                    matchFound = true;
                    break;
                }
            }
            if (!matchFound) {
                throw new Error("Unexpected character " + subExpression[0] + " at position " + i);
            }
        }
        return result;
    };
    Tokenizer.rules = [];
    return Tokenizer;
}());
Tokenizer.init();
function ensureValueType(value) {
    if (typeof value === "number" || typeof value === "string" || typeof value === "boolean") {
        return value;
    }
    throw new Error("Invalid value type: " + typeof value);
}
var EvaluationContext = /** @class */ (function () {
    function EvaluationContext() {
        this._functions = {};
        this._stateStack = [];
    }
    EvaluationContext.init = function () {
        EvaluationContext._builtInFunctions["substr"] = function (s, index, count) {
            if (typeof s === "string" && typeof index === "number" && typeof count === "number") {
                return (s.substr(index, count));
            }
            else {
                return "";
            }
        };
        EvaluationContext._builtInFunctions["JSON.parse"] = function (input) {
            return JSON.parse(input);
        };
        EvaluationContext._builtInFunctions["if"] = function (condition, ifTrue, ifFalse) {
            return condition ? ifTrue : ifFalse;
        };
        EvaluationContext._builtInFunctions["toUpper"] = function (input) {
            return typeof input === "string" ? input.toUpperCase() : input;
        };
        EvaluationContext._builtInFunctions["toLower"] = function (input) {
            return typeof input === "string" ? input.toLowerCase() : input;
        };
        EvaluationContext._builtInFunctions["Date.format"] = function (input, format) {
            var acceptedFormats = ["long", "short", "compact"];
            var inputAsNumber;
            if (typeof input === "string") {
                inputAsNumber = Date.parse(input);
            }
            else if (typeof input === "number") {
                inputAsNumber = input;
            }
            else {
                return input;
            }
            var date = new Date(inputAsNumber);
            var effectiveFormat = "compact";
            if (typeof format === "string") {
                effectiveFormat = format.toLowerCase();
                if (acceptedFormats.indexOf(effectiveFormat) < 0) {
                    effectiveFormat = "compact";
                }
            }
            return effectiveFormat === "compact" ? date.toLocaleDateString() : date.toLocaleDateString(undefined, { day: "numeric", weekday: effectiveFormat, month: effectiveFormat, year: "numeric" });
        };
        EvaluationContext._builtInFunctions["Time.format"] = function (input) {
            var inputAsNumber;
            if (typeof input === "string") {
                inputAsNumber = Date.parse(input);
            }
            else if (typeof input === "number") {
                inputAsNumber = input;
            }
            else {
                return input;
            }
            var date = new Date(inputAsNumber);
            return date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
        };
    };
    EvaluationContext.prototype.registerFunction = function (name, callback) {
        this._functions[name] = callback;
    };
    EvaluationContext.prototype.unregisterFunction = function (name) {
        delete this._functions[name];
    };
    EvaluationContext.prototype.getFunction = function (name) {
        var result = this._functions[name];
        if (result == undefined) {
            result = EvaluationContext._builtInFunctions[name];
        }
        return result;
    };
    EvaluationContext.prototype.isReservedField = function (name) {
        return EvaluationContext._reservedFields.indexOf(name) >= 0;
    };
    EvaluationContext.prototype.saveState = function () {
        this._stateStack.push({ $data: this.$data, $index: this.$index });
    };
    EvaluationContext.prototype.restoreLastState = function () {
        if (this._stateStack.length == 0) {
            throw new Error("There is no evaluation context state to restore.");
        }
        var savedContext = this._stateStack.pop();
        this.$data = savedContext.$data;
        this.$index = savedContext.$index;
    };
    Object.defineProperty(EvaluationContext.prototype, "currentDataContext", {
        get: function () {
            return this.$data != undefined ? this.$data : this.$root;
        },
        enumerable: true,
        configurable: true
    });
    EvaluationContext._reservedFields = ["$data", "$root", "$index"];
    EvaluationContext._builtInFunctions = {};
    return EvaluationContext;
}());
exports.EvaluationContext = EvaluationContext;
EvaluationContext.init();
var EvaluationNode = /** @class */ (function () {
    function EvaluationNode() {
    }
    return EvaluationNode;
}());
var ExpressionNode = /** @class */ (function (_super) {
    __extends(ExpressionNode, _super);
    function ExpressionNode() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.nodes = [];
        _this.allowNull = true;
        return _this;
    }
    ExpressionNode.prototype.evaluate = function (context) {
        var operatorPriorityGroups = [
            ["/", "*"],
            ["-", "+"],
            ["==", "!=", "<", "<=", ">", ">="]
        ];
        var nodesCopy = this.nodes;
        for (var _i = 0, operatorPriorityGroups_1 = operatorPriorityGroups; _i < operatorPriorityGroups_1.length; _i++) {
            var priorityGroup = operatorPriorityGroups_1[_i];
            var i = 0;
            while (i < nodesCopy.length) {
                var node = nodesCopy[i];
                if (node instanceof OperatorNode && priorityGroup.indexOf(node.operator) >= 0) {
                    var left = ensureValueType(nodesCopy[i - 1].evaluate(context));
                    var right = ensureValueType(nodesCopy[i + 1].evaluate(context));
                    if (typeof left !== typeof right) {
                        throw new Error("Incompatible operands " + left + " and " + right + " for operator " + node.operator);
                    }
                    var result = void 0;
                    if (typeof left === "number" && typeof right === "number") {
                        switch (node.operator) {
                            case "/":
                                result = left / right;
                                break;
                            case "*":
                                result = left * right;
                                break;
                            case "-":
                                result = left - right;
                                break;
                            case "+":
                                result = left + right;
                                break;
                        }
                    }
                    if (typeof left === "string" && typeof right === "string") {
                        switch (node.operator) {
                            case "+":
                                result = left + right;
                                break;
                        }
                    }
                    switch (node.operator) {
                        case "==":
                            result = left == right;
                            break;
                        case "!=":
                            result = left != right;
                            break;
                        case "<":
                            result = left < right;
                            break;
                        case "<=":
                            result = left <= right;
                            break;
                        case ">":
                            result = left > right;
                            break;
                        case ">=":
                            result = left >= right;
                            break;
                        default:
                        // This should never happen
                    }
                    nodesCopy.splice(i - 1, 3, new LiteralNode(result));
                    i--;
                }
                i++;
            }

        }
        return nodesCopy[0].evaluate(context);
    };
    return ExpressionNode;
}(EvaluationNode));
var IdentifierNode = /** @class */ (function (_super) {
    __extends(IdentifierNode, _super);
    function IdentifierNode() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    IdentifierNode.prototype.evaluate = function (context) {
        return this.identifier;
    };
    return IdentifierNode;
}(EvaluationNode));
var IndexerNode = /** @class */ (function (_super) {
    __extends(IndexerNode, _super);
    function IndexerNode() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    IndexerNode.prototype.evaluate = function (context) {
        return this.index.evaluate(context);
    };
    return IndexerNode;
}(EvaluationNode));
var FunctionCallNode = /** @class */ (function (_super) {
    __extends(FunctionCallNode, _super);
    function FunctionCallNode() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.functionName = null;
        _this.parameters = [];
        return _this;
    }
    FunctionCallNode.prototype.evaluate = function (context) {
        var callback = context.getFunction(this.functionName);
        if (callback != undefined) {
            var evaluatedParams = [];
            for (var _i = 0, _a = this.parameters; _i < _a.length; _i++) {
                var param = _a[_i];
                evaluatedParams.push(param.evaluate(context));
            }
            return callback.apply(void 0, evaluatedParams);
        }
        throw new Error("Undefined function: " + this.functionName);
    };
    return FunctionCallNode;
}(EvaluationNode));
var LiteralNode = /** @class */ (function (_super) {
    __extends(LiteralNode, _super);
    function LiteralNode(value) {
        var _this = _super.call(this) || this;
        _this.value = value;
        return _this;
    }
    LiteralNode.prototype.evaluate = function (context) {
        return this.value;
    };
    return LiteralNode;
}(EvaluationNode));
var OperatorNode = /** @class */ (function (_super) {
    __extends(OperatorNode, _super);
    function OperatorNode(operator) {
        var _this = _super.call(this) || this;
        _this.operator = operator;
        return _this;
    }
    OperatorNode.prototype.evaluate = function (context) {
        throw new Error("An operator cannot be evaluated on its own.");
    };
    return OperatorNode;
}(EvaluationNode));
var PathNode = /** @class */ (function (_super) {
    __extends(PathNode, _super);
    function PathNode() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.parts = [];
        return _this;
    }
    PathNode.prototype.evaluate = function (context) {
        var result = undefined;
        var index = 0;
        while (index < this.parts.length) {
            var part = this.parts[index];
            try {
                if (part instanceof IdentifierNode && index == 0) {
                    switch (part.identifier) {
                        case "$root":
                            result = context.$root;
                            break;
                        case "$data":
                            result = context.currentDataContext;
                            break;
                        case "$index":
                            result = context.$index;
                            break;
                        default:
                            result = context.currentDataContext[part.identifier];
                            break;
                    }
                }
                else {
                    var partValue = part.evaluate(context);
                    if (index == 0) {
                        result = partValue;
                    }
                    else {
                        result = typeof partValue !== "boolean" ? result[partValue] : result[partValue.toString()];
                    }
                }
            }
            catch (e) {
                return undefined;
            }
            index++;
        }
        return result;
    };
    return PathNode;
}(EvaluationNode));
var ExpressionParser = /** @class */ (function () {
    function ExpressionParser(tokens) {
        this._index = 0;
        this._tokens = tokens;
    }
    ExpressionParser.prototype.unexpectedToken = function () {
        throw new Error("Unexpected token " + this.current.value + " at position " + this.current.originalPosition + ".");
    };
    ExpressionParser.prototype.unexpectedEoe = function () {
        throw new Error("Unexpected end of expression.");
    };
    ExpressionParser.prototype.moveNext = function () {
        this._index++;
    };
    ExpressionParser.prototype.parseToken = function () {
        var expectedTokenTypes = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            expectedTokenTypes[_i] = arguments[_i];
        }
        if (this.eoe) {
            this.unexpectedEoe();
        }
        var currentToken = this.current;
        if (expectedTokenTypes.indexOf(this.current.type) < 0) {
            this.unexpectedToken();
        }
        this.moveNext();
        return currentToken;
    };
    ExpressionParser.prototype.parseOptionalToken = function () {
        var expectedTokenTypes = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            expectedTokenTypes[_i] = arguments[_i];
        }
        if (this.eoe) {
            this.unexpectedEoe();
        }
        else if (expectedTokenTypes.indexOf(this.current.type) < 0) {
            return false;
        }
        else {
            this.moveNext();
            return true;
        }
    };
    ExpressionParser.prototype.parseFunctionCall = function (functionName) {
        var result = new FunctionCallNode();
        result.functionName = functionName;
        this.parseToken("(");
        var firstParameter = this.parseExpression();
        var moreParameters = false;
        if (firstParameter) {
            result.parameters.push(firstParameter);
            do {
                moreParameters = this.parseOptionalToken(",");
                if (moreParameters) {
                    var parameter = this.parseExpression();
                    result.parameters.push(parameter);
                }
            } while (moreParameters);
        }
        this.parseToken(")");
        return result;
    };
    ExpressionParser.prototype.parseIdentifier = function () {
        var result = new IdentifierNode();
        result.identifier = this.current.value;
        this.moveNext();
        return result;
    };
    ExpressionParser.prototype.parseIndexer = function () {
        var result = new IndexerNode();
        this.parseToken("[");
        result.index = this.parseExpression();
        this.parseToken("]");
        return result;
    };
    ExpressionParser.prototype.parsePath = function () {
        var result = new PathNode();
        var expectedNextTokenTypes = ["identifier", "("];
        while (!this.eoe) {
            if (expectedNextTokenTypes.indexOf(this.current.type) < 0) {
                return result;
            }
            switch (this.current.type) {
                case "(":
                    if (result.parts.length == 0) {
                        this.moveNext();
                        result.parts.push(this.parseExpression());
                        this.parseToken(")");
                    }
                    else {
                        var functionName = "";
                        for (var _i = 0, _a = result.parts; _i < _a.length; _i++) {
                            var part = _a[_i];
                            if (!(part instanceof IdentifierNode)) {
                                this.unexpectedToken();
                            }
                            if (functionName != "") {
                                functionName += ".";
                            }
                            functionName += part.identifier;
                        }
                        result.parts = [];
                        result.parts.push(this.parseFunctionCall(functionName));
                    }
                    expectedNextTokenTypes = [".", "["];
                    break;
                case "[":
                    result.parts.push(this.parseIndexer());
                    expectedNextTokenTypes = [".", "(", "["];
                    break;
                case "identifier":
                    result.parts.push(this.parseIdentifier());
                    expectedNextTokenTypes = [".", "(", "["];
                    break;
                case ".":
                    this.moveNext();
                    expectedNextTokenTypes = ["identifier"];
                    break;
                default:
                    expectedNextTokenTypes = [];
                    break;
            }
        }
    };
    ExpressionParser.prototype.parseExpression = function () {
        var result = new ExpressionNode();
        var expectedNextTokenTypes = literals.concat("(", "+", "-");
        while (!this.eoe) {
            if (expectedNextTokenTypes.indexOf(this.current.type) < 0) {
                if (result.nodes.length == 0) {
                    this.unexpectedToken();
                }
                return result;
            }
            switch (this.current.type) {
                case "(":
                case "identifier":
                    result.nodes.push(this.parsePath());
                    expectedNextTokenTypes = orderedOperators;
                    break;
                case "string":
                case "number":
                case "boolean":
                    if (this.current.type == "string") {
                        result.nodes.push(new LiteralNode(this.current.value));
                    }
                    else if (this.current.type == "number") {
                        result.nodes.push(new LiteralNode(parseFloat(this.current.value)));
                    }
                    else {
                        result.nodes.push(new LiteralNode(this.current.value === "true"));
                    }
                    this.moveNext();
                    expectedNextTokenTypes = orderedOperators;
                    break;
                case "-":
                    if (result.nodes.length == 0) {
                        result.nodes.push(new LiteralNode(-1));
                        result.nodes.push(new OperatorNode("*"));
                        expectedNextTokenTypes = ["identifier", "number", "("];
                    }
                    else {
                        result.nodes.push(new OperatorNode(this.current.type));
                        expectedNextTokenTypes = literals.concat("(");
                    }
                    this.moveNext();
                    break;
                case "+":
                    if (result.nodes.length == 0) {
                        expectedNextTokenTypes = literals.concat("(");
                    }
                    else {
                        result.nodes.push(new OperatorNode(this.current.type));
                        expectedNextTokenTypes = literals.concat("(");
                    }
                    this.moveNext();
                    break;
                case "*":
                case "/":
                case "==":
                case "!=":
                case "<":
                case "<=":
                case ">":
                case ">=":
                    result.nodes.push(new OperatorNode(this.current.type));
                    this.moveNext();
                    expectedNextTokenTypes = literals.concat("(");
                    break;
                default:
                    expectedNextTokenTypes = [];
                    break;
            }
        }
    };
    Object.defineProperty(ExpressionParser.prototype, "eoe", {
        get: function () {
            return this._index >= this._tokens.length;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ExpressionParser.prototype, "current", {
        get: function () {
            return this._tokens[this._index];
        },
        enumerable: true,
        configurable: true
    });
    ExpressionParser.parseBinding = function (bindingExpression) {
        var parser = new ExpressionParser(Tokenizer.parse(bindingExpression));
        parser.parseToken("{");
        var allowNull = !parser.parseOptionalToken("?#");
        var expression = parser.parseExpression();
        parser.parseToken("}");
        return new Binding(expression, allowNull);
    };
    return ExpressionParser;
}());
exports.ExpressionParser = ExpressionParser;
var Binding = /** @class */ (function () {
    function Binding(expression, allowNull) {
        if (allowNull === void 0) { allowNull = true; }
        this.expression = expression;
        this.allowNull = allowNull;
    }
    Binding.prototype.evaluate = function (context) {
        return this.expression.evaluate(context);
    };
    return Binding;
}());
exports.Binding = Binding;


/***/ }),

/***/ "./src/template-engine.ts":
/*!********************************!*\
  !*** ./src/template-engine.ts ***!
  \********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
var expression_parser_1 = __webpack_require__(/*! ./expression-parser */ "./src/expression-parser.ts");
var TemplatizedString = /** @class */ (function () {
    function TemplatizedString() {
        this._parts = [];
        this._shouldDropOwner = false;
    }
    TemplatizedString.parse = function (s) {
        var result = new TemplatizedString();
        var i = 0;
        do {
            var expressionFound = false;
            var start = i;
            var loop = void 0;
            do {
                loop = false;
                start = s.indexOf("{", start);
                if (start >= 0) {
                    if (start + 1 < s.length && s[start + 1] == "{") {
                        start += 2;
                        loop = true;
                    }
                }
            } while (loop);
            if (start >= 0) {
                var end = s.indexOf("}", start);
                if (end >= 0) {
                    expressionFound = true;
                    if (start > i) {
                        result._parts.push(s.substring(i, start));
                    }
                    var bindngExpression = s.substring(start, end + 1);
                    var part = void 0;
                    try {
                        part = expression_parser_1.ExpressionParser.parseBinding(bindngExpression);
                    }
                    catch (e) {
                        part = bindngExpression;
                    }
                    result._parts.push(part);
                    i = end + 1;
                }
            }
            if (!expressionFound) {
                result._parts.push(s.substr(i));
                break;
            }
        } while (i < s.length);
        if (result._parts.length == 1 && typeof result._parts[0] === "string") {
            return result._parts[0];
        }
        else {
            return result;
        }
    };
    TemplatizedString.prototype.evalExpression = function (bindingExpression, context) {
        var result = bindingExpression.evaluate(context);
        if (result == undefined) {
            this._shouldDropOwner = this._shouldDropOwner || !bindingExpression.allowNull;
        }
        return result;
    };
    TemplatizedString.prototype.internalEvaluate = function (context) {
        if (this._parts.length == 0) {
            return undefined;
        }
        else if (this._parts.length == 1) {
            if (typeof this._parts[0] === "string") {
                return this._parts[0];
            }
            else {
                return this.evalExpression(this._parts[0], context);
            }
        }
        else {
            var s = "";
            for (var _i = 0, _a = this._parts; _i < _a.length; _i++) {
                var part = _a[_i];
                if (typeof part === "string") {
                    s += part;
                }
                else {
                    s += this.evalExpression(part, context);
                }
            }
            return s;
        }
    };
    TemplatizedString.prototype.evaluate = function (context) {
        this._shouldDropOwner = false;
        return this.internalEvaluate(context);
    };
    Object.defineProperty(TemplatizedString.prototype, "shouldDropOwner", {
        get: function () {
            return this._shouldDropOwner;
        },
        enumerable: true,
        configurable: true
    });
    return TemplatizedString;
}());
var Template = /** @class */ (function () {
    function Template(payload) {
        this.preparedPayload = Template.prepare(payload);
    }
    Template.prepare = function (node) {
        if (typeof node === "string") {
            return TemplatizedString.parse(node);
        }
        else if (typeof node === "object" && node != null) {
            if (Array.isArray(node)) {
                var result = [];
                for (var _i = 0, node_1 = node; _i < node_1.length; _i++) {
                    var item = node_1[_i];
                    result.push(Template.prepare(item));
                }
                return result;
            }
            else {
                var keys = Object.keys(node);
                var result = {};
                for (var _a = 0, keys_1 = keys; _a < keys_1.length; _a++) {
                    var key = keys_1[_a];
                    result[key] = Template.prepare(node[key]);
                }
                return result;
            }
        }
        else {
            return node;
        }
    };
    Template.prototype.expandSingleObject = function (node) {
        var result = {};
        var keys = Object.keys(node);
        for (var _i = 0, keys_2 = keys; _i < keys_2.length; _i++) {
            var key = keys_2[_i];
            if (!this._context.isReservedField(key)) {
                var value = this.internalExpand(node[key]);
                if (value != undefined) {
                    result[key] = value;
                }
            }
        }
        return result;
    };
    Template.prototype.internalExpand = function (node) {
        var result;
        this._context.saveState();
        if (Array.isArray(node)) {
            var itemArray = [];
            for (var _i = 0, node_2 = node; _i < node_2.length; _i++) {
                var item = node_2[_i];
                var expandedItem = this.internalExpand(item);
                if (expandedItem != null) {
                    if (Array.isArray(expandedItem)) {
                        itemArray = itemArray.concat(expandedItem);
                    }
                    else {
                        itemArray.push(expandedItem);
                    }
                }
            }
            result = itemArray;
        }
        else if (node instanceof TemplatizedString) {
            result = node.evaluate(this._context);
            if (node.shouldDropOwner) {
                result = null;
            }
        }
        else if (typeof node === "object" && node != null) {
            var dropObject = false;
            var when = node["$when"];
            if (when instanceof TemplatizedString) {
                var whenValue = when.evaluate(this._context);
                if (typeof whenValue === "boolean") {
                    dropObject = !whenValue;
                }
            }
            if (!dropObject) {
                var dataContext = node["$data"];
                if (dataContext != undefined) {
                    if (dataContext instanceof TemplatizedString) {
                        dataContext = dataContext.evaluate(this._context);
                    }
                    if (Array.isArray(dataContext)) {
                        result = [];
                        for (var i = 0; i < dataContext.length; i++) {
                            this._context.$data = dataContext[i];
                            this._context.$index = i;
                            var expandedObject = this.expandSingleObject(node);
                            if (expandedObject != null) {
                                result.push(expandedObject);
                            }
                        }
                    }
                    else {
                        this._context.$data = dataContext;
                        result = this.expandSingleObject(node);
                    }
                }
                else {
                    result = this.expandSingleObject(node);
                }
            }
            else {
                result = null;
            }
        }
        else {
            result = node;
        }
        this._context.restoreLastState();
        return result;
    };
    Template.prototype.expand = function (context) {
        this._context = context;
        return this.internalExpand(this.preparedPayload);
    };
    return Template;
}());
exports.Template = Template;


/***/ })

/******/ });
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9BQ0RhdGEvd2VicGFjay91bml2ZXJzYWxNb2R1bGVEZWZpbml0aW9uIiwid2VicGFjazovL0FDRGF0YS93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9BQ0RhdGEvLi9zcmMvYWRhcHRpdmVjYXJkcy10ZW1wbGF0aW5nLnRzIiwid2VicGFjazovL0FDRGF0YS8uL3NyYy9leHByZXNzaW9uLXBhcnNlci50cyIsIndlYnBhY2s6Ly9BQ0RhdGEvLi9zcmMvdGVtcGxhdGUtZW5naW5lLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUM7QUFDRCxPO0FDVkE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxrREFBMEMsZ0NBQWdDO0FBQzFFO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsZ0VBQXdELGtCQUFrQjtBQUMxRTtBQUNBLHlEQUFpRCxjQUFjO0FBQy9EOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpREFBeUMsaUNBQWlDO0FBQzFFLHdIQUFnSCxtQkFBbUIsRUFBRTtBQUNySTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLG1DQUEyQiwwQkFBMEIsRUFBRTtBQUN2RCx5Q0FBaUMsZUFBZTtBQUNoRDtBQUNBO0FBQ0E7O0FBRUE7QUFDQSw4REFBc0QsK0RBQStEOztBQUVySDtBQUNBOzs7QUFHQTtBQUNBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNsRkEsNERBQTREO0FBQzVELGtDQUFrQztBQUNsQyx1RkFBb0M7QUFDcEMsbUZBQWtDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDd0JsQyxJQUFNLGdCQUFnQixHQUFxQjtJQUN2QyxHQUFHO0lBQ0gsR0FBRztJQUNILEdBQUc7SUFDSCxHQUFHO0lBQ0gsSUFBSTtJQUNKLElBQUk7SUFDSixHQUFHO0lBQ0gsSUFBSTtJQUNKLEdBQUc7SUFDSCxJQUFJO0NBQ1AsQ0FBQztBQUVGLElBQU0sUUFBUSxHQUFxQjtJQUMvQixZQUFZO0lBQ1osUUFBUTtJQUNSLFFBQVE7SUFDUixTQUFTO0NBQ1osQ0FBQztBQWFGO0lBQUE7SUEwRUEsQ0FBQztJQXZFVSxjQUFJLEdBQVg7UUFDSSxTQUFTLENBQUMsS0FBSyxDQUFDLElBQUksQ0FDaEIsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsRUFDdEMsRUFBRSxTQUFTLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsRUFDL0IsRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsRUFDbEMsRUFBRSxTQUFTLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsRUFDL0IsRUFBRSxTQUFTLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsRUFDaEMsRUFBRSxTQUFTLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsRUFDaEMsRUFBRSxTQUFTLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsRUFDaEMsRUFBRSxTQUFTLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsRUFDaEMsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxjQUFjLEVBQUUsRUFDL0MsRUFBRSxTQUFTLEVBQUUsWUFBWSxFQUFFLEtBQUssRUFBRSxZQUFZLEVBQUUsRUFDaEQsRUFBRSxTQUFTLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsRUFDaEMsRUFBRSxTQUFTLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsRUFDL0IsRUFBRSxTQUFTLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsRUFDaEMsRUFBRSxTQUFTLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsRUFDL0IsRUFBRSxTQUFTLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsRUFDaEMsRUFBRSxTQUFTLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsRUFDaEMsRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsRUFDakMsRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsRUFDakMsRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsRUFDakMsRUFBRSxTQUFTLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsRUFDL0IsRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsRUFDakMsRUFBRSxTQUFTLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsRUFDL0IsRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxZQUFZLEVBQUUsRUFDNUMsRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxZQUFZLEVBQUUsRUFDNUMsRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxZQUFZLEVBQUUsQ0FDL0M7SUFDTCxDQUFDO0lBRU0sZUFBSyxHQUFaLFVBQWEsVUFBa0I7UUFDM0IsSUFBSSxNQUFNLEdBQVksRUFBRSxDQUFDO1FBQ3pCLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUVWLE9BQU8sQ0FBQyxHQUFHLFVBQVUsQ0FBQyxNQUFNLEVBQUU7WUFDMUIsSUFBSSxhQUFhLEdBQUcsVUFBVSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM1QyxJQUFJLFVBQVUsR0FBRyxLQUFLLENBQUM7WUFF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Q0FBQyxDQUFDO2lCQUMxQzthQUNKO2lCQUNJO2dCQUNELE1BQU0sR0FBRyxJQUFJLENBQUM7YUFDakI7U0FDSjthQUNJO1lBQ0QsTUFBTSxHQUFHLElBQUksQ0FBQztTQUNqQjtRQUVELElBQUksQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztRQUVqQyxPQUFPLE1BQU0sQ0FBQztJQUNsQixDQUFDO0lBUUQseUJBQU0sR0FBTixVQUFPLE9BQTBCO1FBQzdCLElBQUksQ0FBQyxRQUFRLEdBQUcsT0FBTyxDQUFDO1FBRXhCLE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUM7SUFDckQsQ0FBQztJQUNMLGVBQUM7QUFBRCxDQUFDO0FBcEpZLDRCQUFRIiwiZmlsZSI6ImFkYXB0aXZlY2FyZHMtdGVtcGxhdGluZy5qcyIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiB3ZWJwYWNrVW5pdmVyc2FsTW9kdWxlRGVmaW5pdGlvbihyb290LCBmYWN0b3J5KSB7XG5cdGlmKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlID09PSAnb2JqZWN0Jylcblx0XHRtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKTtcblx0ZWxzZSBpZih0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpXG5cdFx0ZGVmaW5lKFtdLCBmYWN0b3J5KTtcblx0ZWxzZSBpZih0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpXG5cdFx0ZXhwb3J0c1tcIkFDRGF0YVwiXSA9IGZhY3RvcnkoKTtcblx0ZWxzZVxuXHRcdHJvb3RbXCJBQ0RhdGFcIl0gPSBmYWN0b3J5KCk7XG59KSh3aW5kb3csIGZ1bmN0aW9uKCkge1xucmV0dXJuICIsIiBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbiBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG5cbiBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cbiBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKSB7XG4gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG4gXHRcdH1cbiBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbiBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuIFx0XHRcdGk6IG1vZHVsZUlkLFxuIFx0XHRcdGw6IGZhbHNlLFxuIFx0XHRcdGV4cG9ydHM6IHt9XG4gXHRcdH07XG5cbiBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiBcdFx0bW9kdWxlLmwgPSB0cnVlO1xuXG4gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbiBcdH1cblxuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbiBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbiBcdC8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb24gZm9yIGhhcm1vbnkgZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kID0gZnVuY3Rpb24oZXhwb3J0cywgbmFtZSwgZ2V0dGVyKSB7XG4gXHRcdGlmKCFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywgbmFtZSkpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgbmFtZSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGdldHRlciB9KTtcbiBcdFx0fVxuIFx0fTtcblxuIFx0Ly8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5yID0gZnVuY3Rpb24oZXhwb3J0cykge1xuIFx0XHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcbiBcdFx0fVxuIFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xuIFx0fTtcblxuIFx0Ly8gY3JlYXRlIGEgZmFrZSBuYW1lc3BhY2Ugb2JqZWN0XG4gXHQvLyBtb2RlICYgMTogdmFsdWUgaXMgYSBtb2R1bGUgaWQsIHJlcXVpcmUgaXRcbiBcdC8vIG1vZGUgJiAyOiBtZXJnZSBhbGwgcHJvcGVydGllcyBvZiB2YWx1ZSBpbnRvIHRoZSBuc1xuIFx0Ly8gbW9kZSAmIDQ6IHJldHVybiB2YWx1ZSB3aGVuIGFscmVhZHkgbnMgb2JqZWN0XG4gXHQvLyBtb2RlICYgOHwxOiBiZWhhdmUgbGlrZSByZXF1aXJlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnQgPSBmdW5jdGlvbih2YWx1ZSwgbW9kZSkge1xuIFx0XHRpZihtb2RlICYgMSkgdmFsdWUgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKHZhbHVlKTtcbiBcdFx0aWYobW9kZSAmIDgpIHJldHVybiB2YWx1ZTtcbiBcdFx0aWYoKG1vZGUgJiA0KSAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmIHZhbHVlICYmIHZhbHVlLl9fZXNNb2R1bGUpIHJldHVybiB2YWx1ZTtcbiBcdFx0dmFyIG5zID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5yKG5zKTtcbiBcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KG5zLCAnZGVmYXVsdCcsIHsgZW51bWVyYWJsZTogdHJ1ZSwgdmFsdWU6IHZhbHVlIH0pO1xuIFx0XHRpZihtb2RlICYgMiAmJiB0eXBlb2YgdmFsdWUgIT0gJ3N0cmluZycpIGZvcih2YXIga2V5IGluIHZhbHVlKSBfX3dlYnBhY2tfcmVxdWlyZV9fLmQobnMsIGtleSwgZnVuY3Rpb24oa2V5KSB7IHJldHVybiB2YWx1ZVtrZXldOyB9LmJpbmQobnVsbCwga2V5KSk7XG4gXHRcdHJldHVybiBucztcbiBcdH07XG5cbiBcdC8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSBmdW5jdGlvbihtb2R1bGUpIHtcbiBcdFx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0RGVmYXVsdCgpIHsgcmV0dXJuIG1vZHVsZVsnZGVmYXVsdCddOyB9IDpcbiBcdFx0XHRmdW5jdGlvbiBnZXRNb2R1bGVFeHBvcnRzKCkgeyByZXR1cm4gbW9kdWxlOyB9O1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCAnYScsIGdldHRlcik7XG4gXHRcdHJldHVybiBnZXR0ZXI7XG4gXHR9O1xuXG4gXHQvLyBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGxcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubyA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHkpIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KTsgfTtcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7XG5cblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXyhfX3dlYnBhY2tfcmVxdWlyZV9fLnMgPSBcIi4vc3JjL2FkYXB0aXZlY2FyZHMtdGVtcGxhdGluZy50c1wiKTtcbiIsIi8vIENvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxyXG4vLyBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2UuXHJcbmV4cG9ydCAqIGZyb20gXCIuL2V4cHJlc3Npb24tcGFyc2VyXCI7XHJcbmV4cG9ydCAqIGZyb20gXCIuL3RlbXBsYXRlLWVuZ2luZVwiOyIsIi8vIENvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxyXG4vLyBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2UuXHJcbnR5cGUgVG9rZW5UeXBlID1cclxuICAgIFwie1wiIHxcclxuICAgIFwiPyNcIiB8XHJcbiAgICBcIn1cIiB8XHJcbiAgICBcIltcIiB8XHJcbiAgICBcIl1cIiB8XHJcbiAgICBcIihcIiB8XHJcbiAgICBcIilcIiB8XHJcbiAgICBcImlkZW50aWZpZXJcIiB8XHJcbiAgICBcIi5cIiB8XHJcbiAgICBcIixcIiB8XHJcbiAgICBcIitcIiB8XHJcbiAgICBcIi1cIiB8XHJcbiAgICBcIipcIiB8XHJcbiAgICBcIi9cIiB8XHJcbiAgICBcIj09XCIgfFxyXG4gICAgXCIhPVwiIHxcclxuICAgIFwiPFwiIHxcclxuICAgIFwiPD1cIiB8XHJcbiAgICBcIj5cIiB8XHJcbiAgICBcIj49XCIgfFxyXG4gICAgXCJzdHJpbmdcIiB8XHJcbiAgICBcIm51bWJlclwiIHxcclxuICAgIFwiYm9vbGVhblwiO1xyXG5cclxuY29uc3Qgb3JkZXJlZE9wZXJhdG9yczogQXJyYXk8VG9rZW5UeXBlPiA9IFtcclxuICAgIFwiL1wiLFxyXG4gICAgXCIqXCIsXHJcbiAgICBcIi1cIixcclxuICAgIFwiK1wiLFxyXG4gICAgXCI9PVwiLFxyXG4gICAgXCIhPVwiLFxyXG4gICAgXCI8XCIsXHJcbiAgICBcIjw9XCIsXHJcbiAgICBcIj5cIixcclxuICAgIFwiPj1cIlxyXG5dO1xyXG5cclxuY29uc3QgbGl0ZXJhbHM6IEFycmF5PFRva2VuVHlwZT4gPSBbXHJcbiAgICBcImlkZW50aWZpZXJcIixcclxuICAgIFwic3RyaW5nXCIsXHJcbiAgICBcIm51bWJlclwiLFxyXG4gICAgXCJib29sZWFuXCJcclxuXTtcclxuXHJcbmludGVyZmFjZSBUb2tlbml6ZXJSdWxlIHtcclxuICAgIHRva2VuVHlwZTogVG9rZW5UeXBlO1xyXG4gICAgcmVnRXg6IFJlZ0V4cDtcclxufVxyXG5cclxuaW50ZXJmYWNlIFRva2VuIHtcclxuICAgIHR5cGU6IFRva2VuVHlwZTtcclxuICAgIHZhbHVlOiBzdHJpbmc7XHJcbiAgICBvcmlnaW5hbFBvc2l0aW9uOiBudW1iZXI7XHJcbn1cclxuXHJcbmNsYXNzIFRva2VuaXplciB7XHJcbiAgICBzdGF0aWMgcnVsZXM6IEFycmF5PFRva2VuaXplclJ1bGU+ID0gW107XHJcblxyXG4gICAgc3RhdGljIGluaXQoKSB7XHJcbiAgICAgICAgVG9rZW5pemVyLnJ1bGVzLnB1c2goXHJcbiAgICAgICAgICAgIHsgdG9rZW5UeXBlOiB1bmRlZmluZWQsIHJlZ0V4OiAvXlxccy8gfSxcclxuICAgICAgICAgICAgeyB0b2tlblR5cGU6IFwie1wiLCByZWdFeDogL157LyB9LFxyXG4gICAgICAgICAgICB7IHRva2VuVHlwZTogXCI/I1wiLCByZWdFeDogL15cXD8jLyB9LFxyXG4gICAgICAgICAgICB7IHRva2VuVHlwZTogXCJ9XCIsIHJlZ0V4OiAvXn0vIH0sXHJcbiAgICAgICAgICAgIHsgdG9rZW5UeXBlOiBcIltcIiwgcmVnRXg6IC9eXFxbLyB9LFxyXG4gICAgICAgICAgICB7IHRva2VuVHlwZTogXCJdXCIsIHJlZ0V4OiAvXlxcXS8gfSxcclxuICAgICAgICAgICAgeyB0b2tlblR5cGU6IFwiKFwiLCByZWdFeDogL15cXCgvIH0sXHJcbiAgICAgICAgICAgIHsgdG9rZW5UeXBlOiBcIilcIiwgcmVnRXg6IC9eXFwpLyB9LFxyXG4gICAgICAgICAgICB7IHRva2VuVHlwZTogXCJib29sZWFuXCIsIHJlZ0V4OiAvXnRydWV8XmZhbHNlLyB9LFxyXG4gICAgICAgICAgICB7IHRva2VuVHlwZTogXCJpZGVudGlmaWVyXCIsIHJlZ0V4OiAvXlskYS16X10rL2kgfSxcclxuICAgICAgICAgICAgeyB0b2tlblR5cGU6IFwiLlwiLCByZWdFeDogL15cXC4vIH0sXHJcbiAgICAgICAgICAgIHsgdG9rZW5UeXBlOiBcIixcIiwgcmVnRXg6IC9eLC8gfSxcclxuICAgICAgICAgICAgeyB0b2tlblR5cGU6IFwiK1wiLCByZWdFeDogL15cXCsvIH0sXHJcbiAgICAgICAgICAgIHsgdG9rZW5UeXBlOiBcIi1cIiwgcmVnRXg6IC9eLS8gfSxcclxuICAgICAgICAgICAgeyB0b2tlblR5cGU6IFwiKlwiLCByZWdFeDogL15cXCovIH0sXHJcbiAgICAgICAgICAgIHsgdG9rZW5UeXBlOiBcIi9cIiwgcmVnRXg6IC9eXFwvLyB9LFxyXG4gICAgICAgICAgICB7IHRva2VuVHlwZTogXCI9PVwiLCByZWdFeDogL149PS8gfSxcclxuICAgICAgICAgICAgeyB0b2tlblR5cGU6IFwiIT1cIiwgcmVnRXg6IC9eIT0vIH0sXHJcbiAgICAgICAgICAgIHsgdG9rZW5UeXBlOiBcIjw9XCIsIHJlZ0V4OiAvXjw9LyB9LFxyXG4gICAgICAgICAgICB7IHRva2VuVHlwZTogXCI8XCIsIHJlZ0V4OiAvXjwvIH0sXHJcbiAgICAgICAgICAgIHsgdG9rZW5UeXBlOiBcIj49XCIsIHJlZ0V4OiAvXj49LyB9LFxyXG4gICAgICAgICAgICB7IHRva2VuVHlwZTogXCI+XCIsIHJlZ0V4OiAvXj4vIH0sXHJcbiAgICAgICAgICAgIHsgdG9rZW5UeXBlOiBcInN0cmluZ1wiLCByZWdFeDogL15cIihbXlwiXSopXCIvIH0sXHJcbiAgICAgICAgICAgIHsgdG9rZW5UeXBlOiBcInN0cmluZ1wiLCByZWdFeDogL14nKFteJ10qKScvIH0sXHJcbiAgICAgICAgICAgIHsgdG9rZW5UeXBlOiBcIm51bWJlclwiLCByZWdFeDogL15cXGQqXFwuP1xcZCsvIH1cclxuICAgICAgICApXHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIHBhcnNlKGV4cHJlc3Npb246IHN0cmluZyk6IFRva2VuW10ge1xyXG4gICAgICAgIGxldCByZXN1bHQ6IFRva2VuW10gPSBbXTtcclxuICAgICAgICBsZXQgaSA9IDA7XHJcblxyXG4gICAgICAgIHdoaWxlIChpIDwgZXhwcmVzc2lvbi5sZW5ndGgpIHtcclxuICAgICAgICAgICAgbGV0IHN1YkV4cHJlc3Npb24gPSBleHByZXNzaW9uLnN1YnN0cmluZyhpKTtcclxuICAgICAgICAgICAgbGV0IG1hdGNoRm91bmQgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgICAgIGZvciAobGV0IHJ1bGUgb2YgVG9rZW5pemVyLnJ1bGVzKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgbWF0Y2hlcyA9IHJ1bGUucmVnRXguZXhlYyhzdWJFeHByZXNzaW9uKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAobWF0Y2hlcykge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChtYXRjaGVzLmxlbmd0aCA+IDIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQSB0b2tlbml6ZXIgcnVsZSBtYXRjaGVkIG1vcmUgdGhhbiBvbmUgZ3JvdXAuXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJ1bGUudG9rZW5UeXBlICE9IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQucHVzaChcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiBydWxlLnRva2VuVHlwZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogbWF0Y2hlc1ttYXRjaGVzLmxlbmd0aCA9PSAxID8gMCA6IDFdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9yaWdpbmFsUG9zaXRpb246IGlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgKVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaSArPSBtYXRjaGVzWzBdLmxlbmd0aDtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgbWF0Y2hGb3VuZCA9IHRydWU7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoIW1hdGNoRm91bmQpIHtcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlVuZXhwZWN0ZWQgY2hhcmFjdGVyIFwiICsgc3ViRXhwcmVzc2lvblswXSArIFwiIGF0IHBvc2l0aW9uIFwiICsgaSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9XHJcbn1cclxuXHJcblRva2VuaXplci5pbml0KCk7XHJcblxyXG50eXBlIExpdGVyYWxWYWx1ZSA9IHN0cmluZyB8IG51bWJlciB8IGJvb2xlYW47XHJcblxyXG5mdW5jdGlvbiBlbnN1cmVWYWx1ZVR5cGUodmFsdWU6IGFueSk6IExpdGVyYWxWYWx1ZSB7XHJcbiAgICBpZiAodHlwZW9mIHZhbHVlID09PSBcIm51bWJlclwiIHx8IHR5cGVvZiB2YWx1ZSA9PT0gXCJzdHJpbmdcIiB8fCB0eXBlb2YgdmFsdWUgPT09IFwiYm9vbGVhblwiKSB7XHJcbiAgICAgICAgcmV0dXJuIHZhbHVlO1xyXG4gICAgfVxyXG5cclxuICAgIHRocm93IG5ldyBFcnJvcihcIkludmFsaWQgdmFsdWUgdHlwZTogXCIgKyB0eXBlb2YgdmFsdWUpO1xyXG59XHJcblxyXG50eXBlIEZ1bmN0aW9uQ2FsbGJhY2sgPSAoLi4ucGFyYW1zOiBhbnlbXSkgPT4gYW55O1xyXG50eXBlIEZ1bmN0aW9uRGljdGlvbmFyeSA9IHsgW2tleTogc3RyaW5nXTogRnVuY3Rpb25DYWxsYmFjayB9O1xyXG5cclxuaW50ZXJmYWNlIEV2YWx1YXRpb25Db250ZXh0U3RhdGUge1xyXG4gICAgJGRhdGE6IGFueTtcclxuICAgICRpbmRleDogYW55O1xyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgRXZhbHVhdGlvbkNvbnRleHQge1xyXG4gICAgcHJpdmF0ZSBzdGF0aWMgcmVhZG9ubHkgX3Jlc2VydmVkRmllbGRzID0gW1wiJGRhdGFcIiwgXCIkcm9vdFwiLCBcIiRpbmRleFwiXTtcclxuICAgIHByaXZhdGUgc3RhdGljIF9idWlsdEluRnVuY3Rpb25zOiBGdW5jdGlvbkRpY3Rpb25hcnkgPSB7fVxyXG5cclxuICAgIHN0YXRpYyBpbml0KCkge1xyXG4gICAgICAgIEV2YWx1YXRpb25Db250ZXh0Ll9idWlsdEluRnVuY3Rpb25zW1wic3Vic3RyXCJdID0gKHMsIGluZGV4LCBjb3VudCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIHMgPT09IFwic3RyaW5nXCIgJiYgdHlwZW9mIGluZGV4ID09PSBcIm51bWJlclwiICYmIHR5cGVvZiBjb3VudCA9PT0gXCJudW1iZXJcIikge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIChzLnN1YnN0cihpbmRleCwgY291bnQpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBcIlwiO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgICAgICBFdmFsdWF0aW9uQ29udGV4dC5fYnVpbHRJbkZ1bmN0aW9uc1tcIkpTT04ucGFyc2VcIl0gPSAoaW5wdXQpID0+IHtcclxuICAgICAgICAgICAgcmV0dXJuIEpTT04ucGFyc2UoaW5wdXQpO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgRXZhbHVhdGlvbkNvbnRleHQuX2J1aWx0SW5GdW5jdGlvbnNbXCJpZlwiXSA9IChjb25kaXRpb24sIGlmVHJ1ZSwgaWZGYWxzZSkgPT4ge1xyXG4gICAgICAgICAgICByZXR1cm4gY29uZGl0aW9uID8gaWZUcnVlIDogaWZGYWxzZTtcclxuICAgICAgICB9O1xyXG4gICAgICAgIEV2YWx1YXRpb25Db250ZXh0Ll9idWlsdEluRnVuY3Rpb25zW1widG9VcHBlclwiXSA9IChpbnB1dCkgPT4ge1xyXG4gICAgICAgICAgICByZXR1cm4gdHlwZW9mIGlucHV0ID09PSBcInN0cmluZ1wiID8gaW5wdXQudG9VcHBlckNhc2UoKSA6IGlucHV0O1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgRXZhbHVhdGlvbkNvbnRleHQuX2J1aWx0SW5GdW5jdGlvbnNbXCJ0b0xvd2VyXCJdID0gKGlucHV0KSA9PiB7XHJcbiAgICAgICAgICAgIHJldHVybiB0eXBlb2YgaW5wdXQgPT09IFwic3RyaW5nXCIgPyBpbnB1dC50b0xvd2VyQ2FzZSgpIDogaW5wdXQ7XHJcbiAgICAgICAgfTtcclxuICAgICAgICBFdmFsdWF0aW9uQ29udGV4dC5fYnVpbHRJbkZ1bmN0aW9uc1tcIkRhdGUuZm9ybWF0XCJdID0gKGlucHV0LCBmb3JtYXQpID0+IHtcclxuICAgICAgICAgICAgY29uc3QgYWNjZXB0ZWRGb3JtYXRzID0gWyBcImxvbmdcIiwgXCJzaG9ydFwiLCBcImNvbXBhY3RcIiBdO1xyXG5cclxuICAgICAgICAgICAgbGV0IGlucHV0QXNOdW1iZXI6IG51bWJlcjtcclxuXHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgaW5wdXQgPT09IFwic3RyaW5nXCIpIHtcclxuICAgICAgICAgICAgICAgIGlucHV0QXNOdW1iZXIgPSBEYXRlLnBhcnNlKGlucHV0KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmICh0eXBlb2YgaW5wdXQgPT09IFwibnVtYmVyXCIpIHtcclxuICAgICAgICAgICAgICAgIGlucHV0QXNOdW1iZXIgPSBpbnB1dDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBpbnB1dDtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgbGV0IGRhdGUgPSBuZXcgRGF0ZShpbnB1dEFzTnVtYmVyKTtcclxuXHJcbiAgICAgICAgICAgIGxldCBlZmZlY3RpdmVGb3JtYXQ6IHN0cmluZyA9IFwiY29tcGFjdFwiO1xyXG5cclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBmb3JtYXQgPT09IFwic3RyaW5nXCIpIHtcclxuICAgICAgICAgICAgICAgIGVmZmVjdGl2ZUZvcm1hdCA9IGZvcm1hdC50b0xvd2VyQ2FzZSgpO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChhY2NlcHRlZEZvcm1hdHMuaW5kZXhPZihlZmZlY3RpdmVGb3JtYXQpIDwgMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGVmZmVjdGl2ZUZvcm1hdCA9IFwiY29tcGFjdFwiO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZWZmZWN0aXZlRm9ybWF0ID09PSBcImNvbXBhY3RcIiA/IGRhdGUudG9Mb2NhbGVEYXRlU3RyaW5nKCkgOiBkYXRlLnRvTG9jYWxlRGF0ZVN0cmluZyh1bmRlZmluZWQsIHsgZGF5OiBcIm51bWVyaWNcIiwgd2Vla2RheTogZWZmZWN0aXZlRm9ybWF0LCBtb250aDogZWZmZWN0aXZlRm9ybWF0LCB5ZWFyOiBcIm51bWVyaWNcIiB9KTtcclxuICAgICAgICB9O1xyXG4gICAgICAgIEV2YWx1YXRpb25Db250ZXh0Ll9idWlsdEluRnVuY3Rpb25zW1wiVGltZS5mb3JtYXRcIl0gPSAoaW5wdXQpID0+IHtcclxuICAgICAgICAgICAgbGV0IGlucHV0QXNOdW1iZXI6IG51bWJlcjtcclxuXHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgaW5wdXQgPT09IFwic3RyaW5nXCIpIHtcclxuICAgICAgICAgICAgICAgIGlucHV0QXNOdW1iZXIgPSBEYXRlLnBhcnNlKGlucHV0KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmICh0eXBlb2YgaW5wdXQgPT09IFwibnVtYmVyXCIpIHtcclxuICAgICAgICAgICAgICAgIGlucHV0QXNOdW1iZXIgPSBpbnB1dDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBpbnB1dDtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgbGV0IGRhdGUgPSBuZXcgRGF0ZShpbnB1dEFzTnVtYmVyKTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBkYXRlLnRvTG9jYWxlVGltZVN0cmluZyh1bmRlZmluZWQsIHsgaG91cjogJ251bWVyaWMnLCBtaW51dGU6ICcyLWRpZ2l0JyB9KTtcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2Z1bmN0aW9ucyA9IHt9O1xyXG4gICAgcHJpdmF0ZSBfc3RhdGVTdGFjazogRXZhbHVhdGlvbkNvbnRleHRTdGF0ZVtdID0gW107XHJcblxyXG4gICAgJHJvb3Q6IGFueTtcclxuICAgICRkYXRhOiBhbnk7XHJcbiAgICAkaW5kZXg6IG51bWJlcjtcclxuXHJcbiAgICByZWdpc3RlckZ1bmN0aW9uKG5hbWU6IHN0cmluZywgY2FsbGJhY2s6IEZ1bmN0aW9uQ2FsbGJhY2spIHtcclxuICAgICAgICB0aGlzLl9mdW5jdGlvbnNbbmFtZV0gPSBjYWxsYmFjaztcclxuICAgIH1cclxuXHJcbiAgICB1bnJlZ2lzdGVyRnVuY3Rpb24obmFtZTogc3RyaW5nKSB7XHJcbiAgICAgICAgZGVsZXRlIHRoaXMuX2Z1bmN0aW9uc1tuYW1lXTtcclxuICAgIH1cclxuXHJcbiAgICBnZXRGdW5jdGlvbihuYW1lOiBzdHJpbmcpOiBGdW5jdGlvbkNhbGxiYWNrIHtcclxuICAgICAgICBsZXQgcmVzdWx0ID0gdGhpcy5fZnVuY3Rpb25zW25hbWVdO1xyXG5cclxuICAgICAgICBpZiAocmVzdWx0ID09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICByZXN1bHQgPSBFdmFsdWF0aW9uQ29udGV4dC5fYnVpbHRJbkZ1bmN0aW9uc1tuYW1lXTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9XHJcblxyXG4gICAgaXNSZXNlcnZlZEZpZWxkKG5hbWU6IHN0cmluZyk6IGJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiBFdmFsdWF0aW9uQ29udGV4dC5fcmVzZXJ2ZWRGaWVsZHMuaW5kZXhPZihuYW1lKSA+PSAwO1xyXG4gICAgfVxyXG5cclxuICAgIHNhdmVTdGF0ZSgpIHtcclxuICAgICAgICB0aGlzLl9zdGF0ZVN0YWNrLnB1c2goeyAkZGF0YTogdGhpcy4kZGF0YSwgJGluZGV4OiB0aGlzLiRpbmRleCB9KTtcclxuICAgIH1cclxuXHJcbiAgICByZXN0b3JlTGFzdFN0YXRlKCkge1xyXG4gICAgICAgIGlmICh0aGlzLl9zdGF0ZVN0YWNrLmxlbmd0aCA9PSAwKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlRoZXJlIGlzIG5vIGV2YWx1YXRpb24gY29udGV4dCBzdGF0ZSB0byByZXN0b3JlLlwiKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCBzYXZlZENvbnRleHQgPSB0aGlzLl9zdGF0ZVN0YWNrLnBvcCgpO1xyXG5cclxuICAgICAgICB0aGlzLiRkYXRhID0gc2F2ZWRDb250ZXh0LiRkYXRhO1xyXG4gICAgICAgIHRoaXMuJGluZGV4ID0gc2F2ZWRDb250ZXh0LiRpbmRleDtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgY3VycmVudERhdGFDb250ZXh0KCk6IGFueSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuJGRhdGEgIT0gdW5kZWZpbmVkID8gdGhpcy4kZGF0YSA6IHRoaXMuJHJvb3Q7XHJcbiAgICB9XHJcbn1cclxuXHJcbkV2YWx1YXRpb25Db250ZXh0LmluaXQoKTtcclxuXHJcbmFic3RyYWN0IGNsYXNzIEV2YWx1YXRpb25Ob2RlIHtcclxuICAgIGFic3RyYWN0IGV2YWx1YXRlKGNvbnRleHQ6IEV2YWx1YXRpb25Db250ZXh0KTogTGl0ZXJhbFZhbHVlO1xyXG59XHJcblxyXG5jbGFzcyBFeHByZXNzaW9uTm9kZSBleHRlbmRzIEV2YWx1YXRpb25Ob2RlIHtcclxuICAgIG5vZGVzOiBBcnJheTxFdmFsdWF0aW9uTm9kZT4gPSBbXTtcclxuICAgIGFsbG93TnVsbDogYm9vbGVhbiA9IHRydWU7XHJcblxyXG4gICAgZXZhbHVhdGUoY29udGV4dDogRXZhbHVhdGlvbkNvbnRleHQpOiBhbnkge1xyXG4gICAgICAgIGNvbnN0IG9wZXJhdG9yUHJpb3JpdHlHcm91cHMgPSBbXHJcbiAgICAgICAgICAgIFtcIi9cIiwgXCIqXCJdLFxyXG4gICAgICAgICAgICBbXCItXCIsIFwiK1wiXSxcclxuICAgICAgICAgICAgW1wiPT1cIiwgXCIhPVwiLCBcIjxcIiwgXCI8PVwiLCBcIj5cIiwgXCI+PVwiXVxyXG4gICAgICAgIF07XHJcblxyXG4gICAgICAgIGxldCBub2Rlc0NvcHkgPSB0aGlzLm5vZGVzO1xyXG5cclxuICAgICAgICBmb3IgKGxldCBwcmlvcml0eUdyb3VwIG9mIG9wZXJhdG9yUHJpb3JpdHlHcm91cHMpIHtcclxuICAgICAgICAgICAgbGV0IGkgPSAwO1xyXG5cclxuICAgICAgICAgICAgd2hpbGUgKGkgPCBub2Rlc0NvcHkubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgbm9kZSA9IG5vZGVzQ29weVtpXTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAobm9kZSBpbnN0YW5jZW9mIE9wZXJhdG9yTm9kZSAmJiBwcmlvcml0eUdyb3VwLmluZGV4T2Yobm9kZS5vcGVyYXRvcikgPj0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBsZWZ0ID0gZW5zdXJlVmFsdWVUeXBlKG5vZGVzQ29weVtpIC0gMV0uZXZhbHVhdGUoY29udGV4dCkpO1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCByaWdodCA9IGVuc3VyZVZhbHVlVHlwZShub2Rlc0NvcHlbaSArIDFdLmV2YWx1YXRlKGNvbnRleHQpKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBsZWZ0ICE9PSB0eXBlb2YgcmlnaHQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiSW5jb21wYXRpYmxlIG9wZXJhbmRzIFwiICsgbGVmdCArIFwiIGFuZCBcIiArIHJpZ2h0ICsgXCIgZm9yIG9wZXJhdG9yIFwiICsgbm9kZS5vcGVyYXRvcik7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBsZXQgcmVzdWx0OiBMaXRlcmFsVmFsdWU7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgbGVmdCA9PT0gXCJudW1iZXJcIiAmJiB0eXBlb2YgcmlnaHQgPT09IFwibnVtYmVyXCIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3dpdGNoIChub2RlLm9wZXJhdG9yKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwiL1wiOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IGxlZnQgLyByaWdodDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCIqXCI6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gbGVmdCAqIHJpZ2h0O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcIi1cIjpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSBsZWZ0IC0gcmlnaHQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwiK1wiOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IGxlZnQgKyByaWdodDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBsZWZ0ID09PSBcInN0cmluZ1wiICYmIHR5cGVvZiByaWdodCA9PT0gXCJzdHJpbmdcIikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzd2l0Y2ggKG5vZGUub3BlcmF0b3IpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCIrXCI6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gbGVmdCArIHJpZ2h0O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBzd2l0Y2ggKG5vZGUub3BlcmF0b3IpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcIj09XCI6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSBsZWZ0ID09IHJpZ2h0O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCIhPVwiOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gbGVmdCAhPSByaWdodDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwiPFwiOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gbGVmdCA8IHJpZ2h0O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCI8PVwiOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gbGVmdCA8PSByaWdodDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwiPlwiOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gbGVmdCA+IHJpZ2h0O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCI+PVwiOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gbGVmdCA+PSByaWdodDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gVGhpcyBzaG91bGQgbmV2ZXIgaGFwcGVuXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBub2Rlc0NvcHkuc3BsaWNlKGkgLSAxLCAzLCBuZXcgTGl0ZXJhbE5vZGUocmVzdWx0KSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGktLTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBpKys7XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gbm9kZXNDb3B5WzBdLmV2YWx1YXRlKGNvbnRleHQpO1xyXG4gICAgfVxyXG59XHJcblxyXG5jbGFzcyBJZGVudGlmaWVyTm9kZSBleHRlbmRzIEV2YWx1YXRpb25Ob2RlIHtcclxuICAgIGlkZW50aWZpZXI6IHN0cmluZztcclxuXHJcbiAgICBldmFsdWF0ZShjb250ZXh0OiBFdmFsdWF0aW9uQ29udGV4dCk6IExpdGVyYWxWYWx1ZSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuaWRlbnRpZmllcjtcclxuICAgIH1cclxufVxyXG5cclxuY2xhc3MgSW5kZXhlck5vZGUgZXh0ZW5kcyBFdmFsdWF0aW9uTm9kZSB7XHJcbiAgICBpbmRleDogRXhwcmVzc2lvbk5vZGU7XHJcblxyXG4gICAgZXZhbHVhdGUoY29udGV4dDogRXZhbHVhdGlvbkNvbnRleHQpOiBMaXRlcmFsVmFsdWUge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmluZGV4LmV2YWx1YXRlKGNvbnRleHQpO1xyXG4gICAgfVxyXG59XHJcblxyXG5jbGFzcyBGdW5jdGlvbkNhbGxOb2RlIGV4dGVuZHMgRXZhbHVhdGlvbk5vZGUge1xyXG4gICAgZnVuY3Rpb25OYW1lOiBzdHJpbmcgPSBudWxsO1xyXG4gICAgcGFyYW1ldGVyczogQXJyYXk8RXhwcmVzc2lvbk5vZGU+ID0gW107XHJcblxyXG4gICAgZXZhbHVhdGUoY29udGV4dDogRXZhbHVhdGlvbkNvbnRleHQpOiBMaXRlcmFsVmFsdWUge1xyXG4gICAgICAgIGxldCBjYWxsYmFjayA9IGNvbnRleHQuZ2V0RnVuY3Rpb24odGhpcy5mdW5jdGlvbk5hbWUpO1xyXG5cclxuICAgICAgICBpZiAoY2FsbGJhY2sgIT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgIGxldCBldmFsdWF0ZWRQYXJhbXMgPSBbXTtcclxuXHJcbiAgICAgICAgICAgIGZvciAobGV0IHBhcmFtIG9mIHRoaXMucGFyYW1ldGVycykge1xyXG4gICAgICAgICAgICAgICAgZXZhbHVhdGVkUGFyYW1zLnB1c2gocGFyYW0uZXZhbHVhdGUoY29udGV4dCkpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gY2FsbGJhY2soLi4uZXZhbHVhdGVkUGFyYW1zKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIlVuZGVmaW5lZCBmdW5jdGlvbjogXCIgKyB0aGlzLmZ1bmN0aW9uTmFtZSk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmNsYXNzIExpdGVyYWxOb2RlIGV4dGVuZHMgRXZhbHVhdGlvbk5vZGUge1xyXG4gICAgY29uc3RydWN0b3IocmVhZG9ubHkgdmFsdWU6IExpdGVyYWxWYWx1ZSkge1xyXG4gICAgICAgIHN1cGVyKCk7XHJcbiAgICB9XHJcblxyXG4gICAgZXZhbHVhdGUoY29udGV4dDogRXZhbHVhdGlvbkNvbnRleHQpOiBMaXRlcmFsVmFsdWUge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnZhbHVlO1xyXG4gICAgfVxyXG59XHJcblxyXG5jbGFzcyBPcGVyYXRvck5vZGUgZXh0ZW5kcyBFdmFsdWF0aW9uTm9kZSB7XHJcbiAgICBjb25zdHJ1Y3RvcihyZWFkb25seSBvcGVyYXRvcjogVG9rZW5UeXBlKSB7XHJcbiAgICAgICAgc3VwZXIoKTtcclxuICAgIH1cclxuXHJcbiAgICBldmFsdWF0ZShjb250ZXh0OiBFdmFsdWF0aW9uQ29udGV4dCk6IExpdGVyYWxWYWx1ZSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQW4gb3BlcmF0b3IgY2Fubm90IGJlIGV2YWx1YXRlZCBvbiBpdHMgb3duLlwiKTtcclxuICAgIH1cclxufVxyXG5cclxudHlwZSBQYXRoUGFydCA9IEV4cHJlc3Npb25Ob2RlIHwgSWRlbnRpZmllck5vZGUgfCBJbmRleGVyTm9kZSB8IEZ1bmN0aW9uQ2FsbE5vZGU7XHJcblxyXG5jbGFzcyBQYXRoTm9kZSBleHRlbmRzIEV2YWx1YXRpb25Ob2RlIHtcclxuICAgIHBhcnRzOiBQYXRoUGFydFtdID0gW107XHJcblxyXG4gICAgZXZhbHVhdGUoY29udGV4dDogRXZhbHVhdGlvbkNvbnRleHQpOiBMaXRlcmFsVmFsdWUge1xyXG4gICAgICAgIGxldCByZXN1bHQ6IGFueSA9IHVuZGVmaW5lZDtcclxuICAgICAgICBsZXQgaW5kZXggPSAwO1xyXG5cclxuICAgICAgICB3aGlsZSAoaW5kZXggPCB0aGlzLnBhcnRzLmxlbmd0aCkge1xyXG4gICAgICAgICAgICBsZXQgcGFydCA9IHRoaXMucGFydHNbaW5kZXhdO1xyXG5cclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIGlmIChwYXJ0IGluc3RhbmNlb2YgSWRlbnRpZmllck5vZGUgJiYgaW5kZXggPT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHN3aXRjaCAocGFydC5pZGVudGlmaWVyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCIkcm9vdFwiOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gY29udGV4dC4kcm9vdDtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcIiRkYXRhXCI6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSBjb250ZXh0LmN1cnJlbnREYXRhQ29udGV4dDtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcIiRpbmRleFwiOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gY29udGV4dC4kaW5kZXg7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSBjb250ZXh0LmN1cnJlbnREYXRhQ29udGV4dFtwYXJ0LmlkZW50aWZpZXJdO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBwYXJ0VmFsdWUgPSBwYXJ0LmV2YWx1YXRlKGNvbnRleHQpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoaW5kZXggPT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSBwYXJ0VmFsdWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSB0eXBlb2YgcGFydFZhbHVlICE9PSBcImJvb2xlYW5cIiA/IHJlc3VsdFtwYXJ0VmFsdWVdIDogcmVzdWx0W3BhcnRWYWx1ZS50b1N0cmluZygpXTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGluZGV4Kys7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgRXhwcmVzc2lvblBhcnNlciB7XHJcbiAgICBwcml2YXRlIF9pbmRleDogbnVtYmVyID0gMDtcclxuICAgIHByaXZhdGUgX3Rva2VuczogVG9rZW5bXTtcclxuXHJcbiAgICBwcml2YXRlIHVuZXhwZWN0ZWRUb2tlbigpIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJVbmV4cGVjdGVkIHRva2VuIFwiICsgdGhpcy5jdXJyZW50LnZhbHVlICsgXCIgYXQgcG9zaXRpb24gXCIgKyB0aGlzLmN1cnJlbnQub3JpZ2luYWxQb3NpdGlvbiArIFwiLlwiKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHVuZXhwZWN0ZWRFb2UoKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVW5leHBlY3RlZCBlbmQgb2YgZXhwcmVzc2lvbi5cIik7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBtb3ZlTmV4dCgpIHtcclxuICAgICAgICB0aGlzLl9pbmRleCsrO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgcGFyc2VUb2tlbiguLi5leHBlY3RlZFRva2VuVHlwZXM6IFRva2VuVHlwZVtdKTogVG9rZW4ge1xyXG4gICAgICAgIGlmICh0aGlzLmVvZSkge1xyXG4gICAgICAgICAgICB0aGlzLnVuZXhwZWN0ZWRFb2UoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCBjdXJyZW50VG9rZW4gPSB0aGlzLmN1cnJlbnQ7XHJcblxyXG4gICAgICAgIGlmIChleHBlY3RlZFRva2VuVHlwZXMuaW5kZXhPZih0aGlzLmN1cnJlbnQudHlwZSkgPCAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMudW5leHBlY3RlZFRva2VuKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLm1vdmVOZXh0KCk7XHJcblxyXG4gICAgICAgIHJldHVybiBjdXJyZW50VG9rZW47XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBwYXJzZU9wdGlvbmFsVG9rZW4oLi4uZXhwZWN0ZWRUb2tlblR5cGVzOiBUb2tlblR5cGVbXSk6IGJvb2xlYW4ge1xyXG4gICAgICAgIGlmICh0aGlzLmVvZSkge1xyXG4gICAgICAgICAgICB0aGlzLnVuZXhwZWN0ZWRFb2UoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAoZXhwZWN0ZWRUb2tlblR5cGVzLmluZGV4T2YodGhpcy5jdXJyZW50LnR5cGUpIDwgMCkge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLm1vdmVOZXh0KCk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBwYXJzZUZ1bmN0aW9uQ2FsbChmdW5jdGlvbk5hbWU6IHN0cmluZyk6IEZ1bmN0aW9uQ2FsbE5vZGUge1xyXG4gICAgICAgIGxldCByZXN1bHQgPSBuZXcgRnVuY3Rpb25DYWxsTm9kZSgpO1xyXG4gICAgICAgIHJlc3VsdC5mdW5jdGlvbk5hbWUgPSBmdW5jdGlvbk5hbWU7XHJcblxyXG4gICAgICAgIHRoaXMucGFyc2VUb2tlbihcIihcIik7XHJcblxyXG4gICAgICAgIGxldCBmaXJzdFBhcmFtZXRlciA9IHRoaXMucGFyc2VFeHByZXNzaW9uKCk7XHJcbiAgICAgICAgbGV0IG1vcmVQYXJhbWV0ZXJzOiBib29sZWFuID0gZmFsc2U7XHJcblxyXG4gICAgICAgIGlmIChmaXJzdFBhcmFtZXRlcikge1xyXG4gICAgICAgICAgICByZXN1bHQucGFyYW1ldGVycy5wdXNoKGZpcnN0UGFyYW1ldGVyKTtcclxuXHJcbiAgICAgICAgICAgIGRvIHtcclxuICAgICAgICAgICAgICAgIG1vcmVQYXJhbWV0ZXJzID0gdGhpcy5wYXJzZU9wdGlvbmFsVG9rZW4oXCIsXCIpO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChtb3JlUGFyYW1ldGVycykge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBwYXJhbWV0ZXIgPSB0aGlzLnBhcnNlRXhwcmVzc2lvbigpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICByZXN1bHQucGFyYW1ldGVycy5wdXNoKHBhcmFtZXRlcik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gd2hpbGUgKG1vcmVQYXJhbWV0ZXJzKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMucGFyc2VUb2tlbihcIilcIik7XHJcblxyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBwYXJzZUlkZW50aWZpZXIoKTogSWRlbnRpZmllck5vZGUge1xyXG4gICAgICAgIGxldCByZXN1bHQgPSBuZXcgSWRlbnRpZmllck5vZGUoKTtcclxuXHJcbiAgICAgICAgcmVzdWx0LmlkZW50aWZpZXIgPSB0aGlzLmN1cnJlbnQudmFsdWU7XHJcblxyXG4gICAgICAgIHRoaXMubW92ZU5leHQoKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHBhcnNlSW5kZXhlcigpOiBJbmRleGVyTm9kZSB7XHJcbiAgICAgICAgbGV0IHJlc3VsdCA9IG5ldyBJbmRleGVyTm9kZSgpO1xyXG5cclxuICAgICAgICB0aGlzLnBhcnNlVG9rZW4oXCJbXCIpO1xyXG5cclxuICAgICAgICByZXN1bHQuaW5kZXggPSB0aGlzLnBhcnNlRXhwcmVzc2lvbigpO1xyXG5cclxuICAgICAgICB0aGlzLnBhcnNlVG9rZW4oXCJdXCIpO1xyXG5cclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgcGFyc2VQYXRoKCk6IFBhdGhOb2RlIHtcclxuICAgICAgICBsZXQgcmVzdWx0ID0gbmV3IFBhdGhOb2RlKCk7XHJcblxyXG4gICAgICAgIGxldCBleHBlY3RlZE5leHRUb2tlblR5cGVzOiBUb2tlblR5cGVbXSA9IFtcImlkZW50aWZpZXJcIiwgXCIoXCJdO1xyXG5cclxuICAgICAgICB3aGlsZSAoIXRoaXMuZW9lKSB7XHJcbiAgICAgICAgICAgIGlmIChleHBlY3RlZE5leHRUb2tlblR5cGVzLmluZGV4T2YodGhpcy5jdXJyZW50LnR5cGUpIDwgMCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgc3dpdGNoICh0aGlzLmN1cnJlbnQudHlwZSkge1xyXG4gICAgICAgICAgICAgICAgY2FzZSBcIihcIjpcclxuICAgICAgICAgICAgICAgICAgICBpZiAocmVzdWx0LnBhcnRzLmxlbmd0aCA9PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubW92ZU5leHQoKTtcclxuICAgIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQucGFydHMucHVzaCh0aGlzLnBhcnNlRXhwcmVzc2lvbigpKTtcclxuICAgIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcnNlVG9rZW4oXCIpXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGZ1bmN0aW9uTmFtZTogc3RyaW5nID0gXCJcIjtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAobGV0IHBhcnQgb2YgcmVzdWx0LnBhcnRzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIShwYXJ0IGluc3RhbmNlb2YgSWRlbnRpZmllck5vZGUpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy51bmV4cGVjdGVkVG9rZW4oKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZnVuY3Rpb25OYW1lICE9IFwiXCIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbk5hbWUgKz0gXCIuXCI7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb25OYW1lICs9ICg8SWRlbnRpZmllck5vZGU+cGFydCkuaWRlbnRpZmllcjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0LnBhcnRzID0gW107XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQucGFydHMucHVzaCh0aGlzLnBhcnNlRnVuY3Rpb25DYWxsKGZ1bmN0aW9uTmFtZSkpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgZXhwZWN0ZWROZXh0VG9rZW5UeXBlcyA9IFtcIi5cIiwgXCJbXCJdO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgXCJbXCI6XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0LnBhcnRzLnB1c2godGhpcy5wYXJzZUluZGV4ZXIoKSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGV4cGVjdGVkTmV4dFRva2VuVHlwZXMgPSBbXCIuXCIsIFwiKFwiLCBcIltcIl07XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSBcImlkZW50aWZpZXJcIjpcclxuICAgICAgICAgICAgICAgICAgICByZXN1bHQucGFydHMucHVzaCh0aGlzLnBhcnNlSWRlbnRpZmllcigpKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgZXhwZWN0ZWROZXh0VG9rZW5UeXBlcyA9IFtcIi5cIiwgXCIoXCIsIFwiW1wiXTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIFwiLlwiOlxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubW92ZU5leHQoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgZXhwZWN0ZWROZXh0VG9rZW5UeXBlcyA9IFtcImlkZW50aWZpZXJcIl07XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgICAgICBleHBlY3RlZE5leHRUb2tlblR5cGVzID0gW107XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgcGFyc2VFeHByZXNzaW9uKCk6IEV4cHJlc3Npb25Ob2RlIHtcclxuICAgICAgICBsZXQgcmVzdWx0OiBFeHByZXNzaW9uTm9kZSA9IG5ldyBFeHByZXNzaW9uTm9kZSgpO1xyXG5cclxuICAgICAgICBsZXQgZXhwZWN0ZWROZXh0VG9rZW5UeXBlczogVG9rZW5UeXBlW10gPSBsaXRlcmFscy5jb25jYXQoXCIoXCIsIFwiK1wiLCBcIi1cIik7XHJcblxyXG4gICAgICAgIHdoaWxlICghdGhpcy5lb2UpIHtcclxuICAgICAgICAgICAgaWYgKGV4cGVjdGVkTmV4dFRva2VuVHlwZXMuaW5kZXhPZih0aGlzLmN1cnJlbnQudHlwZSkgPCAwKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAocmVzdWx0Lm5vZGVzLmxlbmd0aCA9PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy51bmV4cGVjdGVkVG9rZW4oKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBzd2l0Y2ggKHRoaXMuY3VycmVudC50eXBlKSB7XHJcbiAgICAgICAgICAgICAgICBjYXNlIFwiKFwiOlxyXG4gICAgICAgICAgICAgICAgY2FzZSBcImlkZW50aWZpZXJcIjpcclxuICAgICAgICAgICAgICAgICAgICByZXN1bHQubm9kZXMucHVzaCh0aGlzLnBhcnNlUGF0aCgpKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgZXhwZWN0ZWROZXh0VG9rZW5UeXBlcyA9IG9yZGVyZWRPcGVyYXRvcnM7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSBcInN0cmluZ1wiOlxyXG4gICAgICAgICAgICAgICAgY2FzZSBcIm51bWJlclwiOlxyXG4gICAgICAgICAgICAgICAgY2FzZSBcImJvb2xlYW5cIjpcclxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5jdXJyZW50LnR5cGUgPT0gXCJzdHJpbmdcIikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQubm9kZXMucHVzaChuZXcgTGl0ZXJhbE5vZGUodGhpcy5jdXJyZW50LnZhbHVlKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKHRoaXMuY3VycmVudC50eXBlID09IFwibnVtYmVyXCIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0Lm5vZGVzLnB1c2gobmV3IExpdGVyYWxOb2RlKHBhcnNlRmxvYXQodGhpcy5jdXJyZW50LnZhbHVlKSkpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0Lm5vZGVzLnB1c2gobmV3IExpdGVyYWxOb2RlKHRoaXMuY3VycmVudC52YWx1ZSA9PT0gXCJ0cnVlXCIpKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubW92ZU5leHQoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgZXhwZWN0ZWROZXh0VG9rZW5UeXBlcyA9IG9yZGVyZWRPcGVyYXRvcnM7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSBcIi1cIjpcclxuICAgICAgICAgICAgICAgICAgICBpZiAocmVzdWx0Lm5vZGVzLmxlbmd0aCA9PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdC5ub2Rlcy5wdXNoKG5ldyBMaXRlcmFsTm9kZSgtMSkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQubm9kZXMucHVzaChuZXcgT3BlcmF0b3JOb2RlKFwiKlwiKSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBleHBlY3RlZE5leHRUb2tlblR5cGVzID0gW1wiaWRlbnRpZmllclwiLCBcIm51bWJlclwiLCBcIihcIl07XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQubm9kZXMucHVzaChuZXcgT3BlcmF0b3JOb2RlKHRoaXMuY3VycmVudC50eXBlKSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBleHBlY3RlZE5leHRUb2tlblR5cGVzID0gbGl0ZXJhbHMuY29uY2F0KFwiKFwiKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubW92ZU5leHQoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIFwiK1wiOlxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChyZXN1bHQubm9kZXMubGVuZ3RoID09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZXhwZWN0ZWROZXh0VG9rZW5UeXBlcyA9IGxpdGVyYWxzLmNvbmNhdChcIihcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQubm9kZXMucHVzaChuZXcgT3BlcmF0b3JOb2RlKHRoaXMuY3VycmVudC50eXBlKSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBleHBlY3RlZE5leHRUb2tlblR5cGVzID0gbGl0ZXJhbHMuY29uY2F0KFwiKFwiKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubW92ZU5leHQoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIFwiKlwiOlxyXG4gICAgICAgICAgICAgICAgY2FzZSBcIi9cIjpcclxuICAgICAgICAgICAgICAgIGNhc2UgXCI9PVwiOlxyXG4gICAgICAgICAgICAgICAgY2FzZSBcIiE9XCI6XHJcbiAgICAgICAgICAgICAgICBjYXNlIFwiPFwiOlxyXG4gICAgICAgICAgICAgICAgY2FzZSBcIjw9XCI6XHJcbiAgICAgICAgICAgICAgICBjYXNlIFwiPlwiOlxyXG4gICAgICAgICAgICAgICAgY2FzZSBcIj49XCI6XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0Lm5vZGVzLnB1c2gobmV3IE9wZXJhdG9yTm9kZSh0aGlzLmN1cnJlbnQudHlwZSkpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB0aGlzLm1vdmVOZXh0KCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGV4cGVjdGVkTmV4dFRva2VuVHlwZXMgPSBsaXRlcmFscy5jb25jYXQoXCIoXCIpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAgICAgZXhwZWN0ZWROZXh0VG9rZW5UeXBlcyA9IFtdO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGdldCBlb2UoKTogYm9vbGVhbiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2luZGV4ID49IHRoaXMuX3Rva2Vucy5sZW5ndGg7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBnZXQgY3VycmVudCgpOiBUb2tlbiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3Rva2Vuc1t0aGlzLl9pbmRleF07XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIHBhcnNlQmluZGluZyhiaW5kaW5nRXhwcmVzc2lvbjogc3RyaW5nKTogQmluZGluZyB7XHJcbiAgICAgICAgbGV0IHBhcnNlciA9IG5ldyBFeHByZXNzaW9uUGFyc2VyKFRva2VuaXplci5wYXJzZShiaW5kaW5nRXhwcmVzc2lvbikpO1xyXG4gICAgICAgIHBhcnNlci5wYXJzZVRva2VuKFwie1wiKTtcclxuXHJcbiAgICAgICAgbGV0IGFsbG93TnVsbCA9ICFwYXJzZXIucGFyc2VPcHRpb25hbFRva2VuKFwiPyNcIik7XHJcbiAgICAgICAgbGV0IGV4cHJlc3Npb24gPSBwYXJzZXIucGFyc2VFeHByZXNzaW9uKCk7XHJcblxyXG4gICAgICAgIHBhcnNlci5wYXJzZVRva2VuKFwifVwiKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIG5ldyBCaW5kaW5nKGV4cHJlc3Npb24sIGFsbG93TnVsbCk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3RydWN0b3IodG9rZW5zOiBUb2tlbltdKSB7XHJcbiAgICAgICAgdGhpcy5fdG9rZW5zID0gdG9rZW5zO1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgQmluZGluZyB7XHJcbiAgICBjb25zdHJ1Y3Rvcihwcml2YXRlIHJlYWRvbmx5IGV4cHJlc3Npb246IEV2YWx1YXRpb25Ob2RlLCByZWFkb25seSBhbGxvd051bGw6IGJvb2xlYW4gPSB0cnVlKSB7fVxyXG5cclxuICAgIGV2YWx1YXRlKGNvbnRleHQ6IEV2YWx1YXRpb25Db250ZXh0KTogTGl0ZXJhbFZhbHVlIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5leHByZXNzaW9uLmV2YWx1YXRlKGNvbnRleHQpO1xyXG4gICAgfVxyXG59IiwiLy8gQ29weXJpZ2h0IChjKSBNaWNyb3NvZnQgQ29ycG9yYXRpb24uIEFsbCByaWdodHMgcmVzZXJ2ZWQuXHJcbi8vIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgTGljZW5zZS5cclxuaW1wb3J0IHsgQmluZGluZywgRXhwcmVzc2lvblBhcnNlciwgRXZhbHVhdGlvbkNvbnRleHQgfSBmcm9tIFwiLi9leHByZXNzaW9uLXBhcnNlclwiO1xyXG5cclxuY2xhc3MgVGVtcGxhdGl6ZWRTdHJpbmcge1xyXG4gICAgcHJpdmF0ZSBfcGFydHM6IEFycmF5PHN0cmluZyB8IEJpbmRpbmc+ID0gW107XHJcblxyXG4gICAgc3RhdGljIHBhcnNlKHM6IHN0cmluZyk6IHN0cmluZyB8IFRlbXBsYXRpemVkU3RyaW5nIHtcclxuICAgICAgICBsZXQgcmVzdWx0ID0gbmV3IFRlbXBsYXRpemVkU3RyaW5nKCk7XHJcbiAgICAgICAgbGV0IGkgPSAwO1xyXG5cclxuICAgICAgICBkbyB7XHJcbiAgICAgICAgICAgIGxldCBleHByZXNzaW9uRm91bmQgPSBmYWxzZTtcclxuICAgICAgICAgICAgbGV0IHN0YXJ0ID0gaTtcclxuICAgICAgICAgICAgbGV0IGxvb3A7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBkbyB7XHJcbiAgICAgICAgICAgICAgICBsb29wID0gZmFsc2U7XHJcblxyXG4gICAgICAgICAgICAgICAgc3RhcnQgPSBzLmluZGV4T2YoXCJ7XCIsIHN0YXJ0KTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoc3RhcnQgPj0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChzdGFydCArIDEgPCBzLmxlbmd0aCAmJiBzW3N0YXJ0ICsgMV0gPT0gXCJ7XCIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnQgKz0gMjtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvb3AgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSB3aGlsZSAobG9vcCk7XHJcblxyXG4gICAgICAgICAgICBpZiAoc3RhcnQgPj0gMCkge1xyXG4gICAgICAgICAgICAgICAgbGV0IGVuZCA9IHMuaW5kZXhPZihcIn1cIiwgc3RhcnQpO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChlbmQgPj0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGV4cHJlc3Npb25Gb3VuZCA9IHRydWU7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChzdGFydCA+IGkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0Ll9wYXJ0cy5wdXNoKHMuc3Vic3RyaW5nKGksIHN0YXJ0KSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBsZXQgYmluZG5nRXhwcmVzc2lvbiA9IHMuc3Vic3RyaW5nKHN0YXJ0LCBlbmQgKyAxKTtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgcGFydDogc3RyaW5nIHwgQmluZGluZztcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGFydCA9IEV4cHJlc3Npb25QYXJzZXIucGFyc2VCaW5kaW5nKGJpbmRuZ0V4cHJlc3Npb24pO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJ0ID0gYmluZG5nRXhwcmVzc2lvbjtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdC5fcGFydHMucHVzaChwYXJ0KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaSA9IGVuZCArIDE7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICghZXhwcmVzc2lvbkZvdW5kKSB7XHJcbiAgICAgICAgICAgICAgICByZXN1bHQuX3BhcnRzLnB1c2gocy5zdWJzdHIoaSkpO1xyXG5cclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSB3aGlsZSAoaSA8IHMubGVuZ3RoKTtcclxuXHJcbiAgICAgICAgaWYgKHJlc3VsdC5fcGFydHMubGVuZ3RoID09IDEgJiYgdHlwZW9mIHJlc3VsdC5fcGFydHNbMF0gPT09IFwic3RyaW5nXCIpIHtcclxuICAgICAgICAgICAgcmV0dXJuIDxzdHJpbmc+cmVzdWx0Ll9wYXJ0c1swXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX3Nob3VsZERyb3BPd25lcjogYm9vbGVhbiA9IGZhbHNlO1xyXG5cclxuICAgIHByaXZhdGUgZXZhbEV4cHJlc3Npb24oYmluZGluZ0V4cHJlc3Npb246IEJpbmRpbmcsIGNvbnRleHQ6IEV2YWx1YXRpb25Db250ZXh0KTogYW55IHtcclxuICAgICAgICBsZXQgcmVzdWx0ID0gYmluZGluZ0V4cHJlc3Npb24uZXZhbHVhdGUoY29udGV4dCk7XHJcblxyXG4gICAgICAgIGlmIChyZXN1bHQgPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3Nob3VsZERyb3BPd25lciA9IHRoaXMuX3Nob3VsZERyb3BPd25lciB8fCAhYmluZGluZ0V4cHJlc3Npb24uYWxsb3dOdWxsO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGludGVybmFsRXZhbHVhdGUoY29udGV4dDogRXZhbHVhdGlvbkNvbnRleHQpOiBhbnkge1xyXG4gICAgICAgIGlmICh0aGlzLl9wYXJ0cy5sZW5ndGggPT0gMCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICh0aGlzLl9wYXJ0cy5sZW5ndGggPT0gMSkge1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIHRoaXMuX3BhcnRzWzBdID09PSBcInN0cmluZ1wiKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fcGFydHNbMF07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5ldmFsRXhwcmVzc2lvbig8QmluZGluZz50aGlzLl9wYXJ0c1swXSwgY29udGV4dCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGxldCBzID0gXCJcIjtcclxuXHJcbiAgICAgICAgICAgIGZvciAobGV0IHBhcnQgb2YgdGhpcy5fcGFydHMpIHtcclxuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgcGFydCA9PT0gXCJzdHJpbmdcIikge1xyXG4gICAgICAgICAgICAgICAgICAgIHMgKz0gcGFydDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHMgKz0gdGhpcy5ldmFsRXhwcmVzc2lvbig8QmluZGluZz5wYXJ0LCBjb250ZXh0KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHM7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGV2YWx1YXRlKGNvbnRleHQ6IEV2YWx1YXRpb25Db250ZXh0KTogYW55IHtcclxuICAgICAgICB0aGlzLl9zaG91bGREcm9wT3duZXIgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHRoaXMuaW50ZXJuYWxFdmFsdWF0ZShjb250ZXh0KTtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgc2hvdWxkRHJvcE93bmVyKCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9zaG91bGREcm9wT3duZXI7XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBUZW1wbGF0ZSB7XHJcbiAgICBwcml2YXRlIHN0YXRpYyBwcmVwYXJlKG5vZGU6IGFueSk6IGFueSB7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBub2RlID09PSBcInN0cmluZ1wiKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBUZW1wbGF0aXplZFN0cmluZy5wYXJzZShub2RlKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAodHlwZW9mIG5vZGUgPT09IFwib2JqZWN0XCIgJiYgbm9kZSAhPSBudWxsKSB7XHJcbiAgICAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KG5vZGUpKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgcmVzdWx0OiBhbnlbXSA9IFtdO1xyXG5cclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGl0ZW0gb2Ygbm9kZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdC5wdXNoKFRlbXBsYXRlLnByZXBhcmUoaXRlbSkpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBsZXQga2V5cyA9IE9iamVjdC5rZXlzKG5vZGUpO1xyXG4gICAgICAgICAgICAgICAgbGV0IHJlc3VsdCA9IHt9O1xyXG5cclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGtleSBvZiBrZXlzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0W2tleV0gPSBUZW1wbGF0ZS5wcmVwYXJlKG5vZGVba2V5XSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIG5vZGU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2NvbnRleHQ6IEV2YWx1YXRpb25Db250ZXh0O1xyXG5cclxuICAgIHByaXZhdGUgZXhwYW5kU2luZ2xlT2JqZWN0KG5vZGU6IG9iamVjdCk6IGFueSB7XHJcbiAgICAgICAgbGV0IHJlc3VsdCA9IHt9O1xyXG4gICAgICAgIGxldCBrZXlzID0gT2JqZWN0LmtleXMobm9kZSk7XHJcblxyXG4gICAgICAgIGZvciAobGV0IGtleSBvZiBrZXlzKSB7XHJcbiAgICAgICAgICAgIGlmICghdGhpcy5fY29udGV4dC5pc1Jlc2VydmVkRmllbGQoa2V5KSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IHZhbHVlID0gdGhpcy5pbnRlcm5hbEV4cGFuZChub2RlW2tleV0pO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmICh2YWx1ZSAhPSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXN1bHRba2V5XSA9IHZhbHVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgaW50ZXJuYWxFeHBhbmQobm9kZTogYW55KTogYW55IHtcclxuICAgICAgICBsZXQgcmVzdWx0OiBhbnk7XHJcblxyXG4gICAgICAgIHRoaXMuX2NvbnRleHQuc2F2ZVN0YXRlKCk7XHJcblxyXG4gICAgICAgIGlmIChBcnJheS5pc0FycmF5KG5vZGUpKSB7XHJcbiAgICAgICAgICAgIGxldCBpdGVtQXJyYXk6IGFueVtdID0gW107XHJcblxyXG4gICAgICAgICAgICBmb3IgKGxldCBpdGVtIG9mIG5vZGUpIHtcclxuICAgICAgICAgICAgICAgIGxldCBleHBhbmRlZEl0ZW0gPSB0aGlzLmludGVybmFsRXhwYW5kKGl0ZW0pO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChleHBhbmRlZEl0ZW0gIT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KGV4cGFuZGVkSXRlbSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaXRlbUFycmF5ID0gaXRlbUFycmF5LmNvbmNhdChleHBhbmRlZEl0ZW0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaXRlbUFycmF5LnB1c2goZXhwYW5kZWRJdGVtKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJlc3VsdCA9IGl0ZW1BcnJheTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAobm9kZSBpbnN0YW5jZW9mIFRlbXBsYXRpemVkU3RyaW5nKSB7XHJcbiAgICAgICAgICAgIHJlc3VsdCA9IG5vZGUuZXZhbHVhdGUodGhpcy5fY29udGV4dCk7XHJcblxyXG4gICAgICAgICAgICBpZiAobm9kZS5zaG91bGREcm9wT3duZXIpIHtcclxuICAgICAgICAgICAgICAgIHJlc3VsdCA9IG51bGw7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAodHlwZW9mIG5vZGUgPT09IFwib2JqZWN0XCIgJiYgbm9kZSAhPSBudWxsKSB7XHJcbiAgICAgICAgICAgIGxldCBkcm9wT2JqZWN0ID0gZmFsc2U7XHJcbiAgICAgICAgICAgIGxldCB3aGVuID0gbm9kZVtcIiR3aGVuXCJdO1xyXG5cclxuICAgICAgICAgICAgaWYgKHdoZW4gaW5zdGFuY2VvZiBUZW1wbGF0aXplZFN0cmluZykge1xyXG4gICAgICAgICAgICAgICAgbGV0IHdoZW5WYWx1ZSA9IHdoZW4uZXZhbHVhdGUodGhpcy5fY29udGV4dCk7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiB3aGVuVmFsdWUgPT09IFwiYm9vbGVhblwiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZHJvcE9iamVjdCA9ICF3aGVuVmFsdWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICghZHJvcE9iamVjdCkge1xyXG4gICAgICAgICAgICAgICAgbGV0IGRhdGFDb250ZXh0ID0gbm9kZVtcIiRkYXRhXCJdO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChkYXRhQ29udGV4dCAhPSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoZGF0YUNvbnRleHQgaW5zdGFuY2VvZiBUZW1wbGF0aXplZFN0cmluZykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhQ29udGV4dCA9IGRhdGFDb250ZXh0LmV2YWx1YXRlKHRoaXMuX2NvbnRleHQpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkoZGF0YUNvbnRleHQpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IFtdO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBkYXRhQ29udGV4dC5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fY29udGV4dC4kZGF0YSA9IGRhdGFDb250ZXh0W2ldO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fY29udGV4dC4kaW5kZXggPSBpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBleHBhbmRlZE9iamVjdCA9IHRoaXMuZXhwYW5kU2luZ2xlT2JqZWN0KG5vZGUpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChleHBhbmRlZE9iamVjdCAhPSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0LnB1c2goZXhwYW5kZWRPYmplY3QpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9jb250ZXh0LiRkYXRhID0gZGF0YUNvbnRleHQ7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSB0aGlzLmV4cGFuZFNpbmdsZU9iamVjdChub2RlKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSB0aGlzLmV4cGFuZFNpbmdsZU9iamVjdChub2RlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJlc3VsdCA9IG51bGw7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHJlc3VsdCA9IG5vZGU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLl9jb250ZXh0LnJlc3RvcmVMYXN0U3RhdGUoKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgIH1cclxuXHJcbiAgICBwcmVwYXJlZFBheWxvYWQ6IGFueTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihwYXlsb2FkOiBhbnkpIHtcclxuICAgICAgICB0aGlzLnByZXBhcmVkUGF5bG9hZCA9IFRlbXBsYXRlLnByZXBhcmUocGF5bG9hZCk7XHJcbiAgICB9XHJcblxyXG4gICAgZXhwYW5kKGNvbnRleHQ6IEV2YWx1YXRpb25Db250ZXh0KTogYW55IHtcclxuICAgICAgICB0aGlzLl9jb250ZXh0ID0gY29udGV4dDtcclxuXHJcbiAgICAgICAgcmV0dXJuIHRoaXMuaW50ZXJuYWxFeHBhbmQodGhpcy5wcmVwYXJlZFBheWxvYWQpO1xyXG4gICAgfVxyXG59Il0sInNvdXJjZVJvb3QiOiIifQ==
