/*!
 * ${copyright}
 */

// Provides (optional) base class for all renderers
sap.ui.define([
	"sap/base/util/isPlainObject",
	"sap/base/util/ObjectPath",
	"sap/base/assert",
	"sap/ui/thirdparty/jquery"
], function(isPlainObject, ObjectPath, assert, jQuery) {
	"use strict";

	/**
	 * @classdesc Base Class for a Renderer.
	 *
	 * @author SAP SE
	 * @version ${version}
	 * @namespace
	 * @public
	 * @alias sap.ui.core.Renderer
	 */
	var Renderer = {
	};

	// shortcut for lazy required Core library
	var sapUiCore;

	/**
	 * Helper to create a new renderer by extending an existing one.
	 *
	 * @this {sap.ui.core.Renderer} The base renderer to extend
	 * @param {string} sName Global name of the new renderer
	 * @param {object} oRendererInfo Methods and static properties of the new renderer
	 * @returns {object} New static renderer class
	 * @private
	 */
	function createExtendedRenderer(sName, oRendererInfo) {

		assert(this != null, 'BaseRenderer must be a non-null object');
		assert(typeof sName === 'string' && sName, 'Renderer.extend must be called with a non-empty name for the new renderer');
		assert(oRendererInfo == null ||
			(isPlainObject(oRendererInfo)
			 && Object.keys(oRendererInfo).every(function(key) { return oRendererInfo[key] !== undefined; })),
			'oRendererInfo can be omitted or must be a plain object without any undefined property values');

		var oChildRenderer = Object.create(this);
		// subclasses should expose the modern signature variant only
		oChildRenderer.extend = createExtendedRenderer;
		jQuery.extend(oChildRenderer, oRendererInfo);

		// expose the renderer globally
		ObjectPath.set(sName, oChildRenderer);

		return oChildRenderer;
	}

	/**
	 * Creates a new renderer that extends a given renderer.
	 *
	 * This method can be used with two signatures that are explained below. In both variants, the returned
	 * renderer inherits all properties (methods, fields) from the given parent renderer. Both variants
	 * also add an 'extend' method to the created renderer that behaves like the modern signature variant of
	 * this <code>Renderer.extend</code> method, but allows to extend the new renderer instead of
	 * <code>sap.ui.core.Renderer</code>.
	 *
	 *
	 * <h3>Modern Signature</h3>
	 *
	 * In the modern signature variant, two parameters must be given: a qualified name for the new renderer
	 * (its global name, in dot-notation), and an optional object literal that contains methods or fields
	 * to be added to the new renderer class.
	 *
	 * This signature has been designed to resemble the class extension mechanism as provided by
	 * {@link sap.ui.base.Object.extend Object.extend}.
	 *
	 * <pre>
	 * sap.ui.define(['sap/ui/core/Renderer'],
	 *     function(Renderer) {
	 *     "use strict";
	 *
	 *     var LabelRenderer = Renderer.extend('sap.m.LabelRenderer', {
	 *         render: function(oRM, oControl) {
	 *
	 *             renderPreamble(oRM, oControl);
	 *
	 *             // implementation core renderer logic here
	 *
	 *             renderPostamble(oRM, oControl);
	 *
	 *         },
	 *
	 *         renderPreamble : function(oRM, oControl) {
	 *         ...
	 *         },
	 *
	 *         renderPostamble : function(oRM, oControl) {
	 *         ...
	 *         }
	 *
	 *     });
	 *
	 *     return LabelRenderer;
	 * });
	 * </pre>
	 *
	 * The extension of renderers works across multiple levels. A <code>FancyLabelRenderer</code> can
	 * extend the above <code>LabelRenderer</code>:
	 *
	 * <pre>
	 * sap.ui.define(['sap/m/LabelRenderer'],
	 *     function(LabelRenderer) {
	 *     "use strict";
	 *
	 *     var FancyLabelRenderer = LabelRenderer.extend('sap.mylib.FancyLabelRenderer', {
	 *         render: function(oRM, oControl) {
	 *
	 *             // call base renderer
	 *             LabelRenderer.renderPreamble(oRM, oControl);
	 *
	 *             // ... do your own fancy rendering here
	 *
	 *             // call base renderer again
	 *             LabelRenderer.renderPostamble(oRM, oControl);
	 *         }
	 *     });
	 *
	 *     return FancyLabelRenderer;
	 * });
	 * </pre>
	 *
	 * <b>Note:</b> The modern signature no longer requires the <code>bExport</code> flag to be set for
	 * the enclosing {@link sap.ui.define} call. The Renderer base class takes care of the necessary
	 * global export of the renderer. This allows non-SAP developers to write a renderer that complies with
	 * the documented restriction for <code>sap.ui.define</code> (no use of bExport = true outside
	 * sap.ui.core projects).
	 *
	 *
	 * <h3>Deprecated Signature</h3>
	 *
	 * The deprecated old signature expects just one parameter: a renderer that should be extended.
	 * With that signature, the renderer can't be exported globally as the name of the renderer class
	 * is not known.
	 *
	 * For compatibility reasons, the class created by the deprecated signature contains a property
	 * <code>_super</code> that references the parent class. It shouldn't be used by applications / control
	 * developers as it doesn't work reliably for deeper inheritance chains: if the old variant of
	 * <code>Renderer.extend</code> is used on two or more levels of the inheritance hierarchy, the
	 * <code>_super</code> property of the resulting renderer class will always point to the implementation
	 * of the base renderer of the last call to extend. Instead of using <code>this._super</code>, renderer
	 * implementations should use the new signature variant and access the base implementation of a method
	 * via the AMD reference to the base renderer (as shown in the FancyLabelRenderer example above).
	 *
	 *
	 * <h3>Use as a Generic Method</h3>
	 *
	 * Only renderers that have been created with a call to <code>extend</code> will get their own
	 * <code>extend</code> method to create new subclasses. To allow extending from older renderers
	 * that have been written from scratch as a plain object, the <code>Renderer.extend</code> method
	 * can be called as a <i>generic method</i>, providing the base renderer as <code>this</code>.
	 *
	 * Example: Derive from <code>HBoxRenderer</code> (which is assumed to be a plain object)
	 * <pre>
	 * sap.ui.define(['sap/ui/core/Renderer', 'sap/m/HBoxRenderer'],
	 *     function(Renderer, HBoxRenderer) {
	 *     "use strict";
	 *
	 *     // Call 'extend' as a generic method, providing the HBoxRenderer as 'this'
	 *     var MyRenderer = Renderer.extend.call(HBoxRenderer, 'sap.m.LabelRenderer', {
	 *
	 *         someOverriddenHook: function(oRM, oControl) {
	 *         ...
	 *         },
	 *
	 *     });
	 *
	 *     return LabelRenderer;
	 * });
	 * </pre>
	 *
	 * <b>Note:</b> The deprecated signature cannot be used generically, it is only supported
	 * when called on <code>sap.ui.core.Renderer</code>.
	 *
	 * @this {sap.ui.core.Renderer} The renderer to extend from
	 * @param {string|object} vName Either the name of the new renderer class (modern signature) or the base
	 *                              renderer to extend (deprecated signature)
	 * @param {object} [oRendererInfo] Methods and/or properties that should be added to the new renderer class
	 * @throws {TypeError} When called as a generic method with the deprecated signature (<code>vName</code> is
	 *                     an object and <code>this</code> is not the <code>sap.ui.core.Renderer</code> class)
	 * @returns {object} A new renderer that can be enriched further
	 * @public
	 * @static
	 */
	Renderer.extend = function(vName, oRendererInfo) {
		if ( typeof vName === 'string' ) {
			// new call variant with name: create static 'subclass'
			return createExtendedRenderer.call(this, vName, oRendererInfo);
		} else if ( this === Renderer ) {
			// old variant without name: create static 'subclass' of Renderer itself
			var oChildRenderer = Object.create(vName || null);
			oChildRenderer._super = vName;
			oChildRenderer.extend = createExtendedRenderer;
			return oChildRenderer;
		} else {
			throw new TypeError("The signature extend(BaseRenderer) without a name can only be called on sap.ui.core.Renderer");
		}
	};

	/**
	 * Returns the TextAlignment for the provided configuration.
	 *
	 * @param {sap.ui.core.TextAlign} oTextAlign the text alignment of the Control
	 * @param {sap.ui.core.TextDirection} oTextDirection the text direction of the Control
	 * @returns {string} the actual text alignment that must be set for this environment
	 * @protected
	 */
	Renderer.getTextAlign = function(oTextAlign, oTextDirection) {
		// lazy require sap.ui.core library
		if (!sapUiCore) {
			sapUiCore = sap.ui.requireSync("sap/ui/core/library");
		}

		// create shortcuts for enums from sap.ui.core library
		var TextAlign = sapUiCore.TextAlign;
		var TextDirection = sapUiCore.TextDirection;

		var sTextAlign = "",
			bRTL = sap.ui.getCore().getConfiguration().getRTL();

		switch (oTextAlign) {
		case TextAlign.End:
			switch (oTextDirection) {
			case TextDirection.LTR:
				sTextAlign = "right";
				break;
			case TextDirection.RTL:
				sTextAlign = "left";
				break;
			default:
				// this is really only influenced by the SAPUI5 configuration. The browser does not change alignment with text-direction
				sTextAlign = bRTL ? "left" : "right";
				break;
			}
			break;
		case TextAlign.Begin:
			switch (oTextDirection) {
			case TextDirection.LTR:
				sTextAlign = "left";
				break;
			case TextDirection.RTL:
				sTextAlign = "right";
				break;
			default:
				sTextAlign = bRTL ? "right" : "left";
				break;
			}
			break;
		case TextAlign.Right:
			if (!bRTL || oTextDirection == TextDirection.LTR) {
				sTextAlign = "right";
			}
			break;
		case TextAlign.Center:
			sTextAlign = "center";
			break;
		case TextAlign.Left:
			if (bRTL || oTextDirection == TextDirection.RTL) {
				sTextAlign = "left";
			}
			break;
		// no default
		}
		return sTextAlign;
	};

	return Renderer;

}, /* bExport= */ true);