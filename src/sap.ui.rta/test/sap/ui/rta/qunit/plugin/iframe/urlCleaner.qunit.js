/* global QUnit */

sap.ui.define([
	"sap/ui/rta/plugin/iframe/urlCleaner"
], function (urlCleaner) {
	"use strict";

	QUnit.module("Given the URL entered by the user ", {
	}, function() {
		[{
			from: "https://some.domain.com/demo-kit/#/search/{$user>/email}",
			to: "https://some.domain.com/demo-kit/#/search/{$user>/email}"
		}, {
			from: "https://some.domain.com/\ndemo-kit/#/search/{$user>/email}",
			to: "https://some.domain.com/demo-kit/#/search/{$user>/email}"
		}, {
			from: "https://some.domain.com/\r\ndemo-kit/#/search/{$user>/email}\r\n",
			to: "https://some.domain.com/demo-kit/#/search/{$user>/email}"
		}, {
			from: "https://some.\t\r\ndomain.com/\r\ndemo-kit/#/search/{$user>/email}\r\n\r\n",
			to: "https://some.domain.com/demo-kit/#/search/{$user>/email}"
		}].forEach(function (oTestCase) {
			QUnit.test(JSON.stringify(oTestCase.from), function (assert) {
				assert.strictEqual(urlCleaner(oTestCase.from), oTestCase.to, "it cleans to " + JSON.stringify(oTestCase.to));
			});
		});
	});

	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});
});
