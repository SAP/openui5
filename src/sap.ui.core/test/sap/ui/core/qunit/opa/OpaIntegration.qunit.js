sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/ui/test/Opa",
	"sap/ui/test/opaQunit",
	"sap/ui/qunit/qunit-junit",
	"sap/ui/qunit/qunit-coverage"
], function (jQuery, Opa, opaTest) {
	"use strict";

	function startApp () {
		var iNumberOfButtons = 1;

		function addButtonAfterSomeTime() {
			window.setTimeout(function () {
				var $button = jQuery('<button id="button' + iNumberOfButtons + '">' + iNumberOfButtons + '</button>').on("click", addButtonAfterSomeTime);
				jQuery("body").append($button);
				iNumberOfButtons++;
			}, Math.random() * 1000);
		}

		//add the first button
		addButtonAfterSomeTime();
	}

	var arrangements = new Opa({
		iStartMyApp : function () {
			startApp();
			return this;
		}
	});

	var actions = new Opa({
		iPressOnAButton : function (sButtonId) {
			this.waitFor({
				check : function () {
					return jQuery("#" + sButtonId).length;
				},
				success : function () {
					jQuery("#" + sButtonId).trigger("click");
				}
			});
			return this;
		}
	});

	var assertions = new Opa({
		iSeeTheButtonWithTheIdAndText : function (sButtonId, sText) {
			this.waitFor({
				check : function () {
					return jQuery("#" + sButtonId).length;
				},
				success : function () {
					Opa.assert.strictEqual(jQuery("#" + sButtonId).text(), sText, "Found the button with the id " + sButtonId);
				}
			});
			return this;
		}
	});

	Opa.extendConfig({
		arrangements : arrangements,
		actions : actions,
		assertions : assertions
	});

	opaTest("Should create two buttons", function (Given, When, Then) {
		// Arrangements
		Given.iStartMyApp();

		//Actions
		When.iPressOnAButton("button1");

		// Assertions
		Then.iSeeTheButtonWithTheIdAndText("button2", "2");
	});

});
