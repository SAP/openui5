package com.sap.ui5.selenium.util;

import org.junit.rules.TestRule;
import org.junit.runner.Description;
import org.junit.runners.model.Statement;

public class UI5Timeout implements TestRule {
	private final int fMillis;

	/**
	 * @param millis the millisecond timeout
	 */
	public UI5Timeout(int millis) {
		fMillis = millis;
	}

	@Override
	public Statement apply(Statement base, Description description) {
		return new UI5FailOnTimeout(base, fMillis);
	}
}