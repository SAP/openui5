/* global QUnit, sinon */
sap.ui.define(['sap/ui/base/ManagedObject', 'sap/ui/base/ManagedObjectObserver', 'sap/ui/core/Element', 'sap/ui/core/Item', 'sap/ui/core/Control', 'sap/ui/model/json/JSONModel'],
	function(ManagedObject, ManagedObjectObserver, Element, Item, Control, JSONModel) {
		"use strict";

		var SimpleElement = Element.extend("SimpleElement", {
			metadata: {
				properties: {
					text: "string"
				},
				aggregations: {
					innerAggregation: {
						type: "sap.ui.core.Element",
						multiple: true
					},
					innerAggregationWithForwardedBinding: {
						type: "sap.ui.core.Element",
						multiple: true
					},
					innerSingleAggregation: {
						type: "sap.ui.core.Element",
						multiple: false
					}
				}
			}
		});

		var CompositeElement = Element.extend("CompositeElement", {
			metadata: {
				aggregations: {
					outerAggregation: {
						type: "sap.ui.core.Element",
						multiple: true,
						forwarding: {
							idSuffix: "-innerElement",
							aggregation: "innerAggregation"
						}
					},
					outerAggregationWithForwardedBinding: {
						type: "sap.ui.core.Element",
						multiple: true,
						forwarding: {
							idSuffix: "-innerElement",
							aggregation: "innerAggregationWithForwardedBinding",
							forwardBinding: true
						}
					},
					outerSingleAggregation: {
						type: "sap.ui.core.Element",
						multiple: false,
						forwarding: {
							idSuffix: "-innerElement",
							aggregation: "innerSingleAggregation"
						}
					},
					outerSingleToMultiAggregation: {
						type: "sap.ui.core.Element",
						multiple: false,
						forwarding: {
							idSuffix: "-innerElement",
							aggregation: "innerAggregation"
						}
					},
					otherOuterAggregation: {
						type: "sap.ui.core.Element",
						multiple: true
					},
					otherOuterSingleAggregation: {
						type: "sap.ui.core.Element",
						multiple: false
					},
					thirdOuterSingleAggregation: {
						type: "sap.ui.core.Element",
						multiple: false
					},
					_innerElement: {
						type: "sap.ui.core.Element",
						multiple: false,
						visibility: "hidden"
					}
				}
			},

			init: function() {
				this.setAggregation("_innerElement", new SimpleElement(this.getId() + "-innerElement"));
			}
		});

		var InheritingFromCompositeElement = CompositeElement.extend("InheritingFromCompositeElement", {});

		var CompositeWithoutForwarding = Element.extend("CompositeWithoutForwarding", {
			metadata: {
				aggregations: {
					outerAggregation: {
						type: "sap.ui.core.Element",
						multiple: true
					}
				}
			}
		});

		var InheritingAndForwardingComposite = CompositeWithoutForwarding.extend("InheritingAndForwardingComposite", {
			metadata: {
				aggregations: {
					_innerElement: {
						type: "sap.ui.core.Element",
						multiple: false,
						visibility: "hidden"
					}
				}
			},
			init: function() {
				this.setAggregation("_innerElement", new SimpleElement(this.getId() + "-innerElement"));
			}
		});
		InheritingAndForwardingComposite.getMetadata().forwardAggregation(
			"outerAggregation", {
				idSuffix: "-innerElement",
				aggregation: "innerAggregation"
			}
		);


		CompositeWithoutForwarding.prototype.getForwardingTarget = function() {
			return this.getAggregation("_innerElement");
		};

		var InheritingAndForwardingCompositeWithGetter = CompositeWithoutForwarding.extend("InheritingAndForwardingCompositeWithGetter", {
			metadata: {
				aggregations: {
					_innerElement: {
						type: "sap.ui.core.Element",
						multiple: false,
						visibility: "hidden"
					}
				}
			},
			init: function() {
				this.setAggregation("_innerElement", new SimpleElement(this.getId() + "-innerElement"));
			}
		});
		InheritingAndForwardingCompositeWithGetter.getMetadata().forwardAggregation(
			"outerAggregation", {
				getter: CompositeWithoutForwarding.prototype.getForwardingTarget,
				aggregation: "innerAggregation"
			}
		);

		var InheritingAndForwardingCompositeWithGetterName = CompositeWithoutForwarding.extend("InheritingAndForwardingCompositeWithGetterName", {
			metadata: {
				aggregations: {
					_innerElement: {
						type: "sap.ui.core.Element",
						multiple: false,
						visibility: "hidden"
					}
				}
			},
			init: function() {
				this.setAggregation("_innerElement", new SimpleElement(this.getId() + "-innerElement"));
			}
		});
		InheritingAndForwardingCompositeWithGetterName.getMetadata().forwardAggregation(
			"outerAggregation", {
				getter: "getForwardingTarget",
				aggregation: "innerAggregation"
			}
		);

		var UltraCompositeElement = Element.extend("UltraCompositeElement", {
			metadata: {
				aggregations: {
					ultraOuterAggregation: {
						type: "sap.ui.core.Element",
						multiple: true,
						forwarding: {
							idSuffix: "_innerComposite",
							aggregation: "outerAggregation"
						}
					},
					ultraOuterSingleAggregation: {
						type: "sap.ui.core.Element",
						multiple: false,
						forwarding: {
							idSuffix: "_innerComposite",
							aggregation: "outerSingleAggregation"
						}
					},
					_innerComposite: {
						type: "sap.ui.core.Element",
						multiple: false,
						hidden: true
					}
				}
			},

			init: function() {
				this.setAggregation("_innerComposite", new CompositeElement(this.getId() + "_innerComposite"));
			}
		});

		var UberCompositeElement = Element.extend("UberCompositeElement", {
			metadata: {
				aggregations: {
					uberOuterAggregation: {
						type: "sap.ui.core.Element",
						multiple: true,
						forwarding: {
							idSuffix: "_ultraComposite",
							aggregation: "ultraOuterAggregation"
						}
					},
					uberOuterSingleAggregation: {
						type: "sap.ui.core.Element",
						multiple: false,
						forwarding: {
							idSuffix: "_ultraComposite",
							aggregation: "ultraOuterSingleAggregation"
						}
					},
					_ultraComposite: {
						type: "sap.ui.core.Element",
						multiple: false,
						hidden: true
					}
				}
			},

			init: function() {
				this.setAggregation("_ultraComposite", new UltraCompositeElement(this.getId() + "_ultraComposite"));
			}
		});

		var CompositeElementForModelTest = Element.extend("CompositeElementForModelTest", {
			metadata: {
				aggregations: {
					outerAggregation: {
						type: "sap.ui.core.Element",
						multiple: true,
						forwarding: {
							idSuffix: "-innerElement",
							aggregation: "innerAggregation"
						}
					},
					_innerElement: {
						type: "sap.ui.core.Element",
						multiple: false,
						visibility: "hidden"
					}
				}
			},

			init: function() {
				var oInnerElement = new SimpleElement(this.getId() + "-innerElement");
				var oModel = new JSONModel();
				oModel.inner = true;
				oModel.setData({
					text: "INNER DATA!"
				});
				oInnerElement.setModel(oModel, "modelNameSetInComposite");
				this.setAggregation("_innerElement", oInnerElement);
			}
		});

		var SimpleContainer = Element.extend("SimpleContainer", {
			metadata: {
				aggregations: {
					content: {
						type: "sap.ui.core.Element",
						multiple: true
					}
				}
			}
		});

		var CompositeElementForModelTestAddingForwarding = CompositeWithoutForwarding.extend("CompositeElementForModelTestAddingForwarding", {
			metadata: {
				aggregations: {
					_innerElement: {
						type: "sap.ui.core.Element",
						multiple: false,
						visibility: "hidden"
					}
				}
			},
			init: function() {
				var oInnerElement = new SimpleElement(this.getId() + "-innerElement");
				var oModel = new JSONModel();
				oModel.inner = true;
				oModel.setData({
					text: "INNER DATA!"
				});
				oInnerElement.setModel(oModel, "modelNameSetInComposite");
				this.setAggregation("_innerElement", oInnerElement);
			}
		});
		CompositeElementForModelTestAddingForwarding.getMetadata().forwardAggregation(
			"outerAggregation", {
				idSuffix: "-innerElement",
				aggregation: "innerAggregation"
			}
		);

		var PlainContainer = Control.extend("PlainContainer", {
			metadata: {
				aggregations: {
					content: {
						type: "sap.ui.core.Element"
					}
				}
			},

			renderer: function(oRm, oControl) {}
		});



		// actual tests



		QUnit.module("Multi-to-multi aggregation, non-binding", {
			beforeEach: function() {
				this.item = new SimpleElement("item");
				this.composite = new CompositeElement();
				this.composite.addOuterAggregation(this.item);
				this.innerElement = this.composite.getAggregation("_innerElement");
			},
			afterEach: function() {
				this.composite.destroy();
			}
		});

		QUnit.test("check initial setup", function(assert) {
			assert.ok(this.composite, "composite should be created");
			assert.equal(this.composite.getMetadata().getClass(), CompositeElement, "composite should be a CompositeElement");
			assert.ok(this.item, "item should be created");
			assert.equal(this.item.getMetadata().getClass(), SimpleElement, "item should be a SimpleElement");
			assert.ok(this.innerElement, "innerElement should be created");
			assert.equal(this.innerElement.getMetadata().getClass(), SimpleElement, "innerElement should be a SimpleElement");
		});

		QUnit.test("check initial forwarding", function(assert) {
			var oForwarder = this.composite.getMetadata().getAggregationForwarder("outerAggregation");
			assert.ok(oForwarder, "composite metadata should have have a forwarder for the outer aggregation");
			assert.ok(!oForwarder.forwardBinding, "outerAggregation should not forward bindings");

			oForwarder = this.composite.getMetadata().getAggregationForwarder("outerAggregationWithForwardedBinding");
			assert.ok(oForwarder, "outerAggregationWithForwardedBinding should be forwarded");
			assert.ok(oForwarder.forwardBinding, "outerAggregationWithForwardedBinding should forward bindings");
		});

		QUnit.test("both parent getters return the item (checks getAggregation)", function(assert) {
			assert.equal(this.composite.getOuterAggregation().length, 1, "outer control should have one item");
			assert.equal(this.innerElement.getInnerAggregation().length, 1, "inner control should have one item");
			assert.equal(this.composite.getOuterAggregation()[0], this.item, "item should be returned by outer aggregation getter");
			assert.equal(this.innerElement.getInnerAggregation()[0], this.item, "item should be returned by inner aggregation getter");
		});

		QUnit.test("inner control is the item parent (checks getParent)", function(assert) {
			assert.equal(this.item.getParent(), this.innerElement, "inner element should be the item parent");
		});

		QUnit.test("check mAggregations", function(assert) {
			assert.equal(this.composite.mAggregations["outerAggregation"], undefined, "outer element should not have the item in mAggregations");
			assert.equal(this.composite.mForwardedAggregations["outerAggregation"][0], this.item, "outer element should have the item in mForwardedAggregations");
			assert.equal(this.innerElement.mAggregations["innerAggregation"][0], this.item, "inner element should have the item in mAggregations");
		});

		QUnit.test("mForwardedAggregations consistency", function(assert) {
			assert.equal(this.composite.mForwardedAggregations["outerAggregation"][0], this.item, "outer element should have the item in mForwardedAggregations");
			assert.equal(this.innerElement.mAggregations["innerAggregation"][0], this.item, "inner element should have the item in mAggregations");
			assert.strictEqual(this.composite.mForwardedAggregations["outerAggregation"], this.innerElement.mAggregations["innerAggregation"], "outer element mForwardedAggregations[name] should equal inner element mAggregations[name]");

			this.composite.removeAggregation("outerAggregation"); // remove
			this.composite.addOuterAggregation(this.item);

			assert.equal(this.composite.mForwardedAggregations["outerAggregation"][0], this.item, "outer element should have the item in mForwardedAggregations");
			assert.equal(this.innerElement.mAggregations["innerAggregation"][0], this.item, "inner element should have the item in mAggregations");
			assert.strictEqual(this.composite.mForwardedAggregations["outerAggregation"], this.innerElement.mAggregations["innerAggregation"], "outer element mForwardedAggregations[name] should equal inner element mAggregations[name]");

			this.composite.removeAllAggregation("outerAggregation"); // removeAll
			this.composite.addOuterAggregation(this.item);

			assert.equal(this.composite.mForwardedAggregations["outerAggregation"][0], this.item, "outer element should have the item in mForwardedAggregations");
			assert.equal(this.innerElement.mAggregations["innerAggregation"][0], this.item, "inner element should have the item in mAggregations");
			assert.strictEqual(this.composite.mForwardedAggregations["outerAggregation"], this.innerElement.mAggregations["innerAggregation"], "outer element mForwardedAggregations[name] should equal inner element mAggregations[name]");

			this.composite.destroyAggregation("outerAggregation"); // delete
			this.item = new SimpleElement("item");
			this.composite.addOuterAggregation(this.item);

			assert.equal(this.composite.mForwardedAggregations["outerAggregation"][0], this.item, "outer element should have the item in mForwardedAggregations");
			assert.equal(this.innerElement.mAggregations["innerAggregation"][0], this.item, "inner element should have the item in mAggregations");
			assert.strictEqual(this.composite.mForwardedAggregations["outerAggregation"], this.innerElement.mAggregations["innerAggregation"], "outer element mForwardedAggregations[name] should equal inner element mAggregations[name]");

			this.composite.removeAllAggregation("outerAggregation");
			this.composite.insertOuterAggregation(this.item, 0); // insert

			assert.equal(this.composite.mForwardedAggregations["outerAggregation"][0], this.item, "outer element should have the item in mForwardedAggregations");
			assert.equal(this.innerElement.mAggregations["innerAggregation"][0], this.item, "inner element should have the item in mAggregations");
			assert.strictEqual(this.composite.mForwardedAggregations["outerAggregation"], this.innerElement.mAggregations["innerAggregation"], "outer element mForwardedAggregations[name] should equal inner element mAggregations[name]");
		});

		QUnit.test("add item and check its position (checks addAggregation and indexOfAggregation)", function(assert) {
			this.newItem = new SimpleElement("newItem");
			var result = this.composite.addOuterAggregation(this.newItem);

			assert.equal(result, this.composite, "addAggregation should return the outer element");

			assert.equal(this.composite.getOuterAggregation().length, 2, "outer control should have 2 items");
			assert.equal(this.innerElement.getInnerAggregation().length, 2, "inner control should have 2 items");

			assert.equal(this.composite.getOuterAggregation()[1], this.newItem, "newItem should be returned by outer aggregation getter at second position");
			assert.equal(this.innerElement.getInnerAggregation()[1], this.newItem, "newItem should be returned by inner aggregation getter at second position");

			assert.equal(this.composite.indexOfOuterAggregation(this.newItem), 1, "outer control should find the new item at position 1");
			assert.equal(this.innerElement.indexOfInnerAggregation(this.newItem), 1, "inner control should find the new item at position 1");
		});

		QUnit.test("insert item and check its position (checks insertAggregation)", function(assert) {
			this.newItem = new SimpleElement("newItem");
			this.composite.addOuterAggregation(this.newItem);
			this.newItem2 = new SimpleElement("newItem2");
			var result = this.composite.insertOuterAggregation(this.newItem2, 1);

			assert.equal(result, this.composite, "insertAggregation should return the outer element");

			assert.equal(this.composite.getOuterAggregation().length, 3, "outer control should have 3 items");
			assert.equal(this.innerElement.getInnerAggregation().length, 3, "inner control should have 3 items");

			assert.equal(this.composite.getOuterAggregation()[1], this.newItem2, "newItem2 should be returned by outer aggregation getter at position 1");
			assert.equal(this.innerElement.getInnerAggregation()[1], this.newItem2, "newItem2 should be returned by inner aggregation getter at position 1");
			assert.equal(this.composite.getOuterAggregation()[2], this.newItem, "newItem should be returned by outer aggregation getter at position 2");
			assert.equal(this.innerElement.getInnerAggregation()[2], this.newItem, "newItem should be returned by inner aggregation getter at position 2");
		});

		QUnit.test("remove item from the middle of the aggregation (checks removeAggregation)", function(assert) {
			this.newItem = new SimpleElement("newItem");
			this.composite.addOuterAggregation(this.newItem);
			this.newItem2 = new SimpleElement("newItem2");
			this.composite.insertOuterAggregation(this.newItem2, 1);
			var result = this.composite.removeOuterAggregation(this.newItem2);

			assert.equal(result, this.newItem2, "removeAggregation should return the removed item");

			assert.equal(this.newItem2.getParent(), null, "the removed item should have no parent");

			assert.equal(this.composite.getOuterAggregation().length, 2, "outer control should have 2 items");
			assert.equal(this.innerElement.getInnerAggregation().length, 2, "inner control should have 2 items");

			assert.equal(this.composite.indexOfOuterAggregation(this.newItem2), -1, "outer control should not find the removed item in its aggregation");
			assert.equal(this.innerElement.indexOfInnerAggregation(this.newItem2), -1, "inner control should not find the removed item in its aggregation");

			this.newItem2.destroy(); // is not in the aggregation anymore, so the teardown does not destroy it
		});

		QUnit.test("remove all items from the aggregation (checks removeAllAggregation)", function(assert) {
			this.newItem = new SimpleElement("newItem");
			this.composite.addOuterAggregation(this.newItem);
			this.newItem2 = new SimpleElement("newItem2");
			this.composite.insertOuterAggregation(this.newItem2, 1);
			var result = this.composite.removeAllOuterAggregation(this.newItem2);

			assert.equal(result.length, 3, "removeAllAggregation should return the array of removed items");
			assert.equal(result[2], this.newItem, "removeAllAggregation should return the array of removed items");

			assert.equal(this.newItem.getParent(), null, "the removed items should have no parent");

			assert.deepEqual(this.composite.getOuterAggregation(), [], "outer control should return an array for the aggregation");
			assert.equal(this.composite.getOuterAggregation().length, 0, "outer control should have 0 items");
			assert.equal(this.innerElement.getInnerAggregation().length, 0, "inner control should have 0 items");

			assert.equal(this.innerElement.mAggregations["innerAggregation"].length, 0, "inner element should no longer have the item in mAggregations");

			this.item.destroy(); // is not in the aggregation anymore, so the teardown does not destroy it
			this.newItem.destroy(); // is not in the aggregation anymore, so the teardown does not destroy it
			this.newItem2.destroy(); // is not in the aggregation anymore, so the teardown does not destroy it
		});

		QUnit.test("destroy the aggregation (checks destroyAggregation)", function(assert) {
			this.newItem = new SimpleElement("newItem");
			this.composite.addOuterAggregation(this.newItem);
			this.newItem2 = new SimpleElement("newItem2");
			this.composite.insertOuterAggregation(this.newItem2, 1);
			var result = this.composite.destroyOuterAggregation(this.newItem2);

			assert.equal(result, this.composite, "destroyAggregation should return the outer element");

			assert.equal(this.newItem.bIsDestroyed, true, "the items should be destroyed");

			assert.equal(this.composite.getOuterAggregation().length, 0, "outer control should have 0 items");
			assert.equal(this.innerElement.getInnerAggregation().length, 0, "inner control should have 0 items");
		});

		QUnit.test("Forwarding in a clone", function(assert) {
			this.composite2 = this.composite.clone();
			this.innerElement2 = this.composite2.getAggregation("_innerElement");

			// item should still be in original parent
			assert.equal(this.composite.getOuterAggregation().length, 1, "outer control should still have 1 item after cloning");
			assert.equal(this.composite.getOuterAggregation()[0], this.item, "item should be returned by outer aggregation getter");
			assert.equal(this.innerElement.getInnerAggregation().length, 1, "inner control should still have 1 item after cloning");
			assert.equal(this.innerElement.getInnerAggregation()[0], this.item, "item should be returned by inner aggregation getter");

			// clone should have a cloned item
			assert.equal(this.composite2.getOuterAggregation().length, 1, "cloned outer control should have 1 item");
			assert.equal(this.innerElement2.getInnerAggregation().length, 1, "cloned inner control should have 1 item");

			// add one more to the clone to see whether forwarding still works
			this.item2 = new SimpleElement("item2");
			this.composite2.addOuterAggregation(this.item2);

			// now check the clone
			assert.equal(this.composite2.getOuterAggregation().length, 2, "cloned outer control should have 2 items");
			assert.equal(this.innerElement2.getInnerAggregation().length, 2, "cloned inner control should have 2 items");
			assert.equal(this.composite2.getOuterAggregation()[1], this.item2, "item should be returned by cloned outer aggregation getter");
			assert.equal(this.innerElement2.getInnerAggregation()[1], this.item2, "item should be returned by cloned inner aggregation getter");
			assert.equal(this.item2.getParent(), this.innerElement2, "cloned inner element should be the new item's parent");

			this.composite2.destroy();
		});



		QUnit.module("Cloning", {
			beforeEach: function() {
				this.composite = new CompositeElement();
				this.innerElement = this.composite.getAggregation("_innerElement");
			},
			afterEach: function() {
				this.composite.destroy();
			}
		});

		QUnit.test("Cloning with forwarded binding (shareable template)", function(assert) {
			this.data = [
				{
					name: "Stefan"
				},
				{
					name: "Frank"
				},
				{
					name: "Peter"
				},
				{
					name: "Andreas"
				}
			];
			this.model = new JSONModel(this.data);
			this.itemTemplate = new SimpleElement("item", {
				text: "{name}"
			});
			var result = this.composite.bindAggregation("outerAggregationWithForwardedBinding", {
				path: "/",
				template: this.itemTemplate
			});
			assert.equal(result, this.composite, "bindAggregation should return the outer control even if the binding is forwarded"); // GitHub issue #2378
			this.composite.setModel(this.model);

			assert.equal(this.composite.getOuterAggregationWithForwardedBinding().length, 4, "outer control should have 4 items initially");

			this.composite2 = this.composite.clone();
			this.innerElement2 = this.composite2.getAggregation("_innerElement");

			// item should still be in original parent
			assert.equal(this.composite.getOuterAggregationWithForwardedBinding().length, 4, "outer control should still have 4 items after cloning");
			assert.equal(this.composite.getOuterAggregationWithForwardedBinding()[0].getText(), "Stefan", "first item should be returned by aggregation getter");

			// clone should have a cloned item
			assert.equal(this.composite2.getOuterAggregationWithForwardedBinding().length, 4, "cloned outer control should have 4 items");
			assert.equal(this.composite2.getOuterAggregationWithForwardedBinding()[0].getText(), "Stefan", "cloned outer control should have the correct item in position 0");
			assert.equal(this.innerElement2.getInnerAggregationWithForwardedBinding().length, 4, "cloned inner control should have 4 items");
			assert.ok(this.composite.getOuterAggregationWithForwardedBinding()[0] !== this.composite2.getOuterAggregationWithForwardedBinding()[0], "item should be a clone, not a copy by reference");

			// add one more to the data to see whether forwarding still works in the clone
			this.data.push({name: "Tim"});
			this.model.setData(this.data); // TODO: refresh

			// check the original composite
			assert.equal(this.composite.getOuterAggregationWithForwardedBinding().length, 5, "outer control should now have 5 items");

			// now check the clone
			assert.equal(this.composite2.getOuterAggregationWithForwardedBinding().length, 5, "cloned outer control should have 5 items");
			assert.equal(this.composite2.getOuterAggregationWithForwardedBinding()[4].getText(), "Tim", "cloned outer control should have the correct item in position 4");
			assert.equal(this.innerElement2.getInnerAggregationWithForwardedBinding().length, 5, "cloned inner control should have 5 items");
			assert.ok(this.composite.getOuterAggregationWithForwardedBinding()[4] !== this.composite2.getOuterAggregationWithForwardedBinding()[4], "item should be a clone, not a copy by reference");

			this.composite2.destroy();
			this.itemTemplate.destroy(); // cloning marked this aggregation binding template as templateShareable=true, hence it is not destroyed by the framework
		});

		QUnit.test("Cloning with forwarded binding (non-shareable template)", function(assert) { // exactly as above, but with non-shareable template, which is cloned
			this.data = [
				{
					name: "Stefan"
				},
				{
					name: "Frank"
				},
				{
					name: "Peter"
				},
				{
					name: "Andreas"
				}
			];
			this.model = new JSONModel(this.data);
			this.itemTemplate = new SimpleElement("item", {
				text: "{name}"
			});
			this.composite.bindAggregation("outerAggregationWithForwardedBinding", {
				path: "/",
				template: this.itemTemplate,
				templateShareable: false
			});
			this.composite.setModel(this.model);

			assert.equal(this.composite.getOuterAggregationWithForwardedBinding().length, 4, "outer control should have 4 items initially");

			this.composite2 = this.composite.clone();
			this.innerElement2 = this.composite2.getAggregation("_innerElement");

			// item should still be in original parent
			assert.equal(this.composite.getOuterAggregationWithForwardedBinding().length, 4, "outer control should still have 4 items after cloning");
			assert.equal(this.composite.getOuterAggregationWithForwardedBinding()[0].getText(), "Stefan", "first item should be returned by aggregation getter");

			// clone should have a cloned item
			assert.equal(this.composite2.getOuterAggregationWithForwardedBinding().length, 4, "cloned outer control should have 4 items");
			assert.equal(this.composite2.getOuterAggregationWithForwardedBinding()[0].getText(), "Stefan", "cloned outer control should have the correct item in position 0");
			assert.equal(this.innerElement2.getInnerAggregationWithForwardedBinding().length, 4, "cloned inner control should have 4 items");
			assert.ok(this.composite.getOuterAggregationWithForwardedBinding()[0] !== this.composite2.getOuterAggregationWithForwardedBinding()[0], "item should be a clone, not a copy by reference");

			// add one more to the data to see whether forwarding still works in the clone
			this.data.push({name: "Tim"});
			this.model.setData(this.data); // TODO: refresh

			// check the original composite
			assert.equal(this.composite.getOuterAggregationWithForwardedBinding().length, 5, "outer control should now have 5 items");

			// now check the clone
			assert.equal(this.composite2.getOuterAggregationWithForwardedBinding().length, 5, "cloned outer control should have 5 items");
			assert.equal(this.composite2.getOuterAggregationWithForwardedBinding()[4].getText(), "Tim", "cloned outer control should have the correct item in position 4");
			assert.equal(this.innerElement2.getInnerAggregationWithForwardedBinding().length, 5, "cloned inner control should have 5 items");
			assert.ok(this.composite.getOuterAggregationWithForwardedBinding()[4] !== this.composite2.getOuterAggregationWithForwardedBinding()[4], "item should be a clone, not a copy by reference");

			this.composite2.destroy();
		});

		QUnit.test("Cloning with forwarded binding (but actually unbound)", function(assert) { // as above, but with no active binding
			assert.equal(this.composite.getOuterAggregationWithForwardedBinding().length, 0, "outer control should have 0 items initially");

			this.composite2 = this.composite.clone();
			this.innerElement2 = this.composite2.getAggregation("_innerElement");

			// item should still be in original parent
			assert.equal(this.composite.getOuterAggregationWithForwardedBinding().length, 0, "outer control should still have 0 items after cloning");

			// clone should have a cloned item
			assert.equal(this.composite2.getOuterAggregationWithForwardedBinding().length, 0, "cloned outer control should have 0 items");
			this.composite2.destroy();
		});



		QUnit.module("Single-to-single aggregation, non-binding", {
			beforeEach: function() {
				this.item = new SimpleElement("item");
				this.composite = new CompositeElement();
				this.composite.setOuterSingleAggregation(this.item);
				this.innerElement = this.composite.getAggregation("_innerElement");
			},
			afterEach: function() {
				this.composite.destroy();
			}
		});

		QUnit.test("both parent getters return the item (checks getAggregation)", function(assert) {
			assert.equal(this.composite.getOuterSingleAggregation(), this.item, "item should be returned by outer aggregation getter");
			assert.equal(this.innerElement.getInnerSingleAggregation(), this.item, "item should be returned by inner aggregation getter");
		});

		QUnit.test("inner control is the item parent (checks getParent)", function(assert) {
			assert.equal(this.item.getParent(), this.innerElement, "inner element should be the item parent");
		});

		QUnit.test("check mAggregations", function(assert) {
			assert.equal(this.composite.mAggregations["outerSingleAggregation"], undefined, "outer element should not have the item in mAggregations");
			assert.equal(this.composite.mForwardedAggregations["outerSingleAggregation"], this.item, "outer element should  have the item in mForwardedAggregations");
			assert.equal(this.innerElement.mAggregations["innerSingleAggregation"], this.item, "inner element should have the item in mAggregations");
		});

		QUnit.test("mForwardedAggregations consistency", function(assert) {
			assert.equal(this.composite.mForwardedAggregations["outerSingleAggregation"], this.item, "outer element should have the item in mForwardedAggregations");
			assert.equal(this.innerElement.mAggregations["innerSingleAggregation"], this.item, "inner element should have the item in mAggregations");
			assert.strictEqual(this.composite.mForwardedAggregations["outerSingleAggregation"], this.innerElement.mAggregations["innerSingleAggregation"], "outer element mForwardedAggregations[name] should equal inner element mAggregations[name]");

			this.composite.destroyAggregation("outerSingleAggregation"); // delete
			this.item = new SimpleElement("item");
			this.composite.setOuterSingleAggregation(this.item);

			assert.equal(this.composite.mForwardedAggregations["outerSingleAggregation"], this.item, "outer element should have the item in mForwardedAggregations");
			assert.equal(this.innerElement.mAggregations["innerSingleAggregation"], this.item, "inner element should have the item in mAggregations");
			assert.strictEqual(this.composite.mForwardedAggregations["outerSingleAggregation"], this.innerElement.mAggregations["innerSingleAggregation"], "outer element mForwardedAggregations[name] should equal inner element mAggregations[name]");
		});

		QUnit.test("set new item (checks setAggregation)", function(assert) {
			this.newItem = new SimpleElement("newItem");
			var result = this.composite.setOuterSingleAggregation(this.newItem);

			assert.equal(result, this.composite, "setAggregation should return the outer element");

			assert.equal(this.composite.getOuterSingleAggregation(), this.newItem, "newItem should be returned by outer aggregation getter");
			assert.equal(this.innerElement.getInnerSingleAggregation(), this.newItem, "newItem should be returned by inner aggregation getter");

			this.item.destroy(); // is not in the aggregation anymore, so the teardown does not destroy it
		});

		QUnit.test("remove item (checks destroyAggregation)", function(assert) {
			var result = this.composite.destroyOuterSingleAggregation();

			assert.equal(result, this.composite, "destroyAggregation should return the outer element");

			assert.equal(this.item.bIsDestroyed, true, "the items should be destroyed");

			assert.equal(this.composite.getOuterSingleAggregation(), undefined, "outer control should have 0 items");
			assert.equal(this.innerElement.getInnerSingleAggregation(), undefined, "inner control should have 0 items");
		});





		QUnit.module("Multiplicity mismatch", {
			beforeEach: function() {
				this.item = new SimpleElement("item");
				this.composite = new CompositeElement();
			},
			afterEach: function() {
				this.item.destroy();
				this.composite.destroy();
			}
		});

		QUnit.test("Defining a single-to-multi forwarding", function(assert) {
			CompositeElement.getMetadata().forwardAggregation(
				"thirdOuterSingleAggregation", {
					getter: function() {
						return this.getAggregation("_innerElement");
					},
					aggregation: "innerAggregation"
				}
			);

			// initial state
			assert.equal(this.composite.getThirdOuterSingleAggregation(), null, "outer control should return null for the aggregation as long as it is empty");

			// more setup
			this.composite.setThirdOuterSingleAggregation(this.item);
			this.innerElement = this.composite.getAggregation("_innerElement");

			// test whether everything is ok initially
			assert.equal(this.composite.getThirdOuterSingleAggregation(), this.item, "item should be returned by outer aggregation getter");
			assert.equal(this.innerElement.getInnerAggregation()[0], this.item, "item should be returned by inner aggregation getter");
			assert.equal(this.item.getParent(), this.innerElement, "inner element should be the item parent");
			assert.equal(this.composite.mAggregations["thirdOuterSingleAggregation"], undefined, "outer element should not have the item in mAggregations");
			assert.equal(this.innerElement.mAggregations["innerAggregation"][0], this.item, "inner element should have the item in mAggregations");
			assert.equal(this.composite.indexOfThirdOuterSingleAggregation, undefined, "indexOf should not exist for single outer aggregation");

			// set new item (checks setAggregation)
			this.newItem = new SimpleElement("newItem");
			var result = this.composite.setThirdOuterSingleAggregation(this.newItem);
			assert.equal(result, this.composite, "setAggregation should return the outer element");
			assert.equal(this.composite.getThirdOuterSingleAggregation(), this.newItem, "newItem should be returned by outer aggregation getter");
			assert.equal(this.innerElement.getInnerAggregation()[0], this.newItem, "newItem should be returned by inner aggregation getter");

			// remove item (checks destroyAggregation)
			var result = this.composite.destroyThirdOuterSingleAggregation();
			assert.equal(result, this.composite, "destroyAggregation should return the outer element");
			assert.equal(this.newItem.bIsDestroyed, true, "the new item should be destroyed");
			assert.equal(this.composite.getThirdOuterSingleAggregation(), undefined, "outer control should have 0 items");
			assert.equal(this.innerElement.getInnerAggregation().length, 0, "inner control should have 0 items");

			// cannot forward bindings single-to-multi
			assert.throws(
				function() {
					CompositeElement.getMetadata().forwardAggregation(
						"thirdOuterSingleAggregation", {
							getter: function() {
								return this.getAggregation("_innerElement");
							},
							aggregation: "innerAggregation",
							forwardBinding: true
						}
					);
					this.composite.setThirdOuterSingleAggregation(this.item);
				},
				function(err) {
					return err.message.indexOf("with 'forwardBinding' set to 'true'") > -1;
				},
				"Forwarding the binding with single-to-multi forwarding should throw an error"
			);

			this.item.destroy();
			this.composite.destroy();
		});

		QUnit.test("Defining a multi-to-single forwarding", function(assert) {
			CompositeElement.getMetadata().forwardAggregation(
				"otherOuterAggregation", {
					getter: function() {
						return this.getAggregation("_innerElement");
					},
					aggregation: "innerSingleAggregation"
				}
			);

			assert.throws(
				function() {
					this.composite.addOtherOuterAggregation(this.item);
				},
				function(err) {
					return err.message.indexOf("cannot be forwarded to aggregation") > -1;
				},
				"Defining a multi-to-single forwarding should throw an error"
			);
		});





		QUnit.module("Two-level forwarding, multi-to-multi aggregation, non-binding", {
			beforeEach: function() {
				this.item = new SimpleElement("item");
				this.ultraComposite = new UltraCompositeElement();
				this.ultraComposite.addUltraOuterAggregation(this.item);
				this.composite = this.ultraComposite.getAggregation("_innerComposite");
				this.innerElement = this.composite.getAggregation("_innerElement");
			},
			afterEach: function() {
				this.ultraComposite.destroy();
			}
		});

		QUnit.test("check initial setup", function(assert) {
			assert.equal(this.innerElement.getParent(), this.composite, "composite should be parent of innerElement");
			assert.equal(this.composite.getParent(), this.ultraComposite, "ultraComposite should be parent of composite");
		});

		QUnit.test("both parent getters return the item (checks getAggregation)", function(assert) {
			assert.equal(this.ultraComposite.getUltraOuterAggregation().length, 1, "ultra outer control should have one item");
			assert.equal(this.composite.getOuterAggregation().length, 1, "outer control should have one item");
			assert.equal(this.innerElement.getInnerAggregation().length, 1, "inner control should have one item");
			assert.equal(this.ultraComposite.getUltraOuterAggregation()[0], this.item, "item should be returned by ultra outer aggregation getter");
			assert.equal(this.composite.getOuterAggregation()[0], this.item, "item should be returned by outer aggregation getter");
			assert.equal(this.innerElement.getInnerAggregation()[0], this.item, "item should be returned by inner aggregation getter");
		});

		QUnit.test("inner control is the item parent (checks getParent)", function(assert) {
			assert.equal(this.item.getParent(), this.innerElement, "inner element should be the item parent");
		});

		QUnit.test("check mAggregations", function(assert) {
			assert.equal(this.ultraComposite.mAggregations["ultraOuterAggregation"], undefined, "ultra outer element should not have the item in mAggregations");
			assert.deepEqual(this.composite.mAggregations["outerAggregation"], [], "outer element should not have the item in mAggregations");
			assert.equal(this.innerElement.mAggregations["innerAggregation"][0], this.item, "inner element should have the item in mAggregations");
		});

		QUnit.test("add item and check its position (checks addAggregation and indexOfAggregation)", function(assert) {
			this.newItem = new SimpleElement("newItem");
			var result = this.ultraComposite.addUltraOuterAggregation(this.newItem);

			assert.equal(result, this.ultraComposite, "addAggregation should return the outer element");

			assert.equal(this.ultraComposite.getUltraOuterAggregation().length, 2, "ultra outer control should have 2 items");
			assert.equal(this.composite.getOuterAggregation().length, 2, "outer control should have 2 items");
			assert.equal(this.innerElement.getInnerAggregation().length, 2, "inner control should have 2 items");

			assert.equal(this.ultraComposite.getUltraOuterAggregation()[1], this.newItem, "newItem should be returned by ultra outer aggregation getter at second position");
			assert.equal(this.composite.getOuterAggregation()[1], this.newItem, "newItem should be returned by outer aggregation getter at second position");
			assert.equal(this.innerElement.getInnerAggregation()[1], this.newItem, "newItem should be returned by inner aggregation getter at second position");

			assert.equal(this.ultraComposite.indexOfUltraOuterAggregation(this.newItem), 1, "ultraouter control should find the new item at position 1");
			assert.equal(this.composite.indexOfOuterAggregation(this.newItem), 1, "outer control should find the new item at position 1");
			assert.equal(this.innerElement.indexOfInnerAggregation(this.newItem), 1, "inner control should find the new item at position 1");
		});

		QUnit.test("insert item and check its position (checks insertAggregation)", function(assert) {
			this.newItem = new SimpleElement("newItem");
			this.ultraComposite.addUltraOuterAggregation(this.newItem);
			this.newItem2 = new SimpleElement("newItem2");
			var result = this.ultraComposite.insertUltraOuterAggregation(this.newItem2, 1);

			assert.equal(result, this.ultraComposite, "insertAggregation should return the outer element");

			assert.equal(this.ultraComposite.getUltraOuterAggregation().length, 3, "ultra outer control should have 3 items");
			assert.equal(this.composite.getOuterAggregation().length, 3, "outer control should have 3 items");
			assert.equal(this.innerElement.getInnerAggregation().length, 3, "inner control should have 3 items");

			assert.equal(this.ultraComposite.getUltraOuterAggregation()[1], this.newItem2, "newItem2 should be returned by ultra outer aggregation getter at position 1");
			assert.equal(this.composite.getOuterAggregation()[1], this.newItem2, "newItem2 should be returned by outer aggregation getter at position 1");
			assert.equal(this.innerElement.getInnerAggregation()[1], this.newItem2, "newItem2 should be returned by inner aggregation getter at position 1");

			assert.equal(this.ultraComposite.getUltraOuterAggregation()[2], this.newItem, "newItem should be returned by ultra outer aggregation getter at position 2");
			assert.equal(this.composite.getOuterAggregation()[2], this.newItem, "newItem should be returned by outer aggregation getter at position 2");
			assert.equal(this.innerElement.getInnerAggregation()[2], this.newItem, "newItem should be returned by inner aggregation getter at position 2");
		});

		QUnit.test("remove item from the middle of the aggregation (checks removeAggregation)", function(assert) {
			this.newItem = new SimpleElement("newItem");
			this.ultraComposite.addUltraOuterAggregation(this.newItem);
			this.newItem2 = new SimpleElement("newItem2");
			this.ultraComposite.insertUltraOuterAggregation(this.newItem2, 1);
			var result = this.ultraComposite.removeUltraOuterAggregation(this.newItem2);

			assert.equal(result, this.newItem2, "removeAggregation should return the removed item");

			assert.equal(this.newItem2.getParent(), null, "the removed item should have no parent");

			assert.equal(this.ultraComposite.getUltraOuterAggregation().length, 2, "ultra outer control should have 2 items");
			assert.equal(this.composite.getOuterAggregation().length, 2, "outer control should have 2 items");
			assert.equal(this.innerElement.getInnerAggregation().length, 2, "inner control should have 2 items");

			assert.equal(this.ultraComposite.indexOfUltraOuterAggregation(this.newItem2), -1, "ultra outer control should not find the removed item in its aggregation");
			assert.equal(this.composite.indexOfOuterAggregation(this.newItem2), -1, "outer control should not find the removed item in its aggregation");
			assert.equal(this.innerElement.indexOfInnerAggregation(this.newItem2), -1, "inner control should not find the removed item in its aggregation");

			this.newItem2.destroy(); // is not in the aggregation anymore, so the teardown does not destroy it
		});

		QUnit.test("remove all items from the aggregation (checks removeAllAggregation)", function(assert) {
			this.newItem = new SimpleElement("newItem");
			this.ultraComposite.addUltraOuterAggregation(this.newItem);
			this.newItem2 = new SimpleElement("newItem2");
			this.ultraComposite.insertUltraOuterAggregation(this.newItem2, 1);
			var result = this.ultraComposite.removeAllUltraOuterAggregation(this.newItem2);

			assert.equal(result.length, 3, "removeAllAggregation should return the array of removed items");
			assert.equal(result[2], this.newItem, "removeAllAggregation should return the array of removed items");

			assert.equal(this.newItem.getParent(), null, "the removed items should have no parent");

			assert.equal(this.ultraComposite.getUltraOuterAggregation().length, 0, "ultra outer control should have 0 items");
			assert.equal(this.composite.getOuterAggregation().length, 0, "outer control should have 0 items");
			assert.equal(this.innerElement.getInnerAggregation().length, 0, "inner control should have 0 items");

			assert.equal(this.ultraComposite.mAggregations["innerAggregation"], undefined, "ultraComposite element should no longer have the item in mAggregations");
			assert.equal(this.composite.mAggregations["innerAggregation"], undefined, "composite element should no longer have the item in mAggregations");
			assert.equal(this.innerElement.mAggregations["innerAggregation"].length, 0, "inner element should no longer have the item in mAggregations");

			this.item.destroy(); // is not in the aggregation anymore, so the teardown does not destroy it
			this.newItem.destroy(); // is not in the aggregation anymore, so the teardown does not destroy it
			this.newItem2.destroy(); // is not in the aggregation anymore, so the teardown does not destroy it
		});

		QUnit.test("destroy the aggregation (checks destroyAggregation)", function(assert) {
			this.newItem = new SimpleElement("newItem");
			this.ultraComposite.addUltraOuterAggregation(this.newItem);
			this.newItem2 = new SimpleElement("newItem2");
			this.ultraComposite.insertUltraOuterAggregation(this.newItem2, 1);
			var result = this.ultraComposite.destroyUltraOuterAggregation(this.newItem2);

			assert.equal(result, this.ultraComposite, "destroyAggregation should return the outer element");

			assert.equal(this.newItem.bIsDestroyed, true, "the items should be destroyed");

			assert.equal(this.ultraComposite.getUltraOuterAggregation().length, 0, "ultra outer control should have 0 items");
			assert.equal(this.composite.getOuterAggregation().length, 0, "outer control should have 0 items");
			assert.equal(this.innerElement.getInnerAggregation().length, 0, "inner control should have 0 items");
		});





		QUnit.module("Three-level forwarding, multi-to-multi aggregation, non-binding", {
			beforeEach: function() {
				this.item = new SimpleElement("item");
				this.uberComposite = new UberCompositeElement();
				this.uberComposite.addUberOuterAggregation(this.item);
				this.ultraComposite = this.uberComposite.getAggregation("_ultraComposite");
				this.composite = this.ultraComposite.getAggregation("_innerComposite");
				this.innerElement = this.composite.getAggregation("_innerElement");
			},
			afterEach: function() {
				this.uberComposite.destroy();
			}
		});

		QUnit.test("check initial setup", function(assert) {
			assert.equal(this.innerElement.getParent(), this.composite, "composite should be parent of innerElement");
			assert.equal(this.composite.getParent(), this.ultraComposite, "ultraComposite should be parent of composite");
			assert.equal(this.ultraComposite.getParent(), this.uberComposite, "uberComposite should be parent of ultraComposite");
		});

		QUnit.test("both parent getters return the item (checks getAggregation)", function(assert) {
			assert.equal(this.uberComposite.getUberOuterAggregation().length, 1, "uber outer control should have one item");
			assert.equal(this.ultraComposite.getUltraOuterAggregation().length, 1, "ultra outer control should have one item");
			assert.equal(this.composite.getOuterAggregation().length, 1, "outer control should have one item");
			assert.equal(this.innerElement.getInnerAggregation().length, 1, "inner control should have one item");

			assert.equal(this.uberComposite.getUberOuterAggregation()[0], this.item, "item should be returned by uber outer aggregation getter");
			assert.equal(this.ultraComposite.getUltraOuterAggregation()[0], this.item, "item should be returned by ultra outer aggregation getter");
			assert.equal(this.composite.getOuterAggregation()[0], this.item, "item should be returned by outer aggregation getter");
			assert.equal(this.innerElement.getInnerAggregation()[0], this.item, "item should be returned by inner aggregation getter");
		});

		QUnit.test("inner control is the item parent (checks getParent)", function(assert) {
			assert.equal(this.item.getParent(), this.innerElement, "inner element should be the item parent");
		});

		QUnit.test("check mAggregations", function(assert) {
			assert.equal(this.uberComposite.mAggregations["uberOuterAggregation"], undefined, "uber outer element should not have the item in mAggregations");
			assert.deepEqual(this.ultraComposite.mAggregations["ultraOuterAggregation"], [], "ultra outer element should not have the item in mAggregations");
			assert.deepEqual(this.composite.mAggregations["outerAggregation"], [], "outer element should not have the item in mAggregations");
			assert.equal(this.innerElement.mAggregations["innerAggregation"][0], this.item, "inner element should have the item in mAggregations");
		});

		QUnit.test("add item and check its position (checks addAggregation and indexOfAggregation)", function(assert) {
			this.newItem = new SimpleElement("newItem");
			var result = this.uberComposite.addUberOuterAggregation(this.newItem);

			assert.equal(result, this.uberComposite, "addAggregation should return the outer element");

			assert.equal(this.uberComposite.getUberOuterAggregation().length, 2, "uber outer control should have 2 items");
			assert.equal(this.ultraComposite.getUltraOuterAggregation().length, 2, "ultra outer control should have 2 items");
			assert.equal(this.composite.getOuterAggregation().length, 2, "outer control should have 2 items");
			assert.equal(this.innerElement.getInnerAggregation().length, 2, "inner control should have 2 items");

			assert.equal(this.uberComposite.getUberOuterAggregation()[1], this.newItem, "newItem should be returned by uber outer aggregation getter at second position");
			assert.equal(this.ultraComposite.getUltraOuterAggregation()[1], this.newItem, "newItem should be returned by ultra outer aggregation getter at second position");
			assert.equal(this.composite.getOuterAggregation()[1], this.newItem, "newItem should be returned by outer aggregation getter at second position");
			assert.equal(this.innerElement.getInnerAggregation()[1], this.newItem, "newItem should be returned by inner aggregation getter at second position");

			assert.equal(this.uberComposite.indexOfUberOuterAggregation(this.newItem), 1, "uber outer control should find the new item at position 1");
			assert.equal(this.ultraComposite.indexOfUltraOuterAggregation(this.newItem), 1, "ultra outer control should find the new item at position 1");
			assert.equal(this.composite.indexOfOuterAggregation(this.newItem), 1, "outer control should find the new item at position 1");
			assert.equal(this.innerElement.indexOfInnerAggregation(this.newItem), 1, "inner control should find the new item at position 1");
		});





		QUnit.module("Binding (outside)", {
			beforeEach: function() {
				this.data = [{
						name: "Stefan"
					},
					{
						name: "Frank"
					},
					{
						name: "Peter"
					},
					{
						name: "Andreas"
					}
				];
				this.model = new JSONModel(this.data);
				this.itemTemplate = new SimpleElement("item", {
					text: "{name}"
				});
				this.composite = new CompositeElement({
					outerAggregation: {
						path: "/",
						template: this.itemTemplate
					}
				});

				this.innerElement = this.composite.getAggregation("_innerElement");
				this.compositeAddSpy = sinon.spy(this.composite, 'addAggregation');
				this.compositeUpdateSpy = sinon.spy(this.composite, 'updateAggregation');
				this.compositeRefreshSpy = sinon.spy(this.composite, 'refreshAggregation');
				this.innerAddSpy = sinon.spy(this.innerElement, 'addAggregation');
				this.innerUpdateSpy = sinon.spy(this.innerElement, 'updateAggregation');
				this.innerRefreshSpy = sinon.spy(this.innerElement, 'refreshAggregation');
				this.innerGetBindingInfoSpy = sinon.spy(this.innerElement, 'getBindingInfo');
			},
			afterEach: function() {
				this.composite.destroy();
				this.model.destroy();
			}
		});

		QUnit.test("call count of addAggregation and updateAggregation", function(assert) {
			this.composite.setModel(this.model);
			this.composite.refreshAggregation("outerAggregation");

			assert.equal(this.compositeAddSpy.callCount, 4, "addAggregation on the outer control should be called 4 times");
			assert.equal(this.compositeUpdateSpy.callCount, 1, "updateAggregation on the outer control should be called 1 time");
			assert.equal(this.compositeRefreshSpy.callCount, 1, "refreshAggregation on the outer control should be called 1 time");
			assert.equal(this.innerAddSpy.callCount, 4, "addAggregation on the inner control should be called 4 times");
			assert.equal(this.innerUpdateSpy.callCount, 0, "updateAggregation on the inner control should be called 0 times");
			assert.equal(this.innerGetBindingInfoSpy.callCount, 0, "inner getBindingInfo should be called 0 times"); // called by refreshAggregation
		});

		QUnit.test("both parent getters return the correct item (checks bindAggregation and getAggregation)", function(assert) {
			this.composite.setModel(this.model);

			assert.equal(this.composite.getOuterAggregation().length, 4, "outer control should have 4 items");
			assert.equal(this.innerElement.getInnerAggregation().length, 4, "inner control should have 4 items");
			assert.equal(this.composite.getOuterAggregation()[1].getText(), this.data[1].name, "2nd item should correspond to 2nd data element");
			assert.equal(this.innerElement.getInnerAggregation()[1].getText(), this.data[1].name, "2nd item should correspond to 2nd data element");
		});

		QUnit.test("correct isBound information", function(assert) {
			assert.ok(this.composite.isBound("outerAggregation"), "outerAggregation is bound");
		});





		QUnit.module("Binding (forwarded - binding first, model later)", {
			beforeEach: function() {
				this.data = [{
						name: "Stefan"
					},
					{
						name: "Frank"
					},
					{
						name: "Peter"
					},
					{
						name: "Andreas"
					}
				];
				this.model = new JSONModel(this.data);

				this.composite = new CompositeElement();

				this.innerElement = this.composite.getAggregation("_innerElement");
				this.compositeAddSpy = sinon.spy(this.composite, 'addAggregation');
				this.compositeUpdateSpy = sinon.spy(this.composite, 'updateAggregation');
				this.innerAddSpy = sinon.spy(this.innerElement, 'addAggregation');
				this.innerUpdateSpy = sinon.spy(this.innerElement, 'updateAggregation');

				this.itemTemplate = new SimpleElement("item", {
					text: "{name}"
				});
				this.composite.bindAggregation("outerAggregationWithForwardedBinding", {
					path: "/",
					template: this.itemTemplate
				});

				this.composite.setModel(this.model);
			},
			afterEach: function() {
				this.composite.destroy();
				this.model.destroy();
			}
		});

		QUnit.test("call count of addAggregation and updateAggregation", function(assert) {
			assert.equal(this.compositeAddSpy.callCount, 0, "addAggregation on the outer control should be called 0 times");
			assert.equal(this.compositeUpdateSpy.callCount, 0, "updateAggregation on the outer control should be called 0 times");
			assert.equal(this.innerAddSpy.callCount, 4, "addAggregation on the inner control should be called 4 times");
			assert.equal(this.innerUpdateSpy.callCount, 1, "updateAggregation on the inner control should be called 1 times");
		});

		QUnit.test("both parent getters return the correct item (checks bindAggregation and getAggregation)", function(assert) {
			assert.equal(this.composite.getOuterAggregationWithForwardedBinding().length, 4, "outer control should have 4 items");
			assert.equal(this.innerElement.getInnerAggregationWithForwardedBinding().length, 4, "inner control should have 4 items");
			assert.equal(this.composite.getOuterAggregationWithForwardedBinding()[1].getText(), this.data[1].name, "2nd item should correspond to 2nd data element");
			assert.equal(this.innerElement.getInnerAggregationWithForwardedBinding()[1].getText(), this.data[1].name, "2nd item should correspond to 2nd data element");
		});

		QUnit.test("correct isBound information", function(assert) {
			assert.ok(this.composite.isBound("outerAggregationWithForwardedBinding"), "outerAggregationWithForwardedBinding is bound");
		});





		QUnit.module("Binding (forwarded - model first, binding later)", {
			beforeEach: function() {
				this.data = [{
						name: "Stefan"
					},
					{
						name: "Frank"
					},
					{
						name: "Peter"
					},
					{
						name: "Andreas"
					}
				];
				this.model = new JSONModel(this.data);

				this.composite = new CompositeElement();

				this.innerElement = this.composite.getAggregation("_innerElement");
				this.compositeAddSpy = sinon.spy(this.composite, 'addAggregation');
				this.compositeUpdateSpy = sinon.spy(this.composite, 'updateAggregation');
				this.innerAddSpy = sinon.spy(this.innerElement, 'addAggregation');
				this.innerUpdateSpy = sinon.spy(this.innerElement, 'updateAggregation');

				this.composite.setModel(this.model);

				this.itemTemplate = new SimpleElement("item", {
					text: "{name}"
				});
				this.composite.bindAggregation("outerAggregationWithForwardedBinding", {
					path: "/",
					template: this.itemTemplate
				});
			},
			afterEach: function() {
				this.composite.destroy();
				this.model.destroy();
			}
		});

		QUnit.test("call count of addAggregation and updateAggregation", function(assert) {
			assert.equal(this.compositeAddSpy.callCount, 0, "addAggregation on the outer control should be called 0 times");
			assert.equal(this.compositeUpdateSpy.callCount, 0, "updateAggregation on the outer control should be called 0 times");
			assert.equal(this.innerAddSpy.callCount, 4, "addAggregation on the inner control should be called 4 times");
			assert.equal(this.innerUpdateSpy.callCount, 1, "updateAggregation on the inner control should be called 1 times");
		});

		QUnit.test("both parent getters return the correct item (checks bindAggregation and getAggregation)", function(assert) {
			assert.equal(this.composite.getOuterAggregationWithForwardedBinding().length, 4, "outer control should have 4 items");
			assert.equal(this.innerElement.getInnerAggregationWithForwardedBinding().length, 4, "inner control should have 4 items");
			assert.equal(this.composite.getOuterAggregationWithForwardedBinding()[1].getText(), this.data[1].name, "2nd item should correspond to 2nd data element");
			assert.equal(this.innerElement.getInnerAggregationWithForwardedBinding()[1].getText(), this.data[1].name, "2nd item should correspond to 2nd data element");
		});

		QUnit.test("correct isBound information", function(assert) {
			assert.ok(this.composite.isBound("outerAggregationWithForwardedBinding"), "outerAggregationWithForwardedBinding is bound");
		});





		QUnit.module("Binding - unbind()", {
			beforeEach: function() {
				this.data = [{
						name: "Stefan"
					},
					{
						name: "Frank"
					},
					{
						name: "Peter"
					},
					{
						name: "Andreas"
					}
				];
				this.model = new JSONModel(this.data);

				this.composite = new CompositeElement();
				this.innerElement = this.composite.getAggregation("_innerElement");
				this.compositeAddSpy = sinon.spy(this.composite, 'addAggregation');
				this.compositeUpdateSpy = sinon.spy(this.composite, 'updateAggregation');
				this.innerAddSpy = sinon.spy(this.innerElement, 'addAggregation');
				this.innerUpdateSpy = sinon.spy(this.innerElement, 'updateAggregation');

				this.composite.setModel(this.model);

				this.itemTemplate = new SimpleElement("item", {
					text: "{name}"
				});
				this.composite.bindAggregation("outerAggregationWithForwardedBinding", {
					path: "/",
					template: this.itemTemplate
				});
			},
			afterEach: function() {
				this.composite.destroy();
				this.model.destroy();
			}
		});

		QUnit.test("both parent getters return the correct item (checks bindAggregation and getAggregation)", function(assert) {
			assert.equal(this.composite.getOuterAggregationWithForwardedBinding().length, 4, "outer control should have 4 items");
			assert.equal(this.innerElement.getInnerAggregationWithForwardedBinding().length, 4, "inner control should have 4 items");

			var result = this.composite.unbindAggregation("outerAggregationWithForwardedBinding");
			assert.equal(result, this.composite, "unbindAggregation should return the outer element, not the forwarding target");

			assert.equal(this.composite.getOuterAggregation().length, 0, "outer control should have 0 items");
			assert.equal(this.innerElement.getInnerAggregation().length, 0, "inner control should have 0 items");

			assert.equal(this.composite.isBound("outerAggregationWithForwardedBinding"), false, "outerAggregationWithForwardedBinding is no longer bound");
		});





		QUnit.module("Forwarding defined in base class", {
			beforeEach: function() {
				this.item = new SimpleElement("item");
				this.composite = new InheritingFromCompositeElement();
				this.composite.addOuterAggregation(this.item);
				this.innerElement = this.composite.getAggregation("_innerElement");
			},
			afterEach: function() {
				this.composite.destroy();
			}
		});

		QUnit.test("check initial setup", function(assert) {
			assert.ok(this.composite, "composite should be created");
			assert.equal(this.composite.getMetadata().getClass(), InheritingFromCompositeElement, "composite should be an InheritingFromCompositeElement");
			assert.ok(this.item, "item should be created");
			assert.equal(this.item.getMetadata().getClass(), SimpleElement, "item should be a SimpleElement");
			assert.ok(this.innerElement, "innerElement should be created");
			assert.equal(this.innerElement.getMetadata().getClass(), SimpleElement, "innerElement should be a SimpleElement");
		});

		QUnit.test("check initial forwarding", function(assert) {
			var oForwarder = this.composite.getMetadata().getAggregationForwarder("outerAggregation");

			assert.ok(oForwarder, "outerAggregation should be forwarded");
			assert.ok(!oForwarder.forwardBinding, "outerAggregation should not forward bindings");
		});

		QUnit.test("both parent getters return the item (checks getAggregation)", function(assert) {
			assert.equal(this.composite.getOuterAggregation().length, 1, "outer control should have one item");
			assert.equal(this.innerElement.getInnerAggregation().length, 1, "inner control should have one item");
			assert.equal(this.composite.getOuterAggregation()[0], this.item, "item should be returned by outer aggregation getter");
			assert.equal(this.innerElement.getInnerAggregation()[0], this.item, "item should be returned by inner aggregation getter");
		});

		QUnit.test("inner control is the item parent (checks getParent)", function(assert) {
			assert.equal(this.item.getParent(), this.innerElement, "inner element should be the item parent");
		});

		QUnit.test("check mAggregations", function(assert) {
			assert.equal(this.composite.mAggregations["outerAggregation"], undefined, "outer element should not have the item in mAggregations");
			assert.equal(this.innerElement.mAggregations["innerAggregation"][0], this.item, "inner element should have the item in mAggregations");
		});





		QUnit.module("Forwarding defined in different class than where aggregation is defined", {
			beforeEach: function() {
				this.item = new SimpleElement("item");
				this.composite = new InheritingAndForwardingComposite();
				this.composite.addOuterAggregation(this.item);
				this.innerElement = this.composite.getAggregation("_innerElement");
			},
			afterEach: function() {
				this.composite.destroy();
			}
		});

		QUnit.test("check initial setup", function(assert) {
			assert.ok(this.composite, "composite should be created");
			assert.equal(this.composite.getMetadata().getClass(), InheritingAndForwardingComposite, "composite should be a InheritingAndForwardingComposite");
			assert.ok(this.item, "item should be created");
			assert.equal(this.item.getMetadata().getClass(), SimpleElement, "item should be a SimpleElement");
			assert.ok(this.innerElement, "innerElement should be created");
			assert.equal(this.innerElement.getMetadata().getClass(), SimpleElement, "innerElement should be a SimpleElement");
		});

		QUnit.test("check initial forwarding", function(assert) {
			var oForwarder = this.composite.getMetadata().getAggregationForwarder("outerAggregation");

			assert.ok(oForwarder, "outerAggregation should be forwarded");
			assert.equal(oForwarder.targetAggregationName, "innerAggregation", "outerAggregation should be forwarded to innerAggregation");
			assert.ok(!oForwarder.forwardBinding, "outerAggregation should not forward bindings");
		});

		QUnit.test("both parent getters return the item (checks getAggregation)", function(assert) {
			assert.equal(this.composite.getOuterAggregation().length, 1, "outer control should have one item");
			assert.equal(this.innerElement.getInnerAggregation().length, 1, "inner control should have one item");
			assert.equal(this.composite.getOuterAggregation()[0], this.item, "item should be returned by outer aggregation getter");
			assert.equal(this.innerElement.getInnerAggregation()[0], this.item, "item should be returned by inner aggregation getter");
		});

		QUnit.test("inner control is the item parent (checks getParent)", function(assert) {
			assert.equal(this.item.getParent(), this.innerElement, "inner element should be the item parent");
		});

		QUnit.test("check mAggregations", function(assert) {
			assert.equal(this.composite.mAggregations["outerAggregation"], undefined, "outer element should not have the item in mAggregations");
			assert.equal(this.innerElement.mAggregations["innerAggregation"][0], this.item, "inner element should have the item in mAggregations");
		});





		QUnit.module("Forwarding defined in different class than where aggregation is defined (version with getter)", {
			beforeEach: function() {
				this.item = new SimpleElement("item");
				this.composite = new InheritingAndForwardingCompositeWithGetter();
				this.composite.addOuterAggregation(this.item);
				this.innerElement = this.composite.getAggregation("_innerElement");
			},
			afterEach: function() {
				this.composite.destroy();
			}
		});

		QUnit.test("check initial setup", function(assert) {
			assert.ok(this.composite, "composite should be created");
			assert.equal(this.composite.getMetadata().getClass(), InheritingAndForwardingCompositeWithGetter, "composite should be a InheritingAndForwardingCompositeWithGetter");
			assert.ok(this.item, "item should be created");
			assert.equal(this.item.getMetadata().getClass(), SimpleElement, "item should be a SimpleElement");
			assert.ok(this.innerElement, "innerElement should be created");
			assert.equal(this.innerElement.getMetadata().getClass(), SimpleElement, "innerElement should be a SimpleElement");
		});

		QUnit.test("check initial forwarding", function(assert) {
			var oForwarder = this.composite.getMetadata().getAggregationForwarder("outerAggregation");

			assert.ok(oForwarder, "outerAggregation should be forwarded");
			assert.equal(oForwarder.targetAggregationName, "innerAggregation", "outerAggregation should be forwarded to innerAggregation");
			assert.ok(!oForwarder.forwardBinding, "outerAggregation should not forward bindings");
		});

		QUnit.test("both parent getters return the item (checks getAggregation)", function(assert) {
			assert.equal(this.composite.getOuterAggregation().length, 1, "outer control should have one item");
			assert.equal(this.innerElement.getInnerAggregation().length, 1, "inner control should have one item");
			assert.equal(this.composite.getOuterAggregation()[0], this.item, "item should be returned by outer aggregation getter");
			assert.equal(this.innerElement.getInnerAggregation()[0], this.item, "item should be returned by inner aggregation getter");
		});

		QUnit.test("inner control is the item parent (checks getParent)", function(assert) {
			assert.equal(this.item.getParent(), this.innerElement, "inner element should be the item parent");
		});

		QUnit.test("check mAggregations", function(assert) {
			assert.equal(this.composite.mAggregations["outerAggregation"], undefined, "outer element should not have the item in mAggregations");
			assert.equal(this.innerElement.mAggregations["innerAggregation"][0], this.item, "inner element should have the item in mAggregations");
		});





		QUnit.module("Forwarding defined in different class than where aggregation is defined (version with getter name)", {
			beforeEach: function() {
				this.item = new SimpleElement("item");
				this.composite = new InheritingAndForwardingCompositeWithGetterName();
				this.composite.addOuterAggregation(this.item);
				this.innerElement = this.composite.getAggregation("_innerElement");
			},
			afterEach: function() {
				this.composite.destroy();
			}
		});

		QUnit.test("check initial setup", function(assert) {
			assert.ok(this.composite, "composite should be created");
			assert.equal(this.composite.getMetadata().getClass(), InheritingAndForwardingCompositeWithGetterName, "composite should be a InheritingAndForwardingCompositeWithGetterName");
			assert.ok(this.item, "item should be created");
			assert.equal(this.item.getMetadata().getClass(), SimpleElement, "item should be a SimpleElement");
			assert.ok(this.innerElement, "innerElement should be created");
			assert.equal(this.innerElement.getMetadata().getClass(), SimpleElement, "innerElement should be a SimpleElement");
		});

		QUnit.test("check initial forwarding", function(assert) {
			var oForwarder = this.composite.getMetadata().getAggregationForwarder("outerAggregation");

			assert.ok(oForwarder, "outerAggregation should be forwarded");
			assert.equal(oForwarder.targetAggregationName, "innerAggregation", "outerAggregation should be forwarded to innerAggregation");
			assert.ok(!oForwarder.forwardBinding, "outerAggregation should not forward bindings");
		});

		QUnit.test("both parent getters return the item (checks getAggregation)", function(assert) {
			assert.equal(this.composite.getOuterAggregation().length, 1, "outer control should have one item");
			assert.equal(this.innerElement.getInnerAggregation().length, 1, "inner control should have one item");
			assert.equal(this.composite.getOuterAggregation()[0], this.item, "item should be returned by outer aggregation getter");
			assert.equal(this.innerElement.getInnerAggregation()[0], this.item, "item should be returned by inner aggregation getter");
		});

		QUnit.test("inner control is the item parent (checks getParent)", function(assert) {
			assert.equal(this.item.getParent(), this.innerElement, "inner element should be the item parent");
		});

		QUnit.test("check mAggregations", function(assert) {
			assert.equal(this.composite.mAggregations["outerAggregation"], undefined, "outer element should not have the item in mAggregations");
			assert.equal(this.innerElement.mAggregations["innerAggregation"][0], this.item, "inner element should have the item in mAggregations");
		});





		QUnit.module("Metadata setup", {
			beforeEach: function() {
				this.item = new SimpleElement("item");
			},
			afterEach: function() {
				this.item.destroy();
				if (this.composite) {
					this.composite.destroy();
				}
			}
		});

		QUnit.test("Missing target info", function(assert) {
			assert.throws(
				function() {
					var FailingCompositeElement = Element.extend("FailingCompositeElement", {
						metadata: {
							aggregations: {
								outerAggregation: {
									type: "sap.ui.core.Element",
									multiple: true,
									forwarding: {
										aggregation: "innerAggregation"
									}
								},
								_innerElement: {
									type: "sap.ui.core.Element",
									multiple: false,
									hidden: true
								}
							}
						}
					});

					new FailingCompositeElement().addOuterAggregation(this.item);
				},
				function(err) {
					return err.message.indexOf("getter or idSuffix") > -1;
				},
				"Defining forwarding with no idSuffix or getter should throw an error"
			);
		});

		QUnit.test("Using getter with delayed inner element", function(assert) {
			var CompositeElementWithGetterName = Element.extend("CompositeElementWithGetterName", {
				metadata: {
					aggregations: {
						outerAggregation: {
							type: "sap.ui.core.Element",
							multiple: true,
							forwarding: {
								getter: "_getInner",
								aggregation: "innerAggregation"
							}
						},
						_innerElement: {
							type: "sap.ui.core.Element",
							multiple: false,
							hidden: true
						}
					}
				},

				_getInner: function() {
					if (!this.getAggregation("_innerElement")) {
						this.setAggregation("_innerElement", new SimpleElement(this.getId() + "-innerElement"));
					}
					return this.getAggregation("_innerElement");
				}
			});

			this.composite = new CompositeElementWithGetterName();
			this.composite.addOuterAggregation(this.item);

			assert.equal(this.composite._getInner().getInnerAggregation()[0], this.item, "item should be returned by inner aggregation getter");
		});





		QUnit.module("Multi-to-multi aggregation, non-binding", {
			beforeEach: function() {
				this.item = new SimpleElement("item");
				this.composite = new CompositeElement();
				this.innerElement = this.composite.getAggregation("_innerElement");
			},
			afterEach: function() {
				this.composite.destroy();
			}
		});

		QUnit.test("call count of validateAggregation", function(assert) {
			this.validateSpy = sinon.spy(this.composite, 'validateAggregation');
			this.innerValidateSpy = sinon.spy(this.innerElement, 'validateAggregation');

			this.composite.addOuterAggregation(this.item);

			assert.equal(this.validateSpy.callCount, 1, "validateAggregation on the outer control should be called 1 time");
			assert.equal(this.innerValidateSpy.callCount, 1, "validateAggregation on the inner control should be called 1 time");
		});





		QUnit.module("Forwarding to non-existing aggregation", {
			beforeEach: function() {
				this.composite = new CompositeElement();
				this.item = new SimpleElement("item");
			},
			afterEach: function() {
				this.composite.getMetadata().forwardAggregation( // restore metadata
					"outerAggregation", {
						idSuffix: "-innerElement",
						aggregation: "innerAggregation"
					}
				);
				this.composite.destroy();
				this.item.destroy();
			}
		});

		QUnit.test("Forwarding to non-existing aggregation", function(assert) {
			assert.throws(
				function() {
					this.composite.getMetadata().forwardAggregation(
						"outerAggregation", {
							idSuffix: "-innerElement",
							aggregation: "nonExistingInnerAggregation"
						}
					);

					this.composite.addOuterAggregation(this.item);
				},
				function(err) {
					return err.message.indexOf("not found on") > -1;
				},
				"Defining forwarding with non-existing target aggregation should throw an error"
			);
		});





		QUnit.module("API Parent Info", {
			beforeEach: function() {
				this.item = new SimpleElement("item");
				this.composite = new CompositeElement();
				this.composite.addOuterAggregation(this.item);
				this.innerElement = this.composite.getAggregation("_innerElement");
			},
			afterEach: function() {
				this.item.destroy();
				this.composite.destroy();

				if (this.item2) {
					this.item2.destroy();
				}
				if (this.ultraComposite) {
					this.ultraComposite.destroy();
				}
			}
		});

		QUnit.test("simple API Parent Info after single forwarding", function(assert) {
			assert.ok(this.item.aAPIParentInfos, "item should have API Parent Info after forwarding");
			assert.equal(this.item.aAPIParentInfos.length, 1, "item should have API Parent Info with length 1 after forwarding");
			assert.equal(this.item.aAPIParentInfos[0].parent, this.composite, "Initial API parent should be the outer composite");
			assert.equal(this.item.aAPIParentInfos[0].aggregationName, "outerAggregation", "Initial API parent aggregation name should be 'outerAggregation'");
		});

		QUnit.test("API Parent Info after removal of item", function(assert) {
			this.composite.removeOuterAggregation(this.item);
			assert.equal(this.item.aAPIParentInfos, undefined, "item should have NO API Parent Info after removing");
		});

		QUnit.test("API Parent Info after multiple forwarding", function(assert) {
			this.item2 = new SimpleElement("item2");
			this.ultraComposite = new UltraCompositeElement({
				ultraOuterAggregation: [this.item2]
			});

			assert.ok(this.item2.aAPIParentInfos, "item should have API Parent Info after forwarding");
			assert.equal(this.item2.aAPIParentInfos.length, 2, "item should have API Parent Info with length 2 after forwarding");
			assert.equal(this.item2.aAPIParentInfos[0].parent, this.ultraComposite, "Initial API parent should be the outer composite");
			assert.equal(this.item2.aAPIParentInfos[0].aggregationName, "ultraOuterAggregation", "Initial API parent aggregation name should be 'ultraOuterAggregation'");
			assert.equal(this.item2.aAPIParentInfos[1].parent.getMetadata().getName(), "CompositeElement", "Secondary API parent should be the outer composite");
			assert.equal(this.item2.aAPIParentInfos[1].aggregationName, "outerAggregation", "Secondary API parent aggregation name should be 'outerAggregation'");
		});

		QUnit.test("API Parent Info after multiple forwarding with insert", function(assert) {
			this.item2 = new SimpleElement("item2");
			this.ultraComposite = new UltraCompositeElement();
			this.ultraComposite.insertAggregation("ultraOuterAggregation", this.item2, 0);

			assert.ok(this.item2.aAPIParentInfos, "item should have API Parent Info after forwarding");
			assert.equal(this.item2.aAPIParentInfos.length, 2, "item should have API Parent Info with length 2 after forwarding");
			assert.equal(this.item2.aAPIParentInfos[0].parent, this.ultraComposite, "Initial API parent should be the outer composite");
			assert.equal(this.item2.aAPIParentInfos[0].aggregationName, "ultraOuterAggregation", "Initial API parent aggregation name should be 'ultraOuterAggregation'");
			assert.equal(this.item2.aAPIParentInfos[1].parent.getMetadata().getName(), "CompositeElement", "Secondary API parent should be the outer composite");
			assert.equal(this.item2.aAPIParentInfos[1].aggregationName, "outerAggregation", "Secondary API parent aggregation name should be 'outerAggregation'");
		});

		QUnit.test("API Parent Info after multiple forwarding and remove", function(assert) {
			this.item2 = new SimpleElement("item2");
			this.ultraComposite = new UltraCompositeElement({
				ultraOuterAggregation: [this.item2]
			});

			this.ultraComposite.removeAggregation("ultraOuterAggregation", this.item2);
			assert.equal(this.item2.aAPIParentInfos, undefined, "item should have NO API Parent Info after removing");
		});

		QUnit.test("API Parent Info after multiple forwarding and removeAll", function(assert) {
			this.item2 = new SimpleElement("item2");
			this.ultraComposite = new UltraCompositeElement({
				ultraOuterAggregation: [this.item2]
			});

			this.ultraComposite.removeAllAggregation("ultraOuterAggregation");
			assert.equal(this.item2.aAPIParentInfos, undefined, "item should have NO API Parent Info after removing");
		});

		QUnit.test("API Parent Info after multiple forwarding and destroy", function(assert) {
			this.item2 = new SimpleElement("item2");
			this.ultraComposite = new UltraCompositeElement({
				ultraOuterAggregation: [this.item2]
			});

			this.ultraComposite.destroyAggregation("ultraOuterAggregation");
			assert.strictEqual(this.item2.aAPIParentInfos, null, "item should have nulled API Parent Info after destroying");
			this.item2 = null;
		});

		// move element to other composite with forwarding
		QUnit.test("API Parent Info after multiple forwarding and then moving somewhere else", function(assert) {
			this.item2 = new SimpleElement("item2");
			this.ultraComposite = new UltraCompositeElement({
				ultraOuterAggregation: [this.item2]
			});
			// this state was already tested

			// now move to different parent that also does forwarding
			this.ultraComposite2 = new UltraCompositeElement({
				ultraOuterAggregation: [this.item2]
			});

			assert.ok(this.item2.aAPIParentInfos, "item should have API Parent Info after forwarding and moving");
			assert.equal(this.item2.aAPIParentInfos.length, 2, "item should have API Parent Info with length 2 after forwarding and moving");
			assert.equal(this.item2.aAPIParentInfos[0].parent, this.ultraComposite2, "Initial API parent should be the second outer composite");
			assert.equal(this.item2.aAPIParentInfos[0].aggregationName, "ultraOuterAggregation", "Initial API parent aggregation name should be 'ultraOuterAggregation'");
			assert.equal(this.item2.aAPIParentInfos[1].parent.getId(), this.ultraComposite2.getId() + "_innerComposite", "Secondary API parent should be the outer composite");
			assert.equal(this.item2.aAPIParentInfos[1].aggregationName, "outerAggregation", "Secondary API parent aggregation name should be 'outerAggregation'");

			this.ultraComposite2.destroy();
			this.item2 = null;
		});

		// move element to other parent with no forwarding
		QUnit.test("API Parent Info after multiple forwarding and then moving somewhere else", function(assert) {
			this.item2 = new SimpleElement("item2");
			this.ultraComposite = new UltraCompositeElement({
				ultraOuterAggregation: [this.item2]
			});
			// this state was already tested

			// now move to different parent that has no forwarding
			this.composite2 = new CompositeWithoutForwarding({
				outerAggregation: [this.item2]
			});

			assert.equal(this.item2.aAPIParentInfos, undefined, "item has no more API Parent Info after forwarding and then moving to a non-forwarded place");

			this.composite2.destroy();
			this.item2 = null;
		});





		QUnit.module("Model Availability", {
			beforeEach: function() {
				this.model = new JSONModel();
				this.model.setData({
					text: "textFromModel"
				});
				this.model.outer = true;
				this.item = new SimpleElement("item");
				this.composite = new CompositeElementForModelTest();
				this.container = new SimpleContainer();
			},
			afterEach: function() {
				this.item.destroy();
				this.composite.destroy();
				this.model.destroy();
				this.container.destroy();
			}
		});

		QUnit.test("Test binding after forwarding", function(assert) {
			this.item.setModel(this.model, "uniqueModelName");
			this.item.bindProperty("text", "uniqueModelName>/text");
			assert.equal(this.item.getText(), "textFromModel", "Initial check: bound text should be on item");
			assert.ok(this.item.getModel("uniqueModelName").outer, "Model of item should be the outer model");

			this.composite.addOuterAggregation(this.item);
			assert.equal(this.item.getText(), "textFromModel", "Bound text should be on item after forwarding");
			assert.ok(this.item.getModel("uniqueModelName").outer, "Model of item should still be the outer model after forwarding");
			assert.ok(this.item.getParent().getModel("modelNameSetInComposite").inner, "Model of forwarding target should be the inner model...");
			assert.equal(this.item.getModel("modelNameSetInComposite"), undefined, "...but this model should not be propagated to the forwarded element, even after forwarding");
		});

		QUnit.test("Test binding after forwarding when forwarding is added in subclass", function(assert) {
			this.composite.destroy();
			this.composite = new CompositeElementForModelTestAddingForwarding();

			this.item.setModel(this.model, "uniqueModelName");
			this.item.bindProperty("text", "uniqueModelName>/text");
			assert.equal(this.item.getText(), "textFromModel", "Initial check: bound text should be on item");
			assert.ok(this.item.getModel("uniqueModelName").outer, "Model of item should be the outer model");

			this.composite.addOuterAggregation(this.item);
			assert.equal(this.item.getText(), "textFromModel", "Bound text should be on item after forwarding");
			assert.ok(this.item.getModel("uniqueModelName").outer, "Model of item should still be the outer model after forwarding");
			assert.ok(this.item.getParent().getModel("modelNameSetInComposite").inner, "Model of forwarding target should be the inner model...");
			assert.equal(this.item.getModel("modelNameSetInComposite"), undefined, "...but this model should not be propagated to the forwarded element, even after forwarding");
		});

		QUnit.test("Model name used has been overridden in Composite", function(assert) {
			this.item.setModel(this.model, "modelNameSetInComposite");
			this.item.bindProperty("text", "modelNameSetInComposite>/text");
			assert.equal(this.item.getText(), "textFromModel", "Initial check: bound text should be on item");
			assert.ok(this.item.getModel("modelNameSetInComposite").outer, "Model of item should be the outer model");

			this.composite.addOuterAggregation(this.item);
			assert.equal(this.item.getText(), "textFromModel", "Bound text should be on item after forwarding");
			assert.ok(this.item.getModel("modelNameSetInComposite").outer, "Model of item should still be the outer model after forwarding");
			assert.ok(this.item.getParent().getModel("modelNameSetInComposite").inner, "Model of forwarding target should be the inner model");
		});

		QUnit.test("Model name used has been overridden in Composite when forwarding is added in subclass", function(assert) {
			this.composite.destroy();
			this.composite = new CompositeElementForModelTestAddingForwarding();

			this.item.setModel(this.model, "modelNameSetInComposite");
			this.item.bindProperty("text", "modelNameSetInComposite>/text");
			assert.equal(this.item.getText(), "textFromModel", "Initial check: bound text should be on item");
			assert.ok(this.item.getModel("modelNameSetInComposite").outer, "Model of item should be the outer model");

			this.composite.addOuterAggregation(this.item);
			assert.equal(this.item.getText(), "textFromModel", "Bound text should be on item after forwarding");
			assert.ok(this.item.getModel("modelNameSetInComposite").outer, "Model of item should still be the outer model after forwarding");
			assert.ok(this.item.getParent().getModel("modelNameSetInComposite").inner, "Model of forwarding target should be the inner model");
		});

		QUnit.test("Model name used is later overridden in Composite", function(assert) {
			this.item.setModel(this.model, "modelNameSetInComposite");
			this.item.bindProperty("text", "modelNameSetInComposite>/text");
			assert.equal(this.item.getText(), "textFromModel", "Initial check: bound text should be on item");
			assert.ok(this.item.getModel("modelNameSetInComposite").outer, "Model of item should be the outer model");

			this.composite.addOuterAggregation(this.item);

			// now set the inner model AFTER adding the item
			var oModel = new JSONModel();
			oModel.inner = true;
			oModel.setData({
				text: "INNER DATA!"
			});
			this.composite.getAggregation("_innerElement").setModel(oModel, "modelNameSetInComposite");

			assert.equal(this.item.getText(), "textFromModel", "Bound text should be on item after forwarding");
			assert.ok(this.item.getModel("modelNameSetInComposite").outer, "Model of item should still be the outer model after forwarding");
			assert.ok(this.item.getParent().getModel("modelNameSetInComposite").inner, "Model of forwarding target should be the inner model");
		});

		QUnit.test("Test binding after forwarding - with model from parent container", function(assert) {
			this.container.setModel(this.model, "uniqueModelName");
			this.container.addContent(this.composite);
			this.item.bindProperty("text", "uniqueModelName>/text");

			this.composite.addOuterAggregation(this.item);
			assert.equal(this.item.getText(), "textFromModel", "Bound text should be on item after forwarding");
			assert.ok(this.item.getModel("uniqueModelName").outer, "Model of item should still be the outer model after forwarding");
			assert.ok(this.item.getParent().getModel("modelNameSetInComposite").inner, "Model of forwarding target should be the inner model...");
			assert.equal(this.item.getModel("modelNameSetInComposite"), undefined, "...but this model should not be propagated to the forwarded element, even after forwarding");
		});

		QUnit.test("Test binding after forwarding - with model from parent container, which is set later after forwarding", function(assert) {
			this.container.addContent(this.composite);
			this.item.bindProperty("text", "uniqueModelName>/text");

			this.composite.addOuterAggregation(this.item);
			this.container.setModel(this.model, "uniqueModelName");
			assert.equal(this.item.getText(), "textFromModel", "Bound text should be on forwarded item after model has been set outside");
			assert.ok(this.item.getModel("uniqueModelName").outer, "Model of forwarded item should be the outer model after model has been set outside");
			assert.ok(this.item.getParent().getModel("modelNameSetInComposite").inner, "Model of forwarding target should be the inner model...");
			assert.equal(this.item.getModel("modelNameSetInComposite"), undefined, "...but this model should not be propagated to the forwarded element, even after forwarding");
		});

		QUnit.test("Model name used has been overridden in Composite - with model from parent container", function(assert) {
			this.container.setModel(this.model, "modelNameSetInComposite");
			this.container.addContent(this.composite);
			this.item.bindProperty("text", "modelNameSetInComposite>/text");

			this.composite.addOuterAggregation(this.item);
			assert.equal(this.item.getText(), "textFromModel", "Bound text should be on item after forwarding");
			assert.ok(this.item.getModel("modelNameSetInComposite").outer, "Model of item should still be the outer model after forwarding");
			assert.ok(this.item.getParent().getModel("modelNameSetInComposite").inner, "Model of forwarding target should be the inner model");
		});

		QUnit.test("Model name used has been overridden in Composite - with model from parent container, which is set later after forwarding", function(assert) {
			this.container.addContent(this.composite);
			this.item.bindProperty("text", "modelNameSetInComposite>/text");

			this.composite.addOuterAggregation(this.item);
			this.container.setModel(this.model, "modelNameSetInComposite");
			assert.equal(this.item.getText(), "textFromModel", "Bound text should be on forwarded item after model has been set outside");
			assert.ok(this.item.getModel("modelNameSetInComposite").outer, "Model of item should still be the outer model after forwarding");
			assert.ok(this.item.getParent().getModel("modelNameSetInComposite").inner, "Model of forwarding target should be the inner model");
		});

		QUnit.test("Model name used is later overridden in Composite - with model from parent container", function(assert) {
			this.container.setModel(this.model, "modelNameSetInComposite");
			this.container.addContent(this.composite);
			this.item.bindProperty("text", "modelNameSetInComposite>/text");

			this.composite.addOuterAggregation(this.item);

			// now set the inner model AFTER adding the item
			var oModel = new JSONModel();
			oModel.inner = true;
			oModel.setData({
				text: "INNER DATA!"
			});
			this.composite.getAggregation("_innerElement").setModel(oModel, "modelNameSetInComposite");

			assert.equal(this.item.getText(), "textFromModel", "Bound text should be on item after forwarding");
			assert.ok(this.item.getModel("modelNameSetInComposite").outer, "Model of item should still be the outer model after forwarding");
			assert.ok(this.item.getParent().getModel("modelNameSetInComposite").inner, "Model of forwarding target should be the inner model");
		});





		QUnit.module("Specific Issues", {
			beforeEach: function() {
				this.item = new SimpleElement("item");
				this.composite = new CompositeElement();
				this.innerElement = this.composite.getAggregation("_innerElement");
			},
			afterEach: function() {
				this.item.destroy();
				this.composite.destroy();
			}
		});

		QUnit.test("Re-binding after destroy", function(assert) {
			assert.expect(0);
			var model = new JSONModel();
			model.setData({
				results: [{
					title: "t1",
					desc: "d1"
				}]
			});
			var model2 = new JSONModel();
			model2.setData({
				results: [{
					title: "2t1",
					desc: "d1"
				}]
			});

			this.composite.setModel(model);
			this.composite.bindAggregation("outerAggregation", "/results", this.item);

			this.composite.destroyOuterAggregation();

			this.composite.setModel(model2);
			this.composite.getOuterAggregation();
		});

		QUnit.test("Re-binding after destroy withForwardedBinding", function(assert) {
			assert.expect(0);
			var model = new JSONModel();
			model.setData({
				results: [{
					title: "t1",
					desc: "d1"
				}]
			});
			var model2 = new JSONModel();
			model2.setData({
				results: [{
					title: "2t1",
					desc: "d1"
				}]
			});

			this.composite.setModel(model);
			this.composite.bindAggregation("outerAggregationWithForwardedBinding", "/results", this.item);

			this.composite.destroyOuterAggregationWithForwardedBinding();

			this.composite.setModel(model2);
			this.composite.getOuterAggregationWithForwardedBinding();
		});

		QUnit.test("updateItems in sap.m.Select", function(assert) {
			assert.expect(3);
			var done = assert.async();

			sap.ui.require(["sap/m/Select", "sap/ui/model/json/JSONModel", "sap/ui/model/Filter", "sap/ui/model/FilterOperator"],
				function(Select, JSONModel, Filter, FilterOperator) {

					var oSelect = new Select({
						items: {
							path: "/",
							template: new Item({
								text: "{name}",
								key: "{key}"
							})
						},
						selectedKey: "{rm>selected}"
					});
					oSelect.bindElement({
						path: "/somePath",
						model: "rm"
					});

					var oModel = new JSONModel();
					oModel.setData([{
							name: "A",
							key: "a"
						},
						{
							name: "A2",
							key: "a2"
						},
						{
							name: "B",
							key: "b"
						},
						{
							name: "C",
							key: "c"
						}
					]);
					oSelect.setModel(oModel);

					var oModel2 = new JSONModel();
					oModel2.setData({
						somePath: {
							selected: "b"
						}
					});

					var filter = new Filter({
						path: "key",
						operator: FilterOperator.StartsWith,
						value1: "a"
					});
					oSelect.getBinding("items").filter(filter);

					assert.strictEqual(oSelect.mForwardedAggregations["items"].length, 2, "The filtered list should have two items");
					assert.strictEqual(oSelect.getList().mAggregations["items"].length, 2, "The filtered list should have two items");

					oSelect.setModel(oModel2, "rm");

					var sModelId = oSelect.getItems()[0].getModel("rm") ? oSelect.getItems()[0].getModel("rm").getId() : undefined;
					assert.strictEqual(sModelId, oSelect.getModel("rm").getId(), "The current items should have received the new rm model");
					done();
				});
		});

		QUnit.test("Un-forwarding an element by moving inside ancestor hierarchy", function(assert) {
			var oContainer = new PlainContainer();
			var oOtherComposite = new CompositeElement();
			this.composite.addOuterAggregation(this.item);
			this.composite.addOuterAggregation(oContainer);
			this.composite.addOuterAggregation(oOtherComposite);

			// item should have forwarding information now
			assert.ok(this.item.aAPIParentInfos, "item should have API Parent Info after forwarding");
			assert.equal(this.item.aAPIParentInfos.length, 1, "item should have API Parent Info with length 1 after forwarding");
			assert.equal(this.item.aAPIParentInfos[0].parent, this.composite, "Initial API parent should be the outer composite");

			// move item from forwarding composite to non-forwarding container
			oContainer.addContent(this.item);

			// item should have NO forwarding information now
			assert.equal(this.item.aAPIParentInfos, undefined, "item should have NO API Parent Info after un-forwarding");
			assert.equal(this.item.getParent(), oContainer, "item should have container as parent");

			// move item to forwarding composite again
			this.composite.addOuterAggregation(this.item);

			// item should have forwarding info again
			assert.ok(this.item.aAPIParentInfos, "item should have API Parent Info after forwarding");
			assert.equal(this.item.aAPIParentInfos.length, 1, "item should have API Parent Info with length 1 after forwarding");
			assert.equal(this.item.aAPIParentInfos[0].parent, this.composite, "Initial API parent should be the outer composite");

			// move item from forwarding composite to non-forwarding container
			oContainer.insertContent(this.item, 0);

			// item should have NO forwarding information now
			assert.equal(this.item.aAPIParentInfos, undefined, "item should have NO API Parent Info after un-forwarding");
			assert.equal(this.item.getParent(), oContainer, "item should have container as parent");

			oContainer.destroy();
			oOtherComposite.destroy();
		});

		QUnit.test("Moving an element to another forwarding parent inside ancestor hierarchy", function(assert) {
			var oOtherComposite = new CompositeElement();
			this.composite.addOuterAggregation(this.item);
			this.composite.addOuterAggregation(oOtherComposite);

			// item should have forwarding information now
			assert.ok(this.item.aAPIParentInfos, "item should have API Parent Info after forwarding");
			assert.equal(this.item.aAPIParentInfos.length, 1, "item should have API Parent Info with length 1 after forwarding");
			assert.equal(this.item.aAPIParentInfos[0].parent, this.composite, "Initial API parent should be the outer composite");

			// move item from forwarding composite to other forwarding composite within hierarchy
			oOtherComposite.addOuterAggregation(this.item);

			// item should have forwarding info, but ONLY of the other composite
			assert.ok(this.item.aAPIParentInfos, "item should have API Parent Info after forwarding");
			assert.equal(this.item.aAPIParentInfos.length, 1, "item should have API Parent Info with length 1 after forwarding");
			assert.equal(this.item.aAPIParentInfos[0].parent, oOtherComposite, "Initial API parent should be the outer composite");

			// and back...
			this.composite.addOuterAggregation(this.item);

			// item should have forwarding information now
			assert.ok(this.item.aAPIParentInfos, "item should have API Parent Info after forwarding");
			assert.equal(this.item.aAPIParentInfos.length, 1, "item should have API Parent Info with length 1 after forwarding");
			assert.equal(this.item.aAPIParentInfos[0].parent, this.composite, "Initial API parent should be the outer composite");

			oOtherComposite.destroy();
		});

		QUnit.test("Setting an element repeatedly as child of a forwarded single aggregation", function(assert) {
			this.composite.setOuterSingleAggregation(this.item);

			// item should have forwarding information now
			assert.ok(this.item.aAPIParentInfos, "item should have API Parent Info after forwarding");
			assert.equal(this.item.aAPIParentInfos.length, 1, "item should have API Parent Info with length 1 after forwarding");
			assert.equal(this.item.aAPIParentInfos[0].parent, this.composite, "Initial API parent should be the outer composite");
			assert.equal(this.item.aAPIParentInfos.forwardingCounter, 0, "forwardingCounter should be back to 0");

			// move item from forwarding composite to other forwarding composite within hierarchy
			this.composite.setOuterSingleAggregation(this.item);

			// item should still have same forwarding information now
			assert.ok(this.item.aAPIParentInfos, "item should have API Parent Info after forwarding");
			assert.equal(this.item.aAPIParentInfos.length, 1, "item should have API Parent Info with length 1 after forwarding");
			assert.equal(this.item.aAPIParentInfos[0].parent, this.composite, "Initial API parent should be the outer composite");
			assert.equal(this.item.aAPIParentInfos.forwardingCounter, 0, "forwardingCounter should be back to 0");
		});

		QUnit.test("Setting an element repeatedly as child of a forwarded single aggregation that points to a multi aggregation", function(assert) {
			this.composite.setOuterSingleToMultiAggregation(this.item);

			// item should have forwarding information now
			assert.ok(this.item.aAPIParentInfos, "item should have API Parent Info after forwarding");
			assert.equal(this.item.aAPIParentInfos.length, 1, "item should have API Parent Info with length 1 after forwarding");
			assert.equal(this.item.aAPIParentInfos[0].parent, this.composite, "Initial API parent should be the outer composite");
			assert.equal(this.item.aAPIParentInfos.forwardingCounter, 0, "forwardingCounter should be back to 0");

			// move item from forwarding composite to other forwarding composite within hierarchy
			this.composite.setOuterSingleToMultiAggregation(this.item);

			// item should still have same forwarding information now
			assert.ok(this.item.aAPIParentInfos, "item should have API Parent Info after forwarding");
			assert.equal(this.item.aAPIParentInfos.length, 1, "item should have API Parent Info with length 1 after forwarding");
			assert.equal(this.item.aAPIParentInfos[0].parent, this.composite, "Initial API parent should be the outer composite");
			assert.equal(this.item.aAPIParentInfos.forwardingCounter, 0, "forwardingCounter should be back to 0");
		});


		QUnit.test("Synchronous destroy during aggregation forwarding", function(assert) {
			// BCP: 0020751294 0000616200 2021
			var oElement = new Element();
			var CustomControl = Element.extend("CustomControl", {
				metadata: {
					properties: {
						text: "string"
					},
					aggregations: {
						forwardingAggregation: {
							type: "sap.ui.core.Element",
							multiple: false,
							forwarding: {
								idSuffix: "-innerElement",
								aggregation: "innerAggregation"
							}
						}
					}
				},
				init: function() {
					var oSimpleElement = new SimpleElement(this.getId() + "-innerElement");
					var oSimpleElementObserver = new ManagedObjectObserver(function(oEvent) {
						if (oEvent.mutation === "insert") {
							oSimpleElement.destroy();
							assert.ok(oSimpleElement.isDestroyed(), "SimpleElement destroyed during aggregation forwarding");
							assert.ok(oElement.isDestroyed(), "Aggregated Element destroyed during aggregation forwarding");
						}
					});

					oSimpleElementObserver.observe(oSimpleElement, {
						aggregations: ["innerAggregation"]
					});
				}
			});

			var oCustomControl = new CustomControl();
			assert.ok(oCustomControl, "CustomControl should be created");

			oCustomControl.setAggregation("forwardingAggregation", oElement);

			assert.equal(oCustomControl.getAggregation("forwardingAggregation"), null, "Should not break");

			oCustomControl.destroy();
		});
	});