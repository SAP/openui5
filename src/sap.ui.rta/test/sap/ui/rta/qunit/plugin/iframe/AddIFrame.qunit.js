/* global QUnit */

sap.ui.define([
	"sap/ui/fl/Utils",
	"sap/ui/layout/VerticalLayout",
	"sap/ui/dt/DesignTime",
	"sap/ui/dt/Util",
	"sap/ui/rta/command/CommandFactory",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/fl/registry/ChangeRegistry",
	"sap/uxap/ObjectPageLayout",
	"sap/uxap/ObjectPageSection",
	"sap/uxap/ObjectPageSubSection",
	"sap/ui/rta/plugin/iframe/AddIFrame",
	"sap/ui/rta/plugin/iframe/AddIFrameDialog",
	"sap/ui/thirdparty/sinon-4",
	"sap/base/util/includes",
	"sap/base/util/uid",
	"sap/m/Button"
],
function (
	Utils,
	VerticalLayout,
	DesignTime,
	DtUtil,
	CommandFactory,
	OverlayRegistry,
	ChangeRegistry,
	ObjectPageLayout,
	ObjectPageSection,
	ObjectPageSubSection,
	AddIFramePlugin,
	AddIFrameDialog,
	sinon,
	includes,
	uid,
	Button
) {
	"use strict";

	var TEST_URL = "http://www.sap.com";
	var viewContent = '<mvc:View xmlns:mvc="sap.ui.core.mvc">' + '</mvc:View>';

	var oMockedViewWithStableId = sap.ui.xmlview({
		id: "mockview",
		viewContent: viewContent
	});

	var oMockedComponent = {
		getLocalId: function () {
			return undefined;
		},
		getManifestEntry: function () {
			return {};
		},
		getMetadata: function () {
			return {
				getName: function () {
					return "someName";
				}
			};
		},
		getManifest: function () {
			return {
				"sap.app": {
					applicationVersion: {
						version: "1.2.3"
					}
				}
			};
		},
		getModel: function () {}
	};

	var sandbox = sinon.sandbox.create();

	QUnit.module("Given a designTime and addIFrame plugin are instantiated for an ObjectPageLayout", {
		beforeEach: function(assert) {
			sandbox.stub(Utils, "getAppComponentForControl").returns(oMockedComponent);
			sandbox.stub(Utils, "getViewForControl").returns(oMockedViewWithStableId);
			sandbox.stub(AddIFrameDialog.prototype, "open").callsFake(function () {
				return Promise.resolve({
					frameUrl: TEST_URL
				});
			});

			var oChangeRegistry = ChangeRegistry.getInstance();
			return oChangeRegistry.registerControlsForChanges({
				"sap.uxap.ObjectPageLayout": {
					addIFrame: {
						completeChangeContent: function() {},
						applyChange: function() {},
						revertChange: function() {}
					}
				}
			})
			.then(function() {
				this.oAddIFrame = new AddIFramePlugin({
					commandFactory: new CommandFactory()
				});
				this.oObjectPageSection = new ObjectPageSection(oMockedViewWithStableId.createId("section"), {
					title: "section title",
					subSections: [
						new ObjectPageSubSection("subSection", {
							title: "sub section title",
							blocks: [new VerticalLayout()]
						})
					]
				});
				this.oObjectPageLayout = new ObjectPageLayout(oMockedViewWithStableId.createId("opl"), {
					sections: [this.oObjectPageSection]
				});
				this.oButton = new Button(oMockedViewWithStableId.createId("button"), {
					text: "buttonTitle"
				});
				this.oVerticalLayout = new VerticalLayout(oMockedViewWithStableId.createId("verticalLayout"), {
					content: [this.oObjectPageLayout, this.oButton]
				}).placeAt("qunit-fixture");

				sap.ui.getCore().applyChanges();

				this.sNewControlID = oMockedViewWithStableId.createId(uid());
				this.oNewObjectPageSection = new ObjectPageSection(this.sNewControlID);
				this.oObjectPageLayout.addSection(this.oNewObjectPageSection);

				this.oDesignTime = new DesignTime({
					rootElements: [this.oVerticalLayout],
					plugins: [this.oAddIFrame]
				});

				var done = assert.async();

				this.oDesignTime.attachEventOnce("synced", function() {
					this.oLayoutOverlay = OverlayRegistry.getOverlay(this.oVerticalLayout);
					this.oObjectPageLayoutOverlay = OverlayRegistry.getOverlay(this.oObjectPageLayout);
					this.oObjectPageSectionOverlay = OverlayRegistry.getOverlay(this.oObjectPageSection);
					this.oNewObjectPageSectionOverlay = OverlayRegistry.getOverlay(this.oNewObjectPageSection);
					this.oButtonOverlay = OverlayRegistry.getOverlay(this.oButton);

					done();
				}.bind(this));
			}.bind(this));
		},
		afterEach: function () {
			sandbox.restore();
			this.oVerticalLayout.destroy();
			this.oDesignTime.destroy();
		}

	}, function() {
		QUnit.test("when the getMenuItems() is called to check texts, with addIFrame defined on more than one aggregations", function(assert) {
			var sExpectedSectionText = "Section text";
			var sExpectedHeaderText = "Header text";

			var sSingularSectionText = "Singular section Text";
			var sPluralSectionText = "Plural section Text";
			var sSingularHeaderText = "Singular header Text";
			var sPluralHeaderText = "Plural header Text";
			var oRtaTextResources = sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta");
			sandbox.stub(oRtaTextResources, "getText")
				.withArgs("CTX_ADDIFRAME", sSingularSectionText).returns(sExpectedSectionText)
				.withArgs("CTX_ADDIFRAME", sSingularHeaderText).returns(sExpectedHeaderText);

			this.oObjectPageLayoutOverlay.setDesignTimeMetadata({
				aggregations: {
					sections: {
						childNames: {
							singular: sSingularSectionText,
							plural: sPluralSectionText
						},
						actions: {
							addIFrame: {
								changeType: "addIFrame"
							}
						}
					},
					header: {
						childNames: {
							singular: sSingularHeaderText,
							plural: sPluralHeaderText
						},
						actions: {
							addIFrame: {
								changeType: "addIFrame"
							}
						}
					}
				}
			});

			var aMenuItems = this.oAddIFrame.getMenuItems([this.oObjectPageLayoutOverlay]);
			var aExpectedTexts = [sExpectedHeaderText, sExpectedSectionText];

			var bAggregationTextsValid = aMenuItems.every(function(oMenuItem) {
				var iIndex = aExpectedTexts.indexOf(oMenuItem.text(this.oObjectPageLayoutOverlay));
				if (iIndex > -1) {
					aExpectedTexts.splice(iIndex, 1);
					return true;
				}
			}.bind(this));

			assert.ok(bAggregationTextsValid);
		});

		QUnit.test("when an overlay has no addIFrame action designTimeMetadata", function(assert) {
			this.oObjectPageLayoutOverlay.setDesignTimeMetadata({});
			this.oAddIFrame.deregisterElementOverlay(this.oObjectPageLayoutOverlay);
			this.oAddIFrame.registerElementOverlay(this.oObjectPageLayoutOverlay);

			return DtUtil.waitForSynced(this.oDesignTime)()
			.then(function() {
				assert.strictEqual(this.oAddIFrame.isAvailable(false, [this.oObjectPageLayoutOverlay]), false, "then isAvailable is called and it returns false");
				assert.strictEqual(this.oAddIFrame.isEnabled("dummyAggregation", [this.oObjectPageLayoutOverlay]), false, "then isEnabled is called and it returns false");
				return this.oAddIFrame._isEditableCheck(this.oObjectPageLayoutOverlay, false);
			}.bind(this))
			.then(function(bIsEditable) {
				assert.notOk(bIsEditable, "then the overlay is not editable");
			});
		});

		QUnit.test("when an overlay has addIFrame action in designTimeMetadata, but has no isEnabled property defined", function(assert) {
			this.oObjectPageLayoutOverlay.setDesignTimeMetadata({
				aggregations: {
					sections: {
						actions: {
							addIFrame: {
								changeType: "addIFrame"
							}
						}
					}
				}
			});
			this.oAddIFrame.deregisterElementOverlay(this.oObjectPageLayoutOverlay);
			this.oAddIFrame.registerElementOverlay(this.oObjectPageLayoutOverlay);

			return DtUtil.waitForSynced(this.oDesignTime)()
			.then(function() {
				assert.strictEqual(this.oAddIFrame.isAvailable(false, [this.oObjectPageLayoutOverlay]), true, "then isAvailable is called and it returns true");
				assert.strictEqual(this.oAddIFrame.isEnabled("sections", [this.oObjectPageLayoutOverlay]), true, "then isEnabled is called and it returns true");
				return this.oAddIFrame._isEditableCheck(this.oObjectPageLayoutOverlay, false);
			}.bind(this))
			.then(function(bIsEditable) {
				assert.ok(bIsEditable, "then the overlay is editable");
			});
		});

		QUnit.test("when an overlay has addIFrame action designTime metadata, has no changeType and isEnabled property is true", function(assert) {
			this.oObjectPageLayoutOverlay.setDesignTimeMetadata({
				aggregations: {
					sections: {
						actions: {
							addIFrame: {
								isEnabled: true
							}
						}
					}
				}
			});
			this.oAddIFrame.deregisterElementOverlay(this.oObjectPageLayoutOverlay);
			this.oAddIFrame.registerElementOverlay(this.oObjectPageLayoutOverlay);

			return DtUtil.waitForSynced(this.oDesignTime)()
			.then(function() {
				assert.strictEqual(this.oAddIFrame.isAvailable(false, [this.oObjectPageLayoutOverlay]), false, "then isAvailable is called and then it returns false");
				assert.strictEqual(this.oAddIFrame.isEnabled("sections", [this.oObjectPageLayoutOverlay]), true, "then isEnabled is called and then it returns correct value");
				return this.oAddIFrame._isEditableCheck(this.oObjectPageLayoutOverlay, false);
			}.bind(this))
			.then(function(bIsEditable) {
				assert.notOk(bIsEditable, "then the overlay is not editable");
			});
		});

		QUnit.test("when an overlay has addIFrame action on a responsible element", function(assert) {
			assert.expect(9);
			var sSingularText = "Singular Text";
			var sPluralText = "Plural Text";
			this.oObjectPageLayoutOverlay.setDesignTimeMetadata({
				aggregations: {
					sections: {
						childNames: {
							singular: sSingularText,
							plural: sPluralText
						},
						actions: {
							addIFrame: {
								changeType: "addIFrame"
							}
						}
					}
				}
			});

			var sExpectedText = "Section text";
			var oRtaTextResources = sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta");
			sandbox.stub(oRtaTextResources, "getText").withArgs("CTX_ADDIFRAME", sSingularText).returns(sExpectedText);

			this.oButtonOverlay.setDesignTimeMetadata({
				actions: {
					getResponsibleElement: function(oElement) {
						if (oElement === this.oButton) {
							return this.oObjectPageSection;
						}
					}.bind(this),
					actionsFromResponsibleElement: ["addIFrame"]
				}
			});

			this.oAddIFrame.deregisterElementOverlay(this.oButtonOverlay);
			this.oAddIFrame.registerElementOverlay(this.oButtonOverlay);

			function checkMenuItemWhenActionAvailable(oPlugin, oSourceOverlay, oResponsibleElementOverlay) {
				var aMenuItems = oPlugin.getMenuItems([oSourceOverlay]);
				assert.equal(aMenuItems.length, 1, "then one menu item was returned when the action is available on the responsible element overlay");

				assert.strictEqual(aMenuItems[0].enabled([oSourceOverlay]), true, "then the menu item is enabled");
				assert.strictEqual(typeof aMenuItems[0].handler, "function", "then menu item handler is a function");
				assert.strictEqual(aMenuItems[0].text(oSourceOverlay), sExpectedText, "then menu item has the expected text");

				assert.equal(aMenuItems[0].id, "CTX_CREATE_SIBLING_IFRAME", "there the menu item is for a sibling");
				assert.deepEqual(aMenuItems[0].responsible[0], oResponsibleElementOverlay, "then the menu item contains the responsible element overlay");
			}

			return DtUtil.waitForSynced(this.oDesignTime)()
				.then(function() {
					assert.strictEqual(this.oAddIFrame.isAvailable(true, [this.oButtonOverlay]), true, "then isAvailable returns true as a sibling");
					assert.strictEqual(this.oAddIFrame.isAvailable(false, [this.oButtonOverlay]), false, "then isAvailable returns false when it's not a sibling");

					var bAvailable = true;
					sandbox.stub(this.oAddIFrame, "isAvailable").callsFake(function(bSibling, aElementOverlays) {
						if (bSibling === true && aElementOverlays[0] === this.oButtonOverlay) {
							return bAvailable;
						}
					}.bind(this));

					checkMenuItemWhenActionAvailable(this.oAddIFrame, this.oButtonOverlay, this.oObjectPageSectionOverlay);

					bAvailable = false;
					assert.equal(this.oAddIFrame.getMenuItems([this.oButtonOverlay]).length, 0, "then no menu item was returned when the action is not available on the responsible element overlay");
				}.bind(this));
		});

		QUnit.test("when an overlay has an addIFrame action, but its view has no stable ID", function(assert) {
			var oViewWithUnstableId = sap.ui.xmlview({
				viewContent: viewContent
			});
			Utils.getViewForControl.restore();
			sandbox.stub(Utils, "getViewForControl").returns(oViewWithUnstableId);

			this.oObjectPageLayoutOverlay.setDesignTimeMetadata({
				aggregations: {
					sections: {
						actions: {
							addIFrame: {
								changeType: "addIFrame"
							}
						}
					}
				}
			});
			this.oAddIFrame.deregisterElementOverlay(this.oObjectPageLayoutOverlay);
			this.oAddIFrame.registerElementOverlay(this.oObjectPageLayoutOverlay);

			return DtUtil.waitForSynced(this.oDesignTime)()
			.then(function() {
				assert.strictEqual(this.oAddIFrame.isAvailable(false, [this.oObjectPageLayoutOverlay]), false, "then isAvailable is called and it returns false");
				assert.strictEqual(this.oAddIFrame.isEnabled(true, [this.oObjectPageLayoutOverlay]), false, "then isEnabled is called and it returns true");
				return this.oAddIFrame._isEditableCheck(this.oObjectPageLayoutOverlay, false);
			}.bind(this))
			.then(function(bIsEditable) {
				assert.notOk(bIsEditable, "then the overlay is not editable");
			});
		});

		QUnit.test("when an overlay has an addIFrame action in designTimeMetadata, and isEnabled property is a function", function(assert) {
			assert.expect(27);
			this.oObjectPageLayoutOverlay.setDesignTimeMetadata({
				aggregations: {
					sections: {
						actions: {
							addIFrame: {
								changeType: "addIFrame",
								isEnabled: function (oElement) {
									return oElement.getMetadata().getName() === "sap.uxap.ObjectPageLayout";
								}
							}
						}
					}
				}
			});
			this.oAddIFrame.deregisterElementOverlay(this.oObjectPageLayoutOverlay);
			this.oAddIFrame.registerElementOverlay(this.oObjectPageLayoutOverlay);

			return DtUtil.waitForSynced(this.oDesignTime)()
				.then(function() {
					assert.strictEqual(this.oAddIFrame.isAvailable(false, [this.oObjectPageLayoutOverlay]), true, "then isAvailable is called and it returns true");
					assert.strictEqual(this.oAddIFrame.isEnabled("sections", [this.oObjectPageLayoutOverlay]), true, "then isEnabled is called and it returns correct value from function call");
					return this.oAddIFrame._isEditableCheck(this.oObjectPageLayoutOverlay, false);
				}.bind(this))
				.then(function(bIsEditable) {
					assert.ok(bIsEditable, "then the overlay is editable");

					var aOverlaySiblingRequests;
					var oCheckOverlay;
					var bIsAvailable = true;

					sandbox.stub(this.oAddIFrame, "isAvailable").callsFake(function(bOverlayIsSibling, aElementOverlays) {
						aOverlaySiblingRequests.push(bOverlayIsSibling); // Not assuming any order
						assert.deepEqual(aElementOverlays[0].getId(), oCheckOverlay.getId(), "the 'available' function calls isAvailable with the correct overlay");
						return bIsAvailable;
					});

					sandbox.stub(this.oAddIFrame, "isEnabled").callsFake(function(sAggregationName, aElementOverlays) {
						var sAggregationName;
						if (this.callCount === 1) {
							sAggregationName = "sections";
						}
						assert.strictEqual(sAggregationName, sAggregationName, "then enabled() was called with the correct aggregation");
						assert.strictEqual(aElementOverlays[0].getId(), oCheckOverlay.getId(), "then handler() was called with the correct overlay");
					}.bind(this.oAddIFrame.isEnabled));

					function getMenuItems(oOverlay) {
						aOverlaySiblingRequests = [];
						oCheckOverlay = oOverlay;
						var aResultMenuItems = this.oAddIFrame.getMenuItems([oOverlay]);
						assert.strictEqual(aOverlaySiblingRequests.length, 2, "the 'available' function was called twice");
						assert.ok(includes(aOverlaySiblingRequests, true), "the 'available' function was called twice with bOverlayIsSibling=true");
						assert.ok(includes(aOverlaySiblingRequests, false), "the 'available' function was called twice with bOverlayIsSibling=false");
						return aResultMenuItems;
					}

					var aMenuItems = getMenuItems.call(this, this.oObjectPageLayoutOverlay);

					assert.strictEqual(aMenuItems.length, 1, "Only one menu item is returned");
					assert.equal(aMenuItems[0].id, "CTX_CREATE_CHILD_IFRAME_SECTIONS", "there is an entry for create child section");
					aMenuItems[0].handler([this.oObjectPageLayoutOverlay]);
					aMenuItems[0].enabled([this.oObjectPageLayoutOverlay]);

					aMenuItems = getMenuItems.call(this, this.oNewObjectPageSectionOverlay);
					assert.strictEqual(aMenuItems.length, 1, "Only one menu item is returned");
					assert.equal(aMenuItems[0].id, "CTX_CREATE_SIBLING_IFRAME", "there is an entry for create child section");
					aMenuItems[0].handler([this.oNewObjectPageSectionOverlay]);
					aMenuItems[0].enabled([this.oNewObjectPageSectionOverlay]);

					bIsAvailable = false;
					aMenuItems = getMenuItems.call(this, this.oObjectPageLayoutOverlay);
					assert.equal(aMenuItems.length, 0, "and if plugin is not available for the overlay, no menu items are returned");
				}.bind(this));
		});

		QUnit.test("when an overlay has an addIFrame action with changeOnRelevantContainer true, but its relevant container has no stable ID", function(assert) {
			this.oObjectPageLayoutOverlay.setDesignTimeMetadata({
				aggregations: {
					sections: {
						actions: {
							addIFrame: {
								changeType: "addIFrame",
								changeOnRelevantContainer: true
							}
						}
					}
				}
			});
			sandbox.stub(this.oAddIFrame, "hasStableId").callsFake(function(oOverlay) {
				if (oOverlay === this.oLayoutOverlay) {
					return false;
				}
				return true;
			}.bind(this));
			sandbox.stub(this.oObjectPageSectionOverlay, "getRelevantContainer").returns(this.oObjectPageSection);

			// changeOnRelevantContainer means the action has to be registered on the parent
			return ChangeRegistry.getInstance().registerControlsForChanges({
				"sap.ui.layout.VerticalLayout": {
					addIFrame: {
						completeChangeContent: function() {},
						applyChange: function() {},
						revertChange: function() {}
					}
				}
			}).then(function() {
				this.oAddIFrame.deregisterElementOverlay(this.oObjectPageLayoutOverlay);
				this.oAddIFrame.registerElementOverlay(this.oObjectPageLayoutOverlay);
			}.bind(this))
			.then(DtUtil.waitForSynced(this.oDesignTime)())
			.then(function() {
				return this.oAddIFrame._isEditableCheck(this.oObjectPageSectionOverlay, true);
			}.bind(this))
			.then(function(bIsEditable) {
				assert.notOk(bIsEditable, "then the overlay is not editable");
			});
		});

		QUnit.test("when a sibling overlay has an addIFrame action designTimeMetadata, but for another aggregation", function(assert) {
			this.oObjectPageLayoutOverlay.setDesignTimeMetadata({
				aggregations: {
					toolBar: {
						actions: {
							addIFrame: {
								changeType: "addToolbarContainer"
							}
						}
					}
				}
			});
			this.oAddIFrame.deregisterElementOverlay(this.oObjectPageLayoutOverlay);
			this.oAddIFrame.registerElementOverlay(this.oObjectPageLayoutOverlay);

			return this.oAddIFrame._isEditableCheck(this.oObjectPageLayoutOverlay, true)
			.then(function(bIsEditable) {
				assert.notOk(bIsEditable, "then the overlay is not editable");
			});
		});

		QUnit.test("when the designTimeMetadata has a getContainerIndex property and a function _determineIndex() is called", function(assert) {
			var vAction = {
				aggregationName: "sections",
				getIndex: function(oForm, oFormContainer) {
					var sAggregationName = vAction.aggregationName;
					var oMetadata = oForm.getMetadata();
					var oAggregation = oMetadata.getAggregation(sAggregationName);
					var sGetter = oAggregation._sGetter;
					var aContainers = oForm[sGetter]();
					var iIndex;
					if (oFormContainer) {
						iIndex = aContainers.indexOf(oFormContainer) + 1;
					} else {
						iIndex = aContainers.length;
					}
					return iIndex;
				}
			};

			assert.deepEqual(this.oAddIFrame._determineIndex(this.oObjectPageLayout, undefined, vAction.aggregationName, vAction.getIndex), 2, "then the correct index of the new added section is returned from the function call");
		});

		QUnit.test("when the designTimeMetadata has no getContainerIndex property given and a function _determineIndex() is called", function(assert) {
			var vAction = {
				aggregationName: "sections",
				changeType: "addIFrame"
			};

			assert.deepEqual(this.oAddIFrame._determineIndex(this.oObjectPageLayout, undefined, vAction.aggregationName, undefined), 0, "then the default index calculation would start and returns the right index");
		});

		QUnit.test("when the designTimeMetadata has a getCreatedContainerId property and a function getCreatedContainerId() is called", function(assert) {
			var vAction = {
				getCreatedContainerId: function(sNewControlID) {
					return sNewControlID;
				}
			};

			assert.deepEqual(this.oAddIFrame.getCreatedContainerId(vAction, this.sNewControlID),
				this.oNewObjectPageSectionOverlay.getElement().getId(),
				"then the correct id is returned");
		});

		QUnit.test("when the designTimeMetadata has no getCreatedContainerId property and a function getCreatedContainerId() is called", function(assert) {
			var vAction = {
				changeType: "addIFrame"
			};

			assert.deepEqual(this.oAddIFrame.getCreatedContainerId(vAction, this.sNewControlID),
				this.oNewObjectPageSectionOverlay.getElement().getId(),
				"then the correct id is returned");
		});

		QUnit.test("when the the menu item handler is called with the parent overlay", function(assert) {
			var fnDone = assert.async();

			this.oObjectPageLayoutOverlay.setDesignTimeMetadata({
				aggregations: {
					sections: {
						childNames: {
							singular: "GROUP_CONTROL_NAME",
							plural: "GROUP_CONTROL_NAME_PLURAL"
						},
						actions: {
							addIFrame: {
								changeType: "addIFrame"
							}
						}
					}
				}
			});
			this.oAddIFrame.deregisterElementOverlay(this.oObjectPageLayoutOverlay);
			this.oAddIFrame.registerElementOverlay(this.oObjectPageLayoutOverlay);

			this.oAddIFrame.attachEventOnce("elementModified", function(oEvent) {
				var oCommand = oEvent.getParameter("command");
				assert.ok(oCommand, "then command is available");
				assert.strictEqual(oCommand.getMetadata().getName(), "sap.ui.rta.command.AddIFrame", "and command is of the correct type");
				assert.notOk(oEvent.getParameter("action"), "then the action is not in the event");
				fnDone();
			});

			DtUtil.waitForSynced(this.oDesignTime)()
				.then(function () {
					var oMenuItem = this.oAddIFrame.getMenuItems([this.oObjectPageLayoutOverlay])[0];
					oMenuItem.handler([this.oObjectPageLayoutOverlay]);
				}.bind(this));
		});

		QUnit.test("when the the menu item handler is called with the sibling overlay", function(assert) {
			var fnDone = assert.async();

			this.oObjectPageLayoutOverlay.setDesignTimeMetadata({
				aggregations: {
					sections: {
						childNames: {
							singular: "GROUP_CONTROL_NAME",
							plural: "GROUP_CONTROL_NAME_PLURAL"
						},
						actions: {
							addIFrame: {
								changeType: "addIFrame",
								getCreatedContainerId: function() {}
							}
						}
					}
				}
			});

			this.oAddIFrame.attachEventOnce("elementModified", function (oEvent) {
				var oCommand = oEvent.getParameter("command");
				assert.ok(oCommand, "then command is available");
				assert.strictEqual(oCommand.getMetadata().getName(), "sap.ui.rta.command.AddIFrame", "and command is of the correct type");
				assert.ok(oEvent.getParameter("action"), "then the action is in the event");
				assert.deepEqual(oCommand.getIndex(), 1, "then the correct index is in the command");
				fnDone();
			});

			this.oAddIFrame.deregisterElementOverlay(this.oObjectPageSectionOverlay);
			this.oAddIFrame.registerElementOverlay(this.oObjectPageSectionOverlay);

			DtUtil.waitForSynced(this.oDesignTime)()
				.then(function () {
					var oMenuItem = this.oAddIFrame.getMenuItems([this.oObjectPageSectionOverlay])[0];
					oMenuItem.handler([this.oObjectPageSectionOverlay]);
				}.bind(this));
		});
	});

	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});
});
