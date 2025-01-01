require('dotenv').config()

const deploymentTarget = process.env.DEPLOYMENT_TARGET;
//replace "github" with "local" when deploying to local files

const githubBasePath = "";
const localBasePath = "/buy-me-coffee/";

const basePath = (deploymentTarget === "github") ? githubBasePath : localBasePath;

export default basePath;
  