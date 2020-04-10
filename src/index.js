const fs = require('fs')
const core = require('@actions/core')
const github = require('@actions/github')
const analyze = require('@projectwallace/css-analyzer')
const createComment = require('./create-comment')

async function run() {
	try {
		const cssPath = core.getInput('css-path')
		const githubToken = core.getInput('github-token')
		const shouldPostPrComment = core.getInput('post-pr-comment') === 'true'
		const { eventName, payload } = github.context
		const octokit = new github.GitHub(githubToken)
		// console.log(github.context)

		// if (eventName !== 'pull_request') return

		// Read CSS file
		const css = fs.readFileSync(cssPath, 'utf8')

		// Find any previous comments by GitHub Bot
		const comments = await octokit.graphql(
			`
				query RecentBotComments(
					$owner: String!,
					$repoName: String!,
					$prNumber: Int!
				) {
					repository(owner: $owner, name: $repoName) {
						pullRequest(number: $prNumber) {
							comments(last: 10) {
								totalCount
								edges {
									node {
										id
										bodyText
										author {
											login
										}
									}
								}
							}
						}
					}
				}
				`,
			{
				owner: payload.repository.owner.login,
				repoName: payload.repository.name,
				prNumber: parseInt(payload.pull_request.number, 10),
			}
		)

		const hasComments = comments.repository.pullRequest.comments.totalCount > 0
		const outdatedComments = comments.repository.pullRequest.comments.edges.filter(
			({ node }) =>
				node.author.login === 'github-actions' &&
				node.bodyText.startsWith('## CSS Analytics')
		)

		if (hasComments && outdatedComments.length > 0) {
			// And mark them as OUTDATED
			await Promise.all(
				outdatedComments
					.map(({ node }) => node.id)
					.map((id) => {
						return octokit.graphql(
							`
							mutation MarkCommentOutdated($input: MinimizeCommentInput!) {
								minimizeComment(input: $input) {
									minimizedComment {
										minimizedReason
									}
								}
							}
							`,
							{
								input: {
									classifier: 'OUTDATED',
									subjectId: id,
								},
							}
						)
					})
			)
		}

		// POST the actual PR comment
		const stats = await analyze(css)
		const formattedBody = createComment({ stats })

		await octokit.graphql(
			`
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
		`,
			{
				comment: {
					subjectId: payload.pull_request.node_id,
					body: formattedBody,
				},
			}
		)
	} catch (error) {
		core.setFailed(error.message)
	}
}

run()
