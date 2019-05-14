/*!
 * ${copyright}
 */
/*global QUnit */
sap.ui.define(['sap/base/util/resolveReference'], function(resolveReference) {
	"use strict";

	QUnit.module("sap.base.util.resolveReference");

	QUnit.test("resolve non-function from module", function(assert) {
		var oModule = {
			property: "property"
		};
		var sRef = resolveReference("module.property", {"module": oModule});
		assert.strictEqual(sRef, "property", "non-function is resolved");
	});

	QUnit.test("resolve function from module", function(assert) {
		var oContext;
		var oModule = {
			method: function() {
				oContext = this;
				return "method";
			}
		};

		var fn = resolveReference("module.method", {"module": oModule});
		assert.strictEqual(fn(), "method", "correct method was returned");
		assert.strictEqual(oContext, oModule, "correct context was bound");

		fn = resolveReference("module.method", {"module": oModule}, {bindContext: false});
		assert.strictEqual(fn(), "method", "correct method was returned");
		assert.strictEqual(oContext, undefined, "correct context was bound");
	});

	QUnit.test("resolve function from module deep", function(assert) {
		var oContext;
		var oModule = {
			ns: {
				deepMethod: function() {
					oContext = this;
					return "deepMethod";
				}
			}
		};

		var fn = resolveReference("module.ns.deepMethod", {"module": oModule});
		assert.strictEqual(fn(), "deepMethod", "correct method was returned");
		assert.strictEqual(oContext, oModule.ns, "correct context was bound");

		fn = resolveReference("module.ns.deepMethod", {"module": oModule}, {bindContext: false});
		assert.strictEqual(fn(), "deepMethod", "correct method was returned");
		assert.strictEqual(oContext, undefined, "correct context was bound");

		oModule = {
			ns: {
				format: function() {
					oContext = this;
					return "ns.format";
				}
			},
			format: function() {
				oContext = this;
				return "format";
			}
		};

		// there's no 'ns1' property under module, and the format shouldn't be wrongly fetched under
		// the module itself
		fn = resolveReference("module.ns1.format", {"module": oModule});
		assert.strictEqual(fn, undefined, "correct method was returned");
	});

	QUnit.test("resolve function from function module", function(assert) {
		var oContext;
		var oFunctionModule = function() {
			oContext = this;
			return "functionModule";
		};

		var fn = resolveReference("function", {"function": oFunctionModule});
		assert.strictEqual(fn(), "functionModule", "correct method was returned");
		assert.strictEqual(oContext, undefined, "no context was bound");
	});

	QUnit.test("resolve function from dot variable with bind dot context", function(assert) {
		var oContext;
		var oModule = {
			method: function() {
				oContext = this;
				return "method";
			}
		};

		var fn = resolveReference(".method", {".": oModule});
		assert.strictEqual(fn(), "method", "correct method was returned");
		assert.strictEqual(oContext, oModule, "correct context was bound");

		fn = resolveReference(".method", {".": oModule}, {bindContext: false});
		assert.strictEqual(fn(), "method", "correct method was returned");
		assert.strictEqual(oContext, undefined, "correct context was bound");

		oModule = {
			ns : {
				deepMethod: function() {
					oContext = this;
					return "deepMethod";
				}
			}
		};

		fn = resolveReference(".ns.deepMethod", {".": oModule});
		assert.strictEqual(fn(), "deepMethod", "correct method was returned");
		assert.strictEqual(oContext, oModule, "correct context was bound");

		fn = resolveReference(".ns.deepMethod", {".": oModule}, {bindDotContext: false});
		assert.strictEqual(fn(), "deepMethod", "correct method was returned");
		assert.strictEqual(oContext, undefined, "correct context was bound");
	});

	QUnit.test("resolve function from dot variable with prefer dot context", function(assert) {
		var oContext;
		var oModule = {
			method: function() {
				oContext = this;
				return "method";
			}
		};

		// no function can be resolved without dot variable
		var fn = resolveReference("method", {}, {preferDotContext: true});
		assert.strictEqual(fn, undefined, "The path can't be resolved");

		// The variable check should be done through the prototype chain
		var oInheritedModule = Object.create(oModule);
		fn = resolveReference("method", {".": oInheritedModule}, {preferDotContext: true});
		assert.strictEqual(fn(), "method", "correct method was returned");
		assert.strictEqual(oContext, oInheritedModule, "correct context was bound");

		// without preferDotContext, the method can't be resolved under dot variable
		fn = resolveReference("method", {".": oModule});
		assert.strictEqual(fn, undefined, "The path can't be resolved");

		// with preferDotContxt, the method is tried to be resolved under dot context if it's can't be resolve elsewhere
		fn = resolveReference("method", {".": oModule}, {preferDotContext: true});
		assert.strictEqual(fn(), "method", "correct method was returned");
		assert.strictEqual(oContext, oModule, "correct context was bound");

		oModule = {
			ns : {
				deepMethod: function() {
					oContext = this;
					return "deepMethod";
				}
			}
		};
		// test the case with deep namespace
		fn = resolveReference("ns.deepMethod", {".": oModule}, {preferDotContext: true});
		assert.strictEqual(fn(), "deepMethod", "correct method was returned");
		// should always bind to dot context
		assert.strictEqual(oContext, oModule, "correct context was bound");

		var oDotModule = {
			module: {
				method: function() {
					oContext = this;
					return "dotModuleMethod";
				},
				evilMethod: undefined
			},
			module1: {
			}
		};
		oModule = {
			method: function() {
				oContext = this;
				return "method";
			},
			evilMethod: function() {
				oContext = this;
				return "evilMethod";
			}
		};

		// dot variable has evilMethod defined with undefined, fallback to other variables
		fn = resolveReference("module.evilMethod", {".": oDotModule, "module": oModule}, {preferDotContext: true});
		assert.strictEqual(fn(), "evilMethod", "correct method was returned");
		assert.strictEqual(oContext, oModule, "correct context was bound");

		// test the resolve order (dot variable -> the other variables) with prefer dot context
		fn = resolveReference("module.method", {".": oDotModule, "module": oModule}, {preferDotContext: true});
		assert.strictEqual(fn(), "dotModuleMethod", "correct method was returned");
		assert.strictEqual(oContext, oDotModule, "correct context was bound");

		// test the resolve order (the function is not found under dot variable and fallback to other variable
		fn = resolveReference("module2.method", {".": oDotModule, "module2": oModule}, {preferDotContext: true});
		assert.strictEqual(fn(), "method", "correct method was returned");
		assert.strictEqual(oContext, oModule, "correct context was bound");

		window.module2 = {
			method: function() {
				oContext = this;
				return "window.module2.method";
			}
		};

		// test the resolve order (function is not found under dot variable and the first segment isn't defined in the
		// other variables then fallback to global
		fn = resolveReference("module2.method", {".": oDotModule, "module": oModule}, {preferDotContext: true});
		assert.strictEqual(fn(), "window.module2.method", "correct method was returned");
		assert.strictEqual(oContext, undefined, "correct context was bound");

		delete window.module2;
	});

	QUnit.test("resolve function from variable map with bind context and prefer dot context", function(assert) {
		var oContext;
		var oModule = {
			method: function() {
				oContext = this;
				return "method";
			}
		};

		// with preferDotContxt, the method is tried to be resolved under dot context if it's can't be resolve elsewhere
		var fn = resolveReference("method", {".": oModule}, {
			preferDotContext: true,
			bindDotContext: false
		});
		assert.strictEqual(fn(), "method", "correct method was returned");
		assert.strictEqual(oContext, undefined, "correct context was bound");

		oModule = {
			ns : {
				deepMethod: function() {
					oContext = this;
					return "deepMethod";
				}
			}
		};
		// test the case with deep namespace
		fn = resolveReference("ns.deepMethod", {".": oModule}, {
			preferDotContext: true,
			bindDotContext: false
		});
		assert.strictEqual(fn(), "deepMethod", "correct method was returned");
		assert.strictEqual(this.context, undefined, "correct context was bound");

		var oDotModule = {
			module: {
				method: function() {
					oContext = this;
					return "dotModuleMethod";
				}
			}
		};
		oModule = {
			method: function() {
				oContext = this;
				return "method";
			}
		};
		// test the resolve order (dot variable -> the other variables) with prefer dot context and no bindDotContext
		fn = resolveReference("module.method", {".": oDotModule, "module": oModule}, {preferDotContext: true, bindDotContext: false});
		assert.strictEqual(fn(), "dotModuleMethod", "correct method was returned");
		assert.strictEqual(this.context, undefined, "correct context was bound");
	});

	QUnit.test("resolve function from global scope - fallback", function(assert) {
		var oContext;
		window.globalMethodOnWindow = function(){
			oContext = this;
			return "globalMethodOnWindow";
		};

		var fn = resolveReference("globalMethodOnWindow");
		assert.strictEqual(fn(), "globalMethodOnWindow", "correct method was returned");
		assert.strictEqual(oContext, undefined, "correct context was bound");

		delete window.globalMethodOnWindow;
	});

	QUnit.test("resolve function with missing dot variable doesn't fallback to global scope", function(assert) {
		var fn = resolveReference(".globalMethodOnWindow");
		assert.strictEqual(fn, undefined, "correct method was returned");
	});

	QUnit.test("resolve function from global scope only when the first segment can't be resolved from other variables", function(assert) {
		// even though the given module doesn't have property "x", it shouldn't fallback to the global window.module.x
		// since the "module" can be resolved with the given variable
		var fn = resolveReference("module.x", {"module": {}});
		assert.strictEqual(fn, undefined, "correct method was returned");

		// even though the moudle.evilFunction is defined with "undefined", it shouldn't fallback to the global scope
		fn = resolveReference("evilModule.handler", {"evilModule": {handler: undefined}});
		assert.strictEqual(fn, undefined, "The function should be taken from module even when the module value is defined with undefined and shouldn't fallback to global");

		var oContext;
		window.module1 = {
			x: function() {
				oContext = this;
				return "window.module1.x";
			}
		};
		fn = resolveReference("module1.x", {"module": {}});
		assert.strictEqual(fn(), "window.module1.x", "correction method was returned");
		assert.strictEqual(oContext, undefined, "correct context was bound");
		delete window.module1;
	});

	QUnit.test("resolve function with prefer dot context shouldn't be done for path which already starts with dot", function(assert) {
		// test there's no endless loop
		var fn = resolveReference(".notExistMethod", {}, {preferDotContext: true});
		assert.strictEqual(fn, undefined, "correction method was returned");
	});
});
