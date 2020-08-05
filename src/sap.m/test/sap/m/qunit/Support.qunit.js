/*global sinon */
/*global QUnit */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/m/Support",
	"sap/m/library"
], function(createAndAppendDiv, Support, mobileLibrary) {
	// shortcut for sap.m.DialogType
	var DialogType = mobileLibrary.DialogType;

	createAndAppendDiv("content");



	var sSupportTitle = "Technical Information";


	QUnit.module("Open API", {
		beforeEach: function() {
			// due to async loading, using sinon.clock.tick() no longer works for waiting on module loading
			sinon.config.useFakeTimers = false;
		},
		afterEach: function() {
			sinon.config.useFakeTimers = true;
		}
	});

	QUnit.test("Test main control functionality", function(assert) {
		mobileLibrary.Support.open();
		var done = assert.async();

		setTimeout(function() {
			var oSupport = sap.ui.getCore().byId("__dialog0");
			assert.ok(oSupport, "Support dialog should be created");
			assert.equal(oSupport.isOpen(), true, "Support dialog should be open now");
			assert.equal(oSupport.getType(), DialogType.Standard , "Support dialog should have type Standard");
			assert.equal(oSupport.getButtons().length, 1, "1 Close button is added to Support dialog");
			assert.equal(oSupport.getTitle(), sSupportTitle, "Title is OK");

			oSupport.destroy();
			done();
		}, 1000);
	});

	QUnit.module("On and Off API");
	QUnit.test("Register/Unregister event", function(assert) {

		var sEventName = "ontouchstart";
		document[sEventName] = "alabala";
		var oSupport = mobileLibrary.Support.on();
		this.clock.tick(500);

		assert.ok(oSupport, "Support dialog event should be registered already");
		assert.equal(oSupport.isEventRegistered(), true, "Support dialog event should be registered already");

		oSupport = mobileLibrary.Support.off();

		assert.ok(oSupport, "Support dialog event should be unregistered now");
		assert.equal(oSupport.isEventRegistered(), false, "Support dialog event should be unregistered already");

		delete document[sEventName];
	});
});