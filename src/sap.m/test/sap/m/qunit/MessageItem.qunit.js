/*global QUnit */
sap.ui.define(
	["sap/m/MessageItem", "sap/ui/core/message/MessageType"],
	function(MessageItem, MessageType) {
		"use strict";


		QUnit.module("MessageItem Public API", {
			beforeEach: function() {
				this.oMessageItem = new MessageItem();
			}, afterEach: function() {
				this.oMessageItem.destroy();
			}
		});

		QUnit.test("setType() should set the correct type to the item", function(assert) {
			this.oMessageItem.setType(MessageType.Error);
			assert.strictEqual(this.oMessageItem.getType(), "Error", "Error type should be set");
			this.oMessageItem.setType(MessageType.Warning);
			assert.strictEqual(this.oMessageItem.getType(), "Warning", "Warning type should be set");
			this.oMessageItem.setType(MessageType.Success);
			assert.strictEqual(this.oMessageItem.getType(), "Success", "Success type should be set");
			this.oMessageItem.setType(MessageType.Information);
			assert.strictEqual(this.oMessageItem.getType(), "Information", "Information type should be set");
			this.oMessageItem.setType(MessageType.None);
			assert.strictEqual(this.oMessageItem.getType(), "Information", "Information type should be set, None is not supported");
		});
	}
);