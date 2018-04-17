/*!
 * ${copyright}
 */

sap.ui.define([
	"jquery.sap.global",
	"sap/ui/support/supportRules/ui/controllers/BaseController",
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
], function ($, BaseController, JSONModel, Panel, List, ListItemBase, StandardListItem, InputListItem, Button, Toolbar, ToolbarSpacer,
	Label, MessageToast, CommunicationBus, channelNames, SharedModel, RuleSerializer, constants, Ruleset, storage) {
	"use strict";


	return BaseController.extend("sap.ui.support.supportRules.ui.controllers.Analysis", {
		onInit: function () {
			this.model = SharedModel;
			this.setCommunicationSubscriptions();

			this.tempRulesLoaded = false;

			this.getView().setModel(this.model);
			this.treeTable = this.byId("ruleList");
			this.ruleSetView = this.byId("ruleSetsView");
			this.rulesViewContainer = this.byId("rulesNavContainer");

			this.bAdditionalViewLoaded = false;
			CommunicationBus.subscribe(channelNames.UPDATE_SUPPORT_RULES, function () {
				if (!this.bAdditionalViewLoaded) {
					CommunicationBus.publish(channelNames.RESIZE_FRAME, { bigger: true });

					this.bAdditionalViewLoaded = true;
					this.loadAdditionalUI();

				}
			}, this);

		},

		loadAdditionalUI: function () {
			this._ruleDetails = sap.ui.xmlfragment("sap.ui.support.supportRules.ui.views.RuleDetails", this);
			this.byId("rulesDisplayPage").addContentArea(this._ruleDetails);

			this._ruleCreateUpdatePages = sap.ui.xmlfragment("sap.ui.support.supportRules.ui.views.RuleUpdate", this);
			this._ruleCreateUpdatePages.forEach(function (rcuPage) {
				this.byId("rulesNavContainer").insertPage(rcuPage);
			}, this);
			this._updateRuleList();
		},

		onAfterRendering: function () {
			var fnThemeChangeHandler = function () {
				CommunicationBus.publish(channelNames.ON_INIT_ANALYSIS_CTRL);
				sap.ui.getCore().detachThemeChanged(fnThemeChangeHandler);
			};

			// If the theme is already applied themeChanged event won't be fired.
			// In IE11 the theme is already applied.
			if (sap.ui.getCore().isThemeApplied()) {
				CommunicationBus.publish(channelNames.ON_INIT_ANALYSIS_CTRL);
			} else {
				sap.ui.getCore().attachThemeChanged(fnThemeChangeHandler);
			}
		},

		onAsyncSwitch: function (oEvent) {
			var oSource = oEvent.getSource();

			if (oEvent.getParameter("selected")) {
				var bAsync = oSource.getCustomData()[0].getValue() === "true";
				var sRule = oSource.getProperty("groupName") === "asyncContext" ? "/newRule" : "/editRule";
				this.model.setProperty(sRule + "/async", bAsync);
				this._updateCheckFunction(sRule, bAsync);
			}
		},

		/**
		 * Add fnResolve to the check function when async is set to true otherwise removes it.
		 * @private
		 * @param {string} sRule the model path to edit or new rule
		 * @param {bAsync} bAsync the async property of the rule
		 */
		_updateCheckFunction: function (sRule, bAsync) {
			var sCheckFunction = this.model.getProperty(sRule + "/check");

			if (!sCheckFunction) {
				return;
			}

			// Check if a function is found
			var oMatch = sCheckFunction.match(/function[^(]*\(([^)]*)\)/);

			if (!oMatch) {
				return;
			}

			// Get the parameters of the function found and trim, then split by word.
			var aParams = oMatch[1].trim().split(/\W+/);
			// Add missing parameters to ensure the resolve function is passed on the correct position.
			aParams[0] = aParams[0] || "oIssueManager";
			aParams[1] = aParams[1] || "oCoreFacade";
			aParams[2] = aParams[2] || "oScope";

			// If async add a fnResolve to the template else remove it.
			if (bAsync) {
				aParams[3] = aParams[3] || "fnResolve";
			} else {
				aParams = aParams.slice(0, 3);
			}

			// Replace the current parameters with the new ones.
			var sNewCheckFunction = sCheckFunction.replace(/function[^(]*\(([^)]*)\)/, "function (" + aParams.join(", ") + ")");

			this.model.setProperty(sRule + "/check", sNewCheckFunction);
		},

		getTemporaryLib: function () {
			var libs = this.model.getProperty("/libraries");

			for (var i = 0; i < libs.length; i++) {
				if (libs[i].title == constants.TEMP_RULESETS_NAME) {
					return libs[i];
				}
			}
		},

		updateTreeViewTempRulesSelection: function (treeTableTempLibrary) {
			this.treeTable.expand(0);

			for (var ruleIndex in treeTableTempLibrary) {

				var iRuleIndex = Number.parseInt(ruleIndex, 10);

				if (!Number.isInteger(iRuleIndex)) {
					continue;
				}

				iRuleIndex++;

				var rule = treeTableTempLibrary[ruleIndex];

				if (rule.selected) {
					this.treeTable.addSelectionInterval(iRuleIndex, iRuleIndex);
				} else {
					this.treeTable.removeSelectionInterval(iRuleIndex, iRuleIndex);
				}
			}
		},

		setCommunicationSubscriptions: function () {
			CommunicationBus.subscribe(channelNames.UPDATE_SUPPORT_RULES, this.updatesupportRules, this);

			CommunicationBus.subscribe(channelNames.VERIFY_RULE_CREATE_RESULT, function (data) {
				var result = data.result,
					newRule = RuleSerializer.deserialize(data.newRule, true),
					tempLib = this.getTemporaryLib(),
					treeTable = this.model.getProperty('/treeViewModel'),
					treeTableTempLibrary;

				if (result == "success") {
					tempLib.rules.push(newRule);
					treeTableTempLibrary = this._syncTreeTableVieModelTempRulesLib(tempLib, treeTable);

					this._syncTreeTableVieModelTempRulesLib(tempLib, treeTable);
					if (this.model.getProperty("/persistingSettings")) {
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

					this.updateTreeViewTempRulesSelection(treeTableTempLibrary);
					this._updateRuleList();
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
					libraries.forEach(function (lib, libIndex) {
						if (lib.title === constants.TEMP_RULESETS_NAME) {
							lib.rules.forEach(function (rule, ruleIndex) {
								if (rule.id === ruleSource.id) {
									lib.rules[ruleIndex] = updateRule;

									if (that.model.getProperty("/persistingSettings")) {
										storage.setRules(lib.rules);
									}
								}
							});
							that._syncTreeTableVieModelTempRule(updateRule, treeTable);
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
				this.rulesViewContainer.setBusy(false);
			}, this);

			CommunicationBus.subscribe(channelNames.POST_AVAILABLE_COMPONENTS, function (data) {
				var executionScopeComponents = [],
					modelScopeComponents = this.model.getProperty("/executionScopeComponents"),
					savedComponents = storage.getSelectedScopeComponents(),
					index;

				for (var componentIndex = 0; componentIndex < data.length; componentIndex += 1) {
					executionScopeComponents.push({ text: data[componentIndex] });
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

			CommunicationBus.subscribe(channelNames.GET_RULES_MODEL, function (oTreeViewModelRules) {
				var bInitialLoading = this.model.getProperty("/initialRulesLoading");

				if (bInitialLoading) {
					this.model.setProperty("/initialRulesLoading", false);
					this.model.setProperty("/treeViewModel", oTreeViewModelRules);
					this.initializeSelection();
				} else {
					this._syncSelections(oTreeViewModelRules);
				}
			}, this);

			CommunicationBus.subscribe(channelNames.POST_MESSAGE, function (data) {
				MessageToast.show(data.message);
			}, this);

			CommunicationBus.subscribe(channelNames.ON_ANALYZE_STARTED, function (data) {
				this.model.setProperty("/showProgressIndicator", true);
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
			var aSelectedRules = this._getSelectedRules(),
				oExecutionContext = this._getExecutionContext();

			if (!aSelectedRules.length > 0) {
				MessageToast.show("Select some rules to be analyzed.");
				return;
			}
			if (oExecutionContext.type === "components" && oExecutionContext.components.length === 0) {
				MessageToast.show("Please select some components to be analyzed.");
				return;
			}

			CommunicationBus.publish(channelNames.ON_ANALYZE_REQUEST, {
				selectedRules: aSelectedRules,
				executionContext: oExecutionContext
			});
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

		/**
		 * On selecting "Additional RuleSet" tab, start loading Additional RuleSets by brute search.
		 * @param {Event} oEvent
		 */
		onSelectedRuleSets: function (oEvent) {
			if (oEvent.getParameter("selectedKey") === "additionalRulesets") {
				this.rulesViewContainer.setBusyIndicatorDelay(0);
				this.rulesViewContainer.setBusy(true);
				CommunicationBus.publish(channelNames.GET_NON_LOADED_RULE_SETS);
			}
		},

		_getSelectedRules: function () {
			var mRuleSets = this.getView().getModel().getProperty("/treeViewModel"),
				sRuleIndex,
				sLibraryIndex,
				oRule,
				aSelectedRules = [];

			for (sLibraryIndex in mRuleSets) {
				if (Number.isInteger(Number.parseInt(sLibraryIndex, 10))) {
					for (sRuleIndex in mRuleSets[sLibraryIndex]) {
						oRule = mRuleSets[sLibraryIndex][sRuleIndex];

						if (Number.isInteger(Number.parseInt(sRuleIndex, 10)) && oRule.selected) {
							aSelectedRules.push({
								libName: oRule.libName,
								ruleId: oRule.id
							});
						}
					}
				}
			}

			return aSelectedRules;
		},

		/**
		 * Keeps in sync the TreeViewModel for temporary library that we use for visualisation of sap.m.TreeTable and the model that we use in the Suppport Assistant
		 * @param {Object} tempLib  temporary library model from Support Assistant
		 * @param {Object} treeTable Model for sap.m.TreeTable visualization
		 */
		_syncTreeTableVieModelTempRulesLib: function (tempLib, treeTable) {
			var innerIndex = 0,
				library,
				rule;

			for (var i in treeTable) {

				library = treeTable[i];

				if (library.name !== constants.TEMP_RULESETS_NAME) {
					continue;
				}

				for (var ruleIndex in tempLib.rules) {

					rule = tempLib.rules[ruleIndex];

					library[innerIndex] = {
						name: rule.title,
						description: rule.description,
						id: rule.id,
						audiences: rule.audiences,
						categories: rule.categories,
						minversion: rule.minversion,
						resolution: rule.resolution,
						title: rule.title,
						selected: library[innerIndex] !== undefined ? library[innerIndex].selected : library.selected,
						libName: library.name,
						check: rule.check
					};

					innerIndex++;
				}

				return library;
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
								selected: tempRule.selected,
								title: tempRule.title,
								libName: treeTable[i].name,
								check: tempRule.check
							};
						}
					}
				}
			}
		},

		_hasSelectedComponent: function () {
			var aAllComponentElements = sap.ui.getCore().byId("componentsSelectionContainer").getContent();
			function isSelected(oComponent) {
				return oComponent.getSelected();
			}

			return aAllComponentElements.some(isSelected);
		},

		onAnalyzeSettings: function (oEvent) {
			CommunicationBus.publish(channelNames.GET_AVAILABLE_COMPONENTS);

			if (!this._settingsPopover) {
				this._settingsPopover = sap.ui.xmlfragment("sap.ui.support.supportRules.ui.views.AnalyzeSettings", this);
				this.getView().addDependent(this._settingsPopover);
			}

			this._settingsPopover.openBy(oEvent.getSource());
		},

		onContextSelect: function (oEvent) {
			if (oEvent.getParameter("selected")) {
				var source = oEvent.getSource(),
					radioKey = source.getCustomData()[0].getValue(),
					execScope = this.model.getProperty("/executionScopes")[radioKey];
				if (radioKey === "components" && !this._hasSelectedComponent()) {
					var aComponents = sap.ui.getCore().byId("componentsSelectionContainer").getContent();
					if (aComponents.length > 0) {
						aComponents[0].setSelected(true);
						this.onScopeComponentSelect(null);
					}
				}
				this.model.setProperty("/analyzeContext", execScope);
			}

			if (storage.readPersistenceCookie(constants.COOKIE_NAME)) {
				this.persistExecutionScope();
			}
		},

		onExecutionContextChange: function (event) {
			var value = event.getSource().getValue();

			if (value) {
				this.model.setProperty("/subtreeExecutionContextId", value);
			}

			if (storage.readPersistenceCookie(constants.COOKIE_NAME)) {
				this.persistExecutionScope();
			}
		},

		onScopeComponentSelect: function (event) {
			var scopeComponents = this.model.getProperty("/executionScopeComponents");
			if (storage.readPersistenceCookie(constants.COOKIE_NAME)) {
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
			this.model.setProperty("/tempLink", { href: "", text: "" });
			this.goToCreateRule();
		},

		goToRuleProperties: function () {
			var navCont = this.byId("rulesNavContainer");
			navCont.to(this.byId("rulesDisplayPage"), "show");
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
				that = this;

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
			if (libraries[0].rules[0]) {
				firstSelectedRule = libraries[0].rules[0];
			} else {
				firstSelectedRule = libraries[1].rules[0];
			}

			that.placeTemporaryRulesetAtStart(libraries);
			that.model.setProperty("/selectedRuleStringify", "");
			that.model.setProperty("/selectedRule", firstSelectedRule);
			that.model.setProperty("/selectedRuleStringify", that.createRuleString(firstSelectedRule));
			that.model.setProperty("/libraries", libraries);

			var tempRules = storage.getRules(),
				loadingFromAdditionalRuleSets = that.model.getProperty("/loadingAdditionalRuleSets");

			if (loadingFromAdditionalRuleSets) {
				MessageToast.show("Additional rule set(s) loaded!");
				this.ruleSetView.setSelectedKey("availableRules");
			}
			if (tempRules && !loadingFromAdditionalRuleSets && !this.tempRulesLoaded) {
				this.tempRulesLoaded = true;
				tempRules.forEach(function (tempRule) {
					CommunicationBus.publish(channelNames.VERIFY_CREATE_RULE, RuleSerializer.serialize(tempRule));
				});
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

			this.model.setProperty("/tempLink", { href: "", text: "" });

			this.model.checkUpdate(true, true);
		},

		goToCreateRule: function () {
			var navCont = this.byId("rulesNavContainer");
			navCont.to(sap.ui.getCore().byId("rulesCreatePage"), "show");
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
			var list = this.byId("availableLibrariesSet"),
				aLibNames = list.getSelectedItems().map(function (item) {
					return item.getTitle();
				});

			list.getItems().forEach(function (item) {
				item.setSelected(false);

			});

			if (aLibNames.length > 0) {
				CommunicationBus.publish(channelNames.LOAD_RULESETS, {
					aLibNames: { publicRules: aLibNames, internalRules: aLibNames }
				});
				this.model.setProperty("/loadingAdditionalRuleSets", true);
			} else {
				MessageToast.show("Select additional RuleSet to be loaded.");
			}
		},

		onCellClick: function (event) {
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
		getMainModelFromTreeViewModel: function (selectedRule) {

			var structeredRulesModel = this.model.getProperty("/libraries"),
				mainModelRule = null;

			structeredRulesModel.forEach(function (lib, index) {
				structeredRulesModel[index].rules.forEach(function (element) {
					if (selectedRule.id === element.id) {
						mainModelRule = element;
					}
				});
			});

			return mainModelRule;
		},

		duplicateRule: function (event) {
			var path = event.getSource().getBindingContext().getPath(),
				sourceObject = this.getView().getModel().getProperty(path),
				selectedRule = this.getMainModelFromTreeViewModel(sourceObject),
				selectedRuleCopy = jQuery.extend(true, {}, selectedRule);

			this.model.setProperty("/newRule", selectedRuleCopy);
			this.model.checkUpdate(true, false);
			this.goToCreateRule();
		},

		editRule: function (event) {
			var path = event.getSource().getBindingContext().getPath(),
				sourceObject = this.getView().getModel().getProperty(path),
				selectedRule = this.getMainModelFromTreeViewModel(sourceObject);

			this.model.setProperty("/editRuleSource", selectedRule);
			this.model.setProperty("/editRule", jQuery.extend(true, {}, selectedRule));
			this.model.checkUpdate(true, true);
			var navCont = this.byId("rulesNavContainer");
			navCont.to(sap.ui.getCore().byId("ruleUpdatePage"), "show");
		},
		deleteTemporaryRule: function (event) {
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

			this._updateRuleList();
		},

		/**
		* Gets rule from selected row
		* @param {Object} Event
		* @returns {Object} ISelected rule from row
		***/
		getObjectOnTreeRow: function (event) {
			var path = event.getSource().getBindingContext().getPath(),
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
		},

		onToggleOpenState: function (oEvent) {
			var iIndex = oEvent.getParameter("rowIndex"),
				oRowContext = oEvent.getParameter("rowContext"),
				bExpanded = oEvent.getParameter("expanded"),
				oTreeTable = this.treeTable,
				aRows = oTreeTable.getRows(),
				iVisualIndex = this.getVisualIndex(oRowContext),
				oRow = aRows[iVisualIndex],
				oRowModel = oRow.getModel(),
				oBindingContext = oRow.getBindingContext(),
				sPath = oBindingContext.getPath(),
				mRules = oRowModel.getProperty(sPath),
				sKey,
				bSelected,
				iRuleIndex = iIndex + 1;

			if (!bExpanded) {
				return;
			}

			for (sKey in mRules) {
				if (Number.isInteger(Number.parseInt(sKey, 10))) {
					bSelected = oRowModel.getProperty(sPath + "/" + sKey + "/selected");

					if (bSelected) {
						oTreeTable.addSelectionInterval(iRuleIndex, iRuleIndex);
					} else {
						oTreeTable.removeSelectionInterval(iRuleIndex, iRuleIndex);
					}

					iRuleIndex++;
				}
			}
		},

		onRowSelectionChange: function (oEvent) {
			var iIndex = oEvent.getParameter("rowIndex"),
				oRowContext = oEvent.getParameter("rowContext"),
				aRowIndices = oEvent.getParameter("rowIndices"),
				bUserInteraction = oEvent.getParameter("userInteraction");

			if (oEvent.getParameter("selectAll")) {
				this.selectAllRows(true);
				return;
			}

			if (iIndex === -1) {
				this.selectAllRows(false);
				return;
			}

			if (!bUserInteraction ||
				aRowIndices.length != 1 ||
				aRowIndices[0] != iIndex) {
				return;
			}

			var oTreeTable = this.treeTable,
				aRows = oTreeTable.getRows(),
				iVisualIndex = this.getVisualIndex(oRowContext),
				oRow = aRows[iVisualIndex],
				oRowModel = oRow.getModel(),
				oBindingContext = oRow.getBindingContext(),
				sPath = oBindingContext.getPath(),
				mRules = oRowModel.getProperty(sPath),
				bSelected = !oRowModel.getProperty(sPath + "/selected"),
				oChildIndicesRange,
				sKey;

			oRowModel.setProperty(sPath + "/selected", bSelected);

			if (this.isRowAGroup(oRow)) {
				oChildIndicesRange = this.getChildIndicesRange(oRow, iIndex);

				if (!oChildIndicesRange) {
					return;
				}

				for (sKey in mRules) {
					if (Number.isInteger(Number.parseInt(sKey, 10))) {
						oRowModel.setProperty(sPath + "/" + sKey + "/selected", bSelected);
					}
				}

				if (oTreeTable.isExpanded(iIndex)) {
					if (bSelected) {
						oTreeTable.addSelectionInterval(oChildIndicesRange.from, oChildIndicesRange.to);
					} else {
						oTreeTable.removeSelectionInterval(oChildIndicesRange.from, oChildIndicesRange.to);
					}
				}
			} else {
				this.updateLibrarySelection(sPath, bSelected);
			}

			if (storage.readPersistenceCookie(constants.COOKIE_NAME)) {
				this.persistSelection();
			}
		},

		/**
		 * @param {Object} oRow the row to check
		 * @returns {boolean} true if the row is a library
		 */
		isRowAGroup: function (oRow) {
			if (!oRow) {
				return false;
			}

			var oRowModel = oRow.getModel();

			if (!oRowModel) {
				return false;
			}

			var	oBindingContext = oRow.getBindingContext(),
				sPath = oBindingContext.getPath();

			return oRowModel.getProperty(sPath + "/rules") !== undefined;
		},

		/**
		 * Calculates the indices of the child nodes of the library row.
		 *
		 * @param {Object} oRow from which the rules will be taken
		 * @param {int} iRowIndex the index of the library row
		 * @returns {Object} a range to be used for selection
		 */
		getChildIndicesRange: function (oRow, iRowIndex) {
			var oRowModel = oRow.getModel(),
				oBindingContext = oRow.getBindingContext(),
				sPath = oBindingContext.getPath(),
				mRules = oRowModel.getProperty(sPath),
				iFrom = iRowIndex + 1,
				iTo = iRowIndex,
				sKey;

			for (sKey in mRules) {
				if (Number.isInteger(Number.parseInt(sKey, 10))) {
					iTo++;
				}
			}

			if (iFrom > iTo ) {
				return;
			}

			return {
				from: iFrom,
				to: iTo
			};
		},

		/**
		 * Finds the visual index of the rowContext.
		 *
		 * @param {Object} oRowContext the rowContext to check
		 * @returns {int} the visible index of the row
		 */
		getVisualIndex: function (oRowContext) {
			var aRows = this.treeTable.getRows(),
				oRow,
				i;

			for (i = 0; i < aRows.length; i++) {
				oRow = aRows[i];

				if (oRow.getBindingContext() == oRowContext) {
					return i;
				}
			}
		},

		/**
		 * Finds the index of the row, which matches a specific path.
		 *
		 * @param {Object} oRowContext the rowContext to check
		 * @returns {int} the index of the row, which matches the path
		 */
		getRowContextIndexByPath: function (sPath) {
			var iRowIndex = 0,
				oRowContext = this.treeTable.getContextByIndex(iRowIndex);

			while (oRowContext) {
				if (oRowContext.getPath() == sPath) {
					return iRowIndex;
				}
				iRowIndex++;
				oRowContext = this.treeTable.getContextByIndex(iRowIndex);
			}
		},

		/**
		 * Creates the initial selection of the TreeTable rows.
		 */
		initializeSelection: function () {
			var bPersistingSettings = this.model.getProperty("/persistingSettings"),
				oModel = this.getView().getModel(),
				mIndex = {},
				mLibrariesToUpdate = [],
				aSelectedRules;

			if (bPersistingSettings) {
				aSelectedRules = storage.getSelectedRules() || [];

				if (aSelectedRules.length === 0) {
					return;
				}

				mIndex = this._buildTreeTableIndex();

				aSelectedRules.forEach(function (oRuleDescriptor) {
					var oRuleInfo = mIndex[oRuleDescriptor.ruleId];

					if (oRuleInfo) {
						oModel.setProperty(oRuleInfo.path + "/selected", true);

						this.treeTable.addSelectionInterval(oRuleInfo.index, oRuleInfo.index);

						if (mIndex[oRuleInfo.libName]) {
							mLibrariesToUpdate[oRuleInfo.libName] = mIndex[oRuleInfo.libName];
						}
					}
				}, this);

				// Only update the libraries which have selected rules.
				this.updateLibrariesSelection(mLibrariesToUpdate);
			} else {
				this.treeTable.selectAll();
			}
		},

		/**
		 * Selects/Deselects all rules and libraries in the model and stores the selection.
		 *
		 * @param {boolean} bSelectAll
		 */
		selectAllRows: function (bSelectAll) {
			var oModel = this.getView().getModel(),
				oTreeViewModel = oModel.getProperty("/treeViewModel/"),
				oLibrary;

			// Set selected flag for each library node in the TreeTable
			for (var i in oTreeViewModel) {
				if (Number.isInteger(Number.parseInt(i, 10))) {
					oModel.setProperty("/treeViewModel/" + i + "/selected", bSelectAll);
					oLibrary = oModel.getProperty("/treeViewModel/" + i);

					// Set selected flag for each rule node in the TreeTable
					for (var k in oLibrary) {
						if (Number.isInteger(Number.parseInt(k, 10))) {
							oModel.setProperty("/treeViewModel/" + i + "/" + k + "/selected", bSelectAll);
						}
					}
				}
			}

			if (storage.readPersistenceCookie(constants.COOKIE_NAME)) {
				this.persistSelection();
			}
		},

		/**
		 * From the rule row index search for the library in the list.
		 * After it finds the correct library it selects/deselects it and update the model.
		 *
		 * @param {int} sPath The row index of the selected rule
		 * @param {boolean} bSelected If the rule row was selected or deselected
		 */
		updateLibrarySelection: function (sPath, bSelected) {
			var oModel = this.getView().getModel(),
				iRowIndex = this.getRowContextIndexByPath(sPath),
				oLibrary,
				rowContext;

			// Find the library object and index from the selected rule index
			while (iRowIndex >= 0) {
				rowContext = this.treeTable.getContextByIndex(iRowIndex);
				sPath = rowContext.getPath();
				oLibrary = oModel.getProperty(sPath);

				if (oLibrary.type === "lib") {
					break;
				}

				iRowIndex--;
			}

			// Select / Deselect the library row
			if (bSelected) {
				for (var i in oLibrary) {
					if (Number.isInteger(Number.parseInt(i, 10)) && !oLibrary[i].selected) {
						return;
					}
				}

				this.treeTable.addSelectionInterval(iRowIndex, iRowIndex);
			} else {
				this.treeTable.removeSelectionInterval(iRowIndex, iRowIndex);
			}

			oModel.setProperty(sPath + "/selected", bSelected);
		},

		/**
		 * For every passed library check if it's rules are selected. If they are, select the row of the library.
		 *
		 * @param {Object} mLibrariesToUpdate A map with the libraries which row selection should be checked
		 */
		updateLibrariesSelection: function (mLibrariesToUpdate) {
			var oModel = this.getView().getModel(),
				oLibrary,
				bLibrarySelected;

			for (var sLibName in mLibrariesToUpdate) {
				oLibrary = oModel.getProperty(mLibrariesToUpdate[sLibName].path);
				bLibrarySelected  = true;

				for (var i in oLibrary) {
					if (Number.isInteger(Number.parseInt(i, 10))) {
						if (!oLibrary[i].selected) {
							bLibrarySelected = false;
							break;
						}
					}
				}

				this.updateLibrarySelection(mLibrariesToUpdate[sLibName].path, bLibrarySelected);
			}
		},

		/**
		 *
		 * Apply "selected" flags to the libraries and rules of the new tree table view model by using the old one.
		 *
		 * @param {Object} oNewTreeModel The new tree table view model which needs to be updated with the "selected" flags
		 * @returns {Object} The new model with "selected" flags
		 */
		_syncSelections: function (oNewTreeModel) {
			// Build an index based on the old TreeViewModel
			var mIndex = this._buildTreeTableIndex(),
				aLibrariesToUpdate = [],
				mLibrariesToUpdate = {},
				mNewIndex;

			// Update the "selected" flag of the new model based on the old one.
			for (var i in oNewTreeModel) {
				if (Number.isInteger(Number.parseInt(i, 10))) {
					for (var k in oNewTreeModel[i]) {
						var oRule = mIndex[oNewTreeModel[i][k].id];

						if (Number.isInteger(Number.parseInt(k, 10)) && oRule && oRule.selected) {
							oNewTreeModel[i][k].selected = oRule.selected;

							if (aLibrariesToUpdate.indexOf(oNewTreeModel[i][k].libName) < 0) {
								aLibrariesToUpdate.push(oNewTreeModel[i][k].libName);
							}
						}
					}
				}
			}

			this.model.setProperty("/treeViewModel", oNewTreeModel);

			// Build an index based on the new TreeViewModel
			mNewIndex = this._buildTreeTableIndex();

			aLibrariesToUpdate.forEach(function (sLibName) {
				if (mNewIndex[sLibName]) {
					mLibrariesToUpdate[sLibName] = mNewIndex[sLibName];
				}
			});

			// Check for newly loaded libraries and add them to the map for selection update.
			for (var sKey in mNewIndex) {
				if (mNewIndex[sKey].type === "lib" && !mIndex[sKey]) {
					mLibrariesToUpdate[sKey] = mNewIndex[sKey];
				}
			}

			this.updateLibrariesSelection(mLibrariesToUpdate);
		},

		/**
		 *
		 * Create a map which returns all rows of the tree table from the binding.
		 *
		 * @returns {Object} All rows of the TreeTable
		 */
		_buildTreeTableIndex: function () {
			var iIndex = 0,
				sPath = this.treeTable.getBinding().getPath() + '/',
				oModel = this.getView().getModel(),
				mIndex = {},
				oLibContext = oModel.getProperty(sPath + iIndex),
				iSubIndex = 0,
				iGlobalIndex = 0,
				oRuleContext;

			// As the binding of the TreeTable has no API for all rows or all rows indices
			// (getRows returns the visible rows only) we have to discover them in the binding
			// and make an index map for better performance.
			while (oLibContext) {

				mIndex[oLibContext.name] = {
					index: iGlobalIndex,
					path: sPath + iIndex,
					libName: oLibContext.name,
					type: "lib",
					selected: oLibContext.selected
				};

				iGlobalIndex++;

				oRuleContext = oModel.getProperty(sPath + iIndex + '/' + iSubIndex);

				while  (oRuleContext) {

					mIndex[oRuleContext.id] = {
						index: iGlobalIndex,
						path: sPath + iIndex + '/' + iSubIndex,
						libName: oRuleContext.libName,
						type: "rule",
						selected: oRuleContext.selected
					};

					iSubIndex++;
					iGlobalIndex++;
					oRuleContext = oModel.getProperty(sPath + iIndex + '/' + iSubIndex);
				}

				iIndex++;
				oLibContext = oModel.getProperty(sPath + iIndex);
			}

			return mIndex;
		},

		_updateRuleList: function() {
			var oRuleList = this.getView().byId("ruleList"),
				aTemplibs = this.getTemporaryLib()["rules"];
			if (!aTemplibs.length) {
				oRuleList.setRowActionCount(1);
			}  else {
				oRuleList.setRowActionCount(2);
			}
		}

	});
});
