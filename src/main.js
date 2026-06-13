import './style.css'

import { db } from './firebase'

import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy
} from 'firebase/firestore'

const PASSWORD = 'kotimatu1212'

let currentThreadId = null

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

    if (input !== PASSWORD) {

      alert('パスワードが違います')

      return
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

<h1>2chzezehighschool</h1>

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

<h2>選択中スレッド</h2>

<div id="selectedThread">
スレッドを選択してください
</div>

<br>

<input
  id="responseText"
  placeholder="レスを書く"
>

<button id="sendResponse">
レス投稿
</button>

<hr>

<div id="responses"></div>
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

      div.textContent =
        data.title

      div.onclick = () => {

        currentThreadId =
          threadDoc.id

        document.getElementById(
          'selectedThread'
        ).textContent =
          data.title

        loadResponses()
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

          <br>

          <small>
            ${date.toLocaleString()}
          </small>

          <br><br>

          ${data.text}

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

  document
    .getElementById(
      'sendResponse'
    )
    .addEventListener(
      'click',
      async () => {

        if (!currentThreadId) {

          alert(
            'スレッドを選択してください'
          )

          return
        }

        const text =
          document.getElementById(
            'responseText'
          ).value

        if (!text) {

          alert(
            'レスを入力してください'
          )

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

        await loadResponses()
      })

  loadThreads()
}