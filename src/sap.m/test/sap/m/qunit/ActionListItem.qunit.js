/*global QUnit, jQuery */
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/events/KeyCodes",
	"sap/m/List",
	"sap/m/ActionListItem"
], function(qutils, KeyCodes, List, ActionListItem) {
	"use strict";



	var setup = function(sListItemId, oMetadata) {
		var oList = new List({
			items : [ new ActionListItem(sListItemId, oMetadata) ]
		});
		oList.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();
		return oList;
	};

	var testSelection = function(data) {
		var sListMode = data.mode;
		var bIncludeItemInSelection = data.includeItemInSelection;
		var sKey = data.key;

		var testTitle = "Selection on key=" + sKey + ", includeItemInSelection=" + bIncludeItemInSelection + ", mode=" + sListMode;

		QUnit.test(testTitle, function(assert) {
			var oSpy = this.spy();
			var oList = new List("list1", {
				items : [ new ActionListItem("item1", {
					text : "Action1",
					press : oSpy
				}) ],
				mode : sListMode,
				includeItemInSelection : bIncludeItemInSelection
			});
			oList.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			qutils.triggerKeyboardEvent("item1", KeyCodes.SPACE);

			this.clock.tick(50);

			assert.strictEqual(oSpy.callCount, 1, "Event 'press' should be fired");
			assert.ok(!oList.getItems()[0].getSelected(), "never selected");
			oList.destroy();// Clean up
		});
	};


	QUnit.module("Events");

	QUnit.test("tap", function(assert) {

		var oSpy = this.spy();

		var oList = setup("item1", {
			text : "Action1",
			press : oSpy
		});

		jQuery("#item1").trigger('tap');

		this.clock.tick(50);

		assert.strictEqual(oSpy.callCount, 1, "Event 'press' should have been fired");
		oList.destroy();// Clean up
	});

	QUnit.test("Press event on [ENTER]", function(assert) {

		var oSpy = this.spy();

		var oList = setup("item1", {
			text : "Action1",
			press : oSpy
		});

		qutils.triggerKeyboardEvent("item1", KeyCodes.ENTER);

		this.clock.tick(50);

		assert.strictEqual(oSpy.callCount, 1, "Event 'press' should have been fired");
		oList.destroy();// Clean up
	});

	QUnit.test("Press event on [SPACE]", function(assert) {

		var oSpy = this.spy();

		var oList = setup("item1", {
			text : "Action1",
			press : oSpy
		});

		qutils.triggerKeyboardEvent("item1", KeyCodes.SPACE);

		this.clock.tick(50);

		assert.strictEqual(oSpy.callCount, 1, "Event 'press' should have been fired");
		oList.destroy();// Clean up
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