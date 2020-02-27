/*global QUnit*/

sap.ui.define([
	"sap/ui/fl/StandardVariant",
	"sap/ui/fl/Change",
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/thirdparty/jquery"
], function(
	StandardVariant,
	Change,
	sinon,
	jQuery
) {
	"use strict";

	QUnit.module("sap.ui.fl.StandardVariant", {
		beforeEach: function() {
			this.oStandardVariant = new StandardVariant.constructor();
		},
		afterEach: function() {
		}
	});

	QUnit.test("getExecuteOnSelect - happy path", function(assert) {
		var expectedFlag = true;

		var oChanges = {
			xyz: new Change({
				changeType: 'standardVariant',
				content: {
					executeOnSelect: expectedFlag
				},
				fileType: 'change',
				namespace: 'localchange'
			})
		};

		assert.strictEqual(this.oStandardVariant.getExecuteOnSelect(oChanges), expectedFlag);
	});

	QUnit.test("getExecuteOnSelect - GIVEN multiple standardVariant changes WHEN getting the id THEN the id of the newest change should be returned and the rest deleted", function(assert) {
		var expectedFlag = true;
		var otherExpectedFlag = false;

		var mChanges = {
			firstChange: new Change({
				changeType: 'standardVariant',
				content: {
					executeOnSelect: otherExpectedFlag
				},
				fileType: 'change',
				creation: new Date("2014-10-27T13:58:16.783Z").toISOString(),
				namespace: 'localchange'
			}),
			secondChange: new Change({
				changeType: 'standardVariant',
				content: {
					executeOnSelect: expectedFlag
				},
				creation: new Date("2014-10-27T14:58:16.783Z").toISOString(),
				fileType: 'change',
				namespace: 'localchange'
			})
		};

		assert.strictEqual(this.oStandardVariant.getExecuteOnSelect(mChanges), expectedFlag);
		assert.strictEqual(mChanges.firstChange.getPendingAction(), 'DELETE');
	});

	QUnit.test("getExecuteOnSelect - GIVEN multiple standardVariant changes, one with an empty string as creation WHEN getting the id THEN the id of the change with empty string as creation should be returned", function(assert) {
		var expectedFlag = true;
		var otherExpectedFlag = false;

		var oChanges = {
			firstChange: new Change({
				changeType: 'standardVariant',
				content: {
					executeOnSelect: otherExpectedFlag
				},
				fileType: 'change',
				creation: new Date("2014-10-27T13:58:16.783Z").toISOString(),
				namespace: 'localchange'
			}),
			secondChange: new Change({
				changeType: 'standardVariant',
				content: {
					executeOnSelect: expectedFlag
				},
				creation: "",
				fileType: 'change',
				namespace: 'localchange'
			})
		};

		assert.strictEqual(this.oStandardVariant.getExecuteOnSelect(oChanges), expectedFlag);
	});

	QUnit.test("getExecuteOnSelect - shall return null if there are no standardVariant changes", function(assert) {
		var oChanges = {};

		new Array(5).forEach(function(index) {
			oChanges[index] = new Change({
				changeType: 'hubbabubba',
				fileType: 'change'
			});
		});

		assert.strictEqual(this.oStandardVariant.getExecuteOnSelect(oChanges), null);
	});

	QUnit.test("createChangeFile shall return a new change", function(assert) {
		var mParameterBag;
		var oChangeContent;
		mParameterBag = {executeOnSelect: true, reference: "ribukombu"};

		oChangeContent = this.oStandardVariant._createChangeFile(mParameterBag);

		assert.equal(oChangeContent.content.executeOnSelect, true);
	});

	QUnit.test("createChangeFile shall write the component name into the change file", function(assert) {
		var mParameterBag;
		var oChangeContent;
		mParameterBag = {reference: "ribukombu"};

		oChangeContent = this.oStandardVariant._createChangeFile(mParameterBag);
		assert.equal(oChangeContent.reference, "ribukombu");
	});

	QUnit.test("createChangeObject with all possible standard variant change specific options", function(assert) {
		var mParameterBag = {
			reference: "Glennkadiko",
			componentName: "Glennkadiko",
			executeOnSelect: true,
			selector: {
				stableId: "Galustika"
			}
		};

		//Call CUT
		var oChange = this.oStandardVariant.createChangeObject(mParameterBag);

		assert.ok(oChange);
		assert.ok(oChange instanceof Change);
		assert.equal(oChange.getContent().executeOnSelect, true);
		assert.equal(oChange.getComponent(), "Glennkadiko");
		assert.equal(oChange.getChangeType(), 'standardVariant');
		assert.equal(oChange.getSelector(), mParameterBag.selector);
		assert.equal(oChange.getLayer(), 'USER');
	});

	QUnit.test('getStandardVariantChanges should return all standard variant changes', function(assert) {
		var mChanges = {
			someChange: {
				getChangeType: sinon.stub().returns('some')
			},
			standardtVariantChange1: {
				getChangeType: sinon.stub().returns('standardVariant')
			},
			someChange2: {
				getChangeType: sinon.stub().returns('some')
			},
			standardVariantChange2: {
				getChangeType: sinon.stub().returns('standardVariant')
			},
			someChange3: {
				getChangeType: sinon.stub().returns('some')
			}
		};

		var aChanges = this.oStandardVariant.getStandardVariantChanges(mChanges);

		assert.strictEqual(aChanges.length, 2);
		assert.strictEqual(aChanges.some(function(oChange) {
			return oChange === mChanges.standardtVariantChange1;
		}), true);
		assert.strictEqual(aChanges.some(function(oChange) {
			return oChange === mChanges.standardVariantChange2;
		}), true);
	});

	QUnit.test('updateStandardVariantChange shall return the updated change if a standard variant change has been found and updated', function(assert) {
		var notExpectedExecuteOnSelect = false;
		var newExecuteOnSelect = true;

		var mChanges = {
			firstChange: new Change({
				changeType: 'standardVariant',
				content: {
					executeOnSelect: notExpectedExecuteOnSelect
				},
				fileType: 'change',
				creation: new Date("2014-10-27T13:58:16.783Z").toISOString(),
				namespace: 'localchange'
			})
		};
		mChanges.firstChange.setState(Change.states.PERSISTED);

		var oUpdatedChange = this.oStandardVariant.updateExecuteOnSelect(mChanges, newExecuteOnSelect);

		assert.strictEqual(oUpdatedChange, mChanges.firstChange);
		assert.strictEqual(mChanges.firstChange.getContent().executeOnSelect, newExecuteOnSelect);
		assert.equal(mChanges.firstChange.getState(), Change.states.DIRTY);
	});

	QUnit.test('updateStandardVariantChange shall return undefined if no standard variant change has been found', function(assert) {
		var newExecuteOnSelect = true;

		var mChanges = {};

		var changeUpdated = this.oStandardVariant.updateExecuteOnSelect(mChanges, newExecuteOnSelect);

		assert.strictEqual(changeUpdated, undefined);
	});

	QUnit.test('updateStandardVariantChange shall delete older standard variant changes, if multiple have been found', function(assert) {
		var notExpectedExecuteOnSelect = false;
		var newExecuteOnSelect = true;

		var mChanges = {
			firstChange: new Change({
				changeType: 'standardVariant',
				content: {
					executeOnSelect: notExpectedExecuteOnSelect
				},
				fileType: 'change',
				creation: new Date("2014-10-27T13:58:16.783Z").toISOString(),
				namespace: 'localchange'
			}),
			secondChange: new Change({
				changeType: 'standardVariant',
				content: {
					executeOnSelect: newExecuteOnSelect
				},
				creation: "",
				fileType: 'change',
				namespace: 'localchange'
			})
		};

		this.oStandardVariant.updateExecuteOnSelect(mChanges, newExecuteOnSelect);

		assert.strictEqual(mChanges.firstChange.getPendingAction(), 'DELETE');
	});

	QUnit.done(function () {
		jQuery('#qunit-fixture').hide();
	});
});