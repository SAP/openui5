/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/m/IllustrationPool"
],
	function(IllustrationPool) {
		"use strict";

		/**
		 * <code>IllustrationPool</code> loads the illustration assets (SVGs) via XMLHttpRequest requests.
		 *
		 * The successfully loaded data is kept in the DOM (div with ID <code>sap-illustration-pool</code>)
		 * in the <code>sap-ui-static</code> DOM element.
		 *
		 * To load a given asset, register its illustration set through the
		 * {@link sap.m.IllustrationPool#sap.m.IllustrationPool.registerIllustrationSet registerIllustrationSet} API of <code>IllustrationPool</code>.
		 * The exception being the <code>sapIllus</code>, which is the default illustration set
		 * that is registered by default.
		 *
		 * The default behavior of <code>IllustrationPool</code> is to load/require an asset only
		 * when it's needed by using the {@link sap.m.IllustrationPool#sap.m.IllustrationPool.loadAsset loadAsset} API.
		 * When registering the new illustration set, you are given the option to load all of its assets.
		 *
		 * If some of the assets are not loaded initially, you can load the rest of them on
		 * a later state with the {@link sap.m.IllustrationPool#sap.m.IllustrationPool.loadRestOfTheAssets loadRestOfTheAssets} API.
		 *
		 * @namespace
		 * @deprecated as of version 1.98. Use the {@link sap.m.IllustrationPool} instead.
		 * @since 1.88
		 * @public
		 * @name sap.f.IllustrationPool
		 */

		return IllustrationPool;

	}, /* bExport= */ true);
