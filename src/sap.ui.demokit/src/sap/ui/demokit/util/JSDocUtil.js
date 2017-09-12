/*!
 * ${copyright}
 */

// Provides reuse functionality for reading documentation from api.json files (as created by the UI5 JSDoc3 template/plugin)
sap.ui.define(['jquery.sap.global', 'jquery.sap.strings'], function(jQuery) {

	"use strict";

	function defaultLinkFormatter(target, text) {
		return "<code>" + (text || target) + "</code>";
	}

	function format(src, options) {

		options = options || {};
		var beforeParagraph = options.beforeParagraph == null ? '<p>' : options.beforeParagraph;
		var afterParagraph = options.afterParagraph == null ? '</p>' : options.afterParagraph;
		var beforeFirstParagraph = options.beforeFirstParagraph == null ? beforeParagraph : options.beforeFirstParagraph;
		var afterLastParagraph = options.afterLastParagraph == null ? afterParagraph : options.afterLastParagraph;
		var linkFormatter = typeof options.linkFormatter === 'function' ? options.linkFormatter : defaultLinkFormatter;

		/*
		 * regexp to recognize important places in the text
		 *
		 * Capturing groups of the RegExp:
		 *   group 1: begin of a pre block
		 *   group 2: end of a pre block
		 *   group 3: begin of a header, implicitly ends a paragraph
		 *   group 4: end of a header, implicitly starts a new paragraph
		 *   group 5: target portion of an inline @link tag
		 *   group 6: (optional) text portion of an inline link tag
		 *   group 7: an empty line which implicitly starts a new paragraph
		 *
		 *      [-- <pre> block -] [---- some header ----] [---- an inline [@link ...} tag ----] [---------- an empty line ---------]  */
		var r = /(<pre>)|(<\/pre>)|(<h[\d+]>)|(<\/h[\d+]>)|\{@link\s+([^}\s]+)(?:\s+([^\}]*))?\}|((?:\r\n|\r|\n)[ \t]*(?:\r\n|\r|\n))/gi;
		var inpre = false;

		src = src || '';
		linkFormatter = linkFormatter || defaultLinkFormatter;

		src = beforeFirstParagraph + src.replace(r, function(match, pre, endpre, header, endheader, linkTarget, linkText, emptyline) {
			if ( pre ) {
				inpre = true;
			} else if ( endpre ) {
				inpre = false;
			} else if ( header ) {
				if ( !inpre ) {
					return afterParagraph + match;
				}
			} else if ( endheader ) {
				if ( !inpre ) {
					return match + beforeParagraph;
				}
			} else if ( emptyline ) {
				if ( !inpre ) {
					return afterParagraph + beforeParagraph;
				}
			} else if ( linkTarget ) {
				if ( !inpre ) {
					return linkFormatter(linkTarget, linkText);
				}
			}
			return match;
		}) + afterLastParagraph;

		// remove empty paragraphs
		src = src.replace(new RegExp(jQuery.sap.escapeRegExp(beforeParagraph) + "\s*" + jQuery.sap.escapeRegExp(afterParagraph), "g"), "");

		return src;
	}

	return {
		formatTextBlock: format
	};

});
