sap.ui.define([
	"sap/ui/thirdparty/jquery"
], function (jQuery) {
	"use strict";

	return {
		titles: {
			MY_SELECTION_TITLE: "My Selection",
			SYSTEM_ACCESSIBILITY_TITLE: "Accessibility",
			SYSTEM_ACCESSIBILITY_COUNT: 5,
			EXAMPLE_PRESET_1: "TestPreset1.json",
			EXAMPLE_PRESET_S4HANA: "S4HanaPreset.json",
			PRESETS_GROUP_SYSTEM: "System Presets",
			PRESETS_GROUP_CUSTOM: "Custom Presets"
		},
		loadExamplePreset: function (fileName) {
			var preset = jQuery.sap.syncGetJSON("test-resources/sap/ui/support/integration/ui/data/Presets/" + fileName).data;

			// prepare title if modified, used for testing
			preset._forTestTitleIfModified = this.getModifiedPresetTitle(preset.title);

			// prepare a list of rules ids, very handy later
			preset._forTestRulesIds = preset.selections.map(function (oRule) {
				return oRule.ruleId;
			});

			return preset;
		},
		getModifiedPresetTitle: function (sTitle) {
			return "<em>" + sTitle + " *" + "</em>";
		}
	};
});
