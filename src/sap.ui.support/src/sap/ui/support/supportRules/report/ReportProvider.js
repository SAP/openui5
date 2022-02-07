/*!
 * ${copyright}
 */

/**
 * Creates a report from data.
 */
sap.ui.define(['sap/ui/thirdparty/jquery', 'sap/base/Log', 'sap/base/security/encodeXML', 'sap/base/util/isEmptyObject', 'sap/base/util/isPlainObject', 'sap/ui/support/supportRules/report/Archiver',
	'sap/ui/support/supportRules/report/IssueRenderer'], function(jQuery, Log, encodeXML, isEmptyObject, isPlainObject, Archiver, IssueRenderer) {
	'use strict';

	// Private fields
	var resourcesBaseUrl = sap.ui.require.toUrl('sap/ui/support/supportRules/report/resources');

	/*
	 * Functions taken from core.support.plugins.TechInfo.js
	 */
	var techInfoRenderer = {
		line: function (buffer, right, border, label, content) {
			buffer.push("<tr><td ", right ? "align='right' " : "", "valign='top'>", "<label class='sapUiSupportLabel'>", encodeXML(label || ""), "</label></td><td",
					border ? " class='sapUiSupportTechInfoBorder'" : "", ">");
			var ctnt = content;
			if (typeof content === "function") {
				ctnt = content(buffer);
			}
			buffer.push(encodeXML(ctnt || ""));
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
						} else if (Array.isArray(v) || isPlainObject(v)) {
							val = JSON.stringify(v);
						}
					}
					that.line(buffer, false, false, i, "" + val);
				});
				buffer.push("</table>");
			});
		},
		subheader: function (buffer, title) {
			buffer.push("<tr class='sapUiSupportTitle'><td valign='top' colspan='2'>", "<label class='sapUiSupportLabel'>",
				encodeXML(title || ""), "</label></td></tr>");
		}
	};

	function getResource(resource) {
		return jQuery.ajax({
			type: 'GET',
			url: resourcesBaseUrl + "/" + resource,
			dataType: 'text'
		}).then(function (text) {
			return text;
		});
	}

	/*
	 * Modified version of the function onsapUiSupportTechInfoData from core.support.plugins.TechInfo.js
	 */
	function getTechnicalInformation(technicalInfo) {
		var content = '';

		if (!technicalInfo) {
			return content;
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
					var sVersion = encodeXML(oVersionInfo.version || "");
					buffer.push(sVersion, " (built at ", encodeXML(oVersionInfo.buildTimestamp || ""), ", last change ", encodeXML(oVersionInfo.scmRevision || ""), ")");
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
			if (!isEmptyObject(technicalInfo.libraries)) {
				techInfoRenderer.multiline(html, true, true, "Libraries", technicalInfo.libraries);
			}
			techInfoRenderer.multiline(html, true, true, "Loaded Libraries", technicalInfo.loadedLibraries);
			techInfoRenderer.line(html, true, true, "Loaded Modules", function(buffer){
				jQuery.each(technicalInfo.modules, function(i,v){
					if (v.indexOf("sap.ui.core.support") < 0) {
						buffer.push("<span>", encodeXML(v || ""), "</span>");
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
			Log.warning('There was a problem extracting technical info.');
		}

		return content;
	}

	function getComponentPart(value) {
		var result = '<td>';
		if (value) {
			result += encodeXML(value);
		}
		result += '</td>';
		return result;
	}

	function getAppInfo(appInfo) {
		var content = '';

		if (!appInfo) {
			return content;
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
			Log.warning('There was a problem extracting app info.');
			content = '';
		}

		return content;
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
			var scopeType = scope.executionScope.getType();
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
			Log.warning('There was a problem extracting scope info.');
			content = '';
		}

		return content;
	}

	function getRules(groups) {
		var content = '';

		if (!groups) {
			return content;
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
				var checkedGroup = '<span class="' + (groups[group].selected ? 'checked' : 'unchecked') + '"></span>';
				content += '<tbody><tr><td colspan="100" ';
				content += 'class="expandable-control ' + expandedClass + '" data-expandableElement="section-selected-rules-group' + groupNumber + '">' + checkedGroup;
				content += '<span class="sapUiSupportLabel expandable-title">' + group + groupIssueCountElement + '</span>';
				content += '</td></tr></tbody>';
				var rulesTable = '';

				for (var rule in rules) {
					var issueCountElement = rules[rule].selected ? ' (' + rules[rule].issueCount + ' issues)' : '';
					var checked = '<span class="' + (rules[rule].selected ? 'checked' : 'unchecked') + '"></span>';
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
			Log.warning('There was a problem extracting selected rules info.');
			content = '';
		}

		return content;
	}

	function getIssues(issues) {
		return IssueRenderer.render(issues, true);
	}

	function getRulePreset(oRulePreset) {
		if (!oRulePreset) {
			return "none";
		}

		return "<strong>" + oRulePreset.title + "/" + oRulePreset.id + "</strong>";
	}

	// Public functions

	/**
	 * Creates an html string containing the whole report.
	 * @param {Object} oData - the data required to create a report
	 * @param {string} [sBaseUrl] - the base path to javascript and css resources
	 * @returns {string} the complete html.
	 */
	function getReportHtml(oData, sBaseUrl) {
		if (!sBaseUrl) {
			sBaseUrl = resourcesBaseUrl + "/";
		}

		return getResource("ReportTemplate.html").then(function(sTemplate) {
			var oContext = {
				baseUrl: sBaseUrl,
				technicalInfo: getTechnicalInformation(oData.technical),
				issues: getIssues(oData.issues),
				appInfo: getAppInfo(oData.application),
				rules: getRules(oData.rules),
				rulePreset: getRulePreset(oData.rulePreset),
				metadataTitle: oData.name + ' Analysis Results',
				metadataTitleTechnicalInfo: 'Technical Information',
				metadataTitleIssues: 'Issues',
				metadataTitleAppInfo: 'Application Information',
				metadataTitleSelectedRules: 'Available and (<span class="checked"></span>) Selected Rules',
				metadataTimestamp: new Date(),
				metadataScope: getScope(oData.scope),
				metadataAnalysisDuration: oData.analysisDuration,
				metadataAnalysisDurationTitle: oData.analysisDurationTitle
			};

			return replacePlaceholders(sTemplate, oContext);
		});
	}

	/**
	 * Replace any placeholder like {{placeholder}} with the corresponding value from oContext.
	 * @param {string} sTemplate the string template containing the placeholders.
	 * @param {Object} oContext the object containing the values for the placeholders.
	 * @returns {string} the processed template.
	 */
	function replacePlaceholders(sTemplate, oContext) {
		var sPlaceholder,
			sValue;

		for (sPlaceholder in oContext) {
			sValue = oContext[sPlaceholder];
			sTemplate = sTemplate.replace(new RegExp("\{\{" + sPlaceholder + "\}\}", "ig"), sValue);
		}

		return sTemplate;
	}

	/**
	 * Creates a zip file containing the report.html, appInfo.json, technicalInfo.json, issues.json.
	 * @param {Object} oData - the data required to create a report
	 */
	function downloadReportZip(oData) {
		var aPromises = [
			this.getReportHtml(oData, "./"),
			getResource("styles.css"),
			getResource("index.js"),
			getResource("images/checked.svg"),
			getResource("images/collapsed.svg"),
			getResource("images/expanded.svg"),
			getResource("images/unchecked.svg")
		];

		Promise.all(aPromises).then(function (resources) {
			var issues = { 'issues': oData.issues },
				appInfos = { 'appInfos': oData.application },
				technicalInfo = { 'technicalInfo': oData.technical },
				archiver = new Archiver();

			archiver.add('technicalInfo.json', technicalInfo, 'json');
			archiver.add('issues.json', issues, 'json');
			archiver.add('appInfos.json', appInfos, 'json');
			archiver.add('report.html', resources[0]);
			archiver.add('abap.json', oData.abap, 'json');
			archiver.add('styles.css', resources[1], 'css');
			archiver.add('index.js', resources[2], 'js');


			archiver.add('images/checked.svg', resources[3], 'svg');
			archiver.add('images/collapsed.svg', resources[4], 'svg');
			archiver.add('images/expanded.svg', resources[5], 'svg');
			archiver.add('images/unchecked.svg', resources[6], 'svg');

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
		var a = jQuery('<a class="sapUiHidden"></a>');
		a.on('click', function () {
			var reportWindow = window.open('', '_blank');
			reportWindow.opener = null;

			jQuery(reportWindow.document).ready(function () {
				// make sure everything is cleared before writing the new report
				reportWindow.document.documentElement.innerHTML = '';

				reportWindow.document.write(content);
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
