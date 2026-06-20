import github from '@actions/github'

type DeletedFilesOptions = {
  owner: string
  repo: string
  baseSHA: string
  headSHA: string
  pathPrefix: string
  resourceName: string
  cleanupWorkflowName: string
}

export async function getDeletedFilesComment({
  owner,
  repo,
  baseSHA,
  headSHA,
  pathPrefix,
  resourceName,
  cleanupWorkflowName,
}: DeletedFilesOptions): Promise<string> {
  const token = process.env.GITHUB_TOKEN
  if (!token) {
    throw new Error('GITHUB_TOKEN environment variable not set')
  }

  const octokit = github.getOctokit(token)
  const response = await octokit.rest.repos.compareCommitsWithBasehead({
    owner,
    repo,
    basehead: `${baseSHA}...${headSHA}`,
  })

  const { files } = response.data
  if (!files) return ''

  const oldFilenames: (string | undefined)[] = []
  for (const file of files) {
    const { filename, status } = file
    if (!filename.startsWith(pathPrefix)) continue

    if (status === 'removed') {
      oldFilenames.push(filename)
    } else if (status === 'renamed') {
      oldFilenames.push(file.previous_filename)
    }
  }

  if (!oldFilenames.length) return ''

  let markdown = `**Please restore deleted ${resourceName}**\n\n`
  markdown += `Even if you don't reference these ${resourceName} anymore, as of this branch, please do not delete them.\n`
  markdown += 'They might still be referenced in translated content.\n'
  markdown += `The weekly "${cleanupWorkflowName}" workflow will clean those up.\n\n`
  markdown += '**To *undo* these removals run this command:**\n\n'
  markdown += `\n\`\`\`sh\ngit checkout origin/main -- ${oldFilenames.join(' ')}\n\`\`\`\n`

  return markdown
}
