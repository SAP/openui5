/* global QUnit */

sap.ui.define(["jquery.sap.unicode", "sap/ui/Device"], function(jQuery, Device) {
	"use strict";

	var aData, UNorm;
	aData = [
		{form:"NFC", string:"ẛ̣", representation:"\\u1E9B\\u0323"},
		{form:"NFD", string:"ẛ̣", representation:"\\u017F\\u0323\\u0307"},
		{form:"NFKC", string:"ṩ", representation:"\\u1E69", compatible:true},
		{form:"NFKD", string:"ṩ", representation:"\\u0073\\u0323\\u0307", compatible:true}
	];

	// helper function for retreiving char representations
	function toCharCodes(s) {
		function pad(s) {
			while (s.length < 4) {
				s = ("0" + s);
			}
			return s;
		}
		var chars = "";
		for (var i = 0; i < s.length; i++) {
			chars += "\\u" + pad(s.charCodeAt(i).toString(16).toUpperCase());
		}
		return chars;
	}

	QUnit.module("UNorm");

	QUnit.test("test dependencies", function(assert) {
		assert.ok(Device, "Device API loaded");
	});

	QUnit.test("conditional polyfill", function(assert) {
		UNorm = window.UNorm;
		if (UNorm) {
			assert.ok(UNorm, "unorm is loaded");
			assert.ok(UNorm.UChar.udata, "unormdata is loaded");
			assert.ok(String.prototype.normalize, "String.prototype.normalize is polyfilled");
		} else if (Device.browser.mobile) {
				// polyfill should not be loaded for mobile browsers
				assert.ok(!UNorm, "unorm not loaded");
			} else {
				assert.ok(String.prototype.normalize, "String.prototype.normalize browser implementation");
				// browser implementation, no further testing is required
			}
	});

	if (UNorm) {
		QUnit.test("reference data", function(assert) {
			assert.expect(8);
			jQuery.each(aData, function(i, o) {
				assert.equal(toCharCodes(o.string), o.representation, "\"" + o.form + "\"" + " string is valid");
				assert.equal(o.string.normalize(o.form), o.string, "\"" + o.form + "\"" + " string is \""  + o.form + "\"" );
			});
		});

		jQuery.each(aData, function(i, o) {
			QUnit.module(o.form, {
				beforeEach: function() {
					this.s = aData[0].string + aData[1].string + aData[2].string + aData[3].string;
				}
			});

			// ref: http://unicode.org/reports/tr15/#Design_Goals
			QUnit.test("chaining", function(assert) {
				o.compatible ? assert.expect(6) : assert.expect(2);
				// primitive value of the normalized string as reference
				var sRef = this.s.normalize(o.form).valueOf();
				assert.equal(this.s.normalize("NFC").normalize(o.form), sRef, "\"NFC\"");
				assert.equal(this.s.normalize("NFD").normalize(o.form), sRef, "\"NFD\"");
				if (o.compatible) {
					// compatibility normalizations
					assert.equal(this.s.normalize("NFKC").normalize(o.form), sRef, "\"NFKC\"");
					assert.equal(this.s.normalize("NFKD").normalize(o.form), sRef, "\"NFKD\"");
					// and corresponding standard normalization
					assert.equal(this.s.normalize("NFKC").normalize(o.form.replace("K","")), sRef, "\"NFKC\"");
					assert.equal(this.s.normalize("NFKD").normalize(o.form.replace("K","")), sRef, "\"NFKD\"");
				}
			});
		});
	}

	// do not perform tests on mobiles without native support
	if (!Device.browser.mobile || String.prototype.normalize) {
		QUnit.module("Quick check NFC", {
			beforeEach: function() {
				// blind test, no relevant characters
				this.sBlind = "ABC";
				// some random combined characters
				this.sSomething = "Améliè";
				// all forms different character
				this.sNFC = "\u1E9B\u0323";
				this.sNFC = "\u1E9B\u0323";
				this.sNFD = "\u017F\u0323\u0307";
				this.sNFKC = "\u1E69";
				this.sNFKD = "\u0073\u0323\u0307";
				this.s = this.sNFC + this.sNFD + this.sNFKC + this.sNFKD;
			},
			afterEach: function() {}
		});

		QUnit.test("verify test string", function(assert) {
			assert.equal(this.sBlind, this.sBlind.normalize("NFC"), "NFC verified");
			assert.equal(this.sSomething, this.sSomething.normalize("NFC"), "NFC verified");
			assert.equal(this.sNFC, this.sNFC.normalize("NFC"), "NFC verified");
			assert.equal(this.sNFD, this.sNFD.normalize("NFD"), "NFD verified");
			assert.equal(this.sNFKC, this.sNFKC.normalize("NFKC"), "NFKC verified");
			assert.equal(this.sNFKD, this.sNFKD.normalize("NFKD"), "NFKD verified");
			assert.notEqual(this.s, this.s.normalize("NFC"), "not NFC verified");
			assert.notEqual(this.s, this.s.normalize("NFD"), "not NFD verified");
			assert.notEqual(this.s, this.s.normalize("NFKC"), "not NFKC verified");
			assert.notEqual(this.s, this.s.normalize("NFKD"), "not NFKD verified");
			assert.equal(this.sNFC + this.sNFC + this.sNFKC + this.sNFKC, this.s.normalize("NFC"), "NFC concatenation verified");
			assert.equal(this.sNFD + this.sNFD + this.sNFKD + this.sNFKD, this.s.normalize("NFD"), "NFD concatenation verified");
			assert.equal(this.sNFKC + this.sNFKC + this.sNFKC + this.sNFKC, this.s.normalize("NFKC"), "NFKC concatenation verified");
			assert.equal(this.sNFKD + this.sNFKD + this.sNFKD + this.sNFKD, this.s.normalize("NFKD"), "NFKD concatenation verified");
		});

		QUnit.test("isStringNFC", function(assert) {
			assert.ok(jQuery.sap.isStringNFC("ABC"), "NFC is NFC");
			assert.ok(jQuery.sap.isStringNFC("Améliè"), "NFC is NFC");
			assert.ok(!jQuery.sap.isStringNFC(this.sNFC) || jQuery.sap.isStringNFC(this.sNFC), "NFC maybe NFC");
			assert.ok(!jQuery.sap.isStringNFC(this.sNFD), "NFD is not NFC");
			assert.ok(jQuery.sap.isStringNFC(this.sNFKC), "NFKC is also NFC");
			assert.ok(!jQuery.sap.isStringNFC(this.sNFKD), "NFKD is not NFC");
			assert.ok(!jQuery.sap.isStringNFC(this.s), "concatenation is not NFC");
		});
	}

});
