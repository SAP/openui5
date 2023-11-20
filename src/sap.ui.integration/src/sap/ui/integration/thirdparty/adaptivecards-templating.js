(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("./adaptive-expressions"));
	else if(typeof sap.ui.define === 'function')
		sap.ui.define(["sap/ui/integration/thirdparty/adaptive-expressions"], factory);
	else if(typeof exports === 'object')
		exports["ACData"] = factory(require("./adaptive-expressions"));
	else
		root["ACData"] = factory(root["AEL"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_adaptive_expressions__) {
return /******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/adaptivecards-templating.ts":
/*!*****************************************!*\
  !*** ./src/adaptivecards-templating.ts ***!
  \*****************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
	if (k2 === undefined) k2 = k;
	Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
	if (k2 === undefined) k2 = k;
	o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
	for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
__exportStar(__webpack_require__(/*! ./template-engine */ "./src/template-engine.ts"), exports);
__exportStar(__webpack_require__(/*! ./json-schema-card */ "./src/json-schema-card.ts"), exports);


/***/ }),

/***/ "./src/json-schema-card.ts":
/*!*********************************!*\
  !*** ./src/json-schema-card.ts ***!
  \*********************************/
/***/ (function(__unused_webpack_module, exports) {


// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
	if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
		if (ar || !(i in from)) {
			if (!ar) ar = Array.prototype.slice.call(from, 0, i);
			ar[i] = from[i];
		}
	}
	return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.JSONSchemaCard = void 0;
// JSON Schema Card
// generates an Adaptive Card given a JSON schema
function JSONSchemaCard(schema) {
	try {
		return {
			type: "AdaptiveCard",
			body: [
				JSONSchemaCardObject(schema, '', 0),
			],
		};
	}
	catch (e) {
		console.error(e);
		return undefined;
	}
}
exports.JSONSchemaCard = JSONSchemaCard;
// JSON Schema Elements
function JSONSchemaCardElement(schema, path, depth) {
	if (typeof (schema) === "boolean")
		return null;
	switch (schema.type) {
		case "array":
			if (Array.isArray(schema.items)) {
				return JSONSchemaCardTuple(schema, path, depth);
			}
			else {
				return JSONSchemaCardList(schema, path, depth);
			}
		case "object":
			return JSONSchemaCardObject(schema, path, depth);
		case "boolean":
			return JSONSchemaCardBoolean(schema, path);
		case "integer":
		case "number":
			return JSONSchemaCardNumber(schema, path);
		case "string":
			if (schema.enum) {
				return JSONSchemaCardChoiceSet(schema, path);
			}
			else {
				return JSONSchemaCardText(schema, path);
			}
		case "date-time":
		case "time":
		case "date":
			return JSONSchemaCardTime(schema, path);
		default:
			return null;
	}
}
function encodeProperty(property) {
	return encodeURIComponent(property).replace('.', '%2e');
}
function textSizeAtDepth(depth) {
	switch (depth) {
		case 0:
			"large";
		case 1:
			"medium";
		default:
			"small";
	}
}
function JSONSchemaFieldTitle(schema, path, depth) {
	return [
		schema.title ? {
			type: "TextBlock",
			size: textSizeAtDepth(depth),
			text: schema.title,
		} : null,
		schema.description ? {
			type: "TextBlock",
			size: textSizeAtDepth(depth + 1),
			isSubtle: true,
			wrap: true,
			text: schema.description,
		} : null,
	];
}
function JSONSchemaCardTuple(schema, path, depth) {
	var _a, _b;
	if (!Array.isArray(schema.items))
		return null;
	return {
		type: "Container",
		items: __spreadArray(__spreadArray([], JSONSchemaFieldTitle(schema, path, depth), true), (_b = (_a = schema.items) === null || _a === void 0 ? void 0 : _a.map(function (item, idx) {
			return JSONSchemaCardElement(item, path + "[" + idx + "]", depth + 1);
		})) !== null && _b !== void 0 ? _b : [], true),
	};
}
function JSONSchemaCardList(schema, path, depth) {
	return {
		type: "Container",
		items: __spreadArray([], JSONSchemaFieldTitle(schema, path, depth), true),
	};
}
function JSONSchemaCardObject(schema, path, depth) {
	var _a, _b;
	return {
		type: "Container",
		items: __spreadArray(__spreadArray([], JSONSchemaFieldTitle(schema, path, depth), true), (_b = (_a = schema.required) === null || _a === void 0 ? void 0 : _a.map(function (property) {
			return JSONSchemaCardElement(schema.properties[property], path + "." + encodeProperty(property), depth + 1);
		})) !== null && _b !== void 0 ? _b : [], true),
	};
}
function JSONSchemaCardBoolean(schema, path) {
	return {
		type: "Input.Toggle",
		id: path,
		title: schema.title,
		label: schema.description,
		value: schema.default,
	};
}
function JSONSchemaCardNumber(schema, path) {
	var _a, _b;
	return {
		type: "Input.Number",
		id: path,
		title: schema.title,
		placeholder: schema.description,
		value: schema.default,
		min: (_a = schema.exclusiveMinimum) !== null && _a !== void 0 ? _a : schema.minimum,
		max: (_b = schema.exclusiveMaximum) !== null && _b !== void 0 ? _b : schema.maximum,
	};
}
function JSONSchemaCardChoiceSet(schema, path) {
	return {
		type: "Input.ChoiceSet",
		id: path,
		title: schema.title,
		choices: schema.enum.map(function (item) {
			return {
				title: item,
				value: item,
			};
		}),
		placeholder: schema.description,
		value: schema.default,
	};
}
function JSONSchemaCardText(schema, path) {
	return {
		type: "Input.Text",
		id: path,
		title: schema.title,
		placeholder: schema.description,
		value: schema.default,
		maxLength: schema.maxLength,
		regex: schema.pattern,
	};
}
function JSONSchemaCardTime(schema, path) {
	return {
		type: "Input.Time",
		id: path,
		title: schema.title,
		placeholder: schema.description,
		value: schema.default,
	};
}


/***/ }),

/***/ "./src/template-engine.ts":
/*!********************************!*\
  !*** ./src/template-engine.ts ***!
  \********************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Template = exports.GlobalSettings = void 0;
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

var AEL = __webpack_require__(/*! adaptive-expressions */ "adaptive-expressions");
var EvaluationContext = /** @class */ (function () {
	function EvaluationContext(context) {
		this._stateStack = [];
		if (context !== undefined) {
			this.$root = context.$root;
		}
	}
	EvaluationContext.prototype.isReservedField = function (name) {
		return EvaluationContext._reservedFields.indexOf(name) >= 0;
	};
	EvaluationContext.prototype.saveState = function () {
		this._stateStack.push({
			$data: this.$data,
			$index: this.$index
		});
	};
	EvaluationContext.prototype.restoreLastState = function () {
		if (this._stateStack.length === 0) {
			throw new Error("There is no evaluation context state to restore.");
		}
		var savedContext = this._stateStack.pop();
		this.$data = savedContext.$data;
		this.$index = savedContext.$index;
	};
	Object.defineProperty(EvaluationContext.prototype, "$data", {
		get: function () {
			return this._$data !== undefined ? this._$data : this.$root;
		},
		set: function (value) {
			this._$data = value;
		},
		enumerable: false,
		configurable: true
	});
	EvaluationContext._reservedFields = ["$data", "$when", "$root", "$index"];
	return EvaluationContext;
}());
var TemplateObjectMemory = /** @class */ (function () {
	function TemplateObjectMemory() {
		this._memory = new AEL.SimpleObjectMemory(this);
	}
	TemplateObjectMemory.prototype.getValue = function (path) {
		var actualPath = (path.length > 0 && path[0] !== "$") ? "$data." + path : path;
		return this._memory.getValue(actualPath);
	};
	TemplateObjectMemory.prototype.setValue = function (path, input) {
		this._memory.setValue(path, input);
	};
	TemplateObjectMemory.prototype.version = function () {
		return this._memory.version();
	};
	return TemplateObjectMemory;
}());
/**
 * Holds global settings that can be used to customize the way templates are expanded.
 */
var GlobalSettings = /** @class */ (function () {
	function GlobalSettings() {
	}
	/**
	 * Callback invoked when expression evaluation needs the value of a field in the source data object
	 * and that field is undefined or null. By default, expression evaluation will substitute an undefined
	 * field with its binding expression (e.g. `${field}`). This callback makes it possible to customize that
	 * behavior.
	 *
	 * **Example**
	 * Given this data object:
	 *
	 * ```json
	 * {
	 *     firstName: "David"
	 * }
	 * ```
	 *
	 * The expression `${firstName} ${lastName}` will evaluate to "David ${lastName}" because the `lastName`
	 * field is undefined.
	 *
	 * Now let's set the callback:
	 * ```typescript
	 * GlobalSettings.getUndefinedFieldValueSubstitutionString = (path: string) => { return "<undefined value>"; }
	 * ```
	 *
	 * With that, the above expression will evaluate to "David &lt;undefined value&gt;"
	 */
	GlobalSettings.getUndefinedFieldValueSubstitutionString = undefined;
	return GlobalSettings;
}());
exports.GlobalSettings = GlobalSettings;
/**
 * Represents a template that can be bound to data.
 */
