const express = require('express');
const router = express.Router();

var fetchuser = require('../middleware/fetchuser');
const Notes = require('../models/Notes');
const { body, validationResult } = require('express-validator');
// Route 1:Get all the notes using: GEt
router.get('/fetchallnotes', fetchuser, async (req, res) => {
    try {
        const notes = await Notes.find({ user: req.user.id })
    res.json(notes)
        
    } catch (error) {
        console.log(error.message);
    res.status(500).send("Internal Server Error");
    }
    const notes = await Notes.find({ user:req.user.id })
    res.json(notes)
})
//Route 2: Add a new Note using: POST "/api/auth/addnote".Login required
router.post('/addnote', fetchuser, [
    body('title', 'Enter a valid title').isLength({ min: 3 }),
    body('description', 'Description must be atleast 5 characters').isLength({ min: 5 }),
], async (req, res) => {
    try {
        
    
    const { title, description, tag } = req.body;
    //If there are any errors, return Bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const note = new Notes({
        title, description, tag, user: req.user.id
    })
   
    const savedNote= await note.save()
    res.json(savedNote)
           
} catch (error) {
    console.log(error.message);
    res.status(500).send("Internal Server Error");
}
})
// Route 3 : Update an existing Note using: POST "/api/auth/updatenote". Login required.
router.put('/updatenote/:id', fetchuser, async (req, res) => {
    const {title,description,tag} = req.body;
    //Create a newNote object
    const newNote = {};
    if(title){newNote.title=title};
    if(description){newNote.description=description};
    if(tag){newNote.tag=tag};

    // Find the note to be updated and update it.
    let note = await  Notes.findById(req.params.id);
    if(!note){return res.status(404).send("Not Found")};
    if(note.user.toString() !== req.user.id){
        return res.status(401).send("Not Allowed")
    }
    note = await Notes.findByIdAndUpdate(req.params.id, {$set:newNote},{new:true})
    res.json({note});
})
module.exports = router