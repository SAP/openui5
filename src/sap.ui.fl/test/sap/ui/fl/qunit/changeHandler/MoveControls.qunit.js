/* global QUnit */

sap.ui.define([
	"sap/m/Bar",
	"sap/m/Button",
	"sap/m/ObjectAttribute",
	"sap/m/ObjectHeader",
	"sap/ui/core/mvc/XMLView",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/core/util/reflection/XmlTreeModifier",
	"sap/ui/core/ComponentContainer",
	"sap/ui/core/Component",
	"sap/ui/core/UIComponent",
	"sap/ui/core/XMLTemplateProcessor",
	"sap/ui/fl/changeHandler/MoveControls",
	"sap/ui/fl/apply/_internal/flexObjects/UIChange",
	"sap/ui/fl/Utils",
	"sap/ui/layout/VerticalLayout",
	"sap/ui/thirdparty/sinon-4"
], function(
	Bar,
	Button,
	ObjectAttribute,
	ObjectHeader,
	XMLView,
	JsControlTreeModifier,
	XmlTreeModifier,
	ComponentContainer,
	Component,
	UIComponent,
	XMLTemplateProcessor,
	MoveControlsHandler,
	UIChange,
	Utils,
	VerticalLayout,
	sinon
) {
	"use strict";

	var myObjectAttributeId = "myObjectAttribute";
	var myObjectAttributeId2 = "myObjectAttributeId2";
	var myLayoutId = "myLayout";
	var myObjectHeaderId = "myObjectHeader";
	var myButtonId = "myButton";

	var sandbox = sinon.createSandbox();
	var oComponent;
	var oComponentPromise = Component.create({
		name: "testComponentAsync",
		id: "testComponentAsync"
	}).then(function(oComponentInstance) {
		oComponent = oComponentInstance;
	});

	function getSingleMoveChangeContent(bIdIsLocal, sObjectAttributeId, sObjectHeaderId, sLayoutId) {
		return {
			movedElements: [{
				selector: {
					id: sObjectAttributeId,
					idIsLocal: bIdIsLocal
				},
				sourceIndex: 0,
				targetIndex: 2
			}],
			source: {
				selector: {
					id: sObjectHeaderId,
					idIsLocal: bIdIsLocal,
					aggregation: "attributes",
					type: "sap.m.ObjectHeader"
				}
			},
			target: {
				selector: {
					id: sLayoutId,
					idIsLocal: bIdIsLocal,
					aggregation: "content",
					type: "sap.ui.layout.VerticalLayout"
				}
			}
		};
	}

	function getSingleMoveChangeContentWrongAggregation(bIdIsLocal, sObjectAttributeId, sLayoutId) {
		return {
			movedElements: [{
				selector: {
					id: sObjectAttributeId,
					idIsLocal: bIdIsLocal
				},
				sourceIndex: 0,
				targetIndex: 2
			}],
			source: {
				selector: {
					id: sLayoutId,
					idIsLocal: bIdIsLocal,
					aggregation: "attributes2",
					type: "sap.m.ObjectHeader"
				}
			},
			target: {
				selector: {
					id: sLayoutId,
					idIsLocal: bIdIsLocal,
					aggregation: "content",
					type: "sap.ui.layout.VerticalLayout"
				}
			}
		};
	}

	function getMultiMoveChangeContent(bIdIsLocal, sObjectAttributeId, sObjectAttributeId2, sObjectHeaderId, sLayoutId) {
		return {
			movedElements: [{
				selector: {
					id: sObjectAttributeId,
					idIsLocal: bIdIsLocal
				},
				sourceIndex: 0,
				targetIndex: 2
			}, {
				selector: {
					id: sObjectAttributeId2,
					idIsLocal: bIdIsLocal
				},
				sourceIndex: 1,
				targetIndex: 3
			}],
			source: {
				selector: {
					id: sObjectHeaderId,
					idIsLocal: bIdIsLocal,
					aggregation: "attributes",
					type: "sap.m.ObjectHeader"
				}
			},
			target: {
				selector: {
					id: sLayoutId,
					idIsLocal: bIdIsLocal,
					aggregation: "content",
					type: "sap.ui.layout.VerticalLayout"
				}
			}
		};
	}

	function getSelector(bIdIsLocal, sLayoutId) {
		return {
			id: sLayoutId,
			idIsLocal: bIdIsLocal
		};
	}

	function assertInitialState(assert) {
		assert.strictEqual(this.oObjectHeader.getAttributes().length, 2, "ObjectHeader has 2 Attributes");
		assert.strictEqual(
			this.oObjectHeader.getAttributes()[0].getId(),
			this.oObjectAttribute.getId(),
			"object attribute 1 is first in the header"
		);
		assert.strictEqual(
			this.oObjectHeader.getAttributes()[1].getId(),
			this.oObjectAttribute2.getId(),
			"object attribute 2 is second in the header"
		);
		assert.strictEqual(this.oLayout.getContent()[0].getId(), this.oObjectHeader.getId(), "object header is still at 1. position");
		assert.strictEqual(this.oLayout.getContent()[1].getId(), this.oButton.getId(), "button is still at 2. position");
		assert.strictEqual(this.oLayout.getContent().length, 2, "Layout has 2 Items in it");
	}

	function assertOriginalStateXML(assert) {
		assert.strictEqual(this.oXmlObjectHeader.childNodes.length, 2, "both object attributes added back from the header");
		assert.strictEqual(
			this.oXmlObjectHeader.childNodes[0].getAttribute("id"),
			this.oGlobalAttribute.getId(),
			"object attribute 1 is first in the header"
		);
		assert.strictEqual(
			this.oXmlObjectHeader.childNodes[1].getAttribute("id"),
			this.oGlobalAttribute2.getId(),
			"object attribute 2 is second in the header"
		);
		assert.strictEqual(
			this.oXmlLayout.childNodes[0].getAttribute("id"), this.oGlobalObjectHeader.getId(), "object header is still at 1. position");
		assert.strictEqual(this.oXmlLayout.childNodes[1].getAttribute("id"), this.oGlobalButton.getId(), "button is still at 2. position");
		assert.strictEqual(this.oXmlLayout.childNodes[0].childNodes.length, 2, "Layout has 2 Items in it");
	}

	QUnit.module("Given a Move Controls Change Handler on jsControlTree", {
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

			// define js-structure (same as xml-structure see below) for jsView
			this.oButton = new Button(oComponent.createId(myButtonId));
			this.oObjectAttribute = new ObjectAttribute(oComponent.createId(myObjectAttributeId));
			this.oObjectAttribute2 = new ObjectAttribute(oComponent.createId(myObjectAttributeId2));
			this.oObjectHeader = new ObjectHeader(oComponent.createId(myObjectHeaderId), {
				attributes: [this.oObjectAttribute, this.oObjectAttribute2]
			});
			this.oLayout = new VerticalLayout(oComponent.createId(myLayoutId), {
				content: [this.oObjectHeader, this.oButton]
			});

			// local id's for JsControlTreeModifier
			this.mSelectorWithLocalId = getSelector(true, myLayoutId);

			// global id's for JsControlTreeModifier
			this.mSelectorWithGlobalId = getSelector(false, this.oLayout.getId());

			// local id's for JsControlTreeModifier
			this.mSingleMoveChangeContentWithLocalId = getSingleMoveChangeContent(
				true, myObjectAttributeId, myObjectHeaderId, myLayoutId);

			// local id's for JsControlTreeModifier, wrong Aggregation
			this.mSingleMoveChangeContentWithLocalIdWA = getSingleMoveChangeContentWrongAggregation(
				true, myObjectAttributeId, myLayoutId);

			// global id's for JsControlTreeModifier
			this.mSingleMoveChangeContentWithGlobalId = getSingleMoveChangeContent(
				false, this.oObjectAttribute.getId(), this.oObjectHeader.getId(), this.oLayout.getId());

			// local id's for JsControlTreeModifier
			this.mMultiMoveChangeContentWithLocalId = getMultiMoveChangeContent(
				true, myObjectAttributeId, myObjectAttributeId2,
				myObjectHeaderId, myLayoutId);

			// global id's for JsControlTreeModifier
			this.mMultiMoveChangeContentWithGlobalId = getMultiMoveChangeContent(
				false, this.oObjectAttribute.getId(), this.oObjectAttribute2.getId(),
				this.oObjectHeader.getId(), this.oLayout.getId());
		},
		afterEach() {
			this.oLayout.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("When providing change data via specific change info", function(assert) {
			var mSpecificChangeInfo = {
				movedElements: [{
					element: this.oObjectAttribute, // optional fallback for id
					id: this.oObjectAttribute.getId(),
					sourceIndex: 0,
					targetIndex: 2
				}],
				source: {
					id: this.oObjectHeader.getId(),
					aggregation: "attributes"
				},
				target: {
					id: this.oLayout.getId(),
					aggregation: "content"
				}
			};
			var oChange = new UIChange({selector: JsControlTreeModifier.getSelector(mSpecificChangeInfo.target.id, oComponent)});

			return MoveControlsHandler.completeChangeContent(
				oChange,
				mSpecificChangeInfo,
				{modifier: JsControlTreeModifier, appComponent: oComponent}
			)
			.then(function() {
				assert.deepEqual(oChange.getSelector(), this.mSelectorWithLocalId, "the change SELECTOR is filled correctly");
				assert.deepEqual(oChange.getContent(), this.mSingleMoveChangeContentWithLocalId, "the change CONTENT is filled correctly");

				assert.strictEqual(
					oChange.getDependentControl("source", {modifier: JsControlTreeModifier, appComponent: oComponent}).getId(),
					this.oObjectHeader.getId(),
					"source is part of dependent selector"
				);
				assert.strictEqual(
					oChange.getDependentControl("target", {modifier: JsControlTreeModifier, appComponent: oComponent}).getId(),
					this.oLayout.getId(),
					"target is part of dependent selector"
				);
				assert.strictEqual(
					oChange.getDependentControl("movedElements", {modifier: JsControlTreeModifier, appComponent: oComponent})[0].getId(),
					this.oObjectAttribute.getId(),
					"movedElements array is part of dependent selector"
				);
			}.bind(this));
		});

		QUnit.test("When applying the single move change on jsControlTree with local id and reverting it afterwards", function(assert) {
			var oChange = new UIChange({
				selector: this.mSelectorWithLocalId,
				content: this.mSingleMoveChangeContentWithLocalId
			});

			return MoveControlsHandler.applyChange(oChange, this.oObjectHeader, {modifier: JsControlTreeModifier, appComponent: oComponent})
			.then(function() {
				assert.strictEqual(this.oObjectHeader.getAttributes().length, 1, "object attribute is removed from the header");
				assert.strictEqual(
					this.oObjectHeader.getAttributes()[0].getId(),
					this.oObjectAttribute2.getId(),
					"object attribute 2 is still in the header"
				);
				assert.strictEqual(
					this.oLayout.getContent()[0].getId(),
					this.oObjectHeader.getId(),
					"object header is still at 1. position"
				);
				assert.strictEqual(
					this.oLayout.getContent()[1].getId(),
					this.oButton.getId(),
					"button is still at 2. position"
				);
				assert.strictEqual(
					this.oLayout.getContent()[2].getId(),
					this.oObjectAttribute.getId(),
					"object attribute is inserted at the 3. position"
				);
				return MoveControlsHandler.revertChange(
					oChange,
					this.oObjectHeader,
					{modifier: JsControlTreeModifier, appComponent: oComponent}
				);
			}.bind(this))
			.then(function() {
				assertInitialState.call(this, assert);
			}.bind(this));
		});

		QUnit.test("When applying the single move change, that was already performed on the UI, on jsControlTree with local id and reverting it afterwards", function(assert) {
			var oChange = new UIChange({
				selector: this.mSelectorWithLocalId,
				content: this.mSingleMoveChangeContentWithLocalId
			});

			// the second .applyChange call overwrites the revert data and simulates the change already being done on the UI
			return MoveControlsHandler.applyChange(oChange, this.oObjectHeader, {modifier: JsControlTreeModifier, appComponent: oComponent})
			.then(MoveControlsHandler.applyChange.bind(
				MoveControlsHandler,
				oChange,
				this.oObjectHeader,
				{modifier: JsControlTreeModifier, appComponent: oComponent}
			))
			.then(function() {
				assert.strictEqual(this.oObjectHeader.getAttributes().length, 1, "object attribute is removed from the header");
				assert.strictEqual(
					this.oObjectHeader.getAttributes()[0].getId(),
					this.oObjectAttribute2.getId(),
					"object attribute 2 is still in the header"
				);
				assert.strictEqual(
					this.oLayout.getContent()[0].getId(),
					this.oObjectHeader.getId(),
					"object header is still at 1. position"
				);
				assert.strictEqual(
					this.oLayout.getContent()[1].getId(),
					this.oButton.getId(),
					"button is still at 2. position"
				);
				assert.strictEqual(
					this.oLayout.getContent()[2].getId(), this.oObjectAttribute.getId(), "object attribute is inserted at the 3. position");
				return MoveControlsHandler.revertChange(
					oChange,
					this.oObjectHeader,
					{modifier: JsControlTreeModifier, appComponent: oComponent}
				);
			}.bind(this))
			.then(assertInitialState.bind(this, assert));
		});

		QUnit.test("When applying the single move change on jsControlTree with global id and reverting it afterwards", function(assert) {
			var oChange = new UIChange({
				selector: this.mSelectorWithGlobalId,
				content: this.mSingleMoveChangeContentWithGlobalId
			});

			return MoveControlsHandler.applyChange(oChange, this.oObjectHeader, {modifier: JsControlTreeModifier})
			.then(function() {
				assert.strictEqual(this.oObjectHeader.getAttributes().length, 1, "object attribute is removed from the header");
				assert.strictEqual(
					this.oObjectHeader.getAttributes()[0].getId(),
					this.oObjectAttribute2.getId(),
					"object attribute 2 is still in the header"
				);
				assert.strictEqual(
					this.oLayout.getContent()[0].getId(),
					this.oObjectHeader.getId(),
					"object header is still at 1. position"
				);
				assert.strictEqual(
					this.oLayout.getContent()[1].getId(),
					this.oButton.getId(),
					"button is still at 2. position"
				);
				assert.strictEqual(
					this.oLayout.getContent()[2].getId(),
					this.oObjectAttribute.getId(),
					"object attribute is inserted at the 3. position"
				);
				return MoveControlsHandler.revertChange(oChange, this.oObjectHeader, {modifier: JsControlTreeModifier});
			}.bind(this))
			.then(assertInitialState.bind(this, assert));
		});

		QUnit.test("When applying the single move change on jsControlTree with local id and a different aggregation and different source parent and reverting it afterwards", function(assert) {
			var oChange = new UIChange({
				selector: this.mSelectorWithLocalId,
				content: this.mSingleMoveChangeContentWithLocalIdWA
			});

			return MoveControlsHandler.applyChange(oChange, this.oObjectHeader, {modifier: JsControlTreeModifier, appComponent: oComponent})
			.then(function() {
				assert.strictEqual(this.oObjectHeader.getAttributes().length, 1, "object attribute is removed from the header");
				assert.strictEqual(
					this.oObjectHeader.getAttributes()[0].getId(),
					this.oObjectAttribute2.getId(),
					"object attribute 2 is still in the header"
				);
				assert.strictEqual(
					this.oLayout.getContent()[0].getId(),
					this.oObjectHeader.getId(),
					"object header is still at 1. position"
				);
				assert.strictEqual(
					this.oLayout.getContent()[1].getId(),
					this.oButton.getId(),
					"button is still at 2. position"
				);
				assert.strictEqual(
					this.oLayout.getContent()[2].getId(),
					this.oObjectAttribute.getId(),
					"object attribute is inserted at the 3. position"
				);
				return MoveControlsHandler.revertChange(
					oChange,
					this.oObjectHeader,
					{modifier: JsControlTreeModifier, appComponent: oComponent}
				);
			}.bind(this))
			.then(assertInitialState.bind(this, assert));
		});

		QUnit.test("When applying the multi move change on jsControlTree with local id and reverting it afterwards", function(assert) {
			var oChange = new UIChange({
				selector: this.mSelectorWithLocalId,
				content: this.mMultiMoveChangeContentWithLocalId
			});

			return MoveControlsHandler.applyChange(oChange, this.oObjectHeader, {modifier: JsControlTreeModifier, appComponent: oComponent})
			.then(function() {
				assert.strictEqual(this.oObjectHeader.getAttributes().length, 0, "both object attributes removed from the header");
				assert.strictEqual(
					this.oLayout.getContent()[0].getId(),
					this.oObjectHeader.getId(),
					"object header is still at 1. position"
				);
				assert.strictEqual(
					this.oLayout.getContent()[1].getId(),
					this.oButton.getId(),
					"button is still at 2. position"
				);
				assert.strictEqual(
					this.oLayout.getContent()[2].getId(),
					this.oObjectAttribute.getId(),
					"object attribute is inserted at the 3. position"
				);
				assert.strictEqual(
					this.oLayout.getContent()[3].getId(),
					this.oObjectAttribute2.getId(),
					"object attribute 2 is inserted at the 4. position"
				);
				return MoveControlsHandler.revertChange(
					oChange,
					this.oObjectHeader,
					{modifier: JsControlTreeModifier, appComponent: oComponent}
				);
			}.bind(this))
			.then(assertInitialState.bind(this, assert));
		});

		QUnit.test("When applying the multi move change on jsControlTree with global id and reverting it afterwards", function(assert) {
			var oChange = new UIChange({
				selector: this.mSelectorWithGlobalId,
				content: this.mMultiMoveChangeContentWithGlobalId
			});

			return MoveControlsHandler.applyChange(oChange, this.oObjectHeader, {modifier: JsControlTreeModifier})
			.then(function() {
				assert.strictEqual(this.oObjectHeader.getAttributes().length, 0, "both object attributes removed from the header");
				assert.strictEqual(
					this.oLayout.getContent()[0].getId(),
					this.oObjectHeader.getId(),
					"object header is still at 1. position"
				);
				assert.strictEqual(
					this.oLayout.getContent()[1].getId(),
					this.oButton.getId(),
					"button is still at 2. position"
				);
				assert.strictEqual(
					this.oLayout.getContent()[2].getId(),
					this.oObjectAttribute.getId(),
					"object attribute is inserted at the 3. position"
				);
				assert.strictEqual(
					this.oLayout.getContent()[3].getId(),
					this.oObjectAttribute2.getId(),
					"object attribute 2 is inserted at the 4. position"
				);
				return MoveControlsHandler.revertChange(oChange, this.oObjectHeader, {modifier: JsControlTreeModifier});
			}.bind(this))
			.then(assertInitialState.bind(this, assert));
		});

		QUnit.test("When applying a change and using mPropertyBag.sourceAggregation and .targetAggregation", function(assert) {
			var oChange = new UIChange({
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
					source: {
						selector: {
							id: this.oObjectHeader.getId(),
							aggregation: "attributes"
						}
					},
					target: {
						selector: {
							id: this.oLayout.getId(),
							aggregation: "content"
						}
					}
				}
			});

			var oMoveStub = sandbox.stub(JsControlTreeModifier, "moveAggregation");
			sandbox.stub(JsControlTreeModifier, "getAggregation").returns([this.oObjectAttribute]);

			return MoveControlsHandler.applyChange(oChange, this.oObjectHeader, {
				modifier: JsControlTreeModifier,
				sourceAggregation: "newSourceAggregation",
				targetAggregation: "newTargetAggregation"
			})
			.then(function() {
				assert.strictEqual(
					oMoveStub.lastCall.args[1],
					"newSourceAggregation",
					"then the source aggregation from the change got changed"
				);
				assert.strictEqual(
					oMoveStub.lastCall.args[3],
					"newTargetAggregation",
					"then the target aggregation from the change got changed"
				);
			});
		});

		QUnit.test("When applying a change and using mPropertyBag.sourceAggregation and .targetAggregation when the change was already performed", function(assert) {
			var oChange = new UIChange({
				selector: this.mSelectorWithGlobalId,
				content: {
					movedElements: [{
						selector: {
							id: this.oObjectAttribute.getId(),
							type: "sap.m.ObjectAttribute"
						},
						sourceIndex: 1,
						targetIndex: 0
					}],
					source: {
						selector: {
							id: this.oObjectHeader.getId(),
							aggregation: "attributes"
						}
					},
					target: {
						selector: {
							id: this.oObjectHeader.getId(),
							aggregation: "attributes"
						}
					}
				}
			});

			var oMoveSpy = sandbox.spy(JsControlTreeModifier, "moveAggregation");
			sandbox.stub(JsControlTreeModifier, "getAggregation").returns([this.oObjectAttribute]);
			var sAggregationName = "newAggregationName";

			return MoveControlsHandler.applyChange(oChange, this.oObjectHeader, {
				modifier: JsControlTreeModifier,
				sourceAggregation: sAggregationName,
				targetAggregation: sAggregationName
			})
			.then(function() {
				assert.strictEqual(oMoveSpy.callCount, 0, "the change was not performed");
				var mExpectedRevertData = {
					index: 1,
					aggregation: sAggregationName,
					sourceParent: { id: this.oObjectHeader.getId(), idIsLocal: false }
				};
				assert.deepEqual(oChange.getRevertData()[0], mExpectedRevertData, "the revert data is correct");
			}.bind(this));
		});

		QUnit.test("When applying broken changes (functionality independent of modifier)", function(assert) {
			var oChange = new UIChange({
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

			return MoveControlsHandler.applyChange(oChange, this.oObjectHeader, {modifier: JsControlTreeModifier})
			.catch(function(oError) {
				assert.strictEqual(oError.message, "No source supplied for move", "missing source error captured");
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
						source: {
							selector: {
								id: this.oObjectHeader.getId(),
								aggregation: "attributes"
							}
						}
					}
				});
				return MoveControlsHandler.applyChange(oChange, this.oObjectHeader, {modifier: JsControlTreeModifier});
			}.bind(this))
			.catch(function(oError) {
				assert.strictEqual(oError.message, "No target supplied for move", "missing target error captured");
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
						source: {
							selector: {
								id: "unknown"
							}
						},
						target: {
							selector: {
								id: this.oLayout.getId(),
								aggregation: "content"
							}
						}
					}
				});
				return MoveControlsHandler.applyChange(oChange, this.oObjectHeader, {modifier: JsControlTreeModifier});
			}.bind(this))
			.catch(function(oError) {
				assert.strictEqual(oError.message, "Move source parent not found", "unknown source error captured");
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
						source: {
							selector: {
								id: this.oObjectHeader.getId(),
								aggregation: "attributes"
							}
						},
						target: {
							selector: {
								id: "unknown"
							}
						}
					}
				});
				return MoveControlsHandler.applyChange(oChange, this.oObjectHeader, {modifier: JsControlTreeModifier});
			}.bind(this))
			.catch(function(oError) {
				assert.strictEqual(oError.message, "Move target parent not found", "unknown target error captured");
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
						source: {
							selector: {
								id: this.oObjectHeader.getId()
							}
						},
						target: {
							selector: {
								id: this.oLayout.getId(),
								aggregation: "content"
							}
						}
					}
				});
				return MoveControlsHandler.applyChange(oChange, this.oObjectHeader, {modifier: JsControlTreeModifier});
			}.bind(this))
			.catch(function(oError) {
				assert.strictEqual(oError.message, "No source aggregation supplied for move", "missing source aggregation error captured");
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
						source: {
							selector: {
								id: this.oObjectHeader.getId(),
								aggregation: "attributes",
								type: "sap.m.ObjectHeader"
							}
						},
						target: {
							selector: {
								id: this.oLayout.getId()
							}
						}
					}
				});
				return MoveControlsHandler.applyChange(oChange, this.oObjectHeader, {modifier: JsControlTreeModifier});
			}.bind(this))
			.catch(function(oError) {
				assert.strictEqual(oError.message, "No target aggregation supplied for move", "missing target aggregation error captured");
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
				return MoveControlsHandler.applyChange(oChange, this.oObjectHeader, {modifier: JsControlTreeModifier});
			}.bind(this))
			.catch(function(oError) {
				assert.strictEqual(oError.message, "Change format invalid", "missing moved elements error captured");
				oChange = new UIChange({
					selector: this.mSelectorWithGlobalId,
					content: {
						movedElements: [{
							selector: {
								id: this.oObjectAttribute.getId()
							},
							sourceIndex: 0
						}],
						source: {
							selector: {
								id: this.oObjectHeader.getId(),
								aggregation: "attributes"
							}
						},
						target: {
							selector: {
								id: this.oLayout.getId(),
								aggregation: "content"
							}
						}
					}
				});
				return MoveControlsHandler.applyChange(oChange, this.oObjectHeader, {modifier: JsControlTreeModifier});
			}.bind(this))
			.catch(function(oError) {
				var sError = `Missing targetIndex for element with id '${this.oObjectAttribute.getId()
						 }' in movedElements supplied`;
				assert.strictEqual(oError.message, sError, "missing target index error captured");
				oChange = new UIChange({
					selector: this.mSelectorWithGlobalId,
					content: {
						movedElements: [{
							selector: {
								id: `${this.oObjectAttribute.getId()}foo`
							},
							sourceIndex: 0,
							targetIndex: 1
						}],
						source: {
							selector: {
								id: this.oObjectHeader.getId(),
								aggregation: "attributes"
							}
						},
						target: {
							selector: {
								id: this.oLayout.getId(),
								aggregation: "content"
							}
						}
					}
				});
				return MoveControlsHandler.applyChange(oChange, this.oObjectHeader, {modifier: JsControlTreeModifier});
			}.bind(this))
			.catch(function(oError) {
				var sError = `Control to move was not found. Id: '${this.oObjectAttribute.getId()}foo` + `'`;
				assert.strictEqual(oError.message, sError, "Control with the given ID not found and error is raised");
			}.bind(this));
		});
	});

	QUnit.module("Given a Move Controls Change Handler on xmlControlTree", {
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

			var oXmlString =
				`<mvc:View xmlns:mvc="sap.ui.core.mvc" ` +
						`xmlns:layout="sap.ui.layout" ` +
						`xmlns="sap.m">` +
					`<layout:VerticalLayout id="${myLayoutId}">` +
						`<layout:content>` +
							`<ObjectHeader id="${myObjectHeaderId}">` +
								`<ObjectAttribute id="${myObjectAttributeId}" />` +
								`<ObjectAttribute id="${myObjectAttributeId2}" />` +
							`</ObjectHeader>` +
							`<Button id="${myButtonId}">` +
							`</Button>` +
						`</layout:content>` +
					`</layout:VerticalLayout>` +
				`</mvc:View>`;
			var oViewPromise;

			var Comp = UIComponent.extend("sap.ui.rta.control.enabling.comp", {
				metadata: {
					manifest: {
						"sap.app": {
							id: "sap.ui.rta.control.enabling.comp",
							type: "application"
						}
					}
				},
				createContent() {
					oViewPromise = XMLView.create({
						id: this.createId("view"),
						definition: oXmlString
					}).then(function(oView) {
						return oView.loaded();
					});
				}
			});
			this.oUiComponent = new Comp("comp");

			this.oUiComponentContainer = new ComponentContainer({
				component: this.oUiComponent
			});
			this.oUiComponentContainer.placeAt("qunit-fixture");

			return oViewPromise.then(function(oView) {
				this.oRootControl = oView;
				this.oGlobalLayout = this.oRootControl.byId(myLayoutId);
				var oGlobalLayoutId = this.oGlobalLayout.getId();
				this.oGlobalObjectHeader = this.oRootControl.byId(myObjectHeaderId);
				var oGlobalObjectHeaderId = this.oGlobalObjectHeader.getId();
				this.oGlobalAttribute = this.oRootControl.byId(myObjectAttributeId);
				var oGlobalAttributeId = this.oGlobalAttribute.getId();
				this.oGlobalAttribute2 = this.oRootControl.byId(myObjectAttributeId2);
				var oGlobalAttribute2Id = this.oGlobalAttribute2.getId();
				this.oGlobalButton = this.oRootControl.byId(myButtonId);

				var oDOMParser = new DOMParser();
				var oXmlDocument = oDOMParser.parseFromString(oXmlString, "application/xml").childNodes[0];
				this.oXmlView = XMLTemplateProcessor.enrichTemplateIds(oXmlDocument, this.oRootControl);

				[this.oXmlLayout] = this.oXmlView.childNodes[0].childNodes;
				[this.oXmlObjectHeader] = this.oXmlLayout.childNodes;

				this.mSelectorWithLocalId = getSelector(true, myLayoutId);
				this.mSelectorWithGlobalId = getSelector(false, oGlobalLayoutId);
				this.mSingleMoveChangeContentWithLocalId = getSingleMoveChangeContent(
					true,
					myObjectAttributeId,
					myObjectHeaderId,
					myLayoutId
				);
				this.mSingleMoveChangeContentWithGlobalId = getSingleMoveChangeContent(
					false,
					oGlobalAttributeId,
					oGlobalObjectHeaderId,
					oGlobalLayoutId
				);
				this.mMultiMoveChangeContentWithLocalId = getMultiMoveChangeContent(
					true,
					myObjectAttributeId,
					myObjectAttributeId2,
					myObjectHeaderId,
					myLayoutId
				);
				this.mMultiMoveChangeContentWithGlobalId = getMultiMoveChangeContent(
					false,
					oGlobalAttributeId,
					oGlobalAttribute2Id,
					oGlobalObjectHeaderId,
					oGlobalLayoutId
				);
			}.bind(this));
		},
		afterEach() {
			this.oUiComponentContainer.destroy();
			this.oRootControl.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("When applying the single move change on xmlControlTree with local id", function(assert) {
			var oChange = new UIChange({
				selector: this.mSelectorWithLocalId,
				content: this.mSingleMoveChangeContentWithLocalId
			});

			return MoveControlsHandler.applyChange(
				oChange,
				this.oGlobalObjectHeader,
				{modifier: XmlTreeModifier, appComponent: this.oRootControl, view: this.oXmlView}
			)
			.then(function() {
				assert.strictEqual(this.oXmlObjectHeader.childNodes.length, 1, "object attribute is removed from the header");
				assert.strictEqual(
					this.oXmlObjectHeader.childNodes[0].getAttribute("id"),
					this.oGlobalAttribute2.getId(),
					"object attribute 2 is still in the header"
				);
				assert.strictEqual(
					this.oXmlLayout.childNodes[0].getAttribute("id"),
					this.oGlobalObjectHeader.getId(),
					"object header is still at 1. position"
				);
				assert.strictEqual(
					this.oXmlLayout.childNodes[1].getAttribute("id"),
					this.oGlobalButton.getId(),
					"button is still at 2. position"
				);
				assert.strictEqual(
					this.oXmlLayout.childNodes[2].getAttribute("id"),
					this.oGlobalAttribute.getId(),
					"object attribute is inserted at the 3. position"
				);
				return MoveControlsHandler.revertChange(
					oChange,
					this.oGlobalObjectHeader,
					{modifier: XmlTreeModifier, appComponent: this.oRootControl, view: this.oXmlView}
				);
			}.bind(this))
			.then(assertOriginalStateXML.bind(this, assert));
		});

		QUnit.test("When applying the single move change on xmlControlTree with global id", function(assert) {
			var oChange = new UIChange({
				selector: this.mSelectorWithGlobalId,
				content: this.mSingleMoveChangeContentWithGlobalId
			});

			return MoveControlsHandler.applyChange(oChange, this.oXmlObjectHeader, {modifier: XmlTreeModifier, view: this.oXmlView})
			.then(function() {
				assert.strictEqual(
					this.oXmlObjectHeader.childNodes.length,
					1,
					"object attribute is removed from the header"
				);
				assert.strictEqual(
					this.oXmlObjectHeader.childNodes[0].getAttribute("id"),
					this.oGlobalAttribute2.getId(),
					"object attribute 2 is still in the header"
				);
				assert.strictEqual(
					this.oXmlLayout.childNodes[0].getAttribute("id"),
					this.oGlobalObjectHeader.getId(),
					"object header is still at 1. position"
				);
				assert.strictEqual(
					this.oXmlLayout.childNodes[1].getAttribute("id"),
					this.oGlobalButton.getId(),
					"button is still at 2. position"
				);
				assert.strictEqual(
					this.oXmlLayout.childNodes[2].getAttribute("id"),
					this.oGlobalAttribute.getId(),
					"object attribute is inserted at the 3. position"
				);
				return MoveControlsHandler.revertChange(
					oChange,
					this.oGlobalObjectHeader,
					{modifier: XmlTreeModifier, view: this.oXmlView}
				);
			}.bind(this))
			.then(assertOriginalStateXML.bind(this, assert));
		});

		QUnit.test("When applying the multi move change on xmlControlTree with local id and reverting it afterwards", function(assert) {
			var oChange = new UIChange({
				selector: this.mSelectorWithLocalId,
				content: this.mMultiMoveChangeContentWithLocalId
			});

			return MoveControlsHandler.applyChange(
				oChange,
				this.oXmlObjectHeader,
				{modifier: XmlTreeModifier, appComponent: this.oRootControl, view: this.oXmlView}
			)
			.then(function() {
				assert.strictEqual(this.oXmlObjectHeader.childNodes.length, 0, "both object attributes removed from the header");
				assert.strictEqual(
					this.oXmlLayout.childNodes[0].getAttribute("id"),
					this.oGlobalObjectHeader.getId(),
					"object header is still at 1. position"
				);
				assert.strictEqual(
					this.oXmlLayout.childNodes[1].getAttribute("id"),
					this.oGlobalButton.getId(),
					"button is still at 2. position"
				);
				assert.strictEqual(
					this.oXmlLayout.childNodes[2].getAttribute("id"),
					this.oGlobalAttribute.getId(),
					"object attribute is inserted at the 3. position"
				);
				assert.strictEqual(
					this.oXmlLayout.childNodes[3].getAttribute("id"),
					this.oGlobalAttribute2.getId(),
					"object attribute 2 is inserted at the 4. position"
				);
				return MoveControlsHandler.revertChange(
					oChange,
					this.oGlobalObjectHeader,
					{modifier: XmlTreeModifier, appComponent: this.oRootControl, view: this.oXmlView}
				);
			}.bind(this))
			.then(assertOriginalStateXML.bind(this, assert));
		});

		QUnit.test("When applying the multi move change on xmlControlTree with global id and reverting it afterwards", function(assert) {
			var oChange = new UIChange({
				selector: this.mSelectorWithGlobalId,
				content: this.mMultiMoveChangeContentWithGlobalId
			});

			return MoveControlsHandler.applyChange(oChange, this.oXmlObjectHeader, {modifier: XmlTreeModifier, view: this.oXmlView})
			.then(function() {
				assert.strictEqual(this.oXmlObjectHeader.childNodes.length, 0, "both object attributes removed from the header");
				assert.strictEqual(
					this.oXmlLayout.childNodes[0].getAttribute("id"),
					this.oGlobalObjectHeader.getId(),
					"object header is still at 1. position"
				);
				assert.strictEqual(
					this.oXmlLayout.childNodes[1].getAttribute("id"),
					this.oGlobalButton.getId(),
					"button is still at 2. position"
				);
				assert.strictEqual(
					this.oXmlLayout.childNodes[2].getAttribute("id"),
					this.oGlobalAttribute.getId(),
					"object attribute is inserted at the 3. position"
				);
				assert.strictEqual(
					this.oXmlLayout.childNodes[3].getAttribute("id"),
					this.oGlobalAttribute2.getId(),
					"object attribute 2 is inserted at the 4. position"
				);
				return MoveControlsHandler.revertChange(
					oChange,
					this.oGlobalObjectHeader,
					{modifier: XmlTreeModifier, view: this.oXmlView}
				);
			}.bind(this))
			.then(assertOriginalStateXML.bind(this, assert));
		});
	});

	QUnit.module("Given a control with move over different aggregations", {
		before() {
			return oComponentPromise;
		},
		beforeEach() {
			// Test Setup:
			// Bar
			// -- contentLeft
			// -- -- Button1
			// -- -- Button2
			// -- contentMiddle
			// -- -- Button3
			// -- -- Button4
			// -- contentRight
			// -- -- Button5
			// -- -- Button6
			this.oButton1 = new Button("button1");
			this.oButton2 = new Button("button2");
			this.oButton3 = new Button("button3");
			this.oButton4 = new Button("button4");
			this.oButton5 = new Button("button5");
			this.oButton6 = new Button("button6");
			this.oBar = new Bar("bar", {
				contentLeft: [this.oButton1, this.oButton2],
				contentMiddle: [this.oButton3, this.oButton4],
				contentRight: [this.oButton5, this.oButton6]
			});

			sandbox.stub(Utils, "getAppComponentForControl").returns(oComponent);
		},
		afterEach() {
			this.oBar.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when the change was already performed", function(assert) {
			var oAlreadyPerformedChange = new UIChange({
				selector: getSelector(false, "bar"),
				content: {
					movedElements: [{
						selector: getSelector(false, "button3"),
						sourceIndex: 0,
						targetIndex: 0
					}],
					source: {
						selector: {
							id: "bar",
							idIsLocal: false,
							aggregation: "contentLeft",
							type: "sap.m.Bar"
						}
					},
					target: {
						selector: {
							id: "bar",
							idIsLocal: false,
							aggregation: "contentMiddle",
							type: "sap.m.Bar"
						}
					}
				}
			});
			var oMoveAggSpy = sandbox.spy(JsControlTreeModifier, "moveAggregation");

			return MoveControlsHandler.applyChange(
				oAlreadyPerformedChange,
				this.oBar,
				{modifier: JsControlTreeModifier, appComponent: oComponent}
			)
			.then(function() {
				assert.strictEqual(oMoveAggSpy.callCount, 0, "the ChangeHandler did not change the aggregations");
				var oExpectedRevertData = [{
					index: 0,
					aggregation: "contentLeft",
					sourceParent: getSelector(false, "bar")
				}];
				assert.deepEqual(oAlreadyPerformedChange.getRevertData(), oExpectedRevertData, "the revert data is correct");
			});
		});

		QUnit.test("when the change is not yet performed", function(assert) {
			var oAlreadyPerformedChange = new UIChange({
				selector: getSelector(false, "bar"),
				content: {
					movedElements: [{
						selector: getSelector(false, "button1"),
						sourceIndex: 0,
						targetIndex: 0
					}],
					source: {
						selector: {
							id: "bar",
							idIsLocal: false,
							aggregation: "contentLeft",
							type: "sap.m.Bar"
						}
					},
					target: {
						selector: {
							id: "bar",
							idIsLocal: false,
							aggregation: "contentMiddle",
							type: "sap.m.Bar"
						}
					}
				}
			});
			var oMoveAggSpy = sandbox.spy(JsControlTreeModifier, "moveAggregation");

			return MoveControlsHandler.applyChange(
				oAlreadyPerformedChange,
				this.oBar,
				{modifier: JsControlTreeModifier, appComponent: oComponent}
			)
			.then(function() {
				assert.strictEqual(oMoveAggSpy.callCount, 1, "the ChangeHandler changed the aggregation");
				var oExpectedRevertData = [{
					index: 0,
					aggregation: "contentLeft",
					sourceParent: getSelector(false, "bar")
				}];
				assert.deepEqual(oAlreadyPerformedChange.getRevertData(), oExpectedRevertData, "the revert data is correct");
			});
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});