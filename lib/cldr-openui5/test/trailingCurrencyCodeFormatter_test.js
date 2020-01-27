/*eslint-env mocha */

var assert = require('assert');
var formatter = require('../lib/trailingCurrencyCodeFormatter.js');


describe('trailingCurrencyCodeFormatter', function() {

	it('isCurrencySymbolTrailing: should pass', function() {
		assert.ok(formatter.isCurrencySymbolTrailing("# \u00a4"), 'trailing currency symbol');
		assert.ok(formatter.isCurrencySymbolTrailing("#.00\u00a4"), 'trailing currency symbol');
		assert.ok(formatter.isCurrencySymbolTrailing("#\u00a4"), 'trailing currency symbol');
		assert.ok(formatter.isCurrencySymbolTrailing("# Mio. \u00a4"), 'trailing currency symbol');

		// RTL
		assert.ok(formatter.isCurrencySymbolTrailing("\u200e#\u202f\u00a4\u202c"), 'trailing currency symbol');
		assert.ok(formatter.isCurrencySymbolTrailing("\u200f#\u202f\u00a4\u202c"), 'trailing currency symbol');
	});

	it('isCurrencySymbolTrailing: should not pass', function() {
		assert.ok(!formatter.isCurrencySymbolTrailing("\u00a4##"), 'trailing currency symbol');
		assert.ok(!formatter.isCurrencySymbolTrailing("\u00a4#.00"), 'trailing currency symbol');
		assert.ok(!formatter.isCurrencySymbolTrailing("\u00a4#"), 'trailing currency symbol');
		assert.ok(!formatter.isCurrencySymbolTrailing("\u00a4 Mio. #"), 'trailing currency symbol');

		// RTL
		assert.ok(!formatter.isCurrencySymbolTrailing("\u200e\u202b\u00a4\u202c#"), 'trailing currency symbol');
		assert.ok(!formatter.isCurrencySymbolTrailing("\u200f\u202b\u00a4\u202c#"), 'trailing currency symbol');
	});

	it('isCurrencySymbolTrailing: should fail', function() {
		assert.throws(function(){
			formatter.isCurrencySymbolTrailing("#");
		}, 'no number symbol');
		assert.throws(function(){
			formatter.isCurrencySymbolTrailing("\u00a4");
		}, 'no currency symbol');
		assert.throws(function(){
			formatter.isCurrencySymbolTrailing("Mio");
		}, 'neither currency nor number symbol');
		assert.throws(function(){
			formatter.isCurrencySymbolTrailing("");
		}, 'empty input: neither currency nor number symbol');
	});

	it('transformShortCurrencyPattern: do not modify', function() {
		assert.strictEqual(formatter.transformShortCurrencyPattern("## \u00a4", " "), "## \u00a4", 'do not transform pattern');
		assert.strictEqual(formatter.transformShortCurrencyPattern("#.00 \u00a4", " "), "#.00 \u00a4", 'do not transform pattern');
		assert.strictEqual(formatter.transformShortCurrencyPattern("# \u00a4", " "), "# \u00a4", 'do not transform pattern');
		assert.strictEqual(formatter.transformShortCurrencyPattern("Mio. # \u00a4", " "), "Mio. # \u00a4", 'do not transform pattern');
		assert.strictEqual(formatter.transformShortCurrencyPattern("000K \u00a4", " "), "000K \u00a4", 'do not transform pattern');
		assert.strictEqual(formatter.transformShortCurrencyPattern("0", " "), "0", 'do not transform pattern');

		// RTL
		assert.strictEqual(formatter.transformShortCurrencyPattern("\u200e000K\u202b\u00a4\u202c", " "), "\u200e000K\u202b\u00a4\u202c", 'rtl do not transform pattern');
		assert.strictEqual(formatter.transformShortCurrencyPattern("\u200f000K\u202b\u00a4\u202c", " "), "\u200f000K\u202b\u00a4\u202c", 'ltr do not transform pattern');
	});

	it('transformShortCurrencyPattern: modify', function() {
		assert.strictEqual(formatter.transformShortCurrencyPattern("\u00a4##", " "), "## \u00a4", 'transform pattern');
		assert.strictEqual(formatter.transformShortCurrencyPattern("\u00a4#.00", " "), "#.00 \u00a4", 'transform pattern');
		assert.strictEqual(formatter.transformShortCurrencyPattern("\u00a4#", " "), "# \u00a4", 'transform pattern');
		assert.strictEqual(formatter.transformShortCurrencyPattern("\u00a4 Mio. #", " "), "Mio. # \u00a4", 'transform pattern');
		assert.strictEqual(formatter.transformShortCurrencyPattern("\u00a4000K", " "), "000K \u00a4", 'transform pattern');

		// RTL
		assert.strictEqual(formatter.transformShortCurrencyPattern("\u200e\u202b\u00a4\u202c000K", " "), "\u200e\u202b\u202c000K \u00a4", 'rtl transform pattern');
		assert.strictEqual(formatter.transformShortCurrencyPattern("\u200f\u202b\u00a4\u202c000K", " "), "\u200f\u202b\u202c000K \u00a4", 'ltr transform pattern');
	});

	it('transformShortCurrencyPattern: fail', function() {
		assert.throws(function(){
			formatter.transformShortCurrencyPattern("\u00a4");
		}, 'invalid pattern');
	});

	it('transformCurrencyPattern: do not modify', function() {
		assert.strictEqual(formatter.transformCurrencyPattern("## \u00a4", " "), "## \u00a4", 'do not transform pattern');
		assert.strictEqual(formatter.transformCurrencyPattern("#.00 \u00a4", " "), "#.00 \u00a4", 'do not transform pattern');
		assert.strictEqual(formatter.transformCurrencyPattern("# \u00a4", " "), "# \u00a4", 'do not transform pattern');
		assert.strictEqual(formatter.transformCurrencyPattern("# \u00a4", " "), "# \u00a4", 'do not transform pattern');
		assert.strictEqual(formatter.transformCurrencyPattern("000 \u00a4", " "), "000 \u00a4", 'do not transform pattern');

		// 2 patterns separated by semicolon
		assert.strictEqual(formatter.transformCurrencyPattern("## \u00a4;(## \u00a4)", " "), "## \u00a4;(## \u00a4)", 'do not transform pattern');

		// RTL
		assert.strictEqual(formatter.transformCurrencyPattern("\u200e000K\u202b\u00a4\u202c", " "), "\u200e000K\u202b\u00a4\u202c", 'rtl do not transform pattern');
		assert.strictEqual(formatter.transformCurrencyPattern("\u200f000K\u202b\u00a4\u202c", " "), "\u200f000K\u202b\u00a4\u202c", 'ltr do not transform pattern');
	});

	it('transformCurrencyPattern: modify', function() {
		assert.strictEqual(formatter.transformCurrencyPattern("\u00a4 #,##0.00", " "), "#,##0.00 \u00a4", 'transform pattern');
		assert.strictEqual(formatter.transformCurrencyPattern("\u00a4##", " "), "##\u00a4", 'transform pattern');
		assert.strictEqual(formatter.transformCurrencyPattern("\u00a4#.00", " "), "#.00\u00a4", 'transform pattern');
		assert.strictEqual(formatter.transformCurrencyPattern("\u00a4#", " "), "#\u00a4", 'transform pattern');
		assert.strictEqual(formatter.transformCurrencyPattern("\u00a4 #", " "), "# \u00a4", 'transform pattern');
		assert.strictEqual(formatter.transformCurrencyPattern("\u00a4000", " "), "000\u00a4", 'transform pattern');

		// 2 patterns separated by semicolon
		assert.strictEqual(formatter.transformCurrencyPattern("\u00a4##;(\u00a4##)", " "), "##\u00a4;(##\u00a4)", 'do not transform pattern');
		assert.strictEqual(formatter.transformCurrencyPattern("\u00a4##;-\u00a4##.00", " "), "##\u00a4;-##.00\u00a4", 'do not transform pattern');
		assert.strictEqual(formatter.transformCurrencyPattern("\u00a4 ##;-\u00a4##.00", " "), "## \u00a4;-##.00\u00a4", 'do not transform pattern');

		// RTL
		assert.strictEqual(formatter.transformCurrencyPattern("\u200e\u202b\u00a4\u202c000", " "), "\u200e\u202b\u202c000\u00a4", 'rtl transform pattern');
		assert.strictEqual(formatter.transformCurrencyPattern("\u200f\u202b\u00a4\u202c000", " "), "\u200f\u202b\u202c000\u00a4", 'ltr transform pattern');
	});

	it('transformCurrencyPattern: fail', function() {
		assert.throws(function(){
			formatter.transformCurrencyPattern("\u00a4;");
		}, 'invalid pattern');
		assert.throws(function(){
			formatter.transformCurrencyPattern(";\u00a4");
		}, 'invalid pattern');
		assert.throws(function(){
			formatter.transformCurrencyPattern("\u00a4");
		}, 'invalid pattern');
		assert.throws(function(){
			formatter.transformCurrencyPattern("0");
		}, 'invalid pattern');
	});
});
