#!/bin/bash

set -e

dev=./dev
source=./source
output=./dist
index=$output/index.html


npm_bin=$(cd $dev && npm run -s init > /dev/null 2>&1 && npm bin)
PATH="$npm_bin:$PATH"


rm -rf $output
cp -r $source $output




perl -i -ne "/x-dev/ or print" $index


cat $index \
    | grep '<script' \
    | grep 'x-pick-lib' \
    | sed 's|src="||g' \
    | sed 's|"><\/| |g' \
    | awk '{print $3}' \
    | sed "s|^|$output/|" \
    | xargs cat > "$output/libs/package.min.js"

perl -i -ne "/sourceMappingURL=/ or print" $output/libs/package.min.js
perl -i -ne "/x-pick-lib/ or print" $index



main_script=$(cat $index \
    | grep '<script' \
    | grep 'x-pick-main' \
    | sed 's|data-src="||g' \
    | sed 's|"><\/| |g' \
    | awk '{print $4}' \
    | sed "s|^|$output/|")


coffee -c $output/static
echo $main_script | xargs coffee -c
echo $main_script | sed 's|\.coffee|\.js|g' | xargs uglifyjs -c warnings=false -m --wrap -o "$output/scripts/main.min.js"

perl -i -ne "/x-pick-main/ or print" $index



perl -pi -e "s|<script data-src|<script src|g" $index
perl -pi -e 's|<script type="text/tracking">|<script>|g' $index



lessc --clean-css="--skip-advanced" $output/styles/main.less $output/styles/main.css


perl -pi -e "s|stylesheet/less|stylesheet|g" $index
perl -pi -e "s|main.less|main.css|g" $index
perl -pi -e "s|<base href=\"/\">|<base href=\"/h5/\">|g" $index
perl -pi -e "s|t={time}|t=`date +%s`|g" $index


(cd $output; [ -d h5 ] || ln -sf . h5)


echo ' '
echo $'\360\237\215\273' '<3 MOBILE BUILD SUCCESS'
echo ' '

