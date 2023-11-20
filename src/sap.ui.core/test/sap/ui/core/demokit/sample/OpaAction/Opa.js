/* global QUnit */

QUnit.config.autostart = false;

sap.ui.require([
	"sap/ui/test/Opa5",
	"sap/ui/test/opaQunit",
	"sap/ui/test/matchers/AggregationLengthEquals",
	"sap/ui/test/matchers/Ancestor",
	"sap/ui/test/matchers/Properties",
	"sap/ui/test/matchers/BindingPath",
	"sap/ui/test/matchers/LabelFor",
	"sap/ui/test/actions/Press",
	"sap/ui/test/actions/EnterText",
	"sap/ui/test/actions/Drag",
	"sap/ui/test/actions/Drop",
	"sap/ui/test/actions/Scroll",
	"sap/ui/Device"
], function (Opa5,
			 opaTest,
			 AggregationLengthEquals,
			 Ancestor,
			 Properties,
			 BindingPath,
			 LabelFor,
			 Press,
			 EnterText,
			 Drag,
			 Drop,
			 Scroll,
			 Device) {
	"use strict";

	Opa5.extendConfig({
		viewNamespace: "appUnderTest.view.",
		// we only have one view, so it makes sense to set its name globally
		viewName: "Main",
		autoWait: true,
		asyncPolling: true
	});

	QUnit.module("Pressing controls");

	opaTest("Should press special target within a control", function (Given, When, Then) {
		Given.iStartMyUIComponent({
			componentConfig: {
				name: "appUnderTest"
			}
		});

		When.waitFor({
			controlType: "sap.m.StandardListItem",
			// Pressing a special region of a control is achieved with the region's ID suffix
			actions: new Press({
				idSuffix: "imgDel"
			}),
			errorMessage: "List items' delete buttons were not pressable"
		});

		Then.waitFor({
			controlType: "sap.m.List",
			matchers: new AggregationLengthEquals({
				name: "items",
				length: 0
			}),
			success: function () {
				Opa5.assert.ok(true, "List has no items");
			}
		});
	});

	opaTest("Should navigate to page 2 using the press action", function (Given, When, Then) {
		When.waitFor({
			id: "navigationButton",
			// For pressing controls use the press action
			// The button is busy so OPA will automatically wait until you can press it
			actions: new Press(),
			errorMessage: "The navigation button was not pressable"
		});

		Then.waitFor({
			id: "myForm",
			success: function () {
				Opa5.assert.ok(true, "Navigation to page 2 was a success");
			},
			errorMessage: "Was not able to navigate to page 2"
		});
	});

	opaTest("Should press Tokens with a Ctrl key modifier", function (Given, When, Then) {

		When.waitFor({
			controlType: "sap.m.Token",
			actions: new Press({
				ctrlKey: true
			}),
			success: function(oTokens){
				var check = true;

				oTokens.forEach(function(oToken){
					if (!oToken.getSelected()) {
						check = false;
					}
				});

				Opa5.assert.ok(check, "All the tokens have been selected");
			},
			errorMessage: "Failed to select all tokens"
		});
	});

	opaTest("Should use click coordinates on Slider", function (Given, When, Then) {
		When.waitFor({
			controlType: "sap.m.Slider",
			id: "slider",
			actions: new Press({
				idSuffix: "inner",
				xPercentage: 80
			}),
			success: function(oSlider){

				Opa5.assert.ok(oSlider.mProperties.value === 80, "Slider has value of 80");
			},
			errorMessage: "Failed to select all tokens"
		});
	});

	QUnit.module("Entering text in Controls");

	opaTest("Should enter text in form inputs", function (Given, When, Then) {
		// Fill all inputs on the screen with the same text
		When.waitFor({
			controlType: "sap.m.Input",
			actions: new EnterText({
				text: "Hello from OPA actions"
			}),
			errorMessage: "There was no Input"
		});

		Then.waitFor({
			controlType: "sap.m.Input",
			success: function (aInputs) {
				aInputs.forEach(function (oInput) {
					Opa5.assert.strictEqual(oInput.getValue(), "Hello from OPA actions", oInput + " contains the text");
				});
			},
			errorMessage: "The text was not entered"
		});
	});

	opaTest("Should enter text with suggestion", function (Given, When, Then) {
		// show the suggestion list
		When.waitFor({
			controlType: "sap.m.Input",
			matchers: new LabelFor({
				text: "Name"
			}),
			actions: new EnterText({
				text: "Jo",
				keepFocus: true
			}),
			success: function (aInputs) {
				// select a suggestion
				this.waitFor({
					controlType: "sap.m.StandardListItem",
					matchers: [
						new Ancestor(aInputs[0]),
						new Properties({
							title: "John"
						})
					],
					actions: new Press(),
					errorMessage: "Did not select a suggestion"
				});
			},
			errorMessage: "Did not find the input"
		});

		// verify the input value
		Then.waitFor({
			controlType: "sap.m.Input",
			matchers: new LabelFor({
				text: "Name"
			}),
			success: function (aInputs) {
				Opa5.assert.strictEqual(aInputs[0].getValue(), "John", aInputs[0] + " contains the text");
			},
			errorMessage: "Did not find the input"
		});
	});

	opaTest("Should enter text with enter key", function (Given, When, Then) {
		When.waitFor({
			controlType: "sap.m.Button",
			matchers: new Properties({
				text: "Press here to open a popover"
			}),
			actions: new Press()
		});

		When.waitFor({
			controlType: "sap.m.Input",
			searchOpenDialogs: true,
			actions: new EnterText({
				text: "test",
				pressEnterKey: true
			})
		});

		Then.waitFor({
			controlType: "sap.m.Popover",
			searchOpenDialogs: true,
			success: function (aPopover) {
				Opa5.assert.ok(aPopover[0].isOpen(), "Popover should remain open on any browser");
			}
		});
	});

	QUnit.module("Select using the press action");

	opaTest("Should select an item in a sap.m.Select", function(Given, When, Then) {
		When.waitFor({
			id: "mySelect",
			actions: new Press(),
			success: function(oSelect) {
				this.waitFor({
					controlType: "sap.ui.core.Item",
					matchers: [
						new Ancestor(oSelect),
						new Properties({ key: "Germany"})
					],
					actions: new Press(),
					success: function() {
						Opa5.assert.strictEqual(oSelect.getSelectedKey(), "Germany", "Selected Germany");
					},
					errorMessage: "Cannot select Germany from mySelect"
				});
			},
			errorMessage: "Could not find mySelect"
		});

	});

	QUnit.module("Custom Actions");

	opaTest("Should select an item in a sap.m.Select", function(Given, When, Then) {
		// If the framework does not have the action you are looking for
		// This is how you enter a custom action
		When.waitFor({
			id: "mySelect",
			actions: function (oSelect) {
				oSelect.setSelectedKey("USA");
			},
			errorMessage: "Could not select USA from the country select"
		});

		Then.waitFor({
			id: "mySelect",
			success: function (oSelect) {
				Opa5.assert.strictEqual(oSelect.getSelectedKey(), "USA", "Selected USA");
			},
			errorMessage: "USA was not selected"
		});
	});

	QUnit.module("Scroll");

	opaTest("Should scroll a page", function (Given, When, Then) {
		Then.waitFor({
			controlType: "sap.m.StandardListItem",
			matchers: new BindingPath({
				path: "/ProductCollection/21",
				modelName: "orderedListModel"
			}),
			success: function  (aControls) {
				Opa5.assert.ok(!isInViewport(aControls[0].getDomRef()), "The page is in initial state");
			}
		});

		When.waitFor({
			controlType: "sap.m.Page",
			actions: new Scroll({
				y: 2000
			})
		});

		Then.waitFor({
			controlType: "sap.m.StandardListItem",
			matchers: new BindingPath({
				path: "/ProductCollection/21",
				modelName: "orderedListModel"
			}),
			success: function  (aControls) {
				Opa5.assert.ok(isInViewport(aControls[0].getDomRef()), "The page is scrolled");
			}
		});
	});

	if (Device.browser.safari) {
		opaTest("Should not run in Safari", function (Given, When, Then) {
			Then.waitFor({
				success: function () {
					Opa5.assert.ok(true, "DataTransfer object can't be instantiated in Safari, but drag event needs a dataTransfer");
				}
			});
			Then.iTeardownMyApp();
		});
	} else {

		QUnit.module("Drag and drop");

		opaTest("Should rearrange items in a list using drag and drop", function (Given, When, Then) {
			When.waitFor({
				controlType: "sap.m.StandardListItem",
				matchers: new BindingPath({
					path: "/ProductCollection/1",
					modelName: "orderedListModel"
				}),
				actions: new Drag()
			});

			When.waitFor({
				controlType: "sap.m.StandardListItem",
				matchers: new BindingPath({
					path: "/ProductCollection/5",
					modelName: "orderedListModel"
				}),
				actions: new Drop({
					before: true
				})
			});

			Then.waitFor({
				controlType: "sap.m.List",
				matchers: function (oList) {
					return oList.getItems().splice(4, 2);
				},
				success: function (aItems) {
					// assert that items are reordered
					Opa5.assert.strictEqual(aItems[0][0].getTitle(), "Notebook Basic 17", "The second item was dropped in place");
					Opa5.assert.strictEqual(aItems[0][1].getTitle(), "Notebook Professional 15", "The second item was dropped before the sixth item");
				}
			});

			Then.iTeardownMyApp();
		});
	}

	QUnit.module("Select buttons in a responsive toolbar");

	Opa5.extendConfig({
		actions: {
			pressToggleButton: function (sToolbarId) {
				// press the toggle button to show the overflowing content, or,
				// do nothing if the button is not present (the entire content fits on the page)
				this.waitFor({
					id: sToolbarId,
					success: function (oToolbar) {
						this.waitFor({
							controlType: "sap.m.ToggleButton",
							success: function (aToggleButton) {
								// "the toggle button isn't initialized before it's needed".
								// the button can be seen in the element and control tree, but it doesn't have parents.
								// so trying to match it by its parent toolbar isn't possible until the toolbar overflows
								if (aToggleButton[0].$().length && new Ancestor(oToolbar)(aToggleButton[0])) {
									new Press().executeOn(aToggleButton[0]);
								} else {
									Opa5.assert.ok(true, "The toggle button is not present");
								}
							}
						});
					}
				});
			},
			iPressToolbarButton: function (sToolbarId, sButtonText) {
				this.waitFor({
					id: sToolbarId,
					success: function (oToolbar) {
						this.waitFor({
							controlType: "sap.m.Button",
							matchers: [
								new Properties({text: sButtonText}),
								new Ancestor(oToolbar)
							],
							actions: new Press()
						});
					}
				});
			}
		},
		assertions: {
			iShouldCheckTheResult: function (sText) {
				this.waitFor({
					id: "toolbar-text",
					success: function (oText) {
						Opa5.assert.strictEqual(oText.getText(), "Pressed " + sText + " Button", "Pressed the expected button");
					}
				});
			}
		}
	});

	opaTest("Should select buttons in an overflowing toolbar", function (Given, When, Then) {
		Given.iStartMyUIComponent({
			componentConfig: {
				name: "appUnderTest"
			}
		});

		// press the toggle button to show the overflowing content
		When.pressToggleButton("toolbar-overflow");
		// press a button that is not in the overflow popover
		When.iPressToolbarButton("toolbar-overflow", "Always Visible");

		Then.iShouldCheckTheResult("Always Visible");

		// press the toggle button to show the overflowing content
		When.pressToggleButton("toolbar-overflow");
		// press a button that is in the overflow popover
		When.iPressToolbarButton("toolbar-overflow", "Overflowing");

		Then.iShouldCheckTheResult("Overflowing");
	});

	opaTest("Should select buttons in a toolbar that is not overflowing", function (Given, When, Then) {
		When.pressToggleButton("toolbar-fit");

		// press a button that is not in the overflow popover
		When.iPressToolbarButton("toolbar-fit", "Should Overflow");

		Then.iShouldCheckTheResult("Should Overflow");

		Then.iTeardownMyApp();
	});

	function isInViewport (element) {
		var mRect = element.getBoundingClientRect();
		return mRect.top >= 0 && mRect.left >= 0 &&
			mRect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
			mRect.right <= (window.innerWidth || document.documentElement.clientWidth);
	}

	QUnit.start();
});
