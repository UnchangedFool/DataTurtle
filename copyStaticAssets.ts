import * as shell from "shelljs";

shell.cp("-R", "src/public/css", ".dist/public");
shell.cp("-R", "src/public/html", ".dist/public");
shell.cp("node_modules/jquery/dist/jquery.js", ".dist/public/js");
shell.cp("node_modules/jquery/dist/jquery.min.js", ".dist/public/js");
