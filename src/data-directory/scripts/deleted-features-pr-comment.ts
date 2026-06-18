/**
 * This script is supposed to be used in Actions. When it's run in Actions
 * there will be an env var called GITHUB_REPOSITORY. If it's not there,
 * you can use this script as a CLI tool. For example:
 *
 *  export GITHUB_TOKEN=github_pat_blablabla
 *  npm run deleted-features-pr-comment -- github docs-internal main 2ba53b6a
 *
 */

import github from '@actions/github'
import core from '@actions/core'
import { program } from 'commander'

import { getDeletedFilesComment } from '@/workflows/lib/deleted-files-pr-comment'

const { GITHUB_TOKEN, GITHUB_REPOSITORY } = process.env

if (!GITHUB_TOKEN) {
  throw new Error(`GITHUB_TOKEN environment variable not set`)
}

if (GITHUB_REPOSITORY) {
  const context = github.context

  const owner = context.repo.owner
  const repo = context.payload.repository!.name
  const baseSHA = process.env.BASE_SHA || context.payload.pull_request!.base.sha
  const headSHA = process.env.HEAD_SHA || context.payload.pull_request!.head.sha

  const markdown = await main(owner, repo, baseSHA, headSHA)
  core.setOutput('markdown', markdown)
} else {
  program
    .description('Print a nice Markdown comment if there were features deleted in a PR.')
    .arguments('owner repo bash_sha head_sha')
    .parse(process.argv)

  const args = program.args
  const [owner, repo, baseSHA, headSHA] = args
  console.log(await main(owner, repo, baseSHA, headSHA))
}

async function main(owner: string, repo: string, baseSHA: string, headSHA: string) {
  return getDeletedFilesComment({
    owner,
    repo,
    baseSHA,
    headSHA,
    pathPrefix: 'data/features',
    resourceName: 'features',
    cleanupWorkflowName: 'Delete orphaned features',
  })
}

export default main
