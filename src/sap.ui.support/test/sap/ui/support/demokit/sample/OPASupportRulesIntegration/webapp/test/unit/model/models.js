sap.ui.require(
	[
		"jquery.sap.global",
		"sap/ui/demo/bulletinboard/model/models",
		"sap/m/Label",
		"sap/m/Input",
		"jquery.sap.support"
	],
	function (jQuery, models, Label, Input /*, jQuerySapSupport */) {
		"use strict";

		QUnit.module("Support Rule Test", {

			setup: function () {

				this.label1 = new Label({
					text: "Label without LabelFor"
				});

				this.input1 = new Input("inpuId1", {
					value: "10"
				});

				this.label2 = new Label({
					labelFor: "inpuId2",
					text: "Label with LabelFor"
				});

				this.input2 = new Input("inpuId2", {});

				this.label1.placeAt('qunit-fixture');
				this.label2.placeAt('qunit-fixture');
				this.label1.placeAt('qunit-fixture');
				this.label1.placeAt('qunit-fixture');
				sap.ui.getCore().applyChanges();
			},
			teardown: function () {

				this.label1.destroy();
				this.input1.destroy();
				this.label2.destroy();
				this.input2.destroy();

			}
		});
		QUnit.test('Getting value form first Input', function (assert) {

			// assert
			assert.strictEqual(this.input1.getValue(), '10', 'Datetime should be 10');
		});


		QUnit.test("Analyzing the page with Support Rules", function (assert) {
			var issues;
			var expectedIssues = 0;
			var hintIssues = 0;
			var errorIssues = 0;
			var warningIssues = 0;
			var issuesMessage = 'There are no issues from support rules';
			var assertDone = assert.async();

			jQuery.sap.support.analyze().then(function () {
				setTimeout(function () {
					issues = jQuery.sap.support.getIssueHistory();
					if (issues[0].issues.length > 0) {
						issues[0].issues.forEach(function (issue) {
							if (issue.severity === 'Hint') {
								hintIssues += 1;
							} else if (issue.severity === 'Warning') {
								warningIssues += 1;
							} else if (issue.severity === 'Error') {
								errorIssues += 1;
							}
						});

						issuesMessage = "There are Support Rules issues: Error(s) - " + errorIssues + " | Warning(s) - " + warningIssues + " | Hint(s) - " + hintIssues;
					}

					jQuery.sap.support.renderIssuesForOPA();

					assert.strictEqual(issues[0].issues.length, expectedIssues, issuesMessage);
					assertDone();
				}, 1000);
			});
		});
	});