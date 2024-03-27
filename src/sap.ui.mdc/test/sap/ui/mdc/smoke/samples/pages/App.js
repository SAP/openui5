/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/matchers/PropertyStrictEquals",
	"sap/ui/test/matchers/Ancestor",
	"sap/ui/test/matchers/Descendant",
	"sap/ui/test/actions/Press",
	"sap/ui/test/actions/EnterText",
	"test-resources/sap/ui/mdc/testutils/opa/actions/TriggerEvent",
	"sap/ui/core/Lib"
], function(Opa5, PropertyStrictEquals, Ancestor, Descendant, Press, EnterText, TriggerEvent, Library) {
	"use strict";


	const oMDCBundle = Library.getResourceBundleFor("sap.ui.mdc");

	function waitForOpenShowValues(oSettings) {
		const fnCallSuccess = function() {
            if (typeof oSettings.success === "function") {
                oSettings.success.call(this);
            }
        };

		return this.waitFor({
			controlType: "sap.m.Dialog",
			matchers: {
				ancestor: {
					controlType: "sap.ui.mdc.FilterBar",
					visible: false
				}
			},
			success:function(aAdaptFiltersPanel) {
				Opa5.assert.equal(aAdaptFiltersPanel.length, 1, "Adapt Filters Panel found");
				const sAdaptFiltersResourceBundleButtonText = oMDCBundle.getText("filterbar.ADAPT_HIDE_VALUE");
				return this.waitFor({
					controlType: "sap.m.Button",
					properties: {
						text: sAdaptFiltersResourceBundleButtonText
					},
					matchers: new Ancestor(aAdaptFiltersPanel[0]),
					success : function(aBtn) {
						Opa5.assert.equal(aBtn.length, 1, "Found an active 'Show Values' mode");
						fnCallSuccess.call(this);
					}
				});
			}
		});
	}

	return Opa5.createPageObjects({
		onTheApp: {
			actions: {
				iChangeTheSliderValueInTheFilterField: function(iValue, bInShowValues) {
					function fnChangeSliderValue() {
						return this.waitFor({
							searchOpenDialogs: !!bInShowValues,
							controlType: "sap.m.Slider",
							success: function(aControl){
								const oSlider = aControl[0];
								this.waitFor({
									controlType: "sap.ui.mdc.FilterField",
									matchers: new Descendant(oSlider),
									actions: function() {
										oSlider.setValue(iValue);
									}
								});
							},
							errorMessage: "The action could not be performed."
						});
					}

					if (bInShowValues) {
						return waitForOpenShowValues.call(this, {
							success: function () {
								fnChangeSliderValue.call(this);
							}
						});
					}

					return fnChangeSliderValue.call(this);
				},
				iChangeTheSegementedButtonValueInTheFilterField: function(sValue, bInShowValues) {
					function fnChangeSegmentedButtonValue() {
						return this.waitFor({
							searchOpenDialogs: !!bInShowValues,
							controlType: "sap.m.SegmentedButton",
							success: function(aControl){
								const oSegmentedButton = bInShowValues && aControl.length > 1 ? aControl[1] : aControl[0];
								this.waitFor({
									controlType: "sap.ui.mdc.FilterField",
									matchers: new Descendant(oSegmentedButton),
									success: function() {
										this.waitFor({
											controlType: "sap.m.Button",
											matchers: [
												new Ancestor(oSegmentedButton),
												new PropertyStrictEquals({
													name: "text",
													value: sValue
												})
											],
											actions: new Press()
										});
									}
								});
							},
							errorMessage: "The action could not be performed."
						});
					}

					if (bInShowValues) {
						return waitForOpenShowValues.call(this, {
							success: function () {
								fnChangeSegmentedButtonValue.call(this);
							}
						});
					}

					return fnChangeSegmentedButtonValue.call(this);
				},
				iEnterTextOnTheMultiInputFilterField: function(sValue, bInShowValues) {
					function fnChangeMultiInputValue() {
						return this.waitFor({
							searchOpenDialogs: !!bInShowValues,
							controlType: "sap.m.MultiInput",
							success: function(aControl){
								const oMultiInput = aControl[0];
								this.waitFor({
									controlType: "sap.ui.mdc.FilterField",
									matchers: new Descendant(oMultiInput),
									actions: new EnterText({ text: sValue })
								});
							},
							errorMessage: "The action could not be performed."
						});
					}

					if (bInShowValues) {
						return waitForOpenShowValues.call(this, {
							success: function () {
								fnChangeMultiInputValue.call(this);
							}
						});
					}

					return fnChangeMultiInputValue.call(this);

				},
				iPressKeyOnTheMultiInputFilterField: function(oKeyCode, bInShowValues) {
					function fnPressKeyOnMultiInput() {
						return this.waitFor({
							searchOpenDialogs: !!bInShowValues,
							controlType: "sap.m.MultiInput",
							success: function(aControl){
								const oMultiInput = aControl[0];
								this.waitFor({
									controlType: "sap.ui.mdc.FilterField",
									matchers: new Descendant(oMultiInput),
									actions: () => {
										oMultiInput.focus();
										new TriggerEvent({event: "keydown", payload: {which: oKeyCode, keyCode: oKeyCode}}).executeOn(oMultiInput); // doesnt work with focusdomref
										Opa5.assert.ok(oMultiInput, "Key '" + oKeyCode + "' pressed on MultiInput '" + oMultiInput.getId() + "'");
									}
								});
							},
							errorMessage: "The action could not be performed."
						});
					}

					if (bInShowValues) {
						return waitForOpenShowValues.call(this, {
							success: function () {
								fnPressKeyOnMultiInput.call(this);
							}
						});
					}

					return fnPressKeyOnMultiInput.call(this);
				}
			},
			assertions: {
				iShouldSeeACodeEditorWithContent: function(sContent, sIdentifier) {
					return this.waitFor({
						controlType: "sap.ui.codeeditor.CodeEditor",
						id: sIdentifier,
						success: function (aControl) {
							const oCodeEditor = Array.isArray(aControl) ? aControl[0] : aControl;
							Opa5.assert.ok(true, "Found the code editor");
							const sValue = oCodeEditor.getValue();
							Opa5.assert.ok(sValue == sContent, "Code editor content is correct");
						},
						errorMessage: "The code editor was not found."
					});
				},
				iShouldSeeAFilterFieldWithCustomControl: function(sControl) {
					return this.waitFor({
						searchOpenDialogs: false,
						controlType: sControl,
						success: function(aControl){
							this.waitFor({
								controlType: "sap.ui.mdc.FilterField",
								matchers: new Descendant(aControl[0]),
								success: function(aFilterFields) {
									Opa5.assert.ok(aFilterFields.length, `Found Control ${sControl} in FilterField`);
								}
							});
						},
						errorMessage: "The slider was not found."
					});
				}
			}
		}
	});
});