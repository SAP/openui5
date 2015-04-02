/*!
 * ${copyright}
 */

sap.ui.define([ "sap/m/semantic/SemanticPage", "sap/m/semantic/SemanticType", "sap/m/semantic/SemanticPageRenderer" ], function(SemanticPage, SemanticType, SemanticPageRenderer) {
	"use strict";

	/**
	 * Constructor for a new MasterPage
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * A MasterPage is a {@link sap.m.semantic.SemanticPage} that is restricted to include only semantic controls of the following semantic types:
	 *
	 * <ul>
	 * <li>{@link SemanticType.Add}</li>
	 * <li>{@link SemanticType.Approve}</li>
	 * <li>{@link SemanticType.Reject}</li>
	 * <li>{@link SemanticType.Forward}</li>
	 * <li>{@link SemanticType.Edit}</li>
	 * <li>{@link SemanticType.Save}</li>
	 * <li>{@link SemanticType.Cancel}</li>
	 * <li>{@link SemanticType.Multiselect}</li>
	 * <li>{@link SemanticType.Sort}</li>
	 * <li>{@link SemanticType.Filter}</li>
	 * <li>{@link SemanticType.Group}</li>
	 * <li>{@link SemanticType.MessagesIndicator}</li>
	 * </ul>
	 *
	 * @extends sap.m.semantic.SemanticPage
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.30.0
	 * @alias sap.m.semantic.MasterPage
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var MasterPage = SemanticPage.extend("sap.m.semantic.MasterPage", /** @lends sap.m.semantic.MasterPage.prototype */ {
		renderer: SemanticPageRenderer.render
	});

	MasterPage.prototype.aAllowedTypes = [
		SemanticType.Add,
		SemanticType.Approve,
		SemanticType.Reject,
		SemanticType.Forward,
		SemanticType.Edit,
		SemanticType.Save,
		SemanticType.Cancel,
		SemanticType.Multiselect,
		SemanticType.Sort,
		SemanticType.Filter,
		SemanticType.Group,
		SemanticType.MessagesIndicator
	];


	return MasterPage;
}, /* bExport= */ true);
