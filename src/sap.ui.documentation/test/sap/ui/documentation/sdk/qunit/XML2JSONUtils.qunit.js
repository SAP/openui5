/*global QUnit*/
sap.ui.define([
	"sap/ui/documentation/sdk/controller/util/XML2JSONUtils"
], function (XML2JSONUtils) {
	"use strict";

	QUnit.module("XML2JSONUtils", {

	});

	QUnit.test("removeHTMLTags test case #1", function (assert) {
		var html = "This is a <code>code</code> block. Here is a <p>paragraph</p>.";

		assert.strictEqual(XML2JSONUtils.removeHTMLTags(html, ["code"]), "This is a <code>code</code> block. Here is a paragraph.", "Preserve code tags");
		assert.strictEqual(XML2JSONUtils.removeHTMLTags(html, ["p"]), "This is a code block. Here is a <p>paragraph</p>.", "Preserve p tags");
		assert.strictEqual(XML2JSONUtils.removeHTMLTags(html, []), "This is a code block. Here is a paragraph .", "Remove all tags");
		assert.strictEqual(XML2JSONUtils.removeHTMLTags(html), "This is a code block. Here is a paragraph .", "Remove all tags");
	});

	QUnit.test("removeHTMLTags test case #2", function (assert) {
		var html = "<h1>This is an h1 heading</h1> <p>This is a paragraph.</p> <ul> <li>This is a list item</li> <li>This is another list item</li> </ul> <ol> <li>This is an ordered list item</li> <li>This is another ordered list item</li> </ol>";

		assert.strictEqual(XML2JSONUtils.removeHTMLTags(html, ["h1"]), "<h1>This is an h1 heading</h1> This is a paragraph. This is a list item This is another list item This is an ordered list item This is another ordered list item ", "Preserve h1 tags");
		assert.strictEqual(XML2JSONUtils.removeHTMLTags(html, ["h1", "p"]), "<h1>This is an h1 heading</h1> <p>This is a paragraph.</p> This is a list item This is another list item This is an ordered list item This is another ordered list item ", "Preserve h1 and p tags");
		assert.strictEqual(XML2JSONUtils.removeHTMLTags(html, ["ul", "li"]), "This is an h1 heading This is a paragraph. <ul> <li>This is a list item</li> <li>This is another list item</li> </ul> <li>This is an ordered list item</li> <li>This is another ordered list item</li> ", "Preserve ul and li tags");
		assert.strictEqual(XML2JSONUtils.removeHTMLTags(html, []), " This is an h1 heading This is a paragraph. This is a list item This is another list item This is an ordered list item This is another ordered list item ", "Remove all tags");
		assert.strictEqual(XML2JSONUtils.removeHTMLTags(html), " This is an h1 heading This is a paragraph. This is a list item This is another list item This is an ordered list item This is another ordered list item ", "Remove all tags");
	});
});