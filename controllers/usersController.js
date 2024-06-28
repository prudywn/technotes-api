const User = require('../models/User')
const Note = require('../models/Note')
const asyncHandler = require('express-async-handler')
const bcrypt = require('bcrypt')

//Get all users
const getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find().select('-password').lean()
    if (!users?.length){
        return res.status(404).json({message: 'No user found'})
    }
    res.json(users)
})

//Creat New User
const createNewUser = asyncHandler(async (req, res) => {
    const { username, password, roles } = req.body

    //confirming data
    if (!username || !password){
        return res.status(400).json({message: 'All fields are required'})
        }
    
        //check for duplicate
        const duplicate = await User.findOne({ username }).collation({locale: 'en', strength: 2}).lean().exec()
        if (duplicate){
            return res.status(409).json({message: 'Username already exists'})
            }
        
        //hash password
        const hashedPassword = await bcrypt.hash(password, 10)

        const userObject =(!Array.isArray(roles) || !roles.length) ?
        { username, password: hashedPassword} : {username, password: hashedPassword, roles }

        //create and store new user
        const user = await User.create(userObject)
        if (user){
            res.status(201).json({message: `New user ${username} created`
                })
        }else {
            res.status(400).json({message: 'Failed to create user'})
        }
})

//Update User
const updateUser = asyncHandler(async (req, res) => {
    const { id, username, roles, active, password } = req.body
    console.log('Update request body:',req.body)

    //Confirm data
    if (!id || !username || !Array.isArray(roles) || !roles?.length || typeof active !== 'boolean'){
        return res.status(400).json({message: 'All fields are required'})
        }
    
    const user = await User.findById(id).exec()

    if(!user) {
        return res.status(404).json({message: 'User not found'})
    }

    //Check for duplicate
    const duplicate = await User.findOne({username}).collation({locale:'en', strength: 2}).lean().exec()
    //Allow updates to the original user
    if(duplicate && duplicate?._id.toString() !== id){
        return res.status(409).json({message: 'Username already exists'})
        }
    
    user.username = username
    user.roles = roles
    user.active = active
    if(password){
        const hashedPassword = await bcrypt.hash(password, 10)
        user.password = hashedPassword
        }
        else{
    const updatedUser = await user.save()
    res.status(200).json({message: `User ${updatedUser.username} updated`
        })
        }
})

//Delete User
const deleteUser = asyncHandler(async (req, res) => {
    const { id } = req.body
    console.log('Delete request body:',req.body)
    if(!id){
        return res.status(400).json({message: 'User ID is required'})
    }

    const note = await Note.findOne({ user: id}).lean().exec()
    if(note){
        return res.status(400).json({mssg: 'User has assigned notes'})
    }

    const user = await User.findById(id).exec()

    if (!user){
        return res.status(404).json({message: 'User not found'})
    }

    const result = await user.deleteOne()

    const reply = `Username ${result.username} with ID ${result._id}`
    
    res.json(reply)
    
    // res.status(200).json({message: `User with ID ${id} deleted`
    //     })
})


module.exports = {
    getAllUsers,
    createNewUser,
    updateUser,
    deleteUser
}