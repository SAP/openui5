/* global QUnit */

sap.ui.define([
	"sap/ui/dt/ManagedObjectObserver",
	"sap/ui/core/Element",
	"sap/ui/thirdparty/sinon-4"
], function(
	ManagedObjectObserver,
	Element,
	sinon
) {
	"use strict";

	var TestObject = Element.extend("sap.ui.dt.TestObject", {
		metadata: {
			properties: {
				myProperty: {
					type: "boolean"
				}
			},
			associations: {
				myAssociation: {
					type: "sap.ui.core.Control",
					multiple: true
				},
				mySingleAssociation: {
					type: "sap.ui.core.Element"
				},
				myOverwrittenAssociation: {
					type: "sap.ui.core.Element",
					multiple: true
				}
			},
			aggregations: {
				myAggregation: {
					type: "sap.ui.core.Element"
				},
				myInheritedAggregation: {
					type: "sap.ui.core.Element"
				},
				mySingleAggregation: {
					type: "sap.ui.core.Element",
					multiple: false
				},
				myOverwrittenAggregation: {
					type: "sap.ui.core.Element"
				}
			}
		}
	});

	var SmartTestObject = TestObject.extend("sap.ui.dt.SmartTestObject", {
		metadata: {
			aggregations: {
				myOriginalAggregation: {
					type: "sap.ui.core.Element"
				}
			}
		}
	});

	TestObject.prototype.addMyOverwrittenAggregation = function() {
		// don't call the generic method as we would do something special...
	};

	TestObject.prototype.insertMyOverwrittenAggregation = function() {
		// don't call the generic method as we would do something special...
	};

	TestObject.prototype.removeMyOverwrittenAggregation = function() {
		// don't call the generic method as we would do something special...
	};

	TestObject.prototype.removeAllMyOverwrittenAggregation = function() {
		// don't call the generic method as we would do something special...
	};

	TestObject.prototype.destroyMyOverwrittenAggregation = function() {
		// don't call the generic method as we would do something special...
	};

	TestObject.prototype.addMyOverwrittenAssociation = function() {
		// don't call the generic method as we would do something special...
	};

	TestObject.prototype.removeMyOverwrittenAssociation = function() {
		// don't call the generic method as we would do something special...
	};

	TestObject.prototype.removeAllMyOverwrittenAssociation = function() {
		// don't call the generic method as we would do something special...
	};

	SmartTestObject.prototype.insertMyOriginalAggregation = function() {
		// don't call the generic method as we would do something special...
		this.insertMyInheritedAggregation();
	};

	var sandbox = sinon.createSandbox();

	QUnit.module("Given that an ManagedObject is observed", {
		beforeEach(assert) {
			this.oManagedObject = new TestObject();
			this.oOtherObject = new TestObject();
			this.oSmartManagedObject = new SmartTestObject();
			this.oManagedObjectObserver = new ManagedObjectObserver({
				target: this.oManagedObject,
				destroyed: fnObserverDestroyedCalled.bind(null, assert),
				modified: fnObserverModifiedCalled.bind(null, assert)
			});
			this.oSmartManagedObjectObserver = new ManagedObjectObserver({
				target: this.oSmartManagedObject,
				destroyed: fnObserverDestroyedCalled.bind(null, assert),
				modified: fnObserverModifiedCalled.bind(null, assert)
			});
		},
		afterEach() {
			sandbox.restore();
			this.oManagedObjectObserver.destroy();
			this.oSmartManagedObjectObserver.destroy();
			this.oManagedObject.destroy();
			this.oOtherObject.destroy();
			this.oSmartManagedObject.destroy();
		}
	});

	whenThisHappensThenOneModifiedEventShouldBeFired("when the property of the ManagedObject is modified", function() {
		this.oManagedObject.setMyProperty(true);
	});

	whenThisHappensThenOneModifiedEventShouldBeFired("when the single aggregation is set via mutator", function() {
		this.oManagedObject.setMySingleAggregation(this.oOtherObject);
	});

	whenThisHappensThenOneModifiedEventShouldBeFired("when the single aggregation is set via setAggregation", function() {
		this.oManagedObject.setAggregation("mySingleAggregation", this.oOtherObject);
	});

	whenThisHappensThenOneModifiedEventShouldBeFired("when the multiple aggregation is set via modifier", function() {
		this.oManagedObject.addMyAggregation(this.oOtherObject);
	});

	whenThisHappensThenOneModifiedEventShouldBeFired("when the multiple aggregation is set via addAggregation", function() {
		this.oManagedObject.addAggregation("myAggregation", this.oOtherObject);
	});

	whenThisHappensThenOneModifiedEventShouldBeFired("when the multiple aggregation is set via insertAggregation", function() {
		this.oManagedObject.insertAggregation("myAggregation", this.oOtherObject);
	});

	whenThisHappensThenOneModifiedEventShouldBeFired(
		"when an object in the multiple aggregation is removed via removeAggregation",
		function() {
			this.oManagedObject.removeAggregation("myAggregation", this.oOtherObject);
		}
	);

	whenThisHappensThenOneModifiedEventShouldBeFired(
		"when an object in the multiple aggregation is removed via removeAggregation",
		function() {
			this.oManagedObject.removeMyAggregation(this.oOtherObject);
		}
	);

	whenThisHappensThenOneModifiedEventShouldBeFired("when the multiple aggregation is destroyed via destroyAggregation", function() {
		this.oManagedObject.destroyAggregation("myAggregation");
	});

	whenThisHappensThenOneModifiedEventShouldBeFired("when the multiple aggregation is destroyed via destructor", function() {
		this.oManagedObject.destroyMyAggregation();
	});

	whenThisHappensThenOneModifiedEventShouldBeFired("when the multiple aggregation is emptied via mutator", function() {
		this.oManagedObject.removeAllMyAggregation();
	});

	whenThisHappensThenOneModifiedEventShouldBeFired("when the overwritten aggregation is accessed via add mutator", function() {
		this.oManagedObject.addMyOverwrittenAggregation(this.oOtherObject);
	});

	whenThisHappensThenOneModifiedEventShouldBeFired("when the overwritten aggregation is accessed via insert mutator", function() {
		this.oManagedObject.insertMyOverwrittenAggregation(this.oOtherObject);
	});

	whenThisHappensThenOneModifiedEventShouldBeFired("when the overwritten aggregation is accessed via remove mutator", function() {
		this.oManagedObject.removeMyOverwrittenAggregation(this.oOtherObject);
	});

	whenThisHappensThenOneModifiedEventShouldBeFired("when the overwritten aggregation is emptied via removeAll mutator", function() {
		this.oManagedObject.removeAllMyOverwrittenAggregation(this.oOtherObject);
	});

	whenThisHappensThenOneModifiedEventShouldBeFired("when the overwritten aggregation is destroyed via destructor", function() {
		this.oManagedObject.destroyMyOverwrittenAggregation();
	});

	whenThisHappensThenOneModifiedEventShouldBeFired("when the parent is set", function() {
		this.oManagedObject.setParent(this.oOtherObject);
	});
	whenThisHappensThenOneModifiedEventShouldBeFired("when the single association is set via mutator", function() {
		this.oManagedObject.setMySingleAssociation(this.oOtherObject);
	});

	whenThisHappensThenOneModifiedEventShouldBeFired("when the single association is set via setAssociation", function() {
		this.oManagedObject.setAssociation("mySingleAssociation", this.oOtherObject);
	});

	whenThisHappensThenOneModifiedEventShouldBeFired("when the multiple association is set via modifier", function() {
		this.oManagedObject.addMyAssociation(this.oOtherObject);
	});

	whenThisHappensThenOneModifiedEventShouldBeFired("when the multiple association is set via addAssociation", function() {
		this.oManagedObject.addAssociation("myAssociation", this.oOtherObject);
	});

	whenThisHappensThenOneModifiedEventShouldBeFired(
		"when an object in the multiple association is removed via removeAssociation",
		function() {
			this.oManagedObject.removeAssociation("myAssociation", this.oOtherObject);
		}
	);

	whenThisHappensThenOneModifiedEventShouldBeFired(
		"when an object in the multiple association is removed via removeAssociation",
		function() {
			this.oManagedObject.removeMyAssociation(this.oOtherObject);
		}
	);

	whenThisHappensThenOneModifiedEventShouldBeFired("when the multiple association is emptied via mutator", function() {
		this.oManagedObject.removeAllMyAssociation();
	});

	whenThisHappensThenOneModifiedEventShouldBeFired("when the overwritten Association is accessed via add mutator", function() {
		this.oManagedObject.addMyOverwrittenAssociation(this.oOtherObject);
	});

	whenThisHappensThenOneModifiedEventShouldBeFired("when the overwritten Association is accessed via remove mutator", function() {
		this.oManagedObject.removeMyOverwrittenAssociation(this.oOtherObject);
	});

	whenThisHappensThenOneModifiedEventShouldBeFired("when the overwritten Association is emptied via removeAll mutator", function() {
		this.oManagedObject.removeAllMyOverwrittenAssociation(this.oOtherObject);
	});

	whenThisHappensThenOneModifiedEventShouldBeFired("when the aggregation gets a new aggregation binding", function() {
		this.oManagedObject.bindAggregation("myAggregation", "/", this.oOtherObject);
	});

	whenThisHappensThenOneModifiedEventShouldBeFired("when the aggregation gets unbound from an aggregation binding", function() {
		this.oManagedObject.unbindAggregation("myAggregation", "/", this.oOtherObject);
	});

	function fnObserverModifiedCalled(assert, oEvent) {
		assert.ok(oEvent, 'then a "Modified" event is fired on modifying the target');
	}

	function fnObserverDestroyedCalled(assert, oEvent) {
		assert.ok(oEvent, 'then a "Destroyed" event is fired on destroying the target');
	}

	function whenThisHappensThenOneModifiedEventShouldBeFired(sTestDescription, fnWhen) {
		QUnit.test(sTestDescription, function(assert) {
			assert.expect(1);
			fnWhen.call(this);
		});
	}

	QUnit.test("when the ManagedObject has an aggregation which serves as wrapper for a nested aggregation", function(assert) {
		assert.expect(2);
		this.oSmartManagedObject.insertMyOriginalAggregation();
	});

	QUnit.test("when the ManagedObject is destroyed", function(assert) {
		assert.expect(1);
		this.oManagedObject.destroy();
	});

	QUnit.test("when the element is observed and then unobserved", function(assert) {
		var oOtherManagedObjectObserver = new ManagedObjectObserver();
		assert.strictEqual(oOtherManagedObjectObserver._bIsObserved, undefined, "then _bIsObserved flag does not exist");
		oOtherManagedObjectObserver.setTarget(this.oManagedObject);
		assert.ok(oOtherManagedObjectObserver._bIsObserved, "then _bIsObserved flag is set on setting the target");
		this.oManagedObject.destroy();
		assert.strictEqual(oOtherManagedObjectObserver._bIsObserved, false, "then _bIsObserved flag is unset on destroying the target");
		assert.strictEqual(
			this.oManagedObject.destroy,
			Element.prototype.destroy,
			"then original base functions (like destroy) are set back on destroying the target"
		);
	});

	QUnit.test("when an observed element cannot be found by id and is unobserved", function(assert) {
		var oOtherManagedObjectObserver = new ManagedObjectObserver();
		assert.strictEqual(oOtherManagedObjectObserver._bIsObserved, undefined, "then _bIsObserved flag does not exist");
		oOtherManagedObjectObserver.setTarget(this.oManagedObject);
		assert.ok(oOtherManagedObjectObserver._bIsObserved, "then _bIsObserved flag is set on setting the target");

		sandbox.stub(oOtherManagedObjectObserver, "getTargetInstance")
		.callsFake(function() {
			return;
		});
		this.oManagedObject.destroy();

		assert.strictEqual(oOtherManagedObjectObserver._bIsObserved, false, "then _bIsObserved flag is unset on destroying the target");
		assert.strictEqual(
			this.oManagedObject.destroy,
			Element.prototype.destroy,
			"then original base functions (like destroy) are set back on destroying the target"
		);
	});

	QUnit.test("when the event from setParent action is suppressed", function(assert) {
		assert.expect(3);
		var oSpy = sinon.spy();
		this.oManagedObjectObserver.attachModified(oSpy);
		this.oManagedObject.__bSapUiDtSupressParentChangeEvent = true;
		this.oManagedObject.setParent(this.oOtherObject);
		assert.ok(oSpy.notCalled);
		this.oManagedObject.__bSapUiDtSupressParentChangeEvent = false;
		this.oManagedObject.setParent(null);
		assert.ok(oSpy.calledOnce);
	});

	QUnit.module("Aggregations filtering", {
		beforeEach() {
			this.oManagedObject1 = new TestObject();
			this.oManagedObject2 = new TestObject();
			this.oSpy = sinon.spy();
			this.oManagedObjectObserver = new ManagedObjectObserver({
				target: this.oManagedObject1,
				modified: this.oSpy,
				aggregations: ["myAggregation"]
			});
		},
		afterEach() {
			this.oManagedObjectObserver.destroy();
			this.oManagedObject1.destroy();
			this.oManagedObject2.destroy();
		}
	}, function() {
		QUnit.test("when adding an element into a relevant aggregation", function(assert) {
			this.oManagedObject1.addAggregation("myAggregation", this.oManagedObject2);
			assert.strictEqual(this.oSpy.callCount, 1);
		});
		QUnit.test("when adding an element into a non-relevant aggregation", function(assert) {
			this.oManagedObject1.addAggregation("myInheritedAggregation", this.oManagedObject2);
			assert.strictEqual(this.oSpy.callCount, 0);
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});