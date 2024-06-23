/*global sinon, QUnit */
sap.ui.define([
	"sap/ui/core/mvc/XMLView",
	"sap/ui/base/ManagedObject",
	"sap/ui/core/CommandExecution",
	"sap/ui/core/Component",
	"sap/ui/core/ComponentRegistry",
	"sap/ui/core/ComponentContainer",
	"sap/ui/core/Control",
	"sap/ui/core/Shortcut",
	"sap/ui/core/routing/Targets",
	"sap/ui/core/routing/TargetCache",
	"sap/ui/model/json/JSONModel",
	"sap/m/Panel"
], function(
	XMLView,
	ManagedObject,
	CommandExecution,
	Component,
	ComponentRegistry,
	ComponentContainer,
	Control,
	Shortcut,
	Targets,
	TargetCache,
	JSONModel,
	Panel
) {
	"use strict";

	var oPanel, oInnerPanel, oControl, oInnerControl, oCE, oFakeCommand, oOwnerComponentFake, oStub;

	var sServiceUri = "http://services.odata.org/V3/Northwind/Northwind.svc/";
	sServiceUri = "/proxy/http/" + sServiceUri.replace("http://","");

	sap.ui.define("my/command/Component", ["sap/ui/core/UIComponent"], function(UIComponent) {
		return UIComponent.extend("my.command.Component", {
			metadata: {
				manifest: {
					"sap.app" : {
						"id" : "my.command.constructor",
						"dataSources": {
							"mainService": {
								"uri": sServiceUri,
								"type": "OData"
							}
						}
					},
					"sap.ui5": {
						"extends": {
							"extensions": {
								"sap.ui.commands": {
									"my.command2": {
										"Save": {
											"shortcut": "ctrl+k"
										},
										"Create": {
											"shortcut": "ctrl+a"
										}
									},
									"my.command2#component2": {
										"Save": {
											"shortcut": "ctrl+z"
										},
										"Print": {
											"shortcut": "ctrl+p"
										}
									}
								}
							}
						},
						"models": {
							"odata":{
								"type": "sap.ui.model.odata.v2.ODataModel",
								"dataSource": "mainService",
								"settings": {
									"warmupUrl":"test-resources/sap/ui/core/qunit/odata/v2/data/warmup.xml"
								}
							},
							"test": {
								"type": "sap.ui.model.json.JSONModel"
							}
						},
						"dependencies": {
							"libs": {
								"sap.ui.core": {},
								"sap.m": {}
							}
						},
						"commands": {
							"Save": {
								"shortcut": "Ctrl+S"
							},
							"Create": {
								"shortcut": "Ctrl+D"
							},
							"Exit": {
								"shortcut": "Ctrl+E"
							}
						},
						"config": {
							"sample": {
								"files": [
									"Component.js",
									"Commands.view.xml",
									"Commands.controller.js",
									"manifest.json"
								]
							}
						},
						"rootView": {
							"viewName": "my.command.Command",
							"type": "XML",
							"async": true
						}
					}
				}
			}
		});
	});

	sap.ui.define("my/command2/Component", ["sap/ui/core/UIComponent"], function(UIComponent) {
		return UIComponent.extend("my.command2.Component", {
			metadata: {
				manifest: {
					"sap.app" : {
						"id" : "my.command2.constructor",
						"dataSources": {
							"mainService": {
								"uri": sServiceUri,
								"type": "OData"
							}
						}
					},
					"sap.ui5": {
						"models": {
							"odata":{
								"type": "sap.ui.model.odata.v2.ODataModel",
								"dataSource": "mainService",
								"settings": {
									"warmupUrl":"test-resources/sap/ui/core/qunit/odata/v2/data/warmup.xml"
								}
							},
							"test": {
								"type": "sap.ui.model.json.JSONModel"
							}
						},
						"dependencies": {
							"libs": {
								"sap.ui.core": {},
								"sap.m": {}
							}
						},
						"commands": {
							"Save": {
								"shortcut": "Ctrl+S"
							},
							"Create": {
								"shortcut": "Ctrl+D"
							},
							"Exit": {
								"shortcut": "Ctrl+E"
							}
						},
						"config": {
							"sample": {
								"files": [
									"Component.js",
									"Commands.view.xml",
									"Commands.controller.js",
									"manifest.json"
								]
							}
						},
						"rootView": {
							"viewName": "my.command.Command2",
							"type": "XML",
							"async": true
						}
					}
				}
			},
			getExtensionComponent: function() {
				return ComponentRegistry.filter(function(oComponent) {
					return oComponent.getManifestEntry("/sap.app/id") === "my.command.constructor";
				})[0] || this;
			}
		});
	});

	sap.ui.define("my/command/Command.controller", ["sap/ui/core/mvc/Controller"], function(Controller) {
		return Controller.extend("my.command.Command", {
			onSave: function() {

			},
			onExit: function() {

			}
		});
	});


	var sView = `
<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:core="sap.ui.core" xmlns="sap.m" controllerName="my.command.Command" displayBlock="true">
	<App id="commands">
		<Page id="page" title="Commands" binding="{odata>/}" >
			<dependents>
				<core:CommandExecution id="CE_SAVE" command="Save" enabled="true" execute=".onSave" />
				<core:CommandExecution id="CE_EXIT" command="Exit" enabled="true" execute=".onExit" />
				<Popover id="popoverCommand" title="Popover" class="sapUiContentPadding"> 
					<dependents>
						<core:CommandExecution id="CE_SAVE_POPOVER" enabled="false" command="Save" execute=".onSave" />
					</dependents>
					<footer>
						<Toolbar>
							<Button text="Delete" press="cmd:Exit" enabled="{$cmd>Delete/enabled}" />
							<ToolbarSpacer />
							<Button text="Save" press="cmd:Save" enabled="{$cmd>Save/enabled}" />
						</Toolbar>
					</footer>
					<Input value="{viewModel>/value}" />
				</Popover>
			</dependents>
			<Panel id="PANEL" headerText="Button">
				<headerToolbar>
					<Toolbar>
						<Button text="TBButton" />
					</Toolbar>
				</headerToolbar>
				<dependents>
					<core:CommandExecution id="CE_SAVE_PANEL" command="Save" enabled="true" execute=".onSave" />
				</dependents>
				<Panel id="PANEL2" headerText="innerButton">
					<dependents>
						<core:CommandExecution id="CE_CREATE_INNER" command="Create" enabled="true" execute=".onExit" />
						<core:CommandExecution id="CE_SAVE_INNER" command="Save" enabled="true" execute=".onSave" />
						<core:CommandExecution id="CE_EXIT_INNER" command="Exit" enabled="true" execute=".onExit" />
					</dependents>
					<Button text="Save" press="cmd:Save" />
				</Panel>
				<Button text="Save" press="cmd:Save" />
			</Panel>
			<Panel headerText="sap.m.Input">
				<Input id="myInput" value="{viewModel>/value}" />
				<Table>
					<columns>
						<Column width="12em">
							<Text text="Product" />
						</Column>
					</columns>
					<items>
						<ColumnListItem>
							<dependents>
								<core:CommandExecution id="CE_SAVE_ITEM" command="Save" enabled="true" execute=".onSave" />
								<core:CommandExecution id="CE_EXIT_ITEM" command="Exit" enabled="true" execute=".onExit" />
							</dependents>
							<cells>
								<Text text="Name"/>
							</cells>
						</ColumnListItem>
					</items>
				</Table>
			</Panel>
		</Page>
	</App>
</mvc:View>
`;

	var sView2 = `
<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:core="sap.ui.core" xmlns="sap.m" controllerName="my.command.Command" displayBlock="true">
	<core:ComponentContainer id="CC" binding="{odata>/}" >
		<core:dependents>
			<core:CommandExecution command="Save" enabled="true" execute=".onSave" />
			<core:CommandExecution command="Exit" enabled="true" execute=".onExit" />
		</core:dependents>
	</core:ComponentContainer>
</mvc:View>
`;

	var sView3 = `
<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:core="sap.ui.core" xmlns="sap.m" controllerName="my.command.Command" displayBlock="true">
	<Panel>
		<dependents>
			<core:CommandExecution command="Save" enabled="true" execute=".onSave" />
			<core:CommandExecution command="Exit" enabled="true" execute=".onExit" />
		</dependents>
		<Panel headerText="innerButton" id="PANELV31">
			<dependents>
				<core:CommandExecution command="Save" enabled="true" execute=".onSave" />
				<core:CommandExecution command="Exit" enabled="true" execute=".onExit" />
			</dependents>
		</Panel>
		<Panel headerText="innerButton" id="PANELV32">
			<mvc:XMLView async="true" id="EMBEDDEDVIEW" viewName="my.command.Command2"/>
		</Panel>
	</Panel>
</mvc:View>
`;

	sap.ui.require.preload({
		"my/command/Command.view.xml": sView
	},"my/command/Command-preload");

	sap.ui.require.preload({
		"my/command/Command2.view.xml": sView2
	},"my/command/Command2-preload");

	sap.ui.require.preload({
		"my/command/Command3.view.xml": sView3
	},"my/command/Command3-preload");

	function fnInitControlTree() {
		oPanel = new Panel();
		oInnerPanel = new Panel();
		oControl = new Control({});
		oInnerControl = new Control({});
		oCE = new CommandExecution({command:"Save"});
		oPanel.addContent(oControl);
		oPanel.addContent(oInnerPanel);
		oInnerPanel.addContent(oInnerControl);
		oFakeCommand = {"Save":{shortcut:"Shift+s", fake:true}};
		oOwnerComponentFake = {getCommand: function(sCommand) {return oFakeCommand[sCommand];}};
		oStub = sinon.stub(Component, "getOwnerComponentFor").callsFake(
			function() {
				return oOwnerComponentFake;
			}
		);
	}

	function fnCleanup() {
		oCE.destroy();
		oPanel.destroy();
		oStub.restore();
	}

	QUnit.module("CommandExecution API");

	QUnit.test("constructor", function(assert) {
		assert.expect(1);
		function fnExecute() {}

		var oCommandExecution = new CommandExecution({command: "save", execute: fnExecute});

		assert.strictEqual(oCommandExecution.getCommand(), "save", "getCommand properly returns command");
	});

	QUnit.test("trigger", function(assert) {
		assert.expect(2);
		var oCommandExecution = new CommandExecution({command: "save", execute: fnExecute});

		function fnExecute() {
			assert.ok(true, "execute function triggered");
			assert.strictEqual(this, oCommandExecution, "context set to command execution");
		}

		oCommandExecution.trigger();
	});

	QUnit.test("find", function(assert) {
		fnInitControlTree();
		assert.expect(2);
		var oFCE = CommandExecution.find(oControl, "Save");
		assert.ok(!oFCE, "No CommandExecution exists");
		oPanel.addDependent(oCE);
		oFCE = CommandExecution.find(oControl, "Save");
		assert.strictEqual(oCE, oFCE, "CommandExecution found");
		fnCleanup();
	});

	QUnit.test("getCommandInfo", function(assert) {
		assert.expect(1);
		function fnExecute() {}

		//restore before redefine
		oStub.restore();
		var oFakeCommand = {fake:true};
		var oOwnerComponentFake = {getCommand: function() {return oFakeCommand;}};
		oStub = sinon.stub(Component, "getOwnerComponentFor").callsFake(
			function() {
				return oOwnerComponentFake;
			}
		);
		var oCommandExecution = new CommandExecution({command: "save", execute: fnExecute});

		assert.deepEqual(oCommandExecution._getCommandInfo(), oFakeCommand, "Command Info returned properly");
		oStub.restore();
	});

	QUnit.test("setCommand", function(assert) {
		assert.expect(2);

		fnInitControlTree();
		oPanel.addDependent(oCE);

		var oFCE = CommandExecution.find(oControl, "Save");
		assert.equal(oFCE.getCommand(), "Save", "Command set correctly");
		oFCE.setCommand("Exit");
		assert.equal(oFCE.getCommand(), "Save", "Command name is not changeable");
		fnCleanup();
	});

	QUnit.test("enabled", function(assert) {
		assert.expect(2);

		var oCommandExecution = new CommandExecution({command: "save", execute: fnExecuteNOK, enabled: false});

		function fnExecuteNOK() {
			assert.ok(false, "disabled CommandExecution should not be triggered");
		}

		function fnExecuteOK() {
			assert.ok(true, "execute function triggered");
			assert.strictEqual(this, oCommandExecution, "context set to command execution");
		}

		oCommandExecution.trigger();
		oCommandExecution.detachExecute(fnExecuteNOK);
		oCommandExecution.attachExecute(fnExecuteOK);
		oCommandExecution.trigger();
		oCommandExecution.setEnabled(true);
		oCommandExecution.trigger();
	});

	QUnit.test("visible", function(assert) {
		assert.expect(2);

		var oCommandExecution = new CommandExecution({command: "save", execute: fnExecute, enabled: true, visible: true});

		function fnExecute() {
			assert.ok(true, "execute function must not be triggered if visible === false");
			assert.strictEqual(this, oCommandExecution, "if enable and not visible we must not trigger the command execution");
		}

		oCommandExecution.trigger();
		oCommandExecution.setVisible(false);
		oCommandExecution.trigger();
	});

	QUnit.module("CommandExecution integration:");

	QUnit.test("ComponentContainer without Component", function(assert) {
		var oComponent;
		var oModel;
		return Component.create({
			name: "my.command2",
			manifest: false
		}).then(function(myComponent) {
			oComponent = myComponent;
			return oComponent.getRootControl().loaded();
		}).then(function(oView) {
			oModel = oView.getModel("odata");
			return oView.getModel("odata").metadataLoaded();
		}).then(function() {
			var oPanel = new Panel();
			var oCompCont = new ComponentContainer({component: oComponent});
			oPanel.setModel(oModel, "odata");
			oPanel.setModel(new JSONModel(), "$cmd");
			oPanel.addContent(oCompCont);
			assert.ok(true, "should not fail");
		});
	});

	QUnit.test("enabled $cmd model", function(assert) {
		assert.expect(10);

		//create control tree
		fnInitControlTree();
		oStub.restore();

		//stub component calls
		var oFakeCommand = {
			"Save": {
				"shortcut": "Ctrl+S"
			},
			"Exit": {
				"shortcut": "Ctrl+E"
			}
		};
		var oOwnerComponentFake = {getCommand: function(sCommand) {return oFakeCommand[sCommand];}};
		//restore before redefine
		oStub = sinon.stub(Component, "getOwnerComponentFor").callsFake(
			function() {
				return oOwnerComponentFake;
			}
		);

		var oCE_Exit = new CommandExecution({command:"Exit", enabled:true});
		var oCE_Save = new CommandExecution({command:"Save", enabled:true});
		var oCE_InnerSave = new CommandExecution({command:"Save", enabled:false});

		oPanel.addDependent(oCE_Exit);
		oPanel.addDependent(oCE_Save);
		oInnerPanel	.addDependent(oCE_InnerSave);

		//set dummy model for testing
		oPanel.setModel(new JSONModel(), "dummy");
		//the model normally is created by the component.
		oPanel.setModel(new JSONModel(), "$cmd");

		//check CommandExecutions in Control tree
		assert.equal(oCE_InnerSave, CommandExecution.find(oInnerControl, "Save"));
		assert.equal(oCE_Exit, CommandExecution.find(oInnerControl, "Exit"));
		assert.equal(oCE_Save, CommandExecution.find(oControl, "Save"));
		assert.equal(oCE_Exit, CommandExecution.find(oControl, "Exit"));

		//check model data
		var oModel = oPanel.getModel("$cmd");
		var oContext = oPanel.getBindingContext("$cmd");
		var oInnerContext = oInnerPanel.getBindingContext("$cmd");
		assert.equal(oInnerContext.getPath(), "/" + oInnerPanel.getId(), "Context to prototype set correctly");
		assert.equal(oContext.getPath(), "/" + oPanel.getId(), "Context to prototype set correctly");

		assert.equal(oModel.getProperty("Save/enabled", oInnerContext), false, "enabled correctly set in  model");
		assert.equal(oModel.getProperty("Exit/enabled", oInnerContext), true, "enabled correctly set in  model");
		assert.equal(oModel.getProperty("Save/enabled", oContext), true, "enabled correctly set in  model");
		assert.equal(oModel.getProperty("Exit/enabled", oContext), true, "enabled correctly set in  model");
		fnCleanup();
	});

	QUnit.test("via Component instantiation", function(assert) {
		assert.expect(6);
		var oComponent;

		// load the test component
		return Component.create({
			name: "my.command",
			manifest: false
		}).then(function(myComponent) {
			oComponent = myComponent;
			return oComponent.getRootControl().loaded();
		}).then(function(oView) {
			var oModel = oComponent.getModel("$cmd");
			var oPage = oView.byId("page");
			var oPopover = oView.byId("popoverCommand");
			var oPageContext = oPage.getBindingContext("$cmd");
			var oPagePopoverContext = oPopover.getBindingContext("$cmd");

			assert.equal(oPagePopoverContext.getPath(), "/" + oPopover.getId(), "Context to prototype set correctly");
			assert.equal(oPageContext.getPath(), "/" + oPage.getId(), "Context to prototype set correctly");

			assert.equal(oModel.getProperty("Save/enabled", oPagePopoverContext), false, "enabled correctly set in  model");
			assert.equal(oModel.getProperty("Exit/enabled", oPagePopoverContext), true, "enabled correctly set in  model");
			assert.equal(oModel.getProperty("Save/enabled", oPageContext), true, "enabled correctly set in  model");
			assert.equal(oModel.getProperty("Exit/enabled", oPageContext), true, "enabled correctly set in  model");
			oComponent.destroy();
		});
	});

	QUnit.test("remove CommandExecution", function(assert) {
		assert.expect(2);
		var oComponent;

		// load the test component
		return Component.create({
			name: "my.command",
			manifest: false
		}).then(function(myComponent) {
			oComponent = myComponent;
			return oComponent.getRootControl().loaded();
		}).then(function(oView) {
			var oPopover = oView.byId("popoverCommand");
			var oPage = oView.byId("page");

			assert.notEqual(oPopover.getBindingContext("$cmd"), oPage.getBindingContext("$cmd"), "different contexts");
			oPopover.removeAllAggregation("dependents");
			assert.equal(oPopover.getBindingContext("$cmd"), oPage.getBindingContext("$cmd"), "equal contexts");
			oComponent.destroy();
		});
	});

	QUnit.test("CommandInfo", function(assert) {
		assert.expect(3);
		var oComponent;

		// load the test component
		return Component.create({
			name: "my.command",
			manifest: false
		}).then(function(myComponent) {
			oComponent = myComponent;
			return oComponent.getRootControl().loaded();
		}).then(function(oView) {
			var oPopover = oView.byId("popoverCommand");
			var oCE = oPopover.getDependents()[0];
			var oCE2 = new CommandExecution({command:"Save"});
			assert.ok(oCE._getCommandInfo(), "command info found");
			assert.ok(!oCE2._getCommandInfo(), "no command info found");
			assert.strictEqual(oCE2._getCommandInfo(), null, "null returned");
			oComponent.destroy();
		});
	});

	QUnit.test("add CommandExecution without owner", function(assert) {
		assert.expect(1);
		var oComponent;

		// load the test component
		return Component.create({
			name: "my.command",
			manifest: false
		}).then(function(myComponent) {
			oComponent = myComponent;
			return oComponent.getRootControl().loaded();
		}).then(function(oView) {
			var oPopover = oView.byId("popoverCommand");
			var oCE = new CommandExecution({command:"Exit"});
			oPopover.addDependent(oCE);
			assert.ok(oCE._getCommandInfo(), "command info found");
			oComponent.destroy();
		});
	});

	QUnit.test("CommandExecution remove from aggregation and destroy", function(assert) {
		assert.expect(2);
		var oComponent;

		// load the test component
		return Component.create({
			name: "my.command",
			manifest: false
		}).then(function(myComponent) {
			oComponent = myComponent;
			return oComponent.getRootControl().loaded();
		}).then(function(oView) {
			var oPopover = oView.byId("popoverCommand");
			var oCE = new CommandExecution({command:"Exit", execute:function() {assert.ok(false, "should not happen");}});
			oPopover.addDependent(oCE);
			assert.ok(oCE._getCommandInfo(), "command info found");
			oCE = oPopover.removeAllDependents()[0];
			oCE.trigger();
			assert.equal(oCE.getParent(), null, "successfully removed from aggregation");
			oComponent.destroy();
			oCE.destroy();
		});
	});

	QUnit.test("CommandExecution change parent", function(assert) {
		assert.expect(3);
		var oComponent;

		// load the test component
		return Component.create({
			name: "my.command",
			manifest: false
		}).then(function(myComponent) {
			oComponent = myComponent;
			return oComponent.getRootControl().loaded();
		}).then(function(oView) {
			var oPopover = oView.byId("popoverCommand");
			var oPage = oView.byId("page");
			var oCE = new CommandExecution({command:"Exit", execute:function() {assert.ok(true, "should happen");}});
			oPopover.addDependent(oCE);
			oPage.addDependent(oCE);
			assert.ok(!Shortcut.isRegistered(oPopover, "ctrl+e"), "shortcut deregistered");
			assert.ok(Shortcut.isRegistered(oPage, "ctrl+e"), "shortcut registered");
			oCE.trigger();
			oComponent.destroy();
			oCE.destroy();
		});
	});

	QUnit.test("CommandExecution destroy component with routing", function(assert) {
		assert.expect(1);
		var oPanel = new Panel({id: "test"}),
			oTargets = new Targets({
			config: {
				async: true
			},
			cache: new TargetCache(),
			targets: {
				"test": {
					type: "Component",
					name: "my.command",
					controlId: "test",
					controlAggregation: "content",
					options: {
						manifest: false
					},
					containerOptions: {
						propagateModel: true,
						lifecycle: "Application"
					}
				}
			}
		});
		oPanel.placeAt("qunit-fixture");
		return oTargets.display("test").then(function(oParams) {
			//get ComponentContainer
			var oContainer = oParams[0].view;
			//add a model to comp container to fore propagation on comp container exit
			oContainer.setModel(new JSONModel());
			return oContainer.getComponentInstance().getRootControl().loaded().then(function() {
				return oContainer.getComponentInstance();
			});
		}).then(function(oComponent) {
			//destroy Component
			oComponent.destroy();
			assert.ok(true, "Must not fail!");
		});
	});

	QUnit.test("CommandExecution destroy component with multiple executions", function(assert) {
		assert.expect(1);
		var oComponent;

		// load the test component
		return Component.create({
			name: "my.command",
			manifest: false
		}).then(function(myComponent) {
			oComponent = myComponent;
			return oComponent.getRootControl().loaded();
		}).then(function(oView) {
			var oPanel = oView.byId("PANEL2");
			oPanel.destroyDependents();
			assert.strictEqual(oPanel._propagateProperties, ManagedObject.prototype._propagateProperties, "_propagateProperties resetted correctly");
			var oCOE3 = oView.byId("CE_SAVE_PANEL");
			oCOE3.destroy();
			oComponent.destroy();
		});
	});

	QUnit.test("CommandExecution check prototype chain", function(assert) {
		assert.expect(21);
		var oComponent;

		// load the test component
		return Component.create({
			name: "my.command",
			manifest: false
		}).then(function(myComponent) {
			oComponent = myComponent;
			return oComponent.getRootControl().loaded();
		}).then(function(oView) {
			var oCOE1 = oView.byId("CE_SAVE");
			var oCOE2 = oView.byId("CE_EXIT");
			var oCOE3 = oView.byId("CE_SAVE_PANEL");
			var oCOE4 = oView.byId("CE_SAVE_INNER");
			var oCOE5 = oView.byId("CE_CREATE_INNER");
			var oCOE6 = oView.byId("CE_EXIT_INNER");

			//root CE data has no prototype
			var oProt1 = Object.getPrototypeOf(oCOE1.getBindingContext("$cmd").getObject());
			var oProt2 = Object.getPrototypeOf(oCOE2.getBindingContext("$cmd").getObject());
			assert.strictEqual(oProt1, null, "Command execution on Page has no prototype");
			assert.strictEqual(oProt2, null, "Command execution on Page has no prototype");
			//panel CE has the root data as prototype
			var oProt3 = Object.getPrototypeOf(oCOE3.getBindingContext("$cmd").getObject());
			assert.strictEqual(oProt3, oCOE1.getBindingContext("$cmd").getObject(), "Command execution on Panel has root data prototype");
			assert.strictEqual(Object.getPrototypeOf(oProt3), null, "Command execution on Page has no prototype");
			//Inner CEs have the panel data as prototype
			var oProt4 = Object.getPrototypeOf(oCOE4.getBindingContext("$cmd").getObject());
			var oProt5 = Object.getPrototypeOf(oCOE5.getBindingContext("$cmd").getObject());
			var oProt6 = Object.getPrototypeOf(oCOE6.getBindingContext("$cmd").getObject());
			assert.strictEqual(oProt4, oCOE3.getBindingContext("$cmd").getObject(), "Command execution on inner Panel has panel data prototype");
			assert.strictEqual(oProt5, oCOE3.getBindingContext("$cmd").getObject(), "Command execution on inner Panel has panel data prototype");
			assert.strictEqual(oProt6, oCOE3.getBindingContext("$cmd").getObject(), "Command execution on inner Panel has panel data prototype");
			assert.strictEqual(Object.getPrototypeOf(oProt4), oProt3, "Command execution on Page has no prototype");
			assert.strictEqual(Object.getPrototypeOf(oProt5), oProt3, "Command execution on Page has no prototype");
			assert.strictEqual(Object.getPrototypeOf(oProt6), oProt3, "Command execution on Page has no prototype");

			//delete panel CE
			oCOE3.destroy();
			//root CE data has no prototype
			oProt1 = Object.getPrototypeOf(oCOE1.getBindingContext("$cmd").getObject());
			oProt2 = Object.getPrototypeOf(oCOE2.getBindingContext("$cmd").getObject());
			assert.strictEqual(oProt1, null, "Command execution on Page has no prototype");
			assert.strictEqual(oProt2, null, "Command execution on Page has no prototype");
			//Inner CEs have the root data as prototype
			oProt4 = Object.getPrototypeOf(oCOE4.getBindingContext("$cmd").getObject());
			oProt5 = Object.getPrototypeOf(oCOE5.getBindingContext("$cmd").getObject());
			oProt6 = Object.getPrototypeOf(oCOE6.getBindingContext("$cmd").getObject());
			assert.strictEqual(oProt4, oCOE1.getBindingContext("$cmd").getObject(), "Command execution on inner Panel has page data prototype");
			assert.strictEqual(oProt5, oCOE1.getBindingContext("$cmd").getObject(), "Command execution on inner Panel has page data prototype");
			assert.strictEqual(oProt6, oCOE1.getBindingContext("$cmd").getObject(), "Command execution on inner Panel has page data prototype");
			assert.strictEqual(Object.getPrototypeOf(oProt4), oProt2, "Command execution on Page has no prototype");
			assert.strictEqual(Object.getPrototypeOf(oProt5), oProt2, "Command execution on Page has no prototype");
			assert.strictEqual(Object.getPrototypeOf(oProt6), oProt2, "Command execution on Page has no prototype");

			//delete root CE
			oCOE1.destroy();
			oCOE2.destroy();
			//Inner CEs have the root data as prototype
			oProt4 = Object.getPrototypeOf(oCOE4.getBindingContext("$cmd").getObject());
			oProt5 = Object.getPrototypeOf(oCOE5.getBindingContext("$cmd").getObject());
			oProt6 = Object.getPrototypeOf(oCOE6.getBindingContext("$cmd").getObject());
			assert.strictEqual(oProt4, null, "Command execution on inner Panel has page data prototype");
			assert.strictEqual(oProt4, null, "Command execution on inner Panel has page data prototype");
			assert.strictEqual(oProt4, null, "Command execution on inner Panel has page data prototype");
			oComponent.destroy();
		});
	});

	QUnit.test("CommandExecution visibility - initial values", function(assert) {
		assert.expect(6);
		var oComponent;

		// load the test component
		return Component.create({
			name: "my.command",
			manifest: false
		}).then(function(myComponent) {
			oComponent = myComponent;
			return oComponent.getRootControl().loaded();
		}).then(function(oView) {
			var oModel = oComponent.getModel("$cmd");
			var oPage = oView.byId("page");
			var oPopover = oView.byId("popoverCommand");
			var oPageContext = oPage.getBindingContext("$cmd");
			var oPagePopoverContext = oPopover.getBindingContext("$cmd");

			assert.equal(oPagePopoverContext.getPath(), "/" + oPopover.getId(), "Context to prototype set correctly");
			assert.equal(oPageContext.getPath(), "/" + oPage.getId(), "Context to prototype set correctly");

			assert.equal(oModel.getProperty("Save/visible", oPagePopoverContext), true, "visible property correctly set in  model");
			assert.equal(oModel.getProperty("Exit/visible", oPagePopoverContext), true, "visible property correctly set in  model");
			assert.equal(oModel.getProperty("Save/visible", oPageContext), true, "visible property correctly set in  model");
			assert.equal(oModel.getProperty("Exit/visible", oPageContext), true, "visible property correctly set in  model");
			oComponent.destroy();
		});
	});

	QUnit.test("CommandExecution visibility - switch values", function(assert) {
		assert.expect(21);
		var oComponent;

		// load the test component
		return Component.create({
			name: "my.command",
			manifest: false
		}).then(function(myComponent) {
			oComponent = myComponent;
			return oComponent.getRootControl().loaded();
		}).then(function(oView) {
			var oModel = oComponent.getModel("$cmd");
			var oPage = oView.byId("page");
			var oPopover = oView.byId("popoverCommand");
			var CO_S_P = oView.byId("CE_SAVE_POPOVER");
			var CO_S = oView.byId("CE_SAVE");
			var CO_E = oView.byId("CE_EXIT");
			var oPageContext = oPage.getBindingContext("$cmd");
			var oPagePopoverContext = oPopover.getBindingContext("$cmd");

			assert.equal(oPagePopoverContext.getPath(), "/" + oPopover.getId(), "Context to prototype set correctly");
			assert.equal(oPageContext.getPath(), "/" + oPage.getId(), "Context to prototype set correctly");

			assert.equal(oModel.getProperty("Save/visible", oPagePopoverContext), true, "visible property correctly set in  model");
			assert.equal(oModel.getProperty("Exit/visible", oPagePopoverContext), true, "visible property correctly set in  model");
			assert.equal(oModel.getProperty("Save/visible", oPageContext), true, "visible property correctly set in  model");
			assert.equal(oModel.getProperty("Exit/visible", oPageContext), true, "visible property correctly set in  model");
			CO_S_P.setVisible(false);
			assert.equal(oModel.getProperty("Save/visible", oPagePopoverContext), false, "visible property correctly set in  model");
			assert.equal(oModel.getProperty("Save/visible", oPageContext), true, "visible property correctly set in  model");
			assert.equal(oModel.getProperty("Exit/visible", oPageContext), true, "visible property correctly set in  model");
			CO_S.setVisible(false);
			assert.equal(oModel.getProperty("Save/visible", oPagePopoverContext), false, "visible property correctly set in  model");
			assert.equal(oModel.getProperty("Save/visible", oPageContext), false, "visible property correctly set in  model");
			assert.equal(oModel.getProperty("Exit/visible", oPageContext), true, "visible property correctly set in  model");
			CO_S.setVisible(true);
			assert.equal(oModel.getProperty("Save/visible", oPagePopoverContext), false, "visible property correctly set in  model");
			assert.equal(oModel.getProperty("Save/visible", oPageContext), true, "visible property correctly set in  model");
			assert.equal(oModel.getProperty("Exit/visible", oPageContext), true, "visible property correctly set in  model");
			CO_S_P.setVisible(true);
			CO_S.setVisible(false);
			assert.equal(oModel.getProperty("Save/visible", oPagePopoverContext), true, "visible property correctly set in  model");
			assert.equal(oModel.getProperty("Save/visible", oPageContext), false, "visible property correctly set in  model");
			assert.equal(oModel.getProperty("Exit/visible", oPageContext), true, "visible property correctly set in  model");
			CO_E.setVisible(false);
			assert.equal(oModel.getProperty("Save/visible", oPagePopoverContext), true, "visible property correctly set in  model");
			assert.equal(oModel.getProperty("Exit/visible", oPageContext), false, "visible property correctly set in  model");
			assert.equal(oModel.getProperty("Exit/visible", oPageContext), false, "visible property correctly set in  model");
			oComponent.destroy();
		});
	});

	QUnit.test("CommandExecution visibility - Shortcut registration", function(assert) {
		assert.expect(24);
		var oComponent;

		// load the test component
		return Component.create({
			name: "my.command",
			manifest: false
		}).then(function(myComponent) {
			oComponent = myComponent;
			return oComponent.getRootControl().loaded();
		}).then(function(oView) {
			var oPage = oView.byId("page");
			var oPopover = oView.byId("popoverCommand");
			var CO_S_P = oView.byId("CE_SAVE_POPOVER");
			var CO_S = oView.byId("CE_SAVE");
			var CO_E = oView.byId("CE_EXIT");

			assert.ok(Shortcut.isRegistered(oPage, "ctrl+s"), "Shortcut registered");
			assert.ok(Shortcut.isRegistered(oPage, "ctrl+e"), "Shortcut registered");
			assert.ok(!Shortcut.isRegistered(oPopover, "ctrl+e"), "Shortcut not registered");
			assert.ok(Shortcut.isRegistered(oPopover, "ctrl+s"), "Shortcut registered");
			CO_S_P.setVisible(false);
			assert.ok(Shortcut.isRegistered(oPage, "ctrl+s"), "Shortcut registered");
			assert.ok(Shortcut.isRegistered(oPage, "ctrl+e"), "Shortcut registered");
			assert.ok(!Shortcut.isRegistered(oPopover, "ctrl+e"), "Shortcut not registered");
			assert.ok(!Shortcut.isRegistered(oPopover, "ctrl+s"), "Shortcut not registered");
			CO_S.setVisible(false);
			assert.ok(!Shortcut.isRegistered(oPage, "ctrl+s"), "Shortcut not registered");
			assert.ok(Shortcut.isRegistered(oPage, "ctrl+e"), "Shortcut registered");
			assert.ok(!Shortcut.isRegistered(oPopover, "ctrl+e"), "Shortcut not registered");
			assert.ok(!Shortcut.isRegistered(oPopover, "ctrl+s"), "Shortcut not registered");
			CO_S.setVisible(true);
			assert.ok(Shortcut.isRegistered(oPage, "ctrl+s"), "Shortcut registered");
			assert.ok(Shortcut.isRegistered(oPage, "ctrl+e"), "Shortcut registered");
			assert.ok(!Shortcut.isRegistered(oPopover, "ctrl+e"), "Shortcut not registered");
			assert.ok(!Shortcut.isRegistered(oPopover, "ctrl+s"), "Shortcut not registered");
			CO_S_P.setVisible(true);
			assert.ok(Shortcut.isRegistered(oPage, "ctrl+s"), "Shortcut registered");
			assert.ok(Shortcut.isRegistered(oPage, "ctrl+e"), "Shortcut registered");
			assert.ok(!Shortcut.isRegistered(oPopover, "ctrl+e"), "Shortcut not registered");
			assert.ok(Shortcut.isRegistered(oPopover, "ctrl+s"), "Shortcut registered");
			CO_E.setVisible(false);
			assert.ok(Shortcut.isRegistered(oPage, "ctrl+s"), "Shortcut registered");
			assert.ok(!Shortcut.isRegistered(oPage, "ctrl+e"), "Shortcut not registered");
			assert.ok(!Shortcut.isRegistered(oPopover, "ctrl+e"), "Shortcut not registered");
			assert.ok(Shortcut.isRegistered(oPopover, "ctrl+s"), "Shortcut registered");
			oComponent.destroy();
		});
	});

	QUnit.test("CommandExecution $cmd model propagation", function(assert) {
		assert.expect(1);
		var oComponent;

		// load the test component
		return Component.create({
			name: "my.command",
			manifest: false
		}).then(function(myComponent) {
			oComponent = myComponent;
			return oComponent.getRootControl().loaded();
		}).then(function(oView) {
			return oComponent.runAsOwner(function() {
				return XMLView.create({
					viewName: "my.command.Command3"
				});
			});
		}).then(function(oView){
			var oPanel = oComponent.getRootControl().byId("PANEL2");
			oPanel.addContent(oView);
			assert.ok(true, "must not fail");
			oComponent.destroy();
		});
	});

	QUnit.test("CommandExecution $cmd model propagation - move child", function(assert) {
		assert.expect(1);
		var oComponent;

		// load the test component
		return Component.create({
			name: "my.command",
			manifest: false
		}).then(function(myComponent) {
			oComponent = myComponent;
			return oComponent.getRootControl().loaded();
		}).then(function(oView) {
			return oComponent.runAsOwner(function() {
				return XMLView.create({
					viewName: "my.command.Command3"
				});
			});
		}).then(function(oView){
			var oView2 = oView.byId("EMBEDDEDVIEW");
			var oPanel = oView.byId("PANELV31");
			oPanel.addContent(oView2);
			assert.ok(true, "must not fail");
			oComponent.destroy();
		});
	});

	QUnit.module("Instance specific commands");

	QUnit.test("ExtensionComponent overwrites commands from reuse component", function(assert) {
		assert.expect(6);

		var oComponent1;

		return Component.create({
			name: "my.command",
			manifest: false
		}).then(function(oComponent) {
			oComponent1 = oComponent;
			return oComponent.rootControlLoaded();
		}).then(function(oView) {
			return oComponent1.runAsOwner(function() {
				return Component.create({
					name: "my.command2",
					id: oComponent1.createId("component2")
				});
			}).then(function(oComponent2) {
				var oExepected = {
					"Create": {shortcut: 'ctrl+a'},
					"Exit": {shortcut: 'Ctrl+E'},
					"Print": {shortcut: 'ctrl+p'},
					"Save": {shortcut: 'ctrl+z'}
				};

				// empty argument
				assert.deepEqual(oComponent2.getCommand(), oExepected, "All commands are correctly merged");

				// unknown command name
				assert.strictEqual(oComponent2.getCommand("unknown"), undefined, "Unkown command should return undefined");

				// Create overwritten for all Component2 instances
				// Exit is defined in Component2 (not overwritten)
				// Print is new with #component2 instance
				// Save is overwritten by #component2 instance
				assert.deepEqual(oComponent2.getCommand("Create"), {shortcut: "ctrl+a"}, "'Create' Command found");
				assert.deepEqual(oComponent2.getCommand("Exit"),   {shortcut: "Ctrl+E"}, "'Exit' Command found");
				assert.deepEqual(oComponent2.getCommand("Print"),  {shortcut: "ctrl+p"}, "'Print' Command found");
				assert.deepEqual(oComponent2.getCommand("Save"),   {shortcut: "ctrl+z"}, "'Save' Command found");

			});
		});
	});
	QUnit.test("ExtensionComponent overwrites commands from reuse component", function(assert) {
		assert.expect(6);

		return Component.create({
			name: "my.command",
			manifest: false
		}).then(function(oComponent) {
			return oComponent.rootControlLoaded();
		}).then(function(oView) {
			return Component.create({
				name: "my.command2",
				id: "component2"
			}).then(function(oComponent2) {
				var oExepected = {
					"Create": {shortcut: 'ctrl+a'},
					"Exit": {shortcut: 'Ctrl+E'},
					"Print": {shortcut: 'ctrl+p'},
					"Save": {shortcut: 'ctrl+z'}
				};

				// empty argument
				assert.deepEqual(oComponent2.getCommand(), oExepected, "All commands are correctly merged");

				// unknown command name
				assert.strictEqual(oComponent2.getCommand("unknown"), undefined, "Unkown command should return undefined");

				// Create overwritten for all Component2 instances
				// Exit is defined in Component2 (not overwritten)
				// Print is new with #component2 instance
				// Save is overwritten by #component2 instance
				assert.deepEqual(oComponent2.getCommand("Create"), {shortcut: "ctrl+a"}, "'Create' Command found");
				assert.deepEqual(oComponent2.getCommand("Exit"),   {shortcut: "Ctrl+E"}, "'Exit' Command found");
				assert.deepEqual(oComponent2.getCommand("Print"),  {shortcut: "ctrl+p"}, "'Print' Command found");
				assert.deepEqual(oComponent2.getCommand("Save"),   {shortcut: "ctrl+z"}, "'Save' Command found");
			});
		});
	});
});
