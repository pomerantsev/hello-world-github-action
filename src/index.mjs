import * as core from "@actions/core";
import * as github from "@actions/github";

const { context } = github;

try {
  if (context.eventName !== "issue_comment") {
    core.info(`Ignoring event: ${context.eventName}`);
    process.exit(0);
  }

  const { comment, issue } = context.payload;

  // Ignore bot authors / non-commands
  const body = (comment?.body || "").trim();
  if (comment?.user?.type === "Bot") process.exit(0);
  if (!body.startsWith("@hello")) process.exit(0);

  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error("GITHUB_TOKEN is missing.");

  // Works for both composite (env) and JS actions (core.getInput)
  const message = process.env.INPUT_MESSAGE;

  const octokit = github.getOctokit(token);
  const { owner, repo } = context.repo;
  const issue_number = issue.number;

  await octokit.request("POST /repos/{owner}/{repo}/issues/{issue_number}/comments", {
    owner,
    repo,
    issue_number,
    body: message,
    headers: { "X-GitHub-Api-Version": "2022-11-28" }
  });

  core.info(`Replied on #${issue_number}`);
} catch (err) {
  core.setFailed(err.message);
}
