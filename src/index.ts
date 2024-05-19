import * as child_process from "child_process";
import { ObjectEncodingOptions } from "fs";
import internal, { Stream, Writable } from "stream";


interface IPipeOptions {
    [key: string]: boolean | Stream


    input?: boolean | Stream
    output?: boolean | Stream
    error?: boolean | Stream
}


type PipeOptions = boolean | Stream | IPipeOptions;


interface ForkOptions extends child_process.ForkOptions {
    pipe?: PipeOptions
}


function shouldInherit (
    option?: boolean | Stream
) {
    if (typeof option === "boolean") return option;

    return false;
}


function shouldPipe (
    option?: boolean | Stream
) {
    if (!option) return;

    if (option instanceof Stream) return true;

    return false;
}


export function promisifyChildProcess (
    childProcess: child_process.ChildProcess | Function,
    pipe?: boolean | Stream | IPipeOptions
): Promise<void> {
    if (typeof childProcess === "function") {
        return new Promise(
            (resolve, reject) => {
                try {
                    resolve(childProcess());
                } catch (error) {
                    reject(error.message);
                }
            }
        );
    }

    if (!pipe) pipe = false;

    if (typeof pipe === "boolean") {
        pipe = {
            input: pipe
        };
    }

    if (pipe instanceof Stream) {
        pipe = {
            input: false,
            output: pipe,
            error: true
        };
    }

    for (let key in pipe) {
        if (typeof pipe[key] !== "boolean" && !(pipe[key] instanceof Stream)) {
            if (key === "output") {
                if (typeof pipe.input === "boolean") pipe[key] = pipe.input;
            } else if (key === "error") {
                if (typeof pipe.output === "boolean") pipe[key] = pipe.output;
                else if (pipe.output instanceof Stream) pipe[key] = pipe.output;
            }
        }
    }

    if (typeof pipe.error !== "boolean" && !(pipe.error instanceof Stream)) {
        pipe.error = false;
    }

    if (typeof pipe.input !== "boolean" && !(pipe.input instanceof Stream)) {
        pipe.input = false;
    }

    if (typeof pipe.output !== "boolean" && !(pipe.output instanceof Stream)) {
        pipe.output = false;
    }

    console.log(pipe);

    const promise = new Promise<void>(
        (resolve, reject) => {
            if (typeof childProcess !== "object") {
                const errorMessage
                    =   "`childProcess` must be of type \`object\`, "
                    +   "but instead received a \`"
                    +   typeof childProcess
                    +   "\`."
                ;

                reject(errorMessage);

                return;
            }

            childProcess.on(
                "error",
                (error: Error) => reject(error.message)
            );

            childProcess.on(
                "exit",
                (exitCode: number) => !exitCode
                    ?   resolve(undefined)
                    :   reject(`Child process returned code ${exitCode}.`)
            );
        }
    );

    return promise;
}


export async function exec(
    command: string,
    options: ObjectEncodingOptions | child_process.ExecOptions
): Promise<void> {
    const subprocess = child_process.exec(
        command,
        options
    );

    return promisifyChildProcess(subprocess);
}


export async function fork(
    modulePath: string,
    args: string[] | child_process.ForkOptions,
    options: ForkOptions | null
) {
    options.pipe ??= false;

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

    const pipe = options.pipe ?? null;

    return promisifyChildProcess(subprocess);
}


export async function spawn(
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

    return promisifyChildProcess(subprocess);
}


export default {
    exec,
    fork,
    spawn,
    promisifyChildProcess
};
