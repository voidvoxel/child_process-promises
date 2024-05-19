import * as child_process from "child_process";
import { ObjectEncodingOptions } from "fs";


function getExitCode (
    childProcess: AsyncChildProcess
): Promise<number> {
    if (typeof this._$AsyncChildProcess$exitCode === "number") return this._$AsyncChildProcess$exitCode;
    if (this._$AsyncChildProcess$isRunning) return this._$AsyncChildProcess$promise;

    this._$AsyncChildProcess$isRunning = true;

    this._$AsyncChildProcess$promise = new Promise<number>(
        (resolve, reject) => {
            childProcess.once(
                "error",
                (error: Error) => {
                    this._$AsyncChildProcess$isRunning = false;
                    this._$AsyncChildProcess$promise = null;
                    this._$AsyncChildProcess$exitCode = 1;

                    reject(error.message);
                }
            );

            childProcess.once(
                "exit",
                (exitCode: number) => {
                    this._$AsyncChildProcess$isRunning = false;
                    this._$AsyncChildProcess$promise = null;
                    this._$AsyncChildProcess$exitCode = exitCode;

                    resolve(exitCode);
                }
            );
        }
    );

    return this._$AsyncChildProcess$promise;
}


async function _$AsyncChildProcess$waitUntilExitCode (
    childProcess: AsyncChildProcess
): Promise<number> {
    childProcess._$AsyncChildProcess$context ??= {};

    return getExitCode.call(
        childProcess._$AsyncChildProcess$context,
        childProcess
    );
}


class AsyncChildProcess extends child_process.ChildProcess {
    _$AsyncChildProcess$context: any


    async promiseExit (): Promise<void> {
        return new Promise<void>(
            async (resolve, reject) => {
                try {
                    await _$AsyncChildProcess$waitUntilExitCode(this);

                    resolve(undefined);
                } catch {
                    reject(`Child process failed to start.`);
                }
            }
        );
    }


    async promiseExitCode (): Promise<number> {
        return _$AsyncChildProcess$waitUntilExitCode(this);
    }
}


function setPrototype (
    childProcess: child_process.ChildProcess
): AsyncChildProcess {
    Object.defineProperty(
        childProcess,
        "promiseExit",
        {
            value: AsyncChildProcess.prototype.promiseExit
        }
    );

    Object.defineProperty(
        childProcess,
        "promiseExitCode",
        {
            value: AsyncChildProcess.prototype.promiseExitCode
        }
    );

    return childProcess as AsyncChildProcess;
}


export function exec(
    command: string,
    options: ObjectEncodingOptions | child_process.ExecOptions
): AsyncChildProcess {
    const subprocess = child_process.exec(
        command,
        options
    );

    return setPrototype(subprocess);
}


export function fork(
    modulePath: string,
    args: string[] | child_process.ForkOptions,
    options: child_process.ForkOptions | null
) {
    let subprocess;

    if (args && args instanceof Array && typeof args[0] === "string") {
        subprocess = child_process.fork(
            modulePath,
            args,
            options
        );
    } else {
        subprocess = child_process.fork(
            modulePath,
            args as child_process.ForkOptions
        );
    }

    return setPrototype(subprocess);
}


export function spawn(
    modulePath: string,
    args: string[] | child_process.SpawnOptions,
    options: child_process.SpawnOptions | null
) {
    let subprocess;

    if (args && args instanceof Array && typeof args[0] === "string") {
        subprocess = child_process.spawn(
            modulePath,
            args,
            options
        );
    } else {
        subprocess = child_process.spawn(
            modulePath,
            args as child_process.SpawnOptions
        );
    }

    options ??= {};

    options.stdio = "ignore";

    return setPrototype(subprocess);
}


export default {
    exec,
    fork,
    spawn
};
