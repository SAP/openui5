/* global QUnit */

sap.ui.define([
	"sap/ui/core/mvc/XMLView",
	"sap/ui/core/IconPool",
	"sap/ui/core/Lib",
	"sap/ui/fl/Utils",
	"sap/ui/layout/VerticalLayout",
	"sap/ui/dt/DesignTime",
	"sap/ui/dt/Util",
	"sap/ui/rta/command/CommandFactory",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/fl/write/api/ChangesWriteAPI",
	"sap/uxap/ObjectPageLayout",
	"sap/uxap/ObjectPageSection",
	"sap/uxap/ObjectPageSubSection",
	"sap/ui/rta/plugin/iframe/AddIFrame",
	"sap/ui/rta/plugin/iframe/AddIFrameDialog",
	"sap/ui/thirdparty/sinon-4",
	"sap/base/util/includes",
	"sap/base/util/uid",
	"sap/m/Button",
	"test-resources/sap/ui/rta/qunit/RtaQunitUtils",
	"sap/ui/core/Core"
], function(
	XMLView,
	IconPool,
	Lib,
	Utils,
	VerticalLayout,
	DesignTime,
	DtUtil,
	CommandFactory,
	OverlayRegistry,
	ChangesWriteAPI,
	ObjectPageLayout,
	ObjectPageSection,
	ObjectPageSubSection,
	AddIFramePlugin,
	AddIFrameDialog,
	sinon,
	includes,
	uid,
	Button,
	RtaQunitUtils,
	oCore
) {
	"use strict";

	const TEST_URL = "http://www.sap.com";
	const viewContent = '<mvc:View xmlns:mvc="sap.ui.core.mvc">' + "</mvc:View>";

	let oMockedViewWithStableId;
	XMLView.create({
		id: "mockview",
		definition: viewContent
	}).then(function(oView) {
		oMockedViewWithStableId = oView;
		QUnit.start();
	});

	const sandbox = sinon.createSandbox();

	QUnit.module("Given a designTime and addIFrame plugin are instantiated for an ObjectPageLayout", {
		beforeEach(assert) {
			const done = assert.async();
			this.oMockedAppComponent = RtaQunitUtils.createAndStubAppComponent(sandbox);
			sandbox.stub(Utils, "getViewForControl").returns(oMockedViewWithStableId);
			this.oOpenStub = sandbox.stub(AddIFrameDialog.prototype, "open").callsFake(function() {
				return Promise.resolve({
					frameUrl: TEST_URL
				});
			});

			sandbox.stub(ChangesWriteAPI, "getChangeHandler").resolves();
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

			this.sNewControlID = oMockedViewWithStableId.createId(uid());
			this.oNewObjectPageSection = new ObjectPageSection(this.sNewControlID);
			this.oObjectPageLayout.addSection(this.oNewObjectPageSection);

			this.oDesignTime = new DesignTime({
				rootElements: [this.oVerticalLayout],
				plugins: [this.oAddIFrame]
			});

			oCore.applyChanges();

			this.oDesignTime.attachEventOnce("synced", function() {
				this.oLayoutOverlay = OverlayRegistry.getOverlay(this.oVerticalLayout);
				this.oObjectPageLayoutOverlay = OverlayRegistry.getOverlay(this.oObjectPageLayout);
				this.oObjectPageSectionOverlay = OverlayRegistry.getOverlay(this.oObjectPageSection);
				this.oNewObjectPageSectionOverlay = OverlayRegistry.getOverlay(this.oNewObjectPageSection);
				this.oButtonOverlay = OverlayRegistry.getOverlay(this.oButton);

				done();
			}.bind(this));
		},
		afterEach() {
			sandbox.restore();
			this.oMockedAppComponent.destroy();
			this.oVerticalLayout.destroy();
			this.oDesignTime.destroy();
		}

	}, function() {
		QUnit.test("when the getMenuItems() is called to check texts, with addIFrame defined on more than one aggregations", async function(assert) {
			const sExpectedSectionText = "Section text";
			const sExpectedHeaderText = "Header text";
			const oRegisterFontSpy = sandbox.spy(IconPool, "registerFont");
			const oFontLoadedSpy = sandbox.spy(IconPool, "fontLoaded");

			const oRtaTextResources = Lib.getResourceBundleFor("sap.ui.rta");
			sandbox.stub(oRtaTextResources, "getText")
			.withArgs("CTX_ADDIFRAME", ["as foo"]).returns(sExpectedSectionText)
			.withArgs("CTX_ADDIFRAME", ["as bar"]).returns(sExpectedHeaderText);

			this.oObjectPageLayoutOverlay.setDesignTimeMetadata({
				aggregations: {
					sections: {
						actions: {
							addIFrame: {
								changeType: "addIFrame",
								text: "as foo"
							}
						}
					},
					header: {
						actions: {
							addIFrame: {
								changeType: "addIFrame",
								text: "as bar"
							}
						}
					}
				}
			});

			const aMenuItems = await this.oAddIFrame.getMenuItems([this.oObjectPageLayoutOverlay]);

			assert.strictEqual(oRegisterFontSpy.callCount, 1, "the font was registered");
			assert.ok(oFontLoadedSpy.calledWith("tnt"), "the font was waited for");
			assert.strictEqual(
				aMenuItems[0].text(this.oObjectPageLayoutOverlay), sExpectedSectionText,
				"the Section text via the designtime is correct"
			);
			assert.strictEqual(
				aMenuItems[1].text(this.oObjectPageLayoutOverlay), sExpectedHeaderText,
				"the header text via the aggregation names is correct"
			);
		});

		QUnit.test("when an overlay has no addIFrame action designTimeMetadata", async function(assert) {
			this.oObjectPageLayoutOverlay.setDesignTimeMetadata({});
			this.oAddIFrame.deregisterElementOverlay(this.oObjectPageLayoutOverlay);
			this.oAddIFrame.registerElementOverlay(this.oObjectPageLayoutOverlay);

			await DtUtil.waitForSynced(this.oDesignTime)();
			assert.strictEqual(this.oAddIFrame.isAvailable([this.oObjectPageLayoutOverlay], false), false, "then isAvailable is called and it returns false");
			assert.strictEqual(this.oAddIFrame.isEnabled("dummyAggregation", [this.oObjectPageLayoutOverlay]), false, "then isEnabled is called and it returns false");
			const bIsEditable = await this.oAddIFrame._isEditableCheck(this.oObjectPageLayoutOverlay, false);
			assert.notOk(bIsEditable, "then the overlay is not editable");
		});

		QUnit.test("when an overlay has addIFrame action in designTimeMetadata, but has no isEnabled property defined", async function(assert) {
			this.oObjectPageLayoutOverlay.setDesignTimeMetadata({
				aggregations: {
					sections: {
						actions: {
							addIFrame: {
								changeType: "addIFrame",
								text: "foo"
							}
						}
					}
				}
			});
			this.oAddIFrame.deregisterElementOverlay(this.oObjectPageLayoutOverlay);
			this.oAddIFrame.registerElementOverlay(this.oObjectPageLayoutOverlay);

			await DtUtil.waitForSynced(this.oDesignTime)();
			assert.strictEqual(this.oAddIFrame.isAvailable([this.oObjectPageLayoutOverlay], false), true, "then isAvailable is called and it returns true");
			assert.strictEqual(this.oAddIFrame.isEnabled("sections", [this.oObjectPageLayoutOverlay]), true, "then isEnabled is called and it returns true");
			const bIsEditable = await this.oAddIFrame._isEditableCheck(this.oObjectPageLayoutOverlay, false);
			assert.ok(bIsEditable, "then the overlay is editable");
		});

		QUnit.test("when an overlay has addIFrame action designTime metadata, has no changeType and isEnabled property is true", async function(assert) {
			this.oObjectPageLayoutOverlay.setDesignTimeMetadata({
				aggregations: {
					sections: {
						actions: {
							addIFrame: {
								isEnabled: true,
								text: "foo"
							}
						}
					}
				}
			});
			this.oAddIFrame.deregisterElementOverlay(this.oObjectPageLayoutOverlay);
			this.oAddIFrame.registerElementOverlay(this.oObjectPageLayoutOverlay);

			await DtUtil.waitForSynced(this.oDesignTime)();
			assert.strictEqual(this.oAddIFrame.isAvailable([this.oObjectPageLayoutOverlay], false), false, "then isAvailable is called and then it returns false");
			assert.strictEqual(this.oAddIFrame.isEnabled("sections", [this.oObjectPageLayoutOverlay]), true, "then isEnabled is called and then it returns correct value");
			const bIsEditable = await this.oAddIFrame._isEditableCheck(this.oObjectPageLayoutOverlay, false);
			assert.notOk(bIsEditable, "then the overlay is not editable");
		});

		QUnit.test("when an overlay has addIFrame action on a responsible element", async function(assert) {
			assert.expect(9);
			const sText = "as Section";
			this.oObjectPageLayoutOverlay.setDesignTimeMetadata({
				aggregations: {
					sections: {
						actions: {
							addIFrame: {
								changeType: "addIFrame",
								text: sText
							}
						}
					}
				}
			});

			const sExpectedText = "Section text";
			const oRtaTextResources = Lib.getResourceBundleFor("sap.ui.rta");
			sandbox.stub(oRtaTextResources, "getText").withArgs("CTX_ADDIFRAME", [sText]).returns(sExpectedText);

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

			async function checkMenuItemWhenActionAvailable(oPlugin, oSourceOverlay, oResponsibleElementOverlay) {
				const aMenuItems = await oPlugin.getMenuItems([oSourceOverlay]);
				assert.equal(aMenuItems.length, 1, "then one menu item was returned when the action is available on the responsible element overlay");

				assert.strictEqual(aMenuItems[0].enabled([oSourceOverlay]), true, "then the menu item is enabled");
				assert.strictEqual(typeof aMenuItems[0].handler, "function", "then menu item handler is a function");
				assert.strictEqual(aMenuItems[0].text(oSourceOverlay), sExpectedText, "then menu item has the expected text");

				assert.equal(aMenuItems[0].id, "CTX_CREATE_SIBLING_IFRAME", "there the menu item is for a sibling");
				assert.deepEqual(aMenuItems[0].responsible[0], oResponsibleElementOverlay, "then the menu item contains the responsible element overlay");
			}

			await DtUtil.waitForSynced(this.oDesignTime)();
			assert.strictEqual(this.oAddIFrame.isAvailable([this.oButtonOverlay], true), true, "then isAvailable returns true as a sibling");
			assert.strictEqual(this.oAddIFrame.isAvailable([this.oButtonOverlay], false), false, "then isAvailable returns false when it's not a sibling");

			let bAvailable = true;
			sandbox.stub(this.oAddIFrame, "isAvailable").callsFake(function(aElementOverlays, bSibling) {
				if (bSibling === true && aElementOverlays[0] === this.oButtonOverlay) {
					return bAvailable;
				}
			}.bind(this));

			await checkMenuItemWhenActionAvailable(this.oAddIFrame, this.oButtonOverlay, this.oObjectPageSectionOverlay);

			bAvailable = false;
			const aMenuItems = await this.oAddIFrame.getMenuItems([this.oButtonOverlay]);
			assert.equal(aMenuItems.length, 0, "then no menu item was returned when the action is not available on the responsible element overlay");
		});

		QUnit.test("when an overlay has an addIFrame action in designTimeMetadata, and isEnabled property is a function", async function(assert) {
			assert.expect(27);
			this.oObjectPageLayoutOverlay.setDesignTimeMetadata({
				aggregations: {
					sections: {
						actions: {
							addIFrame: {
								changeType: "addIFrame",
								isEnabled(oElement) {
									return oElement.getMetadata().getName() === "sap.uxap.ObjectPageLayout";
								},
								text: "foo"
							}
						}
					}
				}
			});
			this.oAddIFrame.deregisterElementOverlay(this.oObjectPageLayoutOverlay);
			this.oAddIFrame.registerElementOverlay(this.oObjectPageLayoutOverlay);

			await DtUtil.waitForSynced(this.oDesignTime)();
			assert.strictEqual(
				this.oAddIFrame.isAvailable([this.oObjectPageLayoutOverlay], false), true,
				"then isAvailable is called and it returns true"
			);
			assert.strictEqual(
				this.oAddIFrame.isEnabled("sections", [this.oObjectPageLayoutOverlay]), true,
				"then isEnabled is called and it returns correct value from function call"
			);
			const bIsEditable = await this.oAddIFrame._isEditableCheck(this.oObjectPageLayoutOverlay, false);
			assert.ok(bIsEditable, "then the overlay is editable");

			let aOverlaySiblingRequests;
			let oCheckOverlay;
			let bIsAvailable = true;

			sandbox.stub(this.oAddIFrame, "isAvailable").callsFake(function(aElementOverlays, bOverlayIsSibling) {
				aOverlaySiblingRequests.push(bOverlayIsSibling); // Not assuming any order
				assert.deepEqual(aElementOverlays[0].getId(), oCheckOverlay.getId(), "the 'available' function calls isAvailable with the correct overlay");
				return bIsAvailable;
			});

			sandbox.stub(this.oAddIFrame, "isEnabled").callsFake(function(sAggregationName, aElementOverlays) {
				const sExpectedAggregationName = this.callCount === 1 ? "sections" : undefined;
				assert.strictEqual(sExpectedAggregationName, sAggregationName, "then enabled() was called with the correct aggregation");
				assert.strictEqual(aElementOverlays[0].getId(), oCheckOverlay.getId(), "then handler() was called with the correct overlay");
			}.bind(this.oAddIFrame.isEnabled));

			async function getMenuItems(oOverlay) {
				aOverlaySiblingRequests = [];
				oCheckOverlay = oOverlay;
				const aResultMenuItems = await this.oAddIFrame.getMenuItems([oOverlay]);
				assert.strictEqual(aOverlaySiblingRequests.length, 2, "the 'available' function was called twice");
				assert.ok(includes(aOverlaySiblingRequests, true), "the 'available' function was called twice with bOverlayIsSibling=true");
				assert.ok(includes(aOverlaySiblingRequests, false), "the 'available' function was called twice with bOverlayIsSibling=false");
				return aResultMenuItems;
			}

			let aMenuItems = await getMenuItems.call(this, this.oObjectPageLayoutOverlay);

			assert.strictEqual(aMenuItems.length, 1, "Only one menu item is returned");
			assert.equal(aMenuItems[0].id, "CTX_CREATE_CHILD_IFRAME_SECTIONS", "there is an entry for create child section");
			aMenuItems[0].handler([this.oObjectPageLayoutOverlay]);
			aMenuItems[0].enabled([this.oObjectPageLayoutOverlay]);

			aMenuItems = await getMenuItems.call(this, this.oNewObjectPageSectionOverlay);
			assert.strictEqual(aMenuItems.length, 1, "Only one menu item is returned");
			assert.equal(aMenuItems[0].id, "CTX_CREATE_SIBLING_IFRAME", "there is an entry for create child section");
			aMenuItems[0].handler([this.oNewObjectPageSectionOverlay]);
			aMenuItems[0].enabled([this.oNewObjectPageSectionOverlay]);

			bIsAvailable = false;
			aMenuItems = await getMenuItems.call(this, this.oObjectPageLayoutOverlay);
			assert.equal(aMenuItems.length, 0, "and if plugin is not available for the overlay, no menu items are returned");
		});

		QUnit.test("when an overlay has an addIFrame action with changeOnRelevantContainer true, but its relevant container has no stable ID", async function(assert) {
			this.oObjectPageLayoutOverlay.setDesignTimeMetadata({
				aggregations: {
					sections: {
						actions: {
							addIFrame: {
								changeType: "addIFrame",
								changeOnRelevantContainer: true
							},
							text: "foo"
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

			this.oAddIFrame.deregisterElementOverlay(this.oObjectPageLayoutOverlay);
			this.oAddIFrame.registerElementOverlay(this.oObjectPageLayoutOverlay);
			await DtUtil.waitForSynced(this.oDesignTime)();
			const bIsEditable = await this.oAddIFrame._isEditableCheck(this.oObjectPageSectionOverlay, true);
			assert.notOk(bIsEditable, "then the overlay is not editable");
		});

		QUnit.test("when a sibling overlay has an addIFrame action designTimeMetadata, but for another aggregation", async function(assert) {
			this.oObjectPageLayoutOverlay.setDesignTimeMetadata({
				aggregations: {
					toolBar: {
						actions: {
							addIFrame: {
								changeType: "addToolbarContainer",
								text: "foo"
							}
						}
					}
				}
			});
			this.oAddIFrame.deregisterElementOverlay(this.oObjectPageLayoutOverlay);
			this.oAddIFrame.registerElementOverlay(this.oObjectPageLayoutOverlay);

			const bIsEditable = await this.oAddIFrame._isEditableCheck(this.oObjectPageLayoutOverlay, true);
			assert.notOk(bIsEditable, "then the overlay is not editable");
		});

		QUnit.test("when the designTimeMetadata has a getContainerIndex property and a function _determineIndex() is called", function(assert) {
			const vAction = {
				aggregationName: "sections",
				getIndex(oForm, oFormContainer) {
					const sAggregationName = vAction.aggregationName;
					const oMetadata = oForm.getMetadata();
					const oAggregation = oMetadata.getAggregation(sAggregationName);
					const sGetter = oAggregation._sGetter;
					const aContainers = oForm[sGetter]();
					let iIndex;
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
			const vAction = {
				aggregationName: "sections",
				changeType: "addIFrame"
			};

			assert.deepEqual(this.oAddIFrame._determineIndex(this.oObjectPageLayout, undefined, vAction.aggregationName, undefined), 0, "then the default index calculation would start and returns the right index");
		});

		QUnit.test("when the designTimeMetadata has a getCreatedContainerId property and a function getCreatedContainerId() is called", function(assert) {
			const vAction = {
				getCreatedContainerId(sNewControlID) {
					return sNewControlID;
				}
			};

			assert.deepEqual(this.oAddIFrame.getCreatedContainerId(vAction, this.sNewControlID),
				this.oNewObjectPageSectionOverlay.getElement().getId(),
				"then the correct id is returned");
		});

		QUnit.test("when the designTimeMetadata has no getCreatedContainerId property and a function getCreatedContainerId() is called", function(assert) {
			const vAction = {
				changeType: "addIFrame"
			};

			assert.deepEqual(this.oAddIFrame.getCreatedContainerId(vAction, this.sNewControlID),
				this.oNewObjectPageSectionOverlay.getElement().getId(),
				"then the correct id is returned");
		});

		QUnit.test("when the menu item handler is called with the parent overlay", async function(assert) {
			const fnDone = assert.async();

			this.oObjectPageLayoutOverlay.setDesignTimeMetadata({
				aggregations: {
					sections: {
						actions: {
							addIFrame: {
								changeType: "addIFrame",
								text: "foo"
							}
						}
					}
				}
			});
			this.oAddIFrame.deregisterElementOverlay(this.oObjectPageLayoutOverlay);
			this.oAddIFrame.registerElementOverlay(this.oObjectPageLayoutOverlay);

			this.oAddIFrame.attachEventOnce("elementModified", function(oEvent) {
				const oCommand = oEvent.getParameter("command");
				assert.ok(oCommand, "then command is available");
				assert.strictEqual(oCommand.getMetadata().getName(), "sap.ui.rta.command.AddIFrame", "and command is of the correct type");
				assert.notOk(oEvent.getParameter("action"), "then the action is not in the event");
				fnDone();
			});

			await DtUtil.waitForSynced(this.oDesignTime)();
			const aMenuItems = await this.oAddIFrame.getMenuItems([this.oObjectPageLayoutOverlay]);
			aMenuItems[0].handler([this.oObjectPageLayoutOverlay]);
		});

		QUnit.test("when the menu item handler is called with the sibling overlay", async function(assert) {
			const fnDone = assert.async();
			const sTitle = "Potato";

			this.oOpenStub.callsFake(function() {
				return Promise.resolve({
					frameUrl: TEST_URL,
					title: sTitle
				});
			});

			this.oObjectPageLayoutOverlay.setDesignTimeMetadata({
				aggregations: {
					sections: {
						actions: {
							addIFrame: {
								changeType: "addIFrame",
								getCreatedContainerId() {},
								text: "foo"
							}
						}
					}
				}
			});

			this.oAddIFrame.attachEventOnce("elementModified", function(oEvent) {
				const oCommand = oEvent.getParameter("command");
				assert.ok(oCommand, "then command is available");
				assert.strictEqual(oCommand.getMetadata().getName(), "sap.ui.rta.command.AddIFrame", "and command is of the correct type");
				assert.ok(oEvent.getParameter("action"), "then the action is in the event");
				assert.deepEqual(oCommand.getIndex(), 1, "then the correct index is in the command");
				assert.strictEqual(oEvent.getParameter("title"), sTitle, "then the title is in the event");
				fnDone();
			});

			this.oAddIFrame.deregisterElementOverlay(this.oObjectPageSectionOverlay);
			this.oAddIFrame.registerElementOverlay(this.oObjectPageSectionOverlay);

			await DtUtil.waitForSynced(this.oDesignTime)();
			const oMenuItems = await this.oAddIFrame.getMenuItems([this.oObjectPageSectionOverlay]);
			oMenuItems[0].handler([this.oObjectPageSectionOverlay]);
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
