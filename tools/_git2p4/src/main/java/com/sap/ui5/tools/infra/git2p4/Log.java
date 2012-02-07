package com.sap.ui5.tools.infra.git2p4;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.PrintStream;
import java.util.Date;
import java.util.List;
import java.util.Stack;

public class Log {

	private static PrintStream out = null;
	private static Stack<PrintStream> stack = new Stack<PrintStream>();
	
	public static void setLogFile(File file, boolean keepPrevious) throws IOException {
		if ( keepPrevious ) {
			stack.push(out);
		} else if ( out != null ) {
			out.close();
			out = null;
		}
		if ( file != null ) {
			FileOutputStream fos = new FileOutputStream(file, true);
			out = new PrintStream(fos, true, "UTF-8");
			out.println("---- " + new Date() + " ----------------------------");
		}
	}
	
	public static void restorePrevious() throws IOException {
		if ( out != null ) {
			out.close();
			out = null;
		}
		out = stack.pop();
	}
	
	public static void println(String msg) {
		if ( out != null ) out.println(msg);
		System.out.println(msg);
	}

	public static void println(Object obj) {
		println(String.valueOf(obj));
	}
	
	public static String summary(List<String> lines) {
		if (lines.size() < 20 ) {
			String summary = lines.toString();
			if ( summary.length() < 500 ) {
				return summary;
			} else if ( lines.size() < 5 ) {
				return lines.get(0) + "..." + lines.get(lines.size()-1);
			}
		}
		List<String> start = lines.subList(0, Math.min(2, lines.size()-1));
		List<String> end = lines.subList(Math.max(0, lines.size()-3), lines.size()-1);
		return start + " (..." + (lines.size() - 4) + " more lines ...)" + end; 
	}

}
