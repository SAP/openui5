/*!
 * ${copyright}
 */

sap.ui.define([], function() {
	"use strict";


	/**
	 * Feed renderer.
	 * @namespace
	 */
	var FeedRenderer = {
	};


	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} rm the RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.ui.core.Control} oFeed an object representation of the control that should be rendered
	 */
	FeedRenderer.render = function(rm, oFeed){
		// write the HTML into the render manager
	    rm.write('<div');
	    rm.writeControlData(oFeed);
		rm.addClass('sapUiFeed');
		rm.writeClasses();
	    rm.write('>');

	    //feeder
		rm.renderControl(oFeed.oFeeder);

	    rm.write('<header class=sapUiFeedTitle ><h4>');
	    //titlebar
	    var sTitle = oFeed.getTitle();
	    if (!sTitle || sTitle == "") {
			// use default title
			sTitle = oFeed.rb.getText('FEED_TITLE');
		}
		rm.writeEscaped(sTitle);
		//menu button (only if exist)
		if (oFeed.oToolsButton) {
			rm.renderControl(oFeed.oToolsButton);
		}
	    //live-button (alsways must exist)
		rm.renderControl(oFeed.oLiveButton);
	    rm.write('</h4>');

	    //toolbar
	    rm.write('<div class="sapUiFeedToolbar" >');
		rm.renderControl(oFeed.oFilter);
		rm.renderControl(oFeed.oSearchField);

	    rm.write('</div>');
	    rm.write('</header>');

	    //Chunks
	    rm.write('<section>');
	    for ( var i = 0; i < oFeed.getChunks().length; i++) {
			var oChunk = oFeed.getChunks()[i];
			rm.renderControl(oChunk);
		}

	    rm.write('</section>');

	    rm.write('</div>');

	};


	return FeedRenderer;

}, /* bExport= */ true);
