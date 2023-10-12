/* global QUnit */

sap.ui.define([
	"sap/m/Button",
	"sap/m/Label",
	"sap/m/Input",
	"sap/m/List",
	"sap/m/CustomListItem",
	"sap/ui/core/Title",
	"sap/ui/dt/DesignTime",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/dt/OverlayUtil",
	"sap/ui/fl/write/api/ChangesWriteAPI",
	"sap/ui/fl/Utils",
	"sap/ui/layout/VerticalLayout",
	"sap/ui/layout/form/Form",
	"sap/ui/layout/form/FormContainer",
	"sap/ui/layout/form/SimpleForm",
	"sap/ui/rta/command/CommandFactory",
	"sap/ui/rta/plugin/Plugin",
	"sap/ui/rta/plugin/Remove",
	"sap/ui/rta/plugin/Rename",
	"sap/ui/model/json/JSONModel",
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/qunit/utils/nextUIUpdate"
], function(
	Button,
	Label,
	Input,
	List,
	CustomListItem,
	Title,
	DesignTime,
	OverlayRegistry,
	OverlayUtil,
	ChangesWriteAPI,
	FlexUtils,
	VerticalLayout,
	Form,
	FormContainer,
	SimpleForm,
	CommandFactory,
	Plugin,
	Remove,
	Rename,
	JSONModel,
	sinon,
	nextUIUpdate
) {
	"use strict";

	var sandbox = sinon.createSandbox();

	QUnit.module("Given a Plugin and 'hasChangeHandler' is called", {
		beforeEach() {
			this.oPlugin = new Plugin({
				commandFactory: new CommandFactory()
			});
			this.oButton = new Button();
			this.oGetChangeHandlerStub = sandbox.stub(ChangesWriteAPI, "getChangeHandler");
		},
		afterEach() {
			this.oButton.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when the ChangesWriteAPI resolves with a change handler", function(assert) {
			this.oGetChangeHandlerStub.resolves();
			return this.oPlugin.hasChangeHandler("moveControls", this.oButton, "my.ControlType").then(function(bHasChangeHandler) {
				assert.strictEqual(bHasChangeHandler, true, "then the function returns true");
				assert.equal(this.oGetChangeHandlerStub.callCount, 1, "the ChangesWriteAPI was called");
				assert.equal(this.oGetChangeHandlerStub.lastCall.args[0].changeType, "moveControls", "the change type was correctly passed");
				assert.equal(this.oGetChangeHandlerStub.lastCall.args[0].controlType, "my.ControlType", "the control type was taken from the control");
				assert.equal(this.oGetChangeHandlerStub.lastCall.args[0].element, this.oButton, "the control was correctly passed");
			}.bind(this));
		});

		QUnit.test("when the ChangesWriteAPI rejects", function(assert) {
			this.oGetChangeHandlerStub.rejects();
			return this.oPlugin.hasChangeHandler("moveControls", this.oButton).then(function(bHasChangeHandler) {
				assert.strictEqual(bHasChangeHandler, false, "then the function returns false");
				assert.equal(this.oGetChangeHandlerStub.callCount, 1, "the ChangesWriteAPI was called");
			}.bind(this));
		});

		QUnit.test("when 'getVariantManagement' is called", function(assert) {
			var oObjectWithVM = {
				getVariantManagement() {
					return "variant-test";
				}
			};
			var sVarMgmtRefForButton = this.oPlugin.getVariantManagementReference(oObjectWithVM);
			var sVarMgmtRefForEmptyObject = this.oPlugin.getVariantManagementReference({});
			assert.equal(sVarMgmtRefForButton, "variant-test", "then for the control with variant ChangeHandler the variant management reference is returned");
			assert.equal(sVarMgmtRefForEmptyObject, undefined, "then for the control without variant ChangeHandler undefined is returned");
		});
	});

	QUnit.module("Given the Plugin is initialized with move registered for a control", {
		async beforeEach(assert) {
			var done = assert.async();

			this.oButton = new Button();
			this.oLayout = new VerticalLayout({
				content: [
					this.oButton
				]
			}).placeAt("qunit-fixture");

			await nextUIUpdate();

			this.oDesignTime = new DesignTime({
				rootElements: [this.oLayout]
			});

			this.oPlugin = new Plugin({
				commandFactory: new CommandFactory()
			});
			this.oRemovePlugin = new Remove();

			sandbox.stub(this.oPlugin, "_isEditable").returns(true);
			sandbox.stub(this.oRemovePlugin, "_isEditable").returns(true);

			this.oDesignTime.attachEventOnce("synced", function() {
				this.oLayoutOverlay = OverlayRegistry.getOverlay(this.oLayout);
				this.oButtonOverlay = OverlayRegistry.getOverlay(this.oButton);
				done();
			}.bind(this));
		},
		afterEach() {
			this.oLayout.destroy();
			this.oDesignTime.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when an overlay gets deregistered and registered again and visible change event gets fired", function(assert) {
			var oGetRelevantOverlays = sandbox.spy(this.oRemovePlugin, "_getRelevantOverlays");

			this.oRemovePlugin.registerElementOverlay(this.oButtonOverlay);
			this.oRemovePlugin.deregisterElementOverlay(this.oButtonOverlay);
			this.oRemovePlugin.registerElementOverlay(this.oButtonOverlay);

			this.oButtonOverlay.fireElementModified({
				type: "propertyChanged",
				name: "visible"
			});
			assert.equal(oGetRelevantOverlays.callCount, 1, "then _getRelevantOverlays is only called once");
		});

		QUnit.test("when Overlays are registered/deregistered and _isEditableByPlugin method is called", function(assert) {
			assert.notOk(this.oButtonOverlay.getEditable(), "then the Overlay is not editable");
			assert.notOk(this.oPlugin._isEditableByPlugin(this.oButtonOverlay), "then the overlay is not editable by this plugin");
			assert.notOk(this.oRemovePlugin._isEditableByPlugin(this.oButtonOverlay), "then the overlay is not editable by this plugin");

			this.oPlugin.registerElementOverlay(this.oButtonOverlay);
			assert.equal(this.oButtonOverlay.getEditableByPlugins().length, 1, "then a plugin got added");
			assert.equal(this.oButtonOverlay.getEditableByPlugins()[0], "sap.ui.rta.plugin.Plugin", "then the name of the added plugin is correct");
			assert.ok(this.oButtonOverlay.getEditable(), "then the Overlay is editable");
			assert.ok(this.oPlugin._isEditableByPlugin(this.oButtonOverlay), "then the overlay is editable by this plugin");
			assert.notOk(this.oRemovePlugin._isEditableByPlugin(this.oButtonOverlay), "then the overlay is not editable by this plugin");

			this.oRemovePlugin.registerElementOverlay(this.oButtonOverlay);
			assert.equal(this.oButtonOverlay.getEditableByPlugins().length, 2, "then another plugin got added");
			assert.equal(this.oButtonOverlay.getEditableByPlugins()[1], "sap.ui.rta.plugin.Remove", "then the name of the added plugin is correct");
			assert.ok(this.oButtonOverlay.getEditable(), "then the Overlay is editable");
			assert.ok(this.oPlugin._isEditableByPlugin(this.oButtonOverlay), "then the overlay is editable by this plugin");
			assert.ok(this.oRemovePlugin._isEditableByPlugin(this.oButtonOverlay), "then the overlay is editable by this plugin");

			this.oRemovePlugin.deregisterElementOverlay(this.oButtonOverlay);
			assert.equal(this.oButtonOverlay.getEditableByPlugins().length, 1, "then a plugin got removed");
			assert.equal(this.oButtonOverlay.getEditableByPlugins()[0], "sap.ui.rta.plugin.Plugin", "then the name of the plugin left is correct");
			assert.ok(this.oButtonOverlay.getEditable(), "then the Overlay is editable");
			assert.ok(this.oPlugin._isEditableByPlugin(this.oButtonOverlay), "then the overlay is editable by this plugin");
			assert.notOk(this.oRemovePlugin._isEditableByPlugin(this.oButtonOverlay), "then the overlay is not editable by this plugin");

			this.oPlugin.deregisterElementOverlay(this.oButtonOverlay);
			assert.equal(this.oButtonOverlay.getEditableByPlugins().length, 0, "then all plugins got removed");
			assert.notOk(this.oButtonOverlay.getEditable(), "then the Overlay is not editable");
			assert.notOk(this.oPlugin._isEditableByPlugin(this.oButtonOverlay), "then the overlay is not editable by this plugin");
			assert.notOk(this.oRemovePlugin._isEditableByPlugin(this.oButtonOverlay), "then the overlay is not editable by this plugin");
		});

		QUnit.test("when the control has no stable id and hasStableId method is called", function(assert) {
			assert.strictEqual(this.oPlugin.hasStableId(this.oButtonOverlay), false, "then it returns false");
			assert.strictEqual(this.oButtonOverlay.data("hasStableId"), false, "then the 'getElementHasStableId' property of the Overlay is set to false");
		});

		QUnit.test("when hasStableId method is called without an overlay", function(assert) {
			assert.strictEqual(this.oPlugin.hasStableId(), false, "then it returns false");
		});

		QUnit.test("when hasStableId method is called with an overlay whose element is being destroyed", function(assert) {
			this.oButton.destroy();
			assert.strictEqual(this.oPlugin.hasStableId(this.oButtonOverlay), false, "then it returns false");
		});

		QUnit.test("when evaluateEditable is called for elements", function(assert) {
			var oModifyPluginListSpy = sandbox.spy(this.oPlugin, "_modifyPluginList");

			this.oPlugin.evaluateEditable([this.oLayoutOverlay], {onRegistration: false});
			assert.equal(oModifyPluginListSpy.callCount, 1, "_modifyPluginList was called once");
			assert.equal(oModifyPluginListSpy.lastCall.args[0], this.oLayoutOverlay, "first parameter is the overlay");
		});

		QUnit.test("when evaluateEditable is called for elements that is editable but not adaptable", function(assert) {
			sandbox.stub(this.oLayoutOverlay.getDesignTimeMetadata(), "markedAsNotAdaptable").returns(true);
			var oModifyPluginListSpy = sandbox.spy(this.oPlugin, "_modifyPluginList");

			this.oPlugin.evaluateEditable([this.oLayoutOverlay], {onRegistration: false});
			assert.equal(oModifyPluginListSpy.callCount, 1, "_modifyPluginList was called once");
			assert.equal(oModifyPluginListSpy.lastCall.args[0], this.oLayoutOverlay, "first parameter is the overlay");
			assert.equal(oModifyPluginListSpy.lastCall.args[1], false, "then editable is false");
		});

		QUnit.test("when evaluateEditable is called with getStableElements in DTMD returning a selector", function(assert) {
			var oModifyPluginListSpy = sandbox.spy(this.oPlugin, "_modifyPluginList");
			var oSetProcessingStatusSpy = sandbox.spy(this.oPlugin, "setProcessingStatus");
			sandbox.stub(this.oLayoutOverlay.getDesignTimeMetadata(), "getStableElements").returns([{id: "id"}]);

			this.oPlugin.evaluateEditable([this.oLayoutOverlay], {onRegistration: false});
			assert.equal(oSetProcessingStatusSpy.firstCall.args[0], true, "the plugin switched to processing state on first");
			assert.equal(oModifyPluginListSpy.lastCall.args[1], true, "the _modifyPluginList function is called");
			assert.equal(oSetProcessingStatusSpy.lastCall.args[0], false, "the plugin switched the processing state off again");
		});

		QUnit.test("when evaluateEditable is called and _isEditable returns a promise", function(assert) {
			sandbox.restore();
			var fnDone = assert.async();
			var oModifyPluginListSpy = sandbox.spy(this.oPlugin, "_modifyPluginList");
			var oSetProcessingStatusSpy = sandbox.spy(this.oPlugin, "setProcessingStatus");
			sandbox.stub(this.oLayoutOverlay.getDesignTimeMetadata(), "getStableElements").returns([{id: "id"}]);
			sandbox.stub(this.oPlugin, "_isEditable").resolves(true);

			this.oPlugin.evaluateEditable([this.oLayoutOverlay], {onRegistration: false});
			assert.equal(oSetProcessingStatusSpy.firstCall.args[0], true, "the plugin switched to processing state on first");
			this.oPlugin.attachEventOnce("processingStatusChange", function() {
				assert.equal(oModifyPluginListSpy.lastCall.args[1], true, "the _modifyPluginList function is called");
				assert.equal(oSetProcessingStatusSpy.lastCall.args[0], false, "the plugin switched the processing state off again");
				fnDone();
			});
		});

		QUnit.test("when evaluateEditable is called for an element which has a responsible element", function(assert) {
			var done = assert.async();
			var oModifyPluginListSpy = sandbox.spy(this.oPlugin, "_modifyPluginList");
			sandbox.stub(this.oPlugin, "getActionName").returns("actionName");

			// clearing up all default actions and replacing with getResponsibleElement()
			this.oLayoutOverlay.getDesignTimeMetadata().getData().actions = {
				getResponsibleElement: function() {
					return this.oButton;
				}.bind(this),
				actionsFromResponsibleElement: ["actionName"]
			};

			var fnProcessingFinishCallBack = function(done, oEvent) {
				if (oEvent.getParameter("processing") === false) {
					assert.ok(this.oPlugin._isEditable.alwaysCalledWith(this.oButtonOverlay), "then editable evaluation is always performed on the responsible element");
					assert.equal(oModifyPluginListSpy.callCount, 1, "_modifyPluginList was called once");
					assert.ok(oModifyPluginListSpy.calledWith(this.oLayoutOverlay, true), "then the plugin list was modified for the source overlay with editable set to true");
					this.oPlugin.detachEvent("processingStatusChange", fnProcessingFinishCallBack);
					done();
				}
			}.bind(this, done);

			this.oPlugin.attachEvent("processingStatusChange", fnProcessingFinishCallBack);

			this.oPlugin.evaluateEditable([this.oLayoutOverlay], {onRegistration: false});
		});

		QUnit.test("when evaluateEditable is called for an element overlay with a disabled action and a responsible element", function(assert) {
			var done = assert.async();
			sandbox.stub(this.oPlugin, "getActionName").returns("actionName");

			// clearing up all default actions and replacing with getResponsibleElement()
			this.oLayoutOverlay.getDesignTimeMetadata().getData().actions = {
				getResponsibleElement: function() {
					return this.oButton;
				}.bind(this)
			};
			var fnProcessingFinishCallBack = function(done, oEvent) {
				if (oEvent.getParameter("processing") === false) {
					assert.equal(this.oPlugin._isEditable.callCount, 1, "then editable evaluation was still done");
					assert.ok(this.oPlugin._isEditable.calledWith(this.oLayoutOverlay), "then the editable check was performed on the source element overlay");
					this.oPlugin.detachEvent("processingStatusChange", fnProcessingFinishCallBack);
					done();
				}
			}.bind(this, done);

			this.oPlugin.attachEvent("processingStatusChange", fnProcessingFinishCallBack);

			this.oPlugin.evaluateEditable([this.oLayoutOverlay], {onRegistration: false});
		});
	});

	QUnit.module("Given the Designtime is initialized with 2 Plugins with _isEditable not stubbed", {
		async beforeEach(assert) {
			var done = assert.async();

			this.oButton = new Button("button");
			this.oLayout = new VerticalLayout({
				content: [
					this.oButton
				]
			}).placeAt("qunit-fixture");

			await nextUIUpdate();

			this.oCheckControlIdSpy = sandbox.spy(FlexUtils, "checkControlId");

			var oCommandFactory = new CommandFactory();
			this.oRenamePlugin = new Rename({
				commandFactory: oCommandFactory
			});
			this.oRemovePlugin = new Remove({
				commandFactory: oCommandFactory
			});
			this.oDesignTime = new DesignTime({
				rootElements: [this.oLayout],
				plugins: [this.oRemovePlugin, this.oRenamePlugin]
			});

			this.oPlugin = new Plugin();

			this.oDesignTime.attachEventOnce("synced", function() {
				this.oButtonOverlay = OverlayRegistry.getOverlay(this.oButton);
				done();
			}.bind(this));
		},
		afterEach() {
			this.oLayout.destroy();
			this.oDesignTime.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when the controls are checked for a stable id and at least one plugin has been initialized", function(assert) {
			assert.equal(this.oCheckControlIdSpy.callCount, 2, "then the utility method to check the control id has been already called element overlays");
			assert.strictEqual(this.oButtonOverlay.data("hasStableId"), true, "and the 'getElementHasStableId' property of the Overlay is set to true");
			assert.ok(this.oPlugin.hasStableId(this.oButtonOverlay), "then if hasStableId is called again it also returns true");
			assert.equal(this.oCheckControlIdSpy.callCount, 2, "but then the utility method to check the control ids is not called another time");
			assert.equal(this.oButtonOverlay.getEditableByPlugins().length, 2, "then the overlay is editable by 2 plugins");
		});
	});

	QUnit.module("Given the Designtime is initialized with 2 Plugins with _isEditable stubbed asynchronous", {
		async beforeEach(assert) {
			var done = assert.async();
			var oModel = new JSONModel([{text: "item1"}, {text: "item2"}, {text: "item3"}]);
			this.oCustomListItemTemplate = new CustomListItem("boundListItem", {content: [new Button("boundListItem-btn", {text: "{text}"})]});
			this.oBoundList = new List("boundlist").setModel(oModel);
			this.oBoundList.bindAggregation("items", {
				path: "/",
				template: this.oCustomListItemTemplate,
				templateShareable: false
			});

			this.oButton = new Button("button");
			this.oInvisibleButton = new Button("invisibleButton", { visible: false });
			this.oLayout = new VerticalLayout({
				content: [
					this.oInvisibleButton,
					this.oButton,
					this.oBoundList
				]
			}).placeAt("qunit-fixture");
			await nextUIUpdate();

			var oCommandFactory = new CommandFactory();
			this.oRenamePlugin = new Rename({
				commandFactory: oCommandFactory
			});
			this.oRemovePlugin = new Remove({
				commandFactory: oCommandFactory
			});
			sandbox.stub(this.oRenamePlugin, "_isEditable").resolves(true);
			sandbox.stub(this.oRemovePlugin, "_isEditable").returns(false);
			this.oModifyPluginListSpy = sandbox.spy(Plugin.prototype, "_modifyPluginList");

			this.oDesignTime = new DesignTime({
				rootElements: [this.oLayout],
				plugins: [this.oRemovePlugin, this.oRenamePlugin]
			});

			this.oPlugin = new Plugin();

			this.oDesignTime.attachEventOnce("synced", function() {
				this.oButtonOverlay = OverlayRegistry.getOverlay(this.oButton);
				this.oInvisibleButtonOverlay = OverlayRegistry.getOverlay(this.oInvisibleButton);
				this.oLayoutOverlay = OverlayRegistry.getOverlay(this.oLayout);
				done();
			}.bind(this));
		},
		afterEach() {
			this.oLayout.destroy();
			this.oDesignTime.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when the event elementModified is thrown with visibility change", function(assert) {
			var oSetRelevantSpy = sandbox.spy(this.oButtonOverlay, "setRelevantOverlays");
			var oGetRelevantSpy = sandbox.spy(this.oButtonOverlay, "getRelevantOverlays");
			var oFindAllOverlaysInContainerStub = sandbox.stub(OverlayUtil, "findAllOverlaysInContainer").returns([this.oButtonOverlay]);
			this.oButtonOverlay.fireElementModified({
				type: "propertyChanged",
				name: "visible"
			});
			assert.equal(oFindAllOverlaysInContainerStub.callCount, 1, "then findAllOverlaysInContainer is only called once");
			assert.equal(oSetRelevantSpy.callCount, 2, "then setRelevantOverlays is called twice");
			assert.equal(oGetRelevantSpy.callCount, 2, "then getRelevantOverlays is called twice");
			assert.equal(this.oButtonOverlay.getRelevantOverlays().length, 1, "then only one overlay is relevant");
		});

		QUnit.test("when the event elementModified is thrown with visibility changed to true and geometry becoming visible afterwards", function(assert) {
			var oSetRelevantSpy = sandbox.spy(this.oButtonOverlay, "setRelevantOverlays");
			var oGetRelevantSpy = sandbox.spy(this.oButtonOverlay, "getRelevantOverlays");
			var oEvaluateSpy = sandbox.spy(this.oRenamePlugin, "evaluateEditable");
			var oFindAllOverlaysInContainerStub = sandbox.stub(OverlayUtil, "findAllOverlaysInContainer").returns([this.oButtonOverlay]);
			this.oButtonOverlay.getGeometry().visible = false;
			this.oButtonOverlay.fireElementModified({
				type: "propertyChanged",
				name: "visible",
				value: true
			});
			assert.equal(oFindAllOverlaysInContainerStub.callCount, 1, "then findAllOverlaysInContainer is only called once");
			assert.equal(oSetRelevantSpy.callCount, 2, "then setRelevantOverlays is called twice");
			assert.equal(oGetRelevantSpy.callCount, 2, "then getRelevantOverlays is called twice");
			assert.equal(this.oButtonOverlay.getRelevantOverlays().length, 1, "then only one overlay is relevant");
			assert.equal(oEvaluateSpy.callCount, 0, "the evaluate function was not yet called");

			this.oButtonOverlay.getGeometry().visible = true;
			this.oButtonOverlay.fireGeometryChanged();
			assert.equal(oEvaluateSpy.callCount, 1, "the evaluate function was called");

			this.oButtonOverlay.getGeometry().visible = false;
			this.oButtonOverlay.fireGeometryChanged();
			assert.equal(oEvaluateSpy.callCount, 1, "the evaluate function was not called again");

			this.oButtonOverlay.getGeometry().visible = true;
			this.oButtonOverlay.fireGeometryChanged();
			assert.equal(oEvaluateSpy.callCount, 1, "the evaluate function was not called again");

			this.oInvisibleButtonOverlay.fireGeometryChanged();
			assert.equal(oEvaluateSpy.callCount, 1, "the evaluate function was not called again");
		});

		QUnit.test("when the event elementModified is thrown with aggregation change", function(assert) {
			var fnDone = assert.async();
			var oSetRelevantSpy = sandbox.spy(this.oLayoutOverlay, "setRelevantOverlays");
			var oGetRelevantSpy = sandbox.spy(this.oLayoutOverlay, "getRelevantOverlays");
			var oFindAllOverlaysInContainerStub = sandbox.stub(OverlayUtil, "findAllOverlaysInContainer").returns([this.oLayoutOverlay]);

			// Element modified callback is async due to debouncing, make sure to wait for both plugins
			// to start editable evaluation as a workaround
			var oEvaluateEditableStub = sandbox.stub(Plugin.prototype, "evaluateEditable")
			.callThrough()
			.onSecondCall()
			.callsFake(function(...aArgs) {
				oEvaluateEditableStub.wrappedMethod.apply(this.oRemovePlugin, aArgs);
				assert.strictEqual(oFindAllOverlaysInContainerStub.callCount, 1, "then findAllOverlaysInContainer is only called once");
				assert.strictEqual(oSetRelevantSpy.callCount, 2, "then setRelevantOverlays is called twice");
				assert.strictEqual(oGetRelevantSpy.callCount, 2, "then getRelevantOverlays is called twice");
				assert.strictEqual(this.oLayoutOverlay.getRelevantOverlays().length, 4, "then four overlays are relevant");
				fnDone();
			}.bind(this));

			this.oLayoutOverlay.fireElementModified({
				type: "removeAggregation",
				name: "content"
			});
		});

		QUnit.test("when the elementModified event is thrown multiple times in a row", function(assert) {
			var fnDone = assert.async();
			var oEvaluateEditableStub = sandbox.stub(this.oRenamePlugin, "evaluateEditable")
			.callsFake(function(...aArgs) {
				oEvaluateEditableStub.wrappedMethod.apply(this.oRemovePlugin, aArgs);
				assert.ok(oEvaluateEditableStub.calledOnce, "then the evaluation is only executed once");
				fnDone();
			}.bind(this));

			this.oLayoutOverlay.fireElementModified({
				type: "removeAggregation",
				name: "content"
			});
			this.oLayoutOverlay.fireElementModified({
				type: "removeAggregation",
				name: "content"
			});
		});

		QUnit.test("when the elementModified callback is triggered after the designtime was destroyed", function(assert) {
			var oEvaluateEditableSpy = sandbox.spy(this.oRenamePlugin, "evaluateEditable");
			var fnDone = assert.async();
			this.oLayoutOverlay.fireElementModified({
				type: "addOrSetAggregation",
				name: "content"
			});
			// Using a timeout here is bad but there is no reliable way to access the
			// callback that was debounced without exposing private members of the plugin
			setTimeout(function() {
				assert.ok(oEvaluateEditableSpy.notCalled, "then the original callback is never executed");
				fnDone();
			}, 100);
			this.oDesignTime.destroy();
		});

		QUnit.test("when the event elementModified is thrown with afterRendering", function(assert) {
			var oSetRelevantSpy = sandbox.spy(this.oLayoutOverlay, "setRelevantOverlays");
			var oGetRelevantSpy = sandbox.spy(this.oLayoutOverlay, "getRelevantOverlays");
			var oEvaluateSpy = sandbox.spy(this.oRenamePlugin, "evaluateEditable");
			var oFindAllOverlaysInContainerStub = sandbox.stub(OverlayUtil, "findAllOverlaysInContainer").returns([this.oLayoutOverlay]);
			this.oLayoutOverlay.fireElementModified({
				type: "afterRendering"
			});
			assert.equal(oFindAllOverlaysInContainerStub.callCount, 0, "then findAllOverlaysInContainer is not called");
			assert.equal(oSetRelevantSpy.callCount, 0, "then setRelevantOverlays is not called");
			assert.equal(oGetRelevantSpy.callCount, 0, "then getRelevantOverlays is not called");
			assert.equal(oEvaluateSpy.callCount, 1, "then only evaluateEditable is called");
			assert.deepEqual(oEvaluateSpy.args[0], [[this.oLayoutOverlay], {onRegistration: false}], "then evaluateEditable is called with the correct parameters");
		});

		QUnit.test("when _getRelevantOverlays is called for an Overlay that is part of a binding template", function(assert) {
			var oCustomListItemTemplateOverlay = OverlayRegistry.getOverlay(this.oCustomListItemTemplate);
			assert.equal(this.oRenamePlugin._getRelevantOverlays(oCustomListItemTemplateOverlay).length, 0, "then no overlays are returned");
		});

		QUnit.test("when the event elementModified is thrown but the plugin is busy", function(assert) {
			sandbox.restore();
			var oModifyPluginListSpy = sandbox.spy(this.oRenamePlugin, "_modifyPluginList");
			sandbox.stub(OverlayUtil, "findAllOverlaysInContainer").returns([this.oLayoutOverlay]);
			this.oRenamePlugin.isBusy = function() {
				return true;
			};
			this.oLayoutOverlay.fireElementModified({
				type: "overlayRendered",
				id: this.oLayoutOverlay.getId()
			});
			assert.equal(oModifyPluginListSpy.callCount, 0, "then _modifyPluginList is not called");
		});

		QUnit.test("when _modifyPluginList is called multiple times", function(assert) {
			assert.equal(this.oButtonOverlay.getEditableByPlugins(), "sap.ui.rta.plugin.Rename", "then initially the rename plugin is in the list");

			this.oRemovePlugin._modifyPluginList(this.oButtonOverlay, true);
			this.oRemovePlugin._modifyPluginList(this.oButtonOverlay, true);
			this.oRenamePlugin._modifyPluginList(this.oButtonOverlay, true);
			assert.deepEqual(this.oButtonOverlay.getEditableByPlugins(), ["sap.ui.rta.plugin.Rename", "sap.ui.rta.plugin.Remove"], "then both plugins are in the list once");

			this.oRemovePlugin._modifyPluginList(this.oButtonOverlay, false);
			this.oRemovePlugin._modifyPluginList(this.oButtonOverlay, false);
			this.oRenamePlugin._modifyPluginList(this.oButtonOverlay, false);
			this.oRenamePlugin._modifyPluginList(this.oButtonOverlay, false);
			assert.deepEqual(this.oButtonOverlay.getEditableByPlugins(), [], "then both plugins got deleted");
		});
	});

	QUnit.module("Given the Plugin is initialized", {
		async beforeEach(assert) {
			this.oGroup = new FormContainer("group");
			this.oForm = new Form("Form", {
				formContainers: [this.oGroup]
			}).placeAt("qunit-fixture");

			this.oCheckControlIdSpy = sandbox.spy(FlexUtils, "checkControlId");

			await nextUIUpdate();

			this.oPlugin = new Plugin({
				commandFactory: new CommandFactory()
			});
			this.oDesignTime = new DesignTime({
				rootElements: [
					this.oForm
				],
				plugins: []
			});

			var done = assert.async();
			this.oDesignTime.attachEventOnce("synced", function() {
				this.oFormOverlay = OverlayRegistry.getOverlay(this.oForm);
				this.oGroupOverlay = OverlayRegistry.getOverlay(this.oGroup);
				done();
			}.bind(this));
		},
		afterEach() {
			this.oDesignTime.destroy();
			this.oForm.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when DesignTimeMetadata has no actions but aggregations with actions and checkAggregationsOnSelf method is called", function(assert) {
			this.oFormOverlay.setDesignTimeMetadata({
				aggregations: {
					formContainers: {
						actions: {
							changeType: "addGroup"
						}
					}
				}
			});

			return this.oPlugin.checkAggregationsOnSelf(this.oFormOverlay, "changeType")
			.then(function(bCheck) {
				assert.ok(bCheck, "then it returns true");
			});
		});

		QUnit.test("when DesignTimeMetadata has actions and checkAggregations method is called without the action name", function(assert) {
			this.oFormOverlay.setDesignTimeMetadata({
				actions: {}
			});

			return this.oPlugin.checkAggregationsOnSelf(this.oFormOverlay, undefined)
			.then(function(bCheck) {
				assert.notOk(bCheck, "then it returns false");
			});
		});

		QUnit.test("when DesignTimeMetadata has no actions but aggregations with actions and checkAggregationsOnSelf method is called with the aggregation name", function(assert) {
			this.oFormOverlay.setDesignTimeMetadata({
				aggregations: {
					formContainers: {
						actions: {
							changeType: "addGroup"
						}
					}
				}
			});

			return this.oPlugin.checkAggregationsOnSelf(this.oFormOverlay, "changeType", "formContainers")
			.then(function(bCheck) {
				assert.ok(bCheck, "then it returns true for the correct aggregation");
				return this.oPlugin.checkAggregationsOnSelf(this.oFormOverlay, "changeType", "dummyAggregation")
				.then(function(bCheck) {
					assert.notOk(bCheck, "then it returns false for another aggregation");
				});
			}.bind(this));
		});
	});

	QUnit.module("Given the Plugin is initialized.", {
		async beforeEach() {
			this.oTitle0 = new Title({id: "Title0"});
			this.oLabel0 = new Label({id: "Label0"});
			this.oInput0 = new Input({id: "Input0"});
			this.oSimpleForm = new SimpleForm("SimpleForm", {
				layout: "ResponsiveGridLayout",
				title: "Simple Form",
				content: [this.oTitle0, this.oLabel0, this.oInput0]
			});

			this.oVerticalLayout = new VerticalLayout({
				content: [this.oSimpleForm]
			}).placeAt("qunit-fixture");

			await nextUIUpdate();

			this.oForm = this.oSimpleForm.getAggregation("form");
			[this.oFormContainer] = this.oSimpleForm.getAggregation("form").getAggregation("formContainers");

			this.oCheckControlIdSpy = sandbox.spy(FlexUtils, "checkControlId");

			this.oPlugin = new Plugin({
				commandFactory: new CommandFactory()
			});
		},
		afterEach() {
			this.oPlugin.destroy();
			this.oVerticalLayout.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when DesignTimeMetadata has no actions but aggregations with actions and checkAggregations method is called", function(assert) {
			var done = assert.async();

			var oDesignTimeMetadata = {
				aggregations: {
					formContainer: {
						actions: {
							createContainer: {
								changeType: "addSimpleFormGroup",
								changeOnRelevantContainer: true
							}
						}
					}
				}
			};

			this.oDesignTime = new DesignTime({
				rootElements: [
					this.oVerticalLayout
				],
				plugins: [],
				designTimeMetadata: {
					"sap.ui.layout.form.SimpleForm": oDesignTimeMetadata
				}
			});

			this.oDesignTime.attachEventOnce("synced", function() {
				this.oFormOverlay = OverlayRegistry.getOverlay(this.oForm);
				assert.ok(this.oPlugin.checkAggregationsOnSelf(this.oFormOverlay, "createContainer"), "then it returns true");
				this.oDesignTime.destroy();
				done();
			}.bind(this));
		});

		QUnit.test("when control has no stable id, but it has stable elements retrieved by function in DT Metadata", function(assert) {
			var done = assert.async();

			var oDesignTimeMetadata = {
				aggregations: {
					form: {
						actions: {
							getStableElements(oElement) {
								var aStableElements = [];
								var oLabel;
								var oTitleOrToolbar;
								if (oElement.getMetadata().getName() === "sap.ui.layout.form.FormElement") {
									oLabel = oElement.getLabel();
									if (oLabel) {
										aStableElements.push(oLabel);
									}
									aStableElements = aStableElements.concat(oElement.getFields());
								} else if (oElement.getMetadata().getName() === "sap.ui.layout.form.FormContainer") {
									oTitleOrToolbar = oElement.getTitle() || oElement.getToolbar();
									if (oTitleOrToolbar) {
										aStableElements[0] = oTitleOrToolbar;
									}
									oElement.getFormElements().forEach(function(oFormElement) {
										oLabel = oFormElement.getLabel();
										if (oLabel) {
											aStableElements.push(oLabel);
										}
										aStableElements = aStableElements.concat(oFormElement.getFields());
									});
								}
								return aStableElements;
							}
						}
					}
				}
			};

			this.oDesignTime = new DesignTime({
				rootElements: [
					this.oVerticalLayout
				],
				plugins: [],
				designTimeMetadata: {
					"sap.ui.layout.form.SimpleForm": oDesignTimeMetadata
				}
			});

			this.oDesignTime.attachEventOnce("synced", function() {
				this.oFormContainerOverlay = OverlayRegistry.getOverlay(this.oFormContainer);
				assert.equal(this.oCheckControlIdSpy.callCount, 0, "then the utility method to check the control id has not yet been called for this Overlay");
				assert.strictEqual(this.oFormContainerOverlay.data("hasStableId"), null, "and the 'hasStableId' custom data of the Overlay is still undefined");
				assert.ok(this.oPlugin.hasStableId(this.oFormContainerOverlay), "then if hasStableId is called it returns true");
				assert.equal(this.oCheckControlIdSpy.callCount, 3, "and the utility method to check the control id is called once for each stable element");
				assert.ok(this.oPlugin.hasStableId(this.oFormContainerOverlay), "then a second call of hasStableId also returns true");
				assert.equal(this.oCheckControlIdSpy.callCount, 3, "but utility method to check the control id is not called again");
				this.oDesignTime.destroy();
				done();
			}.bind(this));
		});
	});

	QUnit.module("Given this the Plugin is initialized.", {
		async beforeEach(assert) {
			this.oTitle0 = new Title();
			this.oLabel0 = new Label();
			this.oInput0 = new Input();
			this.oSimpleForm = new SimpleForm("SimpleForm", {
				layout: "ResponsiveGridLayout",
				title: "Simple Form",
				content: [this.oTitle0, this.oLabel0, this.oInput0]
			});

			this.oVerticalLayout = new VerticalLayout({
				content: [this.oSimpleForm]
			}).placeAt("qunit-fixture");

			await nextUIUpdate();

			[this.oFormContainer] = this.oSimpleForm.getAggregation("form").getAggregation("formContainers");

			this.oCheckControlIdSpy = sandbox.spy(FlexUtils, "checkControlId");

			this.oPlugin = new Plugin();
			this.oDesignTime = new DesignTime({
				rootElements: [
					this.oVerticalLayout
				],
				plugins: []
			});

			var done = assert.async();
			this.oDesignTime.attachEventOnce("synced", function() {
				this.oLayoutOverlay = OverlayRegistry.getOverlay(this.oVerticalLayout);
				this.oSimpleFormOverlay = OverlayRegistry.getOverlay(this.oSimpleForm);
				this.oFormContainerOverlay = OverlayRegistry.getOverlay(this.oFormContainer);
				done();
			}.bind(this));
		},
		afterEach() {
			this.oVerticalLayout.destroy();
			this.oDesignTime.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when the control has no stable id and it has no stable elements to be retrieved by function in newly set DT Metadata", function(assert) {
			this.oFormContainerOverlay.setDesignTimeMetadata({
				aggregations: {
					form: {
						actions: {
							getStableElements(oElement) {
								var aStableElements = [];
								var oLabel;
								var oTitleOrToolbar;
								if (oElement.getMetadata().getName() === "sap.ui.layout.form.FormElement") {
									oLabel = oElement.getLabel();
									if (oLabel) {
										aStableElements.push(oLabel);
									}
									aStableElements = aStableElements.concat(oElement.getFields());
								} else if (oElement.getMetadata().getName() === "sap.ui.layout.form.FormContainer") {
									oTitleOrToolbar = oElement.getTitle() || oElement.getToolbar();
									if (oTitleOrToolbar) {
										aStableElements[0] = oTitleOrToolbar;
									}
									oElement.getFormElements().forEach(function(oFormElement) {
										oLabel = oFormElement.getLabel();
										if (oLabel) {
											aStableElements.push(oLabel);
										}
										aStableElements = aStableElements.concat(oFormElement.getFields());
									});
								}
								return aStableElements;
							}
						}
					}
				}
			});
			assert.equal(this.oCheckControlIdSpy.callCount, 0, "then the utility method to check the control id has not yet been called for this Overlay");
			assert.strictEqual(this.oFormContainerOverlay.data("hasStableId"), null, "and the 'hasStableId' property of the Overlay is still undefined");
			assert.notOk(this.oPlugin.hasStableId(this.oFormContainerOverlay), "then if hasStableId is called it returns false");
			assert.equal(this.oCheckControlIdSpy.callCount, 1, "and the utility method to check the control id is called once for each stable element");
		});

		QUnit.test("when the control has no stable id, no actions and hasStableId method is called", function(assert) {
			this.oFormContainerOverlay.setDesignTimeMetadata({
				aggregations: {
					form: {
						actions: {}
					}
				}
			});
			assert.notOk(this.oPlugin.hasStableId(this.oFormContainerOverlay), "then it returns false");
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});