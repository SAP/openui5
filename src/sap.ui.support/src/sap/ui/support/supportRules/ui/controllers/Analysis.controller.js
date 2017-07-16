/*!
 * ${copyright}
 */

sap.ui.define([
	"jquery.sap.global",
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/Panel",
	"sap/m/List",
	"sap/m/ListItemBase",
	"sap/m/StandardListItem",
	"sap/m/InputListItem",
	"sap/m/Button",
	"sap/m/Toolbar",
	"sap/m/ToolbarSpacer",
	"sap/m/Label",
	"sap/m/MessageToast",
	"sap/ui/support/supportRules/WindowCommunicationBus",
	"sap/ui/support/supportRules/WCBChannels",
	"sap/ui/support/supportRules/ui/models/SharedModel",
	"sap/ui/support/supportRules/RuleSerializer",
	"sap/ui/support/supportRules/Constants",
	"sap/ui/support/supportRules/RuleSet",
	"sap/ui/support/supportRules/Storage"
], function ($, Controller, JSONModel, Panel, List, ListItemBase, StandardListItem, InputListItem, Button, Toolbar, ToolbarSpacer,
		Label, MessageToast, CommunicationBus, channelNames, SharedModel, RuleSerializer, constants, Ruleset, storage) {
	"use strict";


	return Controller.extend("sap.ui.support.supportRules.ui.controllers.Analysis", {
		onInit: function () {
			this.model = SharedModel;
			this.setCommunicationSubscriptions();
			this.initSettingsPopover();

			CommunicationBus.publish(channelNames.ON_INIT_ANALYSIS_CTRL);
			this.tempRulesLoaded = false;

			this.getView().setModel(this.model);
			this.treeTable = this.getView().byId("ruleList");
			this.cookie = storage.readPersistenceCookie(constants.COOKIE_NAME);
			this.persistingSettings = this.model.getProperty("/persistingSettings");
		},

		getTemporaryLib: function () {
			var libs = this.model.getProperty("/libraries");

			for (var i = 0; i < libs.length; i++) {
				if (libs[i].title == constants.TEMP_RULESETS_NAME) {
					return libs[i];
				}
			}
		},
		setCommunicationSubscriptions: function () {
			CommunicationBus.subscribe(channelNames.UPDATE_SUPPORT_RULES, this.updatesupportRules, this);

			CommunicationBus.subscribe(channelNames.VERIFY_RULE_CREATE_RESULT, function (data) {
				var result = data.result,
					newRule = RuleSerializer.deserialize(data.newRule, true),
					tempLib = this.getTemporaryLib(),
					treeTable = this.model.getProperty('/treeViewModel');
				if (result == "success") {
					tempLib.rules.push(newRule);
					this._syncTreeTableVieModelTempRulesLib(tempLib, treeTable);
					if (this.persistingSettings) {
						storage.setRules(tempLib.rules);
						if (this.showRuleCreatedToast) {
							MessageToast.show('Your temporary rule "' + newRule.id + '" was persisted in the local storage');
							this.showRuleCreatedToast = false;
						}
					}

					var emptyRule = this.model.getProperty("/newEmptyRule");
					this.model.setProperty("/newRule", jQuery.extend(true, {}, emptyRule));
					this.goToRuleProperties();
					this.model.setProperty("/selectedRule", newRule);
				} else {
					MessageToast.show("Add rule failed because: " + result);
				}
			}, this);

			CommunicationBus.subscribe(channelNames.VERIFY_RULE_UPDATE_RESULT, function (data) {
				var result = data.result,
					updateRule = RuleSerializer.deserialize(data.updateRule, true),
					that = this;

				if (result === "success") {
					var ruleSource = this.model.getProperty("/editRuleSource"),
					treeTable = this.model.getProperty('/treeViewModel');
					var libraries = this.model.getProperty('/libraries');
					libraries.forEach(function(lib, libIndex){
						if (lib.title === constants.TEMP_RULESETS_NAME) {
							lib.rules.forEach(function(rule, ruleIndex){
								if (rule.id === ruleSource.id) {
									lib.rules[ruleIndex] = updateRule;
									if (that.persistingSettings) {
										storage.setRules(lib.rules);
									}
								}
							});
							that._syncTreeTableVieModelTempRule(updateRule,treeTable);
						}
					});

					this.model.checkUpdate(true);
					this.model.setProperty('/selectedRule', updateRule);

					this.goToRuleProperties();
				} else {
					MessageToast.show("Update rule failed because: " + result);
				}
			}, this);

			CommunicationBus.subscribe(channelNames.POST_AVAILABLE_LIBRARIES, function (data) {
				this.model.setProperty("/availableLibrariesSet", data.libNames);

				if (this.loadingFromLoadButton) {
					MessageToast.show("Libraries ruleset loaded");
					this.loadingFromLoadButton = false;
				}
			}, this);

			CommunicationBus.subscribe(channelNames.POST_AVAILABLE_COMPONENTS, function (data) {
				var executionScopeComponents = [],
					modelScopeComponents = this.model.getProperty("/executionScopeComponents"),
					savedComponents = storage.getSelectedScopeComponents(),
					index;

				for (var componentIndex = 0; componentIndex < data.length; componentIndex += 1) {
					executionScopeComponents.push({text: data[componentIndex]});
				}
				if (modelScopeComponents && modelScopeComponents.length > 0) {
					for (index = 0; index < executionScopeComponents.length; index++) {
						executionScopeComponents[index].selected = this.checkIfComponentIsSelected(executionScopeComponents[index], modelScopeComponents);
					}
				} else if (savedComponents && savedComponents.length > 0) {
					for (index = 0; index < executionScopeComponents.length; index++) {
						executionScopeComponents[index].selected = this.checkIfComponentIsSelected(executionScopeComponents[index], savedComponents);
					}
				}

				this.model.setProperty("/executionScopeComponents", executionScopeComponents);
			}, this);

			CommunicationBus.subscribe(channelNames.GET_RULES_MODEL, function (treeViewModelRules) {
				this.model.setProperty("/treeViewModel", treeViewModelRules);
			}, this);
		},
		/**
		 * Checks if given execution scope component is selected comparing against an array of settings
		 * @param {Object} component The current component object to be checked
		 * @param {Array} savedComponents The local storage settings for the checked execution scope components
		 * @returns {boolean} If the component is checked or not
		 */
		checkIfComponentIsSelected: function (component, savedComponents) {
			for (var index = 0; index < savedComponents.length; index += 1) {
				if (savedComponents[index].text == component.text && savedComponents[index].selected) {
					return true;
				}
			}
			return false;
		},

		onAnalyze: function () {
			var selectedRules = this._getSelectedRules(),
				executionContext = this._getExecutionContext();
			if (selectedRules.length > 0) {
				CommunicationBus.publish(channelNames.ON_ANALYZE_REQUEST, {
					selectedRules: selectedRules,
					executionContext: executionContext
				});
				this.model.setProperty("/showProgressIndicator", true);
			} else {
				MessageToast.show("Select some rules to be analyzed.");
			}
		},

		initSettingsPopover: function () {
			this._settingsPopover = sap.ui.xmlfragment("sap.ui.support.supportRules.ui.views.AnalyzeSettings", this);
			this._settingsPopover.setModel(SharedModel);
			this.getView().addDependent(this._oPopover);
		},

		_getExecutionContext: function () {
			var ctx = {
				type: this.model.getProperty("/analyzeContext/key")
			};

			// TODO: these "if"s can be consistently turned into switch with constants
			if (ctx.type === "subtree") {
				ctx.parentId = this.model.getProperty("/subtreeExecutionContextId");
			}

			if (ctx.type === "components") {
				var selectionContainer = sap.ui.getCore().byId("componentsSelectionContainer"),
					cbs = selectionContainer.getContent();

				ctx.components = [];
				cbs.forEach(function (checkBox) {
					if (checkBox.getSelected()) {
						ctx.components.push(checkBox.getText());
					}
				});
			}

			return ctx;
		},
		_getSelectedRules: function () {
			var	selectedRules = [],
			selectedIndices = this.treeTable.getSelectedIndices(),
			that = this;

			selectedIndices.forEach(function(index){
				if (that.treeTable.getContextByIndex(index).getObject().id) {
					selectedRules.push({
						libName: that.treeTable.getContextByIndex(index).getObject().libName,
						ruleId: that.treeTable.getContextByIndex(index).getObject().id
					});
				}
			});

			return selectedRules;
		},
		/**
		 * Keeps in sync the TreeViewModel for temporary library that we use for visualisation of sap.m.TreeTable and the model that we use in the Suppport Assistant
		 * @param {Object} tempLib  temporary library model from Support Assistant
		 * @param {Object} treeTable Model for sap.m.TreeTable visualization
		 */
		_syncTreeTableVieModelTempRulesLib: function (tempLib, treeTable) {
			var innerIndex = 0;
				for (var ruleIndex in tempLib.rules) {
					for (var i in treeTable) {
						if (treeTable[i].name === constants.TEMP_RULESETS_NAME) {
							treeTable[i][innerIndex] = {
								name: tempLib.rules[ruleIndex].title,
								description: tempLib.rules[ruleIndex].description,
								id: tempLib.rules[ruleIndex].id,
								audiences: tempLib.rules[ruleIndex].audiences,
								categories: tempLib.rules[ruleIndex].categories,
								minversion: tempLib.rules[ruleIndex].minversion,
								resolution: tempLib.rules[ruleIndex].resolution,
								title: tempLib.rules[ruleIndex].title,
								libName: treeTable[i].name,
								check: tempLib.rules[ruleIndex].check
							};

						}
					}
					innerIndex++;
				}
		},
		/**
		 * Keeps in sync the TreeViewModel for temporary rules that we use for visualisation of sap.m.TreeTable and the model that we use in the SuppportAssistant
		 * @param {Object} tempRule Temporary rule
		 * @param {Object} treeTable Model for sap.m.TreeTable visualization
		 */
		_syncTreeTableVieModelTempRule: function (tempRule, treeTable) {
				var ruleSource = this.model.getProperty("/editRuleSource");
				for (var i in treeTable) {
					if (treeTable[i].name === constants.TEMP_RULESETS_NAME) {
						for (var innerIndex in treeTable[i]) {
							if (treeTable[i][innerIndex].id === ruleSource.id) {
								treeTable[i][innerIndex] = {
									name: tempRule.title,
									description: tempRule.description,
									id: tempRule.id,
									audiences: tempRule.audiences,
									categories: tempRule.categories,
									minversion: tempRule.minversion,
									resolution: tempRule.resolution,
									title: tempRule.title,
									libName: treeTable[i].name,
									check: tempRule.check
								};
							}
						}
					}
				}
		},
		onAnalyzeSettings: function (oEvent) {
			CommunicationBus.publish(channelNames.GET_AVAILABLE_COMPONENTS);
			this._settingsPopover.openBy(oEvent.getSource());
		},
		onContextSelect: function (oEvent) {
			if (oEvent.getParameter("selected")) {
				var source = oEvent.getSource(),
					radioKey = source.getCustomData()[0].getValue(),
					execScope = this.model.getProperty("/executionScopes")[radioKey];
				this.model.setProperty("/analyzeContext", execScope);
			}

			if (this.cookie) {
				this.persistExecutionScope();
			}
		},

		onExecutionContextChange: function (event) {
			var value = event.getSource().getValue();

			if (value) {
				this.model.setProperty("/subtreeExecutionContextId", value);
			}

			if (this.cookie) {
				this.persistExecutionScope();
			}
		},

		persistExecutionScope: function () {
			var setting = {
				analyzeContext: this.model.getProperty("/analyzeContext"),
				subtreeExecutionContextId: this.model.getProperty("/subtreeExecutionContextId")
			};

			storage.setSelectedContext(setting);
		},

		onScopeComponentSelect: function (event) {
			var scopeComponents = this.model.getProperty("/executionScopeComponents");

			if (this.cookie) {
				storage.setSelectedScopeComponents(scopeComponents);
			}
		},
		onBeforePopoverOpen: function () {
			if (this.model.getProperty("/executionScopeComponents").length === 0) {
				CommunicationBus.publish(channelNames.GET_AVAILABLE_COMPONENTS);
			}
		},

		createNewRulePress: function (oEvent) {
			var emptyRule = this.model.getProperty("/newEmptyRule");
			this.model.setProperty("/selectedSetPreviewKey", "availableRules");
			this.model.setProperty("/newRule", jQuery.extend(true, {}, emptyRule));
			this.goToCreateRule();
		},
		goToRuleProperties: function () {
			var navCont = this.getView().byId("rulesNavContainer");
			navCont.to(this.getView().byId("rulesDisplayPage"), "show");
		},
		createRuleString: function (rule) {
			// FIXME
			// Need to return empty string when rule is undefined
			// it happens when tool is injected from outside
			if (!rule) {
				return '';
			}

			var str = "{\n",
				count = 0,
				keysLength = Object.keys(rule).length;

			for (var key in rule) {
				var value = rule[key];
				count++;
				str += "\t";
				str += key + ": ";
				if (key === "check") {
					str += value.split("\n").join("\n\t");
				} else {
					str += JSON.stringify(value);
				}

				//Don't add comma after last value
				if (count < keysLength) {
					str += ",";
				}

				str += "\n";
			}
			str += "}";
			return str;
		},
		updateRule: function () {
			var oldId = this.model.getProperty("/editRuleSource/id"),
				updateObj = this.model.getProperty("/editRule");

			if (this.checkFunctionString(updateObj.check)) {
				CommunicationBus.publish(channelNames.VERIFY_UPDATE_RULE, {
					oldId: oldId,
					updateObj: RuleSerializer.serialize(updateObj)
				});
			}
		},
		updatesupportRules: function (data) {
			data = RuleSerializer.deserialize(data);

			CommunicationBus.publish(channelNames.REQUEST_RULES_MODEL, data);

			var libraries = [],
				that = this,
				persistingSettings = this.model.getProperty("/persistingSettings");

			for (var i in data) {
				var rules = [],
					ruleSets = data[i].ruleset._mRules;

				for (var j in ruleSets) {
					var rule = ruleSets[j];
					rule.libName = i;
					rule.selected = true;
					rules.push(rule);

				}

				libraries.push({
					title: i,
					type: "library",
					rules: rules
				});
			}

			// Set first rule from first library if there is no temporary rules
			var firstSelectedRule;
			if (libraries[0].rules[0] ){
				firstSelectedRule = libraries[0].rules[0];
			} else {
				firstSelectedRule = libraries[1].rules[0];
			}

			that.placeTemporaryRulesetAtStart(libraries);
			that.model.setProperty("/selectedRuleStringify", "");
			that.model.setProperty("/selectedRule", firstSelectedRule);
			that.model.setProperty("/selectedRuleStringify", that.createRuleString(firstSelectedRule));
			that.model.setProperty("/libraries",  libraries);

			var tempRules = storage.getRules(),
				loadingFromAddiotnalRuleSets = that.model.getProperty("/loadingAdditionalRuleSets");
			if (tempRules && !loadingFromAddiotnalRuleSets && !this.tempRulesLoaded) {
				this.tempRulesLoaded = true;
				tempRules.forEach(function (tempRule) {
					CommunicationBus.publish(channelNames.VERIFY_CREATE_RULE, RuleSerializer.serialize(tempRule));
				});
			}
			//*This property is needed when we are loading additional rulesets and to not retriger ".VERIFY_CREATE_RULE"*/
			that.model.setProperty("/loadingAdditionalRuleSets", false);
			if (persistingSettings) {
				var selectedRules = storage.getSelectedRules();
				selectedRules.forEach(function(selectedIndex){
					that.treeTable.setSelectedIndex(selectedIndex);
				});

			} else {
				this.treeTable.selectAll();
			}


		},
		placeTemporaryRulesetAtStart: function (libraries) {
			for (var i = 0; i < libraries.length; i++) {
				var ruleSet = libraries[i];

				if (ruleSet.title === constants.TEMP_RULESETS_NAME) {
					var temp = ruleSet;
					libraries.splice(i, 1);
					libraries.unshift(temp);
					return;
				}
			}
		},
		addLinkToRule: function (event) {
			var tempLink = this.model.getProperty("/tempLink"),
				copy = jQuery.extend(true, {}, tempLink),
				action = event.getSource().getProperty("text"),
				rule = action === 'Add' ? "/newRule" : "/editRule",
				urlProperty = this.model.getProperty(rule + "/resolutionurls");

			if (urlProperty) {
				urlProperty.push(copy);
			} else {
				this.model.setProperty(rule + "/resolutionurls", "");
				urlProperty.push(copy);
			}

			this.model.checkUpdate(true, true);
		},
		goToCreateRule: function () {
			var navCont = this.getView().byId("rulesNavContainer");
			navCont.to(this.getView().byId("rulesCreatePage"), "show");
		},
		checkFunctionString: function (functionString) {
			try {
				/* eslint-disable no-eval */
				eval("var testAsignedVar = " + functionString);
				/* eslint-enable no-eval */
			} catch (err) {
				MessageToast.show("Your check function contains errors, and can't be evaluated:" + err);
				return false;
			}
			return true;
		},
		addNewRule: function () {
			var newRule = this.model.getProperty("/newRule");
			if (this.checkFunctionString(newRule.check)) {
				this.showRuleCreatedToast = true;
				CommunicationBus.publish(channelNames.VERIFY_CREATE_RULE, RuleSerializer.serialize(newRule));
			}
		},
		rulesToolbarITHSelect: function (oEvent) {
			if (oEvent.getParameter("key") === "jsonOutput") {
				var newRule = this.model.getProperty("/newRule"),
					stringifiedJson = this.createRuleString(newRule);
				this.model.setProperty("/newRuleStringified", stringifiedJson);
			}
		},
		rulesToolbarEditITHSelect: function (oEvent) {
			if (oEvent.getParameter("key") === "jsonOutput") {
				var newRule = this.model.getProperty("/editRule"),
					stringifiedJson = this.createRuleString(newRule);
				this.model.setProperty("/updateRuleStringified", stringifiedJson);
			}
		},
		loadMarkedSupportLibraries: function () {
			var list = this.getView().byId("availableLibrariesSet"),
				libNames = list.getSelectedItems().map(function (item) {
					return item.getTitle();
				});

			list.getItems().forEach(function (item) {
				item.setSelected(false);

			});

			if (libNames.length > 0) {
				this.loadingFromLoadButton = true;
				CommunicationBus.publish(channelNames.LOAD_RULESETS, {
					libNames: libNames
				});
				this.model.setProperty("/loadingAdditionalRuleSets", true);
			}
		},
		onCellClick: function(event){
			if (event.getParameter("rowBindingContext")) {
				var selection = event.getParameter("rowBindingContext").getObject(),
					selectedRule;

				if (selection.id) {
					selectedRule = this.getMainModelFromTreeViewModel(selection);
					var stringifiedJson = this.createRuleString(selectedRule);
					this.model.setProperty("/selectedRuleStringify", stringifiedJson);
				}
				this.model.setProperty("/selectedRule", selectedRule);
			}

		},
	getMainModelFromTreeViewModel: function(selectedRule) {

		var structeredRulesModel =  this.model.getProperty("/libraries"),
			mainModelRule = null;

		structeredRulesModel.forEach(function(lib, index){
				structeredRulesModel[index].rules.forEach(function(element){
					if (selectedRule.id === element.id) {
						mainModelRule = element;
					}
				});
		});

		return mainModelRule;
	},

	duplicateRule: function(event){
		var path =  event.getSource().getBindingContext().getPath(),
			sourceObject = this.getView().getModel().getProperty(path),
			selectedRule = this.getMainModelFromTreeViewModel(sourceObject),
			selectedRuleCopy = jQuery.extend(true, {}, selectedRule);

		this.model.setProperty("/newRule", selectedRuleCopy);
		this.model.checkUpdate(true, false);
		this.goToCreateRule();
	},

	editRule: function(event) {
		var path =  event.getSource().getBindingContext().getPath(),
			sourceObject = this.getView().getModel().getProperty(path),
			selectedRule = this.getMainModelFromTreeViewModel(sourceObject);

		this.model.setProperty("/editRuleSource", selectedRule);
		this.model.setProperty("/editRule", jQuery.extend(true, {}, selectedRule));
		this.model.checkUpdate(true, true);
		var navCont = this.getView().byId("rulesNavContainer");
		navCont.to(this.getView().byId("ruleUpdatePage"), "show");
	},
	deleteTemporaryRule: function(event) {
		var sourceObject = this.getObjectOnTreeRow(event),
			treeViewModel = this.model.getProperty("/treeViewModel"),
			mainModel = this.model.getProperty("/libraries"),
			rulesNotToBeDeleted = [];


		mainModel.forEach(function (lib, libIndex) {
			if (lib.title === constants.TEMP_RULESETS_NAME) {
				lib.rules.forEach(function (rule, ruleIndex) {
					if (rule.id === sourceObject.id) {
						lib.rules.splice(ruleIndex, 1);
						return;
					} else {
						rulesNotToBeDeleted.push(rule);
					}
				});
			}
		});

		for (var i in treeViewModel) {
			if (treeViewModel[i].name === constants.TEMP_RULESETS_NAME) {
				for (var innerIndex in treeViewModel[i]) {
					if (treeViewModel[i][innerIndex].id === sourceObject.id) {
						delete treeViewModel[i][innerIndex];
					}
				}
			}
		}
		this.model.setProperty("/treeViewModel", treeViewModel);
		storage.removeSelectedRules(rulesNotToBeDeleted);
	},
	/**
	* Gets rule from selected row
	* @param {Object} Event
	* @returns {Object} ISelected rule from row
	***/
	getObjectOnTreeRow: function(event) {
		var path =  event.getSource().getBindingContext().getPath(),
		 sourceObject = this.getView().getModel().getProperty(path),
		 libs = this.model.getProperty("/libraries");

		libs.forEach(function (lib, libIndex) {
			lib.rules.forEach(function (rule) {
				if (rule.id === sourceObject.id) {
					sourceObject.check = rule.check;
				}
			});
		});
		return sourceObject;
	}
	});
});
