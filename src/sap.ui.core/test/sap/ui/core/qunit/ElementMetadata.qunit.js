/*global QUnit */
sap.ui.define([
	'sap/ui/core/Control',
	'sap/ui/core/Renderer',
	'sap/base/util/ObjectPath',
	'sap/m/Text'
], function(Control, Renderer, ObjectPath, Text) {
	"use strict";

	// renderers
	var myCustomRenderer = {
		render: function(oRm, myControl) {
		}
	};

	var myExportedRenderer = {
		render: function(oRm, myControl) {
		}
	};
	ObjectPath.set("myControlWithExportedRendererRenderer", myExportedRenderer);

	var myExtendedRenderer = Renderer.extend(myExportedRenderer);


	// controls
	var ControlWithExportedRenderer = Control.extend("myControlWithExportedRenderer", {
		renderer: myExportedRenderer
	});

	var ControlWithObjectExtendedRenderer = Control.extend("myControlWithExtendedRenderer", {
		renderer: myExtendedRenderer
	});

	var ControlWithInheritedRenderer = ControlWithExportedRenderer.extend("myControlWithInheritedRenderer", {
		renderer: function() {
		}
	});

	var ControlWithCustomRenderer = Control.extend("myControlWithCustomRenderer", {
		renderer: myCustomRenderer
	});

	var ControlWithInplaceRenderer = Control.extend("myControlWithInplaceRenderer", {
		renderer: function() {
		}
	});

	QUnit.module("Metadata.getRenderer", {
		beforeEach: function() {
			this.oControlWithRendererFromObjectPath = new ControlWithExportedRenderer("ID1");
			this.oControlWithExtendedRenderer = new ControlWithObjectExtendedRenderer("ID2");
			this.oControlWithCustomRenderer = new ControlWithCustomRenderer("ID3");
			this.oInheritedControlWithRendererFunction = new ControlWithInheritedRenderer("ID4");
			this.oControlWithInplaceRenderer = new ControlWithInplaceRenderer("ID5");
		},
		afterEach: function() {
			this.oControlWithRendererFromObjectPath.destroy();
			this.oControlWithExtendedRenderer.destroy();
			this.oControlWithCustomRenderer.destroy();
			this.oInheritedControlWithRendererFunction.destroy();
			this.oControlWithInplaceRenderer.destroy();
		}
	});

	QUnit.test("Check renderer", function(assert) {
		assert.deepEqual(this.oControlWithRendererFromObjectPath.getMetadata().getRenderer(), myExportedRenderer);
		assert.deepEqual(this.oControlWithExtendedRenderer.getMetadata().getRenderer(), myExtendedRenderer);
		assert.ok(this.oControlWithCustomRenderer.getMetadata().getRenderer() !== myCustomRenderer, "a new object was created from base renderer");
		assert.deepEqual(Object.getPrototypeOf(this.oControlWithCustomRenderer.getMetadata().getRenderer()), Renderer, "Renderer is the prototype of this new object");
		assert.deepEqual(Object.getPrototypeOf(this.oInheritedControlWithRendererFunction.getMetadata().getRenderer()), myExportedRenderer, "myExportedRenderer is the prototype of this new object");
		assert.deepEqual(Object.getPrototypeOf(this.oControlWithInplaceRenderer.getMetadata().getRenderer()), Renderer, "Renderer is the prototype of this new object");
	});

	QUnit.test("'Multiple' inheritance", function(assert) {

		// SETUP
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
		var ControlClass = Text.extend("my.PatchworkFamily", {
			renderer: oIncompleteRenderer
		});

		// ASSERT
		var oFinalRenderer = ControlClass.getMetadata().getRenderer();
		assert.ok(oIncompleteRenderer !== oFinalRenderer, "final renderer should not be the same as the incoplete renderer");
		assert.strictEqual(
			oFinalRenderer.render,
			Text.getMetadata().getRenderer().render, "final renderer should inherit the render function from the base class");

	});

});
