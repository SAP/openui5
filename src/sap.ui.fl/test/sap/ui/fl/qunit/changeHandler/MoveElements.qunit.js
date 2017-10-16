/*global QUnit,sinon*/

jQuery.sap.require("sap.ui.fl.changeHandler.MoveElements");
jQuery.sap.require("sap.m.Button");
jQuery.sap.require("sap.m.ObjectAttribute");
jQuery.sap.require("sap.m.ObjectHeader");
jQuery.sap.require("sap.ui.layout.VerticalLayout");
jQuery.sap.require("sap.ui.fl.Change");
jQuery.sap.require("sap.ui.fl.changeHandler.JsControlTreeModifier");
jQuery.sap.require("sap.ui.fl.changeHandler.XmlTreeModifier");

(function(MoveElementsHandler, Change, JsControlTreeModifier, XmlTreeModifier) {
	"use strict";

	jQuery.sap.registerModulePath("testComponent", "../testComponent");

	var sandbox = sinon.sandbox.create();
	var oComponent = sap.ui.getCore().createComponent({
		name : "testComponent",
		id : "testComponent"
	});

	QUnit.module("Given a Move Elements Change Handler", {
		beforeEach : function() {

			// Test Setup:
			// VerticalLayout
			// -- content
			// -- -- ObjectHeader
			// -- -- -- attributes
			// -- -- -- -- ObjectAttribute
			// -- -- -- -- ObjectAttribute2
			// -- -- Button

			sandbox.stub(sap.ui.fl.Utils, "getAppComponentForControl").returns(oComponent);

			this.myObjectAttributeId = "myObjectAttribute";
			this.myObjectAttributeId2 = "myObjectAttributeId2";
			this.myLayoutId = "myLayout";


			this.oButton = new sap.m.Button(oComponent.createId("myButton"));
			this.oObjectAttribute = new sap.m.ObjectAttribute(oComponent.createId(this.myObjectAttributeId));
			this.oObjectAttribute2 = new sap.m.ObjectAttribute(oComponent.createId(this.myObjectAttributeId2));
			this.oObjectHeader = new sap.m.ObjectHeader(oComponent.createId("myObjectHeader") ,{
				attributes : [this.oObjectAttribute, this.oObjectAttribute2]
			});
			this.oLayout = new sap.ui.layout.VerticalLayout(oComponent.createId(this.myLayoutId) ,{
				content : [this.oObjectHeader, this.oButton]
			});

			var oDOMParser = new DOMParser();
			var oXmlString =
				'<mvc:View  xmlns:mvc="sap.ui.core.mvc" xmlns:layout="sap.ui.layout" xmlns="sap.m"><layout:VerticalLayout id="' + this.oLayout.getId() + '">' +
					'<layout:content>' +
						'<ObjectHeader id="' + this.oObjectHeader.getId() + '">' +
							'<ObjectAttribute id="' + this.oObjectAttribute.getId() + '" />' +
							'<ObjectAttribute id="' + this.oObjectAttribute2.getId() + '" />' +
						'</ObjectHeader>' +
						'<Button id="' + this.oButton.getId() + '">' +
						'</Button>' +
					'</layout:content>' +
				'</layout:VerticalLayout></mvc:View>';
			var oXmlDocument = oDOMParser.parseFromString(oXmlString, "application/xml");

			this.oXmlView = oXmlDocument.documentElement;
			this.oXmlLayout = this.oXmlView.childNodes[0];
			this.oXmlObjectHeader = this.oXmlLayout.childNodes[0].childNodes[0];
			this.oXmlButton = this.oXmlLayout.childNodes[0].childNodes[1];

			this.mSelectorWithLocalId = {
				id : "myObjectHeader",
				idIsLocal: true,
				aggregation : "attributes",
				type : "sap.m.ObjectHeader"
			};

			this.mSelectorWithGlobalId = {
				id : this.oObjectHeader.getId(),
				aggregation : "attributes",
				type : "sap.m.ObjectHeader"
			};

			this.mSingleMoveChangeContentWithGlobalId = {
				movedElements : [{
					selector : {
						id : this.oObjectAttribute.getId(),
						idIsLocal : false
					},
					sourceIndex : 0,
					targetIndex : 2
				}],
				target : {
					selector : {
						id : this.oLayout.getId(),
						aggregation : "content",
						type : "sap.ui.layout.VerticalLayout"
					}
				}
			};

			this.mSingleMoveChangeContentWithLocalId = {
				movedElements : [{
					selector : {
						id : this.myObjectAttributeId,
						idIsLocal : true
					},
					sourceIndex : 0,
					targetIndex : 2
				}],
				target : {
					selector : {
						id : this.myLayoutId,
						idIsLocal: true,
						aggregation : "content",
						type : "sap.ui.layout.VerticalLayout"
					}
				}
			};

			this.mMultiMoveChangeContentWithGlobalId = {
				movedElements : [{
					selector : {
						id : this.oObjectAttribute.getId(),
						idIsLocal : false
					},
					sourceIndex : 0,
					targetIndex : 2
				}, {
					selector : {
						id : this.oObjectAttribute2.getId(),
						idIsLocal : false
					},
					sourceIndex : 1,
					targetIndex : 3
				}],
				target : {
					selector : {
						id : this.oLayout.getId(),
						aggregation : "content",
						type : "sap.ui.layout.VerticalLayout"
					}
				}
			};

			this.mMultiMoveChangeContentWithLocalId = {
				movedElements : [{
					selector : {
						id : this.myObjectAttributeId,
						idIsLocal : true
					},
					sourceIndex : 0,
					targetIndex : 2
				}, {
					selector : {
						id : this.myObjectAttributeId2,
						idIsLocal : true
					},
					sourceIndex : 1,
					targetIndex : 3
				}],
				target : {
					selector : {
						id : this.myLayoutId,
						idIsLocal: true,
						aggregation : "content",
						type : "sap.ui.layout.VerticalLayout"
					}
				}
			};
		},

		afterEach : function() {
			this.oLayout.destroy();
			sandbox.restore();
		}
	});

	QUnit.test("When applying the single move change on jsControlTree with local id, Then", function(assert) {
		var oChange = new Change({
			selector : this.mSelectorWithLocalId,
			content : this.mSingleMoveChangeContentWithLocalId
		});

		assert.ok(MoveElementsHandler.applyChange(oChange, this.oObjectHeader, {modifier: JsControlTreeModifier, appComponent: oComponent}));

		assert.equal(this.oObjectHeader.getAttributes().length, 1, "object attribute is removed from the header");
		assert.equal(this.oObjectHeader.getAttributes()[0].getId(), this.oObjectAttribute2.getId(), "object attribute 2 is still in the header");
		assert.equal(this.oLayout.getContent()[0].getId(), this.oObjectHeader.getId(), "object header is still at 1. position");
		assert.equal(this.oLayout.getContent()[1].getId(), this.oButton.getId(), "button is still at 2. position");
		assert.equal(this.oLayout.getContent()[2].getId(), this.oObjectAttribute.getId(), "object attribute is inserted at the 3. position");
	});

	QUnit.test("When applying the single move change on jsControlTree with global id, Then", function(assert) {
		var oChange = new Change({
			selector : this.mSelectorWithGlobalId,
			content : this.mSingleMoveChangeContentWithGlobalId
		});

		assert.ok(MoveElementsHandler.applyChange(oChange, this.oObjectHeader, {modifier: JsControlTreeModifier}));

		assert.equal(this.oObjectHeader.getAttributes().length, 1, "object attribute is removed from the header");
		assert.equal(this.oObjectHeader.getAttributes()[0].getId(), this.oObjectAttribute2.getId(), "object attribute 2 is still in the header");
		assert.equal(this.oLayout.getContent()[0].getId(), this.oObjectHeader.getId(), "object header is still at 1. position");
		assert.equal(this.oLayout.getContent()[1].getId(), this.oButton.getId(), "button is still at 2. position");
		assert.equal(this.oLayout.getContent()[2].getId(), this.oObjectAttribute.getId(), "object attribute is inserted at the 3. position");
	});

	QUnit.test("When applying the multi move change on jsControlTree with local id, Then", function(assert) {
		var oChange = new Change({
			selector : this.mSelectorWithLocalId,
			content : this.mMultiMoveChangeContentWithLocalId
		});

		assert.ok(MoveElementsHandler.applyChange(oChange, this.oObjectHeader, {modifier: JsControlTreeModifier, appComponent: oComponent}));

		assert.equal(this.oObjectHeader.getAttributes().length, 0, "both object attributes removed from the header");
		assert.equal(this.oLayout.getContent()[0].getId(), this.oObjectHeader.getId(), "object header is still at 1. position");
		assert.equal(this.oLayout.getContent()[1].getId(), this.oButton.getId(), "button is still at 2. position");
		assert.equal(this.oLayout.getContent()[2].getId(), this.oObjectAttribute.getId(), "object attribute is inserted at the 3. position");
		assert.equal(this.oLayout.getContent()[3].getId(), this.oObjectAttribute2.getId(), "object attribute 2 is inserted at the 4. position");
	});

	QUnit.test("When applying the multi move change on jsControlTree with global id, Then", function(assert) {
		var oChange = new Change({
			selector : this.mSelectorWithGlobalId,
			content : this.mMultiMoveChangeContentWithGlobalId
		});

		assert.ok(MoveElementsHandler.applyChange(oChange, this.oObjectHeader, {modifier: JsControlTreeModifier}));

		assert.equal(this.oObjectHeader.getAttributes().length, 0, "both object attributes removed from the header");
		assert.equal(this.oLayout.getContent()[0].getId(), this.oObjectHeader.getId(), "object header is still at 1. position");
		assert.equal(this.oLayout.getContent()[1].getId(), this.oButton.getId(), "button is still at 2. position");
		assert.equal(this.oLayout.getContent()[2].getId(), this.oObjectAttribute.getId(), "object attribute is inserted at the 3. position");
		assert.equal(this.oLayout.getContent()[3].getId(), this.oObjectAttribute2.getId(), "object attribute 2 is inserted at the 4. position");
	});

	QUnit.test("When applying broken changes (functionality independent of modifier), Then", function(assert) {
		var oChange = new Change({
			selector : {
				id : this.oObjectHeader.getId()
			},
			content : this.mMultiMoveChangeContentWithGlobalId
		});

		assert.throws(function() {
			MoveElementsHandler.applyChange(oChange, this.oObjectHeader, {modifier: JsControlTreeModifier});
		}, new Error("No source aggregation supplied via selector for move"), "missing source aggregation error captured");

		oChange = new Change({
			selector : this.mSelectorWithGlobalId,
			content : {
				movedElements : [{
					selector : {
						id : this.oObjectAttribute.getId(),
						type : "sap.m.ObjectAttribute"
					},
					sourceIndex : 0,
					targetIndex : 1
				}]
			}
		});

		assert.throws(function() {
			MoveElementsHandler.applyChange(oChange, this.oObjectHeader, {modifier: JsControlTreeModifier});
		}, new Error("No target supplied for move"), "missing target error captured");

		oChange = new Change({
			selector : this.mSelectorWithGlobalId,
			content : {
				movedElements : [{
					selector : {
						id : this.oObjectAttribute.getId(),
						type : "sap.m.ObjectAttribute"
					},
					sourceIndex : 0,
					targetIndex : 1
				}],
				target : {
					selector : {
						id : "unkown"
					}
				}
			}
		});

		assert.throws(function() {
			MoveElementsHandler.applyChange(oChange, this.oObjectHeader, {modifier: JsControlTreeModifier});
		}, new Error("Move target parent not found"), "unkown target error captured");

		oChange = new Change({
			selector : this.mSelectorWithGlobalId,
			content : {
				movedElements : [{
					selector : {
						id : this.oObjectAttribute.getId()
					},
					sourceIndex : 0,
					targetIndex : 1
				}],
				target : {
					selector : {
						id : this.oLayout.getId()
					}
				}
			}
		});

		assert.throws(function() {
			MoveElementsHandler.applyChange(oChange, this.oObjectHeader, {modifier: JsControlTreeModifier});
		}, new Error("No target aggregation supplied for move"), "missing target aggregation error captured");

		oChange = new Change({
			selector : this.mSelectorWithGlobalId,
			content : {
				target : {
					selector : {
						id : this.oLayout.getId(),
						aggregation : "content"
					}
				}
			}
		});

		assert.throws(function() {
			MoveElementsHandler.applyChange(oChange, this.oObjectHeader, {modifier: JsControlTreeModifier});
		}, new Error("Change format invalid"), "missing moved elements error captured");

		oChange = new Change({
			selector : this.mSelectorWithGlobalId,
			content : {
				movedElements : [{
					selector : {
						id : this.oObjectAttribute.getId()
					},
					sourceIndex : 0
				}],
				target :{
					selector : {
						id : this.oLayout.getId(),
						aggregation : "content"
					}
				}
			}
		});

		assert.throws(function() {
			MoveElementsHandler.applyChange(oChange, this.oObjectHeader, {modifier: JsControlTreeModifier});
		}, new Error("Missing targetIndex for element with id '" + this.oObjectAttribute.getId()
				+ "' in movedElements supplied"), "missing target index error captured");
	});

	QUnit.test("When applying the single move change on xmlControlTree with local id, Then", function(assert) {
		var oChange = new Change({
			selector : this.mSelectorWithLocalId,
			content : this.mSingleMoveChangeContentWithLocalId
		});

		assert.ok(MoveElementsHandler.applyChange(oChange, this.oXmlObjectHeader, {modifier: XmlTreeModifier, appComponent: oComponent, view: this.oXmlView}));

		assert.equal(this.oXmlObjectHeader.childNodes.length, 1, "object attribute is removed from the header");
		assert.equal(this.oXmlObjectHeader.childNodes[0].getAttribute("id"), this.oObjectAttribute2.getId(), "object attribute 2 is still in the header");
		assert.equal(this.oXmlLayout.childNodes[0].childNodes[0].getAttribute("id"), this.oObjectHeader.getId(), "object header is still at 1. position");
		assert.equal(this.oXmlLayout.childNodes[0].childNodes[1].getAttribute("id"), this.oButton.getId(), "button is still at 2. position");
		assert.equal(this.oXmlLayout.childNodes[0].childNodes[2].getAttribute("id"), this.oObjectAttribute.getId(), "object attribute is inserted at the 3. position");
	});

	QUnit.test("When applying the single move change on xmlControlTree with global id, Then", function(assert) {
		var oChange = new Change({
			selector : this.mSelectorWithGlobalId,
			content : this.mSingleMoveChangeContentWithGlobalId
		});

		assert.ok(MoveElementsHandler.applyChange(oChange, this.oXmlObjectHeader, {modifier: XmlTreeModifier, view: this.oXmlView}));

		assert.equal(this.oXmlObjectHeader.childNodes.length, 1, "object attribute is removed from the header");
		assert.equal(this.oXmlObjectHeader.childNodes[0].getAttribute("id"), this.oObjectAttribute2.getId(), "object attribute 2 is still in the header");
		assert.equal(this.oXmlLayout.childNodes[0].childNodes[0].getAttribute("id"), this.oObjectHeader.getId(), "object header is still at 1. position");
		assert.equal(this.oXmlLayout.childNodes[0].childNodes[1].getAttribute("id"), this.oButton.getId(), "button is still at 2. position");
		assert.equal(this.oXmlLayout.childNodes[0].childNodes[2].getAttribute("id"), this.oObjectAttribute.getId(), "object attribute is inserted at the 3. position");
	});

	QUnit.test("When applying the multi move change on xmlControlTree with local id, Then", function(assert) {
		var oChange = new Change({
			selector : this.mSelectorWithLocalId,
			content : this.mMultiMoveChangeContentWithLocalId
		});

		assert.ok(MoveElementsHandler.applyChange(oChange, this.oXmlObjectHeader, {modifier: XmlTreeModifier, appComponent: oComponent, view:  this.oXmlView}));

		assert.equal(this.oXmlObjectHeader.childNodes.length, 0, "both object attributes removed from the header");
		assert.equal(this.oXmlLayout.childNodes[0].childNodes[0].getAttribute("id"), this.oObjectHeader.getId(), "object header is still at 1. position");
		assert.equal(this.oXmlLayout.childNodes[0].childNodes[1].getAttribute("id"), this.oButton.getId(), "button is still at 2. position");
		assert.equal(this.oXmlLayout.childNodes[0].childNodes[2].getAttribute("id"), this.oObjectAttribute.getId(), "object attribute is inserted at the 3. position");
		assert.equal(this.oXmlLayout.childNodes[0].childNodes[3].getAttribute("id"), this.oObjectAttribute2.getId(), "object attribute 2 is inserted at the 4. position");
	});

	QUnit.test("When applying the multi move change on xmlControlTree with global id, Then", function(assert) {
		var oChange = new Change({
			selector : this.mSelectorWithGlobalId,
			content : this.mMultiMoveChangeContentWithGlobalId
		});

		assert.ok(MoveElementsHandler.applyChange(oChange, this.oXmlObjectHeader, {modifier: XmlTreeModifier, view:  this.oXmlView}));

		assert.equal(this.oXmlObjectHeader.childNodes.length, 0, "both object attributes removed from the header");
		assert.equal(this.oXmlLayout.childNodes[0].childNodes[0].getAttribute("id"), this.oObjectHeader.getId(), "object header is still at 1. position");
		assert.equal(this.oXmlLayout.childNodes[0].childNodes[1].getAttribute("id"), this.oButton.getId(), "button is still at 2. position");
		assert.equal(this.oXmlLayout.childNodes[0].childNodes[2].getAttribute("id"), this.oObjectAttribute.getId(), "object attribute is inserted at the 3. position");
		assert.equal(this.oXmlLayout.childNodes[0].childNodes[3].getAttribute("id"), this.oObjectAttribute2.getId(), "object attribute 2 is inserted at the 4. position");
	});
}(sap.ui.fl.changeHandler.MoveElements, sap.ui.fl.Change, sap.ui.fl.changeHandler.JsControlTreeModifier, sap.ui.fl.changeHandler.XmlTreeModifier));
