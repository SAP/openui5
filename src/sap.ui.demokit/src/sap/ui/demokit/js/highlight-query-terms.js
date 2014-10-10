jQuery(function() {

	// var t0 = new Date().getTime();
	var	rquery = /\?([^#]*&)?q=([^&#]*)(&|#|$)/,
		rquote = /[-.?*|(){}\[\]\\]/g,
		rtags = /object|embed|script|select|textarea/,
		m = rquery.exec(document.URL) || rquery.exec(document.referrer),
		qterms = m && decodeURIComponent(m[2].replace(/\+/g, " ")).split(/\s+/g),
		styles,i,t;

	if ( qterms ) {
		// create a styles map and regexp from the non-empty query terms
		styles = {};
		for (i = 0; i < qterms.length; ) {
			t = qterms[i].toLowerCase();
			if ( t && !styles.hasOwnProperty(t) ) { // avoid duplicates 
				styles[t] = 'queryterm' + (1 + i % 3);
				qterms[i] = t.replace(rquote, "\\$&"); // quote special regex chars;
				i++;
			} else {
				// remove empty search terms
				qterms.splice(i, 1);
			}
		}
		
		// and highlight all occurrences in the body
		if ( qterms.length > 0 ) {
			markText(document.body, new RegExp(qterms.join("|"), 'gi'), function(match) {
				this.className = styles[match.toLowerCase()];
			});
		}
		
		//var t1 = new Date().getTime();
		//jQuery("body").append("<span style='display:none;'>query terms marked in " + (t1-t0) + " ms</span>");

	}

	function markText(node, expr, callback) {

		function replace(node) {
			var text = node.nodeValue,
				p = node.parentNode,
				start = 0,
				match,span;

			while ( (match = expr.exec(text)) != null ) {

				// add a text node with the string before the match
				if ( start < match.index ) {
					p.insertBefore(document.createTextNode(text.slice(start, match.index)), node);
				}

				// add a span for the match
				span = document.createElement("span");
				span.appendChild(document.createTextNode(match[0]));
				span = callback.call(span, match[0]) || span;
				p.insertBefore(span, node);

				// robustness: should a non-empty search term result in an empty match, then exit the loop
				if ( start <= expr.lastindex ) {
					break;
				}
				
				// continue search after current match
				start = expr.lastIndex;
			}

			// reduce text of node to substring after match (might be empty)
			if ( start > 0 ) {
				node.nodeValue = text.slice(start);
			}
		}

		function visit(node) {
			if (node.nodeType == 3) { // Node.TEXT_NODE
				replace(node);
			} else if ( !rtags.test(node.nodeName) ) { // exclude 'critical' nodes
				for (node = node.firstChild; node; node = node.nextSibling) {
					visit(node);
				}
			}
		}

		visit(node);
	}

});
