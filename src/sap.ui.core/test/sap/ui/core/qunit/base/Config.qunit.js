/*!
 * ${copyright}
 */
/*global QUnit */
QUnit.config.autostart = false;

sap.ui.require([
	"sap/base/config",
	"sap/base/Log",
	"sap/ui/thirdparty/sinon"
], function (
	BaseConfiguration,
	Log,
	sinon
) {
	"use strict";
	var oLog = Log.getLogger("test", 6);
	var oLogSpy = sinon.spy(oLog, "error");
	sap.ui.loader._.logger = oLog;

	QUnit.module("Base Configuration");

	QUnit.test("Basic: Check getter on provider level", function(assert) {
		assert.expect(20);

		// sContext is derived via URL parameter to handle provider specific behavior
		var sContext = BaseConfiguration.get({
			name: "sapUiContext",
			type: BaseConfiguration.Type.String,
			external: true
		});

		[
			{ duplicateParam: "sap-ui-FooBar", origParam: "sap-ui-fooBar"},
			{ duplicateParam: "sap-ui-foo-bar", origParam: "sap-ui-fooBar"},
			{ duplicateParam: "sap-ui-sapUiFooBar", origParam: "sap-ui-sap-ui-fooBar"},
			{ duplicateParam: "sap-ui-initial-falsy-value", origParam: "sap-ui-initialFalsyValue"}
		].forEach(function (oParams) {
			var sDuplicateKey = sContext.startsWith("global") ? oParams.duplicateParam.replace("sap-ui-", "") : oParams.duplicateParam;
			var sOrigKey = sContext.startsWith("global") ? oParams.origParam.replace("sap-ui-", "") : oParams.origParam;
			assert.ok(oLogSpy.calledWith("Configuration option '" + sDuplicateKey + "' was already set by '" + sOrigKey + "' and will be ignored!"), "Logged invalid configuration option '" + sDuplicateKey + "'");
		});

		["sap-ui-sap/foo/bar"].forEach(function (sInvalidKey) {
			sInvalidKey = sContext.startsWith("global") ? sInvalidKey.replace("sap-ui-", "") : sInvalidKey;
			assert.ok(oLogSpy.calledWith("Invalid configuration option '" + sInvalidKey + "' in " + sContext + "!"), "Logged invalid configuration option '" + sInvalidKey + "'");
		});

		assert.strictEqual(BaseConfiguration.get({
			name: "sapUiHubelDubel",
			type: BaseConfiguration.Type.String,
			external: true
		}), "value1", "BaseConfiguration.get for param 'sapUiHubelDubel' returns value 'value1'");
		assert.strictEqual(BaseConfiguration.get({
			name: "sapUiHubeldubel",
			type: BaseConfiguration.Type.String,
			external: true
		}), "value2", "BaseConfiguration.get for param 'sapUiHubeldubel' returns value 'value2'");
		assert.strictEqual(BaseConfiguration.get({
			name: "sapUihubeldubel",
			type: BaseConfiguration.Type.String,
			external: true
		}), "", "BaseConfiguration.get for param 'sapUihubeldubel' returns internal default value ''");
		assert.strictEqual(BaseConfiguration.get({
			name: "sapUiFooBar",
			type: BaseConfiguration.Type.String,
			external: true
		}), "value3", "BaseConfiguration.get for param 'sapUiFooBar' returns correct value 'value3'");
		assert.strictEqual(BaseConfiguration.get({
			name: "sapUiFoobar",
			type: BaseConfiguration.Type.String,
			external: true
		}), "value5", "BaseConfiguration.get for param 'sapUiFoobar' returns correct value 'value5'");
		assert.strictEqual(
		BaseConfiguration.get({
			name: "sapUi5ooBar",
			type: BaseConfiguration.Type.String,
			external: true
		}), "value7", "BaseConfiguration.get for param 'sapUi5ooBar' returns correct value 'value7'");
		assert.throws(function () {
			BaseConfiguration.get({
				name: "sapUiSap-ui-fooBar",
				type: BaseConfiguration.Type.String,
				external: true
			});
		}, new TypeError("Invalid configuration key 'sapUiSap-ui-fooBar'!"), "BaseConfiguration.get for param 'sapUiSap-ui-fooBar' throws error");
		assert.strictEqual(BaseConfiguration.get({
			name: "sapUiSapUiFooBar",
			type: BaseConfiguration.Type.String,
			external: true
		}), "value8", "BaseConfiguration.get for param 'sapUiSapUiFooBar' returns correct value 'value8'");
		assert.throws(function () {
			BaseConfiguration.get({
				name: "sapUiSap.foo.bar",
				type: BaseConfiguration.Type.String,
				external: true
			});
		}, new TypeError("Invalid configuration key 'sapUiSap.foo.bar'!"), "BaseConfiguration.get for param 'sapUiSap.foo.bar' throws error");
		assert.strictEqual(BaseConfiguration.get({
			name: "sapUiXxBarFoo",
			type: BaseConfiguration.Type.String,
			external: true
		}), "value11", "BaseConfiguration.get for param 'sapUiXxBarFoo' returns correct value 'value11'");
		assert.strictEqual(BaseConfiguration.get({
			name: "sapUiBarFoo",
			type: BaseConfiguration.Type.String,
			external: true
		}), "value11", "BaseConfiguration.get for param 'sapUiBarFoo' returns correct value 'value11'");
		assert.strictEqual(BaseConfiguration.get({
			name: "sapUiXxFarBoo",
			type: BaseConfiguration.Type.String,
			external: true
		}), "value12", "BaseConfiguration.get for param 'sapUiXxFarBoo' returns correct value 'value12'");
		assert.strictEqual(BaseConfiguration.get({
			name: "sapUiFarBoo",
			type: BaseConfiguration.Type.String,
			external: true
		}), "value12", "BaseConfiguration.get for param 'sapUiFarBoo' returns correct value 'value12'");
		assert.strictEqual(BaseConfiguration.get({
			name: "sapUshellFooBar",
			type: BaseConfiguration.Type.String,
			external: true
			// sContext is derived via URL parameter to handle provider specific behavior
		}), sContext.startsWith("global") ? "" : "value14", "BaseConfiguration.get for param 'sapUshellFooBar' returns correct value 'value14' or '' in global context (sap-ui-prefixed)");
		assert.strictEqual(BaseConfiguration.get({
			name: "sapUiInitialFalsyValue",
			type: BaseConfiguration.Type.Boolean,
			external: true
		}), false, "BaseConfiguration.get for param 'sapUiInitialFalsyValue' returns correct value 'false'");
	});

	QUnit.start();
});
