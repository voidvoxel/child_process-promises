const { exec } = require("../dist");


async function main () {
    // $ cat
    const childProcess = exec("cat");

    process.stdin.pipe(childProcess.stdin);
    childProcess.stdout.pipe(process.stdout);
    childProcess.stderr.pipe(process.stderr);

    await childProcess.promiseExit();
}


main();
