/*global QUnit */
sap.ui.define([
	'sap/ui/core/Control',
	'sap/ui/core/Renderer',
	'sap/base/util/ObjectPath'
], function(Control, Renderer, ObjectPath) {
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

});
