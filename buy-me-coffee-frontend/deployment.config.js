const deployment = "github"
//replace "github" with "local" when deploying to local files

const githubBasePath = "";
const localBasePath = "";

const basePath = (deployment === "github") ? githubBasePath : localBasePath;
export default basePath;
  