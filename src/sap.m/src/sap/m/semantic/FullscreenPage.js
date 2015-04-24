/*!
 * ${copyright}
 */
sap.ui.define(["sap/m/semantic/ShareMenuPage", "sap/m/semantic/SemanticType", "sap/m/semantic/SemanticPageRenderer"], function(ShareMenuPage, SemanticType, SemanticPageRenderer) {
	"use strict";

	/**
	 * Constructor for a new FullscreenPage
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * A FullscreenPage is a {@link sap.m.semantic.ShareMenuPage} that is restricted to include only semantic controls of the following semantic types:
	 *
	 * <ul>
	 * <li>{@link SemanticType.Add}</li>
	 * <li>{@link SemanticType.Approve}</li>
	 * <li>{@link SemanticType.Reject}</li>
	 * <li>{@link SemanticType.Forward}</li>
	 * <li>{@link SemanticType.Edit}</li>
	 * <li>{@link SemanticType.Save}</li>
	 * <li>{@link SemanticType.Cancel}</li>
	 * <li>{@link SemanticType.Flag}</li>
	 * <li>{@link SemanticType.Favorite}</li>
	 * <li>{@link SemanticType.OpenIn}</li>
	 * <li>{@link SemanticType.SendEmail}</li>
	 * <li>{@link SemanticType.DiscussInJam}</li>
	 * <li>{@link SemanticType.ShareInJam}</li>
	 * <li>{@link SemanticType.SendMessage}</li>
	 * <li>{@link SemanticType.Print}</li>
	 * <li>{@link SemanticType.MessagesIndicator}</li>
	 * </ul>
	 *
	 * @extends sap.m.semantic.ShareMenuPage
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.30.0
	 * @alias sap.m.semantic.FullscreenPage
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var FullscreenPage = ShareMenuPage.extend("sap.m.semantic.FullscreenPage", /** @lends sap.m.semantic.FullscreenPage.prototype */ {
		renderer: SemanticPageRenderer.render
	});

	FullscreenPage.prototype.aAllowedTypes = [
		SemanticType.Add,
		SemanticType.Approve,
		SemanticType.Reject,
		SemanticType.Forward,
		SemanticType.Edit,
		SemanticType.Save,
		SemanticType.Cancel,
		SemanticType.Flag,
		SemanticType.Favorite,
		SemanticType.OpenIn,
		SemanticType.DiscussInJam,
		SemanticType.SaveAsTile,
		SemanticType.SendEmail,
		SemanticType.SendMessage,
		SemanticType.ShareInJam,
		SemanticType.Print,
		SemanticType.MessagesIndicator
	];


	return FullscreenPage;
}, /* bExport= */ true);
