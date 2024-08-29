/*!
 * ${copyright}
 */

/* global QUnit */
/* eslint-disable no-new */

sap.ui.define([
	"sap/ui/mdc/util/DensityHelper",
	"sap/ui/core/Control",
	"sap/ui/thirdparty/jquery"
], function(DensityHelper, Control, jQuery) {
	"use strict";

	QUnit.test("set density from default", function(assert) {
		const oTarget = new Control();
		const $body = jQuery(document.body);
		$body.removeClass("sapUiSizeCozy");
		assert.notOk($body.hasClass("sapUiSizeCozy"), "cozy density is not given.");
		DensityHelper.syncDensity(oTarget);
		assert.ok(oTarget.hasStyleClass("sapUiSizeCozy"), "cozy density is set from default.");
		oTarget.destroy();
		$body.addClass("sapUiSizeCozy");
	});

	QUnit.test("set density from body", function(assert) {
		const oTarget = new Control();
		assert.ok(jQuery(document.body).hasClass("sapUiSizeCozy"), "cozy density is given.");
		DensityHelper.syncDensity(oTarget);
		assert.ok(oTarget.hasStyleClass("sapUiSizeCozy"), "cozy density is forwarded.");
		oTarget.destroy();
	});

	QUnit.test("set density from control", function(assert) {
		const oSource = new Control();
		oSource.addStyleClass("sapUiSizeCondensed");
		const oTarget = new Control();
		DensityHelper.syncDensity(oTarget, oSource);
		assert.ok(oTarget.hasStyleClass("sapUiSizeCondensed"), "condensed density is forwarded.");
		oSource.destroy();
		oTarget.destroy();
	});

	QUnit.test("do not override target density", function(assert) {
		const oSource = new Control();
		oSource.addStyleClass("sapUiSizeCondensed");
		const oTarget = new Control();
		oTarget.addStyleClass("sapUiSizeCompact");
		DensityHelper.syncDensity(oTarget, oSource);
		assert.notOk(oTarget.hasStyleClass("sapUiSizeCondensed"), "condensed density is not overriden.");
		assert.ok(oTarget.hasStyleClass("sapUiSizeCompact"), "compact density is still given.");
		oSource.destroy();
		oTarget.destroy();
	});
});