/* global QUnit */

sap.ui.define([
	"sap/m/Button",
	"sap/m/ObjectAttribute",
	"sap/m/ObjectHeader",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/core/util/reflection/XmlTreeModifier",
	"sap/ui/core/Component",
	"sap/ui/fl/apply/_internal/flexObjects/UIChange",
	"sap/ui/fl/changeHandler/MoveElements",
	"sap/ui/fl/Utils",
	"sap/ui/layout/VerticalLayout",
	"sap/ui/thirdparty/sinon-4"
], function(
	Button,
	ObjectAttribute,
	ObjectHeader,
	JsControlTreeModifier,
	XmlTreeModifier,
	Component,
	UIChange,
	MoveElements,
	Utils,
	VerticalLayout,
	sinon
) {
	"use strict";

	var sandbox = sinon.createSandbox();
	var oComponent;
	var oComponentPromise = Component.create({
		name: "testComponentAsync",
		id: "testComponentAsync"
	}).then(function(oComponentInstance) {
		oComponent = oComponentInstance;
	});

	QUnit.module("Given a Move Elements Change Handler", {
		before() {
			return oComponentPromise;
		},
		beforeEach() {
			// Test Setup:
			// VerticalLayout
			// -- content
			// -- -- ObjectHeader
			// -- -- -- attributes
			// -- -- -- -- ObjectAttribute
			// -- -- -- -- ObjectAttribute2
			// -- -- Button

			sandbox.stub(Utils, "getAppComponentForControl").returns(oComponent);

			this.myObjectAttributeId = "myObjectAttribute";
			this.myObjectAttributeId2 = "myObjectAttributeId2";
			this.myLayoutId = "myLayout";

			this.oButton = new Button(oComponent.createId("myButton"));
			this.oObjectAttribute = new ObjectAttribute(oComponent.createId(this.myObjectAttributeId));
			this.oObjectAttribute2 = new ObjectAttribute(oComponent.createId(this.myObjectAttributeId2));
			this.oObjectHeader = new ObjectHeader(oComponent.createId("myObjectHeader"), {
				attributes: [this.oObjectAttribute, this.oObjectAttribute2]
			});
			this.oLayout = new VerticalLayout(oComponent.createId(this.myLayoutId), {
				content: [this.oObjectHeader, this.oButton]
			});

			var oDOMParser = new DOMParser();
			var oXmlString =
				`<mvc:View  xmlns:mvc="sap.ui.core.mvc" xmlns:layout="sap.ui.layout" xmlns="sap.m"><layout:VerticalLayout id="${this.oLayout.getId()}">` +
					`<layout:content>` +
						`<ObjectHeader id="${this.oObjectHeader.getId()}">` +
							`<ObjectAttribute id="${this.oObjectAttribute.getId()}" />` +
							`<ObjectAttribute id="${this.oObjectAttribute2.getId()}" />` +
						`</ObjectHeader>` +
						`<Button id="${this.oButton.getId()}">` +
						`</Button>` +
					`</layout:content>` +
				`</layout:VerticalLayout></mvc:View>`;
			var oXmlDocument = oDOMParser.parseFromString(oXmlString, "application/xml");

			this.oXmlView = oXmlDocument.documentElement;
			[this.oXmlLayout] = this.oXmlView.childNodes;
			[this.oXmlObjectHeader, this.oXmlButton] = this.oXmlLayout.childNodes[0].childNodes;

			this.mSelectorWithLocalId = {
				id: "myObjectHeader",
				idIsLocal: true,
				aggregation: "attributes",
				type: "sap.m.ObjectHeader"
			};

			this.mSelectorWithGlobalId = {
				id: this.oObjectHeader.getId(),
				aggregation: "attributes",
				type: "sap.m.ObjectHeader"
			};

			this.mSingleMoveChangeContentWithGlobalId = {
				movedElements: [{
					selector: {
						id: this.oObjectAttribute.getId(),
						idIsLocal: false
					},
					sourceIndex: 0,
					targetIndex: 2
				}],
				target: {
					selector: {
						id: this.oLayout.getId(),
						aggregation: "content",
						type: "sap.ui.layout.VerticalLayout"
					}
				}
			};

			this.mSingleMoveChangeContentWithLocalId = {
				movedElements: [{
					selector: {
						id: this.myObjectAttributeId,
						idIsLocal: true
					},
					sourceIndex: 0,
					targetIndex: 2
				}],
				target: {
					selector: {
						id: this.myLayoutId,
						idIsLocal: true,
						aggregation: "content",
						type: "sap.ui.layout.VerticalLayout"
					}
				}
			};

			this.mMultiMoveChangeContentWithGlobalId = {
				movedElements: [{
					selector: {
						id: this.oObjectAttribute.getId(),
						idIsLocal: false
					},
					sourceIndex: 0,
					targetIndex: 2
				}, {
					selector: {
						id: this.oObjectAttribute2.getId(),
						idIsLocal: false
					},
					sourceIndex: 1,
					targetIndex: 3
				}],
				target: {
					selector: {
						id: this.oLayout.getId(),
						aggregation: "content",
						type: "sap.ui.layout.VerticalLayout"
					}
				}
			};

			this.mMultiMoveChangeContentWithLocalId = {
				movedElements: [{
					selector: {
						id: this.myObjectAttributeId,
						idIsLocal: true
					},
					sourceIndex: 0,
					targetIndex: 2
				}, {
					selector: {
						id: this.myObjectAttributeId2,
						idIsLocal: true
					},
					sourceIndex: 1,
					targetIndex: 3
				}],
				target: {
					selector: {
						id: this.myLayoutId,
						idIsLocal: true,
						aggregation: "content",
						type: "sap.ui.layout.VerticalLayout"
					}
				}
			};
		},

		afterEach() {
			this.oLayout.destroy();
			sandbox.restore();
		}
	});

	QUnit.test("When applying the single move change on jsControlTree with local id, Then", function(assert) {
		var oChange = new UIChange({
			selector: this.mSelectorWithLocalId,
			content: this.mSingleMoveChangeContentWithLocalId
		});

		return MoveElements.applyChange(oChange, this.oObjectHeader, {modifier: JsControlTreeModifier, appComponent: oComponent})
		.then(function() {
			assert.equal(this.oObjectHeader.getAttributes().length, 1, "object attribute is removed from the header");
			assert.equal(this.oObjectHeader.getAttributes()[0].getId(), this.oObjectAttribute2.getId(),
				"object attribute 2 is still in the header");
			assert.equal(this.oLayout.getContent()[0].getId(), this.oObjectHeader.getId(), "object header is still at 1. position");
			assert.equal(this.oLayout.getContent()[1].getId(), this.oButton.getId(), "button is still at 2. position");
			assert.equal(this.oLayout.getContent()[2].getId(), this.oObjectAttribute.getId(),
				"object attribute is inserted at the 3. position");
		}.bind(this));
	});

	QUnit.test("When applying the single move change on jsControlTree with global id, Then", function(assert) {
		var oChange = new UIChange({
			selector: this.mSelectorWithGlobalId,
			content: this.mSingleMoveChangeContentWithGlobalId
		});

		return MoveElements.applyChange(oChange, this.oObjectHeader, {modifier: JsControlTreeModifier})
		.then(function() {
			assert.equal(this.oObjectHeader.getAttributes().length, 1, "object attribute is removed from the header");
			assert.equal(this.oObjectHeader.getAttributes()[0].getId(), this.oObjectAttribute2.getId(), "object attribute 2 is still in the header");
			assert.equal(this.oLayout.getContent()[0].getId(), this.oObjectHeader.getId(), "object header is still at 1. position");
			assert.equal(this.oLayout.getContent()[1].getId(), this.oButton.getId(), "button is still at 2. position");
			assert.equal(this.oLayout.getContent()[2].getId(), this.oObjectAttribute.getId(), "object attribute is inserted at the 3. position");
		}.bind(this));
	});

	QUnit.test("When applying the multi move change on jsControlTree with local id, Then", function(assert) {
		var oChange = new UIChange({
			selector: this.mSelectorWithLocalId,
			content: this.mMultiMoveChangeContentWithLocalId
		});

		return MoveElements.applyChange(oChange, this.oObjectHeader, {modifier: JsControlTreeModifier, appComponent: oComponent})
		.then(function() {
			assert.equal(this.oObjectHeader.getAttributes().length, 0, "both object attributes removed from the header");
			assert.equal(this.oLayout.getContent()[0].getId(), this.oObjectHeader.getId(), "object header is still at 1. position");
			assert.equal(this.oLayout.getContent()[1].getId(), this.oButton.getId(), "button is still at 2. position");
			assert.equal(this.oLayout.getContent()[2].getId(), this.oObjectAttribute.getId(), "object attribute is inserted at the 3. position");
			assert.equal(this.oLayout.getContent()[3].getId(), this.oObjectAttribute2.getId(), "object attribute 2 is inserted at the 4. position");
		}.bind(this));
	});

	QUnit.test("When applying the multi move change on jsControlTree with global id, Then", function(assert) {
		var oChange = new UIChange({
			selector: this.mSelectorWithGlobalId,
			content: this.mMultiMoveChangeContentWithGlobalId
		});

		return MoveElements.applyChange(oChange, this.oObjectHeader, {modifier: JsControlTreeModifier})
		.then(function() {
			assert.equal(this.oObjectHeader.getAttributes().length, 0, "both object attributes removed from the header");
			assert.equal(this.oLayout.getContent()[0].getId(), this.oObjectHeader.getId(), "object header is still at 1. position");
			assert.equal(this.oLayout.getContent()[1].getId(), this.oButton.getId(), "button is still at 2. position");
			assert.equal(this.oLayout.getContent()[2].getId(), this.oObjectAttribute.getId(), "object attribute is inserted at the 3. position");
			assert.equal(this.oLayout.getContent()[3].getId(), this.oObjectAttribute2.getId(), "object attribute 2 is inserted at the 4. position");
		}.bind(this));
	});

	QUnit.test("When applying broken changes (functionality independent of modifier), Then", function(assert) {
		var oChange = new UIChange({
			selector: {
				id: this.oObjectHeader.getId()
			},
			content: this.mMultiMoveChangeContentWithGlobalId
		});

		return MoveElements.applyChange(oChange, this.oObjectHeader, {modifier: JsControlTreeModifier})
		.catch(function(oError) {
			assert.equal(oError.message, "No source aggregation supplied via selector for move", "missing source aggregation error captured");
			oChange = new UIChange({
				selector: this.mSelectorWithGlobalId,
				content: {
					movedElements: [{
						selector: {
							id: this.oObjectAttribute.getId(),
							type: "sap.m.ObjectAttribute"
						},
						sourceIndex: 0,
						targetIndex: 1
					}]
				}
			});
			return MoveElements.applyChange(oChange, this.oObjectHeader, {modifier: JsControlTreeModifier});
		}.bind(this))
		.catch(function(oError) {
			assert.equal(oError.message, "No target supplied for move", "missing target error captured");
			oChange = new UIChange({
				selector: this.mSelectorWithGlobalId,
				content: {
					movedElements: [{
						selector: {
							id: this.oObjectAttribute.getId(),
							type: "sap.m.ObjectAttribute"
						},
						sourceIndex: 0,
						targetIndex: 1
					}],
					target: {
						selector: {
							id: "unkown"
						}
					}
				}
			});
			return MoveElements.applyChange(oChange, this.oObjectHeader, {modifier: JsControlTreeModifier});
		}.bind(this))
		.catch(function(oError) {
			assert.equal(oError.message, "Move target parent not found", "unkown target error captured");
			oChange = new UIChange({
				selector: this.mSelectorWithGlobalId,
				content: {
					movedElements: [{
						selector: {
							id: this.oObjectAttribute.getId()
						},
						sourceIndex: 0,
						targetIndex: 1
					}],
					target: {
						selector: {
							id: this.oLayout.getId()
						}
					}
				}
			});
			return MoveElements.applyChange(oChange, this.oObjectHeader, {modifier: JsControlTreeModifier});
		}.bind(this))
		.catch(function(oError) {
			assert.equal(oError.message, "No target aggregation supplied for move", "missing target aggregation error captured");
			oChange = new UIChange({
				selector: this.mSelectorWithGlobalId,
				content: {
					target: {
						selector: {
							id: this.oLayout.getId(),
							aggregation: "content"
						}
					}
				}
			});
			return MoveElements.applyChange(oChange, this.oObjectHeader, {modifier: JsControlTreeModifier});
		}.bind(this))
		.catch(function(oError) {
			assert.equal(oError.message, "Change format invalid", "missing moved elements error captured");
			oChange = new UIChange({
				selector: this.mSelectorWithGlobalId,
				content: {
					movedElements: [{
						selector: {
							id: this.oObjectAttribute.getId()
						},
						sourceIndex: 0
					}],
					target: {
						selector: {
							id: this.oLayout.getId(),
							aggregation: "content"
						}
					}
				}
			});
			return MoveElements.applyChange(oChange, this.oObjectHeader, {modifier: JsControlTreeModifier});
		}.bind(this))
		.catch(function(oError) {
			assert.equal(
				oError.message,
				`Missing targetIndex for element with id '${
						 this.oObjectAttribute.getId()}' in movedElements supplied`,
				"missing target index error captured");
		}.bind(this));
	});

	QUnit.test("When applying the single move change on xmlControlTree with local id, Then", function(assert) {
		var oChange = new UIChange({
			selector: this.mSelectorWithLocalId,
			content: this.mSingleMoveChangeContentWithLocalId
		});

		return MoveElements.applyChange(oChange, this.oXmlObjectHeader, {modifier: XmlTreeModifier, appComponent: oComponent, view: this.oXmlView})
		.then(function() {
			assert.equal(this.oXmlObjectHeader.childNodes.length, 1, "object attribute is removed from the header");
			assert.equal(this.oXmlObjectHeader.childNodes[0].getAttribute("id"), this.oObjectAttribute2.getId(), "object attribute 2 is still in the header");
			assert.equal(this.oXmlLayout.childNodes[0].childNodes[0].getAttribute("id"), this.oObjectHeader.getId(), "object header is still at 1. position");
			assert.equal(this.oXmlLayout.childNodes[0].childNodes[1].getAttribute("id"), this.oButton.getId(), "button is still at 2. position");
			assert.equal(this.oXmlLayout.childNodes[0].childNodes[2].getAttribute("id"), this.oObjectAttribute.getId(), "object attribute is inserted at the 3. position");
		}.bind(this));
	});

	QUnit.test("When applying the single move change on xmlControlTree with global id, Then", function(assert) {
		var oChange = new UIChange({
			selector: this.mSelectorWithGlobalId,
			content: this.mSingleMoveChangeContentWithGlobalId
		});

		return MoveElements.applyChange(oChange, this.oXmlObjectHeader, {modifier: XmlTreeModifier, view: this.oXmlView})
		.then(function() {
			assert.equal(this.oXmlObjectHeader.childNodes.length, 1, "object attribute is removed from the header");
			assert.equal(this.oXmlObjectHeader.childNodes[0].getAttribute("id"), this.oObjectAttribute2.getId(), "object attribute 2 is still in the header");
			assert.equal(this.oXmlLayout.childNodes[0].childNodes[0].getAttribute("id"), this.oObjectHeader.getId(), "object header is still at 1. position");
			assert.equal(this.oXmlLayout.childNodes[0].childNodes[1].getAttribute("id"), this.oButton.getId(), "button is still at 2. position");
			assert.equal(this.oXmlLayout.childNodes[0].childNodes[2].getAttribute("id"), this.oObjectAttribute.getId(), "object attribute is inserted at the 3. position");
		}.bind(this));
	});

	QUnit.test("When applying the multi move change on xmlControlTree with local id, Then", function(assert) {
		var oChange = new UIChange({
			selector: this.mSelectorWithLocalId,
			content: this.mMultiMoveChangeContentWithLocalId
		});

		return MoveElements.applyChange(oChange, this.oXmlObjectHeader, {modifier: XmlTreeModifier, appComponent: oComponent, view: this.oXmlView})
		.then(function() {
			assert.equal(this.oXmlObjectHeader.childNodes.length, 0, "both object attributes removed from the header");
			assert.equal(this.oXmlLayout.childNodes[0].childNodes[0].getAttribute("id"), this.oObjectHeader.getId(), "object header is still at 1. position");
			assert.equal(this.oXmlLayout.childNodes[0].childNodes[1].getAttribute("id"), this.oButton.getId(), "button is still at 2. position");
			assert.equal(this.oXmlLayout.childNodes[0].childNodes[2].getAttribute("id"), this.oObjectAttribute.getId(), "object attribute is inserted at the 3. position");
			assert.equal(this.oXmlLayout.childNodes[0].childNodes[3].getAttribute("id"), this.oObjectAttribute2.getId(), "object attribute 2 is inserted at the 4. position");
		}.bind(this));
	});

	QUnit.test("When applying the multi move change on xmlControlTree with global id, Then", function(assert) {
		var oChange = new UIChange({
			selector: this.mSelectorWithGlobalId,
			content: this.mMultiMoveChangeContentWithGlobalId
		});

		return MoveElements.applyChange(oChange, this.oXmlObjectHeader, {modifier: XmlTreeModifier, view: this.oXmlView})
		.then(function() {
			assert.equal(this.oXmlObjectHeader.childNodes.length, 0, "both object attributes removed from the header");
			assert.equal(this.oXmlLayout.childNodes[0].childNodes[0].getAttribute("id"), this.oObjectHeader.getId(), "object header is still at 1. position");
			assert.equal(this.oXmlLayout.childNodes[0].childNodes[1].getAttribute("id"), this.oButton.getId(), "button is still at 2. position");
			assert.equal(this.oXmlLayout.childNodes[0].childNodes[2].getAttribute("id"), this.oObjectAttribute.getId(), "object attribute is inserted at the 3. position");
			assert.equal(this.oXmlLayout.childNodes[0].childNodes[3].getAttribute("id"), this.oObjectAttribute2.getId(), "object attribute 2 is inserted at the 4. position");
		}.bind(this));
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});