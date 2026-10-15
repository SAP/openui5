/* global QUnit */
sap.ui.define([
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/core/Component",
	"sap/ui/core/ComponentContainer",
	"sap/ui/core/UIComponent",
	"sap/ui/events/KeyCodes",
	"sap/ui/fl/apply/_internal/changes/Reverter",
	"sap/ui/fl/apply/_internal/flexObjects/FlexObjectFactory",
	"sap/ui/fl/apply/api/FlexRuntimeInfoAPI",
	"sap/ui/fl/write/_internal/connectors/SessionStorageConnector",
	"sap/ui/fl/write/api/PersistenceWriteAPI",
	"sap/ui/fl/write/api/VersionsAPI",
	"sap/ui/fl/Layer",
	"sap/ui/fl/Utils",
	"sap/ui/model/json/JSONModel",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/rta/plugin/rename/RenameDialog",
	"sap/ui/rta/RuntimeAuthoring",
	"sap/ui/Device",
	"test-resources/sap/ui/fl/api/FlexTestAPI",
	"test-resources/sap/ui/fl/qunit/FlQUnitUtils"
], function(
	JsControlTreeModifier,
	Component,
	ComponentContainer,
	UIComponent,
	KeyCodes,
	Reverter,
	FlexObjectFactory,
	FlexRuntimeInfoAPI,
	SessionStorageConnector,
	PersistenceWriteAPI,
	VersionsAPI,
	Layer,
	flUtils,
	JSONModel,
	nextUIUpdate,
	QUnitUtils,
	RenameDialog,
	RuntimeAuthoring,
	Device,
	FlexTestAPI,
	FlQUnitUtils
) {
	"use strict";

	function disableRtaRestart() {
		RuntimeAuthoring.disableRestart(Layer.CUSTOMER);
		RuntimeAuthoring.disableRestart(Layer.USER);
	}

	var RtaQunitUtils = {};

	RtaQunitUtils.clear = async function(oElement, bRevert) {
		const oComponent = (oElement && flUtils.getAppComponentForControl(oElement)) || Component.getComponentById("Comp1");

		await VersionsAPI.initialize({
			control: oComponent,
			layer: Layer.CUSTOMER
		});
		const aCustomerChanges = await PersistenceWriteAPI.save({
			selector: oComponent,
			layer: Layer.CUSTOMER,
			draft: true
		});
		const aUserChangesChanges = await PersistenceWriteAPI.save({
			selector: oComponent,
			layer: Layer.USER
		});

		if (bRevert) {
			const aChangesToRevert = aCustomerChanges.concat(aUserChangesChanges).reverse()
			.filter((oChange) => {
				// skip manifest changes
				return !oChange.isA("sap.ui.fl.apply._internal.flexObjects.AppDescriptorChange");
			});
			await Reverter.revertMultipleChanges(aChangesToRevert, {
				modifier: JsControlTreeModifier,
				appComponent: oComponent,
				reference: FlexRuntimeInfoAPI.getFlexReference({ element: oComponent })
			});
		}

		FlexTestAPI.clearStorage(SessionStorageConnector.storage);
	};

	RtaQunitUtils.getNumberOfChangesForTestApp = function() {
		return FlexTestAPI.getNumberOfStoredChanges("SessionStorage", "sap.ui.rta.qunitrta.Component");
	};

	RtaQunitUtils.renderTestAppAtAsync = function(sDomId) {
		disableRtaRestart();

		return Component.create({
			name: "sap.ui.rta.qunitrta",
			id: "Comp1",
			settings: {
				componentData: {
					showAdaptButton: true
				}
			}
		})
		.then(function(oComponent) {
			return oComponent.oView
			.then(function() {
				return new ComponentContainer({
					component: oComponent,
					async: true
				});
			});
		})
		.then(async function(oComponentContainer) {
			oComponentContainer.placeAt(sDomId);
			await nextUIUpdate();

			return oComponentContainer;
		});
	};

	RtaQunitUtils.renderRuntimeAuthoringAppAt = function(sDomId) {
		disableRtaRestart();
		return Component.create({
			name: "sap.ui.rta.test",
			id: "Comp1",
			settings: {
				componentData: {
					showAdaptButton: true,
					useSessionStorage: true
				}
			}
		})
		.then(function(oComponent) {
			return oComponent.oView
			.then(function() {
				return new ComponentContainer({
					component: oComponent,
					async: true
				});
			});
		})
		.then(async function(oComponentContainer) {
			oComponentContainer.placeAt(sDomId);
			await nextUIUpdate();
			return oComponentContainer;
		});
	};

	RtaQunitUtils.simulateRename = function(sandbox, sNewLabel, fnStartRenameCallback, fnExpectError) {
		return new Promise(function(resolve) {
			const oCreatePopupStub = sandbox.stub(RenameDialog.prototype, "_createPopup");
			oCreatePopupStub.callsFake(async function(...args) {
				const oPopover = await oCreatePopupStub.wrappedMethod.apply(this, args);
				oPopover.attachAfterOpen(() => {
					oPopover.attachAfterClose(() => {
						oCreatePopupStub.restore();
						resolve();
					});

					const oInput = oPopover.getContent()[0].getItems()[1];
					oInput.setValue(sNewLabel);
					oInput.fireLiveChange({ value: sNewLabel });
					if (fnExpectError) {
						fnExpectError(oInput.getValueStateText());
						oPopover.getEndButton().firePress();
						return;
					}
					oPopover.getBeginButton().firePress();
				});
				return oPopover;
			});
			fnStartRenameCallback();
		});
	};

	RtaQunitUtils.openContextMenuWithKeyboard = function(oTarget) {
		return new Promise(function(resolve) {
			this.oRta.getPlugins().contextMenu.attachEventOnce("openedContextMenu", resolve);

			var oEvent = new KeyboardEvent("keyup", {
				keyCode: KeyCodes.F10,
				which: KeyCodes.F10,
				shiftKey: true,
				altKey: false,
				metaKey: false,
				ctrlKey: false
			});
			oTarget.getDomRef().dispatchEvent(oEvent);
		}.bind(this));
	};

	RtaQunitUtils.openContextMenuWithClick = function(oTarget, sinon) {
		return new Promise(function(resolve) {
			this.oRta.getPlugins().contextMenu.attachEventOnce("openedContextMenu", resolve);

			var clock = sinon.useFakeTimers();
			QUnitUtils.triggerMouseEvent(oTarget.getDomRef(), "contextmenu");
			clock.tick(50);
			clock.restore();
		}.bind(this));
	};

	RtaQunitUtils.closeContextMenu = function(oTarget) {
		return new Promise(function(resolve) {
			this.oRta.getPlugins().contextMenu.attachEventOnce("closedContextMenu", resolve);
			oTarget.close();
		}.bind(this));
	};

	RtaQunitUtils.getContextMenuItemCount = function(oTarget) {
		return new Promise(function(resolve) {
			var iItemCount;
			oTarget.focus();
			oTarget.setSelected(true);
			RtaQunitUtils.openContextMenuWithKeyboard.call(this, oTarget)
			.then(function() {
				var { oContextMenuControl } = this.oRta.getPlugins().contextMenu;
				iItemCount = oContextMenuControl.getItems().length;
				return oContextMenuControl;
			}.bind(this))
			.then(RtaQunitUtils.closeContextMenu.bind(this))
			.then(function() {
				resolve(iItemCount);
			});
		}.bind(this));
	};

	RtaQunitUtils.createAndStubAppComponent = function(sandbox, sId, oManifest, oContent, oAsyncHints) {
		sId ||= "someName";
		oManifest ||= {
			"sap.app": {
				id: sId,
				type: "application"
			}
		};
		var Component = UIComponent.extend("component", {
			metadata: {
				manifest: oManifest
			},
			createContent() {
				return oContent;
			}
		});

		var oComponent = new Component(sId, { _componentConfig: { asyncHints: oAsyncHints } });
		sandbox.stub(flUtils, "getAppComponentForControl").returns(oComponent);
		oComponent._restoreGetAppComponentStub = flUtils.getAppComponentForControl.restore;
		return oComponent;
	};

	RtaQunitUtils.createUIChange = function(oFileContent) {
		return FlexObjectFactory.createFromFileContent(oFileContent);
	};

	RtaQunitUtils.stubSapUiRequire = function(...aArgs) {
		return FlQUnitUtils.stubSapUiRequire.apply(undefined, aArgs);
	};

	RtaQunitUtils.stubFLPContainer = function(sandbox, fnFLPReloadStub, mShellParams, fnFLPNavigateStub) {
		sandbox.stub(flUtils, "getUshellContainer").returns({
			getServiceAsync() {
				return Promise.resolve({
					navigate: fnFLPNavigateStub || function() {},
					getHash() {
						return "Action-somestring";
					},
					parseShellHash() {
						const mHash = {
							semanticObject: "Action",
							action: "somestring"
						};

						if (mShellParams) {
							mHash.params = mShellParams;
						}
						return mHash;
					},
					unregisterNavigationFilter() {},
					registerNavigationFilter() {},
					reloadCurrentApp: fnFLPReloadStub,
					getUser() {},
					getCurrentApplication() {}
				});
			}
		});
		RtaQunitUtils.stubSapUiRequire(sandbox, [{
			name: "sap/ushell/api/RTA",
			stub: {
				getLogoSrc: sandbox.stub().resolves(""),
				getRtaHeaderDomRef: sandbox.stub().resolves(document.getElementById("qunit-fixture")),
				startUIAdaptation: sandbox.stub().resolves(),
				endUIAdaptation: sandbox.stub().resolves()
			}
		}]);
	};

	RtaQunitUtils.showActionsMenu = function(oToolbar) {
		return oToolbar.showActionsMenu({
			getSource() {
				return oToolbar.getControl("actionsMenu");
			}
		});
	};

	RtaQunitUtils.createToolbarControlsModel = function() {
		return new JSONModel({
			changesNeedHardReload: false,
			adaptationMode: true,
			undo: {
				enabled: false
			},
			redo: {
				enabled: false
			},
			save: {
				enabled: false
			},
			restore: {
				enabled: false
			},
			appVariantMenu: {
				overview: {
					visible: false,
					enabled: false
				},
				saveAs: {
					visible: false,
					enabled: false
				},
				manageApps: {
					visible: false,
					enabled: false
				}
			},
			contextBasedAdaptation: {
				visible: false,
				enabled: false
			},
			visualizationButton: {
				visible: false,
				enabled: false
			},
			backButton: {
				enabled: false
			}
		});
	};

	RtaQunitUtils.waitForMethodCall = function(sandbox, oObject, sMethodName) {
		// Returns a promise which is resolved with the return value
		// of the given method after it was first called
		// Doesn't work with event handlers
		return new Promise(function(resolve) {
			sandbox.stub(oObject, sMethodName)
			.callsFake(function(...aArgs) {
				if (oObject[sMethodName].wrappedMethod) {
					const oResult = oObject[sMethodName].wrappedMethod.apply(this, aArgs);
					resolve(oResult);
				}
			});
		})
		.then(function() {
			oObject[sMethodName].restore();
		});
	};

	/**
	 * Registers a generic QUnit test asserting that a plugin's <code>getParameters</code> exposes
	 * the expected parameter descriptors. Reduces the duplicated per-plugin boilerplate.
	 * @param {function():sap.ui.rta.plugin.Plugin} fnGetPlugin - Returns the plugin instance
	 *   (called inside the test so the module's <code>beforeEach</code> context is available)
	 * @param {string[]} aExpectedNames - Parameter names that must be exposed
	 */
	RtaQunitUtils.testGetParameters = function(fnGetPlugin, aExpectedNames) {
		QUnit.test("when getParameters is called", function(assert) {
			const aParameters = fnGetPlugin.call(this).getParameters();
			const aNames = aParameters.map((mParameter) => mParameter.name);
			aExpectedNames.forEach((sName) => {
				assert.ok(aNames.includes(sName), `then the '${sName}' parameter is exposed`);
			});
			assert.ok(
				aParameters.every((mParameter) => !!mParameter.description),
				"then every parameter has a description"
			);
		});
	};

	/**
	 * Dispatches a synthetic <code>keydown</code> event for QUnit tests.
	 *
	 * The <code>ctrlOrMetaKey</code> option is platform-aware: it sets <code>metaKey</code> on
	 * macintosh (CMD) and <code>ctrlKey</code> elsewhere. Modules that must force a specific
	 * modifier regardless of platform (e.g. to test both branches in one run) can pass
	 * <code>ctrlKey</code>/<code>metaKey</code> explicitly instead.
	 *
	 * @param {HTMLElement} oTargetDomRef - Element to dispatch on (ignored when <code>onDocument</code> is set)
	 * @param {int} iKeyCode - Key code, see {@link sap.ui.events.KeyCodes}
	 * @param {object} [mOptions] - Modifier and dispatch options
	 * @param {boolean} [mOptions.shiftKey=false] - Whether SHIFT is pressed
	 * @param {boolean} [mOptions.altKey=false] - Whether ALT is pressed
	 * @param {boolean} [mOptions.ctrlOrMetaKey=false] - Platform-aware CTRL/CMD; mutually exclusive with ctrlKey/metaKey
	 * @param {boolean} [mOptions.ctrlKey=false] - Explicit CTRL, regardless of platform
	 * @param {boolean} [mOptions.metaKey=false] - Explicit CMD/meta, regardless of platform
	 * @param {boolean} [mOptions.bubbles=false] - Whether the event bubbles
	 * @param {boolean} [mOptions.cancelable=false] - Whether the event is cancelable
	 * @param {boolean} [mOptions.onDocument=false] - Dispatch on <code>document</code> instead of <code>oTargetDomRef</code>
	 */
	RtaQunitUtils.triggerKeydown = function(oTargetDomRef, iKeyCode, mOptions = {}) {
		const oParams = {
			keyCode: iKeyCode,
			which: iKeyCode,
			shiftKey: mOptions.shiftKey || false,
			altKey: mOptions.altKey || false,
			bubbles: mOptions.bubbles || false,
			cancelable: mOptions.cancelable || false
		};
		if (mOptions.ctrlOrMetaKey) {
			// on macintosh os cmd-key is used instead of ctrl-key
			oParams[Device.os.macintosh ? "metaKey" : "ctrlKey"] = true;
		} else {
			oParams.ctrlKey = mOptions.ctrlKey || false;
			oParams.metaKey = mOptions.metaKey || false;
		}
		const oTarget = mOptions.onDocument ? document : oTargetDomRef;
		oTarget.dispatchEvent(new KeyboardEvent("keydown", oParams));
	};

	/**
	 * Dispatches the platform undo shortcut (CTRL+Z, or CMD+Z on macintosh) on <code>document</code>.
	 */
	RtaQunitUtils.triggerUndo = function() {
		RtaQunitUtils.triggerKeydown(null, KeyCodes.Z, { ctrlOrMetaKey: true, onDocument: true });
	};

	/**
	 * Dispatches the platform redo shortcut (CTRL+Y, or CMD+SHIFT+Z on macintosh) on <code>document</code>.
	 */
	RtaQunitUtils.triggerRedo = function() {
		// on macintosh os the redo shortcut is CMD+SHIFT+Z, on other os it is CTRL+Y
		if (Device.os.macintosh) {
			RtaQunitUtils.triggerKeydown(null, KeyCodes.Z, { ctrlOrMetaKey: true, shiftKey: true, onDocument: true });
		} else {
			RtaQunitUtils.triggerKeydown(null, KeyCodes.Y, { ctrlKey: true, onDocument: true });
		}
	};

	return RtaQunitUtils;
});