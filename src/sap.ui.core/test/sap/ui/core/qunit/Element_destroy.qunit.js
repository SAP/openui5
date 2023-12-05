/*global QUnit*/
sap.ui.define([
	'sap/ui/core/Control',
	'sap/ui/core/RenderManager',
	'sap/ui/qunit/utils/nextUIUpdate'
], function(Control, RenderManager, nextUIUpdate) {

	"use strict";

	var TestControl = Control.extend("test.TestControl", {
		metadata: {
			properties: {
				text: { type: "string", defaultValue: "" }
			},
			aggregations: {
				children: { type: "test.TestControl", multiple: true }
			}
		},
		renderer: {
			apiVersion: 2,

			render: function(rm, oControl) {
				rm.openStart("div", oControl).openEnd();
					rm.openStart("span", oControl.getId() + "-text").openEnd();
					rm.text(oControl.getText());
					rm.close("span");
					oControl.getChildren().forEach(function(oChild) {
						rm.renderControl(oChild);
					});
				rm.close("div");
			}
		}
	});

	QUnit.module("DOM", {
		beforeEach: function() {
			this.oControl = new TestControl({
				text: "TestControl"
			});
			this.oParent = new TestControl({
				text: "Parent",
				children: this.oControl
			});

			this.oParent.placeAt("content");
			return nextUIUpdate();
		},
		afterEach: function() {
			this.oParent.destroy();
		}
	});

	QUnit.test("Default destroy", async function(assert) {
		var oRootDomRef = this.oControl.getDomRef();
		var oTextDomRef = this.oControl.getDomRef("text");

		this.oControl.destroy();

		assert.ok(document.body.contains(oRootDomRef), "DOM is not removed synchronously after destroy");
		assert.ok(!this.oControl.getDomRef(), "But control DOM ref is not found");
		assert.ok(oRootDomRef.id != this.oControl.getId(), "Because control DOM id is changed");
		assert.equal(oRootDomRef.getAttribute("data-sap-ui"), this.oControl.getId(), "data-sap-ui attribute still points to the control id");
		assert.equal(oRootDomRef.id.indexOf("sap-ui-destroyed-"), 0, "destroy prefix is added to the control DOM id");
		assert.equal(oTextDomRef.id.indexOf("sap-ui-destroyed-"), 0, "destroy prefix is added to the sub elements as well");

		await nextUIUpdate();
		assert.ok(!document.body.contains(oRootDomRef), "DOM is removed asynchronously");
	});

	QUnit.test("Supressing the invalidation of destroy", function(assert) {
		var oRootDomRef = this.oControl.getDomRef();

		this.oControl.destroy(true);

		assert.ok(!document.body.contains(oRootDomRef), "Control DOM is removed synchronously after destroy");
		assert.ok(!this.oControl.getDomRef(), "Control DOM ref is not found");
	});

	QUnit.test("Supressing the invalidation of destroy with KeepDom", function(assert) {
		var oRootDomRef = this.oControl.getDomRef();

		this.oControl.destroy("KeepDom");
		assert.strictEqual(this.oControl.getDomRef(), oRootDomRef, "Control DOM is not touched after destroy");
	});

	QUnit.test("Destroy control which does not have a parent", function(assert) {
		var oRootDomRef = this.oControl.getDomRef();

		this.oParent.removeAggregation("children", this.oControl, true);
		assert.ok(!this.oControl.getParent(), "Control has no Parent");

		this.oControl.destroy();
		assert.ok(!document.body.contains(oRootDomRef), "Control DOM is removed synchronously after destroy because control had no parent");
		assert.ok(!this.oControl.getDomRef(), "Control DOM ref is not found");
	});

	QUnit.test("Destroy control with KeepDom parameter while control has no parent", function(assert) {
		var oRootDomRef = this.oControl.getDomRef();

		this.oParent.removeAggregation("children", this.oControl, true);
		assert.ok(!this.oControl.getParent(), "Control has no Parent");

		this.oControl.destroy("KeepDom");
		assert.strictEqual(this.oControl.getDomRef(), oRootDomRef, "Control DOM is not touched after destroy");
	});

	QUnit.test("Destroy a control while it is in the preserved area", async function(assert) {
		var oRootDomRef = this.oControl.getDomRef();
		oRootDomRef.setAttribute("data-sap-ui-preserve", oRootDomRef.id);
		RenderManager.preserveContent(oRootDomRef, true);
		this.oControl.invalidate();
		await nextUIUpdate();

		assert.ok(RenderManager.findPreservedContent(this.oControl.getId())[0] === this.oControl.getDomRef(), "Control DOM is in the preserved area");

		this.oControl.destroy();
		assert.notOk(RenderManager.findPreservedContent(this.oControl.getId())[0], "After destroy() call Control DOM is not in the preserved area");
		RenderManager.findPreservedContent(this.oControl.getId()).remove();
	});

	QUnit.test("Destroy a control with KeepDom parameter while it is marked as preserved but not in the preserved area", function(assert) {
		var oRootDomRef = this.oControl.getDomRef();
		oRootDomRef.setAttribute("data-sap-ui-preserve", oRootDomRef.id);

		this.oControl.destroy("KeepDom");
		assert.ok(document.body.contains(oRootDomRef), "After destroy(KeepDom) call Control DOM is still in the DOM tree");
		assert.notOk(oRootDomRef.hasAttribute("data-sap-ui-preserve"), "but preserve marker is removed from the Control DOM");
	});
});