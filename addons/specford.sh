# Convenience for running Specford specs *from /specford root dir*.
# Pasted into one of your bash `dot files` this function can then be called to
# run compiled specs as an alternative to the provided `gulp run`.
# Why? The feedback (logs) from the running script will be immediate as it
# does not have to run inside a Node child_process
#
# Call with a spec name to run a single spec `specford foo` (no need for the extension)
# Call with space separated names to run multiple `specford foo bar`
# Call with no args to run all specs `specford`

function specford() {
	# store the args
	args=("$@")
	len=${#args[@]}

	# if we have any args, run them
	if [ $len -gt 0 ]; then
	  for name in "$@"
	  do
	    slimerjs scripts/$name.js --ssl-protocol=any
	  done
	else
	# if there arent any just run averything in the scripts dir
	  for file in scripts/*.js
	  do
	    if [ -f "$file" ]; then
				slimerjs $file --ssl-protocol=any
	    fi
	  done
	fi
}
