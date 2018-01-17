/*!
 * ${copyright}
 */

/**
 * Creates a report from data.
 */
sap.ui.define(['jquery.sap.global', 'sap/ui/thirdparty/handlebars', 'sap/ui/support/supportRules/report/Archiver',
	'sap/ui/support/supportRules/report/IssueRenderer'], function(jQuery, Handlebars, Archiver, IssueRenderer) {
	'use strict';

	// Private fields
	var resourcesBaseUrl = jQuery.sap.getResourcePath('sap/ui/support/supportRules/report/resources');
	var resources = [
		{ url: resourcesBaseUrl + '/ReportTemplate.html', type: 'template' },
		{ url: resourcesBaseUrl + '/styles.css', type: 'css' },
		{ url: resourcesBaseUrl + '/filter.css', type: 'css' },
		{ url: resourcesBaseUrl + '/collapseExpand.css', type: 'css' },
		{ url: resourcesBaseUrl + '/filter.js', type: 'js' },
		{ url: resourcesBaseUrl + '/collapseExpand.js', type: 'js' }
	];

	/*
	 * Functions taken from core.support.plugins.TechInfo.js
	 */
	var techInfoRenderer = {
		line: function (buffer, right, border, label, content) {
			buffer.push("<tr><td ", right ? "align='right' " : "", "valign='top'>", "<label class='sapUiSupportLabel'>", jQuery.sap.escapeHTML(label || ""), "</label></td><td",
					border ? " class='sapUiSupportTechInfoBorder'" : "", ">");
			var ctnt = content;
			if (jQuery.isFunction(content)) {
				ctnt = content(buffer);
			}
			buffer.push(jQuery.sap.escapeHTML(ctnt || ""));
			buffer.push("</td></tr>");
		},
		multiline: function (buffer, right, border, label, content){
			var that = this;
			that.line(buffer, right, border, label, function(buffer){
				buffer.push("<table border='0' cellspacing='0' cellpadding='3'>");
				jQuery.each(content, function(i,v){
					var val = "";
					if (v) {
						if (typeof (v) === "string" || typeof (v) === "string" || typeof (v) === "boolean") {
							val = v;
						} else if ((jQuery.isArray(v) || jQuery.isPlainObject(v)) && window.JSON) {
							val = window.JSON.stringify(v);
						}
					}
					that.line(buffer, false, false, i, "" + val);
				});
				buffer.push("</table>");
			});
		},
		subheader: function (buffer, title) {
			buffer.push("<tr class='sapUiSupportTitle'><td valign='top' colspan='2'>", "<label class='sapUiSupportLabel'>",
				jQuery.sap.escapeHTML(title || ""), "</label></td></tr>");
		}
	};

	function getResource(resource) {
		return jQuery.ajax({
			type: 'GET',
			url: resource.url,
			dataType: 'text'
		}).then(function (text) {
			return { content: text, type: resource.type };
		});
	}

	function getResources() {
		var deferreds = [];
		for (var i = 0; i < resources.length; i++) {
			deferreds.push(getResource(resources[i]));
		}
		return jQuery.when.apply(jQuery, deferreds);
	}

	/*
	 * Modified version of the function onsapUiSupportTechInfoData from core.support.plugins.TechInfo.js
	 */
	function getTechnicalInformation(technicalInfo) {
		var content = '';

		if (!technicalInfo) {
			return new Handlebars.SafeString(content);
		}

		try {
			technicalInfo.modules.sort();
			var html = ["<div class='sapUiSupportToolbar'>",
						"<div><div class='sapUiSupportTechInfoCntnt'>",
						"<table border='0' cellpadding='3'>"];
			techInfoRenderer.subheader(html, "Support Assistant Information");
			techInfoRenderer.line(html, true, true, "Location", technicalInfo.supportAssistant.location);
			techInfoRenderer.line(html, true, true, "Version", technicalInfo.supportAssistant.versionAsString);
			techInfoRenderer.subheader(html, "Application Information");
			techInfoRenderer.line(html, true, true, "SAPUI5 Version", function(buffer){
				var sapUI5Version = technicalInfo.sapUi5Version;
				if (sapUI5Version && sapUI5Version.version) {
					var oVersionInfo = sapUI5Version.version;
					var sVersion = jQuery.sap.escapeHTML(oVersionInfo.version || "");
					buffer.push(sVersion, " (built at ", jQuery.sap.escapeHTML(oVersionInfo.buildTimestamp || ""), ", last change ", jQuery.sap.escapeHTML(oVersionInfo.scmRevision || ""), ")");
				} else {
					buffer.push("not available");
				}
			});
			techInfoRenderer.line(html, true, true, "Core Version", function(buffer){
				return technicalInfo.version + " (built at " + technicalInfo.build + ", last change " + technicalInfo.change + ")";
			});
			techInfoRenderer.line(html, true, true, "Loaded jQuery Version", function(buffer){
				return technicalInfo.jquery;
			});
			techInfoRenderer.line(html, true, true, "User Agent", function(buffer){
				return technicalInfo.useragent + (technicalInfo.docmode ? ", Document Mode '" + technicalInfo.docmode + "'" : "");
			});
			techInfoRenderer.line(html, true, true, "Application", technicalInfo.appurl);
			techInfoRenderer.multiline(html, true, true, "Configuration (bootstrap)", technicalInfo.bootconfig);
			techInfoRenderer.multiline(html, true, true, "Configuration (computed)", technicalInfo.config);
			if (!jQuery.isEmptyObject(technicalInfo.libraries)) {
				techInfoRenderer.multiline(html, true, true, "Libraries", technicalInfo.libraries);
			}
			techInfoRenderer.multiline(html, true, true, "Loaded Libraries", technicalInfo.loadedLibraries);
			techInfoRenderer.line(html, true, true, "Loaded Modules", function(buffer){
				jQuery.each(technicalInfo.modules, function(i,v){
					if (v.indexOf("sap.ui.core.support") < 0) {
						buffer.push("<span>", jQuery.sap.escapeHTML(v || ""), "</span>");
						if (i < technicalInfo.modules.length - 1) {
							buffer.push(", ");
						}
					}
				});
			});
			techInfoRenderer.multiline(html, true, true, "URI Parameters", technicalInfo.uriparams);

			html.push("</table></div>");
			content = html.join('');
		} catch (ex) {
			jQuery.sap.log.warning('There was a problem extracting technical info.');
		}

		return new Handlebars.SafeString(content);
	}

	function getComponentPart(value) {
		var result = '<td>';
		if (value) {
			result += jQuery.sap.escapeHTML(value);
		}
		result += '</td>';
		return result;
	}

	function getAppInfo(appInfo) {
		var content = '';

		if (!appInfo) {
			return new Handlebars.SafeString(content);
		}

		content += '<table class="sapUiTable"><tr><th>Component ID</th><th>Type</th><th>Title</th><th>Subtitle</th><th>Application version</th><th>Description</th><th>BCP Component</th></tr>';

		try {
			for (var i = 0; i < appInfo.length; i++) {
				var component = appInfo[i];
				content += '<tr>';
				content += getComponentPart(component.id);
				content += getComponentPart(component.type);
				content += getComponentPart(component.title);
				content += getComponentPart(component.subTitle);
				if (component.applicationVersion) {
					content += getComponentPart(component.applicationVersion.version);
				} else {
					content += '<td></td>';
				}
				content += getComponentPart(component.description);
				content += getComponentPart(component.ach);
				content += '</tr>';
			}

			content += '</table>';
		} catch (ex) {
			jQuery.sap.log.warning('There was a problem extracting app info.');
			content = '';
		}

		return new Handlebars.SafeString(content);
	}

	function getGlobalScope(displaySettings) {
		var content = '';
		content += '<div><span class="sapUiSupportLabel">' + displaySettings.displayName + '</span>';
		content += '<span> (' + displaySettings.description + ')</span></div>';
		return content;
	}

	function getSubtreeScope(parentId, displaySettings) {
		var content = '';
		content += '<div><span class="sapUiSupportLabel">' + displaySettings.displayName + ' with id:</span> ' + parentId;
		content += '<span> (' + displaySettings.description + ')</span></div>';
		return content;
	}

	function getComponentsScope(components, displaySettings) {
		var content = '';
		// Make components collapsable if they are too many.
		if (components.length > 5) {
			content += '<div class="expandable-control collapsed-content" data-expandableElement="execution-scope-components">';
			content += '<span class="expandable-title"><span class="sapUiSupportLabel">' + displaySettings.displayName + '</span>';
			content += '<span> (' + displaySettings.description + ')</span></span></div>';
		} else {
			content += '<div><span class="sapUiSupportLabel">' + displaySettings.displayName + '</span>';
			content += '<span> (' + displaySettings.description + ')</span></div>';
		}

		content += '<ol id="execution-scope-components" class="top-margin-xsmall">';
		for (var i = 0; i < components.length; i++) {
			content += '<li>' + components[i] + '</li>';
		}
		content += '</ol>';

		return content;
	}

	function getScope(scope) {
		var content = '';

		try {
			var scopeType = scope.executionScope._getType();
			var scopeDisplaySettings = scope.scopeDisplaySettings.executionScopes[scopeType];
			var scopeDisplayTitle = scope.scopeDisplaySettings.executionScopeTitle;
			content += '<div class="sapUiSupportLabel">' + scopeDisplayTitle + ': </div>';

			switch (scopeType) {
				case 'global':
					content += getGlobalScope(scopeDisplaySettings);
					break;
				case 'subtree':
					content += getSubtreeScope(scope.executionScope._getContext().parentId, scopeDisplaySettings);
					break;
				case 'components':
					content += getComponentsScope(scope.executionScope._getContext().components, scopeDisplaySettings);
					break;
			}
		} catch (ex) {
			jQuery.sap.log.warning('There was a problem extracting scope info.');
			content = '';
		}

		return new Handlebars.SafeString(content);
	}

	function getRules(groups) {
		var content = '';

		if (!groups) {
			return new Handlebars.SafeString(content);
		}

		try {
			var groupNumber = 1;

			content += '<table class="sapUiTable"><tbody><tr><th>Name</th><th>Description</th><th>Categories</th><th>Audiences</th></tr></tbody>';

			for (var group in groups) {
				var rules = groups[group];

				// Make the first group expanded.
				var expandedClass = 'collapsed-content';
				if (groupNumber === 1) {
					expandedClass = 'expanded-content';
				}

				var groupIssueCountElement = groups[group].selected ? ' (' + groups[group].issueCount + ' issues)' : '';
				var checkedGroup = '<span class="checked" style="' + (groups[group].selected ? '' : 'visibility: hidden;') + '"> &#10004; </span>';
				content += '<tbody><tr><td colspan="100" ';
				content += 'class="expandable-control ' + expandedClass + '" data-expandableElement="section-selected-rules-group' + groupNumber + '">' + checkedGroup;
				content += '<span class="sapUiSupportLabel expandable-title"> ' + group + groupIssueCountElement + '</span>';
				content += '</td></tr></tbody>';
				var rulesTable = '';

				for (var rule in rules) {
					var issueCountElement = rules[rule].selected ? ' (' + rules[rule].issueCount + ' issues)' : '';
					var checked = '<span class="checked" style="' + (rules[rule].selected ? '' : 'visibility: hidden;') + '"> &#10004; </span>';
					rulesTable += '<tr>';
					rulesTable += '<td>' + checked + rules[rule].title + issueCountElement + '</td>';
					rulesTable += '<td>' + rules[rule].description + '</td>';
					rulesTable += '<td>' + rules[rule].categories.join(', ') + '</td>';
					rulesTable += '<td>' + rules[rule].audiences.join(', ') + '</td>';
					rulesTable += '</tr>';
				}

				content += '<tbody id="section-selected-rules-group' + groupNumber + '">' + rulesTable + '</tbody>';
				groupNumber++;
			}

			content += '</table>';
		} catch (ex) {
			jQuery.sap.log.warning('There was a problem extracting selected rules info.');
			content = '';
		}

		return new Handlebars.SafeString(content);
	}

	function getResourcesHtml(resources, type) {
		var content = '';

		if (type !== 'script' && type !== 'style') {
			return content;
		}

		for (var i = 0; i < resources.length; i++) {
			switch (type) {
				case 'script': content += '<script>' + resources[i] + '</script>\n'; break;
				case 'style': content += '<style type="text/css">' + resources[i] + '</style>\n'; break;
			}
		}

		return new Handlebars.SafeString(content);
	}

	Handlebars.registerHelper('getTechnicalInformation', function (technicalInfo) {
		return getTechnicalInformation(technicalInfo);
	});
	Handlebars.registerHelper('getRules', function (rules) {
		return getRules(rules);
	});
	Handlebars.registerHelper('getIssues', function (issues) {
		return new Handlebars.SafeString(IssueRenderer.render(issues, true));
	});
	Handlebars.registerHelper('getAppInfo', function (appInfo) {
		return getAppInfo(appInfo);
	});
	Handlebars.registerHelper('getScope', function (scope) {
		return getScope(scope);
	});
	Handlebars.registerHelper('getScripts', function (scripts) {
		return getResourcesHtml(scripts, 'script');
	});
	Handlebars.registerHelper('getStyles', function (styles) {
		return getResourcesHtml(styles, 'style');
	});

	// Public functions

	/**
	 * Creates an html string containing the whole report.
	 * @param {Object} oData - the data required to create a report
	 * @returns {String}
	 */
	function getReportHtml(oData) {
		return getResources().then(function () {
			var styles = [],
				scripts = [],
				html = '',
				i,
				template = {},
				reportContext = {};

			for (i = 0; i < arguments.length; i++) {
				switch (arguments[i].type) {
					case 'template': html = arguments[i].content; break;
					case 'css': styles.push(arguments[i].content); break;
					case 'js': scripts.push(arguments[i].content); break;
				}
			}

			template = Handlebars.compile(html);

			reportContext = {
				technicalInfo: oData.technical,
				issues: oData.issues,
				appInfo: oData.application,
				rules: oData.rules,
				metadata: {
					title: oData.name + ' Analysis Results',
					title_TechnicalInfo: 'Technical Information',
					title_Issues: 'Issues',
					title_AppInfo: 'Application Information',
					title_SelectedRules: 'Available and (<span class="checked">&#10004;</span>) Executed Rules',
					timestamp: new Date(),
					scope: oData.scope,
					analysisDuration: oData.analysisDuration,
					analysisDurationTitle: oData.analysisDurationTitle,
					styles: styles,
					scripts: scripts
				}
			};

			return template(reportContext);
		});
	}

	/**
	 * Creates a zip file containing the report.html, appInfo.json, technicalInfo.json, issues.json.
	 * @param {Object} oData - the data required to create a report
	 */
	function downloadReportZip(oData) {
		this.getReportHtml(oData).done(function (html) {
			var report = '<!DOCTYPE HTML><html><head><title>Report</title></head><body><div id="sap-report-content">' + html + '</div></body></html>';
			var issues = { 'issues': oData.issues };
			var appInfos = { 'appInfos': oData.application };
			var technicalInfo = { 'technicalInfo': oData.technical };
			var archiver = new Archiver();
			archiver.add('technicalInfo.json', technicalInfo, 'json');
			archiver.add('issues.json', issues, 'json');
			archiver.add('appInfos.json', appInfos, 'json');
			archiver.add('report.html', report);
			archiver.download("SupportAssistantReport");
			archiver.clear();
		});
	}

	/**
	 * Opens a report in a new window.
	 * @param {Object} oData - the data required to create a report
	 */
	function openReport(oData) {
		// Create a hidden anchor. Open window outside of the promise otherwise browsers blocks the window.open.
		var content = '';
		var a = jQuery('<a style="display: none;"/>');
		a.on('click', function () {
			var reportWindow = window.open('', '_blank');
			jQuery(reportWindow.document).ready(function () {
				// Sometimes document.write overwrites the document html and sometimes it appends to it so we need a wrapper div.
				if (reportWindow.document.getElementById('sap-report-content')) {
					reportWindow.document.getElementById('sap-report-content').innerHtml = content;
				} else {
					reportWindow.document.write('<div id="sap-report-content">' + content + '</div>');
				}
				reportWindow.document.title = 'Report';
			});
		});
		jQuery('body').append(a);

		this.getReportHtml(oData).then(function (html) {
			content = html;
			a[0].click();
			a.remove();
		});
	}

	return {
		getReportHtml: getReportHtml,
		downloadReportZip: downloadReportZip,
		openReport: openReport
	};
}, true);
