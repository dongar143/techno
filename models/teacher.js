const Joi = require('joi');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const config = require('config');
const HelperUtils = require("./../utils/helpers");

const studentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 255
    },
    contact: {
        type: String,
        required: true,
        minlength: 10,
        maxlength: 15,
        unique: true
    },
    email: {
        type: String,
        minlength: 5,
        maxlength: 255,
        required: true,
        unique: true
    },
    address: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 255
    },
    interest: [{
        type: String,
        required: true,
        minlength: 5,
        maxlength: 255
    }],
    upvotes: {
        type: Number,
        required: true,
        minlength: 5,
        maxlength: 255
    },

    courseHistory: [{
        name: {
            type: String,
            required: true,
            minlength: 5,
            maxlength: 255
        },
        grade: {
            type: String,
            required: true,
            minlength: 1,
            maxlength: 255
        },
    }],

});


const Student = mongoose.model('Student', studentSchema);

// Validate
function validateStudent(student) {
    const schema = Joi.object({
        name: Joi.string()
            .min(5)
            .max(255)
            .required(),
        contact: Joi.string()
            .min(8)
            .max(15)
            .required(),
        email: Joi.string()
            .min(5)
            .max(255)
            .required()
            .email(),
        address: Joi.string()
            .min(5)
            .max(255)
            .required(),
        upvotes: Joi.string()
            .min(5)
            .max(255)
            .required(),


    });
    return schema.validate(student);
}


exports.Student = Student;
exports.validate = validateStudent;