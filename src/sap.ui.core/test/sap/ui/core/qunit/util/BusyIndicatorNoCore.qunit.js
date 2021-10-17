/* global sinon, QUnit */
sap.ui.define([
	"sap/ui/core/BusyIndicator",
	"sap/ui/core/Core",
	"sap/ui/thirdparty/jquery"
], function (
	BusyIndicator,
	oCore,
	jQuery
) {
	"use strict";

	var bInitialized = oCore.isInitialized();

	var oSpyShow = sinon.spy(BusyIndicator, "show");
	var oSpyShowNowIfRequested = sinon.spy(BusyIndicator, "_showNowIfRequested");
	var oSpyOnOpen = sinon.spy(BusyIndicator, "_onOpen");

	BusyIndicator.hide();

	BusyIndicator.show(0);

	BusyIndicator.hide();

	BusyIndicator.show(0);

	BusyIndicator.hide();

	BusyIndicator.show(0);

	QUnit.module("BusyIndicator before DOM", {
		beforeEach: function () {
			this.sClass = ".sapUiLocalBusyIndicator";
			if (new URLSearchParams(window.location.search).get("sap-ui-theme") == "sap_goldreflection") {
				this.sClass = ".sapUiBusy";
			}
		},

		afterEach: function () {
			BusyIndicator.hide();
		}
	});

	// make sure the BusyIndicator is not rendered initially
	QUnit.test("Check if 'show' waits for DOM", function (assert) {
		var done = assert.async();

		oCore.attachInit(function () {
			assert.notOk(bInitialized, "Core wasn't ready when 'show' was called");
			assert.ok(oSpyShow.callCount > 1, "'show' called more than once");

			assert.equal(oSpyShowNowIfRequested.callCount, 1, "'_showNowIfRequested' was called exactly 1");

			var bCalledWithDelay = false;
			for (var i = 0; i < oSpyShow.args.length; i++) {
				bCalledWithDelay = oSpyShow.args[i].length == 1 && oSpyShow.args[i][0] === 0;
				if (!bCalledWithDelay) {
					break;
				}
			}
			assert.ok(bCalledWithDelay, "'show' was called with only with parameter 'iDelay:0' in all cases");

			assert.ok(oSpyShow.calledBefore(oSpyShowNowIfRequested), "'show' was called before 'showNowIfRequested'");
			assert.ok(oSpyShowNowIfRequested.calledBefore(oSpyOnOpen), "'_showNowIfRequested' was called before '_onOpen'");

			//check if both busyindicators are present
			var $oLocalBI = jQuery(".sapUiLocalBusyIndicator");
			assert.equal($oLocalBI.length, 1, "'Pulsating Circles' BusyIndicator should exist in DOM after opening");
			assert.ok($oLocalBI.hasClass("sapUiLocalBusyIndicatorFade"), "'Pulsating Circles' BusyIndicator should be visible after opening");
			assert.ok($oLocalBI.hasClass("sapUiLocalBusyIndicatorSizeBig"), "Big Animation should be shown");

			//check line sliding busy indicator in goldreflection. Else the same
			//DOM as above will be checked if it's visible
			var $Busy = jQuery(this.sClass);
			var bVisible = $Busy.is(":visible") && ($Busy.css("visibility") == "visible");
			assert.ok(bVisible, "BusyIndicator should be visible after opening");
			assert.ok($Busy.css("top") === "0px", "BusyIndicator is positioned at the top of the window");

			done();
		}.bind(this));

		// now boot the core
		oCore.boot();
	});

	// make sure the BusyIndicator is not rendered initially
	QUnit.test("Check if the 'show()' logic is performed only once, when called multiple times before core is initialized", function (assert) {
		var done = assert.async();

		setTimeout(function () {
			assert.equal(oSpyShowNowIfRequested.callCount, 1, "'_showNowIfRequested' was called exactly 1");
			done();
		}, 1000);
	});

});
