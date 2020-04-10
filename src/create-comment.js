module.exports = ({ stats }) => {
	return `
		## CSS Analytics

		| Metric | Value |
		|--------|-------|
		${Object.entries(stats).map(row).join('\n')}
		`
		.split('\n')
		.map((line) => line.trim())
		.join('\n')
}

function row([key, value]) {
	if (Array.isArray(value) && value.every((item) => typeof item === 'string')) {
		value =
			`<ol>` + value.map((item) => `<li><code>${item}</code></li>`) + `</ol>`
	}

	if (Array.isArray(value) && value.some((item) => item.value && item.count)) {
		value =
			`<table><thead><tr><th>count</th><th>value</th></tr></thead><tbody>` +
			value
				.map(
					(item) =>
						`<tr><td>${item.count}</td><td><code>${item.value}</code></td></tr>`
				)
				.join('') +
			`</tbody></table>`
	}

	return `| \`${key}\` | ${value} |`
}