var Template = /** @class */ (function () {
	/**
	 * Initializes a new Template instance based on the provided payload.
	 * Once created, the instance can be bound to different data objects
	 * in a loop.
	 *
	 * @param payload The template payload.
	 */
	function Template(payload) {
		this._preparedPayload = Template.prepare(payload);
	}
	Template.prepare = function (node) {
		if (typeof node === "string") {
			return Template.parseInterpolatedString(node);
		}
		else if (typeof node === "object" && node !== null) {
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
	Template.internalTryEvaluateExpression = function (expression, context, allowSubstitutions) {
		var memory = new TemplateObjectMemory();
		memory.$root = context.$root;
		memory.$data = context.$data;
		memory.$index = context.$index;
		var options = undefined;
		if (allowSubstitutions) {
			options = new AEL.Options();
			options.nullSubstitution = function (path) {
				var substitutionValue = undefined;
				if (GlobalSettings.getUndefinedFieldValueSubstitutionString) {
					substitutionValue = GlobalSettings.getUndefinedFieldValueSubstitutionString(path);
				}
				return substitutionValue ? substitutionValue : "${" + path + "}";
			};
		}
		// The root of an expression coming from an interpolated string is of type Concat.
		// In that case, and if the caller allows it, we're doing our own concatenation
		// in order to catch each individual expression evaluation error and substitute in
		// the final string
		if (expression.type === AEL.ExpressionType.Concat && allowSubstitutions) {
			var result = "";
			for (var _i = 0, _a = expression.children; _i < _a.length; _i++) {
				var childExpression = _a[_i];
				var evaluationResult = void 0;
				try {
					evaluationResult = childExpression.tryEvaluate(memory, options);
				}
				catch (ex) {
					// We'll swallow all exceptions here
					evaluationResult = {
						value: undefined,
						error: ex
					};
				}
				if (evaluationResult.error) {
					evaluationResult.value = "${" + childExpression.toString() + "}";
				}
				result += evaluationResult.value.toString();
			}
			return { value: result, error: undefined };
		}
		return expression.tryEvaluate(memory, options);
	};
	/**
	 * Parses an interpolated string into an Expression object ready to evaluate.
	 *
	 * @param interpolatedString The interpolated string to parse. Example: "Hello ${name}"
	 * @returns An Expression object if the provided interpolated string contained at least one expression (e.g. "${expression}"); the original string otherwise.
	 */
	Template.parseInterpolatedString = function (interpolatedString) {
		var lookup = function (type) {
			var standardFunction = AEL.ExpressionFunctions.standardFunctions.get(type);
			if (standardFunction) {
				return standardFunction;
			}
			else {
				return new AEL.ExpressionEvaluator(type, function (expression, state, options) { throw new Error("Unknown function " + type); }, AEL.ReturnType.String);
			}
		};
		// If there is at least one expression start marker, let's attempt to convert into an expression
		if (interpolatedString.indexOf("${") >= 0) {
			var parsedExpression = AEL.Expression.parse("`" + interpolatedString + "`", lookup);
			if (parsedExpression.type === "concat") {
				if (parsedExpression.children.length === 1 && !(parsedExpression.children[0] instanceof AEL.Constant)) {
					// The concat contains a single child that isn't a constant, thus the original
					// string was a single expression. When evaluated, we want it to produce the type
					// of that single expression
					return parsedExpression.children[0];
				}
				else if (parsedExpression.children.length === 2) {
					var firstChild = parsedExpression.children[0];
					if (firstChild instanceof AEL.Constant && firstChild.value === "" && !(parsedExpression.children[1] instanceof AEL.Constant)) {
						// The concat contains 2 children, and the first one is an empty string constant and the second isn't a constant.
						// From version 4.10.3, AEL always inserts an empty string constant in all concat expression. Thus the original
						// string was a single expression in this case as well. When evaluated, we want it to produce the type
						// of that single expression.
						return parsedExpression.children[1];
					}
				}
				// Otherwise, we want the expression to produce a string
				return parsedExpression;
			}
		}
		// If the original string didn't contain any expression, return i as is
		return interpolatedString;
	};
	/**
	 * Tries to evaluate the provided expression using the provided context.
	 *
	 * @param expression The expression to evaluate.
	 * @param context The context (data) used to evaluate the expression.
	 * @param allowSubstitutions Indicates if the expression evaluator should substitute undefined value with a default
	 *   string or the value returned by the GlobalSettings.getUndefinedFieldValueSubstitutionString callback.
	 * @returns An object representing the result of the evaluation. If the evaluation succeeded, the value property
	 *   contains the actual evaluation result, and the error property is undefined. If the evaluation fails, the error
	 *   property contains a message detailing the error that occurred.
	 */
	Template.tryEvaluateExpression = function (expression, context, allowSubstitutions) {
		return Template.internalTryEvaluateExpression(expression, new EvaluationContext(context), allowSubstitutions);
	};
	Template.prototype.expandSingleObject = function (node) {
		var result = {};
		var keys = Object.keys(node);
		for (var _i = 0, keys_2 = keys; _i < keys_2.length; _i++) {
			var key = keys_2[_i];
			if (!this._context.isReservedField(key)) {
				var value = this.internalExpand(node[key]);
				if (value !== undefined) {
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
				if (expandedItem !== null) {
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
		else if (node instanceof AEL.Expression) {
			var evaluationResult = Template.internalTryEvaluateExpression(node, this._context, true);
			if (!evaluationResult.error) {
				result = evaluationResult.value;
			}
			else {
				throw new Error(evaluationResult.error);
			}
		}
		else if (typeof node === "object" && node !== null) {
			var when = node["$when"];
			var dataContext = node["$data"];
			var dataContextIsArray = false;
			var dataContexts = void 0;
			if (dataContext === undefined) {
				dataContexts = [undefined];
			}
			else {
				if (dataContext instanceof AEL.Expression) {
					var evaluationResult = Template.internalTryEvaluateExpression(dataContext, this._context, true);
					if (!evaluationResult.error) {
						dataContext = evaluationResult.value;
					}
					else {
						throw new Error(evaluationResult.error);
					}
				}
				if (Array.isArray(dataContext)) {
					dataContexts = dataContext;
					dataContextIsArray = true;
				}
				else {
					dataContexts = [dataContext];
				}
			}
			result = [];
			for (var i = 0; i < dataContexts.length; i++) {
				if (dataContextIsArray) {
					this._context.$index = i;
				}
				if (dataContexts[i] !== undefined) {
					this._context.$data = dataContexts[i];
				}
				var dropObject = false;
				if (when instanceof AEL.Expression) {
					var evaluationResult = Template.internalTryEvaluateExpression(when, this._context, false);
					var whenValue = false;
					// If $when fails to evaluate or evaluates to anything but a boolean, consider it is false
					if (!evaluationResult.error) {
						whenValue = typeof evaluationResult.value === "boolean" && evaluationResult.value;
					}
					dropObject = !whenValue;
				}
				if (!dropObject) {
					var expandedObject = this.expandSingleObject(node);
					if (expandedObject !== null) {
						result.push(expandedObject);
					}
				}
			}
			if (result.length === 0) {
				result = null;
			}
			else if (result.length === 1) {
				result = result[0];
			}
		}
		else {
			result = node;
		}
		this._context.restoreLastState();
		return result;
	};
	/**
	 * Expands the template using the provided context. Template expansion involves
	 * evaluating the expressions used in the original template payload, as well as
	 * repeating (expanding) parts of that payload that are bound to arrays.
	 *
	 * Example:
	 *
	 * ```typescript
	 * let context = {
	 *     $root: {
	 *         firstName: "John",
	 *         lastName: "Doe",
	 *         children: [
	 *             { fullName: "Jane Doe", age: 9 },
	 *             { fullName: "Alex Doe", age: 12 }
	 *         ]
	 *     }
	 * }
	 *
	 * let templatePayload = {
	 *     type: "AdaptiveCard",
	 *     version: "1.2",
	 *     body: [
	 *         {
	 *             type: "TextBlock",
	 *             text: "${firstName} ${lastName}"
	 *         },
	 *         {
	 *             type: "TextBlock",
	 *             $data: "${children}",
	 *             text: "${fullName} (${age})"
	 *         }
	 *     ]
	 * }
	 *
	 * let template = new Template(templatePayload);
	 *
	 * let expandedTemplate = template.expand(context);
	 * ```
	 *
	 * With the above code, the value of `expandedTemplate` will be
	 *
	 * ```json
	 * {
	 *     type: "AdaptiveCard",
	 *     version: "1.2",
	 *     body: [
	 *         {
	 *             type: "TextBlock",
	 *             text: "John Doe"
	 *         },
	 *         {
	 *             type: "TextBlock",
	 *             text: "Jane Doe (9)"
	 *         },
	 *         {
	 *             type: "TextBlock",
	 *             text: "Alex Doe (12)"
	 *         }
	 *     ]
	 * }
	 * ```
	 *
	 * @param context The context to bind the template to.
	 * @returns A value representing the expanded template. The type of that value
	 *   is dependent on the type of the original template payload passed to the constructor.
	 */
	Template.prototype.expand = function (context) {
		this._context = new EvaluationContext(context);
		return this.internalExpand(this._preparedPayload);
	};
	return Template;
}());
exports.Template = Template;
/***/ }),

/***/ "adaptive-expressions":
/*!****************************************************************************************************!*\
  !*** external {"commonjs2":"adaptive-expressions","commonjs":"adaptive-expressions","root":"AEL"} ***!
  \****************************************************************************************************/
/***/ ((module) => {

module.exports = __WEBPACK_EXTERNAL_MODULE_adaptive_expressions__;

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/************************************************************************/
/******/
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__("./src/adaptivecards-templating.ts");
/******/
/******/ 	return __webpack_exports__;
/******/ })()
;
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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Q0FBQyxFQUFFO2dCQUMxQixNQUFNLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQ3RCO1NBQ0o7YUFDSTtZQUNELE1BQU0sR0FBRyxJQUFJLENBQUM7U0FDakI7UUFFRCxJQUFJLENBQUMsUUFBUSxDQUFDLGdCQUFnQixFQUFFLENBQUM7UUFFakMsT0FBTyxNQUFNLENBQUM7SUFDbEIsQ0FBQztJQWFEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7T0FrRUc7SUFDSCx5QkFBTSxHQUFOLFVBQU8sT0FBMkI7UUFDOUIsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLGlCQUFpQixDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBRS9DLE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztJQUN0RCxDQUFDO0lBQ0wsZUFBQztBQUFELENBbFhBLElBa1hDO0FBbFhZLDRCQUFROzs7Ozs7Ozs7OztBQzNIckIsa0U7Ozs7OztVQ0FBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7O1VBRUE7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7Ozs7VUV0QkE7VUFDQTtVQUNBO1VBQ0EiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9BQ0RhdGEvd2VicGFjay91bml2ZXJzYWxNb2R1bGVEZWZpbml0aW9uIiwid2VicGFjazovL0FDRGF0YS8uL3NyYy9hZGFwdGl2ZWNhcmRzLXRlbXBsYXRpbmcudHMiLCJ3ZWJwYWNrOi8vQUNEYXRhLy4vc3JjL2pzb24tc2NoZW1hLWNhcmQudHMiLCJ3ZWJwYWNrOi8vQUNEYXRhLy4vc3JjL3RlbXBsYXRlLWVuZ2luZS50cyIsIndlYnBhY2s6Ly9BQ0RhdGEvZXh0ZXJuYWwge1wiY29tbW9uanMyXCI6XCJhZGFwdGl2ZS1leHByZXNzaW9uc1wiLFwiY29tbW9uanNcIjpcImFkYXB0aXZlLWV4cHJlc3Npb25zXCIsXCJyb290XCI6XCJBRUxcIn0iLCJ3ZWJwYWNrOi8vQUNEYXRhL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL0FDRGF0YS93ZWJwYWNrL2JlZm9yZS1zdGFydHVwIiwid2VicGFjazovL0FDRGF0YS93ZWJwYWNrL3N0YXJ0dXAiLCJ3ZWJwYWNrOi8vQUNEYXRhL3dlYnBhY2svYWZ0ZXItc3RhcnR1cCJdLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gd2VicGFja1VuaXZlcnNhbE1vZHVsZURlZmluaXRpb24ocm9vdCwgZmFjdG9yeSkge1xuXHRpZih0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG1vZHVsZSA9PT0gJ29iamVjdCcpXG5cdFx0bW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KHJlcXVpcmUoXCJhZGFwdGl2ZS1leHByZXNzaW9uc1wiKSk7XG5cdGVsc2UgaWYodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKVxuXHRcdGRlZmluZShbXSwgZmFjdG9yeSk7XG5cdGVsc2UgaWYodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKVxuXHRcdGV4cG9ydHNbXCJBQ0RhdGFcIl0gPSBmYWN0b3J5KHJlcXVpcmUoXCJhZGFwdGl2ZS1leHByZXNzaW9uc1wiKSk7XG5cdGVsc2Vcblx0XHRyb290W1wiQUNEYXRhXCJdID0gZmFjdG9yeShyb290W1wiQUVMXCJdKTtcbn0pKHRoaXMsIGZ1bmN0aW9uKF9fV0VCUEFDS19FWFRFUk5BTF9NT0RVTEVfYWRhcHRpdmVfZXhwcmVzc2lvbnNfXykge1xucmV0dXJuICIsIi8vIENvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuLy8gTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlLlxuZXhwb3J0ICogZnJvbSBcIi4vdGVtcGxhdGUtZW5naW5lXCI7XG5leHBvcnQgKiBmcm9tIFwiLi9qc29uLXNjaGVtYS1jYXJkXCI7IiwiLy8gQ29weXJpZ2h0IChjKSBNaWNyb3NvZnQgQ29ycG9yYXRpb24uIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4vLyBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2UuXG5cbmltcG9ydCB7IElBZGFwdGl2ZUNhcmQsIElDYXJkRWxlbWVudCwgSUNob2ljZVNldElucHV0LCBJQ29udGFpbmVyLCBJTnVtYmVySW5wdXQsIElUZXh0SW5wdXQsIElUaW1lSW5wdXQsIElUb2dnbGVJbnB1dCB9IGZyb20gJ2FkYXB0aXZlY2FyZHMvc3JjL3NjaGVtYSc7XG5pbXBvcnQgeyBKU09OU2NoZW1hNywgSlNPTlNjaGVtYTdEZWZpbml0aW9uLCBKU09OU2NoZW1hN1R5cGUgfSBmcm9tICdqc29uLXNjaGVtYSc7XG5cblxuLy8gSlNPTiBTY2hlbWEgQ2FyZFxuLy8gZ2VuZXJhdGVzIGFuIEFkYXB0aXZlIENhcmQgZ2l2ZW4gYSBKU09OIHNjaGVtYVxuZXhwb3J0IGZ1bmN0aW9uIEpTT05TY2hlbWFDYXJkKHNjaGVtYTogSlNPTlNjaGVtYTcpOiBJQWRhcHRpdmVDYXJkIHwgdW5kZWZpbmVkIHtcblx0dHJ5IHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0dHlwZTogXCJBZGFwdGl2ZUNhcmRcIixcblx0XHRcdGJvZHk6IFtcblx0XHRcdFx0SlNPTlNjaGVtYUNhcmRPYmplY3Qoc2NoZW1hLCAnJywgMCksXG5cdFx0XHRdLFxuXHRcdH1cblx0fSBjYXRjaCAoZSkge1xuXHRcdGNvbnNvbGUuZXJyb3IoZSk7XG5cdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0fVxufVxuXG5cbi8vIEpTT04gU2NoZW1hIEVsZW1lbnRzXG5cbmZ1bmN0aW9uIEpTT05TY2hlbWFDYXJkRWxlbWVudChzY2hlbWE6IEpTT05TY2hlbWE3RGVmaW5pdGlvbiwgcGF0aDogc3RyaW5nLCBkZXB0aDogbnVtYmVyKTogSUNhcmRFbGVtZW50IHtcbiAgICBpZiAodHlwZW9mIChzY2hlbWEpID09PSBcImJvb2xlYW5cIikgcmV0dXJuIG51bGw7XG4gICAgc3dpdGNoIChzY2hlbWEudHlwZSkge1xuICAgICAgICBjYXNlIFwiYXJyYXlcIjpcbiAgICAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KHNjaGVtYS5pdGVtcykpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gSlNPTlNjaGVtYUNhcmRUdXBsZShzY2hlbWEsIHBhdGgsIGRlcHRoKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIEpTT05TY2hlbWFDYXJkTGlzdChzY2hlbWEsIHBhdGgsIGRlcHRoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgY2FzZSBcIm9iamVjdFwiOlxuICAgICAgICAgICAgcmV0dXJuIEpTT05TY2hlbWFDYXJkT2JqZWN0KHNjaGVtYSwgcGF0aCwgZGVwdGgpO1xuICAgICAgICBjYXNlIFwiYm9vbGVhblwiOlxuICAgICAgICAgICAgcmV0dXJuIEpTT05TY2hlbWFDYXJkQm9vbGVhbihzY2hlbWEsIHBhdGgpXG4gICAgICAgIGNhc2UgXCJpbnRlZ2VyXCI6XG4gICAgICAgIGNhc2UgXCJudW1iZXJcIjpcbiAgICAgICAgICAgIHJldHVybiBKU09OU2NoZW1hQ2FyZE51bWJlcihzY2hlbWEsIHBhdGgpXG4gICAgICAgIGNhc2UgXCJzdHJpbmdcIjpcbiAgICAgICAgICAgIGlmIChzY2hlbWEuZW51bSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBKU09OU2NoZW1hQ2FyZENob2ljZVNldChzY2hlbWEsIHBhdGgpXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBKU09OU2NoZW1hQ2FyZFRleHQoc2NoZW1hLCBwYXRoKVxuICAgICAgICAgICAgfVxuICAgICAgICBjYXNlIFwiZGF0ZS10aW1lXCI6XG4gICAgICAgIGNhc2UgXCJ0aW1lXCI6XG4gICAgICAgIGNhc2UgXCJkYXRlXCI6XG4gICAgICAgICAgICByZXR1cm4gSlNPTlNjaGVtYUNhcmRUaW1lKHNjaGVtYSwgcGF0aClcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gZW5jb2RlUHJvcGVydHkocHJvcGVydHk6IHN0cmluZykge1xuICAgIHJldHVybiBlbmNvZGVVUklDb21wb25lbnQocHJvcGVydHkpLnJlcGxhY2UoJy4nLCAnJTJlJylcbn1cblxuZnVuY3Rpb24gdGV4dFNpemVBdERlcHRoKGRlcHRoOiBudW1iZXIpIHtcbiAgICBzd2l0Y2ggKGRlcHRoKSB7XG4gICAgICAgIGNhc2UgMDpcbiAgICAgICAgICAgIFwibGFyZ2VcIlxuICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgICBcIm1lZGl1bVwiXG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICBcInNtYWxsXCJcbiAgICB9XG59XG5cbmZ1bmN0aW9uIEpTT05TY2hlbWFGaWVsZFRpdGxlKHNjaGVtYTogSlNPTlNjaGVtYTcsIHBhdGg6IHN0cmluZywgZGVwdGg6IG51bWJlcik6IElDYXJkRWxlbWVudFtdIHtcbiAgICByZXR1cm4gW1xuICAgICAgICBzY2hlbWEudGl0bGUgPyB7XG4gICAgICAgICAgICB0eXBlOiBcIlRleHRCbG9ja1wiLFxuICAgICAgICAgICAgc2l6ZTogdGV4dFNpemVBdERlcHRoKGRlcHRoKSxcbiAgICAgICAgICAgIHRleHQ6IHNjaGVtYS50aXRsZSxcbiAgICAgICAgfSA6IG51bGwsXG4gICAgICAgIHNjaGVtYS5kZXNjcmlwdGlvbiA/IHtcbiAgICAgICAgICAgIHR5cGU6IFwiVGV4dEJsb2NrXCIsXG4gICAgICAgICAgICBzaXplOiB0ZXh0U2l6ZUF0RGVwdGgoZGVwdGggKyAxKSxcbiAgICAgICAgICAgIGlzU3VidGxlOiB0cnVlLFxuICAgICAgICAgICAgd3JhcDogdHJ1ZSxcbiAgICAgICAgICAgIHRleHQ6IHNjaGVtYS5kZXNjcmlwdGlvbixcbiAgICAgICAgfSA6IG51bGwsXG4gICAgXVxufVxuXG5mdW5jdGlvbiBKU09OU2NoZW1hQ2FyZFR1cGxlKHNjaGVtYTogSlNPTlNjaGVtYTcsIHBhdGg6IHN0cmluZywgZGVwdGg6IG51bWJlcik6IElDb250YWluZXIge1xuICAgIGlmICghQXJyYXkuaXNBcnJheShzY2hlbWEuaXRlbXMpKSByZXR1cm4gbnVsbDtcbiAgICByZXR1cm4ge1xuICAgICAgICB0eXBlOiBcIkNvbnRhaW5lclwiLFxuICAgICAgICBpdGVtczogW1xuICAgICAgICAgICAgLi4uSlNPTlNjaGVtYUZpZWxkVGl0bGUoc2NoZW1hLCBwYXRoLCBkZXB0aCksXG4gICAgICAgICAgICAuLi5zY2hlbWEuaXRlbXM/Lm1hcCgoaXRlbTogSlNPTlNjaGVtYTdEZWZpbml0aW9uLCBpZHg6IG51bWJlcikgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBKU09OU2NoZW1hQ2FyZEVsZW1lbnQoaXRlbSwgYCR7cGF0aH1bJHtpZHh9XWAsIGRlcHRoICsgMSlcbiAgICAgICAgICAgIH0pID8/IFtdLFxuICAgICAgICBdLFxuICAgIH1cbn1cblxuZnVuY3Rpb24gSlNPTlNjaGVtYUNhcmRMaXN0KHNjaGVtYTogSlNPTlNjaGVtYTcsIHBhdGg6IHN0cmluZywgZGVwdGg6IG51bWJlcik6IElDb250YWluZXIge1xuICAgIHJldHVybiB7XG4gICAgICAgIHR5cGU6IFwiQ29udGFpbmVyXCIsXG4gICAgICAgIGl0ZW1zOiBbXG4gICAgICAgICAgICAuLi5KU09OU2NoZW1hRmllbGRUaXRsZShzY2hlbWEsIHBhdGgsIGRlcHRoKSxcbiAgICAgICAgICAgIC8vIFRPRE8gbm90IGltcGxlbWVudGVkXG4gICAgICAgIF0sXG4gICAgfVxufVxuXG5mdW5jdGlvbiBKU09OU2NoZW1hQ2FyZE9iamVjdChzY2hlbWE6IEpTT05TY2hlbWE3LCBwYXRoOiBzdHJpbmcsIGRlcHRoOiBudW1iZXIpOiBJQ29udGFpbmVyIHtcbiAgICByZXR1cm4ge1xuICAgICAgICB0eXBlOiBcIkNvbnRhaW5lclwiLFxuICAgICAgICBpdGVtczogW1xuICAgICAgICAgICAgLi4uSlNPTlNjaGVtYUZpZWxkVGl0bGUoc2NoZW1hLCBwYXRoLCBkZXB0aCksXG4gICAgICAgICAgICAuLi5zY2hlbWEucmVxdWlyZWQ/Lm1hcCgocHJvcGVydHk6IHN0cmluZykgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBKU09OU2NoZW1hQ2FyZEVsZW1lbnQoc2NoZW1hLnByb3BlcnRpZXNbcHJvcGVydHldLCBgJHtwYXRofS4ke2VuY29kZVByb3BlcnR5KHByb3BlcnR5KX1gLCBkZXB0aCArIDEpXG4gICAgICAgICAgICB9KSA/PyBbXSxcbiAgICAgICAgXSxcbiAgICB9XG59XG5cbmZ1bmN0aW9uIEpTT05TY2hlbWFDYXJkQm9vbGVhbihzY2hlbWE6IEpTT05TY2hlbWE3LCBwYXRoOiBzdHJpbmcpOiBJVG9nZ2xlSW5wdXQge1xuICAgIHJldHVybiB7XG4gICAgICAgIHR5cGU6IFwiSW5wdXQuVG9nZ2xlXCIsXG4gICAgICAgIGlkOiBwYXRoLFxuICAgICAgICB0aXRsZTogc2NoZW1hLnRpdGxlLFxuICAgICAgICBsYWJlbDogc2NoZW1hLmRlc2NyaXB0aW9uLFxuICAgICAgICB2YWx1ZTogc2NoZW1hLmRlZmF1bHQgYXMgc3RyaW5nLFxuICAgIH1cbn1cblxuZnVuY3Rpb24gSlNPTlNjaGVtYUNhcmROdW1iZXIoc2NoZW1hOiBKU09OU2NoZW1hNywgcGF0aDogc3RyaW5nKTogSU51bWJlcklucHV0IHtcbiAgICByZXR1cm4ge1xuICAgICAgICB0eXBlOiBcIklucHV0Lk51bWJlclwiLFxuICAgICAgICBpZDogcGF0aCxcbiAgICAgICAgdGl0bGU6IHNjaGVtYS50aXRsZSxcbiAgICAgICAgcGxhY2Vob2xkZXI6IHNjaGVtYS5kZXNjcmlwdGlvbixcbiAgICAgICAgdmFsdWU6IHNjaGVtYS5kZWZhdWx0IGFzIHN0cmluZyxcbiAgICAgICAgbWluOiBzY2hlbWEuZXhjbHVzaXZlTWluaW11bSA/PyBzY2hlbWEubWluaW11bSxcbiAgICAgICAgbWF4OiBzY2hlbWEuZXhjbHVzaXZlTWF4aW11bSA/PyBzY2hlbWEubWF4aW11bSxcbiAgICB9XG59XG5cbmZ1bmN0aW9uIEpTT05TY2hlbWFDYXJkQ2hvaWNlU2V0KHNjaGVtYTogSlNPTlNjaGVtYTcsIHBhdGg6IHN0cmluZyk6IElDaG9pY2VTZXRJbnB1dCB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgdHlwZTogXCJJbnB1dC5DaG9pY2VTZXRcIixcbiAgICAgICAgaWQ6IHBhdGgsXG4gICAgICAgIHRpdGxlOiBzY2hlbWEudGl0bGUsXG4gICAgICAgIGNob2ljZXM6IHNjaGVtYS5lbnVtLm1hcCgoaXRlbTogSlNPTlNjaGVtYTdUeXBlKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHRpdGxlOiBpdGVtIGFzIHN0cmluZyxcbiAgICAgICAgICAgICAgICB2YWx1ZTogaXRlbSBhcyBzdHJpbmcsXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pLFxuICAgICAgICBwbGFjZWhvbGRlcjogc2NoZW1hLmRlc2NyaXB0aW9uLFxuICAgICAgICB2YWx1ZTogc2NoZW1hLmRlZmF1bHQgYXMgc3RyaW5nLFxuICAgIH1cbn1cblxuZnVuY3Rpb24gSlNPTlNjaGVtYUNhcmRUZXh0KHNjaGVtYTogSlNPTlNjaGVtYTcsIHBhdGg6IHN0cmluZyk6IElUZXh0SW5wdXQge1xuICAgIHJldHVybiB7XG4gICAgICAgIHR5cGU6IFwiSW5wdXQuVGV4dFwiLFxuICAgICAgICBpZDogcGF0aCxcbiAgICAgICAgdGl0bGU6IHNjaGVtYS50aXRsZSxcbiAgICAgICAgcGxhY2Vob2xkZXI6IHNjaGVtYS5kZXNjcmlwdGlvbixcbiAgICAgICAgdmFsdWU6IHNjaGVtYS5kZWZhdWx0IGFzIHN0cmluZyxcbiAgICAgICAgbWF4TGVuZ3RoOiBzY2hlbWEubWF4TGVuZ3RoLFxuICAgICAgICByZWdleDogc2NoZW1hLnBhdHRlcm4sXG4gICAgfVxufVxuXG5mdW5jdGlvbiBKU09OU2NoZW1hQ2FyZFRpbWUoc2NoZW1hOiBKU09OU2NoZW1hNywgcGF0aDogc3RyaW5nKTogSVRpbWVJbnB1dCB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgdHlwZTogXCJJbnB1dC5UaW1lXCIsXG4gICAgICAgIGlkOiBwYXRoLFxuICAgICAgICB0aXRsZTogc2NoZW1hLnRpdGxlLFxuICAgICAgICBwbGFjZWhvbGRlcjogc2NoZW1hLmRlc2NyaXB0aW9uLFxuICAgICAgICB2YWx1ZTogc2NoZW1hLmRlZmF1bHQgYXMgc3RyaW5nLFxuICAgIH1cbn1cbiIsIi8vIENvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuLy8gTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlLlxuaW1wb3J0ICogYXMgQUVMIGZyb20gXCJhZGFwdGl2ZS1leHByZXNzaW9uc1wiO1xuXG5jbGFzcyBFdmFsdWF0aW9uQ29udGV4dCB7XG4gICAgcHJpdmF0ZSBzdGF0aWMgcmVhZG9ubHkgX3Jlc2VydmVkRmllbGRzID0gW1wiJGRhdGFcIiwgXCIkd2hlblwiLCBcIiRyb290XCIsIFwiJGluZGV4XCJdO1xuXG4gICAgcHJpdmF0ZSBfc3RhdGVTdGFjazogQXJyYXk8eyAkZGF0YTogYW55LCAkaW5kZXg6IGFueSB9PiA9IFtdO1xuICAgIHByaXZhdGUgXyRkYXRhOiBhbnk7XG5cbiAgICAkcm9vdDogYW55O1xuICAgICRpbmRleDogbnVtYmVyO1xuXG4gICAgY29uc3RydWN0b3IoY29udGV4dD86IElFdmFsdWF0aW9uQ29udGV4dCkge1xuICAgICAgICBpZiAoY29udGV4dCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB0aGlzLiRyb290ID0gY29udGV4dC4kcm9vdDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGlzUmVzZXJ2ZWRGaWVsZChuYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIEV2YWx1YXRpb25Db250ZXh0Ll9yZXNlcnZlZEZpZWxkcy5pbmRleE9mKG5hbWUpID49IDA7XG4gICAgfVxuXG4gICAgc2F2ZVN0YXRlKCkge1xuICAgICAgICB0aGlzLl9zdGF0ZVN0YWNrLnB1c2goXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgJGRhdGE6IHRoaXMuJGRhdGEsXG4gICAgICAgICAgICAgICAgJGluZGV4OiB0aGlzLiRpbmRleFxuICAgICAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmVzdG9yZUxhc3RTdGF0ZSgpIHtcbiAgICAgICAgaWYgKHRoaXMuX3N0YXRlU3RhY2subGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJUaGVyZSBpcyBubyBldmFsdWF0aW9uIGNvbnRleHQgc3RhdGUgdG8gcmVzdG9yZS5cIik7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgc2F2ZWRDb250ZXh0ID0gdGhpcy5fc3RhdGVTdGFjay5wb3AoKTtcblxuICAgICAgICB0aGlzLiRkYXRhID0gc2F2ZWRDb250ZXh0LiRkYXRhO1xuICAgICAgICB0aGlzLiRpbmRleCA9IHNhdmVkQ29udGV4dC4kaW5kZXg7XG4gICAgfVxuXG4gICAgZ2V0ICRkYXRhKCk6IGFueSB7XG4gICAgICAgIHJldHVybiB0aGlzLl8kZGF0YSAhPT0gdW5kZWZpbmVkID8gdGhpcy5fJGRhdGEgOiB0aGlzLiRyb290O1xuICAgIH1cblxuICAgIHNldCAkZGF0YSh2YWx1ZTogYW55KSB7XG4gICAgICAgIHRoaXMuXyRkYXRhID0gdmFsdWU7XG4gICAgfVxufVxuXG5jbGFzcyBUZW1wbGF0ZU9iamVjdE1lbW9yeSBpbXBsZW1lbnRzIEFFTC5NZW1vcnlJbnRlcmZhY2Uge1xuICAgIHByaXZhdGUgX21lbW9yeTogQUVMLk1lbW9yeUludGVyZmFjZTtcblxuICAgICRyb290OiBhbnk7XG4gICAgJGRhdGE6IGFueTtcbiAgICAkaW5kZXg6IGFueTtcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLl9tZW1vcnkgPSBuZXcgQUVMLlNpbXBsZU9iamVjdE1lbW9yeSh0aGlzKTtcbiAgICB9XG5cbiAgICBnZXRWYWx1ZShwYXRoOiBzdHJpbmcpOiBhbnkge1xuICAgICAgICBsZXQgYWN0dWFsUGF0aCA9IChwYXRoLmxlbmd0aCA+IDAgJiYgcGF0aFswXSAhPT0gXCIkXCIpID8gXCIkZGF0YS5cIiArIHBhdGggOiBwYXRoO1xuXG4gICAgICAgIHJldHVybiB0aGlzLl9tZW1vcnkuZ2V0VmFsdWUoYWN0dWFsUGF0aCk7XG4gICAgfVxuXG4gICAgc2V0VmFsdWUocGF0aDogc3RyaW5nLCBpbnB1dDogYW55KSB7XG4gICAgICAgIHRoaXMuX21lbW9yeS5zZXRWYWx1ZShwYXRoLCBpbnB1dCk7XG4gICAgfVxuXG4gICAgdmVyc2lvbigpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5fbWVtb3J5LnZlcnNpb24oKTtcbiAgICB9XG59XG5cbi8qKlxuICogSG9sZHMgZ2xvYmFsIHNldHRpbmdzIHRoYXQgY2FuIGJlIHVzZWQgdG8gY3VzdG9taXplIHRoZSB3YXkgdGVtcGxhdGVzIGFyZSBleHBhbmRlZC5cbiAqL1xuZXhwb3J0IGNsYXNzIEdsb2JhbFNldHRpbmdzIHtcbiAgICAvKipcbiAgICAgKiBDYWxsYmFjayBpbnZva2VkIHdoZW4gZXhwcmVzc2lvbiBldmFsdWF0aW9uIG5lZWRzIHRoZSB2YWx1ZSBvZiBhIGZpZWxkIGluIHRoZSBzb3VyY2UgZGF0YSBvYmplY3RcbiAgICAgKiBhbmQgdGhhdCBmaWVsZCBpcyB1bmRlZmluZWQgb3IgbnVsbC4gQnkgZGVmYXVsdCwgZXhwcmVzc2lvbiBldmFsdWF0aW9uIHdpbGwgc3Vic3RpdHV0ZSBhbiB1bmRlZmluZWRcbiAgICAgKiBmaWVsZCB3aXRoIGl0cyBiaW5kaW5nIGV4cHJlc3Npb24gKGUuZy4gYCR7ZmllbGR9YCkuIFRoaXMgY2FsbGJhY2sgbWFrZXMgaXQgcG9zc2libGUgdG8gY3VzdG9taXplIHRoYXRcbiAgICAgKiBiZWhhdmlvci5cbiAgICAgKiBcbiAgICAgKiAqKkV4YW1wbGUqKlxuICAgICAqIEdpdmVuIHRoaXMgZGF0YSBvYmplY3Q6XG4gICAgICogXG4gICAgICogYGBganNvblxuICAgICAqIHtcbiAgICAgKiAgICAgZmlyc3ROYW1lOiBcIkRhdmlkXCJcbiAgICAgKiB9XG4gICAgICogYGBgXG4gICAgICogXG4gICAgICogVGhlIGV4cHJlc3Npb24gYCR7Zmlyc3ROYW1lfSAke2xhc3ROYW1lfWAgd2lsbCBldmFsdWF0ZSB0byBcIkRhdmlkICR7bGFzdE5hbWV9XCIgYmVjYXVzZSB0aGUgYGxhc3ROYW1lYFxuICAgICAqIGZpZWxkIGlzIHVuZGVmaW5lZC5cbiAgICAgKiBcbiAgICAgKiBOb3cgbGV0J3Mgc2V0IHRoZSBjYWxsYmFjazpcbiAgICAgKiBgYGB0eXBlc2NyaXB0XG4gICAgICogR2xvYmFsU2V0dGluZ3MuZ2V0VW5kZWZpbmVkRmllbGRWYWx1ZVN1YnN0aXR1dGlvblN0cmluZyA9IChwYXRoOiBzdHJpbmcpID0+IHsgcmV0dXJuIFwiPHVuZGVmaW5lZCB2YWx1ZT5cIjsgfVxuICAgICAqIGBgYFxuICAgICAqIFxuICAgICAqIFdpdGggdGhhdCwgdGhlIGFib3ZlIGV4cHJlc3Npb24gd2lsbCBldmFsdWF0ZSB0byBcIkRhdmlkICZsdDt1bmRlZmluZWQgdmFsdWUmZ3Q7XCJcbiAgICAgKi9cbiAgICBzdGF0aWMgZ2V0VW5kZWZpbmVkRmllbGRWYWx1ZVN1YnN0aXR1dGlvblN0cmluZz86IChwYXRoOiBzdHJpbmcpID0+IHN0cmluZyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbn1cblxuLyoqXG4gKiBIb2xkcyB0aGUgY29udGV4dCB1c2VkIHRvIGV4cGFuZCBhIHRlbXBsYXRlLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIElFdmFsdWF0aW9uQ29udGV4dCB7XG4gICAgLyoqXG4gICAgICogVGhlIHJvb3QgZGF0YSBvYmplY3QgdGhlIHRlbXBsYXRlIHdpbGwgYmluZCB0by4gRXhwcmVzc2lvbnMgdGhhdCByZWZlciB0byAkcm9vdCBpbiB0aGUgdGVtcGxhdGUgcGF5bG9hZFxuICAgICAqIG1hcCB0byB0aGlzIGZpZWxkLiBJbml0aWFsbHksICRkYXRhIGFsc28gbWFwcyB0byAkcm9vdC5cbiAgICAgKi9cbiAgICAkcm9vdDogYW55XG59XG5cbi8qKlxuICogUmVwcmVzZW50cyBhIHRlbXBsYXRlIHRoYXQgY2FuIGJlIGJvdW5kIHRvIGRhdGEuXG4gKi9cbmV4cG9ydCBjbGFzcyBUZW1wbGF0ZSB7XG4gICAgcHJpdmF0ZSBzdGF0aWMgcHJlcGFyZShub2RlOiBhbnkpOiBhbnkge1xuICAgICAgICBpZiAodHlwZW9mIG5vZGUgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICAgIHJldHVybiBUZW1wbGF0ZS5wYXJzZUludGVycG9sYXRlZFN0cmluZyhub2RlKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh0eXBlb2Ygbm9kZSA9PT0gXCJvYmplY3RcIiAmJiBub2RlICE9PSBudWxsKSB7XG4gICAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShub2RlKSkge1xuICAgICAgICAgICAgICAgIGxldCByZXN1bHQ6IGFueVtdID0gW107XG5cbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpdGVtIG9mIG5vZGUpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0LnB1c2goVGVtcGxhdGUucHJlcGFyZShpdGVtKSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGxldCBrZXlzID0gT2JqZWN0LmtleXMobm9kZSk7XG4gICAgICAgICAgICAgICAgbGV0IHJlc3VsdCA9IHt9O1xuXG4gICAgICAgICAgICAgICAgZm9yIChsZXQga2V5IG9mIGtleXMpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0W2tleV0gPSBUZW1wbGF0ZS5wcmVwYXJlKG5vZGVba2V5XSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBub2RlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzdGF0aWMgaW50ZXJuYWxUcnlFdmFsdWF0ZUV4cHJlc3Npb24oZXhwcmVzc2lvbjogQUVMLkV4cHJlc3Npb24sIGNvbnRleHQ6IEV2YWx1YXRpb25Db250ZXh0LCBhbGxvd1N1YnN0aXR1dGlvbnM6IGJvb2xlYW4pOiB7IHZhbHVlOiBhbnk7IGVycm9yOiBzdHJpbmcgfSB7XG4gICAgICAgIGxldCBtZW1vcnkgPSBuZXcgVGVtcGxhdGVPYmplY3RNZW1vcnkoKTtcbiAgICAgICAgbWVtb3J5LiRyb290ID0gY29udGV4dC4kcm9vdDtcbiAgICAgICAgbWVtb3J5LiRkYXRhID0gY29udGV4dC4kZGF0YTtcbiAgICAgICAgbWVtb3J5LiRpbmRleCA9IGNvbnRleHQuJGluZGV4O1xuXG4gICAgICAgIGxldCBvcHRpb25zOiBBRUwuT3B0aW9ucyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcblxuICAgICAgICBpZiAoYWxsb3dTdWJzdGl0dXRpb25zKSB7XG4gICAgICAgICAgICBvcHRpb25zID0gbmV3IEFFTC5PcHRpb25zKCk7XG4gICAgICAgICAgICBvcHRpb25zLm51bGxTdWJzdGl0dXRpb24gPSAocGF0aDogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgICAgICAgbGV0IHN1YnN0aXR1dGlvblZhbHVlOiBzdHJpbmcgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG5cbiAgICAgICAgICAgICAgICBpZiAoR2xvYmFsU2V0dGluZ3MuZ2V0VW5kZWZpbmVkRmllbGRWYWx1ZVN1YnN0aXR1dGlvblN0cmluZykge1xuICAgICAgICAgICAgICAgICAgICBzdWJzdGl0dXRpb25WYWx1ZSA9IEdsb2JhbFNldHRpbmdzLmdldFVuZGVmaW5lZEZpZWxkVmFsdWVTdWJzdGl0dXRpb25TdHJpbmcocGF0aCk7ICAgIFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgICAgICAgICAgcmV0dXJuIHN1YnN0aXR1dGlvblZhbHVlID8gc3Vic3RpdHV0aW9uVmFsdWUgOiBcIiR7XCIgKyBwYXRoICsgXCJ9XCI7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBUaGUgcm9vdCBvZiBhbiBleHByZXNzaW9uIGNvbWluZyBmcm9tIGFuIGludGVycG9sYXRlZCBzdHJpbmcgaXMgb2YgdHlwZSBDb25jYXQuXG4gICAgICAgIC8vIEluIHRoYXQgY2FzZSwgYW5kIGlmIHRoZSBjYWxsZXIgYWxsb3dzIGl0LCB3ZSdyZSBkb2luZyBvdXIgb3duIGNvbmNhdGVuYXRpb25cbiAgICAgICAgLy8gaW4gb3JkZXIgdG8gY2F0Y2ggZWFjaCBpbmRpdmlkdWFsIGV4cHJlc3Npb24gZXZhbHVhdGlvbiBlcnJvciBhbmQgc3Vic3RpdHV0ZSBpblxuICAgICAgICAvLyB0aGUgZmluYWwgc3RyaW5nXG4gICAgICAgIGlmIChleHByZXNzaW9uLnR5cGUgPT09IEFFTC5FeHByZXNzaW9uVHlwZS5Db25jYXQgJiYgYWxsb3dTdWJzdGl0dXRpb25zKSB7XG4gICAgICAgICAgICBsZXQgcmVzdWx0ID0gXCJcIjtcblxuICAgICAgICAgICAgZm9yIChsZXQgY2hpbGRFeHByZXNzaW9uIG9mIGV4cHJlc3Npb24uY2hpbGRyZW4pIHtcbiAgICAgICAgICAgICAgICBsZXQgZXZhbHVhdGlvblJlc3VsdDogeyB2YWx1ZTogYW55OyBlcnJvcjogc3RyaW5nIH07XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgZXZhbHVhdGlvblJlc3VsdCA9IGNoaWxkRXhwcmVzc2lvbi50cnlFdmFsdWF0ZShtZW1vcnksIG9wdGlvbnMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjYXRjaCAoZXgpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gV2UnbGwgc3dhbGxvdyBhbGwgZXhjZXB0aW9ucyBoZXJlXG4gICAgICAgICAgICAgICAgICAgIGV2YWx1YXRpb25SZXN1bHQgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3I6IGV4XG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKGV2YWx1YXRpb25SZXN1bHQuZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgZXZhbHVhdGlvblJlc3VsdC52YWx1ZSA9IFwiJHtcIiArIGNoaWxkRXhwcmVzc2lvbi50b1N0cmluZygpICsgXCJ9XCI7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcmVzdWx0ICs9IGV2YWx1YXRpb25SZXN1bHQudmFsdWUudG9TdHJpbmcoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHsgdmFsdWU6IHJlc3VsdCwgZXJyb3I6IHVuZGVmaW5lZCB9O1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gZXhwcmVzc2lvbi50cnlFdmFsdWF0ZShtZW1vcnksIG9wdGlvbnMpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFBhcnNlcyBhbiBpbnRlcnBvbGF0ZWQgc3RyaW5nIGludG8gYW4gRXhwcmVzc2lvbiBvYmplY3QgcmVhZHkgdG8gZXZhbHVhdGUuXG4gICAgICogXG4gICAgICogQHBhcmFtIGludGVycG9sYXRlZFN0cmluZyBUaGUgaW50ZXJwb2xhdGVkIHN0cmluZyB0byBwYXJzZS4gRXhhbXBsZTogXCJIZWxsbyAke25hbWV9XCJcbiAgICAgKiBAcmV0dXJucyBBbiBFeHByZXNzaW9uIG9iamVjdCBpZiB0aGUgcHJvdmlkZWQgaW50ZXJwb2xhdGVkIHN0cmluZyBjb250YWluZWQgYXQgbGVhc3Qgb25lIGV4cHJlc3Npb24gKGUuZy4gXCIke2V4cHJlc3Npb259XCIpOyB0aGUgb3JpZ2luYWwgc3RyaW5nIG90aGVyd2lzZS5cbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIHBhcnNlSW50ZXJwb2xhdGVkU3RyaW5nKGludGVycG9sYXRlZFN0cmluZzogc3RyaW5nKTogQUVMLkV4cHJlc3Npb24gfCBzdHJpbmcge1xuICAgICAgICBsZXQgbG9va3VwOiBBRUwuRXZhbHVhdG9yTG9va3VwID0gKHR5cGU6IHN0cmluZykgPT4ge1xuICAgICAgICAgICAgbGV0IHN0YW5kYXJkRnVuY3Rpb24gPSBBRUwuRXhwcmVzc2lvbkZ1bmN0aW9ucy5zdGFuZGFyZEZ1bmN0aW9ucy5nZXQodHlwZSk7XG5cbiAgICAgICAgICAgIGlmIChzdGFuZGFyZEZ1bmN0aW9uKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHN0YW5kYXJkRnVuY3Rpb247XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IEFFTC5FeHByZXNzaW9uRXZhbHVhdG9yKFxuICAgICAgICAgICAgICAgICAgICB0eXBlLFxuICAgICAgICAgICAgICAgICAgICAoZXhwcmVzc2lvbjogQUVMLkV4cHJlc3Npb24sIHN0YXRlOiBBRUwuTWVtb3J5SW50ZXJmYWNlLCBvcHRpb25zOiBBRUwuT3B0aW9ucykgPT4geyB0aHJvdyBuZXcgRXJyb3IoXCJVbmtub3duIGZ1bmN0aW9uIFwiICsgdHlwZSk7IH0sXG4gICAgICAgICAgICAgICAgICAgIEFFTC5SZXR1cm5UeXBlLlN0cmluZyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBJZiB0aGVyZSBpcyBhdCBsZWFzdCBvbmUgZXhwcmVzc2lvbiBzdGFydCBtYXJrZXIsIGxldCdzIGF0dGVtcHQgdG8gY29udmVydCBpbnRvIGFuIGV4cHJlc3Npb25cbiAgICAgICAgaWYgKGludGVycG9sYXRlZFN0cmluZy5pbmRleE9mKFwiJHtcIikgPj0gMCkge1xuICAgICAgICAgICAgbGV0IHBhcnNlZEV4cHJlc3Npb24gPSBBRUwuRXhwcmVzc2lvbi5wYXJzZShcImBcIiArIGludGVycG9sYXRlZFN0cmluZyArIFwiYFwiLCBsb29rdXApO1xuXG4gICAgICAgICAgICBpZiAocGFyc2VkRXhwcmVzc2lvbi50eXBlID09PSBcImNvbmNhdFwiKSB7XG4gICAgICAgICAgICAgICAgaWYgKHBhcnNlZEV4cHJlc3Npb24uY2hpbGRyZW4ubGVuZ3RoID09PSAxICYmICEocGFyc2VkRXhwcmVzc2lvbi5jaGlsZHJlblswXSBpbnN0YW5jZW9mIEFFTC5Db25zdGFudCkpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gVGhlIGNvbmNhdCBjb250YWlucyBhIHNpbmdsZSBjaGlsZCB0aGF0IGlzbid0IGEgY29uc3RhbnQsIHRodXMgdGhlIG9yaWdpbmFsXG4gICAgICAgICAgICAgICAgICAgIC8vIHN0cmluZyB3YXMgYSBzaW5nbGUgZXhwcmVzc2lvbi4gV2hlbiBldmFsdWF0ZWQsIHdlIHdhbnQgaXQgdG8gcHJvZHVjZSB0aGUgdHlwZVxuICAgICAgICAgICAgICAgICAgICAvLyBvZiB0aGF0IHNpbmdsZSBleHByZXNzaW9uXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBwYXJzZWRFeHByZXNzaW9uLmNoaWxkcmVuWzBdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmIChwYXJzZWRFeHByZXNzaW9uLmNoaWxkcmVuLmxlbmd0aCA9PT0gMikge1xuICAgICAgICAgICAgICAgICAgICBsZXQgZmlyc3RDaGlsZCA9IHBhcnNlZEV4cHJlc3Npb24uY2hpbGRyZW5bMF07XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKGZpcnN0Q2hpbGQgaW5zdGFuY2VvZiBBRUwuQ29uc3RhbnQgJiYgZmlyc3RDaGlsZC52YWx1ZSA9PT0gXCJcIiAmJiAhKHBhcnNlZEV4cHJlc3Npb24uY2hpbGRyZW5bMV0gaW5zdGFuY2VvZiBBRUwuQ29uc3RhbnQpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBUaGUgY29uY2F0IGNvbnRhaW5zIDIgY2hpbGRyZW4sIGFuZCB0aGUgZmlyc3Qgb25lIGlzIGFuIGVtcHR5IHN0cmluZyBjb25zdGFudCBhbmQgdGhlIHNlY29uZCBpc24ndCBhIGNvbnN0YW50LlxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gRnJvbSB2ZXJzaW9uIDQuMTAuMywgQUVMIGFsd2F5cyBpbnNlcnRzIGFuIGVtcHR5IHN0cmluZyBjb25zdGFudCBpbiBhbGwgY29uY2F0IGV4cHJlc3Npb24uIFRodXMgdGhlIG9yaWdpbmFsXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBzdHJpbmcgd2FzIGEgc2luZ2xlIGV4cHJlc3Npb24gaW4gdGhpcyBjYXNlIGFzIHdlbGwuIFdoZW4gZXZhbHVhdGVkLCB3ZSB3YW50IGl0IHRvIHByb2R1Y2UgdGhlIHR5cGVcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIG9mIHRoYXQgc2luZ2xlIGV4cHJlc3Npb24uXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcGFyc2VkRXhwcmVzc2lvbi5jaGlsZHJlblsxXTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIE90aGVyd2lzZSwgd2Ugd2FudCB0aGUgZXhwcmVzc2lvbiB0byBwcm9kdWNlIGEgc3RyaW5nXG4gICAgICAgICAgICAgICAgcmV0dXJuIHBhcnNlZEV4cHJlc3Npb247XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBJZiB0aGUgb3JpZ2luYWwgc3RyaW5nIGRpZG4ndCBjb250YWluIGFueSBleHByZXNzaW9uLCByZXR1cm4gaSBhcyBpc1xuICAgICAgICByZXR1cm4gaW50ZXJwb2xhdGVkU3RyaW5nO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRyaWVzIHRvIGV2YWx1YXRlIHRoZSBwcm92aWRlZCBleHByZXNzaW9uIHVzaW5nIHRoZSBwcm92aWRlZCBjb250ZXh0LlxuICAgICAqIFxuICAgICAqIEBwYXJhbSBleHByZXNzaW9uIFRoZSBleHByZXNzaW9uIHRvIGV2YWx1YXRlLlxuICAgICAqIEBwYXJhbSBjb250ZXh0IFRoZSBjb250ZXh0IChkYXRhKSB1c2VkIHRvIGV2YWx1YXRlIHRoZSBleHByZXNzaW9uLlxuICAgICAqIEBwYXJhbSBhbGxvd1N1YnN0aXR1dGlvbnMgSW5kaWNhdGVzIGlmIHRoZSBleHByZXNzaW9uIGV2YWx1YXRvciBzaG91bGQgc3Vic3RpdHV0ZSB1bmRlZmluZWQgdmFsdWUgd2l0aCBhIGRlZmF1bHRcbiAgICAgKiAgIHN0cmluZyBvciB0aGUgdmFsdWUgcmV0dXJuZWQgYnkgdGhlIEdsb2JhbFNldHRpbmdzLmdldFVuZGVmaW5lZEZpZWxkVmFsdWVTdWJzdGl0dXRpb25TdHJpbmcgY2FsbGJhY2suXG4gICAgICogQHJldHVybnMgQW4gb2JqZWN0IHJlcHJlc2VudGluZyB0aGUgcmVzdWx0IG9mIHRoZSBldmFsdWF0aW9uLiBJZiB0aGUgZXZhbHVhdGlvbiBzdWNjZWVkZWQsIHRoZSB2YWx1ZSBwcm9wZXJ0eVxuICAgICAqICAgY29udGFpbnMgdGhlIGFjdHVhbCBldmFsdWF0aW9uIHJlc3VsdCwgYW5kIHRoZSBlcnJvciBwcm9wZXJ0eSBpcyB1bmRlZmluZWQuIElmIHRoZSBldmFsdWF0aW9uIGZhaWxzLCB0aGUgZXJyb3JcbiAgICAgKiAgIHByb3BlcnR5IGNvbnRhaW5zIGEgbWVzc2FnZSBkZXRhaWxpbmcgdGhlIGVycm9yIHRoYXQgb2NjdXJyZWQuXG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyB0cnlFdmFsdWF0ZUV4cHJlc3Npb24oZXhwcmVzc2lvbjogQUVMLkV4cHJlc3Npb24sIGNvbnRleHQ6IElFdmFsdWF0aW9uQ29udGV4dCwgYWxsb3dTdWJzdGl0dXRpb25zOiBib29sZWFuKTogeyB2YWx1ZTogYW55OyBlcnJvcjogc3RyaW5nIH0ge1xuICAgICAgICByZXR1cm4gVGVtcGxhdGUuaW50ZXJuYWxUcnlFdmFsdWF0ZUV4cHJlc3Npb24oZXhwcmVzc2lvbiwgbmV3IEV2YWx1YXRpb25Db250ZXh0KGNvbnRleHQpLCBhbGxvd1N1YnN0aXR1dGlvbnMpO1xuICAgIH1cblxuICAgIHByaXZhdGUgX2NvbnRleHQ6IEV2YWx1YXRpb25Db250ZXh0O1xuICAgIHByaXZhdGUgX3ByZXBhcmVkUGF5bG9hZDogYW55O1xuXG4gICAgcHJpdmF0ZSBleHBhbmRTaW5nbGVPYmplY3Qobm9kZTogb2JqZWN0KTogYW55IHtcbiAgICAgICAgbGV0IHJlc3VsdCA9IHt9O1xuICAgICAgICBsZXQga2V5cyA9IE9iamVjdC5rZXlzKG5vZGUpO1xuXG4gICAgICAgIGZvciAobGV0IGtleSBvZiBrZXlzKSB7XG4gICAgICAgICAgICBpZiAoIXRoaXMuX2NvbnRleHQuaXNSZXNlcnZlZEZpZWxkKGtleSkpIHtcbiAgICAgICAgICAgICAgICBsZXQgdmFsdWUgPSB0aGlzLmludGVybmFsRXhwYW5kKG5vZGVba2V5XSk7XG5cbiAgICAgICAgICAgICAgICBpZiAodmFsdWUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICByZXN1bHRba2V5XSA9IHZhbHVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBpbnRlcm5hbEV4cGFuZChub2RlOiBhbnkpOiBhbnkge1xuICAgICAgICBsZXQgcmVzdWx0OiBhbnk7XG5cbiAgICAgICAgdGhpcy5fY29udGV4dC5zYXZlU3RhdGUoKTtcblxuICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShub2RlKSkge1xuICAgICAgICAgICAgbGV0IGl0ZW1BcnJheTogYW55W10gPSBbXTtcblxuICAgICAgICAgICAgZm9yIChsZXQgaXRlbSBvZiBub2RlKSB7XG4gICAgICAgICAgICAgICAgbGV0IGV4cGFuZGVkSXRlbSA9IHRoaXMuaW50ZXJuYWxFeHBhbmQoaXRlbSk7XG5cbiAgICAgICAgICAgICAgICBpZiAoZXhwYW5kZWRJdGVtICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KGV4cGFuZGVkSXRlbSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW1BcnJheSA9IGl0ZW1BcnJheS5jb25jYXQoZXhwYW5kZWRJdGVtKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW1BcnJheS5wdXNoKGV4cGFuZGVkSXRlbSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJlc3VsdCA9IGl0ZW1BcnJheTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChub2RlIGluc3RhbmNlb2YgQUVMLkV4cHJlc3Npb24pIHtcbiAgICAgICAgICAgIGxldCBldmFsdWF0aW9uUmVzdWx0ID0gVGVtcGxhdGUuaW50ZXJuYWxUcnlFdmFsdWF0ZUV4cHJlc3Npb24obm9kZSwgdGhpcy5fY29udGV4dCwgdHJ1ZSk7XG5cbiAgICAgICAgICAgIGlmICghZXZhbHVhdGlvblJlc3VsdC5lcnJvcikge1xuICAgICAgICAgICAgICAgIHJlc3VsdCA9IGV2YWx1YXRpb25SZXN1bHQudmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoZXZhbHVhdGlvblJlc3VsdC5lcnJvcik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodHlwZW9mIG5vZGUgPT09IFwib2JqZWN0XCIgJiYgbm9kZSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgbGV0IHdoZW4gPSBub2RlW1wiJHdoZW5cIl07XG4gICAgICAgICAgICBsZXQgZGF0YUNvbnRleHQgPSBub2RlW1wiJGRhdGFcIl07XG4gICAgICAgICAgICBsZXQgZGF0YUNvbnRleHRJc0FycmF5OiBib29sZWFuID0gZmFsc2U7XG4gICAgICAgICAgICBsZXQgZGF0YUNvbnRleHRzOiBhbnlbXTtcblxuICAgICAgICAgICAgaWYgKGRhdGFDb250ZXh0ID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBkYXRhQ29udGV4dHMgPSBbIHVuZGVmaW5lZCBdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKGRhdGFDb250ZXh0IGluc3RhbmNlb2YgQUVMLkV4cHJlc3Npb24pIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGV2YWx1YXRpb25SZXN1bHQgPSBUZW1wbGF0ZS5pbnRlcm5hbFRyeUV2YWx1YXRlRXhwcmVzc2lvbihkYXRhQ29udGV4dCwgdGhpcy5fY29udGV4dCwgdHJ1ZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKCFldmFsdWF0aW9uUmVzdWx0LmVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhQ29udGV4dCA9IGV2YWx1YXRpb25SZXN1bHQudmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoZXZhbHVhdGlvblJlc3VsdC5lcnJvcik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShkYXRhQ29udGV4dCkpIHtcbiAgICAgICAgICAgICAgICAgICAgZGF0YUNvbnRleHRzID0gZGF0YUNvbnRleHQ7XG4gICAgICAgICAgICAgICAgICAgIGRhdGFDb250ZXh0SXNBcnJheSA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBkYXRhQ29udGV4dHMgPSBbIGRhdGFDb250ZXh0IF07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXN1bHQgPSBbXTtcblxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBkYXRhQ29udGV4dHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBpZiAoZGF0YUNvbnRleHRJc0FycmF5KSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2NvbnRleHQuJGluZGV4ID0gaTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoZGF0YUNvbnRleHRzW2ldICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fY29udGV4dC4kZGF0YSA9IGRhdGFDb250ZXh0c1tpXTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBsZXQgZHJvcE9iamVjdCA9IGZhbHNlO1xuXG4gICAgICAgICAgICAgICAgaWYgKHdoZW4gaW5zdGFuY2VvZiBBRUwuRXhwcmVzc2lvbikge1xuICAgICAgICAgICAgICAgICAgICBsZXQgZXZhbHVhdGlvblJlc3VsdCA9IFRlbXBsYXRlLmludGVybmFsVHJ5RXZhbHVhdGVFeHByZXNzaW9uKHdoZW4sIHRoaXMuX2NvbnRleHQsIGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHdoZW5WYWx1ZTogYm9vbGVhbiA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgLy8gSWYgJHdoZW4gZmFpbHMgdG8gZXZhbHVhdGUgb3IgZXZhbHVhdGVzIHRvIGFueXRoaW5nIGJ1dCBhIGJvb2xlYW4sIGNvbnNpZGVyIGl0IGlzIGZhbHNlXG4gICAgICAgICAgICAgICAgICAgIGlmICghZXZhbHVhdGlvblJlc3VsdC5lcnJvcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgd2hlblZhbHVlID0gdHlwZW9mIGV2YWx1YXRpb25SZXN1bHQudmFsdWUgPT09IFwiYm9vbGVhblwiICYmIGV2YWx1YXRpb25SZXN1bHQudmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBkcm9wT2JqZWN0ID0gIXdoZW5WYWx1ZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoIWRyb3BPYmplY3QpIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGV4cGFuZGVkT2JqZWN0ID0gdGhpcy5leHBhbmRTaW5nbGVPYmplY3Qobm9kZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKGV4cGFuZGVkT2JqZWN0ICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQucHVzaChleHBhbmRlZE9iamVjdCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChyZXN1bHQubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKHJlc3VsdC5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgICAgICAgICByZXN1bHQgPSByZXN1bHRbMF07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZXN1bHQgPSBub2RlO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fY29udGV4dC5yZXN0b3JlTGFzdFN0YXRlKCk7XG5cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBJbml0aWFsaXplcyBhIG5ldyBUZW1wbGF0ZSBpbnN0YW5jZSBiYXNlZCBvbiB0aGUgcHJvdmlkZWQgcGF5bG9hZC5cbiAgICAgKiBPbmNlIGNyZWF0ZWQsIHRoZSBpbnN0YW5jZSBjYW4gYmUgYm91bmQgdG8gZGlmZmVyZW50IGRhdGEgb2JqZWN0c1xuICAgICAqIGluIGEgbG9vcC5cbiAgICAgKiBcbiAgICAgKiBAcGFyYW0gcGF5bG9hZCBUaGUgdGVtcGxhdGUgcGF5bG9hZC4gIFxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKHBheWxvYWQ6IGFueSkge1xuICAgICAgICB0aGlzLl9wcmVwYXJlZFBheWxvYWQgPSBUZW1wbGF0ZS5wcmVwYXJlKHBheWxvYWQpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEV4cGFuZHMgdGhlIHRlbXBsYXRlIHVzaW5nIHRoZSBwcm92aWRlZCBjb250ZXh0LiBUZW1wbGF0ZSBleHBhbnNpb24gaW52b2x2ZXNcbiAgICAgKiBldmFsdWF0aW5nIHRoZSBleHByZXNzaW9ucyB1c2VkIGluIHRoZSBvcmlnaW5hbCB0ZW1wbGF0ZSBwYXlsb2FkLCBhcyB3ZWxsIGFzXG4gICAgICogcmVwZWF0aW5nIChleHBhbmRpbmcpIHBhcnRzIG9mIHRoYXQgcGF5bG9hZCB0aGF0IGFyZSBib3VuZCB0byBhcnJheXMuXG4gICAgICogXG4gICAgICogRXhhbXBsZTpcbiAgICAgKiBcbiAgICAgKiBgYGB0eXBlc2NyaXB0XG4gICAgICogbGV0IGNvbnRleHQgPSB7XG4gICAgICogICAgICRyb290OiB7XG4gICAgICogICAgICAgICBmaXJzdE5hbWU6IFwiSm9oblwiLFxuICAgICAqICAgICAgICAgbGFzdE5hbWU6IFwiRG9lXCIsXG4gICAgICogICAgICAgICBjaGlsZHJlbjogW1xuICAgICAqICAgICAgICAgICAgIHsgZnVsbE5hbWU6IFwiSmFuZSBEb2VcIiwgYWdlOiA5IH0sXG4gICAgICogICAgICAgICAgICAgeyBmdWxsTmFtZTogXCJBbGV4IERvZVwiLCBhZ2U6IDEyIH1cbiAgICAgKiAgICAgICAgIF1cbiAgICAgKiAgICAgfVxuICAgICAqIH1cbiAgICAgKiBcbiAgICAgKiBsZXQgdGVtcGxhdGVQYXlsb2FkID0ge1xuICAgICAqICAgICB0eXBlOiBcIkFkYXB0aXZlQ2FyZFwiLFxuICAgICAqICAgICB2ZXJzaW9uOiBcIjEuMlwiLFxuICAgICAqICAgICBib2R5OiBbXG4gICAgICogICAgICAgICB7XG4gICAgICogICAgICAgICAgICAgdHlwZTogXCJUZXh0QmxvY2tcIixcbiAgICAgKiAgICAgICAgICAgICB0ZXh0OiBcIiR7Zmlyc3ROYW1lfSAke2xhc3ROYW1lfVwiXG4gICAgICogICAgICAgICB9LFxuICAgICAqICAgICAgICAge1xuICAgICAqICAgICAgICAgICAgIHR5cGU6IFwiVGV4dEJsb2NrXCIsXG4gICAgICogICAgICAgICAgICAgJGRhdGE6IFwiJHtjaGlsZHJlbn1cIixcbiAgICAgKiAgICAgICAgICAgICB0ZXh0OiBcIiR7ZnVsbE5hbWV9ICgke2FnZX0pXCJcbiAgICAgKiAgICAgICAgIH1cbiAgICAgKiAgICAgXVxuICAgICAqIH1cbiAgICAgKiBcbiAgICAgKiBsZXQgdGVtcGxhdGUgPSBuZXcgVGVtcGxhdGUodGVtcGxhdGVQYXlsb2FkKTtcbiAgICAgKiBcbiAgICAgKiBsZXQgZXhwYW5kZWRUZW1wbGF0ZSA9IHRlbXBsYXRlLmV4cGFuZChjb250ZXh0KTtcbiAgICAgKiBgYGBcbiAgICAgKiBcbiAgICAgKiBXaXRoIHRoZSBhYm92ZSBjb2RlLCB0aGUgdmFsdWUgb2YgYGV4cGFuZGVkVGVtcGxhdGVgIHdpbGwgYmVcbiAgICAgKiBcbiAgICAgKiBgYGBqc29uXG4gICAgICoge1xuICAgICAqICAgICB0eXBlOiBcIkFkYXB0aXZlQ2FyZFwiLFxuICAgICAqICAgICB2ZXJzaW9uOiBcIjEuMlwiLFxuICAgICAqICAgICBib2R5OiBbXG4gICAgICogICAgICAgICB7XG4gICAgICogICAgICAgICAgICAgdHlwZTogXCJUZXh0QmxvY2tcIixcbiAgICAgKiAgICAgICAgICAgICB0ZXh0OiBcIkpvaG4gRG9lXCJcbiAgICAgKiAgICAgICAgIH0sXG4gICAgICogICAgICAgICB7XG4gICAgICogICAgICAgICAgICAgdHlwZTogXCJUZXh0QmxvY2tcIixcbiAgICAgKiAgICAgICAgICAgICB0ZXh0OiBcIkphbmUgRG9lICg5KVwiXG4gICAgICogICAgICAgICB9LFxuICAgICAqICAgICAgICAge1xuICAgICAqICAgICAgICAgICAgIHR5cGU6IFwiVGV4dEJsb2NrXCIsXG4gICAgICogICAgICAgICAgICAgdGV4dDogXCJBbGV4IERvZSAoMTIpXCJcbiAgICAgKiAgICAgICAgIH1cbiAgICAgKiAgICAgXVxuICAgICAqIH1cbiAgICAgKiBgYGBcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0gY29udGV4dCBUaGUgY29udGV4dCB0byBiaW5kIHRoZSB0ZW1wbGF0ZSB0by5cbiAgICAgKiBAcmV0dXJucyBBIHZhbHVlIHJlcHJlc2VudGluZyB0aGUgZXhwYW5kZWQgdGVtcGxhdGUuIFRoZSB0eXBlIG9mIHRoYXQgdmFsdWVcbiAgICAgKiAgIGlzIGRlcGVuZGVudCBvbiB0aGUgdHlwZSBvZiB0aGUgb3JpZ2luYWwgdGVtcGxhdGUgcGF5bG9hZCBwYXNzZWQgdG8gdGhlIGNvbnN0cnVjdG9yLlxuICAgICAqL1xuICAgIGV4cGFuZChjb250ZXh0OiBJRXZhbHVhdGlvbkNvbnRleHQpOiBhbnkge1xuICAgICAgICB0aGlzLl9jb250ZXh0ID0gbmV3IEV2YWx1YXRpb25Db250ZXh0KGNvbnRleHQpO1xuXG4gICAgICAgIHJldHVybiB0aGlzLmludGVybmFsRXhwYW5kKHRoaXMuX3ByZXBhcmVkUGF5bG9hZCk7XG4gICAgfVxufSIsIm1vZHVsZS5leHBvcnRzID0gX19XRUJQQUNLX0VYVEVSTkFMX01PRFVMRV9hZGFwdGl2ZV9leHByZXNzaW9uc19fOyIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIiLCIvLyBzdGFydHVwXG4vLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbi8vIFRoaXMgZW50cnkgbW9kdWxlIGlzIHJlZmVyZW5jZWQgYnkgb3RoZXIgbW9kdWxlcyBzbyBpdCBjYW4ndCBiZSBpbmxpbmVkXG52YXIgX193ZWJwYWNrX2V4cG9ydHNfXyA9IF9fd2VicGFja19yZXF1aXJlX18oXCIuL3NyYy9hZGFwdGl2ZWNhcmRzLXRlbXBsYXRpbmcudHNcIik7XG4iLCIiXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=