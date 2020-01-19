const keypress = require('keypress')
const { hideCursor, showCursor, verticalMenu } = require('../src/menu')


function listenKeyboard(kbHandler) {
    process.stdin.setRawMode(true)
    process.stdin.resume()
    keypress(process.stdin)
    process.stdin.on('keypress', (ch, key) => {
        kbHandler(ch, key)
    })
}

function main() {
    hideCursor()
    let options = 'one two three four five six seven'.split(' ')
    let menuKeyHandler = verticalMenu(options, sel => {
        console.log('Selection: ' + sel + ' - ' + options[sel])
        process.stdout.clearScreenDown()
        showCursor()
        process.exit(0)
    })
    listenKeyboard(menuKeyHandler)
}

main()