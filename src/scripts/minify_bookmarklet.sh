yarn run uglifyjs ./bookmarklet/bookmarklet.js -o bookmarklet/bookmarklet.min.js;
sed -i '.bak' '1s;^;javascript:;' bookmarklet/bookmarklet.min.js;