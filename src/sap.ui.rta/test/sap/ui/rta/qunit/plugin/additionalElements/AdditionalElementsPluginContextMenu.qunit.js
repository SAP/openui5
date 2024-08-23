/* global QUnit */

sap.ui.define([
	"sap/ui/rta/plugin/additionalElements/AdditionalElementsPlugin",
	"sap/ui/rta/plugin/additionalElements/AdditionalElementsAnalyzer",
	"sap/ui/rta/plugin/additionalElements/AddElementsDialog",
	"sap/ui/rta/plugin/additionalElements/AdditionalElementsUtils",
	"sap/ui/rta/plugin/additionalElements/ActionExtractor",
	"sap/ui/rta/command/CommandFactory",
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/core/Lib"
], function(
	AdditionalElementsPlugin,
	AdditionalElementsAnalyzer,
	AddElementsDialog,
	AdditionalElementsUtils,
	ActionExtractor,
	CommandFactory,
	sinon,
	Lib
) {
	"use strict";

	var sandbox = sinon.createSandbox();

	/**
	 * Tests related to the context menu items
	 * created by the AdditionalElements Plugin
	 */

	QUnit.module("Given the method 'getMenuItems' is called on the AdditionalElements Plugin", {
		beforeEach() {
			this.oDialog = new AddElementsDialog();

			this.oPlugin = new AdditionalElementsPlugin({
				analyzer: AdditionalElementsAnalyzer,
				dialog: this.oDialog,
				commandFactory: new CommandFactory()
			});

			this.oDummySelectedOverlay = "DummySelectedOverlay";
		},
		afterEach() {
			this.oDialog.destroy();
			this.oPlugin.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when there are only siblings", function(assert) {
			var sExpectedContextMenuText = "CONTEXT_MENU_TEXT";
			var iExpectedRank = 20;
			var sExpectedIcon = "sap-icon://add";
			var sAggregationName = "DummyAggregation";
			var oDummyOverlay = "DummyOverlay";

			sandbox.stub(AdditionalElementsUtils, "getParents").returns({
				responsibleElementOverlay: {
					getParentAggregationOverlay() {
						return {
							getAggregationName() {
								return sAggregationName;
							}
						};
					}
				}
			});

			var aElementOverlays = [oDummyOverlay];
			var aSelectedOverlays = ["DummySelectedOverlay"];

			// "getAllElements" returns only elements for the call with isSibling = true
			sandbox.stub(this.oPlugin, "getAllElements").callsFake(function(bIsSibling) {
				var aElementsArray = [];
				if (bIsSibling) {
					aElementsArray = [{
						aggregation: sAggregationName,
						elements: [
							{elementId: "DummyElement"}
						]
					}];
				}
				return Promise.resolve(aElementsArray);
			});

			sandbox.stub(this.oPlugin, "isAvailable").returnsArg(1);

			var oIsEnabledStub = sandbox.stub(this.oPlugin, "isEnabled");

			sandbox.stub(this.oPlugin, "getContextMenuText").returns(sExpectedContextMenuText);
			sandbox.stub(this.oPlugin, "enhanceItemWithResponsibleElement").returnsArg(0);

			var oShowAvailableElementsStub = sandbox.stub(this.oPlugin, "showAvailableElements");

			return this.oPlugin.getMenuItems(aElementOverlays).then(function(aMenuItems) {
				assert.strictEqual(aMenuItems.length, 1, "then only one menu item is returned");
				var oMenuItem = aMenuItems[0];
				assert.strictEqual(oMenuItem.id, "CTX_ADD_ELEMENTS_AS_SIBLING", "then the entry is for sibling");
				assert.strictEqual(oMenuItem.text(), sExpectedContextMenuText, "then the expected text is returned");
				assert.strictEqual(oMenuItem.rank, iExpectedRank, "then the rank is correct");
				assert.strictEqual(oMenuItem.icon, sExpectedIcon, "then the icon is correct");
				oMenuItem.enabled(aSelectedOverlays);
				assert.ok(
					oIsEnabledStub.calledWith(aSelectedOverlays, true, sAggregationName),
					"isEnabled is called with the right parameters"
				);
				oMenuItem.handler(aSelectedOverlays);
				assert.ok(
					oShowAvailableElementsStub.calledWith(true, sAggregationName, aSelectedOverlays),
					"showAvailableElements is called with the right parameters"
				);
				assert.notOk(oMenuItem.submenu, "then the entry has no submenu");
			});
		});

		QUnit.test("when there are only children from the same aggregation", function(assert) {
			var sExpectedContextMenuText = "CONTEXT_MENU_TEXT";
			var iExpectedRank = 25;
			var sExpectedIcon = "sap-icon://add";
			var sAggregationName = "DummyAggregation";

			var oDummyOverlay = {
				getDesignTimeMetadata() {
					return {
						getAggregationDisplayName() {
							return {
								singular: sExpectedContextMenuText
							};
						},
						getResponsibleElement() {
							return;
						}
					};
				},
				getElement() {
					return "DummyElement";
				}
			};

			var aElementOverlays = [oDummyOverlay];
			var aSelectedOverlays = ["DummySelectedOverlay"];

			// "getAllElements" returns only elements for the call with isSibling = false
			sandbox.stub(this.oPlugin, "getAllElements").callsFake(function(bIsSibling) {
				var aElementsArray = [];
				if (!bIsSibling) {
					aElementsArray = [
						{
							aggregation: sAggregationName,
							elements: [
								{elementId: "DummyElement"},
								{elementId: "DummyElement2"}
							]
						}
					];
				}
				return Promise.resolve(aElementsArray);
			});

			sandbox.stub(this.oPlugin, "isAvailable").callsFake(function(aOverlays, bIsSibling) {
				return !bIsSibling;
			});

			var oIsEnabledStub = sandbox.stub(this.oPlugin, "isEnabled");

			sandbox.stub(this.oPlugin, "getContextMenuText").returns(sExpectedContextMenuText);
			sandbox.stub(this.oPlugin, "enhanceItemWithResponsibleElement").returnsArg(0);

			var oShowAvailableElementsStub = sandbox.stub(this.oPlugin, "showAvailableElements");

			return this.oPlugin.getMenuItems(aElementOverlays).then(function(aMenuItems) {
				assert.strictEqual(aMenuItems.length, 1, "then only one menu item is returned");
				var oMenuItem = aMenuItems[0];
				assert.strictEqual(oMenuItem.id, "CTX_ADD_ELEMENTS_AS_CHILD", "then the entry is for child");
				assert.strictEqual(oMenuItem.text(), sExpectedContextMenuText, "then the expected text is returned");
				assert.strictEqual(oMenuItem.rank, iExpectedRank, "then the rank is correct");
				assert.strictEqual(oMenuItem.icon, sExpectedIcon, "then the icon is correct");
				oMenuItem.enabled(aSelectedOverlays);
				assert.ok(
					oIsEnabledStub.calledWith(aSelectedOverlays, false, sAggregationName),
					"isEnabled is called with the correct parameters"
				);
				oMenuItem.handler(aSelectedOverlays);
				assert.ok(
					oShowAvailableElementsStub.calledWith(false, sAggregationName, aSelectedOverlays),
					"showAvailableElements is called with the correct parameters"
				);
				assert.notOk(oMenuItem.submenu, "then the entry has no submenu");
			});
		});

		QUnit.test("when there are children from the same aggregation and siblings", function(assert) {
			var sExpectedContextMenuText = "Add to...";
			var sExpectedContextMenuTextSibling = "CONTEXT_MENU_TEXT_SIBLING";
			var sExpectedContextMenuTextChild = "CONTEXT_MENU_TEXT_CHILD";
			var iExpectedRank = 30;
			var sExpectedIcon = "sap-icon://add";
			var sChildAggregationName = "ChildAggregationName";
			var sSiblingAggregationName = "SiblingAggregationName";

			var oDummyOverlay = {
				getParentElementOverlay() {
					return {
						getDesignTimeMetadata() {
							return {
								getAggregationDisplayName() {
									return {
										plural: sExpectedContextMenuTextSibling
									};
								},
								getResponsibleElement() {
									return;
								}
							};
						},
						getElement() {
							return "DummyElement";
						}
					};
				},
				getDesignTimeMetadata() {
					return {
						getAggregationDisplayName() {
							return {
								plural: sExpectedContextMenuTextChild
							};
						},
						getResponsibleElement() {
							return;
						}
					};
				},
				getElement() {
					return "DummyElement";
				}
			};

			var aElementOverlays = [oDummyOverlay];
			var aSelectedOverlays = ["DummySelectedOverlay"];

			// "getAllElements" returns elements for the call with isSibling = false and true
			sandbox.stub(this.oPlugin, "getAllElements").callsFake(function(bIsSibling) {
				var aElementsArray = [];
				if (bIsSibling) {
					aElementsArray = [{
						aggregation: sSiblingAggregationName,
						elements: [
							{elementId: "DummySiblingElement"}
						]
					}];
				} else {
					aElementsArray = [{
						aggregation: sChildAggregationName,
						elements: [
							{elementId: "DummyChildElement"}
						]
					}];
				}
				return Promise.resolve(aElementsArray);
			});

			sandbox.stub(this.oPlugin, "isAvailable").returns(true);

			var oIsEnabledStub = sandbox.stub(this.oPlugin, "isEnabled");

			sandbox.stub(this.oPlugin, "enhanceItemWithResponsibleElement").returnsArg(0);

			var oShowAvailableElementsStub = sandbox.stub(this.oPlugin, "showAvailableElements");

			return this.oPlugin.getMenuItems(aElementOverlays).then(function(aMenuItems) {
				assert.strictEqual(aMenuItems.length, 1, "then only one menu item is returned");
				var oMenuItem = aMenuItems[0];
				assert.strictEqual(oMenuItem.id, "CTX_ADD_ELEMENTS_CHILD_AND_SIBLING", "then the entry is for sibling and child");
				assert.strictEqual(oMenuItem.text(), sExpectedContextMenuText, "then the expected text is returned");
				assert.strictEqual(oMenuItem.rank, iExpectedRank, "then the rank is correct");
				assert.strictEqual(oMenuItem.icon, sExpectedIcon, "then the icon is correct");
				assert.notOk(oMenuItem.handler, "then there is no handler assigned to the menu item (handlers are only on submenu)");
				assert.ok(oMenuItem.enabled, "then the menu item is enabled");
				assert.ok(oMenuItem.submenu, "then there is a submenu");
				var aSubMenuItems = oMenuItem.submenu;
				var oSubMenuItemChild = aSubMenuItems[0];
				assert.strictEqual(oSubMenuItemChild.id, "CTX_ADD_ELEMENTS_AS_CHILD_0", "then the first submenu entry id is for the child");
				assert.strictEqual(oSubMenuItemChild.text, sExpectedContextMenuTextChild, "then the aggregation name is the entry text");
				oSubMenuItemChild.enabled(aSelectedOverlays);
				assert.ok(
					oIsEnabledStub.calledWith(aSelectedOverlays, false, sChildAggregationName),
					"then isEnabled is called for children with the right parameters"
				);
				oSubMenuItemChild.handler(aSelectedOverlays);
				assert.ok(
					oShowAvailableElementsStub.calledWith(false, sChildAggregationName, aSelectedOverlays),
					"then showAvailableElements is called as handler for children"
				);
				var oSubMenuItemSibling = aSubMenuItems[1];
				assert.strictEqual(
					oSubMenuItemSibling.id,
					"CTX_ADD_ELEMENTS_AS_SIBLING_0",
					"then the second submenu entry id is for the child"
				);
				assert.strictEqual(
					oSubMenuItemSibling.text,
					sExpectedContextMenuTextSibling,
					"then the aggregation name is the entry text"
				);
				oSubMenuItemSibling.enabled(aSelectedOverlays);
				assert.ok(
					oIsEnabledStub.calledWith(aSelectedOverlays, true, sSiblingAggregationName),
					"then isEnabled is called for sibling with the right parameters"
				);
				oSubMenuItemSibling.handler(aSelectedOverlays);
				assert.ok(
					oShowAvailableElementsStub.calledWith(true, sSiblingAggregationName, aSelectedOverlays),
					"then showAvailableElements is called for sibling with the right parameters"
				);
			});
		});

		QUnit.test("when there are children from different aggregations", function(assert) {
			var sExpectedContextMenuText = "Add to...";
			var sExpectedContextMenuTextChild = "CONTEXT_MENU_TEXT_CHILD";
			var sFirstChildAggregationName = "childAggregationName";
			var sSecondChildAggregationName = "childAggregationName2";
			var iExpectedRank = 25;
			var sExpectedIcon = "sap-icon://add";

			var oDummyOverlay = {
				getDesignTimeMetadata() {
					return {
						getAggregationDisplayName() {
							return {
								plural: sExpectedContextMenuTextChild
							};
						},
						getResponsibleElement() {
							return;
						}
					};
				},
				getElement() {
					return "DummyElement";
				}
			};

			var aElementOverlays = [oDummyOverlay];
			var aSelectedOverlays = ["DummySelectedOverlay"];

			// "getAllElements" returns elements for the call with isSibling = false for different aggregations
			sandbox.stub(this.oPlugin, "getAllElements").callsFake(function(bIsSibling) {
				var aElementsArray = [];
				if (!bIsSibling) {
					aElementsArray = [{
						aggregation: sFirstChildAggregationName,
						elements: [
							{elementId: "DummyChildElement"}
						]
					}, {
						aggregation: sSecondChildAggregationName,
						elements: [
							{elementId: "DummyChildElement2"}
						]
					}];
				}
				return Promise.resolve(aElementsArray);
			});

			sandbox.stub(this.oPlugin, "isAvailable").callsFake(function(aOverlays, bIsSibling) {
				return !bIsSibling;
			});

			var oIsEnabledStub = sandbox.stub(this.oPlugin, "isEnabled");

			sandbox.stub(this.oPlugin, "enhanceItemWithResponsibleElement").returnsArg(0);

			var oShowAvailableElementsStub = sandbox.stub(this.oPlugin, "showAvailableElements");

			return this.oPlugin.getMenuItems(aElementOverlays).then(function(aMenuItems) {
				assert.strictEqual(aMenuItems.length, 1, "then only one menu item is returned");
				var oMenuItem = aMenuItems[0];
				assert.strictEqual(oMenuItem.id, "CTX_ADD_ELEMENTS_AS_CHILD", "then the entry is for sibling and child");
				assert.strictEqual(oMenuItem.text(), sExpectedContextMenuText, "then the expected text is returned");
				assert.strictEqual(oMenuItem.rank, iExpectedRank, "then the rank is correct");
				assert.strictEqual(oMenuItem.icon, sExpectedIcon, "then the icon is correct");
				assert.notOk(oMenuItem.handler, "then there is no handler assigned to the menu item (handlers are only on submenu)");
				assert.ok(oMenuItem.enabled, "then the menu item is enabled");
				assert.ok(oMenuItem.submenu, "then there is a submenu");
				var aSubMenuItems = oMenuItem.submenu;
				var oSubMenuItemChild = aSubMenuItems[0];
				assert.strictEqual(oSubMenuItemChild.id, "CTX_ADD_ELEMENTS_AS_CHILD_0", "then the first submenu entry id is for the child");
				assert.strictEqual(oSubMenuItemChild.text, sExpectedContextMenuTextChild, "then the aggregation name is the entry text");
				oSubMenuItemChild.enabled(aSelectedOverlays);
				assert.ok(
					oIsEnabledStub.calledWith(aSelectedOverlays, false, sFirstChildAggregationName),
					"then isEnabled is called with the right parameters"
				);
				oSubMenuItemChild.handler(aSelectedOverlays);
				assert.ok(
					oShowAvailableElementsStub.calledWith(false, sFirstChildAggregationName, aSelectedOverlays),
					"then showAvailableElements is called with the right parameters"
				);
				var oSubMenuItemChildSecondAggregation = aSubMenuItems[1];
				assert.strictEqual(
					oSubMenuItemChildSecondAggregation.id,
					"CTX_ADD_ELEMENTS_AS_CHILD_1", "then the second submenu entry id is for the child"
				);
				assert.strictEqual(
					oSubMenuItemChildSecondAggregation.text,
					sExpectedContextMenuTextChild,
					"then the aggregation name is the entry text"
				);
				oSubMenuItemChildSecondAggregation.enabled(aSelectedOverlays);
				assert.ok(
					oIsEnabledStub.calledWith(aSelectedOverlays, false, sSecondChildAggregationName),
					"then isEnabled is called with the right parameters"
				);
				oSubMenuItemChildSecondAggregation.handler(aSelectedOverlays);
				assert.ok(
					oShowAvailableElementsStub.calledWith(false, sSecondChildAggregationName, aSelectedOverlays),
					"then showAvailableElements is called with the right parameters"
				);
			});
		});

		QUnit.test("when there are children from multiple aggregations and siblings", function(assert) {
			var sExpectedContextMenuText = "Add to...";
			var sExpectedContextMenuTextSibling = "CONTEXT_MENU_TEXT_SIBLING";
			var sExpectedContextMenuTextChild = "CONTEXT_MENU_TEXT_CHILD";
			var sSiblingAggregationName = "SiblingAggregation";
			var sFirstChildAggregationName = "FirstChildAggregation";
			var sSecondChildAggregationName = "SecondChildAggregation";
			var iExpectedRank = 30;
			var sExpectedIcon = "sap-icon://add";

			var oDummyOverlay = {
				getParentElementOverlay() {
					return {
						getDesignTimeMetadata() {
							return {
								getAggregationDisplayName() {
									return {
										plural: sExpectedContextMenuTextSibling
									};
								}
							};
						},
						getElement() {
							return "DummyElement";
						}
					};
				},
				getDesignTimeMetadata() {
					return {
						getAggregationDisplayName() {
							return {
								plural: sExpectedContextMenuTextChild
							};
						},
						getResponsibleElement() {
							return;
						}
					};
				},
				getElement() {
					return "DummyElement";
				}
			};

			var aElementOverlays = [oDummyOverlay];
			var aSelectedOverlays = ["DummySelectedOverlay"];

			// "getAllElements" returns elements for siblings and multiple child aggregations
			sandbox.stub(this.oPlugin, "getAllElements").callsFake(function(bIsSibling) {
				var aElementsArray = [];
				if (bIsSibling) {
					aElementsArray = [{
						aggregation: sSiblingAggregationName,
						elements: [
							{elementId: "DummySiblingElement"}
						]
					}];
				} else {
					aElementsArray = [{
						aggregation: sFirstChildAggregationName,
						elements: [
							{elementId: "DummyChildElement"}
						]
					}, {
						aggregation: sSecondChildAggregationName,
						elements: [
							{elementId: "DummyChildElement2"}
						]
					}];
				}
				return Promise.resolve(aElementsArray);
			});

			sandbox.stub(this.oPlugin, "isAvailable").returns(true);
			var oIsEnabledStub = sandbox.stub(this.oPlugin, "isEnabled");

			sandbox.stub(this.oPlugin, "enhanceItemWithResponsibleElement").returnsArg(0);

			var oShowAvailableElementsStub = sandbox.stub(this.oPlugin, "showAvailableElements");

			return this.oPlugin.getMenuItems(aElementOverlays).then(function(aMenuItems) {
				assert.strictEqual(aMenuItems.length, 1, "then only one menu item is returned");
				var oMenuItem = aMenuItems[0];
				assert.strictEqual(oMenuItem.id, "CTX_ADD_ELEMENTS_CHILD_AND_SIBLING", "then the entry is for sibling and child");
				assert.strictEqual(oMenuItem.text(), sExpectedContextMenuText, "then the expected text is returned");
				assert.strictEqual(oMenuItem.rank, iExpectedRank, "then the rank is correct");
				assert.strictEqual(oMenuItem.icon, sExpectedIcon, "then the icon is correct");
				assert.notOk(oMenuItem.handler, "then there is no handler assigned to the menu item (handlers are only on submenu)");
				assert.ok(oMenuItem.enabled, "then the menu item is enabled");
				assert.ok(oMenuItem.submenu, "then there is a submenu");
				var aSubMenuItems = oMenuItem.submenu;
				var oSubMenuItemChild = aSubMenuItems[0];
				assert.strictEqual(
					oSubMenuItemChild.id,
					"CTX_ADD_ELEMENTS_AS_CHILD_0",
					"then the first submenu entry id is for the child of the first aggregation"
				);
				assert.strictEqual(oSubMenuItemChild.text, sExpectedContextMenuTextChild, "then the aggregation name is the entry text");
				oSubMenuItemChild.enabled(aSelectedOverlays);
				assert.ok(
					oIsEnabledStub.calledWith(aSelectedOverlays, false, sFirstChildAggregationName),
					"then isEnabled is called for the child aggregation"
				);
				oSubMenuItemChild.handler(aSelectedOverlays);
				assert.ok(
					oShowAvailableElementsStub.calledWith(false, sFirstChildAggregationName, aSelectedOverlays),
					"then showAvailableElements is called for the first child aggregation"
				);
				var oSubMenuItemChild2 = aSubMenuItems[1];
				assert.strictEqual(
					oSubMenuItemChild2.id,
					"CTX_ADD_ELEMENTS_AS_CHILD_1",
					"then the second submenu entry id is for the child of the second aggregation"
				);
				assert.strictEqual(oSubMenuItemChild2.text, sExpectedContextMenuTextChild, "then the aggregation name is the entry text");
				oSubMenuItemChild2.handler(aSelectedOverlays);
				assert.ok(
					oShowAvailableElementsStub.calledWith(false, sSecondChildAggregationName, aSelectedOverlays),
					"then showAvailableElements is called for the second child aggregation"
				);
				var oSubMenuItemSibling = aSubMenuItems[2];
				assert.strictEqual(
					oSubMenuItemSibling.id,
					"CTX_ADD_ELEMENTS_AS_SIBLING_0",
					"then the third submenu entry id is for the sibling"
				);
				assert.strictEqual(
					oSubMenuItemSibling.text,
					sExpectedContextMenuTextSibling,
					"then the aggregation name is the entry text"
				);
				oSubMenuItemSibling.enabled(aSelectedOverlays);
				assert.ok(
					oIsEnabledStub.calledWith(aSelectedOverlays, true, sSiblingAggregationName),
					"then isEnabled is called for the child aggregation"
				);
				oSubMenuItemSibling.handler(aSelectedOverlays);
				assert.ok(
					oShowAvailableElementsStub.calledWith(true, sSiblingAggregationName, aSelectedOverlays),
					"then showAvailableElements is called for the sibling aggregation"
				);
			});
		});

		QUnit.test("when there are no elements available but extension fields is allowed - sibling case", function(assert) {
			var sExpectedContextMenuText = "Expected Text";
			var oDummyOverlay = "DummyOverlay";

			sandbox.stub(AdditionalElementsUtils, "getParents").returns({
				responsibleElementOverlay: {
					getParentAggregationOverlay() {
						return {
							getAggregationName() {
								return "dummyAggregation";
							}
						};
					}
				},
				parent: "dummyParent"
			});

			var aElementOverlays = [oDummyOverlay];
			var aSelectedOverlays = ["DummySelectedOverlay"];

			// "getAllElements" returns no elements
			sandbox.stub(this.oPlugin, "getAllElements").returns([]);

			sandbox.stub(this.oPlugin, "isAvailable").callsFake(function(aOverlays, bIsSibling) {
				return bIsSibling;
			});
			sandbox.stub(this.oPlugin, "isEnabled").callsFake(function(aOverlays, bIsSibling) {
				return bIsSibling;
			});

			sandbox.stub(ActionExtractor, "getActionsOrUndef").returns({
				dummyAggregation: {
					action: "dummyAction"
				}
			});

			sandbox.stub(AdditionalElementsUtils, "getText").callsFake(function(sExpectedKey, mActions, sParent, bSingular) {
				assert.equal(sExpectedKey, "CTX_ADD_ELEMENTS", "getText called with right key");
				assert.equal(mActions.action, "dummyAction", "getText called with the right actions");
				assert.equal(sParent, "dummyParent", "getText called with the right parent");
				assert.ok(bSingular, "getText called with SINGULAR (true)");
				return sExpectedContextMenuText;
			});

			// Return the menu item
			sandbox.stub(this.oPlugin, "enhanceItemWithResponsibleElement").returnsArg(0);

			var oShowAvailableElementsStub = sandbox.stub(this.oPlugin, "showAvailableElements");

			return this.oPlugin.getMenuItems(aElementOverlays).then(function(aMenuItems) {
				assert.strictEqual(aMenuItems.length, 1, "then only one menu item is returned");
				var oMenuItem = aMenuItems[0];
				assert.strictEqual(oMenuItem.id, "CTX_ADD_ELEMENTS_AS_SIBLING", "then the entry is for sibling");
				assert.strictEqual(oMenuItem.text(), sExpectedContextMenuText, "then the expected text is returned");
				oMenuItem.handler(aSelectedOverlays);
				assert.ok(
					oShowAvailableElementsStub.calledWith(true, "dummyAggregation", aSelectedOverlays),
					"showAvailableElements is called with the right parameters"
				);
				assert.notOk(oMenuItem.submenu, "then the entry has no submenu");
			});
		});

		QUnit.test("when there are no elements available but extension fields is allowed - child case", function(assert) {
			var aElementOverlays = [{}];
			var aSelectedOverlays = ["DummySelectedOverlay"];
			var oTextResources = Lib.getResourceBundleFor("sap.ui.rta");
			var sExpectedContextMenuText = oTextResources.getText("CTX_ADD_ELEMENTS", [oTextResources.getText("MULTIPLE_CONTROL_NAME")]);

			// "getAllElements" returns no elements
			sandbox.stub(this.oPlugin, "getAllElements").returns([]);

			sandbox.stub(this.oPlugin, "isAvailable").callsFake(function(aOverlays, bIsSibling) {
				return !bIsSibling;
			});
			sandbox.stub(this.oPlugin, "isEnabled").callsFake(function(aOverlays, bIsSibling) {
				return !bIsSibling;
			});

			// Return the menu item
			sandbox.stub(this.oPlugin, "enhanceItemWithResponsibleElement").returnsArg(0);

			var oShowAvailableElementsStub = sandbox.stub(this.oPlugin, "showAvailableElements");

			return this.oPlugin.getMenuItems(aElementOverlays).then(function(aMenuItems) {
				assert.strictEqual(aMenuItems.length, 1, "then only one menu item is returned");
				var oMenuItem = aMenuItems[0];
				assert.strictEqual(oMenuItem.id, "CTX_ADD_ELEMENTS_AS_CHILD", "then the entry is for child");
				assert.strictEqual(oMenuItem.text(), sExpectedContextMenuText, "then the expected text is returned");
				oMenuItem.handler(aSelectedOverlays);
				assert.ok(
					oShowAvailableElementsStub.calledWith(false, "$$OnlyChildCustomField$$", aSelectedOverlays),
					"showAvailableElements is called with the right parameters"
				);
				assert.notOk(oMenuItem.submenu, "then the entry has no submenu");
			});
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});