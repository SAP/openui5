package com.sap.ui5.tools.infra.git2p4;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.PrintStream;
import java.util.Date;

public class Log {

	private static PrintStream out = null;
	
	public static void setLogFile(File file) throws IOException {
		if ( out != null ) {
			out.close();
			out = null;
		}
		if ( file != null ) {
			FileOutputStream fos = new FileOutputStream(file, true);
			out = new PrintStream(fos, true, "UTF-8");
			out.println("---- " + new Date() + " ----------------------------");
		}
	}
	
	public static void println(String msg) {
		if ( out != null ) out.println(msg);
		System.out.println(msg);
	}

	public static void println(Object obj) {
		println(String.valueOf(obj));
	}
}
