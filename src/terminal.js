function put(str) {
    process.stdout.write(str)
}

function print(str) {
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


module.exports = {
    put, print, hideCursor, showCursor, inverse, removeAnsiColorCodes
}