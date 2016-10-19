jQuery.sap.require("sap.ui.qunit.qunit-coverage");

jQuery.sap.require("sap.ui.fl.context.SwitchContextProvider");
jQuery.sap.require("sap.ui.fl.Cache");

(function(SwitchContextProvider, Cache) {

	sinon.config.useFakeTimers = false;

	var sandbox = sinon.sandbox.create();

	QUnit.module("Given an instance of the SwitchContextProvider", {
		beforeEach : function() {
			this.oSwitchContextProvider = new SwitchContextProvider();
		},
		afterEach : function() {
			sandbox.restore();
		}
	});

	QUnit.test("when calling loadData", function(assert) {
	    	var mSwitches = {"bFunction1": true, "bFunction2": true};
		this.stub(Cache, "getSwitches").returns(mSwitches);
		return this.oSwitchContextProvider.loadData().then(function(mValue) {
		    	var mValueExp = {};
		    	mValueExp["bFunction1"] = true;
		    	mValueExp["bFunction2"] = true;
			assert.deepEqual(mValue, mValueExp, " then a map with the switched-on business functions as keys is returned");
		});
	})

	QUnit.test("when calling getValueHelp", function(assert) {
		return this.oSwitchContextProvider.getValueHelp().then(function(mValue) {
		    var mValueExp = {};
		    assert.deepEqual(mValue, mValueExp, " then an empty object is returned");
		});
	});

	QUnit.test("when calling validate for a key - value pair", function(assert) {
		return this.oSwitchContextProvider.validate("key", "value").then(function(bValue) {
			assert.equal(bValue, true, " then true is returned");
		});
	});

}(sap.ui.fl.context.SwitchContextProvider, sap.ui.fl.Cache));
