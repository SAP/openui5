/*!
 * ${copyright}
 */

// Provides implementation of sap.ui.demokit.util.jsanalyzer.Doclet
sap.ui.define(['jquery.sap.global'],
	function (jQuery, esprima_) {

		"use strict";

		/* ---- private functions ---- */

		/**
		 * Removes the mandatory comment markers and the optional but common asterisks at the beginning of each line.
		 *
		 * The result is easier to parse/analyze.
		 *
		 * @param {string} comment Comment to unwrap
		 * @return {string} Unwrapped comment
		 * @private
		 */
		function unwrap(comment) {

			if (!comment) {
				return '';
			}

			return comment.replace(/^\/\*\*+/, '')                // remove opening slash+stars
				.replace(/\*+\/$/, '')                            // remove closing star+slash
				.replace(/(^|\r\n|\r|\n)([ \t*]*[ \t]*)/g, '$1'); // remove left margin

		}

		var rtag = /((?:^|\r\n|\r|\n)[ \t]*@)([a-zA-Z][-_a-zA-Z0-9]*)/g;

		/**
		 * Creates a Doclet from the given comment string
		 * @param {string} comment Comment string.
		 * @constructor
		 * @private
		 */
		function Doclet(comment) {

			this.comment = comment = unwrap(comment);
			this.tags = [];

			var m;
			var lastContent = 0;
			var lastTag = "description";
			while ((m = rtag.exec(comment)) != null) {
				this._addTag(lastTag, comment.slice(lastContent, m.index));
				lastTag = m[2];
				lastContent = rtag.lastIndex;
			}
			this._addTag(lastTag, comment.slice(lastContent));
		}

		Doclet.prototype._addTag = function (tag, content) {
			if (/^(public|private|protected)$/.test(tag)) {
				this.visibility = tag;
			} else if (/^(classdesc|description|deprecated|experimental|since|name|alias|type)$/.test(tag)) {
				this[tag] = jQuery.trim(content);
			} else if (tag === "class") {
				content = jQuery.trim(content);
				if (content.split(/\s+/).length > 1) {
					this.classdesc = content;
				}
			} else {
				this.tags.push({tag: tag, content: jQuery.trim(content)});
			}
		};

		Doclet.prototype.isPublic = function () {
			return this.visibility === 'public';
		};

		Doclet.get = function (node) {
			var comment = null;
			var leadingComments = node.leadingComments;

			if (jQuery.isArray(leadingComments)) {
				for (var i = 0; i < leadingComments.length; i++) {
					if (leadingComments[i].value && /^\*/.test(leadingComments[i].value)) {
						comment = leadingComments[i].value;
					}
				}
			}

			return comment ? new Doclet(comment) : null;
		};

		return Doclet;

	}, true);
