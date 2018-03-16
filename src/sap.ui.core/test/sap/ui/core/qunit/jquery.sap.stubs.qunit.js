/* global QUnit */

/*
 * Currently known set of jQuery.sap.* scripts except .stubs itself
 */
var aAllScriptNames = ["act", "dom", "encoder", "events", "global", "history", "keycodes",
	"mobile", "promise", "properties", "resources", "script", "sjax", "storage", "strings",
	"trace", "ui", "unicode", "xml"];

/*
 * @param {boolean} [bOk=true] Determines whether scripts should be loaded
 */
function scriptsLoaded(assert, aScriptNames, bOk) {
	aScriptNames.forEach(function(sScriptName) {
		assert[bOk !== false ? "ok" : "notOk"](sap.ui.require(sScriptName), sScriptName + " loaded");
	});
}

function jquerySapScriptsNotLoaded(assert) {
	scriptsLoaded(assert, aAllScriptNames.map(function(s){return "jquery.sap." + s;}), false);
}

var bBefore = true;
QUnit.module("jquery.sap.stubs", {
	// TODO cleanup QUnitUtils from jQuery.sap.* dependencies!!!
	// beforeEach: function() {
	beforeEach: function(assert) {
		if (bBefore) {
			assert.notOk(window.jQuery && jQuery.sap, "jQuery.sap must not be defined");
			jquerySapScriptsNotLoaded(assert);
			bBefore = false;
		}
	}
});

QUnit.test("AMD module definition", function(assert) {
	var done = assert.async();
	sap.ui.require(["jquery.sap.stubs", "sap/ui/thirdparty/jquery"], function(_jQuery, realjQuery) {
		assert.ok(true, "module required");
		assert.strictEqual(_jQuery, realjQuery, "exports the real jquery");
		jquerySapScriptsNotLoaded(assert);
		done();
	});
});

QUnit.test("stub application", function(assert) {
	var done = assert.async();
	sap.ui.require(["jquery.sap.stubs"], function(_jQuery) {
		assert.ok(jQuery.sap, "jQuery.sap must be defined");
		assert.ok(jQuery.fn, "jQuery.fn must be defined");
		assert.ok(jQuery.Event.prototype, "jQuery.Event.prototype must be defined");
		assert.ok(jQuery.expr[":"], "jQuery.expr[\":\"] must be defined");
		jquerySapScriptsNotLoaded(assert);
		done();
	});
});

QUnit.test("jQuery.sap.* function stub", function(assert) {
	var done = assert.async();
	sap.ui.require(["jquery.sap.stubs"], function(_jQuery) {
		scriptsLoaded(assert, ["jquery.sap.global"], false);
		assert.ok(typeof jQuery.sap.log.error === "function", "jquery.sap.global stub works");
		scriptsLoaded(assert, ["jquery.sap.global"]);
		done();
	});
});

QUnit.test("jQuery.fn function stub", function(assert) {
	var done = assert.async();
	sap.ui.require(["jquery.sap.stubs"], function(_jQuery) {
		scriptsLoaded(assert, ["sap/ui/dom/jquery/control"], false);
		assert.ok(typeof jQuery().control === "function", "jQuery.fn stub works");
		scriptsLoaded(assert, ["sap/ui/dom/jquery/control"]);
		done();
	});
});

QUnit.test("jQuery.Event.prototype function stub", function(assert) {
	var done = assert.async();
	sap.ui.require(["jquery.sap.stubs"], function(_jQuery) {
		scriptsLoaded(assert, ["sap/ui/events/jqueryEvent"], false);
		assert.ok(typeof new jQuery.Event().getPseudoTypes === "function", "jqQuery.Event.prototype stub works");
		scriptsLoaded(assert, ["sap/ui/events/jqueryEvent"]);
		done();
	});
});

QUnit.test("jQuery.expr[\":\"] function stub", function(assert) {
	var done = assert.async();
	sap.ui.require(["jquery.sap.stubs"], function(_jQuery) {
		scriptsLoaded(assert, ["sap/ui/dom/jquery/Selectors"], false);
		jQuery(":focusable"); // should not raise an exception
		assert.ok(typeof jQuery.expr[":"].focusable === "function", "jQuery selector stub works");
		scriptsLoaded(assert, ["sap/ui/dom/jquery/Selectors"]);
		done();
	});
});

QUnit.test("concurrent usage of require and stub", function(assert) {
	var done = assert.async();
	sap.ui.require(["jquery.sap.stubs"], function(_jQuery) {
		scriptsLoaded(assert, ["sap/ui/dom/jquery/zIndex"], false);
		sap.ui.require(["sap/ui/dom/jquery/zIndex"], function() {
			assert.ok(_jQuery.fn.zIndex, "module loaded");
			done();
		});
		assert.ok(_jQuery().zIndex, "property is available");
	});
});
