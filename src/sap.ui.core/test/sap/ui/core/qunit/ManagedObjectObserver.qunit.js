/* global QUnit */
sap.ui.define(['sap/ui/base/ManagedObjectObserver', 'sap/ui/model/json/JSONModel', 'sap/ui/base/ManagedObject'],
	function(ManagedObjectObserver, JSONModel, ManagedObject) {
		"use strict";
		var mObjects = {};

		// define new types for testing
		var TestElement = ManagedObject.extend("sap.ui.test.TestElement", {
			metadata: {
				// ---- control specific ----
				library: "sap.ui.core",
				properties: {
					value: {
						type: "string",
						group: "Appearance",
						defaultValue: ""
					},
					stringValue: {
						type: "string",
						group: "Appearance",
						defaultValue: ""
					},
					floatValue: {
						type: "float",
						group: "Appearance",
						defaultValue: 0
					},
					intValue: {
						type: "int",
						group: "Appearance",
						defaultValue: 0
					},
					booleanValue: {
						type: "boolean",
						group: "Appearance",
						defaultValue: false
					},
					stringArray: {
						type: "string[]",
						group: "Appearance",
						defaultValue: []
					},
					floatArray: {
						type: "float[]",
						group: "Appearance",
						defaultValue: []
					},
					intArray: {
						type: "int[]",
						group: "Appearance",
						defaultValue: []
					},
					booleanArray: {
						type: "boolean[]",
						group: "Appearance",
						defaultValue: []
					},
					objectValue: {
						type: "object",
						group: "Misc",
						defaultValue: null
					}
				},
				aggregations: {
					singleAggr: {
						type: "sap.ui.test.TestElement",
						multiple: false
					},
					multiAggr: {
						type: "sap.ui.test.TestElement",
						multiple: true,
						singularName: "subObj"
					},
					anotherMulti: {
						type: "sap.ui.test.TestElement",
						multiple: true,
						singularName: "subObj"
					},
					destroySingleAggr: {
						type: "sap.ui.test.TestElement",
						multiple: false
					},
					destroyMultiAggr: {
						type: "sap.ui.test.TestElement",
						multiple: true,
						singularName: "destroyObj"
					},
					label: {
						type: "sap.ui.core.Label",
						altTypes: ["string"],
						multiple: false
					}
				},
				associations: {
					singleAsso: {
						type: "sap.ui.test.TestElement",
						multiple: false
					},
					multiAsso: {
						type: "sap.ui.test.TestElement",
						multiple: true,
						singularName: "associatedObj"
					}
				},
				events: {
					testEvent1: {},
					testEvent2: {}
				}
			},

			init: function() {
				mObjects[this.getId()] = this;
			},

			exit: function() {
				delete mObjects[this.getId()];
			},

			// needed for grouping test
			addSubObjGroup: function(oGroup, oControl) {
				if (!oControl) {
					oControl = new TestElement({
						value: oGroup.key,
						booleanValue: true
					});
				}
				this.addSubObj(oControl);
			}
		});

		var oDataModel = new JSONModel({
			value: "testvalue",
			value2: "testvalue2",
			objectValue: {
				model: true
			},
			list: [{
				value: "testvalue1",
				intValue: 1,
				groupValue: "group1"
			}, {
				value: "testvalue2",
				intValue: 2,
				groupValue: "group2"
			}, {
				value: "testvalue3",
				intValue: 3,
				groupValue: null
			}]
		});



		function compareObjects(o, p) {
			if (o === undefined) {
				return p === undefined;
			}

			var i, keysO = Object.keys(o).sort(),
				keysP = Object.keys(p).sort();

			if (keysO.length !== keysP.length) {
				return false; // not the same nr of keys
			}
			if (keysO.join('') !== keysP.join('')) {
				return false; // different keys
			}

			for (i = 0; i < keysO.length; ++i) {
				if (o[keysO[i]] instanceof Array) {
					if (!(p[keysO[i]] instanceof Array)) {
						return false;
					}
					// if (compareObjects(o[keysO[i]], p[keysO[i]]
					// === false) return false
					// would work, too, and perhaps is a better fit,
					// still, this is easy, too
					if (p[keysO[i]].sort().join('') !== o[keysO[i]].sort().join('')) {
						return false;
					}
				} else if (o[keysO[i]] instanceof Date) {
					if (!(p[keysO[i]] instanceof Date)) {
						return false;
					}
					if (('' + o[keysO[i]]) !== ('' + p[keysO[i]])) {
						return false;
					}
				} else if (o[keysO[i]] instanceof Function) {
					if (!(p[keysO[i]] instanceof Function) && !(p[keysO[i]] === "__ignore")) {
						return false;
					}
					// ignore functions, or check them regardless?
				} else if (o[keysO[i]] instanceof Object) {
					if (!(p[keysO[i]] instanceof Object) && !(p[keysO[i]] === "__ignore")) {
						return false;
					}
					if (o[keysO[i]] === o) { // self reference?
						if (p[keysO[i]] !== p) {
							return false;
						}
					} else if (p[keysO[i]] === "__ignore" || compareObjects(o[keysO[i]], p[keysO[i]])) {
						if (p[keysO[i]] === "__ignore") {
							continue;
						}
						return true;
					}
				} else if (o[keysO[i]] !== p[keysO[i]] && p[keysO[i]] !== "__ignore") {
					return false; // not the same value
				}

			}
			return true;
		}

		var vExpectedResult,
			vActualResult;

		function setExpected(vExpected) {
			vExpectedResult = vExpected;
		}

		function setActual(vActual) {
			if (vActualResult) {
				// the current actual result is already defined. There was no check
				// between 2 change handlers
				vActualResult = [vActualResult, vActual];
			} else {
				vActualResult = vActual;
			}
		}

		function checkExpected(assert, sComment) {
			if (vActualResult === undefined && vExpectedResult === undefined) {
				assert.ok(true, "No expected result defined and no actual result found. " + sComment);
				return;
			}
			if (Array.isArray(vActualResult)) {
				var bOk = true;
				for (var i = 0; i < vActualResult.length; i++) {
					if (!compareObjects(vActualResult[i], vExpectedResult[i])) {
						bOk = false;
						break;
					}
				}
				assert.ok(bOk, "Expected result matched. " + sComment);
			} else {
				assert.ok(compareObjects(vActualResult, vExpectedResult), "Expected result matched. " + sComment);
			}
			vActualResult = undefined;
			vExpectedResult = undefined;
		}

		QUnit.module("ManagedObject Model", {
			beforeEach: function(assert) {
				this.obj = new TestElement("myObject");
				this.obj.setAggregation("singleAggr", new TestElement());
				this.obj.addAggregation("multiAggr", new TestElement());
				this.obj.addAggregation("multiAggr", new TestElement());
				this.obj.setAggregation("destroySingleAggr", new TestElement());
				this.obj.addAggregation("destroyMultiAggr", new TestElement());
				this.obj.addAggregation("destroyMultiAggr", new TestElement());

				this.subObj = new TestElement();
				this.template = new TestElement({
					value: "{value}"
				});
				this.checkExpected = checkExpected.bind(null, assert);
			},
			afterEach: function() {
				this.obj.destroy();
				this.obj = null;
			}
		});

		// -------------------------------------------------------
		// Destroying
		// -------------------------------------------------------
		QUnit.test("ManagedObjectObserver listening to control destruction", function(assert) {
			var bDestroyed = false;

			var oObserver = new ManagedObjectObserver(function(oChanges) {
				bDestroyed = true;
			});

			oObserver.observe(this.obj, {
				destroy: true
			});

			assert.equal(true, oObserver.isObserved(this.obj), "The object is observed");

			this.obj.destroy();

			assert.equal(bDestroyed, true, "The object was destroyed");

			assert.equal(false, oObserver.isObserved(this.obj), "The object is not observed anymore since it was destroyed");

			oObserver.disconnect();
		});

		// -------------------------------------------------------
		// Property handling
		// -------------------------------------------------------
		QUnit.test("ManagedObjectObserver listening to all property changes", function(assert) {

			//listen to all changes
			var oObserver = new ManagedObjectObserver(function(oChanges) {
				setActual(oChanges);
			});

			oObserver.observe(this.obj, {
				properties: true
			});

			assert.ok(true, "Observation of all property changes started");

			//setting the default value of a property
			setExpected();
			this.obj.setProperty("value", "");
			this.checkExpected("Nothing changed");

			//setting a value
			setExpected({
				object: this.obj,
				type: "property",
				name: "value",
				old: "",
				current: "test"
			});

			this.obj.setProperty("value", "test");
			this.checkExpected("Set 'value' to 'test'. Observer called successfully");

			//setting a value back to default
			setExpected({
				object: this.obj,
				type: "property",
				name: "value",
				old: "test",
				current: ""
			});

			this.obj.setProperty("value", "");
			this.checkExpected("Set 'value' to ''. Observer called successfully");

			//resetting from default value
			setExpected();
			this.obj.resetProperty("value");
			this.checkExpected("Nothing changed with reset to default.");

			//setting a value back to default
			setExpected({
				object: this.obj,
				type: "property",
				name: "value",
				old: "",
				current: "test"
			});

			this.obj.setProperty("value", "test");
			this.checkExpected("Set 'value' to 'test'. Observer called successfully");

			//resetting from value
			setExpected({
				object: this.obj,
				type: "property",
				name: "value",
				old: "test",
				current: ""
			});

			this.obj.resetProperty("value");
			this.checkExpected("Set 'value' to ''. Observer called successfully");

			//setting value with wrong type
			setExpected({
				object: this.obj,
				type: "property",
				name: "value",
				old: "",
				current: "1"
			});
			this.obj.setProperty("value", 1);
			this.checkExpected("Set 'value' to '1'. Observer called successfully");

			oObserver.unobserve(this.obj, {
				properties: ["value"]
			});

			this.obj.setProperty("value", 2);
			this.checkExpected("Set 'value' to '2'. Observer not called, actual did not change");

			//setting intValue
			setExpected({
				object: this.obj,
				type: "property",
				name: "intValue",
				old: 42,
				current: -1
			});

			this.obj.setProperty("intValue", -1);
			this.checkExpected("Set 'intValue' to '-1'. Observer called successfully");

			this.obj.destroy();
			assert.equal(false, oObserver.isObserved(this.obj), "The object is not observed anymore since it was destroyed");

			oObserver.disconnect();
		});

		QUnit.test("ManagedObjectObserver start and stop listening to specific property changes", function(assert) {

			//listen to all changes
			var oObserver = new ManagedObjectObserver(function(oChanges) {
				setActual(oChanges);
			});

			oObserver.observe(this.obj, {
				properties: ["value"]
			});

			assert.ok(true, "Observation of specific member 'value' started");

			//setting the default value of a property
			setExpected();
			this.obj.setProperty("value", "");
			this.checkExpected("Nothing changed");

			//setting a value
			setExpected({
				object: this.obj,
				type: "property",
				name: "value",
				old: "",
				current: "test"
			});

			this.obj.setProperty("value", "test");
			this.checkExpected("Set 'value' to 'test'. Observer called successfully");

			//setting a value back to default
			setExpected({
				object: this.obj,
				type: "property",
				name: "value",
				old: "test",
				current: ""
			});

			this.obj.setProperty("value", "");
			this.checkExpected("Set 'value' to ''. Observer called successfully");

			//resetting from default value
			setExpected();
			this.obj.resetProperty("value");
			this.checkExpected("Nothing changed with reset to default.");

			//setting a value back to default
			setExpected({
				object: this.obj,
				type: "property",
				name: "value",
				old: "",
				current: "test"
			});

			this.obj.setProperty("value", "test");
			this.checkExpected("Set 'value' to 'test'. Observer called successfully");

			//resetting from value
			setExpected({
				object: this.obj,
				type: "property",
				name: "value",
				old: "test",
				current: ""
			});

			this.obj.resetProperty("value");
			this.checkExpected("Set 'value' to ''. Observer called successfully");

			//setting value with wrong type
			setExpected({
				object: this.obj,
				type: "property",
				name: "value",
				old: "",
				current: "1"
			});
			this.obj.setProperty("value", 1);
			this.checkExpected("Set 'value' to '1'. Observer called successfully");

			setExpected();
			this.obj.setProperty("stringValue", "test");
			this.checkExpected("Nothing changed with set of not registered property to default.");

			oObserver.observe(this.obj, {
				properties: ["intValue"]
			});

			assert.ok(true, "Additional observation of specific member 'intValue' started");

			this.obj.setProperty("stringValue", "Hugo");
			this.checkExpected("Nothing changed with set of not registered property to default.");

			//setting intValue
			setExpected({
				object: this.obj,
				type: "property",
				name: "intValue",
				old: 0,
				current: 42
			});

			this.obj.setProperty("intValue", 42);
			this.checkExpected("Set 'intValue' to '1'. Observer called successfully");

			//setting intValue
			setExpected({
				object: this.obj,
				type: "property",
				name: "value",
				old: "1",
				current: "42"
			});

			this.obj.setProperty("value", "42");
			this.checkExpected("Set 'value' to '42'. Observer called successfully");

			assert.ok(true, "Observation of specific members stopped");

			oObserver.unobserve(this.obj, {
				properties: ["value"]
			});

			this.obj.setProperty("value", 2);
			this.checkExpected("Set 'value' to '2'. Observer not called, actual did not change");

			//setting intValue
			setExpected({
				object: this.obj,
				type: "property",
				name: "intValue",
				old: 42,
				current: -1
			});

			this.obj.setProperty("intValue", -1);
			this.checkExpected("Set 'intValue' to '-1'. Observer called successfully");

			oObserver.disconnect();
		});


		// -------------------------------------------------------
		// Aggregation handling
		// -------------------------------------------------------
		QUnit.test("ManagedObjectObserver listening to all aggregation changes", function(assert) {

			//listen to all changes
			var oObserver = new ManagedObjectObserver(function(oChanges) {
				setActual(oChanges);
			});
			oObserver.observe(this.obj, {
				aggregations: true
			});

			assert.ok(true, "Observation of all aggregations started");

			//setting the same single aggregation again
			setExpected();
			this.obj.setAggregation("singleAggr", this.obj.getAggregation("singleAggr"));
			this.checkExpected("Nothing changed");

			//removing a single aggregation
			var oChild = this.obj.getAggregation("singleAggr");
			setExpected({
				object: this.obj,
				type: "aggregation",
				name: "singleAggr",
				mutation: "remove",
				child: oChild,
				children: null
			});

			this.obj.setAggregation("singleAggr", null);
			this.checkExpected("Single aggregation removed. Observer called successfully");

			//adding a single aggregation again
			setExpected({
				object: this.obj,
				type: "aggregation",
				name: "singleAggr",
				mutation: "insert",
				child: oChild,
				children: null
			});

			this.obj.setAggregation("singleAggr", oChild);
			this.checkExpected("Single aggregation added. Observer called successfully");

			//setting single aggregation with altType
			setExpected({
				object: this.obj,
				type: "aggregation",
				name: "label",
				mutation: "insert",
				child: "Text",
				children: null
			});

			this.obj.setAggregation("label", "Text");
			this.checkExpected("Single aggregation added. Observer called successfully");

			// move object from one aggregation to an other
			oChild = this.obj.getAggregation("multiAggr")[1];
			setExpected([{
				object: this.obj,
				type: "aggregation",
				name: "multiAggr",
				mutation: "remove",
				child: oChild,
				children: null
			}, {
				object: this.obj,
				type: "aggregation",
				name: "anotherMulti",
				mutation: "insert",
				child: oChild,
				children: null
			}]);

			this.obj.addAggregation("anotherMulti", oChild);
			this.checkExpected("move to other aggregation. Observer called twice");

			oObserver.disconnect();
		});

		QUnit.test("ManagedObjectObserver listening to aggregation changes of a single aggregation", function(assert) {

			//listen to all changes
			var oObserver = new ManagedObjectObserver(function(oChanges) {
				setActual(oChanges);
			});
			oObserver.observe(this.obj, {
				aggregations: ["singleAggr"]
			});

			assert.ok(true, "Observation of single aggregation started");

			//setting the same single aggregation again
			setExpected();
			this.obj.setAggregation("singleAggr", this.obj.getAggregation("singleAggr"));
			this.checkExpected("Nothing changed");

			//removing a single aggregation
			var oChild = this.obj.getAggregation("singleAggr");
			setExpected({
				object: this.obj,
				type: "aggregation",
				name: "singleAggr",
				mutation: "remove",
				child: oChild,
				children: null
			});

			this.obj.setAggregation("singleAggr", null);
			this.checkExpected("Single aggregation removed. Observer called successfully");

			//adding a single aggregation again
			setExpected({
				object: this.obj,
				type: "aggregation",
				name: "singleAggr",
				mutation: "insert",
				child: oChild,
				children: null
			});

			this.obj.setAggregation("singleAggr", oChild);
			this.checkExpected("Single aggregation added. Observer called successfully");

			// destroy a single aggregation
			setExpected({
				object: this.obj,
				type: "aggregation",
				name: "singleAggr",
				mutation: "remove",
				child: oChild,
				children: null
			});

			this.obj.destroyAggregation("singleAggr");
			this.checkExpected("Single aggregation destroyed. Observer called successfully");

			//setting an aggregation that is not observed
			setExpected();
			this.obj.addAggregation("multiAggr", this.obj.getAggregation("multiAggr")[1]);
			this.checkExpected("Multi aggregation added. Observer not alled, because not registered to this aggregation");

			oObserver.disconnect();
		});

		QUnit.test("ManagedObjectObserver listening to aggregation changes of a multiple aggregation", function(assert) {

			//listen to all changes
			var oObserver = new ManagedObjectObserver(function(oChanges) {
				setActual(oChanges);
			});
			oObserver.observe(this.obj, {
				aggregations: ["multiAggr"]
			});

			assert.ok(true, "Observation of multi aggregation started");

			//adding the same multi aggregation again
			var oChild = this.obj.getAggregation("multiAggr")[1];
			setExpected([{
				object: this.obj,
				type: "aggregation",
				name: "multiAggr",
				mutation: "remove",
				child: oChild,
				children: null
			}, {
				object: this.obj,
				type: "aggregation",
				name: "multiAggr",
				mutation: "insert",
				child: oChild,
				children: null
			}]);
			this.obj.addAggregation("multiAggr", oChild);
			this.checkExpected("Remove and insert. Observer called twice");

			//removing an aggregation
			setExpected({
				object: this.obj,
				type: "aggregation",
				name: "multiAggr",
				mutation: "remove",
				child: oChild,
				children: null
			});

			this.obj.removeAggregation("multiAggr", oChild);
			this.checkExpected("Multi aggregation removed. Observer called successfully");

			//inserting the removed again
			setExpected({
				object: this.obj,
				type: "aggregation",
				name: "multiAggr",
				mutation: "insert",
				child: oChild,
				children: null
			});

			this.obj.insertAggregation("multiAggr", oChild, 0);
			this.checkExpected("Multi aggregation added. Observer called successfully");

			//removing all multi aggregation
			var oChild2 = this.obj.getAggregation("multiAggr")[1];
			setExpected([{
				object: this.obj,
				type: "aggregation",
				name: "multiAggr",
				mutation: "remove",
				child: oChild,
				children: null
			}, {
				object: this.obj,
				type: "aggregation",
				name: "multiAggr",
				mutation: "remove",
				child: oChild2,
				children: null
			}]);
			this.obj.removeAllAggregation("multiAggr");
			this.checkExpected("RemoveAll Observer called twice");

			this.obj.addAggregation("multiAggr", oChild);
			this.obj.addAggregation("multiAggr", oChild2);

			//destroy multi aggregation
			vActualResult = undefined;
			var oChild2 = this.obj.getAggregation("multiAggr")[1];
			setExpected([{
				object: this.obj,
				type: "aggregation",
				name: "multiAggr",
				mutation: "remove",
				child: oChild,
				children: null
			}, {
				object: this.obj,
				type: "aggregation",
				name: "multiAggr",
				mutation: "remove",
				child: oChild2,
				children: null
			}]);
			this.obj.destroyAggregation("multiAggr");
			this.checkExpected("Destroy Observer called twice");

			//setting an aggregation that is not observed
			setExpected();
			this.obj.setAggregation("singleAggr", null);
			this.checkExpected("Single aggregation removed. Observer not alled, because not registered to this aggregation");

			oObserver.disconnect();

		});

		QUnit.test("ManagedObjectObserver listening to parent change", function(assert) {
			var oTestParent1 = new TestElement("parent1"), oTestParent2 = new TestElement("parent2");

			//listen to parent changes
			var oObserver = new ManagedObjectObserver(function(oChanges) {
				setActual(oChanges);
			});
			oObserver.observe(this.obj, {
				parent: true
			});

			assert.ok(true, "Observation of parent change started");

			setExpected({
				object: this.obj,
				type: "parent",
				name: "singleAggr",
				mutation: "set",
				parent: oTestParent1
			});

			oTestParent1.setAggregation("singleAggr", this.obj);
			this.checkExpected("The test object observes the change from now parent to parent 1");

			setExpected([
				{
					object: this.obj,
					type: "parent",
					name: "singleAggr",
					mutation: "unset",
					parent: oTestParent1
				},
				{
					object: this.obj,
					type: "parent",
					name: "multiAggr",
					mutation: "set",
					parent: oTestParent2
				}
				]
			);

			oTestParent2.addAggregation("multiAggr", this.obj);
			this.checkExpected("The test object observes the change from parent 1 to parent 2");

			setExpected([
				{
					object: this.obj,
					type: "parent",
					name: "multiAggr",
					mutation: "unset",
					parent: oTestParent2
				},
				{
					object: this.obj,
					type: "parent",
					name: "singleAggr",
					mutation: "set",
					parent: oTestParent2
				}]
			);

			oTestParent2.setAggregation("singleAggr", this.obj);
			this.checkExpected("Also a switch of aggregations inside the parent is observed");

			setExpected({
				object: this.obj,
				type: "parent",
				name: "singleAggr",
				mutation: "unset",
				parent: oTestParent2
			});

			oTestParent2.setAggregation("singleAggr", null);
			this.checkExpected("Destroying via setParent null is also observed");

			oObserver.disconnect();
		});

		QUnit.test("ManagedObjectObserver listening to aggregation changes for destroying aggegations", function(assert) {

			//listen to all changes
			var oObserver = new ManagedObjectObserver(function(oChanges) {
				setActual(oChanges);

				if (oChanges.name == "destroySingleAggr") {
					var oChild = oChanges.object.mAggregations[oChanges.name];
					assert.equal(oChild, null, "The child is removed");
				}

				if (oChanges.name == "destroyMultiAggr") {
					var aChildren = oChanges.object.mAggregations[oChanges.name];
					assert.ok(aChildren, null, "There are still children");
					assert.equal(aChildren.length, 1, "But there is only one");
				}
			});
			oObserver.observe(this.obj, {
				aggregations: ["destroySingleAggr", "destroyMultiAggr"]
			});

			assert.ok(true, "Observation of destroying aggegrations started");

			//setting the same single aggregation again
			setExpected();
			this.obj.setAggregation("destroySingleAggr", this.obj.getAggregation("destroySingleAggr"));
			this.checkExpected("Nothing changed");

			//removing a single aggregation
			var oChild = this.obj.getAggregation("destroySingleAggr");
			setExpected({
				object: this.obj,
				type: "aggregation",
				name: "destroySingleAggr",
				mutation: "remove",
				child: oChild,
				children: null
			});

			oChild.destroy();
			this.checkExpected("Single aggregation removed. Observer called successfully");

			setExpected();

			//removing a single aggregation
			var oChild = this.obj.getAggregation("destroyMultiAggr")[0];
			setExpected({
				object: this.obj,
				type: "aggregation",
				name: "destroyMultiAggr",
				mutation: "remove",
				child: oChild,
				children: null
			});

			oChild.destroy();
			this.checkExpected("Multi aggregation removed. Observer called successfully");

			oObserver.disconnect();

		});


		// -------------------------------------------------------
		// Association handling
		// -------------------------------------------------------
		QUnit.test("ManagedObjectObserver listening to all association changes", function(assert) {

			//listen to all changes
			var oObserver = new ManagedObjectObserver(function(oChanges) {
				setActual(oChanges);
			});
			oObserver.observe(this.obj, {
				associations: true
			});

			assert.ok(true, "Observation of all associations started");

			//adding empty string to the single association
			var oChild = this.obj.getAggregation("multiAggr")[1];

			setExpected({
				object: this.obj,
				type: "association",
				name: "singleAsso",
				mutation: "insert",
				ids: ""
			});

			this.obj.setAssociation("singleAsso", "");
			this.checkExpected("Empty single association set. Observer called successful");

			//adding a single association
			setExpected([{
				object: this.obj,
				type: "association",
				name: "singleAsso",
				mutation: "remove",
				ids: ""
			}, {
				object: this.obj,
				type: "association",
				name: "singleAsso",
				mutation: "insert",
				ids: oChild.getId()
			}]);

			this.obj.setAssociation("singleAsso", oChild);
			this.checkExpected("Single association set, remove and insert called. Observer called successfully");

			//remove a single association again
			setExpected({
				object: this.obj,
				type: "association",
				name: "singleAsso",
				mutation: "remove",
				ids: oChild.getId()
			});

			this.obj.setAssociation("singleAsso", null);
			this.checkExpected("Single association removed. Observer called successfully");

			oObserver.disconnect();

		});

		QUnit.test("ManagedObjectObserver listening to association changes of a single association", function(assert) {

			//listen to all changes
			var oObserver = new ManagedObjectObserver(function(oChanges) {
				setActual(oChanges);
			});
			oObserver.observe(this.obj, {
				associations: ["singleAsso"]
			});

			assert.ok(true, "Observation of single association started");


			//adding empty string to the single association
			var oChild = this.obj.getAggregation("multiAggr")[1];

			setExpected({
				object: this.obj,
				type: "association",
				name: "singleAsso",
				mutation: "insert",
				ids: ""
			});

			this.obj.setAssociation("singleAsso", "");
			this.checkExpected("Empty single association set. Observer called successful");

			//adding a single association
			setExpected([{
				object: this.obj,
				type: "association",
				name: "singleAsso",
				mutation: "remove",
				ids: ""
			}, {
				object: this.obj,
				type: "association",
				name: "singleAsso",
				mutation: "insert",
				ids: oChild.getId()
			}]);

			this.obj.setAssociation("singleAsso", oChild);
			this.checkExpected("Single association set, remove and insert called. Observer called successfully");

			//remove a single association again
			setExpected({
				object: this.obj,
				type: "association",
				name: "singleAsso",
				mutation: "remove",
				ids: oChild.getId()
			});

			this.obj.setAssociation("singleAsso", null);
			this.checkExpected("Single association removed. Observer called successfully");

			//setting another association that is not observed
			setExpected();
			this.obj.addAssociation("multiAsso", "test");
			this.checkExpected("MultiAsso is not observed, Observer not called");

			oObserver.disconnect();

		});

		QUnit.test("ManagedObjectObserver listening to association changes of a multiple association", function(assert) {

			//listen to all changes
			var oObserver = new ManagedObjectObserver(function(oChanges) {
				setActual(oChanges);
			});
			oObserver.observe(this.obj, {
				associations: ["multiAsso"]
			});

			assert.ok(true, "Observation of multi association started");

			//adding empty string to the multi association
			var oChild = this.obj.getAggregation("multiAggr")[1];

			setExpected({
				object: this.obj,
				type: "association",
				name: "multiAsso",
				mutation: "insert",
				ids: ""
			});

			this.obj.addAssociation("multiAsso", "");
			this.checkExpected("Empty multi association set. Observer called successful");

			//adding a multi association
			setExpected({
				object: this.obj,
				type: "association",
				name: "multiAsso",
				mutation: "insert",
				ids: oChild.getId()
			});

			this.obj.addAssociation("multiAsso", oChild);
			this.checkExpected("Multi association added. Observer called successfully");

			//remove a multi association again
			setExpected({
				object: this.obj,
				type: "association",
				name: "multiAsso",
				mutation: "remove",
				ids: oChild.getId()
			});

			this.obj.removeAssociation("multiAsso", oChild);
			this.checkExpected("Multi association removed. Observer called successfully");

			this.obj.addAssociation("multiAsso", oChild);
			vActualResult = undefined;

			//remove all multi associations
			setExpected({
				object: this.obj,
				type: "association",
				name: "multiAsso",
				mutation: "remove",
				ids: ["", oChild.getId()]
			});

			this.obj.removeAllAssociation("multiAsso");
			this.checkExpected("Multi association removed all. Observer called successfully");

			//setting another association that is not observed
			setExpected();
			this.obj.addAssociation("singleAsso", "test");
			this.checkExpected("SingleAsso is not observed, Observer not called");

			oObserver.disconnect();

		});

		// -------------------------------------------------------
		// Event handling
		// -------------------------------------------------------
		QUnit.test("ManagedObjectObserver listening to all event changes", function(assert) {

			//listen to all changes
			var oObserver = new ManagedObjectObserver(function(oChanges) {
				setActual(oChanges);
			});
			oObserver.observe(this.obj, {
				events: true
			});

			assert.equal(true, true, "Observation of all events started");

			var fnHandler = function() {};

			//attaching a listener
			setExpected({
				object: this.obj,
				type: "event",
				name: "testEvent1",
				mutation: "insert",
				listener: undefined,
				func: fnHandler,
				data: undefined
			});
			this.obj.attachEvent("testEvent1", fnHandler);
			this.checkExpected("Listener attached to testEvent1. Observer called successful");

			setExpected({
				object: this.obj,
				type: "event",
				name: "testEvent2",
				mutation: "insert",
				listener: undefined,
				func: fnHandler,
				data: undefined
			});
			this.obj.attachEvent("testEvent2", fnHandler);
			this.checkExpected("Listener attached to testEvent2. Observer called successful");

			setExpected({
				object: this.obj,
				type: "event",
				name: "testEvent2",
				mutation: "remove",
				listener: undefined,
				func: fnHandler,
				data: undefined
			});
			this.obj.detachEvent("testEvent2", fnHandler);
			this.checkExpected("Listener detached to testEvent2. Observer called successful");

			setExpected({
				object: this.obj,
				type: "event",
				name: "testEvent2",
				mutation: "insert",
				listener: undefined,
				func: "__ignore",
				data: undefined
			});
			this.obj.attachEventOnce("testEvent2", fnHandler);
			this.checkExpected("Listener attached to testEvent2. Observer called successful");

			setExpected({
				object: this.obj,
				type: "event",
				name: "testEvent2",
				mutation: "remove",
				listener: undefined,
				func: "__ignore",
				data: undefined
			});
			this.obj.fireEvent("testEvent2");
			this.checkExpected("Listener detached after firing once. Observer called successful");

			oObserver.disconnect();
		});

		QUnit.test("ManagedObjectObserver listening to one event change", function(assert) {

			//listen to all changes
			var oObserver = new ManagedObjectObserver(function(oChanges) {
				setActual(oChanges);
			});
			oObserver.observe(this.obj, {
				events: ["testEvent1"]
			});

			assert.equal(true, true, "Observation of one events started");

			var oData = {
				firstName: "Peter",
				lastName: "Parker"
			};

			var fnHandler = function(oEvent) {};

			var fnDataHandler = function(oEvent, data) {
				assert.deepEqual(data, oData, "Data is transfered correctly");
			};

			// attaching a listener
			setExpected({
				object: this.obj,
				type: "event",
				name: "testEvent1",
				mutation: "insert",
				listener: undefined,
				func: fnHandler,
				data: undefined
			});

			this.obj.attachEvent("testEvent1", fnHandler);
			this.checkExpected("Listener attached to testEvent1. Observer called successful");

			setExpected();
			this.obj.attachEvent("testEvent2", fnHandler);
			this.checkExpected("Listener attached to testEvent2, not observed. Observer not called successful");

			setExpected({
				object: this.obj,
				type: "event",
				name: "testEvent1",
				mutation: "remove",
				listener: undefined,
				func: fnHandler,
				data: undefined
			});
			this.obj.detachEvent("testEvent1", fnHandler);
			this.checkExpected("Listener detached to testEvent2. Observer called successful");

			setExpected({
				object: this.obj,
				type: "event",
				name: "testEvent1",
				mutation: "insert",
				listener: undefined,
				func: fnDataHandler,
				data: oData
			});

			this.obj.attachEventOnce("testEvent1", oData, fnDataHandler);
			this.checkExpected("Listener attached to testEvent1. Observer called successful");

			setExpected({
				object: this.obj,
				type: "event",
				name: "testEvent1",
				mutation: "remove",
				listener: undefined,
				func: fnDataHandler,
				data: oData
			});
			this.obj.fireEvent("testEvent1", oData);
			this.checkExpected("Listener detached after firing once. Observer called successful");

			oObserver.disconnect();

		});

		// -------------------------------------------------------
		// Binding handling
		// -------------------------------------------------------
		QUnit.test("ManagedObjectObserver listening to all binding changes - testing property binding", function(assert) {

			//listen to all changes
			var oObserver = new ManagedObjectObserver(function(oChanges) {
				setActual(oChanges);
			});
			oObserver.observe(this.obj, {
				bindings: true
			});

			assert.equal(true, true, "Observation of all bindings started");

			//bind a property, no model set yet
			setExpected({
				object: this.obj,
				type: "binding",
				name: "value",
				mutation: "prepare",
				bindingInfo: "__ignore",
				memberType: "property"
			});

			this.obj.bindProperty("value", {
				path: '/value'
			});

			this.checkExpected("Binding on value prepared. Observer called successful");

			//setting the model
			setExpected({
				object: this.obj,
				type: "binding",
				name: "value",
				mutation: "ready",
				bindingInfo: "__ignore",
				memberType: "property"
			});
			this.obj.setModel(oDataModel);
			this.checkExpected("Binding on value bound. Observer called successful");

			//removing model
			setExpected({
				object: this.obj,
				type: "binding",
				name: "value",
				mutation: "remove",
				bindingInfo: "__ignore",
				memberType: "property"
			});
			this.obj.setModel(null, undefined);
			this.checkExpected("Binding on value unbound bacause model is not available. Observer called successful");

			//unbind property
			setExpected({
				object: this.obj,
				type: "binding",
				name: "value",
				mutation: "remove",
				bindingInfo: "__ignore",
				memberType: "property"
			});
			this.obj.unbindProperty("value");
			this.checkExpected("Binding on value removed. Observer called successful");

			//set the model first and then bind property
			this.obj.setModel(oDataModel);
			setExpected([{
					object: this.obj,
					type: "binding",
					name: "value",
					mutation: "prepare",
					bindingInfo: "__ignore",
					memberType: "property"
				},
				{
					object: this.obj,
					type: "binding",
					name: "value",
					mutation: "ready",
					bindingInfo: "__ignore",
					memberType: "property"
				}
			]);

			this.obj.bindProperty("value", {
				path: '/value'
			});
			this.checkExpected("Binding on value prepared and bound. Observer called successful");

			//unbind property
			setExpected({
				object: this.obj,
				type: "binding",
				name: "value",
				mutation: "remove",
				bindingInfo: "__ignore",
				memberType: "property"
			});
			this.obj.unbindProperty("value");
			this.checkExpected("Binding on value removed. Observer called successful");

			oObserver.disconnect();

		});
		QUnit.test("ManagedObjectObserver listening to specific property binding changes - testing property binding", function(assert) {

			//listen to all changes
			var oObserver = new ManagedObjectObserver(function(oChanges) {
				setActual(oChanges);
			});
			oObserver.observe(this.obj, {
				bindings: ["value"]
			});

			assert.equal(true, true, "Observation of property binding for 'value' started");

			//bind a property, no model set yet
			setExpected({
				object: this.obj,
				type: "binding",
				name: "value",
				mutation: "prepare",
				bindingInfo: "__ignore",
				memberType: "property"
			});

			this.obj.bindProperty("value", {
				path: '/value'
			});
			this.checkExpected("Binding on value prepared. Observer called successful");

			//setting the model
			setExpected({
				object: this.obj,
				type: "binding",
				name: "value",
				mutation: "ready",
				bindingInfo: "__ignore",
				memberType: "property"
			});
			this.obj.setModel(oDataModel);
			this.checkExpected("Binding on value bound. Observer called successful");

			//removing model
			setExpected({
				object: this.obj,
				type: "binding",
				name: "value",
				mutation: "remove",
				bindingInfo: "__ignore",
				memberType: "property"
			});
			this.obj.setModel(null, undefined);
			this.checkExpected("Binding on value unbound bacause model is not available. Observer called successful");

			//unbind property
			setExpected({
				object: this.obj,
				type: "binding",
				name: "value",
				mutation: "remove",
				bindingInfo: "__ignore",
				memberType: "property"
			});
			this.obj.unbindProperty("value");
			this.checkExpected("Binding on value removed. Observer called successful");

			//set the model first and then bind property
			this.obj.setModel(oDataModel);
			setExpected([{
					object: this.obj,
					type: "binding",
					name: "value",
					mutation: "prepare",
					bindingInfo: "__ignore",
					memberType: "property"
				},
				{
					object: this.obj,
					type: "binding",
					name: "value",
					mutation: "ready",
					bindingInfo: "__ignore",
					memberType: "property"
				}
			]);

			this.obj.bindProperty("value", {
				path: '/value'
			});
			this.checkExpected("Binding on value prepared and bound. Observer called successful");

			//unbind property
			setExpected({
				object: this.obj,
				type: "binding",
				name: "value",
				mutation: "remove",
				bindingInfo: "__ignore",
				memberType: "property"
			});
			this.obj.unbindProperty("value");
			this.checkExpected("Binding on value removed. Observer called successful");

			//bind/unbind a property that is not observed
			setExpected();
			this.obj.bindProperty("stringValue", {
				path: '/value'
			});
			this.checkExpected("Bind not observed property, Observer not called");
			setExpected();
			this.obj.unbindProperty("stringValue");
			this.checkExpected("Unbind not observed property, Observer not called");

			oObserver.disconnect();

		});

		QUnit.test("ManagedObjectObserver listening to all binding changes - testing a single aggregation binding", function(assert) {

			//listen to all changes
			var oObserver = new ManagedObjectObserver(function(oChanges) {
				setActual(oChanges);
			});
			oObserver.observe(this.obj, {
				bindings: ['multiAggr']
			});

			assert.equal(true, true, "Observation of aggregation bindings for 'multiAggr' started");

			//bind a aggregation, no model set yet
			setExpected({
				object: this.obj,
				type: "binding",
				name: "multiAggr",
				mutation: "prepare",
				bindingInfo: "__ignore",
				memberType: "aggregation"
			});

			this.obj.bindAggregation("multiAggr", {
				path: '/list',
				template: new TestElement()
			});
			this.checkExpected("Binding on multiAggr prepared. Observer called successful");

			//setting the model
			setExpected({
				object: this.obj,
				type: "binding",
				name: "multiAggr",
				mutation: "ready",
				bindingInfo: "__ignore",
				memberType: "aggregation"
			});
			this.obj.setModel(oDataModel);
			this.checkExpected("Binding on multiAggr bound. Observer called successful");

			//removing model
			setExpected({
				object: this.obj,
				type: "binding",
				name: "multiAggr",
				mutation: "remove",
				bindingInfo: "__ignore",
				memberType: "aggregation"
			});
			this.obj.setModel(null, undefined);
			this.checkExpected("Binding on multiAggr unbound bacause model is not available. Observer called successful");

			//unbind aggregation
			setExpected({
				object: this.obj,
				type: "binding",
				name: "multiAggr",
				mutation: "remove",
				bindingInfo: "__ignore",
				memberType: "aggregation"
			});
			this.obj.unbindAggregation("multiAggr");
			this.checkExpected("Binding on multiAggr removed. Observer called successful");

			//set the model first and then bind aggregation
			this.obj.setModel(oDataModel);
			setExpected([{
					object: this.obj,
					type: "binding",
					name: "multiAggr",
					mutation: "prepare",
					bindingInfo: "__ignore",
					memberType: "aggregation"
				},
				{
					object: this.obj,
					type: "binding",
					name: "multiAggr",
					mutation: "ready",
					bindingInfo: "__ignore",
					memberType: "aggregation"
				}
			]);

			this.obj.bindAggregation("multiAggr", {
				path: '/list',
				template: new TestElement()
			});
			this.checkExpected("Binding on multiAggr prepared and bound. Observer called successful");

			//unbind aggregation
			setExpected({
				object: this.obj,
				type: "binding",
				name: "multiAggr",
				mutation: "remove",
				bindingInfo: "__ignore",
				memberType: "aggregation"
			});
			this.obj.unbindAggregation("multiAggr");
			this.checkExpected("Binding on multiAggr removed. Observer called successful");

			oObserver.disconnect();

		});

		QUnit.test("ManagedObjectObserver listening to specific aggregation binding changes - testing aggregation binding", function(assert) {

			//listen to all changes
			var oObserver = new ManagedObjectObserver(function(oChanges) {
				setActual(oChanges);
			});
			oObserver.observe(this.obj, {
				bindings: ["multiAggr"]
			});

			assert.equal(true, true, "Observation of all bindings started");

			//bind a aggregation, no model set yet
			setExpected({
				object: this.obj,
				type: "binding",
				name: "multiAggr",
				mutation: "prepare",
				bindingInfo: "__ignore",
				memberType: "aggregation"
			});

			this.obj.bindAggregation("multiAggr", {
				path: '/list',
				template: new TestElement()
			});
			this.checkExpected("Binding on multiAggr prepared. Observer called successful");

			//setting the model
			setExpected({
				object: this.obj,
				type: "binding",
				name: "multiAggr",
				mutation: "ready",
				bindingInfo: "__ignore",
				memberType: "aggregation"
			});
			this.obj.setModel(oDataModel);
			this.checkExpected("Binding on multiAggr bound. Observer called successful");

			//removing model
			setExpected({
				object: this.obj,
				type: "binding",
				name: "multiAggr",
				mutation: "remove",
				bindingInfo: "__ignore",
				memberType: "aggregation"
			});
			this.obj.setModel(null, undefined);
			this.checkExpected("Binding on multiAggr unbound bacause model is not available. Observer called successful");

			//unbind aggregation
			setExpected({
				object: this.obj,
				type: "binding",
				name: "multiAggr",
				mutation: "remove",
				bindingInfo: "__ignore",
				memberType: "aggregation"
			});
			this.obj.unbindAggregation("multiAggr");
			this.checkExpected("Binding on multiAggr removed. Observer called successful");

			//set the model first and then bind aggregation
			this.obj.setModel(oDataModel);
			setExpected([{
					object: this.obj,
					type: "binding",
					name: "multiAggr",
					mutation: "prepare",
					bindingInfo: "__ignore",
					memberType: "aggregation"
				},
				{
					object: this.obj,
					type: "binding",
					name: "multiAggr",
					mutation: "ready",
					bindingInfo: "__ignore",
					memberType: "aggregation"
				}
			]);

			this.obj.bindAggregation("multiAggr", {
				path: '/list',
				template: new TestElement()
			});
			this.checkExpected("Binding on multiAggr prepared and bound. Observer called successful");

			//unbind aggregation
			setExpected({
				object: this.obj,
				type: "binding",
				name: "multiAggr",
				mutation: "remove",
				bindingInfo: "__ignore",
				memberType: "aggregation"
			});
			this.obj.unbindAggregation("multiAggr");
			this.checkExpected("Binding on multiAggr removed. Observer called successful");

			//bind/unbind a property that is not observed
			setExpected();
			this.obj.bindAggregation("anotherMulti", {
				path: '/list',
				template: new TestElement()
			});
			this.checkExpected("Bind not observed aggregation, Observer not called");
			setExpected();
			this.obj.unbindProperty("anotherMulti");
			this.checkExpected("Unbind not observed aggregation, Observer not called");

			oObserver.disconnect();

		});


		// -------------------------------------------------------
		// Edge cases
		// -------------------------------------------------------

		QUnit.test("ManagedObjectObserver without a callback", function(assert) {

			assert.strictEqual(this.obj._observer, undefined, "No observer");
			var oObserver1 = new ManagedObjectObserver(function(oChanges) {});
			oObserver1.observe(this.obj, {
				associations: ["multiAsso"]
			});
			var oObserver2 = new ManagedObjectObserver(function(oChanges) {});
			oObserver2.observe(this.obj, {
				properties: ["value"]
			});

			assert.notStrictEqual(this.obj._observer, undefined, "Observer is set");
			oObserver2.disconnect();
			assert.notStrictEqual(this.obj._observer, undefined, "Still Observer is set");
			oObserver1.disconnect();
			assert.strictEqual(this.obj._observer, undefined, "All Observers disconnected");

			assert.throws(function() {
				new ManagedObjectObserver();
			}, "Observer is not created without a callback and threw error");
		});

		QUnit.test("ManagedObjectObserver unobserve complete object", function(assert) {
			var obj2 = new TestElement("myObject2");

			assert.strictEqual(this.obj._observer, undefined, "No observer");
			assert.strictEqual(obj2._observer, undefined, "No observer");
			//listen to all changes
			var oObserver = new ManagedObjectObserver(function(oChanges) {
				setActual(oChanges);
			});

			oObserver.observe(this.obj, {
				properties: true
			});

			oObserver.observe(obj2, {
				properties: true
			});

			assert.ok(true, "Observation of all property changes started for object1 and object2");

			//setting the default value of a property
			setExpected();
			this.obj.setProperty("value", "");
			this.checkExpected("Nothing changed in object1");

			//setting a value
			setExpected({
				object: this.obj,
				type: "property",
				name: "value",
				old: "",
				current: "test"
			});

			this.obj.setProperty("value", "test");
			this.checkExpected("Set 'value' to 'test'. Observer called successfully in object1");

			setExpected({
				object: this.obj,
				type: "property",
				name: "value",
				old: "test",
				current: "1"
			});
			this.obj.setProperty("value", 1);
			this.checkExpected("Set 'value' to '1'. Observer called successfully in object 1");

			setExpected({
				object: obj2,
				type: "property",
				name: "value",
				old: "test",
				current: "2"
			});
			obj2.setProperty("value", 2);
			this.checkExpected("Set 'value' to '2'. Observer called successfully in object2");

			oObserver.unobserve(this.obj);

			this.obj.setProperty("value", 2);
			this.checkExpected("Set 'value' to '2'. Observer not called, actual did not change");

			setExpected({
				object: obj2,
				type: "property",
				name: "value",
				old: "test",
				current: "3"
			});
			obj2.setProperty("value", 3);
			this.checkExpected("Set 'value' to '3'. Observer for object2 is still called successfully in object2");

			oObserver.disconnect();
		});

		QUnit.test("ManagedObjectObserver observe/isObserved", function(assert) {

			assert.strictEqual(this.obj._observer, undefined, "No observer");
			//listen to all changes
			var oObserver = new ManagedObjectObserver(function(oChanges) {
				setActual(oChanges);
			});

			oObserver.observe(this.obj, {
				properties: true
			});

			assert.ok(true, "Observation of all property changes started");

			var oConfiguration = oObserver.getConfiguration(this.obj);

			assert.strictEqual(10, oConfiguration.properties.length, "All ten properties of the object are observed");
			assert.equal(true, oObserver.isObserved(this.obj), "The object is observed");

			oObserver.unobserve(this.obj, {
				properties: ["value"]
			});

			oConfiguration = oObserver.getConfiguration(this.obj);

			assert.ok(true, "Observation of property 'value' stopped");

			assert.strictEqual(9, oConfiguration.properties.length, "Remain 9 properties of the object that are observed");
			assert.equal(true, oObserver.isObserved(this.obj), "The object is still observed");

			oObserver.observe(this.obj, {
				aggregations: ["singleAggr"]
			});

			oConfiguration = oObserver.getConfiguration(this.obj);

			assert.ok(true, "Observation of aggregation 'singleAggr' started");

			assert.strictEqual(9, oConfiguration.properties.length, "Still 9 properties of the object that are observed");
			assert.strictEqual(1, oConfiguration.aggregations.length, "Additionally one aggregation is observed");
			assert.equal(true, oObserver.isObserved(this.obj), "The object is still observed");

			oObserver.unobserve(this.obj);
			assert.equal(false, oObserver.isObserved(this.obj), "The object is no longer observed");

			oObserver.disconnect();
		});

	});