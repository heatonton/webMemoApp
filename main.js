'use strict';
{
  // const addBtn = document.getElementById('add-btn');
  // const memoArea = document.getElementById('memo-area');
  // const closeBtn = document.getElementById('close-btn');
  // const body = document.querySelector('body');

  // addBtn.addEventListener('click', () => {
  //   memoArea.classList.add('active');
  //   addBtn.classList.add('hide');
  //   body.classList.add('no-scroll');
  // });

  // closeBtn.addEventListener('click', () => {
  //   memoArea.classList.remove('active');
  //   addBtn.classList.remove('hide');
  //   body.classList.remove('no-scroll');
  // });

  // memoArea.addEventListener('wheel', () => {
  //   memoArea.dispatchEvent(new Event('mousemove'));
  // });
  const escapeHtml = (str) => {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };
    return String(str).replace(/[&<>"']/g, (match) => {
      return map[match];
    });
  };

  const elements = {
    memoList: document.querySelector('ul'),
    memoTitle: document.getElementById('memo-title'),
    memoContent: document.getElementById('memo-content'),
    saveBtn: document.getElementById('save-btn'),
    addBtn: document.getElementById('add-btn'),
    deleteBtn: document.getElementById('delete-btn'),
    search: document.getElementById('search'),
  }

  const STORAGE_KEY ='webMemoApp.notes';

  const loadNotes = () => {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || []);
  };

  const saveNotes = (notes) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  };

  let notes = loadNotes();
  let activeId = null;

  const getTitle = (title, body) => {
    if (title && title.trim()) {
      return title.trim();
    }
    const firstLine = (body || '').split(/\r?\n/)[0].trim();
    return firstLine || '無題';
  };

  const formatDate = (timestamp) => new Date(timestamp).toLocaleString();

  const renderList = () => {
    const keyword = (elements.search.value || '').toLowerCase();
    const view = [...notes].sort((a, b) => {
      return b.updateAt - a.updateAt;
    }).filter((note) => getTitle(note.title, note.body).toLowerCase().includes(keyword));

    elements.memoList.innerHTML = '';
    view.forEach((note) => {
      const li = document.createElement('li');
      li.dataset.id = note.id;
      li.tabIndex = 0;
      const title = getTitle(note.title, note.body);
      const created = formatDate(note.createdAt);

      li.innerHTML = `
        <div class="noteRow">
          <div class="title">
            ${escapeHtml(title)}
          </div>
          <div class="meta">
            作成: ${escapeHtml(created)}
          </div>
        </div>
      `;

      if (note.id === activeId) {
        li.classList.add('active');
      }
      li.addEventListener('click', () => {
        openNote(note.id);
      });
      elements.memoList.appendChild(li);
    });
  };

  const openNote = (id) => {
    const note = notes.find((note) => {
      return note.id === id;
    });

    if (!note) return;
    activeId = id;

    elements.title.value = note.title || '';
    elements.body.value = note.body || '';

    renderList();
  };

  const createNote = () => {
    const now = Date.now();
    const newNote = {
      id: String(now),
      title: '',
      body: '',
      createdAt: now,
      updatedAt: now,
    };

    notes.unshift(newNote);
    saveNotes(notes);
    openNote(newNote.id);
  };

}