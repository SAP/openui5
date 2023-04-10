/*!
 * ${copyright}
 */

sap.ui.define([
    "sap/m/library",
    "sap/base/strings/capitalize",
    "sap/base/assert",
    "sap/m/Image",
    "sap/ui/core/Icon",
    "sap/ui/core/IconPool"
],
    function (
        mLibrary,
        capitalize,
        assert,
        Image,
        Icon,
        IconPool
    ) {
        "use strict";
        /**
             * Helper for Images.
             *
             * @namespace
             * @since 1.12
             * @protected
             */
        var ImageHelper = {};

        /**
         * Checks if value is not undefined, in which case the
         * setter function for a given property is called.
         * Returns true if value is set, false otherwise.
         *
         * @private
         */
        function checkAndSetProperty(oControl, property, value) {
            if (value !== undefined) {
                var fSetter = oControl["set" + capitalize(property)];
                if (typeof (fSetter) === "function") {
                    fSetter.call(oControl, value);
                    return true;
                }
            }
            return false;
        }
        /** @lends sap.m.ImageHelper */
        /**
         * Creates or updates an image control.
         *
         * @param {string} sImgId UD of the image to be dealt with.
         * @param {sap.m.Image} oImage The image to update. If undefined, a new image will be created.
         * @param {sap.ui.core.Control} oParent oImageControl's parentControl.
         * @param {object} mProperties Settings for the image control; the <code>src</code> property
         * MUST be contained; the keys of the object must be valid names of image settings
         * @param {string[]} aCssClassesToAdd Array of CSS classes which will be added if the image needs to be created.
         * @param {string[]} aCssClassesToRemove All CSS classes that oImageControl has and which are contained in this array
         * are removed before adding the CSS classes listed in aCssClassesToAdd.
         * @returns {sap.m.Image|sap.ui.core.Icon} The new or updated image control or icon
         *
         * @protected
         */
        ImageHelper.getImageControl = function (sImgId, oImage, oParent, mProperties, aCssClassesToAdd, aCssClassesToRemove) {
            assert(mProperties.src, "sap.m.ImageHelper.getImageControl: mProperties do not contain 'src'");

            // make sure, image is rerendered if icon source has changed
            if (oImage && (oImage.getSrc() != mProperties.src)) {
                oImage.destroy();
                oImage = undefined;
            }
            // update or create image control
            if (oImage && (oImage instanceof Image || oImage instanceof Icon)) {
                //Iterate through properties
                for (var key in mProperties) {
                    checkAndSetProperty(oImage, key, mProperties[key]);
                }
            } else {
                //add 'id' to properties. This is required by utility method 'createControlByURI'
                var mSettings = Object.assign({}, mProperties, { id: sImgId });
                oImage = IconPool.createControlByURI(mSettings, sap.m.Image);
                //Set the parent so the image gets re-rendered, when the parent is
                oImage.setParent(oParent, null, true);
            }

            //Remove existing style classes which are contained in aCssClassesToRemove
            //(the list of CSS classes allowed for deletion) to have them updated later on
            //Unfortunately, there is no other way to do this but remove
            //each class individually
            if (aCssClassesToRemove) {
                for (var l = 0, removeLen = aCssClassesToRemove.length; l !== removeLen; l++) {
                    oImage.removeStyleClass(aCssClassesToRemove[l]);
                }
            }
            //Add style classes if necessary
            if (aCssClassesToAdd) {
                for (var k = 0, len = aCssClassesToAdd.length; k !== len; k++) {
                    oImage.addStyleClass(aCssClassesToAdd[k]);
                }
            }
            return oImage;
        };

        mLibrary.ImageHelper = ImageHelper;

        return ImageHelper;

    });