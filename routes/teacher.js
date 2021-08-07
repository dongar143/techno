const express = require('express');
const router = express.Router();

const { Student, validate } = require('../models/teacher');

const validateObjectId = require('../middleware/validateObjectId');
const validateStudent = require('../middleware/validate');
const HelperUtils = require('./../utils/helpers')
const bcrypt = require('bcrypt');


router.post('/registration/create', async (req, res) => {
    const student = new Student({
        name: req.body.name,
        contact: req.body.contact,
        email: req.body.email,
        address: req.body.address,
        interest: req.body.interest,
        upvotes: req.body.upvotes,
        courseHistory: req.body.courseHistory,
    });

    await student.save();
    res.send(HelperUtils.successObj("Student Added Successfully", student));
});

router.get('/list', async (req, res) => {
    const student = await Student.find();
    res.send(HelperUtils.successObj("Student Data retrieved successfully", student));
});

router.post('/update/:id', async (req, res) => {
    try {
        await Student.findOneAndUpdate({ _id: req.params.id }, {
            "$set": {
                courseHistory: {
                    'name': req.body.name,
                    'grade': req.body.grade,
                }
            }
        })
        res.send(HelperUtils.successObj("Student updated Successfully"));
    } catch (err) {
        res.send(HelperUtils.errorObj("NO Student Found!", err.message));
    }
})

// router.post('/update/:id', async (req, res) => {
//     try {
//         const student = await Student.findOneAndUpdate({ _id: req.params.id, courseHistory: { $elemMatch: { _id: req.body.id } } }, {
//             $set: {
//                 'courseHistory.$.name': req.body.name,
//                 'courseHistory.$.grade': req.body.grade,
//             }
//         }, { 'new': true, 'safe': true, 'upsert': true })
//         res.send(HelperUtils.successObj("Student updated Successfully", student));
//     } catch (err) {
//         res.send(HelperUtils.errorObj("NO Student Found!", err.message));
//     }
// })


router.delete('/delete', async (req, res) => {

    const student = await Student.findByIdAndRemove({ _id: req.body.id });

    if (!student) return res.send(HelperUtils.errorObj("NO Student Found!"));

    res.send(HelperUtils.successObj("Student Deleted successfully", student));
});



module.exports = router;
