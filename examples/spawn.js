const { spawn } = require("../dist");


async function main () {
    // $ echo Hello, world!
    spawn(
        "echo",
        [
            "Hello,",
            "world!"
        ],
        {
            stdio: "inherit"
        }
    ).promiseExit();
}


main();
