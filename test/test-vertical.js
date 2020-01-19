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

function menuDone(selection) {
    console.log('Selection: ' + selection + ' - ' + options[selection])
    process.stdout.clearScreenDown()
    showCursor()
    process.exit(0)
}

let options = []

function main() {
    options = 'one two three four five six seven'.split(' ')
    hideCursor()
    let menuKeyHandler = verticalMenu({
        menuOptions: options,
        done: menuDone
    })
    listenKeyboard(menuKeyHandler)
}

main()