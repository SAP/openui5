/*!
 * ${copyright}
 */

/**
 * Formats the analysis history in a single string.
 */
sap.ui.define([], function() {
	"use strict";

	// Create a line with 196 "-"
	var _horizontalSeparator = Array(196).join("-"),
		_verticalSeparator = "|";

	function formatString(text, columnSize) {
		var formatted = "",
			text = text || "";

		// Set default.
		if (!columnSize) {
			columnSize = 50;
		}

		// Clear new line characters and double quotes to avoid bad formatting.
		formatted = text.replace(/(\r\n|\n|\r)/gm, " ").replace(/(\")/gm, "");

		if (formatted.length > columnSize) {
			formatted = formatted.substring(0, columnSize - 3) + "...";
		} else {
			while (formatted.length < columnSize) {
				formatted += " ";
			}
		}

		return formatted;
	}

	function formatRule(rule) {
		if (rule.issues.length) {
			var text = _horizontalSeparator + "\n";
			// Use the first issue to get the rule properties.
			text += _verticalSeparator + formatString("rule id: " + rule.id, 193) + _verticalSeparator + "\n";
			text += _verticalSeparator + formatString("name: " + rule.name, 193) + _verticalSeparator + "\n";
			text += _verticalSeparator + formatString("library: " + rule.library, 193) + _verticalSeparator + "\n";
			text += _verticalSeparator + formatString("categories: " + rule.categories.join(", "), 193) + _verticalSeparator + "\n";
			text += _verticalSeparator + formatString("audiences: " + rule.audiences.join(", "), 193) + _verticalSeparator + "\n";
			text += _verticalSeparator + formatString("description: " + rule.description, 193) + _verticalSeparator + "\n";
			text += _verticalSeparator + formatString("resolution: " + rule.resolution, 193) + _verticalSeparator + "\n";
			text += _horizontalSeparator + "\n";
			text += _verticalSeparator + formatString("id", 50);
			text += _verticalSeparator + formatString("class name", 30);
			text += _verticalSeparator + formatString("status", 10);
			text += _verticalSeparator + formatString("details", 100);
			text += _verticalSeparator + "\n";
			text += _horizontalSeparator + "\n";

			for (var i = 0; i < rule.issues.length; i++) {
				text += _verticalSeparator + formatString(rule.issues[i].context.id, 50);
				text += _verticalSeparator + formatString(rule.issues[i].context.className, 30);
				text += _verticalSeparator + formatString(rule.issues[i].severity, 10);
				text += _verticalSeparator + formatString(rule.issues[i].details, 100);
				text += _verticalSeparator + "\n";
			}

			text += _horizontalSeparator + "\n";

			return text;
		}

		return "";
	}

	function formatSingleRun(libraries) {
		var text = "";

		if (!libraries) {
			return text;
		}

		for (var lib in libraries) {
			if (libraries[lib].issueCount){
				for (var rule in libraries[lib]["rules"]) {
					text += formatRule(libraries[lib]["rules"][rule]);
				}
				text += "\n";
			}
		}

		text += "\n";

		return text;
	}

	function format(analysisHistory) {
		var text = "";

		if (!analysisHistory) {
			return text;
		}

		for (var i = 0; i < analysisHistory.length; i++) {
			text += "\n";
			text += "Run " + (i + 1) + "\n";
			text += formatSingleRun(analysisHistory[i].loadedLibraries);
			text += "\n";
		}

		return text;
	}

	return {
		format: format
	};
}, true);