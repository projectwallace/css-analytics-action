const fs = require('fs')
const core = require('@actions/core')
const github = require('@actions/github')

async function run() {
	try {
		const cssPath = core.getInput('css-path')
		const githubToken = core.getInput('github-token')
		const shouldPostPrComment = core.getInput('post-pr-comment') === 'true'
		const { eventName, payload } = github.context
		const octokit = new github.GitHub(githubToken)

		// if (eventName !== 'pull_request') return

		// Read CSS file
		// const css = fs.readFileSync(cssPath, 'utf8')

		// POST the actual PR comment
		const formattedBody = `
			## CSS Analytics

			| Metric  | Value: |
			|---------|--------|
			| \`a.b\` | \`1\`  |
		`

		const query = `
			mutation AddPrComment($comment: AddCommentInput!) {
				addComment(input: $comment) {
					commentEdge {
						node {
							body
							bodyHTML
							bodyText
						}
					}
				}
			}
		`
		const variables = {
			comment: {
				subjectId: github.context.pull_request.node_id,
				body: formattedBody,
			},
		}

		await octokit.graphql(query, variables)
	} catch (error) {
		core.setFailed(error.message)
	}
}

run()
