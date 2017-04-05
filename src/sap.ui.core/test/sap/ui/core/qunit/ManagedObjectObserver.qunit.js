sap.ui.require(['sap/ui/base/ManagedObjectObserver', 'sap/ui/model/json/JSONModel', 'sap/ui/base/ManagedObject'],
	function(ManagedObjectObserver, JSONModel, ManagedObject) {

	var mObjects = {};

	// define new types for testing
	ManagedObject.extend("sap.ui.test.TestElement", {
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
				oControl = new sap.ui.test.TestElement({
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
		list: [
			{
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
			}
		]
	});



	function compareObjects(o, p) {
		var i, keysO = Object.keys(o).sort(), keysP = Object
							.keys(p).sort();
					if (keysO.length !== keysP.length)
						return false;// not the same nr of keys
		if (keysO.join('') !== keysP.join(''))
			return false;// different keys
		for (i = 0; i < keysO.length; ++i) {
			if (o[keysO[i]] instanceof Array) {
				if (!(p[keysO[i]] instanceof Array))
					return false;
				// if (compareObjects(o[keysO[i]], p[keysO[i]]
				// === false) return false
				// would work, too, and perhaps is a better fit,
				// still, this is easy, too
				if (p[keysO[i]].sort().join('') !== o[keysO[i]]
						.sort().join(''))
					return false;
			} else if (o[keysO[i]] instanceof Date) {
				if (!(p[keysO[i]] instanceof Date))
					return false;
				if (('' + o[keysO[i]]) !== ('' + p[keysO[i]]))
					return false;
			} else if (o[keysO[i]] instanceof Function) {
				if (!(p[keysO[i]] instanceof Function) && !(p[keysO[i]] === "__ignore"))
					return false;
				// ignore functions, or check them regardless?
			} else if (o[keysO[i]] instanceof Object) {
				if (!(p[keysO[i]] instanceof Object) && !(p[keysO[i]] === "__ignore"))
					return false;
				if (o[keysO[i]] === o) {// self reference?
					if (p[keysO[i]] !== p)
						return false;
				} else if (p[keysO[i]] === "__ignore" || compareObjects(o[keysO[i]], p[keysO[i]])) {
					if (p[keysO[i]] === "__ignore") {
						continue;
					}
					return true;
				}
			}
			if (o[keysO[i]] !== p[keysO[i]] && p[keysO[i]] !== "__ignore") {
				return false;// not the same value
			}

		}
		return true;
	}

	var vExpectedResult,
		vActualResult,
		bChecked = false;

	function setExpected(vExpected) {
		vExpectedResult = vExpected;
	};

	function setActual(vActual) {
		if (vActualResult) {
			// the current actual result is already defined. There was no check
			// between 2 change handlers
			vActualResult = [vActualResult, vActual];
		} else {
			vActualResult = vActual;
		}
	};

	function checkExpected(assert, sComment) {
		if (vActualResult === undefined && vExpectedResult === undefined) {
			assert.ok(true, "No expected result defined and no actual result found. " + sComment);
			return;
		}
		if (Array.isArray(vActualResult)) {
			for (var i = 0; i < vActualResult.length; i++) {
				assert.ok(compareObjects(vActualResult[i], vExpectedResult[i]), "Expected result matched. " + sComment);
			}
		} else {
			assert.ok(compareObjects(vActualResult, vExpectedResult), "Expected result matched. " + sComment);
		}
		vActualResult = undefined;
		vExpectedResult = undefined;
	};

	QUnit.module("ManagedObject Model", {
		beforeEach: function(assert) {
			this.obj = new sap.ui.test.TestElement("myObject");
			this.obj.setAggregation("singleAggr", new sap.ui.test.TestElement());
			this.obj.addAggregation("multiAggr", new sap.ui.test.TestElement());
			this.obj.addAggregation("multiAggr", new sap.ui.test.TestElement());

			this.subObj = new sap.ui.test.TestElement();
			this.template = new sap.ui.test.TestElement({
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
			type:"property",
			name:"value",
			old: "",
			current: "test"
		});

		this.obj.setProperty("value", "test");
		this.checkExpected("Set 'value' to 'test'. Observer called successfully");

		//setting a value back to default
		setExpected({
			object: this.obj,
			type:"property",
			name:"value",
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
			type:"property",
			name:"value",
			old: "",
			current: "test"
		});

		this.obj.setProperty("value", "test");
		this.checkExpected("Set 'value' to 'test'. Observer called successfully");

		//resetting from value
		setExpected({
			object: this.obj,
			type:"property",
			name:"value",
			old: "test",
			current: ""
		});

		this.obj.resetProperty("value");
		this.checkExpected("Set 'value' to ''. Observer called successfully");

		//setting value with wrong type
		setExpected({
			object: this.obj,
			type:"property",
			name:"value",
			old: "",
			current: "1"
		});
		this.obj.setProperty("value", 1);
		this.checkExpected("Set 'value' to '1'. Observer called successfully");

		oObserver.disconnect();
	});

	QUnit.test("ManagedObjectObserver listening to specific property changes", function(assert) {

		//listen to all changes
		var oObserver = new ManagedObjectObserver(function(oChanges) {
			setActual(oChanges);
		});

		oObserver.observe(this.obj, {
			properties: ["value"]
		});

		assert.ok(true, "Observation of specific members started");

		//setting the default value of a property
		setExpected();
		this.obj.setProperty("value", "");
		this.checkExpected("Nothing changed");

		//setting a value
		setExpected({
			object: this.obj,
			type:"property",
			name:"value",
			old: "",
			current: "test"
		});

		this.obj.setProperty("value", "test");
		this.checkExpected("Set 'value' to 'test'. Observer called successfully");

		//setting a value back to default
		setExpected({
			object: this.obj,
			type:"property",
			name:"value",
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
			type:"property",
			name:"value",
			old: "",
			current: "test"
		});

		this.obj.setProperty("value", "test");
		this.checkExpected("Set 'value' to 'test'. Observer called successfully");

		//resetting from value
		setExpected({
			object: this.obj,
			type:"property",
			name:"value",
			old: "test",
			current: ""
		});

		this.obj.resetProperty("value");
		this.checkExpected("Set 'value' to ''. Observer called successfully");

		//setting value with wrong type
		setExpected({
			object: this.obj,
			type:"property",
			name:"value",
			old: "",
			current: "1"
		});
		this.obj.setProperty("value", 1);
		this.checkExpected("Set 'value' to '1'. Observer called successfully");

		setExpected();
		this.obj.setProperty("stringValue","test");
		this.checkExpected("Nothing changed with set of not registered property to default.");

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
			type:"aggregation",
			name:"singleAggr",
			mutation: "remove",
			child: oChild,
			children: null
		});

		this.obj.setAggregation("singleAggr",null);
		this.checkExpected("Single aggregation removed. Observer called successfully");

		//adding a single aggregation again
		setExpected({
			object: this.obj,
			type:"aggregation",
			name:"singleAggr",
			mutation: "insert",
			child: oChild,
			children: null
		});

		this.obj.setAggregation("singleAggr", oChild);
		this.checkExpected("Single aggregation added. Observer called successfully");

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
			type:"aggregation",
			name:"singleAggr",
			mutation: "remove",
			child: oChild,
			children: null
		});

		this.obj.setAggregation("singleAggr",null);
		this.checkExpected("Single aggregation removed. Observer called successfully");

		//adding a single aggregation again
		setExpected({
			object: this.obj,
			type:"aggregation",
			name:"singleAggr",
			mutation: "insert",
			child: oChild,
			children: null
		});

		this.obj.setAggregation("singleAggr", oChild);
		this.checkExpected("Single aggregation added. Observer called successfully");

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
			type:"aggregation",
			name:"multiAggr",
			mutation: "remove",
			child: oChild,
			children: null
		},{
			object: this.obj,
			type:"aggregation",
			name:"multiAggr",
			mutation: "insert",
			child: oChild,
			children: null
		}]);
		this.obj.addAggregation("multiAggr", oChild);
		this.checkExpected("Remove and insert. Observer called twice");

		//adding an aggregation
		setExpected({
			object: this.obj,
			type:"aggregation",
			name:"multiAggr",
			mutation: "remove",
			child: oChild,
			children: null
		});

		this.obj.removeAggregation("multiAggr",oChild);
		this.checkExpected("Multi aggregation removed. Observer called successfully");

		//inserting the removed again
		setExpected({
			object: this.obj,
			type:"aggregation",
			name:"multiAggr",
			mutation: "insert",
			child: oChild,
			children: null
		});

		this.obj.insertAggregation("multiAggr", oChild, 0);
		this.checkExpected("Multi aggregation added. Observer called successfully");

		//setting an aggregation that is not observed
		setExpected();
		this.obj.setAggregation("singleAggr", null);
		this.checkExpected("Single aggregation removed. Observer not alled, because not registered to this aggregation");

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
		var sAsso = this.obj.getAssociation("singleAsso");
		var oChild = this.obj.getAggregation("multiAggr")[1];

		setExpected({
			object: this.obj,
			type:"association",
			name:"singleAsso",
			mutation: "insert",
			ids: ""
		});

		this.obj.setAssociation("singleAsso", "");
		this.checkExpected("Empty single association set. Observer called successful");

		//adding a single association
		setExpected([{
			object: this.obj,
			type:"association",
			name:"singleAsso",
			mutation: "remove",
			ids: ""
		},{
			object: this.obj,
			type:"association",
			name:"singleAsso",
			mutation: "insert",
			ids: oChild.getId()
		}]);

		this.obj.setAssociation("singleAsso",oChild);
		this.checkExpected("Single association set, remove and insert called. Observer called successfully");

		//remove a single association again
		setExpected({
			object: this.obj,
			type:"association",
			name:"singleAsso",
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
		var sAsso = this.obj.getAssociation("singleAsso");
		var oChild = this.obj.getAggregation("multiAggr")[1];

		setExpected({
			object: this.obj,
			type:"association",
			name:"singleAsso",
			mutation: "insert",
			ids: ""
		});

		this.obj.setAssociation("singleAsso", "");
		this.checkExpected("Empty single association set. Observer called successful");

		//adding a single association
		setExpected([{
			object: this.obj,
			type:"association",
			name:"singleAsso",
			mutation: "remove",
			ids: ""
		},{
			object: this.obj,
			type:"association",
			name:"singleAsso",
			mutation: "insert",
			ids: oChild.getId()
		}]);

		this.obj.setAssociation("singleAsso",oChild);
		this.checkExpected("Single association set, remove and insert called. Observer called successfully");

		//remove a single association again
		setExpected({
			object: this.obj,
			type:"association",
			name:"singleAsso",
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
		var sAsso = this.obj.getAssociation("singleAsso");
		var oChild = this.obj.getAggregation("multiAggr")[1];

		setExpected({
			object: this.obj,
			type:"association",
			name:"multiAsso",
			mutation: "insert",
			ids: ""
		});

		this.obj.addAssociation("multiAsso", "");
		this.checkExpected("Empty multi association set. Observer called successful");

		//adding a multi association
		setExpected({
			object: this.obj,
			type:"association",
			name:"multiAsso",
			mutation: "insert",
			ids: oChild.getId()
		});

		this.obj.addAssociation("multiAsso",oChild);
		this.checkExpected("Multi association added. Observer called successfully");

		//remove a multi association again
		setExpected({
			object: this.obj,
			type:"association",
			name:"multiAsso",
			mutation: "remove",
			ids: oChild.getId()
		});

		this.obj.removeAssociation("multiAsso", oChild);
		this.checkExpected("Multi association removed. Observer called successfully");

		//setting another association that is not observed
		setExpected();
		this.obj.addAssociation("singleAsso", "test");
		this.checkExpected("SingleAsso is not observed, Observer not called");

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

		assert.throws(function () {
			new ManagedObjectObserver();
		}, "Observer is not created without a callback and threw error");
	});


});
