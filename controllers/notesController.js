const Note = require('../models/Note')
const User = require('../models/User')
const asyncHandler = require('express-async-handler')

// Get all notes
const getAllNotes = asyncHandler(async (req, res) => {
    const notes = await Note.find().lean()
    if (!notes?.length) {
        return res.status(404).json({ message: 'No notes found' })
    }

    // Add username to each note before sending the response 
    // See Promise.all with map() here: https://youtu.be/4lqJBBEpjRE 
    // You could also do this with a for...of loop
    const notesWithUser = await Promise.all(notes.map(async (note) => {
        const user = await User.findById(note.user).lean().exec()
        return { ...note, username: user.username }
    }))
    res.json(notesWithUser)
    
})

// Create new note
const createNewNote = asyncHandler(async (req, res) => {
    const { user, title, text } = req.body

    // Confirm data
    if (!user || !title || !text) {
        return res.status(400).json({ message: 'All fields are required' })
    }

    // Create and store new note
    const note = await Note.create({ user, title, text })

    if (note) {
        res.status(201).json({ message: 'New note created' })
    } else {
        res.status(400).json({ message: 'Failed to create note' })
    }
})

// Update a note
const updateNote = asyncHandler(async (req, res) => {
    const { id, user, title, text, completed } = req.body

    // Confirm data
    if (!id || !user || !title || !text || typeof completed !== 'boolean') {
        return res.status(400).json({ message: 'All fields are required' })
    }

    const note = await Note.findById(id).exec()

    if (!note) {
        return res.status(404).json({ message: 'Note not found' })
    }

    note.user = user
    note.title = title
    note.text = text
    note.completed = completed

    const updatedNote = await note.save()
    res.status(200).json(`'${updatedNote.title}' updated`)
})

// Delete a note
const deleteNote = asyncHandler(async (req, res) => {
    const { id } = req.body

    if (!id) {
        return res.status(400).json({ message: 'Note ID is required' })
    }

    const note = await Note.findById(id).exec()

    if (!note) {
        return res.status(404).json({ message: 'Note not found' })
    }

    const result = await note.deleteOne()

    const reply = `Note with ID ${result._id} deleted`

    res.json(reply)
})

module.exports = {
    getAllNotes,
    createNewNote,
    updateNote,
    deleteNote
}
