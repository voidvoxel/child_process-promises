const { exec } = require("../dist");


async function main () {
    // $ mkdir -p tmp
    await exec("mkdir -p tmp").promiseExit();

    // $ touch tmp/exec.tmp
    await exec("touch tmp/exec.txt").promiseExit();
}


main();
