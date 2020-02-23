function put(str) {
    process.stdout.write(str)
}

function print(str = '') {
    put(str + '\n')
}

function hideCursor() {
    put('\x1b[?25l')
}

function showCursor() {
    put('\x1b[?25h')
}

function inverse(str) {
    return '\x1b[7m' + str + '\x1b[0m'
}

function removeAnsiColorCodes(str) {
	return str.replace(/\x1b\[[0-9;]*m/g, '')
}

function substrWithColors(str, from, len) {
	if (!str || len <= 0) return ''
	let result = ''
	let pos = 0
	let l = 0
	let ansi = false
	for (let i = 0; i < str.length; i++) {
		if (ansi) {
			result += str.charAt(i)
			if (str.charCodeAt(i) >= 0x40)
				ansi = false
		}
		else {
			if (str.substr(i, 2) == '\x1b[') {
				ansi = true
				result += '\x1b['
				i++
			}
			else {
				if (pos >= from && l < len) {
					result += str.charAt(i)
					l++
				}
				pos++
			}
		}
	}
	return result
}


module.exports = {
    put, print, hideCursor, showCursor, inverse,
    removeAnsiColorCodes, substrWithColors
}