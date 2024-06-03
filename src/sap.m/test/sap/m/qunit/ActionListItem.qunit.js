/*global QUnit */
sap.ui.define([
	"sap/m/ActionListItem",
	"sap/m/List",
	"sap/ui/events/KeyCodes",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/thirdparty/jquery"
], function(ActionListItem, List, KeyCodes, qutils, nextUIUpdate, jQuery) {
	"use strict";

	async function timeout(iDuration) {
		await new Promise(function(resolve) {
			window.setTimeout(resolve, iDuration);
		});
	}

	async function setup(sListItemId, oMetadata) {
		const oList = new List({
			items : [ new ActionListItem(sListItemId, oMetadata) ]
		});
		oList.placeAt("qunit-fixture");
		await nextUIUpdate();

		return oList;
	}

	function testSelection(data) {
		const sListMode = data.mode;
		const bIncludeItemInSelection = data.includeItemInSelection;
		const sKey = data.key;

		const testTitle = "Selection on key=" + sKey + ", includeItemInSelection=" + bIncludeItemInSelection + ", mode=" + sListMode;

		QUnit.test(testTitle, async function(assert) {
			const oSpy = this.oSpy;
			const oList = this.oList;

			oList.setMode(sListMode);
			oList.setIncludeItemInSelection(bIncludeItemInSelection);
			await nextUIUpdate();

			qutils.triggerKeydown("item1", KeyCodes.SPACE);
			await timeout();

			assert.strictEqual(oSpy.callCount, 1, "Event 'press' should be fired");
			assert.ok(!oList.getItems()[0].getSelected(), "never selected");
		});
	}

	QUnit.module("Events", {
		beforeEach: async function() {
			this.oSpy = this.spy();
			this.oList = await setup("item1", {
				text : "Action1",
				press : this.oSpy
			});
		},
		afterEach: function() {
			this.oList?.destroy();
		}
	});

	QUnit.test("tap", async function(assert) {
		const oSpy = this.oSpy;

		jQuery("#item1").trigger("tap");
		await timeout();

		assert.strictEqual(oSpy.callCount, 1, "Event 'press' should have been fired");
	});

	QUnit.test("Press event on [ENTER]", async function(assert) {
		const oSpy = this.oSpy;

		qutils.triggerKeydown("item1", KeyCodes.ENTER);
		await timeout();

		assert.strictEqual(oSpy.callCount, 1, "Event 'press' should have been fired");
	});

	QUnit.test("Press event on [SPACE]", async function(assert) {
		const oSpy = this.oSpy;

		qutils.triggerKeydown("item1", KeyCodes.SPACE);
		await timeout();

		assert.strictEqual(oSpy.callCount, 1, "Event 'press' should have been fired");
	});

	/* should never be selected */
	testSelection({
		mode : "SingleSelectMaster",
		includeItemInSelection : false,
		key : KeyCodes.ENTER
	});
	testSelection({
		mode : "SingleSelectMaster",
		includeItemInSelection : false,
		key : KeyCodes.SPACE
	});
	testSelection({
		mode : "MultiSelect",
		includeItemInSelection : true,
		key : KeyCodes.ENTER
	});
	testSelection({
		mode : "MultiSelect",
		includeItemInSelection : true,
		key : KeyCodes.SPACE
	});
	testSelection({
		mode : "SingleSelect",
		includeItemInSelection : true,
		key : KeyCodes.ENTER
	});
	testSelection({
		mode : "SingleSelect",
		includeItemInSelection : true,
		key : KeyCodes.SPACE
	});
	testSelection({
		mode : "SingleSelectLeft",
		includeItemInSelection : true,
		key : KeyCodes.ENTER
	});
	testSelection({
		mode : "SingleSelectLeft",
		includeItemInSelection : true,
		key : KeyCodes.SPACE
	});
});