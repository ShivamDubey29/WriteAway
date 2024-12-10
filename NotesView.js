export default class NotesView {
    constructor(root, { onNoteSelect, onNoteAdd, onNoteEdit, onNoteDelete } = {}) {
        this.root = root;
        this.onNoteSelect = onNoteSelect;
        this.onNoteAdd = onNoteAdd;
        this.onNoteEdit = onNoteEdit;
        this.onNoteDelete = onNoteDelete;

        this.root.innerHTML = `
            <div class="notes__sidebar">
                <button class="notes__add" type="button">Add Note</button>
                <div class="notes__list"></div>
            </div>
            <div class="notes__preview hidden">
                <input class="notes__title" type="text" placeholder="New Note...">
                <textarea class="notes__body" placeholder="Take Note..."></textarea>
            </div>
        `;

        const btnAddNote = this.root.querySelector(".notes__add");
        const inpTitle = this.root.querySelector(".notes__title");
        const inpBody = this.root.querySelector(".notes__body");

        // Add Note button
        btnAddNote.addEventListener("click", () => {
            if (this.onNoteAdd) this.onNoteAdd();
        });

        // Title and Body blur events
        [inpTitle, inpBody].forEach((inputField) => {
            inputField.addEventListener("blur", () => {
                const updatedTitle = inpTitle.value.trim();
                const updatedBody = inpBody.value.trim();

                if (this.onNoteEdit) this.onNoteEdit(updatedTitle, updatedBody);
            });
        });

        // Hide the note preview initially
        this.updateNotePreviewVisibility(false);
    }

    /**
     * Create HTML for a single list item.
     */
    _createListItemHTML(id, title, body, updated) {
        const MAX_BODY_LENGTH = 60;
    
        // Ensure body is a string and provide a fallback
        const bodyText = body ? body.toString() : "";
    
        return `
            <div class="notes__list-item" data-note-id="${id}">
                <div class="notes__small-title">${title}</div>
                <div class="notes__small-body">
                    ${bodyText.substring(0, MAX_BODY_LENGTH)}
                    ${bodyText.length > MAX_BODY_LENGTH ? "..." : ""}
                </div>
                <div class="notes__small-updated">
                    ${updated.toLocaleString(undefined, { dateStyle: "full", timeStyle: "short" })}
                </div>
            </div>
        `;
    }
    

    /**
     * Update the notes list in the sidebar.
     */
    updateNoteList(notes) {
        const notesListContainer = this.root.querySelector(".notes__list");

        // Clear existing notes
        notesListContainer.innerHTML = "";

        for (const note of notes) {
            const html = this._createListItemHTML(note.id, note.title, note.body, new Date(note.updated));
            notesListContainer.insertAdjacentHTML("beforeend", html);
        }

        // Add event listeners to list items
        notesListContainer.querySelectorAll(".notes__list-item").forEach((noteListItem) => {
            const noteId = parseInt(noteListItem.dataset.noteId, 10);

            noteListItem.addEventListener("click", () => {
                if (this.onNoteSelect) this.onNoteSelect(noteId);
            });

            noteListItem.addEventListener("dblclick", () => {
                const doDelete = confirm("Are you sure you want to delete this note?");
                if (doDelete && this.onNoteDelete) this.onNoteDelete(noteId);
            });
        });
    }

    /**
     * Update the active note in the preview and highlight it in the list.
     */
    updateActiveNote(note) {
        if (!note) {
            this.updateNotePreviewVisibility(false);
            return;
        }

        this.root.querySelector(".notes__title").value = note.title || "";
        this.root.querySelector(".notes__body").value = note.body || "";

        // Highlight selected note
        this.root.querySelectorAll(".notes__list-item").forEach((noteListItem) => {
            noteListItem.classList.remove("notes__list-item--selected");
        });

        const activeItem = this.root.querySelector(`.notes__list-item[data-note-id="${note.id}"]`);
        if (activeItem) activeItem.classList.add("notes__list-item--selected");

        this.updateNotePreviewVisibility(true);
    }

    /**
     * Toggle the visibility of the note preview.
     */
    updateNotePreviewVisibility(visible) {
        const preview = this.root.querySelector(".notes__preview");
        preview.classList.toggle("hidden", !visible);
    }
}
