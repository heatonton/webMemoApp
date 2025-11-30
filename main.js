'use strict';
{
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
    memoArea: document.getElementById('memo-area'),
    memoList: document.querySelector('ul'),
    memoTitle: document.getElementById('memo-title'),
    memoContent: document.getElementById('memo-content'),
    closeBtn: document.getElementById('close-btn'),
    saveBtn: document.getElementById('save-btn'),
    addBtn: document.getElementById('add-btn'),
    deleteBtn: document.getElementById('delete-btn'),
    search: document.getElementById('search'),
    saveNotice: document.getElementById('save-notice'),
    charCount: document.getElementById('char-count'),
  }

  const STORAGE_KEY ='webMemoApp.notes';

  const loadNotes = () => {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  };

  const saveNotes = (notes) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  };

  let notes = loadNotes();
  let activeId = null;

  const getTitle = (title, content) => {
    if (title && title.trim()) {
      return title.trim();
    }
    const firstLine = (content || '').split(/\r?\n/)[0].trim();
    return firstLine || '無題';
  };

  const formatDate = (timestamp) => new Date(timestamp).toLocaleString();

  const renderList = () => {
    const keyword = (elements.search.value || '').toLowerCase();
    const view = [...notes].sort((a, b) => {
      return b.updatedAt - a.updatedAt;
    }).filter((note) => getTitle(note.title, note.content).toLowerCase().includes(keyword));

    elements.memoList.innerHTML = '';
    view.forEach((note) => {
      const li = document.createElement('li');
      const title = getTitle(note.title, note.content);
      const created = formatDate(note.createdAt);
      const updated = formatDate(note.updatedAt);

      li.innerHTML = `
        <div class="memo-list-row">
          <div>
            <div class="title">
              ${escapeHtml(title)}
            </div>
            <div class="meta">
              作成: ${escapeHtml(created)}<br>
              更新: ${escapeHtml(updated)}
            </div>
          </div>
          <div>
            <button class="icon-btn list-delete-btn">
              <img src="images/delete_24dp_000000_FILL0_wght400_GRAD0_opsz24.svg">
            </button>
          </div>
        </div>
      `;
      

      if (note.id === activeId) {
        li.classList.add('active');
      }

      li.addEventListener('click', () => {
        openNote(note.id);
      });

      const listDeleteBtn = li.querySelector('.list-delete-btn');
      listDeleteBtn.addEventListener('click', (event) => {
        event.stopPropagation();
        if (!confirm('メモを削除しますか？')) return;
        notes = notes.filter((n) => {
          n.id !== note.id;
        });
        saveNotes(notes);
        li.remove();
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

    elements.memoTitle.value = note.title || '';
    elements.memoContent.value = note.content || '';
    elements.memoArea.classList.add('active');

    renderList();
  };

  const createNote = () => {
    const now = Date.now();
    const newNote = {
      id: String(now),
      title: '',
      content: '',
      createdAt: now,
      updatedAt: now,
    };

    notes.unshift(newNote);
    saveNotes(notes);
    openNote(newNote.id);
  };

  const saveMemo = () => {
    if (!activeId) return createNote();
    const idx = notes.findIndex((note) => {
      return note.id === activeId;
    });
    if (idx === -1) return;

    const title = elements.memoTitle.value;
    const content = elements.memoContent.value;
    notes[idx] = {
      ...notes[idx],
      title: title,
      content: content,
      updatedAt: Date.now(),
    };

    saveNotes(notes);
    renderList();
  };

  const deleteNote = () => {
    if (confirm('メモを削除しますか？')) {
      notes = notes.filter((note) => {
        return note.id !== activeId;
      });
  
      saveNotes(notes);
      renderList();
      clear();
    }
  };

  const clear = () => {
    elements.memoTitle.value = '';
    elements.memoContent.value = '';
    elements.memoArea.classList.remove('active');
  };

  const updateCharCount = () => {
    elements.charCount.textContent = elements.memoContent.value.length;
  };

  elements.addBtn.addEventListener('click', () => {
    elements.memoArea.classList.add('active');
    elements.addBtn.classList.add('hide');
  });
  elements.addBtn.addEventListener('click', createNote);
  elements.closeBtn.addEventListener('click', clear);
  elements.closeBtn.addEventListener('click', () => {
    elements.addBtn.classList.remove('hide');
  });
  elements.saveBtn.addEventListener('click', saveMemo);
  elements.saveBtn.addEventListener('click', () => {
    elements.saveNotice.classList.add('display');
    setTimeout(() => {
      elements.saveNotice.classList.remove('display');
    }, 1000);
  });
  elements.search.addEventListener('input', renderList);
  elements.deleteBtn.addEventListener('click', deleteNote);
  elements.memoArea.addEventListener('input', updateCharCount);
  
  
  renderList();
}