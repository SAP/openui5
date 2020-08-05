/*global QUnit, sinon */
sap.ui.define([
	'sap/ui/core/Control',
	'sap/ui/core/Renderer',
	'sap/base/util/ObjectPath'
], function(Control, Renderer, ObjectPath) {
	"use strict";

	/*
	 * This module tests all relevant combinations of how renderers can be defined
	 * and how renderers can inherit from their base renderer.
	 *
	 * Possible ways to define a renderer:
	 *	- "RenderFunction" (D0): function, embedded in control definition
	 *	- "PlainRenderObject" (D1): plain object, embedded in control definition
	 *	- "ImplicitlyNamedRenderer" (D2): module, implicitly referenced by name, no 'renderer' property given
	 *	- "ExplicitlyNamedRenderer" (D3): module, explicitly referenced by name
	 *	- "ImportedRenderer" (D4): ready-made renderer object, e.g. imported via an AMD dependency
	 *
	 * Possible ways to extend a renderer from a base renderer
	 *  - "NoParent" (E0): no inheritance, define a renderer from scratch
	 *	- "LegacyExtend" (E1): create renderer with a call to Renderer.extend(BaseRenderer)
	 *  - "ModernExtend" (E2): create renderer with a call to BaseRenderer.extend(name, definition)
	 *
	 * Relevant Combinations:
	 *
	 *	D0:
	 *      E0
	 *      E2, extending from D0(E0,E2),D1(E0,E2),D2(E0,E1,E2),D3(E0,E1,E2),D4(E0,E1,E2) -- applied by framework
	 *
	 *  D1:
	 *      E0
	 *      E2, extending from D0(E0,E2),D1(E0,E2),D2(E0,E1,E2),D3(E0,E1,E2),D4(E0,E1,E2) -- applied by framework
	 *
	 *	D2:
	 *      E0
	 *      E1, extending from D0(E0,E2),D1(E0,E2),D2(E0,E1,E2),D3(E0,E1,E2),D4(E0,E1,E2)
	 *      E2, extending from D0(E0,E2),D1(E0,E2),D2(E0,E1,E2),D3(E0,E1,E2),D4(E0,E1,E2)
	 *
	 *  D3:
	 *      E0
	 *      E1, extending from D0(E0,E2),D1(E0,E2),D2(E0,E1,E2),D3(E0,E1,E2),D4(E0,E1,E2)
	 *      E2, extending from D0(E0,E2),D1(E0,E2),D2(E0,E1,E2),D3(E0,E1,E2),D4(E0,E1,E2)
	 *
	 *  D4:
	 *      E0
	 *      E1, extending from D0(E0,E2),D1(E0,E2),D2(E0,E1,E2),D3(E0,E1,E2),D4(E0,E1,E2)
	 *      E2, extending from D0(E0,E2),D1(E0,E2),D2(E0,E1,E2),D3(E0,E1,E2),D4(E0,E1,E2)
	 *
	 * Expectations
	 *  - control has the expected renderer
	 *	- renderer extension created a new renderer, different from the old one
	 *  - new renderer has the expected methods
	 *  - if the renderer has been extended, it should have got an 'extend' method
	 */

	/*
	 * Creates a class by extending from the given base, using the given method of
	 * defining the renderer and the given way of extending the renderer from the base
	 * renderer. The name of the class will be composed from the given prefix and the
	 * sDefinition and sExtensionMethod.
	 */
	function makeControlClass(sPrefix, sDefinition, sExtensionMethod, Base) {

		var sControlName = sPrefix + sDefinition + sExtensionMethod;
		var sRendererName = sControlName + "Renderer";

		if ( sExtensionMethod === "NoParent" ) {
			Base = Control;
		}

		var oResult = {
			controlName: sControlName,
			rendererName: sRendererName,
			controlClass: undefined,
			renderer: undefined
		};

		var renderFunction = function(oRM, oControl) {
			oRM.openStart("div", oControl);
			oRM.attr("type", sControlName);
			oRM.openEnd();
			oRM.close("div");
		};
		renderFunction.id = sControlName;

		function createRenderer() {
			switch (sExtensionMethod) {
			case "NoParent":
				var oRenderer = oResult.renderer = {
					render: renderFunction
				};
				ObjectPath.set(sRendererName, oRenderer);
				return oRenderer;
			case "LegacyExtend":
				var BaseRenderer = Base === Control ? Renderer : Base.getMetadata().getRenderer();
				var oRenderer = oResult.renderer = Renderer.extend(BaseRenderer);
				oRenderer.render = renderFunction;
				ObjectPath.set(sRendererName, oRenderer);
				return oRenderer;
			case "ModernExtend":
				var BaseRenderer = Base === Control ? Renderer : Base.getMetadata().getRenderer();
				if ( typeof BaseRenderer.extend === "function" ) {
					oResult.renderer = BaseRenderer.extend(sRendererName, {
						render: renderFunction
					});
				} else {
					oResult.renderer = Renderer.extend.call(BaseRenderer, sRendererName, {
						render: renderFunction
					});
				}
				return oResult.renderer;
			default:
				throw new Error("unknown extension mechanism " + sExtensionMethod);
			}
		}

		function createClassInfo() {
			switch (sDefinition) {
			case "RenderFunction":
				return {
					renderer: renderFunction
				};
			case "PlainRenderObject":
				return {
					renderer: {
						render: renderFunction
					}
				};
			case "ImplicitlyNamedRenderer":
				createRenderer();
				return {};
			case "ExplicitlyNamedRenderer":
				createRenderer();
				return {
					renderer: sRendererName
				};
			case "ImportedRenderer":
				return {
					renderer: createRenderer()
				};
			}
		}

		oResult.controlClass = Base.extend(sControlName, createClassInfo());
		return oResult;

	}

	var Grandparent = Control.extend("Grandparent", {
		renderer: function() {}
	});

	// Create base classes
	// (combinations D0(E0,E2),D1(E0,E2),D2(E0,E1,E2),D3(E0,E1,E2),D4(E0,E1,E2))
	var aBaseClasses = [
		["RenderFunction", "NoParent"],
		["RenderFunction", "ModernExtend"],
		["PlainRenderObject", "NoParent"],
		["PlainRenderObject", "ModernExtend"],
		["ImplicitlyNamedRenderer", "NoParent"],
		["ImplicitlyNamedRenderer", "LegacyExtend"],
		["ImplicitlyNamedRenderer", "ModernExtend"],
		["ExplicitlyNamedRenderer", "NoParent"],
		["ExplicitlyNamedRenderer", "LegacyExtend"],
		["ExplicitlyNamedRenderer", "ModernExtend"],
		["ImportedRenderer", "NoParent"],
		["ImportedRenderer", "LegacyExtend"],
		["ImportedRenderer", "ModernExtend"]
	].map(function(oConfig) {
		return makeControlClass("BaseControl", oConfig[0], oConfig[1], Grandparent).controlClass;
	});

	QUnit.module("Renderer Definition");

	[
		["RenderFunction", "NoParent"],
		["RenderFunction", "ModernExtend"],
		["PlainRenderObject", "NoParent"],
		["PlainRenderObject", "ModernExtend"],
		["ImplicitlyNamedRenderer", "NoParent"],
		["ImplicitlyNamedRenderer", "LegacyExtend"],
		["ImplicitlyNamedRenderer", "ModernExtend"],
		["ExplicitlyNamedRenderer", "NoParent"],
		["ExplicitlyNamedRenderer", "LegacyExtend"],
		["ExplicitlyNamedRenderer", "ModernExtend"],
		["ImportedRenderer", "NoParent"],
		["ImportedRenderer", "LegacyExtend"],
		["ImportedRenderer", "ModernExtend"]
	].forEach(function(oConfig) {
		var sDefinition = oConfig[0];
		var sExtensionMethod = oConfig[1];
		if ( sExtensionMethod === "NoParent" ) {
			QUnit.test("Define Renderer as " + sDefinition + ", " + sExtensionMethod, function(assert) {
				var oClassInfo = makeControlClass("TestControl", sDefinition, sExtensionMethod);
				var FNClass = oClassInfo.controlClass;
				assert.ok(!!FNClass, "Creating the class succeeded");
				var oRenderer = FNClass.getMetadata().getRenderer();
				assert.ok(!!oRenderer, "The created class should have a renderer");
				assert.equal(typeof oRenderer.render, "function");
				assert.equal(oRenderer.render.id, FNClass.getMetadata().getName(), "inheritance should result in the expected render function");
				if ( sDefinition === "RenderFunction" || sDefinition === "PlainRenderObject" ) {
					assert.equal(typeof oRenderer.extend, "function", "renderer should have an extend function");
				} else {
					// this assert does not represent a requirement, it only reflects the current implementation
					assert.equal(typeof oRenderer.extend, "undefined", "renderer should not have an extend function");
				}
				if ( oClassInfo.renderer ) {
					assert.strictEqual(oRenderer, oClassInfo.renderer, "renderer should be the same as the external one");
				}
			});
		} else {
			aBaseClasses.forEach(function(FNBaseClass) {
				QUnit.test("Define Renderer as " + sDefinition + ", " + sExtensionMethod + " from " + FNBaseClass.getMetadata().getName(), function(assert) {
					var oClassInfo = makeControlClass("TestControl", sDefinition, sExtensionMethod, FNBaseClass);
					var FNClass = oClassInfo.controlClass;
					assert.ok(!!FNClass, "Creating the class succeeded");
					var oRenderer = FNClass.getMetadata().getRenderer();
					assert.ok(!!oRenderer, "The created class should have a renderer");
					assert.equal(typeof oRenderer.render, "function");
					assert.equal(oRenderer.render.id, FNClass.getMetadata().getName(), "inheritance should result in the expected render function");
					var oBaseRenderer = FNBaseClass.getMetadata().getRenderer();
					assert.notStrictEqual(oRenderer, oBaseRenderer, "renderer is different from base renderer");
					assert.deepEqual(Object.getPrototypeOf(oRenderer), oBaseRenderer, "base renderer should be the prototype of the new renderer");
					assert.equal(typeof oRenderer.extend, "function", "renderer should have an extend function");
					if ( oClassInfo.renderer ) {
						assert.strictEqual(oRenderer, oClassInfo.renderer, "renderer should be the same as the external one");
					}
				});
			});
		}
	});

	QUnit.test("Renderer.extend complains about undefined values", function(assert) {

		var fnAssertSpy = this.stub(console, "assert"); // eslint-disable-line no-console

		Control.extend("test.ControlWithUndefinedRenderFunction", {
			renderer: {
				render: undefined
			}
		});

		assert.ok(fnAssertSpy.calledWithMatch(sinon.match.falsy, /oRendererInfo can be omitted or must be a plain object without any undefined property values/));

	});

	QUnit.test("Renderer.extend complains about non-plain renderer objects", function(assert) {

		var fnAssertSpy = this.stub(console, "assert"); // eslint-disable-line no-console

		Control.extend("test.ControlWithNonPlainRendererObject", {
			renderer: Object.create({
				render: function() {}
			})
		});

		assert.ok(fnAssertSpy.calledWithMatch(sinon.match.falsy, /oRendererInfo can be omitted or must be a plain object without any undefined property values/));

	});

	QUnit.test("Renderer.extend is a generic function", function(assert) {
		aBaseClasses.forEach(function(FNBaseClass) {
			var oBaseRenderer = FNBaseClass.getMetadata().getRenderer();
			var oNewRenderer = Renderer.extend.call(oBaseRenderer, "TestRenderer", { "test": "test" });
			assert.notStrictEqual(oNewRenderer, oBaseRenderer, "renderer is different from base renderer");
			assert.equal(oNewRenderer.test, "test", "new renderer has expected property");
			assert.throws(function() {
				Renderer.extend.call(oNewRenderer, oBaseRenderer);
			}, /without a name can only be called on sap.ui.core.Renderer/, "extend, when called without a name, should throw an exception");
		});
	});

	QUnit.test("'Multiple' inheritance", function(assert) {

		// SETUP
		var fnAssertSpy = this.stub(console, "assert"); // eslint-disable-line no-console

		// first create an incomplete renderer inheriting from the standard renderer
		var oIncompleteRenderer = Renderer.extend("my.PatchworkFamilyRenderer", {
			renderText: function (r, t) {
				r.write(t.getText(true));
			}
		});

		// check that the incomplete renderer has the expected qualities
		assert.strictEqual(
			oIncompleteRenderer.render,
			undefined, "[precondition] incomplete renderer does not yet have a render function");
		assert.strictEqual(
			typeof oIncompleteRenderer.extend,
			"function", "[precondition] incomplete renderer should have an 'extend' function");

		// ACT
		// then create a control class, specifying the incomplete renderer as "renderer" property
		// the given renderer should be recognized as 'incomplete' and inherit from the renderer of the base class
		var ControlClass = Grandparent.extend("my.PatchworkFamily", {
			renderer: oIncompleteRenderer
		});

		// ASSERT
		var oFinalRenderer = ControlClass.getMetadata().getRenderer();
		assert.ok(oIncompleteRenderer !== oFinalRenderer, "final renderer should not be the same as the incoplete renderer");
		assert.strictEqual(
			oFinalRenderer.render,
			Grandparent.getMetadata().getRenderer().render, "final renderer should inherit the render function from the base class");
		assert.ok(fnAssertSpy.calledWithMatch(sinon.match.falsy, /oRendererInfo can be omitted or must be a plain object without any undefined property values/));

	});

});
