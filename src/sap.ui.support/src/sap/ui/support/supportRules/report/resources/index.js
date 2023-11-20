/*!
 * ${copyright}
 */

window.sapUiSupportReport = window.sapUiSupportReport || {};
window.sapUiSupportReport.collapseExpand = (function() {
	'use strict';

	function collapseExpandClickHandler(event) {
		var toExpandElementId = this.getAttribute('data-expandableElement');
		var expandableElement = document.getElementById(toExpandElementId);
		var toExpand = expandableElement.classList.contains('collapsed');

		if (toExpand) {
			expandableElement.classList.remove('collapsed');
			expandableElement.classList.add('expanded');
			this.classList.remove('collapsed-content');
			this.classList.add('expanded-content');
		} else {
			expandableElement.classList.remove('expanded');
			expandableElement.classList.add('collapsed');
			this.classList.remove('expanded-content');
			this.classList.add('collapsed-content');
		}
	}

	function init() {
		try {
			var expandableElements = document.getElementsByClassName('expandable-control');
			if (!expandableElements) {
				return;
			}

			for (var i = 0; i < expandableElements.length; i++) {
				expandableElements[i].addEventListener('click', collapseExpandClickHandler);

				// Set the default collapsed/expanded state of the expandable content.
				var elementToExpandId = expandableElements[i].getAttribute('data-expandableElement');
				var elementToExpand = document.getElementById(elementToExpandId);
				if (expandableElements[i].classList.contains('collapsed-content')) {
					elementToExpand.classList.add('collapsed');
				} else {
					elementToExpand.classList.add('expanded');
				}
			}
		} catch (ex) {
			/* eslint-disable no-console */
			console.log('There was a problem initializing collapse/expand functionality.');
			/* eslint-enable no-console */
		}
	}

	return {
		init: init
	};
}());

window.sapUiSupportReport = window.sapUiSupportReport || {};
window.sapUiSupportReport.filter = (function () {
	'use strict';

	// Used to update the groups counters and hide/show group headers if all
	// of the elements are filtered.
	function updateIssuesGroups() {
		// Get all groups.
		var groupHeaderElements = document.querySelectorAll('[data-groupName]');

		for (var i = 0; i < groupHeaderElements.length; i++) {
			var groupHeader = groupHeaderElements[i];
			var issuesGroupId = groupHeader.getAttribute('data-expandableElement');
			var groupName = groupHeader.getAttribute('data-groupName');
			var groupNumber = groupHeader.getAttribute('data-groupNumber');
			// Get all rules for the current group.
			var rules = document.querySelectorAll('#' + issuesGroupId + ' > tr');
			var numberOfUnfilteredIssues = 0;
			var numberOfUnfilteredRules = 0;

			// Hide the rule section if no issues. Otherwise update count.
			for (var k = 0; k < rules.length; k++) {
				var rule = rules[k];
				var unfilteredIssuesForRule = rule.querySelectorAll('tr.filterable:not(.filtered)');
				var numberOfUnfilteredIssuesForRule = unfilteredIssuesForRule.length;
				if (numberOfUnfilteredIssuesForRule === 0) {
					rule.classList.add('filtered');
				} else {
					numberOfUnfilteredRules++;
					numberOfUnfilteredIssues += numberOfUnfilteredIssuesForRule;
					rule.querySelector('span.rule-issue-number').innerText = '(' + numberOfUnfilteredIssuesForRule + ' issues)';
				}
			}

			// Hide the group section if no issues. Otherwise update count.
			if (numberOfUnfilteredRules === 0) {
				groupHeader.classList.add('filtered');
			} else {
				groupHeader.classList.remove('filtered');
				groupHeader.querySelector('span').innerText = ' ' + groupNumber + '. ' + groupName + ' (' + numberOfUnfilteredRules + ' rules, ' + numberOfUnfilteredIssues + ' issues)';
			}
		}
	}
	function selectFilter(filter) {
		if (filter.classList.contains('filter-active')) {
			return;
		}

		var activeFilters = document.getElementsByClassName('filter-active');
		for (var k = 0; k < activeFilters.length; k++) {
			activeFilters[k].classList.remove('filter-active');
		}
		filter.classList.add('filter-active');
	}
	function resetFilters() {
		var filteredElements = document.querySelectorAll('.filtered');
		for (var i = 0; i < filteredElements.length; i++) {
			filteredElements[i].classList.remove('filtered');
		}
	}
	function filterBy(severity) {
		resetFilters();
		if (severity === 'Total') {
			return;
		}

		var elements = document.querySelectorAll('.filterable:not([data-severity="' + severity + '"])');
		for (var i = 0; i < elements.length; i++) {
			elements[i].classList.add('filtered');
		}
	}
	function filterClickHandler(event) {
		selectFilter(this);
		var severity = this.getAttribute('data-severity');
		filterBy(severity);
		updateIssuesGroups();
	}

	function init() {
		try {
			var filters = document.getElementsByClassName('filter');

			if (!filters) {
				return;
			}

			for (var i = 0; i < filters.length; i++) {
				if (filters[i].classList.contains('filter-initialized')) {
					continue;
				}

				filters[i].addEventListener('click', filterClickHandler);
				filters[i].classList.add('filter-initialized');
			}
		} catch (ex) {
			/* eslint-disable no-console */
			console.log('There was a problem initializing filters.');
			/* eslint-enable no-console */
		}
	}

	return {
		init: init
	};
}());

window.sapUiSupportReport.collapseExpand.init();
window.sapUiSupportReport.filter.init();