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
		value = `<ol>` + value.map((item) => `<li>${item}</li>`) + `</ol>`
	}

	if (Array.isArray(value) && value.some((item) => item.value && item.count)) {
		value =
			`<ol>` +
			value.map((item) => `<li>${item.value} (${item.count})</li>`).join('') +
			'</ol>'
	}

	return `| \`${key}\` | ${value} |`
}
