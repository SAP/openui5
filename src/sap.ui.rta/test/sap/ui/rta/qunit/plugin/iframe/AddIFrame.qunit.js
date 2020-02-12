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
	"sap/ui/rta/plugin/iframe/AddIFrame",
	"sap/ui/rta/plugin/iframe/SettingsDialog",
	"sap/ui/thirdparty/sinon-4",
	"sap/base/util/includes"
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
	AddIFramePlugin,
	AddIFrameSettingsDialog,
	sinon,
	includes
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
				"sap.app" : {
					applicationVersion : {
						version : "1.2.3"
					}
				}
			};
		},
		getModel: function () {}
	};

	var sandbox = sinon.sandbox.create();

	QUnit.module("Given a designTime and addIFrame plugin are instantiated for an ObjectPageLayout", {
		beforeEach : function(assert) {
			sandbox.stub(Utils, "getAppComponentForControl").returns(oMockedComponent);
			sandbox.stub(Utils, "getViewForControl").returns(oMockedViewWithStableId);
			sandbox.stub(AddIFrameSettingsDialog.prototype, "open").callsFake(function () {
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
					commandFactory : new CommandFactory()
				});
				this.oObjectPageSection = new ObjectPageSection({
					title: "title"
				});
				this.oObjectPageLayout = new ObjectPageLayout(oMockedViewWithStableId.createId("opl"), {
					sections: [this.oObjectPageSection]
				});
				this.oVerticalLayout = new VerticalLayout(oMockedViewWithStableId.createId("verticalLayout"), {
					content : [this.oObjectPageLayout]
				}).placeAt("qunit-fixture");

				sap.ui.getCore().applyChanges();

				this.sNewControlID = oMockedViewWithStableId.createId(jQuery.sap.uid());
				this.oNewObjectPageSection = new ObjectPageSection(this.sNewControlID);
				this.oObjectPageLayout.addSection(this.oNewObjectPageSection);

				this.oDesignTime = new DesignTime({
					rootElements : [this.oVerticalLayout],
					plugins : [this.oAddIFrame]
				});

				var done = assert.async();

				this.oDesignTime.attachEventOnce("synced", function() {
					this.oLayoutOverlay = OverlayRegistry.getOverlay(this.oVerticalLayout);
					this.oObjectPageLayoutOverlay = OverlayRegistry.getOverlay(this.oObjectPageLayout);
					this.oObjectPageSectionOverlay = OverlayRegistry.getOverlay(this.oObjectPageSection);
					this.oNewObjectPageSectionOverlay = OverlayRegistry.getOverlay(this.oNewObjectPageSection);

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
		QUnit.test("when the designTimeMetadata has childNames for the container name (sections)", function(assert) {
			var sSectionName = sap.ui.getCore().getLibraryResourceBundle("sap.uxap").getText("SECTION_CONTROL_NAME");
			var sExpectedText = sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta").getText("CTX_ADDIFRAME", sSectionName);

			var sMenuItemText = this.oAddIFrame.getCreateMenuItemText({
				isSibling: false,
				action: {
					aggregation: "sections"
				}
			}, "CTX_ADDIFRAME", this.oObjectPageLayoutOverlay);

			assert.deepEqual(sMenuItemText, sExpectedText, "then the correct menu item text is returned");
		});

		QUnit.test("when the designTimeMetadata has childNames for the container name (header)", function(assert) {
			var sHeaderName = sap.ui.getCore().getLibraryResourceBundle("sap.uxap").getText("HEADER_CONTROL_NAME");
			var sExpectedText = sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta").getText("CTX_ADDIFRAME", sHeaderName);

			var sMenuItemText = this.oAddIFrame.getCreateMenuItemText({
				isSibling: false,
				action: {
					aggregation: "headerContent"
				}
			}, "CTX_ADDIFRAME", this.oObjectPageLayoutOverlay);

			assert.deepEqual(sMenuItemText, sExpectedText, "then the correct menu item text is returned");
		});

		QUnit.test("when an overlay has no addIFrame action designTime metadata", function(assert) {
			this.oObjectPageLayoutOverlay.setDesignTimeMetadata({});
			this.oAddIFrame.deregisterElementOverlay(this.oObjectPageLayoutOverlay);
			this.oAddIFrame.registerElementOverlay(this.oObjectPageLayoutOverlay);

			return DtUtil.waitForSynced(this.oDesignTime)()
			.then(function() {
				assert.strictEqual(this.oAddIFrame.isAvailable(false, [this.oObjectPageLayoutOverlay]), false, "then isAvailable is called and it returns false");
				assert.strictEqual(this.oAddIFrame.isEnabled(false, [this.oObjectPageLayoutOverlay]), false, "then isEnabled is called and it returns false");
				return this.oAddIFrame._isEditableCheck(this.oObjectPageLayoutOverlay, false);
			}.bind(this))
			.then(function(bIsEditable) {
				assert.notOk(bIsEditable, "then the overlay is not editable");
			});
		});

		QUnit.test("when an overlay has addIFrame action designTime metadata, but has no isEnabled property defined", function(assert) {
			this.oObjectPageLayoutOverlay.setDesignTimeMetadata({
				aggregations : {
					sections : {
						actions : {
							addIFrame : {
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
				assert.strictEqual(this.oAddIFrame.isEnabled(false, [this.oObjectPageLayoutOverlay]), true, "then isEnabled is called and it returns true");
				return this.oAddIFrame._isEditableCheck(this.oObjectPageLayoutOverlay, false);
			}.bind(this))
			.then(function(bIsEditable) {
				assert.ok(bIsEditable, "then the overlay is editable");
			});
		});

		QUnit.test("when an overlay has addIFrame action designTime metadata, has no changeType and isEnabled property is true", function(assert) {
			this.oObjectPageLayoutOverlay.setDesignTimeMetadata({
				aggregations : {
					sections : {
						actions : {
							addIFrame : {
								isEnabled : true
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
				assert.strictEqual(this.oAddIFrame.isEnabled(false, [this.oObjectPageLayoutOverlay]), true, "then isEnabled is called and then it returns correct value");
				return this.oAddIFrame._isEditableCheck(this.oObjectPageLayoutOverlay, false);
			}.bind(this))
			.then(function(bIsEditable) {
				assert.notOk(bIsEditable, "then the overlay is not editable");
			});
		});

		QUnit.test("when an overlay has addIFrame action designTime metadata, and isEnabled property is function", function(assert) {
			this.oObjectPageLayoutOverlay.setDesignTimeMetadata({
				aggregations : {
					sections : {
						actions : {
							addIFrame : {
								changeType : "addIFrame",
								isEnabled : function (oElement) {
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
				assert.strictEqual(this.oAddIFrame.isEnabled(false, [this.oObjectPageLayoutOverlay]), true, "then isEnabled is called and it returns correct value from function call");
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

				var bCheckOverlayIsSibling;
				sandbox.stub(this.oAddIFrame, "handleCreate").callsFake(function(oMenuItem, oElementOverlay) {
					assert.equal(oMenuItem.isSibling, bCheckOverlayIsSibling, "the 'handleCreate' function is called with oMenuItem.isSibling = " + bCheckOverlayIsSibling);
					assert.deepEqual(oElementOverlay.getId(), oCheckOverlay.getId(), "the 'handleCreate' function is called with the correct overlay");
				});
				sandbox.stub(this.oAddIFrame, "isEnabled").callsFake(function(oMenuItem, aElementOverlays) {
					assert.equal(oMenuItem.isSibling, bCheckOverlayIsSibling, "the 'enabled' function calls isEnabled with oMenuItem.isSibling = " + bCheckOverlayIsSibling);
					assert.deepEqual(aElementOverlays[0].getId(), oCheckOverlay.getId(), "the 'enabled' function calls isEnabled with the correct overlay");
				});

				var getMenuItems = function (oOverlay) {
					aOverlaySiblingRequests = [];
					oCheckOverlay = oOverlay;
					var aResultMenuItems = this.oAddIFrame.getMenuItems([oOverlay]);
					assert.strictEqual(aOverlaySiblingRequests.length, 2, "the 'available' function was called twice");
					assert.ok(includes(aOverlaySiblingRequests, true), "the 'available' function was called twice with bOverlayIsSibling=true");
					assert.ok(includes(aOverlaySiblingRequests, false), "the 'available' function was called twice with bOverlayIsSibling=false");
					return aResultMenuItems;
				}.bind(this);

				var aMenuItems = getMenuItems(this.oObjectPageLayoutOverlay);
				assert.strictEqual(aMenuItems.length, 1, "Only one menu item is returned");
				assert.equal(aMenuItems[0].id, "CTX_CREATE_CHILD_IFRAME_SECTIONS", "there is an entry for create child section");
				bCheckOverlayIsSibling = false;
				aMenuItems[0].handler([this.oObjectPageLayoutOverlay]);
				aMenuItems[0].enabled([this.oObjectPageLayoutOverlay]);

				aMenuItems = getMenuItems(this.oNewObjectPageSectionOverlay);
				assert.strictEqual(aMenuItems.length, 1, "Only one menu item is returned");
				assert.equal(aMenuItems[0].id, "CTX_CREATE_SIBLING_IFRAME", "there is an entry for create child section");
				bCheckOverlayIsSibling = true;
				aMenuItems[0].handler([this.oNewObjectPageSectionOverlay]);
				aMenuItems[0].enabled([this.oNewObjectPageSectionOverlay]);

				bIsAvailable = false;
				aMenuItems = getMenuItems(this.oObjectPageLayoutOverlay);
				assert.equal(aMenuItems.length, 0, "and if plugin is not available for the overlay, no menu items are returned");
			}.bind(this));
		});

		QUnit.test("when an overlay has addIFrame action, but its view has no stable id", function(assert) {
			var oViewWithUnstableId = sap.ui.xmlview({
				viewContent: viewContent
			});
			Utils.getViewForControl.restore();
			sandbox.stub(Utils, "getViewForControl").returns(oViewWithUnstableId);

			this.oObjectPageLayoutOverlay.setDesignTimeMetadata({
				aggregations : {
					sections : {
						actions : {
							addIFrame : {
								changeType : "addIFrame"
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

		QUnit.test("when an overlay has addIFrame action with changeOnRelevantContainer true, but its relevant container has no stable id", function(assert) {
			this.oObjectPageLayoutOverlay.setDesignTimeMetadata({
				aggregations : {
					sections : {
						actions : {
							addIFrame : {
								changeType : "addIFrame",
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
				"sap.ui.layout.VerticalLayout" : {
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

		QUnit.test("when a sibling overlay has addIFrame action designTime metadata, but for another aggregation", function(assert) {
			this.oObjectPageLayoutOverlay.setDesignTimeMetadata({
				aggregations : {
					toolBar : {
						actions : {
							addIFrame : {
								changeType : "addToolbarContainer"
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
				getIndex : function(oForm, oFormContainer) {
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
				changeType : "addIFrame"
			};

			assert.deepEqual(this.oAddIFrame._determineIndex(this.oObjectPageLayout, undefined, vAction.aggregationName, undefined), 0, "then the default index calculation would start and returns the right index");
		});

		QUnit.test("when the designTimeMetadata has a getCreatedContainerId property and a function getCreatedContainerId() is called", function(assert) {
			var vAction = {
				getCreatedContainerId : function(sNewControlID) {
					return sNewControlID;
				}
			};

			assert.deepEqual(this.oAddIFrame.getCreatedContainerId(vAction, this.sNewControlID),
				this.oNewObjectPageSectionOverlay.getElement().getId(),
				"then the correct id is returned");
		});

		QUnit.test("when the designTimeMetadata has no getCreatedContainerId property and a function getCreatedContainerId() is called", function(assert) {
			var vAction = {
				changeType : "addIFrame"
			};

			assert.deepEqual(this.oAddIFrame.getCreatedContainerId(vAction, this.sNewControlID),
				this.oNewObjectPageSectionOverlay.getElement().getId(),
				"then the correct id is returned");
		});

		QUnit.test("when a child overlay has addIFrame action designTime metadata and handleCreate() is called, ", function(assert) {
			var fnDone = assert.async();

			this.oObjectPageLayoutOverlay.setDesignTimeMetadata({
				aggregations : {
					sections : {
						childNames : {
							singular : "GROUP_CONTROL_NAME",
							plural : "GROUP_CONTROL_NAME_PLURAL"
						},
						actions : {
							addIFrame :  {
								changeType : "addIFrame",
								isEnabled : true
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
				assert.ok(oEvent.getParameter("action"), "then the action is in the event");
				fnDone();
			});
			assert.ok(true, "then plugin addIFrame is called with this overlay");

			this.oAddIFrame.handleCreate({
				isSibling: false,
				action: {
					aggregation: "sections"
				}
			}, this.oObjectPageLayoutOverlay);
		});

		QUnit.test("when a sibling overlay has addIFrame action designTime metadata and handleCreate() is called, ", function(assert) {
			var fnDone = assert.async();

			this.oAddIFrame.attachEventOnce("elementModified", function (oEvent) {
				var oCommand = oEvent.getParameter("command");
				assert.ok(oCommand, "then command is available");
				assert.strictEqual(oCommand.getMetadata().getName(), "sap.ui.rta.command.AddIFrame", "and command is of the correct type");
				assert.ok(oEvent.getParameter("action"), "then the action is in the event");
				assert.deepEqual(oCommand.getIndex(), 2, "then the correct index is in the command");

				fnDone();
			});

			this.oObjectPageLayoutOverlay.setDesignTimeMetadata({
				aggregations : {
					sections : {
						childNames : {
							singular : "GROUP_CONTROL_NAME",
							plural : "GROUP_CONTROL_NAME_PLURAL"
						},
						actions : {
							addIFrame :  {
								changeType : "addIFrame"
							}
						}
					}
				}
			});

			this.oAddIFrame.handleCreate({
				isSibling: true,
				action: {
					aggregation: "sections"
				}
			}, this.oNewObjectPageSectionOverlay);
		});
	});

	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});
});
