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
    memoListContainer: document.getElementById('memo-list-container'),
    memoArea: document.getElementById('memo-area'),
    memoList: document.getElementById('memo-list'),
    memoTitle: document.getElementById('memo-title'),
    memoContent: document.getElementById('memo-content'),
    closeBtn: document.getElementById('close-btn'),
    saveBtn: document.getElementById('save-btn'),
    spAddBtn: document.getElementById('sp-add-btn'),
    pcAddBtn: document.getElementById('pc-add-btn'),
    deleteBtn: document.getElementById('delete-btn'),
    search: document.getElementById('search'),
    saveNotice: document.getElementById('save-notice'),
    charCount: document.getElementById('char-count'),
    usageDesc: document.getElementById('usage-description'),
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

    if (view.length === 0) {
      elements.memoList.textContent = '保存中のメモはありません';
      elements.memoList.classList.add('empty-message');
    } else {
      elements.memoList.classList.remove('empty-message');
    }
    
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

      li.addEventListener('click', () => {
        openNote(note.id);
      });

      const listDeleteBtn = li.querySelector('.list-delete-btn');
      listDeleteBtn.addEventListener('click', (event) => {
        event.stopPropagation();
        if (!confirm('メモを削除しますか？')) return;
        notes = notes.filter((n) => {
          return n.id !== note.id;
        });
        if (!notes) {
          elements.memoList.textContent = '保存中のメモがありません';
        }
        saveNotes(notes);
        renderList();
        clear();
      });
      elements.memoList.appendChild(li);
    }); 
  };

  const updateCharCount = () => {
    elements.charCount.textContent = elements.memoContent.value.length;
  };
  
  const openNote = (id) => {
    const note = notes.find((note) => {
      return note.id === id;
    });
    
    if (!note) return;

    elements.memoTitle.value = note.title || '';
    elements.memoContent.value = note.content || '';
    elements.memoTitle.focus();

    elements.memoArea.classList.add('active');
    elements.spAddBtn.classList.add('hide');
    elements.usageDesc.classList.add('hide');
    if (window.innerWidth < 800) {
      elements.memoListContainer.classList.add('no-scroll');
    }

    activeId = id;
    updateCharCount();
    renderList();
  };

  const createNote = () => {
    const title = elements.memoTitle.value;
    const content = elements.memoContent.value;
    const now = Date.now();
    const newNote = {
      id: now,
      title: title,
      content: content,
      createdAt: now,
      updatedAt: now,
    };

    notes.unshift(newNote);
    saveNotes(notes);
    openNote(newNote.id);
  };

  const saveMemo = () => {
    if (activeId === null) {
      createNote();
      return;
    }
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
    activeId = null;
    elements.memoTitle.value = '';
    elements.memoContent.value = '';
    elements.memoArea.classList.remove('active');
    elements.memoListContainer.classList.remove('no-scroll');
    elements.spAddBtn.classList.remove('hide');
    elements.usageDesc.classList.remove('hide');
    elements.charCount.textContent = '0';
  };

  elements.spAddBtn.addEventListener('click', () => {
    elements.memoArea.classList.add('active');
    elements.spAddBtn.classList.add('hide');
    elements.memoListContainer.classList.add('no-scroll');
  });

  elements.pcAddBtn.addEventListener('click', () => {
    elements.memoArea.classList.add('active');
    elements.memoTitle.focus();
    elements.usageDesc.classList.add('hide');
  });

  elements.saveBtn.addEventListener('click', saveMemo);
  elements.saveBtn.addEventListener('click', () => {
    elements.saveNotice.classList.add('display');
    setTimeout(() => {
      elements.saveNotice.classList.remove('display');
    }, 1000);
  });
  
  elements.closeBtn.addEventListener('click', clear);
  elements.search.addEventListener('input', renderList);
  elements.deleteBtn.addEventListener('click', deleteNote);
  elements.memoArea.addEventListener('input', updateCharCount);
  
  // 初期描画
  renderList();
}