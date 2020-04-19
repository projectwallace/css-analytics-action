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

function formatNumber(number) {
	return Number.isInteger(number)
		? new Intl.NumberFormat().format(number)
		: parseFloat(number).toFixed(3)
}

function row([key, value]) {
	let displayValue = value

	if (Array.isArray(value) && value.every((item) => typeof item === 'string')) {
		displayValue =
			`<ol>` + value.map((item) => `<li><code>${item}</code></li>`) + `</ol>`
	} else if (
		Array.isArray(value) &&
		value.some((item) => item.value && item.count)
	) {
		displayValue =
			`<table><thead><tr><th>count</th><th>value</th></tr></thead><tbody>` +
			value
				.map(
					(item) =>
						`<tr><td>${item.count}</td><td><code>${item.value}</code></td></tr>`
				)
				.join('') +
			`</tbody></table>`
	} else if (Array.isArray(value) && value.length === 0) {
		displayValue = `_N/A_`
	} else {
		displayValue = formatNumber(value)
	}

	return `| \`${key}\` | ${displayValue} |`
}