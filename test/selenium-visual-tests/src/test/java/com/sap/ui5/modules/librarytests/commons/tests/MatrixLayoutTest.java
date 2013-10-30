package com.sap.ui5.modules.librarytests.commons.tests;

import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.support.PageFactory;

import com.sap.ui5.modules.librarytests.commons.pages.MatrixLayoutPO;
import com.sap.ui5.selenium.common.TestBase;
import com.sap.ui5.selenium.core.UI5PageFactory;

public class MatrixLayoutTest extends TestBase {

	private MatrixLayoutPO page;

	private final int millisecond = 1000;

	private final String targetUrl = "/uilib-sample/test-resources/sap/ui/commons/visual/MatrixLayout.html";

	@Before
	public void setUp() {
		page = PageFactory.initElements(driver, MatrixLayoutPO.class);
		UI5PageFactory.initElements(driver, page);

		driver.get(getFullUrl(targetUrl));
		userAction.mouseClickStartPoint(driver);
	}

	@Test
	public void testAllElements() {
		verifyFullPageUI("full-initial");
	}

	/** Verify properties of MatrixLayout */
	@Test
	public void testMatrixProperties() {

		// Check MatrixLayout with LayoutFixed = False
		verifyElementUI(page.matrix1ID, "LayoutFixed-False");

		// Check MatrixLayout with LayoutFixed = True
		page.tabStrip.selectTab(1);
		verifyElementUI(page.matrix2.getAttribute("id"), "LayoutFixed-True");

		// Check MatrixLayout with Colspan & Rowspan 
		page.tabStrip.selectTab(2);
		verifyElementUI(page.matrix3.getAttribute("id"), "Colspan-Rowspan");
	}

	/** Verify MatrixLayout in a realistic scenario */
	@Test
	public void testChangeMatrix() {
		page.tabStrip.selectTab(3);
		waitForReady(millisecond);
		verifyElementUI(page.matrix4.getAttribute("id"), "DisplayOnly");

		userAction.mouseOver(driver, page.changeButton.getId(), 800);
		verifyBrowserViewBox("Tooltip-ChangeButton");

		// Switch view to Edit Mode
		page.changeButton.click();
		waitForReady(2000);
		userAction.mouseMoveToStartPoint(driver);
		userAction.mouseOver(driver, page.changeButton.getId(), millisecond);
		verifyBrowserViewBox("Switch-EditMode");
		userAction.mouseMoveToStartPoint(driver);

		//Change picture location and apply the change
		page.urlTextField.clearValue();
		page.urlTextField.setValue("images/face.jpg");
		page.changeURLButton.click();
		waitForReady(millisecond);
		verifyElementUI(page.matrix4.getAttribute("id"), "PictureChanged");

		// Switch back to Display Mode
		page.changeButton.click();
		userAction.mouseOver(driver, page.changeButton.getId(), millisecond);
		verifyBrowserViewBox("Switch-DisplayMode");

		// Mover Mouse away from the button to remove RichTootip
		userAction.mouseMoveToStartPoint(driver);
		waitForReady(millisecond);
		verifyElementUI(page.matrix4.getAttribute("id"), "Final");
	}
}