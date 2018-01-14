/*!
 * ${copyright}
 */

/*global Node, window */
/*
 * A polyfill for document.baseURI (mainly targeting IE11).
 *
 * Implemented as a property getter to also support dynamically created &lt;base&gt; tags.
 */
if ( !('baseURI' in Node.prototype) ) {
	Object.defineProperty(Node.prototype, 'baseURI', {
		get: function() {
			var doc = this.ownerDocument || this, // a Document node returns ownerDocument null
				// look for first base tag with an href attribute
				// (https://html.spec.whatwg.org/multipage/urls-and-fetching.html#document-base-url )
				baseOrLoc = doc.querySelector("base[href]") || window.location;
			return baseOrLoc.href;
		},
		configurable: true
	});
}