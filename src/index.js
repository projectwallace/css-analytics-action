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

			| Metric | Value |
			|--------|-------|
			| \`a.b\` | \`1\` |
		`
		console.log(payload)
		const owner = payload.repository.owner.login
		const repo = payload.repository.name
		const issue_number = payload.number

		// const query = ``
		// const variables = {}

		// await octokit.graphql(query, variables)
	} catch (error) {
		core.setFailed(error.message)
	}
}

run()
