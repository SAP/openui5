sap.ui.define([
	'sap/ui/test/Opa5',
	'sap/ui/test/actions/Press',
	'sap/ui/test/actions/EnterText',
	'sap/ui/test/matchers/Properties',
	'sap/ui/test/matchers/AggregationLengthEquals',
	'sap/ui/test/matchers/AggregationContainsPropertyEqual',
	'sap/ui/rta/dttool/integration/pages/Common'
], function(
	Opa5,
	Press,
	EnterText,
	Properties,
	AggregationLengthEquals,
	AggregationContainsPropertyEqual,
	Common
) {
	'use strict';

	Opa5.createPageObjects({
		onTheAppView : {
			baseClass : Common,
			actions : {

				iClickTheAddControlButton : function () {
					return this.waitFor({
						id : "addControlButton",
						viewName : "App",
						actions : new Press(),
						errorMessage : "Couldn't find control with id addControlButton"
					});
				},

				/*
				Use this when you want to test to change Properties which have a Switch as Control
				iIndex is the element in the Dropdown
				 */
				iClickTheSwitchForThePassedPropertyNameAndClickThePassedIndex : function(sProperty, iIndex) {
					return this.waitFor({
						controlType: "sap.ui.rta.dttool.controls.DTToolListItem",
						matchers: [
							new Properties({
								propertyName: sProperty
							})
						],
						actions: function(oControl) {
							return new Press().executeOn(oControl.getContent()[0]);
						},
						success : function (oControl) {
							return this.waitFor({
								actions: function() {
									return new Press().executeOn(oControl[0].getContent()[0].getItems()[iIndex]);
								}
							});
						},
						errorMessage: "Was not able to find " + this.controlType + " with Property " + sProperty + " or given Index " + iIndex
					});
				},

				iClickOnControlWithId : function (id) {
					return this.waitFor({
						id : id,
						viewName : "App",
						actions : new Press(),
						errorMessage : "Couldn't find control with id " + id
					});
				},
				iEnterAModulePathIntoTheInput : function (sModulePath) {
					return this.waitFor({
						id : "addDialogInput",
						actions : new EnterText({
							text : sModulePath
						}),
						errorMessage : "Couldn't find control with id addDialogInput"
					});
				},
				iPressTheAddButton : function (sModulePath) {
					return this.waitFor({
						id : "addControlButton",
						actions : new Press(),
						errorMessage : "Couldn't find control with id addControlButton"
					});
				},
				iExpandTheOutlineByNLevels : function (iLevels, aLengths, aIndexes) {
					return this.waitFor({
						id : "__component0---app--Tree",
						viewName : "App",
						matchers : new AggregationLengthEquals({
							name : "items",
							length : aLengths.shift()
						}),
						success : function (oTree) {
							if (iLevels > 0) {
								oTree.onItemExpanderPressed(oTree.getItems()[aIndexes.shift()], true);
								this.and.iExpandTheOutlineByNLevels(iLevels - 1, aLengths, aIndexes);
							}
						},
						errorMessage : "Couldn't find control with id Tree"
					});
				},
				iChangeTheHashToTheSwitchSample : function () {
					return this.waitFor({
						success : function () {
							Opa5.getHashChanger().setHash("/sample/sap.m.sample.Switch");
						}
					});
				},
				iSelectTheNthTreeItem : function (iIndex) {
					return this.waitFor({
						id : "__item0-__component0---app--Tree-" + iIndex,
						actions : new Press(),
						errorMessage : "Couldn't find control with id __item0-__component0---app--Tree-" + iIndex
					});
				}
			},
			assertions : {
				thePassedPropertyShouldBeDisplayedInPropertyPanel: function(sProperty) {
					return this.waitFor({
						controlType: "sap.ui.rta.dttool.controls.DTToolListItem",
						matchers: [
							new Properties({
								label: sProperty
							})
						],
						success: function (oListItem) {
							Opa5.assert.ok(true, "Was able to find " + oListItem + " with given Property: " + sProperty);
						}
					});

				},
				thePassedPropertyInPropertyPanelItemHasContent: function(sProperty) {
					return this.waitFor({
						controlType: "sap.ui.rta.dttool.controls.DTToolListItem",
						matchers: [
							new Properties({
								label: sProperty
							})
						],
						check: function(oListItem) {
							var oListItemContent = oListItem[0].getContent()[0];
							if (oListItemContent) {
								return true;
							}
						},
						success: function (oListItem) {
							Opa5.assert.ok(true, "Was able to find " + oListItem + " with Property " + sProperty + " and has content");
						}
					});

				},
				theSampleSelectShouldBeShown : function () {
					return this.waitFor({
						id : "__component0---app--sampleInput",
						viewName : "App",
						success : function () {
							Opa5.assert.ok(true, "sampleInput is displayed");
						},
						errorMessage : "Couldn't find control with id sampleInput"
					});
				},
				thePropertyPanelToolbarShouldDisplayTheCorrectLabel : function (sControlName) {
					return this.waitFor({
						id : "__title5",
						matchers : function(oTitle){
							return oTitle.getText().indexOf(sControlName) >= 0;
						},
						success : function () {
							Opa5.assert.ok(true, "Selected control displays the correct title: " + sControlName);
						},
						errorMessage : sControlName + " is not part of the property panel title"
					});
				},
				thePaletteShouldHaveTheGivenNumberOfGroups : function (iNumberOfPaletteGroups) {
					return this.waitFor({
						id : "palette",
						viewName : "App",
						matchers : new AggregationLengthEquals({
								name : "items",
							length : iNumberOfPaletteGroups
						}),
						success : function () {
							Opa5.assert.ok(true, "Palette has " + iNumberOfPaletteGroups + " groups.");
						},
						errorMessage : "Couldn't find control with id palette"
					});
				},
				theControlWasAddedToThePalette : function () {
					return this.waitFor({
						id : "palette",
						viewName : "App",
						matchers : new AggregationLengthEquals({
							name : "items",
							length : 8
						}),
						success : function (oPalette) {

							var bControlAdded = oPalette.getItems().some(function (oItem) {
								if (oItem.getContent()[0].getHeaderToolbar().getContent()[0].getText() === "action") {

									return oItem.getContent()[0].getContent()[0].getItems().some(function (oItem) {
										if (oItem.getCells()[1].getText() === "Custom Button") {
											return true;
										}
									});
								}
							});

							Opa5.assert.ok(bControlAdded, "Control was added to the palette.");
						},
						errorMessage : "Couldn't find control with id palette"
					});
				},
				theHashWasChanged : function () {
					return this.waitFor({
						id : "Tree",
						viewName : "App",
						success : function () {
							Opa5.assert.ok(true, "Hash has changed.");
						}
					});
				},
				theCorrectOverlayIsSelected : function (sId) {
					return this.waitFor({
						id: "__component0---app--theIFrame",
						matchers : function(){
							var oElement = jQuery("#__component0---app--theIFrame").contents().find("#" + sId);
							return oElement.hasClass( "sapUiDtOverlaySelected" );
						},
						success : function () {
							Opa5.assert.ok(true, sId + " has Class sapUiDtOverlaySelected (is selected)");
						},
						errorMessage : sId + " doesn't have Class sapUiDtOverlaySelected (is not selected)"
					});
				}
			}
		}
	});
});