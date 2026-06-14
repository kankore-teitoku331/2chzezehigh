import './style.css'

import { db } from './firebase'

import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  deleteDoc,
  doc
} from 'firebase/firestore'
const USER_PASSWORD = 'kotimatu1212'
const ADMIN_PASSWORD = 'kotimatu1212admin'

let isAdmin = false

let currentThreadId = null

let currentThreadTitle = ''

document.querySelector('#app').innerHTML = `
<div id="loginArea">

  <h1>某Z高校裏サイト</h1>

  <input
    id="passwordInput"
    type="password"
    placeholder="パスワード"
  >

  <button id="loginButton">
    入室
  </button>

</div>

<div
  id="bbsArea"
  style="display:none;"
></div>
`

document
  .getElementById('loginButton')
  .addEventListener('click', () => {

    const input =
      document.getElementById(
        'passwordInput'
      ).value

    if (
  input !== USER_PASSWORD &&
  input !== ADMIN_PASSWORD
) {

  alert('パスワードが違います')

  return
}

if (
  input === ADMIN_PASSWORD
) {
  isAdmin = true
}

    document.getElementById(
      'loginArea'
    ).style.display = 'none'

    document.getElementById(
      'bbsArea'
    ).style.display = 'block'

    renderBBS()
    setupBBS()
  })

function renderBBS() {

  document.getElementById(
    'bbsArea'
  ).innerHTML = `

<h1>Zch</h1>

${isAdmin
? `
<div style="
color:red;
font-weight:bold;
margin-bottom:10px;
">
管理者モード
</div>
`
: ''}

<input
  id="threadTitle"
  placeholder="スレッドタイトル"
>

<button id="createThread">
  スレッド作成
</button>

<hr>

<h2>スレ一覧</h2>

<div id="threadList"></div>

<hr>

`
}

function setupBBS() {

  async function loadThreads() {

    const q = query(
      collection(db, 'threads'),
      orderBy(
        'createdAt',
        'desc'
      )
    )

    const snapshot =
      await getDocs(q)

    const threadList =
      document.getElementById(
        'threadList'
      )

    threadList.innerHTML = ''

    snapshot.forEach((threadDoc) => {

      const data =
        threadDoc.data()

      const div =
        document.createElement('div')

      div.style.padding = '10px'
      div.style.margin = '5px'
      div.style.border =
        '1px solid gray'
      div.style.cursor =
        'pointer'

 div.innerHTML = `
  ${data.title}

  ${
    isAdmin
      ? `<button
          style="float:right"
          onclick="
            event.stopPropagation();
            deleteThread('${threadDoc.id}')
          "
        >
          削除
        </button>`
      : ''
  }
`

div.onclick = () => {

  currentThreadId =
    threadDoc.id

  currentThreadTitle =
    data.title

  renderThreadPage()

  loadResponses()

  function renderThreadPage() {

  document.getElementById(
  'bbsArea'
).innerHTML = `

<div style="
margin-top:40px;
">

<button id="backButton">
← 戻る
</button>

<h2 style="
margin-top:20px;
">
${currentThreadTitle}
</h2>

<textarea
  id="responseText"
  placeholder="レスを書く"
  rows="5"
  style="
    width:100%;
    box-sizing:border-box;
  "
></textarea>

<button id="sendResponse">
レス投稿
</button>
<hr>

<div id="responses"></div>

</div>
`



  document
  .getElementById(
    'backButton'
  )
  .onclick = () => {

    currentThreadId = null
    currentThreadTitle = ''

    renderBBS()
    setupBBS()
  }

  document
    .getElementById(
      'sendResponse'
    )
    .addEventListener(
      'click',
      async () => {

        const text =
          document.getElementById(
            'responseText'
          ).value

        if (!text) {
          return
        }

        await addDoc(
          collection(
            db,
            'responses'
          ),
          {
            threadId:
              currentThreadId,
            name: '名無し',
            text,
            createdAt:
              Date.now()
          }
        )

        document.getElementById(
          'responseText'
        ).value = ''

        loadResponses()
      })
}
}

      threadList.appendChild(div)
    })
  }

  async function loadResponses() {

    if (!currentThreadId) return

    const q = query(
      collection(db, 'responses'),
      where(
        'threadId',
        '==',
        currentThreadId
      ),
      orderBy(
        'createdAt',
        'desc'
      )
    )

    const snapshot =
      await getDocs(q)

    const responses =
      document.getElementById(
        'responses'
      )

    responses.innerHTML = ''

    let number = 1

    snapshot.forEach((responseDoc) => {

      const data =
        responseDoc.data()

      const date =
        new Date(
          data.createdAt
        )

responses.innerHTML += `
<div style="
  border-bottom:1px solid #ccc;
  padding:8px;
">

  <b>
    ${number}
    名前：
    ${data.name || '名無し'}
  </b>

  ${
    isAdmin
      ? `
      <button
        style="float:right"
        onclick="
          deleteResponse('${responseDoc.id}')
        "
      >
        削除
      </button>
      `
      : ''
  }

  <br>

  <small>
    ${date.toLocaleString()}
  </small>

  <br><br>

  ${data.text.replace(/\n/g, '<br>')}

</div>
`      

      number++
    })
  }

  document
    .getElementById(
      'createThread'
    )
    .addEventListener(
      'click',
      async () => {

        const title =
          document.getElementById(
            'threadTitle'
          ).value

        if (!title) {
          alert(
            'タイトルを入力してください'
          )
          return
        }

        await addDoc(
          collection(
            db,
            'threads'
          ),
          {
            title,
            createdAt:
              Date.now()
          }
        )

        document.getElementById(
          'threadTitle'
        ).value = ''

        await loadThreads()

        alert('保存しました')
      })

      

      window.deleteResponse =
async function(id){

  const ok = confirm(
    'このレスを削除しますか？'
  )

  if(!ok){
    return
  }

  try{

    await deleteDoc(
      doc(
        db,
        'responses',
        id
      )
    )

    loadResponses()

  }catch(error){

    console.error(error)

    alert(error.message)
  }
}

 window.deleteThread =
async function(id){

  const ok = confirm(
  'このスレッドを削除しますか？'
)

if (!ok) {
  return
}
  console.log("削除開始", id)

  try {

    const responseQuery = query(
  collection(db,'responses'),
  where(
    'threadId',
    '==',
    id
  )
)

const responseSnapshot =
  await getDocs(responseQuery)

for(const responseDoc of responseSnapshot.docs){

  await deleteDoc(
    doc(
      db,
      'responses',
      responseDoc.id
    )
  )
}

    await deleteDoc(
      doc(
        db,
        'threads',
        id
      )
    )

    console.log("削除完了")

    loadThreads()

  } catch(error) {

    console.error(error)

    alert(
      error.message
    )
  }
}

  loadThreads()
}

