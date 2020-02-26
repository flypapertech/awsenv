import {spawnSync} from "child_process"
import { loadSecretsIntoEnv } from "./index"

const output = spawnSync("node", [__dirname + "/load.js"])
const error = output.stderr.toString()
if (error === "") {
    const secrets = JSON.parse(output.stdout.toString())
    loadSecretsIntoEnv(secrets)
}
else {
    console.error(error)
    process.exit(1)
}
