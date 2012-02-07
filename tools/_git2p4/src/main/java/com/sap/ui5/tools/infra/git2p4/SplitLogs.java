package com.sap.ui5.tools.infra.git2p4;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.io.Writer;
import java.util.HashMap;
import java.util.Map;
import java.util.SortedSet;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class SplitLogs {
	private static Pattern START = Pattern.compile("\\[git.cmd, checkout, --force, --detach, ([a-f0-9,]{40})\\]");
	
	public static void run(String template, SortedSet<GitClient.Commit> allCommits) throws IOException {
		System.out.println(allCommits.size());
		Map<String,GitClient.Commit> allCommitsById = new HashMap<String,GitClient.Commit>();
		for(GitClient.Commit commit : allCommits) {
			allCommitsById.put(commit.getId(), commit);
		}

		String NL = System.getProperty("line.separator");
		Writer out = null;
		GitClient.Commit commit = null;
		File outfile = null; 
		BufferedReader r = new BufferedReader(new InputStreamReader(System.in, "UTF-8"));
		String line;
		while ((line = r.readLine()) != null) {
			Matcher m = START.matcher(line);
			if ( m.matches() ) {
				if ( out != null ) {
					out.close();
					if ( commit != null && outfile != null ) {
						outfile.setLastModified(commit.getCommitDate().getTime());
					}
					out = null;
					commit = null;
					outfile = null;
				}
				String commitId = m.group(1);
				String filename = template.replace("#", commitId);
				commit = allCommitsById.get(commitId);
				System.out.println(commit);
				outfile = new File(filename);
				FileOutputStream fos = new FileOutputStream(outfile);
				out = new OutputStreamWriter(fos, "UTF-8");
			}
			if ( out != null ) {
				out.write(line);
				out.write(NL);
			} else {
				System.out.println(line);
			}
		}
		if ( out != null ) {
			out.close();
			if ( commit != null && outfile != null ) {
				outfile.setLastModified(commit.getCommitDate().getTime());
			}
			out = null;
			commit = null;
			outfile = null;
		}
	}
}
