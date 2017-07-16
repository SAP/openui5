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

			this.hackListItemBase();
			this.getView().setModel(this.model);
		},

		getTemporaryLib: function() {
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
					persistingSettings = this.model.getProperty("/persistingSettings"),
					tempLib = this.getTemporaryLib();
				if (result == "success") {
					tempLib.rules.push(newRule);
					if (persistingSettings) {
						storage.setRules(tempLib.rules);
						if (this.showRuleCreatedToast) {
							MessageToast.show('Your temporary rule "' + newRule.id + '" was persisted in the local storage');
							this.showRuleCreatedToast = false;
						}
					}

					var emptyRule = this.model.getProperty("/newEmptyRule");
					this.model.setProperty("/newRule", jQuery.extend(true, {}, emptyRule));
					this.goToRuleProperties();
					this.createRulesUI();
					this.model.setProperty("/selectedRule", newRule);
					var panel = this.getView().byId("ruleSetContainer").getContent()[0];
					panel.setExpanded(true);
				} else {
					MessageToast.show("Add rule failed because: " + result);
				}
			}, this);

			CommunicationBus.subscribe(channelNames.VERIFY_RULE_UPDATE_RESULT, function (data) {
				var result = data.result,
					updateRule = RuleSerializer.deserialize(data.updateRule, true);

				if (result === "success") {
					var ruleSource = this.model.getProperty("/editRuleSource");
					var libraries = this.model.getProperty('/libraries');
					libraries.forEach(function(lib, libIndex){
						if (lib.title === constants.TEMP_RULESETS_NAME) {
							lib.rules.forEach(function(rule, ruleIndex){
								if (rule.id === ruleSource.id) {
									lib.rules[ruleIndex] = updateRule;
									storage.setRules(lib.rules);
								}
							});
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
		},
		/**
		 * Checks if given execution scope component is selected comparing against an array of settings
		 * @param {Object} component The current component object to be checked
		 * @param {Array} savedComponents The local storage settings for the checked execution scope components
		 * @returns {boolean} If the component is checked or not
		 */
		checkIfComponentIsSelected: function(component, savedComponents) {
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
			// if (selectedRules.length > 0) {
			CommunicationBus.publish(channelNames.ON_ANALYZE_REQUEST, {
				selectedRules: selectedRules,
				executionContext: executionContext
			});
				this.model.setProperty("/showProgressIndicator", true);

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
			var libs = this.model.getProperty("/libraries"),
				selectedRules = [];

			// When tool is inject from outside libraries is empty
			// TODO: fix libraries to be there if possible
			if (Array.isArray(libs)) {
				libs.forEach(function (lib, libIndex) {
					lib.rules.forEach(function (rule) {
						if (rule.selected) {
							selectedRules.push({
								libName: lib.title,
								ruleId: rule.id
							});
						}
					});
				});
			}

			return selectedRules;
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
			var cookie =  storage.readPersistenceCookie(constants.COOKIE_NAME);
			if (cookie) {
				this.persistExecutionScope();
			}
		},

		onExecutionContextChange: function (event) {
			var value = event.getSource().getValue();

			if (value) {
				this.model.setProperty("/subtreeExecutionContextId", value);
			}

			var cookie =  storage.readPersistenceCookie(constants.COOKIE_NAME);
			if (cookie) {
				this.persistExecutionScope();
			}
		},

		persistExecutionScope: function() {
			var setting = {
				analyzeContext: this.model.getProperty("/analyzeContext"),
				subtreeExecutionContextId: this.model.getProperty("/subtreeExecutionContextId")
			};

			storage.setSelectedContext(setting);
		},

		onScopeComponentSelect: function (event) {
			var scopeComponents = this.model.getProperty("/executionScopeComponents"),
				cookie =  storage.readPersistenceCookie(constants.COOKIE_NAME);

			if (cookie) {
				storage.setSelectedScopeComponents(scopeComponents);
			}
		},
		onBeforePopoverOpen: function () {
			if (this.model.getProperty("/executionScopeComponents").length === 0) {
				CommunicationBus.publish(channelNames.GET_AVAILABLE_COMPONENTS);
			}
		},

		createNewRulePress: function(oEvent) {

				var emptyRule = this.model.getProperty("/newEmptyRule");
				this.model.setProperty("/selectedSetPreviewKey", "availableRules");
				this.model.setProperty("/newRule", jQuery.extend(true, {}, emptyRule));
				this.goToCreateRule();
		},
		goToRuleProperties: function () {
			var navCont = this.getView().byId("rulesNavContainer");
			navCont.to(this.getView().byId("rulesDisplayPage"), "show");
		},
		/**
		 * Here we need a new behavior for the sap.m.List - we need to be able to both click on the checkbox,
		 * and click on the whole list item, and those 2 clicks to be separate from each other (with separate
		 * event handlers)
		 * In our case 1 list is the rules for 1 library, we have more than one list, and we need the select
		 * state to also be shared between 2 or more lists (visualy).
		 * Could be implemented with extension control of the list item, but because we are in iframe this is also fine.
		 */
		hackListItemBase: function () {
			var that = this,
				oldTap = ListItemBase.prototype.ontap,
				oldUpdateSelectedDom = ListItemBase.prototype.updateSelectedDOM,
				oldAfterRendering = ListItemBase.prototype.onAfterRendering;

			var isRulesList = function (list) {
				var customData = list.getCustomData();
				if (!customData || customData.length == 0) {
					return false;
				}

				var result = false;
				customData.forEach(function (data) {
					if (data.getKey() === "rulesList") {
						result = true;
					}
				});

				return result;
			};

			ListItemBase.prototype.onAfterRendering = function () {
				oldAfterRendering.apply(this, arguments);
				if (isRulesList(this.getParent())) {
					this.$().removeClass("sapMLIBSelected");
				}
			};

			ListItemBase.prototype.ontap = function (oEvent) {
				if (!isRulesList(this.getParent())) {
					oldTap.call(this, oEvent);
					return;
				}
				if ($(oEvent.target).hasClass("sapMCbBg") || $(oEvent.target).hasClass("sapMCb")) {
					oldTap.call(this, oEvent);
				} else {
					that.model.setProperty("/selectedRuleStringify", "");
					that.markLIBAsSelected(this);

					var selectedRule = this.getBindingContext().getObject();
					that.model.setProperty("/selectedRule", selectedRule);
					that.model.setProperty("/selectedRuleStringify", that.createRuleString(selectedRule));
				}

				Ruleset.storeSelectionOfRules(that.model.getProperty("/libraries"));
			};

			ListItemBase.prototype.updateSelectedDOM = function(bSelected, $This) {
				oldUpdateSelectedDom.call(this, bSelected, $This);
				if (isRulesList(this.getParent())) {
					$This.removeClass("sapMLIBSelected");
				}
			};
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
		markLIBAsSelected: function (listItemBase) {
			if (!listItemBase) {
				var selectedRuleTitle = this.model.getProperty("/selectedRule/title");
				this.getView().byId("ruleSetContainer").getContent().forEach(function (libPanel) {
					libPanel.getContent()[0].getItems().forEach(function (libItem) {
						if (libItem.getLabel() === selectedRuleTitle) {
							listItemBase = libItem;
						}
					});
				});
			} else {
				this.getView().$().find(".sapMLIB").removeClass("sapMLIBSelected");
				listItemBase.$().addClass("sapMLIBSelected");
			}
		},
		onAfterNavigate: function (oEvent) {
			var to = oEvent.getParameter("to"),
				that = this;

			if (to === this.getView().byId("rulesDisplayPage")) {
				setTimeout(function () {
					that.markLIBAsSelected();
				}, 250);
			}
		},
		selectAll: function () {
			var that = this;
			this.visitAllRules(function (rule, ruleIndex, libIndex) {
					that.model.setProperty("/libraries/" + libIndex + "/rules/" + ruleIndex + "/selected", true);
			});
			Ruleset.storeSelectionOfRules(this.model.getProperty("/libraries"));
		},
		deselectAll: function () {
			var that = this;
			that.visitAllRules(function (rule, ruleIndex, libIndex) {
					that.model.setProperty("/libraries/" + libIndex + "/rules/" + ruleIndex + "/selected", false);
			});
			Ruleset.storeSelectionOfRules(this.model.getProperty("/libraries"));
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

			var firstSelectedRule = libraries[0].rules[0];
			that.placeTemporaryRulesetAtStart(libraries);
			that.model.setProperty("/selectedRuleStringify", "");
			that.model.setProperty("/selectedRule", firstSelectedRule);
			that.model.setProperty("/selectedRuleStringify", that.createRuleString(firstSelectedRule));
			that.model.setProperty("/libraries", libraries);

			var tempRules = storage.getRules(),
				loadingFromAddiotnalRuleSets = that.model.getProperty("/loadingAdditionalRuleSets");
			if (tempRules && !loadingFromAddiotnalRuleSets && !this.tempRulesLoaded) {
				this.tempRulesLoaded = true;
				tempRules.forEach(function (tempRule) {
					CommunicationBus.publish(channelNames.VERIFY_CREATE_RULE, RuleSerializer.serialize(tempRule));
				});
			}
			//*This property is neede when we are loading additional rulesets and to not retriger ".VERIFY_CREATE_RULE"*/
			that.model.setProperty("/loadingAdditionalRuleSets", false);

			Ruleset.loadSelectionOfRules(that.model.getProperty("/libraries"));
			that.createRulesUI();
			var panel = that.getView().byId("ruleSetContainer").getContent()[0];
			panel.setExpanded(true);
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
		createRulesUI: function () {
			var libs = this.model.getProperty("/libraries"),
				rulesCount = 0,
				that = this,
				vlContainer = this.getView().byId("ruleSetContainer");
			that.model.setProperty("/selectedRule", that.model.getProperty("/libraries/1/rules/1"));

			vlContainer.getContent().forEach(function (content, contentIndex) {
				vlContainer.removeContent(content);
			});

			libs.forEach(function (lib, libIndex) {

				var ruleListContent = that._creatingContentForRulesList(lib, libIndex, that);

				var rulesList = new List({
					mode : "MultiSelect",
					includeItemInSelection: true,
					items: {
						path: "/libraries/" + libIndex + "/rules",
						template: new InputListItem({
							label: "{title}",
							selected: "{selected}",
							content: ruleListContent
						})
					}
				});
				rulesList.data("rulesList", true);

				if (lib.rules.length === undefined) {
					rulesCount = 1;
				} else {
					rulesCount = lib.rules.length;
				}

				var libPanel = new Panel({
					width: "100%",
					expandable: true,
					expanded: false,
					content: rulesList,
					headerToolbar: new Toolbar({
						content: [
							new Label({
								text: lib.title + " (" + rulesCount + ")"
							})
						]
					})
				});

				vlContainer.addContent(libPanel);
			});

		},
		addLinkToNewRule: function () {
			var tempLink = this.model.getProperty("/tempLink"),
				copy = jQuery.extend(true, {}, tempLink);
			this.model.getProperty("/newRule/resolutionurls").push(copy);
			this.model.checkUpdate(true, true);
		},
		addLinkToEditRule: function () {
			var tempLink = this.model.getProperty("/tempLink"),
				copy = jQuery.extend(true, {}, tempLink);
			this.model.getProperty("/editRule/resolutionurls").push(copy);
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
		visitAllRules: function (callback) {
			var libs = this.model.getProperty("/libraries");
			libs.forEach(function (lib, libIndex) {
				lib.rules.forEach(function (rule, ruleIndex) {
					callback(rule, ruleIndex, libIndex);
				});
			});
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

		_creatingContentForRulesList: function(lib, libIndex, that) {
			var tempRulesButtons = [new sap.m.Button({
				icon:"sap-icon://edit",
				press: function (oEvent) {
					var sourceObject = this.getParent().getBindingContext().getObject();
					that.model.setProperty("/editRuleSource", sourceObject);
					that.model.setProperty("/editRule", jQuery.extend(true, {}, sourceObject));
					that.model.checkUpdate(true, true);
					var navCont = that.getView().byId("rulesNavContainer");
					navCont.to(that.getView().byId("ruleUpdatePage"), "show");
				}
			}),  new sap.m.Button({
				icon:"sap-icon://delete",
				press: function (oEvent) {

					var sourceObject = this.getParent().getBindingContext().getObject(),
						ruleSetWithDeletedRules = [];

					for (var i = 0; i < lib.rules.length; i++) {

						if (lib.rules[i].id !== sourceObject.id) {
							ruleSetWithDeletedRules.push(lib.rules[i]);
						}
					}
					that.model.setProperty("/libraries/0/rules", ruleSetWithDeletedRules);
					storage.removeSelectedRules(ruleSetWithDeletedRules);
					that.createRulesUI();
					var firstPanelItem = that.getView().byId("ruleSetContainer").getContent()[0];
					firstPanelItem.setExpanded(true);
				}
			})];
			var content = lib.title === constants.TEMP_RULESETS_NAME ? tempRulesButtons :
				new sap.m.Button({
					text: "Duplicate",
					press: function (oEvent) {
						var sourceObject = this.getParent().getBindingContext().getObject();
						var selectedRuleCopy = jQuery.extend(true, {}, sourceObject);
						that.model.setProperty("/newRule", selectedRuleCopy);
						that.model.checkUpdate(true, false);
						that.goToCreateRule();
					}
				});
			return content;
		}
	});
});
