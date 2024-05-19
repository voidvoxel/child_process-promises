const { fork } = require("../dist");


async function main () {
    // Get the path to the examples directory.
    const examplesDirectory = __dirname + "/../examples/";

    // Get the path to the script file.
    const scriptPath = [
        examplesDirectory,
        "child-process-script.js"
    ].join("/");

    // Fork the script `child-process-script.js`.
    await fork(scriptPath).promiseExit();
}


main();
