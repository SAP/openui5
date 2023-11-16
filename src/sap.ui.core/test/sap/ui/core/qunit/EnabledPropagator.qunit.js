/*global QUnit */

sap.ui.define([
	'sap/ui/core/Control',
	'sap/ui/core/EnabledPropagator',
	"sap/ui/qunit/utils/nextUIUpdate"
	], function(Control, EnabledPropagator, nextUIUpdate) {
	"use strict";

	var CustomControl = Control.extend("CustomControl", {
		renderer: function(oRM, oControl) {
			oRM.openStart("button", oControl);

			if (!oControl.getEnabled()) {
				oRM.attr("disabled", "");
			}

			oRM.openEnd();
			oRM.close("button");
		}
	});

	// CustomControl2 has 'enabled' property already defined in metadata
	var CustomControl2 = Control.extend("CustomControl2", {
		metadata: {
			properties: {
				enabled: {type: 'boolean', defaultValue: true}
			}
		},
		renderer: function(oRM, oControl) {
			oRM.openStart("button", oControl);

			if (!oControl.getEnabled()) {
				oRM.attr("disabled", "");
			}

			oRM.openEnd();
			oRM.close("button");
		}
	});
	var CustomContainerControl = Control.extend("CustomContainerControl", {
		metadata: {
			properties: {
				enabled: {type: 'boolean', defaultValue: true}
			},
			defaultAggregation: 'content',
			aggregations: {
				content: {type: "sap.ui.core.Control", multiple: false}
			}
		},
		renderer: function(oRM, oControl) {
			oRM.openStart("div", oControl);
			oRM.attr("tabindex", "-1");
			oRM.openEnd();
			oRM.renderControl(oControl.getContent());
			oRM.close("div");
		}
	});

	QUnit.module("Basic");

	QUnit.test("Before applying EnabledPropagator", function(assert) {
		var oControl = new CustomControl();

		assert.notOk(oControl.setEnabled, "setEnabled function shouldn't be available yet.");
		assert.notOk(oControl.getEnabled, "getEnabled function shouldn't be available yet.");

		oControl.destroy();
	});

	[CustomControl, CustomControl2].forEach(function(ControlClass) {
		QUnit.test("After applying EnabledPropagator - " + ControlClass.getMetadata().getName(), function(assert) {
			EnabledPropagator.call(ControlClass.prototype);

			var oControl = new ControlClass();
			assert.ok(typeof oControl.setEnabled === 'function', "'setEnabled' should be a function.");
			assert.ok(typeof oControl.getEnabled === 'function', "'getEnabled' should be a function.");
			assert.ok(typeof oControl.useEnabledPropagator === 'function', "'useEnabledPropagator' should be a function.");

			oControl.destroy();
		});
		QUnit.test("Propagate 'disabled' property to child - " + ControlClass.getMetadata().getName(), async function(assert) {
			var oChildControl = new ControlClass();
			var oParentControl = new CustomContainerControl();

			oParentControl.setContent(oChildControl);
			assert.ok(oParentControl.getEnabled(), "Parent control should be enabled.");
			assert.ok(oChildControl.getEnabled(), "Child control should be enabled.");

			oParentControl.setEnabled(false);
			assert.equal(oParentControl.getEnabled(), false, "Parent control should be disabled.");
			assert.equal(oChildControl.getEnabled(), false, "Child control should be disabled as well.");

			oParentControl.setEnabled(true);
			assert.equal(oParentControl.getEnabled(), true, "Parent control should be enabled again.");
			assert.equal(oChildControl.getEnabled(), true, "Child control should be disabled as enabled again.");

			oChildControl.useEnabledPropagator(false);
			oParentControl.setEnabled(false);
			assert.equal(oParentControl.getEnabled(), false, "Parent control is disabled.");
			assert.equal(oChildControl.getEnabled(), true, "Child control is not disabled with the parent since EnabledPropagator is disabled for the child control");

			oChildControl.useEnabledPropagator(true);
			oParentControl.invalidate();
			await nextUIUpdate();
			assert.equal(oChildControl.getEnabled(), false, "Child control is disabled since EnabledPropagator is active and the parent is disabled");

			oParentControl.destroy();
		});

		QUnit.test("No upper propagation of 'disabled' property - " + ControlClass.getMetadata().getName(), function(assert) {
			var oChildControl = new ControlClass();
			var oParentControl = new CustomContainerControl();

			oParentControl.setContent(oChildControl);
			assert.ok(oParentControl.getEnabled(), "Parent control should be enabled.");
			assert.ok(oChildControl.getEnabled(), "Child control should be enabled.");

			oChildControl.setEnabled(false);
			assert.equal(oParentControl.getEnabled(), true, "Parent control should be still enabled.");
			assert.equal(oChildControl.getEnabled(), false, "Child control should be disabled.");

			oParentControl.destroy();
		});

		QUnit.test("Move Focus to next focusable parent control - " + ControlClass.getMetadata().getName(), async function(assert) {
			var oChildControl = new ControlClass();
			var oParentControl = new CustomContainerControl();

			oParentControl.setContent(oChildControl);
			oParentControl.placeAt("qunit-fixture");

			await nextUIUpdate();

			oChildControl.focus();
			assert.ok(oChildControl.getDomRef().contains(document.activeElement), "Child control should be focused.");

			oChildControl.setEnabled(false);
			// flush as 'setEnabled' invalidates the control
			await nextUIUpdate();

			assert.ok(oParentControl.getDomRef().contains(document.activeElement), "Focus should be moved to parent control.");
			oParentControl.destroy();
		});
	});
});