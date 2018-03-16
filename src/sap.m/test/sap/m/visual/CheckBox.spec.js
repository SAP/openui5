/*global describe,it,element,by,takeScreenshot,expect*/

describe("sap.m.CheckBox", function() {
	"use strict";

	it('should load test page',function(){
		expect(takeScreenshot()).toLookAs('initial');
	});

	// verify checkBox is checked and editable
	it('should click on the checked and editable checkbox', function() {
		expect(takeScreenshot(element(by.id('cb_selected_enabled')))).toLookAs('cb_selected_enabled_before_click');
		element(by.id('cb_selected_enabled')).click();
		expect(takeScreenshot(element(by.id('cb_selected_enabled')))).toLookAs('cb_selected_enabled_after_click');
	});

	// verify checkBox is disabled and not editable
	it('should click on the disabled checkbox', function() {
		expect(takeScreenshot(element(by.id('cb_selected_disabled')))).toLookAs('cb_selected_disabled');
		element(by.id('cb_selected_disabled')).click();
		expect(takeScreenshot(element(by.id('cb_selected_disabled')))).toLookAs('cb_selected_disabled');
	});

	// verify checkBox is enabled and editable
	it('should click on the enabled and deselected checkbox', function() {
		expect(takeScreenshot(element(by.id('cb_deselected_enabled')))).toLookAs('cb_deselected_enabled_before_click');
		element(by.id('cb_deselected_enabled')).click();
		expect(takeScreenshot(element(by.id('cb_deselected_enabled')))).toLookAs('cb_deselected_enabled_after_click');
	});

	// verify checkBox is disabled and deselected
	it('should click on the disabled and deselected checkbox', function() {
		expect(takeScreenshot(element(by.id('cb_disabled_deselected')))).toLookAs('disabled_deselected');
		element(by.id('cb_disabled_deselected')).click();
		expect(takeScreenshot(element(by.id('cb_disabled_deselected')))).toLookAs('disabled_deselected');
	});

	// verify checkbox'es label size
	it('should check the label size in the checkbox', function() {
		expect(takeScreenshot(element(by.id('cb_with_label_size-label')))).toLookAs('checkbox_label');
	});

	// verify checkBox is not editable
	it('should click on the not editable checkbox', function() {
		expect(takeScreenshot(element(by.id('cb_not_editable')))).toLookAs('not_editable_before_click');
		element(by.id('cb_not_editable')).click();
		expect(takeScreenshot(element(by.id('cb_not_editable')))).toLookAs('not_editable_after_click');
	});

	// verify checkBox is display only
	it('should click on the display only checkbox', function() {
		expect(takeScreenshot(element(by.id('cb_display_only')))).toLookAs('cb_display_only');
		expect(takeScreenshot(element(by.id('cb_display_only_checked')))).toLookAs('cb_display_only_checked');
	});

	// verify warning checkBox is not selected and editable
	it('should click on the editable warning checkbox', function() {
		expect(takeScreenshot(element(by.id('cb_warning_deselected')))).toLookAs('warning_editable_before_click');
		element(by.id('cb_warning_deselected')).click();
		expect(takeScreenshot(element(by.id('cb_warning_deselected')))).toLookAs('warning_editable_after_click');
	});

	// verify warning checkBox is selected and editable
	it('should click on the editable selected warning checkbox', function() {
		expect(takeScreenshot(element(by.id('cb_warning_selected')))).toLookAs('warning_selected_editable_before_click');
		element(by.id('cb_warning_selected')).click();
		expect(takeScreenshot(element(by.id('cb_warning_selected')))).toLookAs('warning_selected_editable_after_click');
	});

	// verify warning checkBox is selected and not editable
	it('should click on the not editable selected warning checkbox', function() {
		expect(takeScreenshot(element(by.id('cb_warning_selected_disabled')))).toLookAs('warning_selected_disabled_before');
		element(by.id('cb_warning_selected_disabled')).click();
		expect(takeScreenshot(element(by.id('cb_warning_selected_disabled')))).toLookAs('warning_selected_disabled_after');
	});

	// verify error checkBox is not selected and editable
	it('should click on the editable error checkbox', function() {
		expect(takeScreenshot(element(by.id('cb_error_deselected')))).toLookAs('error_editable_before_click');
		element(by.id('cb_error_deselected')).click();
		expect(takeScreenshot(element(by.id('cb_error_deselected')))).toLookAs('error_editable_after_click');
	});

	// verify error checkBox is selected and editable
	it('should click on the editable selected error checkbox', function() {
		expect(takeScreenshot(element(by.id('cb_error_selected')))).toLookAs('error_selected_editable_before_click');
		element(by.id('cb_error_selected')).click();
		expect(takeScreenshot(element(by.id('cb_error_selected')))).toLookAs('error_selected_editable_after_click');
	});

	// verify error checkBox is selected and not editable
	it('should click on the not editable selected error checkbox', function() {
		expect(takeScreenshot(element(by.id('cb_error_selected_disabled')))).toLookAs('error_selected_disabled_after');
		element(by.id('cb_error_selected_disabled')).click();
		expect(takeScreenshot(element(by.id('cb_error_selected_disabled')))).toLookAs('error_selected_disabled_before');
	});

	// verify the checkBox enabled/disabled the checkBox in the toolbar
	it('should disable the checkbox in the toolbar', function() {
		expect(takeScreenshot(element(by.id('cb_in_toolbar')))).toLookAs('enabled_in_toolbar');
		element(by.id('cb_enable_disable_toolbar')).click();
		expect(takeScreenshot(element(by.id('cb_in_toolbar')))).toLookAs('disabled_in_toolbar');
	});

});
