/*!
 * ${copyright}
 */

/**
 * SemanticPage base classes
 *
 * @namespace
 * @name sap.m.semantic
 */

// Provides class sap.m.semantic.SemanticPageSegmentedContainer
sap.ui.define(['jquery.sap.global', 'sap/m/semantic/SemanticPageSegment'], function(jQuery, Segment) {
	"use strict";


	/**
	 * Constructor for a sap.m.semantic.SemanticPageSegmentedContainer.
	 *
	 * @class text
	 * @version ${version}
	 * @private
	 * @since 1.30.0
	 * @alias sap.m.semantic.SemanticPageSegmentedContainer
	 */
	var SegmentedContainer = function(oContainer) {

		if (!oContainer) {
			return;
		}

		var _aSegments = [];

		function addSection(options) {
			if (!options || !options.sTag) {
				//log;
				return;
			}

			if (options.aContent) {
				var aContent = options.aContent;
				var iLength = aContent.length;

				for (var i = 0; i < iLength; i++) {
					oContainer.addContent(aContent[i]);
				}
			}

			var oSegment = new Segment(aContent, oContainer);
			oSegment.fIsValidEntry = options.fIsValidEntry;
			oSegment.sTag = options.sTag;
			oSegment.getStartIndex = function () {

				var iStartIndex = 0;
				var iSectionIndex = jQuery.inArray(this, _aSegments);
				if (iSectionIndex > 0) {
					var iPreviousSectionIndex = iSectionIndex - 1;
					while (iPreviousSectionIndex >= 0) {
						iStartIndex += _aSegments[iPreviousSectionIndex].getContent().length;
						iPreviousSectionIndex--;
					}
				}

				return iStartIndex;
			};

			_aSegments.push(oSegment);
		}

		function getAllFromCompositeSection(aSegments) {

			var aCombined = [];
			for (var i = 0; i < aSegments.length; i++) {
				aCombined = jQuery.merge( aCombined, aSegments[i] );
			}
			return aCombined;
		}

		function addToCompositeSection(oControl, aSegments, oSequenceOrderInfo, bSupressInvalidate) {

			for (var i = 0; i < aSegments.length; i++) {
				var oSection = aSegments[i];
				if (oSection.fIsValidEntry(oControl)) {
					oSection.addContent(oControl, oSequenceOrderInfo, bSupressInvalidate);
					return oControl;
				}
			}
		}

		function insertToCompositeSection(oControl, iIndex, aSegments, oSequenceOrderInfo, bSupressInvalidate) {

			for (var i = 0; i < aSegments.length; i++) {
				var oSection = aSegments[i];
				var iLength = oSection.getContent().length;
				if (iIndex < iLength) {//found section
					if (oSection.fIsValidEntry(oControl)) {
						return oSection.insertContent(oControl, iIndex, oSequenceOrderInfo, bSupressInvalidate);
					}
					return this.addToCompositeSection(oControl, aSegments, oSequenceOrderInfo, bSupressInvalidate);	//add to own section
				}
				iIndex -= iLength; //continue to next section
			}
		}

		function indexInCompositeSection(oControl, aSegments) {
			var iIndex = 0;
			for (var i = 0; i < aSegments.length; i++) {
				var oSection = aSegments[i];
				if (oSection.fIsValidEntry(oControl)) {
					var iIndexInLocalSection = oSection.indexOfContent(oControl);
					if (iIndexInLocalSection > -1) { //found
						iIndex += iIndexInLocalSection;
						return iIndex;
					}
				} else {
					iIndex += oSection.getContent().length;
				}
			}
			return -1; // not found
		}

		function removeFromCompositeSection(oControl, aSegments, bSupressInvalidate) {
			var oRemoved = null;
			for (var i = 0; i < aSegments.length; i++) {
				var oSection = aSegments[i];
				if (oSection.fIsValidEntry(oControl)) {
					var oRemoved = oSection.removeContent(oControl, bSupressInvalidate);
					if (oRemoved != null) {
						break;
					}
				}
			}
			return oRemoved;
		}

		function removeAllFromCompositeSection(aSegments, bSupressInvalidate) {
			var aRemoved = [];
			for (var i = 0; i < aSegments.length; i++) {
				aRemoved = jQuery.merge( aRemoved, aSegments[i].removeAllContent(bSupressInvalidate) );
			}
			return aRemoved;
		}

		function destroyAllFromCompositeSection(aSegments, bSupressInvalidate) {
			for (var i = 0; i < aSegments.length; i++) {
				aSegments[i].destroy(bSupressInvalidate);
			}
		}

		function getSectionComposite(sTag) {

			var aSegments = [];
			jQuery.each(_aSegments, function(i, aSection) {
				if (aSection.sTag === sTag) {
					aSegments.push(aSection);
				}
			});

			if (!aSegments) {
				return;
			}

			if (aSegments && aSegments.length === 1) {
				return aSegments[0];
			}

			return {
				getContent: function() {
					return getAllFromCompositeSection(aSegments);
				},

				addContent: function(oControl, oSequenceOrderInfo, bSupressInvalidate) {
					return addToCompositeSection(oControl, aSegments, oSequenceOrderInfo, bSupressInvalidate);
				},

				insertContent: function(oControl, iIndex, oSequenceOrderInfo, bSupressInvalidate) {
					return insertToCompositeSection(oControl, iIndex, aSegments, oSequenceOrderInfo, bSupressInvalidate);
				},

				indexOfContent: function(oControl) {
					return indexInCompositeSection(oControl, aSegments);
				},

				removeContent: function(oControl, bSupressInvalidate) {
					return removeFromCompositeSection(oControl, aSegments, bSupressInvalidate);
				},

				removeAllContent: function(bSupressInvalidate) {
					return removeAllFromCompositeSection(aSegments, bSupressInvalidate);
				},

				destroy: function(bSupressInvalidate) {
					destroyAllFromCompositeSection(aSegments, bSupressInvalidate);
				}

			};
		}

		return {
			addSection: addSection,
			getSectionComposite: getSectionComposite

		};
	};

	return SegmentedContainer;

}, /* bExport= */ false);
