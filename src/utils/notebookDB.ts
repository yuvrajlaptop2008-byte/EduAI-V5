export interface Note {
  id: number;
  email: string;
  subject: string;
  chapter: string;
  title: string;
  content: string;
  date: string;
  tags?: string[];
}

export const notebookDB = {
  getNotes(): Note[] {
    return JSON.parse(localStorage.getItem("mark_notes") ||"[]");
  },
  saveNotes(notes: Note[]) {
    localStorage.setItem("mark_notes", JSON.stringify(notes));
  },
  addNote(note: Omit<Note,"id" |"date">) {
    const notes = this.getNotes();
    const newNote: Note = {
      ...note,
      tags: note.tags || [],
      id: Date.now(),
      date: new Date().toDateString(),
    };
    notes.push(newNote);
    this.saveNotes(notes);
    return newNote;
  },
  updateNote(id: number, updatedFields: Partial<Note>) {
    const notes = this.getNotes();
    const index = notes.findIndex((n) => n.id === id);
    if (index !== -1) {
      notes[index] = { ...notes[index], ...updatedFields };
      this.saveNotes(notes);
    }
  },
  deleteNote(id: number) {
    let notes = this.getNotes();
    notes = notes.filter((n) => n.id !== id);
    this.saveNotes(notes);
  },
};
