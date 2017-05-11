/*!
 * ${copyright}
 */

sap.ui.define([
	"jquery.sap.global",
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/support/supportRules/WindowCommunicationBus",
	"sap/ui/support/supportRules/ui/models/SharedModel",
	"sap/ui/support/supportRules/ElementTree",
	"sap/ui/support/supportRules/WCBChannels"
], function ($, Controller, JSONModel, CommunicationBus, SharedModel, ElementTree, channelNames) {
	"use strict";

	var mIssueSettings = {
		severitytexts: {
			High: "High",
			Medium: "Medium",
			Low: "Low",
			All: "All Severities"
		},
		severitystates: {
			High: "Error",
			Medium: "Warning",
			Low: "None",
			All: "None"
		},
		severityicons: {
			High: "sap-icon://message-error",
			Medium: "sap-icon://message-warning",
			Low: "sap-icon://message-information",
			All: "sap-icon://multiselect-all"
		}
	};

	return Controller.extend("sap.ui.support.supportRules.ui.controllers.Issues", {
		ISSUES_LIMIT : 1000,
		onInit: function () {
			CommunicationBus.subscribe(channelNames.ON_ANALYZE_FINISH, function (data) {
			var that = this;

				var problematicControlsIds = {};

				// Contains a list of all issues found during analisys.
				// The list is used later when filters are modified.
				that.data = data;

				data.issues.forEach(function (issue) {
					if (!issue.context || !issue.context.id) {
						return;
					}

					if (!problematicControlsIds[issue.context.id]) {
						problematicControlsIds[issue.context.id] = [issue.name];
					} else {
						problematicControlsIds[issue.context.id].push(issue.name);
					}

				});
				this.model.setSizeLimit(this.ISSUES_LIMIT);
				this.model.setProperty("/issues", data.issues);
				this.model.setProperty("/maxIssuesDisplayedNumber", Math.min(this.ISSUES_LIMIT, data.issues.length));
				this.model.setProperty('/analyzePressed', true);
				this.model.setProperty("/visibleIssuesCount", data.issues.length);
				/*this.elementTreeData = {
					controls: data.elementTree,
					issuesIds: problematicControlsIds
				};*/

				this.elementTree.setData({
					controls: data.elementTree,
					issuesIds: problematicControlsIds
				});

				this.clearFilters();
				this._selectFirstVisibleIssue();
			}, this);

			this.model = SharedModel;
			this.getView().setModel(this.model);
			this.clearFilters();
			this._initElementTree();
		},
		_initElementTree: function () {
			var that = this;

			this.elementTree = new ElementTree(null, {
				onIssueCountClicked: function (selectedElementId) {
					that.clearFilters();
					that.model.setProperty("/elementFilter", selectedElementId);
					that.updateIssuesVisibility();
					that._selectFirstVisibleIssue();
				},
				onHoverChanged: function (hoveredElementId) {
					CommunicationBus.publish(channelNames.TREE_ELEMENT_MOUSE_ENTER, hoveredElementId);
				},
				onMouseOut: function () {
					CommunicationBus.publish(channelNames.TREE_ELEMENT_MOUSE_OUT);
				}
			});
		},
		onAfterRendering: function () {
			this.elementTree.setContainerId(this.getView().byId("elementTreeContainer").getId());
		},
		clearFilters: function () {
			this.model.setProperty("/severityFilter", "All");
			this.model.setProperty("/categoryFilter", "All");
			this.model.setProperty("/elementFilter", "All");
			this.model.setProperty("/audienceFilter", "All");

			if (this.data) {
				this.model.setProperty("/issues", this.data.issues);
				this.setToolbarHeight();
			}

			this.updateIssuesVisibility();
		},
		clearFiltersAndElementSelection: function () {
			this.clearFilters();
			this.elementTree.clearSelection();
		},
		onIssuePressed: function (event) {
			var pressedLi = event.mParameters.listItem,
				selectedIssue = pressedLi.getBindingContext().getObject();
			this.model.setProperty("/selectedIssue", selectedIssue);
			this.elementTree.setSelectedElement(selectedIssue.context.id, false);
		},
		openDocumentation: function (oEvent) {
			var link = sap.ui.getCore().byId(oEvent.mParameters.id),
				url = link.getBindingContext().getProperty("href");
			CommunicationBus.publish(channelNames.OPEN_URL, url);
		},
		updateIssuesVisibility: function () {
			var visibleIssuesCount = 0;
			var issuesList = this.getView().byId("issuesList");

			if (this.data) {
				var filteredIssues = this.data.issues.filter(this.filterIssueListItems, this);

				this.model.setProperty("/issues", filteredIssues);
				this.model.setProperty("/maxIssuesDisplayedNumber", Math.min(this.ISSUES_LIMIT, filteredIssues.length));
			}

			this.setToolbarHeight();

			issuesList.getItems().forEach(function (item) {
				item.updateProperty("visible");
			});

			issuesList.getItems().forEach(function (item) {
				if (item.getVisible()) {
					visibleIssuesCount++;
				}
			});
			this.model.setProperty("/visibleIssuesCount", visibleIssuesCount);
		},
		_selectFirstVisibleIssue: function () {
			var list = this.getView().byId("issuesList"),
				items = list.getVisibleItems();

			if (items.length > 0) {
				list.setSelectedItem(items[0]);
				this.model.setProperty("/selectedIssue", items[0].getBindingContext().getObject());
			}
		},
		filterIssueListItems: function (issue) {
			var sevFilter = this.model.getProperty("/severityFilter"),
				sevFilterApplied = issue.severity === sevFilter || sevFilter === 'All',
				catFilter = this.model.getProperty("/categoryFilter"),
				catFilterApplied = $.inArray( catFilter, issue.categories ) > -1 || catFilter === 'All',
				elementFilter = this.model.getProperty("/elementFilter"),
				elementFilterApplied =  elementFilter ===  issue.context.id || elementFilter === 'All',
				audFilter = this.model.getProperty("/audienceFilter"),
				audienseFilterApplied =  $.inArray( audFilter, issue.audiences ) > -1 || audFilter === 'All';

			return sevFilterApplied && catFilterApplied && elementFilterApplied && audienseFilterApplied;
		},
		filterSevirityIcon: function(sValue) {
			return mIssueSettings.severityicons[sValue];
		},
		filterSevirityState: function(sValue) {
			return mIssueSettings.severitystates[sValue];
		},
		filterSevirityText: function(sValue) {
			return mIssueSettings.severitytexts[sValue];
		},
		setToolbarHeight: function() {
			var issues = this.model.getProperty("/issues");
			if (issues && issues.length > this.ISSUES_LIMIT) {
				this.model.setProperty("/filterBarHeight", "3.5rem");
				this.model.setProperty("/messegeStripHeight", "2.5rem");
			} else {
				this.model.setProperty("/filterBarHeight", "4rem");
				this.model.setProperty("/messegeStripHeight", "2rem");
			}
		},
		onReportPress: function(oEvent) {
				var oItem = oEvent.getParameter("item"),
					actionToTake = oItem.getText(),
					data = this._getReportData();
				if (actionToTake === 'View') {
					CommunicationBus.publish(channelNames.ON_SHOW_REPORT_REQUEST, data);
				} else {
					CommunicationBus.publish(channelNames.ON_DOWNLOAD_REPORT_REQUEST, data);
				}
		},
		_getReportData: function () {
			return {
				executionScopes: this.model.getProperty("/executionScopes"),
				executionScopeTitle: this.model.getProperty("/executionScopeTitle"),
				analysisDurationTitle: this.model.getProperty("/analysisDurationTitle")
			};
		}
	});
});
