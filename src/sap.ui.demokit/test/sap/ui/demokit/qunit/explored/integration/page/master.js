sap.ui.require([
		'sap/ui/test/Opa5',
		'test/page/Common',
		'test/page/matchers'
	],
	function(Opa5, Common, matchers) {
		"use strict";

		Opa5.createPageObjects({

			onTheMasterPage : {
				baseClass: Common,
				actions : {
					iPressOnTheEntity : function (sEntityName) {
						return this.waitFor({
							id : "list",
							viewName: "master",
							matchers: matchers.listItemWithTitle(sEntityName),
							success : function (oListItem) {
								oListItem.$().trigger("tap");
							},
							errorMessage: "Did not find the entity " + sEntityName
						});
					}
				}
			}

		});

	});
