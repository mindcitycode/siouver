const create = name => document.createElement(name)
const $style = create('style')
document.head.append($style)
$style.textContent = `
body {
    width : 1000000px;
    height : 1000000px;
}
div {  position : fixed }
button.validate { visibility: hidden;}
button.cancel { visibility: hidden;}
input { visibility: hidden;}

body.where { cursor: crosshair;}
body.where div button.add { visibility: hidden; }

body.what div button.add { visibility: hidden; }
body.what div input {  visibility: visible ; autofocus : true }
body.what div button.validate {  visibility: visible }
body.what div button.cancel {  visibility: visible }
span.location {
    position : fixed;
    right : 1em;
}
p.box { position:absolute;}
/**/
body {
    background-color : black;
    color : white;
    font-family : verdana;
}
div { 
    position : fixed ;
    border-bottom : 2px solid #888;
    margin:0;
    padding:0.5em;
    top:0;
    left:0;
    width:100vw;
    background-color:#555;
    z-index:999       
}
`

let pointerPosition = { x: 0, y: 0 }
const onPointerMove = (e) => {
    pointerPosition.x = e.layerX
    pointerPosition.y = e.layerY
}
document.body.addEventListener('pointermove', onPointerMove);

const update = async () => {
    const data = await fetch('/blocs')
    console.log(data)
    const blocks = await data.json()
    console.log(blocks)
    blocks.forEach(({ id, x, y, msg }) => {
        console.log('a bloc', id, x, y, msg)
        addBox({ id, x, y, msg })
    })
}
const send = async (x, y, content) => {
    const rawResponse = await fetch('/bloc', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify([x, y, content])
    });
    const box = await rawResponse.json()
    return box
}
const addBox = (box = {}) => {
    console.log('may i add a box',box)
    const check = (isNaN(parseFloat(box.x)) === false) && (isNaN(parseFloat(box.y)) === false) && (box.msg?.length > 0)
    if (check) {
        const { x, y, msg } = box
        const $p = create('p')
        $p.classList.add('box')
        $p.style.left = `${x}px`
        $p.style.top = `${y}px`
        $p.textContent = msg
        document.body.append($p)
    }
}
const Fse = () => {
    let state = undefined
    let x = undefined
    let y = undefined
    const tell = msg => {
        if (state === undefined) {
            if (msg === 'add') {
                state = 'where'
                document.body.classList.add('where')
            }
        } else if (state === 'where') {
            const $input = document.getElementById("content")
            const $div = document.getElementsByTagName("div")[0]
            if (msg === 'there') {
                state = 'what'
                document.body.classList.remove('where')
                document.body.classList.add('what')
                x = pointerPosition.x
                y = pointerPosition.y
                $input.focus()
                $input.click()
            }
        } else if (state === 'what') {
            const $input = document.getElementById("content")
            const $div = document.getElementsByTagName("div")[0]
            const $addButton = document.getElementsByClassName("add")[0]
            if (msg == 'cancel') {
                state = undefined
                document.body.classList.remove('what')
                $input.value = ''
                $addButton.focus()
            } else if (msg === 'validate') {
                state = undefined
                document.body.classList.remove('what')
                const content = $input.value
                $input.value = ''
                send(x, y, content).then(addBox)
                $addButton.focus()
            }
        }
    }
    return {
        message: name => (e) => {
            tell(name)
            e?.stopPropagation()
        }
    }
}

const fse = Fse()

{
    const bar = create('div')
    document.body.append(bar)
    {
        const $buttonAdd = create('button')
        $buttonAdd.textContent = 'add'
        $buttonAdd.onclick = fse.message('add')
        $buttonAdd.classList.add('add')
        bar.append($buttonAdd)
    }

    document.body.onclick = fse.message('there')
    {
        const $textInput = create('input')
        $textInput.placeholder = 'type your text'
        $textInput.id = 'content'
        bar.append($textInput)
    }

    {
        const $buttonValidate = create('button')
        $buttonValidate.textContent = 'ok'
        $buttonValidate.onclick = fse.message('validate')
        $buttonValidate.classList.add('validate')
        bar.append($buttonValidate)
    }
    {
        const $buttonValidate = create('button')
        $buttonValidate.textContent = 'cancel'
        $buttonValidate.onclick = fse.message('cancel')
        $buttonValidate.classList.add('cancel')
        bar.append($buttonValidate)
    }
    {
        const $location = create('span')
        $location.classList = 'location'
        //$location.onclick = fse.message('validate')
        $location.textContent = '22'
        bar.append($location)
    }
}

var cumulativeOffset = function (element) {
    var top = 0, left = 0;
    do {
        top += element.offsetTop || 0;
        left += element.offsetLeft || 0;
        element = element.offsetParent;
    } while (element);

    return {
        top: top,
        left: left
    };
};

setInterval(() => {
    let url = new URL(document.location)
    let params = new URLSearchParams()//url.search);

    params.set('x', pointerPosition.x);
    params.set('y', pointerPosition.y);
    history.replaceState("no", "no", "?" + params.toString())

    const $location = document.getElementsByClassName('location')[0]
    $location.textContent = `${pointerPosition.x} ${pointerPosition.y}`

}, 100)

update()
