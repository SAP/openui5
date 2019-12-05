/*global describe,it,element,by,takeScreenshot,expect*/

describe('sap.m.RadioButtonGroup', function() {
	"use strict";

	// initial loading
	it('should load test page', function () {
		expect(takeScreenshot()).toLookAs('0_initial');
	});

	// simple group
	it('should visualize group with 3 radio buttons, 2 of them with editabe:false and enabled:true', function () {
		var group1 = element(by.id('RBG1'));
		expect(takeScreenshot(group1)).toLookAs('1_editabe-false_enabled-true');
	});

	// simple group 2
	it('should visualize group with 2 radio buttons', function () {
		var group1 = element(by.id('RBG1a'));
		expect(takeScreenshot(group1)).toLookAs('2_simple_group');
	});

	// value state warning
	it('should visualize group with value state warning', function () {
		var group2 = element(by.id('RBG2'));
		expect(takeScreenshot(group2)).toLookAs('3_value_state_warning');
	});

	// 3 columns 100% width
	it('should visualize group with 3 columns 100% width (container 350px)', function () {
		var group3 = element(by.id('RBG3'));
		expect(takeScreenshot(group3)).toLookAs('4_cutting_3_columns');
	});

	// 2 columns 200px width
	it('should visualize group with 2 columns 200px width', function () {
		element(by.id('sample2')).click();
		var group3a = element(by.id('RBG3a'));
		expect(takeScreenshot(group3a)).toLookAs('5_cutting_2_columns');
	});

	// value state error in  4 columns
	it('should visualize group with value state error in 4 columns', function () {
		var group4 = element(by.id('RBG4'));
		expect(takeScreenshot(group4)).toLookAs('6_value_state_error_4_columns');
	});

	// 2 columns 400px width in RTL
	it('should visualize group with 2 columns 400px width in RTL', function () {
		var group6 = element(by.id('RBG6'));
		group6.click();
		expect(takeScreenshot(group6)).toLookAs('7_2_columns_400px_width_RTL');
	});
});