package com.sap.ui5.selenium.util;

import org.junit.runners.model.Statement;

import com.sap.ui5.selenium.common.CommonBase;
import com.sap.ui5.selenium.common.InitService;

public class UI5FailOnTimeout extends Statement {
	private final Statement fOriginalStatement;

	private final long fTimeout;

	public UI5FailOnTimeout(Statement originalStatement, long timeout) {
		fOriginalStatement = originalStatement;
		fTimeout = timeout;
	}

	@Override
	public void evaluate() throws Throwable {
		StatementThread thread = evaluateStatement();
		if (!thread.fFinished) {
			throwExceptionForUnfinishedThread(thread);
		}
	}

	private StatementThread evaluateStatement() throws InterruptedException {
		StatementThread thread = new StatementThread(fOriginalStatement);
		thread.start();
		thread.join(fTimeout);
		if (!thread.fFinished) {
			thread.recordStackTrace();
		}
		thread.interrupt();
		return thread;
	}

	private void throwExceptionForUnfinishedThread(StatementThread thread)
			throws Throwable {
		if (thread.fExceptionThrownByOriginalStatement != null) {
			throw thread.fExceptionThrownByOriginalStatement;
		} else {
			killWebDriver();
			throwTimeoutException(thread);
		}
	}

	private void killWebDriver() {
		Utility.killWebDriver(CommonBase.driver, InitService.INSTANCE.getBrowserType());
	}

	private void throwTimeoutException(StatementThread thread) throws Exception {
		Exception exception = new Exception(String.format(
				"test timed out after %d milliseconds", fTimeout));
		exception.setStackTrace(thread.getRecordedStackTrace());
		throw exception;
	}

	private static class StatementThread extends Thread {
		private final Statement fStatement;

		private boolean fFinished = false;

		private Throwable fExceptionThrownByOriginalStatement = null;

		private StackTraceElement[] fRecordedStackTrace = null;

		public StatementThread(Statement statement) {
			fStatement = statement;
		}

		public void recordStackTrace() {
			fRecordedStackTrace = getStackTrace();
		}

		public StackTraceElement[] getRecordedStackTrace() {
			return fRecordedStackTrace;
		}

		@Override
		public void run() {
			try {
				fStatement.evaluate();
				fFinished = true;
			} catch (InterruptedException e) {
				// don't log the InterruptedException
			} catch (Throwable e) {
				fExceptionThrownByOriginalStatement = e;
			}
		}
	}
}