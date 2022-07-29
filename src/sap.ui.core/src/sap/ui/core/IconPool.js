/*!
 * ${copyright}
 */
sap.ui.define([
	'sap/ui/core/Icon',
	'sap/ui/core/_IconRegistry',
	"sap/base/Log",
	'./Core' // provides sap.ui.getCore()
], function(Icon, _IconRegistry, Log) {
		"use strict";

		/**
		 * The IconPool is a static class for retrieving or registering icons.
		 * It also provides helping methods for easier consumption of icons.
		 * There are already icons registered in IconPool, please use the Demo App named
		 * "Icon Explorer" to find the name of the icon.
		 *
		 * In order to use the icon inside an existing control, please call
		 * {@link sap.ui.core.IconPool.getIconURI} and assign the URI to the control's property
		 * which supports icons.
		 * If you want to support both, icons and standard images in your own control, please use
		 * the static method {@link sap.ui.core.IconPool.createControlByURI} to either create an Icon in
		 * case the first argument is an icon-URL or another control which you define by
		 * providing it as the second argument.
		 *
		 * @namespace
		 * @public
		 * @alias sap.ui.core.IconPool
		 */
		var IconPool = {};

		/**
		 * Creates an instance of {@link sap.ui.core.Icon} if the given URI is an icon URI, otherwise the given constructor is called.
		 * The given URI is set to the src property of the control.
		 *
		 * @param {string|object} setting Contains the properties which will be used to instantiate the returned control.
		 *  All properties of the associated constructor can be used. Unknown properties are ignored.
		 *  It should contain at least a property named src. If it's given with a string type, it will be taken as the value of src property.
		 * @param {function} constructor The constructor function which is called when the given URI isn't an icon URI
		 * @returns {sap.ui.core.Control} Either an instance of <code>sap.ui.core.Icon</code> or instance created by calling the given constructor
		 * @static
		 * @public
		 */
		IconPool.createControlByURI = function (setting, constructor) {
			if (typeof setting === "string") {
				setting = {src: setting};
			}

			if (setting && setting.src) {
				var sSrc = setting.src,
					fnConstructor = constructor;
				if (IconPool.isIconURI(sSrc)) {
					fnConstructor = Icon;
					//converting to press event in case tap is specified
					if (setting.tap) {
						setting.press = setting.tap;
						delete setting.tap;
					}
				}
				if (typeof fnConstructor === "function") {
					// remove unsupported settings (e.g. some for Image/Icon)
					setting = fnConstructor.getMetadata().removeUnknownSettings(setting);
					return new fnConstructor(setting);
				}
			}
		};

		/**
		 * Register an additional icon to the sap.ui.core.IconPool.
		 *
		 * @param {string} iconName the name of the icon.
		 * @param {string} collectionName the name of icon collection. The built in icons are with empty collectionName, so if additional icons need to be registered in IconPool, the collectionName can't be empty.
		 * @param {object} iconInfo the icon info which contains the following properties:
		 * @param {string} iconInfo.fontFamily is the name of the font when importing the font using @font-face in CSS
		 * @param {string|string[]} iconInfo.content is the special hexadecimal code without the prefix, for example "e000" or several of them
		 * @param {boolean} [iconInfo.overWrite=false] indicates if already registered icons should be overwritten when the same name and collection are given. The built in icons can never be overwritten.
		 * @param {boolean} [iconInfo.suppressMirroring=false] indicates whether this icon should NOT be mirrored in RTL (right to left) mode.
		 * @param {module:sap/base/i18n/ResourceBundle} [iconInfo.resourceBundle] ResourceBundle to be used for translation. Key format: "Icon.<iconName>".
		 *
		 * @returns {object} the info object of the registered icon which has the name, collection, uri, fontFamily, content and suppressMirroring properties.
		 * @static
		 * @public
		 * @function
		 */
		IconPool.addIcon = _IconRegistry.addIcon;

		/**
		 * Returns the URI of the icon in the pool which has the given <code>iconName</code> and <code>collectionName</code>.
		 *
		 * @param {string} iconName Name of the icon, must not be empty
		 * @param {string} [collectionName] Name of the icon collection; to access built-in icons, omit the collection name
		 * @returns {string|undefined} URI of the icon or <code>undefined</code> if the icon can't be found in the IconPool
		 * @static
		 * @public
		 * @function
		 */
		IconPool.getIconURI = _IconRegistry.getIconURI;

		/**
		 * Returns an info object for the icon with the given <code>iconName</code> and <code>collectionName</code>.
		 *
		 * Instead of giving name and collection, a complete icon-URI can be provided as <code>iconName</code>.
		 * The method will determine name and collection from the URI, see {@link #.isIconURI IconPool.isIconURI}
		 * for details.
		 *
		 * The returned info object has the following properties:
		 * <ul>
		 * <li><code>string: name</code> Name of the icon</li>
		 * <li><code>string: collection</code> Name of the collection that contains the icon or <code>undefined</code> in case of the default collection</li>
		 * <li><code>string: uri</code> Icon URI that identifies the icon</li>
		 * <li><code>string: fontFamily</code> CSS font family to use for this icon</li>
		 * <li><code>string: content</code> Character sequence that represents the icon in the icon font</li>
		 * <li><code>string: text</code> Alternative text describing the icon (optional, might be empty)</li>
		 * <li><code>boolean: suppressMirroring</code> Whether the icon needs no mirroring in right-to-left mode</li>
		 * </ul>
		 *
		 * @param {string} iconName Name of the icon, or a complete icon-URI with icon collection and icon name;
		 *   must not be empty
		 * @param {string} [collectionName] Name of the icon collection; to access built-in icons,
		 *   omit the collection name
		 * @param {string} [loadingMode="sync"] The approach for loading the icon info, if it is not already available:
		 *   sync - font metadata is loaded synchronously and the icon info is returned immediately
		 *   async - a promise is returned that returns the icon info when the font metadata is loaded
		 *   mixed - until the font metadata is loaded a promise is returned, afterwards the icon info
		 * @returns {object|Promise|undefined} Info object or Promise for the icon depending on the loadingMode
		 *   or <code>undefined</code> when the icon can't be found or no icon name was given.
		 * @static
		 * @public
		 * @function
		 */
		IconPool.getIconInfo = _IconRegistry.getIconInfo;

		/**
		 * Checks if the icon font is loaded
		 * @param {string} sCollectionName icon collection name
		 * @returns {Promise|undefined} a Promise that resolves when the icon font is loaded;
		 *   or <code>undefined</code> if the icon font has not been registered yet
		 * @static
		 * @public
		 * @since 1.56.0
		 */
		IconPool.fontLoaded = function (sCollectionName){
			var mFontRegistry = _IconRegistry.getFontRegistry();
			if (mFontRegistry[sCollectionName]) {
				if (mFontRegistry[sCollectionName].metadataLoaded instanceof Promise) {
					return mFontRegistry[sCollectionName].metadataLoaded;
				} else if (mFontRegistry[sCollectionName].metadataLoaded === true) {
					return Promise.resolve();
				}
			}
		};

		/**
		 * Returns whether the given <code>uri</code> is an icon URI.
		 *
		 * A string is an icon URI when it can be parsed as a URI and when it has one of the two forms
		 * <ul>
		 * <li>sap-icon://collectionName/iconName</li>
		 * <li>sap-icon://iconName</li>
		 * </ul>
		 * where collectionName and iconName must be non-empty.
		 *
		 * @param {string} uri The URI to check
		 * @returns {boolean} Whether the URI matches the icon URI format
		 * @static
		 * @public
		 * @function
		 */
		IconPool.isIconURI = _IconRegistry.isIconURI;

		/**
		 * Returns all names of registered collections in IconPool
		 *
		 * @returns {array} An array contains all of the registered collections' names.
		 * @static
		 * @public
		 * @function
		 */
		IconPool.getIconCollectionNames = _IconRegistry.getIconCollectionNames;

		/**
		 * Returns all name of icons that are registered under the given collection.
		 *
		 * @param {string} collectionName the name of collection where icon names are retrieved.
		 * @returns {array} An array contains all of the registered icon names under the given collection.
		 * @static
		 * @public
		 * @function
		 */
		IconPool.getIconNames = _IconRegistry.getIconNames;

		/**
		 * Adds CSS code to load an icon font to the DOM
		 *
		 * @param {string} sFontFace the file name of the font face
		 * @param {string} sPath the path to the font file
		 * @param {string} [sCollectionName] the collection name, if not specified the font face is used
		 * @static
		 * @public
		 * @function
		 */
		IconPool.insertFontFaceStyle = _IconRegistry.insertFontFaceStyle;

		/**
		 * Registers an additional icon font to the icon pool
		 *
		 * @param {object} oConfig configuration object for registering the font
		 * @param {string} oConfig.fontFamily the file name of the font face
		 * @param {string} [oConfig.collectionName] a collection name for the font, if not specified the font face will be used
		 * @param {sap.ui.core.URI} oConfig.fontURI the location where the font files are physically located
		 * @param {object} [oConfig.metadata] a configuration object mapping the icon name to the hexadecimal icon address in the font
		 * @param {object} [oConfig.metadataURI] an URI to a file containing the configuration object specified with oConfig.metadata
		 * @param {boolean} [oConfig.lazy] load the icon font metadata only when an icon is requested with {@link #.getIconInfo}
		 *   if not specified a JSON file with the name oConfig.fontFamily will be loaded from the location specified in oConfig.fontURI
		 * @static
		 * @public
		 * @since 1.56.0
		 */
		IconPool.registerFont = function (oConfig) {
			oConfig.collectionName = oConfig.collectionName || oConfig.fontFamily;

			// check for mandatory fontURI parameter
			if (!oConfig.fontURI) {
				Log.error("The configuration parameter fontURI is missing, cannot register the font '" + oConfig.collectionName + "'!");
				return;
			}

			// protect the default font family
			if (oConfig.fontFamily === _IconRegistry.sapIconFontFamily) {
				Log.error("The font family" + _IconRegistry.sapIconFontFamily + " is already registered");
				return;
			}

			// add trailing slash if necessary for more convenience
			if (oConfig.fontURI.substr(oConfig.fontURI.length - 1) !== "/") {
				oConfig.fontURI += "/";
			}

			var mFontRegistry = _IconRegistry.getFontRegistry();
			// create an initial configuration for the font
			if (!mFontRegistry[oConfig.collectionName] || mFontRegistry[oConfig.collectionName].metadataLoaded === false) {
				mFontRegistry[oConfig.collectionName] = {
					config: oConfig,
					inserted: false
				};
			} else {
				Log.warning("The font '" + oConfig.collectionName + "' is already registered");
			}

			// load font metadata immediately
			if (!oConfig.lazy) {
				_IconRegistry._loadFontMetadata(oConfig.collectionName, true);
			}
		};

		var mIconForMimeType = {
			"application/msword": "sap-icon://doc-attachment",
			"application/vnd.openxmlformats-officedocument.wordprocessingml.document": "sap-icon://doc-attachment",
			"application/rtf": "sap-icon://doc-attachment",
			"application/pdf": "sap-icon://pdf-attachment",
			"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "sap-icon://excel-attachment",
			"application/vnd.ms-excel": "sap-icon://excel-attachment",
			"application/msexcel": "sap-icon://excel-attachment",
			"application/vnd.ms-powerpoint": "sap-icon://ppt-attachment",
			"application/vnd.openxmlformats-officedocument.presentationml.presentation": "sap-icon://ppt-attachment",
			"application/vnd.openxmlformats-officedocument.presentationml.slideshow": "sap-icon://ppt-attachment",
			"application/mspowerpoint": "sap-icon://ppt-attachment",
			"application/xml": "sap-icon://attachment-html",
			"application/xhtml+xml": "sap-icon://attachment-html",
			"application/x-httpd-php": "sap-icon://attachment-html",
			"application/x-javascript": "sap-icon://attachment-html",
			"application/gzip": "sap-icon://attachment-zip-file",
			"application/x-rar-compressed": "sap-icon://attachment-zip-file",
			"application/x-tar": "sap-icon://attachment-zip-file",
			"application/zip": "sap-icon://attachment-zip-file",
			"audio/voxware": "sap-icon://attachment-audio",
			"audio/x-aiff": "sap-icon://attachment-audio",
			"audio/x-midi": "sap-icon://attachment-audio",
			"audio/x-mpeg": "sap-icon://attachment-audio",
			"audio/x-pn-realaudio": "sap-icon://attachment-audio",
			"audio/x-pn-realaudio-plugin": "sap-icon://attachment-audio",
			"audio/x-qt-stream": "sap-icon://attachment-audio",
			"audio/x-wav": "sap-icon://attachment-audio",
			"image/png": "sap-icon://attachment-photo",
			"image/tiff": "sap-icon://attachment-photo",
			"image/bmp": "sap-icon://attachment-photo",
			"image/jpeg": "sap-icon://attachment-photo",
			"image/gif": "sap-icon://attachment-photo",
			"text/plain": "sap-icon://attachment-text-file",
			"text/comma-separated-values": "sap-icon://attachment-text-file",
			"text/css": "sap-icon://attachment-text-file",
			"text/html": "sap-icon://attachment-text-file",
			"text/javascript": "sap-icon://attachment-text-file",
			"text/richtext": "sap-icon://attachment-text-file",
			"text/rtf": "sap-icon://attachment-text-file",
			"text/tab-separated-values": "sap-icon://attachment-text-file",
			"text/xml": "sap-icon://attachment-text-file",
			"video/mpeg": "sap-icon://attachment-video",
			"video/quicktime": "sap-icon://attachment-video",
			"video/x-msvideo": "sap-icon://attachment-video",
			"application/x-shockwave-flash": "sap-icon://attachment-video"
		};

		/**
		 * Returns the icon url based on the given mime type
		 *
		 * @param {string} sMimeType the mime type of a file (e.g. "application/zip")
		 * @returns {string} the icon url (e.g. "sap-icon://attachment-zip-file")
		 * @static
		 * @public
		 * @since 1.25.0
		 */
		IconPool.getIconForMimeType = function (sMimeType) {
			return mIconForMimeType[sMimeType] || "sap-icon://document";
		};

		return IconPool;

	}, /* bExport= */ true);
