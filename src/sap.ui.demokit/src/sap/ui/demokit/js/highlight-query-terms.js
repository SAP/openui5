(function() {

	/*
	 * Number of styles that are defined in the CSS.
	 * If there are more query terms than styles, the same style will be applied to each 'N_STYLES'th term.
	 */
	var N_STYLES = 3;

	/*
	 * Search the query parameters of the document URL and the referrer URL for Google-like query terms
	 * (parameter name 'q'). If found, create a regular expression to find occurrences of any of the terms
	 * and a map of CSS classes to be applied to each match. The map uses the lower case version of each term as key.
	 *
	 * @returns {{regexp:RegExp, classes:object}} info object
	 */
	function makeQueryInfo() {

		var rparam = /[^?#]*\?([^#]*&)?q=([^&#]*)(&|#|$)/,
			rquote = /[.?*+|(){}\[\]\\]/g,
			match = rparam.exec(document.URL) || rparam.exec(document.referrer),
			qterms = match && decodeURIComponent(match[2].replace(/\+/g, " ")).split(/\s+/g),
			classes,i,t;

		if ( qterms ) {

			// create a styles map and regexp from the non-empty query terms
			classes = {};
			for (i = 0; i < qterms.length; ) {
				t = qterms[i].toLowerCase();
				if ( t && !classes.hasOwnProperty(t) ) { // ignore duplicates and empty terms
					classes[t] = 'queryterm' + (1 + i % N_STYLES);
					qterms[i] = t.replace(rquote, "\\$&"); // quote special regex chars;
					i++;
				} else {
					// remove empty or redundant search terms
					qterms.splice(i, 1);
				}
			}

			// if there are terms, return an info object with regex and style map
			if ( qterms.length > 0 ) {
				return {
					regexp: new RegExp(qterms.join("|"), 'gi'),
					classes: classes
				};
			}

		}

		// return undefined
	}


	/*
	 * Execute the given callback once the DOM is ready (which might already be the case).
	 */
	function whenReady(callback) {

		function onLoaded() {
			document.removeEventListener( "DOMContentLoaded", onLoaded, false );
			callback();
		}

		if ( document.readyState === 'complete' ) {
			callback();
		} else {
			document.addEventListener( "DOMContentLoaded", onLoaded, false );
		}
	}

	/*
	 * Loops over all text nodes in the given subtree and searches for text fragments
	 * that match the given RegExp. Each match is wrapped in its own span and the
	 * span is given the class corresponding to the match.
	 */
	function markText(node, expr, classes) {

		/* Names of Element nodes whose children must not be visited */
		var rtags = /object|embed|script|select|textarea/i;

		function replace(node) {
			var text = node.nodeValue,
				p = node.parentNode,
				start = 0,
				match,span;

			while ( (match = expr.exec(text)) != null ) {

				// add a new text node with the string before the match
				if ( start < match.index ) {
					p.insertBefore(document.createTextNode(text.slice(start, match.index)), node);
				}

				// add a span for the match
				span = document.createElement("span");
				span.appendChild(document.createTextNode(match[0]));
				span.className = classes[match[0].toLowerCase()];
				p.insertBefore(span, node);

				// robustness: should a non-empty search term result in an empty match, then exit the loop
				if ( start <= expr.lastindex ) {
					break;
				}

				// continue search after current match
				start = expr.lastIndex;
			}

			// if there was any match, then reduce the text of original text node
			// to the substring after the last match (might be empty)
			if ( start > 0 ) {
				node.nodeValue = text.slice(start);
			}
		}

		function visit(node) {
			if (node.nodeType == 3) { // Node.TEXT_NODE
				replace(node);
			} else if ( !rtags.test(node.nodeName) ) { // skip 'critical' nodes
				for (node = node.firstChild; node; node = node.nextSibling) {
					visit(node);
				}
			}
		}

		visit(node);
	}

	// avoid multiple executions
	if ( document.documentElement.getAttribute('data-highlight-query-terms') ) {
		return;
	}
	document.documentElement.setAttribute('data-highlight-query-terms', 'pending');

	/*
	 * Check if there are query terms given.
	 * If so, mark their occurrences in the body of this page.
	 */
	var oQueryInfo = makeQueryInfo();
	if ( oQueryInfo ) {
		whenReady(function() {
			markText(document.body, oQueryInfo.regexp, oQueryInfo.classes);
			document.documentElement.setAttribute('data-highlight-query-terms', 'done');
		});
	}

}());
