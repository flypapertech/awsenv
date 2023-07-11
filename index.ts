import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";

/**
 * Gets a secret object from AWS secret manager
 *
 * @param secretName the name of the secret
 * @param region the region the secret is in
 */
export async function getSecretObject(secretName: string, region?: string): Promise<{ [key: string]: string }> {
    const config = (region) ? {region} : {}
    const client = new SecretsManagerClient(config)

    try {
        const getSecret = new GetSecretValueCommand({SecretId: secretName});
        const data = await client.send(getSecret)
        if (data.SecretString) return JSON.parse(data.SecretString)
        else return Promise.reject("Secret is binary, should you be asking for a binary secret?")
    } catch (err) {
        return Promise.reject(err)
    }
}

/**
 * Gets a binary secret as a string from AWS secret manager
 *
 * @param secretName the name of the secret
 * @param region the region the secret is in
 */
export async function getBinarySecretString(secretName: string, region: string): Promise<string> {
    const client = new SecretsManagerClient({region: region})

    try {
        const getSecret = new GetSecretValueCommand({SecretId: secretName});
        const data = await client.send(getSecret)
        if (data.SecretBinary && typeof data.SecretBinary === "string") {
            const buff = Buffer.from(data.SecretBinary, "base64")
            return buff.toString("ascii")
        } else {
            return Promise.reject("Secret is not binary, should you be asking for a non-binary secret?")
        }
    } catch (err) {
        return Promise.reject(err)
    }
}

/**
 * Loads a secret object into the environment.
 *
 * @param secrets Key value pair object to load into the environment
 */
export function loadSecretsIntoEnv(secrets: {[key:string]: string}): void {
    for (const key in secrets) {
        // only load secret if it isn't loaded already
        if (!process.env[key]) {
            const secret =  typeof secrets[key] ===  'string' ? secrets[key].trim() : secrets[key]
            if (secret === "false" || secret === "False" || secret === "FALSE")
                // @ts-ignore ignoring since typescript complains about putting a boolean in env
                process.env[key] = false
            else if (secret === "true" || secret === "True" || secret === "TRUE")
                // @ts-ignore ignoring since typescript complains about putting a boolean in env
                process.env[key] = true
            else process.env[key] = secret
        }
    }
}

/**
 * Convenience method to get secret object from AWS Secrets Manager and load it into current environment Loads a secret object into the environment.
 *
 * @param secretName the name of the secret
 * @param region the region the secret is in
 */
export async function config(secretName: string, region?: string): Promise<void> {
    const secrets = await getSecretObject(secretName, region)
    loadSecretsIntoEnv(secrets)
}
