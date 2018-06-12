/*global QUnit */
sap.ui.define(["sap/ui/dom/patch", "sap/ui/thirdparty/jquery"], function(domPatch, jQuery) {
	"use strict";

	QUnit.module("sap/ui/dom/patch");

	QUnit.test("Basic", function(assert) {
		var $Ref = jQuery('' +
		'<div id="id" title="Ref" style="color:black" class="x" tabindex="-1">' +
			'<!--Ref-->' +
			'<span title="Ref" style="color:black" class="x" tabindex="-1">Ref</span>' +
			'Ref' +
		'</div>');

		var $New = jQuery('' +
		'<div id="id" dir="rtl" style="color:blue" class="x y" tabindex="0">' +
			'<!--New-->' +
			'<span dir="rtl" style="color:blue" class="x y" tabindex="0">Something Deep</span>' +
			'New' +
		'</div>');

		// let the reference have parent to replace
		jQuery(document.body).append($Ref);

		// test the patch
		assert.strictEqual(domPatch($Ref[0], $New[0]), true, "Should apply the patch");
		assert.ok($Ref[0].isEqualNode($New[0]), "Patch is applied correctly");

		// test replace
		$Ref.append("<div></div>");
		assert.strictEqual(domPatch($Ref[0], $New[0]), false, "Should replace the reference DOM");
		$Ref = jQuery("#id"); // get it again since it is replaced
		assert.ok($Ref[0].isEqualNode($New[0]), "Replace is done correctly");

		$Ref.remove();
	});

});
