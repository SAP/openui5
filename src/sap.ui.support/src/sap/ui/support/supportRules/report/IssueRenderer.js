/*!
 * ${copyright}
 */

/**
 * Renders issues
 */
sap.ui.define(['jquery.sap.global'], function(jQuery) {
	'use strict';

	var _OPARenderingInitialized = false;

	function getEscapedString(value) {
		if (value) {
			if (jQuery.isArray(value)) {
				return jQuery.sap.escapeHTML(value.join(', '));
			} else {
				return jQuery.sap.escapeHTML(value);
			}
		} else {
			return '';
		}
	}

	function renderGroup(groupName, ruleGroup, groupId, groupNumber) {
		var content = '';
		var container = '';
		var ruleNumber = 1;
		var totalIssues = 0;

		for (var group in ruleGroup) {
			var issues = ruleGroup[group];
			totalIssues += issues.length;
			var issue = issues[0]; // Get the first issue from this rule group and add all common information.
			container += '<tr id="' + groupId + '_rule_' + ruleNumber + '" >';
			container += '<td>';
			container += '<div class="expandable-control collapsed-content" data-expandableElement="' + groupId + '_rule_' + ruleNumber + '_content">';
			container += '<div class="expandable-title"> ' + ruleNumber + '. ' + getEscapedString(issue.name) + ' <span class="rule-issue-number">(' + issues.length + ' issues)</span></div></div>';
			container += '<div id="' + groupId + '_rule_' + ruleNumber + '_content">';
			container += '<div><span class="sapUiSupportLabel">Description: </span>' + getEscapedString(issue.description) + '</div>';
			container += '<div><span class="sapUiSupportLabel">Min version: </span>' + getEscapedString(issue.minVersion) + '</div>';
			container += '<div><span class="sapUiSupportLabel">Async: </span>' + getEscapedString(issue.async.toString()) + '</div>';
			container += '<div><span class="sapUiSupportLabel">Resolution: </span>' + getEscapedString(issue.resolution) + '</div>';
			container += '<div>';
			if (issue.resolutionUrls) {
				for (var k = 0; k < issue.resolutionUrls.length; k++) {
					container += '<div><a href="' + getEscapedString(issue.resolutionUrls[k].href) + '" target="_blank">' + getEscapedString(issue.resolutionUrls[k].text) + '</a></div>';
				}
			}
			container += '</div>';
			container += '<table class="sapUiTable"><tr><th></th><th>Element Id</th><th>Class</th><th>Status</th><th>Details</th></tr>';
			for (var i = 0; i < issues.length; i++) {
				container += '<tr class="filterable" data-severity="' + getEscapedString(issues[i].severity) + '"><td>' + (i + 1) + '</td><td>' + getEscapedString(issues[i].context.id) + '</td>';
				container += '<td>' + getEscapedString(issues[i].context.className) + '</td>';
				container += '<td class="' + getEscapedString(issues[i].severity) + '">' + getEscapedString(issues[i].severity) + '</td>';
				container += '<td>' + getEscapedString(issues[i].details) + '</td></tr>';
			}
			container += '</table>';
			container += '</div></td>';
			container += '<td>' + getEscapedString(issue.categories) + '</td>';
			container += '<td>' + getEscapedString(issue.audiences) + '</td>';
			container += '</tr>';

			ruleNumber++;
		}

		// Make the first group expanded.
		var expandedClass = 'collapsed-content';
		if (groupNumber === 1) {
			expandedClass = 'expanded-content';
		}

		content += '<tr>';
		content += '<td colspan="100" class="expandable-control ' + expandedClass + '" data-expandableElement="' + groupId + '" data-groupName="' + groupName + '" data-groupNumber="' + groupNumber + '">';
		content += '<span class="sapUiSupportLabel expandable-title"> ' + groupNumber + '. ' + groupName + ' (' + (ruleNumber - 1) + ' rules, ' + totalIssues + ' issues)</span>';
		content += '</td></tr><tbody id="' + groupId + '">';
		content += container;
		content += '</tbody>';

		return content;
	}

	function getIssues(groups) {
		var content = '';
		var groupNumber = 1;

		if (!groups) {
			return content;
		}

		try {
			content += '<table class="sapUiTable"><tr><th>Name</th><th>Categories</th><th>Audiences</th></tr>';

			for (var group in groups) {
				content += renderGroup(group, groups[group], 'group' + groupNumber, groupNumber);
				groupNumber++;
			}

			content += '</table>';
		} catch (ex) {
			jQuery.sap.log.warning('There was a problem extracting issues info.');
			content = '';
		}

		return content;
	}

	function getSeverityFilter(severity, count, isActive) {
		if (!count) {
			return '';
		}

		var activeClass = isActive ? 'filter-active' : '';
		return '<div data-severity="' + severity + '" class="filter ' + activeClass + ' ' + severity + '">' + severity + '(' + count + ')</div>' + ' | ';
	}

	function getSeverityFilters(groups) {
		var content = '',
			severities = {},
			severityProperty,
			i,
			total = 0,
			issues = [],
			rules = {},
			rule = {},
			group = {};

		if (!groups) {
			return content;
		}

		try {
			for (group in groups) {
				rules = groups[group];
				for (rule in rules) {
					issues = rules[rule];
					for (i = 0; i < issues.length; i++) {
						severityProperty = issues[i].severity;
						if (severities[severityProperty]) {
							severities[severityProperty]++;
						} else {
							severities[severityProperty] = 1;
						}
						total++;
					}
				}
			}
			content += getSeverityFilter('Total', total, true);
			content += getSeverityFilter('High', severities['High'], false);
			content += getSeverityFilter('Medium', severities['Medium'], false);
			content += getSeverityFilter('Low', severities['Low'], false);
		} catch (ex) {
			jQuery.sap.log.warning('There was a problem creating severity filters.');
			content = '';
		}

		return content;
	}

	// Public functions

	/**
	 * Creates an html string containing the issues.
	 * @param {Object} issues - the issues in viewmodel format
	 * @param {Boolean} enableFiltering - if true renders the severity filters
	 * @returns {String}
	 */
	function render(issues, enableFiltering) {
		var content = '';

		if (enableFiltering) {
			content += '<div class="filters">' + getSeverityFilters(issues) + '<div>\n';
		}

		content += '<div>' + getIssues(issues) + '</div>';

		return '<div>' + content + '</div>';
	}

	/* eslint-disable no-undef */
	/**
	 * Creates an html string containing the issues and appends it to the OPA html page
	 * @param {Object} issues - the issues in viewmodel format
	 * @returns {String}
	 */
	function renderIssuesForOPA(issues) {
		if (!jQuery("#qunit") || !issues) {
			return;
		}

		// TODO: Add rendered issues to a buffer and render all of them at the same time at the end of the OPA test.
		var element = jQuery(this.render(issues));
		jQuery("#qunit").append(element);

		if (!_OPARenderingInitialized) {
			var styles = [
				jQuery.sap.getResourcePath('sap/ui/support/supportRules/report/resources/styles.css'),
				jQuery.sap.getResourcePath('sap/ui/support/supportRules/report/resources/collapseExpand.css'),
				jQuery.sap.getResourcePath('sap/ui/support/supportRules/report/resources/filter.css')
			];
			var collapseExpandUrl = jQuery.sap.getResourcePath('sap/ui/support/supportRules/report/resources/collapseExpand.js');
			var filterUrl = jQuery.sap.getResourcePath('sap/ui/support/supportRules/report/resources/filter.js');

			jQuery.each(styles, function (index, value) {
				jQuery('<link>').appendTo('head').attr({ type: 'text/css', rel: 'stylesheet', href: value });
			});
			jQuery.getScript(collapseExpandUrl, function () {
				window.sapUiSupportReport.collapseExpand.init();
			});
			jQuery.getScript(filterUrl, function () {
				window.sapUiSupportReport.filter.init();
			});
			_OPARenderingInitialized = true;
		} else {
			window.sapUiSupportReport.collapseExpand.init();
			window.sapUiSupportReport.filter.init();
		}
	}
	/* eslint-enable no-undef */

	return {
		render: render,
		renderIssuesForOPA: renderIssuesForOPA
	};
}, true);