package com.sap.ui5.modules.librarytests.core.tests;

import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.support.PageFactory;

import com.sap.ui5.modules.librarytests.core.pages.TypeFormatPO;
import com.sap.ui5.selenium.common.TestBase;

public class TypeFormatTest extends TestBase {

	private TypeFormatPO page;

	private final int timeOutSeconds = 500;

	private final String targetUrl = "/test-resources/sap/ui/core/visual/TypeFormat.html";

	@Before
	public void setUp() {
		page = PageFactory.initElements(driver, TypeFormatPO.class);
		driver.get(getFullUrl(targetUrl));
		userAction.mouseClickStartPoint(driver);
	}

	/** Verify full Page UI and all element initial UI */
	@Test
	public void testAllElements() {
		verifyFullPageUI("full-initial");
	}

	/** Verify format in different locales. */
	@Test
	public void testCheckFormat() {

		String enUSText = page.en_US.getText();
		String zhCNText = page.zh_CN.getText();
		String ruRUText = page.ru_RU.getText();
		String heILText = page.he_IL.getText();
		String xxXXText = page.xx_XX.getText();

		// Verify en_US local
		page.en_US.click();
		this.waitForElement(driver, true, page.en_US.getAttribute("id"), timeOutSeconds);
		verifyElementUI(page.dateFormatID, "CheckDateFormat-" + enUSText);
		verifyElementUI(page.timeFormatID, "CheckTimeFormat-" + enUSText);
		verifyElementUI(page.datetimeFormatID, "CheckDateTimeFormat-" + enUSText);
		verifyElementUI(page.numberFormatID, "CheckNumberFormat-" + enUSText);

		// Verify zh_CN local
		page.zh_CN.click();
		this.waitForElement(driver, true, page.zh_CN.getAttribute("id"), timeOutSeconds);
		verifyElementUI(page.dateFormatID, "CheckDateFormat-" + zhCNText);
		verifyElementUI(page.timeFormatID, "CheckTimeFormat-" + zhCNText);
		verifyElementUI(page.datetimeFormatID, "CheckDateTimeFormat-" + zhCNText);
		verifyElementUI(page.numberFormatID, "CheckNumberFormat-" + zhCNText);

		// Verify ru_RU local
		page.ru_RU.click();
		this.waitForElement(driver, true, page.ru_RU.getAttribute("id"), timeOutSeconds);
		verifyElementUI(page.dateFormatID, "CheckDateFormat-" + ruRUText);
		verifyElementUI(page.timeFormatID, "CheckTimeFormat-" + ruRUText);
		verifyElementUI(page.datetimeFormatID, "CheckDateTimeFormat-" + ruRUText);
		verifyElementUI(page.numberFormatID, "CheckNumberFormat-" + ruRUText);

		// Verify he_IL local
		page.he_IL.click();
		this.waitForElement(driver, true, page.he_IL.getAttribute("id"), timeOutSeconds);
		verifyElementUI(page.dateFormatID, "CheckDateFormat-" + heILText);
		verifyElementUI(page.timeFormatID, "CheckTimeFormat-" + heILText);
		verifyElementUI(page.datetimeFormatID, "CheckDateTimeFormat-" + heILText);
		verifyElementUI(page.numberFormatID, "CheckNumberFormat-" + heILText);

		page.xx_XX.click();
		this.waitForElement(driver, true, page.xx_XX.getAttribute("id"), timeOutSeconds);
		verifyElementUI(page.dateFormatID, "CheckDateFormat-" + xxXXText);
		verifyElementUI(page.timeFormatID, "CheckTimeFormat-" + xxXXText);
		verifyElementUI(page.datetimeFormatID, "CheckDateTimeFormat-" + xxXXText);
		verifyElementUI(page.numberFormatID, "CheckNumberFormat-" + xxXXText);
	}
}
