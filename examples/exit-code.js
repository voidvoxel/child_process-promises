const { spawn } = require("../dist");


async function main () {
    // $ echo Hello, world!
    const childProcess = spawn(
        "echo",
        [
            "Hello,",
            "world!"
        ],
        {
            stdio: "inherit"
        }
    );

    // It's safe to call `promiseExit` before calling `promiseExitCode`.
    // It's not necessary, but it doesn't hurt anything either.
    // Normally, you wouldn't call this if you're also calling
    // `promiseExitCode`, but I wanted to show you that it won't break anything
    // if you decide to call both.
    await childProcess.promiseExit();

    // Wait until the exit code is available.
    const result = await childProcess.promiseExitCode();

    // Log the exit code.
    console.log("Exit code:", result);
}


main();
