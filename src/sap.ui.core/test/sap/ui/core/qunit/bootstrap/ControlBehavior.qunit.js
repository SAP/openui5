/*global QUnit, sinon */
sap.ui.define([
    "sap/base/config",
    "sap/base/config/GlobalConfigurationProvider",
    "sap/ui/core/AnimationMode",
    "sap/ui/core/ControlBehavior"
], (
    BaseConfig,
    GlobalConfigurationProvider,
    AnimationMode,
    ControlBehavior
) => {
	"use strict";

    function getHtmlAttribute(sAttribute) {
		return document.documentElement.getAttribute(sAttribute);
	}

    QUnit.module("AnimationMode initial setting evaluation", {
		beforeEach: function() {
			this.mParams = {};
			BaseConfig._.invalidate();
			this.oGlobalConfigStub = sinon.stub(GlobalConfigurationProvider, "get");
			this.oGlobalConfigStub.callsFake(function(sKey) {
				if (this.mParams[sKey] !== undefined) {
					return this.mParams[sKey];
				} else {
					return this.oGlobalConfigStub.wrappedMethod.call(this, sKey);
				}
			}.bind(this));
			this.oBaseStub = sinon.stub(BaseConfig, "get");
			this.oBaseStub.callsFake(function(mParameters) {
				mParameters.provider = undefined;
				return this.oBaseStub.wrappedMethod.call(this, mParameters);
			}.bind(this));
		},
		afterEach: function() {
			this.oGlobalConfigStub.restore();
			this.oBaseStub.restore();
		}
	});

	QUnit.test("Invalid animation mode", function(assert) {
		this.mParams.sapUiAnimationMode = "someuUnsupportedStringValue";
		assert.throws(
			function() { ControlBehavior.getAnimationMode(); },
			new TypeError("Unsupported Enumeration value for sapUiAnimationMode, valid values are: full, basic, minimal, none"),
			"Unsupported value for animation mode should throw an error."
		);
	});

	QUnit.test("Valid animation modes from enumeration", function(assert) {
		for (var sAnimationModeKey in AnimationMode) {
			if (AnimationMode.hasOwnProperty(sAnimationModeKey)) {
				BaseConfig._.invalidate();
				var sAnimationMode = AnimationMode[sAnimationModeKey];
				this.mParams.sapUiAnimationMode = sAnimationMode;
				assert.equal(ControlBehavior.getAnimationMode(), sAnimationMode, "Test for animation mode: " + sAnimationMode);
			}
		}
	});

	QUnit.module("AnimationMode changes at runtime", {
		beforeEach: function() {
			// Restore default animation mode
			ControlBehavior.setAnimationMode(AnimationMode.full);
		},
		afterEach: function() {
			ControlBehavior.setAnimationMode(AnimationMode.minimal);
		}
	});

	QUnit.test("Set animation mode to a valid value", function(assert) {
		const changeHandler = function (oEvent) {
			assert.strictEqual(oEvent.animationMode, AnimationMode.basic, "'change' event was executed with the correct event parameters.");
		};
		assert.equal(ControlBehavior.getAnimationMode(), AnimationMode.full, "Default animation mode is " + AnimationMode.full + ".");
		assert.equal(getHtmlAttribute("data-sap-ui-animation-mode"), AnimationMode.full);

		ControlBehavior.attachChange(changeHandler);
		ControlBehavior.setAnimationMode(AnimationMode.basic);
		assert.equal(ControlBehavior.getAnimationMode(), AnimationMode.basic, "Animation mode should switch to " + AnimationMode.basic + ".");
		assert.equal(getHtmlAttribute("data-sap-ui-animation-mode"), AnimationMode.basic);
		ControlBehavior.detachChange(changeHandler);
	});

	QUnit.test("Set animation mode to " + AnimationMode.none + " to turn animation off", function(assert) {
		// Check if default values are set
		assert.equal(ControlBehavior.getAnimationMode(), AnimationMode.full, "Default animation mode is " + AnimationMode.full + ".");
		assert.equal(getHtmlAttribute("data-sap-ui-animation-mode"), AnimationMode.full, "Default animation mode should be injected as attribute.");
		/**
		 * @deprecated As of version 1.50.0, replaced by {@link sap.ui.core.Configuration#getAnimationMode}
		 */
		assert.equal(getHtmlAttribute("data-sap-ui-animation"), "on", "Default animation should be injected as attribute.");

		// Change animation mode
		ControlBehavior.setAnimationMode(AnimationMode.none);
		assert.equal(ControlBehavior.getAnimationMode(), AnimationMode.none, "Animation mode should switch to " + AnimationMode.none + ".");
		assert.equal(getHtmlAttribute("data-sap-ui-animation-mode"), AnimationMode.none, "Animation mode should be injected as attribute.");
		/**
		 * @deprecated As of version 1.50.0, replaced by {@link sap.ui.core.Configuration#getAnimationMode}
		 */
		assert.equal(getHtmlAttribute("data-sap-ui-animation"), "off", "Animation should be turned off.");
	});

	QUnit.test("Invalid animation mode", function(assert) {
		assert.throws(
			function() { ControlBehavior.setAnimationMode("someUnsupportedStringValue"); },
			new TypeError("Unsupported Enumeration value for animationMode, valid values are: full, basic, minimal, none"),
			"Unsupported value for animation mode should throw an error."
		);

		assert.equal(getHtmlAttribute("data-sap-ui-animation-mode"), AnimationMode.full, "Default animation mode should stay the same.");
	});
});
