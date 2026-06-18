import github from '@actions/github'
import core from '@actions/core'

import { getDeletedFilesComment } from '@/workflows/lib/deleted-files-pr-comment'

const { GITHUB_TOKEN } = process.env
const context = github.context

if (!GITHUB_TOKEN) {
  throw new Error(`GITHUB_TOKEN environment variable not set`)
}

// When this file is invoked directly from action as opposed to being imported
if (import.meta.url.endsWith(process.argv[1])) {
  const owner = context.repo.owner
  const repo = context.payload.repository?.name || ''
  const baseSHA = context.payload.pull_request?.base.sha
  const headSHA = context.payload.pull_request?.head.sha

  const markdown = await main({ owner, repo, baseSHA, headSHA })
  core.setOutput('markdown', markdown)
}

type MainArgs = {
  owner: string
  repo: string
  baseSHA: string
  headSHA: string
}
async function main({ owner, repo, baseSHA, headSHA }: MainArgs) {
  return getDeletedFilesComment({
    owner,
    repo,
    baseSHA,
    headSHA,
    pathPrefix: 'assets',
    resourceName: 'assets',
    cleanupWorkflowName: 'Delete orphaned assets',
  })
}

export default main
