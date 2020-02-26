import { getSecretObject } from "./index"
(function() {
    if (!process.env.AWS_SECRET_NAME) {
        console.error("AWS_SECRET_NAME must be set in environment")
        process.exit(1)
    }

    getSecretObject(process.env.AWS_SECRET_NAME, process.env.AWS_REGION).then((secrets) => {
        console.log(JSON.stringify(secrets))
        process.exit(0)
    }).catch((error) => {
        console.error(error)
        process.exit(1)
    });
})()
