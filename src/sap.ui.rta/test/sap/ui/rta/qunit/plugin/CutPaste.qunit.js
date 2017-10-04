/* global QUnit sinon*/

QUnit.config.autostart = false;

sap.ui.require([
	'sap/ui/rta/plugin/CutPaste',
	'sap/ui/rta/command/CommandFactory'
],
function(
	CutPastePlugin,
	CommandFactory
) {
	'use strict';
	QUnit.start();

	var sandbox = sinon.sandbox.create();

	QUnit.module('CutPaste Plugin Tests', {
		beforeEach: function(assert) {
			this.CutPastePlugin = new CutPastePlugin({
				commandFactory : new CommandFactory()
			});
		},

		afterEach: function() {
			sandbox.restore();
		}
	});

	QUnit.test('When retrieving the context menu items', function(assert) {
		sandbox.stub(this.CutPastePlugin, "getDesignTime").returns({
			getSelection : function(){
				return ['selection'];
			}
		});

		var bIsAvailable = true;

		//Cut
		sandbox.stub(this.CutPastePlugin, "cut", function(oOverlay){
			assert.equal(oOverlay, "dummyOverlay", "the 'cut' method is called with the right overlay");
		});
		sandbox.stub(this.CutPastePlugin, "isAvailable", function(oOverlay){
			assert.equal(oOverlay, "dummyOverlay", "the 'available' function calls isAvailable with the correct overlay");
			return bIsAvailable;
		});

		//Paste
		sandbox.stub(this.CutPastePlugin, "paste", function(oOverlay){
			assert.equal(oOverlay, "dummyOverlay", "the 'cut' method is called with the right overlay");
		});
		sandbox.stub(this.CutPastePlugin, "isElementPasteable", function(oOverlay){
			assert.equal(oOverlay, "dummyOverlay", "the 'enabled' function calls isElementPasteable with the correct overlay");
		});

		var aMenuItems = this.CutPastePlugin.getMenuItems("dummyOverlay");
		assert.equal(aMenuItems[0].id, "CTX_CUT", "'getMenuItems' returns a context menu item for 'cut'");
		aMenuItems[0].handler(["dummyOverlay"]);
		assert.equal(aMenuItems[0].enabled(), true, "the 'enabled' function returns true for single selection");

		assert.equal(aMenuItems[1].id, "CTX_PASTE", "'getMenuItems' returns a context menu item for 'paste'");
		aMenuItems[1].handler(["dummyOverlay"]);
		aMenuItems[1].enabled("dummyOverlay");

		bIsAvailable = false;
		assert.equal(this.CutPastePlugin.getMenuItems("dummyOverlay").length,
			0,
			"and if plugin is not available for the overlay, no menu items are returned");
	});

});
