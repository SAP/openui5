/* global QUnit */

sap.ui.define([
	"sap/m/MessageBox",
	"sap/ui/comp/smartform/Group",
	"sap/ui/comp/smartform/GroupElement",
	"sap/ui/comp/smartform/SmartForm",
	"sap/ui/Device",
	"sap/ui/dt/plugin/ContextMenu",
	"sap/ui/dt/DesignTimeMetadata",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/dt/Overlay",
	"sap/ui/fl/registry/ChangeRegistry",
	"sap/ui/fl/Change",
	"sap/ui/fl/Layer",
	"sap/ui/fl/Utils",
	"sap/ui/fl/write/api/FeaturesAPI",
	"sap/ui/rta/Utils",
	"sap/ui/rta/appVariant/AppVariantUtils",
	"sap/ui/rta/appVariant/Feature",
	"sap/ui/rta/RuntimeAuthoring",
	"sap/ui/rta/command/BaseCommand",
	"sap/ui/rta/command/Stack",
	"sap/ui/rta/command/CommandFactory",
	"sap/ui/rta/plugin/Remove",
	"sap/ui/base/Event",
	"sap/ui/base/EventProvider",
	"sap/base/Log",
	"sap/base/util/UriParameters",
	"qunit/RtaQunitUtils",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/fl/write/api/PersistenceWriteAPI",
	"sap/ui/fl/write/api/VersionsAPI",
	"sap/ui/thirdparty/sinon-4"
],
function(
	MessageBox,
	Group,
	GroupElement,
	SmartForm,
	Device,
	ContextMenuPlugin,
	DesignTimeMetadata,
	OverlayRegistry,
	Overlay,
	ChangeRegistry,
	Change,
	Layer,
	Utils,
	FeaturesAPI,
	RtaUtils,
	AppVariantUtils,
	RtaAppVariantFeature,
	RuntimeAuthoring,
	RTABaseCommand,
	Stack,
	CommandFactory,
	Remove,
	Event,
	EventProvider,
	Log,
	UriParameters,
	RtaQunitUtils,
	QUnitUtils,
	PersistenceWriteAPI,
	VersionsAPI,
	sinon
) {
	"use strict";

	var fnTriggerKeydown = function(oTargetDomRef, iKeyCode, bShiftKey, bAltKey, bCtrlKey, bMetaKey) {
		var oParams = {};
		oParams.keyCode = iKeyCode;
		oParams.which = oParams.keyCode;
		oParams.shiftKey = bShiftKey;
		oParams.altKey = bAltKey;
		oParams.metaKey = bMetaKey;
		oParams.ctrlKey = bCtrlKey;
		QUnitUtils.triggerEvent("keydown", oTargetDomRef, oParams);
	};

	var sandbox = sinon.sandbox.create();
	var oCompCont = RtaQunitUtils.renderTestAppAt("qunit-fixture");
	var oComp = oCompCont.getComponentInstance();

	QUnit.module("Given that RuntimeAuthoring is available with a view as rootControl...", {
		beforeEach : function() {
			this.oRta = new RuntimeAuthoring({
				rootControl : oComp
			});

			this.fnDestroy = sinon.spy(this.oRta, "_destroyDefaultPlugins");
			return RtaQunitUtils.clear()
			.then(this.oRta.start.bind(this.oRta))
			.then(function() {
				this.oRootControlOverlay = OverlayRegistry.getOverlay(oComp);
			}.bind(this));
		},
		afterEach : function() {
			this.oRta.destroy();
			sandbox.restore();
			return RtaQunitUtils.clear();
		}
	}, function() {
		QUnit.test("when RTA gets initialized and command stack is changed,", function(assert) {
			assert.ok(this.oRta, " then RuntimeAuthoring is created");
			assert.strictEqual(jQuery(".sapUiRtaToolbar").length, 1, "then Toolbar is visible.");
			assert.ok(this.oRootControlOverlay.$().css("z-index") < this.oRta.getToolbar().$().css("z-index"), "and the toolbar is in front of the root overlay");
			assert.notOk(RuntimeAuthoring.needsRestart(), "restart is not needed initially");

			assert.equal(this.oRta.getToolbar().getControl('versionLabel').getVisible(), false, "then the version label is hidden");
			assert.equal(this.oRta.getToolbar().getControl('activateDraft').getVisible(), false, "then the activate draft Button is visible");
			assert.equal(this.oRta.getToolbar().getControl('discardDraft').getVisible(), false, "then the discard draft Button is visible");
			assert.equal(this.oRta.getToolbar().getControl('exit').getVisible(), true, "then the exit Button is visible");
			assert.equal(this.oRta.getToolbar().getControl('exit').getEnabled(), true, "then the exit Button is enabled");
			assert.equal(this.oRta.getToolbar().getControl('modeSwitcher').getVisible(), true, "then the modeSwitcher Button is visible");
			assert.equal(this.oRta.getToolbar().getControl('modeSwitcher').getEnabled(), true, "then the modeSwitcher Button is enabled");
			assert.equal(this.oRta.getToolbar().getControl('undo').getVisible(), true, "then the undo Button is visible");
			assert.equal(this.oRta.getToolbar().getControl('undo').getEnabled(), false, "then the undo Button is enabled");
			assert.equal(this.oRta.getToolbar().getControl('redo').getVisible(), true, "then the redo Button is visible");
			assert.equal(this.oRta.getToolbar().getControl('redo').getEnabled(), false, "then the redo Button is enabled");
			assert.equal(this.oRta.getToolbar().getControl('restore').getVisible(), true, "then the Restore Button is visible");
			assert.equal(this.oRta.getToolbar().getControl('restore').getEnabled(), false, "then the Restore Button is disabled");
			assert.equal(this.oRta.getToolbar().getControl('publish').getVisible(), false, "then the Publish Button is invisible");
			assert.equal(this.oRta.getToolbar().getControl('publish').getEnabled(), false, "then the Publish Button is disabled");
			assert.equal(this.oRta.getToolbar().getControl('manageApps').getVisible(), false, "then the 'AppVariant Overview' Icon Button is not visible");
			assert.equal(this.oRta.getToolbar().getControl('manageApps').getEnabled(), false, "then the 'AppVariant Overview' Icon Button is not enabled");
			assert.equal(this.oRta.getToolbar().getControl('appVariantOverview').getVisible(), false, "then the 'AppVariant Overview' Menu Button is not visible");
			assert.equal(this.oRta.getToolbar().getControl('appVariantOverview').getEnabled(), false, "then the 'AppVariant Overview' Menu Button is not enabled");
			assert.equal(this.oRta.getToolbar().getControl('saveAs').getVisible(), false, "then the saveAs Button is not visible");
			assert.equal(this.oRta.getToolbar().getControl('saveAs').getEnabled(), false, "then the saveAs Button is not enabled");

			var oInitialCommandStack = this.oRta.getCommandStack();
			assert.ok(oInitialCommandStack, "the command stack is automatically created");
			this.oRta.setCommandStack(new Stack());
			var oNewCommandStack = this.oRta.getCommandStack();
			assert.notEqual(oInitialCommandStack, oNewCommandStack, "rta getCommandStack returns new command stack");
		});

		QUnit.test("when RTA is stopped and destroyed, the default plugins get created and destroyed", function(assert) {
			var done = assert.async();

			assert.ok(this.oRta.getPlugins()['contextMenu'], " then the default ContextMenuPlugin is set");
			assert.notOk(this.oRta.getPlugins()['contextMenu'].bIsDestroyed, " and the default ContextMenuPlugin is not destroyed");
			assert.ok(this.oRta.getPlugins()['dragDrop'], " and the default DragDropPlugin is set");
			assert.notOk(this.oRta.getPlugins()['dragDrop'].bIsDestroyed, " and the default DragDropPlugin is not destroyed");
			assert.ok(this.oRta.getPlugins()['cutPaste'], " and the default CutPastePlugin is set");
			assert.notOk(this.oRta.getPlugins()['cutPaste'].bIsDestroyed, " and the default CutPastePlugin is not destroyed");
			assert.ok(this.oRta.getPlugins()['remove'], " and the default RemovePlugin is set");
			assert.notOk(this.oRta.getPlugins()['remove'].bIsDestroyed, " and the default RemovePlugin is not destroyed");
			assert.ok(this.oRta.getPlugins()['additionalElements'], " and the default AdditionalElementsPlugin is set");
			assert.notOk(this.oRta.getPlugins()['additionalElements'].bIsDestroyed, " and the default AdditionalElementsPlugin is not destroyed");
			assert.ok(this.oRta.getPlugins()['rename'], " and the default RenamePlugin is set");
			assert.notOk(this.oRta.getPlugins()['rename'].bIsDestroyed, " and the default RenamePlugin is not destroyed");
			assert.ok(this.oRta.getPlugins()['selection'], " and the default SelectionPlugin is set");
			assert.notOk(this.oRta.getPlugins()['selection'].bIsDestroyed, " and the default SelectionPlugin is not destroyed");
			assert.ok(this.oRta.getPlugins()['settings'], " and the default SettingsPlugin is set");
			assert.notOk(this.oRta.getPlugins()['settings'].bIsDestroyed, " and the default SettingsPlugin is not destroyed");
			assert.ok(this.oRta.getPlugins()['createContainer'], " and the default CreateContainerPlugin is set");
			assert.notOk(this.oRta.getPlugins()['createContainer'].bIsDestroyed, " and the default CreateContainerPlugin is not destroyed");
			assert.ok(this.oRta.getPlugins()['tabHandling'], " and the default TabHandlingPlugin is set");
			assert.notOk(this.oRta.getPlugins()['tabHandling'].bIsDestroyed, " and the default TabHandlingPlugin is not destroyed");

			this.oRta.attachStop(function() {
				assert.ok(true, "the 'stop' event was fired");

				this.oRta.destroy();
				assert.strictEqual(jQuery(".sapUiRtaToolbar").length, 0, "... and Toolbar is destroyed.");
				assert.equal(this.fnDestroy.callCount, 2, " and _destroyDefaultPlugins have been called once again after oRta.stop()");
				done();
			}.bind(this));
			this.oRta.stop().then(function() {
				assert.ok(true, "then the promise got resolved");
			});
		});

		QUnit.test("when setMode is called", function(assert) {
			var oTabhandlingPlugin = this.oRta.getPlugins()["tabHandling"];
			var oTabHandlingRemoveSpy = sandbox.spy(oTabhandlingPlugin, "removeTabIndex");
			var oTabHandlingRestoreSpy = sandbox.spy(oTabhandlingPlugin, "restoreTabIndex");
			var oFireModeChangedSpy = sandbox.stub(this.oRta, "fireModeChanged");

			this.oRta.setMode("navigation");
			assert.notOk(this.oRta._oDesignTime.getEnabled(), "then the designTime property enabled is false");
			assert.ok(oTabHandlingRestoreSpy.callCount, 1, "restoreTabIndex was called");
			assert.ok(oFireModeChangedSpy.callCount, 1, "then the event was fired");
			assert.deepEqual(oFireModeChangedSpy.lastCall.args[0], {mode: "navigation"});

			// simulate mode change from toolbar
			this.oRta.getToolbar().fireModeChange({item: { getKey: function() {return "adaptation";}}});
			assert.ok(this.oRta._oDesignTime.getEnabled(), "then the designTime property enabled is true again");
			assert.ok(oTabHandlingRemoveSpy.callCount, 1, "removeTabIndex was called");
			assert.ok(oFireModeChangedSpy.callCount, 2, "then the event was fired again");
			assert.deepEqual(oFireModeChangedSpy.lastCall.args[0], {mode: "adaptation"});
		});
	});

	QUnit.module("Given a USER layer change", {
		beforeEach : function() {
			this.oUserChange = new Change({
				fileType: "change",
				layer: Layer.USER,
				fileName: "a",
				namespace: "b",
				packageName: "c",
				changeType: "labelChange",
				creation: "",
				reference: "",
				selector: {
					id: "abc123"
				},
				content: {
					something: "createNewVariant"
				}
			});

			this.oRta = new RuntimeAuthoring({
				rootControl : oComp
			});
			sandbox.stub(PersistenceWriteAPI, "getResetAndPublishInfo").resolves({
				isResetEnabled: true,
				isPublishEnabled: false
			});

			return RtaQunitUtils.clear();
		},
		afterEach : function() {
			this.oRta.destroy();
			sandbox.restore();
			return RtaQunitUtils.clear();
		}
	}, function() {
		QUnit.test("when RTA is started and stopped in the user layer", function(assert) {
			var done = assert.async();
			this.oRta.setFlexSettings({layer: Layer.USER});
			var oReloadSpy = sandbox.spy(this.oRta, "_handleReloadOnExit");

			this.oRta.attachStop(function() {
				assert.ok(oReloadSpy.notCalled, "the reload check was skipped");
				done();
			});

			this.oRta.start()
			.then(function() {
				assert.equal(this.oRta.getToolbar().getControl('restore').getVisible(), true, "then the Restore Button is visible");
				assert.equal(this.oRta.getToolbar().getControl('restore').getEnabled(), true, "then the Restore Button is enabled");
				assert.equal(this.oRta.getToolbar().getControl('exit').getVisible(), true, "then the Exit Button is visible");
				assert.equal(this.oRta.getToolbar().getControl('exit').getEnabled(), true, "then the Exit Button is enabled");
			}.bind(this))
			.then(function() {
				this.oRta.getToolbar().getControl("exit").firePress();
			}.bind(this));
		});

		QUnit.test("when RTA is started in the customer layer, the versioning is not available", function(assert) {
			this.oRta._bVersiningEnabled = false;

			return this.oRta._isDraftAvailable()
			.then(function(bDraftAvailable) {
				assert.equal(bDraftAvailable, false, "then the 'isDraftAvailable' is false");
			});
		});

		QUnit.test("when RTA is started in the customer layer, the versioning is available, draft is available", function(assert) {
			this.oRta._bVersioningEnabled = true;
			var oDraftAvailableStub = sandbox.stub(VersionsAPI, "isDraftAvailable").resolves(true);
			var oPropertyBag = {
				selector: oCompCont.getComponentInstance(),
				layer: Layer.CUSTOMER
			};

			return this.oRta._isDraftAvailable()
				.then(function(bDraftAvailable) {
					assert.equal(bDraftAvailable, true, "then the 'isDraftAvailable' is true");
					assert.deepEqual(oDraftAvailableStub.lastCall.args[0], oPropertyBag, "and the property bag was set correctly");
				});
		});

		QUnit.test("when RTA is started in the customer layer, and no uShell is available", function(assert) {
			this.oRta._bVersioningEnabled = true;
			var oDraftAvailableStub = sandbox.stub(VersionsAPI, "isDraftAvailable");
			sandbox.stub(Utils, "getUshellContainer").returns(undefined);

			return this.oRta._initVersioning()
				.then(function() {
					assert.equal(this.oRta._bVersioningEnabled, false, "then the 'versioningEnabled' is false");
					assert.deepEqual(oDraftAvailableStub.callCount, 0, "and the draft available was not checked");
				}.bind(this));
		});

		QUnit.test("when RTA is started in the customer layer, the versioning is available, draft is not available, no changes yet done", function(assert) {
			this.oRta._bVersioningEnabled = true;
			sandbox.stub(VersionsAPI, "isDraftAvailable").resolves(false);
			sandbox.stub(this.oRta, "canUndo").returns(false);

			return this.oRta._isDraftAvailable()
			.then(function(bDraftAvailable) {
				assert.equal(bDraftAvailable, false, "then the 'isDraftAvailable' is false");
			});
		});

		QUnit.test("when RTA is started in the customer layer, the versioning is available, draft is not available, there are unsaved changes", function(assert) {
			this.oRta._bVersioningEnabled = true;
			sandbox.stub(VersionsAPI, "isDraftAvailable").resolves(false);
			sandbox.stub(this.oRta, "canUndo").returns(true);

			return this.oRta._isDraftAvailable()
			.then(function(bDraftAvailable) {
				assert.equal(bDraftAvailable, true, "then the 'isDraftAvailable' is true");
			});
		});

		QUnit.test("when RTA is started in the customer layer, app variant feature is available for a (key user) but the manifest of an app is not supported", function(assert) {
			sandbox.stub(this.oRta, '_getToolbarButtonsVisibility').returns(Promise.resolve({
				publishAvailable: true,
				publishAppVariantSupported: true,
				draftAvailable : false
			}));
			sandbox.stub(AppVariantUtils, "getManifirstSupport").returns(Promise.resolve({response: false}));
			sandbox.stub(Utils, "getAppDescriptor").returns({"sap.app": {id: "1"}});

			return this.oRta.start()
			.then(function() {
				assert.equal(this.oRta.getToolbar().getControl('manageApps').getVisible(), true, "then the 'AppVariant Overview' Icon Button is visible");
				assert.equal(this.oRta.getToolbar().getControl('manageApps').getEnabled(), false, "then the 'AppVariant Overview' Icon Button is not enabled");
				assert.equal(this.oRta.getToolbar().getControl('appVariantOverview').getVisible(), false, "then the 'AppVariant Overview' Menu Button is not visible");
				assert.equal(this.oRta.getToolbar().getControl('appVariantOverview').getEnabled(), false, "then the 'AppVariant Overview' Menu Button is not enabled");
				assert.equal(this.oRta.getToolbar().getControl('saveAs').getVisible(), true, "then the 'Save As' Button is visible");
				assert.equal(this.oRta.getToolbar().getControl('manageApps').getEnabled(), false, "then the 'Save As' Button is not enabled");
			}.bind(this));
		});

		QUnit.test("when RTA is started in the customer layer, app variant feature is available for an (SAP developer) but the manifest of an app is not supported", function(assert) {
			sandbox.stub(this.oRta, '_getToolbarButtonsVisibility').returns(Promise.resolve({
				publishAvailable: true,
				publishAppVariantSupported: true,
				draftAvailable : false
			 }));
			sandbox.stub(RtaAppVariantFeature, "isOverviewExtended").returns(true);
			sandbox.stub(RtaAppVariantFeature, "isManifestSupported").resolves(false);

			return this.oRta.start()
			.then(function() {
				assert.equal(this.oRta.getToolbar().getControl('manageApps').getVisible(), false, "then the 'AppVariant Overview' Icon Button is not visible");
				assert.equal(this.oRta.getToolbar().getControl('manageApps').getEnabled(), false, "then the 'AppVariant Overview' Icon Button is not enabled");
				assert.equal(this.oRta.getToolbar().getControl('appVariantOverview').getVisible(), true, "then the 'AppVariant Overview' Menu Button is visible");
				assert.equal(this.oRta.getToolbar().getControl('appVariantOverview').getEnabled(), false, "then the 'AppVariant Overview' Menu Button is not enabled");
				assert.equal(this.oRta.getToolbar().getControl('saveAs').getVisible(), true, "then the 'Save As' Button is visible");
				assert.equal(this.oRta.getToolbar().getControl('manageApps').getEnabled(), false, "then the 'Save As' Button is not enabled");
			}.bind(this));
		});

		QUnit.test("when _onGetAppVariantOverview is called", function(assert) {
			var oMenuButton = {
				getId : function() {
					return 'keyUser';
				}
			};

			var oEmptyEvent = new sap.ui.base.Event("emptyEventId", oMenuButton, {
				item : oMenuButton
			});

			var fnAppVariantFeatureSpy = sandbox.stub(RtaAppVariantFeature, "onGetOverview").returns(Promise.resolve(true));
			return this.oRta._onGetAppVariantOverview(oEmptyEvent).then(function() {
				assert.ok(fnAppVariantFeatureSpy.calledOnce, "then the onGetOverview() method is called once and the key user view will be shown");
			});
		});
	});

	QUnit.module("Given a CUSTOMER layer with versioning enabled", {
		beforeEach : function() {
			sandbox.stub(Utils, "getAppComponentForControl").returns(oComp);
			this.oGroupElement = new GroupElement({id : oComp.createId("element")});
			var oGroup = new Group({
				id : oComp.createId("group"),
				groupElements : [this.oGroupElement]
			});
			this.oSmartForm = new SmartForm({
				id : oComp.createId("smartform"),
				groups : [oGroup]
			});
			this.oSmartForm.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
			this.oGroupElementDesignTimeMetadata = new DesignTimeMetadata({
				data : {
					actions : {
						remove : {
							changeType : "hideControl"
						}
					}
				}
			});
			this.oCommandStack = new Stack();
			this.oRta = new RuntimeAuthoring({
				rootControl : this.oSmartForm,
				commandStack : this.oCommandStack,
				showToolbars : true
			});
			sandbox.stub(this.oRta, "_initVersioning").resolves();
			this.oRta._bVersioningEnabled = true;
			sandbox.stub(FeaturesAPI, "isVersioningEnabled").resolves(true);

			this.oRta.setFlexSettings({layer: Layer.CUSTOMER});
		},
		afterEach : function() {
			sandbox.restore();
			this.oRta.destroy();
			this.oSmartForm.destroy();
			return RtaQunitUtils.clear();
		}
	}, function() {
		QUnit.test("when RTA is started and no draft is available", function(assert) {
			sandbox.stub(VersionsAPI, "isDraftAvailable").resolves(false);

			return this.oRta.start().then(function () {
				assert.equal(this.oRta.getToolbar().getVersioningVisible(), true, "then the draft buttons are shown");
				assert.equal(this.oRta.getToolbar().getDraftEnabled(), false, "then the draft buttons are disabled");
			}.bind(this));
		});
		QUnit.test("when RTA is started and a draft is available", function(assert) {
			sandbox.stub(VersionsAPI, "isDraftAvailable").resolves(true);
			return this.oRta.start().then(function () {
				assert.equal(this.oRta.getToolbar().getVersioningVisible(), true, "then the draft buttons are visible");
			}.bind(this));
		});

		QUnit.test("when RTA is started and no draft is available, and and the key user starts working", function(assert) {
			sandbox.stub(this.oRta, "_isDraftAvailable").resolves(false);

			return this.oRta.start()
				.then(function() {
					return new CommandFactory().getCommandFor(this.oGroupElement, "Remove", {
						removedElement : this.oGroupElement
					}, this.oGroupElementDesignTimeMetadata);
				}.bind(this))
				.then(function(oRemoveCommand) {
					return this.oCommandStack.pushAndExecute(oRemoveCommand);
				}.bind(this))
				.then(function() {
					assert.equal(this.oRta.getToolbar().getVersioningVisible(), true, "then the draft buttons are visible");
					assert.equal(this.oRta.getToolbar().getDraftEnabled(), true, "then the draft buttons are enabled");
				}.bind(this))
				.then(this.oRta.undo.bind(this.oRta))
				.then(function() {
					assert.equal(this.oRta.getToolbar().getVersioningVisible(), true, "then the draft buttons are stil shwon");
					assert.equal(this.oRta.getToolbar().getDraftEnabled(), false, "then the draft buttons are disabled");
				}.bind(this));
		});

		QUnit.test("when RTA is started and a draft is available, and and the key user starts working", function(assert) {
			sandbox.stub(this.oRta, "_isDraftAvailable").resolves(true);

			return this.oRta.start()
				.then(function() {
					return new CommandFactory().getCommandFor(this.oGroupElement, "Remove", {
						removedElement : this.oGroupElement
					}, this.oGroupElementDesignTimeMetadata);
				}.bind(this))
				.then(function(oRemoveCommand) {
					return this.oCommandStack.pushAndExecute(oRemoveCommand);
				}.bind(this))
				.then(function() {
					assert.equal(this.oRta.getToolbar().getVersioningVisible(), true, "then the draft buttons are visible");
				}.bind(this))
				.then(this.oRta.undo.bind(this.oRta))
				.then(function() {
					assert.equal(this.oRta.getToolbar().getVersioningVisible(), true, "then the draft buttons are still visible");
				}.bind(this));
		});

		QUnit.test("when RTA is started and a draft is not available and versions response is empty", function(assert) {
			sandbox.stub(this.oRta, "_isDraftAvailable").resolves(false);

			var aVersions = [];
			sandbox.stub(VersionsAPI, "getVersions").resolves(aVersions);

			return this.oRta.start().then(function () {
				var oTextResources = sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta");
				assert.equal(this.oRta.getToolbar().getVersioningVisible(), true, "then the draft buttons are visible");
				assert.equal(this.oRta.getToolbar().getControl("versionLabel").getVisible(), true, "then the version label is visible");
				assert.equal(this.oRta.getToolbar().getControl("versionLabel").getText(), oTextResources.getText("LBL_ORIGNINAL_APP"), "then the version label is empty");
			}.bind(this));
		});

		QUnit.test("when RTA is started and a draft is not available and versions response is empty contain changes before draft was available", function(assert) {
			sandbox.stub(this.oRta, "_isDraftAvailable").resolves(false);

			var aVersions = [{verionNumber: 1}];
			sandbox.stub(VersionsAPI, "getVersions").resolves(aVersions);

			return this.oRta.start().then(function () {
				var oTextResources = sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta");
				assert.equal(this.oRta.getToolbar().getVersioningVisible(), true, "then the draft buttons are visible");
				assert.equal(this.oRta.getToolbar().getControl("versionLabel").getVisible(), true, "then the version label is visible");
				assert.equal(this.oRta.getToolbar().getControl("versionLabel").getText(), oTextResources.getText("LBL_VERSION_1"), "then the version label is empty");
			}.bind(this));
		});

		QUnit.test("when RTA is started and a draft is available and versions just contain draft", function(assert) {
			sandbox.stub(this.oRta, "_isDraftAvailable").resolves(true);

			var aVersions = [{versionNumber: 0}];
			sandbox.stub(VersionsAPI, "getVersions").resolves(aVersions);

			return this.oRta.start().then(function () {
				var oTextResources = sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta");
				assert.equal(this.oRta.getToolbar().getVersioningVisible(), true, "then the draft buttons are visible");
				assert.equal(this.oRta.getToolbar().getControl("versionLabel").getVisible(), true, "then the version label is visible");
				assert.equal(this.oRta.getToolbar().getControl("versionLabel").getText(), oTextResources.getText("LBL_DRAFT"), "then the version label is empty");
			}.bind(this));
		});

		QUnit.test("when RTA is started and a draft is not available and versions contain different versions", function(assert) {
			sandbox.stub(this.oRta, "_isDraftAvailable").resolves(false);

			var aVersions = [{versionNumber: 2, title: "version_2"}, {versionNumber: 1, title: "version_1"}];
			sandbox.stub(VersionsAPI, "getVersions").resolves(aVersions);

			return this.oRta.start().then(function () {
				assert.equal(this.oRta.getToolbar().getVersioningVisible(), true, "then the draft buttons are visible");
				assert.equal(this.oRta.getToolbar().getControl("versionLabel").getVisible(), true, "then the version label is visible");
				assert.equal(this.oRta.getToolbar().getControl("versionLabel").getText(), "version_2", "then the version label is empty");
			}.bind(this));
		});

		QUnit.test("when RTA is started and a draft is available and versions contain different versions and draft", function(assert) {
			sandbox.stub(this.oRta, "_isDraftAvailable").resolves(true);

			var aVersions = [{versionNumber: 0}, {versionNumber: 2, title: "version_2"}, {versionNumber: 1, title: "version_1"}];
			sandbox.stub(VersionsAPI, "getVersions").resolves(aVersions);

			return this.oRta.start().then(function () {
				var oTextResources = sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta");
				assert.equal(this.oRta.getToolbar().getVersioningVisible(), true, "then the draft buttons are visible");
				assert.equal(this.oRta.getToolbar().getControl("versionLabel").getVisible(), true, "then the version label is visible");
				assert.equal(this.oRta.getToolbar().getControl("versionLabel").getText(), oTextResources.getText("LBL_DRAFT"), "then the version label is empty");
			}.bind(this));
		});
	});

	QUnit.module("Given that RuntimeAuthoring is started without toolbar...", {
		beforeEach : function() {
			this.oRta = new RuntimeAuthoring({
				rootControl : oComp,
				showToolbars : false
			});

			return RtaQunitUtils.clear()
			.then(this.oRta.start.bind(this.oRta));
		},
		afterEach : function() {
			this.oRta.destroy();
			sandbox.restore();
			return RtaQunitUtils.clear();
		}
	}, function() {
		QUnit.test("when RTA gets initialized,", function(assert) {
			assert.ok(this.oRta, " then RuntimeAuthoring is created");
			assert.strictEqual(jQuery(".sapUiRtaToolbar").length, 0, "then Toolbar is not visible.");
		});
	});

	QUnit.module("Undo/Redo functionality", {
		beforeEach: function() {
			this.bMacintoshOriginal = Device.os.macintosh;
			Device.os.macintosh = false;

			this.fnUndoStub = sandbox.stub().returns(Promise.resolve());
			this.fnRedoStub = sandbox.stub().returns(Promise.resolve());

			this.oToolbarDomRef = jQuery('<input/>').appendTo('#qunit-fixture').get(0);
			this.oOverlayContainer = jQuery('<button/>').appendTo('#qunit-fixture');
			this.oAnyOtherDomRef = jQuery('<button/>').appendTo('#qunit-fixture').get(0);
			this.oContextMenu = jQuery('<button class="sapUiDtContextMenu" />').appendTo('#qunit-fixture').get(0);
			this.oContextMenu2 = jQuery('<button class="sapUiDtContextMenu" />').appendTo('#qunit-fixture').get(0);

			this.oUndoEvent = new Event("dummyEvent", new EventProvider());
			this.oUndoEvent.keyCode = jQuery.sap.KeyCodes.Z;
			this.oUndoEvent.ctrlKey = true;
			this.oUndoEvent.shiftKey = false;
			this.oUndoEvent.altKey = false;
			this.oUndoEvent.stopPropagation = function() {};

			this.oRedoEvent = new Event("dummyEvent", new EventProvider());
			this.oRedoEvent.keyCode = jQuery.sap.KeyCodes.Y;
			this.oRedoEvent.ctrlKey = true;
			this.oRedoEvent.shiftKey = false;
			this.oRedoEvent.altKey = false;
			this.oRedoEvent.stopPropagation = function() {};

			sandbox.stub(Overlay, "getOverlayContainer").returns(this.oOverlayContainer);

			this.mContext = {
				getToolbar: function () {
					return {
						getDomRef: function() {
							return this.oToolbarDomRef;
						}.bind(this)
					};
				}.bind(this),
				getShowToolbars: function () {
					return true;
				},
				_onUndo: this.fnUndoStub,
				_onRedo: this.fnRedoStub
			};
		},

		afterEach : function() {
			sandbox.restore();
			Device.os.macintosh = this.bMacintoshOriginal;
		}
	}, function() {
		QUnit.test("with focus on an overlay", function(assert) {
			this.oOverlayContainer.get(0).focus();

			RuntimeAuthoring.prototype._onKeyDown.call(this.mContext, this.oUndoEvent);
			assert.equal(this.fnUndoStub.callCount, 1, "then _onUndo was called once");
			RuntimeAuthoring.prototype._onKeyDown.call(this.mContext, this.oRedoEvent);
			assert.equal(this.fnRedoStub.callCount, 1, "then _onRedo was called once");
		});

		QUnit.test("with focus on the toolbar", function(assert) {
			this.oToolbarDomRef.focus();

			RuntimeAuthoring.prototype._onKeyDown.call(this.mContext, this.oUndoEvent);
			assert.equal(this.fnUndoStub.callCount, 1, "then _onUndo was called once");
			RuntimeAuthoring.prototype._onKeyDown.call(this.mContext, this.oRedoEvent);
			assert.equal(this.fnRedoStub.callCount, 1, "then _onRedo was called once");
		});

		QUnit.test("with focus on the context menu", function(assert) {
			this.oContextMenu.focus();

			RuntimeAuthoring.prototype._onKeyDown.call(this.mContext, this.oUndoEvent);
			assert.equal(this.fnUndoStub.callCount, 1, "then _onUndo was called once");
			RuntimeAuthoring.prototype._onKeyDown.call(this.mContext, this.oRedoEvent);
			assert.equal(this.fnRedoStub.callCount, 1, "then _onRedo was called once");

			this.oContextMenu2.focus();

			RuntimeAuthoring.prototype._onKeyDown.call(this.mContext, this.oUndoEvent);
			assert.equal(this.fnUndoStub.callCount, 2, "then _onUndo was called once again");
			RuntimeAuthoring.prototype._onKeyDown.call(this.mContext, this.oRedoEvent);
			assert.equal(this.fnRedoStub.callCount, 2, "then _onRedo was called once again");
		});

		QUnit.test("with focus on an outside element (e.g. dialog)", function(assert) {
			this.oAnyOtherDomRef.focus();

			RuntimeAuthoring.prototype._onKeyDown.call(this.mContext, this.oUndoEvent);
			assert.equal(this.fnUndoStub.callCount, 0, "then _onUndo was not called");
			RuntimeAuthoring.prototype._onKeyDown.call(this.mContext, this.oRedoEvent);
			assert.equal(this.fnRedoStub.callCount, 0, "then _onRedo was not called");
		});

		QUnit.test("during rename", function(assert) {
			jQuery('<div/>', {
				"class": "sapUiRtaEditableField",
				tabIndex: 1
			}).appendTo("#qunit-fixture").get(0).focus();

			RuntimeAuthoring.prototype._onKeyDown.call(this.mContext, this.oUndoEvent);
			assert.equal(this.fnUndoStub.callCount, 0, "then _onUndo was not called");
			RuntimeAuthoring.prototype._onKeyDown.call(this.mContext, this.oRedoEvent);
			assert.equal(this.fnRedoStub.callCount, 0, "then _onRedo was not called");
		});

		QUnit.test("using the public API", function(assert) {
			RuntimeAuthoring.prototype.undo.call(this.mContext);
			assert.equal(this.fnUndoStub.callCount, 1, "then _onUndo was called");
			RuntimeAuthoring.prototype.redo.call(this.mContext);
			assert.equal(this.fnRedoStub.callCount, 1, "then _onRedo was called");
		});

		QUnit.test("macintosh support", function(assert) {
			Device.os.macintosh = true;
			this.oUndoEvent.ctrlKey = false;
			this.oUndoEvent.metaKey = true;

			this.oOverlayContainer.get(0).focus();
			RuntimeAuthoring.prototype._onKeyDown.call(this.mContext, this.oUndoEvent);
			assert.equal(this.fnUndoStub.callCount, 1, "then _onUndo was called once");

			this.oRedoEvent.keyCode = jQuery.sap.KeyCodes.Z;
			this.oRedoEvent.ctrlKey = false;
			this.oRedoEvent.metaKey = true;
			this.oRedoEvent.shiftKey = true;

			RuntimeAuthoring.prototype._onKeyDown.call(this.mContext, this.oRedoEvent);
			assert.equal(this.fnRedoStub.callCount, 1, "then _onRedo was called once");
		});
	});

	QUnit.module("Given that RuntimeAuthoring based on test-view is available together with a CommandStack with changes...", {
		beforeEach : function(assert) {
			var fnDone = assert.async();

			RtaQunitUtils.clear();
			sandbox.stub(Utils, "getAppComponentForControl").returns(oComp);

			// Prepare elements an designtime
			var oElement1 = sap.ui.getCore().byId("Comp1---idMain1--GeneralLedgerDocument.Name");
			var oElement2 = sap.ui.getCore().byId("Comp1---idMain1--GeneralLedgerDocument.CompanyCode");
			var oChangeRegistry = ChangeRegistry.getInstance();
			return RtaQunitUtils.clear()
			.then(function () {
				oChangeRegistry.registerControlsForChanges({
					"sap.ui.comp.smartform.GroupElement" : {
						hideControl : "default"
					}
				});
			})
			.then(function() {
				this.oGroupElementDesignTimeMetadata = new DesignTimeMetadata({
					data : {
						actions : {
							remove : {
								changeType : "hideControl"
							}
						}
					}
				});
				// Create commmands
				var oCommandFactory = new CommandFactory();
				return oCommandFactory.getCommandFor(oElement1, "Remove", {
					removedElement : oElement1
				}, this.oGroupElementDesignTimeMetadata);
			}.bind(this))

			.then(function(oRemoveCommand) {
				this.oRemoveCommand = oRemoveCommand;
				// Create command stack with the commands
				return this.oRemoveCommand.execute();
			}.bind(this))

			.then(function() {
				//After command has been pushed
				var fnStackModifiedSpy = sinon.spy(function() {
					// Start RTA with command stack
					var oRootControl = oComp.getAggregation("rootControl");
					this.oRta = new RuntimeAuthoring({
						rootControl : oRootControl,
						commandStack : this.oCommandStack,
						showToolbars : true,
						flexSettings: {
							developerMode: false
						}
					});

					this.oRta.start()

						.then(function() {
							this.oRootControlOverlay = OverlayRegistry.getOverlay(oRootControl);
							this.oElement2Overlay = OverlayRegistry.getOverlay(oElement2);
						}.bind(this))

						.then(fnDone)

						.catch(function (oError) {
							assert.ok(false, 'catch must never be called - Error: ' + oError);
						});
				}.bind(this));

				this.oCommandStack = new Stack();
				this.oCommandStack.attachEventOnce("modified", fnStackModifiedSpy);
				return this.oCommandStack.pushExecutedCommand(this.oRemoveCommand);
			}.bind(this))

			.catch(function (oError) {
				assert.ok(false, 'catch must never be called - Error: ' + oError);
			});
		},

		afterEach : function() {
			sandbox.restore();
			this.oRemoveCommand.destroy();
			this.oCommandStack.destroy();
			this.oRta.destroy();
			return RtaQunitUtils.clear();
		}
	}, function() {
		QUnit.test("when cut is triggered by keydown-event on rootElementOverlay, with macintosh device and metaKey is pushed", function(assert) {
			var done = assert.async();
			var bMacintoshOriginal;
			var fnStackModifiedSpy = sinon.spy(function() {
				if (fnStackModifiedSpy.calledOnce) {
					assert.equal(this.oCommandStack.getAllExecutedCommands().length, 0, "after CMD + Z the stack is empty");
				} else if (fnStackModifiedSpy.calledTwice) {
					assert.equal(this.oCommandStack.getAllExecutedCommands().length, 1, "after CMD + SHIFT + Z is again 1 command in the stack");
					Device.os.macintosh = bMacintoshOriginal;
					done();
				}
			}.bind(this));
			this.oCommandStack.attachModified(fnStackModifiedSpy);
			bMacintoshOriginal = Device.os.macintosh;
			Device.os.macintosh = true;
			assert.equal(this.oCommandStack.getAllExecutedCommands().length, 1, "1 commands is still in the stack");

			//undo -> _unExecute -> fireModified
			document.activeElement.blur(); // reset focus to body
			fnTriggerKeydown(this.oRootControlOverlay.getDomRef(), jQuery.sap.KeyCodes.Z, false, false, false, true);

			//redo -> execute -> fireModified (inside promise)
			fnTriggerKeydown(this.oElement2Overlay.getDomRef(), jQuery.sap.KeyCodes.Z, true, false, false, true);
		});

		QUnit.test("when cut is triggered by keydown-event on rootElementOverlay, with no macintosh device and ctrlKey is pushed", function(assert) {
			var done = assert.async();
			var bMacintoshOriginal;
			var fnStackModifiedSpy = sinon.spy(function() {
				if (fnStackModifiedSpy.calledOnce) {
					assert.equal(this.oCommandStack.getAllExecutedCommands().length, 0, "after CTRL + Z the stack is empty");
				} else if (fnStackModifiedSpy.calledTwice) {
					assert.equal(this.oCommandStack.getAllExecutedCommands().length, 1, "after CTRL + Y is again 1 command in the stack");
					Device.os.macintosh = bMacintoshOriginal;
					done();
				}
			}.bind(this));
			this.oCommandStack.attachModified(fnStackModifiedSpy);
			bMacintoshOriginal = Device.os.macintosh;
			Device.os.macintosh = false;
			assert.equal(this.oCommandStack.getAllExecutedCommands().length, 1, "1 commands is still in the stack");

			//undo -> _unExecute -> fireModified
			document.activeElement.blur(); // reset focus to body
			fnTriggerKeydown(this.oRootControlOverlay.getDomRef(), jQuery.sap.KeyCodes.Z, false, false, true, false);

			//redo -> execute -> fireModified (inside promise)
			fnTriggerKeydown(this.oElement2Overlay.getDomRef(), jQuery.sap.KeyCodes.Y, false, false, true, false);
		});

		QUnit.test("when _handleElementModified is called if a create container command was executed on a simple form", function(assert) {
			var done = assert.async();

			var fnFireElementModifiedSpy = sandbox.spy(this.oRta._mDefaultPlugins["createContainer"], "fireElementModified");

			var oSimpleForm = sap.ui.getCore().byId("Comp1---idMain1--SimpleForm");
			var oSimpleFormOverlay = OverlayRegistry.getOverlay(oSimpleForm.getAggregation("form").getId());

			sandbox.stub(this.oRta.getPlugins()["rename"], "startEdit").callsFake(function (oNewContainerOverlay) {
				sap.ui.getCore().applyChanges();
				var oArgs = fnFireElementModifiedSpy.getCall(0).args[0];
				var sNewControlContainerId = this.oRta._mDefaultPlugins["createContainer"].getCreatedContainerId(oArgs.action, oArgs.newControlId);
				assert.ok(fnFireElementModifiedSpy.calledOnce, "then 'fireElementModified' from the createContainer plugin is called once");
				assert.ok(true, "then the new container starts the edit for rename");
				assert.strictEqual(oNewContainerOverlay.getElement().getId(), sNewControlContainerId, "then rename is called with the new container's overlay");
				assert.ok(oNewContainerOverlay.isSelected(), "then the new container is selected");
				this.oCommandStack.undo().then(done);
			}.bind(this));

			this.oRta.getPlugins()["createContainer"].handleCreate(false, oSimpleFormOverlay);
			sap.ui.getCore().applyChanges();
		});

		QUnit.test("when _handleElementModified is called if a create container command was executed on a smart form", function(assert) {
			var done = assert.async();

			var fnFireElementModifiedSpy = sinon.spy(this.oRta._mDefaultPlugins["createContainer"], "fireElementModified");

			var oSmartForm = sap.ui.getCore().byId("Comp1---idMain1--MainForm");
			var oSmartFormOverlay = OverlayRegistry.getOverlay(oSmartForm.getId());

			sandbox.stub(this.oRta.getPlugins()["rename"], "startEdit").callsFake(function (oNewContainerOverlay) {
				var oArgs = fnFireElementModifiedSpy.getCall(0).args[0];
				var sNewControlContainerId = this.oRta._mDefaultPlugins["createContainer"].getCreatedContainerId(oArgs.action, oArgs.newControlId);
				sap.ui.getCore().applyChanges();
				assert.ok(true, "then the new container starts the edit for rename");
				assert.strictEqual(oNewContainerOverlay.getElement().getId(), sNewControlContainerId, "then rename is called with the new container's overlay");
				assert.ok(oNewContainerOverlay.isSelected(), "then the new container is selected");
				this.oCommandStack.undo().then(done);
			}.bind(this));

			this.oRta.getPlugins()["createContainer"].handleCreate(false, oSmartFormOverlay);
			sap.ui.getCore().applyChanges();
		});

		QUnit.test("when _handleElementModified is called if a create container command was executed on an empty form", function(assert) {
			var done = assert.async();

			// An existing empty Form is used for the test
			var oForm = sap.ui.getCore().byId("Comp1---idMain1--MainForm1");
			var oFormOverlay = OverlayRegistry.getOverlay(oForm.getId());

			sandbox.stub(this.oRta.getPlugins()["rename"], "startEdit").callsFake(function (oNewContainerOverlay) {
				sap.ui.getCore().applyChanges();
				assert.ok(oNewContainerOverlay.isSelected(), "then the new container is selected");
				assert.ok(true, "then the new container starts the edit for rename");
				this.oCommandStack.undo().then(done);
			}.bind(this));

			this.oRta.getPlugins()["createContainer"].handleCreate(false, oFormOverlay);
			sap.ui.getCore().applyChanges();
		});
	});

	QUnit.module("Given that RuntimeAuthoring is available together with a CommandStack with changes...", {
		beforeEach : function() {
			sandbox.stub(Utils, "getAppComponentForControl").returns(oComp);
			var oGroupElement1 = new GroupElement({id : oComp.createId("element1")});
			var oGroupElement2 = new GroupElement({id : oComp.createId("element2")});
			var oGroup = new Group({
				id : oComp.createId("group"),
				groupElements : [oGroupElement1, oGroupElement2]
			});
			this.oSmartForm = new SmartForm({
				id : oComp.createId("smartform"),
				groups : [oGroup]
			});
			this.oSmartForm.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
			var oGroupElementDesignTimeMetadata = new DesignTimeMetadata({
				data : {
					actions : {
						remove : {
							changeType : "hideControl"
						}
					}
				}
			});
			var oCommandFactory = new CommandFactory();
			this.oCommandStack = new Stack();
			this.oRta = new RuntimeAuthoring({
				rootControl : this.oSmartForm,
				commandStack : this.oCommandStack,
				showToolbars : true
			});
			sandbox.stub(this.oRta, "_isDraftAvailable").returns(Promise.resolve(false));

			return RtaQunitUtils.clear()
			.then(this.oRta.start.bind(this.oRta))
			.then(function() {
				return oCommandFactory.getCommandFor(oGroupElement1, "Remove", {
					removedElement : oGroupElement1
				}, oGroupElementDesignTimeMetadata);
			})
			.then(function(oRemoveCommand) {
				return this.oCommandStack.pushAndExecute(oRemoveCommand);
			}.bind(this))
			.then(function() {
				return oCommandFactory.getCommandFor(oGroupElement2, "Remove", {
					removedElement : oGroupElement2
				}, oGroupElementDesignTimeMetadata);
			})
			.then(function(oRemoveCommand) {
				return this.oCommandStack.pushAndExecute(oRemoveCommand);
			}.bind(this));
		},
		afterEach : function() {
			sandbox.restore();
			this.oSmartForm.destroy();
			this.oRta.destroy();
			return RtaQunitUtils.clear();
		}
	}, function() {
		QUnit.test("when trying to stop rta with error in saving changes,", function(assert) {
			var fnStubSerialize = function() {
				return Promise.reject();
			};
			sandbox.stub(this.oRta, "_serializeToLrep").callsFake(fnStubSerialize);

			return this.oRta.stop(false).catch(function() {
				assert.ok(true, "then the promise got rejected");
				assert.ok(this.oRta, "RTA is still up and running");
				assert.equal(this.oCommandStack.getAllExecutedCommands().length, 2, "2 commands are still in the stack");
				assert.strictEqual(jQuery(".sapUiRtaToolbar:visible").length, 1, "and the Toolbar is visible.");
			}.bind(this));
		});

		QUnit.test("when stopping rta without saving changes,", function(assert) {
			return this.oRta.stop(true)
				.then(function() {
					assert.ok(true, "then the promise got resolved");
					assert.equal(this.oCommandStack.getAllExecutedCommands().length, 2, "2 commands are still in the stack");
				}.bind(this))
				.then(RtaQunitUtils.getNumberOfChangesForTestApp)
				.then(function (iNumOfChanges) {
					assert.equal(iNumOfChanges, 0, "there is no change written");
				});
		});

		QUnit.test("when stopping rta with saving changes", function(assert) {
			return this.oRta.stop()
			.then(function() {
				assert.ok(true, "then the promise got resolved");
			})
			.then(RtaQunitUtils.getNumberOfChangesForTestApp)
			.then(function (iNumberOfChanges) {
				assert.equal(iNumberOfChanges, 2);
			});
		});

		QUnit.test("when stopping rta with saving changes and versioning is disabled", function(assert) {
			var oSaveStub = sandbox.stub(PersistenceWriteAPI, "save").resolves();

			return this.oRta._serializeToLrep()
			.then(function () {
				assert.equal(oSaveStub.callCount, 1, "save was triggered");
				var aSavePropertyBag = oSaveStub.getCall(0).args[0];
				assert.equal(aSavePropertyBag.draft, false, "the draft flag is set to false");
			});
		});

		QUnit.test("when stopping rta with saving changes and versioning is enabled", function(assert) {
			this.oRta._bVersioningEnabled = true;

			var oSaveStub = sandbox.stub(PersistenceWriteAPI, "save").resolves();

			return this.oRta._serializeToLrep()
			.then(function () {
				assert.equal(oSaveStub.callCount, 1, "save was triggered");
				var aSavePropertyBag = oSaveStub.getCall(0).args[0];
				assert.equal(aSavePropertyBag.draft, true, "the draft flag is set to true");
			});
		});

		QUnit.test("When transport function is called and transportChanges returns Promise.resolve() when the running application is not an application variant", function(assert) {
			sandbox.stub(PersistenceWriteAPI, "publish").resolves();
			var fnGetResetAndPublishInfoStub = sandbox.stub(PersistenceWriteAPI, "getResetAndPublishInfo").resolves({
				isPublishEnabled: false,
				isResetEnabled: true
			});
			var oMessageToastStub = sandbox.stub(this.oRta, "_showMessageToast");
			var oAppVariantRunningStub = sandbox.stub(Utils, "isApplicationVariant").returns(false);
			return this.oRta.transport().then(function() {
				assert.equal(oMessageToastStub.callCount, 1, "then the messageToast was shown");
				assert.equal(oAppVariantRunningStub.callCount, 1, "then isApplicationVariant() got called");
				assert.equal(fnGetResetAndPublishInfoStub.callCount, 1, "then the status of publish and reset button is evaluated");
			});
		});
	});

	QUnit.module("Given that RuntimeAuthoring is started with different plugin sets...", {
		beforeEach : function() {
			var oCommandFactory = new CommandFactory();

			this.oContextMenuPlugin = new ContextMenuPlugin("nonDefaultContextMenu");
			this.oRemovePlugin = new Remove({
				id : "nonDefaultRemovePlugin",
				commandFactory : oCommandFactory
			});

			this.oRta = new RuntimeAuthoring({
				rootControl : oComp.getAggregation("rootControl"),
				showToolbars : false,
				plugins : {
					remove : this.oRemovePlugin,
					contextMenu : this.oContextMenuPlugin
				}
			});

			this.fnDestroy = sandbox.spy(this.oRta, "_destroyDefaultPlugins");

			return RtaQunitUtils.clear()
			.then(this.oRta.start.bind(this.oRta));
		},
		afterEach : function() {
			this.oContextMenuPlugin.destroy();
			this.oRemovePlugin.destroy();
			this.oRta.destroy();
			sandbox.restore();
			return RtaQunitUtils.clear();
		}
	}, function() {
		QUnit.test("when RTA gets initialized with custom plugins only", function(assert) {
			assert.ok(this.oRta, " then RuntimeAuthoring is created");
			assert.equal(this.oRta.getPlugins()['contextMenu'], this.oContextMenuPlugin, " and the custom ContextMenuPlugin is set");
			assert.equal(this.oRta.getPlugins()['rename'], undefined, " and the default plugins are not loaded");
			assert.equal(this.fnDestroy.callCount, 1, " and _destroyDefaultPlugins have been called 1 time after oRta.start()");

			return this.oRta.stop(false).then(function() {
				this.oRta.destroy();
				assert.equal(this.fnDestroy.callCount, 2, " and _destroyDefaultPlugins have been called once again after oRta.stop()");
			}.bind(this));
		});
	});

	QUnit.module("Given that RuntimeAuthoring is started with a scope set...", {
		beforeEach : function() {
			this.oRta = new RuntimeAuthoring({
				rootControl : oComp.getAggregation("rootControl"),
				metadataScope : "someScope"
			});

			return RtaQunitUtils.clear()
			.then(this.oRta.start.bind(this.oRta));
		},
		afterEach : function() {
			this.oRta.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when RTA is started, then the overlay has the scoped metadata associated", function(assert) {
			assert.equal(this.oRta.getMetadataScope(), "someScope", "then RTA knows the scope");
			assert.equal(this.oRta._oDesignTime.getScope(), "someScope", "then designtime knows the scope");

			var oOverlayWithInstanceSpecificMetadata = OverlayRegistry.getOverlay("Comp1---idMain1--Dates.SpecificFlexibility");
			var mDesignTimeMetadata = oOverlayWithInstanceSpecificMetadata.getDesignTimeMetadata().getData();
			assert.equal(mDesignTimeMetadata.newKey, "new", "New scoped key is added");
			assert.equal(mDesignTimeMetadata.someKeyToOverwriteInScopes, "scoped", "Scope can overwrite keys");
			assert.equal(mDesignTimeMetadata.some.deep, null, "Scope can delete keys");

			var oRootOverlayWithInstanceSpecificMetadata = OverlayRegistry.getOverlay("Comp1---app");
			var mDesignTimeMetadata2 = oRootOverlayWithInstanceSpecificMetadata.getDesignTimeMetadata().getData();
			assert.equal(mDesignTimeMetadata2.newKey, "new", "New scoped key is added");
			assert.equal(mDesignTimeMetadata2.someKeyToOverwriteInScopes, "scoped", "Scope can overwrite keys");
			assert.equal(mDesignTimeMetadata2.some.deep, null, "Scope can delete keys");

			var oErrorStub = sandbox.stub(Log, "error");
			this.oRta.setMetadataScope("some other scope");
			assert.equal(this.oRta.getMetadataScope(), "someScope", "then the scope in RTA didn't change");
			assert.equal(oErrorStub.callCount, 1, "and an error was logged");
		});
	});

	QUnit.module("Given that RuntimeAuthoring is created but not started", {
		beforeEach : function() {
			this.oRootControl = oCompCont.getComponentInstance().getAggregation("rootControl");
			this.oRta = new RuntimeAuthoring({
				rootControl : this.oRootControl,
				showToolbars : false,
				flexSettings: {
					layer: Layer.CUSTOMER
				}
			});
			sandbox.stub(this.oRta, "_serializeToLrep").returns(Promise.resolve());
			this.oDeleteChangesStub = sandbox.stub(this.oRta, "_deleteChanges");
			this.oEnableRestartSpy = sandbox.spy(RuntimeAuthoring, "enableRestart");
			this.oHandleParametersOnExitSpy = sandbox.spy(this.oRta, "_handleParametersOnExit");
			this.oReloadPageStub = sandbox.stub(this.oRta, "_reloadPage");
		},
		afterEach : function() {
			this.oRta.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("When transport function is called and transportChanges returns Promise.resolve() when the running application is not an application variant", function(assert) {
			var fnPublishStub = sandbox.stub(PersistenceWriteAPI, "publish").resolves();
			var oMessageToastStub = sandbox.stub(this.oRta, "_showMessageToast");
			var oAppVariantRunningStub = sandbox.stub(Utils, "isApplicationVariant").returns(false);
			return this.oRta.transport().then(function() {
				assert.equal(oMessageToastStub.callCount, 1, "then the messageToast was shown");
				assert.equal(oAppVariantRunningStub.callCount, 1, "then isApplicationVariant() got called");
				assert.deepEqual(fnPublishStub.firstCall.args[0], {
					selector: this.oRootControl,
					styleClass: RtaUtils.getRtaStyleClassName(),
					layer: Layer.CUSTOMER,
					appVariantDescriptors: []
				}, "then style class and layer was passed correctly");
			}.bind(this));
		});

		QUnit.test("When transport function is called and transportChanges returns Promise.resolve() when the running application is an application variant by navigation parameters", function(assert) {
			sandbox.stub(PersistenceWriteAPI, "publish").resolves();
			sandbox.stub(this.oRta, "_showMessageToast");
			sandbox.stub(Utils, "isApplicationVariant").returns(true);
			sandbox.stub(Utils, "isVariantByStartupParameter").returns(true);
			var oRtaAppVariantFeatureStub = sandbox.stub(RtaAppVariantFeature, "getAppVariantDescriptor");
			return this.oRta.transport().then(function() {
				assert.equal(oRtaAppVariantFeatureStub.callCount, 0, "the RtaAppVariantFeature.getAppVariantDescriptor was not called");
			});
		});

		QUnit.test("When transport function is called and transportChanges returns Promise.resolve() when the running application is an application variant", function(assert) {
			var fnPublishStub = sandbox.stub(PersistenceWriteAPI, "publish").resolves();
			var oMessageToastStub = sandbox.stub(this.oRta, "_showMessageToast");
			var oAppVariantRunningStub = sandbox.stub(Utils, "isApplicationVariant").returns(true);
			var oDummyObject = {
				foo: "hugo"
			};
			var aAppVariantDescriptors = [oDummyObject];
			sandbox.stub(RtaAppVariantFeature, "getAppVariantDescriptor").resolves(oDummyObject);
			return this.oRta.transport().then(function() {
				assert.equal(oMessageToastStub.callCount, 1, "then the messageToast was shown");
				assert.equal(oAppVariantRunningStub.callCount, 1, "then isAppVariantRunning() got called");
				assert.deepEqual(fnPublishStub.firstCall.args[0], {
					selector: this.oRootControl,
					appVariantDescriptors: aAppVariantDescriptors,
					layer: Layer.CUSTOMER,
					styleClass: "sapUiRTABorder"
				}, "then appVariantDescriptors, layer and styleClass parameters were passed correctly");
			}.bind(this));
		});

		QUnit.test("When transport function is called and Promise.reject() is returned from the flex persistence", function(assert) {
			sandbox.stub(PersistenceWriteAPI, "publish").rejects(new Error("Error"));
			var oMessageToastStub = sandbox.stub(this.oRta, "_showMessageToast");
			var oAppVariantRunningStub = sandbox.stub(Utils, "isApplicationVariant").returns(false);
			var oShowErrorStub = sandbox.stub(Log, "error");
			var oErrorBoxStub = sandbox.stub(MessageBox, "error");
			return this.oRta.transport().then(function() {
				assert.equal(oMessageToastStub.callCount, 0, "then the messageToast was not shown");
				assert.equal(oAppVariantRunningStub.callCount, 1, "then isAppVariantRunning() got called");
				assert.equal(oShowErrorStub.callCount, 1, "then the error was logged");
				assert.equal(oErrorBoxStub.callCount, 1, "and a MessageBox.error was shown");
			});
		});

		[{
			error: {
				userMessage: "Error text 1\nError text 2\n"
			},
			errorText: "Error text 1\nError text 2\n",
			propertyName: "userMessage"
		},
		{
			error: {
				messages: [],
				message: "messageText"
			},
			errorText: "messageText",
			propertyName: "message"
		},
		{
			error: {
				messages: [],
				stack: "messageText"
			},
			errorText: "messageText",
			propertyName: "stack"
		},
		{
			error: {
				messages: [],
				status: "messageText"
			},
			errorText: "messageText",
			propertyName: "status"
		}].forEach(function (oErrorResponse) {
			QUnit.test("When transport function is called and transportChanges returns Promise.reject() with error in the property: " + oErrorResponse.propertyName, function (assert) {
				var oTextResources = sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta");
				var sErrorBoxText = oTextResources.getText("MSG_LREP_TRANSFER_ERROR") + "\n"
					+ oTextResources.getText("MSG_ERROR_REASON", oErrorResponse.errorText);
				sandbox.stub(PersistenceWriteAPI, "publish").rejects(oErrorResponse.error);
				var oAppVariantRunningStub = sandbox.stub(Utils, "isApplicationVariant").returns(false);
				var oMessageToastStub = sandbox.stub(this.oRta, "_showMessageToast");
				var oShowErrorStub = sandbox.stub(Log, "error");
				var oErrorBoxStub = sandbox.stub(MessageBox, "error");
				return this.oRta.transport().then(function () {
					assert.equal(oMessageToastStub.callCount, 0, "then the messageToast was not shown");
					assert.equal(oAppVariantRunningStub.callCount, 1, "then isAppVariantRunning() got called");
					assert.equal(oShowErrorStub.callCount, 1, "then the error was logged");
					assert.equal(oErrorBoxStub.callCount, 1, "and a MessageBox.error was shown");
					assert.equal(oErrorBoxStub.args[0][0], sErrorBoxText, "and the shown error text is correct");
				});
			});
		});

		QUnit.test("When transport function is called and transportChanges returns Promise.resolve() with 'Error' as parameter", function(assert) {
			sandbox.stub(PersistenceWriteAPI, "publish").resolves('Error');
			var oMessageToastStub = sandbox.stub(this.oRta, "_showMessageToast");
			var oAppVariantRunningStub = sandbox.stub(Utils, "isApplicationVariant").returns(false);
			return this.oRta.transport().then(function() {
				assert.equal(oMessageToastStub.callCount, 0, "then the messageToast was not shown");
				assert.equal(oAppVariantRunningStub.callCount, 1, "then isAppVariantRunning() got called");
			});
		});

		QUnit.test("When transport function is called and transportChanges returns Promise.resolve() with 'Cancel' as parameter", function(assert) {
			sandbox.stub(PersistenceWriteAPI, "publish").resolves('Cancel');
			var oMessageToastStub = sandbox.stub(this.oRta, "_showMessageToast");
			var oAppVariantRunningStub = sandbox.stub(Utils, "isApplicationVariant").returns(false);
			return this.oRta.transport().then(function() {
				assert.equal(oMessageToastStub.callCount, 0, "then the messageToast was not shown");
				assert.equal(oAppVariantRunningStub.callCount, 1, "then isAppVariantRunning() got called");
			});
		});

		QUnit.test("When restore function is called in the CUSTOMER layer", function(assert) {
			var done = assert.async();
			sandbox.stub(MessageBox, "confirm").callsFake(function(sMessage, mParameters) {
				assert.equal(sMessage, this.oRta._getTextResources().getText("FORM_PERS_RESET_MESSAGE"), "then the message is correct");
				assert.equal(mParameters.title, this.oRta._getTextResources().getText("FORM_PERS_RESET_TITLE"), "then the message is correct");

				mParameters.onClose("OK");
				assert.equal(this.oDeleteChangesStub.callCount, 1, "then _deleteChanges was called");
				assert.equal(this.oEnableRestartSpy.callCount, 1, "then restart was enabled...");
				assert.equal(this.oEnableRestartSpy.lastCall.args[0], Layer.CUSTOMER, "for the correct layer");

				mParameters.onClose("notOK");
				assert.equal(this.oDeleteChangesStub.callCount, 1, "then _deleteChanges was not called again");
				assert.equal(this.oEnableRestartSpy.callCount, 1, "then restart was not  enabled again");
				done();
			}.bind(this));

			this.oRta.restore();
		});

		QUnit.test("When restore function is called in the USER layer", function(assert) {
			var done = assert.async();
			this.oRta.setFlexSettings({
				layer: Layer.USER
			});
			sandbox.stub(MessageBox, "confirm").callsFake(function(sMessage, mParameters) {
				assert.equal(sMessage, this.oRta._getTextResources().getText("FORM_PERS_RESET_MESSAGE_PERSONALIZATION"), "then the message is correct");
				assert.equal(mParameters.title, this.oRta._getTextResources().getText("BTN_RESTORE"), "then the message is correct");

				mParameters.onClose("OK");
				assert.equal(this.oDeleteChangesStub.callCount, 1, "then _deleteChanges was called");
				assert.equal(this.oEnableRestartSpy.callCount, 1, "then restart was enabled...");
				assert.equal(this.oEnableRestartSpy.lastCall.args[0], Layer.USER, "for the correct layer");

				mParameters.onClose("notOK");
				assert.equal(this.oDeleteChangesStub.callCount, 1, "then _deleteChanges was not called again");
				assert.equal(this.oEnableRestartSpy.callCount, 1, "then restart was not  enabled again");
				done();
			}.bind(this));

			this.oRta.restore();
		});

		QUnit.test("when calling '_deleteChanges' successfully", function(assert) {
			assert.expect(3);
			this.oDeleteChangesStub.restore();
			sandbox.stub(PersistenceWriteAPI, "reset").callsFake(function() {
				assert.deepEqual(arguments[0], {
					selector: oCompCont.getComponentInstance(),
					generator: "Change.createInitialFileContent",
					layer: Layer.CUSTOMER
				}, "then the correct parameters were passed");
				return Promise.resolve();
			});

			return this.oRta._deleteChanges().then(function() {
				assert.equal(this.oHandleParametersOnExitSpy.callCount, 1, "then delete draft url parameter");
				assert.equal(this.oReloadPageStub.callCount, 1, "then page reload is triggered");
			}.bind(this));
		});

		QUnit.test("when calling '_deleteChanges' successfully in AppVariant", function(assert) {
			assert.expect(3);
			this.oDeleteChangesStub.restore();
			sandbox.stub(Utils, "isApplicationVariant").returns(true);
			sandbox.stub(PersistenceWriteAPI, "reset").callsFake(function() {
				assert.deepEqual(arguments[0], {
					selector: oCompCont.getComponentInstance(),
					generator: "Change.createInitialFileContent",
					layer: Layer.CUSTOMER
				}, "then the correct generator and layer was passed");
				return Promise.resolve();
			});

			return this.oRta._deleteChanges().then(function() {
				assert.equal(this.oHandleParametersOnExitSpy.callCount, 1, "then delete draft url parameter");
				assert.equal(this.oReloadPageStub.callCount, 1, "then page reload is triggered");
			}.bind(this));
		});

		QUnit.test("when calling '_deleteChanges and there is an error', ", function(assert) {
			this.oDeleteChangesStub.restore();

			sandbox.stub(PersistenceWriteAPI, "reset").rejects("Error");

			sandbox.stub(RtaUtils, "_showMessageBox").callsFake(function(sIconType, sHeader, sMessage, sError) {
				assert.equal(sError, "Error", "and a message box shows the error to the user");
			});

			return this.oRta._deleteChanges().then(function() {
				assert.equal(this.oReloadPageStub.callCount, 0, "then page reload is not triggered");
			}.bind(this));
		});

		QUnit.test("when calling '_deleteChanges and reset is cancelled', ", function(assert) {
			this.oDeleteChangesStub.restore();

			sandbox.stub(PersistenceWriteAPI, "reset").returns(Promise.reject("cancel"));
			var oStubShowError = sandbox.stub(RtaUtils, "_showMessageBox");

			return this.oRta._deleteChanges().then(function() {
				assert.equal(this.oReloadPageStub.callCount, 0, "then page reload is not triggered");
				assert.equal(oStubShowError.callCount, 0, "no error messages is shown");
			}.bind(this));
		});

		QUnit.test("when calling '_handleElementModified' and the command fails because of dependencies", function(assert) {
			assert.expect(2);
			var oLogStub = sandbox.stub(Log, "error");
			var oMessageBoxStub = sandbox.stub(RtaUtils, "_showMessageBox");
			var oCommandStack = {
				pushAndExecute: function() {
					return Promise.reject(Error("Some stuff.... The following Change cannot be applied because of a dependency .... some other stuff"));
				}
			};
			sandbox.stub(this.oRta, "getCommandStack").returns(oCommandStack);
			var oEvent = {
				getParameter: function(sParameter) {
					if (sParameter === "command") {
						return new RTABaseCommand();
					}
				}
			};
			return this.oRta._handleElementModified(oEvent)
			.then(function() {
				assert.equal(oLogStub.callCount, 1, "one error got logged");
				assert.equal(oMessageBoxStub.callCount, 1, "one MessageBox got shown");
			});
		});

		QUnit.test("when calling '_handleElementModified' and the command fails, but not because of dependencies", function(assert) {
			assert.expect(2);
			var oLogStub = sandbox.stub(Log, "error");
			var oMessageBoxStub = sandbox.stub(RtaUtils, "_showMessageBox");
			var oCommandStack = {
				pushAndExecute: function() {
					return Promise.reject(Error("Some stuff........ some other stuff"));
				}
			};
			sandbox.stub(this.oRta, "getCommandStack").returns(oCommandStack);
			var oEvent = {
				getParameter: function(sParameter) {
					if (sParameter === "command") {
						return new RTABaseCommand();
					}
				}
			};
			return this.oRta._handleElementModified(oEvent)
			.then(function() {
				assert.equal(oLogStub.callCount, 1, "one error got logged");
				assert.equal(oMessageBoxStub.callCount, 0, "no MessageBox got shown");
			});
		});

		QUnit.test("when enabling restart", function(assert) {
			var sComponentId = "restartingComponent";
			var oComponent = {
				getManifestEntry: function () {},
				getMetadata: function () {
					return {
						getName: function () {
							return sComponentId;
						}
					};
				}
			};
			sandbox.stub(Utils, "getAppComponentForControl").returns(oComponent);
			var sLayer = "LAYER";
			RuntimeAuthoring.enableRestart(sLayer, {});
			var sRestartingComponent = window.sessionStorage.getItem("sap.ui.rta.restart." + sLayer);
			assert.ok(RuntimeAuthoring.needsRestart(sLayer), "then restart is needed");
			assert.equal(sRestartingComponent, sComponentId + ".Component", "and the component ID is set with an added .Component");
		});

		QUnit.test("when enabling and disabling restart", function(assert) {
			var sLayer = "LAYER";
			RuntimeAuthoring.enableRestart(sLayer);
			RuntimeAuthoring.enableRestart(sLayer);
			RuntimeAuthoring.enableRestart(sLayer);

			RuntimeAuthoring.disableRestart(sLayer);

			assert.notOk(RuntimeAuthoring.needsRestart(sLayer), "then restart is not needed");
		});
	});

	QUnit.module("Given that RuntimeAuthoring is created without flexSettings", {
		beforeEach : function() {
			sandbox.stub(Utils, "buildLrepRootNamespace").returns("rootNamespace/");
			this.oRootControl = oCompCont.getComponentInstance().getAggregation("rootControl");
			this.oRta = new RuntimeAuthoring({
				rootControl : this.oRootControl,
				showToolbars : false
			});
		},
		afterEach : function() {
			this.oRta.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when the uri-parameter sap-ui-layer is set to 'VENDOR',", function(assert) {
			assert.equal(this.oRta.getLayer(), Layer.CUSTOMER, "then the layer is the default 'CUSTOMER'");

			sandbox.stub(UriParameters.prototype, "get").withArgs("sap-ui-layer").returns(Layer.VENDOR);

			this.oRta.setFlexSettings(this.oRta.getFlexSettings());
			assert.equal(this.oRta.getLayer(), Layer.VENDOR, "then the function reacts to the URL parameter and sets the layer to VENDOR");
		});

		QUnit.test("when the uri-parameter sap-ui-layer is set to 'vendor',", function(assert) {
			assert.equal(this.oRta.getLayer(), Layer.CUSTOMER, "then the layer is the default 'CUSTOMER'");

			sandbox.stub(UriParameters.prototype, "get").withArgs("sap-ui-layer").returns("vendor");

			this.oRta.setFlexSettings(this.oRta.getFlexSettings());
			assert.equal(this.oRta.getLayer(), Layer.VENDOR, "then the function reacts to the URL parameter and sets the layer to VENDOR");
		});

		QUnit.test("when setFlexSettings is called", function(assert) {
			assert.deepEqual(
				this.oRta.getFlexSettings(),
				{
					layer: Layer.CUSTOMER,
					developerMode: true
				}
			);

			this.oRta.setFlexSettings({
				layer: Layer.USER,
				namespace: "namespace"
			});

			assert.deepEqual(this.oRta.getFlexSettings(), {
				layer: Layer.USER,
				developerMode: true,
				namespace: "namespace"
			});

			this.oRta.setFlexSettings({
				scenario: "scenario"
			});

			assert.deepEqual(
				this.oRta.getFlexSettings(),
				{
					layer: Layer.USER,
					developerMode: true,
					namespace: "rootNamespace/changes/",
					rootNamespace: "rootNamespace/",
					scenario: "scenario"
				}
			);
		});
	});

	QUnit.module("Given _onStackModified", {
		beforeEach : function() {
			this.oRootControl = oCompCont.getComponentInstance().getAggregation("rootControl");
			this.oRta = new RuntimeAuthoring({
				rootControl : this.oRootControl,
				showToolbars : true
			});
			return this.oRta.start();
		},
		afterEach : function() {
			this.oRta.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when versioning is not enabled", function(assert) {
			this.oRta._bVersioningEnabled = false;
			this.oRta._onStackModified(this.oRta.getFlexSettings());
			var oHandleVersionToolbarSpy = sandbox.spy(this.oRta, "_handleVersionToolbar");
			this.oRta._onStackModified(this.oRta.getFlexSettings());
			assert.equal(oHandleVersionToolbarSpy.callCount, 0, "_handleVersionToolbar was not called");
		});

		QUnit.test("when versioning is enabled but no draft or undoable change is present", function(assert) {
			this.oRta._bVersioningEnabled = true;
			this.oRta._onStackModified(this.oRta.getFlexSettings());
			var oSetDraftEnabledSpy = sandbox.spy(this.oRta.getToolbar(), "setDraftEnabled");
			var oSetVersionLabelSpy = sandbox.spy(this.oRta, "_setVersionLabel");
			var oHandleVersionToolbarSpy = sandbox.spy(this.oRta, "_handleVersionToolbar");
			this.oRta._onStackModified(this.oRta.getFlexSettings());
			assert.equal(oSetDraftEnabledSpy.callCount, 1, "the draft visibility was set");
			assert.equal(oSetDraftEnabledSpy.getCall(0).args[0], false, "to false");
			assert.equal(oSetVersionLabelSpy.callCount, 1, "_setVersionLabel was called");
			assert.equal(oSetVersionLabelSpy.getCall(0).args[0], false, "with bDraftEnabled false");
			assert.equal(oHandleVersionToolbarSpy.callCount, 1, "_handleVersionToolbar was called");
			assert.equal(oHandleVersionToolbarSpy.getCall(0).args[0], false, "with bCanUndo false");
		});

		QUnit.test("when versioning is enabled and a draft is present", function(assert) {
			this.oRta._bVersioningEnabled = true;
			this.oRta.bInitialDraftAvailable = true;
			var oSetDraftEnabledSpy = sandbox.spy(this.oRta.getToolbar(), "setDraftEnabled");
			var oSetVersionLabelAccentColorSpy = sandbox.spy(this.oRta.getToolbar(), "setVersionLabelAccentColor");
			var oSetVersionLabelSpy = sandbox.spy(this.oRta, "_setVersionLabel");
			var oHandleVersionToolbarSpy = sandbox.spy(this.oRta, "_handleVersionToolbar");
			this.oRta._onStackModified(this.oRta.getFlexSettings());
			assert.equal(oSetDraftEnabledSpy.callCount, 1, "the draft visibility was set");
			assert.equal(oSetDraftEnabledSpy.getCall(0).args[0], true, "to true");
			assert.equal(oSetVersionLabelAccentColorSpy.callCount, 1, "setVersionLabelAccentColor was set");
			assert.equal(oSetVersionLabelAccentColorSpy.getCall(0).args[0], true, "to true");
			assert.equal(oSetVersionLabelSpy.callCount, 1, "_setVersionLabel was called");
			assert.equal(oSetVersionLabelSpy.getCall(0).args[0], true, "with bDraftEnabled true");
			assert.equal(oHandleVersionToolbarSpy.callCount, 1, "_handleVersionToolbar was called");
			assert.equal(oHandleVersionToolbarSpy.getCall(0).args[0], false, "with bCanUndo false");
			var oTextResources = sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta");
			assert.equal(this.oRta.getToolbar().getControl("versionLabel").getText(), oTextResources.getText("LBL_DRAFT"), "then the version label is set to 'DRAFT'");
		});

		QUnit.test("when versioning is enabled and a undoable change is present", function(assert) {
			this.oRta._bVersioningEnabled = true;
			sandbox.stub(this.oRta.getCommandStack(), "canUndo").returns(true);
			var oSetDraftEnabledSpy = sandbox.spy(this.oRta.getToolbar(), "setDraftEnabled");
			var oSetVersionLabelAccentColorSpy = sandbox.spy(this.oRta.getToolbar(), "setVersionLabelAccentColor");
			var oSetVersionLabelSpy = sandbox.spy(this.oRta, "_setVersionLabel");
			var oHandleVersionToolbarSpy = sandbox.spy(this.oRta, "_handleVersionToolbar");
			this.oRta._onStackModified(this.oRta.getFlexSettings());
			assert.equal(oSetDraftEnabledSpy.callCount, 1, "the draft visibility was set");
			assert.equal(oSetDraftEnabledSpy.getCall(0).args[0], true, "to true");
			assert.equal(oSetVersionLabelAccentColorSpy.callCount, 1, "setVersionLabelAccentColor was set");
			assert.equal(oSetVersionLabelAccentColorSpy.getCall(0).args[0], true, "to true");
			assert.equal(oSetVersionLabelSpy.callCount, 1, "_setVersionLabel was not called");
			assert.equal(oSetVersionLabelSpy.getCall(0).args[0], true, "with bDraftEnabled true");
			assert.equal(oHandleVersionToolbarSpy.callCount, 1, "_handleVersionToolbar was called");
			assert.equal(oHandleVersionToolbarSpy.getCall(0).args[0], true, "with bCanUndo true");
			var oTextResources = sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta");
			assert.equal(this.oRta.getToolbar().getControl("versionLabel").getText(), oTextResources.getText("LBL_DRAFT"), "then the version label is set to 'DRAFT'");
		});
	});



	QUnit.module("Given a started RTA", {
		beforeEach: function() {
			this.oRootControl = oCompCont.getComponentInstance().getAggregation("rootControl");
			this.oRta = new RuntimeAuthoring({
				rootControl : this.oRootControl,
				showToolbars : true
			});
			return this.oRta.start();
		},
		afterEach: function() {
			this.oRta.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when the draft is activated success", function (assert) {
			var done = assert.async();
			var sVersionTitle = "VersionTitle";
			var oEvent = {
				versionTitle: sVersionTitle
			};
			sandbox.stub(VersionsAPI, "activateDraft").callsFake(function (mPropertyBag) {
				assert.equal(Object.keys(mPropertyBag).length, 3, "three parameters were passed");
				assert.equal(mPropertyBag.selector, this.oRootControl, "the selector was passed correctly");
				assert.equal(mPropertyBag.layer, Layer.CUSTOMER, "the layer was passed correctly");
				assert.equal(mPropertyBag.title, sVersionTitle, "the title was passed correctly");

				done();
			}.bind(this));
			sandbox.stub(this.oRta, "_handleVersionToolbar").returns(true);

			this.oRta.getToolbar().fireEvent("activateDraft", oEvent);
		});

		QUnit.test("when the draft is activated failed", function (assert) {
			var done = assert.async();
			var sVersionTitle = "VersionTitle";
			var oEvent = {
				versionTitle: sVersionTitle
			};
			sandbox.stub(VersionsAPI, "activateDraft").rejects("Error");
			sandbox.stub(RtaUtils, "_showMessageBox").callsFake(function(sIconType, sHeader, sMessage, sError) {
				assert.equal(sError, "Error", "and a message box shows the error to the user");
				assert.equal(sMessage, "MSG_DRAFT_ACTIVATION_FAILED", "the message is MSG_DRAFT_ACTIVATION_FAILED");
				assert.equal(sHeader, "HEADER_ERROR", "the header is HEADER_ERROR");
				done();
			});

			this.oRta.getToolbar().fireEvent("activateDraft", oEvent);
		});
	});

	QUnit.done(function() {
		oComp.destroy();
		jQuery("#qunit-fixture").hide();
	});
});
