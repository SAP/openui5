/*global QUnit */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/core/Core",
	"sap/ui/webc/main/MultiInput",
	"sap/ui/webc/main/Icon",
	"sap/ui/webc/main/SuggestionGroupItem",
	"sap/ui/webc/main/SuggestionItem",
	"sap/ui/webc/main/Token",
	"sap/ui/webc/main/Button"
], function(createAndAppendDiv, Core, MultiInput, Icon, SuggestionGroupItem, SuggestionItem, Token, Button) {
	"use strict";

	createAndAppendDiv("uiArea");

	QUnit.module("Rendering");

	QUnit.test("Should render", function(assert) {
		assert.ok(true, "This test has been temporarily disabled");
	});
});
