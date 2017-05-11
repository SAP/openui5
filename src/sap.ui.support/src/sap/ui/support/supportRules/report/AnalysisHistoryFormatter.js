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
        var text = _horizontalSeparator + "\n";
        // Use the first issue to get the rule properties.
        text += _verticalSeparator + formatString("rule id: " + rule[0].ruleId, 193) + _verticalSeparator + "\n";
        text += _verticalSeparator + formatString("name: " + rule[0].name, 193) + _verticalSeparator + "\n";
        text += _verticalSeparator + formatString("library: " + rule[0].ruleLibName, 193) + _verticalSeparator + "\n";
        text += _verticalSeparator + formatString("categories: " + rule[0].categories.join(", "), 193) + _verticalSeparator + "\n";
        text += _verticalSeparator + formatString("audiences: " + rule[0].audiences.join(", "), 193) + _verticalSeparator + "\n";
        text += _verticalSeparator + formatString("description: " + rule[0].description, 193) + _verticalSeparator + "\n";
        text += _verticalSeparator + formatString("resolution: " + rule[0].resolution, 193) + _verticalSeparator + "\n";
        text += _horizontalSeparator + "\n";
        text += _verticalSeparator + formatString("id", 50);
        text += _verticalSeparator + formatString("class name", 30);
        text += _verticalSeparator + formatString("status", 10);
        text += _verticalSeparator + formatString("details", 100);
        text += _verticalSeparator + "\n";
        text += _horizontalSeparator + "\n";

        for (var i = 0; i < rule.length; i++) {
            text += _verticalSeparator + formatString(rule[i].context.id, 50);
            text += _verticalSeparator + formatString(rule[i].context.className, 30);
            text += _verticalSeparator + formatString(rule[i].severity, 10);
            text += _verticalSeparator + formatString(rule[i].details, 100);
            text += _verticalSeparator + "\n";
        }

        text += _horizontalSeparator + "\n";

        return text;
    }

    function formatSingleRun(libraries) {
        var text = "";

        if (!libraries) {
            return text;
        }

        for (var lib in libraries) {
            for (var rule in libraries[lib]) {
                text += formatRule(libraries[lib][rule]);
            }

            text += "\n";
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
            text += formatSingleRun(analysisHistory[i].issues);
            text += "\n";
        }

        return text;
    }

    return {
		format: format
	};
}, true);