// Note: the HTML page 'SupportAssistantAPI.html' loads this module via data-sap-ui-on-init

sap.ui.define(["sap/ui/support/Bootstrap", "sap/ui/support/RuleAnalyzer", "sap/m/Panel", "sap/m/Button", "sap/m/Text", "sap/m/Link", "sap/m/Input", "sap/m/List", "sap/m/StandardListItem"],
		function(bootstrap, RuleAnalyzer, Panel, Button, Text, Link, Input, List, StandardListItem) {
			"use strict";
			bootstrap.initSupportRules(["true", "silent"]);

			new Panel({
				id: "rootPanel",
				content: [
					new Panel({
						id: "innerPanel1",
						content: [
							new Button({
								id: "innerButton",
								icon: "sap-icon://task"
							}),
							new Text({
								id: "innerText"
							}),
							new Link({
								href: 'www.google.com',
								press: function () {

								}
							})
						]
					}),
					new Panel({
						id: "innerPanel2",
						content: [
							new Button({
								id: "innerButton2",
								icon: "sap-icon://task"
							}),
							new Input()
						]
					})

				]
			}).placeAt('content');

			var list = new List();

			var btn = new Button({
				text:'Analyze',
				press: function() {

					RuleAnalyzer.analyze({
						type : 'global'
					}, "Accessibility").then(function () {
						var history = RuleAnalyzer.getLastAnalysisHistory();

						list.destroyItems();

						for (var issueId in history.issues) {
							var issue = history.issues[issueId];

							var listItem = new StandardListItem({
								title: issue.severity,
								description: issue.details
							});

							list.addItem(listItem);
						}
					});

				}
			});

			list.placeAt('analyze');
			btn.placeAt('analyze');
		});