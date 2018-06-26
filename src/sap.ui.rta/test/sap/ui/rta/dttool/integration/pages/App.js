sap.ui.define([
	'sap/ui/test/Opa5',
	'sap/ui/test/actions/Press',
	'sap/ui/test/actions/EnterText',
	'sap/ui/test/matchers/Properties',
	'sap/ui/test/matchers/AggregationLengthEquals',
	'sap/ui/test/matchers/AggregationContainsPropertyEqual',
	'sap/ui/rta/dttool/integration/pages/Common'
], function(Opa5, Press, EnterText, Properties, AggregationLengthEquals, AggregationContainsPropertyEqual, Common) {
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
						id : "Tree",
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
						id : "__item0-__component0---app--Tree-8",
						actions : new Press(),
						errorMessage : "Couldn't find control with id __item0-__component0---app--Tree-8"
					});
				}
			},
			assertions : {
				thePaletteShouldHaveTheGivenNumberOfGroups : function (iNumberOfPaletteGroups) {
					return this.waitFor({
						id : "palette",
						viewName : "App",
						matchers : new AggregationLengthEquals({
							name : "items",
							length : iNumberOfPaletteGroups
						}),
						success : function () {
							Opa5.assert.ok(true, "The palette has " + iNumberOfPaletteGroups + " groups.");
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

							Opa5.assert.ok(bControlAdded, "The control was added to the palette.");
						},
						errorMessage : "Couldn't find control with id palette"
					});
				},
				theHashWasChanged : function () {
					return this.waitFor({
						id : "Tree",
						viewName : "App",
						success : function () {
							Opa5.assert.ok(true, "The hash has changed.");
						}
					});
				},
				theCorrectOverlayIsSelected : function (sId) {
					return this.waitFor({
						id : "Tree",
						viewName : "App",
						matchers : new AggregationLengthEquals({
							name : "items",
							length : 12
						}),
						success : function () {
							var oOverlay = sap.ui.getCore().byId(sId);
							Opa5.assert.ok(oOverlay.getSelected(), "The correct overlay is selected.");
						}
					});
				}
			}
		}
	});
});