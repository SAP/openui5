//************************************************************************
// Test Code
//************************************************************************

sap.ui.test.qunit.delayTestStart(500);


QUnit.module("Initialization", {
	setup: function() {
		createTables();
	},
	teardown: function () {
		destroyTables();
	}
});

QUnit.test("init()", function(assert) {
	var oExtension = oTable._getScrollExtension();
	assert.ok(!!oExtension, "Scroll Extension available");

	var iCount = 0;
	for (var i = 0; i < oTable.aDelegates.length; i++) {
		if (oTable.aDelegates[i].oDelegate === oExtension._delegate) {
			iCount++;
		}
	}
	assert.ok(iCount == 1, "Scroll Delegate registered");
});


QUnit.module("Destruction", {
	setup: function() {
		createTables();
	},
	teardown: function () {
		oTable = null;
		oTreeTable.destroy();
		oTreeTable = null;
	}
});


QUnit.test("destroy()", function(assert) {
	var oExtension = oTable._getScrollExtension();
	oTable.destroy();
	assert.ok(!oExtension.getTable(), "Table cleared");
	assert.ok(!oExtension._delegate, "Delegate cleared");
});